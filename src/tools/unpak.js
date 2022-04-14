// unpak: unpack Playstation PSP .pak files (Carnivores/IceAge games)
import * as fs from 'fs'

const buf = fs.readFileSync(process.argv[2])

const fileCount = buf.readUint32LE(0)
let offset = 4

for (let i = 0; i < fileCount; i++) {
    let name = ''
    for (let j = 0; j < 140; j++) {
        const c = buf[offset+j]
        if (c === 0) break
        name += String.fromCharCode(c)
    }
    offset += 140

    let data_off1 = buf.readUInt32LE(offset - 4)
    let data_off2 = buf.readUInt32LE(offset - 8)
    let data_size = buf.readUInt32LE(offset - 12)
    fs.writeFileSync(name, buf.slice(data_off1, data_off1 + data_size))
}
