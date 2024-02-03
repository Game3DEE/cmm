import { KaitaiStream } from "kaitai-struct"

    function P3d(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
  
      this._read();
    }
    P3d.prototype._read = function() {
      this.val1 = this._io.readU4le();
      this.numMeshes = this._io.readU4le();
      this.meshes = [];
      for (var i = 0; i < this.numMeshes; i++) {
        this.meshes.push(new Mesh(this._io, this, this._root));
      }
      this.numNodes = this._io.readU4le();
      this.nodes = [];
      for (var i = 0; i < this.numNodes; i++) {
        this.nodes.push(new Node(this._io, this, this._root));
      }
    }
  
    var Mesh = P3d.Mesh = (function() {
      function Mesh(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Mesh.prototype._read = function() {
        this.val3 = this._io.readU4le();
        this.name = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(16), 0, false), "utf8");
        this.data = this._io.readBytes(324);
        this.numVertices = this._io.readU4le();
        this.vertices = [];
        for (var i = 0; i < this.numVertices; i++) {
          this.vertices.push(new Vertex(this._io, this, this._root));
        }
        this.numIndices = this._io.readU4le();
        this.indices = [];
        for (var i = 0; i < this.numIndices; i++) {
          this.indices.push(this._io.readU2le());
        }
        this.count = this._io.readU4le();
        this.data2 = [];
        for (var i = 0; i < this.count; i++) {
          this.data2.push(this._io.readBytes(52));
        }
        this.numChildren = this._io.readU4le();
        this.children = [];
        for (var i = 0; i < this.numChildren; i++) {
          this.children.push(new Mesh(this._io, this, this._root));
        }
      }
  
      return Mesh;
    })();
  
    var Node = P3d.Node = (function() {
      function Node(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Node.prototype._read = function() {
        this.lenName = this._io.readU4le();
        this.name = KaitaiStream.bytesToStr(this._io.readBytes(this.lenName), "utf8");
        this.float1 = this._io.readF4le();
        this.val2 = this._io.readU4le();
        this.val3 = this._io.readU4le();
        this.float4 = this._io.readF4le();
        this.val5 = this._io.readU4le();
        this.float2 = this._io.readF4le();
        this.val7 = this._io.readU4le();
        this.float8 = this._io.readF4le();
        this.val9 = this._io.readU4le();
        this.val10 = this._io.readU4le();
        this.float3 = this._io.readF4le();
        this.float12 = this._io.readF4le();
      }
  
      return Node;
    })();
  
    var Vertex = P3d.Vertex = (function() {
      function Vertex(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
  
        this._read();
      }
      Vertex.prototype._read = function() {
        this.float1 = this._io.readF4le();
        this.float2 = this._io.readF4le();
        this.float3 = this._io.readF4le();
        this.float4 = this._io.readF4le();
        this.float5 = this._io.readF4le();
        this.float6 = this._io.readF4le();
        this.val7 = this._io.readU4le();
        this.float8 = this._io.readF4le();
        this.float9 = this._io.readF4le();
        this.float10 = this._io.readF4le();
        this.float11 = this._io.readF4le();
        this.float12 = this._io.readF4le();
      }
  
      return Vertex;
    })();
  
  export default P3d;
