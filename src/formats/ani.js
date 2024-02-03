export function loadANI(buffer) {
    const dv = new DataView(buffer)

    const fps = dv.getUint32(0, true)
    const frameCount = dv.getUint32(4, true)
    const vertCount = dv.getUint32(8, true)
    let offset = 12

    if (buffer.byteLength != offset + frameCount * vertCount * 3 * 2) {
        return null
    }

    const frames = new Int16Array(buffer, offset, frameCount * vertCount * 3)
    offset += frames.length * 2

    return {
        fps,
        vertCount,
        frameCount,
        frames,
    }
}

export function saveANI(anim) {
    const buffer = new ArrayBuffer(
        12 + // header
        anim.frameCount *
        anim.vertCount * 3 * 2
    )
    const dv = new DataView(buffer)

    dv.setUint32(0, anim.fps, true)
    dv.setUint32(4, anim.frameCount, true)
    dv.setUint32(8, anim.vertCount, true)
    let offset = 12

    for (let i = 0; i < anim.frames.length; i++) {
        dv.setInt16(offset, anim.frames[i], true)
        offset += 2
    }

    return buffer
}
