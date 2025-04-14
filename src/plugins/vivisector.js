import { DataType, Plugin } from './plugin.js'

import CMF from '../kaitai/vivisector_cmf.js'
import TRK from '../kaitai/vivisector_trk.js'
import EXP from '../kaitai/atmosfear_exp.js'

import { KaitaiStream } from 'kaitai-struct'

import {
    AnimationClip,
    Bone,
    BufferGeometry,
    DoubleSide,
    Euler,
    Float32BufferAttribute,
    Mesh,
    MeshNormalMaterial,
    Quaternion,
    QuaternionKeyframeTrack,
    Skeleton,
    SkeletonHelper,
    SkinnedMesh,
    Vector3,
    VectorKeyframeTrack,
} from 'three'

export class VivisectorPlugin extends Plugin {
    async loadFile(url, ext, baseName) {
        switch(ext) {
            case 'csf': return [ { type: DataType.Model, model: this.loadModel(await this.loadFromURL(url), baseName, false) }]
            case 'cmf': return [ { type: DataType.Model, model: this.loadModel(await this.loadFromURL(url), baseName, true) }]
            case 'trk': return [ { type: DataType.Animation, animation: this.loadAnimation(await this.loadFromURL(url), baseName) }]
            case 'exp': return [ { type: DataType.Model, model: this.loadExp(await this.loadFromURL(url), baseName) }]
        }
    }

    activate(model) {
        this.activeModel = model
    }

    deactivate() {
        this.activeModel = null
    }

    // TODO: only allow when plugin is active
    loadAnimation(buffer, baseName) {
        const parsed = new TRK(new KaitaiStream(buffer))
        console.log(parsed)

        const frameSpeed = 1 / 3

        const keyFrameTracks = []
        const q = new Quaternion()
        const e = new Euler()
        const v = new Vector3()
        parsed.bones.forEach(bone => {
            const boneNode = this.activeModel.getObjectByName(bone.name.toLowerCase())
            if (!boneNode) {
                console.log(`Unable to find bone ${bone.name}`)
                return
            }
            const base = boneNode.position.clone() // XXX this could be triggered during animation and be wrong!
            const timesT = [], valuesT = []
            const timesR = [], valuesR = []
            //bone.name
            bone.blocks.forEach(frame => {
                // handle translation
                timesT.push(frame.frameIndex * frameSpeed)
                v.copy(base).add(frame.translation)
                valuesT.push(v.x, v.y, v.z)
                // handle rotation
                timesR.push(frame.frameIndex * frameSpeed)
                v.copy(frame.rotation).multiplyScalar(Math.PI / 180)
                v.y *= -1
                e.set(v.x, v.y, v.z, 'ZXY')
                q.setFromEuler(e)
                valuesR.push(q.x, q.y, q.z, q.w)
            })
            keyFrameTracks.push(
                new VectorKeyframeTrack(`${bone.name}.position`, timesT, valuesT),
                new QuaternionKeyframeTrack(`${bone.name}.quaternion`, timesR, valuesR),
            )
        })

        return new AnimationClip(baseName, -1, keyFrameTracks)
    }


    loadExp(buffer, baseName) {
        const parsed = new EXP(new KaitaiStream(buffer))
        console.log(parsed)

        const vertices = [];
        for (let m of parsed.models) {

            m.faces.forEach(f => {
                const a = m.vertices[f.indices[0]]
                const b = m.vertices[f.indices[1]]
                const c = m.vertices[f.indices[2]]
                const d = m.vertices[f.indices[3]]
                vertices.push(
                    c.x, c.y, c.z,
                    b.x, b.y, b.z,
                    a.x, a.y, a.z,

                    a.x, a.y, a.z,
                    d.x, d.y, d.z,
                    c.x, c.y, c.z,
                )
            })
        }

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(vertices, 3))
        geo.computeVertexNormals()
        const mesh = new Mesh(geo, new MeshNormalMaterial({ side: DoubleSide }));
        mesh.name = baseName

