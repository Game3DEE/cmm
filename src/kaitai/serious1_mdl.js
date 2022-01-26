// NOTE: This file was manually tweaked for ES6 compatibility
import { KaitaiStream }  from "kaitai-struct"

  function Serious1Mdl(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Serious1Mdl.prototype._read = function() {
    this.magic = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.magic, [77, 68, 65, 84]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([77, 68, 65, 84], this.magic, this._io, "/seq/0");
    }
    this.version = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.version, [86, 48, 49, 48]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([86, 48, 49, 48], this.version, this._io, "/seq/1");
    }
    this.flags = this._io.readU4le();
    this.ivtxSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.ivtxSig, [73, 86, 84, 88]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([73, 86, 84, 88], this.ivtxSig, this._io, "/seq/3");
    }
    this.ivtxSize = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.ivtxSize, [4, 0, 0, 0]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([4, 0, 0, 0], this.ivtxSize, this._io, "/seq/4");
    }
    this.vertexCount = this._io.readU4le();
    this.ifrmSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.ifrmSig, [73, 70, 82, 77]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([73, 70, 82, 77], this.ifrmSig, this._io, "/seq/6");
    }
    this.ifrmSize = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.ifrmSize, [4, 0, 0, 0]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([4, 0, 0, 0], this.ifrmSize, this._io, "/seq/7");
    }
    this.frameCount = this._io.readU4le();
    switch (this.compressed16Bit) {
    case true:
      this.vertexBlock = new Av17Block(this._io, this, this._root);
      break;
    case false:
      this.vertexBlock = new AvfxBlock(this._io, this, this._root);
      break;
    }
    this.afinSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.afinSig, [65, 70, 73, 78]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([65, 70, 73, 78], this.afinSig, this._io, "/seq/10");
    }
    this.afinSize = this._io.readU4le();
    this.frameInfo = new Array(this.frameCount);
    for (var i = 0; i < this.frameCount; i++) {
      this.frameInfo[i] = new BoundingBox(this._io, this, this._root);
    }
    this.ammvSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.ammvSig, [65, 77, 77, 86]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([65, 77, 77, 86], this.ammvSig, this._io, "/seq/13");
    }
    this.ammvSize = this._io.readU4le();
    this.mainMipVertices = new Array(this.vertexCount);
    for (var i = 0; i < this.vertexCount; i++) {
      this.mainMipVertices[i] = new Vector3f(this._io, this, this._root);
    }
    this.avmkSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.avmkSig, [65, 86, 77, 75]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([65, 86, 77, 75], this.avmkSig, this._io, "/seq/16");
    }
    this.avmkSize = this._io.readU4le();
    this.vertexMipMask = new Array(this.vertexCount);
    for (var i = 0; i < this.vertexCount; i++) {
      this.vertexMipMask[i] = this._io.readU4le();
    }
    this.imipSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.imipSig, [73, 77, 73, 80]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([73, 77, 73, 80], this.imipSig, this._io, "/seq/19");
    }
    this.imipSize = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.imipSize, [4, 0, 0, 0]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([4, 0, 0, 0], this.imipSize, this._io, "/seq/20");
    }
    this.mipCount = this._io.readU4le();
    this.fmipSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.fmipSig, [70, 77, 73, 80]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([70, 77, 73, 80], this.fmipSig, this._io, "/seq/22");
    }
    this.fmipSize = this._io.readU4le();
    this.mipFactors = new Array(this.maxMips);
    for (var i = 0; i < this.maxMips; i++) {
      this.mipFactors[i] = this._io.readF4le();
    }
    this.mipInfo = new Array(this.mipCount);
    for (var i = 0; i < this.mipCount; i++) {
      this.mipInfo[i] = new ModelMipInfo(this._io, this, this._root);
    }
    this.ptc2Sig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.ptc2Sig, [80, 84, 67, 50]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([80, 84, 67, 50], this.ptc2Sig, this._io, "/seq/26");
    }
    this.patches = new Array(this.maxPatches);
    for (var i = 0; i < this.maxPatches; i++) {
      this.patches[i] = new ModelPatch(this._io, this, this._root);
    }
    this.stxwSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.stxwSig, [83, 84, 88, 87]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([83, 84, 88, 87], this.stxwSig, this._io, "/seq/28");
    }
    this.stxwSize = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.stxwSize, [4, 0, 0, 0]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([4, 0, 0, 0], this.stxwSize, this._io, "/seq/29");
    }
    this.textureWidth = this._io.readU4le();
    this.stxhSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.stxhSig, [83, 84, 88, 72]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([83, 84, 88, 72], this.stxhSig, this._io, "/seq/31");
    }
    this.stxhSize = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.stxhSize, [4, 0, 0, 0]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([4, 0, 0, 0], this.stxhSize, this._io, "/seq/32");
    }
    this.textureHeight = this._io.readU4le();
    this.shadowQuality = this._io.readU4le();
    this.stretch = new Vector3f(this._io, this, this._root);
    this.center = new Vector3f(this._io, this, this._root);
    this.collisionBoxCount = this._io.readU4le();
    this.collisionBoxes = new Array(this.collisionBoxCount);
    for (var i = 0; i < this.collisionBoxCount; i++) {
      this.collisionBoxes[i] = new CollisionBox(this._io, this, this._root);
    }
    this.coliSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.coliSig, [67, 79, 76, 73]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([67, 79, 76, 73], this.coliSig, this._io, "/seq/39");
    }
    this.collisionType = this._io.readU4le();
    this.attachedPositionCount = this._io.readU4le();
    this.attachedPositions = new Array(this.attachedPositionCount);
    for (var i = 0; i < this.attachedPositionCount; i++) {
      this.attachedPositions[i] = new AttachedPosition(this._io, this, this._root);
    }
    this.iclnSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.iclnSig, [73, 67, 76, 78]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([73, 67, 76, 78], this.iclnSig, this._io, "/seq/43");
    }
    this.iclnSize = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.iclnSize, [4, 0, 0, 0]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([4, 0, 0, 0], this.iclnSize, this._io, "/seq/44");
    }
    this.namedColorCount = this._io.readU4le();
    this.namedColors = new Array(this.namedColorCount);
    for (var i = 0; i < this.namedColorCount; i++) {
      this.namedColors[i] = new NamedColor(this._io, this, this._root);
    }
    this.adatSig = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.adatSig, [65, 68, 65, 84]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([65, 68, 65, 84], this.adatSig, this._io, "/seq/47");
    }
    this.animationCount = this._io.readU4le();
    this.animations = new Array(this.animationCount);
    for (var i = 0; i < this.animationCount; i++) {
      this.animations[i] = new Animation(this._io, this, this._root);
    }
    this.diffuse = this._io.readU4le();
    this.reflections = this._io.readU4le();
    this.specular = this._io.readU4le();
    this.bump = this._io.readU4le();
  }

  var Vertex16 = Serious1Mdl.Vertex16 = (function() {
    function Vertex16(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Vertex16.prototype._read = function() {
      this.rawX = this._io.readS2le();
      this.rawY = this._io.readS2le();
      this.rawZ = this._io.readS2le();
      this.normalH = this._io.readU1();
      this.normalB = this._io.readU1();
    }
    Object.defineProperty(Vertex16.prototype, 'x', {
      get: function() {
        if (this._m_x !== undefined)
          return this._m_x;
        this._m_x = ((this.rawX - this._root.compressedCenterX) * this._root.stretch.x);
        return this._m_x;
      }
    });
    Object.defineProperty(Vertex16.prototype, 'y', {
      get: function() {
        if (this._m_y !== undefined)
          return this._m_y;
        this._m_y = ((this.rawY - this._root.compressedCenterY) * this._root.stretch.y);
        return this._m_y;
      }
    });
    Object.defineProperty(Vertex16.prototype, 'z', {
      get: function() {
        if (this._m_z !== undefined)
          return this._m_z;
        this._m_z = ((this.rawZ - this._root.compressedCenterZ) * this._root.stretch.z);
        return this._m_z;
      }
    });

    return Vertex16;
  })();

  var ModelPolygonVertex = Serious1Mdl.ModelPolygonVertex = (function() {
    function ModelPolygonVertex(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ModelPolygonVertex.prototype._read = function() {
      this.transformedVertex = this._io.readS4le();
      this.textureVertex = this._io.readS4le();
    }

    return ModelPolygonVertex;
  })();

  var TextureVertex = Serious1Mdl.TextureVertex = (function() {
    function TextureVertex(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TextureVertex.prototype._read = function() {
      this.uvw = new Vector3f(this._io, this, this._root);
      this.uv = new Vector2l(this._io, this, this._root);
      this.flags = this._io.readU4le();
      this.transformedVertex = this._io.readU4le();
      this.vu = new Vector3f(this._io, this, this._root);
      this.vv = new Vector3f(this._io, this, this._root);
    }

    return TextureVertex;
  })();

  var CollisionBox = Serious1Mdl.CollisionBox = (function() {
    function CollisionBox(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    CollisionBox.prototype._read = function() {
      this.collisionBox = new BoundingBox(this._io, this, this._root);
      this.nameLen = this._io.readU4le();
      this.name = KaitaiStream.bytesToStr(this._io.readBytes(this.nameLen), "utf8");
    }

    return CollisionBox;
  })();

  var Vector3f = Serious1Mdl.Vector3f = (function() {
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

  var AvfxBlock = Serious1Mdl.AvfxBlock = (function() {
    function AvfxBlock(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    AvfxBlock.prototype._read = function() {
      this.sig = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.sig, [65, 70, 86, 88]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([65, 70, 86, 88], this.sig, this._io, "/types/avfx_block/seq/0");
      }
      this.size = this._io.readU4le();
      this.vertices = new Array(Math.floor(this.size / 4));
      for (var i = 0; i < Math.floor(this.size / 4); i++) {
        this.vertices[i] = new Vertex8(this._io, this, this._root);
      }
    }

    return AvfxBlock;
  })();

  var ModelPolygon = Serious1Mdl.ModelPolygon = (function() {
    function ModelPolygon(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ModelPolygon.prototype._read = function() {
      this.mdp2Sig = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.mdp2Sig, [77, 68, 80, 50]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([77, 68, 80, 50], this.mdp2Sig, this._io, "/types/model_polygon/seq/0");
      }
      this.vertexCount = this._io.readU4le();
      this.vertices = new Array(this.vertexCount);
      for (var i = 0; i < this.vertexCount; i++) {
        this.vertices[i] = new ModelPolygonVertex(this._io, this, this._root);
      }
      this.renderFlags = this._io.readU4le();
      this.colorAndAlpha = this._io.readU4le();
      this.surface = this._io.readS4le();
    }

    return ModelPolygon;
  })();

  var Vector2l = Serious1Mdl.Vector2l = (function() {
    function Vector2l(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Vector2l.prototype._read = function() {
      this.x = this._io.readS4le();
      this.y = this._io.readS4le();
    }

    return Vector2l;
  })();

  var NamedColor = Serious1Mdl.NamedColor = (function() {
    function NamedColor(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    NamedColor.prototype._read = function() {
      this.index = this._io.readU4le();
      this.nameLen = this._io.readU4le();
      this.name = KaitaiStream.bytesToStr(this._io.readBytes(this.nameLen), "utf8");
    }

    return NamedColor;
  })();

  var Av17Block = Serious1Mdl.Av17Block = (function() {
    function Av17Block(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Av17Block.prototype._read = function() {
      this.sig = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.sig, [65, 86, 49, 55]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([65, 86, 49, 55], this.sig, this._io, "/types/av17_block/seq/0");
      }
      this.size = this._io.readU4le();
      this.vertices = new Array(Math.floor(this.size / 8));
      for (var i = 0; i < Math.floor(this.size / 8); i++) {
        this.vertices[i] = new Vertex16(this._io, this, this._root);
      }
    }

    return Av17Block;
  })();

  var Placement = Serious1Mdl.Placement = (function() {
    function Placement(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Placement.prototype._read = function() {
      this.position = new Vector3f(this._io, this, this._root);
      this.angle = new Vector3f(this._io, this, this._root);
    }

    return Placement;
  })();

  var Animation = Serious1Mdl.Animation = (function() {
    function Animation(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Animation.prototype._read = function() {
      this.name = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(32), 0, false), "utf8");
      this.secsPerFrame = this._io.readF4le();
      this.frameCount = this._io.readU4le();
      this.frameIndices = new Array(this.frameCount);
      for (var i = 0; i < this.frameCount; i++) {
        this.frameIndices[i] = this._io.readU4le();
      }
    }

    return Animation;
  })();

  var ModelPatch = Serious1Mdl.ModelPatch = (function() {
    function ModelPatch(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ModelPatch.prototype._read = function() {
      this.nameLen = this._io.readU4le();
      this.name = KaitaiStream.bytesToStr(this._io.readBytes(this.nameLen), "utf8");
      this.dfnmSig = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.dfnmSig, [68, 70, 78, 77]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([68, 70, 78, 77], this.dfnmSig, this._io, "/types/model_patch/seq/2");
      }
      this.filenameLen = this._io.readU4le();
      this.filename = KaitaiStream.bytesToStr(this._io.readBytes(this.filenameLen), "utf8");
      this.position = new Vector2l(this._io, this, this._root);
      this.stretch = this._io.readF4le();
    }

    return ModelPatch;
  })();

  var AttachedPosition = Serious1Mdl.AttachedPosition = (function() {
    function AttachedPosition(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    AttachedPosition.prototype._read = function() {
      this.centerVertex = this._io.readU4le();
      this.frontVertex = this._io.readU4le();
      this.upVertex = this._io.readU4le();
      this.relativePlacement = new Placement(this._io, this, this._root);
    }

    return AttachedPosition;
  })();

  var PolygonPatch = Serious1Mdl.PolygonPatch = (function() {
    function PolygonPatch(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PolygonPatch.prototype._read = function() {
      this.occupiedCount = this._io.readU4le();
      if (this.occupiedCount > 0) {
        this.ocplSig = this._io.readBytes(4);
        if (!((KaitaiStream.byteArrayCompare(this.ocplSig, [79, 67, 80, 76]) == 0))) {
          throw new KaitaiStream.ValidationNotEqualError([79, 67, 80, 76], this.ocplSig, this._io, "/types/polygon_patch/seq/1");
        }
      }
      if (this.occupiedCount > 0) {
        this.ocplSize = this._io.readU4le();
      }
      this.occupied = new Array(this.occupiedCount);
      for (var i = 0; i < this.occupiedCount; i++) {
        this.occupied[i] = this._io.readU4le();
      }
    }

    return PolygonPatch;
  })();

  var BoundingBox = Serious1Mdl.BoundingBox = (function() {
    function BoundingBox(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    BoundingBox.prototype._read = function() {
      this.min = new Vector3f(this._io, this, this._root);
      this.max = new Vector3f(this._io, this, this._root);
    }

    return BoundingBox;
  })();

  var ModelMipInfo = Serious1Mdl.ModelMipInfo = (function() {
    function ModelMipInfo(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ModelMipInfo.prototype._read = function() {
      this.ipolSig = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.ipolSig, [73, 80, 79, 76]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([73, 80, 79, 76], this.ipolSig, this._io, "/types/model_mip_info/seq/0");
      }
      this.ipolSize = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.ipolSize, [4, 0, 0, 0]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([4, 0, 0, 0], this.ipolSize, this._io, "/types/model_mip_info/seq/1");
      }
      this.polygonCount = this._io.readU4le();
      this.polygons = new Array(this.polygonCount);
      for (var i = 0; i < this.polygonCount; i++) {
        this.polygons[i] = new ModelPolygon(this._io, this, this._root);
      }
      this.textureVertexCount = this._io.readU4le();
      this.txv2Sig = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.txv2Sig, [84, 88, 86, 50]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([84, 88, 86, 50], this.txv2Sig, this._io, "/types/model_mip_info/seq/5");
      }
      this.txv2Size = this._io.readU4le();
      this.textureVertices = new Array(this.textureVertexCount);
      for (var i = 0; i < this.textureVertexCount; i++) {
        this.textureVertices[i] = new TextureVertex(this._io, this, this._root);
      }
      this.mappingSurfaceCount = this._io.readU4le();
      this.mappingSurfaces = new Array(this.mappingSurfaceCount);
      for (var i = 0; i < this.mappingSurfaceCount; i++) {
        this.mappingSurfaces[i] = new MappingSurface(this._io, this, this._root);
      }
      this.flags = this._io.readU4le();
      this.patchCount = this._io.readU4le();
      this.patches = new Array(this.patchCount);
      for (var i = 0; i < this.patchCount; i++) {
        this.patches[i] = new PolygonPatch(this._io, this, this._root);
      }
    }

    return ModelMipInfo;
  })();

  var Vertex8 = Serious1Mdl.Vertex8 = (function() {
    function Vertex8(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Vertex8.prototype._read = function() {
      this.rawX = this._io.readS1();
      this.rawY = this._io.readS1();
      this.rawZ = this._io.readS1();
      this.normalIndex = this._io.readU1();
    }
    Object.defineProperty(Vertex8.prototype, 'x', {
      get: function() {
        if (this._m_x !== undefined)
          return this._m_x;
        this._m_x = ((this.rawX - this._root.compressedCenterX) * this._root.stretch.x);
        return this._m_x;
      }
    });
    Object.defineProperty(Vertex8.prototype, 'y', {
      get: function() {
        if (this._m_y !== undefined)
          return this._m_y;
        this._m_y = ((this.rawY - this._root.compressedCenterY) * this._root.stretch.y);
        return this._m_y;
      }
    });
    Object.defineProperty(Vertex8.prototype, 'z', {
      get: function() {
        if (this._m_z !== undefined)
          return this._m_z;
        this._m_z = ((this.rawZ - this._root.compressedCenterZ) * this._root.stretch.z);
        return this._m_z;
      }
    });

    return Vertex8;
  })();

  var MappingSurface = Serious1Mdl.MappingSurface = (function() {
    function MappingSurface(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    MappingSurface.prototype._read = function() {
      this.nameLen = this._io.readU4le();
      this.name = KaitaiStream.bytesToStr(this._io.readBytes(this.nameLen), "utf8");
      this.surface2dOffset = new Vector3f(this._io, this, this._root);
      this.hpb = new Vector3f(this._io, this, this._root);
      this.zoom = this._io.readF4le();
      this.surfaceShadingType = this._io.readU4le();
      this.surfaceTranslucencyType = this._io.readU4le();
      this.renderFlags = this._io.readU4le();
      this.polygonCount = this._io.readU4le();
      this.polygons = new Array(this.polygonCount);
      for (var i = 0; i < this.polygonCount; i++) {
        this.polygons[i] = this._io.readU4le();
      }
      this.textureVertexCount = this._io.readU4le();
      this.textureVertices = new Array(this.textureVertexCount);
      for (var i = 0; i < this.textureVertexCount; i++) {
        this.textureVertices[i] = this._io.readU4le();
      }
      this.color = this._io.readU4le();
      this.diffuse = this._io.readU4le();
      this.reflections = this._io.readU4le();
      this.specular = this._io.readU4le();
      this.bump = this._io.readU4le();
      this.on = this._io.readU4le();
      this.off = this._io.readU4le();
    }

    return MappingSurface;
  })();
  Object.defineProperty(Serious1Mdl.prototype, 'maxMips', {
    get: function() {
      if (this._m_maxMips !== undefined)
        return this._m_maxMips;
      this._m_maxMips = 32;
      return this._m_maxMips;
    }
  });
  Object.defineProperty(Serious1Mdl.prototype, 'compressedCenterX', {
    get: function() {
      if (this._m_compressedCenterX !== undefined)
        return this._m_compressedCenterX;
      this._m_compressedCenterX = (-(this.center.x) / this.stretch.x);
      return this._m_compressedCenterX;
    }
  });
  Object.defineProperty(Serious1Mdl.prototype, 'compressedCenterZ', {
    get: function() {
      if (this._m_compressedCenterZ !== undefined)
        return this._m_compressedCenterZ;
      this._m_compressedCenterZ = (-(this.center.z) / this.stretch.z);
      return this._m_compressedCenterZ;
    }
  });
  Object.defineProperty(Serious1Mdl.prototype, 'compressed16Bit', {
    get: function() {
      if (this._m_compressed16Bit !== undefined)
        return this._m_compressed16Bit;
      this._m_compressed16Bit = (this.flags & (1 << 4)) != 0;
      return this._m_compressed16Bit;
    }
  });
  Object.defineProperty(Serious1Mdl.prototype, 'compressedCenterY', {
    get: function() {
      if (this._m_compressedCenterY !== undefined)
        return this._m_compressedCenterY;
      this._m_compressedCenterY = (-(this.center.y) / this.stretch.y);
      return this._m_compressedCenterY;
    }
  });
  Object.defineProperty(Serious1Mdl.prototype, 'maxPatches', {
    get: function() {
      if (this._m_maxPatches !== undefined)
        return this._m_maxPatches;
      this._m_maxPatches = 32;
      return this._m_maxPatches;
    }
  });

export default Serious1Mdl
