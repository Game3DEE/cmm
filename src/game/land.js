// TODO:
//   - Make parameter naming consistent:
//          - x,z or x,y,z 
//          - replace Camera{X,Z} params with just {x,z}
//   - Generalize object collision check
//   - Reduce the TrophyMode checking code, use SpatialHash?

let map, rsc

const ctHScale = 32

let TrophyMode = false

const fm = {
    NOWAY: 0x20,
    Reverse: 0x40,
    Water: 0x80,
}

export function initLand(mapData,rscData) {
    map = mapData
    rsc = rscData

    // Models are rendered at 2x scale, so update physics info
    rsc.objects.forEach(obj => {
        obj.yLo *= 2
        obj.yHi *= 2
        obj.radius *= 2
		obj.lineLength = Math.floor(obj.lineLength / 128) * 128
    })
}

function mapIdx(y,x) {
    return y * map.size + x
}

/**
  * x Cell X coordinate
  * y Cell Y coordinate
  * 
  * Reads from object heightmap
  */
export function GetLandOH(x, y) {
    return (-48 + map.objectHeightMap[mapIdx(y,x)]) * ctHScale
}

export function GetLandOUH(x, y) {
    if (map.flags1[mapIdx(y,x)] & fm.Reverse)
        return ((map.heightMap[mapIdx(y,x+1)] + map.heightMap[mapIdx(y+1,x)]) / 2) * ctHScale
    else
        return ((map.heightMap[mapIdx(y,x)] + map.heightMap[mapIdx(y+1,x+1)]) / 2) * ctHScale
}

export function GetLandUpH(x,y) {
    const CX = Math.floor(x / 256)
    const CY = Math.floor(y / 256)
    
    const dx = Math.floor(x % 256)
    const dy = Math.floor(y % 256)

    let h1 = map.heightMap[mapIdx(CY,CX)]
    let h2 = map.heightMap[mapIdx(CY,CX+1)]
    let h3 = map.heightMap[mapIdx(CY+1,CX+1)]
    let h4 = map.heightMap[mapIdx(CY+1,CX)]

    if (map.flags1[mapIdx(CY,CX)] & fm.Reverse) {
        if (256 - dx > dy) {
            h3 = h2 + h4 - h1
        } else {
            h1 = h2 + h4 - h3
        }
    } else {
        if (dx>dy) {
            h4 = h1 + h3 - h2
        } else {
            h2 = h1 + h3 - h4
        }
   }

    const h =
        (h1 * (256 - dx) + h2 * dx) * (256 - dy) +
	    (h4 * (256 - dx) + h3 * dx) * dy

    return h / 256 / 256 * ctHScale
}

export function GetLandH(x, y) { 
    const CX = Math.floor(x / 256)
    const CY = Math.floor(y / 256)
   
    const dx = Math.floor(x % 256)
    const dy = Math.floor(y % 256)

    let h1 = map.waterMap[mapIdx(CY,CX)]
    let h2 = map.waterMap[mapIdx(CY,CX+1)]
    let h3 = map.waterMap[mapIdx(CY+1,CX+1)]
    let h4 = map.waterMap[mapIdx(CY+1,CX)]

    if (map.flags1[mapIdx(CY,CX)] & fm.Reverse) {
        if (256 - dx > dy) {
            h3 = h2 + h4 - h1
        } else {
            h1 = h2 + h4 - h3
        }
    } else {
        if (dx > dy) {
            h4 = h1 + h3 - h2
        } else {
            h2 = h1 + h3 - h4
        }
    }

    const h =
	   (h1 * (256 - dx) + h2 * dx) * (256 - dy) +
	   (h4 * (256 - dx) + h3 * dx) * dy

    return (h / 256 / 256 - 48) * ctHScale
}

export function GetLandQH(CameraX, PlayerY, CameraZ) {
    let h = GetLandQHNoObj(CameraX, CameraZ)

    checkObjectCollision(CameraX, PlayerY, CameraZ, (ob, cx, cz) => {
        h = rsc.objects[ob].yHi + GetLandOH(cx, cz)
    })

    return h;
}


export function GetLandHObj(CameraX, PlayerY, CameraZ) {
    let h = 0

    checkObjectCollision(CameraX, PlayerY, CameraZ, (ob, cx, cz) => {
        h = rsc.objects[ob].yHi + GetLandOH(cx, cz)
    })

    return h;
}


export function GetLandQHNoObj(x, z) {
    return Math.max(
        GetLandH(x, z),

        GetLandH(x - 90, z - 90),
        GetLandH(x + 90, z - 90),
        GetLandH(x - 90, z + 90),
        GetLandH(x + 90, z + 90),

        GetLandH(x + 128, z),
        GetLandH(x - 128, z),
        GetLandH(x, z + 128),
        GetLandH(x, z - 128),
    )
}


