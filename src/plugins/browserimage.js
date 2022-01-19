import { DataType, Plugin } from './plugin.js'

export class BrowserImagePlugin extends Plugin {
    async loadFile(url, name) {
        return [
            {
                type: DataType.Texture,
                texture: this.loadImageAndGetPixels(url),
            }
        ]
    }

    loadImageAndGetPixels(url) {
        return new Promise((resolve,reject) => {
            let img = new Image
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0)
                const imgData = ctx.getImageData(0, 0, img.width, img.height)
                resolve(imgData)
            }
            img.onerror = e => reject(e)
            img.src = url
        })
    }

    supportedExtensions() {
        return [ 'jpg', 'png' ]
    }
}
