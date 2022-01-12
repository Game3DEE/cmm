import { vec3 } from 'gl-matrix'
import { Object3D } from 'three'

import { buildTexture565, buildModel } from '../model.js'
import { GetLandH, CheckPlaceCollisionP } from './land.js'
import { CameraAlpha, PlayerX, PlayerY, PlayerZ } from './player.js'
import { scene } from './renderer/index.js'

let model, container

const DIM_FLY = 0
const DIM_FLYP = 1

let cPhase = 0
let cFTime = 0
let cTarget = vec3.create()
let cPos = vec3.create()
let cAlpha = 0
let cGamma = 0
let cScale = 1 // XXX
let cVSpeed = 0 // XXX
let cRSpeed = 0 // XXX
let cBend = 0 // XXX

export function initAI(car) {
    const tex = buildTexture565(car.texture, car.textureSize)
    model = buildModel(car, tex)
    console.log(model.animations)
    model.mixer.clipAction(model.animations[0]).play()
    model.rotation.order = 'YXZ'
    container = new Object3D()
    container.add(model)
    scene.add(container)

    cPos[0] = cTarget[0] = PlayerX
    cPos[1] = cTarget[1] = PlayerY + 200
    cPos[2] = cTarget[2] = PlayerZ - 1000
}

export function stepAI(delta) {
    const TimeDt = delta * 1000 // XXX

    let newPhase = false
    let _phase = cPhase
    let _FTime = cFTime

    let targetdx, targetdz

    while(true) {
        let targetx = cTarget[0]
        let targetz = cTarget[2]
        targetdx = cTarget[0] - cPos[0]
        targetdz = cTarget[2] - cPos[2]
        
        let tdist = Math.sqrt(targetdx * targetdx + targetdz * targetdz)

        let playerdx = PlayerX - cPos[0]
        let playerdz = PlayerZ - cPos[2]
        let pdist = Math.sqrt(playerdx * playerdx + playerdz * playerdz)

        // run away
        if (pdist > 13240) {
            if (replaceCharacterForward(cPos, cTarget))
                continue;
        }

        // exploring area
        if (tdist < 1024) {
            setNewTargetPlace(cPos, 4048, cTarget)
            continue
        }
        break
    }

    const cTgAlpha = FindVectorAlpha(targetdx, targetdz)
    if (cTgAlpha < 0) cTgAlpha += 2 * Math.PI
    if (cTgAlpha > 2 * Math.PI) cTgAlpha -= 2 * Math.PI
 
    // ----
    // processPrevPhase()

    // select new phase
    cFTime += TimeDt

    /*
    if (cFTime >= cptr.animation[cPhase].AniTime) {       
        cFTime %= cptr.animation[cPhase].AniTime
        newPhase = true
    }*/
    
    if (newPhase) {
        if (cPhase == DIM_FLY) 
        if (cPos[1] > GetLandH(cPos[0], cPos[2]) + 2800)
                cPhase = DIM_FLYP
            else ;
                else
        if (cPhase == DIM_FLYP) 
            if (cPos[1] < GetLandH(cPos[0], cPos[2]) + 1800) 
                cPhase = DIM_FLY
    }

    // process phase changing
    /* XXX TODO
    if ( (_phase != cPhase) || newPhase)
        if ( (rand() & 1023) > 980 )
            ActivateCharacterFx(cptr)
    
    if (_Phase != cPhase) {
        if (!newPhase) cFTime = 0 
        if (cPPMorphTime > 128) {
            cptr.PrevPhase = _Phase
            cptr.PrevPFTime  = _FTime
            cptr.PPMorphTime = 0
        }
    }
    
    
    cFTime %= Animation[cPhase].AniTime
    */

    // rotation to tgalpha
    let rspd, currspeed, tgbend
    let dalpha = Math.abs(cTgAlpha - cAlpha)
    let drspd = dalpha
    if (drspd > Math.PI)
        drspd = 2 * Math.PI - drspd

    if (drspd > 0.02) {
        if (cTgAlpha > cAlpha) {
            currspeed = 0.6 + drspd * 1.2
        } else {
            currspeed =-0.6 - drspd * 1.2
        }
    } else {
        currspeed = 0
    }
        
    if (dalpha > Math.PI)
        currspeed *= -1

    cRSpeed = DeltaFunc(cRSpeed, currspeed, TimeDt / 460)

    tgbend = drspd / 2
    if (tgbend > Math.PI / 2)
        tgbend = Math.PI / 2

    tgbend *= Math.sign(currspeed)
    if (Math.abs(tgbend) > Math.abs(cBend))
        cBend = DeltaFunc(cBend, tgbend, TimeDt / 800)
    else
        cBend = DeltaFunc(cBend, tgbend, TimeDt / 400)


    rspd = cRSpeed * TimeDt / 1024
    if (drspd < Math.abs(rspd))
        cAlpha = cTgAlpha
    else
        cAlpha += rspd

    if (cAlpha > Math.PI * 2) cAlpha -= Math.PI * 2
    if (cAlpha < 0          ) cAlpha += Math.PI * 2

    // movement
    const cLookx = Math.cos(cAlpha)
    const cLookz = Math.sin(cAlpha)
    
    let curspeed = 0
    if (cPhase == DIM_FLY ) curspeed = 1.5
    if (cPhase == DIM_FLYP) curspeed = 1.3
        
    if (drspd > Math.PI / 2) curspeed *= 2 - 2 * drspd / Math.PI;
    
    if (cPhase == DIM_FLY)
        cPos[1] = DeltaFunc(cPos[1], GetLandH(cPos[0], cPos[2]) + 4048, TimeDt / 6)
    else
        cPos[1] = DeltaFunc(cPos[1], GetLandH(cPos[0], cPos[2]), TimeDt / 16)
    
    if (cPos[1] < GetLandH(cPos[0], cPos[2]) + 236)
        cPos[1] = GetLandH(cPos[0], cPos[2]) + 256

    curspeed *= cScale;
    cVSpeed = DeltaFunc(cVSpeed, curspeed, TimeDt / 2024)
        
    cPos[0] += cLookx * cVSpeed * TimeDt
    cPos[2] += cLookz * cVSpeed * TimeDt

    let cTgGamma = cRSpeed / 4
    if (cTgGamma > Math.PI / 6) cTgGamma = Math.PI / 6
    if (cTgGamma < -Math.PI / 6) cTgGamma =-Math.PI / 6
    cGamma = DeltaFunc(cGamma, cTgGamma, TimeDt / 2048)

    // XXXX move to renderer
    container.position.fromArray(cPos)
    model.rotation.y = cAlpha
    //model.rotation.z = cGamma

    // rotation?
    model.mixer.update(delta)
}

