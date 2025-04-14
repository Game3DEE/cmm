// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream }  from "kaitai-struct"

// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

VivisectorCmf.BlockId = Object.freeze({
    TEXTURE_COUNT: 2,
    TEXTURES: 3,
    WRONG_SIZED_BLOCK: 4098,
    FACE_COUNT: 8209,
    VERT_COUNT: 8210,
    FACES: 8211,
    FACE_UNKN_ATTR1_U4: 8215,
    FACE_UNKN_ATTR6_U4: 8218,
    FACE_MATERIALS: 8220,
    FACE_UNKN_ATTR2_U4: 8221,
    UV1: 8224,
    UV2: 8225,
    VERTICES: 8227,
    SOMETHING_COUNT: 8240,
    SOMETHING_UNKN_ATTR1_2X_U4: 8241,
    SOMETHING_UNKN_ATTR2_2X_U4: 8242,
    SOMETHING_UNKN_ATTR3_V3F: 8243,
    ALT_FACES: 8244,
    HEADER: 61441,
    BONE_COUNT: 61456,
    BONE_NAMES: 61457,
    BONE_POSITIONS: 61458,
    BONE_UNKN_ATTR1_U2: 61459,
    BONE_PARENTS: 61460,
    BONE_TRANSFORMS: 61461,
    FACE_UNKN_ATTR3_U4: 61473,
    FACE_UNKN_ATTR4_U1: 61474,
    FACE_UNKN_ATTR5_U2: 61475,
    VERTEX_BONES: 61488,
    VERTEX_UNKN_ATTR1_U2: 61489,

    2: "TEXTURE_COUNT",
    3: "TEXTURES",
    4098: "WRONG_SIZED_BLOCK",
    8209: "FACE_COUNT",
    8210: "VERT_COUNT",
    8211: "FACES",
    8215: "FACE_UNKN_ATTR1_U4",
    8218: "FACE_UNKN_ATTR6_U4",
    8220: "FACE_MATERIALS",
    8221: "FACE_UNKN_ATTR2_U4",
    8224: "UV1",
    8225: "UV2",
    8227: "VERTICES",
    8240: "SOMETHING_COUNT",
    8241: "SOMETHING_UNKN_ATTR1_2X_U4",
    8242: "SOMETHING_UNKN_ATTR2_2X_U4",
    8243: "SOMETHING_UNKN_ATTR3_V3F",
    8244: "ALT_FACES",
    61441: "HEADER",
    61456: "BONE_COUNT",
    61457: "BONE_NAMES",
    61458: "BONE_POSITIONS",
    61459: "BONE_UNKN_ATTR1_U2",
    61460: "BONE_PARENTS",
    61461: "BONE_TRANSFORMS",
    61473: "FACE_UNKN_ATTR3_U4",
    61474: "FACE_UNKN_ATTR4_U1",
    61475: "FACE_UNKN_ATTR5_U2",
    61488: "VERTEX_BONES",
    61489: "VERTEX_UNKN_ATTR1_U2",
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

var SomethingUnknAttr3V3fBlock = VivisectorCmf.SomethingUnknAttr3V3fBlock = (function() {
    function SomethingUnknAttr3V3fBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    SomethingUnknAttr3V3fBlock.prototype._read = function() {
    this.vertices = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.vertices.push(new Vector3f(this._io, this, this._root));
        i++;
    }
    }

    return SomethingUnknAttr3V3fBlock;
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

var BoneTransformsBlock = VivisectorCmf.BoneTransformsBlock = (function() {
    function BoneTransformsBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    BoneTransformsBlock.prototype._read = function() {
    this.boneTransforms = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.boneTransforms.push(new Matrix3x3f(this._io, this, this._root));
        i++;
    }
    }

    return BoneTransformsBlock;
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
        this.textures.push(KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(64), 0, false), "utf8"));
        i++;
    }
    }

    /**
     * This is actually wrong, as CSF files have 64 bytes per texture name, but CMF files have 128 bytes per texture name!
     */

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

