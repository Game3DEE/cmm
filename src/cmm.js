import {
    AnimationMixer,
    AxesHelper,
    Clock,
    Color,
    DoubleSide,
    GridHelper,
    MeshBasicMaterial,
    MeshNormalMaterial,
    PerspectiveCamera,
    Scene,
    SkeletonHelper,
    WebGL1Renderer,
 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { DataType, setupPlugins } from './plugins/index.js'
import { zoomExtents } from './utils.js'

// Basic UI elements
let camera, scene, renderer, stats, controls, grid, axes, fileButton
let clock = new Clock()
// GUI elements
let gui, materialFolder, animationsFolder
// Skeleton GUI
let skelGUI, skelHelper
// model info
let faceCountSpan, modelNameSpan
// plugin data
let plugins = [], activePlugin
// active model data
let model, mixer

const textures = [] // list of currently loaded textures

// Global settings
const settings = {
    axes: true,
    grid: true,
    skeleton: true,
    wireframe: false,
    mode: 0,
}

function setModel(newModel, plug) {
    const plugIdx = plugins.indexOf(plug)
    if (plug.isMode() && plugIdx !== -1) {
        settings.mode = plugIdx
    }
    if (model) {
        scene.remove(model)
        if (skelHelper) {
            scene.remove(skelHelper)
            skelHelper = null
        }
    }
    model = newModel

    activePlugin?.deactivate()
    activePlugin = plug
    activePlugin.activate(model)

    if (model) {
        // TODO: traverse object hierarchy, handled multi-geometry properly
        faceCountSpan.innerText = model.geometry.index ? model.geometry.index.count / 3 : model.geometry.attributes.position.count / 3
        modelNameSpan.innerText = model.name
        scene.add(model)

        mixer = new AnimationMixer(model)
    }

    // hide or show "Show Skeleton"
    if (model?.isSkinnedMesh) {
        skelGUI.enable()
        skelHelper = new SkeletonHelper(model)
        skelHelper.visible = settings.skeleton
        scene.add(skelHelper)
    } else {
        skelGUI.disable()
    }

    updateMaterials()
    updateAnimations()

    console.log(model)
}

function addNewAnimations(newAnimations) {
    newAnimations.forEach(ani => {
        while (model.animations.findIndex(a => a.name === ani.name) !== -1) {
            ani.name += '_dup'
        }
    })

    model.animations.push.apply(model.animations, newAnimations)
    model.updateMorphTargets()
}

function addNewTextures(newTextures) {
    const materials = Array.isArray(model.material) ? model.material : [model.material]
    newTextures.forEach(t => {
        while (textures.findIndex(tex => tex.name === t.name) !== -1) {
            t.name += '_dup'
        }

        textures.push(t)

        if (materials.length > 1) {
            const mIdx = materials.findIndex(m => m.map === undefined || m.map === null)
            if (mIdx !== -1) {
                setMaterial(mIdx, t)
            }
        } else {
            setMaterial(0, t)
        }
    })
}

function setMaterial(idx, tex) {
    // Remove Doubleside or make optional?
    const mat = tex ? new MeshBasicMaterial({ map: tex, side: DoubleSide, wireframe: settings.wireframe }) :
        new MeshNormalMaterial({  side: DoubleSide, wireframe: settings.wireframe })

    if (Array.isArray(model.material)) {
        mat.name = model.material[idx].name
        model.material[idx] = mat
    } else {
        mat.name = model.material.name
        model.material = mat
    }
}

function updateAnimations() {
    animationsFolder.children.slice().forEach(c => c.destroy())

    if (!model) return

    const animations = { 'none': 0 }
    model.animations.forEach((ani,aIdx) => {
        animations[ani.name] = aIdx +1
    })

    const pluginAnimOpts = activePlugin?.animationOptions() || {}

    const animSettings = {
        current: 0,
        remove: () => {
            mixer.stopAllAction()
            if (animSettings.current) {
                const idx = animSettings.current -1
                model.animations.splice(idx, 1)
                updateAnimations()
            }
        },
        ...pluginAnimOpts,
    }

    animationsFolder.add(animSettings, 'current', animations).onChange(v => {
        mixer.stopAllAction()
        if (v) {
            mixer.clipAction(model.animations[v-1]).play()
        }
    })
    animationsFolder.add(animSettings, 'remove')
    for (let s in pluginAnimOpts) {
        animationsFolder.add(animSettings, s)
    }
}

function updateMaterials() {
    materialFolder.children.slice().forEach(c => c.destroy())

    if (!model) return

    // Build map of texture names
    const textureNames = {
        'none': 0,
    }
    textures.forEach((t,i) => textureNames[t.name] = i +1)

    const materials = Array.isArray(model.material) ? model.material : [model.material]
    materials.forEach((m,mIdx) => {
        const data = {
            texture: m.map ? textures.findIndex(t => t.name === m.map.name) +1 : 0,
        }
        const folder = materialFolder.addFolder(m.name)
        folder.add(data, 'texture', textureNames).onChange(tIdx => {
            setMaterial(mIdx, tIdx > 0 ? textures[tIdx-1] : null)
        })
    })
}

async function openFile(url, name) {
    const fileName = name
    const splitName = fileName.split('.')
    const baseName = splitName[0]
    const ext = splitName.pop().toLowerCase()

    for (let j = 0; j < plugins.length; j++) {
        const plug = plugins[j]
        if (plug.supportedExtensions().includes(ext)) {
            try {
                const data = await plug.loadFile(url, ext, baseName)
                let newModel = null
                let newTextures = []
                let newAnimations = []
                data.forEach(d => {
                    switch(d.type) {
                        case DataType.Model:
                            // Model dropped, clear UX and active plug as active plugin
                            newModel = d.model
                            break
                        case DataType.Texture:
                            // Texture dropped, add to texture list
                            newTextures.push(d.texture)
                            break
                        case DataType.Animation:
                            // Animation dropped, add animation to current model
                            newAnimations.push(d.animation)
                            break
                    }
                })
                if (newModel) {
                    setModel(newModel, plug)
                    model && zoomExtents(camera, model, controls)
                }
                if (newTextures.length) {
                    addNewTextures(newTextures)
                    updateMaterials()
                }
                if (newAnimations.length) {
                    addNewAnimations(newAnimations)
                    updateAnimations()
                }
                return // plugin loaded file successfully, skip other plugins
            } catch(e) {
                console.error(`Plugin "${plug.name()}" failed to load "${name}"!`, e)
                // TODO: create more visible error?
            }
        }
    }    
}

async function openFiles(fileList) {
    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        const url = URL.createObjectURL(file)
        await openFile(url, file.name)
    }
}

