meta:
  id: chasm_3o
  title: Chasm The Rift static model format
  file-extension: 3o
  endian: le
  encoding: utf8

# https://moddingwiki.shikadi.net/wiki/3O_Format

params:
  - id: max_poly_count
    type: u4
seq:
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
  - id: skin_height
    type: u2
  - id: skin
    size: skin_height * 64
    
instances:
  max_vertex_count:
    value: 938

types:
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
      - id: unknown_2
        type: u1
      - id: flags
        type: u1
      - id: v_offset
        type: s2

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
        
