import {
    AnimationClip,
    BufferGeometry,
    DataTexture,
    Float32BufferAttribute,
    Mesh,
    MeshBasicMaterial,
    MeshNormalMaterial,
    RGBAFormat,
    RGBFormat,
    UnsignedByteType,
    UnsignedShort565Type,
} from 'three'

import { DataType, Plugin } from './plugin.js'
import { conv_565, downloadBlob } from '../utils.js'

// Loaders (all carnivores specific)
import { load3DF, save3DF } from '../formats/3df.js'
import { load3DN, save3DN } from '../formats/3dn.js'
import { loadANI } from '../formats/ani.js'
import { loadCAR } from '../formats/car.js'
import { loadVTL } from '../formats/vtl.js'
import { loadCRT } from '../formats/crt.js'

export class CarnivoresPlugin extends Plugin {
    constructor(gui) {
        super(gui)

        this.customGui = null
        this.activeModel = null
        this.guiOps = {
            export3DF: () => {
                const model = this.activeModel.userData.cpmData
                // TODO: pass texture data
               const out = save3DF(model)
               downloadBlob(out, `${this.activeModel.name}.3df`)
            },
            export3DN: () => {
                const model = this.activeModel.userData.cpmData
                // TODO: pass texture data
                const out = save3DN(model)
                downloadBlob(out, `${this.activeModel.name}.3dn`)
            },
            exportCAR: () => {
                const model = this.activeModel.userData.cpmData
                // TODO: pass texture data (animations?)
                const out = saveCAR(model)
                downloadBlob(out, `${this.activeModel.name}.car`)
            },
        }
    }

    convert(model) {
        const isMultiMaterial = Array.isArray(model.material) && model.material.length > 1
        console.log(`model has multiple textures: ${isMultiMaterial}`)
    }

    async loadFile(url, ext, baseName) {
        switch(ext) {
            case '3df': return await this.load3DF(url, baseName)
            case 'car': return await this.loadCAR(url, baseName)
            case '3dn': return await this.load3DN(url, baseName)
            case 'vtl': return await this.loadVTL(url, baseName)
            case 'ani': return await this.loadVTL(url, baseName)
            case 'crt': return await this.loadCRT(url, baseName)
        }
    }

    // Called when a different plugin is activated
    deactivate() {
        this.activeModel = null
        this.customGui?.destroy()
    }

    // Called when a plugin is activated; gives it the change to add
    // custom GUI options (like export)
    // also called on new model load (from the same plugin)
    activate(model) {
        if (!this.customGui) {
            this.customGui = this.gui.addFolder('Carnivores')
            this.customGui.add(this.guiOps, 'export3DF').name('Export 3DF')
            this.customGui.add(this.guiOps, 'export3DN').name('Export 3DN')
            this.customGui.add(this.guiOps, 'exportCAR').name('Export CAR')
        }
        this.activeModel = model
    }

    async loadCRT(url, baseName) {
        const crt = loadCRT(await this.loadFromURL(url))
        const tex = new DataTexture(crt.data, crt.width, crt.height, RGBAFormat, UnsignedByteType)
        tex.name = baseName
        return [{
            type: DataType.Texture,
            texture: tex,
        }]
    }

    async load3DF(url, baseName) {
        const data = load3DF(await this.loadFromURL(url)).model
        const tex = this.convertTexture(data.texture, data.textureSize, baseName)
        const result = [
            { type: DataType.Model, model: this.createMeshFromModel(data, tex, baseName) },
            { type: DataType.Texture, texture: tex },
        ]

        if (tex) { // we could have a zero byte texture
            result.push({
                type: DataType.Texture,
                texture: tex,
            })
        }

        return result
    }

    async load3DN(url, baseName) {
        const data = load3DN(await this.loadFromURL(url))
        return [
            { type: DataType.Model, model: this.createMeshFromModel(data, null, baseName) },
        ]
    }

    async loadCAR(url, baseName) {
        const data = loadCAR(await this.loadFromURL(url))
        const tex = this.convertTexture(data.texture, data.textureSize, baseName)
        const result = [
            { type: DataType.Model, model: this.createMeshFromModel(data, tex, baseName) },
        ]

        if (tex) { // we could have a zero byte texture
            result.push({
                'type': DataType.Texture,
                texture: tex,
            })
        }

        data.animations.forEach(ani => {
            result.push({
                type: DataType.Animation,
                animation: ani,
            })
        })

        return result
    }

    async loadVTL(url) {
        const data = loadVTL(await this.loadFromURL(url))
        return [
            { 'type': DataType.Animation, animation: data },
        ]
    }

