// SCCS' Prism3D engine support
import { DataType, Plugin } from './plugin.js'

import { KaitaiStream } from 'kaitai-struct'

import PSM from '../kaitai/prism3d_psm.js'
import PMD from '../kaitai/prism3d_pmd.js'
import PMG from '../kaitai/prism3d_pmg.js'
import GDT from '../kaitai/prism3d_gdt.js'

import {
    AnimationClip,
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    Mesh,
    MeshNormalMaterial,
    MeshBasicMaterial,
} from 'three'

import { downloadBlob } from '../utils.js'

export class Prism3DPlugin extends Plugin {
    constructor(gui) {
        super(gui)

        this.customGui = null
        this.activeModel = null

        const self = this
        this.guiOps = {
            exportPMD: () => {
                const model = this.activeModel
                const out = self.saveAsPMD(this.activeModel)
                downloadBlob(out, `${this.activeModel.name}.pmd`)
            },
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
            this.customGui = this.gui.addFolder('Prism3D')
            this.customGui.add(this.guiOps, 'exportPMD').name('Export PMD')
        }
        this.activeModel = model
    }

    async loadFile(url, ext, baseName) {
        switch(ext) {
            case 'psm':
                return this.loadPSM(await this.loadFromURL(url), baseName)
            case 'pmd':
                return this.loadPMD(await this.loadFromURL(url), baseName)
            case 'pmg':
                return this.loadPMG(await this.loadFromURL(url), baseName)
            case 'gdt':
                return this.loadGDT(await this.loadFromURL(url), baseName)
        }

        return undefined
    }

    loadGDT(buffer, baseName) {
        const parsed = new GDT(new KaitaiStream(buffer))
        console.log(parsed)

        const position = []
        const index = []

        parsed.models.forEach(m => {
            const off = position.length / 3
            m.vertices.forEach(v => position.push(v.x, v.y, v.z))
            //m.colors.forEach(v => colors.push(...))
            m.indices.forEach(i => index.push(off + i))
            //m.uv.forEach(...)
        })

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setIndex(index)
        geo.computeVertexNormals() // for now, should probably just use included normals

        const mat = new MeshNormalMaterial({ /*side: DoubleSide*/ })
        mat.name = baseName
        const mesh = new Mesh(geo, mat)
        mesh.name = baseName

        return [
            { type: DataType.Model, model: mesh },
        ]
    }

    loadPMG(buffer, baseName) {
        const parsed = new PMG(new KaitaiStream(buffer))
        console.log(parsed)

        const position = []
        const normals = []
        const colors = []
        const uvs = []
        const obj = parsed.objects[0]
        obj.vertices.forEach(v => position.push(v.x, v.y, v.z))
        obj.normals.forEach(v => normals.push(v.x, v.y, v.z))
        obj.colors.forEach(v => colors.push(v.r / 255, v.g / 255, v.b / 255, v.a / 255))
        obj.uvs.forEach(v => uvs.push(v.x, v.y))

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('normal', new Float32BufferAttribute(normals, 3))
        geo.setAttribute('color', new Float32BufferAttribute(colors, 4))
        geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
        geo.setIndex(obj.indices)

        const mat = new MeshBasicMaterial({ vertexColors: true, side: DoubleSide })
        mat.name = baseName
        const mesh = new Mesh(geo, mat)
        mesh.name = baseName

        return [
            { type: DataType.Model, model: mesh },
        ]
    }

