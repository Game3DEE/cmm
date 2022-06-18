// XXX TODO add C2 support! (everything starting with objects[] on is C1 only)

import { load3DF } from './3df.js'

export const of = {
  PlaceWater: 1,
  PlaceGround: 2,
  PlaceUser: 4,
  Animated: 0x80000000,
}

const textureDim = 128

export function loadRSC(buffer, version) {
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

  let dawnSkyTexture, daySkyTexture, nightSkyTexture
  if (version === 1) {
    dawnSkyTexture = daySkyTexture = nightSkyTexture = new Uint16Array(buffer, offset, 256 * 256)
    offset += 256 * 256 * 2
  } else {
    dawnSkyTexture = new Uint16Array(buffer, offset, 256 * 256)
    offset += 256 * 256 * 2
    daySkyTexture = new Uint16Array(buffer, offset, 256 * 256)
    offset += 256 * 256 * 2
    nightSkyTexture = new Uint16Array(buffer, offset, 256 * 256)
    offset += 256 * 256 * 2
  }

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

  const waterCount = dv.getUint32(offset, true)
  offset += 4

  const waters = []
  for (let i = 0; i < waterCount; i++) {
    waters.push({
      textureIndex: dv.getUint32(offset + 0, true),
      level: dv.getInt32(offset + 4, true),
      opacity: dv.getFloat32(offset + 8, true),
      color: dv.getUint32(offset + 12, true),
    })
    offset += 16
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
    dawnSkyTexture,
    daySkyTexture,
    nightSkyTexture,
    cloudMap,
    fogs,
    randomSounds,
    ambientSounds,
  }
}

export function saveRSC(rsc) {
  const objectDataSize = 0 //rsc.objects.length * xxx
  const soundDataSize = rsc.randomSounds.reduce((p,rs) => p + rs.length, 0)
  const ambSoundDataSize = rsc.ambientSounds.reduce((p,as) => p + as.audio.length, 0)
  const size = 3 * 12 + // SkyRGB
              3 * 12 + // SkyTRGB
              4 + 4 + // tex count + model count
              rsc.textures.length * 2 + // textures
              objectDataSize + // objects
              256 * 256 * 2 * 3 + // sky textures [dawn,day,night]
              128 * 128 + // cloud map
              4 + rsc.fogs.length * 20 +
              4 + soundDataSize + rsc.randomSounds.length * 4 + // ramdom audio samples
              4 + ambSoundDataSize + rsc.ambientSounds.length * (256 + 12) + // rData + pcmSize
              4 + rsc.waters.length * 16 // water table

  const buf = new ArrayBuffer(size)
  const dv = new DataView(buf)
  let offset = 0

  function writeRGB(arr) {
    dv.setUint32(offset + 0, arr[0], true)
    dv.setUint32(offset + 4, arr[1], true)
    dv.setUint32(offset + 8, arr[2], true)
    offset += 12
  }

  // write tex & obj count
  dv.setUint32(offset + 0, rsc.textures.length / (textureDim * textureDim), true)
  dv.setUint32(offset + 4, rsc.objects.length, true)
  offset += 8

  // write sky colors
  writeRGB(rsc.dawnSkyRGB); writeRGB(rsc.daySkyRGB); writeRGB(rsc.nightSkyRGB)
  writeRGB(rsc.dawnSkyTRGB); writeRGB(rsc.daySkyTRGB); writeRGB(rsc.nightSkyTRGB)

  // write terrain texture data
  for (let i = 0; i < rsc.textures.length; i++) {
    dv.setUint16(offset, rsc.textures[i], true)
    offset += 2
  }

  // write objects
  for (let i = 0; i < rsc.objects.length; i++) {
    // TODO XXX implement!
  }

  // Write sky textures
  for (let i = 0; i < rsc.dawnSkyTexture.length; i++) {
    dv.setUint16(offset, rsc.dawnSkyTexture[i], true)
    offset += 2
  }
  for (let i = 0; i < rsc.daySkyTexture.length; i++) {
    dv.setUint16(offset, rsc.daySkyTexture[i], true)
    offset += 2
  }
  for (let i = 0; i < rsc.nightSkyTexture.length; i++) {
    dv.setUint16(offset, rsc.nightSkyTexture[i], true)
    offset += 2
  }

  // Write cloud map
  for (let i = 0; i < rsc.cloudMap.length; i++) {
    dv.setUint8(offset, rsc.cloudMap[i])
    ++offset
  }

  // Write Fog list
  dv.setUint32(offset, rsc.fogs?.length || 0, true)
  offset += 4
  rsc.fogs?.forEach(f => {
    dv.setUint32(offset + 0, f.color, true),
    dv.setFloat32(offset + 4, f.yBegin, true),
    dv.setUint32(offset + 8, f.mortal, true),
    dv.setFloat32(offset + 12, f.transp, true),
    dv.setFloat32(offset + 16, f.fLimit, true),
    offset += 20
  })

  // Write random sounds
  dv.setUint32(offset, rsc.randomSounds.length, true)
  offset += 4
  rsc.randomSounds?.forEach(rs => {
    dv.setUint32(offset, rs.length, true)
    offset += 4
    for (let i = 0; i< rs.length; i++) {
      dv.setUint8(offset, rs[i])
      ++offset
    }
  })

  // Write ambient sounds
  dv.setUint32(offset, rsc.ambientSounds?.length || 0, true)
  offset += 4
  rsc.ambientSounds?.forEach(as => {
    console.log(as.audio)
    dv.setUint32(offset, as.audio.length, true)
    offset += 4
    for (let i = 0; i < as.audio.length; i++) {
      dv.setUint8(offset, as.audio[i])
      ++offset
    }
    const emptyRandom = { number: 0, volume: 0, frequency: 0, environment: 0 }
    for (let i = 0; i < 16; i++) {
      const rdata = as.randoms?.[i] || emptyRandom
      dv.setUint32(offset + 0, rdata.number, true),
      dv.setUint32(offset + 4, rdata.volume, true),
      dv.setUint32(offset + 8, rdata.frequency, true)
      dv.setUint16(offset + 12, rdata.environment, true)
      dv.setUint16(offset + 14, 0, true)
      offset += 16
    }
    dv.setUint32(offset + 0, as.randoms?.length || 0, true)
    dv.setUint32(offset + 4, as.volume, true)
    offset += 8
  })

  // Write waters
  dv.setUint32(offset, rsc.waters.length, true)
  offset += 4
  rsc.waters.forEach(w => {
    dv.setUint32(offset + 0, w.textureIndex, true)
    dv.setInt32(offset + 4, w.level, true)
    dv.setFloat32(offset + 8, w.opacity, true)
    dv.setUint32(offset + 12, w.color, true)
    offset += 16
  })

  //DEBUG: console.log(offset, buf.byteLength)

  return buf
}