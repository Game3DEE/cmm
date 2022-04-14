meta:
  id: prism3d_gdt
  title: Prism3D map model format
  file-extension: gdt
  endian: le
  encoding: utf8
  
seq:
  - id: magic
    contents: "GEOM"
  - id: version
    contents: "0006"
  - id: model_count
    type: u4
  - id: models
    type: model
    repeat: expr
    repeat-expr: model_count

types:
  model:
    seq:
      - id: type
        type: u4
      - size: 24
      - id: vertex_count
        type: u2
      - id: index_count
        type: u2
      - id: indices
        type: u2
        repeat: expr
        repeat-expr: index_count
      - id: vertices
        type: vector3f
        repeat: expr
        repeat-expr: vertex_count
      - id: colors
        type: u4
        repeat: expr
        repeat-expr: vertex_count
      - id: uvs
        type: uv
        repeat: expr
        repeat-expr: vertex_count
      - id: unknown
        type: u2

  uv:
    seq:
      - id: normal
        type: vector3f
        if: _parent.type != 349
      - id: u
        type: f4
      - id: v
        type: f4

  vector3f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
