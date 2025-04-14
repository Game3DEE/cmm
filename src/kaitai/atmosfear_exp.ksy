meta:
  id: atmosfear_exp
  file-extension: exp
  application: Atmosfear Engine as used in DN:ES
  endian: le
  encoding: ascii

seq:
  - id: sig_or_count
    type: u4
  - id: raw_version
    type: u4
    if: sig_or_count == 0x80112233
  - id: raw_count
    type: u4
    if: version > 0
  - id: models
    type: entry
    repeat: expr
    repeat-expr: count
  - id: num_textures
    type: u4
  - id: textures
    type: strz
    size: 32
    repeat: expr
    repeat-expr: num_textures

instances:
    version:
      value: "sig_or_count == 0x80112233 ? raw_version : 0"
    count:
      value: "version > 0 ? raw_count : sig_or_count"

types:
  entry:
    seq:
      - id: name
        type: strz
        size: 64
      - id: num_vertices # 0x40
        type: u4
      - id: num_faces # 0x44
        type: u4
      - id: field_48
        type: u4
      - id: num_groups # 0x4c
        type: u4
      - id: num_items # 0x50
        type: u4
      - id: val6 # 0x6c
        type: f4
      - id: val7 # 0x5c
        type: u4
      - id: val8 # 0x6c
        type: u4
      - id: val9 # 0x6c
        type: u4

      - id: v7_val1 # 0x6c
        type: u4
        if: _root.version >= 7
      - id: v7_val2 # 0x6c
        type: u4
        if: _root.version >= 7
      - id: v7_val3 # 0x6c
        type: u4
        if: _root.version >= 7
      - id: v7_val4 # 0x6c
        type: u4
        if: _root.version >= 7

      - id: val10 # 0x6c
        type: u4
      - id: val11 # 0x58
        type: u4

      - id: v6_val1 # 0x23d4
        size: 128
        if: _root.version >= 6
      - id: v6_val2 # 0x2454
        type: u4
        if: _root.version >= 6
      - id: v6_val3 # 0x2454
        type: u4
        if: _root.version >= 6
    
      - id: vertices
        type: vector3f
        repeat: expr
        repeat-expr: num_vertices

      - id: faces
        type: face
        repeat: expr
        repeat-expr: num_faces

      - id: field_48_data
        size: "(_root.version < 3) ? 32 : 36"
        repeat: expr
        repeat-expr: field_48

      - id: skipped_per_face
        type: u4
        repeat: expr
        repeat-expr: num_faces
        if: _root.version != 0

      - id: skipped_per_face2
        size: 20
        repeat: expr
        repeat-expr: num_faces

      - id: groups
        type: strz
        size: 128
        repeat: expr
        repeat-expr: num_groups

      - id: items
        size: "(_root.version < 5) ? 32+4 : 128"
        repeat: expr
        repeat-expr: num_items

  face:
    seq:
      - id: indices
        type: u2
        repeat: expr
        repeat-expr: 4
      - id: val1
        type: u4
      - id: val2
        type: u4
      - id: uvs
        type: vector2f
        repeat: expr
        repeat-expr: 4
      - id: colors
        type: u4
        repeat: expr
        repeat-expr: 4
      - id: reserved
        size: 12


  vector2f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4

  vector3f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
