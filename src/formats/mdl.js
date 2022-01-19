const magic = 'MDATV010'

// Model flags
const MF_FACE_FORWARD = 1 << 0
const MF_REFLECTIONS = 1 << 1
const MF_REFLECTIONS_HALF = 1 << 2
const MF_HALF_FACE_FORWARD = 1 << 3
const MF_COMPRESSED_16BIT = 1 << 4
const MF_STRETCH_DETAIL = 1 << 5

const MAX_MODELMIPS = 32

// Feature flags for V010 (which is the only version we support right now)
const bHasSavedCenter = true
const bHasMultipleCollisionBoxes = true
const bHasAttachedPositions = true
const bHasPolygonalPatches = true
const bHasPolygonsPerSurface = true
const bHasSavedFlagsOnStart = true
const bHasColorForReflectionAndSpecularity = true
const bHasDiffuseColor = true


export function loadMDL(buffer) {
    const dv = new DataView(buffer)
    let offset = 0

    function readString(len) {
        let s = ''
        for (let i = 0; i < len; i++) {
            let c = dv.getUint8(offset + i)
            if (c === 0) break
            s += String.fromCharCode(c)
        }
        offset += len
        return s
    }

    function expectString(str) {
        // Verify file magic
        let s = readString(str.length)
        if (s !== str) {
            throw new Error(`Invalid MDL format: missing ${str}`)
        }
    }

    function expectInteger(num) {
        let val = dv.getUint32(offset, true)
        if (val != num) {
            throw new Error(`Invalid MDL format: expected ${num}, got ${val}`)
        }
        offset += 4
    }

    expectString(magic)

    const flags = dv.getUint32(offset, true)
    offset += 4

    expectString('IVTX')
    expectInteger(4)

    const vertCount = dv.getUint32(offset, true)
    offset += 4

    expectString('IFRM')
    expectInteger(4)

    const frameCount = dv.getUint32(offset, true)
    offset += 4

    // Using 16-bit or 8-bit compressed vertices?
    if (flags & MF_COMPRESSED_16BIT) {
        const vtxChunkType = readString(4)
        offset += 4 // skip chunk size
        if (vtxChunkType === 'AV16') {
            // old 16-bit format
            throw new Error(`Vertice type 'AV16' in MDL file not yet supported!`)
        } else if (vtxChunkType === 'AV17') {
            // new 16-bit format
            for (let i = 0; i < vertCount * frameCount; i++) {
                const position = [
                    dv.getInt16(offset + 0, true),
                    dv.getInt16(offset + 2, true),
                    dv.getInt16(offset + 4, true),
                ]
                const normH = dv.getUint8(offset + 6)
                const normP = dv.getUint8(offset + 7)
                offset += 8
            }
        } else {
            throw new Error(`Unknown vertice format '${vtxChunkType}' in MDL file`)
        }
    } else {
        // 8-bit compressed vertices
        throw new Error(`8-bit 'AFVX' Vertice type in MDL file not yet supported!`)
    }

    expectString('AFIN')
    offset += 4 // skip size

    const frameAabBox = [] // Aab collision box per frame
    for (let i = 0; i < frameCount; i++) {
        frameAabBox.push({
            min: [
                dv.getFloat32(offset + 0, true),
                dv.getFloat32(offset + 4, true),
                dv.getFloat32(offset + 8, true),
            ],
            max: [
                dv.getFloat32(offset + 12, true),
                dv.getFloat32(offset + 16, true),
                dv.getFloat32(offset + 20, true),
            ]
        })
        offset += 24
    }

    // read main mip vertices
    expectString('AMMV')
    offset += 4 // skip size

    const mainMipVerts = []
    for (let i = 0; i < vertCount; i++) {
        mainMipVerts.push({
            position: [
                dv.getFloat32(offset + 0, true),
                dv.getFloat32(offset + 4, true),
                dv.getFloat32(offset + 8, true),
            ],
        })
        offset += 12
    }

    // Read mip vertice masks
    expectString('AVMK')
    offset += 4

    const vertexMipMasks = []
    for (let i = 0; i < vertCount; i++) {
        vertexMipMasks.push(
            dv.getUint32(offset, true)
        )
        offset += 4
    }

    expectString('IMIP')
    expectInteger(4)

    const mipLevelCount = dv.getUint32(offset, true)
    offset += 4

    expectString('FMIP')
    offset += 4 // skip size

    const mipSwitchFactors = []
    for (let i = 0; i < MAX_MODELMIPS; i++) {
        mipSwitchFactors.push(dv.getFloat32(offset, true))
        offset += 4
    }

    const modelMipInfo = []
    for (let i = 0; i < mipLevelCount; i++) {
        expectString('IPOL')
        offset += 4 // skip size
        const polygonCount = dv.getUint32(offset, true)
        offset += 4

        for (let j = 0; j < polygonCount; j++) {
            // ModelPolygon::Read
        }

        const iTexVertexCount = dv.getUint32(offset, true)
        offset += 4
        if (bHasPolygonsPerSurface) {
            const idChunk = readString(4)
            offset += 4 // skip chunk size

            const textureVertices = []
            for (let i = 0; i < iTexVertexCount; i++) {
                let member = {
                    uvw: [
                        dv.getFloat32(offset + 0, true),
                        dv.getFloat32(offset + 4, true),
                        dv.getFloat32(offset + 8, true), // 3D coordinate of one texture vertex
                    ],
                    uv: [
                        dv.getInt32(offset + 12, true),
                        dv.getInt32(offset + 16, true), // U,V mapping coordinates
                    ],
                    flags: dv.getUint32(offset + 20, true), // used for mapping
                    transformedVertex: dv.getUint32(offset + 24, true),
                }
 
                if (idChunk === 'TXV2') {
                    member.vU = [
                        dv.getFloat32(offset + 28, true),
                        dv.getFloat32(offset + 32, true),
                        dv.getFloat32(offset + 36, true),
                    ]
                    member.vV = [
                        dv.getFloat32(offset + 40, true),
                        dv.getFloat32(offset + 44, true),
                        dv.getFloat32(offset + 48, true),
                    ]
                    offset += 52
                } else {
                    offset += 28
                }
                textureVertices.push(member)
            }
        } else {
            throw new Error(`MDL unsupported UV format!`)
        }

        const mappingSurfaceCount = dv.getUint32(offset, true)
        offset += 4

        const mappingSurfaces = []
        for (let j = 0; j < mappingSurfaceCount; j++) {
            const nameLen = dv.getUint32(offset, true)
            const name = readString(nameLen)
            const surface2DOffset = [
                dv.getFloat32(offset + 0, true),
                dv.getFloat32(offset + 4, true),
                dv.getFloat32(offset + 8, true),
            ]
            offset += 12
            const hpb = [
                dv.getFloat32(offset + 0, true),
                dv.getFloat32(offset + 4, true),
                dv.getFloat32(offset + 8, true),
            ]
            offset += 12
            const zoom = dv.getFloat32(offset, true)
            offset += 4
            
        }

        modelMipInfo.push()
    }
}
