// TODO:
//  - remove "Normal" material

import {
    AnimationClip,
    Box3,
    BufferGeometry,
    DataTexture,
    Float32BufferAttribute,
    Mesh,
    MeshNormalMaterial,
    RGBAFormat,
    UnsignedByteType,
    Vector3,
} from 'three'

import { DataType, Plugin } from './plugin.js'

import { KaitaiStream } from 'kaitai-struct'
import SSM from '../kaitai/primalprey_ssm.js'
import STX from '../kaitai/sunstorm_stx.js'

const scale = 32

export class PrimalPreyPlugin extends Plugin {
    constructor(gui) {
        super(gui)
        this.activeModel = null;
        this.guiOps = {
            reset_origin: () => {
                if (this.activeModel) {
                    let bb = new Box3();
                    bb.setFromObject(this.activeModel);
                    let x = bb.min.x + (bb.max.x - bb.min.x) / 2
                    let z = bb.min.z + (bb.max.z - bb.min.z) / 2
                    let xlate = new Vector3(-x, -bb.min.y, -z);

                    // Following is _very_ similar to scaleModelAndAnims, refactor into some applyMatrix4() function?
                    // HACK!
                    this.activeModel.userData.mixer.stopAllAction()
            
                    // Move base geometry
                    this.activeModel.geometry.translate(xlate.x, xlate.y, xlate.z)
            
                    // Move animation vertices
                    const newPosition = []
                    const { position } = this.activeModel.geometry.morphAttributes
                    position?.forEach(attr => {
                        const array = []
                        for (let i = 0; i < attr.array.length; i+=3) {
                            let x = attr.array[i+0] + xlate.x
                            let y = attr.array[i+1] + xlate.y
                            let z = attr.array[i+2] + xlate.z
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
            }
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
            this.customGui = this.gui.addFolder('PrimalPrey')
            this.customGui.add(this.guiOps, 'reset_origin').name('Reset Origin');
        }
        this.activeModel = model
    }
    
    async loadFile(url, ext, baseName) {
        if (ext == 'ssm') {
            const model = this.loadModel(await this.loadFromURL(url), baseName)
            return [
                { type: DataType.Model, model: model },
            ]
        } else if (ext == 'stx') {
            const tex = this.loadTexture(await this.loadFromURL(url), baseName)
            return tex ? [{ type: DataType.Texture, texture: tex }] : []
        }
    }

    loadTexture(buffer, baseName) {
        const parsed = new STX(new KaitaiStream(buffer))
        console.log(parsed)
        if (parsed.format === '888' || parsed.format === '8888') {
            const { width, height, rgb, alpha } = parsed.mipmaps[0];
            const hasAlpha = parsed.format === '8888';
            const data = new Uint8ClampedArray(width * height * 4);
            let idx = 0;
            for (let i = 0; i < data.length; i += 4) {
                data[i+2] = rgb[idx++]; // B
                data[i+1] = rgb[idx++]; // G
                data[i+0] = rgb[idx++]; // R
                data[i+3] = hasAlpha ? alpha[i/4] : 255;
            }
            const tex = new DataTexture(data, width, height, RGBAFormat, UnsignedByteType);
            tex.name = baseName;
            tex.needsUpdate = true;
            return tex;
        }
        return null;
    }

    loadModel(buffer, baseName) {
        const parsed = new SSM(new KaitaiStream(buffer))

        const geo = new BufferGeometry()
        const position = []
        const uv = []
        const vertices = parsed.frames[0].vertices
        const groups = [] // { start, count, materialIndex }
        let meshId = -1
        const mapping = [] // geometry vertices to data vertices
        parsed.faces.forEach(f => {
            // Build material groups
            if (f.meshId != meshId) {
                if (meshId != -1) {
                    const grp = groups[groups.length-1]
                    grp.count = (position.length / 3) - grp.start
                }
                groups.push({ start: position.length / 3, count: -1, materialIndex: groups.length })
                meshId = f.meshId
            }
            const a = f.vertices[0], b = f.vertices[1], c = f.vertices[2]
            position.push(
                vertices[a].x * scale, vertices[a].z * scale, vertices[a].y * scale,
                vertices[b].x * scale, vertices[b].z * scale, vertices[b].y * scale,
                vertices[c].x * scale, vertices[c].z * scale, vertices[c].y * scale,
            )
            mapping.push(a, b, c)
            uv.push(
                f.uvs[0], f.uvs[1],
                f.uvs[2], f.uvs[3],
                f.uvs[4], f.uvs[5],
            )
        })
        const grp = groups[groups.length-1]
        grp.count = (position.length / 3) - grp.start

        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
        groups.forEach(({ start, count, materialIndex }) => geo.addGroup(start, count, materialIndex))
        geo.computeVertexNormals()

        const mat = []
        groups.forEach(g => {
            const m = new MeshNormalMaterial()
            m.name = parsed.objects[g.materialIndex]?.name || `material${g.materialIndex}`
            mat.push(m)
        })

        // Build frame list based on unrolled faces
        const frames = []
        parsed.frames.forEach(frm => {
            const frame = []
            mapping.forEach(m => {
                frame.push(
                    frm.vertices[m].x * scale,
                    frm.vertices[m].z * scale,
                    frm.vertices[m].y * scale,
                )
            })
            frames.push(frame)
        })

        // Setup the actual animation data
        const clips = []
        if (parsed.animations.length) {
            geo.morphAttributes.position = []
            parsed.animations.forEach(ani => {
                const seq = []
                ani.frameIndices.forEach((fr,i) => {
                    const attr = new Float32BufferAttribute(frames[fr], 3)
                    attr.name = `${ani.name}.${i}`
                    seq.push({
                        name: attr.name,
                        vertices: [],
                    })
                    geo.morphAttributes.position.push(attr)
                })
                const duration = ani.frameDurations.reduce((a,b) => a+b, 0)
                const fps = ani.frameIndices.length / duration
                const clip = AnimationClip.CreateFromMorphTargetSequence(
                    `${ani.name}`,
                    seq,
                    fps,
                    false /*noLoop*/
                )
                clip.userData = { fps }
                clips.push(clip)
            })
        }

        const mesh = new Mesh(geo, mat)
        mesh.name = baseName
        mesh.animations = clips

        return mesh
    }

    supportedExtensions() {
        return [ 'ssm', 'stx' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Primal Prey (Model)"
    }
}
