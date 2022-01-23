import fs from 'fs'
import path from 'path'

import { loadRSC } from '../formats/rsc.js'
import { loadMAP } from '../formats/map.js'
import { saveTGA } from '../formats/tga.js'

const fname = process.argv[2]

const baseName = path.basename(fname, '.MAP')
const dirName = path.dirname(fname)
const rscName = path.join(dirName, baseName + '.RSC')

const mapBuf = fs.readFileSync(fname)
const rscBuf = fs.readFileSync(rscName)

const map = loadMAP(mapBuf.buffer)
const rsc = loadRSC(rscBuf.buffer, map.version)

let atlasSize // set in createTextureAltas
const atlasTileSize = 128

createTextureAtlas(rsc)

fs.writeFileSync(`${baseName}.OBJ`, generateGeometry(rsc), 'utf8') // write TGA texture atlas


export function generateGeometry() {
    const mapIdx = (x,y) => y * map.size + x
    let s = ''
    // Get number of textures per row in our atlas
    const textureDim = atlasSize / atlasTileSize;
    // size of one texture in our map in UV coordinates (they are 0...1)
    const uvStep = 1 / textureDim;
    let uvidx = 0;
    // Loop through the entire map
    for (let y = 0; y < map.size - 1; y++) {
        for (let x = 0; x < map.size - 1; x++) {
            // Get the texture number
            const tidx = map.tex1Map[map.size * y + x];
            // get the rotation of the texture
            const rot = map.flags1[map.size * y + x] & 3;
            // calculate position of texture from atlas in UV coords
            const ty = Math.floor(tidx / textureDim) * uvStep;
            const tx = Math.floor(tidx % textureDim) * uvStep;
            // Okay, the code here gets a little messy, and could be optimised,
            // but at least it reads nicer then the Carnivores code itself :P

            // Four positions in uvmap to use
            const coords = [
                [0, 0],
                [0, uvStep],
                [uvStep, 0], // first triangle UV
                [uvStep, uvStep],
            ];
            // map coordinates to all 6 vertices used for this grid square
            let a = 0, b = 1, c = 2, d = 1, e = 3, f = 2;
            // ... and take rotation into account
            switch (rot) {
                case 0: break; // default no rotation
                case 1: // 90deg
                    a = 1; b = d = 3; c = f = 0; e = 2;
                    break;
                case 2: // 180deg
                    a = 3; b = d = 2; c = f = 1; e = 0;
                    break;
                case 3: // 270deg
                    a = 2; b = d = 0; c = f = 3; e = 1;
                    break;
            }
            // Generate uv coordinates
            s += `vt ${tx + coords[a][0]} ${ty + coords[a][1]}\n`
            s += `vt ${tx + coords[b][0]} ${ty + coords[b][1]}\n`
            s += `vt ${tx + coords[c][0]} ${ty + coords[c][1]}\n`
            s += `vt ${tx + coords[d][0]} ${ty + coords[d][1]}\n`
            s += `vt ${tx + coords[e][0]} ${ty + coords[e][1]}\n`
            s += `vt ${tx + coords[f][0]} ${ty + coords[f][1]}\n`

            // generate vertices (for whole quad)
            const ulHeight = map.heightMap[mapIdx(x,y)] * map.yScale
            const urHeight = map.heightMap[mapIdx(x+1,y)] * map.yScale
            const dlHeight = map.heightMap[mapIdx(x,y+1)] * map.yScale
            const drHeight = map.heightMap[mapIdx(x+1,y+1)] * map.yScale
            s += `v ${x * 256} ${ulHeight} ${y * 256}\n`
            s += `v ${x * 256} ${dlHeight} ${(y+1) * 256}\n`
            s += `v ${(x+1) * 256} ${urHeight} ${y * 256}\n`
            s += `v ${x * 256} ${dlHeight} ${(y+1) * 256}\n`
            s += `v ${(x+1) * 256} ${drHeight} ${(y+1) * 256}\n`
            s += `v ${(x+1) * 256} ${urHeight} ${y * 256}\n`

            // generate faces (for whole quad)
            s += `f ${uvidx+1}/${uvidx+1} ${uvidx+2}/${uvidx+2} ${uvidx+3}/${uvidx+3}\n`
            s += `f ${uvidx+4}/${uvidx+4} ${uvidx+5}/${uvidx+5} ${uvidx+6}/${uvidx+6}\n`
            uvidx += 6
        }
    }

    return s
}


function createTextureAtlas(rsc) {
    const terrainTexSize = 128
    const textureDim = Math.ceil(Math.sqrt(rsc.textureCount));

    // Calculate W/H of atlas (we make a square texture atlas)
    atlasSize = textureDim * terrainTexSize // width/height of atlas tex

    // allocate data
    const data = new Uint8ClampedArray(atlasSize * atlasSize * 4)

    // Now go over all textures...
    for (let i = 0; i < rsc.textureCount; i++) {
        // Determine where in the atlas grid this texture should go
        let top = Math.floor(i / textureDim)
        let left = Math.floor(i % textureDim)
        // ... and the actual byte offset in our data
        let outOffset = (top * atlasSize * terrainTexSize + left * terrainTexSize) * 4
        // Now go over the texture and decode the 16 bit texture into our 32 bit one
        const srcOffset = i * terrainTexSize * terrainTexSize
        for (let y = 0; y < terrainTexSize; y++) {
            for (let x = 0; x < terrainTexSize; x++) {
                const pixel = rsc.textures[srcOffset + y * terrainTexSize + x]
                data[outOffset++] = (pixel >> 10) << 3
                data[outOffset++] = ((pixel >> 5) & 31) << 3
                data[outOffset++] = (pixel & 31) << 3
                data[outOffset++] = 255
            }
            outOffset -= terrainTexSize * 4
            outOffset += atlasSize * 4
        }
    }

    fs.writeFileSync(`${baseName}.TGA`, 
        new Uint8ClampedArray(
            saveTGA({ width: atlasSize, height: atlasSize, data }, 32)
        )
    )
}


/*
0,0,0
0,0,1
1,0,0
0,0,1
1,0,1
1,0,0
*/
