var la = Object.defineProperty;
var ma = (r, e, t) => e in r ? la(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var Ae = (r, e, t) => (ma(r, typeof e != "symbol" ? e + "" : e, t), t), An = (r, e, t) => {
  if (!e.has(r))
    throw TypeError("Cannot " + t);
};
var Ie = (r, e, t) => (An(r, e, "read from private field"), t ? t.call(r) : e.get(r)), wt = (r, e, t) => {
  if (e.has(r))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(r) : e.set(r, t);
}, Fe = (r, e, t, a) => (An(r, e, "write to private field"), a ? a.call(r, t) : e.set(r, t), t);
const da = "fox_dapp_request", ca = "fox_dapp_response", fa = "fox_dapp_emit";
function Ta(r) {
  return { all: r = r || /* @__PURE__ */ new Map(), on: function(e, t) {
    var a = r.get(e);
    a ? a.push(t) : r.set(e, [t]);
  }, off: function(e, t) {
    var a = r.get(e);
    a && (t ? a.splice(a.indexOf(t) >>> 0, 1) : r.set(e, []));
  }, emit: function(e, t) {
    var a = r.get(e);
    a && a.slice().map(function(f) {
      f(t);
    }), (a = r.get("*")) && a.slice().map(function(f) {
      f(e, t);
    });
  } };
}
const ba = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let ha = (r = 21) => {
  let e = "", t = crypto.getRandomValues(new Uint8Array(r |= 0));
  for (; r--; )
    e += ba[t[r] & 63];
  return e;
};
var Lt, Pe, bt;
class Gn {
  // coin type
  constructor() {
    wt(this, Lt, void 0);
    wt(this, Pe, void 0);
    wt(this, bt, void 0);
    Ae(this, "chain");
    Ae(this, "onMessage", (e) => {
      const { id: t, error: a, data: f } = e.detail, y = Ie(this, bt).get(t);
      y && (y(a, f), Ie(this, bt).delete(t));
    });
    Ae(this, "on", (e, t) => (Ie(this, Pe).on(e, t), () => Ie(this, Pe).off(e, t)));
    Ae(this, "removeListener", (e, t) => {
      Ie(this, Pe).off(e, t);
    });
    Ae(this, "off", (e, t) => {
      Ie(this, Pe).off(e, t);
    });
    Ae(this, "removeAllListeners", () => {
      Ie(this, Pe).all.clear();
    });
    Fe(this, Lt, !0), Fe(this, Pe, Ta()), Fe(this, bt, /* @__PURE__ */ new Map()), this.emit = this.emit.bind(this), window.addEventListener(ca, this.onMessage), this.onDappEmit = this.onDappEmit.bind(this), window.addEventListener(fa, this.onDappEmit);
  }
  onDappEmit(e) {
  }
  send(e, t, a = {}) {
    return new Promise((f, y) => {
      const T = ha(), _ = new CustomEvent(
        da,
        {
          detail: {
            id: T,
            coinType: this.chain,
            method: e,
            payload: t,
            metadata: a
          }
        }
      ), x = (E, N) => {
        E ? y(E) : f(N);
      };
      Ie(this, bt).set(T, x), window.dispatchEvent(_);
    });
  }
  get isFoxWallet() {
    return Ie(this, Lt);
  }
  emit(e, t) {
    Ie(this, Pe).emit(e, t);
  }
}
Lt = new WeakMap(), Pe = new WeakMap(), bt = new WeakMap();
function ga(r) {
  return Array.from(r).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var Rt = /* @__PURE__ */ ((r) => (r.ETH = "ETH", r.ALEO = "ALEO", r))(Rt || {});
Object.values(Rt);
var ze, He;
class Ma extends Gn {
  constructor() {
    super();
    Ae(this, "chain", Rt.ALEO);
    wt(this, ze, void 0);
    wt(this, He, void 0);
    Ae(this, "_readyState");
    Fe(this, ze, null), Fe(this, He, null), this._readyState = "Installed";
  }
  get publicKey() {
    return Ie(this, ze);
  }
  get network() {
    return Ie(this, He);
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
  async connect(t, a, f) {
    const y = this.convertNetworkToChainId(a), T = await this.send("connect", {
      decryptPermission: t,
      network: y,
      programs: f
    });
    return Fe(this, ze, T || null), Fe(this, He, a), !!T;
  }
  async disconnect() {
    if (!Ie(this, ze) || !this.network)
      throw new Error("Connect before disconnect");
    const t = await this.send("disconnect", {});
    return Fe(this, ze, null), Fe(this, He, null), t;
  }
  async decrypt(t, a, f, y, T) {
    return await this.send("decrypt", {
      cipherText: t,
      tpk: a,
      programId: f,
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
    const a = ga(t), f = await this.send("signMessage", {
      message: a
    });
    if (!f)
      throw new Error("sign message failed");
    return { signature: new TextEncoder().encode(f.signature) };
  }
  send(t, a) {
    return super.send(t, a, {
      address: Ie(this, ze),
      network: Ie(this, He) ? this.convertNetworkToChainId(Ie(this, He)) : ""
    });
  }
}
ze = new WeakMap(), He = new WeakMap();
class En extends Error {
  constructor(t, a) {
    super();
    Ae(this, "code");
    this.code = t, this.message = a;
  }
  toString() {
    return `${this.message} (${this.code})`;
  }
}
const wa = {
  DEFAULT_GAS_LIMIT: 21e3,
  TOKEN_TRANSFER_TOPIC: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  MAX_SAFE_CHAIN_ID: 4503599627370476
};
var Kn = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Zn(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
function _a(r) {
  if (r.__esModule)
    return r;
  var e = r.default;
  if (typeof e == "function") {
    var t = function a() {
      return this instanceof a ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else
    t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(r).forEach(function(a) {
    var f = Object.getOwnPropertyDescriptor(r, a);
    Object.defineProperty(t, a, f.get ? f : {
      enumerable: !0,
      get: function() {
        return r[a];
      }
    });
  }), t;
}
var _n = { exports: {} };
const ka = {}, va = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ka
}, Symbol.toStringTag, { value: "Module" })), Ia = /* @__PURE__ */ _a(va);
_n.exports;
(function(r) {
  (function(e, t) {
    function a(c, n) {
      if (!c)
        throw new Error(n || "Assertion failed");
    }
    function f(c, n) {
      c.super_ = n;
      var s = function() {
      };
      s.prototype = n.prototype, c.prototype = new s(), c.prototype.constructor = c;
    }
    function y(c, n, s) {
      if (y.isBN(c))
        return c;
      this.negative = 0, this.words = null, this.length = 0, this.red = null, c !== null && ((n === "le" || n === "be") && (s = n, n = 10), this._init(c || 0, n || 10, s || "be"));
    }
    typeof e == "object" ? e.exports = y : t.BN = y, y.BN = y, y.wordSize = 26;
    var T;
    try {
      typeof window < "u" && typeof window.Buffer < "u" ? T = window.Buffer : T = Ia.Buffer;
    } catch {
    }
    y.isBN = function(n) {
      return n instanceof y ? !0 : n !== null && typeof n == "object" && n.constructor.wordSize === y.wordSize && Array.isArray(n.words);
    }, y.max = function(n, s) {
      return n.cmp(s) > 0 ? n : s;
    }, y.min = function(n, s) {
      return n.cmp(s) < 0 ? n : s;
    }, y.prototype._init = function(n, s, u) {
      if (typeof n == "number")
        return this._initNumber(n, s, u);
      if (typeof n == "object")
        return this._initArray(n, s, u);
      s === "hex" && (s = 16), a(s === (s | 0) && s >= 2 && s <= 36), n = n.toString().replace(/\s+/g, "");
      var l = 0;
      n[0] === "-" && (l++, this.negative = 1), l < n.length && (s === 16 ? this._parseHex(n, l, u) : (this._parseBase(n, s, l), u === "le" && this._initArray(this.toArray(), s, u)));
    }, y.prototype._initNumber = function(n, s, u) {
      n < 0 && (this.negative = 1, n = -n), n < 67108864 ? (this.words = [n & 67108863], this.length = 1) : n < 4503599627370496 ? (this.words = [
        n & 67108863,
        n / 67108864 & 67108863
      ], this.length = 2) : (a(n < 9007199254740992), this.words = [
        n & 67108863,
        n / 67108864 & 67108863,
        1
      ], this.length = 3), u === "le" && this._initArray(this.toArray(), s, u);
    }, y.prototype._initArray = function(n, s, u) {
      if (a(typeof n.length == "number"), n.length <= 0)
        return this.words = [0], this.length = 1, this;
      this.length = Math.ceil(n.length / 3), this.words = new Array(this.length);
      for (var l = 0; l < this.length; l++)
        this.words[l] = 0;
      var d, b, h = 0;
      if (u === "be")
        for (l = n.length - 1, d = 0; l >= 0; l -= 3)
          b = n[l] | n[l - 1] << 8 | n[l - 2] << 16, this.words[d] |= b << h & 67108863, this.words[d + 1] = b >>> 26 - h & 67108863, h += 24, h >= 26 && (h -= 26, d++);
      else if (u === "le")
        for (l = 0, d = 0; l < n.length; l += 3)
          b = n[l] | n[l + 1] << 8 | n[l + 2] << 16, this.words[d] |= b << h & 67108863, this.words[d + 1] = b >>> 26 - h & 67108863, h += 24, h >= 26 && (h -= 26, d++);
      return this._strip();
    };
    function _(c, n) {
      var s = c.charCodeAt(n);
      if (s >= 48 && s <= 57)
        return s - 48;
      if (s >= 65 && s <= 70)
        return s - 55;
      if (s >= 97 && s <= 102)
        return s - 87;
      a(!1, "Invalid character in " + c);
    }
    function x(c, n, s) {
      var u = _(c, s);
      return s - 1 >= n && (u |= _(c, s - 1) << 4), u;
    }
    y.prototype._parseHex = function(n, s, u) {
      this.length = Math.ceil((n.length - s) / 6), this.words = new Array(this.length);
      for (var l = 0; l < this.length; l++)
        this.words[l] = 0;
      var d = 0, b = 0, h;
      if (u === "be")
        for (l = n.length - 1; l >= s; l -= 2)
          h = x(n, s, l) << d, this.words[b] |= h & 67108863, d >= 18 ? (d -= 18, b += 1, this.words[b] |= h >>> 26) : d += 8;
      else {
        var o = n.length - s;
        for (l = o % 2 === 0 ? s + 1 : s; l < n.length; l += 2)
          h = x(n, s, l) << d, this.words[b] |= h & 67108863, d >= 18 ? (d -= 18, b += 1, this.words[b] |= h >>> 26) : d += 8;
      }
      this._strip();
    };
    function E(c, n, s, u) {
      for (var l = 0, d = 0, b = Math.min(c.length, s), h = n; h < b; h++) {
        var o = c.charCodeAt(h) - 48;
        l *= u, o >= 49 ? d = o - 49 + 10 : o >= 17 ? d = o - 17 + 10 : d = o, a(o >= 0 && d < u, "Invalid character"), l += d;
      }
      return l;
    }
    y.prototype._parseBase = function(n, s, u) {
      this.words = [0], this.length = 1;
      for (var l = 0, d = 1; d <= 67108863; d *= s)
        l++;
      l--, d = d / s | 0;
      for (var b = n.length - u, h = b % l, o = Math.min(b, b - h) + u, i = 0, m = u; m < o; m += l)
        i = E(n, m, m + l, s), this.imuln(d), this.words[0] + i < 67108864 ? this.words[0] += i : this._iaddn(i);
      if (h !== 0) {
        var C = 1;
        for (i = E(n, m, n.length, s), m = 0; m < h; m++)
          C *= s;
        this.imuln(C), this.words[0] + i < 67108864 ? this.words[0] += i : this._iaddn(i);
      }
      this._strip();
    }, y.prototype.copy = function(n) {
      n.words = new Array(this.length);
      for (var s = 0; s < this.length; s++)
        n.words[s] = this.words[s];
      n.length = this.length, n.negative = this.negative, n.red = this.red;
    };
    function N(c, n) {
      c.words = n.words, c.length = n.length, c.negative = n.negative, c.red = n.red;
    }
    if (y.prototype._move = function(n) {
      N(n, this);
    }, y.prototype.clone = function() {
      var n = new y(null);
      return this.copy(n), n;
    }, y.prototype._expand = function(n) {
      for (; this.length < n; )
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
    ], ke = [
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
    y.prototype.toString = function(n, s) {
      n = n || 10, s = s | 0 || 1;
      var u;
      if (n === 16 || n === "hex") {
        u = "";
        for (var l = 0, d = 0, b = 0; b < this.length; b++) {
          var h = this.words[b], o = ((h << l | d) & 16777215).toString(16);
          d = h >>> 24 - l & 16777215, l += 2, l >= 26 && (l -= 26, b--), d !== 0 || b !== this.length - 1 ? u = L[6 - o.length] + o + u : u = o + u;
        }
        for (d !== 0 && (u = d.toString(16) + u); u.length % s !== 0; )
          u = "0" + u;
        return this.negative !== 0 && (u = "-" + u), u;
      }
      if (n === (n | 0) && n >= 2 && n <= 36) {
        var i = ke[n], m = we[n];
        u = "";
        var C = this.clone();
        for (C.negative = 0; !C.isZero(); ) {
          var p = C.modrn(m).toString(n);
          C = C.idivn(m), C.isZero() ? u = p + u : u = L[i - p.length] + p + u;
        }
        for (this.isZero() && (u = "0" + u); u.length % s !== 0; )
          u = "0" + u;
        return this.negative !== 0 && (u = "-" + u), u;
      }
      a(!1, "Base should be between 2 and 36");
    }, y.prototype.toNumber = function() {
      var n = this.words[0];
      return this.length === 2 ? n += this.words[1] * 67108864 : this.length === 3 && this.words[2] === 1 ? n += 4503599627370496 + this.words[1] * 67108864 : this.length > 2 && a(!1, "Number can only safely store up to 53 bits"), this.negative !== 0 ? -n : n;
    }, y.prototype.toJSON = function() {
      return this.toString(16, 2);
    }, T && (y.prototype.toBuffer = function(n, s) {
      return this.toArrayLike(T, n, s);
    }), y.prototype.toArray = function(n, s) {
      return this.toArrayLike(Array, n, s);
    };
    var Ut = function(n, s) {
      return n.allocUnsafe ? n.allocUnsafe(s) : new n(s);
    };
    y.prototype.toArrayLike = function(n, s, u) {
      this._strip();
      var l = this.byteLength(), d = u || Math.max(1, l);
      a(l <= d, "byte array longer than desired length"), a(d > 0, "Requested array length <= 0");
      var b = Ut(n, d), h = s === "le" ? "LE" : "BE";
      return this["_toArrayLike" + h](b, l), b;
    }, y.prototype._toArrayLikeLE = function(n, s) {
      for (var u = 0, l = 0, d = 0, b = 0; d < this.length; d++) {
        var h = this.words[d] << b | l;
        n[u++] = h & 255, u < n.length && (n[u++] = h >> 8 & 255), u < n.length && (n[u++] = h >> 16 & 255), b === 6 ? (u < n.length && (n[u++] = h >> 24 & 255), l = 0, b = 0) : (l = h >>> 24, b += 2);
      }
      if (u < n.length)
        for (n[u++] = l; u < n.length; )
          n[u++] = 0;
    }, y.prototype._toArrayLikeBE = function(n, s) {
      for (var u = n.length - 1, l = 0, d = 0, b = 0; d < this.length; d++) {
        var h = this.words[d] << b | l;
        n[u--] = h & 255, u >= 0 && (n[u--] = h >> 8 & 255), u >= 0 && (n[u--] = h >> 16 & 255), b === 6 ? (u >= 0 && (n[u--] = h >> 24 & 255), l = 0, b = 0) : (l = h >>> 24, b += 2);
      }
      if (u >= 0)
        for (n[u--] = l; u >= 0; )
          n[u--] = 0;
    }, Math.clz32 ? y.prototype._countBits = function(n) {
      return 32 - Math.clz32(n);
    } : y.prototype._countBits = function(n) {
      var s = n, u = 0;
      return s >= 4096 && (u += 13, s >>>= 13), s >= 64 && (u += 7, s >>>= 7), s >= 8 && (u += 4, s >>>= 4), s >= 2 && (u += 2, s >>>= 2), u + s;
    }, y.prototype._zeroBits = function(n) {
      if (n === 0)
        return 26;
      var s = n, u = 0;
      return s & 8191 || (u += 13, s >>>= 13), s & 127 || (u += 7, s >>>= 7), s & 15 || (u += 4, s >>>= 4), s & 3 || (u += 2, s >>>= 2), s & 1 || u++, u;
    }, y.prototype.bitLength = function() {
      var n = this.words[this.length - 1], s = this._countBits(n);
      return (this.length - 1) * 26 + s;
    };
    function Vt(c) {
      for (var n = new Array(c.bitLength()), s = 0; s < n.length; s++) {
        var u = s / 26 | 0, l = s % 26;
        n[s] = c.words[u] >>> l & 1;
      }
      return n;
    }
    y.prototype.zeroBits = function() {
      if (this.isZero())
        return 0;
      for (var n = 0, s = 0; s < this.length; s++) {
        var u = this._zeroBits(this.words[s]);
        if (n += u, u !== 26)
          break;
      }
      return n;
    }, y.prototype.byteLength = function() {
      return Math.ceil(this.bitLength() / 8);
    }, y.prototype.toTwos = function(n) {
      return this.negative !== 0 ? this.abs().inotn(n).iaddn(1) : this.clone();
    }, y.prototype.fromTwos = function(n) {
      return this.testn(n - 1) ? this.notn(n).iaddn(1).ineg() : this.clone();
    }, y.prototype.isNeg = function() {
      return this.negative !== 0;
    }, y.prototype.neg = function() {
      return this.clone().ineg();
    }, y.prototype.ineg = function() {
      return this.isZero() || (this.negative ^= 1), this;
    }, y.prototype.iuor = function(n) {
      for (; this.length < n.length; )
        this.words[this.length++] = 0;
      for (var s = 0; s < n.length; s++)
        this.words[s] = this.words[s] | n.words[s];
      return this._strip();
    }, y.prototype.ior = function(n) {
      return a((this.negative | n.negative) === 0), this.iuor(n);
    }, y.prototype.or = function(n) {
      return this.length > n.length ? this.clone().ior(n) : n.clone().ior(this);
    }, y.prototype.uor = function(n) {
      return this.length > n.length ? this.clone().iuor(n) : n.clone().iuor(this);
    }, y.prototype.iuand = function(n) {
      var s;
      this.length > n.length ? s = n : s = this;
      for (var u = 0; u < s.length; u++)
        this.words[u] = this.words[u] & n.words[u];
      return this.length = s.length, this._strip();
    }, y.prototype.iand = function(n) {
      return a((this.negative | n.negative) === 0), this.iuand(n);
    }, y.prototype.and = function(n) {
      return this.length > n.length ? this.clone().iand(n) : n.clone().iand(this);
    }, y.prototype.uand = function(n) {
      return this.length > n.length ? this.clone().iuand(n) : n.clone().iuand(this);
    }, y.prototype.iuxor = function(n) {
      var s, u;
      this.length > n.length ? (s = this, u = n) : (s = n, u = this);
      for (var l = 0; l < u.length; l++)
        this.words[l] = s.words[l] ^ u.words[l];
      if (this !== s)
        for (; l < s.length; l++)
          this.words[l] = s.words[l];
      return this.length = s.length, this._strip();
    }, y.prototype.ixor = function(n) {
      return a((this.negative | n.negative) === 0), this.iuxor(n);
    }, y.prototype.xor = function(n) {
      return this.length > n.length ? this.clone().ixor(n) : n.clone().ixor(this);
    }, y.prototype.uxor = function(n) {
      return this.length > n.length ? this.clone().iuxor(n) : n.clone().iuxor(this);
    }, y.prototype.inotn = function(n) {
      a(typeof n == "number" && n >= 0);
      var s = Math.ceil(n / 26) | 0, u = n % 26;
      this._expand(s), u > 0 && s--;
      for (var l = 0; l < s; l++)
        this.words[l] = ~this.words[l] & 67108863;
      return u > 0 && (this.words[l] = ~this.words[l] & 67108863 >> 26 - u), this._strip();
    }, y.prototype.notn = function(n) {
      return this.clone().inotn(n);
    }, y.prototype.setn = function(n, s) {
      a(typeof n == "number" && n >= 0);
      var u = n / 26 | 0, l = n % 26;
      return this._expand(u + 1), s ? this.words[u] = this.words[u] | 1 << l : this.words[u] = this.words[u] & ~(1 << l), this._strip();
    }, y.prototype.iadd = function(n) {
      var s;
      if (this.negative !== 0 && n.negative === 0)
        return this.negative = 0, s = this.isub(n), this.negative ^= 1, this._normSign();
      if (this.negative === 0 && n.negative !== 0)
        return n.negative = 0, s = this.isub(n), n.negative = 1, s._normSign();
      var u, l;
      this.length > n.length ? (u = this, l = n) : (u = n, l = this);
      for (var d = 0, b = 0; b < l.length; b++)
        s = (u.words[b] | 0) + (l.words[b] | 0) + d, this.words[b] = s & 67108863, d = s >>> 26;
      for (; d !== 0 && b < u.length; b++)
        s = (u.words[b] | 0) + d, this.words[b] = s & 67108863, d = s >>> 26;
      if (this.length = u.length, d !== 0)
        this.words[this.length] = d, this.length++;
      else if (u !== this)
        for (; b < u.length; b++)
          this.words[b] = u.words[b];
      return this;
    }, y.prototype.add = function(n) {
      var s;
      return n.negative !== 0 && this.negative === 0 ? (n.negative = 0, s = this.sub(n), n.negative ^= 1, s) : n.negative === 0 && this.negative !== 0 ? (this.negative = 0, s = n.sub(this), this.negative = 1, s) : this.length > n.length ? this.clone().iadd(n) : n.clone().iadd(this);
    }, y.prototype.isub = function(n) {
      if (n.negative !== 0) {
        n.negative = 0;
        var s = this.iadd(n);
        return n.negative = 1, s._normSign();
      } else if (this.negative !== 0)
        return this.negative = 0, this.iadd(n), this.negative = 1, this._normSign();
      var u = this.cmp(n);
      if (u === 0)
        return this.negative = 0, this.length = 1, this.words[0] = 0, this;
      var l, d;
      u > 0 ? (l = this, d = n) : (l = n, d = this);
      for (var b = 0, h = 0; h < d.length; h++)
        s = (l.words[h] | 0) - (d.words[h] | 0) + b, b = s >> 26, this.words[h] = s & 67108863;
      for (; b !== 0 && h < l.length; h++)
        s = (l.words[h] | 0) + b, b = s >> 26, this.words[h] = s & 67108863;
      if (b === 0 && h < l.length && l !== this)
        for (; h < l.length; h++)
          this.words[h] = l.words[h];
      return this.length = Math.max(this.length, h), l !== this && (this.negative = 1), this._strip();
    }, y.prototype.sub = function(n) {
      return this.clone().isub(n);
    };
    function gt(c, n, s) {
      s.negative = n.negative ^ c.negative;
      var u = c.length + n.length | 0;
      s.length = u, u = u - 1 | 0;
      var l = c.words[0] | 0, d = n.words[0] | 0, b = l * d, h = b & 67108863, o = b / 67108864 | 0;
      s.words[0] = h;
      for (var i = 1; i < u; i++) {
        for (var m = o >>> 26, C = o & 67108863, p = Math.min(i, n.length - 1), g = Math.max(0, i - c.length + 1); g <= p; g++) {
          var M = i - g | 0;
          l = c.words[M] | 0, d = n.words[g] | 0, b = l * d + C, m += b / 67108864 | 0, C = b & 67108863;
        }
        s.words[i] = C | 0, o = m | 0;
      }
      return o !== 0 ? s.words[i] = o | 0 : s.length--, s._strip();
    }
    var It = function(n, s, u) {
      var l = n.words, d = s.words, b = u.words, h = 0, o, i, m, C = l[0] | 0, p = C & 8191, g = C >>> 13, M = l[1] | 0, w = M & 8191, k = M >>> 13, S = l[2] | 0, I = S & 8191, v = S >>> 13, ge = l[3] | 0, A = ge & 8191, R = ge >>> 13, tt = l[4] | 0, U = tt & 8191, V = tt >>> 13, nt = l[5] | 0, z = nt & 8191, H = nt >>> 13, at = l[6] | 0, q = at & 8191, j = at >>> 13, it = l[7] | 0, W = it & 8191, G = it >>> 13, rt = l[8] | 0, K = rt & 8191, Z = rt >>> 13, st = l[9] | 0, $ = st & 8191, Q = st >>> 13, pt = d[0] | 0, J = pt & 8191, X = pt >>> 13, yt = d[1] | 0, Y = yt & 8191, ee = yt >>> 13, ut = d[2] | 0, te = ut & 8191, ne = ut >>> 13, ot = d[3] | 0, ae = ot & 8191, ie = ot >>> 13, lt = d[4] | 0, re = lt & 8191, se = lt >>> 13, mt = d[5] | 0, pe = mt & 8191, ye = mt >>> 13, dt = d[6] | 0, ue = dt & 8191, oe = dt >>> 13, ct = d[7] | 0, le = ct & 8191, me = ct >>> 13, ft = d[8] | 0, de = ft & 8191, ce = ft >>> 13, Tt = d[9] | 0, fe = Tt & 8191, Te = Tt >>> 13;
      u.negative = n.negative ^ s.negative, u.length = 19, o = Math.imul(p, J), i = Math.imul(p, X), i = i + Math.imul(g, J) | 0, m = Math.imul(g, X);
      var Ke = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (Ke >>> 26) | 0, Ke &= 67108863, o = Math.imul(w, J), i = Math.imul(w, X), i = i + Math.imul(k, J) | 0, m = Math.imul(k, X), o = o + Math.imul(p, Y) | 0, i = i + Math.imul(p, ee) | 0, i = i + Math.imul(g, Y) | 0, m = m + Math.imul(g, ee) | 0;
      var Ze = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (Ze >>> 26) | 0, Ze &= 67108863, o = Math.imul(I, J), i = Math.imul(I, X), i = i + Math.imul(v, J) | 0, m = Math.imul(v, X), o = o + Math.imul(w, Y) | 0, i = i + Math.imul(w, ee) | 0, i = i + Math.imul(k, Y) | 0, m = m + Math.imul(k, ee) | 0, o = o + Math.imul(p, te) | 0, i = i + Math.imul(p, ne) | 0, i = i + Math.imul(g, te) | 0, m = m + Math.imul(g, ne) | 0;
      var $e = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + ($e >>> 26) | 0, $e &= 67108863, o = Math.imul(A, J), i = Math.imul(A, X), i = i + Math.imul(R, J) | 0, m = Math.imul(R, X), o = o + Math.imul(I, Y) | 0, i = i + Math.imul(I, ee) | 0, i = i + Math.imul(v, Y) | 0, m = m + Math.imul(v, ee) | 0, o = o + Math.imul(w, te) | 0, i = i + Math.imul(w, ne) | 0, i = i + Math.imul(k, te) | 0, m = m + Math.imul(k, ne) | 0, o = o + Math.imul(p, ae) | 0, i = i + Math.imul(p, ie) | 0, i = i + Math.imul(g, ae) | 0, m = m + Math.imul(g, ie) | 0;
      var Qe = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (Qe >>> 26) | 0, Qe &= 67108863, o = Math.imul(U, J), i = Math.imul(U, X), i = i + Math.imul(V, J) | 0, m = Math.imul(V, X), o = o + Math.imul(A, Y) | 0, i = i + Math.imul(A, ee) | 0, i = i + Math.imul(R, Y) | 0, m = m + Math.imul(R, ee) | 0, o = o + Math.imul(I, te) | 0, i = i + Math.imul(I, ne) | 0, i = i + Math.imul(v, te) | 0, m = m + Math.imul(v, ne) | 0, o = o + Math.imul(w, ae) | 0, i = i + Math.imul(w, ie) | 0, i = i + Math.imul(k, ae) | 0, m = m + Math.imul(k, ie) | 0, o = o + Math.imul(p, re) | 0, i = i + Math.imul(p, se) | 0, i = i + Math.imul(g, re) | 0, m = m + Math.imul(g, se) | 0;
      var Je = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (Je >>> 26) | 0, Je &= 67108863, o = Math.imul(z, J), i = Math.imul(z, X), i = i + Math.imul(H, J) | 0, m = Math.imul(H, X), o = o + Math.imul(U, Y) | 0, i = i + Math.imul(U, ee) | 0, i = i + Math.imul(V, Y) | 0, m = m + Math.imul(V, ee) | 0, o = o + Math.imul(A, te) | 0, i = i + Math.imul(A, ne) | 0, i = i + Math.imul(R, te) | 0, m = m + Math.imul(R, ne) | 0, o = o + Math.imul(I, ae) | 0, i = i + Math.imul(I, ie) | 0, i = i + Math.imul(v, ae) | 0, m = m + Math.imul(v, ie) | 0, o = o + Math.imul(w, re) | 0, i = i + Math.imul(w, se) | 0, i = i + Math.imul(k, re) | 0, m = m + Math.imul(k, se) | 0, o = o + Math.imul(p, pe) | 0, i = i + Math.imul(p, ye) | 0, i = i + Math.imul(g, pe) | 0, m = m + Math.imul(g, ye) | 0;
      var en = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (en >>> 26) | 0, en &= 67108863, o = Math.imul(q, J), i = Math.imul(q, X), i = i + Math.imul(j, J) | 0, m = Math.imul(j, X), o = o + Math.imul(z, Y) | 0, i = i + Math.imul(z, ee) | 0, i = i + Math.imul(H, Y) | 0, m = m + Math.imul(H, ee) | 0, o = o + Math.imul(U, te) | 0, i = i + Math.imul(U, ne) | 0, i = i + Math.imul(V, te) | 0, m = m + Math.imul(V, ne) | 0, o = o + Math.imul(A, ae) | 0, i = i + Math.imul(A, ie) | 0, i = i + Math.imul(R, ae) | 0, m = m + Math.imul(R, ie) | 0, o = o + Math.imul(I, re) | 0, i = i + Math.imul(I, se) | 0, i = i + Math.imul(v, re) | 0, m = m + Math.imul(v, se) | 0, o = o + Math.imul(w, pe) | 0, i = i + Math.imul(w, ye) | 0, i = i + Math.imul(k, pe) | 0, m = m + Math.imul(k, ye) | 0, o = o + Math.imul(p, ue) | 0, i = i + Math.imul(p, oe) | 0, i = i + Math.imul(g, ue) | 0, m = m + Math.imul(g, oe) | 0;
      var tn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (tn >>> 26) | 0, tn &= 67108863, o = Math.imul(W, J), i = Math.imul(W, X), i = i + Math.imul(G, J) | 0, m = Math.imul(G, X), o = o + Math.imul(q, Y) | 0, i = i + Math.imul(q, ee) | 0, i = i + Math.imul(j, Y) | 0, m = m + Math.imul(j, ee) | 0, o = o + Math.imul(z, te) | 0, i = i + Math.imul(z, ne) | 0, i = i + Math.imul(H, te) | 0, m = m + Math.imul(H, ne) | 0, o = o + Math.imul(U, ae) | 0, i = i + Math.imul(U, ie) | 0, i = i + Math.imul(V, ae) | 0, m = m + Math.imul(V, ie) | 0, o = o + Math.imul(A, re) | 0, i = i + Math.imul(A, se) | 0, i = i + Math.imul(R, re) | 0, m = m + Math.imul(R, se) | 0, o = o + Math.imul(I, pe) | 0, i = i + Math.imul(I, ye) | 0, i = i + Math.imul(v, pe) | 0, m = m + Math.imul(v, ye) | 0, o = o + Math.imul(w, ue) | 0, i = i + Math.imul(w, oe) | 0, i = i + Math.imul(k, ue) | 0, m = m + Math.imul(k, oe) | 0, o = o + Math.imul(p, le) | 0, i = i + Math.imul(p, me) | 0, i = i + Math.imul(g, le) | 0, m = m + Math.imul(g, me) | 0;
      var nn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (nn >>> 26) | 0, nn &= 67108863, o = Math.imul(K, J), i = Math.imul(K, X), i = i + Math.imul(Z, J) | 0, m = Math.imul(Z, X), o = o + Math.imul(W, Y) | 0, i = i + Math.imul(W, ee) | 0, i = i + Math.imul(G, Y) | 0, m = m + Math.imul(G, ee) | 0, o = o + Math.imul(q, te) | 0, i = i + Math.imul(q, ne) | 0, i = i + Math.imul(j, te) | 0, m = m + Math.imul(j, ne) | 0, o = o + Math.imul(z, ae) | 0, i = i + Math.imul(z, ie) | 0, i = i + Math.imul(H, ae) | 0, m = m + Math.imul(H, ie) | 0, o = o + Math.imul(U, re) | 0, i = i + Math.imul(U, se) | 0, i = i + Math.imul(V, re) | 0, m = m + Math.imul(V, se) | 0, o = o + Math.imul(A, pe) | 0, i = i + Math.imul(A, ye) | 0, i = i + Math.imul(R, pe) | 0, m = m + Math.imul(R, ye) | 0, o = o + Math.imul(I, ue) | 0, i = i + Math.imul(I, oe) | 0, i = i + Math.imul(v, ue) | 0, m = m + Math.imul(v, oe) | 0, o = o + Math.imul(w, le) | 0, i = i + Math.imul(w, me) | 0, i = i + Math.imul(k, le) | 0, m = m + Math.imul(k, me) | 0, o = o + Math.imul(p, de) | 0, i = i + Math.imul(p, ce) | 0, i = i + Math.imul(g, de) | 0, m = m + Math.imul(g, ce) | 0;
      var an = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (an >>> 26) | 0, an &= 67108863, o = Math.imul($, J), i = Math.imul($, X), i = i + Math.imul(Q, J) | 0, m = Math.imul(Q, X), o = o + Math.imul(K, Y) | 0, i = i + Math.imul(K, ee) | 0, i = i + Math.imul(Z, Y) | 0, m = m + Math.imul(Z, ee) | 0, o = o + Math.imul(W, te) | 0, i = i + Math.imul(W, ne) | 0, i = i + Math.imul(G, te) | 0, m = m + Math.imul(G, ne) | 0, o = o + Math.imul(q, ae) | 0, i = i + Math.imul(q, ie) | 0, i = i + Math.imul(j, ae) | 0, m = m + Math.imul(j, ie) | 0, o = o + Math.imul(z, re) | 0, i = i + Math.imul(z, se) | 0, i = i + Math.imul(H, re) | 0, m = m + Math.imul(H, se) | 0, o = o + Math.imul(U, pe) | 0, i = i + Math.imul(U, ye) | 0, i = i + Math.imul(V, pe) | 0, m = m + Math.imul(V, ye) | 0, o = o + Math.imul(A, ue) | 0, i = i + Math.imul(A, oe) | 0, i = i + Math.imul(R, ue) | 0, m = m + Math.imul(R, oe) | 0, o = o + Math.imul(I, le) | 0, i = i + Math.imul(I, me) | 0, i = i + Math.imul(v, le) | 0, m = m + Math.imul(v, me) | 0, o = o + Math.imul(w, de) | 0, i = i + Math.imul(w, ce) | 0, i = i + Math.imul(k, de) | 0, m = m + Math.imul(k, ce) | 0, o = o + Math.imul(p, fe) | 0, i = i + Math.imul(p, Te) | 0, i = i + Math.imul(g, fe) | 0, m = m + Math.imul(g, Te) | 0;
      var rn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (rn >>> 26) | 0, rn &= 67108863, o = Math.imul($, Y), i = Math.imul($, ee), i = i + Math.imul(Q, Y) | 0, m = Math.imul(Q, ee), o = o + Math.imul(K, te) | 0, i = i + Math.imul(K, ne) | 0, i = i + Math.imul(Z, te) | 0, m = m + Math.imul(Z, ne) | 0, o = o + Math.imul(W, ae) | 0, i = i + Math.imul(W, ie) | 0, i = i + Math.imul(G, ae) | 0, m = m + Math.imul(G, ie) | 0, o = o + Math.imul(q, re) | 0, i = i + Math.imul(q, se) | 0, i = i + Math.imul(j, re) | 0, m = m + Math.imul(j, se) | 0, o = o + Math.imul(z, pe) | 0, i = i + Math.imul(z, ye) | 0, i = i + Math.imul(H, pe) | 0, m = m + Math.imul(H, ye) | 0, o = o + Math.imul(U, ue) | 0, i = i + Math.imul(U, oe) | 0, i = i + Math.imul(V, ue) | 0, m = m + Math.imul(V, oe) | 0, o = o + Math.imul(A, le) | 0, i = i + Math.imul(A, me) | 0, i = i + Math.imul(R, le) | 0, m = m + Math.imul(R, me) | 0, o = o + Math.imul(I, de) | 0, i = i + Math.imul(I, ce) | 0, i = i + Math.imul(v, de) | 0, m = m + Math.imul(v, ce) | 0, o = o + Math.imul(w, fe) | 0, i = i + Math.imul(w, Te) | 0, i = i + Math.imul(k, fe) | 0, m = m + Math.imul(k, Te) | 0;
      var sn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (sn >>> 26) | 0, sn &= 67108863, o = Math.imul($, te), i = Math.imul($, ne), i = i + Math.imul(Q, te) | 0, m = Math.imul(Q, ne), o = o + Math.imul(K, ae) | 0, i = i + Math.imul(K, ie) | 0, i = i + Math.imul(Z, ae) | 0, m = m + Math.imul(Z, ie) | 0, o = o + Math.imul(W, re) | 0, i = i + Math.imul(W, se) | 0, i = i + Math.imul(G, re) | 0, m = m + Math.imul(G, se) | 0, o = o + Math.imul(q, pe) | 0, i = i + Math.imul(q, ye) | 0, i = i + Math.imul(j, pe) | 0, m = m + Math.imul(j, ye) | 0, o = o + Math.imul(z, ue) | 0, i = i + Math.imul(z, oe) | 0, i = i + Math.imul(H, ue) | 0, m = m + Math.imul(H, oe) | 0, o = o + Math.imul(U, le) | 0, i = i + Math.imul(U, me) | 0, i = i + Math.imul(V, le) | 0, m = m + Math.imul(V, me) | 0, o = o + Math.imul(A, de) | 0, i = i + Math.imul(A, ce) | 0, i = i + Math.imul(R, de) | 0, m = m + Math.imul(R, ce) | 0, o = o + Math.imul(I, fe) | 0, i = i + Math.imul(I, Te) | 0, i = i + Math.imul(v, fe) | 0, m = m + Math.imul(v, Te) | 0;
      var pn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (pn >>> 26) | 0, pn &= 67108863, o = Math.imul($, ae), i = Math.imul($, ie), i = i + Math.imul(Q, ae) | 0, m = Math.imul(Q, ie), o = o + Math.imul(K, re) | 0, i = i + Math.imul(K, se) | 0, i = i + Math.imul(Z, re) | 0, m = m + Math.imul(Z, se) | 0, o = o + Math.imul(W, pe) | 0, i = i + Math.imul(W, ye) | 0, i = i + Math.imul(G, pe) | 0, m = m + Math.imul(G, ye) | 0, o = o + Math.imul(q, ue) | 0, i = i + Math.imul(q, oe) | 0, i = i + Math.imul(j, ue) | 0, m = m + Math.imul(j, oe) | 0, o = o + Math.imul(z, le) | 0, i = i + Math.imul(z, me) | 0, i = i + Math.imul(H, le) | 0, m = m + Math.imul(H, me) | 0, o = o + Math.imul(U, de) | 0, i = i + Math.imul(U, ce) | 0, i = i + Math.imul(V, de) | 0, m = m + Math.imul(V, ce) | 0, o = o + Math.imul(A, fe) | 0, i = i + Math.imul(A, Te) | 0, i = i + Math.imul(R, fe) | 0, m = m + Math.imul(R, Te) | 0;
      var yn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (yn >>> 26) | 0, yn &= 67108863, o = Math.imul($, re), i = Math.imul($, se), i = i + Math.imul(Q, re) | 0, m = Math.imul(Q, se), o = o + Math.imul(K, pe) | 0, i = i + Math.imul(K, ye) | 0, i = i + Math.imul(Z, pe) | 0, m = m + Math.imul(Z, ye) | 0, o = o + Math.imul(W, ue) | 0, i = i + Math.imul(W, oe) | 0, i = i + Math.imul(G, ue) | 0, m = m + Math.imul(G, oe) | 0, o = o + Math.imul(q, le) | 0, i = i + Math.imul(q, me) | 0, i = i + Math.imul(j, le) | 0, m = m + Math.imul(j, me) | 0, o = o + Math.imul(z, de) | 0, i = i + Math.imul(z, ce) | 0, i = i + Math.imul(H, de) | 0, m = m + Math.imul(H, ce) | 0, o = o + Math.imul(U, fe) | 0, i = i + Math.imul(U, Te) | 0, i = i + Math.imul(V, fe) | 0, m = m + Math.imul(V, Te) | 0;
      var un = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (un >>> 26) | 0, un &= 67108863, o = Math.imul($, pe), i = Math.imul($, ye), i = i + Math.imul(Q, pe) | 0, m = Math.imul(Q, ye), o = o + Math.imul(K, ue) | 0, i = i + Math.imul(K, oe) | 0, i = i + Math.imul(Z, ue) | 0, m = m + Math.imul(Z, oe) | 0, o = o + Math.imul(W, le) | 0, i = i + Math.imul(W, me) | 0, i = i + Math.imul(G, le) | 0, m = m + Math.imul(G, me) | 0, o = o + Math.imul(q, de) | 0, i = i + Math.imul(q, ce) | 0, i = i + Math.imul(j, de) | 0, m = m + Math.imul(j, ce) | 0, o = o + Math.imul(z, fe) | 0, i = i + Math.imul(z, Te) | 0, i = i + Math.imul(H, fe) | 0, m = m + Math.imul(H, Te) | 0;
      var on = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (on >>> 26) | 0, on &= 67108863, o = Math.imul($, ue), i = Math.imul($, oe), i = i + Math.imul(Q, ue) | 0, m = Math.imul(Q, oe), o = o + Math.imul(K, le) | 0, i = i + Math.imul(K, me) | 0, i = i + Math.imul(Z, le) | 0, m = m + Math.imul(Z, me) | 0, o = o + Math.imul(W, de) | 0, i = i + Math.imul(W, ce) | 0, i = i + Math.imul(G, de) | 0, m = m + Math.imul(G, ce) | 0, o = o + Math.imul(q, fe) | 0, i = i + Math.imul(q, Te) | 0, i = i + Math.imul(j, fe) | 0, m = m + Math.imul(j, Te) | 0;
      var ln = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (ln >>> 26) | 0, ln &= 67108863, o = Math.imul($, le), i = Math.imul($, me), i = i + Math.imul(Q, le) | 0, m = Math.imul(Q, me), o = o + Math.imul(K, de) | 0, i = i + Math.imul(K, ce) | 0, i = i + Math.imul(Z, de) | 0, m = m + Math.imul(Z, ce) | 0, o = o + Math.imul(W, fe) | 0, i = i + Math.imul(W, Te) | 0, i = i + Math.imul(G, fe) | 0, m = m + Math.imul(G, Te) | 0;
      var mn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (mn >>> 26) | 0, mn &= 67108863, o = Math.imul($, de), i = Math.imul($, ce), i = i + Math.imul(Q, de) | 0, m = Math.imul(Q, ce), o = o + Math.imul(K, fe) | 0, i = i + Math.imul(K, Te) | 0, i = i + Math.imul(Z, fe) | 0, m = m + Math.imul(Z, Te) | 0;
      var dn = (h + o | 0) + ((i & 8191) << 13) | 0;
      h = (m + (i >>> 13) | 0) + (dn >>> 26) | 0, dn &= 67108863, o = Math.imul($, fe), i = Math.imul($, Te), i = i + Math.imul(Q, fe) | 0, m = Math.imul(Q, Te);
      var cn = (h + o | 0) + ((i & 8191) << 13) | 0;
      return h = (m + (i >>> 13) | 0) + (cn >>> 26) | 0, cn &= 67108863, b[0] = Ke, b[1] = Ze, b[2] = $e, b[3] = Qe, b[4] = Je, b[5] = en, b[6] = tn, b[7] = nn, b[8] = an, b[9] = rn, b[10] = sn, b[11] = pn, b[12] = yn, b[13] = un, b[14] = on, b[15] = ln, b[16] = mn, b[17] = dn, b[18] = cn, h !== 0 && (b[19] = h, u.length++), u;
    };
    Math.imul || (It = gt);
    function xt(c, n, s) {
      s.negative = n.negative ^ c.negative, s.length = c.length + n.length;
      for (var u = 0, l = 0, d = 0; d < s.length - 1; d++) {
        var b = l;
        l = 0;
        for (var h = u & 67108863, o = Math.min(d, n.length - 1), i = Math.max(0, d - c.length + 1); i <= o; i++) {
          var m = d - i, C = c.words[m] | 0, p = n.words[i] | 0, g = C * p, M = g & 67108863;
          b = b + (g / 67108864 | 0) | 0, M = M + h | 0, h = M & 67108863, b = b + (M >>> 26) | 0, l += b >>> 26, b &= 67108863;
        }
        s.words[d] = h, u = b, b = l;
      }
      return u !== 0 ? s.words[d] = u : s.length--, s._strip();
    }
    function At(c, n, s) {
      return xt(c, n, s);
    }
    y.prototype.mulTo = function(n, s) {
      var u, l = this.length + n.length;
      return this.length === 10 && n.length === 10 ? u = It(this, n, s) : l < 63 ? u = gt(this, n, s) : l < 1024 ? u = xt(this, n, s) : u = At(this, n, s), u;
    }, y.prototype.mul = function(n) {
      var s = new y(null);
      return s.words = new Array(this.length + n.length), this.mulTo(n, s);
    }, y.prototype.mulf = function(n) {
      var s = new y(null);
      return s.words = new Array(this.length + n.length), At(this, n, s);
    }, y.prototype.imul = function(n) {
      return this.clone().mulTo(n, this);
    }, y.prototype.imuln = function(n) {
      var s = n < 0;
      s && (n = -n), a(typeof n == "number"), a(n < 67108864);
      for (var u = 0, l = 0; l < this.length; l++) {
        var d = (this.words[l] | 0) * n, b = (d & 67108863) + (u & 67108863);
        u >>= 26, u += d / 67108864 | 0, u += b >>> 26, this.words[l] = b & 67108863;
      }
      return u !== 0 && (this.words[l] = u, this.length++), s ? this.ineg() : this;
    }, y.prototype.muln = function(n) {
      return this.clone().imuln(n);
    }, y.prototype.sqr = function() {
      return this.mul(this);
    }, y.prototype.isqr = function() {
      return this.imul(this.clone());
    }, y.prototype.pow = function(n) {
      var s = Vt(n);
      if (s.length === 0)
        return new y(1);
      for (var u = this, l = 0; l < s.length && s[l] === 0; l++, u = u.sqr())
        ;
      if (++l < s.length)
        for (var d = u.sqr(); l < s.length; l++, d = d.sqr())
          s[l] !== 0 && (u = u.mul(d));
      return u;
    }, y.prototype.iushln = function(n) {
      a(typeof n == "number" && n >= 0);
      var s = n % 26, u = (n - s) / 26, l = 67108863 >>> 26 - s << 26 - s, d;
      if (s !== 0) {
        var b = 0;
        for (d = 0; d < this.length; d++) {
          var h = this.words[d] & l, o = (this.words[d] | 0) - h << s;
          this.words[d] = o | b, b = h >>> 26 - s;
        }
        b && (this.words[d] = b, this.length++);
      }
      if (u !== 0) {
        for (d = this.length - 1; d >= 0; d--)
          this.words[d + u] = this.words[d];
        for (d = 0; d < u; d++)
          this.words[d] = 0;
        this.length += u;
      }
      return this._strip();
    }, y.prototype.ishln = function(n) {
      return a(this.negative === 0), this.iushln(n);
    }, y.prototype.iushrn = function(n, s, u) {
      a(typeof n == "number" && n >= 0);
      var l;
      s ? l = (s - s % 26) / 26 : l = 0;
      var d = n % 26, b = Math.min((n - d) / 26, this.length), h = 67108863 ^ 67108863 >>> d << d, o = u;
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
        var C = this.words[i] | 0;
        this.words[i] = m << 26 - d | C >>> d, m = C & h;
      }
      return o && m !== 0 && (o.words[o.length++] = m), this.length === 0 && (this.words[0] = 0, this.length = 1), this._strip();
    }, y.prototype.ishrn = function(n, s, u) {
      return a(this.negative === 0), this.iushrn(n, s, u);
    }, y.prototype.shln = function(n) {
      return this.clone().ishln(n);
    }, y.prototype.ushln = function(n) {
      return this.clone().iushln(n);
    }, y.prototype.shrn = function(n) {
      return this.clone().ishrn(n);
    }, y.prototype.ushrn = function(n) {
      return this.clone().iushrn(n);
    }, y.prototype.testn = function(n) {
      a(typeof n == "number" && n >= 0);
      var s = n % 26, u = (n - s) / 26, l = 1 << s;
      if (this.length <= u)
        return !1;
      var d = this.words[u];
      return !!(d & l);
    }, y.prototype.imaskn = function(n) {
      a(typeof n == "number" && n >= 0);
      var s = n % 26, u = (n - s) / 26;
      if (a(this.negative === 0, "imaskn works only with positive numbers"), this.length <= u)
        return this;
      if (s !== 0 && u++, this.length = Math.min(u, this.length), s !== 0) {
        var l = 67108863 ^ 67108863 >>> s << s;
        this.words[this.length - 1] &= l;
      }
      return this._strip();
    }, y.prototype.maskn = function(n) {
      return this.clone().imaskn(n);
    }, y.prototype.iaddn = function(n) {
      return a(typeof n == "number"), a(n < 67108864), n < 0 ? this.isubn(-n) : this.negative !== 0 ? this.length === 1 && (this.words[0] | 0) <= n ? (this.words[0] = n - (this.words[0] | 0), this.negative = 0, this) : (this.negative = 0, this.isubn(n), this.negative = 1, this) : this._iaddn(n);
    }, y.prototype._iaddn = function(n) {
      this.words[0] += n;
      for (var s = 0; s < this.length && this.words[s] >= 67108864; s++)
        this.words[s] -= 67108864, s === this.length - 1 ? this.words[s + 1] = 1 : this.words[s + 1]++;
      return this.length = Math.max(this.length, s + 1), this;
    }, y.prototype.isubn = function(n) {
      if (a(typeof n == "number"), a(n < 67108864), n < 0)
        return this.iaddn(-n);
      if (this.negative !== 0)
        return this.negative = 0, this.iaddn(n), this.negative = 1, this;
      if (this.words[0] -= n, this.length === 1 && this.words[0] < 0)
        this.words[0] = -this.words[0], this.negative = 1;
      else
        for (var s = 0; s < this.length && this.words[s] < 0; s++)
          this.words[s] += 67108864, this.words[s + 1] -= 1;
      return this._strip();
    }, y.prototype.addn = function(n) {
      return this.clone().iaddn(n);
    }, y.prototype.subn = function(n) {
      return this.clone().isubn(n);
    }, y.prototype.iabs = function() {
      return this.negative = 0, this;
    }, y.prototype.abs = function() {
      return this.clone().iabs();
    }, y.prototype._ishlnsubmul = function(n, s, u) {
      var l = n.length + u, d;
      this._expand(l);
      var b, h = 0;
      for (d = 0; d < n.length; d++) {
        b = (this.words[d + u] | 0) + h;
        var o = (n.words[d] | 0) * s;
        b -= o & 67108863, h = (b >> 26) - (o / 67108864 | 0), this.words[d + u] = b & 67108863;
      }
      for (; d < this.length - u; d++)
        b = (this.words[d + u] | 0) + h, h = b >> 26, this.words[d + u] = b & 67108863;
      if (h === 0)
        return this._strip();
      for (a(h === -1), h = 0, d = 0; d < this.length; d++)
        b = -(this.words[d] | 0) + h, h = b >> 26, this.words[d] = b & 67108863;
      return this.negative = 1, this._strip();
    }, y.prototype._wordDiv = function(n, s) {
      var u = this.length - n.length, l = this.clone(), d = n, b = d.words[d.length - 1] | 0, h = this._countBits(b);
      u = 26 - h, u !== 0 && (d = d.ushln(u), l.iushln(u), b = d.words[d.length - 1] | 0);
      var o = l.length - d.length, i;
      if (s !== "mod") {
        i = new y(null), i.length = o + 1, i.words = new Array(i.length);
        for (var m = 0; m < i.length; m++)
          i.words[m] = 0;
      }
      var C = l.clone()._ishlnsubmul(d, 1, o);
      C.negative === 0 && (l = C, i && (i.words[o] = 1));
      for (var p = o - 1; p >= 0; p--) {
        var g = (l.words[d.length + p] | 0) * 67108864 + (l.words[d.length + p - 1] | 0);
        for (g = Math.min(g / b | 0, 67108863), l._ishlnsubmul(d, g, p); l.negative !== 0; )
          g--, l.negative = 0, l._ishlnsubmul(d, 1, p), l.isZero() || (l.negative ^= 1);
        i && (i.words[p] = g);
      }
      return i && i._strip(), l._strip(), s !== "div" && u !== 0 && l.iushrn(u), {
        div: i || null,
        mod: l
      };
    }, y.prototype.divmod = function(n, s, u) {
      if (a(!n.isZero()), this.isZero())
        return {
          div: new y(0),
          mod: new y(0)
        };
      var l, d, b;
      return this.negative !== 0 && n.negative === 0 ? (b = this.neg().divmod(n, s), s !== "mod" && (l = b.div.neg()), s !== "div" && (d = b.mod.neg(), u && d.negative !== 0 && d.iadd(n)), {
        div: l,
        mod: d
      }) : this.negative === 0 && n.negative !== 0 ? (b = this.divmod(n.neg(), s), s !== "mod" && (l = b.div.neg()), {
        div: l,
        mod: b.mod
      }) : this.negative & n.negative ? (b = this.neg().divmod(n.neg(), s), s !== "div" && (d = b.mod.neg(), u && d.negative !== 0 && d.isub(n)), {
        div: b.div,
        mod: d
      }) : n.length > this.length || this.cmp(n) < 0 ? {
        div: new y(0),
        mod: this
      } : n.length === 1 ? s === "div" ? {
        div: this.divn(n.words[0]),
        mod: null
      } : s === "mod" ? {
        div: null,
        mod: new y(this.modrn(n.words[0]))
      } : {
        div: this.divn(n.words[0]),
        mod: new y(this.modrn(n.words[0]))
      } : this._wordDiv(n, s);
    }, y.prototype.div = function(n) {
      return this.divmod(n, "div", !1).div;
    }, y.prototype.mod = function(n) {
      return this.divmod(n, "mod", !1).mod;
    }, y.prototype.umod = function(n) {
      return this.divmod(n, "mod", !0).mod;
    }, y.prototype.divRound = function(n) {
      var s = this.divmod(n);
      if (s.mod.isZero())
        return s.div;
      var u = s.div.negative !== 0 ? s.mod.isub(n) : s.mod, l = n.ushrn(1), d = n.andln(1), b = u.cmp(l);
      return b < 0 || d === 1 && b === 0 ? s.div : s.div.negative !== 0 ? s.div.isubn(1) : s.div.iaddn(1);
    }, y.prototype.modrn = function(n) {
      var s = n < 0;
      s && (n = -n), a(n <= 67108863);
      for (var u = (1 << 26) % n, l = 0, d = this.length - 1; d >= 0; d--)
        l = (u * l + (this.words[d] | 0)) % n;
      return s ? -l : l;
    }, y.prototype.modn = function(n) {
      return this.modrn(n);
    }, y.prototype.idivn = function(n) {
      var s = n < 0;
      s && (n = -n), a(n <= 67108863);
      for (var u = 0, l = this.length - 1; l >= 0; l--) {
        var d = (this.words[l] | 0) + u * 67108864;
        this.words[l] = d / n | 0, u = d % n;
      }
      return this._strip(), s ? this.ineg() : this;
    }, y.prototype.divn = function(n) {
      return this.clone().idivn(n);
    }, y.prototype.egcd = function(n) {
      a(n.negative === 0), a(!n.isZero());
      var s = this, u = n.clone();
      s.negative !== 0 ? s = s.umod(n) : s = s.clone();
      for (var l = new y(1), d = new y(0), b = new y(0), h = new y(1), o = 0; s.isEven() && u.isEven(); )
        s.iushrn(1), u.iushrn(1), ++o;
      for (var i = u.clone(), m = s.clone(); !s.isZero(); ) {
        for (var C = 0, p = 1; !(s.words[0] & p) && C < 26; ++C, p <<= 1)
          ;
        if (C > 0)
          for (s.iushrn(C); C-- > 0; )
            (l.isOdd() || d.isOdd()) && (l.iadd(i), d.isub(m)), l.iushrn(1), d.iushrn(1);
        for (var g = 0, M = 1; !(u.words[0] & M) && g < 26; ++g, M <<= 1)
          ;
        if (g > 0)
          for (u.iushrn(g); g-- > 0; )
            (b.isOdd() || h.isOdd()) && (b.iadd(i), h.isub(m)), b.iushrn(1), h.iushrn(1);
        s.cmp(u) >= 0 ? (s.isub(u), l.isub(b), d.isub(h)) : (u.isub(s), b.isub(l), h.isub(d));
      }
      return {
        a: b,
        b: h,
        gcd: u.iushln(o)
      };
    }, y.prototype._invmp = function(n) {
      a(n.negative === 0), a(!n.isZero());
      var s = this, u = n.clone();
      s.negative !== 0 ? s = s.umod(n) : s = s.clone();
      for (var l = new y(1), d = new y(0), b = u.clone(); s.cmpn(1) > 0 && u.cmpn(1) > 0; ) {
        for (var h = 0, o = 1; !(s.words[0] & o) && h < 26; ++h, o <<= 1)
          ;
        if (h > 0)
          for (s.iushrn(h); h-- > 0; )
            l.isOdd() && l.iadd(b), l.iushrn(1);
        for (var i = 0, m = 1; !(u.words[0] & m) && i < 26; ++i, m <<= 1)
          ;
        if (i > 0)
          for (u.iushrn(i); i-- > 0; )
            d.isOdd() && d.iadd(b), d.iushrn(1);
        s.cmp(u) >= 0 ? (s.isub(u), l.isub(d)) : (u.isub(s), d.isub(l));
      }
      var C;
      return s.cmpn(1) === 0 ? C = l : C = d, C.cmpn(0) < 0 && C.iadd(n), C;
    }, y.prototype.gcd = function(n) {
      if (this.isZero())
        return n.abs();
      if (n.isZero())
        return this.abs();
      var s = this.clone(), u = n.clone();
      s.negative = 0, u.negative = 0;
      for (var l = 0; s.isEven() && u.isEven(); l++)
        s.iushrn(1), u.iushrn(1);
      do {
        for (; s.isEven(); )
          s.iushrn(1);
        for (; u.isEven(); )
          u.iushrn(1);
        var d = s.cmp(u);
        if (d < 0) {
          var b = s;
          s = u, u = b;
        } else if (d === 0 || u.cmpn(1) === 0)
          break;
        s.isub(u);
      } while (!0);
      return u.iushln(l);
    }, y.prototype.invm = function(n) {
      return this.egcd(n).a.umod(n);
    }, y.prototype.isEven = function() {
      return (this.words[0] & 1) === 0;
    }, y.prototype.isOdd = function() {
      return (this.words[0] & 1) === 1;
    }, y.prototype.andln = function(n) {
      return this.words[0] & n;
    }, y.prototype.bincn = function(n) {
      a(typeof n == "number");
      var s = n % 26, u = (n - s) / 26, l = 1 << s;
      if (this.length <= u)
        return this._expand(u + 1), this.words[u] |= l, this;
      for (var d = l, b = u; d !== 0 && b < this.length; b++) {
        var h = this.words[b] | 0;
        h += d, d = h >>> 26, h &= 67108863, this.words[b] = h;
      }
      return d !== 0 && (this.words[b] = d, this.length++), this;
    }, y.prototype.isZero = function() {
      return this.length === 1 && this.words[0] === 0;
    }, y.prototype.cmpn = function(n) {
      var s = n < 0;
      if (this.negative !== 0 && !s)
        return -1;
      if (this.negative === 0 && s)
        return 1;
      this._strip();
      var u;
      if (this.length > 1)
        u = 1;
      else {
        s && (n = -n), a(n <= 67108863, "Number is too big");
        var l = this.words[0] | 0;
        u = l === n ? 0 : l < n ? -1 : 1;
      }
      return this.negative !== 0 ? -u | 0 : u;
    }, y.prototype.cmp = function(n) {
      if (this.negative !== 0 && n.negative === 0)
        return -1;
      if (this.negative === 0 && n.negative !== 0)
        return 1;
      var s = this.ucmp(n);
      return this.negative !== 0 ? -s | 0 : s;
    }, y.prototype.ucmp = function(n) {
      if (this.length > n.length)
        return 1;
      if (this.length < n.length)
        return -1;
      for (var s = 0, u = this.length - 1; u >= 0; u--) {
        var l = this.words[u] | 0, d = n.words[u] | 0;
        if (l !== d) {
          l < d ? s = -1 : l > d && (s = 1);
          break;
        }
      }
      return s;
    }, y.prototype.gtn = function(n) {
      return this.cmpn(n) === 1;
    }, y.prototype.gt = function(n) {
      return this.cmp(n) === 1;
    }, y.prototype.gten = function(n) {
      return this.cmpn(n) >= 0;
    }, y.prototype.gte = function(n) {
      return this.cmp(n) >= 0;
    }, y.prototype.ltn = function(n) {
      return this.cmpn(n) === -1;
    }, y.prototype.lt = function(n) {
      return this.cmp(n) === -1;
    }, y.prototype.lten = function(n) {
      return this.cmpn(n) <= 0;
    }, y.prototype.lte = function(n) {
      return this.cmp(n) <= 0;
    }, y.prototype.eqn = function(n) {
      return this.cmpn(n) === 0;
    }, y.prototype.eq = function(n) {
      return this.cmp(n) === 0;
    }, y.red = function(n) {
      return new he(n);
    }, y.prototype.toRed = function(n) {
      return a(!this.red, "Already a number in reduction context"), a(this.negative === 0, "red works only with positives"), n.convertTo(this)._forceRed(n);
    }, y.prototype.fromRed = function() {
      return a(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this);
    }, y.prototype._forceRed = function(n) {
      return this.red = n, this;
    }, y.prototype.forceRed = function(n) {
      return a(!this.red, "Already a number in reduction context"), this._forceRed(n);
    }, y.prototype.redAdd = function(n) {
      return a(this.red, "redAdd works only with red numbers"), this.red.add(this, n);
    }, y.prototype.redIAdd = function(n) {
      return a(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, n);
    }, y.prototype.redSub = function(n) {
      return a(this.red, "redSub works only with red numbers"), this.red.sub(this, n);
    }, y.prototype.redISub = function(n) {
      return a(this.red, "redISub works only with red numbers"), this.red.isub(this, n);
    }, y.prototype.redShl = function(n) {
      return a(this.red, "redShl works only with red numbers"), this.red.shl(this, n);
    }, y.prototype.redMul = function(n) {
      return a(this.red, "redMul works only with red numbers"), this.red._verify2(this, n), this.red.mul(this, n);
    }, y.prototype.redIMul = function(n) {
      return a(this.red, "redMul works only with red numbers"), this.red._verify2(this, n), this.red.imul(this, n);
    }, y.prototype.redSqr = function() {
      return a(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this);
    }, y.prototype.redISqr = function() {
      return a(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this);
    }, y.prototype.redSqrt = function() {
      return a(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this);
    }, y.prototype.redInvm = function() {
      return a(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this);
    }, y.prototype.redNeg = function() {
      return a(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this);
    }, y.prototype.redPow = function(n) {
      return a(this.red && !n.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, n);
    };
    var Mt = {
      k256: null,
      p224: null,
      p192: null,
      p25519: null
    };
    function Ee(c, n) {
      this.name = c, this.p = new y(n, 16), this.n = this.p.bitLength(), this.k = new y(1).iushln(this.n).isub(this.p), this.tmp = this._tmp();
    }
    Ee.prototype._tmp = function() {
      var n = new y(null);
      return n.words = new Array(Math.ceil(this.n / 13)), n;
    }, Ee.prototype.ireduce = function(n) {
      var s = n, u;
      do
        this.split(s, this.tmp), s = this.imulK(s), s = s.iadd(this.tmp), u = s.bitLength();
      while (u > this.n);
      var l = u < this.n ? -1 : s.ucmp(this.p);
      return l === 0 ? (s.words[0] = 0, s.length = 1) : l > 0 ? s.isub(this.p) : s.strip !== void 0 ? s.strip() : s._strip(), s;
    }, Ee.prototype.split = function(n, s) {
      n.iushrn(this.n, 0, s);
    }, Ee.prototype.imulK = function(n) {
      return n.imul(this.k);
    };
    function Ye() {
      Ee.call(
        this,
        "k256",
        "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
      );
    }
    f(Ye, Ee), Ye.prototype.split = function(n, s) {
      for (var u = 4194303, l = Math.min(n.length, 9), d = 0; d < l; d++)
        s.words[d] = n.words[d];
      if (s.length = l, n.length <= 9) {
        n.words[0] = 0, n.length = 1;
        return;
      }
      var b = n.words[9];
      for (s.words[s.length++] = b & u, d = 10; d < n.length; d++) {
        var h = n.words[d] | 0;
        n.words[d - 10] = (h & u) << 4 | b >>> 22, b = h;
      }
      b >>>= 22, n.words[d - 10] = b, b === 0 && n.length > 10 ? n.length -= 10 : n.length -= 9;
    }, Ye.prototype.imulK = function(n) {
      n.words[n.length] = 0, n.words[n.length + 1] = 0, n.length += 2;
      for (var s = 0, u = 0; u < n.length; u++) {
        var l = n.words[u] | 0;
        s += l * 977, n.words[u] = s & 67108863, s = l * 64 + (s / 67108864 | 0);
      }
      return n.words[n.length - 1] === 0 && (n.length--, n.words[n.length - 1] === 0 && n.length--), n;
    };
    function et() {
      Ee.call(
        this,
        "p224",
        "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
      );
    }
    f(et, Ee);
    function Et() {
      Ee.call(
        this,
        "p192",
        "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
      );
    }
    f(Et, Ee);
    function St() {
      Ee.call(
        this,
        "25519",
        "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
      );
    }
    f(St, Ee), St.prototype.imulK = function(n) {
      for (var s = 0, u = 0; u < n.length; u++) {
        var l = (n.words[u] | 0) * 19 + s, d = l & 67108863;
        l >>>= 26, n.words[u] = d, s = l;
      }
      return s !== 0 && (n.words[n.length++] = s), n;
    }, y._prime = function(n) {
      if (Mt[n])
        return Mt[n];
      var s;
      if (n === "k256")
        s = new Ye();
      else if (n === "p224")
        s = new et();
      else if (n === "p192")
        s = new Et();
      else if (n === "p25519")
        s = new St();
      else
        throw new Error("Unknown prime " + n);
      return Mt[n] = s, s;
    };
    function he(c) {
      if (typeof c == "string") {
        var n = y._prime(c);
        this.m = n.p, this.prime = n;
      } else
        a(c.gtn(1), "modulus must be greater than 1"), this.m = c, this.prime = null;
    }
    he.prototype._verify1 = function(n) {
      a(n.negative === 0, "red works only with positives"), a(n.red, "red works only with red numbers");
    }, he.prototype._verify2 = function(n, s) {
      a((n.negative | s.negative) === 0, "red works only with positives"), a(
        n.red && n.red === s.red,
        "red works only with red numbers"
      );
    }, he.prototype.imod = function(n) {
      return this.prime ? this.prime.ireduce(n)._forceRed(this) : (N(n, n.umod(this.m)._forceRed(this)), n);
    }, he.prototype.neg = function(n) {
      return n.isZero() ? n.clone() : this.m.sub(n)._forceRed(this);
    }, he.prototype.add = function(n, s) {
      this._verify2(n, s);
      var u = n.add(s);
      return u.cmp(this.m) >= 0 && u.isub(this.m), u._forceRed(this);
    }, he.prototype.iadd = function(n, s) {
      this._verify2(n, s);
      var u = n.iadd(s);
      return u.cmp(this.m) >= 0 && u.isub(this.m), u;
    }, he.prototype.sub = function(n, s) {
      this._verify2(n, s);
      var u = n.sub(s);
      return u.cmpn(0) < 0 && u.iadd(this.m), u._forceRed(this);
    }, he.prototype.isub = function(n, s) {
      this._verify2(n, s);
      var u = n.isub(s);
      return u.cmpn(0) < 0 && u.iadd(this.m), u;
    }, he.prototype.shl = function(n, s) {
      return this._verify1(n), this.imod(n.ushln(s));
    }, he.prototype.imul = function(n, s) {
      return this._verify2(n, s), this.imod(n.imul(s));
    }, he.prototype.mul = function(n, s) {
      return this._verify2(n, s), this.imod(n.mul(s));
    }, he.prototype.isqr = function(n) {
      return this.imul(n, n.clone());
    }, he.prototype.sqr = function(n) {
      return this.mul(n, n);
    }, he.prototype.sqrt = function(n) {
      if (n.isZero())
        return n.clone();
      var s = this.m.andln(3);
      if (a(s % 2 === 1), s === 3) {
        var u = this.m.add(new y(1)).iushrn(2);
        return this.pow(n, u);
      }
      for (var l = this.m.subn(1), d = 0; !l.isZero() && l.andln(1) === 0; )
        d++, l.iushrn(1);
      a(!l.isZero());
      var b = new y(1).toRed(this), h = b.redNeg(), o = this.m.subn(1).iushrn(1), i = this.m.bitLength();
      for (i = new y(2 * i * i).toRed(this); this.pow(i, o).cmp(h) !== 0; )
        i.redIAdd(h);
      for (var m = this.pow(i, l), C = this.pow(n, l.addn(1).iushrn(1)), p = this.pow(n, l), g = d; p.cmp(b) !== 0; ) {
        for (var M = p, w = 0; M.cmp(b) !== 0; w++)
          M = M.redSqr();
        a(w < g);
        var k = this.pow(m, new y(1).iushln(g - w - 1));
        C = C.redMul(k), m = k.redSqr(), p = p.redMul(m), g = w;
      }
      return C;
    }, he.prototype.invm = function(n) {
      var s = n._invmp(this.m);
      return s.negative !== 0 ? (s.negative = 0, this.imod(s).redNeg()) : this.imod(s);
    }, he.prototype.pow = function(n, s) {
      if (s.isZero())
        return new y(1).toRed(this);
      if (s.cmpn(1) === 0)
        return n.clone();
      var u = 4, l = new Array(1 << u);
      l[0] = new y(1).toRed(this), l[1] = n;
      for (var d = 2; d < l.length; d++)
        l[d] = this.mul(l[d - 1], n);
      var b = l[0], h = 0, o = 0, i = s.bitLength() % 26;
      for (i === 0 && (i = 26), d = s.length - 1; d >= 0; d--) {
        for (var m = s.words[d], C = i - 1; C >= 0; C--) {
          var p = m >> C & 1;
          if (b !== l[0] && (b = this.sqr(b)), p === 0 && h === 0) {
            o = 0;
            continue;
          }
          h <<= 1, h |= p, o++, !(o !== u && (d !== 0 || C !== 0)) && (b = this.mul(b, l[h]), o = 0, h = 0);
        }
        i = 26;
      }
      return b;
    }, he.prototype.convertTo = function(n) {
      var s = n.umod(this.m);
      return s === n ? s.clone() : s;
    }, he.prototype.convertFrom = function(n) {
      var s = n.clone();
      return s.red = null, s;
    }, y.mont = function(n) {
      return new Ue(n);
    };
    function Ue(c) {
      he.call(this, c), this.shift = this.m.bitLength(), this.shift % 26 !== 0 && (this.shift += 26 - this.shift % 26), this.r = new y(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), this.minv = this.r.sub(this.minv);
    }
    f(Ue, he), Ue.prototype.convertTo = function(n) {
      return this.imod(n.ushln(this.shift));
    }, Ue.prototype.convertFrom = function(n) {
      var s = this.imod(n.mul(this.rinv));
      return s.red = null, s;
    }, Ue.prototype.imul = function(n, s) {
      if (n.isZero() || s.isZero())
        return n.words[0] = 0, n.length = 1, n;
      var u = n.imul(s), l = u.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), d = u.isub(l).iushrn(this.shift), b = d;
      return d.cmp(this.m) >= 0 ? b = d.isub(this.m) : d.cmpn(0) < 0 && (b = d.iadd(this.m)), b._forceRed(this);
    }, Ue.prototype.mul = function(n, s) {
      if (n.isZero() || s.isZero())
        return new y(0)._forceRed(this);
      var u = n.mul(s), l = u.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), d = u.isub(l).iushrn(this.shift), b = d;
      return d.cmp(this.m) >= 0 ? b = d.isub(this.m) : d.cmpn(0) < 0 && (b = d.iadd(this.m)), b._forceRed(this);
    }, Ue.prototype.invm = function(n) {
      var s = this.imod(n._invmp(this.m).mul(this.r2));
      return s._forceRed(this);
    };
  })(r, Kn);
})(_n);
var xa = _n.exports;
const Aa = /* @__PURE__ */ Zn(xa), Ea = "logger/5.7.0";
let Sn = !1, Cn = !1;
const Gt = { debug: 1, default: 2, info: 2, warning: 3, error: 4, off: 5 };
let On = Gt.default, fn = null;
function Sa() {
  try {
    const r = [];
    if (["NFD", "NFC", "NFKD", "NFKC"].forEach((e) => {
      try {
        if ("test".normalize(e) !== "test")
          throw new Error("bad normalize");
      } catch {
        r.push(e);
      }
    }), r.length)
      throw new Error("missing " + r.join(", "));
    if (String.fromCharCode(233).normalize("NFD") !== String.fromCharCode(101, 769))
      throw new Error("broken implementation");
  } catch (r) {
    return r.message;
  }
  return null;
}
const Rn = Sa();
var hn;
(function(r) {
  r.DEBUG = "DEBUG", r.INFO = "INFO", r.WARNING = "WARNING", r.ERROR = "ERROR", r.OFF = "OFF";
})(hn || (hn = {}));
var Ne;
(function(r) {
  r.UNKNOWN_ERROR = "UNKNOWN_ERROR", r.NOT_IMPLEMENTED = "NOT_IMPLEMENTED", r.UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION", r.NETWORK_ERROR = "NETWORK_ERROR", r.SERVER_ERROR = "SERVER_ERROR", r.TIMEOUT = "TIMEOUT", r.BUFFER_OVERRUN = "BUFFER_OVERRUN", r.NUMERIC_FAULT = "NUMERIC_FAULT", r.MISSING_NEW = "MISSING_NEW", r.INVALID_ARGUMENT = "INVALID_ARGUMENT", r.MISSING_ARGUMENT = "MISSING_ARGUMENT", r.UNEXPECTED_ARGUMENT = "UNEXPECTED_ARGUMENT", r.CALL_EXCEPTION = "CALL_EXCEPTION", r.INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS", r.NONCE_EXPIRED = "NONCE_EXPIRED", r.REPLACEMENT_UNDERPRICED = "REPLACEMENT_UNDERPRICED", r.UNPREDICTABLE_GAS_LIMIT = "UNPREDICTABLE_GAS_LIMIT", r.TRANSACTION_REPLACED = "TRANSACTION_REPLACED", r.ACTION_REJECTED = "ACTION_REJECTED";
})(Ne || (Ne = {}));
const Nn = "0123456789abcdef";
class O {
  constructor(e) {
    Object.defineProperty(this, "version", {
      enumerable: !0,
      value: e,
      writable: !1
    });
  }
  _log(e, t) {
    const a = e.toLowerCase();
    Gt[a] == null && this.throwArgumentError("invalid log level name", "logLevel", e), !(On > Gt[a]) && console.log.apply(console, t);
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
  makeError(e, t, a) {
    if (Cn)
      return this.makeError("censored error", t, {});
    t || (t = O.errors.UNKNOWN_ERROR), a || (a = {});
    const f = [];
    Object.keys(a).forEach((x) => {
      const E = a[x];
      try {
        if (E instanceof Uint8Array) {
          let N = "";
          for (let B = 0; B < E.length; B++)
            N += Nn[E[B] >> 4], N += Nn[E[B] & 15];
          f.push(x + "=Uint8Array(0x" + N + ")");
        } else
          f.push(x + "=" + JSON.stringify(E));
      } catch {
        f.push(x + "=" + JSON.stringify(a[x].toString()));
      }
    }), f.push(`code=${t}`), f.push(`version=${this.version}`);
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
    T && (e += " [ See: https://links.ethers.org/v5-errors-" + T + " ]"), f.length && (e += " (" + f.join(", ") + ")");
    const _ = new Error(e);
    return _.reason = y, _.code = t, Object.keys(a).forEach(function(x) {
      _[x] = a[x];
    }), _;
  }
  throwError(e, t, a) {
    throw this.makeError(e, t, a);
  }
  throwArgumentError(e, t, a) {
    return this.throwError(e, O.errors.INVALID_ARGUMENT, {
      argument: t,
      value: a
    });
  }
  assert(e, t, a, f) {
    e || this.throwError(t, a, f);
  }
  assertArgument(e, t, a, f) {
    e || this.throwArgumentError(t, a, f);
  }
  checkNormalize(e) {
    Rn && this.throwError("platform missing String.prototype.normalize", O.errors.UNSUPPORTED_OPERATION, {
      operation: "String.prototype.normalize",
      form: Rn
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
  checkArgumentCount(e, t, a) {
    a ? a = ": " + a : a = "", e < t && this.throwError("missing argument" + a, O.errors.MISSING_ARGUMENT, {
      count: e,
      expectedCount: t
    }), e > t && this.throwError("too many arguments" + a, O.errors.UNEXPECTED_ARGUMENT, {
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
    return fn || (fn = new O(Ea)), fn;
  }
  static setCensorship(e, t) {
    if (!e && t && this.globalLogger().throwError("cannot permanently disable censorship", O.errors.UNSUPPORTED_OPERATION, {
      operation: "setCensorship"
    }), Sn) {
      if (!e)
        return;
      this.globalLogger().throwError("error censorship permanent", O.errors.UNSUPPORTED_OPERATION, {
        operation: "setCensorship"
      });
    }
    Cn = !!e, Sn = !!t;
  }
  static setLogLevel(e) {
    const t = Gt[e.toLowerCase()];
    if (t == null) {
      O.globalLogger().warn("invalid log level - " + e);
      return;
    }
    On = t;
  }
  static from(e) {
    return new O(e);
  }
}
O.errors = Ne;
O.levels = hn;
const Ca = "bytes/5.7.0", We = new O(Ca);
function $n(r) {
  return !!r.toHexString;
}
function Ot(r) {
  return r.slice || (r.slice = function() {
    const e = Array.prototype.slice.call(arguments);
    return Ot(new Uint8Array(Array.prototype.slice.apply(r, e)));
  }), r;
}
function Dn(r) {
  return typeof r == "number" && r == r && r % 1 === 0;
}
function kn(r) {
  if (r == null)
    return !1;
  if (r.constructor === Uint8Array)
    return !0;
  if (typeof r == "string" || !Dn(r.length) || r.length < 0)
    return !1;
  for (let e = 0; e < r.length; e++) {
    const t = r[e];
    if (!Dn(t) || t < 0 || t >= 256)
      return !1;
  }
  return !0;
}
function Ce(r, e) {
  if (e || (e = {}), typeof r == "number") {
    We.checkSafeUint53(r, "invalid arrayify value");
    const t = [];
    for (; r; )
      t.unshift(r & 255), r = parseInt(String(r / 256));
    return t.length === 0 && t.push(0), Ot(new Uint8Array(t));
  }
  if (e.allowMissingPrefix && typeof r == "string" && r.substring(0, 2) !== "0x" && (r = "0x" + r), $n(r) && (r = r.toHexString()), De(r)) {
    let t = r.substring(2);
    t.length % 2 && (e.hexPad === "left" ? t = "0" + t : e.hexPad === "right" ? t += "0" : We.throwArgumentError("hex data is odd-length", "value", r));
    const a = [];
    for (let f = 0; f < t.length; f += 2)
      a.push(parseInt(t.substring(f, f + 2), 16));
    return Ot(new Uint8Array(a));
  }
  return kn(r) ? Ot(new Uint8Array(r)) : We.throwArgumentError("invalid arrayify value", "value", r);
}
function vt(r) {
  const e = r.map((f) => Ce(f)), t = e.reduce((f, y) => f + y.length, 0), a = new Uint8Array(t);
  return e.reduce((f, y) => (a.set(y, f), f + y.length), 0), Ot(a);
}
function De(r, e) {
  return !(typeof r != "string" || !r.match(/^0x[0-9A-Fa-f]*$/) || e && r.length !== 2 + 2 * e);
}
const Tn = "0123456789abcdef";
function _e(r, e) {
  if (e || (e = {}), typeof r == "number") {
    We.checkSafeUint53(r, "invalid hexlify value");
    let t = "";
    for (; r; )
      t = Tn[r & 15] + t, r = Math.floor(r / 16);
    return t.length ? (t.length % 2 && (t = "0" + t), "0x" + t) : "0x00";
  }
  if (typeof r == "bigint")
    return r = r.toString(16), r.length % 2 ? "0x0" + r : "0x" + r;
  if (e.allowMissingPrefix && typeof r == "string" && r.substring(0, 2) !== "0x" && (r = "0x" + r), $n(r))
    return r.toHexString();
  if (De(r))
    return r.length % 2 && (e.hexPad === "left" ? r = "0x0" + r.substring(2) : e.hexPad === "right" ? r += "0" : We.throwArgumentError("hex data is odd-length", "value", r)), r.toLowerCase();
  if (kn(r)) {
    let t = "0x";
    for (let a = 0; a < r.length; a++) {
      let f = r[a];
      t += Tn[(f & 240) >> 4] + Tn[f & 15];
    }
    return t;
  }
  return We.throwArgumentError("invalid hexlify value", "value", r);
}
function Oa(r, e, t) {
  return typeof r != "string" ? r = _e(r) : (!De(r) || r.length % 2) && We.throwArgumentError("invalid hexData", "value", r), e = 2 + 2 * e, t != null ? "0x" + r.substring(e, 2 + 2 * t) : "0x" + r.substring(e);
}
function Ra(r) {
  let e = "0x";
  return r.forEach((t) => {
    e += _e(t).substring(2);
  }), e;
}
function Qn(r, e) {
  for (typeof r != "string" ? r = _e(r) : De(r) || We.throwArgumentError("invalid hex string", "value", r), r.length > 2 * e + 2 && We.throwArgumentError("value out of range", "value", arguments[1]); r.length < 2 * e + 2; )
    r = "0x0" + r.substring(2);
  return r;
}
const Na = "bignumber/5.7.0";
var Zt = Aa.BN;
const Ve = new O(Na), bn = {}, Fn = 9007199254740991;
let Pn = !1;
class be {
  constructor(e, t) {
    e !== bn && Ve.throwError("cannot call constructor directly; use BigNumber.from", O.errors.UNSUPPORTED_OPERATION, {
      operation: "new (BigNumber)"
    }), this._hex = t, this._isBigNumber = !0, Object.freeze(this);
  }
  fromTwos(e) {
    return Se(D(this).fromTwos(e));
  }
  toTwos(e) {
    return Se(D(this).toTwos(e));
  }
  abs() {
    return this._hex[0] === "-" ? be.from(this._hex.substring(1)) : this;
  }
  add(e) {
    return Se(D(this).add(D(e)));
  }
  sub(e) {
    return Se(D(this).sub(D(e)));
  }
  div(e) {
    return be.from(e).isZero() && Re("division-by-zero", "div"), Se(D(this).div(D(e)));
  }
  mul(e) {
    return Se(D(this).mul(D(e)));
  }
  mod(e) {
    const t = D(e);
    return t.isNeg() && Re("division-by-zero", "mod"), Se(D(this).umod(t));
  }
  pow(e) {
    const t = D(e);
    return t.isNeg() && Re("negative-power", "pow"), Se(D(this).pow(t));
  }
  and(e) {
    const t = D(e);
    return (this.isNegative() || t.isNeg()) && Re("unbound-bitwise-result", "and"), Se(D(this).and(t));
  }
  or(e) {
    const t = D(e);
    return (this.isNegative() || t.isNeg()) && Re("unbound-bitwise-result", "or"), Se(D(this).or(t));
  }
  xor(e) {
    const t = D(e);
    return (this.isNegative() || t.isNeg()) && Re("unbound-bitwise-result", "xor"), Se(D(this).xor(t));
  }
  mask(e) {
    return (this.isNegative() || e < 0) && Re("negative-width", "mask"), Se(D(this).maskn(e));
  }
  shl(e) {
    return (this.isNegative() || e < 0) && Re("negative-width", "shl"), Se(D(this).shln(e));
  }
  shr(e) {
    return (this.isNegative() || e < 0) && Re("negative-width", "shr"), Se(D(this).shrn(e));
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
    return arguments.length > 0 && (arguments[0] === 10 ? Pn || (Pn = !0, Ve.warn("BigNumber.toString does not accept any parameters; base-10 is assumed")) : arguments[0] === 16 ? Ve.throwError("BigNumber.toString does not accept any parameters; use bigNumber.toHexString()", O.errors.UNEXPECTED_ARGUMENT, {}) : Ve.throwError("BigNumber.toString does not accept parameters", O.errors.UNEXPECTED_ARGUMENT, {})), D(this).toString(10);
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
      return e.match(/^-?0x[0-9a-f]+$/i) ? new be(bn, Nt(e)) : e.match(/^-?[0-9]+$/) ? new be(bn, Nt(new Zt(e))) : Ve.throwArgumentError("invalid BigNumber string", "value", e);
    if (typeof e == "number")
      return e % 1 && Re("underflow", "BigNumber.from", e), (e >= Fn || e <= -Fn) && Re("overflow", "BigNumber.from", e), be.from(String(e));
    const t = e;
    if (typeof t == "bigint")
      return be.from(t.toString());
    if (kn(t))
      return be.from(_e(t));
    if (t)
      if (t.toHexString) {
        const a = t.toHexString();
        if (typeof a == "string")
          return be.from(a);
      } else {
        let a = t._hex;
        if (a == null && t.type === "BigNumber" && (a = t.hex), typeof a == "string" && (De(a) || a[0] === "-" && De(a.substring(1))))
          return be.from(a);
      }
    return Ve.throwArgumentError("invalid BigNumber value", "value", e);
  }
  static isBigNumber(e) {
    return !!(e && e._isBigNumber);
  }
}
function Nt(r) {
  if (typeof r != "string")
    return Nt(r.toString(16));
  if (r[0] === "-")
    return r = r.substring(1), r[0] === "-" && Ve.throwArgumentError("invalid hex", "value", r), r = Nt(r), r === "0x00" ? r : "-" + r;
  if (r.substring(0, 2) !== "0x" && (r = "0x" + r), r === "0x")
    return "0x00";
  for (r.length % 2 && (r = "0x0" + r.substring(2)); r.length > 4 && r.substring(0, 4) === "0x00"; )
    r = "0x" + r.substring(4);
  return r;
}
function Se(r) {
  return be.from(Nt(r));
}
function D(r) {
  const e = be.from(r).toHexString();
  return e[0] === "-" ? new Zt("-" + e.substring(3), 16) : new Zt(e.substring(2), 16);
}
function Re(r, e, t) {
  const a = { fault: r, operation: e };
  return t != null && (a.value = t), Ve.throwError(r, O.errors.NUMERIC_FAULT, a);
}
function Da(r) {
  return new Zt(r, 36).toString(16);
}
const Fa = "properties/5.7.0";
globalThis && globalThis.__awaiter;
const Jn = new O(Fa);
function xe(r, e, t) {
  Object.defineProperty(r, e, {
    enumerable: !0,
    value: t,
    writable: !1
  });
}
function zt(r, e) {
  for (let t = 0; t < 32; t++) {
    if (r[e])
      return r[e];
    if (!r.prototype || typeof r.prototype != "object")
      break;
    r = Object.getPrototypeOf(r.prototype).constructor;
  }
  return null;
}
const Pa = { bigint: !0, boolean: !0, function: !0, number: !0, string: !0 };
function Xn(r) {
  if (r == null || Pa[typeof r])
    return !0;
  if (Array.isArray(r) || typeof r == "object") {
    if (!Object.isFrozen(r))
      return !1;
    const e = Object.keys(r);
    for (let t = 0; t < e.length; t++) {
      let a = null;
      try {
        a = r[e[t]];
      } catch {
        continue;
      }
      if (!Xn(a))
        return !1;
    }
    return !0;
  }
  return Jn.throwArgumentError(`Cannot deepCopy ${typeof r}`, "object", r);
}
function La(r) {
  if (Xn(r))
    return r;
  if (Array.isArray(r))
    return Object.freeze(r.map((e) => gn(e)));
  if (typeof r == "object") {
    const e = {};
    for (const t in r) {
      const a = r[t];
      a !== void 0 && xe(e, t, gn(a));
    }
    return e;
  }
  return Jn.throwArgumentError(`Cannot deepCopy ${typeof r}`, "object", r);
}
function gn(r) {
  return La(r);
}
class Yt {
  constructor(e) {
    for (const t in e)
      this[t] = gn(e[t]);
  }
}
const Bt = "abi/5.7.0", F = new O(Bt), ht = {};
let Ln = { calldata: !0, memory: !0, storage: !0 }, Ba = { calldata: !0, memory: !0 };
function Ht(r, e) {
  if (r === "bytes" || r === "string") {
    if (Ln[e])
      return !0;
  } else if (r === "address") {
    if (e === "payable")
      return !0;
  } else if ((r.indexOf("[") >= 0 || r === "tuple") && Ba[e])
    return !0;
  return (Ln[e] || e === "payable") && F.throwArgumentError("invalid modifier", "name", e), !1;
}
function Ua(r, e) {
  let t = r;
  function a(_) {
    F.throwArgumentError(`unexpected character at position ${_}`, "param", r);
  }
  r = r.replace(/\s/g, " ");
  function f(_) {
    let x = { type: "", name: "", parent: _, state: { allowType: !0 } };
    return e && (x.indexed = !1), x;
  }
  let y = { type: "", name: "", state: { allowType: !0 } }, T = y;
  for (let _ = 0; _ < r.length; _++) {
    let x = r[_];
    switch (x) {
      case "(":
        T.state.allowType && T.type === "" ? T.type = "tuple" : T.state.allowParams || a(_), T.state.allowType = !1, T.type = _t(T.type), T.components = [f(T)], T = T.components[0];
        break;
      case ")":
        delete T.state, T.name === "indexed" && (e || a(_), T.indexed = !0, T.name = ""), Ht(T.type, T.name) && (T.name = ""), T.type = _t(T.type);
        let E = T;
        T = T.parent, T || a(_), delete E.parent, T.state.allowParams = !1, T.state.allowName = !0, T.state.allowArray = !0;
        break;
      case ",":
        delete T.state, T.name === "indexed" && (e || a(_), T.indexed = !0, T.name = ""), Ht(T.type, T.name) && (T.name = ""), T.type = _t(T.type);
        let N = f(T.parent);
        T.parent.components.push(N), delete T.parent, T = N;
        break;
      case " ":
        T.state.allowType && T.type !== "" && (T.type = _t(T.type), delete T.state.allowType, T.state.allowName = !0, T.state.allowParams = !0), T.state.allowName && T.name !== "" && (T.name === "indexed" ? (e || a(_), T.indexed && a(_), T.indexed = !0, T.name = "") : Ht(T.type, T.name) ? T.name = "" : T.state.allowName = !1);
        break;
      case "[":
        T.state.allowArray || a(_), T.type += x, T.state.allowArray = !1, T.state.allowName = !1, T.state.readArray = !0;
        break;
      case "]":
        T.state.readArray || a(_), T.type += x, T.state.readArray = !1, T.state.allowArray = !0, T.state.allowName = !0;
        break;
      default:
        T.state.allowType ? (T.type += x, T.state.allowParams = !0, T.state.allowArray = !0) : T.state.allowName ? (T.name += x, delete T.state.allowArray) : T.state.readArray ? T.type += x : a(_);
    }
  }
  return T.parent && F.throwArgumentError("unexpected eof", "param", r), delete y.state, T.name === "indexed" ? (e || a(t.length - 7), T.indexed && a(t.length - 7), T.indexed = !0, T.name = "") : Ht(T.type, T.name) && (T.name = ""), y.type = _t(y.type), y;
}
function Kt(r, e) {
  for (let t in e)
    xe(r, t, e[t]);
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
}), Va = new RegExp(/^(.*)\[([0-9]*)\]$/);
class ve {
  constructor(e, t) {
    e !== ht && F.throwError("use fromString", O.errors.UNSUPPORTED_OPERATION, {
      operation: "new ParamType()"
    }), Kt(this, t);
    let a = this.type.match(Va);
    a ? Kt(this, {
      arrayLength: parseInt(a[2] || "-1"),
      arrayChildren: ve.fromObject({
        type: a[1],
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
      let a = {
        type: this.baseType === "tuple" ? "tuple" : this.type,
        name: this.name || void 0
      };
      return typeof this.indexed == "boolean" && (a.indexed = this.indexed), this.components && (a.components = this.components.map((f) => JSON.parse(f.format(e)))), JSON.stringify(a);
    }
    let t = "";
    return this.baseType === "array" ? (t += this.arrayChildren.format(e), t += "[" + (this.arrayLength < 0 ? "" : String(this.arrayLength)) + "]") : this.baseType === "tuple" ? (e !== P.sighash && (t += this.type), t += "(" + this.components.map((a) => a.format(e)).join(e === P.full ? ", " : ",") + ")") : t += this.type, e !== P.sighash && (this.indexed === !0 && (t += " indexed"), e === P.full && this.name && (t += " " + this.name)), t;
  }
  static from(e, t) {
    return typeof e == "string" ? ve.fromString(e, t) : ve.fromObject(e);
  }
  static fromObject(e) {
    return ve.isParamType(e) ? e : new ve(ht, {
      name: e.name || null,
      type: _t(e.type),
      indexed: e.indexed == null ? null : !!e.indexed,
      components: e.components ? e.components.map(ve.fromObject) : null
    });
  }
  static fromString(e, t) {
    function a(f) {
      return ve.fromObject({
        name: f.name,
        type: f.type,
        indexed: f.indexed,
        components: f.components
      });
    }
    return a(Ua(e, !!t));
  }
  static isParamType(e) {
    return !!(e != null && e._isParamType);
  }
}
function Dt(r, e) {
  return Ha(r).map((t) => ve.fromString(t, e));
}
class je {
  constructor(e, t) {
    e !== ht && F.throwError("use a static from method", O.errors.UNSUPPORTED_OPERATION, {
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
        return qe.fromObject(e);
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
    return e = e.replace(/\s/g, " "), e = e.replace(/\(/g, " (").replace(/\)/g, ") ").replace(/\s+/g, " "), e = e.trim(), e.split(" ")[0] === "event" ? qe.fromString(e.substring(5).trim()) : e.split(" ")[0] === "function" ? Be.fromString(e.substring(8).trim()) : e.split("(")[0].trim() === "constructor" ? Le.fromString(e.trim()) : e.split(" ")[0] === "error" ? Xe.fromString(e.substring(5).trim()) : F.throwArgumentError("unsupported fragment", "value", e);
  }
  static isFragment(e) {
    return !!(e && e._isFragment);
  }
}
class qe extends je {
  format(e) {
    if (e || (e = P.sighash), P[e] || F.throwArgumentError("invalid format type", "format", e), e === P.json)
      return JSON.stringify({
        type: "event",
        anonymous: this.anonymous,
        name: this.name,
        inputs: this.inputs.map((a) => JSON.parse(a.format(e)))
      });
    let t = "";
    return e !== P.sighash && (t += "event "), t += this.name + "(" + this.inputs.map((a) => a.format(e)).join(e === P.full ? ", " : ",") + ") ", e !== P.sighash && this.anonymous && (t += "anonymous "), t.trim();
  }
  static from(e) {
    return typeof e == "string" ? qe.fromString(e) : qe.fromObject(e);
  }
  static fromObject(e) {
    if (qe.isEventFragment(e))
      return e;
    e.type !== "event" && F.throwArgumentError("invalid event object", "value", e);
    const t = {
      name: Ft(e.name),
      anonymous: e.anonymous,
      inputs: e.inputs ? e.inputs.map(ve.fromObject) : [],
      type: "event"
    };
    return new qe(ht, t);
  }
  static fromString(e) {
    let t = e.match(Pt);
    t || F.throwArgumentError("invalid event string", "value", e);
    let a = !1;
    return t[3].split(" ").forEach((f) => {
      switch (f.trim()) {
        case "anonymous":
          a = !0;
          break;
        case "":
          break;
        default:
          F.warn("unknown modifier: " + f);
      }
    }), qe.fromObject({
      name: t[1].trim(),
      anonymous: a,
      inputs: Dt(t[2], !0),
      type: "event"
    });
  }
  static isEventFragment(e) {
    return e && e._isFragment && e.type === "event";
  }
}
function Yn(r, e) {
  e.gas = null;
  let t = r.split("@");
  return t.length !== 1 ? (t.length > 2 && F.throwArgumentError("invalid human-readable ABI signature", "value", r), t[1].match(/^[0-9]+$/) || F.throwArgumentError("invalid human-readable ABI signature gas", "value", r), e.gas = be.from(t[1]), t[0]) : r;
}
function ea(r, e) {
  e.constant = !1, e.payable = !1, e.stateMutability = "nonpayable", r.split(" ").forEach((t) => {
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
function ta(r) {
  let e = {
    constant: !1,
    payable: !0,
    stateMutability: "payable"
  };
  return r.stateMutability != null ? (e.stateMutability = r.stateMutability, e.constant = e.stateMutability === "view" || e.stateMutability === "pure", r.constant != null && !!r.constant !== e.constant && F.throwArgumentError("cannot have constant function with mutability " + e.stateMutability, "value", r), e.payable = e.stateMutability === "payable", r.payable != null && !!r.payable !== e.payable && F.throwArgumentError("cannot have payable function with mutability " + e.stateMutability, "value", r)) : r.payable != null ? (e.payable = !!r.payable, r.constant == null && !e.payable && r.type !== "constructor" && F.throwArgumentError("unable to determine stateMutability", "value", r), e.constant = !!r.constant, e.constant ? e.stateMutability = "view" : e.stateMutability = e.payable ? "payable" : "nonpayable", e.payable && e.constant && F.throwArgumentError("cannot have constant payable function", "value", r)) : r.constant != null ? (e.constant = !!r.constant, e.payable = !e.constant, e.stateMutability = e.constant ? "view" : "payable") : r.type !== "constructor" && F.throwArgumentError("unable to determine stateMutability", "value", r), e;
}
class Le extends je {
  format(e) {
    if (e || (e = P.sighash), P[e] || F.throwArgumentError("invalid format type", "format", e), e === P.json)
      return JSON.stringify({
        type: "constructor",
        stateMutability: this.stateMutability !== "nonpayable" ? this.stateMutability : void 0,
        payable: this.payable,
        gas: this.gas ? this.gas.toNumber() : void 0,
        inputs: this.inputs.map((a) => JSON.parse(a.format(e)))
      });
    e === P.sighash && F.throwError("cannot format a constructor for sighash", O.errors.UNSUPPORTED_OPERATION, {
      operation: "format(sighash)"
    });
    let t = "constructor(" + this.inputs.map((a) => a.format(e)).join(e === P.full ? ", " : ",") + ") ";
    return this.stateMutability && this.stateMutability !== "nonpayable" && (t += this.stateMutability + " "), t.trim();
  }
  static from(e) {
    return typeof e == "string" ? Le.fromString(e) : Le.fromObject(e);
  }
  static fromObject(e) {
    if (Le.isConstructorFragment(e))
      return e;
    e.type !== "constructor" && F.throwArgumentError("invalid constructor object", "value", e);
    let t = ta(e);
    t.constant && F.throwArgumentError("constructor cannot be constant", "value", e);
    const a = {
      name: null,
      type: e.type,
      inputs: e.inputs ? e.inputs.map(ve.fromObject) : [],
      payable: t.payable,
      stateMutability: t.stateMutability,
      gas: e.gas ? be.from(e.gas) : null
    };
    return new Le(ht, a);
  }
  static fromString(e) {
    let t = { type: "constructor" };
    e = Yn(e, t);
    let a = e.match(Pt);
    return (!a || a[1].trim() !== "constructor") && F.throwArgumentError("invalid constructor string", "value", e), t.inputs = Dt(a[2].trim(), !1), ea(a[3].trim(), t), Le.fromObject(t);
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
        inputs: this.inputs.map((a) => JSON.parse(a.format(e))),
        outputs: this.outputs.map((a) => JSON.parse(a.format(e)))
      });
    let t = "";
    return e !== P.sighash && (t += "function "), t += this.name + "(" + this.inputs.map((a) => a.format(e)).join(e === P.full ? ", " : ",") + ") ", e !== P.sighash && (this.stateMutability ? this.stateMutability !== "nonpayable" && (t += this.stateMutability + " ") : this.constant && (t += "view "), this.outputs && this.outputs.length && (t += "returns (" + this.outputs.map((a) => a.format(e)).join(", ") + ") "), this.gas != null && (t += "@" + this.gas.toString() + " ")), t.trim();
  }
  static from(e) {
    return typeof e == "string" ? Be.fromString(e) : Be.fromObject(e);
  }
  static fromObject(e) {
    if (Be.isFunctionFragment(e))
      return e;
    e.type !== "function" && F.throwArgumentError("invalid function object", "value", e);
    let t = ta(e);
    const a = {
      type: e.type,
      name: Ft(e.name),
      constant: t.constant,
      inputs: e.inputs ? e.inputs.map(ve.fromObject) : [],
      outputs: e.outputs ? e.outputs.map(ve.fromObject) : [],
      payable: t.payable,
      stateMutability: t.stateMutability,
      gas: e.gas ? be.from(e.gas) : null
    };
    return new Be(ht, a);
  }
  static fromString(e) {
    let t = { type: "function" };
    e = Yn(e, t);
    let a = e.split(" returns ");
    a.length > 2 && F.throwArgumentError("invalid function string", "value", e);
    let f = a[0].match(Pt);
    if (f || F.throwArgumentError("invalid function signature", "value", e), t.name = f[1].trim(), t.name && Ft(t.name), t.inputs = Dt(f[2], !1), ea(f[3].trim(), t), a.length > 1) {
      let y = a[1].match(Pt);
      (y[1].trim() != "" || y[3].trim() != "") && F.throwArgumentError("unexpected tokens", "value", e), t.outputs = Dt(y[2], !1);
    } else
      t.outputs = [];
    return Be.fromObject(t);
  }
  static isFunctionFragment(e) {
    return e && e._isFragment && e.type === "function";
  }
}
function Bn(r) {
  const e = r.format();
  return (e === "Error(string)" || e === "Panic(uint256)") && F.throwArgumentError(`cannot specify user defined ${e} error`, "fragment", r), r;
}
class Xe extends je {
  format(e) {
    if (e || (e = P.sighash), P[e] || F.throwArgumentError("invalid format type", "format", e), e === P.json)
      return JSON.stringify({
        type: "error",
        name: this.name,
        inputs: this.inputs.map((a) => JSON.parse(a.format(e)))
      });
    let t = "";
    return e !== P.sighash && (t += "error "), t += this.name + "(" + this.inputs.map((a) => a.format(e)).join(e === P.full ? ", " : ",") + ") ", t.trim();
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
      inputs: e.inputs ? e.inputs.map(ve.fromObject) : []
    };
    return Bn(new Xe(ht, t));
  }
  static fromString(e) {
    let t = { type: "error" }, a = e.match(Pt);
    return a || F.throwArgumentError("invalid error signature", "value", e), t.name = a[1].trim(), t.name && Ft(t.name), t.inputs = Dt(a[2], !1), Bn(Xe.fromObject(t));
  }
  static isErrorFragment(e) {
    return e && e._isFragment && e.type === "error";
  }
}
function _t(r) {
  return r.match(/^uint($|[^1-9])/) ? r = "uint256" + r.substring(4) : r.match(/^int($|[^1-9])/) && (r = "int256" + r.substring(3)), r;
}
const za = new RegExp("^[a-zA-Z$_][a-zA-Z0-9$_]*$");
function Ft(r) {
  return (!r || !r.match(za)) && F.throwArgumentError(`invalid identifier "${r}"`, "value", r), r;
}
const Pt = new RegExp("^([^)(]*)\\((.*)\\)([^)(]*)$");
function Ha(r) {
  r = r.trim();
  let e = [], t = "", a = 0;
  for (let f = 0; f < r.length; f++) {
    let y = r[f];
    y === "," && a === 0 ? (e.push(t), t = "") : (t += y, y === "(" ? a++ : y === ")" && (a--, a === -1 && F.throwArgumentError("unbalanced parenthesis", "value", r)));
  }
  return t && e.push(t), e;
}
const vn = new O(Bt);
class Ge {
  constructor(e, t, a, f) {
    this.name = e, this.type = t, this.localName = a, this.dynamic = f;
  }
  _throwError(e, t) {
    vn.throwArgumentError(e, this.localName, t);
  }
}
class Mn {
  constructor(e) {
    xe(this, "wordSize", e || 32), this._data = [], this._dataLength = 0, this._padding = new Uint8Array(e);
  }
  get data() {
    return Ra(this._data);
  }
  get length() {
    return this._dataLength;
  }
  _writeData(e) {
    return this._data.push(e), this._dataLength += e.length, e.length;
  }
  appendWriter(e) {
    return this._writeData(vt(e._data));
  }
  // Arrayish items; padded on the right to wordSize
  writeBytes(e) {
    let t = Ce(e);
    const a = t.length % this.wordSize;
    return a && (t = vt([t, this._padding.slice(a)])), this._writeData(t);
  }
  _getValue(e) {
    let t = Ce(be.from(e));
    return t.length > this.wordSize && vn.throwError("value out-of-bounds", O.errors.BUFFER_OVERRUN, {
      length: this.wordSize,
      offset: t.length
    }), t.length % this.wordSize && (t = vt([this._padding.slice(t.length % this.wordSize), t])), t;
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
  constructor(e, t, a, f) {
    xe(this, "_data", Ce(e)), xe(this, "wordSize", t || 32), xe(this, "_coerceFunc", a), xe(this, "allowLoose", f), this._offset = 0;
  }
  get data() {
    return _e(this._data);
  }
  get consumed() {
    return this._offset;
  }
  // The default Coerce function
  static coerce(e, t) {
    let a = e.match("^u?int([0-9]+)$");
    return a && parseInt(a[1]) <= 48 && (t = t.toNumber()), t;
  }
  coerce(e, t) {
    return this._coerceFunc ? this._coerceFunc(e, t) : $t.coerce(e, t);
  }
  _peekBytes(e, t, a) {
    let f = Math.ceil(t / this.wordSize) * this.wordSize;
    return this._offset + f > this._data.length && (this.allowLoose && a && this._offset + t <= this._data.length ? f = t : vn.throwError("data out-of-bounds", O.errors.BUFFER_OVERRUN, {
      length: this._data.length,
      offset: this._offset + f
    })), this._data.slice(this._offset, this._offset + f);
  }
  subReader(e) {
    return new $t(this._data.slice(this._offset + e), this.wordSize, this._coerceFunc, this.allowLoose);
  }
  readBytes(e, t) {
    let a = this._peekBytes(0, e, !!t);
    return this._offset += a.length, a.slice(0, e);
  }
  readValue() {
    return be.from(this.readBytes(this.wordSize));
  }
}
var na = { exports: {} };
/**
 * [js-sha3]{@link https://github.com/emn178/js-sha3}
 *
 * @version 0.8.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2018
 * @license MIT
 */
(function(r) {
  (function() {
    var e = "input is invalid type", t = "finalize already called", a = typeof window == "object", f = a ? window : {};
    f.JS_SHA3_NO_WINDOW && (a = !1);
    var y = !a && typeof self == "object", T = !f.JS_SHA3_NO_NODE_JS && typeof process == "object" && process.versions && process.versions.node;
    T ? f = Kn : y && (f = self);
    var _ = !f.JS_SHA3_NO_COMMON_JS && !0 && r.exports, x = !f.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer < "u", E = "0123456789abcdef".split(""), N = [31, 7936, 2031616, 520093696], B = [4, 1024, 262144, 67108864], L = [1, 256, 65536, 16777216], ke = [6, 1536, 393216, 100663296], we = [0, 8, 16, 24], Ut = [
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
    ], Vt = [224, 256, 384, 512], gt = [128, 256], It = ["hex", "buffer", "arrayBuffer", "array", "digest"], xt = {
      128: 168,
      256: 136
    };
    (f.JS_SHA3_NO_NODE_JS || !Array.isArray) && (Array.isArray = function(p) {
      return Object.prototype.toString.call(p) === "[object Array]";
    }), x && (f.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView) && (ArrayBuffer.isView = function(p) {
      return typeof p == "object" && p.buffer && p.buffer.constructor === ArrayBuffer;
    });
    for (var At = function(p, g, M) {
      return function(w) {
        return new i(p, g, p).update(w)[M]();
      };
    }, Mt = function(p, g, M) {
      return function(w, k) {
        return new i(p, g, k).update(w)[M]();
      };
    }, Ee = function(p, g, M) {
      return function(w, k, S, I) {
        return n["cshake" + p].update(w, k, S, I)[M]();
      };
    }, Ye = function(p, g, M) {
      return function(w, k, S, I) {
        return n["kmac" + p].update(w, k, S, I)[M]();
      };
    }, et = function(p, g, M, w) {
      for (var k = 0; k < It.length; ++k) {
        var S = It[k];
        p[S] = g(M, w, S);
      }
      return p;
    }, Et = function(p, g) {
      var M = At(p, g, "hex");
      return M.create = function() {
        return new i(p, g, p);
      }, M.update = function(w) {
        return M.create().update(w);
      }, et(M, At, p, g);
    }, St = function(p, g) {
      var M = Mt(p, g, "hex");
      return M.create = function(w) {
        return new i(p, g, w);
      }, M.update = function(w, k) {
        return M.create(k).update(w);
      }, et(M, Mt, p, g);
    }, he = function(p, g) {
      var M = xt[p], w = Ee(p, g, "hex");
      return w.create = function(k, S, I) {
        return !S && !I ? n["shake" + p].create(k) : new i(p, g, k).bytepad([S, I], M);
      }, w.update = function(k, S, I, v) {
        return w.create(S, I, v).update(k);
      }, et(w, Ee, p, g);
    }, Ue = function(p, g) {
      var M = xt[p], w = Ye(p, g, "hex");
      return w.create = function(k, S, I) {
        return new m(p, g, S).bytepad(["KMAC", I], M).bytepad([k], M);
      }, w.update = function(k, S, I, v) {
        return w.create(k, I, v).update(S);
      }, et(w, Ye, p, g);
    }, c = [
      { name: "keccak", padding: L, bits: Vt, createMethod: Et },
      { name: "sha3", padding: ke, bits: Vt, createMethod: Et },
      { name: "shake", padding: N, bits: gt, createMethod: St },
      { name: "cshake", padding: B, bits: gt, createMethod: he },
      { name: "kmac", padding: B, bits: gt, createMethod: Ue }
    ], n = {}, s = [], u = 0; u < c.length; ++u)
      for (var l = c[u], d = l.bits, b = 0; b < d.length; ++b) {
        var h = l.name + "_" + d[b];
        if (s.push(h), n[h] = l.createMethod(d[b], l.padding), l.name !== "sha3") {
          var o = l.name + d[b];
          s.push(o), n[o] = n[h];
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
      for (var w = this.blocks, k = this.byteCount, S = p.length, I = this.blockCount, v = 0, ge = this.s, A, R; v < S; ) {
        if (this.reset)
          for (this.reset = !1, w[0] = this.block, A = 1; A < I + 1; ++A)
            w[A] = 0;
        if (g)
          for (A = this.start; v < S && A < k; ++v)
            w[A >> 2] |= p[v] << we[A++ & 3];
        else
          for (A = this.start; v < S && A < k; ++v)
            R = p.charCodeAt(v), R < 128 ? w[A >> 2] |= R << we[A++ & 3] : R < 2048 ? (w[A >> 2] |= (192 | R >> 6) << we[A++ & 3], w[A >> 2] |= (128 | R & 63) << we[A++ & 3]) : R < 55296 || R >= 57344 ? (w[A >> 2] |= (224 | R >> 12) << we[A++ & 3], w[A >> 2] |= (128 | R >> 6 & 63) << we[A++ & 3], w[A >> 2] |= (128 | R & 63) << we[A++ & 3]) : (R = 65536 + ((R & 1023) << 10 | p.charCodeAt(++v) & 1023), w[A >> 2] |= (240 | R >> 18) << we[A++ & 3], w[A >> 2] |= (128 | R >> 12 & 63) << we[A++ & 3], w[A >> 2] |= (128 | R >> 6 & 63) << we[A++ & 3], w[A >> 2] |= (128 | R & 63) << we[A++ & 3]);
        if (this.lastByteIndex = A, A >= k) {
          for (this.start = A - k, this.block = w[I], A = 0; A < I; ++A)
            ge[A] ^= w[A];
          C(ge), this.reset = !0;
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
        for (var S = 0; S < p.length; ++S) {
          var I = p.charCodeAt(S);
          I < 128 ? w += 1 : I < 2048 ? w += 2 : I < 55296 || I >= 57344 ? w += 3 : (I = 65536 + ((I & 1023) << 10 | p.charCodeAt(++S) & 1023), w += 4);
        }
      return w += this.encode(w * 8), this.update(p), w;
    }, i.prototype.bytepad = function(p, g) {
      for (var M = this.encode(g), w = 0; w < p.length; ++w)
        M += this.encodeString(p[w]);
      var k = g - M % g, S = [];
      return S.length = k, this.update(S), this;
    }, i.prototype.finalize = function() {
      if (!this.finalized) {
        this.finalized = !0;
        var p = this.blocks, g = this.lastByteIndex, M = this.blockCount, w = this.s;
        if (p[g >> 2] |= this.padding[g & 3], this.lastByteIndex === this.byteCount)
          for (p[0] = p[M], g = 1; g < M + 1; ++g)
            p[g] = 0;
        for (p[M - 1] |= 2147483648, g = 0; g < M; ++g)
          w[g] ^= p[g];
        C(w);
      }
    }, i.prototype.toString = i.prototype.hex = function() {
      this.finalize();
      for (var p = this.blockCount, g = this.s, M = this.outputBlocks, w = this.extraBytes, k = 0, S = 0, I = "", v; S < M; ) {
        for (k = 0; k < p && S < M; ++k, ++S)
          v = g[k], I += E[v >> 4 & 15] + E[v & 15] + E[v >> 12 & 15] + E[v >> 8 & 15] + E[v >> 20 & 15] + E[v >> 16 & 15] + E[v >> 28 & 15] + E[v >> 24 & 15];
        S % p === 0 && (C(g), k = 0);
      }
      return w && (v = g[k], I += E[v >> 4 & 15] + E[v & 15], w > 1 && (I += E[v >> 12 & 15] + E[v >> 8 & 15]), w > 2 && (I += E[v >> 20 & 15] + E[v >> 16 & 15])), I;
    }, i.prototype.arrayBuffer = function() {
      this.finalize();
      var p = this.blockCount, g = this.s, M = this.outputBlocks, w = this.extraBytes, k = 0, S = 0, I = this.outputBits >> 3, v;
      w ? v = new ArrayBuffer(M + 1 << 2) : v = new ArrayBuffer(I);
      for (var ge = new Uint32Array(v); S < M; ) {
        for (k = 0; k < p && S < M; ++k, ++S)
          ge[S] = g[k];
        S % p === 0 && C(g);
      }
      return w && (ge[k] = g[k], v = v.slice(0, I)), v;
    }, i.prototype.buffer = i.prototype.arrayBuffer, i.prototype.digest = i.prototype.array = function() {
      this.finalize();
      for (var p = this.blockCount, g = this.s, M = this.outputBlocks, w = this.extraBytes, k = 0, S = 0, I = [], v, ge; S < M; ) {
        for (k = 0; k < p && S < M; ++k, ++S)
          v = S << 2, ge = g[k], I[v] = ge & 255, I[v + 1] = ge >> 8 & 255, I[v + 2] = ge >> 16 & 255, I[v + 3] = ge >> 24 & 255;
        S % p === 0 && C(g);
      }
      return w && (v = S << 2, ge = g[k], I[v] = ge & 255, w > 1 && (I[v + 1] = ge >> 8 & 255), w > 2 && (I[v + 2] = ge >> 16 & 255)), I;
    };
    function m(p, g, M) {
      i.call(this, p, g, M);
    }
    m.prototype = new i(), m.prototype.finalize = function() {
      return this.encode(this.outputBits, !0), i.prototype.finalize.call(this);
    };
    var C = function(p) {
      var g, M, w, k, S, I, v, ge, A, R, tt, U, V, nt, z, H, at, q, j, it, W, G, rt, K, Z, st, $, Q, pt, J, X, yt, Y, ee, ut, te, ne, ot, ae, ie, lt, re, se, mt, pe, ye, dt, ue, oe, ct, le, me, ft, de, ce, Tt, fe, Te, Ke, Ze, $e, Qe, Je;
      for (w = 0; w < 48; w += 2)
        k = p[0] ^ p[10] ^ p[20] ^ p[30] ^ p[40], S = p[1] ^ p[11] ^ p[21] ^ p[31] ^ p[41], I = p[2] ^ p[12] ^ p[22] ^ p[32] ^ p[42], v = p[3] ^ p[13] ^ p[23] ^ p[33] ^ p[43], ge = p[4] ^ p[14] ^ p[24] ^ p[34] ^ p[44], A = p[5] ^ p[15] ^ p[25] ^ p[35] ^ p[45], R = p[6] ^ p[16] ^ p[26] ^ p[36] ^ p[46], tt = p[7] ^ p[17] ^ p[27] ^ p[37] ^ p[47], U = p[8] ^ p[18] ^ p[28] ^ p[38] ^ p[48], V = p[9] ^ p[19] ^ p[29] ^ p[39] ^ p[49], g = U ^ (I << 1 | v >>> 31), M = V ^ (v << 1 | I >>> 31), p[0] ^= g, p[1] ^= M, p[10] ^= g, p[11] ^= M, p[20] ^= g, p[21] ^= M, p[30] ^= g, p[31] ^= M, p[40] ^= g, p[41] ^= M, g = k ^ (ge << 1 | A >>> 31), M = S ^ (A << 1 | ge >>> 31), p[2] ^= g, p[3] ^= M, p[12] ^= g, p[13] ^= M, p[22] ^= g, p[23] ^= M, p[32] ^= g, p[33] ^= M, p[42] ^= g, p[43] ^= M, g = I ^ (R << 1 | tt >>> 31), M = v ^ (tt << 1 | R >>> 31), p[4] ^= g, p[5] ^= M, p[14] ^= g, p[15] ^= M, p[24] ^= g, p[25] ^= M, p[34] ^= g, p[35] ^= M, p[44] ^= g, p[45] ^= M, g = ge ^ (U << 1 | V >>> 31), M = A ^ (V << 1 | U >>> 31), p[6] ^= g, p[7] ^= M, p[16] ^= g, p[17] ^= M, p[26] ^= g, p[27] ^= M, p[36] ^= g, p[37] ^= M, p[46] ^= g, p[47] ^= M, g = R ^ (k << 1 | S >>> 31), M = tt ^ (S << 1 | k >>> 31), p[8] ^= g, p[9] ^= M, p[18] ^= g, p[19] ^= M, p[28] ^= g, p[29] ^= M, p[38] ^= g, p[39] ^= M, p[48] ^= g, p[49] ^= M, nt = p[0], z = p[1], ye = p[11] << 4 | p[10] >>> 28, dt = p[10] << 4 | p[11] >>> 28, Q = p[20] << 3 | p[21] >>> 29, pt = p[21] << 3 | p[20] >>> 29, Ze = p[31] << 9 | p[30] >>> 23, $e = p[30] << 9 | p[31] >>> 23, re = p[40] << 18 | p[41] >>> 14, se = p[41] << 18 | p[40] >>> 14, ee = p[2] << 1 | p[3] >>> 31, ut = p[3] << 1 | p[2] >>> 31, H = p[13] << 12 | p[12] >>> 20, at = p[12] << 12 | p[13] >>> 20, ue = p[22] << 10 | p[23] >>> 22, oe = p[23] << 10 | p[22] >>> 22, J = p[33] << 13 | p[32] >>> 19, X = p[32] << 13 | p[33] >>> 19, Qe = p[42] << 2 | p[43] >>> 30, Je = p[43] << 2 | p[42] >>> 30, de = p[5] << 30 | p[4] >>> 2, ce = p[4] << 30 | p[5] >>> 2, te = p[14] << 6 | p[15] >>> 26, ne = p[15] << 6 | p[14] >>> 26, q = p[25] << 11 | p[24] >>> 21, j = p[24] << 11 | p[25] >>> 21, ct = p[34] << 15 | p[35] >>> 17, le = p[35] << 15 | p[34] >>> 17, yt = p[45] << 29 | p[44] >>> 3, Y = p[44] << 29 | p[45] >>> 3, K = p[6] << 28 | p[7] >>> 4, Z = p[7] << 28 | p[6] >>> 4, Tt = p[17] << 23 | p[16] >>> 9, fe = p[16] << 23 | p[17] >>> 9, ot = p[26] << 25 | p[27] >>> 7, ae = p[27] << 25 | p[26] >>> 7, it = p[36] << 21 | p[37] >>> 11, W = p[37] << 21 | p[36] >>> 11, me = p[47] << 24 | p[46] >>> 8, ft = p[46] << 24 | p[47] >>> 8, mt = p[8] << 27 | p[9] >>> 5, pe = p[9] << 27 | p[8] >>> 5, st = p[18] << 20 | p[19] >>> 12, $ = p[19] << 20 | p[18] >>> 12, Te = p[29] << 7 | p[28] >>> 25, Ke = p[28] << 7 | p[29] >>> 25, ie = p[38] << 8 | p[39] >>> 24, lt = p[39] << 8 | p[38] >>> 24, G = p[48] << 14 | p[49] >>> 18, rt = p[49] << 14 | p[48] >>> 18, p[0] = nt ^ ~H & q, p[1] = z ^ ~at & j, p[10] = K ^ ~st & Q, p[11] = Z ^ ~$ & pt, p[20] = ee ^ ~te & ot, p[21] = ut ^ ~ne & ae, p[30] = mt ^ ~ye & ue, p[31] = pe ^ ~dt & oe, p[40] = de ^ ~Tt & Te, p[41] = ce ^ ~fe & Ke, p[2] = H ^ ~q & it, p[3] = at ^ ~j & W, p[12] = st ^ ~Q & J, p[13] = $ ^ ~pt & X, p[22] = te ^ ~ot & ie, p[23] = ne ^ ~ae & lt, p[32] = ye ^ ~ue & ct, p[33] = dt ^ ~oe & le, p[42] = Tt ^ ~Te & Ze, p[43] = fe ^ ~Ke & $e, p[4] = q ^ ~it & G, p[5] = j ^ ~W & rt, p[14] = Q ^ ~J & yt, p[15] = pt ^ ~X & Y, p[24] = ot ^ ~ie & re, p[25] = ae ^ ~lt & se, p[34] = ue ^ ~ct & me, p[35] = oe ^ ~le & ft, p[44] = Te ^ ~Ze & Qe, p[45] = Ke ^ ~$e & Je, p[6] = it ^ ~G & nt, p[7] = W ^ ~rt & z, p[16] = J ^ ~yt & K, p[17] = X ^ ~Y & Z, p[26] = ie ^ ~re & ee, p[27] = lt ^ ~se & ut, p[36] = ct ^ ~me & mt, p[37] = le ^ ~ft & pe, p[46] = Ze ^ ~Qe & de, p[47] = $e ^ ~Je & ce, p[8] = G ^ ~nt & H, p[9] = rt ^ ~z & at, p[18] = yt ^ ~K & st, p[19] = Y ^ ~Z & $, p[28] = re ^ ~ee & te, p[29] = se ^ ~ut & ne, p[38] = me ^ ~mt & ye, p[39] = ft ^ ~pe & dt, p[48] = Qe ^ ~de & Tt, p[49] = Je ^ ~ce & fe, p[0] ^= Ut[w], p[1] ^= Ut[w + 1];
    };
    if (_)
      r.exports = n;
    else
      for (u = 0; u < s.length; ++u)
        f[s[u]] = n[s[u]];
  })();
})(na);
var qa = na.exports;
const ja = /* @__PURE__ */ Zn(qa);
function Qt(r) {
  return "0x" + ja.keccak_256(Ce(r));
}
const Wa = "address/5.7.0", Ct = new O(Wa);
function Un(r) {
  De(r, 20) || Ct.throwArgumentError("invalid address", "address", r), r = r.toLowerCase();
  const e = r.substring(2).split(""), t = new Uint8Array(40);
  for (let f = 0; f < 40; f++)
    t[f] = e[f].charCodeAt(0);
  const a = Ce(Qt(t));
  for (let f = 0; f < 40; f += 2)
    a[f >> 1] >> 4 >= 8 && (e[f] = e[f].toUpperCase()), (a[f >> 1] & 15) >= 8 && (e[f + 1] = e[f + 1].toUpperCase());
  return "0x" + e.join("");
}
const Ga = 9007199254740991;
function Ka(r) {
  return Math.log10 ? Math.log10(r) : Math.log(r) / Math.LN10;
}
const In = {};
for (let r = 0; r < 10; r++)
  In[String(r)] = String(r);
for (let r = 0; r < 26; r++)
  In[String.fromCharCode(65 + r)] = String(10 + r);
const Vn = Math.floor(Ka(Ga));
function Za(r) {
  r = r.toUpperCase(), r = r.substring(4) + r.substring(0, 2) + "00";
  let e = r.split("").map((a) => In[a]).join("");
  for (; e.length >= Vn; ) {
    let a = e.substring(0, Vn);
    e = parseInt(a, 10) % 97 + e.substring(a.length);
  }
  let t = String(98 - parseInt(e, 10) % 97);
  for (; t.length < 2; )
    t = "0" + t;
  return t;
}
function wn(r) {
  let e = null;
  if (typeof r != "string" && Ct.throwArgumentError("invalid address", "address", r), r.match(/^(0x)?[0-9a-fA-F]{40}$/))
    r.substring(0, 2) !== "0x" && (r = "0x" + r), e = Un(r), r.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && e !== r && Ct.throwArgumentError("bad address checksum", "address", r);
  else if (r.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
    for (r.substring(2, 4) !== Za(r) && Ct.throwArgumentError("bad icap checksum", "address", r), e = Da(r.substring(4)); e.length < 40; )
      e = "0" + e;
    e = Un("0x" + e);
  } else
    Ct.throwArgumentError("invalid address", "address", r);
  return e;
}
class $a extends Ge {
  constructor(e) {
    super("address", "address", e, !1);
  }
  defaultValue() {
    return "0x0000000000000000000000000000000000000000";
  }
  encode(e, t) {
    try {
      t = wn(t);
    } catch (a) {
      this._throwError(a.message, t);
    }
    return e.writeValue(t);
  }
  decode(e) {
    return wn(Qn(e.readValue().toHexString(), 20));
  }
}
class Qa extends Ge {
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
const kt = new O(Bt);
function aa(r, e, t) {
  let a = null;
  if (Array.isArray(t))
    a = t;
  else if (t && typeof t == "object") {
    let x = {};
    a = e.map((E) => {
      const N = E.localName;
      return N || kt.throwError("cannot encode object for signature with missing names", O.errors.INVALID_ARGUMENT, {
        argument: "values",
        coder: E,
        value: t
      }), x[N] && kt.throwError("cannot encode object for signature with duplicate names", O.errors.INVALID_ARGUMENT, {
        argument: "values",
        coder: E,
        value: t
      }), x[N] = !0, t[N];
    });
  } else
    kt.throwArgumentError("invalid tuple value", "tuple", t);
  e.length !== a.length && kt.throwArgumentError("types/value length mismatch", "tuple", t);
  let f = new Mn(r.wordSize), y = new Mn(r.wordSize), T = [];
  e.forEach((x, E) => {
    let N = a[E];
    if (x.dynamic) {
      let B = y.length;
      x.encode(y, N);
      let L = f.writeUpdatableValue();
      T.push((ke) => {
        L(ke + B);
      });
    } else
      x.encode(f, N);
  }), T.forEach((x) => {
    x(f.length);
  });
  let _ = r.appendWriter(f);
  return _ += r.appendWriter(y), _;
}
function ia(r, e) {
  let t = [], a = r.subReader(0);
  e.forEach((y) => {
    let T = null;
    if (y.dynamic) {
      let _ = r.readValue(), x = a.subReader(_.toNumber());
      try {
        T = y.decode(x);
      } catch (E) {
        if (E.code === O.errors.BUFFER_OVERRUN)
          throw E;
        T = E, T.baseType = y.name, T.name = y.localName, T.type = y.type;
      }
    } else
      try {
        T = y.decode(r);
      } catch (_) {
        if (_.code === O.errors.BUFFER_OVERRUN)
          throw _;
        T = _, T.baseType = y.name, T.name = y.localName, T.type = y.type;
      }
    T != null && t.push(T);
  });
  const f = e.reduce((y, T) => {
    const _ = T.localName;
    return _ && (y[_] || (y[_] = 0), y[_]++), y;
  }, {});
  e.forEach((y, T) => {
    let _ = y.localName;
    if (!_ || f[_] !== 1 || (_ === "length" && (_ = "_length"), t[_] != null))
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
class Ja extends Ge {
  constructor(e, t, a) {
    const f = e.type + "[" + (t >= 0 ? t : "") + "]", y = t === -1 || e.dynamic;
    super("array", f, a, y), this.coder = e, this.length = t;
  }
  defaultValue() {
    const e = this.coder.defaultValue(), t = [];
    for (let a = 0; a < this.length; a++)
      t.push(e);
    return t;
  }
  encode(e, t) {
    Array.isArray(t) || this._throwError("expected array value", t);
    let a = this.length;
    a === -1 && (a = t.length, e.writeValue(t.length)), kt.checkArgumentCount(t.length, a, "coder array" + (this.localName ? " " + this.localName : ""));
    let f = [];
    for (let y = 0; y < t.length; y++)
      f.push(this.coder);
    return aa(e, f, t);
  }
  decode(e) {
    let t = this.length;
    t === -1 && (t = e.readValue().toNumber(), t * 32 > e._data.length && kt.throwError("insufficient data length", O.errors.BUFFER_OVERRUN, {
      length: e._data.length,
      count: t
    }));
    let a = [];
    for (let f = 0; f < t; f++)
      a.push(new Qa(this.coder));
    return e.coerce(this.name, ia(e, a));
  }
}
class Xa extends Ge {
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
class ra extends Ge {
  constructor(e, t) {
    super(e, e, t, !0);
  }
  defaultValue() {
    return "0x";
  }
  encode(e, t) {
    t = Ce(t);
    let a = e.writeValue(t.length);
    return a += e.writeBytes(t), a;
  }
  decode(e) {
    return e.readBytes(e.readValue().toNumber(), !0);
  }
}
class Ya extends ra {
  constructor(e) {
    super("bytes", e);
  }
  decode(e) {
    return e.coerce(this.name, _e(super.decode(e)));
  }
}
class ei extends Ge {
  constructor(e, t) {
    let a = "bytes" + String(e);
    super(a, a, t, !1), this.size = e;
  }
  defaultValue() {
    return "0x0000000000000000000000000000000000000000000000000000000000000000".substring(0, 2 + this.size * 2);
  }
  encode(e, t) {
    let a = Ce(t);
    return a.length !== this.size && this._throwError("incorrect data length", t), e.writeBytes(a);
  }
  decode(e) {
    return e.coerce(this.name, _e(e.readBytes(this.size)));
  }
}
class ti extends Ge {
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
const ni = /* @__PURE__ */ be.from(-1), ai = /* @__PURE__ */ be.from(0), ii = /* @__PURE__ */ be.from(1), ri = /* @__PURE__ */ be.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
class si extends Ge {
  constructor(e, t, a) {
    const f = (t ? "int" : "uint") + e * 8;
    super(f, f, a, !1), this.size = e, this.signed = t;
  }
  defaultValue() {
    return 0;
  }
  encode(e, t) {
    let a = be.from(t), f = ri.mask(e.wordSize * 8);
    if (this.signed) {
      let y = f.mask(this.size * 8 - 1);
      (a.gt(y) || a.lt(y.add(ii).mul(ni))) && this._throwError("value out-of-bounds", t);
    } else
      (a.lt(ai) || a.gt(f.mask(this.size * 8))) && this._throwError("value out-of-bounds", t);
    return a = a.toTwos(this.size * 8).mask(this.size * 8), this.signed && (a = a.fromTwos(this.size * 8).toTwos(8 * e.wordSize)), e.writeValue(a);
  }
  decode(e) {
    let t = e.readValue().mask(this.size * 8);
    return this.signed && (t = t.fromTwos(this.size * 8)), e.coerce(this.name, t);
  }
}
const pi = "strings/5.7.0", sa = new O(pi);
var Jt;
(function(r) {
  r.current = "", r.NFC = "NFC", r.NFD = "NFD", r.NFKC = "NFKC", r.NFKD = "NFKD";
})(Jt || (Jt = {}));
var Oe;
(function(r) {
  r.UNEXPECTED_CONTINUE = "unexpected continuation byte", r.BAD_PREFIX = "bad codepoint prefix", r.OVERRUN = "string overrun", r.MISSING_CONTINUE = "missing continuation byte", r.OUT_OF_RANGE = "out of UTF-8 range", r.UTF16_SURROGATE = "UTF-16 surrogate", r.OVERLONG = "overlong representation";
})(Oe || (Oe = {}));
function yi(r, e, t, a, f) {
  return sa.throwArgumentError(`invalid codepoint at offset ${e}; ${r}`, "bytes", t);
}
function pa(r, e, t, a, f) {
  if (r === Oe.BAD_PREFIX || r === Oe.UNEXPECTED_CONTINUE) {
    let y = 0;
    for (let T = e + 1; T < t.length && t[T] >> 6 === 2; T++)
      y++;
    return y;
  }
  return r === Oe.OVERRUN ? t.length - e - 1 : 0;
}
function ui(r, e, t, a, f) {
  return r === Oe.OVERLONG ? (a.push(f), 0) : (a.push(65533), pa(r, e, t));
}
const oi = Object.freeze({
  error: yi,
  ignore: pa,
  replace: ui
});
function li(r, e) {
  e == null && (e = oi.error), r = Ce(r);
  const t = [];
  let a = 0;
  for (; a < r.length; ) {
    const f = r[a++];
    if (!(f >> 7)) {
      t.push(f);
      continue;
    }
    let y = null, T = null;
    if ((f & 224) === 192)
      y = 1, T = 127;
    else if ((f & 240) === 224)
      y = 2, T = 2047;
    else if ((f & 248) === 240)
      y = 3, T = 65535;
    else {
      (f & 192) === 128 ? a += e(Oe.UNEXPECTED_CONTINUE, a - 1, r, t) : a += e(Oe.BAD_PREFIX, a - 1, r, t);
      continue;
    }
    if (a - 1 + y >= r.length) {
      a += e(Oe.OVERRUN, a - 1, r, t);
      continue;
    }
    let _ = f & (1 << 8 - y - 1) - 1;
    for (let x = 0; x < y; x++) {
      let E = r[a];
      if ((E & 192) != 128) {
        a += e(Oe.MISSING_CONTINUE, a, r, t), _ = null;
        break;
      }
      _ = _ << 6 | E & 63, a++;
    }
    if (_ !== null) {
      if (_ > 1114111) {
        a += e(Oe.OUT_OF_RANGE, a - 1 - y, r, t, _);
        continue;
      }
      if (_ >= 55296 && _ <= 57343) {
        a += e(Oe.UTF16_SURROGATE, a - 1 - y, r, t, _);
        continue;
      }
      if (_ <= T) {
        a += e(Oe.OVERLONG, a - 1 - y, r, t, _);
        continue;
      }
      t.push(_);
    }
  }
  return t;
}
function ya(r, e = Jt.current) {
  e != Jt.current && (sa.checkNormalize(), r = r.normalize(e));
  let t = [];
  for (let a = 0; a < r.length; a++) {
    const f = r.charCodeAt(a);
    if (f < 128)
      t.push(f);
    else if (f < 2048)
      t.push(f >> 6 | 192), t.push(f & 63 | 128);
    else if ((f & 64512) == 55296) {
      a++;
      const y = r.charCodeAt(a);
      if (a >= r.length || (y & 64512) !== 56320)
        throw new Error("invalid utf-8 string");
      const T = 65536 + ((f & 1023) << 10) + (y & 1023);
      t.push(T >> 18 | 240), t.push(T >> 12 & 63 | 128), t.push(T >> 6 & 63 | 128), t.push(T & 63 | 128);
    } else
      t.push(f >> 12 | 224), t.push(f >> 6 & 63 | 128), t.push(f & 63 | 128);
  }
  return Ce(t);
}
function mi(r) {
  return r.map((e) => e <= 65535 ? String.fromCharCode(e) : (e -= 65536, String.fromCharCode((e >> 10 & 1023) + 55296, (e & 1023) + 56320))).join("");
}
function di(r, e) {
  return mi(li(r, e));
}
class ci extends ra {
  constructor(e) {
    super("string", e);
  }
  defaultValue() {
    return "";
  }
  encode(e, t) {
    return super.encode(e, ya(t));
  }
  decode(e) {
    return di(super.decode(e));
  }
}
class qt extends Ge {
  constructor(e, t) {
    let a = !1;
    const f = [];
    e.forEach((T) => {
      T.dynamic && (a = !0), f.push(T.type);
    });
    const y = "tuple(" + f.join(",") + ")";
    super("tuple", y, t, a), this.coders = e;
  }
  defaultValue() {
    const e = [];
    this.coders.forEach((a) => {
      e.push(a.defaultValue());
    });
    const t = this.coders.reduce((a, f) => {
      const y = f.localName;
      return y && (a[y] || (a[y] = 0), a[y]++), a;
    }, {});
    return this.coders.forEach((a, f) => {
      let y = a.localName;
      !y || t[y] !== 1 || (y === "length" && (y = "_length"), e[y] == null && (e[y] = e[f]));
    }), Object.freeze(e);
  }
  encode(e, t) {
    return aa(e, this.coders, t);
  }
  decode(e) {
    return e.coerce(this.name, ia(e, this.coders));
  }
}
const jt = new O(Bt), fi = new RegExp(/^bytes([0-9]*)$/), Ti = new RegExp(/^(u?int)([0-9]*)$/);
class bi {
  constructor(e) {
    xe(this, "coerceFunc", e || null);
  }
  _getCoder(e) {
    switch (e.baseType) {
      case "address":
        return new $a(e.name);
      case "bool":
        return new Xa(e.name);
      case "string":
        return new ci(e.name);
      case "bytes":
        return new Ya(e.name);
      case "array":
        return new Ja(this._getCoder(e.arrayChildren), e.arrayLength, e.name);
      case "tuple":
        return new qt((e.components || []).map((a) => this._getCoder(a)), e.name);
      case "":
        return new ti(e.name);
    }
    let t = e.type.match(Ti);
    if (t) {
      let a = parseInt(t[2] || "256");
      return (a === 0 || a > 256 || a % 8 !== 0) && jt.throwArgumentError("invalid " + t[1] + " bit length", "param", e), new si(a / 8, t[1] === "int", e.name);
    }
    if (t = e.type.match(fi), t) {
      let a = parseInt(t[1]);
      return (a === 0 || a > 32) && jt.throwArgumentError("invalid bytes length", "param", e), new ei(a, e.name);
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
    return new Mn(this._getWordSize());
  }
  getDefaultValue(e) {
    const t = e.map((f) => this._getCoder(ve.from(f)));
    return new qt(t, "_").defaultValue();
  }
  encode(e, t) {
    e.length !== t.length && jt.throwError("types/values length mismatch", O.errors.INVALID_ARGUMENT, {
      count: { types: e.length, values: t.length },
      value: { types: e, values: t }
    });
    const a = e.map((T) => this._getCoder(ve.from(T))), f = new qt(a, "_"), y = this._getWriter();
    return f.encode(y, t), y.data;
  }
  decode(e, t, a) {
    const f = e.map((T) => this._getCoder(ve.from(T)));
    return new qt(f, "_").decode(this._getReader(Ce(t), a));
  }
}
const hi = new bi();
function Wt(r) {
  return Qt(ya(r));
}
const Me = new O(Bt);
class gi extends Yt {
}
class Mi extends Yt {
}
class wi extends Yt {
}
class zn extends Yt {
  static isIndexed(e) {
    return !!(e && e._isIndexed);
  }
}
const _i = {
  "0x08c379a0": { signature: "Error(string)", name: "Error", inputs: ["string"], reason: !0 },
  "0x4e487b71": { signature: "Panic(uint256)", name: "Panic", inputs: ["uint256"] }
};
function Hn(r, e) {
  const t = new Error(`deferred error during ABI decoding triggered accessing ${r}`);
  return t.error = e, t;
}
class ki {
  constructor(e) {
    let t = [];
    typeof e == "string" ? t = JSON.parse(e) : t = e, xe(this, "fragments", t.map((a) => je.from(a)).filter((a) => a != null)), xe(this, "_abiCoder", zt(new.target, "getAbiCoder")()), xe(this, "functions", {}), xe(this, "errors", {}), xe(this, "events", {}), xe(this, "structs", {}), this.fragments.forEach((a) => {
      let f = null;
      switch (a.type) {
        case "constructor":
          if (this.deploy) {
            Me.warn("duplicate definition - constructor");
            return;
          }
          xe(this, "deploy", a);
          return;
        case "function":
          f = this.functions;
          break;
        case "event":
          f = this.events;
          break;
        case "error":
          f = this.errors;
          break;
        default:
          return;
      }
      let y = a.format();
      if (f[y]) {
        Me.warn("duplicate definition - " + y);
        return;
      }
      f[y] = a;
    }), this.deploy || xe(this, "deploy", Le.from({
      payable: !1,
      type: "constructor"
    })), xe(this, "_isInterface", !0);
  }
  format(e) {
    e || (e = P.full), e === P.sighash && Me.throwArgumentError("interface does not support formatting sighash", "format", e);
    const t = this.fragments.map((a) => a.format(e));
    return e === P.json ? JSON.stringify(t.map((a) => JSON.parse(a))) : t;
  }
  // Sub-classes can override these to handle other blockchains
  static getAbiCoder() {
    return hi;
  }
  static getAddress(e) {
    return wn(e);
  }
  static getSighash(e) {
    return Oa(Wt(e.format()), 0, 4);
  }
  static getEventTopic(e) {
    return Wt(e.format());
  }
  // Find a function definition by any means necessary (unless it is ambiguous)
  getFunction(e) {
    if (De(e)) {
      for (const a in this.functions)
        if (e === this.getSighash(a))
          return this.functions[a];
      Me.throwArgumentError("no matching function", "sighash", e);
    }
    if (e.indexOf("(") === -1) {
      const a = e.trim(), f = Object.keys(this.functions).filter((y) => y.split(
        "("
        /* fix:) */
      )[0] === a);
      return f.length === 0 ? Me.throwArgumentError("no matching function", "name", a) : f.length > 1 && Me.throwArgumentError("multiple matching functions", "name", a), this.functions[f[0]];
    }
    const t = this.functions[Be.fromString(e).format()];
    return t || Me.throwArgumentError("no matching function", "signature", e), t;
  }
  // Find an event definition by any means necessary (unless it is ambiguous)
  getEvent(e) {
    if (De(e)) {
      const a = e.toLowerCase();
      for (const f in this.events)
        if (a === this.getEventTopic(f))
          return this.events[f];
      Me.throwArgumentError("no matching event", "topichash", a);
    }
    if (e.indexOf("(") === -1) {
      const a = e.trim(), f = Object.keys(this.events).filter((y) => y.split(
        "("
        /* fix:) */
      )[0] === a);
      return f.length === 0 ? Me.throwArgumentError("no matching event", "name", a) : f.length > 1 && Me.throwArgumentError("multiple matching events", "name", a), this.events[f[0]];
    }
    const t = this.events[qe.fromString(e).format()];
    return t || Me.throwArgumentError("no matching event", "signature", e), t;
  }
  // Find a function definition by any means necessary (unless it is ambiguous)
  getError(e) {
    if (De(e)) {
      const a = zt(this.constructor, "getSighash");
      for (const f in this.errors) {
        const y = this.errors[f];
        if (e === a(y))
          return this.errors[f];
      }
      Me.throwArgumentError("no matching error", "sighash", e);
    }
    if (e.indexOf("(") === -1) {
      const a = e.trim(), f = Object.keys(this.errors).filter((y) => y.split(
        "("
        /* fix:) */
      )[0] === a);
      return f.length === 0 ? Me.throwArgumentError("no matching error", "name", a) : f.length > 1 && Me.throwArgumentError("multiple matching errors", "name", a), this.errors[f[0]];
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
    const a = Ce(t);
    return _e(a.slice(0, 4)) !== this.getSighash(e) && Me.throwArgumentError(`data signature does not match error ${e.name}.`, "data", _e(a)), this._decodeParams(e.inputs, a.slice(4));
  }
  encodeErrorResult(e, t) {
    return typeof e == "string" && (e = this.getError(e)), _e(vt([
      this.getSighash(e),
      this._encodeParams(e.inputs, t || [])
    ]));
  }
  // Decode the data for a function call (e.g. tx.data)
  decodeFunctionData(e, t) {
    typeof e == "string" && (e = this.getFunction(e));
    const a = Ce(t);
    return _e(a.slice(0, 4)) !== this.getSighash(e) && Me.throwArgumentError(`data signature does not match function ${e.name}.`, "data", _e(a)), this._decodeParams(e.inputs, a.slice(4));
  }
  // Encode the data for a function call (e.g. tx.data)
  encodeFunctionData(e, t) {
    return typeof e == "string" && (e = this.getFunction(e)), _e(vt([
      this.getSighash(e),
      this._encodeParams(e.inputs, t || [])
    ]));
  }
  // Decode the result from a function call (e.g. from eth_call)
  decodeFunctionResult(e, t) {
    typeof e == "string" && (e = this.getFunction(e));
    let a = Ce(t), f = null, y = "", T = null, _ = null, x = null;
    switch (a.length % this._abiCoder._getWordSize()) {
      case 0:
        try {
          return this._abiCoder.decode(e.outputs, a);
        } catch {
        }
        break;
      case 4: {
        const E = _e(a.slice(0, 4)), N = _i[E];
        if (N)
          T = this._abiCoder.decode(N.inputs, a.slice(4)), _ = N.name, x = N.signature, N.reason && (f = T[0]), _ === "Error" ? y = `; VM Exception while processing transaction: reverted with reason string ${JSON.stringify(T[0])}` : _ === "Panic" && (y = `; VM Exception while processing transaction: reverted with panic code ${T[0]}`);
        else
          try {
            const B = this.getError(E);
            T = this._abiCoder.decode(B.inputs, a.slice(4)), _ = B.name, x = B.format();
          } catch {
          }
        break;
      }
    }
    return Me.throwError("call revert exception" + y, O.errors.CALL_EXCEPTION, {
      method: e.format(),
      data: _e(t),
      errorArgs: T,
      errorName: _,
      errorSignature: x,
      reason: f
    });
  }
  // Encode the result for a function call (e.g. for eth_call)
  encodeFunctionResult(e, t) {
    return typeof e == "string" && (e = this.getFunction(e)), _e(this._abiCoder.encode(e.outputs, t || []));
  }
  // Create the filter for the event with search criteria (e.g. for eth_filterLog)
  encodeFilterTopics(e, t) {
    typeof e == "string" && (e = this.getEvent(e)), t.length > e.inputs.length && Me.throwError("too many arguments for " + e.format(), O.errors.UNEXPECTED_ARGUMENT, {
      argument: "values",
      value: t
    });
    let a = [];
    e.anonymous || a.push(this.getEventTopic(e));
    const f = (y, T) => y.type === "string" ? Wt(T) : y.type === "bytes" ? Qt(_e(T)) : (y.type === "bool" && typeof T == "boolean" && (T = T ? "0x01" : "0x00"), y.type.match(/^u?int/) && (T = be.from(T).toHexString()), y.type === "address" && this._abiCoder.encode(["address"], [T]), Qn(_e(T), 32));
    for (t.forEach((y, T) => {
      let _ = e.inputs[T];
      if (!_.indexed) {
        y != null && Me.throwArgumentError("cannot filter non-indexed parameters; must be null", "contract." + _.name, y);
        return;
      }
      y == null ? a.push(null) : _.baseType === "array" || _.baseType === "tuple" ? Me.throwArgumentError("filtering with tuples or arrays not supported", "contract." + _.name, y) : Array.isArray(y) ? a.push(y.map((x) => f(_, x))) : a.push(f(_, y));
    }); a.length && a[a.length - 1] === null; )
      a.pop();
    return a;
  }
  encodeEventLog(e, t) {
    typeof e == "string" && (e = this.getEvent(e));
    const a = [], f = [], y = [];
    return e.anonymous || a.push(this.getEventTopic(e)), t.length !== e.inputs.length && Me.throwArgumentError("event arguments/values mismatch", "values", t), e.inputs.forEach((T, _) => {
      const x = t[_];
      if (T.indexed)
        if (T.type === "string")
          a.push(Wt(x));
        else if (T.type === "bytes")
          a.push(Qt(x));
        else {
          if (T.baseType === "tuple" || T.baseType === "array")
            throw new Error("not implemented");
          a.push(this._abiCoder.encode([T.type], [x]));
        }
      else
        f.push(T), y.push(x);
    }), {
      data: this._abiCoder.encode(f, y),
      topics: a
    };
  }
  // Decode a filter for the event and the search criteria
  decodeEventLog(e, t, a) {
    if (typeof e == "string" && (e = this.getEvent(e)), a != null && !e.anonymous) {
      let L = this.getEventTopic(e);
      (!De(a[0], 32) || a[0].toLowerCase() !== L) && Me.throwError("fragment/topic mismatch", O.errors.INVALID_ARGUMENT, { argument: "topics[0]", expected: L, value: a[0] }), a = a.slice(1);
    }
    let f = [], y = [], T = [];
    e.inputs.forEach((L, ke) => {
      L.indexed ? L.type === "string" || L.type === "bytes" || L.baseType === "tuple" || L.baseType === "array" ? (f.push(ve.fromObject({ type: "bytes32", name: L.name })), T.push(!0)) : (f.push(L), T.push(!1)) : (y.push(L), T.push(!1));
    });
    let _ = a != null ? this._abiCoder.decode(f, vt(a)) : null, x = this._abiCoder.decode(y, t, !0), E = [], N = 0, B = 0;
    e.inputs.forEach((L, ke) => {
      if (L.indexed)
        if (_ == null)
          E[ke] = new zn({ _isIndexed: !0, hash: null });
        else if (T[ke])
          E[ke] = new zn({ _isIndexed: !0, hash: _[B++] });
        else
          try {
            E[ke] = _[B++];
          } catch (we) {
            E[ke] = we;
          }
      else
        try {
          E[ke] = x[N++];
        } catch (we) {
          E[ke] = we;
        }
      if (L.name && E[L.name] == null) {
        const we = E[ke];
        we instanceof Error ? Object.defineProperty(E, L.name, {
          enumerable: !0,
          get: () => {
            throw Hn(`property ${JSON.stringify(L.name)}`, we);
          }
        }) : E[L.name] = we;
      }
    });
    for (let L = 0; L < E.length; L++) {
      const ke = E[L];
      ke instanceof Error && Object.defineProperty(E, L, {
        enumerable: !0,
        get: () => {
          throw Hn(`index ${L}`, ke);
        }
      });
    }
    return Object.freeze(E);
  }
  // Given a transaction, find the matching function fragment (if any) and
  // determine all its properties and call parameters
  parseTransaction(e) {
    let t = this.getFunction(e.data.substring(0, 10).toLowerCase());
    return t ? new Mi({
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
    return !t || t.anonymous ? null : new gi({
      eventFragment: t,
      name: t.name,
      signature: t.format(),
      topic: this.getEventTopic(t),
      args: this.decodeEventLog(t, e.data, e.topics)
    });
  }
  parseError(e) {
    const t = _e(e);
    let a = this.getError(t.substring(0, 10).toLowerCase());
    return a ? new wi({
      args: this._abiCoder.decode(a.inputs, "0x" + t.substring(10)),
      errorFragment: a,
      name: a.name,
      signature: a.format(),
      sighash: this.getSighash(a)
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
const vi = [
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
new ki(vi);
const qn = (r) => Number.isSafeInteger(r) && r > 0 && r <= wa.MAX_SAFE_CHAIN_ID, Ii = (r) => {
  if (typeof r == "number")
    return { valid: qn(r), chainId: r };
  if (typeof r == "string")
    try {
      let e;
      return r.toLowerCase().startsWith("0x") ? e = parseInt(r, 16) : e = parseInt(r, 10), {
        valid: qn(e),
        chainId: e
      };
    } catch {
      return { valid: !1, chainId: 0 };
    }
  return { valid: !1, chainId: r };
}, jn = (r) => {
  if (!r)
    return "1";
  const { chainId: e, valid: t } = Ii(r);
  return t ? `${e}` : "1";
};
class Xt extends Gn {
  //TODO fix
  constructor() {
    super();
    Ae(this, "chain", Rt.ETH);
    Ae(this, "address", null);
    Ae(this, "ready");
    Ae(this, "_chainId");
    Ae(this, "isDebug");
    Ae(this, "config");
    this._setInitialChainId();
  }
  _setInitialChainId() {
    this._getGlobalChainId().then((t) => {
      const a = jn(t ?? "0x1");
      this.emitChainChanged(t ?? "0x1"), this.emitNetworkChanged(a), console.log("_setInitialChainId", a);
    }).catch((t) => {
      console.log("_setInitialChainId", t), this.emitChainChanged("0x1"), this.emitNetworkChanged("1");
    });
  }
  async _setGlobalChainId(t) {
    const a = await this.send(
      "_setGlobalChainId",
      t
    );
    return console.log("_setGlobalChainId", a), a ?? "";
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
    const t = jn(this._chainId ?? "0x1");
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
    var a = this;
    return this instanceof Xt || (a = window.ethereum), a._request(t);
  }
  _wrapResult(t, a) {
    let f = { jsonrpc: "2.0", id: t.id };
    return a !== null && typeof a == "object" && a.jsonrpc && a.result ? f.result = a.result : f.result = a, f;
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
        throw new En(
          4200,
          "Fox does not support eth_sign. Please use other sign method instead."
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
        throw new En(
          4200,
          `Fox does not support calling ${t.method}. Please use your own solution`
        );
      default:
        console.log("unhandled", t), t.jsonrpc = "2.0";
        const a = await this.proxyRPCCall(t);
        return console.log(`<== rpc response ${JSON.stringify(a)}`), a == null ? void 0 : a.result;
    }
  }
  async proxyRPCCall(t) {
    return this.send("proxyRPCCall", t);
  }
  /**
   * @deprecated Use request() method instead.
   */
  sendAsync(t, a) {
    console.log(
      "sendAsync(data, callback) is deprecated, please use window.ethereum.request(data) instead."
    );
    var f = this;
    this instanceof Xt || (f = window.ethereum), Array.isArray(t) ? Promise.all(
      t.map(
        (y) => f._request(y).then((T) => a(null, this._wrapResult(y, T))).catch((T) => a(T, null))
      )
    ) : f._request(t).then((y) => a(null, this._wrapResult(t, y))).catch((y) => a(y, null));
  }
  async eth_accounts(t) {
    console.log("eth_accounts", t);
    const a = await this.send(
      "eth_accounts",
      t
    );
    return console.log("accountsInfo", a), this.emitChainChanged(await this.eth_chainId({})), this.emitNetworkChanged(await this.net_version({})), a[0] && (this.address = a[0]), a ?? [];
  }
  async eth_requestAccounts(t) {
    const a = await this.send("eth_requestAccounts", t);
    return console.log("newAccounts", a), this.emitConnect(await this.eth_chainId({})), this.emitChainChanged(await this.eth_chainId({})), a[0] && (this.address = a[0]), a;
  }
  async eth_coinbase(t) {
    const a = await this.eth_accounts(t);
    return (a == null ? void 0 : a[0]) || null;
  }
  async net_version(t) {
    return this.networkVersion;
  }
  async eth_chainId(t) {
    return this._chainId;
  }
  async wallet_requestPermissions(t) {
    const a = await this.send("wallet_requestPermissions", t);
    return console.log("wallet_requestPermissions", a), a;
  }
  async wallet_getPermissions(t) {
    const a = await this.send("wallet_getPermissions", t);
    return console.log("wallet_getPermissions", a), a;
  }
  async wallet_revokePermissions(t) {
    const a = await this.send("wallet_revokePermissions", t);
    return console.log("wallet_revokePermissions", a), a;
  }
  async personal_sign(t) {
    const a = await this.send("personal_sign", t);
    return console.log("personal_sign", a), a;
  }
  async personal_ecRecover(t) {
    const a = await this.send("personal_ecRecover", t);
    return console.log("personal_ecRecover", a), a;
  }
  async eth_signTypedData_v3(t) {
    const a = await this.send("eth_signTypedData_v3", t);
    return console.log("eth_signTypedData_v3", a), a;
  }
  async eth_signTypedData_v4(t) {
    const a = await this.send("eth_signTypedData_v4", t);
    return console.log("eth_signTypedData_v4", a), a;
  }
  async eth_signTypedData(t) {
    const a = await this.send("eth_signTypedData", t);
    return console.log("eth_signTypedData", a), a;
  }
  async eth_sendTransaction(t) {
    const a = await this.send("eth_sendTransaction", t);
    return console.log("eth_sendTransaction", a), a;
  }
  async wallet_watchAsset(t) {
    const a = await this.send("wallet_watchAsset", t);
    return console.log("wallet_watchAsset", a), a;
  }
  async wallet_addEthereumChain(t) {
    const a = await this.send("wallet_addEthereumChain", t);
    return console.log("wallet_addEthereumChain", a), a;
  }
  async wallet_switchEthereumChain(t) {
    const a = await this.send("wallet_switchEthereumChain", t);
    return console.log("wallet_switchEthereumChain", a), a;
  }
  sendResponse(t, a) {
    let f = { jsonrpc: "2.0", id: t };
    return a !== null && typeof a == "object" && a.jsonrpc && a.result ? f.result = a.result : f.result = a, f;
  }
  send(t, a) {
    return super.send(t, a, {
      network: this.chainId
    });
  }
  emit(t, a) {
    switch (super.emit(t, a), console.log("eth emit", t, a), t) {
      case "chainChanged":
        typeof a == "string" && a && (this._chainId = a, this._setGlobalChainId(a).catch((f) => {
          console.log("_setGlobalChainId", f);
        }));
        break;
      case "networkChanged":
        break;
      case "accountsChanged":
        typeof (a == null ? void 0 : a[0]) == "string" && (a != null && a[0]) && (this.address = a[0]);
        break;
      case "connect":
        typeof (a == null ? void 0 : a.chainId) == "string" && (a != null && a.chainId) && (this._chainId = a.chainId);
        break;
    }
  }
  onDappEmit(t) {
    const { detail: a } = t, { type: f, coinType: y, event: T, data: _ } = a;
    y === Rt.ETH && this.emit(T, _);
  }
}
const Wn = {
  SVG_ICON: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCA5MDAgOTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjkwMCIgcng9IjQ1MCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01NzcuMjQ5IDIxNS45NzVDNTM5Ljk1NiAxOTYuMjMyIDUxMS42NDYgMTYxLjU0OSA1MDAuNDY4IDExOS44NjhDNDk3LjAyMSAxMzIuNjEzIDQ5NS4yNDUgMTQ1Ljk4NCA0OTUuMjQ1IDE1OS43NzRDNDk1LjI0NSAxNzAuNTMzIDQ5Ni4zOTQgMTgwLjk4IDQ5OC40ODMgMTkxLjExM0M0OTguNDgzIDE5MS4xMTMgNDk4LjQ4MyAxOTEuMTEzIDQ5OC40ODMgMTkxLjIxN0M0OTguNDgzIDE5MS4zMjIgNDk4LjU4OCAxOTEuNTMxIDQ5OC41ODggMTkxLjYzNUM1MDEuNDA4IDIwNS4yMTYgNTA2LjAwNSAyMTguMDY1IDUxMi4xNjggMjI5Ljk3NEM0OTkuMDA2IDIyMC4yNTggNDg3LjMwNiAyMDguNjYzIDQ3Ny40ODYgMTk1LjYwNUM0NjQuMzIzIDI5Ny42NjcgNTAxLjQwOCA0MDMuOTA3IDU2OS4yMDYgNDczLjg5OEM2NTcuNjg3IDU3Ni45IDU3Ni4xIDc1MS42NjkgNDM4LjIwNyA3NDcuMDczQzI0My4wNjggNzQ4Ljc0NCAyMDkuNjM5IDQ2MS4zNjIgMzk2LjgzOSA0MTYuMjM0TDM5Ni43MzUgNDE1LjcxMUM0NDYuNjY5IDM5OS41MTkgNDcwLjA2OSAzNjcuMDMxIDQ3NC4xNDMgMzI0LjgyN0M0MDIuMDYzIDM4My4yMjMgMjg4LjE5NiAzMTAuODI5IDMxMS44MDUgMjIwLjE1NEM0MS4yNDI1IDM1My4zNDYgMTQxLjczNyA3ODUuNDExIDQ0OC40NDUgNzgwLjA4M0M1ODIuMDU1IDc4MC4wODMgNjk1LjA4NSA2OTEuNzA2IDczMi4xNyA1NzAuMjE0Qzc3Ni40NjMgNDI4LjU2MSA3MDQuOCAyNzcuNjA5IDU3Ny4yNDkgMjE1Ljk3NVoiIGZpbGw9IiMxMkZFNzQiLz4KPC9zdmc+Cg==",
  EIP6963_UUID: "8e014263-cedf-54f2-a932-ec940b52f9c3"
}, ua = new Ma(), xn = new Xt();
window.foxwallet = {
  aleo: ua,
  ethereum: xn
};
window.aleo = ua;
window.ethereum = xn;
Object.freeze(window.foxwallet);
Object.seal(window.aleo);
const xi = {
  uuid: Wn.EIP6963_UUID,
  name: "FoxWallet",
  icon: Wn.SVG_ICON,
  rdns: "com.foxwallet"
}, Ai = Object.freeze({ info: xi, provider: xn });
function oa() {
  window.dispatchEvent(
    new CustomEvent("eip6963:announceProvider", {
      detail: Ai
    })
  );
}
window.addEventListener("eip6963:requestProvider", (r) => {
  oa();
});
oa();
