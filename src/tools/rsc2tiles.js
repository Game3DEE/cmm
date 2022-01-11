import fs from 'fs'
import path from 'path'
import { loadRSC } from '../formats/rsc.js'
import { PNG } from 'pngjs'

const rscBuf = fs.readFileSync(process.argv[2])
const rsc = loadRSC(rscBuf.buffer, 1)

const terrainTexSize = 128

for (let i = 0; i < rsc.textureCount; i++) {
    const texOff = i * terrainTexSize * terrainTexSize
    const png = new PNG({ width: terrainTexSize, height: terrainTexSize })
    let offset = 0
    for (let i = 0; i < terrainTexSize * terrainTexSize; i++) {
        const pixel = rsc.textures[texOff + i]
        png.data[offset++] = ((pixel >> 10) & 0x1f) << 3;
        png.data[offset++] = ((pixel >> 5) & 0x1f) << 3;
        png.data[offset++] = ((pixel >> 0) & 0x1f) << 3;
        png.data[offset++] = 255
    }
    fs.writeFileSync(`tile${i}.png`, PNG.sync.write(png))
}