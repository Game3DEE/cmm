meta:
  id: serious1_bs
  file-extension: bs
  endian: le
  encoding: utf8

seq:
  - id: magic
    contents: "SKEL"
  - id: version
    type: u4
  - id: lod_count
    type: u4
  - id: lods
    type: lod
    repeat: expr
    repeat-expr: lod_count

types:
  lod:
    seq:
      - id: sfn_len
        type: u4
      - id: source_filename
        type: str
        size: sfn_len
      - id: max_distance
        type: f4
      - id: bone_count
        type: u4
      - id: bones
        type: bone
        repeat: expr
        repeat-expr: bone_count
        
  bone:
    seq:
      - id: nl
        type: u4
      - id: name
        type: str
        size: nl
      - id: pl
        type: u4
      - id: parent
        type: str
        size: pl
      - id: abs_placement_matrix
        type: f4
        repeat: expr
        repeat-expr: 12
      - id: relative_placement
        type: qvect
      - id: offset_length
        type: f4
      - id: bone_length
        type: f4

  qvect:
    seq:
      - id: pos
        type: vector3f
      - id: rot
        type: quaternion

  vector3f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
        
  quaternion:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
      - id: w
        type: f4
