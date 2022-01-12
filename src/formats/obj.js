export function loadOBJ(str) {
    let name = ''
    let vertices = []
    let uvs = []
    let faces = []

    const lines = str.split('\n').map(s => s.trim()).filter(s => s.length > 0)
    lines.forEach(l => {
        const tok = l.split(' ')
        // Skip unused lines
        switch(tok[0]) {
            // Skip unused tokens
            case '#':
            case 's':
            case 'vn':
            case 'mtllib':
            case 'usemtl':
                break;
            
            case 'g':
            case 'o':
                name = tok[1]
                break;

            case 'v':
                vertices.push({
                    position: [
                        parseFloat(tok[1]),
                        parseFloat(tok[2]),
                        parseFloat(tok[3]),
                    ],
                    bone: -1,
                    hide: 0,
                })
                break
            case 'vt':
                uvs.push(
                    parseFloat(tok[1]),
                    parseFloat(tok[2]),
                )
                break
            case 'f':
                let indices = []
                let faceUvs = []
                for (let i = 1; i < tok.length; i++) {
                    const v = tok[i].split('/')
                    indices.push( parseInt(v[0]) -1 )
                    if (v.length > 1) {
                        const uvIdx = parseInt(v[1]) -1
                        faceUvs.push(
                            uvs[uvIdx * 2 + 0],
                            uvs[uvIdx * 2 + 1],
                        )
                    }
                }
                if (indices.length != 3 && faceUvs.length != 6) {
                    console.error(`OBJ format error!`)
                } else {
                    faces.push({
                        indices,
                        uvs: faceUvs,
                        // default the other fields, OBJ does not have them
                        flags: 0,
                        dmask: 0,
                        distant: 0,
                        next: 0,
                        group: 0,
                    })
                }
                break

            default:
                console.warn(`OBJ format: unknown command "${tok[0]}"`)
        }
    })

    return {
        name,
        vertices,
        faces,
    }
}

export function saveOBJ(model) {
    let s = 
`# Created by Game3DEE Carnivores Tools
# ${model.vertices.length} vertices, ${model.faces.length} triangles
g ${model.name}\n`
    model.vertices.forEach(v => s += `v ${v.position[0]} ${v.position[1]} ${v.position[2]}\n`)
    model.faces.forEach(f => {
        s += `vt ${f.uvs[0] / 256} ${f.uvs[1] / 256} 0.0\n`
        s += `vt ${f.uvs[2] / 256} ${f.uvs[3] / 256} 0.0\n`
        s += `vt ${f.uvs[4] / 256} ${f.uvs[5] / 256} 0.0\n`
    })
    model.faces.forEach((f,i) => {
        s += `f ${f.indices[0]+1}/${i*3+1} ${f.indices[1]+1}/${i*3+2} ${f.indices[2]+1}/${i*3+3}\n`
    })

    return s
}