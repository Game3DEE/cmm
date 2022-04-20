// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream } from "kaitai-struct";

Quickdraw3d3dmf.PixelType = Object.freeze({
  RGB32: 0,
  ARGB32: 1,
  RGB16: 2,
  ARGB16: 3,
  RGB16_565: 4,
  RGB24: 5,
  UNKNOWN: 200,

  0: "RGB32",
  1: "ARGB32",
  2: "RGB16",
  3: "ARGB16",
  4: "RGB16_565",
  5: "RGB24",
  200: "UNKNOWN",
});

Quickdraw3d3dmf.AttributeType = Object.freeze({
  NONE: 0,
  SURFACE_UV: 1,
  SHADING_UV: 2,
  NORMAL: 3,
  AMBIENT_COEFFICIENT: 4,
  DIFFUSE_COLOR: 5,
  SPECULAR_COLOR: 6,
  SPECULAR_CONTROL: 7,
  TRANSPARENCY_COLOR: 8,
  SURFACE_TANGENT: 9,
  HIGHLIGHT_STATE: 10,
  SURFACE_SHADER: 11,

  0: "NONE",
  1: "SURFACE_UV",
  2: "SHADING_UV",
  3: "NORMAL",
  4: "AMBIENT_COEFFICIENT",
  5: "DIFFUSE_COLOR",
  6: "SPECULAR_COLOR",
  7: "SPECULAR_CONTROL",
  8: "TRANSPARENCY_COLOR",
  9: "SURFACE_TANGENT",
  10: "HIGHLIGHT_STATE",
  11: "SURFACE_SHADER",
});

