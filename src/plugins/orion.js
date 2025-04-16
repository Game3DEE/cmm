import { DataType, Plugin } from './plugin.js'

import { KaitaiStream } from 'kaitai-struct'

import OrionMsh from '../kaitai/orion_msh.js'
import { BufferGeometry, Float32BufferAttribute, Mesh, MeshNormalMaterial } from 'three'

export class OrionPlugin extends Plugin {
    constructor(gui) {
        super(gui)
    }

    supportedExtensions() {
        return [ 'msh' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Orion (Model)"
    }

    async loadFile(url, ext, baseName) {
        switch(ext) {
            case 'msh':
                return this.loadMSH(await this.loadFromURL(url), baseName)
        }

        return undefined
    }

    loadMSH(buffer, baseName) {
        const parsed = new OrionMsh(new KaitaiStream(buffer))
        console.log(parsed)
        const positions = parsed.vertices.flatMap(v => [ v.x, v.y, v.z ])
        const normals = parsed.normals.flatMap(v => [ v.x, v.y, v.z ])
        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
        geo.setAttribute('normal', new Float32BufferAttribute(normals, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(parsed.uv, 2))
        geo.setIndex(parsed.indices.slice().reverse()) // XXX: hack for changing triangle vertex order
        const mat = new MeshNormalMaterial();
        mat.name = baseName
        const mesh = new Mesh(geo, mat)
        mesh.name = baseName

        return [
            { type: DataType.Model, model: mesh },
        ]
    }
}
