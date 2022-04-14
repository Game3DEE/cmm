// dat2png: Try to extract skin as png from .dat files of Playstation PSP .pak files
//          from Carnivores/IceAge games.

import * as fs from 'fs'
import { PNG } from 'pngjs'

const buf = fs.readFileSync(process.argv[2])

const geoCount = buf.readUInt32LE(0)
const geoOffset0 = buf.readUInt32LE(4)
const skinCount = buf.readUInt32LE(8)
const skinOffset = buf.readUint32LE(12)

const png = new PNG({
    width: 128,
    height: 128,
})

let offset = skinOffset
for (let i = 0; i < 128 * 128; i++) {
    png.data[i*4+0] = buf.readUint8(offset + 0)
    png.data[i*4+1] = buf.readUint8(offset + 1)
    png.data[i*4+2] = buf.readUint8(offset + 2)
    png.data[i*4+3] = buf.readUint8(offset + 3)
    offset += 4
}

fs.writeFileSync('skin.dat', buf.slice(skinOffset, skinOffset + 66592))
fs.writeFileSync('skin.png', PNG.sync.write(png))

// 66592 bytes for skin
// 22197 pixels in RGB
