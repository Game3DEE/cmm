import {
    AnimationClip,
    Bone,
    BufferGeometry,
    DataTexture,
    DoubleSide,
    Float32BufferAttribute,
    Mesh,
    MeshBasicMaterial,
    MeshNormalMaterial,
    Raycaster,
    RGBAFormat,
    Skeleton,
    SkinnedMesh,
    Uint16BufferAttribute,
    UnsignedByteType,
    Vector3,
} from 'three'

import { DataType, Plugin } from './plugin.js'
import { downloadBlob, imgToImageData, setLinearFilters } from '../utils.js'

// Loaders (all carnivores specific)
import { load3DF, save3DF } from '../formats/3df.js'
import { load3DN, save3DN } from '../formats/3dn.js'
import { loadCAR, saveCAR } from '../formats/car.js'
import { loadANI, saveANI } from '../formats/ani.js'
import { loadVTL, saveVTL } from '../formats/vtl.js'
import { loadCRT } from '../formats/crt.js'

import { saveTGA } from '../formats/tga.js'

import A3DF from '../kaitai/animator_3df.js'
import { KaitaiStream } from 'kaitai-struct'

export class CarnivoresPlugin extends Plugin {
    constructor(gui, camera) {
        super(gui)

        this.mouseMovedHandler = ev => this.hiliteTriangle(ev)
        this.mouseDownHandler = ev => this.selectTriangle(ev)
        this.raycaster = new Raycaster()
        this.mouse = new Vector3()
        this.camera = camera
        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute([0,0,0, 0,0,0, 0,0,0], 3))
        geo.setIndex([0,1,2])
        this.triangleHilite = new Mesh(geo, new MeshBasicMaterial({ color: 'red', opacity: 0.5, transparent: true, side: DoubleSide }))
        this.triangleHilite.name = 'trihilite'
        this.triangleHilite.renderOrder = 1000
        this.triangleHilite.material.depthTest = false
        this.triangleHilite.frustumCulled = false
        this.selectedFaceIndex = -1

        this.triangleSelected = new Mesh(geo.clone(), new MeshBasicMaterial({ color: 'blue', opacity: 0.5, transparent: true, side: DoubleSide }))
        this.triangleSelected.name = 'triSelect'
        this.triangleSelected.renderOrder = 1000
        this.triangleSelected.material.depthTest = false
        this.triangleHilite.frustumCulled = false

