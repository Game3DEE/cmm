export const DataType = {
    Model: 'model',
    Animation: 'animations',
    Texture: 'texture',
}

export class Plugin {
     // initialize plugin
    constructor(gui) {
        this.gui = gui
        this.customGui = null
    }

    // Convert model to fit constraints of plugin format. This includes
    // combining materials / geometries / textures.
    convert(model) {
        return model // by default, just pass 1-on-1
    }

    // Plugin activated with new model
    // (always after convert is called; model is just for reference)
    activate(model) {
    }

    // Plugin deactivated; clear out custom UI
    deactivate() {
    }
   
    // if this plugin implements a game "mode", for now it basically
    // specifies if it just loads textures or does models too
    isMode() {
        return false
    }

    // Returns an object with GUI animation options
    animationOptions() {
        return {}
    }

    // load one or more types of data
    // can throw on unexpected parsing issues
    async loadFile(url, ext, baseName) {
        throw new Error(`loadFile is not implemented in this plugin!`)
    }

    // returns name of plugin
    name() {
        return 'unknown' // Maybe specify name in constructor?
    }

    // return list of supported extensions
    supportedExtensions() {
        return []
    }

    // --- support functions

    // load buffer from file spec
    async loadFromURL(url) {
        return await fetch(url).then(body => body.arrayBuffer())
    }
}
