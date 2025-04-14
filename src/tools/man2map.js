// man2map arguments:
//     0: area name
//     1: obb data path
//     2: product name (DinHunter)

import { loadMAN } from '../formats/man.js'
import { saveMAP } from '../formats/map.js'
import { loadRST } from '../formats/rst.js'
import { loadPKM } from '../formats/pkm.js'
import { loadTGA } from '../formats/tga.js'
import { saveRSC } from '../formats/rsc.js'

import fs from 'fs'
import path from 'path'
import { exec, execSync } from 'child_process'

import FileHound from 'filehound'
import { PNG } from 'pngjs'

const RSC_MAX_VOLUME = 64 // max integer value for sound volume
const RSC_DEFAULT_VOLUME = 64 // integer value for sound volume when not specified

// Get arguments (and defaults)
const areaName = process.argv[2]
const basePath = process.argv[3]
const productName = process.argv[4] || 'assets'

async function loadTexture(baseName) {
    const files = await FileHound.create()
        .paths(path.join(basePath, `${productName}/textures`))
        .match(`${baseName}.*`)
        .find()

    if (!files.length) {
        throw Error(`Unable to find texture "${baseName}"!`)
    }
    if (files.length > 1) {
        throw Error(`Found multiple matches for "${baseName}": ${files.join(',')}!`)
    }

    const tex = fs.readFileSync(files[0])
    const texType = path.extname(files[0])
    switch(texType.toLowerCase()) {
        case '.tga':
            return loadTGA(tex.buffer)
        case '.pkm':
            return loadPKM(tex.buffer)
        default:
            throw Error(`Unhandled texture type "${texType}"`)
    }
}

// Load MAN/RST for area
const manBuf = fs.readFileSync(path.join(basePath, productName, 'areas', `${areaName}.man`))
const content = fs.readFileSync(path.join(basePath, productName, 'areas', `${areaName}.rst`), 'utf8')
const man = loadMAN(manBuf.buffer)
const rst = loadRST(content)

let rsc = {
    textureCount: rst.tiles.atlas_tiles_in_row * rst.tiles.atlas_tiles_in_column,
    modelCount: rst.objects.count,
    
    dawnSkyRGB: [ 255, 255, 255 ], //rst.sky.dawn_sky_color,
    daySkyRGB: [ 255, 255, 255 ], //rst.sky.day_sky_color,
    nightSkyRGB: [ 255, 255, 255 ], //rst.sky.night_sky_color,

    dawnSkyTRGB: [ 255, 255, 255 ], //rst.sky.dawn_sun_color,
    daySkyTRGB: [ 255, 255, 255 ], //rst.sky.day_sun_color,
    nightSkyTRGB: [ 255, 255, 255 ], //rst.sky.night_sun_color,

    textures: await generateTerrainTextureData(rst.tiles.atlas_texture, rst.tiles.atlas_tiles_in_row, rst.tiles.atlas_tiles_in_column),
    objects: [], // TODO: load objects (and their textures)

    dawnSkyTexture: new Uint16Array(256 * 256), //
    daySkyTexture: new Uint16Array(256 * 256), // TODO: check if any mobile levels use old skybox
    nightSkyTexture: new Uint16Array(256 * 256), //
    cloudMap: new Uint8Array(128 * 128),

    fogs: generateFogTable(rst.fog),
    randomSounds: await generateSoundsTable(rst.sounds),
    ambientSounds: await generateAmbientSounds(rst.ambients),

    waters: generateWaterTable(rst.water),
}

function rgbaTo16Bits(r,g,b,a = 0) {
    let nR = (r >>> 3) & 0x1f
    let nG = (g >>> 3) & 0x1f
    let nB = (b >>> 3) & 0x1f
    let nA = 0 //(a != 0) ? 0x8000 : 0 // writing alpha made terrain textures display wrong when zooming in with AE2
    return nA | (nR << 10) | (nG << 5) | nB
}

function rgbaTo32Bits(r,g,b,a = 0xff) {
    return r | (g << 8) | (b << 16) | (a << 24)
}

function generateWaterTable({ list }) {
    if (!list) {
        return [];
    }
    return list.map(w => ({
        color: w.color ? rgbaTo32Bits(w.color[0], w.color[1], w.color[2]) : 0xffffff,
        textureIndex: w.tile_index,
        level: w.level,
        opacity: w.opacity,
    }))
}

function generateFogTable({ list }) {
    if (!list) {
        return [];
    }
    return list.map(f => ({
        color: rgbaTo32Bits(f.color[0], f.color[1], f.color[2]),
        yBegin: f.altitude,
        mortal: f.poisonous,
        transp: f.density,
        fLimit: f.distance,
    }))
}

function loadMapSound(name) {
    const input = path.join(basePath, productName, 'sounds', 'ambients', `${name}.wav`)

    return new Promise((resolve, reject) => {
        exec(`ffmpeg -y -i "${input}" -f s16le -acodec pcm_s16le ${name}.raw`, (err, stdout, stderr) => {
            if (err) {
                console.log('ffmpeg error:', stdout, stderr)
                reject(err)
            }
            resolve( fs.readFileSync(`${name}.raw`) )
        })
    })
}

function generateSoundsTable({ list }) {
    // Return a list of Buffer's (Uint8Arrays) with the raw sound data
    return Promise.all(list.map(async s => await loadMapSound(s.file)))
}