let maxTr = 0

function setNewTargetPlace(pos, radius, out) {
    let tr = 0
    let p = vec3.create()

    while(true) {
        p[0] = pos[0] + siRand(Math.floor(radius))
        p[2] = pos[2] + siRand(Math.floor(radius))
        p[1] = GetLandH(p[0], p[2])
        tr++
        if (tr > maxTr) {
            console.log(`setNewTargetPlace(): tries=${tr}`)
            maxTr = tr
        }

        if (tr > 500) {
            console.log(`setNewTargetPlace: ${pos[0]},${pos[1]},${pos[2]}/${radius}: ${p[0]},${p[1]},${p[2]}`)
            break
        }

        if (Math.abs(p[0] - pos[0]) + Math.abs(p[2] - pos[2]) < radius / 2) {
            continue
        }

        if (CheckPlaceCollisionP(p)) {
            continue
        }

        break
    }

    out[0] = p[0]
    out[2] = p[2]
    //cptr.tgtime = 0;
}

function replaceCharacterForward(pos, target) {
    let al = CameraAlpha + siRand(2048) / 2048
    let sa = Math.sin(al)
    let ca = Math.cos(al)
  
    let p = vec3.create()
    p[0] = PlayerX + sa * (36 + rRand(10)) * 256
    p[2] = PlayerZ - ca * (36 + rRand(10)) * 256
    p[1] = GetLandH(p[0], p[2])

    if (p[0] <  16*256) return false
    if (p[2] <  16*256) return false
    if (p[0] > 500*256) return false
    if (p[2] > 500*256) return false
  
    if (CheckPlaceCollisionP(pos)) return false

    //cptr.State = 0
    vec3.copy(pos, p)
    setNewTargetPlace(pos, 2048, target)
    //if (cptr.CType == 2) // dimor/flying AI
    //    pos[1] += 1048;

    return true
}

// ---- math utility functions

function DeltaFunc(a, b, d) {
  if (b > a) {
    a+=d; if (a > b) a = b
   } else {
    a-=d; if (a < b) a = b
   }
   return a
}

function siRand(R) {
  return Math.floor(Math.random() * R * 2+1) - R
}

function rRand(R) {
    return Math.random() * R
}

function Mul2dVectors(vx, vy, ux, uy) {
  return vx * uy - ux * vy
}

function FindVectorAlpha(vx,vy) {
    let adx = Math.abs(vx)
    let ady = Math.abs(vy)

    let alpha = Math.PI / 4
    let dalpha = Math.PI / 8

    for (let i=1; i<=10; i++) {
        alpha = alpha - dalpha * Math.sign(Mul2dVectors(adx,ady, Math.cos(alpha), Math.sin(alpha)))
        dalpha /= 2
    }

    if (vx < 0)
        if (vy < 0)
            alpha += Math.PI
        else
            alpha = Math.PI - alpha
    else if (vy < 0)
        alpha = 2 * Math.PI - alpha
        
    return alpha
}
