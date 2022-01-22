import { DataType, Plugin } from './plugin.js'

import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js'
import { DataTexture, UnsignedByteType } from 'three'

export class DDSPlugin extends Plugin {
    async loadFile(url, name) {
        return [
            {
                type: DataType.Texture,
                texture: this.loadDDS(await this.loadFromURL(url)),
            }
        ]
    }

    loadDDS(buf) {
      const loader = new DDSLoader()
      const info = loader.parse(buf, false)
      const mip = info.mipmaps[0]
      return new DataTexture(mip.data, mip.width, mip.height, info.format, UnsignedByteType)
    }

    supportedExtensions() {
        return [ 'dds' ]
    }
}
