var v = Object.defineProperty;
var k = (s, e, t) => e in s ? v(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var p = (s, e, t) => (k(s, typeof e != "symbol" ? e + "" : e, t), t), y = (s, e, t) => {
  if (!e.has(s))
    throw TypeError("Cannot " + t);
};
var i = (s, e, t) => (y(s, e, "read from private field"), t ? t.call(s) : e.get(s)), w = (s, e, t) => {
  if (e.has(s))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(s) : e.set(s, t);
}, a = (s, e, t, n) => (y(s, e, "write to private field"), n ? n.call(s, t) : e.set(s, t), t);
const T = "fox_dapp_request", P = "fox_dapp_response";
function S(s) {
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
let _ = (s = 21) => crypto.getRandomValues(new Uint8Array(s)).reduce((e, t) => (t &= 63, t < 36 ? e += t.toString(36) : t < 62 ? e += (t - 26).toString(36).toUpperCase() : t > 62 ? e += "-" : e += "_", e), "");
var f, l, h;
class M {
  constructor() {
    w(this, f, void 0);
    w(this, l, void 0);
    w(this, h, void 0);
    p(this, "onMessage", (e) => {
      const { id: t, error: n, data: r } = e.detail, o = i(this, h).get(t);
      o && (o(n, r), i(this, h).delete(t));
    });
    p(this, "on", (e, t) => (i(this, l).on(e, t), () => i(this, l).off(e, t)));
    p(this, "emit", (e, t) => {
      i(this, l).emit(e, t);
    });
    a(this, f, !0), a(this, l, S()), a(this, h, /* @__PURE__ */ new Map()), window.addEventListener(P, this.onMessage);
  }
  send(e, t, n = {}) {
    return new Promise((r, o) => {
      const c = _(), m = new CustomEvent(T, {
        detail: {
          id: c,
          method: e,
          payload: t,
          metadata: n
        }
      }), q = (g, E) => {
        g ? o(g) : r(E);
      };
      i(this, h).set(c, q), window.dispatchEvent(m);
    });
  }
  get isFoxWallet() {
    return i(this, f);
  }
}
f = new WeakMap(), l = new WeakMap(), h = new WeakMap();
function R(s) {
  return Array.from(s).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var u, d;
class A extends M {
  constructor() {
    super();
    w(this, u, void 0);
    w(this, d, void 0);
    a(this, u, null), a(this, d, null);
  }
  get publicKey() {
    return i(this, u);
  }
  get network() {
    return i(this, d);
  }
  convertNetworkToChainId(t) {
    switch (t) {
      case "testnetbeta":
        return "testnet";
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
    return a(this, u, c || null), a(this, d, n), !!c;
  }
  async disconnect() {
    if (!i(this, u) || !this.network)
      throw new Error("Connect before disconnect");
    const t = await this.send("disconnect", {});
    return a(this, u, null), a(this, d, null), t;
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
      address: i(this, u),
      network: i(this, d) ? this.convertNetworkToChainId(i(this, d)) : ""
    });
  }
}
u = new WeakMap(), d = new WeakMap();
const x = new A();
window.foxwallet = {
  aleo: x
};
window.aleo = x;
Object.freeze(window.foxwallet);
Object.seal(window.aleo);
