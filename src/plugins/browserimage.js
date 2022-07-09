import {
    DataTexture,
    RGBAFormat,
    UnsignedByteType
} from 'three'

import { DataType, Plugin } from './plugin.js'
import { setLinearFilters } from '../utils.js'

export class BrowserImagePlugin extends Plugin {
    async loadFile(url, ext, baseName) {
        const img = await this.loadImageAndGetPixels(url)
        const tex = new DataTexture(img.data, img.width, img.height, RGBAFormat, UnsignedByteType)
        setLinearFilters(tex)
        tex.name = baseName
        tex.needsUpdate = true

        return [
            {
                type: DataType.Texture,
                texture: tex,
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
