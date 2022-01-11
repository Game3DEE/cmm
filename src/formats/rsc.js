// XXX TODO add C2 support! (everything starting with objects[] on is C1 only)

import { load3DF } from './3df.js'

export const of = {
  PlaceWater: 1,
  PlaceGround: 2,
  PlaceUser: 4,
  Animated: 0x80000000,
}

export function loadRSC(buffer, version) {
  const textureDim = 128
  const dv = new DataView(buffer)
  let offset = 0

  const textureCount = dv.getUint32(offset + 0, true)
  const modelCount = dv.getUint32(offset + 4, true)
  offset += 8
 
  function readColor() {
    const color = [
      dv.getUint32(offset + 0, true),
      dv.getUint32(offset + 4, true),
      dv.getUint32(offset + 8, true),
    ]
    offset += 12
    return color
  }

  // Read colors
  let dawnSkyRGB, daySkyRGB, nightSkyRGB
  if (version === 1) {
    dawnSkyRGB = daySkyRGB = nightSkyRGB = readColor()
  } else {
    dawnSkyRGB = readColor()
    daySkyRGB = readColor()
    nightSkyRGB = readColor()
  }

  let dawnSkyTRGB, daySkyTRGB, nightSkyTRGB
  if (version === 1) {
    dawnSkyTRGB = daySkyTRGB = nightSkyTRGB = readColor()
  } else {
    dawnSkyTRGB = readColor()
    daySkyTRGB = readColor()
    nightSkyTRGB = readColor()
  }

  const pixelCount = textureCount * textureDim * textureDim
  const textures = new Uint16Array(buffer, offset, pixelCount)
  offset += pixelCount * 2

  const objects = []
  for (let i = 0; i < modelCount; i++) {
      let objInfo = {
          radius: dv.getInt32(offset + 0, true),
          yLo: dv.getInt32(offset + 4, true),
          yHi: dv.getInt32(offset + 8, true),
          lineLength: dv.getInt32(offset + 12, true),
          lineIntensity: dv.getInt32(offset + 16, true),
          circleRad: dv.getInt32(offset + 20, true),
          circleIntensity: dv.getInt32(offset + 24, true),
          flags: dv.getUint32(offset + 28, true),
          grRad: dv.getInt32(offset + 32, true),
          lastAniTime: dv.getUint32(offset + 36, true),
          model: null,
          billboard: null,
          animation: null,
      }
      offset += 40 // read data
      offset += 24 // reserved
      const { model, size } = load3DF(buffer, offset)
      objInfo.model = model
      offset += size
      // billboard only for C2 and later
      // animation not used in C1 (is supported though, I'm just lazy)
      objects.push(objInfo)
  }

  const skyTexture = new Uint16Array(buffer, offset, 256 * 256)
  offset += 256 * 256 * 2
  const cloudMap = new Uint8ClampedArray(buffer, offset, 128 * 128)
  offset += 128 * 128

  // Fog list
  const fogCount = dv.getUint32(offset, true)
  offset += 4

  const fogs = []
  for (let i = 0; i < fogCount; i++) {
      fogs.push({
          color: dv.getUint32(offset + 0, true),
          yBegin: dv.getFloat32(offset + 4, true),
          mortal: dv.getUint32(offset + 8, true),
          transp: dv.getFloat32(offset + 12, true),
          fLimit: dv.getFloat32(offset + 16, true),
      })
      offset += 20
  }

  // Random sounds list
  const randomSoundCount = dv.getUint32(offset, true)
  offset += 4

  const randomSounds = []
  for (let i = 0; i < randomSoundCount; i++) {
      const pcmSize = dv.getUint32(offset, true)
      offset += 4
      randomSounds.push( new Uint8ClampedArray(buffer, offset, pcmSize) )
      offset += pcmSize
  }

  // Ambient sounds
  const ambientSoundCount = dv.getUint32(offset, true)
  offset += 4

  const ambientSounds = []
  for (let i = 0; i < ambientSoundCount; i++) {
      const pcmSize = dv.getUint32(offset, true)
      offset += 4
      console.log(i, pcmSize)
      let ambSound = new Uint8ClampedArray(buffer, offset, pcmSize)
      offset += pcmSize

      const randoms = []
      for (let j = 0; j < 16; j++) {
          randoms.push({
              number: dv.getUint32(offset + 0, true),
              volume: dv.getUint32(offset + 4, true),
              frequency: dv.getUint32(offset + 8, true),
              environment: dv.getUint16(offset + 12, true),
              // 16 bits reserved
          })
          offset += 16
      }
      const rCount = dv.getUint32(offset, true)
      const volume = dv.getUint32(offset + 4, true)
      offset += 8

      ambientSounds.push({
          audio: ambSound,
          random: randoms.slice(0, rCount),
          volume,
      })
  }

  return {
    textureCount,
    textureDim,
    modelCount,
    dawnSkyRGB, dawnSkyTRGB,
    daySkyRGB, daySkyTRGB,
    nightSkyRGB, nightSkyTRGB,
    textures,
    objects,
    skyTexture,
    cloudMap,
    fogs,
    randomSounds,
    ambientSounds,
  }
}