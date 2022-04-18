import fs from 'fs'
import { KaitaiStream } from 'kaitai-struct'
import TRK from '../kaitai/vivisector_trk.js'
import { argv } from 'process'

for (let i = 2; i < argv.length; i++) {
    dumpTrack(argv[i])
}

function vec2str(v) {
    return `${v.x},${v.y},${v.z}`
}

function dumpTrack(filename) {
    const buf = fs.readFileSync(filename)
    const parsed = new TRK(new KaitaiStream(buf))

    console.log(`${filename}: bones: ${parsed.boneCount}, frames: ${parsed.frameMax+1}, fps: ${parsed.fps}`)
    parsed.bones.forEach(b => {
        console.log(`\t${b.name}`)
        b.blocks.forEach(bl => {
            console.log(`\t\t${bl.frameIndex}\t${bl.val2}\t0x${bl.val3.toString(16)}\t(${vec2str(bl.translate)})\t(${vec2str(bl.rotate)})\t(${vec2str(bl.scale)})`)
        })
    })
}
