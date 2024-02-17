meta:
  id: sunstorm_stx
  title: SunStorm Texture format
  application: Deer Hunter 3 and many other SunStorm games
  file-extension: tex
  endian: le
  encoding: utf8

seq:
  - contents: "STEX"
  - id: val1
    type: u4
  - id: val2
    type: u4
  - id: val3
    type: u4
  - id: width
    type: u4
  - id: height
    type: u4
  - id: num_mipmaps
    type: u4
  - id: val4
    type: u4
  - id: num_metadata
    type: u4
  - id: num_uv_sets
    type: u4
    
  - contents: "STEX"
    if: val4 != 0
    
  - id: metadata
    type: metadata
    repeat: expr
    repeat-expr: num_metadata

  - id: uv_sets
    type: uv_set
    repeat: expr
    repeat-expr: num_uv_sets

  - id: format_len
    type: u2
  - id: format
    type: str
    size: format_len

  - id: pix_width
    type: u4
  - id: pix_height
    type: u4
  - id: pix_rgb_bitdepth
    type: u4
  - id: pix_alpha_bitdepth
    type: u4
  - id: pix_bytes_per_pixel
    type: u4
  - id: pix_num_mipmaps
    type: u4
  - id: pix_val1
    type: u4
  - id: pix__red_bits
    type: u4
  - id: pix_green_bits
    type: u4
  - id: pix_blue_bits
    type: u4
  - id: pix_alpha_bits
    type: u4
  - id: pix_red_shift
    type: u4
  - id: pix_green_shift
    type: u4
  - id: pix_blue_shift
    type: u4
  - id: pix_alpha_shift
    type: u4
  - id: pix_red_mask
    type: u4
  - id: pix_green_mask
    type: u4
  - id: pix_blue_mask
    type: u4
  - id: pix_alpha_mask
    type: u4
  - id: pix_pixel_mask
    type: u4
  - id: pix_val15
    type: u4
  - id: pix_val16
    type: u4

  - id: palette
    size: 256 * 4
    doc: RGBA

  - id: num_mipmap_metadata
    type: u2

  - id: mipmap_metadata
    type: metadata
    repeat: expr
    repeat-expr: num_mipmap_metadata

    
  - id: mipmaps
    type: mipmap
    repeat: expr
    repeat-expr: num_mipmaps

types:
  metadata:
    seq:
      - id: key_len
        type: u2
      - id: key
        type: str
        size: key_len
      - id: value_len
        type: u2
      - id: value
        type: str
        size: value_len

  uv_set:
    seq:
    - id: unknown
      type: u2
    - id: num_uv_pairs
      type: u2
    - id: num_metadata
      type: u2
    - id: uvs
      type: f4
      repeat: expr
      repeat-expr: num_uv_pairs * 2
    - id: metadata
      type: metadata
      repeat: expr
      repeat-expr: num_metadata

  mipmap:
    seq:
      - id: width
        type: u4
      - id: height
        type: u4
      - id: val1
        type: u4
      - id: val2
        type: u4
      - id: val3
        type: u4
      - id: val4
        type: u4
      - id: val5
        type: u4
      - id: offset_rgb
        type: u4
      - id: offset_alpha
        type: u4
    instances:
      rgb:
        pos: offset_rgb
        size: 3 * width * height
        if: offset_rgb != 0xffffffff
      alpha:
        pos: offset_alpha
        size: width * height
        if: offset_alpha != 0xffffffff