    async loadANI(url) {
        const data = loadANI(await this.loadFromURL(url))
        return [
            { 'type': DataType.Animation, animation: data },
        ]
    }

    isMode() {
        return true // oh yeah baby!
    }

    name() {
        return "Carnivores (Model)"
    }

    supportedExtensions() {
        return [ '3df', 'car', '3dn', 'vtl', 'ani', 'crt' ]
    }

    createMeshFromModel(model, tex, baseName) {
        const { animations } = model
        const totalFrames = animations?.reduce((a,b) => a + b.frameCount, 0)

        const morphVertices = []
        const position = []
        const uv = []
        const index = []

        if (totalFrames) {
            for (let i = 0; i < totalFrames; i++) {
                morphVertices[i] = []
            }
        }

        const width = tex ? tex.image.width : 256
        const height = tex ? tex.image.height : 256

        function findOrAddVert(pos, u, v) {
            for (let i = 0; i < position.length / 3; i++) {
                if (pos[0] === position[i*3+0] &&
                    pos[1] === position[i*3+1] &&
                    pos[2] === position[i*3+2] &&
                    u === uv[i*2+0] &&
                    v === uv[i*2+1]) {
                    return i
                }
            }

            // did not find a matching vert, so add one
            const vIdx = position.length / 3
            position.push(pos[0], pos[1], pos[2])
            uv.push(u, v)

            if (totalFrames) {
                let frIdx = 0
                animations.forEach(ani => {
                    for (let i = 0; i < ani.frameCount; i++) {
                        const vOff = (i * ani.vertCount + vIdx) * 3
                        morphVertices[frIdx + i].push(
                            ani.frames[vOff + 0] / 16, // x
                            ani.frames[vOff + 1] / 16, // y
                            ani.frames[vOff + 2] / 16, // z
                        )
                    }
                    frIdx += ani.frameCount
                })
            }

            return vIdx
        }

        model.faces.forEach(f => {
            const a = f.indices[0]
            const b = f.indices[1]
            const c = f.indices[2]

            const aIdx = findOrAddVert(model.vertices[a].position, f.uvs[0] / width, f.uvs[1] / height)
            const bIdx = findOrAddVert(model.vertices[b].position, f.uvs[2] / width, f.uvs[3] / height)
            const cIdx = findOrAddVert(model.vertices[c].position, f.uvs[4] / width, f.uvs[5] / height)
            index.push(aIdx, bIdx, cIdx)
        })
    
        console.log(model)

        let min = Number.MAX_VALUE, max = Number.MIN_VALUE
        position.forEach((v,i) => {
            min = Math.min(min, v)
            max = Math.max(max, v)
            if (isNaN(v)) {
                console.log(`position ${i} has NaN value`)
            }
        })
        console.log(min, max, position.length / 3)

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
        geo.setIndex(index)
        geo.computeVertexNormals()
    
        if (totalFrames) {
            // Add animation data
            geo.morphAttributes.position = []
            let frIdx = 0
            animations.forEach(ani => {
                for (let i = 0; i < ani.frameCount; i++) {
                    const attr = new Float32BufferAttribute(morphVertices[frIdx + i], 3)
                    attr.name = `${ani.name}.${i}`
                    geo.morphAttributes.position.push(attr)
                }
                frIdx += ani.frameCount
            })
        }
    
        const mat = tex ?
            new MeshBasicMaterial({ map: tex, alphaTest: 0.5, transparent: true }) :
            new MeshNormalMaterial({ })
    
        mat.name = baseName

        let obj = new Mesh(geo, mat)
        obj.name = model.name
        if (totalFrames) {
            animations.forEach(ani => {
                const seq = []
                for (let i = 0; i < ani.frameCount; i++) {
                    seq.push({
                        name: `${ani.name}.${i}`,
                        vertices: [], // seems unused
                    })
                }
                const clip = AnimationClip.CreateFromMorphTargetSequence(
                    `${ani.name}`,
                    seq,
                    ani.fps,
                    false /*noLoop*/
                )
                obj.animations.push(clip)
            })
        }
        
        obj.name = model.name || baseName
        obj.userData.cpmData = model

        return obj
    }

    // helper function
    convertTexture(texture, textureBytes, baseName) {
        // Bail out early if we have no texture data
        if (!textureBytes) {
            return null
        }

        const width = 256
        const height = (textureBytes / 2) / width
        const data = new Uint16Array(width * height)

        for (let i = 0; i < texture.length; i++) {
            data[i] = conv_565(texture[i])
        }

        const tex = new DataTexture(data, width, height, RGBFormat, UnsignedShort565Type)
        tex.name = baseName

        return tex
    }
}
