const magic = 'UBFC'

export function loadCMF(buffer, offset = 0) {
    const dv = new DataView(buffer)

    // Verify file magic
    for (let i = 0; i < magic.length; i++) {
        if (dv.getUint8(offset + i) !== magic.charCodeAt(i)) {
            throw new Error(`Invalid CMF format`)
        }
    }
    offset += magic.length
    offset += 4 // skip zero byte

    const vertices = []
    const faces = []

    function parseIndices(size) {
        console.log('parseIndices')
        for (let i = 0; i < size; i += 16) {
            faces.push({
                indices: [
                    dv.getUint32(offset + i + 0, true),
                    dv.getUint32(offset + i + 4, true),
                    dv.getUint32(offset + i + 8, true),
                ],
                uvs: [],
            })
        }
    }

    function parseVertices(size) {
        for (let i = 0; i < size; i += 12) {
            vertices.push({
                position: [
                    dv.getFloat32(offset + i + 0, true),
                    dv.getFloat32(offset + i + 4, true),
                    dv.getFloat32(offset + i + 8, true),
                ],
                bone: -1,
                hide: 0,
            })
        }    
    }

    function parseUVs(size) {
        let faceIdx = 0
        for (let i = 0; i < size; i+=4*8) {
            faces[faceIdx++].uvs = [
                dv.getFloat32(offset + i + 0, true) * 256, // a.uv
                dv.getFloat32(offset + i + 4, true) * 256,
                dv.getFloat32(offset + i + 8, true) * 256, // b.uv
                dv.getFloat32(offset + i + 12, true) * 256,
                dv.getFloat32(offset + i + 16, true) * 256, // c.uv
                dv.getFloat32(offset + i + 20, true) * 256,
            ]
        }
    }

    while(offset < buffer.byteLength) {
        const blockId = dv.getUint32(offset, true)
        const size = dv.getUint32(offset + 4, true)
        offset += 8
        //console.log(`0x${blockId.toString(16)}: ${size}`)
        switch(blockId) {
            case 0x2013: // indices
                parseIndices(size)
                break
            case 0x2020: // floats1 (uv1?)
                //parseUVs(size)
                break
            case 0x2021: // floats1 (uv1?)
                parseUVs(size)
                break
            case 0x2023: // vertices
                parseVertices(size)
                break
        }
        //
        offset += size
    }

    return {
        vertices,
        faces,
    }
}
