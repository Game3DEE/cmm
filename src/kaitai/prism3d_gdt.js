// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct";

function Prism3dGdt(_io, _parent, _root) {
  this._io = _io;
  this._parent = _parent;
  this._root = _root || this;

  this._read();
}
Prism3dGdt.prototype._read = function() {
  this.magic = this._io.readBytes(4);
  if (!((KaitaiStream.byteArrayCompare(this.magic, [71, 69, 79, 77]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([71, 69, 79, 77], this.magic, this._io, "/seq/0");
  }
  this.version = KaitaiStream.bytesToStr(this._io.readBytes(4), "utf8");
  this.modelCount = this._io.readU4le();
  this.models = new Array(13);
  for (var i = 0; i < 13; i++) {
    this.models[i] = new Model(this._io, this, this._root);
  }
}

var Model = Prism3dGdt.Model = (function() {
  function Model(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Model.prototype._read = function() {
    this.flags = this._io.readU4le();
    this.blockS1 = this._io.readS2le();
    this.blockIndex = this._io.readS2le();
    this.blockZero1 = this._io.readU4le();
    this.blockFloat1 = this._io.readF4le();
    this.blockFloat2 = this._io.readF4le();
    this.blockFloat3 = this._io.readF4le();
    this.blockFloat4 = this._io.readF4le();
    this.vertexCount = this._io.readU2le();
    this.indexCount = this._io.readU2le();
    this.indices = new Array(this.indexCount);
    for (var i = 0; i < this.indexCount; i++) {
      this.indices[i] = this._io.readU2le();
    }
    this.vertices = new Array(this.vertexCount);
    for (var i = 0; i < this.vertexCount; i++) {
      this.vertices[i] = new Vector3f(this._io, this, this._root);
    }
    this.colors = new Array(this.vertexCount);
    for (var i = 0; i < this.vertexCount; i++) {
      this.colors[i] = this._io.readU4le();
    }
    this.uvs = new Array(this.vertexCount);
    for (var i = 0; i < this.vertexCount; i++) {
      this.uvs[i] = new Uv(this._io, this, this._root);
    }
    if (this.flags == 93) {
      this.xyzr5d = new Array(4);
      for (var i = 0; i < 4; i++) {
        this.xyzr5d[i] = this._io.readF4le();
      }
    }
    if (this.flags == 125) {
      this.extra7d = new Array(9);
      for (var i = 0; i < 9; i++) {
        this.extra7d[i] = this._io.readF4le();
      }
    }
  }

  return Model;
})();

var Uv = Prism3dGdt.Uv = (function() {
  function Uv(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Uv.prototype._read = function() {
    if (this._parent.flags != 93) {
      this.vector = new Vector3f(this._io, this, this._root);
    }
    this.u = this._io.readF4le();
    this.v = this._io.readF4le();
  }

  return Uv;
})();

var Vector3f = Prism3dGdt.Vector3f = (function() {
  function Vector3f(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Vector3f.prototype._read = function() {
    this.x = this._io.readF4le();
    this.y = this._io.readF4le();
    this.z = this._io.readF4le();
  }

  return Vector3f;
})();

export default Prism3dGdt