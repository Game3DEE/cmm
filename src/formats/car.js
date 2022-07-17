import {
    readFaces, readVertices,
    writeFaces, writeVertices,
} from './model-common.js'

export function loadCAR(buffer) {
    const dv = new DataView(buffer)
    let offset = 0

    let name = ''
    for (let j = 0; j < 24; j++) {
        let c = dv.getUint8(offset + j)
        if (c === 0) break
        name += String.fromCharCode(c)
    }
    offset += 24

    let msc = ''
    for (let j = 0; j < 8; j++) {
        let c = dv.getUint8(offset + j)
        if (c === 0) break
        msc += String.fromCharCode(c)
    }
    offset += 8

    const animationCount = dv.getUint32(offset + 0, true)
    const soundCount = dv.getUint32(offset + 4, true)
    const vertCount = dv.getUint32(offset + 8, true)
    const faceCount = dv.getUint32(offset + 12, true)
    const textureSize = dv.getUint32(offset + 16, true)
    offset += 20

    const { faces, facesSize } = readFaces(dv, offset, faceCount)
    offset += facesSize
    const { vertices, verticesSize } = readVertices(dv, offset, vertCount)
    offset += verticesSize
    const texture = new Uint16Array(buffer, offset, textureSize / 2)
    offset += textureSize

    const animations = []
    for (let i = 0; i < animationCount; i++) {
        let name = ''
        for (let j = 0; j < 32; j++) {
            let c = dv.getUint8(offset + j)
            if (c === 0) break
            name += String.fromCharCode(c)
        }
        const fps = dv.getUint32(offset + 32, true)
        const frameCount = dv.getUint32(offset + 36, true)
        offset += 40
        const frames = new Int16Array(buffer, offset, frameCount * vertCount * 3)
        offset += frames.length * 2
        animations.push({
            name,
            fps,
            frameCount,
            vertCount, // so animations can be used seperately
            frames,
        })
    }

    const sounds = []
    for (let i = 0; i < soundCount; i++) {
        let name = ''
        for (let j = 0; j < 32; j++) {
            let c = dv.getUint8(offset + j)
            if (c === 0) break
            name += String.fromCharCode(c)
        }
        const pcmLength = dv.getUint32(offset + 32, true)
        const pcm = new Uint8ClampedArray(buffer, offset + 36, pcmLength)
        sounds.push({
            name,
            pcm,
        })
        offset += 36 + pcmLength
    }

    const soundMap = []
    while(offset < buffer.byteLength) {
        soundMap.push( dv.getInt32(offset, true) )
        offset += 4
    }

    return {
        name,
        msc,
        faces,
        vertices,
        texture,
        textureSize,
        animations,
        sounds,
        soundMap,
    }
}

export function saveCAR(model) {
    const textureLength = model.texture ? model.texture.length * 2 : 0
    const soundCount = model.sounds?.length || 0
    const soundsPCMSize = model.sounds?.reduce((sum,c) => sum + c.pcm.length, 0) || 0
    const sizeBytes =
        32 + // name + msc
        20 + // header
        model.faces.length * 64 +
        model.vertices.length * 16 +
        textureLength +
        model.animations.reduce((a, anim) => a + 40 + anim.frames.length * 2, 0) +
        soundCount * (32 + 4) + // sound metadata (name + size)
        soundsPCMSize + // actual PCM data size
        (model.soundMap?.length || 0) * 4 // soundsMap

    const buffer = new ArrayBuffer(sizeBytes)
    const dv = new DataView(buffer)
    let offset = 0

    for (let j = 0; j < 24; j++) {
        let c = j < model.name.length ? model.name.charCodeAt(j) : 0
        dv.setUint8(offset + j, c)
    }
    offset += 24

    let msc = 'cmm:1337'
    for (let j = 0; j < 8; j++) {
        let c = j < msc.length ? msc.charCodeAt(j) : 0
        dv.setUint8(offset + j, c)
    }
    offset += 8

    dv.setUint32(offset + 0, model.animations.length, true)
    dv.setUint32(offset + 4, soundCount, true)
    dv.setUint32(offset + 8, model.vertices.length, true)
    dv.setUint32(offset + 12, model.faces.length, true)
    dv.setUint32(offset + 16, textureLength, true)
    offset += 20

    offset += writeFaces(dv, offset, model.faces)
    offset += writeVertices(dv, offset, model.vertices)

    if (textureLength) {
        for (let i = 0; i < model.texture.length; i++) {
            dv.setUint16(offset, model.texture[i], true)
            offset += 2
        }
    }

    model.animations.forEach(anim => {
        for (let j = 0; j < 32; j++) {
            let c = j < anim.name.length ? anim.name.charCodeAt(j) : 0
            dv.setUint8(offset + j, c)
        }
        dv.setUint32(offset + 32, anim.fps, true)
        dv.setUint32(offset + 36, anim.frameCount, true)
        offset += 40
        for (let i = 0; i < anim.frames.length; i++) {
            dv.setInt16(offset, anim.frames[i], true)
            offset += 2
        }
    })

    model.sounds?.forEach(snd => {
        for (let j = 0; j < 32; j++) {
            let c = j < snd.name.length ? snd.name.charCodeAt(j) : 0
            dv.setUint8(offset + j, c)
        }
        offset += 32
        dv.setUint32(offset, snd.pcm.length, true)
        offset += 4
        snd.pcm.forEach(b => dv.setUint8(offset++, b))
    })

    model.soundMap?.forEach(i => {
        console.log(i)
        dv.setInt32(offset, i, true)
        offset += 4
    })

    console.log(offset, sizeBytes)

    return buffer
}