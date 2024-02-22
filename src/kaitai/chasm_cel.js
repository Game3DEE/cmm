// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct"

function ChasmCel(_io, _parent, _root) {
  this._io = _io;
  this._parent = _parent;
  this._root = _root || this;

  this._read();
}
ChasmCel.prototype._read = function() {
  this.magic = this._io.readBytes(2);
  if (!((KaitaiStream.byteArrayCompare(this.magic, [25, 145]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([25, 145], this.magic, this._io, "/seq/0");
  }
  this.width = this._io.readU2le();
  this.height = this._io.readU2le();
  this.unk1 = this._io.readU2le();
  this.unk2 = this._io.readU2le();
  this.unk3 = this._io.readU2le();
  this.unk4 = this._io.readU2le();
  this.unk5 = this._io.readU2le();
  this.padding = this._io.readBytes(16);
  this.palette = [];
  for (var i = 0; i < 256; i++) {
    this.palette.push(new Rgb(this._io, this, this._root));
  }
  this.data = this._io.readBytes((this.width * this.height));
}

  function Rgb(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Rgb.prototype._read = function() {
    this.r = this._io.readU1();
    this.g = this._io.readU1();
    this.b = this._io.readU1();
  }

export default ChasmCel;
