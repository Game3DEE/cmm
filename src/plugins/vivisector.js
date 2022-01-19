import { loadCMF } from '../formats/cmf.js'
import { DataType, Plugin } from './plugin.js'

export class VivisectorPlugin extends Plugin {
    async loadFile(url, name) {
        const model = loadCMF(this.loadFromURL(url))
        return [
            { type: DataType.Model, model: model },
        ]
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
