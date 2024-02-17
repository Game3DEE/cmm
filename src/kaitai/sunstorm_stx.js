// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream }  from "kaitai-struct"

function SunstormStx(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
}
SunstormStx.prototype._read = function() {
    this._unnamed0 = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this._unnamed0, [83, 84, 69, 88]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([83, 84, 69, 88], this._unnamed0, this._io, "/seq/0");
    }
    this.val1 = this._io.readU4le();
    this.val2 = this._io.readU4le();
    this.val3 = this._io.readU4le();
    this.width = this._io.readU4le();
    this.height = this._io.readU4le();
    this.numMipmaps = this._io.readU4le();
    this.val4 = this._io.readU4le();
    this.numMetadata = this._io.readU4le();
    this.numUvSets = this._io.readU4le();
    if (this.val4 != 0) {
    this._unnamed10 = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this._unnamed10, [83, 84, 69, 88]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([83, 84, 69, 88], this._unnamed10, this._io, "/seq/10");
    }
    }
    this.metadata = [];
    for (var i = 0; i < this.numMetadata; i++) {
    this.metadata.push(new Metadata(this._io, this, this._root));
    }
    this.uvSets = [];
    for (var i = 0; i < this.numUvSets; i++) {
    this.uvSets.push(new UvSet(this._io, this, this._root));
    }
    this.formatLen = this._io.readU2le();
    this.format = KaitaiStream.bytesToStr(this._io.readBytes(this.formatLen), "utf8");
    this.pixWidth = this._io.readU4le();
    this.pixHeight = this._io.readU4le();
    this.pixRgbBitdepth = this._io.readU4le();
    this.pixAlphaBitdepth = this._io.readU4le();
    this.pixBytesPerPixel = this._io.readU4le();
    this.pixNumMipmaps = this._io.readU4le();
    this.pixVal1 = this._io.readU4le();
    this.pixRedBits = this._io.readU4le();
    this.pixGreenBits = this._io.readU4le();
    this.pixBlueBits = this._io.readU4le();
    this.pixAlphaBits = this._io.readU4le();
    this.pixRedShift = this._io.readU4le();
    this.pixGreenShift = this._io.readU4le();
    this.pixBlueShift = this._io.readU4le();
    this.pixAlphaShift = this._io.readU4le();
    this.pixRedMask = this._io.readU4le();
    this.pixGreenMask = this._io.readU4le();
    this.pixBlueMask = this._io.readU4le();
    this.pixAlphaMask = this._io.readU4le();
    this.pixPixelMask = this._io.readU4le();
    this.pixVal15 = this._io.readU4le();
    this.pixVal16 = this._io.readU4le();
    this.palette = this._io.readBytes((256 * 4));
    this.numMipmapMetadata = this._io.readU2le();
    this.mipmapMetadata = [];
    for (var i = 0; i < this.numMipmapMetadata; i++) {
    this.mipmapMetadata.push(new Metadata(this._io, this, this._root));
    }
    this.mipmaps = [];
    for (var i = 0; i < this.numMipmaps; i++) {
    this.mipmaps.push(new Mipmap(this._io, this, this._root));
    }
}

var Metadata = SunstormStx.Metadata = (function() {
    function Metadata(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Metadata.prototype._read = function() {
    this.keyLen = this._io.readU2le();
    this.key = KaitaiStream.bytesToStr(this._io.readBytes(this.keyLen), "utf8");
    this.valueLen = this._io.readU2le();
    this.value = KaitaiStream.bytesToStr(this._io.readBytes(this.valueLen), "utf8");
    }

    return Metadata;
})();

var UvSet = SunstormStx.UvSet = (function() {
    function UvSet(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    UvSet.prototype._read = function() {
    this.unknown = this._io.readU2le();
    this.numUvPairs = this._io.readU2le();
    this.numMetadata = this._io.readU2le();
    this.uvs = [];
    for (var i = 0; i < (this.numUvPairs * 2); i++) {
        this.uvs.push(this._io.readF4le());
    }
    this.metadata = [];
    for (var i = 0; i < this.numMetadata; i++) {
        this.metadata.push(new Metadata(this._io, this, this._root));
    }
    }

    return UvSet;
})();

var Mipmap = SunstormStx.Mipmap = (function() {
    function Mipmap(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
    }
    Mipmap.prototype._read = function() {
    this.width = this._io.readU4le();
    this.height = this._io.readU4le();
    this.val1 = this._io.readU4le();
    this.val2 = this._io.readU4le();
    this.val3 = this._io.readU4le();
    this.val4 = this._io.readU4le();
    this.val5 = this._io.readU4le();
    this.offsetRgb = this._io.readU4le();
    this.offsetAlpha = this._io.readU4le();
    }
    Object.defineProperty(Mipmap.prototype, 'rgb', {
    get: function() {
        if (this._m_rgb !== undefined)
        return this._m_rgb;
        if (this.offsetRgb != 4294967295) {
        var _pos = this._io.pos;
        this._io.seek(this.offsetRgb);
        this._m_rgb = this._io.readBytes(((3 * this.width) * this.height));
        this._io.seek(_pos);
        }
        return this._m_rgb;
    }
    });
    Object.defineProperty(Mipmap.prototype, 'alpha', {
    get: function() {
        if (this._m_alpha !== undefined)
        return this._m_alpha;
        if (this.offsetAlpha != 4294967295) {
        var _pos = this._io.pos;
        this._io.seek(this.offsetAlpha);
        this._m_alpha = this._io.readBytes((this.width * this.height));
        this._io.seek(_pos);
        }
        return this._m_alpha;
    }
    });

    return Mipmap;
})()

export default SunstormStx;
