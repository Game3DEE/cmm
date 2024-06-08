import { load3DF } from '../formats/3df.js'
import { writeFileSync, readFileSync } from 'fs'
import { PNG } from 'pngjs'
import { Vector2 } from 'three'

const { model } = load3DF(readFileSync(process.argv[2]).buffer)
const texture = convertTexture(model.texture, model.textureSize)

const sfOpacity = 4
const sfTransparent = 8

const png = new PNG({
    width: texture.width,
    height: texture.height,
})

texture.data.forEach((v,i) => png.data[i] = v)

writeFileSync('orig.png', PNG.sync.write(png))

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
// Algo from: http://www.sunshine2k.de/coding/java/TriangleRasterization/TriangleRasterization.html
function fillAlphaTriangle(pixels,width,height, x1,y1,x2,y2,x3,y3) {
    /* get the bounding box of the triangle */
    const maxX = Math.max(x1, Math.max(x2, x3));
    const minX = Math.min(x1, Math.min(x2, x3));
    const maxY = Math.max(y1, Math.max(y2, y3));
    const minY = Math.min(y1, Math.min(y2, y3));

    const vs1 = new Vector2(x2 - x1, y2 - y1);
    const vs2 = new Vector2(x3 - x1, y3 - y1);
    
    let q = new Vector2()

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            q.set(x - x1, y - y1);

            let s = q.cross(vs2) / vs1.cross(vs2);
            let t = vs1.cross(q) / vs1.cross(vs2);

            if ( (s >= 0) && (t >= 0) && (s + t <= 1)) {
                /* inside triangle */
                var pixOff = ((y * width) + x) * 4
                if (!pixels[pixOff+0] && !pixels[pixOff+1] && !pixels[[pixOff+2]]) {
                    // If pixel is black; make it transparent
                    pixels[pixOff+3] = 0
                }
            }
        }
    }
}
