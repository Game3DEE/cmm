meta:
  id: quickdraw3d_3dmf
  title: Quickdraw3D 3DMF model format
  file-extension: 3dmf
  endian: be
  encoding: utf8

# currently only version 1.5 / 1.6 are supported
# based on https://github.com/jorio/Pomme/blob/master/src/QD3D/3DMFParser.cpp

seq:
  - id: magic
    contents: "3DMF"
  - id: header_length
    contents: [ 0, 0, 0, 16 ]
  - id: version_major
    type: u2
  - id: version_minor
    type: u2
  - id: flags
    contents: [ 0,0,0,0 ]
    doc: Database or Stream types aren't supported
  - id: toc_offset
    type: u8
  - id: chunks
    type: chunk
    repeat: eos
instances:
  toc:
    if: toc_offset != 0
    pos: toc_offset
    type: toc


types:
  chunk:
    seq:
      - id: type
        type: str
        size: 4
      - id: size
        type: u4
      - id: data
        size: size
        type:
          switch-on: type
          cases:
            '"cntr"': chunk_list
            '"bgng"': chunk_list
            '"tmsh"': trimesh_data
            '"atar"': atar_data
            '"kdif"': color3f # diffuse color
            '"kxpr"': color3f # transparency color
            '"rfrn"': u4 # target (index in toc?)
            '"shdr"': shdr_data
            '"txmm"': txmm_data
            '"txpm"': txpm_data

  chunk_list:
    seq:
      - id: chunks
        type: chunk
        repeat: eos

  txpm_data:
    seq:
      - id: width
        type: u4
      - id: height
        type: u4
      - id: row_bytes
        type: u4
      - id: pixel_size
        type: u4
      - id: pixel_type
        type: u4
        enum: pixel_type
      - id: bit_order
        type: u4
      - id: byte_order
        type: u4


  txmm_data:
    seq:
      - id: use_mipmapping
        type: u4
      - id: pixel_type
        type: u4
        enum: pixel_type
      - id: bit_order
        type: u4
      - id: byte_order
        type: u4
      - id: width
        type: u4
      - id: height
        type: u4
      - id: row_bytes
        type: u4

  shdr_data:
    seq:
      - id: boundary_u
        type: u4
      - id: boundary_v
        type: u4

  trimesh_data:
    seq:
      - id: triangle_count
        type: u4
      - id: triangle_attribute_count
        type: u4
      - id: edge_count
        type: u4
      - id: edge_attribute_count
        type: u4
      - id: vertex_count
        type: u4
      - id: vertex_attribute_count
        type: u4
      - id: triangles
        type:
          switch-on: index_size
          cases:
            1: u1
            2: u2
        repeat: expr
        repeat-expr: triangle_count * 3
      - id: vertices
        type: vector3f
        repeat: expr
        repeat-expr: vertex_count
      - id: bbox_min
        type: vector3f
      - id: bbox_max
        type: vector3f
    instances:
      index_size:
        value: vertex_count > 0xff ? 2 : 1

  atar_data:
    seq:
      - id: attribute_type
        type: u4
        enum: attribute_type
      - id: zero
        contents: [ 0,0,0,0 ]
      - id: position_of_array
        type: u4
      - id: position_in_array
        type: u4
      - id: attribute_use_flag
        type: u4
      - id: values
        type:
          switch-on: attribute_type
          cases:
            attribute_type::surface_uv: vector2f
            attribute_type::shading_uv: vector2f
            attribute_type::normal: vector3f
            attribute_type::ambient_coefficient: f4
            attribute_type::diffuse_color: color4f
            attribute_type::specular_color: color4f
            attribute_type::specular_control: f4
            attribute_type::transparency_color: vector3f
            attribute_type::surface_tangent: tangent2v
            attribute_type::highlight_state: u4 # actually a boolean 1/0
            attribute_type::surface_shader: u4 # TQ3SurfaceShaderObject
        #repeat: eos

  toc:
    seq:
      - id: toc_magic
        contents: "toc "
      - id: toc_size
        type: u4
      - id: next_toc
        type: u8
      - id: ref_seed
        type: u4
      - id: type_seed
        type: u4
      - id: toc_entry_type
        contents: [ 0,0,0,1 ]
        doc: only QD3D 1.5 3DMF TOCs are recognized
      - id: toc_entry_size
        contents: [ 0,0,0, 16 ]
      - id: entry_count
        type: u4
      - id: entries
        type: toc_entry
        repeat: expr
        repeat-expr: entry_count
        
  toc_entry:
    seq:
      - id: ref_id
        type: u4
      - id: obj_location
        type: u8
      - id: type
        type: str
        size: 4

  tangent2v:
    seq:
      - id: u_tangent
        type: vector3f
      - id: v_tangent
        type: vector3f

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

  color3f:
    seq:
      - id: r
        type: f4
      - id: g
        type: f4
      - id: b
        type: f4
        
  color4f:
    seq:
      - id: r
        type: f4
      - id: g
        type: f4
      - id: b
        type: f4
      - id: a
        type: f4

enums:
  pixel_type:
    0: rgb32 # 8 bits for red, green, and blue. High-order byte ignored.
    1: argb32 # 8 bits for alpha, red, green, and blue.
    2: rgb16 # 5 bits for red, green, and blue. High-order bit ignored.
    3: argb16 # 1 bit for alpha. 5 bits for red, green, and blue.
    4: rgb16_565 # 5 bits for red, 6 bits for green, 5 bits for blue.
    5: rgb24 # 8 bits for red, green, and blue. No alpha byte.
    200: unknown
  
  attribute_type:
    0: none
    1: surface_uv
    2: shading_uv
    3: normal
    4: ambient_coefficient
    5: diffuse_color
    6: specular_color
    7: specular_control
    8: transparency_color
    9: surface_tangent
    10: highlight_state
    11: surface_shader