    loadPMD(buffer, baseName) {
        const parsed = new PMD(new KaitaiStream(buffer))
        console.log(parsed)

        const position = []
        const uvs = []
        const index = []
        const groups = []
        parsed.objects.forEach(obj => {
            const idxOffset = position.length / 3
            // NOTE: not using forEach since `vertices` is duplicated for every morphtarget
            for (let i = 0; i < obj.vertexCount; i++) {
                const v = obj.vertices[i]
                const uv = obj.uvs[i]
                position.push(
                    v.x * parsed.scale.x,
                    v.y * parsed.scale.y,
                    v.z * parsed.scale.z
                )
                uvs.push(uv.x, uv.y)
            }
            groups.push({
                start: index.length, // as long as this is before we update `index`, we're all good
                count: obj.indices.length,
                materialIndex: groups.length,
            })
            obj.indices.forEach(i => index.push(idxOffset + i))
        })

        const morphVertices = []
        for (let i = 0; i < parsed.morphTargetCount; i++) {
            const frame = []
            parsed.objects.forEach(obj => {
                const vOff = i * obj.vertexCount
                for (let j = 0; j < obj.vertexCount; j++) {
                    const v = obj.vertices[vOff + j]
                    frame.push(
                        v.x * parsed.scale.x,
                        v.y * parsed.scale.y,
                        v.z * parsed.scale.z
                    )
                }
            })
            morphVertices.push(frame)
        }


        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
        geo.setIndex(index)
        geo.computeVertexNormals()
        geo.computeBoundingBox()
        groups.forEach(({start, count, materialIndex}) => geo.addGroup(start, count, materialIndex))

        if (parsed.morphTargetCount > 1) {
            // Add animation data
            geo.morphAttributes.position = []
            parsed.animations.forEach((ani, idx) => {
                const { name } = parsed.animationHeaders[idx]
                let frIdx = 0
                ani.indices.forEach(i => {
                    const attr = new Float32BufferAttribute(morphVertices[i], 3)
                    attr.name = `${name}.${frIdx++}`
                    geo.morphAttributes.position.push(attr)
                })
            })
        }
       
        const mat = []
        parsed.objects.forEach((_,idx) => {
            const { name } = parsed.objectHeaders[idx]
            mat.push(
                new MeshNormalMaterial({ name, side: DoubleSide })
            )
        })
        const mesh = new Mesh(geo, mat)
        mesh.name = baseName


        if (morphVertices.length > 1) {
            for (let i = 0; i < parsed.animationCount; i++) {
                const ani = parsed.animationHeaders[i]
                const seq = []
                for (let i = 0; i < ani.frameCount; i++) {
                    seq.push({
                        name: `${ani.name}.${i}`,
                        vertices: [], // seems unused
                    })
                }
                const fps = ani.fps
                const clip = AnimationClip.CreateFromMorphTargetSequence(
                    `${ani.name}`,
                    seq,
                    fps,
                    false /*noLoop*/
                )
                clip.userData = { fps }
                mesh.animations.push(clip)
            }
        }

        return [
            { type: DataType.Model, model: mesh },
        ]
    }

    loadPSM(buffer, baseName) {
        const parsed = new PSM(new KaitaiStream(buffer))
        console.log(parsed)

        const position = []
        const uv = []
        const obj = parsed.objects[0]
        obj.vertices.forEach(v => position.push(v.x, v.y, v.z))
        obj.uvs.forEach(v => uv.push(v.x, v.y))

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
        geo.setIndex(obj.indices)
        geo.computeVertexNormals() // for now, should probably just use included normals

        const mat = new MeshNormalMaterial()
        mat.name = baseName
        const mesh = new Mesh(geo, mat)
        mesh.name = baseName

        return [
            { type: DataType.Model, model: mesh },
        ]
    }

