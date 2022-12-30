// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct"

// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild
  function Animator3df(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Animator3df.prototype._read = function() {
    this.magic = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.magic, [75, 105, 101, 118]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([75, 105, 101, 118], this.magic, this._io, "/seq/0");
    }
    this.version = this._io.readU4le();
    this.skipped = this._io.readBytes(120);
    this.textureCount = this._io.readU4le();
    this.textures = [];
    for (var i = 0; i < this.textureCount; i++) {
      this.textures.push(KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(16), 0, false), "utf8"));
    }
    this.lodCount = this._io.readU4le();
    this.lods = [];
    for (var i = 0; i < this.lodCount; i++) {
      this.lods.push(new Lod(this._io, this, this._root));
    }
  }

  var Lod = Animator3df.Lod = (function() {
    function Lod(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Lod.prototype._read = function() {
      this.vertexCount = this._io.readU4le();
      this.faceCount = this._io.readU4le();
      this.boneCount = this._io.readU4le();
      this.vertices = [];
      for (var i = 0; i < this.vertexCount; i++) {
        this.vertices.push(new Vertex(this._io, this, this._root));
      }
      this.faces = [];
      for (var i = 0; i < this.faceCount; i++) {
        this.faces.push(new Face(this._io, this, this._root));
      }
      this.bones = [];
      for (var i = 0; i < this.boneCount; i++) {
        this.bones.push(new Bone(this._io, this, this._root));
      }
      this.textureIdPerFace = this._io.readBytes(this.faceCount);
      this.faceByTextureCounts = [];
      for (var i = 0; i < this._root.textureCount; i++) {
        this.faceByTextureCounts.push(this._io.readU4le());
      }
    }

    return Lod;
  })();

  var Vertex = Animator3df.Vertex = (function() {
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

  var Face = Animator3df.Face = (function() {
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
      this.flags = this._io.readU2le();
      this.tax = this._io.readF4le();
      this.tbx = this._io.readF4le();
      this.tcx = this._io.readF4le();
      this.tay = this._io.readF4le();
      this.tby = this._io.readF4le();
      this.tcy = this._io.readF4le();
    }

    return Face;
  })();

  var Bone = Animator3df.Bone = (function() {
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


export default Animator3df
