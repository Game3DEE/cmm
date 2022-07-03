import { initInput, KeyFlags, updateInput } from "./input.js"
import { GetLandH, initLand } from "./land.js"
import { setPlayer, ProcessControls } from './player.js'

const landings = []

export const MAX_HEALTH = 10000

export let RealTime, PrevTime = 0, TimeDt, DeltaT, Takt, MyHealth = MAX_HEALTH

let SLOW = false, PAUSE = false

function ProcessSyncro() {
    RealTime = Date.now();
    if (SLOW) RealTime /= 4
    TimeDt = RealTime - PrevTime
    if (TimeDt<0) TimeDt = 10
    if (TimeDt>10000) TimeDt = 10
    if (TimeDt>1000) TimeDt = 1000
    DeltaT = TimeDt / 1000 // IRA added here
    PrevTime = RealTime
    Takt++

    if (!PAUSE && MyHealth) {
        MyHealth += TimeDt * 4
    }

    MyHealth = Math.min(MyHealth, MAX_HEALTH)
}

export function initEngine(map, rsc) {
    // setup map handling
    initLand(map, rsc)

    landings.length = 0
    for (let i = 0; i < map.objectMap.length; i++) {
        const ob = map.objectMap[i]
        if (ob === 254) { // Landing
            map.objectMap[i] = 255 // make empty place

            const x = (i % 512) * 256 + 128
            const z = Math.floor(i / 512) * 256 + 128
            landings.push([
                x,
                GetLandH(x, z),
                z,
            ])

        }
    }
    const idx = Math.floor(landings.length * Math.random())
    const landing = landings[idx]
    setPlayer(landing[0], landing[1], landing[2])
    initInput()
}

export function stepEngine(delta) {
    ProcessSyncro()
    ProcessControls(KeyFlags, RealTime, TimeDt, DeltaT)
    updateInput()
}