export function GetObjectH(x, y, R) {
    x = (x << 8) + 128;
    y = (y << 8) + 128;
    let hr,h;
    hr =GetLandH(x,   y);
    h = GetLandH(x+R, y); if (h < hr) hr = h;
    h = GetLandH(x-R, y); if (h < hr) hr = h;
    h = GetLandH(x,   y+R); if (h < hr) hr = h;
    h = GetLandH(x,   y-R); if (h < hr) hr = h;
    hr += 15;
    return  Math.floor(hr / ctHScale + 48);
}


export function GetObjectHWater(x, y) {
    if (map.flags1[mapIdx(y,x)] & fm.Reverse)
        return Math.floor(map.heightMap[mapIdx(y,x+1)]+map.heightMap[mapIdx(y+1,x)]) / 2 + 48

    return Math.floor(map.heightMap[mapIdx(y,x)]+map.heightMap[mapIdx(y+1,x+1)]) / 2 + 48
}


// XXX NOTE: cx/cz are references in C++!
export function CheckCollision(v) {
    let cx = v[0]
    let PlayerY = v[1]
    let cz = v[2]

    // Keep player away from map borders
    if (cx < 36*256) cx = 36*256
    if (cz < 36*256) cz = 36*256
    if (cx >480*256) cx =480*256
    if (cz >480*256) cz =480*256

    checkObjectCollision(cx, PlayerY, cz, (ob,_x,_z,ox,oz,CR,r) => {
        r = Math.floor(r) // XXX precision issues in JS floats?
        cx = cx - (ox - cx) * (CR - r) / r
        cz = cz - (oz - cz) * (CR - r) / r
    })

    if (TrophyMode) {
        for (let c=0; c < ChCount; c++) {
            const px = Characters[c].pos.x;
            const pz = Characters[c].pos.z;
            const CR = DinoInfo[ Characters[c].CType ].Radius;
            const r = Math.sqrt( (px-cx)*(px - cx) + (pz-cz)*(pz-cz) );
            if (r < CR) {
                cx = cx - (px - cx) * (CR - r) / r;
                cz = cz - (pz - cz) * (CR - r) / r;
            }
        }    
    }

    // Return updated values
    v[0] = cx
    v[1] = PlayerY
    v[2] = cz
}

export function checkObjectCollision(x, y, z, cb) {
    const ccx = Math.floor(x / 256)
    const ccz = Math.floor(z / 256)

    for (let zo = -2; zo <= 2; zo++) {
        for (let xo = -2; xo <= 2; xo++) {
            const ob = map.objectMap[mapIdx(ccz+zo,ccx+xo)]
            if (ob != 255) {
                const CR = rsc.objects[ob].radius //XXX - 1
            
                const oz = (ccz + zo) * 256 + 128
                const ox = (ccx + xo) * 256 + 128

                if (rsc.objects[ob].yHi + GetLandOH(ccx + xo, ccz + zo) < y + 128) continue
                if (rsc.objects[ob].yLo + GetLandOH(ccx + xo, ccz + zo) > y + 256) continue
                const r = Math.sqrt( (ox - x) * (ox - x) + (oz - z) * (oz - z) )
                if (r < CR) {
                    cb(ob, ccx + xo, ccz + zo, ox, oz, CR, r)
                }
            }
        }
    }
}

export function CheckPlaceCollisionP(v) {
   let ccx = Math.floor(v[0] / 256)
   let ccz = Math.floor(v[2] / 256)

   if (ccx < 4 || ccz < 4 || ccx > 508 || ccz > 508) return true

    let F = (
        map.flags1[mapIdx(ccz,ccx-1)] |
        map.flags1[mapIdx(ccz-1,ccx)] |
        map.flags1[mapIdx(ccz-1,ccx-1)] |
        map.flags1[mapIdx(ccz,ccx)] | 
        map.flags1[mapIdx(ccz+1,ccx)] |
        map.flags1[mapIdx(ccz,ccx+1)] |
        map.flags1[mapIdx(ccz+1,ccx+1)]
    )

    if (F & (fm.Water + fm.NOWAY)) return true

    let h = GetLandH(v[0], v[2])
    v[1] = h

    let hh = GetLandH(v[0] - 164, v[2] - 164); if (Math.abs(hh - h) > 200) return true
        hh = GetLandH(v[0] + 164, v[2] - 164); if (Math.abs(hh - h) > 200) return true
		hh = GetLandH(v[0] - 164, v[2] + 164); if (Math.abs(hh - h) > 200) return true
		hh = GetLandH(v[0] + 164, v[2] + 164); if (Math.abs(hh - h) > 200) return true
  
    for (let z = -2; z <= 2; z++) {
        for (let x = -2; x <= 2; x++) {
            const ob = map.objectMap[mapIdx(ccz+z,ccx+x)]
            if (ob != 255) {
		        if (rsc.objects[ob].radius < 10) continue

                let CR = rsc.objects[ob].radius + 64
        
                let oz = (ccz + z) * 256 + 128
                let ox = (ccx + x) * 256 + 128
        
                let r = Math.sqrt( (ox - v[0]) * (ox - v[0]) + (oz - v[2]) * (oz - v[2]) )
                if (r < CR) return true
            }
        }
    }

    return false
}
