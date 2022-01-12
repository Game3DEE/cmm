// Inspired from http://www.paulbourke.net/dataformats/tga/tgatest.c

// TODO: add check for RLE compressed TGA files

export function loadTGA(buffer) {
    const dv = new DataView(buffer)
    const idlength = dv.getUint8(0)
    const colourmaptype = dv.getUint8(1)
    const datatypecode = dv.getUint8(2)
    const colourmaporigin = dv.getUint16(3, true)
    const colourmaplength = dv.getUint16(5, true)
    const colourmapdepth = dv.getUint8(7)
    const x_origin = dv.getUint16(8, true)
    const y_origin = dv.getUint16(10, true)
    const width = dv.getUint16(12, true)
    const height = dv.getUint16(14, true)
    const bitsperpixel = dv.getUint8(16)
    const imagedescriptor = dv.getUint8(17)
    let offset = 18

    // Skip over unnecessary stuff
    offset += idlength
    offset += colourmaptype * colourmaplength
    
    const data = new Uint8ClampedArray(width * height * 4)
    const bytesPerPixel = bitsperpixel / 8

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let off = (y * width + x) * 4
            let srcOff = ((height - y -1) * width + x) * bytesPerPixel
            let p = []
            for (let i = 0; i < bytesPerPixel; i++) {
                p.push(dv.getUint8(offset + srcOff + i))
            }
            switch(bytesPerPixel) {
                case 2:
                    data[off +0] = (p[1] & 0x7c) << 1
                    data[off +1] = ((p[1] & 0x03) << 6) | ((p[0] & 0xe0) >> 2)
                    data[off +2] = (p[0] & 0x1f) << 3
                    data[off +3] = (p[1] & 0x80) ? 255 : 0
                    break
                case 3:
                    data[off +0] = p[2]
                    data[off +1] = p[1]
                    data[off +2] = p[0]
                    data[off +3] = 255
                    break
                case 4:
                    data[off +0] = p[2]
                    data[off +1] = p[1]
                    data[off +2] = p[0]
                    data[off +3] = p[3]
                    break
                default:
                    throw new Error(`Unknown bytesPerPixel value ${bytesPerPixel}!`)
            }
        }
    }

    return {
        width,
        height,
        data,
    }
}

export function saveTGA(image, bits = 32) {
    const { width, height, data } = image

    const bytesPerPixel = bits / 8
    const sizeBytes = 18 + (width * height * bytesPerPixel)
    const buffer = new ArrayBuffer(sizeBytes)
    const dv = new DataView(buffer)

    // write header
    dv.setUint8(0, 0) // idlength
    dv.setUint8(1, 0) // colourmaptype
    dv.setUint8(2, 2) // datatypecode
    dv.setUint16(3, 0, true) // colourmaporigin
    dv.setUint16(5, 0, true) // colourmaplength
    dv.setUint8(7, 0) // colourmapdepth
    dv.setUint16(8, 0, true) // x_origin
    dv.setUint16(10, 0, true) // y_origin
    dv.setUint16(12, width, true)
    dv.setUint16(14, height, true)
    dv.setUint8(16, bits)
    dv.getUint8(17, 0) // imagedescriptor
    let offset = 18

    let byteView = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let srcOff = (y * width +x) * bytesPerPixel
            let dstOff = offset + ((height - y - 1) * width + x) * bytesPerPixel
            switch(bits) {
                case 16:
                    dv.setUint8(dstOff + 0, byteView[srcOff +0])
                    dv.setUint8(dstOff + 1, byteView[srcOff +1])
                    break;
                case 32:
                    dv.setUint8(dstOff + 2, byteView[srcOff +0])
                    dv.setUint8(dstOff + 1, byteView[srcOff +1])
                    dv.setUint8(dstOff + 0, byteView[srcOff +2])
                    dv.setUint8(dstOff + 3, byteView[srcOff +3])
                    break;
            }    
        }
    }

    return buffer
}