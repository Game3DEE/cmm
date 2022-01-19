import { DataType, Plugin } from './plugin.js'

import { loadSSM } from '../formats/ssm.js'

export class PrimalPreyPlugin extends Plugin {
    async loadFile(url, name) {
        const model = loadSSM(this.loadFromURL(url))
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
        return "Primal Prey (Model)"
    }
}
