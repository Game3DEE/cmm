meta:
  id: serious1_ba
  file-extension: ba
  endian: le
  encoding: utf8

seq:
  - id: magic
    contents: "ANIM"
  - id: version
    type: u4
  - id: anim_count
    type: u4
  - id: animations
    type: animation
    repeat: expr
    repeat-expr: anim_count

types:
  animation:
    seq:
      - id: sfnl
        type: u4
      - id: source_filename
        type: str
        size: sfnl
      - id: nl
        type: u4
      - id: name
        type: str
        size: nl
      - id: sec_per_frame
        type: f4
      - id: frame_count
        type: u4
      - id: threshold
        type: f4
      - id: is_compressed
        type: u4
      - id: has_custom_speed
        type: u4
      - id: bone_envelope_count
        type: u4
      - id: bone_envelopes
        type: bone_envelope
        repeat: expr
        repeat-expr: bone_envelope_count
      - id: morph_envelope_count
        type: u4
      - id: morph_envelopes
        type: morph_envelope
        repeat: expr
        repeat-expr: morph_envelope_count
  
  morph_envelope:
    seq:
      - id: nl
        type: u4
      - id: name
        type: str
        size: nl
      - id: factor_count
        type: u4
      - id: factors
        type: f4
        repeat: expr
        repeat-expr: factor_count
  
  bone_envelope:
    seq:
      - id: nl
        type: u4
      - id: name
        type: str
        size: nl
      - id: default_pos
        type: f4
        repeat: expr
        repeat-expr: 12
      - id: position_count
        type: u4
      - id: positions
        type: anim_position
        repeat: expr
        repeat-expr: position_count
      - id: rotation_count
        type: u4
      - id: rotations
        type: anim_rotation
        repeat: expr
        repeat-expr: rotation_count
      - id: offset_len
        type: f4

  anim_rotation:
    seq:
      - id: frame_number
        type: u2
      - size: 2
      - id: bone_rotation
        type: quaternion

  anim_position:
    seq:
      - id: frame_number
        type: u2
      - size: 2
      - id: bone_position
        type: vector3f

  vector3f:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4

  quaternion:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
      - id: w
        type: f4
      
  