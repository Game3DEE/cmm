// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct"

    function Chasm3o(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
  
      this._read();
    }
    Chasm3o.prototype._read = function() {
      this.polygons = new Array(this.maxPolyCount);
      for (var i = 0; i < this.maxPolyCount; i++) {
        this.polygons[i] = new Polygon(this._io, this, this._root);
      }
      this.vertices = new Array(this.maxVertexCount);
      for (var i = 0; i < this.maxVertexCount; i++) {
        this.vertices[i] = new Vector3i(this._io, this, this._root);
      }
      this.padding = this._io.readBytes(4);
      this.vertexCount = this._io.readU2le();
      this.polyCount = this._io.readU2le();
      this.skinHeight = this._io.readU2le();
      this.skin = this._io.readBytes((this.skinHeight * 64));
    }
  
    var Polygon = Chasm3o.Polygon = (function() {
      function Polygon(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Polygon.prototype._read = function() {
        this.indices = new Array(4);
        for (var i = 0; i < 4; i++) {
          this.indices[i] = this._io.readU2le();
        }
        this.uvs = new Array(4);
        for (var i = 0; i < 4; i++) {
          this.uvs[i] = new Vector2i(this._io, this, this._root);
        }
        this.unknown1 = this._io.readBytes(4);
        this.unknown2 = this._io.readU1();
        this.flags = this._io.readU1();
        this.vOffset = this._io.readS2le();
      }
  
      return Polygon;
    })();
  
    var Vector3i = Chasm3o.Vector3i = (function() {
      function Vector3i(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Vector3i.prototype._read = function() {
        this.x = this._io.readS2le();
        this.y = this._io.readS2le();
        this.z = this._io.readS2le();
      }
  
      return Vector3i;
    })();
  
    var Vector2i = Chasm3o.Vector2i = (function() {
      function Vector2i(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Vector2i.prototype._read = function() {
        this.x = this._io.readS2le();
        this.y = this._io.readS2le();
      }
  
      return Vector2i;
    })();
    Object.defineProperty(Chasm3o.prototype, 'maxPolyCount', {
      get: function() {
        if (this._m_maxPolyCount !== undefined)
          return this._m_maxPolyCount;
        this._m_maxPolyCount = 400;
        return this._m_maxPolyCount;
      }
    });
    Object.defineProperty(Chasm3o.prototype, 'maxVertexCount', {
      get: function() {
        if (this._m_maxVertexCount !== undefined)
          return this._m_maxVertexCount;
        this._m_maxVertexCount = 938;
        return this._m_maxVertexCount;
      }
    });

    export default Chasm3o