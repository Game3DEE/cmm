import {
    AnimationClip,
    BufferGeometry,
    DataTexture,
    Float32BufferAttribute,
    MeshBasicMaterial,
    Mesh,
    UnsignedShort565Type,
    RGBFormat,
} from 'three'

import { DataType, Plugin } from './plugin.js'
import { conv_565 } from '../utils.js'

// Loaders (all carnivores specific)
import { load3DF } from '../formats/3df.js'
import { load3DN } from '../formats/3dn.js'
import { loadANI } from '../formats/ani.js'
import { loadCAR } from '../formats/car.js'
import { loadVTL } from '../formats/vtl.js'
import { loadCRT } from '../formats/crt.js'

export class CarnivoresPlugin extends Plugin {
    async loadFile(url, name) {
        const ext = name.toLowerCase().split('.').pop()
        switch(ext) {
            case '3df': return await this.load3DF(url)
            case 'car': return await this.loadCAR(url)
            case '3dn': return await this.load3DN(url)
            case 'vtl': return await this.loadVTL(url)
            case 'ani': return await this.loadVTL(url)
            case 'crt': return await this.loadCRT(url)
        }
    }

    async loadCRT(url) {
        const tex = loadCRT(await this.loadFromURL(url))
        return [{
            type: DataType.Texture,
            texture: tex,
        }]
    }

    async load3DF(url) {
        const data = load3DF(await this.loadFromURL(url))
        const tex = this.convertTexture(data.texture, data.textureSize)
        const result = [
            { type: DataType.Model, model: this.createMeshFromModel(data, tex) },
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

    async load3DN(url) {
        const data = load3DN(await this.loadFromURL(url))
        return [
            { type: DataType.Model, model: this.createMeshFromModel(data) },
        ]
    }

    async loadCAR(url) {
        const data = loadCAR(await this.loadFromURL(url))
        const tex = this.convertTexture(data.texture, data.textureSize)
        const result = [
            { type: DataType.Model, model: this.createMeshFromModel(data, tex) },
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

    createMeshFromModel(model, tex) {
        const { animations } = model
        const totalFrames = animations?.reduce((a,b) => a + b.frameCount, 0)

        const morphVertices = []
        const position = []
        const uv = []

        if (totalFrames) {
            for (let i = 0; i < totalFrames; i++) {
                morphVertices[i] = []
            }
        }

        const width = tex ? tex.image.width : 256
        const height = tex ? tex.image.height : 256

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
    
        const mat = tex ?
            new MeshBasicMaterial({ map: tex, alphaTest: 0.5, transparent: true }) :
            new MeshBasicMaterial({ wireframe: true /*side: THREE.DoubleSide*/ })
    
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
        
        return obj
    }

    // helper function
    convertTexture(texture, textureBytes) {
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

        return new DataTexture(data, width, height, RGBFormat, UnsignedShort565Type)
    }
}
