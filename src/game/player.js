import { clamp } from '../utils.js'
import {
    GetLandQH,
    GetLandQHNoObj,
    GetLandUpH,
    CheckCollision,
} from './land.js'
//import { MyHealth } from './game.js'
import { kf } from './input.js'

const swimSpeed = 0.25
const runSpeed = 0.7
const walkSpeed = 0.3

// Player velocity
let VSpeed = 0, SSpeed = 0, YSpeed = 0

// Player position / rotation
export let PlayerX = 76*256+128, PlayerY = 1000, PlayerZ = 70*256+128, PlayerAlpha = 0, PlayerBeta = 0

// Camera position / rotation
export let CameraX, CameraY, CameraZ, CameraAlpha, CameraBeta

// Flags
let
    FLY = false,
    BINMODE = false,
    OPTICMODE = false,
    UNDERWATER = false,
    SWIM = false,
    RunMode = true, // XXX false
    NOCLIP = false,
    CLIP3D = false/*?*/

// Head bobbing data
let HeadY = 0, HeadAlpha = 0, HeadBeta = 0, HeadBackR = 0

// ? set, not read
let BackViewR, BackViewRR

// ?
let stepdd = 0, stepdy = 0

// View distance
let ctViewR

// Under Water Timer
let UnderWaterT = 0

// Used for setting the camera position as well?
let ca = 0, sa = 0

// Temporary value for player{X,Y,Z}
let playerV = [ 0, 0, 0 ]

export function setRunMode(run) {
    RunMode = run
}

export function setPlayer(x,y,z) {
    PlayerX = x
    PlayerY = y
    PlayerZ = z
}

