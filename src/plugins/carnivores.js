import {
    AnimationClip,
    BufferGeometry,
    DataTexture,
    Float32BufferAttribute,
    Mesh,
    MeshBasicMaterial,
    MeshNormalMaterial,
    RGBAFormat,
    UnsignedByteType,
} from 'three'

import { DataType, Plugin } from './plugin.js'
import { downloadBlob, imgToImageData } from '../utils.js'

// Loaders (all carnivores specific)
import { load3DF, save3DF } from '../formats/3df.js'
import { load3DN, save3DN } from '../formats/3dn.js'
import { loadCAR, saveCAR } from '../formats/car.js'
import { loadANI } from '../formats/ani.js'
import { loadVTL } from '../formats/vtl.js'
import { loadCRT } from '../formats/crt.js'

import { saveTGA } from '../formats/tga.js'

export class CarnivoresPlugin extends Plugin {
    constructor(gui) {
        super(gui)

        this.customGui = null
        this.activeModel = null
        this.guiOps = {
            export3DF: () => {
                const model = this.activeModel.userData.cpmData
                const out = save3DF({ ...model, texture: this.createTexture565(), })
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
                const out = saveCAR({  ...model, texture: this.createTexture565(), })
                downloadBlob(out, `${this.activeModel.name}.car`)
            },
            exportTGA32: () => {
                const tex = this.activeModel?.material?.map
                if (tex) {
                    const buf = saveTGA(tex.image) // no need for conversion, on import all textures are 32-bit (RGBA)
                    downloadBlob(buf, `${tex.name}.tga`)
                }
            },
            exportTGA16: () => {
                const tex = this.activeModel?.material?.map
                if (tex) {
                    const buf = saveTGA({
                        width: tex.image.width,
                        height: tex.image.height,
                        data: this.createTexture565()
                    }, 16)
                    downloadBlob(buf, `${tex.name}.tga`)
                }
            },            
        }
    }

    convert(model) {
        const materials = Array.isArray(model.material) ? model.material : [model.material]
        const textures = []
        const remapInfo = []
        materials.forEach(m => {
            if (m.map && !textures.includes(m.map)) textures.push(m.map)
        })

        // combine our textures into a single texture
        let outHeight = 0
        textures.forEach((t,tIdx) => {
            const scale = 256 / t.image.width
            const height = t.image.height * scale
            remapInfo[tIdx] = {
                scale,
                height,
                offset: outHeight,
                srcData: imgToImageData(t.image)
            }
            outHeight += height
        })
        const singleTex = this.scaleAndCombine(remapInfo, outHeight)

        // Update UV
        const newHeight = singleTex.image.height
        const { uv } = model.geometry.attributes
        model.geometry.groups.forEach(g => {
            const tex = materials[g.materialIndex].map
            if (tex) {
                const idx = textures.indexOf(tex)
                if (idx > -1) {
                    const rmi = remapInfo[idx]
                    console.log(`Remapping texture ${textures[idx].name}`, rmi)
                    // Loop through all vertices in this material
                    const scale = rmi.height / newHeight
                    const offset = rmi.offset / newHeight
                    for (let i = g.start; i < g.start + g.count; i++) {
                        let v = uv.getY(i) * scale + offset
                        uv.setY(i, v)
                    }
                }
            }
        })
        uv.needsUpdate = true
        model.geometry.clearGroups()
        model.material = new MeshBasicMaterial({ map: singleTex })
        model.material.name = `${model.name}-processed`
        singleTex.name = `${model.name}-processed`

        model.userData.cpmData = this.cpmFromModel(model)

        return model
    }

    // Create model data like Carnivores export functions expect it
    cpmFromModel(model) {
        let outModel = {
            name: model.name,
            faces: [],
            vertices: [],
            bones: [],
            animations: [],
            texture: null,
        }

        const findOrAddVert = (x,y,z) => {
            for (let i = 0; i < outModel.vertices.length; i++) {
                const v = outModel.vertices[i].position
                if (v[0] === x && v[1] === y && v[2] === z) {
                    return i
                }
            }

            const index = outModel.vertices.length
            outModel.vertices.push({
                position: [ x, y, z ],
                bone: 0,
                hide: 0,
            })

            return index
        }

        const { width, height } = model.material.map.image
        const { position, uv } = model.geometry.attributes
        // Loop over all triangles
        for (let i = 0; i < position.count; i += 3) {
            const indices = []
            const uvs = []
            // Get the tree indices (and collect uv while we're at it)
            for (let j = 0; j < 3; j++) {
                const x = position.getX(i + j),
                    y = position.getY(i + j),
                    z = position.getZ(i + j)
                indices.push( findOrAddVert(x,y,z) )
                uvs.push(
                    Math.floor(uv.getX(i + j) * width),
                    Math.floor(uv.getY(i + j) * height),
                )
            }
            // Add the face
            outModel.faces.push({
                indices,
                uvs,
                flags: 0,
                dmask: 0,
                distant: 0,
                next: 0,
                group: 0,
            })
        }

        return outModel
    }