function Quickdraw3d3dmf(_io, _parent, _root) {
  this._io = _io;
  this._parent = _parent;
  this._root = _root || this;

  this._read();
}
Quickdraw3d3dmf.prototype._read = function() {
  this.magic = this._io.readBytes(4);
  if (!((KaitaiStream.byteArrayCompare(this.magic, [51, 68, 77, 70]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([51, 68, 77, 70], this.magic, this._io, "/seq/0");
  }
  this.headerLength = this._io.readBytes(4);
  if (!((KaitaiStream.byteArrayCompare(this.headerLength, [0, 0, 0, 16]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([0, 0, 0, 16], this.headerLength, this._io, "/seq/1");
  }
  this.versionMajor = this._io.readU2be();
  this.versionMinor = this._io.readU2be();
  this.flags = this._io.readBytes(4);
  if (!((KaitaiStream.byteArrayCompare(this.flags, [0, 0, 0, 0]) == 0))) {
    throw new KaitaiStream.ValidationNotEqualError([0, 0, 0, 0], this.flags, this._io, "/seq/4");
  }
  this.tocOffset = this._io.readU8be();
  this.chunks = [];
  var i = 0;
  while (!this._io.isEof()) {
    this.chunks.push(new Chunk(this._io, this, this._root));
    i++;
  }
}

var Chunk = Quickdraw3d3dmf.Chunk = (function() {
  function Chunk(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Chunk.prototype._read = function() {
    this.type = KaitaiStream.bytesToStr(this._io.readBytes(4), "utf8");
    this.size = this._io.readU4be();
    switch (this.type) {
    case "bgng":
      this._raw_data = this._io.readBytes(this.size);
      var _io__raw_data = new KaitaiStream(this._raw_data);
      this.data = new ChunkList(_io__raw_data, this, this._root);
      break;
    case "atar":
      this._raw_data = this._io.readBytes(this.size);
      var _io__raw_data = new KaitaiStream(this._raw_data);
      this.data = new AtarData(_io__raw_data, this, this._root);
      break;
    case "txpm":
      this._raw_data = this._io.readBytes(this.size);
      var _io__raw_data = new KaitaiStream(this._raw_data);
      this.data = new TxpmData(_io__raw_data, this, this._root);
      break;
    case "kxpr":
      this._raw_data = this._io.readBytes(this.size);
      var _io__raw_data = new KaitaiStream(this._raw_data);
      this.data = new Color3f(_io__raw_data, this, this._root);
      break;
    case "txmm":
      this._raw_data = this._io.readBytes(this.size);
      var _io__raw_data = new KaitaiStream(this._raw_data);
      this.data = new TxmmData(_io__raw_data, this, this._root);
      break;
    case "kdif":
      this._raw_data = this._io.readBytes(this.size);
      var _io__raw_data = new KaitaiStream(this._raw_data);
      this.data = new Color3f(_io__raw_data, this, this._root);
      break;
    case "cntr":
      this._raw_data = this._io.readBytes(this.size);
      var _io__raw_data = new KaitaiStream(this._raw_data);
      this.data = new ChunkList(_io__raw_data, this, this._root);
      break;
    case "shdr":
      this._raw_data = this._io.readBytes(this.size);
      var _io__raw_data = new KaitaiStream(this._raw_data);
      this.data = new ShdrData(_io__raw_data, this, this._root);
      break;
    case "rfrn":
      this.data = this._io.readU4be();
      break;
    case "tmsh":
      this._raw_data = this._io.readBytes(this.size);
      var _io__raw_data = new KaitaiStream(this._raw_data);
      this.data = new TrimeshData(_io__raw_data, this, this._root);
      break;
    default:
      this.data = this._io.readBytes(this.size);
      break;
    }
  }

  return Chunk;
})();

var TxmmData = Quickdraw3d3dmf.TxmmData = (function() {
  function TxmmData(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  TxmmData.prototype._read = function() {
    this.useMipmapping = this._io.readU4be();
    this.pixelType = this._io.readU4be();
    this.bitOrder = this._io.readU4be();
    this.byteOrder = this._io.readU4be();
    this.width = this._io.readU4be();
    this.height = this._io.readU4be();
    this.rowBytes = this._io.readU4be();
  }

  return TxmmData;
})();

var TxpmData = Quickdraw3d3dmf.TxpmData = (function() {
  function TxpmData(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  TxpmData.prototype._read = function() {
    this.width = this._io.readU4be();
    this.height = this._io.readU4be();
    this.rowBytes = this._io.readU4be();
    this.pixelSize = this._io.readU4be();
    this.pixelType = this._io.readU4be();
    this.bitOrder = this._io.readU4be();
    this.byteOrder = this._io.readU4be();
  }

  return TxpmData;
})();

var Vector3f = Quickdraw3d3dmf.Vector3f = (function() {
  function Vector3f(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Vector3f.prototype._read = function() {
    this.x = this._io.readF4be();
    this.y = this._io.readF4be();
    this.z = this._io.readF4be();
  }

  return Vector3f;
})();

var ShdrData = Quickdraw3d3dmf.ShdrData = (function() {
  function ShdrData(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  ShdrData.prototype._read = function() {
    this.boundaryU = this._io.readU4be();
    this.boundaryV = this._io.readU4be();
  }

  return ShdrData;
})();

var TrimeshData = Quickdraw3d3dmf.TrimeshData = (function() {
  function TrimeshData(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  TrimeshData.prototype._read = function() {
    this.triangleCount = this._io.readU4be();
    this.triangleAttributeCount = this._io.readU4be();
    this.edgeCount = this._io.readU4be();
    this.edgeAttributeCount = this._io.readU4be();
    this.vertexCount = this._io.readU4be();
    this.vertexAttributeCount = this._io.readU4be();
    this.triangles = new Array((this.triangleCount * 3));
    for (var i = 0; i < (this.triangleCount * 3); i++) {
      switch (this.indexSize) {
      case 1:
        this.triangles[i] = this._io.readU1();
        break;
      case 2:
        this.triangles[i] = this._io.readU2be();
        break;
      }
    }
    this.vertices = new Array(this.vertexCount);
    for (var i = 0; i < this.vertexCount; i++) {
      this.vertices[i] = new Vector3f(this._io, this, this._root);
    }
    this.bboxMin = new Vector3f(this._io, this, this._root);
    this.bboxMax = new Vector3f(this._io, this, this._root);
  }
  Object.defineProperty(TrimeshData.prototype, 'indexSize', {
    get: function() {
      if (this._m_indexSize !== undefined)
        return this._m_indexSize;
      this._m_indexSize = (this.vertexCount > 255 ? 2 : 1);
      return this._m_indexSize;
    }
  });

  return TrimeshData;
})();

var Tangent2v = Quickdraw3d3dmf.Tangent2v = (function() {
  function Tangent2v(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Tangent2v.prototype._read = function() {
    this.uTangent = new Vector3f(this._io, this, this._root);
    this.vTangent = new Vector3f(this._io, this, this._root);
  }

  return Tangent2v;
})();

var AtarData = Quickdraw3d3dmf.AtarData = (function() {
  function AtarData(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  AtarData.prototype._read = function() {
    this.attributeType = this._io.readU4be();
    this.zero = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.zero, [0, 0, 0, 0]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([0, 0, 0, 0], this.zero, this._io, "/types/atar_data/seq/1");
    }
    this.positionOfArray = this._io.readU4be();
    this.positionInArray = this._io.readU4be();
    this.attributeUseFlag = this._io.readU4be();
    switch (this.attributeType) {
    case Quickdraw3d3dmf.AttributeType.SURFACE_UV:
      this.values = new Vector2f(this._io, this, this._root);
      break;
    case Quickdraw3d3dmf.AttributeType.NORMAL:
      this.values = new Vector3f(this._io, this, this._root);
      break;
    case Quickdraw3d3dmf.AttributeType.DIFFUSE_COLOR:
      this.values = new Color4f(this._io, this, this._root);
      break;
    case Quickdraw3d3dmf.AttributeType.TRANSPARENCY_COLOR:
      this.values = new Vector3f(this._io, this, this._root);
      break;
    case Quickdraw3d3dmf.AttributeType.SURFACE_TANGENT:
      this.values = new Tangent2v(this._io, this, this._root);
      break;
    case Quickdraw3d3dmf.AttributeType.HIGHLIGHT_STATE:
      this.values = this._io.readU4be();
      break;
    case Quickdraw3d3dmf.AttributeType.AMBIENT_COEFFICIENT:
      this.values = this._io.readF4be();
      break;
    case Quickdraw3d3dmf.AttributeType.SPECULAR_CONTROL:
      this.values = this._io.readF4be();
      break;
    case Quickdraw3d3dmf.AttributeType.SHADING_UV:
      this.values = new Vector2f(this._io, this, this._root);
      break;
    case Quickdraw3d3dmf.AttributeType.SPECULAR_COLOR:
      this.values = new Color4f(this._io, this, this._root);
      break;
    case Quickdraw3d3dmf.AttributeType.SURFACE_SHADER:
      this.values = this._io.readU4be();
      break;
    }
  }

  return AtarData;
})();

var Color4f = Quickdraw3d3dmf.Color4f = (function() {
  function Color4f(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Color4f.prototype._read = function() {
    this.r = this._io.readF4be();
    this.g = this._io.readF4be();
    this.b = this._io.readF4be();
    this.a = this._io.readF4be();
  }

  return Color4f;
})();

var Toc = Quickdraw3d3dmf.Toc = (function() {
  function Toc(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Toc.prototype._read = function() {
    this.tocMagic = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.tocMagic, [116, 111, 99, 32]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([116, 111, 99, 32], this.tocMagic, this._io, "/types/toc/seq/0");
    }
    this.tocSize = this._io.readU4be();
    this.nextToc = this._io.readU8be();
    this.refSeed = this._io.readU4be();
    this.typeSeed = this._io.readU4be();
    this.tocEntryType = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.tocEntryType, [0, 0, 0, 1]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([0, 0, 0, 1], this.tocEntryType, this._io, "/types/toc/seq/5");
    }
    this.tocEntrySize = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.tocEntrySize, [0, 0, 0, 16]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([0, 0, 0, 16], this.tocEntrySize, this._io, "/types/toc/seq/6");
    }
    this.entryCount = this._io.readU4be();
    this.entries = new Array(this.entryCount);
    for (var i = 0; i < this.entryCount; i++) {
      this.entries[i] = new TocEntry(this._io, this, this._root);
    }
  }

  /**
   * only QD3D 1.5 3DMF TOCs are recognized
   */

  return Toc;
})();

var Vector2f = Quickdraw3d3dmf.Vector2f = (function() {
  function Vector2f(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Vector2f.prototype._read = function() {
    this.x = this._io.readF4be();
    this.y = this._io.readF4be();
  }

  return Vector2f;
})();

var ChunkList = Quickdraw3d3dmf.ChunkList = (function() {
  function ChunkList(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  ChunkList.prototype._read = function() {
    this.chunks = [];
    var i = 0;
    while (!this._io.isEof()) {
      this.chunks.push(new Chunk(this._io, this, this._root));
      i++;
    }
  }

  return ChunkList;
})();

var Color3f = Quickdraw3d3dmf.Color3f = (function() {
  function Color3f(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Color3f.prototype._read = function() {
    this.r = this._io.readF4be();
    this.g = this._io.readF4be();
    this.b = this._io.readF4be();
  }

  return Color3f;
})();

var TocEntry = Quickdraw3d3dmf.TocEntry = (function() {
  function TocEntry(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  TocEntry.prototype._read = function() {
    this.refId = this._io.readU4be();
    this.objLocation = this._io.readU8be();
    this.type = KaitaiStream.bytesToStr(this._io.readBytes(4), "utf8");
  }

  return TocEntry;
})();
Object.defineProperty(Quickdraw3d3dmf.prototype, 'toc', {
  get: function() {
    if (this._m_toc !== undefined)
      return this._m_toc;
    if (this.tocOffset != 0) {
      var _pos = this._io.pos;
      this._io.seek(this.tocOffset);
      this._m_toc = new Toc(this._io, this, this._root);
      this._io.seek(_pos);
    }
    return this._m_toc;
  }
});

/**
 * Database or Stream types aren't supported
 */


export default Quickdraw3d3dmf