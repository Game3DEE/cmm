import * as fs from 'fs'
import { KaitaiStream } from 'kaitai-struct'
import GDT from '../kaitai/prism3d_gdt.js'

const flags = {}

while(process.argv.length > 2) {
    const fname = process.argv[2]
    
    try {
        const parsed = new GDT(new KaitaiStream(fs.readFileSync(fname)))

        parsed.models.forEach((m,idx) => {
            if (m.flags < 90 || m.flags > 512) {
                console.log(fname, idx, m.flags)
            }
            if (flags[m.flags] === undefined) {
                flags[m.flags] = 0
            }
            flags[m.flags]++
        })
    } catch(e) {
        console.log(fname, e)
    }

    process.argv.shift()
}

console.log(flags)
