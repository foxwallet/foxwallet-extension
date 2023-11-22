function spawnWorker(url, module, memory, address) {
  return new Promise((resolve) => {
    const worker = new Worker(url, {
      type: "module",
    });

    worker.addEventListener(
      "message",
      (event) => {
        // When running in Node, this allows the process to exit
        // even though the Worker is still running.
        if (worker.unref) {
          worker.unref();
        }

        resolve(worker);
      },
      {
        capture: true,
        once: true,
      },
    );

    worker.postMessage({
      module,
      memory,
      address,
    });
  });
}

let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

let heap_next = heap.length;

function dropObject(idx) {
  if (idx < 132) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

const cachedTextDecoder =
  typeof TextDecoder !== "undefined"
    ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true })
    : {
        decode: () => {
          throw Error("TextDecoder not available");
        },
      };

if (typeof TextDecoder !== "undefined") {
  cachedTextDecoder.decode();
}
let cachedUint8Memory0 = null;

function getUint8Memory0() {
  if (
    cachedUint8Memory0 === null ||
    cachedUint8Memory0.buffer !== wasm.memory.buffer
  ) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8Memory0().slice(ptr, ptr + len));
}

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder =
  typeof TextEncoder !== "undefined"
    ? new TextEncoder("utf-8")
    : {
        encode: () => {
          throw Error("TextEncoder not available");
        },
      };

const encodeString = function (arg, view) {
  const buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length,
  };
};

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8Memory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8Memory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
  if (
    cachedInt32Memory0 === null ||
    cachedInt32Memory0.buffer !== wasm.memory.buffer
  ) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == "Object") {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
  const state = { a: arg0, b: arg1, cnt: 1, dtor };
  const real = (...args) => {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++;
    const a = state.a;
    state.a = 0;
    try {
      return f(a, state.b, ...args);
    } finally {
      if (--state.cnt === 0) {
        wasm.__wbindgen_export_3.get(state.dtor)(a, state.b);
      } else {
        state.a = a;
      }
    }
  };
  real.original = state;

  return real;
}
function __wbg_adapter_34(arg0, arg1, arg2) {
  wasm.wasm_bindgen__convert__closures__invoke1_mut__h3a846df363c7d2d4(
    arg0,
    arg1,
    addHeapObject(arg2),
  );
}

function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
  return instance.ptr;
}

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
/**
 * Verify an execution with a single function and a single transition. Executions with multiple
 * transitions or functions will fail to verify. Also, this does not verify that the state root of
 * the execution is included in the Aleo Network ledger.
 *
 * @param {Execution} execution The function execution to verify
 * @param {VerifyingKey} verifying_key The verifying key for the function
 * @param {Program} program The program that the function execution belongs to
 * @param {String} function_id The name of the function that was executed
 * @returns {boolean} True if the execution is valid, false otherwise
 * @param {Execution} execution
 * @param {VerifyingKey} verifying_key
 * @param {Program} program
 * @param {string} function_id
 * @returns {boolean}
 */
