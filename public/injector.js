var E = Object.defineProperty;
var v = (s, e, t) =>
  e in s
    ? E(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t })
    : (s[e] = t);
var f = (s, e, t) => (v(s, typeof e != "symbol" ? e + "" : e, t), t),
  y = (s, e, t) => {
    if (!e.has(s)) throw TypeError("Cannot " + t);
  };
var a = (s, e, t) => (
    y(s, e, "read from private field"), t ? t.call(s) : e.get(s)
  ),
  d = (s, e, t) => {
    if (e.has(s))
      throw TypeError("Cannot add the same private member more than once");
    e instanceof WeakSet ? e.add(s) : e.set(s, t);
  },
  o = (s, e, t, n) => (
    y(s, e, "write to private field"), n ? n.call(s, t) : e.set(s, t), t
  );
const P = "fox_dapp_request",
  k = "fox_dapp_response";
function T(s) {
  return {
    all: (s = s || /* @__PURE__ */ new Map()),
    on: function (e, t) {
      var n = s.get(e);
      n ? n.push(t) : s.set(e, [t]);
    },
    off: function (e, t) {
      var n = s.get(e);
      n && (t ? n.splice(n.indexOf(t) >>> 0, 1) : s.set(e, []));
    },
    emit: function (e, t) {
      var n = s.get(e);
      n &&
        n.slice().map(function (r) {
          r(t);
        }),
        (n = s.get("*")) &&
          n.slice().map(function (r) {
            r(e, t);
          });
    },
  };
}
let _ = (s = 21) =>
  crypto
    .getRandomValues(new Uint8Array(s))
    .reduce(
      (e, t) => (
        (t &= 63),
        t < 36
          ? (e += t.toString(36))
          : t < 62
          ? (e += (t - 26).toString(36).toUpperCase())
          : t > 62
          ? (e += "-")
          : (e += "_"),
        e
      ),
      "",
    );
var h, u, l;
class A {
  constructor() {
    d(this, h, void 0);
    d(this, u, void 0);
    d(this, l, void 0);
    f(this, "onMessage", (e) => {
      const { id: t, error: n, data: r } = e.detail,
        i = a(this, l).get(t);
      i && (i(n, r), a(this, l).delete(t));
    });
    f(this, "on", (e, t) => (a(this, u).on(e, t), () => a(this, u).off(e, t)));
    f(this, "emit", (e, t) => {
      a(this, u).emit(e, t);
    });
    o(this, h, !0),
      o(this, u, T()),
      o(this, l, /* @__PURE__ */ new Map()),
      window.addEventListener(k, this.onMessage);
  }
  send(e, t) {
    return new Promise((n, r) => {
      const i = _(),
        g = new CustomEvent(P, {
          detail: {
            id: i,
            method: e,
            payload: t,
          },
        }),
        x = (p, q) => {
          p ? r(p) : n(q);
        };
      a(this, l).set(i, x), window.dispatchEvent(g);
    });
  }
  get isFoxWallet() {
    return a(this, h);
  }
}
(h = new WeakMap()), (u = new WeakMap()), (l = new WeakMap());
function M(s) {
  return Array.from(s)
    .map((e) => e.toString(16).padStart(2, "0"))
    .join("");
}
function R(s) {
  if (s.length % 2 !== 0)
    throw new Error("Hex string must have an even number of characters");
  const e = new Uint8Array(s.length / 2);
  for (let t = 0; t < e.length; t++) {
    const n = parseInt(s.substr(t * 2, 2), 16);
    if (isNaN(n)) throw new Error("Invalid hex string");
    e[t] = n;
  }
  return e;
}
var c, w;
class S extends A {
  constructor() {
    super();
    d(this, c, void 0);
    d(this, w, void 0);
    o(this, c, null), o(this, w, null);
  }
  get publicKey() {
    return a(this, c);
  }
  get network() {
    return a(this, w);
  }
  async connect(t, n, r) {
    const i = await this.send("connect", {
      decryptPermission: t,
      network: n,
      programs: r,
    });
    return o(this, c, i || null), o(this, w, n), !!i;
  }
  async disconnect() {
    if (!a(this, c) || !this.network)
      throw new Error("Connect before disconnect");
    return await this.send("disconnect", {
      address: a(this, c),
      network: this.network,
    });
  }
  async decrypt(t, n, r, i, g) {
    return await this.send("decrypt", {
      cipherText: t,
      tpk: n,
      programId: r,
      functionName: i,
      index: g,
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
    const n = M(t),
      r = await this.send("signMessage", {
        message: n,
      });
    if (!r) throw new Error("sign message failed");
    return { signature: R(r.signature) };
  }
}
(c = new WeakMap()), (w = new WeakMap());
const m = new S();
window.foxwallet = {
  aleo: m,
};
window.aleo = m;
Object.freeze(window.foxwallet);
Object.seal(window.aleo);
