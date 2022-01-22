import {
    AxesHelper,
    Clock,
    Color,
    GridHelper,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { DataType, setupPlugins } from './plugins/index.js'

// Basic UI elements
let camera, scene, renderer, stats, controls, grid, axes, fileButton
let clock = new Clock()
// GUI elements
let gui, textureFolder, animationsFolder, pluginFolder
// model info
let vertCountSpan, faceCountSpan, modelNameSpan
// plugin data
let plugins = [], activePlugin
// active model data
let model, mixer

// Global settings
const settings = {
    axes: true,
    grid: true,
    mode: 0,
}

async function openFile(url, name) {
    const fileName = name.toLowerCase()
    const splitName = fileName.split('.')
    const baseName = splitName[0]
    const ext = splitName.pop()

    for (let j = 0; j < plugins.length; j++) {
        const plug = plugins[j]
        if (plug.supportedExtensions().includes(ext)) {
            try {
                const data = await plug.loadFile(url, fileName)
                data.forEach(d => {
                    switch(d.type) {
                        case DataType.Model:
                            // Model dropped, clear UX and active plug as active plugin
                            if (model) scene.remove(model)
                            scene.add(d.model)
                            model = d.model
                            break
                        case DataType.Texture:
                            // Texture dropped, add to texture list
                            textureFolder.addFolder(baseName).add({
                                remove: () => {},
                            }, 'remove')
                            model.material.map = d.texture
                            model.material.needsUpdate = true
                            break
                        case DataType.Animation:
                            // Animation dropped, add animation to current model
                            break
                    }
                })
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
    guiFolder.close()

    textureFolder = gui.addFolder('Textures')
    animationsFolder = gui.addFolder('Animations')
    pluginFolder = undefined
}

function initPlugins() {
    plugins.push.apply(plugins, setupPlugins(gui))

    // build list of modes
    const modes = {}
    plugins.forEach((p,i) => {
        if (p.isMode()) {
            modes[p.name()] = i
        }
    })

    gui.add(settings, 'mode', modes)
}

function init() {
    vertCountSpan = document.getElementById('vertCount')
    faceCountSpan = document.getElementById('faceCount')
    modelNameSpan = document.getElementById('modelName')

    camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 20000000)
    camera.position.set(1700, 700, 1500)

    scene = new Scene()
    scene.background = new Color(0x333333)

    renderer = new WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
  
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
openFile('saurophaganax.car', 'saurophaganax.car')
