meta:
  id: prism3d_pmd
  title: Prism3D Modal format
  file-extension: pmd
  endian: le
  encoding: utf8

seq:
  - id: version
    type: u4

  - id: object_count
    type: u4

  - id: object_headers
    type: object_header
    repeat: expr
    repeat-expr: max_objects

  - id: morph_target_count
    type: u4
  - id: animation_count
    type: u4

  - id: bbox_min
    type: vector3f
  - id: bbox_max
    type: vector3f
  - id: scale
    type: vector3f

  - id: zeroes
    size: 192

  - id: animation_headers
    type: animation_header
    repeat: expr
    repeat-expr: max_animations

  - id: objects
    type: obj(_index)
    repeat: expr
    repeat-expr: object_count

  - id: animations
    type: animation(_index)
    repeat: expr
    repeat-expr: animation_count

instances:
  max_objects:
    value: 16
  max_animations:
    value: 64

types:
  animation_header:
    seq:
      - id: frame_count
        type: u4
      - id: fps
        type: f4
      - id: duration
        type: f4
      - id: name
        type: strz
        size: 32
      - id: val1
        type: u4
      - id: val2
        type: u4

  obj:
    params:
      - id: index
        type: u4
    seq:
      - id: indices
        type: u2
        repeat: expr
        repeat-expr: index_count
      - id: vertices
        type: vector3i
        repeat: expr
        repeat-expr: vertex_count * _root.morph_target_count
      - id: uvs
        type: vector2f
        repeat: expr
        repeat-expr: vertex_count
    instances:
      index_count:
        value: _root.object_headers[index].triangle_count * 3
      vertex_count:
        value: _root.object_headers[index].vertex_count

  object_header:
    seq:
      - id: name
        type: strz
        size: 16
      - id: triangle_count
        type: u4
      - id: vertex_count
        type: u4
      - id: val1
        type: u4

  animation:
    params:
      - id: index
        type: u4
    seq:
      - id: indices
        type: u4
        repeat: expr
        repeat-expr: frame_count
      - id: weights
        type: f4
        repeat: expr
        repeat-expr: frame_count
    instances:
      frame_count:
        value: _root.animation_headers[index].frame_count

  vector3i:
    seq:
      - id: x
        type: s2
      - id: y
        type: s2
      - id: z
        type: s2
      - id: index
        type: u1

  vector3f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4

  vector2f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