function generateAmbientSounds({ list }) {
    return Promise.all(list.map(async a => {
        let total_freq = 0
        a.random_sound?.forEach(rs => total_freq += rs.random_sound_frequency)

        return {
            audio: await loadMapSound(a.file),
            volume: a.volume !== undefined ? Math.floor(a.volume * RSC_MAX_VOLUME) : RSC_DEFAULT_VOLUME,
            random: a.random_sound ? a.random_sound.map(r => ({
                number: r.random_sound_index,
                volume: Math.floor(r.random_sound_volume * RSC_MAX_VOLUME),
                frequency: r.random_sound_frequency / total_freq, // TODO check!!
                environment: 0, // TODO check all RST files for value?
            })) : [],
        }
    }))
}

async function generateTerrainTextureData(tileTexBaseName, tilesPerRow, tilesPerCol) {
    // Get terrain tile texture
    const tiles = await loadTexture(tileTexBaseName)
    const tilesPng = new PNG({
        width: tiles.width, height: tiles.height,
    })
    for (let i = 0; i < tiles.width * tiles.height * 4; i++) {
        tilesPng.data[i] = tiles.data[i]
    }
    fs.writeFileSync(`${tileTexBaseName}.png`, PNG.sync.write(tilesPng))
    execSync(`convert -colors 65536 -resize ${tiles.width * 2} ${tileTexBaseName}.png ${tileTexBaseName}2x.png`)
    const scaledTilesPng = PNG.sync.read(fs.readFileSync(`${tileTexBaseName}2x.png`))
    // Now convert the loaded PNG to 16-bit texture list, as expected by the RSC format

    // Output buffer is 16bits per pixel, but same # of pixels as input (after upscaling)
    const textureData = new Uint16Array(scaledTilesPng.width * scaledTilesPng.height)
    let outOff = 0

    const tileSize = 128
    for (let ty = 0; ty < tilesPerRow; ty++) {
        for (let tx = 0; tx < tilesPerCol; tx++) {
            let tileInOff = (ty * scaledTilesPng.width + tx) * tileSize * 4
            for (let y = 0; y < tileSize; y++) {
                let inOff = tileInOff + y * (scaledTilesPng.width * 4)
                for (let x = 0; x < tileSize; x++) {
                    textureData[outOff++] = rgbaTo16Bits(
                        scaledTilesPng.data[inOff + 0],
                        scaledTilesPng.data[inOff + 1],
                        scaledTilesPng.data[inOff + 2],
                        scaledTilesPng.data[inOff + 3],
                    )
                    inOff += 4
                }
            }
        }
    }

    return textureData
}

function generatePRJ(rsc) {
    let prj = 'Version=6\n'

    // Generate texture list
    prj += `Total textures=${rsc.textureCount}\n`
    for (let i = 1; i <= rsc.textureCount; i++) {
        const num = ("000" + i).slice(-3)
        prj += `Texture${num}=Texture${num}\n`
    }
    // Generate object list
    prj += `Total objects=${rsc.objects.length}\n`
    for (let i = 1; i <= rsc.objects.length; i++) {
        const num = ("000" + i).slice(-3)
        prj += `Object${num}=Object${num}\n`
    }

    // Set sky info
    prj += `Sky loaded=1\nSky map loaded=1\n`

    // Generate fog list
    prj += `Total fog=${rsc.fogs.length}\n`
    for (let i = 1; i <= rsc.fogs.length; i++) {
        const num = ("000" + i).slice(-3)
        prj += `Fog${num}=Fog${num}\n`
    }
    // Generate random sound list
    prj += `Total random sound=${rsc.randomSounds.length}\n`
    for (let i = 1; i <= rsc.randomSounds.length; i++) {
        const num = ("000" + i).slice(-3)
        prj += `Random${num}=Random${num}\n`
    }
    // Generate ambient sound list
    prj += `Total ambient sound=${rsc.randomSounds.length}\n`
    for (let i = 1; i <= rsc.randomSounds.length; i++) {
        const num = ("000" + i).slice(-3)
        prj += `Ambient${num}=Ambient${num}\n`
    }

    return prj
}

function fixupMan() {
    // We need to rewrite flags2/textureMap2 as they are 512x512 instead of 1024x1024 on mobile
    const tm2 = new Uint8ClampedArray(1024 * 1024);
    const f2 = new Uint8ClampedArray(1024 * 1024);
    for (let y = 0; y < 512; y++) {
        for (let x = 0; x < 512; x++) {
            const inOff = y * 512 + x;
            const outOff = (y*2) * 1024 + (x*2);
            const flags = man.flags2[inOff] & 0xff;
            const tex = man.tex2Map[inOff] & 0xff;
            f2[outOff] = flags;
            f2[outOff+1] = flags;
            f2[outOff+1024] = flags;
            f2[outOff+1024+1] = flags;
            tm2[outOff] = tex;
            tm2[outOff+1] = tex;
            tm2[outOff+1024] = tex;
            tm2[outOff+1024+1] = tex;
        }
    }
    man.flags2 = f2;
    man.tex2Map = tm2;
}

// TODO: add "birthplaces" to object map
fixupMan();
fs.writeFileSync(`${areaName}.rsc`, new Uint8ClampedArray(saveRSC(rsc)))
fs.writeFileSync(`${areaName}.map`, new Uint8ClampedArray(saveMAP(man)))
fs.writeFileSync(`${areaName}.prj`, generatePRJ(rsc), 'utf8')
