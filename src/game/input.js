// TODO: Come up with some way of handling "still down" generally
// (currently game keeps "last frame key status" itself, but should
//  be part of the input system)

import nipplejs from 'nipplejs'

export let KeyFlags = 0

export const kf = {
    Forward: 1,
    Backward: 2,
    SRight: 4,
    SLeft: 8,
    Jump: 16,
    LookUp: 32,
    LookDn: 64,
    Left: 128,
    Right: 256,
    Down: 512,
    ToggleMap: 1024,
}

function handleKey(ev) {
    const down = ev.type == 'keydown'

    function setOrClearKeyFlag(flag) {
        KeyFlags = down ? KeyFlags | flag : KeyFlags & ~flag
        ev.preventDefault()
    }

    switch(ev.key.toLowerCase()) {
        case 'arrowup':
            setOrClearKeyFlag(kf.LookUp)
            break
        case 'arrowdown':
            setOrClearKeyFlag(kf.LookDn)
            break
        case 'arrowleft':
            setOrClearKeyFlag(kf.Left)
            break
        case 'arrowright':
            setOrClearKeyFlag(kf.Right)
            break
        case 'a':
            setOrClearKeyFlag(kf.SLeft)
            break
        case 's':
            setOrClearKeyFlag(kf.Backward)
            break
        case 'd':
            setOrClearKeyFlag(kf.SRight)
            break
        case 'w':
            setOrClearKeyFlag(kf.Forward)
            break
        case ' ':
            setOrClearKeyFlag(kf.Jump)
            break
        case 'x':
            setOrClearKeyFlag(kf.Down)
            break
        case 'tab':
            setOrClearKeyFlag(kf.ToggleMap)
            break
        default:
            console.log(`Unhandled key: ${ev.key}`)
    }
}

export function initInput() {
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKey)

    // https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
    const hasTouch = (('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0));

    if (hasTouch) {
        const moveStick = nipplejs.create({
            zone: document.getElementById('left'),
            color: 'green',
        });

        moveStick.on('removed', () => {
            KeyFlags &= ~(kf.Forward | kf.Backward | kf.SRight | kf.SLeft)
        })
        moveStick.on('move', (ev,data) => {
            const angle = Math.round(data.angle.degree / 45) * 45
            // clear movement key flags (the only ones we change here)
            KeyFlags &= ~(kf.Forward | kf.Backward | kf.SRight | kf.SLeft)
            switch(angle) {
                case 45:    // forward + right
                    KeyFlags |= kf.Forward | kf.SRight
                    break
                case 90:    // forward
                    KeyFlags |= kf.Forward
                    break
                case 135:   // forward + left
                    KeyFlags |= kf.Forward | kf.SLeft
                    break
                case 180:   // left
                    KeyFlags |= kf.SLeft
                    break
                case 225:   // backward + left
                    KeyFlags |= kf.Backward | kf.SLeft
                    break
                case 270:   // backward
                    KeyFlags |= kf.Backward
                    break
                case 315:   // backward + right
                    KeyFlags |= kf.SRight | kf.Backward
                    break
                case 0:
                case 360:   // right
                    KeyFlags |= kf.SRight
                    break
            }
        })

        const lookStick = nipplejs.create({
            zone: document.getElementById('right'),
            color: 'red',
        });

        lookStick.on('removed', () => {
            KeyFlags &= ~(kf.LookUp | kf.LookDn | kf.Right | kf.Left)
        })
        lookStick.on('move', (ev,data) => {
            const angle = Math.round(data.angle.degree / 45) * 45
            // clear movement key flags (the only ones we change here)
            KeyFlags &= ~(kf.LookUp | kf.LookDn | kf.Right | kf.Left)
            switch(angle) {
                case 45:    // forward + right
                    KeyFlags |= kf.LookUp | kf.Right
                    break
                case 90:    // forward
                    KeyFlags |= kf.LookUp
                    break
                case 135:   // forward + left
                    KeyFlags |= kf.LookUp | kf.Left
                    break
                case 180:   // left
                    KeyFlags |= kf.Left
                    break
                case 225:   // backward + left
                    KeyFlags |= kf.LookDn | kf.Left
                    break
                case 270:   // backward
                    KeyFlags |= kf.LookDn
                    break
                case 315:   // backward + right
                    KeyFlags |= kf.Right | kf.LookDn
                    break
                case 0:
                case 360:   // right
                    KeyFlags |= kf.Right
                    break
            }
        })        
    }
}
