// TODO:
//   - support loading sounds?

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
//import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'

// Common formats
import { loadTGA, saveTGA } from './formats/tga.js'
import { loadOBJ, saveOBJ } from './formats/obj.js'
import { loadPKM          } from './formats/pkm.js'

// Carnivores Mobile formats
import { load3DN, save3DN } from './formats/3dn.js'
import { loadANI, saveANI } from './formats/ani.js'
import { loadCRT          } from './formats/crt.js'
import { loadRST          } from './formats/rst.js'

// Carnivores PC formats
import { load3DF, save3DF } from './formats/3df.js'
import { loadCAR, saveCAR } from './formats/car.js'
import { loadVTL, saveVTL } from './formats/vtl.js'

import { downloadBlob } from './utils.js'

let camera, scene, renderer
let stats, controls
let gui, folderAnimations
let mixer

let clock = new THREE.Clock()

let obj, model, tex, animations = []

let vertCountSpan, faceCountSpan, modelNameSpan

const textFormats = [ 'rst', 'obj' ]

function openFile(file) {
    const name = file.name.toLowerCase()
    const url = URL.createObjectURL(file)
    const nameParts = name.split('.')
    if (nameParts.length === 1) return // Fail if no extension
    const ext = nameParts.pop()
    const baseName = nameParts[0]
    // fetch URL (retrieves local file, no physical network involved)
    fetch(url).then(body => textFormats.includes(ext) ? body.text() : body.arrayBuffer()).then(buf => {
        switch(ext) {
            // ---- PC formats
            case '3df':
                clearAnimations()
                let mdl = load3DF(buf).model
                setTexture565(baseName, mdl.texture, mdl.textureSize)
                setModel(baseName, mdl)
                break
            case 'car':
                clearAnimations()
                let car = loadCAR(buf)
                car.animations.forEach(anim => addAnimation(anim.name, anim))
                setTexture565(baseName, car.texture, car.textureSize)
                setModel(baseName, car)
                break
            case 'vtl':
                addAnimation(baseName, loadVTL(buf), true)
                model && setModel(model.name, model) // regenerate geometry with new morph data
                break

            // ---- Mobile formats
            case '3dn':
                tex = null
                clearAnimations()
                setModel(baseName, load3DN(buf))
                break
            case 'ani':
                addAnimation(baseName, loadANI(buf), true)
                model && setModel(model.name, model) // regenerate geometry with new morph data
                break
            case 'crt':
                setTexture(baseName, loadCRT(buf))
                model && setModel(model.name, model) // regenerate geometry with new morph data
                break
            case 'rst':
                loadRST(buf)
                break

            // ---- Common formats
            case 'obj': // model
                tex = null
                clearAnimations()
                const omdl = loadOBJ(buf)
                setModel(omdl.name, omdl)
                break
            case 'tga': // texture
                setTexture(baseName, loadTGA(buf))
                model && setModel(model.name, model) // regenerate geometry for proper uv Y coordinates
                break
            case 'pkm': // texture
                setTexture(baseName, loadPKM(buf))
                model && setModel(model.name, model) // regenerate geometry for proper uv Y coordinates
                break
        }
    })    
}