var BonePositionsBlock = VivisectorCmf.BonePositionsBlock = (function() {
    function BonePositionsBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    BonePositionsBlock.prototype._read = function() {
    this.bonePositions = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.bonePositions.push(new Vector3f(this._io, this, this._root));
        i++;
    }
    }

    return BonePositionsBlock;
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
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new UvBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.VERT_COUNT:
        this.data = this._io.readU4le();
        break;
    case VivisectorCmf.BlockId.SOMETHING_COUNT:
        this.data = this._io.readU4le();
        break;
    case VivisectorCmf.BlockId.TEXTURE_COUNT:
        this.data = this._io.readU4le();
        break;
    case VivisectorCmf.BlockId.BONE_NAMES:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new BoneNamesBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.ALT_FACES:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new FacesBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.VERTEX_BONES:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new VertexBonesBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.BONE_COUNT:
        this.data = this._io.readU4le();
        break;
    case VivisectorCmf.BlockId.SOMETHING_UNKN_ATTR3_V3F:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new SomethingUnknAttr3V3fBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.BONE_POSITIONS:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new BonePositionsBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.TEXTURES:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new TexturesBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.FACE_COUNT:
        this.data = this._io.readU4le();
        break;
    case VivisectorCmf.BlockId.FACE_MATERIALS:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new FaceMaterialsBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.HEADER:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new HeaderBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.UV2:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new UvBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.BONE_TRANSFORMS:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new BoneTransformsBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.FACES:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new FacesBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.BONE_PARENTS:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new BoneParentsBlock(_io__raw_data, this, this._root);
        break;
    case VivisectorCmf.BlockId.VERTICES:
        this._raw_data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        var _io__raw_data = new KaitaiStream(this._raw_data);
        this.data = new VertBlock(_io__raw_data, this, this._root);
        break;
    default:
        this.data = this._io.readBytes((this.id == VivisectorCmf.BlockId.WRONG_SIZED_BLOCK ? (this.size - 4) : this.size));
        break;
    }
    }

    return Block;
})();

var BoneNamesBlock = VivisectorCmf.BoneNamesBlock = (function() {
    function BoneNamesBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    BoneNamesBlock.prototype._read = function() {
    this.boneNames = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.boneNames.push(KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(32), 0, false), "utf8"));
        i++;
    }
    }

    return BoneNamesBlock;
})();

var Matrix3x3f = VivisectorCmf.Matrix3x3f = (function() {
    function Matrix3x3f(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Matrix3x3f.prototype._read = function() {
    this.elements = [];
    for (var i = 0; i < 9; i++) {
        this.elements.push(this._io.readF4le());
    }
    }

    return Matrix3x3f;
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

var VertexBonesBlock = VivisectorCmf.VertexBonesBlock = (function() {
    function VertexBonesBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    VertexBonesBlock.prototype._read = function() {
    this.boneIndices = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.boneIndices.push(this._io.readU2le());
        i++;
    }
    }

    /**
     * Maps every vertex to a bone
     */

    return VertexBonesBlock;
})();

var FaceMaterialsBlock = VivisectorCmf.FaceMaterialsBlock = (function() {
    function FaceMaterialsBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    FaceMaterialsBlock.prototype._read = function() {
    this.indices = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.indices.push(this._io.readU4le());
        i++;
    }
    }

    /**
     * Maps every face to a material (texture)
     */

    return FaceMaterialsBlock;
})();

var BoneParentsBlock = VivisectorCmf.BoneParentsBlock = (function() {
    function BoneParentsBlock(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    BoneParentsBlock.prototype._read = function() {
    this.boneParents = [];
    var i = 0;
    while (!this._io.isEof()) {
        this.boneParents.push(this._io.readS2le());
        i++;
    }
    }

    return BoneParentsBlock;
})();
  

export default VivisectorCmf