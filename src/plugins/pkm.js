import { DataType, Plugin } from './plugin.js'

import { loadPKM } from '../formats/pkm.js'

import {
    DataTexture,
    RGBAFormat,
    UnsignedByteType,
} from 'three'

import { setLinearFilters } from '../utils.js'

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
        setLinearFilters(tex)
        tex.name = baseName
        return tex
    }

    supportedExtensions() {
        return [ 'pkm' ]
    }
}
