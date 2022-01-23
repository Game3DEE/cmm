// TODO:
// - support animations
// - use compressed vertices (integer ones, for automatic scale up)
// - tex format?

import {
    BufferGeometry,
    Float32BufferAttribute,
    Mesh,
    MeshNormalMaterial,
} from 'three'

import { DataType, Plugin } from './plugin.js'
import { KaitaiStream } from 'kaitai-struct'
import MDL from '../kaitai/serious1_mdl.js'

export class CityscapePlugin extends Plugin {
    async loadFile(url, ext, baseName) {
       return await this.loadModel(url, baseName)
    }

    async loadModel(url, baseName) {
        const parsed = new MDL(new KaitaiStream(await this.loadFromURL(url)))
        const mipInfo = parsed.mipInfo[0]
        const index = []

        console.log(mipInfo)

        mipInfo.polygons.forEach(p => {
            if (p.vertexCount != 3) throw new Error(`MDL: No support for non-triangles yet`)
            p.vertices.forEach(v => index.push(v.transformedVertex))
            // v.textureVertex into mipInfo.textureVertices[].
        })
        const position = []
        parsed.mainMipVertices.forEach(v => {
            position.push(v.x, v.y, v.z)
            // TODO: uv!
        })

        let geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setIndex(index)
        geo.computeVertexNormals()

        const mat = new MeshNormalMaterial()
        mat.name = baseName
        const mesh = new Mesh(geo, mat)
        mesh.name = baseName

        return [{
            type: DataType.Model, model: mesh,
        }]
    }

    supportedExtensions() {
        return [ 'mdl' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Cityscape (Model)"
    }
}
