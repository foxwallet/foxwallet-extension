var P = Object.defineProperty;
var v = (s, t, e) => t in s ? P(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var g = (s, t, e) => (v(s, typeof t != "symbol" ? t + "" : t, e), e), y = (s, t, e) => {
  if (!t.has(s))
    throw TypeError("Cannot " + e);
};
var i = (s, t, e) => (y(s, t, "read from private field"), e ? e.call(s) : t.get(s)), w = (s, t, e) => {
  if (t.has(s))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(s) : t.set(s, e);
}, o = (s, t, e, n) => (y(s, t, "write to private field"), n ? n.call(s, e) : t.set(s, e), e);
const S = "fox_dapp_request", T = "fox_dapp_response";
function _(s) {
  return { all: s = s || /* @__PURE__ */ new Map(), on: function(t, e) {
    var n = s.get(t);
    n ? n.push(e) : s.set(t, [e]);
  }, off: function(t, e) {
    var n = s.get(t);
    n && (e ? n.splice(n.indexOf(e) >>> 0, 1) : s.set(t, []));
  }, emit: function(t, e) {
    var n = s.get(t);
    n && n.slice().map(function(r) {
      r(e);
    }), (n = s.get("*")) && n.slice().map(function(r) {
      r(t, e);
    });
  } };
}
let k = (s = 21) => crypto.getRandomValues(new Uint8Array(s)).reduce((t, e) => (e &= 63, e < 36 ? t += e.toString(36) : e < 62 ? t += (e - 26).toString(36).toUpperCase() : e > 62 ? t += "-" : t += "_", t), "");
var f, d, l;
class M {
  constructor() {
    w(this, f, void 0);
    w(this, d, void 0);
    w(this, l, void 0);
    g(this, "onMessage", (t) => {
      const { id: e, error: n, data: r } = t.detail, a = i(this, l).get(e);
      a && (a(n, r), i(this, l).delete(e));
    });
    g(this, "on", (t, e) => (i(this, d).on(t, e), () => i(this, d).off(t, e)));
    g(this, "emit", (t, e) => {
      i(this, d).emit(t, e);
    });
    o(this, f, !0), o(this, d, _()), o(this, l, /* @__PURE__ */ new Map()), window.addEventListener(T, this.onMessage);
  }
  send(t, e, n = {}) {
    return new Promise((r, a) => {
      const h = k(), m = new CustomEvent(S, {
        detail: {
          id: h,
          method: t,
          payload: e,
          metadata: n
        }
      }), q = (p, E) => {
        p ? a(p) : r(E);
      };
      i(this, l).set(h, q), window.dispatchEvent(m);
    });
  }
  get isFoxWallet() {
    return i(this, f);
  }
}
f = new WeakMap(), d = new WeakMap(), l = new WeakMap();
function R(s) {
  return Array.from(s).map((t) => t.toString(16).padStart(2, "0")).join("");
}
var c, u;
class A extends M {
  constructor() {
    super();
    w(this, c, void 0);
    w(this, u, void 0);
    o(this, c, null), o(this, u, null);
  }
  get publicKey() {
    return i(this, c);
  }
  get network() {
    return i(this, u);
  }
  async connect(e, n, r) {
    const a = await this.send("connect", {
      decryptPermission: e,
      network: n,
      programs: r
    });
    return o(this, c, a || null), o(this, u, n), !!a;
  }
  async disconnect() {
    if (!i(this, c) || !this.network)
      throw new Error("Connect before disconnect");
    const e = await this.send("disconnect", {});
    return o(this, c, null), o(this, u, null), e;
  }
  async decrypt(e, n, r, a, h) {
    return await this.send("decrypt", {
      cipherText: e,
      tpk: n,
      programId: r,
      functionName: a,
      index: h
    });
  }
  async requestRecords(e) {
    return await this.send("requestRecords", { program: e });
  }
  async requestTransaction(e) {
    return await this.send("requestTransaction", { transaction: e });
  }
  async requestExecution(e) {
    return await this.send("requestExecution", { transaction: e });
  }
  async requestBulkTransactions(e) {
    return await this.send("requestBulkTransactions", { transactions: e });
  }
  async requestDeploy(e) {
    return await this.send("requestDeploy", { deployment: e });
  }
  async transactionStatus(e) {
    return await this.send("transactionStatus", { transactionId: e });
  }
  async getExecution(e) {
    return await this.send("getExecution", { transactionId: e });
  }
  async requestRecordPlaintexts(e) {
    return await this.send("requestRecordPlaintexts", { program: e });
  }
  async requestTransactionHistory(e) {
    return await this.send("requestTransactionHistory", { program: e });
  }
  async signMessage(e) {
    const n = R(e), r = await this.send("signMessage", {
      message: n
    });
    if (!r)
      throw new Error("sign message failed");
    return { signature: new TextEncoder().encode(r.signature) };
  }
  send(e, n) {
    return super.send(e, n, {
      address: i(this, c),
      network: i(this, u)
    });
  }
}
c = new WeakMap(), u = new WeakMap();
const x = new A();
window.foxwallet = {
  aleo: x
};
window.aleo = x;
Object.freeze(window.foxwallet);
Object.seal(window.aleo);
