const PKMMagic = 'PKM 10'

import { etc1_decode_image } from './etc1.js'

export function loadPKM(buffer) {
    const dv = new DataView(buffer)
    let offset = 0

    // Verify PKM file magic
    for (let i = 0; i < PKMMagic.length; i++) {
        if (dv.getUint8(offset + i) !== PKMMagic.charCodeAt(i)) {
            throw new Error(`Invalid PKM file format`)
        }
    }
    offset += PKMMagic.length

    // Read PKM header info (big endian!)
    const iBlank = dv.getUint16(offset + 0, false)
	const iPaddedWidth = dv.getUint16(offset + 2, false)
    const iPaddedHeight = dv.getUint16(offset + 4, false)
    const iWidth = dv.getUint16(offset + 6, false)
    const iHeight = dv.getUint16(offset + 8, false)
    offset += 10

    const rgbData = new Uint8ClampedArray(iWidth * iHeight * 3)

    etc1_decode_image(
        new Uint8ClampedArray(buffer, offset),
        rgbData,
        iWidth,
        iHeight,
        3, // pixelSize
        3 * iWidth, // stride
    )

    const data = new Uint8ClampedArray(iWidth * iHeight * 4)
    for (let i = 0; i < iWidth * iHeight; i++) {
        data[i*4 +0] = rgbData[i*3 +0]
        data[i*4 +1] = rgbData[i*3 +1]
        data[i*4 +2] = rgbData[i*3 +2]
        data[i*4 +3] = 255
    }

    return {
        width: iWidth,
        height: iHeight,
        data,
    }
}