// SCCS' Prism3D engine support
import { DataType, Plugin } from './plugin.js'

import { KaitaiStream } from 'kaitai-struct'

import Q3DMF from '../kaitai/quickdraw_3dmf.js'

import {
    BufferGeometry,
    Float32BufferAttribute,
    Mesh,
    MeshNormalMaterial,
} from 'three'


export class Quickdraw3DPlugin extends Plugin {
    constructor(gui) {
        super(gui)
        this.customGui = null
        this.activeModel = null
        this.guiOpts = { model: 0 }
    }

    // Called when a different plugin is activated
    deactivate() {
        this.activeModel = null
        this.customGui?.destroy()
        this.customGui = null
    }

    // Called when a plugin is activated; gives it the change to add
    // custom GUI options (like export)
    // also called on new model load (from the same plugin)
    activate(model) {
        this.activeModel = model
        if (!this.customGui) {
            this.customGui = this.gui.addFolder('Quickdraw3D')
            const count = this.activeModel.userData.indices?.length || 1
            this.customGui.add(this.guiOpts, 'model', 0, count -1, 1).name('Model').onChange(v => this.switchModel(v))
        }
    }

    async loadFile(url, ext, baseName) {
        switch(ext) {
            case '3dmf':
                return this.load3DMF(await this.loadFromURL(url), baseName)
        }

        return undefined
    }

    switchModel(idx) {
        const { parsed, indices } = this.activeModel.userData

        const position = []
        const index = []

        parsed.chunks[indices[idx]].data.chunks.forEach(c => {
            if (c.type == 'tmsh' && index.length === 0) {
                const baseIdx = index.length
                // ...
                c.data.triangles.forEach(i => index.push(i + baseIdx))
                c.data.vertices.forEach(v => {
                    position.push(v.x, v.y, v.z)
                })
            }
        })

        const geo = this.activeModel.geometry
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.deleteAttribute('normal')
        geo.setIndex(index)
        geo.computeVertexNormals()

    }

    load3DMF(buffer, baseName) {
        const parsed = new Q3DMF(new KaitaiStream(buffer))
        console.log(parsed)

        const position = []
        const index = []

        const modelChunkIndices = []

        parsed.chunks.forEach((c, rootChunkIdx) => {
            switch(c.type) {
                case 'cntr': // top level container
                    c.data.chunks.forEach(c => {
                        if (c.type == 'tmsh') {
                            modelChunkIndices.push(rootChunkIdx)

                            if (index.length === 0) {
                                const baseIdx = index.length
                                // ...
                                c.data.triangles.forEach(i => index.push(i + baseIdx))
                                c.data.vertices.forEach(v => {
                                    position.push(v.x, v.y, v.z)
                                })
                            }
                        }
                    })
            }
        })

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setIndex(index)
        geo.computeVertexNormals()
        const mat = new MeshNormalMaterial()
        const mesh = new Mesh(geo, mat)
        mesh.name = baseName

        mesh.userData.indices = modelChunkIndices
        mesh.userData.parsed = parsed

        return [
            { type: DataType.Model, model: mesh },
        ]
    }

    supportedExtensions() {
        return [ '3dmf' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Quickdraw3D (Model)"
    }
}
