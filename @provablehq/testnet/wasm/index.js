function spawnWorker(url, module, memory, address) {
        return new Promise((resolve) => {
            const worker = new Worker(url, {
                type: "module",
            });

            worker.addEventListener("message", (event) => {
                // This is needed in Node to wait one extra tick, so that way
                // the Worker can fully initialize before we return.
                setTimeout(() => {
                    resolve(worker);

                    // When running in Node, this allows the process to exit
                    // even though the Worker is still running.
                    if (worker.unref) {
                        worker.unref();
                    }
                }, 0);
            }, {
                capture: true,
                once: true,
            });

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

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); }
let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.buffer !== wasm.memory.buffer) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().slice(ptr, ptr + len));
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_1(addHeapObject(e));
    }
}

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

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
};

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_5.get(state.dtor)(state.a, state.b);
});

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
                wasm.__wbindgen_export_5.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
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
function verifyFunctionExecution(execution, verifying_key, program, function_id) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(execution, Execution);
        _assertClass(verifying_key, VerifyingKey);
        _assertClass(program, Program);
        const ptr0 = passStringToWasm0(function_id, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        wasm.verifyFunctionExecution(retptr, execution.__wbg_ptr, verifying_key.__wbg_ptr, program.__wbg_ptr, ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return r0 !== 0;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let stack_pointer = 128;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
 * @param {string} value
 * @returns {string}
 */
function hashBHP256(value) {
    let deferred3_0;
    let deferred3_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        wasm.hashBHP256(retptr, ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
        var ptr2 = r0;
        var len2 = r1;
        if (r3) {
            ptr2 = 0; len2 = 0;
            throw takeObject(r2);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export_2(deferred3_0, deferred3_1, 1);
    }
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
function initThreadPool$1(url, num_threads) {
    const ret = wasm.initThreadPool(addHeapObject(url), num_threads);
    return takeObject(ret);
}

function __wbg_adapter_40(arg0, arg1, arg2) {
    wasm.__wbindgen_export_6(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_535(arg0, arg1, arg2, arg3) {
    wasm.__wbindgen_export_7(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];

const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];

const AddressFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_address_free(ptr >>> 0, 1));
/**
 * Public address of an Aleo account
 */
class Address {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Address.prototype);
        obj.__wbg_ptr = ptr;
        AddressFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AddressFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_address_free(ptr, 0);
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
     * Derive an Aleo address from a compute key.
     *
     * @param {ComputeKey} compute_key The compute key to derive the address from
     * @param {ComputeKey} compute_key
     * @returns {Address}
     */
    static from_compute_key(compute_key) {
        _assertClass(compute_key, ComputeKey);
        const ret = wasm.address_from_compute_key(compute_key.__wbg_ptr);
        return Address.__wrap(ret);
    }
    /**
     * Get an address from a series of bytes.
     *
     * @param {Uint8Array} bytes A left endian byte array representing the address.
     *
     * @returns {Address} The address object.
     * @param {Uint8Array} bytes
     * @returns {Address}
     */
    static fromBytesLe(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_fromBytesLe(retptr, addHeapObject(bytes));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Address.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the left endian byte array representation of the address.
     * @returns {Uint8Array}
     */
    toBytesLe() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_toBytesLe(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get an address from a series of bits represented as a boolean array.
     *
     * @param {Array} bits A left endian boolean array representing the bits of the address.
     *
     * @returns {Address} The address object.
     * @param {Array<any>} bits
     * @returns {Address}
     */
    static fromBitsLe(bits) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_fromBitsLe(retptr, addHeapObject(bits));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Address.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the left endian boolean array representation of the bits of the address.
     * @returns {Array<any>}
     */
    toBitsLe() {
        const ret = wasm.address_toBitsLe(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get an address object from an array of fields.
     *
     * @param {Array} fields An array of fields.
     *
     * @returns {Plaintext} The address object.
     * @param {Array<any>} fields
     * @returns {Address}
     */
    static fromFields(fields) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_fromFields(retptr, addHeapObject(fields));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Address.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the field array representation of the address.
     * @returns {Array<any>}
     */
    toFields() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_toFields(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get an address object from a group.
     *
     * @param {Group} group The group object.
     *
     * @returns {Address} The address object.
     * @param {Group} group
     * @returns {Address}
     */
    static fromGroup(group) {
        _assertClass(group, Group);
        var ptr0 = group.__destroy_into_raw();
        const ret = wasm.address_fromGroup(ptr0);
        return Address.__wrap(ret);
    }
    /**
     * Get the group representation of the address object.
     * @returns {Group}
     */
    toGroup() {
        const ret = wasm.address_toGroup(this.__wbg_ptr);
        return Group.__wrap(ret);
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
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the plaintext representation of the address.
     * @returns {Plaintext}
     */
    toPlaintext() {
        const ret = wasm.address_toPlaintext(this.__wbg_ptr);
        return Plaintext.__wrap(ret);
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
        const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_export_3);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(signature, Signature);
        const ret = wasm.address_verify(this.__wbg_ptr, ptr0, len0, signature.__wbg_ptr);
        return ret !== 0;
    }
}

const BHP1024Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_bhp1024_free(ptr >>> 0, 1));

class BHP1024 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BHP1024.prototype);
        obj.__wbg_ptr = ptr;
        BHP1024Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BHP1024Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bhp1024_free(ptr, 0);
    }
    /**
     * Create a BHP hasher with an input size of 1024 bits.
     */
    constructor() {
        const ret = wasm.bhp1024_new();
        this.__wbg_ptr = ret >>> 0;
        BHP1024Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create a BHP hasher with an input size of 1024 bits with a custom domain separator.
     * @param {string} domain_separator
     * @returns {BHP1024}
     */
    static setup(domain_separator) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(domain_separator, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.bhp1024_setup(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return BHP1024.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the BHP hash with an input hasher of 1024 bits.
     * @param {Array<any>} input
     * @returns {Field}
     */
    hash(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bhp1024_hash(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP hash with an input hasher of 1024 bits.
     * @param {Array<any>} input
     * @returns {Group}
     */
    hashToGroup(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bhp1024_hashToGroup(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP commitment with an input hasher of 1024 bits and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Field}
     */
    commit(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.bhp1024_commit(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP commitment with an input hasher of 1024 bits and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Group}
     */
    commitToGroup(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.bhp1024_commitToGroup(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const BHP256Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_bhp256_free(ptr >>> 0, 1));

class BHP256 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BHP256.prototype);
        obj.__wbg_ptr = ptr;
        BHP256Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BHP256Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bhp256_free(ptr, 0);
    }
    /**
     * Create a BHP hasher with an input size of 256 bits.
     */
    constructor() {
        const ret = wasm.bhp256_new();
        this.__wbg_ptr = ret >>> 0;
        BHP256Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create a BHP hasher with an input size of 256 bits with a custom domain separator.
     * @param {string} domain_separator
     * @returns {BHP256}
     */
    static setup(domain_separator) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(domain_separator, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.bhp256_setup(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return BHP256.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the BHP hash with an input hasher of 256 bits.
     * @param {Array<any>} input
     * @returns {Field}
     */
    hash(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bhp256_hash(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP hash with an input hasher of 256 bits.
     * @param {Array<any>} input
     * @returns {Group}
     */
    hashToGroup(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bhp256_hashToGroup(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP commitment with an input hasher of 256 bits and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Field}
     */
    commit(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.bhp256_commit(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP commitment with an input hasher of 256 bits and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Group}
     */
    commitToGroup(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.bhp256_commitToGroup(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const BHP512Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_bhp512_free(ptr >>> 0, 1));

class BHP512 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BHP512.prototype);
        obj.__wbg_ptr = ptr;
        BHP512Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BHP512Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bhp512_free(ptr, 0);
    }
    /**
     * Create a BHP hasher with an input size of 512 bits.
     */
    constructor() {
        const ret = wasm.bhp512_new();
        this.__wbg_ptr = ret >>> 0;
        BHP512Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create a BHP hasher with an input size of 512 bits with a custom domain separator.
     * @param {string} domain_separator
     * @returns {BHP512}
     */
    static setup(domain_separator) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(domain_separator, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.bhp512_setup(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return BHP512.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the BHP hash with an input hasher of 512 bits.
     * @param {Array<any>} input
     * @returns {Field}
     */
    hash(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bhp512_hash(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP hash with an input hasher of 512 bits.
     * @param {Array<any>} input
     * @returns {Group}
     */
    hashToGroup(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bhp512_hashToGroup(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP commitment with an input hasher of 512 bits and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Field}
     */
    commit(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.bhp512_commit(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP commitment with an input hasher of 512 bits and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Group}
     */
    commitToGroup(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.bhp512_commitToGroup(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const BHP768Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_bhp768_free(ptr >>> 0, 1));

class BHP768 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BHP768.prototype);
        obj.__wbg_ptr = ptr;
        BHP768Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BHP768Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bhp768_free(ptr, 0);
    }
    /**
     * Create a BHP hasher with an input size of 768 bits.
     */
    constructor() {
        const ret = wasm.bhp768_new();
        this.__wbg_ptr = ret >>> 0;
        BHP768Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create a BHP hasher with an input size of 768 bits with a custom domain separator.
     * @param {string} domain_separator
     * @returns {BHP768}
     */
    static setup(domain_separator) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(domain_separator, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.bhp768_setup(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return BHP768.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the BHP hash with an input hasher of 768 bits.
     * @param {Array<any>} input
     * @returns {Field}
     */
    hash(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bhp768_hash(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP hash with an input hasher of 768 bits.
     * @param {Array<any>} input
     * @returns {Group}
     */
    hashToGroup(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bhp768_hashToGroup(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP commitment with an input hasher of 768 bits and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Field}
     */
    commit(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.bhp768_commit(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a BHP commitment with an input hasher of 768 bits and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Group}
     */
    commitToGroup(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.bhp768_commitToGroup(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const CiphertextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_ciphertext_free(ptr >>> 0, 1));
/**
 * SnarkVM Ciphertext object. A Ciphertext represents an symmetrically encrypted plaintext. This
 * object provides decryption methods to recover the plaintext from the ciphertext (given the
 * api consumer has the proper decryption materials).
 *
 * @example
 */
class Ciphertext {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Ciphertext.prototype);
        obj.__wbg_ptr = ptr;
        CiphertextFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CiphertextFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ciphertext_free(ptr, 0);
    }
    /**
     * Decrypt the ciphertext using the given view key.
     *
     * @param {ViewKey} viewKey The view key of the account that encrypted the ciphertext.
     * @param {Group} nonce The nonce used to encrypt the ciphertext.
     *
     * @returns {Plaintext} The decrypted plaintext.
     * @param {ViewKey} view_key
     * @param {Group} nonce
     * @returns {Plaintext}
     */
    decrypt(view_key, nonce) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(view_key, ViewKey);
            var ptr0 = view_key.__destroy_into_raw();
            _assertClass(nonce, Group);
            var ptr1 = nonce.__destroy_into_raw();
            wasm.ciphertext_decrypt(retptr, this.__wbg_ptr, ptr0, ptr1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Plaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Decrypt a ciphertext using the view key of the transition signer, transition public key, and
     * (program, function, index) tuple.
     * @param {ViewKey} view_key
     * @param {Group} transition_public_key
     * @param {string} program
     * @param {string} function_name
     * @param {number} index
     * @returns {Plaintext}
     */
    decryptWithTransitionInfo(view_key, transition_public_key, program, function_name, index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(view_key, ViewKey);
            var ptr0 = view_key.__destroy_into_raw();
            _assertClass(transition_public_key, Group);
            var ptr1 = transition_public_key.__destroy_into_raw();
            const ptr2 = passStringToWasm0(program, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(function_name, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len3 = WASM_VECTOR_LEN;
            wasm.ciphertext_decryptWithTransitionInfo(retptr, this.__wbg_ptr, ptr0, ptr1, ptr2, len2, ptr3, len3, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Plaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Decrypt a ciphertext using the transition view key and a (program, function, index) tuple.
     * @param {Field} transition_view_key
     * @param {string} program
     * @param {string} function_name
     * @param {number} index
     * @returns {Plaintext}
     */
    decryptWithTransitionViewKey(transition_view_key, program, function_name, index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(transition_view_key, Field);
            var ptr0 = transition_view_key.__destroy_into_raw();
            const ptr1 = passStringToWasm0(program, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(function_name, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len2 = WASM_VECTOR_LEN;
            wasm.ciphertext_decryptWithTransitionViewKey(retptr, this.__wbg_ptr, ptr0, ptr1, len1, ptr2, len2, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Plaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Decrypts a ciphertext into plaintext using the given ciphertext view key.
     *
     * @param {Field} transition_view_key The transition view key that was used to encrypt the ciphertext.
     *
     * @returns {Plaintext} The decrypted plaintext.
     * @param {Field} transition_view_key
     * @returns {Plaintext}
     */
    decryptSymmetric(transition_view_key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(transition_view_key, Field);
            var ptr0 = transition_view_key.__destroy_into_raw();
            wasm.ciphertext_decryptSymmetric(retptr, this.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Plaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deserialize a left endian byte array into a Ciphertext.
     *
     * @param {Uint8Array} bytes The byte array representing the Ciphertext.
     *
     * @returns {Ciphertext} The Ciphertext object.
     * @param {Uint8Array} bytes
     * @returns {Ciphertext}
     */
    static fromBytesLe(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ciphertext_fromBytesLe(retptr, addHeapObject(bytes));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Ciphertext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the left endian byte array representation of the ciphertext.
     * @returns {Uint8Array}
     */
    toBytesLe() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ciphertext_toBytes(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get a ciphertext object from a series of bits represented as a boolean array.
     *
     * @param {Array} bits A left endian boolean array representing the bits of the ciphertext.
     *
     * @returns {Ciphertext} The ciphertext object.
     * @param {Array<any>} bits
     * @returns {Ciphertext}
     */
    static fromBitsLe(bits) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ciphertext_fromBitsLe(retptr, addHeapObject(bits));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Ciphertext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the left endian boolean array representation of the bits of the ciphertext.
     * @returns {Array<any>}
     */
    toBitsLe() {
        const ret = wasm.ciphertext_toBitsLe(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get a ciphertext object from an array of fields.
     *
     * @param {Array} fields An array of fields.
     *
     * @returns {Ciphertext} The ciphertext object.
     * @param {Array<any>} fields
     * @returns {Ciphertext}
     */
    static fromFields(fields) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ciphertext_fromFields(retptr, addHeapObject(fields));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Ciphertext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the field array representation of the ciphertext.
     * @returns {Array<any>}
     */
    toFields() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ciphertext_toFields(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Deserialize a Ciphertext string into a Ciphertext object.
     *
     * @param {string} ciphertext A string representation of the ciphertext.
     *
     * @returns {Ciphertext} The Ciphertext object.
     * @param {string} ciphertext
     * @returns {Ciphertext}
     */
    static fromString(ciphertext) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(ciphertext, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.ciphertext_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Ciphertext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Serialize a Ciphertext object into a byte array.
     *
     * @returns {Uint8Array} The serialized Ciphertext.
     * @returns {Uint8Array}
     */
    toBytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ciphertext_toBytes(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Serialize a Ciphertext into a js string.
     *
     * @returns {string} The serialized Ciphertext.
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ciphertext_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
}

const ComputeKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_computekey_free(ptr >>> 0, 1));

class ComputeKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ComputeKey.prototype);
        obj.__wbg_ptr = ptr;
        ComputeKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ComputeKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_computekey_free(ptr, 0);
    }
    /**
     * Create a new compute key from a private key.
     *
     * @param {PrivateKey} private_key Private key
     *
     * @returns {ComputeKey} Compute key
     * @param {PrivateKey} private_key
     * @returns {ComputeKey}
     */
    static from_private_key(private_key) {
        _assertClass(private_key, PrivateKey);
        const ret = wasm.computekey_from_private_key(private_key.__wbg_ptr);
        return ComputeKey.__wrap(ret);
    }
    /**
     * Get the address from the compute key.
     *
     * @returns {Address}
     * @returns {Address}
     */
    address() {
        const ret = wasm.address_from_compute_key(this.__wbg_ptr);
        return Address.__wrap(ret);
    }
    /**
     * Get the sk_prf of the compute key.
     *
     * @returns {Scalar} sk_prf
     * @returns {Scalar}
     */
    sk_prf() {
        const ret = wasm.computekey_sk_prf(this.__wbg_ptr);
        return Scalar.__wrap(ret);
    }
    /**
     * Get the pr_tag of the compute key.
     *
     * @returns {Group} pr_tag
     * @returns {Group}
     */
    pk_sig() {
        const ret = wasm.address_toGroup(this.__wbg_ptr);
        return Group.__wrap(ret);
    }
    /**
     * Get the pr_sig of the compute key.
     *
     * @returns {Group} pr_sig
     * @returns {Group}
     */
    pr_sig() {
        const ret = wasm.computekey_pr_sig(this.__wbg_ptr);
        return Group.__wrap(ret);
    }
}

const ExecutionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_execution_free(ptr >>> 0, 1));
/**
 * Execution of an Aleo program.
 */
class Execution {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Execution.prototype);
        obj.__wbg_ptr = ptr;
        ExecutionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ExecutionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_execution_free(ptr, 0);
    }
    /**
     * Returns the string representation of the execution.
     *
     * @returns {string} The string representation of the execution.
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.execution_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Creates an execution object from a string representation of an execution.
     *
     * @returns {Execution | Error} The wasm representation of an execution object.
     * @param {string} execution
     * @returns {Execution}
     */
    static fromString(execution) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(execution, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.execution_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Execution.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the global state root of the execution.
     *
     * @returns {Execution | Error} The global state root used in the execution.
     * @returns {string}
     */
    globalStateRoot() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.execution_globalStateRoot(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the proof of the execution.
     *
     * @returns {string} The execution proof.
     * @returns {string}
     */
    proof() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.execution_proof(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the transitions present in the execution.
     *
     * @returns Array<Transition> the array of transitions present in the execution.
     * @returns {Array<any>}
     */
    transitions() {
        const ret = wasm.execution_transitions(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const ExecutionResponseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_executionresponse_free(ptr >>> 0, 1));
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
        ExecutionResponseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ExecutionResponseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_executionresponse_free(ptr, 0);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
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

const FieldFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_field_free(ptr >>> 0, 1));
/**
 * Field element.
 */
class Field {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Field.prototype);
        obj.__wbg_ptr = ptr;
        FieldFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof Field)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FieldFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_field_free(ptr, 0);
    }
    /**
     * Creates a field object from a string representation of a field element.
     * @param {string} field
     * @returns {Field}
     */
    static fromString(field) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(field, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.field_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the string representation of the field element.
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.field_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Create a field element from a Uint8Array of left endian bytes.
     * @param {Uint8Array} bytes
     * @returns {Field}
     */
    static fromBytesLe(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.field_fromBytesLe(retptr, addBorrowedObject(bytes));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * Encode the field element as a Uint8Array of left endian bytes.
     * @returns {Uint8Array}
     */
    toBytesLe() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.field_toBytesLe(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Reconstruct a field element from a boolean array representation.
     * @param {Array<any>} bits
     * @returns {Field}
     */
    static fromBitsLe(bits) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.field_fromBitsLe(retptr, addBorrowedObject(bits));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * Get the left endian boolean array representation of the field element.
     * @returns {Array<any>}
     */
    toBitsLe() {
        const ret = wasm.field_toBitsLe(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Create a plaintext from the field element.
     * @returns {Plaintext}
     */
    toPlaintext() {
        const ret = wasm.field_toPlaintext(this.__wbg_ptr);
        return Plaintext.__wrap(ret);
    }
    /**
     * Clone the field element.
     * @returns {Field}
     */
    clone() {
        const ret = wasm.field_clone(this.__wbg_ptr);
        return Field.__wrap(ret);
    }
    /**
     * Generate a random field element.
     * @returns {Field}
     */
    static random() {
        const ret = wasm.field_random();
        return Field.__wrap(ret);
    }
    /**
     * Add two field elements.
     * @param {Field} other
     * @returns {Field}
     */
    add(other) {
        _assertClass(other, Field);
        const ret = wasm.field_add(this.__wbg_ptr, other.__wbg_ptr);
        return Field.__wrap(ret);
    }
    /**
     * Subtract two field elements.
     * @param {Field} other
     * @returns {Field}
     */
    subtract(other) {
        _assertClass(other, Field);
        const ret = wasm.field_subtract(this.__wbg_ptr, other.__wbg_ptr);
        return Field.__wrap(ret);
    }
    /**
     * Multiply two field elements.
     * @param {Field} other
     * @returns {Field}
     */
    multiply(other) {
        _assertClass(other, Field);
        const ret = wasm.field_multiply(this.__wbg_ptr, other.__wbg_ptr);
        return Field.__wrap(ret);
    }
    /**
     * Divide two field elements.
     * @param {Field} other
     * @returns {Field}
     */
    divide(other) {
        _assertClass(other, Field);
        const ret = wasm.field_divide(this.__wbg_ptr, other.__wbg_ptr);
        return Field.__wrap(ret);
    }
    /**
     * Power of a field element.
     * @param {Field} other
     * @returns {Field}
     */
    pow(other) {
        _assertClass(other, Field);
        const ret = wasm.field_pow(this.__wbg_ptr, other.__wbg_ptr);
        return Field.__wrap(ret);
    }
    /**
     * Invert the field element.
     * @returns {Field}
     */
    inverse() {
        const ret = wasm.field_inverse(this.__wbg_ptr);
        return Field.__wrap(ret);
    }
    /**
     * Get the additive identity element of the field.
     * @returns {Field}
     */
    static zero() {
        const ret = wasm.field_zero();
        return Field.__wrap(ret);
    }
    /**
     * Get the multiplicative identity of the field.
     * @returns {Field}
     */
    static one() {
        const ret = wasm.field_one();
        return Field.__wrap(ret);
    }
    /**
     * Double the field element.
     * @returns {Field}
     */
    double() {
        const ret = wasm.field_double(this.__wbg_ptr);
        return Field.__wrap(ret);
    }
    /**
     * Check if one field element equals another.
     * @param {Field} other
     * @returns {boolean}
     */
    equals(other) {
        _assertClass(other, Field);
        const ret = wasm.field_equals(this.__wbg_ptr, other.__wbg_ptr);
        return ret !== 0;
    }
}

const FoxFutureFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_foxfuture_free(ptr >>> 0, 1));
/**
 * Plaintext representation of an Aleo record
 */
class FoxFuture {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FoxFuture.prototype);
        obj.__wbg_ptr = ptr;
        FoxFutureFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FoxFutureFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_foxfuture_free(ptr, 0);
    }
    /**
     * Create a Future from a string
     *
     * @param {string} future String representation of a future
     * @returns {Future | Error} Future
     * @param {string} future
     * @returns {FoxFuture}
     */
    static fromString(future) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(future, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.foxfuture_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return FoxFuture.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Return the string reprensentation of the future
     *
     * @returns {string} String representation of the future
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.foxfuture_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Return the JSON representation of the future
     * @returns {string}
     */
    toJSON() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.foxfuture_toJSON(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
}

const GraphKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_graphkey_free(ptr >>> 0, 1));

class GraphKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(GraphKey.prototype);
        obj.__wbg_ptr = ptr;
        GraphKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GraphKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_graphkey_free(ptr, 0);
    }
    /**
     * Create a new graph key from a view key.
     *
     * @param {ViewKey} view_key View key
     * @returns {GraphKey} Graph key
     * @param {ViewKey} view_key
     * @returns {GraphKey}
     */
    static from_view_key(view_key) {
        _assertClass(view_key, ViewKey);
        const ret = wasm.graphkey_from_view_key(view_key.__wbg_ptr);
        return GraphKey.__wrap(ret);
    }
    /**
     * Create a new graph key from a string representation of a graph key
     *
     * @param {string} graph_key String representation of a graph key
     * @returns {GraphKey} Graph key
     * @param {string} graph_key
     * @returns {GraphKey}
     */
    static from_string(graph_key) {
        const ptr0 = passStringToWasm0(graph_key, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.graphkey_from_string(ptr0, len0);
        return GraphKey.__wrap(ret);
    }
    /**
     * Get a string representation of a graph key
     *
     * @returns {string} String representation of a graph key
     * @returns {string}
     */
    to_string() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.graphkey_to_string(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the sk_tag of the graph key. Used to determine ownership of records.
     * @returns {Field}
     */
    sk_tag() {
        const ret = wasm.field_clone(this.__wbg_ptr);
        return Field.__wrap(ret);
    }
}

const GroupFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_group_free(ptr >>> 0, 1));
/**
 * Elliptic curve element.
 */
class Group {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Group.prototype);
        obj.__wbg_ptr = ptr;
        GroupFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GroupFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_group_free(ptr, 0);
    }
    /**
     * Creates a group object from a string representation of a group element.
     * @param {string} group
     * @returns {Group}
     */
    static fromString(group) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(group, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.group_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the string representation of the group element.
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.group_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Create a group element from a Uint8Array of left endian bytes.
     * @param {Uint8Array} bytes
     * @returns {Group}
     */
    static fromBytesLe(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.group_fromBytesLe(retptr, addBorrowedObject(bytes));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * Encode the group element as a Uint8Array of left endian bytes.
     * @returns {Uint8Array}
     */
    toBytesLe() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.group_toBytesLe(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Reconstruct a group element from a boolean array representation.
     * @param {Array<any>} bits
     * @returns {Group}
     */
    static fromBitsLe(bits) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.group_fromBitsLe(retptr, addBorrowedObject(bits));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * Get the left endian boolean array representation of the group element.
     * @returns {Array<any>}
     */
    toBitsLe() {
        const ret = wasm.address_toBitsLe(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get the field array representation of the group.
     * @returns {Array<any>}
     */
    toFields() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.group_toFields(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the x-coordinate of the group element.
     * @returns {Field}
     */
    toXCoordinate() {
        const ret = wasm.group_toXCoordinate(this.__wbg_ptr);
        return Field.__wrap(ret);
    }
    /**
     * Create a plaintext element from a group element.
     * @returns {Plaintext}
     */
    toPlaintext() {
        const ret = wasm.group_toPlaintext(this.__wbg_ptr);
        return Plaintext.__wrap(ret);
    }
    /**
     * Clone the group element.
     * @returns {Group}
     */
    clone() {
        const ret = wasm.group_clone(this.__wbg_ptr);
        return Group.__wrap(ret);
    }
    /**
     * Generate a random group element.
     * @returns {Group}
     */
    static random() {
        const ret = wasm.group_random();
        return Group.__wrap(ret);
    }
    /**
     * Add two group elements.
     * @param {Group} other
     * @returns {Group}
     */
    add(other) {
        _assertClass(other, Group);
        const ret = wasm.group_add(this.__wbg_ptr, other.__wbg_ptr);
        return Group.__wrap(ret);
    }
    /**
     * Subtract two group elements (equivalently: add the inverse of an element).
     * @param {Group} other
     * @returns {Group}
     */
    subtract(other) {
        _assertClass(other, Group);
        const ret = wasm.group_subtract(this.__wbg_ptr, other.__wbg_ptr);
        return Group.__wrap(ret);
    }
    /**
     * Multiply a group element by a scalar element.
     * @param {Scalar} scalar
     * @returns {Group}
     */
    scalarMultiply(scalar) {
        _assertClass(scalar, Scalar);
        const ret = wasm.group_scalarMultiply(this.__wbg_ptr, scalar.__wbg_ptr);
        return Group.__wrap(ret);
    }
    /**
     * Double the group element.
     * @returns {Group}
     */
    double() {
        const ret = wasm.group_double(this.__wbg_ptr);
        return Group.__wrap(ret);
    }
    /**
     * Get the inverse of the group element. This is the reflection of the point about the axis
     * of symmetry i.e. (x,y) -> (x, -y).
     * @returns {Group}
     */
    inverse() {
        const ret = wasm.group_inverse(this.__wbg_ptr);
        return Group.__wrap(ret);
    }
    /**
     * Check if one group element equals another.
     * @param {Group} other
     * @returns {boolean}
     */
    equals(other) {
        _assertClass(other, Group);
        const ret = wasm.group_equals(this.__wbg_ptr, other.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Get the group identity element under the group operation (i.e. the point at infinity.)
     * @returns {Group}
     */
    static zero() {
        const ret = wasm.group_zero();
        return Group.__wrap(ret);
    }
    /**
     * Get the generator of the group.
     * @returns {Group}
     */
    static generator() {
        const ret = wasm.group_generator();
        return Group.__wrap(ret);
    }
}

const KeyPairFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_keypair_free(ptr >>> 0, 1));
/**
 * Key pair object containing both the function proving and verifying keys
 */
class KeyPair {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(KeyPair.prototype);
        obj.__wbg_ptr = ptr;
        KeyPairFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        KeyPairFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_keypair_free(ptr, 0);
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
        this.__wbg_ptr = ret >>> 0;
        KeyPairFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get the proving key. This method will remove the proving key from the key pair
     *
     * @returns {ProvingKey}
     * @returns {ProvingKey}
     */
    provingKey() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.keypair_provingKey(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @returns {VerifyingKey}
     * @returns {VerifyingKey}
     */
    verifyingKey() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.keypair_verifyingKey(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return VerifyingKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const MetadataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_metadata_free(ptr >>> 0, 1));

class Metadata {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Metadata.prototype);
        obj.__wbg_ptr = ptr;
        MetadataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MetadataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_metadata_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_metadata_name(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_metadata_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get locator() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_metadata_locator(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set locator(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_metadata_locator(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get prover() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_metadata_prover(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set prover(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_metadata_prover(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get verifier() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_metadata_verifier(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set verifier(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_metadata_verifier(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get verifyingKey() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_metadata_verifyingKey(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set verifyingKey(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_metadata_verifyingKey(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    static baseUrl() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.metadata_baseUrl(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {Metadata}
     */
    static bond_public() {
        const ret = wasm.metadata_bond_public();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static bond_validator() {
        const ret = wasm.metadata_bond_validator();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static claim_unbond_public() {
        const ret = wasm.metadata_claim_unbond_public();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static fee_private() {
        const ret = wasm.metadata_fee_private();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static fee_public() {
        const ret = wasm.metadata_fee_public();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static inclusion() {
        const ret = wasm.metadata_inclusion();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static join() {
        const ret = wasm.metadata_join();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static set_validator_state() {
        const ret = wasm.metadata_set_validator_state();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static split() {
        const ret = wasm.metadata_split();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static transfer_private() {
        const ret = wasm.metadata_transfer_private();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static transfer_private_to_public() {
        const ret = wasm.metadata_transfer_private_to_public();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static transfer_public() {
        const ret = wasm.metadata_transfer_public();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static transfer_public_as_signer() {
        const ret = wasm.metadata_transfer_public_as_signer();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static transfer_public_to_private() {
        const ret = wasm.metadata_transfer_public_to_private();
        return Metadata.__wrap(ret);
    }
    /**
     * @returns {Metadata}
     */
    static unbond_public() {
        const ret = wasm.metadata_unbond_public();
        return Metadata.__wrap(ret);
    }
}

const OfflineQueryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_offlinequery_free(ptr >>> 0, 1));
/**
 * An offline query object used to insert the global state root and state paths needed to create
 * a valid inclusion proof offline.
 */
class OfflineQuery {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(OfflineQuery.prototype);
        obj.__wbg_ptr = ptr;
        OfflineQueryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OfflineQueryFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_offlinequery_free(ptr, 0);
    }
    /**
     * Creates a new offline query object. The state root is required to be passed in as a string
     * @param {number} block_height
     * @param {string} state_root
     */
    constructor(block_height, state_root) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(state_root, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.offlinequery_new(retptr, block_height, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            OfflineQueryFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Add a new block height to the offline query object.
     * @param {number} block_height
     */
    addBlockHeight(block_height) {
        wasm.offlinequery_addBlockHeight(this.__wbg_ptr, block_height);
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
            const ptr0 = passStringToWasm0(commitment, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(state_path, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len1 = WASM_VECTOR_LEN;
            wasm.offlinequery_addStatePath(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
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
            const ptr0 = passStringToWasm0(s, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.offlinequery_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return OfflineQuery.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const Pedersen128Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pedersen128_free(ptr >>> 0, 1));

class Pedersen128 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Pedersen128.prototype);
        obj.__wbg_ptr = ptr;
        Pedersen128Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        Pedersen128Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pedersen128_free(ptr, 0);
    }
    /**
     * Create a Pedersen hasher for a given (up to) 128-bit input.
     */
    constructor() {
        const ret = wasm.pedersen128_new();
        this.__wbg_ptr = ret >>> 0;
        Pedersen128Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create a Pedersen hasher for a given (up to) 128-bit input with a custom domain separator.
     * @param {string} domain_separator
     * @returns {Pedersen128}
     */
    static setup(domain_separator) {
        const ptr0 = passStringToWasm0(domain_separator, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pedersen128_setup(ptr0, len0);
        return Pedersen128.__wrap(ret);
    }
    /**
     * Returns the Pedersen hash for a given (up to) 128-bit input.
     * @param {Array<any>} input
     * @returns {Field}
     */
    hash(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.pedersen128_hash(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a Pedersen commitment for the given (up to) 128-bit input and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Field}
     */
    commit(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.pedersen128_commit(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a Pedersen commitment for the given (up to) 128-bit input and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Group}
     */
    commitToGroup(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.pedersen128_commitToGroup(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const Pedersen64Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pedersen64_free(ptr >>> 0, 1));

class Pedersen64 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Pedersen64.prototype);
        obj.__wbg_ptr = ptr;
        Pedersen64Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        Pedersen64Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pedersen64_free(ptr, 0);
    }
    /**
     * Create a Pedersen hasher for a given (up to) 64-bit input.
     */
    constructor() {
        const ret = wasm.pedersen64_new();
        this.__wbg_ptr = ret >>> 0;
        Pedersen64Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create a Pedersen64 hasher for a given (up to) 64-bit input with a custom domain separator.
     * @param {string} domain_separator
     * @returns {Pedersen64}
     */
    static setup(domain_separator) {
        const ptr0 = passStringToWasm0(domain_separator, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pedersen64_setup(ptr0, len0);
        return Pedersen64.__wrap(ret);
    }
    /**
     * Returns the Pedersen hash for a given (up to) 64-bit input.
     * @param {Array<any>} input
     * @returns {Field}
     */
    hash(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.pedersen64_hash(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a Pedersen commitment for the given (up to) 64-bit input and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Field}
     */
    commit(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.pedersen64_commit(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns a Pedersen commitment for the given (up to) 64-bit input and randomizer.
     * @param {Array<any>} input
     * @param {Scalar} randomizer
     * @returns {Group}
     */
    commitToGroup(input, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(randomizer, Scalar);
            var ptr0 = randomizer.__destroy_into_raw();
            wasm.pedersen64_commitToGroup(retptr, this.__wbg_ptr, addHeapObject(input), ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const PlaintextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_plaintext_free(ptr >>> 0, 1));
/**
 * SnarkVM Plaintext object. Plaintext is a fundamental monadic type used to represent Aleo
 * primitive types (boolean, field, group, i8, i16, i32, i64, i128, u8, u16, u32, u64, u128,
 * scalar, and signature), struct types, and array types.
 *
 * In the context of a web or NodeJS application, this type is useful for turning an Aleo type into
 * a JS value, object, or array that might be necessary for performing computations within the
 * application.
 *
 * @example
 * // Get the bond state of an existing address.
 * const bondState = await fetch(https://api.explorer.provable.com/v1/mainnet/program/credits.aleo/mapping/bond_state/aleo12zlythl7htjdtjjjz3ahdj4vl6wk3zuzm37s80l86qpx8fyx95fqnxcn2f);
 * // Convert the bond state to a Plaintext object.
 * const bondStatePlaintext = Plaintext.fromString(bond_state);
 * // Convert the Plaintext object to a JS object.
 * const bondStateObject = bond_state_plaintext.toObject();
 * // Check if the bond state matches the expected object.
 * const expectedObject = { validator: "aleo12zlythl7htjdtjjjz3ahdj4vl6wk3zuzm37s80l86qpx8fyx95fqnxcn2f", microcredits: 100000000u64 };
 * assert( JSON.stringify(bondStateObject) === JSON.stringify(expectedObject) );
 */
class Plaintext {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Plaintext.prototype);
        obj.__wbg_ptr = ptr;
        PlaintextFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PlaintextFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_plaintext_free(ptr, 0);
    }
    /**
     * Find plaintext member if the plaintext is a struct. Returns `null` if the plaintext is not
     * a struct or the member does not exist.
     *
     * @param {string} name The name of the plaintext member to find.
     *
     * @returns {Plaintext} The plaintext member.
     * @param {string} name
     * @returns {Plaintext}
     */
    find(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.plaintext_find(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Plaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Encrypt a plaintext with an address and randomizer.
     * @param {Address} address
     * @param {Scalar} randomizer
     * @returns {Ciphertext}
     */
    encrypt(address, randomizer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(address, Address);
            _assertClass(randomizer, Scalar);
            wasm.plaintext_encrypt(retptr, this.__wbg_ptr, address.__wbg_ptr, randomizer.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Ciphertext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Encrypt a plaintext with a transition view key.
     * @param {Field} transition_view_key
     * @returns {Ciphertext}
     */
    encryptSymmetric(transition_view_key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(transition_view_key, Field);
            wasm.plaintext_encryptSymmetric(retptr, this.__wbg_ptr, transition_view_key.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Ciphertext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Creates a plaintext object from a string representation of a plaintext.
     *
     * @param {string} plaintext The string representation of the plaintext.
     *
     * @returns {Plaintext} The plaintext object.
     * @param {string} plaintext
     * @returns {Plaintext}
     */
    static fromString(plaintext) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(plaintext, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.plaintext_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Plaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * ----- Modified by FoxWallet -----
     * @returns {string}
     */
    toJSON() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plaintext_toJSON(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get a plaintext object from a series of bytes.
     *
     * @param {Uint8Array} bytes A left endian byte array representing the plaintext.
     *
     * @returns {Plaintext} The plaintext object.
     * @param {Uint8Array} bytes
     * @returns {Plaintext}
     */
    static fromBytesLe(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plaintext_fromBytesLe(retptr, addHeapObject(bytes));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Plaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the left endian byte array representation of the plaintext.
     * @returns {Uint8Array}
     */
    toBytesLe() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plaintext_toBytesLe(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get a plaintext object from a series of bits represented as a boolean array.
     *
     * @param {Array} bits A left endian boolean array representing the bits plaintext.
     *
     * @returns {Plaintext} The plaintext object.
     * @param {Array<any>} bits
     * @returns {Plaintext}
     */
    static fromBitsLe(bits) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plaintext_fromBitsLe(retptr, addHeapObject(bits));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Plaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the left endian boolean array representation of the bits of the plaintext.
     * @returns {Array<any>}
     */
    toBitsLe() {
        const ret = wasm.plaintext_toBitsLe(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get a plaintext object from an array of fields.
     *
     * @param {Array} fields An array of fields.
     *
     * @returns {Plaintext} The plaintext object.
     * @param {Array<any>} fields
     * @returns {Plaintext}
     */
    static fromFields(fields) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plaintext_fromFields(retptr, addHeapObject(fields));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Plaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the field array representation of the plaintext.
     * @returns {Array<any>}
     */
    toFields() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plaintext_toFields(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the string representation of the plaintext.
     *
     * @returns {string} The string representation of the plaintext.
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plaintext_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Gives the type of the plaintext.
     *
     * @returns {string} The type of the plaintext.
     * @returns {string}
     */
    plaintextType() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plaintext_plaintextType(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Attempt to convert the plaintext to a JS object.
     *
     * @returns {Object} The JS object representation of the plaintext.
     * @returns {any}
     */
    toObject() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plaintext_toObject(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const Poseidon2Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_poseidon2_free(ptr >>> 0, 1));

class Poseidon2 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Poseidon2.prototype);
        obj.__wbg_ptr = ptr;
        Poseidon2Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        Poseidon2Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_poseidon2_free(ptr, 0);
    }
    /**
     * Create a Poseidon hasher with an input rate of 2.
     */
    constructor() {
        const ret = wasm.poseidon2_new();
        this.__wbg_ptr = ret >>> 0;
        Poseidon2Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create a Poseidon hasher with an input rate of 2 and a custom domain separator.
     * @param {string} domain_separator
     * @returns {Poseidon2}
     */
    static setup(domain_separator) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(domain_separator, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.poseidon2_setup(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Poseidon2.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the Poseidon hash with an input rate of 2.
     * @param {Array<any>} input
     * @returns {Field}
     */
    hash(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon2_hash(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the extended Poseidon hash with an input rate of 2.
     * @param {Array<any>} input
     * @param {number} num_outputs
     * @returns {Array<any>}
     */
    hashMany(input, num_outputs) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon2_hashMany(retptr, this.__wbg_ptr, addHeapObject(input), num_outputs);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the Poseidon hash with an input rate of 2 on the scalar field.
     * @param {Array<any>} input
     * @returns {Scalar}
     */
    hashToScalar(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon2_hashToScalar(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Scalar.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the Poseidon hash with an input rate of 2 on the affine curve.
     * @param {Array<any>} input
     * @returns {Group}
     */
    hashToGroup(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon2_hashToGroup(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const Poseidon4Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_poseidon4_free(ptr >>> 0, 1));

class Poseidon4 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Poseidon4.prototype);
        obj.__wbg_ptr = ptr;
        Poseidon4Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        Poseidon4Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_poseidon4_free(ptr, 0);
    }
    /**
     * Create a Poseidon hasher with an input rate of 4.
     */
    constructor() {
        const ret = wasm.poseidon4_new();
        this.__wbg_ptr = ret >>> 0;
        Poseidon4Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create a Poseidon hasher with an input rate of 4 and a custom domain separator.
     * @param {string} domain_separator
     * @returns {Poseidon4}
     */
    static setup(domain_separator) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(domain_separator, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.poseidon4_setup(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Poseidon4.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the Poseidon hash with an input rate of 4.
     * @param {Array<any>} input
     * @returns {Field}
     */
    hash(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon4_hash(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the extended Poseidon hash with an input rate of 4.
     * @param {Array<any>} input
     * @param {number} num_outputs
     * @returns {Array<any>}
     */
    hashMany(input, num_outputs) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon4_hashMany(retptr, this.__wbg_ptr, addHeapObject(input), num_outputs);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the Poseidon hash with an input rate of 4 on the scalar field.
     * @param {Array<any>} input
     * @returns {Scalar}
     */
    hashToScalar(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon4_hashToScalar(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Scalar.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the Poseidon hash with an input rate of 4 on the affine curve.
     * @param {Array<any>} input
     * @returns {Group}
     */
    hashToGroup(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon4_hashToGroup(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const Poseidon8Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_poseidon8_free(ptr >>> 0, 1));

class Poseidon8 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Poseidon8.prototype);
        obj.__wbg_ptr = ptr;
        Poseidon8Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        Poseidon8Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_poseidon8_free(ptr, 0);
    }
    /**
     * Create a Poseidon hasher with an input rate of 8.
     */
    constructor() {
        const ret = wasm.poseidon8_new();
        this.__wbg_ptr = ret >>> 0;
        Poseidon8Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create a Poseidon hasher with an input rate of 8 and a custom domain separator.
     * @param {string} domain_separator
     * @returns {Poseidon8}
     */
    static setup(domain_separator) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(domain_separator, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.poseidon8_setup(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Poseidon8.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the Poseidon hash with an input rate of 8.
     * @param {Array<any>} input
     * @returns {Field}
     */
    hash(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon8_hash(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the extended Poseidon hash with an input rate of 8.
     * @param {Array<any>} input
     * @param {number} num_outputs
     * @returns {Array<any>}
     */
    hashMany(input, num_outputs) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon8_hashMany(retptr, this.__wbg_ptr, addHeapObject(input), num_outputs);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the Poseidon hash with an input rate of 8 on the scalar field.
     * @param {Array<any>} input
     * @returns {Scalar}
     */
    hashToScalar(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon8_hashToScalar(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Scalar.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the Poseidon hash with an input rate of 8 on the affine curve.
     * @param {Array<any>} input
     * @returns {Group}
     */
    hashToGroup(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poseidon8_hashToGroup(retptr, this.__wbg_ptr, addHeapObject(input));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Group.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const PrivateKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_privatekey_free(ptr >>> 0, 1));
/**
 * Private key of an Aleo account
 */
class PrivateKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PrivateKey.prototype);
        obj.__wbg_ptr = ptr;
        PrivateKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PrivateKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_privatekey_free(ptr, 0);
    }
    /**
     * Generate a new private key using a cryptographically secure random number generator
     *
     * @returns {PrivateKey}
     */
    constructor() {
        const ret = wasm.privatekey_new();
        this.__wbg_ptr = ret >>> 0;
        PrivateKeyFinalization.register(this, this.__wbg_ptr, this);
        return this;
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
        const ptr0 = passArray8ToWasm0(seed, wasm.__wbindgen_export_3);
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
            const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.privatekey_from_string(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
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
        const ret = wasm.privatekey_to_address(this.__wbg_ptr);
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
        const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_export_3);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.privatekey_sign(this.__wbg_ptr, ptr0, len0);
        return Signature.__wrap(ret);
    }
    /**
     * Get a new randomly generated private key ciphertext using a secret. The secret is sensitive
     * and will be needed to decrypt the private key later, so it should be stored securely
     *
     * @param {string} secret Secret used to encrypt the private key
     * @returns {PrivateKeyCiphertext} Ciphertext representation of the private key
     * @param {string} secret
     * @returns {PrivateKeyCiphertext}
     */
    static newEncrypted(secret) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(secret, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.privatekey_newEncrypted(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @returns {PrivateKeyCiphertext} Ciphertext representation of the private key
     * @param {string} secret
     * @returns {PrivateKeyCiphertext}
     */
    toCiphertext(secret) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(secret, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.privatekey_toCiphertext(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @returns {PrivateKey} Private key
     * @param {PrivateKeyCiphertext} ciphertext
     * @param {string} secret
     * @returns {PrivateKey}
     */
    static fromPrivateKeyCiphertext(ciphertext, secret) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(ciphertext, PrivateKeyCiphertext);
            const ptr0 = passStringToWasm0(secret, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.privatekey_fromPrivateKeyCiphertext(retptr, ciphertext.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return PrivateKey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const PrivateKeyCiphertextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_privatekeyciphertext_free(ptr >>> 0, 1));
/**
 * Private Key in ciphertext form
 */
class PrivateKeyCiphertext {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PrivateKeyCiphertext.prototype);
        obj.__wbg_ptr = ptr;
        PrivateKeyCiphertextFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PrivateKeyCiphertextFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_privatekeyciphertext_free(ptr, 0);
    }
    /**
     * Encrypt a private key using a secret string. The secret is sensitive and will be needed to
     * decrypt the private key later, so it should be stored securely
     *
     * @param {PrivateKey} private_key Private key to encrypt
     * @param {string} secret Secret to encrypt the private key with
     * @returns {PrivateKeyCiphertext} Private key ciphertext
     * @param {PrivateKey} private_key
     * @param {string} secret
     * @returns {PrivateKeyCiphertext}
     */
    static encryptPrivateKey(private_key, secret) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(private_key, PrivateKey);
            const ptr0 = passStringToWasm0(secret, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.privatekey_toCiphertext(retptr, private_key.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @returns {PrivateKey} Private key
     * @param {string} secret
     * @returns {PrivateKey}
     */
    decryptToPrivateKey(secret) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(secret, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.privatekeyciphertext_decryptToPrivateKey(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
            wasm.ciphertext_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Creates a PrivateKeyCiphertext from a string
     *
     * @param {string} ciphertext Ciphertext string
     * @returns {PrivateKeyCiphertext} Private key ciphertext
     * @param {string} ciphertext
     * @returns {PrivateKeyCiphertext}
     */
    static fromString(ciphertext) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(ciphertext, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.privatekeyciphertext_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return PrivateKeyCiphertext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const ProgramFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_program_free(ptr >>> 0, 1));
/**
 * Webassembly Representation of an Aleo program
 */
class Program {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Program.prototype);
        obj.__wbg_ptr = ptr;
        ProgramFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ProgramFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_program_free(ptr, 0);
    }
    /**
     * Create a program from a program string
     *
     * @param {string} program Aleo program source code
     * @returns {Program} Program object
     * @param {string} program
     * @returns {Program}
     */
    static fromString(program) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(program, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.program_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
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
        const ptr0 = passStringToWasm0(function_name, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
     * @returns {Array} Array of function inputs
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
            const ptr0 = passStringToWasm0(function_name, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.program_getFunctionInputs(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @returns {Array} - An array of objects representing the mappings in the program
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @returns {Object} Object containing the record name, type, and members
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
            const ptr0 = passStringToWasm0(record_name, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.program_getRecordMembers(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @returns {Array} Array containing the struct members
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
            const ptr0 = passStringToWasm0(struct_name, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.program_getStructMembers(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * ----- Modified by FoxWallet -----
     * @param {string} plaintext
     * @returns {string}
     */
    matchRecordPlaintext(plaintext) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(plaintext, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.program_matchRecordPlaintext(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred3_0, deferred3_1, 1);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get a unique address of the program
     *
     * @returns {Address} The address of the program
     * @returns {Address}
     */
    address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.program_address(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Address.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
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

const ProgramManagerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_programmanager_free(ptr >>> 0, 1));

class ProgramManager {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ProgramManagerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_programmanager_free(ptr, 0);
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
     * @returns {Transaction}
     * @param {PrivateKey} private_key
     * @param {string} program
     * @param {bigint} base_fee
     * @param {bigint} priority_fee
     * @param {RecordPlaintext | null} [fee_record]
     * @param {string | null} [url]
     * @param {object | null} [imports]
     * @param {ProvingKey | null} [fee_proving_key]
     * @param {VerifyingKey | null} [fee_verifying_key]
     * @param {OfflineQuery | null} [offline_query]
     * @returns {Promise<Transaction>}
     */
    static buildDeploymentTransaction(private_key, program, base_fee, priority_fee, fee_record, url, imports, fee_proving_key, fee_verifying_key, offline_query) {
        _assertClass(private_key, PrivateKey);
        const ptr0 = passStringToWasm0(program, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        let ptr1 = 0;
        if (!isLikeNone(fee_record)) {
            _assertClass(fee_record, RecordPlaintext);
            ptr1 = fee_record.__destroy_into_raw();
        }
        var ptr2 = isLikeNone(url) ? 0 : passStringToWasm0(url, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
        const ret = wasm.programmanager_buildDeploymentTransaction(private_key.__wbg_ptr, ptr0, len0, base_fee, priority_fee, ptr1, ptr2, len2, isLikeNone(imports) ? 0 : addHeapObject(imports), ptr3, ptr4, ptr5);
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
     * @returns {u64}
     * @param {string} program
     * @param {object | null} [imports]
     * @returns {Promise<bigint>}
     */
    static estimateDeploymentFee(program, imports) {
        const ptr0 = passStringToWasm0(program, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.programmanager_estimateDeploymentFee(ptr0, len0, isLikeNone(imports) ? 0 : addHeapObject(imports));
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
     * @returns {u64}
     * @param {string} name
     * @returns {bigint}
     */
    static estimateProgramNameCost(name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.programmanager_estimateProgramNameCost(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getBigInt64(retptr + 8 * 0, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
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
     * @param {object | null} [imports]
     * @param {ProvingKey | null} [proving_key]
     * @param {VerifyingKey | null} [verifying_key]
     * @param {string | null} [url]
     * @param {OfflineQuery | null} [offline_query]
     * @returns {Promise<ExecutionResponse>}
     */
    static executeFunctionOffline(private_key, program, _function, inputs, prove_execution, cache, imports, proving_key, verifying_key, url, offline_query) {
        _assertClass(private_key, PrivateKey);
        const ptr0 = passStringToWasm0(program, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(_function, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
        var ptr4 = isLikeNone(url) ? 0 : passStringToWasm0(url, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        var len4 = WASM_VECTOR_LEN;
        let ptr5 = 0;
        if (!isLikeNone(offline_query)) {
            _assertClass(offline_query, OfflineQuery);
            ptr5 = offline_query.__destroy_into_raw();
        }
        const ret = wasm.programmanager_executeFunctionOffline(private_key.__wbg_ptr, ptr0, len0, ptr1, len1, addHeapObject(inputs), prove_execution, cache, isLikeNone(imports) ? 0 : addHeapObject(imports), ptr2, ptr3, ptr4, len4, ptr5);
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
     * @returns {Transaction}
     * @param {PrivateKey} private_key
     * @param {string} program
     * @param {string} _function
     * @param {Array<any>} inputs
     * @param {bigint} base_fee
     * @param {bigint} priority_fee
     * @param {RecordPlaintext | null} [fee_record]
     * @param {string | null} [url]
     * @param {object | null} [imports]
     * @param {ProvingKey | null} [proving_key]
     * @param {VerifyingKey | null} [verifying_key]
     * @param {ProvingKey | null} [fee_proving_key]
     * @param {VerifyingKey | null} [fee_verifying_key]
     * @param {OfflineQuery | null} [offline_query]
     * @returns {Promise<Transaction>}
     */
    static buildExecutionTransaction(private_key, program, _function, inputs, base_fee, priority_fee, fee_record, url, imports, proving_key, verifying_key, fee_proving_key, fee_verifying_key, offline_query) {
        _assertClass(private_key, PrivateKey);
        const ptr0 = passStringToWasm0(program, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(_function, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len1 = WASM_VECTOR_LEN;
        let ptr2 = 0;
        if (!isLikeNone(fee_record)) {
            _assertClass(fee_record, RecordPlaintext);
            ptr2 = fee_record.__destroy_into_raw();
        }
        var ptr3 = isLikeNone(url) ? 0 : passStringToWasm0(url, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
        const ret = wasm.programmanager_buildExecutionTransaction(private_key.__wbg_ptr, ptr0, len0, ptr1, len1, addHeapObject(inputs), base_fee, priority_fee, ptr2, ptr3, len3, isLikeNone(imports) ? 0 : addHeapObject(imports), ptr4, ptr5, ptr6, ptr7, ptr8);
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
     * @returns {u64} Fee in microcredits
     * @param {PrivateKey} private_key
     * @param {string} program
     * @param {string} _function
     * @param {Array<any>} inputs
     * @param {string | null} [url]
     * @param {object | null} [imports]
     * @param {ProvingKey | null} [proving_key]
     * @param {VerifyingKey | null} [verifying_key]
     * @param {OfflineQuery | null} [offline_query]
     * @returns {Promise<bigint>}
     */
    static estimateExecutionFee(private_key, program, _function, inputs, url, imports, proving_key, verifying_key, offline_query) {
        _assertClass(private_key, PrivateKey);
        const ptr0 = passStringToWasm0(program, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(_function, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(url) ? 0 : passStringToWasm0(url, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
        const ret = wasm.programmanager_estimateExecutionFee(private_key.__wbg_ptr, ptr0, len0, ptr1, len1, addHeapObject(inputs), ptr2, len2, isLikeNone(imports) ? 0 : addHeapObject(imports), ptr3, ptr4, ptr5);
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
     * @returns {u64} Fee in microcredits
     * @param {string} program
     * @param {string} _function
     * @returns {bigint}
     */
    static estimateFinalizeFee(program, _function) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(program, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(_function, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len1 = WASM_VECTOR_LEN;
            wasm.programmanager_estimateFinalizeFee(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getBigInt64(retptr + 8 * 0, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
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
     * @returns {Transaction} Transaction object
     * @param {PrivateKey} private_key
     * @param {RecordPlaintext} record_1
     * @param {RecordPlaintext} record_2
     * @param {number} fee_credits
     * @param {RecordPlaintext | null} [fee_record]
     * @param {string | null} [url]
     * @param {ProvingKey | null} [join_proving_key]
     * @param {VerifyingKey | null} [join_verifying_key]
     * @param {ProvingKey | null} [fee_proving_key]
     * @param {VerifyingKey | null} [fee_verifying_key]
     * @param {OfflineQuery | null} [offline_query]
     * @returns {Promise<Transaction>}
     */
    static buildJoinTransaction(private_key, record_1, record_2, fee_credits, fee_record, url, join_proving_key, join_verifying_key, fee_proving_key, fee_verifying_key, offline_query) {
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
        var ptr3 = isLikeNone(url) ? 0 : passStringToWasm0(url, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
        const ret = wasm.programmanager_buildJoinTransaction(private_key.__wbg_ptr, ptr0, ptr1, fee_credits, ptr2, ptr3, len3, ptr4, ptr5, ptr6, ptr7, ptr8);
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
     * @returns {Transaction} Transaction object
     * @param {PrivateKey} private_key
     * @param {number} split_amount
     * @param {RecordPlaintext} amount_record
     * @param {string | null} [url]
     * @param {ProvingKey | null} [split_proving_key]
     * @param {VerifyingKey | null} [split_verifying_key]
     * @param {OfflineQuery | null} [offline_query]
     * @returns {Promise<Transaction>}
     */
    static buildSplitTransaction(private_key, split_amount, amount_record, url, split_proving_key, split_verifying_key, offline_query) {
        _assertClass(private_key, PrivateKey);
        _assertClass(amount_record, RecordPlaintext);
        var ptr0 = amount_record.__destroy_into_raw();
        var ptr1 = isLikeNone(url) ? 0 : passStringToWasm0(url, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
        const ret = wasm.programmanager_buildSplitTransaction(private_key.__wbg_ptr, split_amount, ptr0, ptr1, len1, ptr2, ptr3, ptr4);
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
     * @returns {Transaction}
     * @param {PrivateKey} private_key
     * @param {number} amount_credits
     * @param {string} recipient
     * @param {string} transfer_type
     * @param {RecordPlaintext | null | undefined} amount_record
     * @param {number} fee_credits
     * @param {RecordPlaintext | null} [fee_record]
     * @param {string | null} [url]
     * @param {ProvingKey | null} [transfer_proving_key]
     * @param {VerifyingKey | null} [transfer_verifying_key]
     * @param {ProvingKey | null} [fee_proving_key]
     * @param {VerifyingKey | null} [fee_verifying_key]
     * @param {OfflineQuery | null} [offline_query]
     * @returns {Promise<Transaction>}
     */
    static buildTransferTransaction(private_key, amount_credits, recipient, transfer_type, amount_record, fee_credits, fee_record, url, transfer_proving_key, transfer_verifying_key, fee_proving_key, fee_verifying_key, offline_query) {
        _assertClass(private_key, PrivateKey);
        const ptr0 = passStringToWasm0(recipient, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(transfer_type, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
        var ptr4 = isLikeNone(url) ? 0 : passStringToWasm0(url, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
        const ret = wasm.programmanager_buildTransferTransaction(private_key.__wbg_ptr, amount_credits, ptr0, len0, ptr1, len1, ptr2, fee_credits, ptr3, ptr4, len4, ptr5, ptr6, ptr7, ptr8, ptr9);
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
     * @param {object | null} [imports]
     * @returns {Promise<KeyPair>}
     */
    static synthesizeKeyPair(private_key, program, function_id, inputs, imports) {
        _assertClass(private_key, PrivateKey);
        const ptr0 = passStringToWasm0(program, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(function_id, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.programmanager_synthesizeKeyPair(private_key.__wbg_ptr, ptr0, len0, ptr1, len1, addHeapObject(inputs), isLikeNone(imports) ? 0 : addHeapObject(imports));
        return takeObject(ret);
    }
}

const ProvingKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_provingkey_free(ptr >>> 0, 1));
/**
 * Proving key for a function within an Aleo program
 */
class ProvingKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ProvingKey.prototype);
        obj.__wbg_ptr = ptr;
        ProvingKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ProvingKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_provingkey_free(ptr, 0);
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
     * Verify if the proving key is for the bond_validator function
     *
     * @example
     * const provingKey = ProvingKey.fromBytes("bond_validator_proving_key.bin");
     * provingKey.isBondPublicProver() ? console.log("Key verified") : throw new Error("Invalid key");
     *
     * @returns {boolean} returns true if the proving key is for the bond_validator function, false if otherwise
     * @returns {boolean}
     */
    isBondValidatorProver() {
        const ret = wasm.provingkey_isBondValidatorProver(this.__wbg_ptr);
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
     * Verify if the proving key is for the transfer_public_as_signer function
     *
     * @example
     * const provingKey = ProvingKey.fromBytes("transfer_public_as_signer_proving_key.bin");
     * provingKey.isTransferPublicAsSignerProver() ? console.log("Key verified") : throw new Error("Invalid key");
     *
     * @returns {boolean} returns true if the proving key is for the transfer_public function, false if otherwise
     * @returns {boolean}
     */
    isTransferPublicAsSignerProver() {
        const ret = wasm.provingkey_isTransferPublicAsSignerProver(this.__wbg_ptr);
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
     * Verify if the proving key is for the unbond_public function
     *
     * @example
     * const provingKey = ProvingKey.fromBytes("unbond_public.bin");
     * provingKey.isUnbondPublicProver() ? console.log("Key verified") : throw new Error("Invalid key");
     *
     * @returns {boolean} returns true if the proving key is for the unbond_public_prover function, false if otherwise
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
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
     * @returns {ProvingKey}
     * @param {Uint8Array} bytes
     * @returns {ProvingKey}
     */
    static fromBytes(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export_3);
            const len0 = WASM_VECTOR_LEN;
            wasm.provingkey_fromBytes(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @param {string} String representation of the proving key
     * @param {string} string
     * @returns {ProvingKey}
     */
    static fromString(string) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(string, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.provingkey_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @returns {Uint8Array} Byte array representation of a proving key
     * @returns {Uint8Array}
     */
    toBytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.provingkey_toBytes(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
}

const RecordCiphertextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_recordciphertext_free(ptr >>> 0, 1));
/**
 * Encrypted Aleo record
 */
class RecordCiphertext {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RecordCiphertext.prototype);
        obj.__wbg_ptr = ptr;
        RecordCiphertextFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RecordCiphertextFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_recordciphertext_free(ptr, 0);
    }
    /**
     * Create a record ciphertext from a string
     *
     * @param {string} record String representation of a record ciphertext
     * @returns {RecordCiphertext} Record ciphertext
     * @param {string} record
     * @returns {RecordCiphertext}
     */
    static fromString(record) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(record, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.recordciphertext_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Decrypt the record ciphertext into plaintext using the view key. The record will only
     * decrypt if the record was encrypted by the account corresponding to the view key
     *
     * @param {ViewKey} view_key View key used to decrypt the ciphertext
     * @returns {RecordPlaintext} Record plaintext object
     * @param {ViewKey} view_key
     * @returns {RecordPlaintext}
     */
    decrypt(view_key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(view_key, ViewKey);
            wasm.recordciphertext_decrypt(retptr, this.__wbg_ptr, view_key.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
        const ret = wasm.recordciphertext_isOwner(this.__wbg_ptr, view_key.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Get the tag of the record using the graph key.
     *
     * @param {GraphKey} graph key of the account associatd with the record.
     * @param {Field} commitment of the record.
     *
     * @returns {Field} tag of the record.
     * @param {GraphKey} graph_key
     * @param {Field} commitment
     * @returns {Field}
     */
    static tag(graph_key, commitment) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(graph_key, GraphKey);
            _assertClass(commitment, Field);
            var ptr0 = commitment.__destroy_into_raw();
            wasm.recordciphertext_tag(retptr, graph_key.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get a record ciphertext object from a series of bytes.
     *
     * @param {Uint8Array} bytes A left endian byte array representing the record ciphertext.
     *
     * @returns {RecordCiphertext}
     * @param {Uint8Array} bytes
     * @returns {RecordCiphertext}
     */
    static fromBytesLe(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.recordciphertext_fromBytesLe(retptr, addHeapObject(bytes));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return RecordCiphertext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the left endian byte array representation of the record ciphertext.
     * @returns {Uint8Array}
     */
    toBytesLe() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.recordciphertext_toBytesLe(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the left endian boolean array representation of the record ciphertext bits.
     * @returns {Array<any>}
     */
    toBitsLe() {
        const ret = wasm.recordciphertext_toBitsLe(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get the field array representation of the record ciphertext.
     * @returns {Array<any>}
     */
    toFields() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.recordciphertext_toFields(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const RecordPlaintextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_recordplaintext_free(ptr >>> 0, 1));
/**
 * Plaintext representation of an Aleo record
 */
class RecordPlaintext {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RecordPlaintext.prototype);
        obj.__wbg_ptr = ptr;
        RecordPlaintextFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RecordPlaintextFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_recordplaintext_free(ptr, 0);
    }
    /**
     * @param {string} program_id
     * @param {string} record_name
     * @returns {Field}
     */
    commitment(program_id, record_name) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(program_id, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(record_name, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len1 = WASM_VECTOR_LEN;
            wasm.recordplaintext_commitment(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @returns {RecordPlaintext} Record plaintext
     * @param {string} record
     * @returns {RecordPlaintext}
     */
    static fromString(record) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(record, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.recordplaintext_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return RecordPlaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string} input
     * @returns {Plaintext}
     */
    getMember(input) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(input, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.recordplaintext_getMember(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Plaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the owner of the record.
     * @returns {Address}
     */
    owner() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.recordplaintext_owner(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Address.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get a representation of a record as a javascript object for usage in client side
     * computations. Note that this is not a reversible operation and exists for the convenience
     * of discovering and using properties of the record.
     *
     * The conversion guide is as follows:
     * - u8, u16, u32, i8, i16 i32 --> Number
     * - u64, u128, i64, i128 --> BigInt
     * - Address, Field, Group, Scalar --> String.
     *
     * Address, Field, Group, and Scalar will all be converted to their bech32 string
     * representation. These string representations can be converted back to their respective wasm
     * types using the fromString method on the Address, Field, Group, and Scalar objects in this
     * library.
     *
     * @example
     * # Create a wasm record from a record string.
     * let record_plaintext_wasm = RecordPlainext.from_string("{
     *   owner: aleo1kh5t7m30djl0ecdn4f5vuzp7dx0tcwh7ncquqjkm4matj2p2zqpqm6at48.private,
     *   metadata: {
     *     player1: aleo1kh5t7m30djl0ecdn4f5vuzp7dx0tcwh7ncquqjkm4matj2p2zqpqm6at48.private,
     *     player2: aleo1dreuxnmg9cny8ee9v2u0wr4v4affnwm09u2pytfwz0f2en2shgqsdsfjn6.private,
     *     nonce: 660310649780728486489183263981322848354071976582883879926426319832534836534field.private
     *   },
     *   id: 1953278585719525811355617404139099418855053112960441725284031425961000152405field.private,
     *   positions: 50794271u64.private,
     *   attempts: 0u64.private,
     *   hits: 0u64.private,
     *   _nonce: 5668100912391182624073500093436664635767788874314097667746354181784048204413group.public
     * }");
     *
     * let expected_object = {
     *   owner: "aleo1kh5t7m30djl0ecdn4f5vuzp7dx0tcwh7ncquqjkm4matj2p2zqpqm6at48",
     *   metadata: {
     *     player1: "aleo1kh5t7m30djl0ecdn4f5vuzp7dx0tcwh7ncquqjkm4matj2p2zqpqm6at48",
     *     player2: "aleo1dreuxnmg9cny8ee9v2u0wr4v4affnwm09u2pytfwz0f2en2shgqsdsfjn6",
     *     nonce: "660310649780728486489183263981322848354071976582883879926426319832534836534field"
     *   },
     *   id: "1953278585719525811355617404139099418855053112960441725284031425961000152405field",
     *   positions: 50794271,
     *   attempts: 0,
     *   hits: 0,
     *   _nonce: "5668100912391182624073500093436664635767788874314097667746354181784048204413group"
     * };
     *
     * # Create the expected object
     * let record_plaintext_object = record_plaintext_wasm.to_js_object();
     * assert(JSON.stringify(record_plaintext_object) == JSON.stringify(expected_object));
     *
     * @returns {Object} Javascript object representation of the record
     * @returns {object}
     */
    toJsObject() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.recordplaintext_toJsObject(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get a record plaintext object from a series of bytes.
     *
     * @param {Uint8Array} bytes A left endian byte array representing the record plaintext.
     *
     * @returns {RecordPlaintext} The record plaintext.
     * @param {Uint8Array} bytes
     * @returns {RecordPlaintext}
     */
    static fromBytesLe(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.recordplaintext_fromBytesLe(retptr, addHeapObject(bytes));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return RecordPlaintext.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the left endian byte array representation of the record plaintext.
     *
     * @returns {Uint8Array} Byte array representation of the record plaintext.
     * @returns {Uint8Array}
     */
    toBytesLe() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.recordplaintext_toBytesLe(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the left endian boolean array representation of the record plaintext bits.
     *
     * @returns {Array} Boolean array representation of the record plaintext bits.
     * @returns {Array<any>}
     */
    toBitsLe() {
        const ret = wasm.recordplaintext_toBitsLe(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get the field array representation of the record plaintext.
     * @returns {Array<any>}
     */
    toFields() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.recordplaintext_toFields(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Attempt to get the serial number of a record to determine whether or not is has been spent
     *
     * @param {PrivateKey} private_key Private key of the account that owns the record
     * @param {string} program_id Program ID of the program that the record is associated with
     * @param {string} record_name Name of the record
     *
     * @returns {string} Serial number of the record
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
            const ptr0 = passStringToWasm0(program_id, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(record_name, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len1 = WASM_VECTOR_LEN;
            wasm.recordplaintext_serialNumberString(retptr, this.__wbg_ptr, private_key.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr3 = r0;
            var len3 = r1;
            if (r3) {
                ptr3 = 0; len3 = 0;
                throw takeObject(r2);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * ----- Modified by FoxWallet -----
     * @returns {string}
     */
    toJSON() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.recordplaintext_toJSON(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * ----- Modified by FoxWallet -----
     * @param {Field} sk_tag
     * @param {Field} commitment
     * @returns {string}
     */
    static foxTag(sk_tag, commitment) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(sk_tag, Field);
            _assertClass(commitment, Field);
            wasm.recordplaintext_foxTag(retptr, sk_tag.__wbg_ptr, commitment.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Get the tag of the record using the graph key.
     * @param {GraphKey} graph_key
     * @param {Field} commitment
     * @returns {Field}
     */
    tag(graph_key, commitment) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(graph_key, GraphKey);
            _assertClass(commitment, Field);
            var ptr0 = commitment.__destroy_into_raw();
            wasm.recordplaintext_tag(retptr, this.__wbg_ptr, graph_key.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const ScalarFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_scalar_free(ptr >>> 0, 1));
/**
 * Scalar field element.
 */
class Scalar {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Scalar.prototype);
        obj.__wbg_ptr = ptr;
        ScalarFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ScalarFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scalar_free(ptr, 0);
    }
    /**
     * Creates a scalar object from a string representation of a scalar element.
     * @param {string} group
     * @returns {Scalar}
     */
    static fromString(group) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(group, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.scalar_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Scalar.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the string representation of the scalar element.
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scalar_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Create a scalar element from a Uint8Array of left endian bytes.
     * @param {Uint8Array} bytes
     * @returns {Scalar}
     */
    static fromBytesLe(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scalar_fromBytesLe(retptr, addBorrowedObject(bytes));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Scalar.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * Encode the scalar element as a Uint8Array of left endian bytes.
     * @returns {Uint8Array}
     */
    toBytesLe() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scalar_toBytesLe(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Reconstruct a scalar element from a boolean array representation.
     * @param {Array<any>} bits
     * @returns {Scalar}
     */
    static fromBitsLe(bits) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scalar_fromBitsLe(retptr, addBorrowedObject(bits));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Scalar.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * Get the left endian boolean array representation of the scalar element.
     * @returns {Array<any>}
     */
    toBitsLe() {
        const ret = wasm.scalar_toBitsLe(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Create a plaintext element from a scalar element.
     * @returns {Plaintext}
     */
    toPlaintext() {
        const ret = wasm.scalar_toPlaintext(this.__wbg_ptr);
        return Plaintext.__wrap(ret);
    }
    /**
     * Clone the scalar element.
     * @returns {Scalar}
     */
    clone() {
        const ret = wasm.field_clone(this.__wbg_ptr);
        return Scalar.__wrap(ret);
    }
    /**
     * Generate a random scalar element.
     * @returns {Scalar}
     */
    static random() {
        const ret = wasm.scalar_random();
        return Scalar.__wrap(ret);
    }
    /**
     * Add two scalar elements.
     * @param {Scalar} other
     * @returns {Scalar}
     */
    add(other) {
        _assertClass(other, Scalar);
        const ret = wasm.scalar_add(this.__wbg_ptr, other.__wbg_ptr);
        return Scalar.__wrap(ret);
    }
    /**
     * Subtract two scalar elements.
     * @param {Scalar} other
     * @returns {Scalar}
     */
    subtract(other) {
        _assertClass(other, Scalar);
        const ret = wasm.scalar_subtract(this.__wbg_ptr, other.__wbg_ptr);
        return Scalar.__wrap(ret);
    }
    /**
     * Multiply two scalar elements.
     * @param {Scalar} other
     * @returns {Scalar}
     */
    multiply(other) {
        _assertClass(other, Scalar);
        const ret = wasm.scalar_multiply(this.__wbg_ptr, other.__wbg_ptr);
        return Scalar.__wrap(ret);
    }
    /**
     * Divide two scalar elements.
     * @param {Scalar} other
     * @returns {Scalar}
     */
    divide(other) {
        _assertClass(other, Scalar);
        const ret = wasm.scalar_divide(this.__wbg_ptr, other.__wbg_ptr);
        return Scalar.__wrap(ret);
    }
    /**
     * Double the scalar element.
     * @returns {Scalar}
     */
    double() {
        const ret = wasm.scalar_double(this.__wbg_ptr);
        return Scalar.__wrap(ret);
    }
    /**
     * Power of a scalar element.
     * @param {Scalar} other
     * @returns {Scalar}
     */
    pow(other) {
        _assertClass(other, Scalar);
        const ret = wasm.scalar_pow(this.__wbg_ptr, other.__wbg_ptr);
        return Scalar.__wrap(ret);
    }
    /**
     * Invert the scalar element.
     * @returns {Scalar}
     */
    inverse() {
        const ret = wasm.scalar_inverse(this.__wbg_ptr);
        return Scalar.__wrap(ret);
    }
    /**
     * Get the multiplicative identity of the scalar field.
     * @returns {Scalar}
     */
    static one() {
        const ret = wasm.scalar_one();
        return Scalar.__wrap(ret);
    }
    /**
     * Get the additive identity of the scalar field.
     * @returns {Scalar}
     */
    static zero() {
        const ret = wasm.field_zero();
        return Scalar.__wrap(ret);
    }
    /**
     * Check if one scalar element equals another.
     * @param {Scalar} other
     * @returns {boolean}
     */
    equals(other) {
        _assertClass(other, Scalar);
        const ret = wasm.field_equals(this.__wbg_ptr, other.__wbg_ptr);
        return ret !== 0;
    }
}

const SignatureFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_signature_free(ptr >>> 0, 1));
/**
 * Cryptographic signature of a message signed by an Aleo account
 */
class Signature {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Signature.prototype);
        obj.__wbg_ptr = ptr;
        SignatureFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SignatureFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signature_free(ptr, 0);
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
        const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_export_3);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.privatekey_sign(private_key.__wbg_ptr, ptr0, len0);
        return Signature.__wrap(ret);
    }
    /**
     * Get an address from a signature.
     *
     * @returns {Address} Address object
     * @returns {Address}
     */
    to_address() {
        const ret = wasm.signature_to_address(this.__wbg_ptr);
        return Address.__wrap(ret);
    }
    /**
     * Get the challenge of a signature.
     * @returns {Scalar}
     */
    challenge() {
        const ret = wasm.field_clone(this.__wbg_ptr);
        return Scalar.__wrap(ret);
    }
    /**
     * Get the response of a signature.
     * @returns {Scalar}
     */
    response() {
        const ret = wasm.signature_response(this.__wbg_ptr);
        return Scalar.__wrap(ret);
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
        const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_export_3);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.signature_verify(this.__wbg_ptr, address.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Get a signature from a series of bytes.
     *
     * @param {Uint8Array} bytes A left endian byte array representing the signature.
     *
     * @returns {Signature} The signature object.
     * @param {Uint8Array} bytes
     * @returns {Signature}
     */
    static fromBytesLe(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signature_fromBytesLe(retptr, addHeapObject(bytes));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Signature.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the left endian byte array representation of the signature.
     * @returns {Uint8Array}
     */
    toBytesLe() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signature_toBytesLe(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get a signature from a series of bits represented as a boolean array.
     *
     * @param {Array} bits A left endian boolean array representing the bits of the signature.
     *
     * @returns {Signature} The signature object.
     * @param {Array<any>} bits
     * @returns {Signature}
     */
    static fromBitsLe(bits) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signature_fromBitsLe(retptr, addHeapObject(bits));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Signature.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the left endian boolean array representation of the bits of the signature.
     * @returns {Array<any>}
     */
    toBitsLe() {
        const ret = wasm.signature_toBitsLe(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get the field array representation of the signature.
     * @returns {Array<any>}
     */
    toFields() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signature_toFields(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
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
        const ptr0 = passStringToWasm0(signature, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the plaintext representation of the signature.
     * @returns {Plaintext}
     */
    toPlaintext() {
        const ret = wasm.signature_toPlaintext(this.__wbg_ptr);
        return Plaintext.__wrap(ret);
    }
    /**
     * ----- Modified by FoxWallet -----
     * @returns {string}
     */
    to_hex() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signature_to_hex(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
}

const TransactionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_transaction_free(ptr >>> 0, 1));
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
        TransactionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TransactionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transaction_free(ptr, 0);
    }
    /**
     * Create a transaction from a string
     *
     * @param {string} transaction String representation of a transaction
     * @returns {Transaction}
     * @param {string} transaction
     * @returns {Transaction}
     */
    static fromString(transaction) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(transaction, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.transaction_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Transaction.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Create a transaction from a Uint8Array of left endian bytes.
     *
     * @param {Uint8Array} Uint8Array of left endian bytes encoding a Transaction.
     * @returns {Transaction}
     * @param {Uint8Array} bytes
     * @returns {Transaction}
     */
    static fromBytesLe(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_fromBytesLe(retptr, addHeapObject(bytes));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the transaction as a Uint8Array of left endian bytes.
     *
     * @returns {Uint8Array} Uint8Array representation of the transaction
     * @returns {Uint8Array}
     */
    toBytesLe() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_toBytesLe(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns true if the transaction contains the given serial number.
     *
     * @param {boolean} True if the transaction contains the given serial number.
     * @param {Field} serial_number
     * @returns {boolean}
     */
    constainsSerialNumber(serial_number) {
        _assertClass(serial_number, Field);
        const ret = wasm.transaction_constainsSerialNumber(this.__wbg_ptr, serial_number.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns true if the transaction contains the given commitment.
     *
     * @param {boolean} True if the transaction contains the given commitment.
     * @param {Field} commitment
     * @returns {boolean}
     */
    constainsCommitment(commitment) {
        _assertClass(commitment, Field);
        const ret = wasm.transaction_constainsCommitment(this.__wbg_ptr, commitment.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Find a record in the transaction by the record's commitment.
     * @param {Field} commitment
     * @returns {RecordCiphertext | undefined}
     */
    findRecord(commitment) {
        _assertClass(commitment, Field);
        const ret = wasm.transaction_findRecord(this.__wbg_ptr, commitment.__wbg_ptr);
        return ret === 0 ? undefined : RecordCiphertext.__wrap(ret);
    }
    /**
     * Returns the transaction's base fee.
     * @returns {bigint}
     */
    baseFeeAmount() {
        const ret = wasm.transaction_baseFeeAmount(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Returns the transaction's total fee.
     * @returns {bigint}
     */
    feeAmount() {
        const ret = wasm.transaction_feeAmount(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Returns the transaction's priority fee.
     *
     * returns {bigint} The transaction's priority fee.
     * @returns {bigint}
     */
    priorityFeeAmount() {
        const ret = wasm.transaction_priorityFeeAmount(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Returns true if the transaction is a deployment transaction.
     *
     * @returns {boolean} True if the transaction is a deployment transaction
     * @returns {boolean}
     */
    isDeploy() {
        const ret = wasm.transaction_isDeploy(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns true if the transaction is an execution transaction.
     *
     * @returns {boolean} True if the transaction is an execution transaction
     * @returns {boolean}
     */
    isExecute() {
        const ret = wasm.transaction_isExecute(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns true if the transaction is a fee transaction.
     *
     * @returns {boolean} True if the transaction is a fee transaction
     * @returns {boolean}
     */
    isFee() {
        const ret = wasm.transaction_isFee(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns the program deployed within the transaction if the transaction is a deployment
     * transaction.
     *
     * @returns {Program | undefined} The program deployed within the transaction.
     * @returns {Program | undefined}
     */
    deployedProgram() {
        const ret = wasm.transaction_deployedProgram(this.__wbg_ptr);
        return ret === 0 ? undefined : Program.__wrap(ret);
    }
    /**
     * Returns the execution within the transaction (if present).
     *
     * @returns {Execution | undefined} The execution within the transaction.
     * @returns {Execution | undefined}
     */
    execution() {
        const ret = wasm.transaction_execution(this.__wbg_ptr);
        return ret === 0 ? undefined : Execution.__wrap(ret);
    }
    /**
     * Get the record plaintext present in a transaction owned by a specific view key.
     *
     * @param {ViewKey} view_key View key used to decrypt the ciphertext
     *
     * @returns {Array<RecordPlaintext>} Array of record plaintext objects
     * @param {ViewKey} view_key
     * @returns {Array<any>}
     */
    ownedRecords(view_key) {
        _assertClass(view_key, ViewKey);
        const ret = wasm.transaction_ownedRecords(this.__wbg_ptr, view_key.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get the records present in a transaction and their commitments.
     *
     * @returns {Array<{commitment: Field, record: RecordCiphertext}>} Array of record ciphertext objects
     * @returns {Array<any>}
     */
    records() {
        const ret = wasm.transaction_records(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get a summary of the transaction within a javascript object.
     *
     * If the transaction is an execution transaction, this function will return a list of the
     * transitions and their inputs and outputs.
     *
     * If the transaction is a deployment transaction, this function will return the program id and
     * a list of the functions and their verifying keys, constraint, and variable counts.
     *
     * @param {boolean} convert_to_js If true the inputs and outputs will be converted to JS objects,
     * if false the inputs and outputs will be in wasm format.
     *
     * @returns {Object} Transaction summary
     * @param {boolean} convert_to_js
     * @returns {object}
     */
    summary(convert_to_js) {
        const ret = wasm.transaction_summary(this.__wbg_ptr, convert_to_js);
        return takeObject(ret);
    }
    /**
     * Get the id of the transaction. This is the merkle root of the transaction's inclusion proof.
     *
     * This value can be used to query the status of the transaction on the Aleo Network to see
     * if it was successful. If successful, the transaction will be included in a block and this
     * value can be used to lookup the transaction data on-chain.
     *
     * @returns {string} TransactionId
     * @returns {string}
     */
    id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the transitions in a transaction.
     *
     * @returns {Array<Transition>} Array of transition objects
     * @returns {Array<any>}
     */
    transitions() {
        const ret = wasm.transaction_transitions(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get the verifying keys in a transaction.
     *
     * @returns {Array<Object>} Array of verifying keys.
     * @returns {Array<any>}
     */
    verifyingKeys() {
        const ret = wasm.transaction_verifyingKeys(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const TransitionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_transition_free(ptr >>> 0, 1));

class Transition {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Transition.prototype);
        obj.__wbg_ptr = ptr;
        TransitionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TransitionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transition_free(ptr, 0);
    }
    /**
     * Get the transition ID
     *
     * @returns {string} The transition ID
     * @returns {string}
     */
    id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transition_id(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Create a transition from a string
     *
     * @param {string} transition String representation of a transition
     * @returns {Transition}
     * @param {string} transition
     * @returns {Transition}
     */
    static fromString(transition) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(transition, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.transition_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Transition.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Create a transition from a Uint8Array of left endian bytes.
     *
     * @param {Uint8Array} Uint8Array of left endian bytes encoding a Transition.
     * @returns {Transition}
     * @param {Uint8Array} bytes
     * @returns {Transition}
     */
    static fromBytesLe(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transition_fromBytesLe(retptr, addHeapObject(bytes));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Transition.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the transition as a string. If you want to submit this transition to the Aleo Network
     * this function will create the string that should be submitted in the `POST` data.
     *
     * @returns {string} String representation of the transition
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transition_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the transition as a Uint8Array of left endian bytes.
     *
     * @returns {Uint8Array} Uint8Array representation of the transition
     * @returns {Uint8Array}
     */
    toBytesLe() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transition_toBytesLe(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get the program ID of the transition.
     * @returns {string}
     */
    programId() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transition_programId(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the function name of the transition.
     * @returns {string}
     */
    functionName() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transition_functionName(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns true if the transition contains the given commitment.
     *
     * @param {boolean} True if the transition contains the given commitment.
     * @param {Field} commitment
     * @returns {boolean}
     */
    containsCommitment(commitment) {
        _assertClass(commitment, Field);
        const ret = wasm.transition_containsCommitment(this.__wbg_ptr, commitment.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Check if the transition contains a serial number.
     *
     * @param {Field} serial_number The serial number to check for
     *
     * @returns {bool} True if the transition contains a serial number, false otherwise
     * @param {Field} serial_number
     * @returns {boolean}
     */
    containsSerialNumber(serial_number) {
        _assertClass(serial_number, Field);
        const ret = wasm.transition_containsSerialNumber(this.__wbg_ptr, serial_number.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Find a record in the transition by the record's commitment.
     * @param {Field} commitment
     * @returns {RecordCiphertext | undefined}
     */
    findRecord(commitment) {
        _assertClass(commitment, Field);
        const ret = wasm.transition_findRecord(this.__wbg_ptr, commitment.__wbg_ptr);
        return ret === 0 ? undefined : RecordCiphertext.__wrap(ret);
    }
    /**
     * Get the record plaintext present in a transition owned by a specific view key.
     *
     * @param {ViewKey} view_key The view key of the record owner.
     *
     * @returns {Array<RecordPlaintext>} Array of record plaintext objects
     * @param {ViewKey} view_key
     * @returns {Array<any>}
     */
    ownedRecords(view_key) {
        _assertClass(view_key, ViewKey);
        const ret = wasm.transition_ownedRecords(this.__wbg_ptr, view_key.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get the records present in a transition and their commitments.
     *
     * @returns {Array<{commitment: Field, record: RecordCiphertext}>} Array of record ciphertext objects
     * @returns {Array<any>}
     */
    records() {
        const ret = wasm.transition_records(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Get the inputs of the transition.
     *
     * @param {bool} convert_to_js If true the inputs will be converted to JS objects, if false
     * the inputs will be in wasm format.
     *
     * @returns {Array} Array of inputs
     * @param {boolean} convert_to_js
     * @returns {Array<any>}
     */
    inputs(convert_to_js) {
        const ret = wasm.transition_inputs(this.__wbg_ptr, convert_to_js);
        return takeObject(ret);
    }
    /**
     * Get the outputs of the transition.
     *
     * @param {bool} convert_to_js If true the outputs will be converted to JS objects, if false
     * the outputs will be in wasm format.
     *
     * @returns {Array} Array of outputs
     * @param {boolean} convert_to_js
     * @returns {Array<any>}
     */
    outputs(convert_to_js) {
        const ret = wasm.transition_outputs(this.__wbg_ptr, convert_to_js);
        return takeObject(ret);
    }
    /**
     * Get the transition public key of the transition.
     * @returns {Group}
     */
    tpk() {
        const ret = wasm.address_toGroup(this.__wbg_ptr);
        return Group.__wrap(ret);
    }
    /**
     * Get the transition view key of the transition.
     * @param {ViewKey} view_key
     * @returns {Field}
     */
    tvk(view_key) {
        _assertClass(view_key, ViewKey);
        const ret = wasm.transition_tvk(this.__wbg_ptr, view_key.__wbg_ptr);
        return Field.__wrap(ret);
    }
    /**
     * Get the transition commitment of the transition.
     * @returns {Field}
     */
    tcm() {
        const ret = wasm.transition_tcm(this.__wbg_ptr);
        return Field.__wrap(ret);
    }
    /**
     * Get the transition signer commitment of the transition.
     * @returns {Field}
     */
    scm() {
        const ret = wasm.transition_scm(this.__wbg_ptr);
        return Field.__wrap(ret);
    }
}

const VerifyingKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_verifyingkey_free(ptr >>> 0, 1));
/**
 * Verifying key for a function within an Aleo program
 */
class VerifyingKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VerifyingKey.prototype);
        obj.__wbg_ptr = ptr;
        VerifyingKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VerifyingKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_verifyingkey_free(ptr, 0);
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
     * Returns the verifying key for the bond_validator function
     *
     * @returns {VerifyingKey} Verifying key for the bond_validator function
     * @returns {VerifyingKey}
     */
    static bondValidatorVerifier() {
        const ret = wasm.verifyingkey_bondValidatorVerifier();
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
     * Returns the verifying key for the transfer_public_as_signer function
     *
     * @returns {VerifyingKey} Verifying key for the transfer_public_as_signer function
     * @returns {VerifyingKey}
     */
    static transferPublicAsSignerVerifier() {
        const ret = wasm.verifyingkey_transferPublicAsSignerVerifier();
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
     * Returns the verifying key for the unbond_public function
     *
     * @returns {VerifyingKey} Verifying key for the unbond_public function
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
     * Returns the verifying key for the bond_validator function
     *
     * @returns {VerifyingKey} Verifying key for the bond_validator function
     * @returns {boolean}
     */
    isBondValidatorVerifier() {
        const ret = wasm.verifyingkey_isBondValidatorVerifier(this.__wbg_ptr);
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
        const ret = wasm.verifyingkey_isTransferPrivateToPublicVerifier(this.__wbg_ptr);
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
     * Verifies the verifying key is for the transfer_public_as_signer function
     *
     * @returns {bool}
     * @returns {boolean}
     */
    isTransferPublicAsSignerVerifier() {
        const ret = wasm.verifyingkey_isTransferPublicAsSignerVerifier(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Verifies the verifying key is for the transfer_public_to_private function
     *
     * @returns {bool}
     * @returns {boolean}
     */
    isTransferPublicToPrivateVerifier() {
        const ret = wasm.verifyingkey_isTransferPublicToPrivateVerifier(this.__wbg_ptr);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Create a copy of the verifying key
     *
     * @returns {VerifyingKey} A copy of the verifying key
     * @returns {VerifyingKey}
     */
    copy() {
        const ret = wasm.verifyingkey_copy(this.__wbg_ptr);
        return VerifyingKey.__wrap(ret);
    }
    /**
     * Construct a new verifying key from a byte array
     *
     * @param {Uint8Array} bytes Byte representation of a verifying key
     * @returns {VerifyingKey}
     * @param {Uint8Array} bytes
     * @returns {VerifyingKey}
     */
    static fromBytes(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export_3);
            const len0 = WASM_VECTOR_LEN;
            wasm.verifyingkey_fromBytes(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @returns {VerifyingKey}
     * @param {string} string
     * @returns {VerifyingKey}
     */
    static fromString(string) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(string, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.verifyingkey_fromString(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
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
     * @returns {Uint8Array} Byte representation of a verifying key
     * @returns {Uint8Array}
     */
    toBytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.verifyingkey_toBytes(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
}

const ViewKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_viewkey_free(ptr >>> 0, 1));

class ViewKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ViewKey.prototype);
        obj.__wbg_ptr = ptr;
        ViewKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ViewKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_viewkey_free(ptr, 0);
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
        const ptr0 = passStringToWasm0(view_key, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
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
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
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
     * Get the underlying scalar of a view key.
     * @returns {Scalar}
     */
    to_scalar() {
        const ret = wasm.field_clone(this.__wbg_ptr);
        return Scalar.__wrap(ret);
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
            const ptr0 = passStringToWasm0(ciphertext, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
            const len0 = WASM_VECTOR_LEN;
            wasm.viewkey_decrypt(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * ----- Modified by FoxWallet -----
     * @returns {Field}
     */
    skTag() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.viewkey_skTag(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Field.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * ----- Modified by FoxWallet -----
     * @returns {ViewKey}
     */
    clone() {
        const ret = wasm.field_clone(this.__wbg_ptr);
        return ViewKey.__wrap(ret);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

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
    imports.wbg.__wbg_abort_775ef1d17fc65868 = function(arg0) {
        getObject(arg0).abort();
    };
    imports.wbg.__wbg_address_new = function(arg0) {
        const ret = Address.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_append_8c7dd8d641a5f01b = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_arrayBuffer_d1b44c4390db422f = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_async_9ff6d9e405f13772 = function(arg0) {
        const ret = getObject(arg0).async;
        return ret;
    };
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_672a4d21634d4a24 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_7cccdd69e0791ae2 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_ciphertext_new = function(arg0) {
        const ret = Ciphertext.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_ed58b8e10a292839 = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_data_432d9c3df2630942 = function(arg0) {
        const ret = getObject(arg0).data;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_done_769e5ede4b31c67b = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_export_2(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_executionresponse_new = function(arg0) {
        const ret = ExecutionResponse.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetch_509096533071c657 = function(arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetch_f1856afdb49415d1 = function(arg0) {
        const ret = fetch(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_field_new = function(arg0) {
        const ret = Field.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_field_unwrap = function(arg0) {
        const ret = Field.__unwrap(takeObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_getRandomValues_bcb4912f16000dc4 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_get_67b2ba62fc30de12 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_b9b93047fe3cf45b = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_group_new = function(arg0) {
        const ret = Group.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_has_a5ea9117f258a0ec = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(getObject(arg0), getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_headers_9cb51cfd2ac780a4 = function(arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Response_f2cc20d9f7dfd644 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Response;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_iterator_9a24c88df860dc65 = function() {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_keypair_new = function(arg0) {
        const ret = KeyPair.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_a446193dc22c12f8 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_length_e2d2a49132c1b256 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_log_0e4cc02ccd760d45 = function(arg0, arg1) {
        console.log(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_msCrypto_0a36e2ec3a343d26 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_018dcc2d6c8c2f6a = function() { return handleError(function () {
        const ret = new Headers();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_23a2665fac83c611 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_535(a, state0.b, arg0, arg1);
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
    imports.wbg.__wbg_new_405e22f390576ce2 = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_78feb108b6472713 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_86231e225ca6b962 = function() { return handleError(function () {
        const ret = new XMLHttpRequest();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_a12002a7f91c75be = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_b1a33e5095abf678 = function() { return handleError(function (arg0, arg1) {
        const ret = new Worker(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_e25e5aab09ff45db = function() { return handleError(function () {
        const ret = new AbortController();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_e9a4a67dbababe57 = function(arg0) {
        const ret = new Int32Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newnoargs_105ed471475aaf50 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_a381634e90c276d4 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_c4c419ef0bc8a1f8 = function(arg0) {
        const ret = new Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithstrandinit_06c535e0a867c635 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_next_25feadfc0913fea9 = function(arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_6574e1a8a62d1055 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_node_02999533c4ea02e3 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_of_4a05197bfc89556f = function(arg0, arg1, arg2) {
        const ret = Array.of(getObject(arg0), getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_open_13a598ea50d82926 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).open(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4), arg5 !== 0);
    }, arguments) };
    imports.wbg.__wbg_overrideMimeType_36ce5eeae20aff9f = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).overrideMimeType(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_plaintext_new = function(arg0) {
        const ret = Plaintext.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_postMessage_6edafa8f7b9c2f52 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).postMessage(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_process_5c1d670bc53614b8 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_737cfc8c1432c2c6 = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_97d92b4fcc8a61c5 = function(arg0) {
        queueMicrotask(getObject(arg0));
    };
    imports.wbg.__wbg_queueMicrotask_d3219def82552485 = function(arg0) {
        const ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_ab2cfe79ebbf2740 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_recordciphertext_new = function(arg0) {
        const ret = RecordCiphertext.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_recordplaintext_new = function(arg0) {
        const ret = RecordPlaintext.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_79b1e9274cde3c87 = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_resolve_4851785c9c5f573d = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_responseText_ad050aa7f8afec9f = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).responseText;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_response_49e10f8ee7f418db = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).response;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_send_40a47636ff90f64d = function() { return handleError(function (arg0) {
        getObject(arg0).send();
    }, arguments) };
    imports.wbg.__wbg_set_37837023f3d740e8 = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    };
    imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_set_bb8cecf6a62b9f46 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setbody_5923b78a95eedf29 = function(arg0, arg1) {
        getObject(arg0).body = getObject(arg1);
    };
    imports.wbg.__wbg_setcredentials_c3a22f1cd105a2c6 = function(arg0, arg1) {
        getObject(arg0).credentials = __wbindgen_enum_RequestCredentials[arg1];
    };
    imports.wbg.__wbg_setheaders_834c0bdb6a8949ad = function(arg0, arg1) {
        getObject(arg0).headers = getObject(arg1);
    };
    imports.wbg.__wbg_setmethod_3c5280fe5d890842 = function(arg0, arg1, arg2) {
        getObject(arg0).method = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_setmode_5dc300b865044b65 = function(arg0, arg1) {
        getObject(arg0).mode = __wbindgen_enum_RequestMode[arg1];
    };
    imports.wbg.__wbg_setonmessage_5a885b16bdc6dca6 = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_setsignal_75b21ef3a81de905 = function(arg0, arg1) {
        getObject(arg0).signal = getObject(arg1);
    };
    imports.wbg.__wbg_signal_aaf9ad74119f20a4 = function(arg0) {
        const ret = getObject(arg0).signal;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_signature_new = function(arg0) {
        const ret = Signature.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_spawnWorker_d283a0e4c0e316c8 = function(arg0, arg1, arg2, arg3) {
        const ret = spawnWorker(getObject(arg0), getObject(arg1), getObject(arg2), arg3 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_88a902d13a557d07 = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0 = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_37c5d418e4bf5819 = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_5de37043a91a9c40 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_status_12bcf88a8ff51470 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).status;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_status_f6360336ca686bf0 = function(arg0) {
        const ret = getObject(arg0).status;
        return ret;
    };
    imports.wbg.__wbg_stringify_f7ed6987935b4a24 = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_subarray_aa9065fa9dc5df96 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_44b73946d2fb3e7d = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_48b406749878a531 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_transaction_new = function(arg0) {
        const ret = Transaction.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_transition_new = function(arg0) {
        const ret = Transition.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_url_ae10c34ca209681d = function(arg0, arg1) {
        const ret = getObject(arg1).url;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_value_cd1ffa7b1ab794f1 = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_value_dab73d3d5d4abaaf = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_verifyingkey_new = function(arg0) {
        const ret = VerifyingKey.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_c71aa1626a93e0a1 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_waitAsync_61f0a081053dd3c2 = function(arg0, arg1, arg2) {
        const ret = Atomics.waitAsync(getObject(arg0), arg1 >>> 0, arg2);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_waitAsync_7ce6c8a047c752c3 = function() {
        const ret = Atomics.waitAsync;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_bigint_from_i128 = function(arg0, arg1) {
        const ret = arg0 << BigInt(64) | BigInt.asUintN(64, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_bigint_from_i64 = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_bigint_from_u128 = function(arg0, arg1) {
        const ret = BigInt.asUintN(64, arg0) << BigInt(64) | BigInt.asUintN(64, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
        const ret = BigInt.asUintN(64, arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper6130 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 525, __wbg_adapter_40);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper6136 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 525, __wbg_adapter_40);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_link_9579f016b4522a24 = function(arg0) {
        const val = `onmessage = function (ev) {
            let [ia, index, value] = ev.data;
            ia = new Int32Array(ia.buffer);
            let result = Atomics.wait(ia, index, value);
            postMessage(result);
        };
        `;
        const ret = typeof URL.createObjectURL === 'undefined' ? "data:application/javascript," + encodeURIComponent(val) : URL.createObjectURL(new Blob([val], { type: "text/javascript" }));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_module = function() {
        const ret = __wbg_init.__wbindgen_wasm_module;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_rethrow = function(arg0) {
        throw takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_3, wasm.__wbindgen_export_4);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {
    imports.wbg.memory = memory || new WebAssembly.Memory({initial:24,maximum:65536,shared:true});
}

function __wbg_finalize_init(instance, module, thread_stack_size) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;

    if (typeof thread_stack_size !== 'undefined' && (typeof thread_stack_size !== 'number' || thread_stack_size === 0 || thread_stack_size % 65536 !== 0)) { throw 'invalid stack size' }
    wasm.__wbindgen_start(thread_stack_size);
    return wasm;
}

function initSync(module, memory) {
    if (wasm !== undefined) return wasm;

    let thread_stack_size;
    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module, memory, thread_stack_size} = module);
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead');
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports, memory);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module, thread_stack_size);
}

async function __wbg_init(module_or_path, memory) {
    if (wasm !== undefined) return wasm;

    let thread_stack_size;
    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path, memory, thread_stack_size} = module_or_path);
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead');
        }
    }


    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports, memory);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module, thread_stack_size);
}

const module$1 = new URL("aleo_wasm.wasm", import.meta.url);
                
                    await __wbg_init({ module_or_path: module$1 });

async function initThreadPool(threads) {
    if (threads == null) {
        threads = navigator.hardwareConcurrency;
    }

    console.info(`Spawning ${threads} threads`);

    await initThreadPool$1(new URL("worker.js", import.meta.url), threads);
}

export { Address, BHP1024, BHP256, BHP512, BHP768, Ciphertext, ComputeKey, Execution, ExecutionResponse, Field, FoxFuture, GraphKey, Group, KeyPair, Metadata, OfflineQuery, Pedersen128, Pedersen64, Plaintext, Poseidon2, Poseidon4, Poseidon8, PrivateKey, PrivateKeyCiphertext, Program, ProgramManager, ProvingKey, RecordCiphertext, RecordPlaintext, Scalar, Signature, Transaction, Transition, VerifyingKey, ViewKey, hashBHP256, initSync, initThreadPool, runRayonThread, verifyFunctionExecution };
//# sourceMappingURL=index.js.map
