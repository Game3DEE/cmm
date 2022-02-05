meta:
  id: vivisector_trk
  file-extension: vivisector_trk
  encoding: ascii
  endian: le
  
seq:
  - id: bone_count
    type: u4
  - id: frame_max
    type: u4
  - id: val3
    type: u4
  - id: fps
    type: u4
  - id: bones
    type: bone
    repeat: expr
    repeat-expr: bone_count

types:
  bone:
    seq:
    - id: name
      type: strz
      size: 32
    - id: count
      type: u4
    - id: blocks
      type: block
      repeat: expr
      repeat-expr: count
  
  block:
    seq:
      - id: frame_index
        type: u4
      - id: val2
        type: u4
      - id: val3
        type: u4
      - id: translate
        type: vector3f
      - id: rotate
        type: vector3f
      - id: scale
        type: vector3f

  vector3f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
