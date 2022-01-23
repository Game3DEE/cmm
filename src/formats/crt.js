export function loadCRT(buffer) {
    const dv = new DataView(buffer)
    const width = dv.getUint16(0, true)
    const height = dv.getUint16(2, true)
    const bits = dv.getUint8(4) // can only be 24 or 32 so far
    let offset = 5
    const bytesPerPixel = bits / 8
    const data = new Uint8ClampedArray(width * height * 4)
    for (let i = 0; i < width * height; i++) {
        data[i*4 +0] = dv.getUint8(offset + 0)
        data[i*4 +1] = dv.getUint8(offset + 1)
        data[i*4 +2] = dv.getUint8(offset + 2)
        data[i*4 +3] = (bits === 32) ? dv.getUint8(offset +3) : 255
        offset += bytesPerPixel
    }

    return {
        width,
        height,
        data,
    }
}
