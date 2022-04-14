// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct";


    function SccsGdt(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
  
      this._read();
    }
    SccsGdt.prototype._read = function() {
      this.magic = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.magic, [71, 69, 79, 77]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([71, 69, 79, 77], this.magic, this._io, "/seq/0");
      }
      this.version = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.version, [48, 48, 48, 54]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([48, 48, 48, 54], this.version, this._io, "/seq/1");
      }
      this.modelCount = this._io.readU4le();
      this.models = new Array(this.modelCount);
      for (var i = 0; i < this.modelCount; i++) {
        this.models[i] = new Model(this._io, this, this._root);
      }
    }
  
    var Model = SccsGdt.Model = (function() {
      function Model(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Model.prototype._read = function() {
        this.type = this._io.readU4le();
        this._unnamed1 = this._io.readBytes(24);
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
        this.unknown = this._io.readU2le();
      }
  
      return Model;
    })();
  
    var Uv = SccsGdt.Uv = (function() {
      function Uv(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Uv.prototype._read = function() {
        if (this._parent.type != 349) {
          this.normal = new Vector3f(this._io, this, this._root);
        }
        this.u = this._io.readF4le();
        this.v = this._io.readF4le();
      }
  
      return Uv;
    })();
  
    var Vector3f = SccsGdt.Vector3f = (function() {
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
  
    export default SccsGdt