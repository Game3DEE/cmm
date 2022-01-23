// void DecompressBlockDXT1(): Decompresses one block of a DXT1 texture and stores the resulting pixels at the appropriate offset in 'image'.
//
// unsigned long x:                     x-coordinate of the first pixel in the block.
// unsigned long y:                     y-coordinate of the first pixel in the block.
// unsigned long width:                 width of the texture being decompressed.
// unsigned long height:                height of the texture being decompressed.
// const unsigned char *blockStorage:   pointer to the block to decompress.
// unsigned long *image:                pointer to image where the decompressed pixel data should be stored.

function DecompressBlockDXT1(x, y, width, dv, offset, image) {
    const color0 = dv.getUint16(offset, true)
    const color1 = dv.getUint16(offset + 2, true)

    let temp = (color0 >> 11) * 255 + 16;
    const r0 = Math.floor((temp/32 + temp)/32) & 0xff;
    temp = ((color0 & 0x07E0) >> 5) * 255 + 32;
    const g0 = Math.floor((temp/64 + temp)/64) & 0xff;
    temp = (color0 & 0x001F) * 255 + 16;
    const b0 = Math.floor((temp/32 + temp)/32) & 0xff;

    temp = (color1 >> 11) * 255 + 16;
    const r1 = Math.floor((temp/32 + temp)/32) & 0xff;
    temp = ((color1 & 0x07E0) >> 5) * 255 + 32;
    const g1 = Math.floor((temp/64 + temp)/64) & 0xff;
    temp = (color1 & 0x001F) * 255 + 16;
    const b1 = Math.floor((temp/32 + temp)/32) & 0xff;

    const code = dv.getUint32(offset + 4, true);

    for (let j=0; j < 4; j++)
    {
        for (let i=0; i < 4; i++)
        {
            let finalColor = 0;
            let positionCode = (code >>  2*(4*j+i)) & 0x03;

            if (color0 > color1)
            {
                switch (positionCode)
                {
                    case 0:
                        finalColor = [ r0, g0, b0, 255 ]
                        break
                    case 1:
                        finalColor = [ r1, g1, b1, 255 ]
                        break
                    case 2:
                        finalColor = [ (2*r0+r1)/3, (2*g0+g1)/3, (2*b0+b1)/3, 255 ]
                        break
                    case 3:
                        finalColor = [ (r0+2*r1)/3, (g0+2*g1)/3, (b0+2*b1)/3, 255 ]
                        break
                }
            }
            else
            {
                switch (positionCode)
                {
                    case 0:
                        finalColor = [ r0, g0, b0, 255 ]
                        break
                    case 1:
                        finalColor = [ r1, g1, b1, 255 ]
                        break
                    case 2:
                        finalColor = [ (r0+r1)/2, (g0+g1)/2, (b0+b1)/2, 255 ]
                        break;
                    case 3:
                        finalColor = [ 0, 0, 0, 255 ]
                        break;
                }
            }

            if (x + i < width) {
				const off = ((y + j)*width + (x + i)) * 4
                image[off + 0] = finalColor[0]
                image[off + 1] = finalColor[1]
                image[off + 2] = finalColor[2]
                image[off + 3] = finalColor[3]
			}
        }
    }
}

// void BlockDecompressImageDXT1(): Decompresses all the blocks of a DXT1 compressed texture and stores the resulting pixels in 'image'.
//
// unsigned long width:                 Texture width.
// unsigned long height:                Texture height.
// const unsigned char *blockStorage:   pointer to compressed DXT1 blocks.
// unsigned long *image:                pointer to the image where the decompressed pixels will be stored.

export function BlockDecompressImageDXT1(width, height, buffer, dataOffset, image) {
    const blockCountX = Math.floor((width + 3) / 4)
    const blockCountY = Math.floor((height + 3) / 4)
    const blockWidth = (width < 4) ? width : 4
    const blockHeight = (height < 4) ? height : 4

	const dv = new DataView(buffer, dataOffset)
	let offset = 0
    for (let j = 0; j < blockCountY; j++) {
        for (let i = 0; i < blockCountX; i++) {
			DecompressBlockDXT1(i*4, j*4, width, dv, offset + i * 8, image)
		}
        offset += blockCountX * 8
    }
}

/*
 * DecompressBlockDXT5(): Decompresses one block of a DXT5 texture and stores the resulting pixels at the appropriate offset in 'image'.
 *
 * x:						x-coordinate of the first pixel in the block.
 * y:						y-coordinate of the first pixel in the block.
 * width: 				width of the texture being decompressed.
 */

