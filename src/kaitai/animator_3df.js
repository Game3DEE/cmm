// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct"

// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

/**
 * This version of 3DF is written out by the ActionForms Animator program
 * and used directly in the unreleased game Duke Nukem: Endangered Species.
 * Version 4 is used in the last released binary of Animator 7, but the
 * publicly available source for Animator only saves Version 6 of the format.
 * A single V6 file is found in the ActionForms game called Vivisector.
 */

  function Atmosfear3df(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Atmosfear3df.prototype._read = function() {
    this.magic = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.magic, [75, 105, 101, 118]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([75, 105, 101, 118], this.magic, this._io, "/seq/0");
    }
    this.version = this._io.readU4le();
    if (!( ((this.version == 4) || (this.version == 6)) )) {
      throw new KaitaiStream.ValidationNotAnyOfError(this.version, this._io, "/seq/1");
    }
    this.skipped = this._io.readBytes(120);
    this.numTextures = this._io.readU4le();
    this.textures = [];
    for (var i = 0; i < this.numTextures; i++) {
      this.textures.push(KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(16), 0, false), "utf8"));
    }
    this.numLods = this._io.readU4le();
    this.lods = [];
    for (var i = 0; i < this.numLods; i++) {
      this.lods.push(new Lod(this._io, this, this._root));
    }
  }

  var Lod = Atmosfear3df.Lod = (function() {
    function Lod(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Lod.prototype._read = function() {
      this.numVertices = this._io.readU4le();
      this.numFaces = this._io.readU4le();
      this.numBones = this._io.readU4le();
      this.vertices = [];
      for (var i = 0; i < this.numVertices; i++) {
        this.vertices.push(new Vertex(this._io, this, this._root));
      }
      this.faces = [];
      for (var i = 0; i < this.numFaces; i++) {
        this.faces.push(new Face(this._io, this, this._root));
      }
      this.bones = [];
      for (var i = 0; i < this.numBones; i++) {
        this.bones.push(new Bone(this._io, this, this._root));
      }
      this.textureIdPerFace = this._io.readBytes(this.numFaces);
      this.faceByTextureCounts = [];
      for (var i = 0; i < this._root.numTextures; i++) {
        this.faceByTextureCounts.push(this._io.readU4le());
      }
    }

    return Lod;
  })();

  var Vertex = Atmosfear3df.Vertex = (function() {
    function Vertex(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Vertex.prototype._read = function() {
      this.x = this._io.readF4le();
      this.y = this._io.readF4le();
      this.z = this._io.readF4le();
      this.owner = this._io.readS2le();
      this.hide = this._io.readS2le();
    }

    return Vertex;
  })();

  var Face = Atmosfear3df.Face = (function() {
    function Face(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Face.prototype._read = function() {
      this.a = this._io.readU2le();
      this.b = this._io.readU2le();
      this.c = this._io.readU2le();
      switch (this._root.version) {
      case 4:
        this.flags = this._io.readU2le();
        break;
      case 6:
        this.flags = this._io.readU4le();
        break;
      }
      if (this._root.version == 6) {
        this._unnamed4 = this._io.readU2le();
      }
      this.tax = this._io.readF4le();
      this.tbx = this._io.readF4le();
      this.tcx = this._io.readF4le();
      this.tay = this._io.readF4le();
      this.tby = this._io.readF4le();
      this.tcy = this._io.readF4le();
    }

    /**
     * 4-byte alignment for next float fields
     */

    return Face;
  })();

  var Bone = Atmosfear3df.Bone = (function() {
    function Bone(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Bone.prototype._read = function() {
      this.name = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(32), 0, false), "utf8");
      this.x = this._io.readF4le();
      this.y = this._io.readF4le();
      this.z = this._io.readF4le();
      this.owner = this._io.readS2le();
      this.hide = this._io.readS2le();
    }

    /**
     * Parent bone, or -1 if no parent
     */

    return Bone;
  })();


export default Atmosfear3df
