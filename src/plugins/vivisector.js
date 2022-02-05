import { DataType, Plugin } from './plugin.js'

import CMF from '../kaitai/vivisector_cmf.js'
import TRK from '../kaitai/vivisector_trk.js'

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
        switch(ext) {
            case 'cmf': return [ { type: DataType.Model, model: this.loadModel(await this.loadFromURL(url), baseName) }]
            case 'trk': return [ { type: DataType.Animation, animation: this.loadAnimation(await this.loadFromURL(url), baseName) }]
        }
    }

    // TODO: only allow when plugin is active
    loadAnimation(buffer, baseName) {
        const parsed = new TRK(new KaitaiStream(buffer))
        console.log(parsed)

        

        return null
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
                    console.log(b.data)
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
