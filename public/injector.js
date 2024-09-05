var v = Object.defineProperty;
var S = (s, e, t) => e in s ? v(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var f = (s, e, t) => (S(s, typeof e != "symbol" ? e + "" : e, t), t), y = (s, e, t) => {
  if (!e.has(s))
    throw TypeError("Cannot " + t);
};
var a = (s, e, t) => (y(s, e, "read from private field"), t ? t.call(s) : e.get(s)), w = (s, e, t) => {
  if (e.has(s))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(s) : e.set(s, t);
}, i = (s, e, t, n) => (y(s, e, "write to private field"), n ? n.call(s, t) : e.set(s, t), t);
const k = "fox_dapp_request", T = "fox_dapp_response";
function _(s) {
  return { all: s = s || /* @__PURE__ */ new Map(), on: function(e, t) {
    var n = s.get(e);
    n ? n.push(t) : s.set(e, [t]);
  }, off: function(e, t) {
    var n = s.get(e);
    n && (t ? n.splice(n.indexOf(t) >>> 0, 1) : s.set(e, []));
  }, emit: function(e, t) {
    var n = s.get(e);
    n && n.slice().map(function(r) {
      r(t);
    }), (n = s.get("*")) && n.slice().map(function(r) {
      r(e, t);
    });
  } };
}
let P = (s = 21) => crypto.getRandomValues(new Uint8Array(s)).reduce((e, t) => (t &= 63, t < 36 ? e += t.toString(36) : t < 62 ? e += (t - 26).toString(36).toUpperCase() : t > 62 ? e += "-" : e += "_", e), "");
var g, l, h;
class M {
  constructor() {
    w(this, g, void 0);
    w(this, l, void 0);
    w(this, h, void 0);
    f(this, "onMessage", (e) => {
      const { id: t, error: n, data: r } = e.detail, o = a(this, h).get(t);
      o && (o(n, r), a(this, h).delete(t));
    });
    f(this, "on", (e, t) => (a(this, l).on(e, t), () => a(this, l).off(e, t)));
    f(this, "emit", (e, t) => {
      a(this, l).emit(e, t);
    });
    i(this, g, !0), i(this, l, _()), i(this, h, /* @__PURE__ */ new Map()), window.addEventListener(T, this.onMessage);
  }
  send(e, t, n = {}) {
    return new Promise((r, o) => {
      const c = P(), x = new CustomEvent(k, {
        detail: {
          id: c,
          method: e,
          payload: t,
          metadata: n
        }
      }), q = (p, E) => {
        p ? o(p) : r(E);
      };
      a(this, h).set(c, q), window.dispatchEvent(x);
    });
  }
  get isFoxWallet() {
    return a(this, g);
  }
}
g = new WeakMap(), l = new WeakMap(), h = new WeakMap();
function R(s) {
  return Array.from(s).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var u, d;
class A extends M {
  constructor() {
    super();
    w(this, u, void 0);
    w(this, d, void 0);
    f(this, "_readyState");
    i(this, u, null), i(this, d, null), this._readyState = "Installed";
  }
  get publicKey() {
    return a(this, u);
  }
  get network() {
    return a(this, d);
  }
  get readyState() {
    return this._readyState;
  }
  convertNetworkToChainId(t) {
    switch (t) {
      case "testnetbeta":
        return "testnet";
      case "mainnet":
        return "mainnet";
      default:
        throw new Error("Unsupport network " + t);
    }
  }
  async connect(t, n, r) {
    const o = this.convertNetworkToChainId(n), c = await this.send("connect", {
      decryptPermission: t,
      network: o,
      programs: r
    });
    return i(this, u, c || null), i(this, d, n), !!c;
  }
  async disconnect() {
    if (!a(this, u) || !this.network)
      throw new Error("Connect before disconnect");
    const t = await this.send("disconnect", {});
    return i(this, u, null), i(this, d, null), t;
  }
  async decrypt(t, n, r, o, c) {
    return await this.send("decrypt", {
      cipherText: t,
      tpk: n,
      programId: r,
      functionName: o,
      index: c
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
    const n = R(t), r = await this.send("signMessage", {
      message: n
    });
    if (!r)
      throw new Error("sign message failed");
    return { signature: new TextEncoder().encode(r.signature) };
  }
  send(t, n) {
    return super.send(t, n, {
      address: a(this, u),
      network: a(this, d) ? this.convertNetworkToChainId(a(this, d)) : ""
    });
  }
}
u = new WeakMap(), d = new WeakMap();
const m = new A();
window.foxwallet = {
  aleo: m
};
window.aleo = m;
Object.freeze(window.foxwallet);
Object.seal(window.aleo);
