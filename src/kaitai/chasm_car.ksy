meta:
  id: chasm_car
  title: Chasm: The Rift character model format
  file-extension: car
  endian: le
  encoding: utf8

seq:
  - id: animation_sizes
    type: u2
    repeat: expr
    repeat-expr: max_anim_count
  - id: submodels_animations
    type: u2
    repeat: expr
    repeat-expr: 3 * 2 # 3 submodels, 2 animations per submodel
  - id: unknown0
    type: u2
    repeat: expr
    repeat-expr: 9
  - id: sound_sizes
    type: u2
    repeat: expr
    repeat-expr: max_sounds
  - id: unknown1
    type: u2
    repeat: expr
    repeat-expr: 9

  - id: polygons
    type: polygon
    repeat: expr
    repeat-expr: max_poly_count
  - id: vertices
    type: vector3i
    repeat: expr
    repeat-expr: max_vertex_count

  - id: padding
    size: 4

  - id: vertex_count
    type: u2
  - id: poly_count
    type: u2
  - id: texel_count
    type: u2
  - id: texture
    size: texel_count

  - id: animations
    type: animation(vertex_count)
    size: animation_sizes[_index]
    repeat: expr
    repeat-expr: max_anim_count

  - id: submodel
    type: submodel(_index)
    repeat: expr
    repeat-expr: max_sub_models

  - id: sounds
    size: sound_sizes[_index]
    repeat: expr
    repeat-expr: max_sounds
    doc: Sound is 8bit, 11025Hz, mono

# Submodel data

instances:
  texture_height:
    value: texel_count / 64
  max_anim_count:
    value: 20
  max_poly_count:
    value: 400
  max_vertex_count:
    value: 938
  max_sub_models:
    value: 3
  max_sounds:
    value: 7

types:
  submodel:
    params:
      - id: index
        type: u2
    seq:
      - id: polygons
        type: polygon
        repeat: expr
        repeat-expr: 576
        if: animation_size > 0
      - id: vertex_count
        type: u2
        if: animation_size > 0
      - id: polygon_count
        type: u2
        if: animation_size > 0
      - id: some_count
        type: u2
        if: animation_size > 0
      - id: animations
        type: animation(vertex_count)
        size: animation_size
        if: animation_size > 0
    instances:
      animation_size:
        value: _root.submodels_animations[index * 2 + 0] + _root.submodels_animations[index * 2 + 1]


  animation:
    params:
      - id: vertex_count
        type: u2
    seq:
      - id: frames
        type: frame(vertex_count)
        repeat: eos
        
  frame:
    params:
      - id: vertex_count
        type: u2
    seq:
      - id: vertices
        type: vector3i
        repeat: expr
        repeat-expr: vertex_count

  polygon:
    seq:
      - id: indices
        type: u2
        repeat: expr
        repeat-expr: 4
      - id: uvs
        type: vector2i
        repeat: expr
        repeat-expr: 4
      - id: unknown_1
        size: 4
      - id: bone
        type: u1
      - id: flags
        type: u1
      - id: v_offset
        type: u2

  vector3i:
    seq:
      - id: x
        type: s2
      - id: y
        type: s2
      - id: z
        type: s2

  vector2i:
    seq:
      - id: x
        type: s2
      - id: y
        type: s2
