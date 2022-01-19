const magic = 'SSMO'

export function loadSSM(buffer, offset = 0) {
    const dv = new DataView(buffer)
    const faces = []
    const vertices = []

    // Verify file magic
    for (let i = 0; i < magic.length; i++) {
        if (dv.getUint8(offset + i) !== magic.charCodeAt(i)) {
            throw new Error(`Invalid SSM format`)
        }
    }
    offset += magic.length

    const version = dv.getUint32(offset, true)
    offset += 4
    if (version !== 1) {
        throw new Error(`Invalid SSM file version ${version}; expected 1`)
    }

    const verticeCount = dv.getUint16(offset + 0, true)
    const faceCount = dv.getUint16(offset + 2, true)
    const textureCount = dv.getUint16(offset + 4, true)
    const frameCount = dv.getUint16(offset + 6, true)
    const animCount = dv.getUint16(offset + 8, true)
    const meshCount = dv.getUint16(offset + 10, true)
    const paramCount = dv.getUint16(offset + 12, true)
    offset += 14

    for (let i = 0; i < faceCount; i++) {
        faces.push({
            indices: [
                dv.getUint16(offset + 0, true),
                dv.getUint16(offset + 2, true),
                dv.getUint16(offset + 4, true),
            ],
            uvs: [
                dv.getFloat32(offset + 8, true) * 256,
                dv.getFloat32(offset + 12, true) * 256,
                dv.getFloat32(offset + 16, true) * 256,
                dv.getFloat32(offset + 20, true) * 256,
                dv.getFloat32(offset + 24, true) * 256,
                dv.getFloat32(offset + 28, true) * 256,
            ],
        })
        const flags = dv.getUint16(offset + 6, true)
        const meshId = dv.getUint16(offset + 32, true)
        const unknown = dv.getUint16(offset + 34, true)

        offset += 36
    }

    const filler1 = dv.getUint32(offset, true)
    offset += 4
    if (filler1 != 0) {
        throw new Error(`Filler1 is non-zero: 0x${filler1.toString(16)}`)
    }

    for (let i = 0; i < textureCount; i++) {
        let name = ''
        const nameLen = dv.getUint16(offset, true)
        offset += 2
        for (let j = 0; j < nameLen; j++) {
            const c = dv.getUint8(offset + j)
            if (c === 0) break
            name += String.fromCharCode(c)
        }
        offset += nameLen
        const tfiller = dv.getUint32(offset, true)
        if (tfiller !== 0) {
            throw new Error(`TFiller(${i}) is nonzero: ${tfiller}`)
        }
        offset += 4
    }

    const filler2 = dv.getUint32(offset, true)
    offset += 4
    if (filler2 != 0) {
        throw new Error(`Filler2 is non-zero: 0x${filler2.toString(16)}`)
    }

    for (let i = 0; i < frameCount; i++) {
        let name = ''
        const nameLen = dv.getUint16(offset, true)
        offset += 2
        for (let j = 0; j < nameLen; j++) {
            const c = dv.getUint8(offset + j)
            if (c === 0) break
            name += String.fromCharCode(c)
        }
        offset += nameLen

        const ids = []
        for (let j = 0; j < meshCount; j++) {
            ids.push(dv.getUint8(offset++))
        }

        for (let j = 0; j < verticeCount; j++) {
            vertices.push({
                position: [
                    dv.getFloat32(offset + 0, true),
                    dv.getFloat32(offset + 4, true),
                    dv.getFloat32(offset + 8, true),
                ],
            })
            offset += 12
        }

        const bigFiller = dv.getBigUint64(offset, true)
        offset += 8
        if (bigFiller != 0) {
            throw new Error(`BigFiller is non-zero: 0x${bigFiller.toString(16)}`)
        }
    }

    for (let i = 0; i < animCount; i++) {
        const numFrames = dv.getUint16(offset, true)
        offset += 2
        let name = ''
        const nameLen = dv.getUint16(offset, true)
        offset += 2
        for (let j = 0; j < nameLen; j++) {
            const c = dv.getUint8(offset + j)
            if (c === 0) break
            name += String.fromCharCode(c)
        }
        offset += nameLen
        const frameIndices = []
        for (let j = 0; j < numFrames; j++) {
            frameIndices.push(dv.getUint16(offset, true))
            offset += 2
        }
        const frameDurations = []
        for (let j = 0; j < numFrames; j++) {
            frameDurations.push(dv.getFloat32(offset, true))
            offset += 4
        }
        offset += 8 // skip past unknown data
    }

    return {
        faces,
        vertices,
    }
}
