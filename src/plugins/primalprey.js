// TODO:
//  - add animation support

import {
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    Mesh,
    MeshNormalMaterial,
} from 'three'

import { DataType, Plugin } from './plugin.js'

import { KaitaiStream } from 'kaitai-struct'
import SSM from '../kaitai/primalprey_ssm.js'

const scale = 32

export class PrimalPreyPlugin extends Plugin {
    async loadFile(url, ext, baseName) {
        const model = this.loadModel(await this.loadFromURL(url), baseName)
        return [
            { type: DataType.Model, model: model },
        ]
    }

    loadModel(buffer, baseName) {
        const parsed = new SSM(new KaitaiStream(buffer))
        console.log(parsed)

        const geo = new BufferGeometry()
        const position = []
        const uv = []
        const vertices = parsed.frames[0].vertices
        const groups = [] // { start, count, materialIndex }
        let meshId = -1
        parsed.faces.forEach(f => {
            if (f.meshId != meshId) {
                if (meshId != -1) {
                    const grp = groups[groups.length-1]
                    grp.count = (position.length / 3) - grp.start
                }
                groups.push({ start: position.length / 3, count: -1, materialIndex: groups.length })
                meshId = f.meshId
            }
            const a = f.vertices[0], b = f.vertices[1], c = f.vertices[2]
            position.push(
                vertices[a].x * scale, vertices[a].z * scale, vertices[a].y * scale,
                vertices[b].x * scale, vertices[b].z * scale, vertices[b].y * scale,
                vertices[c].x * scale, vertices[c].z * scale, vertices[c].y * scale,
            )
            uv.push(
                f.uvs[0], f.uvs[1],
                f.uvs[2], f.uvs[3],
                f.uvs[4], f.uvs[5],
            )
        })
        const grp = groups[groups.length-1]
        grp.count = (position.length / 3) - grp.start

        console.log(groups)

        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
        groups.forEach(({ start, count, materialIndex }) => geo.addGroup(start, count, materialIndex))
        geo.computeVertexNormals()

        const mat = []
        groups.forEach(g => {
            const m = new MeshNormalMaterial()
            m.name = parsed.objects[g.materialIndex].name
            mat.push(m)
        })

        const mesh = new Mesh(geo, mat)
        mesh.name = baseName

        console.log(geo)

        return mesh
    }

    supportedExtensions() {
        return [ 'ssm' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Primal Prey (Model)"
    }
}
