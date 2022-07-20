import { load3DF } from '../formats/3df.js'
import { writeFileSync, readFileSync } from 'fs'
import { PNG } from 'pngjs'

const { model } = load3DF(readFileSync(process.argv[2]).buffer)
const texture = convertTexture(model.texture, model.textureSize)

const sfOpacity = 4
const sfTransparent = 8

model.faces.forEach(face => {
    if (face.flags & sfOpacity) {
        //console.log(`sfOpacity`, face.uvs)
        fillAlphaTriangle(
            texture.data, texture.width, texture.height, // texture data
            ...face.uvs, // array of 3 x/y integer values
            undefined, // based on pixel in texture
        )
    }
    /*
    if (face.flags & sfTransparent) {
        console.log(`sfTransparent`)
        fillAlphaTriangle(
            texture.data, texture.width, texture.height, // texture data
            ...face.uvs, // array of 3 x/y integer values
            128, // TODO: check proper values & handle sfDark?
        )
    }
    */
})

const png = new PNG({
    width: texture.width,
    height: texture.height,
})

texture.data.forEach((v,i) => png.data[i] = v)

writeFileSync('alpha.png', PNG.sync.write(png))

function convertTexture(texture, textureBytes) {
    // Bail out early if we have no texture data
    if (!textureBytes) {
        return null
    }

    const width = 256
    const height = (textureBytes / 2) / width
    const data = new Uint8ClampedArray(width * height * 4)

    for (let i = 0; i < texture.length; i++) {
        let pixel = texture[i]
        let r = ((pixel >>> 10) & 0x1f);
        let g = ((pixel >>>  5) & 0x1f);
        let b = ((pixel >>>  0) & 0x1f);
    
        data[i*4 +0] = r << 3;
        data[i*4 +1] = g << 3;
        data[i*4 +2] = b << 3;
        data[i*4 +3] = 255
    }

    return {
        width,
        height,
        data
    }
}


// Fill a triangle in the alpha channel of a texture
// pixels => ptr to RGBA Uint8Array
// width => width of texture in pixels
// width => height of texture in pixels
// x,y,x1,y1,x2,y2 => coordinates for triangle
// color => 0 = base alpha value on color, other = exact value to use
function fillAlphaTriangle(pixels,width,height, x0,y0,x1,y1,x2,y2, color) {
    let tmp = 0
    // sort the points vertically
    if (y1 > y2) {
        tmp = x1; x1 = x2; x2 = tmp
        tmp = y1; y1 = y2; y2 = tmp
    }
    if (y0 > y1) {
        tmp = x0; x0 = x1; x1 = tmp
        tmp = y0; y0 = y1; y1 = tmp
    }
    if (y1 > y2) {
        tmp = x1; x1 = x2; x2 = tmp
        tmp = y1; y1 = y2; y2 = tmp
    }

    //console.log(x0,y0,x1,y1,x2,y2)

    const dx_far = (x2 - x0) / (y2 - y0 + 1)
    const dx_upper = (x1 - x0) / (y1 - y0 + 1)
    const dx_low = (x2 - x1) / (y2 - y1 + 1)

    let xf = x0
    let xt = x0 + dx_upper // if y0 == y1, special case

    function calcAlpha(offset) {
        const pix = (pixels[offset+0] + pixels[offset+1] + pixels[offset+2]) / 3
        if (pix < 32) // find good margin
            return 0

        return 255
    }

    let offset = 0
    for (let y = y0; y <= ((y2 > height-1) ? height-1 : y2); y++) {
        if (y >= 0) {
            for (let x = ((xf > 0) ? Math.floor(xf) : 0); x <= ((xt < width) ? xt : width-1) ; x++) {
                offset = Math.floor(x + y * width) * 4
                pixels[offset +3] = color ? color : calcAlpha(offset)
            }
            for (let x = ((xf < width) ? Math.floor(xf) : width-1); x >= ((xt > 0) ? xt : 0); x--) {
                offset = Math.floor(x + y * width) * 4
                pixels[offset +3] = color ? color : calcAlpha(offset)
            }
        }
        xf += dx_far
        if (y < y1)
            xt += dx_upper
        else
            xt += dx_low
    }
}
