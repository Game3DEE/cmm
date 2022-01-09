export function downloadBlob(data, fileName, mimeType) {
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
