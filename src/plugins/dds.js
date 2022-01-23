import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js'
import {
    DataTexture,
    RGBAFormat,
    RGBA_S3TC_DXT1_Format,
    RGBA_S3TC_DXT5_Format,
    RGB_S3TC_DXT1_Format,
    UnsignedByteType,
} from 'three'

import { DataType, Plugin } from './plugin.js'

import {
    BlockDecompressImageDXT5,
    BlockDecompressImageDXT1,
 } from './dxt.js'

export class DDSPlugin extends Plugin {
    async loadFile(url, ext, baseName) {
        return [
            {
                type: DataType.Texture,
                texture: this.loadDDS(await this.loadFromURL(url), baseName),
            }
        ]
    }

    loadDDS(buf, baseName) {
      const loader = new DDSLoader()
      const info = loader.parse(buf, false)
      const mip = info.mipmaps[0]
      if (info.format === RGBA_S3TC_DXT5_Format) {
          // decompress DXT5
          const newData = new Uint8ClampedArray(mip.width * mip.height * 4)
          BlockDecompressImageDXT5(mip.width, mip.height, mip.data.buffer, mip.data.byteOffset, newData)
          mip.data = newData
          info.format = RGBAFormat
      } else if (info.format === RGBA_S3TC_DXT1_Format || info.format === RGB_S3TC_DXT1_Format) {
          // decompress DXT1
          const newData = new Uint8ClampedArray(mip.width * mip.height * 4)
          BlockDecompressImageDXT1(mip.width, mip.height, mip.data.buffer, mip.data.byteOffset, newData)
          mip.data = newData
          info.format = RGBAFormat
      }

      const tex = new DataTexture(mip.data, mip.width, mip.height, info.format, UnsignedByteType)
      tex.name = baseName
      return tex
    }

    supportedExtensions() {
        return [ 'dds' ]
    }
}
/*
export const RGB_S3TC_DXT1_Format = 33776;
export const RGBA_S3TC_DXT1_Format = 33777;
export const RGBA_S3TC_DXT3_Format = 33778;
//export const RGBA_S3TC_DXT5_Format = 33779;
*/
