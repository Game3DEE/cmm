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