// TODO: Come up with some way of handling "still down" properly

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
}
