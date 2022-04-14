meta:
  id: prism3d_pmg
  title: SCCS Prism3D model format
  file-extension: pmg
  endian: le
  encoding: utf8

seq:
  - id: version
    type: u1
  - id: magic
    contents: "gmP"
    
  - id: object_count
    type: u4
  - id: count_1
    type: u4
  - id: count_2
    type: u4
  - id: count_3
    type: u4

  - id: center
    type: vector3f
  - id: radius
    type: f4
  - id: floats
    type: f4
    repeat: expr
    repeat-expr: 6
    if: _root.version > 16

  - id: data_offset_1 # unknown_data_1
    type: u4
  - id: data_offset_2
    type: u4
  - id: data_offset_3
    type: u4
  - id: data_offset_4
    type: u4
  - id: data_offset_5
    type: u4
  - id: data_size_1
    type: u4
  - id: data_offset_7
    type: u4
  - id: data_size_2
    type: u4
  - id: data_offset_9
    type: u4
  - id: data_offset_10
    type: u4
  - id: data_offset_11
    type: u4
  - id: data_size_3
    type: u4
  - id: data_offset_13
    type: u4
  - id: data_size_4
    type: u4

  - id: unknown_data_1
    type: u4
    repeat: expr
    repeat-expr: count_1 * 6

  - id: unknown_data_2
    type: unknown_2
    repeat: expr
    repeat-expr: count_3
instances:
  objects:
    pos: data_offset_3
    type: obj
    repeat: expr
    repeat-expr: object_count

types:
  obj:
    seq:
      - id: index_count
        type: u4
      - id: vertex_count
        type: u4
      - id: val1
        type: u4
      - id: index
        type: u4

      - id: center
        type: vector3f
      - id: radius
        type: f4
      - id: floats
        type: f4
        repeat: expr
        repeat-expr: 6
        if: _root.version > 16

      - id: vertex_data_offset
        type: s4
      - id: normal_data_offset
        type: s4
      - id: uv_data_offset
        type: s4
      - id: colors_data_offset
        type: s4
      - id: data_offset_1
        type: s4
      - id: data_offset_2
        type: s4
      - id: index_data_offset
        type: s4
      - id: data_offset_3
        type: s4
      - id: data_offset_4
        type: s4
      - id: data_offset_5
        type: s4
    instances:
      vertices:
        pos: vertex_data_offset
        type: vector3f
        repeat: expr
        repeat-expr: vertex_count
        if: vertex_data_offset != -1
      normals:
        pos: normal_data_offset
        type: vector3f
        repeat: expr
        repeat-expr: vertex_count
        if: normal_data_offset != -1
      uvs:
        pos: uv_data_offset
        type: vector2f
        repeat: expr
        repeat-expr: vertex_count
        if: uv_data_offset != -1
      colors:
        pos: colors_data_offset
        type: color4b
        repeat: expr
        repeat-expr: vertex_count
        if: colors_data_offset != -1
      indices:
        pos: index_data_offset
        type: u2
        repeat: expr
        repeat-expr: index_count
        if: index_data_offset != -1

  unknown_2:
    seq:
      - id: val1
        type: u4
      - id: val2
        type: u4
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
      - id: r
        type: f4
      - id: x2
        type: f4
      - id: y2
        type: f4
      - id: z2
        type: f4
      - id: r2
        type: f4

  color4b:
    seq:
      - id: r
        type: u1
      - id: g
        type: u1
      - id: b
        type: u1
      - id: a
        type: u1

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

