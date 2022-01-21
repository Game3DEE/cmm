// TODO:
//  - add uv support
//  - add animation support
//  - check one-off or so in triangles?

import {
    BufferGeometry,
    Float32BufferAttribute,
    Mesh,
    MeshBasicMaterial,
} from 'three'

import { DataType, Plugin } from './plugin.js'

import { KaitaiStream } from 'kaitai-struct'
import SSM from '../kaitai/primalprey_ssm.js'

export class PrimalPreyPlugin extends Plugin {
    async loadFile(url, name) {
        const model = this.loadModel(await this.loadFromURL(url))
        return [
            { type: DataType.Model, model: model },
        ]
    }

    loadModel(buffer) {
        const parsed = new SSM(new KaitaiStream(buffer))
        console.log(parsed)

        const geo = new BufferGeometry()
        const position = []
        const index = []
        parsed.faces.forEach(f => {
            index.push.apply(index, f.vertices)
        })
        parsed.frames[0].vertices.forEach(v => {
            position.push(v.x, v.y, v.z)
        })

        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setIndex(index)

        const mesh = new Mesh(geo, new MeshBasicMaterial({ wireframe: true }))

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
