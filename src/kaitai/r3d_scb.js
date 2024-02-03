// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct";

  var Scb = (function() {
    function Scb(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
  
      this._read();
    }
    Scb.prototype._read = function() {
      this.magic = this._io.readBytes(8);
      if (!((KaitaiStream.byteArrayCompare(this.magic, [114, 51, 100, 50, 77, 101, 115, 104]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([114, 51, 100, 50, 77, 101, 115, 104], this.magic, this._io, "/seq/0");
      }
      this.versionMajor = this._io.readU2le();
      this.versionMinor = this._io.readU2le();
      this.name = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(128), 0, false), "ascii");
      this.numVertices = this._io.readU4le();
      this.numFaces = this._io.readU4le();
      this.flags = this._io.readU4le();
      if (this.versionMajor >= 2) {
        this.center = new Vector3f(this._io, this, this._root);
      }
      if (this.versionMajor >= 2) {
        this.extents = new Vector3f(this._io, this, this._root);
      }
      if ( ((this.versionMajor == 3) && (this.versionMinor == 2)) ) {
        this.hasColors = this._io.readU4le();
      }
      this.vertices = [];
      for (var i = 0; i < this.numVertices; i++) {
        this.vertices.push(new Vector3f(this._io, this, this._root));
      }
      if (this.hasColors == 1) {
        this.vertexColors = [];
        for (var i = 0; i < this.numVertices; i++) {
          this.vertexColors.push(this._io.readU4le());
        }
      }
      if (this.versionMajor >= 2) {
        this.central = new Vector3f(this._io, this, this._root);
      }
      this.faces = [];
      for (var i = 0; i < this.numFaces; i++) {
        this.faces.push(new Face(this._io, this, this._root));
      }
    }
  
    var Face = Scb.Face = (function() {
      function Face(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Face.prototype._read = function() {
        this.indices = [];
        for (var i = 0; i < 3; i++) {
          switch (this._root.versionMajor >= 2) {
          case true:
            this.indices.push(this._io.readU4le());
            break;
          case false:
            this.indices.push(this._io.readU2le());
            break;
          }
        }
        this.materialName = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(64), 0, false), "ascii");
        this.uvs = [];
        for (var i = 0; i < 6; i++) {
          this.uvs.push(this._io.readF4le());
        }
      }
  
      /**
       * u1,u2,u3,v1,v2,v3
       */
  
      return Face;
    })();
  
    var Vector3f = Scb.Vector3f = (function() {
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
  
    return Scb;
  })();

export default Scb;
