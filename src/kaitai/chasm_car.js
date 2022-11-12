// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct"

    function ChasmCar(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
  
      this._read();
    }
    ChasmCar.prototype._read = function() {
      this.animationSizes = [];
      for (var i = 0; i < this.maxAnimCount; i++) {
        this.animationSizes.push(this._io.readU2le());
      }
      this.submodelsAnimations = [];
      for (var i = 0; i < (3 * 2); i++) {
        this.submodelsAnimations.push(this._io.readU2le());
      }
      this.unknown0 = [];
      for (var i = 0; i < 9; i++) {
        this.unknown0.push(this._io.readU2le());
      }
      this.soundSizes = [];
      for (var i = 0; i < this.maxSounds; i++) {
        this.soundSizes.push(this._io.readU2le());
      }
      this.unknown1 = [];
      for (var i = 0; i < 9; i++) {
        this.unknown1.push(this._io.readU2le());
      }
      this.polygons = [];
      for (var i = 0; i < this.maxPolyCount; i++) {
        this.polygons.push(new Polygon(this._io, this, this._root));
      }
      this.vertices = [];
      for (var i = 0; i < this.maxVertexCount; i++) {
        this.vertices.push(new Vector3i(this._io, this, this._root));
      }
      this.padding = this._io.readBytes(4);
      this.vertexCount = this._io.readU2le();
      this.polyCount = this._io.readU2le();
      this.texelCount = this._io.readU2le();
      this.texture = this._io.readBytes(this.texelCount);
      this._raw_animations = [];
      this.animations = [];
      for (var i = 0; i < this.maxAnimCount; i++) {
        this._raw_animations.push(this._io.readBytes(this.animationSizes[i]));
        var _io__raw_animations = new KaitaiStream(this._raw_animations[i]);
        this.animations.push(new Animation(_io__raw_animations, this, this._root, this.vertexCount));
      }
      this.submodel = [];
      for (var i = 0; i < this.maxSubModels; i++) {
        this.submodel.push(new Submodel(this._io, this, this._root, i));
      }
      this.sounds = [];
      for (var i = 0; i < this.maxSounds; i++) {
        this.sounds.push(this._io.readBytes(this.soundSizes[i]));
      }
    }
  
    var Vector3i = ChasmCar.Vector3i = (function() {
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
  
    var Polygon = ChasmCar.Polygon = (function() {
      function Polygon(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Polygon.prototype._read = function() {
        this.indices = [];
        for (var i = 0; i < 4; i++) {
          this.indices.push(this._io.readU2le());
        }
        this.uvs = [];
        for (var i = 0; i < 4; i++) {
          this.uvs.push(new Vector2i(this._io, this, this._root));
        }
        this.unknown1 = this._io.readBytes(4);
        this.bone = this._io.readU1();
        this.flags = this._io.readU1();
        this.vOffset = this._io.readU2le();
      }
  
      return Polygon;
    })();
  
    var Frame = ChasmCar.Frame = (function() {
      function Frame(_io, _parent, _root, vertexCount) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this.vertexCount = vertexCount;
  
        this._read();
      }
      Frame.prototype._read = function() {
        this.vertices = [];
        for (var i = 0; i < this.vertexCount; i++) {
          this.vertices.push(new Vector3i(this._io, this, this._root));
        }
      }
  
      return Frame;
    })();
  
    var Animation = ChasmCar.Animation = (function() {
      function Animation(_io, _parent, _root, vertexCount) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this.vertexCount = vertexCount;
  
        this._read();
      }
      Animation.prototype._read = function() {
        this.frames = [];
        var i = 0;
        while (!this._io.isEof()) {
          this.frames.push(new Frame(this._io, this, this._root, this.vertexCount));
          i++;
        }
      }
  
      return Animation;
    })();
  
    var Vector2i = ChasmCar.Vector2i = (function() {
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
  
    var Submodel = ChasmCar.Submodel = (function() {
      function Submodel(_io, _parent, _root, index) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this.index = index;
  
        this._read();
      }
      Submodel.prototype._read = function() {
        if (this.animationSize > 0) {
          this.polygons = [];
          for (var i = 0; i < 576; i++) {
            this.polygons.push(new Polygon(this._io, this, this._root));
          }
        }
        if (this.animationSize > 0) {
          this.vertexCount = this._io.readU2le();
        }
        if (this.animationSize > 0) {
          this.polygonCount = this._io.readU2le();
        }
        if (this.animationSize > 0) {
          this.someCount = this._io.readU2le();
        }
        if (this.animationSize > 0) {
          this._raw_animations = this._io.readBytes(this.animationSize);
          var _io__raw_animations = new KaitaiStream(this._raw_animations);
          this.animations = new Animation(_io__raw_animations, this, this._root, this.vertexCount);
        }
      }
      Object.defineProperty(Submodel.prototype, 'animationSize', {
        get: function() {
          if (this._m_animationSize !== undefined)
            return this._m_animationSize;
          this._m_animationSize = (this._root.submodelsAnimations[((this.index * 2) + 0)] + this._root.submodelsAnimations[((this.index * 2) + 1)]);
          return this._m_animationSize;
        }
      });
  
      return Submodel;
    })();
    Object.defineProperty(ChasmCar.prototype, 'maxPolyCount', {
      get: function() {
        if (this._m_maxPolyCount !== undefined)
          return this._m_maxPolyCount;
        this._m_maxPolyCount = 400;
        return this._m_maxPolyCount;
      }
    });
    Object.defineProperty(ChasmCar.prototype, 'maxAnimCount', {
      get: function() {
        if (this._m_maxAnimCount !== undefined)
          return this._m_maxAnimCount;
        this._m_maxAnimCount = 20;
        return this._m_maxAnimCount;
      }
    });
    Object.defineProperty(ChasmCar.prototype, 'maxSubModels', {
      get: function() {
        if (this._m_maxSubModels !== undefined)
          return this._m_maxSubModels;
        this._m_maxSubModels = 3;
        return this._m_maxSubModels;
      }
    });
    Object.defineProperty(ChasmCar.prototype, 'maxSounds', {
      get: function() {
        if (this._m_maxSounds !== undefined)
          return this._m_maxSounds;
        this._m_maxSounds = 7;
        return this._m_maxSounds;
      }
    });
    Object.defineProperty(ChasmCar.prototype, 'maxVertexCount', {
      get: function() {
        if (this._m_maxVertexCount !== undefined)
          return this._m_maxVertexCount;
        this._m_maxVertexCount = 938;
        return this._m_maxVertexCount;
      }
    });
    Object.defineProperty(ChasmCar.prototype, 'textureHeight', {
      get: function() {
        if (this._m_textureHeight !== undefined)
          return this._m_textureHeight;
        this._m_textureHeight = Math.floor(this.texelCount / 64);
        return this._m_textureHeight;
      }
    });
  

export default ChasmCar