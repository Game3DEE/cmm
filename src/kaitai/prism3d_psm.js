// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct";


    function SccsPsm(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
  
      this._read();
    }
    SccsPsm.prototype._read = function() {
      this.version = this._io.readU4le();
      this.omCount = this._io.readU4le();
      this.objectCount = this._io.readU4le();
      if (this.version > 3) {
        this.unknown = this._io.readU4le();
      }
      this.locators = new Array(this.omCount);
      for (var i = 0; i < this.omCount; i++) {
        this.locators[i] = new Locator(this._io, this, this._root);
      }
      this.objects = new Array(this.objectCount);
      for (var i = 0; i < this.objectCount; i++) {
        this.objects[i] = new Obj(this._io, this, this._root);
      }
    }
  
    var Vector4f = SccsPsm.Vector4f = (function() {
      function Vector4f(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Vector4f.prototype._read = function() {
        this.x = this._io.readF4le();
        this.y = this._io.readF4le();
        this.z = this._io.readF4le();
        this.w = this._io.readF4le();
      }
  
      return Vector4f;
    })();
  
    var Vector3f = SccsPsm.Vector3f = (function() {
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
  
    var Obj = SccsPsm.Obj = (function() {
      function Obj(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Obj.prototype._read = function() {
        this.name = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(16), 0, false), "utf8");
        this.triangleCount = this._io.readU4le();
        this.vertexCount = this._io.readU4le();
        this.matrixIndex = this._io.readU4le();
        this.unknown1 = this._io.readU4le();
        this.unknown2 = this._io.readU4le();
        this.unknown3 = this._io.readBytes(16);
        this.vertices = new Array(this.vertexCount);
        for (var i = 0; i < this.vertexCount; i++) {
          this.vertices[i] = new Vector3f(this._io, this, this._root);
        }
        this.unk2a = this._io.readBytes((this.unknown2 * this.vertexCount));
        this.unk2b = new Array((this.unknown2 * this.vertexCount));
        for (var i = 0; i < (this.unknown2 * this.vertexCount); i++) {
          this.unk2b[i] = this._io.readF4le();
        }
        this.normals = new Array(this.vertexCount);
        for (var i = 0; i < this.vertexCount; i++) {
          this.normals[i] = new Vector3f(this._io, this, this._root);
        }
        if (this.unknown1 == 3) {
          this.unknown = new Array(this.vertexCount);
          for (var i = 0; i < this.vertexCount; i++) {
            this.unknown[i] = this._io.readF4le();
          }
        }
        this.uvs = new Array(this.vertexCount);
        for (var i = 0; i < this.vertexCount; i++) {
          this.uvs[i] = new Vector2f(this._io, this, this._root);
        }
        this.indices = new Array((this.triangleCount * 3));
        for (var i = 0; i < (this.triangleCount * 3); i++) {
          this.indices[i] = this._io.readS2le();
        }
        if (this._root.version > 3) {
          this.faceIndices2 = new Array(this.triangleCount);
          for (var i = 0; i < this.triangleCount; i++) {
            this.faceIndices2[i] = this._io.readU2le();
          }
        }
      }
  
      return Obj;
    })();
  
    var Matrix = SccsPsm.Matrix = (function() {
      function Matrix(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Matrix.prototype._read = function() {
        this.rot1 = new Vector4f(this._io, this, this._root);
        this.pos1 = new Vector3f(this._io, this, this._root);
        this.pos2 = new Vector3f(this._io, this, this._root);
        this.rot2 = new Vector4f(this._io, this, this._root);
      }
  
      return Matrix;
    })();
  
    var Vector2f = SccsPsm.Vector2f = (function() {
      function Vector2f(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Vector2f.prototype._read = function() {
        this.x = this._io.readF4le();
        this.y = this._io.readF4le();
      }
  
      return Vector2f;
    })();
  
    var Locator = SccsPsm.Locator = (function() {
      function Locator(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Locator.prototype._read = function() {
        this.count = this._io.readU4le();
        this.matrices = new Array(this.count);
        for (var i = 0; i < this.count; i++) {
          this.matrices[i] = new Matrix(this._io, this, this._root);
        }
        this.indices = new Array(this.count);
        for (var i = 0; i < this.count; i++) {
          this.indices[i] = this._io.readS1();
        }
        this.weights = new Array(this.count);
        for (var i = 0; i < this.count; i++) {
          this.weights[i] = this._io.readF4le();
        }
        this.names = new Array(this.count);
        for (var i = 0; i < this.count; i++) {
          this.names[i] = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(16), 0, false), "utf8");
        }
      }
  
      return Locator;
    })();

    export default SccsPsm
