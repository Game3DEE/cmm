meta:
  id: serious1_mdl
  file-extension: mdl
  encoding: utf8
  endian: le

seq:
  - id: magic
    contents: "MDAT"
  - id: version
    contents: "V010"
  - id: flags
    type: u4
  - id: ivtx_sig
    contents: "IVTX"
  - id: ivtx_size
    contents: [ 4,0,0,0 ]
  - id: vertex_count
    type: u4
  - id: ifrm_sig
    contents: "IFRM"
  - id: ifrm_size
    contents: [ 4,0,0,0 ]
  - id: frame_count
    type: u4
  - id: vertex_block
    type:
      switch-on: compressed_16_bit
      cases:
        true: av17_block
        false: avfx_block
  - id: afin_sig
    contents: "AFIN"
  - id: afin_size
    type: u4
  - id: frame_info
    type: bounding_box
    repeat: expr
    repeat-expr: frame_count
  - id: ammv_sig
    contents: 'AMMV'
  - id: ammv_size
    type: u4
  - id: main_mip_vertices
    type: vector3f
    repeat: expr
    repeat-expr: vertex_count
  - id: avmk_sig
    contents: "AVMK"
  - id: avmk_size
    type: u4
  - id: vertex_mip_mask
    type: u4
    repeat: expr
    repeat-expr: vertex_count
  - id: imip_sig
    contents: "IMIP"
  - id: imip_size
    contents: [ 4,0,0,0 ]
  - id: mip_count
    type: u4
  - id: fmip_sig
    contents: "FMIP"
  - id: fmip_size
    type: u4
  - id: mip_factors
    type: f4
    repeat: expr
    repeat-expr: max_mips
  - id: mip_info
    type: model_mip_info
    repeat: expr
    repeat-expr: mip_count
  - id: ptc2_sig
    contents: "PTC2"
  - id: patches
    type: model_patch
    repeat: expr
    repeat-expr: max_patches
  - id: stxw_sig
    contents: "STXW"
  - id: stxw_size
    contents: [ 4,0,0,0 ]
  - id: texture_width
    type: u4
  - id: stxh_sig
    contents: "STXH"
  - id: stxh_size
    contents: [ 4,0,0,0 ]
  - id: texture_height
    type: u4
  - id: shadow_quality
    type: u4
  - id: stretch
    type: vector3f
  - id: center
    type: vector3f
  - id: collision_box_count
    type: u4
  - id: collision_boxes
    type: collision_box
    repeat: expr
    repeat-expr: collision_box_count
  - id: coli_sig
    contents: "COLI"
  - id: collision_type
    type: u4
  - id: attached_position_count
    type: u4
  - id: attached_positions
    type: attached_position
    repeat: expr
    repeat-expr: attached_position_count
  - id: icln_sig
    contents: "ICLN"
  - id: icln_size
    contents: [ 4,0,0,0 ]
  - id: named_color_count
    type: u4
  - id: named_colors
    type: named_color
    repeat: expr
    repeat-expr: named_color_count
  - id: adat_sig
    contents: "ADAT"
  - id: animation_count
    type: u4
  - id: animations
    type: animation
    repeat: expr
    repeat-expr: animation_count
  - id: diffuse
    type: u4
  - id: reflections
    type: u4
  - id: specular
    type: u4
  - id: bump
    type: u4
instances:
  compressed_16_bit:
    value: (flags & (1 << 4)) != 0
  max_mips:
    value: 32
  max_patches:
    value: 32

