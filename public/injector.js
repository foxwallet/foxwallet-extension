var Ca = Object.defineProperty;
var Sa = (i, e, t) => e in i ? Ca(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var xe = (i, e, t) => (Sa(i, typeof e != "symbol" ? e + "" : e, t), t), Ln = (i, e, t) => {
  if (!e.has(i))
    throw TypeError("Cannot " + t);
};
var Ae = (i, e, t) => (Ln(i, e, "read from private field"), t ? t.call(i) : e.get(i)), At = (i, e, t) => {
  if (e.has(i))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(i) : e.set(i, t);
}, Le = (i, e, t, n) => (Ln(i, e, "write to private field"), n ? n.call(i, t) : e.set(i, t), t);
function Oa(i) {
  return { all: i = i || /* @__PURE__ */ new Map(), on: function(e, t) {
    var n = i.get(e);
    n ? n.push(t) : i.set(e, [t]);
  }, off: function(e, t) {
    var n = i.get(e);
    n && (t ? n.splice(n.indexOf(t) >>> 0, 1) : i.set(e, []));
  }, emit: function(e, t) {
    var n = i.get(e);
    n && n.slice().map(function(m) {
      m(t);
    }), (n = i.get("*")) && n.slice().map(function(m) {
      m(e, t);
    });
  } };
}
const Mn = "string", Sn = "object";
function Ra(i) {
  return i != null && typeof i === Sn && typeof i.name === Mn && typeof i.message === Mn && typeof i.stack === Mn;
}
function Lt(i) {
  if (typeof i !== Sn || i == null)
    return i;
  if (i instanceof Error)
    return { name: i.name, message: i.message, stack: i.stack ?? "", ...i.cause ? { cause: Lt(i.cause) } : {}, ...Lt({ ...i }) };
  if (Array.isArray(i)) {
    let t = [];
    for (let n of i)
      t.push(Lt(n));
    return t;
  }
  let e = /* @__PURE__ */ Object.create(null);
  for (let [t, n] of Object.entries(i))
    e[t] = Lt(n);
  return e;
}
function Jt(i) {
  if (Ra(i)) {
    let t = Error(i.message, i.cause ? { cause: Jt(i.cause) } : void 0);
    t.name = i.name, t.stack = i.stack;
    for (let [n, m] of Object.entries(i))
      n !== "name" && n !== "message" && n !== "stack" && n !== "cause" && (t[n] = m);
    return t;
  }
  if (i == null || typeof i !== Sn)
    return i;
  if (Array.isArray(i)) {
    let t = [];
    for (let n of i)
      t.push(Jt(n));
    return t;
  }
  let e = /* @__PURE__ */ Object.create(null);
  for (let [t, n] of Object.entries(i))
    e[t] = Jt(n);
  return e;
}
function Na(i) {
  let e, t = {};
  function n() {
    Object.entries(t).length === 0 && (e == null || e(), e = void 0);
  }
  let m = Math.floor(Math.random() * 1e4);
  function u() {
    return m++;
  }
  return {
    async sendMessage(f, _, ...v) {
      var V, U, Oe;
      const I = {
        id: u(),
        type: f,
        data: _,
        timestamp: Date.now()
      }, S = await ((V = i.verifyMessageData) == null ? void 0 : V.call(i, I)) ?? I;
      (U = i.logger) == null || U.debug(`[messaging] sendMessage {id=${S.id}} ─ᐅ`, S, ...v);
      const { res: N, err: F } = await i.sendMessage(S, ...v) ?? { err: /* @__PURE__ */ new Error("No response") };
      if ((Oe = i.logger) == null || Oe.debug(`[messaging] sendMessage {id=${S.id}} ᐊ─`, {
        res: N,
        err: F
      }), F != null)
        throw Jt(F);
      return N;
    },
    onMessage(f, _) {
      var v, I, S;
      if (e == null && ((v = i.logger) == null || v.debug(`[messaging] "${f}" initialized the message listener for this context`), e = i.addRootListener((N) => {
        var V, U;
        if (typeof N.type != "string" || typeof N.timestamp != "number")
          if (i.throwOnUnknownMessageFormat) {
            const Oe = Error(`[messaging] Unknown message format, must include the 'type' & 'timestamp' fields, received: ${JSON.stringify(N)}`);
            throw (V = i.logger) == null || V.error(Oe), Oe;
          } else
            return;
        (U = i == null ? void 0 : i.logger) == null || U.debug("[messaging] Received message", N);
        const F = t[N.type];
        if (F != null)
          return (async () => {
            var Oe, rt, ze;
            try {
              const De = await F(N), Xe = ((Oe = i.verifyMessageData) == null ? void 0 : Oe.call(i, De)) ?? De;
              return (rt = i == null ? void 0 : i.logger) == null || rt.debug(`[messaging] onMessage {id=${N.id}} ─ᐅ`, { res: Xe }), { res: Xe };
            } catch (De) {
              return (ze = i == null ? void 0 : i.logger) == null || ze.debug(`[messaging] onMessage {id=${N.id}} ─ᐅ`, { err: De }), { err: Lt(De) };
            }
          })();
      })), t[f] != null) {
        const N = Error(`[messaging] In this JS context, only one listener can be setup for ${f}`);
        throw (I = i.logger) == null || I.error(N), N;
      }
      return t[f] = _, (S = i.logger) == null || S.log(`[messaging] Added listener for ${f}`), () => {
        delete t[f], n();
      };
    },
    removeAllListeners() {
      Object.keys(t).forEach((f) => {
        delete t[f];
      }), n();
    }
  };
}
function Bn(i, e = { targetScope: window ?? void 0 }) {
  return typeof cloneInto < "u" ? cloneInto(i, e.targetScope) : i;
}
function Da() {
  return Math.random().toString(36).substring(2, 10);
}
const wn = "@webext-core/messaging/custom-events", _n = "@webext-core/messaging/custom-events/response";
function Fa(i) {
  const e = i.namespace, t = Da(), n = [], m = (f) => new Promise((_) => {
    const v = () => {
      window.removeEventListener(_n, I);
      const S = n.indexOf(v);
      S !== -1 && n.splice(S, 1);
    }, I = (S) => {
      const { detail: N } = S;
      N.namespace === e && N.instanceId !== t && N.message.type === f.detail.message.type && N.message.id === f.detail.message.id && (_(N.response), v());
    };
    n.push(v), window.addEventListener(_n, I), window.dispatchEvent(f);
  }), u = Na({
    ...i,
    sendMessage(f) {
      const _ = new CustomEvent(wn, { detail: Bn({
        message: f,
        namespace: e,
        instanceId: t
      }) });
      return m(_);
    },
    addRootListener(f) {
      const _ = async (v) => {
        const { detail: I, ...S } = v;
        if (I.namespace !== e || I.instanceId === t)
          return;
        const N = {
          ...I.message,
          event: S
        }, F = {
          response: await f(N),
          message: N,
          instanceId: t,
          namespace: e
        }, V = new CustomEvent(_n, { detail: Bn(F) });
        window.dispatchEvent(V);
      };
      return window.addEventListener(wn, _), () => window.removeEventListener(wn, _);
    },
    verifyMessageData(f) {
      return structuredClone(f);
    }
  });
  return {
    ...u,
    removeAllListeners() {
      u.removeAllListeners(), n.forEach((f) => f());
    }
  };
}
function Pa(i) {
  return Fa({
    // Public routing namespace, never an authentication credential.
    namespace: `foxwallet:injector-to-content:v1:${i}`
  });
}
const Un = /* @__PURE__ */ new Map();
function La(i) {
  let e = Un.get(i);
  return e || (e = Pa(i), Un.set(i, e)), e;
}
var qe = /* @__PURE__ */ ((i) => (i.ETH = "ETH", i.ALEO = "ALEO", i.QTUM = "QTUM", i))(qe || {});
Object.values(qe);
const Vn = [
  "eth_accounts",
  "eth_getBalance",
  "eth_requestAccounts",
  "wallet_getPermissions",
  "wallet_requestPermissions",
  "wallet_revokePermissions",
  "personal_sign",
  "personal_ecRecover",
  "eth_signTypedData_v3",
  "eth_signTypedData_v4",
  "eth_signTypedData",
  "eth_sendTransaction",
  "wallet_watchAsset",
  "wallet_addEthereumChain",
  "wallet_switchEthereumChain",
  "_setGlobalChainId",
  "_getGlobalChainId",
  "proxyRPCCall"
], qn = {
  [qe.ALEO]: [
    "connect",
    "disconnect",
    "decrypt",
    "requestRecords",
    "requestRecordPlaintexts",
    "requestTransaction",
    "signMessage",
    "requestExecution",
    "requestBulkTransactions",
    "requestDeploy",
    "transactionStatus",
    "getExecution",
    "requestTransactionHistory"
  ],
  [qe.ETH]: Vn,
  [qe.QTUM]: Vn
};
function Ba(i, e) {
  return typeof i == "string" && Object.prototype.hasOwnProperty.call(qn, i) && typeof e == "string" && qn[i].includes(
    e
  );
}
class Ke extends Error {
  constructor(t, n) {
    super();
    xe(this, "code");
    this.code = t, this.message = n;
  }
  toString() {
    return `${this.message} (${this.code})`;
  }
}
var jt, Be, Ot;
class On {
  constructor(e) {
    At(this, jt, void 0);
    At(this, Be, void 0);
    xe(this, "chain");
    At(this, Ot, void 0);
    xe(this, "on", (e, t) => (Ae(this, Be).on(e, t), () => Ae(this, Be).off(e, t)));
    xe(this, "removeListener", (e, t) => {
      Ae(this, Be).off(e, t);
    });
    xe(this, "off", (e, t) => {
      Ae(this, Be).off(e, t);
    });
    xe(this, "removeAllListeners", () => {
      Ae(this, Be).all.clear();
    });
    this.chain = e, Le(this, jt, !0), Le(this, Be, Oa()), this.emit = this.emit.bind(this), Le(this, Ot, La(e)), Ae(this, Ot).onMessage("emit", ({ data: t }) => {
      (t == null ? void 0 : t.type) === "EmitData" && t.coinType === this.chain && this.onDappEmit({ detail: t });
    });
  }
  onDappEmit(e) {
  }
  async send(e, t, n = {}) {
    if (!Ba(this.chain, e))
      throw new Ke(4200, `Unsupported method: ${e}`);
    const { error: m, data: u } = await Ae(this, Ot).sendMessage(e, {
      payload: t,
      metadata: n
    });
    if (m)
      throw m;
    return u;
  }
  get isFoxWallet() {
    return Ae(this, jt);
  }
  emit(e, t) {
    Ae(this, Be).emit(e, t);
  }
}
jt = new WeakMap(), Be = new WeakMap(), Ot = new WeakMap();
function Ua(i) {
  return Array.from(i).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var We, Ge;
class Va extends On {
  constructor() {
    super(qe.ALEO);
    At(this, We, void 0);
    At(this, Ge, void 0);
    xe(this, "_readyState");
    Le(this, We, null), Le(this, Ge, null), this._readyState = "Installed";
  }
  get publicKey() {
    return Ae(this, We);
  }
  get network() {
    return Ae(this, Ge);
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
  async connect(t, n, m) {
    const u = this.convertNetworkToChainId(n), f = await this.send("connect", {
      decryptPermission: t,
      network: u,
      programs: m
    });
    return Le(this, We, f || null), Le(this, Ge, n), !!f;
  }
  async disconnect() {
    if (!Ae(this, We) || !this.network)
      throw new Error("Connect before disconnect");
    const t = await this.send("disconnect", {});
    return Le(this, We, null), Le(this, Ge, null), t;
  }
  async decrypt(t, n, m, u, f) {
    return await this.send("decrypt", {
      cipherText: t,
      tpk: n,
      programId: m,
      functionName: u,
      index: f
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
    const n = Ua(t), m = await this.send("signMessage", {
      message: n
    });
    if (!m)
      throw new Error("sign message failed");
    return { signature: new TextEncoder().encode(m.signature) };
  }
  send(t, n) {
    return super.send(t, n, {
      address: Ae(this, We),
      network: Ae(this, Ge) ? this.convertNetworkToChainId(Ae(this, Ge)) : ""
    });
  }
}
We = new WeakMap(), Ge = new WeakMap();
const qa = {
  DEFAULT_GAS_LIMIT: 21e3,
  TOKEN_TRANSFER_TOPIC: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  MAX_SAFE_CHAIN_ID: 4503599627370476
};
var ua = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function ya(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
}
function za(i) {
  if (i.__esModule)
    return i;
  var e = i.default;
  if (typeof e == "function") {
    var t = function n() {
      return this instanceof n ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    t.prototype = e.prototype;
  } else
    t = {};
  return Object.defineProperty(t, "__esModule", { value: !0 }), Object.keys(i).forEach(function(n) {
    var m = Object.getOwnPropertyDescriptor(i, n);
    Object.defineProperty(t, n, m.get ? m : {
      enumerable: !0,
      get: function() {
        return i[n];
      }
    });
  }), t;
}
var Rn = { exports: {} };
const Ha = {}, ja = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ha
}, Symbol.toStringTag, { value: "Module" })), Wa = /* @__PURE__ */ za(ja);
Rn.exports;
(function(i) {
  (function(e, t) {
    function n(T, a) {
      if (!T)
        throw new Error(a || "Assertion failed");
    }
    function m(T, a) {
      T.super_ = a;
      var r = function() {
      };
      r.prototype = a.prototype, T.prototype = new r(), T.prototype.constructor = T;
    }
    function u(T, a, r) {
      if (u.isBN(T))
        return T;
      this.negative = 0, this.words = null, this.length = 0, this.red = null, T !== null && ((a === "le" || a === "be") && (r = a, a = 10), this._init(T || 0, a || 10, r || "be"));
    }
    typeof e == "object" ? e.exports = u : t.BN = u, u.BN = u, u.wordSize = 26;
    var f;
    try {
      typeof window < "u" && typeof window.Buffer < "u" ? f = window.Buffer : f = Wa.Buffer;
    } catch {
    }
    u.isBN = function(a) {
      return a instanceof u ? !0 : a !== null && typeof a == "object" && a.constructor.wordSize === u.wordSize && Array.isArray(a.words);
    }, u.max = function(a, r) {
      return a.cmp(r) > 0 ? a : r;
    }, u.min = function(a, r) {
      return a.cmp(r) < 0 ? a : r;
    }, u.prototype._init = function(a, r, y) {
      if (typeof a == "number")
        return this._initNumber(a, r, y);
      if (typeof a == "object")
        return this._initArray(a, r, y);
      r === "hex" && (r = 16), n(r === (r | 0) && r >= 2 && r <= 36), a = a.toString().replace(/\s+/g, "");
      var l = 0;
      a[0] === "-" && (l++, this.negative = 1), l < a.length && (r === 16 ? this._parseHex(a, l, y) : (this._parseBase(a, r, l), y === "le" && this._initArray(this.toArray(), r, y)));
    }, u.prototype._initNumber = function(a, r, y) {
      a < 0 && (this.negative = 1, a = -a), a < 67108864 ? (this.words = [a & 67108863], this.length = 1) : a < 4503599627370496 ? (this.words = [
        a & 67108863,
        a / 67108864 & 67108863
      ], this.length = 2) : (n(a < 9007199254740992), this.words = [
        a & 67108863,
        a / 67108864 & 67108863,
        1
      ], this.length = 3), y === "le" && this._initArray(this.toArray(), r, y);
    }, u.prototype._initArray = function(a, r, y) {
      if (n(typeof a.length == "number"), a.length <= 0)
        return this.words = [0], this.length = 1, this;
      this.length = Math.ceil(a.length / 3), this.words = new Array(this.length);
      for (var l = 0; l < this.length; l++)
        this.words[l] = 0;
      var c, b, h = 0;
      if (y === "be")
        for (l = a.length - 1, c = 0; l >= 0; l -= 3)
          b = a[l] | a[l - 1] << 8 | a[l - 2] << 16, this.words[c] |= b << h & 67108863, this.words[c + 1] = b >>> 26 - h & 67108863, h += 24, h >= 26 && (h -= 26, c++);
      else if (y === "le")
        for (l = 0, c = 0; l < a.length; l += 3)
          b = a[l] | a[l + 1] << 8 | a[l + 2] << 16, this.words[c] |= b << h & 67108863, this.words[c + 1] = b >>> 26 - h & 67108863, h += 24, h >= 26 && (h -= 26, c++);
      return this._strip();
    };
    function _(T, a) {
      var r = T.charCodeAt(a);
      if (r >= 48 && r <= 57)
        return r - 48;
      if (r >= 65 && r <= 70)
        return r - 55;
      if (r >= 97 && r <= 102)
        return r - 87;
      n(!1, "Invalid character in " + T);
    }
    function v(T, a, r) {
      var y = _(T, r);
      return r - 1 >= a && (y |= _(T, r - 1) << 4), y;
    }
    u.prototype._parseHex = function(a, r, y) {
      this.length = Math.ceil((a.length - r) / 6), this.words = new Array(this.length);
      for (var l = 0; l < this.length; l++)
        this.words[l] = 0;
      var c = 0, b = 0, h;
      if (y === "be")
        for (l = a.length - 1; l >= r; l -= 2)
          h = v(a, r, l) << c, this.words[b] |= h & 67108863, c >= 18 ? (c -= 18, b += 1, this.words[b] |= h >>> 26) : c += 8;
      else {
        var o = a.length - r;
        for (l = o % 2 === 0 ? r + 1 : r; l < a.length; l += 2)
          h = v(a, r, l) << c, this.words[b] |= h & 67108863, c >= 18 ? (c -= 18, b += 1, this.words[b] |= h >>> 26) : c += 8;
      }
      this._strip();
    };
    function I(T, a, r, y) {
      for (var l = 0, c = 0, b = Math.min(T.length, r), h = a; h < b; h++) {
        var o = T.charCodeAt(h) - 48;
        l *= y, o >= 49 ? c = o - 49 + 10 : o >= 17 ? c = o - 17 + 10 : c = o, n(o >= 0 && c < y, "Invalid character"), l += c;
      }
      return l;
    }
    u.prototype._parseBase = function(a, r, y) {
      this.words = [0], this.length = 1;
      for (var l = 0, c = 1; c <= 67108863; c *= r)
        l++;
      l--, c = c / r | 0;
      for (var b = a.length - y, h = b % l, o = Math.min(b, b - h) + y, s = 0, d = y; d < o; d += l)
        s = I(a, d, d + l, r), this.imuln(c), this.words[0] + s < 67108864 ? this.words[0] += s : this._iaddn(s);
      if (h !== 0) {
        var O = 1;
        for (s = I(a, d, a.length, r), d = 0; d < h; d++)
          O *= r;
        this.imuln(O), this.words[0] + s < 67108864 ? this.words[0] += s : this._iaddn(s);
      }
      this._strip();
    }, u.prototype.copy = function(a) {
      a.words = new Array(this.length);
      for (var r = 0; r < this.length; r++)
        a.words[r] = this.words[r];
      a.length = this.length, a.negative = this.negative, a.red = this.red;
    };
    function S(T, a) {
      T.words = a.words, T.length = a.length, T.negative = a.negative, T.red = a.red;
    }
    if (u.prototype._move = function(a) {
      S(a, this);
    }, u.prototype.clone = function() {
      var a = new u(null);
      return this.copy(a), a;
    }, u.prototype._expand = function(a) {
      for (; this.length < a; )
        this.words[this.length++] = 0;
      return this;
    }, u.prototype._strip = function() {
      for (; this.length > 1 && this.words[this.length - 1] === 0; )
        this.length--;
      return this._normSign();
    }, u.prototype._normSign = function() {
      return this.length === 1 && this.words[0] === 0 && (this.negative = 0), this;
    }, typeof Symbol < "u" && typeof Symbol.for == "function")
      try {
        u.prototype[Symbol.for("nodejs.util.inspect.custom")] = N;
      } catch {
        u.prototype.inspect = N;
      }
    else
      u.prototype.inspect = N;
    function N() {
      return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
    }
    var F = [
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
    ], V = [
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
    ], U = [
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
    u.prototype.toString = function(a, r) {
      a = a || 10, r = r | 0 || 1;
      var y;
      if (a === 16 || a === "hex") {
        y = "";
        for (var l = 0, c = 0, b = 0; b < this.length; b++) {
          var h = this.words[b], o = ((h << l | c) & 16777215).toString(16);
          c = h >>> 24 - l & 16777215, l += 2, l >= 26 && (l -= 26, b--), c !== 0 || b !== this.length - 1 ? y = F[6 - o.length] + o + y : y = o + y;
        }
        for (c !== 0 && (y = c.toString(16) + y); y.length % r !== 0; )
          y = "0" + y;
        return this.negative !== 0 && (y = "-" + y), y;
      }
      if (a === (a | 0) && a >= 2 && a <= 36) {
        var s = V[a], d = U[a];
        y = "";
        var O = this.clone();
        for (O.negative = 0; !O.isZero(); ) {
          var p = O.modrn(d).toString(a);
          O = O.idivn(d), O.isZero() ? y = p + y : y = F[s - p.length] + p + y;
        }
        for (this.isZero() && (y = "0" + y); y.length % r !== 0; )
          y = "0" + y;
        return this.negative !== 0 && (y = "-" + y), y;
      }
      n(!1, "Base should be between 2 and 36");
    }, u.prototype.toNumber = function() {
      var a = this.words[0];
      return this.length === 2 ? a += this.words[1] * 67108864 : this.length === 3 && this.words[2] === 1 ? a += 4503599627370496 + this.words[1] * 67108864 : this.length > 2 && n(!1, "Number can only safely store up to 53 bits"), this.negative !== 0 ? -a : a;
    }, u.prototype.toJSON = function() {
      return this.toString(16, 2);
    }, f && (u.prototype.toBuffer = function(a, r) {
      return this.toArrayLike(f, a, r);
    }), u.prototype.toArray = function(a, r) {
      return this.toArrayLike(Array, a, r);
    };
    var Oe = function(a, r) {
      return a.allocUnsafe ? a.allocUnsafe(r) : new a(r);
    };
    u.prototype.toArrayLike = function(a, r, y) {
      this._strip();
      var l = this.byteLength(), c = y || Math.max(1, l);
      n(l <= c, "byte array longer than desired length"), n(c > 0, "Requested array length <= 0");
      var b = Oe(a, c), h = r === "le" ? "LE" : "BE";
      return this["_toArrayLike" + h](b, l), b;
    }, u.prototype._toArrayLikeLE = function(a, r) {
      for (var y = 0, l = 0, c = 0, b = 0; c < this.length; c++) {
        var h = this.words[c] << b | l;
        a[y++] = h & 255, y < a.length && (a[y++] = h >> 8 & 255), y < a.length && (a[y++] = h >> 16 & 255), b === 6 ? (y < a.length && (a[y++] = h >> 24 & 255), l = 0, b = 0) : (l = h >>> 24, b += 2);
      }
      if (y < a.length)
        for (a[y++] = l; y < a.length; )
          a[y++] = 0;
    }, u.prototype._toArrayLikeBE = function(a, r) {
      for (var y = a.length - 1, l = 0, c = 0, b = 0; c < this.length; c++) {
        var h = this.words[c] << b | l;
        a[y--] = h & 255, y >= 0 && (a[y--] = h >> 8 & 255), y >= 0 && (a[y--] = h >> 16 & 255), b === 6 ? (y >= 0 && (a[y--] = h >> 24 & 255), l = 0, b = 0) : (l = h >>> 24, b += 2);
      }
      if (y >= 0)
        for (a[y--] = l; y >= 0; )
          a[y--] = 0;
    }, Math.clz32 ? u.prototype._countBits = function(a) {
      return 32 - Math.clz32(a);
    } : u.prototype._countBits = function(a) {
      var r = a, y = 0;
      return r >= 4096 && (y += 13, r >>>= 13), r >= 64 && (y += 7, r >>>= 7), r >= 8 && (y += 4, r >>>= 4), r >= 2 && (y += 2, r >>>= 2), y + r;
    }, u.prototype._zeroBits = function(a) {
      if (a === 0)
        return 26;
      var r = a, y = 0;
      return r & 8191 || (y += 13, r >>>= 13), r & 127 || (y += 7, r >>>= 7), r & 15 || (y += 4, r >>>= 4), r & 3 || (y += 2, r >>>= 2), r & 1 || y++, y;
    }, u.prototype.bitLength = function() {
      var a = this.words[this.length - 1], r = this._countBits(a);
      return (this.length - 1) * 26 + r;
    };
    function rt(T) {
      for (var a = new Array(T.bitLength()), r = 0; r < a.length; r++) {
        var y = r / 26 | 0, l = r % 26;
        a[r] = T.words[y] >>> l & 1;
      }
      return a;
    }
    u.prototype.zeroBits = function() {
      if (this.isZero())
        return 0;
      for (var a = 0, r = 0; r < this.length; r++) {
        var y = this._zeroBits(this.words[r]);
        if (a += y, y !== 26)
          break;
      }
      return a;
    }, u.prototype.byteLength = function() {
      return Math.ceil(this.bitLength() / 8);
    }, u.prototype.toTwos = function(a) {
      return this.negative !== 0 ? this.abs().inotn(a).iaddn(1) : this.clone();
    }, u.prototype.fromTwos = function(a) {
      return this.testn(a - 1) ? this.notn(a).iaddn(1).ineg() : this.clone();
    }, u.prototype.isNeg = function() {
      return this.negative !== 0;
    }, u.prototype.neg = function() {
      return this.clone().ineg();
    }, u.prototype.ineg = function() {
      return this.isZero() || (this.negative ^= 1), this;
    }, u.prototype.iuor = function(a) {
      for (; this.length < a.length; )
        this.words[this.length++] = 0;
      for (var r = 0; r < a.length; r++)
        this.words[r] = this.words[r] | a.words[r];
      return this._strip();
    }, u.prototype.ior = function(a) {
      return n((this.negative | a.negative) === 0), this.iuor(a);
    }, u.prototype.or = function(a) {
      return this.length > a.length ? this.clone().ior(a) : a.clone().ior(this);
    }, u.prototype.uor = function(a) {
      return this.length > a.length ? this.clone().iuor(a) : a.clone().iuor(this);
    }, u.prototype.iuand = function(a) {
      var r;
      this.length > a.length ? r = a : r = this;
      for (var y = 0; y < r.length; y++)
        this.words[y] = this.words[y] & a.words[y];
      return this.length = r.length, this._strip();
    }, u.prototype.iand = function(a) {
      return n((this.negative | a.negative) === 0), this.iuand(a);
    }, u.prototype.and = function(a) {
      return this.length > a.length ? this.clone().iand(a) : a.clone().iand(this);
    }, u.prototype.uand = function(a) {
      return this.length > a.length ? this.clone().iuand(a) : a.clone().iuand(this);
    }, u.prototype.iuxor = function(a) {
      var r, y;
      this.length > a.length ? (r = this, y = a) : (r = a, y = this);
      for (var l = 0; l < y.length; l++)
        this.words[l] = r.words[l] ^ y.words[l];
      if (this !== r)
        for (; l < r.length; l++)
          this.words[l] = r.words[l];
      return this.length = r.length, this._strip();
    }, u.prototype.ixor = function(a) {
      return n((this.negative | a.negative) === 0), this.iuxor(a);
    }, u.prototype.xor = function(a) {
      return this.length > a.length ? this.clone().ixor(a) : a.clone().ixor(this);
    }, u.prototype.uxor = function(a) {
      return this.length > a.length ? this.clone().iuxor(a) : a.clone().iuxor(this);
    }, u.prototype.inotn = function(a) {
      n(typeof a == "number" && a >= 0);
      var r = Math.ceil(a / 26) | 0, y = a % 26;
      this._expand(r), y > 0 && r--;
      for (var l = 0; l < r; l++)
        this.words[l] = ~this.words[l] & 67108863;
      return y > 0 && (this.words[l] = ~this.words[l] & 67108863 >> 26 - y), this._strip();
    }, u.prototype.notn = function(a) {
      return this.clone().inotn(a);
    }, u.prototype.setn = function(a, r) {
      n(typeof a == "number" && a >= 0);
      var y = a / 26 | 0, l = a % 26;
      return this._expand(y + 1), r ? this.words[y] = this.words[y] | 1 << l : this.words[y] = this.words[y] & ~(1 << l), this._strip();
    }, u.prototype.iadd = function(a) {
      var r;
      if (this.negative !== 0 && a.negative === 0)
        return this.negative = 0, r = this.isub(a), this.negative ^= 1, this._normSign();
      if (this.negative === 0 && a.negative !== 0)
        return a.negative = 0, r = this.isub(a), a.negative = 1, r._normSign();
      var y, l;
      this.length > a.length ? (y = this, l = a) : (y = a, l = this);
      for (var c = 0, b = 0; b < l.length; b++)
        r = (y.words[b] | 0) + (l.words[b] | 0) + c, this.words[b] = r & 67108863, c = r >>> 26;
      for (; c !== 0 && b < y.length; b++)
        r = (y.words[b] | 0) + c, this.words[b] = r & 67108863, c = r >>> 26;
      if (this.length = y.length, c !== 0)
        this.words[this.length] = c, this.length++;
      else if (y !== this)
        for (; b < y.length; b++)
          this.words[b] = y.words[b];
      return this;
    }, u.prototype.add = function(a) {
      var r;
      return a.negative !== 0 && this.negative === 0 ? (a.negative = 0, r = this.sub(a), a.negative ^= 1, r) : a.negative === 0 && this.negative !== 0 ? (this.negative = 0, r = a.sub(this), this.negative = 1, r) : this.length > a.length ? this.clone().iadd(a) : a.clone().iadd(this);
    }, u.prototype.isub = function(a) {
      if (a.negative !== 0) {
        a.negative = 0;
        var r = this.iadd(a);
        return a.negative = 1, r._normSign();
      } else if (this.negative !== 0)
        return this.negative = 0, this.iadd(a), this.negative = 1, this._normSign();
      var y = this.cmp(a);
      if (y === 0)
        return this.negative = 0, this.length = 1, this.words[0] = 0, this;
      var l, c;
      y > 0 ? (l = this, c = a) : (l = a, c = this);
      for (var b = 0, h = 0; h < c.length; h++)
        r = (l.words[h] | 0) - (c.words[h] | 0) + b, b = r >> 26, this.words[h] = r & 67108863;
      for (; b !== 0 && h < l.length; h++)
        r = (l.words[h] | 0) + b, b = r >> 26, this.words[h] = r & 67108863;
      if (b === 0 && h < l.length && l !== this)
        for (; h < l.length; h++)
          this.words[h] = l.words[h];
      return this.length = Math.max(this.length, h), l !== this && (this.negative = 1), this._strip();
    }, u.prototype.sub = function(a) {
      return this.clone().isub(a);
    };
    function ze(T, a, r) {
      r.negative = a.negative ^ T.negative;
      var y = T.length + a.length | 0;
      r.length = y, y = y - 1 | 0;
      var l = T.words[0] | 0, c = a.words[0] | 0, b = l * c, h = b & 67108863, o = b / 67108864 | 0;
      r.words[0] = h;
      for (var s = 1; s < y; s++) {
        for (var d = o >>> 26, O = o & 67108863, p = Math.min(s, a.length - 1), g = Math.max(0, s - T.length + 1); g <= p; g++) {
          var M = s - g | 0;
          l = T.words[M] | 0, c = a.words[g] | 0, b = l * c + O, d += b / 67108864 | 0, O = b & 67108863;
        }
        r.words[s] = O | 0, o = d | 0;
      }
      return o !== 0 ? r.words[s] = o | 0 : r.length--, r._strip();
    }
    var De = function(a, r, y) {
      var l = a.words, c = r.words, b = y.words, h = 0, o, s, d, O = l[0] | 0, p = O & 8191, g = O >>> 13, M = l[1] | 0, w = M & 8191, k = M >>> 13, C = l[2] | 0, A = C & 8191, x = C >>> 13, we = l[3] | 0, E = we & 8191, D = we >>> 13, yt = l[4] | 0, q = yt & 8191, z = yt >>> 13, ot = l[5] | 0, H = ot & 8191, j = ot >>> 13, lt = l[6] | 0, W = lt & 8191, G = lt >>> 13, mt = l[7] | 0, $ = mt & 8191, K = mt >>> 13, dt = l[8] | 0, Z = dt & 8191, Q = dt >>> 13, ct = l[9] | 0, J = ct & 8191, X = ct >>> 13, ft = c[0] | 0, Y = ft & 8191, ee = ft >>> 13, Tt = c[1] | 0, te = Tt & 8191, ne = Tt >>> 13, bt = c[2] | 0, ae = bt & 8191, ie = bt >>> 13, ht = c[3] | 0, se = ht & 8191, re = ht >>> 13, gt = c[4] | 0, pe = gt & 8191, ue = gt >>> 13, Mt = c[5] | 0, ye = Mt & 8191, oe = Mt >>> 13, wt = c[6] | 0, le = wt & 8191, me = wt >>> 13, _t = c[7] | 0, de = _t & 8191, ce = _t >>> 13, kt = c[8] | 0, fe = kt & 8191, Te = kt >>> 13, vt = c[9] | 0, be = vt & 8191, he = vt >>> 13;
      y.negative = a.negative ^ r.negative, y.length = 19, o = Math.imul(p, Y), s = Math.imul(p, ee), s = s + Math.imul(g, Y) | 0, d = Math.imul(g, ee);
      var Ye = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (Ye >>> 26) | 0, Ye &= 67108863, o = Math.imul(w, Y), s = Math.imul(w, ee), s = s + Math.imul(k, Y) | 0, d = Math.imul(k, ee), o = o + Math.imul(p, te) | 0, s = s + Math.imul(p, ne) | 0, s = s + Math.imul(g, te) | 0, d = d + Math.imul(g, ne) | 0;
      var et = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (et >>> 26) | 0, et &= 67108863, o = Math.imul(A, Y), s = Math.imul(A, ee), s = s + Math.imul(x, Y) | 0, d = Math.imul(x, ee), o = o + Math.imul(w, te) | 0, s = s + Math.imul(w, ne) | 0, s = s + Math.imul(k, te) | 0, d = d + Math.imul(k, ne) | 0, o = o + Math.imul(p, ae) | 0, s = s + Math.imul(p, ie) | 0, s = s + Math.imul(g, ae) | 0, d = d + Math.imul(g, ie) | 0;
      var tt = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (tt >>> 26) | 0, tt &= 67108863, o = Math.imul(E, Y), s = Math.imul(E, ee), s = s + Math.imul(D, Y) | 0, d = Math.imul(D, ee), o = o + Math.imul(A, te) | 0, s = s + Math.imul(A, ne) | 0, s = s + Math.imul(x, te) | 0, d = d + Math.imul(x, ne) | 0, o = o + Math.imul(w, ae) | 0, s = s + Math.imul(w, ie) | 0, s = s + Math.imul(k, ae) | 0, d = d + Math.imul(k, ie) | 0, o = o + Math.imul(p, se) | 0, s = s + Math.imul(p, re) | 0, s = s + Math.imul(g, se) | 0, d = d + Math.imul(g, re) | 0;
      var nt = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (nt >>> 26) | 0, nt &= 67108863, o = Math.imul(q, Y), s = Math.imul(q, ee), s = s + Math.imul(z, Y) | 0, d = Math.imul(z, ee), o = o + Math.imul(E, te) | 0, s = s + Math.imul(E, ne) | 0, s = s + Math.imul(D, te) | 0, d = d + Math.imul(D, ne) | 0, o = o + Math.imul(A, ae) | 0, s = s + Math.imul(A, ie) | 0, s = s + Math.imul(x, ae) | 0, d = d + Math.imul(x, ie) | 0, o = o + Math.imul(w, se) | 0, s = s + Math.imul(w, re) | 0, s = s + Math.imul(k, se) | 0, d = d + Math.imul(k, re) | 0, o = o + Math.imul(p, pe) | 0, s = s + Math.imul(p, ue) | 0, s = s + Math.imul(g, pe) | 0, d = d + Math.imul(g, ue) | 0;
      var at = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (at >>> 26) | 0, at &= 67108863, o = Math.imul(H, Y), s = Math.imul(H, ee), s = s + Math.imul(j, Y) | 0, d = Math.imul(j, ee), o = o + Math.imul(q, te) | 0, s = s + Math.imul(q, ne) | 0, s = s + Math.imul(z, te) | 0, d = d + Math.imul(z, ne) | 0, o = o + Math.imul(E, ae) | 0, s = s + Math.imul(E, ie) | 0, s = s + Math.imul(D, ae) | 0, d = d + Math.imul(D, ie) | 0, o = o + Math.imul(A, se) | 0, s = s + Math.imul(A, re) | 0, s = s + Math.imul(x, se) | 0, d = d + Math.imul(x, re) | 0, o = o + Math.imul(w, pe) | 0, s = s + Math.imul(w, ue) | 0, s = s + Math.imul(k, pe) | 0, d = d + Math.imul(k, ue) | 0, o = o + Math.imul(p, ye) | 0, s = s + Math.imul(p, oe) | 0, s = s + Math.imul(g, ye) | 0, d = d + Math.imul(g, oe) | 0;
      var rn = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (rn >>> 26) | 0, rn &= 67108863, o = Math.imul(W, Y), s = Math.imul(W, ee), s = s + Math.imul(G, Y) | 0, d = Math.imul(G, ee), o = o + Math.imul(H, te) | 0, s = s + Math.imul(H, ne) | 0, s = s + Math.imul(j, te) | 0, d = d + Math.imul(j, ne) | 0, o = o + Math.imul(q, ae) | 0, s = s + Math.imul(q, ie) | 0, s = s + Math.imul(z, ae) | 0, d = d + Math.imul(z, ie) | 0, o = o + Math.imul(E, se) | 0, s = s + Math.imul(E, re) | 0, s = s + Math.imul(D, se) | 0, d = d + Math.imul(D, re) | 0, o = o + Math.imul(A, pe) | 0, s = s + Math.imul(A, ue) | 0, s = s + Math.imul(x, pe) | 0, d = d + Math.imul(x, ue) | 0, o = o + Math.imul(w, ye) | 0, s = s + Math.imul(w, oe) | 0, s = s + Math.imul(k, ye) | 0, d = d + Math.imul(k, oe) | 0, o = o + Math.imul(p, le) | 0, s = s + Math.imul(p, me) | 0, s = s + Math.imul(g, le) | 0, d = d + Math.imul(g, me) | 0;
      var pn = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (pn >>> 26) | 0, pn &= 67108863, o = Math.imul($, Y), s = Math.imul($, ee), s = s + Math.imul(K, Y) | 0, d = Math.imul(K, ee), o = o + Math.imul(W, te) | 0, s = s + Math.imul(W, ne) | 0, s = s + Math.imul(G, te) | 0, d = d + Math.imul(G, ne) | 0, o = o + Math.imul(H, ae) | 0, s = s + Math.imul(H, ie) | 0, s = s + Math.imul(j, ae) | 0, d = d + Math.imul(j, ie) | 0, o = o + Math.imul(q, se) | 0, s = s + Math.imul(q, re) | 0, s = s + Math.imul(z, se) | 0, d = d + Math.imul(z, re) | 0, o = o + Math.imul(E, pe) | 0, s = s + Math.imul(E, ue) | 0, s = s + Math.imul(D, pe) | 0, d = d + Math.imul(D, ue) | 0, o = o + Math.imul(A, ye) | 0, s = s + Math.imul(A, oe) | 0, s = s + Math.imul(x, ye) | 0, d = d + Math.imul(x, oe) | 0, o = o + Math.imul(w, le) | 0, s = s + Math.imul(w, me) | 0, s = s + Math.imul(k, le) | 0, d = d + Math.imul(k, me) | 0, o = o + Math.imul(p, de) | 0, s = s + Math.imul(p, ce) | 0, s = s + Math.imul(g, de) | 0, d = d + Math.imul(g, ce) | 0;
      var un = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (un >>> 26) | 0, un &= 67108863, o = Math.imul(Z, Y), s = Math.imul(Z, ee), s = s + Math.imul(Q, Y) | 0, d = Math.imul(Q, ee), o = o + Math.imul($, te) | 0, s = s + Math.imul($, ne) | 0, s = s + Math.imul(K, te) | 0, d = d + Math.imul(K, ne) | 0, o = o + Math.imul(W, ae) | 0, s = s + Math.imul(W, ie) | 0, s = s + Math.imul(G, ae) | 0, d = d + Math.imul(G, ie) | 0, o = o + Math.imul(H, se) | 0, s = s + Math.imul(H, re) | 0, s = s + Math.imul(j, se) | 0, d = d + Math.imul(j, re) | 0, o = o + Math.imul(q, pe) | 0, s = s + Math.imul(q, ue) | 0, s = s + Math.imul(z, pe) | 0, d = d + Math.imul(z, ue) | 0, o = o + Math.imul(E, ye) | 0, s = s + Math.imul(E, oe) | 0, s = s + Math.imul(D, ye) | 0, d = d + Math.imul(D, oe) | 0, o = o + Math.imul(A, le) | 0, s = s + Math.imul(A, me) | 0, s = s + Math.imul(x, le) | 0, d = d + Math.imul(x, me) | 0, o = o + Math.imul(w, de) | 0, s = s + Math.imul(w, ce) | 0, s = s + Math.imul(k, de) | 0, d = d + Math.imul(k, ce) | 0, o = o + Math.imul(p, fe) | 0, s = s + Math.imul(p, Te) | 0, s = s + Math.imul(g, fe) | 0, d = d + Math.imul(g, Te) | 0;
      var yn = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (yn >>> 26) | 0, yn &= 67108863, o = Math.imul(J, Y), s = Math.imul(J, ee), s = s + Math.imul(X, Y) | 0, d = Math.imul(X, ee), o = o + Math.imul(Z, te) | 0, s = s + Math.imul(Z, ne) | 0, s = s + Math.imul(Q, te) | 0, d = d + Math.imul(Q, ne) | 0, o = o + Math.imul($, ae) | 0, s = s + Math.imul($, ie) | 0, s = s + Math.imul(K, ae) | 0, d = d + Math.imul(K, ie) | 0, o = o + Math.imul(W, se) | 0, s = s + Math.imul(W, re) | 0, s = s + Math.imul(G, se) | 0, d = d + Math.imul(G, re) | 0, o = o + Math.imul(H, pe) | 0, s = s + Math.imul(H, ue) | 0, s = s + Math.imul(j, pe) | 0, d = d + Math.imul(j, ue) | 0, o = o + Math.imul(q, ye) | 0, s = s + Math.imul(q, oe) | 0, s = s + Math.imul(z, ye) | 0, d = d + Math.imul(z, oe) | 0, o = o + Math.imul(E, le) | 0, s = s + Math.imul(E, me) | 0, s = s + Math.imul(D, le) | 0, d = d + Math.imul(D, me) | 0, o = o + Math.imul(A, de) | 0, s = s + Math.imul(A, ce) | 0, s = s + Math.imul(x, de) | 0, d = d + Math.imul(x, ce) | 0, o = o + Math.imul(w, fe) | 0, s = s + Math.imul(w, Te) | 0, s = s + Math.imul(k, fe) | 0, d = d + Math.imul(k, Te) | 0, o = o + Math.imul(p, be) | 0, s = s + Math.imul(p, he) | 0, s = s + Math.imul(g, be) | 0, d = d + Math.imul(g, he) | 0;
      var on = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (on >>> 26) | 0, on &= 67108863, o = Math.imul(J, te), s = Math.imul(J, ne), s = s + Math.imul(X, te) | 0, d = Math.imul(X, ne), o = o + Math.imul(Z, ae) | 0, s = s + Math.imul(Z, ie) | 0, s = s + Math.imul(Q, ae) | 0, d = d + Math.imul(Q, ie) | 0, o = o + Math.imul($, se) | 0, s = s + Math.imul($, re) | 0, s = s + Math.imul(K, se) | 0, d = d + Math.imul(K, re) | 0, o = o + Math.imul(W, pe) | 0, s = s + Math.imul(W, ue) | 0, s = s + Math.imul(G, pe) | 0, d = d + Math.imul(G, ue) | 0, o = o + Math.imul(H, ye) | 0, s = s + Math.imul(H, oe) | 0, s = s + Math.imul(j, ye) | 0, d = d + Math.imul(j, oe) | 0, o = o + Math.imul(q, le) | 0, s = s + Math.imul(q, me) | 0, s = s + Math.imul(z, le) | 0, d = d + Math.imul(z, me) | 0, o = o + Math.imul(E, de) | 0, s = s + Math.imul(E, ce) | 0, s = s + Math.imul(D, de) | 0, d = d + Math.imul(D, ce) | 0, o = o + Math.imul(A, fe) | 0, s = s + Math.imul(A, Te) | 0, s = s + Math.imul(x, fe) | 0, d = d + Math.imul(x, Te) | 0, o = o + Math.imul(w, be) | 0, s = s + Math.imul(w, he) | 0, s = s + Math.imul(k, be) | 0, d = d + Math.imul(k, he) | 0;
      var ln = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (ln >>> 26) | 0, ln &= 67108863, o = Math.imul(J, ae), s = Math.imul(J, ie), s = s + Math.imul(X, ae) | 0, d = Math.imul(X, ie), o = o + Math.imul(Z, se) | 0, s = s + Math.imul(Z, re) | 0, s = s + Math.imul(Q, se) | 0, d = d + Math.imul(Q, re) | 0, o = o + Math.imul($, pe) | 0, s = s + Math.imul($, ue) | 0, s = s + Math.imul(K, pe) | 0, d = d + Math.imul(K, ue) | 0, o = o + Math.imul(W, ye) | 0, s = s + Math.imul(W, oe) | 0, s = s + Math.imul(G, ye) | 0, d = d + Math.imul(G, oe) | 0, o = o + Math.imul(H, le) | 0, s = s + Math.imul(H, me) | 0, s = s + Math.imul(j, le) | 0, d = d + Math.imul(j, me) | 0, o = o + Math.imul(q, de) | 0, s = s + Math.imul(q, ce) | 0, s = s + Math.imul(z, de) | 0, d = d + Math.imul(z, ce) | 0, o = o + Math.imul(E, fe) | 0, s = s + Math.imul(E, Te) | 0, s = s + Math.imul(D, fe) | 0, d = d + Math.imul(D, Te) | 0, o = o + Math.imul(A, be) | 0, s = s + Math.imul(A, he) | 0, s = s + Math.imul(x, be) | 0, d = d + Math.imul(x, he) | 0;
      var mn = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (mn >>> 26) | 0, mn &= 67108863, o = Math.imul(J, se), s = Math.imul(J, re), s = s + Math.imul(X, se) | 0, d = Math.imul(X, re), o = o + Math.imul(Z, pe) | 0, s = s + Math.imul(Z, ue) | 0, s = s + Math.imul(Q, pe) | 0, d = d + Math.imul(Q, ue) | 0, o = o + Math.imul($, ye) | 0, s = s + Math.imul($, oe) | 0, s = s + Math.imul(K, ye) | 0, d = d + Math.imul(K, oe) | 0, o = o + Math.imul(W, le) | 0, s = s + Math.imul(W, me) | 0, s = s + Math.imul(G, le) | 0, d = d + Math.imul(G, me) | 0, o = o + Math.imul(H, de) | 0, s = s + Math.imul(H, ce) | 0, s = s + Math.imul(j, de) | 0, d = d + Math.imul(j, ce) | 0, o = o + Math.imul(q, fe) | 0, s = s + Math.imul(q, Te) | 0, s = s + Math.imul(z, fe) | 0, d = d + Math.imul(z, Te) | 0, o = o + Math.imul(E, be) | 0, s = s + Math.imul(E, he) | 0, s = s + Math.imul(D, be) | 0, d = d + Math.imul(D, he) | 0;
      var dn = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (dn >>> 26) | 0, dn &= 67108863, o = Math.imul(J, pe), s = Math.imul(J, ue), s = s + Math.imul(X, pe) | 0, d = Math.imul(X, ue), o = o + Math.imul(Z, ye) | 0, s = s + Math.imul(Z, oe) | 0, s = s + Math.imul(Q, ye) | 0, d = d + Math.imul(Q, oe) | 0, o = o + Math.imul($, le) | 0, s = s + Math.imul($, me) | 0, s = s + Math.imul(K, le) | 0, d = d + Math.imul(K, me) | 0, o = o + Math.imul(W, de) | 0, s = s + Math.imul(W, ce) | 0, s = s + Math.imul(G, de) | 0, d = d + Math.imul(G, ce) | 0, o = o + Math.imul(H, fe) | 0, s = s + Math.imul(H, Te) | 0, s = s + Math.imul(j, fe) | 0, d = d + Math.imul(j, Te) | 0, o = o + Math.imul(q, be) | 0, s = s + Math.imul(q, he) | 0, s = s + Math.imul(z, be) | 0, d = d + Math.imul(z, he) | 0;
      var cn = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (cn >>> 26) | 0, cn &= 67108863, o = Math.imul(J, ye), s = Math.imul(J, oe), s = s + Math.imul(X, ye) | 0, d = Math.imul(X, oe), o = o + Math.imul(Z, le) | 0, s = s + Math.imul(Z, me) | 0, s = s + Math.imul(Q, le) | 0, d = d + Math.imul(Q, me) | 0, o = o + Math.imul($, de) | 0, s = s + Math.imul($, ce) | 0, s = s + Math.imul(K, de) | 0, d = d + Math.imul(K, ce) | 0, o = o + Math.imul(W, fe) | 0, s = s + Math.imul(W, Te) | 0, s = s + Math.imul(G, fe) | 0, d = d + Math.imul(G, Te) | 0, o = o + Math.imul(H, be) | 0, s = s + Math.imul(H, he) | 0, s = s + Math.imul(j, be) | 0, d = d + Math.imul(j, he) | 0;
      var fn = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (fn >>> 26) | 0, fn &= 67108863, o = Math.imul(J, le), s = Math.imul(J, me), s = s + Math.imul(X, le) | 0, d = Math.imul(X, me), o = o + Math.imul(Z, de) | 0, s = s + Math.imul(Z, ce) | 0, s = s + Math.imul(Q, de) | 0, d = d + Math.imul(Q, ce) | 0, o = o + Math.imul($, fe) | 0, s = s + Math.imul($, Te) | 0, s = s + Math.imul(K, fe) | 0, d = d + Math.imul(K, Te) | 0, o = o + Math.imul(W, be) | 0, s = s + Math.imul(W, he) | 0, s = s + Math.imul(G, be) | 0, d = d + Math.imul(G, he) | 0;
      var Tn = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (Tn >>> 26) | 0, Tn &= 67108863, o = Math.imul(J, de), s = Math.imul(J, ce), s = s + Math.imul(X, de) | 0, d = Math.imul(X, ce), o = o + Math.imul(Z, fe) | 0, s = s + Math.imul(Z, Te) | 0, s = s + Math.imul(Q, fe) | 0, d = d + Math.imul(Q, Te) | 0, o = o + Math.imul($, be) | 0, s = s + Math.imul($, he) | 0, s = s + Math.imul(K, be) | 0, d = d + Math.imul(K, he) | 0;
      var bn = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (bn >>> 26) | 0, bn &= 67108863, o = Math.imul(J, fe), s = Math.imul(J, Te), s = s + Math.imul(X, fe) | 0, d = Math.imul(X, Te), o = o + Math.imul(Z, be) | 0, s = s + Math.imul(Z, he) | 0, s = s + Math.imul(Q, be) | 0, d = d + Math.imul(Q, he) | 0;
      var hn = (h + o | 0) + ((s & 8191) << 13) | 0;
      h = (d + (s >>> 13) | 0) + (hn >>> 26) | 0, hn &= 67108863, o = Math.imul(J, be), s = Math.imul(J, he), s = s + Math.imul(X, be) | 0, d = Math.imul(X, he);
      var gn = (h + o | 0) + ((s & 8191) << 13) | 0;
      return h = (d + (s >>> 13) | 0) + (gn >>> 26) | 0, gn &= 67108863, b[0] = Ye, b[1] = et, b[2] = tt, b[3] = nt, b[4] = at, b[5] = rn, b[6] = pn, b[7] = un, b[8] = yn, b[9] = on, b[10] = ln, b[11] = mn, b[12] = dn, b[13] = cn, b[14] = fn, b[15] = Tn, b[16] = bn, b[17] = hn, b[18] = gn, h !== 0 && (b[19] = h, y.length++), y;
    };
    Math.imul || (De = ze);
    function Xe(T, a, r) {
      r.negative = a.negative ^ T.negative, r.length = T.length + a.length;
      for (var y = 0, l = 0, c = 0; c < r.length - 1; c++) {
        var b = l;
        l = 0;
        for (var h = y & 67108863, o = Math.min(c, a.length - 1), s = Math.max(0, c - T.length + 1); s <= o; s++) {
          var d = c - s, O = T.words[d] | 0, p = a.words[s] | 0, g = O * p, M = g & 67108863;
          b = b + (g / 67108864 | 0) | 0, M = M + h | 0, h = M & 67108863, b = b + (M >>> 26) | 0, l += b >>> 26, b &= 67108863;
        }
        r.words[c] = h, y = b, b = l;
      }
      return y !== 0 ? r.words[c] = y : r.length--, r._strip();
    }
    function Dt(T, a, r) {
      return Xe(T, a, r);
    }
    u.prototype.mulTo = function(a, r) {
      var y, l = this.length + a.length;
      return this.length === 10 && a.length === 10 ? y = De(this, a, r) : l < 63 ? y = ze(this, a, r) : l < 1024 ? y = Xe(this, a, r) : y = Dt(this, a, r), y;
    }, u.prototype.mul = function(a) {
      var r = new u(null);
      return r.words = new Array(this.length + a.length), this.mulTo(a, r);
    }, u.prototype.mulf = function(a) {
      var r = new u(null);
      return r.words = new Array(this.length + a.length), Dt(this, a, r);
    }, u.prototype.imul = function(a) {
      return this.clone().mulTo(a, this);
    }, u.prototype.imuln = function(a) {
      var r = a < 0;
      r && (a = -a), n(typeof a == "number"), n(a < 67108864);
      for (var y = 0, l = 0; l < this.length; l++) {
        var c = (this.words[l] | 0) * a, b = (c & 67108863) + (y & 67108863);
        y >>= 26, y += c / 67108864 | 0, y += b >>> 26, this.words[l] = b & 67108863;
      }
      return y !== 0 && (this.words[l] = y, this.length++), r ? this.ineg() : this;
    }, u.prototype.muln = function(a) {
      return this.clone().imuln(a);
    }, u.prototype.sqr = function() {
      return this.mul(this);
    }, u.prototype.isqr = function() {
      return this.imul(this.clone());
    }, u.prototype.pow = function(a) {
      var r = rt(a);
      if (r.length === 0)
        return new u(1);
      for (var y = this, l = 0; l < r.length && r[l] === 0; l++, y = y.sqr())
        ;
      if (++l < r.length)
        for (var c = y.sqr(); l < r.length; l++, c = c.sqr())
          r[l] !== 0 && (y = y.mul(c));
      return y;
    }, u.prototype.iushln = function(a) {
      n(typeof a == "number" && a >= 0);
      var r = a % 26, y = (a - r) / 26, l = 67108863 >>> 26 - r << 26 - r, c;
      if (r !== 0) {
        var b = 0;
        for (c = 0; c < this.length; c++) {
          var h = this.words[c] & l, o = (this.words[c] | 0) - h << r;
          this.words[c] = o | b, b = h >>> 26 - r;
        }
        b && (this.words[c] = b, this.length++);
      }
      if (y !== 0) {
        for (c = this.length - 1; c >= 0; c--)
          this.words[c + y] = this.words[c];
        for (c = 0; c < y; c++)
          this.words[c] = 0;
        this.length += y;
      }
      return this._strip();
    }, u.prototype.ishln = function(a) {
      return n(this.negative === 0), this.iushln(a);
    }, u.prototype.iushrn = function(a, r, y) {
      n(typeof a == "number" && a >= 0);
      var l;
      r ? l = (r - r % 26) / 26 : l = 0;
      var c = a % 26, b = Math.min((a - c) / 26, this.length), h = 67108863 ^ 67108863 >>> c << c, o = y;
      if (l -= b, l = Math.max(0, l), o) {
        for (var s = 0; s < b; s++)
          o.words[s] = this.words[s];
        o.length = b;
      }
      if (b !== 0)
        if (this.length > b)
          for (this.length -= b, s = 0; s < this.length; s++)
            this.words[s] = this.words[s + b];
        else
          this.words[0] = 0, this.length = 1;
      var d = 0;
      for (s = this.length - 1; s >= 0 && (d !== 0 || s >= l); s--) {
        var O = this.words[s] | 0;
        this.words[s] = d << 26 - c | O >>> c, d = O & h;
      }
      return o && d !== 0 && (o.words[o.length++] = d), this.length === 0 && (this.words[0] = 0, this.length = 1), this._strip();
    }, u.prototype.ishrn = function(a, r, y) {
      return n(this.negative === 0), this.iushrn(a, r, y);
    }, u.prototype.shln = function(a) {
      return this.clone().ishln(a);
    }, u.prototype.ushln = function(a) {
      return this.clone().iushln(a);
    }, u.prototype.shrn = function(a) {
      return this.clone().ishrn(a);
    }, u.prototype.ushrn = function(a) {
      return this.clone().iushrn(a);
    }, u.prototype.testn = function(a) {
      n(typeof a == "number" && a >= 0);
      var r = a % 26, y = (a - r) / 26, l = 1 << r;
      if (this.length <= y)
        return !1;
      var c = this.words[y];
      return !!(c & l);
    }, u.prototype.imaskn = function(a) {
      n(typeof a == "number" && a >= 0);
      var r = a % 26, y = (a - r) / 26;
      if (n(this.negative === 0, "imaskn works only with positive numbers"), this.length <= y)
        return this;
      if (r !== 0 && y++, this.length = Math.min(y, this.length), r !== 0) {
        var l = 67108863 ^ 67108863 >>> r << r;
        this.words[this.length - 1] &= l;
      }
      return this._strip();
    }, u.prototype.maskn = function(a) {
      return this.clone().imaskn(a);
    }, u.prototype.iaddn = function(a) {
      return n(typeof a == "number"), n(a < 67108864), a < 0 ? this.isubn(-a) : this.negative !== 0 ? this.length === 1 && (this.words[0] | 0) <= a ? (this.words[0] = a - (this.words[0] | 0), this.negative = 0, this) : (this.negative = 0, this.isubn(a), this.negative = 1, this) : this._iaddn(a);
    }, u.prototype._iaddn = function(a) {
      this.words[0] += a;
      for (var r = 0; r < this.length && this.words[r] >= 67108864; r++)
        this.words[r] -= 67108864, r === this.length - 1 ? this.words[r + 1] = 1 : this.words[r + 1]++;
      return this.length = Math.max(this.length, r + 1), this;
    }, u.prototype.isubn = function(a) {
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
    }, u.prototype.addn = function(a) {
      return this.clone().iaddn(a);
    }, u.prototype.subn = function(a) {
      return this.clone().isubn(a);
    }, u.prototype.iabs = function() {
      return this.negative = 0, this;
    }, u.prototype.abs = function() {
      return this.clone().iabs();
    }, u.prototype._ishlnsubmul = function(a, r, y) {
      var l = a.length + y, c;
      this._expand(l);
      var b, h = 0;
      for (c = 0; c < a.length; c++) {
        b = (this.words[c + y] | 0) + h;
        var o = (a.words[c] | 0) * r;
        b -= o & 67108863, h = (b >> 26) - (o / 67108864 | 0), this.words[c + y] = b & 67108863;
      }
      for (; c < this.length - y; c++)
        b = (this.words[c + y] | 0) + h, h = b >> 26, this.words[c + y] = b & 67108863;
      if (h === 0)
        return this._strip();
      for (n(h === -1), h = 0, c = 0; c < this.length; c++)
        b = -(this.words[c] | 0) + h, h = b >> 26, this.words[c] = b & 67108863;
      return this.negative = 1, this._strip();
    }, u.prototype._wordDiv = function(a, r) {
      var y = this.length - a.length, l = this.clone(), c = a, b = c.words[c.length - 1] | 0, h = this._countBits(b);
      y = 26 - h, y !== 0 && (c = c.ushln(y), l.iushln(y), b = c.words[c.length - 1] | 0);
      var o = l.length - c.length, s;
      if (r !== "mod") {
        s = new u(null), s.length = o + 1, s.words = new Array(s.length);
        for (var d = 0; d < s.length; d++)
          s.words[d] = 0;
      }
      var O = l.clone()._ishlnsubmul(c, 1, o);
      O.negative === 0 && (l = O, s && (s.words[o] = 1));
      for (var p = o - 1; p >= 0; p--) {
        var g = (l.words[c.length + p] | 0) * 67108864 + (l.words[c.length + p - 1] | 0);
        for (g = Math.min(g / b | 0, 67108863), l._ishlnsubmul(c, g, p); l.negative !== 0; )
          g--, l.negative = 0, l._ishlnsubmul(c, 1, p), l.isZero() || (l.negative ^= 1);
        s && (s.words[p] = g);
      }
      return s && s._strip(), l._strip(), r !== "div" && y !== 0 && l.iushrn(y), {
        div: s || null,
        mod: l
      };
    }, u.prototype.divmod = function(a, r, y) {
      if (n(!a.isZero()), this.isZero())
        return {
          div: new u(0),
          mod: new u(0)
        };
      var l, c, b;
      return this.negative !== 0 && a.negative === 0 ? (b = this.neg().divmod(a, r), r !== "mod" && (l = b.div.neg()), r !== "div" && (c = b.mod.neg(), y && c.negative !== 0 && c.iadd(a)), {
        div: l,
        mod: c
      }) : this.negative === 0 && a.negative !== 0 ? (b = this.divmod(a.neg(), r), r !== "mod" && (l = b.div.neg()), {
        div: l,
        mod: b.mod
      }) : this.negative & a.negative ? (b = this.neg().divmod(a.neg(), r), r !== "div" && (c = b.mod.neg(), y && c.negative !== 0 && c.isub(a)), {
        div: b.div,
        mod: c
      }) : a.length > this.length || this.cmp(a) < 0 ? {
        div: new u(0),
        mod: this
      } : a.length === 1 ? r === "div" ? {
        div: this.divn(a.words[0]),
        mod: null
      } : r === "mod" ? {
        div: null,
        mod: new u(this.modrn(a.words[0]))
      } : {
        div: this.divn(a.words[0]),
        mod: new u(this.modrn(a.words[0]))
      } : this._wordDiv(a, r);
    }, u.prototype.div = function(a) {
      return this.divmod(a, "div", !1).div;
    }, u.prototype.mod = function(a) {
      return this.divmod(a, "mod", !1).mod;
    }, u.prototype.umod = function(a) {
      return this.divmod(a, "mod", !0).mod;
    }, u.prototype.divRound = function(a) {
      var r = this.divmod(a);
      if (r.mod.isZero())
        return r.div;
      var y = r.div.negative !== 0 ? r.mod.isub(a) : r.mod, l = a.ushrn(1), c = a.andln(1), b = y.cmp(l);
      return b < 0 || c === 1 && b === 0 ? r.div : r.div.negative !== 0 ? r.div.isubn(1) : r.div.iaddn(1);
    }, u.prototype.modrn = function(a) {
      var r = a < 0;
      r && (a = -a), n(a <= 67108863);
      for (var y = (1 << 26) % a, l = 0, c = this.length - 1; c >= 0; c--)
        l = (y * l + (this.words[c] | 0)) % a;
      return r ? -l : l;
    }, u.prototype.modn = function(a) {
      return this.modrn(a);
    }, u.prototype.idivn = function(a) {
      var r = a < 0;
      r && (a = -a), n(a <= 67108863);
      for (var y = 0, l = this.length - 1; l >= 0; l--) {
        var c = (this.words[l] | 0) + y * 67108864;
        this.words[l] = c / a | 0, y = c % a;
      }
      return this._strip(), r ? this.ineg() : this;
    }, u.prototype.divn = function(a) {
      return this.clone().idivn(a);
    }, u.prototype.egcd = function(a) {
      n(a.negative === 0), n(!a.isZero());
      var r = this, y = a.clone();
      r.negative !== 0 ? r = r.umod(a) : r = r.clone();
      for (var l = new u(1), c = new u(0), b = new u(0), h = new u(1), o = 0; r.isEven() && y.isEven(); )
        r.iushrn(1), y.iushrn(1), ++o;
      for (var s = y.clone(), d = r.clone(); !r.isZero(); ) {
        for (var O = 0, p = 1; !(r.words[0] & p) && O < 26; ++O, p <<= 1)
          ;
        if (O > 0)
          for (r.iushrn(O); O-- > 0; )
            (l.isOdd() || c.isOdd()) && (l.iadd(s), c.isub(d)), l.iushrn(1), c.iushrn(1);
        for (var g = 0, M = 1; !(y.words[0] & M) && g < 26; ++g, M <<= 1)
          ;
        if (g > 0)
          for (y.iushrn(g); g-- > 0; )
            (b.isOdd() || h.isOdd()) && (b.iadd(s), h.isub(d)), b.iushrn(1), h.iushrn(1);
        r.cmp(y) >= 0 ? (r.isub(y), l.isub(b), c.isub(h)) : (y.isub(r), b.isub(l), h.isub(c));
      }
      return {
        a: b,
        b: h,
        gcd: y.iushln(o)
      };
    }, u.prototype._invmp = function(a) {
      n(a.negative === 0), n(!a.isZero());
      var r = this, y = a.clone();
      r.negative !== 0 ? r = r.umod(a) : r = r.clone();
      for (var l = new u(1), c = new u(0), b = y.clone(); r.cmpn(1) > 0 && y.cmpn(1) > 0; ) {
        for (var h = 0, o = 1; !(r.words[0] & o) && h < 26; ++h, o <<= 1)
          ;
        if (h > 0)
          for (r.iushrn(h); h-- > 0; )
            l.isOdd() && l.iadd(b), l.iushrn(1);
        for (var s = 0, d = 1; !(y.words[0] & d) && s < 26; ++s, d <<= 1)
          ;
        if (s > 0)
          for (y.iushrn(s); s-- > 0; )
            c.isOdd() && c.iadd(b), c.iushrn(1);
        r.cmp(y) >= 0 ? (r.isub(y), l.isub(c)) : (y.isub(r), c.isub(l));
      }
      var O;
      return r.cmpn(1) === 0 ? O = l : O = c, O.cmpn(0) < 0 && O.iadd(a), O;
    }, u.prototype.gcd = function(a) {
      if (this.isZero())
        return a.abs();
      if (a.isZero())
        return this.abs();
      var r = this.clone(), y = a.clone();
      r.negative = 0, y.negative = 0;
      for (var l = 0; r.isEven() && y.isEven(); l++)
        r.iushrn(1), y.iushrn(1);
      do {
        for (; r.isEven(); )
          r.iushrn(1);
        for (; y.isEven(); )
          y.iushrn(1);
        var c = r.cmp(y);
        if (c < 0) {
          var b = r;
          r = y, y = b;
        } else if (c === 0 || y.cmpn(1) === 0)
          break;
        r.isub(y);
      } while (!0);
      return y.iushln(l);
    }, u.prototype.invm = function(a) {
      return this.egcd(a).a.umod(a);
    }, u.prototype.isEven = function() {
      return (this.words[0] & 1) === 0;
    }, u.prototype.isOdd = function() {
      return (this.words[0] & 1) === 1;
    }, u.prototype.andln = function(a) {
      return this.words[0] & a;
    }, u.prototype.bincn = function(a) {
      n(typeof a == "number");
      var r = a % 26, y = (a - r) / 26, l = 1 << r;
      if (this.length <= y)
        return this._expand(y + 1), this.words[y] |= l, this;
      for (var c = l, b = y; c !== 0 && b < this.length; b++) {
        var h = this.words[b] | 0;
        h += c, c = h >>> 26, h &= 67108863, this.words[b] = h;
      }
      return c !== 0 && (this.words[b] = c, this.length++), this;
    }, u.prototype.isZero = function() {
      return this.length === 1 && this.words[0] === 0;
    }, u.prototype.cmpn = function(a) {
      var r = a < 0;
      if (this.negative !== 0 && !r)
        return -1;
      if (this.negative === 0 && r)
        return 1;
      this._strip();
      var y;
      if (this.length > 1)
        y = 1;
      else {
        r && (a = -a), n(a <= 67108863, "Number is too big");
        var l = this.words[0] | 0;
        y = l === a ? 0 : l < a ? -1 : 1;
      }
      return this.negative !== 0 ? -y | 0 : y;
    }, u.prototype.cmp = function(a) {
      if (this.negative !== 0 && a.negative === 0)
        return -1;
      if (this.negative === 0 && a.negative !== 0)
        return 1;
      var r = this.ucmp(a);
      return this.negative !== 0 ? -r | 0 : r;
    }, u.prototype.ucmp = function(a) {
      if (this.length > a.length)
        return 1;
      if (this.length < a.length)
        return -1;
      for (var r = 0, y = this.length - 1; y >= 0; y--) {
        var l = this.words[y] | 0, c = a.words[y] | 0;
        if (l !== c) {
          l < c ? r = -1 : l > c && (r = 1);
          break;
        }
      }
      return r;
    }, u.prototype.gtn = function(a) {
      return this.cmpn(a) === 1;
    }, u.prototype.gt = function(a) {
      return this.cmp(a) === 1;
    }, u.prototype.gten = function(a) {
      return this.cmpn(a) >= 0;
    }, u.prototype.gte = function(a) {
      return this.cmp(a) >= 0;
    }, u.prototype.ltn = function(a) {
      return this.cmpn(a) === -1;
    }, u.prototype.lt = function(a) {
      return this.cmp(a) === -1;
    }, u.prototype.lten = function(a) {
      return this.cmpn(a) <= 0;
    }, u.prototype.lte = function(a) {
      return this.cmp(a) <= 0;
    }, u.prototype.eqn = function(a) {
      return this.cmpn(a) === 0;
    }, u.prototype.eq = function(a) {
      return this.cmp(a) === 0;
    }, u.red = function(a) {
      return new Me(a);
    }, u.prototype.toRed = function(a) {
      return n(!this.red, "Already a number in reduction context"), n(this.negative === 0, "red works only with positives"), a.convertTo(this)._forceRed(a);
    }, u.prototype.fromRed = function() {
      return n(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this);
    }, u.prototype._forceRed = function(a) {
      return this.red = a, this;
    }, u.prototype.forceRed = function(a) {
      return n(!this.red, "Already a number in reduction context"), this._forceRed(a);
    }, u.prototype.redAdd = function(a) {
      return n(this.red, "redAdd works only with red numbers"), this.red.add(this, a);
    }, u.prototype.redIAdd = function(a) {
      return n(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, a);
    }, u.prototype.redSub = function(a) {
      return n(this.red, "redSub works only with red numbers"), this.red.sub(this, a);
    }, u.prototype.redISub = function(a) {
      return n(this.red, "redISub works only with red numbers"), this.red.isub(this, a);
    }, u.prototype.redShl = function(a) {
      return n(this.red, "redShl works only with red numbers"), this.red.shl(this, a);
    }, u.prototype.redMul = function(a) {
      return n(this.red, "redMul works only with red numbers"), this.red._verify2(this, a), this.red.mul(this, a);
    }, u.prototype.redIMul = function(a) {
      return n(this.red, "redMul works only with red numbers"), this.red._verify2(this, a), this.red.imul(this, a);
    }, u.prototype.redSqr = function() {
      return n(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this);
    }, u.prototype.redISqr = function() {
      return n(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this);
    }, u.prototype.redSqrt = function() {
      return n(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this);
    }, u.prototype.redInvm = function() {
      return n(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this);
    }, u.prototype.redNeg = function() {
      return n(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this);
    }, u.prototype.redPow = function(a) {
      return n(this.red && !a.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, a);
    };
    var xt = {
      k256: null,
      p224: null,
      p192: null,
      p25519: null
    };
    function Ee(T, a) {
      this.name = T, this.p = new u(a, 16), this.n = this.p.bitLength(), this.k = new u(1).iushln(this.n).isub(this.p), this.tmp = this._tmp();
    }
    Ee.prototype._tmp = function() {
      var a = new u(null);
      return a.words = new Array(Math.ceil(this.n / 13)), a;
    }, Ee.prototype.ireduce = function(a) {
      var r = a, y;
      do
        this.split(r, this.tmp), r = this.imulK(r), r = r.iadd(this.tmp), y = r.bitLength();
      while (y > this.n);
      var l = y < this.n ? -1 : r.ucmp(this.p);
      return l === 0 ? (r.words[0] = 0, r.length = 1) : l > 0 ? r.isub(this.p) : r.strip !== void 0 ? r.strip() : r._strip(), r;
    }, Ee.prototype.split = function(a, r) {
      a.iushrn(this.n, 0, r);
    }, Ee.prototype.imulK = function(a) {
      return a.imul(this.k);
    };
    function pt() {
      Ee.call(
        this,
        "k256",
        "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
      );
    }
    m(pt, Ee), pt.prototype.split = function(a, r) {
      for (var y = 4194303, l = Math.min(a.length, 9), c = 0; c < l; c++)
        r.words[c] = a.words[c];
      if (r.length = l, a.length <= 9) {
        a.words[0] = 0, a.length = 1;
        return;
      }
      var b = a.words[9];
      for (r.words[r.length++] = b & y, c = 10; c < a.length; c++) {
        var h = a.words[c] | 0;
        a.words[c - 10] = (h & y) << 4 | b >>> 22, b = h;
      }
      b >>>= 22, a.words[c - 10] = b, b === 0 && a.length > 10 ? a.length -= 10 : a.length -= 9;
    }, pt.prototype.imulK = function(a) {
      a.words[a.length] = 0, a.words[a.length + 1] = 0, a.length += 2;
      for (var r = 0, y = 0; y < a.length; y++) {
        var l = a.words[y] | 0;
        r += l * 977, a.words[y] = r & 67108863, r = l * 64 + (r / 67108864 | 0);
      }
      return a.words[a.length - 1] === 0 && (a.length--, a.words[a.length - 1] === 0 && a.length--), a;
    };
    function ut() {
      Ee.call(
        this,
        "p224",
        "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
      );
    }
    m(ut, Ee);
    function Ft() {
      Ee.call(
        this,
        "p192",
        "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
      );
    }
    m(Ft, Ee);
    function Pt() {
      Ee.call(
        this,
        "25519",
        "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
      );
    }
    m(Pt, Ee), Pt.prototype.imulK = function(a) {
      for (var r = 0, y = 0; y < a.length; y++) {
        var l = (a.words[y] | 0) * 19 + r, c = l & 67108863;
        l >>>= 26, a.words[y] = c, r = l;
      }
      return r !== 0 && (a.words[a.length++] = r), a;
    }, u._prime = function(a) {
      if (xt[a])
        return xt[a];
      var r;
      if (a === "k256")
        r = new pt();
      else if (a === "p224")
        r = new ut();
      else if (a === "p192")
        r = new Ft();
      else if (a === "p25519")
        r = new Pt();
      else
        throw new Error("Unknown prime " + a);
      return xt[a] = r, r;
    };
    function Me(T) {
      if (typeof T == "string") {
        var a = u._prime(T);
        this.m = a.p, this.prime = a;
      } else
        n(T.gtn(1), "modulus must be greater than 1"), this.m = T, this.prime = null;
    }
    Me.prototype._verify1 = function(a) {
      n(a.negative === 0, "red works only with positives"), n(a.red, "red works only with red numbers");
    }, Me.prototype._verify2 = function(a, r) {
      n((a.negative | r.negative) === 0, "red works only with positives"), n(
        a.red && a.red === r.red,
        "red works only with red numbers"
      );
    }, Me.prototype.imod = function(a) {
      return this.prime ? this.prime.ireduce(a)._forceRed(this) : (S(a, a.umod(this.m)._forceRed(this)), a);
    }, Me.prototype.neg = function(a) {
      return a.isZero() ? a.clone() : this.m.sub(a)._forceRed(this);
    }, Me.prototype.add = function(a, r) {
      this._verify2(a, r);
      var y = a.add(r);
      return y.cmp(this.m) >= 0 && y.isub(this.m), y._forceRed(this);
    }, Me.prototype.iadd = function(a, r) {
      this._verify2(a, r);
      var y = a.iadd(r);
      return y.cmp(this.m) >= 0 && y.isub(this.m), y;
    }, Me.prototype.sub = function(a, r) {
      this._verify2(a, r);
      var y = a.sub(r);
      return y.cmpn(0) < 0 && y.iadd(this.m), y._forceRed(this);
    }, Me.prototype.isub = function(a, r) {
      this._verify2(a, r);
      var y = a.isub(r);
      return y.cmpn(0) < 0 && y.iadd(this.m), y;
    }, Me.prototype.shl = function(a, r) {
      return this._verify1(a), this.imod(a.ushln(r));
    }, Me.prototype.imul = function(a, r) {
      return this._verify2(a, r), this.imod(a.imul(r));
    }, Me.prototype.mul = function(a, r) {
      return this._verify2(a, r), this.imod(a.mul(r));
    }, Me.prototype.isqr = function(a) {
      return this.imul(a, a.clone());
    }, Me.prototype.sqr = function(a) {
      return this.mul(a, a);
    }, Me.prototype.sqrt = function(a) {
      if (a.isZero())
        return a.clone();
      var r = this.m.andln(3);
      if (n(r % 2 === 1), r === 3) {
        var y = this.m.add(new u(1)).iushrn(2);
        return this.pow(a, y);
      }
      for (var l = this.m.subn(1), c = 0; !l.isZero() && l.andln(1) === 0; )
        c++, l.iushrn(1);
      n(!l.isZero());
      var b = new u(1).toRed(this), h = b.redNeg(), o = this.m.subn(1).iushrn(1), s = this.m.bitLength();
      for (s = new u(2 * s * s).toRed(this); this.pow(s, o).cmp(h) !== 0; )
        s.redIAdd(h);
      for (var d = this.pow(s, l), O = this.pow(a, l.addn(1).iushrn(1)), p = this.pow(a, l), g = c; p.cmp(b) !== 0; ) {
        for (var M = p, w = 0; M.cmp(b) !== 0; w++)
          M = M.redSqr();
        n(w < g);
        var k = this.pow(d, new u(1).iushln(g - w - 1));
        O = O.redMul(k), d = k.redSqr(), p = p.redMul(d), g = w;
      }
      return O;
    }, Me.prototype.invm = function(a) {
      var r = a._invmp(this.m);
      return r.negative !== 0 ? (r.negative = 0, this.imod(r).redNeg()) : this.imod(r);
    }, Me.prototype.pow = function(a, r) {
      if (r.isZero())
        return new u(1).toRed(this);
      if (r.cmpn(1) === 0)
        return a.clone();
      var y = 4, l = new Array(1 << y);
      l[0] = new u(1).toRed(this), l[1] = a;
      for (var c = 2; c < l.length; c++)
        l[c] = this.mul(l[c - 1], a);
      var b = l[0], h = 0, o = 0, s = r.bitLength() % 26;
      for (s === 0 && (s = 26), c = r.length - 1; c >= 0; c--) {
        for (var d = r.words[c], O = s - 1; O >= 0; O--) {
          var p = d >> O & 1;
          if (b !== l[0] && (b = this.sqr(b)), p === 0 && h === 0) {
            o = 0;
            continue;
          }
          h <<= 1, h |= p, o++, !(o !== y && (c !== 0 || O !== 0)) && (b = this.mul(b, l[h]), o = 0, h = 0);
        }
        s = 26;
      }
      return b;
    }, Me.prototype.convertTo = function(a) {
      var r = a.umod(this.m);
      return r === a ? r.clone() : r;
    }, Me.prototype.convertFrom = function(a) {
      var r = a.clone();
      return r.red = null, r;
    }, u.mont = function(a) {
      return new He(a);
    };
    function He(T) {
      Me.call(this, T), this.shift = this.m.bitLength(), this.shift % 26 !== 0 && (this.shift += 26 - this.shift % 26), this.r = new u(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), this.minv = this.r.sub(this.minv);
    }
    m(He, Me), He.prototype.convertTo = function(a) {
      return this.imod(a.ushln(this.shift));
    }, He.prototype.convertFrom = function(a) {
      var r = this.imod(a.mul(this.rinv));
      return r.red = null, r;
    }, He.prototype.imul = function(a, r) {
      if (a.isZero() || r.isZero())
        return a.words[0] = 0, a.length = 1, a;
      var y = a.imul(r), l = y.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), c = y.isub(l).iushrn(this.shift), b = c;
      return c.cmp(this.m) >= 0 ? b = c.isub(this.m) : c.cmpn(0) < 0 && (b = c.iadd(this.m)), b._forceRed(this);
    }, He.prototype.mul = function(a, r) {
      if (a.isZero() || r.isZero())
        return new u(0)._forceRed(this);
      var y = a.mul(r), l = y.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), c = y.isub(l).iushrn(this.shift), b = c;
      return c.cmp(this.m) >= 0 ? b = c.isub(this.m) : c.cmpn(0) < 0 && (b = c.iadd(this.m)), b._forceRed(this);
    }, He.prototype.invm = function(a) {
      var r = this.imod(a._invmp(this.m).mul(this.r2));
      return r._forceRed(this);
    };
  })(i, ua);
})(Rn);
var Ga = Rn.exports;
const $a = /* @__PURE__ */ ya(Ga), Ka = "logger/5.7.0";
let zn = !1, Hn = !1;
const Xt = { debug: 1, default: 2, info: 2, warning: 3, error: 4, off: 5 };
let jn = Xt.default, kn = null;
function Za() {
  try {
    const i = [];
    if (["NFD", "NFC", "NFKD", "NFKC"].forEach((e) => {
      try {
        if ("test".normalize(e) !== "test")
          throw new Error("bad normalize");
      } catch {
        i.push(e);
      }
    }), i.length)
      throw new Error("missing " + i.join(", "));
    if (String.fromCharCode(233).normalize("NFD") !== String.fromCharCode(101, 769))
      throw new Error("broken implementation");
  } catch (i) {
    return i.message;
  }
  return null;
}
const Wn = Za();
var xn;
(function(i) {
  i.DEBUG = "DEBUG", i.INFO = "INFO", i.WARNING = "WARNING", i.ERROR = "ERROR", i.OFF = "OFF";
})(xn || (xn = {}));
var Fe;
(function(i) {
  i.UNKNOWN_ERROR = "UNKNOWN_ERROR", i.NOT_IMPLEMENTED = "NOT_IMPLEMENTED", i.UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION", i.NETWORK_ERROR = "NETWORK_ERROR", i.SERVER_ERROR = "SERVER_ERROR", i.TIMEOUT = "TIMEOUT", i.BUFFER_OVERRUN = "BUFFER_OVERRUN", i.NUMERIC_FAULT = "NUMERIC_FAULT", i.MISSING_NEW = "MISSING_NEW", i.INVALID_ARGUMENT = "INVALID_ARGUMENT", i.MISSING_ARGUMENT = "MISSING_ARGUMENT", i.UNEXPECTED_ARGUMENT = "UNEXPECTED_ARGUMENT", i.CALL_EXCEPTION = "CALL_EXCEPTION", i.INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS", i.NONCE_EXPIRED = "NONCE_EXPIRED", i.REPLACEMENT_UNDERPRICED = "REPLACEMENT_UNDERPRICED", i.UNPREDICTABLE_GAS_LIMIT = "UNPREDICTABLE_GAS_LIMIT", i.TRANSACTION_REPLACED = "TRANSACTION_REPLACED", i.ACTION_REJECTED = "ACTION_REJECTED";
})(Fe || (Fe = {}));
const Gn = "0123456789abcdef";
class R {
  constructor(e) {
    Object.defineProperty(this, "version", {
      enumerable: !0,
      value: e,
      writable: !1
    });
  }
  _log(e, t) {
    const n = e.toLowerCase();
    Xt[n] == null && this.throwArgumentError("invalid log level name", "logLevel", e), !(jn > Xt[n]) && console.log.apply(console, t);
  }
  debug(...e) {
    this._log(R.levels.DEBUG, e);
  }
  info(...e) {
    this._log(R.levels.INFO, e);
  }
  warn(...e) {
    this._log(R.levels.WARNING, e);
  }
  makeError(e, t, n) {
    if (Hn)
      return this.makeError("censored error", t, {});
    t || (t = R.errors.UNKNOWN_ERROR), n || (n = {});
    const m = [];
    Object.keys(n).forEach((v) => {
      const I = n[v];
      try {
        if (I instanceof Uint8Array) {
          let S = "";
          for (let N = 0; N < I.length; N++)
            S += Gn[I[N] >> 4], S += Gn[I[N] & 15];
          m.push(v + "=Uint8Array(0x" + S + ")");
        } else
          m.push(v + "=" + JSON.stringify(I));
      } catch {
        m.push(v + "=" + JSON.stringify(n[v].toString()));
      }
    }), m.push(`code=${t}`), m.push(`version=${this.version}`);
    const u = e;
    let f = "";
    switch (t) {
      case Fe.NUMERIC_FAULT: {
        f = "NUMERIC_FAULT";
        const v = e;
        switch (v) {
          case "overflow":
          case "underflow":
          case "division-by-zero":
            f += "-" + v;
            break;
          case "negative-power":
          case "negative-width":
            f += "-unsupported";
            break;
          case "unbound-bitwise-result":
            f += "-unbound-result";
            break;
        }
        break;
      }
      case Fe.CALL_EXCEPTION:
      case Fe.INSUFFICIENT_FUNDS:
      case Fe.MISSING_NEW:
      case Fe.NONCE_EXPIRED:
      case Fe.REPLACEMENT_UNDERPRICED:
      case Fe.TRANSACTION_REPLACED:
      case Fe.UNPREDICTABLE_GAS_LIMIT:
        f = t;
        break;
    }
    f && (e += " [ See: https://links.ethers.org/v5-errors-" + f + " ]"), m.length && (e += " (" + m.join(", ") + ")");
    const _ = new Error(e);
    return _.reason = u, _.code = t, Object.keys(n).forEach(function(v) {
      _[v] = n[v];
    }), _;
  }
  throwError(e, t, n) {
    throw this.makeError(e, t, n);
  }
  throwArgumentError(e, t, n) {
    return this.throwError(e, R.errors.INVALID_ARGUMENT, {
      argument: t,
      value: n
    });
  }
  assert(e, t, n, m) {
    e || this.throwError(t, n, m);
  }
  assertArgument(e, t, n, m) {
    e || this.throwArgumentError(t, n, m);
  }
  checkNormalize(e) {
    Wn && this.throwError("platform missing String.prototype.normalize", R.errors.UNSUPPORTED_OPERATION, {
      operation: "String.prototype.normalize",
      form: Wn
    });
  }
  checkSafeUint53(e, t) {
    typeof e == "number" && (t == null && (t = "value not safe"), (e < 0 || e >= 9007199254740991) && this.throwError(t, R.errors.NUMERIC_FAULT, {
      operation: "checkSafeInteger",
      fault: "out-of-safe-range",
      value: e
    }), e % 1 && this.throwError(t, R.errors.NUMERIC_FAULT, {
      operation: "checkSafeInteger",
      fault: "non-integer",
      value: e
    }));
  }
  checkArgumentCount(e, t, n) {
    n ? n = ": " + n : n = "", e < t && this.throwError("missing argument" + n, R.errors.MISSING_ARGUMENT, {
      count: e,
      expectedCount: t
    }), e > t && this.throwError("too many arguments" + n, R.errors.UNEXPECTED_ARGUMENT, {
      count: e,
      expectedCount: t
    });
  }
  checkNew(e, t) {
    (e === Object || e == null) && this.throwError("missing new", R.errors.MISSING_NEW, { name: t.name });
  }
  checkAbstract(e, t) {
    e === t ? this.throwError("cannot instantiate abstract class " + JSON.stringify(t.name) + " directly; use a sub-class", R.errors.UNSUPPORTED_OPERATION, { name: e.name, operation: "new" }) : (e === Object || e == null) && this.throwError("missing new", R.errors.MISSING_NEW, { name: t.name });
  }
  static globalLogger() {
    return kn || (kn = new R(Ka)), kn;
  }
  static setCensorship(e, t) {
    if (!e && t && this.globalLogger().throwError("cannot permanently disable censorship", R.errors.UNSUPPORTED_OPERATION, {
      operation: "setCensorship"
    }), zn) {
      if (!e)
        return;
      this.globalLogger().throwError("error censorship permanent", R.errors.UNSUPPORTED_OPERATION, {
        operation: "setCensorship"
      });
    }
    Hn = !!e, zn = !!t;
  }
  static setLogLevel(e) {
    const t = Xt[e.toLowerCase()];
    if (t == null) {
      R.globalLogger().warn("invalid log level - " + e);
      return;
    }
    jn = t;
  }
  static from(e) {
    return new R(e);
  }
}
R.errors = Fe;
R.levels = xn;
const Qa = "bytes/5.7.0", Qe = new R(Qa);
function oa(i) {
  return !!i.toHexString;
}
function Ut(i) {
  return i.slice || (i.slice = function() {
    const e = Array.prototype.slice.call(arguments);
    return Ut(new Uint8Array(Array.prototype.slice.apply(i, e)));
  }), i;
}
function $n(i) {
  return typeof i == "number" && i == i && i % 1 === 0;
}
function Nn(i) {
  if (i == null)
    return !1;
  if (i.constructor === Uint8Array)
    return !0;
  if (typeof i == "string" || !$n(i.length) || i.length < 0)
    return !1;
  for (let e = 0; e < i.length; e++) {
    const t = i[e];
    if (!$n(t) || t < 0 || t >= 256)
      return !1;
  }
  return !0;
}
function Se(i, e) {
  if (e || (e = {}), typeof i == "number") {
    Qe.checkSafeUint53(i, "invalid arrayify value");
    const t = [];
    for (; i; )
      t.unshift(i & 255), i = parseInt(String(i / 256));
    return t.length === 0 && t.push(0), Ut(new Uint8Array(t));
  }
  if (e.allowMissingPrefix && typeof i == "string" && i.substring(0, 2) !== "0x" && (i = "0x" + i), oa(i) && (i = i.toHexString()), Pe(i)) {
    let t = i.substring(2);
    t.length % 2 && (e.hexPad === "left" ? t = "0" + t : e.hexPad === "right" ? t += "0" : Qe.throwArgumentError("hex data is odd-length", "value", i));
    const n = [];
    for (let m = 0; m < t.length; m += 2)
      n.push(parseInt(t.substring(m, m + 2), 16));
    return Ut(new Uint8Array(n));
  }
  return Nn(i) ? Ut(new Uint8Array(i)) : Qe.throwArgumentError("invalid arrayify value", "value", i);
}
function St(i) {
  const e = i.map((m) => Se(m)), t = e.reduce((m, u) => m + u.length, 0), n = new Uint8Array(t);
  return e.reduce((m, u) => (n.set(u, m), m + u.length), 0), Ut(n);
}
function Pe(i, e) {
  return !(typeof i != "string" || !i.match(/^0x[0-9A-Fa-f]*$/) || e && i.length !== 2 + 2 * e);
}
const vn = "0123456789abcdef";
function ke(i, e) {
  if (e || (e = {}), typeof i == "number") {
    Qe.checkSafeUint53(i, "invalid hexlify value");
    let t = "";
    for (; i; )
      t = vn[i & 15] + t, i = Math.floor(i / 16);
    return t.length ? (t.length % 2 && (t = "0" + t), "0x" + t) : "0x00";
  }
  if (typeof i == "bigint")
    return i = i.toString(16), i.length % 2 ? "0x0" + i : "0x" + i;
  if (e.allowMissingPrefix && typeof i == "string" && i.substring(0, 2) !== "0x" && (i = "0x" + i), oa(i))
    return i.toHexString();
  if (Pe(i))
    return i.length % 2 && (e.hexPad === "left" ? i = "0x0" + i.substring(2) : e.hexPad === "right" ? i += "0" : Qe.throwArgumentError("hex data is odd-length", "value", i)), i.toLowerCase();
  if (Nn(i)) {
    let t = "0x";
    for (let n = 0; n < i.length; n++) {
      let m = i[n];
      t += vn[(m & 240) >> 4] + vn[m & 15];
    }
    return t;
  }
  return Qe.throwArgumentError("invalid hexlify value", "value", i);
}
function Ja(i, e, t) {
  return typeof i != "string" ? i = ke(i) : (!Pe(i) || i.length % 2) && Qe.throwArgumentError("invalid hexData", "value", i), e = 2 + 2 * e, t != null ? "0x" + i.substring(e, 2 + 2 * t) : "0x" + i.substring(e);
}
function Xa(i) {
  let e = "0x";
  return i.forEach((t) => {
    e += ke(t).substring(2);
  }), e;
}
function la(i, e) {
  for (typeof i != "string" ? i = ke(i) : Pe(i) || Qe.throwArgumentError("invalid hex string", "value", i), i.length > 2 * e + 2 && Qe.throwArgumentError("value out of range", "value", arguments[1]); i.length < 2 * e + 2; )
    i = "0x0" + i.substring(2);
  return i;
}
const Ya = "bignumber/5.7.0";
var en = $a.BN;
const je = new R(Ya), In = {}, Kn = 9007199254740991;
let Zn = !1;
class ge {
  constructor(e, t) {
    e !== In && je.throwError("cannot call constructor directly; use BigNumber.from", R.errors.UNSUPPORTED_OPERATION, {
      operation: "new (BigNumber)"
    }), this._hex = t, this._isBigNumber = !0, Object.freeze(this);
  }
  fromTwos(e) {
    return Ce(P(this).fromTwos(e));
  }
  toTwos(e) {
    return Ce(P(this).toTwos(e));
  }
  abs() {
    return this._hex[0] === "-" ? ge.from(this._hex.substring(1)) : this;
  }
  add(e) {
    return Ce(P(this).add(P(e)));
  }
  sub(e) {
    return Ce(P(this).sub(P(e)));
  }
  div(e) {
    return ge.from(e).isZero() && Ne("division-by-zero", "div"), Ce(P(this).div(P(e)));
  }
  mul(e) {
    return Ce(P(this).mul(P(e)));
  }
  mod(e) {
    const t = P(e);
    return t.isNeg() && Ne("division-by-zero", "mod"), Ce(P(this).umod(t));
  }
  pow(e) {
    const t = P(e);
    return t.isNeg() && Ne("negative-power", "pow"), Ce(P(this).pow(t));
  }
  and(e) {
    const t = P(e);
    return (this.isNegative() || t.isNeg()) && Ne("unbound-bitwise-result", "and"), Ce(P(this).and(t));
  }
  or(e) {
    const t = P(e);
    return (this.isNegative() || t.isNeg()) && Ne("unbound-bitwise-result", "or"), Ce(P(this).or(t));
  }
  xor(e) {
    const t = P(e);
    return (this.isNegative() || t.isNeg()) && Ne("unbound-bitwise-result", "xor"), Ce(P(this).xor(t));
  }
  mask(e) {
    return (this.isNegative() || e < 0) && Ne("negative-width", "mask"), Ce(P(this).maskn(e));
  }
  shl(e) {
    return (this.isNegative() || e < 0) && Ne("negative-width", "shl"), Ce(P(this).shln(e));
  }
  shr(e) {
    return (this.isNegative() || e < 0) && Ne("negative-width", "shr"), Ce(P(this).shrn(e));
  }
  eq(e) {
    return P(this).eq(P(e));
  }
  lt(e) {
    return P(this).lt(P(e));
  }
  lte(e) {
    return P(this).lte(P(e));
  }
  gt(e) {
    return P(this).gt(P(e));
  }
  gte(e) {
    return P(this).gte(P(e));
  }
  isNegative() {
    return this._hex[0] === "-";
  }
  isZero() {
    return P(this).isZero();
  }
  toNumber() {
    try {
      return P(this).toNumber();
    } catch {
      Ne("overflow", "toNumber", this.toString());
    }
    return null;
  }
  toBigInt() {
    try {
      return BigInt(this.toString());
    } catch {
    }
    return je.throwError("this platform does not support BigInt", R.errors.UNSUPPORTED_OPERATION, {
      value: this.toString()
    });
  }
  toString() {
    return arguments.length > 0 && (arguments[0] === 10 ? Zn || (Zn = !0, je.warn("BigNumber.toString does not accept any parameters; base-10 is assumed")) : arguments[0] === 16 ? je.throwError("BigNumber.toString does not accept any parameters; use bigNumber.toHexString()", R.errors.UNEXPECTED_ARGUMENT, {}) : je.throwError("BigNumber.toString does not accept parameters", R.errors.UNEXPECTED_ARGUMENT, {})), P(this).toString(10);
  }
  toHexString() {
    return this._hex;
  }
  toJSON(e) {
    return { type: "BigNumber", hex: this.toHexString() };
  }
  static from(e) {
    if (e instanceof ge)
      return e;
    if (typeof e == "string")
      return e.match(/^-?0x[0-9a-f]+$/i) ? new ge(In, Vt(e)) : e.match(/^-?[0-9]+$/) ? new ge(In, Vt(new en(e))) : je.throwArgumentError("invalid BigNumber string", "value", e);
    if (typeof e == "number")
      return e % 1 && Ne("underflow", "BigNumber.from", e), (e >= Kn || e <= -Kn) && Ne("overflow", "BigNumber.from", e), ge.from(String(e));
    const t = e;
    if (typeof t == "bigint")
      return ge.from(t.toString());
    if (Nn(t))
      return ge.from(ke(t));
    if (t)
      if (t.toHexString) {
        const n = t.toHexString();
        if (typeof n == "string")
          return ge.from(n);
      } else {
        let n = t._hex;
        if (n == null && t.type === "BigNumber" && (n = t.hex), typeof n == "string" && (Pe(n) || n[0] === "-" && Pe(n.substring(1))))
          return ge.from(n);
      }
    return je.throwArgumentError("invalid BigNumber value", "value", e);
  }
  static isBigNumber(e) {
    return !!(e && e._isBigNumber);
  }
}
function Vt(i) {
  if (typeof i != "string")
    return Vt(i.toString(16));
  if (i[0] === "-")
    return i = i.substring(1), i[0] === "-" && je.throwArgumentError("invalid hex", "value", i), i = Vt(i), i === "0x00" ? i : "-" + i;
  if (i.substring(0, 2) !== "0x" && (i = "0x" + i), i === "0x")
    return "0x00";
  for (i.length % 2 && (i = "0x0" + i.substring(2)); i.length > 4 && i.substring(0, 4) === "0x00"; )
    i = "0x" + i.substring(4);
  return i;
}
function Ce(i) {
  return ge.from(Vt(i));
}
function P(i) {
  const e = ge.from(i).toHexString();
  return e[0] === "-" ? new en("-" + e.substring(3), 16) : new en(e.substring(2), 16);
}
function Ne(i, e, t) {
  const n = { fault: i, operation: e };
  return t != null && (n.value = t), je.throwError(i, R.errors.NUMERIC_FAULT, n);
}
function ei(i) {
  return new en(i, 36).toString(16);
}
const ti = "properties/5.7.0";
globalThis && globalThis.__awaiter;
const ma = new R(ti);
function Ie(i, e, t) {
  Object.defineProperty(i, e, {
    enumerable: !0,
    value: t,
    writable: !1
  });
}
function Gt(i, e) {
  for (let t = 0; t < 32; t++) {
    if (i[e])
      return i[e];
    if (!i.prototype || typeof i.prototype != "object")
      break;
    i = Object.getPrototypeOf(i.prototype).constructor;
  }
  return null;
}
const ni = { bigint: !0, boolean: !0, function: !0, number: !0, string: !0 };
function da(i) {
  if (i == null || ni[typeof i])
    return !0;
  if (Array.isArray(i) || typeof i == "object") {
    if (!Object.isFrozen(i))
      return !1;
    const e = Object.keys(i);
    for (let t = 0; t < e.length; t++) {
      let n = null;
      try {
        n = i[e[t]];
      } catch {
        continue;
      }
      if (!da(n))
        return !1;
    }
    return !0;
  }
  return ma.throwArgumentError(`Cannot deepCopy ${typeof i}`, "object", i);
}
function ai(i) {
  if (da(i))
    return i;
  if (Array.isArray(i))
    return Object.freeze(i.map((e) => An(e)));
  if (typeof i == "object") {
    const e = {};
    for (const t in i) {
      const n = i[t];
      n !== void 0 && Ie(e, t, An(n));
    }
    return e;
  }
  return ma.throwArgumentError(`Cannot deepCopy ${typeof i}`, "object", i);
}
function An(i) {
  return ai(i);
}
class sn {
  constructor(e) {
    for (const t in e)
      this[t] = An(e[t]);
  }
}
const Wt = "abi/5.7.0", L = new R(Wt), It = {};
let Qn = { calldata: !0, memory: !0, storage: !0 }, ii = { calldata: !0, memory: !0 };
function $t(i, e) {
  if (i === "bytes" || i === "string") {
    if (Qn[e])
      return !0;
  } else if (i === "address") {
    if (e === "payable")
      return !0;
  } else if ((i.indexOf("[") >= 0 || i === "tuple") && ii[e])
    return !0;
  return (Qn[e] || e === "payable") && L.throwArgumentError("invalid modifier", "name", e), !1;
}
function si(i, e) {
  let t = i;
  function n(_) {
    L.throwArgumentError(`unexpected character at position ${_}`, "param", i);
  }
  i = i.replace(/\s/g, " ");
  function m(_) {
    let v = { type: "", name: "", parent: _, state: { allowType: !0 } };
    return e && (v.indexed = !1), v;
  }
  let u = { type: "", name: "", state: { allowType: !0 } }, f = u;
  for (let _ = 0; _ < i.length; _++) {
    let v = i[_];
    switch (v) {
      case "(":
        f.state.allowType && f.type === "" ? f.type = "tuple" : f.state.allowParams || n(_), f.state.allowType = !1, f.type = Et(f.type), f.components = [m(f)], f = f.components[0];
        break;
      case ")":
        delete f.state, f.name === "indexed" && (e || n(_), f.indexed = !0, f.name = ""), $t(f.type, f.name) && (f.name = ""), f.type = Et(f.type);
        let I = f;
        f = f.parent, f || n(_), delete I.parent, f.state.allowParams = !1, f.state.allowName = !0, f.state.allowArray = !0;
        break;
      case ",":
        delete f.state, f.name === "indexed" && (e || n(_), f.indexed = !0, f.name = ""), $t(f.type, f.name) && (f.name = ""), f.type = Et(f.type);
        let S = m(f.parent);
        f.parent.components.push(S), delete f.parent, f = S;
        break;
      case " ":
        f.state.allowType && f.type !== "" && (f.type = Et(f.type), delete f.state.allowType, f.state.allowName = !0, f.state.allowParams = !0), f.state.allowName && f.name !== "" && (f.name === "indexed" ? (e || n(_), f.indexed && n(_), f.indexed = !0, f.name = "") : $t(f.type, f.name) ? f.name = "" : f.state.allowName = !1);
        break;
      case "[":
        f.state.allowArray || n(_), f.type += v, f.state.allowArray = !1, f.state.allowName = !1, f.state.readArray = !0;
        break;
      case "]":
        f.state.readArray || n(_), f.type += v, f.state.readArray = !1, f.state.allowArray = !0, f.state.allowName = !0;
        break;
      default:
        f.state.allowType ? (f.type += v, f.state.allowParams = !0, f.state.allowArray = !0) : f.state.allowName ? (f.name += v, delete f.state.allowArray) : f.state.readArray ? f.type += v : n(_);
    }
  }
  return f.parent && L.throwArgumentError("unexpected eof", "param", i), delete u.state, f.name === "indexed" ? (e || n(t.length - 7), f.indexed && n(t.length - 7), f.indexed = !0, f.name = "") : $t(f.type, f.name) && (f.name = ""), u.type = Et(u.type), u;
}
function Yt(i, e) {
  for (let t in e)
    Ie(i, t, e[t]);
}
const B = Object.freeze({
  // Bare formatting, as is needed for computing a sighash of an event or function
  sighash: "sighash",
  // Human-Readable with Minimal spacing and without names (compact human-readable)
  minimal: "minimal",
  // Human-Readable with nice spacing, including all names
  full: "full",
  // JSON-format a la Solidity
  json: "json"
}), ri = new RegExp(/^(.*)\[([0-9]*)\]$/);
class ve {
  constructor(e, t) {
    e !== It && L.throwError("use fromString", R.errors.UNSUPPORTED_OPERATION, {
      operation: "new ParamType()"
    }), Yt(this, t);
    let n = this.type.match(ri);
    n ? Yt(this, {
      arrayLength: parseInt(n[2] || "-1"),
      arrayChildren: ve.fromObject({
        type: n[1],
        components: this.components
      }),
      baseType: "array"
    }) : Yt(this, {
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
    if (e || (e = B.sighash), B[e] || L.throwArgumentError("invalid format type", "format", e), e === B.json) {
      let n = {
        type: this.baseType === "tuple" ? "tuple" : this.type,
        name: this.name || void 0
      };
      return typeof this.indexed == "boolean" && (n.indexed = this.indexed), this.components && (n.components = this.components.map((m) => JSON.parse(m.format(e)))), JSON.stringify(n);
    }
    let t = "";
    return this.baseType === "array" ? (t += this.arrayChildren.format(e), t += "[" + (this.arrayLength < 0 ? "" : String(this.arrayLength)) + "]") : this.baseType === "tuple" ? (e !== B.sighash && (t += this.type), t += "(" + this.components.map((n) => n.format(e)).join(e === B.full ? ", " : ",") + ")") : t += this.type, e !== B.sighash && (this.indexed === !0 && (t += " indexed"), e === B.full && this.name && (t += " " + this.name)), t;
  }
  static from(e, t) {
    return typeof e == "string" ? ve.fromString(e, t) : ve.fromObject(e);
  }
  static fromObject(e) {
    return ve.isParamType(e) ? e : new ve(It, {
      name: e.name || null,
      type: Et(e.type),
      indexed: e.indexed == null ? null : !!e.indexed,
      components: e.components ? e.components.map(ve.fromObject) : null
    });
  }
  static fromString(e, t) {
    function n(m) {
      return ve.fromObject({
        name: m.name,
        type: m.type,
        indexed: m.indexed,
        components: m.components
      });
    }
    return n(si(e, !!t));
  }
  static isParamType(e) {
    return !!(e != null && e._isParamType);
  }
}
function qt(i, e) {
  return ui(i).map((t) => ve.fromString(t, e));
}
class Ze {
  constructor(e, t) {
    e !== It && L.throwError("use a static from method", R.errors.UNSUPPORTED_OPERATION, {
      operation: "new Fragment()"
    }), Yt(this, t), this._isFragment = !0, Object.freeze(this);
  }
  static from(e) {
    return Ze.isFragment(e) ? e : typeof e == "string" ? Ze.fromString(e) : Ze.fromObject(e);
  }
  static fromObject(e) {
    if (Ze.isFragment(e))
      return e;
    switch (e.type) {
      case "function":
        return Ve.fromObject(e);
      case "event":
        return $e.fromObject(e);
      case "constructor":
        return Ue.fromObject(e);
      case "error":
        return it.fromObject(e);
      case "fallback":
      case "receive":
        return null;
    }
    return L.throwArgumentError("invalid fragment object", "value", e);
  }
  static fromString(e) {
    return e = e.replace(/\s/g, " "), e = e.replace(/\(/g, " (").replace(/\)/g, ") ").replace(/\s+/g, " "), e = e.trim(), e.split(" ")[0] === "event" ? $e.fromString(e.substring(5).trim()) : e.split(" ")[0] === "function" ? Ve.fromString(e.substring(8).trim()) : e.split("(")[0].trim() === "constructor" ? Ue.fromString(e.trim()) : e.split(" ")[0] === "error" ? it.fromString(e.substring(5).trim()) : L.throwArgumentError("unsupported fragment", "value", e);
  }
  static isFragment(e) {
    return !!(e && e._isFragment);
  }
}
class $e extends Ze {
  format(e) {
    if (e || (e = B.sighash), B[e] || L.throwArgumentError("invalid format type", "format", e), e === B.json)
      return JSON.stringify({
        type: "event",
        anonymous: this.anonymous,
        name: this.name,
        inputs: this.inputs.map((n) => JSON.parse(n.format(e)))
      });
    let t = "";
    return e !== B.sighash && (t += "event "), t += this.name + "(" + this.inputs.map((n) => n.format(e)).join(e === B.full ? ", " : ",") + ") ", e !== B.sighash && this.anonymous && (t += "anonymous "), t.trim();
  }
  static from(e) {
    return typeof e == "string" ? $e.fromString(e) : $e.fromObject(e);
  }
  static fromObject(e) {
    if ($e.isEventFragment(e))
      return e;
    e.type !== "event" && L.throwArgumentError("invalid event object", "value", e);
    const t = {
      name: zt(e.name),
      anonymous: e.anonymous,
      inputs: e.inputs ? e.inputs.map(ve.fromObject) : [],
      type: "event"
    };
    return new $e(It, t);
  }
  static fromString(e) {
    let t = e.match(Ht);
    t || L.throwArgumentError("invalid event string", "value", e);
    let n = !1;
    return t[3].split(" ").forEach((m) => {
      switch (m.trim()) {
        case "anonymous":
          n = !0;
          break;
        case "":
          break;
        default:
          L.warn("unknown modifier: " + m);
      }
    }), $e.fromObject({
      name: t[1].trim(),
      anonymous: n,
      inputs: qt(t[2], !0),
      type: "event"
    });
  }
  static isEventFragment(e) {
    return e && e._isFragment && e.type === "event";
  }
}
function ca(i, e) {
  e.gas = null;
  let t = i.split("@");
  return t.length !== 1 ? (t.length > 2 && L.throwArgumentError("invalid human-readable ABI signature", "value", i), t[1].match(/^[0-9]+$/) || L.throwArgumentError("invalid human-readable ABI signature gas", "value", i), e.gas = ge.from(t[1]), t[0]) : i;
}
function fa(i, e) {
  e.constant = !1, e.payable = !1, e.stateMutability = "nonpayable", i.split(" ").forEach((t) => {
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
function Ta(i) {
  let e = {
    constant: !1,
    payable: !0,
    stateMutability: "payable"
  };
  return i.stateMutability != null ? (e.stateMutability = i.stateMutability, e.constant = e.stateMutability === "view" || e.stateMutability === "pure", i.constant != null && !!i.constant !== e.constant && L.throwArgumentError("cannot have constant function with mutability " + e.stateMutability, "value", i), e.payable = e.stateMutability === "payable", i.payable != null && !!i.payable !== e.payable && L.throwArgumentError("cannot have payable function with mutability " + e.stateMutability, "value", i)) : i.payable != null ? (e.payable = !!i.payable, i.constant == null && !e.payable && i.type !== "constructor" && L.throwArgumentError("unable to determine stateMutability", "value", i), e.constant = !!i.constant, e.constant ? e.stateMutability = "view" : e.stateMutability = e.payable ? "payable" : "nonpayable", e.payable && e.constant && L.throwArgumentError("cannot have constant payable function", "value", i)) : i.constant != null ? (e.constant = !!i.constant, e.payable = !e.constant, e.stateMutability = e.constant ? "view" : "payable") : i.type !== "constructor" && L.throwArgumentError("unable to determine stateMutability", "value", i), e;
}
class Ue extends Ze {
  format(e) {
    if (e || (e = B.sighash), B[e] || L.throwArgumentError("invalid format type", "format", e), e === B.json)
      return JSON.stringify({
        type: "constructor",
        stateMutability: this.stateMutability !== "nonpayable" ? this.stateMutability : void 0,
        payable: this.payable,
        gas: this.gas ? this.gas.toNumber() : void 0,
        inputs: this.inputs.map((n) => JSON.parse(n.format(e)))
      });
    e === B.sighash && L.throwError("cannot format a constructor for sighash", R.errors.UNSUPPORTED_OPERATION, {
      operation: "format(sighash)"
    });
    let t = "constructor(" + this.inputs.map((n) => n.format(e)).join(e === B.full ? ", " : ",") + ") ";
    return this.stateMutability && this.stateMutability !== "nonpayable" && (t += this.stateMutability + " "), t.trim();
  }
  static from(e) {
    return typeof e == "string" ? Ue.fromString(e) : Ue.fromObject(e);
  }
  static fromObject(e) {
    if (Ue.isConstructorFragment(e))
      return e;
    e.type !== "constructor" && L.throwArgumentError("invalid constructor object", "value", e);
    let t = Ta(e);
    t.constant && L.throwArgumentError("constructor cannot be constant", "value", e);
    const n = {
      name: null,
      type: e.type,
      inputs: e.inputs ? e.inputs.map(ve.fromObject) : [],
      payable: t.payable,
      stateMutability: t.stateMutability,
      gas: e.gas ? ge.from(e.gas) : null
    };
    return new Ue(It, n);
  }
  static fromString(e) {
    let t = { type: "constructor" };
    e = ca(e, t);
    let n = e.match(Ht);
    return (!n || n[1].trim() !== "constructor") && L.throwArgumentError("invalid constructor string", "value", e), t.inputs = qt(n[2].trim(), !1), fa(n[3].trim(), t), Ue.fromObject(t);
  }
  static isConstructorFragment(e) {
    return e && e._isFragment && e.type === "constructor";
  }
}
class Ve extends Ue {
  format(e) {
    if (e || (e = B.sighash), B[e] || L.throwArgumentError("invalid format type", "format", e), e === B.json)
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
    return e !== B.sighash && (t += "function "), t += this.name + "(" + this.inputs.map((n) => n.format(e)).join(e === B.full ? ", " : ",") + ") ", e !== B.sighash && (this.stateMutability ? this.stateMutability !== "nonpayable" && (t += this.stateMutability + " ") : this.constant && (t += "view "), this.outputs && this.outputs.length && (t += "returns (" + this.outputs.map((n) => n.format(e)).join(", ") + ") "), this.gas != null && (t += "@" + this.gas.toString() + " ")), t.trim();
  }
  static from(e) {
    return typeof e == "string" ? Ve.fromString(e) : Ve.fromObject(e);
  }
  static fromObject(e) {
    if (Ve.isFunctionFragment(e))
      return e;
    e.type !== "function" && L.throwArgumentError("invalid function object", "value", e);
    let t = Ta(e);
    const n = {
      type: e.type,
      name: zt(e.name),
      constant: t.constant,
      inputs: e.inputs ? e.inputs.map(ve.fromObject) : [],
      outputs: e.outputs ? e.outputs.map(ve.fromObject) : [],
      payable: t.payable,
      stateMutability: t.stateMutability,
      gas: e.gas ? ge.from(e.gas) : null
    };
    return new Ve(It, n);
  }
  static fromString(e) {
    let t = { type: "function" };
    e = ca(e, t);
    let n = e.split(" returns ");
    n.length > 2 && L.throwArgumentError("invalid function string", "value", e);
    let m = n[0].match(Ht);
    if (m || L.throwArgumentError("invalid function signature", "value", e), t.name = m[1].trim(), t.name && zt(t.name), t.inputs = qt(m[2], !1), fa(m[3].trim(), t), n.length > 1) {
      let u = n[1].match(Ht);
      (u[1].trim() != "" || u[3].trim() != "") && L.throwArgumentError("unexpected tokens", "value", e), t.outputs = qt(u[2], !1);
    } else
      t.outputs = [];
    return Ve.fromObject(t);
  }
  static isFunctionFragment(e) {
    return e && e._isFragment && e.type === "function";
  }
}
function Jn(i) {
  const e = i.format();
  return (e === "Error(string)" || e === "Panic(uint256)") && L.throwArgumentError(`cannot specify user defined ${e} error`, "fragment", i), i;
}
class it extends Ze {
  format(e) {
    if (e || (e = B.sighash), B[e] || L.throwArgumentError("invalid format type", "format", e), e === B.json)
      return JSON.stringify({
        type: "error",
        name: this.name,
        inputs: this.inputs.map((n) => JSON.parse(n.format(e)))
      });
    let t = "";
    return e !== B.sighash && (t += "error "), t += this.name + "(" + this.inputs.map((n) => n.format(e)).join(e === B.full ? ", " : ",") + ") ", t.trim();
  }
  static from(e) {
    return typeof e == "string" ? it.fromString(e) : it.fromObject(e);
  }
  static fromObject(e) {
    if (it.isErrorFragment(e))
      return e;
    e.type !== "error" && L.throwArgumentError("invalid error object", "value", e);
    const t = {
      type: e.type,
      name: zt(e.name),
      inputs: e.inputs ? e.inputs.map(ve.fromObject) : []
    };
    return Jn(new it(It, t));
  }
  static fromString(e) {
    let t = { type: "error" }, n = e.match(Ht);
    return n || L.throwArgumentError("invalid error signature", "value", e), t.name = n[1].trim(), t.name && zt(t.name), t.inputs = qt(n[2], !1), Jn(it.fromObject(t));
  }
  static isErrorFragment(e) {
    return e && e._isFragment && e.type === "error";
  }
}
function Et(i) {
  return i.match(/^uint($|[^1-9])/) ? i = "uint256" + i.substring(4) : i.match(/^int($|[^1-9])/) && (i = "int256" + i.substring(3)), i;
}
const pi = new RegExp("^[a-zA-Z$_][a-zA-Z0-9$_]*$");
function zt(i) {
  return (!i || !i.match(pi)) && L.throwArgumentError(`invalid identifier "${i}"`, "value", i), i;
}
const Ht = new RegExp("^([^)(]*)\\((.*)\\)([^)(]*)$");
function ui(i) {
  i = i.trim();
  let e = [], t = "", n = 0;
  for (let m = 0; m < i.length; m++) {
    let u = i[m];
    u === "," && n === 0 ? (e.push(t), t = "") : (t += u, u === "(" ? n++ : u === ")" && (n--, n === -1 && L.throwArgumentError("unbalanced parenthesis", "value", i)));
  }
  return t && e.push(t), e;
}
const Dn = new R(Wt);
class Je {
  constructor(e, t, n, m) {
    this.name = e, this.type = t, this.localName = n, this.dynamic = m;
  }
  _throwError(e, t) {
    Dn.throwArgumentError(e, this.localName, t);
  }
}
class En {
  constructor(e) {
    Ie(this, "wordSize", e || 32), this._data = [], this._dataLength = 0, this._padding = new Uint8Array(e);
  }
  get data() {
    return Xa(this._data);
  }
  get length() {
    return this._dataLength;
  }
  _writeData(e) {
    return this._data.push(e), this._dataLength += e.length, e.length;
  }
  appendWriter(e) {
    return this._writeData(St(e._data));
  }
  // Arrayish items; padded on the right to wordSize
  writeBytes(e) {
    let t = Se(e);
    const n = t.length % this.wordSize;
    return n && (t = St([t, this._padding.slice(n)])), this._writeData(t);
  }
  _getValue(e) {
    let t = Se(ge.from(e));
    return t.length > this.wordSize && Dn.throwError("value out-of-bounds", R.errors.BUFFER_OVERRUN, {
      length: this.wordSize,
      offset: t.length
    }), t.length % this.wordSize && (t = St([this._padding.slice(t.length % this.wordSize), t])), t;
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
class tn {
  constructor(e, t, n, m) {
    Ie(this, "_data", Se(e)), Ie(this, "wordSize", t || 32), Ie(this, "_coerceFunc", n), Ie(this, "allowLoose", m), this._offset = 0;
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
    return this._coerceFunc ? this._coerceFunc(e, t) : tn.coerce(e, t);
  }
  _peekBytes(e, t, n) {
    let m = Math.ceil(t / this.wordSize) * this.wordSize;
    return this._offset + m > this._data.length && (this.allowLoose && n && this._offset + t <= this._data.length ? m = t : Dn.throwError("data out-of-bounds", R.errors.BUFFER_OVERRUN, {
      length: this._data.length,
      offset: this._offset + m
    })), this._data.slice(this._offset, this._offset + m);
  }
  subReader(e) {
    return new tn(this._data.slice(this._offset + e), this.wordSize, this._coerceFunc, this.allowLoose);
  }
  readBytes(e, t) {
    let n = this._peekBytes(0, e, !!t);
    return this._offset += n.length, n.slice(0, e);
  }
  readValue() {
    return ge.from(this.readBytes(this.wordSize));
  }
}
var ba = { exports: {} };
/**
 * [js-sha3]{@link https://github.com/emn178/js-sha3}
 *
 * @version 0.8.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2018
 * @license MIT
 */
(function(i) {
  (function() {
    var e = "input is invalid type", t = "finalize already called", n = typeof window == "object", m = n ? window : {};
    m.JS_SHA3_NO_WINDOW && (n = !1);
    var u = !n && typeof self == "object", f = !m.JS_SHA3_NO_NODE_JS && typeof process == "object" && process.versions && process.versions.node;
    f ? m = ua : u && (m = self);
    var _ = !m.JS_SHA3_NO_COMMON_JS && !0 && i.exports, v = !m.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer < "u", I = "0123456789abcdef".split(""), S = [31, 7936, 2031616, 520093696], N = [4, 1024, 262144, 67108864], F = [1, 256, 65536, 16777216], V = [6, 1536, 393216, 100663296], U = [0, 8, 16, 24], Oe = [
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
    ], rt = [224, 256, 384, 512], ze = [128, 256], De = ["hex", "buffer", "arrayBuffer", "array", "digest"], Xe = {
      128: 168,
      256: 136
    };
    (m.JS_SHA3_NO_NODE_JS || !Array.isArray) && (Array.isArray = function(p) {
      return Object.prototype.toString.call(p) === "[object Array]";
    }), v && (m.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView) && (ArrayBuffer.isView = function(p) {
      return typeof p == "object" && p.buffer && p.buffer.constructor === ArrayBuffer;
    });
    for (var Dt = function(p, g, M) {
      return function(w) {
        return new s(p, g, p).update(w)[M]();
      };
    }, xt = function(p, g, M) {
      return function(w, k) {
        return new s(p, g, k).update(w)[M]();
      };
    }, Ee = function(p, g, M) {
      return function(w, k, C, A) {
        return a["cshake" + p].update(w, k, C, A)[M]();
      };
    }, pt = function(p, g, M) {
      return function(w, k, C, A) {
        return a["kmac" + p].update(w, k, C, A)[M]();
      };
    }, ut = function(p, g, M, w) {
      for (var k = 0; k < De.length; ++k) {
        var C = De[k];
        p[C] = g(M, w, C);
      }
      return p;
    }, Ft = function(p, g) {
      var M = Dt(p, g, "hex");
      return M.create = function() {
        return new s(p, g, p);
      }, M.update = function(w) {
        return M.create().update(w);
      }, ut(M, Dt, p, g);
    }, Pt = function(p, g) {
      var M = xt(p, g, "hex");
      return M.create = function(w) {
        return new s(p, g, w);
      }, M.update = function(w, k) {
        return M.create(k).update(w);
      }, ut(M, xt, p, g);
    }, Me = function(p, g) {
      var M = Xe[p], w = Ee(p, g, "hex");
      return w.create = function(k, C, A) {
        return !C && !A ? a["shake" + p].create(k) : new s(p, g, k).bytepad([C, A], M);
      }, w.update = function(k, C, A, x) {
        return w.create(C, A, x).update(k);
      }, ut(w, Ee, p, g);
    }, He = function(p, g) {
      var M = Xe[p], w = pt(p, g, "hex");
      return w.create = function(k, C, A) {
        return new d(p, g, C).bytepad(["KMAC", A], M).bytepad([k], M);
      }, w.update = function(k, C, A, x) {
        return w.create(k, A, x).update(C);
      }, ut(w, pt, p, g);
    }, T = [
      { name: "keccak", padding: F, bits: rt, createMethod: Ft },
      { name: "sha3", padding: V, bits: rt, createMethod: Ft },
      { name: "shake", padding: S, bits: ze, createMethod: Pt },
      { name: "cshake", padding: N, bits: ze, createMethod: Me },
      { name: "kmac", padding: N, bits: ze, createMethod: He }
    ], a = {}, r = [], y = 0; y < T.length; ++y)
      for (var l = T[y], c = l.bits, b = 0; b < c.length; ++b) {
        var h = l.name + "_" + c[b];
        if (r.push(h), a[h] = l.createMethod(c[b], l.padding), l.name !== "sha3") {
          var o = l.name + c[b];
          r.push(o), a[o] = a[h];
        }
      }
    function s(p, g, M) {
      this.blocks = [], this.s = [], this.padding = g, this.outputBits = M, this.reset = !0, this.finalized = !1, this.block = 0, this.start = 0, this.blockCount = 1600 - (p << 1) >> 5, this.byteCount = this.blockCount << 2, this.outputBlocks = M >> 5, this.extraBytes = (M & 31) >> 3;
      for (var w = 0; w < 50; ++w)
        this.s[w] = 0;
    }
    s.prototype.update = function(p) {
      if (this.finalized)
        throw new Error(t);
      var g, M = typeof p;
      if (M !== "string") {
        if (M === "object") {
          if (p === null)
            throw new Error(e);
          if (v && p.constructor === ArrayBuffer)
            p = new Uint8Array(p);
          else if (!Array.isArray(p) && (!v || !ArrayBuffer.isView(p)))
            throw new Error(e);
        } else
          throw new Error(e);
        g = !0;
      }
      for (var w = this.blocks, k = this.byteCount, C = p.length, A = this.blockCount, x = 0, we = this.s, E, D; x < C; ) {
        if (this.reset)
          for (this.reset = !1, w[0] = this.block, E = 1; E < A + 1; ++E)
            w[E] = 0;
        if (g)
          for (E = this.start; x < C && E < k; ++x)
            w[E >> 2] |= p[x] << U[E++ & 3];
        else
          for (E = this.start; x < C && E < k; ++x)
            D = p.charCodeAt(x), D < 128 ? w[E >> 2] |= D << U[E++ & 3] : D < 2048 ? (w[E >> 2] |= (192 | D >> 6) << U[E++ & 3], w[E >> 2] |= (128 | D & 63) << U[E++ & 3]) : D < 55296 || D >= 57344 ? (w[E >> 2] |= (224 | D >> 12) << U[E++ & 3], w[E >> 2] |= (128 | D >> 6 & 63) << U[E++ & 3], w[E >> 2] |= (128 | D & 63) << U[E++ & 3]) : (D = 65536 + ((D & 1023) << 10 | p.charCodeAt(++x) & 1023), w[E >> 2] |= (240 | D >> 18) << U[E++ & 3], w[E >> 2] |= (128 | D >> 12 & 63) << U[E++ & 3], w[E >> 2] |= (128 | D >> 6 & 63) << U[E++ & 3], w[E >> 2] |= (128 | D & 63) << U[E++ & 3]);
        if (this.lastByteIndex = E, E >= k) {
          for (this.start = E - k, this.block = w[A], E = 0; E < A; ++E)
            we[E] ^= w[E];
          O(we), this.reset = !0;
        } else
          this.start = E;
      }
      return this;
    }, s.prototype.encode = function(p, g) {
      var M = p & 255, w = 1, k = [M];
      for (p = p >> 8, M = p & 255; M > 0; )
        k.unshift(M), p = p >> 8, M = p & 255, ++w;
      return g ? k.push(w) : k.unshift(w), this.update(k), k.length;
    }, s.prototype.encodeString = function(p) {
      var g, M = typeof p;
      if (M !== "string") {
        if (M === "object") {
          if (p === null)
            throw new Error(e);
          if (v && p.constructor === ArrayBuffer)
            p = new Uint8Array(p);
          else if (!Array.isArray(p) && (!v || !ArrayBuffer.isView(p)))
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
          var A = p.charCodeAt(C);
          A < 128 ? w += 1 : A < 2048 ? w += 2 : A < 55296 || A >= 57344 ? w += 3 : (A = 65536 + ((A & 1023) << 10 | p.charCodeAt(++C) & 1023), w += 4);
        }
      return w += this.encode(w * 8), this.update(p), w;
    }, s.prototype.bytepad = function(p, g) {
      for (var M = this.encode(g), w = 0; w < p.length; ++w)
        M += this.encodeString(p[w]);
      var k = g - M % g, C = [];
      return C.length = k, this.update(C), this;
    }, s.prototype.finalize = function() {
      if (!this.finalized) {
        this.finalized = !0;
        var p = this.blocks, g = this.lastByteIndex, M = this.blockCount, w = this.s;
        if (p[g >> 2] |= this.padding[g & 3], this.lastByteIndex === this.byteCount)
          for (p[0] = p[M], g = 1; g < M + 1; ++g)
            p[g] = 0;
        for (p[M - 1] |= 2147483648, g = 0; g < M; ++g)
          w[g] ^= p[g];
        O(w);
      }
    }, s.prototype.toString = s.prototype.hex = function() {
      this.finalize();
      for (var p = this.blockCount, g = this.s, M = this.outputBlocks, w = this.extraBytes, k = 0, C = 0, A = "", x; C < M; ) {
        for (k = 0; k < p && C < M; ++k, ++C)
          x = g[k], A += I[x >> 4 & 15] + I[x & 15] + I[x >> 12 & 15] + I[x >> 8 & 15] + I[x >> 20 & 15] + I[x >> 16 & 15] + I[x >> 28 & 15] + I[x >> 24 & 15];
        C % p === 0 && (O(g), k = 0);
      }
      return w && (x = g[k], A += I[x >> 4 & 15] + I[x & 15], w > 1 && (A += I[x >> 12 & 15] + I[x >> 8 & 15]), w > 2 && (A += I[x >> 20 & 15] + I[x >> 16 & 15])), A;
    }, s.prototype.arrayBuffer = function() {
      this.finalize();
      var p = this.blockCount, g = this.s, M = this.outputBlocks, w = this.extraBytes, k = 0, C = 0, A = this.outputBits >> 3, x;
      w ? x = new ArrayBuffer(M + 1 << 2) : x = new ArrayBuffer(A);
      for (var we = new Uint32Array(x); C < M; ) {
        for (k = 0; k < p && C < M; ++k, ++C)
          we[C] = g[k];
        C % p === 0 && O(g);
      }
      return w && (we[k] = g[k], x = x.slice(0, A)), x;
    }, s.prototype.buffer = s.prototype.arrayBuffer, s.prototype.digest = s.prototype.array = function() {
      this.finalize();
      for (var p = this.blockCount, g = this.s, M = this.outputBlocks, w = this.extraBytes, k = 0, C = 0, A = [], x, we; C < M; ) {
        for (k = 0; k < p && C < M; ++k, ++C)
          x = C << 2, we = g[k], A[x] = we & 255, A[x + 1] = we >> 8 & 255, A[x + 2] = we >> 16 & 255, A[x + 3] = we >> 24 & 255;
        C % p === 0 && O(g);
      }
      return w && (x = C << 2, we = g[k], A[x] = we & 255, w > 1 && (A[x + 1] = we >> 8 & 255), w > 2 && (A[x + 2] = we >> 16 & 255)), A;
    };
    function d(p, g, M) {
      s.call(this, p, g, M);
    }
    d.prototype = new s(), d.prototype.finalize = function() {
      return this.encode(this.outputBits, !0), s.prototype.finalize.call(this);
    };
    var O = function(p) {
      var g, M, w, k, C, A, x, we, E, D, yt, q, z, ot, H, j, lt, W, G, mt, $, K, dt, Z, Q, ct, J, X, ft, Y, ee, Tt, te, ne, bt, ae, ie, ht, se, re, gt, pe, ue, Mt, ye, oe, wt, le, me, _t, de, ce, kt, fe, Te, vt, be, he, Ye, et, tt, nt, at;
      for (w = 0; w < 48; w += 2)
        k = p[0] ^ p[10] ^ p[20] ^ p[30] ^ p[40], C = p[1] ^ p[11] ^ p[21] ^ p[31] ^ p[41], A = p[2] ^ p[12] ^ p[22] ^ p[32] ^ p[42], x = p[3] ^ p[13] ^ p[23] ^ p[33] ^ p[43], we = p[4] ^ p[14] ^ p[24] ^ p[34] ^ p[44], E = p[5] ^ p[15] ^ p[25] ^ p[35] ^ p[45], D = p[6] ^ p[16] ^ p[26] ^ p[36] ^ p[46], yt = p[7] ^ p[17] ^ p[27] ^ p[37] ^ p[47], q = p[8] ^ p[18] ^ p[28] ^ p[38] ^ p[48], z = p[9] ^ p[19] ^ p[29] ^ p[39] ^ p[49], g = q ^ (A << 1 | x >>> 31), M = z ^ (x << 1 | A >>> 31), p[0] ^= g, p[1] ^= M, p[10] ^= g, p[11] ^= M, p[20] ^= g, p[21] ^= M, p[30] ^= g, p[31] ^= M, p[40] ^= g, p[41] ^= M, g = k ^ (we << 1 | E >>> 31), M = C ^ (E << 1 | we >>> 31), p[2] ^= g, p[3] ^= M, p[12] ^= g, p[13] ^= M, p[22] ^= g, p[23] ^= M, p[32] ^= g, p[33] ^= M, p[42] ^= g, p[43] ^= M, g = A ^ (D << 1 | yt >>> 31), M = x ^ (yt << 1 | D >>> 31), p[4] ^= g, p[5] ^= M, p[14] ^= g, p[15] ^= M, p[24] ^= g, p[25] ^= M, p[34] ^= g, p[35] ^= M, p[44] ^= g, p[45] ^= M, g = we ^ (q << 1 | z >>> 31), M = E ^ (z << 1 | q >>> 31), p[6] ^= g, p[7] ^= M, p[16] ^= g, p[17] ^= M, p[26] ^= g, p[27] ^= M, p[36] ^= g, p[37] ^= M, p[46] ^= g, p[47] ^= M, g = D ^ (k << 1 | C >>> 31), M = yt ^ (C << 1 | k >>> 31), p[8] ^= g, p[9] ^= M, p[18] ^= g, p[19] ^= M, p[28] ^= g, p[29] ^= M, p[38] ^= g, p[39] ^= M, p[48] ^= g, p[49] ^= M, ot = p[0], H = p[1], oe = p[11] << 4 | p[10] >>> 28, wt = p[10] << 4 | p[11] >>> 28, X = p[20] << 3 | p[21] >>> 29, ft = p[21] << 3 | p[20] >>> 29, et = p[31] << 9 | p[30] >>> 23, tt = p[30] << 9 | p[31] >>> 23, pe = p[40] << 18 | p[41] >>> 14, ue = p[41] << 18 | p[40] >>> 14, ne = p[2] << 1 | p[3] >>> 31, bt = p[3] << 1 | p[2] >>> 31, j = p[13] << 12 | p[12] >>> 20, lt = p[12] << 12 | p[13] >>> 20, le = p[22] << 10 | p[23] >>> 22, me = p[23] << 10 | p[22] >>> 22, Y = p[33] << 13 | p[32] >>> 19, ee = p[32] << 13 | p[33] >>> 19, nt = p[42] << 2 | p[43] >>> 30, at = p[43] << 2 | p[42] >>> 30, fe = p[5] << 30 | p[4] >>> 2, Te = p[4] << 30 | p[5] >>> 2, ae = p[14] << 6 | p[15] >>> 26, ie = p[15] << 6 | p[14] >>> 26, W = p[25] << 11 | p[24] >>> 21, G = p[24] << 11 | p[25] >>> 21, _t = p[34] << 15 | p[35] >>> 17, de = p[35] << 15 | p[34] >>> 17, Tt = p[45] << 29 | p[44] >>> 3, te = p[44] << 29 | p[45] >>> 3, Z = p[6] << 28 | p[7] >>> 4, Q = p[7] << 28 | p[6] >>> 4, vt = p[17] << 23 | p[16] >>> 9, be = p[16] << 23 | p[17] >>> 9, ht = p[26] << 25 | p[27] >>> 7, se = p[27] << 25 | p[26] >>> 7, mt = p[36] << 21 | p[37] >>> 11, $ = p[37] << 21 | p[36] >>> 11, ce = p[47] << 24 | p[46] >>> 8, kt = p[46] << 24 | p[47] >>> 8, Mt = p[8] << 27 | p[9] >>> 5, ye = p[9] << 27 | p[8] >>> 5, ct = p[18] << 20 | p[19] >>> 12, J = p[19] << 20 | p[18] >>> 12, he = p[29] << 7 | p[28] >>> 25, Ye = p[28] << 7 | p[29] >>> 25, re = p[38] << 8 | p[39] >>> 24, gt = p[39] << 8 | p[38] >>> 24, K = p[48] << 14 | p[49] >>> 18, dt = p[49] << 14 | p[48] >>> 18, p[0] = ot ^ ~j & W, p[1] = H ^ ~lt & G, p[10] = Z ^ ~ct & X, p[11] = Q ^ ~J & ft, p[20] = ne ^ ~ae & ht, p[21] = bt ^ ~ie & se, p[30] = Mt ^ ~oe & le, p[31] = ye ^ ~wt & me, p[40] = fe ^ ~vt & he, p[41] = Te ^ ~be & Ye, p[2] = j ^ ~W & mt, p[3] = lt ^ ~G & $, p[12] = ct ^ ~X & Y, p[13] = J ^ ~ft & ee, p[22] = ae ^ ~ht & re, p[23] = ie ^ ~se & gt, p[32] = oe ^ ~le & _t, p[33] = wt ^ ~me & de, p[42] = vt ^ ~he & et, p[43] = be ^ ~Ye & tt, p[4] = W ^ ~mt & K, p[5] = G ^ ~$ & dt, p[14] = X ^ ~Y & Tt, p[15] = ft ^ ~ee & te, p[24] = ht ^ ~re & pe, p[25] = se ^ ~gt & ue, p[34] = le ^ ~_t & ce, p[35] = me ^ ~de & kt, p[44] = he ^ ~et & nt, p[45] = Ye ^ ~tt & at, p[6] = mt ^ ~K & ot, p[7] = $ ^ ~dt & H, p[16] = Y ^ ~Tt & Z, p[17] = ee ^ ~te & Q, p[26] = re ^ ~pe & ne, p[27] = gt ^ ~ue & bt, p[36] = _t ^ ~ce & Mt, p[37] = de ^ ~kt & ye, p[46] = et ^ ~nt & fe, p[47] = tt ^ ~at & Te, p[8] = K ^ ~ot & j, p[9] = dt ^ ~H & lt, p[18] = Tt ^ ~Z & ct, p[19] = te ^ ~Q & J, p[28] = pe ^ ~ne & ae, p[29] = ue ^ ~bt & ie, p[38] = ce ^ ~Mt & oe, p[39] = kt ^ ~ye & wt, p[48] = nt ^ ~fe & vt, p[49] = at ^ ~Te & be, p[0] ^= Oe[w], p[1] ^= Oe[w + 1];
    };
    if (_)
      i.exports = a;
    else
      for (y = 0; y < r.length; ++y)
        m[r[y]] = a[r[y]];
  })();
})(ba);
var yi = ba.exports;
const oi = /* @__PURE__ */ ya(yi);
function nn(i) {
  return "0x" + oi.keccak_256(Se(i));
}
const li = "address/5.7.0", Bt = new R(li);
function Xn(i) {
  Pe(i, 20) || Bt.throwArgumentError("invalid address", "address", i), i = i.toLowerCase();
  const e = i.substring(2).split(""), t = new Uint8Array(40);
  for (let m = 0; m < 40; m++)
    t[m] = e[m].charCodeAt(0);
  const n = Se(nn(t));
  for (let m = 0; m < 40; m += 2)
    n[m >> 1] >> 4 >= 8 && (e[m] = e[m].toUpperCase()), (n[m >> 1] & 15) >= 8 && (e[m + 1] = e[m + 1].toUpperCase());
  return "0x" + e.join("");
}
const mi = 9007199254740991;
function di(i) {
  return Math.log10 ? Math.log10(i) : Math.log(i) / Math.LN10;
}
const Fn = {};
for (let i = 0; i < 10; i++)
  Fn[String(i)] = String(i);
for (let i = 0; i < 26; i++)
  Fn[String.fromCharCode(65 + i)] = String(10 + i);
const Yn = Math.floor(di(mi));
function ci(i) {
  i = i.toUpperCase(), i = i.substring(4) + i.substring(0, 2) + "00";
  let e = i.split("").map((n) => Fn[n]).join("");
  for (; e.length >= Yn; ) {
    let n = e.substring(0, Yn);
    e = parseInt(n, 10) % 97 + e.substring(n.length);
  }
  let t = String(98 - parseInt(e, 10) % 97);
  for (; t.length < 2; )
    t = "0" + t;
  return t;
}
function Cn(i) {
  let e = null;
  if (typeof i != "string" && Bt.throwArgumentError("invalid address", "address", i), i.match(/^(0x)?[0-9a-fA-F]{40}$/))
    i.substring(0, 2) !== "0x" && (i = "0x" + i), e = Xn(i), i.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && e !== i && Bt.throwArgumentError("bad address checksum", "address", i);
  else if (i.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
    for (i.substring(2, 4) !== ci(i) && Bt.throwArgumentError("bad icap checksum", "address", i), e = ei(i.substring(4)); e.length < 40; )
      e = "0" + e;
    e = Xn("0x" + e);
  } else
    Bt.throwArgumentError("invalid address", "address", i);
  return e;
}
class fi extends Je {
  constructor(e) {
    super("address", "address", e, !1);
  }
  defaultValue() {
    return "0x0000000000000000000000000000000000000000";
  }
  encode(e, t) {
    try {
      t = Cn(t);
    } catch (n) {
      this._throwError(n.message, t);
    }
    return e.writeValue(t);
  }
  decode(e) {
    return Cn(la(e.readValue().toHexString(), 20));
  }
}
class Ti extends Je {
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
const Ct = new R(Wt);
function ha(i, e, t) {
  let n = null;
  if (Array.isArray(t))
    n = t;
  else if (t && typeof t == "object") {
    let v = {};
    n = e.map((I) => {
      const S = I.localName;
      return S || Ct.throwError("cannot encode object for signature with missing names", R.errors.INVALID_ARGUMENT, {
        argument: "values",
        coder: I,
        value: t
      }), v[S] && Ct.throwError("cannot encode object for signature with duplicate names", R.errors.INVALID_ARGUMENT, {
        argument: "values",
        coder: I,
        value: t
      }), v[S] = !0, t[S];
    });
  } else
    Ct.throwArgumentError("invalid tuple value", "tuple", t);
  e.length !== n.length && Ct.throwArgumentError("types/value length mismatch", "tuple", t);
  let m = new En(i.wordSize), u = new En(i.wordSize), f = [];
  e.forEach((v, I) => {
    let S = n[I];
    if (v.dynamic) {
      let N = u.length;
      v.encode(u, S);
      let F = m.writeUpdatableValue();
      f.push((V) => {
        F(V + N);
      });
    } else
      v.encode(m, S);
  }), f.forEach((v) => {
    v(m.length);
  });
  let _ = i.appendWriter(m);
  return _ += i.appendWriter(u), _;
}
function ga(i, e) {
  let t = [], n = i.subReader(0);
  e.forEach((u) => {
    let f = null;
    if (u.dynamic) {
      let _ = i.readValue(), v = n.subReader(_.toNumber());
      try {
        f = u.decode(v);
      } catch (I) {
        if (I.code === R.errors.BUFFER_OVERRUN)
          throw I;
        f = I, f.baseType = u.name, f.name = u.localName, f.type = u.type;
      }
    } else
      try {
        f = u.decode(i);
      } catch (_) {
        if (_.code === R.errors.BUFFER_OVERRUN)
          throw _;
        f = _, f.baseType = u.name, f.name = u.localName, f.type = u.type;
      }
    f != null && t.push(f);
  });
  const m = e.reduce((u, f) => {
    const _ = f.localName;
    return _ && (u[_] || (u[_] = 0), u[_]++), u;
  }, {});
  e.forEach((u, f) => {
    let _ = u.localName;
    if (!_ || m[_] !== 1 || (_ === "length" && (_ = "_length"), t[_] != null))
      return;
    const v = t[f];
    v instanceof Error ? Object.defineProperty(t, _, {
      enumerable: !0,
      get: () => {
        throw v;
      }
    }) : t[_] = v;
  });
  for (let u = 0; u < t.length; u++) {
    const f = t[u];
    f instanceof Error && Object.defineProperty(t, u, {
      enumerable: !0,
      get: () => {
        throw f;
      }
    });
  }
  return Object.freeze(t);
}
class bi extends Je {
  constructor(e, t, n) {
    const m = e.type + "[" + (t >= 0 ? t : "") + "]", u = t === -1 || e.dynamic;
    super("array", m, n, u), this.coder = e, this.length = t;
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
    n === -1 && (n = t.length, e.writeValue(t.length)), Ct.checkArgumentCount(t.length, n, "coder array" + (this.localName ? " " + this.localName : ""));
    let m = [];
    for (let u = 0; u < t.length; u++)
      m.push(this.coder);
    return ha(e, m, t);
  }
  decode(e) {
    let t = this.length;
    t === -1 && (t = e.readValue().toNumber(), t * 32 > e._data.length && Ct.throwError("insufficient data length", R.errors.BUFFER_OVERRUN, {
      length: e._data.length,
      count: t
    }));
    let n = [];
    for (let m = 0; m < t; m++)
      n.push(new Ti(this.coder));
    return e.coerce(this.name, ga(e, n));
  }
}
class hi extends Je {
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
class Ma extends Je {
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
class gi extends Ma {
  constructor(e) {
    super("bytes", e);
  }
  decode(e) {
    return e.coerce(this.name, ke(super.decode(e)));
  }
}
class Mi extends Je {
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
class wi extends Je {
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
const _i = /* @__PURE__ */ ge.from(-1), ki = /* @__PURE__ */ ge.from(0), vi = /* @__PURE__ */ ge.from(1), Ii = /* @__PURE__ */ ge.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
class xi extends Je {
  constructor(e, t, n) {
    const m = (t ? "int" : "uint") + e * 8;
    super(m, m, n, !1), this.size = e, this.signed = t;
  }
  defaultValue() {
    return 0;
  }
  encode(e, t) {
    let n = ge.from(t), m = Ii.mask(e.wordSize * 8);
    if (this.signed) {
      let u = m.mask(this.size * 8 - 1);
      (n.gt(u) || n.lt(u.add(vi).mul(_i))) && this._throwError("value out-of-bounds", t);
    } else
      (n.lt(ki) || n.gt(m.mask(this.size * 8))) && this._throwError("value out-of-bounds", t);
    return n = n.toTwos(this.size * 8).mask(this.size * 8), this.signed && (n = n.fromTwos(this.size * 8).toTwos(8 * e.wordSize)), e.writeValue(n);
  }
  decode(e) {
    let t = e.readValue().mask(this.size * 8);
    return this.signed && (t = t.fromTwos(this.size * 8)), e.coerce(this.name, t);
  }
}
const Ai = "strings/5.7.0", wa = new R(Ai);
var an;
(function(i) {
  i.current = "", i.NFC = "NFC", i.NFD = "NFD", i.NFKC = "NFKC", i.NFKD = "NFKD";
})(an || (an = {}));
var Re;
(function(i) {
  i.UNEXPECTED_CONTINUE = "unexpected continuation byte", i.BAD_PREFIX = "bad codepoint prefix", i.OVERRUN = "string overrun", i.MISSING_CONTINUE = "missing continuation byte", i.OUT_OF_RANGE = "out of UTF-8 range", i.UTF16_SURROGATE = "UTF-16 surrogate", i.OVERLONG = "overlong representation";
})(Re || (Re = {}));
function Ei(i, e, t, n, m) {
  return wa.throwArgumentError(`invalid codepoint at offset ${e}; ${i}`, "bytes", t);
}
function _a(i, e, t, n, m) {
  if (i === Re.BAD_PREFIX || i === Re.UNEXPECTED_CONTINUE) {
    let u = 0;
    for (let f = e + 1; f < t.length && t[f] >> 6 === 2; f++)
      u++;
    return u;
  }
  return i === Re.OVERRUN ? t.length - e - 1 : 0;
}
function Ci(i, e, t, n, m) {
  return i === Re.OVERLONG ? (n.push(m), 0) : (n.push(65533), _a(i, e, t));
}
const Si = Object.freeze({
  error: Ei,
  ignore: _a,
  replace: Ci
});
function Oi(i, e) {
  e == null && (e = Si.error), i = Se(i);
  const t = [];
  let n = 0;
  for (; n < i.length; ) {
    const m = i[n++];
    if (!(m >> 7)) {
      t.push(m);
      continue;
    }
    let u = null, f = null;
    if ((m & 224) === 192)
      u = 1, f = 127;
    else if ((m & 240) === 224)
      u = 2, f = 2047;
    else if ((m & 248) === 240)
      u = 3, f = 65535;
    else {
      (m & 192) === 128 ? n += e(Re.UNEXPECTED_CONTINUE, n - 1, i, t) : n += e(Re.BAD_PREFIX, n - 1, i, t);
      continue;
    }
    if (n - 1 + u >= i.length) {
      n += e(Re.OVERRUN, n - 1, i, t);
      continue;
    }
    let _ = m & (1 << 8 - u - 1) - 1;
    for (let v = 0; v < u; v++) {
      let I = i[n];
      if ((I & 192) != 128) {
        n += e(Re.MISSING_CONTINUE, n, i, t), _ = null;
        break;
      }
      _ = _ << 6 | I & 63, n++;
    }
    if (_ !== null) {
      if (_ > 1114111) {
        n += e(Re.OUT_OF_RANGE, n - 1 - u, i, t, _);
        continue;
      }
      if (_ >= 55296 && _ <= 57343) {
        n += e(Re.UTF16_SURROGATE, n - 1 - u, i, t, _);
        continue;
      }
      if (_ <= f) {
        n += e(Re.OVERLONG, n - 1 - u, i, t, _);
        continue;
      }
      t.push(_);
    }
  }
  return t;
}
function ka(i, e = an.current) {
  e != an.current && (wa.checkNormalize(), i = i.normalize(e));
  let t = [];
  for (let n = 0; n < i.length; n++) {
    const m = i.charCodeAt(n);
    if (m < 128)
      t.push(m);
    else if (m < 2048)
      t.push(m >> 6 | 192), t.push(m & 63 | 128);
    else if ((m & 64512) == 55296) {
      n++;
      const u = i.charCodeAt(n);
      if (n >= i.length || (u & 64512) !== 56320)
        throw new Error("invalid utf-8 string");
      const f = 65536 + ((m & 1023) << 10) + (u & 1023);
      t.push(f >> 18 | 240), t.push(f >> 12 & 63 | 128), t.push(f >> 6 & 63 | 128), t.push(f & 63 | 128);
    } else
      t.push(m >> 12 | 224), t.push(m >> 6 & 63 | 128), t.push(m & 63 | 128);
  }
  return Se(t);
}
function Ri(i) {
  return i.map((e) => e <= 65535 ? String.fromCharCode(e) : (e -= 65536, String.fromCharCode((e >> 10 & 1023) + 55296, (e & 1023) + 56320))).join("");
}
function Ni(i, e) {
  return Ri(Oi(i, e));
}
class Di extends Ma {
  constructor(e) {
    super("string", e);
  }
  defaultValue() {
    return "";
  }
  encode(e, t) {
    return super.encode(e, ka(t));
  }
  decode(e) {
    return Ni(super.decode(e));
  }
}
class Kt extends Je {
  constructor(e, t) {
    let n = !1;
    const m = [];
    e.forEach((f) => {
      f.dynamic && (n = !0), m.push(f.type);
    });
    const u = "tuple(" + m.join(",") + ")";
    super("tuple", u, t, n), this.coders = e;
  }
  defaultValue() {
    const e = [];
    this.coders.forEach((n) => {
      e.push(n.defaultValue());
    });
    const t = this.coders.reduce((n, m) => {
      const u = m.localName;
      return u && (n[u] || (n[u] = 0), n[u]++), n;
    }, {});
    return this.coders.forEach((n, m) => {
      let u = n.localName;
      !u || t[u] !== 1 || (u === "length" && (u = "_length"), e[u] == null && (e[u] = e[m]));
    }), Object.freeze(e);
  }
  encode(e, t) {
    return ha(e, this.coders, t);
  }
  decode(e) {
    return e.coerce(this.name, ga(e, this.coders));
  }
}
const Zt = new R(Wt), Fi = new RegExp(/^bytes([0-9]*)$/), Pi = new RegExp(/^(u?int)([0-9]*)$/);
class Li {
  constructor(e) {
    Ie(this, "coerceFunc", e || null);
  }
  _getCoder(e) {
    switch (e.baseType) {
      case "address":
        return new fi(e.name);
      case "bool":
        return new hi(e.name);
      case "string":
        return new Di(e.name);
      case "bytes":
        return new gi(e.name);
      case "array":
        return new bi(this._getCoder(e.arrayChildren), e.arrayLength, e.name);
      case "tuple":
        return new Kt((e.components || []).map((n) => this._getCoder(n)), e.name);
      case "":
        return new wi(e.name);
    }
    let t = e.type.match(Pi);
    if (t) {
      let n = parseInt(t[2] || "256");
      return (n === 0 || n > 256 || n % 8 !== 0) && Zt.throwArgumentError("invalid " + t[1] + " bit length", "param", e), new xi(n / 8, t[1] === "int", e.name);
    }
    if (t = e.type.match(Fi), t) {
      let n = parseInt(t[1]);
      return (n === 0 || n > 32) && Zt.throwArgumentError("invalid bytes length", "param", e), new Mi(n, e.name);
    }
    return Zt.throwArgumentError("invalid type", "type", e.type);
  }
  _getWordSize() {
    return 32;
  }
  _getReader(e, t) {
    return new tn(e, this._getWordSize(), this.coerceFunc, t);
  }
  _getWriter() {
    return new En(this._getWordSize());
  }
  getDefaultValue(e) {
    const t = e.map((m) => this._getCoder(ve.from(m)));
    return new Kt(t, "_").defaultValue();
  }
  encode(e, t) {
    e.length !== t.length && Zt.throwError("types/values length mismatch", R.errors.INVALID_ARGUMENT, {
      count: { types: e.length, values: t.length },
      value: { types: e, values: t }
    });
    const n = e.map((f) => this._getCoder(ve.from(f))), m = new Kt(n, "_"), u = this._getWriter();
    return m.encode(u, t), u.data;
  }
  decode(e, t, n) {
    const m = e.map((f) => this._getCoder(ve.from(f)));
    return new Kt(m, "_").decode(this._getReader(Se(t), n));
  }
}
const Bi = new Li();
function Qt(i) {
  return nn(ka(i));
}
const _e = new R(Wt);
class Ui extends sn {
}
class Vi extends sn {
}
class qi extends sn {
}
class ea extends sn {
  static isIndexed(e) {
    return !!(e && e._isIndexed);
  }
}
const zi = {
  "0x08c379a0": { signature: "Error(string)", name: "Error", inputs: ["string"], reason: !0 },
  "0x4e487b71": { signature: "Panic(uint256)", name: "Panic", inputs: ["uint256"] }
};
function ta(i, e) {
  const t = new Error(`deferred error during ABI decoding triggered accessing ${i}`);
  return t.error = e, t;
}
class Hi {
  constructor(e) {
    let t = [];
    typeof e == "string" ? t = JSON.parse(e) : t = e, Ie(this, "fragments", t.map((n) => Ze.from(n)).filter((n) => n != null)), Ie(this, "_abiCoder", Gt(new.target, "getAbiCoder")()), Ie(this, "functions", {}), Ie(this, "errors", {}), Ie(this, "events", {}), Ie(this, "structs", {}), this.fragments.forEach((n) => {
      let m = null;
      switch (n.type) {
        case "constructor":
          if (this.deploy) {
            _e.warn("duplicate definition - constructor");
            return;
          }
          Ie(this, "deploy", n);
          return;
        case "function":
          m = this.functions;
          break;
        case "event":
          m = this.events;
          break;
        case "error":
          m = this.errors;
          break;
        default:
          return;
      }
      let u = n.format();
      if (m[u]) {
        _e.warn("duplicate definition - " + u);
        return;
      }
      m[u] = n;
    }), this.deploy || Ie(this, "deploy", Ue.from({
      payable: !1,
      type: "constructor"
    })), Ie(this, "_isInterface", !0);
  }
  format(e) {
    e || (e = B.full), e === B.sighash && _e.throwArgumentError("interface does not support formatting sighash", "format", e);
    const t = this.fragments.map((n) => n.format(e));
    return e === B.json ? JSON.stringify(t.map((n) => JSON.parse(n))) : t;
  }
  // Sub-classes can override these to handle other blockchains
  static getAbiCoder() {
    return Bi;
  }
  static getAddress(e) {
    return Cn(e);
  }
  static getSighash(e) {
    return Ja(Qt(e.format()), 0, 4);
  }
  static getEventTopic(e) {
    return Qt(e.format());
  }
  // Find a function definition by any means necessary (unless it is ambiguous)
  getFunction(e) {
    if (Pe(e)) {
      for (const n in this.functions)
        if (e === this.getSighash(n))
          return this.functions[n];
      _e.throwArgumentError("no matching function", "sighash", e);
    }
    if (e.indexOf("(") === -1) {
      const n = e.trim(), m = Object.keys(this.functions).filter((u) => u.split(
        "("
        /* fix:) */
      )[0] === n);
      return m.length === 0 ? _e.throwArgumentError("no matching function", "name", n) : m.length > 1 && _e.throwArgumentError("multiple matching functions", "name", n), this.functions[m[0]];
    }
    const t = this.functions[Ve.fromString(e).format()];
    return t || _e.throwArgumentError("no matching function", "signature", e), t;
  }
  // Find an event definition by any means necessary (unless it is ambiguous)
  getEvent(e) {
    if (Pe(e)) {
      const n = e.toLowerCase();
      for (const m in this.events)
        if (n === this.getEventTopic(m))
          return this.events[m];
      _e.throwArgumentError("no matching event", "topichash", n);
    }
    if (e.indexOf("(") === -1) {
      const n = e.trim(), m = Object.keys(this.events).filter((u) => u.split(
        "("
        /* fix:) */
      )[0] === n);
      return m.length === 0 ? _e.throwArgumentError("no matching event", "name", n) : m.length > 1 && _e.throwArgumentError("multiple matching events", "name", n), this.events[m[0]];
    }
    const t = this.events[$e.fromString(e).format()];
    return t || _e.throwArgumentError("no matching event", "signature", e), t;
  }
  // Find a function definition by any means necessary (unless it is ambiguous)
  getError(e) {
    if (Pe(e)) {
      const n = Gt(this.constructor, "getSighash");
      for (const m in this.errors) {
        const u = this.errors[m];
        if (e === n(u))
          return this.errors[m];
      }
      _e.throwArgumentError("no matching error", "sighash", e);
    }
    if (e.indexOf("(") === -1) {
      const n = e.trim(), m = Object.keys(this.errors).filter((u) => u.split(
        "("
        /* fix:) */
      )[0] === n);
      return m.length === 0 ? _e.throwArgumentError("no matching error", "name", n) : m.length > 1 && _e.throwArgumentError("multiple matching errors", "name", n), this.errors[m[0]];
    }
    const t = this.errors[Ve.fromString(e).format()];
    return t || _e.throwArgumentError("no matching error", "signature", e), t;
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
    return Gt(this.constructor, "getSighash")(e);
  }
  // Get the topic (the bytes32 hash) used by Solidity to identify an event
  getEventTopic(e) {
    return typeof e == "string" && (e = this.getEvent(e)), Gt(this.constructor, "getEventTopic")(e);
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
    return ke(n.slice(0, 4)) !== this.getSighash(e) && _e.throwArgumentError(`data signature does not match error ${e.name}.`, "data", ke(n)), this._decodeParams(e.inputs, n.slice(4));
  }
  encodeErrorResult(e, t) {
    return typeof e == "string" && (e = this.getError(e)), ke(St([
      this.getSighash(e),
      this._encodeParams(e.inputs, t || [])
    ]));
  }
  // Decode the data for a function call (e.g. tx.data)
  decodeFunctionData(e, t) {
    typeof e == "string" && (e = this.getFunction(e));
    const n = Se(t);
    return ke(n.slice(0, 4)) !== this.getSighash(e) && _e.throwArgumentError(`data signature does not match function ${e.name}.`, "data", ke(n)), this._decodeParams(e.inputs, n.slice(4));
  }
  // Encode the data for a function call (e.g. tx.data)
  encodeFunctionData(e, t) {
    return typeof e == "string" && (e = this.getFunction(e)), ke(St([
      this.getSighash(e),
      this._encodeParams(e.inputs, t || [])
    ]));
  }
  // Decode the result from a function call (e.g. from eth_call)
  decodeFunctionResult(e, t) {
    typeof e == "string" && (e = this.getFunction(e));
    let n = Se(t), m = null, u = "", f = null, _ = null, v = null;
    switch (n.length % this._abiCoder._getWordSize()) {
      case 0:
        try {
          return this._abiCoder.decode(e.outputs, n);
        } catch {
        }
        break;
      case 4: {
        const I = ke(n.slice(0, 4)), S = zi[I];
        if (S)
          f = this._abiCoder.decode(S.inputs, n.slice(4)), _ = S.name, v = S.signature, S.reason && (m = f[0]), _ === "Error" ? u = `; VM Exception while processing transaction: reverted with reason string ${JSON.stringify(f[0])}` : _ === "Panic" && (u = `; VM Exception while processing transaction: reverted with panic code ${f[0]}`);
        else
          try {
            const N = this.getError(I);
            f = this._abiCoder.decode(N.inputs, n.slice(4)), _ = N.name, v = N.format();
          } catch {
          }
        break;
      }
    }
    return _e.throwError("call revert exception" + u, R.errors.CALL_EXCEPTION, {
      method: e.format(),
      data: ke(t),
      errorArgs: f,
      errorName: _,
      errorSignature: v,
      reason: m
    });
  }
  // Encode the result for a function call (e.g. for eth_call)
  encodeFunctionResult(e, t) {
    return typeof e == "string" && (e = this.getFunction(e)), ke(this._abiCoder.encode(e.outputs, t || []));
  }
  // Create the filter for the event with search criteria (e.g. for eth_filterLog)
  encodeFilterTopics(e, t) {
    typeof e == "string" && (e = this.getEvent(e)), t.length > e.inputs.length && _e.throwError("too many arguments for " + e.format(), R.errors.UNEXPECTED_ARGUMENT, {
      argument: "values",
      value: t
    });
    let n = [];
    e.anonymous || n.push(this.getEventTopic(e));
    const m = (u, f) => u.type === "string" ? Qt(f) : u.type === "bytes" ? nn(ke(f)) : (u.type === "bool" && typeof f == "boolean" && (f = f ? "0x01" : "0x00"), u.type.match(/^u?int/) && (f = ge.from(f).toHexString()), u.type === "address" && this._abiCoder.encode(["address"], [f]), la(ke(f), 32));
    for (t.forEach((u, f) => {
      let _ = e.inputs[f];
      if (!_.indexed) {
        u != null && _e.throwArgumentError("cannot filter non-indexed parameters; must be null", "contract." + _.name, u);
        return;
      }
      u == null ? n.push(null) : _.baseType === "array" || _.baseType === "tuple" ? _e.throwArgumentError("filtering with tuples or arrays not supported", "contract." + _.name, u) : Array.isArray(u) ? n.push(u.map((v) => m(_, v))) : n.push(m(_, u));
    }); n.length && n[n.length - 1] === null; )
      n.pop();
    return n;
  }
  encodeEventLog(e, t) {
    typeof e == "string" && (e = this.getEvent(e));
    const n = [], m = [], u = [];
    return e.anonymous || n.push(this.getEventTopic(e)), t.length !== e.inputs.length && _e.throwArgumentError("event arguments/values mismatch", "values", t), e.inputs.forEach((f, _) => {
      const v = t[_];
      if (f.indexed)
        if (f.type === "string")
          n.push(Qt(v));
        else if (f.type === "bytes")
          n.push(nn(v));
        else {
          if (f.baseType === "tuple" || f.baseType === "array")
            throw new Error("not implemented");
          n.push(this._abiCoder.encode([f.type], [v]));
        }
      else
        m.push(f), u.push(v);
    }), {
      data: this._abiCoder.encode(m, u),
      topics: n
    };
  }
  // Decode a filter for the event and the search criteria
  decodeEventLog(e, t, n) {
    if (typeof e == "string" && (e = this.getEvent(e)), n != null && !e.anonymous) {
      let F = this.getEventTopic(e);
      (!Pe(n[0], 32) || n[0].toLowerCase() !== F) && _e.throwError("fragment/topic mismatch", R.errors.INVALID_ARGUMENT, { argument: "topics[0]", expected: F, value: n[0] }), n = n.slice(1);
    }
    let m = [], u = [], f = [];
    e.inputs.forEach((F, V) => {
      F.indexed ? F.type === "string" || F.type === "bytes" || F.baseType === "tuple" || F.baseType === "array" ? (m.push(ve.fromObject({ type: "bytes32", name: F.name })), f.push(!0)) : (m.push(F), f.push(!1)) : (u.push(F), f.push(!1));
    });
    let _ = n != null ? this._abiCoder.decode(m, St(n)) : null, v = this._abiCoder.decode(u, t, !0), I = [], S = 0, N = 0;
    e.inputs.forEach((F, V) => {
      if (F.indexed)
        if (_ == null)
          I[V] = new ea({ _isIndexed: !0, hash: null });
        else if (f[V])
          I[V] = new ea({ _isIndexed: !0, hash: _[N++] });
        else
          try {
            I[V] = _[N++];
          } catch (U) {
            I[V] = U;
          }
      else
        try {
          I[V] = v[S++];
        } catch (U) {
          I[V] = U;
        }
      if (F.name && I[F.name] == null) {
        const U = I[V];
        U instanceof Error ? Object.defineProperty(I, F.name, {
          enumerable: !0,
          get: () => {
            throw ta(`property ${JSON.stringify(F.name)}`, U);
          }
        }) : I[F.name] = U;
      }
    });
    for (let F = 0; F < I.length; F++) {
      const V = I[F];
      V instanceof Error && Object.defineProperty(I, F, {
        enumerable: !0,
        get: () => {
          throw ta(`index ${F}`, V);
        }
      });
    }
    return Object.freeze(I);
  }
  // Given a transaction, find the matching function fragment (if any) and
  // determine all its properties and call parameters
  parseTransaction(e) {
    let t = this.getFunction(e.data.substring(0, 10).toLowerCase());
    return t ? new Vi({
      args: this._abiCoder.decode(t.inputs, "0x" + e.data.substring(10)),
      functionFragment: t,
      name: t.name,
      signature: t.format(),
      sighash: this.getSighash(t),
      value: ge.from(e.value || "0")
    }) : null;
  }
  // @TODO
  //parseCallResult(data: BytesLike): ??
  // Given an event log, find the matching event fragment (if any) and
  // determine all its properties and values
  parseLog(e) {
    let t = this.getEvent(e.topics[0]);
    return !t || t.anonymous ? null : new Ui({
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
    return n ? new qi({
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
const ji = [
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
new Hi(ji);
const na = (i) => Number.isSafeInteger(i) && i > 0 && i <= qa.MAX_SAFE_CHAIN_ID, va = (i) => {
  if (typeof i == "number")
    return { valid: na(i), chainId: i };
  if (typeof i == "string")
    try {
      let e;
      return i.toLowerCase().startsWith("0x") ? e = parseInt(i, 16) : e = parseInt(i, 10), {
        valid: na(e),
        chainId: e
      };
    } catch {
      return { valid: !1, chainId: 0 };
    }
  return { valid: !1, chainId: i };
}, aa = (i) => {
  if (!i)
    return "1";
  const { chainId: e, valid: t } = va(i);
  return t ? `${e}` : "1";
}, ia = () => {
  var t;
  const i = window, e = (t = i.foxwallet) == null ? void 0 : t.ethereum;
  if (e instanceof Rt)
    return e;
  if (i.ethereum instanceof Rt)
    return i.ethereum;
};
class Rt extends On {
  constructor() {
    super(qe.ETH);
    xe(this, "address", null);
    xe(this, "ready");
    xe(this, "_chainId");
    xe(this, "isDebug");
    this._setInitialChainId();
  }
  _setInitialChainId() {
    this._getGlobalChainId().then((t) => {
      const n = aa(t ?? "0x1");
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
    const t = aa(this._chainId ?? "0x1");
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
    let n = this;
    if (this instanceof Rt || (n = ia()), !n)
      throw new Ke(4900, "FoxWallet provider is not available.");
    return n._request(t);
  }
  _wrapResult(t, n) {
    let m = { jsonrpc: "2.0", id: t.id };
    return n !== null && typeof n == "object" && n.jsonrpc && n.result ? m.result = n.result : m.result = n, m;
  }
  async _request(t) {
    switch (t.method) {
      case "eth_requestAccounts":
        return this.eth_requestAccounts(t);
      case "eth_accounts":
        return this.eth_accounts(t);
      case "eth_getBalance":
        return this.eth_getBalance(t);
      case "eth_coinbase":
        return this.eth_coinbase(t);
      case "net_version":
        return this.net_version(t);
      case "eth_chainId":
        return this.eth_chainId(t);
      case "eth_sign":
        throw new Ke(
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
        throw new Ke(
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
    let m = this;
    if (this instanceof Rt || (m = ia()), !m) {
      n(new Ke(4900, "FoxWallet provider is not available."));
      return;
    }
    Array.isArray(t) ? Promise.all(
      t.map(
        (u) => m._request(u).then((f) => n(null, m._wrapResult(u, f))).catch((f) => n(f, null))
      )
    ) : m._request(t).then((u) => n(null, m._wrapResult(t, u))).catch((u) => n(u, null));
  }
  async eth_getBalance(t) {
    return this.send("eth_getBalance", t);
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
    let m = { jsonrpc: "2.0", id: t };
    return n !== null && typeof n == "object" && n.jsonrpc && n.result ? m.result = n.result : m.result = n, m;
  }
  send(t, n) {
    return super.send(t, n, {
      network: this.chainId
    });
  }
  emit(t, n) {
    switch (super.emit(t, n), console.log("eth emit", t, n), t) {
      case "chainChanged":
        typeof n == "string" && n && (this._chainId = n, this._setGlobalChainId(n).catch((m) => {
          console.log("_setGlobalChainId", m);
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
    const { detail: n } = t, { type: m, coinType: u, event: f, data: _ } = n;
    u === qe.ETH && this.emit(f, _);
  }
}
const sa = {
  SVG_ICON: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCA5MDAgOTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjkwMCIgcng9IjQ1MCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01NzcuMjQ5IDIxNS45NzVDNTM5Ljk1NiAxOTYuMjMyIDUxMS42NDYgMTYxLjU0OSA1MDAuNDY4IDExOS44NjhDNDk3LjAyMSAxMzIuNjEzIDQ5NS4yNDUgMTQ1Ljk4NCA0OTUuMjQ1IDE1OS43NzRDNDk1LjI0NSAxNzAuNTMzIDQ5Ni4zOTQgMTgwLjk4IDQ5OC40ODMgMTkxLjExM0M0OTguNDgzIDE5MS4xMTMgNDk4LjQ4MyAxOTEuMTEzIDQ5OC40ODMgMTkxLjIxN0M0OTguNDgzIDE5MS4zMjIgNDk4LjU4OCAxOTEuNTMxIDQ5OC41ODggMTkxLjYzNUM1MDEuNDA4IDIwNS4yMTYgNTA2LjAwNSAyMTguMDY1IDUxMi4xNjggMjI5Ljk3NEM0OTkuMDA2IDIyMC4yNTggNDg3LjMwNiAyMDguNjYzIDQ3Ny40ODYgMTk1LjYwNUM0NjQuMzIzIDI5Ny42NjcgNTAxLjQwOCA0MDMuOTA3IDU2OS4yMDYgNDczLjg5OEM2NTcuNjg3IDU3Ni45IDU3Ni4xIDc1MS42NjkgNDM4LjIwNyA3NDcuMDczQzI0My4wNjggNzQ4Ljc0NCAyMDkuNjM5IDQ2MS4zNjIgMzk2LjgzOSA0MTYuMjM0TDM5Ni43MzUgNDE1LjcxMUM0NDYuNjY5IDM5OS41MTkgNDcwLjA2OSAzNjcuMDMxIDQ3NC4xNDMgMzI0LjgyN0M0MDIuMDYzIDM4My4yMjMgMjg4LjE5NiAzMTAuODI5IDMxMS44MDUgMjIwLjE1NEM0MS4yNDI1IDM1My4zNDYgMTQxLjczNyA3ODUuNDExIDQ0OC40NDUgNzgwLjA4M0M1ODIuMDU1IDc4MC4wODMgNjk1LjA4NSA2OTEuNzA2IDczMi4xNyA1NzAuMjE0Qzc3Ni40NjMgNDI4LjU2MSA3MDQuOCAyNzcuNjA5IDU3Ny4yNDkgMjE1Ljk3NVoiIGZpbGw9IiMxMkZFNzQiLz4KPC9zdmc+Cg==",
  EIP6963_UUID: "8e014263-cedf-54f2-a932-ec940b52f9c3"
}, ra = (i) => {
  if (!i)
    return "81";
  const { chainId: e, valid: t } = va(i);
  return t ? `${e}` : "81";
}, pa = () => {
  var t;
  const i = window, e = (t = i.foxwallet) == null ? void 0 : t.qtum;
  if (e instanceof Nt)
    return e;
  if (i.qtum instanceof Nt)
    return i.qtum;
};
class Nt extends On {
  constructor() {
    super(qe.QTUM);
    xe(this, "address", null);
    xe(this, "ready");
    xe(this, "_chainId");
    xe(this, "isDebug");
    this._setInitialChainId();
  }
  _setInitialChainId() {
    this._getGlobalChainId().then((t) => {
      const n = ra(t ?? "0x51");
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
    const t = ra(this._chainId ?? "0x51");
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
    var t;
    return (t = this.address) == null ? void 0 : t.evmAddress;
  }
  request(t) {
    console.log("====>qtumProvider request", t);
    let n = this;
    if (this instanceof Nt || (n = pa()), !n)
      throw new Ke(4900, "FoxWallet provider is not available.");
    return n._request(t);
  }
  _wrapResult(t, n) {
    let m = { jsonrpc: "2.0", id: t.id };
    return n !== null && typeof n == "object" && n.jsonrpc && n.result ? m.result = n.result : m.result = n, m;
  }
  async _request(t) {
    switch (t.method) {
      case "eth_requestAccounts":
        return this.eth_requestAccounts(t);
      case "eth_accounts":
        return this.eth_accounts(t);
      case "eth_getBalance":
        return this.eth_getBalance(t);
      case "eth_coinbase":
        return this.eth_coinbase(t);
      case "net_version":
        return this.net_version(t);
      case "eth_chainId":
        return this.eth_chainId(t);
      case "eth_sign":
        throw new Ke(
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
        throw new Ke(
          4200,
          `Fox does not support calling ${t.method}. Please use your own solution`
        );
      default: {
        console.log("unhandled", t), t.jsonrpc = "2.0";
        const n = await this.proxyRPCCall(t);
        return console.log(`<== rpc response ${JSON.stringify(n)}`), n == null ? void 0 : n.result;
      }
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
      "sendAsync(data, callback) is deprecated, please use window.qtum.request(data) instead."
    );
    let m = this;
    if (this instanceof Nt || (m = pa()), !m) {
      n(new Ke(4900, "FoxWallet provider is not available."));
      return;
    }
    Array.isArray(t) ? Promise.all(
      t.map(
        (u) => m._request(u).then((f) => n(null, m._wrapResult(u, f))).catch((f) => n(f, null))
      )
    ) : m._request(t).then((u) => n(null, m._wrapResult(t, u))).catch((u) => n(u, null));
  }
  async eth_getBalance(t) {
    return this.send("eth_getBalance", t);
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
    let m = { jsonrpc: "2.0", id: t };
    return n !== null && typeof n == "object" && n.jsonrpc && n.result ? m.result = n.result : m.result = n, m;
  }
  send(t, n) {
    return super.send(t, n, {
      network: this.chainId
    });
  }
  emit(t, n) {
    switch (super.emit(t, n), console.log("qtum emit", t, n), t) {
      case "chainChanged":
        typeof n == "string" && n && (this._chainId = n, this._setGlobalChainId(n).catch((m) => {
          console.log("_setGlobalChainId", m);
        })), this.emit("disconnect", void 0);
        break;
      case "networkChanged":
        this.emit("disconnect", void 0);
        break;
      case "accountsChanged":
        typeof (n == null ? void 0 : n[0]) == "string" && (n != null && n[0]);
        break;
      case "connect":
        typeof (n == null ? void 0 : n.chainId) == "string" && (n != null && n.chainId) && (this._chainId = n.chainId);
        break;
      case "disconnect":
        this.address = null;
        break;
    }
  }
  onDappEmit(t) {
    const { detail: n } = t, { type: m, coinType: u, event: f, data: _ } = n;
    u === qe.QTUM && this.emit(f, _);
  }
}
const Ia = new Va(), Pn = new Rt(), xa = new Nt(), st = window, Wi = (i, e) => {
  let t = i;
  for (; t; ) {
    const n = Object.getOwnPropertyDescriptor(t, e);
    if (n)
      return n;
    t = Object.getPrototypeOf(t);
  }
}, Aa = (i, e) => {
  var t;
  try {
    const n = Wi(st, i);
    if (n && "value" in n && n.value || n != null && n.get && n.get.call(st) || n && !n.writable && !n.set)
      return;
    if (!n || n.writable) {
      st[i] = e;
      return;
    }
    (t = n.set) == null || t.call(st, e);
  } catch {
  }
};
st.foxwallet = {
  aleo: Ia,
  ethereum: Pn,
  qtum: xa
};
try {
  st.aleo = Ia;
} catch {
}
Aa("ethereum", Pn);
Aa("qtum", xa);
try {
  Object.freeze(st.foxwallet), Object.seal(st.aleo);
} catch {
}
const Gi = {
  uuid: sa.EIP6963_UUID,
  name: "FoxWallet",
  icon: sa.SVG_ICON,
  rdns: "com.foxwallet"
}, $i = Object.freeze({ info: Gi, provider: Pn });
function Ea() {
  window.dispatchEvent(
    new CustomEvent("eip6963:announceProvider", {
      detail: $i
    })
  );
}
window.addEventListener("eip6963:requestProvider", (i) => {
  Ea();
});
Ea();
