import { BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshNormalMaterial } from 'three'
import { DataType, Plugin } from './plugin.js'

import { KaitaiStream } from 'kaitai-struct'
import SCB from '../kaitai/r3d_scb.js'
import ANIM from '../kaitai/r3d_anim.js'
import P3D from '../kaitai/p3d.js'

export class Riot3DPlugin extends Plugin {
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
            this.customGui = this.gui.addFolder('Riot3D')
            const count = this.activeModel.userData.numModels || 1
            this.customGui.add(this.guiOpts, 'model', 0, count -1, 1).name('Model').onChange(v => this.switchModel(v))
        }
    }

    switchModel(idx) {
        const { parsed, numModels } = this.activeModel.userData

        const m = parsed.meshes[idx]
        const position = []
        const indices = []

        m.vertices.forEach(v => position.push(v.float1, v.float3, -v.float2) ) // XXX switch Y/Z
        m.indices.forEach(i => indices.push(i))
        const geo = this.activeModel.geometry
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.deleteAttribute('normal') // work around bug in computeVertexNormals()
        geo.setIndex(indices)
        geo.computeVertexNormals()
    }

    async loadFile(url, ext, baseName) {
        switch(ext) {
            case 'p3d':
                return this.parseP3D(await this.loadFromURL(url))
            case 'sco':
                return this.parseSCO(await fetch(url).then(body => body.text()))
            case 'scb':
            case 'dat':
                return this.parseSCB(await this.loadFromURL(url))
            case 'anim':
                return this.parseANIM(await this.loadFromURL(url))
        }
    }

    parseP3D(ab) {
        const parsed = new P3D(new KaitaiStream(ab))
        console.log(parsed)

        let mat = new MeshNormalMaterial()

        const m = parsed.meshes[0]
        const position = []
        const indices = []

        m.vertices.forEach(v => position.push(v.float1, v.float3, -v.float2) ) // XXX switch Y/Z
        m.indices.forEach(i => indices.push(i))
        let geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setIndex(indices)
        geo.computeVertexNormals()
        const model = new Mesh(geo, mat)
        model.userData.numModels = parsed.meshes.length
        model.userData.parsed = parsed

        return [
            { type: DataType.Model, model },
        ]
    }

    parseANIM(ab) {
        // TODO: implement animations
        const parsed = new ANIM(new KaitaiStream(ab))
        console.log(parsed)
        const position = []
        const uv = []
        parsed.faces.forEach(f => {
            let uv_idx = 0
            f.indices.forEach(i => {
                const vert = parsed.vertices[i]
                position.push(vert.x, vert.y, vert.z)
                let u = f.uvs[uv_idx], v = f.uvs[uv_idx+f.indices.length]
                if (u < 0) u = 1 + u
                if (v < 0) v = 1 + v
                uv.push(u,v)
                uv_idx++
            })
        })
        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
        geo.computeVertexNormals()
        const model = new Mesh(geo, new MeshNormalMaterial())
        model.name = name

        return [
            { type: DataType.Model, model },
        ]
    }

    parseSCB(ab) {
        const parsed = new SCB(new KaitaiStream(ab))
        console.log(parsed)
        const position = []
        const uv = []
        parsed.faces.forEach(f => {
            let uv_idx = 0
            f.indices.forEach(i => {
                const vert = parsed.vertices[i]
                position.push(vert.x, vert.y, vert.z)
                let u = f.uvs[uv_idx], v = f.uvs[uv_idx+f.indices.length]
                if (u < 0) u = 1 + u
                if (v < 0) v = 1 + v
                uv.push(u,v)
                uv_idx++
            })
        })
        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
        geo.computeVertexNormals()
        const model = new Mesh(geo, new MeshNormalMaterial())
        model.name = name

        return [
            { type: DataType.Model, model },
        ]
    }

    parseSCO(s) {
        const lines = s.split('\n').map(s => s.trim()).filter(s => s.length > 0)
        if (lines[0] !== '[ObjectBegin]') {
            throw Error(`Unexpected first line ${lines[0]}`)
        }
        
        let idx = 1, name = 'Untitled', origin = [0,0,0]
        let vertices = [], faces = [], uvs = [] // uvs is per face, not per vert
        while(idx < lines.length) {
            if (lines[idx] === '[ObjectEnd]') break
        
            switch (lines[idx].split('=')[0].trim()) {
                case 'Name':
                    name = lines[idx].split('=')[1].trim()
                    break
                case 'CentralPoint':
                    origin = lines[idx].split('=')[1].trim().split('\t').map(s => s.trim()).map(s => parseFloat(s))
                    console.log(`# Origin: ${origin}`)
                    break
                case 'Verts':
                    let vCount = parseInt(lines[idx].split('=')[1].trim())
                    for (let i = 1; i <= vCount; i++) {
                        vertices.push(lines[idx+i].split(/[ \t]+/).map(s => s.trim()).map(s => parseFloat(s)))
                    }
                    idx += vCount
                    break
                case 'Faces':
                    let fCount = parseInt(lines[idx].split('=')[1].trim())
                    for (let i = 1; i <= fCount; i++) {
                        const parts = lines[idx+i].split(/[ \t]+/).map(s => s.trim())
                        const cnt = parseInt(parts[0])
                        const indices = parts.slice(1,cnt+1).map(s => parseInt(s.trim()))
                        faces.push(indices)
                        // parts[cnt+1] is material name
                        const uv = parts.slice(cnt+2).map(s => parseFloat(s.trim()))
                        uvs.push.apply(uvs, uv)
                    }
                    idx += fCount
                    break
            }
            idx++
        }

        const position = []
        const uv = []
        let uv_idx = 0
        faces.forEach(f => {
            f.forEach(i => {
                const vert = vertices[i]
                position.push(vert[0], vert[1], vert[2])
                let u = uvs[uv_idx], v = uvs[uv_idx+1]
                if (u < 0) u = 1 + u
                if (v < 0) v = 1 + v
                uv.push(u,v)
                uv_idx += 2
            })
        })
        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
        geo.computeVertexNormals()
        const model = new Mesh(geo, new MeshNormalMaterial())
        model.name = name

        return [
            { type: DataType.Model, model },
        ]
    }

    supportedExtensions() {
        return [ 'sco', 'scb', 'dat', 'anim', /* non riot3d */ 'p3d', ]
    }

    isMode() {
        return true
    }

    name() {
        return "Riot3D (Model)"
    }
}
