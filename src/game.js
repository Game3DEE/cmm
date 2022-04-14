import { Clock } from 'three'

import { loadRSC } from './formats/rsc.js'
import { loadMAP } from './formats/map.js'
import { loadMAN } from './formats/man.js'
import { loadCAR } from './formats/car.js'
import { load3DF } from './formats/3df.js'
import { loadTGA } from './formats/tga.js'

import { initEngine, stepEngine } from './game/engine.js'
import { initRenderer, renderFrame } from './game/renderer/index.js'
import { initAI, stepAI } from './game/ai.js'
import { imgToImageData } from './utils.js'
import { PlayerX, PlayerZ } from './game/player.js'
import { KeyFlags, kf } from './game/input.js'

let clock = new Clock()

let minimapSrc
let minimapCtx
let minimap
const minimapOff = [ 12, 24 ]
let prevFrameKeyFlags = 0

function gameLoop() {
    requestAnimationFrame(gameLoop)

    // Step engine
    const delta = clock.getDelta()
    stepEngine(delta)
    stepAI(delta)

    if (KeyFlags & kf.ToggleMap &&
        !(prevFrameKeyFlags & kf.ToggleMap)) {
        if (minimap?.style.display.length && minimap?.style.display !== 'none') {
            minimap.style.display = 'none'
        } else {
            minimap.style.display = 'block'
        }
    }
    prevFrameKeyFlags = KeyFlags

    if (minimap?.style.display !== 'none') {
        let x = minimapOff[0] + (PlayerX / 256) / 2
        let y = minimapOff[1] + (PlayerZ / 256) / 2

        minimapCtx.putImageData(minimapSrc, 0, 0)
        minimapCtx.fillRect(x -1, y -1, 2, 2)
        minimapCtx.beginPath()
        minimapCtx.arc(x, y, 20, 0, Math.PI * 2)
        minimapCtx.stroke()
    }

    // Render
    renderFrame(delta)
}

function setupMinimap(map, rsc, mapFrame) {
    buildMinimapImage(map, rsc, mapFrame)

    minimap = document.getElementById('minimap')
    minimap.width = mapFrame.width
    minimap.height = mapFrame.height
    minimapCtx = minimap.getContext('2d')
    minimapCtx.putImageData(minimapSrc, 0, 0)
    minimapCtx.fillStyle = 'red' // for red "dot"
    minimapCtx.strokeStyle = 'green' // for green circle
}

function buildMinimapImage(map, rsc, mapFrame) {
    // make sure alpha is set properly....
    for (let i = 0; i < mapFrame.width * mapFrame.height; i++) {
        mapFrame.data[i*4+3] = 255
    }
    const miniMapSize = map.size / 2
    let off = (24 * mapFrame.width + 12) * 4
    let tx, ty
    for (let y = 0; y < miniMapSize; y++) {
        for (let x = 0; x < miniMapSize; x++) {
            let tidx = map.tex1Map[(y * 2 * map.size) + x * 2]
            // Use more detail for water tiles
            tx = tidx === 0 ? (x & 31) * 4 : (x & 15) * 8
            ty = tidx === 0 ? (y & 31) * 4 : (y & 15) * 8
            const pixel = rsc.textures[tidx * 128 * 128 + ty * 128 + tx]
            let r = ((pixel >>> 10) & 0x1f)
            let g = ((pixel >>>  5) & 0x1f)
            let b = ((pixel >>>  0) & 0x1f)
            mapFrame.data[off++] = r << 3
            mapFrame.data[off++] = g << 3
            mapFrame.data[off++] = b << 3
            mapFrame.data[off++] = 255
        }
        off -= miniMapSize * 4
        off += mapFrame.width * 4
    }
    minimapSrc = imgToImageData(mapFrame)
}

const loading = document.getElementById('loading')

Promise.all([
    fetch('HUNTDAT/AREAS/AREA1.MAP').then(body => body.arrayBuffer()),
    fetch('HUNTDAT/AREAS/AREA1.RSC').then(body => body.arrayBuffer()),
    fetch('HUNTDAT/COMPAS.3DF').then(body => body.arrayBuffer()),
    fetch('HUNTDAT/WIND.CAR').then(body => body.arrayBuffer()),
    fetch('HUNTDAT/DIMOR2.CAR').then(body => body.arrayBuffer()),
    fetch('HUNTDAT/MENU/MAPFRAME.TGA').then(body => body.arrayBuffer()),
]).then(([ mapBuf, rscBuf, compassBuf, windBuf, carBuf, frameBuf ]) => {
    let map = loadMAP(mapBuf)
    let rsc = loadRSC(rscBuf, map.version)
    let car = loadCAR(carBuf)
    let mmap = loadTGA(frameBuf)
    let compass = load3DF(compassBuf)
    let wind = loadCAR(windBuf)
  
    initEngine(map, rsc)
    initRenderer(map, rsc, compass.model, wind)
    initAI(car)
    setupMinimap(map, rsc, mmap)

    // hide loading message
    loading.style.display = 'none'

    // start game
    requestAnimationFrame(gameLoop)
})
