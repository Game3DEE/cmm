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


export class Prism3DPlugin extends Plugin {
    async loadFile(url, ext, baseName) {
        switch(ext) {
            case 'psm':
                return this.loadModel(await this.loadFromURL(url), baseName)
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

        const mat = new MeshNormalMaterial()
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

        parsed.objects.forEach(obj => {
            const idxOffset = position.length / 3
            // NOTE: not using forEach since `vertices` is duplicated for every morphtarget
            for (let i = 0; i < obj.vertexCount; i++) {
                const v = obj.vertices[i]
                const uv = obj.uvs[i]
                position.push(v.x * parsed.center.x, v.y * parsed.center.y, v.z * parsed.center.z)
                uvs.push(uv.x, uv.y)
            }
            obj.indices.forEach(i => index.push(idxOffset + i))
        })

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
        geo.setIndex(index)
        geo.computeVertexNormals()

        const mat = new MeshNormalMaterial({ side: DoubleSide })
        mat.name = baseName
        const mesh = new Mesh(geo, mat)
        mesh.name = baseName

        return [
            { type: DataType.Model, model: mesh },
        ]
    }

    loadModel(buffer, baseName) {
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
