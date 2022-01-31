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
            block_id::bone_count: u4
            block_id::face_count: u4
            block_id::vert_count: u4
            block_id::something_count: u4
            block_id::textures: textures_block
            block_id::uv1: uv_block
            block_id::uv2: uv_block
            block_id::bone_names: bone_names_block
            block_id::bone_positions: bone_positions_block
            block_id::bone_parents: bone_parents_block
            block_id::bone_transforms: bone_transforms_block
            block_id::alt_faces: faces_block
            block_id::something_unkn_attr3_v3f: something_unkn_attr3_v3f_block
            block_id::face_materials: face_materials_block
            block_id::vertex_bones: vertex_bones_block

  face_materials_block:
    seq:
      - id: indices
        type: u4
        doc: Maps every face to a material (texture)
        repeat: eos # matches number of faces

  something_unkn_attr3_v3f_block:
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

  vertex_bones_block:
    seq:
      - id: bone_indices
        type: u2
        doc: Maps every vertex to a bone
        repeat: eos # matches number of vertices
  
  bone_names_block:
    seq:
      - id: bone_names
        type: strz
        size: 32
        repeat: eos # matches number of bones

  bone_positions_block:
    seq:
      - id: bone_positions
        type: vector3f
        repeat: eos # matches number of bones

  bone_parents_block:
    seq:
      - id: bone_parents
        type: s2
        repeat: eos # matches number of bones

  bone_transforms_block:
    seq:
      - id: bone_transforms
        type: matrix3x3f
        repeat: eos # matches number of bones

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

  matrix3x3f:
    seq:
      - id: elements
        type: f4
        repeat: expr
        repeat-expr: 9

enums:
  block_id:
    0x0002: texture_count
    0x0003: textures
    0xf001: header
    0x2011: face_count
    0x2012: vert_count
    0xf010: bone_count
    0x2013: faces
    0x2017: face_unkn_attr1_u4
    0x201a: face_unkn_attr6_u4
    0x201c: face_materials
    0x201d: face_unkn_attr2_u4
    0x2020: uv1
    0x2021: uv2
    0x2023: vertices
    0x2030: something_count
    0x2031: something_unkn_attr1_2x_u4
    0x2032: something_unkn_attr2_2x_u4
    0x2033: something_unkn_attr3_v3f
    0x2034: alt_faces
    0xf011: bone_names
    0xf012: bone_positions
    0xf013: bone_unkn_attr1_u2
    0xf014: bone_parents
    0xf015: bone_transforms
    0xf021: face_unkn_attr3_u4
    0xf022: face_unkn_attr4_u1
    0xf023: face_unkn_attr5_u2
    0xf030: vertex_bones
    0xf031: vertex_unkn_attr1_u2