function init() {
    vertCountSpan = document.getElementById('vertCount')
    faceCountSpan = document.getElementById('faceCount')
    modelNameSpan = document.getElementById('modelName')

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 20000000)
    camera.position.set(1700, 700, 1500)

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x333333)

    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
  
    stats = new Stats()
    document.body.appendChild(stats.dom)
  
    let grid = new THREE.GridHelper(32 * 16, 32, 0x202020, 0x202020)
    scene.add(grid)

    let axes = new THREE.AxesHelper(5.5 * 16)
    axes.position.y = 0.1
    scene.add(axes)

    const fileButton = document.getElementById('openfile')

    const settings = {
        axes: true,
        grid: true,
    }

    controls = new OrbitControls(camera, renderer.domElement)
    gui = new GUI()

    const globalOps = {
        exportTGA32: () => {
            if (tex) {
                const buf = saveTGA(tex.image)
                downloadBlob(buf, `${tex.name}.tga`, 'application/octet-stream')
            }
        },
        exportTGA16: () => {
            if (tex) {
                const buf = saveTGA({
                    width: tex.image.width,
                    height: tex.image.height,
                    data: createTexture565()
                }, 16)
                downloadBlob(buf, `${tex.name}.tga`, 'application/octet-stream')
            }
        },
        exportTo3DF: () => {
            if (model) {
                const buf = save3DF({ texture: createTexture565(), ...model })
                downloadBlob(buf, `${model.name}.3df`, 'application/octet-stream')
            }
        },
        exportToCAR: () => {
            if (model) {
                const buf = saveCAR({ texture: createTexture565(), animations, ...model })
                downloadBlob(buf, `${model.name}.car`, 'application/octet-stream')
            }
        },
        exportTo3DN: () => {
            if (model) {
                const buf = save3DN({ animations, ...model })
                downloadBlob(buf, `${model.name}.3dn`, 'application/octet-stream')
            }
        },
        exportToOBJ: () => {
            if (model) {
                const s = saveOBJ(model)
                downloadBlob(s, `${model.name}.obj`, 'application/octet-stream')
            }
        },
        flipUV: () => {
			model?.faces.forEach(f => {
                f.uvs[1] = 256 - f.uvs[1]
                f.uvs[3] = 256 - f.uvs[3]
                f.uvs[5] = 256 - f.uvs[5]
            })
            model && setModel(model.name, model)
        },
        flipTriangles: () => {
            model?.faces.forEach(f => {
                // flip indices
                let v1 = f.indices[0]
                let v2 = f.indices[1]
                let v3 = f.indices[2]
                f.indices[0] = v3
                f.indices[1] = v2
                f.indices[2] = v1

                // flip uvs
                let tx1 = f.uvs[0]
                let ty1 = f.uvs[1]
                let tx2 = f.uvs[2]
                let ty2 = f.uvs[3]
                let tx3 = f.uvs[4]
                let ty3 = f.uvs[5]
                f.uvs[0] = tx3
                f.uvs[1] = ty3
                f.uvs[2] = tx2
                f.uvs[3] = ty2
                f.uvs[4] = tx1
                f.uvs[5] = ty1
            })
            model && setModel(model.name, model)
        }
    }

    const guiFolder = gui.addFolder("GUI")
    guiFolder.add(settings, 'axes').onChange(v => axes.visible = v)
    guiFolder.add(settings, 'grid').onChange(v => grid.visible = v)
    guiFolder.close()
    const editFolder = gui.addFolder("Edit")
    editFolder.add(globalOps, 'flipUV')
    editFolder.add(globalOps, 'flipTriangles')
    const exportFolder = gui.addFolder("Export")
    exportFolder.add(globalOps, 'exportTo3DF').name('To 3DF')
    exportFolder.add(globalOps, 'exportToCAR').name('To CAR')
    exportFolder.add(globalOps, 'exportTo3DN').name('To 3DN')
    exportFolder.add(globalOps, 'exportToOBJ').name('To OBJ')
    exportFolder.add(globalOps, 'exportTGA32').name('To 32-bit TGA')
    exportFolder.add(globalOps, 'exportTGA16').name('To 16-bit TGA')
    exportFolder.close()

    folderAnimations = gui.addFolder('Animations')
    folderAnimations.add({
        stop: () => mixer?.stopAllAction(),
    }, 'stop')

    //
    window.addEventListener('resize', onWindowResize)

    // file selection
    fileButton.addEventListener('change', ev => {
        ev.preventDefault()
        ev.target.files?.length && openFile(ev.target.files[0])
    })
    renderer.domElement.addEventListener('dragover', ev => ev.preventDefault())
    renderer.domElement.addEventListener('drop', ev => {
        ev.preventDefault()
        if (ev.dataTransfer.files?.length) {
            openFile(ev.dataTransfer.files[0])
        }
    })
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  
    renderer.setSize(window.innerWidth, window.innerHeight)
    //controls.handleResize()
}

function render() {
    requestAnimationFrame(render)

    const delta = clock.getDelta()
    mixer?.update(delta)
    renderer.render(scene, camera)
    stats.update()
    controls.update()
}

init()

function clearAnimations() {
    // Clear Animations folder
    folderAnimations.foldersRecursive().forEach(c => c.destroy())
    // clear animations list
    animations.length = 0
    // destroy animation mixer
    mixer = null
}

function addAnimation(name, ani, check = false) {
    if (check && model && ani.vertCount !== model.vertices.length) {
        throw Error(`Vertices mismatch: ANI=${ani.vertCount}, 3DN=${model.vertices.length}`)
    }
    animations.push({ name, ...ani })
    let aniFolder = folderAnimations.addFolder(name)
    const ctx = {
        play: () => {
            mixer.stopAllAction()
            mixer.clipAction(obj.animations.find(a => a.name === name)).play()
        },
        remove: () => {
            mixer.stopAllAction()
            animations = animations.filter(ani => ani.name !== name)
            aniFolder.destroy()
        },
        exportToVTL: () => {
            const buf = saveVTL(ani)
            downloadBlob(buf, `${name}.vtl`, 'application/octet-stream')
        },
        exportToANI: () => {
            const buf = saveANI(ani)
            downloadBlob(buf, `${name}.ani`, 'application/octet-stream')
        },
    }
    aniFolder.add(ctx, 'play')
    aniFolder.add(ctx, 'remove')
    aniFolder.add(ctx, 'exportToVTL')
    aniFolder.add(ctx, 'exportToANI')
}

