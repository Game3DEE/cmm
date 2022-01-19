import { DataType, Plugin } from './plugin.js'

import { loadPKM } from '../formats/pkm.js'

export class PKMPlugin extends Plugin {
    async loadFile(url, name) {
        return [
            {
                type: DataType.Texture,
                texture: loadPKM(this.loadFromURL(url)),
            }
        ]
    }

    supportedExtensions() {
        return [ 'pkm' ]
    }
}
