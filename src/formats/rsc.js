export function loadRSC(buffer, version = 2) {
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

  return {
    textureCount,
    textureDim,
    modelCount,
    dawnSkyRGB, dawnSkyTRGB,
    daySkyRGB, daySkyTRGB,
    nightSkyRGB, nightSkyTRGB,
    textures,
  }
}