export function readFaces(dv, offset, faceCount) {
    const start = offset
    const faces = []
    for (let i = 0; i < faceCount; i++) {
        const faceInfo = {
            indices: [
                dv.getUint32(offset + 0, true),
                dv.getUint32(offset + 4, true),
                dv.getUint32(offset + 8, true),
            ],
            uvs: [
                dv.getInt32(offset + 12, true),
                dv.getInt32(offset + 24, true),
                dv.getInt32(offset + 16, true),
                dv.getInt32(offset + 28, true),
                dv.getInt32(offset + 20, true),
                dv.getInt32(offset + 32, true),
            ],
            flags: dv.getUint16(offset + 36, true),
            dmask: dv.getUint16(offset + 38, true),
            distant: dv.getInt32(offset + 40, true),
            next: dv.getUint32(offset + 44, true),
            group: dv.getUint32(offset + 48, true),
        }
        offset += 52 // data read
        offset += 12 // reserved
        faces.push(faceInfo)
    }

    return {
        faces,
        facesSize: offset - start,
    }
}

export function readVertices(dv, offset, vertCount) {
    const start = offset
    const vertices = []
    for (let i = 0; i < vertCount; i++) {
        const vertInfo = {
            position: [
                dv.getFloat32(offset + 0, true),
                dv.getFloat32(offset + 4, true),
                dv.getFloat32(offset + 8, true),
            ],
            bone: dv.getInt16(offset + 12, true),
            hide: dv.getUint16(offset + 14, true),
        }
        offset += 16
        vertices.push(vertInfo)
    }

    return {
        vertices,
        verticesSize: offset - start,
    }
}

export function writeFaces(dv, offset, faces) {
    const start = offset
    faces.forEach(face => {
        // write indices
        dv.setUint32(offset + 0, face.indices[0], true)
        dv.setUint32(offset + 4, face.indices[1], true)
        dv.setUint32(offset + 8, face.indices[2], true)
        // write uvs
        dv.setInt32(offset + 12, face.uvs[0], true)
        dv.setInt32(offset + 24, face.uvs[1], true)
        dv.setInt32(offset + 16, face.uvs[2], true)
        dv.setInt32(offset + 28, face.uvs[3], true)
        dv.setInt32(offset + 20, face.uvs[4], true)
        dv.setInt32(offset + 32, face.uvs[5], true)

        dv.setInt16(offset + 36, face.flags, true)
        dv.setInt16(offset + 38, face.dmask, true)
        dv.setInt32(offset + 40, face.distant, true)
        dv.setInt32(offset + 44, face.next, true)
        dv.setInt32(offset + 48, face.group, true)
        offset += 52 // data written
        offset += 12 // reserved
    })

    return offset - start
}

export function writeVertices(dv, offset, vertices) {
    const start = offset
    vertices.forEach(vert => {
        dv.setFloat32(offset + 0, vert.position[0], true),
        dv.setFloat32(offset + 4, vert.position[1], true),
        dv.setFloat32(offset + 8, vert.position[2], true),
        dv.setInt16(offset + 12, vert.bone, true),
        dv.setUint16(offset + 14, vert.hide || 0, true), // 3dn has no hide, so just default it to 0
        offset += 16
    })

    return offset - start
}
