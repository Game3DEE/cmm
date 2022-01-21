import {
    Mesh,
    OrthographicCamera,
    Scene,
    Vector2,
    Vector3,
    Spherical,
} from 'three'

import { createObject } from './index.js'

let hudCam, hudScene, compassMesh, windMesh
const dir = new Vector3()
const sph = new Spherical()

export function initHud(compass, wind, renderer) {
    const size = new Vector2()
    renderer.getSize(size)

    console.log('render size:', size)

    const { geometry, material } = createObject(compass)
    compassMesh = new Mesh(geometry, material)

    const windObj = createObject(wind)
    windMesh = new Mesh(windObj.geometry, windObj.material)

    hudCam = new OrthographicCamera()
    hudCam.position.set(0,0, 220)

    hudScene = new Scene()

    compassMesh.rotation.x = -Math.PI / 5
    compassMesh.scale.setScalar(0.01)
    compassMesh.position.x = 0.7
    compassMesh.position.y = -0.7
    hudScene.add(compassMesh)

    windMesh.rotation.x = -Math.PI / 5
    windMesh.scale.setScalar(0.01)
    windMesh.position.x = -0.7
    windMesh.position.y = -0.7
    hudScene.add(windMesh)
}

export function renderHud(renderer, camera) {
    camera.getWorldDirection(dir)
    sph.setFromVector3(dir)
    compassMesh.rotation.y = sph.theta + Math.PI
    windMesh.rotation.y = sph.theta + Math.PI

    let autoClear = renderer.autoClear
    renderer.autoClear = false
    renderer.clearDepth()
    renderer.render(hudScene, hudCam)
    renderer.autoClear = autoClear
}

/*
<primitive
  position={[- size.width / 2 + 220, - size.height / 2 + 120, 0]}
  rotation-x={-Math.PI/8}
  scale={10}
  object={wind}
/>
<primitive
  position={[size.width / 2 - 220, - size.height / 2 + 120, 0]}
  rotation-x={-Math.PI/8}
  scale={10}
  object={compass}
/>
*/
