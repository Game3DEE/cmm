import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { KeyFlags, kf } from '../input.js'

import {
    createTextureAtlas,
    createMapGeometry,
    setupTerrainUV,
    TerrainMaterial,
    createLightMap,
} from './terrain.js'

import { CameraAlpha, CameraBeta, CameraX, CameraY, CameraZ } from '../player.js'
import { buildTexture565 } from '../../model.js'
import { GetLandOH, GetObjectH, GetObjectHWater } from '../land.js'
import { of } from '../../formats/rsc.js'
import { conv_565 } from '../../utils.js'
import { initHud, renderHud } from './hud.js'

export let scene
let camera, renderer
let stats

let models = [] // XXX can be removed?

export let isWebGL2 = false

export function initRenderer(map, rsc, compass, wind) {
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

    // Init objects
    initObjects(map, rsc)

    // Init HUD
    initHud(compass, wind, renderer)
}

export function createObject(model) {

  const width = 256
  const height = model.texture.length / width
  const position = []
  const texcoord = []
  const indices = []

  let data = new Uint16Array(model.texture.length)
  for (let i = 0; i < model.texture.length; i++) {
      data[i] = conv_565(model.texture[i])
  }

  let ind = 0
  model.faces.forEach(f => {
    for (let i = 0; i < 3; i++) {
      indices.push(ind++)
      const v = model.vertices[f.indices[i]]
      position.push(
        v.position[0] * 2,
        v.position[1] * 2,
        v.position[2] * 2,
      )
      texcoord.push(
        f.uvs[i*2+0] / 255,
        f.uvs[i*2+1] / height,
      )
    }
  })

  let geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(texcoord, 2))
  geometry.setIndex(indices) // XXX index not really required
  let map = new THREE.DataTexture(data, width, height, THREE.RGBFormat, THREE.UnsignedShort565Type)
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  let material = new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide })
  material.onBeforeCompile = s => {
    let fs = s.fragmentShader
    fs = fs.replace('#include <map_fragment>', `
    #include <map_fragment>
    if (length(diffuseColor.rgb) < 0.01) {
      discard;
    }
    `)
    s.fragmentShader = fs
  }
  
  return { geometry, material }
}

function initObjects(map, rsc) {
    const matrices = []
    const mat = new THREE.Matrix4()
    for (let i = 0; i < map.objectMap.length; i++) {
      const ob = map.objectMap[i]
      if (ob < 254) {
        const cx = (i % map.size)
        const cz = Math.floor(i / map.size)
        if (rsc.objects[ob].flags & of.PlaceUser) map.objectHeightMap[i] += 48;
        if (rsc.objects[ob].flags & of.PlaceGround) map.objectHeightMap[i] = GetObjectH(cx, cz, rsc.objects[ob].grRad);
        if (rsc.objects[ob].flags & of.PlaceWater) map.objectHeightMap[i] = GetObjectHWater(cx, cz);
        if (matrices[ob] === undefined) {
          matrices[ob] = []
        }
        mat.makeTranslation(cx * 256 + 128, GetLandOH(cx, cz), cz * 256 + 128)
        // TODO rotation?
        matrices[ob].push.apply(matrices[ob], mat.toArray())
      } else {
        // 254 = landing, 255 = empty
        map.objectHeightMap[i] = 48
      }
    }

    rsc.objects.forEach(({ model }, idx) => {   
        if (matrices[idx] === undefined) {
          // skip unused models, no need to waste VRAM
          return
        }

        const { geometry, material } = createObject(model)
        models[idx] = new THREE.InstancedMesh(
          geometry, material,
          matrices[idx].length / 16,
        )
        for (let i = 0; i < models[idx].count; i++) {
          mat.fromArray(matrices[idx], i * 16)
          models[idx].setMatrixAt(i, mat)
        }
        scene.add(models[idx])
    })
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

    isWebGL2 = renderer.capabilities.isWebGL2

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
let prevFrameKeyFlags = 0
let renderHUD = true

export function renderFrame(delta) {
  if (KeyFlags & kf.ToggleHUD &&
    !(prevFrameKeyFlags & kf.ToggleHUD)) {
      renderHUD = !renderHUD
  }
  prevFrameKeyFlags = KeyFlags // TODO: make proper input system!


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
    renderHUD && renderHud(renderer, camera)

    // Update fps stats
    stats?.update()
}
