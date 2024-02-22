meta:
  id: chasm_cel
  file-extension: chasm_cel
  endian: le
  encoding: utf8

seq:
  - id: magic
    contents: [ 0x19, 0x91 ]
  - id: width
    type: u2
  - id: height
    type: u2
  - id: unk1
    type: u2
  - id: unk2
    type: u2
  - id: unk3
    type: u2
  - id: unk4
    type: u2
  - id: unk5
    type: u2
  - id: padding
    size: 16
  - id: palette
    type: rgb
    repeat: expr
    repeat-expr: 256
  - id: data
    size: width * height

types:
  rgb:
    seq:
      - id: r
        type: u1
      - id: g
        type: u1
      - id: b
        type: u1
