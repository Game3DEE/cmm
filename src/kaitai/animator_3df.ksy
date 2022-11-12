meta:
  id: animator_3df
  file-extension: animator_3df
  endian: le
  encoding: utf8

seq:
  - id: magic
    contents: "Kiev"
  - id: version
    type: u4
  - id: skipped
    size: 120
  - id: texture_count
    type: u4
  - id: textures
    type: strz
    size: 16
    repeat: expr
    repeat-expr: texture_count
  - id: fixed_1
    contents: [ 1,0,0,0 ]
    doc: likely LOD count
  - id: vertex_count
    type: u4
  - id: face_count
    type: u4
  - id: bone_count
    type: u4
  - id: vertices
    type: vertex
    repeat: expr
    repeat-expr: vertex_count
  - id: faces
    type: face
    repeat: expr
    repeat-expr: face_count
  - id: bones
    type: bone
    repeat: expr
    repeat-expr: bone_count
  - id: texture_id_per_face
    size: face_count
  - id: face_by_texture_counts
    type: u4
    repeat: expr
    repeat-expr: texture_count

types:
  vertex:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
      - id: owner
        type: s2
      - id: hide
        type: s2

  face:
    seq:
      - id: a
        type: u2
      - id: b
        type: u2
      - id: c
        type: u2
      - id: flags
        type: u2
      - id: tax
        type: f4
      - id: tbx
        type: f4
      - id: tcx
        type: f4
      - id: tay
        type: f4
      - id: tby
        type: f4
      - id: tcy
        type: f4

  bone:
    seq:
      - id: name
        type: strz
        size: 32
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
      - id: owner
        type: s2
        doc: Parent bone, or -1 if no parent
      - id: hide
        type: s2
