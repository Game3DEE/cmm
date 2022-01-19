meta:
  id: vivisector_cmf
  file-extension: cmf
  encoding: utf8
  endian: le

seq:
  - id: magic
    contents: "UBFC"
  - id: zero1
    type: u4
  - id: blocks
    type: block
    repeat: eos
    
types:
  block:
    seq:
      - id: id
        type: u4
        enum: block_id
      - id: size
        type: u4
      - id: data
        size: size
        type:
          switch-on: id
          cases:
            block_id::vertices: vert_block
            block_id::faces: faces_block
            block_id::header: header_block
            block_id::texture_count: u4
            block_id::face_count: u4
            block_id::vert_count: u4
            block_id::textures: textures_block
            block_id::uv1: uv_block
            block_id::uv2: uv_block
            block_id::object_name: strz
            block_id::alt_faces: faces_block
            block_id::floats: floats_block

  floats_block:
    seq:
      - id: vertices
        type: vector3f
        repeat: eos

  header_block:
    seq:
      - id: val1
        type: u4
      - id: val2
        type: u4
      - id: val3
        type: u4
      - id: val4
        type: u4
      - id: float1
        type: f4
      - id: val6
        type: u4
      - id: val7
        type: u4
      - id: val8
        type: u4
      - id: val9
        type: u4
      - id: val10
        type: u4
      - id: val11
        type: u4
        
  textures_block:
    seq:
      - id: textures
        type: strz
        size: 128
        repeat: eos

  vert_block:
    seq:
      - id: vertices
        type: vector3f
        repeat: eos
        
  faces_block:
    seq:
      - id: faces
        type: face
        repeat: eos

  face:
    seq:
      - id: a
        type: u4
      - id: b
        type: u4
      - id: c
        type: u4
      - id: d
        type: u4

  uv_block:
    seq:
      - id: uvs
        type: uv
        repeat: eos

  uv:
    seq:
      - id: a_u
        type: f4
      - id: b_u
        type: f4
      - id: c_u
        type: f4
      - id: d_u
        type: f4
      - id: a_v
        type: f4
      - id: b_v
        type: f4
      - id: c_v
        type: f4
      - id: d_v
        type: f4

  vector3f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4

enums:
  block_id:
    0x0002: texture_count
    0x0003: textures
    0xf001: header
    0x2011: face_count
    0x2012: vert_count
    0x2013: faces
    0x2020: uv1
    0x2021: uv2
    0x2023: vertices
    0x2033: floats
    0x2034: alt_faces
    0xf011: object_name
