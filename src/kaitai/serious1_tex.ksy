meta:
  id: serious1_tex
  file-extension: serious1_tex
  endian: le
  encoding: utf8
  
seq:
  - id: tver_sig
    contents: "TVER"
  - id: version
    type: u4
  - id: tdat_sig
    contents: "TDAT"
  - id: flags
    type: u4
  - id: mex_width
    type: u4
  - id: mex_height
    type: u4
  - id: fine_mips_levels
    type: u4
  - id: first_mips_level
    type: u4
  - id: frame_count
    type: u4
  - id: frms_sig
    contents: "FRMS"
  - id: frames
    type: frame(_index)
    repeat: expr
    repeat-expr: frame_count
instances:
  width:
    value: mex_width >> first_mips_level
  height:
    value: mex_height >> first_mips_level
  bytes_per_pixel:
    value: has_alpha_channel ? 4 : 3
  has_alpha_channel:
    value: ((flags & (1 << 0)) != 0)
  is_32bit:
    value: ((flags & (1 << 1)) != 0)
  is_static:
    value: ((flags & (1 << 5)) != 0)
  is_constant:
    value: ((flags & (1 << 6)) != 0)
  is_transparent:
    value: ((flags & (1 << 7)) != 0)
  is_equalized:
    value: ((flags & (1 << 8)) != 0)
  is_greyscale:
    value: ((flags & (1 << 9)) != 0)
  is_white:
    value: ((flags & (1 << 10)) != 0)
  keep_color:
    value: ((flags & (1 << 11)) != 0)
  is_single_mipmap:
    value: ((flags & (1 << 18)) != 0)
  is_probed:
    value: ((flags & (1 << 19)) != 0)
    
#define TEX_DISPOSED     (1UL<<20)  // largest mip-map(s) has been left-out
#define TEX_DITHERED     (1UL<<21)  // dithering has been applied on this texture
#define TEX_FILTERED     (1UL<<22)  // flitering has been applied on this texture
#define TEX_SATURATED    (1UL<<23)  // saturation has been adjusted on this texture
#define TEX_COLORIZED    (1UL<<24)  // mipmaps has been colorized on this texture
#define TEX_WASOLD       (1UL<<30)  // loaded from old format (version 3)

types:
  frame:
    params:
      - id: index
        type: u4
    seq:
      - id: pixels
        size: width * height * _root.bytes_per_pixel
    instances:
      width:
        value: _root.width >> index
      height:
        value: _root.height >> index
