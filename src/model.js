import {
    AnimationClip,
    AnimationMixer,
    BufferGeometry,
    DataTexture,
    DoubleSide,
    Float32BufferAttribute,
    Mesh,
    MeshBasicMaterial,
    RepeatWrapping,
    RGBFormat,
    UnsignedByteType,
} from 'three'

// Rework this code with view3dn code.

export function buildTexture565(texture, textureBytes) {
    // Bail out early if we have no texture data
    if (!textureBytes) {
        tex = null
        return
    }

    const width = 256
    const height = (textureBytes / 2) / width
    const data = new Uint8ClampedArray(width * height * 3)

    for (let i = 0; i < texture.length; i++) {
        let pixel = texture[i]
        let r = ((pixel >>> 10) & 0x1f);
        let g = ((pixel >>>  5) & 0x1f);
        let b = ((pixel >>>  0) & 0x1f);
      
        data[i*3 +0] = r << 3;
        data[i*3 +1] = g << 3;
        data[i*3 +2] = b << 3;
    }

    const tex = new DataTexture(data, width, height, RGBFormat, UnsignedByteType)
    tex.wrapS = tex.wrapT = RepeatWrapping
    tex.needsUpdate = true

    return tex
}

export function buildModel(model, tex) {
    const morphVertices = []
    const position = []
    const uv = []

    // UV dividers
    const width = tex ? tex.image.width : 256
    const height = tex ? tex.image.height : 256

    const totalFrames = model.animations.reduce((a,b) => a + b.frameCount, 0)

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
                model.animations.forEach(ani => {
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
        model.animations.forEach(ani => {
            for (let i = 0; i < ani.frameCount; i++) {
                const attr = new Float32BufferAttribute(morphVertices[frIdx + i], 3)
                attr.name = `${ani.name}.${i}`
                geo.morphAttributes.position.push(attr)
            }
            frIdx += ani.frameCount
        })
    }

    const mat = new MeshBasicMaterial({ map: tex, side: DoubleSide, alphaTest: 0.5, transparent: true })

    let obj = new Mesh(geo, mat)
    obj.name = model.name
    if (totalFrames) {
        model.animations.forEach(ani => {
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

        obj.mixer = new AnimationMixer(obj)
    }

    return obj
}