export function ProcessControls(KeyFlags, RealTime, TimeDt, DeltaT) {
    ProcessPlayerMovement(KeyFlags, TimeDt, DeltaT)

    //console.log(`UNDERWATER: ${UNDERWATER} SWIM: ${SWIM}`)
    
    //======= Y movement ===========//
    HeadAlpha = HeadBackR / 20000
    HeadBeta =-HeadBackR / 10000
    if (HeadBackR) {
        HeadBackR -= DeltaT * (80 + (32-Math.abs(HeadBackR - 32)) * 4)
        if (HeadBackR <= 0) { HeadBackR = 0 }
    }

    if ((KeyFlags & kf.Down) || UNDERWATER) {
        if (HeadY < 110) HeadY = 110
        HeadY -= DeltaT * (60 + (HeadY - 110) * 5)
        if (HeadY < 110) HeadY = 110
    } else {
        if (HeadY > 220) HeadY = 220
        HeadY += DeltaT * (60 + (220 - HeadY) * 5)
        if (HeadY > 220) HeadY = 220
    }

    let h = GetLandQH(PlayerX, PlayerY, PlayerZ);
    let hwater = GetLandUpH(PlayerX, PlayerZ);

    //if (DemoPoint.DemoTime) goto SKIPYMOVE;  

    if (!UNDERWATER) {
        if (PlayerY > h) {
            YSpeed -= DeltaT * 3000
        }
    } else if (YSpeed < 0) {
        YSpeed += DeltaT * 4000
        if (YSpeed > 0) {
            YSpeed = 0
        }
    }

    PlayerY += YSpeed * DeltaT
    if (PlayerY <= h) { 
        if (YSpeed < -800) HeadY += YSpeed / 100
        if (PlayerY + 80 < h) PlayerY = h - 80
        PlayerY += (h - PlayerY + 32) * DeltaT * 4
        if (PlayerY > h) PlayerY = h
        if (YSpeed < -600) {
            /* AU:
            AddVoicev(
                fxStep[(RealTime % 3)].length, 
                fxStep[(RealTime % 3)].lpData,
                64
            ) */
        }
        YSpeed = 0
    }

//SKIPYMOVE:

    SWIM = false;
    if (!UNDERWATER && (KeyFlags & kf.Jump)) {
        if (PlayerY < hwater - 148) {
            SWIM = true
            PlayerY = hwater - 148
            YSpeed = 0
        }
    }
 
    let _s = stepdy

    if (SWIM) {
        stepdy = Math.sin(RealTime / 360) * 20
    } else {
        stepdy = Math.min(1,Math.abs(VSpeed) + Math.abs(SSpeed)) * Math.sin(RealTime / 80) * 22
    }

    let d = stepdy - _s
    if (PlayerY < h + 64) {
        if (d < 0 && stepdd >= 0) {
            /*AU: Step
            AddVoicev(
                fxStep[(RealTime % 3)].length, 
                fxStep[(RealTime % 3)].lpData,
                24+Math.floor(VSpeed * 50)
            );*/
        }
    }
    stepdd = d;

    PlayerBeta = clamp(PlayerBeta, -1.26, 1.46)

    //======== set camera pos ===================//

    /*if (!DemoPoint.DemoTime)*/ {
        CameraAlpha = PlayerAlpha + HeadAlpha
        CameraBeta  = PlayerBeta  + HeadBeta

        CameraX = PlayerX - sa * HeadBackR
        CameraY = PlayerY + HeadY + stepdy
        CameraZ = PlayerZ + ca * HeadBackR

    }

    if (CLIP3D) {
        if (sb < 0)
            BackViewR = 320 - 1024 * sb
        else
            BackViewR = 320 + 512 * sb

        BackViewRR = 380 + Math.floor(1024 * Math.abs(sb))
        if (UNDERWATER) {
            BackViewR -= 512 * Math.min(0, sb)
        }
    } else {
        BackViewR = 300
        BackViewRR = 380
    }

    //==================== SWIM & UNDERWATER =========================//
    if (UNDERWATER) {
        UNDERWATER = (GetLandUpH(CameraX, CameraZ) - 4 >= CameraY) || FLY
        if (!UNDERWATER) { 
            HeadY += 20
            CameraY += 20
            //AU: AddVoice(fxWaterOut.length, fxWaterOut.lpData)
        }
    } else {
        UNDERWATER = (GetLandUpH(CameraX, CameraZ) + 28 >= CameraY) || FLY
        if (UNDERWATER) { 
            HeadY -= 20
            CameraY -= 20
            BINMODE = false
            //AU: AddVoice(fxWaterIn.length, fxWaterIn.lpData)
        }
    }

    /* WATER: MyHealth is R/O ?
    if (MyHealth && UNDERWATER) {
        MyHealth -= TimeDt * 12
        if (MyHealth <= 0) {
            AddDeadBody(NULL, HUNT_BREATH)
        }
    }*/

    /* WEAPON:
    if (UNDERWATER && Weapon.state) {
        HideWeapon();
    }*/

    if (!UNDERWATER)
        UnderWaterT = 0
    else if (UnderWaterT < 512)
        UnderWaterT += TimeDt
    else
        UnderWaterT = 512

/* WATER:
    if (UNDERWATER) {
        CameraW = VideoCX * (1.25 + (1+Math.cos(RealTime/180)) / 30  + (1 - Math.sin(UnderWaterT/512 * Math.PI / 2)) / 1.5 )
        CameraH = VideoCX * (1.25 + (1+Math.sin(RealTime/180)) / 30  - (1 - Math.sin(UnderWaterT/512 * Math.PI / 2)) / 16 )
 
        CameraAlpha += Math.cos(RealTime/360) / 120
        CameraBeta  += Math.sin(RealTime/360) / 100
        CameraY     -= Math.sin(RealTime/360) * 4
        FogsList[127].YBegin = (GetLandUpH(CameraX, CameraZ) / ctHScale) + 8
    } else {
        CameraW = VideoCX * 1.25;
        CameraH = CameraW;
    }
*/

    ctViewR = 36;
    if (BINMODE) {
        ctViewR = 40
        CameraW *= BinocularPower
        CameraH *= BinocularPower
    } else if (OPTICMODE) {
        ctViewR = 40
        CameraW *= 3
        CameraH *= 3
    }

    if (SWIM) {
        CameraBeta -= Math.cos(RealTime/360) / 80
        PlayerX += DeltaT * 32
        PlayerZ += DeltaT * 32
    }

/* FOG:
    CameraFogI = FogsMap[Math.floor(CameraZ)>>9][Math.floor(CameraX)>>9];
    if (FogsList[CameraFogI].YBegin * ctHScale > CameraY)
        CAMERAINFOG = (CameraFogI > 0)
    else
        CAMERAINFOG = false;

    if (CAMERAINFOG && MyHealth && FogsList[CameraFogI].Mortal) {
        MyHealth = Math.max(MyHealth, 100000)
        MyHealth -= TimeDt * 64
        if (MyHealth <= 0) {
            AddDeadBody(NULL, HUNT_EAT)
        }
    }
*/

/* AU:
    let CameraAmb = AmbMap[Math.floor(CameraZ)>>9][Math.floor(CameraX)>>9];
    if (UNDERWATER) {
        SetAmbient(
            fxUnderwater.length,
            fxUnderwater.lpData,
            240
        )
    } else {
        SetAmbient(
            Ambient[CameraAmb].sfx.length, 
            Ambient[CameraAmb].sfx.lpData,
            Ambient[CameraAmb].AVolume
        )

        if (Ambient[CameraAmb].RSFXCount) {
            Ambient[CameraAmb].RndTime -= TimeDt
            if (Ambient[CameraAmb].RndTime <= 0) {
                Ambient[CameraAmb].RndTime = (Ambient[CameraAmb].rdata[0].RFreq / 2 + rRand(Ambient[CameraAmb].rdata[0].RFreq)) * 1000;
                const rr = (rand() % Ambient[CameraAmb].RSFXCount);
                const r = Ambient[CameraAmb].rdata[rr].RNumber;
                AddVoice3dv(
                    RandSound[r].length, RandSound[r].lpData,
                    CameraX + siRand(4096),
                    CameraY + siRand(4096),
                    CameraZ + siRand(256) ,
                    Ambient[CameraAmb].rdata[rr].RVolume
                );
            }
        }
    }
    */
}