function DecompressBlockDXT5(x, y, width, dv, offset, image) {
	const alpha0 = dv.getUint8(offset);
	const alpha1 = dv.getUint8(offset + 1);
 
	const bits = [
        dv.getUint8(offset + 2),
        dv.getUint8(offset + 3),
        dv.getUint8(offset + 4),
        dv.getUint8(offset + 5),
        dv.getUint8(offset + 6),
        dv.getUint8(offset + 7),
    ]
        
	const alphaCode1 = bits[2] | (bits[3] << 8) | (bits[4] << 16) | (bits[5] << 24);
	const alphaCode2 = bits[0] | (bits[1] << 8);
 
	const color0 = dv.getUint16(offset + 8, true);
	const color1 = dv.getUint16(offset + 10, true);	
 
	let temp = (color0 >> 11) * 255 + 16;
	const r0 = Math.floor((temp/32 + temp)/32) & 0xff;
	temp = ((color0 & 0x07E0) >> 5) * 255 + 32;
	const g0 = Math.floor((temp/64 + temp)/64) & 0xff;
	temp = (color0 & 0x001F) * 255 + 16;
	const b0 = Math.floor((temp/32 + temp)/32) & 0xff;
 
	temp = (color1 >> 11) * 255 + 16;
	const r1 = Math.floor((temp/32 + temp)/32) & 0xff;
	temp = ((color1 & 0x07E0) >> 5) * 255 + 32;
	const g1 = Math.floor((temp/64 + temp)/64) & 0xff;
	temp = (color1 & 0x001F) * 255 + 16;
	const b1 = Math.floor((temp/32 + temp)/32) & 0xff;
 
	const code = dv.getUint32(offset + 12, true);
 
	for (let j=0; j < 4; j++)
	{
		for (let i=0; i < 4; i++)
		{
			let alphaCodeIndex = 3*(4*j+i);
			let alphaCode;
 
			if (alphaCodeIndex <= 12)
			{
				alphaCode = (alphaCode2 >> alphaCodeIndex) & 0x07;
			}
			else if (alphaCodeIndex == 15)
			{
				alphaCode = (alphaCode2 >> 15) | ((alphaCode1 << 1) & 0x06);
			}
			else // alphaCodeIndex >= 18 && alphaCodeIndex <= 45
			{
				alphaCode = (alphaCode1 >> (alphaCodeIndex - 16)) & 0x07;
			}
 
			let finalAlpha;
			if (alphaCode == 0)
			{
				finalAlpha = alpha0;
			}
			else if (alphaCode == 1)
			{
				finalAlpha = alpha1;
			}
			else
			{
				if (alpha0 > alpha1)
				{
					finalAlpha = ((8-alphaCode)*alpha0 + (alphaCode-1)*alpha1)/7;
				}
				else
				{
					if (alphaCode == 6)
						finalAlpha = 0;
					else if (alphaCode == 7)
						finalAlpha = 255;
					else
						finalAlpha = ((6-alphaCode)*alpha0 + (alphaCode-1)*alpha1)/5;
				}
			}
 
			let colorCode = (code >> 2*(4*j+i)) & 0x03;
 
			let finalColor;
			switch (colorCode)
			{
				case 0:
					finalColor = [ r0, g0, b0, finalAlpha ]
					break;
				case 1:
					finalColor = [ r1, g1, b1, finalAlpha ]
					break;
				case 2:
					finalColor = [ (2*r0+r1)/3, (2*g0+g1)/3, (2*b0+b1)/3, finalAlpha ]
					break;
				case 3:
					finalColor = [ (r0+2*r1)/3, (g0+2*g1)/3, (b0+2*b1)/3, finalAlpha ]
					break;
			}
 
			if (x + i < width) {
                const off = ((y + j)*width + (x + i)) * 4
                image[off + 0] = finalColor[0]
                image[off + 1] = finalColor[1]
                image[off + 2] = finalColor[2]
                image[off + 3] = finalColor[3]
            }
		}
	}
}

/*
 * BlockDecompressImageDXT5: Decompresses all the blocks of a DXT5 compressed texture and stores the resulting pixels in 'image'.
 * 
 * width: width of image
 * height: height of image
 * buffer: ArrayBuffer containing compressed data
 * offset: offset in `buffer` where compressed data starts
 * image: Uint8ClampedArray storage for output image (size should be width * height * 4)
 */
export function BlockDecompressImageDXT5(width, height, buffer, dataOffset, image) {
	const blockCountX = Math.floor((width + 3) / 4)
	const blockCountY = Math.floor((height + 3) / 4)
	const blockWidth = (width < 4) ? width : 4
	const blockHeight = (height < 4) ? height : 4

    const dv = new DataView(buffer, dataOffset)
    let offset = 0

	for (let j = 0; j < blockCountY; j++) {
		for (let i = 0; i < blockCountX; i++) {
            DecompressBlockDXT5(i*4, j*4, width, dv, offset + i * 16, image)
        }

		offset += blockCountX * 16
	}
}
