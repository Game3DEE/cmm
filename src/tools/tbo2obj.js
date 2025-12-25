import fs from 'node:fs';
import process from 'node:process';

const buf = fs.readFileSync(process.argv[2])

const numVerts = buf.readUint16LE(0);
const numTris = buf.readUint16LE(2);
let off = 4;
for (let i = 0; i < numVerts; i++) {
    const x = buf.readFloatLE(off +0)
    const y = buf.readFloatLE(off +4)
    const z = buf.readFloatLE(off +8)
    off += 12
    console.log(`v ${x} ${y} ${z}`)
}
// hellcat_dt1.tbo
//0x3f8c = 16268
//0x13d = 317
