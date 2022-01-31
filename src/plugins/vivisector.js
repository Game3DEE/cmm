import { DataType, Plugin } from './plugin.js'
import CMF from '../kaitai/vivisector_cmf.js'

import { KaitaiStream } from 'kaitai-struct'

import {
    Bone,
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    Matrix3,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    MeshNormalMaterial,
    SkeletonHelper,
    SphereBufferGeometry,
    Vector3,
} from 'three'

export class VivisectorPlugin extends Plugin {
    async loadFile(url, ext, baseName) {
        const model = this.loadModel(await this.loadFromURL(url), baseName)
        return [
            { type: DataType.Model, model: model },
        ]
    }

    loadModel(buffer, baseName) {
        const parsed = new CMF(new KaitaiStream(buffer))
        console.log(parsed)

        let vertices, faces, uvs, indices
        let boneNames, bonePos, boneParents, boneTransforms
        parsed.blocks.forEach(b => {
            let blockName = CMF.BlockId[b.id]
            if (!blockName) {
                blockName = '0x' + b.id.toString(16) + `(size:${b.size})`
            }
            console.log(blockName)
            switch(b.id) {
                // dumps for further research
                case CMF.BlockId.HEADER:
                    break
                case CMF.BlockId.FACE_COUNT:
                    break
                case CMF.BlockId.VERT_COUNT:
                    break
                case CMF.BlockId.TEXTURE_COUNT:
                    break
                case CMF.BlockId.TEXTURES:
                    break
                case CMF.BlockId.UV1:
                    if (!uvs)
                        uvs = b.data.uvs
                    break
                case CMF.BlockId.BONE_NAMES:
                    boneNames = b.data.boneNames
                    break
                case CMF.BlockId.BONE_POSITIONS:
                    bonePos = b.data.bonePositions
                    break
                case CMF.BlockId.BONE_PARENTS:
                    boneParents = b.data.boneParents
                    break
                case CMF.BlockId.BONE_TRANSFORMS:
                    boneTransforms = b.data.boneTransforms
                    break
                case CMF.BlockId.FACES:
                    if (!faces)
                        faces = b.data.faces
                    break
                case CMF.BlockId.VERTICES:
                    if (!vertices)
                        vertices = b.data.vertices
                    break
                case CMF.BlockId.FACE_MATERIALS:
                    if (!indices)
                        indices = b.data.indices
                    break
            }
        })

        const position = []
        const uv = []
        const groups = []

        let matId = -1
        faces?.forEach((f,i) => {
            if (f.c !== f.d) {
                console.error(`CMF FACES block has face width ${f.c} !== ${f.d} at ${i}`)
                return
            }

            if (matId !== indices[i]) {
                console.log(`${matId} !== ${indices[i]}`)
                if (matId !== -1) {
                    const grp = groups[groups.length -1]
                    grp.count = (i * 3 - grp.start)
                }
                groups.push({
                    start: i * 3,
                    count: -1,
                    materialIndex: indices[i],
                })
                matId = indices[i]
            }

            position.push(
                vertices[f.c].x, vertices[f.c].y, vertices[f.c].z, 
                vertices[f.b].x, vertices[f.b].y, vertices[f.b].z, 
                vertices[f.a].x, vertices[f.a].y, vertices[f.a].z, 
            )
            uv.push(
                uvs[i].cU, uvs[i].cV,
                uvs[i].bU, uvs[i].bV,
                uvs[i].aU, uvs[i].aV,
            )
        })
        const grp = groups[groups.length -1]
        grp.count = (faces.length * 3 - grp.start)

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
        geo.computeVertexNormals()
        groups.forEach(({ start, count, materialIndex }) => geo.addGroup(start, count, materialIndex))

        const mat = []
        const matIndices = []
        groups.forEach(g => {
            if (!matIndices.includes(g.materialIndex)) {
                const m = new MeshNormalMaterial()
                m.name = `Material-${g.materialIndex}`
                mat.push(m)
                matIndices.push(g.materialIndex)
            }
        })

        console.log(geo)

        const mesh = new Mesh(geo, mat)
        mesh.name = baseName

        // Create bones, if we have them
        if (boneNames && boneParents && bonePos && boneTransforms) {
            const m4 = new Matrix4()
            const m3 = new Matrix3()
            let bGeo = new SphereBufferGeometry(0.1)
            let bMat = new MeshBasicMaterial({ color: 0x0000ff })
            for (let i = 0; i < boneNames.length; i++) {
                const b = new Mesh(bGeo, bMat)
                b.name = boneNames[i]
                m3.fromArray(boneTransforms[i].elements)
                m4.identity()
                m4.setFromMatrix3(m3)
                m4.setPosition(bonePos[i].x, bonePos[i].y, bonePos[i].z)
                m4.decompose(b.position, b.quaternion, b.scale)
                mesh.add(b)
            }
        }

        return mesh
    }

    supportedExtensions() {
        return [ 'cmf' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Vivisector (Model)"
    }
}

/*
testing with Child_on_board:

0x2017 => u4 x face_count = { 0,0,0,0,0,....1,1,1,1,... } <= only changes eyes?
0x201a => u4 x face_count = { 0x1d,..., 0x6d,... } <= flags?
0x201c => u4 x face_count = { 0/1 } <= material index? 
0x201d => u4 x face_count = { 0 }

0xf021 => u4 x face_count = { 0,0,0,0, .... 0xffffffff,...} <= color or flags?
0xf022 => u1 x face_count = { 0,0,0,0, .... }
0xf023 => u2 x face_count = { 0,0,0,0, .... }
*/
