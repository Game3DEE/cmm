import fs from 'node:fs';
import process from 'node:process';

const buf = fs.readFileSync(process.argv[2])

if (buf.toString('ascii', 0,4) == 'FNYS') {
    // v1 SYN file
    const numFiles = buf.readUint32LE(4);
    // [8] = uint32 = 0
    // [12] = uint32 = 0
    let offset = 16;
    for (let i = 0; i < numFiles; i++) {
        let namelen = 0;
        for (let j = 0; j < 24; j++) {
            if (buf[offset + j] != 0) {
                namelen += 1
            } else {
                break
            }
        }
        let name = buf.toString('ascii', offset, offset + namelen)
        const data_off = buf.readUint32LE(offset + 24);
        const data_size = buf.readUint32LE(offset + 28);
        console.log(name, data_off.toString(16), data_size.toString(16), buf.readUint32LE(data_off).toString(16))
        fs.writeFileSync(name, buf.slice(data_off, data_off + data_size))
        offset += 32
    }
}