// Setup basic UI options
function initGUI() {
    const guiFolder = gui.addFolder("GUI")
    guiFolder.add(settings, 'axes').name('Show Axes').onChange(v => axes.visible = v)
    guiFolder.add(settings, 'grid').name('Show Grid').onChange(v => grid.visible = v)
    guiFolder.add(settings, 'wireframe').onChange(v => {
        (Array.isArray(model.material) ? model.material : [model.material]).forEach(m => {
            m.wireframe = v
            m.needsUpdate = true
        })
    })
    skelGUI = guiFolder.add(settings, 'skeleton').name('Show Skeleton').onChange(v => skelHelper.visible = v)
    guiFolder.close()

    materialFolder = gui.addFolder('Materials')
    materialFolder.close()
    animationsFolder = gui.addFolder('Animations')
    animationsFolder.close()
}

function initPlugins() {
    plugins.push.apply(plugins, setupPlugins(gui, camera))

    // build list of modes
    const modes = {}
    plugins.forEach((p,i) => {
        if (p.isMode()) {
            modes[p.name()] = i
        }
    })

    gui.add(settings, 'mode', modes).listen().onChange(v => {
        // when the user changes the mode, we trigger an "import" from one plugin to another
        const newPlug = plugins[v]
        const newModel = newPlug.convert(model)
        scanForNewTextures(newModel)
        setModel(newModel, newPlug)
    })
}

function scanForNewTextures(model) {
    const materials = Array.isArray(model.material) ? model.material : [model.material]
    materials.forEach(m => {
        if (m.map) {
            if (textures.indexOf(m.map) === -1) {
                textures.push(m.map)
            }
        }
    })
}

function init() {
    faceCountSpan = document.getElementById('faceCount')
    modelNameSpan = document.getElementById('modelName')

    camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 20000000)
    camera.position.set(1700, 700, 1500)

    scene = new Scene()
    scene.background = new Color(0x333333)

    renderer = new WebGL1Renderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
  
    console.log(renderer.capabilities.isWebGL2 ? 'WebGL 1 renderer used' : 'WebGL 2 renderer used')

    stats = new Stats()
    document.body.appendChild(stats.dom)
  
    grid = new GridHelper(32 * 16, 32, 0x202020, 0x202020)
    scene.add(grid)

    axes = new AxesHelper(5.5 * 16)
    axes.position.y = 0.1
    scene.add(axes)

    fileButton = document.getElementById('openfile')

    controls = new OrbitControls(camera, renderer.domElement)

    // Setup GUI

    gui = new GUI()

    initPlugins()
    initGUI()

    //
    window.addEventListener('resize', onWindowResize)

    // file selection
    fileButton.addEventListener('change', async ev => {
        ev.preventDefault()
        ev.target.files?.length && await openFiles(ev.target.files)
    })
    renderer.domElement.addEventListener('dragover', ev => ev.preventDefault())
    renderer.domElement.addEventListener('drop', async ev => {
        ev.preventDefault()
        ev.dataTransfer.files && await openFiles(ev.dataTransfer.files)
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
render()
openFile('BRONTORNIS2.car', 'BRONTORNIS2.car')
