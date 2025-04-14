// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct"

function AtmosfearExp(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
}
AtmosfearExp.prototype._read = function() {
    this.sigOrCount = this._io.readU4le();
    if (this.sigOrCount == 2148606515) {
    this.rawVersion = this._io.readU4le();
    }
    if (this.version > 0) {
    this.rawCount = this._io.readU4le();
    }
    this.models = [];
    for (var i = 0; i < this.count; i++) {
    this.models.push(new Entry(this._io, this, this._root));
    }
    this.numTextures = this._io.readU4le();
    this.textures = [];
    for (var i = 0; i < this.numTextures; i++) {
    this.textures.push(KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(32), 0, false), "ascii"));
    }
}

var Entry = AtmosfearExp.Entry = (function() {
    function Entry(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Entry.prototype._read = function() {
    this.name = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(64), 0, false), "ascii");
    this.numVertices = this._io.readU4le();
    this.numFaces = this._io.readU4le();
    this.field48 = this._io.readU4le();
    this.numGroups = this._io.readU4le();
    this.numItems = this._io.readU4le();
    this.val6 = this._io.readF4le();
    this.val7 = this._io.readU4le();
    this.val8 = this._io.readU4le();
    this.val9 = this._io.readU4le();
    if (this._root.version >= 7) {
        this.v7Val1 = this._io.readU4le();
    }
    if (this._root.version >= 7) {
        this.v7Val2 = this._io.readU4le();
    }
    if (this._root.version >= 7) {
        this.v7Val3 = this._io.readU4le();
    }
    if (this._root.version >= 7) {
        this.v7Val4 = this._io.readU4le();
    }
    this.val10 = this._io.readU4le();
    this.val11 = this._io.readU4le();
    if (this._root.version >= 6) {
        this.v6Val1 = this._io.readBytes(128);
    }
    if (this._root.version >= 6) {
        this.v6Val2 = this._io.readU4le();
    }
    if (this._root.version >= 6) {
        this.v6Val3 = this._io.readU4le();
    }
    this.vertices = [];
    for (var i = 0; i < this.numVertices; i++) {
        this.vertices.push(new Vector3f(this._io, this, this._root));
    }
    this.faces = [];
    for (var i = 0; i < this.numFaces; i++) {
        this.faces.push(new Face(this._io, this, this._root));
    }
    this.field48Data = [];
    for (var i = 0; i < this.field48; i++) {
        this.field48Data.push(this._io.readBytes((this._root.version < 3 ? 32 : 36)));
    }
    if (this._root.version != 0) {
        this.skippedPerFace = [];
        for (var i = 0; i < this.numFaces; i++) {
        this.skippedPerFace.push(this._io.readU4le());
        }
    }
    this.skippedPerFace2 = [];
    for (var i = 0; i < this.numFaces; i++) {
        this.skippedPerFace2.push(this._io.readBytes(20));
    }
    this.groups = [];
    for (var i = 0; i < this.numGroups; i++) {
        this.groups.push(KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(128), 0, false), "ascii"));
    }
    this.items = [];
    for (var i = 0; i < this.numItems; i++) {
        this.items.push(this._io.readBytes((this._root.version < 5 ? (32 + 4) : 128)));
    }
    }

    return Entry;
})();

var Face = AtmosfearExp.Face = (function() {
    function Face(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Face.prototype._read = function() {
    this.indices = [];
    for (var i = 0; i < 4; i++) {
        this.indices.push(this._io.readU2le());
    }
    this.val1 = this._io.readU4le();
    this.val2 = this._io.readU4le();
    this.uvs = [];
    for (var i = 0; i < 4; i++) {
        this.uvs.push(new Vector2f(this._io, this, this._root));
    }
    this.colors = [];
    for (var i = 0; i < 4; i++) {
        this.colors.push(this._io.readU4le());
    }
    this.reserved = this._io.readBytes(12);
    }

    return Face;
})();

var Vector2f = AtmosfearExp.Vector2f = (function() {
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

var Vector3f = AtmosfearExp.Vector3f = (function() {
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
Object.defineProperty(AtmosfearExp.prototype, 'version', {
    get: function() {
    if (this._m_version !== undefined)
        return this._m_version;
    this._m_version = (this.sigOrCount == 2148606515 ? this.rawVersion : 0);
    return this._m_version;
    }
});
Object.defineProperty(AtmosfearExp.prototype, 'count', {
    get: function() {
    if (this._m_count !== undefined)
        return this._m_count;
    this._m_count = (this.version > 0 ? this.rawCount : this.sigOrCount);
    return this._m_count;
    }
});

export default AtmosfearExp;
