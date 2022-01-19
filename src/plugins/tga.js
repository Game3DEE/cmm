import { DataType, Plugin } from './plugin.js'

import { loadTGA } from '../formats/tga.js'

export class TGAPlugin extends Plugin {
    async loadFile(url, name) {
        return [
            {
                type: DataType.Texture,
                texture: loadTGA(this.loadFromURL(url)),
            }
        ]
    }

    supportedExtensions() {
        return [ 'tga' ]
    }
}