        this.customGui = null
        this.activeModel = null
        this.guiOps = {
            // Enable/disable flag editing mode
            flagEdit: false,
            // flag status of current triangle
            sfDoubleSided: false,
            sfDarkBack: false,
            sfOpacity: false,
            sfTransparent: false,
            sfMortal: false,
            sfPhong: false,
            sfEnvMap: false,

            scaleMode: 0,
            scaleFactor: 1,
            scale: () => {
                const x = this.guiOps.scaleMode === 0 || this.guiOps.scaleMode == 1 ? this.guiOps.scaleFactor : 1
                const y = this.guiOps.scaleMode === 0 || this.guiOps.scaleMode == 2 ? this.guiOps.scaleFactor : 1
                const z = this.guiOps.scaleMode === 0 || this.guiOps.scaleMode == 3 ? this.guiOps.scaleFactor : 1
                this.scaleModelAndAnims(x, y, z)
            },

            export3DF: () => {
                const model = this.activeModel.userData.cpmData
                const out = save3DF({ ...model, texture: this.createTexture565(), })
               downloadBlob(out, `${this.activeModel.name}.3df`)
            },
            export3DN: () => {
                const model = this.activeModel.userData.cpmData
                const out = save3DN(model)
                downloadBlob(out, `${this.activeModel.name}.3dn`)
            },
            exportCAR: () => {
                const model = this.activeModel.userData.cpmData
                const animations = this.convertAnimations()
                const out = saveCAR({  ...model, animations, texture: this.createTexture565(), })
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
        const self = this
        this.animationOpts = {
            'export VTL': function() {
                if (this.current) { // an animation is active
                    const anim = self.convertAnimation(this.current-1)
                    downloadBlob(saveVTL(anim), `${anim.name}.vtl`)
                }
            },
            'export ANI': function() {
                if (this.current) { // an animation is active
                    const anim = self.convertAnimation(this.current-1)
                    downloadBlob(saveANI(anim), `${anim.name}.ani`)
                }
            },
        }
    }

    animationOptions() {
        return this.animationOpts
    }

    scaleModelAndAnims(xFactor, yFactor, zFactor) {
        // HACK!
        this.activeModel.userData.mixer.stopAllAction()

        // Scale base geometry
        this.activeModel.geometry.scale(xFactor, yFactor, zFactor)

        // Now also scale the imported data, as we're still using that on export for the base model :(
        const { cpmData } = this.activeModel.userData
        cpmData.vertices.forEach(v => {
            v.position[0] *= xFactor
            v.position[1] *= yFactor
            v.position[2] *= zFactor
        })

        // Scale animation vertices
        const newPosition = []
        const { position } = this.activeModel.geometry.morphAttributes
        position?.forEach(attr => {
            const array = []
            for (let i = 0; i < attr.array.length; i+=3) {
                let x = attr.array[i+0] * xFactor
                let y = attr.array[i+1] * yFactor
                let z = attr.array[i+2] * zFactor
                x = Math.floor(x * 16) / 16 // round for conversion to signed int16 later
                y = Math.floor(y * 16) / 16 // round for conversion to signed int16 later
                z = Math.floor(z * 16) / 16 // round for conversion to signed int16 later
                array.push(x, y, z)
            }
            const newAttr = new Float32BufferAttribute(array, 3)
            newAttr.name = attr.name
            newAttr.needsUpdate = true
            newPosition.push(newAttr)
        })

        this.activeModel.geometry.morphAttributes.position = newPosition
        this.activeModel.geometry = this.activeModel.geometry.clone()
        this.activeModel.updateMorphTargets()
    }

    convert(model) {
        const materials = Array.isArray(model.material) ? model.material : [model.material]
        const textures = []
        const remapInfo = []
        materials.forEach(m => {
            if (m.map && !textures.includes(m.map)) textures.push(m.map)
        })

        if (textures.length) {
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
        }

        model.userData.cpmData = this.cpmFromModel(model)

        // Convert animation data
        // (Since it will be scaled down to 16-bit signed integers, 
        // scale values now, so animations will look as they will after export)
        const { position } = model.geometry.morphAttributes
        position?.forEach(attr => {
            for (let i = 0; i < attr.array.length; i++) {
                const v = Math.floor(attr.array[i] * 16) / 16
                attr.array[i] = v
            }
            attr.needsUpdate = true
        })

        model.updateMorphTargets()

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

        let skinIndex = null;
        if (model.isSkinnedMesh && model.skeleton) {
            skinIndex = model.geometry.getAttribute('skinIndex') // u16[4]
            const skeleton = model.skeleton

            // in case we're animating, simply switch to 't-pose' so bones
            // are all in original start position
            model.pose()

            const bonePos = new Vector3()
            skeleton.bones.forEach(o => {
                const findBoneIndex = name => { // Returns index of bone, or -1 if not found
                    return model.skeleton.bones.findIndex(b => b.name === name)
                }

                bonePos.set(0,0,0)
                model.worldToLocal(o.localToWorld(bonePos)) // bone => world => model

                const bone = {
                    name: o.name,
                    parent: o.parent?.isBone ? findBoneIndex(o.parent.name) : -1,
                    position: bonePos.toArray(),
                }
                outModel.bones.push(bone)
            })
        }

        const mapping = []

        const findOrAddVert = (x,y,z, bone) => {
            for (let i = 0; i < outModel.vertices.length; i++) {
                const v = outModel.vertices[i].position
                if (v[0] === x && v[1] === y && v[2] === z) {
                    return i
                }
            }

            const index = outModel.vertices.length
            outModel.vertices.push({
                position: [ x, y, z ],
                bone,
                hide: 0,
            })

            return index
        }

        const { position, uv } = model.geometry.attributes
        const { index } = model.geometry
        if (index) {
            // Indexed geometry, we can keep things simple

            // First, simply copy the vertices
            let v = new Vector3()
            for (let i = 0; i < position.count; i++) {
                outModel.vertices.push({
                    position: [ position.getX(i), position.getY(i), position.getZ(i) ],
                    bone: skinIndex ? skinIndex.getX(i) : -1,
                    hide: 0,
                })
            }

            // Now create the triangles
            for (let i = 0; i < index.count; i += 3) {
                // get vertex indices
                const a = index.array[i+0], b = index.array[i+1], c = index.array[i+2]
                mapping[a] = a
                mapping[b] = b
                mapping[c] = c
                outModel.faces.push({
                    indices: [ a, b, c ],
                    uvs: [
                        uv.getX(a) * 256, uv.getY(a) * 256,
                        uv.getX(b) * 256, uv.getY(b) * 256,
                        uv.getX(c) * 256, uv.getY(c) * 256,
                    ],
                    flags: 0,
                    dmask: 0,
                    distant: 0,
                    next: 0,
                    group: 0,
                })
            }
        } else {
            // Loop over all triangles
            for (let i = 0; i < position.count; i += 3) {
                const indices = []
                const uvs = []
                // Get the three indices (and collect uv while we're at it)
                for (let j = 0; j < 3; j++) {
                    const x = position.getX(i + j),
                        y = position.getY(i + j),
                        z = position.getZ(i + j)
                    const boneIndex = skinIndex ? skinIndex.getX(i + j) : -1
                    const vIdx = findOrAddVert(x,y,z, boneIndex)
                    indices.push( vIdx )
                    mapping.push( vIdx )
                    uvs.push(
                        Math.floor(uv.getX(i + j) * 256),
                        Math.floor(uv.getY(i + j) * 256),
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
        }

        outModel.mapping = mapping

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
        return setLinearFilters(new DataTexture(dst.data, dst.width, dst.height, RGBAFormat, UnsignedByteType))
    }

    async loadFile(url, ext, baseName) {
        switch(ext) {
            case '3df': return await this.load3DF(url, baseName)
            case 'car': return await this.loadCAR(url, baseName)
            case '3dn': return await this.load3DN(url, baseName)
            case 'vtl': return this.activeModel ? await this.loadVTL(url, baseName) : []
            case 'ani': return this.activeModel ? await this.loadANI(url, baseName) : []
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
            const editFlagsChanged = turnOn => {
            this.triangleHilite.visible = turnOn
            this.triangleSelected.visible = turnOn
            if (turnOn) {
                    flagsFolder.controllersRecursive().forEach(c => c.enable())
                    flagsFolder.open()
                    document.addEventListener('mousemove', this.mouseMovedHandler, true)
                    document.addEventListener('click', this.mouseDownHandler, true)
                } else {
                    flagsFolder.controllersRecursive().forEach(c => c.disable())
                    flagsFolder.close()
                    document.removeEventListener('mousemove', this.mouseMovedHandler, true)
                    document.removeEventListener('click', this.mouseDownHandler, true)
                }
            }
            this.customGui = this.gui.addFolder('Carnivores')
            this.customGui.add(this.guiOps, 'export3DF').name('Export 3DF')
            this.customGui.add(this.guiOps, 'export3DN').name('Export 3DN')
            this.customGui.add(this.guiOps, 'exportCAR').name('Export CAR')
            this.customGui.add(this.guiOps, 'exportTGA32').name('Export 32-bit TGA')
            this.customGui.add(this.guiOps, 'exportTGA16').name('Export 16-bit TGA')
            this.customGui.add(this.guiOps, 'flagEdit').name('Edit Flags').onChange(editFlagsChanged)
            const flagsFolder = this.customGui.addFolder('Flags')
            const setBitFlag = (bit, turnOn) => {
                const cpmData = this.activeModel?.userData.cpmData
                if (cpmData && this.guiOps.flagEdit) {
                    if (turnOn) {
                        cpmData.faces[this.selectedFaceIndex].flags |= bit
                    } else {
                        cpmData.faces[this.selectedFaceIndex].flags &= ~bit
                    }
                }
            }
            flagsFolder.add(this.guiOps, 'sfDoubleSided').listen().onChange(v => setBitFlag(1, v)).disable()
            flagsFolder.add(this.guiOps, 'sfDarkBack').listen().onChange(v => setBitFlag(2, v)).disable()
            flagsFolder.add(this.guiOps, 'sfOpacity').listen().onChange(v => setBitFlag(4, v)).disable()
            flagsFolder.add(this.guiOps, 'sfTransparent').listen().onChange(v => setBitFlag(8, v)).disable()
            flagsFolder.add(this.guiOps, 'sfMortal').listen().onChange(v => setBitFlag(16, v)).disable()
            flagsFolder.add(this.guiOps, 'sfPhong').listen().onChange(v => setBitFlag(32, v)).disable()
            flagsFolder.add(this.guiOps, 'sfEnvMap').listen().onChange(v => setBitFlag(64, v)).disable()
            flagsFolder.close()
            this.customGui.add(this.guiOps, 'scaleMode', { XYZ: 0, X: 1, Y: 2, Z: 3 })
            this.customGui.add(this.guiOps, 'scaleFactor')
            this.customGui.add(this.guiOps, 'scale')
        }
        this.activeModel = model
    }

    hiliteTriangle(ev) {
        if (ev.target.tagName !== 'CANVAS') return

        this.mouse.x = ( ev.clientX / window.innerWidth ) * 2 - 1
        this.mouse.y = - ( ev.clientY / window.innerHeight ) * 2 + 1

        // update the picking ray with the camera and pointer position
        this.raycaster.setFromCamera(this.mouse, this.camera)

        // calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObject(this.activeModel)
        if (intersects.length > 0) {
            const hiPos = this.triangleHilite.geometry.getAttribute('position')
            const mdlPos = this.activeModel.geometry.getAttribute('position')
            const i = intersects[0]
            if (i.faceIndex !== this.lastFaceIndex) {
                hiPos.array[0] = mdlPos.array[i.face.a * 3 + 0]
                hiPos.array[1] = mdlPos.array[i.face.a * 3 + 1]
                hiPos.array[2] = mdlPos.array[i.face.a * 3 + 2]
                hiPos.array[3] = mdlPos.array[i.face.b * 3 + 0]
                hiPos.array[4] = mdlPos.array[i.face.b * 3 + 1]
                hiPos.array[5] = mdlPos.array[i.face.b * 3 + 2]
                hiPos.array[6] = mdlPos.array[i.face.c * 3 + 0]
                hiPos.array[7] = mdlPos.array[i.face.c * 3 + 1]
                hiPos.array[8] = mdlPos.array[i.face.c * 3 + 2]
                hiPos.needsUpdate = true
                this.lastFaceIndex = i.faceIndex
            }

            this.triangleHilite.visible = true
            if (this.triangleHilite.parent !== this.activeModel) {
                this.activeModel.add(this.triangleHilite)
            }

            return i
        }

        this.triangleHilite.visible = false

        return null
    }

    setFlags(flags) {
        this.guiOps.sfDoubleSided = (flags & 1) !== 0
        this.guiOps.sfDarkBack = (flags & 2) !== 0
        this.guiOps.sfOpacity =  (flags & 4) !== 0
        this.guiOps.sfTransparent = (flags & 8) !== 0
        this.guiOps.sfMortal = (flags & 16) !== 0
        this.guiOps.sfPhong =  (flags & 32) !== 0
        this.guiOps.sfEnvMap =  (flags & 64) !== 0
    }

    getFlags() {
        return  this.guiOps.sfDoubleSided   ?  1 : 0 |
                this.guiOps.sfDarkBack      ?  2 : 0 |
                this.guiOps.sfOpacity       ?  4 : 0 |
                this.guiOps.sfTransparent   ?  8 : 0 |
                this.guiOps.sfMortal        ? 16 : 0 |
                this.guiOps.sfPhong         ? 32 : 0 |
                this.guiOps.sfEnvMap        ? 64 : 0
            ;
    }

    selectTriangle(ev) {
        if (ev.target.tagName !== 'CANVAS') return

        // Determine triangle and hit pos, show selected triangle
        const i = this.hiliteTriangle(ev)
        if (i) {
            this.triangleSelected.geometry = this.triangleHilite.geometry.clone()
            this.triangleSelected.geometry.needsUpdate = true

            if (this.triangleSelected.parent !== this.activeModel) {
                this.activeModel.add(this.triangleSelected)
            }

            const { flags } = this.activeModel.userData.cpmData.faces[i.faceIndex]
            this.selectedFaceIndex = i.faceIndex
            this.setFlags(flags)
        }
    }

    async loadCRT(url, baseName) {
        const crt = loadCRT(await this.loadFromURL(url))
        const tex = new DataTexture(crt.data, crt.width, crt.height, RGBAFormat, UnsignedByteType)
        setLinearFilters(tex)
        tex.name = baseName
        return [{
            type: DataType.Texture,
            texture: tex,
        }]
    }

    async load3DF(url, baseName) {
        const buf = await this.loadFromURL(url)
        const dv = new DataView(buf, 0, 4)
        if (dv.getUint32(0, true) === 0x7665694B) { // "Kiev"
            // Animator 3DF format
            return await this.loadA3DF(buf, baseName)
        } else {
            // "Standard" 3DF format
            const data = load3DF(buf).model
            data.name = baseName
            const tex = this.convertTexture(data.texture, data.textureSize, baseName)
            const result = [
                { type: DataType.Model, model: this.createMeshFromModel(data, tex, baseName) },
            ]

            if (tex) { // we could have a zero byte texture
                result.push({
                    type: DataType.Texture,
                    texture: tex,
                })
            }

            return result
        }
    }

    async loadA3DF(buf, baseName) {
        const parsed = new A3DF(new KaitaiStream(buf))
        const convuv = (f4) => Math.floor(f4 * 256)
        const data = {
            name: baseName,
            vertices: parsed.vertices.map(v => ({
                position: [ v.x, v.y, v.z ],
                bone: v.owner,
                hide: v.hide,
            })),
            faces: parsed.faces.map(f => ({
                indices: [ f.a, f.b, f.c ],
                uvs: [ convuv(f.tax), convuv(f.tay), convuv(f.tbx), convuv(f.tby), convuv(f.tcx), convuv(f.tcy) ],
                flags: f.flags,
                dmask: 0,
                distant: 0,
                next: 0,
                group: 0,
            })),
            bones: parsed.bones.map(b => ({
                name: b.name,
                position: [ b.x, b.y, b.z ],
                parent: b.owner,
                hidden: b.hide,
            })),
            textureSize: 0, // we're ignoring the texture for now
            texture: undefined,
        }

        return [
            { type: DataType.Model, model: this.createMeshFromModel(data, null, baseName) },
        ]
    }

    async load3DN(url, baseName) {
        const data = load3DN(await this.loadFromURL(url))
        data.name = baseName
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
                type: DataType.Texture,
                texture: tex,
            })
        }

        return result
    }

    async loadVTL(url, baseName) {
        // TODO: make sure baseName is a unique animation name....
        const data = loadVTL(await this.loadFromURL(url))
        const anim = this.generateAnimation(data, baseName, true)
        return anim ? [
            { type: DataType.Animation, animation: anim },
        ] : []
    }

    async loadANI(url, baseName) {
        const data = loadANI(await this.loadFromURL(url))
        const anim = this.generateAnimation(data, baseName, true)
        return anim ? [
            { type: DataType.Animation, animation: anim },
        ] : []
    }

    generateAnimation(data, baseName, ensureUnique) {
        const { cpmData } = this.activeModel.userData
        // If animation doesn't match model, forget about it
        if (cpmData.vertices.length !== data.vertCount) {
            return null
        }

        if (ensureUnique) {
            // Make sure baseName is a unique animation name
            while( this.activeModel.animations?.find(anim => anim.name === baseName) )
                baseName += "_dup"
        }

        // !!! If there's no animations yet, create the empty array
        if (!this.activeModel.geometry.morphAttributes.position) {
            this.activeModel.geometry.morphAttributes.position = []
        }

        const { mapping } = cpmData
        const cmmVertCount = this.activeModel.geometry.attributes.position.count
        const { position } = this.activeModel.geometry.morphAttributes
        const seq = []
        for (let i = 0; i < data.frameCount; i++) {
            const frame = []
            const frameOffset = i * data.vertCount * 3
            for (let j = 0; j < cmmVertCount; j++) {
                const index = frameOffset + (mapping[j] * 3)
                frame.push(
                    data.frames[index+0] / 16,
                    data.frames[index+1] / 16,
                    data.frames[index+2] / 16,
                )
            }
            const attr = new Float32BufferAttribute(frame, 3)
            attr.name = `${baseName}.${i}`
            position.push(attr)
            seq.push({
                name: attr.name,
                vertices: [],
            })
        }
        const clip = AnimationClip.CreateFromMorphTargetSequence(
            baseName,
            seq,
            data.fps,
            false /*noLoop*/
        )
        clip.userData = { fps: data.fps }
        return clip
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
    
        const totalFrames = animations?.reduce((a,b) => a + b.frameCount, 0)

        if (totalFrames) {
            for (let i = 0; i < totalFrames; i++) {
                morphVertices[i] = []
            }
        }

        const skinIndices = []
        const skinWeights = []

        const mapping = []
        model.faces.forEach(f => {
            for (let i = 0; i < 3; i++) {
                const vIdx = f.indices[i]
                const v = model.vertices[vIdx]
                position.push(
                    v.position[0],
                    v.position[1],
                    v.position[2],
                )
                mapping.push(vIdx)
                skinIndices.push(v.bone, 0, 0, 0)
                skinWeights.push(1, 0, 0, 0)

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
                f.uvs[0] / 256, f.uvs[1] / 256,
                f.uvs[2] / 256, f.uvs[3] / 256,
                f.uvs[4] / 256, f.uvs[5] / 256,
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

        const mat = tex ? new MeshBasicMaterial({ map: tex }) : new MeshNormalMaterial({ side: DoubleSide })

        let obj;
        if (model.bones?.length > 1) {
            // We have bones, so set the skin data
            geo.setAttribute( 'skinIndex', new Uint16BufferAttribute( skinIndices, 4 ) );
            geo.setAttribute( 'skinWeight', new Float32BufferAttribute( skinWeights, 4 ) );

            let v1 = new Vector3(), v2 = new Vector3()
            const bones = []
            model.bones.forEach(bone => {
                const b = new Bone()
                b.name = bone.name.toLowerCase()
                v1.fromArray(bone.position)
                const parent = bone.parent
                if (parent !== -1) {
                    v2.fromArray(model.bones[parent].position)
                    v1.sub(v2)
                    bones[parent].add(b)
                }
                b.position.copy(v1)
                bones.push(b)
            })
            obj = new SkinnedMesh( geo, mat );
            const skeleton = new Skeleton( bones );
            obj.add( skeleton.bones[ 0 ] );
            obj.bind( skeleton );
        } else {
            obj = new Mesh(geo, mat)
        }
        obj.name = baseName

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
                clip.userData = { fps: ani.fps }
                obj.animations.push(clip)
            })
        }

        // Patch in sound assignments
        if (model.soundMap) {
            obj.animations.forEach((clip, idx) => {
                const sndIdx = model.soundMap[idx]
                clip.audio = model.sounds[sndIdx]
            })
        }

        mat.name = model.name || baseName
        obj.name = model.name || baseName
        model.mapping = mapping
        obj.userData.cpmData = model

        return obj
    }

    convertAnimation(idx) {
        const { cpmData } = this.activeModel.userData
        const { mapping } = cpmData
        const { position } = this.activeModel.geometry.morphAttributes

        const cmmAnim = this.activeModel.animations[idx]

        // Get first frame index
        let frameIndex = position.findIndex(attr => attr.name === `${cmmAnim.name}.0`)
        if (frameIndex === -1) {
            return undefined // bail if not found
        }

        const frames = []
        let frameCount = 0
        // Add all frames to animation
        do {
            const attr = position[frameIndex]
            const frame = new Array(cpmData.vertices.length * 3).fill(0)
            for (let i = 0; i < attr.count; i++) {
                const targetVIdx = mapping[i]
                frame[targetVIdx*3 + 0] = Math.floor(attr.array[i*3+0] * 16)
                frame[targetVIdx*3 + 1] = Math.floor(attr.array[i*3+1] * 16)
                frame[targetVIdx*3 + 2] = Math.floor(attr.array[i*3+2] * 16)
            }
            frames.push.apply(frames, frame)
            frameCount++
            frameIndex++
        } while(frameIndex < position.length &&
                position[frameIndex].name === `${cmmAnim.name}.${frameCount}`)

        return {
            name: cmmAnim.name,
            frameCount: frameCount,
            vertCount: cpmData.vertices.length,
            frames,
            fps: cmmAnim.userData.fps,
        }
    }

    convertAnimations() {
        const anims = this.activeModel.animations.map((_,i) => this.convertAnimation(i))
        return anims
    }

    createTexture565() {
        let tex = this.activeModel?.material?.map

        // bail out if no current texture
        if (!tex || !tex.image) return undefined
    
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
            return null
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
        setLinearFilters(tex)
        tex.name = baseName

        return tex
    }
}
