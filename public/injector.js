var v = Object.defineProperty;
var P = (s, e, t) => e in s ? v(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var g = (s, e, t) => (P(s, typeof e != "symbol" ? e + "" : e, t), t), y = (s, e, t) => {
  if (!e.has(s))
    throw TypeError("Cannot " + t);
};
var i = (s, e, t) => (y(s, e, "read from private field"), t ? t.call(s) : e.get(s)), h = (s, e, t) => {
  if (e.has(s))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(s) : e.set(s, t);
}, o = (s, e, t, n) => (y(s, e, "write to private field"), n ? n.call(s, t) : e.set(s, t), t);
const T = "fox_dapp_request", _ = "fox_dapp_response";
function k(s) {
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
let A = (s = 21) => crypto.getRandomValues(new Uint8Array(s)).reduce((e, t) => (t &= 63, t < 36 ? e += t.toString(36) : t < 62 ? e += (t - 26).toString(36).toUpperCase() : t > 62 ? e += "-" : e += "_", e), "");
var w, l, d;
class M {
  constructor() {
    h(this, w, void 0);
    h(this, l, void 0);
    h(this, d, void 0);
    g(this, "onMessage", (e) => {
      const { id: t, error: n, data: r } = e.detail, a = i(this, d).get(t);
      a && (a(n, r), i(this, d).delete(t));
    });
    g(this, "on", (e, t) => (i(this, l).on(e, t), () => i(this, l).off(e, t)));
    g(this, "emit", (e, t) => {
      i(this, l).emit(e, t);
    });
    o(this, w, !0), o(this, l, k()), o(this, d, /* @__PURE__ */ new Map()), window.addEventListener(_, this.onMessage);
  }
  send(e, t, n = {}) {
    return new Promise((r, a) => {
      const f = A(), x = new CustomEvent(T, {
        detail: {
          id: f,
          method: e,
          payload: t,
          metadata: n
        }
      }), q = (p, E) => {
        p ? a(p) : r(E);
      };
      i(this, d).set(f, q), window.dispatchEvent(x);
    });
  }
  get isFoxWallet() {
    return i(this, w);
  }
}
w = new WeakMap(), l = new WeakMap(), d = new WeakMap();
function R(s) {
  return Array.from(s).map((e) => e.toString(16).padStart(2, "0")).join("");
}
function S(s) {
  if (s.length % 2 !== 0)
    throw new Error("Hex string must have an even number of characters");
  const e = new Uint8Array(s.length / 2);
  for (let t = 0; t < e.length; t++) {
    const n = parseInt(s.substr(t * 2, 2), 16);
    if (isNaN(n))
      throw new Error("Invalid hex string");
    e[t] = n;
  }
  return e;
}
var c, u;
class b extends M {
  constructor() {
    super();
    h(this, c, void 0);
    h(this, u, void 0);
    o(this, c, null), o(this, u, null);
  }
  get publicKey() {
    return i(this, c);
  }
  get network() {
    return i(this, u);
  }
  async connect(t, n, r) {
    const a = await this.send("connect", {
      decryptPermission: t,
      network: n,
      programs: r
    });
    return o(this, c, a || null), o(this, u, n), !!a;
  }
  async disconnect() {
    if (!i(this, c) || !this.network)
      throw new Error("Connect before disconnect");
    const t = await this.send("disconnect", {});
    return o(this, c, null), o(this, u, null), t;
  }
  async decrypt(t, n, r, a, f) {
    return await this.send("decrypt", {
      cipherText: t,
      tpk: n,
      programId: r,
      functionName: a,
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
    const n = R(t), r = await this.send("signMessage", {
      message: n
    });
    if (!r)
      throw new Error("sign message failed");
    return { signature: S(r.signature) };
  }
  send(t, n) {
    return super.send(t, n, {
      address: i(this, c),
      network: i(this, u)
    });
  }
}
c = new WeakMap(), u = new WeakMap();
const m = new b();
window.foxwallet = {
  aleo: m
};
window.aleo = m;
Object.freeze(window.foxwallet);
Object.seal(window.aleo);
