export function load3DN(buffer) {
    const dv = new DataView(buffer)
    let offset = 0

    const vertCount = dv.getUint32(offset + 0, true)
    const faceCount = dv.getUint32(offset + 4, true)
    const boneCount = dv.getUint32(offset + 8, true)
    offset += 12

    let name = ''
    for (let j = 0; j < 32; j++) {
        let c = dv.getUint8(offset + j)
        if (c === 0) break
        name += String.fromCharCode(c)
    }
    offset += 32

    let sprite = ''
    const hasSprite = dv.getUint32(offset, true)
    offset += 4
    if (hasSprite) {
        for (let j = 0; j < 32; j++) {
            let c = dv.getUint8(offset + j)
            if (c === 0) break
            sprite += String.fromCharCode(c)
        }
        offset += 32
    }

    const vertices = []
    for (let i = 0; i < vertCount; i++) {
        vertices.push({
            position: [
                dv.getFloat32(offset + 0, true),
                dv.getFloat32(offset + 4, true),
                dv.getFloat32(offset + 8, true),
            ],
            bone: dv.getInt32(offset + 12, true),
        })
        offset += 16
    }

    const faces = []
    for (let i = 0; i < faceCount; i++) {
        faces.push({
            indices: [
                dv.getUint32(offset + 0, true),
                dv.getUint32(offset + 4, true),
                dv.getUint32(offset + 8, true),
            ],
            uvs: [
                dv.getInt16(offset + 12, true),
                dv.getInt16(offset + 14, true),
                dv.getInt16(offset + 16, true),
                dv.getInt16(offset + 18, true),
                dv.getInt16(offset + 20, true),
                dv.getInt16(offset + 22, true),
            ],
            flags: dv.getUint16(offset + 24, true),
            dmask: dv.getUint16(offset + 26, true),
            distant: dv.getUint32(offset + 28, true),
            next: dv.getUint32(offset + 32, true),
            group: dv.getUint32(offset + 36, true),
        })
        offset += 40
        offset += 12 // reserved
    }

    const bones = []
    for (let i = 0; i < boneCount; i++) {
        let name = ''
        for (let j = 0; j < 32; j++) {
            let c = dv.getUint8(offset + j)
            if (c === 0) break
            name += String.fromCharCode(c)
        }
        offset += 32
        bones.push({
            name,
            position: [
                dv.getFloat32(offset + 0, true),
                dv.getFloat32(offset + 4, true),
                dv.getFloat32(offset + 8, true),
            ],
            parent: dv.getInt16(offset + 12, true),
            hidden: dv.getInt16(offset + 14, true),
        })
        offset += 16
    }

    return {
        name,
        sprite,
        vertices,
        faces,
        bones,
    }
}


export function save3DN(model) {
    const boneCount = model.bones?.length || 0
    const sizeBytes = 
        12 + // header
        32 + // name
        4 + // hasSprite + no sprite (TODO!)
        model.vertices.length * 16 +
        model.faces.length * 52 +
        boneCount * 48

    const buffer = new ArrayBuffer(sizeBytes)
    const dv = new DataView(buffer)

    let offset = 0

    dv.setUint32(offset + 0, model.vertices.length, true)
    dv.setUint32(offset + 4, model.faces.length, true)
    dv.setUint32(offset + 8, boneCount, true)
    offset += 12

    for (let j = 0; j < 32; j++) {
        let c = j < model.name.length ? model.name.charCodeAt(j) : 0
        dv.setUint8(offset + j, c)
    }
    offset += 32

    let sprite = model.sprite || ''
    dv.setUint32(offset, sprite.length > 0, true)
    offset += 4

    if (sprite.length) {
        for (let j = 0; j < 32; j++) {
            let c = j < sprite.length ? sprite.charCodeAt(j) : 0
            dv.setUint8(offset + j)
        }
        offset += 32
    }

    model.vertices.forEach(v => {
        dv.setFloat32(offset + 0, v.position[0], true),
        dv.setFloat32(offset + 4, v.position[1], true),
        dv.setFloat32(offset + 8, v.position[2], true),
        dv.setInt32(offset + 12, v.bone, true),
        offset += 16
    })

    model.faces.forEach(f => {
        dv.setUint32(offset + 0, f.indices[0], true)
        dv.setUint32(offset + 4, f.indices[1], true)
        dv.setUint32(offset + 8, f.indices[2], true)

        dv.setInt16(offset + 12, f.uvs[0], true)
        dv.setInt16(offset + 14, f.uvs[1], true)
        dv.setInt16(offset + 16, f.uvs[2], true)
        dv.setInt16(offset + 18, f.uvs[3], true)
        dv.setInt16(offset + 20, f.uvs[4], true)
        dv.setInt16(offset + 22, f.uvs[5], true)

        dv.getUint16(offset + 24, f.flags, true),
        dv.getUint16(offset + 26, f.dmask, true),
        dv.getUint32(offset + 28, f.distant, true),
        dv.getUint32(offset + 32, f.next, true),
        dv.getUint32(offset + 36, f.group, true),
        offset += 40
        offset += 12 // reserved
    })

    model.bones?.forEach(b => {
        for (let j = 0; j < 32; j++) {
            let c = j < b.name.length ? b.name.charCodeAt(j) : 0
            dv.setUint8(offset + j, c)
        }
        offset += 32
        dv.setFloat32(offset + 0, b.position[0], true)
        dv.setFloat32(offset + 4, b.position[1], true)
        dv.setFloat32(offset + 8, b.position[2], true)

        dv.setInt16(offset + 12, b.parent, true)
        dv.getInt16(offset + 14, b.hidden, true)
        offset += 16
    })

    return buffer
}