import {
    createTextureAtlas,
    createMapGeometry,
    setupTerrainUV,
    TerrainMaterial,
    createLightMap,
} from './terrain.js'

import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'

import { CameraAlpha, CameraBeta, CameraX, CameraY, CameraZ } from '../player.js'
import { buildTexture565 } from '../../model.js'

export let scene
let camera, renderer
let stats

export function initRenderer(map, rsc) {
    initScene()

    // TODO: make a cubetexture somehow?
    const skyTex = buildTexture565(rsc.skyTexture, 256 * 256 * 2)
    scene.background = skyTex

    // Create terrain
    const atlasTexture = createTextureAtlas(rsc)
    const lightMap = createLightMap(map.dayShadows, map.size)
    const geo = createMapGeometry(map)
    setupTerrainUV(geo, map, atlasTexture, 128)

    let color =
      rsc.daySkyRGB[0] << 16 |
      rsc.daySkyRGB[1] << 8 |
      rsc.daySkyRGB[2]

    const fogParams = new THREE.Vector2(6000, 10000) // fog start, fog full
    const skyColor = new THREE.Color(color)
    const obj = new THREE.Mesh(geo, new TerrainMaterial(atlasTexture, lightMap, fogParams, skyColor, map.size));
    scene.add(obj)
}

export function initScene() {
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 20000000)
    camera.position.set(0, 1000, 0)
    camera.rotation.order = 'YXZ'

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x333333)

    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    stats = new Stats()
    document.body.appendChild(stats.dom)

    //
    window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  
    renderer.setSize(window.innerWidth, window.innerHeight)
    //controls.handleResize()
}

let time = 0

export function renderFrame(delta) {
    time += delta
    // Update camera
    camera.position.set(CameraX, CameraY, CameraZ)
    // rotation is negated as Carnivores calculates it for
    // after doing the inverse, while here it is before
    camera.rotation.y = -CameraAlpha
    camera.rotation.x = -CameraBeta

    // Move sky based on camera rotation
    // TODO check original code for exact formula
    // (this is just a placeholder that looks ok-ish)
    scene.background.offset.x = CameraAlpha
    scene.background.offset.y = -CameraBeta
    scene.background.offset.x += time * 0.01

    // Render
    renderer.render(scene, camera)
    stats?.update()
}
