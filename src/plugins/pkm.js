import { DataType, Plugin } from './plugin.js'

import { loadPKM } from '../formats/pkm.js'

import {
    DataTexture,
    RGBAFormat,
    UnsignedByteType,
} from 'three'

export class PKMPlugin extends Plugin {
    async loadFile(url, ext, baseName) {
        return [
            {
                type: DataType.Texture,
                texture: this.loadPKM(await this.loadFromURL(url), baseName),
            }
        ]
    }

    loadPKM(buf, baseName) {
        const pkm = loadPKM(buf)
        const tex = new DataTexture(pkm.data, pkm.width, pkm.height, RGBAFormat, UnsignedByteType)
        tex.name = baseName
        return tex
    }

    supportedExtensions() {
        return [ 'pkm' ]
    }
}
