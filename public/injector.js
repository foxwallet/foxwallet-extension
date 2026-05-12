var fa = Object.defineProperty;
var Ta = (s, e, t) => e in s ? fa(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var _e = (s, e, t) => (Ta(s, typeof e != "symbol" ? e + "" : e, t), t), Sn = (s, e, t) => {
  if (!e.has(s))
    throw TypeError("Cannot " + t);
};
var xe = (s, e, t) => (Sn(s, e, "read from private field"), t ? t.call(s) : e.get(s)), _t = (s, e, t) => {
  if (e.has(s))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(s) : e.set(s, t);
}, Fe = (s, e, t, n) => (Sn(s, e, "write to private field"), n ? n.call(s, t) : e.set(s, t), t);
const ba = "fox_dapp_request", ha = "fox_dapp_response", ga = "fox_dapp_emit";
function Ma(s) {
  return { all: s = s || /* @__PURE__ */ new Map(), on: function(e, t) {
    var n = s.get(e);
    n ? n.push(t) : s.set(e, [t]);
  }, off: function(e, t) {
    var n = s.get(e);
    n && (t ? n.splice(n.indexOf(t) >>> 0, 1) : s.set(e, []));
  }, emit: function(e, t) {
    var n = s.get(e);
    n && n.slice().map(function(d) {
      d(t);
    }), (n = s.get("*")) && n.slice().map(function(d) {
      d(e, t);
    });
  } };
}
const wa = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let _a = (s = 21) => {
  let e = "", t = crypto.getRandomValues(new Uint8Array(s |= 0));
  for (; s--; )
    e += wa[t[s] & 63];
  return e;
};
var Lt, Pe, bt;
class vn {
  // coin type
  constructor() {
    _t(this, Lt, void 0);
    _t(this, Pe, void 0);
    _t(this, bt, void 0);
    _e(this, "chain");
    _e(this, "onMessage", (e) => {
      const { id: t, error: n, data: d } = e.detail, y = xe(this, bt).get(t);
      y && (y(n, d), xe(this, bt).delete(t));
    });
    _e(this, "on", (e, t) => (xe(this, Pe).on(e, t), () => xe(this, Pe).off(e, t)));
    _e(this, "removeListener", (e, t) => {
      xe(this, Pe).off(e, t);
    });
    _e(this, "off", (e, t) => {
      xe(this, Pe).off(e, t);
    });
    _e(this, "removeAllListeners", () => {
      xe(this, Pe).all.clear();
    });
    Fe(this, Lt, !0), Fe(this, Pe, Ma()), Fe(this, bt, /* @__PURE__ */ new Map()), this.emit = this.emit.bind(this), window.addEventListener(ha, this.onMessage), this.onDappEmit = this.onDappEmit.bind(this), window.addEventListener(ga, this.onDappEmit);
  }
  onDappEmit(e) {
  }
  send(e, t, n = {}) {
    return new Promise((d, y) => {
      const T = _a(), _ = new CustomEvent(
        ba,
        {
          detail: {
            id: T,
            coinType: this.chain,
            method: e,
            payload: t,
            metadata: n
          }
        }
      ), x = (E, N) => {
        E ? y(E) : d(N);
      };
      xe(this, bt).set(T, x), window.dispatchEvent(_);
    });
  }
  get isFoxWallet() {
    return xe(this, Lt);
  }
  emit(e, t) {
    xe(this, Pe).emit(e, t);
  }
}
Lt = new WeakMap(), Pe = new WeakMap(), bt = new WeakMap();
function ka(s) {
  return Array.from(s).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var ht = /* @__PURE__ */ ((s) => (s.ETH = "ETH", s.ALEO = "ALEO", s.QTUM = "QTUM", s))(ht || {});
Object.values(ht);
var ze, qe;
class va extends vn {
  constructor() {
    super();
    _e(this, "chain", ht.ALEO);
    _t(this, ze, void 0);
    _t(this, qe, void 0);
    _e(this, "_readyState");
    Fe(this, ze, null), Fe(this, qe, null), this._readyState = "Installed";
  }
  get publicKey() {
    return xe(this, ze);
  }
  get network() {
    return xe(this, qe);
  }
  get readyState() {
    return this._readyState;
  }
  convertNetworkToChainId(t) {
    switch (t) {
      case "testnetbeta":
        return "testnet";
      case "mainnetbeta":
        return "mainnet";
      case "mainnet":
        return "mainnet";
      default:
        throw new Error("Unsupport network " + t);
    }
  }
  async connect(t, n, d) {
    const y = this.convertNetworkToChainId(n), T = await this.send("connect", {
      decryptPermission: t,
      network: y,
      programs: d
    });
    return Fe(this, ze, T || null), Fe(this, qe, n), !!T;
  }
  async disconnect() {
    if (!xe(this, ze) || !this.network)
      throw new Error("Connect before disconnect");
    const t = await this.send("disconnect", {});
    return Fe(this, ze, null), Fe(this, qe, null), t;
  }
  async decrypt(t, n, d, y, T) {
    return await this.send("decrypt", {
      cipherText: t,
      tpk: n,
      programId: d,
      functionName: y,
      index: T
    });
  }
  async requestRecords(t) {
    return await this.send("requestRecords", { program: t });
  }
  async requestTransaction(t) {
    return await this.send("requestTransaction", { transaction: t });
  }
  async requestExecution(t) {
    return await this.send("requestExecution", { transaction: t });
  }
  async requestBulkTransactions(t) {
    return await this.send("requestBulkTransactions", { transactions: t });
  }
  async requestDeploy(t) {
    return await this.send("requestDeploy", { deployment: t });
  }
  async transactionStatus(t) {
    return await this.send("transactionStatus", { transactionId: t });
  }
  async getExecution(t) {
    return await this.send("getExecution", { transactionId: t });
  }
  async requestRecordPlaintexts(t) {
    return await this.send("requestRecordPlaintexts", { program: t });
  }
  async requestTransactionHistory(t) {
    return await this.send("requestTransactionHistory", { program: t });
  }
  async signMessage(t) {
    const n = ka(t), d = await this.send("signMessage", {
      message: n
    });
    if (!d)
      throw new Error("sign message failed");
    return { signature: new TextEncoder().encode(d.signature) };
  }
  send(t, n) {
    return super.send(t, n, {
      address: xe(this, ze),
      network: xe(this, qe) ? this.convertNetworkToChainId(xe(this, qe)) : ""
    });
  }
}
ze = new WeakMap(), qe = new WeakMap();
const Ia = {
  DEFAULT_GAS_LIMIT: 21e3,
  TOKEN_TRANSFER_TOPIC: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  MAX_SAFE_CHAIN_ID: 4503599627370476
};
var $n = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Qn(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
function xa(s) {
  if (s.__esModule)
    return s;
  var e = s.default;
  if (typeof e == "function") {
    var t = function n() {
      return this instanceof n ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else
    t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(s).forEach(function(n) {
    var d = Object.getOwnPropertyDescriptor(s, n);
    Object.defineProperty(t, n, d.get ? d : {
      enumerable: !0,
      get: function() {
        return s[n];
      }
    });
  }), t;
}
var In = { exports: {} };
const Aa = {}, Ea = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Aa
}, Symbol.toStringTag, { value: "Module" })), Ca = /* @__PURE__ */ xa(Ea);
In.exports;
(function(s) {
  (function(e, t) {
    function n(f, a) {
      if (!f)
        throw new Error(a || "Assertion failed");
    }
    function d(f, a) {
      f.super_ = a;
      var r = function() {
      };
      r.prototype = a.prototype, f.prototype = new r(), f.prototype.constructor = f;
    }
    function y(f, a, r) {
      if (y.isBN(f))
        return f;
      this.negative = 0, this.words = null, this.length = 0, this.red = null, f !== null && ((a === "le" || a === "be") && (r = a, a = 10), this._init(f || 0, a || 10, r || "be"));
    }
    typeof e == "object" ? e.exports = y : t.BN = y, y.BN = y, y.wordSize = 26;
    var T;
    try {
      typeof window < "u" && typeof window.Buffer < "u" ? T = window.Buffer : T = Ca.Buffer;
    } catch {
    }
    y.isBN = function(a) {
      return a instanceof y ? !0 : a !== null && typeof a == "object" && a.constructor.wordSize === y.wordSize && Array.isArray(a.words);
    }, y.max = function(a, r) {
      return a.cmp(r) > 0 ? a : r;
    }, y.min = function(a, r) {
      return a.cmp(r) < 0 ? a : r;
    }, y.prototype._init = function(a, r, u) {
      if (typeof a == "number")
        return this._initNumber(a, r, u);
      if (typeof a == "object")
        return this._initArray(a, r, u);
      r === "hex" && (r = 16), n(r === (r | 0) && r >= 2 && r <= 36), a = a.toString().replace(/\s+/g, "");
      var l = 0;
      a[0] === "-" && (l++, this.negative = 1), l < a.length && (r === 16 ? this._parseHex(a, l, u) : (this._parseBase(a, r, l), u === "le" && this._initArray(this.toArray(), r, u)));
    }, y.prototype._initNumber = function(a, r, u) {
      a < 0 && (this.negative = 1, a = -a), a < 67108864 ? (this.words = [a & 67108863], this.length = 1) : a < 4503599627370496 ? (this.words = [
        a & 67108863,
        a / 67108864 & 67108863
      ], this.length = 2) : (n(a < 9007199254740992), this.words = [
        a & 67108863,
        a / 67108864 & 67108863,
        1
      ], this.length = 3), u === "le" && this._initArray(this.toArray(), r, u);
    }, y.prototype._initArray = function(a, r, u) {
      if (n(typeof a.length == "number"), a.length <= 0)
        return this.words = [0], this.length = 1, this;
      this.length = Math.ceil(a.length / 3), this.words = new Array(this.length);
      for (var l = 0; l < this.length; l++)
        this.words[l] = 0;
      var c, b, h = 0;
      if (u === "be")
        for (l = a.length - 1, c = 0; l >= 0; l -= 3)
          b = a[l] | a[l - 1] << 8 | a[l - 2] << 16, this.words[c] |= b << h & 67108863, this.words[c + 1] = b >>> 26 - h & 67108863, h += 24, h >= 26 && (h -= 26, c++);
      else if (u === "le")
        for (l = 0, c = 0; l < a.length; l += 3)
          b = a[l] | a[l + 1] << 8 | a[l + 2] << 16, this.words[c] |= b << h & 67108863, this.words[c + 1] = b >>> 26 - h & 67108863, h += 24, h >= 26 && (h -= 26, c++);
      return this._strip();
    };
    function _(f, a) {
      var r = f.charCodeAt(a);
      if (r >= 48 && r <= 57)
        return r - 48;
      if (r >= 65 && r <= 70)
        return r - 55;
      if (r >= 97 && r <= 102)
        return r - 87;
      n(!1, "Invalid character in " + f);
    }
    function x(f, a, r) {
      var u = _(f, r);
      return r - 1 >= a && (u |= _(f, r - 1) << 4), u;
    }
    y.prototype._parseHex = function(a, r, u) {
      this.length = Math.ceil((a.length - r) / 6), this.words = new Array(this.length);
      for (var l = 0; l < this.length; l++)
        this.words[l] = 0;
      var c = 0, b = 0, h;
      if (u === "be")
        for (l = a.length - 1; l >= r; l -= 2)
          h = x(a, r, l) << c, this.words[b] |= h & 67108863, c >= 18 ? (c -= 18, b += 1, this.words[b] |= h >>> 26) : c += 8;
      else {
        var o = a.length - r;
        for (l = o % 2 === 0 ? r + 1 : r; l < a.length; l += 2)
          h = x(a, r, l) << c, this.words[b] |= h & 67108863, c >= 18 ? (c -= 18, b += 1, this.words[b] |= h >>> 26) : c += 8;
      }
      this._strip();
    };
    function E(f, a, r, u) {
      for (var l = 0, c = 0, b = Math.min(f.length, r), h = a; h < b; h++) {
        var o = f.charCodeAt(h) - 48;
        l *= u, o >= 49 ? c = o - 49 + 10 : o >= 17 ? c = o - 17 + 10 : c = o, n(o >= 0 && c < u, "Invalid character"), l += c;
      }
      return l;
    }
    y.prototype._parseBase = function(a, r, u) {
      this.words = [0], this.length = 1;
      for (var l = 0, c = 1; c <= 67108863; c *= r)
        l++;
      l--, c = c / r | 0;
      for (var b = a.length - u, h = b % l, o = Math.min(b, b - h) + u, i = 0, m = u; m < o; m += l)
        i = E(a, m, m + l, r), this.imuln(c), this.words[0] + i < 67108864 ? this.words[0] += i : this._iaddn(i);
      if (h !== 0) {
        var S = 1;
        for (i = E(a, m, a.length, r), m = 0; m < h; m++)
          S *= r;
        this.imuln(S), this.words[0] + i < 67108864 ? this.words[0] += i : this._iaddn(i);
      }
      this._strip();
    }, y.prototype.copy = function(a) {
      a.words = new Array(this.length);
      for (var r = 0; r < this.length; r++)
        a.words[r] = this.words[r];
      a.length = this.length, a.negative = this.negative, a.red = this.red;
    };
    function N(f, a) {
      f.words = a.words, f.length = a.length, f.negative = a.negative, f.red = a.red;
    }
    if (y.prototype._move = function(a) {
      N(a, this);
    }, y.prototype.clone = function() {
      var a = new y(null);
      return this.copy(a), a;
    }, y.prototype._expand = function(a) {
      for (; this.length < a; )
        this.words[this.length++] = 0;
      return this;
    }, y.prototype._strip = function() {
      for (; this.length > 1 && this.words[this.length - 1] === 0; )
        this.length--;
      return this._normSign();
    }, y.prototype._normSign = function() {
      return this.length === 1 && this.words[0] === 0 && (this.negative = 0), this;
    }, typeof Symbol < "u" && typeof Symbol.for == "function")
      try {
        y.prototype[Symbol.for("nodejs.util.inspect.custom")] = B;
      } catch {
        y.prototype.inspect = B;
      }
    else
      y.prototype.inspect = B;
    function B() {
      return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
    }
    var L = [
      "",
      "0",
      "00",
      "000",
      "0000",
      "00000",
      "000000",
      "0000000",
      "00000000",
      "000000000",
      "0000000000",
      "00000000000",
      "000000000000",
      "0000000000000",
      "00000000000000",
      "000000000000000",
      "0000000000000000",
      "00000000000000000",
      "000000000000000000",
      "0000000000000000000",
      "00000000000000000000",
      "000000000000000000000",
      "0000000000000000000000",
      "00000000000000000000000",
      "000000000000000000000000",
      "0000000000000000000000000"
    ], ve = [
      0,
      0,
      25,
      16,
      12,
      11,
      10,
      9,
      8,
      8,
      7,
      7,
      7,
      7,
      6,
      6,
      6,
      6,
      6,
      6,
      6,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5
    ], we = [
      0,
      0,
      33554432,
      43046721,
      16777216,
      48828125,
      60466176,
      40353607,
      16777216,
      43046721,
      1e7,
      19487171,
      35831808,
      62748517,
      7529536,
      11390625,
      16777216,
      24137569,
      34012224,
      47045881,
      64e6,
      4084101,
      5153632,
      6436343,
      7962624,
      9765625,
      11881376,
      14348907,
      17210368,
      20511149,
      243e5,
      28629151,
      33554432,
      39135393,
      45435424,
      52521875,
      60466176
    ];
    y.prototype.toString = function(a, r) {
      a = a || 10, r = r | 0 || 1;
      var u;
      if (a === 16 || a === "hex") {
        u = "";
        for (var l = 0, c = 0, b = 0; b < this.length; b++) {
          var h = this.words[b], o = ((h << l | c) & 16777215).toString(16);
          c = h >>> 24 - l & 16777215, l += 2, l >= 26 && (l -= 26, b--), c !== 0 || b !== this.length - 1 ? u = L[6 - o.length] + o + u : u = o + u;
        }
        for (c !== 0 && (u = c.toString(16) + u); u.length % r !== 0; )
          u = "0" + u;
        return this.negative !== 0 && (u = "-" + u), u;
      }
      if (a === (a | 0) && a >= 2 && a <= 36) {
        var i = ve[a], m = we[a];
        u = "";
        var S = this.clone();
        for (S.negative = 0; !S.isZero(); ) {
          var p = S.modrn(m).toString(a);
          S = S.idivn(m), S.isZero() ? u = p + u : u = L[i - p.length] + p + u;
        }
        for (this.isZero() && (u = "0" + u); u.length % r !== 0; )
          u = "0" + u;
        return this.negative !== 0 && (u = "-" + u), u;
      }
      n(!1, "Base should be between 2 and 36");
    }, y.prototype.toNumber = function() {
      var a = this.words[0];
      return this.length === 2 ? a += this.words[1] * 67108864 : this.length === 3 && this.words[2] === 1 ? a += 4503599627370496 + this.words[1] * 67108864 : this.length > 2 && n(!1, "Number can only safely store up to 53 bits"), this.negative !== 0 ? -a : a;
    }, y.prototype.toJSON = function() {
      return this.toString(16, 2);
    }, T && (y.prototype.toBuffer = function(a, r) {
      return this.toArrayLike(T, a, r);
    }), y.prototype.toArray = function(a, r) {
      return this.toArrayLike(Array, a, r);
    };
    var Ut = function(a, r) {
      return a.allocUnsafe ? a.allocUnsafe(r) : new a(r);
    };
    y.prototype.toArrayLike = function(a, r, u) {
      this._strip();
      var l = this.byteLength(), c = u || Math.max(1, l);
      n(l <= c, "byte array longer than desired length"), n(c > 0, "Requested array length <= 0");
      var b = Ut(a, c), h = r === "le" ? "LE" : "BE";
      return this["_toArrayLike" + h](b, l), b;
    }, y.prototype._toArrayLikeLE = function(a, r) {
      for (var u = 0, l = 0, c = 0, b = 0; c < this.length; c++) {
        var h = this.words[c] << b | l;
        a[u++] = h & 255, u < a.length && (a[u++] = h >> 8 & 255), u < a.length && (a[u++] = h >> 16 & 255), b === 6 ? (u < a.length && (a[u++] = h >> 24 & 255), l = 0, b = 0) : (l = h >>> 24, b += 2);
      }
      if (u < a.length)
        for (a[u++] = l; u < a.length; )
          a[u++] = 0;
    }, y.prototype._toArrayLikeBE = function(a, r) {
      for (var u = a.length - 1, l = 0, c = 0, b = 0; c < this.length; c++) {
        var h = this.words[c] << b | l;
        a[u--] = h & 255, u >= 0 && (a[u--] = h >> 8 & 255), u >= 0 && (a[u--] = h >> 16 & 255), b === 6 ? (u >= 0 && (a[u--] = h >> 24 & 255), l = 0, b = 0) : (l = h >>> 24, b += 2);
      }
      if (u >= 0)
        for (a[u--] = l; u >= 0; )
          a[u--] = 0;
    }, Math.clz32 ? y.prototype._countBits = function(a) {
      return 32 - Math.clz32(a);
    } : y.prototype._countBits = function(a) {
      var r = a, u = 0;
      return r >= 4096 && (u += 13, r >>>= 13), r >= 64 && (u += 7, r >>>= 7), r >= 8 && (u += 4, r >>>= 4), r >= 2 && (u += 2, r >>>= 2), u + r;
    }, y.prototype._zeroBits = function(a) {
      if (a === 0)
        return 26;
      var r = a, u = 0;
      return r & 8191 || (u += 13, r >>>= 13), r & 127 || (u += 7, r >>>= 7), r & 15 || (u += 4, r >>>= 4), r & 3 || (u += 2, r >>>= 2), r & 1 || u++, u;
    }, y.prototype.bitLength = function() {
      var a = this.words[this.length - 1], r = this._countBits(a);
      return (this.length - 1) * 26 + r;
    };
    function Vt(f) {
      for (var a = new Array(f.bitLength()), r = 0; r < a.length; r++) {
        var u = r / 26 | 0, l = r % 26;
        a[r] = f.words[u] >>> l & 1;
      }
      return a;
    }
    y.prototype.zeroBits = function() {
      if (this.isZero())
        return 0;
      for (var a = 0, r = 0; r < this.length; r++) {
        var u = this._zeroBits(this.words[r]);
        if (a += u, u !== 26)
          break;
      }
      return a;
    }, y.prototype.byteLength = function() {
      return Math.ceil(this.bitLength() / 8);
    }, y.prototype.toTwos = function(a) {
      return this.negative !== 0 ? this.abs().inotn(a).iaddn(1) : this.clone();
    }, y.prototype.fromTwos = function(a) {
      return this.testn(a - 1) ? this.notn(a).iaddn(1).ineg() : this.clone();
    }, y.prototype.isNeg = function() {
      return this.negative !== 0;
    }, y.prototype.neg = function() {
      return this.clone().ineg();
    }, y.prototype.ineg = function() {
      return this.isZero() || (this.negative ^= 1), this;
    }, y.prototype.iuor = function(a) {
      for (; this.length < a.length; )
        this.words[this.length++] = 0;
      for (var r = 0; r < a.length; r++)
        this.words[r] = this.words[r] | a.words[r];
      return this._strip();
    }, y.prototype.ior = function(a) {
      return n((this.negative | a.negative) === 0), this.iuor(a);
    }, y.prototype.or = function(a) {
      return this.length > a.length ? this.clone().ior(a) : a.clone().ior(this);
    }, y.prototype.uor = function(a) {
      return this.length > a.length ? this.clone().iuor(a) : a.clone().iuor(this);
    }, y.prototype.iuand = function(a) {
      var r;
      this.length > a.length ? r = a : r = this;
      for (var u = 0; u < r.length; u++)
        this.words[u] = this.words[u] & a.words[u];
      return this.length = r.length, this._strip();
    }, y.prototype.iand = function(a) {
      return n((this.negative | a.negative) === 0), this.iuand(a);
    }, y.prototype.and = function(a) {
      return this.length > a.length ? this.clone().iand(a) : a.clone().iand(this);
    }, y.prototype.uand = function(a) {
      return this.length > a.length ? this.clone().iuand(a) : a.clone().iuand(this);
    }, y.prototype.iuxor = function(a) {
      var r, u;
      this.length > a.length ? (r = this, u = a) : (r = a, u = this);
      for (var l = 0; l < u.length; l++)
        this.words[l] = r.words[l] ^ u.words[l];
      if (this !== r)
        for (; l < r.length; l++)
          this.words[l] = r.words[l];
      return this.length = r.length, this._strip();
    }, y.prototype.ixor = function(a) {
      return n((this.negative | a.negative) === 0), this.iuxor(a);
    }, y.prototype.xor = function(a) {
      return this.length > a.length ? this.clone().ixor(a) : a.clone().ixor(this);
    }, y.prototype.uxor = function(a) {
      return this.length > a.length ? this.clone().iuxor(a) : a.clone().iuxor(this);
    }, y.prototype.inotn = function(a) {
      n(typeof a == "number" && a >= 0);
      var r = Math.ceil(a / 26) | 0, u = a % 26;
      this._expand(r), u > 0 && r--;
      for (var l = 0; l < r; l++)
        this.words[l] = ~this.words[l] & 67108863;
      return u > 0 && (this.words[l] = ~this.words[l] & 67108863 >> 26 - u), this._strip();
    }, y.prototype.notn = function(a) {
      return this.clone().inotn(a);
    }, y.prototype.setn = function(a, r) {
      n(typeof a == "number" && a >= 0);
      var u = a / 26 | 0, l = a % 26;
      return this._expand(u + 1), r ? this.words[u] = this.words[u] | 1 << l : this.words[u] = this.words[u] & ~(1 << l), this._strip();
    }, y.prototype.iadd = function(a) {
      var r;
      if (this.negative !== 0 && a.negative === 0)
        return this.negative = 0, r = this.isub(a), this.negative ^= 1, this._normSign();
      if (this.negative === 0 && a.negative !== 0)
        return a.negative = 0, r = this.isub(a), a.negative = 1, r._normSign();
      var u, l;
      this.length > a.length ? (u = this, l = a) : (u = a, l = this);
      for (var c = 0, b = 0; b < l.length; b++)
        r = (u.words[b] | 0) + (l.words[b] | 0) + c, this.words[b] = r & 67108863, c = r >>> 26;
      for (; c !== 0 && b < u.length; b++)
        r = (u.words[b] | 0) + c, this.words[b] = r & 67108863, c = r >>> 26;
      if (this.length = u.length, c !== 0)
        this.words[this.length] = c, this.length++;
      else if (u !== this)
        for (; b < u.length; b++)
          this.words[b] = u.words[b];
      return this;
    }, y.prototype.add = function(a) {
      var r;
      return a.negative !== 0 && this.negative === 0 ? (a.negative = 0, r = this.sub(a), a.negative ^= 1, r) : a.negative === 0 && this.negative !== 0 ? (this.negative = 0, r = a.sub(this), this.negative = 1, r) : this.length > a.length ? this.clone().iadd(a) : a.clone().iadd(this);
    }, y.prototype.isub = function(a) {
      if (a.negative !== 0) {
        a.negative = 0;
        var r = this.iadd(a);
        return a.negative = 1, r._normSign();
      } else if (this.negative !== 0)
        return this.negative = 0, this.iadd(a), this.negative = 1, this._normSign();
      var u = this.cmp(a);
      if (u === 0)
        return this.negative = 0, this.length = 1, this.words[0] = 0, this;
      var l, c;
      u > 0 ? (l = this, c = a) : (l = a, c = this);
      for (var b = 0, h = 0; h < c.length; h++)
        r = (l.words[h] | 0) - (c.words[h] | 0) + b, b = r >> 26, this.words[h] = r & 67108863;
      for (; b !== 0 && h < l.length; h++)
        r = (l.words[h] | 0) + b, b = r >> 26, this.words[h] = r & 67108863;
      if (b === 0 && h < l.length && l !== this)
        for (; h < l.length; h++)
          this.words[h] = l.words[h];
      return this.length = Math.max(this.length, h), l !== this && (this.negative = 1), this._strip();
    }, y.prototype.sub = function(a) {
      return this.clone().isub(a);
    };
    function Mt(f, a, r) {
      r.negative = a.negative ^ f.negative;
      var u = f.length + a.length | 0;
      r.length = u, u = u - 1 | 0;
      var l = f.words[0] | 0, c = a.words[0] | 0, b = l * c, h = b & 67108863, o = b / 67108864 | 0;
      r.words[0] = h;
      for (var i = 1; i < u; i++) {
        for (var m = o >>> 26, S = o & 67108863, p = Math.min(i, a.length - 1), g = Math.max(0, i - f.length + 1); g <= p; g++) {
          var M = i - g | 0;
          l = f.words[M] | 0, c = a.words[g] | 0, b = l * c + S, m += b / 67108864 | 0, S = b & 67108863;
        }
        r.words[i] = S | 0, o = m | 0;
      }
      return o !== 0 ? r.words[i] = o | 0 : r.length--, r._strip();
    }
    var xt = function(a, r, u) {
      var l = a.words, c = r.words, b = u.words, h = 0, o, i, m, S = l[0] | 0, p = S & 8191, g = S >>> 13, M = l[1] | 0, w = M & 8191, k = M >>> 13, C = l[2] | 0, I = C & 8191, v = C >>> 13, ge = l[3] | 0, A = ge & 8191, R = ge >>> 13, tt = l[4] | 0, U = tt & 8191, V = tt >>> 13, nt = l[5] | 0, z = nt & 8191, q = nt >>> 13, at = l[6] | 0, H = at & 8191, j = at >>> 13, it = l[7] | 0, W = it & 8191, G = it >>> 13, st = l[8] | 0, K = st & 8191, Z = st >>> 13, rt = l[9] | 0, $ = rt & 8191, Q = rt >>> 13, pt = c[0] | 0, J = pt & 8191, X = pt >>> 13, yt = c[1] | 0, Y = yt & 8191, ee = yt >>> 13, ut = c[2] | 0, te = ut & 8191, ne = ut >>> 13, ot = c[3] | 0, ae = ot & 8191, ie = ot >>> 13, lt = c[4] | 0, se = lt & 8191, re = lt >>> 13, mt = c[5] | 0, pe = mt & 8191, ye = mt >>> 13, dt = c[6] | 0, ue = dt & 8191, oe = dt >>> 13, ct = c[7] | 0, le = ct & 8191, me = ct >>> 13, ft = c[8] | 0, de = ft & 8191, ce = ft >>> 13, Tt = c[9] | 0, fe = Tt & 8191, Te = Tt >>> 13;
      u.negative = a.negative ^ r.negative, u.length = 19, o = Math.imul(p, J), i = Math.imul(p, X), i = i + Math.imul(g, J) | 0, m = Math.imul(g, X);
      var Ke = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (Ke >>> 26) | 0, Ke &= 67108863, o = Math.imul(w, J), i = Math.imul(w, X), i = i + Math.imul(k, J) | 0, m = Math.imul(k, X), o = o + Math.imul(p, Y) | 0, i = i + Math.imul(p, ee) | 0, i = i + Math.imul(g, Y) | 0, m = m + Math.imul(g, ee) | 0;
      var Ze = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (Ze >>> 26) | 0, Ze &= 67108863, o = Math.imul(I, J), i = Math.imul(I, X), i = i + Math.imul(v, J) | 0, m = Math.imul(v, X), o = o + Math.imul(w, Y) | 0, i = i + Math.imul(w, ee) | 0, i = i + Math.imul(k, Y) | 0, m = m + Math.imul(k, ee) | 0, o = o + Math.imul(p, te) | 0, i = i + Math.imul(p, ne) | 0, i = i + Math.imul(g, te) | 0, m = m + Math.imul(g, ne) | 0;
      var $e = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + ($e >>> 26) | 0, $e &= 67108863, o = Math.imul(A, J), i = Math.imul(A, X), i = i + Math.imul(R, J) | 0, m = Math.imul(R, X), o = o + Math.imul(I, Y) | 0, i = i + Math.imul(I, ee) | 0, i = i + Math.imul(v, Y) | 0, m = m + Math.imul(v, ee) | 0, o = o + Math.imul(w, te) | 0, i = i + Math.imul(w, ne) | 0, i = i + Math.imul(k, te) | 0, m = m + Math.imul(k, ne) | 0, o = o + Math.imul(p, ae) | 0, i = i + Math.imul(p, ie) | 0, i = i + Math.imul(g, ae) | 0, m = m + Math.imul(g, ie) | 0;
      var Qe = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (Qe >>> 26) | 0, Qe &= 67108863, o = Math.imul(U, J), i = Math.imul(U, X), i = i + Math.imul(V, J) | 0, m = Math.imul(V, X), o = o + Math.imul(A, Y) | 0, i = i + Math.imul(A, ee) | 0, i = i + Math.imul(R, Y) | 0, m = m + Math.imul(R, ee) | 0, o = o + Math.imul(I, te) | 0, i = i + Math.imul(I, ne) | 0, i = i + Math.imul(v, te) | 0, m = m + Math.imul(v, ne) | 0, o = o + Math.imul(w, ae) | 0, i = i + Math.imul(w, ie) | 0, i = i + Math.imul(k, ae) | 0, m = m + Math.imul(k, ie) | 0, o = o + Math.imul(p, se) | 0, i = i + Math.imul(p, re) | 0, i = i + Math.imul(g, se) | 0, m = m + Math.imul(g, re) | 0;
      var Je = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (Je >>> 26) | 0, Je &= 67108863, o = Math.imul(z, J), i = Math.imul(z, X), i = i + Math.imul(q, J) | 0, m = Math.imul(q, X), o = o + Math.imul(U, Y) | 0, i = i + Math.imul(U, ee) | 0, i = i + Math.imul(V, Y) | 0, m = m + Math.imul(V, ee) | 0, o = o + Math.imul(A, te) | 0, i = i + Math.imul(A, ne) | 0, i = i + Math.imul(R, te) | 0, m = m + Math.imul(R, ne) | 0, o = o + Math.imul(I, ae) | 0, i = i + Math.imul(I, ie) | 0, i = i + Math.imul(v, ae) | 0, m = m + Math.imul(v, ie) | 0, o = o + Math.imul(w, se) | 0, i = i + Math.imul(w, re) | 0, i = i + Math.imul(k, se) | 0, m = m + Math.imul(k, re) | 0, o = o + Math.imul(p, pe) | 0, i = i + Math.imul(p, ye) | 0, i = i + Math.imul(g, pe) | 0, m = m + Math.imul(g, ye) | 0;
      var nn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (nn >>> 26) | 0, nn &= 67108863, o = Math.imul(H, J), i = Math.imul(H, X), i = i + Math.imul(j, J) | 0, m = Math.imul(j, X), o = o + Math.imul(z, Y) | 0, i = i + Math.imul(z, ee) | 0, i = i + Math.imul(q, Y) | 0, m = m + Math.imul(q, ee) | 0, o = o + Math.imul(U, te) | 0, i = i + Math.imul(U, ne) | 0, i = i + Math.imul(V, te) | 0, m = m + Math.imul(V, ne) | 0, o = o + Math.imul(A, ae) | 0, i = i + Math.imul(A, ie) | 0, i = i + Math.imul(R, ae) | 0, m = m + Math.imul(R, ie) | 0, o = o + Math.imul(I, se) | 0, i = i + Math.imul(I, re) | 0, i = i + Math.imul(v, se) | 0, m = m + Math.imul(v, re) | 0, o = o + Math.imul(w, pe) | 0, i = i + Math.imul(w, ye) | 0, i = i + Math.imul(k, pe) | 0, m = m + Math.imul(k, ye) | 0, o = o + Math.imul(p, ue) | 0, i = i + Math.imul(p, oe) | 0, i = i + Math.imul(g, ue) | 0, m = m + Math.imul(g, oe) | 0;
      var an = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (an >>> 26) | 0, an &= 67108863, o = Math.imul(W, J), i = Math.imul(W, X), i = i + Math.imul(G, J) | 0, m = Math.imul(G, X), o = o + Math.imul(H, Y) | 0, i = i + Math.imul(H, ee) | 0, i = i + Math.imul(j, Y) | 0, m = m + Math.imul(j, ee) | 0, o = o + Math.imul(z, te) | 0, i = i + Math.imul(z, ne) | 0, i = i + Math.imul(q, te) | 0, m = m + Math.imul(q, ne) | 0, o = o + Math.imul(U, ae) | 0, i = i + Math.imul(U, ie) | 0, i = i + Math.imul(V, ae) | 0, m = m + Math.imul(V, ie) | 0, o = o + Math.imul(A, se) | 0, i = i + Math.imul(A, re) | 0, i = i + Math.imul(R, se) | 0, m = m + Math.imul(R, re) | 0, o = o + Math.imul(I, pe) | 0, i = i + Math.imul(I, ye) | 0, i = i + Math.imul(v, pe) | 0, m = m + Math.imul(v, ye) | 0, o = o + Math.imul(w, ue) | 0, i = i + Math.imul(w, oe) | 0, i = i + Math.imul(k, ue) | 0, m = m + Math.imul(k, oe) | 0, o = o + Math.imul(p, le) | 0, i = i + Math.imul(p, me) | 0, i = i + Math.imul(g, le) | 0, m = m + Math.imul(g, me) | 0;
      var sn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (sn >>> 26) | 0, sn &= 67108863, o = Math.imul(K, J), i = Math.imul(K, X), i = i + Math.imul(Z, J) | 0, m = Math.imul(Z, X), o = o + Math.imul(W, Y) | 0, i = i + Math.imul(W, ee) | 0, i = i + Math.imul(G, Y) | 0, m = m + Math.imul(G, ee) | 0, o = o + Math.imul(H, te) | 0, i = i + Math.imul(H, ne) | 0, i = i + Math.imul(j, te) | 0, m = m + Math.imul(j, ne) | 0, o = o + Math.imul(z, ae) | 0, i = i + Math.imul(z, ie) | 0, i = i + Math.imul(q, ae) | 0, m = m + Math.imul(q, ie) | 0, o = o + Math.imul(U, se) | 0, i = i + Math.imul(U, re) | 0, i = i + Math.imul(V, se) | 0, m = m + Math.imul(V, re) | 0, o = o + Math.imul(A, pe) | 0, i = i + Math.imul(A, ye) | 0, i = i + Math.imul(R, pe) | 0, m = m + Math.imul(R, ye) | 0, o = o + Math.imul(I, ue) | 0, i = i + Math.imul(I, oe) | 0, i = i + Math.imul(v, ue) | 0, m = m + Math.imul(v, oe) | 0, o = o + Math.imul(w, le) | 0, i = i + Math.imul(w, me) | 0, i = i + Math.imul(k, le) | 0, m = m + Math.imul(k, me) | 0, o = o + Math.imul(p, de) | 0, i = i + Math.imul(p, ce) | 0, i = i + Math.imul(g, de) | 0, m = m + Math.imul(g, ce) | 0;
      var rn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (rn >>> 26) | 0, rn &= 67108863, o = Math.imul($, J), i = Math.imul($, X), i = i + Math.imul(Q, J) | 0, m = Math.imul(Q, X), o = o + Math.imul(K, Y) | 0, i = i + Math.imul(K, ee) | 0, i = i + Math.imul(Z, Y) | 0, m = m + Math.imul(Z, ee) | 0, o = o + Math.imul(W, te) | 0, i = i + Math.imul(W, ne) | 0, i = i + Math.imul(G, te) | 0, m = m + Math.imul(G, ne) | 0, o = o + Math.imul(H, ae) | 0, i = i + Math.imul(H, ie) | 0, i = i + Math.imul(j, ae) | 0, m = m + Math.imul(j, ie) | 0, o = o + Math.imul(z, se) | 0, i = i + Math.imul(z, re) | 0, i = i + Math.imul(q, se) | 0, m = m + Math.imul(q, re) | 0, o = o + Math.imul(U, pe) | 0, i = i + Math.imul(U, ye) | 0, i = i + Math.imul(V, pe) | 0, m = m + Math.imul(V, ye) | 0, o = o + Math.imul(A, ue) | 0, i = i + Math.imul(A, oe) | 0, i = i + Math.imul(R, ue) | 0, m = m + Math.imul(R, oe) | 0, o = o + Math.imul(I, le) | 0, i = i + Math.imul(I, me) | 0, i = i + Math.imul(v, le) | 0, m = m + Math.imul(v, me) | 0, o = o + Math.imul(w, de) | 0, i = i + Math.imul(w, ce) | 0, i = i + Math.imul(k, de) | 0, m = m + Math.imul(k, ce) | 0, o = o + Math.imul(p, fe) | 0, i = i + Math.imul(p, Te) | 0, i = i + Math.imul(g, fe) | 0, m = m + Math.imul(g, Te) | 0;
      var pn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (pn >>> 26) | 0, pn &= 67108863, o = Math.imul($, Y), i = Math.imul($, ee), i = i + Math.imul(Q, Y) | 0, m = Math.imul(Q, ee), o = o + Math.imul(K, te) | 0, i = i + Math.imul(K, ne) | 0, i = i + Math.imul(Z, te) | 0, m = m + Math.imul(Z, ne) | 0, o = o + Math.imul(W, ae) | 0, i = i + Math.imul(W, ie) | 0, i = i + Math.imul(G, ae) | 0, m = m + Math.imul(G, ie) | 0, o = o + Math.imul(H, se) | 0, i = i + Math.imul(H, re) | 0, i = i + Math.imul(j, se) | 0, m = m + Math.imul(j, re) | 0, o = o + Math.imul(z, pe) | 0, i = i + Math.imul(z, ye) | 0, i = i + Math.imul(q, pe) | 0, m = m + Math.imul(q, ye) | 0, o = o + Math.imul(U, ue) | 0, i = i + Math.imul(U, oe) | 0, i = i + Math.imul(V, ue) | 0, m = m + Math.imul(V, oe) | 0, o = o + Math.imul(A, le) | 0, i = i + Math.imul(A, me) | 0, i = i + Math.imul(R, le) | 0, m = m + Math.imul(R, me) | 0, o = o + Math.imul(I, de) | 0, i = i + Math.imul(I, ce) | 0, i = i + Math.imul(v, de) | 0, m = m + Math.imul(v, ce) | 0, o = o + Math.imul(w, fe) | 0, i = i + Math.imul(w, Te) | 0, i = i + Math.imul(k, fe) | 0, m = m + Math.imul(k, Te) | 0;
      var yn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (yn >>> 26) | 0, yn &= 67108863, o = Math.imul($, te), i = Math.imul($, ne), i = i + Math.imul(Q, te) | 0, m = Math.imul(Q, ne), o = o + Math.imul(K, ae) | 0, i = i + Math.imul(K, ie) | 0, i = i + Math.imul(Z, ae) | 0, m = m + Math.imul(Z, ie) | 0, o = o + Math.imul(W, se) | 0, i = i + Math.imul(W, re) | 0, i = i + Math.imul(G, se) | 0, m = m + Math.imul(G, re) | 0, o = o + Math.imul(H, pe) | 0, i = i + Math.imul(H, ye) | 0, i = i + Math.imul(j, pe) | 0, m = m + Math.imul(j, ye) | 0, o = o + Math.imul(z, ue) | 0, i = i + Math.imul(z, oe) | 0, i = i + Math.imul(q, ue) | 0, m = m + Math.imul(q, oe) | 0, o = o + Math.imul(U, le) | 0, i = i + Math.imul(U, me) | 0, i = i + Math.imul(V, le) | 0, m = m + Math.imul(V, me) | 0, o = o + Math.imul(A, de) | 0, i = i + Math.imul(A, ce) | 0, i = i + Math.imul(R, de) | 0, m = m + Math.imul(R, ce) | 0, o = o + Math.imul(I, fe) | 0, i = i + Math.imul(I, Te) | 0, i = i + Math.imul(v, fe) | 0, m = m + Math.imul(v, Te) | 0;
      var un = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (un >>> 26) | 0, un &= 67108863, o = Math.imul($, ae), i = Math.imul($, ie), i = i + Math.imul(Q, ae) | 0, m = Math.imul(Q, ie), o = o + Math.imul(K, se) | 0, i = i + Math.imul(K, re) | 0, i = i + Math.imul(Z, se) | 0, m = m + Math.imul(Z, re) | 0, o = o + Math.imul(W, pe) | 0, i = i + Math.imul(W, ye) | 0, i = i + Math.imul(G, pe) | 0, m = m + Math.imul(G, ye) | 0, o = o + Math.imul(H, ue) | 0, i = i + Math.imul(H, oe) | 0, i = i + Math.imul(j, ue) | 0, m = m + Math.imul(j, oe) | 0, o = o + Math.imul(z, le) | 0, i = i + Math.imul(z, me) | 0, i = i + Math.imul(q, le) | 0, m = m + Math.imul(q, me) | 0, o = o + Math.imul(U, de) | 0, i = i + Math.imul(U, ce) | 0, i = i + Math.imul(V, de) | 0, m = m + Math.imul(V, ce) | 0, o = o + Math.imul(A, fe) | 0, i = i + Math.imul(A, Te) | 0, i = i + Math.imul(R, fe) | 0, m = m + Math.imul(R, Te) | 0;
      var on = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (on >>> 26) | 0, on &= 67108863, o = Math.imul($, se), i = Math.imul($, re), i = i + Math.imul(Q, se) | 0, m = Math.imul(Q, re), o = o + Math.imul(K, pe) | 0, i = i + Math.imul(K, ye) | 0, i = i + Math.imul(Z, pe) | 0, m = m + Math.imul(Z, ye) | 0, o = o + Math.imul(W, ue) | 0, i = i + Math.imul(W, oe) | 0, i = i + Math.imul(G, ue) | 0, m = m + Math.imul(G, oe) | 0, o = o + Math.imul(H, le) | 0, i = i + Math.imul(H, me) | 0, i = i + Math.imul(j, le) | 0, m = m + Math.imul(j, me) | 0, o = o + Math.imul(z, de) | 0, i = i + Math.imul(z, ce) | 0, i = i + Math.imul(q, de) | 0, m = m + Math.imul(q, ce) | 0, o = o + Math.imul(U, fe) | 0, i = i + Math.imul(U, Te) | 0, i = i + Math.imul(V, fe) | 0, m = m + Math.imul(V, Te) | 0;
      var ln = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (ln >>> 26) | 0, ln &= 67108863, o = Math.imul($, pe), i = Math.imul($, ye), i = i + Math.imul(Q, pe) | 0, m = Math.imul(Q, ye), o = o + Math.imul(K, ue) | 0, i = i + Math.imul(K, oe) | 0, i = i + Math.imul(Z, ue) | 0, m = m + Math.imul(Z, oe) | 0, o = o + Math.imul(W, le) | 0, i = i + Math.imul(W, me) | 0, i = i + Math.imul(G, le) | 0, m = m + Math.imul(G, me) | 0, o = o + Math.imul(H, de) | 0, i = i + Math.imul(H, ce) | 0, i = i + Math.imul(j, de) | 0, m = m + Math.imul(j, ce) | 0, o = o + Math.imul(z, fe) | 0, i = i + Math.imul(z, Te) | 0, i = i + Math.imul(q, fe) | 0, m = m + Math.imul(q, Te) | 0;
      var mn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (mn >>> 26) | 0, mn &= 67108863, o = Math.imul($, ue), i = Math.imul($, oe), i = i + Math.imul(Q, ue) | 0, m = Math.imul(Q, oe), o = o + Math.imul(K, le) | 0, i = i + Math.imul(K, me) | 0, i = i + Math.imul(Z, le) | 0, m = m + Math.imul(Z, me) | 0, o = o + Math.imul(W, de) | 0, i = i + Math.imul(W, ce) | 0, i = i + Math.imul(G, de) | 0, m = m + Math.imul(G, ce) | 0, o = o + Math.imul(H, fe) | 0, i = i + Math.imul(H, Te) | 0, i = i + Math.imul(j, fe) | 0, m = m + Math.imul(j, Te) | 0;
      var dn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (dn >>> 26) | 0, dn &= 67108863, o = Math.imul($, le), i = Math.imul($, me), i = i + Math.imul(Q, le) | 0, m = Math.imul(Q, me), o = o + Math.imul(K, de) | 0, i = i + Math.imul(K, ce) | 0, i = i + Math.imul(Z, de) | 0, m = m + Math.imul(Z, ce) | 0, o = o + Math.imul(W, fe) | 0, i = i + Math.imul(W, Te) | 0, i = i + Math.imul(G, fe) | 0, m = m + Math.imul(G, Te) | 0;
      var cn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (cn >>> 26) | 0, cn &= 67108863, o = Math.imul($, de), i = Math.imul($, ce), i = i + Math.imul(Q, de) | 0, m = Math.imul(Q, ce), o = o + Math.imul(K, fe) | 0, i = i + Math.imul(K, Te) | 0, i = i + Math.imul(Z, fe) | 0, m = m + Math.imul(Z, Te) | 0;
      var fn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (fn >>> 26) | 0, fn &= 67108863, o = Math.imul($, fe), i = Math.imul($, Te), i = i + Math.imul(Q, fe) | 0, m = Math.imul(Q, Te);
      var Tn = (h + o | 0) + ((i & 8191) << 13) | 0;
      return h = (m + (i >>> 13) | 0) + (Tn >>> 26) | 0, Tn &= 67108863, b[0] = Ke, b[1] = Ze, b[2] = $e, b[3] = Qe, b[4] = Je, b[5] = nn, b[6] = an, b[7] = sn, b[8] = rn, b[9] = pn, b[10] = yn, b[11] = un, b[12] = on, b[13] = ln, b[14] = mn, b[15] = dn, b[16] = cn, b[17] = fn, b[18] = Tn, h !== 0 && (b[19] = h, u.length++), u;
    };
    Math.imul || (xt = Mt);
    function At(f, a, r) {
      r.negative = a.negative ^ f.negative, r.length = f.length + a.length;
      for (var u = 0, l = 0, c = 0; c < r.length - 1; c++) {
        var b = l;
        l = 0;
        for (var h = u & 67108863, o = Math.min(c, a.length - 1), i = Math.max(0, c - f.length + 1); i <= o; i++) {
          var m = c - i, S = f.words[m] | 0, p = a.words[i] | 0, g = S * p, M = g & 67108863;
          b = b + (g / 67108864 | 0) | 0, M = M + h | 0, h = M & 67108863, b = b + (M >>> 26) | 0, l += b >>> 26, b &= 67108863;
        }
        r.words[c] = h, u = b, b = l;
      }
      return u !== 0 ? r.words[c] = u : r.length--, r._strip();
    }
    function Et(f, a, r) {
      return At(f, a, r);
    }
    y.prototype.mulTo = function(a, r) {
      var u, l = this.length + a.length;
      return this.length === 10 && a.length === 10 ? u = xt(this, a, r) : l < 63 ? u = Mt(this, a, r) : l < 1024 ? u = At(this, a, r) : u = Et(this, a, r), u;
    }, y.prototype.mul = function(a) {
      var r = new y(null);
      return r.words = new Array(this.length + a.length), this.mulTo(a, r);
    }, y.prototype.mulf = function(a) {
      var r = new y(null);
      return r.words = new Array(this.length + a.length), Et(this, a, r);
    }, y.prototype.imul = function(a) {
      return this.clone().mulTo(a, this);
    }, y.prototype.imuln = function(a) {
      var r = a < 0;
      r && (a = -a), n(typeof a == "number"), n(a < 67108864);
      for (var u = 0, l = 0; l < this.length; l++) {
        var c = (this.words[l] | 0) * a, b = (c & 67108863) + (u & 67108863);
        u >>= 26, u += c / 67108864 | 0, u += b >>> 26, this.words[l] = b & 67108863;
      }
      return u !== 0 && (this.words[l] = u, this.length++), r ? this.ineg() : this;
    }, y.prototype.muln = function(a) {
      return this.clone().imuln(a);
    }, y.prototype.sqr = function() {
      return this.mul(this);
    }, y.prototype.isqr = function() {
      return this.imul(this.clone());
    }, y.prototype.pow = function(a) {
      var r = Vt(a);
      if (r.length === 0)
        return new y(1);
      for (var u = this, l = 0; l < r.length && r[l] === 0; l++, u = u.sqr())
        ;
      if (++l < r.length)
        for (var c = u.sqr(); l < r.length; l++, c = c.sqr())
          r[l] !== 0 && (u = u.mul(c));
      return u;
    }, y.prototype.iushln = function(a) {
      n(typeof a == "number" && a >= 0);
      var r = a % 26, u = (a - r) / 26, l = 67108863 >>> 26 - r << 26 - r, c;
      if (r !== 0) {
        var b = 0;
        for (c = 0; c < this.length; c++) {
          var h = this.words[c] & l, o = (this.words[c] | 0) - h << r;
          this.words[c] = o | b, b = h >>> 26 - r;
        }
        b && (this.words[c] = b, this.length++);
      }
      if (u !== 0) {
        for (c = this.length - 1; c >= 0; c--)
          this.words[c + u] = this.words[c];
        for (c = 0; c < u; c++)
          this.words[c] = 0;
        this.length += u;
      }
      return this._strip();
    }, y.prototype.ishln = function(a) {
      return n(this.negative === 0), this.iushln(a);
    }, y.prototype.iushrn = function(a, r, u) {
      n(typeof a == "number" && a >= 0);
      var l;
      r ? l = (r - r % 26) / 26 : l = 0;
      var c = a % 26, b = Math.min((a - c) / 26, this.length), h = 67108863 ^ 67108863 >>> c << c, o = u;
      if (l -= b, l = Math.max(0, l), o) {
        for (var i = 0; i < b; i++)
          o.words[i] = this.words[i];
        o.length = b;
      }
      if (b !== 0)
        if (this.length > b)
          for (this.length -= b, i = 0; i < this.length; i++)
            this.words[i] = this.words[i + b];
        else
          this.words[0] = 0, this.length = 1;
      var m = 0;
      for (i = this.length - 1; i >= 0 && (m !== 0 || i >= l); i--) {
        var S = this.words[i] | 0;
        this.words[i] = m << 26 - c | S >>> c, m = S & h;
      }
      return o && m !== 0 && (o.words[o.length++] = m), this.length === 0 && (this.words[0] = 0, this.length = 1), this._strip();
    }, y.prototype.ishrn = function(a, r, u) {
      return n(this.negative === 0), this.iushrn(a, r, u);
    }, y.prototype.shln = function(a) {
      return this.clone().ishln(a);
    }, y.prototype.ushln = function(a) {
      return this.clone().iushln(a);
    }, y.prototype.shrn = function(a) {
      return this.clone().ishrn(a);
    }, y.prototype.ushrn = function(a) {
      return this.clone().iushrn(a);
    }, y.prototype.testn = function(a) {
      n(typeof a == "number" && a >= 0);
      var r = a % 26, u = (a - r) / 26, l = 1 << r;
      if (this.length <= u)
        return !1;
      var c = this.words[u];
      return !!(c & l);
    }, y.prototype.imaskn = function(a) {
      n(typeof a == "number" && a >= 0);
      var r = a % 26, u = (a - r) / 26;
      if (n(this.negative === 0, "imaskn works only with positive numbers"), this.length <= u)
        return this;
      if (r !== 0 && u++, this.length = Math.min(u, this.length), r !== 0) {
        var l = 67108863 ^ 67108863 >>> r << r;
        this.words[this.length - 1] &= l;
      }
      return this._strip();
    }, y.prototype.maskn = function(a) {
      return this.clone().imaskn(a);
    }, y.prototype.iaddn = function(a) {
      return n(typeof a == "number"), n(a < 67108864), a < 0 ? this.isubn(-a) : this.negative !== 0 ? this.length === 1 && (this.words[0] | 0) <= a ? (this.words[0] = a - (this.words[0] | 0), this.negative = 0, this) : (this.negative = 0, this.isubn(a), this.negative = 1, this) : this._iaddn(a);
    }, y.prototype._iaddn = function(a) {
      this.words[0] += a;
      for (var r = 0; r < this.length && this.words[r] >= 67108864; r++)
        this.words[r] -= 67108864, r === this.length - 1 ? this.words[r + 1] = 1 : this.words[r + 1]++;
      return this.length = Math.max(this.length, r + 1), this;
    }, y.prototype.isubn = function(a) {
      if (n(typeof a == "number"), n(a < 67108864), a < 0)
        return this.iaddn(-a);
      if (this.negative !== 0)
        return this.negative = 0, this.iaddn(a), this.negative = 1, this;
      if (this.words[0] -= a, this.length === 1 && this.words[0] < 0)
        this.words[0] = -this.words[0], this.negative = 1;
      else
        for (var r = 0; r < this.length && this.words[r] < 0; r++)
          this.words[r] += 67108864, this.words[r + 1] -= 1;
      return this._strip();
    }, y.prototype.addn = function(a) {
      return this.clone().iaddn(a);
    }, y.prototype.subn = function(a) {
      return this.clone().isubn(a);
    }, y.prototype.iabs = function() {
      return this.negative = 0, this;
    }, y.prototype.abs = function() {
      return this.clone().iabs();
    }, y.prototype._ishlnsubmul = function(a, r, u) {
      var l = a.length + u, c;
      this._expand(l);
      var b, h = 0;
      for (c = 0; c < a.length; c++) {
        b = (this.words[c + u] | 0) + h;
        var o = (a.words[c] | 0) * r;
        b -= o & 67108863, h = (b >> 26) - (o / 67108864 | 0), this.words[c + u] = b & 67108863;
      }
      for (; c < this.length - u; c++)
        b = (this.words[c + u] | 0) + h, h = b >> 26, this.words[c + u] = b & 67108863;
      if (h === 0)
        return this._strip();
      for (n(h === -1), h = 0, c = 0; c < this.length; c++)
        b = -(this.words[c] | 0) + h, h = b >> 26, this.words[c] = b & 67108863;
      return this.negative = 1, this._strip();
    }, y.prototype._wordDiv = function(a, r) {
      var u = this.length - a.length, l = this.clone(), c = a, b = c.words[c.length - 1] | 0, h = this._countBits(b);
      u = 26 - h, u !== 0 && (c = c.ushln(u), l.iushln(u), b = c.words[c.length - 1] | 0);
      var o = l.length - c.length, i;
      if (r !== "mod") {
        i = new y(null), i.length = o + 1, i.words = new Array(i.length);
        for (var m = 0; m < i.length; m++)
          i.words[m] = 0;
      }
      var S = l.clone()._ishlnsubmul(c, 1, o);
      S.negative === 0 && (l = S, i && (i.words[o] = 1));
      for (var p = o - 1; p >= 0; p--) {
        var g = (l.words[c.length + p] | 0) * 67108864 + (l.words[c.length + p - 1] | 0);
        for (g = Math.min(g / b | 0, 67108863), l._ishlnsubmul(c, g, p); l.negative !== 0; )
          g--, l.negative = 0, l._ishlnsubmul(c, 1, p), l.isZero() || (l.negative ^= 1);
        i && (i.words[p] = g);
      }
      return i && i._strip(), l._strip(), r !== "div" && u !== 0 && l.iushrn(u), {
        div: i || null,
        mod: l
      };
    }, y.prototype.divmod = function(a, r, u) {
      if (n(!a.isZero()), this.isZero())
        return {
          div: new y(0),
          mod: new y(0)
        };
      var l, c, b;
      return this.negative !== 0 && a.negative === 0 ? (b = this.neg().divmod(a, r), r !== "mod" && (l = b.div.neg()), r !== "div" && (c = b.mod.neg(), u && c.negative !== 0 && c.iadd(a)), {
        div: l,
        mod: c
      }) : this.negative === 0 && a.negative !== 0 ? (b = this.divmod(a.neg(), r), r !== "mod" && (l = b.div.neg()), {
        div: l,
        mod: b.mod
      }) : this.negative & a.negative ? (b = this.neg().divmod(a.neg(), r), r !== "div" && (c = b.mod.neg(), u && c.negative !== 0 && c.isub(a)), {
        div: b.div,
        mod: c
      }) : a.length > this.length || this.cmp(a) < 0 ? {
        div: new y(0),
        mod: this
      } : a.length === 1 ? r === "div" ? {
        div: this.divn(a.words[0]),
        mod: null
      } : r === "mod" ? {
        div: null,
        mod: new y(this.modrn(a.words[0]))
      } : {
        div: this.divn(a.words[0]),
        mod: new y(this.modrn(a.words[0]))
      } : this._wordDiv(a, r);
    }, y.prototype.div = function(a) {
      return this.divmod(a, "div", !1).div;
    }, y.prototype.mod = function(a) {
      return this.divmod(a, "mod", !1).mod;
    }, y.prototype.umod = function(a) {
      return this.divmod(a, "mod", !0).mod;
    }, y.prototype.divRound = function(a) {
      var r = this.divmod(a);
      if (r.mod.isZero())
        return r.div;
      var u = r.div.negative !== 0 ? r.mod.isub(a) : r.mod, l = a.ushrn(1), c = a.andln(1), b = u.cmp(l);
      return b < 0 || c === 1 && b === 0 ? r.div : r.div.negative !== 0 ? r.div.isubn(1) : r.div.iaddn(1);
    }, y.prototype.modrn = function(a) {
      var r = a < 0;
      r && (a = -a), n(a <= 67108863);
      for (var u = (1 << 26) % a, l = 0, c = this.length - 1; c >= 0; c--)
        l = (u * l + (this.words[c] | 0)) % a;
      return r ? -l : l;
    }, y.prototype.modn = function(a) {
      return this.modrn(a);
    }, y.prototype.idivn = function(a) {
      var r = a < 0;
      r && (a = -a), n(a <= 67108863);
      for (var u = 0, l = this.length - 1; l >= 0; l--) {
        var c = (this.words[l] | 0) + u * 67108864;
        this.words[l] = c / a | 0, u = c % a;
      }
      return this._strip(), r ? this.ineg() : this;
    }, y.prototype.divn = function(a) {
      return this.clone().idivn(a);
    }, y.prototype.egcd = function(a) {
      n(a.negative === 0), n(!a.isZero());
      var r = this, u = a.clone();
      r.negative !== 0 ? r = r.umod(a) : r = r.clone();
      for (var l = new y(1), c = new y(0), b = new y(0), h = new y(1), o = 0; r.isEven() && u.isEven(); )
        r.iushrn(1), u.iushrn(1), ++o;
      for (var i = u.clone(), m = r.clone(); !r.isZero(); ) {
        for (var S = 0, p = 1; !(r.words[0] & p) && S < 26; ++S, p <<= 1)
          ;
        if (S > 0)
          for (r.iushrn(S); S-- > 0; )
            (l.isOdd() || c.isOdd()) && (l.iadd(i), c.isub(m)), l.iushrn(1), c.iushrn(1);
        for (var g = 0, M = 1; !(u.words[0] & M) && g < 26; ++g, M <<= 1)
          ;
        if (g > 0)
          for (u.iushrn(g); g-- > 0; )
            (b.isOdd() || h.isOdd()) && (b.iadd(i), h.isub(m)), b.iushrn(1), h.iushrn(1);
        r.cmp(u) >= 0 ? (r.isub(u), l.isub(b), c.isub(h)) : (u.isub(r), b.isub(l), h.isub(c));
      }
      return {
        a: b,
        b: h,
        gcd: u.iushln(o)
      };
    }, y.prototype._invmp = function(a) {
      n(a.negative === 0), n(!a.isZero());
      var r = this, u = a.clone();
      r.negative !== 0 ? r = r.umod(a) : r = r.clone();
      for (var l = new y(1), c = new y(0), b = u.clone(); r.cmpn(1) > 0 && u.cmpn(1) > 0; ) {
        for (var h = 0, o = 1; !(r.words[0] & o) && h < 26; ++h, o <<= 1)
          ;
        if (h > 0)
          for (r.iushrn(h); h-- > 0; )
            l.isOdd() && l.iadd(b), l.iushrn(1);
        for (var i = 0, m = 1; !(u.words[0] & m) && i < 26; ++i, m <<= 1)
          ;
        if (i > 0)
          for (u.iushrn(i); i-- > 0; )
            c.isOdd() && c.iadd(b), c.iushrn(1);
        r.cmp(u) >= 0 ? (r.isub(u), l.isub(c)) : (u.isub(r), c.isub(l));
      }
      var S;
      return r.cmpn(1) === 0 ? S = l : S = c, S.cmpn(0) < 0 && S.iadd(a), S;
    }, y.prototype.gcd = function(a) {
      if (this.isZero())
        return a.abs();
      if (a.isZero())
        return this.abs();
      var r = this.clone(), u = a.clone();
      r.negative = 0, u.negative = 0;
      for (var l = 0; r.isEven() && u.isEven(); l++)
        r.iushrn(1), u.iushrn(1);
      do {
        for (; r.isEven(); )
          r.iushrn(1);
        for (; u.isEven(); )
          u.iushrn(1);
        var c = r.cmp(u);
        if (c < 0) {
          var b = r;
          r = u, u = b;
        } else if (c === 0 || u.cmpn(1) === 0)
          break;
        r.isub(u);
      } while (!0);
      return u.iushln(l);
    }, y.prototype.invm = function(a) {
      return this.egcd(a).a.umod(a);
    }, y.prototype.isEven = function() {
      return (this.words[0] & 1) === 0;
    }, y.prototype.isOdd = function() {
      return (this.words[0] & 1) === 1;
    }, y.prototype.andln = function(a) {
      return this.words[0] & a;
    }, y.prototype.bincn = function(a) {
      n(typeof a == "number");
      var r = a % 26, u = (a - r) / 26, l = 1 << r;
      if (this.length <= u)
        return this._expand(u + 1), this.words[u] |= l, this;
      for (var c = l, b = u; c !== 0 && b < this.length; b++) {
        var h = this.words[b] | 0;
        h += c, c = h >>> 26, h &= 67108863, this.words[b] = h;
      }
      return c !== 0 && (this.words[b] = c, this.length++), this;
    }, y.prototype.isZero = function() {
      return this.length === 1 && this.words[0] === 0;
    }, y.prototype.cmpn = function(a) {
      var r = a < 0;
      if (this.negative !== 0 && !r)
        return -1;
      if (this.negative === 0 && r)
        return 1;
      this._strip();
      var u;
      if (this.length > 1)
        u = 1;
      else {
        r && (a = -a), n(a <= 67108863, "Number is too big");
        var l = this.words[0] | 0;
        u = l === a ? 0 : l < a ? -1 : 1;
      }
      return this.negative !== 0 ? -u | 0 : u;
    }, y.prototype.cmp = function(a) {
      if (this.negative !== 0 && a.negative === 0)
        return -1;
      if (this.negative === 0 && a.negative !== 0)
        return 1;
      var r = this.ucmp(a);
      return this.negative !== 0 ? -r | 0 : r;
    }, y.prototype.ucmp = function(a) {
      if (this.length > a.length)
        return 1;
      if (this.length < a.length)
        return -1;
      for (var r = 0, u = this.length - 1; u >= 0; u--) {
        var l = this.words[u] | 0, c = a.words[u] | 0;
        if (l !== c) {
          l < c ? r = -1 : l > c && (r = 1);
          break;
        }
      }
      return r;
    }, y.prototype.gtn = function(a) {
      return this.cmpn(a) === 1;
    }, y.prototype.gt = function(a) {
      return this.cmp(a) === 1;
    }, y.prototype.gten = function(a) {
      return this.cmpn(a) >= 0;
    }, y.prototype.gte = function(a) {
      return this.cmp(a) >= 0;
    }, y.prototype.ltn = function(a) {
      return this.cmpn(a) === -1;
    }, y.prototype.lt = function(a) {
      return this.cmp(a) === -1;
    }, y.prototype.lten = function(a) {
      return this.cmpn(a) <= 0;
    }, y.prototype.lte = function(a) {
      return this.cmp(a) <= 0;
    }, y.prototype.eqn = function(a) {
      return this.cmpn(a) === 0;
    }, y.prototype.eq = function(a) {
      return this.cmp(a) === 0;
    }, y.red = function(a) {
      return new he(a);
    }, y.prototype.toRed = function(a) {
      return n(!this.red, "Already a number in reduction context"), n(this.negative === 0, "red works only with positives"), a.convertTo(this)._forceRed(a);
    }, y.prototype.fromRed = function() {
      return n(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this);
    }, y.prototype._forceRed = function(a) {
      return this.red = a, this;
    }, y.prototype.forceRed = function(a) {
      return n(!this.red, "Already a number in reduction context"), this._forceRed(a);
    }, y.prototype.redAdd = function(a) {
      return n(this.red, "redAdd works only with red numbers"), this.red.add(this, a);
    }, y.prototype.redIAdd = function(a) {
      return n(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, a);
    }, y.prototype.redSub = function(a) {
      return n(this.red, "redSub works only with red numbers"), this.red.sub(this, a);
    }, y.prototype.redISub = function(a) {
      return n(this.red, "redISub works only with red numbers"), this.red.isub(this, a);
    }, y.prototype.redShl = function(a) {
      return n(this.red, "redShl works only with red numbers"), this.red.shl(this, a);
    }, y.prototype.redMul = function(a) {
      return n(this.red, "redMul works only with red numbers"), this.red._verify2(this, a), this.red.mul(this, a);
    }, y.prototype.redIMul = function(a) {
      return n(this.red, "redMul works only with red numbers"), this.red._verify2(this, a), this.red.imul(this, a);
    }, y.prototype.redSqr = function() {
      return n(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this);
    }, y.prototype.redISqr = function() {
      return n(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this);
    }, y.prototype.redSqrt = function() {
      return n(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this);
    }, y.prototype.redInvm = function() {
      return n(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this);
    }, y.prototype.redNeg = function() {
      return n(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this);
    }, y.prototype.redPow = function(a) {
      return n(this.red && !a.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, a);
    };
    var wt = {
      k256: null,
      p224: null,
      p192: null,
      p25519: null
    };
    function Ee(f, a) {
      this.name = f, this.p = new y(a, 16), this.n = this.p.bitLength(), this.k = new y(1).iushln(this.n).isub(this.p), this.tmp = this._tmp();
    }
    Ee.prototype._tmp = function() {
      var a = new y(null);
      return a.words = new Array(Math.ceil(this.n / 13)), a;
    }, Ee.prototype.ireduce = function(a) {
      var r = a, u;
      do
        this.split(r, this.tmp), r = this.imulK(r), r = r.iadd(this.tmp), u = r.bitLength();
      while (u > this.n);
      var l = u < this.n ? -1 : r.ucmp(this.p);
      return l === 0 ? (r.words[0] = 0, r.length = 1) : l > 0 ? r.isub(this.p) : r.strip !== void 0 ? r.strip() : r._strip(), r;
    }, Ee.prototype.split = function(a, r) {
      a.iushrn(this.n, 0, r);
    }, Ee.prototype.imulK = function(a) {
      return a.imul(this.k);
    };
    function Ye() {
      Ee.call(
        this,
        "k256",
        "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
      );
    }
    d(Ye, Ee), Ye.prototype.split = function(a, r) {
      for (var u = 4194303, l = Math.min(a.length, 9), c = 0; c < l; c++)
        r.words[c] = a.words[c];
      if (r.length = l, a.length <= 9) {
        a.words[0] = 0, a.length = 1;
        return;
      }
      var b = a.words[9];
      for (r.words[r.length++] = b & u, c = 10; c < a.length; c++) {
        var h = a.words[c] | 0;
        a.words[c - 10] = (h & u) << 4 | b >>> 22, b = h;
      }
      b >>>= 22, a.words[c - 10] = b, b === 0 && a.length > 10 ? a.length -= 10 : a.length -= 9;
    }, Ye.prototype.imulK = function(a) {
      a.words[a.length] = 0, a.words[a.length + 1] = 0, a.length += 2;
      for (var r = 0, u = 0; u < a.length; u++) {
        var l = a.words[u] | 0;
        r += l * 977, a.words[u] = r & 67108863, r = l * 64 + (r / 67108864 | 0);
      }
      return a.words[a.length - 1] === 0 && (a.length--, a.words[a.length - 1] === 0 && a.length--), a;
    };
    function et() {
      Ee.call(
        this,
        "p224",
        "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
      );
    }
    d(et, Ee);
    function Ct() {
      Ee.call(
        this,
        "p192",
        "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
      );
    }
    d(Ct, Ee);
    function St() {
      Ee.call(
        this,
        "25519",
        "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
      );
    }
    d(St, Ee), St.prototype.imulK = function(a) {
      for (var r = 0, u = 0; u < a.length; u++) {
        var l = (a.words[u] | 0) * 19 + r, c = l & 67108863;
        l >>>= 26, a.words[u] = c, r = l;
      }
      return r !== 0 && (a.words[a.length++] = r), a;
    }, y._prime = function(a) {
      if (wt[a])
        return wt[a];
      var r;
      if (a === "k256")
        r = new Ye();
      else if (a === "p224")
        r = new et();
      else if (a === "p192")
        r = new Ct();
      else if (a === "p25519")
        r = new St();
      else
        throw new Error("Unknown prime " + a);
      return wt[a] = r, r;
    };
    function he(f) {
      if (typeof f == "string") {
        var a = y._prime(f);
        this.m = a.p, this.prime = a;
      } else
        n(f.gtn(1), "modulus must be greater than 1"), this.m = f, this.prime = null;
    }
    he.prototype._verify1 = function(a) {
      n(a.negative === 0, "red works only with positives"), n(a.red, "red works only with red numbers");
    }, he.prototype._verify2 = function(a, r) {
      n((a.negative | r.negative) === 0, "red works only with positives"), n(
        a.red && a.red === r.red,
        "red works only with red numbers"
      );
    }, he.prototype.imod = function(a) {
      return this.prime ? this.prime.ireduce(a)._forceRed(this) : (N(a, a.umod(this.m)._forceRed(this)), a);
    }, he.prototype.neg = function(a) {
      return a.isZero() ? a.clone() : this.m.sub(a)._forceRed(this);
    }, he.prototype.add = function(a, r) {
      this._verify2(a, r);
      var u = a.add(r);
      return u.cmp(this.m) >= 0 && u.isub(this.m), u._forceRed(this);
    }, he.prototype.iadd = function(a, r) {
      this._verify2(a, r);
      var u = a.iadd(r);
      return u.cmp(this.m) >= 0 && u.isub(this.m), u;
    }, he.prototype.sub = function(a, r) {
      this._verify2(a, r);
      var u = a.sub(r);
      return u.cmpn(0) < 0 && u.iadd(this.m), u._forceRed(this);
    }, he.prototype.isub = function(a, r) {
      this._verify2(a, r);
      var u = a.isub(r);
      return u.cmpn(0) < 0 && u.iadd(this.m), u;
    }, he.prototype.shl = function(a, r) {
      return this._verify1(a), this.imod(a.ushln(r));
    }, he.prototype.imul = function(a, r) {
      return this._verify2(a, r), this.imod(a.imul(r));
    }, he.prototype.mul = function(a, r) {
      return this._verify2(a, r), this.imod(a.mul(r));
    }, he.prototype.isqr = function(a) {
      return this.imul(a, a.clone());
    }, he.prototype.sqr = function(a) {
      return this.mul(a, a);
    }, he.prototype.sqrt = function(a) {
      if (a.isZero())
        return a.clone();
      var r = this.m.andln(3);
      if (n(r % 2 === 1), r === 3) {
        var u = this.m.add(new y(1)).iushrn(2);
        return this.pow(a, u);
      }
      for (var l = this.m.subn(1), c = 0; !l.isZero() && l.andln(1) === 0; )
        c++, l.iushrn(1);
      n(!l.isZero());
      var b = new y(1).toRed(this), h = b.redNeg(), o = this.m.subn(1).iushrn(1), i = this.m.bitLength();
      for (i = new y(2 * i * i).toRed(this); this.pow(i, o).cmp(h) !== 0; )
        i.redIAdd(h);
      for (var m = this.pow(i, l), S = this.pow(a, l.addn(1).iushrn(1)), p = this.pow(a, l), g = c; p.cmp(b) !== 0; ) {
        for (var M = p, w = 0; M.cmp(b) !== 0; w++)
          M = M.redSqr();
        n(w < g);
        var k = this.pow(m, new y(1).iushln(g - w - 1));
        S = S.redMul(k), m = k.redSqr(), p = p.redMul(m), g = w;
      }
      return S;
    }, he.prototype.invm = function(a) {
      var r = a._invmp(this.m);
      return r.negative !== 0 ? (r.negative = 0, this.imod(r).redNeg()) : this.imod(r);
    }, he.prototype.pow = function(a, r) {
      if (r.isZero())
        return new y(1).toRed(this);
      if (r.cmpn(1) === 0)
        return a.clone();
      var u = 4, l = new Array(1 << u);
      l[0] = new y(1).toRed(this), l[1] = a;
      for (var c = 2; c < l.length; c++)
        l[c] = this.mul(l[c - 1], a);
      var b = l[0], h = 0, o = 0, i = r.bitLength() % 26;
      for (i === 0 && (i = 26), c = r.length - 1; c >= 0; c--) {
        for (var m = r.words[c], S = i - 1; S >= 0; S--) {
          var p = m >> S & 1;
          if (b !== l[0] && (b = this.sqr(b)), p === 0 && h === 0) {
            o = 0;
            continue;
          }
          h <<= 1, h |= p, o++, !(o !== u && (c !== 0 || S !== 0)) && (b = this.mul(b, l[h]), o = 0, h = 0);
        }
        i = 26;
      }
      return b;
    }, he.prototype.convertTo = function(a) {
      var r = a.umod(this.m);
      return r === a ? r.clone() : r;
    }, he.prototype.convertFrom = function(a) {
      var r = a.clone();
      return r.red = null, r;
    }, y.mont = function(a) {
      return new Ue(a);
    };
    function Ue(f) {
      he.call(this, f), this.shift = this.m.bitLength(), this.shift % 26 !== 0 && (this.shift += 26 - this.shift % 26), this.r = new y(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), this.minv = this.r.sub(this.minv);
    }
    d(Ue, he), Ue.prototype.convertTo = function(a) {
      return this.imod(a.ushln(this.shift));
    }, Ue.prototype.convertFrom = function(a) {
      var r = this.imod(a.mul(this.rinv));
      return r.red = null, r;
    }, Ue.prototype.imul = function(a, r) {
      if (a.isZero() || r.isZero())
        return a.words[0] = 0, a.length = 1, a;
      var u = a.imul(r), l = u.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), c = u.isub(l).iushrn(this.shift), b = c;
      return c.cmp(this.m) >= 0 ? b = c.isub(this.m) : c.cmpn(0) < 0 && (b = c.iadd(this.m)), b._forceRed(this);
    }, Ue.prototype.mul = function(a, r) {
      if (a.isZero() || r.isZero())
        return new y(0)._forceRed(this);
      var u = a.mul(r), l = u.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), c = u.isub(l).iushrn(this.shift), b = c;
      return c.cmp(this.m) >= 0 ? b = c.isub(this.m) : c.cmpn(0) < 0 && (b = c.iadd(this.m)), b._forceRed(this);
    }, Ue.prototype.invm = function(a) {
      var r = this.imod(a._invmp(this.m).mul(this.r2));
      return r._forceRed(this);
    };
  })(s, $n);
})(In);
var Sa = In.exports;
const Oa = /* @__PURE__ */ Qn(Sa), Ra = "logger/5.7.0";
let On = !1, Rn = !1;
const Gt = { debug: 1, default: 2, info: 2, warning: 3, error: 4, off: 5 };
let Nn = Gt.default, bn = null;
function Na() {
  try {
    const s = [];
    if (["NFD", "NFC", "NFKD", "NFKC"].forEach((e) => {
      try {
        if ("test".normalize(e) !== "test")
          throw new Error("bad normalize");
      } catch {
        s.push(e);
      }
    }), s.length)
      throw new Error("missing " + s.join(", "));
    if (String.fromCharCode(233).normalize("NFD") !== String.fromCharCode(101, 769))
      throw new Error("broken implementation");
  } catch (s) {
    return s.message;
  }
  return null;
}
const Dn = Na();
var Mn;
(function(s) {
  s.DEBUG = "DEBUG", s.INFO = "INFO", s.WARNING = "WARNING", s.ERROR = "ERROR", s.OFF = "OFF";
})(Mn || (Mn = {}));
var Ne;
(function(s) {
  s.UNKNOWN_ERROR = "UNKNOWN_ERROR", s.NOT_IMPLEMENTED = "NOT_IMPLEMENTED", s.UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION", s.NETWORK_ERROR = "NETWORK_ERROR", s.SERVER_ERROR = "SERVER_ERROR", s.TIMEOUT = "TIMEOUT", s.BUFFER_OVERRUN = "BUFFER_OVERRUN", s.NUMERIC_FAULT = "NUMERIC_FAULT", s.MISSING_NEW = "MISSING_NEW", s.INVALID_ARGUMENT = "INVALID_ARGUMENT", s.MISSING_ARGUMENT = "MISSING_ARGUMENT", s.UNEXPECTED_ARGUMENT = "UNEXPECTED_ARGUMENT", s.CALL_EXCEPTION = "CALL_EXCEPTION", s.INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS", s.NONCE_EXPIRED = "NONCE_EXPIRED", s.REPLACEMENT_UNDERPRICED = "REPLACEMENT_UNDERPRICED", s.UNPREDICTABLE_GAS_LIMIT = "UNPREDICTABLE_GAS_LIMIT", s.TRANSACTION_REPLACED = "TRANSACTION_REPLACED", s.ACTION_REJECTED = "ACTION_REJECTED";
})(Ne || (Ne = {}));
const Fn = "0123456789abcdef";
class O {
  constructor(e) {
    Object.defineProperty(this, "version", {
      enumerable: !0,
      value: e,
      writable: !1
    });
  }
  _log(e, t) {
    const n = e.toLowerCase();
    Gt[n] == null && this.throwArgumentError("invalid log level name", "logLevel", e), !(Nn > Gt[n]) && console.log.apply(console, t);
  }
  debug(...e) {
    this._log(O.levels.DEBUG, e);
  }
  info(...e) {
    this._log(O.levels.INFO, e);
  }
  warn(...e) {
    this._log(O.levels.WARNING, e);
  }
  makeError(e, t, n) {
    if (Rn)
      return this.makeError("censored error", t, {});
    t || (t = O.errors.UNKNOWN_ERROR), n || (n = {});
    const d = [];
    Object.keys(n).forEach((x) => {
      const E = n[x];
      try {
        if (E instanceof Uint8Array) {
          let N = "";
          for (let B = 0; B < E.length; B++)
            N += Fn[E[B] >> 4], N += Fn[E[B] & 15];
          d.push(x + "=Uint8Array(0x" + N + ")");
        } else
          d.push(x + "=" + JSON.stringify(E));
      } catch {
        d.push(x + "=" + JSON.stringify(n[x].toString()));
      }
    }), d.push(`code=${t}`), d.push(`version=${this.version}`);
    const y = e;
    let T = "";
    switch (t) {
      case Ne.NUMERIC_FAULT: {
        T = "NUMERIC_FAULT";
        const x = e;
        switch (x) {
          case "overflow":
          case "underflow":
          case "division-by-zero":
            T += "-" + x;
            break;
          case "negative-power":
          case "negative-width":
            T += "-unsupported";
            break;
          case "unbound-bitwise-result":
            T += "-unbound-result";
            break;
        }
        break;
      }
      case Ne.CALL_EXCEPTION:
      case Ne.INSUFFICIENT_FUNDS:
      case Ne.MISSING_NEW:
      case Ne.NONCE_EXPIRED:
      case Ne.REPLACEMENT_UNDERPRICED:
      case Ne.TRANSACTION_REPLACED:
      case Ne.UNPREDICTABLE_GAS_LIMIT:
        T = t;
        break;
    }
    T && (e += " [ See: https://links.ethers.org/v5-errors-" + T + " ]"), d.length && (e += " (" + d.join(", ") + ")");
    const _ = new Error(e);
    return _.reason = y, _.code = t, Object.keys(n).forEach(function(x) {
      _[x] = n[x];
    }), _;
  }
  throwError(e, t, n) {
    throw this.makeError(e, t, n);
  }
  throwArgumentError(e, t, n) {
    return this.throwError(e, O.errors.INVALID_ARGUMENT, {
      argument: t,
      value: n
    });
  }
  assert(e, t, n, d) {
    e || this.throwError(t, n, d);
  }
  assertArgument(e, t, n, d) {
    e || this.throwArgumentError(t, n, d);
  }
  checkNormalize(e) {
    Dn && this.throwError("platform missing String.prototype.normalize", O.errors.UNSUPPORTED_OPERATION, {
      operation: "String.prototype.normalize",
      form: Dn
    });
  }
  checkSafeUint53(e, t) {
    typeof e == "number" && (t == null && (t = "value not safe"), (e < 0 || e >= 9007199254740991) && this.throwError(t, O.errors.NUMERIC_FAULT, {
      operation: "checkSafeInteger",
      fault: "out-of-safe-range",
      value: e
    }), e % 1 && this.throwError(t, O.errors.NUMERIC_FAULT, {
      operation: "checkSafeInteger",
      fault: "non-integer",
      value: e
    }));
  }
  checkArgumentCount(e, t, n) {
    n ? n = ": " + n : n = "", e < t && this.throwError("missing argument" + n, O.errors.MISSING_ARGUMENT, {
      count: e,
      expectedCount: t
    }), e > t && this.throwError("too many arguments" + n, O.errors.UNEXPECTED_ARGUMENT, {
      count: e,
      expectedCount: t
    });
  }
  checkNew(e, t) {
    (e === Object || e == null) && this.throwError("missing new", O.errors.MISSING_NEW, { name: t.name });
  }
  checkAbstract(e, t) {
    e === t ? this.throwError("cannot instantiate abstract class " + JSON.stringify(t.name) + " directly; use a sub-class", O.errors.UNSUPPORTED_OPERATION, { name: e.name, operation: "new" }) : (e === Object || e == null) && this.throwError("missing new", O.errors.MISSING_NEW, { name: t.name });
  }
  static globalLogger() {
    return bn || (bn = new O(Ra)), bn;
  }
  static setCensorship(e, t) {
    if (!e && t && this.globalLogger().throwError("cannot permanently disable censorship", O.errors.UNSUPPORTED_OPERATION, {
      operation: "setCensorship"
    }), On) {
      if (!e)
        return;
      this.globalLogger().throwError("error censorship permanent", O.errors.UNSUPPORTED_OPERATION, {
        operation: "setCensorship"
      });
    }
    Rn = !!e, On = !!t;
  }
  static setLogLevel(e) {
    const t = Gt[e.toLowerCase()];
    if (t == null) {
      O.globalLogger().warn("invalid log level - " + e);
      return;
    }
    Nn = t;
  }
  static from(e) {
    return new O(e);
  }
}
O.errors = Ne;
O.levels = Mn;
const Da = "bytes/5.7.0", We = new O(Da);
function Jn(s) {
  return !!s.toHexString;
}
function Rt(s) {
  return s.slice || (s.slice = function() {
    const e = Array.prototype.slice.call(arguments);
    return Rt(new Uint8Array(Array.prototype.slice.apply(s, e)));
  }), s;
}
function Pn(s) {
  return typeof s == "number" && s == s && s % 1 === 0;
}
function xn(s) {
  if (s == null)
    return !1;
  if (s.constructor === Uint8Array)
    return !0;
  if (typeof s == "string" || !Pn(s.length) || s.length < 0)
    return !1;
  for (let e = 0; e < s.length; e++) {
    const t = s[e];
    if (!Pn(t) || t < 0 || t >= 256)
      return !1;
  }
  return !0;
}
function Se(s, e) {
  if (e || (e = {}), typeof s == "number") {
    We.checkSafeUint53(s, "invalid arrayify value");
    const t = [];
    for (; s; )
      t.unshift(s & 255), s = parseInt(String(s / 256));
    return t.length === 0 && t.push(0), Rt(new Uint8Array(t));
  }
  if (e.allowMissingPrefix && typeof s == "string" && s.substring(0, 2) !== "0x" && (s = "0x" + s), Jn(s) && (s = s.toHexString()), De(s)) {
    let t = s.substring(2);
    t.length % 2 && (e.hexPad === "left" ? t = "0" + t : e.hexPad === "right" ? t += "0" : We.throwArgumentError("hex data is odd-length", "value", s));
    const n = [];
    for (let d = 0; d < t.length; d += 2)
      n.push(parseInt(t.substring(d, d + 2), 16));
    return Rt(new Uint8Array(n));
  }
  return xn(s) ? Rt(new Uint8Array(s)) : We.throwArgumentError("invalid arrayify value", "value", s);
}
function It(s) {
  const e = s.map((d) => Se(d)), t = e.reduce((d, y) => d + y.length, 0), n = new Uint8Array(t);
  return e.reduce((d, y) => (n.set(y, d), d + y.length), 0), Rt(n);
}
function De(s, e) {
  return !(typeof s != "string" || !s.match(/^0x[0-9A-Fa-f]*$/) || e && s.length !== 2 + 2 * e);
}
const hn = "0123456789abcdef";
function ke(s, e) {
  if (e || (e = {}), typeof s == "number") {
    We.checkSafeUint53(s, "invalid hexlify value");
    let t = "";
    for (; s; )
      t = hn[s & 15] + t, s = Math.floor(s / 16);
    return t.length ? (t.length % 2 && (t = "0" + t), "0x" + t) : "0x00";
  }
  if (typeof s == "bigint")
    return s = s.toString(16), s.length % 2 ? "0x0" + s : "0x" + s;
  if (e.allowMissingPrefix && typeof s == "string" && s.substring(0, 2) !== "0x" && (s = "0x" + s), Jn(s))
    return s.toHexString();
  if (De(s))
    return s.length % 2 && (e.hexPad === "left" ? s = "0x0" + s.substring(2) : e.hexPad === "right" ? s += "0" : We.throwArgumentError("hex data is odd-length", "value", s)), s.toLowerCase();
  if (xn(s)) {
    let t = "0x";
    for (let n = 0; n < s.length; n++) {
      let d = s[n];
      t += hn[(d & 240) >> 4] + hn[d & 15];
    }
    return t;
  }
  return We.throwArgumentError("invalid hexlify value", "value", s);
}
function Fa(s, e, t) {
  return typeof s != "string" ? s = ke(s) : (!De(s) || s.length % 2) && We.throwArgumentError("invalid hexData", "value", s), e = 2 + 2 * e, t != null ? "0x" + s.substring(e, 2 + 2 * t) : "0x" + s.substring(e);
}
function Pa(s) {
  let e = "0x";
  return s.forEach((t) => {
    e += ke(t).substring(2);
  }), e;
}
function Xn(s, e) {
  for (typeof s != "string" ? s = ke(s) : De(s) || We.throwArgumentError("invalid hex string", "value", s), s.length > 2 * e + 2 && We.throwArgumentError("value out of range", "value", arguments[1]); s.length < 2 * e + 2; )
    s = "0x0" + s.substring(2);
  return s;
}
const La = "bignumber/5.7.0";
var Zt = Oa.BN;
const Ve = new O(La), gn = {}, Ln = 9007199254740991;
let Bn = !1;
class be {
  constructor(e, t) {
    e !== gn && Ve.throwError("cannot call constructor directly; use BigNumber.from", O.errors.UNSUPPORTED_OPERATION, {
      operation: "new (BigNumber)"
    }), this._hex = t, this._isBigNumber = !0, Object.freeze(this);
  }
  fromTwos(e) {
    return Ce(D(this).fromTwos(e));
  }
  toTwos(e) {
    return Ce(D(this).toTwos(e));
  }
  abs() {
    return this._hex[0] === "-" ? be.from(this._hex.substring(1)) : this;
  }
  add(e) {
    return Ce(D(this).add(D(e)));
  }
  sub(e) {
    return Ce(D(this).sub(D(e)));
  }
  div(e) {
    return be.from(e).isZero() && Re("division-by-zero", "div"), Ce(D(this).div(D(e)));
  }
  mul(e) {
    return Ce(D(this).mul(D(e)));
  }
  mod(e) {
    const t = D(e);
    return t.isNeg() && Re("division-by-zero", "mod"), Ce(D(this).umod(t));
  }
  pow(e) {
    const t = D(e);
    return t.isNeg() && Re("negative-power", "pow"), Ce(D(this).pow(t));
  }
  and(e) {
    const t = D(e);
    return (this.isNegative() || t.isNeg()) && Re("unbound-bitwise-result", "and"), Ce(D(this).and(t));
  }
  or(e) {
    const t = D(e);
    return (this.isNegative() || t.isNeg()) && Re("unbound-bitwise-result", "or"), Ce(D(this).or(t));
  }
  xor(e) {
    const t = D(e);
    return (this.isNegative() || t.isNeg()) && Re("unbound-bitwise-result", "xor"), Ce(D(this).xor(t));
  }
  mask(e) {
    return (this.isNegative() || e < 0) && Re("negative-width", "mask"), Ce(D(this).maskn(e));
  }
  shl(e) {
    return (this.isNegative() || e < 0) && Re("negative-width", "shl"), Ce(D(this).shln(e));
  }
  shr(e) {
    return (this.isNegative() || e < 0) && Re("negative-width", "shr"), Ce(D(this).shrn(e));
  }
  eq(e) {
    return D(this).eq(D(e));
  }
  lt(e) {
    return D(this).lt(D(e));
  }
  lte(e) {
    return D(this).lte(D(e));
  }
  gt(e) {
    return D(this).gt(D(e));
  }
  gte(e) {
    return D(this).gte(D(e));
  }
  isNegative() {
    return this._hex[0] === "-";
  }
  isZero() {
    return D(this).isZero();
  }
  toNumber() {
    try {
      return D(this).toNumber();
    } catch {
      Re("overflow", "toNumber", this.toString());
    }
    return null;
  }
  toBigInt() {
    try {
      return BigInt(this.toString());
    } catch {
    }
    return Ve.throwError("this platform does not support BigInt", O.errors.UNSUPPORTED_OPERATION, {
      value: this.toString()
    });
  }
  toString() {
    return arguments.length > 0 && (arguments[0] === 10 ? Bn || (Bn = !0, Ve.warn("BigNumber.toString does not accept any parameters; base-10 is assumed")) : arguments[0] === 16 ? Ve.throwError("BigNumber.toString does not accept any parameters; use bigNumber.toHexString()", O.errors.UNEXPECTED_ARGUMENT, {}) : Ve.throwError("BigNumber.toString does not accept parameters", O.errors.UNEXPECTED_ARGUMENT, {})), D(this).toString(10);
  }
  toHexString() {
    return this._hex;
  }
  toJSON(e) {
    return { type: "BigNumber", hex: this.toHexString() };
  }
  static from(e) {
    if (e instanceof be)
      return e;
    if (typeof e == "string")
      return e.match(/^-?0x[0-9a-f]+$/i) ? new be(gn, Nt(e)) : e.match(/^-?[0-9]+$/) ? new be(gn, Nt(new Zt(e))) : Ve.throwArgumentError("invalid BigNumber string", "value", e);
    if (typeof e == "number")
      return e % 1 && Re("underflow", "BigNumber.from", e), (e >= Ln || e <= -Ln) && Re("overflow", "BigNumber.from", e), be.from(String(e));
    const t = e;
    if (typeof t == "bigint")
      return be.from(t.toString());
    if (xn(t))
      return be.from(ke(t));
    if (t)
      if (t.toHexString) {
        const n = t.toHexString();
        if (typeof n == "string")
          return be.from(n);
      } else {
        let n = t._hex;
        if (n == null && t.type === "BigNumber" && (n = t.hex), typeof n == "string" && (De(n) || n[0] === "-" && De(n.substring(1))))
          return be.from(n);
      }
    return Ve.throwArgumentError("invalid BigNumber value", "value", e);
  }
  static isBigNumber(e) {
    return !!(e && e._isBigNumber);
  }
}
function Nt(s) {
  if (typeof s != "string")
    return Nt(s.toString(16));
  if (s[0] === "-")
    return s = s.substring(1), s[0] === "-" && Ve.throwArgumentError("invalid hex", "value", s), s = Nt(s), s === "0x00" ? s : "-" + s;
  if (s.substring(0, 2) !== "0x" && (s = "0x" + s), s === "0x")
    return "0x00";
  for (s.length % 2 && (s = "0x0" + s.substring(2)); s.length > 4 && s.substring(0, 4) === "0x00"; )
    s = "0x" + s.substring(4);
  return s;
}
function Ce(s) {
  return be.from(Nt(s));
}
function D(s) {
  const e = be.from(s).toHexString();
  return e[0] === "-" ? new Zt("-" + e.substring(3), 16) : new Zt(e.substring(2), 16);
}
function Re(s, e, t) {
  const n = { fault: s, operation: e };
  return t != null && (n.value = t), Ve.throwError(s, O.errors.NUMERIC_FAULT, n);
}
function Ba(s) {
  return new Zt(s, 36).toString(16);
}
const Ua = "properties/5.7.0";
globalThis && globalThis.__awaiter;
const Yn = new O(Ua);
function Ae(s, e, t) {
  Object.defineProperty(s, e, {
    enumerable: !0,
    value: t,
    writable: !1
  });
}
function zt(s, e) {
  for (let t = 0; t < 32; t++) {
    if (s[e])
      return s[e];
    if (!s.prototype || typeof s.prototype != "object")
      break;
    s = Object.getPrototypeOf(s.prototype).constructor;
  }
  return null;
}
const Va = { bigint: !0, boolean: !0, function: !0, number: !0, string: !0 };
function ea(s) {
  if (s == null || Va[typeof s])
    return !0;
  if (Array.isArray(s) || typeof s == "object") {
    if (!Object.isFrozen(s))
      return !1;
    const e = Object.keys(s);
    for (let t = 0; t < e.length; t++) {
      let n = null;
      try {
        n = s[e[t]];
      } catch {
        continue;
      }
      if (!ea(n))
        return !1;
    }
    return !0;
  }
  return Yn.throwArgumentError(`Cannot deepCopy ${typeof s}`, "object", s);
}
function za(s) {
  if (ea(s))
    return s;
  if (Array.isArray(s))
    return Object.freeze(s.map((e) => wn(e)));
  if (typeof s == "object") {
    const e = {};
    for (const t in s) {
      const n = s[t];
      n !== void 0 && Ae(e, t, wn(n));
    }
    return e;
  }
  return Yn.throwArgumentError(`Cannot deepCopy ${typeof s}`, "object", s);
}
function wn(s) {
  return za(s);
}
class tn {
  constructor(e) {
    for (const t in e)
      this[t] = wn(e[t]);
  }
}
const Bt = "abi/5.7.0", F = new O(Bt), gt = {};
let Un = { calldata: !0, memory: !0, storage: !0 }, qa = { calldata: !0, memory: !0 };
function qt(s, e) {
  if (s === "bytes" || s === "string") {
    if (Un[e])
      return !0;
  } else if (s === "address") {
    if (e === "payable")
      return !0;
  } else if ((s.indexOf("[") >= 0 || s === "tuple") && qa[e])
    return !0;
  return (Un[e] || e === "payable") && F.throwArgumentError("invalid modifier", "name", e), !1;
}
function Ha(s, e) {
  let t = s;
  function n(_) {
    F.throwArgumentError(`unexpected character at position ${_}`, "param", s);
  }
  s = s.replace(/\s/g, " ");
  function d(_) {
    let x = { type: "", name: "", parent: _, state: { allowType: !0 } };
    return e && (x.indexed = !1), x;
  }
  let y = { type: "", name: "", state: { allowType: !0 } }, T = y;
  for (let _ = 0; _ < s.length; _++) {
    let x = s[_];
    switch (x) {
      case "(":
        T.state.allowType && T.type === "" ? T.type = "tuple" : T.state.allowParams || n(_), T.state.allowType = !1, T.type = kt(T.type), T.components = [d(T)], T = T.components[0];
        break;
      case ")":
        delete T.state, T.name === "indexed" && (e || n(_), T.indexed = !0, T.name = ""), qt(T.type, T.name) && (T.name = ""), T.type = kt(T.type);
        let E = T;
        T = T.parent, T || n(_), delete E.parent, T.state.allowParams = !1, T.state.allowName = !0, T.state.allowArray = !0;
        break;
      case ",":
        delete T.state, T.name === "indexed" && (e || n(_), T.indexed = !0, T.name = ""), qt(T.type, T.name) && (T.name = ""), T.type = kt(T.type);
        let N = d(T.parent);
        T.parent.components.push(N), delete T.parent, T = N;
        break;
      case " ":
        T.state.allowType && T.type !== "" && (T.type = kt(T.type), delete T.state.allowType, T.state.allowName = !0, T.state.allowParams = !0), T.state.allowName && T.name !== "" && (T.name === "indexed" ? (e || n(_), T.indexed && n(_), T.indexed = !0, T.name = "") : qt(T.type, T.name) ? T.name = "" : T.state.allowName = !1);
        break;
      case "[":
        T.state.allowArray || n(_), T.type += x, T.state.allowArray = !1, T.state.allowName = !1, T.state.readArray = !0;
        break;
      case "]":
        T.state.readArray || n(_), T.type += x, T.state.readArray = !1, T.state.allowArray = !0, T.state.allowName = !0;
        break;
      default:
        T.state.allowType ? (T.type += x, T.state.allowParams = !0, T.state.allowArray = !0) : T.state.allowName ? (T.name += x, delete T.state.allowArray) : T.state.readArray ? T.type += x : n(_);
    }
  }
  return T.parent && F.throwArgumentError("unexpected eof", "param", s), delete y.state, T.name === "indexed" ? (e || n(t.length - 7), T.indexed && n(t.length - 7), T.indexed = !0, T.name = "") : qt(T.type, T.name) && (T.name = ""), y.type = kt(y.type), y;
}
function Kt(s, e) {
  for (let t in e)
    Ae(s, t, e[t]);
}
const P = Object.freeze({
  // Bare formatting, as is needed for computing a sighash of an event or function
  sighash: "sighash",
  // Human-Readable with Minimal spacing and without names (compact human-readable)
  minimal: "minimal",
  // Human-Readable with nice spacing, including all names
  full: "full",
  // JSON-format a la Solidity
  json: "json"
}), ja = new RegExp(/^(.*)\[([0-9]*)\]$/);
class Ie {
  constructor(e, t) {
    e !== gt && F.throwError("use fromString", O.errors.UNSUPPORTED_OPERATION, {
      operation: "new ParamType()"
    }), Kt(this, t);
    let n = this.type.match(ja);
    n ? Kt(this, {
      arrayLength: parseInt(n[2] || "-1"),
      arrayChildren: Ie.fromObject({
        type: n[1],
        components: this.components
      }),
      baseType: "array"
    }) : Kt(this, {
      arrayLength: null,
      arrayChildren: null,
      baseType: this.components != null ? "tuple" : this.type
    }), this._isParamType = !0, Object.freeze(this);
  }
  // Format the parameter fragment
  //   - sighash: "(uint256,address)"
  //   - minimal: "tuple(uint256,address) indexed"
  //   - full:    "tuple(uint256 foo, address bar) indexed baz"
  format(e) {
    if (e || (e = P.sighash), P[e] || F.throwArgumentError("invalid format type", "format", e), e === P.json) {
      let n = {
        type: this.baseType === "tuple" ? "tuple" : this.type,
        name: this.name || void 0
      };
      return typeof this.indexed == "boolean" && (n.indexed = this.indexed), this.components && (n.components = this.components.map((d) => JSON.parse(d.format(e)))), JSON.stringify(n);
    }
    let t = "";
    return this.baseType === "array" ? (t += this.arrayChildren.format(e), t += "[" + (this.arrayLength < 0 ? "" : String(this.arrayLength)) + "]") : this.baseType === "tuple" ? (e !== P.sighash && (t += this.type), t += "(" + this.components.map((n) => n.format(e)).join(e === P.full ? ", " : ",") + ")") : t += this.type, e !== P.sighash && (this.indexed === !0 && (t += " indexed"), e === P.full && this.name && (t += " " + this.name)), t;
  }
  static from(e, t) {
    return typeof e == "string" ? Ie.fromString(e, t) : Ie.fromObject(e);
  }
  static fromObject(e) {
    return Ie.isParamType(e) ? e : new Ie(gt, {
      name: e.name || null,
      type: kt(e.type),
      indexed: e.indexed == null ? null : !!e.indexed,
      components: e.components ? e.components.map(Ie.fromObject) : null
    });
  }
  static fromString(e, t) {
    function n(d) {
      return Ie.fromObject({
        name: d.name,
        type: d.type,
        indexed: d.indexed,
        components: d.components
      });
    }
    return n(Ha(e, !!t));
  }
  static isParamType(e) {
    return !!(e != null && e._isParamType);
  }
}
function Dt(s, e) {
  return Ga(s).map((t) => Ie.fromString(t, e));
}
class je {
  constructor(e, t) {
    e !== gt && F.throwError("use a static from method", O.errors.UNSUPPORTED_OPERATION, {
      operation: "new Fragment()"
    }), Kt(this, t), this._isFragment = !0, Object.freeze(this);
  }
  static from(e) {
    return je.isFragment(e) ? e : typeof e == "string" ? je.fromString(e) : je.fromObject(e);
  }
  static fromObject(e) {
    if (je.isFragment(e))
      return e;
    switch (e.type) {
      case "function":
        return Be.fromObject(e);
      case "event":
        return He.fromObject(e);
      case "constructor":
        return Le.fromObject(e);
      case "error":
        return Xe.fromObject(e);
      case "fallback":
      case "receive":
        return null;
    }
    return F.throwArgumentError("invalid fragment object", "value", e);
  }
  static fromString(e) {
    return e = e.replace(/\s/g, " "), e = e.replace(/\(/g, " (").replace(/\)/g, ") ").replace(/\s+/g, " "), e = e.trim(), e.split(" ")[0] === "event" ? He.fromString(e.substring(5).trim()) : e.split(" ")[0] === "function" ? Be.fromString(e.substring(8).trim()) : e.split("(")[0].trim() === "constructor" ? Le.fromString(e.trim()) : e.split(" ")[0] === "error" ? Xe.fromString(e.substring(5).trim()) : F.throwArgumentError("unsupported fragment", "value", e);
  }
  static isFragment(e) {
    return !!(e && e._isFragment);
  }
}
class He extends je {
  format(e) {
    if (e || (e = P.sighash), P[e] || F.throwArgumentError("invalid format type", "format", e), e === P.json)
      return JSON.stringify({
        type: "event",
        anonymous: this.anonymous,
        name: this.name,
        inputs: this.inputs.map((n) => JSON.parse(n.format(e)))
      });
    let t = "";
    return e !== P.sighash && (t += "event "), t += this.name + "(" + this.inputs.map((n) => n.format(e)).join(e === P.full ? ", " : ",") + ") ", e !== P.sighash && this.anonymous && (t += "anonymous "), t.trim();
  }
  static from(e) {
    return typeof e == "string" ? He.fromString(e) : He.fromObject(e);
  }
  static fromObject(e) {
    if (He.isEventFragment(e))
      return e;
    e.type !== "event" && F.throwArgumentError("invalid event object", "value", e);
    const t = {
      name: Ft(e.name),
      anonymous: e.anonymous,
      inputs: e.inputs ? e.inputs.map(Ie.fromObject) : [],
      type: "event"
    };
    return new He(gt, t);
  }
  static fromString(e) {
    let t = e.match(Pt);
    t || F.throwArgumentError("invalid event string", "value", e);
    let n = !1;
    return t[3].split(" ").forEach((d) => {
      switch (d.trim()) {
        case "anonymous":
          n = !0;
          break;
        case "":
          break;
        default:
          F.warn("unknown modifier: " + d);
      }
    }), He.fromObject({
      name: t[1].trim(),
      anonymous: n,
      inputs: Dt(t[2], !0),
      type: "event"
    });
  }
  static isEventFragment(e) {
    return e && e._isFragment && e.type === "event";
  }
}
function ta(s, e) {
  e.gas = null;
  let t = s.split("@");
  return t.length !== 1 ? (t.length > 2 && F.throwArgumentError("invalid human-readable ABI signature", "value", s), t[1].match(/^[0-9]+$/) || F.throwArgumentError("invalid human-readable ABI signature gas", "value", s), e.gas = be.from(t[1]), t[0]) : s;
}
function na(s, e) {
  e.constant = !1, e.payable = !1, e.stateMutability = "nonpayable", s.split(" ").forEach((t) => {
    switch (t.trim()) {
      case "constant":
        e.constant = !0;
        break;
      case "payable":
        e.payable = !0, e.stateMutability = "payable";
        break;
      case "nonpayable":
        e.payable = !1, e.stateMutability = "nonpayable";
        break;
      case "pure":
        e.constant = !0, e.stateMutability = "pure";
        break;
      case "view":
        e.constant = !0, e.stateMutability = "view";
        break;
      case "external":
      case "public":
      case "":
        break;
      default:
        console.log("unknown modifier: " + t);
    }
  });
}
function aa(s) {
  let e = {
    constant: !1,
    payable: !0,
    stateMutability: "payable"
  };
  return s.stateMutability != null ? (e.stateMutability = s.stateMutability, e.constant = e.stateMutability === "view" || e.stateMutability === "pure", s.constant != null && !!s.constant !== e.constant && F.throwArgumentError("cannot have constant function with mutability " + e.stateMutability, "value", s), e.payable = e.stateMutability === "payable", s.payable != null && !!s.payable !== e.payable && F.throwArgumentError("cannot have payable function with mutability " + e.stateMutability, "value", s)) : s.payable != null ? (e.payable = !!s.payable, s.constant == null && !e.payable && s.type !== "constructor" && F.throwArgumentError("unable to determine stateMutability", "value", s), e.constant = !!s.constant, e.constant ? e.stateMutability = "view" : e.stateMutability = e.payable ? "payable" : "nonpayable", e.payable && e.constant && F.throwArgumentError("cannot have constant payable function", "value", s)) : s.constant != null ? (e.constant = !!s.constant, e.payable = !e.constant, e.stateMutability = e.constant ? "view" : "payable") : s.type !== "constructor" && F.throwArgumentError("unable to determine stateMutability", "value", s), e;
}
class Le extends je {
  format(e) {
    if (e || (e = P.sighash), P[e] || F.throwArgumentError("invalid format type", "format", e), e === P.json)
      return JSON.stringify({
        type: "constructor",
        stateMutability: this.stateMutability !== "nonpayable" ? this.stateMutability : void 0,
        payable: this.payable,
        gas: this.gas ? this.gas.toNumber() : void 0,
        inputs: this.inputs.map((n) => JSON.parse(n.format(e)))
      });
    e === P.sighash && F.throwError("cannot format a constructor for sighash", O.errors.UNSUPPORTED_OPERATION, {
      operation: "format(sighash)"
    });
    let t = "constructor(" + this.inputs.map((n) => n.format(e)).join(e === P.full ? ", " : ",") + ") ";
    return this.stateMutability && this.stateMutability !== "nonpayable" && (t += this.stateMutability + " "), t.trim();
  }
  static from(e) {
    return typeof e == "string" ? Le.fromString(e) : Le.fromObject(e);
  }
  static fromObject(e) {
    if (Le.isConstructorFragment(e))
      return e;
    e.type !== "constructor" && F.throwArgumentError("invalid constructor object", "value", e);
    let t = aa(e);
    t.constant && F.throwArgumentError("constructor cannot be constant", "value", e);
    const n = {
      name: null,
      type: e.type,
      inputs: e.inputs ? e.inputs.map(Ie.fromObject) : [],
      payable: t.payable,
      stateMutability: t.stateMutability,
      gas: e.gas ? be.from(e.gas) : null
    };
    return new Le(gt, n);
  }
  static fromString(e) {
    let t = { type: "constructor" };
    e = ta(e, t);
    let n = e.match(Pt);
    return (!n || n[1].trim() !== "constructor") && F.throwArgumentError("invalid constructor string", "value", e), t.inputs = Dt(n[2].trim(), !1), na(n[3].trim(), t), Le.fromObject(t);
  }
  static isConstructorFragment(e) {
    return e && e._isFragment && e.type === "constructor";
  }
}
class Be extends Le {
  format(e) {
    if (e || (e = P.sighash), P[e] || F.throwArgumentError("invalid format type", "format", e), e === P.json)
      return JSON.stringify({
        type: "function",
        name: this.name,
        constant: this.constant,
        stateMutability: this.stateMutability !== "nonpayable" ? this.stateMutability : void 0,
        payable: this.payable,
        gas: this.gas ? this.gas.toNumber() : void 0,
        inputs: this.inputs.map((n) => JSON.parse(n.format(e))),
        outputs: this.outputs.map((n) => JSON.parse(n.format(e)))
      });
    let t = "";
    return e !== P.sighash && (t += "function "), t += this.name + "(" + this.inputs.map((n) => n.format(e)).join(e === P.full ? ", " : ",") + ") ", e !== P.sighash && (this.stateMutability ? this.stateMutability !== "nonpayable" && (t += this.stateMutability + " ") : this.constant && (t += "view "), this.outputs && this.outputs.length && (t += "returns (" + this.outputs.map((n) => n.format(e)).join(", ") + ") "), this.gas != null && (t += "@" + this.gas.toString() + " ")), t.trim();
  }
  static from(e) {
    return typeof e == "string" ? Be.fromString(e) : Be.fromObject(e);
  }
  static fromObject(e) {
    if (Be.isFunctionFragment(e))
      return e;
    e.type !== "function" && F.throwArgumentError("invalid function object", "value", e);
    let t = aa(e);
    const n = {
      type: e.type,
      name: Ft(e.name),
      constant: t.constant,
      inputs: e.inputs ? e.inputs.map(Ie.fromObject) : [],
      outputs: e.outputs ? e.outputs.map(Ie.fromObject) : [],
      payable: t.payable,
      stateMutability: t.stateMutability,
      gas: e.gas ? be.from(e.gas) : null
    };
    return new Be(gt, n);
  }
  static fromString(e) {
    let t = { type: "function" };
    e = ta(e, t);
    let n = e.split(" returns ");
    n.length > 2 && F.throwArgumentError("invalid function string", "value", e);
    let d = n[0].match(Pt);
    if (d || F.throwArgumentError("invalid function signature", "value", e), t.name = d[1].trim(), t.name && Ft(t.name), t.inputs = Dt(d[2], !1), na(d[3].trim(), t), n.length > 1) {
      let y = n[1].match(Pt);
      (y[1].trim() != "" || y[3].trim() != "") && F.throwArgumentError("unexpected tokens", "value", e), t.outputs = Dt(y[2], !1);
    } else
      t.outputs = [];
    return Be.fromObject(t);
  }
  static isFunctionFragment(e) {
    return e && e._isFragment && e.type === "function";
  }
}
function Vn(s) {
  const e = s.format();
  return (e === "Error(string)" || e === "Panic(uint256)") && F.throwArgumentError(`cannot specify user defined ${e} error`, "fragment", s), s;
}
class Xe extends je {
  format(e) {
    if (e || (e = P.sighash), P[e] || F.throwArgumentError("invalid format type", "format", e), e === P.json)
      return JSON.stringify({
        type: "error",
        name: this.name,
        inputs: this.inputs.map((n) => JSON.parse(n.format(e)))
      });
    let t = "";
    return e !== P.sighash && (t += "error "), t += this.name + "(" + this.inputs.map((n) => n.format(e)).join(e === P.full ? ", " : ",") + ") ", t.trim();
  }
  static from(e) {
    return typeof e == "string" ? Xe.fromString(e) : Xe.fromObject(e);
  }
  static fromObject(e) {
    if (Xe.isErrorFragment(e))
      return e;
    e.type !== "error" && F.throwArgumentError("invalid error object", "value", e);
    const t = {
      type: e.type,
      name: Ft(e.name),
      inputs: e.inputs ? e.inputs.map(Ie.fromObject) : []
    };
    return Vn(new Xe(gt, t));
  }
  static fromString(e) {
    let t = { type: "error" }, n = e.match(Pt);
    return n || F.throwArgumentError("invalid error signature", "value", e), t.name = n[1].trim(), t.name && Ft(t.name), t.inputs = Dt(n[2], !1), Vn(Xe.fromObject(t));
  }
  static isErrorFragment(e) {
    return e && e._isFragment && e.type === "error";
  }
}
function kt(s) {
  return s.match(/^uint($|[^1-9])/) ? s = "uint256" + s.substring(4) : s.match(/^int($|[^1-9])/) && (s = "int256" + s.substring(3)), s;
}
const Wa = new RegExp("^[a-zA-Z$_][a-zA-Z0-9$_]*$");
function Ft(s) {
  return (!s || !s.match(Wa)) && F.throwArgumentError(`invalid identifier "${s}"`, "value", s), s;
}
const Pt = new RegExp("^([^)(]*)\\((.*)\\)([^)(]*)$");
function Ga(s) {
  s = s.trim();
  let e = [], t = "", n = 0;
  for (let d = 0; d < s.length; d++) {
    let y = s[d];
    y === "," && n === 0 ? (e.push(t), t = "") : (t += y, y === "(" ? n++ : y === ")" && (n--, n === -1 && F.throwArgumentError("unbalanced parenthesis", "value", s)));
  }
  return t && e.push(t), e;
}
const An = new O(Bt);
class Ge {
  constructor(e, t, n, d) {
    this.name = e, this.type = t, this.localName = n, this.dynamic = d;
  }
  _throwError(e, t) {
    An.throwArgumentError(e, this.localName, t);
  }
}
class _n {
  constructor(e) {
    Ae(this, "wordSize", e || 32), this._data = [], this._dataLength = 0, this._padding = new Uint8Array(e);
  }
  get data() {
    return Pa(this._data);
  }
  get length() {
    return this._dataLength;
  }
  _writeData(e) {
    return this._data.push(e), this._dataLength += e.length, e.length;
  }
  appendWriter(e) {
    return this._writeData(It(e._data));
  }
  // Arrayish items; padded on the right to wordSize
  writeBytes(e) {
    let t = Se(e);
    const n = t.length % this.wordSize;
    return n && (t = It([t, this._padding.slice(n)])), this._writeData(t);
  }
  _getValue(e) {
    let t = Se(be.from(e));
    return t.length > this.wordSize && An.throwError("value out-of-bounds", O.errors.BUFFER_OVERRUN, {
      length: this.wordSize,
      offset: t.length
    }), t.length % this.wordSize && (t = It([this._padding.slice(t.length % this.wordSize), t])), t;
  }
  // BigNumberish items; padded on the left to wordSize
  writeValue(e) {
    return this._writeData(this._getValue(e));
  }
  writeUpdatableValue() {
    const e = this._data.length;
    return this._data.push(this._padding), this._dataLength += this.wordSize, (t) => {
      this._data[e] = this._getValue(t);
    };
  }
}
class $t {
  constructor(e, t, n, d) {
    Ae(this, "_data", Se(e)), Ae(this, "wordSize", t || 32), Ae(this, "_coerceFunc", n), Ae(this, "allowLoose", d), this._offset = 0;
  }
  get data() {
    return ke(this._data);
  }
  get consumed() {
    return this._offset;
  }
  // The default Coerce function
  static coerce(e, t) {
    let n = e.match("^u?int([0-9]+)$");
    return n && parseInt(n[1]) <= 48 && (t = t.toNumber()), t;
  }
  coerce(e, t) {
    return this._coerceFunc ? this._coerceFunc(e, t) : $t.coerce(e, t);
  }
  _peekBytes(e, t, n) {
    let d = Math.ceil(t / this.wordSize) * this.wordSize;
    return this._offset + d > this._data.length && (this.allowLoose && n && this._offset + t <= this._data.length ? d = t : An.throwError("data out-of-bounds", O.errors.BUFFER_OVERRUN, {
      length: this._data.length,
      offset: this._offset + d
    })), this._data.slice(this._offset, this._offset + d);
  }
  subReader(e) {
    return new $t(this._data.slice(this._offset + e), this.wordSize, this._coerceFunc, this.allowLoose);
  }
  readBytes(e, t) {
    let n = this._peekBytes(0, e, !!t);
    return this._offset += n.length, n.slice(0, e);
  }
  readValue() {
    return be.from(this.readBytes(this.wordSize));
  }
}
var ia = { exports: {} };
/**
 * [js-sha3]{@link https://github.com/emn178/js-sha3}
 *
 * @version 0.8.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2018
 * @license MIT
 */
(function(s) {
  (function() {
    var e = "input is invalid type", t = "finalize already called", n = typeof window == "object", d = n ? window : {};
    d.JS_SHA3_NO_WINDOW && (n = !1);
    var y = !n && typeof self == "object", T = !d.JS_SHA3_NO_NODE_JS && typeof process == "object" && process.versions && process.versions.node;
    T ? d = $n : y && (d = self);
    var _ = !d.JS_SHA3_NO_COMMON_JS && !0 && s.exports, x = !d.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer < "u", E = "0123456789abcdef".split(""), N = [31, 7936, 2031616, 520093696], B = [4, 1024, 262144, 67108864], L = [1, 256, 65536, 16777216], ve = [6, 1536, 393216, 100663296], we = [0, 8, 16, 24], Ut = [
      1,
      0,
      32898,
      0,
      32906,
      2147483648,
      2147516416,
      2147483648,
      32907,
      0,
      2147483649,
      0,
      2147516545,
      2147483648,
      32777,
      2147483648,
      138,
      0,
      136,
      0,
      2147516425,
      0,
      2147483658,
      0,
      2147516555,
      0,
      139,
      2147483648,
      32905,
      2147483648,
      32771,
      2147483648,
      32770,
      2147483648,
      128,
      2147483648,
      32778,
      0,
      2147483658,
      2147483648,
      2147516545,
      2147483648,
      32896,
      2147483648,
      2147483649,
      0,
      2147516424,
      2147483648
    ], Vt = [224, 256, 384, 512], Mt = [128, 256], xt = ["hex", "buffer", "arrayBuffer", "array", "digest"], At = {
      128: 168,
      256: 136
    };
    (d.JS_SHA3_NO_NODE_JS || !Array.isArray) && (Array.isArray = function(p) {
      return Object.prototype.toString.call(p) === "[object Array]";
    }), x && (d.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView) && (ArrayBuffer.isView = function(p) {
      return typeof p == "object" && p.buffer && p.buffer.constructor === ArrayBuffer;
    });
    for (var Et = function(p, g, M) {
      return function(w) {
        return new i(p, g, p).update(w)[M]();
      };
    }, wt = function(p, g, M) {
      return function(w, k) {
        return new i(p, g, k).update(w)[M]();
      };
    }, Ee = function(p, g, M) {
      return function(w, k, C, I) {
        return a["cshake" + p].update(w, k, C, I)[M]();
      };
    }, Ye = function(p, g, M) {
      return function(w, k, C, I) {
        return a["kmac" + p].update(w, k, C, I)[M]();
      };
    }, et = function(p, g, M, w) {
      for (var k = 0; k < xt.length; ++k) {
        var C = xt[k];
        p[C] = g(M, w, C);
      }
      return p;
    }, Ct = function(p, g) {
      var M = Et(p, g, "hex");
      return M.create = function() {
        return new i(p, g, p);
      }, M.update = function(w) {
        return M.create().update(w);
      }, et(M, Et, p, g);
    }, St = function(p, g) {
      var M = wt(p, g, "hex");
      return M.create = function(w) {
        return new i(p, g, w);
      }, M.update = function(w, k) {
        return M.create(k).update(w);
      }, et(M, wt, p, g);
    }, he = function(p, g) {
      var M = At[p], w = Ee(p, g, "hex");
      return w.create = function(k, C, I) {
        return !C && !I ? a["shake" + p].create(k) : new i(p, g, k).bytepad([C, I], M);
      }, w.update = function(k, C, I, v) {
        return w.create(C, I, v).update(k);
      }, et(w, Ee, p, g);
    }, Ue = function(p, g) {
      var M = At[p], w = Ye(p, g, "hex");
      return w.create = function(k, C, I) {
        return new m(p, g, C).bytepad(["KMAC", I], M).bytepad([k], M);
      }, w.update = function(k, C, I, v) {
        return w.create(k, I, v).update(C);
      }, et(w, Ye, p, g);
    }, f = [
      { name: "keccak", padding: L, bits: Vt, createMethod: Ct },
      { name: "sha3", padding: ve, bits: Vt, createMethod: Ct },
      { name: "shake", padding: N, bits: Mt, createMethod: St },
      { name: "cshake", padding: B, bits: Mt, createMethod: he },
      { name: "kmac", padding: B, bits: Mt, createMethod: Ue }
    ], a = {}, r = [], u = 0; u < f.length; ++u)
      for (var l = f[u], c = l.bits, b = 0; b < c.length; ++b) {
        var h = l.name + "_" + c[b];
        if (r.push(h), a[h] = l.createMethod(c[b], l.padding), l.name !== "sha3") {
          var o = l.name + c[b];
          r.push(o), a[o] = a[h];
        }
      }
    function i(p, g, M) {
      this.blocks = [], this.s = [], this.padding = g, this.outputBits = M, this.reset = !0, this.finalized = !1, this.block = 0, this.start = 0, this.blockCount = 1600 - (p << 1) >> 5, this.byteCount = this.blockCount << 2, this.outputBlocks = M >> 5, this.extraBytes = (M & 31) >> 3;
      for (var w = 0; w < 50; ++w)
        this.s[w] = 0;
    }
    i.prototype.update = function(p) {
      if (this.finalized)
        throw new Error(t);
      var g, M = typeof p;
      if (M !== "string") {
        if (M === "object") {
          if (p === null)
            throw new Error(e);
          if (x && p.constructor === ArrayBuffer)
            p = new Uint8Array(p);
          else if (!Array.isArray(p) && (!x || !ArrayBuffer.isView(p)))
            throw new Error(e);
        } else
          throw new Error(e);
        g = !0;
      }
      for (var w = this.blocks, k = this.byteCount, C = p.length, I = this.blockCount, v = 0, ge = this.s, A, R; v < C; ) {
        if (this.reset)
          for (this.reset = !1, w[0] = this.block, A = 1; A < I + 1; ++A)
            w[A] = 0;
        if (g)
          for (A = this.start; v < C && A < k; ++v)
            w[A >> 2] |= p[v] << we[A++ & 3];
        else
          for (A = this.start; v < C && A < k; ++v)
            R = p.charCodeAt(v), R < 128 ? w[A >> 2] |= R << we[A++ & 3] : R < 2048 ? (w[A >> 2] |= (192 | R >> 6) << we[A++ & 3], w[A >> 2] |= (128 | R & 63) << we[A++ & 3]) : R < 55296 || R >= 57344 ? (w[A >> 2] |= (224 | R >> 12) << we[A++ & 3], w[A >> 2] |= (128 | R >> 6 & 63) << we[A++ & 3], w[A >> 2] |= (128 | R & 63) << we[A++ & 3]) : (R = 65536 + ((R & 1023) << 10 | p.charCodeAt(++v) & 1023), w[A >> 2] |= (240 | R >> 18) << we[A++ & 3], w[A >> 2] |= (128 | R >> 12 & 63) << we[A++ & 3], w[A >> 2] |= (128 | R >> 6 & 63) << we[A++ & 3], w[A >> 2] |= (128 | R & 63) << we[A++ & 3]);
        if (this.lastByteIndex = A, A >= k) {
          for (this.start = A - k, this.block = w[I], A = 0; A < I; ++A)
            ge[A] ^= w[A];
          S(ge), this.reset = !0;
        } else
          this.start = A;
      }
      return this;
    }, i.prototype.encode = function(p, g) {
      var M = p & 255, w = 1, k = [M];
      for (p = p >> 8, M = p & 255; M > 0; )
        k.unshift(M), p = p >> 8, M = p & 255, ++w;
      return g ? k.push(w) : k.unshift(w), this.update(k), k.length;
    }, i.prototype.encodeString = function(p) {
      var g, M = typeof p;
      if (M !== "string") {
        if (M === "object") {
          if (p === null)
            throw new Error(e);
          if (x && p.constructor === ArrayBuffer)
            p = new Uint8Array(p);
          else if (!Array.isArray(p) && (!x || !ArrayBuffer.isView(p)))
            throw new Error(e);
        } else
          throw new Error(e);
        g = !0;
      }
      var w = 0, k = p.length;
      if (g)
        w = k;
      else
        for (var C = 0; C < p.length; ++C) {
          var I = p.charCodeAt(C);
          I < 128 ? w += 1 : I < 2048 ? w += 2 : I < 55296 || I >= 57344 ? w += 3 : (I = 65536 + ((I & 1023) << 10 | p.charCodeAt(++C) & 1023), w += 4);
        }
      return w += this.encode(w * 8), this.update(p), w;
    }, i.prototype.bytepad = function(p, g) {
      for (var M = this.encode(g), w = 0; w < p.length; ++w)
        M += this.encodeString(p[w]);
      var k = g - M % g, C = [];
      return C.length = k, this.update(C), this;
    }, i.prototype.finalize = function() {
      if (!this.finalized) {
        this.finalized = !0;
        var p = this.blocks, g = this.lastByteIndex, M = this.blockCount, w = this.s;
        if (p[g >> 2] |= this.padding[g & 3], this.lastByteIndex === this.byteCount)
          for (p[0] = p[M], g = 1; g < M + 1; ++g)
            p[g] = 0;
        for (p[M - 1] |= 2147483648, g = 0; g < M; ++g)
          w[g] ^= p[g];
        S(w);
      }
    }, i.prototype.toString = i.prototype.hex = function() {
      this.finalize();
      for (var p = this.blockCount, g = this.s, M = this.outputBlocks, w = this.extraBytes, k = 0, C = 0, I = "", v; C < M; ) {
        for (k = 0; k < p && C < M; ++k, ++C)
          v = g[k], I += E[v >> 4 & 15] + E[v & 15] + E[v >> 12 & 15] + E[v >> 8 & 15] + E[v >> 20 & 15] + E[v >> 16 & 15] + E[v >> 28 & 15] + E[v >> 24 & 15];
        C % p === 0 && (S(g), k = 0);
      }
      return w && (v = g[k], I += E[v >> 4 & 15] + E[v & 15], w > 1 && (I += E[v >> 12 & 15] + E[v >> 8 & 15]), w > 2 && (I += E[v >> 20 & 15] + E[v >> 16 & 15])), I;
    }, i.prototype.arrayBuffer = function() {
      this.finalize();
      var p = this.blockCount, g = this.s, M = this.outputBlocks, w = this.extraBytes, k = 0, C = 0, I = this.outputBits >> 3, v;
      w ? v = new ArrayBuffer(M + 1 << 2) : v = new ArrayBuffer(I);
      for (var ge = new Uint32Array(v); C < M; ) {
        for (k = 0; k < p && C < M; ++k, ++C)
          ge[C] = g[k];
        C % p === 0 && S(g);
      }
      return w && (ge[k] = g[k], v = v.slice(0, I)), v;
    }, i.prototype.buffer = i.prototype.arrayBuffer, i.prototype.digest = i.prototype.array = function() {
      this.finalize();
      for (var p = this.blockCount, g = this.s, M = this.outputBlocks, w = this.extraBytes, k = 0, C = 0, I = [], v, ge; C < M; ) {
        for (k = 0; k < p && C < M; ++k, ++C)
          v = C << 2, ge = g[k], I[v] = ge & 255, I[v + 1] = ge >> 8 & 255, I[v + 2] = ge >> 16 & 255, I[v + 3] = ge >> 24 & 255;
        C % p === 0 && S(g);
      }
      return w && (v = C << 2, ge = g[k], I[v] = ge & 255, w > 1 && (I[v + 1] = ge >> 8 & 255), w > 2 && (I[v + 2] = ge >> 16 & 255)), I;
    };
    function m(p, g, M) {
      i.call(this, p, g, M);
    }
    m.prototype = new i(), m.prototype.finalize = function() {
      return this.encode(this.outputBits, !0), i.prototype.finalize.call(this);
    };
    var S = function(p) {
      var g, M, w, k, C, I, v, ge, A, R, tt, U, V, nt, z, q, at, H, j, it, W, G, st, K, Z, rt, $, Q, pt, J, X, yt, Y, ee, ut, te, ne, ot, ae, ie, lt, se, re, mt, pe, ye, dt, ue, oe, ct, le, me, ft, de, ce, Tt, fe, Te, Ke, Ze, $e, Qe, Je;
      for (w = 0; w < 48; w += 2)
        k = p[0] ^ p[10] ^ p[20] ^ p[30] ^ p[40], C = p[1] ^ p[11] ^ p[21] ^ p[31] ^ p[41], I = p[2] ^ p[12] ^ p[22] ^ p[32] ^ p[42], v = p[3] ^ p[13] ^ p[23] ^ p[33] ^ p[43], ge = p[4] ^ p[14] ^ p[24] ^ p[34] ^ p[44], A = p[5] ^ p[15] ^ p[25] ^ p[35] ^ p[45], R = p[6] ^ p[16] ^ p[26] ^ p[36] ^ p[46], tt = p[7] ^ p[17] ^ p[27] ^ p[37] ^ p[47], U = p[8] ^ p[18] ^ p[28] ^ p[38] ^ p[48], V = p[9] ^ p[19] ^ p[29] ^ p[39] ^ p[49], g = U ^ (I << 1 | v >>> 31), M = V ^ (v << 1 | I >>> 31), p[0] ^= g, p[1] ^= M, p[10] ^= g, p[11] ^= M, p[20] ^= g, p[21] ^= M, p[30] ^= g, p[31] ^= M, p[40] ^= g, p[41] ^= M, g = k ^ (ge << 1 | A >>> 31), M = C ^ (A << 1 | ge >>> 31), p[2] ^= g, p[3] ^= M, p[12] ^= g, p[13] ^= M, p[22] ^= g, p[23] ^= M, p[32] ^= g, p[33] ^= M, p[42] ^= g, p[43] ^= M, g = I ^ (R << 1 | tt >>> 31), M = v ^ (tt << 1 | R >>> 31), p[4] ^= g, p[5] ^= M, p[14] ^= g, p[15] ^= M, p[24] ^= g, p[25] ^= M, p[34] ^= g, p[35] ^= M, p[44] ^= g, p[45] ^= M, g = ge ^ (U << 1 | V >>> 31), M = A ^ (V << 1 | U >>> 31), p[6] ^= g, p[7] ^= M, p[16] ^= g, p[17] ^= M, p[26] ^= g, p[27] ^= M, p[36] ^= g, p[37] ^= M, p[46] ^= g, p[47] ^= M, g = R ^ (k << 1 | C >>> 31), M = tt ^ (C << 1 | k >>> 31), p[8] ^= g, p[9] ^= M, p[18] ^= g, p[19] ^= M, p[28] ^= g, p[29] ^= M, p[38] ^= g, p[39] ^= M, p[48] ^= g, p[49] ^= M, nt = p[0], z = p[1], ye = p[11] << 4 | p[10] >>> 28, dt = p[10] << 4 | p[11] >>> 28, Q = p[20] << 3 | p[21] >>> 29, pt = p[21] << 3 | p[20] >>> 29, Ze = p[31] << 9 | p[30] >>> 23, $e = p[30] << 9 | p[31] >>> 23, se = p[40] << 18 | p[41] >>> 14, re = p[41] << 18 | p[40] >>> 14, ee = p[2] << 1 | p[3] >>> 31, ut = p[3] << 1 | p[2] >>> 31, q = p[13] << 12 | p[12] >>> 20, at = p[12] << 12 | p[13] >>> 20, ue = p[22] << 10 | p[23] >>> 22, oe = p[23] << 10 | p[22] >>> 22, J = p[33] << 13 | p[32] >>> 19, X = p[32] << 13 | p[33] >>> 19, Qe = p[42] << 2 | p[43] >>> 30, Je = p[43] << 2 | p[42] >>> 30, de = p[5] << 30 | p[4] >>> 2, ce = p[4] << 30 | p[5] >>> 2, te = p[14] << 6 | p[15] >>> 26, ne = p[15] << 6 | p[14] >>> 26, H = p[25] << 11 | p[24] >>> 21, j = p[24] << 11 | p[25] >>> 21, ct = p[34] << 15 | p[35] >>> 17, le = p[35] << 15 | p[34] >>> 17, yt = p[45] << 29 | p[44] >>> 3, Y = p[44] << 29 | p[45] >>> 3, K = p[6] << 28 | p[7] >>> 4, Z = p[7] << 28 | p[6] >>> 4, Tt = p[17] << 23 | p[16] >>> 9, fe = p[16] << 23 | p[17] >>> 9, ot = p[26] << 25 | p[27] >>> 7, ae = p[27] << 25 | p[26] >>> 7, it = p[36] << 21 | p[37] >>> 11, W = p[37] << 21 | p[36] >>> 11, me = p[47] << 24 | p[46] >>> 8, ft = p[46] << 24 | p[47] >>> 8, mt = p[8] << 27 | p[9] >>> 5, pe = p[9] << 27 | p[8] >>> 5, rt = p[18] << 20 | p[19] >>> 12, $ = p[19] << 20 | p[18] >>> 12, Te = p[29] << 7 | p[28] >>> 25, Ke = p[28] << 7 | p[29] >>> 25, ie = p[38] << 8 | p[39] >>> 24, lt = p[39] << 8 | p[38] >>> 24, G = p[48] << 14 | p[49] >>> 18, st = p[49] << 14 | p[48] >>> 18, p[0] = nt ^ ~q & H, p[1] = z ^ ~at & j, p[10] = K ^ ~rt & Q, p[11] = Z ^ ~$ & pt, p[20] = ee ^ ~te & ot, p[21] = ut ^ ~ne & ae, p[30] = mt ^ ~ye & ue, p[31] = pe ^ ~dt & oe, p[40] = de ^ ~Tt & Te, p[41] = ce ^ ~fe & Ke, p[2] = q ^ ~H & it, p[3] = at ^ ~j & W, p[12] = rt ^ ~Q & J, p[13] = $ ^ ~pt & X, p[22] = te ^ ~ot & ie, p[23] = ne ^ ~ae & lt, p[32] = ye ^ ~ue & ct, p[33] = dt ^ ~oe & le, p[42] = Tt ^ ~Te & Ze, p[43] = fe ^ ~Ke & $e, p[4] = H ^ ~it & G, p[5] = j ^ ~W & st, p[14] = Q ^ ~J & yt, p[15] = pt ^ ~X & Y, p[24] = ot ^ ~ie & se, p[25] = ae ^ ~lt & re, p[34] = ue ^ ~ct & me, p[35] = oe ^ ~le & ft, p[44] = Te ^ ~Ze & Qe, p[45] = Ke ^ ~$e & Je, p[6] = it ^ ~G & nt, p[7] = W ^ ~st & z, p[16] = J ^ ~yt & K, p[17] = X ^ ~Y & Z, p[26] = ie ^ ~se & ee, p[27] = lt ^ ~re & ut, p[36] = ct ^ ~me & mt, p[37] = le ^ ~ft & pe, p[46] = Ze ^ ~Qe & de, p[47] = $e ^ ~Je & ce, p[8] = G ^ ~nt & q, p[9] = st ^ ~z & at, p[18] = yt ^ ~K & rt, p[19] = Y ^ ~Z & $, p[28] = se ^ ~ee & te, p[29] = re ^ ~ut & ne, p[38] = me ^ ~mt & ye, p[39] = ft ^ ~pe & dt, p[48] = Qe ^ ~de & Tt, p[49] = Je ^ ~ce & fe, p[0] ^= Ut[w], p[1] ^= Ut[w + 1];
    };
    if (_)
      s.exports = a;
    else
      for (u = 0; u < r.length; ++u)
        d[r[u]] = a[r[u]];
  })();
})(ia);
var Ka = ia.exports;
const Za = /* @__PURE__ */ Qn(Ka);
function Qt(s) {
  return "0x" + Za.keccak_256(Se(s));
}
const $a = "address/5.7.0", Ot = new O($a);
function zn(s) {
  De(s, 20) || Ot.throwArgumentError("invalid address", "address", s), s = s.toLowerCase();
  const e = s.substring(2).split(""), t = new Uint8Array(40);
  for (let d = 0; d < 40; d++)
    t[d] = e[d].charCodeAt(0);
  const n = Se(Qt(t));
  for (let d = 0; d < 40; d += 2)
    n[d >> 1] >> 4 >= 8 && (e[d] = e[d].toUpperCase()), (n[d >> 1] & 15) >= 8 && (e[d + 1] = e[d + 1].toUpperCase());
  return "0x" + e.join("");
}
const Qa = 9007199254740991;
function Ja(s) {
  return Math.log10 ? Math.log10(s) : Math.log(s) / Math.LN10;
}
const En = {};
for (let s = 0; s < 10; s++)
  En[String(s)] = String(s);
for (let s = 0; s < 26; s++)
  En[String.fromCharCode(65 + s)] = String(10 + s);
const qn = Math.floor(Ja(Qa));
function Xa(s) {
  s = s.toUpperCase(), s = s.substring(4) + s.substring(0, 2) + "00";
  let e = s.split("").map((n) => En[n]).join("");
  for (; e.length >= qn; ) {
    let n = e.substring(0, qn);
    e = parseInt(n, 10) % 97 + e.substring(n.length);
  }
  let t = String(98 - parseInt(e, 10) % 97);
  for (; t.length < 2; )
    t = "0" + t;
  return t;
}
function kn(s) {
  let e = null;
  if (typeof s != "string" && Ot.throwArgumentError("invalid address", "address", s), s.match(/^(0x)?[0-9a-fA-F]{40}$/))
    s.substring(0, 2) !== "0x" && (s = "0x" + s), e = zn(s), s.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && e !== s && Ot.throwArgumentError("bad address checksum", "address", s);
  else if (s.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
    for (s.substring(2, 4) !== Xa(s) && Ot.throwArgumentError("bad icap checksum", "address", s), e = Ba(s.substring(4)); e.length < 40; )
      e = "0" + e;
    e = zn("0x" + e);
  } else
    Ot.throwArgumentError("invalid address", "address", s);
  return e;
}
class Ya extends Ge {
  constructor(e) {
    super("address", "address", e, !1);
  }
  defaultValue() {
    return "0x0000000000000000000000000000000000000000";
  }
  encode(e, t) {
    try {
      t = kn(t);
    } catch (n) {
      this._throwError(n.message, t);
    }
    return e.writeValue(t);
  }
  decode(e) {
    return kn(Xn(e.readValue().toHexString(), 20));
  }
}
class ei extends Ge {
  constructor(e) {
    super(e.name, e.type, void 0, e.dynamic), this.coder = e;
  }
  defaultValue() {
    return this.coder.defaultValue();
  }
  encode(e, t) {
    return this.coder.encode(e, t);
  }
  decode(e) {
    return this.coder.decode(e);
  }
}
const vt = new O(Bt);
function sa(s, e, t) {
  let n = null;
  if (Array.isArray(t))
    n = t;
  else if (t && typeof t == "object") {
    let x = {};
    n = e.map((E) => {
      const N = E.localName;
      return N || vt.throwError("cannot encode object for signature with missing names", O.errors.INVALID_ARGUMENT, {
        argument: "values",
        coder: E,
        value: t
      }), x[N] && vt.throwError("cannot encode object for signature with duplicate names", O.errors.INVALID_ARGUMENT, {
        argument: "values",
        coder: E,
        value: t
      }), x[N] = !0, t[N];
    });
  } else
    vt.throwArgumentError("invalid tuple value", "tuple", t);
  e.length !== n.length && vt.throwArgumentError("types/value length mismatch", "tuple", t);
  let d = new _n(s.wordSize), y = new _n(s.wordSize), T = [];
  e.forEach((x, E) => {
    let N = n[E];
    if (x.dynamic) {
      let B = y.length;
      x.encode(y, N);
      let L = d.writeUpdatableValue();
      T.push((ve) => {
        L(ve + B);
      });
    } else
      x.encode(d, N);
  }), T.forEach((x) => {
    x(d.length);
  });
  let _ = s.appendWriter(d);
  return _ += s.appendWriter(y), _;
}
function ra(s, e) {
  let t = [], n = s.subReader(0);
  e.forEach((y) => {
    let T = null;
    if (y.dynamic) {
      let _ = s.readValue(), x = n.subReader(_.toNumber());
      try {
        T = y.decode(x);
      } catch (E) {
        if (E.code === O.errors.BUFFER_OVERRUN)
          throw E;
        T = E, T.baseType = y.name, T.name = y.localName, T.type = y.type;
      }
    } else
      try {
        T = y.decode(s);
      } catch (_) {
        if (_.code === O.errors.BUFFER_OVERRUN)
          throw _;
        T = _, T.baseType = y.name, T.name = y.localName, T.type = y.type;
      }
    T != null && t.push(T);
  });
  const d = e.reduce((y, T) => {
    const _ = T.localName;
    return _ && (y[_] || (y[_] = 0), y[_]++), y;
  }, {});
  e.forEach((y, T) => {
    let _ = y.localName;
    if (!_ || d[_] !== 1 || (_ === "length" && (_ = "_length"), t[_] != null))
      return;
    const x = t[T];
    x instanceof Error ? Object.defineProperty(t, _, {
      enumerable: !0,
      get: () => {
        throw x;
      }
    }) : t[_] = x;
  });
  for (let y = 0; y < t.length; y++) {
    const T = t[y];
    T instanceof Error && Object.defineProperty(t, y, {
      enumerable: !0,
      get: () => {
        throw T;
      }
    });
  }
  return Object.freeze(t);
}
class ti extends Ge {
  constructor(e, t, n) {
    const d = e.type + "[" + (t >= 0 ? t : "") + "]", y = t === -1 || e.dynamic;
    super("array", d, n, y), this.coder = e, this.length = t;
  }
  defaultValue() {
    const e = this.coder.defaultValue(), t = [];
    for (let n = 0; n < this.length; n++)
      t.push(e);
    return t;
  }
  encode(e, t) {
    Array.isArray(t) || this._throwError("expected array value", t);
    let n = this.length;
    n === -1 && (n = t.length, e.writeValue(t.length)), vt.checkArgumentCount(t.length, n, "coder array" + (this.localName ? " " + this.localName : ""));
    let d = [];
    for (let y = 0; y < t.length; y++)
      d.push(this.coder);
    return sa(e, d, t);
  }
  decode(e) {
    let t = this.length;
    t === -1 && (t = e.readValue().toNumber(), t * 32 > e._data.length && vt.throwError("insufficient data length", O.errors.BUFFER_OVERRUN, {
      length: e._data.length,
      count: t
    }));
    let n = [];
    for (let d = 0; d < t; d++)
      n.push(new ei(this.coder));
    return e.coerce(this.name, ra(e, n));
  }
}
class ni extends Ge {
  constructor(e) {
    super("bool", "bool", e, !1);
  }
  defaultValue() {
    return !1;
  }
  encode(e, t) {
    return e.writeValue(t ? 1 : 0);
  }
  decode(e) {
    return e.coerce(this.type, !e.readValue().isZero());
  }
}
class pa extends Ge {
  constructor(e, t) {
    super(e, e, t, !0);
  }
  defaultValue() {
    return "0x";
  }
  encode(e, t) {
    t = Se(t);
    let n = e.writeValue(t.length);
    return n += e.writeBytes(t), n;
  }
  decode(e) {
    return e.readBytes(e.readValue().toNumber(), !0);
  }
}
class ai extends pa {
  constructor(e) {
    super("bytes", e);
  }
  decode(e) {
    return e.coerce(this.name, ke(super.decode(e)));
  }
}
class ii extends Ge {
  constructor(e, t) {
    let n = "bytes" + String(e);
    super(n, n, t, !1), this.size = e;
  }
  defaultValue() {
    return "0x0000000000000000000000000000000000000000000000000000000000000000".substring(0, 2 + this.size * 2);
  }
  encode(e, t) {
    let n = Se(t);
    return n.length !== this.size && this._throwError("incorrect data length", t), e.writeBytes(n);
  }
  decode(e) {
    return e.coerce(this.name, ke(e.readBytes(this.size)));
  }
}
class si extends Ge {
  constructor(e) {
    super("null", "", e, !1);
  }
  defaultValue() {
    return null;
  }
  encode(e, t) {
    return t != null && this._throwError("not null", t), e.writeBytes([]);
  }
  decode(e) {
    return e.readBytes(0), e.coerce(this.name, null);
  }
}
const ri = /* @__PURE__ */ be.from(-1), pi = /* @__PURE__ */ be.from(0), yi = /* @__PURE__ */ be.from(1), ui = /* @__PURE__ */ be.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
class oi extends Ge {
  constructor(e, t, n) {
    const d = (t ? "int" : "uint") + e * 8;
    super(d, d, n, !1), this.size = e, this.signed = t;
  }
  defaultValue() {
    return 0;
  }
  encode(e, t) {
    let n = be.from(t), d = ui.mask(e.wordSize * 8);
    if (this.signed) {
      let y = d.mask(this.size * 8 - 1);
      (n.gt(y) || n.lt(y.add(yi).mul(ri))) && this._throwError("value out-of-bounds", t);
    } else
      (n.lt(pi) || n.gt(d.mask(this.size * 8))) && this._throwError("value out-of-bounds", t);
    return n = n.toTwos(this.size * 8).mask(this.size * 8), this.signed && (n = n.fromTwos(this.size * 8).toTwos(8 * e.wordSize)), e.writeValue(n);
  }
  decode(e) {
    let t = e.readValue().mask(this.size * 8);
    return this.signed && (t = t.fromTwos(this.size * 8)), e.coerce(this.name, t);
  }
}
const li = "strings/5.7.0", ya = new O(li);
var Jt;
(function(s) {
  s.current = "", s.NFC = "NFC", s.NFD = "NFD", s.NFKC = "NFKC", s.NFKD = "NFKD";
})(Jt || (Jt = {}));
var Oe;
(function(s) {
  s.UNEXPECTED_CONTINUE = "unexpected continuation byte", s.BAD_PREFIX = "bad codepoint prefix", s.OVERRUN = "string overrun", s.MISSING_CONTINUE = "missing continuation byte", s.OUT_OF_RANGE = "out of UTF-8 range", s.UTF16_SURROGATE = "UTF-16 surrogate", s.OVERLONG = "overlong representation";
})(Oe || (Oe = {}));
function mi(s, e, t, n, d) {
  return ya.throwArgumentError(`invalid codepoint at offset ${e}; ${s}`, "bytes", t);
}
function ua(s, e, t, n, d) {
  if (s === Oe.BAD_PREFIX || s === Oe.UNEXPECTED_CONTINUE) {
    let y = 0;
    for (let T = e + 1; T < t.length && t[T] >> 6 === 2; T++)
      y++;
    return y;
  }
  return s === Oe.OVERRUN ? t.length - e - 1 : 0;
}
function di(s, e, t, n, d) {
  return s === Oe.OVERLONG ? (n.push(d), 0) : (n.push(65533), ua(s, e, t));
}
const ci = Object.freeze({
  error: mi,
  ignore: ua,
  replace: di
});
function fi(s, e) {
  e == null && (e = ci.error), s = Se(s);
  const t = [];
  let n = 0;
  for (; n < s.length; ) {
    const d = s[n++];
    if (!(d >> 7)) {
      t.push(d);
      continue;
    }
    let y = null, T = null;
    if ((d & 224) === 192)
      y = 1, T = 127;
    else if ((d & 240) === 224)
      y = 2, T = 2047;
    else if ((d & 248) === 240)
      y = 3, T = 65535;
    else {
      (d & 192) === 128 ? n += e(Oe.UNEXPECTED_CONTINUE, n - 1, s, t) : n += e(Oe.BAD_PREFIX, n - 1, s, t);
      continue;
    }
    if (n - 1 + y >= s.length) {
      n += e(Oe.OVERRUN, n - 1, s, t);
      continue;
    }
    let _ = d & (1 << 8 - y - 1) - 1;
    for (let x = 0; x < y; x++) {
      let E = s[n];
      if ((E & 192) != 128) {
        n += e(Oe.MISSING_CONTINUE, n, s, t), _ = null;
        break;
      }
      _ = _ << 6 | E & 63, n++;
    }
    if (_ !== null) {
      if (_ > 1114111) {
        n += e(Oe.OUT_OF_RANGE, n - 1 - y, s, t, _);
        continue;
      }
      if (_ >= 55296 && _ <= 57343) {
        n += e(Oe.UTF16_SURROGATE, n - 1 - y, s, t, _);
        continue;
      }
      if (_ <= T) {
        n += e(Oe.OVERLONG, n - 1 - y, s, t, _);
        continue;
      }
      t.push(_);
    }
  }
  return t;
}
function oa(s, e = Jt.current) {
  e != Jt.current && (ya.checkNormalize(), s = s.normalize(e));
  let t = [];
  for (let n = 0; n < s.length; n++) {
    const d = s.charCodeAt(n);
    if (d < 128)
      t.push(d);
    else if (d < 2048)
      t.push(d >> 6 | 192), t.push(d & 63 | 128);
    else if ((d & 64512) == 55296) {
      n++;
      const y = s.charCodeAt(n);
      if (n >= s.length || (y & 64512) !== 56320)
        throw new Error("invalid utf-8 string");
      const T = 65536 + ((d & 1023) << 10) + (y & 1023);
      t.push(T >> 18 | 240), t.push(T >> 12 & 63 | 128), t.push(T >> 6 & 63 | 128), t.push(T & 63 | 128);
    } else
      t.push(d >> 12 | 224), t.push(d >> 6 & 63 | 128), t.push(d & 63 | 128);
  }
  return Se(t);
}
function Ti(s) {
  return s.map((e) => e <= 65535 ? String.fromCharCode(e) : (e -= 65536, String.fromCharCode((e >> 10 & 1023) + 55296, (e & 1023) + 56320))).join("");
}
function bi(s, e) {
  return Ti(fi(s, e));
}
class hi extends pa {
  constructor(e) {
    super("string", e);
  }
  defaultValue() {
    return "";
  }
  encode(e, t) {
    return super.encode(e, oa(t));
  }
  decode(e) {
    return bi(super.decode(e));
  }
}
class Ht extends Ge {
  constructor(e, t) {
    let n = !1;
    const d = [];
    e.forEach((T) => {
      T.dynamic && (n = !0), d.push(T.type);
    });
    const y = "tuple(" + d.join(",") + ")";
    super("tuple", y, t, n), this.coders = e;
  }
  defaultValue() {
    const e = [];
    this.coders.forEach((n) => {
      e.push(n.defaultValue());
    });
    const t = this.coders.reduce((n, d) => {
      const y = d.localName;
      return y && (n[y] || (n[y] = 0), n[y]++), n;
    }, {});
    return this.coders.forEach((n, d) => {
      let y = n.localName;
      !y || t[y] !== 1 || (y === "length" && (y = "_length"), e[y] == null && (e[y] = e[d]));
    }), Object.freeze(e);
  }
  encode(e, t) {
    return sa(e, this.coders, t);
  }
  decode(e) {
    return e.coerce(this.name, ra(e, this.coders));
  }
}
const jt = new O(Bt), gi = new RegExp(/^bytes([0-9]*)$/), Mi = new RegExp(/^(u?int)([0-9]*)$/);
class wi {
  constructor(e) {
    Ae(this, "coerceFunc", e || null);
  }
  _getCoder(e) {
    switch (e.baseType) {
      case "address":
        return new Ya(e.name);
      case "bool":
        return new ni(e.name);
      case "string":
        return new hi(e.name);
      case "bytes":
        return new ai(e.name);
      case "array":
        return new ti(this._getCoder(e.arrayChildren), e.arrayLength, e.name);
      case "tuple":
        return new Ht((e.components || []).map((n) => this._getCoder(n)), e.name);
      case "":
        return new si(e.name);
    }
    let t = e.type.match(Mi);
    if (t) {
      let n = parseInt(t[2] || "256");
      return (n === 0 || n > 256 || n % 8 !== 0) && jt.throwArgumentError("invalid " + t[1] + " bit length", "param", e), new oi(n / 8, t[1] === "int", e.name);
    }
    if (t = e.type.match(gi), t) {
      let n = parseInt(t[1]);
      return (n === 0 || n > 32) && jt.throwArgumentError("invalid bytes length", "param", e), new ii(n, e.name);
    }
    return jt.throwArgumentError("invalid type", "type", e.type);
  }
  _getWordSize() {
    return 32;
  }
  _getReader(e, t) {
    return new $t(e, this._getWordSize(), this.coerceFunc, t);
  }
  _getWriter() {
    return new _n(this._getWordSize());
  }
  getDefaultValue(e) {
    const t = e.map((d) => this._getCoder(Ie.from(d)));
    return new Ht(t, "_").defaultValue();
  }
  encode(e, t) {
    e.length !== t.length && jt.throwError("types/values length mismatch", O.errors.INVALID_ARGUMENT, {
      count: { types: e.length, values: t.length },
      value: { types: e, values: t }
    });
    const n = e.map((T) => this._getCoder(Ie.from(T))), d = new Ht(n, "_"), y = this._getWriter();
    return d.encode(y, t), y.data;
  }
  decode(e, t, n) {
    const d = e.map((T) => this._getCoder(Ie.from(T)));
    return new Ht(d, "_").decode(this._getReader(Se(t), n));
  }
}
const _i = new wi();
function Wt(s) {
  return Qt(oa(s));
}
const Me = new O(Bt);
class ki extends tn {
}
class vi extends tn {
}
class Ii extends tn {
}
class Hn extends tn {
  static isIndexed(e) {
    return !!(e && e._isIndexed);
  }
}
const xi = {
  "0x08c379a0": { signature: "Error(string)", name: "Error", inputs: ["string"], reason: !0 },
  "0x4e487b71": { signature: "Panic(uint256)", name: "Panic", inputs: ["uint256"] }
};
function jn(s, e) {
  const t = new Error(`deferred error during ABI decoding triggered accessing ${s}`);
  return t.error = e, t;
}
class Ai {
  constructor(e) {
    let t = [];
    typeof e == "string" ? t = JSON.parse(e) : t = e, Ae(this, "fragments", t.map((n) => je.from(n)).filter((n) => n != null)), Ae(this, "_abiCoder", zt(new.target, "getAbiCoder")()), Ae(this, "functions", {}), Ae(this, "errors", {}), Ae(this, "events", {}), Ae(this, "structs", {}), this.fragments.forEach((n) => {
      let d = null;
      switch (n.type) {
        case "constructor":
          if (this.deploy) {
            Me.warn("duplicate definition - constructor");
            return;
          }
          Ae(this, "deploy", n);
          return;
        case "function":
          d = this.functions;
          break;
        case "event":
          d = this.events;
          break;
        case "error":
          d = this.errors;
          break;
        default:
          return;
      }
      let y = n.format();
      if (d[y]) {
        Me.warn("duplicate definition - " + y);
        return;
      }
      d[y] = n;
    }), this.deploy || Ae(this, "deploy", Le.from({
      payable: !1,
      type: "constructor"
    })), Ae(this, "_isInterface", !0);
  }
  format(e) {
    e || (e = P.full), e === P.sighash && Me.throwArgumentError("interface does not support formatting sighash", "format", e);
    const t = this.fragments.map((n) => n.format(e));
    return e === P.json ? JSON.stringify(t.map((n) => JSON.parse(n))) : t;
  }
  // Sub-classes can override these to handle other blockchains
  static getAbiCoder() {
    return _i;
  }
  static getAddress(e) {
    return kn(e);
  }
  static getSighash(e) {
    return Fa(Wt(e.format()), 0, 4);
  }
  static getEventTopic(e) {
    return Wt(e.format());
  }
  // Find a function definition by any means necessary (unless it is ambiguous)
  getFunction(e) {
    if (De(e)) {
      for (const n in this.functions)
        if (e === this.getSighash(n))
          return this.functions[n];
      Me.throwArgumentError("no matching function", "sighash", e);
    }
    if (e.indexOf("(") === -1) {
      const n = e.trim(), d = Object.keys(this.functions).filter((y) => y.split(
        "("
        /* fix:) */
      )[0] === n);
      return d.length === 0 ? Me.throwArgumentError("no matching function", "name", n) : d.length > 1 && Me.throwArgumentError("multiple matching functions", "name", n), this.functions[d[0]];
    }
    const t = this.functions[Be.fromString(e).format()];
    return t || Me.throwArgumentError("no matching function", "signature", e), t;
  }
  // Find an event definition by any means necessary (unless it is ambiguous)
  getEvent(e) {
    if (De(e)) {
      const n = e.toLowerCase();
      for (const d in this.events)
        if (n === this.getEventTopic(d))
          return this.events[d];
      Me.throwArgumentError("no matching event", "topichash", n);
    }
    if (e.indexOf("(") === -1) {
      const n = e.trim(), d = Object.keys(this.events).filter((y) => y.split(
        "("
        /* fix:) */
      )[0] === n);
      return d.length === 0 ? Me.throwArgumentError("no matching event", "name", n) : d.length > 1 && Me.throwArgumentError("multiple matching events", "name", n), this.events[d[0]];
    }
    const t = this.events[He.fromString(e).format()];
    return t || Me.throwArgumentError("no matching event", "signature", e), t;
  }
  // Find a function definition by any means necessary (unless it is ambiguous)
  getError(e) {
    if (De(e)) {
      const n = zt(this.constructor, "getSighash");
      for (const d in this.errors) {
        const y = this.errors[d];
        if (e === n(y))
          return this.errors[d];
      }
      Me.throwArgumentError("no matching error", "sighash", e);
    }
    if (e.indexOf("(") === -1) {
      const n = e.trim(), d = Object.keys(this.errors).filter((y) => y.split(
        "("
        /* fix:) */
      )[0] === n);
      return d.length === 0 ? Me.throwArgumentError("no matching error", "name", n) : d.length > 1 && Me.throwArgumentError("multiple matching errors", "name", n), this.errors[d[0]];
    }
    const t = this.errors[Be.fromString(e).format()];
    return t || Me.throwArgumentError("no matching error", "signature", e), t;
  }
  // Get the sighash (the bytes4 selector) used by Solidity to identify a function
  getSighash(e) {
    if (typeof e == "string")
      try {
        e = this.getFunction(e);
      } catch (t) {
        try {
          e = this.getError(e);
        } catch {
          throw t;
        }
      }
    return zt(this.constructor, "getSighash")(e);
  }
  // Get the topic (the bytes32 hash) used by Solidity to identify an event
  getEventTopic(e) {
    return typeof e == "string" && (e = this.getEvent(e)), zt(this.constructor, "getEventTopic")(e);
  }
  _decodeParams(e, t) {
    return this._abiCoder.decode(e, t);
  }
  _encodeParams(e, t) {
    return this._abiCoder.encode(e, t);
  }
  encodeDeploy(e) {
    return this._encodeParams(this.deploy.inputs, e || []);
  }
  decodeErrorResult(e, t) {
    typeof e == "string" && (e = this.getError(e));
    const n = Se(t);
    return ke(n.slice(0, 4)) !== this.getSighash(e) && Me.throwArgumentError(`data signature does not match error ${e.name}.`, "data", ke(n)), this._decodeParams(e.inputs, n.slice(4));
  }
  encodeErrorResult(e, t) {
    return typeof e == "string" && (e = this.getError(e)), ke(It([
      this.getSighash(e),
      this._encodeParams(e.inputs, t || [])
    ]));
  }
  // Decode the data for a function call (e.g. tx.data)
  decodeFunctionData(e, t) {
    typeof e == "string" && (e = this.getFunction(e));
    const n = Se(t);
    return ke(n.slice(0, 4)) !== this.getSighash(e) && Me.throwArgumentError(`data signature does not match function ${e.name}.`, "data", ke(n)), this._decodeParams(e.inputs, n.slice(4));
  }
  // Encode the data for a function call (e.g. tx.data)
  encodeFunctionData(e, t) {
    return typeof e == "string" && (e = this.getFunction(e)), ke(It([
      this.getSighash(e),
      this._encodeParams(e.inputs, t || [])
    ]));
  }
  // Decode the result from a function call (e.g. from eth_call)
  decodeFunctionResult(e, t) {
    typeof e == "string" && (e = this.getFunction(e));
    let n = Se(t), d = null, y = "", T = null, _ = null, x = null;
    switch (n.length % this._abiCoder._getWordSize()) {
      case 0:
        try {
          return this._abiCoder.decode(e.outputs, n);
        } catch {
        }
        break;
      case 4: {
        const E = ke(n.slice(0, 4)), N = xi[E];
        if (N)
          T = this._abiCoder.decode(N.inputs, n.slice(4)), _ = N.name, x = N.signature, N.reason && (d = T[0]), _ === "Error" ? y = `; VM Exception while processing transaction: reverted with reason string ${JSON.stringify(T[0])}` : _ === "Panic" && (y = `; VM Exception while processing transaction: reverted with panic code ${T[0]}`);
        else
          try {
            const B = this.getError(E);
            T = this._abiCoder.decode(B.inputs, n.slice(4)), _ = B.name, x = B.format();
          } catch {
          }
        break;
      }
    }
    return Me.throwError("call revert exception" + y, O.errors.CALL_EXCEPTION, {
      method: e.format(),
      data: ke(t),
      errorArgs: T,
      errorName: _,
      errorSignature: x,
      reason: d
    });
  }
  // Encode the result for a function call (e.g. for eth_call)
  encodeFunctionResult(e, t) {
    return typeof e == "string" && (e = this.getFunction(e)), ke(this._abiCoder.encode(e.outputs, t || []));
  }
  // Create the filter for the event with search criteria (e.g. for eth_filterLog)
  encodeFilterTopics(e, t) {
    typeof e == "string" && (e = this.getEvent(e)), t.length > e.inputs.length && Me.throwError("too many arguments for " + e.format(), O.errors.UNEXPECTED_ARGUMENT, {
      argument: "values",
      value: t
    });
    let n = [];
    e.anonymous || n.push(this.getEventTopic(e));
    const d = (y, T) => y.type === "string" ? Wt(T) : y.type === "bytes" ? Qt(ke(T)) : (y.type === "bool" && typeof T == "boolean" && (T = T ? "0x01" : "0x00"), y.type.match(/^u?int/) && (T = be.from(T).toHexString()), y.type === "address" && this._abiCoder.encode(["address"], [T]), Xn(ke(T), 32));
    for (t.forEach((y, T) => {
      let _ = e.inputs[T];
      if (!_.indexed) {
        y != null && Me.throwArgumentError("cannot filter non-indexed parameters; must be null", "contract." + _.name, y);
        return;
      }
      y == null ? n.push(null) : _.baseType === "array" || _.baseType === "tuple" ? Me.throwArgumentError("filtering with tuples or arrays not supported", "contract." + _.name, y) : Array.isArray(y) ? n.push(y.map((x) => d(_, x))) : n.push(d(_, y));
    }); n.length && n[n.length - 1] === null; )
      n.pop();
    return n;
  }
  encodeEventLog(e, t) {
    typeof e == "string" && (e = this.getEvent(e));
    const n = [], d = [], y = [];
    return e.anonymous || n.push(this.getEventTopic(e)), t.length !== e.inputs.length && Me.throwArgumentError("event arguments/values mismatch", "values", t), e.inputs.forEach((T, _) => {
      const x = t[_];
      if (T.indexed)
        if (T.type === "string")
          n.push(Wt(x));
        else if (T.type === "bytes")
          n.push(Qt(x));
        else {
          if (T.baseType === "tuple" || T.baseType === "array")
            throw new Error("not implemented");
          n.push(this._abiCoder.encode([T.type], [x]));
        }
      else
        d.push(T), y.push(x);
    }), {
      data: this._abiCoder.encode(d, y),
      topics: n
    };
  }
  // Decode a filter for the event and the search criteria
  decodeEventLog(e, t, n) {
    if (typeof e == "string" && (e = this.getEvent(e)), n != null && !e.anonymous) {
      let L = this.getEventTopic(e);
      (!De(n[0], 32) || n[0].toLowerCase() !== L) && Me.throwError("fragment/topic mismatch", O.errors.INVALID_ARGUMENT, { argument: "topics[0]", expected: L, value: n[0] }), n = n.slice(1);
    }
    let d = [], y = [], T = [];
    e.inputs.forEach((L, ve) => {
      L.indexed ? L.type === "string" || L.type === "bytes" || L.baseType === "tuple" || L.baseType === "array" ? (d.push(Ie.fromObject({ type: "bytes32", name: L.name })), T.push(!0)) : (d.push(L), T.push(!1)) : (y.push(L), T.push(!1));
    });
    let _ = n != null ? this._abiCoder.decode(d, It(n)) : null, x = this._abiCoder.decode(y, t, !0), E = [], N = 0, B = 0;
    e.inputs.forEach((L, ve) => {
      if (L.indexed)
        if (_ == null)
          E[ve] = new Hn({ _isIndexed: !0, hash: null });
        else if (T[ve])
          E[ve] = new Hn({ _isIndexed: !0, hash: _[B++] });
        else
          try {
            E[ve] = _[B++];
          } catch (we) {
            E[ve] = we;
          }
      else
        try {
          E[ve] = x[N++];
        } catch (we) {
          E[ve] = we;
        }
      if (L.name && E[L.name] == null) {
        const we = E[ve];
        we instanceof Error ? Object.defineProperty(E, L.name, {
          enumerable: !0,
          get: () => {
            throw jn(`property ${JSON.stringify(L.name)}`, we);
          }
        }) : E[L.name] = we;
      }
    });
    for (let L = 0; L < E.length; L++) {
      const ve = E[L];
      ve instanceof Error && Object.defineProperty(E, L, {
        enumerable: !0,
        get: () => {
          throw jn(`index ${L}`, ve);
        }
      });
    }
    return Object.freeze(E);
  }
  // Given a transaction, find the matching function fragment (if any) and
  // determine all its properties and call parameters
  parseTransaction(e) {
    let t = this.getFunction(e.data.substring(0, 10).toLowerCase());
    return t ? new vi({
      args: this._abiCoder.decode(t.inputs, "0x" + e.data.substring(10)),
      functionFragment: t,
      name: t.name,
      signature: t.format(),
      sighash: this.getSighash(t),
      value: be.from(e.value || "0")
    }) : null;
  }
  // @TODO
  //parseCallResult(data: BytesLike): ??
  // Given an event log, find the matching event fragment (if any) and
  // determine all its properties and values
  parseLog(e) {
    let t = this.getEvent(e.topics[0]);
    return !t || t.anonymous ? null : new ki({
      eventFragment: t,
      name: t.name,
      signature: t.format(),
      topic: this.getEventTopic(t),
      args: this.decodeEventLog(t, e.data, e.topics)
    });
  }
  parseError(e) {
    const t = ke(e);
    let n = this.getError(t.substring(0, 10).toLowerCase());
    return n ? new Ii({
      args: this._abiCoder.decode(n.inputs, "0x" + t.substring(10)),
      errorFragment: n,
      name: n.name,
      signature: n.format(),
      sighash: this.getSighash(n)
    }) : null;
  }
  /*
  static from(value: Array<Fragment | string | JsonAbi> | string | Interface) {
      if (Interface.isInterface(value)) {
          return value;
      }
      if (typeof(value) === "string") {
          return new Interface(JSON.parse(value));
      }
      return new Interface(value);
  }
  */
  static isInterface(e) {
    return !!(e && e._isInterface);
  }
}
const Ei = [
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        name: "owner",
        type: "address"
      },
      {
        indexed: !0,
        name: "spender",
        type: "address"
      },
      {
        indexed: !1,
        name: "value",
        type: "uint256"
      }
    ],
    name: "Approval",
    type: "event"
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        name: "owner",
        type: "address"
      },
      {
        indexed: !0,
        name: "operator",
        type: "address"
      },
      {
        indexed: !1,
        name: "approved",
        type: "bool"
      }
    ],
    name: "ApprovalForAll",
    type: "event"
  },
  {
    constant: !0,
    inputs: [],
    name: "MAX_OWNER_COUNT",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        name: "sender",
        type: "address"
      },
      {
        indexed: !1,
        name: "amount0In",
        type: "uint256"
      },
      {
        indexed: !1,
        name: "amount1In",
        type: "uint256"
      },
      {
        indexed: !1,
        name: "amount0Out",
        type: "uint256"
      },
      {
        indexed: !1,
        name: "amount1Out",
        type: "uint256"
      },
      {
        indexed: !0,
        name: "to",
        type: "address"
      }
    ],
    name: "Swap",
    type: "event"
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        name: "from",
        type: "address"
      },
      {
        indexed: !0,
        name: "to",
        type: "address"
      },
      {
        indexed: !1,
        name: "value",
        type: "uint256"
      }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "contract IWeb3Registry",
        name: "_registry",
        type: "address"
      },
      {
        internalType: "contract Web3ReverseRegistrar",
        name: "_reverseRegistrar",
        type: "address"
      },
      {
        internalType: "bytes32",
        name: "_baseNode",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "_maxSignInterval",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "verifierAddress",
        type: "address"
      }
    ],
    name: "__Web3Registrar_init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "_acceptAdmin",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0xe9c714f2"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "addAmount",
        type: "uint256"
      }
    ],
    name: "_addReserves",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "enum LibNFTOrder.TradeDirection",
            name: "direction",
            type: "uint8"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20TokenV06",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "contract IERC721Token",
            name: "erc721Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc721TokenId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "erc721TokenProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.ERC721Order",
        name: "sellOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "signature",
        type: "tuple"
      },
      {
        internalType: "uint256",
        name: "ethAvailable",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "takerCallbackData",
        type: "bytes"
      }
    ],
    name: "_buyERC721",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "trader",
                type: "address"
              },
              {
                internalType: "enum Side",
                name: "side",
                type: "uint8"
              },
              {
                internalType: "address",
                name: "matchingPolicy",
                type: "address"
              },
              {
                internalType: "address",
                name: "collection",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "address",
                name: "paymentToken",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "price",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "listingTime",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "expirationTime",
                type: "uint256"
              },
              {
                components: [
                  {
                    internalType: "uint16",
                    name: "rate",
                    type: "uint16"
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address"
                  }
                ],
                internalType: "struct Fee[]",
                name: "fees",
                type: "tuple[]"
              },
              {
                internalType: "uint256",
                name: "salt",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "extraParams",
                type: "bytes"
              }
            ],
            internalType: "struct Order",
            name: "order",
            type: "tuple"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          },
          {
            internalType: "bytes",
            name: "extraSignature",
            type: "bytes"
          },
          {
            internalType: "enum SignatureVersion",
            name: "signatureVersion",
            type: "uint8"
          },
          {
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256"
          }
        ],
        internalType: "struct Input",
        name: "sell",
        type: "tuple"
      },
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "trader",
                type: "address"
              },
              {
                internalType: "enum Side",
                name: "side",
                type: "uint8"
              },
              {
                internalType: "address",
                name: "matchingPolicy",
                type: "address"
              },
              {
                internalType: "address",
                name: "collection",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "address",
                name: "paymentToken",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "price",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "listingTime",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "expirationTime",
                type: "uint256"
              },
              {
                components: [
                  {
                    internalType: "uint16",
                    name: "rate",
                    type: "uint16"
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address"
                  }
                ],
                internalType: "struct Fee[]",
                name: "fees",
                type: "tuple[]"
              },
              {
                internalType: "uint256",
                name: "salt",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "extraParams",
                type: "bytes"
              }
            ],
            internalType: "struct Order",
            name: "order",
            type: "tuple"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          },
          {
            internalType: "bytes",
            name: "extraSignature",
            type: "bytes"
          },
          {
            internalType: "enum SignatureVersion",
            name: "signatureVersion",
            type: "uint8"
          },
          {
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256"
          }
        ],
        internalType: "struct Input",
        name: "buy",
        type: "tuple"
      }
    ],
    name: "_execute",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "reduceAmount",
        type: "uint256"
      }
    ],
    name: "_reduceReserves",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IComptroller",
        name: "newComptroller",
        type: "address"
      }
    ],
    name: "_setComptroller",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_flashloan",
        type: "address"
      }
    ],
    name: "_setFlashloan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "address",
        name: "implementation_",
        type: "address"
      },
      {
        internalType: "bool",
        name: "allowResign",
        type: "bool"
      },
      {
        internalType: "bytes",
        name: "becomeImplementationData",
        type: "bytes"
      }
    ],
    name: "_setImplementation",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x555bcc40"
  },
  {
    inputs: [
      {
        internalType: "contract IInterestRateModel",
        name: "newInterestRateModel",
        type: "address"
      }
    ],
    name: "_setInterestRateModel",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newMigrator",
        type: "address"
      }
    ],
    name: "_setMigrator",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_minInterestAccumulated",
        type: "uint256"
      }
    ],
    name: "_setMinInterestAccumulated",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "newPendingAdmin",
        type: "address"
      }
    ],
    name: "_setPendingAdmin",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0xb71d1a0c"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newReserveFactorMantissa",
        type: "uint256"
      }
    ],
    name: "_setReserveFactor",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_transmitter",
        type: "address"
      }
    ],
    name: "acceptPayeeship",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "accrueInterest",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cid",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_platformFee",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_erc20Fee",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_erc20",
        type: "address"
      }
    ],
    name: "activateCampaign",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "activateExodusMode",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address"
      }
    ],
    name: "addAccess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_affiliate",
        type: "address"
      }
    ],
    name: "addAffiliate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "address",
        name: "controller",
        type: "address"
      }
    ],
    name: "addController",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "kappas",
        type: "bytes32[]"
      }
    ],
    name: "addKappas",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "min_liquidity",
        type: "uint256"
      },
      {
        name: "max_tokens",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "addLiquidity",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokenA",
        type: "address"
      },
      {
        name: "tokenB",
        type: "address"
      },
      {
        name: "amountADesired",
        type: "uint256"
      },
      {
        name: "amountBDesired",
        type: "uint256"
      },
      {
        name: "amountAMin",
        type: "uint256"
      },
      {
        name: "amountBMin",
        type: "uint256"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "addLiquidity",
    outputs: [
      {
        name: "amountA",
        type: "uint256"
      },
      {
        name: "amountB",
        type: "uint256"
      },
      {
        name: "liquidity",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "amountTokenDesired",
        type: "uint256"
      },
      {
        name: "amountTokenMin",
        type: "uint256"
      },
      {
        name: "amountETHMin",
        type: "uint256"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "addLiquidityETH",
    outputs: [
      {
        name: "amountToken",
        type: "uint256"
      },
      {
        name: "amountETH",
        type: "uint256"
      },
      {
        name: "liquidity",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "owner",
        type: "address"
      }
    ],
    name: "addOwner",
    outputs: [],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_marketId",
        type: "uint256"
      }
    ],
    name: "addSponsoredMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256"
      }
    ],
    name: "adminMint",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "recipients",
        type: "address[]"
      }
    ],
    name: "adminMintAirdrop",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "anySwapFeeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "txs",
        type: "bytes32[]"
      },
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]"
      },
      {
        internalType: "address[]",
        name: "to",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "fromChainIDs",
        type: "uint256[]"
      }
    ],
    name: "anySwapIn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "txs",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fromChainID",
        type: "uint256"
      }
    ],
    name: "anySwapIn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "txs",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fromChainID",
        type: "uint256"
      }
    ],
    name: "anySwapInAuto",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "txs",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fromChainID",
        type: "uint256"
      }
    ],
    name: "anySwapInExactTokensForNative",
    outputs: [
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "txs",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fromChainID",
        type: "uint256"
      }
    ],
    name: "anySwapInExactTokensForTokens",
    outputs: [
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "txs",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fromChainID",
        type: "uint256"
      }
    ],
    name: "anySwapInUnderlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOut",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]"
      },
      {
        internalType: "address[]",
        name: "to",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "toChainIDs",
        type: "uint256[]"
      }
    ],
    name: "anySwapOut",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOutExactTokensForNative",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOutExactTokensForNativeUnderlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOutExactTokensForNativeUnderlyingWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOutExactTokensForNativeUnderlyingWithTransferPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOutExactTokensForTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOutExactTokensForTokensUnderlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOutExactTokensForTokensUnderlyingWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOutExactTokensForTokensUnderlyingWithTransferPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOutUnderlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOutUnderlyingWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "toChainID",
        type: "uint256"
      }
    ],
    name: "anySwapOutUnderlyingWithTransferPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "appendSequencerBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "spender",
        type: "address"
      },
      {
        name: "value",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "approveMax",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "approveMaxMinusOne",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "addrs",
        type: "address[7]"
      },
      {
        name: "uints",
        type: "uint256[9]"
      },
      {
        name: "feeMethod",
        type: "uint8"
      },
      {
        name: "side",
        type: "uint8"
      },
      {
        name: "saleKind",
        type: "uint8"
      },
      {
        name: "howToCall",
        type: "uint8"
      },
      {
        name: "calldata",
        type: "bytes"
      },
      {
        name: "replacementPattern",
        type: "bytes"
      },
      {
        name: "staticExtradata",
        type: "bytes"
      },
      {
        name: "orderbookInclusionDesired",
        type: "bool"
      }
    ],
    name: "approveOrder_",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "approveZeroThenMax",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "approveZeroThenMaxMinusOne",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "addrs",
        type: "address[14]"
      },
      {
        name: "uints",
        type: "uint256[18]"
      },
      {
        name: "feeMethodsSidesKindsHowToCalls",
        type: "uint8[8]"
      },
      {
        name: "calldataBuy",
        type: "bytes"
      },
      {
        name: "calldataSell",
        type: "bytes"
      },
      {
        name: "replacementPatternBuy",
        type: "bytes"
      },
      {
        name: "replacementPatternSell",
        type: "bytes"
      },
      {
        name: "staticExtradataBuy",
        type: "bytes"
      },
      {
        name: "staticExtradataSell",
        type: "bytes"
      },
      {
        name: "vs",
        type: "uint8[2]"
      },
      {
        name: "rssMetadata",
        type: "bytes32[5]"
      }
    ],
    name: "atomicMatch_",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256"
      }
    ],
    name: "backUnbacked",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "balanceOfUnderlying",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "enum LibNFTOrder.TradeDirection",
            name: "direction",
            type: "uint8"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20TokenV06",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "contract IERC721Token",
            name: "erc721Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc721TokenId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "erc721TokenProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.ERC721Order[]",
        name: "sellOrders",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature[]",
        name: "signatures",
        type: "tuple[]"
      },
      {
        internalType: "bytes[]",
        name: "callbackData",
        type: "bytes[]"
      },
      {
        internalType: "bool",
        name: "revertIfIncomplete",
        type: "bool"
      }
    ],
    name: "batchBuyERC721s",
    outputs: [
      {
        internalType: "bool[]",
        name: "successes",
        type: "bool[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          }
        ],
        internalType: "struct LibNFTOrder.NFTSellOrder[]",
        name: "sellOrders",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature[]",
        name: "signatures",
        type: "tuple[]"
      },
      {
        internalType: "bool",
        name: "revertIfIncomplete",
        type: "bool"
      }
    ],
    name: "batchBuyERC721s",
    outputs: [
      {
        internalType: "bool[]",
        name: "successes",
        type: "bool[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          }
        ],
        internalType: "struct LibNFTOrder.NFTSellOrder[]",
        name: "sellOrders",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature[]",
        name: "signatures",
        type: "tuple[]"
      },
      {
        internalType: "address[]",
        name: "takers",
        type: "address[]"
      },
      {
        internalType: "bytes[]",
        name: "callbackData",
        type: "bytes[]"
      },
      {
        internalType: "bool",
        name: "revertIfIncomplete",
        type: "bool"
      }
    ],
    name: "batchBuyERC721sEx",
    outputs: [
      {
        internalType: "bool[]",
        name: "successes",
        type: "bool[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "orderNonces",
        type: "uint256[]"
      }
    ],
    name: "batchCancelERC721Orders",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "enum LibNFTOrder.TradeDirection",
            name: "direction",
            type: "uint8"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20TokenV06",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "contract IERC721Token",
            name: "erc721Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc721TokenId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "erc721TokenProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.ERC721Order[]",
        name: "sellOrders",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "enum LibNFTOrder.TradeDirection",
            name: "direction",
            type: "uint8"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20TokenV06",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "contract IERC721Token",
            name: "erc721Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc721TokenId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "erc721TokenProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.ERC721Order[]",
        name: "buyOrders",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature[]",
        name: "sellOrderSignatures",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature[]",
        name: "buyOrderSignatures",
        type: "tuple[]"
      }
    ],
    name: "batchMatchERC721Orders",
    outputs: [
      {
        internalType: "uint256[]",
        name: "profits",
        type: "uint256[]"
      },
      {
        internalType: "bool[]",
        name: "successes",
        type: "bool[]"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          }
        ],
        internalType: "struct LibNFTOrder.NFTSellOrder[]",
        name: "sellOrders",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "nftProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.NFTBuyOrder[]",
        name: "buyOrders",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature[]",
        name: "sellOrderSignatures",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature[]",
        name: "buyOrderSignatures",
        type: "tuple[]"
      }
    ],
    name: "batchMatchERC721Orders",
    outputs: [
      {
        internalType: "uint256[]",
        name: "profits",
        type: "uint256[]"
      },
      {
        internalType: "bool[]",
        name: "successes",
        type: "bool[]"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "kind",
        type: "uint8"
      },
      {
        components: [
          {
            name: "poolId",
            type: "bytes32"
          },
          {
            name: "assetInIndex",
            type: "uint256"
          },
          {
            name: "assetOutIndex",
            type: "uint256"
          },
          {
            name: "amount",
            type: "uint256"
          },
          {
            name: "userData",
            type: "bytes"
          }
        ],
        name: "swaps",
        type: "tuple[]"
      },
      {
        name: "assets",
        type: "address[]"
      },
      {
        components: [
          {
            name: "sender",
            type: "address"
          },
          {
            name: "fromInternalBalance",
            type: "bool"
          },
          {
            name: "recipient",
            type: "address"
          },
          {
            name: "toInternalBalance",
            type: "bool"
          }
        ],
        name: "funds",
        type: "tuple"
      },
      {
        name: "limits",
        type: "int256[]"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "batchSwap",
    outputs: [
      {
        name: "assetDeltas",
        type: "int256[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "reserve",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "interestRateMode",
        type: "uint256"
      },
      {
        name: "referralCode",
        type: "uint16"
      }
    ],
    name: "borrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "interestRateMode",
        type: "uint256"
      },
      {
        internalType: "uint16",
        name: "referralCode",
        type: "uint16"
      },
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address"
      }
    ],
    name: "borrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "args",
        type: "bytes32"
      }
    ],
    name: "borrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256"
      }
    ],
    name: "borrow",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "borrowBalanceCurrent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "lendingPool",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "interesRateMode",
        type: "uint256"
      },
      {
        name: "referralCode",
        type: "uint16"
      }
    ],
    name: "borrowETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "lendingPool",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "interesRateMode",
        type: "uint256"
      },
      {
        name: "referralCode",
        type: "uint256"
      }
    ],
    name: "borrowETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: "address",
                    name: "trader",
                    type: "address"
                  },
                  {
                    internalType: "enum Side",
                    name: "side",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "matchingPolicy",
                    type: "address"
                  },
                  {
                    internalType: "address",
                    name: "collection",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256"
                  },
                  {
                    internalType: "address",
                    name: "paymentToken",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "price",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "listingTime",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "expirationTime",
                    type: "uint256"
                  },
                  {
                    components: [
                      {
                        internalType: "uint16",
                        name: "rate",
                        type: "uint16"
                      },
                      {
                        internalType: "address payable",
                        name: "recipient",
                        type: "address"
                      }
                    ],
                    internalType: "struct Fee[]",
                    name: "fees",
                    type: "tuple[]"
                  },
                  {
                    internalType: "uint256",
                    name: "salt",
                    type: "uint256"
                  },
                  {
                    internalType: "bytes",
                    name: "extraParams",
                    type: "bytes"
                  }
                ],
                internalType: "struct Order",
                name: "order",
                type: "tuple"
              },
              {
                internalType: "uint8",
                name: "v",
                type: "uint8"
              },
              {
                internalType: "bytes32",
                name: "r",
                type: "bytes32"
              },
              {
                internalType: "bytes32",
                name: "s",
                type: "bytes32"
              },
              {
                internalType: "bytes",
                name: "extraSignature",
                type: "bytes"
              },
              {
                internalType: "enum SignatureVersion",
                name: "signatureVersion",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "blockNumber",
                type: "uint256"
              }
            ],
            internalType: "struct Input",
            name: "sell",
            type: "tuple"
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: "address",
                    name: "trader",
                    type: "address"
                  },
                  {
                    internalType: "enum Side",
                    name: "side",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "matchingPolicy",
                    type: "address"
                  },
                  {
                    internalType: "address",
                    name: "collection",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256"
                  },
                  {
                    internalType: "address",
                    name: "paymentToken",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "price",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "listingTime",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "expirationTime",
                    type: "uint256"
                  },
                  {
                    components: [
                      {
                        internalType: "uint16",
                        name: "rate",
                        type: "uint16"
                      },
                      {
                        internalType: "address payable",
                        name: "recipient",
                        type: "address"
                      }
                    ],
                    internalType: "struct Fee[]",
                    name: "fees",
                    type: "tuple[]"
                  },
                  {
                    internalType: "uint256",
                    name: "salt",
                    type: "uint256"
                  },
                  {
                    internalType: "bytes",
                    name: "extraParams",
                    type: "bytes"
                  }
                ],
                internalType: "struct Order",
                name: "order",
                type: "tuple"
              },
              {
                internalType: "uint8",
                name: "v",
                type: "uint8"
              },
              {
                internalType: "bytes32",
                name: "r",
                type: "bytes32"
              },
              {
                internalType: "bytes32",
                name: "s",
                type: "bytes32"
              },
              {
                internalType: "bytes",
                name: "extraSignature",
                type: "bytes"
              },
              {
                internalType: "enum SignatureVersion",
                name: "signatureVersion",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "blockNumber",
                type: "uint256"
              }
            ],
            internalType: "struct Input",
            name: "buy",
            type: "tuple"
          }
        ],
        internalType: "struct Execution[]",
        name: "executions",
        type: "tuple[]"
      }
    ],
    name: "bulkExecute",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "to",
        type: "address"
      }
    ],
    name: "burn",
    outputs: [
      {
        name: "amount0",
        type: "uint256"
      },
      {
        name: "amount1",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amountOrTokenId",
        type: "uint256"
      }
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "account_",
        type: "address"
      },
      {
        name: "amount_",
        type: "uint256"
      }
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "account",
        type: "address"
      },
      {
        name: "value",
        type: "uint256"
      }
    ],
    name: "burnOnLiquidation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amount",
        type: "uint256"
      }
    ],
    name: "burnToWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "enum LibNFTOrder.TradeDirection",
            name: "direction",
            type: "uint8"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20TokenV06",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "contract IERC721Token",
            name: "erc721Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc721TokenId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "erc721TokenProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.ERC721Order",
        name: "sellOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "signature",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "callbackData",
        type: "bytes"
      }
    ],
    name: "buyERC721",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          }
        ],
        internalType: "struct LibNFTOrder.NFTSellOrder",
        name: "sellOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "signature",
        type: "tuple"
      }
    ],
    name: "buyERC721",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          }
        ],
        internalType: "struct LibNFTOrder.NFTSellOrder",
        name: "sellOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "signature",
        type: "tuple"
      },
      {
        internalType: "address",
        name: "taker",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "callbackData",
        type: "bytes"
      }
    ],
    name: "buyERC721Ex",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          }
        ],
        internalType: "struct LibNFTOrder.NFTSellOrder",
        name: "sellOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "signature",
        type: "tuple"
      },
      {
        internalType: "address",
        name: "taker",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "ethAvailable",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "takerCallbackData",
        type: "bytes"
      }
    ],
    name: "buyERC721ExFromProxy",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          }
        ],
        internalType: "struct LibNFTOrder.NFTSellOrder",
        name: "sellOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "signature",
        type: "tuple"
      }
    ],
    name: "buyERC721FromProxy",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !0,
    inputs: [],
    name: "calcMaxWithdraw",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "callPositionManager",
    outputs: [
      {
        internalType: "bytes",
        name: "result",
        type: "bytes"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "offerer",
            type: "address"
          },
          {
            name: "zone",
            type: "address"
          },
          {
            components: [
              {
                name: "itemType",
                type: "uint8"
              },
              {
                name: "token",
                type: "address"
              },
              {
                name: "identifierOrCriteria",
                type: "uint256"
              },
              {
                name: "startAmount",
                type: "uint256"
              },
              {
                name: "endAmount",
                type: "uint256"
              }
            ],
            name: "offer",
            type: "tuple[]"
          },
          {
            components: [
              {
                name: "itemType",
                type: "uint8"
              },
              {
                name: "token",
                type: "address"
              },
              {
                name: "identifierOrCriteria",
                type: "uint256"
              },
              {
                name: "startAmount",
                type: "uint256"
              },
              {
                name: "endAmount",
                type: "uint256"
              },
              {
                name: "recipient",
                type: "address"
              }
            ],
            name: "consideration",
            type: "tuple[]"
          },
          {
            name: "orderType",
            type: "uint8"
          },
          {
            name: "startTime",
            type: "uint256"
          },
          {
            name: "endTime",
            type: "uint256"
          },
          {
            name: "zoneHash",
            type: "bytes32"
          },
          {
            name: "salt",
            type: "uint256"
          },
          {
            name: "conduitKey",
            type: "bytes32"
          },
          {
            name: "counter",
            type: "uint256"
          }
        ],
        name: "orders",
        type: "tuple[]"
      }
    ],
    name: "cancel",
    outputs: [
      {
        name: "cancelled",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "orderNonce",
        type: "uint256"
      }
    ],
    name: "cancelERC721Order",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "trader",
            type: "address"
          },
          {
            internalType: "enum Side",
            name: "side",
            type: "uint8"
          },
          {
            internalType: "address",
            name: "matchingPolicy",
            type: "address"
          },
          {
            internalType: "address",
            name: "collection",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "paymentToken",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "listingTime",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "expirationTime",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "uint16",
                name: "rate",
                type: "uint16"
              },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address"
              }
            ],
            internalType: "struct Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "extraParams",
            type: "bytes"
          }
        ],
        internalType: "struct Order",
        name: "order",
        type: "tuple"
      }
    ],
    name: "cancelOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "orderInfo",
        type: "uint256"
      }
    ],
    name: "cancelOrderRFQ",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "addrs",
        type: "address[7]"
      },
      {
        name: "uints",
        type: "uint256[9]"
      },
      {
        name: "feeMethod",
        type: "uint8"
      },
      {
        name: "side",
        type: "uint8"
      },
      {
        name: "saleKind",
        type: "uint8"
      },
      {
        name: "howToCall",
        type: "uint8"
      },
      {
        name: "calldata",
        type: "bytes"
      },
      {
        name: "replacementPattern",
        type: "bytes"
      },
      {
        name: "staticExtradata",
        type: "bytes"
      },
      {
        name: "v",
        type: "uint8"
      },
      {
        name: "r",
        type: "bytes32"
      },
      {
        name: "s",
        type: "bytes32"
      }
    ],
    name: "cancelOrder_",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "trader",
            type: "address"
          },
          {
            internalType: "enum Side",
            name: "side",
            type: "uint8"
          },
          {
            internalType: "address",
            name: "matchingPolicy",
            type: "address"
          },
          {
            internalType: "address",
            name: "collection",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "paymentToken",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "listingTime",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "expirationTime",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "uint16",
                name: "rate",
                type: "uint16"
              },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address"
              }
            ],
            internalType: "struct Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "extraParams",
            type: "bytes"
          }
        ],
        internalType: "struct Order[]",
        name: "orders",
        type: "tuple[]"
      }
    ],
    name: "cancelOrders",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "_n",
        type: "uint64"
      },
      {
        internalType: "bytes[]",
        name: "_depositsPubdata",
        type: "bytes[]"
      }
    ],
    name: "cancelOutstandingDepositsForExodusMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_dailyLimit",
        type: "uint256"
      }
    ],
    name: "changeDailyLimit",
    outputs: [],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newMPC",
        type: "address"
      }
    ],
    name: "changeMPC",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "newMinimumMakerProtocolFee",
        type: "uint256"
      }
    ],
    name: "changeMinimumMakerProtocolFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "newMinimumTakerProtocolFee",
        type: "uint256"
      }
    ],
    name: "changeMinimumTakerProtocolFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_protocolFeeMultiplier",
        type: "uint256"
      }
    ],
    name: "changeProtocolFeeMultiplier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_protocolFeeRecipient",
        type: "address"
      }
    ],
    name: "changeProtocolFeeRecipient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_required",
        type: "uint256"
      }
    ],
    name: "changeRequirement",
    outputs: [],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "newVault",
        type: "address"
      }
    ],
    name: "changeVault",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cid",
        type: "uint256"
      },
      {
        internalType: "contract IStarNFT",
        name: "_starNFT",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_dummyId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_powah",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes"
      }
    ],
    name: "claim",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cid",
        type: "uint256"
      },
      {
        internalType: "contract IStarNFT",
        name: "_starNFT",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_dummyId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_powah",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_mintTo",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes"
      }
    ],
    name: "claim",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "claim",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cid",
        type: "uint256"
      },
      {
        internalType: "contract IStarNFT",
        name: "_starNFT",
        type: "address"
      },
      {
        internalType: "uint256[]",
        name: "_dummyIdArr",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "_powahArr",
        type: "uint256[]"
      },
      {
        internalType: "address",
        name: "_mintTo",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes"
      }
    ],
    name: "claimBatch",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cid",
        type: "uint256"
      },
      {
        internalType: "contract IStarNFT",
        name: "_starNFT",
        type: "address"
      },
      {
        internalType: "uint256[]",
        name: "_dummyIdArr",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "_powahArr",
        type: "uint256[]"
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes"
      }
    ],
    name: "claimBatch",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cid",
        type: "uint256"
      },
      {
        internalType: "contract IStarNFT",
        name: "_starNFT",
        type: "address"
      },
      {
        internalType: "uint256[]",
        name: "_dummyIdArr",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "_powahArr",
        type: "uint256[]"
      },
      {
        internalType: "uint256",
        name: "_cap",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes"
      }
    ],
    name: "claimBatchCapped",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cid",
        type: "uint256"
      },
      {
        internalType: "contract IStarNFT",
        name: "_starNFT",
        type: "address"
      },
      {
        internalType: "uint256[]",
        name: "_dummyIdArr",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "_powahArr",
        type: "uint256[]"
      },
      {
        internalType: "uint256",
        name: "_cap",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_mintTo",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes"
      }
    ],
    name: "claimBatchCapped",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cid",
        type: "uint256"
      },
      {
        internalType: "contract IStarNFT",
        name: "_starNFT",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_dummyId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_powah",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_cap",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes"
      }
    ],
    name: "claimCapped",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cid",
        type: "uint256"
      },
      {
        internalType: "contract IStarNFT",
        name: "_starNFT",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_dummyId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_powah",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_cap",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_mintTo",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes"
      }
    ],
    name: "claimCapped",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "claimCompAndPay",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_token",
        type: "address"
      },
      {
        name: "_to",
        type: "address"
      }
    ],
    name: "claimTokens",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "resolver",
        type: "address"
      }
    ],
    name: "claimWithResolver",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32"
      }
    ],
    name: "clearDNSZone",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "srcToken",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "dstToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minReturn",
        type: "uint256"
      }
    ],
    name: "clipperSwap",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "srcToken",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "dstToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minReturn",
        type: "uint256"
      }
    ],
    name: "clipperSwapTo",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "srcToken",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "dstToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minReturn",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "permit",
        type: "bytes"
      }
    ],
    name: "clipperSwapToWithPermit",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "close",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "closeAllTrades",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "tokenId",
            type: "uint256"
          },
          {
            name: "recipient",
            type: "address"
          },
          {
            name: "amount0Max",
            type: "uint128"
          },
          {
            name: "amount1Max",
            type: "uint128"
          }
        ],
        name: "params",
        type: "tuple"
      }
    ],
    name: "collect",
    outputs: [
      {
        name: "amount0",
        type: "uint256"
      },
      {
        name: "amount1",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "looksRareClaim",
        type: "bytes"
      }
    ],
    name: "collectRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "commitment",
        type: "bytes32"
      }
    ],
    name: "commit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint32",
            name: "blockNumber",
            type: "uint32"
          },
          {
            internalType: "uint64",
            name: "priorityOperations",
            type: "uint64"
          },
          {
            internalType: "bytes32",
            name: "pendingOnchainOperationsHash",
            type: "bytes32"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "stateHash",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "commitment",
            type: "bytes32"
          }
        ],
        internalType: "struct Storage.StoredBlockInfo",
        name: "_lastCommittedBlockData",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "newStateHash",
            type: "bytes32"
          },
          {
            internalType: "bytes",
            name: "publicData",
            type: "bytes"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "bytes",
                name: "ethWitness",
                type: "bytes"
              },
              {
                internalType: "uint32",
                name: "publicDataOffset",
                type: "uint32"
              }
            ],
            internalType: "struct ZkSync.OnchainOperationData[]",
            name: "onchainOperations",
            type: "tuple[]"
          },
          {
            internalType: "uint32",
            name: "blockNumber",
            type: "uint32"
          },
          {
            internalType: "uint32",
            name: "feeAccount",
            type: "uint32"
          }
        ],
        internalType: "struct ZkSync.CommitBlockInfo[]",
        name: "_newBlocksData",
        type: "tuple[]"
      }
    ],
    name: "commitBlocks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "id",
        type: "uint8"
      },
      {
        components: [
          {
            internalType: "uint16",
            name: "ltv",
            type: "uint16"
          },
          {
            internalType: "uint16",
            name: "liquidationThreshold",
            type: "uint16"
          },
          {
            internalType: "uint16",
            name: "liquidationBonus",
            type: "uint16"
          },
          {
            internalType: "address",
            name: "priceSource",
            type: "address"
          },
          {
            internalType: "string",
            name: "label",
            type: "string"
          }
        ],
        internalType: "struct DataTypes.EModeCategory",
        name: "category",
        type: "tuple"
      }
    ],
    name: "configureEModeCategory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "transactionId",
        type: "uint256"
      }
    ],
    name: "confirmTransaction",
    outputs: [],
    payable: !1,
    type: "function"
  },
  {
    constant: !0,
    inputs: [
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
        type: "address"
      }
    ],
    name: "confirmations",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        name: "name",
        type: "string"
      },
      {
        name: "symbol",
        type: "string"
      },
      {
        name: "implementationName",
        type: "string"
      },
      {
        name: "engine",
        type: "address"
      },
      {
        name: "owner",
        type: "address"
      }
    ],
    name: "createCollection",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_mm",
        type: "address"
      },
      {
        internalType: "address",
        name: "_treasury",
        type: "address"
      },
      {
        internalType: "string",
        name: "_name",
        type: "string"
      },
      {
        internalType: "bool",
        name: "_active",
        type: "bool"
      }
    ],
    name: "createMMInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract ERC20",
            name: "token",
            type: "address"
          },
          {
            internalType: "contract IERC721",
            name: "nft",
            type: "address"
          },
          {
            internalType: "contract ICurve",
            name: "bondingCurve",
            type: "address"
          },
          {
            internalType: "address payable",
            name: "assetRecipient",
            type: "address"
          },
          {
            internalType: "enum LSSVMPair.PoolType",
            name: "poolType",
            type: "uint8"
          },
          {
            internalType: "uint128",
            name: "delta",
            type: "uint128"
          },
          {
            internalType: "uint96",
            name: "fee",
            type: "uint96"
          },
          {
            internalType: "uint128",
            name: "spotPrice",
            type: "uint128"
          },
          {
            internalType: "uint256[]",
            name: "initialNFTIDs",
            type: "uint256[]"
          },
          {
            internalType: "uint256",
            name: "initialTokenBalance",
            type: "uint256"
          }
        ],
        internalType: "struct LSSVMPairFactory.CreateERC20PairParams",
        name: "params",
        type: "tuple"
      }
    ],
    name: "createPairERC20",
    outputs: [
      {
        internalType: "contract LSSVMPairERC20",
        name: "pair",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC721",
        name: "_nft",
        type: "address"
      },
      {
        internalType: "contract ICurve",
        name: "_bondingCurve",
        type: "address"
      },
      {
        internalType: "address payable",
        name: "_assetRecipient",
        type: "address"
      },
      {
        internalType: "enum LSSVMPair.PoolType",
        name: "_poolType",
        type: "uint8"
      },
      {
        internalType: "uint128",
        name: "_delta",
        type: "uint128"
      },
      {
        internalType: "uint96",
        name: "_fee",
        type: "uint96"
      },
      {
        internalType: "uint128",
        name: "_spotPrice",
        type: "uint128"
      },
      {
        internalType: "uint256[]",
        name: "_initialNFTIDs",
        type: "uint256[]"
      }
    ],
    name: "createPairETH",
    outputs: [
      {
        internalType: "contract LSSVMPairETH",
        name: "pair",
        type: "address"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "targetsHash",
        type: "bytes32"
      }
    ],
    name: "cutUpgradeNoticePeriod",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "signatures",
        type: "bytes[]"
      }
    ],
    name: "cutUpgradeNoticePeriodBySignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !0,
    inputs: [],
    name: "dailyLimit",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "spender",
        type: "address"
      },
      {
        name: "subtractedValue",
        type: "uint256"
      }
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "tokenId",
            type: "uint256"
          },
          {
            name: "liquidity",
            type: "uint128"
          },
          {
            name: "amount0Min",
            type: "uint256"
          },
          {
            name: "amount1Min",
            type: "uint256"
          },
          {
            name: "deadline",
            type: "uint256"
          }
        ],
        name: "params",
        type: "tuple"
      }
    ],
    name: "decreaseLiquidity",
    outputs: [
      {
        name: "amount0",
        type: "uint256"
      },
      {
        name: "amount1",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "delegatee",
        type: "address"
      }
    ],
    name: "delegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "delegatee",
        type: "address"
      },
      {
        name: "nonce",
        type: "uint256"
      },
      {
        name: "expiry",
        type: "uint256"
      },
      {
        name: "v",
        type: "uint8"
      },
      {
        name: "r",
        type: "bytes32"
      },
      {
        name: "s",
        type: "bytes32"
      }
    ],
    name: "delegateBySig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "data1",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "data2",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "data3",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct IBatchSignedERC721OrdersFeature.BatchSignedERC721OrderParameter",
        name: "",
        type: "tuple"
      },
      {
        internalType: "address",
        name: "erc20TokenFromDelegateCall",
        type: "address"
      },
      {
        internalType: "address",
        name: "platformFeeRecipientFromDelegateCall",
        type: "address"
      },
      {
        internalType: "address",
        name: "royaltyFeeRecipientFromDelegateCall",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "collections",
        type: "bytes"
      }
    ],
    name: "delegateCallFillBatchSignedERC721Order",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "delegateToImplementation",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x0933c1ed"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_address",
        type: "address"
      }
    ],
    name: "deltrustNode",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "addrA",
        type: "address"
      },
      {
        name: "addrB",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "reserve",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "referralCode",
        type: "uint16"
      }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "sender",
        type: "address"
      },
      {
        name: "depositAmounts",
        type: "uint256[]"
      },
      {
        name: "nDays",
        type: "uint256"
      },
      {
        name: "poolTokens",
        type: "uint256"
      },
      {
        name: "goodUntil",
        type: "uint256"
      },
      {
        components: [
          {
            name: "v",
            type: "uint8"
          },
          {
            name: "r",
            type: "bytes32"
          },
          {
            name: "s",
            type: "bytes32"
          }
        ],
        name: "theSignature",
        type: "tuple"
      }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address"
      },
      {
        internalType: "uint16",
        name: "referralCode",
        type: "uint16"
      }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256"
      },
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256"
      },
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "tokenIndexFrom",
        type: "uint8"
      },
      {
        internalType: "uint8",
        name: "tokenIndexTo",
        type: "uint8"
      },
      {
        internalType: "uint256",
        name: "minDy",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "depositAndSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract ERC20",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "depositERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_token",
        type: "address"
      },
      {
        internalType: "uint104",
        name: "_amount",
        type: "uint104"
      },
      {
        internalType: "address",
        name: "_zkSyncAddress",
        type: "address"
      }
    ],
    name: "depositERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "lendingPool",
        type: "address"
      },
      {
        name: "onBehalfOf",
        type: "address"
      },
      {
        name: "referralCode",
        type: "uint16"
      }
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "lendingPool",
        type: "address"
      },
      {
        name: "onBehalfOf",
        type: "address"
      },
      {
        name: "referralCode",
        type: "uint256"
      }
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_zkSyncAddress",
        type: "address"
      }
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC721",
        name: "_nft",
        type: "address"
      },
      {
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      }
    ],
    name: "depositNFTs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "sender",
        type: "address"
      },
      {
        name: "inputToken",
        type: "address"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "nDays",
        type: "uint256"
      },
      {
        name: "poolTokens",
        type: "uint256"
      },
      {
        name: "goodUntil",
        type: "uint256"
      },
      {
        components: [
          {
            name: "v",
            type: "uint8"
          },
          {
            name: "r",
            type: "bytes32"
          },
          {
            name: "s",
            type: "bytes32"
          }
        ],
        name: "theSignature",
        type: "tuple"
      }
    ],
    name: "depositSingleAsset",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "destroy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "disableAccessCheck",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_token",
        type: "address"
      }
    ],
    name: "disableInterest",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "caller",
        type: "address"
      },
      {
        components: [
          {
            name: "srcToken",
            type: "address"
          },
          {
            name: "dstToken",
            type: "address"
          },
          {
            name: "srcReceiver",
            type: "address"
          },
          {
            name: "dstReceiver",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          },
          {
            name: "minReturnAmount",
            type: "uint256"
          },
          {
            name: "flags",
            type: "uint256"
          },
          {
            name: "permit",
            type: "bytes"
          }
        ],
        name: "desc",
        type: "tuple"
      },
      {
        name: "data",
        type: "bytes"
      }
    ],
    name: "discountedSwap",
    outputs: [
      {
        name: "returnAmount",
        type: "uint256"
      },
      {
        name: "gasLeft",
        type: "uint256"
      },
      {
        name: "chiSpent",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_amount",
        type: "uint256"
      },
      {
        name: "_to",
        type: "address"
      }
    ],
    name: "distribute",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      }
    ],
    name: "dropReserve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "to",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      }
    ],
    name: "emergencyEtherTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      }
    ],
    name: "emergencyTokenTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "enableAccessCheck",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_target",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_gasLimit",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes"
      }
    ],
    name: "enqueue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "min_tokens",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "ethToTokenSwapInput",
    outputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "ethToTokenSwapOutput",
    outputs: [
      {
        name: "eth_sold",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "min_tokens",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "recipient",
        type: "address"
      }
    ],
    name: "ethToTokenTransferInput",
    outputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "recipient",
        type: "address"
      }
    ],
    name: "ethToTokenTransferOutput",
    outputs: [
      {
        name: "eth_sold",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "path",
            type: "bytes"
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "amountOutMinimum",
            type: "uint256"
          }
        ],
        internalType: "struct IV3SwapRouter.ExactInputParams",
        name: "params",
        type: "tuple"
      }
    ],
    name: "exactInput",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "tokenIn",
            type: "address"
          },
          {
            internalType: "address",
            name: "tokenOut",
            type: "address"
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24"
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "amountOutMinimum",
            type: "uint256"
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160"
          }
        ],
        internalType: "struct IV3SwapRouter.ExactInputSingleParams",
        name: "params",
        type: "tuple"
      }
    ],
    name: "exactInputSingle",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "path",
            type: "bytes"
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "amountInMaximum",
            type: "uint256"
          }
        ],
        internalType: "struct IV3SwapRouter.ExactOutputParams",
        name: "params",
        type: "tuple"
      }
    ],
    name: "exactOutput",
    outputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "tokenIn",
            type: "address"
          },
          {
            internalType: "address",
            name: "tokenOut",
            type: "address"
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24"
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "amountInMaximum",
            type: "uint256"
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160"
          }
        ],
        internalType: "struct IV3SwapRouter.ExactOutputSingleParams",
        name: "params",
        type: "tuple"
      }
    ],
    name: "exactOutputSingle",
    outputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "exchangeRateCurrent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "trader",
                type: "address"
              },
              {
                internalType: "enum Side",
                name: "side",
                type: "uint8"
              },
              {
                internalType: "address",
                name: "matchingPolicy",
                type: "address"
              },
              {
                internalType: "address",
                name: "collection",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "address",
                name: "paymentToken",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "price",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "listingTime",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "expirationTime",
                type: "uint256"
              },
              {
                components: [
                  {
                    internalType: "uint16",
                    name: "rate",
                    type: "uint16"
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address"
                  }
                ],
                internalType: "struct Fee[]",
                name: "fees",
                type: "tuple[]"
              },
              {
                internalType: "uint256",
                name: "salt",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "extraParams",
                type: "bytes"
              }
            ],
            internalType: "struct Order",
            name: "order",
            type: "tuple"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          },
          {
            internalType: "bytes",
            name: "extraSignature",
            type: "bytes"
          },
          {
            internalType: "enum SignatureVersion",
            name: "signatureVersion",
            type: "uint8"
          },
          {
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256"
          }
        ],
        internalType: "struct Input",
        name: "sell",
        type: "tuple"
      },
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "trader",
                type: "address"
              },
              {
                internalType: "enum Side",
                name: "side",
                type: "uint8"
              },
              {
                internalType: "address",
                name: "matchingPolicy",
                type: "address"
              },
              {
                internalType: "address",
                name: "collection",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "address",
                name: "paymentToken",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "price",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "listingTime",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "expirationTime",
                type: "uint256"
              },
              {
                components: [
                  {
                    internalType: "uint16",
                    name: "rate",
                    type: "uint16"
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address"
                  }
                ],
                internalType: "struct Fee[]",
                name: "fees",
                type: "tuple[]"
              },
              {
                internalType: "uint256",
                name: "salt",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "extraParams",
                type: "bytes"
              }
            ],
            internalType: "struct Order",
            name: "order",
            type: "tuple"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          },
          {
            internalType: "bytes",
            name: "extraSignature",
            type: "bytes"
          },
          {
            internalType: "enum SignatureVersion",
            name: "signatureVersion",
            type: "uint8"
          },
          {
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256"
          }
        ],
        internalType: "struct Input",
        name: "buy",
        type: "tuple"
      }
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "commands",
        type: "bytes"
      },
      {
        internalType: "bytes[]",
        name: "inputs",
        type: "bytes[]"
      }
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "commands",
        type: "bytes"
      },
      {
        internalType: "bytes[]",
        name: "inputs",
        type: "bytes[]"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint32",
                name: "blockNumber",
                type: "uint32"
              },
              {
                internalType: "uint64",
                name: "priorityOperations",
                type: "uint64"
              },
              {
                internalType: "bytes32",
                name: "pendingOnchainOperationsHash",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "timestamp",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "stateHash",
                type: "bytes32"
              },
              {
                internalType: "bytes32",
                name: "commitment",
                type: "bytes32"
              }
            ],
            internalType: "struct Storage.StoredBlockInfo",
            name: "storedBlock",
            type: "tuple"
          },
          {
            internalType: "bytes[]",
            name: "pendingOnchainOpsPubdata",
            type: "bytes[]"
          }
        ],
        internalType: "struct ZkSync.ExecuteBlockInfo[]",
        name: "_blocksData",
        type: "tuple[]"
      },
      {
        internalType: "bool",
        name: "_completeWithdrawals",
        type: "bool"
      }
    ],
    name: "executeBlocks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "message",
        type: "bytes"
      },
      {
        name: "signatures",
        type: "bytes"
      }
    ],
    name: "executeSignatures",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "message",
        type: "bytes"
      },
      {
        name: "signatures",
        type: "bytes"
      },
      {
        name: "maxTokensFee",
        type: "uint256"
      }
    ],
    name: "executeSignaturesGSN",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "transactionId",
        type: "uint256"
      }
    ],
    name: "executeTransaction",
    outputs: [],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        name: "poolId",
        type: "bytes32"
      },
      {
        name: "sender",
        type: "address"
      },
      {
        name: "recipient",
        type: "address"
      },
      {
        components: [
          {
            name: "assets",
            type: "address[]"
          },
          {
            name: "minAmountsOut",
            type: "uint256[]"
          },
          {
            name: "userData",
            type: "bytes"
          },
          {
            name: "toInternalBalance",
            type: "bool"
          }
        ],
        name: "request",
        type: "tuple"
      }
    ],
    name: "exitPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_receiveSide",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "_calldata",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "_offset",
        type: "uint256"
      }
    ],
    name: "externalCall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "data1",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "data2",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "data3",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct IBatchSignedERC721OrdersFeature.BatchSignedERC721OrderParameter",
        name: "",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "collections",
        type: "bytes"
      }
    ],
    name: "fillBatchSignedERC721Order",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "data1",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "data2",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "data3",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          },
          {
            internalType: "bytes",
            name: "collections",
            type: "bytes"
          }
        ],
        internalType: "struct IBatchSignedERC721OrdersFeature.BatchSignedERC721OrderParameters[]",
        name: "parameters",
        type: "tuple[]"
      },
      {
        internalType: "uint256",
        name: "additional1",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "additional2",
        type: "uint256"
      }
    ],
    name: "fillBatchSignedERC721Orders",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "info",
            type: "uint256"
          },
          {
            name: "makerAsset",
            type: "address"
          },
          {
            name: "takerAsset",
            type: "address"
          },
          {
            name: "maker",
            type: "address"
          },
          {
            name: "allowedSender",
            type: "address"
          },
          {
            name: "makingAmount",
            type: "uint256"
          },
          {
            name: "takingAmount",
            type: "uint256"
          }
        ],
        name: "order",
        type: "tuple"
      },
      {
        name: "signature",
        type: "bytes"
      },
      {
        name: "makingAmount",
        type: "uint256"
      },
      {
        name: "takingAmount",
        type: "uint256"
      }
    ],
    name: "fillOrderRFQ",
    outputs: [
      {
        name: "",
        type: "uint256"
      },
      {
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "info",
            type: "uint256"
          },
          {
            name: "makerAsset",
            type: "address"
          },
          {
            name: "takerAsset",
            type: "address"
          },
          {
            name: "maker",
            type: "address"
          },
          {
            name: "allowedSender",
            type: "address"
          },
          {
            name: "makingAmount",
            type: "uint256"
          },
          {
            name: "takingAmount",
            type: "uint256"
          }
        ],
        name: "order",
        type: "tuple"
      },
      {
        name: "signature",
        type: "bytes"
      },
      {
        name: "makingAmount",
        type: "uint256"
      },
      {
        name: "takingAmount",
        type: "uint256"
      },
      {
        name: "target",
        type: "address"
      }
    ],
    name: "fillOrderRFQTo",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "info",
            type: "uint256"
          },
          {
            name: "makerAsset",
            type: "address"
          },
          {
            name: "takerAsset",
            type: "address"
          },
          {
            name: "maker",
            type: "address"
          },
          {
            name: "allowedSender",
            type: "address"
          },
          {
            name: "makingAmount",
            type: "uint256"
          },
          {
            name: "takingAmount",
            type: "uint256"
          }
        ],
        name: "order",
        type: "tuple"
      },
      {
        name: "signature",
        type: "bytes"
      },
      {
        name: "makingAmount",
        type: "uint256"
      },
      {
        name: "takingAmount",
        type: "uint256"
      },
      {
        name: "target",
        type: "address"
      },
      {
        name: "permit",
        type: "bytes"
      }
    ],
    name: "fillOrderRFQToWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "finalizeOpenEdition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "balanceFromBefore",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "balanceToBefore",
        type: "uint256"
      }
    ],
    name: "finalizeTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiverAddress",
        type: "address"
      },
      {
        internalType: "address[]",
        name: "assets",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "interestRateModes",
        type: "uint256[]"
      },
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "params",
        type: "bytes"
      },
      {
        internalType: "uint16",
        name: "referralCode",
        type: "uint16"
      }
    ],
    name: "flashLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiverAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "params",
        type: "bytes"
      },
      {
        internalType: "uint16",
        name: "referralCode",
        type: "uint16"
      }
    ],
    name: "flashLoanSimple",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_receiver",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "_params",
        type: "bytes"
      }
    ],
    name: "flashloan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cid",
        type: "uint256"
      },
      {
        internalType: "contract IStarNFT",
        name: "_starNFT",
        type: "address"
      },
      {
        internalType: "uint256[]",
        name: "_nftIDs",
        type: "uint256[]"
      },
      {
        internalType: "uint256",
        name: "_dummyId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_powah",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes"
      }
    ],
    name: "forge",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_cid",
        type: "uint256"
      },
      {
        internalType: "contract IStarNFT",
        name: "_starNFT",
        type: "address"
      },
      {
        internalType: "uint256[]",
        name: "_nftIDs",
        type: "uint256[]"
      },
      {
        internalType: "uint256",
        name: "_dummyId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_powah",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_mintTo",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes"
      }
    ],
    name: "forge",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "orderUids",
        type: "bytes[]"
      }
    ],
    name: "freeFilledAmountStorage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "orderUids",
        type: "bytes[]"
      }
    ],
    name: "freePreSignatureStorage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "offerer",
                type: "address"
              },
              {
                internalType: "address",
                name: "zone",
                type: "address"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  }
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address"
                  }
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]"
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "startTime",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "endTime",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "zoneHash",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "salt",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "conduitKey",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256"
              }
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple"
          },
          {
            internalType: "uint120",
            name: "numerator",
            type: "uint120"
          },
          {
            internalType: "uint120",
            name: "denominator",
            type: "uint120"
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
          },
          {
            internalType: "bytes",
            name: "extraData",
            type: "bytes"
          }
        ],
        internalType: "struct AdvancedOrder",
        name: "advancedOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "orderIndex",
            type: "uint256"
          },
          {
            internalType: "enum Side",
            name: "side",
            type: "uint8"
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "identifier",
            type: "uint256"
          },
          {
            internalType: "bytes32[]",
            name: "criteriaProof",
            type: "bytes32[]"
          }
        ],
        internalType: "struct CriteriaResolver[]",
        name: "criteriaResolvers",
        type: "tuple[]"
      },
      {
        internalType: "bytes32",
        name: "fulfillerConduitKey",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      }
    ],
    name: "fulfillAdvancedOrder",
    outputs: [
      {
        internalType: "bool",
        name: "fulfilled",
        type: "bool"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "offerer",
                type: "address"
              },
              {
                internalType: "address",
                name: "zone",
                type: "address"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  }
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address"
                  }
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]"
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "startTime",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "endTime",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "zoneHash",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "salt",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "conduitKey",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256"
              }
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple"
          },
          {
            internalType: "uint120",
            name: "numerator",
            type: "uint120"
          },
          {
            internalType: "uint120",
            name: "denominator",
            type: "uint120"
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
          },
          {
            internalType: "bytes",
            name: "extraData",
            type: "bytes"
          }
        ],
        internalType: "struct AdvancedOrder[]",
        name: "advancedOrders",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "orderIndex",
            type: "uint256"
          },
          {
            internalType: "enum Side",
            name: "side",
            type: "uint8"
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "identifier",
            type: "uint256"
          },
          {
            internalType: "bytes32[]",
            name: "criteriaProof",
            type: "bytes32[]"
          }
        ],
        internalType: "struct CriteriaResolver[]",
        name: "criteriaResolvers",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "orderIndex",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "itemIndex",
            type: "uint256"
          }
        ],
        internalType: "struct FulfillmentComponent[][]",
        name: "offerFulfillments",
        type: "tuple[][]"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "orderIndex",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "itemIndex",
            type: "uint256"
          }
        ],
        internalType: "struct FulfillmentComponent[][]",
        name: "considerationFulfillments",
        type: "tuple[][]"
      },
      {
        internalType: "bytes32",
        name: "fulfillerConduitKey",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "maximumFulfilled",
        type: "uint256"
      }
    ],
    name: "fulfillAvailableAdvancedOrders",
    outputs: [
      {
        internalType: "bool[]",
        name: "availableOrders",
        type: "bool[]"
      },
      {
        components: [
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8"
              },
              {
                internalType: "address",
                name: "token",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "identifier",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address"
              }
            ],
            internalType: "struct ReceivedItem",
            name: "item",
            type: "tuple"
          },
          {
            internalType: "address",
            name: "offerer",
            type: "address"
          },
          {
            internalType: "bytes32",
            name: "conduitKey",
            type: "bytes32"
          }
        ],
        internalType: "struct Execution[]",
        name: "executions",
        type: "tuple[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "offerer",
                type: "address"
              },
              {
                internalType: "address",
                name: "zone",
                type: "address"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  }
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address"
                  }
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]"
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "startTime",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "endTime",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "zoneHash",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "salt",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "conduitKey",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256"
              }
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple"
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
          }
        ],
        internalType: "struct Order[]",
        name: "orders",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "orderIndex",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "itemIndex",
            type: "uint256"
          }
        ],
        internalType: "struct FulfillmentComponent[][]",
        name: "offerFulfillments",
        type: "tuple[][]"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "orderIndex",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "itemIndex",
            type: "uint256"
          }
        ],
        internalType: "struct FulfillmentComponent[][]",
        name: "considerationFulfillments",
        type: "tuple[][]"
      },
      {
        internalType: "bytes32",
        name: "fulfillerConduitKey",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "maximumFulfilled",
        type: "uint256"
      }
    ],
    name: "fulfillAvailableOrders",
    outputs: [
      {
        internalType: "bool[]",
        name: "availableOrders",
        type: "bool[]"
      },
      {
        components: [
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8"
              },
              {
                internalType: "address",
                name: "token",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "identifier",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address"
              }
            ],
            internalType: "struct ReceivedItem",
            name: "item",
            type: "tuple"
          },
          {
            internalType: "address",
            name: "offerer",
            type: "address"
          },
          {
            internalType: "bytes32",
            name: "conduitKey",
            type: "bytes32"
          }
        ],
        internalType: "struct Execution[]",
        name: "executions",
        type: "tuple[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "considerationToken",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "considerationIdentifier",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "considerationAmount",
            type: "uint256"
          },
          {
            internalType: "address payable",
            name: "offerer",
            type: "address"
          },
          {
            internalType: "address",
            name: "zone",
            type: "address"
          },
          {
            internalType: "address",
            name: "offerToken",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "offerIdentifier",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "offerAmount",
            type: "uint256"
          },
          {
            internalType: "enum BasicOrderType",
            name: "basicOrderType",
            type: "uint8"
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "zoneHash",
            type: "bytes32"
          },
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "offererConduitKey",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "fulfillerConduitKey",
            type: "bytes32"
          },
          {
            internalType: "uint256",
            name: "totalOriginalAdditionalRecipients",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address"
              }
            ],
            internalType: "struct AdditionalRecipient[]",
            name: "additionalRecipients",
            type: "tuple[]"
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
          }
        ],
        internalType: "struct BasicOrderParameters",
        name: "parameters",
        type: "tuple"
      }
    ],
    name: "fulfillBasicOrder",
    outputs: [
      {
        internalType: "bool",
        name: "fulfilled",
        type: "bool"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "offerer",
                type: "address"
              },
              {
                internalType: "address",
                name: "zone",
                type: "address"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  }
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address"
                  }
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]"
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "startTime",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "endTime",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "zoneHash",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "salt",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "conduitKey",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256"
              }
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple"
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
          }
        ],
        internalType: "struct Order",
        name: "order",
        type: "tuple"
      },
      {
        internalType: "bytes32",
        name: "fulfillerConduitKey",
        type: "bytes32"
      }
    ],
    name: "fulfillOrder",
    outputs: [
      {
        internalType: "bool",
        name: "fulfilled",
        type: "bool"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "getApprovalType",
    outputs: [
      {
        internalType: "enum IApproveAndCall.ApprovalType",
        name: "",
        type: "uint8"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !0,
    inputs: [
      {
        name: "transactionId",
        type: "uint256"
      }
    ],
    name: "getConfirmationCount",
    outputs: [
      {
        name: "count",
        type: "uint256"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    constant: !0,
    inputs: [
      {
        name: "transactionId",
        type: "uint256"
      }
    ],
    name: "getConfirmations",
    outputs: [
      {
        name: "_confirmations",
        type: "address[]"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    constant: !0,
    inputs: [],
    name: "getOwners",
    outputs: [
      {
        name: "",
        type: "address[]"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "getReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !0,
    inputs: [
      {
        name: "pending",
        type: "bool"
      },
      {
        name: "executed",
        type: "bool"
      }
    ],
    name: "getTransactionCount",
    outputs: [
      {
        name: "count",
        type: "uint256"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    constant: !0,
    inputs: [
      {
        name: "from",
        type: "uint256"
      },
      {
        name: "to",
        type: "uint256"
      },
      {
        name: "pending",
        type: "bool"
      },
      {
        name: "executed",
        type: "bool"
      }
    ],
    name: "getTransactionIds",
    outputs: [
      {
        name: "_transactionIds",
        type: "uint256[]"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "spender",
        type: "address"
      },
      {
        name: "addedValue",
        type: "uint256"
      }
    ],
    name: "increaseAllowance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "tokenId",
            type: "uint256"
          },
          {
            name: "amount0Desired",
            type: "uint256"
          },
          {
            name: "amount1Desired",
            type: "uint256"
          },
          {
            name: "amount0Min",
            type: "uint256"
          },
          {
            name: "amount1Min",
            type: "uint256"
          },
          {
            name: "deadline",
            type: "uint256"
          }
        ],
        name: "params",
        type: "tuple"
      }
    ],
    name: "increaseLiquidity",
    outputs: [
      {
        name: "liquidity",
        type: "uint128"
      },
      {
        name: "amount0",
        type: "uint256"
      },
      {
        name: "amount1",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "token0",
            type: "address"
          },
          {
            internalType: "address",
            name: "token1",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "amount0Min",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "amount1Min",
            type: "uint256"
          }
        ],
        internalType: "struct IApproveAndCall.IncreaseLiquidityParams",
        name: "params",
        type: "tuple"
      }
    ],
    name: "increaseLiquidity",
    outputs: [
      {
        internalType: "bytes",
        name: "result",
        type: "bytes"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "incrementCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "newCounter",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "incrementHashNonce",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "incrementNonce",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address"
      }
    ],
    name: "incrementNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IComptroller",
        name: "comptroller_",
        type: "address"
      },
      {
        internalType: "contract IInterestRateModel",
        name: "interestRateModel_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "initialExchangeRateMantissa_",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "name_",
        type: "string"
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string"
      },
      {
        internalType: "uint8",
        name: "decimals_",
        type: "uint8"
      }
    ],
    name: "init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "address",
        name: "aTokenAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "stableDebtAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "variableDebtAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "interestRateStrategyAddress",
        type: "address"
      }
    ],
    name: "initReserve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "token0",
        type: "address"
      },
      {
        name: "token1",
        type: "address"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_validatorContract",
        type: "address"
      },
      {
        name: "_erc20token",
        type: "address"
      },
      {
        name: "_requiredBlockConfirmations",
        type: "uint256"
      },
      {
        name: "_gasPrice",
        type: "uint256"
      },
      {
        name: "_dailyLimitMaxPerTxMinPerTxArray",
        type: "uint256[3]"
      },
      {
        name: "_homeDailyLimitHomeMaxPerTxArray",
        type: "uint256[2]"
      },
      {
        name: "_owner",
        type: "address"
      },
      {
        name: "_decimalShift",
        type: "int256"
      },
      {
        name: "_bridgeOnOtherSide",
        type: "address"
      }
    ],
    name: "initialize",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "provider",
        type: "address"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "initializationParameters",
        type: "bytes"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_roleSetter",
        type: "address"
      },
      {
        internalType: "contract IWETH",
        name: "_wrappedToken",
        type: "address"
      },
      {
        internalType: "contract IWeightedValidator",
        name: "_validatorContract",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_roninChainId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_numerator",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_highTierVWNumerator",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_denominator",
        type: "uint256"
      },
      {
        internalType: "address[][3]",
        name: "_addresses",
        type: "address[][3]"
      },
      {
        internalType: "uint256[][4]",
        name: "_thresholds",
        type: "uint256[][4]"
      },
      {
        internalType: "enum Token.Standard[]",
        name: "_standards",
        type: "uint8[]"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_contractName",
        type: "string"
      },
      {
        internalType: "string",
        name: "_contractSymbol",
        type: "string"
      },
      {
        internalType: "address",
        name: "_initialOwner",
        type: "address"
      },
      {
        internalType: "address payable",
        name: "_fundsRecipient",
        type: "address"
      },
      {
        internalType: "uint64",
        name: "_editionSize",
        type: "uint64"
      },
      {
        internalType: "uint16",
        name: "_royaltyBPS",
        type: "uint16"
      },
      {
        components: [
          {
            internalType: "uint104",
            name: "publicSalePrice",
            type: "uint104"
          },
          {
            internalType: "uint32",
            name: "maxSalePurchasePerAddress",
            type: "uint32"
          },
          {
            internalType: "uint64",
            name: "publicSaleStart",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "publicSaleEnd",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "presaleStart",
            type: "uint64"
          },
          {
            internalType: "uint64",
            name: "presaleEnd",
            type: "uint64"
          },
          {
            internalType: "bytes32",
            name: "presaleMerkleRoot",
            type: "bytes32"
          }
        ],
        internalType: "struct IERC721Drop.SalesConfiguration",
        name: "_salesConfig",
        type: "tuple"
      },
      {
        internalType: "contract IMetadataRenderer",
        name: "_metadataRenderer",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "_metadataRendererInit",
        type: "bytes"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IExecutionDelegate",
        name: "_executionDelegate",
        type: "address"
      },
      {
        internalType: "contract IPolicyManager",
        name: "_policyManager",
        type: "address"
      },
      {
        internalType: "address",
        name: "_oracle",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_blockRange",
        type: "uint256"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "underlying_",
        type: "address"
      },
      {
        internalType: "contract IComptroller",
        name: "comptroller_",
        type: "address"
      },
      {
        internalType: "contract IInterestRateModel",
        name: "interestRateModel_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "initialExchangeRateMantissa_",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "name_",
        type: "string"
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string"
      },
      {
        internalType: "uint8",
        name: "decimals_",
        type: "uint8"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_token",
        type: "address"
      },
      {
        name: "_minCashThreshold",
        type: "uint256"
      },
      {
        name: "_minInterestPaid",
        type: "uint256"
      },
      {
        name: "_interestReceiver",
        type: "address"
      }
    ],
    name: "initializeInterest",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "orderUid",
        type: "bytes"
      }
    ],
    name: "invalidateOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_token",
        type: "address"
      }
    ],
    name: "invest",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "investDai",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !0,
    inputs: [
      {
        name: "transactionId",
        type: "uint256"
      }
    ],
    name: "isConfirmed",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    constant: !0,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "isOwner",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        name: "poolId",
        type: "bytes32"
      },
      {
        name: "sender",
        type: "address"
      },
      {
        name: "recipient",
        type: "address"
      },
      {
        components: [
          {
            name: "assets",
            type: "address[]"
          },
          {
            name: "maxAmountsIn",
            type: "uint256[]"
          },
          {
            name: "userData",
            type: "bytes"
          },
          {
            name: "fromInternalBalance",
            type: "bool"
          }
        ],
        name: "request",
        type: "tuple"
      }
    ],
    name: "joinPool",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "killContract",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !0,
    inputs: [],
    name: "lastDay",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "borrower",
        type: "address"
      },
      {
        name: "cTokenCollateral",
        type: "address"
      }
    ],
    name: "liquidateBorrow",
    outputs: [],
    payable: !0,
    stateMutability: "payable",
    type: "function",
    signature: "0xaae40a2a"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256"
      },
      {
        internalType: "contract IPToken",
        name: "cTokenCollateral",
        type: "address"
      }
    ],
    name: "liquidateBorrow",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "collateralAsset",
        type: "address"
      },
      {
        internalType: "address",
        name: "debtAsset",
        type: "address"
      },
      {
        internalType: "address",
        name: "user",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "debtToCover",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "receiveAToken",
        type: "bool"
      }
    ],
    name: "liquidationCall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "args1",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "args2",
        type: "bytes32"
      }
    ],
    name: "liquidationCall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "lock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "enable",
        type: "bool"
      }
    ],
    name: "manageMarketFilterDAOSubscription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "kind",
            type: "uint8"
          },
          {
            name: "poolId",
            type: "bytes32"
          },
          {
            name: "token",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          }
        ],
        name: "ops",
        type: "tuple[]"
      }
    ],
    name: "managePoolBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "manualMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_mainchainTokens",
        type: "address[]"
      },
      {
        internalType: "address[]",
        name: "_roninTokens",
        type: "address[]"
      },
      {
        internalType: "enum Token.Standard[]",
        name: "_standards",
        type: "uint8[]"
      }
    ],
    name: "mapTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_mainchainTokens",
        type: "address[]"
      },
      {
        internalType: "address[]",
        name: "_roninTokens",
        type: "address[]"
      },
      {
        internalType: "enum Token.Standard[]",
        name: "_standards",
        type: "uint8[]"
      },
      {
        internalType: "uint256[][4]",
        name: "_thresholds",
        type: "uint256[][4]"
      }
    ],
    name: "mapTokensAndThresholds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "offerer",
                type: "address"
              },
              {
                internalType: "address",
                name: "zone",
                type: "address"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  }
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address"
                  }
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]"
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "startTime",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "endTime",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "zoneHash",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "salt",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "conduitKey",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256"
              }
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple"
          },
          {
            internalType: "uint120",
            name: "numerator",
            type: "uint120"
          },
          {
            internalType: "uint120",
            name: "denominator",
            type: "uint120"
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
          },
          {
            internalType: "bytes",
            name: "extraData",
            type: "bytes"
          }
        ],
        internalType: "struct AdvancedOrder[]",
        name: "advancedOrders",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "orderIndex",
            type: "uint256"
          },
          {
            internalType: "enum Side",
            name: "side",
            type: "uint8"
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "identifier",
            type: "uint256"
          },
          {
            internalType: "bytes32[]",
            name: "criteriaProof",
            type: "bytes32[]"
          }
        ],
        internalType: "struct CriteriaResolver[]",
        name: "criteriaResolvers",
        type: "tuple[]"
      },
      {
        components: [
          {
            components: [
              {
                internalType: "uint256",
                name: "orderIndex",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "itemIndex",
                type: "uint256"
              }
            ],
            internalType: "struct FulfillmentComponent[]",
            name: "offerComponents",
            type: "tuple[]"
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "orderIndex",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "itemIndex",
                type: "uint256"
              }
            ],
            internalType: "struct FulfillmentComponent[]",
            name: "considerationComponents",
            type: "tuple[]"
          }
        ],
        internalType: "struct Fulfillment[]",
        name: "fulfillments",
        type: "tuple[]"
      }
    ],
    name: "matchAdvancedOrders",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8"
              },
              {
                internalType: "address",
                name: "token",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "identifier",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address"
              }
            ],
            internalType: "struct ReceivedItem",
            name: "item",
            type: "tuple"
          },
          {
            internalType: "address",
            name: "offerer",
            type: "address"
          },
          {
            internalType: "bytes32",
            name: "conduitKey",
            type: "bytes32"
          }
        ],
        internalType: "struct Execution[]",
        name: "executions",
        type: "tuple[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "enum LibNFTOrder.TradeDirection",
            name: "direction",
            type: "uint8"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20TokenV06",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "contract IERC721Token",
            name: "erc721Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc721TokenId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "erc721TokenProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.ERC721Order",
        name: "sellOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibNFTOrder.TradeDirection",
            name: "direction",
            type: "uint8"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20TokenV06",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "contract IERC721Token",
            name: "erc721Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc721TokenId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "erc721TokenProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.ERC721Order",
        name: "buyOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "sellOrderSignature",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "buyOrderSignature",
        type: "tuple"
      }
    ],
    name: "matchERC721Orders",
    outputs: [
      {
        internalType: "uint256",
        name: "profit",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          }
        ],
        internalType: "struct LibNFTOrder.NFTSellOrder",
        name: "sellOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "nftProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.NFTBuyOrder",
        name: "buyOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "sellOrderSignature",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "buyOrderSignature",
        type: "tuple"
      }
    ],
    name: "matchERC721Orders",
    outputs: [
      {
        internalType: "uint256",
        name: "profit",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "offerer",
                type: "address"
              },
              {
                internalType: "address",
                name: "zone",
                type: "address"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  }
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address"
                  }
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]"
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "startTime",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "endTime",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "zoneHash",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "salt",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "conduitKey",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256"
              }
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple"
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
          }
        ],
        internalType: "struct Order[]",
        name: "orders",
        type: "tuple[]"
      },
      {
        components: [
          {
            components: [
              {
                internalType: "uint256",
                name: "orderIndex",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "itemIndex",
                type: "uint256"
              }
            ],
            internalType: "struct FulfillmentComponent[]",
            name: "offerComponents",
            type: "tuple[]"
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "orderIndex",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "itemIndex",
                type: "uint256"
              }
            ],
            internalType: "struct FulfillmentComponent[]",
            name: "considerationComponents",
            type: "tuple[]"
          }
        ],
        internalType: "struct Fulfillment[]",
        name: "fulfillments",
        type: "tuple[]"
      }
    ],
    name: "matchOrders",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "enum ItemType",
                name: "itemType",
                type: "uint8"
              },
              {
                internalType: "address",
                name: "token",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "identifier",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address"
              }
            ],
            internalType: "struct ReceivedItem",
            name: "item",
            type: "tuple"
          },
          {
            internalType: "address",
            name: "offerer",
            type: "address"
          },
          {
            internalType: "bytes32",
            name: "conduitKey",
            type: "bytes32"
          }
        ],
        internalType: "struct Execution[]",
        name: "executions",
        type: "tuple[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "stableBridgingFee",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "externalID",
            type: "bytes32"
          },
          {
            internalType: "address",
            name: "tokenReal",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "chainID",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "address[]",
            name: "swapTokens",
            type: "address[]"
          },
          {
            internalType: "address",
            name: "secondDexRouter",
            type: "address"
          },
          {
            internalType: "bytes",
            name: "secondSwapCalldata",
            type: "bytes"
          },
          {
            internalType: "address",
            name: "finalReceiveSide",
            type: "address"
          },
          {
            internalType: "bytes",
            name: "finalCalldata",
            type: "bytes"
          },
          {
            internalType: "uint256",
            name: "finalOffset",
            type: "uint256"
          }
        ],
        internalType: "struct MetaRouteStructs.MetaMintTransaction",
        name: "_metaMintTransaction",
        type: "tuple"
      }
    ],
    name: "metaMintSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "firstSwapCalldata",
            type: "bytes"
          },
          {
            internalType: "bytes",
            name: "secondSwapCalldata",
            type: "bytes"
          },
          {
            internalType: "address[]",
            name: "approvedTokens",
            type: "address[]"
          },
          {
            internalType: "address",
            name: "firstDexRouter",
            type: "address"
          },
          {
            internalType: "address",
            name: "secondDexRouter",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          },
          {
            internalType: "bool",
            name: "nativeIn",
            type: "bool"
          },
          {
            internalType: "address",
            name: "relayRecipient",
            type: "address"
          },
          {
            internalType: "bytes",
            name: "otherSideCalldata",
            type: "bytes"
          }
        ],
        internalType: "struct MetaRouteStructs.MetaRouteTransaction",
        name: "_metarouteTransaction",
        type: "tuple"
      }
    ],
    name: "metaRoute",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "migrate",
    outputs: [
      {
        internalType: "bytes4",
        name: "success",
        type: "bytes4"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_interestReceiver",
        type: "address"
      }
    ],
    name: "migrateTo_6_1_0",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "to",
        type: "address"
      }
    ],
    name: "mint",
    outputs: [
      {
        name: "liquidity",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "dst",
        type: "address"
      },
      {
        name: "rawAmount",
        type: "uint256"
      }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "token0",
            type: "address"
          },
          {
            name: "token1",
            type: "address"
          },
          {
            name: "fee",
            type: "uint24"
          },
          {
            name: "tickLower",
            type: "int24"
          },
          {
            name: "tickUpper",
            type: "int24"
          },
          {
            name: "amount0Desired",
            type: "uint256"
          },
          {
            name: "amount1Desired",
            type: "uint256"
          },
          {
            name: "amount0Min",
            type: "uint256"
          },
          {
            name: "amount1Min",
            type: "uint256"
          },
          {
            name: "recipient",
            type: "address"
          },
          {
            name: "deadline",
            type: "uint256"
          }
        ],
        name: "params",
        type: "tuple"
      }
    ],
    name: "mint",
    outputs: [
      {
        name: "tokenId",
        type: "uint256"
      },
      {
        name: "liquidity",
        type: "uint128"
      },
      {
        name: "amount0",
        type: "uint256"
      },
      {
        name: "amount1",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "token0",
            type: "address"
          },
          {
            internalType: "address",
            name: "token1",
            type: "address"
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24"
          },
          {
            internalType: "int24",
            name: "tickLower",
            type: "int24"
          },
          {
            internalType: "int24",
            name: "tickUpper",
            type: "int24"
          },
          {
            internalType: "uint256",
            name: "amount0Min",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "amount1Min",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address"
          }
        ],
        internalType: "struct IApproveAndCall.MintParams",
        name: "params",
        type: "tuple"
      }
    ],
    name: "mint",
    outputs: [
      {
        internalType: "bytes",
        name: "result",
        type: "bytes"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "mint",
    outputs: [],
    payable: !0,
    stateMutability: "payable",
    type: "function",
    signature: "0x1249c58b"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "to",
        type: "address"
      },
      {
        internalType: "contract IERC20Mintable",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "kappa",
        type: "bytes32"
      }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "mintAmount",
        type: "uint256"
      }
    ],
    name: "mint",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "to",
        type: "address"
      },
      {
        internalType: "contract IERC20Mintable",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256"
      },
      {
        internalType: "contract ISwap",
        name: "pool",
        type: "address"
      },
      {
        internalType: "uint8",
        name: "tokenIndexFrom",
        type: "uint8"
      },
      {
        internalType: "uint8",
        name: "tokenIndexTo",
        type: "uint8"
      },
      {
        internalType: "uint256",
        name: "minDy",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "kappa",
        type: "bytes32"
      }
    ],
    name: "mintAndSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "mintAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "mintTokens",
        type: "uint256"
      }
    ],
    name: "mintForMigrate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "account",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      }
    ],
    name: "mintOnDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "assets",
        type: "address[]"
      }
    ],
    name: "mintToTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address"
      },
      {
        internalType: "uint16",
        name: "referralCode",
        type: "uint16"
      }
    ],
    name: "mintUnbacked",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "newFounder",
        type: "address"
      }
    ],
    name: "modifyOwnerFounder",
    outputs: [
      {
        name: "founders",
        type: "address"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address[]",
            name: "tokenAddrs",
            type: "address[]"
          },
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]"
          }
        ],
        internalType: "struct GenieSwap.ERC20Details",
        name: "erc20Details",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "address",
            name: "tokenAddr",
            type: "address"
          },
          {
            internalType: "address[]",
            name: "to",
            type: "address[]"
          },
          {
            internalType: "uint256[]",
            name: "ids",
            type: "uint256[]"
          }
        ],
        internalType: "struct SpecialTransferHelper.ERC721Details[]",
        name: "erc721Details",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "address",
            name: "tokenAddr",
            type: "address"
          },
          {
            internalType: "uint256[]",
            name: "ids",
            type: "uint256[]"
          },
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]"
          }
        ],
        internalType: "struct GenieSwap.ERC1155Details[]",
        name: "erc1155Details",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "conversionData",
            type: "bytes"
          }
        ],
        internalType: "struct GenieSwap.ConverstionDetails[]",
        name: "converstionDetails",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "marketId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "tradeData",
            type: "bytes"
          }
        ],
        internalType: "struct MarketRegistry.TradeDetails[]",
        name: "tradeDetails",
        type: "tuple[]"
      },
      {
        internalType: "address[]",
        name: "dustTokens",
        type: "address[]"
      },
      {
        internalType: "uint256[2]",
        name: "feeDetails",
        type: "uint256[2]"
      }
    ],
    name: "multiAssetSwap",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address[]",
            name: "tokenAddrs",
            type: "address[]"
          },
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]"
          }
        ],
        internalType: "struct GenieSwap.ERC20Details",
        name: "erc20Details",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "address",
            name: "tokenAddr",
            type: "address"
          },
          {
            internalType: "address[]",
            name: "to",
            type: "address[]"
          },
          {
            internalType: "uint256[]",
            name: "ids",
            type: "uint256[]"
          }
        ],
        internalType: "struct SpecialTransferHelper.ERC721Details[]",
        name: "erc721Details",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "address",
            name: "tokenAddr",
            type: "address"
          },
          {
            internalType: "uint256[]",
            name: "ids",
            type: "uint256[]"
          },
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]"
          }
        ],
        internalType: "struct GenieSwap.ERC1155Details[]",
        name: "erc1155Details",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "conversionData",
            type: "bytes"
          }
        ],
        internalType: "struct GenieSwap.ConverstionDetails[]",
        name: "converstionDetails",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "marketId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "tradeData",
            type: "bytes"
          }
        ],
        internalType: "struct MarketRegistry.TradeDetails[]",
        name: "tradeDetails",
        type: "tuple[]"
      },
      {
        internalType: "address[]",
        name: "dustTokens",
        type: "address[]"
      },
      {
        internalType: "uint256",
        name: "sponsoredMarketIndex",
        type: "uint256"
      }
    ],
    name: "multiAssetSwapWithoutFee",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "data",
        type: "bytes[]"
      }
    ],
    name: "multicall",
    outputs: [
      {
        name: "results",
        type: "bytes[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "previousBlockhash",
        type: "bytes32"
      },
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]"
      }
    ],
    name: "multicall",
    outputs: [
      {
        internalType: "bytes[]",
        name: "",
        type: "bytes[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]"
      }
    ],
    name: "multicall",
    outputs: [
      {
        internalType: "bytes[]",
        name: "",
        type: "bytes[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "reward",
        type: "uint256"
      }
    ],
    name: "notifyRewardAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]"
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    name: "onERC1155BatchReceived",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    name: "onERC1155Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "open",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !0,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "owners",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "from",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "variant",
        type: "uint8"
      }
    ],
    name: "pairTransferERC20From",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "nft",
        type: "address"
      },
      {
        name: "from",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "id",
        type: "uint256"
      },
      {
        name: "variant",
        type: "uint8"
      }
    ],
    name: "pairTransferNFTFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_token",
        type: "address"
      }
    ],
    name: "payInterest",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint32",
            name: "blockNumber",
            type: "uint32"
          },
          {
            internalType: "uint64",
            name: "priorityOperations",
            type: "uint64"
          },
          {
            internalType: "bytes32",
            name: "pendingOnchainOperationsHash",
            type: "bytes32"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "stateHash",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "commitment",
            type: "bytes32"
          }
        ],
        internalType: "struct Storage.StoredBlockInfo",
        name: "_storedBlockInfo",
        type: "tuple"
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address"
      },
      {
        internalType: "uint32",
        name: "_accountId",
        type: "uint32"
      },
      {
        internalType: "uint32",
        name: "_tokenId",
        type: "uint32"
      },
      {
        internalType: "uint128",
        name: "_amount",
        type: "uint128"
      },
      {
        internalType: "uint32",
        name: "_nftCreatorAccountId",
        type: "uint32"
      },
      {
        internalType: "address",
        name: "_nftCreatorAddress",
        type: "address"
      },
      {
        internalType: "uint32",
        name: "_nftSerialId",
        type: "uint32"
      },
      {
        internalType: "bytes32",
        name: "_nftContentHash",
        type: "bytes32"
      },
      {
        internalType: "uint256[]",
        name: "_proof",
        type: "uint256[]"
      }
    ],
    name: "performExodus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "owner",
        type: "address"
      },
      {
        name: "spender",
        type: "address"
      },
      {
        name: "value",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "v",
        type: "uint8"
      },
      {
        name: "r",
        type: "bytes32"
      },
      {
        name: "s",
        type: "bytes32"
      }
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "pledge",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "nftProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.NFTBuyOrder",
        name: "order",
        type: "tuple"
      }
    ],
    name: "preSignERC721BuyOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "enum LibNFTOrder.TradeDirection",
            name: "direction",
            type: "uint8"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20TokenV06",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "contract IERC721Token",
            name: "erc721Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc721TokenId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "erc721TokenProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.ERC721Order",
        name: "order",
        type: "tuple"
      }
    ],
    name: "preSignERC721Order",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          }
        ],
        internalType: "struct LibNFTOrder.NFTSellOrder",
        name: "order",
        type: "tuple"
      }
    ],
    name: "preSignERC721SellOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint32",
            name: "blockNumber",
            type: "uint32"
          },
          {
            internalType: "uint64",
            name: "priorityOperations",
            type: "uint64"
          },
          {
            internalType: "bytes32",
            name: "pendingOnchainOperationsHash",
            type: "bytes32"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "stateHash",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "commitment",
            type: "bytes32"
          }
        ],
        internalType: "struct Storage.StoredBlockInfo[]",
        name: "_committedBlocks",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "uint256[]",
            name: "recursiveInput",
            type: "uint256[]"
          },
          {
            internalType: "uint256[]",
            name: "proof",
            type: "uint256[]"
          },
          {
            internalType: "uint256[]",
            name: "commitments",
            type: "uint256[]"
          },
          {
            internalType: "uint8[]",
            name: "vkIndexes",
            type: "uint8[]"
          },
          {
            internalType: "uint256[16]",
            name: "subproofsLimbs",
            type: "uint256[16]"
          }
        ],
        internalType: "struct ZkSync.ProofInput",
        name: "_proof",
        type: "tuple"
      }
    ],
    name: "proveBlocks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "pull",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256"
      }
    ],
    name: "purchase",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maxQuantity",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "pricePerToken",
        type: "uint256"
      },
      {
        internalType: "bytes32[]",
        name: "merkleProof",
        type: "bytes32[]"
      }
    ],
    name: "purchasePresale",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "args",
        type: "bytes32"
      }
    ],
    name: "rebalanceStableBorrowRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "address",
        name: "user",
        type: "address"
      }
    ],
    name: "rebalanceStableBorrowRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "receiveEther",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "reclaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256"
      },
      {
        internalType: "contract ERC20Burnable",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "redeem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "redeemTokens",
        type: "uint256"
      }
    ],
    name: "redeem",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256"
      },
      {
        internalType: "contract ERC20Burnable",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "swapTokenIndex",
        type: "uint8"
      },
      {
        internalType: "uint256",
        name: "swapMinAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "swapDeadline",
        type: "uint256"
      }
    ],
    name: "redeemAndRemove",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256"
      },
      {
        internalType: "contract ERC20Burnable",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "tokenIndexFrom",
        type: "uint8"
      },
      {
        internalType: "uint8",
        name: "tokenIndexTo",
        type: "uint8"
      },
      {
        internalType: "uint256",
        name: "minDy",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "redeemAndSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address"
      }
    ],
    name: "redeemToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "reserve",
        type: "address"
      },
      {
        name: "user",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "aTokenBalanceAfterRedeem",
        type: "uint256"
      }
    ],
    name: "redeemUnderlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "redeemAmount",
        type: "uint256"
      }
    ],
    name: "redeemUnderlying",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "to",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256"
      },
      {
        internalType: "contract ERC20Burnable",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "redeemV2",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "refundETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string"
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "tokenURI",
            type: "string"
          },
          {
            internalType: "address",
            name: "owner",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          }
        ],
        internalType: "struct LibWeb3Domain.Order",
        name: "order",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes"
      }
    ],
    name: "register",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "duration",
        type: "uint256"
      }
    ],
    name: "register",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "duration",
        type: "uint256"
      }
    ],
    name: "registerOnly",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_receiver",
        type: "address"
      },
      {
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "relayTokens",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "relief",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address"
      }
    ],
    name: "removeAccess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "address",
        name: "controller",
        type: "address"
      }
    ],
    name: "removeController",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "min_eth",
        type: "uint256"
      },
      {
        name: "min_tokens",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "removeLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokenA",
        type: "address"
      },
      {
        name: "tokenB",
        type: "address"
      },
      {
        name: "liquidity",
        type: "uint256"
      },
      {
        name: "amountAMin",
        type: "uint256"
      },
      {
        name: "amountBMin",
        type: "uint256"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "removeLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "liquidity",
        type: "uint256"
      },
      {
        name: "amountTokenMin",
        type: "uint256"
      },
      {
        name: "amountETHMin",
        type: "uint256"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "removeLiquidityETH",
    outputs: [
      {
        name: "amountToken",
        type: "uint256"
      },
      {
        name: "amountETH",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "liquidity",
        type: "uint256"
      },
      {
        name: "amountTokenMin",
        type: "uint256"
      },
      {
        name: "amountETHMin",
        type: "uint256"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "removeLiquidityETHSupportingFeeOnTransferTokens",
    outputs: [
      {
        name: "amountETH",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "liquidity",
        type: "uint256"
      },
      {
        name: "amountTokenMin",
        type: "uint256"
      },
      {
        name: "amountETHMin",
        type: "uint256"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "approveMax",
        type: "bool"
      },
      {
        name: "v",
        type: "uint8"
      },
      {
        name: "r",
        type: "bytes32"
      },
      {
        name: "s",
        type: "bytes32"
      }
    ],
    name: "removeLiquidityETHWithPermit",
    outputs: [
      {
        name: "amountToken",
        type: "uint256"
      },
      {
        name: "amountETH",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "liquidity",
        type: "uint256"
      },
      {
        name: "amountTokenMin",
        type: "uint256"
      },
      {
        name: "amountETHMin",
        type: "uint256"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "approveMax",
        type: "bool"
      },
      {
        name: "v",
        type: "uint8"
      },
      {
        name: "r",
        type: "bytes32"
      },
      {
        name: "s",
        type: "bytes32"
      }
    ],
    name: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
    outputs: [
      {
        name: "amountETH",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokenA",
        type: "address"
      },
      {
        name: "tokenB",
        type: "address"
      },
      {
        name: "liquidity",
        type: "uint256"
      },
      {
        name: "amountAMin",
        type: "uint256"
      },
      {
        name: "amountBMin",
        type: "uint256"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "approveMax",
        type: "bool"
      },
      {
        name: "v",
        type: "uint8"
      },
      {
        name: "r",
        type: "bytes32"
      },
      {
        name: "s",
        type: "bytes32"
      }
    ],
    name: "removeLiquidityWithPermit",
    outputs: [
      {
        name: "amountA",
        type: "uint256"
      },
      {
        name: "amountB",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_mm",
        type: "address"
      }
    ],
    name: "removeMMInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "owner",
        type: "address"
      }
    ],
    name: "removeOwner",
    outputs: [],
    payable: !1,
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "name",
        type: "string"
      },
      {
        name: "duration",
        type: "uint256"
      }
    ],
    name: "renew",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "duration",
        type: "uint256"
      }
    ],
    name: "renew",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_reserve",
        type: "address"
      },
      {
        name: "_amount",
        type: "uint256"
      },
      {
        name: "_onBehalfOf",
        type: "address"
      }
    ],
    name: "repay",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "args",
        type: "bytes32"
      }
    ],
    name: "repay",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "interestRateMode",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address"
      }
    ],
    name: "repay",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "repayBorrow",
    outputs: [],
    payable: !0,
    stateMutability: "payable",
    type: "function",
    signature: "0x4e4d9fea"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256"
      }
    ],
    name: "repayBorrow",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "borrower",
        type: "address"
      }
    ],
    name: "repayBorrowBehalf",
    outputs: [],
    payable: !0,
    stateMutability: "payable",
    type: "function",
    signature: "0xe5974619"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256"
      }
    ],
    name: "repayBorrowBehalf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "lendingPool",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "rateMode",
        type: "uint256"
      },
      {
        name: "onBehalfOf",
        type: "address"
      }
    ],
    name: "repayETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "interestRateMode",
        type: "uint256"
      }
    ],
    name: "repayWithATokens",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "args",
        type: "bytes32"
      }
    ],
    name: "repayWithATokens",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "args",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "repayWithPermit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "interestRateMode",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "permitV",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "permitR",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "permitS",
        type: "bytes32"
      }
    ],
    name: "repayWithPermit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "owner",
        type: "address"
      },
      {
        name: "newOwner",
        type: "address"
      }
    ],
    name: "replaceOwner",
    outputs: [],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "recipientAddr",
            type: "address"
          },
          {
            internalType: "address",
            name: "tokenAddr",
            type: "address"
          },
          {
            components: [
              {
                internalType: "enum Token.Standard",
                name: "erc",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "id",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "quantity",
                type: "uint256"
              }
            ],
            internalType: "struct Token.Info",
            name: "info",
            type: "tuple"
          }
        ],
        internalType: "struct Transfer.Request",
        name: "_request",
        type: "tuple"
      }
    ],
    name: "requestDepositFor",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_accountId",
        type: "uint32"
      },
      {
        internalType: "address",
        name: "_token",
        type: "address"
      }
    ],
    name: "requestFullExit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_accountId",
        type: "uint32"
      },
      {
        internalType: "uint32",
        name: "_tokenId",
        type: "uint32"
      }
    ],
    name: "requestFullExitNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "requestNewRound",
    outputs: [
      {
        internalType: "uint80",
        name: "",
        type: "uint80"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !0,
    inputs: [],
    name: "required",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]"
      },
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      }
    ],
    name: "rescueERC1155",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      }
    ],
    name: "rescueERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      }
    ],
    name: "rescueERC721",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      }
    ],
    name: "rescueETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "rescueFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "rescueTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      }
    ],
    name: "resetIsolationModeTotalDebt",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint32",
            name: "blockNumber",
            type: "uint32"
          },
          {
            internalType: "uint64",
            name: "priorityOperations",
            type: "uint64"
          },
          {
            internalType: "bytes32",
            name: "pendingOnchainOperationsHash",
            type: "bytes32"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "bytes32",
            name: "stateHash",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "commitment",
            type: "bytes32"
          }
        ],
        internalType: "struct Storage.StoredBlockInfo[]",
        name: "_blocksToRevert",
        type: "tuple[]"
      }
    ],
    name: "revertBlocks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "transactionId",
        type: "uint256"
      }
    ],
    name: "revokeConfirmation",
    outputs: [],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "numItems",
                type: "uint256"
              }
            ],
            name: "swapInfo",
            type: "tuple"
          },
          {
            name: "maxCost",
            type: "uint256"
          }
        ],
        name: "swapList",
        type: "tuple[]"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "robustSwapERC20ForAnyNFTs",
    outputs: [
      {
        name: "remainingValue",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "nftIds",
                type: "uint256[]"
              }
            ],
            name: "swapInfo",
            type: "tuple"
          },
          {
            name: "maxCost",
            type: "uint256"
          }
        ],
        name: "swapList",
        type: "tuple[]"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "robustSwapERC20ForSpecificNFTs",
    outputs: [
      {
        name: "remainingValue",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    name: "pair",
                    type: "address"
                  },
                  {
                    name: "nftIds",
                    type: "uint256[]"
                  }
                ],
                name: "swapInfo",
                type: "tuple"
              },
              {
                name: "maxCost",
                type: "uint256"
              }
            ],
            name: "tokenToNFTTrades",
            type: "tuple[]"
          },
          {
            components: [
              {
                components: [
                  {
                    name: "pair",
                    type: "address"
                  },
                  {
                    name: "nftIds",
                    type: "uint256[]"
                  }
                ],
                name: "swapInfo",
                type: "tuple"
              },
              {
                name: "minOutput",
                type: "uint256"
              }
            ],
            name: "nftToTokenTrades",
            type: "tuple[]"
          },
          {
            name: "inputAmount",
            type: "uint256"
          },
          {
            name: "tokenRecipient",
            type: "address"
          },
          {
            name: "nftRecipient",
            type: "address"
          }
        ],
        name: "params",
        type: "tuple"
      }
    ],
    name: "robustSwapERC20ForSpecificNFTsAndNFTsToToken",
    outputs: [
      {
        name: "remainingValue",
        type: "uint256"
      },
      {
        name: "outputAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "numItems",
                type: "uint256"
              }
            ],
            name: "swapInfo",
            type: "tuple"
          },
          {
            name: "maxCost",
            type: "uint256"
          }
        ],
        name: "swapList",
        type: "tuple[]"
      },
      {
        name: "ethRecipient",
        type: "address"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "robustSwapETHForAnyNFTs",
    outputs: [
      {
        name: "remainingValue",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "nftIds",
                type: "uint256[]"
              }
            ],
            name: "swapInfo",
            type: "tuple"
          },
          {
            name: "maxCost",
            type: "uint256"
          }
        ],
        name: "swapList",
        type: "tuple[]"
      },
      {
        name: "ethRecipient",
        type: "address"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "robustSwapETHForSpecificNFTs",
    outputs: [
      {
        name: "remainingValue",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    name: "pair",
                    type: "address"
                  },
                  {
                    name: "nftIds",
                    type: "uint256[]"
                  }
                ],
                name: "swapInfo",
                type: "tuple"
              },
              {
                name: "maxCost",
                type: "uint256"
              }
            ],
            name: "tokenToNFTTrades",
            type: "tuple[]"
          },
          {
            components: [
              {
                components: [
                  {
                    name: "pair",
                    type: "address"
                  },
                  {
                    name: "nftIds",
                    type: "uint256[]"
                  }
                ],
                name: "swapInfo",
                type: "tuple"
              },
              {
                name: "minOutput",
                type: "uint256"
              }
            ],
            name: "nftToTokenTrades",
            type: "tuple[]"
          },
          {
            name: "inputAmount",
            type: "uint256"
          },
          {
            name: "tokenRecipient",
            type: "address"
          },
          {
            name: "nftRecipient",
            type: "address"
          }
        ],
        name: "params",
        type: "tuple"
      }
    ],
    name: "robustSwapETHForSpecificNFTsAndNFTsToToken",
    outputs: [
      {
        name: "remainingValue",
        type: "uint256"
      },
      {
        name: "outputAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "nftIds",
                type: "uint256[]"
              }
            ],
            name: "swapInfo",
            type: "tuple"
          },
          {
            name: "minOutput",
            type: "uint256"
          }
        ],
        name: "swapList",
        type: "tuple[]"
      },
      {
        name: "tokenRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "robustSwapNFTsForToken",
    outputs: [
      {
        name: "outputAmount",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "spender",
        type: "address"
      },
      {
        name: "value",
        type: "uint256"
      }
    ],
    name: "safeApprove",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "from",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "ids",
        type: "uint256[]"
      },
      {
        name: "amounts",
        type: "uint256[]"
      },
      {
        name: "data",
        type: "bytes"
      }
    ],
    name: "safeBatchTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "value",
        type: "uint256"
      }
    ],
    name: "safeTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "from",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "amountOrTokenId",
        type: "uint256"
      }
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "from",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "amountOrTokenId",
        type: "uint256"
      }
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "from",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "tokenId",
        type: "uint256"
      },
      {
        name: "data",
        type: "bytes"
      }
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "from",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "id",
        type: "uint256"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "data",
        type: "bytes"
      }
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "liquidator",
        type: "address"
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "seizeTokens",
        type: "uint256"
      }
    ],
    name: "seize",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "value",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "v",
        type: "uint8"
      },
      {
        name: "r",
        type: "bytes32"
      },
      {
        name: "s",
        type: "bytes32"
      }
    ],
    name: "selfPermit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "nonce",
        type: "uint256"
      },
      {
        name: "expiry",
        type: "uint256"
      },
      {
        name: "v",
        type: "uint8"
      },
      {
        name: "r",
        type: "bytes32"
      },
      {
        name: "s",
        type: "bytes32"
      }
    ],
    name: "selfPermitAllowed",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "selfPermitAllowedIfNecessary",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "selfPermitIfNecessary",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "enum LibNFTOrder.TradeDirection",
            name: "direction",
            type: "uint8"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20TokenV06",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "contract IERC721Token",
            name: "erc721Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc721TokenId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "erc721TokenProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.ERC721Order",
        name: "buyOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "signature",
        type: "tuple"
      },
      {
        internalType: "uint256",
        name: "erc721TokenId",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "unwrapNativeToken",
        type: "bool"
      },
      {
        internalType: "bytes",
        name: "callbackData",
        type: "bytes"
      }
    ],
    name: "sellERC721",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "taker",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "expiry",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "contract IERC20",
            name: "erc20Token",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "erc20TokenAmount",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
              },
              {
                internalType: "bytes",
                name: "feeData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Fee[]",
            name: "fees",
            type: "tuple[]"
          },
          {
            internalType: "address",
            name: "nft",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "nftId",
            type: "uint256"
          },
          {
            components: [
              {
                internalType: "contract IPropertyValidator",
                name: "propertyValidator",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "propertyData",
                type: "bytes"
              }
            ],
            internalType: "struct LibNFTOrder.Property[]",
            name: "nftProperties",
            type: "tuple[]"
          }
        ],
        internalType: "struct LibNFTOrder.NFTBuyOrder",
        name: "buyOrder",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "enum LibSignature.SignatureType",
            name: "signatureType",
            type: "uint8"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct LibSignature.Signature",
        name: "signature",
        type: "tuple"
      },
      {
        internalType: "uint256",
        name: "erc721TokenId",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "unwrapNativeToken",
        type: "bool"
      },
      {
        internalType: "bytes",
        name: "callbackData",
        type: "bytes"
      }
    ],
    name: "sellERC721",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "outputToken",
        type: "address"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "outputAmount",
        type: "uint256"
      },
      {
        name: "goodUntil",
        type: "uint256"
      },
      {
        name: "destinationAddress",
        type: "address"
      },
      {
        components: [
          {
            name: "v",
            type: "uint8"
          },
          {
            name: "r",
            type: "bytes32"
          },
          {
            name: "s",
            type: "bytes32"
          }
        ],
        name: "theSignature",
        type: "tuple"
      },
      {
        name: "auxiliaryData",
        type: "bytes"
      }
    ],
    name: "sellEthForToken",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "inputToken",
        type: "address"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "outputAmount",
        type: "uint256"
      },
      {
        name: "packedGoodUntil",
        type: "uint256"
      },
      {
        name: "destinationAddress",
        type: "address"
      },
      {
        components: [
          {
            name: "v",
            type: "uint8"
          },
          {
            name: "r",
            type: "bytes32"
          },
          {
            name: "s",
            type: "bytes32"
          }
        ],
        name: "theSignature",
        type: "tuple"
      },
      {
        name: "auxiliaryData",
        type: "bytes"
      }
    ],
    name: "sellTokenForEth",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "contentType",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "setABI",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "coinType",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "a",
        type: "bytes"
      }
    ],
    name: "setAddr",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "a",
        type: "address"
      }
    ],
    name: "setAddr",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "operator",
        type: "address"
      },
      {
        name: "approved",
        type: "bool"
      }
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_pubkeyHash",
        type: "bytes"
      },
      {
        internalType: "uint32",
        name: "_nonce",
        type: "uint32"
      }
    ],
    name: "setAuthPubkeyHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        internalType: "bool",
        name: "isAuthorised",
        type: "bool"
      }
    ],
    name: "setAuthorisation",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "_newAuthority",
        type: "address"
      }
    ],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_baseFees",
        type: "uint256"
      }
    ],
    name: "setBaseFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "baseURI",
        type: "string"
      }
    ],
    name: "setBaseURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_maximumGasPrice",
        type: "uint32"
      },
      {
        internalType: "uint32",
        name: "_reasonableGasPrice",
        type: "uint32"
      },
      {
        internalType: "uint32",
        name: "_microLinkPerEth",
        type: "uint32"
      },
      {
        internalType: "uint32",
        name: "_linkGweiPerObservation",
        type: "uint32"
      },
      {
        internalType: "uint32",
        name: "_linkGweiPerTransmission",
        type: "uint32"
      }
    ],
    name: "setBilling",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract AccessControllerInterface",
        name: "_billingAccessController",
        type: "address"
      }
    ],
    name: "setBillingAccessController",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_blockRange",
        type: "uint256"
      }
    ],
    name: "setBlockRange",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract ICurve",
        name: "bondingCurve",
        type: "address"
      },
      {
        internalType: "bool",
        name: "isAllowed",
        type: "bool"
      }
    ],
    name: "setBondingCurveAllowed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "target",
        type: "address"
      },
      {
        internalType: "bool",
        name: "isAllowed",
        type: "bool"
      }
    ],
    name: "setCallAllowed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "setChainGasAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_signers",
        type: "address[]"
      },
      {
        internalType: "address[]",
        name: "_transmitters",
        type: "address[]"
      },
      {
        internalType: "uint8",
        name: "_threshold",
        type: "uint8"
      },
      {
        internalType: "uint64",
        name: "_encodedConfigVersion",
        type: "uint64"
      },
      {
        internalType: "bytes",
        name: "_encoded",
        type: "bytes"
      }
    ],
    name: "setConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "data",
            type: "uint256"
          }
        ],
        internalType: "struct DataTypes.ReserveConfigurationMap",
        name: "configuration",
        type: "tuple"
      }
    ],
    name: "setConfiguration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32"
      },
      {
        internalType: "bytes",
        name: "hash",
        type: "bytes"
      }
    ],
    name: "setContenthash",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "contractURI_",
        type: "string"
      }
    ],
    name: "setContractURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_converter",
        type: "address"
      }
    ],
    name: "setConverter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "setDNSRecords",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_dailyLimit",
        type: "uint256"
      }
    ],
    name: "setDailyLimit",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_tokens",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "_limits",
        type: "uint256[]"
      }
    ],
    name: "setDailyWithdrawalLimits",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_dailyLimit",
        type: "uint256"
      }
    ],
    name: "setExecutionDailyLimit",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IExecutionDelegate",
        name: "_executionDelegate",
        type: "address"
      }
    ],
    name: "setExecutionDelegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_maxPerTx",
        type: "uint256"
      }
    ],
    name: "setExecutionMaxPerTx",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_feeRate",
        type: "uint256"
      }
    ],
    name: "setFeeRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_feeRecipient",
        type: "address"
      }
    ],
    name: "setFeeRecipient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "newRecipientAddress",
        type: "address"
      }
    ],
    name: "setFundsRecipient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_l2GasDiscountDivisor",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_enqueueGasCost",
        type: "uint256"
      }
    ],
    name: "setGasParams",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_gasPrice",
        type: "uint256"
      }
    ],
    name: "setGasPrice",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_governor",
        type: "address"
      }
    ],
    name: "setGovernor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_tokens",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "_thresholds",
        type: "uint256[]"
      }
    ],
    name: "setHighTierThresholds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_numerator",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_denominator",
        type: "uint256"
      }
    ],
    name: "setHighTierVoteWeightThreshold",
    outputs: [
      {
        internalType: "uint256",
        name: "_previousNum",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_previousDenom",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_token",
        type: "address"
      },
      {
        name: "_receiver",
        type: "address"
      }
    ],
    name: "setInterestReceiver",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32"
      },
      {
        internalType: "bytes4",
        name: "interfaceID",
        type: "bytes4"
      },
      {
        internalType: "address",
        name: "implementer",
        type: "address"
      }
    ],
    name: "setInterface",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract LinkTokenInterface",
        name: "_linkToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "_recipient",
        type: "address"
      }
    ],
    name: "setLinkToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_tokens",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "_thresholds",
        type: "uint256[]"
      }
    ],
    name: "setLockedThresholds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract MarketRegistry",
        name: "_marketRegistry",
        type: "address"
      }
    ],
    name: "setMarketRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_maxPerTx",
        type: "uint256"
      }
    ],
    name: "setMaxPerTx",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_maxSignInterval",
        type: "uint256"
      }
    ],
    name: "setMaxSignInterval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_message",
        type: "string"
      }
    ],
    name: "setMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IMetadataRenderer",
        name: "newRenderer",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "setupRenderer",
        type: "bytes"
      }
    ],
    name: "setMetadataRenderer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_token",
        type: "address"
      },
      {
        name: "_minCashThreshold",
        type: "uint256"
      }
    ],
    name: "setMinCashThreshold",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_token",
        type: "address"
      },
      {
        name: "_minInterestPaid",
        type: "uint256"
      }
    ],
    name: "setMinInterestPaid",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_minPerTx",
        type: "uint256"
      }
    ],
    name: "setMinPerTx",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "minter_",
        type: "address"
      }
    ],
    name: "setMinter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string"
      }
    ],
    name: "setName",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32"
      },
      {
        internalType: "string",
        name: "name",
        type: "string"
      }
    ],
    name: "setName",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "operator",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      }
    ],
    name: "setOneTimeApproval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_openForFreeTrades",
        type: "bool"
      }
    ],
    name: "setOpenForFreeTrades",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_openForTrades",
        type: "bool"
      }
    ],
    name: "setOpenForTrades",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_oracle",
        type: "address"
      }
    ],
    name: "setOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "node",
        type: "bytes32"
      },
      {
        name: "owner",
        type: "address"
      }
    ],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_paused",
        type: "bool"
      }
    ],
    name: "setPause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_paymaster",
        type: "address"
      }
    ],
    name: "setPayMaster",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_transmitters",
        type: "address[]"
      },
      {
        internalType: "address[]",
        name: "_payees",
        type: "address[]"
      }
    ],
    name: "setPayees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IPolicyManager",
        name: "_policyManager",
        type: "address"
      }
    ],
    name: "setPolicyManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "orderUid",
        type: "bytes"
      },
      {
        internalType: "bool",
        name: "signed",
        type: "bool"
      }
    ],
    name: "setPreSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "x",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "y",
        type: "bytes32"
      }
    ],
    name: "setPubkey",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_startReleaseBlock",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_endReleaseBlock",
        type: "uint256"
      }
    ],
    name: "setReleaseBlock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract AccessControllerInterface",
        name: "_requesterAccessController",
        type: "address"
      }
    ],
    name: "setRequesterAccessController",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_blockConfirmations",
        type: "uint256"
      }
    ],
    name: "setRequiredBlockConfirmations",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "address",
        name: "rateStrategyAddress",
        type: "address"
      }
    ],
    name: "setReserveInterestRateStrategyAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "resolver",
        type: "address"
      }
    ],
    name: "setResolver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract LSSVMRouter",
        name: "_router",
        type: "address"
      },
      {
        internalType: "bool",
        name: "isAllowed",
        type: "bool"
      }
    ],
    name: "setRouterAllowed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint104",
        name: "publicSalePrice",
        type: "uint104"
      },
      {
        internalType: "uint32",
        name: "maxSalePurchasePerAddress",
        type: "uint32"
      },
      {
        internalType: "uint64",
        name: "publicSaleStart",
        type: "uint64"
      },
      {
        internalType: "uint64",
        name: "publicSaleEnd",
        type: "uint64"
      },
      {
        internalType: "uint64",
        name: "presaleStart",
        type: "uint64"
      },
      {
        internalType: "uint64",
        name: "presaleEnd",
        type: "uint64"
      },
      {
        internalType: "bytes32",
        name: "presaleMerkleRoot",
        type: "bytes32"
      }
    ],
    name: "setSaleConfiguration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_startTime",
        type: "uint256"
      }
    ],
    name: "setStartTime",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32"
      },
      {
        internalType: "string",
        name: "key",
        type: "string"
      },
      {
        internalType: "string",
        name: "value",
        type: "string"
      }
    ],
    name: "setText",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_numerator",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_denominator",
        type: "uint256"
      }
    ],
    name: "setThreshold",
    outputs: [
      {
        internalType: "uint256",
        name: "_previousNum",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_previousDenom",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_address",
        type: "address"
      }
    ],
    name: "setTrustNode",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_trustedForwarder",
        type: "address"
      }
    ],
    name: "setTrustedForwarder",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_tokens",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "_percentages",
        type: "uint256[]"
      }
    ],
    name: "setUnlockFeePercentages",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "setUp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "categoryId",
        type: "uint8"
      }
    ],
    name: "setUserEMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "args",
        type: "bytes32"
      }
    ],
    name: "setUserUseReserveAsCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "bool",
        name: "useAsCollateral",
        type: "bool"
      }
    ],
    name: "setUserUseReserveAsCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract AggregatorValidatorInterface",
        name: "_newValidator",
        type: "address"
      },
      {
        internalType: "uint32",
        name: "_newGasLimit",
        type: "uint32"
      }
    ],
    name: "setValidatorConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IWeightedValidator",
        name: "_validatorContract",
        type: "address"
      }
    ],
    name: "setValidatorContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newVerifierAddress",
        type: "address"
      }
    ],
    name: "setVerifierAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_wethAddress",
        type: "address"
      }
    ],
    name: "setWethAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IWETH",
        name: "_wrappedToken",
        type: "address"
      }
    ],
    name: "setWrappedNativeTokenContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20[]",
        name: "tokens",
        type: "address[]"
      },
      {
        internalType: "uint256[]",
        name: "clearingPrices",
        type: "uint256[]"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "sellTokenIndex",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "buyTokenIndex",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "sellAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "buyAmount",
            type: "uint256"
          },
          {
            internalType: "uint32",
            name: "validTo",
            type: "uint32"
          },
          {
            internalType: "bytes32",
            name: "appData",
            type: "bytes32"
          },
          {
            internalType: "uint256",
            name: "feeAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "flags",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "executedAmount",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
          }
        ],
        internalType: "struct GPv2Trade.Data[]",
        name: "trades",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes"
          }
        ],
        internalType: "struct GPv2Interaction.Data[][3]",
        name: "interactions",
        type: "tuple[][3]"
      }
    ],
    name: "settle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token_addr",
        type: "address"
      }
    ],
    name: "setup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "targetContract",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "calldataPayload",
        type: "bytes"
      }
    ],
    name: "simulateDelegatecall",
    outputs: [
      {
        internalType: "bytes",
        name: "response",
        type: "bytes"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "targetContract",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "calldataPayload",
        type: "bytes"
      }
    ],
    name: "simulateDelegatecallInternal",
    outputs: [
      {
        internalType: "bytes",
        name: "response",
        type: "bytes"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "to",
        type: "address"
      }
    ],
    name: "skim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !0,
    inputs: [],
    name: "spentToday",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "amount",
        type: "uint256"
      }
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "v",
        type: "uint8"
      },
      {
        name: "r",
        type: "bytes32"
      },
      {
        name: "s",
        type: "bytes32"
      }
    ],
    name: "stakeWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "destination",
        type: "address"
      },
      {
        name: "value",
        type: "uint256"
      },
      {
        name: "data",
        type: "bytes"
      }
    ],
    name: "submitTransaction",
    outputs: [
      {
        name: "transactionId",
        type: "uint256"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "enum Transfer.Kind",
            name: "kind",
            type: "uint8"
          },
          {
            components: [
              {
                internalType: "address",
                name: "addr",
                type: "address"
              },
              {
                internalType: "address",
                name: "tokenAddr",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256"
              }
            ],
            internalType: "struct Token.Owner",
            name: "mainchain",
            type: "tuple"
          },
          {
            components: [
              {
                internalType: "address",
                name: "addr",
                type: "address"
              },
              {
                internalType: "address",
                name: "tokenAddr",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256"
              }
            ],
            internalType: "struct Token.Owner",
            name: "ronin",
            type: "tuple"
          },
          {
            components: [
              {
                internalType: "enum Token.Standard",
                name: "erc",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "id",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "quantity",
                type: "uint256"
              }
            ],
            internalType: "struct Token.Info",
            name: "info",
            type: "tuple"
          }
        ],
        internalType: "struct Transfer.Receipt",
        name: "_receipt",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct SignatureConsumer.Signature[]",
        name: "_signatures",
        type: "tuple[]"
      }
    ],
    name: "submitWithdrawal",
    outputs: [
      {
        internalType: "bool",
        name: "_locked",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address"
      },
      {
        internalType: "uint16",
        name: "referralCode",
        type: "uint16"
      }
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "args",
        type: "bytes32"
      }
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address"
      },
      {
        internalType: "uint16",
        name: "referralCode",
        type: "uint16"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "permitV",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "permitR",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "permitS",
        type: "bytes32"
      }
    ],
    name: "supplyWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "args",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "supplyWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "amount",
        type: "uint256"
      }
    ],
    name: "swap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "amount0Out",
        type: "uint256"
      },
      {
        name: "amount1Out",
        type: "uint256"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "data",
        type: "bytes"
      }
    ],
    name: "swap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "poolId",
            type: "bytes32"
          },
          {
            name: "kind",
            type: "uint8"
          },
          {
            name: "assetIn",
            type: "address"
          },
          {
            name: "assetOut",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          },
          {
            name: "userData",
            type: "bytes"
          }
        ],
        name: "singleSwap",
        type: "tuple"
      },
      {
        components: [
          {
            name: "sender",
            type: "address"
          },
          {
            name: "fromInternalBalance",
            type: "bool"
          },
          {
            name: "recipient",
            type: "address"
          },
          {
            name: "toInternalBalance",
            type: "bool"
          }
        ],
        name: "funds",
        type: "tuple"
      },
      {
        name: "limit",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swap",
    outputs: [
      {
        name: "amountCalculated",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "inputToken",
        type: "address"
      },
      {
        name: "outputToken",
        type: "address"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "outputAmount",
        type: "uint256"
      },
      {
        name: "packedGoodUntil",
        type: "uint256"
      },
      {
        name: "destinationAddress",
        type: "address"
      },
      {
        components: [
          {
            name: "v",
            type: "uint8"
          },
          {
            name: "r",
            type: "bytes32"
          },
          {
            name: "s",
            type: "bytes32"
          }
        ],
        name: "theSignature",
        type: "tuple"
      },
      {
        name: "auxiliaryData",
        type: "bytes"
      }
    ],
    name: "swap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "poolId",
            type: "bytes32"
          },
          {
            internalType: "uint256",
            name: "assetInIndex",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "assetOutIndex",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "userData",
            type: "bytes"
          }
        ],
        internalType: "struct IVault.BatchSwapStep[]",
        name: "swaps",
        type: "tuple[]"
      },
      {
        internalType: "contract IERC20[]",
        name: "tokens",
        type: "address[]"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "sellTokenIndex",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "buyTokenIndex",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "sellAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "buyAmount",
            type: "uint256"
          },
          {
            internalType: "uint32",
            name: "validTo",
            type: "uint32"
          },
          {
            internalType: "bytes32",
            name: "appData",
            type: "bytes32"
          },
          {
            internalType: "uint256",
            name: "feeAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "flags",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "executedAmount",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
          }
        ],
        internalType: "struct GPv2Trade.Data",
        name: "trade",
        type: "tuple"
      }
    ],
    name: "swap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IAggregationExecutor",
        name: "caller",
        type: "address"
      },
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "srcToken",
            type: "address"
          },
          {
            internalType: "contract IERC20",
            name: "dstToken",
            type: "address"
          },
          {
            internalType: "address payable",
            name: "srcReceiver",
            type: "address"
          },
          {
            internalType: "address payable",
            name: "dstReceiver",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "minReturnAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "flags",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "permit",
            type: "bytes"
          }
        ],
        internalType: "struct AggregationRouterV4.SwapDescription",
        name: "desc",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "swap",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "spentAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "gasLeft",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_mmSigner",
        type: "address"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "user",
            type: "address"
          },
          {
            internalType: "address",
            name: "baseToken",
            type: "address"
          },
          {
            internalType: "address",
            name: "quoteToken",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "baseTokenAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "quoteTokenAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "expiryTimestamp",
            type: "uint256"
          }
        ],
        internalType: "struct PancakeSwapMMPool.Quote",
        name: "_quote",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes"
      }
    ],
    name: "swap",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "args",
        type: "bytes32"
      }
    ],
    name: "swapBorrowRateMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "interestRateMode",
        type: "uint256"
      }
    ],
    name: "swapBorrowRateMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "pair",
            type: "address"
          },
          {
            name: "numItems",
            type: "uint256"
          }
        ],
        name: "swapList",
        type: "tuple[]"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapERC20ForAnyNFTs",
    outputs: [
      {
        name: "remainingValue",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "pair",
            type: "address"
          },
          {
            name: "nftIds",
            type: "uint256[]"
          }
        ],
        name: "swapList",
        type: "tuple[]"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapERC20ForSpecificNFTs",
    outputs: [
      {
        name: "remainingValue",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "pair",
            type: "address"
          },
          {
            name: "numItems",
            type: "uint256"
          }
        ],
        name: "swapList",
        type: "tuple[]"
      },
      {
        name: "ethRecipient",
        type: "address"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapETHForAnyNFTs",
    outputs: [
      {
        name: "remainingValue",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amountOut",
        type: "uint256"
      },
      {
        name: "path",
        type: "address[]"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapETHForExactTokens",
    outputs: [
      {
        name: "amounts",
        type: "uint256[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "pair",
            type: "address"
          },
          {
            name: "nftIds",
            type: "uint256[]"
          }
        ],
        name: "swapList",
        type: "tuple[]"
      },
      {
        name: "ethRecipient",
        type: "address"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapETHForSpecificNFTs",
    outputs: [
      {
        name: "remainingValue",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amountOutMin",
        type: "uint256"
      },
      {
        name: "path",
        type: "address[]"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapExactETHForTokens",
    outputs: [
      {
        name: "amounts",
        type: "uint256[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amountOutMin",
        type: "uint256"
      },
      {
        name: "path",
        type: "address[]"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amountIn",
        type: "uint256"
      },
      {
        name: "amountOutMin",
        type: "uint256"
      },
      {
        name: "path",
        type: "address[]"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapExactTokensForETH",
    outputs: [
      {
        name: "amounts",
        type: "uint256[]"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amountIn",
        type: "uint256"
      },
      {
        name: "amountOutMin",
        type: "uint256"
      },
      {
        name: "path",
        type: "address[]"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapExactTokensForETHSupportingFeeOnTransferTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amountIn",
        type: "uint256"
      },
      {
        name: "amountOutMin",
        type: "uint256"
      },
      {
        name: "path",
        type: "address[]"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapExactTokensForTokens",
    outputs: [
      {
        name: "amounts",
        type: "uint256[]"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      }
    ],
    name: "swapExactTokensForTokens",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amountIn",
        type: "uint256"
      },
      {
        name: "amountOutMin",
        type: "uint256"
      },
      {
        name: "path",
        type: "address[]"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "nftIds",
                type: "uint256[]"
              }
            ],
            name: "nftToTokenTrades",
            type: "tuple[]"
          },
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "numItems",
                type: "uint256"
              }
            ],
            name: "tokenToNFTTrades",
            type: "tuple[]"
          }
        ],
        name: "trade",
        type: "tuple"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "minOutput",
        type: "uint256"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapNFTsForAnyNFTsThroughERC20",
    outputs: [
      {
        name: "outputAmount",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "nftIds",
                type: "uint256[]"
              }
            ],
            name: "nftToTokenTrades",
            type: "tuple[]"
          },
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "numItems",
                type: "uint256"
              }
            ],
            name: "tokenToNFTTrades",
            type: "tuple[]"
          }
        ],
        name: "trade",
        type: "tuple"
      },
      {
        name: "minOutput",
        type: "uint256"
      },
      {
        name: "ethRecipient",
        type: "address"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapNFTsForAnyNFTsThroughETH",
    outputs: [
      {
        name: "outputAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "nftIds",
                type: "uint256[]"
              }
            ],
            name: "nftToTokenTrades",
            type: "tuple[]"
          },
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "nftIds",
                type: "uint256[]"
              }
            ],
            name: "tokenToNFTTrades",
            type: "tuple[]"
          }
        ],
        name: "trade",
        type: "tuple"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "minOutput",
        type: "uint256"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapNFTsForSpecificNFTsThroughERC20",
    outputs: [
      {
        name: "outputAmount",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "nftIds",
                type: "uint256[]"
              }
            ],
            name: "nftToTokenTrades",
            type: "tuple[]"
          },
          {
            components: [
              {
                name: "pair",
                type: "address"
              },
              {
                name: "nftIds",
                type: "uint256[]"
              }
            ],
            name: "tokenToNFTTrades",
            type: "tuple[]"
          }
        ],
        name: "trade",
        type: "tuple"
      },
      {
        name: "minOutput",
        type: "uint256"
      },
      {
        name: "ethRecipient",
        type: "address"
      },
      {
        name: "nftRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapNFTsForSpecificNFTsThroughETH",
    outputs: [
      {
        name: "outputAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            name: "pair",
            type: "address"
          },
          {
            name: "nftIds",
            type: "uint256[]"
          }
        ],
        name: "swapList",
        type: "tuple[]"
      },
      {
        name: "minOutput",
        type: "uint256"
      },
      {
        name: "tokenRecipient",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapNFTsForToken",
    outputs: [
      {
        name: "outputAmount",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amountOut",
        type: "uint256"
      },
      {
        name: "amountInMax",
        type: "uint256"
      },
      {
        name: "path",
        type: "address[]"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapTokensForExactETH",
    outputs: [
      {
        name: "amounts",
        type: "uint256[]"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amountOut",
        type: "uint256"
      },
      {
        name: "amountInMax",
        type: "uint256"
      },
      {
        name: "path",
        type: "address[]"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "swapTokensForExactTokens",
    outputs: [
      {
        name: "amounts",
        type: "uint256[]"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountInMax",
        type: "uint256"
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      }
    ],
    name: "swapTokensForExactTokens",
    outputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      }
    ],
    name: "sweepToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amountMinimum",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      }
    ],
    name: "sweepToken",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amountMinimum",
        type: "uint256"
      }
    ],
    name: "sweepToken",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amountMinimum",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "feeBips",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "feeRecipient",
        type: "address"
      }
    ],
    name: "sweepTokenWithFee",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amountMinimum",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "feeBips",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "feeRecipient",
        type: "address"
      }
    ],
    name: "sweepTokenWithFee",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "sync",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_nodeaddress",
        type: "address[]"
      },
      {
        name: "_blocknumber",
        type: "uint256"
      }
    ],
    name: "toDailyoutput",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "togglePledging",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      },
      {
        name: "min_eth",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "tokenToEthSwapInput",
    outputs: [
      {
        name: "eth_bought",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "eth_bought",
        type: "uint256"
      },
      {
        name: "max_tokens",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      }
    ],
    name: "tokenToEthSwapOutput",
    outputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      },
      {
        name: "min_eth",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "recipient",
        type: "address"
      }
    ],
    name: "tokenToEthTransferInput",
    outputs: [
      {
        name: "eth_bought",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "eth_bought",
        type: "uint256"
      },
      {
        name: "max_tokens",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "recipient",
        type: "address"
      }
    ],
    name: "tokenToEthTransferOutput",
    outputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      },
      {
        name: "min_tokens_bought",
        type: "uint256"
      },
      {
        name: "min_eth_bought",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "exchange_addr",
        type: "address"
      }
    ],
    name: "tokenToExchangeSwapInput",
    outputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      },
      {
        name: "max_tokens_sold",
        type: "uint256"
      },
      {
        name: "max_eth_sold",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "exchange_addr",
        type: "address"
      }
    ],
    name: "tokenToExchangeSwapOutput",
    outputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      },
      {
        name: "min_tokens_bought",
        type: "uint256"
      },
      {
        name: "min_eth_bought",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "recipient",
        type: "address"
      },
      {
        name: "exchange_addr",
        type: "address"
      }
    ],
    name: "tokenToExchangeTransferInput",
    outputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      },
      {
        name: "max_tokens_sold",
        type: "uint256"
      },
      {
        name: "max_eth_sold",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "recipient",
        type: "address"
      },
      {
        name: "exchange_addr",
        type: "address"
      }
    ],
    name: "tokenToExchangeTransferOutput",
    outputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      },
      {
        name: "min_tokens_bought",
        type: "uint256"
      },
      {
        name: "min_eth_bought",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "token_addr",
        type: "address"
      }
    ],
    name: "tokenToTokenSwapInput",
    outputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      },
      {
        name: "max_tokens_sold",
        type: "uint256"
      },
      {
        name: "max_eth_sold",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "token_addr",
        type: "address"
      }
    ],
    name: "tokenToTokenSwapOutput",
    outputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      },
      {
        name: "min_tokens_bought",
        type: "uint256"
      },
      {
        name: "min_eth_bought",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "recipient",
        type: "address"
      },
      {
        name: "token_addr",
        type: "address"
      }
    ],
    name: "tokenToTokenTransferInput",
    outputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256"
      },
      {
        name: "max_tokens_sold",
        type: "uint256"
      },
      {
        name: "max_eth_sold",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "recipient",
        type: "address"
      },
      {
        name: "token_addr",
        type: "address"
      }
    ],
    name: "tokenToTokenTransferOutput",
    outputs: [
      {
        name: "tokens_sold",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "totalBorrowsCurrent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !0,
    inputs: [],
    name: "transactionCount",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    constant: !0,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "transactions",
    outputs: [
      {
        name: "destination",
        type: "address"
      },
      {
        name: "value",
        type: "uint256"
      },
      {
        name: "data",
        type: "bytes"
      },
      {
        name: "executed",
        type: "bool"
      }
    ],
    payable: !1,
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "to",
        type: "address"
      },
      {
        name: "valueOrTokenId",
        type: "uint256"
      }
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      }
    ],
    name: "transferAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_token",
        type: "address"
      },
      {
        internalType: "address",
        name: "_to",
        type: "address"
      },
      {
        internalType: "uint128",
        name: "_amount",
        type: "uint128"
      },
      {
        internalType: "uint128",
        name: "_maxAmount",
        type: "uint128"
      }
    ],
    name: "transferERC20",
    outputs: [
      {
        internalType: "uint128",
        name: "withdrawnAmount",
        type: "uint128"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "from",
        type: "address"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "valueOrTokenId",
        type: "uint256"
      }
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "newMaster",
        type: "address"
      }
    ],
    name: "transferMastership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_from",
        type: "address"
      },
      {
        name: "_to",
        type: "address"
      },
      {
        name: "_value",
        type: "uint256"
      }
    ],
    name: "transferOnLiquidation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_transmitter",
        type: "address"
      },
      {
        internalType: "address",
        name: "_proposed",
        type: "address"
      }
    ],
    name: "transferPayeeship",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "from",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "recipientChain",
        type: "uint16"
      },
      {
        name: "recipient",
        type: "bytes32"
      },
      {
        name: "arbiterFee",
        type: "uint256"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "v",
        type: "uint8"
      },
      {
        name: "r",
        type: "bytes32"
      },
      {
        name: "s",
        type: "bytes32"
      }
    ],
    name: "transferTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "recipientChain",
        type: "uint16"
      },
      {
        name: "recipient",
        type: "bytes32"
      },
      {
        name: "arbiterFee",
        type: "uint256"
      },
      {
        name: "nonce",
        type: "uint32"
      }
    ],
    name: "transferTokens",
    outputs: [
      {
        name: "sequence",
        type: "uint64"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "token",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "recipientChain",
        type: "uint16"
      },
      {
        name: "recipient",
        type: "bytes32"
      },
      {
        name: "nonce",
        type: "uint32"
      },
      {
        name: "payload",
        type: "bytes"
      }
    ],
    name: "transferTokensWithPayload",
    outputs: [
      {
        name: "sequence",
        type: "uint64"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_report",
        type: "bytes"
      },
      {
        internalType: "bytes32[]",
        name: "_rs",
        type: "bytes32[]"
      },
      {
        internalType: "bytes32[]",
        name: "_ss",
        type: "bytes32[]"
      },
      {
        internalType: "bytes32",
        name: "_rawVs",
        type: "bytes32"
      }
    ],
    name: "transmit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "depositAmounts",
        type: "uint256[]"
      },
      {
        name: "nDays",
        type: "uint256"
      },
      {
        name: "poolTokens",
        type: "uint256"
      },
      {
        name: "goodUntil",
        type: "uint256"
      },
      {
        components: [
          {
            name: "v",
            type: "uint8"
          },
          {
            name: "r",
            type: "bytes32"
          },
          {
            name: "s",
            type: "bytes32"
          }
        ],
        name: "theSignature",
        type: "tuple"
      }
    ],
    name: "transmitAndDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "inputToken",
        type: "address"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "nDays",
        type: "uint256"
      },
      {
        name: "poolTokens",
        type: "uint256"
      },
      {
        name: "goodUntil",
        type: "uint256"
      },
      {
        components: [
          {
            name: "v",
            type: "uint8"
          },
          {
            name: "r",
            type: "bytes32"
          },
          {
            name: "s",
            type: "bytes32"
          }
        ],
        name: "theSignature",
        type: "tuple"
      }
    ],
    name: "transmitAndDepositSingleAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "inputToken",
        type: "address"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "outputAmount",
        type: "uint256"
      },
      {
        name: "goodUntil",
        type: "uint256"
      },
      {
        name: "destinationAddress",
        type: "address"
      },
      {
        components: [
          {
            name: "v",
            type: "uint8"
          },
          {
            name: "r",
            type: "bytes32"
          },
          {
            name: "s",
            type: "bytes32"
          }
        ],
        name: "theSignature",
        type: "tuple"
      },
      {
        name: "auxiliaryData",
        type: "bytes"
      }
    ],
    name: "transmitAndSellTokenForEth",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "inputToken",
        type: "address"
      },
      {
        name: "outputToken",
        type: "address"
      },
      {
        name: "inputAmount",
        type: "uint256"
      },
      {
        name: "outputAmount",
        type: "uint256"
      },
      {
        name: "goodUntil",
        type: "uint256"
      },
      {
        name: "destinationAddress",
        type: "address"
      },
      {
        components: [
          {
            name: "v",
            type: "uint8"
          },
          {
            name: "r",
            type: "bytes32"
          },
          {
            name: "s",
            type: "bytes32"
          }
        ],
        name: "theSignature",
        type: "tuple"
      },
      {
        name: "auxiliaryData",
        type: "bytes"
      }
    ],
    name: "transmitAndSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minReturn",
        type: "uint256"
      },
      {
        internalType: "uint256[]",
        name: "pools",
        type: "uint256[]"
      }
    ],
    name: "uniswapV3Swap",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "amount0Delta",
        type: "int256"
      },
      {
        internalType: "int256",
        name: "amount1Delta",
        type: "int256"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "uniswapV3SwapCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minReturn",
        type: "uint256"
      },
      {
        internalType: "uint256[]",
        name: "pools",
        type: "uint256[]"
      }
    ],
    name: "uniswapV3SwapTo",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "srcToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minReturn",
        type: "uint256"
      },
      {
        internalType: "uint256[]",
        name: "pools",
        type: "uint256[]"
      },
      {
        internalType: "bytes",
        name: "permit",
        type: "bytes"
      }
    ],
    name: "uniswapV3SwapToWithPermit",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "unlock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "unlockDeposit",
    outputs: [
      {
        name: "poolTokens",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "enum Transfer.Kind",
            name: "kind",
            type: "uint8"
          },
          {
            components: [
              {
                internalType: "address",
                name: "addr",
                type: "address"
              },
              {
                internalType: "address",
                name: "tokenAddr",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256"
              }
            ],
            internalType: "struct Token.Owner",
            name: "mainchain",
            type: "tuple"
          },
          {
            components: [
              {
                internalType: "address",
                name: "addr",
                type: "address"
              },
              {
                internalType: "address",
                name: "tokenAddr",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256"
              }
            ],
            internalType: "struct Token.Owner",
            name: "ronin",
            type: "tuple"
          },
          {
            components: [
              {
                internalType: "enum Token.Standard",
                name: "erc",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "id",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "quantity",
                type: "uint256"
              }
            ],
            internalType: "struct Token.Info",
            name: "info",
            type: "tuple"
          }
        ],
        internalType: "struct Transfer.Receipt",
        name: "_receipt",
        type: "tuple"
      }
    ],
    name: "unlockWithdrawal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "srcToken",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "minReturn",
        type: "uint256"
      },
      {
        name: "pools",
        type: "bytes32[]"
      }
    ],
    name: "unoswap",
    outputs: [
      {
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "srcToken",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "minReturn",
        type: "uint256"
      },
      {
        name: "pools",
        type: "bytes32[]"
      },
      {
        name: "permit",
        type: "bytes"
      }
    ],
    name: "unoswapWithPermit",
    outputs: [
      {
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "amountMinimum",
        type: "uint256"
      },
      {
        name: "recipient",
        type: "address"
      }
    ],
    name: "unwrapWETH9",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountMinimum",
        type: "uint256"
      }
    ],
    name: "unwrapWETH9",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountMinimum",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "feeBips",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "feeRecipient",
        type: "address"
      }
    ],
    name: "unwrapWETH9WithFee",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountMinimum",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "feeBips",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "feeRecipient",
        type: "address"
      }
    ],
    name: "unwrapWETH9WithFee",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_affiliateIndex",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_affiliate",
        type: "address"
      },
      {
        internalType: "bool",
        name: "_IsActive",
        type: "bool"
      }
    ],
    name: "updateAffiliate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "protocolFee",
        type: "uint256"
      }
    ],
    name: "updateBridgeProtocolFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newAddress",
        type: "address"
      }
    ],
    name: "updateCampaignSetter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "flashLoanPremiumTotal",
        type: "uint128"
      },
      {
        internalType: "uint128",
        name: "flashLoanPremiumToProtocol",
        type: "uint128"
      }
    ],
    name: "updateFlashloanPremiums",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newAddress",
        type: "address"
      }
    ],
    name: "updateGalaxySigner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_guardian",
        type: "address"
      }
    ],
    name: "updateGuardian",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes"
      },
      {
        internalType: "string",
        name: "_sigValue",
        type: "string"
      },
      {
        internalType: "string",
        name: "_timestamp",
        type: "string"
      },
      {
        internalType: "string",
        name: "_message",
        type: "string"
      }
    ],
    name: "updateIfSigned",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_treasury",
        type: "address"
      },
      {
        internalType: "bool",
        name: "_active",
        type: "bool"
      }
    ],
    name: "updateMMInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newAddress",
        type: "address"
      }
    ],
    name: "updateManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "args",
        type: "bytes"
      }
    ],
    name: "updateMarketFilterSettings",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_marketIndex",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_marketId",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "_isActive",
        type: "bool"
      }
    ],
    name: "updateSponsoredMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "newAddress",
        type: "address"
      }
    ],
    name: "updateTreasureManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "upgradeParameters",
        type: "bytes"
      }
    ],
    name: "upgrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "upgradeCanceled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "upgradeFinishes",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "upgradeNoticePeriodStarted",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "upgradePreparationStarted",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "upgradeTo",
    outputs: [
      {
        name: "implementation",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address"
      }
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "offerer",
                type: "address"
              },
              {
                internalType: "address",
                name: "zone",
                type: "address"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  }
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]"
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8"
                  },
                  {
                    internalType: "address",
                    name: "token",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256"
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address"
                  }
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]"
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8"
              },
              {
                internalType: "uint256",
                name: "startTime",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "endTime",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "zoneHash",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "salt",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "conduitKey",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256"
              }
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple"
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
          }
        ],
        internalType: "struct Order[]",
        name: "orders",
        type: "tuple[]"
      }
    ],
    name: "validate",
    outputs: [
      {
        internalType: "bool",
        name: "validated",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "_mintAmount",
        type: "uint256"
      },
      {
        name: "_merkleProof",
        type: "bytes32[]"
      }
    ],
    name: "whitelistMint",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "amount",
        type: "uint256"
      }
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      }
    ],
    name: "withdraw",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "args",
        type: "bytes32"
      }
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "kappa",
        type: "bytes32"
      }
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256"
      },
      {
        internalType: "contract ISwap",
        name: "pool",
        type: "address"
      },
      {
        internalType: "uint8",
        name: "swapTokenIndex",
        type: "uint8"
      },
      {
        internalType: "uint256",
        name: "swapMinAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "swapDeadline",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "kappa",
        type: "bytes32"
      }
    ],
    name: "withdrawAndRemove",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address"
      }
    ],
    name: "withdrawERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract ERC20",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "withdrawERC20ProtocolFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "lendingPool",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "to",
        type: "address"
      }
    ],
    name: "withdrawETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address"
      }
    ],
    name: "withdrawETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdrawETHProtocolFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "pool",
        type: "address"
      },
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "to",
        type: "address"
      },
      {
        name: "deadline",
        type: "uint256"
      },
      {
        name: "permitV",
        type: "uint8"
      },
      {
        name: "permitR",
        type: "bytes32"
      },
      {
        name: "permitS",
        type: "bytes32"
      }
    ],
    name: "withdrawETHWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      }
    ],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_transmitter",
        type: "address"
      }
    ],
    name: "withdrawPayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "_token",
        type: "address"
      },
      {
        internalType: "uint128",
        name: "_amount",
        type: "uint128"
      }
    ],
    name: "withdrawPendingBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_tokenId",
        type: "uint32"
      }
    ],
    name: "withdrawPendingNFTBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "tokenHolder",
        type: "address"
      },
      {
        name: "poolTokenAmountToBurn",
        type: "uint256"
      },
      {
        name: "assetAddress",
        type: "address"
      },
      {
        name: "assetAmount",
        type: "uint256"
      },
      {
        name: "goodUntil",
        type: "uint256"
      },
      {
        components: [
          {
            name: "v",
            type: "uint8"
          },
          {
            name: "r",
            type: "bytes32"
          },
          {
            name: "s",
            type: "bytes32"
          }
        ],
        name: "theSignature",
        type: "tuple"
      }
    ],
    name: "withdrawSingleAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "recipientChain",
        type: "uint16"
      },
      {
        name: "recipient",
        type: "bytes32"
      },
      {
        name: "arbiterFee",
        type: "uint256"
      },
      {
        name: "nonce",
        type: "uint32"
      }
    ],
    name: "wrapAndTransferETH",
    outputs: [
      {
        name: "sequence",
        type: "uint64"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "recipientChain",
        type: "uint16"
      },
      {
        name: "recipient",
        type: "bytes32"
      },
      {
        name: "nonce",
        type: "uint32"
      },
      {
        name: "payload",
        type: "bytes"
      }
    ],
    name: "wrapAndTransferETHWithPayload",
    outputs: [
      {
        name: "sequence",
        type: "uint64"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "wrapETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "zoraFeeForAmount",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "amount",
        type: "uint8"
      }
    ],
    name: "advanceNonce",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address"
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "offsets",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "interactions",
            type: "bytes"
          }
        ],
        internalType: "struct OrderLib.Order",
        name: "order",
        type: "tuple"
      }
    ],
    name: "cancelOrder",
    outputs: [
      {
        internalType: "uint256",
        name: "orderRemaining",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "orderInfo",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "additionalMask",
        type: "uint256"
      }
    ],
    name: "cancelOrderRFQ",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IClipperExchangeInterface",
        name: "clipperExchange",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "srcToken",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "dstToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "goodUntil",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "vs",
        type: "bytes32"
      }
    ],
    name: "clipperSwap",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IClipperExchangeInterface",
        name: "clipperExchange",
        type: "address"
      },
      {
        internalType: "address payable",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "srcToken",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "dstToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "goodUntil",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "vs",
        type: "bytes32"
      }
    ],
    name: "clipperSwapTo",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IClipperExchangeInterface",
        name: "clipperExchange",
        type: "address"
      },
      {
        internalType: "address payable",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "srcToken",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "dstToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "goodUntil",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "vs",
        type: "bytes32"
      },
      {
        internalType: "bytes",
        name: "permit",
        type: "bytes"
      }
    ],
    name: "clipperSwapToWithPermit",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address"
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "offsets",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "interactions",
            type: "bytes"
          }
        ],
        internalType: "struct OrderLib.Order",
        name: "order",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes"
      },
      {
        internalType: "bytes",
        name: "interaction",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "makingAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "takingAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "skipPermitAndThresholdAmount",
        type: "uint256"
      }
    ],
    name: "fillOrder",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "info",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256"
          }
        ],
        internalType: "struct OrderRFQLib.OrderRFQ",
        name: "order",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "flagsAndAmount",
        type: "uint256"
      }
    ],
    name: "fillOrderRFQ",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "info",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256"
          }
        ],
        internalType: "struct OrderRFQLib.OrderRFQ",
        name: "order",
        type: "tuple"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "vs",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "flagsAndAmount",
        type: "uint256"
      }
    ],
    name: "fillOrderRFQCompact",
    outputs: [
      {
        internalType: "uint256",
        name: "filledMakingAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "filledTakingAmount",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "info",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256"
          }
        ],
        internalType: "struct OrderRFQLib.OrderRFQ",
        name: "order",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "flagsAndAmount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "target",
        type: "address"
      }
    ],
    name: "fillOrderRFQTo",
    outputs: [
      {
        internalType: "uint256",
        name: "filledMakingAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "filledTakingAmount",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "info",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256"
          }
        ],
        internalType: "struct OrderRFQLib.OrderRFQ",
        name: "order",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "flagsAndAmount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "permit",
        type: "bytes"
      }
    ],
    name: "fillOrderRFQToWithPermit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address"
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "offsets",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "interactions",
            type: "bytes"
          }
        ],
        internalType: "struct OrderLib.Order",
        name: "order_",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes"
      },
      {
        internalType: "bytes",
        name: "interaction",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "makingAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "takingAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "skipPermitAndThresholdAmount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "target",
        type: "address"
      }
    ],
    name: "fillOrderTo",
    outputs: [
      {
        internalType: "uint256",
        name: "actualMakingAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "actualTakingAmount",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address"
          },
          {
            internalType: "address",
            name: "maker",
            type: "address"
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address"
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "offsets",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "interactions",
            type: "bytes"
          }
        ],
        internalType: "struct OrderLib.Order",
        name: "order",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes"
      },
      {
        internalType: "bytes",
        name: "interaction",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "makingAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "takingAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "skipPermitAndThresholdAmount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "permit",
        type: "bytes"
      }
    ],
    name: "fillOrderToWithPermit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "increaseNonce",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "simulate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IAggregationExecutor",
        name: "executor",
        type: "address"
      },
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "srcToken",
            type: "address"
          },
          {
            internalType: "contract IERC20",
            name: "dstToken",
            type: "address"
          },
          {
            internalType: "address payable",
            name: "srcReceiver",
            type: "address"
          },
          {
            internalType: "address payable",
            name: "dstReceiver",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "minReturnAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "flags",
            type: "uint256"
          }
        ],
        internalType: "struct GenericRouter.SwapDescription",
        name: "desc",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "permit",
        type: "bytes"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "swap",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "spentAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "srcToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minReturn",
        type: "uint256"
      },
      {
        internalType: "uint256[]",
        name: "pools",
        type: "uint256[]"
      }
    ],
    name: "unoswap",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "srcToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minReturn",
        type: "uint256"
      },
      {
        internalType: "uint256[]",
        name: "pools",
        type: "uint256[]"
      }
    ],
    name: "unoswapTo",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "contract IERC20",
        name: "srcToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minReturn",
        type: "uint256"
      },
      {
        internalType: "uint256[]",
        name: "pools",
        type: "uint256[]"
      },
      {
        internalType: "bytes",
        name: "permit",
        type: "bytes"
      }
    ],
    name: "unoswapToWithPermit",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "acceptFundsFromOldBridge",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "kind",
        type: "uint8"
      },
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "bytes32",
        name: "messageDataHash",
        type: "bytes32"
      }
    ],
    name: "enqueueDelayedMessage",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "dataHash",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "afterDelayedMessagesRead",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "prevMessageCount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "newMessageCount",
        type: "uint256"
      }
    ],
    name: "enqueueSequencerMessage",
    outputs: [
      {
        internalType: "uint256",
        name: "seqMessageIndex",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "beforeAcc",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "delayedAcc",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "acc",
        type: "bytes32"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      }
    ],
    name: "executeCall",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool"
      },
      {
        internalType: "bytes",
        name: "returnData",
        type: "bytes"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "inbox",
        type: "address"
      },
      {
        internalType: "bool",
        name: "enabled",
        type: "bool"
      }
    ],
    name: "setDelayedInbox",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "outbox",
        type: "address"
      },
      {
        internalType: "bool",
        name: "enabled",
        type: "bool"
      }
    ],
    name: "setOutbox",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_sequencerInbox",
        type: "address"
      }
    ],
    name: "setSequencerInbox",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newMsgCount",
        type: "uint256"
      }
    ],
    name: "setSequencerReportedSubMessageCount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "bytes32",
        name: "messageDataHash",
        type: "bytes32"
      }
    ],
    name: "submitBatchSpendingReport",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    name: "add_liquidity",
    outputs: [
      {
        type: "uint256",
        name: ""
      }
    ],
    inputs: [
      {
        type: "uint256[2]",
        name: "amounts"
      },
      {
        type: "uint256",
        name: "min_mint_amount"
      }
    ],
    stateMutability: "payable",
    type: "function",
    gas: 3484118
  },
  {
    name: "exchange",
    outputs: [
      {
        type: "uint256",
        name: ""
      }
    ],
    inputs: [
      {
        type: "int128",
        name: "i"
      },
      {
        type: "int128",
        name: "j"
      },
      {
        type: "uint256",
        name: "dx"
      },
      {
        type: "uint256",
        name: "min_dy"
      }
    ],
    stateMutability: "payable",
    type: "function",
    gas: 2810134
  },
  {
    name: "remove_liquidity",
    outputs: [
      {
        type: "uint256[2]",
        name: ""
      }
    ],
    inputs: [
      {
        type: "uint256",
        name: "_amount"
      },
      {
        type: "uint256[2]",
        name: "_min_amounts"
      }
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 160545
  },
  {
    name: "remove_liquidity_imbalance",
    outputs: [
      {
        type: "uint256",
        name: ""
      }
    ],
    inputs: [
      {
        type: "uint256[2]",
        name: "_amounts"
      },
      {
        type: "uint256",
        name: "_max_burn_amount"
      }
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 3519382
  },
  {
    name: "remove_liquidity_one_coin",
    outputs: [
      {
        type: "uint256",
        name: ""
      }
    ],
    inputs: [
      {
        type: "uint256",
        name: "_token_amount"
      },
      {
        type: "int128",
        name: "i"
      },
      {
        type: "uint256",
        name: "_min_amount"
      }
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 4113806
  },
  {
    name: "ramp_A",
    outputs: [],
    inputs: [
      {
        type: "uint256",
        name: "_future_A"
      },
      {
        type: "uint256",
        name: "_future_time"
      }
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 151834
  },
  {
    name: "stop_ramp_A",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 148595
  },
  {
    name: "commit_new_fee",
    outputs: [],
    inputs: [
      {
        type: "uint256",
        name: "new_fee"
      },
      {
        type: "uint256",
        name: "new_admin_fee"
      }
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 110431
  },
  {
    name: "apply_new_fee",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 153115
  },
  {
    name: "revert_new_parameters",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 21865
  },
  {
    name: "commit_transfer_ownership",
    outputs: [],
    inputs: [
      {
        type: "address",
        name: "_owner"
      }
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 74603
  },
  {
    name: "apply_transfer_ownership",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 116583
  },
  {
    name: "revert_transfer_ownership",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 21955
  },
  {
    name: "withdraw_admin_fees",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 137597
  },
  {
    name: "donate_admin_fees",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 42144
  },
  {
    name: "kill_me",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 37938
  },
  {
    name: "unkill_me",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 22075
  },
  {
    inputs: [],
    name: "acceptGovernance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "cancelNomination",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "l2Recipient",
        type: "uint256"
      }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "l2Recipient",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256"
      }
    ],
    name: "depositCancelRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "l2Recipient",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256"
      }
    ],
    name: "depositReclaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newGovernor",
        type: "address"
      }
    ],
    name: "nominateNewGovernor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "governorForRemoval",
        type: "address"
      }
    ],
    name: "removeGovernor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "l2TokenBridge_",
        type: "uint256"
      }
    ],
    name: "setL2TokenBridge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxDeposit_",
        type: "uint256"
      }
    ],
    name: "setMaxDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxTotalBalance_",
        type: "uint256"
      }
    ],
    name: "setMaxTotalBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      }
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint32",
                name: "blockNumber",
                type: "uint32"
              },
              {
                internalType: "uint64",
                name: "priorityOperations",
                type: "uint64"
              },
              {
                internalType: "bytes32",
                name: "pendingOnchainOperationsHash",
                type: "bytes32"
              },
              {
                internalType: "uint256",
                name: "timestamp",
                type: "uint256"
              },
              {
                internalType: "bytes32",
                name: "stateHash",
                type: "bytes32"
              },
              {
                internalType: "bytes32",
                name: "commitment",
                type: "bytes32"
              }
            ],
            internalType: "struct Storage.StoredBlockInfo",
            name: "storedBlock",
            type: "tuple"
          },
          {
            internalType: "bytes[]",
            name: "pendingOnchainOpsPubdata",
            type: "bytes[]"
          }
        ],
        internalType: "struct ZkSync.ExecuteBlockInfo[]",
        name: "_blocksData",
        type: "tuple[]"
      }
    ],
    name: "executeBlocks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IOpenOceanCaller",
        name: "caller",
        type: "address"
      },
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "srcToken",
            type: "address"
          },
          {
            internalType: "contract IERC20",
            name: "dstToken",
            type: "address"
          },
          {
            internalType: "address",
            name: "srcReceiver",
            type: "address"
          },
          {
            internalType: "address",
            name: "dstReceiver",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "minReturnAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "guaranteedAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "flags",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "referrer",
            type: "address"
          },
          {
            internalType: "bytes",
            name: "permit",
            type: "bytes"
          }
        ],
        internalType: "struct OpenOceanExchange.SwapDescription",
        name: "desc",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "target",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "gasLimit",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          }
        ],
        internalType: "struct IOpenOceanCaller.CallDescription[]",
        name: "calls",
        type: "tuple[]"
      }
    ],
    name: "swap",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_l2BlockNumber",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_l2MessageIndex",
        type: "uint256"
      },
      {
        internalType: "uint16",
        name: "_l2TxNumberInBlock",
        type: "uint16"
      },
      {
        internalType: "bytes",
        name: "_message",
        type: "bytes"
      },
      {
        internalType: "bytes32[]",
        name: "_merkleProof",
        type: "bytes32[]"
      }
    ],
    name: "finalizeEthWithdrawal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_contractL2",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_l2Value",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "_calldata",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "_l2GasLimit",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_l2GasPerPubdataByteLimit",
        type: "uint256"
      },
      {
        internalType: "bytes[]",
        name: "_factoryDeps",
        type: "bytes[]"
      },
      {
        internalType: "address",
        name: "_refundRecipient",
        type: "address"
      }
    ],
    name: "requestL2Transaction",
    outputs: [
      {
        internalType: "bytes32",
        name: "canonicalTxHash",
        type: "bytes32"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "relayer",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "relayerFee",
        type: "uint256"
      }
    ],
    name: "sendToL2",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_gasLimit",
        type: "uint256"
      }
    ],
    name: "depositERC20",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address"
      },
      {
        internalType: "address",
        name: "_to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_gasLimit",
        type: "uint256"
      }
    ],
    name: "depositERC20",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address"
      },
      {
        internalType: "address",
        name: "_to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "_gasLimit",
        type: "uint256"
      }
    ],
    name: "depositERC20AndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_gasLimit",
        type: "uint256"
      }
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_gasLimit",
        type: "uint256"
      }
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "_gasLimit",
        type: "uint256"
      }
    ],
    name: "depositETHAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    name: "finalizeWithdrawERC20",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    name: "finalizeWithdrawETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_defaultERC20Gateway",
        type: "address"
      }
    ],
    name: "setDefaultERC20Gateway",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_tokens",
        type: "address[]"
      },
      {
        internalType: "address[]",
        name: "_gateways",
        type: "address[]"
      }
    ],
    name: "setERC20Gateway",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_ethGateway",
        type: "address"
      }
    ],
    name: "setETHGateway",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addressManager",
        type: "address"
      }
    ],
    name: "init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "sender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "srcChainId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "destChainId",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "owner",
            type: "address"
          },
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "address",
            name: "refundAddress",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "depositValue",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "callValue",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "processingFee",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "gasLimit",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          },
          {
            internalType: "string",
            name: "memo",
            type: "string"
          }
        ],
        internalType: "struct IBridge.Message",
        name: "message",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes"
      }
    ],
    name: "processMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "sender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "srcChainId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "destChainId",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "owner",
            type: "address"
          },
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "address",
            name: "refundAddress",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "depositValue",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "callValue",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "processingFee",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "gasLimit",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          },
          {
            internalType: "string",
            name: "memo",
            type: "string"
          }
        ],
        internalType: "struct IBridge.Message",
        name: "message",
        type: "tuple"
      },
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes"
      }
    ],
    name: "releaseEther",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "sender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "srcChainId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "destChainId",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "owner",
            type: "address"
          },
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "address",
            name: "refundAddress",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "depositValue",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "callValue",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "processingFee",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "gasLimit",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          },
          {
            internalType: "string",
            name: "memo",
            type: "string"
          }
        ],
        internalType: "struct IBridge.Message",
        name: "message",
        type: "tuple"
      },
      {
        internalType: "bool",
        name: "isLastAttempt",
        type: "bool"
      }
    ],
    name: "retryMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "sender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "srcChainId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "destChainId",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "owner",
            type: "address"
          },
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "address",
            name: "refundAddress",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "depositValue",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "callValue",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "processingFee",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "gasLimit",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          },
          {
            internalType: "string",
            name: "memo",
            type: "string"
          }
        ],
        internalType: "struct IBridge.Message",
        name: "message",
        type: "tuple"
      }
    ],
    name: "sendMessage",
    outputs: [
      {
        internalType: "bytes32",
        name: "msgHash",
        type: "bytes32"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "activateEmergencyState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "destinationNetwork",
        type: "uint32"
      },
      {
        internalType: "address",
        name: "destinationAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "bool",
        name: "forceUpdateGlobalExitRoot",
        type: "bool"
      },
      {
        internalType: "bytes",
        name: "permitData",
        type: "bytes"
      }
    ],
    name: "bridgeAsset",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "destinationNetwork",
        type: "uint32"
      },
      {
        internalType: "address",
        name: "destinationAddress",
        type: "address"
      },
      {
        internalType: "bool",
        name: "forceUpdateGlobalExitRoot",
        type: "bool"
      },
      {
        internalType: "bytes",
        name: "metadata",
        type: "bytes"
      }
    ],
    name: "bridgeMessage",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32[32]",
        name: "smtProof",
        type: "bytes32[32]"
      },
      {
        internalType: "uint32",
        name: "index",
        type: "uint32"
      },
      {
        internalType: "bytes32",
        name: "mainnetExitRoot",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "rollupExitRoot",
        type: "bytes32"
      },
      {
        internalType: "uint32",
        name: "originNetwork",
        type: "uint32"
      },
      {
        internalType: "address",
        name: "originTokenAddress",
        type: "address"
      },
      {
        internalType: "uint32",
        name: "destinationNetwork",
        type: "uint32"
      },
      {
        internalType: "address",
        name: "destinationAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "metadata",
        type: "bytes"
      }
    ],
    name: "claimAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32[32]",
        name: "smtProof",
        type: "bytes32[32]"
      },
      {
        internalType: "uint32",
        name: "index",
        type: "uint32"
      },
      {
        internalType: "bytes32",
        name: "mainnetExitRoot",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "rollupExitRoot",
        type: "bytes32"
      },
      {
        internalType: "uint32",
        name: "originNetwork",
        type: "uint32"
      },
      {
        internalType: "address",
        name: "originAddress",
        type: "address"
      },
      {
        internalType: "uint32",
        name: "destinationNetwork",
        type: "uint32"
      },
      {
        internalType: "address",
        name: "destinationAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "metadata",
        type: "bytes"
      }
    ],
    name: "claimMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "deactivateEmergencyState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_networkID",
        type: "uint32"
      },
      {
        internalType: "contract IBasePolygonZkEVMGlobalExitRoot",
        name: "_globalExitRootManager",
        type: "address"
      },
      {
        internalType: "address",
        name: "_polygonZkEVMaddress",
        type: "address"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "updateGlobalExitRoot",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "resume",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "stop",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_depositContract",
        type: "address"
      },
      {
        name: "_oracle",
        type: "address"
      },
      {
        name: "_operators",
        type: "address"
      },
      {
        name: "_treasury",
        type: "address"
      },
      {
        name: "_insuranceFund",
        type: "address"
      }
    ],
    name: "initialize",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_maxStakeLimit",
        type: "uint256"
      },
      {
        name: "_stakeLimitIncreasePerBlock",
        type: "uint256"
      }
    ],
    name: "setStakingLimit",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "receiveELRewards",
    outputs: [],
    payable: !0,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_limitPoints",
        type: "uint16"
      }
    ],
    name: "setELRewardsWithdrawalLimit",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_beaconValidators",
        type: "uint256"
      },
      {
        name: "_beaconBalance",
        type: "uint256"
      }
    ],
    name: "handleOracleReport",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "resumeStaking",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_executionLayerRewardsVault",
        type: "address"
      }
    ],
    name: "setELRewardsVault",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_treasuryFeeBasisPoints",
        type: "uint16"
      },
      {
        name: "_insuranceFeeBasisPoints",
        type: "uint16"
      },
      {
        name: "_operatorsFeeBasisPoints",
        type: "uint16"
      }
    ],
    name: "setFeeDistribution",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_feeBasisPoints",
        type: "uint16"
      }
    ],
    name: "setFee",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_recipient",
        type: "address"
      },
      {
        name: "_sharesAmount",
        type: "uint256"
      }
    ],
    name: "transferShares",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_maxDeposits",
        type: "uint256"
      }
    ],
    name: "depositBufferedEther",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_token",
        type: "address"
      }
    ],
    name: "transferToVault",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_referral",
        type: "address"
      }
    ],
    name: "submit",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: !0,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "removeStakingLimit",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_oracle",
        type: "address"
      },
      {
        name: "_treasury",
        type: "address"
      },
      {
        name: "_insuranceFund",
        type: "address"
      }
    ],
    name: "setProtocolContracts",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_withdrawalCredentials",
        type: "bytes32"
      }
    ],
    name: "setWithdrawalCredentials",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "depositBufferedEther",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [
      {
        name: "_account",
        type: "address"
      },
      {
        name: "_sharesAmount",
        type: "uint256"
      }
    ],
    name: "burnShares",
    outputs: [
      {
        name: "newTotalShares",
        type: "uint256"
      }
    ],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "pauseStaking",
    outputs: [],
    payable: !1,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "recipients",
        type: "address[]"
      }
    ],
    name: "adminMintContributorNfts",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      }
    ],
    name: "adminMintTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "adminSetFrozen",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "contributorTokenUri",
        type: "string"
      },
      {
        internalType: "string",
        name: "openEditionTokenUri",
        type: "string"
      }
    ],
    name: "adminSetTokenUris",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "publicMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "setActive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "addr",
        type: "address"
      }
    ],
    name: "reclaimAndSetAddr",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "resolver",
        type: "address"
      }
    ],
    name: "setDefaultResolver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: !1,
    inputs: [],
    name: "deposit",
    outputs: [],
    payable: !0,
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "daiAmount",
        type: "uint256"
      }
    ],
    name: "depositDAI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "daiAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "depositDAIWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "stETHAmount",
        type: "uint256"
      }
    ],
    name: "depositStETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "stETHAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "depositStETHWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "usdcAmount",
        type: "uint256"
      }
    ],
    name: "depositUSDC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "usdcAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "depositUSDCWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "usdtAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minDAIAmount",
        type: "uint256"
      }
    ],
    name: "depositUSDT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "mainnetBridge",
        type: "address"
      }
    ],
    name: "enableTransition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "open",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_staker",
        type: "address"
      }
    ],
    name: "setStaker",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "stakeETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "stakeUSD",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "totalUSDBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "transition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "chainId",
            type: "uint256"
          },
          {
            internalType: "uint16",
            name: "layerZeroChainId",
            type: "uint16"
          }
        ],
        internalType: "struct StargateFacet.ChainIdConfig[]",
        name: "chainIdConfigs",
        type: "tuple[]"
      }
    ],
    name: "initStargate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_chainId",
        type: "uint256"
      },
      {
        internalType: "uint16",
        name: "_layerZeroChainId",
        type: "uint16"
      }
    ],
    name: "setLayerZeroChainId",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "transactionId",
            type: "bytes32"
          },
          {
            internalType: "string",
            name: "bridge",
            type: "string"
          },
          {
            internalType: "string",
            name: "integrator",
            type: "string"
          },
          {
            internalType: "address",
            name: "referrer",
            type: "address"
          },
          {
            internalType: "address",
            name: "sendingAssetId",
            type: "address"
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "minAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "destinationChainId",
            type: "uint256"
          },
          {
            internalType: "bool",
            name: "hasSourceSwaps",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "hasDestinationCall",
            type: "bool"
          }
        ],
        internalType: "struct ILiFi.BridgeData",
        name: "_bridgeData",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "srcPoolId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "dstPoolId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "minAmountLD",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "dstGasForCall",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "lzFee",
            type: "uint256"
          },
          {
            internalType: "address payable",
            name: "refundAddress",
            type: "address"
          },
          {
            internalType: "bytes",
            name: "callTo",
            type: "bytes"
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes"
          }
        ],
        internalType: "struct StargateFacet.StargateData",
        name: "_stargateData",
        type: "tuple"
      }
    ],
    name: "startBridgeTokensViaStargate",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "transactionId",
            type: "bytes32"
          },
          {
            internalType: "string",
            name: "bridge",
            type: "string"
          },
          {
            internalType: "string",
            name: "integrator",
            type: "string"
          },
          {
            internalType: "address",
            name: "referrer",
            type: "address"
          },
          {
            internalType: "address",
            name: "sendingAssetId",
            type: "address"
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "minAmount",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "destinationChainId",
            type: "uint256"
          },
          {
            internalType: "bool",
            name: "hasSourceSwaps",
            type: "bool"
          },
          {
            internalType: "bool",
            name: "hasDestinationCall",
            type: "bool"
          }
        ],
        internalType: "struct ILiFi.BridgeData",
        name: "_bridgeData",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "address",
            name: "callTo",
            type: "address"
          },
          {
            internalType: "address",
            name: "approveTo",
            type: "address"
          },
          {
            internalType: "address",
            name: "sendingAssetId",
            type: "address"
          },
          {
            internalType: "address",
            name: "receivingAssetId",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "fromAmount",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes"
          },
          {
            internalType: "bool",
            name: "requiresDeposit",
            type: "bool"
          }
        ],
        internalType: "struct LibSwap.SwapData[]",
        name: "_swapData",
        type: "tuple[]"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "srcPoolId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "dstPoolId",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "minAmountLD",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "dstGasForCall",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "lzFee",
            type: "uint256"
          },
          {
            internalType: "address payable",
            name: "refundAddress",
            type: "address"
          },
          {
            internalType: "bytes",
            name: "callTo",
            type: "bytes"
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes"
          }
        ],
        internalType: "struct StargateFacet.StargateData",
        name: "_stargateData",
        type: "tuple"
      }
    ],
    name: "swapAndStartBridgeTokensViaStargate",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address"
      },
      {
        internalType: "address",
        name: "_to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256"
      },
      {
        internalType: "address payable",
        name: "_feeRecipient",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "_calldata",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "_nonce",
        type: "uint256"
      }
    ],
    name: "claimMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "blockRootHash",
            type: "bytes32"
          },
          {
            internalType: "uint32",
            name: "l2BlockTimestamp",
            type: "uint32"
          },
          {
            internalType: "bytes[]",
            name: "transactions",
            type: "bytes[]"
          },
          {
            internalType: "bytes32[]",
            name: "l2ToL1MsgHashes",
            type: "bytes32[]"
          },
          {
            internalType: "bytes",
            name: "fromAddresses",
            type: "bytes"
          },
          {
            internalType: "uint16[]",
            name: "batchReceptionIndices",
            type: "uint16[]"
          }
        ],
        internalType: "struct IZkEvmV2.BlockData[]",
        name: "_blocksData",
        type: "tuple[]"
      },
      {
        internalType: "bytes",
        name: "_proof",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "_proofType",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "_parentStateRootHash",
        type: "bytes32"
      }
    ],
    name: "finalizeBlocks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "blockRootHash",
            type: "bytes32"
          },
          {
            internalType: "uint32",
            name: "l2BlockTimestamp",
            type: "uint32"
          },
          {
            internalType: "bytes[]",
            name: "transactions",
            type: "bytes[]"
          },
          {
            internalType: "bytes32[]",
            name: "l2ToL1MsgHashes",
            type: "bytes32[]"
          },
          {
            internalType: "bytes",
            name: "fromAddresses",
            type: "bytes"
          },
          {
            internalType: "uint16[]",
            name: "batchReceptionIndices",
            type: "uint16[]"
          }
        ],
        internalType: "struct IZkEvmV2.BlockData[]",
        name: "_blocksData",
        type: "tuple[]"
      }
    ],
    name: "finalizeBlocksWithoutProof",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_initialStateRootHash",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "_initialL2BlockNumber",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_defaultVerifier",
        type: "address"
      },
      {
        internalType: "address",
        name: "_securityCouncil",
        type: "address"
      },
      {
        internalType: "address[]",
        name: "_operators",
        type: "address[]"
      },
      {
        internalType: "uint256",
        name: "_rateLimitPeriodInSeconds",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_rateLimitAmountInWei",
        type: "uint256"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_pauseType",
        type: "bytes32"
      }
    ],
    name: "pauseByType",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "resetAmountUsedInPeriod",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "resetRateLimitAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "_calldata",
        type: "bytes"
      }
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newVerifierAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_proofType",
        type: "uint256"
      }
    ],
    name: "setVerifierAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_pauseType",
        type: "bytes32"
      }
    ],
    name: "unPauseByType",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_roleSetter",
        type: "address"
      },
      {
        internalType: "contract IWETH",
        name: "_wrappedToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_roninChainId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_numerator",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_highTierVWNumerator",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_denominator",
        type: "uint256"
      },
      {
        internalType: "address[][3]",
        name: "_addresses",
        type: "address[][3]"
      },
      {
        internalType: "uint256[][4]",
        name: "_thresholds",
        type: "uint256[][4]"
      },
      {
        internalType: "enum Token.Standard[]",
        name: "_standards",
        type: "uint8[]"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "bridgeManagerContract",
        type: "address"
      }
    ],
    name: "initializeV2",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "enum ContractType",
        name: "contractType",
        type: "uint8"
      },
      {
        internalType: "address",
        name: "addr",
        type: "address"
      }
    ],
    name: "setContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address"
      }
    ],
    name: "setEmergencyPauser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address"
      }
    ],
    name: "blacklist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "authorizer",
        type: "address"
      },
      {
        internalType: "bytes32",
        name: "nonce",
        type: "bytes32"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "cancelAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "minter",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "minterAllowedAmount",
        type: "uint256"
      }
    ],
    name: "configureMinter",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "tokenName",
        type: "string"
      },
      {
        internalType: "string",
        name: "tokenSymbol",
        type: "string"
      },
      {
        internalType: "string",
        name: "tokenCurrency",
        type: "string"
      },
      {
        internalType: "uint8",
        name: "tokenDecimals",
        type: "uint8"
      },
      {
        internalType: "address",
        name: "newMasterMinter",
        type: "address"
      },
      {
        internalType: "address",
        name: "newPauser",
        type: "address"
      },
      {
        internalType: "address",
        name: "newBlacklister",
        type: "address"
      },
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "newName",
        type: "string"
      }
    ],
    name: "initializeV2",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "lostAndFound",
        type: "address"
      }
    ],
    name: "initializeV2_1",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "validAfter",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "validBefore",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "nonce",
        type: "bytes32"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "receiveWithAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "minter",
        type: "address"
      }
    ],
    name: "removeMinter",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "tokenContract",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "rescueERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "validAfter",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "validBefore",
        type: "uint256"
      },
      {
        internalType: "bytes32",
        name: "nonce",
        type: "bytes32"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "transferWithAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address"
      }
    ],
    name: "unBlacklist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newBlacklister",
        type: "address"
      }
    ],
    name: "updateBlacklister",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newMasterMinter",
        type: "address"
      }
    ],
    name: "updateMasterMinter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newPauser",
        type: "address"
      }
    ],
    name: "updatePauser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newRescuer",
        type: "address"
      }
    ],
    name: "updateRescuer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "_amount",
        type: "uint128"
      }
    ],
    name: "addEthAmountLockedForWithdrawal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_validatorIds",
        type: "uint256[]"
      },
      {
        internalType: "bytes[]",
        name: "_pubKey",
        type: "bytes[]"
      },
      {
        internalType: "bytes[]",
        name: "_signature",
        type: "bytes[]"
      }
    ],
    name: "batchApproveRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_validatorIds",
        type: "uint256[]"
      }
    ],
    name: "batchCancelDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_validatorIds",
        type: "uint256[]"
      },
      {
        internalType: "address",
        name: "_bnftStaker",
        type: "address"
      }
    ],
    name: "batchCancelDepositByAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_candidateBidIds",
        type: "uint256[]"
      },
      {
        internalType: "uint256",
        name: "_numberOfValidators",
        type: "uint256"
      }
    ],
    name: "batchDepositAsBnftHolder",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_depositRoot",
        type: "bytes32"
      },
      {
        internalType: "uint256[]",
        name: "_validatorIds",
        type: "uint256[]"
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "publicKey",
            type: "bytes"
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
          },
          {
            internalType: "bytes32",
            name: "depositDataRoot",
            type: "bytes32"
          },
          {
            internalType: "string",
            name: "ipfsHashForEncryptedValidatorKey",
            type: "string"
          }
        ],
        internalType: "struct IStakingManager.DepositData[]",
        name: "_registerValidatorDepositData",
        type: "tuple[]"
      },
      {
        internalType: "bytes32[]",
        name: "_depositDataRootApproval",
        type: "bytes32[]"
      },
      {
        internalType: "bytes[]",
        name: "_signaturesForApprovalDeposit",
        type: "bytes[]"
      }
    ],
    name: "batchRegisterAsBnftHolder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_bNftHolder",
        type: "address"
      }
    ],
    name: "deRegisterBnftHolder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "numberOfEethValidators",
        type: "uint32"
      },
      {
        internalType: "uint32",
        name: "numberOfEtherFanValidators",
        type: "uint32"
      }
    ],
    name: "decreaseSourceOfFundsValidators",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_referral",
        type: "address"
      }
    ],
    name: "deposit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address"
      },
      {
        internalType: "address",
        name: "_referral",
        type: "address"
      }
    ],
    name: "deposit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_referral",
        type: "address"
      }
    ],
    name: "depositToRecipient",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_eEthAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "_stakingManagerAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "_nodesManagerAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "_membershipManagerAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "_tNftAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "_etherFiAdminContract",
        type: "address"
      },
      {
        internalType: "address",
        name: "_withdrawRequestNFT",
        type: "address"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_auctionManager",
        type: "address"
      },
      {
        internalType: "address",
        name: "_liquifier",
        type: "address"
      }
    ],
    name: "initializeOnUpgrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "pauseContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "int128",
        name: "_accruedRewards",
        type: "int128"
      }
    ],
    name: "rebase",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address"
      }
    ],
    name: "registerAsBnftHolder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256"
      }
    ],
    name: "requestMembershipNFTWithdraw",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "requestWithdraw",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256"
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8"
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32"
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32"
          }
        ],
        internalType: "struct ILiquidityPool.PermitInput",
        name: "_permit",
        type: "tuple"
      }
    ],
    name: "requestWithdrawWithPermit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_validatorIds",
        type: "uint256[]"
      }
    ],
    name: "sendExitRequests",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "_newSize",
        type: "uint128"
      }
    ],
    name: "setNumValidatorsToSpinUpInBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_restake",
        type: "bool"
      }
    ],
    name: "setRestakeBnftDeposits",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_eEthWeight",
        type: "uint32"
      },
      {
        internalType: "uint32",
        name: "_etherFanWeight",
        type: "uint32"
      }
    ],
    name: "setStakingTargetWeights",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "unPauseContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address"
      },
      {
        internalType: "bool",
        name: "_isAdmin",
        type: "bool"
      }
    ],
    name: "updateAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_value",
        type: "bool"
      }
    ],
    name: "updateWhitelistStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_users",
        type: "address[]"
      },
      {
        internalType: "bool",
        name: "_value",
        type: "bool"
      }
    ],
    name: "updateWhitelistedAddresses",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "withdraw",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_newCollateralToken",
        type: "address"
      }
    ],
    name: "addCollateralToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IOperatorDelegator",
        name: "_newOperatorDelegator",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_allocationBasisPoints",
        type: "uint256"
      }
    ],
    name: "addOperatorDelegator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IStrategy[]",
            name: "strategies",
            type: "address[]"
          },
          {
            internalType: "uint256[]",
            name: "shares",
            type: "uint256[]"
          },
          {
            internalType: "address",
            name: "depositor",
            type: "address"
          },
          {
            components: [
              {
                internalType: "address",
                name: "withdrawer",
                type: "address"
              },
              {
                internalType: "uint96",
                name: "nonce",
                type: "uint96"
              }
            ],
            internalType: "struct IStrategyManager.WithdrawerAndNonce",
            name: "withdrawerAndNonce",
            type: "tuple"
          },
          {
            internalType: "uint32",
            name: "withdrawalStartBlock",
            type: "uint32"
          },
          {
            internalType: "address",
            name: "delegatedAddress",
            type: "address"
          }
        ],
        internalType: "struct IStrategyManager.QueuedWithdrawal",
        name: "withdrawal",
        type: "tuple"
      },
      {
        internalType: "uint256",
        name: "middlewareTimesIndex",
        type: "uint256"
      }
    ],
    name: "completeWithdraw",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_collateralToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_referralId",
        type: "uint256"
      }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_collateralToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_referralId",
        type: "uint256"
      }
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "depositTokenRewardsFromProtocol",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IRoleManager",
        name: "_roleManager",
        type: "address"
      },
      {
        internalType: "contract IEzEthToken",
        name: "_ezETH",
        type: "address"
      },
      {
        internalType: "contract IRenzoOracle",
        name: "_renzoOracle",
        type: "address"
      },
      {
        internalType: "contract IStrategyManager",
        name: "_strategyManager",
        type: "address"
      },
      {
        internalType: "contract IDelegationManager",
        name: "_delegationManager",
        type: "address"
      },
      {
        internalType: "contract IDepositQueue",
        name: "_depositQueue",
        type: "address"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_collateralTokenToRemove",
        type: "address"
      }
    ],
    name: "removeCollateralToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IOperatorDelegator",
        name: "_operatorDelegatorToRemove",
        type: "address"
      }
    ],
    name: "removeOperatorDelegator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_maxDepositTVL",
        type: "uint256"
      }
    ],
    name: "setMaxDepositTVL",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IOperatorDelegator",
        name: "_operatorDelegator",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_allocationBasisPoints",
        type: "uint256"
      }
    ],
    name: "setOperatorDelegatorAllocation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_paused",
        type: "bool"
      }
    ],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "contract IOperatorDelegator",
        name: "operatorDelegator",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "pubkey",
        type: "bytes"
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes"
      },
      {
        internalType: "bytes32",
        name: "depositDataRoot",
        type: "bytes32"
      }
    ],
    name: "stakeEthInOperatorDelegator",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_ezEThToBurn",
        type: "uint256"
      },
      {
        internalType: "contract IERC20",
        name: "_tokenToWithdraw",
        type: "address"
      }
    ],
    name: "startWithdraw",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_networkID",
        type: "uint32"
      },
      {
        internalType: "contract IBasePolygonZkEVMGlobalExitRoot",
        name: "_globalExitRootManager",
        type: "address"
      },
      {
        internalType: "address",
        name: "_polygonZkEVMaddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "_admin",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_bridgeFee",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_feeAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "_gasTokenAddress",
        type: "address"
      },
      {
        internalType: "bytes",
        name: "_gasTokenMetadata",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "_gasTokenDecimalDiffFactor",
        type: "uint256"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_feeAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_bridgeFee",
        type: "uint256"
      }
    ],
    name: "setBridgeSettingsFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];
new Ai(Ei);
const Wn = (s) => Number.isSafeInteger(s) && s > 0 && s <= Ia.MAX_SAFE_CHAIN_ID, la = (s) => {
  if (typeof s == "number")
    return { valid: Wn(s), chainId: s };
  if (typeof s == "string")
    try {
      let e;
      return s.toLowerCase().startsWith("0x") ? e = parseInt(s, 16) : e = parseInt(s, 10), {
        valid: Wn(e),
        chainId: e
      };
    } catch {
      return { valid: !1, chainId: 0 };
    }
  return { valid: !1, chainId: s };
};
class Xt extends Error {
  constructor(t, n) {
    super();
    _e(this, "code");
    this.code = t, this.message = n;
  }
  toString() {
    return `${this.message} (${this.code})`;
  }
}
const Gn = (s) => {
  if (!s)
    return "1";
  const { chainId: e, valid: t } = la(s);
  return t ? `${e}` : "1";
};
class Yt extends vn {
  constructor() {
    super();
    _e(this, "chain", ht.ETH);
    _e(this, "address", null);
    _e(this, "ready");
    _e(this, "_chainId");
    _e(this, "isDebug");
    this._setInitialChainId();
  }
  _setInitialChainId() {
    this._getGlobalChainId().then((t) => {
      const n = Gn(t ?? "0x1");
      this.emitChainChanged(t ?? "0x1"), this.emitNetworkChanged(n), console.log("_setInitialChainId", n);
    }).catch((t) => {
      console.log("_setInitialChainId", t), this.emitChainChanged("0x1"), this.emitNetworkChanged("1");
    });
  }
  async _setGlobalChainId(t) {
    const n = await this.send(
      "_setGlobalChainId",
      t
    );
    return console.log("_setGlobalChainId", n), n ?? "";
  }
  async _getGlobalChainId() {
    const t = await this.send("_getGlobalChainId", {});
    return console.log("_getGlobalChainId", t), t ?? "0x1";
  }
  get isMetaMask() {
    return !0;
  }
  get isConnected() {
    return !!this.address;
  }
  get chainId() {
    return this._chainId ?? "0x1";
  }
  get networkVersion() {
    const t = Gn(this._chainId ?? "0x1");
    return console.log("get networkVersion", t), t;
  }
  emitConnect(t) {
    this.emit("connect", { chainId: t });
  }
  emitChainChanged(t) {
    this.emit("chainChanged", t);
  }
  emitNetworkChanged(t) {
    this.emit("networkChanged", t);
  }
  get selectedAddress() {
    return this.address;
  }
  request(t) {
    console.log("====>EthProvider request", t);
    var n = this;
    return this instanceof Yt || (n = window.ethereum), n._request(t);
  }
  _wrapResult(t, n) {
    let d = { jsonrpc: "2.0", id: t.id };
    return n !== null && typeof n == "object" && n.jsonrpc && n.result ? d.result = n.result : d.result = n, d;
  }
  async _request(t) {
    switch (t.method) {
      case "eth_requestAccounts":
        return this.eth_requestAccounts(t);
      case "eth_accounts":
        return this.eth_accounts(t);
      case "eth_coinbase":
        return this.eth_coinbase(t);
      case "net_version":
        return this.net_version(t);
      case "eth_chainId":
        return this.eth_chainId(t);
      case "eth_sign":
        throw new Xt(
          4200,
          "FoxWallet does not support eth_sign. Please use other sign method instead."
        );
      case "personal_sign":
        return this.personal_sign(t);
      case "personal_ecRecover":
        return this.personal_ecRecover(t);
      case "eth_signTypedData_v3":
        return this.eth_signTypedData_v3(t);
      case "eth_signTypedData_v4":
        return this.eth_signTypedData_v4(t);
      case "eth_signTypedData":
        return this.eth_signTypedData(t);
      case "eth_sendTransaction":
        return this.eth_sendTransaction(t);
      case "wallet_watchAsset":
        return this.wallet_watchAsset(t);
      case "wallet_addEthereumChain":
        return this.wallet_addEthereumChain(t);
      case "wallet_switchEthereumChain":
        return this.wallet_switchEthereumChain(t);
      case "wallet_requestPermissions":
        return this.wallet_requestPermissions(t);
      case "wallet_getPermissions":
        return this.wallet_getPermissions(t);
      case "wallet_revokePermissions":
        return this.wallet_revokePermissions(t);
      case "eth_newFilter":
      case "eth_newBlockFilter":
      case "eth_newPendingTransactionFilter":
      case "eth_uninstallFilter":
      case "eth_subscribe":
        throw new Xt(
          4200,
          `Fox does not support calling ${t.method}. Please use your own solution`
        );
      default:
        console.log("unhandled", t), t.jsonrpc = "2.0";
        const n = await this.proxyRPCCall(t);
        return console.log(`<== rpc response ${JSON.stringify(n)}`), n == null ? void 0 : n.result;
    }
  }
  async proxyRPCCall(t) {
    return this.send("proxyRPCCall", t);
  }
  /**
   * @deprecated Use request() method instead.
   */
  sendAsync(t, n) {
    console.log(
      "sendAsync(data, callback) is deprecated, please use window.ethereum.request(data) instead."
    );
    var d = this;
    this instanceof Yt || (d = window.ethereum), Array.isArray(t) ? Promise.all(
      t.map(
        (y) => d._request(y).then((T) => n(null, this._wrapResult(y, T))).catch((T) => n(T, null))
      )
    ) : d._request(t).then((y) => n(null, this._wrapResult(t, y))).catch((y) => n(y, null));
  }
  async eth_accounts(t) {
    console.log("eth_accounts", t);
    const n = await this.send(
      "eth_accounts",
      t
    );
    return console.log("accountsInfo", n), this.emitChainChanged(await this.eth_chainId({})), this.emitNetworkChanged(await this.net_version({})), n[0] && (this.address = n[0]), n ?? [];
  }
  async eth_requestAccounts(t) {
    const n = await this.send("eth_requestAccounts", t);
    return console.log("newAccounts", n), this.emitConnect(await this.eth_chainId({})), this.emitChainChanged(await this.eth_chainId({})), n[0] && (this.address = n[0]), n;
  }
  async eth_coinbase(t) {
    const n = await this.eth_accounts(t);
    return (n == null ? void 0 : n[0]) || null;
  }
  async net_version(t) {
    return this.networkVersion;
  }
  async eth_chainId(t) {
    return this.chainId;
  }
  async wallet_requestPermissions(t) {
    const n = await this.send("wallet_requestPermissions", t);
    return console.log("wallet_requestPermissions", n), n;
  }
  async wallet_getPermissions(t) {
    const n = await this.send("wallet_getPermissions", t);
    return console.log("wallet_getPermissions", n), n;
  }
  async wallet_revokePermissions(t) {
    const n = await this.send("wallet_revokePermissions", t);
    return console.log("wallet_revokePermissions", n), n;
  }
  async personal_sign(t) {
    const n = await this.send("personal_sign", t);
    return console.log("personal_sign", n), n;
  }
  async personal_ecRecover(t) {
    const n = await this.send("personal_ecRecover", t);
    return console.log("personal_ecRecover", n), n;
  }
  async eth_signTypedData_v3(t) {
    const n = await this.send("eth_signTypedData_v3", t);
    return console.log("eth_signTypedData_v3", n), n;
  }
  async eth_signTypedData_v4(t) {
    const n = await this.send("eth_signTypedData_v4", t);
    return console.log("eth_signTypedData_v4", n), n;
  }
  async eth_signTypedData(t) {
    const n = await this.send("eth_signTypedData", t);
    return console.log("eth_signTypedData", n), n;
  }
  async eth_sendTransaction(t) {
    const n = await this.send("eth_sendTransaction", t);
    return console.log("eth_sendTransaction", n), n;
  }
  async wallet_watchAsset(t) {
    const n = await this.send("wallet_watchAsset", t);
    return console.log("wallet_watchAsset", n), n;
  }
  async wallet_addEthereumChain(t) {
    const n = await this.send("wallet_addEthereumChain", t);
    return console.log("wallet_addEthereumChain", n), n;
  }
  async wallet_switchEthereumChain(t) {
    const n = await this.send("wallet_switchEthereumChain", t);
    return console.log("wallet_switchEthereumChain", n), n;
  }
  sendResponse(t, n) {
    let d = { jsonrpc: "2.0", id: t };
    return n !== null && typeof n == "object" && n.jsonrpc && n.result ? d.result = n.result : d.result = n, d;
  }
  send(t, n) {
    return super.send(t, n, {
      network: this.chainId
    });
  }
  emit(t, n) {
    switch (super.emit(t, n), console.log("eth emit", t, n), t) {
      case "chainChanged":
        typeof n == "string" && n && (this._chainId = n, this._setGlobalChainId(n).catch((d) => {
          console.log("_setGlobalChainId", d);
        }));
        break;
      case "networkChanged":
        break;
      case "accountsChanged":
        typeof (n == null ? void 0 : n[0]) == "string" && (n != null && n[0]) && (this.address = n[0]);
        break;
      case "connect":
        typeof (n == null ? void 0 : n.chainId) == "string" && (n != null && n.chainId) && (this._chainId = n.chainId);
        break;
    }
  }
  onDappEmit(t) {
    const { detail: n } = t, { type: d, coinType: y, event: T, data: _ } = n;
    y === ht.ETH && this.emit(T, _);
  }
}
const Kn = {
  SVG_ICON: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCA5MDAgOTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjkwMCIgcng9IjQ1MCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01NzcuMjQ5IDIxNS45NzVDNTM5Ljk1NiAxOTYuMjMyIDUxMS42NDYgMTYxLjU0OSA1MDAuNDY4IDExOS44NjhDNDk3LjAyMSAxMzIuNjEzIDQ5NS4yNDUgMTQ1Ljk4NCA0OTUuMjQ1IDE1OS43NzRDNDk1LjI0NSAxNzAuNTMzIDQ5Ni4zOTQgMTgwLjk4IDQ5OC40ODMgMTkxLjExM0M0OTguNDgzIDE5MS4xMTMgNDk4LjQ4MyAxOTEuMTEzIDQ5OC40ODMgMTkxLjIxN0M0OTguNDgzIDE5MS4zMjIgNDk4LjU4OCAxOTEuNTMxIDQ5OC41ODggMTkxLjYzNUM1MDEuNDA4IDIwNS4yMTYgNTA2LjAwNSAyMTguMDY1IDUxMi4xNjggMjI5Ljk3NEM0OTkuMDA2IDIyMC4yNTggNDg3LjMwNiAyMDguNjYzIDQ3Ny40ODYgMTk1LjYwNUM0NjQuMzIzIDI5Ny42NjcgNTAxLjQwOCA0MDMuOTA3IDU2OS4yMDYgNDczLjg5OEM2NTcuNjg3IDU3Ni45IDU3Ni4xIDc1MS42NjkgNDM4LjIwNyA3NDcuMDczQzI0My4wNjggNzQ4Ljc0NCAyMDkuNjM5IDQ2MS4zNjIgMzk2LjgzOSA0MTYuMjM0TDM5Ni43MzUgNDE1LjcxMUM0NDYuNjY5IDM5OS41MTkgNDcwLjA2OSAzNjcuMDMxIDQ3NC4xNDMgMzI0LjgyN0M0MDIuMDYzIDM4My4yMjMgMjg4LjE5NiAzMTAuODI5IDMxMS44MDUgMjIwLjE1NEM0MS4yNDI1IDM1My4zNDYgMTQxLjczNyA3ODUuNDExIDQ0OC40NDUgNzgwLjA4M0M1ODIuMDU1IDc4MC4wODMgNjk1LjA4NSA2OTEuNzA2IDczMi4xNyA1NzAuMjE0Qzc3Ni40NjMgNDI4LjU2MSA3MDQuOCAyNzcuNjA5IDU3Ny4yNDkgMjE1Ljk3NVoiIGZpbGw9IiMxMkZFNzQiLz4KPC9zdmc+Cg==",
  EIP6963_UUID: "8e014263-cedf-54f2-a932-ec940b52f9c3"
}, Zn = (s) => {
  if (!s)
    return "81";
  const { chainId: e, valid: t } = la(s);
  return t ? `${e}` : "81";
};
class en extends vn {
  constructor() {
    super();
    _e(this, "chain", ht.QTUM);
    _e(this, "address", null);
    _e(this, "ready");
    _e(this, "_chainId");
    _e(this, "isDebug");
    this._setInitialChainId();
  }
  _setInitialChainId() {
    this._getGlobalChainId().then((t) => {
      const n = Zn(t ?? "0x51");
      this.emitChainChanged(t ?? "0x51"), this.emitNetworkChanged(n), console.log("_setInitialChainId", n);
    }).catch((t) => {
      console.log("_setInitialChainId", t), this.emitChainChanged("0x51"), this.emitNetworkChanged("81");
    });
  }
  async _setGlobalChainId(t) {
    const n = await this.send(
      "_setGlobalChainId",
      t
    );
    return console.log("_setGlobalChainId", n), n ?? "";
  }
  async _getGlobalChainId() {
    const t = await this.send("_getGlobalChainId", {});
    return console.log("_getGlobalChainId", t), t ?? "0x51";
  }
  get isMetaMask() {
    return !0;
  }
  get isConnected() {
    return !!this.address;
  }
  get chainId() {
    let t = this._chainId ?? "0x" + 81 .toString(16);
    return console.log("get chainId", t), t;
  }
  get networkVersion() {
    const t = Zn(this._chainId ?? "0x51");
    return console.log("get networkVersion", t), t;
  }
  emitConnect(t) {
    this.emit("connect", { chainId: t });
  }
  emitChainChanged(t) {
    console.log("emit chainChanged", t), this.emit("chainChanged", t);
  }
  emitNetworkChanged(t) {
    console.log("emit networkVersion", t), this.emit("networkChanged", t);
  }
  get selectedAddress() {
    var t;
    return (t = this.address) == null ? void 0 : t.evmAddress;
  }
  request(t) {
    console.log("====>qtumProvider request", t);
    var n = this;
    return this instanceof en || (n = window.qtum), n._request(t);
  }
  _wrapResult(t, n) {
    let d = { jsonrpc: "2.0", id: t.id };
    return n !== null && typeof n == "object" && n.jsonrpc && n.result ? d.result = n.result : d.result = n, d;
  }
  async _request(t) {
    switch (t.method) {
      case "eth_requestAccounts":
        return this.eth_requestAccounts(t);
      case "eth_accounts":
        return this.eth_accounts(t);
      case "eth_coinbase":
        return this.eth_coinbase(t);
      case "net_version":
        return this.net_version(t);
      case "eth_chainId":
        return this.eth_chainId(t);
      case "eth_sign":
        throw new Xt(
          4200,
          "FoxWallet does not support eth_sign. Please use other sign method instead."
        );
      case "personal_sign":
        return this.personal_sign(t);
      case "personal_ecRecover":
        return this.personal_ecRecover(t);
      case "eth_signTypedData_v3":
        return this.eth_signTypedData_v3(t);
      case "eth_signTypedData_v4":
        return this.eth_signTypedData_v4(t);
      case "eth_signTypedData":
        return this.eth_signTypedData(t);
      case "eth_sendTransaction":
        return this.eth_sendTransaction(t);
      case "wallet_watchAsset":
        return this.wallet_watchAsset(t);
      case "wallet_addEthereumChain":
        return this.wallet_addEthereumChain(t);
      case "wallet_switchEthereumChain":
        return this.wallet_switchEthereumChain(t);
      case "wallet_requestPermissions":
        return this.wallet_requestPermissions(t);
      case "wallet_getPermissions":
        return this.wallet_getPermissions(t);
      case "wallet_revokePermissions":
        return this.wallet_revokePermissions(t);
      case "eth_newFilter":
      case "eth_newBlockFilter":
      case "eth_newPendingTransactionFilter":
      case "eth_uninstallFilter":
      case "eth_subscribe":
        throw new Xt(
          4200,
          `Fox does not support calling ${t.method}. Please use your own solution`
        );
      default:
        console.log("unhandled", t), t.jsonrpc = "2.0";
        const n = await this.proxyRPCCall(t);
        return console.log(`<== rpc response ${JSON.stringify(n)}`), n == null ? void 0 : n.result;
    }
  }
  async proxyRPCCall(t) {
    return this.send("proxyRPCCall", t);
  }
  /**
   * @deprecated Use request() method instead.
   */
  sendAsync(t, n) {
    console.log(
      "sendAsync(data, callback) is deprecated, please use window.ethereum.request(data) instead."
    );
    var d = this;
    this instanceof en || (d = window.qtum), Array.isArray(t) ? Promise.all(
      t.map(
        (y) => d._request(y).then((T) => n(null, this._wrapResult(y, T))).catch((T) => n(T, null))
      )
    ) : d._request(t).then((y) => n(null, this._wrapResult(t, y))).catch((y) => n(y, null));
  }
  async eth_accounts(t) {
    console.log("eth_accounts", t);
    const n = await this.send(
      "eth_accounts",
      t
    );
    return this.emitChainChanged(await this.eth_chainId({})), this.emitNetworkChanged(await this.net_version({})), n != null && n.length && n.length > 0 ? (this.address = n[0], [n[0].evmAddress]) : [];
  }
  async eth_requestAccounts(t) {
    const n = await this.send("eth_requestAccounts", t);
    return console.log("newAccounts", n), this.emitConnect(await this.eth_chainId({})), this.emitChainChanged(await this.eth_chainId({})), n != null && n.length && n.length > 0 ? (this.address = n[0], [n[0].evmAddress]) : [];
  }
  async eth_coinbase(t) {
    const n = await this.eth_accounts(t);
    return (n == null ? void 0 : n[0]) || null;
  }
  async net_version(t) {
    let n = this.networkVersion;
    return console.log("net_version", n), n;
  }
  async eth_chainId(t) {
    let n = this.chainId;
    return console.log("eth_chainId", n), n;
  }
  async wallet_requestPermissions(t) {
    const n = await this.send("wallet_requestPermissions", t);
    return console.log("wallet_requestPermissions", n), n;
  }
  async wallet_getPermissions(t) {
    const n = await this.send("wallet_getPermissions", t);
    return console.log("wallet_getPermissions", n), n;
  }
  async wallet_revokePermissions(t) {
    const n = await this.send("wallet_revokePermissions", t);
    return console.log("wallet_revokePermissions", n), n;
  }
  async personal_sign(t) {
    const n = await this.send("personal_sign", t);
    return console.log("personal_sign", n), n;
  }
  async personal_ecRecover(t) {
    const n = await this.send("personal_ecRecover", t);
    return console.log("personal_ecRecover", n), n;
  }
  async eth_signTypedData_v3(t) {
    const n = await this.send("eth_signTypedData_v3", t);
    return console.log("eth_signTypedData_v3", n), n;
  }
  async eth_signTypedData_v4(t) {
    const n = await this.send("eth_signTypedData_v4", t);
    return console.log("eth_signTypedData_v4", n), n;
  }
  async eth_signTypedData(t) {
    const n = await this.send("eth_signTypedData", t);
    return console.log("eth_signTypedData", n), n;
  }
  async eth_sendTransaction(t) {
    const n = await this.send("eth_sendTransaction", t);
    return console.log("eth_sendTransaction", n), n;
  }
  async wallet_watchAsset(t) {
    const n = await this.send("wallet_watchAsset", t);
    return console.log("wallet_watchAsset", n), n;
  }
  async wallet_addEthereumChain(t) {
    const n = await this.send("wallet_addEthereumChain", t);
    return console.log("wallet_addEthereumChain", n), n;
  }
  async wallet_switchEthereumChain(t) {
    const n = await this.send("wallet_switchEthereumChain", t);
    return console.log("wallet_switchEthereumChain", n), n;
  }
  sendResponse(t, n) {
    let d = { jsonrpc: "2.0", id: t };
    return n !== null && typeof n == "object" && n.jsonrpc && n.result ? d.result = n.result : d.result = n, d;
  }
  send(t, n) {
    return super.send(t, n, {
      network: this.chainId
    });
  }
  emit(t, n) {
    switch (super.emit(t, n), console.log("qtum emit", t, n), t) {
      case "chainChanged":
        typeof n == "string" && n && (this._chainId = n, this._setGlobalChainId(n).catch((d) => {
          console.log("_setGlobalChainId", d);
        }));
        break;
      case "networkChanged":
        break;
      case "accountsChanged":
        typeof (n == null ? void 0 : n[0]) == "string" && (n != null && n[0]);
        break;
      case "connect":
        typeof (n == null ? void 0 : n.chainId) == "string" && (n != null && n.chainId) && (this._chainId = n.chainId);
        break;
    }
  }
  onDappEmit(t) {
    const { detail: n } = t, { type: d, coinType: y, event: T, data: _ } = n;
    y === ht.QTUM && this.emit(T, _);
  }
}
const ma = new va(), Cn = new Yt(), da = new en();
window.foxwallet = {
  aleo: ma,
  ethereum: Cn,
  qtum: da
};
try {
  window.aleo = ma, window.ethereum = Cn, window.qtum = da, Object.freeze(window.foxwallet), Object.seal(window.aleo);
} catch (s) {
  console.log(s);
}
const Ci = {
  uuid: Kn.EIP6963_UUID,
  name: "FoxWallet",
  icon: Kn.SVG_ICON,
  rdns: "com.foxwallet"
}, Si = Object.freeze({ info: Ci, provider: Cn });
function ca() {
  window.dispatchEvent(
    new CustomEvent("eip6963:announceProvider", {
      detail: Si
    })
  );
}
window.addEventListener("eip6963:requestProvider", (s) => {
  ca();
});
ca();
