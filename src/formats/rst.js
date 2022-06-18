// NOTE: This code is horrific and should be turned into a more simple
//       recursive parser if it is ever seriously used. This is just good
//       enough to create my Mobile => Desktop map converter.

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
    // The following generates lines as:
    //  - all non-empty lines
    //  - stripped of spaces at the end of the line
    //  - as an array
    const lines = str.split('\n').map(s => s.trimEnd()).filter(s => s.trim().length > 0)
    const map = {} // object map returned
    let parent = null

    if (lines[0] !== 'carnivores_area_resources') {
        throw new Error(`Invalid RST file`)
    }

    lines.shift() // remove header line

    // Go over all lines in file...
    let group
    let listItem
    let subListItem
    let subListName
    lines.forEach(l => {
        if (l[0] === '[') {
            // we're starting in a new "group" of settings
            const m = l.match(/^\[([a-z]+)\]$/i)
            if (!m) throw new Error(`Error in group format`)
            group = m[1]
            parent = map[group] = {}
        } else {
            // Check for simple field assignment
            const m = l.match(/^([a-z_]+)\s\=\s(.*)$/i)
            if (m) {
                // got it, add it to the group
                const val = parseValue(m[2])
                parent[m[1]] = val
            } else {
                // check for list item
                const m = l.match(/^([a-z_]+)\s+([0-9]+)$/i)
                if (m) {
                    listItem = parseInt(m[2])
                    if (parent.list === undefined) {
                        parent.list = []
                    }
                    parent.list[listItem] = {}
                    subListItem = subListName = undefined
                } else {
                    // nope, then it is a list item field assignment
                    const m = l.match(/^\s+([a-z_]+)\s\=\s(.*)$/i)
                    if (m) {
                        const val = parseValue(m[2])
                        if (!subListName) {
                            parent.list[listItem][m[1]] = val
                        } else {
                            parent.list[listItem][subListName][subListItem][m[1]] = val
                        }                       
                    } else {
                        // check for sub list item
                        const m = l.match(/^\s+([a-z_]+)_id\s+([0-9]+)$/i)
                        if (m) {
                            subListItem = parseInt(m[2])
                            subListName = m[1]
                            if (parent.list[listItem][subListName] === undefined) {
                                parent.list[listItem][subListName] = []
                            }
                            parent.list[listItem][subListName][subListItem] = {}
                        } else {
                            console.log(`Unable to parse line "${l}"`)
                        }
                    }
                }
            }
        }
    })

    return map
}
