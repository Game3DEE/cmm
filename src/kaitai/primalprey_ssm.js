// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct";

function PrimalpreySsm(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
}
PrimalpreySsm.prototype._read = function() {
    this.magic = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.magic, [83, 83, 77, 79]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([83, 83, 77, 79], this.magic, this._io, "/seq/0");
    }
    this.version = this._io.readU4le();
    this.vertCount = this._io.readU2le();
    this.faceCount = this._io.readU2le();
    this.textureCount = this._io.readU2le();
    this.framesCount = this._io.readU2le();
    this.animCount = this._io.readU2le();
    this.objCount = this._io.readU2le();
    this.paramCount = this._io.readU2le();
    this.faces = new Array(this.faceCount);
    for (var i = 0; i < this.faceCount; i++) {
    this.faces[i] = new Face(this._io, this, this._root);
    }
    this.textures = new Array(this.textureCount);
    for (var i = 0; i < this.textureCount; i++) {
    this.textures[i] = new Texture(this._io, this, this._root);
    }
    this.frames = new Array(this.framesCount);
    for (var i = 0; i < this.framesCount; i++) {
    this.frames[i] = new Frame(this._io, this, this._root);
    }
    this.animations = new Array(this.animCount);
    for (var i = 0; i < this.animCount; i++) {
    this.animations[i] = new Animation(this._io, this, this._root);
    }
    this.objects = new Array(this.objCount);
    for (var i = 0; i < this.objCount; i++) {
    this.objects[i] = new Obj(this._io, this, this._root);
    }
    this.params = new Array(this.paramCount);
    for (var i = 0; i < this.paramCount; i++) {
    this.params[i] = new Param(this._io, this, this._root);
    }
}

var Vector3f = PrimalpreySsm.Vector3f = (function() {
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

var Param = PrimalpreySsm.Param = (function() {
    function Param(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Param.prototype._read = function() {
    this.filler = this._io.readBytes(1);
    if (!((KaitaiStream.byteArrayCompare(this.filler, [0]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([0], this.filler, this._io, "/types/param/seq/0");
    }
    this.keyLen = this._io.readU2le();
    this.key = KaitaiStream.bytesToStr(this._io.readBytes(this.keyLen), "utf8");
    this.valueLen = this._io.readU2le();
    this.value = KaitaiStream.bytesToStr(this._io.readBytes(this.valueLen), "utf8");
    }

    return Param;
})();

var Obj = PrimalpreySsm.Obj = (function() {
    function Obj(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Obj.prototype._read = function() {
    this.filler1 = this._io.readU4le();
    this.filler2 = this._io.readU4le();
    this.nameLen = this._io.readU2le();
    this.name = KaitaiStream.bytesToStr(this._io.readBytes(this.nameLen), "utf8");
    this.skinCount = this._io.readU2le();
    this.skins = new Array(this.skinCount);
    for (var i = 0; i < this.skinCount; i++) {
        this.skins[i] = new Skin(this._io, this, this._root);
    }
    this.filler = this._io.readU2le();
    }

    return Obj;
})();

var Frame = PrimalpreySsm.Frame = (function() {
    function Frame(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Frame.prototype._read = function() {
    this.filler1 = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.filler1, [0, 0, 0, 0]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([0, 0, 0, 0], this.filler1, this._io, "/types/frame/seq/0");
    }
    this.filler2 = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.filler2, [0, 0, 0, 0]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([0, 0, 0, 0], this.filler2, this._io, "/types/frame/seq/1");
    }
    this.nameLen = this._io.readU2le();
    this.name = KaitaiStream.bytesToStr(this._io.readBytes(this.nameLen), "utf8");
    this.perObj = new Array(this._root.objCount);
    for (var i = 0; i < this._root.objCount; i++) {
        this.perObj[i] = this._io.readU1();
    }
    this.vertices = new Array(this._root.vertCount);
    for (var i = 0; i < this._root.vertCount; i++) {
        this.vertices[i] = new Vector3f(this._io, this, this._root);
    }
    }

    return Frame;
})();

var Face = PrimalpreySsm.Face = (function() {
    function Face(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Face.prototype._read = function() {
    this.vertices = new Array(3);
    for (var i = 0; i < 3; i++) {
        this.vertices[i] = this._io.readU2le();
    }
    this.flags = this._io.readU2le();
    this.uvs = new Array((3 * 2));
    for (var i = 0; i < (3 * 2); i++) {
        this.uvs[i] = this._io.readF4le();
    }
    this.meshId = this._io.readU2le();
    this.unknown = this._io.readU2le();
    }

    return Face;
})();

var Animation = PrimalpreySsm.Animation = (function() {
    function Animation(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Animation.prototype._read = function() {
    this.filler1 = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.filler1, [0, 0, 0, 0]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([0, 0, 0, 0], this.filler1, this._io, "/types/animation/seq/0");
    }
    this.filler2 = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.filler2, [0, 0, 0, 0]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([0, 0, 0, 0], this.filler2, this._io, "/types/animation/seq/1");
    }
    this.frameCount = this._io.readU2le();
    this.nameLen = this._io.readU2le();
    this.name = KaitaiStream.bytesToStr(this._io.readBytes(this.nameLen), "utf8");
    this.frameIndices = new Array(this.frameCount);
    for (var i = 0; i < this.frameCount; i++) {
        this.frameIndices[i] = this._io.readU2le();
    }
    this.frameDurations = new Array(this.frameCount);
    for (var i = 0; i < this.frameCount; i++) {
        this.frameDurations[i] = this._io.readF4le();
    }
    }

    return Animation;
})();

var Texture = PrimalpreySsm.Texture = (function() {
    function Texture(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Texture.prototype._read = function() {
    this.filler = this._io.readBytes(4);
    this.nameLen = this._io.readU2le();
    this.name = KaitaiStream.bytesToStr(this._io.readBytes(this.nameLen), "utf8");
    }

    return Texture;
})();

var Skin = PrimalpreySsm.Skin = (function() {
    function Skin(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Skin.prototype._read = function() {
    this.textureIndex = this._io.readU2le();
    this.nameLen = this._io.readU2le();
    this.name = KaitaiStream.bytesToStr(this._io.readBytes(this.nameLen), "utf8");
    }

    return Skin;
})();

export default PrimalpreySsm
