function decompress(buf, offset, compressedSize, decompressedSize) {
    const out = new Uint8ClampedArray(decompressedSize)
    let outIdx = 0
    const inp = new Uint8ClampedArray(buf, offset, compressedSize)
    let inpIdx = 0

    while(inpIdx < compressedSize) {
        let byte = inp[inpIdx++]
        let count = inp[inpIdx++]
        for (let i = 0; i < count; i++) {
            out[outIdx++] = byte
        }
    }

    return out
}

export function loadMAN(buffer) {
    const dv = new DataView(buffer)
    const mapDim = 1024
    const mapYScale = 64
    const mapSize = mapDim * mapDim
    const heightMap = new Uint8ClampedArray(buffer, 0 * mapSize, mapSize)
    const dawnShadows = new Uint8ClampedArray(buffer, 1 * mapSize, mapSize)
    const dayShadows = new Uint8ClampedArray(buffer, 2 * mapSize, mapSize)
    const nightShadows = new Uint8ClampedArray(buffer, 3 * mapSize, mapSize)
    const flags1 = new Uint8ClampedArray(buffer, 4 * mapSize, mapSize)
    const flags2 = new Uint8ClampedArray(buffer, 5 * mapSize, mapSize / 4)
    let offset = 5 * mapSize + mapSize / 4

    const tex1MapCSize = dv.getUint32(offset, true)
    const tex1Map = decompress(buffer, offset +4, tex1MapCSize, mapSize)
    offset += 4 + tex1MapCSize
    const tex2MapCSize = dv.getUint32(offset, true)
    const tex2Map = decompress(buffer, offset +4, tex2MapCSize, mapSize / 4)
    offset += 4 + tex2MapCSize

    const objMapCSize = dv.getUint32(offset, true)
    const objectMap = decompress(buffer, offset +4, objMapCSize, mapSize)
    offset += 4 + objMapCSize

    const ohMapCSize = dv.getUint32(offset, true)
    const objectHeightMap = decompress(buffer, offset +4, ohMapCSize, mapSize)
    offset += 4 + ohMapCSize

    const waterMapCSize = dv.getUint32(offset, true)
    const waterMap = decompress(buffer, offset +4, waterMapCSize, mapSize)
    offset += 4 + waterMapCSize

    const ambientMapCSize = dv.getUint32(offset, true)
    const ambientMap = decompress(buffer, offset +4, ambientMapCSize, mapSize / 4)
    offset += 4 + ambientMapCSize

    const fogMapCSize = dv.getUint32(offset, true)
    const fogMap = decompress(buffer, offset +4, fogMapCSize, mapSize / 4)
    offset += 4 + fogMapCSize

    return {
        size: mapDim,
        yScale: mapYScale,
        heightMap,
        dawnShadows,
        dayShadows,
        nightShadows,
        flags1,
        flags2,
        tex1Map,
        tex2Map,
        objectMap,
        objectHeightMap,
        waterMap,
        ambientMap,
        fogMap,
    }
}
