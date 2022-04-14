// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct";

function SccsPmd(_io, _parent, _root) {
  this._io = _io;
  this._parent = _parent;
  this._root = _root || this;

  this._read();
}
SccsPmd.prototype._read = function() {
  this.version = this._io.readU4le();
  this.objectCount = this._io.readU4le();
  this.objectHeaders = new Array(this.maxObjects);
  for (var i = 0; i < this.maxObjects; i++) {
    this.objectHeaders[i] = new ObjectHeader(this._io, this, this._root);
  }
  this.morphTargetCount = this._io.readU4le();
  this.animationCount = this._io.readU4le();
  this.bboxMin = new Vector3f(this._io, this, this._root);
  this.bboxMax = new Vector3f(this._io, this, this._root);
  this.center = new Vector3f(this._io, this, this._root);
  this.zeroes = this._io.readBytes(192);
  this.animations = new Array(this.maxAnimations);
  for (var i = 0; i < this.maxAnimations; i++) {
    this.animations[i] = new Animation(this._io, this, this._root);
  }
  this.objects = new Array(this.objectCount);
  for (var i = 0; i < this.objectCount; i++) {
    this.objects[i] = new Obj(this._io, this, this._root, i);
  }
  this.animationData = new Array(this.animationCount);
  for (var i = 0; i < this.animationCount; i++) {
    this.animationData[i] = new AnimationData(this._io, this, this._root, i);
  }
}

var Vector3i = SccsPmd.Vector3i = (function() {
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
    this.index = this._io.readU1();
  }

  return Vector3i;
})();

var ObjectHeader = SccsPmd.ObjectHeader = (function() {
  function ObjectHeader(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  ObjectHeader.prototype._read = function() {
    this.name = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(16), 0, false), "utf8");
    this.triangleCount = this._io.readU4le();
    this.vertexCount = this._io.readU4le();
    this.val1 = this._io.readU4le();
  }

  return ObjectHeader;
})();

var Vector3f = SccsPmd.Vector3f = (function() {
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

var Obj = SccsPmd.Obj = (function() {
  function Obj(_io, _parent, _root, index) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;
    this.index = index;

    this._read();
  }
  Obj.prototype._read = function() {
    this.indices = new Array(this.indexCount);
    for (var i = 0; i < this.indexCount; i++) {
      this.indices[i] = this._io.readU2le();
    }
    this.vertices = new Array((this.vertexCount * this._root.morphTargetCount));
    for (var i = 0; i < (this.vertexCount * this._root.morphTargetCount); i++) {
      this.vertices[i] = new Vector3i(this._io, this, this._root);
    }
    this.uvs = new Array(this.vertexCount);
    for (var i = 0; i < this.vertexCount; i++) {
      this.uvs[i] = new Vector2f(this._io, this, this._root);
    }
  }
  Object.defineProperty(Obj.prototype, 'indexCount', {
    get: function() {
      if (this._m_indexCount !== undefined)
        return this._m_indexCount;
      this._m_indexCount = (this._root.objectHeaders[this.index].triangleCount * 3);
      return this._m_indexCount;
    }
  });
  Object.defineProperty(Obj.prototype, 'vertexCount', {
    get: function() {
      if (this._m_vertexCount !== undefined)
        return this._m_vertexCount;
      this._m_vertexCount = this._root.objectHeaders[this.index].vertexCount;
      return this._m_vertexCount;
    }
  });

  return Obj;
})();

var Animation = SccsPmd.Animation = (function() {
  function Animation(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Animation.prototype._read = function() {
    this.frameCount = this._io.readU4le();
    this.time = this._io.readF4le();
    this.frameRate = this._io.readF4le();
    this.name = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(32), 0, false), "utf8");
    this.val1 = this._io.readU4le();
    this.val2 = this._io.readU4le();
  }

  return Animation;
})();

var Vector2f = SccsPmd.Vector2f = (function() {
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

var AnimationData = SccsPmd.AnimationData = (function() {
  function AnimationData(_io, _parent, _root, index) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;
    this.index = index;

    this._read();
  }
  AnimationData.prototype._read = function() {
    this.indices = new Array(this.frameCount);
    for (var i = 0; i < this.frameCount; i++) {
      this.indices[i] = this._io.readU4le();
    }
    this.weights = new Array(this.frameCount);
    for (var i = 0; i < this.frameCount; i++) {
      this.weights[i] = this._io.readF4le();
    }
  }
  Object.defineProperty(AnimationData.prototype, 'frameCount', {
    get: function() {
      if (this._m_frameCount !== undefined)
        return this._m_frameCount;
      this._m_frameCount = this._root.animations[this.index].frameCount;
      return this._m_frameCount;
    }
  });

  return AnimationData;
})();
Object.defineProperty(SccsPmd.prototype, 'maxObjects', {
  get: function() {
    if (this._m_maxObjects !== undefined)
      return this._m_maxObjects;
    this._m_maxObjects = 16;
    return this._m_maxObjects;
  }
});
Object.defineProperty(SccsPmd.prototype, 'maxAnimations', {
  get: function() {
    if (this._m_maxAnimations !== undefined)
      return this._m_maxAnimations;
    this._m_maxAnimations = 64;
    return this._m_maxAnimations;
  }
});

export default SccsPmd
