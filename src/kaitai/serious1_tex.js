// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream }  from "kaitai-struct"

function Serious1Tex(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
}
Serious1Tex.prototype._read = function() {
    this.tverSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.tverSig, [84, 86, 69, 82]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([84, 86, 69, 82], this.tverSig, this._io, "/seq/0");
    }
    this.version = this._io.readU4le();
    this.tdatSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.tdatSig, [84, 68, 65, 84]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([84, 68, 65, 84], this.tdatSig, this._io, "/seq/2");
    }
    this.flags = this._io.readU4le();
    this.mexWidth = this._io.readU4le();
    this.mexHeight = this._io.readU4le();
    this.fineMipsLevels = this._io.readU4le();
    this.firstMipsLevel = this._io.readU4le();
    this.frameCount = this._io.readU4le();
    this.frmsSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.frmsSig, [70, 82, 77, 83]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([70, 82, 77, 83], this.frmsSig, this._io, "/seq/9");
    }
    this.frames = new Array(this.frameCount);
    for (var i = 0; i < this.frameCount; i++) {
    this.frames[i] = new Frame(this._io, this, this._root, i);
    }
}

var Frame = Serious1Tex.Frame = (function() {
    function Frame(_io, _parent, _root, index) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;
    this.index = index;

    this._read();
    }
    Frame.prototype._read = function() {
    this.pixels = this._io.readBytes(((this.width * this.height) * this._root.bytesPerPixel));
    }
    Object.defineProperty(Frame.prototype, 'width', {
    get: function() {
        if (this._m_width !== undefined)
        return this._m_width;
        this._m_width = (this._root.width >>> this.index);
        return this._m_width;
    }
    });
    Object.defineProperty(Frame.prototype, 'height', {
    get: function() {
        if (this._m_height !== undefined)
        return this._m_height;
        this._m_height = (this._root.height >>> this.index);
        return this._m_height;
    }
    });

    return Frame;
})();
Object.defineProperty(Serious1Tex.prototype, 'isEqualized', {
    get: function() {
    if (this._m_isEqualized !== undefined)
        return this._m_isEqualized;
    this._m_isEqualized = (this.flags & (1 << 8)) != 0;
    return this._m_isEqualized;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'hasAlphaChannel', {
    get: function() {
    if (this._m_hasAlphaChannel !== undefined)
        return this._m_hasAlphaChannel;
    this._m_hasAlphaChannel = (this.flags & (1 << 0)) != 0;
    return this._m_hasAlphaChannel;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'height', {
    get: function() {
    if (this._m_height !== undefined)
        return this._m_height;
    this._m_height = (this.mexHeight >>> this.firstMipsLevel);
    return this._m_height;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'isTransparent', {
    get: function() {
    if (this._m_isTransparent !== undefined)
        return this._m_isTransparent;
    this._m_isTransparent = (this.flags & (1 << 7)) != 0;
    return this._m_isTransparent;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'isStatic', {
    get: function() {
    if (this._m_isStatic !== undefined)
        return this._m_isStatic;
    this._m_isStatic = (this.flags & (1 << 5)) != 0;
    return this._m_isStatic;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'isProbed', {
    get: function() {
    if (this._m_isProbed !== undefined)
        return this._m_isProbed;
    this._m_isProbed = (this.flags & (1 << 19)) != 0;
    return this._m_isProbed;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'keepColor', {
    get: function() {
    if (this._m_keepColor !== undefined)
        return this._m_keepColor;
    this._m_keepColor = (this.flags & (1 << 11)) != 0;
    return this._m_keepColor;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'width', {
    get: function() {
    if (this._m_width !== undefined)
        return this._m_width;
    this._m_width = (this.mexWidth >>> this.firstMipsLevel);
    return this._m_width;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'isConstant', {
    get: function() {
    if (this._m_isConstant !== undefined)
        return this._m_isConstant;
    this._m_isConstant = (this.flags & (1 << 6)) != 0;
    return this._m_isConstant;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'isGreyscale', {
    get: function() {
    if (this._m_isGreyscale !== undefined)
        return this._m_isGreyscale;
    this._m_isGreyscale = (this.flags & (1 << 9)) != 0;
    return this._m_isGreyscale;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'bytesPerPixel', {
    get: function() {
    if (this._m_bytesPerPixel !== undefined)
        return this._m_bytesPerPixel;
    this._m_bytesPerPixel = (this.hasAlphaChannel ? 4 : 3);
    return this._m_bytesPerPixel;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'is32bit', {
    get: function() {
    if (this._m_is32bit !== undefined)
        return this._m_is32bit;
    this._m_is32bit = (this.flags & (1 << 1)) != 0;
    return this._m_is32bit;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'isSingleMipmap', {
    get: function() {
    if (this._m_isSingleMipmap !== undefined)
        return this._m_isSingleMipmap;
    this._m_isSingleMipmap = (this.flags & (1 << 18)) != 0;
    return this._m_isSingleMipmap;
    }
});
Object.defineProperty(Serious1Tex.prototype, 'isWhite', {
    get: function() {
    if (this._m_isWhite !== undefined)
        return this._m_isWhite;
    this._m_isWhite = (this.flags & (1 << 10)) != 0;
    return this._m_isWhite;
    }
})

export default Serious1Tex