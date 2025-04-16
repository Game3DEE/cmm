meta:
  id: orion_msh1
  file-extension: msh
  endian: le
  encoding: utf8

seq:
  - id: version
    type: u4
  - contents: [ "Orion engine v1", 0]
  - id: val1
    type: u4
  - id: num_triangles
    type: u4
  - id: num_vertices
    type: u4
  - id: val4
    type: u4
  - id: val5
    type: u4
  - id: val6
    type: u4
  - id: val7
    type: u4
  - id: val8
    type: u4
  - id: val9
    type: u4
    
  - id: vec1
    type: vector3f
  - id: vec2
    type: vector3f
  - id: vec3
    type: vector3f
  - id: vec4
    type: vector3f
    
  - id: vertices
    type: vector3f
    repeat: expr
    repeat-expr: num_vertices
    
  - id: normals
    type: vector3f
    repeat: expr
    repeat-expr: num_vertices
    
  - id: indices
    type: u2
    repeat: expr
    repeat-expr: num_triangles * 3
    
  - id: uv
    type: f4
    repeat: expr
    repeat-expr: 2 * num_vertices
    
  - id: vecs1
    type: vector3f
    repeat: expr
    repeat-expr: num_vertices
    
  - id: vecs2
    type: vector3f
    repeat: expr
    repeat-expr: num_vertices
    
  - id: val8_data
    size: 16
    repeat: expr
    repeat-expr: val8
  - id: val9_vecs
    type: vector3f
    repeat: expr
    repeat-expr: val9

  - id: some_count
    type: u4
    
    # val5 loop
  - id: some_data
    size: some_count

types:
  vector3f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4

  entry:
    seq:
      - id: data1
        size: 16
        repeat: expr
        repeat-expr: _root.val8
      - id: vecs
        type: vector3f
        repeat: expr
        repeat-expr: _root.val9
      - id: data_size
        type: u4
      - id: val5_data
        type: val5_data(data_size)

  val5_data:
    params:
      - id: data_size
        type: u4
    seq:
      - id: data
        size: data_size
