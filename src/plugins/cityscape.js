import { DataType, Plugin } from './plugin.js'

export class CityscapePlugin extends Plugin {
    async loadFile(url, name) {
        /*
        const model = loadSSM(this.loadFromURL(url))
        return [
            { type: DataType.Model, model: model },
        ]
        */
       return []
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