    scaleAndCombine(remapInfo, outHeight) {
        // Final output canvas
        const outCanvas = document.createElement('canvas')
        outCanvas.width = 256
        outCanvas.height = outHeight
        const outCtx = outCanvas.getContext('2d')

        remapInfo.slice().reverse().forEach(rmi => {
            // Setup and render into temp canvas
            // XXX TODO see if we can resize one canvas instead of keep generating new ones
            const tmpCanvas = document.createElement('canvas')
            tmpCanvas.width = rmi.srcData.width
            tmpCanvas.height = rmi.srcData.height
            const tmpCtx = tmpCanvas.getContext('2d')
            // Render texture into temp canvas
            tmpCtx.putImageData(rmi.srcData, 0, 0)

            outCtx.scale(rmi.scale, rmi.scale)
            outCtx.drawImage(tmpCanvas, 0, rmi.offset / rmi.scale)
            outCtx.setTransform(1, 0, 0, 1, 0, 0) // reset transform
        })

        const dst = outCtx.getImageData(0,0,outCanvas.width,outCanvas.height)
        return new DataTexture(dst.data, dst.width, dst.height, RGBAFormat, UnsignedByteType)
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
        this.customGui = null
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
            this.customGui.add(this.guiOps, 'exportTGA32').name('Export 32-bit TGA')
            this.customGui.add(this.guiOps, 'exportTGA16').name('Export 16-bit TGA')
        }
        this.activeModel = model
    }

    getExportTexture() {

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
        const morphVertices = []
        const position = []
        const uv = []
    
        // UV dividers
        const width = tex ? tex.image.width : 256
        const height = tex ? tex.image.height : 256

        const totalFrames = animations.reduce((a,b) => a + b.frameCount, 0)

        if (totalFrames) {
            for (let i = 0; i < totalFrames; i++) {
                morphVertices[i] = []
            }
        }

        model.faces.forEach(f => {
            for (let i = 0; i < 3; i++) {
                const vIdx = f.indices[i]
                const v = model.vertices[vIdx]
                position.push(
                    v.position[0],
                    v.position[1],
                    v.position[2],
                )

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
            }
            uv.push(
                f.uvs[0] / width, f.uvs[1] / height,
                f.uvs[2] / width, f.uvs[3] / height,
                f.uvs[4] / width, f.uvs[5] / height,
            )
        })

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
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

        const mat = tex ? new MeshBasicMaterial({ map: tex }) : new MeshNormalMaterial()

        let obj = new Mesh(geo, mat)
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

    createTexture565() {
        let tex = this.activeModel?.material?.map

        // bail out if no current texture
        if (!tex) return undefined
    
        // Convert 32-bit RGBA texture to RGB565 texture
        const { width, height, data } = tex.image
        const texture = new Uint16Array(width * height)
        for (let i = 0; i < data.length; i++) {
            let r = (data[i*4 +0] >>> 3) & 0x1f
            let g = (data[i*4 +1] >>> 3) & 0x1f
            let b = (data[i*4 +2] >>> 3) & 0x1f
            let a = (data[i*4 +3] != 0) ? 0x8000 : 0
            texture[i] = a | (r << 10) | (g << 5) | b
        }
    
        return texture
    }

    // helper function
    convertTexture(texture, textureBytes, baseName) {
        // Bail out early if we have no texture data
        if (!textureBytes) {
            tex = null
            return
        }

        const width = 256
        const height = (textureBytes / 2) / width
        const data = new Uint8ClampedArray(width * height * 4)

        for (let i = 0; i < texture.length; i++) {
            let pixel = texture[i]
            let r = ((pixel >>> 10) & 0x1f);
            let g = ((pixel >>>  5) & 0x1f);
            let b = ((pixel >>>  0) & 0x1f);
        
            data[i*4 +0] = r << 3;
            data[i*4 +1] = g << 3;
            data[i*4 +2] = b << 3;
            data[i*4 +3] = 255
        }

        const tex = new DataTexture(data, width, height, RGBAFormat, UnsignedByteType)
        tex.name = baseName

        return tex
    }
}
