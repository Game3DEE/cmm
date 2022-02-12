import {
    readFaces, readVertices,
    writeFaces, writeVertices,
} from './model-common.js'

export function load3DF(buffer, offset = 0) {
    const startOffset = offset
    const dv = new DataView(buffer)

    // Get counts / sizes
    const vertCount = dv.getUint32(offset + 0, true)
    const faceCount = dv.getUint32(offset + 4, true)
    const boneCount = dv.getUint32(offset + 8, true)
    let textureSize = dv.getUint32(offset + 12, true)
    offset += 16

    const { faces, facesSize } = readFaces(dv, offset, faceCount)
    offset += facesSize
    const { vertices, verticesSize } = readVertices(dv, offset, vertCount)
    offset += verticesSize

    const bones = []
    for (let i = 0; i < boneCount; i++) {
        let name = ''
        for (let j = 0; j < 32; j++) {
            let c = dv.getUint8(offset + j)
            if (c === 0) break
            name += String.fromCharCode(c)
        }
        let boneInfo = {
            name,
            position: [
                dv.getFloat32(offset + 32, true),
                dv.getFloat32(offset + 36, true),
                dv.getFloat32(offset + 40, true),
            ],
            parent: dv.getInt16(offset + 44, true),
            hidden: dv.getUint16(offset + 46, true),
        }
        offset += 48
        bones.push(boneInfo)
    }

    // Read RGB5551 texture
    let texture;
    if (offset + textureSize > buffer.byteLength) {
        texture = []
        textureSize = 0
    } else {
        texture = new Uint16Array(buffer, offset, textureSize / 2)
        offset += textureSize
    }

    return {
        model: {
            faces,
            vertices,
            bones,
            textureSize,
            texture,
        },
        size: offset - startOffset, // return size of read data
    }
}

export function save3DF(model) {
    const textureLength = model.texture ? model.texture.length * 2 : 0
    const boneCount = model.bones?.length || 0
    const byteSize =
        16 + // header
        model.faces.length * 64 +
        model.vertices.length * 16 +
        boneCount * 48 +
        textureLength

    const buffer = new ArrayBuffer(byteSize)
    const dv = new DataView(buffer)

    // Write header
    dv.setUint32(0, model.vertices.length, true)
    dv.setUint32(4, model.faces.length, true)
    dv.setUint32(8, boneCount, true)
    dv.setUint32(12, textureLength, true)
    let offset = 16

    // Write faces / vertices
    offset += writeFaces(dv, offset, model.faces)
    offset += writeVertices(dv, offset, model.vertices)

    // Write bones
    model.bones?.forEach(bone => {
        for (let j = 0; j < 32; j++) {
            let c = j < bone.name.length ? bone.name.charCodeAt(j) : 0
            dv.setUint8(offset + j, c)
        }
        dv.setFloat32(offset + 32, bone.position[0], true),
        dv.setFloat32(offset + 36, bone.position[1], true),
        dv.setFloat32(offset + 40, bone.position[2], true),
        dv.setInt16(offset + 44, bone.parent, true),
        dv.setUint16(offset + 46, bone.hidden || 0, true),
        offset += 48
    })

    if (textureLength) {
        for (let i = 0; i < model.texture.length; i++) {
            dv.setUint16(offset, model.texture[i], true)
            offset += 2
        }
    }

    return buffer
}