import { DataType, Plugin } from './plugin.js'
import CMF from '../kaitai/vivisector_cmf.js'

import { KaitaiStream } from 'kaitai-struct'

export class VivisectorPlugin extends Plugin {
    async loadFile(url, name) {
        const model = this.loadModel(await this.loadFromURL(url))
        return [
            { type: DataType.Model, model: model },
        ]
    }

    loadModel(buffer) {
        const parsed = new CMF(new KaitaiStream(buffer))
        console.log(parsed)

        return null
    }

    supportedExtensions() {
        return [ 'cmf' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Vivisector (Model)"
    }
}