function setTexture565(name, texture, textureBytes) {
    // Bail out early if we have no texture data
    if (!textureBytes) {
        tex = null
        return
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

    setTexture(name, { width, height, data })
}

function createTexture565() {
    // bail out if no current texture
    if (!tex) return undefined

    // Convert 32-bit RGBA texture to RGB565 texture
    const { width, height, data } = tex.image
    const texture = new Uint16Array(width * height)
    for (let i = 0; i < data.length; i++) {
        let r = (data[i*4 +0] >>> 3) & 0x1f
        let g = (data[i*4 +1] >>> 3) & 0x1f
        let b = (data[i*4 +2] >>> 3) & 0x1f
        let a = (data[i*4 +3] != 0) ? 0x8000 : 0
        texture[i] = a | (r << 10) | (g << 5) | b
    }

    return texture
}

function setTexture(name, image) {
    tex = new THREE.DataTexture(image.data, image.width, image.height, THREE.RGBAFormat, THREE.UnsignedByteType)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.needsUpdate = true
    tex.name = name
}

function setModel(name, newModel) {
    const morphVertices = []
    const position = []
    const uv = []

    model = newModel
    model.name = model.name || name

    // Show model details in UI
    vertCountSpan.innerText = newModel.vertices.length
    faceCountSpan.innerText = newModel.faces.length
    modelNameSpan.innerText = model.name

    // UV dividers
    const width = tex ? tex.image.width : 256
    const height = tex ? tex.image.height : 256

    const totalFrames = animations.reduce((a,b) => a + b.frameCount, 0)

    if (totalFrames) {
        for (let i = 0; i < totalFrames; i++) {
            morphVertices[i] = []
        }
    }

    model.faces.forEach(f => {
        for (let i = 0; i < 3; i++) {
            const vIdx = f.indices[i]
            const v = model.vertices[vIdx]
            position.push(
                v.position[0],
                v.position[1],
                v.position[2],
            )

            if (totalFrames) {
                let frIdx = 0
                animations.forEach(ani => {
                    for (let i = 0; i < ani.frameCount; i++) {
                        const vOff = (i * ani.vertCount + vIdx) * 3
                        morphVertices[frIdx + i].push(
                            ani.frames[vOff + 0] / 16, // x
                            ani.frames[vOff + 1] / 16, // y
                            ani.frames[vOff + 2] / 16, // z
                        )
                    }
                    frIdx += ani.frameCount
                })
            }
        }
        uv.push(
            f.uvs[0] / width, f.uvs[1] / height,
            f.uvs[2] / width, f.uvs[3] / height,
            f.uvs[4] / width, f.uvs[5] / height,
        )
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(position, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    geo.computeVertexNormals()

    if (totalFrames) {
        // Add animation data
        geo.morphAttributes.position = []
        let frIdx = 0
        animations.forEach(ani => {
            for (let i = 0; i < ani.frameCount; i++) {
                const attr = new THREE.Float32BufferAttribute(morphVertices[frIdx + i], 3)
                attr.name = `${ani.name}.${i}`
                geo.morphAttributes.position.push(attr)
            }
            frIdx += ani.frameCount
        })
    }

    const mat = tex ?
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, alphaTest: 0.5, transparent: true }) :
        new THREE.MeshNormalMaterial({ /*side: THREE.DoubleSide*/ })

    if (obj) {
        scene.remove(obj)
    }
    obj = new THREE.Mesh(geo, mat)
    obj.name = model.name
    if (totalFrames) {
        animations.forEach(ani => {
            const seq = []
            for (let i = 0; i < ani.frameCount; i++) {
                seq.push({
                    name: `${ani.name}.${i}`,
                    vertices: [], // seems unused
                })
            }
            const clip = THREE.AnimationClip.CreateFromMorphTargetSequence(
                `${ani.name}`,
                seq,
                ani.fps,
                false /*noLoop*/
            )
            obj.animations.push(clip)
        })

        mixer = new THREE.AnimationMixer(obj)
    }

    scene.add(obj)
}

Promise.all([
    fetch('amargasaurus.3dn').then(body => body.arrayBuffer()),
    fetch('amargasaurus.tga').then(body => body.arrayBuffer()),
    fetch('amargasaurus_idle_active.ani').then(body => body.arrayBuffer()),
]).then(([ modelBuffer, tgaBuffer, aniBuffer ]) => {
    const model = load3DN(modelBuffer)
    const image = loadTGA(tgaBuffer)
    const ani = loadANI(aniBuffer)
    setTexture('amargasaurus', image)
    addAnimation('amargasaurus_idle_active', ani)
    setModel('amargasaurus', model)

    requestAnimationFrame(render)
})
