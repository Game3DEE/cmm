// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream }  from "kaitai-struct"

VivisectorCmf.BlockId = Object.freeze({
    TEXTURE_COUNT: 2,
    TEXTURES: 3,
    FACE_COUNT: 8209,
    VERT_COUNT: 8210,
    FACES: 8211,
    UV1: 8224,
    UV2: 8225,
    VERTICES: 8227,
    FLOATS: 8243,
    ALT_FACES: 8244,
    HEADER: 61441,
    OBJECT_NAME: 61457,

    2: "TEXTURE_COUNT",
    3: "TEXTURES",
    8209: "FACE_COUNT",
    8210: "VERT_COUNT",
    8211: "FACES",
    8224: "UV1",
    8225: "UV2",
    8227: "VERTICES",
    8243: "FLOATS",
    8244: "ALT_FACES",
    61441: "HEADER",
    61457: "OBJECT_NAME",
});

function VivisectorCmf(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
}
VivisectorCmf.prototype._read = function() {
    this.magic = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.magic, [85, 66, 70, 67]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([85, 66, 70, 67], this.magic, this._io, "/seq/0");
    }
    this.zero1 = this._io.readU4le();
    this.blocks = [];
    var i = 0;
    while (!this._io.isEof()) {
    this.blocks.push(new Block(this._io, this, this._root));
    i++;
    }
}

var Uv = VivisectorCmf.Uv = (function() {
    function Uv(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Uv.prototype._read = function() {
    this.aU = this._io.readF4le();
    this.bU = this._io.readF4le();
    this.cU = this._io.readF4le();
    this.dU = this._io.readF4le();
    this.aV = this._io.readF4le();
    this.bV = this._io.readF4le();
    this.cV = this._io.readF4le();
    this.dV = this._io.readF4le();
    }

    return Uv;
})();

var Vector3f = VivisectorCmf.Vector3f = (function() {
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

var UvBlock = VivisectorCmf.UvBlock = (function() {
    function UvBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    UvBlock.prototype._read = function() {
    this.uvs = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.uvs.push(new Uv(this._io, this, this._root));
        i++;
    }
    }

    return UvBlock;
})();

var HeaderBlock = VivisectorCmf.HeaderBlock = (function() {
    function HeaderBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    HeaderBlock.prototype._read = function() {
    this.val1 = this._io.readU4le();
    this.val2 = this._io.readU4le();
    this.val3 = this._io.readU4le();
    this.val4 = this._io.readU4le();
    this.float1 = this._io.readF4le();
    this.val6 = this._io.readU4le();
    this.val7 = this._io.readU4le();
    this.val8 = this._io.readU4le();
    this.val9 = this._io.readU4le();
    this.val10 = this._io.readU4le();
    this.val11 = this._io.readU4le();
    }

    return HeaderBlock;
})();

var VertBlock = VivisectorCmf.VertBlock = (function() {
    function VertBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    VertBlock.prototype._read = function() {
    this.vertices = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.vertices.push(new Vector3f(this._io, this, this._root));
        i++;
    }
    }

    return VertBlock;
})();

var TexturesBlock = VivisectorCmf.TexturesBlock = (function() {
    function TexturesBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    TexturesBlock.prototype._read = function() {
    this.textures = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.textures.push(KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(128), 0, false), "utf8"));
        i++;
    }
    }

    return TexturesBlock;
})();

var Face = VivisectorCmf.Face = (function() {
    function Face(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Face.prototype._read = function() {
    this.a = this._io.readU4le();
    this.b = this._io.readU4le();
    this.c = this._io.readU4le();
    this.d = this._io.readU4le();
    }

    return Face;
})();

var Block = VivisectorCmf.Block = (function() {
    function Block(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Block.prototype._read = function() {
    this.id = this._io.readU4le();
    this.size = this._io.readU4le();
    switch (this.id) {
    case VivisectorCmf.BlockId.UV1:
        this._raw_data = this._io.readBytes(this.size);
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new UvBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.VERT_COUNT:
        this.data = this._io.readU4le();
        break;
    case VivisectorCmf.BlockId.FLOATS:
        this._raw_data = this._io.readBytes(this.size);
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new FloatsBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.TEXTURE_COUNT:
        this.data = this._io.readU4le();
        break;
    case VivisectorCmf.BlockId.ALT_FACES:
        this._raw_data = this._io.readBytes(this.size);
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new FacesBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.TEXTURES:
        this._raw_data = this._io.readBytes(this.size);
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new TexturesBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.FACE_COUNT:
        this.data = this._io.readU4le();
        break;
    case VivisectorCmf.BlockId.HEADER:
        this._raw_data = this._io.readBytes(this.size);
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new HeaderBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.UV2:
        this._raw_data = this._io.readBytes(this.size);
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new UvBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.FACES:
        this._raw_data = this._io.readBytes(this.size);
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new FacesBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.OBJECT_NAME:
        this.data = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(this.size), 0, false), "utf8");
        break;
    case VivisectorCmf.BlockId.VERTICES:
        this._raw_data = this._io.readBytes(this.size);
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new VertBlock(_io__raw_data, this, this._root);
        break;
    default:
        this.data = this._io.readBytes(this.size);
        break;
    }
    }

    return Block;
})();

var FacesBlock = VivisectorCmf.FacesBlock = (function() {
    function FacesBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    FacesBlock.prototype._read = function() {
    this.faces = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.faces.push(new Face(this._io, this, this._root));
        i++;
    }
    }

    return FacesBlock;
})();

var FloatsBlock = VivisectorCmf.FloatsBlock = (function() {
    function FloatsBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    FloatsBlock.prototype._read = function() {
    this.vertices = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.vertices.push(new Vector3f(this._io, this, this._root));
        i++;
    }
    }

    return FloatsBlock;
})();

export default VivisectorCmf