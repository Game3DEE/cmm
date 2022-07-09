import {
  LinearFilter,
  Vector3,
} from 'three'

export function setLinearFilters(tex) {
  tex.minFilter = LinearFilter
  tex.magFilter = LinearFilter
  return tex
}

export function downloadBlob(data, fileName, mimeType = 'application/octet-stream') {
  const blob = new Blob([data], {
    type: mimeType
  })
  const url = window.URL.createObjectURL(blob)
  downloadURL(url, fileName)
  setTimeout(() => {
    return window.URL.revokeObjectURL(url)
  }, 1000)
}

function downloadURL(data, fileName) {
  let a = document.createElement('a')
  a.href = data
  a.download = fileName
  document.body.appendChild(a)
  a.style = 'display: none'
  a.click()
  a.remove()
}

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

// from Resources.cpp
export const conv_565 = v => (v & 31) + ((v & 0xFFE0) << 1)

export function imgToImageData(img) {
  return new ImageData(img.data, img.width, img.height)
}

export function onMobile() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return true // tablet
  }
  else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return true // phone?
  }

  return false // desktop
}

// Shamelessly grabbed from https://github.com/mrdoob/three.js/issues/6784
export const zoomExtents = (camera, object1, orbit) => {
  let vFoV = camera.getEffectiveFOV();
  let hFoV = camera.fov * camera.aspect;

  let FoV = Math.min(vFoV, hFoV);
  let FoV2 = FoV / 2;

  let dir = new Vector3();
  camera.getWorldDirection(dir);

  object1.geometry.computeBoundingSphere()
  let bs = object1.geometry.boundingSphere;
  let bsWorld = bs.center.clone();
  object1.localToWorld(bsWorld);

  let th = FoV2 * Math.PI / 180.0;
  let sina = Math.sin(th);
  let R = bs.radius;
  let FL = R / sina;

  let cameraDir = new Vector3();
  camera.getWorldDirection(cameraDir);

  let cameraOffs = cameraDir.clone();
  cameraOffs.multiplyScalar(-FL);
  cameraOffs.z *= -1
  let newCameraPos = bsWorld.clone().add(cameraOffs);

  camera.position.copy(newCameraPos);
  camera.lookAt(bsWorld);
  orbit.target.copy(bsWorld);
  orbit.update();
}