function verifyFunctionExecution(
  execution,
  verifying_key,
  program,
  function_id,
) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    _assertClass(execution, Execution);
    _assertClass(verifying_key, VerifyingKey);
    _assertClass(program, Program);
    const ptr0 = passStringToWasm0(
      function_id,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.verifyFunctionExecution(
      retptr,
      execution.__wbg_ptr,
      verifying_key.__wbg_ptr,
      program.__wbg_ptr,
      ptr0,
      len0,
    );
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return r0 !== 0;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

let cachedBigInt64Memory0 = null;

function getBigInt64Memory0() {
  if (
    cachedBigInt64Memory0 === null ||
    cachedBigInt64Memory0.buffer !== wasm.memory.buffer
  ) {
    cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
  }
  return cachedBigInt64Memory0;
}

function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
 * @param {number} receiver
 */
function runRayonThread(receiver) {
  wasm.runRayonThread(receiver);
}

/**
 * @param {URL} url
 * @param {number} num_threads
 * @returns {Promise<void>}
 */
function initThreadPool(url, num_threads) {
  const ret = wasm.initThreadPool(addHeapObject(url), num_threads);
  return takeObject(ret);
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}
function __wbg_adapter_251(arg0, arg1, arg2, arg3) {
  wasm.wasm_bindgen__convert__closures__invoke2_mut__hccc8c18a7a349b62(
    arg0,
    arg1,
    addHeapObject(arg2),
    addHeapObject(arg3),
  );
}

/**
 * Public address of an Aleo account
 */
class Address {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Address.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_address_free(ptr);
  }
  /**
   * Derive an Aleo address from a private key
   *
   * @param {PrivateKey} private_key The private key to derive the address from
   * @returns {Address} Address corresponding to the private key
   * @param {PrivateKey} private_key
   * @returns {Address}
   */
  static from_private_key(private_key) {
    _assertClass(private_key, PrivateKey);
    const ret = wasm.address_from_private_key(private_key.__wbg_ptr);
    return Address.__wrap(ret);
  }
  /**
   * Derive an Aleo address from a view key
   *
   * @param {ViewKey} view_key The view key to derive the address from
   * @returns {Address} Address corresponding to the view key
   * @param {ViewKey} view_key
   * @returns {Address}
   */
  static from_view_key(view_key) {
    _assertClass(view_key, ViewKey);
    const ret = wasm.address_from_view_key(view_key.__wbg_ptr);
    return Address.__wrap(ret);
  }
  /**
   * Create an aleo address object from a string representation of an address
   *
   * @param {string} address String representation of an addressm
   * @returns {Address} Address
   * @param {string} address
   * @returns {Address}
   */
  static from_string(address) {
    const ptr0 = passStringToWasm0(
      address,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.address_from_string(ptr0, len0);
    return Address.__wrap(ret);
  }
  /**
   * Get a string representation of an Aleo address object
   *
   * @param {Address} Address
   * @returns {string} String representation of the address
   * @returns {string}
   */
  to_string() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.address_to_string(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Verify a signature for a message signed by the address
   *
   * @param {Uint8Array} Byte array representing a message signed by the address
   * @returns {boolean} Boolean representing whether or not the signature is valid
   * @param {Uint8Array} message
   * @param {Signature} signature
   * @returns {boolean}
   */
  verify(message, signature) {
    const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(signature, Signature);
    const ret = wasm.address_verify(
      this.__wbg_ptr,
      ptr0,
      len0,
      signature.__wbg_ptr,
    );
    return ret !== 0;
  }
}
/**
 * Execution of an Aleo program.
 */
class Execution {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Execution.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_execution_free(ptr);
  }
  /**
   * Returns the string representation of the execution.
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.execution_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Creates an execution object from a string representation of an execution.
   * @param {string} execution
   * @returns {Execution}
   */
  static fromString(execution) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        execution,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.execution_fromString(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Execution.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
/**
 * Webassembly Representation of an Aleo function execution response
 *
 * This object is returned by the execution of an Aleo function off-chain. It provides methods for
 * retrieving the outputs of the function execution.
 */
class ExecutionResponse {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(ExecutionResponse.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_executionresponse_free(ptr);
  }
  /**
   * Get the outputs of the executed function
   *
   * @returns {Array} Array of strings representing the outputs of the function
   * @returns {Array<any>}
   */
  getOutputs() {
    const ret = wasm.executionresponse_getOutputs(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Returns the execution object if present, null if otherwise.
   *
   * @returns {Execution | undefined} The execution object if present, null if otherwise
   * @returns {Execution | undefined}
   */
  getExecution() {
    const ret = wasm.executionresponse_getExecution(this.__wbg_ptr);
    return ret === 0 ? undefined : Execution.__wrap(ret);
  }
  /**
   * Returns the program keys if present
   * @returns {KeyPair}
   */
  getKeys() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.executionresponse_getKeys(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return KeyPair.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Returns the proving_key if the proving key was cached in the Execution response.
   * Note the proving key is removed from the response object after the first call to this
   * function. Subsequent calls will return null.
   *
   * @returns {ProvingKey | undefined} The proving key
   * @returns {ProvingKey | undefined}
   */
  getProvingKey() {
    const ret = wasm.executionresponse_getProvingKey(this.__wbg_ptr);
    return ret === 0 ? undefined : ProvingKey.__wrap(ret);
  }
  /**
   * Returns the verifying_key associated with the program
   *
   * @returns {VerifyingKey} The verifying key
   * @returns {VerifyingKey}
   */
  getVerifyingKey() {
    const ret = wasm.executionresponse_getVerifyingKey(this.__wbg_ptr);
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the function identifier
   * @returns {string}
   */
  getFunctionId() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.executionresponse_getFunctionId(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Returns the program
   * @returns {Program}
   */
  getProgram() {
    const ret = wasm.executionresponse_getProgram(this.__wbg_ptr);
    return Program.__wrap(ret);
  }
}
/**
 */
class Field {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Field.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_field_free(ptr);
  }
  /**
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.field_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * @param {string} field
   * @returns {Field}
   */
  static fromString(field) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        field,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.field_fromString(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Field.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
/**
 * Key pair object containing both the function proving and verifying keys
 */
class KeyPair {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(KeyPair.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_keypair_free(ptr);
  }
  /**
   * Create new key pair from proving and verifying keys
   *
   * @param {ProvingKey} proving_key Proving key corresponding to a function in an Aleo program
   * @param {VerifyingKey} verifying_key Verifying key corresponding to a function in an Aleo program
   * @returns {KeyPair} Key pair object containing both the function proving and verifying keys
   * @param {ProvingKey} proving_key
   * @param {VerifyingKey} verifying_key
   */
  constructor(proving_key, verifying_key) {
    _assertClass(proving_key, ProvingKey);
    var ptr0 = proving_key.__destroy_into_raw();
    _assertClass(verifying_key, VerifyingKey);
    var ptr1 = verifying_key.__destroy_into_raw();
    const ret = wasm.keypair_new(ptr0, ptr1);
    return KeyPair.__wrap(ret);
  }
  /**
   * Get the proving key. This method will remove the proving key from the key pair
   *
   * @returns {ProvingKey | Error}
   * @returns {ProvingKey}
   */
  provingKey() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.keypair_provingKey(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return ProvingKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get the verifying key. This method will remove the verifying key from the key pair
   *
   * @returns {VerifyingKey | Error}
   * @returns {VerifyingKey}
   */
  verifyingKey() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.keypair_verifyingKey(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return VerifyingKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
/**
 * An offline query object used to insert the global state root and state paths needed to create
 * a valid inclusion proof offline.
 */
class OfflineQuery {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(OfflineQuery.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_offlinequery_free(ptr);
  }
  /**
   * Creates a new offline query object. The state root is required to be passed in as a string
   * @param {string} state_root
   */
  constructor(state_root) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        state_root,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.offlinequery_new(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return OfflineQuery.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Add a new state path to the offline query object.
   *
   * @param {string} commitment: The commitment corresponding to a record inpout
   * @param {string} state_path: The state path corresponding to the commitment
   * @param {string} commitment
   * @param {string} state_path
   */
  addStatePath(commitment, state_path) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        commitment,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(
        state_path,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      wasm.offlinequery_addStatePath(
        retptr,
        this.__wbg_ptr,
        ptr0,
        len0,
        ptr1,
        len1,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get a json string representation of the offline query object
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.offlinequery_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Create an offline query object from a json string representation
   * @param {string} s
   * @returns {OfflineQuery}
   */
  static fromString(s) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        s,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.offlinequery_fromString(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return OfflineQuery.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
/**
 * Private key of an Aleo account
 */
class PrivateKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(PrivateKey.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_privatekey_free(ptr);
  }
  /**
   * Generate a new private key using a cryptographically secure random number generator
   *
   * @returns {PrivateKey}
   */
  constructor() {
    const ret = wasm.privatekey_new();
    return PrivateKey.__wrap(ret);
  }
  /**
   * Get a private key from a series of unchecked bytes
   *
   * @param {Uint8Array} seed Unchecked 32 byte long Uint8Array acting as the seed for the private key
   * @returns {PrivateKey}
   * @param {Uint8Array} seed
   * @returns {PrivateKey}
   */
  static from_seed_unchecked(seed) {
    const ptr0 = passArray8ToWasm0(seed, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.privatekey_from_seed_unchecked(ptr0, len0);
    return PrivateKey.__wrap(ret);
  }
  /**
   * Get a private key from a string representation of a private key
   *
   * @param {string} seed String representation of a private key
   * @returns {PrivateKey}
   * @param {string} private_key
   * @returns {PrivateKey}
   */
  static from_string(private_key) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        private_key,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.privatekey_from_string(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PrivateKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get a string representation of the private key. This function should be used very carefully
   * as it exposes the private key plaintext
   *
   * @returns {string} String representation of a private key
   * @returns {string}
   */
  to_string() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.privatekey_to_string(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Get the view key corresponding to the private key
   *
   * @returns {ViewKey}
   * @returns {ViewKey}
   */
  to_view_key() {
    const ret = wasm.privatekey_to_view_key(this.__wbg_ptr);
    return ViewKey.__wrap(ret);
  }
  /**
   * Get the address corresponding to the private key
   *
   * @returns {Address}
   * @returns {Address}
   */
  to_address() {
    const ret = wasm.address_from_private_key(this.__wbg_ptr);
    return Address.__wrap(ret);
  }
  /**
   * Sign a message with the private key
   *
   * @param {Uint8Array} Byte array representing a message signed by the address
   * @returns {Signature} Signature generated by signing the message with the address
   * @param {Uint8Array} message
   * @returns {Signature}
   */
  sign(message) {
    const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.privatekey_sign(this.__wbg_ptr, ptr0, len0);
    return Signature.__wrap(ret);
  }
  /**
   * Get a new randomly generated private key ciphertext using a secret. The secret is sensitive
   * and will be needed to decrypt the private key later, so it should be stored securely
   *
   * @param {string} secret Secret used to encrypt the private key
   * @returns {PrivateKeyCiphertext | Error} Ciphertext representation of the private key
   * @param {string} secret
   * @returns {PrivateKeyCiphertext}
   */
  static newEncrypted(secret) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        secret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.privatekey_newEncrypted(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PrivateKeyCiphertext.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Encrypt an existing private key with a secret. The secret is sensitive and will be needed to
   * decrypt the private key later, so it should be stored securely
   *
   * @param {string} secret Secret used to encrypt the private key
   * @returns {PrivateKeyCiphertext | Error} Ciphertext representation of the private key
   * @param {string} secret
   * @returns {PrivateKeyCiphertext}
   */
  toCiphertext(secret) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        secret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.privatekey_toCiphertext(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PrivateKeyCiphertext.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get private key from a private key ciphertext and secret originally used to encrypt it
   *
   * @param {PrivateKeyCiphertext} ciphertext Ciphertext representation of the private key
   * @param {string} secret Secret originally used to encrypt the private key
   * @returns {PrivateKey | Error} Private key
   * @param {PrivateKeyCiphertext} ciphertext
   * @param {string} secret
   * @returns {PrivateKey}
   */
  static fromPrivateKeyCiphertext(ciphertext, secret) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertClass(ciphertext, PrivateKeyCiphertext);
      const ptr0 = passStringToWasm0(
        secret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.privatekey_fromPrivateKeyCiphertext(
        retptr,
        ciphertext.__wbg_ptr,
        ptr0,
        len0,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PrivateKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
/**
 * Private Key in ciphertext form
 */
class PrivateKeyCiphertext {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(PrivateKeyCiphertext.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_privatekeyciphertext_free(ptr);
  }
  /**
   * Encrypt a private key using a secret string. The secret is sensitive and will be needed to
   * decrypt the private key later, so it should be stored securely
   *
   * @param {PrivateKey} private_key Private key to encrypt
   * @param {string} secret Secret to encrypt the private key with
   * @returns {PrivateKeyCiphertext | Error} Private key ciphertext
   * @param {PrivateKey} private_key
   * @param {string} secret
   * @returns {PrivateKeyCiphertext}
   */
  static encryptPrivateKey(private_key, secret) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertClass(private_key, PrivateKey);
      const ptr0 = passStringToWasm0(
        secret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.privatekey_toCiphertext(retptr, private_key.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PrivateKeyCiphertext.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Decrypts a private ciphertext using a secret string. This must be the same secret used to
   * encrypt the private key
   *
   * @param {string} secret Secret used to encrypt the private key
   * @returns {PrivateKey | Error} Private key
   * @param {string} secret
   * @returns {PrivateKey}
   */
  decryptToPrivateKey(secret) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        secret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.privatekeyciphertext_decryptToPrivateKey(
        retptr,
        this.__wbg_ptr,
        ptr0,
        len0,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PrivateKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Returns the ciphertext string
   *
   * @returns {string} Ciphertext string
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.privatekeyciphertext_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Creates a PrivateKeyCiphertext from a string
   *
   * @param {string} ciphertext Ciphertext string
   * @returns {PrivateKeyCiphertext | Error} Private key ciphertext
   * @param {string} ciphertext
   * @returns {PrivateKeyCiphertext}
   */
  static fromString(ciphertext) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        ciphertext,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.privatekeyciphertext_fromString(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PrivateKeyCiphertext.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}
/**
 * Webassembly Representation of an Aleo program
 */
class Program {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Program.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_program_free(ptr);
  }
  /**
   * Create a program from a program string
   *
   * @param {string} program Aleo program source code
   * @returns {Program | Error} Program object
   * @param {string} program
   * @returns {Program}
   */
  static fromString(program) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        program,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.program_fromString(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Program.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get a string representation of the program
   *
   * @returns {string} String containing the program source code
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.program_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Determine if a function is present in the program
   *
   * @param {string} functionName Name of the function to check for
   * @returns {boolean} True if the program is valid, false otherwise
   * @param {string} function_name
   * @returns {boolean}
   */
  hasFunction(function_name) {
    const ptr0 = passStringToWasm0(
      function_name,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.program_hasFunction(this.__wbg_ptr, ptr0, len0);
    return ret !== 0;
  }
  /**
   * Get javascript array of functions names in the program
   *
   * @returns {Array} Array of all function names present in the program
   *
   * @example
   * const expected_functions = [
   *   "mint",
   *   "transfer_private",
   *   "transfer_private_to_public",
   *   "transfer_public",
   *   "transfer_public_to_private",
   *   "join",
   *   "split",
   *   "fee"
   * ]
   *
   * const credits_program = aleo_wasm.Program.getCreditsProgram();
   * const credits_functions = credits_program.getFunctions();
   * console.log(credits_functions === expected_functions); // Output should be "true"
   * @returns {Array<any>}
   */
  getFunctions() {
    const ret = wasm.program_getFunctions(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Get a javascript object representation of the function inputs and types. This can be used
   * to generate a web form to capture user inputs for an execution of a function.
   *
   * @param {string} function_name Name of the function to get inputs for
   * @returns {Array | Error} Array of function inputs
   *
   * @example
   * const expected_inputs = [
   *     {
   *       type:"record",
   *       visibility:"private",
   *       record:"credits",
   *       members:[
   *         {
   *           name:"microcredits",
   *           type:"u64",
   *           visibility:"private"
   *         }
   *       ],
   *       register:"r0"
   *     },
   *     {
   *       type:"address",
   *       visibility:"private",
   *       register:"r1"
   *     },
   *     {
   *       type:"u64",
   *       visibility:"private",
   *       register:"r2"
   *     }
   * ];
   *
   * const credits_program = aleo_wasm.Program.getCreditsProgram();
   * const transfer_function_inputs = credits_program.getFunctionInputs("transfer_private");
   * console.log(transfer_function_inputs === expected_inputs); // Output should be "true"
   * @param {string} function_name
   * @returns {Array<any>}
   */
  getFunctionInputs(function_name) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        function_name,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.program_getFunctionInputs(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get a the list of a program's mappings and the names/types of their keys and values.
   *
   * @returns {Array | Error} - An array of objects representing the mappings in the program
   * @example
   * const expected_mappings = [
   *    {
   *       name: "account",
   *       key_name: "owner",
   *       key_type: "address",
   *       value_name: "microcredits",
   *       value_type: "u64"
   *    }
   * ]
   *
   * const credits_program = aleo_wasm.Program.getCreditsProgram();
   * const credits_mappings = credits_program.getMappings();
   * console.log(credits_mappings === expected_mappings); // Output should be "true"
   * @returns {Array<any>}
   */
  getMappings() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.program_getMappings(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get a javascript object representation of a program record and its types
   *
   * @param {string} record_name Name of the record to get members for
   * @returns {Object | Error} Object containing the record name, type, and members
   *
   * @example
   *
   * const expected_record = {
   *     type: "record",
   *     record: "Credits",
   *     members: [
   *       {
   *         name: "owner",
   *         type: "address",
   *         visibility: "private"
   *       },
   *       {
   *         name: "microcredits",
   *         type: "u64",
   *         visibility: "private"
   *       }
   *     ];
   *  };
   *
   * const credits_program = aleo_wasm.Program.getCreditsProgram();
   * const credits_record = credits_program.getRecordMembers("Credits");
   * console.log(credits_record === expected_record); // Output should be "true"
   * @param {string} record_name
   * @returns {object}
   */
  getRecordMembers(record_name) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        record_name,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.program_getRecordMembers(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get a javascript object representation of a program struct and its types
   *
   * @param {string} struct_name Name of the struct to get members for
   * @returns {Array | Error} Array containing the struct members
   *
   * @example
   *
   * const STRUCT_PROGRAM = "program token_issue.aleo;
   *
   * struct token_metadata:
   *     network as u32;
   *     version as u32;
   *
   * struct token:
   *     token_id as u32;
   *     metadata as token_metadata;
   *
   * function no_op:
   *    input r0 as u64;
   *    output r0 as u64;"
   *
   * const expected_struct_members = [
   *    {
   *      name: "token_id",
   *      type: "u32",
   *    },
   *    {
   *      name: "metadata",
   *      type: "struct",
   *      struct_id: "token_metadata",
   *      members: [
   *       {
   *         name: "network",
   *         type: "u32",
   *       }
   *       {
   *         name: "version",
   *         type: "u32",
   *       }
   *     ]
   *   }
   * ];
   *
   * const program = aleo_wasm.Program.fromString(STRUCT_PROGRAM);
   * const struct_members = program.getStructMembers("token");
   * console.log(struct_members === expected_struct_members); // Output should be "true"
   * @param {string} struct_name
   * @returns {Array<any>}
   */
  getStructMembers(struct_name) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        struct_name,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.program_getStructMembers(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get the credits.aleo program
   *
   * @returns {Program} The credits.aleo program
   * @returns {Program}
   */
  static getCreditsProgram() {
    const ret = wasm.program_getCreditsProgram();
    return Program.__wrap(ret);
  }
  /**
   * Get the id of the program
   *
   * @returns {string} The id of the program
   * @returns {string}
   */
  id() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.program_id(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Determine equality with another program
   *
   * @param {Program} other The other program to compare
   * @returns {boolean} True if the programs are equal, false otherwise
   * @param {Program} other
   * @returns {boolean}
   */
  isEqual(other) {
    _assertClass(other, Program);
    const ret = wasm.program_isEqual(this.__wbg_ptr, other.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Get program_imports
   *
   * @returns {Array} The program imports
   *
   * @example
   *
   * const DOUBLE_TEST = "import multiply_test.aleo;
   *
   * program double_test.aleo;
   *
   * function double_it:
   *     input r0 as u32.private;
   *     call multiply_test.aleo/multiply 2u32 r0 into r1;
   *     output r1 as u32.private;";
   *
   * const expected_imports = [
   *    "multiply_test.aleo"
   * ];
   *
   * const program = aleo_wasm.Program.fromString(DOUBLE_TEST_PROGRAM);
   * const imports = program.getImports();
   * console.log(imports === expected_imports); // Output should be "true"
   * @returns {Array<any>}
   */
  getImports() {
    const ret = wasm.program_getImports(this.__wbg_ptr);
    return takeObject(ret);
  }
}
/**
 */
class ProgramManager {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_programmanager_free(ptr);
  }
  /**
   * Deploy an Aleo program
   *
   * @param private_key The private key of the sender
   * @param program The source code of the program being deployed
   * @param imports A javascript object holding the source code of any imported programs in the
   * form \{"program_name1": "program_source_code", "program_name2": "program_source_code", ..\}.
   * Note that all imported programs must be deployed on chain before the main program in order
   * for the deployment to succeed
   * @param fee_credits The amount of credits to pay as a fee
   * @param fee_record The record to spend the fee from
   * @param url The url of the Aleo network node to send the transaction to
   * @param imports (optional) Provide a list of imports to use for the program deployment in the
   * form of a javascript object where the keys are a string of the program name and the values
   * are a string representing the program source code \{ "hello.aleo": "hello.aleo source code" \}
   * @param fee_proving_key (optional) Provide a proving key to use for the fee execution
   * @param fee_verifying_key (optional) Provide a verifying key to use for the fee execution
   * @returns {Transaction | Error}
   * @param {PrivateKey} private_key
   * @param {string} program
   * @param {bigint} base_fee
   * @param {bigint} priority_fee
   * @param {RecordPlaintext | undefined} fee_record
   * @param {string | undefined} url
   * @param {object | undefined} imports
   * @param {ProvingKey | undefined} fee_proving_key
   * @param {VerifyingKey | undefined} fee_verifying_key
   * @param {OfflineQuery | undefined} offline_query
   * @returns {Promise<Transaction>}
   */
  static buildDeploymentTransaction(
    private_key,
    program,
    base_fee,
    priority_fee,
    fee_record,
    url,
    imports,
    fee_proving_key,
    fee_verifying_key,
    offline_query,
  ) {
    _assertClass(private_key, PrivateKey);
    const ptr0 = passStringToWasm0(
      program,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    let ptr1 = 0;
    if (!isLikeNone(fee_record)) {
      _assertClass(fee_record, RecordPlaintext);
      ptr1 = fee_record.__destroy_into_raw();
    }
    var ptr2 = isLikeNone(url)
      ? 0
      : passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    let ptr3 = 0;
    if (!isLikeNone(fee_proving_key)) {
      _assertClass(fee_proving_key, ProvingKey);
      ptr3 = fee_proving_key.__destroy_into_raw();
    }
    let ptr4 = 0;
    if (!isLikeNone(fee_verifying_key)) {
      _assertClass(fee_verifying_key, VerifyingKey);
      ptr4 = fee_verifying_key.__destroy_into_raw();
    }
    let ptr5 = 0;
    if (!isLikeNone(offline_query)) {
      _assertClass(offline_query, OfflineQuery);
      ptr5 = offline_query.__destroy_into_raw();
    }
    const ret = wasm.programmanager_buildDeploymentTransaction(
      private_key.__wbg_ptr,
      ptr0,
      len0,
      base_fee,
      priority_fee,
      ptr1,
      ptr2,
      len2,
      isLikeNone(imports) ? 0 : addHeapObject(imports),
      ptr3,
      ptr4,
      ptr5,
    );
    return takeObject(ret);
  }
  /**
   * Estimate the fee for a program deployment
   *
   * Disclaimer: Fee estimation is experimental and may not represent a correct estimate on any current or future network
   *
   * @param program The source code of the program being deployed
   * @param imports (optional) Provide a list of imports to use for the deployment fee estimation
   * in the form of a javascript object where the keys are a string of the program name and the values
   * are a string representing the program source code \{ "hello.aleo": "hello.aleo source code" \}
   * @returns {u64 | Error}
   * @param {string} program
   * @param {object | undefined} imports
   * @returns {Promise<bigint>}
   */
  static estimateDeploymentFee(program, imports) {
    const ptr0 = passStringToWasm0(
      program,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.programmanager_estimateDeploymentFee(
      ptr0,
      len0,
      isLikeNone(imports) ? 0 : addHeapObject(imports),
    );
    return takeObject(ret);
  }
  /**
   * Estimate the component of the deployment cost which comes from the fee for the program name.
   * Note that this cost does not represent the entire cost of deployment. It is additional to
   * the cost of the size (in bytes) of the deployment.
   *
   * Disclaimer: Fee estimation is experimental and may not represent a correct estimate on any current or future network
   *
   * @param name The name of the program to be deployed
   * @returns {u64 | Error}
   * @param {string} name
   * @returns {bigint}
   */
  static estimateProgramNameCost(name) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        name,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.programmanager_estimateProgramNameCost(retptr, ptr0, len0);
      var r0 = getBigInt64Memory0()[retptr / 8 + 0];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      return BigInt.asUintN(64, r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Execute an arbitrary function locally
   *
   * @param {PrivateKey} private_key The private key of the sender
   * @param {string} program The source code of the program being executed
   * @param {string} function The name of the function to execute
   * @param {Array} inputs A javascript array of inputs to the function
   * @param {boolean} prove_execution If true, the execution will be proven and an execution object
   * containing the proof and the encrypted inputs and outputs needed to verify the proof offline
   * will be returned.
   * @param {boolean} cache Cache the proving and verifying keys in the Execution response.
   * If this is set to 'true' the keys synthesized will be stored in the Execution Response
   * and the `ProvingKey` and `VerifyingKey` can be retrieved from the response via the `.getKeys()`
   * method.
   * @param {Object | undefined} imports (optional) Provide a list of imports to use for the function execution in the
   * form of a javascript object where the keys are a string of the program name and the values
   * are a string representing the program source code \{ "hello.aleo": "hello.aleo source code" \}
   * @param {ProvingKey | undefined} proving_key (optional) Provide a verifying key to use for the function execution
   * @param {VerifyingKey | undefined} verifying_key (optional) Provide a verifying key to use for the function execution
   * @param {PrivateKey} private_key
   * @param {string} program
   * @param {string} _function
   * @param {Array<any>} inputs
   * @param {boolean} prove_execution
   * @param {boolean} cache
   * @param {object | undefined} imports
   * @param {ProvingKey | undefined} proving_key
   * @param {VerifyingKey | undefined} verifying_key
   * @param {string | undefined} url
   * @param {OfflineQuery | undefined} offline_query
   * @returns {Promise<ExecutionResponse>}
   */
  static executeFunctionOffline(
    private_key,
    program,
    _function,
    inputs,
    prove_execution,
    cache,
    imports,
    proving_key,
    verifying_key,
    url,
    offline_query,
  ) {
    _assertClass(private_key, PrivateKey);
    const ptr0 = passStringToWasm0(
      program,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(
      _function,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    let ptr2 = 0;
    if (!isLikeNone(proving_key)) {
      _assertClass(proving_key, ProvingKey);
      ptr2 = proving_key.__destroy_into_raw();
    }
    let ptr3 = 0;
    if (!isLikeNone(verifying_key)) {
      _assertClass(verifying_key, VerifyingKey);
      ptr3 = verifying_key.__destroy_into_raw();
    }
    var ptr4 = isLikeNone(url)
      ? 0
      : passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len4 = WASM_VECTOR_LEN;
    let ptr5 = 0;
    if (!isLikeNone(offline_query)) {
      _assertClass(offline_query, OfflineQuery);
      ptr5 = offline_query.__destroy_into_raw();
    }
    const ret = wasm.programmanager_executeFunctionOffline(
      private_key.__wbg_ptr,
      ptr0,
      len0,
      ptr1,
      len1,
      addHeapObject(inputs),
      prove_execution,
      cache,
      isLikeNone(imports) ? 0 : addHeapObject(imports),
      ptr2,
      ptr3,
      ptr4,
      len4,
      ptr5,
    );
    return takeObject(ret);
  }
  /**
   * Execute Aleo function and create an Aleo execution transaction
   *
   * @param private_key The private key of the sender
   * @param program The source code of the program being executed
   * @param function The name of the function to execute
   * @param inputs A javascript array of inputs to the function
   * @param fee_credits The amount of credits to pay as a fee
   * @param fee_record The record to spend the fee from
   * @param url The url of the Aleo network node to send the transaction to
   * If this is set to 'true' the keys synthesized (or passed in as optional parameters via the
   * `proving_key` and `verifying_key` arguments) will be stored in the ProgramManager's memory
   * and used for subsequent transactions. If this is set to 'false' the proving and verifying
   * keys will be deallocated from memory after the transaction is executed.
   * @param imports (optional) Provide a list of imports to use for the function execution in the
   * form of a javascript object where the keys are a string of the program name and the values
   * are a string representing the program source code \{ "hello.aleo": "hello.aleo source code" \}
   * @param proving_key (optional) Provide a verifying key to use for the function execution
   * @param verifying_key (optional) Provide a verifying key to use for the function execution
   * @param fee_proving_key (optional) Provide a proving key to use for the fee execution
   * @param fee_verifying_key (optional) Provide a verifying key to use for the fee execution
   * @returns {Transaction | Error}
   * @param {PrivateKey} private_key
   * @param {string} program
   * @param {string} _function
   * @param {Array<any>} inputs
   * @param {bigint} base_fee
   * @param {bigint} priority_fee
   * @param {RecordPlaintext | undefined} fee_record
   * @param {string | undefined} url
   * @param {object | undefined} imports
   * @param {ProvingKey | undefined} proving_key
   * @param {VerifyingKey | undefined} verifying_key
   * @param {ProvingKey | undefined} fee_proving_key
   * @param {VerifyingKey | undefined} fee_verifying_key
   * @param {OfflineQuery | undefined} offline_query
   * @returns {Promise<Transaction>}
   */
  static buildExecutionTransaction(
    private_key,
    program,
    _function,
    inputs,
    base_fee,
    priority_fee,
    fee_record,
    url,
    imports,
    proving_key,
    verifying_key,
    fee_proving_key,
    fee_verifying_key,
    offline_query,
  ) {
    _assertClass(private_key, PrivateKey);
    const ptr0 = passStringToWasm0(
      program,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(
      _function,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    let ptr2 = 0;
    if (!isLikeNone(fee_record)) {
      _assertClass(fee_record, RecordPlaintext);
      ptr2 = fee_record.__destroy_into_raw();
    }
    var ptr3 = isLikeNone(url)
      ? 0
      : passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    let ptr4 = 0;
    if (!isLikeNone(proving_key)) {
      _assertClass(proving_key, ProvingKey);
      ptr4 = proving_key.__destroy_into_raw();
    }
    let ptr5 = 0;
    if (!isLikeNone(verifying_key)) {
      _assertClass(verifying_key, VerifyingKey);
      ptr5 = verifying_key.__destroy_into_raw();
    }
    let ptr6 = 0;
    if (!isLikeNone(fee_proving_key)) {
      _assertClass(fee_proving_key, ProvingKey);
      ptr6 = fee_proving_key.__destroy_into_raw();
    }
    let ptr7 = 0;
    if (!isLikeNone(fee_verifying_key)) {
      _assertClass(fee_verifying_key, VerifyingKey);
      ptr7 = fee_verifying_key.__destroy_into_raw();
    }
    let ptr8 = 0;
    if (!isLikeNone(offline_query)) {
      _assertClass(offline_query, OfflineQuery);
      ptr8 = offline_query.__destroy_into_raw();
    }
    const ret = wasm.programmanager_buildExecutionTransaction(
      private_key.__wbg_ptr,
      ptr0,
      len0,
      ptr1,
      len1,
      addHeapObject(inputs),
      base_fee,
      priority_fee,
      ptr2,
      ptr3,
      len3,
      isLikeNone(imports) ? 0 : addHeapObject(imports),
      ptr4,
      ptr5,
      ptr6,
      ptr7,
      ptr8,
    );
    return takeObject(ret);
  }
  /**
   * Estimate Fee for Aleo function execution. Note if "cache" is set to true, the proving and
   * verifying keys will be stored in the ProgramManager's memory and used for subsequent
   * program executions.
   *
   * Disclaimer: Fee estimation is experimental and may not represent a correct estimate on any current or future network
   *
   * @param private_key The private key of the sender
   * @param program The source code of the program to estimate the execution fee for
   * @param function The name of the function to execute
   * @param inputs A javascript array of inputs to the function
   * @param url The url of the Aleo network node to send the transaction to
   * @param imports (optional) Provide a list of imports to use for the fee estimation in the
   * form of a javascript object where the keys are a string of the program name and the values
   * are a string representing the program source code \{ "hello.aleo": "hello.aleo source code" \}
   * @param proving_key (optional) Provide a verifying key to use for the fee estimation
   * @param verifying_key (optional) Provide a verifying key to use for the fee estimation
   * @returns {u64 | Error} Fee in microcredits
   * @param {PrivateKey} private_key
   * @param {string} program
   * @param {string} _function
   * @param {Array<any>} inputs
   * @param {string | undefined} url
   * @param {object | undefined} imports
   * @param {ProvingKey | undefined} proving_key
   * @param {VerifyingKey | undefined} verifying_key
   * @param {OfflineQuery | undefined} offline_query
   * @returns {Promise<bigint>}
   */
  static estimateExecutionFee(
    private_key,
    program,
    _function,
    inputs,
    url,
    imports,
    proving_key,
    verifying_key,
    offline_query,
  ) {
    _assertClass(private_key, PrivateKey);
    const ptr0 = passStringToWasm0(
      program,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(
      _function,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(url)
      ? 0
      : passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    let ptr3 = 0;
    if (!isLikeNone(proving_key)) {
      _assertClass(proving_key, ProvingKey);
      ptr3 = proving_key.__destroy_into_raw();
    }
    let ptr4 = 0;
    if (!isLikeNone(verifying_key)) {
      _assertClass(verifying_key, VerifyingKey);
      ptr4 = verifying_key.__destroy_into_raw();
    }
    let ptr5 = 0;
    if (!isLikeNone(offline_query)) {
      _assertClass(offline_query, OfflineQuery);
      ptr5 = offline_query.__destroy_into_raw();
    }
    const ret = wasm.programmanager_estimateExecutionFee(
      private_key.__wbg_ptr,
      ptr0,
      len0,
      ptr1,
      len1,
      addHeapObject(inputs),
      ptr2,
      len2,
      isLikeNone(imports) ? 0 : addHeapObject(imports),
      ptr3,
      ptr4,
      ptr5,
    );
    return takeObject(ret);
  }
  /**
   * Estimate the finalize fee component for executing a function. This fee is additional to the
   * size of the execution of the program in bytes. If the function does not have a finalize
   * step, then the finalize fee is 0.
   *
   * Disclaimer: Fee estimation is experimental and may not represent a correct estimate on any current or future network
   *
   * @param program The program containing the function to estimate the finalize fee for
   * @param function The function to estimate the finalize fee for
   * @returns {u64 | Error} Fee in microcredits
   * @param {string} program
   * @param {string} _function
   * @returns {bigint}
   */
  static estimateFinalizeFee(program, _function) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        program,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(
        _function,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      wasm.programmanager_estimateFinalizeFee(retptr, ptr0, len0, ptr1, len1);
      var r0 = getBigInt64Memory0()[retptr / 8 + 0];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      return BigInt.asUintN(64, r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Join two records together to create a new record with an amount of credits equal to the sum
   * of the credits of the two original records
   *
   * @param private_key The private key of the sender
   * @param record_1 The first record to combine
   * @param record_2 The second record to combine
   * @param fee_credits The amount of credits to pay as a fee
   * @param fee_record The record to spend the fee from
   * @param url The url of the Aleo network node to send the transaction to
   * @param join_proving_key (optional) Provide a proving key to use for the join function
   * @param join_verifying_key (optional) Provide a verifying key to use for the join function
   * @param fee_proving_key (optional) Provide a proving key to use for the fee execution
   * @param fee_verifying_key (optional) Provide a verifying key to use for the fee execution
   * @returns {Transaction | Error} Transaction object
   * @param {PrivateKey} private_key
   * @param {RecordPlaintext} record_1
   * @param {RecordPlaintext} record_2
   * @param {number} fee_credits
   * @param {RecordPlaintext | undefined} fee_record
   * @param {string | undefined} url
   * @param {ProvingKey | undefined} join_proving_key
   * @param {VerifyingKey | undefined} join_verifying_key
   * @param {ProvingKey | undefined} fee_proving_key
   * @param {VerifyingKey | undefined} fee_verifying_key
   * @param {OfflineQuery | undefined} offline_query
   * @returns {Promise<Transaction>}
   */
  static buildJoinTransaction(
    private_key,
    record_1,
    record_2,
    fee_credits,
    fee_record,
    url,
    join_proving_key,
    join_verifying_key,
    fee_proving_key,
    fee_verifying_key,
    offline_query,
  ) {
    _assertClass(private_key, PrivateKey);
    _assertClass(record_1, RecordPlaintext);
    var ptr0 = record_1.__destroy_into_raw();
    _assertClass(record_2, RecordPlaintext);
    var ptr1 = record_2.__destroy_into_raw();
    let ptr2 = 0;
    if (!isLikeNone(fee_record)) {
      _assertClass(fee_record, RecordPlaintext);
      ptr2 = fee_record.__destroy_into_raw();
    }
    var ptr3 = isLikeNone(url)
      ? 0
      : passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    let ptr4 = 0;
    if (!isLikeNone(join_proving_key)) {
      _assertClass(join_proving_key, ProvingKey);
      ptr4 = join_proving_key.__destroy_into_raw();
    }
    let ptr5 = 0;
    if (!isLikeNone(join_verifying_key)) {
      _assertClass(join_verifying_key, VerifyingKey);
      ptr5 = join_verifying_key.__destroy_into_raw();
    }
    let ptr6 = 0;
    if (!isLikeNone(fee_proving_key)) {
      _assertClass(fee_proving_key, ProvingKey);
      ptr6 = fee_proving_key.__destroy_into_raw();
    }
    let ptr7 = 0;
    if (!isLikeNone(fee_verifying_key)) {
      _assertClass(fee_verifying_key, VerifyingKey);
      ptr7 = fee_verifying_key.__destroy_into_raw();
    }
    let ptr8 = 0;
    if (!isLikeNone(offline_query)) {
      _assertClass(offline_query, OfflineQuery);
      ptr8 = offline_query.__destroy_into_raw();
    }
    const ret = wasm.programmanager_buildJoinTransaction(
      private_key.__wbg_ptr,
      ptr0,
      ptr1,
      fee_credits,
      ptr2,
      ptr3,
      len3,
      ptr4,
      ptr5,
      ptr6,
      ptr7,
      ptr8,
    );
    return takeObject(ret);
  }
  /**
   * Split an Aleo credits record into two separate records. This function does not require a fee.
   *
   * @param private_key The private key of the sender
   * @param split_amount The amount of the credit split. This amount will be subtracted from the
   * value of the record and two new records will be created with the split amount and the remainder
   * @param amount_record The record to split
   * @param url The url of the Aleo network node to send the transaction to
   * @param split_proving_key (optional) Provide a proving key to use for the split function
   * @param split_verifying_key (optional) Provide a verifying key to use for the split function
   * @returns {Transaction | Error} Transaction object
   * @param {PrivateKey} private_key
   * @param {number} split_amount
   * @param {RecordPlaintext} amount_record
   * @param {string | undefined} url
   * @param {ProvingKey | undefined} split_proving_key
   * @param {VerifyingKey | undefined} split_verifying_key
   * @param {OfflineQuery | undefined} offline_query
   * @returns {Promise<Transaction>}
   */
  static buildSplitTransaction(
    private_key,
    split_amount,
    amount_record,
    url,
    split_proving_key,
    split_verifying_key,
    offline_query,
  ) {
    _assertClass(private_key, PrivateKey);
    _assertClass(amount_record, RecordPlaintext);
    var ptr0 = amount_record.__destroy_into_raw();
    var ptr1 = isLikeNone(url)
      ? 0
      : passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    let ptr2 = 0;
    if (!isLikeNone(split_proving_key)) {
      _assertClass(split_proving_key, ProvingKey);
      ptr2 = split_proving_key.__destroy_into_raw();
    }
    let ptr3 = 0;
    if (!isLikeNone(split_verifying_key)) {
      _assertClass(split_verifying_key, VerifyingKey);
      ptr3 = split_verifying_key.__destroy_into_raw();
    }
    let ptr4 = 0;
    if (!isLikeNone(offline_query)) {
      _assertClass(offline_query, OfflineQuery);
      ptr4 = offline_query.__destroy_into_raw();
    }
    const ret = wasm.programmanager_buildSplitTransaction(
      private_key.__wbg_ptr,
      split_amount,
      ptr0,
      ptr1,
      len1,
      ptr2,
      ptr3,
      ptr4,
    );
    return takeObject(ret);
  }
  /**
   * Send credits from one Aleo account to another
   *
   * @param private_key The private key of the sender
   * @param amount_credits The amount of credits to send
   * @param recipient The recipient of the transaction
   * @param transfer_type The type of the transfer (options: "private", "public", "private_to_public", "public_to_private")
   * @param amount_record The record to fund the amount from
   * @param fee_credits The amount of credits to pay as a fee
   * @param fee_record The record to spend the fee from
   * @param url The url of the Aleo network node to send the transaction to
   * @param transfer_verifying_key (optional) Provide a verifying key to use for the transfer
   * function
   * @param fee_proving_key (optional) Provide a proving key to use for the fee execution
   * @param fee_verifying_key (optional) Provide a verifying key to use for the fee execution
   * @returns {Transaction | Error}
   * @param {PrivateKey} private_key
   * @param {number} amount_credits
   * @param {string} recipient
   * @param {string} transfer_type
   * @param {RecordPlaintext | undefined} amount_record
   * @param {number} fee_credits
   * @param {RecordPlaintext | undefined} fee_record
   * @param {string | undefined} url
   * @param {ProvingKey | undefined} transfer_proving_key
   * @param {VerifyingKey | undefined} transfer_verifying_key
   * @param {ProvingKey | undefined} fee_proving_key
   * @param {VerifyingKey | undefined} fee_verifying_key
   * @param {OfflineQuery | undefined} offline_query
   * @returns {Promise<Transaction>}
   */
  static buildTransferTransaction(
    private_key,
    amount_credits,
    recipient,
    transfer_type,
    amount_record,
    fee_credits,
    fee_record,
    url,
    transfer_proving_key,
    transfer_verifying_key,
    fee_proving_key,
    fee_verifying_key,
    offline_query,
  ) {
    _assertClass(private_key, PrivateKey);
    const ptr0 = passStringToWasm0(
      recipient,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(
      transfer_type,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    let ptr2 = 0;
    if (!isLikeNone(amount_record)) {
      _assertClass(amount_record, RecordPlaintext);
      ptr2 = amount_record.__destroy_into_raw();
    }
    let ptr3 = 0;
    if (!isLikeNone(fee_record)) {
      _assertClass(fee_record, RecordPlaintext);
      ptr3 = fee_record.__destroy_into_raw();
    }
    var ptr4 = isLikeNone(url)
      ? 0
      : passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len4 = WASM_VECTOR_LEN;
    let ptr5 = 0;
    if (!isLikeNone(transfer_proving_key)) {
      _assertClass(transfer_proving_key, ProvingKey);
      ptr5 = transfer_proving_key.__destroy_into_raw();
    }
    let ptr6 = 0;
    if (!isLikeNone(transfer_verifying_key)) {
      _assertClass(transfer_verifying_key, VerifyingKey);
      ptr6 = transfer_verifying_key.__destroy_into_raw();
    }
    let ptr7 = 0;
    if (!isLikeNone(fee_proving_key)) {
      _assertClass(fee_proving_key, ProvingKey);
      ptr7 = fee_proving_key.__destroy_into_raw();
    }
    let ptr8 = 0;
    if (!isLikeNone(fee_verifying_key)) {
      _assertClass(fee_verifying_key, VerifyingKey);
      ptr8 = fee_verifying_key.__destroy_into_raw();
    }
    let ptr9 = 0;
    if (!isLikeNone(offline_query)) {
      _assertClass(offline_query, OfflineQuery);
      ptr9 = offline_query.__destroy_into_raw();
    }
    const ret = wasm.programmanager_buildTransferTransaction(
      private_key.__wbg_ptr,
      amount_credits,
      ptr0,
      len0,
      ptr1,
      len1,
      ptr2,
      fee_credits,
      ptr3,
      ptr4,
      len4,
      ptr5,
      ptr6,
      ptr7,
      ptr8,
      ptr9,
    );
    return takeObject(ret);
  }
  /**
   * Synthesize proving and verifying keys for a program
   *
   * @param program {string} The program source code of the program to synthesize keys for
   * @param function_id {string} The function to synthesize keys for
   * @param inputs {Array} The inputs to the function
   * @param imports {Object | undefined} The imports for the program
   * @param {PrivateKey} private_key
   * @param {string} program
   * @param {string} function_id
   * @param {Array<any>} inputs
   * @param {object | undefined} imports
   * @returns {Promise<KeyPair>}
   */
  static synthesizeKeyPair(private_key, program, function_id, inputs, imports) {
    _assertClass(private_key, PrivateKey);
    const ptr0 = passStringToWasm0(
      program,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(
      function_id,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.programmanager_synthesizeKeyPair(
      private_key.__wbg_ptr,
      ptr0,
      len0,
      ptr1,
      len1,
      addHeapObject(inputs),
      isLikeNone(imports) ? 0 : addHeapObject(imports),
    );
    return takeObject(ret);
  }
}
/**
 * Proving key for a function within an Aleo program
 */
class ProvingKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(ProvingKey.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_provingkey_free(ptr);
  }
  /**
   * Verify if the proving key is for the bond_public function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("bond_public_proving_key.bin");
   * provingKey.isBondPublicProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the bond_public function, false if otherwise
   * @returns {boolean}
   */
  isBondPublicProver() {
    const ret = wasm.provingkey_isBondPublicProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the claim_unbond function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("claim_unbond_proving_key.bin");
   * provingKey.isClaimUnbondProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the claim_unbond function, false if otherwise
   * @returns {boolean}
   */
  isClaimUnbondPublicProver() {
    const ret = wasm.provingkey_isClaimUnbondPublicProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the fee_private function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("fee_private_proving_key.bin");
   * provingKey.isFeePrivateProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the fee_private function, false if otherwise
   * @returns {boolean}
   */
  isFeePrivateProver() {
    const ret = wasm.provingkey_isFeePrivateProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the fee_public function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("fee_public_proving_key.bin");
   * provingKey.isFeePublicProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the fee_public function, false if otherwise
   * @returns {boolean}
   */
  isFeePublicProver() {
    const ret = wasm.provingkey_isFeePublicProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the inclusion function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("inclusion_proving_key.bin");
   * provingKey.isInclusionProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the inclusion function, false if otherwise
   * @returns {boolean}
   */
  isInclusionProver() {
    const ret = wasm.provingkey_isInclusionProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the join function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("join_proving_key.bin");
   * provingKey.isJoinProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the join function, false if otherwise
   * @returns {boolean}
   */
  isJoinProver() {
    const ret = wasm.provingkey_isJoinProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the set_validator_state function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("set_validator_set_proving_key.bin");
   * provingKey.isSetValidatorStateProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the set_validator_state function, false if otherwise
   * @returns {boolean}
   */
  isSetValidatorStateProver() {
    const ret = wasm.provingkey_isSetValidatorStateProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the split function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("split_proving_key.bin");
   * provingKey.isSplitProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the split function, false if otherwise
   * @returns {boolean}
   */
  isSplitProver() {
    const ret = wasm.provingkey_isSplitProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the transfer_private function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("transfer_private_proving_key.bin");
   * provingKey.isTransferPrivateProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the transfer_private function, false if otherwise
   * @returns {boolean}
   */
  isTransferPrivateProver() {
    const ret = wasm.provingkey_isTransferPrivateProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the transfer_private_to_public function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("transfer_private_to_public_proving_key.bin");
   * provingKey.isTransferPrivateToPublicProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the transfer_private_to_public function, false if otherwise
   * @returns {boolean}
   */
  isTransferPrivateToPublicProver() {
    const ret = wasm.provingkey_isTransferPrivateToPublicProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the transfer_public function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("transfer_public_proving_key.bin");
   * provingKey.isTransferPublicProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the transfer_public function, false if otherwise
   * @returns {boolean}
   */
  isTransferPublicProver() {
    const ret = wasm.provingkey_isTransferPublicProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the transfer_public_to_private function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("transfer_public_to_private_proving_key.bin");
   * provingKey.isTransferPublicToPrivateProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the transfer_public_to_private function, false if otherwise
   * @returns {boolean}
   */
  isTransferPublicToPrivateProver() {
    const ret = wasm.provingkey_isTransferPublicToPrivateProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the unbond_delegator_as_validator function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("unbond_delegator_as_validator_proving_key.bin");
   * provingKey.isUnbondDelegatorAsValidatorProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the unbond_delegator_as_validator function, false if otherwise
   * @returns {boolean}
   */
  isUnbondDelegatorAsValidatorProver() {
    const ret = wasm.provingkey_isUnbondDelegatorAsValidatorProver(
      this.__wbg_ptr,
    );
    return ret !== 0;
  }
  /**
   * Verify if the proving key is for the unbond_delegator_as_delegator function
   *
   * @example
   * const provingKey = ProvingKey.fromBytes("unbond_delegator_as_delegator_proving_key.bin");
   * provingKey.isUnbondDelegatorAsDelegatorProver() ? console.log("Key verified") : throw new Error("Invalid key");
   *
   * @returns {boolean} returns true if the proving key is for the unbond_delegator_as_delegator function, false if otherwise
   * @returns {boolean}
   */
  isUnbondPublicProver() {
    const ret = wasm.provingkey_isUnbondPublicProver(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Return the checksum of the proving key
   *
   * @returns {string} Checksum of the proving key
   * @returns {string}
   */
  checksum() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.provingkey_checksum(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Create a copy of the proving key
   *
   * @returns {ProvingKey} A copy of the proving key
   * @returns {ProvingKey}
   */
  copy() {
    const ret = wasm.provingkey_copy(this.__wbg_ptr);
    return ProvingKey.__wrap(ret);
  }
  /**
   * Construct a new proving key from a byte array
   *
   * @param {Uint8Array} bytes Byte array representation of a proving key
   * @returns {ProvingKey | Error}
   * @param {Uint8Array} bytes
   * @returns {ProvingKey}
   */
  static fromBytes(bytes) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.provingkey_fromBytes(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return ProvingKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Create a proving key from string
   *
   * @param {string | Error} String representation of the proving key
   * @param {string} string
   * @returns {ProvingKey}
   */
  static fromString(string) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        string,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.provingkey_fromString(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return ProvingKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Return the byte representation of a proving key
   *
   * @returns {Uint8Array | Error} Byte array representation of a proving key
   * @returns {Uint8Array}
   */
  toBytes() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.provingkey_toBytes(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get a string representation of the proving key
   *
   * @returns {string} String representation of the proving key
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.provingkey_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}
/**
 * Encrypted Aleo record
 */
class RecordCiphertext {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(RecordCiphertext.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_recordciphertext_free(ptr);
  }
  /**
   * Create a record ciphertext from a string
   *
   * @param {string} record String representation of a record ciphertext
   * @returns {RecordCiphertext | Error} Record ciphertext
   * @param {string} record
   * @returns {RecordCiphertext}
   */
  static fromString(record) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        record,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.recordciphertext_fromString(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return RecordCiphertext.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Return the string reprensentation of the record ciphertext
   *
   * @returns {string} String representation of the record ciphertext
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.recordciphertext_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Decrypt the record ciphertext into plaintext using the view key. The record will only
   * decrypt if the record was encrypted by the account corresponding to the view key
   *
   * @param {ViewKey} view_key View key used to decrypt the ciphertext
   * @returns {RecordPlaintext | Error} Record plaintext object
   * @param {ViewKey} view_key
   * @returns {RecordPlaintext}
   */
  decrypt(view_key) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertClass(view_key, ViewKey);
      wasm.recordciphertext_decrypt(retptr, this.__wbg_ptr, view_key.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return RecordPlaintext.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Determines if the account corresponding to the view key is the owner of the record
   *
   * @param {ViewKey} view_key View key used to decrypt the ciphertext
   * @returns {boolean}
   * @param {ViewKey} view_key
   * @returns {boolean}
   */
  isOwner(view_key) {
    _assertClass(view_key, ViewKey);
    const ret = wasm.recordciphertext_isOwner(
      this.__wbg_ptr,
      view_key.__wbg_ptr,
    );
    return ret !== 0;
  }
}
/**
 * Plaintext representation of an Aleo record
 */
class RecordPlaintext {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(RecordPlaintext.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_recordplaintext_free(ptr);
  }
  /**
   * @param {string} program_id
   * @param {string} record_name
   * @returns {Field}
   */
  commitment(program_id, record_name) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        program_id,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(
        record_name,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      wasm.recordplaintext_commitment(
        retptr,
        this.__wbg_ptr,
        ptr0,
        len0,
        ptr1,
        len1,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Field.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Return a record plaintext from a string.
   *
   * @param {string} record String representation of a plaintext representation of an Aleo record
   * @returns {RecordPlaintext | Error} Record plaintext
   * @param {string} record
   * @returns {RecordPlaintext}
   */
  static fromString(record) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        record,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.recordplaintext_fromString(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return RecordPlaintext.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Returns the record plaintext string
   *
   * @returns {string} String representation of the record plaintext
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.recordplaintext_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Returns the amount of microcredits in the record
   *
   * @returns {u64} Amount of microcredits in the record
   * @returns {bigint}
   */
  microcredits() {
    const ret = wasm.recordplaintext_microcredits(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }
  /**
   * Returns the nonce of the record. This can be used to uniquely identify a record.
   *
   * @returns {string} Nonce of the record
   * @returns {string}
   */
  nonce() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.recordplaintext_nonce(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Attempt to get the serial number of a record to determine whether or not is has been spent
   *
   * @param {PrivateKey} private_key Private key of the account that owns the record
   * @param {string} program_id Program ID of the program that the record is associated with
   * @param {string} record_name Name of the record
   * @returns {string | Error} Serial number of the record
   * @param {PrivateKey} private_key
   * @param {string} program_id
   * @param {string} record_name
   * @returns {string}
   */
  serialNumberString(private_key, program_id, record_name) {
    let deferred4_0;
    let deferred4_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertClass(private_key, PrivateKey);
      const ptr0 = passStringToWasm0(
        program_id,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(
        record_name,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      wasm.recordplaintext_serialNumberString(
        retptr,
        this.__wbg_ptr,
        private_key.__wbg_ptr,
        ptr0,
        len0,
        ptr1,
        len1,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr3 = r0;
      var len3 = r1;
      if (r3) {
        ptr3 = 0;
        len3 = 0;
        throw takeObject(r2);
      }
      deferred4_0 = ptr3;
      deferred4_1 = len3;
      return getStringFromWasm0(ptr3, len3);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
  }
}
/**
 * Cryptographic signature of a message signed by an Aleo account
 */
class Signature {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Signature.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_signature_free(ptr);
  }
  /**
   * Sign a message with a private key
   *
   * @param {PrivateKey} private_key The private key to sign the message with
   * @param {Uint8Array} message Byte representation of the message to sign
   * @returns {Signature} Signature of the message
   * @param {PrivateKey} private_key
   * @param {Uint8Array} message
   * @returns {Signature}
   */
  static sign(private_key, message) {
    _assertClass(private_key, PrivateKey);
    const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.privatekey_sign(private_key.__wbg_ptr, ptr0, len0);
    return Signature.__wrap(ret);
  }
  /**
   * Verify a signature of a message with an address
   *
   * @param {Address} address The address to verify the signature with
   * @param {Uint8Array} message Byte representation of the message to verify
   * @returns {boolean} True if the signature is valid, false otherwise
   * @param {Address} address
   * @param {Uint8Array} message
   * @returns {boolean}
   */
  verify(address, message) {
    _assertClass(address, Address);
    const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.signature_verify(
      this.__wbg_ptr,
      address.__wbg_ptr,
      ptr0,
      len0,
    );
    return ret !== 0;
  }
  /**
   * Get a signature from a string representation of a signature
   *
   * @param {string} signature String representation of a signature
   * @returns {Signature} Signature
   * @param {string} signature
   * @returns {Signature}
   */
  static from_string(signature) {
    const ptr0 = passStringToWasm0(
      signature,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.signature_from_string(ptr0, len0);
    return Signature.__wrap(ret);
  }
  /**
   * Get a string representation of a signature
   *
   * @returns {string} String representation of a signature
   * @returns {string}
   */
  to_string() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.signature_to_string(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}
/**
 * Webassembly Representation of an Aleo transaction
 *
 * This object is created when generating an on-chain function deployment or execution and is the
 * object that should be submitted to the Aleo Network in order to deploy or execute a function.
 */
class Transaction {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Transaction.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_transaction_free(ptr);
  }
  /**
   * Create a transaction from a string
   *
   * @param {string} transaction String representation of a transaction
   * @returns {Transaction | Error}
   * @param {string} transaction
   * @returns {Transaction}
   */
  static fromString(transaction) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        transaction,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.transaction_fromString(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Transaction.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get the transaction as a string. If you want to submit this transaction to the Aleo Network
   * this function will create the string that should be submitted in the `POST` data.
   *
   * @returns {string} String representation of the transaction
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.transaction_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Get the id of the transaction. This is the merkle root of the transaction's inclusion proof.
   *
   * This value can be used to query the status of the transaction on the Aleo Network to see
   * if it was successful. If successful, the transaction will be included in a block and this
   * value can be used to lookup the transaction data on-chain.
   *
   * @returns {string} Transaction id
   * @returns {string}
   */
  transactionId() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.transaction_transactionId(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Get the type of the transaction (will return "deploy" or "execute")
   *
   * @returns {string} Transaction type
   * @returns {string}
   */
  transactionType() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.transaction_transactionType(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}
/**
 * Verifying key for a function within an Aleo program
 */
class VerifyingKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(VerifyingKey.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_verifyingkey_free(ptr);
  }
  /**
   * Returns the verifying key for the bond_public function
   *
   * @returns {VerifyingKey} Verifying key for the bond_public function
   * @returns {VerifyingKey}
   */
  static bondPublicVerifier() {
    const ret = wasm.verifyingkey_bondPublicVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the claim_delegator function
   *
   * @returns {VerifyingKey} Verifying key for the claim_unbond_public function
   * @returns {VerifyingKey}
   */
  static claimUnbondPublicVerifier() {
    const ret = wasm.verifyingkey_claimUnbondPublicVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the fee_private function
   *
   * @returns {VerifyingKey} Verifying key for the fee_private function
   * @returns {VerifyingKey}
   */
  static feePrivateVerifier() {
    const ret = wasm.verifyingkey_feePrivateVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the fee_public function
   *
   * @returns {VerifyingKey} Verifying key for the fee_public function
   * @returns {VerifyingKey}
   */
  static feePublicVerifier() {
    const ret = wasm.verifyingkey_feePublicVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the inclusion function
   *
   * @returns {VerifyingKey} Verifying key for the inclusion function
   * @returns {VerifyingKey}
   */
  static inclusionVerifier() {
    const ret = wasm.verifyingkey_inclusionVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the join function
   *
   * @returns {VerifyingKey} Verifying key for the join function
   * @returns {VerifyingKey}
   */
  static joinVerifier() {
    const ret = wasm.verifyingkey_joinVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the set_validator_state function
   *
   * @returns {VerifyingKey} Verifying key for the set_validator_state function
   * @returns {VerifyingKey}
   */
  static setValidatorStateVerifier() {
    const ret = wasm.verifyingkey_setValidatorStateVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the split function
   *
   * @returns {VerifyingKey} Verifying key for the split function
   * @returns {VerifyingKey}
   */
  static splitVerifier() {
    const ret = wasm.verifyingkey_splitVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the transfer_private function
   *
   * @returns {VerifyingKey} Verifying key for the transfer_private function
   * @returns {VerifyingKey}
   */
  static transferPrivateVerifier() {
    const ret = wasm.verifyingkey_transferPrivateVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the transfer_private_to_public function
   *
   * @returns {VerifyingKey} Verifying key for the transfer_private_to_public function
   * @returns {VerifyingKey}
   */
  static transferPrivateToPublicVerifier() {
    const ret = wasm.verifyingkey_transferPrivateToPublicVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the transfer_public function
   *
   * @returns {VerifyingKey} Verifying key for the transfer_public function
   * @returns {VerifyingKey}
   */
  static transferPublicVerifier() {
    const ret = wasm.verifyingkey_transferPublicVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the transfer_public_to_private function
   *
   * @returns {VerifyingKey} Verifying key for the transfer_public_to_private function
   * @returns {VerifyingKey}
   */
  static transferPublicToPrivateVerifier() {
    const ret = wasm.verifyingkey_transferPublicToPrivateVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the unbond_delegator_as_delegator function
   *
   * @returns {VerifyingKey} Verifying key for the unbond_delegator_as_delegator function
   * @returns {VerifyingKey}
   */
  static unbondDelegatorAsValidatorVerifier() {
    const ret = wasm.verifyingkey_unbondDelegatorAsValidatorVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the unbond_delegator_as_delegator function
   *
   * @returns {VerifyingKey} Verifying key for the unbond_delegator_as_delegator function
   * @returns {VerifyingKey}
   */
  static unbondPublicVerifier() {
    const ret = wasm.verifyingkey_unbondPublicVerifier();
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Returns the verifying key for the bond_public function
   *
   * @returns {VerifyingKey} Verifying key for the bond_public function
   * @returns {boolean}
   */
  isBondPublicVerifier() {
    const ret = wasm.verifyingkey_isBondPublicVerifier(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the claim_delegator function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isClaimUnbondPublicVerifier() {
    const ret = wasm.verifyingkey_isClaimUnbondPublicVerifier(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the fee_private function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isFeePrivateVerifier() {
    const ret = wasm.verifyingkey_isFeePrivateVerifier(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the fee_public function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isFeePublicVerifier() {
    const ret = wasm.verifyingkey_isFeePublicVerifier(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the inclusion function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isInclusionVerifier() {
    const ret = wasm.verifyingkey_isInclusionVerifier(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the join function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isJoinVerifier() {
    const ret = wasm.verifyingkey_isJoinVerifier(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the set_validator_state function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isSetValidatorStateVerifier() {
    const ret = wasm.verifyingkey_isSetValidatorStateVerifier(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the split function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isSplitVerifier() {
    const ret = wasm.verifyingkey_isSplitVerifier(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the transfer_private function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isTransferPrivateVerifier() {
    const ret = wasm.verifyingkey_isTransferPrivateVerifier(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the transfer_private_to_public function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isTransferPrivateToPublicVerifier() {
    const ret = wasm.verifyingkey_isTransferPrivateToPublicVerifier(
      this.__wbg_ptr,
    );
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the transfer_public function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isTransferPublicVerifier() {
    const ret = wasm.verifyingkey_isTransferPublicVerifier(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the transfer_public_to_private function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isTransferPublicToPrivateVerifier() {
    const ret = wasm.verifyingkey_isTransferPublicToPrivateVerifier(
      this.__wbg_ptr,
    );
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the unbond_delegator_as_delegator function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isUnbondDelegatorAsValidatorVerifier() {
    const ret = wasm.verifyingkey_isUnbondDelegatorAsValidatorVerifier(
      this.__wbg_ptr,
    );
    return ret !== 0;
  }
  /**
   * Verifies the verifying key is for the unbond_public function
   *
   * @returns {bool}
   * @returns {boolean}
   */
  isUnbondPublicVerifier() {
    const ret = wasm.verifyingkey_isUnbondPublicVerifier(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * Get the checksum of the verifying key
   *
   * @returns {string} Checksum of the verifying key
   * @returns {string}
   */
  checksum() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.verifyingkey_checksum(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Create a copy of the verifying key
   *
   * @returns {VerifyingKey} A copy of the verifying key
   * @returns {VerifyingKey}
   */
  copy() {
    const ret = wasm.provingkey_copy(this.__wbg_ptr);
    return VerifyingKey.__wrap(ret);
  }
  /**
   * Construct a new verifying key from a byte array
   *
   * @param {Uint8Array} bytes Byte representation of a verifying key
   * @returns {VerifyingKey | Error}
   * @param {Uint8Array} bytes
   * @returns {VerifyingKey}
   */
  static fromBytes(bytes) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.verifyingkey_fromBytes(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return VerifyingKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Create a verifying key from string
   *
   * @param {String} string String representation of a verifying key
   * @returns {VerifyingKey | Error}
   * @param {string} string
   * @returns {VerifyingKey}
   */
  static fromString(string) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        string,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.verifyingkey_fromString(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return VerifyingKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Create a byte array from a verifying key
   *
   * @returns {Uint8Array | Error} Byte representation of a verifying key
   * @returns {Uint8Array}
   */
  toBytes() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.verifyingkey_toBytes(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      var v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Get a string representation of the verifying key
   *
   * @returns {String} String representation of the verifying key
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.verifyingkey_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}
/**
 */
class ViewKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(ViewKey.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_viewkey_free(ptr);
  }
  /**
   * Create a new view key from a private key
   *
   * @param {PrivateKey} private_key Private key
   * @returns {ViewKey} View key
   * @param {PrivateKey} private_key
   * @returns {ViewKey}
   */
  static from_private_key(private_key) {
    _assertClass(private_key, PrivateKey);
    const ret = wasm.privatekey_to_view_key(private_key.__wbg_ptr);
    return ViewKey.__wrap(ret);
  }
  /**
   * Create a new view key from a string representation of a view key
   *
   * @param {string} view_key String representation of a view key
   * @returns {ViewKey} View key
   * @param {string} view_key
   * @returns {ViewKey}
   */
  static from_string(view_key) {
    const ptr0 = passStringToWasm0(
      view_key,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.viewkey_from_string(ptr0, len0);
    return ViewKey.__wrap(ret);
  }
  /**
   * Get a string representation of a view key
   *
   * @returns {string} String representation of a view key
   * @returns {string}
   */
  to_string() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.viewkey_to_string(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Get the address corresponding to a view key
   *
   * @returns {Address} Address
   * @returns {Address}
   */
  to_address() {
    const ret = wasm.address_from_view_key(this.__wbg_ptr);
    return Address.__wrap(ret);
  }
  /**
   * Decrypt a record ciphertext with a view key
   *
   * @param {string} ciphertext String representation of a record ciphertext
   * @returns {string} String representation of a record plaintext
   * @param {string} ciphertext
   * @returns {string}
   */
  decrypt(ciphertext) {
    let deferred3_0;
    let deferred3_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        ciphertext,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.viewkey_decrypt(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr2 = r0;
      var len2 = r1;
      if (r3) {
        ptr2 = 0;
        len2 = 0;
        throw takeObject(r2);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }
}

async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn(
            "`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
            e,
          );
        } else {
          throw e;
        }
      }
    }

    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}

function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
    takeObject(arg0);
  };
  imports.wbg.__wbg_new_daafff584c71593b = function () {
    return handleError(function () {
      const ret = new XMLHttpRequest();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_overrideMimeType_1a661d17da5f8baf = function () {
    return handleError(function (arg0, arg1, arg2) {
      getObject(arg0).overrideMimeType(getStringFromWasm0(arg1, arg2));
    }, arguments);
  };
  imports.wbg.__wbg_open_56fa1eb95989f6a5 = function () {
    return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
      getObject(arg0).open(
        getStringFromWasm0(arg1, arg2),
        getStringFromWasm0(arg3, arg4),
        arg5 !== 0,
      );
    }, arguments);
  };
  imports.wbg.__wbg_send_9f5007eae908c72e = function () {
    return handleError(function (arg0) {
      getObject(arg0).send();
    }, arguments);
  };
  imports.wbg.__wbg_response_f2acf2ecbe021710 = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).response;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_new_b51585de1b234aff = function () {
    const ret = new Object();
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_set_092e06b0f9d71865 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = Reflect.set(
        getObject(arg0),
        getObject(arg1),
        getObject(arg2),
      );
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_new_1eead62f64ca15ce = function () {
    return handleError(function () {
      const ret = new Headers();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_append_fda9e3432e3e88da = function () {
    return handleError(function (arg0, arg1, arg2, arg3, arg4) {
      getObject(arg0).append(
        getStringFromWasm0(arg1, arg2),
        getStringFromWasm0(arg3, arg4),
      );
    }, arguments);
  };
  imports.wbg.__wbg_new_55c9955722952374 = function () {
    return handleError(function () {
      const ret = new AbortController();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_signal_4bd18fb489af2d4c = function (arg0) {
    const ret = getObject(arg0).signal;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_instanceof_Response_fc4327dbfcdf5ced = function (arg0) {
    let result;
    try {
      result = getObject(arg0) instanceof Response;
    } catch {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbg_status_ac85a3142a84caa2 = function (arg0) {
    const ret = getObject(arg0).status;
    return ret;
  };
  imports.wbg.__wbg_url_8503de97f69da463 = function (arg0, arg1) {
    const ret = getObject(arg1).url;
    const ptr1 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbg_headers_b70de86b8e989bc0 = function (arg0) {
    const ret = getObject(arg0).headers;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_iterator_97f0c81209c6c35a = function () {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_get_97b561fb56f034b5 = function () {
    return handleError(function (arg0, arg1) {
      const ret = Reflect.get(getObject(arg0), getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_is_function = function (arg0) {
    const ret = typeof getObject(arg0) === "function";
    return ret;
  };
  imports.wbg.__wbg_call_cb65541d95d71282 = function () {
    return handleError(function (arg0, arg1) {
      const ret = getObject(arg0).call(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_is_object = function (arg0) {
    const val = getObject(arg0);
    const ret = typeof val === "object" && val !== null;
    return ret;
  };
  imports.wbg.__wbg_next_526fc47e980da008 = function (arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_next_ddb3312ca1c4e32a = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).next();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_done_5c1f01fb660d73b5 = function (arg0) {
    const ret = getObject(arg0).done;
    return ret;
  };
  imports.wbg.__wbg_value_1695675138684bd5 = function (arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_abort_654b796176d117aa = function (arg0) {
    getObject(arg0).abort();
  };
  imports.wbg.__wbg_stringify_e25465938f3f611f = function () {
    return handleError(function (arg0) {
      const ret = JSON.stringify(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_string_get = function (arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof obj === "string" ? obj : undefined;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbg_call_01734de55d61e11d = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_transaction_new = function (arg0) {
    const ret = Transaction.__wrap(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_executionresponse_new = function (arg0) {
    const ret = ExecutionResponse.__wrap(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_log_0159ca40cddf5b15 = function (arg0, arg1) {
    console.log(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbg_newwithlength_3ec098a360da1909 = function (arg0) {
    const ret = new Array(arg0 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_set_502d29070ea18557 = function (arg0, arg1, arg2) {
    getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
  };
  imports.wbg.__wbg_keypair_new = function (arg0) {
    const ret = KeyPair.__wrap(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_bigint_from_u64 = function (arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_module = function () {
    const ret = __wbg_init.__wbindgen_wasm_module;
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_memory = function () {
    const ret = wasm.memory;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_spawnWorker_f6acaddb2e29dc4a = function (
    arg0,
    arg1,
    arg2,
    arg3,
  ) {
    const ret = spawnWorker(
      getObject(arg0),
      getObject(arg1),
      getObject(arg2),
      arg3,
    );
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_cb_drop = function (arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
      obj.a = 0;
      return true;
    }
    const ret = false;
    return ret;
  };
  imports.wbg.__wbg_arrayBuffer_288fb3538806e85c = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).arrayBuffer();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_new_8125e318e6245eed = function (arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_length_72e2208bbc0efc61 = function (arg0) {
    const ret = getObject(arg0).length;
    return ret;
  };
  imports.wbg.__wbg_new_43f1b47c28813cbd = function (arg0, arg1) {
    try {
      var state0 = { a: arg0, b: arg1 };
      var cb0 = (arg0, arg1) => {
        const a = state0.a;
        state0.a = 0;
        try {
          return __wbg_adapter_251(a, state0.b, arg0, arg1);
        } finally {
          state0.a = a;
        }
      };
      const ret = new Promise(cb0);
      return addHeapObject(ret);
    } finally {
      state0.a = state0.b = 0;
    }
  };
  imports.wbg.__wbg_new_898a68150f225f2e = function () {
    const ret = new Array();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_push_ca1c26067ef907ac = function (arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
  };
  imports.wbg.__wbindgen_number_new = function (arg0) {
    const ret = arg0;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_new_abda76e883ba8a5f = function () {
    const ret = new Error();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_stack_658279fe44541cf6 = function (arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr1 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbg_error_f851667af71bcfc6 = function (arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
      deferred0_0 = arg0;
      deferred0_1 = arg1;
      console.error(getStringFromWasm0(arg0, arg1));
    } finally {
      wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
  };
  imports.wbg.__wbg_subarray_13db269f57aa838d = function (arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_getRandomValues_37fa2ca9e4e07fab = function () {
    return handleError(function (arg0, arg1) {
      getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments);
  };
  imports.wbg.__wbg_buffer_085ec1f694018c4f = function (arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_set_5cf90238115182c3 = function (arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
  };
  imports.wbg.__wbg_newwithbyteoffsetandlength_6da8e527659b86aa = function (
    arg0,
    arg1,
    arg2,
  ) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_randomFillSync_dc1e9a60c158336d = function () {
    return handleError(function (arg0, arg1) {
      getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments);
  };
  imports.wbg.__wbg_crypto_c48a774b022d20ac = function (arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_process_298734cf255a885d = function (arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_versions_e2e78e134e3e5d01 = function (arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_node_1cd7a5d853dbea79 = function (arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_is_string = function (arg0) {
    const ret = typeof getObject(arg0) === "string";
    return ret;
  };
  imports.wbg.__wbg_msCrypto_bcb970640f50a1e8 = function (arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_newwithlength_e5d69174d6984cd7 = function (arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_require_8f08ceecec0f4fee = function () {
    return handleError(function () {
      const ret = module.require;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_length_fff51ee6522a1a18 = function (arg0) {
    const ret = getObject(arg0).length;
    return ret;
  };
  imports.wbg.__wbg_get_44be0491f933a435 = function (arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_self_1ff1d729e9aae938 = function () {
    return handleError(function () {
      const ret = self.self;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_window_5f4faef6c12b79ec = function () {
    return handleError(function () {
      const ret = window.window;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_globalThis_1d39714405582d3c = function () {
    return handleError(function () {
      const ret = globalThis.globalThis;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_global_651f05c6a0944d1c = function () {
    return handleError(function () {
      const ret = global.global;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_is_undefined = function (arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
  };
  imports.wbg.__wbg_newnoargs_581967eacc0e2604 = function (arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_has_c5fcd020291e56b8 = function () {
    return handleError(function (arg0, arg1) {
      const ret = Reflect.has(getObject(arg0), getObject(arg1));
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_fetch_8eaf01857a5bb21f = function (arg0, arg1) {
    const ret = getObject(arg0).fetch(getObject(arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_fetch_b5d6bebed1e6c2d2 = function (arg0) {
    const ret = fetch(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbindgen_throw = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbindgen_rethrow = function (arg0) {
    throw takeObject(arg0);
  };
  imports.wbg.__wbg_then_b2267541e2a73865 = function (arg0, arg1, arg2) {
    const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_then_f7e06ee3c11698eb = function (arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_resolve_53698b95aaf7fcf8 = function (arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_waitAsync_60fb5e2e86467e31 = function () {
    const ret = Atomics.waitAsync;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_new_a0af68041688e8fd = function (arg0) {
    const ret = new Int32Array(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_waitAsync_73fd6eb3bace0a8d = function (arg0, arg1, arg2) {
    const ret = Atomics.waitAsync(getObject(arg0), arg1, arg2);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_async_e1a2a669aacf35ff = function (arg0) {
    const ret = getObject(arg0).async;
    return ret;
  };
  imports.wbg.__wbg_value_555e4f564193db05 = function (arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_link_22046963fe0b707a = function (arg0) {
    const ret =
      "data:application/javascript," +
      encodeURIComponent(`onmessage = function (ev) {
            let [ia, index, value] = ev.data;
            ia = new Int32Array(ia.buffer);
            let result = Atomics.wait(ia, index, value);
            postMessage(result);
        };
        `);
    const ptr1 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbg_new_8e7322f46d5d019c = function () {
    return handleError(function (arg0, arg1) {
      const ret = new Worker(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_setonmessage_f0bd0280573b7084 = function (arg0, arg1) {
    getObject(arg0).onmessage = getObject(arg1);
  };
  imports.wbg.__wbg_of_3f69007bb4eeae65 = function (arg0, arg1, arg2) {
    const ret = Array.of(getObject(arg0), getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_postMessage_8c609e2bde333d9c = function () {
    return handleError(function (arg0, arg1) {
      getObject(arg0).postMessage(getObject(arg1));
    }, arguments);
  };
  imports.wbg.__wbg_data_ab99ae4a2e1e8bc9 = function (arg0) {
    const ret = getObject(arg0).data;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_newwithstrandinit_cad5cd6038c7ff5d = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_status_114ef6fe27fb8b00 = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).status;
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_responseText_da275667251fd153 = function () {
    return handleError(function (arg0, arg1) {
      const ret = getObject(arg1).responseText;
      var ptr1 = isLikeNone(ret)
        ? 0
        : passStringToWasm0(
            ret,
            wasm.__wbindgen_malloc,
            wasm.__wbindgen_realloc,
          );
      var len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbindgen_closure_wrapper5655 = function (arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 543, __wbg_adapter_34);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_closure_wrapper5678 = function (arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 543, __wbg_adapter_34);
    return addHeapObject(ret);
  };

  return imports;
}

function __wbg_init_memory(imports, maybe_memory) {
  imports.wbg.memory =
    maybe_memory ||
    new WebAssembly.Memory({ initial: 169, maximum: 65536, shared: true });
}

function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedBigInt64Memory0 = null;
  cachedInt32Memory0 = null;
  cachedUint8Memory0 = null;

  wasm.__wbindgen_start();
  return wasm;
}

function initSync(module, maybe_memory) {
  if (wasm !== undefined) return wasm;

  const imports = __wbg_get_imports();

  __wbg_init_memory(imports, maybe_memory);

  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }

  const instance = new WebAssembly.Instance(module, imports);

  return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input, maybe_memory) {
  if (wasm !== undefined) return wasm;

  const imports = __wbg_get_imports();

  if (
    typeof input === "string" ||
    (typeof Request === "function" && input instanceof Request) ||
    (typeof URL === "function" && input instanceof URL)
  ) {
    input = fetch(input);
  }

  __wbg_init_memory(imports, maybe_memory);

  const { instance, module } = await __wbg_load(await input, imports);

  return __wbg_finalize_init(instance, module);
}

var exports = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  Address: Address,
  Execution: Execution,
  ExecutionResponse: ExecutionResponse,
  Field: Field,
  KeyPair: KeyPair,
  OfflineQuery: OfflineQuery,
  PrivateKey: PrivateKey,
  PrivateKeyCiphertext: PrivateKeyCiphertext,
  Program: Program,
  ProgramManager: ProgramManager,
  ProvingKey: ProvingKey,
  RecordCiphertext: RecordCiphertext,
  RecordPlaintext: RecordPlaintext,
  Signature: Signature,
  Transaction: Transaction,
  VerifyingKey: VerifyingKey,
  ViewKey: ViewKey,
  default: __wbg_init,
  initSync: initSync,
  initThreadPool: initThreadPool,
  runRayonThread: runRayonThread,
  verifyFunctionExecution: verifyFunctionExecution,
});

const wasm_path = "assets/aleo_wasm.wasm";

var Cargo = async (opt = {}) => {
  let { importHook, serverPath, initializeHook } = opt;

  let final_path = wasm_path;

  if (serverPath != null) {
    final_path = serverPath + /[^\/\\]*$/.exec(final_path)[0];
  }

  if (importHook != null) {
    final_path = importHook(final_path);
  }

  if (initializeHook != null) {
    await initializeHook(__wbg_init, final_path);
  } else {
    await __wbg_init(final_path);
  }

  return exports;
};

async function initializeWorker(wasm) {
  // Wait for the main thread to send us the Module, Memory, and Rayon thread pointer.
  function wait() {
    return new Promise((resolve) => {
      addEventListener(
        "message",
        (event) => {
          resolve(event.data);
        },
        {
          capture: true,
          once: true,
        },
      );
    });
  }

  const [initWasm, { module, memory, address }] = await Promise.all([
    wasm,
    wait(),
  ]);

  // Runs the Wasm inside of the Worker, but using the main thread's Module and Memory.
  const exports = await initWasm({
    initializeHook: (init, path) => init(module, memory),
  });

  // Tells the main thread that we're finished initializing.
  postMessage(null);

  // This will hang the Worker while running the Rayon thread.
  exports.runRayonThread(address);

  // When the Rayon thread is finished, close the Worker.
  close();
}

await initializeWorker(Cargo);
//# sourceMappingURL=worker.js.map
