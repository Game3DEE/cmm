// TODO parse random_sound_id items correctly

function parseValue(val) {
    // detect a string
    if (val[0] === '"')
        return val.substr(1,val.length-2)

    // Detect list of values (returned as array)
    let elems = val.split(',')
    if (elems.length > 1) {
        return elems.map(s => s.trim()).map(s => parseValue(s))
    }

    // detect a number
    let num = parseFloat(val)
    if (!isNaN(num))
        return num

    // could not figure out what this is, simply return it as a string
    return val
}

export function loadRST(str) {
    const lines = str.split('\n').map(s => s.trimEnd()).filter(s => s.trim().length > 0)
    const map = {}

    if (lines[0] !== 'carnivores_area_resources') {
        throw new Error(`Invalid RST file`)
    }

    lines.shift() // remove header line

    // Go over all lines in file...
    let group
    let listItem
    lines.forEach(l => {
        if (l[0] === '[') {
            // we're starting in a new "group" of settings
            const m = l.match(/^\[([a-z]+)\]$/i)
            if (!m) throw new Error(`Error in group format`)
            group = m[1]
            map[group] = {}
        } else {
            // Check for simple field assignment
            const m = l.match(/^([a-z_]+)\s\=\s(.*)$/i)
            if (m) {
                // got it, add it to the group
                map[group][m[1]] = parseValue(m[2])
            } else {
                // check for list item
                const m = l.match(/^([a-z_]+)\s+([0-9]+)$/i)
                if (m) {
                    listItem = parseInt(m[2])
                    if (map[group].list === undefined) {
                        map[group].list = []
                    }
                    map[group].list[listItem] = {}
                } else {
                    // nope, then it is a list item field assignment
                    const m = l.match(/^\s+([a-z_]+)\s\=\s(.*)$/i)
                    if (m) {
                        map[group].list[listItem][m[1]] = parseValue(m[2])
                    } else {
                        console.log(`Unable to parse line "${l}"`)
                    }
                }
            }
        }
    })

    return map
}
