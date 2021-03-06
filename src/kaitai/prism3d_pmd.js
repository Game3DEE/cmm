// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct";

function Prism3dPmd(_io, _parent, _root) {
  this._io = _io;
  this._parent = _parent;
  this._root = _root || this;

  this._read();
}
Prism3dPmd.prototype._read = function() {
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
  this.scale = new Vector3f(this._io, this, this._root);
  this.zeroes = this._io.readBytes(192);
  this.animationHeaders = new Array(this.maxAnimations);
  for (var i = 0; i < this.maxAnimations; i++) {
    this.animationHeaders[i] = new AnimationHeader(this._io, this, this._root);
  }
  this.objects = new Array(this.objectCount);
  for (var i = 0; i < this.objectCount; i++) {
    this.objects[i] = new Obj(this._io, this, this._root, i);
  }
  this.animations = new Array(this.animationCount);
  for (var i = 0; i < this.animationCount; i++) {
    this.animations[i] = new Animation(this._io, this, this._root, i);
  }
}

var Vector3i = Prism3dPmd.Vector3i = (function() {
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

var ObjectHeader = Prism3dPmd.ObjectHeader = (function() {
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

var Vector3f = Prism3dPmd.Vector3f = (function() {
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

var Obj = Prism3dPmd.Obj = (function() {
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

var Animation = Prism3dPmd.Animation = (function() {
  function Animation(_io, _parent, _root, index) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;
    this.index = index;

    this._read();
  }
  Animation.prototype._read = function() {
    this.indices = new Array(this.frameCount);
    for (var i = 0; i < this.frameCount; i++) {
      this.indices[i] = this._io.readU4le();
    }
    this.weights = new Array(this.frameCount);
    for (var i = 0; i < this.frameCount; i++) {
      this.weights[i] = this._io.readF4le();
    }
  }
  Object.defineProperty(Animation.prototype, 'frameCount', {
    get: function() {
      if (this._m_frameCount !== undefined)
        return this._m_frameCount;
      this._m_frameCount = this._root.animationHeaders[this.index].frameCount;
      return this._m_frameCount;
    }
  });

  return Animation;
})();

var Vector2f = Prism3dPmd.Vector2f = (function() {
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

var AnimationHeader = Prism3dPmd.AnimationHeader = (function() {
  function AnimationHeader(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  AnimationHeader.prototype._read = function() {
    this.frameCount = this._io.readU4le();
    this.fps = this._io.readF4le();
    this.duration = this._io.readF4le();
    this.name = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(32), 0, false), "utf8");
    this.val1 = this._io.readU4le();
    this.val2 = this._io.readU4le();
  }

  return AnimationHeader;
})();
Object.defineProperty(Prism3dPmd.prototype, 'maxObjects', {
  get: function() {
    if (this._m_maxObjects !== undefined)
      return this._m_maxObjects;
    this._m_maxObjects = 16;
    return this._m_maxObjects;
  }
});
Object.defineProperty(Prism3dPmd.prototype, 'maxAnimations', {
  get: function() {
    if (this._m_maxAnimations !== undefined)
      return this._m_maxAnimations;
    this._m_maxAnimations = 64;
    return this._m_maxAnimations;
  }
});

export default Prism3dPmd
