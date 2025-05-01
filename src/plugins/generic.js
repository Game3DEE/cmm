import {
    LineSegments,
    Mesh,
    MeshNormalMaterial,
} from 'three'

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

import { DataType, Plugin } from './plugin.js'
import { downloadBlob } from '../utils.js'

export class GenericPlugin extends Plugin {
    constructor(gui) {
        super(gui)
        this.customGui = null
    }

    deactivate() {
        this.customGui?.destroy()
    }

    activate(model) {
        this.customGui = this.gui.addFolder('Generic')
        this.customGui.add({
            export: () => {
                const exp = new OBJExporter()
                downloadBlob(exp.parse(model), `${model.name}.obj`)
            }
        }, 'export').name('Export To OBJ')
        this.customGui.add({
            exportGlb: async () => {
                const exp = new GLTFExporter()
                const userData = model.userData;
                model.userData = {};
                const glb = await exp.parseAsync(model, { binary: true, animations: model.animations });
                model.userData = userData;
                downloadBlob(glb, `${model.name}.glb`)
            }
        }, 'exportGlb').name('Export To GLB')
    }

    async loadFile(url, ext, baseName) {
        let loader = new OBJLoader()
        let model = await loader.loadAsync(url)
        let mesh = model.children[0]
        // Handle the case that the OBJLoader for some reason thought
        // it was a good idea to load the object as a line-segment object
        if (mesh instanceof LineSegments) {
            mesh = new Mesh(mesh.geometry, mesh.material)
        }
        if (Array.isArray(mesh.material)) {
            mesh.material.map((m,i) => {
                let mat = new MeshNormalMaterial()
                mat.name = `Material-${i}`
            })
        } else {
            mesh.material = new MeshNormalMaterial()
            mesh.material.name = 'Material-1'
        }

        return [
            { type: DataType.Model, model: mesh }
        ]
    }

    supportedExtensions() {
        return [ 'obj' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Generic (Model)"
    }
}
