// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct"

function OrionMsh1(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
}
OrionMsh1.prototype._read = function() {
    this.version = this._io.readU4le();
    this._unnamed1 = this._io.readBytes(16);
    if (!((KaitaiStream.byteArrayCompare(this._unnamed1, [79, 114, 105, 111, 110, 32, 101, 110, 103, 105, 110, 101, 32, 118, 49, 0]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([79, 114, 105, 111, 110, 32, 101, 110, 103, 105, 110, 101, 32, 118, 49, 0], this._unnamed1, this._io, "/seq/1");
    }
    this.val1 = this._io.readU4le();
    this.numTriangles = this._io.readU4le();
    this.numVertices = this._io.readU4le();
    this.val4 = this._io.readU4le();
    this.val5 = this._io.readU4le();
    this.val6 = this._io.readU4le();
    this.val7 = this._io.readU4le();
    this.val8 = this._io.readU4le();
    this.val9 = this._io.readU4le();
    this.vec1 = new Vector3f(this._io, this, this._root);
    this.vec2 = new Vector3f(this._io, this, this._root);
    this.vec3 = new Vector3f(this._io, this, this._root);
    this.vec4 = new Vector3f(this._io, this, this._root);
    this.vertices = [];
    for (var i = 0; i < this.numVertices; i++) {
    this.vertices.push(new Vector3f(this._io, this, this._root));
    }
    this.normals = [];
    for (var i = 0; i < this.numVertices; i++) {
    this.normals.push(new Vector3f(this._io, this, this._root));
    }
    this.indices = [];
    for (var i = 0; i < (this.numTriangles * 3); i++) {
    this.indices.push(this._io.readU2le());
    }
    this.uv = [];
    for (var i = 0; i < (2 * this.numVertices); i++) {
    this.uv.push(this._io.readF4le());
    }
    this.vecs1 = [];
    for (var i = 0; i < this.numVertices; i++) {
    this.vecs1.push(new Vector3f(this._io, this, this._root));
    }
    this.vecs2 = [];
    for (var i = 0; i < this.numVertices; i++) {
    this.vecs2.push(new Vector3f(this._io, this, this._root));
    }
    this.val8Data = [];
    for (var i = 0; i < this.val8; i++) {
    this.val8Data.push(this._io.readBytes(16));
    }
    this.val9Vecs = [];
    for (var i = 0; i < this.val9; i++) {
    this.val9Vecs.push(new Vector3f(this._io, this, this._root));
    }
    this.someCount = this._io.readU4le();
    this.someData = this._io.readBytes(this.someCount);
}

var Vector3f = OrionMsh1.Vector3f = (function() {
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

var Entry = OrionMsh1.Entry = (function() {
    function Entry(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Entry.prototype._read = function() {
    this.data1 = [];
    for (var i = 0; i < this._root.val8; i++) {
        this.data1.push(this._io.readBytes(16));
    }
    this.vecs = [];
    for (var i = 0; i < this._root.val9; i++) {
        this.vecs.push(new Vector3f(this._io, this, this._root));
    }
    this.dataSize = this._io.readU4le();
    this.val5Data = new Val5Data(this._io, this, this._root, this.dataSize);
    }

    return Entry;
})();

var Val5Data = OrionMsh1.Val5Data = (function() {
    function Val5Data(_io, _parent, _root, dataSize) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;
    this.dataSize = dataSize;

    this._read();
    }
    Val5Data.prototype._read = function() {
    this.data = this._io.readBytes(this.dataSize);
    }

    return Val5Data;
})();
  
export default OrionMsh1;