export function ProcessPlayerMovement(KeyFlags, TimeDt, DeltaT) {
    /*
    POINT ms;
    if (FULLSCREEN) {
        GetCursorPos(&ms);
	    if (REVERSEMS) {
            ms.y = -ms.y + VideoCY * 2;
        }
        rav += (ms.x-VideoCX) / 600;
        rbv += (ms.y-VideoCY) / 600;

        if (KeyFlags & kfStrafe) {
		    SSpeed += rav * 10;
        }
        PlayerAlpha += rav;
        PlayerBeta  += rbv;

        rav /= (2 + TimeDt / 20);
        rbv /= (2 + TimeDt / 20);
        ResetMousePos();
    }*/

    // Dampen speed (gravity/friction)
    if (!(KeyFlags & (kf.Forward | kf.Backward))) {
        VSpeed = (VSpeed > 0) ? Math.max(0, VSpeed - DeltaT * 2) :
	         Math.min(0, VSpeed + DeltaT * 2)
    }
    if (!(KeyFlags & (kf.SLeft | kf.SRight))) {
	    SSpeed = (SSpeed > 0) ? Math.max(0, SSpeed - DeltaT * 2) :
	         Math.min(0, SSpeed + DeltaT * 2)
    }
    // Bump speed based on movement
    if (KeyFlags & kf.Forward) {
        VSpeed += (VSpeed > 0) ? DeltaT : DeltaT * 4
    }
    if (KeyFlags & kf.Backward) {
        VSpeed -= (VSpeed < 0) ? DeltaT : DeltaT * 4
    }
    if (KeyFlags & kf.SRight) {
        SSpeed += (SSpeed > 0) ? DeltaT : DeltaT * 4
    }
    if (KeyFlags & kf.SLeft) {
        SSpeed -= (SSpeed < 0) ? DeltaT : DeltaT * 4
    }

    // Clamp to max speed
    let maxSpeed = walkSpeed
    if (SWIM) {
       maxSpeed = swimSpeed
    }
    if (RunMode && HeadY == 220/* && Weapon.state == 0*/) {
        // We're running and not crouched
        maxSpeed = runSpeed
    }
   
    VSpeed = clamp(VSpeed, -maxSpeed, maxSpeed)
    SSpeed = clamp(SSpeed, -maxSpeed, maxSpeed)
   
    /* XXX todo implement weapon/binocular/etc
    if (KeyboardState[KeyMap.fkFire] & 128) ProcessShoot();
    if (!UNDERWATER && KeyboardState[KeyMap.fkShow] & 128) HideWeapon();
    if (BINMODE) {
	    if (KeyboardState[VK_ADD     ] & 128) BinocularPower+=BinocularPower * TimeDt / 4000;
	    if (KeyboardState[VK_SUBTRACT] & 128) BinocularPower-=BinocularPower * TimeDt / 4000;
        BinocularPower = clamp(BinocularPower, 1.5, 3.0)
    }
    if (KeyFlags & kfCall) MakeCall();
    if (DEBUG && KeyboardState[VK_CONTROL] & 128) {
        VSpeed = (KeyFlags & kfBackward) ? -4 : 4
    }
    */

    if (KeyFlags & kf.Jump) {
        if (YSpeed == 0 && !SWIM) {      
            YSpeed = 600 + Math.abs(VSpeed) * 600
	        //AU: AddVoice(fxJump.length, fxJump.lpData)
        }
    }

    //=========  rotation =========//   
    if (KeyFlags & kf.Right)  PlayerAlpha += DeltaT * 1.5
    if (KeyFlags & kf.Left)   PlayerAlpha -= DeltaT * 1.5
    if (KeyFlags & kf.LookUp) PlayerBeta  -= DeltaT
    if (KeyFlags & kf.LookDn) PlayerBeta  += DeltaT

    //========= movement ==========//
    ca = Math.cos(PlayerAlpha)
    sa = Math.sin(PlayerAlpha)
    const cb = Math.cos(PlayerBeta)
    const sb = Math.sin(PlayerBeta)

    const nv = [ sa, 0, -ca ]
    if (UNDERWATER) {
        nv[0] *=  cb
        nv[1]  = -sb
        nv[2] *=  cb
    }   
   
    let sv = nv.slice() // Vector3d
    nv[0] *= TimeDt * VSpeed
    nv[1] *= TimeDt * VSpeed
    nv[2] *= TimeDt * VSpeed

    sv[0] *= TimeDt * SSpeed
    sv[1]  = 0;
    sv[2] *= TimeDt * SSpeed

    /* STATS:
    if (!TrophyMode) {
        TrophyRoom.Last.path += (TimeDt * VSpeed) / 128;
        TrophyRoom.Last.time += TimeDt / 1000;
    }*/

    //if (SWIM & (VSpeed>0.1) & (sb>0.60)) HeadY-=40;

    const mvi = 1 + TimeDt / 16

    for (let mvc = 0; mvc < mvi; mvc++) {
        PlayerX += nv[0] / mvi
        PlayerY += nv[1] / mvi
        PlayerZ += nv[2] / mvi

	    PlayerX -= sv[2] / mvi
        PlayerZ += sv[0] / mvi
     
        if (!NOCLIP) {
            // XXX TODO change Player{X,Y,Z} to vec3
            playerV[0] = PlayerX
            playerV[1] = PlayerY
            playerV[2] = PlayerZ
            CheckCollision(playerV)
            PlayerX = playerV[0]
            PlayerY = playerV[1]
            PlayerZ = playerV[2]
        }

        if (PlayerY <= GetLandQHNoObj(PlayerX, PlayerZ) + 16) {
            ProcessSlide();
            ProcessSlide();
        }
    }

    if (PlayerY <= GetLandQHNoObj(PlayerX, PlayerZ) + 16) {
        ProcessSlide();
        ProcessSlide();
    }
}

