import {
    AnimationClip,
    BufferGeometry,
    DataTexture,
    Float32BufferAttribute,
    Mesh,
    MeshNormalMaterial,
    RGBAFormat,
    UnsignedByteType,
} from 'three'

import { DataType, Plugin } from './plugin.js'
import { KaitaiStream } from 'kaitai-struct'
import MDL from '../kaitai/serious1_mdl.js'
import TEX from '../kaitai/serious1_tex.js'

const scale = 32

export class CityscapePlugin extends Plugin {
    async loadFile(url, ext, baseName) {
        switch(ext) {
            case 'tex': return await this.loadTexture(url, baseName)
            case 'mdl': return await this.loadModel(url, baseName)
        }
    }

    async loadTexture(url, baseName) {
        const parsed = new TEX(new KaitaiStream(await this.loadFromURL(url)))
        const frame = parsed.frames[0]
        const pixelCount = frame.width * frame.height
        const bytesPerPixel = parsed.bytesPerPixel
        const data = new Uint8ClampedArray(pixelCount * 4)
        for (let i = 0; i < pixelCount; i++) {
            data[i*4 + 0] = frame.pixels[i*bytesPerPixel + 0]
            data[i*4 + 1] = frame.pixels[i*bytesPerPixel + 1]
            data[i*4 + 2] = frame.pixels[i*bytesPerPixel + 2]
            data[i*4 + 3] = bytesPerPixel === 3 ? 255 : frame.pixels[i*bytesPerPixel + 3]
        }

        const tex = new DataTexture(data, frame.width, frame.height, RGBAFormat, UnsignedByteType)
        tex.name = baseName
        return [{
            type: DataType.Texture,
            texture: tex,
        }]
    }

    buildLOD(parsed, lodIdx) {
        const mipInfo = parsed.mipInfo[lodIdx]

        const mapping = []
        const position = []
        const uv = []

        function addVertex(vIdx,tIdx) {
            mapping.push(vIdx)
            const v = parsed.vertexBlock.vertices[vIdx]
            position.push(v.x * scale, v.y * scale, v.z * scale)
            const texV = mipInfo.textureVertices[tIdx]
            uv.push(
                texV.uv.x / parsed.textureWidth,
                texV.uv.y / parsed.textureHeight,
            )
        }

        mipInfo.polygons.forEach(p => {
            if (p.vertexCount < 3 || p.vertexCount > 4) {
                throw new Error(`MDL: Unsupported polygon size (${p.vertexCount})`)
            }

            addVertex(p.vertices[0].transformedVertex, p.vertices[0].textureVertex)
            addVertex(p.vertices[1].transformedVertex, p.vertices[1].textureVertex)
            addVertex(p.vertices[2].transformedVertex, p.vertices[2].textureVertex)
            if (p.vertexCount === 4) { // quad, so create 2nd triangle
                addVertex(p.vertices[2].transformedVertex, p.vertices[2].textureVertex)
                addVertex(p.vertices[3].transformedVertex, p.vertices[3].textureVertex)
                addVertex(p.vertices[0].transformedVertex, p.vertices[0].textureVertex)
            }
        })

        return {
            position,
            uv,
            mapping,
        }
    }

    async loadModel(url, baseName) {
        const parsed = new MDL(new KaitaiStream(await this.loadFromURL(url)))
        console.log(parsed)
        
        const { position, uv, mapping } = this.buildLOD(parsed, 0)

        let geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
        geo.computeVertexNormals()

        // Build animation frames
        const frames = []
        for (let i = 0; i < parsed.frameCount; i++) {
            const frameStart = i * parsed.vertexCount
            const frame = []
            for (let i = 0; i < position.length / 3; i++) {
                const v = parsed.vertexBlock.vertices[frameStart + mapping[i]]
                frame.push(v.x * scale, v.y * scale, v.z * scale)
            }
            frames.push(frame)
        }

        // Build actual animations
        const clips = []
        geo.morphAttributes.position = []
        parsed.animations.forEach(ani => {
            const seq = []
            ani.frameIndices.forEach((frIdx,i) => {
                const attr = new Float32BufferAttribute(frames[frIdx], 3)
                attr.name = `${ani.name}.${i}`
                geo.morphAttributes.position.push(attr)
                seq.push({
                    name: attr.name,
                    vertices: [], // unused
                })
            })
            const fps = 1.0 / ani.secsPerFrame
            const clip = AnimationClip.CreateFromMorphTargetSequence(
                ani.name,
                seq,
                fps,
                false /*noLoop*/
            )
            clip.userData = { fps }
            clips.push(clip)
        })

        const mat = new MeshNormalMaterial()
        mat.name = baseName
        const mesh = new Mesh(geo, mat)
        mesh.name = baseName
        mesh.animations = clips
        mesh.userData.model = parsed
        mesh.userData.mapping = mapping

        return [{
            type: DataType.Model, model: mesh,
        }]
    }

    supportedExtensions() {
        return [ 'mdl', 'tex' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Cityscape (Model)"
    }
}