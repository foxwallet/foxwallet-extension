var v = Object.defineProperty;
var b = (n, e, t) => e in n ? v(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var y = (n, e, t) => (b(n, typeof e != "symbol" ? e + "" : e, t), t), f = (n, e, t) => {
  if (!e.has(n))
    throw TypeError("Cannot " + t);
};
var a = (n, e, t) => (f(n, e, "read from private field"), t ? t.call(n) : e.get(n)), w = (n, e, t) => {
  if (e.has(n))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(n) : e.set(n, t);
}, i = (n, e, t, s) => (f(n, e, "write to private field"), s ? s.call(n, t) : e.set(n, t), t);
const k = "fox_dapp_request", T = "fox_dapp_response";
function P(n) {
  return { all: n = n || /* @__PURE__ */ new Map(), on: function(e, t) {
    var s = n.get(e);
    s ? s.push(t) : n.set(e, [t]);
  }, off: function(e, t) {
    var s = n.get(e);
    s && (t ? s.splice(s.indexOf(t) >>> 0, 1) : n.set(e, []));
  }, emit: function(e, t) {
    var s = n.get(e);
    s && s.slice().map(function(r) {
      r(t);
    }), (s = n.get("*")) && s.slice().map(function(r) {
      r(e, t);
    });
  } };
}
const S = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let _ = (n = 21) => {
  let e = "", t = crypto.getRandomValues(new Uint8Array(n |= 0));
  for (; n--; )
    e += S[t[n] & 63];
  return e;
};
var p, l, h;
class A {
  constructor() {
    w(this, p, void 0);
    w(this, l, void 0);
    w(this, h, void 0);
    y(this, "onMessage", (e) => {
      const { id: t, error: s, data: r } = e.detail, o = a(this, h).get(t);
      o && (o(s, r), a(this, h).delete(t));
    });
    y(this, "on", (e, t) => (a(this, l).on(e, t), () => a(this, l).off(e, t)));
    y(this, "emit", (e, t) => {
      a(this, l).emit(e, t);
    });
    i(this, p, !0), i(this, l, P()), i(this, h, /* @__PURE__ */ new Map()), window.addEventListener(T, this.onMessage);
  }
  send(e, t, s = {}) {
    return new Promise((r, o) => {
      const c = _(), x = new CustomEvent(k, {
        detail: {
          id: c,
          method: e,
          payload: t,
          metadata: s
        }
      }), q = (g, E) => {
        g ? o(g) : r(E);
      };
      a(this, h).set(c, q), window.dispatchEvent(x);
    });
  }
  get isFoxWallet() {
    return a(this, p);
  }
}
p = new WeakMap(), l = new WeakMap(), h = new WeakMap();
function M(n) {
  return Array.from(n).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var u, d;
class R extends A {
  constructor() {
    super();
    w(this, u, void 0);
    w(this, d, void 0);
    y(this, "_readyState");
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
      case "mainnetbeta":
        return "mainnet";
      case "mainnet":
        return "mainnet";
      default:
        throw new Error("Unsupport network " + t);
    }
  }
  async connect(t, s, r) {
    const o = this.convertNetworkToChainId(s), c = await this.send("connect", {
      decryptPermission: t,
      network: o,
      programs: r
    });
    return i(this, u, c || null), i(this, d, s), !!c;
  }
  async disconnect() {
    if (!a(this, u) || !this.network)
      throw new Error("Connect before disconnect");
    const t = await this.send("disconnect", {});
    return i(this, u, null), i(this, d, null), t;
  }
  async decrypt(t, s, r, o, c) {
    return await this.send("decrypt", {
      cipherText: t,
      tpk: s,
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
    const s = M(t), r = await this.send("signMessage", {
      message: s
    });
    if (!r)
      throw new Error("sign message failed");
    return { signature: new TextEncoder().encode(r.signature) };
  }
  send(t, s) {
    return super.send(t, s, {
      address: a(this, u),
      network: a(this, d) ? this.convertNetworkToChainId(a(this, d)) : ""
    });
  }
}
u = new WeakMap(), d = new WeakMap();
const m = new R();
window.foxwallet = {
  aleo: m
};
window.aleo = m;
Object.freeze(window.foxwallet);
Object.seal(window.aleo);
