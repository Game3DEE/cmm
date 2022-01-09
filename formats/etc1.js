const ETC1_ENCODED_BLOCK_SIZE = 8
const ETC1_DECODED_BLOCK_SIZE = 48

const kModifierTable = [
    /* 0 */2, 8, -2, -8,
    /* 1 */5, 17, -5, -17,
    /* 2 */9, 29, -9, -29,
    /* 3 */13, 42, -13, -42,
    /* 4 */18, 60, -18, -60,
    /* 5 */24, 80, -24, -80,
    /* 6 */33, 106, -33, -106,
    /* 7 */47, 183, -47, -183
]

 const kLookup = [ 0, 1, 2, 3, -4, -3, -2, -1 ]

function clamp(x) {
    return x >= 0 ? (x < 255 ? x : 255) : 0
}

function convert4To8(b) {
    let c = b & 0xf;
    return (c << 4) | c;
}

function convert5To8(b) {
    let c = b & 0x1f;
    return (c << 3) | (c >> 2);
}

function convert6To8(b) {
    let c = b & 0x3f;
    return (c << 2) | (c >> 4);
}

function divideBy255(d) {
    return (d + 128 + (d >> 8)) >> 8;
}

function convert8To4(b) {
	//int c = b & 0xff;
    return divideBy255(b * 15);
}

function convert8To5(b) {
	//int c = b & 0xff;
    return divideBy255(b * 31);
}

function convertDiff(base, diff) {
    return convert5To8((0x1f & base) + kLookup[0x7 & diff]);
}

function decode_subblock(pOut, r, g, b, tableOff, low, second, flipped) {
    let baseX = 0;
    let baseY = 0;
    let i;

    if (second) {
        if (flipped) {
            baseY = 2;
        } else {
            baseX = 2;
        }
    }
    for (i = 0; i < 8; i++) {
        let x, y;
        if (flipped) {
            x = baseX + (i >> 1);
            y = baseY + (i & 1);
        } else {
            x = baseX + (i >> 2);
            y = baseY + (i & 3);
        }
        let k = y + (x * 4);
        let offset = ((low >> k) & 1) | ((low >> (k + 15)) & 2);
        let delta = kModifierTable[tableOff + offset];
        let q = 3 * (x + 4 * y);
        pOut[q++] = clamp(r + delta);
        pOut[q++] = clamp(g + delta);
        pOut[q++] = clamp(b + delta);
    }
}

// Input is an ETC1 compressed version of the data.
// Output is a 4 x 4 square of 3-byte pixels in form R, G, B

function etc1_decode_block(pIn, pOut) {
    let high = (pIn[0] << 24) | (pIn[1] << 16) | (pIn[2] << 8) | pIn[3];
    let low = (pIn[4] << 24) | (pIn[5] << 16) | (pIn[6] << 8) | pIn[7];
    let r1, r2, g1, g2, b1, b2;
    if (high & 2) {
        // differential
        let rBase = high >> 27;
        let gBase = high >> 19;
        let bBase = high >> 11;
        r1 = convert5To8(rBase);
        r2 = convertDiff(rBase, high >> 24);
        g1 = convert5To8(gBase);
        g2 = convertDiff(gBase, high >> 16);
        b1 = convert5To8(bBase);
        b2 = convertDiff(bBase, high >> 8);
    } else {
        // not differential
        r1 = convert4To8(high >> 28);
        r2 = convert4To8(high >> 24);
        g1 = convert4To8(high >> 20);
        g2 = convert4To8(high >> 16);
        b1 = convert4To8(high >> 12);
        b2 = convert4To8(high >> 8);
    }
    let tableIndexA = 7 & (high >> 5);
    let tableIndexB = 7 & (high >> 2);
    let tableA = tableIndexA * 4;
    let tableB = tableIndexB * 4;
	let flipped = (high & 1) != 0;
	decode_subblock(pOut, r1, g1, b1, tableA, low, 0, flipped);
	decode_subblock(pOut, r2, g2, b2, tableB, low, 1, flipped);
}

// Decode an entire image.
// pIn - pointer to encoded data.
// pOut - pointer to the image data. Will be written such that the Red component of
//       pixel (x,y) is at pIn + pixelSize * x + stride * y + redOffset. Must be
//        large enough to store entire image.


export function etc1_decode_image(pAllIn, pOut, width, height, pixelSize, stride) {
    let pInOffset = 0

    if (pixelSize < 2 || pixelSize > 3) {
        return -1;
    }
    let block = new Uint8ClampedArray(ETC1_DECODED_BLOCK_SIZE)

    let encodedWidth = (width + 3) & ~3;
    let encodedHeight = (height + 3) & ~3;

    for (let y = 0; y < encodedHeight; y += 4) {
        let yEnd = height - y;
        if (yEnd > 4) {
            yEnd = 4;
        }
        for (let x = 0; x < encodedWidth; x += 4) {
            let xEnd = width - x;
            if (xEnd > 4) {
                xEnd = 4;
            }
            const pIn = new Uint8ClampedArray(pAllIn.buffer, pAllIn.byteOffset + pInOffset, ETC1_ENCODED_BLOCK_SIZE)
            etc1_decode_block(pIn, block);
            pInOffset += ETC1_ENCODED_BLOCK_SIZE;
            for (let cy = 0; cy < yEnd; cy++) {
                let q = (cy * 4) * 3;
                let p = pixelSize * x + stride * (y + cy);
                if (pixelSize == 3) {
                    for (let i = 0; i < xEnd * 3; i++) {
                        pOut[p + i] = block[q + i]
                    }
                } else {
                    throw new Error(`pixelSize = ${pixelSize}, expected 3!`)
                    /* XXX TODO No need for 16bit support right now
                    for (let cx = 0; cx < xEnd; cx++) {
                        let r = *q++;
                        let g = *q++;
                        let b = *q++;
                        let pixel = ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3);
                        *p++ = pixel;
                        *p++ = pixel >> 8;
                    }*/
                }
            }
        }
    }

    return 0;
}
