import { DataType, Plugin } from './plugin.js'
import CMF from '../kaitai/vivisector_cmf.js'

import { KaitaiStream } from 'kaitai-struct'

import {
    BufferGeometry, Float32BufferAttribute, Mesh, MeshNormalMaterial,
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
        parsed.blocks.forEach(b => {
            switch(b.id) {
                // dumps for further research
                case CMF.BlockId.HEADER:
                    console.log('HDR', b.data)
                    break
                case CMF.BlockId.FACE_COUNT:
                    console.log('FACE_COUNT', b.data)
                    break
                case CMF.BlockId.VERT_COUNT:
                    console.log('VERT_COUNT', b.data)
                    break
                case CMF.BlockId.TEXTURE_COUNT:
                    console.log('TEXTURE_COUNT', b.data)
                    break
                case CMF.BlockId.TEXTURES:
                    console.log('TEXTURES', b.data)
                    break
                case CMF.BlockId.UV1:
                    console.log('UV1')
                    uvs = b.data.uvs
                    break
                case CMF.BlockId.OBJECT_NAME:
                    console.log('OBJECT_NAME', b.data)
                    break
                case CMF.BlockId.UV2: // Not UVs but normals or so?
                    console.log('UV2')
                    //uvs = b.data.uvs
                    break
                case CMF.BlockId.FACES:
                    console.log('FACES')
                    faces = b.data.faces
                    break
                case CMF.BlockId.VERTICES:
                    console.log('VERTICES')
                    vertices = b.data.vertices
                    break
                case 0x201c:
                    indices = new Uint32Array(b.data.buffer, b.data.byteOffset, b.data.length / 4)
                    console.log('MATERIAL_INDICES', indices)
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
        groups.forEach((g,i) => {
            const m = new MeshNormalMaterial()
            m.name = `Material-${i+1}`
            mat.push(m)
        })

        console.log(geo)

        const mesh = new Mesh(geo, mat)
        mesh.name = baseName

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