function ProcessSlide() {
    if (NOCLIP || UNDERWATER) return;
    
    const ch = GetLandQHNoObj(PlayerX, PlayerZ);
    let mh = ch;
    let sd = 0;
    let chh;

    chh = GetLandQHNoObj(PlayerX - 16, PlayerZ); if (chh<mh) { mh = chh; sd = 1; }
    chh = GetLandQHNoObj(PlayerX + 16, PlayerZ); if (chh<mh) { mh = chh; sd = 2; }
    chh = GetLandQHNoObj(PlayerX, PlayerZ - 16); if (chh<mh) { mh = chh; sd = 3; }
    chh = GetLandQHNoObj(PlayerX, PlayerZ + 16); if (chh<mh) { mh = chh; sd = 4; }

    chh = GetLandQHNoObj(PlayerX - 12, PlayerZ - 12); if (chh<mh) { mh = chh; sd = 5; }
    chh = GetLandQHNoObj(PlayerX + 12, PlayerZ - 12); if (chh<mh) { mh = chh; sd = 6; }
    chh = GetLandQHNoObj(PlayerX - 12, PlayerZ + 12); if (chh<mh) { mh = chh; sd = 7; }
    chh = GetLandQHNoObj(PlayerX + 12, PlayerZ + 12); if (chh<mh) { mh = chh; sd = 8; }

    if (mh < ch - 16) {
        let delta = (ch - mh) / 4;
        if (sd == 1) { PlayerX -= delta; }
        if (sd == 2) { PlayerX += delta; }
        if (sd == 3) { PlayerZ -= delta; }
        if (sd == 4) { PlayerZ += delta; }
    
        delta *= 0.7;
        if (sd == 5) { PlayerX -= delta; PlayerZ -= delta; }
        if (sd == 6) { PlayerX += delta; PlayerZ -= delta; }
        if (sd == 7) { PlayerX -= delta; PlayerZ += delta; }
        if (sd == 8) { PlayerX += delta; PlayerZ += delta; }     
    }
}
