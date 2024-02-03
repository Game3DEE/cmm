meta:
  id: r3d_scb
  title: R3D model format
  application: Leage of Legends, Stellar Stone LLC games
  file-extension: scb
  endian: le
  encoding: ascii

seq:
  - id: magic
    contents: "r3d2Mesh"
  - id: version_major
    type: u2
  - id: version_minor
    type: u2
  - id: name
    type: strz
    size: 128
  - id: num_vertices
    type: u4
  - id: num_faces
    type: u4
  - id: flags
    type: u4
  - id: center
    type: vector3f
    if: version_major >= 2
  - id: extents
    type: vector3f
    if: version_major >= 2
  - id: has_colors
    type: u4
    if: version_major == 3 and version_minor == 2
  - id: vertices
    type: vector3f
    repeat: expr
    repeat-expr: num_vertices
  - id: vertex_colors
    type: u4
    repeat: expr
    repeat-expr: num_vertices
    if: has_colors == 1
  - id: central
    type: vector3f
    if: version_major >= 2
  - id: faces
    type: face
    repeat: expr
    repeat-expr: num_faces

types:
  face:
    seq:
      - id: indices
        type:
          switch-on: _root.version_major >= 2
          cases:
            true: u4
            false: u2
        repeat: expr
        repeat-expr: 3
      - id: material_name
        type: strz
        size: 64
      - id: uvs
        type: f4
        repeat: expr
        repeat-expr: 6
        doc: u1,u2,u3,v1,v2,v3

  vector3f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4

    