    // returns an ArrayBuffer with PMD content representing 'obj3d'
    saveAsPMD(obj3d) {
        // Get or create index (to handle non-indexed geometry)
        console.log(obj3d)
        const geo = obj3d.geometry
        const index = geo.index?.array || []
        const vertexCount = geo.attributes.position.count
        const morphTargetCount = obj3d.geometry.morphAttributes.position?.length || 0
        if (index.length === 0) {
            for (let i = 0; i < vertexCount; i++)
                index.push(i)
        }

        // NOTE: This currently assumes only morphTarget animations, and quite a specific configuration of that
        //       Once we get support for skeleton-based animations, this iwll have to be changed!
        const totalAnimationFramesCount = obj3d.animations.reduce((count, anim) => count + anim.tracks.length, 0)
            + 1 // for our one-frame "default" animation, per PMD format

        const animationCount = obj3d.animations.length
            + 1 // for our one-frame "default" animation, per PMD format

        const bufSize = 4 +                                 // version
                        4 +                                 // object count
                        16 * 28 +                           // object headers
                        4 +                                 // morph target count
                        4 +                                 // animation count
                        24 +                                // bounding box
                        12 +                                // scale
                        192 +                               // unknown
                        64 * 52 +                           // animation headers
                                                            // geometry:
                        index.length * 2 +                  //    indices
                        (morphTargetCount +1) *
                        vertexCount * 7 +                   //    vertices
                        vertexCount * 8 +                   //    uvs
                        totalAnimationFramesCount * 8 +     // animation data
                        0

        const buffer = new ArrayBuffer(bufSize)
        const dv = new DataView(buffer)
        dv.setUint32(0, 8, true) // v8 => Shark! Hunting the Great White
        dv.setUint32(4, 1, true) // object count (TODO: use geo.groups)
        // Write object header(s)
        let off = 8
        const nameLen = Math.min(obj3d.name.length, 15)
        for (let i = 0; i < nameLen; i++) {
            dv.setUint8(off++, obj3d.name.charCodeAt(i))
        }
        for (let i = 0; i < 16 - nameLen; i++) {
            dv.setUint8(off++, 0)
        }
        dv.setUint32(off, index.length / 3, true)
        dv.setUint32(off + 4, vertexCount, true)
        dv.setUint32(off + 8, 1, true) // present flag
        off += 12

        // Clear rest of object header table
        for (let i = 0; i < 15 * 28; i++) { // max 16 objects
            dv.setUint8(off++, 0)
        }

        dv.setUint32(off, morphTargetCount +1, true) // morph target count (include "base" set of vertices, hence +1)
        dv.setUint32(off + 4, animationCount, true) // animation count
        off += 8

        // Store boundingbox and scale values
        geo.computeBoundingBox()
        dv.setFloat32(off + 0, geo.boundingBox.min.x, true)
        dv.setFloat32(off + 4, geo.boundingBox.min.y, true)
        dv.setFloat32(off + 8, geo.boundingBox.min.z, true)
        dv.setFloat32(off + 12, geo.boundingBox.max.x, true)
        dv.setFloat32(off + 16, geo.boundingBox.max.y, true)
        dv.setFloat32(off + 20, geo.boundingBox.max.z, true)
        off += 24
        const scale = 1 / 16 // For now, take standard Carnivores scaling value
        dv.setFloat32(off + 0, scale, true)
        dv.setFloat32(off + 4, scale, true)
        dv.setFloat32(off + 8, scale, true)
        off += 12

        // ???? no idea what this area is for...
        for (let i = 0; i < 192; i++) {
            dv.setUint8(off++, 0)
        }

        function writeAnim(name, frameCount, fps, duration) {
            dv.setUint32(off + 0, frameCount, true)
            dv.setFloat32(off + 4, fps, true)
            dv.setFloat64(off + 8, duration, true)
            off += 12
            const animNameLen = Math.min(name.length, 31)
            for (let i = 0; i < animNameLen; i++) {
                dv.setUint8(off++, name.charCodeAt(i))
            }
            for (let i = 0; i < 32 - animNameLen; i++) {
                dv.setUint8(off++, 0)
            }
            dv.setUint32(off + 0, 10884396, true) // ???
            dv.setUint32(off + 4, 10884400, true) // ???
            off += 8   
        }

        // Write first animation
        writeAnim('default', 1, 17.8, 1.5)
        // Now write all other animations
        obj3d.animations.forEach(clip => {
            writeAnim(clip.name,
                clip.tracks.length,
                clip.tracks.length / clip.duration,
                clip.duration,
            )
        })

        // Clear rest of animation header table
        for (let i = 0; i < (64 - animationCount) * 52; i++) { // max 64 animations
            dv.setUint8(off++, 0)
        }
    
        // Now it is finally time to write the actually geometry data
        index.forEach(i => {
            dv.setUint16(off, i, true)
            off += 2
        })
        const pos = geo.attributes.position
        for (let i = 0; i < pos.count; i++) {
            dv.setInt16(off + 0, Math.floor(pos.getX(i) / scale), true)
            dv.setInt16(off + 2, Math.floor(pos.getY(i) / scale), true)
            dv.setInt16(off + 4, Math.floor(pos.getZ(i) / scale), true)
            dv.setUint8(off + 6, 0) // ???
            off += 7
        }
        if (morphTargetCount) {
            // morphtargets are added to the vertex pool, so we need to write them out here
            const { position } = obj3d.geometry.morphAttributes
            position.forEach(attr => {
                for (let i = 0; i < attr.count; i++) {
                    dv.setInt16(off + 0, Math.floor(attr.getX(i) / scale), true)
                    dv.setInt16(off + 2, Math.floor(attr.getY(i) / scale), true)
                    dv.setInt16(off + 4, Math.floor(attr.getZ(i) / scale), true)
                    dv.setUint8(off + 6, 0) // ???
                    off += 7        
                }
            })
        }
        const uv = geo.attributes.uv
        for (let i = 0; i < uv.count; i++) {
            dv.setFloat32(off + 0, uv.getX(i), true)
            dv.setFloat32(off + 4, uv.getY(i), true)
            off += 8
        }

        // Animation data is next

        // Default animation (fixed, is the "static" object)
        dv.setUint32(off + 0, 0, true) // indices
        dv.setFloat32(off + 4, 1, true) // weights
        off += 8

        // Write other animation data
        let idx = 1
        obj3d.animations.forEach(anim => {
            //const weight = anim.frameRate / anim.frameCount
            const count = anim.tracks.length
            for (let i = 0; i < count; i++) {
                dv.setUint32(off, idx + i, true)
                off += 4
            }
            for (let i = 0; i < count; i++) {
                dv.setFloat32(off, 1, true)
                off += 4
            }
            idx += count
        })

        return buffer
    }

    supportedExtensions() {
        return [ 'psm', 'pmd', 'pmg', 'gdt' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Prism3D (Model)"
    }
}
