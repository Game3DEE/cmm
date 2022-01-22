export const DataType = {
    Model: 'model',
    Animation: 'animations',
    Texture: 'texture',
}

export class Plugin {
     // initialize plugin
    constructor(gui) {
        this.gui = gui
    }

    // if this plugin implements a game "mode", for now it basically
    // specifies if it just loads textures or does models too
    isMode() {
        return false
    }

    // load one or more types of data
    // can throw on unexpected parsing issues
    async loadFile(url, name) {
        throw new Error(`loadFile is not implemented in this plugin!`)
    }

    // returns name of plugin
    name() {
        throw new Error(`Base plugin name() called, please override!`)
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
