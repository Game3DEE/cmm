import { DataType, Plugin } from './plugin.js'

import { loadTGA } from '../formats/tga.js'

import {
    DataTexture,
    RGBAFormat,
    UnsignedByteType,
} from 'three'

export class TGAPlugin extends Plugin {
    async loadFile(url, name) {
        return [
            {
                type: DataType.Texture,
                texture: this.loadTGA(await this.loadFromURL(url), baseName),
            }
        ]
    }

    loadTGA(buf, baseName) {
        const tga = loadTGA(buf)
        const tex = new DataTexture(tga.data, tga.width, tga.height, RGBAFormat, UnsignedByteType)
        tex.name = baseName
        return tex
    }

    supportedExtensions() {
        return [ 'tga' ]
    }
}
