const C1MapSize = 0x220000
const C2MapSize = 0xD80000

export function loadMAP(buffer) {
    let version
    if (buffer.byteLength === C1MapSize) {
        version = 1
    } else if (buffer.byteLength === C2MapSize) {
        version = 2
    } else {
        throw new Error(`unrecognized MAP format`)
    }

    const mapDim = version === 1 ? 512 : 1024
    const mapYScale = version === 1 ? 32 : 64
    const mapSize = mapDim * mapDim

    const dv = new DataView(buffer)
    let offset = 0

    // Load heightmap
    const heightMap = new Uint8ClampedArray(buffer, offset, mapSize)
    offset += mapSize

    // Load texturemaps
    let tex1Map
    if (version === 1) {
        tex1Map = new Uint8ClampedArray(buffer, offset, mapSize)
        offset += mapSize
    } else {
        tex1Map = new Uint8ClampedArray(mapSize)
        for (let i = 0; i < mapSize; i++) {
            let t = dv.getUint16(offset, true)
            tex1Map[i] = (t > 0xff) ? 0 : t
            offset += 2
        }
    }
    let tex2Map;
    if (version === 1) {
        tex2Map = new Uint8ClampedArray(buffer, offset, mapSize)
        offset += mapSize
    } else {
        tex2Map = new Uint8ClampedArray(mapSize)
        for (let i = 0; i < mapSize; i++) {
            let t = dv.getUint16(offset, true)
            tex2Map[i] = (t > 0xff) ? 0 : t
            offset += 2
        }
    }

    // load object map
    const objectMap = new Uint8ClampedArray(buffer, offset, mapSize)
    offset += mapSize

    // load flag maps
    let flags1, flags2
    if (version === 1) {
        flags1 = new Uint8ClampedArray(buffer, offset, mapSize)
        flags2 = new Uint8ClampedArray(mapSize) // XXX TODO copy flags1?
        offset += mapSize
    } else {
        flags1 = new Uint8ClampedArray(mapSize)
        flags2 = new Uint8ClampedArray(mapSize)
        for (let i = 0; i < mapSize; i++) {
            let flags = dv.getUint16(offset, true)
            flags1[i] = flags & 0xff
            flags2[i] = (flags >> 8) & 0xff
            offset += 2
        }
    }

    // load shadow maps
    let dawnShadows, dayShadows, nightShadows
    if (version === 1) {
        dawnShadows = new Uint8ClampedArray(mapSize)
        nightShadows = new Uint8ClampedArray(mapSize)
        dayShadows =  new Uint8ClampedArray(buffer, offset, mapSize)
        offset += mapSize
        // Brighten up the maps, C1 had darker maps then the newer games
        for (let i = 0; i < mapSize; i++) {
            let v = (64 - dayShadows[i]) * 4 // TODO find better conversion ;)
            dawnShadows[i] = v
            dayShadows[i] = v
            nightShadows[i] = v
            // TODO: adjust night/dawn maps?
        }
    } else {
        dawnShadows =  new Uint8ClampedArray(buffer, offset, mapSize)
        offset += mapSize
        dayShadows =  new Uint8ClampedArray(buffer, offset, mapSize)
        offset += mapSize
        nightShadows =  new Uint8ClampedArray(buffer, offset, mapSize)
        offset += mapSize
    }

    // Load watermap
    // TODO: version 1 stores heights, while version 2 stores indices into water table,
    //    generate water table for v1 here?
    const waterMap = new Uint8ClampedArray(buffer, offset, mapSize)
    offset += mapSize

    // Load object heightmap
    // TODO: mobile app stores absolute height, while PC stores height relative of
    //       heightmap for non-user-placed objects....
    const objectHeightMap = new Uint8ClampedArray(buffer, offset, mapSize)
    offset += mapSize

    // Load fogs map
    const fogMap = new Uint8ClampedArray(buffer, offset, mapSize / 4)
    offset += mapSize / 4

    // Load ambient (sound) map
    const ambientMap = new Uint8ClampedArray(buffer, offset, mapSize / 4)
    offset += mapSize / 4

    return {
        version,
        size: mapDim,
        yScale: mapYScale,
        heightMap,
        tex1Map,
        tex2Map,
        objectMap,
        flags1,
        flags2,
        dayShadows,
        dawnShadows,
        nightShadows,
        waterMap,
        objectHeightMap,
        fogMap,
        ambientMap,
    }
}

export function saveMAP(map) {
    const mapBytes = map.size * map.size
    const outSize = mapBytes + // heightmap
        mapBytes * 2 + // texturemap 1
        mapBytes * 2 + // texturemap 2
        mapBytes + // object map
        mapBytes * 2 + // texture flags 1 & 2
        mapBytes + // dawn lightmap
        mapBytes + // day lightmap
        mapBytes + // night lightmap
        mapBytes + // water map
        mapBytes + // object height map
        mapBytes / 4 + // fog map
        mapBytes / 4 + // ambient map
        0


    const outbuf = new ArrayBuffer(outSize)
    const dv = new DataView(outbuf)
    let offset = 0

    function writeArray(arr, count, bytesPerValue = 1) {
        for (let i = 0; i < count; i++) {
            if (bytesPerValue == 1) {
                dv.setUint8(offset, arr[i])
            } else if (bytesPerValue == 2) {
                dv.setUint16(offset, arr[i])
            } else {
                throw new Error(`Invalid bytesPerValue=${bytesPerValue}`)
            }
            offset += bytesPerValue
        }
    }

    writeArray(map.heightMap, mapBytes)
    writeArray(map.tex1Map, mapBytes, 2)
    writeArray(map.tex2Map, mapBytes, 2)
    writeArray(map.objectMap, mapBytes)

    // Write flags
    for (let i = 0; i < mapBytes; i++) {
        dv.setUint16(offset, map.flags1[i] | (map.flags2[i] << 8))
        offset += 2
    }

    writeArray(map.dawnShadows, mapBytes)
    writeArray(map.dayShadows, mapBytes)
    writeArray(map.nightShadows, mapBytes)

    writeArray(map.waterMap, mapBytes)
    writeArray(map.objectHeightMap, mapBytes)
    writeArray(map.fogMap, mapBytes / 4)
    writeArray(map.ambientMap, mapBytes / 4)

    console.log(outbuf.byteLength, offset)

    return outbuf
}
