// TODO:
// - support animations
// - use compressed vertices (integer ones, for automatic scale up)
// - tex format => write code to handle the KSY
// - support for quads (vertexCount === 4)

import {
    BufferGeometry,
    DataTexture,
    Float32BufferAttribute,
    Mesh,
    MeshNormalMaterial,
    RGBAFormat,
    UnsignedByteType,
} from 'three'

import { DataType, Plugin } from './plugin.js'
import { KaitaiStream } from 'kaitai-struct'
import MDL from '../kaitai/serious1_mdl.js'
import TEX from '../kaitai/serious1_tex.js'

const scale = 32

export class CityscapePlugin extends Plugin {
    async loadFile(url, ext, baseName) {
        switch(ext) {
            case 'tex': return await this.loadTexture(url, baseName)
            case 'mdl': return await this.loadModel(url, baseName)
        }
    }

    async loadTexture(url, baseName) {
        const parsed = new TEX(new KaitaiStream(await this.loadFromURL(url)))
        console.log(parsed)
        const frame = parsed.frames[0]
        const pixelCount = frame.width * frame.height
        const bytesPerPixel = parsed.bytesPerPixel
        const data = new Uint8ClampedArray(pixelCount * 4)
        for (let i = 0; i < pixelCount; i++) {
            data[i*4 + 0] = frame.pixels[i*bytesPerPixel + 0]
            data[i*4 + 1] = frame.pixels[i*bytesPerPixel + 1]
            data[i*4 + 2] = frame.pixels[i*bytesPerPixel + 2]
            data[i*4 + 3] = bytesPerPixel === 3 ? 255 : frame.pixels[i*bytesPerPixel + 3]
        }

        const tex = new DataTexture(data, frame.width, frame.height, RGBAFormat, UnsignedByteType)
        tex.name = baseName
        return [{
            type: DataType.Texture,
            texture: tex,
        }]
    }

    async loadModel(url, baseName) {
        const parsed = new MDL(new KaitaiStream(await this.loadFromURL(url)))
        console.log(parsed)
        const mipInfo = parsed.mipInfo[0]

        const position = []
        const uv = []

        mipInfo.polygons.forEach(p => {
            if (p.vertexCount != 3) throw new Error(`MDL: No support for non-triangles (${p.vertexCount}) yet`)
            p.vertices.forEach(pv => {
                const v = parsed.mainMipVertices[pv.transformedVertex]
                position.push(v.x * scale, v.y * scale, v.z * scale)
                const texV = mipInfo.textureVertices[pv.textureVertex]
                uv.push(
                    texV.uv.x / parsed.textureWidth,
                    texV.uv.y / parsed.textureHeight,
                )
            })
        })

        let geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
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
        return [ 'mdl', 'tex' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Cityscape (Model)"
    }
}