        return mesh;
    }

    loadModel(buffer, baseName, isCMF) {
        const parsed = new CMF(new KaitaiStream(buffer))
        console.log(parsed)

        let vertices, faces, uvs, indices
        let boneNames, bonePos, boneParents, boneTransforms, boneVertMapping
        parsed.blocks.forEach(b => {
            let blockName = CMF.BlockId[b.id]
            if (!blockName) {
                blockName = '0x' + b.id.toString(16) + `(size:${b.size})`
            }
            console.log(blockName)
            switch(b.id) {
                // dumps for further research
                case CMF.BlockId.HEADER:
                    console.log(b.data)
                    break
                case CMF.BlockId.UV1:
                    if (!uvs)
                        uvs = b.data.uvs
                    break
                case CMF.BlockId.BONE_NAMES:
                    boneNames = b.data.boneNames
                    break
                case CMF.BlockId.BONE_POSITIONS:
                    bonePos = b.data.bonePositions
                    break
                case CMF.BlockId.BONE_PARENTS:
                    boneParents = b.data.boneParents
                    break
                case CMF.BlockId.BONE_TRANSFORMS:
                    boneTransforms = b.data.boneTransforms
                    break
                case CMF.BlockId.VERTEX_BONES:
                    boneVertMapping = b.data.boneIndices
                    break
                case CMF.BlockId.FACES:
                    if (!faces)
                        faces = b.data.faces
                    break
                case CMF.BlockId.VERTICES:
                    if (!vertices)
                        vertices = b.data.vertices
                    break
                case CMF.BlockId.FACE_MATERIALS:
                    if (!indices)
                        indices = b.data.indices
                    break
                case CMF.BlockId.FACE_COUNT:
                case CMF.BlockId.VERT_COUNT:
                case CMF.BlockId.BONE_COUNT:
                    console.log(b.data)
            }
        })

        console.log(faces, vertices, indices)

        const position = []
        const uv = []
        const groups = []
        const skinIndex = []
        const skinWeight = []

        let matId = -1
        faces?.forEach((f,i) => {
            // Handle material
            if (indices && matId !== indices[i]) {
                if (matId !== -1) {
                    const grp = groups[groups.length -1]
                    grp.count = (i * 3 - grp.start)
                }
                groups.push({
                    start: i * 3,
                    count: -1,
                    materialIndex: indices[i],
                })
                matId = indices[i]
            }

            if (boneVertMapping) {
                skinIndex.push(boneVertMapping[f.c], 0, 0, 0)
                skinWeight.push(1, 0, 0, 0)
                skinIndex.push(boneVertMapping[f.b], 0, 0, 0)
                skinWeight.push(1, 0, 0, 0)
                skinIndex.push(boneVertMapping[f.a], 0, 0, 0)
                skinWeight.push(1, 0, 0, 0)
            }

            position.push(
                vertices[f.c].x, vertices[f.c].y, vertices[f.c].z, 
                vertices[f.b].x, vertices[f.b].y, vertices[f.b].z, 
                vertices[f.a].x, vertices[f.a].y, vertices[f.a].z, 
            )
            uv.push(
                uvs[i].cU, uvs[i].cV,
                uvs[i].bU, uvs[i].bV,
                uvs[i].aU, uvs[i].aV,
            )

            // If this face is a quad
            if (f.d !== f.c) {
                //gFaceL[0][i + 1].v1 = gFaceL[0][i].v1;
                //gFaceL[0][i + 1].v2 = gFaceL[0][i].v3;
                //ReadFile(hfile, &gFaceL[0][i + 1].v3, 4, &l, NULL);

                if (boneVertMapping) {
                    skinIndex.push(boneVertMapping[f.a], 0, 0, 0)
                    skinWeight.push(1, 0, 0, 0)
                    skinIndex.push(boneVertMapping[f.d], 0, 0, 0)
                    skinWeight.push(1, 0, 0, 0)
                    skinIndex.push(boneVertMapping[f.c], 0, 0, 0)
                    skinWeight.push(1, 0, 0, 0)
                }

                position.push(
                    vertices[f.a].x, vertices[f.a].y, vertices[f.a].z, 
                    vertices[f.d].x, vertices[f.d].y, vertices[f.d].z, 
                    vertices[f.c].x, vertices[f.c].y, vertices[f.c].z, 
                )
                uv.push(
                    uvs[i].aU, uvs[i].aV,
                    uvs[i].dU, uvs[i].dV,
                    uvs[i].cU, uvs[i].cV,
                )
            }
        })
        if (groups.length) {
            const grp = groups[groups.length -1]
            grp.count = (faces.length * 3 - grp.start)
        } else {
            groups.push({
                start: 0,
                count: faces.length * 3,
                materialIndex: 0
            })
        }

        const geo = new BufferGeometry()
        geo.setAttribute('position', new Float32BufferAttribute(position, 3))
        geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
        if (skinWeight.length) {
            geo.setAttribute('skinWeight', new Float32BufferAttribute(skinWeight, 4))
            geo.setAttribute('skinIndex', new Float32BufferAttribute(skinIndex, 4))
        }
        geo.computeVertexNormals()
        groups.forEach(({ start, count, materialIndex }) => geo.addGroup(start, count, materialIndex))

        const mat = []
        const matIndices = []
        groups.forEach(g => {
            if (!matIndices.includes(g.materialIndex)) {
                const m = new MeshNormalMaterial()
                m.name = `Material-${g.materialIndex}`
                mat.push(m)
                matIndices.push(g.materialIndex)
            }
        })

        let mesh;
        if (boneNames?.length > 1 && boneParents && bonePos && boneTransforms) {
            let v1 = new Vector3(), v2 = new Vector3()
            const bones = []
            for (let i = 0; i < boneNames.length; i++) {
                const b = new Bone()
                b.name = boneNames[i].toLowerCase()
                v1.set(bonePos[i].x, bonePos[i].y, bonePos[i].z)
                const parent = boneParents[i]
                if (parent !== -1) {
                    v2.set(bonePos[parent].x, bonePos[parent].y, bonePos[parent].z)
                    v1.sub(v2)
                    bones[parent].add(b)
                }
                b.position.copy(v1)
                bones.push(b)

                /*
                m3.fromArray(boneTransforms[i].elements)
                m4.identity()
                m4.setFromMatrix3(m3)
                m4.setPosition(bonePos[i].x, bonePos[i].y, bonePos[i].z)
                m4.decompose(b.position, b.quaternion, b.scale)
                mesh.add(b)
                */
            }
            mesh = new SkinnedMesh( geo, mat );
            const skeleton = new Skeleton( bones );
            mesh.add( skeleton.bones[ 0 ] );
            mesh.bind( skeleton );
        } else {
            mesh = new Mesh(geo, mat)
        }
        mesh.name = baseName

        return mesh
    }

    supportedExtensions() {
        return [ 'cmf', 'csf', 'trk', 'exp' ]
    }

    isMode() {
        return true
    }

    name() {
        return "Vivisector (Model)"
    }
}
