// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream }  from "kaitai-struct"

function VivisectorTrk(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  VivisectorTrk.prototype._read = function() {
    this.boneCount = this._io.readU4le();
    this.frameMax = this._io.readU4le();
    this.rotSequence = this._io.readU4le();
    this.fps = this._io.readU4le();
    this.bones = new Array(this.boneCount);
    for (var i = 0; i < this.boneCount; i++) {
      this.bones[i] = new Bone(this._io, this, this._root);
    }
  }

  var Bone = VivisectorTrk.Bone = (function() {
    function Bone(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Bone.prototype._read = function() {
      this.name = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(32), 0, false), "ascii");
      this.count = this._io.readU4le();
      this.blocks = new Array(this.count);
      for (var i = 0; i < this.count; i++) {
        this.blocks[i] = new Block(this._io, this, this._root);
      }
    }

    return Bone;
  })();

  var Block = VivisectorTrk.Block = (function() {
    function Block(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Block.prototype._read = function() {
      this.frameIndex = this._io.readU4le();
      this.active = this._io.readU4le();
      this.acceleration = this._io.readU4le();
      this.rotation = new Vector3f(this._io, this, this._root);
      this.translation = new Vector3f(this._io, this, this._root);
      this.scale = new Vector3f(this._io, this, this._root);
    }

    /**
     * y rotation gets * -1 on load
     */

    /**
     * scale
     */

    return Block;
  })();

  var Vector3f = VivisectorTrk.Vector3f = (function() {
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

export default VivisectorTrk
