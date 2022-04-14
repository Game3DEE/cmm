// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct";

function SccsPmg(_io, _parent, _root) {
  this._io = _io;
  this._parent = _parent;
  this._root = _root || this;

  this._read();
}
SccsPmg.prototype._read = function() {
  this.version = this._io.readU1();
  this.magic = this._io.readBytes(3);
  if (!((KaitaiStream.byteArrayCompare(this.magic, [103, 109, 80]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([103, 109, 80], this.magic, this._io, "/seq/1");
  }
  this.objectCount = this._io.readU4le();
  this.count1 = this._io.readU4le();
  this.count2 = this._io.readU4le();
  this.count3 = this._io.readU4le();
  this.center = new Vector3f(this._io, this, this._root);
  this.radius = this._io.readF4le();
  if (this._root.version > 16) {
    this.floats = new Array(6);
    for (var i = 0; i < 6; i++) {
      this.floats[i] = this._io.readF4le();
    }
  }
  this.dataOffset1 = this._io.readU4le();
  this.dataOffset2 = this._io.readU4le();
  this.dataOffset3 = this._io.readU4le();
  this.dataOffset4 = this._io.readU4le();
  this.dataOffset5 = this._io.readU4le();
  this.dataSize1 = this._io.readU4le();
  this.dataOffset7 = this._io.readU4le();
  this.dataSize2 = this._io.readU4le();
  this.dataOffset9 = this._io.readU4le();
  this.dataOffset10 = this._io.readU4le();
  this.dataOffset11 = this._io.readU4le();
  this.dataSize3 = this._io.readU4le();
  this.dataOffset13 = this._io.readU4le();
  this.dataSize4 = this._io.readU4le();
  this.unknownData1 = new Array((this.count1 * 6));
  for (var i = 0; i < (this.count1 * 6); i++) {
    this.unknownData1[i] = this._io.readU4le();
  }
  this.unknownData2 = new Array(this.count3);
  for (var i = 0; i < this.count3; i++) {
    this.unknownData2[i] = new Unknown2(this._io, this, this._root);
  }
}

var Vector3f = SccsPmg.Vector3f = (function() {
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

var Obj = SccsPmg.Obj = (function() {
  function Obj(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Obj.prototype._read = function() {
    this.indexCount = this._io.readU4le();
    this.vertexCount = this._io.readU4le();
    this.val1 = this._io.readU4le();
    this.index = this._io.readU4le();
    this.center = new Vector3f(this._io, this, this._root);
    this.radius = this._io.readF4le();
    if (this._root.version > 16) {
      this.floats = new Array(6);
      for (var i = 0; i < 6; i++) {
        this.floats[i] = this._io.readF4le();
      }
    }
    this.vertexDataOffset = this._io.readS4le();
    this.normalDataOffset = this._io.readS4le();
    this.uvDataOffset = this._io.readS4le();
    this.colorsDataOffset = this._io.readS4le();
    this.dataOffset1 = this._io.readS4le();
    this.dataOffset2 = this._io.readS4le();
    this.indexDataOffset = this._io.readS4le();
    this.dataOffset3 = this._io.readS4le();
    this.dataOffset4 = this._io.readS4le();
    this.dataOffset5 = this._io.readS4le();
  }
  Object.defineProperty(Obj.prototype, 'indices', {
    get: function() {
      if (this._m_indices !== undefined)
        return this._m_indices;
      if (this.indexDataOffset != -1) {
        var _pos = this._io.pos;
        this._io.seek(this.indexDataOffset);
        this._m_indices = new Array(this.indexCount);
        for (var i = 0; i < this.indexCount; i++) {
          this._m_indices[i] = this._io.readU2le();
        }
        this._io.seek(_pos);
      }
      return this._m_indices;
    }
  });
  Object.defineProperty(Obj.prototype, 'vertices', {
    get: function() {
      if (this._m_vertices !== undefined)
        return this._m_vertices;
      if (this.vertexDataOffset != -1) {
        var _pos = this._io.pos;
        this._io.seek(this.vertexDataOffset);
        this._m_vertices = new Array(this.vertexCount);
        for (var i = 0; i < this.vertexCount; i++) {
          this._m_vertices[i] = new Vector3f(this._io, this, this._root);
        }
        this._io.seek(_pos);
      }
      return this._m_vertices;
    }
  });
  Object.defineProperty(Obj.prototype, 'uvs', {
    get: function() {
      if (this._m_uvs !== undefined)
        return this._m_uvs;
      if (this.uvDataOffset != -1) {
        var _pos = this._io.pos;
        this._io.seek(this.uvDataOffset);
        this._m_uvs = new Array(this.vertexCount);
        for (var i = 0; i < this.vertexCount; i++) {
          this._m_uvs[i] = new Vector2f(this._io, this, this._root);
        }
        this._io.seek(_pos);
      }
      return this._m_uvs;
    }
  });
  Object.defineProperty(Obj.prototype, 'colors', {
    get: function() {
      if (this._m_colors !== undefined)
        return this._m_colors;
      if (this.colorsDataOffset != -1) {
        var _pos = this._io.pos;
        this._io.seek(this.colorsDataOffset);
        this._m_colors = new Array(this.vertexCount);
        for (var i = 0; i < this.vertexCount; i++) {
          this._m_colors[i] = new Color4b(this._io, this, this._root);
        }
        this._io.seek(_pos);
      }
      return this._m_colors;
    }
  });
  Object.defineProperty(Obj.prototype, 'normals', {
    get: function() {
      if (this._m_normals !== undefined)
        return this._m_normals;
      if (this.normalDataOffset != -1) {
        var _pos = this._io.pos;
        this._io.seek(this.normalDataOffset);
        this._m_normals = new Array(this.vertexCount);
        for (var i = 0; i < this.vertexCount; i++) {
          this._m_normals[i] = new Vector3f(this._io, this, this._root);
        }
        this._io.seek(_pos);
      }
      return this._m_normals;
    }
  });

  return Obj;
})();

var Unknown2 = SccsPmg.Unknown2 = (function() {
  function Unknown2(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Unknown2.prototype._read = function() {
    this.val1 = this._io.readU4le();
    this.val2 = this._io.readU4le();
    this.x = this._io.readF4le();
    this.y = this._io.readF4le();
    this.z = this._io.readF4le();
    this.r = this._io.readF4le();
    this.x2 = this._io.readF4le();
    this.y2 = this._io.readF4le();
    this.z2 = this._io.readF4le();
    this.r2 = this._io.readF4le();
  }

  return Unknown2;
})();

var Color4b = SccsPmg.Color4b = (function() {
  function Color4b(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Color4b.prototype._read = function() {
    this.r = this._io.readU1();
    this.g = this._io.readU1();
    this.b = this._io.readU1();
    this.a = this._io.readU1();
  }

  return Color4b;
})();

var Vector2f = SccsPmg.Vector2f = (function() {
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
Object.defineProperty(SccsPmg.prototype, 'objects', {
  get: function() {
    if (this._m_objects !== undefined)
      return this._m_objects;
    var _pos = this._io.pos;
    this._io.seek(this.dataOffset3);
    this._m_objects = new Array(this.objectCount);
    for (var i = 0; i < this.objectCount; i++) {
      this._m_objects[i] = new Obj(this._io, this, this._root);
    }
    this._io.seek(_pos);
    return this._m_objects;
  }
});

      export default SccsPmg;
      