types:
  animation:
    seq:
      - id: name
        type: strz
        size: 32
      - id: secs_per_frame
        type: f4
      - id: frame_count
        type: u4
      - id: frame_indices
        type: u4
        repeat: expr
        repeat-expr: frame_count

  named_color:
    seq:
      - id: index
        type: u4
      - id: name_len
        type: u4
      - id: name
        type: str
        size: name_len

  attached_position:
    seq:
      - id: center_vertex
        type: u4
      - id: front_vertex
        type: u4
      - id: up_vertex
        type: u4
      - id: relative_placement
        type: placement

  placement:
    seq:
      - id: position
        type: vector3f
      - id: angle
        type: vector3f

  collision_box:
    seq:
      - id: collision_box
        type: bounding_box
      - id: name_len
        type: u4
      - id: name
        type: str
        size: name_len

  model_patch:
    seq:
      - id: name_len
        type: u4
      - id: name
        type: str
        size: name_len
      - id: dfnm_sig
        contents: "DFNM"
      - id: filename_len
        type: u4
      - id: filename
        type: str
        size: filename_len
      - id: position
        type: vector2l
      - id: stretch
        type: f4
        
  model_mip_info:
    seq:
      - id: ipol_sig
        contents: "IPOL"
      - id: ipol_size
        contents: [ 4,0,0,0 ]
      - id: polygon_count
        type: u4
      - id: polygons
        type: model_polygon
        repeat: expr
        repeat-expr: polygon_count
      - id: texture_vertex_count
        type: u4
      - id: txv2_sig
        contents: "TXV2"
      - id: txv2_size
        type: u4
      - id: texture_vertices
        type: texture_vertex
        repeat: expr
        repeat-expr: texture_vertex_count
      - id: mapping_surface_count
        type: u4
      - id: mapping_surfaces
        type: mapping_surface
        repeat: expr
        repeat-expr: mapping_surface_count
      - id: flags
        type: u4
      - id: patch_count
        type: u4
      - id: patches
        type: polygon_patch
        repeat: expr
        repeat-expr: patch_count
        
  polygon_patch:
    seq:
      - id: occupied_count
        type: u4
      - id: ocpl_sig
        contents: "OCPL"
        if: occupied_count > 0
      - id: ocpl_size
        type: u4
        if: occupied_count > 0
      - id: occupied
        type: u4
        repeat: expr
        repeat-expr: occupied_count

  mapping_surface:
    seq:
      - id: name_len
        type: u4
      - id: name
        type: str
        size: name_len
      - id: surface_2d_offset
        type: vector3f
      - id: hpb
        type: vector3f
      - id: zoom
        type: f4
      - id: surface_shading_type
        type: u4
      - id: surface_translucency_type
        type: u4
      - id: render_flags
        type: u4
      - id: polygon_count
        type: u4
      - id: polygons
        type: u4
        repeat: expr
        repeat-expr: polygon_count
      - id: texture_vertex_count
        type: u4
      - id: texture_vertices
        type: u4
        repeat: expr
        repeat-expr: texture_vertex_count
      - id: color
        type: u4
      - id: diffuse
        type: u4
      - id: reflections
        type: u4
      - id: specular
        type: u4
      - id: bump
        type: u4
      - id: on
        type: u4
      - id: off
        type: u4

  texture_vertex:
    seq:
      - id: uvw
        type: vector3f
      - id: uv
        type: vector2l
      - id: flags
        type: u4
      - id: transformed_vertex
        type: u4
      - id: vu
        type: vector3f
      - id: vv
        type: vector3f

  model_polygon:
    seq:
      - id: mdp2_sig
        contents: "MDP2"
      - id: vertex_count    # XXX this should have been size of chunk!!
        type: u4
      - id: vertices
        type: model_polygon_vertex
        repeat: expr
        repeat-expr: vertex_count
      - id: render_flags
        type: u4
      - id: color_and_alpha
        type: u4
      - id: surface
        type: s4
        
  model_polygon_vertex:
    seq:
      - id: transformed_vertex
        type: s4
      - id: texture_vertex
        type: s4
      

  av17_block:
    seq:
      - id: sig
        contents: "AV17"
      - id: size
        type: u4
      - id: vertices
        type: vertex16
        repeat: expr
        repeat-expr: size / 8

  avfx_block:
    seq:
      - id: sig
        contents: "AFVX"
      - id: size
        type: u4
      - id: vertices
        type: vertex8
        repeat: expr
        repeat-expr: size / 4

  vertex8:
    seq:
      - id: x
        type: s1
      - id: y
        type: s1
      - id: z
        type: s1
      - id: normal_index
        type: u1

  vertex16:
    seq:
      - id: x
        type: s2
      - id: y
        type: s2
      - id: z
        type: s2
      - id: normal_h
        type: u1
      - id: normal_b
        type: u1

  bounding_box:
    seq:
      - id: min
        type: vector3f
      - id: max
        type: vector3f

  vector2l:
    seq:
      - id: x
        type: s4
      - id: y
        type: s4

  vector3f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
