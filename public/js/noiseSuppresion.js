let createWasmMonoInstance;
{
  var Module = (() => {
    var _scriptDir = location.href;

    return function (Module) {
      Module = Module || {};

      var Module = typeof Module != 'undefined' ? Module : {};
      var readyPromiseResolve, readyPromiseReject;
      Module['ready'] = new Promise(function (resolve, reject) {
        readyPromiseResolve = resolve;
        readyPromiseReject = reject;
      });
      var moduleOverrides = Object.assign({}, Module);
      var arguments_ = [];
      var thisProgram = './this.program';
      var quit_ = (status, toThrow) => {
        throw toThrow;
      };
      var ENVIRONMENT_IS_WEB = typeof window == 'object';
      var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
      var ENVIRONMENT_IS_NODE =
        typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
      var scriptDirectory = '';
      function locateFile(path) {
        if (Module['locateFile']) {
          return Module['locateFile'](path, scriptDirectory);
        }
        return scriptDirectory + path;
      }
      var read_, readAsync, readBinary, setWindowTitle;
      if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
        if (ENVIRONMENT_IS_WORKER) {
          scriptDirectory = self.location.href;
        } else if (typeof document != 'undefined' && document.currentScript) {
          scriptDirectory = document.currentScript.src;
        }
        if (_scriptDir) {
          scriptDirectory = _scriptDir;
        }
        if (scriptDirectory.indexOf('blob:') !== 0) {
          scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1);
        } else {
          scriptDirectory = '';
        }
        {
          read_ = (url) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send(null);
            return xhr.responseText;
          };
          if (ENVIRONMENT_IS_WORKER) {
            readBinary = (url) => {
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              xhr.responseType = 'arraybuffer';
              xhr.send(null);
              return new Uint8Array(xhr.response);
            };
          }
          readAsync = (url, onload, onerror) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
              if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
                onload(xhr.response);
                return;
              }
              onerror();
            };
            xhr.onerror = onerror;
            xhr.send(null);
          };
        }
        setWindowTitle = (title) => (document.title = title);
      } else {
      }
      var out = Module['print'] || console.log.bind(console);
      var err = Module['printErr'] || console.warn.bind(console);
      Object.assign(Module, moduleOverrides);
      moduleOverrides = null;
      if (Module['arguments']) arguments_ = Module['arguments'];
      if (Module['thisProgram']) thisProgram = Module['thisProgram'];
      if (Module['quit']) quit_ = Module['quit'];
      var tempRet0 = 0;
      var setTempRet0 = (value) => {
        tempRet0 = value;
      };
      var getTempRet0 = () => tempRet0;
      var wasmBinary;
      if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
      var noExitRuntime = Module['noExitRuntime'] || false;
      if (typeof WebAssembly != 'object') {
        abort('no native wasm support detected');
      }
      var wasmMemory;
      var ABORT = false;
      var EXITSTATUS;
      function assert(condition, text) {
        if (!condition) {
          abort(text);
        }
      }
      var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
      function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
        var endIdx = idx + maxBytesToRead;
        var endPtr = idx;
        while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
          return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
        } else {
          var str = '';
          while (idx < endPtr) {
            var u0 = heapOrArray[idx++];
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
              str += String.fromCharCode(((u0 & 31) << 6) | u1);
              continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
              u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
            } else {
              u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
            }
          }
        }
        return str;
      }
      function UTF8ToString(ptr, maxBytesToRead) {
        return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
      }
      function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
        if (!(maxBytesToWrite > 0)) return 0;
        var startIdx = outIdx;
        var endIdx = outIdx + maxBytesToWrite - 1;
        for (var i = 0; i < str.length; ++i) {
          var u = str.charCodeAt(i);
          if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
          }
          if (u <= 127) {
            if (outIdx >= endIdx) break;
            heap[outIdx++] = u;
          } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            heap[outIdx++] = 192 | (u >> 6);
            heap[outIdx++] = 128 | (u & 63);
          } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            heap[outIdx++] = 224 | (u >> 12);
            heap[outIdx++] = 128 | ((u >> 6) & 63);
            heap[outIdx++] = 128 | (u & 63);
          } else {
            if (outIdx + 3 >= endIdx) break;
            heap[outIdx++] = 240 | (u >> 18);
            heap[outIdx++] = 128 | ((u >> 12) & 63);
            heap[outIdx++] = 128 | ((u >> 6) & 63);
            heap[outIdx++] = 128 | (u & 63);
          }
        }
        heap[outIdx] = 0;
        return outIdx - startIdx;
      }
      function stringToUTF8(str, outPtr, maxBytesToWrite) {
        return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
      }
      function lengthBytesUTF8(str) {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var u = str.charCodeAt(i);
          if (u >= 55296 && u <= 57343) u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
          if (u <= 127) ++len;
          else if (u <= 2047) len += 2;
          else if (u <= 65535) len += 3;
          else len += 4;
        }
        return len;
      }
      var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;
      function UTF16ToString(ptr, maxBytesToRead) {
        var endPtr = ptr;
        var idx = endPtr >> 1;
        var maxIdx = idx + maxBytesToRead / 2;
        while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
        endPtr = idx << 1;
        if (endPtr - ptr > 32 && UTF16Decoder) {
          return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
        } else {
          var str = '';
          for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
            var codeUnit = HEAP16[(ptr + i * 2) >> 1];
            if (codeUnit == 0) break;
            str += String.fromCharCode(codeUnit);
          }
          return str;
        }
      }
      function stringToUTF16(str, outPtr, maxBytesToWrite) {
        if (maxBytesToWrite === undefined) {
          maxBytesToWrite = 2147483647;
        }
        if (maxBytesToWrite < 2) return 0;
        maxBytesToWrite -= 2;
        var startPtr = outPtr;
        var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
        for (var i = 0; i < numCharsToWrite; ++i) {
          var codeUnit = str.charCodeAt(i);
          HEAP16[outPtr >> 1] = codeUnit;
          outPtr += 2;
        }
        HEAP16[outPtr >> 1] = 0;
        return outPtr - startPtr;
      }
      function lengthBytesUTF16(str) {
        return str.length * 2;
      }
      function UTF32ToString(ptr, maxBytesToRead) {
        var i = 0;
        var str = '';
        while (!(i >= maxBytesToRead / 4)) {
          var utf32 = HEAP32[(ptr + i * 4) >> 2];
          if (utf32 == 0) break;
          ++i;
          if (utf32 >= 65536) {
            var ch = utf32 - 65536;
            str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
          } else {
            str += String.fromCharCode(utf32);
          }
        }
        return str;
      }
      function stringToUTF32(str, outPtr, maxBytesToWrite) {
        if (maxBytesToWrite === undefined) {
          maxBytesToWrite = 2147483647;
        }
        if (maxBytesToWrite < 4) return 0;
        var startPtr = outPtr;
        var endPtr = startPtr + maxBytesToWrite - 4;
        for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) {
            var trailSurrogate = str.charCodeAt(++i);
            codeUnit = (65536 + ((codeUnit & 1023) << 10)) | (trailSurrogate & 1023);
          }
          HEAP32[outPtr >> 2] = codeUnit;
          outPtr += 4;
          if (outPtr + 4 > endPtr) break;
        }
        HEAP32[outPtr >> 2] = 0;
        return outPtr - startPtr;
      }
      function lengthBytesUTF32(str) {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
          len += 4;
        }
        return len;
      }
      function writeArrayToMemory(array, buffer) {
        HEAP8.set(array, buffer);
      }
      function writeAsciiToMemory(str, buffer, dontAddNull) {
        for (var i = 0; i < str.length; ++i) {
          HEAP8[buffer++ >> 0] = str.charCodeAt(i);
        }
        if (!dontAddNull) HEAP8[buffer >> 0] = 0;
      }
      var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
      function updateGlobalBufferAndViews(buf) {
        buffer = buf;
        Module['HEAP8'] = HEAP8 = new Int8Array(buf);
        Module['HEAP16'] = HEAP16 = new Int16Array(buf);
        Module['HEAP32'] = HEAP32 = new Int32Array(buf);
        Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
        Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
        Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
        Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
        Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
      }
      var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;
      var wasmTable;
      var __ATPRERUN__ = [];
      var __ATINIT__ = [];
      var __ATEXIT__ = [];
      var __ATPOSTRUN__ = [];
      var runtimeInitialized = false;
      var runtimeExited = false;
      var runtimeKeepaliveCounter = 0;
      function keepRuntimeAlive() {
        return noExitRuntime || runtimeKeepaliveCounter > 0;
      }
      function preRun() {
        if (Module['preRun']) {
          if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
          while (Module['preRun'].length) {
            addOnPreRun(Module['preRun'].shift());
          }
        }
        callRuntimeCallbacks(__ATPRERUN__);
      }
      function initRuntime() {
        runtimeInitialized = true;
        if (!Module['noFSInit'] && !FS.init.initialized) FS.init();
        FS.ignorePermissions = false;
        TTY.init();
        callRuntimeCallbacks(__ATINIT__);
      }
      function exitRuntime() {
        ___funcs_on_exit();
        callRuntimeCallbacks(__ATEXIT__);
        FS.quit();
        TTY.shutdown();
        runtimeExited = true;
      }
      function postRun() {
        if (Module['postRun']) {
          if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
          while (Module['postRun'].length) {
            addOnPostRun(Module['postRun'].shift());
          }
        }
        callRuntimeCallbacks(__ATPOSTRUN__);
      }
      function addOnPreRun(cb) {
        __ATPRERUN__.unshift(cb);
      }
      function addOnInit(cb) {
        __ATINIT__.unshift(cb);
      }
      function addOnPostRun(cb) {
        __ATPOSTRUN__.unshift(cb);
      }
      var runDependencies = 0;
      var runDependencyWatcher = null;
      var dependenciesFulfilled = null;
      function getUniqueRunDependency(id) {
        return id;
      }
      function addRunDependency(id) {
        runDependencies++;
        if (Module['monitorRunDependencies']) {
          Module['monitorRunDependencies'](runDependencies);
        }
      }
      function removeRunDependency(id) {
        runDependencies--;
        if (Module['monitorRunDependencies']) {
          Module['monitorRunDependencies'](runDependencies);
        }
        if (runDependencies == 0) {
          if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null;
          }
          if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback();
          }
        }
      }
      function abort(what) {
        {
          if (Module['onAbort']) {
            Module['onAbort'](what);
          }
        }
        what = 'Aborted(' + what + ')';
        err(what);
        ABORT = true;
        EXITSTATUS = 1;
        what += '. Build with -sASSERTIONS for more info.';
        var e = new WebAssembly.RuntimeError(what);
        readyPromiseReject(e);
        throw e;
      }
      var dataURIPrefix = 'data:application/octet-stream;base64,';
      function isDataURI(filename) {
        return filename.startsWith(dataURIPrefix);
      }
      var wasmBinaryFile;
      if (Module['locateFile']) {
        wasmBinaryFile = 'main-bin-mono.wasm';
        if (!isDataURI(wasmBinaryFile)) {
          wasmBinaryFile = locateFile(wasmBinaryFile);
        }
      } else {
        wasmBinaryFile = new URL('main-bin-mono.wasm', location.href).toString();
      }
      function getBinary(file) {
        try {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          if (readBinary) {
            return readBinary(file);
          } else {
            throw 'both async and sync fetching of the wasm failed';
          }
        } catch (err) {
          abort(err);
        }
      }
      function getBinaryPromise() {
        if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
          if (typeof fetch == 'function') {
            return fetch(wasmBinaryFile, { credentials: 'same-origin' })
              .then(function (response) {
                if (!response['ok']) {
                  throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
                }
                return response['arrayBuffer']();
              })
              .catch(function () {
                return getBinary(wasmBinaryFile);
              });
          }
        }
        return Promise.resolve().then(function () {
          return getBinary(wasmBinaryFile);
        });
      }
      function createWasm() {
        var info = { a: asmLibraryArg };
        function receiveInstance(instance, module) {
          var exports = instance.exports;
          Module['asm'] = exports;
          wasmMemory = Module['asm']['Na'];
          updateGlobalBufferAndViews(wasmMemory.buffer);
          wasmTable = Module['asm']['Pa'];
          addOnInit(Module['asm']['Oa']);
          removeRunDependency('wasm-instantiate');
        }
        addRunDependency('wasm-instantiate');
        function receiveInstantiationResult(result) {
          receiveInstance(result['instance']);
        }
        function instantiateArrayBuffer(receiver) {
          return getBinaryPromise()
            .then(function (binary) {
              return WebAssembly.instantiate(binary, info);
            })
            .then(function (instance) {
              return instance;
            })
            .then(receiver, function (reason) {
              err('failed to asynchronously prepare wasm: ' + reason);
              abort(reason);
            });
        }
        function instantiateAsync() {
          if (
            !wasmBinary &&
            typeof WebAssembly.instantiateStreaming == 'function' &&
            !isDataURI(wasmBinaryFile) &&
            typeof fetch == 'function'
          ) {
            return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
              var result = WebAssembly.instantiateStreaming(response, info);
              return result.then(receiveInstantiationResult, function (reason) {
                err('wasm streaming compile failed: ' + reason);
                err('falling back to ArrayBuffer instantiation');
                return instantiateArrayBuffer(receiveInstantiationResult);
              });
            });
          } else {
            return instantiateArrayBuffer(receiveInstantiationResult);
          }
        }
        if (Module['instantiateWasm']) {
          try {
            var exports = Module['instantiateWasm'](info, receiveInstance);
            return exports;
          } catch (e) {
            err('Module.instantiateWasm callback failed with error: ' + e);
            return false;
          }
        }
        instantiateAsync().catch(readyPromiseReject);
        return {};
      }
      var tempDouble;
      var tempI64;
      function callRuntimeCallbacks(callbacks) {
        while (callbacks.length > 0) {
          var callback = callbacks.shift();
          if (typeof callback == 'function') {
            callback(Module);
            continue;
          }
          var func = callback.func;
          if (typeof func == 'number') {
            if (callback.arg === undefined) {
              getWasmTableEntry(func)();
            } else {
              getWasmTableEntry(func)(callback.arg);
            }
          } else {
            func(callback.arg === undefined ? null : callback.arg);
          }
        }
      }
      var wasmTableMirror = [];
      function getWasmTableEntry(funcPtr) {
        var func = wasmTableMirror[funcPtr];
        if (!func) {
          if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
          wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
        }
        return func;
      }
      function ___assert_fail(condition, filename, line, func) {
        abort(
          'Assertion failed: ' +
            UTF8ToString(condition) +
            ', at: ' +
            [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']
        );
      }
      function ___cxa_allocate_exception(size) {
        return _malloc(size + 24) + 24;
      }
      var exceptionCaught = [];
      function exception_addRef(info) {
        info.add_ref();
      }
      var uncaughtExceptionCount = 0;
      function ___cxa_begin_catch(ptr) {
        var info = new ExceptionInfo(ptr);
        if (!info.get_caught()) {
          info.set_caught(true);
          uncaughtExceptionCount--;
        }
        info.set_rethrown(false);
        exceptionCaught.push(info);
        exception_addRef(info);
        return info.get_exception_ptr();
      }
      function ___cxa_current_primary_exception() {
        if (!exceptionCaught.length) {
          return 0;
        }
        var info = exceptionCaught[exceptionCaught.length - 1];
        exception_addRef(info);
        return info.excPtr;
      }
      function ExceptionInfo(excPtr) {
        this.excPtr = excPtr;
        this.ptr = excPtr - 24;
        this.set_type = function (type) {
          HEAPU32[(this.ptr + 4) >> 2] = type;
        };
        this.get_type = function () {
          return HEAPU32[(this.ptr + 4) >> 2];
        };
        this.set_destructor = function (destructor) {
          HEAPU32[(this.ptr + 8) >> 2] = destructor;
        };
        this.get_destructor = function () {
          return HEAPU32[(this.ptr + 8) >> 2];
        };
        this.set_refcount = function (refcount) {
          HEAP32[this.ptr >> 2] = refcount;
        };
        this.set_caught = function (caught) {
          caught = caught ? 1 : 0;
          HEAP8[(this.ptr + 12) >> 0] = caught;
        };
        this.get_caught = function () {
          return HEAP8[(this.ptr + 12) >> 0] != 0;
        };
        this.set_rethrown = function (rethrown) {
          rethrown = rethrown ? 1 : 0;
          HEAP8[(this.ptr + 13) >> 0] = rethrown;
        };
        this.get_rethrown = function () {
          return HEAP8[(this.ptr + 13) >> 0] != 0;
        };
        this.init = function (type, destructor) {
          this.set_adjusted_ptr(0);
          this.set_type(type);
          this.set_destructor(destructor);
          this.set_refcount(0);
          this.set_caught(false);
          this.set_rethrown(false);
        };
        this.add_ref = function () {
          var value = HEAP32[this.ptr >> 2];
          HEAP32[this.ptr >> 2] = value + 1;
        };
        this.release_ref = function () {
          var prev = HEAP32[this.ptr >> 2];
          HEAP32[this.ptr >> 2] = prev - 1;
          return prev === 1;
        };
        this.set_adjusted_ptr = function (adjustedPtr) {
          HEAPU32[(this.ptr + 16) >> 2] = adjustedPtr;
        };
        this.get_adjusted_ptr = function () {
          return HEAPU32[(this.ptr + 16) >> 2];
        };
        this.get_exception_ptr = function () {
          var isPointer = ___cxa_is_pointer_type(this.get_type());
          if (isPointer) {
            return HEAPU32[this.excPtr >> 2];
          }
          var adjusted = this.get_adjusted_ptr();
          if (adjusted !== 0) return adjusted;
          return this.excPtr;
        };
      }
      function ___cxa_free_exception(ptr) {
        return _free(new ExceptionInfo(ptr).ptr);
      }
      function exception_decRef(info) {
        if (info.release_ref() && !info.get_rethrown()) {
          var destructor = info.get_destructor();
          if (destructor) {
            getWasmTableEntry(destructor)(info.excPtr);
          }
          ___cxa_free_exception(info.excPtr);
        }
      }
      function ___cxa_decrement_exception_refcount(ptr) {
        if (!ptr) return;
        exception_decRef(new ExceptionInfo(ptr));
      }
      var exceptionLast = 0;
      function ___cxa_end_catch() {
        _setThrew(0);
        var info = exceptionCaught.pop();
        exception_decRef(info);
        exceptionLast = 0;
      }
      function ___resumeException(ptr) {
        if (!exceptionLast) {
          exceptionLast = ptr;
        }
        throw ptr;
      }
      function ___cxa_find_matching_catch_2() {
        var thrown = exceptionLast;
        if (!thrown) {
          setTempRet0(0);
          return 0;
        }
        var info = new ExceptionInfo(thrown);
        info.set_adjusted_ptr(thrown);
        var thrownType = info.get_type();
        if (!thrownType) {
          setTempRet0(0);
          return thrown;
        }
        var typeArray = Array.prototype.slice.call(arguments);
        for (var i = 0; i < typeArray.length; i++) {
          var caughtType = typeArray[i];
          if (caughtType === 0 || caughtType === thrownType) {
            break;
          }
          var adjusted_ptr_addr = info.ptr + 16;
          if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
            setTempRet0(caughtType);
            return thrown;
          }
        }
        setTempRet0(thrownType);
        return thrown;
      }
      function ___cxa_find_matching_catch_3() {
        var thrown = exceptionLast;
        if (!thrown) {
          setTempRet0(0);
          return 0;
        }
        var info = new ExceptionInfo(thrown);
        info.set_adjusted_ptr(thrown);
        var thrownType = info.get_type();
        if (!thrownType) {
          setTempRet0(0);
          return thrown;
        }
        var typeArray = Array.prototype.slice.call(arguments);
        for (var i = 0; i < typeArray.length; i++) {
          var caughtType = typeArray[i];
          if (caughtType === 0 || caughtType === thrownType) {
            break;
          }
          var adjusted_ptr_addr = info.ptr + 16;
          if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
            setTempRet0(caughtType);
            return thrown;
          }
        }
        setTempRet0(thrownType);
        return thrown;
      }
      function ___cxa_increment_exception_refcount(ptr) {
        if (!ptr) return;
        exception_addRef(new ExceptionInfo(ptr));
      }
      function ___cxa_rethrow() {
        var info = exceptionCaught.pop();
        if (!info) {
          abort('no exception to throw');
        }
        var ptr = info.excPtr;
        if (!info.get_rethrown()) {
          exceptionCaught.push(info);
          info.set_rethrown(true);
          info.set_caught(false);
          uncaughtExceptionCount++;
        }
        exceptionLast = ptr;
        throw ptr;
      }
      function ___cxa_rethrow_primary_exception(ptr) {
        if (!ptr) return;
        var info = new ExceptionInfo(ptr);
        exceptionCaught.push(info);
        info.set_rethrown(true);
        ___cxa_rethrow();
      }
      function ___cxa_throw(ptr, type, destructor) {
        var info = new ExceptionInfo(ptr);
        info.init(type, destructor);
        exceptionLast = ptr;
        uncaughtExceptionCount++;
        throw ptr;
      }
      function ___cxa_uncaught_exceptions() {
        return uncaughtExceptionCount;
      }
      var PATH = {
        isAbs: (path) => path.charAt(0) === '/',
        splitPath: (filename) => {
          var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
          return splitPathRe.exec(filename).slice(1);
        },
        normalizeArray: (parts, allowAboveRoot) => {
          var up = 0;
          for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === '.') {
              parts.splice(i, 1);
            } else if (last === '..') {
              parts.splice(i, 1);
              up++;
            } else if (up) {
              parts.splice(i, 1);
              up--;
            }
          }
          if (allowAboveRoot) {
            for (; up; up--) {
              parts.unshift('..');
            }
          }
          return parts;
        },
        normalize: (path) => {
          var isAbsolute = PATH.isAbs(path),
            trailingSlash = path.substr(-1) === '/';
          path = PATH.normalizeArray(
            path.split('/').filter((p) => !!p),
            !isAbsolute
          ).join('/');
          if (!path && !isAbsolute) {
            path = '.';
          }
          if (path && trailingSlash) {
            path += '/';
          }
          return (isAbsolute ? '/' : '') + path;
        },
        dirname: (path) => {
          var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
          if (!root && !dir) {
            return '.';
          }
          if (dir) {
            dir = dir.substr(0, dir.length - 1);
          }
          return root + dir;
        },
        basename: (path) => {
          if (path === '/') return '/';
          path = PATH.normalize(path);
          path = path.replace(/\/$/, '');
          var lastSlash = path.lastIndexOf('/');
          if (lastSlash === -1) return path;
          return path.substr(lastSlash + 1);
        },
        join: function () {
          var paths = Array.prototype.slice.call(arguments, 0);
          return PATH.normalize(paths.join('/'));
        },
        join2: (l, r) => {
          return PATH.normalize(l + '/' + r);
        },
      };
      function getRandomDevice() {
        if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
          var randomBuffer = new Uint8Array(1);
          return function () {
            crypto.getRandomValues(randomBuffer);
            return randomBuffer[0];
          };
        } else
          return function () {
            abort('randomDevice');
          };
      }
      var PATH_FS = {
        resolve: function () {
          var resolvedPath = '',
            resolvedAbsolute = false;
          for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path != 'string') {
              throw new TypeError('Arguments to path.resolve must be strings');
            } else if (!path) {
              return '';
            }
            resolvedPath = path + '/' + resolvedPath;
            resolvedAbsolute = PATH.isAbs(path);
          }
          resolvedPath = PATH.normalizeArray(
            resolvedPath.split('/').filter((p) => !!p),
            !resolvedAbsolute
          ).join('/');
          return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
        },
        relative: (from, to) => {
          from = PATH_FS.resolve(from).substr(1);
          to = PATH_FS.resolve(to).substr(1);
          function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
              if (arr[start] !== '') break;
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
              if (arr[end] !== '') break;
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1);
          }
          var fromParts = trim(from.split('/'));
          var toParts = trim(to.split('/'));
          var length = Math.min(fromParts.length, toParts.length);
          var samePartsLength = length;
          for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
              samePartsLength = i;
              break;
            }
          }
          var outputParts = [];
          for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push('..');
          }
          outputParts = outputParts.concat(toParts.slice(samePartsLength));
          return outputParts.join('/');
        },
      };
      var TTY = {
        ttys: [],
        init: function () {},
        shutdown: function () {},
        register: function (dev, ops) {
          TTY.ttys[dev] = { input: [], output: [], ops: ops };
          FS.registerDevice(dev, TTY.stream_ops);
        },
        stream_ops: {
          open: function (stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
              throw new FS.ErrnoError(43);
            }
            stream.tty = tty;
            stream.seekable = false;
          },
          close: function (stream) {
            stream.tty.ops.flush(stream.tty);
          },
          flush: function (stream) {
            stream.tty.ops.flush(stream.tty);
          },
          read: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.get_char) {
              throw new FS.ErrnoError(60);
            }
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = stream.tty.ops.get_char(stream.tty);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset + i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
              throw new FS.ErrnoError(60);
            }
            try {
              for (var i = 0; i < length; i++) {
                stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
              }
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          },
        },
        default_tty_ops: {
          get_char: function (tty) {
            if (!tty.input.length) {
              var result = null;
              if (typeof window != 'undefined' && typeof window.prompt == 'function') {
                result = window.prompt('Input: ');
                if (result !== null) {
                  result += '\n';
                }
              } else if (typeof readline == 'function') {
                result = readline();
                if (result !== null) {
                  result += '\n';
                }
              }
              if (!result) {
                return null;
              }
              tty.input = intArrayFromString(result, true);
            }
            return tty.input.shift();
          },
          put_char: function (tty, val) {
            if (val === null || val === 10) {
              out(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val);
            }
          },
          flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
              out(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          },
        },
        default_tty1_ops: {
          put_char: function (tty, val) {
            if (val === null || val === 10) {
              err(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val);
            }
          },
          flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
              err(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          },
        },
      };
      function zeroMemory(address, size) {
        HEAPU8.fill(0, address, address + size);
      }
      function alignMemory(size, alignment) {
        return Math.ceil(size / alignment) * alignment;
      }
      function mmapAlloc(size) {
        size = alignMemory(size, 65536);
        var ptr = _emscripten_builtin_memalign(65536, size);
        if (!ptr) return 0;
        zeroMemory(ptr, size);
        return ptr;
      }
      var MEMFS = {
        ops_table: null,
        mount: function (mount) {
          return MEMFS.createNode(null, '/', 16384 | 511, 0);
        },
        createNode: function (parent, name, mode, dev) {
          if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            throw new FS.ErrnoError(63);
          }
          if (!MEMFS.ops_table) {
            MEMFS.ops_table = {
              dir: {
                node: {
                  getattr: MEMFS.node_ops.getattr,
                  setattr: MEMFS.node_ops.setattr,
                  lookup: MEMFS.node_ops.lookup,
                  mknod: MEMFS.node_ops.mknod,
                  rename: MEMFS.node_ops.rename,
                  unlink: MEMFS.node_ops.unlink,
                  rmdir: MEMFS.node_ops.rmdir,
                  readdir: MEMFS.node_ops.readdir,
                  symlink: MEMFS.node_ops.symlink,
                },
                stream: { llseek: MEMFS.stream_ops.llseek },
              },
              file: {
                node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
                stream: {
                  llseek: MEMFS.stream_ops.llseek,
                  read: MEMFS.stream_ops.read,
                  write: MEMFS.stream_ops.write,
                  allocate: MEMFS.stream_ops.allocate,
                  mmap: MEMFS.stream_ops.mmap,
                  msync: MEMFS.stream_ops.msync,
                },
              },
              link: {
                node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink },
                stream: {},
              },
              chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops },
            };
          }
          var node = FS.createNode(parent, name, mode, dev);
          if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {};
          } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null;
          } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream;
          } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream;
          }
          node.timestamp = Date.now();
          if (parent) {
            parent.contents[name] = node;
            parent.timestamp = node.timestamp;
          }
          return node;
        },
        getFileDataAsTypedArray: function (node) {
          if (!node.contents) return new Uint8Array(0);
          if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
          return new Uint8Array(node.contents);
        },
        expandFileStorage: function (node, newCapacity) {
          var prevCapacity = node.contents ? node.contents.length : 0;
          if (prevCapacity >= newCapacity) return;
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity);
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
        },
        resizeFileStorage: function (node, newSize) {
          if (node.usedBytes == newSize) return;
          if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0;
          } else {
            var oldContents = node.contents;
            node.contents = new Uint8Array(newSize);
            if (oldContents) {
              node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
            }
            node.usedBytes = newSize;
          }
        },
        node_ops: {
          getattr: function (node) {
            var attr = {};
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
              attr.size = 4096;
            } else if (FS.isFile(node.mode)) {
              attr.size = node.usedBytes;
            } else if (FS.isLink(node.mode)) {
              attr.size = node.link.length;
            } else {
              attr.size = 0;
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr;
          },
          setattr: function (node, attr) {
            if (attr.mode !== undefined) {
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              node.timestamp = attr.timestamp;
            }
            if (attr.size !== undefined) {
              MEMFS.resizeFileStorage(node, attr.size);
            }
          },
          lookup: function (parent, name) {
            throw FS.genericErrors[44];
          },
          mknod: function (parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev);
          },
          rename: function (old_node, new_dir, new_name) {
            if (FS.isDir(old_node.mode)) {
              var new_node;
              try {
                new_node = FS.lookupNode(new_dir, new_name);
              } catch (e) {}
              if (new_node) {
                for (var i in new_node.contents) {
                  throw new FS.ErrnoError(55);
                }
              }
            }
            delete old_node.parent.contents[old_node.name];
            old_node.parent.timestamp = Date.now();
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            new_dir.timestamp = old_node.parent.timestamp;
            old_node.parent = new_dir;
          },
          unlink: function (parent, name) {
            delete parent.contents[name];
            parent.timestamp = Date.now();
          },
          rmdir: function (parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
              throw new FS.ErrnoError(55);
            }
            delete parent.contents[name];
            parent.timestamp = Date.now();
          },
          readdir: function (node) {
            var entries = ['.', '..'];
            for (var key in node.contents) {
              if (!node.contents.hasOwnProperty(key)) {
                continue;
              }
              entries.push(key);
            }
            return entries;
          },
          symlink: function (parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node;
          },
          readlink: function (node) {
            if (!FS.isLink(node.mode)) {
              throw new FS.ErrnoError(28);
            }
            return node.link;
          },
        },
        stream_ops: {
          read: function (stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= stream.node.usedBytes) return 0;
            var size = Math.min(stream.node.usedBytes - position, length);
            if (size > 8 && contents.subarray) {
              buffer.set(contents.subarray(position, position + size), offset);
            } else {
              for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
            }
            return size;
          },
          write: function (stream, buffer, offset, length, position, canOwn) {
            if (buffer.buffer === HEAP8.buffer) {
              canOwn = false;
            }
            if (!length) return 0;
            var node = stream.node;
            node.timestamp = Date.now();
            if (buffer.subarray && (!node.contents || node.contents.subarray)) {
              if (canOwn) {
                node.contents = buffer.subarray(offset, offset + length);
                node.usedBytes = length;
                return length;
              } else if (node.usedBytes === 0 && position === 0) {
                node.contents = buffer.slice(offset, offset + length);
                node.usedBytes = length;
                return length;
              } else if (position + length <= node.usedBytes) {
                node.contents.set(buffer.subarray(offset, offset + length), position);
                return length;
              }
            }
            MEMFS.expandFileStorage(node, position + length);
            if (node.contents.subarray && buffer.subarray) {
              node.contents.set(buffer.subarray(offset, offset + length), position);
            } else {
              for (var i = 0; i < length; i++) {
                node.contents[position + i] = buffer[offset + i];
              }
            }
            node.usedBytes = Math.max(node.usedBytes, position + length);
            return length;
          },
          llseek: function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
              position += stream.position;
            } else if (whence === 2) {
              if (FS.isFile(stream.node.mode)) {
                position += stream.node.usedBytes;
              }
            }
            if (position < 0) {
              throw new FS.ErrnoError(28);
            }
            return position;
          },
          allocate: function (stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
          },
          mmap: function (stream, address, length, position, prot, flags) {
            if (address !== 0) {
              throw new FS.ErrnoError(28);
            }
            if (!FS.isFile(stream.node.mode)) {
              throw new FS.ErrnoError(43);
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            if (!(flags & 2) && contents.buffer === buffer) {
              allocated = false;
              ptr = contents.byteOffset;
            } else {
              if (position > 0 || position + length < contents.length) {
                if (contents.subarray) {
                  contents = contents.subarray(position, position + length);
                } else {
                  contents = Array.prototype.slice.call(contents, position, position + length);
                }
              }
              allocated = true;
              ptr = mmapAlloc(length);
              if (!ptr) {
                throw new FS.ErrnoError(48);
              }
              HEAP8.set(contents, ptr);
            }
            return { ptr: ptr, allocated: allocated };
          },
          msync: function (stream, buffer, offset, length, mmapFlags) {
            if (!FS.isFile(stream.node.mode)) {
              throw new FS.ErrnoError(43);
            }
            if (mmapFlags & 2) {
              return 0;
            }
            var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0;
          },
        },
      };
      function asyncLoad(url, onload, onerror, noRunDep) {
        var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
        readAsync(
          url,
          function (arrayBuffer) {
            assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
            onload(new Uint8Array(arrayBuffer));
            if (dep) removeRunDependency(dep);
          },
          function (event) {
            if (onerror) {
              onerror();
            } else {
              throw 'Loading data file "' + url + '" failed.';
            }
          }
        );
        if (dep) addRunDependency(dep);
      }
      var FS = {
        root: null,
        mounts: [],
        devices: {},
        streams: [],
        nextInode: 1,
        nameTable: null,
        currentPath: '/',
        initialized: false,
        ignorePermissions: true,
        ErrnoError: null,
        genericErrors: {},
        filesystems: null,
        syncFSRequests: 0,
        lookupPath: (path, opts = {}) => {
          path = PATH_FS.resolve(FS.cwd(), path);
          if (!path) return { path: '', node: null };
          var defaults = { follow_mount: true, recurse_count: 0 };
          opts = Object.assign(defaults, opts);
          if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(32);
          }
          var parts = PATH.normalizeArray(
            path.split('/').filter((p) => !!p),
            false
          );
          var current = FS.root;
          var current_path = '/';
          for (var i = 0; i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
              break;
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
              if (!islast || (islast && opts.follow_mount)) {
                current = current.mounted.root;
              }
            }
            if (!islast || opts.follow) {
              var count = 0;
              while (FS.isLink(current.mode)) {
                var link = FS.readlink(current_path);
                current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
                current = lookup.node;
                if (count++ > 40) {
                  throw new FS.ErrnoError(32);
                }
              }
            }
          }
          return { path: current_path, node: current };
        },
        getPath: (node) => {
          var path;
          while (true) {
            if (FS.isRoot(node)) {
              var mount = node.mount.mountpoint;
              if (!path) return mount;
              return mount[mount.length - 1] !== '/' ? mount + '/' + path : mount + path;
            }
            path = path ? node.name + '/' + path : node.name;
            node = node.parent;
          }
        },
        hashName: (parentid, name) => {
          var hash = 0;
          for (var i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
          }
          return ((parentid + hash) >>> 0) % FS.nameTable.length;
        },
        hashAddNode: (node) => {
          var hash = FS.hashName(node.parent.id, node.name);
          node.name_next = FS.nameTable[hash];
          FS.nameTable[hash] = node;
        },
        hashRemoveNode: (node) => {
          var hash = FS.hashName(node.parent.id, node.name);
          if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next;
          } else {
            var current = FS.nameTable[hash];
            while (current) {
              if (current.name_next === node) {
                current.name_next = node.name_next;
                break;
              }
              current = current.name_next;
            }
          }
        },
        lookupNode: (parent, name) => {
          var errCode = FS.mayLookup(parent);
          if (errCode) {
            throw new FS.ErrnoError(errCode, parent);
          }
          var hash = FS.hashName(parent.id, name);
          for (var node = FS.nameTable[hash]; node; node = node.name_next) {
            var nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
              return node;
            }
          }
          return FS.lookup(parent, name);
        },
        createNode: (parent, name, mode, rdev) => {
          var node = new FS.FSNode(parent, name, mode, rdev);
          FS.hashAddNode(node);
          return node;
        },
        destroyNode: (node) => {
          FS.hashRemoveNode(node);
        },
        isRoot: (node) => {
          return node === node.parent;
        },
        isMountpoint: (node) => {
          return !!node.mounted;
        },
        isFile: (mode) => {
          return (mode & 61440) === 32768;
        },
        isDir: (mode) => {
          return (mode & 61440) === 16384;
        },
        isLink: (mode) => {
          return (mode & 61440) === 40960;
        },
        isChrdev: (mode) => {
          return (mode & 61440) === 8192;
        },
        isBlkdev: (mode) => {
          return (mode & 61440) === 24576;
        },
        isFIFO: (mode) => {
          return (mode & 61440) === 4096;
        },
        isSocket: (mode) => {
          return (mode & 49152) === 49152;
        },
        flagModes: { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 },
        modeStringToFlags: (str) => {
          var flags = FS.flagModes[str];
          if (typeof flags == 'undefined') {
            throw new Error('Unknown file open mode: ' + str);
          }
          return flags;
        },
        flagsToPermissionString: (flag) => {
          var perms = ['r', 'w', 'rw'][flag & 3];
          if (flag & 512) {
            perms += 'w';
          }
          return perms;
        },
        nodePermissions: (node, perms) => {
          if (FS.ignorePermissions) {
            return 0;
          }
          if (perms.includes('r') && !(node.mode & 292)) {
            return 2;
          } else if (perms.includes('w') && !(node.mode & 146)) {
            return 2;
          } else if (perms.includes('x') && !(node.mode & 73)) {
            return 2;
          }
          return 0;
        },
        mayLookup: (dir) => {
          var errCode = FS.nodePermissions(dir, 'x');
          if (errCode) return errCode;
          if (!dir.node_ops.lookup) return 2;
          return 0;
        },
        mayCreate: (dir, name) => {
          try {
            var node = FS.lookupNode(dir, name);
            return 20;
          } catch (e) {}
          return FS.nodePermissions(dir, 'wx');
        },
        mayDelete: (dir, name, isdir) => {
          var node;
          try {
            node = FS.lookupNode(dir, name);
          } catch (e) {
            return e.errno;
          }
          var errCode = FS.nodePermissions(dir, 'wx');
          if (errCode) {
            return errCode;
          }
          if (isdir) {
            if (!FS.isDir(node.mode)) {
              return 54;
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
              return 10;
            }
          } else {
            if (FS.isDir(node.mode)) {
              return 31;
            }
          }
          return 0;
        },
        mayOpen: (node, flags) => {
          if (!node) {
            return 44;
          }
          if (FS.isLink(node.mode)) {
            return 32;
          } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== 'r' || flags & 512) {
              return 31;
            }
          }
          return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
        },
        MAX_OPEN_FDS: 4096,
        nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
          for (var fd = fd_start; fd <= fd_end; fd++) {
            if (!FS.streams[fd]) {
              return fd;
            }
          }
          throw new FS.ErrnoError(33);
        },
        getStream: (fd) => FS.streams[fd],
        createStream: (stream, fd_start, fd_end) => {
          if (!FS.FSStream) {
            FS.FSStream = function () {
              this.shared = {};
            };
            FS.FSStream.prototype = {
              object: {
                get: function () {
                  return this.node;
                },
                set: function (val) {
                  this.node = val;
                },
              },
              isRead: {
                get: function () {
                  return (this.flags & 2097155) !== 1;
                },
              },
              isWrite: {
                get: function () {
                  return (this.flags & 2097155) !== 0;
                },
              },
              isAppend: {
                get: function () {
                  return this.flags & 1024;
                },
              },
              flags: {
                get: function () {
                  return this.shared.flags;
                },
                set: function (val) {
                  this.shared.flags = val;
                },
              },
              position: {
                get function() {
                  return this.shared.position;
                },
                set: function (val) {
                  this.shared.position = val;
                },
              },
            };
          }
          stream = Object.assign(new FS.FSStream(), stream);
          var fd = FS.nextfd(fd_start, fd_end);
          stream.fd = fd;
          FS.streams[fd] = stream;
          return stream;
        },
        closeStream: (fd) => {
          FS.streams[fd] = null;
        },
        chrdev_stream_ops: {
          open: (stream) => {
            var device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
              stream.stream_ops.open(stream);
            }
          },
          llseek: () => {
            throw new FS.ErrnoError(70);
          },
        },
        major: (dev) => dev >> 8,
        minor: (dev) => dev & 255,
        makedev: (ma, mi) => (ma << 8) | mi,
        registerDevice: (dev, ops) => {
          FS.devices[dev] = { stream_ops: ops };
        },
        getDevice: (dev) => FS.devices[dev],
        getMounts: (mount) => {
          var mounts = [];
          var check = [mount];
          while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts);
          }
          return mounts;
        },
        syncfs: (populate, callback) => {
          if (typeof populate == 'function') {
            callback = populate;
            populate = false;
          }
          FS.syncFSRequests++;
          if (FS.syncFSRequests > 1) {
            err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
          }
          var mounts = FS.getMounts(FS.root.mount);
          var completed = 0;
          function doCallback(errCode) {
            FS.syncFSRequests--;
            return callback(errCode);
          }
          function done(errCode) {
            if (errCode) {
              if (!done.errored) {
                done.errored = true;
                return doCallback(errCode);
              }
              return;
            }
            if (++completed >= mounts.length) {
              doCallback(null);
            }
          }
          mounts.forEach((mount) => {
            if (!mount.type.syncfs) {
              return done(null);
            }
            mount.type.syncfs(mount, populate, done);
          });
        },
        mount: (type, opts, mountpoint) => {
          var root = mountpoint === '/';
          var pseudo = !mountpoint;
          var node;
          if (root && FS.root) {
            throw new FS.ErrnoError(10);
          } else if (!root && !pseudo) {
            var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
              throw new FS.ErrnoError(10);
            }
            if (!FS.isDir(node.mode)) {
              throw new FS.ErrnoError(54);
            }
          }
          var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] };
          var mountRoot = type.mount(mount);
          mountRoot.mount = mount;
          mount.root = mountRoot;
          if (root) {
            FS.root = mountRoot;
          } else if (node) {
            node.mounted = mount;
            if (node.mount) {
              node.mount.mounts.push(mount);
            }
          }
          return mountRoot;
        },
        unmount: (mountpoint) => {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
          if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(28);
          }
          var node = lookup.node;
          var mount = node.mounted;
          var mounts = FS.getMounts(mount);
          Object.keys(FS.nameTable).forEach((hash) => {
            var current = FS.nameTable[hash];
            while (current) {
              var next = current.name_next;
              if (mounts.includes(current.mount)) {
                FS.destroyNode(current);
              }
              current = next;
            }
          });
          node.mounted = null;
          var idx = node.mount.mounts.indexOf(mount);
          node.mount.mounts.splice(idx, 1);
        },
        lookup: (parent, name) => {
          return parent.node_ops.lookup(parent, name);
        },
        mknod: (path, mode, dev) => {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          var name = PATH.basename(path);
          if (!name || name === '.' || name === '..') {
            throw new FS.ErrnoError(28);
          }
          var errCode = FS.mayCreate(parent, name);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(63);
          }
          return parent.node_ops.mknod(parent, name, mode, dev);
        },
        create: (path, mode) => {
          mode = mode !== undefined ? mode : 438;
          mode &= 4095;
          mode |= 32768;
          return FS.mknod(path, mode, 0);
        },
        mkdir: (path, mode) => {
          mode = mode !== undefined ? mode : 511;
          mode &= 511 | 512;
          mode |= 16384;
          return FS.mknod(path, mode, 0);
        },
        mkdirTree: (path, mode) => {
          var dirs = path.split('/');
          var d = '';
          for (var i = 0; i < dirs.length; ++i) {
            if (!dirs[i]) continue;
            d += '/' + dirs[i];
            try {
              FS.mkdir(d, mode);
            } catch (e) {
              if (e.errno != 20) throw e;
            }
          }
        },
        mkdev: (path, mode, dev) => {
          if (typeof dev == 'undefined') {
            dev = mode;
            mode = 438;
          }
          mode |= 8192;
          return FS.mknod(path, mode, dev);
        },
        symlink: (oldpath, newpath) => {
          if (!PATH_FS.resolve(oldpath)) {
            throw new FS.ErrnoError(44);
          }
          var lookup = FS.lookupPath(newpath, { parent: true });
          var parent = lookup.node;
          if (!parent) {
            throw new FS.ErrnoError(44);
          }
          var newname = PATH.basename(newpath);
          var errCode = FS.mayCreate(parent, newname);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(63);
          }
          return parent.node_ops.symlink(parent, newname, oldpath);
        },
        rename: (old_path, new_path) => {
          var old_dirname = PATH.dirname(old_path);
          var new_dirname = PATH.dirname(new_path);
          var old_name = PATH.basename(old_path);
          var new_name = PATH.basename(new_path);
          var lookup, old_dir, new_dir;
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
          if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
          if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(75);
          }
          var old_node = FS.lookupNode(old_dir, old_name);
          var relative = PATH_FS.relative(old_path, new_dirname);
          if (relative.charAt(0) !== '.') {
            throw new FS.ErrnoError(28);
          }
          relative = PATH_FS.relative(new_path, old_dirname);
          if (relative.charAt(0) !== '.') {
            throw new FS.ErrnoError(55);
          }
          var new_node;
          try {
            new_node = FS.lookupNode(new_dir, new_name);
          } catch (e) {}
          if (old_node === new_node) {
            return;
          }
          var isdir = FS.isDir(old_node.mode);
          var errCode = FS.mayDelete(old_dir, old_name, isdir);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
            throw new FS.ErrnoError(10);
          }
          if (new_dir !== old_dir) {
            errCode = FS.nodePermissions(old_dir, 'w');
            if (errCode) {
              throw new FS.ErrnoError(errCode);
            }
          }
          FS.hashRemoveNode(old_node);
          try {
            old_dir.node_ops.rename(old_node, new_dir, new_name);
          } catch (e) {
            throw e;
          } finally {
            FS.hashAddNode(old_node);
          }
        },
        rmdir: (path) => {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          var name = PATH.basename(path);
          var node = FS.lookupNode(parent, name);
          var errCode = FS.mayDelete(parent, name, true);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
          parent.node_ops.rmdir(parent, name);
          FS.destroyNode(node);
        },
        readdir: (path) => {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(54);
          }
          return node.node_ops.readdir(node);
        },
        unlink: (path) => {
          var lookup = FS.lookupPath(path, { parent: true });
          var parent = lookup.node;
          if (!parent) {
            throw new FS.ErrnoError(44);
          }
          var name = PATH.basename(path);
          var node = FS.lookupNode(parent, name);
          var errCode = FS.mayDelete(parent, name, false);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
          parent.node_ops.unlink(parent, name);
          FS.destroyNode(node);
        },
        readlink: (path) => {
          var lookup = FS.lookupPath(path);
          var link = lookup.node;
          if (!link) {
            throw new FS.ErrnoError(44);
          }
          if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(28);
          }
          return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
        },
        stat: (path, dontFollow) => {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          var node = lookup.node;
          if (!node) {
            throw new FS.ErrnoError(44);
          }
          if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(63);
          }
          return node.node_ops.getattr(node);
        },
        lstat: (path) => {
          return FS.stat(path, true);
        },
        chmod: (path, mode, dontFollow) => {
          var node;
          if (typeof path == 'string') {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
          }
          node.node_ops.setattr(node, { mode: (mode & 4095) | (node.mode & ~4095), timestamp: Date.now() });
        },
        lchmod: (path, mode) => {
          FS.chmod(path, mode, true);
        },
        fchmod: (fd, mode) => {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(8);
          }
          FS.chmod(stream.node, mode);
        },
        chown: (path, uid, gid, dontFollow) => {
          var node;
          if (typeof path == 'string') {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
          }
          node.node_ops.setattr(node, { timestamp: Date.now() });
        },
        lchown: (path, uid, gid) => {
          FS.chown(path, uid, gid, true);
        },
        fchown: (fd, uid, gid) => {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(8);
          }
          FS.chown(stream.node, uid, gid);
        },
        truncate: (path, len) => {
          if (len < 0) {
            throw new FS.ErrnoError(28);
          }
          var node;
          if (typeof path == 'string') {
            var lookup = FS.lookupPath(path, { follow: true });
            node = lookup.node;
          } else {
            node = path;
          }
          if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
          }
          if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(31);
          }
          if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          var errCode = FS.nodePermissions(node, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
        },
        ftruncate: (fd, len) => {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(8);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(28);
          }
          FS.truncate(stream.node, len);
        },
        utime: (path, atime, mtime) => {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
        },
        open: (path, flags, mode) => {
          if (path === '') {
            throw new FS.ErrnoError(44);
          }
          flags = typeof flags == 'string' ? FS.modeStringToFlags(flags) : flags;
          mode = typeof mode == 'undefined' ? 438 : mode;
          if (flags & 64) {
            mode = (mode & 4095) | 32768;
          } else {
            mode = 0;
          }
          var node;
          if (typeof path == 'object') {
            node = path;
          } else {
            path = PATH.normalize(path);
            try {
              var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
              node = lookup.node;
            } catch (e) {}
          }
          var created = false;
          if (flags & 64) {
            if (node) {
              if (flags & 128) {
                throw new FS.ErrnoError(20);
              }
            } else {
              node = FS.mknod(path, mode, 0);
              created = true;
            }
          }
          if (!node) {
            throw new FS.ErrnoError(44);
          }
          if (FS.isChrdev(node.mode)) {
            flags &= ~512;
          }
          if (flags & 65536 && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
          if (!created) {
            var errCode = FS.mayOpen(node, flags);
            if (errCode) {
              throw new FS.ErrnoError(errCode);
            }
          }
          if (flags & 512 && !created) {
            FS.truncate(node, 0);
          }
          flags &= ~(128 | 512 | 131072);
          var stream = FS.createStream({
            node: node,
            path: FS.getPath(node),
            flags: flags,
            seekable: true,
            position: 0,
            stream_ops: node.stream_ops,
            ungotten: [],
            error: false,
          });
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
          if (Module['logReadFiles'] && !(flags & 1)) {
            if (!FS.readFiles) FS.readFiles = {};
            if (!(path in FS.readFiles)) {
              FS.readFiles[path] = 1;
            }
          }
          return stream;
        },
        close: (stream) => {
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if (stream.getdents) stream.getdents = null;
          try {
            if (stream.stream_ops.close) {
              stream.stream_ops.close(stream);
            }
          } catch (e) {
            throw e;
          } finally {
            FS.closeStream(stream.fd);
          }
          stream.fd = null;
        },
        isClosed: (stream) => {
          return stream.fd === null;
        },
        llseek: (stream, offset, whence) => {
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(70);
          }
          if (whence != 0 && whence != 1 && whence != 2) {
            throw new FS.ErrnoError(28);
          }
          stream.position = stream.stream_ops.llseek(stream, offset, whence);
          stream.ungotten = [];
          return stream.position;
        },
        read: (stream, buffer, offset, length, position) => {
          if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
          }
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(8);
          }
          if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
          }
          if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(28);
          }
          var seeking = typeof position != 'undefined';
          if (!seeking) {
            position = stream.position;
          } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
          }
          var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
          if (!seeking) stream.position += bytesRead;
          return bytesRead;
        },
        write: (stream, buffer, offset, length, position, canOwn) => {
          if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
          }
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
          }
          if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
          }
          if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(28);
          }
          if (stream.seekable && stream.flags & 1024) {
            FS.llseek(stream, 0, 2);
          }
          var seeking = typeof position != 'undefined';
          if (!seeking) {
            position = stream.position;
          } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
          }
          var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
          if (!seeking) stream.position += bytesWritten;
          return bytesWritten;
        },
        allocate: (stream, offset, length) => {
          if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
          }
          if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(28);
          }
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
          }
          if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(138);
          }
          stream.stream_ops.allocate(stream, offset, length);
        },
        mmap: (stream, address, length, position, prot, flags) => {
          if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
            throw new FS.ErrnoError(2);
          }
          if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(2);
          }
          if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(43);
          }
          return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
        },
        msync: (stream, buffer, offset, length, mmapFlags) => {
          if (!stream || !stream.stream_ops.msync) {
            return 0;
          }
          return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
        },
        munmap: (stream) => 0,
        ioctl: (stream, cmd, arg) => {
          if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(59);
          }
          return stream.stream_ops.ioctl(stream, cmd, arg);
        },
        readFile: (path, opts = {}) => {
          opts.flags = opts.flags || 0;
          opts.encoding = opts.encoding || 'binary';
          if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
            throw new Error('Invalid encoding type "' + opts.encoding + '"');
          }
          var ret;
          var stream = FS.open(path, opts.flags);
          var stat = FS.stat(path);
          var length = stat.size;
          var buf = new Uint8Array(length);
          FS.read(stream, buf, 0, length, 0);
          if (opts.encoding === 'utf8') {
            ret = UTF8ArrayToString(buf, 0);
          } else if (opts.encoding === 'binary') {
            ret = buf;
          }
          FS.close(stream);
          return ret;
        },
        writeFile: (path, data, opts = {}) => {
          opts.flags = opts.flags || 577;
          var stream = FS.open(path, opts.flags, opts.mode);
          if (typeof data == 'string') {
            var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
          } else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
          } else {
            throw new Error('Unsupported data type');
          }
          FS.close(stream);
        },
        cwd: () => FS.currentPath,
        chdir: (path) => {
          var lookup = FS.lookupPath(path, { follow: true });
          if (lookup.node === null) {
            throw new FS.ErrnoError(44);
          }
          if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(54);
          }
          var errCode = FS.nodePermissions(lookup.node, 'x');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
          FS.currentPath = lookup.path;
        },
        createDefaultDirectories: () => {
          FS.mkdir('/tmp');
          FS.mkdir('/home');
          FS.mkdir('/home/web_user');
        },
        createDefaultDevices: () => {
          FS.mkdir('/dev');
          FS.registerDevice(FS.makedev(1, 3), { read: () => 0, write: (stream, buffer, offset, length, pos) => length });
          FS.mkdev('/dev/null', FS.makedev(1, 3));
          TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
          TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
          FS.mkdev('/dev/tty', FS.makedev(5, 0));
          FS.mkdev('/dev/tty1', FS.makedev(6, 0));
          var random_device = getRandomDevice();
          FS.createDevice('/dev', 'random', random_device);
          FS.createDevice('/dev', 'urandom', random_device);
          FS.mkdir('/dev/shm');
          FS.mkdir('/dev/shm/tmp');
        },
        createSpecialDirectories: () => {
          FS.mkdir('/proc');
          var proc_self = FS.mkdir('/proc/self');
          FS.mkdir('/proc/self/fd');
          FS.mount(
            {
              mount: () => {
                var node = FS.createNode(proc_self, 'fd', 16384 | 511, 73);
                node.node_ops = {
                  lookup: (parent, name) => {
                    var fd = +name;
                    var stream = FS.getStream(fd);
                    if (!stream) throw new FS.ErrnoError(8);
                    var ret = { parent: null, mount: { mountpoint: 'fake' }, node_ops: { readlink: () => stream.path } };
                    ret.parent = ret;
                    return ret;
                  },
                };
                return node;
              },
            },
            {},
            '/proc/self/fd'
          );
        },
        createStandardStreams: () => {
          if (Module['stdin']) {
            FS.createDevice('/dev', 'stdin', Module['stdin']);
          } else {
            FS.symlink('/dev/tty', '/dev/stdin');
          }
          if (Module['stdout']) {
            FS.createDevice('/dev', 'stdout', null, Module['stdout']);
          } else {
            FS.symlink('/dev/tty', '/dev/stdout');
          }
          if (Module['stderr']) {
            FS.createDevice('/dev', 'stderr', null, Module['stderr']);
          } else {
            FS.symlink('/dev/tty1', '/dev/stderr');
          }
          var stdin = FS.open('/dev/stdin', 0);
          var stdout = FS.open('/dev/stdout', 1);
          var stderr = FS.open('/dev/stderr', 1);
        },
        ensureErrnoError: () => {
          if (FS.ErrnoError) return;
          FS.ErrnoError = function ErrnoError(errno, node) {
            this.node = node;
            this.setErrno = function (errno) {
              this.errno = errno;
            };
            this.setErrno(errno);
            this.message = 'FS error';
          };
          FS.ErrnoError.prototype = new Error();
          FS.ErrnoError.prototype.constructor = FS.ErrnoError;
          [44].forEach((code) => {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = '<generic error, no stack>';
          });
        },
        staticInit: () => {
          FS.ensureErrnoError();
          FS.nameTable = new Array(4096);
          FS.mount(MEMFS, {}, '/');
          FS.createDefaultDirectories();
          FS.createDefaultDevices();
          FS.createSpecialDirectories();
          FS.filesystems = { MEMFS: MEMFS };
        },
        init: (input, output, error) => {
          FS.init.initialized = true;
          FS.ensureErrnoError();
          Module['stdin'] = input || Module['stdin'];
          Module['stdout'] = output || Module['stdout'];
          Module['stderr'] = error || Module['stderr'];
          FS.createStandardStreams();
        },
        quit: () => {
          FS.init.initialized = false;
          ___stdio_exit();
          for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
              continue;
            }
            FS.close(stream);
          }
        },
        getMode: (canRead, canWrite) => {
          var mode = 0;
          if (canRead) mode |= 292 | 73;
          if (canWrite) mode |= 146;
          return mode;
        },
        findObject: (path, dontResolveLastLink) => {
          var ret = FS.analyzePath(path, dontResolveLastLink);
          if (ret.exists) {
            return ret.object;
          } else {
            return null;
          }
        },
        analyzePath: (path, dontResolveLastLink) => {
          try {
            var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            path = lookup.path;
          } catch (e) {}
          var ret = {
            isRoot: false,
            exists: false,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: false,
            parentPath: null,
            parentObject: null,
          };
          try {
            var lookup = FS.lookupPath(path, { parent: true });
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === '/';
          } catch (e) {
            ret.error = e.errno;
          }
          return ret;
        },
        createPath: (parent, path, canRead, canWrite) => {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          var parts = path.split('/').reverse();
          while (parts.length) {
            var part = parts.pop();
            if (!part) continue;
            var current = PATH.join2(parent, part);
            try {
              FS.mkdir(current);
            } catch (e) {}
            parent = current;
          }
          return current;
        },
        createFile: (parent, name, properties, canRead, canWrite) => {
          var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(canRead, canWrite);
          return FS.create(path, mode);
        },
        createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
          var path = name;
          if (parent) {
            parent = typeof parent == 'string' ? parent : FS.getPath(parent);
            path = name ? PATH.join2(parent, name) : parent;
          }
          var mode = FS.getMode(canRead, canWrite);
          var node = FS.create(path, mode);
          if (data) {
            if (typeof data == 'string') {
              var arr = new Array(data.length);
              for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
              data = arr;
            }
            FS.chmod(node, mode | 146);
            var stream = FS.open(node, 577);
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode);
          }
          return node;
        },
        createDevice: (parent, name, input, output) => {
          var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(!!input, !!output);
          if (!FS.createDevice.major) FS.createDevice.major = 64;
          var dev = FS.makedev(FS.createDevice.major++, 0);
          FS.registerDevice(dev, {
            open: (stream) => {
              stream.seekable = false;
            },
            close: (stream) => {
              if (output && output.buffer && output.buffer.length) {
                output(10);
              }
            },
            read: (stream, buffer, offset, length, pos) => {
              var bytesRead = 0;
              for (var i = 0; i < length; i++) {
                var result;
                try {
                  result = input();
                } catch (e) {
                  throw new FS.ErrnoError(29);
                }
                if (result === undefined && bytesRead === 0) {
                  throw new FS.ErrnoError(6);
                }
                if (result === null || result === undefined) break;
                bytesRead++;
                buffer[offset + i] = result;
              }
              if (bytesRead) {
                stream.node.timestamp = Date.now();
              }
              return bytesRead;
            },
            write: (stream, buffer, offset, length, pos) => {
              for (var i = 0; i < length; i++) {
                try {
                  output(buffer[offset + i]);
                } catch (e) {
                  throw new FS.ErrnoError(29);
                }
              }
              if (length) {
                stream.node.timestamp = Date.now();
              }
              return i;
            },
          });
          return FS.mkdev(path, mode, dev);
        },
        forceLoadFile: (obj) => {
          if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
          if (typeof XMLHttpRequest != 'undefined') {
            throw new Error(
              'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
            );
          } else if (read_) {
            try {
              obj.contents = intArrayFromString(read_(obj.url), true);
              obj.usedBytes = obj.contents.length;
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
          } else {
            throw new Error('Cannot load without read() or XMLHttpRequest.');
          }
        },
        createLazyFile: (parent, name, url, canRead, canWrite) => {
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = [];
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length - 1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = (idx / this.chunkSize) | 0;
            return this.getter(chunkNum)[chunkOffset];
          };
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          };
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
              throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
            var datalength = Number(xhr.getResponseHeader('Content-length'));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader('Accept-Ranges')) && header === 'bytes';
            var usesGzip = (header = xhr.getResponseHeader('Content-Encoding')) && header === 'gzip';
            var chunkSize = 1024 * 1024;
            if (!hasByteServing) chunkSize = datalength;
            var doXHR = (from, to) => {
              if (from > to) throw new Error('invalid range (' + from + ', ' + to + ') or no bytes requested!');
              if (to > datalength - 1) throw new Error('only ' + datalength + ' bytes available! programmer error!');
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to);
              xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
              xhr.send(null);
              if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
                throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            };
            var lazyArray = this;
            lazyArray.setDataGetter((chunkNum) => {
              var start = chunkNum * chunkSize;
              var end = (chunkNum + 1) * chunkSize - 1;
              end = Math.min(end, datalength - 1);
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
              return lazyArray.chunks[chunkNum];
            });
            if (usesGzip || !datalength) {
              chunkSize = datalength = 1;
              datalength = this.getter(0).length;
              chunkSize = datalength;
              out('LazyFiles on gzip forces download of the whole file when length is accessed');
            }
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
          };
          if (typeof XMLHttpRequest != 'undefined') {
            if (!ENVIRONMENT_IS_WORKER)
              throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
            var lazyArray = new LazyUint8Array();
            Object.defineProperties(lazyArray, {
              length: {
                get: function () {
                  if (!this.lengthKnown) {
                    this.cacheLength();
                  }
                  return this._length;
                },
              },
              chunkSize: {
                get: function () {
                  if (!this.lengthKnown) {
                    this.cacheLength();
                  }
                  return this._chunkSize;
                },
              },
            });
            var properties = { isDevice: false, contents: lazyArray };
          } else {
            var properties = { isDevice: false, url: url };
          }
          var node = FS.createFile(parent, name, properties, canRead, canWrite);
          if (properties.contents) {
            node.contents = properties.contents;
          } else if (properties.url) {
            node.contents = null;
            node.url = properties.url;
          }
          Object.defineProperties(node, {
            usedBytes: {
              get: function () {
                return this.contents.length;
              },
            },
          });
          var stream_ops = {};
          var keys = Object.keys(node.stream_ops);
          keys.forEach((key) => {
            var fn = node.stream_ops[key];
            stream_ops[key] = function forceLoadLazyFile() {
              FS.forceLoadFile(node);
              return fn.apply(null, arguments);
            };
          });
          stream_ops.read = (stream, buffer, offset, length, position) => {
            FS.forceLoadFile(node);
            var contents = stream.node.contents;
            if (position >= contents.length) return 0;
            var size = Math.min(contents.length - position, length);
            if (contents.slice) {
              for (var i = 0; i < size; i++) {
                buffer[offset + i] = contents[position + i];
              }
            } else {
              for (var i = 0; i < size; i++) {
                buffer[offset + i] = contents.get(position + i);
              }
            }
            return size;
          };
          node.stream_ops = stream_ops;
          return node;
        },
        createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
          var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
          var dep = getUniqueRunDependency('cp ' + fullname);
          function processData(byteArray) {
            function finish(byteArray) {
              if (preFinish) preFinish();
              if (!dontCreateFile) {
                FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
              }
              if (onload) onload();
              removeRunDependency(dep);
            }
            if (
              Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
                if (onerror) onerror();
                removeRunDependency(dep);
              })
            ) {
              return;
            }
            finish(byteArray);
          }
          addRunDependency(dep);
          if (typeof url == 'string') {
            asyncLoad(url, (byteArray) => processData(byteArray), onerror);
          } else {
            processData(url);
          }
        },
        indexedDB: () => {
          return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        },
        DB_NAME: () => {
          return 'EM_FS_' + window.location.pathname;
        },
        DB_VERSION: 20,
        DB_STORE_NAME: 'FILE_DATA',
        saveFilesToDB: (paths, onload, onerror) => {
          onload = onload || (() => {});
          onerror = onerror || (() => {});
          var indexedDB = FS.indexedDB();
          try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
          } catch (e) {
            return onerror(e);
          }
          openRequest.onupgradeneeded = () => {
            out('creating db');
            var db = openRequest.result;
            db.createObjectStore(FS.DB_STORE_NAME);
          };
          openRequest.onsuccess = () => {
            var db = openRequest.result;
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
              fail = 0,
              total = paths.length;
            function finish() {
              if (fail == 0) onload();
              else onerror();
            }
            paths.forEach((path) => {
              var putRequest = files.put(FS.analyzePath(path).object.contents, path);
              putRequest.onsuccess = () => {
                ok++;
                if (ok + fail == total) finish();
              };
              putRequest.onerror = () => {
                fail++;
                if (ok + fail == total) finish();
              };
            });
            transaction.onerror = onerror;
          };
          openRequest.onerror = onerror;
        },
        loadFilesFromDB: (paths, onload, onerror) => {
          onload = onload || (() => {});
          onerror = onerror || (() => {});
          var indexedDB = FS.indexedDB();
          try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
          } catch (e) {
            return onerror(e);
          }
          openRequest.onupgradeneeded = onerror;
          openRequest.onsuccess = () => {
            var db = openRequest.result;
            try {
              var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
            } catch (e) {
              onerror(e);
              return;
            }
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
              fail = 0,
              total = paths.length;
            function finish() {
              if (fail == 0) onload();
              else onerror();
            }
            paths.forEach((path) => {
              var getRequest = files.get(path);
              getRequest.onsuccess = () => {
                if (FS.analyzePath(path).exists) {
                  FS.unlink(path);
                }
                FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                ok++;
                if (ok + fail == total) finish();
              };
              getRequest.onerror = () => {
                fail++;
                if (ok + fail == total) finish();
              };
            });
            transaction.onerror = onerror;
          };
          openRequest.onerror = onerror;
        },
      };
      var SYSCALLS = {
        DEFAULT_POLLMASK: 5,
        calculateAt: function (dirfd, path, allowEmpty) {
          if (PATH.isAbs(path)) {
            return path;
          }
          var dir;
          if (dirfd === -100) {
            dir = FS.cwd();
          } else {
            var dirstream = FS.getStream(dirfd);
            if (!dirstream) throw new FS.ErrnoError(8);
            dir = dirstream.path;
          }
          if (path.length == 0) {
            if (!allowEmpty) {
              throw new FS.ErrnoError(44);
            }
            return dir;
          }
          return PATH.join2(dir, path);
        },
        doStat: function (func, path, buf) {
          try {
            var stat = func(path);
          } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
              return -54;
            }
            throw e;
          }
          HEAP32[buf >> 2] = stat.dev;
          HEAP32[(buf + 4) >> 2] = 0;
          HEAP32[(buf + 8) >> 2] = stat.ino;
          HEAP32[(buf + 12) >> 2] = stat.mode;
          HEAP32[(buf + 16) >> 2] = stat.nlink;
          HEAP32[(buf + 20) >> 2] = stat.uid;
          HEAP32[(buf + 24) >> 2] = stat.gid;
          HEAP32[(buf + 28) >> 2] = stat.rdev;
          HEAP32[(buf + 32) >> 2] = 0;
          (tempI64 = [
            stat.size >>> 0,
            ((tempDouble = stat.size),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 40) >> 2] = tempI64[0]),
            (HEAP32[(buf + 44) >> 2] = tempI64[1]);
          HEAP32[(buf + 48) >> 2] = 4096;
          HEAP32[(buf + 52) >> 2] = stat.blocks;
          HEAP32[(buf + 56) >> 2] = (stat.atime.getTime() / 1e3) | 0;
          HEAP32[(buf + 60) >> 2] = 0;
          HEAP32[(buf + 64) >> 2] = (stat.mtime.getTime() / 1e3) | 0;
          HEAP32[(buf + 68) >> 2] = 0;
          HEAP32[(buf + 72) >> 2] = (stat.ctime.getTime() / 1e3) | 0;
          HEAP32[(buf + 76) >> 2] = 0;
          (tempI64 = [
            stat.ino >>> 0,
            ((tempDouble = stat.ino),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 80) >> 2] = tempI64[0]),
            (HEAP32[(buf + 84) >> 2] = tempI64[1]);
          return 0;
        },
        doMsync: function (addr, stream, len, flags, offset) {
          var buffer = HEAPU8.slice(addr, addr + len);
          FS.msync(stream, buffer, offset, len, flags);
        },
        varargs: undefined,
        get: function () {
          SYSCALLS.varargs += 4;
          var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
          return ret;
        },
        getStr: function (ptr) {
          var ret = UTF8ToString(ptr);
          return ret;
        },
        getStreamFromFD: function (fd) {
          var stream = FS.getStream(fd);
          if (!stream) throw new FS.ErrnoError(8);
          return stream;
        },
      };
      function ___syscall_fstat64(fd, buf) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          return SYSCALLS.doStat(FS.stat, stream.path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_ftruncate64(fd, length_low, length_high) {
        try {
          var length = length_high * 4294967296 + (length_low >>> 0);
          FS.ftruncate(fd, length);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_lstat64(path, buf) {
        try {
          path = SYSCALLS.getStr(path);
          return SYSCALLS.doStat(FS.lstat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_newfstatat(dirfd, path, buf, flags) {
        try {
          path = SYSCALLS.getStr(path);
          var nofollow = flags & 256;
          var allowEmpty = flags & 4096;
          flags = flags & ~4352;
          path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
          return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_openat(dirfd, path, flags, varargs) {
        SYSCALLS.varargs = varargs;
        try {
          path = SYSCALLS.getStr(path);
          path = SYSCALLS.calculateAt(dirfd, path);
          var mode = varargs ? SYSCALLS.get() : 0;
          return FS.open(path, flags, mode).fd;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
        try {
          oldpath = SYSCALLS.getStr(oldpath);
          newpath = SYSCALLS.getStr(newpath);
          oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
          newpath = SYSCALLS.calculateAt(newdirfd, newpath);
          FS.rename(oldpath, newpath);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_stat64(path, buf) {
        try {
          path = SYSCALLS.getStr(path);
          return SYSCALLS.doStat(FS.stat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function ___syscall_unlinkat(dirfd, path, flags) {
        try {
          path = SYSCALLS.getStr(path);
          path = SYSCALLS.calculateAt(dirfd, path);
          if (flags === 0) {
            FS.unlink(path);
          } else if (flags === 512) {
            FS.rmdir(path);
          } else {
            abort('Invalid flags passed to unlinkat');
          }
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function __dlinit(main_dso_handle) {}
      var dlopenMissingError =
        'To use dlopen, you need enable dynamic linking, see https://github.com/emscripten-core/emscripten/wiki/Linking';
      function __dlopen_js(filename, flag) {
        abort(dlopenMissingError);
      }
      function __dlsym_js(handle, symbol) {
        abort(dlopenMissingError);
      }
      function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {}
      function getShiftFromSize(size) {
        switch (size) {
          case 1:
            return 0;
          case 2:
            return 1;
          case 4:
            return 2;
          case 8:
            return 3;
          default:
            throw new TypeError('Unknown type size: ' + size);
        }
      }
      function embind_init_charCodes() {
        var codes = new Array(256);
        for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
        }
        embind_charCodes = codes;
      }
      var embind_charCodes = undefined;
      function readLatin1String(ptr) {
        var ret = '';
        var c = ptr;
        while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
        }
        return ret;
      }
      var awaitingDependencies = {};
      var registeredTypes = {};
      var typeDependencies = {};
      var char_0 = 48;
      var char_9 = 57;
      function makeLegalFunctionName(name) {
        if (undefined === name) {
          return '_unknown';
        }
        name = name.replace(/[^a-zA-Z0-9_]/g, '$');
        var f = name.charCodeAt(0);
        if (f >= char_0 && f <= char_9) {
          return '_' + name;
        }
        return name;
      }
      function createNamedFunction(name, body) {
        name = makeLegalFunctionName(name);
        return new Function(
          'body',
          'return function ' + name + '() {\n' + '    "use strict";' + '    return body.apply(this, arguments);\n' + '};\n'
        )(body);
      }
      function extendError(baseErrorType, errorName) {
        var errorClass = createNamedFunction(errorName, function (message) {
          this.name = errorName;
          this.message = message;
          var stack = new Error(message).stack;
          if (stack !== undefined) {
            this.stack = this.toString() + '\n' + stack.replace(/^Error(:[^\n]*)?\n/, '');
          }
        });
        errorClass.prototype = Object.create(baseErrorType.prototype);
        errorClass.prototype.constructor = errorClass;
        errorClass.prototype.toString = function () {
          if (this.message === undefined) {
            return this.name;
          } else {
            return this.name + ': ' + this.message;
          }
        };
        return errorClass;
      }
      var BindingError = undefined;
      function throwBindingError(message) {
        throw new BindingError(message);
      }
      var InternalError = undefined;
      function throwInternalError(message) {
        throw new InternalError(message);
      }
      function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
        myTypes.forEach(function (type) {
          typeDependencies[type] = dependentTypes;
        });
        function onComplete(typeConverters) {
          var myTypeConverters = getTypeConverters(typeConverters);
          if (myTypeConverters.length !== myTypes.length) {
            throwInternalError('Mismatched type converter count');
          }
          for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i]);
          }
        }
        var typeConverters = new Array(dependentTypes.length);
        var unregisteredTypes = [];
        var registered = 0;
        dependentTypes.forEach((dt, i) => {
          if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt];
          } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
              awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(() => {
              typeConverters[i] = registeredTypes[dt];
              ++registered;
              if (registered === unregisteredTypes.length) {
                onComplete(typeConverters);
              }
            });
          }
        });
        if (0 === unregisteredTypes.length) {
          onComplete(typeConverters);
        }
      }
      function registerType(rawType, registeredInstance, options = {}) {
        if (!('argPackAdvance' in registeredInstance)) {
          throw new TypeError('registerType registeredInstance requires argPackAdvance');
        }
        var name = registeredInstance.name;
        if (!rawType) {
          throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
        }
        if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
            return;
          } else {
            throwBindingError("Cannot register type '" + name + "' twice");
          }
        }
        registeredTypes[rawType] = registeredInstance;
        delete typeDependencies[rawType];
        if (awaitingDependencies.hasOwnProperty(rawType)) {
          var callbacks = awaitingDependencies[rawType];
          delete awaitingDependencies[rawType];
          callbacks.forEach((cb) => cb());
        }
      }
      function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
        var shift = getShiftFromSize(size);
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: function (wt) {
            return !!wt;
          },
          toWireType: function (destructors, o) {
            return o ? trueValue : falseValue;
          },
          argPackAdvance: 8,
          readValueFromPointer: function (pointer) {
            var heap;
            if (size === 1) {
              heap = HEAP8;
            } else if (size === 2) {
              heap = HEAP16;
            } else if (size === 4) {
              heap = HEAP32;
            } else {
              throw new TypeError('Unknown boolean type size: ' + name);
            }
            return this['fromWireType'](heap[pointer >> shift]);
          },
          destructorFunction: null,
        });
      }
      function ClassHandle_isAliasOf(other) {
        if (!(this instanceof ClassHandle)) {
          return false;
        }
        if (!(other instanceof ClassHandle)) {
          return false;
        }
        var leftClass = this.$$.ptrType.registeredClass;
        var left = this.$$.ptr;
        var rightClass = other.$$.ptrType.registeredClass;
        var right = other.$$.ptr;
        while (leftClass.baseClass) {
          left = leftClass.upcast(left);
          leftClass = leftClass.baseClass;
        }
        while (rightClass.baseClass) {
          right = rightClass.upcast(right);
          rightClass = rightClass.baseClass;
        }
        return leftClass === rightClass && left === right;
      }
      function shallowCopyInternalPointer(o) {
        return {
          count: o.count,
          deleteScheduled: o.deleteScheduled,
          preservePointerOnDelete: o.preservePointerOnDelete,
          ptr: o.ptr,
          ptrType: o.ptrType,
          smartPtr: o.smartPtr,
          smartPtrType: o.smartPtrType,
        };
      }
      function throwInstanceAlreadyDeleted(obj) {
        function getInstanceTypeName(handle) {
          return handle.$$.ptrType.registeredClass.name;
        }
        throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
      }
      var finalizationRegistry = false;
      function detachFinalizer(handle) {}
      function runDestructor($$) {
        if ($$.smartPtr) {
          $$.smartPtrType.rawDestructor($$.smartPtr);
        } else {
          $$.ptrType.registeredClass.rawDestructor($$.ptr);
        }
      }
      function releaseClassHandle($$) {
        $$.count.value -= 1;
        var toDelete = 0 === $$.count.value;
        if (toDelete) {
          runDestructor($$);
        }
      }
      function downcastPointer(ptr, ptrClass, desiredClass) {
        if (ptrClass === desiredClass) {
          return ptr;
        }
        if (undefined === desiredClass.baseClass) {
          return null;
        }
        var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
        if (rv === null) {
          return null;
        }
        return desiredClass.downcast(rv);
      }
      var registeredPointers = {};
      function getInheritedInstanceCount() {
        return Object.keys(registeredInstances).length;
      }
      function getLiveInheritedInstances() {
        var rv = [];
        for (var k in registeredInstances) {
          if (registeredInstances.hasOwnProperty(k)) {
            rv.push(registeredInstances[k]);
          }
        }
        return rv;
      }
      var deletionQueue = [];
      function flushPendingDeletes() {
        while (deletionQueue.length) {
          var obj = deletionQueue.pop();
          obj.$$.deleteScheduled = false;
          obj['delete']();
        }
      }
      var delayFunction = undefined;
      function setDelayFunction(fn) {
        delayFunction = fn;
        if (deletionQueue.length && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
      }
      function init_embind() {
        Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
        Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
        Module['flushPendingDeletes'] = flushPendingDeletes;
        Module['setDelayFunction'] = setDelayFunction;
      }
      var registeredInstances = {};
      function getBasestPointer(class_, ptr) {
        if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
        }
        while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
        }
        return ptr;
      }
      function getInheritedInstance(class_, ptr) {
        ptr = getBasestPointer(class_, ptr);
        return registeredInstances[ptr];
      }
      function makeClassHandle(prototype, record) {
        if (!record.ptrType || !record.ptr) {
          throwInternalError('makeClassHandle requires ptr and ptrType');
        }
        var hasSmartPtrType = !!record.smartPtrType;
        var hasSmartPtr = !!record.smartPtr;
        if (hasSmartPtrType !== hasSmartPtr) {
          throwInternalError('Both smartPtrType and smartPtr must be specified');
        }
        record.count = { value: 1 };
        return attachFinalizer(Object.create(prototype, { $$: { value: record } }));
      }
      function RegisteredPointer_fromWireType(ptr) {
        var rawPointer = this.getPointee(ptr);
        if (!rawPointer) {
          this.destructor(ptr);
          return null;
        }
        var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
        if (undefined !== registeredInstance) {
          if (0 === registeredInstance.$$.count.value) {
            registeredInstance.$$.ptr = rawPointer;
            registeredInstance.$$.smartPtr = ptr;
            return registeredInstance['clone']();
          } else {
            var rv = registeredInstance['clone']();
            this.destructor(ptr);
            return rv;
          }
        }
        function makeDefaultHandle() {
          if (this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, {
              ptrType: this.pointeeType,
              ptr: rawPointer,
              smartPtrType: this,
              smartPtr: ptr,
            });
          } else {
            return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr: ptr });
          }
        }
        var actualType = this.registeredClass.getActualType(rawPointer);
        var registeredPointerRecord = registeredPointers[actualType];
        if (!registeredPointerRecord) {
          return makeDefaultHandle.call(this);
        }
        var toType;
        if (this.isConst) {
          toType = registeredPointerRecord.constPointerType;
        } else {
          toType = registeredPointerRecord.pointerType;
        }
        var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
        if (dp === null) {
          return makeDefaultHandle.call(this);
        }
        if (this.isSmartPointer) {
          return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp, smartPtrType: this, smartPtr: ptr });
        } else {
          return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp });
        }
      }
      function attachFinalizer(handle) {
        if ('undefined' === typeof FinalizationRegistry) {
          attachFinalizer = (handle) => handle;
          return handle;
        }
        finalizationRegistry = new FinalizationRegistry((info) => {
          releaseClassHandle(info.$$);
        });
        attachFinalizer = (handle) => {
          var $$ = handle.$$;
          var hasSmartPtr = !!$$.smartPtr;
          if (hasSmartPtr) {
            var info = { $$: $$ };
            finalizationRegistry.register(handle, info, handle);
          }
          return handle;
        };
        detachFinalizer = (handle) => finalizationRegistry.unregister(handle);
        return attachFinalizer(handle);
      }
      function ClassHandle_clone() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.preservePointerOnDelete) {
          this.$$.count.value += 1;
          return this;
        } else {
          var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } }));
          clone.$$.count.value += 1;
          clone.$$.deleteScheduled = false;
          return clone;
        }
      }
      function ClassHandle_delete() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError('Object already scheduled for deletion');
        }
        detachFinalizer(this);
        releaseClassHandle(this.$$);
        if (!this.$$.preservePointerOnDelete) {
          this.$$.smartPtr = undefined;
          this.$$.ptr = undefined;
        }
      }
      function ClassHandle_isDeleted() {
        return !this.$$.ptr;
      }
      function ClassHandle_deleteLater() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError('Object already scheduled for deletion');
        }
        deletionQueue.push(this);
        if (deletionQueue.length === 1 && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
        this.$$.deleteScheduled = true;
        return this;
      }
      function init_ClassHandle() {
        ClassHandle.prototype['isAliasOf'] = ClassHandle_isAliasOf;
        ClassHandle.prototype['clone'] = ClassHandle_clone;
        ClassHandle.prototype['delete'] = ClassHandle_delete;
        ClassHandle.prototype['isDeleted'] = ClassHandle_isDeleted;
        ClassHandle.prototype['deleteLater'] = ClassHandle_deleteLater;
      }
      function ClassHandle() {}
      function ensureOverloadTable(proto, methodName, humanName) {
        if (undefined === proto[methodName].overloadTable) {
          var prevFunc = proto[methodName];
          proto[methodName] = function () {
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
              throwBindingError(
                "Function '" +
                  humanName +
                  "' called with an invalid number of arguments (" +
                  arguments.length +
                  ') - expects one of (' +
                  proto[methodName].overloadTable +
                  ')!'
              );
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
          };
          proto[methodName].overloadTable = [];
          proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
        }
      }
      function exposePublicSymbol(name, value, numArguments) {
        if (Module.hasOwnProperty(name)) {
          if (
            undefined === numArguments ||
            (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])
          ) {
            throwBindingError("Cannot register public name '" + name + "' twice");
          }
          ensureOverloadTable(Module, name, name);
          if (Module.hasOwnProperty(numArguments)) {
            throwBindingError('Cannot register multiple overloads of a function with the same number of arguments (' + numArguments + ')!');
          }
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          if (undefined !== numArguments) {
            Module[name].numArguments = numArguments;
          }
        }
      }
      function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
        this.name = name;
        this.constructor = constructor;
        this.instancePrototype = instancePrototype;
        this.rawDestructor = rawDestructor;
        this.baseClass = baseClass;
        this.getActualType = getActualType;
        this.upcast = upcast;
        this.downcast = downcast;
        this.pureVirtualFunctions = [];
      }
      function upcastPointer(ptr, ptrClass, desiredClass) {
        while (ptrClass !== desiredClass) {
          if (!ptrClass.upcast) {
            throwBindingError('Expected null or instance of ' + desiredClass.name + ', got an instance of ' + ptrClass.name);
          }
          ptr = ptrClass.upcast(ptr);
          ptrClass = ptrClass.baseClass;
        }
        return ptr;
      }
      function constNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function genericPointerToWireType(destructors, handle) {
        var ptr;
        if (handle === null) {
          if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
          }
          if (this.isSmartPointer) {
            ptr = this.rawConstructor();
            if (destructors !== null) {
              destructors.push(this.rawDestructor, ptr);
            }
            return ptr;
          } else {
            return 0;
          }
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
        }
        if (!this.isConst && handle.$$.ptrType.isConst) {
          throwBindingError(
            'Cannot convert argument of type ' +
              (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) +
              ' to parameter type ' +
              this.name
          );
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        if (this.isSmartPointer) {
          if (undefined === handle.$$.smartPtr) {
            throwBindingError('Passing raw pointer to smart pointer is illegal');
          }
          switch (this.sharingPolicy) {
            case 0:
              if (handle.$$.smartPtrType === this) {
                ptr = handle.$$.smartPtr;
              } else {
                throwBindingError(
                  'Cannot convert argument of type ' +
                    (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) +
                    ' to parameter type ' +
                    this.name
                );
              }
              break;
            case 1:
              ptr = handle.$$.smartPtr;
              break;
            case 2:
              if (handle.$$.smartPtrType === this) {
                ptr = handle.$$.smartPtr;
              } else {
                var clonedHandle = handle['clone']();
                ptr = this.rawShare(
                  ptr,
                  Emval.toHandle(function () {
                    clonedHandle['delete']();
                  })
                );
                if (destructors !== null) {
                  destructors.push(this.rawDestructor, ptr);
                }
              }
              break;
            default:
              throwBindingError('Unsupporting sharing policy');
          }
        }
        return ptr;
      }
      function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
        }
        if (handle.$$.ptrType.isConst) {
          throwBindingError('Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function simpleReadValueFromPointer(pointer) {
        return this['fromWireType'](HEAPU32[pointer >> 2]);
      }
      function RegisteredPointer_getPointee(ptr) {
        if (this.rawGetPointee) {
          ptr = this.rawGetPointee(ptr);
        }
        return ptr;
      }
      function RegisteredPointer_destructor(ptr) {
        if (this.rawDestructor) {
          this.rawDestructor(ptr);
        }
      }
      function RegisteredPointer_deleteObject(handle) {
        if (handle !== null) {
          handle['delete']();
        }
      }
      function init_RegisteredPointer() {
        RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
        RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
        RegisteredPointer.prototype['argPackAdvance'] = 8;
        RegisteredPointer.prototype['readValueFromPointer'] = simpleReadValueFromPointer;
        RegisteredPointer.prototype['deleteObject'] = RegisteredPointer_deleteObject;
        RegisteredPointer.prototype['fromWireType'] = RegisteredPointer_fromWireType;
      }
      function RegisteredPointer(
        name,
        registeredClass,
        isReference,
        isConst,
        isSmartPointer,
        pointeeType,
        sharingPolicy,
        rawGetPointee,
        rawConstructor,
        rawShare,
        rawDestructor
      ) {
        this.name = name;
        this.registeredClass = registeredClass;
        this.isReference = isReference;
        this.isConst = isConst;
        this.isSmartPointer = isSmartPointer;
        this.pointeeType = pointeeType;
        this.sharingPolicy = sharingPolicy;
        this.rawGetPointee = rawGetPointee;
        this.rawConstructor = rawConstructor;
        this.rawShare = rawShare;
        this.rawDestructor = rawDestructor;
        if (!isSmartPointer && registeredClass.baseClass === undefined) {
          if (isConst) {
            this['toWireType'] = constNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
          } else {
            this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
          }
        } else {
          this['toWireType'] = genericPointerToWireType;
        }
      }
      function replacePublicSymbol(name, value, numArguments) {
        if (!Module.hasOwnProperty(name)) {
          throwInternalError('Replacing nonexistant public symbol');
        }
        if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          Module[name].argCount = numArguments;
        }
      }
      function dynCallLegacy(sig, ptr, args) {
        var f = Module['dynCall_' + sig];
        return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
      }
      function dynCall(sig, ptr, args) {
        if (sig.includes('j')) {
          return dynCallLegacy(sig, ptr, args);
        }
        return getWasmTableEntry(ptr).apply(null, args);
      }
      function getDynCaller(sig, ptr) {
        var argCache = [];
        return function () {
          argCache.length = 0;
          Object.assign(argCache, arguments);
          return dynCall(sig, ptr, argCache);
        };
      }
      function embind__requireFunction(signature, rawFunction) {
        signature = readLatin1String(signature);
        function makeDynCaller() {
          if (signature.includes('j')) {
            return getDynCaller(signature, rawFunction);
          }
          return getWasmTableEntry(rawFunction);
        }
        var fp = makeDynCaller();
        if (typeof fp != 'function') {
          throwBindingError('unknown function pointer with signature ' + signature + ': ' + rawFunction);
        }
        return fp;
      }
      var UnboundTypeError = undefined;
      function getTypeName(type) {
        var ptr = ___getTypeName(type);
        var rv = readLatin1String(ptr);
        _free(ptr);
        return rv;
      }
      function throwUnboundTypeError(message, types) {
        var unboundTypes = [];
        var seen = {};
        function visit(type) {
          if (seen[type]) {
            return;
          }
          if (registeredTypes[type]) {
            return;
          }
          if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return;
          }
          unboundTypes.push(type);
          seen[type] = true;
        }
        types.forEach(visit);
        throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
      }
      function __embind_register_class(
        rawType,
        rawPointerType,
        rawConstPointerType,
        baseClassRawType,
        getActualTypeSignature,
        getActualType,
        upcastSignature,
        upcast,
        downcastSignature,
        downcast,
        name,
        destructorSignature,
        rawDestructor
      ) {
        name = readLatin1String(name);
        getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
        if (upcast) {
          upcast = embind__requireFunction(upcastSignature, upcast);
        }
        if (downcast) {
          downcast = embind__requireFunction(downcastSignature, downcast);
        }
        rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
        var legalFunctionName = makeLegalFunctionName(name);
        exposePublicSymbol(legalFunctionName, function () {
          throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType]);
        });
        whenDependentTypesAreResolved(
          [rawType, rawPointerType, rawConstPointerType],
          baseClassRawType ? [baseClassRawType] : [],
          function (base) {
            base = base[0];
            var baseClass;
            var basePrototype;
            if (baseClassRawType) {
              baseClass = base.registeredClass;
              basePrototype = baseClass.instancePrototype;
            } else {
              basePrototype = ClassHandle.prototype;
            }
            var constructor = createNamedFunction(legalFunctionName, function () {
              if (Object.getPrototypeOf(this) !== instancePrototype) {
                throw new BindingError("Use 'new' to construct " + name);
              }
              if (undefined === registeredClass.constructor_body) {
                throw new BindingError(name + ' has no accessible constructor');
              }
              var body = registeredClass.constructor_body[arguments.length];
              if (undefined === body) {
                throw new BindingError(
                  'Tried to invoke ctor of ' +
                    name +
                    ' with invalid number of parameters (' +
                    arguments.length +
                    ') - expected (' +
                    Object.keys(registeredClass.constructor_body).toString() +
                    ') parameters instead!'
                );
              }
              return body.apply(this, arguments);
            });
            var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } });
            constructor.prototype = instancePrototype;
            var registeredClass = new RegisteredClass(
              name,
              constructor,
              instancePrototype,
              rawDestructor,
              baseClass,
              getActualType,
              upcast,
              downcast
            );
            var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
            var pointerConverter = new RegisteredPointer(name + '*', registeredClass, false, false, false);
            var constPointerConverter = new RegisteredPointer(name + ' const*', registeredClass, false, true, false);
            registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter };
            replacePublicSymbol(legalFunctionName, constructor);
            return [referenceConverter, pointerConverter, constPointerConverter];
          }
        );
      }
      function heap32VectorToArray(count, firstElement) {
        var array = [];
        for (var i = 0; i < count; i++) {
          array.push(HEAP32[(firstElement >> 2) + i]);
        }
        return array;
      }
      function runDestructors(destructors) {
        while (destructors.length) {
          var ptr = destructors.pop();
          var del = destructors.pop();
          del(ptr);
        }
      }
      function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
        assert(argCount > 0);
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        invoker = embind__requireFunction(invokerSignature, invoker);
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
          classType = classType[0];
          var humanName = 'constructor ' + classType.name;
          if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = [];
          }
          if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError(
              'Cannot register multiple constructors with identical number of parameters (' +
                (argCount - 1) +
                ") for class '" +
                classType.name +
                "'! Overload resolution is currently only performed using the parameter count, not actual type info!"
            );
          }
          classType.registeredClass.constructor_body[argCount - 1] = () => {
            throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes);
          };
          whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
            argTypes.splice(1, 0, null);
            classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(
              humanName,
              argTypes,
              null,
              invoker,
              rawConstructor
            );
            return [];
          });
          return [];
        });
      }
      function new_(constructor, argumentList) {
        if (!(constructor instanceof Function)) {
          throw new TypeError('new_ called with constructor type ' + typeof constructor + ' which is not a function');
        }
        var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function () {});
        dummy.prototype = constructor.prototype;
        var obj = new dummy();
        var r = constructor.apply(obj, argumentList);
        return r instanceof Object ? r : obj;
      }
      function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
        var argCount = argTypes.length;
        if (argCount < 2) {
          throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
        }
        var isClassMethodFunc = argTypes[1] !== null && classType !== null;
        var needsDestructorStack = false;
        for (var i = 1; i < argTypes.length; ++i) {
          if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
            needsDestructorStack = true;
            break;
          }
        }
        var returns = argTypes[0].name !== 'void';
        var argsList = '';
        var argsListWired = '';
        for (var i = 0; i < argCount - 2; ++i) {
          argsList += (i !== 0 ? ', ' : '') + 'arg' + i;
          argsListWired += (i !== 0 ? ', ' : '') + 'arg' + i + 'Wired';
        }
        var invokerFnBody =
          'return function ' +
          makeLegalFunctionName(humanName) +
          '(' +
          argsList +
          ') {\n' +
          'if (arguments.length !== ' +
          (argCount - 2) +
          ') {\n' +
          "throwBindingError('function " +
          humanName +
          " called with ' + arguments.length + ' arguments, expected " +
          (argCount - 2) +
          " args!');\n" +
          '}\n';
        if (needsDestructorStack) {
          invokerFnBody += 'var destructors = [];\n';
        }
        var dtorStack = needsDestructorStack ? 'destructors' : 'null';
        var args1 = ['throwBindingError', 'invoker', 'fn', 'runDestructors', 'retType', 'classParam'];
        var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
        if (isClassMethodFunc) {
          invokerFnBody += 'var thisWired = classParam.toWireType(' + dtorStack + ', this);\n';
        }
        for (var i = 0; i < argCount - 2; ++i) {
          invokerFnBody +=
            'var arg' + i + 'Wired = argType' + i + '.toWireType(' + dtorStack + ', arg' + i + '); // ' + argTypes[i + 2].name + '\n';
          args1.push('argType' + i);
          args2.push(argTypes[i + 2]);
        }
        if (isClassMethodFunc) {
          argsListWired = 'thisWired' + (argsListWired.length > 0 ? ', ' : '') + argsListWired;
        }
        invokerFnBody += (returns ? 'var rv = ' : '') + 'invoker(fn' + (argsListWired.length > 0 ? ', ' : '') + argsListWired + ');\n';
        if (needsDestructorStack) {
          invokerFnBody += 'runDestructors(destructors);\n';
        } else {
          for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
            var paramName = i === 1 ? 'thisWired' : 'arg' + (i - 2) + 'Wired';
            if (argTypes[i].destructorFunction !== null) {
              invokerFnBody += paramName + '_dtor(' + paramName + '); // ' + argTypes[i].name + '\n';
              args1.push(paramName + '_dtor');
              args2.push(argTypes[i].destructorFunction);
            }
          }
        }
        if (returns) {
          invokerFnBody += 'var ret = retType.fromWireType(rv);\n' + 'return ret;\n';
        } else {
        }
        invokerFnBody += '}\n';
        args1.push(invokerFnBody);
        var invokerFunction = new_(Function, args1).apply(null, args2);
        return invokerFunction;
      }
      function __embind_register_class_function(
        rawClassType,
        methodName,
        argCount,
        rawArgTypesAddr,
        invokerSignature,
        rawInvoker,
        context,
        isPureVirtual
      ) {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        methodName = readLatin1String(methodName);
        rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
          classType = classType[0];
          var humanName = classType.name + '.' + methodName;
          if (methodName.startsWith('@@')) {
            methodName = Symbol[methodName.substring(2)];
          }
          if (isPureVirtual) {
            classType.registeredClass.pureVirtualFunctions.push(methodName);
          }
          function unboundTypesHandler() {
            throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
          }
          var proto = classType.registeredClass.instancePrototype;
          var method = proto[methodName];
          if (
            undefined === method ||
            (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2)
          ) {
            unboundTypesHandler.argCount = argCount - 2;
            unboundTypesHandler.className = classType.name;
            proto[methodName] = unboundTypesHandler;
          } else {
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
          }
          whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
            if (undefined === proto[methodName].overloadTable) {
              memberFunction.argCount = argCount - 2;
              proto[methodName] = memberFunction;
            } else {
              proto[methodName].overloadTable[argCount - 2] = memberFunction;
            }
            return [];
          });
          return [];
        });
      }
      var emval_free_list = [];
      var emval_handle_array = [{}, { value: undefined }, { value: null }, { value: true }, { value: false }];
      function __emval_decref(handle) {
        if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
          emval_handle_array[handle] = undefined;
          emval_free_list.push(handle);
        }
      }
      function count_emval_handles() {
        var count = 0;
        for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
            ++count;
          }
        }
        return count;
      }
      function get_first_emval() {
        for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
            return emval_handle_array[i];
          }
        }
        return null;
      }
      function init_emval() {
        Module['count_emval_handles'] = count_emval_handles;
        Module['get_first_emval'] = get_first_emval;
      }
      var Emval = {
        toValue: (handle) => {
          if (!handle) {
            throwBindingError('Cannot use deleted val. handle = ' + handle);
          }
          return emval_handle_array[handle].value;
        },
        toHandle: (value) => {
          switch (value) {
            case undefined:
              return 1;
            case null:
              return 2;
            case true:
              return 3;
            case false:
              return 4;
            default: {
              var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
              emval_handle_array[handle] = { refcount: 1, value: value };
              return handle;
            }
          }
        },
      };
      function __embind_register_emval(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: function (handle) {
            var rv = Emval.toValue(handle);
            __emval_decref(handle);
            return rv;
          },
          toWireType: function (destructors, value) {
            return Emval.toHandle(value);
          },
          argPackAdvance: 8,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction: null,
        });
      }
      function _embind_repr(v) {
        if (v === null) {
          return 'null';
        }
        var t = typeof v;
        if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
        } else {
          return '' + v;
        }
      }
      function floatReadValueFromPointer(name, shift) {
        switch (shift) {
          case 2:
            return function (pointer) {
              return this['fromWireType'](HEAPF32[pointer >> 2]);
            };
          case 3:
            return function (pointer) {
              return this['fromWireType'](HEAPF64[pointer >> 3]);
            };
          default:
            throw new TypeError('Unknown float type: ' + name);
        }
      }
      function __embind_register_float(rawType, name, size) {
        var shift = getShiftFromSize(size);
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: function (value) {
            return value;
          },
          toWireType: function (destructors, value) {
            return value;
          },
          argPackAdvance: 8,
          readValueFromPointer: floatReadValueFromPointer(name, shift),
          destructorFunction: null,
        });
      }
      function integerReadValueFromPointer(name, shift, signed) {
        switch (shift) {
          case 0:
            return signed
              ? function readS8FromPointer(pointer) {
                  return HEAP8[pointer];
                }
              : function readU8FromPointer(pointer) {
                  return HEAPU8[pointer];
                };
          case 1:
            return signed
              ? function readS16FromPointer(pointer) {
                  return HEAP16[pointer >> 1];
                }
              : function readU16FromPointer(pointer) {
                  return HEAPU16[pointer >> 1];
                };
          case 2:
            return signed
              ? function readS32FromPointer(pointer) {
                  return HEAP32[pointer >> 2];
                }
              : function readU32FromPointer(pointer) {
                  return HEAPU32[pointer >> 2];
                };
          default:
            throw new TypeError('Unknown integer type: ' + name);
        }
      }
      function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
        name = readLatin1String(name);
        if (maxRange === -1) {
          maxRange = 4294967295;
        }
        var shift = getShiftFromSize(size);
        var fromWireType = (value) => value;
        if (minRange === 0) {
          var bitshift = 32 - 8 * size;
          fromWireType = (value) => (value << bitshift) >>> bitshift;
        }
        var isUnsignedType = name.includes('unsigned');
        var checkAssertions = (value, toTypeName) => {};
        var toWireType;
        if (isUnsignedType) {
          toWireType = function (destructors, value) {
            checkAssertions(value, this.name);
            return value >>> 0;
          };
        } else {
          toWireType = function (destructors, value) {
            checkAssertions(value, this.name);
            return value;
          };
        }
        registerType(primitiveType, {
          name: name,
          fromWireType: fromWireType,
          toWireType: toWireType,
          argPackAdvance: 8,
          readValueFromPointer: integerReadValueFromPointer(name, shift, minRange !== 0),
          destructorFunction: null,
        });
      }
      function __embind_register_memory_view(rawType, dataTypeIndex, name) {
        var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
        var TA = typeMapping[dataTypeIndex];
        function decodeMemoryView(handle) {
          handle = handle >> 2;
          var heap = HEAPU32;
          var size = heap[handle];
          var data = heap[handle + 1];
          return new TA(buffer, data, size);
        }
        name = readLatin1String(name);
        registerType(
          rawType,
          { name: name, fromWireType: decodeMemoryView, argPackAdvance: 8, readValueFromPointer: decodeMemoryView },
          { ignoreDuplicateRegistrations: true }
        );
      }
      function __embind_register_std_string(rawType, name) {
        name = readLatin1String(name);
        var stdStringIsUTF8 = name === 'std::string';
        registerType(rawType, {
          name: name,
          fromWireType: function (value) {
            var length = HEAPU32[value >> 2];
            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = value + 4;
              for (var i = 0; i <= length; ++i) {
                var currentBytePtr = value + 4 + i;
                if (i == length || HEAPU8[currentBytePtr] == 0) {
                  var maxRead = currentBytePtr - decodeStartPtr;
                  var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                  if (str === undefined) {
                    str = stringSegment;
                  } else {
                    str += String.fromCharCode(0);
                    str += stringSegment;
                  }
                  decodeStartPtr = currentBytePtr + 1;
                }
              }
            } else {
              var a = new Array(length);
              for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
              }
              str = a.join('');
            }
            _free(value);
            return str;
          },
          toWireType: function (destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }
            var getLength;
            var valueIsOfTypeString = typeof value == 'string';
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
              throwBindingError('Cannot pass non-string to std::string');
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              getLength = () => lengthBytesUTF8(value);
            } else {
              getLength = () => value.length;
            }
            var length = getLength();
            var ptr = _malloc(4 + length + 1);
            HEAPU32[ptr >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr + 4, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0; i < length; ++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                  }
                  HEAPU8[ptr + 4 + i] = charCode;
                }
              } else {
                for (var i = 0; i < length; ++i) {
                  HEAPU8[ptr + 4 + i] = value[i];
                }
              }
            }
            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          },
          argPackAdvance: 8,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction: function (ptr) {
            _free(ptr);
          },
        });
      }
      function __embind_register_std_wstring(rawType, charSize, name) {
        name = readLatin1String(name);
        var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
        if (charSize === 2) {
          decodeString = UTF16ToString;
          encodeString = stringToUTF16;
          lengthBytesUTF = lengthBytesUTF16;
          getHeap = () => HEAPU16;
          shift = 1;
        } else if (charSize === 4) {
          decodeString = UTF32ToString;
          encodeString = stringToUTF32;
          lengthBytesUTF = lengthBytesUTF32;
          getHeap = () => HEAPU32;
          shift = 2;
        }
        registerType(rawType, {
          name: name,
          fromWireType: function (value) {
            var length = HEAPU32[value >> 2];
            var HEAP = getHeap();
            var str;
            var decodeStartPtr = value + 4;
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = value + 4 + i * charSize;
              if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                var maxReadBytes = currentBytePtr - decodeStartPtr;
                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                if (str === undefined) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + charSize;
              }
            }
            _free(value);
            return str;
          },
          toWireType: function (destructors, value) {
            if (!(typeof value == 'string')) {
              throwBindingError('Cannot pass non-string to C++ string type ' + name);
            }
            var length = lengthBytesUTF(value);
            var ptr = _malloc(4 + length + charSize);
            HEAPU32[ptr >> 2] = length >> shift;
            encodeString(value, ptr + 4, length + charSize);
            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          },
          argPackAdvance: 8,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction: function (ptr) {
            _free(ptr);
          },
        });
      }
      function __embind_register_void(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, {
          isVoid: true,
          name: name,
          argPackAdvance: 0,
          fromWireType: function () {
            return undefined;
          },
          toWireType: function (destructors, o) {
            return undefined;
          },
        });
      }
      function __emscripten_date_now() {
        return Date.now();
      }
      var nowIsMonotonic = true;
      function __emscripten_get_now_is_monotonic() {
        return nowIsMonotonic;
      }
      function __emval_incref(handle) {
        if (handle > 4) {
          emval_handle_array[handle].refcount += 1;
        }
      }
      function requireRegisteredType(rawType, humanName) {
        var impl = registeredTypes[rawType];
        if (undefined === impl) {
          throwBindingError(humanName + ' has unknown type ' + getTypeName(rawType));
        }
        return impl;
      }
      function __emval_take_value(type, argv) {
        type = requireRegisteredType(type, '_emval_take_value');
        var v = type['readValueFromPointer'](argv);
        return Emval.toHandle(v);
      }
      function __mmap_js(addr, len, prot, flags, fd, off, allocated, builtin) {
        try {
          var info = FS.getStream(fd);
          if (!info) return -8;
          var res = FS.mmap(info, addr, len, off, prot, flags);
          var ptr = res.ptr;
          HEAP32[allocated >> 2] = res.allocated;
          return ptr;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function __munmap_js(addr, len, prot, flags, fd, offset) {
        try {
          var stream = FS.getStream(fd);
          if (stream) {
            if (prot & 2) {
              SYSCALLS.doMsync(addr, stream, len, flags, offset);
            }
            FS.munmap(stream);
          }
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return -e.errno;
        }
      }
      function _abort() {
        abort('');
      }
      function _emscripten_get_heap_max() {
        return 2147483648;
      }
      var _emscripten_get_now;
      _emscripten_get_now = () => performance.now();
      function _emscripten_memcpy_big(dest, src, num) {
        HEAPU8.copyWithin(dest, src, src + num);
      }
      function emscripten_realloc_buffer(size) {
        try {
          wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
          updateGlobalBufferAndViews(wasmMemory.buffer);
          return 1;
        } catch (e) {}
      }
      function _emscripten_resize_heap(requestedSize) {
        var oldSize = HEAPU8.length;
        requestedSize = requestedSize >>> 0;
        var maxHeapSize = _emscripten_get_heap_max();
        if (requestedSize > maxHeapSize) {
          return false;
        }
        let alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
        for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
          var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
          overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
          var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
          var replacement = emscripten_realloc_buffer(newSize);
          if (replacement) {
            return true;
          }
        }
        return false;
      }
      var ENV = {};
      function getExecutableName() {
        return thisProgram || './this.program';
      }
      function getEnvStrings() {
        if (!getEnvStrings.strings) {
          var lang = ((typeof navigator == 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
          var env = {
            USER: 'web_user',
            LOGNAME: 'web_user',
            PATH: '/',
            PWD: '/',
            HOME: '/home/web_user',
            LANG: lang,
            _: getExecutableName(),
          };
          for (var x in ENV) {
            if (ENV[x] === undefined) delete env[x];
            else env[x] = ENV[x];
          }
          var strings = [];
          for (var x in env) {
            strings.push(x + '=' + env[x]);
          }
          getEnvStrings.strings = strings;
        }
        return getEnvStrings.strings;
      }
      function _environ_get(__environ, environ_buf) {
        var bufSize = 0;
        getEnvStrings().forEach(function (string, i) {
          var ptr = environ_buf + bufSize;
          HEAP32[(__environ + i * 4) >> 2] = ptr;
          writeAsciiToMemory(string, ptr);
          bufSize += string.length + 1;
        });
        return 0;
      }
      function _environ_sizes_get(penviron_count, penviron_buf_size) {
        var strings = getEnvStrings();
        HEAP32[penviron_count >> 2] = strings.length;
        var bufSize = 0;
        strings.forEach(function (string) {
          bufSize += string.length + 1;
        });
        HEAP32[penviron_buf_size >> 2] = bufSize;
        return 0;
      }
      function _exit(status) {
        exit(status);
      }
      function _fd_close(fd) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          FS.close(stream);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function doReadv(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAPU32[iov >> 2];
          var len = HEAPU32[(iov + 4) >> 2];
          iov += 8;
          var curr = FS.read(stream, HEAP8, ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break;
        }
        return ret;
      }
      function _fd_read(fd, iov, iovcnt, pnum) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doReadv(stream, iov, iovcnt);
          HEAP32[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var HIGH_OFFSET = 4294967296;
          var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
          var DOUBLE_LIMIT = 9007199254740992;
          if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
            return 61;
          }
          FS.llseek(stream, offset, whence);
          (tempI64 = [
            stream.position >>> 0,
            ((tempDouble = stream.position),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[newOffset >> 2] = tempI64[0]),
            (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
          if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function _fd_sync(fd) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          if (stream.stream_ops && stream.stream_ops.fsync) {
            return -stream.stream_ops.fsync(stream);
          }
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function doWritev(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAPU32[iov >> 2];
          var len = HEAPU32[(iov + 4) >> 2];
          iov += 8;
          var curr = FS.write(stream, HEAP8, ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
        }
        return ret;
      }
      function _fd_write(fd, iov, iovcnt, pnum) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doWritev(stream, iov, iovcnt);
          HEAP32[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
          return e.errno;
        }
      }
      function _getTempRet0() {
        return getTempRet0();
      }
      function _getentropy(buffer, size) {
        if (!_getentropy.randomDevice) {
          _getentropy.randomDevice = getRandomDevice();
        }
        for (var i = 0; i < size; i++) {
          HEAP8[(buffer + i) >> 0] = _getentropy.randomDevice();
        }
        return 0;
      }
      function _setTempRet0(val) {
        setTempRet0(val);
      }
      function __isLeapYear(year) {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      }
      function __arraySum(array, index) {
        var sum = 0;
        for (var i = 0; i <= index; sum += array[i++]) {}
        return sum;
      }
      var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      function __addDays(date, days) {
        var newDate = new Date(date.getTime());
        while (days > 0) {
          var leap = __isLeapYear(newDate.getFullYear());
          var currentMonth = newDate.getMonth();
          var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
          if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
              newDate.setMonth(currentMonth + 1);
            } else {
              newDate.setMonth(0);
              newDate.setFullYear(newDate.getFullYear() + 1);
            }
          } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate;
          }
        }
        return newDate;
      }
      function _strftime(s, maxsize, format, tm) {
        var tm_zone = HEAP32[(tm + 40) >> 2];
        var date = {
          tm_sec: HEAP32[tm >> 2],
          tm_min: HEAP32[(tm + 4) >> 2],
          tm_hour: HEAP32[(tm + 8) >> 2],
          tm_mday: HEAP32[(tm + 12) >> 2],
          tm_mon: HEAP32[(tm + 16) >> 2],
          tm_year: HEAP32[(tm + 20) >> 2],
          tm_wday: HEAP32[(tm + 24) >> 2],
          tm_yday: HEAP32[(tm + 28) >> 2],
          tm_isdst: HEAP32[(tm + 32) >> 2],
          tm_gmtoff: HEAP32[(tm + 36) >> 2],
          tm_zone: tm_zone ? UTF8ToString(tm_zone) : '',
        };
        var pattern = UTF8ToString(format);
        var EXPANSION_RULES_1 = {
          '%c': '%a %b %d %H:%M:%S %Y',
          '%D': '%m/%d/%y',
          '%F': '%Y-%m-%d',
          '%h': '%b',
          '%r': '%I:%M:%S %p',
          '%R': '%H:%M',
          '%T': '%H:%M:%S',
          '%x': '%m/%d/%y',
          '%X': '%H:%M:%S',
          '%Ec': '%c',
          '%EC': '%C',
          '%Ex': '%m/%d/%y',
          '%EX': '%H:%M:%S',
          '%Ey': '%y',
          '%EY': '%Y',
          '%Od': '%d',
          '%Oe': '%e',
          '%OH': '%H',
          '%OI': '%I',
          '%Om': '%m',
          '%OM': '%M',
          '%OS': '%S',
          '%Ou': '%u',
          '%OU': '%U',
          '%OV': '%V',
          '%Ow': '%w',
          '%OW': '%W',
          '%Oy': '%y',
        };
        for (var rule in EXPANSION_RULES_1) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
        }
        var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var MONTHS = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        function leadingSomething(value, digits, character) {
          var str = typeof value == 'number' ? value.toString() : value || '';
          while (str.length < digits) {
            str = character[0] + str;
          }
          return str;
        }
        function leadingNulls(value, digits) {
          return leadingSomething(value, digits, '0');
        }
        function compareByDay(date1, date2) {
          function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0;
          }
          var compare;
          if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
              compare = sgn(date1.getDate() - date2.getDate());
            }
          }
          return compare;
        }
        function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0:
              return new Date(janFourth.getFullYear() - 1, 11, 29);
            case 1:
              return janFourth;
            case 2:
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3:
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4:
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5:
              return new Date(janFourth.getFullYear() - 1, 11, 31);
            case 6:
              return new Date(janFourth.getFullYear() - 1, 11, 30);
          }
        }
        function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear() + 1;
            } else {
              return thisDate.getFullYear();
            }
          } else {
            return thisDate.getFullYear() - 1;
          }
        }
        var EXPANSION_RULES_2 = {
          '%a': function (date) {
            return WEEKDAYS[date.tm_wday].substring(0, 3);
          },
          '%A': function (date) {
            return WEEKDAYS[date.tm_wday];
          },
          '%b': function (date) {
            return MONTHS[date.tm_mon].substring(0, 3);
          },
          '%B': function (date) {
            return MONTHS[date.tm_mon];
          },
          '%C': function (date) {
            var year = date.tm_year + 1900;
            return leadingNulls((year / 100) | 0, 2);
          },
          '%d': function (date) {
            return leadingNulls(date.tm_mday, 2);
          },
          '%e': function (date) {
            return leadingSomething(date.tm_mday, 2, ' ');
          },
          '%g': function (date) {
            return getWeekBasedYear(date).toString().substring(2);
          },
          '%G': function (date) {
            return getWeekBasedYear(date);
          },
          '%H': function (date) {
            return leadingNulls(date.tm_hour, 2);
          },
          '%I': function (date) {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0) twelveHour = 12;
            else if (twelveHour > 12) twelveHour -= 12;
            return leadingNulls(twelveHour, 2);
          },
          '%j': function (date) {
            return leadingNulls(
              date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1),
              3
            );
          },
          '%m': function (date) {
            return leadingNulls(date.tm_mon + 1, 2);
          },
          '%M': function (date) {
            return leadingNulls(date.tm_min, 2);
          },
          '%n': function () {
            return '\n';
          },
          '%p': function (date) {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
              return 'AM';
            } else {
              return 'PM';
            }
          },
          '%S': function (date) {
            return leadingNulls(date.tm_sec, 2);
          },
          '%t': function () {
            return '\t';
          },
          '%u': function (date) {
            return date.tm_wday || 7;
          },
          '%U': function (date) {
            var days = date.tm_yday + 7 - date.tm_wday;
            return leadingNulls(Math.floor(days / 7), 2);
          },
          '%V': function (date) {
            var val = Math.floor((date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7);
            if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
              val++;
            }
            if (!val) {
              val = 52;
              var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
              if (dec31 == 4 || (dec31 == 5 && __isLeapYear((date.tm_year % 400) - 1))) {
                val++;
              }
            } else if (val == 53) {
              var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
              if (jan1 != 4 && (jan1 != 3 || !__isLeapYear(date.tm_year))) val = 1;
            }
            return leadingNulls(val, 2);
          },
          '%w': function (date) {
            return date.tm_wday;
          },
          '%W': function (date) {
            var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
            return leadingNulls(Math.floor(days / 7), 2);
          },
          '%y': function (date) {
            return (date.tm_year + 1900).toString().substring(2);
          },
          '%Y': function (date) {
            return date.tm_year + 1900;
          },
          '%z': function (date) {
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = (off / 60) * 100 + (off % 60);
            return (ahead ? '+' : '-') + String('0000' + off).slice(-4);
          },
          '%Z': function (date) {
            return date.tm_zone;
          },
          '%%': function () {
            return '%';
          },
        };
        pattern = pattern.replace(/%%/g, '\0\0');
        for (var rule in EXPANSION_RULES_2) {
          if (pattern.includes(rule)) {
            pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
          }
        }
        pattern = pattern.replace(/\0\0/g, '%');
        var bytes = intArrayFromString(pattern, false);
        if (bytes.length > maxsize) {
          return 0;
        }
        writeArrayToMemory(bytes, s);
        return bytes.length - 1;
      }
      function _strftime_l(s, maxsize, format, tm) {
        return _strftime(s, maxsize, format, tm);
      }
      var FSNode = function (parent, name, mode, rdev) {
        if (!parent) {
          parent = this;
        }
        this.parent = parent;
        this.mount = parent.mount;
        this.mounted = null;
        this.id = FS.nextInode++;
        this.name = name;
        this.mode = mode;
        this.node_ops = {};
        this.stream_ops = {};
        this.rdev = rdev;
      };
      var readMode = 292 | 73;
      var writeMode = 146;
      Object.defineProperties(FSNode.prototype, {
        read: {
          get: function () {
            return (this.mode & readMode) === readMode;
          },
          set: function (val) {
            val ? (this.mode |= readMode) : (this.mode &= ~readMode);
          },
        },
        write: {
          get: function () {
            return (this.mode & writeMode) === writeMode;
          },
          set: function (val) {
            val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
          },
        },
        isFolder: {
          get: function () {
            return FS.isDir(this.mode);
          },
        },
        isDevice: {
          get: function () {
            return FS.isChrdev(this.mode);
          },
        },
      });
      FS.FSNode = FSNode;
      FS.staticInit();
      embind_init_charCodes();
      BindingError = Module['BindingError'] = extendError(Error, 'BindingError');
      InternalError = Module['InternalError'] = extendError(Error, 'InternalError');
      init_ClassHandle();
      init_embind();
      init_RegisteredPointer();
      UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');
      init_emval();
      function intArrayFromString(stringy, dontAddNull, length) {
        var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
        var u8array = new Array(len);
        var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
        if (dontAddNull) u8array.length = numBytesWritten;
        return u8array;
      }
      var asmLibraryArg = {
        a: ___assert_fail,
        k: ___cxa_allocate_exception,
        t: ___cxa_begin_catch,
        ia: ___cxa_current_primary_exception,
        R: ___cxa_decrement_exception_refcount,
        v: ___cxa_end_catch,
        d: ___cxa_find_matching_catch_2,
        i: ___cxa_find_matching_catch_3,
        r: ___cxa_free_exception,
        Q: ___cxa_increment_exception_refcount,
        X: ___cxa_rethrow,
        ha: ___cxa_rethrow_primary_exception,
        p: ___cxa_throw,
        ja: ___cxa_uncaught_exceptions,
        g: ___resumeException,
        wa: ___syscall_fstat64,
        ca: ___syscall_ftruncate64,
        ta: ___syscall_lstat64,
        ua: ___syscall_newfstatat,
        xa: ___syscall_openat,
        na: ___syscall_renameat,
        va: ___syscall_stat64,
        la: ___syscall_unlinkat,
        Aa: __dlinit,
        Ca: __dlopen_js,
        Ba: __dlsym_js,
        da: __embind_register_bigint,
        Ea: __embind_register_bool,
        Ma: __embind_register_class,
        La: __embind_register_class_constructor,
        w: __embind_register_class_function,
        Da: __embind_register_emval,
        W: __embind_register_float,
        y: __embind_register_integer,
        s: __embind_register_memory_view,
        V: __embind_register_std_string,
        L: __embind_register_std_wstring,
        Fa: __embind_register_void,
        T: __emscripten_date_now,
        ya: __emscripten_get_now_is_monotonic,
        Ka: __emval_decref,
        ba: __emval_incref,
        G: __emval_take_value,
        oa: __mmap_js,
        pa: __munmap_js,
        b: _abort,
        ma: _emscripten_get_heap_max,
        K: _emscripten_get_now,
        za: _emscripten_memcpy_big,
        ka: _emscripten_resize_heap,
        qa: _environ_get,
        ra: _environ_sizes_get,
        Ga: _exit,
        U: _fd_close,
        S: _fd_read,
        aa: _fd_seek,
        sa: _fd_sync,
        J: _fd_write,
        c: _getTempRet0,
        ea: _getentropy,
        N: invoke_diii,
        Ja: invoke_fi,
        O: invoke_fiii,
        q: invoke_i,
        f: invoke_ii,
        Ha: invoke_iidii,
        e: invoke_iii,
        l: invoke_iiii,
        m: invoke_iiiii,
        ga: invoke_iiiiid,
        C: invoke_iiiiii,
        x: invoke_iiiiiii,
        P: invoke_iiiiiiii,
        F: invoke_iiiiiiiiiiii,
        $: invoke_j,
        _: invoke_jiiii,
        n: invoke_v,
        j: invoke_vi,
        h: invoke_vii,
        A: invoke_viid,
        M: invoke_viidi,
        o: invoke_viii,
        Ia: invoke_viiidiii,
        H: invoke_viiii,
        Y: invoke_viiiidi,
        Z: invoke_viiiii,
        u: invoke_viiiiiii,
        D: invoke_viiiiiiidi,
        I: invoke_viiiiiiii,
        B: invoke_viiiiiiiiii,
        E: invoke_viiiiiiiiiiiiiii,
        z: _setTempRet0,
        fa: _strftime_l,
      };
      var asm = createWasm();
      var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
        return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['Oa']).apply(null, arguments);
      });
      var _malloc = (Module['_malloc'] = function () {
        return (_malloc = Module['_malloc'] = Module['asm']['Qa']).apply(null, arguments);
      });
      var _free = (Module['_free'] = function () {
        return (_free = Module['_free'] = Module['asm']['Ra']).apply(null, arguments);
      });
      var ___getTypeName = (Module['___getTypeName'] = function () {
        return (___getTypeName = Module['___getTypeName'] = Module['asm']['Sa']).apply(null, arguments);
      });
      var ___embind_register_native_and_builtin_types = (Module['___embind_register_native_and_builtin_types'] = function () {
        return (___embind_register_native_and_builtin_types = Module['___embind_register_native_and_builtin_types'] =
          Module['asm']['Ta']).apply(null, arguments);
      });
      var ___stdio_exit = (Module['___stdio_exit'] = function () {
        return (___stdio_exit = Module['___stdio_exit'] = Module['asm']['Ua']).apply(null, arguments);
      });
      var ___funcs_on_exit = (Module['___funcs_on_exit'] = function () {
        return (___funcs_on_exit = Module['___funcs_on_exit'] = Module['asm']['Va']).apply(null, arguments);
      });
      var _emscripten_builtin_memalign = (Module['_emscripten_builtin_memalign'] = function () {
        return (_emscripten_builtin_memalign = Module['_emscripten_builtin_memalign'] = Module['asm']['Wa']).apply(null, arguments);
      });
      var _setThrew = (Module['_setThrew'] = function () {
        return (_setThrew = Module['_setThrew'] = Module['asm']['Xa']).apply(null, arguments);
      });
      var stackSave = (Module['stackSave'] = function () {
        return (stackSave = Module['stackSave'] = Module['asm']['Ya']).apply(null, arguments);
      });
      var stackRestore = (Module['stackRestore'] = function () {
        return (stackRestore = Module['stackRestore'] = Module['asm']['Za']).apply(null, arguments);
      });
      var ___cxa_can_catch = (Module['___cxa_can_catch'] = function () {
        return (___cxa_can_catch = Module['___cxa_can_catch'] = Module['asm']['_a']).apply(null, arguments);
      });
      var ___cxa_is_pointer_type = (Module['___cxa_is_pointer_type'] = function () {
        return (___cxa_is_pointer_type = Module['___cxa_is_pointer_type'] = Module['asm']['$a']).apply(null, arguments);
      });
      var dynCall_iiiij = (Module['dynCall_iiiij'] = function () {
        return (dynCall_iiiij = Module['dynCall_iiiij'] = Module['asm']['ab']).apply(null, arguments);
      });
      var dynCall_jii = (Module['dynCall_jii'] = function () {
        return (dynCall_jii = Module['dynCall_jii'] = Module['asm']['bb']).apply(null, arguments);
      });
      var dynCall_jjj = (Module['dynCall_jjj'] = function () {
        return (dynCall_jjj = Module['dynCall_jjj'] = Module['asm']['cb']).apply(null, arguments);
      });
      var dynCall_jji = (Module['dynCall_jji'] = function () {
        return (dynCall_jji = Module['dynCall_jji'] = Module['asm']['db']).apply(null, arguments);
      });
      var dynCall_jiii = (Module['dynCall_jiii'] = function () {
        return (dynCall_jiii = Module['dynCall_jiii'] = Module['asm']['eb']).apply(null, arguments);
      });
      var dynCall_iiiijj = (Module['dynCall_iiiijj'] = function () {
        return (dynCall_iiiijj = Module['dynCall_iiiijj'] = Module['asm']['fb']).apply(null, arguments);
      });
      var dynCall_viijj = (Module['dynCall_viijj'] = function () {
        return (dynCall_viijj = Module['dynCall_viijj'] = Module['asm']['gb']).apply(null, arguments);
      });
      var dynCall_viiijjjj = (Module['dynCall_viiijjjj'] = function () {
        return (dynCall_viiijjjj = Module['dynCall_viiijjjj'] = Module['asm']['hb']).apply(null, arguments);
      });
      var dynCall_iijjiiii = (Module['dynCall_iijjiiii'] = function () {
        return (dynCall_iijjiiii = Module['dynCall_iijjiiii'] = Module['asm']['ib']).apply(null, arguments);
      });
      var dynCall_jiji = (Module['dynCall_jiji'] = function () {
        return (dynCall_jiji = Module['dynCall_jiji'] = Module['asm']['jb']).apply(null, arguments);
      });
      var dynCall_j = (Module['dynCall_j'] = function () {
        return (dynCall_j = Module['dynCall_j'] = Module['asm']['kb']).apply(null, arguments);
      });
      var dynCall_viijii = (Module['dynCall_viijii'] = function () {
        return (dynCall_viijii = Module['dynCall_viijii'] = Module['asm']['lb']).apply(null, arguments);
      });
      var dynCall_jiiii = (Module['dynCall_jiiii'] = function () {
        return (dynCall_jiiii = Module['dynCall_jiiii'] = Module['asm']['mb']).apply(null, arguments);
      });
      var dynCall_iiiiij = (Module['dynCall_iiiiij'] = function () {
        return (dynCall_iiiiij = Module['dynCall_iiiiij'] = Module['asm']['nb']).apply(null, arguments);
      });
      var dynCall_iiiiijj = (Module['dynCall_iiiiijj'] = function () {
        return (dynCall_iiiiijj = Module['dynCall_iiiiijj'] = Module['asm']['ob']).apply(null, arguments);
      });
      var dynCall_iiiiiijj = (Module['dynCall_iiiiiijj'] = function () {
        return (dynCall_iiiiiijj = Module['dynCall_iiiiiijj'] = Module['asm']['pb']).apply(null, arguments);
      });
      function invoke_ii(index, a1) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iii(index, a1, a2) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_vi(index, a1) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_vii(index, a1, a2) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_i(index) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)();
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_fi(index, a1) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiii(index, a1, a2, a3, a4, a5) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiidi(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_v(index) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)();
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiidi(index, a1, a2, a3, a4, a5, a6) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiidiii(index, a1, a2, a3, a4, a5, a6, a7) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viid(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viidi(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iidii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_fiii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_diii(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_viiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
        var sp = stackSave();
        try {
          getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_j(index) {
        var sp = stackSave();
        try {
          return dynCall_j(index);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      function invoke_jiiii(index, a1, a2, a3, a4) {
        var sp = stackSave();
        try {
          return dynCall_jiiii(index, a1, a2, a3, a4);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      var calledRun;
      function ExitStatus(status) {
        this.name = 'ExitStatus';
        this.message = 'Program terminated with exit(' + status + ')';
        this.status = status;
      }
      dependenciesFulfilled = function runCaller() {
        if (!calledRun) run();
        if (!calledRun) dependenciesFulfilled = runCaller;
      };
      function run(args) {
        args = args || arguments_;
        if (runDependencies > 0) {
          return;
        }
        preRun();
        if (runDependencies > 0) {
          return;
        }
        function doRun() {
          if (calledRun) return;
          calledRun = true;
          Module['calledRun'] = true;
          if (ABORT) return;
          initRuntime();
          readyPromiseResolve(Module);
          if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
          postRun();
        }
        if (Module['setStatus']) {
          Module['setStatus']('Running...');
          setTimeout(function () {
            setTimeout(function () {
              Module['setStatus']('');
            }, 1);
            doRun();
          }, 1);
        } else {
          doRun();
        }
      }
      Module['run'] = run;
      function exit(status, implicit) {
        EXITSTATUS = status;
        if (!keepRuntimeAlive()) {
          exitRuntime();
        }
        procExit(status);
      }
      function procExit(code) {
        EXITSTATUS = code;
        if (!keepRuntimeAlive()) {
          if (Module['onExit']) Module['onExit'](code);
          ABORT = true;
        }
        quit_(code, new ExitStatus(code));
      }
      if (Module['preInit']) {
        if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
        while (Module['preInit'].length > 0) {
          Module['preInit'].pop()();
        }
      }
      run();

      return Module.ready;
    };
  })();
  createWasmMonoInstance = Module;
}
!(function () {
  'use strict';
  var e = Object.defineProperty,
    a = (t, r, n) => (
      ((t, r, n) => {
        r in t ? e(t, r, { enumerable: !0, configurable: !0, writable: !0, value: n }) : (t[r] = n);
      })(t, 'symbol' != typeof r ? r + '' : r, n),
      n
    );
  class l {}
  a(l, 'updates', { transformer_new: 'New transformer', transformer_null: 'Null transformer' }),
    a(l, 'errors', {
      transformer_none: 'No transformers provided',
      transformer_start: 'Cannot start transformer',
      transformer_transform: 'Cannot transform frame',
      transformer_flush: 'Cannot flush transformer',
      readable_null: 'Readable is null',
      writable_null: 'Writable is null',
    });
  const t = new WeakMap(),
    r = new WeakMap(),
    n = new WeakMap(),
    c = Symbol('anyProducer'),
    f = Promise.resolve(),
    h = Symbol('listenerAdded'),
    u = Symbol('listenerRemoved');
  let d = !1;
  function g(e) {
    if ('string' != typeof e && 'symbol' != typeof e) throw new TypeError('eventName must be a string or a symbol');
  }
  function T(e) {
    if ('function' != typeof e) throw new TypeError('listener must be a function');
  }
  function _(e, t) {
    const n = r.get(e);
    return n.has(t) || n.set(t, new Set()), n.get(t);
  }
  function b(e, t) {
    const r = 'string' == typeof t || 'symbol' == typeof t ? t : c,
      f = n.get(e);
    return f.has(r) || f.set(r, new Set()), f.get(r);
  }
  function $(e, t) {
    t = Array.isArray(t) ? t : [t];
    let r = !1,
      s = () => {},
      n = [];
    const c = {
      enqueue(e) {
        n.push(e), s();
      },
      finish() {
        (r = !0), s();
      },
    };
    for (const f of t) b(e, f).add(c);
    return {
      async next() {
        return n
          ? 0 === n.length
            ? r
              ? ((n = void 0), this.next())
              : (await new Promise((e) => {
                  s = e;
                }),
                this.next())
            : { done: !1, value: await n.shift() }
          : { done: !0 };
      },
      async return(r) {
        n = void 0;
        for (const n of t) b(e, n).delete(c);
        return s(), arguments.length > 0 ? { done: !0, value: await r } : { done: !0 };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
  function H(e) {
    if (void 0 === e) return p;
    if (!Array.isArray(e)) throw new TypeError('`methodNames` must be an array of strings');
    for (const t of e)
      if (!p.includes(t))
        throw 'string' != typeof t ? new TypeError('`methodNames` element must be a string') : new Error(`${t} is not Emittery method`);
    return e;
  }
  const I = (e) => e === h || e === u;
  class m {
    static mixin(e, t) {
      return (
        (t = H(t)),
        (r) => {
          if ('function' != typeof r) throw new TypeError('`target` must be function');
          for (const e of t) if (void 0 !== r.prototype[e]) throw new Error(`The property \`${e}\` already exists on \`target\``);
          Object.defineProperty(r.prototype, e, {
            enumerable: !1,
            get: function o() {
              return Object.defineProperty(this, e, { enumerable: !1, value: new m() }), this[e];
            },
          });
          const i = (t) =>
            function (...r) {
              return this[e][t](...r);
            };
          for (const e of t) Object.defineProperty(r.prototype, e, { enumerable: !1, value: i(e) });
          return r;
        }
      );
    }
    static get isDebugEnabled() {
      if ('object' != typeof process) return d;
      const { env: e } = process || { env: {} };
      return 'emittery' === e.DEBUG || '*' === e.DEBUG || d;
    }
    static set isDebugEnabled(e) {
      d = e;
    }
    constructor(e = {}) {
      t.set(this, new Set()),
        r.set(this, new Map()),
        n.set(this, new Map()),
        (this.debug = e.debug || {}),
        void 0 === this.debug.enabled && (this.debug.enabled = !1),
        this.debug.logger ||
          (this.debug.logger = (e, t, r, n) => {
            try {
              n = JSON.stringify(n);
            } catch {
              n = `Object with the following keys failed to stringify: ${Object.keys(n).join(',')}`;
            }
            'symbol' == typeof r && (r = r.toString());
            const c = new Date(),
              f = `${c.getHours()}:${c.getMinutes()}:${c.getSeconds()}.${c.getMilliseconds()}`;
            console.log(`[${f}][emittery:${e}][${t}] Event Name: ${r}\n\tdata: ${n}`);
          });
    }
    logIfDebugEnabled(e, t, r) {
      (m.isDebugEnabled || this.debug.enabled) && this.debug.logger(e, this.debug.name, t, r);
    }
    on(e, t) {
      T(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e)
        g(r), _(this, r).add(t), this.logIfDebugEnabled('subscribe', r, void 0), I(r) || this.emit(h, { eventName: r, listener: t });
      return this.off.bind(this, e, t);
    }
    off(e, t) {
      T(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e)
        g(r), _(this, r).delete(t), this.logIfDebugEnabled('unsubscribe', r, void 0), I(r) || this.emit(u, { eventName: r, listener: t });
    }
    once(e) {
      return new Promise((t) => {
        const r = this.on(e, (e) => {
          r(), t(e);
        });
      });
    }
    events(e) {
      e = Array.isArray(e) ? e : [e];
      for (const t of e) g(t);
      return $(this, e);
    }
    async emit(e, r) {
      g(e),
        this.logIfDebugEnabled('emit', e, r),
        (function q(e, t, r) {
          const f = n.get(e);
          if (f.has(t)) for (const n of f.get(t)) n.enqueue(r);
          if (f.has(c)) {
            const e = Promise.all([t, r]);
            for (const t of f.get(c)) t.enqueue(e);
          }
        })(this, e, r);
      const h = _(this, e),
        u = t.get(this),
        d = [...h],
        p = I(e) ? [] : [...u];
      await f,
        await Promise.all([
          ...d.map(async (e) => {
            if (h.has(e)) return e(r);
          }),
          ...p.map(async (t) => {
            if (u.has(t)) return t(e, r);
          }),
        ]);
    }
    async emitSerial(e, r) {
      g(e), this.logIfDebugEnabled('emitSerial', e, r);
      const n = _(this, e),
        c = t.get(this),
        h = [...n],
        u = [...c];
      await f;
      for (const t of h) n.has(t) && (await t(r));
      for (const t of u) c.has(t) && (await t(e, r));
    }
    onAny(e) {
      return (
        T(e),
        this.logIfDebugEnabled('subscribeAny', void 0, void 0),
        t.get(this).add(e),
        this.emit(h, { listener: e }),
        this.offAny.bind(this, e)
      );
    }
    anyEvent() {
      return $(this);
    }
    offAny(e) {
      T(e), this.logIfDebugEnabled('unsubscribeAny', void 0, void 0), this.emit(u, { listener: e }), t.get(this).delete(e);
    }
    clearListeners(e) {
      e = Array.isArray(e) ? e : [e];
      for (const c of e)
        if ((this.logIfDebugEnabled('clear', c, void 0), 'string' == typeof c || 'symbol' == typeof c)) {
          _(this, c).clear();
          const e = b(this, c);
          for (const t of e) t.finish();
          e.clear();
        } else {
          t.get(this).clear();
          for (const e of r.get(this).values()) e.clear();
          for (const e of n.get(this).values()) {
            for (const t of e) t.finish();
            e.clear();
          }
        }
    }
    listenerCount(e) {
      e = Array.isArray(e) ? e : [e];
      let c = 0;
      for (const f of e)
        if ('string' != typeof f) {
          typeof f < 'u' && g(f), (c += t.get(this).size);
          for (const e of r.get(this).values()) c += e.size;
          for (const e of n.get(this).values()) c += e.size;
        } else c += t.get(this).size + _(this, f).size + b(this, f).size + b(this).size;
      return c;
    }
    bindMethods(e, t) {
      if ('object' != typeof e || null === e) throw new TypeError('`target` must be an object');
      t = H(t);
      for (const r of t) {
        if (void 0 !== e[r]) throw new Error(`The property \`${r}\` already exists on \`target\``);
        Object.defineProperty(e, r, { enumerable: !1, value: this[r].bind(this) });
      }
    }
  }
  const p = Object.getOwnPropertyNames(m.prototype).filter((e) => 'constructor' !== e);
  Object.defineProperty(m, 'listenerAdded', { value: h, writable: !1, enumerable: !0, configurable: !1 }),
    Object.defineProperty(m, 'listenerRemoved', { value: u, writable: !1, enumerable: !0, configurable: !1 });
  var y = m;
  function v(e) {
    return (function X(e) {
      if (
        (function J(e) {
          return 'object' == typeof e && null !== e && 'message' in e && 'string' == typeof e.message;
        })(e)
      )
        return e;
      try {
        return new Error(JSON.stringify(e));
      } catch {
        return new Error(String(e));
      }
    })(e).message;
  }
  var E = Object.defineProperty,
    N = (e, t, r) => (
      ((e, t, r) => {
        t in e ? E(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : (e[t] = r);
      })(e, 'symbol' != typeof t ? t + '' : t, r),
      r
    );
  let A;
  const S = new Uint8Array(16);
  function ie() {
    if (!A && ((A = typeof crypto < 'u' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)), !A))
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    return A(S);
  }
  const O = [];
  for (let Ce = 0; Ce < 256; ++Ce) O.push((Ce + 256).toString(16).slice(1));
  const M = { randomUUID: typeof crypto < 'u' && crypto.randomUUID && crypto.randomUUID.bind(crypto) };
  function ce(e, t, r) {
    if (M.randomUUID && !t && !e) return M.randomUUID();
    const n = (e = e || {}).random || (e.rng || ie)();
    if (((n[6] = (15 & n[6]) | 64), (n[8] = (63 & n[8]) | 128), t)) {
      r = r || 0;
      for (let e = 0; e < 16; ++e) t[r + e] = n[e];
      return t;
    }
    return (function ne(e, t = 0) {
      return (
        O[e[t + 0]] +
        O[e[t + 1]] +
        O[e[t + 2]] +
        O[e[t + 3]] +
        '-' +
        O[e[t + 4]] +
        O[e[t + 5]] +
        '-' +
        O[e[t + 6]] +
        O[e[t + 7]] +
        '-' +
        O[e[t + 8]] +
        O[e[t + 9]] +
        '-' +
        O[e[t + 10]] +
        O[e[t + 11]] +
        O[e[t + 12]] +
        O[e[t + 13]] +
        O[e[t + 14]] +
        O[e[t + 15]]
      ).toLowerCase();
    })(n);
  }
  function W(e, t) {
    globalThis.vonage || (globalThis.vonage = {}), globalThis.vonage.workerizer || (globalThis.vonage.workerizer = {});
    let r = globalThis.vonage.workerizer;
    return r[e] || (r[e] = t), r[e];
  }
  const k = W('globals', {});
  var R = ((e) => ((e.INIT = 'INIT'), (e.FORWARD = 'FORWARD'), (e.TERMINATE = 'TERMINATE'), (e.GLOBALS_SYNC = 'GLOBALS_SYNC'), e))(R || {});
  function j(e) {
    return [ImageBitmap, ReadableStream, WritableStream].some((t) => e instanceof t);
  }
  let x = 0;
  function le(e, t, r, n, c) {
    const f = x++;
    return (
      e.postMessage(
        { id: f, type: t, functionName: r, args: n },
        n.filter((e) => j(e))
      ),
      new Promise((e) => {
        null == c || c.set(f, e);
      })
    );
  }
  function w(e, t) {
    const { id: r, type: n } = e,
      c = Array.isArray(t) ? t : [t];
    postMessage(
      { id: r, type: n, result: t },
      c.filter((e) => j(e))
    );
  }
  const L = W('workerized', {});
  function B() {
    return typeof WorkerGlobalScope < 'u' && self instanceof WorkerGlobalScope;
  }
  function P(e, t) {
    if (Array.isArray(t)) t.splice(0, t.length);
    else if ('object' == typeof t) for (const r in t) delete t[r];
    for (const r in e)
      Array.isArray(e[r]) ? ((t[r] = []), P(e[r], t[r])) : 'object' == typeof e[r] ? ((t[r] = {}), P(e[r], t[r])) : (t[r] = e[r]);
  }
  const z = W('registeredWorkers', {});
  function ye(e, t) {
    return (
      k[e] || (k[e] = t),
      [
        () => k[e],
        async (t) => {
          (k[e] = t),
            await (async function ue() {
              if (B()) w({ type: R.GLOBALS_SYNC }, k);
              else {
                const e = [];
                for (const t in L) {
                  const { worker: r, resolvers: n } = L[t].workerContext;
                  r && e.push(le(r, R.GLOBALS_SYNC, '', [k], n));
                }
                await Promise.all(e);
              }
            })();
        },
      ]
    );
  }
  B() &&
    (function _e() {
      const e = {};
      onmessage = async (t) => {
        const r = t.data;
        switch (r.type) {
          case R.INIT:
            !(function de(e, t) {
              if (!e.args) throw 'Missing className while initializing worker';
              const [r, n] = e.args,
                c = z[r];
              if (!c) throw `unknown worker class ${r}`;
              (t.instance = new c(e.args.slice(1))), P(n, k), w(e, void 0 !== typeof t.instance);
            })(r, e);
            break;
          case R.FORWARD:
            !(async function he(e, t) {
              const { functionName: r, args: n } = e;
              if (!t.instance) throw 'instance not initialized';
              if (!r) throw 'missing function name to call';
              if (!t.instance[r]) throw `undefined function [${r}] in class ${t.instance.constructor.workerId}`;
              w(e, await t.instance[r](...(null != n ? n : [])));
            })(r, e);
            break;
          case R.TERMINATE:
            !(async function me(e, t) {
              const { args: r } = e;
              if (!t.instance) throw 'instance not initialized';
              let n;
              t.instance.terminate && (n = await t.instance.terminate(...(null != r ? r : []))), w(e, n);
            })(r, e);
            break;
          case R.GLOBALS_SYNC:
            !(function ge(e) {
              if (!e.args) throw 'Missing globals while syncing';
              P(e.args[0], k), w(e, {});
            })(r);
        }
      };
    })();
  const [F, U] = (function be(e, t) {
    return ye(e, t);
  })('metadata');
  function C() {
    return F();
  }
  class D {
    constructor(e) {
      N(this, 'uuid', ce()), (this.config = e);
    }
    async send(e) {
      var t, r, n;
      const { appId: c, sourceType: f } = null != (t = C()) ? t : {};
      if (!c || !f) return 'metadata missing';
      const h = new AbortController(),
        u = setTimeout(() => h.abort(), 1e4);
      return (
        await (null != (n = null == (r = this.config) ? void 0 : r.fetch) ? n : fetch)(this.getUrl(), {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(this.buildReport(e)),
          signal: h.signal,
        }),
        clearTimeout(u),
        'success'
      );
    }
    getUrl() {
      var e;
      let t = null != (e = C().proxyUrl) ? e : 'https://';
      return (t += ('/' === t.at(-1) ? '' : '/') + 'hlg.tokbox.com/prod/logging/vcp_webrtc'), t;
    }
    getHeaders() {
      return { 'Content-Type': 'application/json' };
    }
    buildReport(e) {
      const t = C();
      return { guid: this.uuid, ...e, applicationId: t.appId, timestamp: Date.now(), proxyUrl: t.proxyUrl, source: t.sourceType };
    }
  }
  const G = '2.0.3';
  class Se {
    constructor(e) {
      a(this, 'frameTransformedCount', 0),
        a(this, 'frameFromSourceCount', 0),
        a(this, 'startAt', 0),
        a(this, 'reporter'),
        (this.config = e),
        (this.reporter = new D(e));
    }
    async onFrameFromSource() {
      this.frameFromSourceCount++;
    }
    get fps() {
      const { startAt: e, frameFromSourceCount: t } = this;
      return t / ((Date.now() - e) / 1e3);
    }
    async onFrameTransformed(e = {}, t = !1) {
      0 === this.startAt && (this.startAt = Date.now()), this.frameTransformedCount++;
      const { startAt: r, frameTransformedCount: n, frameFromSourceCount: c } = this,
        f = Date.now(),
        h = (f - r) / 1e3,
        u = n / h,
        d = c / h;
      return t || this.frameTransformedCount >= this.config.loggingIntervalFrameCount
        ? ((this.frameFromSourceCount = 0),
          (this.frameTransformedCount = 0),
          (this.startAt = f),
          (this.reporter.config = this.config),
          this.reporter.send({ ...this.config.report, variation: 'QoS', fps: d, transformedFps: u, framesTransformed: n, ...e }))
        : 'success';
    }
  }
  var Q = ((e) => (
    (e.pipeline_ended = 'pipeline_ended'),
    (e.pipeline_ended_with_error = 'pipeline_ended_with_error'),
    (e.pipeline_started = 'pipeline_started'),
    (e.pipeline_started_with_error = 'pipeline_started_with_error'),
    (e.pipeline_restarted = 'pipeline_restarted'),
    (e.pipeline_restarted_with_error = 'pipeline_restarted_with_error'),
    e
  ))(Q || {});
  class Pe extends y {
    constructor(e, t) {
      super(),
        a(this, 'reporter_', new D()),
        a(this, 'reporterQos_', new Se({ loggingIntervalFrameCount: 500, report: { version: G } })),
        a(this, 'transformerType_'),
        a(this, 'transformer_'),
        a(this, 'shouldStop_'),
        a(this, 'isFlashed_'),
        a(this, 'mediaTransformerQosReportStartTimestamp_'),
        a(this, 'videoHeight_'),
        a(this, 'videoWidth_'),
        a(this, 'trackExpectedRate_'),
        a(this, 'index_'),
        a(this, 'controller_'),
        (this.index_ = t),
        (this.transformer_ = e),
        (this.shouldStop_ = !1),
        (this.isFlashed_ = !1),
        (this.mediaTransformerQosReportStartTimestamp_ = 0),
        (this.videoHeight_ = 0),
        (this.videoWidth_ = 0),
        (this.trackExpectedRate_ = -1),
        (this.transformerType_ = 'Custom'),
        'getTransformerType' in e && (this.transformerType_ = e.getTransformerType()),
        this.report({ variation: 'Create' });
    }
    setTrackExpectedRate(e) {
      this.trackExpectedRate_ = e;
    }
    async start(e) {
      if (((this.controller_ = e), this.transformer_ && 'function' == typeof this.transformer_.start))
        try {
          await this.transformer_.start(e);
        } catch (t) {
          this.report({ message: l.errors.transformer_start, variation: 'Error', error: v(t) });
          const e = { eventMetaData: { transformerIndex: this.index_ }, error: t, function: 'start' };
          this.emit('error', e);
        }
    }
    async transform(e, t) {
      var r, n, c, f;
      if (
        (0 === this.mediaTransformerQosReportStartTimestamp_ && (this.mediaTransformerQosReportStartTimestamp_ = Date.now()),
        e instanceof VideoFrame &&
          ((this.videoHeight_ = null != (r = null == e ? void 0 : e.displayHeight) ? r : 0),
          (this.videoWidth_ = null != (n = null == e ? void 0 : e.displayWidth) ? n : 0)),
        this.reporterQos_.onFrameFromSource(),
        this.transformer_)
      )
        if (this.shouldStop_) console.warn('[Pipeline] flush from transform'), e.close(), this.flush(t), t.terminate();
        else {
          try {
            await (null == (f = (c = this.transformer_).transform) ? void 0 : f.call(c, e, t)), this.reportQos();
          } catch (h) {
            this.report({ message: l.errors.transformer_transform, variation: 'Error', error: v(h) });
            const e = { eventMetaData: { transformerIndex: this.index_ }, error: h, function: 'transform' };
            this.emit('error', e);
          }
          if (-1 != this.trackExpectedRate_ && 0.8 * this.trackExpectedRate_ > this.reporterQos_.fps) {
            const e = {
              eventMetaData: { transformerIndex: this.index_ },
              warningType: 'fps_drop',
              dropInfo: { requested: this.trackExpectedRate_, current: this.reporterQos_.fps },
            };
            this.emit('warn', e);
          }
        }
    }
    async flush(e) {
      if (this.transformer_ && 'function' == typeof this.transformer_.flush && !this.isFlashed_) {
        this.isFlashed_ = !0;
        try {
          await this.transformer_.flush(e);
        } catch (t) {
          this.report({ message: l.errors.transformer_flush, variation: 'Error', error: v(t) });
          const e = { eventMetaData: { transformerIndex: this.index_ }, error: t, function: 'flush' };
          this.emit('error', e);
        }
      }
      this.reportQos(!0), this.report({ variation: 'Delete' });
    }
    stop() {
      console.log('[Pipeline] Stop stream.'),
        this.controller_ && (this.flush(this.controller_), this.controller_.terminate()),
        (this.shouldStop_ = !0);
    }
    report(e) {
      this.reporter_.send({ version: G, action: 'MediaTransformer', transformerType: this.transformerType_, ...e });
    }
    reportQos(e = !1) {
      (this.reporterQos_.config = { ...this.reporterQos_.config }),
        this.reporterQos_.onFrameTransformed(
          {
            version: G,
            action: 'MediaTransformer',
            transformerType: this.transformerType_,
            videoWidth: this.videoWidth_,
            videoHeight: this.videoHeight_,
          },
          e
        );
    }
  }
  class Me extends y {
    constructor(e) {
      super(), a(this, 'transformers_'), a(this, 'trackExpectedRate_'), (this.transformers_ = []), (this.trackExpectedRate_ = -1);
      for (let t = 0; t < e.length; t++) {
        let r = new Pe(e[t], t);
        r.on('error', (e) => {
          this.emit('error', e);
        }),
          r.on('warn', (e) => {
            this.emit('warn', e);
          }),
          this.transformers_.push(r);
      }
    }
    setTrackExpectedRate(e) {
      this.trackExpectedRate_ = e;
      for (let t of this.transformers_) t.setTrackExpectedRate(this.trackExpectedRate_);
    }
    async start(e, t) {
      if (this.transformers_ && 0 !== this.transformers_.length) {
        try {
          let r = e;
          for (let t of this.transformers_) e = e.pipeThrough(new TransformStream(t));
          e.pipeTo(t)
            .then(async () => {
              console.log('[Pipeline] Setup.'), await t.abort(), await r.cancel(), this.emit('pipelineInfo', 'pipeline_ended');
            })
            .catch(async (n) => {
              e
                .cancel()
                .then(() => {
                  console.log('[Pipeline] Shutting down streams after abort.');
                })
                .catch((e) => {
                  console.error('[Pipeline] Error from stream transform:', e);
                }),
                await t.abort(n),
                await r.cancel(n),
                this.emit('pipelineInfo', 'pipeline_ended_with_error');
            });
        } catch {
          return this.emit('pipelineInfo', 'pipeline_started_with_error'), void this.destroy();
        }
        this.emit('pipelineInfo', 'pipeline_started'), console.log('[Pipeline] Pipeline started.');
      } else console.log('[Pipeline] No transformers.');
    }
    async destroy() {
      console.log('[Pipeline] Destroying Pipeline.');
      for (let e of this.transformers_) e.stop();
    }
  }
  class Oe extends y {
    constructor() {
      super(),
        a(this, 'reporter_'),
        a(this, 'pipeline_'),
        a(this, 'transformers_'),
        a(this, 'readable_'),
        a(this, 'writable_'),
        a(this, 'trackExpectedRate_'),
        (this.reporter_ = new D()),
        (this.trackExpectedRate_ = -1),
        this.report({ variation: 'Create' });
    }
    setTrackExpectedRate(e) {
      (this.trackExpectedRate_ = e), this.pipeline_ && this.pipeline_.setTrackExpectedRate(this.trackExpectedRate_);
    }
    transform(e, t) {
      return (this.readable_ = e), (this.writable_ = t), this.transformInternal();
    }
    transformInternal() {
      return new Promise(async (e, t) => {
        if (!this.transformers_ || 0 === this.transformers_.length)
          return (
            this.report({ message: l.errors.transformer_none, variation: 'Error' }), void t('[MediaProcessor] Need to set transformers.')
          );
        if (!this.readable_)
          return this.report({ variation: 'Error', message: l.errors.readable_null }), void t('[MediaProcessor] Readable is null.');
        if (!this.writable_)
          return this.report({ variation: 'Error', message: l.errors.writable_null }), void t('[MediaProcessor] Writable is null.');
        let r = !1;
        this.pipeline_ && ((r = !0), this.pipeline_.clearListeners(), this.pipeline_.destroy()),
          (this.pipeline_ = new Me(this.transformers_)),
          this.pipeline_.on('warn', (e) => {
            this.emit('warn', e);
          }),
          this.pipeline_.on('error', (e) => {
            this.emit('error', e);
          }),
          this.pipeline_.on('pipelineInfo', (e) => {
            r &&
              ('pipeline_started' === e
                ? (e = Q.pipeline_restarted)
                : 'pipeline_started_with_error' === e && (e = Q.pipeline_restarted_with_error)),
              this.emit('pipelineInfo', e);
          }),
          -1 != this.trackExpectedRate_ && this.pipeline_.setTrackExpectedRate(this.trackExpectedRate_),
          this.pipeline_
            .start(this.readable_, this.writable_)
            .then(() => {
              e();
            })
            .catch((e) => {
              t(e);
            });
      });
    }
    setTransformers(e) {
      return (
        this.report({ variation: 'Update', message: l.updates.transformer_new }),
        (this.transformers_ = e),
        this.readable_ && this.writable_ ? this.transformInternal() : Promise.resolve()
      );
    }
    destroy() {
      return new Promise(async (e) => {
        this.pipeline_ && this.pipeline_.destroy(), this.report({ variation: 'Delete' }), e();
      });
    }
    report(e) {
      this.reporter_.send({ version: G, action: 'MediaProcessor', ...e });
    }
  }
  const V = new WeakMap(),
    Y = new WeakMap(),
    K = new WeakMap(),
    Z = Symbol('anyProducer'),
    ee = Promise.resolve(),
    te = Symbol('listenerAdded'),
    re = Symbol('listenerRemoved');
  let se = !1,
    oe = !1;
  function assertEventName$1(e) {
    if ('string' != typeof e && 'symbol' != typeof e && 'number' != typeof e)
      throw new TypeError('`eventName` must be a string, symbol, or number');
  }
  function assertListener$1(e) {
    if ('function' != typeof e) throw new TypeError('listener must be a function');
  }
  function getListeners$1(e, t) {
    const r = Y.get(e);
    if (r.has(t)) return r.get(t);
  }
  function getEventProducers$1(e, t) {
    const r = 'string' == typeof t || 'symbol' == typeof t || 'number' == typeof t ? t : Z,
      n = K.get(e);
    if (n.has(r)) return n.get(r);
  }
  function iterator$1(e, t) {
    t = Array.isArray(t) ? t : [t];
    let r = !1,
      flush = () => {},
      n = [];
    const c = {
      enqueue(e) {
        n.push(e), flush();
      },
      finish() {
        (r = !0), flush();
      },
    };
    for (const f of t) {
      let t = getEventProducers$1(e, f);
      if (!t) {
        t = new Set();
        K.get(e).set(f, t);
      }
      t.add(c);
    }
    return {
      async next() {
        return n
          ? 0 === n.length
            ? r
              ? ((n = void 0), this.next())
              : (await new Promise((e) => {
                  flush = e;
                }),
                this.next())
            : { done: !1, value: await n.shift() }
          : { done: !0 };
      },
      async return(r) {
        n = void 0;
        for (const n of t) {
          const t = getEventProducers$1(e, n);
          if (t && (t.delete(c), 0 === t.size)) {
            K.get(e).delete(n);
          }
        }
        return flush(), arguments.length > 0 ? { done: !0, value: await r } : { done: !0 };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
  function defaultMethodNamesOrAssert$1(e) {
    if (void 0 === e) return fe;
    if (!Array.isArray(e)) throw new TypeError('`methodNames` must be an array of strings');
    for (const t of e)
      if (!fe.includes(t)) {
        if ('string' != typeof t) throw new TypeError('`methodNames` element must be a string');
        throw new Error(`${t} is not Emittery method`);
      }
    return e;
  }
  const isMetaEvent$1 = (e) => e === te || e === re;
  function emitMetaEvent$1(e, t, r) {
    if (isMetaEvent$1(t))
      try {
        (se = !0), e.emit(t, r);
      } finally {
        se = !1;
      }
  }
  let ae = class Emittery2 {
    static mixin(e, t) {
      return (
        (t = defaultMethodNamesOrAssert$1(t)),
        (r) => {
          if ('function' != typeof r) throw new TypeError('`target` must be function');
          for (const e of t) if (void 0 !== r.prototype[e]) throw new Error(`The property \`${e}\` already exists on \`target\``);
          Object.defineProperty(r.prototype, e, {
            enumerable: !1,
            get: function getEmitteryProperty() {
              return Object.defineProperty(this, e, { enumerable: !1, value: new Emittery2() }), this[e];
            },
          });
          const emitteryMethodCaller = (t) =>
            function (...r) {
              return this[e][t](...r);
            };
          for (const e of t) Object.defineProperty(r.prototype, e, { enumerable: !1, value: emitteryMethodCaller(e) });
          return r;
        }
      );
    }
    static get isDebugEnabled() {
      if ('object' != typeof globalThis.process?.env) return oe;
      const { env: e } = globalThis.process ?? { env: {} };
      return 'emittery' === e.DEBUG || '*' === e.DEBUG || oe;
    }
    static set isDebugEnabled(e) {
      oe = e;
    }
    constructor(e = {}) {
      V.set(this, new Set()),
        Y.set(this, new Map()),
        K.set(this, new Map()),
        K.get(this).set(Z, new Set()),
        (this.debug = e.debug ?? {}),
        void 0 === this.debug.enabled && (this.debug.enabled = !1),
        this.debug.logger ||
          (this.debug.logger = (e, t, r, n) => {
            try {
              n = JSON.stringify(n);
            } catch {
              n = `Object with the following keys failed to stringify: ${Object.keys(n).join(',')}`;
            }
            ('symbol' != typeof r && 'number' != typeof r) || (r = r.toString());
            const c = new Date(),
              f = `${c.getHours()}:${c.getMinutes()}:${c.getSeconds()}.${c.getMilliseconds()}`;
            console.log(`[${f}][emittery:${e}][${t}] Event Name: ${r}\n\tdata: ${n}`);
          });
    }
    logIfDebugEnabled(e, t, r) {
      (Emittery2.isDebugEnabled || this.debug.enabled) && this.debug.logger(e, this.debug.name, t, r);
    }
    on(e, t) {
      assertListener$1(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e) {
        assertEventName$1(r);
        let e = getListeners$1(this, r);
        if (!e) {
          e = new Set();
          Y.get(this).set(r, e);
        }
        e.add(t),
          this.logIfDebugEnabled('subscribe', r, void 0),
          isMetaEvent$1(r) || emitMetaEvent$1(this, te, { eventName: r, listener: t });
      }
      return this.off.bind(this, e, t);
    }
    off(e, t) {
      assertListener$1(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e) {
        assertEventName$1(r);
        const e = getListeners$1(this, r);
        if (e && (e.delete(t), 0 === e.size)) {
          Y.get(this).delete(r);
        }
        this.logIfDebugEnabled('unsubscribe', r, void 0), isMetaEvent$1(r) || emitMetaEvent$1(this, re, { eventName: r, listener: t });
      }
    }
    once(e) {
      let t;
      const r = new Promise((r) => {
        t = this.on(e, (e) => {
          t(), r(e);
        });
      });
      return (r.off = t), r;
    }
    events(e) {
      e = Array.isArray(e) ? e : [e];
      for (const t of e) assertEventName$1(t);
      return iterator$1(this, e);
    }
    async emit(e, t) {
      if ((assertEventName$1(e), isMetaEvent$1(e) && !se))
        throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
      this.logIfDebugEnabled('emit', e, t),
        (function enqueueProducers$1(e, t, r) {
          const n = K.get(e);
          if (n.has(t)) for (const c of n.get(t)) c.enqueue(r);
          if (n.has(Z)) {
            const e = Promise.all([t, r]);
            for (const t of n.get(Z)) t.enqueue(e);
          }
        })(this, e, t);
      const r = getListeners$1(this, e) ?? new Set(),
        n = V.get(this),
        c = [...r],
        f = isMetaEvent$1(e) ? [] : [...n];
      await ee,
        await Promise.all([
          ...c.map(async (e) => {
            if (r.has(e)) return e(t);
          }),
          ...f.map(async (r) => {
            if (n.has(r)) return r(e, t);
          }),
        ]);
    }
    async emitSerial(e, t) {
      if ((assertEventName$1(e), isMetaEvent$1(e) && !se))
        throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
      this.logIfDebugEnabled('emitSerial', e, t);
      const r = getListeners$1(this, e) ?? new Set(),
        n = V.get(this),
        c = [...r],
        f = [...n];
      await ee;
      for (const h of c) r.has(h) && (await h(t));
      for (const h of f) n.has(h) && (await h(e, t));
    }
    onAny(e) {
      return (
        assertListener$1(e),
        this.logIfDebugEnabled('subscribeAny', void 0, void 0),
        V.get(this).add(e),
        emitMetaEvent$1(this, te, { listener: e }),
        this.offAny.bind(this, e)
      );
    }
    anyEvent() {
      return iterator$1(this);
    }
    offAny(e) {
      assertListener$1(e),
        this.logIfDebugEnabled('unsubscribeAny', void 0, void 0),
        emitMetaEvent$1(this, re, { listener: e }),
        V.get(this).delete(e);
    }
    clearListeners(e) {
      e = Array.isArray(e) ? e : [e];
      for (const t of e)
        if ((this.logIfDebugEnabled('clear', t, void 0), 'string' == typeof t || 'symbol' == typeof t || 'number' == typeof t)) {
          const e = getListeners$1(this, t);
          e && e.clear();
          const r = getEventProducers$1(this, t);
          if (r) {
            for (const e of r) e.finish();
            r.clear();
          }
        } else {
          V.get(this).clear();
          for (const [e, t] of Y.get(this).entries()) t.clear(), Y.get(this).delete(e);
          for (const [e, t] of K.get(this).entries()) {
            for (const e of t) e.finish();
            t.clear(), K.get(this).delete(e);
          }
        }
    }
    listenerCount(e) {
      e = Array.isArray(e) ? e : [e];
      let t = 0;
      for (const r of e)
        if ('string' != typeof r) {
          void 0 !== r && assertEventName$1(r), (t += V.get(this).size);
          for (const e of Y.get(this).values()) t += e.size;
          for (const e of K.get(this).values()) t += e.size;
        } else
          t +=
            V.get(this).size +
            (getListeners$1(this, r)?.size ?? 0) +
            (getEventProducers$1(this, r)?.size ?? 0) +
            (getEventProducers$1(this)?.size ?? 0);
      return t;
    }
    bindMethods(e, t) {
      if ('object' != typeof e || null === e) throw new TypeError('`target` must be an object');
      t = defaultMethodNamesOrAssert$1(t);
      for (const r of t) {
        if (void 0 !== e[r]) throw new Error(`The property \`${r}\` already exists on \`target\``);
        Object.defineProperty(e, r, { enumerable: !1, value: this[r].bind(this) });
      }
    }
  };
  const fe = Object.getOwnPropertyNames(ae.prototype).filter((e) => 'constructor' !== e);
  Object.defineProperty(ae, 'listenerAdded', { value: te, writable: !1, enumerable: !0, configurable: !1 }),
    Object.defineProperty(ae, 'listenerRemoved', { value: re, writable: !1, enumerable: !0, configurable: !1 });
  class Average {
    constructor(e) {
      (this.size = e), (this.values = []), (this.sum = 0);
    }
    push(e) {
      for (this.values.push(e), this.sum += e; this.size < this.values.length; ) this.sum -= this.values.shift() ?? 0;
    }
    value() {
      return this.sum / Math.max(1, this.values.length);
    }
  }
  class NoiseSuppressionTransformer extends ae {
    constructor() {
      super(),
        (this.isEnabled = !0),
        (this.internalResampleSupported = !1),
        (this.latency = new Average(100)),
        (this.transform = this.transformAudioData.bind(this));
    }
    async init(e) {
      console.log('Noise suppression transformer initialization'),
        (this.transform = e.debug ? this.transformDebug.bind(this) : this.transformAudioData.bind(this));
      const t = e.assetsDirBaseUrl ?? 'https://d3opqjmqzxf057.cloudfront.net/noise-suppression/1.0.0-beta.2',
        locateFile = (e) => `${t}/${e}`;
      let r,
        n = 1;
      (await this.isMonoThread(e))
        ? (this.wasmInstance = await createWasmMonoInstance({
            locateFile: locateFile,
            mainScriptUrlOrBlob: locateFile('main-bin-mono.js'),
          }))
        : ((this.wasmInstance = await createWasmMultiInstance({
            locateFile: locateFile,
            mainScriptUrlOrBlob: locateFile('main-bin-multi.js'),
          })),
          (n = 3)),
        (this.wasmTransformer = new this.wasmInstance.DtlnTransformer()),
        await Promise.all([this.loadModel(`${t}/model_1.tflite`, 1), this.loadModel(`${t}/model_2.tflite`, 2)]);
      try {
        r = this.wasmTransformer?.init(n);
      } catch (c) {
        if ('number' == typeof c) {
          let e = '';
          for (let t = 0; t < 500; ++t) e += String.fromCharCode(this.wasmInstance.HEAP8[c + t]);
          console.error(e);
        } else console.error(c);
      }
      if (0 !== r) {
        const e = `Fail to init wasm transformer, error code = ${r}`;
        throw (console.error(e), e);
      }
      if (((this.internalResampleSupported = this.wasmTransformer?.getInternalResampleSupported()), !this.internalResampleSupported)) {
        const e = 'Internal resampling not supported';
        throw (console.error(e), e);
      }
      console.log('Noise suppression transformer ready');
    }
    setAudioOptions(e, t, r, n, c) {
      this.wasmTransformer?.setAudioOptions(e, t, r, n, c);
    }
    enable() {
      this.isEnabled = !0;
    }
    disable() {
      this.isEnabled = !1;
    }
    getLatency() {
      return this.latency.value();
    }
    getWasmLatencyNs() {
      return this.wasmInstance.getLatencyNs();
    }
    async transformDebug(e, t) {
      try {
        const r = performance.now();
        await this.transformAudioData(e, t), this.latency.push(performance.now() - r);
      } catch (r) {
        console.error(r);
      }
    }
    async transformAudioData(e, t) {
      if ((this.wasmTransformer || this.emit('warning', 'transformer not initialized'), this.isEnabled && this.wasmTransformer))
        try {
          const t = this.getAudioDataAsFloat32(e),
            n = this.convertTypedArray(t, Int16Array, 32767);
          this.wasmTransformer.getInputFrame(e.numberOfFrames).set(n);
          let c = 0;
          try {
            c = this.wasmTransformer.runAlgorithm(e.numberOfFrames, e.sampleRate, e.numberOfChannels);
          } catch (r) {
            if ('number' == typeof r) {
              let e = '';
              for (let t = 0; t < 500; ++t) e += String.fromCharCode(this.wasmInstance.HEAP8[r + t]);
              console.error(e);
            } else console.error(r);
          }
          if (c > 0) {
            const t = this.wasmTransformer.getOutputFrame().slice(0, c),
              r = this.convertTypedArray(t, Float32Array, 1 / 32767),
              { timestamp: n, sampleRate: f, numberOfChannels: h } = e;
            e = new AudioData({
              data: r,
              format: 'f32-planar',
              numberOfChannels: h,
              numberOfFrames: r.length,
              sampleRate: f,
              timestamp: n,
            });
          }
        } catch (r) {
          console.error(r);
        }
      t.enqueue(e);
    }
    async loadModel(e, t) {
      if (!this.wasmTransformer) return;
      const r = await fetch(e),
        n = await r.arrayBuffer(),
        c = n.byteLength,
        f = `getModel${t}`,
        h = this.wasmTransformer[f](c);
      if (h) {
        const e = new Uint8Array(n);
        h.set(e);
      }
    }
    getAudioDataAsFloat32(e) {
      return this.audioDataToTypedArray(e, Float32Array, 'f32-planar', 1);
    }
    audioDataToTypedArray(e, t, r, n = e.numberOfChannels) {
      const c = new t(e.numberOfFrames * n);
      for (let f = 0; f < n; ++f) {
        const t = e.numberOfFrames * f,
          n = c.subarray(t, t + e.numberOfFrames);
        e.copyTo(n, { planeIndex: f, format: r });
      }
      return c;
    }
    convertTypedArray(e, t, r) {
      const n = e.length,
        c = new t(n);
      for (let f = 0; f < n; ++f) c[f] = e[f] * r;
      return c;
    }
    isMonoThread(e) {
      if (e.disableWasmMultiThread) return !0;
      try {
        if (void 0 === new SharedArrayBuffer(1024)) throw new Error('not supported');
      } catch (t) {
        return (
          this.emit(
            'warning',
            '\nMultithread is not available, noise-suppresion is now running on a single thread.\nThis is impacting the performance and increase the latency.\n\nTo enable multithread, you need to serve the application via https with these http headers :\n   - Cross-Origin-Opener-Policy: same-origin\n   - Cross-Origin-Embedder-Policy: require-corp.\nMore info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements\n\nYou can disable this warning by enabling disableWasmMultiThread within the noiseSuppression options.\n'
          ),
          !0
        );
      }
      return !1;
    }
  }
  function createGlobalThisVariable(e, t) {
    globalThis.vonage || (globalThis.vonage = {}), globalThis.vonage.workerizer || (globalThis.vonage.workerizer = {});
    let r = globalThis.vonage.workerizer;
    return r[e] || (r[e] = t), r[e];
  }
  const pe = createGlobalThisVariable('globals', {});
  var we = ((e) => (
    (e.INIT = 'INIT'), (e.FORWARD = 'FORWARD'), (e.TERMINATE = 'TERMINATE'), (e.GLOBALS_SYNC = 'GLOBALS_SYNC'), (e.EVENT = 'EVENT'), e
  ))(we || {});
  function postCommand(e, t) {
    const { id: r, type: n } = e,
      c = Array.isArray(t) ? t : [t];
    postMessage(
      { id: r, type: n, result: t },
      c.filter((e) =>
        (function isTransferable(e) {
          return [ImageBitmap, ReadableStream, WritableStream].some((t) => e instanceof t);
        })(e)
      )
    );
  }
  function isWorker() {
    return 'undefined' != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope;
  }
  function copy(e, t) {
    if (Array.isArray(t)) t.splice(0, t.length);
    else if ('object' == typeof t) for (const r in t) delete t[r];
    for (const r in e)
      Array.isArray(e[r]) ? ((t[r] = []), copy(e[r], t[r])) : 'object' == typeof e[r] ? ((t[r] = {}), copy(e[r], t[r])) : (t[r] = e[r]);
  }
  createGlobalThisVariable('workerized', {});
  const ve = new WeakMap(),
    Ee = new WeakMap(),
    Te = new WeakMap(),
    Ae = Symbol('anyProducer'),
    Ne = Promise.resolve(),
    $e = Symbol('listenerAdded'),
    Ie = Symbol('listenerRemoved');
  let De = !1,
    ke = !1;
  function assertEventName(e) {
    if ('string' != typeof e && 'symbol' != typeof e && 'number' != typeof e)
      throw new TypeError('`eventName` must be a string, symbol, or number');
  }
  function assertListener(e) {
    if ('function' != typeof e) throw new TypeError('listener must be a function');
  }
  function getListeners(e, t) {
    const r = Ee.get(e);
    if (r.has(t)) return r.get(t);
  }
  function getEventProducers(e, t) {
    const r = 'string' == typeof t || 'symbol' == typeof t || 'number' == typeof t ? t : Ae,
      n = Te.get(e);
    if (n.has(r)) return n.get(r);
  }
  function iterator(e, t) {
    t = Array.isArray(t) ? t : [t];
    let r = !1,
      flush = () => {},
      n = [];
    const c = {
      enqueue(e) {
        n.push(e), flush();
      },
      finish() {
        (r = !0), flush();
      },
    };
    for (const f of t) {
      let t = getEventProducers(e, f);
      if (!t) {
        t = new Set();
        Te.get(e).set(f, t);
      }
      t.add(c);
    }
    return {
      async next() {
        return n
          ? 0 === n.length
            ? r
              ? ((n = void 0), this.next())
              : (await new Promise((e) => {
                  flush = e;
                }),
                this.next())
            : { done: !1, value: await n.shift() }
          : { done: !0 };
      },
      async return(r) {
        n = void 0;
        for (const n of t) {
          const t = getEventProducers(e, n);
          if (t && (t.delete(c), 0 === t.size)) {
            Te.get(e).delete(n);
          }
        }
        return flush(), arguments.length > 0 ? { done: !0, value: await r } : { done: !0 };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
  function defaultMethodNamesOrAssert(e) {
    if (void 0 === e) return Re;
    if (!Array.isArray(e)) throw new TypeError('`methodNames` must be an array of strings');
    for (const t of e)
      if (!Re.includes(t)) {
        if ('string' != typeof t) throw new TypeError('`methodNames` element must be a string');
        throw new Error(`${t} is not Emittery method`);
      }
    return e;
  }
  const isMetaEvent = (e) => e === $e || e === Ie;
  function emitMetaEvent(e, t, r) {
    if (isMetaEvent(t))
      try {
        (De = !0), e.emit(t, r);
      } finally {
        De = !1;
      }
  }
  class Emittery {
    static mixin(e, t) {
      return (
        (t = defaultMethodNamesOrAssert(t)),
        (r) => {
          if ('function' != typeof r) throw new TypeError('`target` must be function');
          for (const e of t) if (void 0 !== r.prototype[e]) throw new Error(`The property \`${e}\` already exists on \`target\``);
          Object.defineProperty(r.prototype, e, {
            enumerable: !1,
            get: function getEmitteryProperty() {
              return Object.defineProperty(this, e, { enumerable: !1, value: new Emittery() }), this[e];
            },
          });
          const emitteryMethodCaller = (t) =>
            function (...r) {
              return this[e][t](...r);
            };
          for (const e of t) Object.defineProperty(r.prototype, e, { enumerable: !1, value: emitteryMethodCaller(e) });
          return r;
        }
      );
    }
    static get isDebugEnabled() {
      var e, t;
      if ('object' != typeof (null == (e = globalThis.process) ? void 0 : e.env)) return ke;
      const { env: r } = null != (t = globalThis.process) ? t : { env: {} };
      return 'emittery' === r.DEBUG || '*' === r.DEBUG || ke;
    }
    static set isDebugEnabled(e) {
      ke = e;
    }
    constructor(e = {}) {
      var t;
      ve.set(this, new Set()),
        Ee.set(this, new Map()),
        Te.set(this, new Map()),
        Te.get(this).set(Ae, new Set()),
        (this.debug = null != (t = e.debug) ? t : {}),
        void 0 === this.debug.enabled && (this.debug.enabled = !1),
        this.debug.logger ||
          (this.debug.logger = (e, t, r, n) => {
            try {
              n = JSON.stringify(n);
            } catch {
              n = `Object with the following keys failed to stringify: ${Object.keys(n).join(',')}`;
            }
            ('symbol' != typeof r && 'number' != typeof r) || (r = r.toString());
            const c = new Date(),
              f = `${c.getHours()}:${c.getMinutes()}:${c.getSeconds()}.${c.getMilliseconds()}`;
            console.log(`[${f}][emittery:${e}][${t}] Event Name: ${r}\n\tdata: ${n}`);
          });
    }
    logIfDebugEnabled(e, t, r) {
      (Emittery.isDebugEnabled || this.debug.enabled) && this.debug.logger(e, this.debug.name, t, r);
    }
    on(e, t) {
      assertListener(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e) {
        assertEventName(r);
        let e = getListeners(this, r);
        if (!e) {
          e = new Set();
          Ee.get(this).set(r, e);
        }
        e.add(t), this.logIfDebugEnabled('subscribe', r, void 0), isMetaEvent(r) || emitMetaEvent(this, $e, { eventName: r, listener: t });
      }
      return this.off.bind(this, e, t);
    }
    off(e, t) {
      assertListener(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e) {
        assertEventName(r);
        const e = getListeners(this, r);
        if (e && (e.delete(t), 0 === e.size)) {
          Ee.get(this).delete(r);
        }
        this.logIfDebugEnabled('unsubscribe', r, void 0), isMetaEvent(r) || emitMetaEvent(this, Ie, { eventName: r, listener: t });
      }
    }
    once(e) {
      let t;
      const r = new Promise((r) => {
        t = this.on(e, (e) => {
          t(), r(e);
        });
      });
      return (r.off = t), r;
    }
    events(e) {
      e = Array.isArray(e) ? e : [e];
      for (const t of e) assertEventName(t);
      return iterator(this, e);
    }
    async emit(e, t) {
      var r;
      if ((assertEventName(e), isMetaEvent(e) && !De))
        throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
      this.logIfDebugEnabled('emit', e, t),
        (function enqueueProducers(e, t, r) {
          const n = Te.get(e);
          if (n.has(t)) for (const c of n.get(t)) c.enqueue(r);
          if (n.has(Ae)) {
            const e = Promise.all([t, r]);
            for (const t of n.get(Ae)) t.enqueue(e);
          }
        })(this, e, t);
      const n = null != (r = getListeners(this, e)) ? r : new Set(),
        c = ve.get(this),
        f = [...n],
        h = isMetaEvent(e) ? [] : [...c];
      await Ne,
        await Promise.all([
          ...f.map(async (e) => {
            if (n.has(e)) return e(t);
          }),
          ...h.map(async (r) => {
            if (c.has(r)) return r(e, t);
          }),
        ]);
    }
    async emitSerial(e, t) {
      var r;
      if ((assertEventName(e), isMetaEvent(e) && !De))
        throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
      this.logIfDebugEnabled('emitSerial', e, t);
      const n = null != (r = getListeners(this, e)) ? r : new Set(),
        c = ve.get(this),
        f = [...n],
        h = [...c];
      await Ne;
      for (const u of f) n.has(u) && (await u(t));
      for (const u of h) c.has(u) && (await u(e, t));
    }
    onAny(e) {
      return (
        assertListener(e),
        this.logIfDebugEnabled('subscribeAny', void 0, void 0),
        ve.get(this).add(e),
        emitMetaEvent(this, $e, { listener: e }),
        this.offAny.bind(this, e)
      );
    }
    anyEvent() {
      return iterator(this);
    }
    offAny(e) {
      assertListener(e),
        this.logIfDebugEnabled('unsubscribeAny', void 0, void 0),
        emitMetaEvent(this, Ie, { listener: e }),
        ve.get(this).delete(e);
    }
    clearListeners(e) {
      e = Array.isArray(e) ? e : [e];
      for (const t of e)
        if ((this.logIfDebugEnabled('clear', t, void 0), 'string' == typeof t || 'symbol' == typeof t || 'number' == typeof t)) {
          const e = getListeners(this, t);
          e && e.clear();
          const r = getEventProducers(this, t);
          if (r) {
            for (const e of r) e.finish();
            r.clear();
          }
        } else {
          ve.get(this).clear();
          for (const [e, t] of Ee.get(this).entries()) t.clear(), Ee.get(this).delete(e);
          for (const [e, t] of Te.get(this).entries()) {
            for (const e of t) e.finish();
            t.clear(), Te.get(this).delete(e);
          }
        }
    }
    listenerCount(e) {
      var t, r, n, c, f, h;
      e = Array.isArray(e) ? e : [e];
      let u = 0;
      for (const d of e)
        if ('string' != typeof d) {
          void 0 !== d && assertEventName(d), (u += ve.get(this).size);
          for (const e of Ee.get(this).values()) u += e.size;
          for (const e of Te.get(this).values()) u += e.size;
        } else
          u +=
            ve.get(this).size +
            (null != (r = null == (t = getListeners(this, d)) ? void 0 : t.size) ? r : 0) +
            (null != (c = null == (n = getEventProducers(this, d)) ? void 0 : n.size) ? c : 0) +
            (null != (h = null == (f = getEventProducers(this)) ? void 0 : f.size) ? h : 0);
      return u;
    }
    bindMethods(e, t) {
      if ('object' != typeof e || null === e) throw new TypeError('`target` must be an object');
      t = defaultMethodNamesOrAssert(t);
      for (const r of t) {
        if (void 0 !== e[r]) throw new Error(`The property \`${r}\` already exists on \`target\``);
        Object.defineProperty(e, r, { enumerable: !1, value: this[r].bind(this) });
      }
    }
  }
  const Re = Object.getOwnPropertyNames(Emittery.prototype).filter((e) => 'constructor' !== e);
  Object.defineProperty(Emittery, 'listenerAdded', { value: $e, writable: !1, enumerable: !0, configurable: !1 }),
    Object.defineProperty(Emittery, 'listenerRemoved', { value: Ie, writable: !1, enumerable: !0, configurable: !1 });
  const xe = createGlobalThisVariable('registeredWorkers', {});
  isWorker() &&
    (function initWorker() {
      const e = {};
      onmessage = async (t) => {
        const r = t.data;
        switch (r.type) {
          case we.INIT:
            !(function handleCommandInit(e, t) {
              if (!e.args) throw 'Missing className while initializing worker';
              const [r, n] = e.args,
                c = xe[r];
              if (!c) throw `unknown worker class ${r}`;
              (t.instance = new c(e.args.slice(1))),
                copy(n, pe),
                (function isInstanceOfEmittery(e) {
                  return e.onAny && e.emit;
                })(t.instance) &&
                  t.instance.onAny((e, t) => {
                    postCommand({ type: we.EVENT }, { name: e, data: t });
                  }),
                postCommand(e, void 0 !== typeof t.instance);
            })(r, e);
            break;
          case we.FORWARD:
            !(async function handleCommandForward(e, t) {
              const { functionName: r, args: n } = e;
              if (!t.instance) throw 'instance not initialized';
              if (!r) throw 'missing function name to call';
              if (!t.instance[r]) throw `undefined function [${r}] in class ${t.instance.constructor.workerId}`;
              postCommand(e, await t.instance[r](...(null != n ? n : [])));
            })(r, e);
            break;
          case we.TERMINATE:
            !(async function handleCommandTerminate(e, t) {
              const { args: r } = e;
              if (!t.instance) throw 'instance not initialized';
              let n;
              t.instance.terminate && (n = await t.instance.terminate(...(null != r ? r : []))), postCommand(e, n);
            })(r, e);
            break;
          case we.GLOBALS_SYNC:
            !(function handleCommandGlobalsSync(e) {
              if (!e.args) throw 'Missing globals while syncing';
              copy(e.args[0], pe), postCommand(e, {});
            })(r);
        }
      };
    })();
  !(function registerWorker(e, t) {
    (t.workerId = e), isWorker() && (xe[t.workerId] = t);
  })(
    'ProcessorWorker',
    class _ProcessorWorker extends ae {
      constructor() {
        super(...arguments), (this.processor = new Oe());
      }
      async init(e = {}) {
        (this.transformer = new NoiseSuppressionTransformer()),
          this.processor.onAny((e, t) => this.emit(e, t)),
          this.transformer.onAny((e, t) => this.emit(e, t)),
          await this.transformer.init(e),
          await this.processor.setTransformers([this.transformer]);
      }
      transform(e, t) {
        this.processor.transform(e, t);
      }
      setAudioOptions(e, t, r, n, c) {
        this.transformer?.setAudioOptions(e, t, r, n, c);
      }
      enable() {
        this.transformer?.enable();
      }
      disable() {
        this.transformer?.disable();
      }
      async terminate() {
        await this.processor.destroy();
      }
      getLatency() {
        return this.transformer?.getLatency() ?? 0;
      }
      getWasmLatencyNs() {
        return this.transformer?.getWasmLatencyNs() ?? 0;
      }
    }
  );
})();
!(function () {
  'use strict';
  var e = Object.defineProperty,
    a = (t, r, n) => (
      ((t, r, n) => {
        r in t ? e(t, r, { enumerable: !0, configurable: !0, writable: !0, value: n }) : (t[r] = n);
      })(t, 'symbol' != typeof r ? r + '' : r, n),
      n
    );
  class l {}
  a(l, 'updates', { transformer_new: 'New transformer', transformer_null: 'Null transformer' }),
    a(l, 'errors', {
      transformer_none: 'No transformers provided',
      transformer_start: 'Cannot start transformer',
      transformer_transform: 'Cannot transform frame',
      transformer_flush: 'Cannot flush transformer',
      readable_null: 'Readable is null',
      writable_null: 'Writable is null',
    });
  const t = new WeakMap(),
    r = new WeakMap(),
    n = new WeakMap(),
    c = Symbol('anyProducer'),
    f = Promise.resolve(),
    h = Symbol('listenerAdded'),
    u = Symbol('listenerRemoved');
  let d = !1;
  function g(e) {
    if ('string' != typeof e && 'symbol' != typeof e) throw new TypeError('eventName must be a string or a symbol');
  }
  function T(e) {
    if ('function' != typeof e) throw new TypeError('listener must be a function');
  }
  function _(e, t) {
    const n = r.get(e);
    return n.has(t) || n.set(t, new Set()), n.get(t);
  }
  function b(e, t) {
    const r = 'string' == typeof t || 'symbol' == typeof t ? t : c,
      f = n.get(e);
    return f.has(r) || f.set(r, new Set()), f.get(r);
  }
  function $(e, t) {
    t = Array.isArray(t) ? t : [t];
    let r = !1,
      s = () => {},
      n = [];
    const c = {
      enqueue(e) {
        n.push(e), s();
      },
      finish() {
        (r = !0), s();
      },
    };
    for (const f of t) b(e, f).add(c);
    return {
      async next() {
        return n
          ? 0 === n.length
            ? r
              ? ((n = void 0), this.next())
              : (await new Promise((e) => {
                  s = e;
                }),
                this.next())
            : { done: !1, value: await n.shift() }
          : { done: !0 };
      },
      async return(r) {
        n = void 0;
        for (const n of t) b(e, n).delete(c);
        return s(), arguments.length > 0 ? { done: !0, value: await r } : { done: !0 };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
  function H(e) {
    if (void 0 === e) return p;
    if (!Array.isArray(e)) throw new TypeError('`methodNames` must be an array of strings');
    for (const t of e)
      if (!p.includes(t))
        throw 'string' != typeof t ? new TypeError('`methodNames` element must be a string') : new Error(`${t} is not Emittery method`);
    return e;
  }
  const I = (e) => e === h || e === u;
  class m {
    static mixin(e, t) {
      return (
        (t = H(t)),
        (r) => {
          if ('function' != typeof r) throw new TypeError('`target` must be function');
          for (const e of t) if (void 0 !== r.prototype[e]) throw new Error(`The property \`${e}\` already exists on \`target\``);
          Object.defineProperty(r.prototype, e, {
            enumerable: !1,
            get: function o() {
              return Object.defineProperty(this, e, { enumerable: !1, value: new m() }), this[e];
            },
          });
          const i = (t) =>
            function (...r) {
              return this[e][t](...r);
            };
          for (const e of t) Object.defineProperty(r.prototype, e, { enumerable: !1, value: i(e) });
          return r;
        }
      );
    }
    static get isDebugEnabled() {
      if ('object' != typeof process) return d;
      const { env: e } = process || { env: {} };
      return 'emittery' === e.DEBUG || '*' === e.DEBUG || d;
    }
    static set isDebugEnabled(e) {
      d = e;
    }
    constructor(e = {}) {
      t.set(this, new Set()),
        r.set(this, new Map()),
        n.set(this, new Map()),
        (this.debug = e.debug || {}),
        void 0 === this.debug.enabled && (this.debug.enabled = !1),
        this.debug.logger ||
          (this.debug.logger = (e, t, r, n) => {
            try {
              n = JSON.stringify(n);
            } catch {
              n = `Object with the following keys failed to stringify: ${Object.keys(n).join(',')}`;
            }
            'symbol' == typeof r && (r = r.toString());
            const c = new Date(),
              f = `${c.getHours()}:${c.getMinutes()}:${c.getSeconds()}.${c.getMilliseconds()}`;
            console.log(`[${f}][emittery:${e}][${t}] Event Name: ${r}\n\tdata: ${n}`);
          });
    }
    logIfDebugEnabled(e, t, r) {
      (m.isDebugEnabled || this.debug.enabled) && this.debug.logger(e, this.debug.name, t, r);
    }
    on(e, t) {
      T(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e)
        g(r), _(this, r).add(t), this.logIfDebugEnabled('subscribe', r, void 0), I(r) || this.emit(h, { eventName: r, listener: t });
      return this.off.bind(this, e, t);
    }
    off(e, t) {
      T(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e)
        g(r), _(this, r).delete(t), this.logIfDebugEnabled('unsubscribe', r, void 0), I(r) || this.emit(u, { eventName: r, listener: t });
    }
    once(e) {
      return new Promise((t) => {
        const r = this.on(e, (e) => {
          r(), t(e);
        });
      });
    }
    events(e) {
      e = Array.isArray(e) ? e : [e];
      for (const t of e) g(t);
      return $(this, e);
    }
    async emit(e, r) {
      g(e),
        this.logIfDebugEnabled('emit', e, r),
        (function q(e, t, r) {
          const f = n.get(e);
          if (f.has(t)) for (const n of f.get(t)) n.enqueue(r);
          if (f.has(c)) {
            const e = Promise.all([t, r]);
            for (const t of f.get(c)) t.enqueue(e);
          }
        })(this, e, r);
      const h = _(this, e),
        u = t.get(this),
        d = [...h],
        p = I(e) ? [] : [...u];
      await f,
        await Promise.all([
          ...d.map(async (e) => {
            if (h.has(e)) return e(r);
          }),
          ...p.map(async (t) => {
            if (u.has(t)) return t(e, r);
          }),
        ]);
    }
    async emitSerial(e, r) {
      g(e), this.logIfDebugEnabled('emitSerial', e, r);
      const n = _(this, e),
        c = t.get(this),
        h = [...n],
        u = [...c];
      await f;
      for (const t of h) n.has(t) && (await t(r));
      for (const t of u) c.has(t) && (await t(e, r));
    }
    onAny(e) {
      return (
        T(e),
        this.logIfDebugEnabled('subscribeAny', void 0, void 0),
        t.get(this).add(e),
        this.emit(h, { listener: e }),
        this.offAny.bind(this, e)
      );
    }
    anyEvent() {
      return $(this);
    }
    offAny(e) {
      T(e), this.logIfDebugEnabled('unsubscribeAny', void 0, void 0), this.emit(u, { listener: e }), t.get(this).delete(e);
    }
    clearListeners(e) {
      e = Array.isArray(e) ? e : [e];
      for (const c of e)
        if ((this.logIfDebugEnabled('clear', c, void 0), 'string' == typeof c || 'symbol' == typeof c)) {
          _(this, c).clear();
          const e = b(this, c);
          for (const t of e) t.finish();
          e.clear();
        } else {
          t.get(this).clear();
          for (const e of r.get(this).values()) e.clear();
          for (const e of n.get(this).values()) {
            for (const t of e) t.finish();
            e.clear();
          }
        }
    }
    listenerCount(e) {
      e = Array.isArray(e) ? e : [e];
      let c = 0;
      for (const f of e)
        if ('string' != typeof f) {
          typeof f < 'u' && g(f), (c += t.get(this).size);
          for (const e of r.get(this).values()) c += e.size;
          for (const e of n.get(this).values()) c += e.size;
        } else c += t.get(this).size + _(this, f).size + b(this, f).size + b(this).size;
      return c;
    }
    bindMethods(e, t) {
      if ('object' != typeof e || null === e) throw new TypeError('`target` must be an object');
      t = H(t);
      for (const r of t) {
        if (void 0 !== e[r]) throw new Error(`The property \`${r}\` already exists on \`target\``);
        Object.defineProperty(e, r, { enumerable: !1, value: this[r].bind(this) });
      }
    }
  }
  const p = Object.getOwnPropertyNames(m.prototype).filter((e) => 'constructor' !== e);
  Object.defineProperty(m, 'listenerAdded', { value: h, writable: !1, enumerable: !0, configurable: !1 }),
    Object.defineProperty(m, 'listenerRemoved', { value: u, writable: !1, enumerable: !0, configurable: !1 });
  var y = m;
  function v(e) {
    return (function X(e) {
      if (
        (function J(e) {
          return 'object' == typeof e && null !== e && 'message' in e && 'string' == typeof e.message;
        })(e)
      )
        return e;
      try {
        return new Error(JSON.stringify(e));
      } catch {
        return new Error(String(e));
      }
    })(e).message;
  }
  var E = Object.defineProperty,
    N = (e, t, r) => (
      ((e, t, r) => {
        t in e ? E(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : (e[t] = r);
      })(e, 'symbol' != typeof t ? t + '' : t, r),
      r
    );
  let A;
  const S = new Uint8Array(16);
  function ie() {
    if (!A && ((A = typeof crypto < 'u' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)), !A))
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    return A(S);
  }
  const O = [];
  for (let Ce = 0; Ce < 256; ++Ce) O.push((Ce + 256).toString(16).slice(1));
  const M = { randomUUID: typeof crypto < 'u' && crypto.randomUUID && crypto.randomUUID.bind(crypto) };
  function ce(e, t, r) {
    if (M.randomUUID && !t && !e) return M.randomUUID();
    const n = (e = e || {}).random || (e.rng || ie)();
    if (((n[6] = (15 & n[6]) | 64), (n[8] = (63 & n[8]) | 128), t)) {
      r = r || 0;
      for (let e = 0; e < 16; ++e) t[r + e] = n[e];
      return t;
    }
    return (function ne(e, t = 0) {
      return (
        O[e[t + 0]] +
        O[e[t + 1]] +
        O[e[t + 2]] +
        O[e[t + 3]] +
        '-' +
        O[e[t + 4]] +
        O[e[t + 5]] +
        '-' +
        O[e[t + 6]] +
        O[e[t + 7]] +
        '-' +
        O[e[t + 8]] +
        O[e[t + 9]] +
        '-' +
        O[e[t + 10]] +
        O[e[t + 11]] +
        O[e[t + 12]] +
        O[e[t + 13]] +
        O[e[t + 14]] +
        O[e[t + 15]]
      ).toLowerCase();
    })(n);
  }
  function W(e, t) {
    globalThis.vonage || (globalThis.vonage = {}), globalThis.vonage.workerizer || (globalThis.vonage.workerizer = {});
    let r = globalThis.vonage.workerizer;
    return r[e] || (r[e] = t), r[e];
  }
  const k = W('globals', {});
  var R = ((e) => ((e.INIT = 'INIT'), (e.FORWARD = 'FORWARD'), (e.TERMINATE = 'TERMINATE'), (e.GLOBALS_SYNC = 'GLOBALS_SYNC'), e))(R || {});
  function j(e) {
    return [ImageBitmap, ReadableStream, WritableStream].some((t) => e instanceof t);
  }
  let x = 0;
  function le(e, t, r, n, c) {
    const f = x++;
    return (
      e.postMessage(
        { id: f, type: t, functionName: r, args: n },
        n.filter((e) => j(e))
      ),
      new Promise((e) => {
        null == c || c.set(f, e);
      })
    );
  }
  function w(e, t) {
    const { id: r, type: n } = e,
      c = Array.isArray(t) ? t : [t];
    postMessage(
      { id: r, type: n, result: t },
      c.filter((e) => j(e))
    );
  }
  const L = W('workerized', {});
  function B() {
    return typeof WorkerGlobalScope < 'u' && self instanceof WorkerGlobalScope;
  }
  function P(e, t) {
    if (Array.isArray(t)) t.splice(0, t.length);
    else if ('object' == typeof t) for (const r in t) delete t[r];
    for (const r in e)
      Array.isArray(e[r]) ? ((t[r] = []), P(e[r], t[r])) : 'object' == typeof e[r] ? ((t[r] = {}), P(e[r], t[r])) : (t[r] = e[r]);
  }
  const z = W('registeredWorkers', {});
  function ye(e, t) {
    return (
      k[e] || (k[e] = t),
      [
        () => k[e],
        async (t) => {
          (k[e] = t),
            await (async function ue() {
              if (B()) w({ type: R.GLOBALS_SYNC }, k);
              else {
                const e = [];
                for (const t in L) {
                  const { worker: r, resolvers: n } = L[t].workerContext;
                  r && e.push(le(r, R.GLOBALS_SYNC, '', [k], n));
                }
                await Promise.all(e);
              }
            })();
        },
      ]
    );
  }
  B() &&
    (function _e() {
      const e = {};
      onmessage = async (t) => {
        const r = t.data;
        switch (r.type) {
          case R.INIT:
            !(function de(e, t) {
              if (!e.args) throw 'Missing className while initializing worker';
              const [r, n] = e.args,
                c = z[r];
              if (!c) throw `unknown worker class ${r}`;
              (t.instance = new c(e.args.slice(1))), P(n, k), w(e, void 0 !== typeof t.instance);
            })(r, e);
            break;
          case R.FORWARD:
            !(async function he(e, t) {
              const { functionName: r, args: n } = e;
              if (!t.instance) throw 'instance not initialized';
              if (!r) throw 'missing function name to call';
              if (!t.instance[r]) throw `undefined function [${r}] in class ${t.instance.constructor.workerId}`;
              w(e, await t.instance[r](...(null != n ? n : [])));
            })(r, e);
            break;
          case R.TERMINATE:
            !(async function me(e, t) {
              const { args: r } = e;
              if (!t.instance) throw 'instance not initialized';
              let n;
              t.instance.terminate && (n = await t.instance.terminate(...(null != r ? r : []))), w(e, n);
            })(r, e);
            break;
          case R.GLOBALS_SYNC:
            !(function ge(e) {
              if (!e.args) throw 'Missing globals while syncing';
              P(e.args[0], k), w(e, {});
            })(r);
        }
      };
    })();
  const [F, U] = (function be(e, t) {
    return ye(e, t);
  })('metadata');
  function C() {
    return F();
  }
  class D {
    constructor(e) {
      N(this, 'uuid', ce()), (this.config = e);
    }
    async send(e) {
      var t, r, n;
      const { appId: c, sourceType: f } = null != (t = C()) ? t : {};
      if (!c || !f) return 'metadata missing';
      const h = new AbortController(),
        u = setTimeout(() => h.abort(), 1e4);
      return (
        await (null != (n = null == (r = this.config) ? void 0 : r.fetch) ? n : fetch)(this.getUrl(), {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(this.buildReport(e)),
          signal: h.signal,
        }),
        clearTimeout(u),
        'success'
      );
    }
    getUrl() {
      var e;
      let t = null != (e = C().proxyUrl) ? e : 'https://';
      return (t += ('/' === t.at(-1) ? '' : '/') + 'hlg.tokbox.com/prod/logging/vcp_webrtc'), t;
    }
    getHeaders() {
      return { 'Content-Type': 'application/json' };
    }
    buildReport(e) {
      const t = C();
      return { guid: this.uuid, ...e, applicationId: t.appId, timestamp: Date.now(), proxyUrl: t.proxyUrl, source: t.sourceType };
    }
  }
  const G = '2.0.3';
  class Se {
    constructor(e) {
      a(this, 'frameTransformedCount', 0),
        a(this, 'frameFromSourceCount', 0),
        a(this, 'startAt', 0),
        a(this, 'reporter'),
        (this.config = e),
        (this.reporter = new D(e));
    }
    async onFrameFromSource() {
      this.frameFromSourceCount++;
    }
    get fps() {
      const { startAt: e, frameFromSourceCount: t } = this;
      return t / ((Date.now() - e) / 1e3);
    }
    async onFrameTransformed(e = {}, t = !1) {
      0 === this.startAt && (this.startAt = Date.now()), this.frameTransformedCount++;
      const { startAt: r, frameTransformedCount: n, frameFromSourceCount: c } = this,
        f = Date.now(),
        h = (f - r) / 1e3,
        u = n / h,
        d = c / h;
      return t || this.frameTransformedCount >= this.config.loggingIntervalFrameCount
        ? ((this.frameFromSourceCount = 0),
          (this.frameTransformedCount = 0),
          (this.startAt = f),
          (this.reporter.config = this.config),
          this.reporter.send({ ...this.config.report, variation: 'QoS', fps: d, transformedFps: u, framesTransformed: n, ...e }))
        : 'success';
    }
  }
  var Q = ((e) => (
    (e.pipeline_ended = 'pipeline_ended'),
    (e.pipeline_ended_with_error = 'pipeline_ended_with_error'),
    (e.pipeline_started = 'pipeline_started'),
    (e.pipeline_started_with_error = 'pipeline_started_with_error'),
    (e.pipeline_restarted = 'pipeline_restarted'),
    (e.pipeline_restarted_with_error = 'pipeline_restarted_with_error'),
    e
  ))(Q || {});
  class Pe extends y {
    constructor(e, t) {
      super(),
        a(this, 'reporter_', new D()),
        a(this, 'reporterQos_', new Se({ loggingIntervalFrameCount: 500, report: { version: G } })),
        a(this, 'transformerType_'),
        a(this, 'transformer_'),
        a(this, 'shouldStop_'),
        a(this, 'isFlashed_'),
        a(this, 'mediaTransformerQosReportStartTimestamp_'),
        a(this, 'videoHeight_'),
        a(this, 'videoWidth_'),
        a(this, 'trackExpectedRate_'),
        a(this, 'index_'),
        a(this, 'controller_'),
        (this.index_ = t),
        (this.transformer_ = e),
        (this.shouldStop_ = !1),
        (this.isFlashed_ = !1),
        (this.mediaTransformerQosReportStartTimestamp_ = 0),
        (this.videoHeight_ = 0),
        (this.videoWidth_ = 0),
        (this.trackExpectedRate_ = -1),
        (this.transformerType_ = 'Custom'),
        'getTransformerType' in e && (this.transformerType_ = e.getTransformerType()),
        this.report({ variation: 'Create' });
    }
    setTrackExpectedRate(e) {
      this.trackExpectedRate_ = e;
    }
    async start(e) {
      if (((this.controller_ = e), this.transformer_ && 'function' == typeof this.transformer_.start))
        try {
          await this.transformer_.start(e);
        } catch (t) {
          this.report({ message: l.errors.transformer_start, variation: 'Error', error: v(t) });
          const e = { eventMetaData: { transformerIndex: this.index_ }, error: t, function: 'start' };
          this.emit('error', e);
        }
    }
    async transform(e, t) {
      var r, n, c, f;
      if (
        (0 === this.mediaTransformerQosReportStartTimestamp_ && (this.mediaTransformerQosReportStartTimestamp_ = Date.now()),
        e instanceof VideoFrame &&
          ((this.videoHeight_ = null != (r = null == e ? void 0 : e.displayHeight) ? r : 0),
          (this.videoWidth_ = null != (n = null == e ? void 0 : e.displayWidth) ? n : 0)),
        this.reporterQos_.onFrameFromSource(),
        this.transformer_)
      )
        if (this.shouldStop_) console.warn('[Pipeline] flush from transform'), e.close(), this.flush(t), t.terminate();
        else {
          try {
            await (null == (f = (c = this.transformer_).transform) ? void 0 : f.call(c, e, t)), this.reportQos();
          } catch (h) {
            this.report({ message: l.errors.transformer_transform, variation: 'Error', error: v(h) });
            const e = { eventMetaData: { transformerIndex: this.index_ }, error: h, function: 'transform' };
            this.emit('error', e);
          }
          if (-1 != this.trackExpectedRate_ && 0.8 * this.trackExpectedRate_ > this.reporterQos_.fps) {
            const e = {
              eventMetaData: { transformerIndex: this.index_ },
              warningType: 'fps_drop',
              dropInfo: { requested: this.trackExpectedRate_, current: this.reporterQos_.fps },
            };
            this.emit('warn', e);
          }
        }
    }
    async flush(e) {
      if (this.transformer_ && 'function' == typeof this.transformer_.flush && !this.isFlashed_) {
        this.isFlashed_ = !0;
        try {
          await this.transformer_.flush(e);
        } catch (t) {
          this.report({ message: l.errors.transformer_flush, variation: 'Error', error: v(t) });
          const e = { eventMetaData: { transformerIndex: this.index_ }, error: t, function: 'flush' };
          this.emit('error', e);
        }
      }
      this.reportQos(!0), this.report({ variation: 'Delete' });
    }
    stop() {
      console.log('[Pipeline] Stop stream.'),
        this.controller_ && (this.flush(this.controller_), this.controller_.terminate()),
        (this.shouldStop_ = !0);
    }
    report(e) {
      this.reporter_.send({ version: G, action: 'MediaTransformer', transformerType: this.transformerType_, ...e });
    }
    reportQos(e = !1) {
      (this.reporterQos_.config = { ...this.reporterQos_.config }),
        this.reporterQos_.onFrameTransformed(
          {
            version: G,
            action: 'MediaTransformer',
            transformerType: this.transformerType_,
            videoWidth: this.videoWidth_,
            videoHeight: this.videoHeight_,
          },
          e
        );
    }
  }
  class Me extends y {
    constructor(e) {
      super(), a(this, 'transformers_'), a(this, 'trackExpectedRate_'), (this.transformers_ = []), (this.trackExpectedRate_ = -1);
      for (let t = 0; t < e.length; t++) {
        let r = new Pe(e[t], t);
        r.on('error', (e) => {
          this.emit('error', e);
        }),
          r.on('warn', (e) => {
            this.emit('warn', e);
          }),
          this.transformers_.push(r);
      }
    }
    setTrackExpectedRate(e) {
      this.trackExpectedRate_ = e;
      for (let t of this.transformers_) t.setTrackExpectedRate(this.trackExpectedRate_);
    }
    async start(e, t) {
      if (this.transformers_ && 0 !== this.transformers_.length) {
        try {
          let r = e;
          for (let t of this.transformers_) e = e.pipeThrough(new TransformStream(t));
          e.pipeTo(t)
            .then(async () => {
              console.log('[Pipeline] Setup.'), await t.abort(), await r.cancel(), this.emit('pipelineInfo', 'pipeline_ended');
            })
            .catch(async (n) => {
              e
                .cancel()
                .then(() => {
                  console.log('[Pipeline] Shutting down streams after abort.');
                })
                .catch((e) => {
                  console.error('[Pipeline] Error from stream transform:', e);
                }),
                await t.abort(n),
                await r.cancel(n),
                this.emit('pipelineInfo', 'pipeline_ended_with_error');
            });
        } catch {
          return this.emit('pipelineInfo', 'pipeline_started_with_error'), void this.destroy();
        }
        this.emit('pipelineInfo', 'pipeline_started'), console.log('[Pipeline] Pipeline started.');
      } else console.log('[Pipeline] No transformers.');
    }
    async destroy() {
      console.log('[Pipeline] Destroying Pipeline.');
      for (let e of this.transformers_) e.stop();
    }
  }
  class Oe extends y {
    constructor() {
      super(),
        a(this, 'reporter_'),
        a(this, 'pipeline_'),
        a(this, 'transformers_'),
        a(this, 'readable_'),
        a(this, 'writable_'),
        a(this, 'trackExpectedRate_'),
        (this.reporter_ = new D()),
        (this.trackExpectedRate_ = -1),
        this.report({ variation: 'Create' });
    }
    setTrackExpectedRate(e) {
      (this.trackExpectedRate_ = e), this.pipeline_ && this.pipeline_.setTrackExpectedRate(this.trackExpectedRate_);
    }
    transform(e, t) {
      return (this.readable_ = e), (this.writable_ = t), this.transformInternal();
    }
    transformInternal() {
      return new Promise(async (e, t) => {
        if (!this.transformers_ || 0 === this.transformers_.length)
          return (
            this.report({ message: l.errors.transformer_none, variation: 'Error' }), void t('[MediaProcessor] Need to set transformers.')
          );
        if (!this.readable_)
          return this.report({ variation: 'Error', message: l.errors.readable_null }), void t('[MediaProcessor] Readable is null.');
        if (!this.writable_)
          return this.report({ variation: 'Error', message: l.errors.writable_null }), void t('[MediaProcessor] Writable is null.');
        let r = !1;
        this.pipeline_ && ((r = !0), this.pipeline_.clearListeners(), this.pipeline_.destroy()),
          (this.pipeline_ = new Me(this.transformers_)),
          this.pipeline_.on('warn', (e) => {
            this.emit('warn', e);
          }),
          this.pipeline_.on('error', (e) => {
            this.emit('error', e);
          }),
          this.pipeline_.on('pipelineInfo', (e) => {
            r &&
              ('pipeline_started' === e
                ? (e = Q.pipeline_restarted)
                : 'pipeline_started_with_error' === e && (e = Q.pipeline_restarted_with_error)),
              this.emit('pipelineInfo', e);
          }),
          -1 != this.trackExpectedRate_ && this.pipeline_.setTrackExpectedRate(this.trackExpectedRate_),
          this.pipeline_
            .start(this.readable_, this.writable_)
            .then(() => {
              e();
            })
            .catch((e) => {
              t(e);
            });
      });
    }
    setTransformers(e) {
      return (
        this.report({ variation: 'Update', message: l.updates.transformer_new }),
        (this.transformers_ = e),
        this.readable_ && this.writable_ ? this.transformInternal() : Promise.resolve()
      );
    }
    destroy() {
      return new Promise(async (e) => {
        this.pipeline_ && this.pipeline_.destroy(), this.report({ variation: 'Delete' }), e();
      });
    }
    report(e) {
      this.reporter_.send({ version: G, action: 'MediaProcessor', ...e });
    }
  }
  const V = new WeakMap(),
    Y = new WeakMap(),
    K = new WeakMap(),
    Z = Symbol('anyProducer'),
    ee = Promise.resolve(),
    te = Symbol('listenerAdded'),
    re = Symbol('listenerRemoved');
  let se = !1,
    oe = !1;
  function assertEventName$1(e) {
    if ('string' != typeof e && 'symbol' != typeof e && 'number' != typeof e)
      throw new TypeError('`eventName` must be a string, symbol, or number');
  }
  function assertListener$1(e) {
    if ('function' != typeof e) throw new TypeError('listener must be a function');
  }
  function getListeners$1(e, t) {
    const r = Y.get(e);
    if (r.has(t)) return r.get(t);
  }
  function getEventProducers$1(e, t) {
    const r = 'string' == typeof t || 'symbol' == typeof t || 'number' == typeof t ? t : Z,
      n = K.get(e);
    if (n.has(r)) return n.get(r);
  }
  function iterator$1(e, t) {
    t = Array.isArray(t) ? t : [t];
    let r = !1,
      flush = () => {},
      n = [];
    const c = {
      enqueue(e) {
        n.push(e), flush();
      },
      finish() {
        (r = !0), flush();
      },
    };
    for (const f of t) {
      let t = getEventProducers$1(e, f);
      if (!t) {
        t = new Set();
        K.get(e).set(f, t);
      }
      t.add(c);
    }
    return {
      async next() {
        return n
          ? 0 === n.length
            ? r
              ? ((n = void 0), this.next())
              : (await new Promise((e) => {
                  flush = e;
                }),
                this.next())
            : { done: !1, value: await n.shift() }
          : { done: !0 };
      },
      async return(r) {
        n = void 0;
        for (const n of t) {
          const t = getEventProducers$1(e, n);
          if (t && (t.delete(c), 0 === t.size)) {
            K.get(e).delete(n);
          }
        }
        return flush(), arguments.length > 0 ? { done: !0, value: await r } : { done: !0 };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
  function defaultMethodNamesOrAssert$1(e) {
    if (void 0 === e) return fe;
    if (!Array.isArray(e)) throw new TypeError('`methodNames` must be an array of strings');
    for (const t of e)
      if (!fe.includes(t)) {
        if ('string' != typeof t) throw new TypeError('`methodNames` element must be a string');
        throw new Error(`${t} is not Emittery method`);
      }
    return e;
  }
  const isMetaEvent$1 = (e) => e === te || e === re;
  function emitMetaEvent$1(e, t, r) {
    if (isMetaEvent$1(t))
      try {
        (se = !0), e.emit(t, r);
      } finally {
        se = !1;
      }
  }
  let ae = class Emittery2 {
    static mixin(e, t) {
      return (
        (t = defaultMethodNamesOrAssert$1(t)),
        (r) => {
          if ('function' != typeof r) throw new TypeError('`target` must be function');
          for (const e of t) if (void 0 !== r.prototype[e]) throw new Error(`The property \`${e}\` already exists on \`target\``);
          Object.defineProperty(r.prototype, e, {
            enumerable: !1,
            get: function getEmitteryProperty() {
              return Object.defineProperty(this, e, { enumerable: !1, value: new Emittery2() }), this[e];
            },
          });
          const emitteryMethodCaller = (t) =>
            function (...r) {
              return this[e][t](...r);
            };
          for (const e of t) Object.defineProperty(r.prototype, e, { enumerable: !1, value: emitteryMethodCaller(e) });
          return r;
        }
      );
    }
    static get isDebugEnabled() {
      if ('object' != typeof globalThis.process?.env) return oe;
      const { env: e } = globalThis.process ?? { env: {} };
      return 'emittery' === e.DEBUG || '*' === e.DEBUG || oe;
    }
    static set isDebugEnabled(e) {
      oe = e;
    }
    constructor(e = {}) {
      V.set(this, new Set()),
        Y.set(this, new Map()),
        K.set(this, new Map()),
        K.get(this).set(Z, new Set()),
        (this.debug = e.debug ?? {}),
        void 0 === this.debug.enabled && (this.debug.enabled = !1),
        this.debug.logger ||
          (this.debug.logger = (e, t, r, n) => {
            try {
              n = JSON.stringify(n);
            } catch {
              n = `Object with the following keys failed to stringify: ${Object.keys(n).join(',')}`;
            }
            ('symbol' != typeof r && 'number' != typeof r) || (r = r.toString());
            const c = new Date(),
              f = `${c.getHours()}:${c.getMinutes()}:${c.getSeconds()}.${c.getMilliseconds()}`;
            console.log(`[${f}][emittery:${e}][${t}] Event Name: ${r}\n\tdata: ${n}`);
          });
    }
    logIfDebugEnabled(e, t, r) {
      (Emittery2.isDebugEnabled || this.debug.enabled) && this.debug.logger(e, this.debug.name, t, r);
    }
    on(e, t) {
      assertListener$1(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e) {
        assertEventName$1(r);
        let e = getListeners$1(this, r);
        if (!e) {
          e = new Set();
          Y.get(this).set(r, e);
        }
        e.add(t),
          this.logIfDebugEnabled('subscribe', r, void 0),
          isMetaEvent$1(r) || emitMetaEvent$1(this, te, { eventName: r, listener: t });
      }
      return this.off.bind(this, e, t);
    }
    off(e, t) {
      assertListener$1(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e) {
        assertEventName$1(r);
        const e = getListeners$1(this, r);
        if (e && (e.delete(t), 0 === e.size)) {
          Y.get(this).delete(r);
        }
        this.logIfDebugEnabled('unsubscribe', r, void 0), isMetaEvent$1(r) || emitMetaEvent$1(this, re, { eventName: r, listener: t });
      }
    }
    once(e) {
      let t;
      const r = new Promise((r) => {
        t = this.on(e, (e) => {
          t(), r(e);
        });
      });
      return (r.off = t), r;
    }
    events(e) {
      e = Array.isArray(e) ? e : [e];
      for (const t of e) assertEventName$1(t);
      return iterator$1(this, e);
    }
    async emit(e, t) {
      if ((assertEventName$1(e), isMetaEvent$1(e) && !se))
        throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
      this.logIfDebugEnabled('emit', e, t),
        (function enqueueProducers$1(e, t, r) {
          const n = K.get(e);
          if (n.has(t)) for (const c of n.get(t)) c.enqueue(r);
          if (n.has(Z)) {
            const e = Promise.all([t, r]);
            for (const t of n.get(Z)) t.enqueue(e);
          }
        })(this, e, t);
      const r = getListeners$1(this, e) ?? new Set(),
        n = V.get(this),
        c = [...r],
        f = isMetaEvent$1(e) ? [] : [...n];
      await ee,
        await Promise.all([
          ...c.map(async (e) => {
            if (r.has(e)) return e(t);
          }),
          ...f.map(async (r) => {
            if (n.has(r)) return r(e, t);
          }),
        ]);
    }
    async emitSerial(e, t) {
      if ((assertEventName$1(e), isMetaEvent$1(e) && !se))
        throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
      this.logIfDebugEnabled('emitSerial', e, t);
      const r = getListeners$1(this, e) ?? new Set(),
        n = V.get(this),
        c = [...r],
        f = [...n];
      await ee;
      for (const h of c) r.has(h) && (await h(t));
      for (const h of f) n.has(h) && (await h(e, t));
    }
    onAny(e) {
      return (
        assertListener$1(e),
        this.logIfDebugEnabled('subscribeAny', void 0, void 0),
        V.get(this).add(e),
        emitMetaEvent$1(this, te, { listener: e }),
        this.offAny.bind(this, e)
      );
    }
    anyEvent() {
      return iterator$1(this);
    }
    offAny(e) {
      assertListener$1(e),
        this.logIfDebugEnabled('unsubscribeAny', void 0, void 0),
        emitMetaEvent$1(this, re, { listener: e }),
        V.get(this).delete(e);
    }
    clearListeners(e) {
      e = Array.isArray(e) ? e : [e];
      for (const t of e)
        if ((this.logIfDebugEnabled('clear', t, void 0), 'string' == typeof t || 'symbol' == typeof t || 'number' == typeof t)) {
          const e = getListeners$1(this, t);
          e && e.clear();
          const r = getEventProducers$1(this, t);
          if (r) {
            for (const e of r) e.finish();
            r.clear();
          }
        } else {
          V.get(this).clear();
          for (const [e, t] of Y.get(this).entries()) t.clear(), Y.get(this).delete(e);
          for (const [e, t] of K.get(this).entries()) {
            for (const e of t) e.finish();
            t.clear(), K.get(this).delete(e);
          }
        }
    }
    listenerCount(e) {
      e = Array.isArray(e) ? e : [e];
      let t = 0;
      for (const r of e)
        if ('string' != typeof r) {
          void 0 !== r && assertEventName$1(r), (t += V.get(this).size);
          for (const e of Y.get(this).values()) t += e.size;
          for (const e of K.get(this).values()) t += e.size;
        } else
          t +=
            V.get(this).size +
            (getListeners$1(this, r)?.size ?? 0) +
            (getEventProducers$1(this, r)?.size ?? 0) +
            (getEventProducers$1(this)?.size ?? 0);
      return t;
    }
    bindMethods(e, t) {
      if ('object' != typeof e || null === e) throw new TypeError('`target` must be an object');
      t = defaultMethodNamesOrAssert$1(t);
      for (const r of t) {
        if (void 0 !== e[r]) throw new Error(`The property \`${r}\` already exists on \`target\``);
        Object.defineProperty(e, r, { enumerable: !1, value: this[r].bind(this) });
      }
    }
  };
  const fe = Object.getOwnPropertyNames(ae.prototype).filter((e) => 'constructor' !== e);
  Object.defineProperty(ae, 'listenerAdded', { value: te, writable: !1, enumerable: !0, configurable: !1 }),
    Object.defineProperty(ae, 'listenerRemoved', { value: re, writable: !1, enumerable: !0, configurable: !1 });
  class Average {
    constructor(e) {
      (this.size = e), (this.values = []), (this.sum = 0);
    }
    push(e) {
      for (this.values.push(e), this.sum += e; this.size < this.values.length; ) this.sum -= this.values.shift() ?? 0;
    }
    value() {
      return this.sum / Math.max(1, this.values.length);
    }
  }
  class NoiseSuppressionTransformer extends ae {
    constructor() {
      super(),
        (this.isEnabled = !0),
        (this.internalResampleSupported = !1),
        (this.latency = new Average(100)),
        (this.transform = this.transformAudioData.bind(this));
    }
    async init(e) {
      console.log('Noise suppression transformer initialization'),
        (this.transform = e.debug ? this.transformDebug.bind(this) : this.transformAudioData.bind(this));
      const t = e.assetsDirBaseUrl ?? 'https://d3opqjmqzxf057.cloudfront.net/noise-suppression/1.0.0-beta.2',
        locateFile = (e) => `${t}/${e}`;
      let r,
        n = 1;
      (await this.isMonoThread(e))
        ? (this.wasmInstance = await createWasmMonoInstance({
            locateFile: locateFile,
            mainScriptUrlOrBlob: locateFile('main-bin-mono.js'),
          }))
        : ((this.wasmInstance = await createWasmMultiInstance({
            locateFile: locateFile,
            mainScriptUrlOrBlob: locateFile('main-bin-multi.js'),
          })),
          (n = 3)),
        (this.wasmTransformer = new this.wasmInstance.DtlnTransformer()),
        await Promise.all([this.loadModel(`${t}/model_1.tflite`, 1), this.loadModel(`${t}/model_2.tflite`, 2)]);
      try {
        r = this.wasmTransformer?.init(n);
      } catch (c) {
        if ('number' == typeof c) {
          let e = '';
          for (let t = 0; t < 500; ++t) e += String.fromCharCode(this.wasmInstance.HEAP8[c + t]);
          console.error(e);
        } else console.error(c);
      }
      if (0 !== r) {
        const e = `Fail to init wasm transformer, error code = ${r}`;
        throw (console.error(e), e);
      }
      if (((this.internalResampleSupported = this.wasmTransformer?.getInternalResampleSupported()), !this.internalResampleSupported)) {
        const e = 'Internal resampling not supported';
        throw (console.error(e), e);
      }
      console.log('Noise suppression transformer ready');
    }
    setAudioOptions(e, t, r, n, c) {
      this.wasmTransformer?.setAudioOptions(e, t, r, n, c);
    }
    enable() {
      this.isEnabled = !0;
    }
    disable() {
      this.isEnabled = !1;
    }
    getLatency() {
      return this.latency.value();
    }
    getWasmLatencyNs() {
      return this.wasmInstance.getLatencyNs();
    }
    async transformDebug(e, t) {
      try {
        const r = performance.now();
        await this.transformAudioData(e, t), this.latency.push(performance.now() - r);
      } catch (r) {
        console.error(r);
      }
    }
    async transformAudioData(e, t) {
      if ((this.wasmTransformer || this.emit('warning', 'transformer not initialized'), this.isEnabled && this.wasmTransformer))
        try {
          const t = this.getAudioDataAsFloat32(e),
            n = this.convertTypedArray(t, Int16Array, 32767);
          this.wasmTransformer.getInputFrame(e.numberOfFrames).set(n);
          let c = 0;
          try {
            c = this.wasmTransformer.runAlgorithm(e.numberOfFrames, e.sampleRate, e.numberOfChannels);
          } catch (r) {
            if ('number' == typeof r) {
              let e = '';
              for (let t = 0; t < 500; ++t) e += String.fromCharCode(this.wasmInstance.HEAP8[r + t]);
              console.error(e);
            } else console.error(r);
          }
          if (c > 0) {
            const t = this.wasmTransformer.getOutputFrame().slice(0, c),
              r = this.convertTypedArray(t, Float32Array, 1 / 32767),
              { timestamp: n, sampleRate: f, numberOfChannels: h } = e;
            e = new AudioData({
              data: r,
              format: 'f32-planar',
              numberOfChannels: h,
              numberOfFrames: r.length,
              sampleRate: f,
              timestamp: n,
            });
          }
        } catch (r) {
          console.error(r);
        }
      t.enqueue(e);
    }
    async loadModel(e, t) {
      if (!this.wasmTransformer) return;
      const r = await fetch(e),
        n = await r.arrayBuffer(),
        c = n.byteLength,
        f = `getModel${t}`,
        h = this.wasmTransformer[f](c);
      if (h) {
        const e = new Uint8Array(n);
        h.set(e);
      }
    }
    getAudioDataAsFloat32(e) {
      return this.audioDataToTypedArray(e, Float32Array, 'f32-planar', 1);
    }
    audioDataToTypedArray(e, t, r, n = e.numberOfChannels) {
      const c = new t(e.numberOfFrames * n);
      for (let f = 0; f < n; ++f) {
        const t = e.numberOfFrames * f,
          n = c.subarray(t, t + e.numberOfFrames);
        e.copyTo(n, { planeIndex: f, format: r });
      }
      return c;
    }
    convertTypedArray(e, t, r) {
      const n = e.length,
        c = new t(n);
      for (let f = 0; f < n; ++f) c[f] = e[f] * r;
      return c;
    }
    isMonoThread(e) {
      if (e.disableWasmMultiThread) return !0;
      try {
        if (void 0 === new SharedArrayBuffer(1024)) throw new Error('not supported');
      } catch (t) {
        return (
          this.emit(
            'warning',
            '\nMultithread is not available, noise-suppresion is now running on a single thread.\nThis is impacting the performance and increase the latency.\n\nTo enable multithread, you need to serve the application via https with these http headers :\n   - Cross-Origin-Opener-Policy: same-origin\n   - Cross-Origin-Embedder-Policy: require-corp.\nMore info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements\n\nYou can disable this warning by enabling disableWasmMultiThread within the noiseSuppression options.\n'
          ),
          !0
        );
      }
      return !1;
    }
  }
  function createGlobalThisVariable(e, t) {
    globalThis.vonage || (globalThis.vonage = {}), globalThis.vonage.workerizer || (globalThis.vonage.workerizer = {});
    let r = globalThis.vonage.workerizer;
    return r[e] || (r[e] = t), r[e];
  }
  const pe = createGlobalThisVariable('globals', {});
  var we = ((e) => (
    (e.INIT = 'INIT'), (e.FORWARD = 'FORWARD'), (e.TERMINATE = 'TERMINATE'), (e.GLOBALS_SYNC = 'GLOBALS_SYNC'), (e.EVENT = 'EVENT'), e
  ))(we || {});
  function postCommand(e, t) {
    const { id: r, type: n } = e,
      c = Array.isArray(t) ? t : [t];
    postMessage(
      { id: r, type: n, result: t },
      c.filter((e) =>
        (function isTransferable(e) {
          return [ImageBitmap, ReadableStream, WritableStream].some((t) => e instanceof t);
        })(e)
      )
    );
  }
  function isWorker() {
    return 'undefined' != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope;
  }
  function copy(e, t) {
    if (Array.isArray(t)) t.splice(0, t.length);
    else if ('object' == typeof t) for (const r in t) delete t[r];
    for (const r in e)
      Array.isArray(e[r]) ? ((t[r] = []), copy(e[r], t[r])) : 'object' == typeof e[r] ? ((t[r] = {}), copy(e[r], t[r])) : (t[r] = e[r]);
  }
  createGlobalThisVariable('workerized', {});
  const ve = new WeakMap(),
    Ee = new WeakMap(),
    Te = new WeakMap(),
    Ae = Symbol('anyProducer'),
    Ne = Promise.resolve(),
    $e = Symbol('listenerAdded'),
    Ie = Symbol('listenerRemoved');
  let De = !1,
    ke = !1;
  function assertEventName(e) {
    if ('string' != typeof e && 'symbol' != typeof e && 'number' != typeof e)
      throw new TypeError('`eventName` must be a string, symbol, or number');
  }
  function assertListener(e) {
    if ('function' != typeof e) throw new TypeError('listener must be a function');
  }
  function getListeners(e, t) {
    const r = Ee.get(e);
    if (r.has(t)) return r.get(t);
  }
  function getEventProducers(e, t) {
    const r = 'string' == typeof t || 'symbol' == typeof t || 'number' == typeof t ? t : Ae,
      n = Te.get(e);
    if (n.has(r)) return n.get(r);
  }
  function iterator(e, t) {
    t = Array.isArray(t) ? t : [t];
    let r = !1,
      flush = () => {},
      n = [];
    const c = {
      enqueue(e) {
        n.push(e), flush();
      },
      finish() {
        (r = !0), flush();
      },
    };
    for (const f of t) {
      let t = getEventProducers(e, f);
      if (!t) {
        t = new Set();
        Te.get(e).set(f, t);
      }
      t.add(c);
    }
    return {
      async next() {
        return n
          ? 0 === n.length
            ? r
              ? ((n = void 0), this.next())
              : (await new Promise((e) => {
                  flush = e;
                }),
                this.next())
            : { done: !1, value: await n.shift() }
          : { done: !0 };
      },
      async return(r) {
        n = void 0;
        for (const n of t) {
          const t = getEventProducers(e, n);
          if (t && (t.delete(c), 0 === t.size)) {
            Te.get(e).delete(n);
          }
        }
        return flush(), arguments.length > 0 ? { done: !0, value: await r } : { done: !0 };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
  function defaultMethodNamesOrAssert(e) {
    if (void 0 === e) return Re;
    if (!Array.isArray(e)) throw new TypeError('`methodNames` must be an array of strings');
    for (const t of e)
      if (!Re.includes(t)) {
        if ('string' != typeof t) throw new TypeError('`methodNames` element must be a string');
        throw new Error(`${t} is not Emittery method`);
      }
    return e;
  }
  const isMetaEvent = (e) => e === $e || e === Ie;
  function emitMetaEvent(e, t, r) {
    if (isMetaEvent(t))
      try {
        (De = !0), e.emit(t, r);
      } finally {
        De = !1;
      }
  }
  class Emittery {
    static mixin(e, t) {
      return (
        (t = defaultMethodNamesOrAssert(t)),
        (r) => {
          if ('function' != typeof r) throw new TypeError('`target` must be function');
          for (const e of t) if (void 0 !== r.prototype[e]) throw new Error(`The property \`${e}\` already exists on \`target\``);
          Object.defineProperty(r.prototype, e, {
            enumerable: !1,
            get: function getEmitteryProperty() {
              return Object.defineProperty(this, e, { enumerable: !1, value: new Emittery() }), this[e];
            },
          });
          const emitteryMethodCaller = (t) =>
            function (...r) {
              return this[e][t](...r);
            };
          for (const e of t) Object.defineProperty(r.prototype, e, { enumerable: !1, value: emitteryMethodCaller(e) });
          return r;
        }
      );
    }
    static get isDebugEnabled() {
      var e, t;
      if ('object' != typeof (null == (e = globalThis.process) ? void 0 : e.env)) return ke;
      const { env: r } = null != (t = globalThis.process) ? t : { env: {} };
      return 'emittery' === r.DEBUG || '*' === r.DEBUG || ke;
    }
    static set isDebugEnabled(e) {
      ke = e;
    }
    constructor(e = {}) {
      var t;
      ve.set(this, new Set()),
        Ee.set(this, new Map()),
        Te.set(this, new Map()),
        Te.get(this).set(Ae, new Set()),
        (this.debug = null != (t = e.debug) ? t : {}),
        void 0 === this.debug.enabled && (this.debug.enabled = !1),
        this.debug.logger ||
          (this.debug.logger = (e, t, r, n) => {
            try {
              n = JSON.stringify(n);
            } catch {
              n = `Object with the following keys failed to stringify: ${Object.keys(n).join(',')}`;
            }
            ('symbol' != typeof r && 'number' != typeof r) || (r = r.toString());
            const c = new Date(),
              f = `${c.getHours()}:${c.getMinutes()}:${c.getSeconds()}.${c.getMilliseconds()}`;
            console.log(`[${f}][emittery:${e}][${t}] Event Name: ${r}\n\tdata: ${n}`);
          });
    }
    logIfDebugEnabled(e, t, r) {
      (Emittery.isDebugEnabled || this.debug.enabled) && this.debug.logger(e, this.debug.name, t, r);
    }
    on(e, t) {
      assertListener(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e) {
        assertEventName(r);
        let e = getListeners(this, r);
        if (!e) {
          e = new Set();
          Ee.get(this).set(r, e);
        }
        e.add(t), this.logIfDebugEnabled('subscribe', r, void 0), isMetaEvent(r) || emitMetaEvent(this, $e, { eventName: r, listener: t });
      }
      return this.off.bind(this, e, t);
    }
    off(e, t) {
      assertListener(t), (e = Array.isArray(e) ? e : [e]);
      for (const r of e) {
        assertEventName(r);
        const e = getListeners(this, r);
        if (e && (e.delete(t), 0 === e.size)) {
          Ee.get(this).delete(r);
        }
        this.logIfDebugEnabled('unsubscribe', r, void 0), isMetaEvent(r) || emitMetaEvent(this, Ie, { eventName: r, listener: t });
      }
    }
    once(e) {
      let t;
      const r = new Promise((r) => {
        t = this.on(e, (e) => {
          t(), r(e);
        });
      });
      return (r.off = t), r;
    }
    events(e) {
      e = Array.isArray(e) ? e : [e];
      for (const t of e) assertEventName(t);
      return iterator(this, e);
    }
    async emit(e, t) {
      var r;
      if ((assertEventName(e), isMetaEvent(e) && !De))
        throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
      this.logIfDebugEnabled('emit', e, t),
        (function enqueueProducers(e, t, r) {
          const n = Te.get(e);
          if (n.has(t)) for (const c of n.get(t)) c.enqueue(r);
          if (n.has(Ae)) {
            const e = Promise.all([t, r]);
            for (const t of n.get(Ae)) t.enqueue(e);
          }
        })(this, e, t);
      const n = null != (r = getListeners(this, e)) ? r : new Set(),
        c = ve.get(this),
        f = [...n],
        h = isMetaEvent(e) ? [] : [...c];
      await Ne,
        await Promise.all([
          ...f.map(async (e) => {
            if (n.has(e)) return e(t);
          }),
          ...h.map(async (r) => {
            if (c.has(r)) return r(e, t);
          }),
        ]);
    }
    async emitSerial(e, t) {
      var r;
      if ((assertEventName(e), isMetaEvent(e) && !De))
        throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
      this.logIfDebugEnabled('emitSerial', e, t);
      const n = null != (r = getListeners(this, e)) ? r : new Set(),
        c = ve.get(this),
        f = [...n],
        h = [...c];
      await Ne;
      for (const u of f) n.has(u) && (await u(t));
      for (const u of h) c.has(u) && (await u(e, t));
    }
    onAny(e) {
      return (
        assertListener(e),
        this.logIfDebugEnabled('subscribeAny', void 0, void 0),
        ve.get(this).add(e),
        emitMetaEvent(this, $e, { listener: e }),
        this.offAny.bind(this, e)
      );
    }
    anyEvent() {
      return iterator(this);
    }
    offAny(e) {
      assertListener(e),
        this.logIfDebugEnabled('unsubscribeAny', void 0, void 0),
        emitMetaEvent(this, Ie, { listener: e }),
        ve.get(this).delete(e);
    }
    clearListeners(e) {
      e = Array.isArray(e) ? e : [e];
      for (const t of e)
        if ((this.logIfDebugEnabled('clear', t, void 0), 'string' == typeof t || 'symbol' == typeof t || 'number' == typeof t)) {
          const e = getListeners(this, t);
          e && e.clear();
          const r = getEventProducers(this, t);
          if (r) {
            for (const e of r) e.finish();
            r.clear();
          }
        } else {
          ve.get(this).clear();
          for (const [e, t] of Ee.get(this).entries()) t.clear(), Ee.get(this).delete(e);
          for (const [e, t] of Te.get(this).entries()) {
            for (const e of t) e.finish();
            t.clear(), Te.get(this).delete(e);
          }
        }
    }
    listenerCount(e) {
      var t, r, n, c, f, h;
      e = Array.isArray(e) ? e : [e];
      let u = 0;
      for (const d of e)
        if ('string' != typeof d) {
          void 0 !== d && assertEventName(d), (u += ve.get(this).size);
          for (const e of Ee.get(this).values()) u += e.size;
          for (const e of Te.get(this).values()) u += e.size;
        } else
          u +=
            ve.get(this).size +
            (null != (r = null == (t = getListeners(this, d)) ? void 0 : t.size) ? r : 0) +
            (null != (c = null == (n = getEventProducers(this, d)) ? void 0 : n.size) ? c : 0) +
            (null != (h = null == (f = getEventProducers(this)) ? void 0 : f.size) ? h : 0);
      return u;
    }
    bindMethods(e, t) {
      if ('object' != typeof e || null === e) throw new TypeError('`target` must be an object');
      t = defaultMethodNamesOrAssert(t);
      for (const r of t) {
        if (void 0 !== e[r]) throw new Error(`The property \`${r}\` already exists on \`target\``);
        Object.defineProperty(e, r, { enumerable: !1, value: this[r].bind(this) });
      }
    }
  }
  const Re = Object.getOwnPropertyNames(Emittery.prototype).filter((e) => 'constructor' !== e);
  Object.defineProperty(Emittery, 'listenerAdded', { value: $e, writable: !1, enumerable: !0, configurable: !1 }),
    Object.defineProperty(Emittery, 'listenerRemoved', { value: Ie, writable: !1, enumerable: !0, configurable: !1 });
  const xe = createGlobalThisVariable('registeredWorkers', {});
  isWorker() &&
    (function initWorker() {
      const e = {};
      onmessage = async (t) => {
        const r = t.data;
        switch (r.type) {
          case we.INIT:
            !(function handleCommandInit(e, t) {
              if (!e.args) throw 'Missing className while initializing worker';
              const [r, n] = e.args,
                c = xe[r];
              if (!c) throw `unknown worker class ${r}`;
              (t.instance = new c(e.args.slice(1))),
                copy(n, pe),
                (function isInstanceOfEmittery(e) {
                  return e.onAny && e.emit;
                })(t.instance) &&
                  t.instance.onAny((e, t) => {
                    postCommand({ type: we.EVENT }, { name: e, data: t });
                  }),
                postCommand(e, void 0 !== typeof t.instance);
            })(r, e);
            break;
          case we.FORWARD:
            !(async function handleCommandForward(e, t) {
              const { functionName: r, args: n } = e;
              if (!t.instance) throw 'instance not initialized';
              if (!r) throw 'missing function name to call';
              if (!t.instance[r]) throw `undefined function [${r}] in class ${t.instance.constructor.workerId}`;
              postCommand(e, await t.instance[r](...(null != n ? n : [])));
            })(r, e);
            break;
          case we.TERMINATE:
            !(async function handleCommandTerminate(e, t) {
              const { args: r } = e;
              if (!t.instance) throw 'instance not initialized';
              let n;
              t.instance.terminate && (n = await t.instance.terminate(...(null != r ? r : []))), postCommand(e, n);
            })(r, e);
            break;
          case we.GLOBALS_SYNC:
            !(function handleCommandGlobalsSync(e) {
              if (!e.args) throw 'Missing globals while syncing';
              copy(e.args[0], pe), postCommand(e, {});
            })(r);
        }
      };
    })();
  !(function registerWorker(e, t) {
    (t.workerId = e), isWorker() && (xe[t.workerId] = t);
  })(
    'ProcessorWorker',
    class _ProcessorWorker extends ae {
      constructor() {
        super(...arguments), (this.processor = new Oe());
      }
      async init(e = {}) {
        (this.transformer = new NoiseSuppressionTransformer()),
          this.processor.onAny((e, t) => this.emit(e, t)),
          this.transformer.onAny((e, t) => this.emit(e, t)),
          await this.transformer.init(e),
          await this.processor.setTransformers([this.transformer]);
      }
      transform(e, t) {
        this.processor.transform(e, t);
      }
      setAudioOptions(e, t, r, n, c) {
        this.transformer?.setAudioOptions(e, t, r, n, c);
      }
      enable() {
        this.transformer?.enable();
      }
      disable() {
        this.transformer?.disable();
      }
      async terminate() {
        await this.processor.destroy();
      }
      getLatency() {
        return this.transformer?.getLatency() ?? 0;
      }
      getWasmLatencyNs() {
        return this.transformer?.getWasmLatencyNs() ?? 0;
      }
    }
  );
})();
var V = Object.defineProperty;
var Y = (t, e, r) => (e in t ? V(t, e, { enumerable: true, configurable: true, writable: true, value: r }) : (t[e] = r));
var a = (t, e, r) => (Y(t, typeof e != 'symbol' ? e + '' : e, r), r);
class l {}
a(l, 'updates', {
  transformer_new: 'New transformer',
  transformer_null: 'Null transformer',
}),
  a(l, 'errors', {
    transformer_none: 'No transformers provided',
    transformer_start: 'Cannot start transformer',
    transformer_transform: 'Cannot transform frame',
    transformer_flush: 'Cannot flush transformer',
    readable_null: 'Readable is null',
    writable_null: 'Writable is null',
  });
const h = /* @__PURE__ */ new WeakMap(),
  E = /* @__PURE__ */ new WeakMap(),
  y = /* @__PURE__ */ new WeakMap(),
  O = Symbol('anyProducer'),
  U = Promise.resolve(),
  k = Symbol('listenerAdded'),
  A = Symbol('listenerRemoved');
let x = false;
function g(t) {
  if (typeof t != 'string' && typeof t != 'symbol') throw new TypeError('eventName must be a string or a symbol');
}
function T(t) {
  if (typeof t != 'function') throw new TypeError('listener must be a function');
}
function _(t, e) {
  const r = E.get(t);
  return r.has(e) || r.set(e, /* @__PURE__ */ new Set()), r.get(e);
}
function b(t, e) {
  const r = typeof e == 'string' || typeof e == 'symbol' ? e : O,
    s = y.get(t);
  return s.has(r) || s.set(r, /* @__PURE__ */ new Set()), s.get(r);
}
function q(t, e, r) {
  const s = y.get(t);
  if (s.has(e)) for (const o of s.get(e)) o.enqueue(r);
  if (s.has(O)) {
    const o = Promise.all([e, r]);
    for (const i of s.get(O)) i.enqueue(o);
  }
}
function $(t, e) {
  e = Array.isArray(e) ? e : [e];
  let r = false,
    s = () => {},
    o = [];
  const i = {
    enqueue(n) {
      o.push(n), s();
    },
    finish() {
      (r = true), s();
    },
  };
  for (const n of e) b(t, n).add(i);
  return {
    async next() {
      return o
        ? o.length === 0
          ? r
            ? ((o = void 0), this.next())
            : (await new Promise((n) => {
                s = n;
              }),
              this.next())
          : {
              done: false,
              value: await o.shift(),
            }
        : { done: true };
    },
    async return(n) {
      o = void 0;
      for (const c of e) b(t, c).delete(i);
      return s(), arguments.length > 0 ? { done: true, value: await n } : { done: true };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
function H(t) {
  if (t === void 0) return Q;
  if (!Array.isArray(t)) throw new TypeError('`methodNames` must be an array of strings');
  for (const e of t)
    if (!Q.includes(e))
      throw typeof e != 'string' ? new TypeError('`methodNames` element must be a string') : new Error(`${e} is not Emittery method`);
  return t;
}
const I = (t) => t === k || t === A;
class m {
  static mixin(e, r) {
    return (
      (r = H(r)),
      (s) => {
        if (typeof s != 'function') throw new TypeError('`target` must be function');
        for (const n of r) if (s.prototype[n] !== void 0) throw new Error(`The property \`${n}\` already exists on \`target\``);
        function o() {
          return (
            Object.defineProperty(this, e, {
              enumerable: false,
              value: new m(),
            }),
            this[e]
          );
        }
        Object.defineProperty(s.prototype, e, {
          enumerable: false,
          get: o,
        });
        const i = (n) =>
          function (...c) {
            return this[e][n](...c);
          };
        for (const n of r)
          Object.defineProperty(s.prototype, n, {
            enumerable: false,
            value: i(n),
          });
        return s;
      }
    );
  }
  static get isDebugEnabled() {
    if (typeof process != 'object') return x;
    const { env: e } = process || { env: {} };
    return e.DEBUG === 'emittery' || e.DEBUG === '*' || x;
  }
  static set isDebugEnabled(e) {
    x = e;
  }
  constructor(e = {}) {
    h.set(this, /* @__PURE__ */ new Set()),
      E.set(this, /* @__PURE__ */ new Map()),
      y.set(this, /* @__PURE__ */ new Map()),
      (this.debug = e.debug || {}),
      this.debug.enabled === void 0 && (this.debug.enabled = false),
      this.debug.logger ||
        (this.debug.logger = (r, s, o, i) => {
          try {
            i = JSON.stringify(i);
          } catch {
            i = `Object with the following keys failed to stringify: ${Object.keys(i).join(',')}`;
          }
          typeof o == 'symbol' && (o = o.toString());
          const n = /* @__PURE__ */ new Date(),
            c = `${n.getHours()}:${n.getMinutes()}:${n.getSeconds()}.${n.getMilliseconds()}`;
          console.log(`[${c}][emittery:${r}][${s}] Event Name: ${o}
        data: ${i}`);
        });
  }
  logIfDebugEnabled(e, r, s) {
    (m.isDebugEnabled || this.debug.enabled) && this.debug.logger(e, this.debug.name, r, s);
  }
  on(e, r) {
    T(r), (e = Array.isArray(e) ? e : [e]);
    for (const s of e)
      g(s), _(this, s).add(r), this.logIfDebugEnabled('subscribe', s, void 0), I(s) || this.emit(k, { eventName: s, listener: r });
    return this.off.bind(this, e, r);
  }
  off(e, r) {
    T(r), (e = Array.isArray(e) ? e : [e]);
    for (const s of e)
      g(s), _(this, s).delete(r), this.logIfDebugEnabled('unsubscribe', s, void 0), I(s) || this.emit(A, { eventName: s, listener: r });
  }
  once(e) {
    return new Promise((r) => {
      const s = this.on(e, (o) => {
        s(), r(o);
      });
    });
  }
  events(e) {
    e = Array.isArray(e) ? e : [e];
    for (const r of e) g(r);
    return $(this, e);
  }
  async emit(e, r) {
    g(e), this.logIfDebugEnabled('emit', e, r), q(this, e, r);
    const s = _(this, e),
      o = h.get(this),
      i = [...s],
      n = I(e) ? [] : [...o];
    await U,
      await Promise.all([
        ...i.map(async (c) => {
          if (s.has(c)) return c(r);
        }),
        ...n.map(async (c) => {
          if (o.has(c)) return c(e, r);
        }),
      ]);
  }
  async emitSerial(e, r) {
    g(e), this.logIfDebugEnabled('emitSerial', e, r);
    const s = _(this, e),
      o = h.get(this),
      i = [...s],
      n = [...o];
    await U;
    for (const c of i) s.has(c) && (await c(r));
    for (const c of n) o.has(c) && (await c(e, r));
  }
  onAny(e) {
    return (
      T(e),
      this.logIfDebugEnabled('subscribeAny', void 0, void 0),
      h.get(this).add(e),
      this.emit(k, { listener: e }),
      this.offAny.bind(this, e)
    );
  }
  anyEvent() {
    return $(this);
  }
  offAny(e) {
    T(e), this.logIfDebugEnabled('unsubscribeAny', void 0, void 0), this.emit(A, { listener: e }), h.get(this).delete(e);
  }
  clearListeners(e) {
    e = Array.isArray(e) ? e : [e];
    for (const r of e)
      if ((this.logIfDebugEnabled('clear', r, void 0), typeof r == 'string' || typeof r == 'symbol')) {
        _(this, r).clear();
        const s = b(this, r);
        for (const o of s) o.finish();
        s.clear();
      } else {
        h.get(this).clear();
        for (const s of E.get(this).values()) s.clear();
        for (const s of y.get(this).values()) {
          for (const o of s) o.finish();
          s.clear();
        }
      }
  }
  listenerCount(e) {
    e = Array.isArray(e) ? e : [e];
    let r = 0;
    for (const s of e) {
      if (typeof s == 'string') {
        r += h.get(this).size + _(this, s).size + b(this, s).size + b(this).size;
        continue;
      }
      typeof s < 'u' && g(s), (r += h.get(this).size);
      for (const o of E.get(this).values()) r += o.size;
      for (const o of y.get(this).values()) r += o.size;
    }
    return r;
  }
  bindMethods(e, r) {
    if (typeof e != 'object' || e === null) throw new TypeError('`target` must be an object');
    r = H(r);
    for (const s of r) {
      if (e[s] !== void 0) throw new Error(`The property \`${s}\` already exists on \`target\``);
      Object.defineProperty(e, s, {
        enumerable: false,
        value: this[s].bind(this),
      });
    }
  }
}
const Q = Object.getOwnPropertyNames(m.prototype).filter((t) => t !== 'constructor');
Object.defineProperty(m, 'listenerAdded', {
  value: k,
  writable: false,
  enumerable: true,
  configurable: false,
});
Object.defineProperty(m, 'listenerRemoved', {
  value: A,
  writable: false,
  enumerable: true,
  configurable: false,
});
var L = m;
function J(t) {
  return typeof t == 'object' && t !== null && 'message' in t && typeof t.message == 'string';
}
function X(t) {
  if (J(t)) return t;
  try {
    return new Error(JSON.stringify(t));
  } catch {
    return new Error(String(t));
  }
}
function v(t) {
  return X(t).message;
}
var Z = Object.defineProperty,
  K = (t, e, r) => (e in t ? Z(t, e, { enumerable: true, configurable: true, writable: true, value: r }) : (t[e] = r)),
  N = (t, e, r) => (K(t, typeof e != 'symbol' ? e + '' : e, r), r);
const re = 'hlg.tokbox.com/prod/logging/vcp_webrtc',
  te = 'https://',
  se = 1e4;
let S;
const oe = new Uint8Array(16);
function ie() {
  if (!S && ((S = typeof crypto < 'u' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)), !S))
    throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
  return S(oe);
}
const f = [];
for (let t = 0; t < 256; ++t) f.push((t + 256).toString(16).slice(1));
function ne(t, e = 0) {
  return (
    f[t[e + 0]] +
    f[t[e + 1]] +
    f[t[e + 2]] +
    f[t[e + 3]] +
    '-' +
    f[t[e + 4]] +
    f[t[e + 5]] +
    '-' +
    f[t[e + 6]] +
    f[t[e + 7]] +
    '-' +
    f[t[e + 8]] +
    f[t[e + 9]] +
    '-' +
    f[t[e + 10]] +
    f[t[e + 11]] +
    f[t[e + 12]] +
    f[t[e + 13]] +
    f[t[e + 14]] +
    f[t[e + 15]]
  ).toLowerCase();
}
const ae = typeof crypto < 'u' && crypto.randomUUID && crypto.randomUUID.bind(crypto),
  z = {
    randomUUID: ae,
  };
function ce(t, e, r) {
  if (z.randomUUID && !e && !t) return z.randomUUID();
  t = t || {};
  const s = t.random || (t.rng || ie)();
  if (((s[6] = (s[6] & 15) | 64), (s[8] = (s[8] & 63) | 128), e)) {
    r = r || 0;
    for (let o = 0; o < 16; ++o) e[r + o] = s[o];
    return e;
  }
  return ne(s);
}
function W(t, e) {
  globalThis.vonage || (globalThis.vonage = {}), globalThis.vonage.workerizer || (globalThis.vonage.workerizer = {});
  let r = globalThis.vonage.workerizer;
  return r[t] || (r[t] = e), r[t];
}
const p = W('globals', {});
var d = /* @__PURE__ */ ((t) => (
  (t.INIT = 'INIT'), (t.FORWARD = 'FORWARD'), (t.TERMINATE = 'TERMINATE'), (t.GLOBALS_SYNC = 'GLOBALS_SYNC'), t
))(d || {});
function j(t) {
  return [ImageBitmap, ReadableStream, WritableStream].some((e) => t instanceof e);
}
let fe = 0;
function le(t, e, r, s, o) {
  const i = fe++;
  return (
    t.postMessage(
      {
        id: i,
        type: e,
        functionName: r,
        args: s,
      },
      s.filter((n) => j(n))
    ),
    new Promise((n) => {
      o == null || o.set(i, n);
    })
  );
}
function w(t, e) {
  const { id: r, type: s } = t,
    o = Array.isArray(e) ? e : [e];
  postMessage(
    {
      id: r,
      type: s,
      result: e,
    },
    o.filter((i) => j(i))
  );
}
const G = W('workerized', {});
function B() {
  return typeof WorkerGlobalScope < 'u' && self instanceof WorkerGlobalScope;
}
async function ue() {
  if (B()) w({ type: d.GLOBALS_SYNC }, p);
  else {
    const t = [];
    for (const e in G) {
      const { worker: r, resolvers: s } = G[e].workerContext;
      r && t.push(le(r, d.GLOBALS_SYNC, '', [p], s));
    }
    await Promise.all(t);
  }
}
function P(t, e) {
  if (Array.isArray(e)) e.splice(0, e.length);
  else if (typeof e == 'object') for (const r in e) delete e[r];
  for (const r in t)
    Array.isArray(t[r]) ? ((e[r] = []), P(t[r], e[r])) : typeof t[r] == 'object' ? ((e[r] = {}), P(t[r], e[r])) : (e[r] = t[r]);
}
async function he(t, e) {
  const { functionName: r, args: s } = t;
  if (!e.instance) throw 'instance not initialized';
  if (!r) throw 'missing function name to call';
  if (!e.instance[r]) throw `undefined function [${r}] in class ${e.instance.constructor.workerId}`;
  w(t, await e.instance[r](...(s != null ? s : [])));
}
const pe = W('registeredWorkers', {});
function de(t, e) {
  if (!t.args) throw 'Missing className while initializing worker';
  const [r, s] = t.args,
    o = pe[r];
  if (o) e.instance = new o(t.args.slice(1));
  else throw `unknown worker class ${r}`;
  P(s, p), w(t, typeof e.instance !== void 0);
}
async function me(t, e) {
  const { args: r } = t;
  if (!e.instance) throw 'instance not initialized';
  let s;
  e.instance.terminate && (s = await e.instance.terminate(...(r != null ? r : []))), w(t, s);
}
function ge(t) {
  if (!t.args) throw 'Missing globals while syncing';
  P(t.args[0], p), w(t, {});
}
function _e() {
  const t = {};
  onmessage = async (e) => {
    const r = e.data;
    switch (r.type) {
      case d.INIT:
        de(r, t);
        break;
      case d.FORWARD:
        he(r, t);
        break;
      case d.TERMINATE:
        me(r, t);
        break;
      case d.GLOBALS_SYNC:
        ge(r);
        break;
    }
  };
}
B() && _e();
function ye(t, e) {
  return (
    p[t] || (p[t] = e),
    [
      () => p[t],
      async (r) => {
        (p[t] = r), await ue();
      },
    ]
  );
}
function be(t, e) {
  return ye(t, e);
}
const [we, Te] = be('metadata');
function C() {
  return we();
}
class D {
  constructor(e) {
    N(this, 'uuid', ce()), (this.config = e);
  }
  async send(e) {
    var r, s, o;
    const { appId: i, sourceType: n } = (r = C()) != null ? r : {};
    if (!i || !n) return 'metadata missing';
    const c = new AbortController(),
      u = setTimeout(() => c.abort(), se);
    return (
      await ((o = (s = this.config) == null ? void 0 : s.fetch) != null ? o : fetch)(this.getUrl(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(this.buildReport(e)),
        signal: c.signal,
      }),
      clearTimeout(u),
      'success'
    );
  }
  getUrl() {
    var e;
    let r = (e = C().proxyUrl) != null ? e : te;
    return (r += (r.at(-1) === '/' ? '' : '/') + re), r;
  }
  getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }
  buildReport(e) {
    const r = C();
    return {
      guid: this.uuid,
      ...e,
      applicationId: r.appId,
      timestamp: Date.now(),
      proxyUrl: r.proxyUrl,
      source: r.sourceType,
    };
  }
}
const R = '2.0.3';
class Se {
  constructor(e) {
    a(this, 'frameTransformedCount', 0);
    a(this, 'frameFromSourceCount', 0);
    a(this, 'startAt', 0);
    a(this, 'reporter');
    (this.config = e), (this.reporter = new D(e));
  }
  async onFrameFromSource() {
    this.frameFromSourceCount++;
  }
  get fps() {
    const { startAt: e, frameFromSourceCount: r } = this,
      o = (Date.now() - e) / 1e3;
    return r / o;
  }
  async onFrameTransformed(e = {}, r = false) {
    this.startAt === 0 && (this.startAt = Date.now()), this.frameTransformedCount++;
    const { startAt: s, frameTransformedCount: o, frameFromSourceCount: i } = this,
      n = Date.now(),
      c = (n - s) / 1e3,
      u = o / c,
      M = i / c;
    return r || this.frameTransformedCount >= this.config.loggingIntervalFrameCount
      ? ((this.frameFromSourceCount = 0),
        (this.frameTransformedCount = 0),
        (this.startAt = n),
        (this.reporter.config = this.config),
        this.reporter.send({
          ...this.config.report,
          variation: 'QoS',
          fps: M,
          transformedFps: u,
          framesTransformed: o,
          ...e,
        }))
      : 'success';
  }
}
var F = /* @__PURE__ */ ((t) => (
  (t.pipeline_ended = 'pipeline_ended'),
  (t.pipeline_ended_with_error = 'pipeline_ended_with_error'),
  (t.pipeline_started = 'pipeline_started'),
  (t.pipeline_started_with_error = 'pipeline_started_with_error'),
  (t.pipeline_restarted = 'pipeline_restarted'),
  (t.pipeline_restarted_with_error = 'pipeline_restarted_with_error'),
  t
))(F || {});
const ke = 500,
  Ae = 0.8;
class Pe extends L {
  constructor(r, s) {
    super();
    a(this, 'reporter_', new D());
    a(
      this,
      'reporterQos_',
      new Se({
        loggingIntervalFrameCount: ke,
        report: {
          version: R,
        },
      })
    );
    a(this, 'transformerType_');
    a(this, 'transformer_');
    a(this, 'shouldStop_');
    a(this, 'isFlashed_');
    a(this, 'mediaTransformerQosReportStartTimestamp_');
    a(this, 'videoHeight_');
    a(this, 'videoWidth_');
    a(this, 'trackExpectedRate_');
    a(this, 'index_');
    a(this, 'controller_');
    (this.index_ = s),
      (this.transformer_ = r),
      (this.shouldStop_ = false),
      (this.isFlashed_ = false),
      (this.mediaTransformerQosReportStartTimestamp_ = 0),
      (this.videoHeight_ = 0),
      (this.videoWidth_ = 0),
      (this.trackExpectedRate_ = -1),
      (this.transformerType_ = 'Custom'),
      'getTransformerType' in r && (this.transformerType_ = r.getTransformerType()),
      this.report({
        variation: 'Create',
      });
  }
  setTrackExpectedRate(r) {
    this.trackExpectedRate_ = r;
  }
  async start(r) {
    if (((this.controller_ = r), this.transformer_ && typeof this.transformer_.start == 'function'))
      try {
        await this.transformer_.start(r);
      } catch (s) {
        this.report({
          message: l.errors.transformer_start,
          variation: 'Error',
          error: v(s),
        });
        const o = { eventMetaData: { transformerIndex: this.index_ }, error: s, function: 'start' };
        this.emit('error', o);
      }
  }
  async transform(r, s) {
    var o, i, n, c;
    if (
      (this.mediaTransformerQosReportStartTimestamp_ === 0 && (this.mediaTransformerQosReportStartTimestamp_ = Date.now()),
      r instanceof VideoFrame &&
        ((this.videoHeight_ = (o = r == null ? void 0 : r.displayHeight) != null ? o : 0),
        (this.videoWidth_ = (i = r == null ? void 0 : r.displayWidth) != null ? i : 0)),
      this.reporterQos_.onFrameFromSource(),
      this.transformer_)
    )
      if (this.shouldStop_) console.warn('[Pipeline] flush from transform'), r.close(), this.flush(s), s.terminate();
      else {
        try {
          await ((c = (n = this.transformer_).transform) == null ? void 0 : c.call(n, r, s)), this.reportQos();
        } catch (u) {
          this.report({
            message: l.errors.transformer_transform,
            variation: 'Error',
            error: v(u),
          });
          const M = { eventMetaData: { transformerIndex: this.index_ }, error: u, function: 'transform' };
          this.emit('error', M);
        }
        if (this.trackExpectedRate_ != -1 && this.trackExpectedRate_ * Ae > this.reporterQos_.fps) {
          const u = {
            eventMetaData: {
              transformerIndex: this.index_,
            },
            warningType: 'fps_drop',
            dropInfo: {
              requested: this.trackExpectedRate_,
              current: this.reporterQos_.fps,
            },
          };
          this.emit('warn', u);
        }
      }
  }
  async flush(r) {
    if (this.transformer_ && typeof this.transformer_.flush == 'function' && !this.isFlashed_) {
      this.isFlashed_ = true;
      try {
        await this.transformer_.flush(r);
      } catch (s) {
        this.report({
          message: l.errors.transformer_flush,
          variation: 'Error',
          error: v(s),
        });
        const o = { eventMetaData: { transformerIndex: this.index_ }, error: s, function: 'flush' };
        this.emit('error', o);
      }
    }
    this.reportQos(true),
      this.report({
        variation: 'Delete',
      });
  }
  stop() {
    console.log('[Pipeline] Stop stream.'),
      this.controller_ && (this.flush(this.controller_), this.controller_.terminate()),
      (this.shouldStop_ = true);
  }
  report(r) {
    this.reporter_.send({
      version: R,
      action: 'MediaTransformer',
      transformerType: this.transformerType_,
      ...r,
    });
  }
  reportQos(r = false) {
    (this.reporterQos_.config = {
      ...this.reporterQos_.config,
    }),
      this.reporterQos_.onFrameTransformed(
        {
          version: R,
          action: 'MediaTransformer',
          transformerType: this.transformerType_,
          videoWidth: this.videoWidth_,
          videoHeight: this.videoHeight_,
        },
        r
      );
  }
}
class Me extends L {
  constructor(r) {
    super();
    a(this, 'transformers_');
    a(this, 'trackExpectedRate_');
    (this.transformers_ = []), (this.trackExpectedRate_ = -1);
    for (let s = 0; s < r.length; s++) {
      let o = new Pe(r[s], s);
      o.on('error', (i) => {
        this.emit('error', i);
      }),
        o.on('warn', (i) => {
          this.emit('warn', i);
        }),
        this.transformers_.push(o);
    }
  }
  setTrackExpectedRate(r) {
    this.trackExpectedRate_ = r;
    for (let s of this.transformers_) s.setTrackExpectedRate(this.trackExpectedRate_);
  }
  async start(r, s) {
    if (!this.transformers_ || this.transformers_.length === 0) {
      console.log('[Pipeline] No transformers.');
      return;
    }
    try {
      let o = r;
      for (let i of this.transformers_) r = r.pipeThrough(new TransformStream(i));
      r.pipeTo(s)
        .then(async () => {
          console.log('[Pipeline] Setup.'), await s.abort(), await o.cancel(), this.emit('pipelineInfo', 'pipeline_ended');
        })
        .catch(async (i) => {
          r
            .cancel()
            .then(() => {
              console.log('[Pipeline] Shutting down streams after abort.');
            })
            .catch((n) => {
              console.error('[Pipeline] Error from stream transform:', n);
            }),
            await s.abort(i),
            await o.cancel(i),
            this.emit('pipelineInfo', 'pipeline_ended_with_error');
        });
    } catch {
      this.emit('pipelineInfo', 'pipeline_started_with_error'), this.destroy();
      return;
    }
    this.emit('pipelineInfo', 'pipeline_started'), console.log('[Pipeline] Pipeline started.');
  }
  async destroy() {
    console.log('[Pipeline] Destroying Pipeline.');
    for (let r of this.transformers_) r.stop();
  }
}
class Oe extends L {
  constructor() {
    super();
    a(this, 'reporter_');
    a(this, 'pipeline_');
    a(this, 'transformers_');
    a(this, 'readable_');
    a(this, 'writable_');
    a(this, 'trackExpectedRate_');
    (this.reporter_ = new D()),
      (this.trackExpectedRate_ = -1),
      this.report({
        variation: 'Create',
      });
  }
  setTrackExpectedRate(r) {
    (this.trackExpectedRate_ = r), this.pipeline_ && this.pipeline_.setTrackExpectedRate(this.trackExpectedRate_);
  }
  transform(r, s) {
    return (this.readable_ = r), (this.writable_ = s), this.transformInternal();
  }
  transformInternal() {
    return new Promise(async (r, s) => {
      if (!this.transformers_ || this.transformers_.length === 0) {
        this.report({
          message: l.errors.transformer_none,
          variation: 'Error',
        }),
          s('[MediaProcessor] Need to set transformers.');
        return;
      }
      if (!this.readable_) {
        this.report({
          variation: 'Error',
          message: l.errors.readable_null,
        }),
          s('[MediaProcessor] Readable is null.');
        return;
      }
      if (!this.writable_) {
        this.report({
          variation: 'Error',
          message: l.errors.writable_null,
        }),
          s('[MediaProcessor] Writable is null.');
        return;
      }
      let o = false;
      this.pipeline_ && ((o = true), this.pipeline_.clearListeners(), this.pipeline_.destroy()),
        (this.pipeline_ = new Me(this.transformers_)),
        this.pipeline_.on('warn', (i) => {
          this.emit('warn', i);
        }),
        this.pipeline_.on('error', (i) => {
          this.emit('error', i);
        }),
        this.pipeline_.on('pipelineInfo', (i) => {
          o &&
            (i === 'pipeline_started'
              ? (i = F.pipeline_restarted)
              : i === 'pipeline_started_with_error' && (i = F.pipeline_restarted_with_error)),
            this.emit('pipelineInfo', i);
        }),
        this.trackExpectedRate_ != -1 && this.pipeline_.setTrackExpectedRate(this.trackExpectedRate_),
        this.pipeline_
          .start(this.readable_, this.writable_)
          .then(() => {
            r();
          })
          .catch((i) => {
            s(i);
          });
    });
  }
  setTransformers(r) {
    return (
      this.report({
        variation: 'Update',
        message: l.updates.transformer_new,
      }),
      (this.transformers_ = r),
      this.readable_ && this.writable_ ? this.transformInternal() : Promise.resolve()
    );
  }
  destroy() {
    return new Promise(async (r) => {
      this.pipeline_ && this.pipeline_.destroy(), this.report({ variation: 'Delete' }), r();
    });
  }
  report(r) {
    this.reporter_.send({
      version: R,
      action: 'MediaProcessor',
      ...r,
    });
  }
}
class xe {
  constructor() {
    a(this, 'processor_');
    a(this, 'generator_');
    (this.processor_ = null), (this.generator_ = null);
  }
  init(e) {
    return new Promise((r, s) => {
      try {
        this.processor_ = new MediaStreamTrackProcessor(e);
      } catch (o) {
        console.log(`[InsertableStreamHelper] MediaStreamTrackProcessor failed: ${o}`), s(o);
      }
      try {
        e.kind === 'audio'
          ? (this.generator_ = new MediaStreamTrackGenerator({ kind: 'audio' }))
          : e.kind === 'video'
          ? (this.generator_ = new MediaStreamTrackGenerator({ kind: 'video' }))
          : s('kind not supported');
      } catch (o) {
        console.log(`[InsertableStreamHelper] MediaStreamTrackGenerator failed: ${o}`), s(o);
      }
      r();
    });
  }
  getReadable() {
    return this.processor_.readable;
  }
  getWriteable() {
    return this.generator_.writable;
  }
  getProccesorTrack() {
    return this.generator_;
  }
}
class Fe {
  constructor(e) {
    a(this, 'insertableStreamHelper_');
    a(this, 'mediaProcessor_');
    (this.insertableStreamHelper_ = new xe()), (this.mediaProcessor_ = e);
  }
  setTrack(e) {
    return new Promise((r, s) => {
      this.insertableStreamHelper_
        .init(e)
        .then(() => {
          this.mediaProcessor_
            .transform(this.insertableStreamHelper_.getReadable(), this.insertableStreamHelper_.getWriteable())
            .then(() => {
              r(this.insertableStreamHelper_.getProccesorTrack());
            })
            .catch((o) => {
              s(o);
            });
        })
        .catch((o) => {
          s(o);
        });
    });
  }
  destroy() {
    return new Promise((e, r) => {
      this.mediaProcessor_
        ? this.mediaProcessor_
            .destroy()
            .then(() => {
              e();
            })
            .catch((s) => {
              r(s);
            })
        : r('no processor');
    });
  }
}
const anyMap$1 = /* @__PURE__ */ new WeakMap();
const eventsMap$1 = /* @__PURE__ */ new WeakMap();
const producersMap$1 = /* @__PURE__ */ new WeakMap();
const anyProducer$1 = Symbol('anyProducer');
const resolvedPromise$1 = Promise.resolve();
const listenerAdded$1 = Symbol('listenerAdded');
const listenerRemoved$1 = Symbol('listenerRemoved');
let canEmitMetaEvents$1 = false;
let isGlobalDebugEnabled$1 = false;
function assertEventName$1(eventName) {
  if (typeof eventName !== 'string' && typeof eventName !== 'symbol' && typeof eventName !== 'number') {
    throw new TypeError('`eventName` must be a string, symbol, or number');
  }
}
function assertListener$1(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }
}
function getListeners$1(instance, eventName) {
  const events = eventsMap$1.get(instance);
  if (!events.has(eventName)) {
    return;
  }
  return events.get(eventName);
}
function getEventProducers$1(instance, eventName) {
  const key = typeof eventName === 'string' || typeof eventName === 'symbol' || typeof eventName === 'number' ? eventName : anyProducer$1;
  const producers = producersMap$1.get(instance);
  if (!producers.has(key)) {
    return;
  }
  return producers.get(key);
}
function enqueueProducers$1(instance, eventName, eventData) {
  const producers = producersMap$1.get(instance);
  if (producers.has(eventName)) {
    for (const producer of producers.get(eventName)) {
      producer.enqueue(eventData);
    }
  }
  if (producers.has(anyProducer$1)) {
    const item = Promise.all([eventName, eventData]);
    for (const producer of producers.get(anyProducer$1)) {
      producer.enqueue(item);
    }
  }
}
function iterator$1(instance, eventNames) {
  eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
  let isFinished = false;
  let flush = () => {};
  let queue = [];
  const producer = {
    enqueue(item) {
      queue.push(item);
      flush();
    },
    finish() {
      isFinished = true;
      flush();
    },
  };
  for (const eventName of eventNames) {
    let set = getEventProducers$1(instance, eventName);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      const producers = producersMap$1.get(instance);
      producers.set(eventName, set);
    }
    set.add(producer);
  }
  return {
    async next() {
      if (!queue) {
        return { done: true };
      }
      if (queue.length === 0) {
        if (isFinished) {
          queue = void 0;
          return this.next();
        }
        await new Promise((resolve) => {
          flush = resolve;
        });
        return this.next();
      }
      return {
        done: false,
        value: await queue.shift(),
      };
    },
    async return(value) {
      queue = void 0;
      for (const eventName of eventNames) {
        const set = getEventProducers$1(instance, eventName);
        if (set) {
          set.delete(producer);
          if (set.size === 0) {
            const producers = producersMap$1.get(instance);
            producers.delete(eventName);
          }
        }
      }
      flush();
      return arguments.length > 0 ? { done: true, value: await value } : { done: true };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
function defaultMethodNamesOrAssert$1(methodNames) {
  if (methodNames === void 0) {
    return allEmitteryMethods$1;
  }
  if (!Array.isArray(methodNames)) {
    throw new TypeError('`methodNames` must be an array of strings');
  }
  for (const methodName of methodNames) {
    if (!allEmitteryMethods$1.includes(methodName)) {
      if (typeof methodName !== 'string') {
        throw new TypeError('`methodNames` element must be a string');
      }
      throw new Error(`${methodName} is not Emittery method`);
    }
  }
  return methodNames;
}
const isMetaEvent$1 = (eventName) => eventName === listenerAdded$1 || eventName === listenerRemoved$1;
function emitMetaEvent$1(emitter, eventName, eventData) {
  if (isMetaEvent$1(eventName)) {
    try {
      canEmitMetaEvents$1 = true;
      emitter.emit(eventName, eventData);
    } finally {
      canEmitMetaEvents$1 = false;
    }
  }
}
let Emittery$1 = class Emittery {
  static mixin(emitteryPropertyName, methodNames) {
    methodNames = defaultMethodNamesOrAssert$1(methodNames);
    return (target) => {
      if (typeof target !== 'function') {
        throw new TypeError('`target` must be function');
      }
      for (const methodName of methodNames) {
        if (target.prototype[methodName] !== void 0) {
          throw new Error(`The property \`${methodName}\` already exists on \`target\``);
        }
      }
      function getEmitteryProperty() {
        Object.defineProperty(this, emitteryPropertyName, {
          enumerable: false,
          value: new Emittery(),
        });
        return this[emitteryPropertyName];
      }
      Object.defineProperty(target.prototype, emitteryPropertyName, {
        enumerable: false,
        get: getEmitteryProperty,
      });
      const emitteryMethodCaller = (methodName) =>
        function (...args) {
          return this[emitteryPropertyName][methodName](...args);
        };
      for (const methodName of methodNames) {
        Object.defineProperty(target.prototype, methodName, {
          enumerable: false,
          value: emitteryMethodCaller(methodName),
        });
      }
      return target;
    };
  }
  static get isDebugEnabled() {
    if (typeof globalThis.process?.env !== 'object') {
      return isGlobalDebugEnabled$1;
    }
    const { env } = globalThis.process ?? { env: {} };
    return env.DEBUG === 'emittery' || env.DEBUG === '*' || isGlobalDebugEnabled$1;
  }
  static set isDebugEnabled(newValue) {
    isGlobalDebugEnabled$1 = newValue;
  }
  constructor(options = {}) {
    anyMap$1.set(this, /* @__PURE__ */ new Set());
    eventsMap$1.set(this, /* @__PURE__ */ new Map());
    producersMap$1.set(this, /* @__PURE__ */ new Map());
    producersMap$1.get(this).set(anyProducer$1, /* @__PURE__ */ new Set());
    this.debug = options.debug ?? {};
    if (this.debug.enabled === void 0) {
      this.debug.enabled = false;
    }
    if (!this.debug.logger) {
      this.debug.logger = (type, debugName, eventName, eventData) => {
        try {
          eventData = JSON.stringify(eventData);
        } catch {
          eventData = `Object with the following keys failed to stringify: ${Object.keys(eventData).join(',')}`;
        }
        if (typeof eventName === 'symbol' || typeof eventName === 'number') {
          eventName = eventName.toString();
        }
        const currentTime = /* @__PURE__ */ new Date();
        const logTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}.${currentTime.getMilliseconds()}`;
        console.log(`[${logTime}][emittery:${type}][${debugName}] Event Name: ${eventName}
        data: ${eventData}`);
      };
    }
  }
  logIfDebugEnabled(type, eventName, eventData) {
    if (Emittery.isDebugEnabled || this.debug.enabled) {
      this.debug.logger(type, this.debug.name, eventName, eventData);
    }
  }
  on(eventNames, listener) {
    assertListener$1(listener);
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName$1(eventName);
      let set = getListeners$1(this, eventName);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        const events = eventsMap$1.get(this);
        events.set(eventName, set);
      }
      set.add(listener);
      this.logIfDebugEnabled('subscribe', eventName, void 0);
      if (!isMetaEvent$1(eventName)) {
        emitMetaEvent$1(this, listenerAdded$1, { eventName, listener });
      }
    }
    return this.off.bind(this, eventNames, listener);
  }
  off(eventNames, listener) {
    assertListener$1(listener);
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName$1(eventName);
      const set = getListeners$1(this, eventName);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          const events = eventsMap$1.get(this);
          events.delete(eventName);
        }
      }
      this.logIfDebugEnabled('unsubscribe', eventName, void 0);
      if (!isMetaEvent$1(eventName)) {
        emitMetaEvent$1(this, listenerRemoved$1, { eventName, listener });
      }
    }
  }
  once(eventNames) {
    let off_;
    const promise = new Promise((resolve) => {
      off_ = this.on(eventNames, (data) => {
        off_();
        resolve(data);
      });
    });
    promise.off = off_;
    return promise;
  }
  events(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName$1(eventName);
    }
    return iterator$1(this, eventNames);
  }
  async emit(eventName, eventData) {
    assertEventName$1(eventName);
    if (isMetaEvent$1(eventName) && !canEmitMetaEvents$1) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
    }
    this.logIfDebugEnabled('emit', eventName, eventData);
    enqueueProducers$1(this, eventName, eventData);
    const listeners = getListeners$1(this, eventName) ?? /* @__PURE__ */ new Set();
    const anyListeners = anyMap$1.get(this);
    const staticListeners = [...listeners];
    const staticAnyListeners = isMetaEvent$1(eventName) ? [] : [...anyListeners];
    await resolvedPromise$1;
    await Promise.all([
      ...staticListeners.map(async (listener) => {
        if (listeners.has(listener)) {
          return listener(eventData);
        }
      }),
      ...staticAnyListeners.map(async (listener) => {
        if (anyListeners.has(listener)) {
          return listener(eventName, eventData);
        }
      }),
    ]);
  }
  async emitSerial(eventName, eventData) {
    assertEventName$1(eventName);
    if (isMetaEvent$1(eventName) && !canEmitMetaEvents$1) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
    }
    this.logIfDebugEnabled('emitSerial', eventName, eventData);
    const listeners = getListeners$1(this, eventName) ?? /* @__PURE__ */ new Set();
    const anyListeners = anyMap$1.get(this);
    const staticListeners = [...listeners];
    const staticAnyListeners = [...anyListeners];
    await resolvedPromise$1;
    for (const listener of staticListeners) {
      if (listeners.has(listener)) {
        await listener(eventData);
      }
    }
    for (const listener of staticAnyListeners) {
      if (anyListeners.has(listener)) {
        await listener(eventName, eventData);
      }
    }
  }
  onAny(listener) {
    assertListener$1(listener);
    this.logIfDebugEnabled('subscribeAny', void 0, void 0);
    anyMap$1.get(this).add(listener);
    emitMetaEvent$1(this, listenerAdded$1, { listener });
    return this.offAny.bind(this, listener);
  }
  anyEvent() {
    return iterator$1(this);
  }
  offAny(listener) {
    assertListener$1(listener);
    this.logIfDebugEnabled('unsubscribeAny', void 0, void 0);
    emitMetaEvent$1(this, listenerRemoved$1, { listener });
    anyMap$1.get(this).delete(listener);
  }
  clearListeners(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      this.logIfDebugEnabled('clear', eventName, void 0);
      if (typeof eventName === 'string' || typeof eventName === 'symbol' || typeof eventName === 'number') {
        const set = getListeners$1(this, eventName);
        if (set) {
          set.clear();
        }
        const producers = getEventProducers$1(this, eventName);
        if (producers) {
          for (const producer of producers) {
            producer.finish();
          }
          producers.clear();
        }
      } else {
        anyMap$1.get(this).clear();
        for (const [eventName2, listeners] of eventsMap$1.get(this).entries()) {
          listeners.clear();
          eventsMap$1.get(this).delete(eventName2);
        }
        for (const [eventName2, producers] of producersMap$1.get(this).entries()) {
          for (const producer of producers) {
            producer.finish();
          }
          producers.clear();
          producersMap$1.get(this).delete(eventName2);
        }
      }
    }
  }
  listenerCount(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    let count = 0;
    for (const eventName of eventNames) {
      if (typeof eventName === 'string') {
        count +=
          anyMap$1.get(this).size +
          (getListeners$1(this, eventName)?.size ?? 0) +
          (getEventProducers$1(this, eventName)?.size ?? 0) +
          (getEventProducers$1(this)?.size ?? 0);
        continue;
      }
      if (typeof eventName !== 'undefined') {
        assertEventName$1(eventName);
      }
      count += anyMap$1.get(this).size;
      for (const value of eventsMap$1.get(this).values()) {
        count += value.size;
      }
      for (const value of producersMap$1.get(this).values()) {
        count += value.size;
      }
    }
    return count;
  }
  bindMethods(target, methodNames) {
    if (typeof target !== 'object' || target === null) {
      throw new TypeError('`target` must be an object');
    }
    methodNames = defaultMethodNamesOrAssert$1(methodNames);
    for (const methodName of methodNames) {
      if (target[methodName] !== void 0) {
        throw new Error(`The property \`${methodName}\` already exists on \`target\``);
      }
      Object.defineProperty(target, methodName, {
        enumerable: false,
        value: this[methodName].bind(this),
      });
    }
  }
};
const allEmitteryMethods$1 = Object.getOwnPropertyNames(Emittery$1.prototype).filter((v2) => v2 !== 'constructor');
Object.defineProperty(Emittery$1, 'listenerAdded', {
  value: listenerAdded$1,
  writable: false,
  enumerable: true,
  configurable: false,
});
Object.defineProperty(Emittery$1, 'listenerRemoved', {
  value: listenerRemoved$1,
  writable: false,
  enumerable: true,
  configurable: false,
});
const version = '1.0.0-beta.2';
class Average {
  constructor(size) {
    this.size = size;
    this.values = [];
    this.sum = 0;
  }
  push(value) {
    this.values.push(value);
    this.sum += value;
    while (this.size < this.values.length) {
      this.sum -= this.values.shift() ?? 0;
    }
  }
  value() {
    return this.sum / Math.max(1, this.values.length);
  }
}
const defaultAssetsDirBaseUrl = `https://d3opqjmqzxf057.cloudfront.net/noise-suppression/${version}`;
class NoiseSuppressionTransformer extends Emittery$1 {
  constructor() {
    super();
    this.isEnabled = true;
    this.internalResampleSupported = false;
    this.latency = new Average(100);
    this.transform = this.transformAudioData.bind(this);
  }
  /**
   * Initialize the transformer.
   * It is mandatory to call this function before using the transformer
   * @param options Options used to initialize the transformer
   */
  async init(options) {
    console.log('Noise suppression transformer initialization');
    this.transform = options.debug ? this.transformDebug.bind(this) : this.transformAudioData.bind(this);
    const assetsDirBaseUrl = options.assetsDirBaseUrl ?? defaultAssetsDirBaseUrl;
    const locateFile = (name) => {
      return `${assetsDirBaseUrl}/${name}`;
    };
    let numberOfThreads = 1;
    if (await this.isMonoThread(options)) {
      this.wasmInstance = await createWasmMonoInstance({
        locateFile,
        mainScriptUrlOrBlob: locateFile('main-bin-mono.js'),
      });
    } else {
      this.wasmInstance = await createWasmMultiInstance({
        locateFile,
        mainScriptUrlOrBlob: locateFile('main-bin-multi.js'),
      });
      numberOfThreads = 3;
    }
    this.wasmTransformer = new this.wasmInstance.DtlnTransformer();
    await Promise.all([this.loadModel(`${assetsDirBaseUrl}/model_1.tflite`, 1), this.loadModel(`${assetsDirBaseUrl}/model_2.tflite`, 2)]);
    let result;
    try {
      result = this.wasmTransformer?.init(numberOfThreads);
    } catch (e) {
      if (typeof e == 'number') {
        let msg = '';
        for (let i = 0; i < 500; ++i) {
          msg += String.fromCharCode(this.wasmInstance.HEAP8[e + i]);
        }
        console.error(msg);
      } else {
        console.error(e);
      }
    }
    if (result !== 0) {
      const msg = `Fail to init wasm transformer, error code = ${result}`;
      console.error(msg);
      throw msg;
    }
    this.internalResampleSupported = this.wasmTransformer?.getInternalResampleSupported();
    if (!this.internalResampleSupported) {
      const msg = `Internal resampling not supported`;
      console.error(msg);
      throw msg;
    }
    console.log('Noise suppression transformer ready');
  }
  /**
   * Tell to the transformer what preprocessing are applied before reaching this transformer
   */
  setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter) {
    this.wasmTransformer?.setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter);
  }
  /**
   * Enable the noise reduction
   */
  enable() {
    this.isEnabled = true;
  }
  /**
   * Disable the noise reduction
   */
  disable() {
    this.isEnabled = false;
  }
  /**
   * Return the latency of the transformation
   * The latency will be computed only if the options debug flag is true
   * Otherwise, will return 0;
   * @returns latency
   */
  getLatency() {
    return this.latency.value();
  }
  /**
   * Return the latency of processing within the wasm in nanoseconds.
   * @returns latency
   */
  getWasmLatencyNs() {
    return this.wasmInstance.getLatencyNs();
  }
  async transformDebug(data, controller) {
    try {
      const start = performance.now();
      await this.transformAudioData(data, controller);
      this.latency.push(performance.now() - start);
    } catch (e) {
      console.error(e);
    }
  }
  async transformAudioData(data, controller) {
    if (!this.wasmTransformer) {
      this.emit('warning', 'transformer not initialized');
    }
    if (this.isEnabled && this.wasmTransformer) {
      try {
        const dataAsFloat32 = this.getAudioDataAsFloat32(data);
        const dataAsInt16 = this.convertTypedArray(dataAsFloat32, Int16Array, 2 ** 15 - 1);
        this.wasmTransformer.getInputFrame(data.numberOfFrames).set(dataAsInt16);
        let outputSize = 0;
        try {
          outputSize = this.wasmTransformer.runAlgorithm(data.numberOfFrames, data.sampleRate, data.numberOfChannels);
        } catch (e) {
          if (typeof e == 'number') {
            let msg = '';
            for (let i = 0; i < 500; ++i) {
              msg += String.fromCharCode(this.wasmInstance.HEAP8[e + i]);
            }
            console.error(msg);
          } else {
            console.error(e);
          }
        }
        if (outputSize > 0) {
          const output = this.wasmTransformer.getOutputFrame().slice(0, outputSize);
          const outputAsFloat32 = this.convertTypedArray(output, Float32Array, 1 / (2 ** 15 - 1));
          const { timestamp, sampleRate, numberOfChannels } = data;
          data = new AudioData({
            data: outputAsFloat32,
            format: 'f32-planar',
            numberOfChannels,
            numberOfFrames: outputAsFloat32.length,
            sampleRate,
            timestamp,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    controller.enqueue(data);
  }
  async loadModel(url, modelIndex) {
    if (!this.wasmTransformer) return;
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const size = buffer.byteLength;
    const functionName = `getModel${modelIndex}`;
    const wasmBuffer = this.wasmTransformer[functionName](size);
    if (wasmBuffer) {
      const bufferUint8 = new Uint8Array(buffer);
      wasmBuffer.set(bufferUint8);
    }
  }
  getAudioDataAsFloat32(data) {
    return this.audioDataToTypedArray(data, Float32Array, 'f32-planar', 1);
  }
  audioDataToTypedArray(data, typeArrayClass, format, numberOfChannels = data.numberOfChannels) {
    const size = data.numberOfFrames * numberOfChannels;
    const buffer = new typeArrayClass(size);
    for (let i = 0; i < numberOfChannels; ++i) {
      const offset = data.numberOfFrames * i;
      const samples = buffer.subarray(offset, offset + data.numberOfFrames);
      data.copyTo(samples, { planeIndex: i, format });
    }
    return buffer;
  }
  convertTypedArray(data, outputTypeArrayClass, factor) {
    const size = data.length;
    const result = new outputTypeArrayClass(size);
    for (let i = 0; i < size; ++i) {
      result[i] = data[i] * factor;
    }
    return result;
  }
  isMonoThread(options) {
    if (options.disableWasmMultiThread) {
      return true;
    }
    try {
      const buffer = new SharedArrayBuffer(1024);
      if (buffer === void 0) {
        throw new Error('not supported');
      }
    } catch (e) {
      this.emit(
        `warning`,
        `
    Multithread is not available, noise-suppresion is now running on a single thread.
    This is impacting the performance and increase the latency.
    
    To enable multithread, you need to serve the application via https with these http headers :
       - Cross-Origin-Opener-Policy: same-origin
       - Cross-Origin-Embedder-Policy: require-corp.
    More info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements
    
    You can disable this warning by enabling disableWasmMultiThread within the noiseSuppression options.
    `
      );
      return true;
    }
    return false;
  }
}
function createGlobalThisVariable(name, defaultValue) {
  if (!globalThis.vonage) {
    globalThis.vonage = {};
  }
  if (!globalThis.vonage.workerizer) {
    globalThis.vonage.workerizer = {};
  }
  let globals2 = globalThis.vonage.workerizer;
  if (!globals2[name]) {
    globals2[name] = defaultValue;
  }
  return globals2[name];
}
const globals = createGlobalThisVariable('globals', {});
var CommandType = /* @__PURE__ */ ((CommandType2) => {
  CommandType2['INIT'] = 'INIT';
  CommandType2['FORWARD'] = 'FORWARD';
  CommandType2['TERMINATE'] = 'TERMINATE';
  CommandType2['GLOBALS_SYNC'] = 'GLOBALS_SYNC';
  CommandType2['EVENT'] = 'EVENT';
  return CommandType2;
})(CommandType || {});
function isTransferable(arg) {
  const transferableTypes = [ImageBitmap, ReadableStream, WritableStream];
  return transferableTypes.some((type) => arg instanceof type);
}
let nextCommandId = 0;
function postCommand$1(worker, type, functionName, args, resolvers) {
  const id = nextCommandId++;
  worker.postMessage(
    {
      id,
      type,
      functionName,
      args,
    },
    args.filter((a2) => isTransferable(a2))
  );
  const promise = new Promise((resolve) => {
    resolvers == null ? void 0 : resolvers.set(id, resolve);
  });
  return promise;
}
function postCommand(command, result) {
  const { id, type } = command;
  const resultAsArray = Array.isArray(result) ? result : [result];
  postMessage(
    {
      id,
      type,
      result,
    },
    resultAsArray.filter((result2) => isTransferable(result2))
  );
}
const workerized = createGlobalThisVariable('workerized', {});
function isWorker() {
  return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
}
async function globalsSync() {
  if (isWorker()) {
    postCommand({ type: CommandType.GLOBALS_SYNC }, globals);
  } else {
    const promises = [];
    for (const i in workerized) {
      const { worker, resolvers } = workerized[i].workerContext;
      if (worker) {
        promises.push(postCommand$1(worker, CommandType.GLOBALS_SYNC, '', [globals], resolvers));
      }
    }
    await Promise.all(promises);
  }
}
function copy(from, to) {
  if (Array.isArray(to)) {
    to.splice(0, to.length);
  } else if (typeof to === 'object') {
    for (const i in to) {
      delete to[i];
    }
  }
  for (const i in from) {
    if (Array.isArray(from[i])) {
      to[i] = [];
      copy(from[i], to[i]);
    } else if (typeof from[i] === 'object') {
      to[i] = {};
      copy(from[i], to[i]);
    } else {
      to[i] = from[i];
    }
  }
}
async function createWorker(workerizedClass, workerClass, resolvers, onEvent) {
  const worker = new workerClass();
  worker.addEventListener('message', async ({ data }) => {
    var _a, _b, _c, _d, _e2, _f, _g;
    switch (data.type) {
      case CommandType.GLOBALS_SYNC:
        if (data.id) {
          (_b = resolvers.get((_a = data.id) != null ? _a : -1)) == null ? void 0 : _b(data.result);
          resolvers.delete((_c = data.id) != null ? _c : -1);
        } else {
          copy((_d = data.result) != null ? _d : {}, globals);
          await globalsSync();
        }
        break;
      case CommandType.EVENT:
        const { result } = data;
        const event = result;
        if ((event == null ? void 0 : event.name) == void 0) {
          throw 'Missing event name';
        }
        onEvent(event.name, event.data);
        break;
      default:
        (_f = resolvers.get((_e2 = data.id) != null ? _e2 : -1)) == null ? void 0 : _f(data.result);
        resolvers.delete((_g = data.id) != null ? _g : -1);
    }
  });
  const initialized = await postCommand$1(worker, CommandType.INIT, '', [workerizedClass.workerId, globals], resolvers);
  if (!initialized) {
    throw 'Failed to instantiate workerized class';
  }
  return worker;
}
const anyMap = /* @__PURE__ */ new WeakMap();
const eventsMap = /* @__PURE__ */ new WeakMap();
const producersMap = /* @__PURE__ */ new WeakMap();
const anyProducer = Symbol('anyProducer');
const resolvedPromise = Promise.resolve();
const listenerAdded = Symbol('listenerAdded');
const listenerRemoved = Symbol('listenerRemoved');
let canEmitMetaEvents = false;
let isGlobalDebugEnabled = false;
function assertEventName(eventName) {
  if (typeof eventName !== 'string' && typeof eventName !== 'symbol' && typeof eventName !== 'number') {
    throw new TypeError('`eventName` must be a string, symbol, or number');
  }
}
function assertListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }
}
function getListeners(instance, eventName) {
  const events = eventsMap.get(instance);
  if (!events.has(eventName)) {
    return;
  }
  return events.get(eventName);
}
function getEventProducers(instance, eventName) {
  const key = typeof eventName === 'string' || typeof eventName === 'symbol' || typeof eventName === 'number' ? eventName : anyProducer;
  const producers = producersMap.get(instance);
  if (!producers.has(key)) {
    return;
  }
  return producers.get(key);
}
function enqueueProducers(instance, eventName, eventData) {
  const producers = producersMap.get(instance);
  if (producers.has(eventName)) {
    for (const producer of producers.get(eventName)) {
      producer.enqueue(eventData);
    }
  }
  if (producers.has(anyProducer)) {
    const item = Promise.all([eventName, eventData]);
    for (const producer of producers.get(anyProducer)) {
      producer.enqueue(item);
    }
  }
}
function iterator(instance, eventNames) {
  eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
  let isFinished = false;
  let flush = () => {};
  let queue = [];
  const producer = {
    enqueue(item) {
      queue.push(item);
      flush();
    },
    finish() {
      isFinished = true;
      flush();
    },
  };
  for (const eventName of eventNames) {
    let set = getEventProducers(instance, eventName);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      const producers = producersMap.get(instance);
      producers.set(eventName, set);
    }
    set.add(producer);
  }
  return {
    async next() {
      if (!queue) {
        return { done: true };
      }
      if (queue.length === 0) {
        if (isFinished) {
          queue = void 0;
          return this.next();
        }
        await new Promise((resolve) => {
          flush = resolve;
        });
        return this.next();
      }
      return {
        done: false,
        value: await queue.shift(),
      };
    },
    async return(value) {
      queue = void 0;
      for (const eventName of eventNames) {
        const set = getEventProducers(instance, eventName);
        if (set) {
          set.delete(producer);
          if (set.size === 0) {
            const producers = producersMap.get(instance);
            producers.delete(eventName);
          }
        }
      }
      flush();
      return arguments.length > 0 ? { done: true, value: await value } : { done: true };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
function defaultMethodNamesOrAssert(methodNames) {
  if (methodNames === void 0) {
    return allEmitteryMethods;
  }
  if (!Array.isArray(methodNames)) {
    throw new TypeError('`methodNames` must be an array of strings');
  }
  for (const methodName of methodNames) {
    if (!allEmitteryMethods.includes(methodName)) {
      if (typeof methodName !== 'string') {
        throw new TypeError('`methodNames` element must be a string');
      }
      throw new Error(`${methodName} is not Emittery method`);
    }
  }
  return methodNames;
}
const isMetaEvent = (eventName) => eventName === listenerAdded || eventName === listenerRemoved;
function emitMetaEvent(emitter, eventName, eventData) {
  if (isMetaEvent(eventName)) {
    try {
      canEmitMetaEvents = true;
      emitter.emit(eventName, eventData);
    } finally {
      canEmitMetaEvents = false;
    }
  }
}
class Emittery2 {
  static mixin(emitteryPropertyName, methodNames) {
    methodNames = defaultMethodNamesOrAssert(methodNames);
    return (target) => {
      if (typeof target !== 'function') {
        throw new TypeError('`target` must be function');
      }
      for (const methodName of methodNames) {
        if (target.prototype[methodName] !== void 0) {
          throw new Error(`The property \`${methodName}\` already exists on \`target\``);
        }
      }
      function getEmitteryProperty() {
        Object.defineProperty(this, emitteryPropertyName, {
          enumerable: false,
          value: new Emittery2(),
        });
        return this[emitteryPropertyName];
      }
      Object.defineProperty(target.prototype, emitteryPropertyName, {
        enumerable: false,
        get: getEmitteryProperty,
      });
      const emitteryMethodCaller = (methodName) =>
        function (...args) {
          return this[emitteryPropertyName][methodName](...args);
        };
      for (const methodName of methodNames) {
        Object.defineProperty(target.prototype, methodName, {
          enumerable: false,
          value: emitteryMethodCaller(methodName),
        });
      }
      return target;
    };
  }
  static get isDebugEnabled() {
    var _a, _b;
    if (typeof ((_a = globalThis.process) == null ? void 0 : _a.env) !== 'object') {
      return isGlobalDebugEnabled;
    }
    const { env } = (_b = globalThis.process) != null ? _b : { env: {} };
    return env.DEBUG === 'emittery' || env.DEBUG === '*' || isGlobalDebugEnabled;
  }
  static set isDebugEnabled(newValue) {
    isGlobalDebugEnabled = newValue;
  }
  constructor(options = {}) {
    var _a;
    anyMap.set(this, /* @__PURE__ */ new Set());
    eventsMap.set(this, /* @__PURE__ */ new Map());
    producersMap.set(this, /* @__PURE__ */ new Map());
    producersMap.get(this).set(anyProducer, /* @__PURE__ */ new Set());
    this.debug = (_a = options.debug) != null ? _a : {};
    if (this.debug.enabled === void 0) {
      this.debug.enabled = false;
    }
    if (!this.debug.logger) {
      this.debug.logger = (type, debugName, eventName, eventData) => {
        try {
          eventData = JSON.stringify(eventData);
        } catch {
          eventData = `Object with the following keys failed to stringify: ${Object.keys(eventData).join(',')}`;
        }
        if (typeof eventName === 'symbol' || typeof eventName === 'number') {
          eventName = eventName.toString();
        }
        const currentTime = /* @__PURE__ */ new Date();
        const logTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}.${currentTime.getMilliseconds()}`;
        console.log(`[${logTime}][emittery:${type}][${debugName}] Event Name: ${eventName}
        data: ${eventData}`);
      };
    }
  }
  logIfDebugEnabled(type, eventName, eventData) {
    if (Emittery2.isDebugEnabled || this.debug.enabled) {
      this.debug.logger(type, this.debug.name, eventName, eventData);
    }
  }
  on(eventNames, listener) {
    assertListener(listener);
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName(eventName);
      let set = getListeners(this, eventName);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        const events = eventsMap.get(this);
        events.set(eventName, set);
      }
      set.add(listener);
      this.logIfDebugEnabled('subscribe', eventName, void 0);
      if (!isMetaEvent(eventName)) {
        emitMetaEvent(this, listenerAdded, { eventName, listener });
      }
    }
    return this.off.bind(this, eventNames, listener);
  }
  off(eventNames, listener) {
    assertListener(listener);
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName(eventName);
      const set = getListeners(this, eventName);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          const events = eventsMap.get(this);
          events.delete(eventName);
        }
      }
      this.logIfDebugEnabled('unsubscribe', eventName, void 0);
      if (!isMetaEvent(eventName)) {
        emitMetaEvent(this, listenerRemoved, { eventName, listener });
      }
    }
  }
  once(eventNames) {
    let off_;
    const promise = new Promise((resolve) => {
      off_ = this.on(eventNames, (data) => {
        off_();
        resolve(data);
      });
    });
    promise.off = off_;
    return promise;
  }
  events(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      assertEventName(eventName);
    }
    return iterator(this, eventNames);
  }
  async emit(eventName, eventData) {
    var _a;
    assertEventName(eventName);
    if (isMetaEvent(eventName) && !canEmitMetaEvents) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
    }
    this.logIfDebugEnabled('emit', eventName, eventData);
    enqueueProducers(this, eventName, eventData);
    const listeners = (_a = getListeners(this, eventName)) != null ? _a : /* @__PURE__ */ new Set();
    const anyListeners = anyMap.get(this);
    const staticListeners = [...listeners];
    const staticAnyListeners = isMetaEvent(eventName) ? [] : [...anyListeners];
    await resolvedPromise;
    await Promise.all([
      ...staticListeners.map(async (listener) => {
        if (listeners.has(listener)) {
          return listener(eventData);
        }
      }),
      ...staticAnyListeners.map(async (listener) => {
        if (anyListeners.has(listener)) {
          return listener(eventName, eventData);
        }
      }),
    ]);
  }
  async emitSerial(eventName, eventData) {
    var _a;
    assertEventName(eventName);
    if (isMetaEvent(eventName) && !canEmitMetaEvents) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`');
    }
    this.logIfDebugEnabled('emitSerial', eventName, eventData);
    const listeners = (_a = getListeners(this, eventName)) != null ? _a : /* @__PURE__ */ new Set();
    const anyListeners = anyMap.get(this);
    const staticListeners = [...listeners];
    const staticAnyListeners = [...anyListeners];
    await resolvedPromise;
    for (const listener of staticListeners) {
      if (listeners.has(listener)) {
        await listener(eventData);
      }
    }
    for (const listener of staticAnyListeners) {
      if (anyListeners.has(listener)) {
        await listener(eventName, eventData);
      }
    }
  }
  onAny(listener) {
    assertListener(listener);
    this.logIfDebugEnabled('subscribeAny', void 0, void 0);
    anyMap.get(this).add(listener);
    emitMetaEvent(this, listenerAdded, { listener });
    return this.offAny.bind(this, listener);
  }
  anyEvent() {
    return iterator(this);
  }
  offAny(listener) {
    assertListener(listener);
    this.logIfDebugEnabled('unsubscribeAny', void 0, void 0);
    emitMetaEvent(this, listenerRemoved, { listener });
    anyMap.get(this).delete(listener);
  }
  clearListeners(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    for (const eventName of eventNames) {
      this.logIfDebugEnabled('clear', eventName, void 0);
      if (typeof eventName === 'string' || typeof eventName === 'symbol' || typeof eventName === 'number') {
        const set = getListeners(this, eventName);
        if (set) {
          set.clear();
        }
        const producers = getEventProducers(this, eventName);
        if (producers) {
          for (const producer of producers) {
            producer.finish();
          }
          producers.clear();
        }
      } else {
        anyMap.get(this).clear();
        for (const [eventName2, listeners] of eventsMap.get(this).entries()) {
          listeners.clear();
          eventsMap.get(this).delete(eventName2);
        }
        for (const [eventName2, producers] of producersMap.get(this).entries()) {
          for (const producer of producers) {
            producer.finish();
          }
          producers.clear();
          producersMap.get(this).delete(eventName2);
        }
      }
    }
  }
  listenerCount(eventNames) {
    var _a, _b, _c, _d, _e2, _f;
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    let count = 0;
    for (const eventName of eventNames) {
      if (typeof eventName === 'string') {
        count +=
          anyMap.get(this).size +
          ((_b = (_a = getListeners(this, eventName)) == null ? void 0 : _a.size) != null ? _b : 0) +
          ((_d = (_c = getEventProducers(this, eventName)) == null ? void 0 : _c.size) != null ? _d : 0) +
          ((_f = (_e2 = getEventProducers(this)) == null ? void 0 : _e2.size) != null ? _f : 0);
        continue;
      }
      if (typeof eventName !== 'undefined') {
        assertEventName(eventName);
      }
      count += anyMap.get(this).size;
      for (const value of eventsMap.get(this).values()) {
        count += value.size;
      }
      for (const value of producersMap.get(this).values()) {
        count += value.size;
      }
    }
    return count;
  }
  bindMethods(target, methodNames) {
    if (typeof target !== 'object' || target === null) {
      throw new TypeError('`target` must be an object');
    }
    methodNames = defaultMethodNamesOrAssert(methodNames);
    for (const methodName of methodNames) {
      if (target[methodName] !== void 0) {
        throw new Error(`The property \`${methodName}\` already exists on \`target\``);
      }
      Object.defineProperty(target, methodName, {
        enumerable: false,
        value: this[methodName].bind(this),
      });
    }
  }
}
const allEmitteryMethods = Object.getOwnPropertyNames(Emittery2.prototype).filter((v2) => v2 !== 'constructor');
Object.defineProperty(Emittery2, 'listenerAdded', {
  value: listenerAdded,
  writable: false,
  enumerable: true,
  configurable: false,
});
Object.defineProperty(Emittery2, 'listenerRemoved', {
  value: listenerRemoved,
  writable: false,
  enumerable: true,
  configurable: false,
});
function isInstanceOfEmittery(instance) {
  return instance.onAny && instance.emit;
}
function isChildClassOfEmittery(input) {
  return input.prototype.onAny && input.prototype.emit;
}
let nextId = 0;
async function createWorkerized(workerizedClass, worker, resolvers) {
  const isEmittery = isChildClassOfEmittery(workerizedClass);
  const result = isEmittery ? new Emittery2() : {};
  const id = nextId++;
  Object.getOwnPropertyNames(workerizedClass.prototype).forEach((functionName) => {
    result[functionName] = (...args) => postCommand$1(worker, CommandType.FORWARD, functionName, args, resolvers);
  });
  result.terminate = async (...args) => {
    const response = await postCommand$1(worker, CommandType.TERMINATE, '', args, resolvers);
    delete workerized[id];
    worker.terminate();
    result.workerContext.worker = void 0;
    return response;
  };
  result.workerContext = {
    id,
    worker,
    resolvers,
  };
  workerized[id] = result;
  return result;
}
async function workerize(workerizedClass, workerClass) {
  const resolvers = /* @__PURE__ */ new Map();
  let workerized2;
  const worker = await createWorker(workerizedClass, workerClass, resolvers, (name, data) => {
    if (workerized2 == null ? void 0 : workerized2.emit) {
      workerized2 == null ? void 0 : workerized2.emit(name, data);
    }
  });
  workerized2 = await createWorkerized(workerizedClass, worker, resolvers);
  return workerized2;
}
async function handleCommandForward(command, context) {
  const { functionName, args } = command;
  if (!context.instance) {
    throw 'instance not initialized';
  }
  if (!functionName) {
    throw 'missing function name to call';
  }
  if (!context.instance[functionName]) {
    throw `undefined function [${functionName}] in class ${context.instance.constructor.workerId}`;
  }
  postCommand(command, await context.instance[functionName](...(args != null ? args : [])));
}
const registeredWorkers = createGlobalThisVariable('registeredWorkers', {});
function registerWorker(id, registrable) {
  registrable.workerId = id;
  if (isWorker()) {
    registeredWorkers[registrable.workerId] = registrable;
  }
}
function handleCommandInit(command, context) {
  if (!command.args) {
    throw 'Missing className while initializing worker';
  }
  const [className, globalsValues] = command.args;
  const constructor = registeredWorkers[className];
  if (constructor) {
    context.instance = new constructor(command.args.slice(1));
  } else {
    throw `unknown worker class ${className}`;
  }
  copy(globalsValues, globals);
  if (isInstanceOfEmittery(context.instance)) {
    context.instance.onAny((name, data) => {
      postCommand(
        {
          type: CommandType.EVENT,
        },
        { name, data }
      );
    });
  }
  postCommand(command, typeof context.instance !== void 0);
}
async function handleCommandTerminate(command, context) {
  const { args } = command;
  if (!context.instance) {
    throw 'instance not initialized';
  }
  let result;
  if (context.instance.terminate) {
    result = await context.instance.terminate(...(args != null ? args : []));
  }
  postCommand(command, result);
}
function handleCommandGlobalsSync(command) {
  if (!command.args) {
    throw 'Missing globals while syncing';
  }
  copy(command.args[0], globals);
  postCommand(command, {});
}
function initWorker() {
  const context = {};
  onmessage = async (event) => {
    const command = event.data;
    switch (command.type) {
      case CommandType.INIT:
        handleCommandInit(command, context);
        break;
      case CommandType.FORWARD:
        handleCommandForward(command, context);
        break;
      case CommandType.TERMINATE:
        handleCommandTerminate(command, context);
        break;
      case CommandType.GLOBALS_SYNC:
        handleCommandGlobalsSync(command);
        break;
    }
  };
}
if (isWorker()) {
  initWorker();
}
const _ProcessorWorker = class _ProcessorWorker2 extends Emittery$1 {
  constructor() {
    super(...arguments);
    this.processor = new Oe();
  }
  async init(options = {}) {
    this.transformer = new NoiseSuppressionTransformer();
    this.processor.onAny((name, data) => this.emit(name, data));
    this.transformer.onAny((name, data) => this.emit(name, data));
    await this.transformer.init(options);
    await this.processor.setTransformers([this.transformer]);
  }
  transform(readable, writable) {
    this.processor.transform(readable, writable);
  }
  setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter) {
    this.transformer?.setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter);
  }
  enable() {
    this.transformer?.enable();
  }
  disable() {
    this.transformer?.disable();
  }
  async terminate() {
    await this.processor.destroy();
  }
  /**
   * Return the latency of the transformation
   * The latency will be computed only if the options debug flag is true
   * Otherwise, will return 0;
   * @returns latency
   */
  getLatency() {
    return this.transformer?.getLatency() ?? 0;
  }
  /**
   * Return the latency of processing within the wasm in nanoseconds.
   * @returns latency
   */
  getWasmLatencyNs() {
    return this.transformer?.getWasmLatencyNs() ?? 0;
  }
};
registerWorker('ProcessorWorker', _ProcessorWorker);
let ProcessorWorker = _ProcessorWorker;
const encodedJs =
  'bGV0IGNyZWF0ZVdhc21NdWx0aUluc3RhbmNlOyB7Cgp2YXIgTW9kdWxlID0gKCgpID0+IHsKICB2YXIgX3NjcmlwdERpciA9IGxvY2F0aW9uLmhyZWY7CiAgCiAgcmV0dXJuICgKZnVuY3Rpb24oTW9kdWxlKSB7CiAgTW9kdWxlID0gTW9kdWxlIHx8IHt9OwoKZnVuY3Rpb24gR1JPV0FCTEVfSEVBUF9JOCgpe2lmKHdhc21NZW1vcnkuYnVmZmVyIT1idWZmZXIpe3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKX1yZXR1cm4gSEVBUDh9ZnVuY3Rpb24gR1JPV0FCTEVfSEVBUF9VOCgpe2lmKHdhc21NZW1vcnkuYnVmZmVyIT1idWZmZXIpe3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKX1yZXR1cm4gSEVBUFU4fWZ1bmN0aW9uIEdST1dBQkxFX0hFQVBfSTE2KCl7aWYod2FzbU1lbW9yeS5idWZmZXIhPWJ1ZmZlcil7dXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3Mod2FzbU1lbW9yeS5idWZmZXIpfXJldHVybiBIRUFQMTZ9ZnVuY3Rpb24gR1JPV0FCTEVfSEVBUF9VMTYoKXtpZih3YXNtTWVtb3J5LmJ1ZmZlciE9YnVmZmVyKXt1cGRhdGVHbG9iYWxCdWZmZXJBbmRWaWV3cyh3YXNtTWVtb3J5LmJ1ZmZlcil9cmV0dXJuIEhFQVBVMTZ9ZnVuY3Rpb24gR1JPV0FCTEVfSEVBUF9JMzIoKXtpZih3YXNtTWVtb3J5LmJ1ZmZlciE9YnVmZmVyKXt1cGRhdGVHbG9iYWxCdWZmZXJBbmRWaWV3cyh3YXNtTWVtb3J5LmJ1ZmZlcil9cmV0dXJuIEhFQVAzMn1mdW5jdGlvbiBHUk9XQUJMRV9IRUFQX1UzMigpe2lmKHdhc21NZW1vcnkuYnVmZmVyIT1idWZmZXIpe3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKX1yZXR1cm4gSEVBUFUzMn1mdW5jdGlvbiBHUk9XQUJMRV9IRUFQX0YzMigpe2lmKHdhc21NZW1vcnkuYnVmZmVyIT1idWZmZXIpe3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKX1yZXR1cm4gSEVBUEYzMn1mdW5jdGlvbiBHUk9XQUJMRV9IRUFQX0Y2NCgpe2lmKHdhc21NZW1vcnkuYnVmZmVyIT1idWZmZXIpe3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKX1yZXR1cm4gSEVBUEY2NH12YXIgTW9kdWxlPXR5cGVvZiBNb2R1bGUhPSJ1bmRlZmluZWQiP01vZHVsZTp7fTt2YXIgcmVhZHlQcm9taXNlUmVzb2x2ZSxyZWFkeVByb21pc2VSZWplY3Q7TW9kdWxlWyJyZWFkeSJdPW5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXtyZWFkeVByb21pc2VSZXNvbHZlPXJlc29sdmU7cmVhZHlQcm9taXNlUmVqZWN0PXJlamVjdH0pO3ZhciBtb2R1bGVPdmVycmlkZXM9T2JqZWN0LmFzc2lnbih7fSxNb2R1bGUpO3ZhciBhcmd1bWVudHNfPVtdO3ZhciB0aGlzUHJvZ3JhbT0iLi90aGlzLnByb2dyYW0iO3ZhciBxdWl0Xz0oc3RhdHVzLHRvVGhyb3cpPT57dGhyb3cgdG9UaHJvd307dmFyIEVOVklST05NRU5UX0lTX1dFQj10eXBlb2Ygd2luZG93PT0ib2JqZWN0Ijt2YXIgRU5WSVJPTk1FTlRfSVNfV09SS0VSPXR5cGVvZiBpbXBvcnRTY3JpcHRzPT0iZnVuY3Rpb24iO3ZhciBFTlZJUk9OTUVOVF9JU19OT0RFPXR5cGVvZiBwcm9jZXNzPT0ib2JqZWN0IiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnM9PSJvYmplY3QiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlPT0ic3RyaW5nIjt2YXIgRU5WSVJPTk1FTlRfSVNfUFRIUkVBRD1Nb2R1bGVbIkVOVklST05NRU5UX0lTX1BUSFJFQUQiXXx8ZmFsc2U7dmFyIHNjcmlwdERpcmVjdG9yeT0iIjtmdW5jdGlvbiBsb2NhdGVGaWxlKHBhdGgpe2lmKE1vZHVsZVsibG9jYXRlRmlsZSJdKXtyZXR1cm4gTW9kdWxlWyJsb2NhdGVGaWxlIl0ocGF0aCxzY3JpcHREaXJlY3RvcnkpfXJldHVybiBzY3JpcHREaXJlY3RvcnkrcGF0aH12YXIgcmVhZF8scmVhZEFzeW5jLHJlYWRCaW5hcnksc2V0V2luZG93VGl0bGU7aWYoRU5WSVJPTk1FTlRfSVNfV0VCfHxFTlZJUk9OTUVOVF9JU19XT1JLRVIpe2lmKEVOVklST05NRU5UX0lTX1dPUktFUil7c2NyaXB0RGlyZWN0b3J5PXNlbGYubG9jYXRpb24uaHJlZn1lbHNlIGlmKHR5cGVvZiBkb2N1bWVudCE9InVuZGVmaW5lZCImJmRvY3VtZW50LmN1cnJlbnRTY3JpcHQpe3NjcmlwdERpcmVjdG9yeT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY31pZihfc2NyaXB0RGlyKXtzY3JpcHREaXJlY3Rvcnk9X3NjcmlwdERpcn1pZihzY3JpcHREaXJlY3RvcnkuaW5kZXhPZigiYmxvYjoiKSE9PTApe3NjcmlwdERpcmVjdG9yeT1zY3JpcHREaXJlY3Rvcnkuc3Vic3RyKDAsc2NyaXB0RGlyZWN0b3J5LnJlcGxhY2UoL1s/I10uKi8sIiIpLmxhc3RJbmRleE9mKCIvIikrMSl9ZWxzZXtzY3JpcHREaXJlY3Rvcnk9IiJ9e3JlYWRfPSh1cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5zZW5kKG51bGwpO3JldHVybiB4aHIucmVzcG9uc2VUZXh0fSk7aWYoRU5WSVJPTk1FTlRfSVNfV09SS0VSKXtyZWFkQmluYXJ5PSh1cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlKX0pfXJlYWRBc3luYz0oKHVybCxvbmxvYWQsb25lcnJvcik9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsdHJ1ZSk7eGhyLnJlc3BvbnNlVHlwZT0iYXJyYXlidWZmZXIiO3hoci5vbmxvYWQ9KCgpPT57aWYoeGhyLnN0YXR1cz09MjAwfHx4aHIuc3RhdHVzPT0wJiZ4aHIucmVzcG9uc2Upe29ubG9hZCh4aHIucmVzcG9uc2UpO3JldHVybn1vbmVycm9yKCl9KTt4aHIub25lcnJvcj1vbmVycm9yO3hoci5zZW5kKG51bGwpfSl9c2V0V2luZG93VGl0bGU9KHRpdGxlPT5kb2N1bWVudC50aXRsZT10aXRsZSl9ZWxzZXt9dmFyIG91dD1Nb2R1bGVbInByaW50Il18fGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSk7dmFyIGVycj1Nb2R1bGVbInByaW50RXJyIl18fGNvbnNvbGUud2Fybi5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oTW9kdWxlLG1vZHVsZU92ZXJyaWRlcyk7bW9kdWxlT3ZlcnJpZGVzPW51bGw7aWYoTW9kdWxlWyJhcmd1bWVudHMiXSlhcmd1bWVudHNfPU1vZHVsZVsiYXJndW1lbnRzIl07aWYoTW9kdWxlWyJ0aGlzUHJvZ3JhbSJdKXRoaXNQcm9ncmFtPU1vZHVsZVsidGhpc1Byb2dyYW0iXTtpZihNb2R1bGVbInF1aXQiXSlxdWl0Xz1Nb2R1bGVbInF1aXQiXTtmdW5jdGlvbiB3YXJuT25jZSh0ZXh0KXtpZighd2Fybk9uY2Uuc2hvd24pd2Fybk9uY2Uuc2hvd249e307aWYoIXdhcm5PbmNlLnNob3duW3RleHRdKXt3YXJuT25jZS5zaG93blt0ZXh0XT0xO2Vycih0ZXh0KX19dmFyIHRlbXBSZXQwPTA7dmFyIHNldFRlbXBSZXQwPXZhbHVlPT57dGVtcFJldDA9dmFsdWV9O3ZhciBnZXRUZW1wUmV0MD0oKT0+dGVtcFJldDA7dmFyIEF0b21pY3NfbG9hZD1BdG9taWNzLmxvYWQ7dmFyIEF0b21pY3Nfc3RvcmU9QXRvbWljcy5zdG9yZTt2YXIgQXRvbWljc19jb21wYXJlRXhjaGFuZ2U9QXRvbWljcy5jb21wYXJlRXhjaGFuZ2U7dmFyIHdhc21CaW5hcnk7aWYoTW9kdWxlWyJ3YXNtQmluYXJ5Il0pd2FzbUJpbmFyeT1Nb2R1bGVbIndhc21CaW5hcnkiXTt2YXIgbm9FeGl0UnVudGltZT1Nb2R1bGVbIm5vRXhpdFJ1bnRpbWUiXXx8ZmFsc2U7aWYodHlwZW9mIFdlYkFzc2VtYmx5IT0ib2JqZWN0Iil7YWJvcnQoIm5vIG5hdGl2ZSB3YXNtIHN1cHBvcnQgZGV0ZWN0ZWQiKX12YXIgd2FzbU1lbW9yeTt2YXIgd2FzbU1vZHVsZTt2YXIgQUJPUlQ9ZmFsc2U7dmFyIEVYSVRTVEFUVVM7ZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbix0ZXh0KXtpZighY29uZGl0aW9uKXthYm9ydCh0ZXh0KX19dmFyIFVURjhEZWNvZGVyPXR5cGVvZiBUZXh0RGVjb2RlciE9InVuZGVmaW5lZCI/bmV3IFRleHREZWNvZGVyKCJ1dGY4Iik6dW5kZWZpbmVkO2Z1bmN0aW9uIFVURjhBcnJheVRvU3RyaW5nKGhlYXBPckFycmF5LGlkeCxtYXhCeXRlc1RvUmVhZCl7dmFyIGVuZElkeD1pZHgrbWF4Qnl0ZXNUb1JlYWQ7dmFyIGVuZFB0cj1pZHg7d2hpbGUoaGVhcE9yQXJyYXlbZW5kUHRyXSYmIShlbmRQdHI+PWVuZElkeCkpKytlbmRQdHI7aWYoZW5kUHRyLWlkeD4xNiYmaGVhcE9yQXJyYXkuYnVmZmVyJiZVVEY4RGVjb2Rlcil7cmV0dXJuIFVURjhEZWNvZGVyLmRlY29kZShoZWFwT3JBcnJheS5idWZmZXIgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcj9oZWFwT3JBcnJheS5zbGljZShpZHgsZW5kUHRyKTpoZWFwT3JBcnJheS5zdWJhcnJheShpZHgsZW5kUHRyKSl9ZWxzZXt2YXIgc3RyPSIiO3doaWxlKGlkeDxlbmRQdHIpe3ZhciB1MD1oZWFwT3JBcnJheVtpZHgrK107aWYoISh1MCYxMjgpKXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodTApO2NvbnRpbnVlfXZhciB1MT1oZWFwT3JBcnJheVtpZHgrK10mNjM7aWYoKHUwJjIyNCk9PTE5Mil7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKCh1MCYzMSk8PDZ8dTEpO2NvbnRpbnVlfXZhciB1Mj1oZWFwT3JBcnJheVtpZHgrK10mNjM7aWYoKHUwJjI0MCk9PTIyNCl7dTA9KHUwJjE1KTw8MTJ8dTE8PDZ8dTJ9ZWxzZXt1MD0odTAmNyk8PDE4fHUxPDwxMnx1Mjw8NnxoZWFwT3JBcnJheVtpZHgrK10mNjN9aWYodTA8NjU1MzYpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1MCl9ZWxzZXt2YXIgY2g9dTAtNjU1MzY7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGNoPj4xMCw1NjMyMHxjaCYxMDIzKX19fXJldHVybiBzdHJ9ZnVuY3Rpb24gVVRGOFRvU3RyaW5nKHB0cixtYXhCeXRlc1RvUmVhZCl7cmV0dXJuIHB0cj9VVEY4QXJyYXlUb1N0cmluZyhHUk9XQUJMRV9IRUFQX1U4KCkscHRyLG1heEJ5dGVzVG9SZWFkKToiIn1mdW5jdGlvbiBzdHJpbmdUb1VURjhBcnJheShzdHIsaGVhcCxvdXRJZHgsbWF4Qnl0ZXNUb1dyaXRlKXtpZighKG1heEJ5dGVzVG9Xcml0ZT4wKSlyZXR1cm4gMDt2YXIgc3RhcnRJZHg9b3V0SWR4O3ZhciBlbmRJZHg9b3V0SWR4K21heEJ5dGVzVG9Xcml0ZS0xO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciB1PXN0ci5jaGFyQ29kZUF0KGkpO2lmKHU+PTU1Mjk2JiZ1PD01NzM0Myl7dmFyIHUxPXN0ci5jaGFyQ29kZUF0KCsraSk7dT02NTUzNisoKHUmMTAyMyk8PDEwKXx1MSYxMDIzfWlmKHU8PTEyNyl7aWYob3V0SWR4Pj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109dX1lbHNlIGlmKHU8PTIwNDcpe2lmKG91dElkeCsxPj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109MTkyfHU+PjY7aGVhcFtvdXRJZHgrK109MTI4fHUmNjN9ZWxzZSBpZih1PD02NTUzNSl7aWYob3V0SWR4KzI+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0yMjR8dT4+MTI7aGVhcFtvdXRJZHgrK109MTI4fHU+PjYmNjM7aGVhcFtvdXRJZHgrK109MTI4fHUmNjN9ZWxzZXtpZihvdXRJZHgrMz49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTI0MHx1Pj4xODtoZWFwW291dElkeCsrXT0xMjh8dT4+MTImNjM7aGVhcFtvdXRJZHgrK109MTI4fHU+PjYmNjM7aGVhcFtvdXRJZHgrK109MTI4fHUmNjN9fWhlYXBbb3V0SWR4XT0wO3JldHVybiBvdXRJZHgtc3RhcnRJZHh9ZnVuY3Rpb24gc3RyaW5nVG9VVEY4KHN0cixvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKXtyZXR1cm4gc3RyaW5nVG9VVEY4QXJyYXkoc3RyLEdST1dBQkxFX0hFQVBfVTgoKSxvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKX1mdW5jdGlvbiBsZW5ndGhCeXRlc1VURjgoc3RyKXt2YXIgbGVuPTA7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIHU9c3RyLmNoYXJDb2RlQXQoaSk7aWYodT49NTUyOTYmJnU8PTU3MzQzKXU9NjU1MzYrKCh1JjEwMjMpPDwxMCl8c3RyLmNoYXJDb2RlQXQoKytpKSYxMDIzO2lmKHU8PTEyNykrK2xlbjtlbHNlIGlmKHU8PTIwNDcpbGVuKz0yO2Vsc2UgaWYodTw9NjU1MzUpbGVuKz0zO2Vsc2UgbGVuKz00fXJldHVybiBsZW59dmFyIFVURjE2RGVjb2Rlcj10eXBlb2YgVGV4dERlY29kZXIhPSJ1bmRlZmluZWQiP25ldyBUZXh0RGVjb2RlcigidXRmLTE2bGUiKTp1bmRlZmluZWQ7ZnVuY3Rpb24gVVRGMTZUb1N0cmluZyhwdHIsbWF4Qnl0ZXNUb1JlYWQpe3ZhciBlbmRQdHI9cHRyO3ZhciBpZHg9ZW5kUHRyPj4xO3ZhciBtYXhJZHg9aWR4K21heEJ5dGVzVG9SZWFkLzI7d2hpbGUoIShpZHg+PW1heElkeCkmJkdST1dBQkxFX0hFQVBfVTE2KClbaWR4XSkrK2lkeDtlbmRQdHI9aWR4PDwxO2lmKGVuZFB0ci1wdHI+MzImJlVURjE2RGVjb2Rlcil7cmV0dXJuIFVURjE2RGVjb2Rlci5kZWNvZGUoR1JPV0FCTEVfSEVBUF9VOCgpLnNsaWNlKHB0cixlbmRQdHIpKX1lbHNle3ZhciBzdHI9IiI7Zm9yKHZhciBpPTA7IShpPj1tYXhCeXRlc1RvUmVhZC8yKTsrK2kpe3ZhciBjb2RlVW5pdD1HUk9XQUJMRV9IRUFQX0kxNigpW3B0citpKjI+PjFdO2lmKGNvZGVVbml0PT0wKWJyZWFrO3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZShjb2RlVW5pdCl9cmV0dXJuIHN0cn19ZnVuY3Rpb24gc3RyaW5nVG9VVEYxNihzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSl7aWYobWF4Qnl0ZXNUb1dyaXRlPT09dW5kZWZpbmVkKXttYXhCeXRlc1RvV3JpdGU9MjE0NzQ4MzY0N31pZihtYXhCeXRlc1RvV3JpdGU8MilyZXR1cm4gMDttYXhCeXRlc1RvV3JpdGUtPTI7dmFyIHN0YXJ0UHRyPW91dFB0cjt2YXIgbnVtQ2hhcnNUb1dyaXRlPW1heEJ5dGVzVG9Xcml0ZTxzdHIubGVuZ3RoKjI/bWF4Qnl0ZXNUb1dyaXRlLzI6c3RyLmxlbmd0aDtmb3IodmFyIGk9MDtpPG51bUNoYXJzVG9Xcml0ZTsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtHUk9XQUJMRV9IRUFQX0kxNigpW291dFB0cj4+MV09Y29kZVVuaXQ7b3V0UHRyKz0yfUdST1dBQkxFX0hFQVBfSTE2KClbb3V0UHRyPj4xXT0wO3JldHVybiBvdXRQdHItc3RhcnRQdHJ9ZnVuY3Rpb24gbGVuZ3RoQnl0ZXNVVEYxNihzdHIpe3JldHVybiBzdHIubGVuZ3RoKjJ9ZnVuY3Rpb24gVVRGMzJUb1N0cmluZyhwdHIsbWF4Qnl0ZXNUb1JlYWQpe3ZhciBpPTA7dmFyIHN0cj0iIjt3aGlsZSghKGk+PW1heEJ5dGVzVG9SZWFkLzQpKXt2YXIgdXRmMzI9R1JPV0FCTEVfSEVBUF9JMzIoKVtwdHIraSo0Pj4yXTtpZih1dGYzMj09MClicmVhazsrK2k7aWYodXRmMzI+PTY1NTM2KXt2YXIgY2g9dXRmMzItNjU1MzY7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGNoPj4xMCw1NjMyMHxjaCYxMDIzKX1lbHNle3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1dGYzMil9fXJldHVybiBzdHJ9ZnVuY3Rpb24gc3RyaW5nVG9VVEYzMihzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSl7aWYobWF4Qnl0ZXNUb1dyaXRlPT09dW5kZWZpbmVkKXttYXhCeXRlc1RvV3JpdGU9MjE0NzQ4MzY0N31pZihtYXhCeXRlc1RvV3JpdGU8NClyZXR1cm4gMDt2YXIgc3RhcnRQdHI9b3V0UHRyO3ZhciBlbmRQdHI9c3RhcnRQdHIrbWF4Qnl0ZXNUb1dyaXRlLTQ7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIGNvZGVVbml0PXN0ci5jaGFyQ29kZUF0KGkpO2lmKGNvZGVVbml0Pj01NTI5NiYmY29kZVVuaXQ8PTU3MzQzKXt2YXIgdHJhaWxTdXJyb2dhdGU9c3RyLmNoYXJDb2RlQXQoKytpKTtjb2RlVW5pdD02NTUzNisoKGNvZGVVbml0JjEwMjMpPDwxMCl8dHJhaWxTdXJyb2dhdGUmMTAyM31HUk9XQUJMRV9IRUFQX0kzMigpW291dFB0cj4+Ml09Y29kZVVuaXQ7b3V0UHRyKz00O2lmKG91dFB0cis0PmVuZFB0cilicmVha31HUk9XQUJMRV9IRUFQX0kzMigpW291dFB0cj4+Ml09MDtyZXR1cm4gb3V0UHRyLXN0YXJ0UHRyfWZ1bmN0aW9uIGxlbmd0aEJ5dGVzVVRGMzIoc3RyKXt2YXIgbGVuPTA7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIGNvZGVVbml0PXN0ci5jaGFyQ29kZUF0KGkpO2lmKGNvZGVVbml0Pj01NTI5NiYmY29kZVVuaXQ8PTU3MzQzKSsraTtsZW4rPTR9cmV0dXJuIGxlbn1mdW5jdGlvbiB3cml0ZUFycmF5VG9NZW1vcnkoYXJyYXksYnVmZmVyKXtHUk9XQUJMRV9IRUFQX0k4KCkuc2V0KGFycmF5LGJ1ZmZlcil9ZnVuY3Rpb24gd3JpdGVBc2NpaVRvTWVtb3J5KHN0cixidWZmZXIsZG9udEFkZE51bGwpe2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe0dST1dBQkxFX0hFQVBfSTgoKVtidWZmZXIrKz4+MF09c3RyLmNoYXJDb2RlQXQoaSl9aWYoIWRvbnRBZGROdWxsKUdST1dBQkxFX0hFQVBfSTgoKVtidWZmZXI+PjBdPTB9dmFyIGJ1ZmZlcixIRUFQOCxIRUFQVTgsSEVBUDE2LEhFQVBVMTYsSEVBUDMyLEhFQVBVMzIsSEVBUEYzMixIRUFQRjY0O2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpe2J1ZmZlcj1Nb2R1bGVbImJ1ZmZlciJdfWZ1bmN0aW9uIHVwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKGJ1Zil7YnVmZmVyPWJ1ZjtNb2R1bGVbIkhFQVA4Il09SEVBUDg9bmV3IEludDhBcnJheShidWYpO01vZHVsZVsiSEVBUDE2Il09SEVBUDE2PW5ldyBJbnQxNkFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQMzIiXT1IRUFQMzI9bmV3IEludDMyQXJyYXkoYnVmKTtNb2R1bGVbIkhFQVBVOCJdPUhFQVBVOD1uZXcgVWludDhBcnJheShidWYpO01vZHVsZVsiSEVBUFUxNiJdPUhFQVBVMTY9bmV3IFVpbnQxNkFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQVTMyIl09SEVBUFUzMj1uZXcgVWludDMyQXJyYXkoYnVmKTtNb2R1bGVbIkhFQVBGMzIiXT1IRUFQRjMyPW5ldyBGbG9hdDMyQXJyYXkoYnVmKTtNb2R1bGVbIkhFQVBGNjQiXT1IRUFQRjY0PW5ldyBGbG9hdDY0QXJyYXkoYnVmKX12YXIgSU5JVElBTF9NRU1PUlk9TW9kdWxlWyJJTklUSUFMX01FTU9SWSJdfHwxNjc3NzIxNjtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXt3YXNtTWVtb3J5PU1vZHVsZVsid2FzbU1lbW9yeSJdO2J1ZmZlcj1Nb2R1bGVbImJ1ZmZlciJdfWVsc2V7aWYoTW9kdWxlWyJ3YXNtTWVtb3J5Il0pe3dhc21NZW1vcnk9TW9kdWxlWyJ3YXNtTWVtb3J5Il19ZWxzZXt3YXNtTWVtb3J5PW5ldyBXZWJBc3NlbWJseS5NZW1vcnkoeyJpbml0aWFsIjpJTklUSUFMX01FTU9SWS82NTUzNiwibWF4aW11bSI6MjE0NzQ4MzY0OC82NTUzNiwic2hhcmVkIjp0cnVlfSk7aWYoISh3YXNtTWVtb3J5LmJ1ZmZlciBpbnN0YW5jZW9mIFNoYXJlZEFycmF5QnVmZmVyKSl7ZXJyKCJyZXF1ZXN0ZWQgYSBzaGFyZWQgV2ViQXNzZW1ibHkuTWVtb3J5IGJ1dCB0aGUgcmV0dXJuZWQgYnVmZmVyIGlzIG5vdCBhIFNoYXJlZEFycmF5QnVmZmVyLCBpbmRpY2F0aW5nIHRoYXQgd2hpbGUgdGhlIGJyb3dzZXIgaGFzIFNoYXJlZEFycmF5QnVmZmVyIGl0IGRvZXMgbm90IGhhdmUgV2ViQXNzZW1ibHkgdGhyZWFkcyBzdXBwb3J0IC0geW91IG1heSBuZWVkIHRvIHNldCBhIGZsYWciKTtpZihFTlZJUk9OTUVOVF9JU19OT0RFKXtjb25zb2xlLmxvZygiKG9uIG5vZGUgeW91IG1heSBuZWVkOiAtLWV4cGVyaW1lbnRhbC13YXNtLXRocmVhZHMgLS1leHBlcmltZW50YWwtd2FzbS1idWxrLW1lbW9yeSBhbmQgYWxzbyB1c2UgYSByZWNlbnQgdmVyc2lvbikiKX10aHJvdyBFcnJvcigiYmFkIG1lbW9yeSIpfX19aWYod2FzbU1lbW9yeSl7YnVmZmVyPXdhc21NZW1vcnkuYnVmZmVyfUlOSVRJQUxfTUVNT1JZPWJ1ZmZlci5ieXRlTGVuZ3RoO3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKGJ1ZmZlcik7dmFyIHdhc21UYWJsZTt2YXIgX19BVFBSRVJVTl9fPVtdO3ZhciBfX0FUSU5JVF9fPVtdO3ZhciBfX0FURVhJVF9fPVtdO3ZhciBfX0FUUE9TVFJVTl9fPVtdO3ZhciBydW50aW1lSW5pdGlhbGl6ZWQ9ZmFsc2U7dmFyIHJ1bnRpbWVFeGl0ZWQ9ZmFsc2U7dmFyIHJ1bnRpbWVLZWVwYWxpdmVDb3VudGVyPTA7ZnVuY3Rpb24ga2VlcFJ1bnRpbWVBbGl2ZSgpe3JldHVybiBub0V4aXRSdW50aW1lfHxydW50aW1lS2VlcGFsaXZlQ291bnRlcj4wfWZ1bmN0aW9uIHByZVJ1bigpe2lmKE1vZHVsZVsicHJlUnVuIl0pe2lmKHR5cGVvZiBNb2R1bGVbInByZVJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlUnVuIl09W01vZHVsZVsicHJlUnVuIl1dO3doaWxlKE1vZHVsZVsicHJlUnVuIl0ubGVuZ3RoKXthZGRPblByZVJ1bihNb2R1bGVbInByZVJ1biJdLnNoaWZ0KCkpfX1jYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUUFJFUlVOX18pfWZ1bmN0aW9uIGluaXRSdW50aW1lKCl7cnVudGltZUluaXRpYWxpemVkPXRydWU7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm47aWYoIU1vZHVsZVsibm9GU0luaXQiXSYmIUZTLmluaXQuaW5pdGlhbGl6ZWQpRlMuaW5pdCgpO0ZTLmlnbm9yZVBlcm1pc3Npb25zPWZhbHNlO1RUWS5pbml0KCk7Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVElOSVRfXyl9ZnVuY3Rpb24gZXhpdFJ1bnRpbWUoKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybjtfX19mdW5jc19vbl9leGl0KCk7Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVEVYSVRfXyk7RlMucXVpdCgpO1RUWS5zaHV0ZG93bigpO1BUaHJlYWQudGVybWluYXRlQWxsVGhyZWFkcygpO3J1bnRpbWVFeGl0ZWQ9dHJ1ZX1mdW5jdGlvbiBwb3N0UnVuKCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm47aWYoTW9kdWxlWyJwb3N0UnVuIl0pe2lmKHR5cGVvZiBNb2R1bGVbInBvc3RSdW4iXT09ImZ1bmN0aW9uIilNb2R1bGVbInBvc3RSdW4iXT1bTW9kdWxlWyJwb3N0UnVuIl1dO3doaWxlKE1vZHVsZVsicG9zdFJ1biJdLmxlbmd0aCl7YWRkT25Qb3N0UnVuKE1vZHVsZVsicG9zdFJ1biJdLnNoaWZ0KCkpfX1jYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUUE9TVFJVTl9fKX1mdW5jdGlvbiBhZGRPblByZVJ1bihjYil7X19BVFBSRVJVTl9fLnVuc2hpZnQoY2IpfWZ1bmN0aW9uIGFkZE9uSW5pdChjYil7X19BVElOSVRfXy51bnNoaWZ0KGNiKX1mdW5jdGlvbiBhZGRPblBvc3RSdW4oY2Ipe19fQVRQT1NUUlVOX18udW5zaGlmdChjYil9dmFyIHJ1bkRlcGVuZGVuY2llcz0wO3ZhciBydW5EZXBlbmRlbmN5V2F0Y2hlcj1udWxsO3ZhciBkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtmdW5jdGlvbiBnZXRVbmlxdWVSdW5EZXBlbmRlbmN5KGlkKXtyZXR1cm4gaWR9ZnVuY3Rpb24gYWRkUnVuRGVwZW5kZW5jeShpZCl7cnVuRGVwZW5kZW5jaWVzKys7aWYoTW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0pe01vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKHJ1bkRlcGVuZGVuY2llcyl9fWZ1bmN0aW9uIHJlbW92ZVJ1bkRlcGVuZGVuY3koaWQpe3J1bkRlcGVuZGVuY2llcy0tO2lmKE1vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKXtNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXShydW5EZXBlbmRlbmNpZXMpfWlmKHJ1bkRlcGVuZGVuY2llcz09MCl7aWYocnVuRGVwZW5kZW5jeVdhdGNoZXIhPT1udWxsKXtjbGVhckludGVydmFsKHJ1bkRlcGVuZGVuY3lXYXRjaGVyKTtydW5EZXBlbmRlbmN5V2F0Y2hlcj1udWxsfWlmKGRlcGVuZGVuY2llc0Z1bGZpbGxlZCl7dmFyIGNhbGxiYWNrPWRlcGVuZGVuY2llc0Z1bGZpbGxlZDtkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtjYWxsYmFjaygpfX19ZnVuY3Rpb24gYWJvcnQod2hhdCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCl7cG9zdE1lc3NhZ2UoeyJjbWQiOiJvbkFib3J0IiwiYXJnIjp3aGF0fSl9ZWxzZXtpZihNb2R1bGVbIm9uQWJvcnQiXSl7TW9kdWxlWyJvbkFib3J0Il0od2hhdCl9fXdoYXQ9IkFib3J0ZWQoIit3aGF0KyIpIjtlcnIod2hhdCk7QUJPUlQ9dHJ1ZTtFWElUU1RBVFVTPTE7d2hhdCs9Ii4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby4iO3ZhciBlPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3Iod2hhdCk7cmVhZHlQcm9taXNlUmVqZWN0KGUpO3Rocm93IGV9dmFyIGRhdGFVUklQcmVmaXg9ImRhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2Jhc2U2NCwiO2Z1bmN0aW9uIGlzRGF0YVVSSShmaWxlbmFtZSl7cmV0dXJuIGZpbGVuYW1lLnN0YXJ0c1dpdGgoZGF0YVVSSVByZWZpeCl9dmFyIHdhc21CaW5hcnlGaWxlO2lmKE1vZHVsZVsibG9jYXRlRmlsZSJdKXt3YXNtQmluYXJ5RmlsZT0ibWFpbi1iaW4tbXVsdGkud2FzbSI7aWYoIWlzRGF0YVVSSSh3YXNtQmluYXJ5RmlsZSkpe3dhc21CaW5hcnlGaWxlPWxvY2F0ZUZpbGUod2FzbUJpbmFyeUZpbGUpfX1lbHNle3dhc21CaW5hcnlGaWxlPW5ldyBVUkwoIm1haW4tYmluLW11bHRpLndhc20iLGxvY2F0aW9uLmhyZWYpLnRvU3RyaW5nKCl9ZnVuY3Rpb24gZ2V0QmluYXJ5KGZpbGUpe3RyeXtpZihmaWxlPT13YXNtQmluYXJ5RmlsZSYmd2FzbUJpbmFyeSl7cmV0dXJuIG5ldyBVaW50OEFycmF5KHdhc21CaW5hcnkpfWlmKHJlYWRCaW5hcnkpe3JldHVybiByZWFkQmluYXJ5KGZpbGUpfWVsc2V7dGhyb3ciYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWQifX1jYXRjaChlcnIpe2Fib3J0KGVycil9fWZ1bmN0aW9uIGdldEJpbmFyeVByb21pc2UoKXtpZighd2FzbUJpbmFyeSYmKEVOVklST05NRU5UX0lTX1dFQnx8RU5WSVJPTk1FTlRfSVNfV09SS0VSKSl7aWYodHlwZW9mIGZldGNoPT0iZnVuY3Rpb24iKXtyZXR1cm4gZmV0Y2god2FzbUJpbmFyeUZpbGUse2NyZWRlbnRpYWxzOiJzYW1lLW9yaWdpbiJ9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtpZighcmVzcG9uc2VbIm9rIl0pe3Rocm93ImZhaWxlZCB0byBsb2FkIHdhc20gYmluYXJ5IGZpbGUgYXQgJyIrd2FzbUJpbmFyeUZpbGUrIicifXJldHVybiByZXNwb25zZVsiYXJyYXlCdWZmZXIiXSgpfSkuY2F0Y2goZnVuY3Rpb24oKXtyZXR1cm4gZ2V0QmluYXJ5KHdhc21CaW5hcnlGaWxlKX0pfX1yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbigpe3JldHVybiBnZXRCaW5hcnkod2FzbUJpbmFyeUZpbGUpfSl9ZnVuY3Rpb24gY3JlYXRlV2FzbSgpe3ZhciBpbmZvPXsiYSI6YXNtTGlicmFyeUFyZ307ZnVuY3Rpb24gcmVjZWl2ZUluc3RhbmNlKGluc3RhbmNlLG1vZHVsZSl7dmFyIGV4cG9ydHM9aW5zdGFuY2UuZXhwb3J0cztNb2R1bGVbImFzbSJdPWV4cG9ydHM7cmVnaXN0ZXJUbHNJbml0KE1vZHVsZVsiYXNtIl1bImNiIl0pO3dhc21UYWJsZT1Nb2R1bGVbImFzbSJdWyJaYSJdO2FkZE9uSW5pdChNb2R1bGVbImFzbSJdWyJZYSJdKTt3YXNtTW9kdWxlPW1vZHVsZTtpZighRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCl7dmFyIG51bVdvcmtlcnNUb0xvYWQ9UFRocmVhZC51bnVzZWRXb3JrZXJzLmxlbmd0aDtQVGhyZWFkLnVudXNlZFdvcmtlcnMuZm9yRWFjaChmdW5jdGlvbih3KXtQVGhyZWFkLmxvYWRXYXNtTW9kdWxlVG9Xb3JrZXIodyxmdW5jdGlvbigpe2lmKCEtLW51bVdvcmtlcnNUb0xvYWQpcmVtb3ZlUnVuRGVwZW5kZW5jeSgid2FzbS1pbnN0YW50aWF0ZSIpfSl9KX19aWYoIUVOVklST05NRU5UX0lTX1BUSFJFQUQpe2FkZFJ1bkRlcGVuZGVuY3koIndhc20taW5zdGFudGlhdGUiKX1mdW5jdGlvbiByZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdChyZXN1bHQpe3JlY2VpdmVJbnN0YW5jZShyZXN1bHRbImluc3RhbmNlIl0scmVzdWx0WyJtb2R1bGUiXSl9ZnVuY3Rpb24gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihyZWNlaXZlcil7cmV0dXJuIGdldEJpbmFyeVByb21pc2UoKS50aGVuKGZ1bmN0aW9uKGJpbmFyeSl7cmV0dXJuIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGJpbmFyeSxpbmZvKX0pLnRoZW4oZnVuY3Rpb24oaW5zdGFuY2Upe3JldHVybiBpbnN0YW5jZX0pLnRoZW4ocmVjZWl2ZXIsZnVuY3Rpb24ocmVhc29uKXtlcnIoImZhaWxlZCB0byBhc3luY2hyb25vdXNseSBwcmVwYXJlIHdhc206ICIrcmVhc29uKTthYm9ydChyZWFzb24pfSl9ZnVuY3Rpb24gaW5zdGFudGlhdGVBc3luYygpe2lmKCF3YXNtQmluYXJ5JiZ0eXBlb2YgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmc9PSJmdW5jdGlvbiImJiFpc0RhdGFVUkkod2FzbUJpbmFyeUZpbGUpJiZ0eXBlb2YgZmV0Y2g9PSJmdW5jdGlvbiIpe3JldHVybiBmZXRjaCh3YXNtQmluYXJ5RmlsZSx7Y3JlZGVudGlhbHM6InNhbWUtb3JpZ2luIn0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe3ZhciByZXN1bHQ9V2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcocmVzcG9uc2UsaW5mbyk7cmV0dXJuIHJlc3VsdC50aGVuKHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0LGZ1bmN0aW9uKHJlYXNvbil7ZXJyKCJ3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogIityZWFzb24pO2VycigiZmFsbGluZyBiYWNrIHRvIEFycmF5QnVmZmVyIGluc3RhbnRpYXRpb24iKTtyZXR1cm4gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihyZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdCl9KX0pfWVsc2V7cmV0dXJuIGluc3RhbnRpYXRlQXJyYXlCdWZmZXIocmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQpfX1pZihNb2R1bGVbImluc3RhbnRpYXRlV2FzbSJdKXt0cnl7dmFyIGV4cG9ydHM9TW9kdWxlWyJpbnN0YW50aWF0ZVdhc20iXShpbmZvLHJlY2VpdmVJbnN0YW5jZSk7cmV0dXJuIGV4cG9ydHN9Y2F0Y2goZSl7ZXJyKCJNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAiK2UpO3JldHVybiBmYWxzZX19aW5zdGFudGlhdGVBc3luYygpLmNhdGNoKHJlYWR5UHJvbWlzZVJlamVjdCk7cmV0dXJue319dmFyIHRlbXBEb3VibGU7dmFyIHRlbXBJNjQ7dmFyIEFTTV9DT05TVFM9e307ZnVuY3Rpb24ga2lsbFRocmVhZChwdGhyZWFkX3B0cil7R1JPV0FCTEVfSEVBUF9JMzIoKVtwdGhyZWFkX3B0cj4+Ml09MDt2YXIgcHRocmVhZD1QVGhyZWFkLnB0aHJlYWRzW3B0aHJlYWRfcHRyXTtkZWxldGUgUFRocmVhZC5wdGhyZWFkc1twdGhyZWFkX3B0cl07cHRocmVhZC53b3JrZXIudGVybWluYXRlKCk7X19lbXNjcmlwdGVuX3RocmVhZF9mcmVlX2RhdGEocHRocmVhZF9wdHIpO1BUaHJlYWQucnVubmluZ1dvcmtlcnMuc3BsaWNlKFBUaHJlYWQucnVubmluZ1dvcmtlcnMuaW5kZXhPZihwdGhyZWFkLndvcmtlciksMSk7cHRocmVhZC53b3JrZXIucHRocmVhZD11bmRlZmluZWR9ZnVuY3Rpb24gY2FuY2VsVGhyZWFkKHB0aHJlYWRfcHRyKXt2YXIgcHRocmVhZD1QVGhyZWFkLnB0aHJlYWRzW3B0aHJlYWRfcHRyXTtwdGhyZWFkLndvcmtlci5wb3N0TWVzc2FnZSh7ImNtZCI6ImNhbmNlbCJ9KX1mdW5jdGlvbiBjbGVhbnVwVGhyZWFkKHB0aHJlYWRfcHRyKXt2YXIgcHRocmVhZD1QVGhyZWFkLnB0aHJlYWRzW3B0aHJlYWRfcHRyXTtpZihwdGhyZWFkKXtHUk9XQUJMRV9IRUFQX0kzMigpW3B0aHJlYWRfcHRyPj4yXT0wO3ZhciB3b3JrZXI9cHRocmVhZC53b3JrZXI7UFRocmVhZC5yZXR1cm5Xb3JrZXJUb1Bvb2wod29ya2VyKX19ZnVuY3Rpb24gemVyb01lbW9yeShhZGRyZXNzLHNpemUpe0dST1dBQkxFX0hFQVBfVTgoKS5maWxsKDAsYWRkcmVzcyxhZGRyZXNzK3NpemUpfWZ1bmN0aW9uIHNwYXduVGhyZWFkKHRocmVhZFBhcmFtcyl7dmFyIHdvcmtlcj1QVGhyZWFkLmdldE5ld1dvcmtlcigpO2lmKCF3b3JrZXIpe3JldHVybiA2fVBUaHJlYWQucnVubmluZ1dvcmtlcnMucHVzaCh3b3JrZXIpO3ZhciBwdGhyZWFkPVBUaHJlYWQucHRocmVhZHNbdGhyZWFkUGFyYW1zLnB0aHJlYWRfcHRyXT17d29ya2VyOndvcmtlcix0aHJlYWRJbmZvU3RydWN0OnRocmVhZFBhcmFtcy5wdGhyZWFkX3B0cn07d29ya2VyLnB0aHJlYWQ9cHRocmVhZDt2YXIgbXNnPXsiY21kIjoicnVuIiwic3RhcnRfcm91dGluZSI6dGhyZWFkUGFyYW1zLnN0YXJ0Um91dGluZSwiYXJnIjp0aHJlYWRQYXJhbXMuYXJnLCJ0aHJlYWRJbmZvU3RydWN0Ijp0aHJlYWRQYXJhbXMucHRocmVhZF9wdHJ9O3dvcmtlci5ydW5QdGhyZWFkPSgoKT0+e21zZy50aW1lPXBlcmZvcm1hbmNlLm5vdygpO3dvcmtlci5wb3N0TWVzc2FnZShtc2csdGhyZWFkUGFyYW1zLnRyYW5zZmVyTGlzdCl9KTtpZih3b3JrZXIubG9hZGVkKXt3b3JrZXIucnVuUHRocmVhZCgpO2RlbGV0ZSB3b3JrZXIucnVuUHRocmVhZH1yZXR1cm4gMH1mdW5jdGlvbiBfZXhpdChzdGF0dXMpe2V4aXQoc3RhdHVzKX1mdW5jdGlvbiBoYW5kbGVFeGNlcHRpb24oZSl7aWYoZSBpbnN0YW5jZW9mIEV4aXRTdGF0dXN8fGU9PSJ1bndpbmQiKXtyZXR1cm4gRVhJVFNUQVRVU31xdWl0XygxLGUpfXZhciBQVGhyZWFkPXt1bnVzZWRXb3JrZXJzOltdLHJ1bm5pbmdXb3JrZXJzOltdLHRsc0luaXRGdW5jdGlvbnM6W10saW5pdDpmdW5jdGlvbigpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpe1BUaHJlYWQuaW5pdFdvcmtlcigpfWVsc2V7UFRocmVhZC5pbml0TWFpblRocmVhZCgpfX0saW5pdE1haW5UaHJlYWQ6ZnVuY3Rpb24oKXt2YXIgcHRocmVhZFBvb2xTaXplPTY7Zm9yKHZhciBpPTA7aTxwdGhyZWFkUG9vbFNpemU7KytpKXtQVGhyZWFkLmFsbG9jYXRlVW51c2VkV29ya2VyKCl9fSxpbml0V29ya2VyOmZ1bmN0aW9uKCl7bm9FeGl0UnVudGltZT1mYWxzZX0scHRocmVhZHM6e30sc2V0RXhpdFN0YXR1czpmdW5jdGlvbihzdGF0dXMpe0VYSVRTVEFUVVM9c3RhdHVzfSx0ZXJtaW5hdGVBbGxUaHJlYWRzOmZ1bmN0aW9uKCl7Zm9yKHZhciB0IGluIFBUaHJlYWQucHRocmVhZHMpe3ZhciBwdGhyZWFkPVBUaHJlYWQucHRocmVhZHNbdF07aWYocHRocmVhZCYmcHRocmVhZC53b3JrZXIpe1BUaHJlYWQucmV0dXJuV29ya2VyVG9Qb29sKHB0aHJlYWQud29ya2VyKX19Zm9yKHZhciBpPTA7aTxQVGhyZWFkLnVudXNlZFdvcmtlcnMubGVuZ3RoOysraSl7dmFyIHdvcmtlcj1QVGhyZWFkLnVudXNlZFdvcmtlcnNbaV07d29ya2VyLnRlcm1pbmF0ZSgpfVBUaHJlYWQudW51c2VkV29ya2Vycz1bXX0scmV0dXJuV29ya2VyVG9Qb29sOmZ1bmN0aW9uKHdvcmtlcil7UFRocmVhZC5ydW5XaXRob3V0TWFpblRocmVhZFF1ZXVlZENhbGxzKGZ1bmN0aW9uKCl7ZGVsZXRlIFBUaHJlYWQucHRocmVhZHNbd29ya2VyLnB0aHJlYWQudGhyZWFkSW5mb1N0cnVjdF07UFRocmVhZC51bnVzZWRXb3JrZXJzLnB1c2god29ya2VyKTtQVGhyZWFkLnJ1bm5pbmdXb3JrZXJzLnNwbGljZShQVGhyZWFkLnJ1bm5pbmdXb3JrZXJzLmluZGV4T2Yod29ya2VyKSwxKTtfX2Vtc2NyaXB0ZW5fdGhyZWFkX2ZyZWVfZGF0YSh3b3JrZXIucHRocmVhZC50aHJlYWRJbmZvU3RydWN0KTt3b3JrZXIucHRocmVhZD11bmRlZmluZWR9KX0scnVuV2l0aG91dE1haW5UaHJlYWRRdWV1ZWRDYWxsczpmdW5jdGlvbihmdW5jKXtHUk9XQUJMRV9IRUFQX0kzMigpW19fZW1zY3JpcHRlbl9hbGxvd19tYWluX3J1bnRpbWVfcXVldWVkX2NhbGxzPj4yXT0wO3RyeXtmdW5jKCl9ZmluYWxseXtHUk9XQUJMRV9IRUFQX0kzMigpW19fZW1zY3JpcHRlbl9hbGxvd19tYWluX3J1bnRpbWVfcXVldWVkX2NhbGxzPj4yXT0xfX0scmVjZWl2ZU9iamVjdFRyYW5zZmVyOmZ1bmN0aW9uKGRhdGEpe30sdGhyZWFkSW5pdDpmdW5jdGlvbigpe2Zvcih2YXIgaSBpbiBQVGhyZWFkLnRsc0luaXRGdW5jdGlvbnMpe2lmKFBUaHJlYWQudGxzSW5pdEZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSlQVGhyZWFkLnRsc0luaXRGdW5jdGlvbnNbaV0oKX19LGxvYWRXYXNtTW9kdWxlVG9Xb3JrZXI6ZnVuY3Rpb24od29ya2VyLG9uRmluaXNoZWRMb2FkaW5nKXt3b3JrZXIub25tZXNzYWdlPShlPT57dmFyIGQ9ZVsiZGF0YSJdO3ZhciBjbWQ9ZFsiY21kIl07aWYod29ya2VyLnB0aHJlYWQpUFRocmVhZC5jdXJyZW50UHJveGllZE9wZXJhdGlvbkNhbGxlclRocmVhZD13b3JrZXIucHRocmVhZC50aHJlYWRJbmZvU3RydWN0O2lmKGRbInRhcmdldFRocmVhZCJdJiZkWyJ0YXJnZXRUaHJlYWQiXSE9X3B0aHJlYWRfc2VsZigpKXt2YXIgdGhyZWFkPVBUaHJlYWQucHRocmVhZHNbZC50YXJnZXRUaHJlYWRdO2lmKHRocmVhZCl7dGhyZWFkLndvcmtlci5wb3N0TWVzc2FnZShkLGRbInRyYW5zZmVyTGlzdCJdKX1lbHNle2VycignSW50ZXJuYWwgZXJyb3IhIFdvcmtlciBzZW50IGEgbWVzc2FnZSAiJytjbWQrJyIgdG8gdGFyZ2V0IHB0aHJlYWQgJytkWyJ0YXJnZXRUaHJlYWQiXSsiLCBidXQgdGhhdCB0aHJlYWQgbm8gbG9uZ2VyIGV4aXN0cyEiKX1QVGhyZWFkLmN1cnJlbnRQcm94aWVkT3BlcmF0aW9uQ2FsbGVyVGhyZWFkPXVuZGVmaW5lZDtyZXR1cm59aWYoY21kPT09InByb2Nlc3NQcm94eWluZ1F1ZXVlIil7ZXhlY3V0ZU5vdGlmaWVkUHJveHlpbmdRdWV1ZShkWyJxdWV1ZSJdKX1lbHNlIGlmKGNtZD09PSJzcGF3blRocmVhZCIpe3NwYXduVGhyZWFkKGQpfWVsc2UgaWYoY21kPT09ImNsZWFudXBUaHJlYWQiKXtjbGVhbnVwVGhyZWFkKGRbInRocmVhZCJdKX1lbHNlIGlmKGNtZD09PSJraWxsVGhyZWFkIil7a2lsbFRocmVhZChkWyJ0aHJlYWQiXSl9ZWxzZSBpZihjbWQ9PT0iY2FuY2VsVGhyZWFkIil7Y2FuY2VsVGhyZWFkKGRbInRocmVhZCJdKX1lbHNlIGlmKGNtZD09PSJsb2FkZWQiKXt3b3JrZXIubG9hZGVkPXRydWU7aWYob25GaW5pc2hlZExvYWRpbmcpb25GaW5pc2hlZExvYWRpbmcod29ya2VyKTtpZih3b3JrZXIucnVuUHRocmVhZCl7d29ya2VyLnJ1blB0aHJlYWQoKTtkZWxldGUgd29ya2VyLnJ1blB0aHJlYWR9fWVsc2UgaWYoY21kPT09InByaW50Iil7b3V0KCJUaHJlYWQgIitkWyJ0aHJlYWRJZCJdKyI6ICIrZFsidGV4dCJdKX1lbHNlIGlmKGNtZD09PSJwcmludEVyciIpe2VycigiVGhyZWFkICIrZFsidGhyZWFkSWQiXSsiOiAiK2RbInRleHQiXSl9ZWxzZSBpZihjbWQ9PT0iYWxlcnQiKXthbGVydCgiVGhyZWFkICIrZFsidGhyZWFkSWQiXSsiOiAiK2RbInRleHQiXSl9ZWxzZSBpZihkLnRhcmdldD09PSJzZXRpbW1lZGlhdGUiKXt3b3JrZXIucG9zdE1lc3NhZ2UoZCl9ZWxzZSBpZihjbWQ9PT0ib25BYm9ydCIpe2lmKE1vZHVsZVsib25BYm9ydCJdKXtNb2R1bGVbIm9uQWJvcnQiXShkWyJhcmciXSl9fWVsc2UgaWYoY21kKXtlcnIoIndvcmtlciBzZW50IGFuIHVua25vd24gY29tbWFuZCAiK2NtZCl9UFRocmVhZC5jdXJyZW50UHJveGllZE9wZXJhdGlvbkNhbGxlclRocmVhZD11bmRlZmluZWR9KTt3b3JrZXIub25lcnJvcj0oZT0+e3ZhciBtZXNzYWdlPSJ3b3JrZXIgc2VudCBhbiBlcnJvciEiO2VycihtZXNzYWdlKyIgIitlLmZpbGVuYW1lKyI6IitlLmxpbmVubysiOiAiK2UubWVzc2FnZSk7dGhyb3cgZX0pO3dvcmtlci5wb3N0TWVzc2FnZSh7ImNtZCI6ImxvYWQiLCJ1cmxPckJsb2IiOk1vZHVsZVsibWFpblNjcmlwdFVybE9yQmxvYiJdLCJ3YXNtTWVtb3J5Ijp3YXNtTWVtb3J5LCJ3YXNtTW9kdWxlIjp3YXNtTW9kdWxlfSl9LGFsbG9jYXRlVW51c2VkV29ya2VyOmZ1bmN0aW9uKCl7aWYoIU1vZHVsZVsibG9jYXRlRmlsZSJdKXtQVGhyZWFkLnVudXNlZFdvcmtlcnMucHVzaChuZXcgV29ya2VyKG5ldyBVUkwoIm1haW4tYmluLW11bHRpLndvcmtlci5qcyIsbG9jYXRpb24uaHJlZikpKTtyZXR1cm59dmFyIHB0aHJlYWRNYWluSnM9bG9jYXRlRmlsZSgibWFpbi1iaW4tbXVsdGkud29ya2VyLmpzIik7UFRocmVhZC51bnVzZWRXb3JrZXJzLnB1c2gobmV3IFdvcmtlcihwdGhyZWFkTWFpbkpzLCB7IHR5cGU6ICJtb2R1bGUiIH0pKX0sZ2V0TmV3V29ya2VyOmZ1bmN0aW9uKCl7aWYoUFRocmVhZC51bnVzZWRXb3JrZXJzLmxlbmd0aD09MCl7UFRocmVhZC5hbGxvY2F0ZVVudXNlZFdvcmtlcigpO1BUaHJlYWQubG9hZFdhc21Nb2R1bGVUb1dvcmtlcihQVGhyZWFkLnVudXNlZFdvcmtlcnNbMF0pfXJldHVybiBQVGhyZWFkLnVudXNlZFdvcmtlcnMucG9wKCl9fTtNb2R1bGVbIlBUaHJlYWQiXT1QVGhyZWFkO2Z1bmN0aW9uIGNhbGxSdW50aW1lQ2FsbGJhY2tzKGNhbGxiYWNrcyl7d2hpbGUoY2FsbGJhY2tzLmxlbmd0aD4wKXt2YXIgY2FsbGJhY2s9Y2FsbGJhY2tzLnNoaWZ0KCk7aWYodHlwZW9mIGNhbGxiYWNrPT0iZnVuY3Rpb24iKXtjYWxsYmFjayhNb2R1bGUpO2NvbnRpbnVlfXZhciBmdW5jPWNhbGxiYWNrLmZ1bmM7aWYodHlwZW9mIGZ1bmM9PSJudW1iZXIiKXtpZihjYWxsYmFjay5hcmc9PT11bmRlZmluZWQpe2dldFdhc21UYWJsZUVudHJ5KGZ1bmMpKCl9ZWxzZXtnZXRXYXNtVGFibGVFbnRyeShmdW5jKShjYWxsYmFjay5hcmcpfX1lbHNle2Z1bmMoY2FsbGJhY2suYXJnPT09dW5kZWZpbmVkP251bGw6Y2FsbGJhY2suYXJnKX19fWZ1bmN0aW9uIHdpdGhTdGFja1NhdmUoZil7dmFyIHN0YWNrPXN0YWNrU2F2ZSgpO3ZhciByZXQ9ZigpO3N0YWNrUmVzdG9yZShzdGFjayk7cmV0dXJuIHJldH1mdW5jdGlvbiBlc3RhYmxpc2hTdGFja1NwYWNlKCl7dmFyIHB0aHJlYWRfcHRyPV9wdGhyZWFkX3NlbGYoKTt2YXIgc3RhY2tUb3A9R1JPV0FCTEVfSEVBUF9JMzIoKVtwdGhyZWFkX3B0cis0ND4+Ml07dmFyIHN0YWNrU2l6ZT1HUk9XQUJMRV9IRUFQX0kzMigpW3B0aHJlYWRfcHRyKzQ4Pj4yXTt2YXIgc3RhY2tNYXg9c3RhY2tUb3Atc3RhY2tTaXplO19lbXNjcmlwdGVuX3N0YWNrX3NldF9saW1pdHMoc3RhY2tUb3Asc3RhY2tNYXgpO3N0YWNrUmVzdG9yZShzdGFja1RvcCl9TW9kdWxlWyJlc3RhYmxpc2hTdGFja1NwYWNlIl09ZXN0YWJsaXNoU3RhY2tTcGFjZTtmdW5jdGlvbiBleGl0T25NYWluVGhyZWFkKHJldHVybkNvZGUpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDEsMCxyZXR1cm5Db2RlKTt0cnl7X2V4aXQocmV0dXJuQ29kZSl9Y2F0Y2goZSl7aGFuZGxlRXhjZXB0aW9uKGUpfX12YXIgd2FzbVRhYmxlTWlycm9yPVtdO2Z1bmN0aW9uIGdldFdhc21UYWJsZUVudHJ5KGZ1bmNQdHIpe3ZhciBmdW5jPXdhc21UYWJsZU1pcnJvcltmdW5jUHRyXTtpZighZnVuYyl7aWYoZnVuY1B0cj49d2FzbVRhYmxlTWlycm9yLmxlbmd0aCl3YXNtVGFibGVNaXJyb3IubGVuZ3RoPWZ1bmNQdHIrMTt3YXNtVGFibGVNaXJyb3JbZnVuY1B0cl09ZnVuYz13YXNtVGFibGUuZ2V0KGZ1bmNQdHIpfXJldHVybiBmdW5jfWZ1bmN0aW9uIGludm9rZUVudHJ5UG9pbnQocHRyLGFyZyl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KHB0cikoYXJnKX1Nb2R1bGVbImludm9rZUVudHJ5UG9pbnQiXT1pbnZva2VFbnRyeVBvaW50O2Z1bmN0aW9uIHJlZ2lzdGVyVGxzSW5pdCh0bHNJbml0RnVuYyl7UFRocmVhZC50bHNJbml0RnVuY3Rpb25zLnB1c2godGxzSW5pdEZ1bmMpfWZ1bmN0aW9uIF9fX2Fzc2VydF9mYWlsKGNvbmRpdGlvbixmaWxlbmFtZSxsaW5lLGZ1bmMpe2Fib3J0KCJBc3NlcnRpb24gZmFpbGVkOiAiK1VURjhUb1N0cmluZyhjb25kaXRpb24pKyIsIGF0OiAiK1tmaWxlbmFtZT9VVEY4VG9TdHJpbmcoZmlsZW5hbWUpOiJ1bmtub3duIGZpbGVuYW1lIixsaW5lLGZ1bmM/VVRGOFRvU3RyaW5nKGZ1bmMpOiJ1bmtub3duIGZ1bmN0aW9uIl0pfWZ1bmN0aW9uIF9fX2N4YV9hbGxvY2F0ZV9leGNlcHRpb24oc2l6ZSl7cmV0dXJuIF9tYWxsb2Moc2l6ZSsyNCkrMjR9dmFyIGV4Y2VwdGlvbkNhdWdodD1bXTtmdW5jdGlvbiBleGNlcHRpb25fYWRkUmVmKGluZm8pe2luZm8uYWRkX3JlZigpfXZhciB1bmNhdWdodEV4Y2VwdGlvbkNvdW50PTA7ZnVuY3Rpb24gX19fY3hhX2JlZ2luX2NhdGNoKHB0cil7dmFyIGluZm89bmV3IEV4Y2VwdGlvbkluZm8ocHRyKTtpZighaW5mby5nZXRfY2F1Z2h0KCkpe2luZm8uc2V0X2NhdWdodCh0cnVlKTt1bmNhdWdodEV4Y2VwdGlvbkNvdW50LS19aW5mby5zZXRfcmV0aHJvd24oZmFsc2UpO2V4Y2VwdGlvbkNhdWdodC5wdXNoKGluZm8pO2V4Y2VwdGlvbl9hZGRSZWYoaW5mbyk7cmV0dXJuIGluZm8uZ2V0X2V4Y2VwdGlvbl9wdHIoKX1mdW5jdGlvbiBfX19jeGFfY3VycmVudF9wcmltYXJ5X2V4Y2VwdGlvbigpe2lmKCFleGNlcHRpb25DYXVnaHQubGVuZ3RoKXtyZXR1cm4gMH12YXIgaW5mbz1leGNlcHRpb25DYXVnaHRbZXhjZXB0aW9uQ2F1Z2h0Lmxlbmd0aC0xXTtleGNlcHRpb25fYWRkUmVmKGluZm8pO3JldHVybiBpbmZvLmV4Y1B0cn1mdW5jdGlvbiBFeGNlcHRpb25JbmZvKGV4Y1B0cil7dGhpcy5leGNQdHI9ZXhjUHRyO3RoaXMucHRyPWV4Y1B0ci0yNDt0aGlzLnNldF90eXBlPWZ1bmN0aW9uKHR5cGUpe0dST1dBQkxFX0hFQVBfVTMyKClbdGhpcy5wdHIrND4+Ml09dHlwZX07dGhpcy5nZXRfdHlwZT1mdW5jdGlvbigpe3JldHVybiBHUk9XQUJMRV9IRUFQX1UzMigpW3RoaXMucHRyKzQ+PjJdfTt0aGlzLnNldF9kZXN0cnVjdG9yPWZ1bmN0aW9uKGRlc3RydWN0b3Ipe0dST1dBQkxFX0hFQVBfVTMyKClbdGhpcy5wdHIrOD4+Ml09ZGVzdHJ1Y3Rvcn07dGhpcy5nZXRfZGVzdHJ1Y3Rvcj1mdW5jdGlvbigpe3JldHVybiBHUk9XQUJMRV9IRUFQX1UzMigpW3RoaXMucHRyKzg+PjJdfTt0aGlzLnNldF9yZWZjb3VudD1mdW5jdGlvbihyZWZjb3VudCl7R1JPV0FCTEVfSEVBUF9JMzIoKVt0aGlzLnB0cj4+Ml09cmVmY291bnR9O3RoaXMuc2V0X2NhdWdodD1mdW5jdGlvbihjYXVnaHQpe2NhdWdodD1jYXVnaHQ/MTowO0dST1dBQkxFX0hFQVBfSTgoKVt0aGlzLnB0cisxMj4+MF09Y2F1Z2h0fTt0aGlzLmdldF9jYXVnaHQ9ZnVuY3Rpb24oKXtyZXR1cm4gR1JPV0FCTEVfSEVBUF9JOCgpW3RoaXMucHRyKzEyPj4wXSE9MH07dGhpcy5zZXRfcmV0aHJvd249ZnVuY3Rpb24ocmV0aHJvd24pe3JldGhyb3duPXJldGhyb3duPzE6MDtHUk9XQUJMRV9IRUFQX0k4KClbdGhpcy5wdHIrMTM+PjBdPXJldGhyb3dufTt0aGlzLmdldF9yZXRocm93bj1mdW5jdGlvbigpe3JldHVybiBHUk9XQUJMRV9IRUFQX0k4KClbdGhpcy5wdHIrMTM+PjBdIT0wfTt0aGlzLmluaXQ9ZnVuY3Rpb24odHlwZSxkZXN0cnVjdG9yKXt0aGlzLnNldF9hZGp1c3RlZF9wdHIoMCk7dGhpcy5zZXRfdHlwZSh0eXBlKTt0aGlzLnNldF9kZXN0cnVjdG9yKGRlc3RydWN0b3IpO3RoaXMuc2V0X3JlZmNvdW50KDApO3RoaXMuc2V0X2NhdWdodChmYWxzZSk7dGhpcy5zZXRfcmV0aHJvd24oZmFsc2UpfTt0aGlzLmFkZF9yZWY9ZnVuY3Rpb24oKXtBdG9taWNzLmFkZChHUk9XQUJMRV9IRUFQX0kzMigpLHRoaXMucHRyKzA+PjIsMSl9O3RoaXMucmVsZWFzZV9yZWY9ZnVuY3Rpb24oKXt2YXIgcHJldj1BdG9taWNzLnN1YihHUk9XQUJMRV9IRUFQX0kzMigpLHRoaXMucHRyKzA+PjIsMSk7cmV0dXJuIHByZXY9PT0xfTt0aGlzLnNldF9hZGp1c3RlZF9wdHI9ZnVuY3Rpb24oYWRqdXN0ZWRQdHIpe0dST1dBQkxFX0hFQVBfVTMyKClbdGhpcy5wdHIrMTY+PjJdPWFkanVzdGVkUHRyfTt0aGlzLmdldF9hZGp1c3RlZF9wdHI9ZnVuY3Rpb24oKXtyZXR1cm4gR1JPV0FCTEVfSEVBUF9VMzIoKVt0aGlzLnB0cisxNj4+Ml19O3RoaXMuZ2V0X2V4Y2VwdGlvbl9wdHI9ZnVuY3Rpb24oKXt2YXIgaXNQb2ludGVyPV9fX2N4YV9pc19wb2ludGVyX3R5cGUodGhpcy5nZXRfdHlwZSgpKTtpZihpc1BvaW50ZXIpe3JldHVybiBHUk9XQUJMRV9IRUFQX1UzMigpW3RoaXMuZXhjUHRyPj4yXX12YXIgYWRqdXN0ZWQ9dGhpcy5nZXRfYWRqdXN0ZWRfcHRyKCk7aWYoYWRqdXN0ZWQhPT0wKXJldHVybiBhZGp1c3RlZDtyZXR1cm4gdGhpcy5leGNQdHJ9fWZ1bmN0aW9uIF9fX2N4YV9mcmVlX2V4Y2VwdGlvbihwdHIpe3JldHVybiBfZnJlZShuZXcgRXhjZXB0aW9uSW5mbyhwdHIpLnB0cil9ZnVuY3Rpb24gZXhjZXB0aW9uX2RlY1JlZihpbmZvKXtpZihpbmZvLnJlbGVhc2VfcmVmKCkmJiFpbmZvLmdldF9yZXRocm93bigpKXt2YXIgZGVzdHJ1Y3Rvcj1pbmZvLmdldF9kZXN0cnVjdG9yKCk7aWYoZGVzdHJ1Y3Rvcil7Z2V0V2FzbVRhYmxlRW50cnkoZGVzdHJ1Y3RvcikoaW5mby5leGNQdHIpfV9fX2N4YV9mcmVlX2V4Y2VwdGlvbihpbmZvLmV4Y1B0cil9fWZ1bmN0aW9uIF9fX2N4YV9kZWNyZW1lbnRfZXhjZXB0aW9uX3JlZmNvdW50KHB0cil7aWYoIXB0cilyZXR1cm47ZXhjZXB0aW9uX2RlY1JlZihuZXcgRXhjZXB0aW9uSW5mbyhwdHIpKX12YXIgZXhjZXB0aW9uTGFzdD0wO2Z1bmN0aW9uIF9fX2N4YV9lbmRfY2F0Y2goKXtfc2V0VGhyZXcoMCk7dmFyIGluZm89ZXhjZXB0aW9uQ2F1Z2h0LnBvcCgpO2V4Y2VwdGlvbl9kZWNSZWYoaW5mbyk7ZXhjZXB0aW9uTGFzdD0wfWZ1bmN0aW9uIF9fX3Jlc3VtZUV4Y2VwdGlvbihwdHIpe2lmKCFleGNlcHRpb25MYXN0KXtleGNlcHRpb25MYXN0PXB0cn10aHJvdyBwdHJ9ZnVuY3Rpb24gX19fY3hhX2ZpbmRfbWF0Y2hpbmdfY2F0Y2hfMigpe3ZhciB0aHJvd249ZXhjZXB0aW9uTGFzdDtpZighdGhyb3duKXtzZXRUZW1wUmV0MCgwKTtyZXR1cm4gMH12YXIgaW5mbz1uZXcgRXhjZXB0aW9uSW5mbyh0aHJvd24pO2luZm8uc2V0X2FkanVzdGVkX3B0cih0aHJvd24pO3ZhciB0aHJvd25UeXBlPWluZm8uZ2V0X3R5cGUoKTtpZighdGhyb3duVHlwZSl7c2V0VGVtcFJldDAoMCk7cmV0dXJuIHRocm93bn12YXIgdHlwZUFycmF5PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7Zm9yKHZhciBpPTA7aTx0eXBlQXJyYXkubGVuZ3RoO2krKyl7dmFyIGNhdWdodFR5cGU9dHlwZUFycmF5W2ldO2lmKGNhdWdodFR5cGU9PT0wfHxjYXVnaHRUeXBlPT09dGhyb3duVHlwZSl7YnJlYWt9dmFyIGFkanVzdGVkX3B0cl9hZGRyPWluZm8ucHRyKzE2O2lmKF9fX2N4YV9jYW5fY2F0Y2goY2F1Z2h0VHlwZSx0aHJvd25UeXBlLGFkanVzdGVkX3B0cl9hZGRyKSl7c2V0VGVtcFJldDAoY2F1Z2h0VHlwZSk7cmV0dXJuIHRocm93bn19c2V0VGVtcFJldDAodGhyb3duVHlwZSk7cmV0dXJuIHRocm93bn1mdW5jdGlvbiBfX19jeGFfZmluZF9tYXRjaGluZ19jYXRjaF8zKCl7dmFyIHRocm93bj1leGNlcHRpb25MYXN0O2lmKCF0aHJvd24pe3NldFRlbXBSZXQwKDApO3JldHVybiAwfXZhciBpbmZvPW5ldyBFeGNlcHRpb25JbmZvKHRocm93bik7aW5mby5zZXRfYWRqdXN0ZWRfcHRyKHRocm93bik7dmFyIHRocm93blR5cGU9aW5mby5nZXRfdHlwZSgpO2lmKCF0aHJvd25UeXBlKXtzZXRUZW1wUmV0MCgwKTtyZXR1cm4gdGhyb3dufXZhciB0eXBlQXJyYXk9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtmb3IodmFyIGk9MDtpPHR5cGVBcnJheS5sZW5ndGg7aSsrKXt2YXIgY2F1Z2h0VHlwZT10eXBlQXJyYXlbaV07aWYoY2F1Z2h0VHlwZT09PTB8fGNhdWdodFR5cGU9PT10aHJvd25UeXBlKXticmVha312YXIgYWRqdXN0ZWRfcHRyX2FkZHI9aW5mby5wdHIrMTY7aWYoX19fY3hhX2Nhbl9jYXRjaChjYXVnaHRUeXBlLHRocm93blR5cGUsYWRqdXN0ZWRfcHRyX2FkZHIpKXtzZXRUZW1wUmV0MChjYXVnaHRUeXBlKTtyZXR1cm4gdGhyb3dufX1zZXRUZW1wUmV0MCh0aHJvd25UeXBlKTtyZXR1cm4gdGhyb3dufWZ1bmN0aW9uIF9fX2N4YV9pbmNyZW1lbnRfZXhjZXB0aW9uX3JlZmNvdW50KHB0cil7aWYoIXB0cilyZXR1cm47ZXhjZXB0aW9uX2FkZFJlZihuZXcgRXhjZXB0aW9uSW5mbyhwdHIpKX1mdW5jdGlvbiBfX19jeGFfcmV0aHJvdygpe3ZhciBpbmZvPWV4Y2VwdGlvbkNhdWdodC5wb3AoKTtpZighaW5mbyl7YWJvcnQoIm5vIGV4Y2VwdGlvbiB0byB0aHJvdyIpfXZhciBwdHI9aW5mby5leGNQdHI7aWYoIWluZm8uZ2V0X3JldGhyb3duKCkpe2V4Y2VwdGlvbkNhdWdodC5wdXNoKGluZm8pO2luZm8uc2V0X3JldGhyb3duKHRydWUpO2luZm8uc2V0X2NhdWdodChmYWxzZSk7dW5jYXVnaHRFeGNlcHRpb25Db3VudCsrfWV4Y2VwdGlvbkxhc3Q9cHRyO3Rocm93IHB0cn1mdW5jdGlvbiBfX19jeGFfcmV0aHJvd19wcmltYXJ5X2V4Y2VwdGlvbihwdHIpe2lmKCFwdHIpcmV0dXJuO3ZhciBpbmZvPW5ldyBFeGNlcHRpb25JbmZvKHB0cik7ZXhjZXB0aW9uQ2F1Z2h0LnB1c2goaW5mbyk7aW5mby5zZXRfcmV0aHJvd24odHJ1ZSk7X19fY3hhX3JldGhyb3coKX1mdW5jdGlvbiBfX19jeGFfdGhyb3cocHRyLHR5cGUsZGVzdHJ1Y3Rvcil7dmFyIGluZm89bmV3IEV4Y2VwdGlvbkluZm8ocHRyKTtpbmZvLmluaXQodHlwZSxkZXN0cnVjdG9yKTtleGNlcHRpb25MYXN0PXB0cjt1bmNhdWdodEV4Y2VwdGlvbkNvdW50Kys7dGhyb3cgcHRyfWZ1bmN0aW9uIF9fX2N4YV91bmNhdWdodF9leGNlcHRpb25zKCl7cmV0dXJuIHVuY2F1Z2h0RXhjZXB0aW9uQ291bnR9ZnVuY3Rpb24gX19fZW1zY3JpcHRlbl9pbml0X21haW5fdGhyZWFkX2pzKHRiKXtfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQodGIsIUVOVklST05NRU5UX0lTX1dPUktFUiwxLCFFTlZJUk9OTUVOVF9JU19XRUIpO1BUaHJlYWQudGhyZWFkSW5pdCgpfWZ1bmN0aW9uIF9fX2Vtc2NyaXB0ZW5fdGhyZWFkX2NsZWFudXAodGhyZWFkKXtpZighRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCljbGVhbnVwVGhyZWFkKHRocmVhZCk7ZWxzZSBwb3N0TWVzc2FnZSh7ImNtZCI6ImNsZWFudXBUaHJlYWQiLCJ0aHJlYWQiOnRocmVhZH0pfWZ1bmN0aW9uIHB0aHJlYWRDcmVhdGVQcm94aWVkKHB0aHJlYWRfcHRyLGF0dHIsc3RhcnRfcm91dGluZSxhcmcpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDIsMSxwdGhyZWFkX3B0cixhdHRyLHN0YXJ0X3JvdXRpbmUsYXJnKTtyZXR1cm4gX19fcHRocmVhZF9jcmVhdGVfanMocHRocmVhZF9wdHIsYXR0cixzdGFydF9yb3V0aW5lLGFyZyl9ZnVuY3Rpb24gX19fcHRocmVhZF9jcmVhdGVfanMocHRocmVhZF9wdHIsYXR0cixzdGFydF9yb3V0aW5lLGFyZyl7aWYodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyPT0idW5kZWZpbmVkIil7ZXJyKCJDdXJyZW50IGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgU2hhcmVkQXJyYXlCdWZmZXIsIHB0aHJlYWRzIGFyZSBub3QgYXZhaWxhYmxlISIpO3JldHVybiA2fXZhciB0cmFuc2Zlckxpc3Q9W107dmFyIGVycm9yPTA7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCYmKHRyYW5zZmVyTGlzdC5sZW5ndGg9PT0wfHxlcnJvcikpe3JldHVybiBwdGhyZWFkQ3JlYXRlUHJveGllZChwdGhyZWFkX3B0cixhdHRyLHN0YXJ0X3JvdXRpbmUsYXJnKX1pZihlcnJvcilyZXR1cm4gZXJyb3I7dmFyIHRocmVhZFBhcmFtcz17c3RhcnRSb3V0aW5lOnN0YXJ0X3JvdXRpbmUscHRocmVhZF9wdHI6cHRocmVhZF9wdHIsYXJnOmFyZyx0cmFuc2Zlckxpc3Q6dHJhbnNmZXJMaXN0fTtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXt0aHJlYWRQYXJhbXMuY21kPSJzcGF3blRocmVhZCI7cG9zdE1lc3NhZ2UodGhyZWFkUGFyYW1zLHRyYW5zZmVyTGlzdCk7cmV0dXJuIDB9cmV0dXJuIHNwYXduVGhyZWFkKHRocmVhZFBhcmFtcyl9ZnVuY3Rpb24gc2V0RXJyTm8odmFsdWUpe0dST1dBQkxFX0hFQVBfSTMyKClbX19fZXJybm9fbG9jYXRpb24oKT4+Ml09dmFsdWU7cmV0dXJuIHZhbHVlfXZhciBQQVRIPXtpc0FiczpwYXRoPT5wYXRoLmNoYXJBdCgwKT09PSIvIixzcGxpdFBhdGg6ZmlsZW5hbWU9Pnt2YXIgc3BsaXRQYXRoUmU9L14oXC8/fCkoW1xzXFNdKj8pKCg/OlwuezEsMn18W15cL10rP3wpKFwuW14uXC9dKnwpKSg/OltcL10qKSQvO3JldHVybiBzcGxpdFBhdGhSZS5leGVjKGZpbGVuYW1lKS5zbGljZSgxKX0sbm9ybWFsaXplQXJyYXk6KHBhcnRzLGFsbG93QWJvdmVSb290KT0+e3ZhciB1cD0wO2Zvcih2YXIgaT1wYXJ0cy5sZW5ndGgtMTtpPj0wO2ktLSl7dmFyIGxhc3Q9cGFydHNbaV07aWYobGFzdD09PSIuIil7cGFydHMuc3BsaWNlKGksMSl9ZWxzZSBpZihsYXN0PT09Ii4uIil7cGFydHMuc3BsaWNlKGksMSk7dXArK31lbHNlIGlmKHVwKXtwYXJ0cy5zcGxpY2UoaSwxKTt1cC0tfX1pZihhbGxvd0Fib3ZlUm9vdCl7Zm9yKDt1cDt1cC0tKXtwYXJ0cy51bnNoaWZ0KCIuLiIpfX1yZXR1cm4gcGFydHN9LG5vcm1hbGl6ZTpwYXRoPT57dmFyIGlzQWJzb2x1dGU9UEFUSC5pc0FicyhwYXRoKSx0cmFpbGluZ1NsYXNoPXBhdGguc3Vic3RyKC0xKT09PSIvIjtwYXRoPVBBVEgubm9ybWFsaXplQXJyYXkocGF0aC5zcGxpdCgiLyIpLmZpbHRlcihwPT4hIXApLCFpc0Fic29sdXRlKS5qb2luKCIvIik7aWYoIXBhdGgmJiFpc0Fic29sdXRlKXtwYXRoPSIuIn1pZihwYXRoJiZ0cmFpbGluZ1NsYXNoKXtwYXRoKz0iLyJ9cmV0dXJuKGlzQWJzb2x1dGU/Ii8iOiIiKStwYXRofSxkaXJuYW1lOnBhdGg9Pnt2YXIgcmVzdWx0PVBBVEguc3BsaXRQYXRoKHBhdGgpLHJvb3Q9cmVzdWx0WzBdLGRpcj1yZXN1bHRbMV07aWYoIXJvb3QmJiFkaXIpe3JldHVybiIuIn1pZihkaXIpe2Rpcj1kaXIuc3Vic3RyKDAsZGlyLmxlbmd0aC0xKX1yZXR1cm4gcm9vdCtkaXJ9LGJhc2VuYW1lOnBhdGg9PntpZihwYXRoPT09Ii8iKXJldHVybiIvIjtwYXRoPVBBVEgubm9ybWFsaXplKHBhdGgpO3BhdGg9cGF0aC5yZXBsYWNlKC9cLyQvLCIiKTt2YXIgbGFzdFNsYXNoPXBhdGgubGFzdEluZGV4T2YoIi8iKTtpZihsYXN0U2xhc2g9PT0tMSlyZXR1cm4gcGF0aDtyZXR1cm4gcGF0aC5zdWJzdHIobGFzdFNsYXNoKzEpfSxqb2luOmZ1bmN0aW9uKCl7dmFyIHBhdGhzPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywwKTtyZXR1cm4gUEFUSC5ub3JtYWxpemUocGF0aHMuam9pbigiLyIpKX0sam9pbjI6KGwscik9PntyZXR1cm4gUEFUSC5ub3JtYWxpemUobCsiLyIrcil9fTtmdW5jdGlvbiBnZXRSYW5kb21EZXZpY2UoKXtpZih0eXBlb2YgY3J5cHRvPT0ib2JqZWN0IiYmdHlwZW9mIGNyeXB0b1siZ2V0UmFuZG9tVmFsdWVzIl09PSJmdW5jdGlvbiIpe3ZhciByYW5kb21CdWZmZXI9bmV3IFVpbnQ4QXJyYXkoMSk7cmV0dXJuIGZ1bmN0aW9uKCl7Y3J5cHRvLmdldFJhbmRvbVZhbHVlcyhyYW5kb21CdWZmZXIpO3JldHVybiByYW5kb21CdWZmZXJbMF19fWVsc2UgcmV0dXJuIGZ1bmN0aW9uKCl7YWJvcnQoInJhbmRvbURldmljZSIpfX12YXIgUEFUSF9GUz17cmVzb2x2ZTpmdW5jdGlvbigpe3ZhciByZXNvbHZlZFBhdGg9IiIscmVzb2x2ZWRBYnNvbHV0ZT1mYWxzZTtmb3IodmFyIGk9YXJndW1lbnRzLmxlbmd0aC0xO2k+PS0xJiYhcmVzb2x2ZWRBYnNvbHV0ZTtpLS0pe3ZhciBwYXRoPWk+PTA/YXJndW1lbnRzW2ldOkZTLmN3ZCgpO2lmKHR5cGVvZiBwYXRoIT0ic3RyaW5nIil7dGhyb3cgbmV3IFR5cGVFcnJvcigiQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MiKX1lbHNlIGlmKCFwYXRoKXtyZXR1cm4iIn1yZXNvbHZlZFBhdGg9cGF0aCsiLyIrcmVzb2x2ZWRQYXRoO3Jlc29sdmVkQWJzb2x1dGU9UEFUSC5pc0FicyhwYXRoKX1yZXNvbHZlZFBhdGg9UEFUSC5ub3JtYWxpemVBcnJheShyZXNvbHZlZFBhdGguc3BsaXQoIi8iKS5maWx0ZXIocD0+ISFwKSwhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbigiLyIpO3JldHVybihyZXNvbHZlZEFic29sdXRlPyIvIjoiIikrcmVzb2x2ZWRQYXRofHwiLiJ9LHJlbGF0aXZlOihmcm9tLHRvKT0+e2Zyb209UEFUSF9GUy5yZXNvbHZlKGZyb20pLnN1YnN0cigxKTt0bz1QQVRIX0ZTLnJlc29sdmUodG8pLnN1YnN0cigxKTtmdW5jdGlvbiB0cmltKGFycil7dmFyIHN0YXJ0PTA7Zm9yKDtzdGFydDxhcnIubGVuZ3RoO3N0YXJ0Kyspe2lmKGFycltzdGFydF0hPT0iIilicmVha312YXIgZW5kPWFyci5sZW5ndGgtMTtmb3IoO2VuZD49MDtlbmQtLSl7aWYoYXJyW2VuZF0hPT0iIilicmVha31pZihzdGFydD5lbmQpcmV0dXJuW107cmV0dXJuIGFyci5zbGljZShzdGFydCxlbmQtc3RhcnQrMSl9dmFyIGZyb21QYXJ0cz10cmltKGZyb20uc3BsaXQoIi8iKSk7dmFyIHRvUGFydHM9dHJpbSh0by5zcGxpdCgiLyIpKTt2YXIgbGVuZ3RoPU1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsdG9QYXJ0cy5sZW5ndGgpO3ZhciBzYW1lUGFydHNMZW5ndGg9bGVuZ3RoO2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7aWYoZnJvbVBhcnRzW2ldIT09dG9QYXJ0c1tpXSl7c2FtZVBhcnRzTGVuZ3RoPWk7YnJlYWt9fXZhciBvdXRwdXRQYXJ0cz1bXTtmb3IodmFyIGk9c2FtZVBhcnRzTGVuZ3RoO2k8ZnJvbVBhcnRzLmxlbmd0aDtpKyspe291dHB1dFBhcnRzLnB1c2goIi4uIil9b3V0cHV0UGFydHM9b3V0cHV0UGFydHMuY29uY2F0KHRvUGFydHMuc2xpY2Uoc2FtZVBhcnRzTGVuZ3RoKSk7cmV0dXJuIG91dHB1dFBhcnRzLmpvaW4oIi8iKX19O3ZhciBUVFk9e3R0eXM6W10saW5pdDpmdW5jdGlvbigpe30sc2h1dGRvd246ZnVuY3Rpb24oKXt9LHJlZ2lzdGVyOmZ1bmN0aW9uKGRldixvcHMpe1RUWS50dHlzW2Rldl09e2lucHV0OltdLG91dHB1dDpbXSxvcHM6b3BzfTtGUy5yZWdpc3RlckRldmljZShkZXYsVFRZLnN0cmVhbV9vcHMpfSxzdHJlYW1fb3BzOntvcGVuOmZ1bmN0aW9uKHN0cmVhbSl7dmFyIHR0eT1UVFkudHR5c1tzdHJlYW0ubm9kZS5yZGV2XTtpZighdHR5KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9c3RyZWFtLnR0eT10dHk7c3RyZWFtLnNlZWthYmxlPWZhbHNlfSxjbG9zZTpmdW5jdGlvbihzdHJlYW0pe3N0cmVhbS50dHkub3BzLmZsdXNoKHN0cmVhbS50dHkpfSxmbHVzaDpmdW5jdGlvbihzdHJlYW0pe3N0cmVhbS50dHkub3BzLmZsdXNoKHN0cmVhbS50dHkpfSxyZWFkOmZ1bmN0aW9uKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3Mpe2lmKCFzdHJlYW0udHR5fHwhc3RyZWFtLnR0eS5vcHMuZ2V0X2NoYXIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYwKX12YXIgYnl0ZXNSZWFkPTA7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXt2YXIgcmVzdWx0O3RyeXtyZXN1bHQ9c3RyZWFtLnR0eS5vcHMuZ2V0X2NoYXIoc3RyZWFtLnR0eSl9Y2F0Y2goZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjkpfWlmKHJlc3VsdD09PXVuZGVmaW5lZCYmYnl0ZXNSZWFkPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNil9aWYocmVzdWx0PT09bnVsbHx8cmVzdWx0PT09dW5kZWZpbmVkKWJyZWFrO2J5dGVzUmVhZCsrO2J1ZmZlcltvZmZzZXQraV09cmVzdWx0fWlmKGJ5dGVzUmVhZCl7c3RyZWFtLm5vZGUudGltZXN0YW1wPURhdGUubm93KCl9cmV0dXJuIGJ5dGVzUmVhZH0sd3JpdGU6ZnVuY3Rpb24oc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvcyl7aWYoIXN0cmVhbS50dHl8fCFzdHJlYW0udHR5Lm9wcy5wdXRfY2hhcil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjApfXRyeXtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe3N0cmVhbS50dHkub3BzLnB1dF9jaGFyKHN0cmVhbS50dHksYnVmZmVyW29mZnNldCtpXSl9fWNhdGNoKGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI5KX1pZihsZW5ndGgpe3N0cmVhbS5ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpfXJldHVybiBpfX0sZGVmYXVsdF90dHlfb3BzOntnZXRfY2hhcjpmdW5jdGlvbih0dHkpe2lmKCF0dHkuaW5wdXQubGVuZ3RoKXt2YXIgcmVzdWx0PW51bGw7aWYodHlwZW9mIHdpbmRvdyE9InVuZGVmaW5lZCImJnR5cGVvZiB3aW5kb3cucHJvbXB0PT0iZnVuY3Rpb24iKXtyZXN1bHQ9d2luZG93LnByb21wdCgiSW5wdXQ6ICIpO2lmKHJlc3VsdCE9PW51bGwpe3Jlc3VsdCs9IlxuIn19ZWxzZSBpZih0eXBlb2YgcmVhZGxpbmU9PSJmdW5jdGlvbiIpe3Jlc3VsdD1yZWFkbGluZSgpO2lmKHJlc3VsdCE9PW51bGwpe3Jlc3VsdCs9IlxuIn19aWYoIXJlc3VsdCl7cmV0dXJuIG51bGx9dHR5LmlucHV0PWludEFycmF5RnJvbVN0cmluZyhyZXN1bHQsdHJ1ZSl9cmV0dXJuIHR0eS5pbnB1dC5zaGlmdCgpfSxwdXRfY2hhcjpmdW5jdGlvbih0dHksdmFsKXtpZih2YWw9PT1udWxsfHx2YWw9PT0xMCl7b3V0KFVURjhBcnJheVRvU3RyaW5nKHR0eS5vdXRwdXQsMCkpO3R0eS5vdXRwdXQ9W119ZWxzZXtpZih2YWwhPTApdHR5Lm91dHB1dC5wdXNoKHZhbCl9fSxmbHVzaDpmdW5jdGlvbih0dHkpe2lmKHR0eS5vdXRwdXQmJnR0eS5vdXRwdXQubGVuZ3RoPjApe291dChVVEY4QXJyYXlUb1N0cmluZyh0dHkub3V0cHV0LDApKTt0dHkub3V0cHV0PVtdfX19LGRlZmF1bHRfdHR5MV9vcHM6e3B1dF9jaGFyOmZ1bmN0aW9uKHR0eSx2YWwpe2lmKHZhbD09PW51bGx8fHZhbD09PTEwKXtlcnIoVVRGOEFycmF5VG9TdHJpbmcodHR5Lm91dHB1dCwwKSk7dHR5Lm91dHB1dD1bXX1lbHNle2lmKHZhbCE9MCl0dHkub3V0cHV0LnB1c2godmFsKX19LGZsdXNoOmZ1bmN0aW9uKHR0eSl7aWYodHR5Lm91dHB1dCYmdHR5Lm91dHB1dC5sZW5ndGg+MCl7ZXJyKFVURjhBcnJheVRvU3RyaW5nKHR0eS5vdXRwdXQsMCkpO3R0eS5vdXRwdXQ9W119fX19O2Z1bmN0aW9uIGFsaWduTWVtb3J5KHNpemUsYWxpZ25tZW50KXtyZXR1cm4gTWF0aC5jZWlsKHNpemUvYWxpZ25tZW50KSphbGlnbm1lbnR9ZnVuY3Rpb24gbW1hcEFsbG9jKHNpemUpe3NpemU9YWxpZ25NZW1vcnkoc2l6ZSw2NTUzNik7dmFyIHB0cj1fZW1zY3JpcHRlbl9idWlsdGluX21lbWFsaWduKDY1NTM2LHNpemUpO2lmKCFwdHIpcmV0dXJuIDA7emVyb01lbW9yeShwdHIsc2l6ZSk7cmV0dXJuIHB0cn12YXIgTUVNRlM9e29wc190YWJsZTpudWxsLG1vdW50OmZ1bmN0aW9uKG1vdW50KXtyZXR1cm4gTUVNRlMuY3JlYXRlTm9kZShudWxsLCIvIiwxNjM4NHw1MTEsMCl9LGNyZWF0ZU5vZGU6ZnVuY3Rpb24ocGFyZW50LG5hbWUsbW9kZSxkZXYpe2lmKEZTLmlzQmxrZGV2KG1vZGUpfHxGUy5pc0ZJRk8obW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYzKX1pZighTUVNRlMub3BzX3RhYmxlKXtNRU1GUy5vcHNfdGFibGU9e2Rpcjp7bm9kZTp7Z2V0YXR0cjpNRU1GUy5ub2RlX29wcy5nZXRhdHRyLHNldGF0dHI6TUVNRlMubm9kZV9vcHMuc2V0YXR0cixsb29rdXA6TUVNRlMubm9kZV9vcHMubG9va3VwLG1rbm9kOk1FTUZTLm5vZGVfb3BzLm1rbm9kLHJlbmFtZTpNRU1GUy5ub2RlX29wcy5yZW5hbWUsdW5saW5rOk1FTUZTLm5vZGVfb3BzLnVubGluayxybWRpcjpNRU1GUy5ub2RlX29wcy5ybWRpcixyZWFkZGlyOk1FTUZTLm5vZGVfb3BzLnJlYWRkaXIsc3ltbGluazpNRU1GUy5ub2RlX29wcy5zeW1saW5rfSxzdHJlYW06e2xsc2VlazpNRU1GUy5zdHJlYW1fb3BzLmxsc2Vla319LGZpbGU6e25vZGU6e2dldGF0dHI6TUVNRlMubm9kZV9vcHMuZ2V0YXR0cixzZXRhdHRyOk1FTUZTLm5vZGVfb3BzLnNldGF0dHJ9LHN0cmVhbTp7bGxzZWVrOk1FTUZTLnN0cmVhbV9vcHMubGxzZWVrLHJlYWQ6TUVNRlMuc3RyZWFtX29wcy5yZWFkLHdyaXRlOk1FTUZTLnN0cmVhbV9vcHMud3JpdGUsYWxsb2NhdGU6TUVNRlMuc3RyZWFtX29wcy5hbGxvY2F0ZSxtbWFwOk1FTUZTLnN0cmVhbV9vcHMubW1hcCxtc3luYzpNRU1GUy5zdHJlYW1fb3BzLm1zeW5jfX0sbGluazp7bm9kZTp7Z2V0YXR0cjpNRU1GUy5ub2RlX29wcy5nZXRhdHRyLHNldGF0dHI6TUVNRlMubm9kZV9vcHMuc2V0YXR0cixyZWFkbGluazpNRU1GUy5ub2RlX29wcy5yZWFkbGlua30sc3RyZWFtOnt9fSxjaHJkZXY6e25vZGU6e2dldGF0dHI6TUVNRlMubm9kZV9vcHMuZ2V0YXR0cixzZXRhdHRyOk1FTUZTLm5vZGVfb3BzLnNldGF0dHJ9LHN0cmVhbTpGUy5jaHJkZXZfc3RyZWFtX29wc319fXZhciBub2RlPUZTLmNyZWF0ZU5vZGUocGFyZW50LG5hbWUsbW9kZSxkZXYpO2lmKEZTLmlzRGlyKG5vZGUubW9kZSkpe25vZGUubm9kZV9vcHM9TUVNRlMub3BzX3RhYmxlLmRpci5ub2RlO25vZGUuc3RyZWFtX29wcz1NRU1GUy5vcHNfdGFibGUuZGlyLnN0cmVhbTtub2RlLmNvbnRlbnRzPXt9fWVsc2UgaWYoRlMuaXNGaWxlKG5vZGUubW9kZSkpe25vZGUubm9kZV9vcHM9TUVNRlMub3BzX3RhYmxlLmZpbGUubm9kZTtub2RlLnN0cmVhbV9vcHM9TUVNRlMub3BzX3RhYmxlLmZpbGUuc3RyZWFtO25vZGUudXNlZEJ5dGVzPTA7bm9kZS5jb250ZW50cz1udWxsfWVsc2UgaWYoRlMuaXNMaW5rKG5vZGUubW9kZSkpe25vZGUubm9kZV9vcHM9TUVNRlMub3BzX3RhYmxlLmxpbmsubm9kZTtub2RlLnN0cmVhbV9vcHM9TUVNRlMub3BzX3RhYmxlLmxpbmsuc3RyZWFtfWVsc2UgaWYoRlMuaXNDaHJkZXYobm9kZS5tb2RlKSl7bm9kZS5ub2RlX29wcz1NRU1GUy5vcHNfdGFibGUuY2hyZGV2Lm5vZGU7bm9kZS5zdHJlYW1fb3BzPU1FTUZTLm9wc190YWJsZS5jaHJkZXYuc3RyZWFtfW5vZGUudGltZXN0YW1wPURhdGUubm93KCk7aWYocGFyZW50KXtwYXJlbnQuY29udGVudHNbbmFtZV09bm9kZTtwYXJlbnQudGltZXN0YW1wPW5vZGUudGltZXN0YW1wfXJldHVybiBub2RlfSxnZXRGaWxlRGF0YUFzVHlwZWRBcnJheTpmdW5jdGlvbihub2RlKXtpZighbm9kZS5jb250ZW50cylyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoMCk7aWYobm9kZS5jb250ZW50cy5zdWJhcnJheSlyZXR1cm4gbm9kZS5jb250ZW50cy5zdWJhcnJheSgwLG5vZGUudXNlZEJ5dGVzKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkobm9kZS5jb250ZW50cyl9LGV4cGFuZEZpbGVTdG9yYWdlOmZ1bmN0aW9uKG5vZGUsbmV3Q2FwYWNpdHkpe3ZhciBwcmV2Q2FwYWNpdHk9bm9kZS5jb250ZW50cz9ub2RlLmNvbnRlbnRzLmxlbmd0aDowO2lmKHByZXZDYXBhY2l0eT49bmV3Q2FwYWNpdHkpcmV0dXJuO3ZhciBDQVBBQ0lUWV9ET1VCTElOR19NQVg9MTAyNCoxMDI0O25ld0NhcGFjaXR5PU1hdGgubWF4KG5ld0NhcGFjaXR5LHByZXZDYXBhY2l0eSoocHJldkNhcGFjaXR5PENBUEFDSVRZX0RPVUJMSU5HX01BWD8yOjEuMTI1KT4+PjApO2lmKHByZXZDYXBhY2l0eSE9MCluZXdDYXBhY2l0eT1NYXRoLm1heChuZXdDYXBhY2l0eSwyNTYpO3ZhciBvbGRDb250ZW50cz1ub2RlLmNvbnRlbnRzO25vZGUuY29udGVudHM9bmV3IFVpbnQ4QXJyYXkobmV3Q2FwYWNpdHkpO2lmKG5vZGUudXNlZEJ5dGVzPjApbm9kZS5jb250ZW50cy5zZXQob2xkQ29udGVudHMuc3ViYXJyYXkoMCxub2RlLnVzZWRCeXRlcyksMCl9LHJlc2l6ZUZpbGVTdG9yYWdlOmZ1bmN0aW9uKG5vZGUsbmV3U2l6ZSl7aWYobm9kZS51c2VkQnl0ZXM9PW5ld1NpemUpcmV0dXJuO2lmKG5ld1NpemU9PTApe25vZGUuY29udGVudHM9bnVsbDtub2RlLnVzZWRCeXRlcz0wfWVsc2V7dmFyIG9sZENvbnRlbnRzPW5vZGUuY29udGVudHM7bm9kZS5jb250ZW50cz1uZXcgVWludDhBcnJheShuZXdTaXplKTtpZihvbGRDb250ZW50cyl7bm9kZS5jb250ZW50cy5zZXQob2xkQ29udGVudHMuc3ViYXJyYXkoMCxNYXRoLm1pbihuZXdTaXplLG5vZGUudXNlZEJ5dGVzKSkpfW5vZGUudXNlZEJ5dGVzPW5ld1NpemV9fSxub2RlX29wczp7Z2V0YXR0cjpmdW5jdGlvbihub2RlKXt2YXIgYXR0cj17fTthdHRyLmRldj1GUy5pc0NocmRldihub2RlLm1vZGUpP25vZGUuaWQ6MTthdHRyLmlubz1ub2RlLmlkO2F0dHIubW9kZT1ub2RlLm1vZGU7YXR0ci5ubGluaz0xO2F0dHIudWlkPTA7YXR0ci5naWQ9MDthdHRyLnJkZXY9bm9kZS5yZGV2O2lmKEZTLmlzRGlyKG5vZGUubW9kZSkpe2F0dHIuc2l6ZT00MDk2fWVsc2UgaWYoRlMuaXNGaWxlKG5vZGUubW9kZSkpe2F0dHIuc2l6ZT1ub2RlLnVzZWRCeXRlc31lbHNlIGlmKEZTLmlzTGluayhub2RlLm1vZGUpKXthdHRyLnNpemU9bm9kZS5saW5rLmxlbmd0aH1lbHNle2F0dHIuc2l6ZT0wfWF0dHIuYXRpbWU9bmV3IERhdGUobm9kZS50aW1lc3RhbXApO2F0dHIubXRpbWU9bmV3IERhdGUobm9kZS50aW1lc3RhbXApO2F0dHIuY3RpbWU9bmV3IERhdGUobm9kZS50aW1lc3RhbXApO2F0dHIuYmxrc2l6ZT00MDk2O2F0dHIuYmxvY2tzPU1hdGguY2VpbChhdHRyLnNpemUvYXR0ci5ibGtzaXplKTtyZXR1cm4gYXR0cn0sc2V0YXR0cjpmdW5jdGlvbihub2RlLGF0dHIpe2lmKGF0dHIubW9kZSE9PXVuZGVmaW5lZCl7bm9kZS5tb2RlPWF0dHIubW9kZX1pZihhdHRyLnRpbWVzdGFtcCE9PXVuZGVmaW5lZCl7bm9kZS50aW1lc3RhbXA9YXR0ci50aW1lc3RhbXB9aWYoYXR0ci5zaXplIT09dW5kZWZpbmVkKXtNRU1GUy5yZXNpemVGaWxlU3RvcmFnZShub2RlLGF0dHIuc2l6ZSl9fSxsb29rdXA6ZnVuY3Rpb24ocGFyZW50LG5hbWUpe3Rocm93IEZTLmdlbmVyaWNFcnJvcnNbNDRdfSxta25vZDpmdW5jdGlvbihwYXJlbnQsbmFtZSxtb2RlLGRldil7cmV0dXJuIE1FTUZTLmNyZWF0ZU5vZGUocGFyZW50LG5hbWUsbW9kZSxkZXYpfSxyZW5hbWU6ZnVuY3Rpb24ob2xkX25vZGUsbmV3X2RpcixuZXdfbmFtZSl7aWYoRlMuaXNEaXIob2xkX25vZGUubW9kZSkpe3ZhciBuZXdfbm9kZTt0cnl7bmV3X25vZGU9RlMubG9va3VwTm9kZShuZXdfZGlyLG5ld19uYW1lKX1jYXRjaChlKXt9aWYobmV3X25vZGUpe2Zvcih2YXIgaSBpbiBuZXdfbm9kZS5jb250ZW50cyl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTUpfX19ZGVsZXRlIG9sZF9ub2RlLnBhcmVudC5jb250ZW50c1tvbGRfbm9kZS5uYW1lXTtvbGRfbm9kZS5wYXJlbnQudGltZXN0YW1wPURhdGUubm93KCk7b2xkX25vZGUubmFtZT1uZXdfbmFtZTtuZXdfZGlyLmNvbnRlbnRzW25ld19uYW1lXT1vbGRfbm9kZTtuZXdfZGlyLnRpbWVzdGFtcD1vbGRfbm9kZS5wYXJlbnQudGltZXN0YW1wO29sZF9ub2RlLnBhcmVudD1uZXdfZGlyfSx1bmxpbms6ZnVuY3Rpb24ocGFyZW50LG5hbWUpe2RlbGV0ZSBwYXJlbnQuY29udGVudHNbbmFtZV07cGFyZW50LnRpbWVzdGFtcD1EYXRlLm5vdygpfSxybWRpcjpmdW5jdGlvbihwYXJlbnQsbmFtZSl7dmFyIG5vZGU9RlMubG9va3VwTm9kZShwYXJlbnQsbmFtZSk7Zm9yKHZhciBpIGluIG5vZGUuY29udGVudHMpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU1KX1kZWxldGUgcGFyZW50LmNvbnRlbnRzW25hbWVdO3BhcmVudC50aW1lc3RhbXA9RGF0ZS5ub3coKX0scmVhZGRpcjpmdW5jdGlvbihub2RlKXt2YXIgZW50cmllcz1bIi4iLCIuLiJdO2Zvcih2YXIga2V5IGluIG5vZGUuY29udGVudHMpe2lmKCFub2RlLmNvbnRlbnRzLmhhc093blByb3BlcnR5KGtleSkpe2NvbnRpbnVlfWVudHJpZXMucHVzaChrZXkpfXJldHVybiBlbnRyaWVzfSxzeW1saW5rOmZ1bmN0aW9uKHBhcmVudCxuZXduYW1lLG9sZHBhdGgpe3ZhciBub2RlPU1FTUZTLmNyZWF0ZU5vZGUocGFyZW50LG5ld25hbWUsNTExfDQwOTYwLDApO25vZGUubGluaz1vbGRwYXRoO3JldHVybiBub2RlfSxyZWFkbGluazpmdW5jdGlvbihub2RlKXtpZighRlMuaXNMaW5rKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1yZXR1cm4gbm9kZS5saW5rfX0sc3RyZWFtX29wczp7cmVhZDpmdW5jdGlvbihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24pe3ZhciBjb250ZW50cz1zdHJlYW0ubm9kZS5jb250ZW50cztpZihwb3NpdGlvbj49c3RyZWFtLm5vZGUudXNlZEJ5dGVzKXJldHVybiAwO3ZhciBzaXplPU1hdGgubWluKHN0cmVhbS5ub2RlLnVzZWRCeXRlcy1wb3NpdGlvbixsZW5ndGgpO2lmKHNpemU+OCYmY29udGVudHMuc3ViYXJyYXkpe2J1ZmZlci5zZXQoY29udGVudHMuc3ViYXJyYXkocG9zaXRpb24scG9zaXRpb24rc2l6ZSksb2Zmc2V0KX1lbHNle2Zvcih2YXIgaT0wO2k8c2l6ZTtpKyspYnVmZmVyW29mZnNldCtpXT1jb250ZW50c1twb3NpdGlvbitpXX1yZXR1cm4gc2l6ZX0sd3JpdGU6ZnVuY3Rpb24oc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uLGNhbk93bil7aWYoYnVmZmVyLmJ1ZmZlcj09PUdST1dBQkxFX0hFQVBfSTgoKS5idWZmZXIpe2Nhbk93bj1mYWxzZX1pZighbGVuZ3RoKXJldHVybiAwO3ZhciBub2RlPXN0cmVhbS5ub2RlO25vZGUudGltZXN0YW1wPURhdGUubm93KCk7aWYoYnVmZmVyLnN1YmFycmF5JiYoIW5vZGUuY29udGVudHN8fG5vZGUuY29udGVudHMuc3ViYXJyYXkpKXtpZihjYW5Pd24pe25vZGUuY29udGVudHM9YnVmZmVyLnN1YmFycmF5KG9mZnNldCxvZmZzZXQrbGVuZ3RoKTtub2RlLnVzZWRCeXRlcz1sZW5ndGg7cmV0dXJuIGxlbmd0aH1lbHNlIGlmKG5vZGUudXNlZEJ5dGVzPT09MCYmcG9zaXRpb249PT0wKXtub2RlLmNvbnRlbnRzPWJ1ZmZlci5zbGljZShvZmZzZXQsb2Zmc2V0K2xlbmd0aCk7bm9kZS51c2VkQnl0ZXM9bGVuZ3RoO3JldHVybiBsZW5ndGh9ZWxzZSBpZihwb3NpdGlvbitsZW5ndGg8PW5vZGUudXNlZEJ5dGVzKXtub2RlLmNvbnRlbnRzLnNldChidWZmZXIuc3ViYXJyYXkob2Zmc2V0LG9mZnNldCtsZW5ndGgpLHBvc2l0aW9uKTtyZXR1cm4gbGVuZ3RofX1NRU1GUy5leHBhbmRGaWxlU3RvcmFnZShub2RlLHBvc2l0aW9uK2xlbmd0aCk7aWYobm9kZS5jb250ZW50cy5zdWJhcnJheSYmYnVmZmVyLnN1YmFycmF5KXtub2RlLmNvbnRlbnRzLnNldChidWZmZXIuc3ViYXJyYXkob2Zmc2V0LG9mZnNldCtsZW5ndGgpLHBvc2l0aW9uKX1lbHNle2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7bm9kZS5jb250ZW50c1twb3NpdGlvbitpXT1idWZmZXJbb2Zmc2V0K2ldfX1ub2RlLnVzZWRCeXRlcz1NYXRoLm1heChub2RlLnVzZWRCeXRlcyxwb3NpdGlvbitsZW5ndGgpO3JldHVybiBsZW5ndGh9LGxsc2VlazpmdW5jdGlvbihzdHJlYW0sb2Zmc2V0LHdoZW5jZSl7dmFyIHBvc2l0aW9uPW9mZnNldDtpZih3aGVuY2U9PT0xKXtwb3NpdGlvbis9c3RyZWFtLnBvc2l0aW9ufWVsc2UgaWYod2hlbmNlPT09Mil7aWYoRlMuaXNGaWxlKHN0cmVhbS5ub2RlLm1vZGUpKXtwb3NpdGlvbis9c3RyZWFtLm5vZGUudXNlZEJ5dGVzfX1pZihwb3NpdGlvbjwwKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9cmV0dXJuIHBvc2l0aW9ufSxhbGxvY2F0ZTpmdW5jdGlvbihzdHJlYW0sb2Zmc2V0LGxlbmd0aCl7TUVNRlMuZXhwYW5kRmlsZVN0b3JhZ2Uoc3RyZWFtLm5vZGUsb2Zmc2V0K2xlbmd0aCk7c3RyZWFtLm5vZGUudXNlZEJ5dGVzPU1hdGgubWF4KHN0cmVhbS5ub2RlLnVzZWRCeXRlcyxvZmZzZXQrbGVuZ3RoKX0sbW1hcDpmdW5jdGlvbihzdHJlYW0sYWRkcmVzcyxsZW5ndGgscG9zaXRpb24scHJvdCxmbGFncyl7aWYoYWRkcmVzcyE9PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZighRlMuaXNGaWxlKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9dmFyIHB0cjt2YXIgYWxsb2NhdGVkO3ZhciBjb250ZW50cz1zdHJlYW0ubm9kZS5jb250ZW50cztpZighKGZsYWdzJjIpJiZjb250ZW50cy5idWZmZXI9PT1idWZmZXIpe2FsbG9jYXRlZD1mYWxzZTtwdHI9Y29udGVudHMuYnl0ZU9mZnNldH1lbHNle2lmKHBvc2l0aW9uPjB8fHBvc2l0aW9uK2xlbmd0aDxjb250ZW50cy5sZW5ndGgpe2lmKGNvbnRlbnRzLnN1YmFycmF5KXtjb250ZW50cz1jb250ZW50cy5zdWJhcnJheShwb3NpdGlvbixwb3NpdGlvbitsZW5ndGgpfWVsc2V7Y29udGVudHM9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY29udGVudHMscG9zaXRpb24scG9zaXRpb24rbGVuZ3RoKX19YWxsb2NhdGVkPXRydWU7cHRyPW1tYXBBbGxvYyhsZW5ndGgpO2lmKCFwdHIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ4KX1HUk9XQUJMRV9IRUFQX0k4KCkuc2V0KGNvbnRlbnRzLHB0cil9cmV0dXJue3B0cjpwdHIsYWxsb2NhdGVkOmFsbG9jYXRlZH19LG1zeW5jOmZ1bmN0aW9uKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxtbWFwRmxhZ3Mpe2lmKCFGUy5pc0ZpbGUoc3RyZWFtLm5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQzKX1pZihtbWFwRmxhZ3MmMil7cmV0dXJuIDB9dmFyIGJ5dGVzV3JpdHRlbj1NRU1GUy5zdHJlYW1fb3BzLndyaXRlKHN0cmVhbSxidWZmZXIsMCxsZW5ndGgsb2Zmc2V0LGZhbHNlKTtyZXR1cm4gMH19fTtmdW5jdGlvbiBhc3luY0xvYWQodXJsLG9ubG9hZCxvbmVycm9yLG5vUnVuRGVwKXt2YXIgZGVwPSFub1J1bkRlcD9nZXRVbmlxdWVSdW5EZXBlbmRlbmN5KCJhbCAiK3VybCk6IiI7cmVhZEFzeW5jKHVybCxmdW5jdGlvbihhcnJheUJ1ZmZlcil7YXNzZXJ0KGFycmF5QnVmZmVyLCdMb2FkaW5nIGRhdGEgZmlsZSAiJyt1cmwrJyIgZmFpbGVkIChubyBhcnJheUJ1ZmZlcikuJyk7b25sb2FkKG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKSk7aWYoZGVwKXJlbW92ZVJ1bkRlcGVuZGVuY3koZGVwKX0sZnVuY3Rpb24oZXZlbnQpe2lmKG9uZXJyb3Ipe29uZXJyb3IoKX1lbHNle3Rocm93J0xvYWRpbmcgZGF0YSBmaWxlICInK3VybCsnIiBmYWlsZWQuJ319KTtpZihkZXApYWRkUnVuRGVwZW5kZW5jeShkZXApfXZhciBGUz17cm9vdDpudWxsLG1vdW50czpbXSxkZXZpY2VzOnt9LHN0cmVhbXM6W10sbmV4dElub2RlOjEsbmFtZVRhYmxlOm51bGwsY3VycmVudFBhdGg6Ii8iLGluaXRpYWxpemVkOmZhbHNlLGlnbm9yZVBlcm1pc3Npb25zOnRydWUsRXJybm9FcnJvcjpudWxsLGdlbmVyaWNFcnJvcnM6e30sZmlsZXN5c3RlbXM6bnVsbCxzeW5jRlNSZXF1ZXN0czowLGxvb2t1cFBhdGg6KHBhdGgsb3B0cz17fSk9PntwYXRoPVBBVEhfRlMucmVzb2x2ZShGUy5jd2QoKSxwYXRoKTtpZighcGF0aClyZXR1cm57cGF0aDoiIixub2RlOm51bGx9O3ZhciBkZWZhdWx0cz17Zm9sbG93X21vdW50OnRydWUscmVjdXJzZV9jb3VudDowfTtvcHRzPU9iamVjdC5hc3NpZ24oZGVmYXVsdHMsb3B0cyk7aWYob3B0cy5yZWN1cnNlX2NvdW50Pjgpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDMyKX12YXIgcGFydHM9UEFUSC5ub3JtYWxpemVBcnJheShwYXRoLnNwbGl0KCIvIikuZmlsdGVyKHA9PiEhcCksZmFsc2UpO3ZhciBjdXJyZW50PUZTLnJvb3Q7dmFyIGN1cnJlbnRfcGF0aD0iLyI7Zm9yKHZhciBpPTA7aTxwYXJ0cy5sZW5ndGg7aSsrKXt2YXIgaXNsYXN0PWk9PT1wYXJ0cy5sZW5ndGgtMTtpZihpc2xhc3QmJm9wdHMucGFyZW50KXticmVha31jdXJyZW50PUZTLmxvb2t1cE5vZGUoY3VycmVudCxwYXJ0c1tpXSk7Y3VycmVudF9wYXRoPVBBVEguam9pbjIoY3VycmVudF9wYXRoLHBhcnRzW2ldKTtpZihGUy5pc01vdW50cG9pbnQoY3VycmVudCkpe2lmKCFpc2xhc3R8fGlzbGFzdCYmb3B0cy5mb2xsb3dfbW91bnQpe2N1cnJlbnQ9Y3VycmVudC5tb3VudGVkLnJvb3R9fWlmKCFpc2xhc3R8fG9wdHMuZm9sbG93KXt2YXIgY291bnQ9MDt3aGlsZShGUy5pc0xpbmsoY3VycmVudC5tb2RlKSl7dmFyIGxpbms9RlMucmVhZGxpbmsoY3VycmVudF9wYXRoKTtjdXJyZW50X3BhdGg9UEFUSF9GUy5yZXNvbHZlKFBBVEguZGlybmFtZShjdXJyZW50X3BhdGgpLGxpbmspO3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChjdXJyZW50X3BhdGgse3JlY3Vyc2VfY291bnQ6b3B0cy5yZWN1cnNlX2NvdW50KzF9KTtjdXJyZW50PWxvb2t1cC5ub2RlO2lmKGNvdW50Kys+NDApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDMyKX19fX1yZXR1cm57cGF0aDpjdXJyZW50X3BhdGgsbm9kZTpjdXJyZW50fX0sZ2V0UGF0aDpub2RlPT57dmFyIHBhdGg7d2hpbGUodHJ1ZSl7aWYoRlMuaXNSb290KG5vZGUpKXt2YXIgbW91bnQ9bm9kZS5tb3VudC5tb3VudHBvaW50O2lmKCFwYXRoKXJldHVybiBtb3VudDtyZXR1cm4gbW91bnRbbW91bnQubGVuZ3RoLTFdIT09Ii8iP21vdW50KyIvIitwYXRoOm1vdW50K3BhdGh9cGF0aD1wYXRoP25vZGUubmFtZSsiLyIrcGF0aDpub2RlLm5hbWU7bm9kZT1ub2RlLnBhcmVudH19LGhhc2hOYW1lOihwYXJlbnRpZCxuYW1lKT0+e3ZhciBoYXNoPTA7Zm9yKHZhciBpPTA7aTxuYW1lLmxlbmd0aDtpKyspe2hhc2g9KGhhc2g8PDUpLWhhc2grbmFtZS5jaGFyQ29kZUF0KGkpfDB9cmV0dXJuKHBhcmVudGlkK2hhc2g+Pj4wKSVGUy5uYW1lVGFibGUubGVuZ3RofSxoYXNoQWRkTm9kZTpub2RlPT57dmFyIGhhc2g9RlMuaGFzaE5hbWUobm9kZS5wYXJlbnQuaWQsbm9kZS5uYW1lKTtub2RlLm5hbWVfbmV4dD1GUy5uYW1lVGFibGVbaGFzaF07RlMubmFtZVRhYmxlW2hhc2hdPW5vZGV9LGhhc2hSZW1vdmVOb2RlOm5vZGU9Pnt2YXIgaGFzaD1GUy5oYXNoTmFtZShub2RlLnBhcmVudC5pZCxub2RlLm5hbWUpO2lmKEZTLm5hbWVUYWJsZVtoYXNoXT09PW5vZGUpe0ZTLm5hbWVUYWJsZVtoYXNoXT1ub2RlLm5hbWVfbmV4dH1lbHNle3ZhciBjdXJyZW50PUZTLm5hbWVUYWJsZVtoYXNoXTt3aGlsZShjdXJyZW50KXtpZihjdXJyZW50Lm5hbWVfbmV4dD09PW5vZGUpe2N1cnJlbnQubmFtZV9uZXh0PW5vZGUubmFtZV9uZXh0O2JyZWFrfWN1cnJlbnQ9Y3VycmVudC5uYW1lX25leHR9fX0sbG9va3VwTm9kZToocGFyZW50LG5hbWUpPT57dmFyIGVyckNvZGU9RlMubWF5TG9va3VwKHBhcmVudCk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSxwYXJlbnQpfXZhciBoYXNoPUZTLmhhc2hOYW1lKHBhcmVudC5pZCxuYW1lKTtmb3IodmFyIG5vZGU9RlMubmFtZVRhYmxlW2hhc2hdO25vZGU7bm9kZT1ub2RlLm5hbWVfbmV4dCl7dmFyIG5vZGVOYW1lPW5vZGUubmFtZTtpZihub2RlLnBhcmVudC5pZD09PXBhcmVudC5pZCYmbm9kZU5hbWU9PT1uYW1lKXtyZXR1cm4gbm9kZX19cmV0dXJuIEZTLmxvb2t1cChwYXJlbnQsbmFtZSl9LGNyZWF0ZU5vZGU6KHBhcmVudCxuYW1lLG1vZGUscmRldik9Pnt2YXIgbm9kZT1uZXcgRlMuRlNOb2RlKHBhcmVudCxuYW1lLG1vZGUscmRldik7RlMuaGFzaEFkZE5vZGUobm9kZSk7cmV0dXJuIG5vZGV9LGRlc3Ryb3lOb2RlOm5vZGU9PntGUy5oYXNoUmVtb3ZlTm9kZShub2RlKX0saXNSb290Om5vZGU9PntyZXR1cm4gbm9kZT09PW5vZGUucGFyZW50fSxpc01vdW50cG9pbnQ6bm9kZT0+e3JldHVybiEhbm9kZS5tb3VudGVkfSxpc0ZpbGU6bW9kZT0+e3JldHVybihtb2RlJjYxNDQwKT09PTMyNzY4fSxpc0Rpcjptb2RlPT57cmV0dXJuKG1vZGUmNjE0NDApPT09MTYzODR9LGlzTGluazptb2RlPT57cmV0dXJuKG1vZGUmNjE0NDApPT09NDA5NjB9LGlzQ2hyZGV2Om1vZGU9PntyZXR1cm4obW9kZSY2MTQ0MCk9PT04MTkyfSxpc0Jsa2Rldjptb2RlPT57cmV0dXJuKG1vZGUmNjE0NDApPT09MjQ1NzZ9LGlzRklGTzptb2RlPT57cmV0dXJuKG1vZGUmNjE0NDApPT09NDA5Nn0saXNTb2NrZXQ6bW9kZT0+e3JldHVybihtb2RlJjQ5MTUyKT09PTQ5MTUyfSxmbGFnTW9kZXM6eyJyIjowLCJyKyI6MiwidyI6NTc3LCJ3KyI6NTc4LCJhIjoxMDg5LCJhKyI6MTA5MH0sbW9kZVN0cmluZ1RvRmxhZ3M6c3RyPT57dmFyIGZsYWdzPUZTLmZsYWdNb2Rlc1tzdHJdO2lmKHR5cGVvZiBmbGFncz09InVuZGVmaW5lZCIpe3Rocm93IG5ldyBFcnJvcigiVW5rbm93biBmaWxlIG9wZW4gbW9kZTogIitzdHIpfXJldHVybiBmbGFnc30sZmxhZ3NUb1Blcm1pc3Npb25TdHJpbmc6ZmxhZz0+e3ZhciBwZXJtcz1bInIiLCJ3IiwicnciXVtmbGFnJjNdO2lmKGZsYWcmNTEyKXtwZXJtcys9IncifXJldHVybiBwZXJtc30sbm9kZVBlcm1pc3Npb25zOihub2RlLHBlcm1zKT0+e2lmKEZTLmlnbm9yZVBlcm1pc3Npb25zKXtyZXR1cm4gMH1pZihwZXJtcy5pbmNsdWRlcygiciIpJiYhKG5vZGUubW9kZSYyOTIpKXtyZXR1cm4gMn1lbHNlIGlmKHBlcm1zLmluY2x1ZGVzKCJ3IikmJiEobm9kZS5tb2RlJjE0Nikpe3JldHVybiAyfWVsc2UgaWYocGVybXMuaW5jbHVkZXMoIngiKSYmIShub2RlLm1vZGUmNzMpKXtyZXR1cm4gMn1yZXR1cm4gMH0sbWF5TG9va3VwOmRpcj0+e3ZhciBlcnJDb2RlPUZTLm5vZGVQZXJtaXNzaW9ucyhkaXIsIngiKTtpZihlcnJDb2RlKXJldHVybiBlcnJDb2RlO2lmKCFkaXIubm9kZV9vcHMubG9va3VwKXJldHVybiAyO3JldHVybiAwfSxtYXlDcmVhdGU6KGRpcixuYW1lKT0+e3RyeXt2YXIgbm9kZT1GUy5sb29rdXBOb2RlKGRpcixuYW1lKTtyZXR1cm4gMjB9Y2F0Y2goZSl7fXJldHVybiBGUy5ub2RlUGVybWlzc2lvbnMoZGlyLCJ3eCIpfSxtYXlEZWxldGU6KGRpcixuYW1lLGlzZGlyKT0+e3ZhciBub2RlO3RyeXtub2RlPUZTLmxvb2t1cE5vZGUoZGlyLG5hbWUpfWNhdGNoKGUpe3JldHVybiBlLmVycm5vfXZhciBlcnJDb2RlPUZTLm5vZGVQZXJtaXNzaW9ucyhkaXIsInd4Iik7aWYoZXJyQ29kZSl7cmV0dXJuIGVyckNvZGV9aWYoaXNkaXIpe2lmKCFGUy5pc0Rpcihub2RlLm1vZGUpKXtyZXR1cm4gNTR9aWYoRlMuaXNSb290KG5vZGUpfHxGUy5nZXRQYXRoKG5vZGUpPT09RlMuY3dkKCkpe3JldHVybiAxMH19ZWxzZXtpZihGUy5pc0Rpcihub2RlLm1vZGUpKXtyZXR1cm4gMzF9fXJldHVybiAwfSxtYXlPcGVuOihub2RlLGZsYWdzKT0+e2lmKCFub2RlKXtyZXR1cm4gNDR9aWYoRlMuaXNMaW5rKG5vZGUubW9kZSkpe3JldHVybiAzMn1lbHNlIGlmKEZTLmlzRGlyKG5vZGUubW9kZSkpe2lmKEZTLmZsYWdzVG9QZXJtaXNzaW9uU3RyaW5nKGZsYWdzKSE9PSJyInx8ZmxhZ3MmNTEyKXtyZXR1cm4gMzF9fXJldHVybiBGUy5ub2RlUGVybWlzc2lvbnMobm9kZSxGUy5mbGFnc1RvUGVybWlzc2lvblN0cmluZyhmbGFncykpfSxNQVhfT1BFTl9GRFM6NDA5NixuZXh0ZmQ6KGZkX3N0YXJ0PTAsZmRfZW5kPUZTLk1BWF9PUEVOX0ZEUyk9Pntmb3IodmFyIGZkPWZkX3N0YXJ0O2ZkPD1mZF9lbmQ7ZmQrKyl7aWYoIUZTLnN0cmVhbXNbZmRdKXtyZXR1cm4gZmR9fXRocm93IG5ldyBGUy5FcnJub0Vycm9yKDMzKX0sZ2V0U3RyZWFtOmZkPT5GUy5zdHJlYW1zW2ZkXSxjcmVhdGVTdHJlYW06KHN0cmVhbSxmZF9zdGFydCxmZF9lbmQpPT57aWYoIUZTLkZTU3RyZWFtKXtGUy5GU1N0cmVhbT1mdW5jdGlvbigpe3RoaXMuc2hhcmVkPXt9fTtGUy5GU1N0cmVhbS5wcm90b3R5cGU9e29iamVjdDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubm9kZX0sc2V0OmZ1bmN0aW9uKHZhbCl7dGhpcy5ub2RlPXZhbH19LGlzUmVhZDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMuZmxhZ3MmMjA5NzE1NSkhPT0xfX0saXNXcml0ZTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMuZmxhZ3MmMjA5NzE1NSkhPT0wfX0saXNBcHBlbmQ6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmZsYWdzJjEwMjR9fSxmbGFnczp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2hhcmVkLmZsYWdzfSxzZXQ6ZnVuY3Rpb24odmFsKXt0aGlzLnNoYXJlZC5mbGFncz12YWx9fSxwb3NpdGlvbjp7Z2V0IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2hhcmVkLnBvc2l0aW9ufSxzZXQ6ZnVuY3Rpb24odmFsKXt0aGlzLnNoYXJlZC5wb3NpdGlvbj12YWx9fX19c3RyZWFtPU9iamVjdC5hc3NpZ24obmV3IEZTLkZTU3RyZWFtLHN0cmVhbSk7dmFyIGZkPUZTLm5leHRmZChmZF9zdGFydCxmZF9lbmQpO3N0cmVhbS5mZD1mZDtGUy5zdHJlYW1zW2ZkXT1zdHJlYW07cmV0dXJuIHN0cmVhbX0sY2xvc2VTdHJlYW06ZmQ9PntGUy5zdHJlYW1zW2ZkXT1udWxsfSxjaHJkZXZfc3RyZWFtX29wczp7b3BlbjpzdHJlYW09Pnt2YXIgZGV2aWNlPUZTLmdldERldmljZShzdHJlYW0ubm9kZS5yZGV2KTtzdHJlYW0uc3RyZWFtX29wcz1kZXZpY2Uuc3RyZWFtX29wcztpZihzdHJlYW0uc3RyZWFtX29wcy5vcGVuKXtzdHJlYW0uc3RyZWFtX29wcy5vcGVuKHN0cmVhbSl9fSxsbHNlZWs6KCk9Pnt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig3MCl9fSxtYWpvcjpkZXY9PmRldj4+OCxtaW5vcjpkZXY9PmRldiYyNTUsbWFrZWRldjoobWEsbWkpPT5tYTw8OHxtaSxyZWdpc3RlckRldmljZTooZGV2LG9wcyk9PntGUy5kZXZpY2VzW2Rldl09e3N0cmVhbV9vcHM6b3BzfX0sZ2V0RGV2aWNlOmRldj0+RlMuZGV2aWNlc1tkZXZdLGdldE1vdW50czptb3VudD0+e3ZhciBtb3VudHM9W107dmFyIGNoZWNrPVttb3VudF07d2hpbGUoY2hlY2subGVuZ3RoKXt2YXIgbT1jaGVjay5wb3AoKTttb3VudHMucHVzaChtKTtjaGVjay5wdXNoLmFwcGx5KGNoZWNrLG0ubW91bnRzKX1yZXR1cm4gbW91bnRzfSxzeW5jZnM6KHBvcHVsYXRlLGNhbGxiYWNrKT0+e2lmKHR5cGVvZiBwb3B1bGF0ZT09ImZ1bmN0aW9uIil7Y2FsbGJhY2s9cG9wdWxhdGU7cG9wdWxhdGU9ZmFsc2V9RlMuc3luY0ZTUmVxdWVzdHMrKztpZihGUy5zeW5jRlNSZXF1ZXN0cz4xKXtlcnIoIndhcm5pbmc6ICIrRlMuc3luY0ZTUmVxdWVzdHMrIiBGUy5zeW5jZnMgb3BlcmF0aW9ucyBpbiBmbGlnaHQgYXQgb25jZSwgcHJvYmFibHkganVzdCBkb2luZyBleHRyYSB3b3JrIil9dmFyIG1vdW50cz1GUy5nZXRNb3VudHMoRlMucm9vdC5tb3VudCk7dmFyIGNvbXBsZXRlZD0wO2Z1bmN0aW9uIGRvQ2FsbGJhY2soZXJyQ29kZSl7RlMuc3luY0ZTUmVxdWVzdHMtLTtyZXR1cm4gY2FsbGJhY2soZXJyQ29kZSl9ZnVuY3Rpb24gZG9uZShlcnJDb2RlKXtpZihlcnJDb2RlKXtpZighZG9uZS5lcnJvcmVkKXtkb25lLmVycm9yZWQ9dHJ1ZTtyZXR1cm4gZG9DYWxsYmFjayhlcnJDb2RlKX1yZXR1cm59aWYoKytjb21wbGV0ZWQ+PW1vdW50cy5sZW5ndGgpe2RvQ2FsbGJhY2sobnVsbCl9fW1vdW50cy5mb3JFYWNoKG1vdW50PT57aWYoIW1vdW50LnR5cGUuc3luY2ZzKXtyZXR1cm4gZG9uZShudWxsKX1tb3VudC50eXBlLnN5bmNmcyhtb3VudCxwb3B1bGF0ZSxkb25lKX0pfSxtb3VudDoodHlwZSxvcHRzLG1vdW50cG9pbnQpPT57dmFyIHJvb3Q9bW91bnRwb2ludD09PSIvIjt2YXIgcHNldWRvPSFtb3VudHBvaW50O3ZhciBub2RlO2lmKHJvb3QmJkZTLnJvb3Qpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDEwKX1lbHNlIGlmKCFyb290JiYhcHNldWRvKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgobW91bnRwb2ludCx7Zm9sbG93X21vdW50OmZhbHNlfSk7bW91bnRwb2ludD1sb29rdXAucGF0aDtub2RlPWxvb2t1cC5ub2RlO2lmKEZTLmlzTW91bnRwb2ludChub2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTApfWlmKCFGUy5pc0Rpcihub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NCl9fXZhciBtb3VudD17dHlwZTp0eXBlLG9wdHM6b3B0cyxtb3VudHBvaW50Om1vdW50cG9pbnQsbW91bnRzOltdfTt2YXIgbW91bnRSb290PXR5cGUubW91bnQobW91bnQpO21vdW50Um9vdC5tb3VudD1tb3VudDttb3VudC5yb290PW1vdW50Um9vdDtpZihyb290KXtGUy5yb290PW1vdW50Um9vdH1lbHNlIGlmKG5vZGUpe25vZGUubW91bnRlZD1tb3VudDtpZihub2RlLm1vdW50KXtub2RlLm1vdW50Lm1vdW50cy5wdXNoKG1vdW50KX19cmV0dXJuIG1vdW50Um9vdH0sdW5tb3VudDptb3VudHBvaW50PT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKG1vdW50cG9pbnQse2ZvbGxvd19tb3VudDpmYWxzZX0pO2lmKCFGUy5pc01vdW50cG9pbnQobG9va3VwLm5vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9dmFyIG5vZGU9bG9va3VwLm5vZGU7dmFyIG1vdW50PW5vZGUubW91bnRlZDt2YXIgbW91bnRzPUZTLmdldE1vdW50cyhtb3VudCk7T2JqZWN0LmtleXMoRlMubmFtZVRhYmxlKS5mb3JFYWNoKGhhc2g9Pnt2YXIgY3VycmVudD1GUy5uYW1lVGFibGVbaGFzaF07d2hpbGUoY3VycmVudCl7dmFyIG5leHQ9Y3VycmVudC5uYW1lX25leHQ7aWYobW91bnRzLmluY2x1ZGVzKGN1cnJlbnQubW91bnQpKXtGUy5kZXN0cm95Tm9kZShjdXJyZW50KX1jdXJyZW50PW5leHR9fSk7bm9kZS5tb3VudGVkPW51bGw7dmFyIGlkeD1ub2RlLm1vdW50Lm1vdW50cy5pbmRleE9mKG1vdW50KTtub2RlLm1vdW50Lm1vdW50cy5zcGxpY2UoaWR4LDEpfSxsb29rdXA6KHBhcmVudCxuYW1lKT0+e3JldHVybiBwYXJlbnQubm9kZV9vcHMubG9va3VwKHBhcmVudCxuYW1lKX0sbWtub2Q6KHBhdGgsbW9kZSxkZXYpPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTt2YXIgbmFtZT1QQVRILmJhc2VuYW1lKHBhdGgpO2lmKCFuYW1lfHxuYW1lPT09Ii4ifHxuYW1lPT09Ii4uIil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXZhciBlcnJDb2RlPUZTLm1heUNyZWF0ZShwYXJlbnQsbmFtZSk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9aWYoIXBhcmVudC5ub2RlX29wcy5ta25vZCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfXJldHVybiBwYXJlbnQubm9kZV9vcHMubWtub2QocGFyZW50LG5hbWUsbW9kZSxkZXYpfSxjcmVhdGU6KHBhdGgsbW9kZSk9Pnttb2RlPW1vZGUhPT11bmRlZmluZWQ/bW9kZTo0Mzg7bW9kZSY9NDA5NTttb2RlfD0zMjc2ODtyZXR1cm4gRlMubWtub2QocGF0aCxtb2RlLDApfSxta2RpcjoocGF0aCxtb2RlKT0+e21vZGU9bW9kZSE9PXVuZGVmaW5lZD9tb2RlOjUxMTttb2RlJj01MTF8NTEyO21vZGV8PTE2Mzg0O3JldHVybiBGUy5ta25vZChwYXRoLG1vZGUsMCl9LG1rZGlyVHJlZToocGF0aCxtb2RlKT0+e3ZhciBkaXJzPXBhdGguc3BsaXQoIi8iKTt2YXIgZD0iIjtmb3IodmFyIGk9MDtpPGRpcnMubGVuZ3RoOysraSl7aWYoIWRpcnNbaV0pY29udGludWU7ZCs9Ii8iK2RpcnNbaV07dHJ5e0ZTLm1rZGlyKGQsbW9kZSl9Y2F0Y2goZSl7aWYoZS5lcnJubyE9MjApdGhyb3cgZX19fSxta2RldjoocGF0aCxtb2RlLGRldik9PntpZih0eXBlb2YgZGV2PT0idW5kZWZpbmVkIil7ZGV2PW1vZGU7bW9kZT00Mzh9bW9kZXw9ODE5MjtyZXR1cm4gRlMubWtub2QocGF0aCxtb2RlLGRldil9LHN5bWxpbms6KG9sZHBhdGgsbmV3cGF0aCk9PntpZighUEFUSF9GUy5yZXNvbHZlKG9sZHBhdGgpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKG5ld3BhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTtpZighcGFyZW50KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9dmFyIG5ld25hbWU9UEFUSC5iYXNlbmFtZShuZXdwYXRoKTt2YXIgZXJyQ29kZT1GUy5tYXlDcmVhdGUocGFyZW50LG5ld25hbWUpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfWlmKCFwYXJlbnQubm9kZV9vcHMuc3ltbGluayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfXJldHVybiBwYXJlbnQubm9kZV9vcHMuc3ltbGluayhwYXJlbnQsbmV3bmFtZSxvbGRwYXRoKX0scmVuYW1lOihvbGRfcGF0aCxuZXdfcGF0aCk9Pnt2YXIgb2xkX2Rpcm5hbWU9UEFUSC5kaXJuYW1lKG9sZF9wYXRoKTt2YXIgbmV3X2Rpcm5hbWU9UEFUSC5kaXJuYW1lKG5ld19wYXRoKTt2YXIgb2xkX25hbWU9UEFUSC5iYXNlbmFtZShvbGRfcGF0aCk7dmFyIG5ld19uYW1lPVBBVEguYmFzZW5hbWUobmV3X3BhdGgpO3ZhciBsb29rdXAsb2xkX2RpcixuZXdfZGlyO2xvb2t1cD1GUy5sb29rdXBQYXRoKG9sZF9wYXRoLHtwYXJlbnQ6dHJ1ZX0pO29sZF9kaXI9bG9va3VwLm5vZGU7bG9va3VwPUZTLmxvb2t1cFBhdGgobmV3X3BhdGgse3BhcmVudDp0cnVlfSk7bmV3X2Rpcj1sb29rdXAubm9kZTtpZighb2xkX2Rpcnx8IW5ld19kaXIpdGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpO2lmKG9sZF9kaXIubW91bnQhPT1uZXdfZGlyLm1vdW50KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig3NSl9dmFyIG9sZF9ub2RlPUZTLmxvb2t1cE5vZGUob2xkX2RpcixvbGRfbmFtZSk7dmFyIHJlbGF0aXZlPVBBVEhfRlMucmVsYXRpdmUob2xkX3BhdGgsbmV3X2Rpcm5hbWUpO2lmKHJlbGF0aXZlLmNoYXJBdCgwKSE9PSIuIil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXJlbGF0aXZlPVBBVEhfRlMucmVsYXRpdmUobmV3X3BhdGgsb2xkX2Rpcm5hbWUpO2lmKHJlbGF0aXZlLmNoYXJBdCgwKSE9PSIuIil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTUpfXZhciBuZXdfbm9kZTt0cnl7bmV3X25vZGU9RlMubG9va3VwTm9kZShuZXdfZGlyLG5ld19uYW1lKX1jYXRjaChlKXt9aWYob2xkX25vZGU9PT1uZXdfbm9kZSl7cmV0dXJufXZhciBpc2Rpcj1GUy5pc0RpcihvbGRfbm9kZS5tb2RlKTt2YXIgZXJyQ29kZT1GUy5tYXlEZWxldGUob2xkX2RpcixvbGRfbmFtZSxpc2Rpcik7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9ZXJyQ29kZT1uZXdfbm9kZT9GUy5tYXlEZWxldGUobmV3X2RpcixuZXdfbmFtZSxpc2Rpcik6RlMubWF5Q3JlYXRlKG5ld19kaXIsbmV3X25hbWUpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfWlmKCFvbGRfZGlyLm5vZGVfb3BzLnJlbmFtZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKEZTLmlzTW91bnRwb2ludChvbGRfbm9kZSl8fG5ld19ub2RlJiZGUy5pc01vdW50cG9pbnQobmV3X25vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9aWYobmV3X2RpciE9PW9sZF9kaXIpe2VyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKG9sZF9kaXIsInciKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX19RlMuaGFzaFJlbW92ZU5vZGUob2xkX25vZGUpO3RyeXtvbGRfZGlyLm5vZGVfb3BzLnJlbmFtZShvbGRfbm9kZSxuZXdfZGlyLG5ld19uYW1lKX1jYXRjaChlKXt0aHJvdyBlfWZpbmFsbHl7RlMuaGFzaEFkZE5vZGUob2xkX25vZGUpfX0scm1kaXI6cGF0aD0+e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtwYXJlbnQ6dHJ1ZX0pO3ZhciBwYXJlbnQ9bG9va3VwLm5vZGU7dmFyIG5hbWU9UEFUSC5iYXNlbmFtZShwYXRoKTt2YXIgbm9kZT1GUy5sb29rdXBOb2RlKHBhcmVudCxuYW1lKTt2YXIgZXJyQ29kZT1GUy5tYXlEZWxldGUocGFyZW50LG5hbWUsdHJ1ZSk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9aWYoIXBhcmVudC5ub2RlX29wcy5ybWRpcil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKEZTLmlzTW91bnRwb2ludChub2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTApfXBhcmVudC5ub2RlX29wcy5ybWRpcihwYXJlbnQsbmFtZSk7RlMuZGVzdHJveU5vZGUobm9kZSl9LHJlYWRkaXI6cGF0aD0+e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6dHJ1ZX0pO3ZhciBub2RlPWxvb2t1cC5ub2RlO2lmKCFub2RlLm5vZGVfb3BzLnJlYWRkaXIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU0KX1yZXR1cm4gbm9kZS5ub2RlX29wcy5yZWFkZGlyKG5vZGUpfSx1bmxpbms6cGF0aD0+e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtwYXJlbnQ6dHJ1ZX0pO3ZhciBwYXJlbnQ9bG9va3VwLm5vZGU7aWYoIXBhcmVudCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfXZhciBuYW1lPVBBVEguYmFzZW5hbWUocGF0aCk7dmFyIG5vZGU9RlMubG9va3VwTm9kZShwYXJlbnQsbmFtZSk7dmFyIGVyckNvZGU9RlMubWF5RGVsZXRlKHBhcmVudCxuYW1lLGZhbHNlKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1pZighcGFyZW50Lm5vZGVfb3BzLnVubGluayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKEZTLmlzTW91bnRwb2ludChub2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTApfXBhcmVudC5ub2RlX29wcy51bmxpbmsocGFyZW50LG5hbWUpO0ZTLmRlc3Ryb3lOb2RlKG5vZGUpfSxyZWFkbGluazpwYXRoPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgpO3ZhciBsaW5rPWxvb2t1cC5ub2RlO2lmKCFsaW5rKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9aWYoIWxpbmsubm9kZV9vcHMucmVhZGxpbmspe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1yZXR1cm4gUEFUSF9GUy5yZXNvbHZlKEZTLmdldFBhdGgobGluay5wYXJlbnQpLGxpbmsubm9kZV9vcHMucmVhZGxpbmsobGluaykpfSxzdGF0OihwYXRoLGRvbnRGb2xsb3cpPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udEZvbGxvd30pO3ZhciBub2RlPWxvb2t1cC5ub2RlO2lmKCFub2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9aWYoIW5vZGUubm9kZV9vcHMuZ2V0YXR0cil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfXJldHVybiBub2RlLm5vZGVfb3BzLmdldGF0dHIobm9kZSl9LGxzdGF0OnBhdGg9PntyZXR1cm4gRlMuc3RhdChwYXRoLHRydWUpfSxjaG1vZDoocGF0aCxtb2RlLGRvbnRGb2xsb3cpPT57dmFyIG5vZGU7aWYodHlwZW9mIHBhdGg9PSJzdHJpbmciKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250Rm9sbG93fSk7bm9kZT1sb29rdXAubm9kZX1lbHNle25vZGU9cGF0aH1pZighbm9kZS5ub2RlX29wcy5zZXRhdHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9bm9kZS5ub2RlX29wcy5zZXRhdHRyKG5vZGUse21vZGU6bW9kZSY0MDk1fG5vZGUubW9kZSZ+NDA5NSx0aW1lc3RhbXA6RGF0ZS5ub3coKX0pfSxsY2htb2Q6KHBhdGgsbW9kZSk9PntGUy5jaG1vZChwYXRoLG1vZGUsdHJ1ZSl9LGZjaG1vZDooZmQsbW9kZSk9Pnt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbShmZCk7aWYoIXN0cmVhbSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9RlMuY2htb2Qoc3RyZWFtLm5vZGUsbW9kZSl9LGNob3duOihwYXRoLHVpZCxnaWQsZG9udEZvbGxvdyk9Pnt2YXIgbm9kZTtpZih0eXBlb2YgcGF0aD09InN0cmluZyIpe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6IWRvbnRGb2xsb3d9KTtub2RlPWxvb2t1cC5ub2RlfWVsc2V7bm9kZT1wYXRofWlmKCFub2RlLm5vZGVfb3BzLnNldGF0dHIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYzKX1ub2RlLm5vZGVfb3BzLnNldGF0dHIobm9kZSx7dGltZXN0YW1wOkRhdGUubm93KCl9KX0sbGNob3duOihwYXRoLHVpZCxnaWQpPT57RlMuY2hvd24ocGF0aCx1aWQsZ2lkLHRydWUpfSxmY2hvd246KGZkLHVpZCxnaWQpPT57dmFyIHN0cmVhbT1GUy5nZXRTdHJlYW0oZmQpO2lmKCFzdHJlYW0pe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfUZTLmNob3duKHN0cmVhbS5ub2RlLHVpZCxnaWQpfSx0cnVuY2F0ZToocGF0aCxsZW4pPT57aWYobGVuPDApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgbm9kZTtpZih0eXBlb2YgcGF0aD09InN0cmluZyIpe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6dHJ1ZX0pO25vZGU9bG9va3VwLm5vZGV9ZWxzZXtub2RlPXBhdGh9aWYoIW5vZGUubm9kZV9vcHMuc2V0YXR0cil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKEZTLmlzRGlyKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDMxKX1pZighRlMuaXNGaWxlKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgZXJyQ29kZT1GUy5ub2RlUGVybWlzc2lvbnMobm9kZSwidyIpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfW5vZGUubm9kZV9vcHMuc2V0YXR0cihub2RlLHtzaXplOmxlbix0aW1lc3RhbXA6RGF0ZS5ub3coKX0pfSxmdHJ1bmNhdGU6KGZkLGxlbik9Pnt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbShmZCk7aWYoIXN0cmVhbSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1GUy50cnVuY2F0ZShzdHJlYW0ubm9kZSxsZW4pfSx1dGltZToocGF0aCxhdGltZSxtdGltZSk9Pnt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OnRydWV9KTt2YXIgbm9kZT1sb29rdXAubm9kZTtub2RlLm5vZGVfb3BzLnNldGF0dHIobm9kZSx7dGltZXN0YW1wOk1hdGgubWF4KGF0aW1lLG10aW1lKX0pfSxvcGVuOihwYXRoLGZsYWdzLG1vZGUpPT57aWYocGF0aD09PSIiKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9ZmxhZ3M9dHlwZW9mIGZsYWdzPT0ic3RyaW5nIj9GUy5tb2RlU3RyaW5nVG9GbGFncyhmbGFncyk6ZmxhZ3M7bW9kZT10eXBlb2YgbW9kZT09InVuZGVmaW5lZCI/NDM4Om1vZGU7aWYoZmxhZ3MmNjQpe21vZGU9bW9kZSY0MDk1fDMyNzY4fWVsc2V7bW9kZT0wfXZhciBub2RlO2lmKHR5cGVvZiBwYXRoPT0ib2JqZWN0Iil7bm9kZT1wYXRofWVsc2V7cGF0aD1QQVRILm5vcm1hbGl6ZShwYXRoKTt0cnl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohKGZsYWdzJjEzMTA3Mil9KTtub2RlPWxvb2t1cC5ub2RlfWNhdGNoKGUpe319dmFyIGNyZWF0ZWQ9ZmFsc2U7aWYoZmxhZ3MmNjQpe2lmKG5vZGUpe2lmKGZsYWdzJjEyOCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjApfX1lbHNle25vZGU9RlMubWtub2QocGF0aCxtb2RlLDApO2NyZWF0ZWQ9dHJ1ZX19aWYoIW5vZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1pZihGUy5pc0NocmRldihub2RlLm1vZGUpKXtmbGFncyY9fjUxMn1pZihmbGFncyY2NTUzNiYmIUZTLmlzRGlyKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU0KX1pZighY3JlYXRlZCl7dmFyIGVyckNvZGU9RlMubWF5T3Blbihub2RlLGZsYWdzKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX19aWYoZmxhZ3MmNTEyJiYhY3JlYXRlZCl7RlMudHJ1bmNhdGUobm9kZSwwKX1mbGFncyY9figxMjh8NTEyfDEzMTA3Mik7dmFyIHN0cmVhbT1GUy5jcmVhdGVTdHJlYW0oe25vZGU6bm9kZSxwYXRoOkZTLmdldFBhdGgobm9kZSksZmxhZ3M6ZmxhZ3Msc2Vla2FibGU6dHJ1ZSxwb3NpdGlvbjowLHN0cmVhbV9vcHM6bm9kZS5zdHJlYW1fb3BzLHVuZ290dGVuOltdLGVycm9yOmZhbHNlfSk7aWYoc3RyZWFtLnN0cmVhbV9vcHMub3Blbil7c3RyZWFtLnN0cmVhbV9vcHMub3BlbihzdHJlYW0pfWlmKE1vZHVsZVsibG9nUmVhZEZpbGVzIl0mJiEoZmxhZ3MmMSkpe2lmKCFGUy5yZWFkRmlsZXMpRlMucmVhZEZpbGVzPXt9O2lmKCEocGF0aCBpbiBGUy5yZWFkRmlsZXMpKXtGUy5yZWFkRmlsZXNbcGF0aF09MX19cmV0dXJuIHN0cmVhbX0sY2xvc2U6c3RyZWFtPT57aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoc3RyZWFtLmdldGRlbnRzKXN0cmVhbS5nZXRkZW50cz1udWxsO3RyeXtpZihzdHJlYW0uc3RyZWFtX29wcy5jbG9zZSl7c3RyZWFtLnN0cmVhbV9vcHMuY2xvc2Uoc3RyZWFtKX19Y2F0Y2goZSl7dGhyb3cgZX1maW5hbGx5e0ZTLmNsb3NlU3RyZWFtKHN0cmVhbS5mZCl9c3RyZWFtLmZkPW51bGx9LGlzQ2xvc2VkOnN0cmVhbT0+e3JldHVybiBzdHJlYW0uZmQ9PT1udWxsfSxsbHNlZWs6KHN0cmVhbSxvZmZzZXQsd2hlbmNlKT0+e2lmKEZTLmlzQ2xvc2VkKHN0cmVhbSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKCFzdHJlYW0uc2Vla2FibGV8fCFzdHJlYW0uc3RyZWFtX29wcy5sbHNlZWspe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDcwKX1pZih3aGVuY2UhPTAmJndoZW5jZSE9MSYmd2hlbmNlIT0yKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9c3RyZWFtLnBvc2l0aW9uPXN0cmVhbS5zdHJlYW1fb3BzLmxsc2VlayhzdHJlYW0sb2Zmc2V0LHdoZW5jZSk7c3RyZWFtLnVuZ290dGVuPVtdO3JldHVybiBzdHJlYW0ucG9zaXRpb259LHJlYWQ6KHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbik9PntpZihsZW5ndGg8MHx8cG9zaXRpb248MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfWlmKEZTLmlzQ2xvc2VkKHN0cmVhbSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKChzdHJlYW0uZmxhZ3MmMjA5NzE1NSk9PT0xKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZihGUy5pc0RpcihzdHJlYW0ubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzEpfWlmKCFzdHJlYW0uc3RyZWFtX29wcy5yZWFkKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9dmFyIHNlZWtpbmc9dHlwZW9mIHBvc2l0aW9uIT0idW5kZWZpbmVkIjtpZighc2Vla2luZyl7cG9zaXRpb249c3RyZWFtLnBvc2l0aW9ufWVsc2UgaWYoIXN0cmVhbS5zZWVrYWJsZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNzApfXZhciBieXRlc1JlYWQ9c3RyZWFtLnN0cmVhbV9vcHMucmVhZChzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24pO2lmKCFzZWVraW5nKXN0cmVhbS5wb3NpdGlvbis9Ynl0ZXNSZWFkO3JldHVybiBieXRlc1JlYWR9LHdyaXRlOihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24sY2FuT3duKT0+e2lmKGxlbmd0aDwwfHxwb3NpdGlvbjwwKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKEZTLmlzRGlyKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigzMSl9aWYoIXN0cmVhbS5zdHJlYW1fb3BzLndyaXRlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9aWYoc3RyZWFtLnNlZWthYmxlJiZzdHJlYW0uZmxhZ3MmMTAyNCl7RlMubGxzZWVrKHN0cmVhbSwwLDIpfXZhciBzZWVraW5nPXR5cGVvZiBwb3NpdGlvbiE9InVuZGVmaW5lZCI7aWYoIXNlZWtpbmcpe3Bvc2l0aW9uPXN0cmVhbS5wb3NpdGlvbn1lbHNlIGlmKCFzdHJlYW0uc2Vla2FibGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDcwKX12YXIgYnl0ZXNXcml0dGVuPXN0cmVhbS5zdHJlYW1fb3BzLndyaXRlKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbixjYW5Pd24pO2lmKCFzZWVraW5nKXN0cmVhbS5wb3NpdGlvbis9Ynl0ZXNXcml0dGVuO3JldHVybiBieXRlc1dyaXR0ZW59LGFsbG9jYXRlOihzdHJlYW0sb2Zmc2V0LGxlbmd0aCk9PntpZihGUy5pc0Nsb3NlZChzdHJlYW0pKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZihvZmZzZXQ8MHx8bGVuZ3RoPD0wKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKCFGUy5pc0ZpbGUoc3RyZWFtLm5vZGUubW9kZSkmJiFGUy5pc0RpcihzdHJlYW0ubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfWlmKCFzdHJlYW0uc3RyZWFtX29wcy5hbGxvY2F0ZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTM4KX1zdHJlYW0uc3RyZWFtX29wcy5hbGxvY2F0ZShzdHJlYW0sb2Zmc2V0LGxlbmd0aCl9LG1tYXA6KHN0cmVhbSxhZGRyZXNzLGxlbmd0aCxwb3NpdGlvbixwcm90LGZsYWdzKT0+e2lmKChwcm90JjIpIT09MCYmKGZsYWdzJjIpPT09MCYmKHN0cmVhbS5mbGFncyYyMDk3MTU1KSE9PTIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDIpfWlmKChzdHJlYW0uZmxhZ3MmMjA5NzE1NSk9PT0xKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyKX1pZighc3RyZWFtLnN0cmVhbV9vcHMubW1hcCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfXJldHVybiBzdHJlYW0uc3RyZWFtX29wcy5tbWFwKHN0cmVhbSxhZGRyZXNzLGxlbmd0aCxwb3NpdGlvbixwcm90LGZsYWdzKX0sbXN5bmM6KHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxtbWFwRmxhZ3MpPT57aWYoIXN0cmVhbXx8IXN0cmVhbS5zdHJlYW1fb3BzLm1zeW5jKXtyZXR1cm4gMH1yZXR1cm4gc3RyZWFtLnN0cmVhbV9vcHMubXN5bmMoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLG1tYXBGbGFncyl9LG11bm1hcDpzdHJlYW09PjAsaW9jdGw6KHN0cmVhbSxjbWQsYXJnKT0+e2lmKCFzdHJlYW0uc3RyZWFtX29wcy5pb2N0bCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTkpfXJldHVybiBzdHJlYW0uc3RyZWFtX29wcy5pb2N0bChzdHJlYW0sY21kLGFyZyl9LHJlYWRGaWxlOihwYXRoLG9wdHM9e30pPT57b3B0cy5mbGFncz1vcHRzLmZsYWdzfHwwO29wdHMuZW5jb2Rpbmc9b3B0cy5lbmNvZGluZ3x8ImJpbmFyeSI7aWYob3B0cy5lbmNvZGluZyE9PSJ1dGY4IiYmb3B0cy5lbmNvZGluZyE9PSJiaW5hcnkiKXt0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZW5jb2RpbmcgdHlwZSAiJytvcHRzLmVuY29kaW5nKyciJyl9dmFyIHJldDt2YXIgc3RyZWFtPUZTLm9wZW4ocGF0aCxvcHRzLmZsYWdzKTt2YXIgc3RhdD1GUy5zdGF0KHBhdGgpO3ZhciBsZW5ndGg9c3RhdC5zaXplO3ZhciBidWY9bmV3IFVpbnQ4QXJyYXkobGVuZ3RoKTtGUy5yZWFkKHN0cmVhbSxidWYsMCxsZW5ndGgsMCk7aWYob3B0cy5lbmNvZGluZz09PSJ1dGY4Iil7cmV0PVVURjhBcnJheVRvU3RyaW5nKGJ1ZiwwKX1lbHNlIGlmKG9wdHMuZW5jb2Rpbmc9PT0iYmluYXJ5Iil7cmV0PWJ1Zn1GUy5jbG9zZShzdHJlYW0pO3JldHVybiByZXR9LHdyaXRlRmlsZToocGF0aCxkYXRhLG9wdHM9e30pPT57b3B0cy5mbGFncz1vcHRzLmZsYWdzfHw1Nzc7dmFyIHN0cmVhbT1GUy5vcGVuKHBhdGgsb3B0cy5mbGFncyxvcHRzLm1vZGUpO2lmKHR5cGVvZiBkYXRhPT0ic3RyaW5nIil7dmFyIGJ1Zj1uZXcgVWludDhBcnJheShsZW5ndGhCeXRlc1VURjgoZGF0YSkrMSk7dmFyIGFjdHVhbE51bUJ5dGVzPXN0cmluZ1RvVVRGOEFycmF5KGRhdGEsYnVmLDAsYnVmLmxlbmd0aCk7RlMud3JpdGUoc3RyZWFtLGJ1ZiwwLGFjdHVhbE51bUJ5dGVzLHVuZGVmaW5lZCxvcHRzLmNhbk93bil9ZWxzZSBpZihBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpe0ZTLndyaXRlKHN0cmVhbSxkYXRhLDAsZGF0YS5ieXRlTGVuZ3RoLHVuZGVmaW5lZCxvcHRzLmNhbk93bil9ZWxzZXt0aHJvdyBuZXcgRXJyb3IoIlVuc3VwcG9ydGVkIGRhdGEgdHlwZSIpfUZTLmNsb3NlKHN0cmVhbSl9LGN3ZDooKT0+RlMuY3VycmVudFBhdGgsY2hkaXI6cGF0aD0+e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6dHJ1ZX0pO2lmKGxvb2t1cC5ub2RlPT09bnVsbCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfWlmKCFGUy5pc0Rpcihsb29rdXAubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTQpfXZhciBlcnJDb2RlPUZTLm5vZGVQZXJtaXNzaW9ucyhsb29rdXAubm9kZSwieCIpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfUZTLmN1cnJlbnRQYXRoPWxvb2t1cC5wYXRofSxjcmVhdGVEZWZhdWx0RGlyZWN0b3JpZXM6KCk9PntGUy5ta2RpcigiL3RtcCIpO0ZTLm1rZGlyKCIvaG9tZSIpO0ZTLm1rZGlyKCIvaG9tZS93ZWJfdXNlciIpfSxjcmVhdGVEZWZhdWx0RGV2aWNlczooKT0+e0ZTLm1rZGlyKCIvZGV2Iik7RlMucmVnaXN0ZXJEZXZpY2UoRlMubWFrZWRldigxLDMpLHtyZWFkOigpPT4wLHdyaXRlOihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zKT0+bGVuZ3RofSk7RlMubWtkZXYoIi9kZXYvbnVsbCIsRlMubWFrZWRldigxLDMpKTtUVFkucmVnaXN0ZXIoRlMubWFrZWRldig1LDApLFRUWS5kZWZhdWx0X3R0eV9vcHMpO1RUWS5yZWdpc3RlcihGUy5tYWtlZGV2KDYsMCksVFRZLmRlZmF1bHRfdHR5MV9vcHMpO0ZTLm1rZGV2KCIvZGV2L3R0eSIsRlMubWFrZWRldig1LDApKTtGUy5ta2RldigiL2Rldi90dHkxIixGUy5tYWtlZGV2KDYsMCkpO3ZhciByYW5kb21fZGV2aWNlPWdldFJhbmRvbURldmljZSgpO0ZTLmNyZWF0ZURldmljZSgiL2RldiIsInJhbmRvbSIscmFuZG9tX2RldmljZSk7RlMuY3JlYXRlRGV2aWNlKCIvZGV2IiwidXJhbmRvbSIscmFuZG9tX2RldmljZSk7RlMubWtkaXIoIi9kZXYvc2htIik7RlMubWtkaXIoIi9kZXYvc2htL3RtcCIpfSxjcmVhdGVTcGVjaWFsRGlyZWN0b3JpZXM6KCk9PntGUy5ta2RpcigiL3Byb2MiKTt2YXIgcHJvY19zZWxmPUZTLm1rZGlyKCIvcHJvYy9zZWxmIik7RlMubWtkaXIoIi9wcm9jL3NlbGYvZmQiKTtGUy5tb3VudCh7bW91bnQ6KCk9Pnt2YXIgbm9kZT1GUy5jcmVhdGVOb2RlKHByb2Nfc2VsZiwiZmQiLDE2Mzg0fDUxMSw3Myk7bm9kZS5ub2RlX29wcz17bG9va3VwOihwYXJlbnQsbmFtZSk9Pnt2YXIgZmQ9K25hbWU7dmFyIHN0cmVhbT1GUy5nZXRTdHJlYW0oZmQpO2lmKCFzdHJlYW0pdGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCk7dmFyIHJldD17cGFyZW50Om51bGwsbW91bnQ6e21vdW50cG9pbnQ6ImZha2UifSxub2RlX29wczp7cmVhZGxpbms6KCk9PnN0cmVhbS5wYXRofX07cmV0LnBhcmVudD1yZXQ7cmV0dXJuIHJldH19O3JldHVybiBub2RlfX0se30sIi9wcm9jL3NlbGYvZmQiKX0sY3JlYXRlU3RhbmRhcmRTdHJlYW1zOigpPT57aWYoTW9kdWxlWyJzdGRpbiJdKXtGUy5jcmVhdGVEZXZpY2UoIi9kZXYiLCJzdGRpbiIsTW9kdWxlWyJzdGRpbiJdKX1lbHNle0ZTLnN5bWxpbmsoIi9kZXYvdHR5IiwiL2Rldi9zdGRpbiIpfWlmKE1vZHVsZVsic3Rkb3V0Il0pe0ZTLmNyZWF0ZURldmljZSgiL2RldiIsInN0ZG91dCIsbnVsbCxNb2R1bGVbInN0ZG91dCJdKX1lbHNle0ZTLnN5bWxpbmsoIi9kZXYvdHR5IiwiL2Rldi9zdGRvdXQiKX1pZihNb2R1bGVbInN0ZGVyciJdKXtGUy5jcmVhdGVEZXZpY2UoIi9kZXYiLCJzdGRlcnIiLG51bGwsTW9kdWxlWyJzdGRlcnIiXSl9ZWxzZXtGUy5zeW1saW5rKCIvZGV2L3R0eTEiLCIvZGV2L3N0ZGVyciIpfXZhciBzdGRpbj1GUy5vcGVuKCIvZGV2L3N0ZGluIiwwKTt2YXIgc3Rkb3V0PUZTLm9wZW4oIi9kZXYvc3Rkb3V0IiwxKTt2YXIgc3RkZXJyPUZTLm9wZW4oIi9kZXYvc3RkZXJyIiwxKX0sZW5zdXJlRXJybm9FcnJvcjooKT0+e2lmKEZTLkVycm5vRXJyb3IpcmV0dXJuO0ZTLkVycm5vRXJyb3I9ZnVuY3Rpb24gRXJybm9FcnJvcihlcnJubyxub2RlKXt0aGlzLm5vZGU9bm9kZTt0aGlzLnNldEVycm5vPWZ1bmN0aW9uKGVycm5vKXt0aGlzLmVycm5vPWVycm5vfTt0aGlzLnNldEVycm5vKGVycm5vKTt0aGlzLm1lc3NhZ2U9IkZTIGVycm9yIn07RlMuRXJybm9FcnJvci5wcm90b3R5cGU9bmV3IEVycm9yO0ZTLkVycm5vRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yPUZTLkVycm5vRXJyb3I7WzQ0XS5mb3JFYWNoKGNvZGU9PntGUy5nZW5lcmljRXJyb3JzW2NvZGVdPW5ldyBGUy5FcnJub0Vycm9yKGNvZGUpO0ZTLmdlbmVyaWNFcnJvcnNbY29kZV0uc3RhY2s9IjxnZW5lcmljIGVycm9yLCBubyBzdGFjaz4ifSl9LHN0YXRpY0luaXQ6KCk9PntGUy5lbnN1cmVFcnJub0Vycm9yKCk7RlMubmFtZVRhYmxlPW5ldyBBcnJheSg0MDk2KTtGUy5tb3VudChNRU1GUyx7fSwiLyIpO0ZTLmNyZWF0ZURlZmF1bHREaXJlY3RvcmllcygpO0ZTLmNyZWF0ZURlZmF1bHREZXZpY2VzKCk7RlMuY3JlYXRlU3BlY2lhbERpcmVjdG9yaWVzKCk7RlMuZmlsZXN5c3RlbXM9eyJNRU1GUyI6TUVNRlN9fSxpbml0OihpbnB1dCxvdXRwdXQsZXJyb3IpPT57RlMuaW5pdC5pbml0aWFsaXplZD10cnVlO0ZTLmVuc3VyZUVycm5vRXJyb3IoKTtNb2R1bGVbInN0ZGluIl09aW5wdXR8fE1vZHVsZVsic3RkaW4iXTtNb2R1bGVbInN0ZG91dCJdPW91dHB1dHx8TW9kdWxlWyJzdGRvdXQiXTtNb2R1bGVbInN0ZGVyciJdPWVycm9yfHxNb2R1bGVbInN0ZGVyciJdO0ZTLmNyZWF0ZVN0YW5kYXJkU3RyZWFtcygpfSxxdWl0OigpPT57RlMuaW5pdC5pbml0aWFsaXplZD1mYWxzZTtfX19zdGRpb19leGl0KCk7Zm9yKHZhciBpPTA7aTxGUy5zdHJlYW1zLmxlbmd0aDtpKyspe3ZhciBzdHJlYW09RlMuc3RyZWFtc1tpXTtpZighc3RyZWFtKXtjb250aW51ZX1GUy5jbG9zZShzdHJlYW0pfX0sZ2V0TW9kZTooY2FuUmVhZCxjYW5Xcml0ZSk9Pnt2YXIgbW9kZT0wO2lmKGNhblJlYWQpbW9kZXw9MjkyfDczO2lmKGNhbldyaXRlKW1vZGV8PTE0NjtyZXR1cm4gbW9kZX0sZmluZE9iamVjdDoocGF0aCxkb250UmVzb2x2ZUxhc3RMaW5rKT0+e3ZhciByZXQ9RlMuYW5hbHl6ZVBhdGgocGF0aCxkb250UmVzb2x2ZUxhc3RMaW5rKTtpZihyZXQuZXhpc3RzKXtyZXR1cm4gcmV0Lm9iamVjdH1lbHNle3JldHVybiBudWxsfX0sYW5hbHl6ZVBhdGg6KHBhdGgsZG9udFJlc29sdmVMYXN0TGluayk9Pnt0cnl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udFJlc29sdmVMYXN0TGlua30pO3BhdGg9bG9va3VwLnBhdGh9Y2F0Y2goZSl7fXZhciByZXQ9e2lzUm9vdDpmYWxzZSxleGlzdHM6ZmFsc2UsZXJyb3I6MCxuYW1lOm51bGwscGF0aDpudWxsLG9iamVjdDpudWxsLHBhcmVudEV4aXN0czpmYWxzZSxwYXJlbnRQYXRoOm51bGwscGFyZW50T2JqZWN0Om51bGx9O3RyeXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7cGFyZW50OnRydWV9KTtyZXQucGFyZW50RXhpc3RzPXRydWU7cmV0LnBhcmVudFBhdGg9bG9va3VwLnBhdGg7cmV0LnBhcmVudE9iamVjdD1sb29rdXAubm9kZTtyZXQubmFtZT1QQVRILmJhc2VuYW1lKHBhdGgpO2xvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udFJlc29sdmVMYXN0TGlua30pO3JldC5leGlzdHM9dHJ1ZTtyZXQucGF0aD1sb29rdXAucGF0aDtyZXQub2JqZWN0PWxvb2t1cC5ub2RlO3JldC5uYW1lPWxvb2t1cC5ub2RlLm5hbWU7cmV0LmlzUm9vdD1sb29rdXAucGF0aD09PSIvIn1jYXRjaChlKXtyZXQuZXJyb3I9ZS5lcnJub31yZXR1cm4gcmV0fSxjcmVhdGVQYXRoOihwYXJlbnQscGF0aCxjYW5SZWFkLGNhbldyaXRlKT0+e3BhcmVudD10eXBlb2YgcGFyZW50PT0ic3RyaW5nIj9wYXJlbnQ6RlMuZ2V0UGF0aChwYXJlbnQpO3ZhciBwYXJ0cz1wYXRoLnNwbGl0KCIvIikucmV2ZXJzZSgpO3doaWxlKHBhcnRzLmxlbmd0aCl7dmFyIHBhcnQ9cGFydHMucG9wKCk7aWYoIXBhcnQpY29udGludWU7dmFyIGN1cnJlbnQ9UEFUSC5qb2luMihwYXJlbnQscGFydCk7dHJ5e0ZTLm1rZGlyKGN1cnJlbnQpfWNhdGNoKGUpe31wYXJlbnQ9Y3VycmVudH1yZXR1cm4gY3VycmVudH0sY3JlYXRlRmlsZToocGFyZW50LG5hbWUscHJvcGVydGllcyxjYW5SZWFkLGNhbldyaXRlKT0+e3ZhciBwYXRoPVBBVEguam9pbjIodHlwZW9mIHBhcmVudD09InN0cmluZyI/cGFyZW50OkZTLmdldFBhdGgocGFyZW50KSxuYW1lKTt2YXIgbW9kZT1GUy5nZXRNb2RlKGNhblJlYWQsY2FuV3JpdGUpO3JldHVybiBGUy5jcmVhdGUocGF0aCxtb2RlKX0sY3JlYXRlRGF0YUZpbGU6KHBhcmVudCxuYW1lLGRhdGEsY2FuUmVhZCxjYW5Xcml0ZSxjYW5Pd24pPT57dmFyIHBhdGg9bmFtZTtpZihwYXJlbnQpe3BhcmVudD10eXBlb2YgcGFyZW50PT0ic3RyaW5nIj9wYXJlbnQ6RlMuZ2V0UGF0aChwYXJlbnQpO3BhdGg9bmFtZT9QQVRILmpvaW4yKHBhcmVudCxuYW1lKTpwYXJlbnR9dmFyIG1vZGU9RlMuZ2V0TW9kZShjYW5SZWFkLGNhbldyaXRlKTt2YXIgbm9kZT1GUy5jcmVhdGUocGF0aCxtb2RlKTtpZihkYXRhKXtpZih0eXBlb2YgZGF0YT09InN0cmluZyIpe3ZhciBhcnI9bmV3IEFycmF5KGRhdGEubGVuZ3RoKTtmb3IodmFyIGk9MCxsZW49ZGF0YS5sZW5ndGg7aTxsZW47KytpKWFycltpXT1kYXRhLmNoYXJDb2RlQXQoaSk7ZGF0YT1hcnJ9RlMuY2htb2Qobm9kZSxtb2RlfDE0Nik7dmFyIHN0cmVhbT1GUy5vcGVuKG5vZGUsNTc3KTtGUy53cml0ZShzdHJlYW0sZGF0YSwwLGRhdGEubGVuZ3RoLDAsY2FuT3duKTtGUy5jbG9zZShzdHJlYW0pO0ZTLmNobW9kKG5vZGUsbW9kZSl9cmV0dXJuIG5vZGV9LGNyZWF0ZURldmljZToocGFyZW50LG5hbWUsaW5wdXQsb3V0cHV0KT0+e3ZhciBwYXRoPVBBVEguam9pbjIodHlwZW9mIHBhcmVudD09InN0cmluZyI/cGFyZW50OkZTLmdldFBhdGgocGFyZW50KSxuYW1lKTt2YXIgbW9kZT1GUy5nZXRNb2RlKCEhaW5wdXQsISFvdXRwdXQpO2lmKCFGUy5jcmVhdGVEZXZpY2UubWFqb3IpRlMuY3JlYXRlRGV2aWNlLm1ham9yPTY0O3ZhciBkZXY9RlMubWFrZWRldihGUy5jcmVhdGVEZXZpY2UubWFqb3IrKywwKTtGUy5yZWdpc3RlckRldmljZShkZXYse29wZW46c3RyZWFtPT57c3RyZWFtLnNlZWthYmxlPWZhbHNlfSxjbG9zZTpzdHJlYW09PntpZihvdXRwdXQmJm91dHB1dC5idWZmZXImJm91dHB1dC5idWZmZXIubGVuZ3RoKXtvdXRwdXQoMTApfX0scmVhZDooc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvcyk9Pnt2YXIgYnl0ZXNSZWFkPTA7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXt2YXIgcmVzdWx0O3RyeXtyZXN1bHQ9aW5wdXQoKX1jYXRjaChlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOSl9aWYocmVzdWx0PT09dW5kZWZpbmVkJiZieXRlc1JlYWQ9PT0wKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2KX1pZihyZXN1bHQ9PT1udWxsfHxyZXN1bHQ9PT11bmRlZmluZWQpYnJlYWs7Ynl0ZXNSZWFkKys7YnVmZmVyW29mZnNldCtpXT1yZXN1bHR9aWYoYnl0ZXNSZWFkKXtzdHJlYW0ubm9kZS50aW1lc3RhbXA9RGF0ZS5ub3coKX1yZXR1cm4gYnl0ZXNSZWFkfSx3cml0ZTooc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvcyk9Pntmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe3RyeXtvdXRwdXQoYnVmZmVyW29mZnNldCtpXSl9Y2F0Y2goZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjkpfX1pZihsZW5ndGgpe3N0cmVhbS5ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpfXJldHVybiBpfX0pO3JldHVybiBGUy5ta2RldihwYXRoLG1vZGUsZGV2KX0sZm9yY2VMb2FkRmlsZTpvYmo9PntpZihvYmouaXNEZXZpY2V8fG9iai5pc0ZvbGRlcnx8b2JqLmxpbmt8fG9iai5jb250ZW50cylyZXR1cm4gdHJ1ZTtpZih0eXBlb2YgWE1MSHR0cFJlcXVlc3QhPSJ1bmRlZmluZWQiKXt0aHJvdyBuZXcgRXJyb3IoIkxhenkgbG9hZGluZyBzaG91bGQgaGF2ZSBiZWVuIHBlcmZvcm1lZCAoY29udGVudHMgc2V0KSBpbiBjcmVhdGVMYXp5RmlsZSwgYnV0IGl0IHdhcyBub3QuIExhenkgbG9hZGluZyBvbmx5IHdvcmtzIGluIHdlYiB3b3JrZXJzLiBVc2UgLS1lbWJlZC1maWxlIG9yIC0tcHJlbG9hZC1maWxlIGluIGVtY2Mgb24gdGhlIG1haW4gdGhyZWFkLiIpfWVsc2UgaWYocmVhZF8pe3RyeXtvYmouY29udGVudHM9aW50QXJyYXlGcm9tU3RyaW5nKHJlYWRfKG9iai51cmwpLHRydWUpO29iai51c2VkQnl0ZXM9b2JqLmNvbnRlbnRzLmxlbmd0aH1jYXRjaChlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOSl9fWVsc2V7dGhyb3cgbmV3IEVycm9yKCJDYW5ub3QgbG9hZCB3aXRob3V0IHJlYWQoKSBvciBYTUxIdHRwUmVxdWVzdC4iKX19LGNyZWF0ZUxhenlGaWxlOihwYXJlbnQsbmFtZSx1cmwsY2FuUmVhZCxjYW5Xcml0ZSk9PntmdW5jdGlvbiBMYXp5VWludDhBcnJheSgpe3RoaXMubGVuZ3RoS25vd249ZmFsc2U7dGhpcy5jaHVua3M9W119TGF6eVVpbnQ4QXJyYXkucHJvdG90eXBlLmdldD1mdW5jdGlvbiBMYXp5VWludDhBcnJheV9nZXQoaWR4KXtpZihpZHg+dGhpcy5sZW5ndGgtMXx8aWR4PDApe3JldHVybiB1bmRlZmluZWR9dmFyIGNodW5rT2Zmc2V0PWlkeCV0aGlzLmNodW5rU2l6ZTt2YXIgY2h1bmtOdW09aWR4L3RoaXMuY2h1bmtTaXplfDA7cmV0dXJuIHRoaXMuZ2V0dGVyKGNodW5rTnVtKVtjaHVua09mZnNldF19O0xhenlVaW50OEFycmF5LnByb3RvdHlwZS5zZXREYXRhR2V0dGVyPWZ1bmN0aW9uIExhenlVaW50OEFycmF5X3NldERhdGFHZXR0ZXIoZ2V0dGVyKXt0aGlzLmdldHRlcj1nZXR0ZXJ9O0xhenlVaW50OEFycmF5LnByb3RvdHlwZS5jYWNoZUxlbmd0aD1mdW5jdGlvbiBMYXp5VWludDhBcnJheV9jYWNoZUxlbmd0aCgpe3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJIRUFEIix1cmwsZmFsc2UpO3hoci5zZW5kKG51bGwpO2lmKCEoeGhyLnN0YXR1cz49MjAwJiZ4aHIuc3RhdHVzPDMwMHx8eGhyLnN0YXR1cz09PTMwNCkpdGhyb3cgbmV3IEVycm9yKCJDb3VsZG4ndCBsb2FkICIrdXJsKyIuIFN0YXR1czogIit4aHIuc3RhdHVzKTt2YXIgZGF0YWxlbmd0aD1OdW1iZXIoeGhyLmdldFJlc3BvbnNlSGVhZGVyKCJDb250ZW50LWxlbmd0aCIpKTt2YXIgaGVhZGVyO3ZhciBoYXNCeXRlU2VydmluZz0oaGVhZGVyPXhoci5nZXRSZXNwb25zZUhlYWRlcigiQWNjZXB0LVJhbmdlcyIpKSYmaGVhZGVyPT09ImJ5dGVzIjt2YXIgdXNlc0d6aXA9KGhlYWRlcj14aHIuZ2V0UmVzcG9uc2VIZWFkZXIoIkNvbnRlbnQtRW5jb2RpbmciKSkmJmhlYWRlcj09PSJnemlwIjt2YXIgY2h1bmtTaXplPTEwMjQqMTAyNDtpZighaGFzQnl0ZVNlcnZpbmcpY2h1bmtTaXplPWRhdGFsZW5ndGg7dmFyIGRvWEhSPShmcm9tLHRvKT0+e2lmKGZyb20+dG8pdGhyb3cgbmV3IEVycm9yKCJpbnZhbGlkIHJhbmdlICgiK2Zyb20rIiwgIit0bysiKSBvciBubyBieXRlcyByZXF1ZXN0ZWQhIik7aWYodG8+ZGF0YWxlbmd0aC0xKXRocm93IG5ldyBFcnJvcigib25seSAiK2RhdGFsZW5ndGgrIiBieXRlcyBhdmFpbGFibGUhIHByb2dyYW1tZXIgZXJyb3IhIik7dmFyIHhocj1uZXcgWE1MSHR0cFJlcXVlc3Q7eGhyLm9wZW4oIkdFVCIsdXJsLGZhbHNlKTtpZihkYXRhbGVuZ3RoIT09Y2h1bmtTaXplKXhoci5zZXRSZXF1ZXN0SGVhZGVyKCJSYW5nZSIsImJ5dGVzPSIrZnJvbSsiLSIrdG8pO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjtpZih4aHIub3ZlcnJpZGVNaW1lVHlwZSl7eGhyLm92ZXJyaWRlTWltZVR5cGUoInRleHQvcGxhaW47IGNoYXJzZXQ9eC11c2VyLWRlZmluZWQiKX14aHIuc2VuZChudWxsKTtpZighKHhoci5zdGF0dXM+PTIwMCYmeGhyLnN0YXR1czwzMDB8fHhoci5zdGF0dXM9PT0zMDQpKXRocm93IG5ldyBFcnJvcigiQ291bGRuJ3QgbG9hZCAiK3VybCsiLiBTdGF0dXM6ICIreGhyLnN0YXR1cyk7aWYoeGhyLnJlc3BvbnNlIT09dW5kZWZpbmVkKXtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlfHxbXSl9ZWxzZXtyZXR1cm4gaW50QXJyYXlGcm9tU3RyaW5nKHhoci5yZXNwb25zZVRleHR8fCIiLHRydWUpfX07dmFyIGxhenlBcnJheT10aGlzO2xhenlBcnJheS5zZXREYXRhR2V0dGVyKGNodW5rTnVtPT57dmFyIHN0YXJ0PWNodW5rTnVtKmNodW5rU2l6ZTt2YXIgZW5kPShjaHVua051bSsxKSpjaHVua1NpemUtMTtlbmQ9TWF0aC5taW4oZW5kLGRhdGFsZW5ndGgtMSk7aWYodHlwZW9mIGxhenlBcnJheS5jaHVua3NbY2h1bmtOdW1dPT0idW5kZWZpbmVkIil7bGF6eUFycmF5LmNodW5rc1tjaHVua051bV09ZG9YSFIoc3RhcnQsZW5kKX1pZih0eXBlb2YgbGF6eUFycmF5LmNodW5rc1tjaHVua051bV09PSJ1bmRlZmluZWQiKXRocm93IG5ldyBFcnJvcigiZG9YSFIgZmFpbGVkISIpO3JldHVybiBsYXp5QXJyYXkuY2h1bmtzW2NodW5rTnVtXX0pO2lmKHVzZXNHemlwfHwhZGF0YWxlbmd0aCl7Y2h1bmtTaXplPWRhdGFsZW5ndGg9MTtkYXRhbGVuZ3RoPXRoaXMuZ2V0dGVyKDApLmxlbmd0aDtjaHVua1NpemU9ZGF0YWxlbmd0aDtvdXQoIkxhenlGaWxlcyBvbiBnemlwIGZvcmNlcyBkb3dubG9hZCBvZiB0aGUgd2hvbGUgZmlsZSB3aGVuIGxlbmd0aCBpcyBhY2Nlc3NlZCIpfXRoaXMuX2xlbmd0aD1kYXRhbGVuZ3RoO3RoaXMuX2NodW5rU2l6ZT1jaHVua1NpemU7dGhpcy5sZW5ndGhLbm93bj10cnVlfTtpZih0eXBlb2YgWE1MSHR0cFJlcXVlc3QhPSJ1bmRlZmluZWQiKXtpZighRU5WSVJPTk1FTlRfSVNfV09SS0VSKXRocm93IkNhbm5vdCBkbyBzeW5jaHJvbm91cyBiaW5hcnkgWEhScyBvdXRzaWRlIHdlYndvcmtlcnMgaW4gbW9kZXJuIGJyb3dzZXJzLiBVc2UgLS1lbWJlZC1maWxlIG9yIC0tcHJlbG9hZC1maWxlIGluIGVtY2MiO3ZhciBsYXp5QXJyYXk9bmV3IExhenlVaW50OEFycmF5O09iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGxhenlBcnJheSx7bGVuZ3RoOntnZXQ6ZnVuY3Rpb24oKXtpZighdGhpcy5sZW5ndGhLbm93bil7dGhpcy5jYWNoZUxlbmd0aCgpfXJldHVybiB0aGlzLl9sZW5ndGh9fSxjaHVua1NpemU6e2dldDpmdW5jdGlvbigpe2lmKCF0aGlzLmxlbmd0aEtub3duKXt0aGlzLmNhY2hlTGVuZ3RoKCl9cmV0dXJuIHRoaXMuX2NodW5rU2l6ZX19fSk7dmFyIHByb3BlcnRpZXM9e2lzRGV2aWNlOmZhbHNlLGNvbnRlbnRzOmxhenlBcnJheX19ZWxzZXt2YXIgcHJvcGVydGllcz17aXNEZXZpY2U6ZmFsc2UsdXJsOnVybH19dmFyIG5vZGU9RlMuY3JlYXRlRmlsZShwYXJlbnQsbmFtZSxwcm9wZXJ0aWVzLGNhblJlYWQsY2FuV3JpdGUpO2lmKHByb3BlcnRpZXMuY29udGVudHMpe25vZGUuY29udGVudHM9cHJvcGVydGllcy5jb250ZW50c31lbHNlIGlmKHByb3BlcnRpZXMudXJsKXtub2RlLmNvbnRlbnRzPW51bGw7bm9kZS51cmw9cHJvcGVydGllcy51cmx9T2JqZWN0LmRlZmluZVByb3BlcnRpZXMobm9kZSx7dXNlZEJ5dGVzOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jb250ZW50cy5sZW5ndGh9fX0pO3ZhciBzdHJlYW1fb3BzPXt9O3ZhciBrZXlzPU9iamVjdC5rZXlzKG5vZGUuc3RyZWFtX29wcyk7a2V5cy5mb3JFYWNoKGtleT0+e3ZhciBmbj1ub2RlLnN0cmVhbV9vcHNba2V5XTtzdHJlYW1fb3BzW2tleV09ZnVuY3Rpb24gZm9yY2VMb2FkTGF6eUZpbGUoKXtGUy5mb3JjZUxvYWRGaWxlKG5vZGUpO3JldHVybiBmbi5hcHBseShudWxsLGFyZ3VtZW50cyl9fSk7c3RyZWFtX29wcy5yZWFkPSgoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uKT0+e0ZTLmZvcmNlTG9hZEZpbGUobm9kZSk7dmFyIGNvbnRlbnRzPXN0cmVhbS5ub2RlLmNvbnRlbnRzO2lmKHBvc2l0aW9uPj1jb250ZW50cy5sZW5ndGgpcmV0dXJuIDA7dmFyIHNpemU9TWF0aC5taW4oY29udGVudHMubGVuZ3RoLXBvc2l0aW9uLGxlbmd0aCk7aWYoY29udGVudHMuc2xpY2Upe2Zvcih2YXIgaT0wO2k8c2l6ZTtpKyspe2J1ZmZlcltvZmZzZXQraV09Y29udGVudHNbcG9zaXRpb24raV19fWVsc2V7Zm9yKHZhciBpPTA7aTxzaXplO2krKyl7YnVmZmVyW29mZnNldCtpXT1jb250ZW50cy5nZXQocG9zaXRpb24raSl9fXJldHVybiBzaXplfSk7bm9kZS5zdHJlYW1fb3BzPXN0cmVhbV9vcHM7cmV0dXJuIG5vZGV9LGNyZWF0ZVByZWxvYWRlZEZpbGU6KHBhcmVudCxuYW1lLHVybCxjYW5SZWFkLGNhbldyaXRlLG9ubG9hZCxvbmVycm9yLGRvbnRDcmVhdGVGaWxlLGNhbk93bixwcmVGaW5pc2gpPT57dmFyIGZ1bGxuYW1lPW5hbWU/UEFUSF9GUy5yZXNvbHZlKFBBVEguam9pbjIocGFyZW50LG5hbWUpKTpwYXJlbnQ7dmFyIGRlcD1nZXRVbmlxdWVSdW5EZXBlbmRlbmN5KCJjcCAiK2Z1bGxuYW1lKTtmdW5jdGlvbiBwcm9jZXNzRGF0YShieXRlQXJyYXkpe2Z1bmN0aW9uIGZpbmlzaChieXRlQXJyYXkpe2lmKHByZUZpbmlzaClwcmVGaW5pc2goKTtpZighZG9udENyZWF0ZUZpbGUpe0ZTLmNyZWF0ZURhdGFGaWxlKHBhcmVudCxuYW1lLGJ5dGVBcnJheSxjYW5SZWFkLGNhbldyaXRlLGNhbk93bil9aWYob25sb2FkKW9ubG9hZCgpO3JlbW92ZVJ1bkRlcGVuZGVuY3koZGVwKX1pZihCcm93c2VyLmhhbmRsZWRCeVByZWxvYWRQbHVnaW4oYnl0ZUFycmF5LGZ1bGxuYW1lLGZpbmlzaCwoKT0+e2lmKG9uZXJyb3Ipb25lcnJvcigpO3JlbW92ZVJ1bkRlcGVuZGVuY3koZGVwKX0pKXtyZXR1cm59ZmluaXNoKGJ5dGVBcnJheSl9YWRkUnVuRGVwZW5kZW5jeShkZXApO2lmKHR5cGVvZiB1cmw9PSJzdHJpbmciKXthc3luY0xvYWQodXJsLGJ5dGVBcnJheT0+cHJvY2Vzc0RhdGEoYnl0ZUFycmF5KSxvbmVycm9yKX1lbHNle3Byb2Nlc3NEYXRhKHVybCl9fSxpbmRleGVkREI6KCk9PntyZXR1cm4gd2luZG93LmluZGV4ZWREQnx8d2luZG93Lm1vekluZGV4ZWREQnx8d2luZG93LndlYmtpdEluZGV4ZWREQnx8d2luZG93Lm1zSW5kZXhlZERCfSxEQl9OQU1FOigpPT57cmV0dXJuIkVNX0ZTXyIrd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lfSxEQl9WRVJTSU9OOjIwLERCX1NUT1JFX05BTUU6IkZJTEVfREFUQSIsc2F2ZUZpbGVzVG9EQjoocGF0aHMsb25sb2FkLG9uZXJyb3IpPT57b25sb2FkPW9ubG9hZHx8KCgpPT57fSk7b25lcnJvcj1vbmVycm9yfHwoKCk9Pnt9KTt2YXIgaW5kZXhlZERCPUZTLmluZGV4ZWREQigpO3RyeXt2YXIgb3BlblJlcXVlc3Q9aW5kZXhlZERCLm9wZW4oRlMuREJfTkFNRSgpLEZTLkRCX1ZFUlNJT04pfWNhdGNoKGUpe3JldHVybiBvbmVycm9yKGUpfW9wZW5SZXF1ZXN0Lm9udXBncmFkZW5lZWRlZD0oKCk9PntvdXQoImNyZWF0aW5nIGRiIik7dmFyIGRiPW9wZW5SZXF1ZXN0LnJlc3VsdDtkYi5jcmVhdGVPYmplY3RTdG9yZShGUy5EQl9TVE9SRV9OQU1FKX0pO29wZW5SZXF1ZXN0Lm9uc3VjY2Vzcz0oKCk9Pnt2YXIgZGI9b3BlblJlcXVlc3QucmVzdWx0O3ZhciB0cmFuc2FjdGlvbj1kYi50cmFuc2FjdGlvbihbRlMuREJfU1RPUkVfTkFNRV0sInJlYWR3cml0ZSIpO3ZhciBmaWxlcz10cmFuc2FjdGlvbi5vYmplY3RTdG9yZShGUy5EQl9TVE9SRV9OQU1FKTt2YXIgb2s9MCxmYWlsPTAsdG90YWw9cGF0aHMubGVuZ3RoO2Z1bmN0aW9uIGZpbmlzaCgpe2lmKGZhaWw9PTApb25sb2FkKCk7ZWxzZSBvbmVycm9yKCl9cGF0aHMuZm9yRWFjaChwYXRoPT57dmFyIHB1dFJlcXVlc3Q9ZmlsZXMucHV0KEZTLmFuYWx5emVQYXRoKHBhdGgpLm9iamVjdC5jb250ZW50cyxwYXRoKTtwdXRSZXF1ZXN0Lm9uc3VjY2Vzcz0oKCk9PntvaysrO2lmKG9rK2ZhaWw9PXRvdGFsKWZpbmlzaCgpfSk7cHV0UmVxdWVzdC5vbmVycm9yPSgoKT0+e2ZhaWwrKztpZihvaytmYWlsPT10b3RhbClmaW5pc2goKX0pfSk7dHJhbnNhY3Rpb24ub25lcnJvcj1vbmVycm9yfSk7b3BlblJlcXVlc3Qub25lcnJvcj1vbmVycm9yfSxsb2FkRmlsZXNGcm9tREI6KHBhdGhzLG9ubG9hZCxvbmVycm9yKT0+e29ubG9hZD1vbmxvYWR8fCgoKT0+e30pO29uZXJyb3I9b25lcnJvcnx8KCgpPT57fSk7dmFyIGluZGV4ZWREQj1GUy5pbmRleGVkREIoKTt0cnl7dmFyIG9wZW5SZXF1ZXN0PWluZGV4ZWREQi5vcGVuKEZTLkRCX05BTUUoKSxGUy5EQl9WRVJTSU9OKX1jYXRjaChlKXtyZXR1cm4gb25lcnJvcihlKX1vcGVuUmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQ9b25lcnJvcjtvcGVuUmVxdWVzdC5vbnN1Y2Nlc3M9KCgpPT57dmFyIGRiPW9wZW5SZXF1ZXN0LnJlc3VsdDt0cnl7dmFyIHRyYW5zYWN0aW9uPWRiLnRyYW5zYWN0aW9uKFtGUy5EQl9TVE9SRV9OQU1FXSwicmVhZG9ubHkiKX1jYXRjaChlKXtvbmVycm9yKGUpO3JldHVybn12YXIgZmlsZXM9dHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoRlMuREJfU1RPUkVfTkFNRSk7dmFyIG9rPTAsZmFpbD0wLHRvdGFsPXBhdGhzLmxlbmd0aDtmdW5jdGlvbiBmaW5pc2goKXtpZihmYWlsPT0wKW9ubG9hZCgpO2Vsc2Ugb25lcnJvcigpfXBhdGhzLmZvckVhY2gocGF0aD0+e3ZhciBnZXRSZXF1ZXN0PWZpbGVzLmdldChwYXRoKTtnZXRSZXF1ZXN0Lm9uc3VjY2Vzcz0oKCk9PntpZihGUy5hbmFseXplUGF0aChwYXRoKS5leGlzdHMpe0ZTLnVubGluayhwYXRoKX1GUy5jcmVhdGVEYXRhRmlsZShQQVRILmRpcm5hbWUocGF0aCksUEFUSC5iYXNlbmFtZShwYXRoKSxnZXRSZXF1ZXN0LnJlc3VsdCx0cnVlLHRydWUsdHJ1ZSk7b2srKztpZihvaytmYWlsPT10b3RhbClmaW5pc2goKX0pO2dldFJlcXVlc3Qub25lcnJvcj0oKCk9PntmYWlsKys7aWYob2srZmFpbD09dG90YWwpZmluaXNoKCl9KX0pO3RyYW5zYWN0aW9uLm9uZXJyb3I9b25lcnJvcn0pO29wZW5SZXF1ZXN0Lm9uZXJyb3I9b25lcnJvcn19O3ZhciBTWVNDQUxMUz17REVGQVVMVF9QT0xMTUFTSzo1LGNhbGN1bGF0ZUF0OmZ1bmN0aW9uKGRpcmZkLHBhdGgsYWxsb3dFbXB0eSl7aWYoUEFUSC5pc0FicyhwYXRoKSl7cmV0dXJuIHBhdGh9dmFyIGRpcjtpZihkaXJmZD09PS0xMDApe2Rpcj1GUy5jd2QoKX1lbHNle3ZhciBkaXJzdHJlYW09RlMuZ2V0U3RyZWFtKGRpcmZkKTtpZighZGlyc3RyZWFtKXRocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpO2Rpcj1kaXJzdHJlYW0ucGF0aH1pZihwYXRoLmxlbmd0aD09MCl7aWYoIWFsbG93RW1wdHkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1yZXR1cm4gZGlyfXJldHVybiBQQVRILmpvaW4yKGRpcixwYXRoKX0sZG9TdGF0OmZ1bmN0aW9uKGZ1bmMscGF0aCxidWYpe3RyeXt2YXIgc3RhdD1mdW5jKHBhdGgpfWNhdGNoKGUpe2lmKGUmJmUubm9kZSYmUEFUSC5ub3JtYWxpemUocGF0aCkhPT1QQVRILm5vcm1hbGl6ZShGUy5nZXRQYXRoKGUubm9kZSkpKXtyZXR1cm4tNTR9dGhyb3cgZX1HUk9XQUJMRV9IRUFQX0kzMigpW2J1Zj4+Ml09c3RhdC5kZXY7R1JPV0FCTEVfSEVBUF9JMzIoKVtidWYrND4+Ml09MDtHUk9XQUJMRV9IRUFQX0kzMigpW2J1Zis4Pj4yXT1zdGF0LmlubztHUk9XQUJMRV9IRUFQX0kzMigpW2J1ZisxMj4+Ml09c3RhdC5tb2RlO0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzE2Pj4yXT1zdGF0Lm5saW5rO0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzIwPj4yXT1zdGF0LnVpZDtHUk9XQUJMRV9IRUFQX0kzMigpW2J1ZisyND4+Ml09c3RhdC5naWQ7R1JPV0FCTEVfSEVBUF9JMzIoKVtidWYrMjg+PjJdPXN0YXQucmRldjtHUk9XQUJMRV9IRUFQX0kzMigpW2J1ZiszMj4+Ml09MDt0ZW1wSTY0PVtzdGF0LnNpemU+Pj4wLCh0ZW1wRG91YmxlPXN0YXQuc2l6ZSwrTWF0aC5hYnModGVtcERvdWJsZSk+PTE/dGVtcERvdWJsZT4wPyhNYXRoLm1pbigrTWF0aC5mbG9vcih0ZW1wRG91YmxlLzQyOTQ5NjcyOTYpLDQyOTQ5NjcyOTUpfDApPj4+MDp+fitNYXRoLmNlaWwoKHRlbXBEb3VibGUtKyh+fnRlbXBEb3VibGU+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApXSxHUk9XQUJMRV9IRUFQX0kzMigpW2J1Zis0MD4+Ml09dGVtcEk2NFswXSxHUk9XQUJMRV9IRUFQX0kzMigpW2J1Zis0ND4+Ml09dGVtcEk2NFsxXTtHUk9XQUJMRV9IRUFQX0kzMigpW2J1Zis0OD4+Ml09NDA5NjtHUk9XQUJMRV9IRUFQX0kzMigpW2J1Zis1Mj4+Ml09c3RhdC5ibG9ja3M7R1JPV0FCTEVfSEVBUF9JMzIoKVtidWYrNTY+PjJdPXN0YXQuYXRpbWUuZ2V0VGltZSgpLzFlM3wwO0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzYwPj4yXT0wO0dST1dBQkxFX0hFQVBfSTMyKClbYnVmKzY0Pj4yXT1zdGF0Lm10aW1lLmdldFRpbWUoKS8xZTN8MDtHUk9XQUJMRV9IRUFQX0kzMigpW2J1Zis2OD4+Ml09MDtHUk9XQUJMRV9IRUFQX0kzMigpW2J1Zis3Mj4+Ml09c3RhdC5jdGltZS5nZXRUaW1lKCkvMWUzfDA7R1JPV0FCTEVfSEVBUF9JMzIoKVtidWYrNzY+PjJdPTA7dGVtcEk2ND1bc3RhdC5pbm8+Pj4wLCh0ZW1wRG91YmxlPXN0YXQuaW5vLCtNYXRoLmFicyh0ZW1wRG91YmxlKT49MT90ZW1wRG91YmxlPjA/KE1hdGgubWluKCtNYXRoLmZsb29yKHRlbXBEb3VibGUvNDI5NDk2NzI5NiksNDI5NDk2NzI5NSl8MCk+Pj4wOn5+K01hdGguY2VpbCgodGVtcERvdWJsZS0rKH5+dGVtcERvdWJsZT4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCldLEdST1dBQkxFX0hFQVBfSTMyKClbYnVmKzgwPj4yXT10ZW1wSTY0WzBdLEdST1dBQkxFX0hFQVBfSTMyKClbYnVmKzg0Pj4yXT10ZW1wSTY0WzFdO3JldHVybiAwfSxkb01zeW5jOmZ1bmN0aW9uKGFkZHIsc3RyZWFtLGxlbixmbGFncyxvZmZzZXQpe3ZhciBidWZmZXI9R1JPV0FCTEVfSEVBUF9VOCgpLnNsaWNlKGFkZHIsYWRkcitsZW4pO0ZTLm1zeW5jKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbixmbGFncyl9LHZhcmFyZ3M6dW5kZWZpbmVkLGdldDpmdW5jdGlvbigpe1NZU0NBTExTLnZhcmFyZ3MrPTQ7dmFyIHJldD1HUk9XQUJMRV9IRUFQX0kzMigpW1NZU0NBTExTLnZhcmFyZ3MtND4+Ml07cmV0dXJuIHJldH0sZ2V0U3RyOmZ1bmN0aW9uKHB0cil7dmFyIHJldD1VVEY4VG9TdHJpbmcocHRyKTtyZXR1cm4gcmV0fSxnZXRTdHJlYW1Gcm9tRkQ6ZnVuY3Rpb24oZmQpe3ZhciBzdHJlYW09RlMuZ2V0U3RyZWFtKGZkKTtpZighc3RyZWFtKXRocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpO3JldHVybiBzdHJlYW19fTtmdW5jdGlvbiBfX19zeXNjYWxsX2ZjbnRsNjQoZmQsY21kLHZhcmFyZ3Mpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDMsMSxmZCxjbWQsdmFyYXJncyk7U1lTQ0FMTFMudmFyYXJncz12YXJhcmdzO3RyeXt2YXIgc3RyZWFtPVNZU0NBTExTLmdldFN0cmVhbUZyb21GRChmZCk7c3dpdGNoKGNtZCl7Y2FzZSAwOnt2YXIgYXJnPVNZU0NBTExTLmdldCgpO2lmKGFyZzwwKXtyZXR1cm4tMjh9dmFyIG5ld1N0cmVhbTtuZXdTdHJlYW09RlMuY3JlYXRlU3RyZWFtKHN0cmVhbSxhcmcpO3JldHVybiBuZXdTdHJlYW0uZmR9Y2FzZSAxOmNhc2UgMjpyZXR1cm4gMDtjYXNlIDM6cmV0dXJuIHN0cmVhbS5mbGFncztjYXNlIDQ6e3ZhciBhcmc9U1lTQ0FMTFMuZ2V0KCk7c3RyZWFtLmZsYWdzfD1hcmc7cmV0dXJuIDB9Y2FzZSA1Ont2YXIgYXJnPVNZU0NBTExTLmdldCgpO3ZhciBvZmZzZXQ9MDtHUk9XQUJMRV9IRUFQX0kxNigpW2FyZytvZmZzZXQ+PjFdPTI7cmV0dXJuIDB9Y2FzZSA2OmNhc2UgNzpyZXR1cm4gMDtjYXNlIDE2OmNhc2UgODpyZXR1cm4tMjg7Y2FzZSA5OnNldEVyck5vKDI4KTtyZXR1cm4tMTtkZWZhdWx0OntyZXR1cm4tMjh9fX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX2ZzdGF0NjQoZmQsYnVmKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBfZW1zY3JpcHRlbl9wcm94eV90b19tYWluX3RocmVhZF9qcyg0LDEsZmQsYnVmKTt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3JldHVybiBTWVNDQUxMUy5kb1N0YXQoRlMuc3RhdCxzdHJlYW0ucGF0aCxidWYpfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfZnRydW5jYXRlNjQoZmQsbGVuZ3RoX2xvdyxsZW5ndGhfaGlnaCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoNSwxLGZkLGxlbmd0aF9sb3csbGVuZ3RoX2hpZ2gpO3RyeXt2YXIgbGVuZ3RoPWxlbmd0aF9oaWdoKjQyOTQ5NjcyOTYrKGxlbmd0aF9sb3c+Pj4wKTtGUy5mdHJ1bmNhdGUoZmQsbGVuZ3RoKTtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX2lvY3RsKGZkLG9wLHZhcmFyZ3Mpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDYsMSxmZCxvcCx2YXJhcmdzKTtTWVNDQUxMUy52YXJhcmdzPXZhcmFyZ3M7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTtzd2l0Y2gob3Ape2Nhc2UgMjE1MDk6Y2FzZSAyMTUwNTp7aWYoIXN0cmVhbS50dHkpcmV0dXJuLTU5O3JldHVybiAwfWNhc2UgMjE1MTA6Y2FzZSAyMTUxMTpjYXNlIDIxNTEyOmNhc2UgMjE1MDY6Y2FzZSAyMTUwNzpjYXNlIDIxNTA4OntpZighc3RyZWFtLnR0eSlyZXR1cm4tNTk7cmV0dXJuIDB9Y2FzZSAyMTUxOTp7aWYoIXN0cmVhbS50dHkpcmV0dXJuLTU5O3ZhciBhcmdwPVNZU0NBTExTLmdldCgpO0dST1dBQkxFX0hFQVBfSTMyKClbYXJncD4+Ml09MDtyZXR1cm4gMH1jYXNlIDIxNTIwOntpZighc3RyZWFtLnR0eSlyZXR1cm4tNTk7cmV0dXJuLTI4fWNhc2UgMjE1MzE6e3ZhciBhcmdwPVNZU0NBTExTLmdldCgpO3JldHVybiBGUy5pb2N0bChzdHJlYW0sb3AsYXJncCl9Y2FzZSAyMTUyMzp7aWYoIXN0cmVhbS50dHkpcmV0dXJuLTU5O3JldHVybiAwfWNhc2UgMjE1MjQ6e2lmKCFzdHJlYW0udHR5KXJldHVybi01OTtyZXR1cm4gMH1kZWZhdWx0OmFib3J0KCJiYWQgaW9jdGwgc3lzY2FsbCAiK29wKX19Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9sc3RhdDY0KHBhdGgsYnVmKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBfZW1zY3JpcHRlbl9wcm94eV90b19tYWluX3RocmVhZF9qcyg3LDEscGF0aCxidWYpO3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtyZXR1cm4gU1lTQ0FMTFMuZG9TdGF0KEZTLmxzdGF0LHBhdGgsYnVmKX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX25ld2ZzdGF0YXQoZGlyZmQscGF0aCxidWYsZmxhZ3Mpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDgsMSxkaXJmZCxwYXRoLGJ1ZixmbGFncyk7dHJ5e3BhdGg9U1lTQ0FMTFMuZ2V0U3RyKHBhdGgpO3ZhciBub2ZvbGxvdz1mbGFncyYyNTY7dmFyIGFsbG93RW1wdHk9ZmxhZ3MmNDA5NjtmbGFncz1mbGFncyZ+NDM1MjtwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KGRpcmZkLHBhdGgsYWxsb3dFbXB0eSk7cmV0dXJuIFNZU0NBTExTLmRvU3RhdChub2ZvbGxvdz9GUy5sc3RhdDpGUy5zdGF0LHBhdGgsYnVmKX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX29wZW5hdChkaXJmZCxwYXRoLGZsYWdzLHZhcmFyZ3Mpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDksMSxkaXJmZCxwYXRoLGZsYWdzLHZhcmFyZ3MpO1NZU0NBTExTLnZhcmFyZ3M9dmFyYXJnczt0cnl7cGF0aD1TWVNDQUxMUy5nZXRTdHIocGF0aCk7cGF0aD1TWVNDQUxMUy5jYWxjdWxhdGVBdChkaXJmZCxwYXRoKTt2YXIgbW9kZT12YXJhcmdzP1NZU0NBTExTLmdldCgpOjA7cmV0dXJuIEZTLm9wZW4ocGF0aCxmbGFncyxtb2RlKS5mZH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX3JlbmFtZWF0KG9sZGRpcmZkLG9sZHBhdGgsbmV3ZGlyZmQsbmV3cGF0aCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMTAsMSxvbGRkaXJmZCxvbGRwYXRoLG5ld2RpcmZkLG5ld3BhdGgpO3RyeXtvbGRwYXRoPVNZU0NBTExTLmdldFN0cihvbGRwYXRoKTtuZXdwYXRoPVNZU0NBTExTLmdldFN0cihuZXdwYXRoKTtvbGRwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KG9sZGRpcmZkLG9sZHBhdGgpO25ld3BhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQobmV3ZGlyZmQsbmV3cGF0aCk7RlMucmVuYW1lKG9sZHBhdGgsbmV3cGF0aCk7cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9zdGF0NjQocGF0aCxidWYpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDExLDEscGF0aCxidWYpO3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtyZXR1cm4gU1lTQ0FMTFMuZG9TdGF0KEZTLnN0YXQscGF0aCxidWYpfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfdW5saW5rYXQoZGlyZmQscGF0aCxmbGFncyl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMTIsMSxkaXJmZCxwYXRoLGZsYWdzKTt0cnl7cGF0aD1TWVNDQUxMUy5nZXRTdHIocGF0aCk7cGF0aD1TWVNDQUxMUy5jYWxjdWxhdGVBdChkaXJmZCxwYXRoKTtpZihmbGFncz09PTApe0ZTLnVubGluayhwYXRoKX1lbHNlIGlmKGZsYWdzPT09NTEyKXtGUy5ybWRpcihwYXRoKX1lbHNle2Fib3J0KCJJbnZhbGlkIGZsYWdzIHBhc3NlZCB0byB1bmxpbmthdCIpfXJldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fZGxpbml0KG1haW5fZHNvX2hhbmRsZSl7fXZhciBkbG9wZW5NaXNzaW5nRXJyb3I9IlRvIHVzZSBkbG9wZW4sIHlvdSBuZWVkIGVuYWJsZSBkeW5hbWljIGxpbmtpbmcsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZW1zY3JpcHRlbi1jb3JlL2Vtc2NyaXB0ZW4vd2lraS9MaW5raW5nIjtmdW5jdGlvbiBfX2Rsb3Blbl9qcyhmaWxlbmFtZSxmbGFnKXthYm9ydChkbG9wZW5NaXNzaW5nRXJyb3IpfWZ1bmN0aW9uIF9fZGxzeW1fanMoaGFuZGxlLHN5bWJvbCl7YWJvcnQoZGxvcGVuTWlzc2luZ0Vycm9yKX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9iaWdpbnQocHJpbWl0aXZlVHlwZSxuYW1lLHNpemUsbWluUmFuZ2UsbWF4UmFuZ2Upe31mdW5jdGlvbiBnZXRTaGlmdEZyb21TaXplKHNpemUpe3N3aXRjaChzaXplKXtjYXNlIDE6cmV0dXJuIDA7Y2FzZSAyOnJldHVybiAxO2Nhc2UgNDpyZXR1cm4gMjtjYXNlIDg6cmV0dXJuIDM7ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKCJVbmtub3duIHR5cGUgc2l6ZTogIitzaXplKX19ZnVuY3Rpb24gZW1iaW5kX2luaXRfY2hhckNvZGVzKCl7dmFyIGNvZGVzPW5ldyBBcnJheSgyNTYpO2Zvcih2YXIgaT0wO2k8MjU2OysraSl7Y29kZXNbaV09U3RyaW5nLmZyb21DaGFyQ29kZShpKX1lbWJpbmRfY2hhckNvZGVzPWNvZGVzfXZhciBlbWJpbmRfY2hhckNvZGVzPXVuZGVmaW5lZDtmdW5jdGlvbiByZWFkTGF0aW4xU3RyaW5nKHB0cil7dmFyIHJldD0iIjt2YXIgYz1wdHI7d2hpbGUoR1JPV0FCTEVfSEVBUF9VOCgpW2NdKXtyZXQrPWVtYmluZF9jaGFyQ29kZXNbR1JPV0FCTEVfSEVBUF9VOCgpW2MrK11dfXJldHVybiByZXR9dmFyIGF3YWl0aW5nRGVwZW5kZW5jaWVzPXt9O3ZhciByZWdpc3RlcmVkVHlwZXM9e307dmFyIHR5cGVEZXBlbmRlbmNpZXM9e307dmFyIGNoYXJfMD00ODt2YXIgY2hhcl85PTU3O2Z1bmN0aW9uIG1ha2VMZWdhbEZ1bmN0aW9uTmFtZShuYW1lKXtpZih1bmRlZmluZWQ9PT1uYW1lKXtyZXR1cm4iX3Vua25vd24ifW5hbWU9bmFtZS5yZXBsYWNlKC9bXmEtekEtWjAtOV9dL2csIiQiKTt2YXIgZj1uYW1lLmNoYXJDb2RlQXQoMCk7aWYoZj49Y2hhcl8wJiZmPD1jaGFyXzkpe3JldHVybiJfIituYW1lfXJldHVybiBuYW1lfWZ1bmN0aW9uIGNyZWF0ZU5hbWVkRnVuY3Rpb24obmFtZSxib2R5KXtuYW1lPW1ha2VMZWdhbEZ1bmN0aW9uTmFtZShuYW1lKTtyZXR1cm4gbmV3IEZ1bmN0aW9uKCJib2R5IiwicmV0dXJuIGZ1bmN0aW9uICIrbmFtZSsiKCkge1xuIisnICAgICJ1c2Ugc3RyaWN0IjsnKyIgICAgcmV0dXJuIGJvZHkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiIrIn07XG4iKShib2R5KX1mdW5jdGlvbiBleHRlbmRFcnJvcihiYXNlRXJyb3JUeXBlLGVycm9yTmFtZSl7dmFyIGVycm9yQ2xhc3M9Y3JlYXRlTmFtZWRGdW5jdGlvbihlcnJvck5hbWUsZnVuY3Rpb24obWVzc2FnZSl7dGhpcy5uYW1lPWVycm9yTmFtZTt0aGlzLm1lc3NhZ2U9bWVzc2FnZTt2YXIgc3RhY2s9bmV3IEVycm9yKG1lc3NhZ2UpLnN0YWNrO2lmKHN0YWNrIT09dW5kZWZpbmVkKXt0aGlzLnN0YWNrPXRoaXMudG9TdHJpbmcoKSsiXG4iK3N0YWNrLnJlcGxhY2UoL15FcnJvcig6W15cbl0qKT9cbi8sIiIpfX0pO2Vycm9yQ2xhc3MucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYmFzZUVycm9yVHlwZS5wcm90b3R5cGUpO2Vycm9yQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yPWVycm9yQ2xhc3M7ZXJyb3JDbGFzcy5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtpZih0aGlzLm1lc3NhZ2U9PT11bmRlZmluZWQpe3JldHVybiB0aGlzLm5hbWV9ZWxzZXtyZXR1cm4gdGhpcy5uYW1lKyI6ICIrdGhpcy5tZXNzYWdlfX07cmV0dXJuIGVycm9yQ2xhc3N9dmFyIEJpbmRpbmdFcnJvcj11bmRlZmluZWQ7ZnVuY3Rpb24gdGhyb3dCaW5kaW5nRXJyb3IobWVzc2FnZSl7dGhyb3cgbmV3IEJpbmRpbmdFcnJvcihtZXNzYWdlKX12YXIgSW50ZXJuYWxFcnJvcj11bmRlZmluZWQ7ZnVuY3Rpb24gdGhyb3dJbnRlcm5hbEVycm9yKG1lc3NhZ2Upe3Rocm93IG5ldyBJbnRlcm5hbEVycm9yKG1lc3NhZ2UpfWZ1bmN0aW9uIHdoZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkKG15VHlwZXMsZGVwZW5kZW50VHlwZXMsZ2V0VHlwZUNvbnZlcnRlcnMpe215VHlwZXMuZm9yRWFjaChmdW5jdGlvbih0eXBlKXt0eXBlRGVwZW5kZW5jaWVzW3R5cGVdPWRlcGVuZGVudFR5cGVzfSk7ZnVuY3Rpb24gb25Db21wbGV0ZSh0eXBlQ29udmVydGVycyl7dmFyIG15VHlwZUNvbnZlcnRlcnM9Z2V0VHlwZUNvbnZlcnRlcnModHlwZUNvbnZlcnRlcnMpO2lmKG15VHlwZUNvbnZlcnRlcnMubGVuZ3RoIT09bXlUeXBlcy5sZW5ndGgpe3Rocm93SW50ZXJuYWxFcnJvcigiTWlzbWF0Y2hlZCB0eXBlIGNvbnZlcnRlciBjb3VudCIpfWZvcih2YXIgaT0wO2k8bXlUeXBlcy5sZW5ndGg7KytpKXtyZWdpc3RlclR5cGUobXlUeXBlc1tpXSxteVR5cGVDb252ZXJ0ZXJzW2ldKX19dmFyIHR5cGVDb252ZXJ0ZXJzPW5ldyBBcnJheShkZXBlbmRlbnRUeXBlcy5sZW5ndGgpO3ZhciB1bnJlZ2lzdGVyZWRUeXBlcz1bXTt2YXIgcmVnaXN0ZXJlZD0wO2RlcGVuZGVudFR5cGVzLmZvckVhY2goKGR0LGkpPT57aWYocmVnaXN0ZXJlZFR5cGVzLmhhc093blByb3BlcnR5KGR0KSl7dHlwZUNvbnZlcnRlcnNbaV09cmVnaXN0ZXJlZFR5cGVzW2R0XX1lbHNle3VucmVnaXN0ZXJlZFR5cGVzLnB1c2goZHQpO2lmKCFhd2FpdGluZ0RlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShkdCkpe2F3YWl0aW5nRGVwZW5kZW5jaWVzW2R0XT1bXX1hd2FpdGluZ0RlcGVuZGVuY2llc1tkdF0ucHVzaCgoKT0+e3R5cGVDb252ZXJ0ZXJzW2ldPXJlZ2lzdGVyZWRUeXBlc1tkdF07KytyZWdpc3RlcmVkO2lmKHJlZ2lzdGVyZWQ9PT11bnJlZ2lzdGVyZWRUeXBlcy5sZW5ndGgpe29uQ29tcGxldGUodHlwZUNvbnZlcnRlcnMpfX0pfX0pO2lmKDA9PT11bnJlZ2lzdGVyZWRUeXBlcy5sZW5ndGgpe29uQ29tcGxldGUodHlwZUNvbnZlcnRlcnMpfX1mdW5jdGlvbiByZWdpc3RlclR5cGUocmF3VHlwZSxyZWdpc3RlcmVkSW5zdGFuY2Usb3B0aW9ucz17fSl7aWYoISgiYXJnUGFja0FkdmFuY2UiaW4gcmVnaXN0ZXJlZEluc3RhbmNlKSl7dGhyb3cgbmV3IFR5cGVFcnJvcigicmVnaXN0ZXJUeXBlIHJlZ2lzdGVyZWRJbnN0YW5jZSByZXF1aXJlcyBhcmdQYWNrQWR2YW5jZSIpfXZhciBuYW1lPXJlZ2lzdGVyZWRJbnN0YW5jZS5uYW1lO2lmKCFyYXdUeXBlKXt0aHJvd0JpbmRpbmdFcnJvcigndHlwZSAiJytuYW1lKyciIG11c3QgaGF2ZSBhIHBvc2l0aXZlIGludGVnZXIgdHlwZWlkIHBvaW50ZXInKX1pZihyZWdpc3RlcmVkVHlwZXMuaGFzT3duUHJvcGVydHkocmF3VHlwZSkpe2lmKG9wdGlvbnMuaWdub3JlRHVwbGljYXRlUmVnaXN0cmF0aW9ucyl7cmV0dXJufWVsc2V7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCByZWdpc3RlciB0eXBlICciK25hbWUrIicgdHdpY2UiKX19cmVnaXN0ZXJlZFR5cGVzW3Jhd1R5cGVdPXJlZ2lzdGVyZWRJbnN0YW5jZTtkZWxldGUgdHlwZURlcGVuZGVuY2llc1tyYXdUeXBlXTtpZihhd2FpdGluZ0RlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7dmFyIGNhbGxiYWNrcz1hd2FpdGluZ0RlcGVuZGVuY2llc1tyYXdUeXBlXTtkZWxldGUgYXdhaXRpbmdEZXBlbmRlbmNpZXNbcmF3VHlwZV07Y2FsbGJhY2tzLmZvckVhY2goY2I9PmNiKCkpfX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9ib29sKHJhd1R5cGUsbmFtZSxzaXplLHRydWVWYWx1ZSxmYWxzZVZhbHVlKXt2YXIgc2hpZnQ9Z2V0U2hpZnRGcm9tU2l6ZShzaXplKTtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbih3dCl7cmV0dXJuISF3dH0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLG8pe3JldHVybiBvP3RydWVWYWx1ZTpmYWxzZVZhbHVlfSwiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpmdW5jdGlvbihwb2ludGVyKXt2YXIgaGVhcDtpZihzaXplPT09MSl7aGVhcD1HUk9XQUJMRV9IRUFQX0k4KCl9ZWxzZSBpZihzaXplPT09Mil7aGVhcD1HUk9XQUJMRV9IRUFQX0kxNigpfWVsc2UgaWYoc2l6ZT09PTQpe2hlYXA9R1JPV0FCTEVfSEVBUF9JMzIoKX1lbHNle3Rocm93IG5ldyBUeXBlRXJyb3IoIlVua25vd24gYm9vbGVhbiB0eXBlIHNpemU6ICIrbmFtZSl9cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKGhlYXBbcG9pbnRlcj4+c2hpZnRdKX0sZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KX1mdW5jdGlvbiBDbGFzc0hhbmRsZV9pc0FsaWFzT2Yob3RoZXIpe2lmKCEodGhpcyBpbnN0YW5jZW9mIENsYXNzSGFuZGxlKSl7cmV0dXJuIGZhbHNlfWlmKCEob3RoZXIgaW5zdGFuY2VvZiBDbGFzc0hhbmRsZSkpe3JldHVybiBmYWxzZX12YXIgbGVmdENsYXNzPXRoaXMuJCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3M7dmFyIGxlZnQ9dGhpcy4kJC5wdHI7dmFyIHJpZ2h0Q2xhc3M9b3RoZXIuJCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3M7dmFyIHJpZ2h0PW90aGVyLiQkLnB0cjt3aGlsZShsZWZ0Q2xhc3MuYmFzZUNsYXNzKXtsZWZ0PWxlZnRDbGFzcy51cGNhc3QobGVmdCk7bGVmdENsYXNzPWxlZnRDbGFzcy5iYXNlQ2xhc3N9d2hpbGUocmlnaHRDbGFzcy5iYXNlQ2xhc3Mpe3JpZ2h0PXJpZ2h0Q2xhc3MudXBjYXN0KHJpZ2h0KTtyaWdodENsYXNzPXJpZ2h0Q2xhc3MuYmFzZUNsYXNzfXJldHVybiBsZWZ0Q2xhc3M9PT1yaWdodENsYXNzJiZsZWZ0PT09cmlnaHR9ZnVuY3Rpb24gc2hhbGxvd0NvcHlJbnRlcm5hbFBvaW50ZXIobyl7cmV0dXJue2NvdW50Om8uY291bnQsZGVsZXRlU2NoZWR1bGVkOm8uZGVsZXRlU2NoZWR1bGVkLHByZXNlcnZlUG9pbnRlck9uRGVsZXRlOm8ucHJlc2VydmVQb2ludGVyT25EZWxldGUscHRyOm8ucHRyLHB0clR5cGU6by5wdHJUeXBlLHNtYXJ0UHRyOm8uc21hcnRQdHIsc21hcnRQdHJUeXBlOm8uc21hcnRQdHJUeXBlfX1mdW5jdGlvbiB0aHJvd0luc3RhbmNlQWxyZWFkeURlbGV0ZWQob2JqKXtmdW5jdGlvbiBnZXRJbnN0YW5jZVR5cGVOYW1lKGhhbmRsZSl7cmV0dXJuIGhhbmRsZS4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzcy5uYW1lfXRocm93QmluZGluZ0Vycm9yKGdldEluc3RhbmNlVHlwZU5hbWUob2JqKSsiIGluc3RhbmNlIGFscmVhZHkgZGVsZXRlZCIpfXZhciBmaW5hbGl6YXRpb25SZWdpc3RyeT1mYWxzZTtmdW5jdGlvbiBkZXRhY2hGaW5hbGl6ZXIoaGFuZGxlKXt9ZnVuY3Rpb24gcnVuRGVzdHJ1Y3RvcigkJCl7aWYoJCQuc21hcnRQdHIpeyQkLnNtYXJ0UHRyVHlwZS5yYXdEZXN0cnVjdG9yKCQkLnNtYXJ0UHRyKX1lbHNleyQkLnB0clR5cGUucmVnaXN0ZXJlZENsYXNzLnJhd0Rlc3RydWN0b3IoJCQucHRyKX19ZnVuY3Rpb24gcmVsZWFzZUNsYXNzSGFuZGxlKCQkKXskJC5jb3VudC52YWx1ZS09MTt2YXIgdG9EZWxldGU9MD09PSQkLmNvdW50LnZhbHVlO2lmKHRvRGVsZXRlKXtydW5EZXN0cnVjdG9yKCQkKX19ZnVuY3Rpb24gZG93bmNhc3RQb2ludGVyKHB0cixwdHJDbGFzcyxkZXNpcmVkQ2xhc3Mpe2lmKHB0ckNsYXNzPT09ZGVzaXJlZENsYXNzKXtyZXR1cm4gcHRyfWlmKHVuZGVmaW5lZD09PWRlc2lyZWRDbGFzcy5iYXNlQ2xhc3Mpe3JldHVybiBudWxsfXZhciBydj1kb3duY2FzdFBvaW50ZXIocHRyLHB0ckNsYXNzLGRlc2lyZWRDbGFzcy5iYXNlQ2xhc3MpO2lmKHJ2PT09bnVsbCl7cmV0dXJuIG51bGx9cmV0dXJuIGRlc2lyZWRDbGFzcy5kb3duY2FzdChydil9dmFyIHJlZ2lzdGVyZWRQb2ludGVycz17fTtmdW5jdGlvbiBnZXRJbmhlcml0ZWRJbnN0YW5jZUNvdW50KCl7cmV0dXJuIE9iamVjdC5rZXlzKHJlZ2lzdGVyZWRJbnN0YW5jZXMpLmxlbmd0aH1mdW5jdGlvbiBnZXRMaXZlSW5oZXJpdGVkSW5zdGFuY2VzKCl7dmFyIHJ2PVtdO2Zvcih2YXIgayBpbiByZWdpc3RlcmVkSW5zdGFuY2VzKXtpZihyZWdpc3RlcmVkSW5zdGFuY2VzLmhhc093blByb3BlcnR5KGspKXtydi5wdXNoKHJlZ2lzdGVyZWRJbnN0YW5jZXNba10pfX1yZXR1cm4gcnZ9dmFyIGRlbGV0aW9uUXVldWU9W107ZnVuY3Rpb24gZmx1c2hQZW5kaW5nRGVsZXRlcygpe3doaWxlKGRlbGV0aW9uUXVldWUubGVuZ3RoKXt2YXIgb2JqPWRlbGV0aW9uUXVldWUucG9wKCk7b2JqLiQkLmRlbGV0ZVNjaGVkdWxlZD1mYWxzZTtvYmpbImRlbGV0ZSJdKCl9fXZhciBkZWxheUZ1bmN0aW9uPXVuZGVmaW5lZDtmdW5jdGlvbiBzZXREZWxheUZ1bmN0aW9uKGZuKXtkZWxheUZ1bmN0aW9uPWZuO2lmKGRlbGV0aW9uUXVldWUubGVuZ3RoJiZkZWxheUZ1bmN0aW9uKXtkZWxheUZ1bmN0aW9uKGZsdXNoUGVuZGluZ0RlbGV0ZXMpfX1mdW5jdGlvbiBpbml0X2VtYmluZCgpe01vZHVsZVsiZ2V0SW5oZXJpdGVkSW5zdGFuY2VDb3VudCJdPWdldEluaGVyaXRlZEluc3RhbmNlQ291bnQ7TW9kdWxlWyJnZXRMaXZlSW5oZXJpdGVkSW5zdGFuY2VzIl09Z2V0TGl2ZUluaGVyaXRlZEluc3RhbmNlcztNb2R1bGVbImZsdXNoUGVuZGluZ0RlbGV0ZXMiXT1mbHVzaFBlbmRpbmdEZWxldGVzO01vZHVsZVsic2V0RGVsYXlGdW5jdGlvbiJdPXNldERlbGF5RnVuY3Rpb259dmFyIHJlZ2lzdGVyZWRJbnN0YW5jZXM9e307ZnVuY3Rpb24gZ2V0QmFzZXN0UG9pbnRlcihjbGFzc18scHRyKXtpZihwdHI9PT11bmRlZmluZWQpe3Rocm93QmluZGluZ0Vycm9yKCJwdHIgc2hvdWxkIG5vdCBiZSB1bmRlZmluZWQiKX13aGlsZShjbGFzc18uYmFzZUNsYXNzKXtwdHI9Y2xhc3NfLnVwY2FzdChwdHIpO2NsYXNzXz1jbGFzc18uYmFzZUNsYXNzfXJldHVybiBwdHJ9ZnVuY3Rpb24gZ2V0SW5oZXJpdGVkSW5zdGFuY2UoY2xhc3NfLHB0cil7cHRyPWdldEJhc2VzdFBvaW50ZXIoY2xhc3NfLHB0cik7cmV0dXJuIHJlZ2lzdGVyZWRJbnN0YW5jZXNbcHRyXX1mdW5jdGlvbiBtYWtlQ2xhc3NIYW5kbGUocHJvdG90eXBlLHJlY29yZCl7aWYoIXJlY29yZC5wdHJUeXBlfHwhcmVjb3JkLnB0cil7dGhyb3dJbnRlcm5hbEVycm9yKCJtYWtlQ2xhc3NIYW5kbGUgcmVxdWlyZXMgcHRyIGFuZCBwdHJUeXBlIil9dmFyIGhhc1NtYXJ0UHRyVHlwZT0hIXJlY29yZC5zbWFydFB0clR5cGU7dmFyIGhhc1NtYXJ0UHRyPSEhcmVjb3JkLnNtYXJ0UHRyO2lmKGhhc1NtYXJ0UHRyVHlwZSE9PWhhc1NtYXJ0UHRyKXt0aHJvd0ludGVybmFsRXJyb3IoIkJvdGggc21hcnRQdHJUeXBlIGFuZCBzbWFydFB0ciBtdXN0IGJlIHNwZWNpZmllZCIpfXJlY29yZC5jb3VudD17dmFsdWU6MX07cmV0dXJuIGF0dGFjaEZpbmFsaXplcihPYmplY3QuY3JlYXRlKHByb3RvdHlwZSx7JCQ6e3ZhbHVlOnJlY29yZH19KSl9ZnVuY3Rpb24gUmVnaXN0ZXJlZFBvaW50ZXJfZnJvbVdpcmVUeXBlKHB0cil7dmFyIHJhd1BvaW50ZXI9dGhpcy5nZXRQb2ludGVlKHB0cik7aWYoIXJhd1BvaW50ZXIpe3RoaXMuZGVzdHJ1Y3RvcihwdHIpO3JldHVybiBudWxsfXZhciByZWdpc3RlcmVkSW5zdGFuY2U9Z2V0SW5oZXJpdGVkSW5zdGFuY2UodGhpcy5yZWdpc3RlcmVkQ2xhc3MscmF3UG9pbnRlcik7aWYodW5kZWZpbmVkIT09cmVnaXN0ZXJlZEluc3RhbmNlKXtpZigwPT09cmVnaXN0ZXJlZEluc3RhbmNlLiQkLmNvdW50LnZhbHVlKXtyZWdpc3RlcmVkSW5zdGFuY2UuJCQucHRyPXJhd1BvaW50ZXI7cmVnaXN0ZXJlZEluc3RhbmNlLiQkLnNtYXJ0UHRyPXB0cjtyZXR1cm4gcmVnaXN0ZXJlZEluc3RhbmNlWyJjbG9uZSJdKCl9ZWxzZXt2YXIgcnY9cmVnaXN0ZXJlZEluc3RhbmNlWyJjbG9uZSJdKCk7dGhpcy5kZXN0cnVjdG9yKHB0cik7cmV0dXJuIHJ2fX1mdW5jdGlvbiBtYWtlRGVmYXVsdEhhbmRsZSgpe2lmKHRoaXMuaXNTbWFydFBvaW50ZXIpe3JldHVybiBtYWtlQ2xhc3NIYW5kbGUodGhpcy5yZWdpc3RlcmVkQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGUse3B0clR5cGU6dGhpcy5wb2ludGVlVHlwZSxwdHI6cmF3UG9pbnRlcixzbWFydFB0clR5cGU6dGhpcyxzbWFydFB0cjpwdHJ9KX1lbHNle3JldHVybiBtYWtlQ2xhc3NIYW5kbGUodGhpcy5yZWdpc3RlcmVkQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGUse3B0clR5cGU6dGhpcyxwdHI6cHRyfSl9fXZhciBhY3R1YWxUeXBlPXRoaXMucmVnaXN0ZXJlZENsYXNzLmdldEFjdHVhbFR5cGUocmF3UG9pbnRlcik7dmFyIHJlZ2lzdGVyZWRQb2ludGVyUmVjb3JkPXJlZ2lzdGVyZWRQb2ludGVyc1thY3R1YWxUeXBlXTtpZighcmVnaXN0ZXJlZFBvaW50ZXJSZWNvcmQpe3JldHVybiBtYWtlRGVmYXVsdEhhbmRsZS5jYWxsKHRoaXMpfXZhciB0b1R5cGU7aWYodGhpcy5pc0NvbnN0KXt0b1R5cGU9cmVnaXN0ZXJlZFBvaW50ZXJSZWNvcmQuY29uc3RQb2ludGVyVHlwZX1lbHNle3RvVHlwZT1yZWdpc3RlcmVkUG9pbnRlclJlY29yZC5wb2ludGVyVHlwZX12YXIgZHA9ZG93bmNhc3RQb2ludGVyKHJhd1BvaW50ZXIsdGhpcy5yZWdpc3RlcmVkQ2xhc3MsdG9UeXBlLnJlZ2lzdGVyZWRDbGFzcyk7aWYoZHA9PT1udWxsKXtyZXR1cm4gbWFrZURlZmF1bHRIYW5kbGUuY2FsbCh0aGlzKX1pZih0aGlzLmlzU21hcnRQb2ludGVyKXtyZXR1cm4gbWFrZUNsYXNzSGFuZGxlKHRvVHlwZS5yZWdpc3RlcmVkQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGUse3B0clR5cGU6dG9UeXBlLHB0cjpkcCxzbWFydFB0clR5cGU6dGhpcyxzbWFydFB0cjpwdHJ9KX1lbHNle3JldHVybiBtYWtlQ2xhc3NIYW5kbGUodG9UeXBlLnJlZ2lzdGVyZWRDbGFzcy5pbnN0YW5jZVByb3RvdHlwZSx7cHRyVHlwZTp0b1R5cGUscHRyOmRwfSl9fWZ1bmN0aW9uIGF0dGFjaEZpbmFsaXplcihoYW5kbGUpe2lmKCJ1bmRlZmluZWQiPT09dHlwZW9mIEZpbmFsaXphdGlvblJlZ2lzdHJ5KXthdHRhY2hGaW5hbGl6ZXI9KGhhbmRsZT0+aGFuZGxlKTtyZXR1cm4gaGFuZGxlfWZpbmFsaXphdGlvblJlZ2lzdHJ5PW5ldyBGaW5hbGl6YXRpb25SZWdpc3RyeShpbmZvPT57cmVsZWFzZUNsYXNzSGFuZGxlKGluZm8uJCQpfSk7YXR0YWNoRmluYWxpemVyPShoYW5kbGU9Pnt2YXIgJCQ9aGFuZGxlLiQkO3ZhciBoYXNTbWFydFB0cj0hISQkLnNtYXJ0UHRyO2lmKGhhc1NtYXJ0UHRyKXt2YXIgaW5mbz17JCQ6JCR9O2ZpbmFsaXphdGlvblJlZ2lzdHJ5LnJlZ2lzdGVyKGhhbmRsZSxpbmZvLGhhbmRsZSl9cmV0dXJuIGhhbmRsZX0pO2RldGFjaEZpbmFsaXplcj0oaGFuZGxlPT5maW5hbGl6YXRpb25SZWdpc3RyeS51bnJlZ2lzdGVyKGhhbmRsZSkpO3JldHVybiBhdHRhY2hGaW5hbGl6ZXIoaGFuZGxlKX1mdW5jdGlvbiBDbGFzc0hhbmRsZV9jbG9uZSgpe2lmKCF0aGlzLiQkLnB0cil7dGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkKHRoaXMpfWlmKHRoaXMuJCQucHJlc2VydmVQb2ludGVyT25EZWxldGUpe3RoaXMuJCQuY291bnQudmFsdWUrPTE7cmV0dXJuIHRoaXN9ZWxzZXt2YXIgY2xvbmU9YXR0YWNoRmluYWxpemVyKE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLHskJDp7dmFsdWU6c2hhbGxvd0NvcHlJbnRlcm5hbFBvaW50ZXIodGhpcy4kJCl9fSkpO2Nsb25lLiQkLmNvdW50LnZhbHVlKz0xO2Nsb25lLiQkLmRlbGV0ZVNjaGVkdWxlZD1mYWxzZTtyZXR1cm4gY2xvbmV9fWZ1bmN0aW9uIENsYXNzSGFuZGxlX2RlbGV0ZSgpe2lmKCF0aGlzLiQkLnB0cil7dGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkKHRoaXMpfWlmKHRoaXMuJCQuZGVsZXRlU2NoZWR1bGVkJiYhdGhpcy4kJC5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSl7dGhyb3dCaW5kaW5nRXJyb3IoIk9iamVjdCBhbHJlYWR5IHNjaGVkdWxlZCBmb3IgZGVsZXRpb24iKX1kZXRhY2hGaW5hbGl6ZXIodGhpcyk7cmVsZWFzZUNsYXNzSGFuZGxlKHRoaXMuJCQpO2lmKCF0aGlzLiQkLnByZXNlcnZlUG9pbnRlck9uRGVsZXRlKXt0aGlzLiQkLnNtYXJ0UHRyPXVuZGVmaW5lZDt0aGlzLiQkLnB0cj11bmRlZmluZWR9fWZ1bmN0aW9uIENsYXNzSGFuZGxlX2lzRGVsZXRlZCgpe3JldHVybiF0aGlzLiQkLnB0cn1mdW5jdGlvbiBDbGFzc0hhbmRsZV9kZWxldGVMYXRlcigpe2lmKCF0aGlzLiQkLnB0cil7dGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkKHRoaXMpfWlmKHRoaXMuJCQuZGVsZXRlU2NoZWR1bGVkJiYhdGhpcy4kJC5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSl7dGhyb3dCaW5kaW5nRXJyb3IoIk9iamVjdCBhbHJlYWR5IHNjaGVkdWxlZCBmb3IgZGVsZXRpb24iKX1kZWxldGlvblF1ZXVlLnB1c2godGhpcyk7aWYoZGVsZXRpb25RdWV1ZS5sZW5ndGg9PT0xJiZkZWxheUZ1bmN0aW9uKXtkZWxheUZ1bmN0aW9uKGZsdXNoUGVuZGluZ0RlbGV0ZXMpfXRoaXMuJCQuZGVsZXRlU2NoZWR1bGVkPXRydWU7cmV0dXJuIHRoaXN9ZnVuY3Rpb24gaW5pdF9DbGFzc0hhbmRsZSgpe0NsYXNzSGFuZGxlLnByb3RvdHlwZVsiaXNBbGlhc09mIl09Q2xhc3NIYW5kbGVfaXNBbGlhc09mO0NsYXNzSGFuZGxlLnByb3RvdHlwZVsiY2xvbmUiXT1DbGFzc0hhbmRsZV9jbG9uZTtDbGFzc0hhbmRsZS5wcm90b3R5cGVbImRlbGV0ZSJdPUNsYXNzSGFuZGxlX2RlbGV0ZTtDbGFzc0hhbmRsZS5wcm90b3R5cGVbImlzRGVsZXRlZCJdPUNsYXNzSGFuZGxlX2lzRGVsZXRlZDtDbGFzc0hhbmRsZS5wcm90b3R5cGVbImRlbGV0ZUxhdGVyIl09Q2xhc3NIYW5kbGVfZGVsZXRlTGF0ZXJ9ZnVuY3Rpb24gQ2xhc3NIYW5kbGUoKXt9ZnVuY3Rpb24gZW5zdXJlT3ZlcmxvYWRUYWJsZShwcm90byxtZXRob2ROYW1lLGh1bWFuTmFtZSl7aWYodW5kZWZpbmVkPT09cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZSl7dmFyIHByZXZGdW5jPXByb3RvW21ldGhvZE5hbWVdO3Byb3RvW21ldGhvZE5hbWVdPWZ1bmN0aW9uKCl7aWYoIXByb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGUuaGFzT3duUHJvcGVydHkoYXJndW1lbnRzLmxlbmd0aCkpe3Rocm93QmluZGluZ0Vycm9yKCJGdW5jdGlvbiAnIitodW1hbk5hbWUrIicgY2FsbGVkIHdpdGggYW4gaW52YWxpZCBudW1iZXIgb2YgYXJndW1lbnRzICgiK2FyZ3VtZW50cy5sZW5ndGgrIikgLSBleHBlY3RzIG9uZSBvZiAoIitwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlKyIpISIpfXJldHVybiBwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlW2FyZ3VtZW50cy5sZW5ndGhdLmFwcGx5KHRoaXMsYXJndW1lbnRzKX07cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZT1bXTtwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlW3ByZXZGdW5jLmFyZ0NvdW50XT1wcmV2RnVuY319ZnVuY3Rpb24gZXhwb3NlUHVibGljU3ltYm9sKG5hbWUsdmFsdWUsbnVtQXJndW1lbnRzKXtpZihNb2R1bGUuaGFzT3duUHJvcGVydHkobmFtZSkpe2lmKHVuZGVmaW5lZD09PW51bUFyZ3VtZW50c3x8dW5kZWZpbmVkIT09TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGUmJnVuZGVmaW5lZCE9PU1vZHVsZVtuYW1lXS5vdmVybG9hZFRhYmxlW251bUFyZ3VtZW50c10pe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgcmVnaXN0ZXIgcHVibGljIG5hbWUgJyIrbmFtZSsiJyB0d2ljZSIpfWVuc3VyZU92ZXJsb2FkVGFibGUoTW9kdWxlLG5hbWUsbmFtZSk7aWYoTW9kdWxlLmhhc093blByb3BlcnR5KG51bUFyZ3VtZW50cykpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgcmVnaXN0ZXIgbXVsdGlwbGUgb3ZlcmxvYWRzIG9mIGEgZnVuY3Rpb24gd2l0aCB0aGUgc2FtZSBudW1iZXIgb2YgYXJndW1lbnRzICgiK251bUFyZ3VtZW50cysiKSEiKX1Nb2R1bGVbbmFtZV0ub3ZlcmxvYWRUYWJsZVtudW1Bcmd1bWVudHNdPXZhbHVlfWVsc2V7TW9kdWxlW25hbWVdPXZhbHVlO2lmKHVuZGVmaW5lZCE9PW51bUFyZ3VtZW50cyl7TW9kdWxlW25hbWVdLm51bUFyZ3VtZW50cz1udW1Bcmd1bWVudHN9fX1mdW5jdGlvbiBSZWdpc3RlcmVkQ2xhc3MobmFtZSxjb25zdHJ1Y3RvcixpbnN0YW5jZVByb3RvdHlwZSxyYXdEZXN0cnVjdG9yLGJhc2VDbGFzcyxnZXRBY3R1YWxUeXBlLHVwY2FzdCxkb3duY2FzdCl7dGhpcy5uYW1lPW5hbWU7dGhpcy5jb25zdHJ1Y3Rvcj1jb25zdHJ1Y3Rvcjt0aGlzLmluc3RhbmNlUHJvdG90eXBlPWluc3RhbmNlUHJvdG90eXBlO3RoaXMucmF3RGVzdHJ1Y3Rvcj1yYXdEZXN0cnVjdG9yO3RoaXMuYmFzZUNsYXNzPWJhc2VDbGFzczt0aGlzLmdldEFjdHVhbFR5cGU9Z2V0QWN0dWFsVHlwZTt0aGlzLnVwY2FzdD11cGNhc3Q7dGhpcy5kb3duY2FzdD1kb3duY2FzdDt0aGlzLnB1cmVWaXJ0dWFsRnVuY3Rpb25zPVtdfWZ1bmN0aW9uIHVwY2FzdFBvaW50ZXIocHRyLHB0ckNsYXNzLGRlc2lyZWRDbGFzcyl7d2hpbGUocHRyQ2xhc3MhPT1kZXNpcmVkQ2xhc3Mpe2lmKCFwdHJDbGFzcy51cGNhc3Qpe3Rocm93QmluZGluZ0Vycm9yKCJFeHBlY3RlZCBudWxsIG9yIGluc3RhbmNlIG9mICIrZGVzaXJlZENsYXNzLm5hbWUrIiwgZ290IGFuIGluc3RhbmNlIG9mICIrcHRyQ2xhc3MubmFtZSl9cHRyPXB0ckNsYXNzLnVwY2FzdChwdHIpO3B0ckNsYXNzPXB0ckNsYXNzLmJhc2VDbGFzc31yZXR1cm4gcHRyfWZ1bmN0aW9uIGNvbnN0Tm9TbWFydFB0clJhd1BvaW50ZXJUb1dpcmVUeXBlKGRlc3RydWN0b3JzLGhhbmRsZSl7aWYoaGFuZGxlPT09bnVsbCl7aWYodGhpcy5pc1JlZmVyZW5jZSl7dGhyb3dCaW5kaW5nRXJyb3IoIm51bGwgaXMgbm90IGEgdmFsaWQgIit0aGlzLm5hbWUpfXJldHVybiAwfWlmKCFoYW5kbGUuJCQpe3Rocm93QmluZGluZ0Vycm9yKCdDYW5ub3QgcGFzcyAiJytfZW1iaW5kX3JlcHIoaGFuZGxlKSsnIiBhcyBhICcrdGhpcy5uYW1lKX1pZighaGFuZGxlLiQkLnB0cil7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBwYXNzIGRlbGV0ZWQgb2JqZWN0IGFzIGEgcG9pbnRlciBvZiB0eXBlICIrdGhpcy5uYW1lKX12YXIgaGFuZGxlQ2xhc3M9aGFuZGxlLiQkLnB0clR5cGUucmVnaXN0ZXJlZENsYXNzO3ZhciBwdHI9dXBjYXN0UG9pbnRlcihoYW5kbGUuJCQucHRyLGhhbmRsZUNsYXNzLHRoaXMucmVnaXN0ZXJlZENsYXNzKTtyZXR1cm4gcHRyfWZ1bmN0aW9uIGdlbmVyaWNQb2ludGVyVG9XaXJlVHlwZShkZXN0cnVjdG9ycyxoYW5kbGUpe3ZhciBwdHI7aWYoaGFuZGxlPT09bnVsbCl7aWYodGhpcy5pc1JlZmVyZW5jZSl7dGhyb3dCaW5kaW5nRXJyb3IoIm51bGwgaXMgbm90IGEgdmFsaWQgIit0aGlzLm5hbWUpfWlmKHRoaXMuaXNTbWFydFBvaW50ZXIpe3B0cj10aGlzLnJhd0NvbnN0cnVjdG9yKCk7aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKHRoaXMucmF3RGVzdHJ1Y3RvcixwdHIpfXJldHVybiBwdHJ9ZWxzZXtyZXR1cm4gMH19aWYoIWhhbmRsZS4kJCl7dGhyb3dCaW5kaW5nRXJyb3IoJ0Nhbm5vdCBwYXNzICInK19lbWJpbmRfcmVwcihoYW5kbGUpKyciIGFzIGEgJyt0aGlzLm5hbWUpfWlmKCFoYW5kbGUuJCQucHRyKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHBhc3MgZGVsZXRlZCBvYmplY3QgYXMgYSBwb2ludGVyIG9mIHR5cGUgIit0aGlzLm5hbWUpfWlmKCF0aGlzLmlzQ29uc3QmJmhhbmRsZS4kJC5wdHJUeXBlLmlzQ29uc3Qpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgY29udmVydCBhcmd1bWVudCBvZiB0eXBlICIrKGhhbmRsZS4kJC5zbWFydFB0clR5cGU/aGFuZGxlLiQkLnNtYXJ0UHRyVHlwZS5uYW1lOmhhbmRsZS4kJC5wdHJUeXBlLm5hbWUpKyIgdG8gcGFyYW1ldGVyIHR5cGUgIit0aGlzLm5hbWUpfXZhciBoYW5kbGVDbGFzcz1oYW5kbGUuJCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3M7cHRyPXVwY2FzdFBvaW50ZXIoaGFuZGxlLiQkLnB0cixoYW5kbGVDbGFzcyx0aGlzLnJlZ2lzdGVyZWRDbGFzcyk7aWYodGhpcy5pc1NtYXJ0UG9pbnRlcil7aWYodW5kZWZpbmVkPT09aGFuZGxlLiQkLnNtYXJ0UHRyKXt0aHJvd0JpbmRpbmdFcnJvcigiUGFzc2luZyByYXcgcG9pbnRlciB0byBzbWFydCBwb2ludGVyIGlzIGlsbGVnYWwiKX1zd2l0Y2godGhpcy5zaGFyaW5nUG9saWN5KXtjYXNlIDA6aWYoaGFuZGxlLiQkLnNtYXJ0UHRyVHlwZT09PXRoaXMpe3B0cj1oYW5kbGUuJCQuc21hcnRQdHJ9ZWxzZXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IGNvbnZlcnQgYXJndW1lbnQgb2YgdHlwZSAiKyhoYW5kbGUuJCQuc21hcnRQdHJUeXBlP2hhbmRsZS4kJC5zbWFydFB0clR5cGUubmFtZTpoYW5kbGUuJCQucHRyVHlwZS5uYW1lKSsiIHRvIHBhcmFtZXRlciB0eXBlICIrdGhpcy5uYW1lKX1icmVhaztjYXNlIDE6cHRyPWhhbmRsZS4kJC5zbWFydFB0cjticmVhaztjYXNlIDI6aWYoaGFuZGxlLiQkLnNtYXJ0UHRyVHlwZT09PXRoaXMpe3B0cj1oYW5kbGUuJCQuc21hcnRQdHJ9ZWxzZXt2YXIgY2xvbmVkSGFuZGxlPWhhbmRsZVsiY2xvbmUiXSgpO3B0cj10aGlzLnJhd1NoYXJlKHB0cixFbXZhbC50b0hhbmRsZShmdW5jdGlvbigpe2Nsb25lZEhhbmRsZVsiZGVsZXRlIl0oKX0pKTtpZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2godGhpcy5yYXdEZXN0cnVjdG9yLHB0cil9fWJyZWFrO2RlZmF1bHQ6dGhyb3dCaW5kaW5nRXJyb3IoIlVuc3VwcG9ydGluZyBzaGFyaW5nIHBvbGljeSIpfX1yZXR1cm4gcHRyfWZ1bmN0aW9uIG5vbkNvbnN0Tm9TbWFydFB0clJhd1BvaW50ZXJUb1dpcmVUeXBlKGRlc3RydWN0b3JzLGhhbmRsZSl7aWYoaGFuZGxlPT09bnVsbCl7aWYodGhpcy5pc1JlZmVyZW5jZSl7dGhyb3dCaW5kaW5nRXJyb3IoIm51bGwgaXMgbm90IGEgdmFsaWQgIit0aGlzLm5hbWUpfXJldHVybiAwfWlmKCFoYW5kbGUuJCQpe3Rocm93QmluZGluZ0Vycm9yKCdDYW5ub3QgcGFzcyAiJytfZW1iaW5kX3JlcHIoaGFuZGxlKSsnIiBhcyBhICcrdGhpcy5uYW1lKX1pZighaGFuZGxlLiQkLnB0cil7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBwYXNzIGRlbGV0ZWQgb2JqZWN0IGFzIGEgcG9pbnRlciBvZiB0eXBlICIrdGhpcy5uYW1lKX1pZihoYW5kbGUuJCQucHRyVHlwZS5pc0NvbnN0KXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IGNvbnZlcnQgYXJndW1lbnQgb2YgdHlwZSAiK2hhbmRsZS4kJC5wdHJUeXBlLm5hbWUrIiB0byBwYXJhbWV0ZXIgdHlwZSAiK3RoaXMubmFtZSl9dmFyIGhhbmRsZUNsYXNzPWhhbmRsZS4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgcHRyPXVwY2FzdFBvaW50ZXIoaGFuZGxlLiQkLnB0cixoYW5kbGVDbGFzcyx0aGlzLnJlZ2lzdGVyZWRDbGFzcyk7cmV0dXJuIHB0cn1mdW5jdGlvbiBzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oR1JPV0FCTEVfSEVBUF9VMzIoKVtwb2ludGVyPj4yXSl9ZnVuY3Rpb24gUmVnaXN0ZXJlZFBvaW50ZXJfZ2V0UG9pbnRlZShwdHIpe2lmKHRoaXMucmF3R2V0UG9pbnRlZSl7cHRyPXRoaXMucmF3R2V0UG9pbnRlZShwdHIpfXJldHVybiBwdHJ9ZnVuY3Rpb24gUmVnaXN0ZXJlZFBvaW50ZXJfZGVzdHJ1Y3RvcihwdHIpe2lmKHRoaXMucmF3RGVzdHJ1Y3Rvcil7dGhpcy5yYXdEZXN0cnVjdG9yKHB0cil9fWZ1bmN0aW9uIFJlZ2lzdGVyZWRQb2ludGVyX2RlbGV0ZU9iamVjdChoYW5kbGUpe2lmKGhhbmRsZSE9PW51bGwpe2hhbmRsZVsiZGVsZXRlIl0oKX19ZnVuY3Rpb24gaW5pdF9SZWdpc3RlcmVkUG9pbnRlcigpe1JlZ2lzdGVyZWRQb2ludGVyLnByb3RvdHlwZS5nZXRQb2ludGVlPVJlZ2lzdGVyZWRQb2ludGVyX2dldFBvaW50ZWU7UmVnaXN0ZXJlZFBvaW50ZXIucHJvdG90eXBlLmRlc3RydWN0b3I9UmVnaXN0ZXJlZFBvaW50ZXJfZGVzdHJ1Y3RvcjtSZWdpc3RlcmVkUG9pbnRlci5wcm90b3R5cGVbImFyZ1BhY2tBZHZhbmNlIl09ODtSZWdpc3RlcmVkUG9pbnRlci5wcm90b3R5cGVbInJlYWRWYWx1ZUZyb21Qb2ludGVyIl09c2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXI7UmVnaXN0ZXJlZFBvaW50ZXIucHJvdG90eXBlWyJkZWxldGVPYmplY3QiXT1SZWdpc3RlcmVkUG9pbnRlcl9kZWxldGVPYmplY3Q7UmVnaXN0ZXJlZFBvaW50ZXIucHJvdG90eXBlWyJmcm9tV2lyZVR5cGUiXT1SZWdpc3RlcmVkUG9pbnRlcl9mcm9tV2lyZVR5cGV9ZnVuY3Rpb24gUmVnaXN0ZXJlZFBvaW50ZXIobmFtZSxyZWdpc3RlcmVkQ2xhc3MsaXNSZWZlcmVuY2UsaXNDb25zdCxpc1NtYXJ0UG9pbnRlcixwb2ludGVlVHlwZSxzaGFyaW5nUG9saWN5LHJhd0dldFBvaW50ZWUscmF3Q29uc3RydWN0b3IscmF3U2hhcmUscmF3RGVzdHJ1Y3Rvcil7dGhpcy5uYW1lPW5hbWU7dGhpcy5yZWdpc3RlcmVkQ2xhc3M9cmVnaXN0ZXJlZENsYXNzO3RoaXMuaXNSZWZlcmVuY2U9aXNSZWZlcmVuY2U7dGhpcy5pc0NvbnN0PWlzQ29uc3Q7dGhpcy5pc1NtYXJ0UG9pbnRlcj1pc1NtYXJ0UG9pbnRlcjt0aGlzLnBvaW50ZWVUeXBlPXBvaW50ZWVUeXBlO3RoaXMuc2hhcmluZ1BvbGljeT1zaGFyaW5nUG9saWN5O3RoaXMucmF3R2V0UG9pbnRlZT1yYXdHZXRQb2ludGVlO3RoaXMucmF3Q29uc3RydWN0b3I9cmF3Q29uc3RydWN0b3I7dGhpcy5yYXdTaGFyZT1yYXdTaGFyZTt0aGlzLnJhd0Rlc3RydWN0b3I9cmF3RGVzdHJ1Y3RvcjtpZighaXNTbWFydFBvaW50ZXImJnJlZ2lzdGVyZWRDbGFzcy5iYXNlQ2xhc3M9PT11bmRlZmluZWQpe2lmKGlzQ29uc3Qpe3RoaXNbInRvV2lyZVR5cGUiXT1jb25zdE5vU21hcnRQdHJSYXdQb2ludGVyVG9XaXJlVHlwZTt0aGlzLmRlc3RydWN0b3JGdW5jdGlvbj1udWxsfWVsc2V7dGhpc1sidG9XaXJlVHlwZSJdPW5vbkNvbnN0Tm9TbWFydFB0clJhd1BvaW50ZXJUb1dpcmVUeXBlO3RoaXMuZGVzdHJ1Y3RvckZ1bmN0aW9uPW51bGx9fWVsc2V7dGhpc1sidG9XaXJlVHlwZSJdPWdlbmVyaWNQb2ludGVyVG9XaXJlVHlwZX19ZnVuY3Rpb24gcmVwbGFjZVB1YmxpY1N5bWJvbChuYW1lLHZhbHVlLG51bUFyZ3VtZW50cyl7aWYoIU1vZHVsZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSl7dGhyb3dJbnRlcm5hbEVycm9yKCJSZXBsYWNpbmcgbm9uZXhpc3RhbnQgcHVibGljIHN5bWJvbCIpfWlmKHVuZGVmaW5lZCE9PU1vZHVsZVtuYW1lXS5vdmVybG9hZFRhYmxlJiZ1bmRlZmluZWQhPT1udW1Bcmd1bWVudHMpe01vZHVsZVtuYW1lXS5vdmVybG9hZFRhYmxlW251bUFyZ3VtZW50c109dmFsdWV9ZWxzZXtNb2R1bGVbbmFtZV09dmFsdWU7TW9kdWxlW25hbWVdLmFyZ0NvdW50PW51bUFyZ3VtZW50c319ZnVuY3Rpb24gZHluQ2FsbExlZ2FjeShzaWcscHRyLGFyZ3Mpe3ZhciBmPU1vZHVsZVsiZHluQ2FsbF8iK3NpZ107cmV0dXJuIGFyZ3MmJmFyZ3MubGVuZ3RoP2YuYXBwbHkobnVsbCxbcHRyXS5jb25jYXQoYXJncykpOmYuY2FsbChudWxsLHB0cil9ZnVuY3Rpb24gZHluQ2FsbChzaWcscHRyLGFyZ3Mpe2lmKHNpZy5pbmNsdWRlcygiaiIpKXtyZXR1cm4gZHluQ2FsbExlZ2FjeShzaWcscHRyLGFyZ3MpfXJldHVybiBnZXRXYXNtVGFibGVFbnRyeShwdHIpLmFwcGx5KG51bGwsYXJncyl9ZnVuY3Rpb24gZ2V0RHluQ2FsbGVyKHNpZyxwdHIpe3ZhciBhcmdDYWNoZT1bXTtyZXR1cm4gZnVuY3Rpb24oKXthcmdDYWNoZS5sZW5ndGg9MDtPYmplY3QuYXNzaWduKGFyZ0NhY2hlLGFyZ3VtZW50cyk7cmV0dXJuIGR5bkNhbGwoc2lnLHB0cixhcmdDYWNoZSl9fWZ1bmN0aW9uIGVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKHNpZ25hdHVyZSxyYXdGdW5jdGlvbil7c2lnbmF0dXJlPXJlYWRMYXRpbjFTdHJpbmcoc2lnbmF0dXJlKTtmdW5jdGlvbiBtYWtlRHluQ2FsbGVyKCl7aWYoc2lnbmF0dXJlLmluY2x1ZGVzKCJqIikpe3JldHVybiBnZXREeW5DYWxsZXIoc2lnbmF0dXJlLHJhd0Z1bmN0aW9uKX1yZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkocmF3RnVuY3Rpb24pfXZhciBmcD1tYWtlRHluQ2FsbGVyKCk7aWYodHlwZW9mIGZwIT0iZnVuY3Rpb24iKXt0aHJvd0JpbmRpbmdFcnJvcigidW5rbm93biBmdW5jdGlvbiBwb2ludGVyIHdpdGggc2lnbmF0dXJlICIrc2lnbmF0dXJlKyI6ICIrcmF3RnVuY3Rpb24pfXJldHVybiBmcH12YXIgVW5ib3VuZFR5cGVFcnJvcj11bmRlZmluZWQ7ZnVuY3Rpb24gZ2V0VHlwZU5hbWUodHlwZSl7dmFyIHB0cj1fX19nZXRUeXBlTmFtZSh0eXBlKTt2YXIgcnY9cmVhZExhdGluMVN0cmluZyhwdHIpO19mcmVlKHB0cik7cmV0dXJuIHJ2fWZ1bmN0aW9uIHRocm93VW5ib3VuZFR5cGVFcnJvcihtZXNzYWdlLHR5cGVzKXt2YXIgdW5ib3VuZFR5cGVzPVtdO3ZhciBzZWVuPXt9O2Z1bmN0aW9uIHZpc2l0KHR5cGUpe2lmKHNlZW5bdHlwZV0pe3JldHVybn1pZihyZWdpc3RlcmVkVHlwZXNbdHlwZV0pe3JldHVybn1pZih0eXBlRGVwZW5kZW5jaWVzW3R5cGVdKXt0eXBlRGVwZW5kZW5jaWVzW3R5cGVdLmZvckVhY2godmlzaXQpO3JldHVybn11bmJvdW5kVHlwZXMucHVzaCh0eXBlKTtzZWVuW3R5cGVdPXRydWV9dHlwZXMuZm9yRWFjaCh2aXNpdCk7dGhyb3cgbmV3IFVuYm91bmRUeXBlRXJyb3IobWVzc2FnZSsiOiAiK3VuYm91bmRUeXBlcy5tYXAoZ2V0VHlwZU5hbWUpLmpvaW4oWyIsICJdKSl9ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfY2xhc3MocmF3VHlwZSxyYXdQb2ludGVyVHlwZSxyYXdDb25zdFBvaW50ZXJUeXBlLGJhc2VDbGFzc1Jhd1R5cGUsZ2V0QWN0dWFsVHlwZVNpZ25hdHVyZSxnZXRBY3R1YWxUeXBlLHVwY2FzdFNpZ25hdHVyZSx1cGNhc3QsZG93bmNhc3RTaWduYXR1cmUsZG93bmNhc3QsbmFtZSxkZXN0cnVjdG9yU2lnbmF0dXJlLHJhd0Rlc3RydWN0b3Ipe25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtnZXRBY3R1YWxUeXBlPWVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKGdldEFjdHVhbFR5cGVTaWduYXR1cmUsZ2V0QWN0dWFsVHlwZSk7aWYodXBjYXN0KXt1cGNhc3Q9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24odXBjYXN0U2lnbmF0dXJlLHVwY2FzdCl9aWYoZG93bmNhc3Qpe2Rvd25jYXN0PWVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKGRvd25jYXN0U2lnbmF0dXJlLGRvd25jYXN0KX1yYXdEZXN0cnVjdG9yPWVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKGRlc3RydWN0b3JTaWduYXR1cmUscmF3RGVzdHJ1Y3Rvcik7dmFyIGxlZ2FsRnVuY3Rpb25OYW1lPW1ha2VMZWdhbEZ1bmN0aW9uTmFtZShuYW1lKTtleHBvc2VQdWJsaWNTeW1ib2wobGVnYWxGdW5jdGlvbk5hbWUsZnVuY3Rpb24oKXt0aHJvd1VuYm91bmRUeXBlRXJyb3IoIkNhbm5vdCBjb25zdHJ1Y3QgIituYW1lKyIgZHVlIHRvIHVuYm91bmQgdHlwZXMiLFtiYXNlQ2xhc3NSYXdUeXBlXSl9KTt3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbcmF3VHlwZSxyYXdQb2ludGVyVHlwZSxyYXdDb25zdFBvaW50ZXJUeXBlXSxiYXNlQ2xhc3NSYXdUeXBlP1tiYXNlQ2xhc3NSYXdUeXBlXTpbXSxmdW5jdGlvbihiYXNlKXtiYXNlPWJhc2VbMF07dmFyIGJhc2VDbGFzczt2YXIgYmFzZVByb3RvdHlwZTtpZihiYXNlQ2xhc3NSYXdUeXBlKXtiYXNlQ2xhc3M9YmFzZS5yZWdpc3RlcmVkQ2xhc3M7YmFzZVByb3RvdHlwZT1iYXNlQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGV9ZWxzZXtiYXNlUHJvdG90eXBlPUNsYXNzSGFuZGxlLnByb3RvdHlwZX12YXIgY29uc3RydWN0b3I9Y3JlYXRlTmFtZWRGdW5jdGlvbihsZWdhbEZ1bmN0aW9uTmFtZSxmdW5jdGlvbigpe2lmKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSE9PWluc3RhbmNlUHJvdG90eXBlKXt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKCJVc2UgJ25ldycgdG8gY29uc3RydWN0ICIrbmFtZSl9aWYodW5kZWZpbmVkPT09cmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHkpe3Rocm93IG5ldyBCaW5kaW5nRXJyb3IobmFtZSsiIGhhcyBubyBhY2Nlc3NpYmxlIGNvbnN0cnVjdG9yIil9dmFyIGJvZHk9cmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHlbYXJndW1lbnRzLmxlbmd0aF07aWYodW5kZWZpbmVkPT09Ym9keSl7dGhyb3cgbmV3IEJpbmRpbmdFcnJvcigiVHJpZWQgdG8gaW52b2tlIGN0b3Igb2YgIituYW1lKyIgd2l0aCBpbnZhbGlkIG51bWJlciBvZiBwYXJhbWV0ZXJzICgiK2FyZ3VtZW50cy5sZW5ndGgrIikgLSBleHBlY3RlZCAoIitPYmplY3Qua2V5cyhyZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keSkudG9TdHJpbmcoKSsiKSBwYXJhbWV0ZXJzIGluc3RlYWQhIil9cmV0dXJuIGJvZHkuYXBwbHkodGhpcyxhcmd1bWVudHMpfSk7dmFyIGluc3RhbmNlUHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYmFzZVByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOmNvbnN0cnVjdG9yfX0pO2NvbnN0cnVjdG9yLnByb3RvdHlwZT1pbnN0YW5jZVByb3RvdHlwZTt2YXIgcmVnaXN0ZXJlZENsYXNzPW5ldyBSZWdpc3RlcmVkQ2xhc3MobmFtZSxjb25zdHJ1Y3RvcixpbnN0YW5jZVByb3RvdHlwZSxyYXdEZXN0cnVjdG9yLGJhc2VDbGFzcyxnZXRBY3R1YWxUeXBlLHVwY2FzdCxkb3duY2FzdCk7dmFyIHJlZmVyZW5jZUNvbnZlcnRlcj1uZXcgUmVnaXN0ZXJlZFBvaW50ZXIobmFtZSxyZWdpc3RlcmVkQ2xhc3MsdHJ1ZSxmYWxzZSxmYWxzZSk7dmFyIHBvaW50ZXJDb252ZXJ0ZXI9bmV3IFJlZ2lzdGVyZWRQb2ludGVyKG5hbWUrIioiLHJlZ2lzdGVyZWRDbGFzcyxmYWxzZSxmYWxzZSxmYWxzZSk7dmFyIGNvbnN0UG9pbnRlckNvbnZlcnRlcj1uZXcgUmVnaXN0ZXJlZFBvaW50ZXIobmFtZSsiIGNvbnN0KiIscmVnaXN0ZXJlZENsYXNzLGZhbHNlLHRydWUsZmFsc2UpO3JlZ2lzdGVyZWRQb2ludGVyc1tyYXdUeXBlXT17cG9pbnRlclR5cGU6cG9pbnRlckNvbnZlcnRlcixjb25zdFBvaW50ZXJUeXBlOmNvbnN0UG9pbnRlckNvbnZlcnRlcn07cmVwbGFjZVB1YmxpY1N5bWJvbChsZWdhbEZ1bmN0aW9uTmFtZSxjb25zdHJ1Y3Rvcik7cmV0dXJuW3JlZmVyZW5jZUNvbnZlcnRlcixwb2ludGVyQ29udmVydGVyLGNvbnN0UG9pbnRlckNvbnZlcnRlcl19KX1mdW5jdGlvbiBoZWFwMzJWZWN0b3JUb0FycmF5KGNvdW50LGZpcnN0RWxlbWVudCl7dmFyIGFycmF5PVtdO2Zvcih2YXIgaT0wO2k8Y291bnQ7aSsrKXthcnJheS5wdXNoKEdST1dBQkxFX0hFQVBfSTMyKClbKGZpcnN0RWxlbWVudD4+MikraV0pfXJldHVybiBhcnJheX1mdW5jdGlvbiBydW5EZXN0cnVjdG9ycyhkZXN0cnVjdG9ycyl7d2hpbGUoZGVzdHJ1Y3RvcnMubGVuZ3RoKXt2YXIgcHRyPWRlc3RydWN0b3JzLnBvcCgpO3ZhciBkZWw9ZGVzdHJ1Y3RvcnMucG9wKCk7ZGVsKHB0cil9fWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2NvbnN0cnVjdG9yKHJhd0NsYXNzVHlwZSxhcmdDb3VudCxyYXdBcmdUeXBlc0FkZHIsaW52b2tlclNpZ25hdHVyZSxpbnZva2VyLHJhd0NvbnN0cnVjdG9yKXthc3NlcnQoYXJnQ291bnQ+MCk7dmFyIHJhd0FyZ1R5cGVzPWhlYXAzMlZlY3RvclRvQXJyYXkoYXJnQ291bnQscmF3QXJnVHlwZXNBZGRyKTtpbnZva2VyPWVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKGludm9rZXJTaWduYXR1cmUsaW52b2tlcik7d2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQoW10sW3Jhd0NsYXNzVHlwZV0sZnVuY3Rpb24oY2xhc3NUeXBlKXtjbGFzc1R5cGU9Y2xhc3NUeXBlWzBdO3ZhciBodW1hbk5hbWU9ImNvbnN0cnVjdG9yICIrY2xhc3NUeXBlLm5hbWU7aWYodW5kZWZpbmVkPT09Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5KXtjbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHk9W119aWYodW5kZWZpbmVkIT09Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5W2FyZ0NvdW50LTFdKXt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKCJDYW5ub3QgcmVnaXN0ZXIgbXVsdGlwbGUgY29uc3RydWN0b3JzIHdpdGggaWRlbnRpY2FsIG51bWJlciBvZiBwYXJhbWV0ZXJzICgiKyhhcmdDb3VudC0xKSsiKSBmb3IgY2xhc3MgJyIrY2xhc3NUeXBlLm5hbWUrIichIE92ZXJsb2FkIHJlc29sdXRpb24gaXMgY3VycmVudGx5IG9ubHkgcGVyZm9ybWVkIHVzaW5nIHRoZSBwYXJhbWV0ZXIgY291bnQsIG5vdCBhY3R1YWwgdHlwZSBpbmZvISIpfWNsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keVthcmdDb3VudC0xXT0oKCk9Pnt0aHJvd1VuYm91bmRUeXBlRXJyb3IoIkNhbm5vdCBjb25zdHJ1Y3QgIitjbGFzc1R5cGUubmFtZSsiIGR1ZSB0byB1bmJvdW5kIHR5cGVzIixyYXdBcmdUeXBlcyl9KTt3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxyYXdBcmdUeXBlcyxmdW5jdGlvbihhcmdUeXBlcyl7YXJnVHlwZXMuc3BsaWNlKDEsMCxudWxsKTtjbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHlbYXJnQ291bnQtMV09Y3JhZnRJbnZva2VyRnVuY3Rpb24oaHVtYW5OYW1lLGFyZ1R5cGVzLG51bGwsaW52b2tlcixyYXdDb25zdHJ1Y3Rvcik7cmV0dXJuW119KTtyZXR1cm5bXX0pfWZ1bmN0aW9uIG5ld18oY29uc3RydWN0b3IsYXJndW1lbnRMaXN0KXtpZighKGNvbnN0cnVjdG9yIGluc3RhbmNlb2YgRnVuY3Rpb24pKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJuZXdfIGNhbGxlZCB3aXRoIGNvbnN0cnVjdG9yIHR5cGUgIit0eXBlb2YgY29uc3RydWN0b3IrIiB3aGljaCBpcyBub3QgYSBmdW5jdGlvbiIpfXZhciBkdW1teT1jcmVhdGVOYW1lZEZ1bmN0aW9uKGNvbnN0cnVjdG9yLm5hbWV8fCJ1bmtub3duRnVuY3Rpb25OYW1lIixmdW5jdGlvbigpe30pO2R1bW15LnByb3RvdHlwZT1jb25zdHJ1Y3Rvci5wcm90b3R5cGU7dmFyIG9iaj1uZXcgZHVtbXk7dmFyIHI9Y29uc3RydWN0b3IuYXBwbHkob2JqLGFyZ3VtZW50TGlzdCk7cmV0dXJuIHIgaW5zdGFuY2VvZiBPYmplY3Q/cjpvYmp9ZnVuY3Rpb24gY3JhZnRJbnZva2VyRnVuY3Rpb24oaHVtYW5OYW1lLGFyZ1R5cGVzLGNsYXNzVHlwZSxjcHBJbnZva2VyRnVuYyxjcHBUYXJnZXRGdW5jKXt2YXIgYXJnQ291bnQ9YXJnVHlwZXMubGVuZ3RoO2lmKGFyZ0NvdW50PDIpe3Rocm93QmluZGluZ0Vycm9yKCJhcmdUeXBlcyBhcnJheSBzaXplIG1pc21hdGNoISBNdXN0IGF0IGxlYXN0IGdldCByZXR1cm4gdmFsdWUgYW5kICd0aGlzJyB0eXBlcyEiKX12YXIgaXNDbGFzc01ldGhvZEZ1bmM9YXJnVHlwZXNbMV0hPT1udWxsJiZjbGFzc1R5cGUhPT1udWxsO3ZhciBuZWVkc0Rlc3RydWN0b3JTdGFjaz1mYWxzZTtmb3IodmFyIGk9MTtpPGFyZ1R5cGVzLmxlbmd0aDsrK2kpe2lmKGFyZ1R5cGVzW2ldIT09bnVsbCYmYXJnVHlwZXNbaV0uZGVzdHJ1Y3RvckZ1bmN0aW9uPT09dW5kZWZpbmVkKXtuZWVkc0Rlc3RydWN0b3JTdGFjaz10cnVlO2JyZWFrfX12YXIgcmV0dXJucz1hcmdUeXBlc1swXS5uYW1lIT09InZvaWQiO3ZhciBhcmdzTGlzdD0iIjt2YXIgYXJnc0xpc3RXaXJlZD0iIjtmb3IodmFyIGk9MDtpPGFyZ0NvdW50LTI7KytpKXthcmdzTGlzdCs9KGkhPT0wPyIsICI6IiIpKyJhcmciK2k7YXJnc0xpc3RXaXJlZCs9KGkhPT0wPyIsICI6IiIpKyJhcmciK2krIldpcmVkIn12YXIgaW52b2tlckZuQm9keT0icmV0dXJuIGZ1bmN0aW9uICIrbWFrZUxlZ2FsRnVuY3Rpb25OYW1lKGh1bWFuTmFtZSkrIigiK2FyZ3NMaXN0KyIpIHtcbiIrImlmIChhcmd1bWVudHMubGVuZ3RoICE9PSAiKyhhcmdDb3VudC0yKSsiKSB7XG4iKyJ0aHJvd0JpbmRpbmdFcnJvcignZnVuY3Rpb24gIitodW1hbk5hbWUrIiBjYWxsZWQgd2l0aCAnICsgYXJndW1lbnRzLmxlbmd0aCArICcgYXJndW1lbnRzLCBleHBlY3RlZCAiKyhhcmdDb3VudC0yKSsiIGFyZ3MhJyk7XG4iKyJ9XG4iO2lmKG5lZWRzRGVzdHJ1Y3RvclN0YWNrKXtpbnZva2VyRm5Cb2R5Kz0idmFyIGRlc3RydWN0b3JzID0gW107XG4ifXZhciBkdG9yU3RhY2s9bmVlZHNEZXN0cnVjdG9yU3RhY2s/ImRlc3RydWN0b3JzIjoibnVsbCI7dmFyIGFyZ3MxPVsidGhyb3dCaW5kaW5nRXJyb3IiLCJpbnZva2VyIiwiZm4iLCJydW5EZXN0cnVjdG9ycyIsInJldFR5cGUiLCJjbGFzc1BhcmFtIl07dmFyIGFyZ3MyPVt0aHJvd0JpbmRpbmdFcnJvcixjcHBJbnZva2VyRnVuYyxjcHBUYXJnZXRGdW5jLHJ1bkRlc3RydWN0b3JzLGFyZ1R5cGVzWzBdLGFyZ1R5cGVzWzFdXTtpZihpc0NsYXNzTWV0aG9kRnVuYyl7aW52b2tlckZuQm9keSs9InZhciB0aGlzV2lyZWQgPSBjbGFzc1BhcmFtLnRvV2lyZVR5cGUoIitkdG9yU3RhY2srIiwgdGhpcyk7XG4ifWZvcih2YXIgaT0wO2k8YXJnQ291bnQtMjsrK2kpe2ludm9rZXJGbkJvZHkrPSJ2YXIgYXJnIitpKyJXaXJlZCA9IGFyZ1R5cGUiK2krIi50b1dpcmVUeXBlKCIrZHRvclN0YWNrKyIsIGFyZyIraSsiKTsgLy8gIithcmdUeXBlc1tpKzJdLm5hbWUrIlxuIjthcmdzMS5wdXNoKCJhcmdUeXBlIitpKTthcmdzMi5wdXNoKGFyZ1R5cGVzW2krMl0pfWlmKGlzQ2xhc3NNZXRob2RGdW5jKXthcmdzTGlzdFdpcmVkPSJ0aGlzV2lyZWQiKyhhcmdzTGlzdFdpcmVkLmxlbmd0aD4wPyIsICI6IiIpK2FyZ3NMaXN0V2lyZWR9aW52b2tlckZuQm9keSs9KHJldHVybnM/InZhciBydiA9ICI6IiIpKyJpbnZva2VyKGZuIisoYXJnc0xpc3RXaXJlZC5sZW5ndGg+MD8iLCAiOiIiKSthcmdzTGlzdFdpcmVkKyIpO1xuIjtpZihuZWVkc0Rlc3RydWN0b3JTdGFjayl7aW52b2tlckZuQm9keSs9InJ1bkRlc3RydWN0b3JzKGRlc3RydWN0b3JzKTtcbiJ9ZWxzZXtmb3IodmFyIGk9aXNDbGFzc01ldGhvZEZ1bmM/MToyO2k8YXJnVHlwZXMubGVuZ3RoOysraSl7dmFyIHBhcmFtTmFtZT1pPT09MT8idGhpc1dpcmVkIjoiYXJnIisoaS0yKSsiV2lyZWQiO2lmKGFyZ1R5cGVzW2ldLmRlc3RydWN0b3JGdW5jdGlvbiE9PW51bGwpe2ludm9rZXJGbkJvZHkrPXBhcmFtTmFtZSsiX2R0b3IoIitwYXJhbU5hbWUrIik7IC8vICIrYXJnVHlwZXNbaV0ubmFtZSsiXG4iO2FyZ3MxLnB1c2gocGFyYW1OYW1lKyJfZHRvciIpO2FyZ3MyLnB1c2goYXJnVHlwZXNbaV0uZGVzdHJ1Y3RvckZ1bmN0aW9uKX19fWlmKHJldHVybnMpe2ludm9rZXJGbkJvZHkrPSJ2YXIgcmV0ID0gcmV0VHlwZS5mcm9tV2lyZVR5cGUocnYpO1xuIisicmV0dXJuIHJldDtcbiJ9ZWxzZXt9aW52b2tlckZuQm9keSs9In1cbiI7YXJnczEucHVzaChpbnZva2VyRm5Cb2R5KTt2YXIgaW52b2tlckZ1bmN0aW9uPW5ld18oRnVuY3Rpb24sYXJnczEpLmFwcGx5KG51bGwsYXJnczIpO3JldHVybiBpbnZva2VyRnVuY3Rpb259ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfZnVuY3Rpb24ocmF3Q2xhc3NUeXBlLG1ldGhvZE5hbWUsYXJnQ291bnQscmF3QXJnVHlwZXNBZGRyLGludm9rZXJTaWduYXR1cmUscmF3SW52b2tlcixjb250ZXh0LGlzUHVyZVZpcnR1YWwpe3ZhciByYXdBcmdUeXBlcz1oZWFwMzJWZWN0b3JUb0FycmF5KGFyZ0NvdW50LHJhd0FyZ1R5cGVzQWRkcik7bWV0aG9kTmFtZT1yZWFkTGF0aW4xU3RyaW5nKG1ldGhvZE5hbWUpO3Jhd0ludm9rZXI9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oaW52b2tlclNpZ25hdHVyZSxyYXdJbnZva2VyKTt3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxbcmF3Q2xhc3NUeXBlXSxmdW5jdGlvbihjbGFzc1R5cGUpe2NsYXNzVHlwZT1jbGFzc1R5cGVbMF07dmFyIGh1bWFuTmFtZT1jbGFzc1R5cGUubmFtZSsiLiIrbWV0aG9kTmFtZTtpZihtZXRob2ROYW1lLnN0YXJ0c1dpdGgoIkBAIikpe21ldGhvZE5hbWU9U3ltYm9sW21ldGhvZE5hbWUuc3Vic3RyaW5nKDIpXX1pZihpc1B1cmVWaXJ0dWFsKXtjbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLnB1cmVWaXJ0dWFsRnVuY3Rpb25zLnB1c2gobWV0aG9kTmFtZSl9ZnVuY3Rpb24gdW5ib3VuZFR5cGVzSGFuZGxlcigpe3Rocm93VW5ib3VuZFR5cGVFcnJvcigiQ2Fubm90IGNhbGwgIitodW1hbk5hbWUrIiBkdWUgdG8gdW5ib3VuZCB0eXBlcyIscmF3QXJnVHlwZXMpfXZhciBwcm90bz1jbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmluc3RhbmNlUHJvdG90eXBlO3ZhciBtZXRob2Q9cHJvdG9bbWV0aG9kTmFtZV07aWYodW5kZWZpbmVkPT09bWV0aG9kfHx1bmRlZmluZWQ9PT1tZXRob2Qub3ZlcmxvYWRUYWJsZSYmbWV0aG9kLmNsYXNzTmFtZSE9PWNsYXNzVHlwZS5uYW1lJiZtZXRob2QuYXJnQ291bnQ9PT1hcmdDb3VudC0yKXt1bmJvdW5kVHlwZXNIYW5kbGVyLmFyZ0NvdW50PWFyZ0NvdW50LTI7dW5ib3VuZFR5cGVzSGFuZGxlci5jbGFzc05hbWU9Y2xhc3NUeXBlLm5hbWU7cHJvdG9bbWV0aG9kTmFtZV09dW5ib3VuZFR5cGVzSGFuZGxlcn1lbHNle2Vuc3VyZU92ZXJsb2FkVGFibGUocHJvdG8sbWV0aG9kTmFtZSxodW1hbk5hbWUpO3Byb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGVbYXJnQ291bnQtMl09dW5ib3VuZFR5cGVzSGFuZGxlcn13aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxyYXdBcmdUeXBlcyxmdW5jdGlvbihhcmdUeXBlcyl7dmFyIG1lbWJlckZ1bmN0aW9uPWNyYWZ0SW52b2tlckZ1bmN0aW9uKGh1bWFuTmFtZSxhcmdUeXBlcyxjbGFzc1R5cGUscmF3SW52b2tlcixjb250ZXh0KTtpZih1bmRlZmluZWQ9PT1wcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlKXttZW1iZXJGdW5jdGlvbi5hcmdDb3VudD1hcmdDb3VudC0yO3Byb3RvW21ldGhvZE5hbWVdPW1lbWJlckZ1bmN0aW9ufWVsc2V7cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZVthcmdDb3VudC0yXT1tZW1iZXJGdW5jdGlvbn1yZXR1cm5bXX0pO3JldHVybltdfSl9dmFyIGVtdmFsX2ZyZWVfbGlzdD1bXTt2YXIgZW12YWxfaGFuZGxlX2FycmF5PVt7fSx7dmFsdWU6dW5kZWZpbmVkfSx7dmFsdWU6bnVsbH0se3ZhbHVlOnRydWV9LHt2YWx1ZTpmYWxzZX1dO2Z1bmN0aW9uIF9fZW12YWxfZGVjcmVmKGhhbmRsZSl7aWYoaGFuZGxlPjQmJjA9PT0tLWVtdmFsX2hhbmRsZV9hcnJheVtoYW5kbGVdLnJlZmNvdW50KXtlbXZhbF9oYW5kbGVfYXJyYXlbaGFuZGxlXT11bmRlZmluZWQ7ZW12YWxfZnJlZV9saXN0LnB1c2goaGFuZGxlKX19ZnVuY3Rpb24gY291bnRfZW12YWxfaGFuZGxlcygpe3ZhciBjb3VudD0wO2Zvcih2YXIgaT01O2k8ZW12YWxfaGFuZGxlX2FycmF5Lmxlbmd0aDsrK2kpe2lmKGVtdmFsX2hhbmRsZV9hcnJheVtpXSE9PXVuZGVmaW5lZCl7Kytjb3VudH19cmV0dXJuIGNvdW50fWZ1bmN0aW9uIGdldF9maXJzdF9lbXZhbCgpe2Zvcih2YXIgaT01O2k8ZW12YWxfaGFuZGxlX2FycmF5Lmxlbmd0aDsrK2kpe2lmKGVtdmFsX2hhbmRsZV9hcnJheVtpXSE9PXVuZGVmaW5lZCl7cmV0dXJuIGVtdmFsX2hhbmRsZV9hcnJheVtpXX19cmV0dXJuIG51bGx9ZnVuY3Rpb24gaW5pdF9lbXZhbCgpe01vZHVsZVsiY291bnRfZW12YWxfaGFuZGxlcyJdPWNvdW50X2VtdmFsX2hhbmRsZXM7TW9kdWxlWyJnZXRfZmlyc3RfZW12YWwiXT1nZXRfZmlyc3RfZW12YWx9dmFyIEVtdmFsPXt0b1ZhbHVlOmhhbmRsZT0+e2lmKCFoYW5kbGUpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgdXNlIGRlbGV0ZWQgdmFsLiBoYW5kbGUgPSAiK2hhbmRsZSl9cmV0dXJuIGVtdmFsX2hhbmRsZV9hcnJheVtoYW5kbGVdLnZhbHVlfSx0b0hhbmRsZTp2YWx1ZT0+e3N3aXRjaCh2YWx1ZSl7Y2FzZSB1bmRlZmluZWQ6cmV0dXJuIDE7Y2FzZSBudWxsOnJldHVybiAyO2Nhc2UgdHJ1ZTpyZXR1cm4gMztjYXNlIGZhbHNlOnJldHVybiA0O2RlZmF1bHQ6e3ZhciBoYW5kbGU9ZW12YWxfZnJlZV9saXN0Lmxlbmd0aD9lbXZhbF9mcmVlX2xpc3QucG9wKCk6ZW12YWxfaGFuZGxlX2FycmF5Lmxlbmd0aDtlbXZhbF9oYW5kbGVfYXJyYXlbaGFuZGxlXT17cmVmY291bnQ6MSx2YWx1ZTp2YWx1ZX07cmV0dXJuIGhhbmRsZX19fX07ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfZW12YWwocmF3VHlwZSxuYW1lKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbihoYW5kbGUpe3ZhciBydj1FbXZhbC50b1ZhbHVlKGhhbmRsZSk7X19lbXZhbF9kZWNyZWYoaGFuZGxlKTtyZXR1cm4gcnZ9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7cmV0dXJuIEVtdmFsLnRvSGFuZGxlKHZhbHVlKX0sImFyZ1BhY2tBZHZhbmNlIjo4LCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6c2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXIsZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KX1mdW5jdGlvbiBfZW1iaW5kX3JlcHIodil7aWYodj09PW51bGwpe3JldHVybiJudWxsIn12YXIgdD10eXBlb2YgdjtpZih0PT09Im9iamVjdCJ8fHQ9PT0iYXJyYXkifHx0PT09ImZ1bmN0aW9uIil7cmV0dXJuIHYudG9TdHJpbmcoKX1lbHNle3JldHVybiIiK3Z9fWZ1bmN0aW9uIGZsb2F0UmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaGlmdCl7c3dpdGNoKHNoaWZ0KXtjYXNlIDI6cmV0dXJuIGZ1bmN0aW9uKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShHUk9XQUJMRV9IRUFQX0YzMigpW3BvaW50ZXI+PjJdKX07Y2FzZSAzOnJldHVybiBmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oR1JPV0FCTEVfSEVBUF9GNjQoKVtwb2ludGVyPj4zXSl9O2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcigiVW5rbm93biBmbG9hdCB0eXBlOiAiK25hbWUpfX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdChyYXdUeXBlLG5hbWUsc2l6ZSl7dmFyIHNoaWZ0PWdldFNoaWZ0RnJvbVNpemUoc2l6ZSk7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24odmFsdWUpe3JldHVybiB2YWx1ZX0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtyZXR1cm4gdmFsdWV9LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmZsb2F0UmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaGlmdCksZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KX1mdW5jdGlvbiBpbnRlZ2VyUmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaGlmdCxzaWduZWQpe3N3aXRjaChzaGlmdCl7Y2FzZSAwOnJldHVybiBzaWduZWQ/ZnVuY3Rpb24gcmVhZFM4RnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIEdST1dBQkxFX0hFQVBfSTgoKVtwb2ludGVyXX06ZnVuY3Rpb24gcmVhZFU4RnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIEdST1dBQkxFX0hFQVBfVTgoKVtwb2ludGVyXX07Y2FzZSAxOnJldHVybiBzaWduZWQ/ZnVuY3Rpb24gcmVhZFMxNkZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiBHUk9XQUJMRV9IRUFQX0kxNigpW3BvaW50ZXI+PjFdfTpmdW5jdGlvbiByZWFkVTE2RnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIEdST1dBQkxFX0hFQVBfVTE2KClbcG9pbnRlcj4+MV19O2Nhc2UgMjpyZXR1cm4gc2lnbmVkP2Z1bmN0aW9uIHJlYWRTMzJGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gR1JPV0FCTEVfSEVBUF9JMzIoKVtwb2ludGVyPj4yXX06ZnVuY3Rpb24gcmVhZFUzMkZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiBHUk9XQUJMRV9IRUFQX1UzMigpW3BvaW50ZXI+PjJdfTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoIlVua25vd24gaW50ZWdlciB0eXBlOiAiK25hbWUpfX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyKHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7aWYobWF4UmFuZ2U9PT0tMSl7bWF4UmFuZ2U9NDI5NDk2NzI5NX12YXIgc2hpZnQ9Z2V0U2hpZnRGcm9tU2l6ZShzaXplKTt2YXIgZnJvbVdpcmVUeXBlPXZhbHVlPT52YWx1ZTtpZihtaW5SYW5nZT09PTApe3ZhciBiaXRzaGlmdD0zMi04KnNpemU7ZnJvbVdpcmVUeXBlPSh2YWx1ZT0+dmFsdWU8PGJpdHNoaWZ0Pj4+Yml0c2hpZnQpfXZhciBpc1Vuc2lnbmVkVHlwZT1uYW1lLmluY2x1ZGVzKCJ1bnNpZ25lZCIpO3ZhciBjaGVja0Fzc2VydGlvbnM9KHZhbHVlLHRvVHlwZU5hbWUpPT57fTt2YXIgdG9XaXJlVHlwZTtpZihpc1Vuc2lnbmVkVHlwZSl7dG9XaXJlVHlwZT1mdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7Y2hlY2tBc3NlcnRpb25zKHZhbHVlLHRoaXMubmFtZSk7cmV0dXJuIHZhbHVlPj4+MH19ZWxzZXt0b1dpcmVUeXBlPWZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtjaGVja0Fzc2VydGlvbnModmFsdWUsdGhpcy5uYW1lKTtyZXR1cm4gdmFsdWV9fXJlZ2lzdGVyVHlwZShwcmltaXRpdmVUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnJvbVdpcmVUeXBlLCJ0b1dpcmVUeXBlIjp0b1dpcmVUeXBlLCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmludGVnZXJSZWFkVmFsdWVGcm9tUG9pbnRlcihuYW1lLHNoaWZ0LG1pblJhbmdlIT09MCksZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldyhyYXdUeXBlLGRhdGFUeXBlSW5kZXgsbmFtZSl7dmFyIHR5cGVNYXBwaW5nPVtJbnQ4QXJyYXksVWludDhBcnJheSxJbnQxNkFycmF5LFVpbnQxNkFycmF5LEludDMyQXJyYXksVWludDMyQXJyYXksRmxvYXQzMkFycmF5LEZsb2F0NjRBcnJheV07dmFyIFRBPXR5cGVNYXBwaW5nW2RhdGFUeXBlSW5kZXhdO2Z1bmN0aW9uIGRlY29kZU1lbW9yeVZpZXcoaGFuZGxlKXtoYW5kbGU9aGFuZGxlPj4yO3ZhciBoZWFwPUdST1dBQkxFX0hFQVBfVTMyKCk7dmFyIHNpemU9aGVhcFtoYW5kbGVdO3ZhciBkYXRhPWhlYXBbaGFuZGxlKzFdO3JldHVybiBuZXcgVEEoYnVmZmVyLGRhdGEsc2l6ZSl9bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZGVjb2RlTWVtb3J5VmlldywiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpkZWNvZGVNZW1vcnlWaWV3fSx7aWdub3JlRHVwbGljYXRlUmVnaXN0cmF0aW9uczp0cnVlfSl9ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZyhyYXdUeXBlLG5hbWUpe25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTt2YXIgc3RkU3RyaW5nSXNVVEY4PW5hbWU9PT0ic3RkOjpzdHJpbmciO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24odmFsdWUpe3ZhciBsZW5ndGg9R1JPV0FCTEVfSEVBUF9VMzIoKVt2YWx1ZT4+Ml07dmFyIHN0cjtpZihzdGRTdHJpbmdJc1VURjgpe3ZhciBkZWNvZGVTdGFydFB0cj12YWx1ZSs0O2Zvcih2YXIgaT0wO2k8PWxlbmd0aDsrK2kpe3ZhciBjdXJyZW50Qnl0ZVB0cj12YWx1ZSs0K2k7aWYoaT09bGVuZ3RofHxHUk9XQUJMRV9IRUFQX1U4KClbY3VycmVudEJ5dGVQdHJdPT0wKXt2YXIgbWF4UmVhZD1jdXJyZW50Qnl0ZVB0ci1kZWNvZGVTdGFydFB0cjt2YXIgc3RyaW5nU2VnbWVudD1VVEY4VG9TdHJpbmcoZGVjb2RlU3RhcnRQdHIsbWF4UmVhZCk7aWYoc3RyPT09dW5kZWZpbmVkKXtzdHI9c3RyaW5nU2VnbWVudH1lbHNle3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSgwKTtzdHIrPXN0cmluZ1NlZ21lbnR9ZGVjb2RlU3RhcnRQdHI9Y3VycmVudEJ5dGVQdHIrMX19fWVsc2V7dmFyIGE9bmV3IEFycmF5KGxlbmd0aCk7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXthW2ldPVN0cmluZy5mcm9tQ2hhckNvZGUoR1JPV0FCTEVfSEVBUF9VOCgpW3ZhbHVlKzQraV0pfXN0cj1hLmpvaW4oIiIpfV9mcmVlKHZhbHVlKTtyZXR1cm4gc3RyfSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe2lmKHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe3ZhbHVlPW5ldyBVaW50OEFycmF5KHZhbHVlKX12YXIgZ2V0TGVuZ3RoO3ZhciB2YWx1ZUlzT2ZUeXBlU3RyaW5nPXR5cGVvZiB2YWx1ZT09InN0cmluZyI7aWYoISh2YWx1ZUlzT2ZUeXBlU3RyaW5nfHx2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXl8fHZhbHVlIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXl8fHZhbHVlIGluc3RhbmNlb2YgSW50OEFycmF5KSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gc3RkOjpzdHJpbmciKX1pZihzdGRTdHJpbmdJc1VURjgmJnZhbHVlSXNPZlR5cGVTdHJpbmcpe2dldExlbmd0aD0oKCk9Pmxlbmd0aEJ5dGVzVVRGOCh2YWx1ZSkpfWVsc2V7Z2V0TGVuZ3RoPSgoKT0+dmFsdWUubGVuZ3RoKX12YXIgbGVuZ3RoPWdldExlbmd0aCgpO3ZhciBwdHI9X21hbGxvYyg0K2xlbmd0aCsxKTtHUk9XQUJMRV9IRUFQX1UzMigpW3B0cj4+Ml09bGVuZ3RoO2lmKHN0ZFN0cmluZ0lzVVRGOCYmdmFsdWVJc09mVHlwZVN0cmluZyl7c3RyaW5nVG9VVEY4KHZhbHVlLHB0cis0LGxlbmd0aCsxKX1lbHNle2lmKHZhbHVlSXNPZlR5cGVTdHJpbmcpe2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7dmFyIGNoYXJDb2RlPXZhbHVlLmNoYXJDb2RlQXQoaSk7aWYoY2hhckNvZGU+MjU1KXtfZnJlZShwdHIpO3Rocm93QmluZGluZ0Vycm9yKCJTdHJpbmcgaGFzIFVURi0xNiBjb2RlIHVuaXRzIHRoYXQgZG8gbm90IGZpdCBpbiA4IGJpdHMiKX1HUk9XQUJMRV9IRUFQX1U4KClbcHRyKzQraV09Y2hhckNvZGV9fWVsc2V7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXtHUk9XQUJMRV9IRUFQX1U4KClbcHRyKzQraV09dmFsdWVbaV19fX1pZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2goX2ZyZWUscHRyKX1yZXR1cm4gcHRyfSwiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb246ZnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpfX0pfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nKHJhd1R5cGUsY2hhclNpemUsbmFtZSl7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3ZhciBkZWNvZGVTdHJpbmcsZW5jb2RlU3RyaW5nLGdldEhlYXAsbGVuZ3RoQnl0ZXNVVEYsc2hpZnQ7aWYoY2hhclNpemU9PT0yKXtkZWNvZGVTdHJpbmc9VVRGMTZUb1N0cmluZztlbmNvZGVTdHJpbmc9c3RyaW5nVG9VVEYxNjtsZW5ndGhCeXRlc1VURj1sZW5ndGhCeXRlc1VURjE2O2dldEhlYXA9KCgpPT5HUk9XQUJMRV9IRUFQX1UxNigpKTtzaGlmdD0xfWVsc2UgaWYoY2hhclNpemU9PT00KXtkZWNvZGVTdHJpbmc9VVRGMzJUb1N0cmluZztlbmNvZGVTdHJpbmc9c3RyaW5nVG9VVEYzMjtsZW5ndGhCeXRlc1VURj1sZW5ndGhCeXRlc1VURjMyO2dldEhlYXA9KCgpPT5HUk9XQUJMRV9IRUFQX1UzMigpKTtzaGlmdD0yfXJlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24odmFsdWUpe3ZhciBsZW5ndGg9R1JPV0FCTEVfSEVBUF9VMzIoKVt2YWx1ZT4+Ml07dmFyIEhFQVA9Z2V0SGVhcCgpO3ZhciBzdHI7dmFyIGRlY29kZVN0YXJ0UHRyPXZhbHVlKzQ7Zm9yKHZhciBpPTA7aTw9bGVuZ3RoOysraSl7dmFyIGN1cnJlbnRCeXRlUHRyPXZhbHVlKzQraSpjaGFyU2l6ZTtpZihpPT1sZW5ndGh8fEhFQVBbY3VycmVudEJ5dGVQdHI+PnNoaWZ0XT09MCl7dmFyIG1heFJlYWRCeXRlcz1jdXJyZW50Qnl0ZVB0ci1kZWNvZGVTdGFydFB0cjt2YXIgc3RyaW5nU2VnbWVudD1kZWNvZGVTdHJpbmcoZGVjb2RlU3RhcnRQdHIsbWF4UmVhZEJ5dGVzKTtpZihzdHI9PT11bmRlZmluZWQpe3N0cj1zdHJpbmdTZWdtZW50fWVsc2V7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApO3N0cis9c3RyaW5nU2VnbWVudH1kZWNvZGVTdGFydFB0cj1jdXJyZW50Qnl0ZVB0citjaGFyU2l6ZX19X2ZyZWUodmFsdWUpO3JldHVybiBzdHJ9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7aWYoISh0eXBlb2YgdmFsdWU9PSJzdHJpbmciKSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gQysrIHN0cmluZyB0eXBlICIrbmFtZSl9dmFyIGxlbmd0aD1sZW5ndGhCeXRlc1VURih2YWx1ZSk7dmFyIHB0cj1fbWFsbG9jKDQrbGVuZ3RoK2NoYXJTaXplKTtHUk9XQUJMRV9IRUFQX1UzMigpW3B0cj4+Ml09bGVuZ3RoPj5zaGlmdDtlbmNvZGVTdHJpbmcodmFsdWUscHRyKzQsbGVuZ3RoK2NoYXJTaXplKTtpZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2goX2ZyZWUscHRyKX1yZXR1cm4gcHRyfSwiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb246ZnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpfX0pfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQocmF3VHlwZSxuYW1lKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse2lzVm9pZDp0cnVlLG5hbWU6bmFtZSwiYXJnUGFja0FkdmFuY2UiOjAsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24oKXtyZXR1cm4gdW5kZWZpbmVkfSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsbyl7cmV0dXJuIHVuZGVmaW5lZH19KX1mdW5jdGlvbiBfX2Vtc2NyaXB0ZW5fZGF0ZV9ub3coKXtyZXR1cm4gRGF0ZS5ub3coKX1mdW5jdGlvbiBfX2Vtc2NyaXB0ZW5fZGVmYXVsdF9wdGhyZWFkX3N0YWNrX3NpemUoKXtyZXR1cm4gMjA5NzE1Mn12YXIgbm93SXNNb25vdG9uaWM9dHJ1ZTtmdW5jdGlvbiBfX2Vtc2NyaXB0ZW5fZ2V0X25vd19pc19tb25vdG9uaWMoKXtyZXR1cm4gbm93SXNNb25vdG9uaWN9ZnVuY3Rpb24gZXhlY3V0ZU5vdGlmaWVkUHJveHlpbmdRdWV1ZShxdWV1ZSl7QXRvbWljcy5zdG9yZShHUk9XQUJMRV9IRUFQX0kzMigpLHF1ZXVlPj4yLDEpO2lmKF9wdGhyZWFkX3NlbGYoKSl7X19lbXNjcmlwdGVuX3Byb3h5X2V4ZWN1dGVfdGFza19xdWV1ZShxdWV1ZSl9QXRvbWljcy5jb21wYXJlRXhjaGFuZ2UoR1JPV0FCTEVfSEVBUF9JMzIoKSxxdWV1ZT4+MiwxLDApfU1vZHVsZVsiZXhlY3V0ZU5vdGlmaWVkUHJveHlpbmdRdWV1ZSJdPWV4ZWN1dGVOb3RpZmllZFByb3h5aW5nUXVldWU7ZnVuY3Rpb24gX19lbXNjcmlwdGVuX25vdGlmeV90YXNrX3F1ZXVlKHRhcmdldFRocmVhZElkLGN1cnJUaHJlYWRJZCxtYWluVGhyZWFkSWQscXVldWUpe2lmKHRhcmdldFRocmVhZElkPT1jdXJyVGhyZWFkSWQpe3NldFRpbWVvdXQoKCk9PmV4ZWN1dGVOb3RpZmllZFByb3h5aW5nUXVldWUocXVldWUpKX1lbHNlIGlmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpe3Bvc3RNZXNzYWdlKHsidGFyZ2V0VGhyZWFkIjp0YXJnZXRUaHJlYWRJZCwiY21kIjoicHJvY2Vzc1Byb3h5aW5nUXVldWUiLCJxdWV1ZSI6cXVldWV9KX1lbHNle3ZhciBwdGhyZWFkPVBUaHJlYWQucHRocmVhZHNbdGFyZ2V0VGhyZWFkSWRdO3ZhciB3b3JrZXI9cHRocmVhZCYmcHRocmVhZC53b3JrZXI7aWYoIXdvcmtlcil7cmV0dXJufXdvcmtlci5wb3N0TWVzc2FnZSh7ImNtZCI6InByb2Nlc3NQcm94eWluZ1F1ZXVlIiwicXVldWUiOnF1ZXVlfSl9cmV0dXJuIDF9ZnVuY3Rpb24gX19lbXNjcmlwdGVuX3NldF9vZmZzY3JlZW5jYW52YXNfc2l6ZSh0YXJnZXQsd2lkdGgsaGVpZ2h0KXtyZXR1cm4tMX1mdW5jdGlvbiBfX2VtdmFsX2luY3JlZihoYW5kbGUpe2lmKGhhbmRsZT40KXtlbXZhbF9oYW5kbGVfYXJyYXlbaGFuZGxlXS5yZWZjb3VudCs9MX19ZnVuY3Rpb24gcmVxdWlyZVJlZ2lzdGVyZWRUeXBlKHJhd1R5cGUsaHVtYW5OYW1lKXt2YXIgaW1wbD1yZWdpc3RlcmVkVHlwZXNbcmF3VHlwZV07aWYodW5kZWZpbmVkPT09aW1wbCl7dGhyb3dCaW5kaW5nRXJyb3IoaHVtYW5OYW1lKyIgaGFzIHVua25vd24gdHlwZSAiK2dldFR5cGVOYW1lKHJhd1R5cGUpKX1yZXR1cm4gaW1wbH1mdW5jdGlvbiBfX2VtdmFsX3Rha2VfdmFsdWUodHlwZSxhcmd2KXt0eXBlPXJlcXVpcmVSZWdpc3RlcmVkVHlwZSh0eXBlLCJfZW12YWxfdGFrZV92YWx1ZSIpO3ZhciB2PXR5cGVbInJlYWRWYWx1ZUZyb21Qb2ludGVyIl0oYXJndik7cmV0dXJuIEVtdmFsLnRvSGFuZGxlKHYpfWZ1bmN0aW9uIF9fbW1hcF9qcyhhZGRyLGxlbixwcm90LGZsYWdzLGZkLG9mZixhbGxvY2F0ZWQsYnVpbHRpbil7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMTMsMSxhZGRyLGxlbixwcm90LGZsYWdzLGZkLG9mZixhbGxvY2F0ZWQsYnVpbHRpbik7dHJ5e3ZhciBpbmZvPUZTLmdldFN0cmVhbShmZCk7aWYoIWluZm8pcmV0dXJuLTg7dmFyIHJlcz1GUy5tbWFwKGluZm8sYWRkcixsZW4sb2ZmLHByb3QsZmxhZ3MpO3ZhciBwdHI9cmVzLnB0cjtHUk9XQUJMRV9IRUFQX0kzMigpW2FsbG9jYXRlZD4+Ml09cmVzLmFsbG9jYXRlZDtyZXR1cm4gcHRyfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fbXVubWFwX2pzKGFkZHIsbGVuLHByb3QsZmxhZ3MsZmQsb2Zmc2V0KXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBfZW1zY3JpcHRlbl9wcm94eV90b19tYWluX3RocmVhZF9qcygxNCwxLGFkZHIsbGVuLHByb3QsZmxhZ3MsZmQsb2Zmc2V0KTt0cnl7dmFyIHN0cmVhbT1GUy5nZXRTdHJlYW0oZmQpO2lmKHN0cmVhbSl7aWYocHJvdCYyKXtTWVNDQUxMUy5kb01zeW5jKGFkZHIsc3RyZWFtLGxlbixmbGFncyxvZmZzZXQpfUZTLm11bm1hcChzdHJlYW0pfX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfYWJvcnQoKXthYm9ydCgiIil9ZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fY2hlY2tfYmxvY2tpbmdfYWxsb3dlZCgpe2lmKEVOVklST05NRU5UX0lTX1dPUktFUilyZXR1cm47d2Fybk9uY2UoIkJsb2NraW5nIG9uIHRoZSBtYWluIHRocmVhZCBpcyB2ZXJ5IGRhbmdlcm91cywgc2VlIGh0dHBzOi8vZW1zY3JpcHRlbi5vcmcvZG9jcy9wb3J0aW5nL3B0aHJlYWRzLmh0bWwjYmxvY2tpbmctb24tdGhlLW1haW4tYnJvd3Nlci10aHJlYWQiKX1mdW5jdGlvbiBfZW1zY3JpcHRlbl9nZXRfaGVhcF9tYXgoKXtyZXR1cm4gMjE0NzQ4MzY0OH12YXIgX2Vtc2NyaXB0ZW5fZ2V0X25vdztpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXtfZW1zY3JpcHRlbl9nZXRfbm93PSgoKT0+cGVyZm9ybWFuY2Uubm93KCktTW9kdWxlWyJfX3BlcmZvcm1hbmNlX25vd19jbG9ja19kcmlmdCJdKX1lbHNlIF9lbXNjcmlwdGVuX2dldF9ub3c9KCgpPT5wZXJmb3JtYW5jZS5ub3coKSk7ZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fbWVtY3B5X2JpZyhkZXN0LHNyYyxudW0pe0dST1dBQkxFX0hFQVBfVTgoKS5jb3B5V2l0aGluKGRlc3Qsc3JjLHNyYytudW0pfWZ1bmN0aW9uIF9lbXNjcmlwdGVuX251bV9sb2dpY2FsX2NvcmVzKCl7cmV0dXJuIG5hdmlnYXRvclsiaGFyZHdhcmVDb25jdXJyZW5jeSJdfWZ1bmN0aW9uIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKGluZGV4LHN5bmMpe3ZhciBudW1DYWxsQXJncz1hcmd1bWVudHMubGVuZ3RoLTI7dmFyIG91dGVyQXJncz1hcmd1bWVudHM7cmV0dXJuIHdpdGhTdGFja1NhdmUoZnVuY3Rpb24oKXt2YXIgc2VyaWFsaXplZE51bUNhbGxBcmdzPW51bUNhbGxBcmdzO3ZhciBhcmdzPXN0YWNrQWxsb2Moc2VyaWFsaXplZE51bUNhbGxBcmdzKjgpO3ZhciBiPWFyZ3M+PjM7Zm9yKHZhciBpPTA7aTxudW1DYWxsQXJncztpKyspe3ZhciBhcmc9b3V0ZXJBcmdzWzIraV07R1JPV0FCTEVfSEVBUF9GNjQoKVtiK2ldPWFyZ31yZXR1cm4gX2Vtc2NyaXB0ZW5fcnVuX2luX21haW5fcnVudGltZV90aHJlYWRfanMoaW5kZXgsc2VyaWFsaXplZE51bUNhbGxBcmdzLGFyZ3Msc3luYyl9KX12YXIgX2Vtc2NyaXB0ZW5fcmVjZWl2ZV9vbl9tYWluX3RocmVhZF9qc19jYWxsQXJncz1bXTtmdW5jdGlvbiBfZW1zY3JpcHRlbl9yZWNlaXZlX29uX21haW5fdGhyZWFkX2pzKGluZGV4LG51bUNhbGxBcmdzLGFyZ3Mpe19lbXNjcmlwdGVuX3JlY2VpdmVfb25fbWFpbl90aHJlYWRfanNfY2FsbEFyZ3MubGVuZ3RoPW51bUNhbGxBcmdzO3ZhciBiPWFyZ3M+PjM7Zm9yKHZhciBpPTA7aTxudW1DYWxsQXJncztpKyspe19lbXNjcmlwdGVuX3JlY2VpdmVfb25fbWFpbl90aHJlYWRfanNfY2FsbEFyZ3NbaV09R1JPV0FCTEVfSEVBUF9GNjQoKVtiK2ldfXZhciBpc0VtQXNtQ29uc3Q9aW5kZXg8MDt2YXIgZnVuYz0haXNFbUFzbUNvbnN0P3Byb3hpZWRGdW5jdGlvblRhYmxlW2luZGV4XTpBU01fQ09OU1RTWy1pbmRleC0xXTtyZXR1cm4gZnVuYy5hcHBseShudWxsLF9lbXNjcmlwdGVuX3JlY2VpdmVfb25fbWFpbl90aHJlYWRfanNfY2FsbEFyZ3MpfWZ1bmN0aW9uIGVtc2NyaXB0ZW5fcmVhbGxvY19idWZmZXIoc2l6ZSl7dHJ5e3dhc21NZW1vcnkuZ3JvdyhzaXplLWJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1Pj4+MTYpO3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKTtyZXR1cm4gMX1jYXRjaChlKXt9fWZ1bmN0aW9uIF9lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwKHJlcXVlc3RlZFNpemUpe3ZhciBvbGRTaXplPUdST1dBQkxFX0hFQVBfVTgoKS5sZW5ndGg7cmVxdWVzdGVkU2l6ZT1yZXF1ZXN0ZWRTaXplPj4+MDtpZihyZXF1ZXN0ZWRTaXplPD1vbGRTaXplKXtyZXR1cm4gZmFsc2V9dmFyIG1heEhlYXBTaXplPV9lbXNjcmlwdGVuX2dldF9oZWFwX21heCgpO2lmKHJlcXVlc3RlZFNpemU+bWF4SGVhcFNpemUpe3JldHVybiBmYWxzZX1sZXQgYWxpZ25VcD0oeCxtdWx0aXBsZSk9PngrKG11bHRpcGxlLXglbXVsdGlwbGUpJW11bHRpcGxlO2Zvcih2YXIgY3V0RG93bj0xO2N1dERvd248PTQ7Y3V0RG93bio9Mil7dmFyIG92ZXJHcm93bkhlYXBTaXplPW9sZFNpemUqKDErLjIvY3V0RG93bik7b3Zlckdyb3duSGVhcFNpemU9TWF0aC5taW4ob3Zlckdyb3duSGVhcFNpemUscmVxdWVzdGVkU2l6ZSsxMDA2NjMyOTYpO3ZhciBuZXdTaXplPU1hdGgubWluKG1heEhlYXBTaXplLGFsaWduVXAoTWF0aC5tYXgocmVxdWVzdGVkU2l6ZSxvdmVyR3Jvd25IZWFwU2l6ZSksNjU1MzYpKTt2YXIgcmVwbGFjZW1lbnQ9ZW1zY3JpcHRlbl9yZWFsbG9jX2J1ZmZlcihuZXdTaXplKTtpZihyZXBsYWNlbWVudCl7cmV0dXJuIHRydWV9fXJldHVybiBmYWxzZX1mdW5jdGlvbiBfZW1zY3JpcHRlbl91bndpbmRfdG9fanNfZXZlbnRfbG9vcCgpe3Rocm93InVud2luZCJ9dmFyIEVOVj17fTtmdW5jdGlvbiBnZXRFeGVjdXRhYmxlTmFtZSgpe3JldHVybiB0aGlzUHJvZ3JhbXx8Ii4vdGhpcy5wcm9ncmFtIn1mdW5jdGlvbiBnZXRFbnZTdHJpbmdzKCl7aWYoIWdldEVudlN0cmluZ3Muc3RyaW5ncyl7dmFyIGxhbmc9KHR5cGVvZiBuYXZpZ2F0b3I9PSJvYmplY3QiJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzWzBdfHwiQyIpLnJlcGxhY2UoIi0iLCJfIikrIi5VVEYtOCI7dmFyIGVudj17IlVTRVIiOiJ3ZWJfdXNlciIsIkxPR05BTUUiOiJ3ZWJfdXNlciIsIlBBVEgiOiIvIiwiUFdEIjoiLyIsIkhPTUUiOiIvaG9tZS93ZWJfdXNlciIsIkxBTkciOmxhbmcsIl8iOmdldEV4ZWN1dGFibGVOYW1lKCl9O2Zvcih2YXIgeCBpbiBFTlYpe2lmKEVOVlt4XT09PXVuZGVmaW5lZClkZWxldGUgZW52W3hdO2Vsc2UgZW52W3hdPUVOVlt4XX12YXIgc3RyaW5ncz1bXTtmb3IodmFyIHggaW4gZW52KXtzdHJpbmdzLnB1c2goeCsiPSIrZW52W3hdKX1nZXRFbnZTdHJpbmdzLnN0cmluZ3M9c3RyaW5nc31yZXR1cm4gZ2V0RW52U3RyaW5ncy5zdHJpbmdzfWZ1bmN0aW9uIF9lbnZpcm9uX2dldChfX2Vudmlyb24sZW52aXJvbl9idWYpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDE1LDEsX19lbnZpcm9uLGVudmlyb25fYnVmKTt2YXIgYnVmU2l6ZT0wO2dldEVudlN0cmluZ3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHN0cmluZyxpKXt2YXIgcHRyPWVudmlyb25fYnVmK2J1ZlNpemU7R1JPV0FCTEVfSEVBUF9JMzIoKVtfX2Vudmlyb24raSo0Pj4yXT1wdHI7d3JpdGVBc2NpaVRvTWVtb3J5KHN0cmluZyxwdHIpO2J1ZlNpemUrPXN0cmluZy5sZW5ndGgrMX0pO3JldHVybiAwfWZ1bmN0aW9uIF9lbnZpcm9uX3NpemVzX2dldChwZW52aXJvbl9jb3VudCxwZW52aXJvbl9idWZfc2l6ZSl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMTYsMSxwZW52aXJvbl9jb3VudCxwZW52aXJvbl9idWZfc2l6ZSk7dmFyIHN0cmluZ3M9Z2V0RW52U3RyaW5ncygpO0dST1dBQkxFX0hFQVBfSTMyKClbcGVudmlyb25fY291bnQ+PjJdPXN0cmluZ3MubGVuZ3RoO3ZhciBidWZTaXplPTA7c3RyaW5ncy5mb3JFYWNoKGZ1bmN0aW9uKHN0cmluZyl7YnVmU2l6ZSs9c3RyaW5nLmxlbmd0aCsxfSk7R1JPV0FCTEVfSEVBUF9JMzIoKVtwZW52aXJvbl9idWZfc2l6ZT4+Ml09YnVmU2l6ZTtyZXR1cm4gMH1mdW5jdGlvbiBfZmRfY2xvc2UoZmQpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDE3LDEsZmQpO3RyeXt2YXIgc3RyZWFtPVNZU0NBTExTLmdldFN0cmVhbUZyb21GRChmZCk7RlMuY2xvc2Uoc3RyZWFtKTtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybiBlLmVycm5vfX1mdW5jdGlvbiBkb1JlYWR2KHN0cmVhbSxpb3YsaW92Y250LG9mZnNldCl7dmFyIHJldD0wO2Zvcih2YXIgaT0wO2k8aW92Y250O2krKyl7dmFyIHB0cj1HUk9XQUJMRV9IRUFQX1UzMigpW2lvdj4+Ml07dmFyIGxlbj1HUk9XQUJMRV9IRUFQX1UzMigpW2lvdis0Pj4yXTtpb3YrPTg7dmFyIGN1cnI9RlMucmVhZChzdHJlYW0sR1JPV0FCTEVfSEVBUF9JOCgpLHB0cixsZW4sb2Zmc2V0KTtpZihjdXJyPDApcmV0dXJuLTE7cmV0Kz1jdXJyO2lmKGN1cnI8bGVuKWJyZWFrfXJldHVybiByZXR9ZnVuY3Rpb24gX2ZkX3JlYWQoZmQsaW92LGlvdmNudCxwbnVtKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBfZW1zY3JpcHRlbl9wcm94eV90b19tYWluX3RocmVhZF9qcygxOCwxLGZkLGlvdixpb3ZjbnQscG51bSk7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTt2YXIgbnVtPWRvUmVhZHYoc3RyZWFtLGlvdixpb3ZjbnQpO0dST1dBQkxFX0hFQVBfSTMyKClbcG51bT4+Ml09bnVtO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIF9mZF9zZWVrKGZkLG9mZnNldF9sb3csb2Zmc2V0X2hpZ2gsd2hlbmNlLG5ld09mZnNldCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMTksMSxmZCxvZmZzZXRfbG93LG9mZnNldF9oaWdoLHdoZW5jZSxuZXdPZmZzZXQpO3RyeXt2YXIgc3RyZWFtPVNZU0NBTExTLmdldFN0cmVhbUZyb21GRChmZCk7dmFyIEhJR0hfT0ZGU0VUPTQyOTQ5NjcyOTY7dmFyIG9mZnNldD1vZmZzZXRfaGlnaCpISUdIX09GRlNFVCsob2Zmc2V0X2xvdz4+PjApO3ZhciBET1VCTEVfTElNSVQ9OTAwNzE5OTI1NDc0MDk5MjtpZihvZmZzZXQ8PS1ET1VCTEVfTElNSVR8fG9mZnNldD49RE9VQkxFX0xJTUlUKXtyZXR1cm4gNjF9RlMubGxzZWVrKHN0cmVhbSxvZmZzZXQsd2hlbmNlKTt0ZW1wSTY0PVtzdHJlYW0ucG9zaXRpb24+Pj4wLCh0ZW1wRG91YmxlPXN0cmVhbS5wb3NpdGlvbiwrTWF0aC5hYnModGVtcERvdWJsZSk+PTE/dGVtcERvdWJsZT4wPyhNYXRoLm1pbigrTWF0aC5mbG9vcih0ZW1wRG91YmxlLzQyOTQ5NjcyOTYpLDQyOTQ5NjcyOTUpfDApPj4+MDp+fitNYXRoLmNlaWwoKHRlbXBEb3VibGUtKyh+fnRlbXBEb3VibGU+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApXSxHUk9XQUJMRV9IRUFQX0kzMigpW25ld09mZnNldD4+Ml09dGVtcEk2NFswXSxHUk9XQUJMRV9IRUFQX0kzMigpW25ld09mZnNldCs0Pj4yXT10ZW1wSTY0WzFdO2lmKHN0cmVhbS5nZXRkZW50cyYmb2Zmc2V0PT09MCYmd2hlbmNlPT09MClzdHJlYW0uZ2V0ZGVudHM9bnVsbDtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybiBlLmVycm5vfX1mdW5jdGlvbiBfZmRfc3luYyhmZCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gX2Vtc2NyaXB0ZW5fcHJveHlfdG9fbWFpbl90aHJlYWRfanMoMjAsMSxmZCk7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTtpZihzdHJlYW0uc3RyZWFtX29wcyYmc3RyZWFtLnN0cmVhbV9vcHMuZnN5bmMpe3JldHVybi1zdHJlYW0uc3RyZWFtX29wcy5mc3luYyhzdHJlYW0pfXJldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIGRvV3JpdGV2KHN0cmVhbSxpb3YsaW92Y250LG9mZnNldCl7dmFyIHJldD0wO2Zvcih2YXIgaT0wO2k8aW92Y250O2krKyl7dmFyIHB0cj1HUk9XQUJMRV9IRUFQX1UzMigpW2lvdj4+Ml07dmFyIGxlbj1HUk9XQUJMRV9IRUFQX1UzMigpW2lvdis0Pj4yXTtpb3YrPTg7dmFyIGN1cnI9RlMud3JpdGUoc3RyZWFtLEdST1dBQkxFX0hFQVBfSTgoKSxwdHIsbGVuLG9mZnNldCk7aWYoY3VycjwwKXJldHVybi0xO3JldCs9Y3Vycn1yZXR1cm4gcmV0fWZ1bmN0aW9uIF9mZF93cml0ZShmZCxpb3YsaW92Y250LHBudW0pe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIF9lbXNjcmlwdGVuX3Byb3h5X3RvX21haW5fdGhyZWFkX2pzKDIxLDEsZmQsaW92LGlvdmNudCxwbnVtKTt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3ZhciBudW09ZG9Xcml0ZXYoc3RyZWFtLGlvdixpb3ZjbnQpO0dST1dBQkxFX0hFQVBfSTMyKClbcG51bT4+Ml09bnVtO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIF9nZXRUZW1wUmV0MCgpe3JldHVybiBnZXRUZW1wUmV0MCgpfWZ1bmN0aW9uIF9nZXRlbnRyb3B5KGJ1ZmZlcixzaXplKXtpZighX2dldGVudHJvcHkucmFuZG9tRGV2aWNlKXtfZ2V0ZW50cm9weS5yYW5kb21EZXZpY2U9Z2V0UmFuZG9tRGV2aWNlKCl9Zm9yKHZhciBpPTA7aTxzaXplO2krKyl7R1JPV0FCTEVfSEVBUF9JOCgpW2J1ZmZlcitpPj4wXT1fZ2V0ZW50cm9weS5yYW5kb21EZXZpY2UoKX1yZXR1cm4gMH1mdW5jdGlvbiBfc2V0VGVtcFJldDAodmFsKXtzZXRUZW1wUmV0MCh2YWwpfWZ1bmN0aW9uIF9faXNMZWFwWWVhcih5ZWFyKXtyZXR1cm4geWVhciU0PT09MCYmKHllYXIlMTAwIT09MHx8eWVhciU0MDA9PT0wKX1mdW5jdGlvbiBfX2FycmF5U3VtKGFycmF5LGluZGV4KXt2YXIgc3VtPTA7Zm9yKHZhciBpPTA7aTw9aW5kZXg7c3VtKz1hcnJheVtpKytdKXt9cmV0dXJuIHN1bX12YXIgX19NT05USF9EQVlTX0xFQVA9WzMxLDI5LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXTt2YXIgX19NT05USF9EQVlTX1JFR1VMQVI9WzMxLDI4LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXTtmdW5jdGlvbiBfX2FkZERheXMoZGF0ZSxkYXlzKXt2YXIgbmV3RGF0ZT1uZXcgRGF0ZShkYXRlLmdldFRpbWUoKSk7d2hpbGUoZGF5cz4wKXt2YXIgbGVhcD1fX2lzTGVhcFllYXIobmV3RGF0ZS5nZXRGdWxsWWVhcigpKTt2YXIgY3VycmVudE1vbnRoPW5ld0RhdGUuZ2V0TW9udGgoKTt2YXIgZGF5c0luQ3VycmVudE1vbnRoPShsZWFwP19fTU9OVEhfREFZU19MRUFQOl9fTU9OVEhfREFZU19SRUdVTEFSKVtjdXJyZW50TW9udGhdO2lmKGRheXM+ZGF5c0luQ3VycmVudE1vbnRoLW5ld0RhdGUuZ2V0RGF0ZSgpKXtkYXlzLT1kYXlzSW5DdXJyZW50TW9udGgtbmV3RGF0ZS5nZXREYXRlKCkrMTtuZXdEYXRlLnNldERhdGUoMSk7aWYoY3VycmVudE1vbnRoPDExKXtuZXdEYXRlLnNldE1vbnRoKGN1cnJlbnRNb250aCsxKX1lbHNle25ld0RhdGUuc2V0TW9udGgoMCk7bmV3RGF0ZS5zZXRGdWxsWWVhcihuZXdEYXRlLmdldEZ1bGxZZWFyKCkrMSl9fWVsc2V7bmV3RGF0ZS5zZXREYXRlKG5ld0RhdGUuZ2V0RGF0ZSgpK2RheXMpO3JldHVybiBuZXdEYXRlfX1yZXR1cm4gbmV3RGF0ZX1mdW5jdGlvbiBfc3RyZnRpbWUocyxtYXhzaXplLGZvcm1hdCx0bSl7dmFyIHRtX3pvbmU9R1JPV0FCTEVfSEVBUF9JMzIoKVt0bSs0MD4+Ml07dmFyIGRhdGU9e3RtX3NlYzpHUk9XQUJMRV9IRUFQX0kzMigpW3RtPj4yXSx0bV9taW46R1JPV0FCTEVfSEVBUF9JMzIoKVt0bSs0Pj4yXSx0bV9ob3VyOkdST1dBQkxFX0hFQVBfSTMyKClbdG0rOD4+Ml0sdG1fbWRheTpHUk9XQUJMRV9IRUFQX0kzMigpW3RtKzEyPj4yXSx0bV9tb246R1JPV0FCTEVfSEVBUF9JMzIoKVt0bSsxNj4+Ml0sdG1feWVhcjpHUk9XQUJMRV9IRUFQX0kzMigpW3RtKzIwPj4yXSx0bV93ZGF5OkdST1dBQkxFX0hFQVBfSTMyKClbdG0rMjQ+PjJdLHRtX3lkYXk6R1JPV0FCTEVfSEVBUF9JMzIoKVt0bSsyOD4+Ml0sdG1faXNkc3Q6R1JPV0FCTEVfSEVBUF9JMzIoKVt0bSszMj4+Ml0sdG1fZ210b2ZmOkdST1dBQkxFX0hFQVBfSTMyKClbdG0rMzY+PjJdLHRtX3pvbmU6dG1fem9uZT9VVEY4VG9TdHJpbmcodG1fem9uZSk6IiJ9O3ZhciBwYXR0ZXJuPVVURjhUb1N0cmluZyhmb3JtYXQpO3ZhciBFWFBBTlNJT05fUlVMRVNfMT17IiVjIjoiJWEgJWIgJWQgJUg6JU06JVMgJVkiLCIlRCI6IiVtLyVkLyV5IiwiJUYiOiIlWS0lbS0lZCIsIiVoIjoiJWIiLCIlciI6IiVJOiVNOiVTICVwIiwiJVIiOiIlSDolTSIsIiVUIjoiJUg6JU06JVMiLCIleCI6IiVtLyVkLyV5IiwiJVgiOiIlSDolTTolUyIsIiVFYyI6IiVjIiwiJUVDIjoiJUMiLCIlRXgiOiIlbS8lZC8leSIsIiVFWCI6IiVIOiVNOiVTIiwiJUV5IjoiJXkiLCIlRVkiOiIlWSIsIiVPZCI6IiVkIiwiJU9lIjoiJWUiLCIlT0giOiIlSCIsIiVPSSI6IiVJIiwiJU9tIjoiJW0iLCIlT00iOiIlTSIsIiVPUyI6IiVTIiwiJU91IjoiJXUiLCIlT1UiOiIlVSIsIiVPViI6IiVWIiwiJU93IjoiJXciLCIlT1ciOiIlVyIsIiVPeSI6IiV5In07Zm9yKHZhciBydWxlIGluIEVYUEFOU0lPTl9SVUxFU18xKXtwYXR0ZXJuPXBhdHRlcm4ucmVwbGFjZShuZXcgUmVnRXhwKHJ1bGUsImciKSxFWFBBTlNJT05fUlVMRVNfMVtydWxlXSl9dmFyIFdFRUtEQVlTPVsiU3VuZGF5IiwiTW9uZGF5IiwiVHVlc2RheSIsIldlZG5lc2RheSIsIlRodXJzZGF5IiwiRnJpZGF5IiwiU2F0dXJkYXkiXTt2YXIgTU9OVEhTPVsiSmFudWFyeSIsIkZlYnJ1YXJ5IiwiTWFyY2giLCJBcHJpbCIsIk1heSIsIkp1bmUiLCJKdWx5IiwiQXVndXN0IiwiU2VwdGVtYmVyIiwiT2N0b2JlciIsIk5vdmVtYmVyIiwiRGVjZW1iZXIiXTtmdW5jdGlvbiBsZWFkaW5nU29tZXRoaW5nKHZhbHVlLGRpZ2l0cyxjaGFyYWN0ZXIpe3ZhciBzdHI9dHlwZW9mIHZhbHVlPT0ibnVtYmVyIj92YWx1ZS50b1N0cmluZygpOnZhbHVlfHwiIjt3aGlsZShzdHIubGVuZ3RoPGRpZ2l0cyl7c3RyPWNoYXJhY3RlclswXStzdHJ9cmV0dXJuIHN0cn1mdW5jdGlvbiBsZWFkaW5nTnVsbHModmFsdWUsZGlnaXRzKXtyZXR1cm4gbGVhZGluZ1NvbWV0aGluZyh2YWx1ZSxkaWdpdHMsIjAiKX1mdW5jdGlvbiBjb21wYXJlQnlEYXkoZGF0ZTEsZGF0ZTIpe2Z1bmN0aW9uIHNnbih2YWx1ZSl7cmV0dXJuIHZhbHVlPDA/LTE6dmFsdWU+MD8xOjB9dmFyIGNvbXBhcmU7aWYoKGNvbXBhcmU9c2duKGRhdGUxLmdldEZ1bGxZZWFyKCktZGF0ZTIuZ2V0RnVsbFllYXIoKSkpPT09MCl7aWYoKGNvbXBhcmU9c2duKGRhdGUxLmdldE1vbnRoKCktZGF0ZTIuZ2V0TW9udGgoKSkpPT09MCl7Y29tcGFyZT1zZ24oZGF0ZTEuZ2V0RGF0ZSgpLWRhdGUyLmdldERhdGUoKSl9fXJldHVybiBjb21wYXJlfWZ1bmN0aW9uIGdldEZpcnN0V2Vla1N0YXJ0RGF0ZShqYW5Gb3VydGgpe3N3aXRjaChqYW5Gb3VydGguZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCktMSwxMSwyOSk7Y2FzZSAxOnJldHVybiBqYW5Gb3VydGg7Y2FzZSAyOnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCksMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLDAsMSk7Y2FzZSA1OnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKS0xLDExLDMxKTtjYXNlIDY6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBnZXRXZWVrQmFzZWRZZWFyKGRhdGUpe3ZhciB0aGlzRGF0ZT1fX2FkZERheXMobmV3IERhdGUoZGF0ZS50bV95ZWFyKzE5MDAsMCwxKSxkYXRlLnRtX3lkYXkpO3ZhciBqYW5Gb3VydGhUaGlzWWVhcj1uZXcgRGF0ZSh0aGlzRGF0ZS5nZXRGdWxsWWVhcigpLDAsNCk7dmFyIGphbkZvdXJ0aE5leHRZZWFyPW5ldyBEYXRlKHRoaXNEYXRlLmdldEZ1bGxZZWFyKCkrMSwwLDQpO3ZhciBmaXJzdFdlZWtTdGFydFRoaXNZZWFyPWdldEZpcnN0V2Vla1N0YXJ0RGF0ZShqYW5Gb3VydGhUaGlzWWVhcik7dmFyIGZpcnN0V2Vla1N0YXJ0TmV4dFllYXI9Z2V0Rmlyc3RXZWVrU3RhcnREYXRlKGphbkZvdXJ0aE5leHRZZWFyKTtpZihjb21wYXJlQnlEYXkoZmlyc3RXZWVrU3RhcnRUaGlzWWVhcix0aGlzRGF0ZSk8PTApe2lmKGNvbXBhcmVCeURheShmaXJzdFdlZWtTdGFydE5leHRZZWFyLHRoaXNEYXRlKTw9MCl7cmV0dXJuIHRoaXNEYXRlLmdldEZ1bGxZZWFyKCkrMX1lbHNle3JldHVybiB0aGlzRGF0ZS5nZXRGdWxsWWVhcigpfX1lbHNle3JldHVybiB0aGlzRGF0ZS5nZXRGdWxsWWVhcigpLTF9fXZhciBFWFBBTlNJT05fUlVMRVNfMj17IiVhIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gV0VFS0RBWVNbZGF0ZS50bV93ZGF5XS5zdWJzdHJpbmcoMCwzKX0sIiVBIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gV0VFS0RBWVNbZGF0ZS50bV93ZGF5XX0sIiViIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gTU9OVEhTW2RhdGUudG1fbW9uXS5zdWJzdHJpbmcoMCwzKX0sIiVCIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gTU9OVEhTW2RhdGUudG1fbW9uXX0sIiVDIjpmdW5jdGlvbihkYXRlKXt2YXIgeWVhcj1kYXRlLnRtX3llYXIrMTkwMDtyZXR1cm4gbGVhZGluZ051bGxzKHllYXIvMTAwfDAsMil9LCIlZCI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGxlYWRpbmdOdWxscyhkYXRlLnRtX21kYXksMil9LCIlZSI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGxlYWRpbmdTb21ldGhpbmcoZGF0ZS50bV9tZGF5LDIsIiAiKX0sIiVnIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gZ2V0V2Vla0Jhc2VkWWVhcihkYXRlKS50b1N0cmluZygpLnN1YnN0cmluZygyKX0sIiVHIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gZ2V0V2Vla0Jhc2VkWWVhcihkYXRlKX0sIiVIIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gbGVhZGluZ051bGxzKGRhdGUudG1faG91ciwyKX0sIiVJIjpmdW5jdGlvbihkYXRlKXt2YXIgdHdlbHZlSG91cj1kYXRlLnRtX2hvdXI7aWYodHdlbHZlSG91cj09MCl0d2VsdmVIb3VyPTEyO2Vsc2UgaWYodHdlbHZlSG91cj4xMil0d2VsdmVIb3VyLT0xMjtyZXR1cm4gbGVhZGluZ051bGxzKHR3ZWx2ZUhvdXIsMil9LCIlaiI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGxlYWRpbmdOdWxscyhkYXRlLnRtX21kYXkrX19hcnJheVN1bShfX2lzTGVhcFllYXIoZGF0ZS50bV95ZWFyKzE5MDApP19fTU9OVEhfREFZU19MRUFQOl9fTU9OVEhfREFZU19SRUdVTEFSLGRhdGUudG1fbW9uLTEpLDMpfSwiJW0iOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBsZWFkaW5nTnVsbHMoZGF0ZS50bV9tb24rMSwyKX0sIiVNIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gbGVhZGluZ051bGxzKGRhdGUudG1fbWluLDIpfSwiJW4iOmZ1bmN0aW9uKCl7cmV0dXJuIlxuIn0sIiVwIjpmdW5jdGlvbihkYXRlKXtpZihkYXRlLnRtX2hvdXI+PTAmJmRhdGUudG1faG91cjwxMil7cmV0dXJuIkFNIn1lbHNle3JldHVybiJQTSJ9fSwiJVMiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBsZWFkaW5nTnVsbHMoZGF0ZS50bV9zZWMsMil9LCIldCI6ZnVuY3Rpb24oKXtyZXR1cm4iXHQifSwiJXUiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBkYXRlLnRtX3dkYXl8fDd9LCIlVSI6ZnVuY3Rpb24oZGF0ZSl7dmFyIGRheXM9ZGF0ZS50bV95ZGF5KzctZGF0ZS50bV93ZGF5O3JldHVybiBsZWFkaW5nTnVsbHMoTWF0aC5mbG9vcihkYXlzLzcpLDIpfSwiJVYiOmZ1bmN0aW9uKGRhdGUpe3ZhciB2YWw9TWF0aC5mbG9vcigoZGF0ZS50bV95ZGF5KzctKGRhdGUudG1fd2RheSs2KSU3KS83KTtpZigoZGF0ZS50bV93ZGF5KzM3MS1kYXRlLnRtX3lkYXktMiklNzw9Mil7dmFsKyt9aWYoIXZhbCl7dmFsPTUyO3ZhciBkZWMzMT0oZGF0ZS50bV93ZGF5KzctZGF0ZS50bV95ZGF5LTEpJTc7aWYoZGVjMzE9PTR8fGRlYzMxPT01JiZfX2lzTGVhcFllYXIoZGF0ZS50bV95ZWFyJTQwMC0xKSl7dmFsKyt9fWVsc2UgaWYodmFsPT01Myl7dmFyIGphbjE9KGRhdGUudG1fd2RheSszNzEtZGF0ZS50bV95ZGF5KSU3O2lmKGphbjEhPTQmJihqYW4xIT0zfHwhX19pc0xlYXBZZWFyKGRhdGUudG1feWVhcikpKXZhbD0xfXJldHVybiBsZWFkaW5nTnVsbHModmFsLDIpfSwiJXciOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBkYXRlLnRtX3dkYXl9LCIlVyI6ZnVuY3Rpb24oZGF0ZSl7dmFyIGRheXM9ZGF0ZS50bV95ZGF5KzctKGRhdGUudG1fd2RheSs2KSU3O3JldHVybiBsZWFkaW5nTnVsbHMoTWF0aC5mbG9vcihkYXlzLzcpLDIpfSwiJXkiOmZ1bmN0aW9uKGRhdGUpe3JldHVybihkYXRlLnRtX3llYXIrMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMil9LCIlWSI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGRhdGUudG1feWVhcisxOTAwfSwiJXoiOmZ1bmN0aW9uKGRhdGUpe3ZhciBvZmY9ZGF0ZS50bV9nbXRvZmY7dmFyIGFoZWFkPW9mZj49MDtvZmY9TWF0aC5hYnMob2ZmKS82MDtvZmY9b2ZmLzYwKjEwMCtvZmYlNjA7cmV0dXJuKGFoZWFkPyIrIjoiLSIpK1N0cmluZygiMDAwMCIrb2ZmKS5zbGljZSgtNCl9LCIlWiI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGRhdGUudG1fem9uZX0sIiUlIjpmdW5jdGlvbigpe3JldHVybiIlIn19O3BhdHRlcm49cGF0dGVybi5yZXBsYWNlKC8lJS9nLCJcMFwwIik7Zm9yKHZhciBydWxlIGluIEVYUEFOU0lPTl9SVUxFU18yKXtpZihwYXR0ZXJuLmluY2x1ZGVzKHJ1bGUpKXtwYXR0ZXJuPXBhdHRlcm4ucmVwbGFjZShuZXcgUmVnRXhwKHJ1bGUsImciKSxFWFBBTlNJT05fUlVMRVNfMltydWxlXShkYXRlKSl9fXBhdHRlcm49cGF0dGVybi5yZXBsYWNlKC9cMFwwL2csIiUiKTt2YXIgYnl0ZXM9aW50QXJyYXlGcm9tU3RyaW5nKHBhdHRlcm4sZmFsc2UpO2lmKGJ5dGVzLmxlbmd0aD5tYXhzaXplKXtyZXR1cm4gMH13cml0ZUFycmF5VG9NZW1vcnkoYnl0ZXMscyk7cmV0dXJuIGJ5dGVzLmxlbmd0aC0xfWZ1bmN0aW9uIF9zdHJmdGltZV9sKHMsbWF4c2l6ZSxmb3JtYXQsdG0pe3JldHVybiBfc3RyZnRpbWUocyxtYXhzaXplLGZvcm1hdCx0bSl9UFRocmVhZC5pbml0KCk7dmFyIEZTTm9kZT1mdW5jdGlvbihwYXJlbnQsbmFtZSxtb2RlLHJkZXYpe2lmKCFwYXJlbnQpe3BhcmVudD10aGlzfXRoaXMucGFyZW50PXBhcmVudDt0aGlzLm1vdW50PXBhcmVudC5tb3VudDt0aGlzLm1vdW50ZWQ9bnVsbDt0aGlzLmlkPUZTLm5leHRJbm9kZSsrO3RoaXMubmFtZT1uYW1lO3RoaXMubW9kZT1tb2RlO3RoaXMubm9kZV9vcHM9e307dGhpcy5zdHJlYW1fb3BzPXt9O3RoaXMucmRldj1yZGV2fTt2YXIgcmVhZE1vZGU9MjkyfDczO3ZhciB3cml0ZU1vZGU9MTQ2O09iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZTTm9kZS5wcm90b3R5cGUse3JlYWQ6e2dldDpmdW5jdGlvbigpe3JldHVybih0aGlzLm1vZGUmcmVhZE1vZGUpPT09cmVhZE1vZGV9LHNldDpmdW5jdGlvbih2YWwpe3ZhbD90aGlzLm1vZGV8PXJlYWRNb2RlOnRoaXMubW9kZSY9fnJlYWRNb2RlfX0sd3JpdGU6e2dldDpmdW5jdGlvbigpe3JldHVybih0aGlzLm1vZGUmd3JpdGVNb2RlKT09PXdyaXRlTW9kZX0sc2V0OmZ1bmN0aW9uKHZhbCl7dmFsP3RoaXMubW9kZXw9d3JpdGVNb2RlOnRoaXMubW9kZSY9fndyaXRlTW9kZX19LGlzRm9sZGVyOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gRlMuaXNEaXIodGhpcy5tb2RlKX19LGlzRGV2aWNlOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gRlMuaXNDaHJkZXYodGhpcy5tb2RlKX19fSk7RlMuRlNOb2RlPUZTTm9kZTtGUy5zdGF0aWNJbml0KCk7ZW1iaW5kX2luaXRfY2hhckNvZGVzKCk7QmluZGluZ0Vycm9yPU1vZHVsZVsiQmluZGluZ0Vycm9yIl09ZXh0ZW5kRXJyb3IoRXJyb3IsIkJpbmRpbmdFcnJvciIpO0ludGVybmFsRXJyb3I9TW9kdWxlWyJJbnRlcm5hbEVycm9yIl09ZXh0ZW5kRXJyb3IoRXJyb3IsIkludGVybmFsRXJyb3IiKTtpbml0X0NsYXNzSGFuZGxlKCk7aW5pdF9lbWJpbmQoKTtpbml0X1JlZ2lzdGVyZWRQb2ludGVyKCk7VW5ib3VuZFR5cGVFcnJvcj1Nb2R1bGVbIlVuYm91bmRUeXBlRXJyb3IiXT1leHRlbmRFcnJvcihFcnJvciwiVW5ib3VuZFR5cGVFcnJvciIpO2luaXRfZW12YWwoKTt2YXIgcHJveGllZEZ1bmN0aW9uVGFibGU9W251bGwsZXhpdE9uTWFpblRocmVhZCxwdGhyZWFkQ3JlYXRlUHJveGllZCxfX19zeXNjYWxsX2ZjbnRsNjQsX19fc3lzY2FsbF9mc3RhdDY0LF9fX3N5c2NhbGxfZnRydW5jYXRlNjQsX19fc3lzY2FsbF9pb2N0bCxfX19zeXNjYWxsX2xzdGF0NjQsX19fc3lzY2FsbF9uZXdmc3RhdGF0LF9fX3N5c2NhbGxfb3BlbmF0LF9fX3N5c2NhbGxfcmVuYW1lYXQsX19fc3lzY2FsbF9zdGF0NjQsX19fc3lzY2FsbF91bmxpbmthdCxfX21tYXBfanMsX19tdW5tYXBfanMsX2Vudmlyb25fZ2V0LF9lbnZpcm9uX3NpemVzX2dldCxfZmRfY2xvc2UsX2ZkX3JlYWQsX2ZkX3NlZWssX2ZkX3N5bmMsX2ZkX3dyaXRlXTtmdW5jdGlvbiBpbnRBcnJheUZyb21TdHJpbmcoc3RyaW5neSxkb250QWRkTnVsbCxsZW5ndGgpe3ZhciBsZW49bGVuZ3RoPjA/bGVuZ3RoOmxlbmd0aEJ5dGVzVVRGOChzdHJpbmd5KSsxO3ZhciB1OGFycmF5PW5ldyBBcnJheShsZW4pO3ZhciBudW1CeXRlc1dyaXR0ZW49c3RyaW5nVG9VVEY4QXJyYXkoc3RyaW5neSx1OGFycmF5LDAsdThhcnJheS5sZW5ndGgpO2lmKGRvbnRBZGROdWxsKXU4YXJyYXkubGVuZ3RoPW51bUJ5dGVzV3JpdHRlbjtyZXR1cm4gdThhcnJheX12YXIgYXNtTGlicmFyeUFyZz17ImIiOl9fX2Fzc2VydF9mYWlsLCJuIjpfX19jeGFfYWxsb2NhdGVfZXhjZXB0aW9uLCJ1IjpfX19jeGFfYmVnaW5fY2F0Y2gsImxhIjpfX19jeGFfY3VycmVudF9wcmltYXJ5X2V4Y2VwdGlvbiwiUiI6X19fY3hhX2RlY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQsIngiOl9fX2N4YV9lbmRfY2F0Y2gsImUiOl9fX2N4YV9maW5kX21hdGNoaW5nX2NhdGNoXzIsImoiOl9fX2N4YV9maW5kX21hdGNoaW5nX2NhdGNoXzMsInMiOl9fX2N4YV9mcmVlX2V4Y2VwdGlvbiwiUSI6X19fY3hhX2luY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQsImFhIjpfX19jeGFfcmV0aHJvdywia2EiOl9fX2N4YV9yZXRocm93X3ByaW1hcnlfZXhjZXB0aW9uLCJyIjpfX19jeGFfdGhyb3csIm1hIjpfX19jeGFfdW5jYXVnaHRfZXhjZXB0aW9ucywid2EiOl9fX2Vtc2NyaXB0ZW5faW5pdF9tYWluX3RocmVhZF9qcywiUyI6X19fZW1zY3JpcHRlbl90aHJlYWRfY2xlYW51cCwicmEiOl9fX3B0aHJlYWRfY3JlYXRlX2pzLCJmIjpfX19yZXN1bWVFeGNlcHRpb24sIkZhIjpfX19zeXNjYWxsX2ZzdGF0NjQsImVhIjpfX19zeXNjYWxsX2Z0cnVuY2F0ZTY0LCJDYSI6X19fc3lzY2FsbF9sc3RhdDY0LCJEYSI6X19fc3lzY2FsbF9uZXdmc3RhdGF0LCJIYSI6X19fc3lzY2FsbF9vcGVuYXQsInFhIjpfX19zeXNjYWxsX3JlbmFtZWF0LCJFYSI6X19fc3lzY2FsbF9zdGF0NjQsIm9hIjpfX19zeXNjYWxsX3VubGlua2F0LCJLYSI6X19kbGluaXQsIlciOl9fZGxvcGVuX2pzLCJMYSI6X19kbHN5bV9qcywiZmEiOl9fZW1iaW5kX3JlZ2lzdGVyX2JpZ2ludCwiTmEiOl9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2wsIlhhIjpfX2VtYmluZF9yZWdpc3Rlcl9jbGFzcywiV2EiOl9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2NvbnN0cnVjdG9yLCJ5IjpfX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19mdW5jdGlvbiwiTWEiOl9fZW1iaW5kX3JlZ2lzdGVyX2VtdmFsLCJaIjpfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdCwiQSI6X19lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlciwidCI6X19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXcsIlkiOl9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmcsIkwiOl9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nLCJPYSI6X19lbWJpbmRfcmVnaXN0ZXJfdm9pZCwiViI6X19lbXNjcmlwdGVuX2RhdGVfbm93LCJzYSI6X19lbXNjcmlwdGVuX2RlZmF1bHRfcHRocmVhZF9zdGFja19zaXplLCJKYSI6X19lbXNjcmlwdGVuX2dldF9ub3dfaXNfbW9ub3RvbmljLCJ0YSI6X19lbXNjcmlwdGVuX25vdGlmeV90YXNrX3F1ZXVlLCJ5YSI6X19lbXNjcmlwdGVuX3NldF9vZmZzY3JlZW5jYW52YXNfc2l6ZSwiU2EiOl9fZW12YWxfZGVjcmVmLCJpYSI6X19lbXZhbF9pbmNyZWYsIkkiOl9fZW12YWxfdGFrZV92YWx1ZSwidWEiOl9fbW1hcF9qcywidmEiOl9fbXVubWFwX2pzLCJkIjpfYWJvcnQsIlQiOl9lbXNjcmlwdGVuX2NoZWNrX2Jsb2NraW5nX2FsbG93ZWQsInBhIjpfZW1zY3JpcHRlbl9nZXRfaGVhcF9tYXgsInciOl9lbXNjcmlwdGVuX2dldF9ub3csIkdhIjpfZW1zY3JpcHRlbl9tZW1jcHlfYmlnLCJfIjpfZW1zY3JpcHRlbl9udW1fbG9naWNhbF9jb3JlcywieGEiOl9lbXNjcmlwdGVuX3JlY2VpdmVfb25fbWFpbl90aHJlYWRfanMsIm5hIjpfZW1zY3JpcHRlbl9yZXNpemVfaGVhcCwiSWEiOl9lbXNjcmlwdGVuX3Vud2luZF90b19qc19ldmVudF9sb29wLCJ6YSI6X2Vudmlyb25fZ2V0LCJBYSI6X2Vudmlyb25fc2l6ZXNfZ2V0LCIkIjpfZXhpdCwiWCI6X2ZkX2Nsb3NlLCJVIjpfZmRfcmVhZCwiVmEiOl9mZF9zZWVrLCJCYSI6X2ZkX3N5bmMsIksiOl9mZF93cml0ZSwiYyI6X2dldFRlbXBSZXQwLCJnYSI6X2dldGVudHJvcHksIk4iOmludm9rZV9kaWlpLCJSYSI6aW52b2tlX2ZpLCJPIjppbnZva2VfZmlpaSwicSI6aW52b2tlX2ksImciOmludm9rZV9paSwiUGEiOmludm9rZV9paWRpaSwiaCI6aW52b2tlX2lpaSwibSI6aW52b2tlX2lpaWksIm8iOmludm9rZV9paWlpaSwiamEiOmludm9rZV9paWlpaWQsIkUiOmludm9rZV9paWlpaWksInoiOmludm9rZV9paWlpaWlpLCJQIjppbnZva2VfaWlpaWlpaWksIkgiOmludm9rZV9paWlpaWlpaWlpaWksIlVhIjppbnZva2VfaiwiVGEiOmludm9rZV9qaWlpaSwibCI6aW52b2tlX3YsImsiOmludm9rZV92aSwiaSI6aW52b2tlX3ZpaSwiQyI6aW52b2tlX3ZpaWQsIk0iOmludm9rZV92aWlkaSwicCI6aW52b2tlX3ZpaWksIlFhIjppbnZva2VfdmlpaWRpaWksIkoiOmludm9rZV92aWlpaSwiY2EiOmludm9rZV92aWlpaWRpLCJkYSI6aW52b2tlX3ZpaWlpaSwidiI6aW52b2tlX3ZpaWlpaWlpLCJGIjppbnZva2VfdmlpaWlpaWlkaSwiYmEiOmludm9rZV92aWlpaWlpaWksIkQiOmludm9rZV92aWlpaWlpaWlpaSwiRyI6aW52b2tlX3ZpaWlpaWlpaWlpaWlpaWksImEiOndhc21NZW1vcnl8fE1vZHVsZVsid2FzbU1lbW9yeSJdLCJCIjpfc2V0VGVtcFJldDAsImhhIjpfc3RyZnRpbWVfbH07dmFyIGFzbT1jcmVhdGVXYXNtKCk7dmFyIF9fX3dhc21fY2FsbF9jdG9ycz1Nb2R1bGVbIl9fX3dhc21fY2FsbF9jdG9ycyJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX3dhc21fY2FsbF9jdG9ycz1Nb2R1bGVbIl9fX3dhc21fY2FsbF9jdG9ycyJdPU1vZHVsZVsiYXNtIl1bIllhIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9tYWxsb2M9TW9kdWxlWyJfbWFsbG9jIl09ZnVuY3Rpb24oKXtyZXR1cm4oX21hbGxvYz1Nb2R1bGVbIl9tYWxsb2MiXT1Nb2R1bGVbImFzbSJdWyJfYSJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfZnJlZT1Nb2R1bGVbIl9mcmVlIl09ZnVuY3Rpb24oKXtyZXR1cm4oX2ZyZWU9TW9kdWxlWyJfZnJlZSJdPU1vZHVsZVsiYXNtIl1bIiRhIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX2Vycm5vX2xvY2F0aW9uPU1vZHVsZVsiX19fZXJybm9fbG9jYXRpb24iXT1mdW5jdGlvbigpe3JldHVybihfX19lcnJub19sb2NhdGlvbj1Nb2R1bGVbIl9fX2Vycm5vX2xvY2F0aW9uIl09TW9kdWxlWyJhc20iXVsiYWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX3B0aHJlYWRfc2VsZj1Nb2R1bGVbIl9wdGhyZWFkX3NlbGYiXT1mdW5jdGlvbigpe3JldHVybihfcHRocmVhZF9zZWxmPU1vZHVsZVsiX3B0aHJlYWRfc2VsZiJdPU1vZHVsZVsiYXNtIl1bImJiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9lbXNjcmlwdGVuX3Rsc19pbml0PU1vZHVsZVsiX2Vtc2NyaXB0ZW5fdGxzX2luaXQiXT1mdW5jdGlvbigpe3JldHVybihfZW1zY3JpcHRlbl90bHNfaW5pdD1Nb2R1bGVbIl9lbXNjcmlwdGVuX3Rsc19pbml0Il09TW9kdWxlWyJhc20iXVsiY2IiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX2Vtc2NyaXB0ZW5fYnVpbHRpbl9tZW1hbGlnbj1Nb2R1bGVbIl9lbXNjcmlwdGVuX2J1aWx0aW5fbWVtYWxpZ24iXT1mdW5jdGlvbigpe3JldHVybihfZW1zY3JpcHRlbl9idWlsdGluX21lbWFsaWduPU1vZHVsZVsiX2Vtc2NyaXB0ZW5fYnVpbHRpbl9tZW1hbGlnbiJdPU1vZHVsZVsiYXNtIl1bImRiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX2dldFR5cGVOYW1lPU1vZHVsZVsiX19fZ2V0VHlwZU5hbWUiXT1mdW5jdGlvbigpe3JldHVybihfX19nZXRUeXBlTmFtZT1Nb2R1bGVbIl9fX2dldFR5cGVOYW1lIl09TW9kdWxlWyJhc20iXVsiZWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19fZW1iaW5kX3JlZ2lzdGVyX25hdGl2ZV9hbmRfYnVpbHRpbl90eXBlcz1Nb2R1bGVbIl9fX2VtYmluZF9yZWdpc3Rlcl9uYXRpdmVfYW5kX2J1aWx0aW5fdHlwZXMiXT1mdW5jdGlvbigpe3JldHVybihfX19lbWJpbmRfcmVnaXN0ZXJfbmF0aXZlX2FuZF9idWlsdGluX3R5cGVzPU1vZHVsZVsiX19fZW1iaW5kX3JlZ2lzdGVyX25hdGl2ZV9hbmRfYnVpbHRpbl90eXBlcyJdPU1vZHVsZVsiYXNtIl1bImZiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX3N0ZGlvX2V4aXQ9TW9kdWxlWyJfX19zdGRpb19leGl0Il09ZnVuY3Rpb24oKXtyZXR1cm4oX19fc3RkaW9fZXhpdD1Nb2R1bGVbIl9fX3N0ZGlvX2V4aXQiXT1Nb2R1bGVbImFzbSJdWyJnYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX19mdW5jc19vbl9leGl0PU1vZHVsZVsiX19fZnVuY3Nfb25fZXhpdCJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX2Z1bmNzX29uX2V4aXQ9TW9kdWxlWyJfX19mdW5jc19vbl9leGl0Il09TW9kdWxlWyJhc20iXVsiaGIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19lbXNjcmlwdGVuX3RocmVhZF9pbml0PU1vZHVsZVsiX19lbXNjcmlwdGVuX3RocmVhZF9pbml0Il09ZnVuY3Rpb24oKXtyZXR1cm4oX19lbXNjcmlwdGVuX3RocmVhZF9pbml0PU1vZHVsZVsiX19lbXNjcmlwdGVuX3RocmVhZF9pbml0Il09TW9kdWxlWyJhc20iXVsiaWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkPU1vZHVsZVsiX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkIl09ZnVuY3Rpb24oKXtyZXR1cm4oX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkPU1vZHVsZVsiX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkIl09TW9kdWxlWyJhc20iXVsiamIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX2Vtc2NyaXB0ZW5fcnVuX2luX21haW5fcnVudGltZV90aHJlYWRfanM9TW9kdWxlWyJfZW1zY3JpcHRlbl9ydW5faW5fbWFpbl9ydW50aW1lX3RocmVhZF9qcyJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9lbXNjcmlwdGVuX3J1bl9pbl9tYWluX3J1bnRpbWVfdGhyZWFkX2pzPU1vZHVsZVsiX2Vtc2NyaXB0ZW5fcnVuX2luX21haW5fcnVudGltZV90aHJlYWRfanMiXT1Nb2R1bGVbImFzbSJdWyJrYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX2Vtc2NyaXB0ZW5fcHJveHlfZXhlY3V0ZV90YXNrX3F1ZXVlPU1vZHVsZVsiX19lbXNjcmlwdGVuX3Byb3h5X2V4ZWN1dGVfdGFza19xdWV1ZSJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fZW1zY3JpcHRlbl9wcm94eV9leGVjdXRlX3Rhc2tfcXVldWU9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fcHJveHlfZXhlY3V0ZV90YXNrX3F1ZXVlIl09TW9kdWxlWyJhc20iXVsibGIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19lbXNjcmlwdGVuX3RocmVhZF9mcmVlX2RhdGE9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2ZyZWVfZGF0YSJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fZW1zY3JpcHRlbl90aHJlYWRfZnJlZV9kYXRhPU1vZHVsZVsiX19lbXNjcmlwdGVuX3RocmVhZF9mcmVlX2RhdGEiXT1Nb2R1bGVbImFzbSJdWyJtYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQiXT1mdW5jdGlvbigpe3JldHVybihfX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQiXT1Nb2R1bGVbImFzbSJdWyJuYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfc2V0VGhyZXc9TW9kdWxlWyJfc2V0VGhyZXciXT1mdW5jdGlvbigpe3JldHVybihfc2V0VGhyZXc9TW9kdWxlWyJfc2V0VGhyZXciXT1Nb2R1bGVbImFzbSJdWyJvYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfZW1zY3JpcHRlbl9zdGFja19zZXRfbGltaXRzPU1vZHVsZVsiX2Vtc2NyaXB0ZW5fc3RhY2tfc2V0X2xpbWl0cyJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9lbXNjcmlwdGVuX3N0YWNrX3NldF9saW1pdHM9TW9kdWxlWyJfZW1zY3JpcHRlbl9zdGFja19zZXRfbGltaXRzIl09TW9kdWxlWyJhc20iXVsicGIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgc3RhY2tTYXZlPU1vZHVsZVsic3RhY2tTYXZlIl09ZnVuY3Rpb24oKXtyZXR1cm4oc3RhY2tTYXZlPU1vZHVsZVsic3RhY2tTYXZlIl09TW9kdWxlWyJhc20iXVsicWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgc3RhY2tSZXN0b3JlPU1vZHVsZVsic3RhY2tSZXN0b3JlIl09ZnVuY3Rpb24oKXtyZXR1cm4oc3RhY2tSZXN0b3JlPU1vZHVsZVsic3RhY2tSZXN0b3JlIl09TW9kdWxlWyJhc20iXVsicmIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgc3RhY2tBbGxvYz1Nb2R1bGVbInN0YWNrQWxsb2MiXT1mdW5jdGlvbigpe3JldHVybihzdGFja0FsbG9jPU1vZHVsZVsic3RhY2tBbGxvYyJdPU1vZHVsZVsiYXNtIl1bInNiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX2N4YV9jYW5fY2F0Y2g9TW9kdWxlWyJfX19jeGFfY2FuX2NhdGNoIl09ZnVuY3Rpb24oKXtyZXR1cm4oX19fY3hhX2Nhbl9jYXRjaD1Nb2R1bGVbIl9fX2N4YV9jYW5fY2F0Y2giXT1Nb2R1bGVbImFzbSJdWyJ0YiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX19jeGFfaXNfcG9pbnRlcl90eXBlPU1vZHVsZVsiX19fY3hhX2lzX3BvaW50ZXJfdHlwZSJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX2N4YV9pc19wb2ludGVyX3R5cGU9TW9kdWxlWyJfX19jeGFfaXNfcG9pbnRlcl90eXBlIl09TW9kdWxlWyJhc20iXVsidWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9paWlpaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWoiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2lpaWlqPU1vZHVsZVsiZHluQ2FsbF9paWlpaiJdPU1vZHVsZVsiYXNtIl1bInZiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfamlpPU1vZHVsZVsiZHluQ2FsbF9qaWkiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2ppaT1Nb2R1bGVbImR5bkNhbGxfamlpIl09TW9kdWxlWyJhc20iXVsid2IiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9qamo9TW9kdWxlWyJkeW5DYWxsX2pqaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfampqPU1vZHVsZVsiZHluQ2FsbF9qamoiXT1Nb2R1bGVbImFzbSJdWyJ4YiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2pqaT1Nb2R1bGVbImR5bkNhbGxfamppIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qamk9TW9kdWxlWyJkeW5DYWxsX2pqaSJdPU1vZHVsZVsiYXNtIl1bInliIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfamlpaT1Nb2R1bGVbImR5bkNhbGxfamlpaSJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfamlpaT1Nb2R1bGVbImR5bkNhbGxfamlpaSJdPU1vZHVsZVsiYXNtIl1bInpiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfaWlpaWpqPU1vZHVsZVsiZHluQ2FsbF9paWlpamoiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2lpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWpqIl09TW9kdWxlWyJhc20iXVsiQWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF92aWlqaj1Nb2R1bGVbImR5bkNhbGxfdmlpamoiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX3ZpaWpqPU1vZHVsZVsiZHluQ2FsbF92aWlqaiJdPU1vZHVsZVsiYXNtIl1bIkJiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfdmlpaWpqamo9TW9kdWxlWyJkeW5DYWxsX3ZpaWlqampqIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF92aWlpampqaj1Nb2R1bGVbImR5bkNhbGxfdmlpaWpqamoiXT1Nb2R1bGVbImFzbSJdWyJDYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2lpamppaWlpPU1vZHVsZVsiZHluQ2FsbF9paWpqaWlpaSJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlqamlpaWk9TW9kdWxlWyJkeW5DYWxsX2lpamppaWlpIl09TW9kdWxlWyJhc20iXVsiRGIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9qaWppPU1vZHVsZVsiZHluQ2FsbF9qaWppIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qaWppPU1vZHVsZVsiZHluQ2FsbF9qaWppIl09TW9kdWxlWyJhc20iXVsiRWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9qPU1vZHVsZVsiZHluQ2FsbF9qIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qPU1vZHVsZVsiZHluQ2FsbF9qIl09TW9kdWxlWyJhc20iXVsiRmIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF92aWlqaWk9TW9kdWxlWyJkeW5DYWxsX3ZpaWppaSJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfdmlpamlpPU1vZHVsZVsiZHluQ2FsbF92aWlqaWkiXT1Nb2R1bGVbImFzbSJdWyJHYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2ppaWlpPU1vZHVsZVsiZHluQ2FsbF9qaWlpaSJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfamlpaWk9TW9kdWxlWyJkeW5DYWxsX2ppaWlpIl09TW9kdWxlWyJhc20iXVsiSGIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9paWlpaWo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlpaWlqPU1vZHVsZVsiZHluQ2FsbF9paWlpaWoiXT1Nb2R1bGVbImFzbSJdWyJJYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2lpaWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpamoiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2lpaWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpamoiXT1Nb2R1bGVbImFzbSJdWyJKYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2lpaWlpaWpqPU1vZHVsZVsiZHluQ2FsbF9paWlpaWlqaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlpaWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpaWpqIl09TW9kdWxlWyJhc20iXVsiS2IiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19lbXNjcmlwdGVuX2FsbG93X21haW5fcnVudGltZV9xdWV1ZWRfY2FsbHM9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fYWxsb3dfbWFpbl9ydW50aW1lX3F1ZXVlZF9jYWxscyJdPTI0MDM1NjtmdW5jdGlvbiBpbnZva2VfaWkoaW5kZXgsYTEpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWkoaW5kZXgsYTEsYTIpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aShpbmRleCxhMSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaShpbmRleCxhMSxhMixhMyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaShpbmRleCxhMSxhMil7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaShpbmRleCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpKGluZGV4LGExLGEyLGEzKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9maShpbmRleCxhMSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaWlpZGkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3YoaW5kZXgpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWRpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpZGlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpZChpbmRleCxhMSxhMixhMyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNixhNyxhOCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWRpKGluZGV4LGExLGEyLGEzLGE0KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlkaWkoaW5kZXgsYTEsYTIsYTMsYTQpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpaWQoaW5kZXgsYTEsYTIsYTMsYTQsYTUpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2ZpaWkoaW5kZXgsYTEsYTIsYTMpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9kaWlpKGluZGV4LGExLGEyLGEzKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYsYTcpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpaWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSxhMTAsYTExKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTksYTEwLGExMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSxhMTApe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWlpaWlpaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCxhMTEsYTEyLGExMyxhMTQsYTE1KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSxhMTAsYTExLGExMixhMTMsYTE0LGExNSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9qKGluZGV4KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBkeW5DYWxsX2ooaW5kZXgpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfamlpaWkoaW5kZXgsYTEsYTIsYTMsYTQpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGR5bkNhbGxfamlpaWkoaW5kZXgsYTEsYTIsYTMsYTQpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1Nb2R1bGVbImtlZXBSdW50aW1lQWxpdmUiXT1rZWVwUnVudGltZUFsaXZlO01vZHVsZVsid2FzbU1lbW9yeSJdPXdhc21NZW1vcnk7TW9kdWxlWyJFeGl0U3RhdHVzIl09RXhpdFN0YXR1cztNb2R1bGVbIlBUaHJlYWQiXT1QVGhyZWFkO3ZhciBjYWxsZWRSdW47ZnVuY3Rpb24gRXhpdFN0YXR1cyhzdGF0dXMpe3RoaXMubmFtZT0iRXhpdFN0YXR1cyI7dGhpcy5tZXNzYWdlPSJQcm9ncmFtIHRlcm1pbmF0ZWQgd2l0aCBleGl0KCIrc3RhdHVzKyIpIjt0aGlzLnN0YXR1cz1zdGF0dXN9ZGVwZW5kZW5jaWVzRnVsZmlsbGVkPWZ1bmN0aW9uIHJ1bkNhbGxlcigpe2lmKCFjYWxsZWRSdW4pcnVuKCk7aWYoIWNhbGxlZFJ1bilkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9cnVuQ2FsbGVyfTtmdW5jdGlvbiBydW4oYXJncyl7YXJncz1hcmdzfHxhcmd1bWVudHNfO2lmKHJ1bkRlcGVuZGVuY2llcz4wKXtyZXR1cm59aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCl7cmVhZHlQcm9taXNlUmVzb2x2ZShNb2R1bGUpO2luaXRSdW50aW1lKCk7cG9zdE1lc3NhZ2UoeyJjbWQiOiJsb2FkZWQifSk7cmV0dXJufXByZVJ1bigpO2lmKHJ1bkRlcGVuZGVuY2llcz4wKXtyZXR1cm59ZnVuY3Rpb24gZG9SdW4oKXtpZihjYWxsZWRSdW4pcmV0dXJuO2NhbGxlZFJ1bj10cnVlO01vZHVsZVsiY2FsbGVkUnVuIl09dHJ1ZTtpZihBQk9SVClyZXR1cm47aW5pdFJ1bnRpbWUoKTtyZWFkeVByb21pc2VSZXNvbHZlKE1vZHVsZSk7aWYoTW9kdWxlWyJvblJ1bnRpbWVJbml0aWFsaXplZCJdKU1vZHVsZVsib25SdW50aW1lSW5pdGlhbGl6ZWQiXSgpO3Bvc3RSdW4oKX1pZihNb2R1bGVbInNldFN0YXR1cyJdKXtNb2R1bGVbInNldFN0YXR1cyJdKCJSdW5uaW5nLi4uIik7c2V0VGltZW91dChmdW5jdGlvbigpe3NldFRpbWVvdXQoZnVuY3Rpb24oKXtNb2R1bGVbInNldFN0YXR1cyJdKCIiKX0sMSk7ZG9SdW4oKX0sMSl9ZWxzZXtkb1J1bigpfX1Nb2R1bGVbInJ1biJdPXJ1bjtmdW5jdGlvbiBleGl0KHN0YXR1cyxpbXBsaWNpdCl7RVhJVFNUQVRVUz1zdGF0dXM7aWYoIWltcGxpY2l0KXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXtleGl0T25NYWluVGhyZWFkKHN0YXR1cyk7dGhyb3cidW53aW5kIn1lbHNle319aWYoIWtlZXBSdW50aW1lQWxpdmUoKSl7ZXhpdFJ1bnRpbWUoKX1wcm9jRXhpdChzdGF0dXMpfWZ1bmN0aW9uIHByb2NFeGl0KGNvZGUpe0VYSVRTVEFUVVM9Y29kZTtpZigha2VlcFJ1bnRpbWVBbGl2ZSgpKXtQVGhyZWFkLnRlcm1pbmF0ZUFsbFRocmVhZHMoKTtpZihNb2R1bGVbIm9uRXhpdCJdKU1vZHVsZVsib25FeGl0Il0oY29kZSk7QUJPUlQ9dHJ1ZX1xdWl0Xyhjb2RlLG5ldyBFeGl0U3RhdHVzKGNvZGUpKX1pZihNb2R1bGVbInByZUluaXQiXSl7aWYodHlwZW9mIE1vZHVsZVsicHJlSW5pdCJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlSW5pdCJdPVtNb2R1bGVbInByZUluaXQiXV07d2hpbGUoTW9kdWxlWyJwcmVJbml0Il0ubGVuZ3RoPjApe01vZHVsZVsicHJlSW5pdCJdLnBvcCgpKCl9fXJ1bigpOwoKCiAgcmV0dXJuIE1vZHVsZS5yZWFkeQp9Cik7Cn0pKCk7CmNyZWF0ZVdhc21NdWx0aUluc3RhbmNlID0gTW9kdWxlOyB9ICAgIGxldCBjcmVhdGVXYXNtTW9ub0luc3RhbmNlOyB7Cgp2YXIgTW9kdWxlID0gKCgpID0+IHsKICB2YXIgX3NjcmlwdERpciA9IGxvY2F0aW9uLmhyZWY7CiAgCiAgcmV0dXJuICgKZnVuY3Rpb24oTW9kdWxlKSB7CiAgTW9kdWxlID0gTW9kdWxlIHx8IHt9OwoKdmFyIE1vZHVsZT10eXBlb2YgTW9kdWxlIT0idW5kZWZpbmVkIj9Nb2R1bGU6e307dmFyIHJlYWR5UHJvbWlzZVJlc29sdmUscmVhZHlQcm9taXNlUmVqZWN0O01vZHVsZVsicmVhZHkiXT1uZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLHJlamVjdCl7cmVhZHlQcm9taXNlUmVzb2x2ZT1yZXNvbHZlO3JlYWR5UHJvbWlzZVJlamVjdD1yZWplY3R9KTt2YXIgbW9kdWxlT3ZlcnJpZGVzPU9iamVjdC5hc3NpZ24oe30sTW9kdWxlKTt2YXIgYXJndW1lbnRzXz1bXTt2YXIgdGhpc1Byb2dyYW09Ii4vdGhpcy5wcm9ncmFtIjt2YXIgcXVpdF89KHN0YXR1cyx0b1Rocm93KT0+e3Rocm93IHRvVGhyb3d9O3ZhciBFTlZJUk9OTUVOVF9JU19XRUI9dHlwZW9mIHdpbmRvdz09Im9iamVjdCI7dmFyIEVOVklST05NRU5UX0lTX1dPUktFUj10eXBlb2YgaW1wb3J0U2NyaXB0cz09ImZ1bmN0aW9uIjt2YXIgRU5WSVJPTk1FTlRfSVNfTk9ERT10eXBlb2YgcHJvY2Vzcz09Im9iamVjdCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zPT0ib2JqZWN0IiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZT09InN0cmluZyI7dmFyIHNjcmlwdERpcmVjdG9yeT0iIjtmdW5jdGlvbiBsb2NhdGVGaWxlKHBhdGgpe2lmKE1vZHVsZVsibG9jYXRlRmlsZSJdKXtyZXR1cm4gTW9kdWxlWyJsb2NhdGVGaWxlIl0ocGF0aCxzY3JpcHREaXJlY3RvcnkpfXJldHVybiBzY3JpcHREaXJlY3RvcnkrcGF0aH12YXIgcmVhZF8scmVhZEFzeW5jLHJlYWRCaW5hcnksc2V0V2luZG93VGl0bGU7aWYoRU5WSVJPTk1FTlRfSVNfV0VCfHxFTlZJUk9OTUVOVF9JU19XT1JLRVIpe2lmKEVOVklST05NRU5UX0lTX1dPUktFUil7c2NyaXB0RGlyZWN0b3J5PXNlbGYubG9jYXRpb24uaHJlZn1lbHNlIGlmKHR5cGVvZiBkb2N1bWVudCE9InVuZGVmaW5lZCImJmRvY3VtZW50LmN1cnJlbnRTY3JpcHQpe3NjcmlwdERpcmVjdG9yeT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY31pZihfc2NyaXB0RGlyKXtzY3JpcHREaXJlY3Rvcnk9X3NjcmlwdERpcn1pZihzY3JpcHREaXJlY3RvcnkuaW5kZXhPZigiYmxvYjoiKSE9PTApe3NjcmlwdERpcmVjdG9yeT1zY3JpcHREaXJlY3Rvcnkuc3Vic3RyKDAsc2NyaXB0RGlyZWN0b3J5LnJlcGxhY2UoL1s/I10uKi8sIiIpLmxhc3RJbmRleE9mKCIvIikrMSl9ZWxzZXtzY3JpcHREaXJlY3Rvcnk9IiJ9e3JlYWRfPSh1cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5zZW5kKG51bGwpO3JldHVybiB4aHIucmVzcG9uc2VUZXh0fSk7aWYoRU5WSVJPTk1FTlRfSVNfV09SS0VSKXtyZWFkQmluYXJ5PSh1cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlKX0pfXJlYWRBc3luYz0oKHVybCxvbmxvYWQsb25lcnJvcik9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsdHJ1ZSk7eGhyLnJlc3BvbnNlVHlwZT0iYXJyYXlidWZmZXIiO3hoci5vbmxvYWQ9KCgpPT57aWYoeGhyLnN0YXR1cz09MjAwfHx4aHIuc3RhdHVzPT0wJiZ4aHIucmVzcG9uc2Upe29ubG9hZCh4aHIucmVzcG9uc2UpO3JldHVybn1vbmVycm9yKCl9KTt4aHIub25lcnJvcj1vbmVycm9yO3hoci5zZW5kKG51bGwpfSl9c2V0V2luZG93VGl0bGU9KHRpdGxlPT5kb2N1bWVudC50aXRsZT10aXRsZSl9ZWxzZXt9dmFyIG91dD1Nb2R1bGVbInByaW50Il18fGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSk7dmFyIGVycj1Nb2R1bGVbInByaW50RXJyIl18fGNvbnNvbGUud2Fybi5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oTW9kdWxlLG1vZHVsZU92ZXJyaWRlcyk7bW9kdWxlT3ZlcnJpZGVzPW51bGw7aWYoTW9kdWxlWyJhcmd1bWVudHMiXSlhcmd1bWVudHNfPU1vZHVsZVsiYXJndW1lbnRzIl07aWYoTW9kdWxlWyJ0aGlzUHJvZ3JhbSJdKXRoaXNQcm9ncmFtPU1vZHVsZVsidGhpc1Byb2dyYW0iXTtpZihNb2R1bGVbInF1aXQiXSlxdWl0Xz1Nb2R1bGVbInF1aXQiXTt2YXIgdGVtcFJldDA9MDt2YXIgc2V0VGVtcFJldDA9dmFsdWU9Pnt0ZW1wUmV0MD12YWx1ZX07dmFyIGdldFRlbXBSZXQwPSgpPT50ZW1wUmV0MDt2YXIgd2FzbUJpbmFyeTtpZihNb2R1bGVbIndhc21CaW5hcnkiXSl3YXNtQmluYXJ5PU1vZHVsZVsid2FzbUJpbmFyeSJdO3ZhciBub0V4aXRSdW50aW1lPU1vZHVsZVsibm9FeGl0UnVudGltZSJdfHxmYWxzZTtpZih0eXBlb2YgV2ViQXNzZW1ibHkhPSJvYmplY3QiKXthYm9ydCgibm8gbmF0aXZlIHdhc20gc3VwcG9ydCBkZXRlY3RlZCIpfXZhciB3YXNtTWVtb3J5O3ZhciBBQk9SVD1mYWxzZTt2YXIgRVhJVFNUQVRVUztmdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLHRleHQpe2lmKCFjb25kaXRpb24pe2Fib3J0KHRleHQpfX12YXIgVVRGOERlY29kZXI9dHlwZW9mIFRleHREZWNvZGVyIT0idW5kZWZpbmVkIj9uZXcgVGV4dERlY29kZXIoInV0ZjgiKTp1bmRlZmluZWQ7ZnVuY3Rpb24gVVRGOEFycmF5VG9TdHJpbmcoaGVhcE9yQXJyYXksaWR4LG1heEJ5dGVzVG9SZWFkKXt2YXIgZW5kSWR4PWlkeCttYXhCeXRlc1RvUmVhZDt2YXIgZW5kUHRyPWlkeDt3aGlsZShoZWFwT3JBcnJheVtlbmRQdHJdJiYhKGVuZFB0cj49ZW5kSWR4KSkrK2VuZFB0cjtpZihlbmRQdHItaWR4PjE2JiZoZWFwT3JBcnJheS5idWZmZXImJlVURjhEZWNvZGVyKXtyZXR1cm4gVVRGOERlY29kZXIuZGVjb2RlKGhlYXBPckFycmF5LnN1YmFycmF5KGlkeCxlbmRQdHIpKX1lbHNle3ZhciBzdHI9IiI7d2hpbGUoaWR4PGVuZFB0cil7dmFyIHUwPWhlYXBPckFycmF5W2lkeCsrXTtpZighKHUwJjEyOCkpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1MCk7Y29udGludWV9dmFyIHUxPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjI0KT09MTkyKXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoKHUwJjMxKTw8Nnx1MSk7Y29udGludWV9dmFyIHUyPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjQwKT09MjI0KXt1MD0odTAmMTUpPDwxMnx1MTw8Nnx1Mn1lbHNle3UwPSh1MCY3KTw8MTh8dTE8PDEyfHUyPDw2fGhlYXBPckFycmF5W2lkeCsrXSY2M31pZih1MDw2NTUzNil7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHUwKX1lbHNle3ZhciBjaD11MC02NTUzNjtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8Y2g+PjEwLDU2MzIwfGNoJjEwMjMpfX19cmV0dXJuIHN0cn1mdW5jdGlvbiBVVEY4VG9TdHJpbmcocHRyLG1heEJ5dGVzVG9SZWFkKXtyZXR1cm4gcHRyP1VURjhBcnJheVRvU3RyaW5nKEhFQVBVOCxwdHIsbWF4Qnl0ZXNUb1JlYWQpOiIifWZ1bmN0aW9uIHN0cmluZ1RvVVRGOEFycmF5KHN0cixoZWFwLG91dElkeCxtYXhCeXRlc1RvV3JpdGUpe2lmKCEobWF4Qnl0ZXNUb1dyaXRlPjApKXJldHVybiAwO3ZhciBzdGFydElkeD1vdXRJZHg7dmFyIGVuZElkeD1vdXRJZHgrbWF4Qnl0ZXNUb1dyaXRlLTE7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIHU9c3RyLmNoYXJDb2RlQXQoaSk7aWYodT49NTUyOTYmJnU8PTU3MzQzKXt2YXIgdTE9c3RyLmNoYXJDb2RlQXQoKytpKTt1PTY1NTM2KygodSYxMDIzKTw8MTApfHUxJjEwMjN9aWYodTw9MTI3KXtpZihvdXRJZHg+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT11fWVsc2UgaWYodTw9MjA0Nyl7aWYob3V0SWR4KzE+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0xOTJ8dT4+NjtoZWFwW291dElkeCsrXT0xMjh8dSY2M31lbHNlIGlmKHU8PTY1NTM1KXtpZihvdXRJZHgrMj49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTIyNHx1Pj4xMjtoZWFwW291dElkeCsrXT0xMjh8dT4+NiY2MztoZWFwW291dElkeCsrXT0xMjh8dSY2M31lbHNle2lmKG91dElkeCszPj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109MjQwfHU+PjE4O2hlYXBbb3V0SWR4KytdPTEyOHx1Pj4xMiY2MztoZWFwW291dElkeCsrXT0xMjh8dT4+NiY2MztoZWFwW291dElkeCsrXT0xMjh8dSY2M319aGVhcFtvdXRJZHhdPTA7cmV0dXJuIG91dElkeC1zdGFydElkeH1mdW5jdGlvbiBzdHJpbmdUb1VURjgoc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpe3JldHVybiBzdHJpbmdUb1VURjhBcnJheShzdHIsSEVBUFU4LG91dFB0cixtYXhCeXRlc1RvV3JpdGUpfWZ1bmN0aW9uIGxlbmd0aEJ5dGVzVVRGOChzdHIpe3ZhciBsZW49MDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgdT1zdHIuY2hhckNvZGVBdChpKTtpZih1Pj01NTI5NiYmdTw9NTczNDMpdT02NTUzNisoKHUmMTAyMyk8PDEwKXxzdHIuY2hhckNvZGVBdCgrK2kpJjEwMjM7aWYodTw9MTI3KSsrbGVuO2Vsc2UgaWYodTw9MjA0NylsZW4rPTI7ZWxzZSBpZih1PD02NTUzNSlsZW4rPTM7ZWxzZSBsZW4rPTR9cmV0dXJuIGxlbn12YXIgVVRGMTZEZWNvZGVyPXR5cGVvZiBUZXh0RGVjb2RlciE9InVuZGVmaW5lZCI/bmV3IFRleHREZWNvZGVyKCJ1dGYtMTZsZSIpOnVuZGVmaW5lZDtmdW5jdGlvbiBVVEYxNlRvU3RyaW5nKHB0cixtYXhCeXRlc1RvUmVhZCl7dmFyIGVuZFB0cj1wdHI7dmFyIGlkeD1lbmRQdHI+PjE7dmFyIG1heElkeD1pZHgrbWF4Qnl0ZXNUb1JlYWQvMjt3aGlsZSghKGlkeD49bWF4SWR4KSYmSEVBUFUxNltpZHhdKSsraWR4O2VuZFB0cj1pZHg8PDE7aWYoZW5kUHRyLXB0cj4zMiYmVVRGMTZEZWNvZGVyKXtyZXR1cm4gVVRGMTZEZWNvZGVyLmRlY29kZShIRUFQVTguc3ViYXJyYXkocHRyLGVuZFB0cikpfWVsc2V7dmFyIHN0cj0iIjtmb3IodmFyIGk9MDshKGk+PW1heEJ5dGVzVG9SZWFkLzIpOysraSl7dmFyIGNvZGVVbml0PUhFQVAxNltwdHIraSoyPj4xXTtpZihjb2RlVW5pdD09MClicmVhaztzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoY29kZVVuaXQpfXJldHVybiBzdHJ9fWZ1bmN0aW9uIHN0cmluZ1RvVVRGMTYoc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpe2lmKG1heEJ5dGVzVG9Xcml0ZT09PXVuZGVmaW5lZCl7bWF4Qnl0ZXNUb1dyaXRlPTIxNDc0ODM2NDd9aWYobWF4Qnl0ZXNUb1dyaXRlPDIpcmV0dXJuIDA7bWF4Qnl0ZXNUb1dyaXRlLT0yO3ZhciBzdGFydFB0cj1vdXRQdHI7dmFyIG51bUNoYXJzVG9Xcml0ZT1tYXhCeXRlc1RvV3JpdGU8c3RyLmxlbmd0aCoyP21heEJ5dGVzVG9Xcml0ZS8yOnN0ci5sZW5ndGg7Zm9yKHZhciBpPTA7aTxudW1DaGFyc1RvV3JpdGU7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7SEVBUDE2W291dFB0cj4+MV09Y29kZVVuaXQ7b3V0UHRyKz0yfUhFQVAxNltvdXRQdHI+PjFdPTA7cmV0dXJuIG91dFB0ci1zdGFydFB0cn1mdW5jdGlvbiBsZW5ndGhCeXRlc1VURjE2KHN0cil7cmV0dXJuIHN0ci5sZW5ndGgqMn1mdW5jdGlvbiBVVEYzMlRvU3RyaW5nKHB0cixtYXhCeXRlc1RvUmVhZCl7dmFyIGk9MDt2YXIgc3RyPSIiO3doaWxlKCEoaT49bWF4Qnl0ZXNUb1JlYWQvNCkpe3ZhciB1dGYzMj1IRUFQMzJbcHRyK2kqND4+Ml07aWYodXRmMzI9PTApYnJlYWs7KytpO2lmKHV0ZjMyPj02NTUzNil7dmFyIGNoPXV0ZjMyLTY1NTM2O3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxjaD4+MTAsNTYzMjB8Y2gmMTAyMyl9ZWxzZXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodXRmMzIpfX1yZXR1cm4gc3RyfWZ1bmN0aW9uIHN0cmluZ1RvVVRGMzIoc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpe2lmKG1heEJ5dGVzVG9Xcml0ZT09PXVuZGVmaW5lZCl7bWF4Qnl0ZXNUb1dyaXRlPTIxNDc0ODM2NDd9aWYobWF4Qnl0ZXNUb1dyaXRlPDQpcmV0dXJuIDA7dmFyIHN0YXJ0UHRyPW91dFB0cjt2YXIgZW5kUHRyPXN0YXJ0UHRyK21heEJ5dGVzVG9Xcml0ZS00O2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtpZihjb2RlVW5pdD49NTUyOTYmJmNvZGVVbml0PD01NzM0Myl7dmFyIHRyYWlsU3Vycm9nYXRlPXN0ci5jaGFyQ29kZUF0KCsraSk7Y29kZVVuaXQ9NjU1MzYrKChjb2RlVW5pdCYxMDIzKTw8MTApfHRyYWlsU3Vycm9nYXRlJjEwMjN9SEVBUDMyW291dFB0cj4+Ml09Y29kZVVuaXQ7b3V0UHRyKz00O2lmKG91dFB0cis0PmVuZFB0cilicmVha31IRUFQMzJbb3V0UHRyPj4yXT0wO3JldHVybiBvdXRQdHItc3RhcnRQdHJ9ZnVuY3Rpb24gbGVuZ3RoQnl0ZXNVVEYzMihzdHIpe3ZhciBsZW49MDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7aWYoY29kZVVuaXQ+PTU1Mjk2JiZjb2RlVW5pdDw9NTczNDMpKytpO2xlbis9NH1yZXR1cm4gbGVufWZ1bmN0aW9uIHdyaXRlQXJyYXlUb01lbW9yeShhcnJheSxidWZmZXIpe0hFQVA4LnNldChhcnJheSxidWZmZXIpfWZ1bmN0aW9uIHdyaXRlQXNjaWlUb01lbW9yeShzdHIsYnVmZmVyLGRvbnRBZGROdWxsKXtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXtIRUFQOFtidWZmZXIrKz4+MF09c3RyLmNoYXJDb2RlQXQoaSl9aWYoIWRvbnRBZGROdWxsKUhFQVA4W2J1ZmZlcj4+MF09MH12YXIgYnVmZmVyLEhFQVA4LEhFQVBVOCxIRUFQMTYsSEVBUFUxNixIRUFQMzIsSEVBUFUzMixIRUFQRjMyLEhFQVBGNjQ7ZnVuY3Rpb24gdXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3MoYnVmKXtidWZmZXI9YnVmO01vZHVsZVsiSEVBUDgiXT1IRUFQOD1uZXcgSW50OEFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQMTYiXT1IRUFQMTY9bmV3IEludDE2QXJyYXkoYnVmKTtNb2R1bGVbIkhFQVAzMiJdPUhFQVAzMj1uZXcgSW50MzJBcnJheShidWYpO01vZHVsZVsiSEVBUFU4Il09SEVBUFU4PW5ldyBVaW50OEFycmF5KGJ1Zik7TW9kdWxlWyJIRUFQVTE2Il09SEVBUFUxNj1uZXcgVWludDE2QXJyYXkoYnVmKTtNb2R1bGVbIkhFQVBVMzIiXT1IRUFQVTMyPW5ldyBVaW50MzJBcnJheShidWYpO01vZHVsZVsiSEVBUEYzMiJdPUhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShidWYpO01vZHVsZVsiSEVBUEY2NCJdPUhFQVBGNjQ9bmV3IEZsb2F0NjRBcnJheShidWYpfXZhciBJTklUSUFMX01FTU9SWT1Nb2R1bGVbIklOSVRJQUxfTUVNT1JZIl18fDE2Nzc3MjE2O3ZhciB3YXNtVGFibGU7dmFyIF9fQVRQUkVSVU5fXz1bXTt2YXIgX19BVElOSVRfXz1bXTt2YXIgX19BVEVYSVRfXz1bXTt2YXIgX19BVFBPU1RSVU5fXz1bXTt2YXIgcnVudGltZUluaXRpYWxpemVkPWZhbHNlO3ZhciBydW50aW1lRXhpdGVkPWZhbHNlO3ZhciBydW50aW1lS2VlcGFsaXZlQ291bnRlcj0wO2Z1bmN0aW9uIGtlZXBSdW50aW1lQWxpdmUoKXtyZXR1cm4gbm9FeGl0UnVudGltZXx8cnVudGltZUtlZXBhbGl2ZUNvdW50ZXI+MH1mdW5jdGlvbiBwcmVSdW4oKXtpZihNb2R1bGVbInByZVJ1biJdKXtpZih0eXBlb2YgTW9kdWxlWyJwcmVSdW4iXT09ImZ1bmN0aW9uIilNb2R1bGVbInByZVJ1biJdPVtNb2R1bGVbInByZVJ1biJdXTt3aGlsZShNb2R1bGVbInByZVJ1biJdLmxlbmd0aCl7YWRkT25QcmVSdW4oTW9kdWxlWyJwcmVSdW4iXS5zaGlmdCgpKX19Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVFBSRVJVTl9fKX1mdW5jdGlvbiBpbml0UnVudGltZSgpe3J1bnRpbWVJbml0aWFsaXplZD10cnVlO2lmKCFNb2R1bGVbIm5vRlNJbml0Il0mJiFGUy5pbml0LmluaXRpYWxpemVkKUZTLmluaXQoKTtGUy5pZ25vcmVQZXJtaXNzaW9ucz1mYWxzZTtUVFkuaW5pdCgpO2NhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRJTklUX18pfWZ1bmN0aW9uIGV4aXRSdW50aW1lKCl7X19fZnVuY3Nfb25fZXhpdCgpO2NhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRFWElUX18pO0ZTLnF1aXQoKTtUVFkuc2h1dGRvd24oKTtydW50aW1lRXhpdGVkPXRydWV9ZnVuY3Rpb24gcG9zdFJ1bigpe2lmKE1vZHVsZVsicG9zdFJ1biJdKXtpZih0eXBlb2YgTW9kdWxlWyJwb3N0UnVuIl09PSJmdW5jdGlvbiIpTW9kdWxlWyJwb3N0UnVuIl09W01vZHVsZVsicG9zdFJ1biJdXTt3aGlsZShNb2R1bGVbInBvc3RSdW4iXS5sZW5ndGgpe2FkZE9uUG9zdFJ1bihNb2R1bGVbInBvc3RSdW4iXS5zaGlmdCgpKX19Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVFBPU1RSVU5fXyl9ZnVuY3Rpb24gYWRkT25QcmVSdW4oY2Ipe19fQVRQUkVSVU5fXy51bnNoaWZ0KGNiKX1mdW5jdGlvbiBhZGRPbkluaXQoY2Ipe19fQVRJTklUX18udW5zaGlmdChjYil9ZnVuY3Rpb24gYWRkT25Qb3N0UnVuKGNiKXtfX0FUUE9TVFJVTl9fLnVuc2hpZnQoY2IpfXZhciBydW5EZXBlbmRlbmNpZXM9MDt2YXIgcnVuRGVwZW5kZW5jeVdhdGNoZXI9bnVsbDt2YXIgZGVwZW5kZW5jaWVzRnVsZmlsbGVkPW51bGw7ZnVuY3Rpb24gZ2V0VW5pcXVlUnVuRGVwZW5kZW5jeShpZCl7cmV0dXJuIGlkfWZ1bmN0aW9uIGFkZFJ1bkRlcGVuZGVuY3koaWQpe3J1bkRlcGVuZGVuY2llcysrO2lmKE1vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKXtNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXShydW5EZXBlbmRlbmNpZXMpfX1mdW5jdGlvbiByZW1vdmVSdW5EZXBlbmRlbmN5KGlkKXtydW5EZXBlbmRlbmNpZXMtLTtpZihNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXSl7TW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0ocnVuRGVwZW5kZW5jaWVzKX1pZihydW5EZXBlbmRlbmNpZXM9PTApe2lmKHJ1bkRlcGVuZGVuY3lXYXRjaGVyIT09bnVsbCl7Y2xlYXJJbnRlcnZhbChydW5EZXBlbmRlbmN5V2F0Y2hlcik7cnVuRGVwZW5kZW5jeVdhdGNoZXI9bnVsbH1pZihkZXBlbmRlbmNpZXNGdWxmaWxsZWQpe3ZhciBjYWxsYmFjaz1kZXBlbmRlbmNpZXNGdWxmaWxsZWQ7ZGVwZW5kZW5jaWVzRnVsZmlsbGVkPW51bGw7Y2FsbGJhY2soKX19fWZ1bmN0aW9uIGFib3J0KHdoYXQpe3tpZihNb2R1bGVbIm9uQWJvcnQiXSl7TW9kdWxlWyJvbkFib3J0Il0od2hhdCl9fXdoYXQ9IkFib3J0ZWQoIit3aGF0KyIpIjtlcnIod2hhdCk7QUJPUlQ9dHJ1ZTtFWElUU1RBVFVTPTE7d2hhdCs9Ii4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby4iO3ZhciBlPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3Iod2hhdCk7cmVhZHlQcm9taXNlUmVqZWN0KGUpO3Rocm93IGV9dmFyIGRhdGFVUklQcmVmaXg9ImRhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2Jhc2U2NCwiO2Z1bmN0aW9uIGlzRGF0YVVSSShmaWxlbmFtZSl7cmV0dXJuIGZpbGVuYW1lLnN0YXJ0c1dpdGgoZGF0YVVSSVByZWZpeCl9dmFyIHdhc21CaW5hcnlGaWxlO2lmKE1vZHVsZVsibG9jYXRlRmlsZSJdKXt3YXNtQmluYXJ5RmlsZT0ibWFpbi1iaW4tbW9uby53YXNtIjtpZighaXNEYXRhVVJJKHdhc21CaW5hcnlGaWxlKSl7d2FzbUJpbmFyeUZpbGU9bG9jYXRlRmlsZSh3YXNtQmluYXJ5RmlsZSl9fWVsc2V7d2FzbUJpbmFyeUZpbGU9bmV3IFVSTCgibWFpbi1iaW4tbW9uby53YXNtIixsb2NhdGlvbi5ocmVmKS50b1N0cmluZygpfWZ1bmN0aW9uIGdldEJpbmFyeShmaWxlKXt0cnl7aWYoZmlsZT09d2FzbUJpbmFyeUZpbGUmJndhc21CaW5hcnkpe3JldHVybiBuZXcgVWludDhBcnJheSh3YXNtQmluYXJ5KX1pZihyZWFkQmluYXJ5KXtyZXR1cm4gcmVhZEJpbmFyeShmaWxlKX1lbHNle3Rocm93ImJvdGggYXN5bmMgYW5kIHN5bmMgZmV0Y2hpbmcgb2YgdGhlIHdhc20gZmFpbGVkIn19Y2F0Y2goZXJyKXthYm9ydChlcnIpfX1mdW5jdGlvbiBnZXRCaW5hcnlQcm9taXNlKCl7aWYoIXdhc21CaW5hcnkmJihFTlZJUk9OTUVOVF9JU19XRUJ8fEVOVklST05NRU5UX0lTX1dPUktFUikpe2lmKHR5cGVvZiBmZXRjaD09ImZ1bmN0aW9uIil7cmV0dXJuIGZldGNoKHdhc21CaW5hcnlGaWxlLHtjcmVkZW50aWFsczoic2FtZS1vcmlnaW4ifSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7aWYoIXJlc3BvbnNlWyJvayJdKXt0aHJvdyJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICciK3dhc21CaW5hcnlGaWxlKyInIn1yZXR1cm4gcmVzcG9uc2VbImFycmF5QnVmZmVyIl0oKX0pLmNhdGNoKGZ1bmN0aW9uKCl7cmV0dXJuIGdldEJpbmFyeSh3YXNtQmluYXJ5RmlsZSl9KX19cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24oKXtyZXR1cm4gZ2V0QmluYXJ5KHdhc21CaW5hcnlGaWxlKX0pfWZ1bmN0aW9uIGNyZWF0ZVdhc20oKXt2YXIgaW5mbz17ImEiOmFzbUxpYnJhcnlBcmd9O2Z1bmN0aW9uIHJlY2VpdmVJbnN0YW5jZShpbnN0YW5jZSxtb2R1bGUpe3ZhciBleHBvcnRzPWluc3RhbmNlLmV4cG9ydHM7TW9kdWxlWyJhc20iXT1leHBvcnRzO3dhc21NZW1vcnk9TW9kdWxlWyJhc20iXVsiTmEiXTt1cGRhdGVHbG9iYWxCdWZmZXJBbmRWaWV3cyh3YXNtTWVtb3J5LmJ1ZmZlcik7d2FzbVRhYmxlPU1vZHVsZVsiYXNtIl1bIlBhIl07YWRkT25Jbml0KE1vZHVsZVsiYXNtIl1bIk9hIl0pO3JlbW92ZVJ1bkRlcGVuZGVuY3koIndhc20taW5zdGFudGlhdGUiKX1hZGRSdW5EZXBlbmRlbmN5KCJ3YXNtLWluc3RhbnRpYXRlIik7ZnVuY3Rpb24gcmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQocmVzdWx0KXtyZWNlaXZlSW5zdGFuY2UocmVzdWx0WyJpbnN0YW5jZSJdKX1mdW5jdGlvbiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKHJlY2VpdmVyKXtyZXR1cm4gZ2V0QmluYXJ5UHJvbWlzZSgpLnRoZW4oZnVuY3Rpb24oYmluYXJ5KXtyZXR1cm4gV2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoYmluYXJ5LGluZm8pfSkudGhlbihmdW5jdGlvbihpbnN0YW5jZSl7cmV0dXJuIGluc3RhbmNlfSkudGhlbihyZWNlaXZlcixmdW5jdGlvbihyZWFzb24pe2VycigiZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogIityZWFzb24pO2Fib3J0KHJlYXNvbil9KX1mdW5jdGlvbiBpbnN0YW50aWF0ZUFzeW5jKCl7aWYoIXdhc21CaW5hcnkmJnR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZz09ImZ1bmN0aW9uIiYmIWlzRGF0YVVSSSh3YXNtQmluYXJ5RmlsZSkmJnR5cGVvZiBmZXRjaD09ImZ1bmN0aW9uIil7cmV0dXJuIGZldGNoKHdhc21CaW5hcnlGaWxlLHtjcmVkZW50aWFsczoic2FtZS1vcmlnaW4ifSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7dmFyIHJlc3VsdD1XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhyZXNwb25zZSxpbmZvKTtyZXR1cm4gcmVzdWx0LnRoZW4ocmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQsZnVuY3Rpb24ocmVhc29uKXtlcnIoIndhc20gc3RyZWFtaW5nIGNvbXBpbGUgZmFpbGVkOiAiK3JlYXNvbik7ZXJyKCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvbiIpO3JldHVybiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0KX0pfSl9ZWxzZXtyZXR1cm4gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihyZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdCl9fWlmKE1vZHVsZVsiaW5zdGFudGlhdGVXYXNtIl0pe3RyeXt2YXIgZXhwb3J0cz1Nb2R1bGVbImluc3RhbnRpYXRlV2FzbSJdKGluZm8scmVjZWl2ZUluc3RhbmNlKTtyZXR1cm4gZXhwb3J0c31jYXRjaChlKXtlcnIoIk1vZHVsZS5pbnN0YW50aWF0ZVdhc20gY2FsbGJhY2sgZmFpbGVkIHdpdGggZXJyb3I6ICIrZSk7cmV0dXJuIGZhbHNlfX1pbnN0YW50aWF0ZUFzeW5jKCkuY2F0Y2gocmVhZHlQcm9taXNlUmVqZWN0KTtyZXR1cm57fX12YXIgdGVtcERvdWJsZTt2YXIgdGVtcEk2NDtmdW5jdGlvbiBjYWxsUnVudGltZUNhbGxiYWNrcyhjYWxsYmFja3Mpe3doaWxlKGNhbGxiYWNrcy5sZW5ndGg+MCl7dmFyIGNhbGxiYWNrPWNhbGxiYWNrcy5zaGlmdCgpO2lmKHR5cGVvZiBjYWxsYmFjaz09ImZ1bmN0aW9uIil7Y2FsbGJhY2soTW9kdWxlKTtjb250aW51ZX12YXIgZnVuYz1jYWxsYmFjay5mdW5jO2lmKHR5cGVvZiBmdW5jPT0ibnVtYmVyIil7aWYoY2FsbGJhY2suYXJnPT09dW5kZWZpbmVkKXtnZXRXYXNtVGFibGVFbnRyeShmdW5jKSgpfWVsc2V7Z2V0V2FzbVRhYmxlRW50cnkoZnVuYykoY2FsbGJhY2suYXJnKX19ZWxzZXtmdW5jKGNhbGxiYWNrLmFyZz09PXVuZGVmaW5lZD9udWxsOmNhbGxiYWNrLmFyZyl9fX12YXIgd2FzbVRhYmxlTWlycm9yPVtdO2Z1bmN0aW9uIGdldFdhc21UYWJsZUVudHJ5KGZ1bmNQdHIpe3ZhciBmdW5jPXdhc21UYWJsZU1pcnJvcltmdW5jUHRyXTtpZighZnVuYyl7aWYoZnVuY1B0cj49d2FzbVRhYmxlTWlycm9yLmxlbmd0aCl3YXNtVGFibGVNaXJyb3IubGVuZ3RoPWZ1bmNQdHIrMTt3YXNtVGFibGVNaXJyb3JbZnVuY1B0cl09ZnVuYz13YXNtVGFibGUuZ2V0KGZ1bmNQdHIpfXJldHVybiBmdW5jfWZ1bmN0aW9uIF9fX2Fzc2VydF9mYWlsKGNvbmRpdGlvbixmaWxlbmFtZSxsaW5lLGZ1bmMpe2Fib3J0KCJBc3NlcnRpb24gZmFpbGVkOiAiK1VURjhUb1N0cmluZyhjb25kaXRpb24pKyIsIGF0OiAiK1tmaWxlbmFtZT9VVEY4VG9TdHJpbmcoZmlsZW5hbWUpOiJ1bmtub3duIGZpbGVuYW1lIixsaW5lLGZ1bmM/VVRGOFRvU3RyaW5nKGZ1bmMpOiJ1bmtub3duIGZ1bmN0aW9uIl0pfWZ1bmN0aW9uIF9fX2N4YV9hbGxvY2F0ZV9leGNlcHRpb24oc2l6ZSl7cmV0dXJuIF9tYWxsb2Moc2l6ZSsyNCkrMjR9dmFyIGV4Y2VwdGlvbkNhdWdodD1bXTtmdW5jdGlvbiBleGNlcHRpb25fYWRkUmVmKGluZm8pe2luZm8uYWRkX3JlZigpfXZhciB1bmNhdWdodEV4Y2VwdGlvbkNvdW50PTA7ZnVuY3Rpb24gX19fY3hhX2JlZ2luX2NhdGNoKHB0cil7dmFyIGluZm89bmV3IEV4Y2VwdGlvbkluZm8ocHRyKTtpZighaW5mby5nZXRfY2F1Z2h0KCkpe2luZm8uc2V0X2NhdWdodCh0cnVlKTt1bmNhdWdodEV4Y2VwdGlvbkNvdW50LS19aW5mby5zZXRfcmV0aHJvd24oZmFsc2UpO2V4Y2VwdGlvbkNhdWdodC5wdXNoKGluZm8pO2V4Y2VwdGlvbl9hZGRSZWYoaW5mbyk7cmV0dXJuIGluZm8uZ2V0X2V4Y2VwdGlvbl9wdHIoKX1mdW5jdGlvbiBfX19jeGFfY3VycmVudF9wcmltYXJ5X2V4Y2VwdGlvbigpe2lmKCFleGNlcHRpb25DYXVnaHQubGVuZ3RoKXtyZXR1cm4gMH12YXIgaW5mbz1leGNlcHRpb25DYXVnaHRbZXhjZXB0aW9uQ2F1Z2h0Lmxlbmd0aC0xXTtleGNlcHRpb25fYWRkUmVmKGluZm8pO3JldHVybiBpbmZvLmV4Y1B0cn1mdW5jdGlvbiBFeGNlcHRpb25JbmZvKGV4Y1B0cil7dGhpcy5leGNQdHI9ZXhjUHRyO3RoaXMucHRyPWV4Y1B0ci0yNDt0aGlzLnNldF90eXBlPWZ1bmN0aW9uKHR5cGUpe0hFQVBVMzJbdGhpcy5wdHIrND4+Ml09dHlwZX07dGhpcy5nZXRfdHlwZT1mdW5jdGlvbigpe3JldHVybiBIRUFQVTMyW3RoaXMucHRyKzQ+PjJdfTt0aGlzLnNldF9kZXN0cnVjdG9yPWZ1bmN0aW9uKGRlc3RydWN0b3Ipe0hFQVBVMzJbdGhpcy5wdHIrOD4+Ml09ZGVzdHJ1Y3Rvcn07dGhpcy5nZXRfZGVzdHJ1Y3Rvcj1mdW5jdGlvbigpe3JldHVybiBIRUFQVTMyW3RoaXMucHRyKzg+PjJdfTt0aGlzLnNldF9yZWZjb3VudD1mdW5jdGlvbihyZWZjb3VudCl7SEVBUDMyW3RoaXMucHRyPj4yXT1yZWZjb3VudH07dGhpcy5zZXRfY2F1Z2h0PWZ1bmN0aW9uKGNhdWdodCl7Y2F1Z2h0PWNhdWdodD8xOjA7SEVBUDhbdGhpcy5wdHIrMTI+PjBdPWNhdWdodH07dGhpcy5nZXRfY2F1Z2h0PWZ1bmN0aW9uKCl7cmV0dXJuIEhFQVA4W3RoaXMucHRyKzEyPj4wXSE9MH07dGhpcy5zZXRfcmV0aHJvd249ZnVuY3Rpb24ocmV0aHJvd24pe3JldGhyb3duPXJldGhyb3duPzE6MDtIRUFQOFt0aGlzLnB0cisxMz4+MF09cmV0aHJvd259O3RoaXMuZ2V0X3JldGhyb3duPWZ1bmN0aW9uKCl7cmV0dXJuIEhFQVA4W3RoaXMucHRyKzEzPj4wXSE9MH07dGhpcy5pbml0PWZ1bmN0aW9uKHR5cGUsZGVzdHJ1Y3Rvcil7dGhpcy5zZXRfYWRqdXN0ZWRfcHRyKDApO3RoaXMuc2V0X3R5cGUodHlwZSk7dGhpcy5zZXRfZGVzdHJ1Y3RvcihkZXN0cnVjdG9yKTt0aGlzLnNldF9yZWZjb3VudCgwKTt0aGlzLnNldF9jYXVnaHQoZmFsc2UpO3RoaXMuc2V0X3JldGhyb3duKGZhbHNlKX07dGhpcy5hZGRfcmVmPWZ1bmN0aW9uKCl7dmFyIHZhbHVlPUhFQVAzMlt0aGlzLnB0cj4+Ml07SEVBUDMyW3RoaXMucHRyPj4yXT12YWx1ZSsxfTt0aGlzLnJlbGVhc2VfcmVmPWZ1bmN0aW9uKCl7dmFyIHByZXY9SEVBUDMyW3RoaXMucHRyPj4yXTtIRUFQMzJbdGhpcy5wdHI+PjJdPXByZXYtMTtyZXR1cm4gcHJldj09PTF9O3RoaXMuc2V0X2FkanVzdGVkX3B0cj1mdW5jdGlvbihhZGp1c3RlZFB0cil7SEVBUFUzMlt0aGlzLnB0cisxNj4+Ml09YWRqdXN0ZWRQdHJ9O3RoaXMuZ2V0X2FkanVzdGVkX3B0cj1mdW5jdGlvbigpe3JldHVybiBIRUFQVTMyW3RoaXMucHRyKzE2Pj4yXX07dGhpcy5nZXRfZXhjZXB0aW9uX3B0cj1mdW5jdGlvbigpe3ZhciBpc1BvaW50ZXI9X19fY3hhX2lzX3BvaW50ZXJfdHlwZSh0aGlzLmdldF90eXBlKCkpO2lmKGlzUG9pbnRlcil7cmV0dXJuIEhFQVBVMzJbdGhpcy5leGNQdHI+PjJdfXZhciBhZGp1c3RlZD10aGlzLmdldF9hZGp1c3RlZF9wdHIoKTtpZihhZGp1c3RlZCE9PTApcmV0dXJuIGFkanVzdGVkO3JldHVybiB0aGlzLmV4Y1B0cn19ZnVuY3Rpb24gX19fY3hhX2ZyZWVfZXhjZXB0aW9uKHB0cil7cmV0dXJuIF9mcmVlKG5ldyBFeGNlcHRpb25JbmZvKHB0cikucHRyKX1mdW5jdGlvbiBleGNlcHRpb25fZGVjUmVmKGluZm8pe2lmKGluZm8ucmVsZWFzZV9yZWYoKSYmIWluZm8uZ2V0X3JldGhyb3duKCkpe3ZhciBkZXN0cnVjdG9yPWluZm8uZ2V0X2Rlc3RydWN0b3IoKTtpZihkZXN0cnVjdG9yKXtnZXRXYXNtVGFibGVFbnRyeShkZXN0cnVjdG9yKShpbmZvLmV4Y1B0cil9X19fY3hhX2ZyZWVfZXhjZXB0aW9uKGluZm8uZXhjUHRyKX19ZnVuY3Rpb24gX19fY3hhX2RlY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQocHRyKXtpZighcHRyKXJldHVybjtleGNlcHRpb25fZGVjUmVmKG5ldyBFeGNlcHRpb25JbmZvKHB0cikpfXZhciBleGNlcHRpb25MYXN0PTA7ZnVuY3Rpb24gX19fY3hhX2VuZF9jYXRjaCgpe19zZXRUaHJldygwKTt2YXIgaW5mbz1leGNlcHRpb25DYXVnaHQucG9wKCk7ZXhjZXB0aW9uX2RlY1JlZihpbmZvKTtleGNlcHRpb25MYXN0PTB9ZnVuY3Rpb24gX19fcmVzdW1lRXhjZXB0aW9uKHB0cil7aWYoIWV4Y2VwdGlvbkxhc3Qpe2V4Y2VwdGlvbkxhc3Q9cHRyfXRocm93IHB0cn1mdW5jdGlvbiBfX19jeGFfZmluZF9tYXRjaGluZ19jYXRjaF8yKCl7dmFyIHRocm93bj1leGNlcHRpb25MYXN0O2lmKCF0aHJvd24pe3NldFRlbXBSZXQwKDApO3JldHVybiAwfXZhciBpbmZvPW5ldyBFeGNlcHRpb25JbmZvKHRocm93bik7aW5mby5zZXRfYWRqdXN0ZWRfcHRyKHRocm93bik7dmFyIHRocm93blR5cGU9aW5mby5nZXRfdHlwZSgpO2lmKCF0aHJvd25UeXBlKXtzZXRUZW1wUmV0MCgwKTtyZXR1cm4gdGhyb3dufXZhciB0eXBlQXJyYXk9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtmb3IodmFyIGk9MDtpPHR5cGVBcnJheS5sZW5ndGg7aSsrKXt2YXIgY2F1Z2h0VHlwZT10eXBlQXJyYXlbaV07aWYoY2F1Z2h0VHlwZT09PTB8fGNhdWdodFR5cGU9PT10aHJvd25UeXBlKXticmVha312YXIgYWRqdXN0ZWRfcHRyX2FkZHI9aW5mby5wdHIrMTY7aWYoX19fY3hhX2Nhbl9jYXRjaChjYXVnaHRUeXBlLHRocm93blR5cGUsYWRqdXN0ZWRfcHRyX2FkZHIpKXtzZXRUZW1wUmV0MChjYXVnaHRUeXBlKTtyZXR1cm4gdGhyb3dufX1zZXRUZW1wUmV0MCh0aHJvd25UeXBlKTtyZXR1cm4gdGhyb3dufWZ1bmN0aW9uIF9fX2N4YV9maW5kX21hdGNoaW5nX2NhdGNoXzMoKXt2YXIgdGhyb3duPWV4Y2VwdGlvbkxhc3Q7aWYoIXRocm93bil7c2V0VGVtcFJldDAoMCk7cmV0dXJuIDB9dmFyIGluZm89bmV3IEV4Y2VwdGlvbkluZm8odGhyb3duKTtpbmZvLnNldF9hZGp1c3RlZF9wdHIodGhyb3duKTt2YXIgdGhyb3duVHlwZT1pbmZvLmdldF90eXBlKCk7aWYoIXRocm93blR5cGUpe3NldFRlbXBSZXQwKDApO3JldHVybiB0aHJvd259dmFyIHR5cGVBcnJheT1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO2Zvcih2YXIgaT0wO2k8dHlwZUFycmF5Lmxlbmd0aDtpKyspe3ZhciBjYXVnaHRUeXBlPXR5cGVBcnJheVtpXTtpZihjYXVnaHRUeXBlPT09MHx8Y2F1Z2h0VHlwZT09PXRocm93blR5cGUpe2JyZWFrfXZhciBhZGp1c3RlZF9wdHJfYWRkcj1pbmZvLnB0cisxNjtpZihfX19jeGFfY2FuX2NhdGNoKGNhdWdodFR5cGUsdGhyb3duVHlwZSxhZGp1c3RlZF9wdHJfYWRkcikpe3NldFRlbXBSZXQwKGNhdWdodFR5cGUpO3JldHVybiB0aHJvd259fXNldFRlbXBSZXQwKHRocm93blR5cGUpO3JldHVybiB0aHJvd259ZnVuY3Rpb24gX19fY3hhX2luY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQocHRyKXtpZighcHRyKXJldHVybjtleGNlcHRpb25fYWRkUmVmKG5ldyBFeGNlcHRpb25JbmZvKHB0cikpfWZ1bmN0aW9uIF9fX2N4YV9yZXRocm93KCl7dmFyIGluZm89ZXhjZXB0aW9uQ2F1Z2h0LnBvcCgpO2lmKCFpbmZvKXthYm9ydCgibm8gZXhjZXB0aW9uIHRvIHRocm93Iil9dmFyIHB0cj1pbmZvLmV4Y1B0cjtpZighaW5mby5nZXRfcmV0aHJvd24oKSl7ZXhjZXB0aW9uQ2F1Z2h0LnB1c2goaW5mbyk7aW5mby5zZXRfcmV0aHJvd24odHJ1ZSk7aW5mby5zZXRfY2F1Z2h0KGZhbHNlKTt1bmNhdWdodEV4Y2VwdGlvbkNvdW50Kyt9ZXhjZXB0aW9uTGFzdD1wdHI7dGhyb3cgcHRyfWZ1bmN0aW9uIF9fX2N4YV9yZXRocm93X3ByaW1hcnlfZXhjZXB0aW9uKHB0cil7aWYoIXB0cilyZXR1cm47dmFyIGluZm89bmV3IEV4Y2VwdGlvbkluZm8ocHRyKTtleGNlcHRpb25DYXVnaHQucHVzaChpbmZvKTtpbmZvLnNldF9yZXRocm93bih0cnVlKTtfX19jeGFfcmV0aHJvdygpfWZ1bmN0aW9uIF9fX2N4YV90aHJvdyhwdHIsdHlwZSxkZXN0cnVjdG9yKXt2YXIgaW5mbz1uZXcgRXhjZXB0aW9uSW5mbyhwdHIpO2luZm8uaW5pdCh0eXBlLGRlc3RydWN0b3IpO2V4Y2VwdGlvbkxhc3Q9cHRyO3VuY2F1Z2h0RXhjZXB0aW9uQ291bnQrKzt0aHJvdyBwdHJ9ZnVuY3Rpb24gX19fY3hhX3VuY2F1Z2h0X2V4Y2VwdGlvbnMoKXtyZXR1cm4gdW5jYXVnaHRFeGNlcHRpb25Db3VudH12YXIgUEFUSD17aXNBYnM6cGF0aD0+cGF0aC5jaGFyQXQoMCk9PT0iLyIsc3BsaXRQYXRoOmZpbGVuYW1lPT57dmFyIHNwbGl0UGF0aFJlPS9eKFwvP3wpKFtcc1xTXSo/KSgoPzpcLnsxLDJ9fFteXC9dKz98KShcLlteLlwvXSp8KSkoPzpbXC9dKikkLztyZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSl9LG5vcm1hbGl6ZUFycmF5OihwYXJ0cyxhbGxvd0Fib3ZlUm9vdCk9Pnt2YXIgdXA9MDtmb3IodmFyIGk9cGFydHMubGVuZ3RoLTE7aT49MDtpLS0pe3ZhciBsYXN0PXBhcnRzW2ldO2lmKGxhc3Q9PT0iLiIpe3BhcnRzLnNwbGljZShpLDEpfWVsc2UgaWYobGFzdD09PSIuLiIpe3BhcnRzLnNwbGljZShpLDEpO3VwKyt9ZWxzZSBpZih1cCl7cGFydHMuc3BsaWNlKGksMSk7dXAtLX19aWYoYWxsb3dBYm92ZVJvb3Qpe2Zvcig7dXA7dXAtLSl7cGFydHMudW5zaGlmdCgiLi4iKX19cmV0dXJuIHBhcnRzfSxub3JtYWxpemU6cGF0aD0+e3ZhciBpc0Fic29sdXRlPVBBVEguaXNBYnMocGF0aCksdHJhaWxpbmdTbGFzaD1wYXRoLnN1YnN0cigtMSk9PT0iLyI7cGF0aD1QQVRILm5vcm1hbGl6ZUFycmF5KHBhdGguc3BsaXQoIi8iKS5maWx0ZXIocD0+ISFwKSwhaXNBYnNvbHV0ZSkuam9pbigiLyIpO2lmKCFwYXRoJiYhaXNBYnNvbHV0ZSl7cGF0aD0iLiJ9aWYocGF0aCYmdHJhaWxpbmdTbGFzaCl7cGF0aCs9Ii8ifXJldHVybihpc0Fic29sdXRlPyIvIjoiIikrcGF0aH0sZGlybmFtZTpwYXRoPT57dmFyIHJlc3VsdD1QQVRILnNwbGl0UGF0aChwYXRoKSxyb290PXJlc3VsdFswXSxkaXI9cmVzdWx0WzFdO2lmKCFyb290JiYhZGlyKXtyZXR1cm4iLiJ9aWYoZGlyKXtkaXI9ZGlyLnN1YnN0cigwLGRpci5sZW5ndGgtMSl9cmV0dXJuIHJvb3QrZGlyfSxiYXNlbmFtZTpwYXRoPT57aWYocGF0aD09PSIvIilyZXR1cm4iLyI7cGF0aD1QQVRILm5vcm1hbGl6ZShwYXRoKTtwYXRoPXBhdGgucmVwbGFjZSgvXC8kLywiIik7dmFyIGxhc3RTbGFzaD1wYXRoLmxhc3RJbmRleE9mKCIvIik7aWYobGFzdFNsYXNoPT09LTEpcmV0dXJuIHBhdGg7cmV0dXJuIHBhdGguc3Vic3RyKGxhc3RTbGFzaCsxKX0sam9pbjpmdW5jdGlvbigpe3ZhciBwYXRocz1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMCk7cmV0dXJuIFBBVEgubm9ybWFsaXplKHBhdGhzLmpvaW4oIi8iKSl9LGpvaW4yOihsLHIpPT57cmV0dXJuIFBBVEgubm9ybWFsaXplKGwrIi8iK3IpfX07ZnVuY3Rpb24gZ2V0UmFuZG9tRGV2aWNlKCl7aWYodHlwZW9mIGNyeXB0bz09Im9iamVjdCImJnR5cGVvZiBjcnlwdG9bImdldFJhbmRvbVZhbHVlcyJdPT0iZnVuY3Rpb24iKXt2YXIgcmFuZG9tQnVmZmVyPW5ldyBVaW50OEFycmF5KDEpO3JldHVybiBmdW5jdGlvbigpe2NyeXB0by5nZXRSYW5kb21WYWx1ZXMocmFuZG9tQnVmZmVyKTtyZXR1cm4gcmFuZG9tQnVmZmVyWzBdfX1lbHNlIHJldHVybiBmdW5jdGlvbigpe2Fib3J0KCJyYW5kb21EZXZpY2UiKX19dmFyIFBBVEhfRlM9e3Jlc29sdmU6ZnVuY3Rpb24oKXt2YXIgcmVzb2x2ZWRQYXRoPSIiLHJlc29sdmVkQWJzb2x1dGU9ZmFsc2U7Zm9yKHZhciBpPWFyZ3VtZW50cy5sZW5ndGgtMTtpPj0tMSYmIXJlc29sdmVkQWJzb2x1dGU7aS0tKXt2YXIgcGF0aD1pPj0wP2FyZ3VtZW50c1tpXTpGUy5jd2QoKTtpZih0eXBlb2YgcGF0aCE9InN0cmluZyIpe3Rocm93IG5ldyBUeXBlRXJyb3IoIkFyZ3VtZW50cyB0byBwYXRoLnJlc29sdmUgbXVzdCBiZSBzdHJpbmdzIil9ZWxzZSBpZighcGF0aCl7cmV0dXJuIiJ9cmVzb2x2ZWRQYXRoPXBhdGgrIi8iK3Jlc29sdmVkUGF0aDtyZXNvbHZlZEFic29sdXRlPVBBVEguaXNBYnMocGF0aCl9cmVzb2x2ZWRQYXRoPVBBVEgubm9ybWFsaXplQXJyYXkocmVzb2x2ZWRQYXRoLnNwbGl0KCIvIikuZmlsdGVyKHA9PiEhcCksIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oIi8iKTtyZXR1cm4ocmVzb2x2ZWRBYnNvbHV0ZT8iLyI6IiIpK3Jlc29sdmVkUGF0aHx8Ii4ifSxyZWxhdGl2ZTooZnJvbSx0byk9Pntmcm9tPVBBVEhfRlMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7dG89UEFUSF9GUy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7ZnVuY3Rpb24gdHJpbShhcnIpe3ZhciBzdGFydD0wO2Zvcig7c3RhcnQ8YXJyLmxlbmd0aDtzdGFydCsrKXtpZihhcnJbc3RhcnRdIT09IiIpYnJlYWt9dmFyIGVuZD1hcnIubGVuZ3RoLTE7Zm9yKDtlbmQ+PTA7ZW5kLS0pe2lmKGFycltlbmRdIT09IiIpYnJlYWt9aWYoc3RhcnQ+ZW5kKXJldHVybltdO3JldHVybiBhcnIuc2xpY2Uoc3RhcnQsZW5kLXN0YXJ0KzEpfXZhciBmcm9tUGFydHM9dHJpbShmcm9tLnNwbGl0KCIvIikpO3ZhciB0b1BhcnRzPXRyaW0odG8uc3BsaXQoIi8iKSk7dmFyIGxlbmd0aD1NYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLHRvUGFydHMubGVuZ3RoKTt2YXIgc2FtZVBhcnRzTGVuZ3RoPWxlbmd0aDtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe2lmKGZyb21QYXJ0c1tpXSE9PXRvUGFydHNbaV0pe3NhbWVQYXJ0c0xlbmd0aD1pO2JyZWFrfX12YXIgb3V0cHV0UGFydHM9W107Zm9yKHZhciBpPXNhbWVQYXJ0c0xlbmd0aDtpPGZyb21QYXJ0cy5sZW5ndGg7aSsrKXtvdXRwdXRQYXJ0cy5wdXNoKCIuLiIpfW91dHB1dFBhcnRzPW91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO3JldHVybiBvdXRwdXRQYXJ0cy5qb2luKCIvIil9fTt2YXIgVFRZPXt0dHlzOltdLGluaXQ6ZnVuY3Rpb24oKXt9LHNodXRkb3duOmZ1bmN0aW9uKCl7fSxyZWdpc3RlcjpmdW5jdGlvbihkZXYsb3BzKXtUVFkudHR5c1tkZXZdPXtpbnB1dDpbXSxvdXRwdXQ6W10sb3BzOm9wc307RlMucmVnaXN0ZXJEZXZpY2UoZGV2LFRUWS5zdHJlYW1fb3BzKX0sc3RyZWFtX29wczp7b3BlbjpmdW5jdGlvbihzdHJlYW0pe3ZhciB0dHk9VFRZLnR0eXNbc3RyZWFtLm5vZGUucmRldl07aWYoIXR0eSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfXN0cmVhbS50dHk9dHR5O3N0cmVhbS5zZWVrYWJsZT1mYWxzZX0sY2xvc2U6ZnVuY3Rpb24oc3RyZWFtKXtzdHJlYW0udHR5Lm9wcy5mbHVzaChzdHJlYW0udHR5KX0sZmx1c2g6ZnVuY3Rpb24oc3RyZWFtKXtzdHJlYW0udHR5Lm9wcy5mbHVzaChzdHJlYW0udHR5KX0scmVhZDpmdW5jdGlvbihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zKXtpZighc3RyZWFtLnR0eXx8IXN0cmVhbS50dHkub3BzLmdldF9jaGFyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2MCl9dmFyIGJ5dGVzUmVhZD0wO2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7dmFyIHJlc3VsdDt0cnl7cmVzdWx0PXN0cmVhbS50dHkub3BzLmdldF9jaGFyKHN0cmVhbS50dHkpfWNhdGNoKGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI5KX1pZihyZXN1bHQ9PT11bmRlZmluZWQmJmJ5dGVzUmVhZD09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYpfWlmKHJlc3VsdD09PW51bGx8fHJlc3VsdD09PXVuZGVmaW5lZClicmVhaztieXRlc1JlYWQrKztidWZmZXJbb2Zmc2V0K2ldPXJlc3VsdH1pZihieXRlc1JlYWQpe3N0cmVhbS5ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpfXJldHVybiBieXRlc1JlYWR9LHdyaXRlOmZ1bmN0aW9uKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3Mpe2lmKCFzdHJlYW0udHR5fHwhc3RyZWFtLnR0eS5vcHMucHV0X2NoYXIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYwKX10cnl7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXtzdHJlYW0udHR5Lm9wcy5wdXRfY2hhcihzdHJlYW0udHR5LGJ1ZmZlcltvZmZzZXQraV0pfX1jYXRjaChlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOSl9aWYobGVuZ3RoKXtzdHJlYW0ubm9kZS50aW1lc3RhbXA9RGF0ZS5ub3coKX1yZXR1cm4gaX19LGRlZmF1bHRfdHR5X29wczp7Z2V0X2NoYXI6ZnVuY3Rpb24odHR5KXtpZighdHR5LmlucHV0Lmxlbmd0aCl7dmFyIHJlc3VsdD1udWxsO2lmKHR5cGVvZiB3aW5kb3chPSJ1bmRlZmluZWQiJiZ0eXBlb2Ygd2luZG93LnByb21wdD09ImZ1bmN0aW9uIil7cmVzdWx0PXdpbmRvdy5wcm9tcHQoIklucHV0OiAiKTtpZihyZXN1bHQhPT1udWxsKXtyZXN1bHQrPSJcbiJ9fWVsc2UgaWYodHlwZW9mIHJlYWRsaW5lPT0iZnVuY3Rpb24iKXtyZXN1bHQ9cmVhZGxpbmUoKTtpZihyZXN1bHQhPT1udWxsKXtyZXN1bHQrPSJcbiJ9fWlmKCFyZXN1bHQpe3JldHVybiBudWxsfXR0eS5pbnB1dD1pbnRBcnJheUZyb21TdHJpbmcocmVzdWx0LHRydWUpfXJldHVybiB0dHkuaW5wdXQuc2hpZnQoKX0scHV0X2NoYXI6ZnVuY3Rpb24odHR5LHZhbCl7aWYodmFsPT09bnVsbHx8dmFsPT09MTApe291dChVVEY4QXJyYXlUb1N0cmluZyh0dHkub3V0cHV0LDApKTt0dHkub3V0cHV0PVtdfWVsc2V7aWYodmFsIT0wKXR0eS5vdXRwdXQucHVzaCh2YWwpfX0sZmx1c2g6ZnVuY3Rpb24odHR5KXtpZih0dHkub3V0cHV0JiZ0dHkub3V0cHV0Lmxlbmd0aD4wKXtvdXQoVVRGOEFycmF5VG9TdHJpbmcodHR5Lm91dHB1dCwwKSk7dHR5Lm91dHB1dD1bXX19fSxkZWZhdWx0X3R0eTFfb3BzOntwdXRfY2hhcjpmdW5jdGlvbih0dHksdmFsKXtpZih2YWw9PT1udWxsfHx2YWw9PT0xMCl7ZXJyKFVURjhBcnJheVRvU3RyaW5nKHR0eS5vdXRwdXQsMCkpO3R0eS5vdXRwdXQ9W119ZWxzZXtpZih2YWwhPTApdHR5Lm91dHB1dC5wdXNoKHZhbCl9fSxmbHVzaDpmdW5jdGlvbih0dHkpe2lmKHR0eS5vdXRwdXQmJnR0eS5vdXRwdXQubGVuZ3RoPjApe2VycihVVEY4QXJyYXlUb1N0cmluZyh0dHkub3V0cHV0LDApKTt0dHkub3V0cHV0PVtdfX19fTtmdW5jdGlvbiB6ZXJvTWVtb3J5KGFkZHJlc3Msc2l6ZSl7SEVBUFU4LmZpbGwoMCxhZGRyZXNzLGFkZHJlc3Mrc2l6ZSl9ZnVuY3Rpb24gYWxpZ25NZW1vcnkoc2l6ZSxhbGlnbm1lbnQpe3JldHVybiBNYXRoLmNlaWwoc2l6ZS9hbGlnbm1lbnQpKmFsaWdubWVudH1mdW5jdGlvbiBtbWFwQWxsb2Moc2l6ZSl7c2l6ZT1hbGlnbk1lbW9yeShzaXplLDY1NTM2KTt2YXIgcHRyPV9lbXNjcmlwdGVuX2J1aWx0aW5fbWVtYWxpZ24oNjU1MzYsc2l6ZSk7aWYoIXB0cilyZXR1cm4gMDt6ZXJvTWVtb3J5KHB0cixzaXplKTtyZXR1cm4gcHRyfXZhciBNRU1GUz17b3BzX3RhYmxlOm51bGwsbW91bnQ6ZnVuY3Rpb24obW91bnQpe3JldHVybiBNRU1GUy5jcmVhdGVOb2RlKG51bGwsIi8iLDE2Mzg0fDUxMSwwKX0sY3JlYXRlTm9kZTpmdW5jdGlvbihwYXJlbnQsbmFtZSxtb2RlLGRldil7aWYoRlMuaXNCbGtkZXYobW9kZSl8fEZTLmlzRklGTyhtb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKCFNRU1GUy5vcHNfdGFibGUpe01FTUZTLm9wc190YWJsZT17ZGlyOntub2RlOntnZXRhdHRyOk1FTUZTLm5vZGVfb3BzLmdldGF0dHIsc2V0YXR0cjpNRU1GUy5ub2RlX29wcy5zZXRhdHRyLGxvb2t1cDpNRU1GUy5ub2RlX29wcy5sb29rdXAsbWtub2Q6TUVNRlMubm9kZV9vcHMubWtub2QscmVuYW1lOk1FTUZTLm5vZGVfb3BzLnJlbmFtZSx1bmxpbms6TUVNRlMubm9kZV9vcHMudW5saW5rLHJtZGlyOk1FTUZTLm5vZGVfb3BzLnJtZGlyLHJlYWRkaXI6TUVNRlMubm9kZV9vcHMucmVhZGRpcixzeW1saW5rOk1FTUZTLm5vZGVfb3BzLnN5bWxpbmt9LHN0cmVhbTp7bGxzZWVrOk1FTUZTLnN0cmVhbV9vcHMubGxzZWVrfX0sZmlsZTp7bm9kZTp7Z2V0YXR0cjpNRU1GUy5ub2RlX29wcy5nZXRhdHRyLHNldGF0dHI6TUVNRlMubm9kZV9vcHMuc2V0YXR0cn0sc3RyZWFtOntsbHNlZWs6TUVNRlMuc3RyZWFtX29wcy5sbHNlZWsscmVhZDpNRU1GUy5zdHJlYW1fb3BzLnJlYWQsd3JpdGU6TUVNRlMuc3RyZWFtX29wcy53cml0ZSxhbGxvY2F0ZTpNRU1GUy5zdHJlYW1fb3BzLmFsbG9jYXRlLG1tYXA6TUVNRlMuc3RyZWFtX29wcy5tbWFwLG1zeW5jOk1FTUZTLnN0cmVhbV9vcHMubXN5bmN9fSxsaW5rOntub2RlOntnZXRhdHRyOk1FTUZTLm5vZGVfb3BzLmdldGF0dHIsc2V0YXR0cjpNRU1GUy5ub2RlX29wcy5zZXRhdHRyLHJlYWRsaW5rOk1FTUZTLm5vZGVfb3BzLnJlYWRsaW5rfSxzdHJlYW06e319LGNocmRldjp7bm9kZTp7Z2V0YXR0cjpNRU1GUy5ub2RlX29wcy5nZXRhdHRyLHNldGF0dHI6TUVNRlMubm9kZV9vcHMuc2V0YXR0cn0sc3RyZWFtOkZTLmNocmRldl9zdHJlYW1fb3BzfX19dmFyIG5vZGU9RlMuY3JlYXRlTm9kZShwYXJlbnQsbmFtZSxtb2RlLGRldik7aWYoRlMuaXNEaXIobm9kZS5tb2RlKSl7bm9kZS5ub2RlX29wcz1NRU1GUy5vcHNfdGFibGUuZGlyLm5vZGU7bm9kZS5zdHJlYW1fb3BzPU1FTUZTLm9wc190YWJsZS5kaXIuc3RyZWFtO25vZGUuY29udGVudHM9e319ZWxzZSBpZihGUy5pc0ZpbGUobm9kZS5tb2RlKSl7bm9kZS5ub2RlX29wcz1NRU1GUy5vcHNfdGFibGUuZmlsZS5ub2RlO25vZGUuc3RyZWFtX29wcz1NRU1GUy5vcHNfdGFibGUuZmlsZS5zdHJlYW07bm9kZS51c2VkQnl0ZXM9MDtub2RlLmNvbnRlbnRzPW51bGx9ZWxzZSBpZihGUy5pc0xpbmsobm9kZS5tb2RlKSl7bm9kZS5ub2RlX29wcz1NRU1GUy5vcHNfdGFibGUubGluay5ub2RlO25vZGUuc3RyZWFtX29wcz1NRU1GUy5vcHNfdGFibGUubGluay5zdHJlYW19ZWxzZSBpZihGUy5pc0NocmRldihub2RlLm1vZGUpKXtub2RlLm5vZGVfb3BzPU1FTUZTLm9wc190YWJsZS5jaHJkZXYubm9kZTtub2RlLnN0cmVhbV9vcHM9TUVNRlMub3BzX3RhYmxlLmNocmRldi5zdHJlYW19bm9kZS50aW1lc3RhbXA9RGF0ZS5ub3coKTtpZihwYXJlbnQpe3BhcmVudC5jb250ZW50c1tuYW1lXT1ub2RlO3BhcmVudC50aW1lc3RhbXA9bm9kZS50aW1lc3RhbXB9cmV0dXJuIG5vZGV9LGdldEZpbGVEYXRhQXNUeXBlZEFycmF5OmZ1bmN0aW9uKG5vZGUpe2lmKCFub2RlLmNvbnRlbnRzKXJldHVybiBuZXcgVWludDhBcnJheSgwKTtpZihub2RlLmNvbnRlbnRzLnN1YmFycmF5KXJldHVybiBub2RlLmNvbnRlbnRzLnN1YmFycmF5KDAsbm9kZS51c2VkQnl0ZXMpO3JldHVybiBuZXcgVWludDhBcnJheShub2RlLmNvbnRlbnRzKX0sZXhwYW5kRmlsZVN0b3JhZ2U6ZnVuY3Rpb24obm9kZSxuZXdDYXBhY2l0eSl7dmFyIHByZXZDYXBhY2l0eT1ub2RlLmNvbnRlbnRzP25vZGUuY29udGVudHMubGVuZ3RoOjA7aWYocHJldkNhcGFjaXR5Pj1uZXdDYXBhY2l0eSlyZXR1cm47dmFyIENBUEFDSVRZX0RPVUJMSU5HX01BWD0xMDI0KjEwMjQ7bmV3Q2FwYWNpdHk9TWF0aC5tYXgobmV3Q2FwYWNpdHkscHJldkNhcGFjaXR5KihwcmV2Q2FwYWNpdHk8Q0FQQUNJVFlfRE9VQkxJTkdfTUFYPzI6MS4xMjUpPj4+MCk7aWYocHJldkNhcGFjaXR5IT0wKW5ld0NhcGFjaXR5PU1hdGgubWF4KG5ld0NhcGFjaXR5LDI1Nik7dmFyIG9sZENvbnRlbnRzPW5vZGUuY29udGVudHM7bm9kZS5jb250ZW50cz1uZXcgVWludDhBcnJheShuZXdDYXBhY2l0eSk7aWYobm9kZS51c2VkQnl0ZXM+MClub2RlLmNvbnRlbnRzLnNldChvbGRDb250ZW50cy5zdWJhcnJheSgwLG5vZGUudXNlZEJ5dGVzKSwwKX0scmVzaXplRmlsZVN0b3JhZ2U6ZnVuY3Rpb24obm9kZSxuZXdTaXplKXtpZihub2RlLnVzZWRCeXRlcz09bmV3U2l6ZSlyZXR1cm47aWYobmV3U2l6ZT09MCl7bm9kZS5jb250ZW50cz1udWxsO25vZGUudXNlZEJ5dGVzPTB9ZWxzZXt2YXIgb2xkQ29udGVudHM9bm9kZS5jb250ZW50cztub2RlLmNvbnRlbnRzPW5ldyBVaW50OEFycmF5KG5ld1NpemUpO2lmKG9sZENvbnRlbnRzKXtub2RlLmNvbnRlbnRzLnNldChvbGRDb250ZW50cy5zdWJhcnJheSgwLE1hdGgubWluKG5ld1NpemUsbm9kZS51c2VkQnl0ZXMpKSl9bm9kZS51c2VkQnl0ZXM9bmV3U2l6ZX19LG5vZGVfb3BzOntnZXRhdHRyOmZ1bmN0aW9uKG5vZGUpe3ZhciBhdHRyPXt9O2F0dHIuZGV2PUZTLmlzQ2hyZGV2KG5vZGUubW9kZSk/bm9kZS5pZDoxO2F0dHIuaW5vPW5vZGUuaWQ7YXR0ci5tb2RlPW5vZGUubW9kZTthdHRyLm5saW5rPTE7YXR0ci51aWQ9MDthdHRyLmdpZD0wO2F0dHIucmRldj1ub2RlLnJkZXY7aWYoRlMuaXNEaXIobm9kZS5tb2RlKSl7YXR0ci5zaXplPTQwOTZ9ZWxzZSBpZihGUy5pc0ZpbGUobm9kZS5tb2RlKSl7YXR0ci5zaXplPW5vZGUudXNlZEJ5dGVzfWVsc2UgaWYoRlMuaXNMaW5rKG5vZGUubW9kZSkpe2F0dHIuc2l6ZT1ub2RlLmxpbmsubGVuZ3RofWVsc2V7YXR0ci5zaXplPTB9YXR0ci5hdGltZT1uZXcgRGF0ZShub2RlLnRpbWVzdGFtcCk7YXR0ci5tdGltZT1uZXcgRGF0ZShub2RlLnRpbWVzdGFtcCk7YXR0ci5jdGltZT1uZXcgRGF0ZShub2RlLnRpbWVzdGFtcCk7YXR0ci5ibGtzaXplPTQwOTY7YXR0ci5ibG9ja3M9TWF0aC5jZWlsKGF0dHIuc2l6ZS9hdHRyLmJsa3NpemUpO3JldHVybiBhdHRyfSxzZXRhdHRyOmZ1bmN0aW9uKG5vZGUsYXR0cil7aWYoYXR0ci5tb2RlIT09dW5kZWZpbmVkKXtub2RlLm1vZGU9YXR0ci5tb2RlfWlmKGF0dHIudGltZXN0YW1wIT09dW5kZWZpbmVkKXtub2RlLnRpbWVzdGFtcD1hdHRyLnRpbWVzdGFtcH1pZihhdHRyLnNpemUhPT11bmRlZmluZWQpe01FTUZTLnJlc2l6ZUZpbGVTdG9yYWdlKG5vZGUsYXR0ci5zaXplKX19LGxvb2t1cDpmdW5jdGlvbihwYXJlbnQsbmFtZSl7dGhyb3cgRlMuZ2VuZXJpY0Vycm9yc1s0NF19LG1rbm9kOmZ1bmN0aW9uKHBhcmVudCxuYW1lLG1vZGUsZGV2KXtyZXR1cm4gTUVNRlMuY3JlYXRlTm9kZShwYXJlbnQsbmFtZSxtb2RlLGRldil9LHJlbmFtZTpmdW5jdGlvbihvbGRfbm9kZSxuZXdfZGlyLG5ld19uYW1lKXtpZihGUy5pc0RpcihvbGRfbm9kZS5tb2RlKSl7dmFyIG5ld19ub2RlO3RyeXtuZXdfbm9kZT1GUy5sb29rdXBOb2RlKG5ld19kaXIsbmV3X25hbWUpfWNhdGNoKGUpe31pZihuZXdfbm9kZSl7Zm9yKHZhciBpIGluIG5ld19ub2RlLmNvbnRlbnRzKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NSl9fX1kZWxldGUgb2xkX25vZGUucGFyZW50LmNvbnRlbnRzW29sZF9ub2RlLm5hbWVdO29sZF9ub2RlLnBhcmVudC50aW1lc3RhbXA9RGF0ZS5ub3coKTtvbGRfbm9kZS5uYW1lPW5ld19uYW1lO25ld19kaXIuY29udGVudHNbbmV3X25hbWVdPW9sZF9ub2RlO25ld19kaXIudGltZXN0YW1wPW9sZF9ub2RlLnBhcmVudC50aW1lc3RhbXA7b2xkX25vZGUucGFyZW50PW5ld19kaXJ9LHVubGluazpmdW5jdGlvbihwYXJlbnQsbmFtZSl7ZGVsZXRlIHBhcmVudC5jb250ZW50c1tuYW1lXTtwYXJlbnQudGltZXN0YW1wPURhdGUubm93KCl9LHJtZGlyOmZ1bmN0aW9uKHBhcmVudCxuYW1lKXt2YXIgbm9kZT1GUy5sb29rdXBOb2RlKHBhcmVudCxuYW1lKTtmb3IodmFyIGkgaW4gbm9kZS5jb250ZW50cyl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTUpfWRlbGV0ZSBwYXJlbnQuY29udGVudHNbbmFtZV07cGFyZW50LnRpbWVzdGFtcD1EYXRlLm5vdygpfSxyZWFkZGlyOmZ1bmN0aW9uKG5vZGUpe3ZhciBlbnRyaWVzPVsiLiIsIi4uIl07Zm9yKHZhciBrZXkgaW4gbm9kZS5jb250ZW50cyl7aWYoIW5vZGUuY29udGVudHMuaGFzT3duUHJvcGVydHkoa2V5KSl7Y29udGludWV9ZW50cmllcy5wdXNoKGtleSl9cmV0dXJuIGVudHJpZXN9LHN5bWxpbms6ZnVuY3Rpb24ocGFyZW50LG5ld25hbWUsb2xkcGF0aCl7dmFyIG5vZGU9TUVNRlMuY3JlYXRlTm9kZShwYXJlbnQsbmV3bmFtZSw1MTF8NDA5NjAsMCk7bm9kZS5saW5rPW9sZHBhdGg7cmV0dXJuIG5vZGV9LHJlYWRsaW5rOmZ1bmN0aW9uKG5vZGUpe2lmKCFGUy5pc0xpbmsobm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXJldHVybiBub2RlLmxpbmt9fSxzdHJlYW1fb3BzOntyZWFkOmZ1bmN0aW9uKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbil7dmFyIGNvbnRlbnRzPXN0cmVhbS5ub2RlLmNvbnRlbnRzO2lmKHBvc2l0aW9uPj1zdHJlYW0ubm9kZS51c2VkQnl0ZXMpcmV0dXJuIDA7dmFyIHNpemU9TWF0aC5taW4oc3RyZWFtLm5vZGUudXNlZEJ5dGVzLXBvc2l0aW9uLGxlbmd0aCk7aWYoc2l6ZT44JiZjb250ZW50cy5zdWJhcnJheSl7YnVmZmVyLnNldChjb250ZW50cy5zdWJhcnJheShwb3NpdGlvbixwb3NpdGlvbitzaXplKSxvZmZzZXQpfWVsc2V7Zm9yKHZhciBpPTA7aTxzaXplO2krKylidWZmZXJbb2Zmc2V0K2ldPWNvbnRlbnRzW3Bvc2l0aW9uK2ldfXJldHVybiBzaXplfSx3cml0ZTpmdW5jdGlvbihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24sY2FuT3duKXtpZihidWZmZXIuYnVmZmVyPT09SEVBUDguYnVmZmVyKXtjYW5Pd249ZmFsc2V9aWYoIWxlbmd0aClyZXR1cm4gMDt2YXIgbm9kZT1zdHJlYW0ubm9kZTtub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpO2lmKGJ1ZmZlci5zdWJhcnJheSYmKCFub2RlLmNvbnRlbnRzfHxub2RlLmNvbnRlbnRzLnN1YmFycmF5KSl7aWYoY2FuT3duKXtub2RlLmNvbnRlbnRzPWJ1ZmZlci5zdWJhcnJheShvZmZzZXQsb2Zmc2V0K2xlbmd0aCk7bm9kZS51c2VkQnl0ZXM9bGVuZ3RoO3JldHVybiBsZW5ndGh9ZWxzZSBpZihub2RlLnVzZWRCeXRlcz09PTAmJnBvc2l0aW9uPT09MCl7bm9kZS5jb250ZW50cz1idWZmZXIuc2xpY2Uob2Zmc2V0LG9mZnNldCtsZW5ndGgpO25vZGUudXNlZEJ5dGVzPWxlbmd0aDtyZXR1cm4gbGVuZ3RofWVsc2UgaWYocG9zaXRpb24rbGVuZ3RoPD1ub2RlLnVzZWRCeXRlcyl7bm9kZS5jb250ZW50cy5zZXQoYnVmZmVyLnN1YmFycmF5KG9mZnNldCxvZmZzZXQrbGVuZ3RoKSxwb3NpdGlvbik7cmV0dXJuIGxlbmd0aH19TUVNRlMuZXhwYW5kRmlsZVN0b3JhZ2Uobm9kZSxwb3NpdGlvbitsZW5ndGgpO2lmKG5vZGUuY29udGVudHMuc3ViYXJyYXkmJmJ1ZmZlci5zdWJhcnJheSl7bm9kZS5jb250ZW50cy5zZXQoYnVmZmVyLnN1YmFycmF5KG9mZnNldCxvZmZzZXQrbGVuZ3RoKSxwb3NpdGlvbil9ZWxzZXtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe25vZGUuY29udGVudHNbcG9zaXRpb24raV09YnVmZmVyW29mZnNldCtpXX19bm9kZS51c2VkQnl0ZXM9TWF0aC5tYXgobm9kZS51c2VkQnl0ZXMscG9zaXRpb24rbGVuZ3RoKTtyZXR1cm4gbGVuZ3RofSxsbHNlZWs6ZnVuY3Rpb24oc3RyZWFtLG9mZnNldCx3aGVuY2Upe3ZhciBwb3NpdGlvbj1vZmZzZXQ7aWYod2hlbmNlPT09MSl7cG9zaXRpb24rPXN0cmVhbS5wb3NpdGlvbn1lbHNlIGlmKHdoZW5jZT09PTIpe2lmKEZTLmlzRmlsZShzdHJlYW0ubm9kZS5tb2RlKSl7cG9zaXRpb24rPXN0cmVhbS5ub2RlLnVzZWRCeXRlc319aWYocG9zaXRpb248MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXJldHVybiBwb3NpdGlvbn0sYWxsb2NhdGU6ZnVuY3Rpb24oc3RyZWFtLG9mZnNldCxsZW5ndGgpe01FTUZTLmV4cGFuZEZpbGVTdG9yYWdlKHN0cmVhbS5ub2RlLG9mZnNldCtsZW5ndGgpO3N0cmVhbS5ub2RlLnVzZWRCeXRlcz1NYXRoLm1heChzdHJlYW0ubm9kZS51c2VkQnl0ZXMsb2Zmc2V0K2xlbmd0aCl9LG1tYXA6ZnVuY3Rpb24oc3RyZWFtLGFkZHJlc3MsbGVuZ3RoLHBvc2l0aW9uLHByb3QsZmxhZ3Mpe2lmKGFkZHJlc3MhPT0wKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9aWYoIUZTLmlzRmlsZShzdHJlYW0ubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfXZhciBwdHI7dmFyIGFsbG9jYXRlZDt2YXIgY29udGVudHM9c3RyZWFtLm5vZGUuY29udGVudHM7aWYoIShmbGFncyYyKSYmY29udGVudHMuYnVmZmVyPT09YnVmZmVyKXthbGxvY2F0ZWQ9ZmFsc2U7cHRyPWNvbnRlbnRzLmJ5dGVPZmZzZXR9ZWxzZXtpZihwb3NpdGlvbj4wfHxwb3NpdGlvbitsZW5ndGg8Y29udGVudHMubGVuZ3RoKXtpZihjb250ZW50cy5zdWJhcnJheSl7Y29udGVudHM9Y29udGVudHMuc3ViYXJyYXkocG9zaXRpb24scG9zaXRpb24rbGVuZ3RoKX1lbHNle2NvbnRlbnRzPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNvbnRlbnRzLHBvc2l0aW9uLHBvc2l0aW9uK2xlbmd0aCl9fWFsbG9jYXRlZD10cnVlO3B0cj1tbWFwQWxsb2MobGVuZ3RoKTtpZighcHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0OCl9SEVBUDguc2V0KGNvbnRlbnRzLHB0cil9cmV0dXJue3B0cjpwdHIsYWxsb2NhdGVkOmFsbG9jYXRlZH19LG1zeW5jOmZ1bmN0aW9uKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxtbWFwRmxhZ3Mpe2lmKCFGUy5pc0ZpbGUoc3RyZWFtLm5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQzKX1pZihtbWFwRmxhZ3MmMil7cmV0dXJuIDB9dmFyIGJ5dGVzV3JpdHRlbj1NRU1GUy5zdHJlYW1fb3BzLndyaXRlKHN0cmVhbSxidWZmZXIsMCxsZW5ndGgsb2Zmc2V0LGZhbHNlKTtyZXR1cm4gMH19fTtmdW5jdGlvbiBhc3luY0xvYWQodXJsLG9ubG9hZCxvbmVycm9yLG5vUnVuRGVwKXt2YXIgZGVwPSFub1J1bkRlcD9nZXRVbmlxdWVSdW5EZXBlbmRlbmN5KCJhbCAiK3VybCk6IiI7cmVhZEFzeW5jKHVybCxmdW5jdGlvbihhcnJheUJ1ZmZlcil7YXNzZXJ0KGFycmF5QnVmZmVyLCdMb2FkaW5nIGRhdGEgZmlsZSAiJyt1cmwrJyIgZmFpbGVkIChubyBhcnJheUJ1ZmZlcikuJyk7b25sb2FkKG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKSk7aWYoZGVwKXJlbW92ZVJ1bkRlcGVuZGVuY3koZGVwKX0sZnVuY3Rpb24oZXZlbnQpe2lmKG9uZXJyb3Ipe29uZXJyb3IoKX1lbHNle3Rocm93J0xvYWRpbmcgZGF0YSBmaWxlICInK3VybCsnIiBmYWlsZWQuJ319KTtpZihkZXApYWRkUnVuRGVwZW5kZW5jeShkZXApfXZhciBGUz17cm9vdDpudWxsLG1vdW50czpbXSxkZXZpY2VzOnt9LHN0cmVhbXM6W10sbmV4dElub2RlOjEsbmFtZVRhYmxlOm51bGwsY3VycmVudFBhdGg6Ii8iLGluaXRpYWxpemVkOmZhbHNlLGlnbm9yZVBlcm1pc3Npb25zOnRydWUsRXJybm9FcnJvcjpudWxsLGdlbmVyaWNFcnJvcnM6e30sZmlsZXN5c3RlbXM6bnVsbCxzeW5jRlNSZXF1ZXN0czowLGxvb2t1cFBhdGg6KHBhdGgsb3B0cz17fSk9PntwYXRoPVBBVEhfRlMucmVzb2x2ZShGUy5jd2QoKSxwYXRoKTtpZighcGF0aClyZXR1cm57cGF0aDoiIixub2RlOm51bGx9O3ZhciBkZWZhdWx0cz17Zm9sbG93X21vdW50OnRydWUscmVjdXJzZV9jb3VudDowfTtvcHRzPU9iamVjdC5hc3NpZ24oZGVmYXVsdHMsb3B0cyk7aWYob3B0cy5yZWN1cnNlX2NvdW50Pjgpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDMyKX12YXIgcGFydHM9UEFUSC5ub3JtYWxpemVBcnJheShwYXRoLnNwbGl0KCIvIikuZmlsdGVyKHA9PiEhcCksZmFsc2UpO3ZhciBjdXJyZW50PUZTLnJvb3Q7dmFyIGN1cnJlbnRfcGF0aD0iLyI7Zm9yKHZhciBpPTA7aTxwYXJ0cy5sZW5ndGg7aSsrKXt2YXIgaXNsYXN0PWk9PT1wYXJ0cy5sZW5ndGgtMTtpZihpc2xhc3QmJm9wdHMucGFyZW50KXticmVha31jdXJyZW50PUZTLmxvb2t1cE5vZGUoY3VycmVudCxwYXJ0c1tpXSk7Y3VycmVudF9wYXRoPVBBVEguam9pbjIoY3VycmVudF9wYXRoLHBhcnRzW2ldKTtpZihGUy5pc01vdW50cG9pbnQoY3VycmVudCkpe2lmKCFpc2xhc3R8fGlzbGFzdCYmb3B0cy5mb2xsb3dfbW91bnQpe2N1cnJlbnQ9Y3VycmVudC5tb3VudGVkLnJvb3R9fWlmKCFpc2xhc3R8fG9wdHMuZm9sbG93KXt2YXIgY291bnQ9MDt3aGlsZShGUy5pc0xpbmsoY3VycmVudC5tb2RlKSl7dmFyIGxpbms9RlMucmVhZGxpbmsoY3VycmVudF9wYXRoKTtjdXJyZW50X3BhdGg9UEFUSF9GUy5yZXNvbHZlKFBBVEguZGlybmFtZShjdXJyZW50X3BhdGgpLGxpbmspO3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChjdXJyZW50X3BhdGgse3JlY3Vyc2VfY291bnQ6b3B0cy5yZWN1cnNlX2NvdW50KzF9KTtjdXJyZW50PWxvb2t1cC5ub2RlO2lmKGNvdW50Kys+NDApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDMyKX19fX1yZXR1cm57cGF0aDpjdXJyZW50X3BhdGgsbm9kZTpjdXJyZW50fX0sZ2V0UGF0aDpub2RlPT57dmFyIHBhdGg7d2hpbGUodHJ1ZSl7aWYoRlMuaXNSb290KG5vZGUpKXt2YXIgbW91bnQ9bm9kZS5tb3VudC5tb3VudHBvaW50O2lmKCFwYXRoKXJldHVybiBtb3VudDtyZXR1cm4gbW91bnRbbW91bnQubGVuZ3RoLTFdIT09Ii8iP21vdW50KyIvIitwYXRoOm1vdW50K3BhdGh9cGF0aD1wYXRoP25vZGUubmFtZSsiLyIrcGF0aDpub2RlLm5hbWU7bm9kZT1ub2RlLnBhcmVudH19LGhhc2hOYW1lOihwYXJlbnRpZCxuYW1lKT0+e3ZhciBoYXNoPTA7Zm9yKHZhciBpPTA7aTxuYW1lLmxlbmd0aDtpKyspe2hhc2g9KGhhc2g8PDUpLWhhc2grbmFtZS5jaGFyQ29kZUF0KGkpfDB9cmV0dXJuKHBhcmVudGlkK2hhc2g+Pj4wKSVGUy5uYW1lVGFibGUubGVuZ3RofSxoYXNoQWRkTm9kZTpub2RlPT57dmFyIGhhc2g9RlMuaGFzaE5hbWUobm9kZS5wYXJlbnQuaWQsbm9kZS5uYW1lKTtub2RlLm5hbWVfbmV4dD1GUy5uYW1lVGFibGVbaGFzaF07RlMubmFtZVRhYmxlW2hhc2hdPW5vZGV9LGhhc2hSZW1vdmVOb2RlOm5vZGU9Pnt2YXIgaGFzaD1GUy5oYXNoTmFtZShub2RlLnBhcmVudC5pZCxub2RlLm5hbWUpO2lmKEZTLm5hbWVUYWJsZVtoYXNoXT09PW5vZGUpe0ZTLm5hbWVUYWJsZVtoYXNoXT1ub2RlLm5hbWVfbmV4dH1lbHNle3ZhciBjdXJyZW50PUZTLm5hbWVUYWJsZVtoYXNoXTt3aGlsZShjdXJyZW50KXtpZihjdXJyZW50Lm5hbWVfbmV4dD09PW5vZGUpe2N1cnJlbnQubmFtZV9uZXh0PW5vZGUubmFtZV9uZXh0O2JyZWFrfWN1cnJlbnQ9Y3VycmVudC5uYW1lX25leHR9fX0sbG9va3VwTm9kZToocGFyZW50LG5hbWUpPT57dmFyIGVyckNvZGU9RlMubWF5TG9va3VwKHBhcmVudCk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSxwYXJlbnQpfXZhciBoYXNoPUZTLmhhc2hOYW1lKHBhcmVudC5pZCxuYW1lKTtmb3IodmFyIG5vZGU9RlMubmFtZVRhYmxlW2hhc2hdO25vZGU7bm9kZT1ub2RlLm5hbWVfbmV4dCl7dmFyIG5vZGVOYW1lPW5vZGUubmFtZTtpZihub2RlLnBhcmVudC5pZD09PXBhcmVudC5pZCYmbm9kZU5hbWU9PT1uYW1lKXtyZXR1cm4gbm9kZX19cmV0dXJuIEZTLmxvb2t1cChwYXJlbnQsbmFtZSl9LGNyZWF0ZU5vZGU6KHBhcmVudCxuYW1lLG1vZGUscmRldik9Pnt2YXIgbm9kZT1uZXcgRlMuRlNOb2RlKHBhcmVudCxuYW1lLG1vZGUscmRldik7RlMuaGFzaEFkZE5vZGUobm9kZSk7cmV0dXJuIG5vZGV9LGRlc3Ryb3lOb2RlOm5vZGU9PntGUy5oYXNoUmVtb3ZlTm9kZShub2RlKX0saXNSb290Om5vZGU9PntyZXR1cm4gbm9kZT09PW5vZGUucGFyZW50fSxpc01vdW50cG9pbnQ6bm9kZT0+e3JldHVybiEhbm9kZS5tb3VudGVkfSxpc0ZpbGU6bW9kZT0+e3JldHVybihtb2RlJjYxNDQwKT09PTMyNzY4fSxpc0Rpcjptb2RlPT57cmV0dXJuKG1vZGUmNjE0NDApPT09MTYzODR9LGlzTGluazptb2RlPT57cmV0dXJuKG1vZGUmNjE0NDApPT09NDA5NjB9LGlzQ2hyZGV2Om1vZGU9PntyZXR1cm4obW9kZSY2MTQ0MCk9PT04MTkyfSxpc0Jsa2Rldjptb2RlPT57cmV0dXJuKG1vZGUmNjE0NDApPT09MjQ1NzZ9LGlzRklGTzptb2RlPT57cmV0dXJuKG1vZGUmNjE0NDApPT09NDA5Nn0saXNTb2NrZXQ6bW9kZT0+e3JldHVybihtb2RlJjQ5MTUyKT09PTQ5MTUyfSxmbGFnTW9kZXM6eyJyIjowLCJyKyI6MiwidyI6NTc3LCJ3KyI6NTc4LCJhIjoxMDg5LCJhKyI6MTA5MH0sbW9kZVN0cmluZ1RvRmxhZ3M6c3RyPT57dmFyIGZsYWdzPUZTLmZsYWdNb2Rlc1tzdHJdO2lmKHR5cGVvZiBmbGFncz09InVuZGVmaW5lZCIpe3Rocm93IG5ldyBFcnJvcigiVW5rbm93biBmaWxlIG9wZW4gbW9kZTogIitzdHIpfXJldHVybiBmbGFnc30sZmxhZ3NUb1Blcm1pc3Npb25TdHJpbmc6ZmxhZz0+e3ZhciBwZXJtcz1bInIiLCJ3IiwicnciXVtmbGFnJjNdO2lmKGZsYWcmNTEyKXtwZXJtcys9IncifXJldHVybiBwZXJtc30sbm9kZVBlcm1pc3Npb25zOihub2RlLHBlcm1zKT0+e2lmKEZTLmlnbm9yZVBlcm1pc3Npb25zKXtyZXR1cm4gMH1pZihwZXJtcy5pbmNsdWRlcygiciIpJiYhKG5vZGUubW9kZSYyOTIpKXtyZXR1cm4gMn1lbHNlIGlmKHBlcm1zLmluY2x1ZGVzKCJ3IikmJiEobm9kZS5tb2RlJjE0Nikpe3JldHVybiAyfWVsc2UgaWYocGVybXMuaW5jbHVkZXMoIngiKSYmIShub2RlLm1vZGUmNzMpKXtyZXR1cm4gMn1yZXR1cm4gMH0sbWF5TG9va3VwOmRpcj0+e3ZhciBlcnJDb2RlPUZTLm5vZGVQZXJtaXNzaW9ucyhkaXIsIngiKTtpZihlcnJDb2RlKXJldHVybiBlcnJDb2RlO2lmKCFkaXIubm9kZV9vcHMubG9va3VwKXJldHVybiAyO3JldHVybiAwfSxtYXlDcmVhdGU6KGRpcixuYW1lKT0+e3RyeXt2YXIgbm9kZT1GUy5sb29rdXBOb2RlKGRpcixuYW1lKTtyZXR1cm4gMjB9Y2F0Y2goZSl7fXJldHVybiBGUy5ub2RlUGVybWlzc2lvbnMoZGlyLCJ3eCIpfSxtYXlEZWxldGU6KGRpcixuYW1lLGlzZGlyKT0+e3ZhciBub2RlO3RyeXtub2RlPUZTLmxvb2t1cE5vZGUoZGlyLG5hbWUpfWNhdGNoKGUpe3JldHVybiBlLmVycm5vfXZhciBlcnJDb2RlPUZTLm5vZGVQZXJtaXNzaW9ucyhkaXIsInd4Iik7aWYoZXJyQ29kZSl7cmV0dXJuIGVyckNvZGV9aWYoaXNkaXIpe2lmKCFGUy5pc0Rpcihub2RlLm1vZGUpKXtyZXR1cm4gNTR9aWYoRlMuaXNSb290KG5vZGUpfHxGUy5nZXRQYXRoKG5vZGUpPT09RlMuY3dkKCkpe3JldHVybiAxMH19ZWxzZXtpZihGUy5pc0Rpcihub2RlLm1vZGUpKXtyZXR1cm4gMzF9fXJldHVybiAwfSxtYXlPcGVuOihub2RlLGZsYWdzKT0+e2lmKCFub2RlKXtyZXR1cm4gNDR9aWYoRlMuaXNMaW5rKG5vZGUubW9kZSkpe3JldHVybiAzMn1lbHNlIGlmKEZTLmlzRGlyKG5vZGUubW9kZSkpe2lmKEZTLmZsYWdzVG9QZXJtaXNzaW9uU3RyaW5nKGZsYWdzKSE9PSJyInx8ZmxhZ3MmNTEyKXtyZXR1cm4gMzF9fXJldHVybiBGUy5ub2RlUGVybWlzc2lvbnMobm9kZSxGUy5mbGFnc1RvUGVybWlzc2lvblN0cmluZyhmbGFncykpfSxNQVhfT1BFTl9GRFM6NDA5NixuZXh0ZmQ6KGZkX3N0YXJ0PTAsZmRfZW5kPUZTLk1BWF9PUEVOX0ZEUyk9Pntmb3IodmFyIGZkPWZkX3N0YXJ0O2ZkPD1mZF9lbmQ7ZmQrKyl7aWYoIUZTLnN0cmVhbXNbZmRdKXtyZXR1cm4gZmR9fXRocm93IG5ldyBGUy5FcnJub0Vycm9yKDMzKX0sZ2V0U3RyZWFtOmZkPT5GUy5zdHJlYW1zW2ZkXSxjcmVhdGVTdHJlYW06KHN0cmVhbSxmZF9zdGFydCxmZF9lbmQpPT57aWYoIUZTLkZTU3RyZWFtKXtGUy5GU1N0cmVhbT1mdW5jdGlvbigpe3RoaXMuc2hhcmVkPXt9fTtGUy5GU1N0cmVhbS5wcm90b3R5cGU9e29iamVjdDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubm9kZX0sc2V0OmZ1bmN0aW9uKHZhbCl7dGhpcy5ub2RlPXZhbH19LGlzUmVhZDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMuZmxhZ3MmMjA5NzE1NSkhPT0xfX0saXNXcml0ZTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMuZmxhZ3MmMjA5NzE1NSkhPT0wfX0saXNBcHBlbmQ6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmZsYWdzJjEwMjR9fSxmbGFnczp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2hhcmVkLmZsYWdzfSxzZXQ6ZnVuY3Rpb24odmFsKXt0aGlzLnNoYXJlZC5mbGFncz12YWx9fSxwb3NpdGlvbjp7Z2V0IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2hhcmVkLnBvc2l0aW9ufSxzZXQ6ZnVuY3Rpb24odmFsKXt0aGlzLnNoYXJlZC5wb3NpdGlvbj12YWx9fX19c3RyZWFtPU9iamVjdC5hc3NpZ24obmV3IEZTLkZTU3RyZWFtLHN0cmVhbSk7dmFyIGZkPUZTLm5leHRmZChmZF9zdGFydCxmZF9lbmQpO3N0cmVhbS5mZD1mZDtGUy5zdHJlYW1zW2ZkXT1zdHJlYW07cmV0dXJuIHN0cmVhbX0sY2xvc2VTdHJlYW06ZmQ9PntGUy5zdHJlYW1zW2ZkXT1udWxsfSxjaHJkZXZfc3RyZWFtX29wczp7b3BlbjpzdHJlYW09Pnt2YXIgZGV2aWNlPUZTLmdldERldmljZShzdHJlYW0ubm9kZS5yZGV2KTtzdHJlYW0uc3RyZWFtX29wcz1kZXZpY2Uuc3RyZWFtX29wcztpZihzdHJlYW0uc3RyZWFtX29wcy5vcGVuKXtzdHJlYW0uc3RyZWFtX29wcy5vcGVuKHN0cmVhbSl9fSxsbHNlZWs6KCk9Pnt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig3MCl9fSxtYWpvcjpkZXY9PmRldj4+OCxtaW5vcjpkZXY9PmRldiYyNTUsbWFrZWRldjoobWEsbWkpPT5tYTw8OHxtaSxyZWdpc3RlckRldmljZTooZGV2LG9wcyk9PntGUy5kZXZpY2VzW2Rldl09e3N0cmVhbV9vcHM6b3BzfX0sZ2V0RGV2aWNlOmRldj0+RlMuZGV2aWNlc1tkZXZdLGdldE1vdW50czptb3VudD0+e3ZhciBtb3VudHM9W107dmFyIGNoZWNrPVttb3VudF07d2hpbGUoY2hlY2subGVuZ3RoKXt2YXIgbT1jaGVjay5wb3AoKTttb3VudHMucHVzaChtKTtjaGVjay5wdXNoLmFwcGx5KGNoZWNrLG0ubW91bnRzKX1yZXR1cm4gbW91bnRzfSxzeW5jZnM6KHBvcHVsYXRlLGNhbGxiYWNrKT0+e2lmKHR5cGVvZiBwb3B1bGF0ZT09ImZ1bmN0aW9uIil7Y2FsbGJhY2s9cG9wdWxhdGU7cG9wdWxhdGU9ZmFsc2V9RlMuc3luY0ZTUmVxdWVzdHMrKztpZihGUy5zeW5jRlNSZXF1ZXN0cz4xKXtlcnIoIndhcm5pbmc6ICIrRlMuc3luY0ZTUmVxdWVzdHMrIiBGUy5zeW5jZnMgb3BlcmF0aW9ucyBpbiBmbGlnaHQgYXQgb25jZSwgcHJvYmFibHkganVzdCBkb2luZyBleHRyYSB3b3JrIil9dmFyIG1vdW50cz1GUy5nZXRNb3VudHMoRlMucm9vdC5tb3VudCk7dmFyIGNvbXBsZXRlZD0wO2Z1bmN0aW9uIGRvQ2FsbGJhY2soZXJyQ29kZSl7RlMuc3luY0ZTUmVxdWVzdHMtLTtyZXR1cm4gY2FsbGJhY2soZXJyQ29kZSl9ZnVuY3Rpb24gZG9uZShlcnJDb2RlKXtpZihlcnJDb2RlKXtpZighZG9uZS5lcnJvcmVkKXtkb25lLmVycm9yZWQ9dHJ1ZTtyZXR1cm4gZG9DYWxsYmFjayhlcnJDb2RlKX1yZXR1cm59aWYoKytjb21wbGV0ZWQ+PW1vdW50cy5sZW5ndGgpe2RvQ2FsbGJhY2sobnVsbCl9fW1vdW50cy5mb3JFYWNoKG1vdW50PT57aWYoIW1vdW50LnR5cGUuc3luY2ZzKXtyZXR1cm4gZG9uZShudWxsKX1tb3VudC50eXBlLnN5bmNmcyhtb3VudCxwb3B1bGF0ZSxkb25lKX0pfSxtb3VudDoodHlwZSxvcHRzLG1vdW50cG9pbnQpPT57dmFyIHJvb3Q9bW91bnRwb2ludD09PSIvIjt2YXIgcHNldWRvPSFtb3VudHBvaW50O3ZhciBub2RlO2lmKHJvb3QmJkZTLnJvb3Qpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDEwKX1lbHNlIGlmKCFyb290JiYhcHNldWRvKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgobW91bnRwb2ludCx7Zm9sbG93X21vdW50OmZhbHNlfSk7bW91bnRwb2ludD1sb29rdXAucGF0aDtub2RlPWxvb2t1cC5ub2RlO2lmKEZTLmlzTW91bnRwb2ludChub2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTApfWlmKCFGUy5pc0Rpcihub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NCl9fXZhciBtb3VudD17dHlwZTp0eXBlLG9wdHM6b3B0cyxtb3VudHBvaW50Om1vdW50cG9pbnQsbW91bnRzOltdfTt2YXIgbW91bnRSb290PXR5cGUubW91bnQobW91bnQpO21vdW50Um9vdC5tb3VudD1tb3VudDttb3VudC5yb290PW1vdW50Um9vdDtpZihyb290KXtGUy5yb290PW1vdW50Um9vdH1lbHNlIGlmKG5vZGUpe25vZGUubW91bnRlZD1tb3VudDtpZihub2RlLm1vdW50KXtub2RlLm1vdW50Lm1vdW50cy5wdXNoKG1vdW50KX19cmV0dXJuIG1vdW50Um9vdH0sdW5tb3VudDptb3VudHBvaW50PT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKG1vdW50cG9pbnQse2ZvbGxvd19tb3VudDpmYWxzZX0pO2lmKCFGUy5pc01vdW50cG9pbnQobG9va3VwLm5vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9dmFyIG5vZGU9bG9va3VwLm5vZGU7dmFyIG1vdW50PW5vZGUubW91bnRlZDt2YXIgbW91bnRzPUZTLmdldE1vdW50cyhtb3VudCk7T2JqZWN0LmtleXMoRlMubmFtZVRhYmxlKS5mb3JFYWNoKGhhc2g9Pnt2YXIgY3VycmVudD1GUy5uYW1lVGFibGVbaGFzaF07d2hpbGUoY3VycmVudCl7dmFyIG5leHQ9Y3VycmVudC5uYW1lX25leHQ7aWYobW91bnRzLmluY2x1ZGVzKGN1cnJlbnQubW91bnQpKXtGUy5kZXN0cm95Tm9kZShjdXJyZW50KX1jdXJyZW50PW5leHR9fSk7bm9kZS5tb3VudGVkPW51bGw7dmFyIGlkeD1ub2RlLm1vdW50Lm1vdW50cy5pbmRleE9mKG1vdW50KTtub2RlLm1vdW50Lm1vdW50cy5zcGxpY2UoaWR4LDEpfSxsb29rdXA6KHBhcmVudCxuYW1lKT0+e3JldHVybiBwYXJlbnQubm9kZV9vcHMubG9va3VwKHBhcmVudCxuYW1lKX0sbWtub2Q6KHBhdGgsbW9kZSxkZXYpPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTt2YXIgbmFtZT1QQVRILmJhc2VuYW1lKHBhdGgpO2lmKCFuYW1lfHxuYW1lPT09Ii4ifHxuYW1lPT09Ii4uIil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXZhciBlcnJDb2RlPUZTLm1heUNyZWF0ZShwYXJlbnQsbmFtZSk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9aWYoIXBhcmVudC5ub2RlX29wcy5ta25vZCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfXJldHVybiBwYXJlbnQubm9kZV9vcHMubWtub2QocGFyZW50LG5hbWUsbW9kZSxkZXYpfSxjcmVhdGU6KHBhdGgsbW9kZSk9Pnttb2RlPW1vZGUhPT11bmRlZmluZWQ/bW9kZTo0Mzg7bW9kZSY9NDA5NTttb2RlfD0zMjc2ODtyZXR1cm4gRlMubWtub2QocGF0aCxtb2RlLDApfSxta2RpcjoocGF0aCxtb2RlKT0+e21vZGU9bW9kZSE9PXVuZGVmaW5lZD9tb2RlOjUxMTttb2RlJj01MTF8NTEyO21vZGV8PTE2Mzg0O3JldHVybiBGUy5ta25vZChwYXRoLG1vZGUsMCl9LG1rZGlyVHJlZToocGF0aCxtb2RlKT0+e3ZhciBkaXJzPXBhdGguc3BsaXQoIi8iKTt2YXIgZD0iIjtmb3IodmFyIGk9MDtpPGRpcnMubGVuZ3RoOysraSl7aWYoIWRpcnNbaV0pY29udGludWU7ZCs9Ii8iK2RpcnNbaV07dHJ5e0ZTLm1rZGlyKGQsbW9kZSl9Y2F0Y2goZSl7aWYoZS5lcnJubyE9MjApdGhyb3cgZX19fSxta2RldjoocGF0aCxtb2RlLGRldik9PntpZih0eXBlb2YgZGV2PT0idW5kZWZpbmVkIil7ZGV2PW1vZGU7bW9kZT00Mzh9bW9kZXw9ODE5MjtyZXR1cm4gRlMubWtub2QocGF0aCxtb2RlLGRldil9LHN5bWxpbms6KG9sZHBhdGgsbmV3cGF0aCk9PntpZighUEFUSF9GUy5yZXNvbHZlKG9sZHBhdGgpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKG5ld3BhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTtpZighcGFyZW50KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9dmFyIG5ld25hbWU9UEFUSC5iYXNlbmFtZShuZXdwYXRoKTt2YXIgZXJyQ29kZT1GUy5tYXlDcmVhdGUocGFyZW50LG5ld25hbWUpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfWlmKCFwYXJlbnQubm9kZV9vcHMuc3ltbGluayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfXJldHVybiBwYXJlbnQubm9kZV9vcHMuc3ltbGluayhwYXJlbnQsbmV3bmFtZSxvbGRwYXRoKX0scmVuYW1lOihvbGRfcGF0aCxuZXdfcGF0aCk9Pnt2YXIgb2xkX2Rpcm5hbWU9UEFUSC5kaXJuYW1lKG9sZF9wYXRoKTt2YXIgbmV3X2Rpcm5hbWU9UEFUSC5kaXJuYW1lKG5ld19wYXRoKTt2YXIgb2xkX25hbWU9UEFUSC5iYXNlbmFtZShvbGRfcGF0aCk7dmFyIG5ld19uYW1lPVBBVEguYmFzZW5hbWUobmV3X3BhdGgpO3ZhciBsb29rdXAsb2xkX2RpcixuZXdfZGlyO2xvb2t1cD1GUy5sb29rdXBQYXRoKG9sZF9wYXRoLHtwYXJlbnQ6dHJ1ZX0pO29sZF9kaXI9bG9va3VwLm5vZGU7bG9va3VwPUZTLmxvb2t1cFBhdGgobmV3X3BhdGgse3BhcmVudDp0cnVlfSk7bmV3X2Rpcj1sb29rdXAubm9kZTtpZighb2xkX2Rpcnx8IW5ld19kaXIpdGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpO2lmKG9sZF9kaXIubW91bnQhPT1uZXdfZGlyLm1vdW50KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig3NSl9dmFyIG9sZF9ub2RlPUZTLmxvb2t1cE5vZGUob2xkX2RpcixvbGRfbmFtZSk7dmFyIHJlbGF0aXZlPVBBVEhfRlMucmVsYXRpdmUob2xkX3BhdGgsbmV3X2Rpcm5hbWUpO2lmKHJlbGF0aXZlLmNoYXJBdCgwKSE9PSIuIil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXJlbGF0aXZlPVBBVEhfRlMucmVsYXRpdmUobmV3X3BhdGgsb2xkX2Rpcm5hbWUpO2lmKHJlbGF0aXZlLmNoYXJBdCgwKSE9PSIuIil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTUpfXZhciBuZXdfbm9kZTt0cnl7bmV3X25vZGU9RlMubG9va3VwTm9kZShuZXdfZGlyLG5ld19uYW1lKX1jYXRjaChlKXt9aWYob2xkX25vZGU9PT1uZXdfbm9kZSl7cmV0dXJufXZhciBpc2Rpcj1GUy5pc0RpcihvbGRfbm9kZS5tb2RlKTt2YXIgZXJyQ29kZT1GUy5tYXlEZWxldGUob2xkX2RpcixvbGRfbmFtZSxpc2Rpcik7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9ZXJyQ29kZT1uZXdfbm9kZT9GUy5tYXlEZWxldGUobmV3X2RpcixuZXdfbmFtZSxpc2Rpcik6RlMubWF5Q3JlYXRlKG5ld19kaXIsbmV3X25hbWUpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfWlmKCFvbGRfZGlyLm5vZGVfb3BzLnJlbmFtZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKEZTLmlzTW91bnRwb2ludChvbGRfbm9kZSl8fG5ld19ub2RlJiZGUy5pc01vdW50cG9pbnQobmV3X25vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9aWYobmV3X2RpciE9PW9sZF9kaXIpe2VyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKG9sZF9kaXIsInciKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX19RlMuaGFzaFJlbW92ZU5vZGUob2xkX25vZGUpO3RyeXtvbGRfZGlyLm5vZGVfb3BzLnJlbmFtZShvbGRfbm9kZSxuZXdfZGlyLG5ld19uYW1lKX1jYXRjaChlKXt0aHJvdyBlfWZpbmFsbHl7RlMuaGFzaEFkZE5vZGUob2xkX25vZGUpfX0scm1kaXI6cGF0aD0+e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtwYXJlbnQ6dHJ1ZX0pO3ZhciBwYXJlbnQ9bG9va3VwLm5vZGU7dmFyIG5hbWU9UEFUSC5iYXNlbmFtZShwYXRoKTt2YXIgbm9kZT1GUy5sb29rdXBOb2RlKHBhcmVudCxuYW1lKTt2YXIgZXJyQ29kZT1GUy5tYXlEZWxldGUocGFyZW50LG5hbWUsdHJ1ZSk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9aWYoIXBhcmVudC5ub2RlX29wcy5ybWRpcil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKEZTLmlzTW91bnRwb2ludChub2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTApfXBhcmVudC5ub2RlX29wcy5ybWRpcihwYXJlbnQsbmFtZSk7RlMuZGVzdHJveU5vZGUobm9kZSl9LHJlYWRkaXI6cGF0aD0+e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6dHJ1ZX0pO3ZhciBub2RlPWxvb2t1cC5ub2RlO2lmKCFub2RlLm5vZGVfb3BzLnJlYWRkaXIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU0KX1yZXR1cm4gbm9kZS5ub2RlX29wcy5yZWFkZGlyKG5vZGUpfSx1bmxpbms6cGF0aD0+e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtwYXJlbnQ6dHJ1ZX0pO3ZhciBwYXJlbnQ9bG9va3VwLm5vZGU7aWYoIXBhcmVudCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfXZhciBuYW1lPVBBVEguYmFzZW5hbWUocGF0aCk7dmFyIG5vZGU9RlMubG9va3VwTm9kZShwYXJlbnQsbmFtZSk7dmFyIGVyckNvZGU9RlMubWF5RGVsZXRlKHBhcmVudCxuYW1lLGZhbHNlKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1pZighcGFyZW50Lm5vZGVfb3BzLnVubGluayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKEZTLmlzTW91bnRwb2ludChub2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTApfXBhcmVudC5ub2RlX29wcy51bmxpbmsocGFyZW50LG5hbWUpO0ZTLmRlc3Ryb3lOb2RlKG5vZGUpfSxyZWFkbGluazpwYXRoPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgpO3ZhciBsaW5rPWxvb2t1cC5ub2RlO2lmKCFsaW5rKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9aWYoIWxpbmsubm9kZV9vcHMucmVhZGxpbmspe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1yZXR1cm4gUEFUSF9GUy5yZXNvbHZlKEZTLmdldFBhdGgobGluay5wYXJlbnQpLGxpbmsubm9kZV9vcHMucmVhZGxpbmsobGluaykpfSxzdGF0OihwYXRoLGRvbnRGb2xsb3cpPT57dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udEZvbGxvd30pO3ZhciBub2RlPWxvb2t1cC5ub2RlO2lmKCFub2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9aWYoIW5vZGUubm9kZV9vcHMuZ2V0YXR0cil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfXJldHVybiBub2RlLm5vZGVfb3BzLmdldGF0dHIobm9kZSl9LGxzdGF0OnBhdGg9PntyZXR1cm4gRlMuc3RhdChwYXRoLHRydWUpfSxjaG1vZDoocGF0aCxtb2RlLGRvbnRGb2xsb3cpPT57dmFyIG5vZGU7aWYodHlwZW9mIHBhdGg9PSJzdHJpbmciKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250Rm9sbG93fSk7bm9kZT1sb29rdXAubm9kZX1lbHNle25vZGU9cGF0aH1pZighbm9kZS5ub2RlX29wcy5zZXRhdHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9bm9kZS5ub2RlX29wcy5zZXRhdHRyKG5vZGUse21vZGU6bW9kZSY0MDk1fG5vZGUubW9kZSZ+NDA5NSx0aW1lc3RhbXA6RGF0ZS5ub3coKX0pfSxsY2htb2Q6KHBhdGgsbW9kZSk9PntGUy5jaG1vZChwYXRoLG1vZGUsdHJ1ZSl9LGZjaG1vZDooZmQsbW9kZSk9Pnt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbShmZCk7aWYoIXN0cmVhbSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9RlMuY2htb2Qoc3RyZWFtLm5vZGUsbW9kZSl9LGNob3duOihwYXRoLHVpZCxnaWQsZG9udEZvbGxvdyk9Pnt2YXIgbm9kZTtpZih0eXBlb2YgcGF0aD09InN0cmluZyIpe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6IWRvbnRGb2xsb3d9KTtub2RlPWxvb2t1cC5ub2RlfWVsc2V7bm9kZT1wYXRofWlmKCFub2RlLm5vZGVfb3BzLnNldGF0dHIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYzKX1ub2RlLm5vZGVfb3BzLnNldGF0dHIobm9kZSx7dGltZXN0YW1wOkRhdGUubm93KCl9KX0sbGNob3duOihwYXRoLHVpZCxnaWQpPT57RlMuY2hvd24ocGF0aCx1aWQsZ2lkLHRydWUpfSxmY2hvd246KGZkLHVpZCxnaWQpPT57dmFyIHN0cmVhbT1GUy5nZXRTdHJlYW0oZmQpO2lmKCFzdHJlYW0pe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfUZTLmNob3duKHN0cmVhbS5ub2RlLHVpZCxnaWQpfSx0cnVuY2F0ZToocGF0aCxsZW4pPT57aWYobGVuPDApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgbm9kZTtpZih0eXBlb2YgcGF0aD09InN0cmluZyIpe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6dHJ1ZX0pO25vZGU9bG9va3VwLm5vZGV9ZWxzZXtub2RlPXBhdGh9aWYoIW5vZGUubm9kZV9vcHMuc2V0YXR0cil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKEZTLmlzRGlyKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDMxKX1pZighRlMuaXNGaWxlKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgZXJyQ29kZT1GUy5ub2RlUGVybWlzc2lvbnMobm9kZSwidyIpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfW5vZGUubm9kZV9vcHMuc2V0YXR0cihub2RlLHtzaXplOmxlbix0aW1lc3RhbXA6RGF0ZS5ub3coKX0pfSxmdHJ1bmNhdGU6KGZkLGxlbik9Pnt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbShmZCk7aWYoIXN0cmVhbSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1GUy50cnVuY2F0ZShzdHJlYW0ubm9kZSxsZW4pfSx1dGltZToocGF0aCxhdGltZSxtdGltZSk9Pnt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OnRydWV9KTt2YXIgbm9kZT1sb29rdXAubm9kZTtub2RlLm5vZGVfb3BzLnNldGF0dHIobm9kZSx7dGltZXN0YW1wOk1hdGgubWF4KGF0aW1lLG10aW1lKX0pfSxvcGVuOihwYXRoLGZsYWdzLG1vZGUpPT57aWYocGF0aD09PSIiKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9ZmxhZ3M9dHlwZW9mIGZsYWdzPT0ic3RyaW5nIj9GUy5tb2RlU3RyaW5nVG9GbGFncyhmbGFncyk6ZmxhZ3M7bW9kZT10eXBlb2YgbW9kZT09InVuZGVmaW5lZCI/NDM4Om1vZGU7aWYoZmxhZ3MmNjQpe21vZGU9bW9kZSY0MDk1fDMyNzY4fWVsc2V7bW9kZT0wfXZhciBub2RlO2lmKHR5cGVvZiBwYXRoPT0ib2JqZWN0Iil7bm9kZT1wYXRofWVsc2V7cGF0aD1QQVRILm5vcm1hbGl6ZShwYXRoKTt0cnl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohKGZsYWdzJjEzMTA3Mil9KTtub2RlPWxvb2t1cC5ub2RlfWNhdGNoKGUpe319dmFyIGNyZWF0ZWQ9ZmFsc2U7aWYoZmxhZ3MmNjQpe2lmKG5vZGUpe2lmKGZsYWdzJjEyOCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjApfX1lbHNle25vZGU9RlMubWtub2QocGF0aCxtb2RlLDApO2NyZWF0ZWQ9dHJ1ZX19aWYoIW5vZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1pZihGUy5pc0NocmRldihub2RlLm1vZGUpKXtmbGFncyY9fjUxMn1pZihmbGFncyY2NTUzNiYmIUZTLmlzRGlyKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU0KX1pZighY3JlYXRlZCl7dmFyIGVyckNvZGU9RlMubWF5T3Blbihub2RlLGZsYWdzKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX19aWYoZmxhZ3MmNTEyJiYhY3JlYXRlZCl7RlMudHJ1bmNhdGUobm9kZSwwKX1mbGFncyY9figxMjh8NTEyfDEzMTA3Mik7dmFyIHN0cmVhbT1GUy5jcmVhdGVTdHJlYW0oe25vZGU6bm9kZSxwYXRoOkZTLmdldFBhdGgobm9kZSksZmxhZ3M6ZmxhZ3Msc2Vla2FibGU6dHJ1ZSxwb3NpdGlvbjowLHN0cmVhbV9vcHM6bm9kZS5zdHJlYW1fb3BzLHVuZ290dGVuOltdLGVycm9yOmZhbHNlfSk7aWYoc3RyZWFtLnN0cmVhbV9vcHMub3Blbil7c3RyZWFtLnN0cmVhbV9vcHMub3BlbihzdHJlYW0pfWlmKE1vZHVsZVsibG9nUmVhZEZpbGVzIl0mJiEoZmxhZ3MmMSkpe2lmKCFGUy5yZWFkRmlsZXMpRlMucmVhZEZpbGVzPXt9O2lmKCEocGF0aCBpbiBGUy5yZWFkRmlsZXMpKXtGUy5yZWFkRmlsZXNbcGF0aF09MX19cmV0dXJuIHN0cmVhbX0sY2xvc2U6c3RyZWFtPT57aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoc3RyZWFtLmdldGRlbnRzKXN0cmVhbS5nZXRkZW50cz1udWxsO3RyeXtpZihzdHJlYW0uc3RyZWFtX29wcy5jbG9zZSl7c3RyZWFtLnN0cmVhbV9vcHMuY2xvc2Uoc3RyZWFtKX19Y2F0Y2goZSl7dGhyb3cgZX1maW5hbGx5e0ZTLmNsb3NlU3RyZWFtKHN0cmVhbS5mZCl9c3RyZWFtLmZkPW51bGx9LGlzQ2xvc2VkOnN0cmVhbT0+e3JldHVybiBzdHJlYW0uZmQ9PT1udWxsfSxsbHNlZWs6KHN0cmVhbSxvZmZzZXQsd2hlbmNlKT0+e2lmKEZTLmlzQ2xvc2VkKHN0cmVhbSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKCFzdHJlYW0uc2Vla2FibGV8fCFzdHJlYW0uc3RyZWFtX29wcy5sbHNlZWspe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDcwKX1pZih3aGVuY2UhPTAmJndoZW5jZSE9MSYmd2hlbmNlIT0yKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9c3RyZWFtLnBvc2l0aW9uPXN0cmVhbS5zdHJlYW1fb3BzLmxsc2VlayhzdHJlYW0sb2Zmc2V0LHdoZW5jZSk7c3RyZWFtLnVuZ290dGVuPVtdO3JldHVybiBzdHJlYW0ucG9zaXRpb259LHJlYWQ6KHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbik9PntpZihsZW5ndGg8MHx8cG9zaXRpb248MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfWlmKEZTLmlzQ2xvc2VkKHN0cmVhbSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKChzdHJlYW0uZmxhZ3MmMjA5NzE1NSk9PT0xKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZihGUy5pc0RpcihzdHJlYW0ubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzEpfWlmKCFzdHJlYW0uc3RyZWFtX29wcy5yZWFkKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9dmFyIHNlZWtpbmc9dHlwZW9mIHBvc2l0aW9uIT0idW5kZWZpbmVkIjtpZighc2Vla2luZyl7cG9zaXRpb249c3RyZWFtLnBvc2l0aW9ufWVsc2UgaWYoIXN0cmVhbS5zZWVrYWJsZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNzApfXZhciBieXRlc1JlYWQ9c3RyZWFtLnN0cmVhbV9vcHMucmVhZChzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24pO2lmKCFzZWVraW5nKXN0cmVhbS5wb3NpdGlvbis9Ynl0ZXNSZWFkO3JldHVybiBieXRlc1JlYWR9LHdyaXRlOihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24sY2FuT3duKT0+e2lmKGxlbmd0aDwwfHxwb3NpdGlvbjwwKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKEZTLmlzRGlyKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigzMSl9aWYoIXN0cmVhbS5zdHJlYW1fb3BzLndyaXRlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9aWYoc3RyZWFtLnNlZWthYmxlJiZzdHJlYW0uZmxhZ3MmMTAyNCl7RlMubGxzZWVrKHN0cmVhbSwwLDIpfXZhciBzZWVraW5nPXR5cGVvZiBwb3NpdGlvbiE9InVuZGVmaW5lZCI7aWYoIXNlZWtpbmcpe3Bvc2l0aW9uPXN0cmVhbS5wb3NpdGlvbn1lbHNlIGlmKCFzdHJlYW0uc2Vla2FibGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDcwKX12YXIgYnl0ZXNXcml0dGVuPXN0cmVhbS5zdHJlYW1fb3BzLndyaXRlKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbixjYW5Pd24pO2lmKCFzZWVraW5nKXN0cmVhbS5wb3NpdGlvbis9Ynl0ZXNXcml0dGVuO3JldHVybiBieXRlc1dyaXR0ZW59LGFsbG9jYXRlOihzdHJlYW0sb2Zmc2V0LGxlbmd0aCk9PntpZihGUy5pc0Nsb3NlZChzdHJlYW0pKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZihvZmZzZXQ8MHx8bGVuZ3RoPD0wKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKCFGUy5pc0ZpbGUoc3RyZWFtLm5vZGUubW9kZSkmJiFGUy5pc0RpcihzdHJlYW0ubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfWlmKCFzdHJlYW0uc3RyZWFtX29wcy5hbGxvY2F0ZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTM4KX1zdHJlYW0uc3RyZWFtX29wcy5hbGxvY2F0ZShzdHJlYW0sb2Zmc2V0LGxlbmd0aCl9LG1tYXA6KHN0cmVhbSxhZGRyZXNzLGxlbmd0aCxwb3NpdGlvbixwcm90LGZsYWdzKT0+e2lmKChwcm90JjIpIT09MCYmKGZsYWdzJjIpPT09MCYmKHN0cmVhbS5mbGFncyYyMDk3MTU1KSE9PTIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDIpfWlmKChzdHJlYW0uZmxhZ3MmMjA5NzE1NSk9PT0xKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyKX1pZighc3RyZWFtLnN0cmVhbV9vcHMubW1hcCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfXJldHVybiBzdHJlYW0uc3RyZWFtX29wcy5tbWFwKHN0cmVhbSxhZGRyZXNzLGxlbmd0aCxwb3NpdGlvbixwcm90LGZsYWdzKX0sbXN5bmM6KHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxtbWFwRmxhZ3MpPT57aWYoIXN0cmVhbXx8IXN0cmVhbS5zdHJlYW1fb3BzLm1zeW5jKXtyZXR1cm4gMH1yZXR1cm4gc3RyZWFtLnN0cmVhbV9vcHMubXN5bmMoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLG1tYXBGbGFncyl9LG11bm1hcDpzdHJlYW09PjAsaW9jdGw6KHN0cmVhbSxjbWQsYXJnKT0+e2lmKCFzdHJlYW0uc3RyZWFtX29wcy5pb2N0bCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTkpfXJldHVybiBzdHJlYW0uc3RyZWFtX29wcy5pb2N0bChzdHJlYW0sY21kLGFyZyl9LHJlYWRGaWxlOihwYXRoLG9wdHM9e30pPT57b3B0cy5mbGFncz1vcHRzLmZsYWdzfHwwO29wdHMuZW5jb2Rpbmc9b3B0cy5lbmNvZGluZ3x8ImJpbmFyeSI7aWYob3B0cy5lbmNvZGluZyE9PSJ1dGY4IiYmb3B0cy5lbmNvZGluZyE9PSJiaW5hcnkiKXt0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZW5jb2RpbmcgdHlwZSAiJytvcHRzLmVuY29kaW5nKyciJyl9dmFyIHJldDt2YXIgc3RyZWFtPUZTLm9wZW4ocGF0aCxvcHRzLmZsYWdzKTt2YXIgc3RhdD1GUy5zdGF0KHBhdGgpO3ZhciBsZW5ndGg9c3RhdC5zaXplO3ZhciBidWY9bmV3IFVpbnQ4QXJyYXkobGVuZ3RoKTtGUy5yZWFkKHN0cmVhbSxidWYsMCxsZW5ndGgsMCk7aWYob3B0cy5lbmNvZGluZz09PSJ1dGY4Iil7cmV0PVVURjhBcnJheVRvU3RyaW5nKGJ1ZiwwKX1lbHNlIGlmKG9wdHMuZW5jb2Rpbmc9PT0iYmluYXJ5Iil7cmV0PWJ1Zn1GUy5jbG9zZShzdHJlYW0pO3JldHVybiByZXR9LHdyaXRlRmlsZToocGF0aCxkYXRhLG9wdHM9e30pPT57b3B0cy5mbGFncz1vcHRzLmZsYWdzfHw1Nzc7dmFyIHN0cmVhbT1GUy5vcGVuKHBhdGgsb3B0cy5mbGFncyxvcHRzLm1vZGUpO2lmKHR5cGVvZiBkYXRhPT0ic3RyaW5nIil7dmFyIGJ1Zj1uZXcgVWludDhBcnJheShsZW5ndGhCeXRlc1VURjgoZGF0YSkrMSk7dmFyIGFjdHVhbE51bUJ5dGVzPXN0cmluZ1RvVVRGOEFycmF5KGRhdGEsYnVmLDAsYnVmLmxlbmd0aCk7RlMud3JpdGUoc3RyZWFtLGJ1ZiwwLGFjdHVhbE51bUJ5dGVzLHVuZGVmaW5lZCxvcHRzLmNhbk93bil9ZWxzZSBpZihBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpe0ZTLndyaXRlKHN0cmVhbSxkYXRhLDAsZGF0YS5ieXRlTGVuZ3RoLHVuZGVmaW5lZCxvcHRzLmNhbk93bil9ZWxzZXt0aHJvdyBuZXcgRXJyb3IoIlVuc3VwcG9ydGVkIGRhdGEgdHlwZSIpfUZTLmNsb3NlKHN0cmVhbSl9LGN3ZDooKT0+RlMuY3VycmVudFBhdGgsY2hkaXI6cGF0aD0+e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6dHJ1ZX0pO2lmKGxvb2t1cC5ub2RlPT09bnVsbCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfWlmKCFGUy5pc0Rpcihsb29rdXAubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTQpfXZhciBlcnJDb2RlPUZTLm5vZGVQZXJtaXNzaW9ucyhsb29rdXAubm9kZSwieCIpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfUZTLmN1cnJlbnRQYXRoPWxvb2t1cC5wYXRofSxjcmVhdGVEZWZhdWx0RGlyZWN0b3JpZXM6KCk9PntGUy5ta2RpcigiL3RtcCIpO0ZTLm1rZGlyKCIvaG9tZSIpO0ZTLm1rZGlyKCIvaG9tZS93ZWJfdXNlciIpfSxjcmVhdGVEZWZhdWx0RGV2aWNlczooKT0+e0ZTLm1rZGlyKCIvZGV2Iik7RlMucmVnaXN0ZXJEZXZpY2UoRlMubWFrZWRldigxLDMpLHtyZWFkOigpPT4wLHdyaXRlOihzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zKT0+bGVuZ3RofSk7RlMubWtkZXYoIi9kZXYvbnVsbCIsRlMubWFrZWRldigxLDMpKTtUVFkucmVnaXN0ZXIoRlMubWFrZWRldig1LDApLFRUWS5kZWZhdWx0X3R0eV9vcHMpO1RUWS5yZWdpc3RlcihGUy5tYWtlZGV2KDYsMCksVFRZLmRlZmF1bHRfdHR5MV9vcHMpO0ZTLm1rZGV2KCIvZGV2L3R0eSIsRlMubWFrZWRldig1LDApKTtGUy5ta2RldigiL2Rldi90dHkxIixGUy5tYWtlZGV2KDYsMCkpO3ZhciByYW5kb21fZGV2aWNlPWdldFJhbmRvbURldmljZSgpO0ZTLmNyZWF0ZURldmljZSgiL2RldiIsInJhbmRvbSIscmFuZG9tX2RldmljZSk7RlMuY3JlYXRlRGV2aWNlKCIvZGV2IiwidXJhbmRvbSIscmFuZG9tX2RldmljZSk7RlMubWtkaXIoIi9kZXYvc2htIik7RlMubWtkaXIoIi9kZXYvc2htL3RtcCIpfSxjcmVhdGVTcGVjaWFsRGlyZWN0b3JpZXM6KCk9PntGUy5ta2RpcigiL3Byb2MiKTt2YXIgcHJvY19zZWxmPUZTLm1rZGlyKCIvcHJvYy9zZWxmIik7RlMubWtkaXIoIi9wcm9jL3NlbGYvZmQiKTtGUy5tb3VudCh7bW91bnQ6KCk9Pnt2YXIgbm9kZT1GUy5jcmVhdGVOb2RlKHByb2Nfc2VsZiwiZmQiLDE2Mzg0fDUxMSw3Myk7bm9kZS5ub2RlX29wcz17bG9va3VwOihwYXJlbnQsbmFtZSk9Pnt2YXIgZmQ9K25hbWU7dmFyIHN0cmVhbT1GUy5nZXRTdHJlYW0oZmQpO2lmKCFzdHJlYW0pdGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCk7dmFyIHJldD17cGFyZW50Om51bGwsbW91bnQ6e21vdW50cG9pbnQ6ImZha2UifSxub2RlX29wczp7cmVhZGxpbms6KCk9PnN0cmVhbS5wYXRofX07cmV0LnBhcmVudD1yZXQ7cmV0dXJuIHJldH19O3JldHVybiBub2RlfX0se30sIi9wcm9jL3NlbGYvZmQiKX0sY3JlYXRlU3RhbmRhcmRTdHJlYW1zOigpPT57aWYoTW9kdWxlWyJzdGRpbiJdKXtGUy5jcmVhdGVEZXZpY2UoIi9kZXYiLCJzdGRpbiIsTW9kdWxlWyJzdGRpbiJdKX1lbHNle0ZTLnN5bWxpbmsoIi9kZXYvdHR5IiwiL2Rldi9zdGRpbiIpfWlmKE1vZHVsZVsic3Rkb3V0Il0pe0ZTLmNyZWF0ZURldmljZSgiL2RldiIsInN0ZG91dCIsbnVsbCxNb2R1bGVbInN0ZG91dCJdKX1lbHNle0ZTLnN5bWxpbmsoIi9kZXYvdHR5IiwiL2Rldi9zdGRvdXQiKX1pZihNb2R1bGVbInN0ZGVyciJdKXtGUy5jcmVhdGVEZXZpY2UoIi9kZXYiLCJzdGRlcnIiLG51bGwsTW9kdWxlWyJzdGRlcnIiXSl9ZWxzZXtGUy5zeW1saW5rKCIvZGV2L3R0eTEiLCIvZGV2L3N0ZGVyciIpfXZhciBzdGRpbj1GUy5vcGVuKCIvZGV2L3N0ZGluIiwwKTt2YXIgc3Rkb3V0PUZTLm9wZW4oIi9kZXYvc3Rkb3V0IiwxKTt2YXIgc3RkZXJyPUZTLm9wZW4oIi9kZXYvc3RkZXJyIiwxKX0sZW5zdXJlRXJybm9FcnJvcjooKT0+e2lmKEZTLkVycm5vRXJyb3IpcmV0dXJuO0ZTLkVycm5vRXJyb3I9ZnVuY3Rpb24gRXJybm9FcnJvcihlcnJubyxub2RlKXt0aGlzLm5vZGU9bm9kZTt0aGlzLnNldEVycm5vPWZ1bmN0aW9uKGVycm5vKXt0aGlzLmVycm5vPWVycm5vfTt0aGlzLnNldEVycm5vKGVycm5vKTt0aGlzLm1lc3NhZ2U9IkZTIGVycm9yIn07RlMuRXJybm9FcnJvci5wcm90b3R5cGU9bmV3IEVycm9yO0ZTLkVycm5vRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yPUZTLkVycm5vRXJyb3I7WzQ0XS5mb3JFYWNoKGNvZGU9PntGUy5nZW5lcmljRXJyb3JzW2NvZGVdPW5ldyBGUy5FcnJub0Vycm9yKGNvZGUpO0ZTLmdlbmVyaWNFcnJvcnNbY29kZV0uc3RhY2s9IjxnZW5lcmljIGVycm9yLCBubyBzdGFjaz4ifSl9LHN0YXRpY0luaXQ6KCk9PntGUy5lbnN1cmVFcnJub0Vycm9yKCk7RlMubmFtZVRhYmxlPW5ldyBBcnJheSg0MDk2KTtGUy5tb3VudChNRU1GUyx7fSwiLyIpO0ZTLmNyZWF0ZURlZmF1bHREaXJlY3RvcmllcygpO0ZTLmNyZWF0ZURlZmF1bHREZXZpY2VzKCk7RlMuY3JlYXRlU3BlY2lhbERpcmVjdG9yaWVzKCk7RlMuZmlsZXN5c3RlbXM9eyJNRU1GUyI6TUVNRlN9fSxpbml0OihpbnB1dCxvdXRwdXQsZXJyb3IpPT57RlMuaW5pdC5pbml0aWFsaXplZD10cnVlO0ZTLmVuc3VyZUVycm5vRXJyb3IoKTtNb2R1bGVbInN0ZGluIl09aW5wdXR8fE1vZHVsZVsic3RkaW4iXTtNb2R1bGVbInN0ZG91dCJdPW91dHB1dHx8TW9kdWxlWyJzdGRvdXQiXTtNb2R1bGVbInN0ZGVyciJdPWVycm9yfHxNb2R1bGVbInN0ZGVyciJdO0ZTLmNyZWF0ZVN0YW5kYXJkU3RyZWFtcygpfSxxdWl0OigpPT57RlMuaW5pdC5pbml0aWFsaXplZD1mYWxzZTtfX19zdGRpb19leGl0KCk7Zm9yKHZhciBpPTA7aTxGUy5zdHJlYW1zLmxlbmd0aDtpKyspe3ZhciBzdHJlYW09RlMuc3RyZWFtc1tpXTtpZighc3RyZWFtKXtjb250aW51ZX1GUy5jbG9zZShzdHJlYW0pfX0sZ2V0TW9kZTooY2FuUmVhZCxjYW5Xcml0ZSk9Pnt2YXIgbW9kZT0wO2lmKGNhblJlYWQpbW9kZXw9MjkyfDczO2lmKGNhbldyaXRlKW1vZGV8PTE0NjtyZXR1cm4gbW9kZX0sZmluZE9iamVjdDoocGF0aCxkb250UmVzb2x2ZUxhc3RMaW5rKT0+e3ZhciByZXQ9RlMuYW5hbHl6ZVBhdGgocGF0aCxkb250UmVzb2x2ZUxhc3RMaW5rKTtpZihyZXQuZXhpc3RzKXtyZXR1cm4gcmV0Lm9iamVjdH1lbHNle3JldHVybiBudWxsfX0sYW5hbHl6ZVBhdGg6KHBhdGgsZG9udFJlc29sdmVMYXN0TGluayk9Pnt0cnl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udFJlc29sdmVMYXN0TGlua30pO3BhdGg9bG9va3VwLnBhdGh9Y2F0Y2goZSl7fXZhciByZXQ9e2lzUm9vdDpmYWxzZSxleGlzdHM6ZmFsc2UsZXJyb3I6MCxuYW1lOm51bGwscGF0aDpudWxsLG9iamVjdDpudWxsLHBhcmVudEV4aXN0czpmYWxzZSxwYXJlbnRQYXRoOm51bGwscGFyZW50T2JqZWN0Om51bGx9O3RyeXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7cGFyZW50OnRydWV9KTtyZXQucGFyZW50RXhpc3RzPXRydWU7cmV0LnBhcmVudFBhdGg9bG9va3VwLnBhdGg7cmV0LnBhcmVudE9iamVjdD1sb29rdXAubm9kZTtyZXQubmFtZT1QQVRILmJhc2VuYW1lKHBhdGgpO2xvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udFJlc29sdmVMYXN0TGlua30pO3JldC5leGlzdHM9dHJ1ZTtyZXQucGF0aD1sb29rdXAucGF0aDtyZXQub2JqZWN0PWxvb2t1cC5ub2RlO3JldC5uYW1lPWxvb2t1cC5ub2RlLm5hbWU7cmV0LmlzUm9vdD1sb29rdXAucGF0aD09PSIvIn1jYXRjaChlKXtyZXQuZXJyb3I9ZS5lcnJub31yZXR1cm4gcmV0fSxjcmVhdGVQYXRoOihwYXJlbnQscGF0aCxjYW5SZWFkLGNhbldyaXRlKT0+e3BhcmVudD10eXBlb2YgcGFyZW50PT0ic3RyaW5nIj9wYXJlbnQ6RlMuZ2V0UGF0aChwYXJlbnQpO3ZhciBwYXJ0cz1wYXRoLnNwbGl0KCIvIikucmV2ZXJzZSgpO3doaWxlKHBhcnRzLmxlbmd0aCl7dmFyIHBhcnQ9cGFydHMucG9wKCk7aWYoIXBhcnQpY29udGludWU7dmFyIGN1cnJlbnQ9UEFUSC5qb2luMihwYXJlbnQscGFydCk7dHJ5e0ZTLm1rZGlyKGN1cnJlbnQpfWNhdGNoKGUpe31wYXJlbnQ9Y3VycmVudH1yZXR1cm4gY3VycmVudH0sY3JlYXRlRmlsZToocGFyZW50LG5hbWUscHJvcGVydGllcyxjYW5SZWFkLGNhbldyaXRlKT0+e3ZhciBwYXRoPVBBVEguam9pbjIodHlwZW9mIHBhcmVudD09InN0cmluZyI/cGFyZW50OkZTLmdldFBhdGgocGFyZW50KSxuYW1lKTt2YXIgbW9kZT1GUy5nZXRNb2RlKGNhblJlYWQsY2FuV3JpdGUpO3JldHVybiBGUy5jcmVhdGUocGF0aCxtb2RlKX0sY3JlYXRlRGF0YUZpbGU6KHBhcmVudCxuYW1lLGRhdGEsY2FuUmVhZCxjYW5Xcml0ZSxjYW5Pd24pPT57dmFyIHBhdGg9bmFtZTtpZihwYXJlbnQpe3BhcmVudD10eXBlb2YgcGFyZW50PT0ic3RyaW5nIj9wYXJlbnQ6RlMuZ2V0UGF0aChwYXJlbnQpO3BhdGg9bmFtZT9QQVRILmpvaW4yKHBhcmVudCxuYW1lKTpwYXJlbnR9dmFyIG1vZGU9RlMuZ2V0TW9kZShjYW5SZWFkLGNhbldyaXRlKTt2YXIgbm9kZT1GUy5jcmVhdGUocGF0aCxtb2RlKTtpZihkYXRhKXtpZih0eXBlb2YgZGF0YT09InN0cmluZyIpe3ZhciBhcnI9bmV3IEFycmF5KGRhdGEubGVuZ3RoKTtmb3IodmFyIGk9MCxsZW49ZGF0YS5sZW5ndGg7aTxsZW47KytpKWFycltpXT1kYXRhLmNoYXJDb2RlQXQoaSk7ZGF0YT1hcnJ9RlMuY2htb2Qobm9kZSxtb2RlfDE0Nik7dmFyIHN0cmVhbT1GUy5vcGVuKG5vZGUsNTc3KTtGUy53cml0ZShzdHJlYW0sZGF0YSwwLGRhdGEubGVuZ3RoLDAsY2FuT3duKTtGUy5jbG9zZShzdHJlYW0pO0ZTLmNobW9kKG5vZGUsbW9kZSl9cmV0dXJuIG5vZGV9LGNyZWF0ZURldmljZToocGFyZW50LG5hbWUsaW5wdXQsb3V0cHV0KT0+e3ZhciBwYXRoPVBBVEguam9pbjIodHlwZW9mIHBhcmVudD09InN0cmluZyI/cGFyZW50OkZTLmdldFBhdGgocGFyZW50KSxuYW1lKTt2YXIgbW9kZT1GUy5nZXRNb2RlKCEhaW5wdXQsISFvdXRwdXQpO2lmKCFGUy5jcmVhdGVEZXZpY2UubWFqb3IpRlMuY3JlYXRlRGV2aWNlLm1ham9yPTY0O3ZhciBkZXY9RlMubWFrZWRldihGUy5jcmVhdGVEZXZpY2UubWFqb3IrKywwKTtGUy5yZWdpc3RlckRldmljZShkZXYse29wZW46c3RyZWFtPT57c3RyZWFtLnNlZWthYmxlPWZhbHNlfSxjbG9zZTpzdHJlYW09PntpZihvdXRwdXQmJm91dHB1dC5idWZmZXImJm91dHB1dC5idWZmZXIubGVuZ3RoKXtvdXRwdXQoMTApfX0scmVhZDooc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvcyk9Pnt2YXIgYnl0ZXNSZWFkPTA7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXt2YXIgcmVzdWx0O3RyeXtyZXN1bHQ9aW5wdXQoKX1jYXRjaChlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOSl9aWYocmVzdWx0PT09dW5kZWZpbmVkJiZieXRlc1JlYWQ9PT0wKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2KX1pZihyZXN1bHQ9PT1udWxsfHxyZXN1bHQ9PT11bmRlZmluZWQpYnJlYWs7Ynl0ZXNSZWFkKys7YnVmZmVyW29mZnNldCtpXT1yZXN1bHR9aWYoYnl0ZXNSZWFkKXtzdHJlYW0ubm9kZS50aW1lc3RhbXA9RGF0ZS5ub3coKX1yZXR1cm4gYnl0ZXNSZWFkfSx3cml0ZTooc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvcyk9Pntmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe3RyeXtvdXRwdXQoYnVmZmVyW29mZnNldCtpXSl9Y2F0Y2goZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjkpfX1pZihsZW5ndGgpe3N0cmVhbS5ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpfXJldHVybiBpfX0pO3JldHVybiBGUy5ta2RldihwYXRoLG1vZGUsZGV2KX0sZm9yY2VMb2FkRmlsZTpvYmo9PntpZihvYmouaXNEZXZpY2V8fG9iai5pc0ZvbGRlcnx8b2JqLmxpbmt8fG9iai5jb250ZW50cylyZXR1cm4gdHJ1ZTtpZih0eXBlb2YgWE1MSHR0cFJlcXVlc3QhPSJ1bmRlZmluZWQiKXt0aHJvdyBuZXcgRXJyb3IoIkxhenkgbG9hZGluZyBzaG91bGQgaGF2ZSBiZWVuIHBlcmZvcm1lZCAoY29udGVudHMgc2V0KSBpbiBjcmVhdGVMYXp5RmlsZSwgYnV0IGl0IHdhcyBub3QuIExhenkgbG9hZGluZyBvbmx5IHdvcmtzIGluIHdlYiB3b3JrZXJzLiBVc2UgLS1lbWJlZC1maWxlIG9yIC0tcHJlbG9hZC1maWxlIGluIGVtY2Mgb24gdGhlIG1haW4gdGhyZWFkLiIpfWVsc2UgaWYocmVhZF8pe3RyeXtvYmouY29udGVudHM9aW50QXJyYXlGcm9tU3RyaW5nKHJlYWRfKG9iai51cmwpLHRydWUpO29iai51c2VkQnl0ZXM9b2JqLmNvbnRlbnRzLmxlbmd0aH1jYXRjaChlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOSl9fWVsc2V7dGhyb3cgbmV3IEVycm9yKCJDYW5ub3QgbG9hZCB3aXRob3V0IHJlYWQoKSBvciBYTUxIdHRwUmVxdWVzdC4iKX19LGNyZWF0ZUxhenlGaWxlOihwYXJlbnQsbmFtZSx1cmwsY2FuUmVhZCxjYW5Xcml0ZSk9PntmdW5jdGlvbiBMYXp5VWludDhBcnJheSgpe3RoaXMubGVuZ3RoS25vd249ZmFsc2U7dGhpcy5jaHVua3M9W119TGF6eVVpbnQ4QXJyYXkucHJvdG90eXBlLmdldD1mdW5jdGlvbiBMYXp5VWludDhBcnJheV9nZXQoaWR4KXtpZihpZHg+dGhpcy5sZW5ndGgtMXx8aWR4PDApe3JldHVybiB1bmRlZmluZWR9dmFyIGNodW5rT2Zmc2V0PWlkeCV0aGlzLmNodW5rU2l6ZTt2YXIgY2h1bmtOdW09aWR4L3RoaXMuY2h1bmtTaXplfDA7cmV0dXJuIHRoaXMuZ2V0dGVyKGNodW5rTnVtKVtjaHVua09mZnNldF19O0xhenlVaW50OEFycmF5LnByb3RvdHlwZS5zZXREYXRhR2V0dGVyPWZ1bmN0aW9uIExhenlVaW50OEFycmF5X3NldERhdGFHZXR0ZXIoZ2V0dGVyKXt0aGlzLmdldHRlcj1nZXR0ZXJ9O0xhenlVaW50OEFycmF5LnByb3RvdHlwZS5jYWNoZUxlbmd0aD1mdW5jdGlvbiBMYXp5VWludDhBcnJheV9jYWNoZUxlbmd0aCgpe3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJIRUFEIix1cmwsZmFsc2UpO3hoci5zZW5kKG51bGwpO2lmKCEoeGhyLnN0YXR1cz49MjAwJiZ4aHIuc3RhdHVzPDMwMHx8eGhyLnN0YXR1cz09PTMwNCkpdGhyb3cgbmV3IEVycm9yKCJDb3VsZG4ndCBsb2FkICIrdXJsKyIuIFN0YXR1czogIit4aHIuc3RhdHVzKTt2YXIgZGF0YWxlbmd0aD1OdW1iZXIoeGhyLmdldFJlc3BvbnNlSGVhZGVyKCJDb250ZW50LWxlbmd0aCIpKTt2YXIgaGVhZGVyO3ZhciBoYXNCeXRlU2VydmluZz0oaGVhZGVyPXhoci5nZXRSZXNwb25zZUhlYWRlcigiQWNjZXB0LVJhbmdlcyIpKSYmaGVhZGVyPT09ImJ5dGVzIjt2YXIgdXNlc0d6aXA9KGhlYWRlcj14aHIuZ2V0UmVzcG9uc2VIZWFkZXIoIkNvbnRlbnQtRW5jb2RpbmciKSkmJmhlYWRlcj09PSJnemlwIjt2YXIgY2h1bmtTaXplPTEwMjQqMTAyNDtpZighaGFzQnl0ZVNlcnZpbmcpY2h1bmtTaXplPWRhdGFsZW5ndGg7dmFyIGRvWEhSPShmcm9tLHRvKT0+e2lmKGZyb20+dG8pdGhyb3cgbmV3IEVycm9yKCJpbnZhbGlkIHJhbmdlICgiK2Zyb20rIiwgIit0bysiKSBvciBubyBieXRlcyByZXF1ZXN0ZWQhIik7aWYodG8+ZGF0YWxlbmd0aC0xKXRocm93IG5ldyBFcnJvcigib25seSAiK2RhdGFsZW5ndGgrIiBieXRlcyBhdmFpbGFibGUhIHByb2dyYW1tZXIgZXJyb3IhIik7dmFyIHhocj1uZXcgWE1MSHR0cFJlcXVlc3Q7eGhyLm9wZW4oIkdFVCIsdXJsLGZhbHNlKTtpZihkYXRhbGVuZ3RoIT09Y2h1bmtTaXplKXhoci5zZXRSZXF1ZXN0SGVhZGVyKCJSYW5nZSIsImJ5dGVzPSIrZnJvbSsiLSIrdG8pO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjtpZih4aHIub3ZlcnJpZGVNaW1lVHlwZSl7eGhyLm92ZXJyaWRlTWltZVR5cGUoInRleHQvcGxhaW47IGNoYXJzZXQ9eC11c2VyLWRlZmluZWQiKX14aHIuc2VuZChudWxsKTtpZighKHhoci5zdGF0dXM+PTIwMCYmeGhyLnN0YXR1czwzMDB8fHhoci5zdGF0dXM9PT0zMDQpKXRocm93IG5ldyBFcnJvcigiQ291bGRuJ3QgbG9hZCAiK3VybCsiLiBTdGF0dXM6ICIreGhyLnN0YXR1cyk7aWYoeGhyLnJlc3BvbnNlIT09dW5kZWZpbmVkKXtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlfHxbXSl9ZWxzZXtyZXR1cm4gaW50QXJyYXlGcm9tU3RyaW5nKHhoci5yZXNwb25zZVRleHR8fCIiLHRydWUpfX07dmFyIGxhenlBcnJheT10aGlzO2xhenlBcnJheS5zZXREYXRhR2V0dGVyKGNodW5rTnVtPT57dmFyIHN0YXJ0PWNodW5rTnVtKmNodW5rU2l6ZTt2YXIgZW5kPShjaHVua051bSsxKSpjaHVua1NpemUtMTtlbmQ9TWF0aC5taW4oZW5kLGRhdGFsZW5ndGgtMSk7aWYodHlwZW9mIGxhenlBcnJheS5jaHVua3NbY2h1bmtOdW1dPT0idW5kZWZpbmVkIil7bGF6eUFycmF5LmNodW5rc1tjaHVua051bV09ZG9YSFIoc3RhcnQsZW5kKX1pZih0eXBlb2YgbGF6eUFycmF5LmNodW5rc1tjaHVua051bV09PSJ1bmRlZmluZWQiKXRocm93IG5ldyBFcnJvcigiZG9YSFIgZmFpbGVkISIpO3JldHVybiBsYXp5QXJyYXkuY2h1bmtzW2NodW5rTnVtXX0pO2lmKHVzZXNHemlwfHwhZGF0YWxlbmd0aCl7Y2h1bmtTaXplPWRhdGFsZW5ndGg9MTtkYXRhbGVuZ3RoPXRoaXMuZ2V0dGVyKDApLmxlbmd0aDtjaHVua1NpemU9ZGF0YWxlbmd0aDtvdXQoIkxhenlGaWxlcyBvbiBnemlwIGZvcmNlcyBkb3dubG9hZCBvZiB0aGUgd2hvbGUgZmlsZSB3aGVuIGxlbmd0aCBpcyBhY2Nlc3NlZCIpfXRoaXMuX2xlbmd0aD1kYXRhbGVuZ3RoO3RoaXMuX2NodW5rU2l6ZT1jaHVua1NpemU7dGhpcy5sZW5ndGhLbm93bj10cnVlfTtpZih0eXBlb2YgWE1MSHR0cFJlcXVlc3QhPSJ1bmRlZmluZWQiKXtpZighRU5WSVJPTk1FTlRfSVNfV09SS0VSKXRocm93IkNhbm5vdCBkbyBzeW5jaHJvbm91cyBiaW5hcnkgWEhScyBvdXRzaWRlIHdlYndvcmtlcnMgaW4gbW9kZXJuIGJyb3dzZXJzLiBVc2UgLS1lbWJlZC1maWxlIG9yIC0tcHJlbG9hZC1maWxlIGluIGVtY2MiO3ZhciBsYXp5QXJyYXk9bmV3IExhenlVaW50OEFycmF5O09iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGxhenlBcnJheSx7bGVuZ3RoOntnZXQ6ZnVuY3Rpb24oKXtpZighdGhpcy5sZW5ndGhLbm93bil7dGhpcy5jYWNoZUxlbmd0aCgpfXJldHVybiB0aGlzLl9sZW5ndGh9fSxjaHVua1NpemU6e2dldDpmdW5jdGlvbigpe2lmKCF0aGlzLmxlbmd0aEtub3duKXt0aGlzLmNhY2hlTGVuZ3RoKCl9cmV0dXJuIHRoaXMuX2NodW5rU2l6ZX19fSk7dmFyIHByb3BlcnRpZXM9e2lzRGV2aWNlOmZhbHNlLGNvbnRlbnRzOmxhenlBcnJheX19ZWxzZXt2YXIgcHJvcGVydGllcz17aXNEZXZpY2U6ZmFsc2UsdXJsOnVybH19dmFyIG5vZGU9RlMuY3JlYXRlRmlsZShwYXJlbnQsbmFtZSxwcm9wZXJ0aWVzLGNhblJlYWQsY2FuV3JpdGUpO2lmKHByb3BlcnRpZXMuY29udGVudHMpe25vZGUuY29udGVudHM9cHJvcGVydGllcy5jb250ZW50c31lbHNlIGlmKHByb3BlcnRpZXMudXJsKXtub2RlLmNvbnRlbnRzPW51bGw7bm9kZS51cmw9cHJvcGVydGllcy51cmx9T2JqZWN0LmRlZmluZVByb3BlcnRpZXMobm9kZSx7dXNlZEJ5dGVzOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jb250ZW50cy5sZW5ndGh9fX0pO3ZhciBzdHJlYW1fb3BzPXt9O3ZhciBrZXlzPU9iamVjdC5rZXlzKG5vZGUuc3RyZWFtX29wcyk7a2V5cy5mb3JFYWNoKGtleT0+e3ZhciBmbj1ub2RlLnN0cmVhbV9vcHNba2V5XTtzdHJlYW1fb3BzW2tleV09ZnVuY3Rpb24gZm9yY2VMb2FkTGF6eUZpbGUoKXtGUy5mb3JjZUxvYWRGaWxlKG5vZGUpO3JldHVybiBmbi5hcHBseShudWxsLGFyZ3VtZW50cyl9fSk7c3RyZWFtX29wcy5yZWFkPSgoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uKT0+e0ZTLmZvcmNlTG9hZEZpbGUobm9kZSk7dmFyIGNvbnRlbnRzPXN0cmVhbS5ub2RlLmNvbnRlbnRzO2lmKHBvc2l0aW9uPj1jb250ZW50cy5sZW5ndGgpcmV0dXJuIDA7dmFyIHNpemU9TWF0aC5taW4oY29udGVudHMubGVuZ3RoLXBvc2l0aW9uLGxlbmd0aCk7aWYoY29udGVudHMuc2xpY2Upe2Zvcih2YXIgaT0wO2k8c2l6ZTtpKyspe2J1ZmZlcltvZmZzZXQraV09Y29udGVudHNbcG9zaXRpb24raV19fWVsc2V7Zm9yKHZhciBpPTA7aTxzaXplO2krKyl7YnVmZmVyW29mZnNldCtpXT1jb250ZW50cy5nZXQocG9zaXRpb24raSl9fXJldHVybiBzaXplfSk7bm9kZS5zdHJlYW1fb3BzPXN0cmVhbV9vcHM7cmV0dXJuIG5vZGV9LGNyZWF0ZVByZWxvYWRlZEZpbGU6KHBhcmVudCxuYW1lLHVybCxjYW5SZWFkLGNhbldyaXRlLG9ubG9hZCxvbmVycm9yLGRvbnRDcmVhdGVGaWxlLGNhbk93bixwcmVGaW5pc2gpPT57dmFyIGZ1bGxuYW1lPW5hbWU/UEFUSF9GUy5yZXNvbHZlKFBBVEguam9pbjIocGFyZW50LG5hbWUpKTpwYXJlbnQ7dmFyIGRlcD1nZXRVbmlxdWVSdW5EZXBlbmRlbmN5KCJjcCAiK2Z1bGxuYW1lKTtmdW5jdGlvbiBwcm9jZXNzRGF0YShieXRlQXJyYXkpe2Z1bmN0aW9uIGZpbmlzaChieXRlQXJyYXkpe2lmKHByZUZpbmlzaClwcmVGaW5pc2goKTtpZighZG9udENyZWF0ZUZpbGUpe0ZTLmNyZWF0ZURhdGFGaWxlKHBhcmVudCxuYW1lLGJ5dGVBcnJheSxjYW5SZWFkLGNhbldyaXRlLGNhbk93bil9aWYob25sb2FkKW9ubG9hZCgpO3JlbW92ZVJ1bkRlcGVuZGVuY3koZGVwKX1pZihCcm93c2VyLmhhbmRsZWRCeVByZWxvYWRQbHVnaW4oYnl0ZUFycmF5LGZ1bGxuYW1lLGZpbmlzaCwoKT0+e2lmKG9uZXJyb3Ipb25lcnJvcigpO3JlbW92ZVJ1bkRlcGVuZGVuY3koZGVwKX0pKXtyZXR1cm59ZmluaXNoKGJ5dGVBcnJheSl9YWRkUnVuRGVwZW5kZW5jeShkZXApO2lmKHR5cGVvZiB1cmw9PSJzdHJpbmciKXthc3luY0xvYWQodXJsLGJ5dGVBcnJheT0+cHJvY2Vzc0RhdGEoYnl0ZUFycmF5KSxvbmVycm9yKX1lbHNle3Byb2Nlc3NEYXRhKHVybCl9fSxpbmRleGVkREI6KCk9PntyZXR1cm4gd2luZG93LmluZGV4ZWREQnx8d2luZG93Lm1vekluZGV4ZWREQnx8d2luZG93LndlYmtpdEluZGV4ZWREQnx8d2luZG93Lm1zSW5kZXhlZERCfSxEQl9OQU1FOigpPT57cmV0dXJuIkVNX0ZTXyIrd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lfSxEQl9WRVJTSU9OOjIwLERCX1NUT1JFX05BTUU6IkZJTEVfREFUQSIsc2F2ZUZpbGVzVG9EQjoocGF0aHMsb25sb2FkLG9uZXJyb3IpPT57b25sb2FkPW9ubG9hZHx8KCgpPT57fSk7b25lcnJvcj1vbmVycm9yfHwoKCk9Pnt9KTt2YXIgaW5kZXhlZERCPUZTLmluZGV4ZWREQigpO3RyeXt2YXIgb3BlblJlcXVlc3Q9aW5kZXhlZERCLm9wZW4oRlMuREJfTkFNRSgpLEZTLkRCX1ZFUlNJT04pfWNhdGNoKGUpe3JldHVybiBvbmVycm9yKGUpfW9wZW5SZXF1ZXN0Lm9udXBncmFkZW5lZWRlZD0oKCk9PntvdXQoImNyZWF0aW5nIGRiIik7dmFyIGRiPW9wZW5SZXF1ZXN0LnJlc3VsdDtkYi5jcmVhdGVPYmplY3RTdG9yZShGUy5EQl9TVE9SRV9OQU1FKX0pO29wZW5SZXF1ZXN0Lm9uc3VjY2Vzcz0oKCk9Pnt2YXIgZGI9b3BlblJlcXVlc3QucmVzdWx0O3ZhciB0cmFuc2FjdGlvbj1kYi50cmFuc2FjdGlvbihbRlMuREJfU1RPUkVfTkFNRV0sInJlYWR3cml0ZSIpO3ZhciBmaWxlcz10cmFuc2FjdGlvbi5vYmplY3RTdG9yZShGUy5EQl9TVE9SRV9OQU1FKTt2YXIgb2s9MCxmYWlsPTAsdG90YWw9cGF0aHMubGVuZ3RoO2Z1bmN0aW9uIGZpbmlzaCgpe2lmKGZhaWw9PTApb25sb2FkKCk7ZWxzZSBvbmVycm9yKCl9cGF0aHMuZm9yRWFjaChwYXRoPT57dmFyIHB1dFJlcXVlc3Q9ZmlsZXMucHV0KEZTLmFuYWx5emVQYXRoKHBhdGgpLm9iamVjdC5jb250ZW50cyxwYXRoKTtwdXRSZXF1ZXN0Lm9uc3VjY2Vzcz0oKCk9PntvaysrO2lmKG9rK2ZhaWw9PXRvdGFsKWZpbmlzaCgpfSk7cHV0UmVxdWVzdC5vbmVycm9yPSgoKT0+e2ZhaWwrKztpZihvaytmYWlsPT10b3RhbClmaW5pc2goKX0pfSk7dHJhbnNhY3Rpb24ub25lcnJvcj1vbmVycm9yfSk7b3BlblJlcXVlc3Qub25lcnJvcj1vbmVycm9yfSxsb2FkRmlsZXNGcm9tREI6KHBhdGhzLG9ubG9hZCxvbmVycm9yKT0+e29ubG9hZD1vbmxvYWR8fCgoKT0+e30pO29uZXJyb3I9b25lcnJvcnx8KCgpPT57fSk7dmFyIGluZGV4ZWREQj1GUy5pbmRleGVkREIoKTt0cnl7dmFyIG9wZW5SZXF1ZXN0PWluZGV4ZWREQi5vcGVuKEZTLkRCX05BTUUoKSxGUy5EQl9WRVJTSU9OKX1jYXRjaChlKXtyZXR1cm4gb25lcnJvcihlKX1vcGVuUmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQ9b25lcnJvcjtvcGVuUmVxdWVzdC5vbnN1Y2Nlc3M9KCgpPT57dmFyIGRiPW9wZW5SZXF1ZXN0LnJlc3VsdDt0cnl7dmFyIHRyYW5zYWN0aW9uPWRiLnRyYW5zYWN0aW9uKFtGUy5EQl9TVE9SRV9OQU1FXSwicmVhZG9ubHkiKX1jYXRjaChlKXtvbmVycm9yKGUpO3JldHVybn12YXIgZmlsZXM9dHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoRlMuREJfU1RPUkVfTkFNRSk7dmFyIG9rPTAsZmFpbD0wLHRvdGFsPXBhdGhzLmxlbmd0aDtmdW5jdGlvbiBmaW5pc2goKXtpZihmYWlsPT0wKW9ubG9hZCgpO2Vsc2Ugb25lcnJvcigpfXBhdGhzLmZvckVhY2gocGF0aD0+e3ZhciBnZXRSZXF1ZXN0PWZpbGVzLmdldChwYXRoKTtnZXRSZXF1ZXN0Lm9uc3VjY2Vzcz0oKCk9PntpZihGUy5hbmFseXplUGF0aChwYXRoKS5leGlzdHMpe0ZTLnVubGluayhwYXRoKX1GUy5jcmVhdGVEYXRhRmlsZShQQVRILmRpcm5hbWUocGF0aCksUEFUSC5iYXNlbmFtZShwYXRoKSxnZXRSZXF1ZXN0LnJlc3VsdCx0cnVlLHRydWUsdHJ1ZSk7b2srKztpZihvaytmYWlsPT10b3RhbClmaW5pc2goKX0pO2dldFJlcXVlc3Qub25lcnJvcj0oKCk9PntmYWlsKys7aWYob2srZmFpbD09dG90YWwpZmluaXNoKCl9KX0pO3RyYW5zYWN0aW9uLm9uZXJyb3I9b25lcnJvcn0pO29wZW5SZXF1ZXN0Lm9uZXJyb3I9b25lcnJvcn19O3ZhciBTWVNDQUxMUz17REVGQVVMVF9QT0xMTUFTSzo1LGNhbGN1bGF0ZUF0OmZ1bmN0aW9uKGRpcmZkLHBhdGgsYWxsb3dFbXB0eSl7aWYoUEFUSC5pc0FicyhwYXRoKSl7cmV0dXJuIHBhdGh9dmFyIGRpcjtpZihkaXJmZD09PS0xMDApe2Rpcj1GUy5jd2QoKX1lbHNle3ZhciBkaXJzdHJlYW09RlMuZ2V0U3RyZWFtKGRpcmZkKTtpZighZGlyc3RyZWFtKXRocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpO2Rpcj1kaXJzdHJlYW0ucGF0aH1pZihwYXRoLmxlbmd0aD09MCl7aWYoIWFsbG93RW1wdHkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1yZXR1cm4gZGlyfXJldHVybiBQQVRILmpvaW4yKGRpcixwYXRoKX0sZG9TdGF0OmZ1bmN0aW9uKGZ1bmMscGF0aCxidWYpe3RyeXt2YXIgc3RhdD1mdW5jKHBhdGgpfWNhdGNoKGUpe2lmKGUmJmUubm9kZSYmUEFUSC5ub3JtYWxpemUocGF0aCkhPT1QQVRILm5vcm1hbGl6ZShGUy5nZXRQYXRoKGUubm9kZSkpKXtyZXR1cm4tNTR9dGhyb3cgZX1IRUFQMzJbYnVmPj4yXT1zdGF0LmRldjtIRUFQMzJbYnVmKzQ+PjJdPTA7SEVBUDMyW2J1Zis4Pj4yXT1zdGF0LmlubztIRUFQMzJbYnVmKzEyPj4yXT1zdGF0Lm1vZGU7SEVBUDMyW2J1ZisxNj4+Ml09c3RhdC5ubGluaztIRUFQMzJbYnVmKzIwPj4yXT1zdGF0LnVpZDtIRUFQMzJbYnVmKzI0Pj4yXT1zdGF0LmdpZDtIRUFQMzJbYnVmKzI4Pj4yXT1zdGF0LnJkZXY7SEVBUDMyW2J1ZiszMj4+Ml09MDt0ZW1wSTY0PVtzdGF0LnNpemU+Pj4wLCh0ZW1wRG91YmxlPXN0YXQuc2l6ZSwrTWF0aC5hYnModGVtcERvdWJsZSk+PTE/dGVtcERvdWJsZT4wPyhNYXRoLm1pbigrTWF0aC5mbG9vcih0ZW1wRG91YmxlLzQyOTQ5NjcyOTYpLDQyOTQ5NjcyOTUpfDApPj4+MDp+fitNYXRoLmNlaWwoKHRlbXBEb3VibGUtKyh+fnRlbXBEb3VibGU+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApXSxIRUFQMzJbYnVmKzQwPj4yXT10ZW1wSTY0WzBdLEhFQVAzMltidWYrNDQ+PjJdPXRlbXBJNjRbMV07SEVBUDMyW2J1Zis0OD4+Ml09NDA5NjtIRUFQMzJbYnVmKzUyPj4yXT1zdGF0LmJsb2NrcztIRUFQMzJbYnVmKzU2Pj4yXT1zdGF0LmF0aW1lLmdldFRpbWUoKS8xZTN8MDtIRUFQMzJbYnVmKzYwPj4yXT0wO0hFQVAzMltidWYrNjQ+PjJdPXN0YXQubXRpbWUuZ2V0VGltZSgpLzFlM3wwO0hFQVAzMltidWYrNjg+PjJdPTA7SEVBUDMyW2J1Zis3Mj4+Ml09c3RhdC5jdGltZS5nZXRUaW1lKCkvMWUzfDA7SEVBUDMyW2J1Zis3Nj4+Ml09MDt0ZW1wSTY0PVtzdGF0Lmlubz4+PjAsKHRlbXBEb3VibGU9c3RhdC5pbm8sK01hdGguYWJzKHRlbXBEb3VibGUpPj0xP3RlbXBEb3VibGU+MD8oTWF0aC5taW4oK01hdGguZmxvb3IodGVtcERvdWJsZS80Mjk0OTY3Mjk2KSw0Mjk0OTY3Mjk1KXwwKT4+PjA6fn4rTWF0aC5jZWlsKCh0ZW1wRG91YmxlLSsofn50ZW1wRG91YmxlPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKV0sSEVBUDMyW2J1Zis4MD4+Ml09dGVtcEk2NFswXSxIRUFQMzJbYnVmKzg0Pj4yXT10ZW1wSTY0WzFdO3JldHVybiAwfSxkb01zeW5jOmZ1bmN0aW9uKGFkZHIsc3RyZWFtLGxlbixmbGFncyxvZmZzZXQpe3ZhciBidWZmZXI9SEVBUFU4LnNsaWNlKGFkZHIsYWRkcitsZW4pO0ZTLm1zeW5jKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbixmbGFncyl9LHZhcmFyZ3M6dW5kZWZpbmVkLGdldDpmdW5jdGlvbigpe1NZU0NBTExTLnZhcmFyZ3MrPTQ7dmFyIHJldD1IRUFQMzJbU1lTQ0FMTFMudmFyYXJncy00Pj4yXTtyZXR1cm4gcmV0fSxnZXRTdHI6ZnVuY3Rpb24ocHRyKXt2YXIgcmV0PVVURjhUb1N0cmluZyhwdHIpO3JldHVybiByZXR9LGdldFN0cmVhbUZyb21GRDpmdW5jdGlvbihmZCl7dmFyIHN0cmVhbT1GUy5nZXRTdHJlYW0oZmQpO2lmKCFzdHJlYW0pdGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCk7cmV0dXJuIHN0cmVhbX19O2Z1bmN0aW9uIF9fX3N5c2NhbGxfZnN0YXQ2NChmZCxidWYpe3RyeXt2YXIgc3RyZWFtPVNZU0NBTExTLmdldFN0cmVhbUZyb21GRChmZCk7cmV0dXJuIFNZU0NBTExTLmRvU3RhdChGUy5zdGF0LHN0cmVhbS5wYXRoLGJ1Zil9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9mdHJ1bmNhdGU2NChmZCxsZW5ndGhfbG93LGxlbmd0aF9oaWdoKXt0cnl7dmFyIGxlbmd0aD1sZW5ndGhfaGlnaCo0Mjk0OTY3Mjk2KyhsZW5ndGhfbG93Pj4+MCk7RlMuZnRydW5jYXRlKGZkLGxlbmd0aCk7cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9sc3RhdDY0KHBhdGgsYnVmKXt0cnl7cGF0aD1TWVNDQUxMUy5nZXRTdHIocGF0aCk7cmV0dXJuIFNZU0NBTExTLmRvU3RhdChGUy5sc3RhdCxwYXRoLGJ1Zil9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9uZXdmc3RhdGF0KGRpcmZkLHBhdGgsYnVmLGZsYWdzKXt0cnl7cGF0aD1TWVNDQUxMUy5nZXRTdHIocGF0aCk7dmFyIG5vZm9sbG93PWZsYWdzJjI1Njt2YXIgYWxsb3dFbXB0eT1mbGFncyY0MDk2O2ZsYWdzPWZsYWdzJn40MzUyO3BhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQoZGlyZmQscGF0aCxhbGxvd0VtcHR5KTtyZXR1cm4gU1lTQ0FMTFMuZG9TdGF0KG5vZm9sbG93P0ZTLmxzdGF0OkZTLnN0YXQscGF0aCxidWYpfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfb3BlbmF0KGRpcmZkLHBhdGgsZmxhZ3MsdmFyYXJncyl7U1lTQ0FMTFMudmFyYXJncz12YXJhcmdzO3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KGRpcmZkLHBhdGgpO3ZhciBtb2RlPXZhcmFyZ3M/U1lTQ0FMTFMuZ2V0KCk6MDtyZXR1cm4gRlMub3BlbihwYXRoLGZsYWdzLG1vZGUpLmZkfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfcmVuYW1lYXQob2xkZGlyZmQsb2xkcGF0aCxuZXdkaXJmZCxuZXdwYXRoKXt0cnl7b2xkcGF0aD1TWVNDQUxMUy5nZXRTdHIob2xkcGF0aCk7bmV3cGF0aD1TWVNDQUxMUy5nZXRTdHIobmV3cGF0aCk7b2xkcGF0aD1TWVNDQUxMUy5jYWxjdWxhdGVBdChvbGRkaXJmZCxvbGRwYXRoKTtuZXdwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KG5ld2RpcmZkLG5ld3BhdGgpO0ZTLnJlbmFtZShvbGRwYXRoLG5ld3BhdGgpO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfc3RhdDY0KHBhdGgsYnVmKXt0cnl7cGF0aD1TWVNDQUxMUy5nZXRTdHIocGF0aCk7cmV0dXJuIFNZU0NBTExTLmRvU3RhdChGUy5zdGF0LHBhdGgsYnVmKX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX3VubGlua2F0KGRpcmZkLHBhdGgsZmxhZ3Mpe3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KGRpcmZkLHBhdGgpO2lmKGZsYWdzPT09MCl7RlMudW5saW5rKHBhdGgpfWVsc2UgaWYoZmxhZ3M9PT01MTIpe0ZTLnJtZGlyKHBhdGgpfWVsc2V7YWJvcnQoIkludmFsaWQgZmxhZ3MgcGFzc2VkIHRvIHVubGlua2F0Iil9cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19kbGluaXQobWFpbl9kc29faGFuZGxlKXt9dmFyIGRsb3Blbk1pc3NpbmdFcnJvcj0iVG8gdXNlIGRsb3BlbiwgeW91IG5lZWQgZW5hYmxlIGR5bmFtaWMgbGlua2luZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9lbXNjcmlwdGVuLWNvcmUvZW1zY3JpcHRlbi93aWtpL0xpbmtpbmciO2Z1bmN0aW9uIF9fZGxvcGVuX2pzKGZpbGVuYW1lLGZsYWcpe2Fib3J0KGRsb3Blbk1pc3NpbmdFcnJvcil9ZnVuY3Rpb24gX19kbHN5bV9qcyhoYW5kbGUsc3ltYm9sKXthYm9ydChkbG9wZW5NaXNzaW5nRXJyb3IpfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2JpZ2ludChwcmltaXRpdmVUeXBlLG5hbWUsc2l6ZSxtaW5SYW5nZSxtYXhSYW5nZSl7fWZ1bmN0aW9uIGdldFNoaWZ0RnJvbVNpemUoc2l6ZSl7c3dpdGNoKHNpemUpe2Nhc2UgMTpyZXR1cm4gMDtjYXNlIDI6cmV0dXJuIDE7Y2FzZSA0OnJldHVybiAyO2Nhc2UgODpyZXR1cm4gMztkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoIlVua25vd24gdHlwZSBzaXplOiAiK3NpemUpfX1mdW5jdGlvbiBlbWJpbmRfaW5pdF9jaGFyQ29kZXMoKXt2YXIgY29kZXM9bmV3IEFycmF5KDI1Nik7Zm9yKHZhciBpPTA7aTwyNTY7KytpKXtjb2Rlc1tpXT1TdHJpbmcuZnJvbUNoYXJDb2RlKGkpfWVtYmluZF9jaGFyQ29kZXM9Y29kZXN9dmFyIGVtYmluZF9jaGFyQ29kZXM9dW5kZWZpbmVkO2Z1bmN0aW9uIHJlYWRMYXRpbjFTdHJpbmcocHRyKXt2YXIgcmV0PSIiO3ZhciBjPXB0cjt3aGlsZShIRUFQVThbY10pe3JldCs9ZW1iaW5kX2NoYXJDb2Rlc1tIRUFQVThbYysrXV19cmV0dXJuIHJldH12YXIgYXdhaXRpbmdEZXBlbmRlbmNpZXM9e307dmFyIHJlZ2lzdGVyZWRUeXBlcz17fTt2YXIgdHlwZURlcGVuZGVuY2llcz17fTt2YXIgY2hhcl8wPTQ4O3ZhciBjaGFyXzk9NTc7ZnVuY3Rpb24gbWFrZUxlZ2FsRnVuY3Rpb25OYW1lKG5hbWUpe2lmKHVuZGVmaW5lZD09PW5hbWUpe3JldHVybiJfdW5rbm93biJ9bmFtZT1uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05X10vZywiJCIpO3ZhciBmPW5hbWUuY2hhckNvZGVBdCgwKTtpZihmPj1jaGFyXzAmJmY8PWNoYXJfOSl7cmV0dXJuIl8iK25hbWV9cmV0dXJuIG5hbWV9ZnVuY3Rpb24gY3JlYXRlTmFtZWRGdW5jdGlvbihuYW1lLGJvZHkpe25hbWU9bWFrZUxlZ2FsRnVuY3Rpb25OYW1lKG5hbWUpO3JldHVybiBuZXcgRnVuY3Rpb24oImJvZHkiLCJyZXR1cm4gZnVuY3Rpb24gIituYW1lKyIoKSB7XG4iKycgICAgInVzZSBzdHJpY3QiOycrIiAgICByZXR1cm4gYm9keS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuIisifTtcbiIpKGJvZHkpfWZ1bmN0aW9uIGV4dGVuZEVycm9yKGJhc2VFcnJvclR5cGUsZXJyb3JOYW1lKXt2YXIgZXJyb3JDbGFzcz1jcmVhdGVOYW1lZEZ1bmN0aW9uKGVycm9yTmFtZSxmdW5jdGlvbihtZXNzYWdlKXt0aGlzLm5hbWU9ZXJyb3JOYW1lO3RoaXMubWVzc2FnZT1tZXNzYWdlO3ZhciBzdGFjaz1uZXcgRXJyb3IobWVzc2FnZSkuc3RhY2s7aWYoc3RhY2shPT11bmRlZmluZWQpe3RoaXMuc3RhY2s9dGhpcy50b1N0cmluZygpKyJcbiIrc3RhY2sucmVwbGFjZSgvXkVycm9yKDpbXlxuXSopP1xuLywiIil9fSk7ZXJyb3JDbGFzcy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiYXNlRXJyb3JUeXBlLnByb3RvdHlwZSk7ZXJyb3JDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3I9ZXJyb3JDbGFzcztlcnJvckNsYXNzLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe2lmKHRoaXMubWVzc2FnZT09PXVuZGVmaW5lZCl7cmV0dXJuIHRoaXMubmFtZX1lbHNle3JldHVybiB0aGlzLm5hbWUrIjogIit0aGlzLm1lc3NhZ2V9fTtyZXR1cm4gZXJyb3JDbGFzc312YXIgQmluZGluZ0Vycm9yPXVuZGVmaW5lZDtmdW5jdGlvbiB0aHJvd0JpbmRpbmdFcnJvcihtZXNzYWdlKXt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKG1lc3NhZ2UpfXZhciBJbnRlcm5hbEVycm9yPXVuZGVmaW5lZDtmdW5jdGlvbiB0aHJvd0ludGVybmFsRXJyb3IobWVzc2FnZSl7dGhyb3cgbmV3IEludGVybmFsRXJyb3IobWVzc2FnZSl9ZnVuY3Rpb24gd2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQobXlUeXBlcyxkZXBlbmRlbnRUeXBlcyxnZXRUeXBlQ29udmVydGVycyl7bXlUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpe3R5cGVEZXBlbmRlbmNpZXNbdHlwZV09ZGVwZW5kZW50VHlwZXN9KTtmdW5jdGlvbiBvbkNvbXBsZXRlKHR5cGVDb252ZXJ0ZXJzKXt2YXIgbXlUeXBlQ29udmVydGVycz1nZXRUeXBlQ29udmVydGVycyh0eXBlQ29udmVydGVycyk7aWYobXlUeXBlQ29udmVydGVycy5sZW5ndGghPT1teVR5cGVzLmxlbmd0aCl7dGhyb3dJbnRlcm5hbEVycm9yKCJNaXNtYXRjaGVkIHR5cGUgY29udmVydGVyIGNvdW50Iil9Zm9yKHZhciBpPTA7aTxteVR5cGVzLmxlbmd0aDsrK2kpe3JlZ2lzdGVyVHlwZShteVR5cGVzW2ldLG15VHlwZUNvbnZlcnRlcnNbaV0pfX12YXIgdHlwZUNvbnZlcnRlcnM9bmV3IEFycmF5KGRlcGVuZGVudFR5cGVzLmxlbmd0aCk7dmFyIHVucmVnaXN0ZXJlZFR5cGVzPVtdO3ZhciByZWdpc3RlcmVkPTA7ZGVwZW5kZW50VHlwZXMuZm9yRWFjaCgoZHQsaSk9PntpZihyZWdpc3RlcmVkVHlwZXMuaGFzT3duUHJvcGVydHkoZHQpKXt0eXBlQ29udmVydGVyc1tpXT1yZWdpc3RlcmVkVHlwZXNbZHRdfWVsc2V7dW5yZWdpc3RlcmVkVHlwZXMucHVzaChkdCk7aWYoIWF3YWl0aW5nRGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KGR0KSl7YXdhaXRpbmdEZXBlbmRlbmNpZXNbZHRdPVtdfWF3YWl0aW5nRGVwZW5kZW5jaWVzW2R0XS5wdXNoKCgpPT57dHlwZUNvbnZlcnRlcnNbaV09cmVnaXN0ZXJlZFR5cGVzW2R0XTsrK3JlZ2lzdGVyZWQ7aWYocmVnaXN0ZXJlZD09PXVucmVnaXN0ZXJlZFR5cGVzLmxlbmd0aCl7b25Db21wbGV0ZSh0eXBlQ29udmVydGVycyl9fSl9fSk7aWYoMD09PXVucmVnaXN0ZXJlZFR5cGVzLmxlbmd0aCl7b25Db21wbGV0ZSh0eXBlQ29udmVydGVycyl9fWZ1bmN0aW9uIHJlZ2lzdGVyVHlwZShyYXdUeXBlLHJlZ2lzdGVyZWRJbnN0YW5jZSxvcHRpb25zPXt9KXtpZighKCJhcmdQYWNrQWR2YW5jZSJpbiByZWdpc3RlcmVkSW5zdGFuY2UpKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJyZWdpc3RlclR5cGUgcmVnaXN0ZXJlZEluc3RhbmNlIHJlcXVpcmVzIGFyZ1BhY2tBZHZhbmNlIil9dmFyIG5hbWU9cmVnaXN0ZXJlZEluc3RhbmNlLm5hbWU7aWYoIXJhd1R5cGUpe3Rocm93QmluZGluZ0Vycm9yKCd0eXBlICInK25hbWUrJyIgbXVzdCBoYXZlIGEgcG9zaXRpdmUgaW50ZWdlciB0eXBlaWQgcG9pbnRlcicpfWlmKHJlZ2lzdGVyZWRUeXBlcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7aWYob3B0aW9ucy5pZ25vcmVEdXBsaWNhdGVSZWdpc3RyYXRpb25zKXtyZXR1cm59ZWxzZXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHJlZ2lzdGVyIHR5cGUgJyIrbmFtZSsiJyB0d2ljZSIpfX1yZWdpc3RlcmVkVHlwZXNbcmF3VHlwZV09cmVnaXN0ZXJlZEluc3RhbmNlO2RlbGV0ZSB0eXBlRGVwZW5kZW5jaWVzW3Jhd1R5cGVdO2lmKGF3YWl0aW5nRGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KHJhd1R5cGUpKXt2YXIgY2FsbGJhY2tzPWF3YWl0aW5nRGVwZW5kZW5jaWVzW3Jhd1R5cGVdO2RlbGV0ZSBhd2FpdGluZ0RlcGVuZGVuY2llc1tyYXdUeXBlXTtjYWxsYmFja3MuZm9yRWFjaChjYj0+Y2IoKSl9fWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2wocmF3VHlwZSxuYW1lLHNpemUsdHJ1ZVZhbHVlLGZhbHNlVmFsdWUpe3ZhciBzaGlmdD1nZXRTaGlmdEZyb21TaXplKHNpemUpO25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKHd0KXtyZXR1cm4hIXd0fSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsbyl7cmV0dXJuIG8/dHJ1ZVZhbHVlOmZhbHNlVmFsdWV9LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmZ1bmN0aW9uKHBvaW50ZXIpe3ZhciBoZWFwO2lmKHNpemU9PT0xKXtoZWFwPUhFQVA4fWVsc2UgaWYoc2l6ZT09PTIpe2hlYXA9SEVBUDE2fWVsc2UgaWYoc2l6ZT09PTQpe2hlYXA9SEVBUDMyfWVsc2V7dGhyb3cgbmV3IFR5cGVFcnJvcigiVW5rbm93biBib29sZWFuIHR5cGUgc2l6ZTogIituYW1lKX1yZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oaGVhcFtwb2ludGVyPj5zaGlmdF0pfSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pfWZ1bmN0aW9uIENsYXNzSGFuZGxlX2lzQWxpYXNPZihvdGhlcil7aWYoISh0aGlzIGluc3RhbmNlb2YgQ2xhc3NIYW5kbGUpKXtyZXR1cm4gZmFsc2V9aWYoIShvdGhlciBpbnN0YW5jZW9mIENsYXNzSGFuZGxlKSl7cmV0dXJuIGZhbHNlfXZhciBsZWZ0Q2xhc3M9dGhpcy4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgbGVmdD10aGlzLiQkLnB0cjt2YXIgcmlnaHRDbGFzcz1vdGhlci4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgcmlnaHQ9b3RoZXIuJCQucHRyO3doaWxlKGxlZnRDbGFzcy5iYXNlQ2xhc3Mpe2xlZnQ9bGVmdENsYXNzLnVwY2FzdChsZWZ0KTtsZWZ0Q2xhc3M9bGVmdENsYXNzLmJhc2VDbGFzc313aGlsZShyaWdodENsYXNzLmJhc2VDbGFzcyl7cmlnaHQ9cmlnaHRDbGFzcy51cGNhc3QocmlnaHQpO3JpZ2h0Q2xhc3M9cmlnaHRDbGFzcy5iYXNlQ2xhc3N9cmV0dXJuIGxlZnRDbGFzcz09PXJpZ2h0Q2xhc3MmJmxlZnQ9PT1yaWdodH1mdW5jdGlvbiBzaGFsbG93Q29weUludGVybmFsUG9pbnRlcihvKXtyZXR1cm57Y291bnQ6by5jb3VudCxkZWxldGVTY2hlZHVsZWQ6by5kZWxldGVTY2hlZHVsZWQscHJlc2VydmVQb2ludGVyT25EZWxldGU6by5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSxwdHI6by5wdHIscHRyVHlwZTpvLnB0clR5cGUsc21hcnRQdHI6by5zbWFydFB0cixzbWFydFB0clR5cGU6by5zbWFydFB0clR5cGV9fWZ1bmN0aW9uIHRocm93SW5zdGFuY2VBbHJlYWR5RGVsZXRlZChvYmope2Z1bmN0aW9uIGdldEluc3RhbmNlVHlwZU5hbWUoaGFuZGxlKXtyZXR1cm4gaGFuZGxlLiQkLnB0clR5cGUucmVnaXN0ZXJlZENsYXNzLm5hbWV9dGhyb3dCaW5kaW5nRXJyb3IoZ2V0SW5zdGFuY2VUeXBlTmFtZShvYmopKyIgaW5zdGFuY2UgYWxyZWFkeSBkZWxldGVkIil9dmFyIGZpbmFsaXphdGlvblJlZ2lzdHJ5PWZhbHNlO2Z1bmN0aW9uIGRldGFjaEZpbmFsaXplcihoYW5kbGUpe31mdW5jdGlvbiBydW5EZXN0cnVjdG9yKCQkKXtpZigkJC5zbWFydFB0cil7JCQuc21hcnRQdHJUeXBlLnJhd0Rlc3RydWN0b3IoJCQuc21hcnRQdHIpfWVsc2V7JCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3MucmF3RGVzdHJ1Y3RvcigkJC5wdHIpfX1mdW5jdGlvbiByZWxlYXNlQ2xhc3NIYW5kbGUoJCQpeyQkLmNvdW50LnZhbHVlLT0xO3ZhciB0b0RlbGV0ZT0wPT09JCQuY291bnQudmFsdWU7aWYodG9EZWxldGUpe3J1bkRlc3RydWN0b3IoJCQpfX1mdW5jdGlvbiBkb3duY2FzdFBvaW50ZXIocHRyLHB0ckNsYXNzLGRlc2lyZWRDbGFzcyl7aWYocHRyQ2xhc3M9PT1kZXNpcmVkQ2xhc3Mpe3JldHVybiBwdHJ9aWYodW5kZWZpbmVkPT09ZGVzaXJlZENsYXNzLmJhc2VDbGFzcyl7cmV0dXJuIG51bGx9dmFyIHJ2PWRvd25jYXN0UG9pbnRlcihwdHIscHRyQ2xhc3MsZGVzaXJlZENsYXNzLmJhc2VDbGFzcyk7aWYocnY9PT1udWxsKXtyZXR1cm4gbnVsbH1yZXR1cm4gZGVzaXJlZENsYXNzLmRvd25jYXN0KHJ2KX12YXIgcmVnaXN0ZXJlZFBvaW50ZXJzPXt9O2Z1bmN0aW9uIGdldEluaGVyaXRlZEluc3RhbmNlQ291bnQoKXtyZXR1cm4gT2JqZWN0LmtleXMocmVnaXN0ZXJlZEluc3RhbmNlcykubGVuZ3RofWZ1bmN0aW9uIGdldExpdmVJbmhlcml0ZWRJbnN0YW5jZXMoKXt2YXIgcnY9W107Zm9yKHZhciBrIGluIHJlZ2lzdGVyZWRJbnN0YW5jZXMpe2lmKHJlZ2lzdGVyZWRJbnN0YW5jZXMuaGFzT3duUHJvcGVydHkoaykpe3J2LnB1c2gocmVnaXN0ZXJlZEluc3RhbmNlc1trXSl9fXJldHVybiBydn12YXIgZGVsZXRpb25RdWV1ZT1bXTtmdW5jdGlvbiBmbHVzaFBlbmRpbmdEZWxldGVzKCl7d2hpbGUoZGVsZXRpb25RdWV1ZS5sZW5ndGgpe3ZhciBvYmo9ZGVsZXRpb25RdWV1ZS5wb3AoKTtvYmouJCQuZGVsZXRlU2NoZWR1bGVkPWZhbHNlO29ialsiZGVsZXRlIl0oKX19dmFyIGRlbGF5RnVuY3Rpb249dW5kZWZpbmVkO2Z1bmN0aW9uIHNldERlbGF5RnVuY3Rpb24oZm4pe2RlbGF5RnVuY3Rpb249Zm47aWYoZGVsZXRpb25RdWV1ZS5sZW5ndGgmJmRlbGF5RnVuY3Rpb24pe2RlbGF5RnVuY3Rpb24oZmx1c2hQZW5kaW5nRGVsZXRlcyl9fWZ1bmN0aW9uIGluaXRfZW1iaW5kKCl7TW9kdWxlWyJnZXRJbmhlcml0ZWRJbnN0YW5jZUNvdW50Il09Z2V0SW5oZXJpdGVkSW5zdGFuY2VDb3VudDtNb2R1bGVbImdldExpdmVJbmhlcml0ZWRJbnN0YW5jZXMiXT1nZXRMaXZlSW5oZXJpdGVkSW5zdGFuY2VzO01vZHVsZVsiZmx1c2hQZW5kaW5nRGVsZXRlcyJdPWZsdXNoUGVuZGluZ0RlbGV0ZXM7TW9kdWxlWyJzZXREZWxheUZ1bmN0aW9uIl09c2V0RGVsYXlGdW5jdGlvbn12YXIgcmVnaXN0ZXJlZEluc3RhbmNlcz17fTtmdW5jdGlvbiBnZXRCYXNlc3RQb2ludGVyKGNsYXNzXyxwdHIpe2lmKHB0cj09PXVuZGVmaW5lZCl7dGhyb3dCaW5kaW5nRXJyb3IoInB0ciBzaG91bGQgbm90IGJlIHVuZGVmaW5lZCIpfXdoaWxlKGNsYXNzXy5iYXNlQ2xhc3Mpe3B0cj1jbGFzc18udXBjYXN0KHB0cik7Y2xhc3NfPWNsYXNzXy5iYXNlQ2xhc3N9cmV0dXJuIHB0cn1mdW5jdGlvbiBnZXRJbmhlcml0ZWRJbnN0YW5jZShjbGFzc18scHRyKXtwdHI9Z2V0QmFzZXN0UG9pbnRlcihjbGFzc18scHRyKTtyZXR1cm4gcmVnaXN0ZXJlZEluc3RhbmNlc1twdHJdfWZ1bmN0aW9uIG1ha2VDbGFzc0hhbmRsZShwcm90b3R5cGUscmVjb3JkKXtpZighcmVjb3JkLnB0clR5cGV8fCFyZWNvcmQucHRyKXt0aHJvd0ludGVybmFsRXJyb3IoIm1ha2VDbGFzc0hhbmRsZSByZXF1aXJlcyBwdHIgYW5kIHB0clR5cGUiKX12YXIgaGFzU21hcnRQdHJUeXBlPSEhcmVjb3JkLnNtYXJ0UHRyVHlwZTt2YXIgaGFzU21hcnRQdHI9ISFyZWNvcmQuc21hcnRQdHI7aWYoaGFzU21hcnRQdHJUeXBlIT09aGFzU21hcnRQdHIpe3Rocm93SW50ZXJuYWxFcnJvcigiQm90aCBzbWFydFB0clR5cGUgYW5kIHNtYXJ0UHRyIG11c3QgYmUgc3BlY2lmaWVkIil9cmVjb3JkLmNvdW50PXt2YWx1ZToxfTtyZXR1cm4gYXR0YWNoRmluYWxpemVyKE9iamVjdC5jcmVhdGUocHJvdG90eXBlLHskJDp7dmFsdWU6cmVjb3JkfX0pKX1mdW5jdGlvbiBSZWdpc3RlcmVkUG9pbnRlcl9mcm9tV2lyZVR5cGUocHRyKXt2YXIgcmF3UG9pbnRlcj10aGlzLmdldFBvaW50ZWUocHRyKTtpZighcmF3UG9pbnRlcil7dGhpcy5kZXN0cnVjdG9yKHB0cik7cmV0dXJuIG51bGx9dmFyIHJlZ2lzdGVyZWRJbnN0YW5jZT1nZXRJbmhlcml0ZWRJbnN0YW5jZSh0aGlzLnJlZ2lzdGVyZWRDbGFzcyxyYXdQb2ludGVyKTtpZih1bmRlZmluZWQhPT1yZWdpc3RlcmVkSW5zdGFuY2Upe2lmKDA9PT1yZWdpc3RlcmVkSW5zdGFuY2UuJCQuY291bnQudmFsdWUpe3JlZ2lzdGVyZWRJbnN0YW5jZS4kJC5wdHI9cmF3UG9pbnRlcjtyZWdpc3RlcmVkSW5zdGFuY2UuJCQuc21hcnRQdHI9cHRyO3JldHVybiByZWdpc3RlcmVkSW5zdGFuY2VbImNsb25lIl0oKX1lbHNle3ZhciBydj1yZWdpc3RlcmVkSW5zdGFuY2VbImNsb25lIl0oKTt0aGlzLmRlc3RydWN0b3IocHRyKTtyZXR1cm4gcnZ9fWZ1bmN0aW9uIG1ha2VEZWZhdWx0SGFuZGxlKCl7aWYodGhpcy5pc1NtYXJ0UG9pbnRlcil7cmV0dXJuIG1ha2VDbGFzc0hhbmRsZSh0aGlzLnJlZ2lzdGVyZWRDbGFzcy5pbnN0YW5jZVByb3RvdHlwZSx7cHRyVHlwZTp0aGlzLnBvaW50ZWVUeXBlLHB0cjpyYXdQb2ludGVyLHNtYXJ0UHRyVHlwZTp0aGlzLHNtYXJ0UHRyOnB0cn0pfWVsc2V7cmV0dXJuIG1ha2VDbGFzc0hhbmRsZSh0aGlzLnJlZ2lzdGVyZWRDbGFzcy5pbnN0YW5jZVByb3RvdHlwZSx7cHRyVHlwZTp0aGlzLHB0cjpwdHJ9KX19dmFyIGFjdHVhbFR5cGU9dGhpcy5yZWdpc3RlcmVkQ2xhc3MuZ2V0QWN0dWFsVHlwZShyYXdQb2ludGVyKTt2YXIgcmVnaXN0ZXJlZFBvaW50ZXJSZWNvcmQ9cmVnaXN0ZXJlZFBvaW50ZXJzW2FjdHVhbFR5cGVdO2lmKCFyZWdpc3RlcmVkUG9pbnRlclJlY29yZCl7cmV0dXJuIG1ha2VEZWZhdWx0SGFuZGxlLmNhbGwodGhpcyl9dmFyIHRvVHlwZTtpZih0aGlzLmlzQ29uc3Qpe3RvVHlwZT1yZWdpc3RlcmVkUG9pbnRlclJlY29yZC5jb25zdFBvaW50ZXJUeXBlfWVsc2V7dG9UeXBlPXJlZ2lzdGVyZWRQb2ludGVyUmVjb3JkLnBvaW50ZXJUeXBlfXZhciBkcD1kb3duY2FzdFBvaW50ZXIocmF3UG9pbnRlcix0aGlzLnJlZ2lzdGVyZWRDbGFzcyx0b1R5cGUucmVnaXN0ZXJlZENsYXNzKTtpZihkcD09PW51bGwpe3JldHVybiBtYWtlRGVmYXVsdEhhbmRsZS5jYWxsKHRoaXMpfWlmKHRoaXMuaXNTbWFydFBvaW50ZXIpe3JldHVybiBtYWtlQ2xhc3NIYW5kbGUodG9UeXBlLnJlZ2lzdGVyZWRDbGFzcy5pbnN0YW5jZVByb3RvdHlwZSx7cHRyVHlwZTp0b1R5cGUscHRyOmRwLHNtYXJ0UHRyVHlwZTp0aGlzLHNtYXJ0UHRyOnB0cn0pfWVsc2V7cmV0dXJuIG1ha2VDbGFzc0hhbmRsZSh0b1R5cGUucmVnaXN0ZXJlZENsYXNzLmluc3RhbmNlUHJvdG90eXBlLHtwdHJUeXBlOnRvVHlwZSxwdHI6ZHB9KX19ZnVuY3Rpb24gYXR0YWNoRmluYWxpemVyKGhhbmRsZSl7aWYoInVuZGVmaW5lZCI9PT10eXBlb2YgRmluYWxpemF0aW9uUmVnaXN0cnkpe2F0dGFjaEZpbmFsaXplcj0oaGFuZGxlPT5oYW5kbGUpO3JldHVybiBoYW5kbGV9ZmluYWxpemF0aW9uUmVnaXN0cnk9bmV3IEZpbmFsaXphdGlvblJlZ2lzdHJ5KGluZm89PntyZWxlYXNlQ2xhc3NIYW5kbGUoaW5mby4kJCl9KTthdHRhY2hGaW5hbGl6ZXI9KGhhbmRsZT0+e3ZhciAkJD1oYW5kbGUuJCQ7dmFyIGhhc1NtYXJ0UHRyPSEhJCQuc21hcnRQdHI7aWYoaGFzU21hcnRQdHIpe3ZhciBpbmZvPXskJDokJH07ZmluYWxpemF0aW9uUmVnaXN0cnkucmVnaXN0ZXIoaGFuZGxlLGluZm8saGFuZGxlKX1yZXR1cm4gaGFuZGxlfSk7ZGV0YWNoRmluYWxpemVyPShoYW5kbGU9PmZpbmFsaXphdGlvblJlZ2lzdHJ5LnVucmVnaXN0ZXIoaGFuZGxlKSk7cmV0dXJuIGF0dGFjaEZpbmFsaXplcihoYW5kbGUpfWZ1bmN0aW9uIENsYXNzSGFuZGxlX2Nsb25lKCl7aWYoIXRoaXMuJCQucHRyKXt0aHJvd0luc3RhbmNlQWxyZWFkeURlbGV0ZWQodGhpcyl9aWYodGhpcy4kJC5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSl7dGhpcy4kJC5jb3VudC52YWx1ZSs9MTtyZXR1cm4gdGhpc31lbHNle3ZhciBjbG9uZT1hdHRhY2hGaW5hbGl6ZXIoT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykseyQkOnt2YWx1ZTpzaGFsbG93Q29weUludGVybmFsUG9pbnRlcih0aGlzLiQkKX19KSk7Y2xvbmUuJCQuY291bnQudmFsdWUrPTE7Y2xvbmUuJCQuZGVsZXRlU2NoZWR1bGVkPWZhbHNlO3JldHVybiBjbG9uZX19ZnVuY3Rpb24gQ2xhc3NIYW5kbGVfZGVsZXRlKCl7aWYoIXRoaXMuJCQucHRyKXt0aHJvd0luc3RhbmNlQWxyZWFkeURlbGV0ZWQodGhpcyl9aWYodGhpcy4kJC5kZWxldGVTY2hlZHVsZWQmJiF0aGlzLiQkLnByZXNlcnZlUG9pbnRlck9uRGVsZXRlKXt0aHJvd0JpbmRpbmdFcnJvcigiT2JqZWN0IGFscmVhZHkgc2NoZWR1bGVkIGZvciBkZWxldGlvbiIpfWRldGFjaEZpbmFsaXplcih0aGlzKTtyZWxlYXNlQ2xhc3NIYW5kbGUodGhpcy4kJCk7aWYoIXRoaXMuJCQucHJlc2VydmVQb2ludGVyT25EZWxldGUpe3RoaXMuJCQuc21hcnRQdHI9dW5kZWZpbmVkO3RoaXMuJCQucHRyPXVuZGVmaW5lZH19ZnVuY3Rpb24gQ2xhc3NIYW5kbGVfaXNEZWxldGVkKCl7cmV0dXJuIXRoaXMuJCQucHRyfWZ1bmN0aW9uIENsYXNzSGFuZGxlX2RlbGV0ZUxhdGVyKCl7aWYoIXRoaXMuJCQucHRyKXt0aHJvd0luc3RhbmNlQWxyZWFkeURlbGV0ZWQodGhpcyl9aWYodGhpcy4kJC5kZWxldGVTY2hlZHVsZWQmJiF0aGlzLiQkLnByZXNlcnZlUG9pbnRlck9uRGVsZXRlKXt0aHJvd0JpbmRpbmdFcnJvcigiT2JqZWN0IGFscmVhZHkgc2NoZWR1bGVkIGZvciBkZWxldGlvbiIpfWRlbGV0aW9uUXVldWUucHVzaCh0aGlzKTtpZihkZWxldGlvblF1ZXVlLmxlbmd0aD09PTEmJmRlbGF5RnVuY3Rpb24pe2RlbGF5RnVuY3Rpb24oZmx1c2hQZW5kaW5nRGVsZXRlcyl9dGhpcy4kJC5kZWxldGVTY2hlZHVsZWQ9dHJ1ZTtyZXR1cm4gdGhpc31mdW5jdGlvbiBpbml0X0NsYXNzSGFuZGxlKCl7Q2xhc3NIYW5kbGUucHJvdG90eXBlWyJpc0FsaWFzT2YiXT1DbGFzc0hhbmRsZV9pc0FsaWFzT2Y7Q2xhc3NIYW5kbGUucHJvdG90eXBlWyJjbG9uZSJdPUNsYXNzSGFuZGxlX2Nsb25lO0NsYXNzSGFuZGxlLnByb3RvdHlwZVsiZGVsZXRlIl09Q2xhc3NIYW5kbGVfZGVsZXRlO0NsYXNzSGFuZGxlLnByb3RvdHlwZVsiaXNEZWxldGVkIl09Q2xhc3NIYW5kbGVfaXNEZWxldGVkO0NsYXNzSGFuZGxlLnByb3RvdHlwZVsiZGVsZXRlTGF0ZXIiXT1DbGFzc0hhbmRsZV9kZWxldGVMYXRlcn1mdW5jdGlvbiBDbGFzc0hhbmRsZSgpe31mdW5jdGlvbiBlbnN1cmVPdmVybG9hZFRhYmxlKHByb3RvLG1ldGhvZE5hbWUsaHVtYW5OYW1lKXtpZih1bmRlZmluZWQ9PT1wcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlKXt2YXIgcHJldkZ1bmM9cHJvdG9bbWV0aG9kTmFtZV07cHJvdG9bbWV0aG9kTmFtZV09ZnVuY3Rpb24oKXtpZighcHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZS5oYXNPd25Qcm9wZXJ0eShhcmd1bWVudHMubGVuZ3RoKSl7dGhyb3dCaW5kaW5nRXJyb3IoIkZ1bmN0aW9uICciK2h1bWFuTmFtZSsiJyBjYWxsZWQgd2l0aCBhbiBpbnZhbGlkIG51bWJlciBvZiBhcmd1bWVudHMgKCIrYXJndW1lbnRzLmxlbmd0aCsiKSAtIGV4cGVjdHMgb25lIG9mICgiK3Byb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGUrIikhIil9cmV0dXJuIHByb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGVbYXJndW1lbnRzLmxlbmd0aF0uYXBwbHkodGhpcyxhcmd1bWVudHMpfTtwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlPVtdO3Byb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGVbcHJldkZ1bmMuYXJnQ291bnRdPXByZXZGdW5jfX1mdW5jdGlvbiBleHBvc2VQdWJsaWNTeW1ib2wobmFtZSx2YWx1ZSxudW1Bcmd1bWVudHMpe2lmKE1vZHVsZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSl7aWYodW5kZWZpbmVkPT09bnVtQXJndW1lbnRzfHx1bmRlZmluZWQhPT1Nb2R1bGVbbmFtZV0ub3ZlcmxvYWRUYWJsZSYmdW5kZWZpbmVkIT09TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGVbbnVtQXJndW1lbnRzXSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCByZWdpc3RlciBwdWJsaWMgbmFtZSAnIituYW1lKyInIHR3aWNlIil9ZW5zdXJlT3ZlcmxvYWRUYWJsZShNb2R1bGUsbmFtZSxuYW1lKTtpZihNb2R1bGUuaGFzT3duUHJvcGVydHkobnVtQXJndW1lbnRzKSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCByZWdpc3RlciBtdWx0aXBsZSBvdmVybG9hZHMgb2YgYSBmdW5jdGlvbiB3aXRoIHRoZSBzYW1lIG51bWJlciBvZiBhcmd1bWVudHMgKCIrbnVtQXJndW1lbnRzKyIpISIpfU1vZHVsZVtuYW1lXS5vdmVybG9hZFRhYmxlW251bUFyZ3VtZW50c109dmFsdWV9ZWxzZXtNb2R1bGVbbmFtZV09dmFsdWU7aWYodW5kZWZpbmVkIT09bnVtQXJndW1lbnRzKXtNb2R1bGVbbmFtZV0ubnVtQXJndW1lbnRzPW51bUFyZ3VtZW50c319fWZ1bmN0aW9uIFJlZ2lzdGVyZWRDbGFzcyhuYW1lLGNvbnN0cnVjdG9yLGluc3RhbmNlUHJvdG90eXBlLHJhd0Rlc3RydWN0b3IsYmFzZUNsYXNzLGdldEFjdHVhbFR5cGUsdXBjYXN0LGRvd25jYXN0KXt0aGlzLm5hbWU9bmFtZTt0aGlzLmNvbnN0cnVjdG9yPWNvbnN0cnVjdG9yO3RoaXMuaW5zdGFuY2VQcm90b3R5cGU9aW5zdGFuY2VQcm90b3R5cGU7dGhpcy5yYXdEZXN0cnVjdG9yPXJhd0Rlc3RydWN0b3I7dGhpcy5iYXNlQ2xhc3M9YmFzZUNsYXNzO3RoaXMuZ2V0QWN0dWFsVHlwZT1nZXRBY3R1YWxUeXBlO3RoaXMudXBjYXN0PXVwY2FzdDt0aGlzLmRvd25jYXN0PWRvd25jYXN0O3RoaXMucHVyZVZpcnR1YWxGdW5jdGlvbnM9W119ZnVuY3Rpb24gdXBjYXN0UG9pbnRlcihwdHIscHRyQ2xhc3MsZGVzaXJlZENsYXNzKXt3aGlsZShwdHJDbGFzcyE9PWRlc2lyZWRDbGFzcyl7aWYoIXB0ckNsYXNzLnVwY2FzdCl7dGhyb3dCaW5kaW5nRXJyb3IoIkV4cGVjdGVkIG51bGwgb3IgaW5zdGFuY2Ugb2YgIitkZXNpcmVkQ2xhc3MubmFtZSsiLCBnb3QgYW4gaW5zdGFuY2Ugb2YgIitwdHJDbGFzcy5uYW1lKX1wdHI9cHRyQ2xhc3MudXBjYXN0KHB0cik7cHRyQ2xhc3M9cHRyQ2xhc3MuYmFzZUNsYXNzfXJldHVybiBwdHJ9ZnVuY3Rpb24gY29uc3ROb1NtYXJ0UHRyUmF3UG9pbnRlclRvV2lyZVR5cGUoZGVzdHJ1Y3RvcnMsaGFuZGxlKXtpZihoYW5kbGU9PT1udWxsKXtpZih0aGlzLmlzUmVmZXJlbmNlKXt0aHJvd0JpbmRpbmdFcnJvcigibnVsbCBpcyBub3QgYSB2YWxpZCAiK3RoaXMubmFtZSl9cmV0dXJuIDB9aWYoIWhhbmRsZS4kJCl7dGhyb3dCaW5kaW5nRXJyb3IoJ0Nhbm5vdCBwYXNzICInK19lbWJpbmRfcmVwcihoYW5kbGUpKyciIGFzIGEgJyt0aGlzLm5hbWUpfWlmKCFoYW5kbGUuJCQucHRyKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHBhc3MgZGVsZXRlZCBvYmplY3QgYXMgYSBwb2ludGVyIG9mIHR5cGUgIit0aGlzLm5hbWUpfXZhciBoYW5kbGVDbGFzcz1oYW5kbGUuJCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3M7dmFyIHB0cj11cGNhc3RQb2ludGVyKGhhbmRsZS4kJC5wdHIsaGFuZGxlQ2xhc3MsdGhpcy5yZWdpc3RlcmVkQ2xhc3MpO3JldHVybiBwdHJ9ZnVuY3Rpb24gZ2VuZXJpY1BvaW50ZXJUb1dpcmVUeXBlKGRlc3RydWN0b3JzLGhhbmRsZSl7dmFyIHB0cjtpZihoYW5kbGU9PT1udWxsKXtpZih0aGlzLmlzUmVmZXJlbmNlKXt0aHJvd0JpbmRpbmdFcnJvcigibnVsbCBpcyBub3QgYSB2YWxpZCAiK3RoaXMubmFtZSl9aWYodGhpcy5pc1NtYXJ0UG9pbnRlcil7cHRyPXRoaXMucmF3Q29uc3RydWN0b3IoKTtpZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2godGhpcy5yYXdEZXN0cnVjdG9yLHB0cil9cmV0dXJuIHB0cn1lbHNle3JldHVybiAwfX1pZighaGFuZGxlLiQkKXt0aHJvd0JpbmRpbmdFcnJvcignQ2Fubm90IHBhc3MgIicrX2VtYmluZF9yZXByKGhhbmRsZSkrJyIgYXMgYSAnK3RoaXMubmFtZSl9aWYoIWhhbmRsZS4kJC5wdHIpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgcGFzcyBkZWxldGVkIG9iamVjdCBhcyBhIHBvaW50ZXIgb2YgdHlwZSAiK3RoaXMubmFtZSl9aWYoIXRoaXMuaXNDb25zdCYmaGFuZGxlLiQkLnB0clR5cGUuaXNDb25zdCl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBjb252ZXJ0IGFyZ3VtZW50IG9mIHR5cGUgIisoaGFuZGxlLiQkLnNtYXJ0UHRyVHlwZT9oYW5kbGUuJCQuc21hcnRQdHJUeXBlLm5hbWU6aGFuZGxlLiQkLnB0clR5cGUubmFtZSkrIiB0byBwYXJhbWV0ZXIgdHlwZSAiK3RoaXMubmFtZSl9dmFyIGhhbmRsZUNsYXNzPWhhbmRsZS4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzcztwdHI9dXBjYXN0UG9pbnRlcihoYW5kbGUuJCQucHRyLGhhbmRsZUNsYXNzLHRoaXMucmVnaXN0ZXJlZENsYXNzKTtpZih0aGlzLmlzU21hcnRQb2ludGVyKXtpZih1bmRlZmluZWQ9PT1oYW5kbGUuJCQuc21hcnRQdHIpe3Rocm93QmluZGluZ0Vycm9yKCJQYXNzaW5nIHJhdyBwb2ludGVyIHRvIHNtYXJ0IHBvaW50ZXIgaXMgaWxsZWdhbCIpfXN3aXRjaCh0aGlzLnNoYXJpbmdQb2xpY3kpe2Nhc2UgMDppZihoYW5kbGUuJCQuc21hcnRQdHJUeXBlPT09dGhpcyl7cHRyPWhhbmRsZS4kJC5zbWFydFB0cn1lbHNle3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgY29udmVydCBhcmd1bWVudCBvZiB0eXBlICIrKGhhbmRsZS4kJC5zbWFydFB0clR5cGU/aGFuZGxlLiQkLnNtYXJ0UHRyVHlwZS5uYW1lOmhhbmRsZS4kJC5wdHJUeXBlLm5hbWUpKyIgdG8gcGFyYW1ldGVyIHR5cGUgIit0aGlzLm5hbWUpfWJyZWFrO2Nhc2UgMTpwdHI9aGFuZGxlLiQkLnNtYXJ0UHRyO2JyZWFrO2Nhc2UgMjppZihoYW5kbGUuJCQuc21hcnRQdHJUeXBlPT09dGhpcyl7cHRyPWhhbmRsZS4kJC5zbWFydFB0cn1lbHNle3ZhciBjbG9uZWRIYW5kbGU9aGFuZGxlWyJjbG9uZSJdKCk7cHRyPXRoaXMucmF3U2hhcmUocHRyLEVtdmFsLnRvSGFuZGxlKGZ1bmN0aW9uKCl7Y2xvbmVkSGFuZGxlWyJkZWxldGUiXSgpfSkpO2lmKGRlc3RydWN0b3JzIT09bnVsbCl7ZGVzdHJ1Y3RvcnMucHVzaCh0aGlzLnJhd0Rlc3RydWN0b3IscHRyKX19YnJlYWs7ZGVmYXVsdDp0aHJvd0JpbmRpbmdFcnJvcigiVW5zdXBwb3J0aW5nIHNoYXJpbmcgcG9saWN5Iil9fXJldHVybiBwdHJ9ZnVuY3Rpb24gbm9uQ29uc3ROb1NtYXJ0UHRyUmF3UG9pbnRlclRvV2lyZVR5cGUoZGVzdHJ1Y3RvcnMsaGFuZGxlKXtpZihoYW5kbGU9PT1udWxsKXtpZih0aGlzLmlzUmVmZXJlbmNlKXt0aHJvd0JpbmRpbmdFcnJvcigibnVsbCBpcyBub3QgYSB2YWxpZCAiK3RoaXMubmFtZSl9cmV0dXJuIDB9aWYoIWhhbmRsZS4kJCl7dGhyb3dCaW5kaW5nRXJyb3IoJ0Nhbm5vdCBwYXNzICInK19lbWJpbmRfcmVwcihoYW5kbGUpKyciIGFzIGEgJyt0aGlzLm5hbWUpfWlmKCFoYW5kbGUuJCQucHRyKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHBhc3MgZGVsZXRlZCBvYmplY3QgYXMgYSBwb2ludGVyIG9mIHR5cGUgIit0aGlzLm5hbWUpfWlmKGhhbmRsZS4kJC5wdHJUeXBlLmlzQ29uc3Qpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgY29udmVydCBhcmd1bWVudCBvZiB0eXBlICIraGFuZGxlLiQkLnB0clR5cGUubmFtZSsiIHRvIHBhcmFtZXRlciB0eXBlICIrdGhpcy5uYW1lKX12YXIgaGFuZGxlQ2xhc3M9aGFuZGxlLiQkLnB0clR5cGUucmVnaXN0ZXJlZENsYXNzO3ZhciBwdHI9dXBjYXN0UG9pbnRlcihoYW5kbGUuJCQucHRyLGhhbmRsZUNsYXNzLHRoaXMucmVnaXN0ZXJlZENsYXNzKTtyZXR1cm4gcHRyfWZ1bmN0aW9uIHNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQVTMyW3BvaW50ZXI+PjJdKX1mdW5jdGlvbiBSZWdpc3RlcmVkUG9pbnRlcl9nZXRQb2ludGVlKHB0cil7aWYodGhpcy5yYXdHZXRQb2ludGVlKXtwdHI9dGhpcy5yYXdHZXRQb2ludGVlKHB0cil9cmV0dXJuIHB0cn1mdW5jdGlvbiBSZWdpc3RlcmVkUG9pbnRlcl9kZXN0cnVjdG9yKHB0cil7aWYodGhpcy5yYXdEZXN0cnVjdG9yKXt0aGlzLnJhd0Rlc3RydWN0b3IocHRyKX19ZnVuY3Rpb24gUmVnaXN0ZXJlZFBvaW50ZXJfZGVsZXRlT2JqZWN0KGhhbmRsZSl7aWYoaGFuZGxlIT09bnVsbCl7aGFuZGxlWyJkZWxldGUiXSgpfX1mdW5jdGlvbiBpbml0X1JlZ2lzdGVyZWRQb2ludGVyKCl7UmVnaXN0ZXJlZFBvaW50ZXIucHJvdG90eXBlLmdldFBvaW50ZWU9UmVnaXN0ZXJlZFBvaW50ZXJfZ2V0UG9pbnRlZTtSZWdpc3RlcmVkUG9pbnRlci5wcm90b3R5cGUuZGVzdHJ1Y3Rvcj1SZWdpc3RlcmVkUG9pbnRlcl9kZXN0cnVjdG9yO1JlZ2lzdGVyZWRQb2ludGVyLnByb3RvdHlwZVsiYXJnUGFja0FkdmFuY2UiXT04O1JlZ2lzdGVyZWRQb2ludGVyLnByb3RvdHlwZVsicmVhZFZhbHVlRnJvbVBvaW50ZXIiXT1zaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcjtSZWdpc3RlcmVkUG9pbnRlci5wcm90b3R5cGVbImRlbGV0ZU9iamVjdCJdPVJlZ2lzdGVyZWRQb2ludGVyX2RlbGV0ZU9iamVjdDtSZWdpc3RlcmVkUG9pbnRlci5wcm90b3R5cGVbImZyb21XaXJlVHlwZSJdPVJlZ2lzdGVyZWRQb2ludGVyX2Zyb21XaXJlVHlwZX1mdW5jdGlvbiBSZWdpc3RlcmVkUG9pbnRlcihuYW1lLHJlZ2lzdGVyZWRDbGFzcyxpc1JlZmVyZW5jZSxpc0NvbnN0LGlzU21hcnRQb2ludGVyLHBvaW50ZWVUeXBlLHNoYXJpbmdQb2xpY3kscmF3R2V0UG9pbnRlZSxyYXdDb25zdHJ1Y3RvcixyYXdTaGFyZSxyYXdEZXN0cnVjdG9yKXt0aGlzLm5hbWU9bmFtZTt0aGlzLnJlZ2lzdGVyZWRDbGFzcz1yZWdpc3RlcmVkQ2xhc3M7dGhpcy5pc1JlZmVyZW5jZT1pc1JlZmVyZW5jZTt0aGlzLmlzQ29uc3Q9aXNDb25zdDt0aGlzLmlzU21hcnRQb2ludGVyPWlzU21hcnRQb2ludGVyO3RoaXMucG9pbnRlZVR5cGU9cG9pbnRlZVR5cGU7dGhpcy5zaGFyaW5nUG9saWN5PXNoYXJpbmdQb2xpY3k7dGhpcy5yYXdHZXRQb2ludGVlPXJhd0dldFBvaW50ZWU7dGhpcy5yYXdDb25zdHJ1Y3Rvcj1yYXdDb25zdHJ1Y3Rvcjt0aGlzLnJhd1NoYXJlPXJhd1NoYXJlO3RoaXMucmF3RGVzdHJ1Y3Rvcj1yYXdEZXN0cnVjdG9yO2lmKCFpc1NtYXJ0UG9pbnRlciYmcmVnaXN0ZXJlZENsYXNzLmJhc2VDbGFzcz09PXVuZGVmaW5lZCl7aWYoaXNDb25zdCl7dGhpc1sidG9XaXJlVHlwZSJdPWNvbnN0Tm9TbWFydFB0clJhd1BvaW50ZXJUb1dpcmVUeXBlO3RoaXMuZGVzdHJ1Y3RvckZ1bmN0aW9uPW51bGx9ZWxzZXt0aGlzWyJ0b1dpcmVUeXBlIl09bm9uQ29uc3ROb1NtYXJ0UHRyUmF3UG9pbnRlclRvV2lyZVR5cGU7dGhpcy5kZXN0cnVjdG9yRnVuY3Rpb249bnVsbH19ZWxzZXt0aGlzWyJ0b1dpcmVUeXBlIl09Z2VuZXJpY1BvaW50ZXJUb1dpcmVUeXBlfX1mdW5jdGlvbiByZXBsYWNlUHVibGljU3ltYm9sKG5hbWUsdmFsdWUsbnVtQXJndW1lbnRzKXtpZighTW9kdWxlLmhhc093blByb3BlcnR5KG5hbWUpKXt0aHJvd0ludGVybmFsRXJyb3IoIlJlcGxhY2luZyBub25leGlzdGFudCBwdWJsaWMgc3ltYm9sIil9aWYodW5kZWZpbmVkIT09TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGUmJnVuZGVmaW5lZCE9PW51bUFyZ3VtZW50cyl7TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGVbbnVtQXJndW1lbnRzXT12YWx1ZX1lbHNle01vZHVsZVtuYW1lXT12YWx1ZTtNb2R1bGVbbmFtZV0uYXJnQ291bnQ9bnVtQXJndW1lbnRzfX1mdW5jdGlvbiBkeW5DYWxsTGVnYWN5KHNpZyxwdHIsYXJncyl7dmFyIGY9TW9kdWxlWyJkeW5DYWxsXyIrc2lnXTtyZXR1cm4gYXJncyYmYXJncy5sZW5ndGg/Zi5hcHBseShudWxsLFtwdHJdLmNvbmNhdChhcmdzKSk6Zi5jYWxsKG51bGwscHRyKX1mdW5jdGlvbiBkeW5DYWxsKHNpZyxwdHIsYXJncyl7aWYoc2lnLmluY2x1ZGVzKCJqIikpe3JldHVybiBkeW5DYWxsTGVnYWN5KHNpZyxwdHIsYXJncyl9cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KHB0cikuYXBwbHkobnVsbCxhcmdzKX1mdW5jdGlvbiBnZXREeW5DYWxsZXIoc2lnLHB0cil7dmFyIGFyZ0NhY2hlPVtdO3JldHVybiBmdW5jdGlvbigpe2FyZ0NhY2hlLmxlbmd0aD0wO09iamVjdC5hc3NpZ24oYXJnQ2FjaGUsYXJndW1lbnRzKTtyZXR1cm4gZHluQ2FsbChzaWcscHRyLGFyZ0NhY2hlKX19ZnVuY3Rpb24gZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oc2lnbmF0dXJlLHJhd0Z1bmN0aW9uKXtzaWduYXR1cmU9cmVhZExhdGluMVN0cmluZyhzaWduYXR1cmUpO2Z1bmN0aW9uIG1ha2VEeW5DYWxsZXIoKXtpZihzaWduYXR1cmUuaW5jbHVkZXMoImoiKSl7cmV0dXJuIGdldER5bkNhbGxlcihzaWduYXR1cmUscmF3RnVuY3Rpb24pfXJldHVybiBnZXRXYXNtVGFibGVFbnRyeShyYXdGdW5jdGlvbil9dmFyIGZwPW1ha2VEeW5DYWxsZXIoKTtpZih0eXBlb2YgZnAhPSJmdW5jdGlvbiIpe3Rocm93QmluZGluZ0Vycm9yKCJ1bmtub3duIGZ1bmN0aW9uIHBvaW50ZXIgd2l0aCBzaWduYXR1cmUgIitzaWduYXR1cmUrIjogIityYXdGdW5jdGlvbil9cmV0dXJuIGZwfXZhciBVbmJvdW5kVHlwZUVycm9yPXVuZGVmaW5lZDtmdW5jdGlvbiBnZXRUeXBlTmFtZSh0eXBlKXt2YXIgcHRyPV9fX2dldFR5cGVOYW1lKHR5cGUpO3ZhciBydj1yZWFkTGF0aW4xU3RyaW5nKHB0cik7X2ZyZWUocHRyKTtyZXR1cm4gcnZ9ZnVuY3Rpb24gdGhyb3dVbmJvdW5kVHlwZUVycm9yKG1lc3NhZ2UsdHlwZXMpe3ZhciB1bmJvdW5kVHlwZXM9W107dmFyIHNlZW49e307ZnVuY3Rpb24gdmlzaXQodHlwZSl7aWYoc2Vlblt0eXBlXSl7cmV0dXJufWlmKHJlZ2lzdGVyZWRUeXBlc1t0eXBlXSl7cmV0dXJufWlmKHR5cGVEZXBlbmRlbmNpZXNbdHlwZV0pe3R5cGVEZXBlbmRlbmNpZXNbdHlwZV0uZm9yRWFjaCh2aXNpdCk7cmV0dXJufXVuYm91bmRUeXBlcy5wdXNoKHR5cGUpO3NlZW5bdHlwZV09dHJ1ZX10eXBlcy5mb3JFYWNoKHZpc2l0KTt0aHJvdyBuZXcgVW5ib3VuZFR5cGVFcnJvcihtZXNzYWdlKyI6ICIrdW5ib3VuZFR5cGVzLm1hcChnZXRUeXBlTmFtZSkuam9pbihbIiwgIl0pKX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9jbGFzcyhyYXdUeXBlLHJhd1BvaW50ZXJUeXBlLHJhd0NvbnN0UG9pbnRlclR5cGUsYmFzZUNsYXNzUmF3VHlwZSxnZXRBY3R1YWxUeXBlU2lnbmF0dXJlLGdldEFjdHVhbFR5cGUsdXBjYXN0U2lnbmF0dXJlLHVwY2FzdCxkb3duY2FzdFNpZ25hdHVyZSxkb3duY2FzdCxuYW1lLGRlc3RydWN0b3JTaWduYXR1cmUscmF3RGVzdHJ1Y3Rvcil7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO2dldEFjdHVhbFR5cGU9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oZ2V0QWN0dWFsVHlwZVNpZ25hdHVyZSxnZXRBY3R1YWxUeXBlKTtpZih1cGNhc3Qpe3VwY2FzdD1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbih1cGNhc3RTaWduYXR1cmUsdXBjYXN0KX1pZihkb3duY2FzdCl7ZG93bmNhc3Q9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oZG93bmNhc3RTaWduYXR1cmUsZG93bmNhc3QpfXJhd0Rlc3RydWN0b3I9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oZGVzdHJ1Y3RvclNpZ25hdHVyZSxyYXdEZXN0cnVjdG9yKTt2YXIgbGVnYWxGdW5jdGlvbk5hbWU9bWFrZUxlZ2FsRnVuY3Rpb25OYW1lKG5hbWUpO2V4cG9zZVB1YmxpY1N5bWJvbChsZWdhbEZ1bmN0aW9uTmFtZSxmdW5jdGlvbigpe3Rocm93VW5ib3VuZFR5cGVFcnJvcigiQ2Fubm90IGNvbnN0cnVjdCAiK25hbWUrIiBkdWUgdG8gdW5ib3VuZCB0eXBlcyIsW2Jhc2VDbGFzc1Jhd1R5cGVdKX0pO3doZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkKFtyYXdUeXBlLHJhd1BvaW50ZXJUeXBlLHJhd0NvbnN0UG9pbnRlclR5cGVdLGJhc2VDbGFzc1Jhd1R5cGU/W2Jhc2VDbGFzc1Jhd1R5cGVdOltdLGZ1bmN0aW9uKGJhc2Upe2Jhc2U9YmFzZVswXTt2YXIgYmFzZUNsYXNzO3ZhciBiYXNlUHJvdG90eXBlO2lmKGJhc2VDbGFzc1Jhd1R5cGUpe2Jhc2VDbGFzcz1iYXNlLnJlZ2lzdGVyZWRDbGFzcztiYXNlUHJvdG90eXBlPWJhc2VDbGFzcy5pbnN0YW5jZVByb3RvdHlwZX1lbHNle2Jhc2VQcm90b3R5cGU9Q2xhc3NIYW5kbGUucHJvdG90eXBlfXZhciBjb25zdHJ1Y3Rvcj1jcmVhdGVOYW1lZEZ1bmN0aW9uKGxlZ2FsRnVuY3Rpb25OYW1lLGZ1bmN0aW9uKCl7aWYoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpIT09aW5zdGFuY2VQcm90b3R5cGUpe3Rocm93IG5ldyBCaW5kaW5nRXJyb3IoIlVzZSAnbmV3JyB0byBjb25zdHJ1Y3QgIituYW1lKX1pZih1bmRlZmluZWQ9PT1yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keSl7dGhyb3cgbmV3IEJpbmRpbmdFcnJvcihuYW1lKyIgaGFzIG5vIGFjY2Vzc2libGUgY29uc3RydWN0b3IiKX12YXIgYm9keT1yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keVthcmd1bWVudHMubGVuZ3RoXTtpZih1bmRlZmluZWQ9PT1ib2R5KXt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKCJUcmllZCB0byBpbnZva2UgY3RvciBvZiAiK25hbWUrIiB3aXRoIGludmFsaWQgbnVtYmVyIG9mIHBhcmFtZXRlcnMgKCIrYXJndW1lbnRzLmxlbmd0aCsiKSAtIGV4cGVjdGVkICgiK09iamVjdC5rZXlzKHJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5KS50b1N0cmluZygpKyIpIHBhcmFtZXRlcnMgaW5zdGVhZCEiKX1yZXR1cm4gYm9keS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9KTt2YXIgaW5zdGFuY2VQcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiYXNlUHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6Y29uc3RydWN0b3J9fSk7Y29uc3RydWN0b3IucHJvdG90eXBlPWluc3RhbmNlUHJvdG90eXBlO3ZhciByZWdpc3RlcmVkQ2xhc3M9bmV3IFJlZ2lzdGVyZWRDbGFzcyhuYW1lLGNvbnN0cnVjdG9yLGluc3RhbmNlUHJvdG90eXBlLHJhd0Rlc3RydWN0b3IsYmFzZUNsYXNzLGdldEFjdHVhbFR5cGUsdXBjYXN0LGRvd25jYXN0KTt2YXIgcmVmZXJlbmNlQ29udmVydGVyPW5ldyBSZWdpc3RlcmVkUG9pbnRlcihuYW1lLHJlZ2lzdGVyZWRDbGFzcyx0cnVlLGZhbHNlLGZhbHNlKTt2YXIgcG9pbnRlckNvbnZlcnRlcj1uZXcgUmVnaXN0ZXJlZFBvaW50ZXIobmFtZSsiKiIscmVnaXN0ZXJlZENsYXNzLGZhbHNlLGZhbHNlLGZhbHNlKTt2YXIgY29uc3RQb2ludGVyQ29udmVydGVyPW5ldyBSZWdpc3RlcmVkUG9pbnRlcihuYW1lKyIgY29uc3QqIixyZWdpc3RlcmVkQ2xhc3MsZmFsc2UsdHJ1ZSxmYWxzZSk7cmVnaXN0ZXJlZFBvaW50ZXJzW3Jhd1R5cGVdPXtwb2ludGVyVHlwZTpwb2ludGVyQ29udmVydGVyLGNvbnN0UG9pbnRlclR5cGU6Y29uc3RQb2ludGVyQ29udmVydGVyfTtyZXBsYWNlUHVibGljU3ltYm9sKGxlZ2FsRnVuY3Rpb25OYW1lLGNvbnN0cnVjdG9yKTtyZXR1cm5bcmVmZXJlbmNlQ29udmVydGVyLHBvaW50ZXJDb252ZXJ0ZXIsY29uc3RQb2ludGVyQ29udmVydGVyXX0pfWZ1bmN0aW9uIGhlYXAzMlZlY3RvclRvQXJyYXkoY291bnQsZmlyc3RFbGVtZW50KXt2YXIgYXJyYXk9W107Zm9yKHZhciBpPTA7aTxjb3VudDtpKyspe2FycmF5LnB1c2goSEVBUDMyWyhmaXJzdEVsZW1lbnQ+PjIpK2ldKX1yZXR1cm4gYXJyYXl9ZnVuY3Rpb24gcnVuRGVzdHJ1Y3RvcnMoZGVzdHJ1Y3RvcnMpe3doaWxlKGRlc3RydWN0b3JzLmxlbmd0aCl7dmFyIHB0cj1kZXN0cnVjdG9ycy5wb3AoKTt2YXIgZGVsPWRlc3RydWN0b3JzLnBvcCgpO2RlbChwdHIpfX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19jb25zdHJ1Y3RvcihyYXdDbGFzc1R5cGUsYXJnQ291bnQscmF3QXJnVHlwZXNBZGRyLGludm9rZXJTaWduYXR1cmUsaW52b2tlcixyYXdDb25zdHJ1Y3Rvcil7YXNzZXJ0KGFyZ0NvdW50PjApO3ZhciByYXdBcmdUeXBlcz1oZWFwMzJWZWN0b3JUb0FycmF5KGFyZ0NvdW50LHJhd0FyZ1R5cGVzQWRkcik7aW52b2tlcj1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbihpbnZva2VyU2lnbmF0dXJlLGludm9rZXIpO3doZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkKFtdLFtyYXdDbGFzc1R5cGVdLGZ1bmN0aW9uKGNsYXNzVHlwZSl7Y2xhc3NUeXBlPWNsYXNzVHlwZVswXTt2YXIgaHVtYW5OYW1lPSJjb25zdHJ1Y3RvciAiK2NsYXNzVHlwZS5uYW1lO2lmKHVuZGVmaW5lZD09PWNsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keSl7Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5PVtdfWlmKHVuZGVmaW5lZCE9PWNsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keVthcmdDb3VudC0xXSl7dGhyb3cgbmV3IEJpbmRpbmdFcnJvcigiQ2Fubm90IHJlZ2lzdGVyIG11bHRpcGxlIGNvbnN0cnVjdG9ycyB3aXRoIGlkZW50aWNhbCBudW1iZXIgb2YgcGFyYW1ldGVycyAoIisoYXJnQ291bnQtMSkrIikgZm9yIGNsYXNzICciK2NsYXNzVHlwZS5uYW1lKyInISBPdmVybG9hZCByZXNvbHV0aW9uIGlzIGN1cnJlbnRseSBvbmx5IHBlcmZvcm1lZCB1c2luZyB0aGUgcGFyYW1ldGVyIGNvdW50LCBub3QgYWN0dWFsIHR5cGUgaW5mbyEiKX1jbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHlbYXJnQ291bnQtMV09KCgpPT57dGhyb3dVbmJvdW5kVHlwZUVycm9yKCJDYW5ub3QgY29uc3RydWN0ICIrY2xhc3NUeXBlLm5hbWUrIiBkdWUgdG8gdW5ib3VuZCB0eXBlcyIscmF3QXJnVHlwZXMpfSk7d2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQoW10scmF3QXJnVHlwZXMsZnVuY3Rpb24oYXJnVHlwZXMpe2FyZ1R5cGVzLnNwbGljZSgxLDAsbnVsbCk7Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5W2FyZ0NvdW50LTFdPWNyYWZ0SW52b2tlckZ1bmN0aW9uKGh1bWFuTmFtZSxhcmdUeXBlcyxudWxsLGludm9rZXIscmF3Q29uc3RydWN0b3IpO3JldHVybltdfSk7cmV0dXJuW119KX1mdW5jdGlvbiBuZXdfKGNvbnN0cnVjdG9yLGFyZ3VtZW50TGlzdCl7aWYoIShjb25zdHJ1Y3RvciBpbnN0YW5jZW9mIEZ1bmN0aW9uKSl7dGhyb3cgbmV3IFR5cGVFcnJvcigibmV3XyBjYWxsZWQgd2l0aCBjb25zdHJ1Y3RvciB0eXBlICIrdHlwZW9mIGNvbnN0cnVjdG9yKyIgd2hpY2ggaXMgbm90IGEgZnVuY3Rpb24iKX12YXIgZHVtbXk9Y3JlYXRlTmFtZWRGdW5jdGlvbihjb25zdHJ1Y3Rvci5uYW1lfHwidW5rbm93bkZ1bmN0aW9uTmFtZSIsZnVuY3Rpb24oKXt9KTtkdW1teS5wcm90b3R5cGU9Y29uc3RydWN0b3IucHJvdG90eXBlO3ZhciBvYmo9bmV3IGR1bW15O3ZhciByPWNvbnN0cnVjdG9yLmFwcGx5KG9iaixhcmd1bWVudExpc3QpO3JldHVybiByIGluc3RhbmNlb2YgT2JqZWN0P3I6b2JqfWZ1bmN0aW9uIGNyYWZ0SW52b2tlckZ1bmN0aW9uKGh1bWFuTmFtZSxhcmdUeXBlcyxjbGFzc1R5cGUsY3BwSW52b2tlckZ1bmMsY3BwVGFyZ2V0RnVuYyl7dmFyIGFyZ0NvdW50PWFyZ1R5cGVzLmxlbmd0aDtpZihhcmdDb3VudDwyKXt0aHJvd0JpbmRpbmdFcnJvcigiYXJnVHlwZXMgYXJyYXkgc2l6ZSBtaXNtYXRjaCEgTXVzdCBhdCBsZWFzdCBnZXQgcmV0dXJuIHZhbHVlIGFuZCAndGhpcycgdHlwZXMhIil9dmFyIGlzQ2xhc3NNZXRob2RGdW5jPWFyZ1R5cGVzWzFdIT09bnVsbCYmY2xhc3NUeXBlIT09bnVsbDt2YXIgbmVlZHNEZXN0cnVjdG9yU3RhY2s9ZmFsc2U7Zm9yKHZhciBpPTE7aTxhcmdUeXBlcy5sZW5ndGg7KytpKXtpZihhcmdUeXBlc1tpXSE9PW51bGwmJmFyZ1R5cGVzW2ldLmRlc3RydWN0b3JGdW5jdGlvbj09PXVuZGVmaW5lZCl7bmVlZHNEZXN0cnVjdG9yU3RhY2s9dHJ1ZTticmVha319dmFyIHJldHVybnM9YXJnVHlwZXNbMF0ubmFtZSE9PSJ2b2lkIjt2YXIgYXJnc0xpc3Q9IiI7dmFyIGFyZ3NMaXN0V2lyZWQ9IiI7Zm9yKHZhciBpPTA7aTxhcmdDb3VudC0yOysraSl7YXJnc0xpc3QrPShpIT09MD8iLCAiOiIiKSsiYXJnIitpO2FyZ3NMaXN0V2lyZWQrPShpIT09MD8iLCAiOiIiKSsiYXJnIitpKyJXaXJlZCJ9dmFyIGludm9rZXJGbkJvZHk9InJldHVybiBmdW5jdGlvbiAiK21ha2VMZWdhbEZ1bmN0aW9uTmFtZShodW1hbk5hbWUpKyIoIithcmdzTGlzdCsiKSB7XG4iKyJpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gIisoYXJnQ291bnQtMikrIikge1xuIisidGhyb3dCaW5kaW5nRXJyb3IoJ2Z1bmN0aW9uICIraHVtYW5OYW1lKyIgY2FsbGVkIHdpdGggJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIGFyZ3VtZW50cywgZXhwZWN0ZWQgIisoYXJnQ291bnQtMikrIiBhcmdzIScpO1xuIisifVxuIjtpZihuZWVkc0Rlc3RydWN0b3JTdGFjayl7aW52b2tlckZuQm9keSs9InZhciBkZXN0cnVjdG9ycyA9IFtdO1xuIn12YXIgZHRvclN0YWNrPW5lZWRzRGVzdHJ1Y3RvclN0YWNrPyJkZXN0cnVjdG9ycyI6Im51bGwiO3ZhciBhcmdzMT1bInRocm93QmluZGluZ0Vycm9yIiwiaW52b2tlciIsImZuIiwicnVuRGVzdHJ1Y3RvcnMiLCJyZXRUeXBlIiwiY2xhc3NQYXJhbSJdO3ZhciBhcmdzMj1bdGhyb3dCaW5kaW5nRXJyb3IsY3BwSW52b2tlckZ1bmMsY3BwVGFyZ2V0RnVuYyxydW5EZXN0cnVjdG9ycyxhcmdUeXBlc1swXSxhcmdUeXBlc1sxXV07aWYoaXNDbGFzc01ldGhvZEZ1bmMpe2ludm9rZXJGbkJvZHkrPSJ2YXIgdGhpc1dpcmVkID0gY2xhc3NQYXJhbS50b1dpcmVUeXBlKCIrZHRvclN0YWNrKyIsIHRoaXMpO1xuIn1mb3IodmFyIGk9MDtpPGFyZ0NvdW50LTI7KytpKXtpbnZva2VyRm5Cb2R5Kz0idmFyIGFyZyIraSsiV2lyZWQgPSBhcmdUeXBlIitpKyIudG9XaXJlVHlwZSgiK2R0b3JTdGFjaysiLCBhcmciK2krIik7IC8vICIrYXJnVHlwZXNbaSsyXS5uYW1lKyJcbiI7YXJnczEucHVzaCgiYXJnVHlwZSIraSk7YXJnczIucHVzaChhcmdUeXBlc1tpKzJdKX1pZihpc0NsYXNzTWV0aG9kRnVuYyl7YXJnc0xpc3RXaXJlZD0idGhpc1dpcmVkIisoYXJnc0xpc3RXaXJlZC5sZW5ndGg+MD8iLCAiOiIiKSthcmdzTGlzdFdpcmVkfWludm9rZXJGbkJvZHkrPShyZXR1cm5zPyJ2YXIgcnYgPSAiOiIiKSsiaW52b2tlcihmbiIrKGFyZ3NMaXN0V2lyZWQubGVuZ3RoPjA/IiwgIjoiIikrYXJnc0xpc3RXaXJlZCsiKTtcbiI7aWYobmVlZHNEZXN0cnVjdG9yU3RhY2spe2ludm9rZXJGbkJvZHkrPSJydW5EZXN0cnVjdG9ycyhkZXN0cnVjdG9ycyk7XG4ifWVsc2V7Zm9yKHZhciBpPWlzQ2xhc3NNZXRob2RGdW5jPzE6MjtpPGFyZ1R5cGVzLmxlbmd0aDsrK2kpe3ZhciBwYXJhbU5hbWU9aT09PTE/InRoaXNXaXJlZCI6ImFyZyIrKGktMikrIldpcmVkIjtpZihhcmdUeXBlc1tpXS5kZXN0cnVjdG9yRnVuY3Rpb24hPT1udWxsKXtpbnZva2VyRm5Cb2R5Kz1wYXJhbU5hbWUrIl9kdG9yKCIrcGFyYW1OYW1lKyIpOyAvLyAiK2FyZ1R5cGVzW2ldLm5hbWUrIlxuIjthcmdzMS5wdXNoKHBhcmFtTmFtZSsiX2R0b3IiKTthcmdzMi5wdXNoKGFyZ1R5cGVzW2ldLmRlc3RydWN0b3JGdW5jdGlvbil9fX1pZihyZXR1cm5zKXtpbnZva2VyRm5Cb2R5Kz0idmFyIHJldCA9IHJldFR5cGUuZnJvbVdpcmVUeXBlKHJ2KTtcbiIrInJldHVybiByZXQ7XG4ifWVsc2V7fWludm9rZXJGbkJvZHkrPSJ9XG4iO2FyZ3MxLnB1c2goaW52b2tlckZuQm9keSk7dmFyIGludm9rZXJGdW5jdGlvbj1uZXdfKEZ1bmN0aW9uLGFyZ3MxKS5hcHBseShudWxsLGFyZ3MyKTtyZXR1cm4gaW52b2tlckZ1bmN0aW9ufWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2Z1bmN0aW9uKHJhd0NsYXNzVHlwZSxtZXRob2ROYW1lLGFyZ0NvdW50LHJhd0FyZ1R5cGVzQWRkcixpbnZva2VyU2lnbmF0dXJlLHJhd0ludm9rZXIsY29udGV4dCxpc1B1cmVWaXJ0dWFsKXt2YXIgcmF3QXJnVHlwZXM9aGVhcDMyVmVjdG9yVG9BcnJheShhcmdDb3VudCxyYXdBcmdUeXBlc0FkZHIpO21ldGhvZE5hbWU9cmVhZExhdGluMVN0cmluZyhtZXRob2ROYW1lKTtyYXdJbnZva2VyPWVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKGludm9rZXJTaWduYXR1cmUscmF3SW52b2tlcik7d2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQoW10sW3Jhd0NsYXNzVHlwZV0sZnVuY3Rpb24oY2xhc3NUeXBlKXtjbGFzc1R5cGU9Y2xhc3NUeXBlWzBdO3ZhciBodW1hbk5hbWU9Y2xhc3NUeXBlLm5hbWUrIi4iK21ldGhvZE5hbWU7aWYobWV0aG9kTmFtZS5zdGFydHNXaXRoKCJAQCIpKXttZXRob2ROYW1lPVN5bWJvbFttZXRob2ROYW1lLnN1YnN0cmluZygyKV19aWYoaXNQdXJlVmlydHVhbCl7Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5wdXJlVmlydHVhbEZ1bmN0aW9ucy5wdXNoKG1ldGhvZE5hbWUpfWZ1bmN0aW9uIHVuYm91bmRUeXBlc0hhbmRsZXIoKXt0aHJvd1VuYm91bmRUeXBlRXJyb3IoIkNhbm5vdCBjYWxsICIraHVtYW5OYW1lKyIgZHVlIHRvIHVuYm91bmQgdHlwZXMiLHJhd0FyZ1R5cGVzKX12YXIgcHJvdG89Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5pbnN0YW5jZVByb3RvdHlwZTt2YXIgbWV0aG9kPXByb3RvW21ldGhvZE5hbWVdO2lmKHVuZGVmaW5lZD09PW1ldGhvZHx8dW5kZWZpbmVkPT09bWV0aG9kLm92ZXJsb2FkVGFibGUmJm1ldGhvZC5jbGFzc05hbWUhPT1jbGFzc1R5cGUubmFtZSYmbWV0aG9kLmFyZ0NvdW50PT09YXJnQ291bnQtMil7dW5ib3VuZFR5cGVzSGFuZGxlci5hcmdDb3VudD1hcmdDb3VudC0yO3VuYm91bmRUeXBlc0hhbmRsZXIuY2xhc3NOYW1lPWNsYXNzVHlwZS5uYW1lO3Byb3RvW21ldGhvZE5hbWVdPXVuYm91bmRUeXBlc0hhbmRsZXJ9ZWxzZXtlbnN1cmVPdmVybG9hZFRhYmxlKHByb3RvLG1ldGhvZE5hbWUsaHVtYW5OYW1lKTtwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlW2FyZ0NvdW50LTJdPXVuYm91bmRUeXBlc0hhbmRsZXJ9d2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQoW10scmF3QXJnVHlwZXMsZnVuY3Rpb24oYXJnVHlwZXMpe3ZhciBtZW1iZXJGdW5jdGlvbj1jcmFmdEludm9rZXJGdW5jdGlvbihodW1hbk5hbWUsYXJnVHlwZXMsY2xhc3NUeXBlLHJhd0ludm9rZXIsY29udGV4dCk7aWYodW5kZWZpbmVkPT09cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZSl7bWVtYmVyRnVuY3Rpb24uYXJnQ291bnQ9YXJnQ291bnQtMjtwcm90b1ttZXRob2ROYW1lXT1tZW1iZXJGdW5jdGlvbn1lbHNle3Byb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGVbYXJnQ291bnQtMl09bWVtYmVyRnVuY3Rpb259cmV0dXJuW119KTtyZXR1cm5bXX0pfXZhciBlbXZhbF9mcmVlX2xpc3Q9W107dmFyIGVtdmFsX2hhbmRsZV9hcnJheT1be30se3ZhbHVlOnVuZGVmaW5lZH0se3ZhbHVlOm51bGx9LHt2YWx1ZTp0cnVlfSx7dmFsdWU6ZmFsc2V9XTtmdW5jdGlvbiBfX2VtdmFsX2RlY3JlZihoYW5kbGUpe2lmKGhhbmRsZT40JiYwPT09LS1lbXZhbF9oYW5kbGVfYXJyYXlbaGFuZGxlXS5yZWZjb3VudCl7ZW12YWxfaGFuZGxlX2FycmF5W2hhbmRsZV09dW5kZWZpbmVkO2VtdmFsX2ZyZWVfbGlzdC5wdXNoKGhhbmRsZSl9fWZ1bmN0aW9uIGNvdW50X2VtdmFsX2hhbmRsZXMoKXt2YXIgY291bnQ9MDtmb3IodmFyIGk9NTtpPGVtdmFsX2hhbmRsZV9hcnJheS5sZW5ndGg7KytpKXtpZihlbXZhbF9oYW5kbGVfYXJyYXlbaV0hPT11bmRlZmluZWQpeysrY291bnR9fXJldHVybiBjb3VudH1mdW5jdGlvbiBnZXRfZmlyc3RfZW12YWwoKXtmb3IodmFyIGk9NTtpPGVtdmFsX2hhbmRsZV9hcnJheS5sZW5ndGg7KytpKXtpZihlbXZhbF9oYW5kbGVfYXJyYXlbaV0hPT11bmRlZmluZWQpe3JldHVybiBlbXZhbF9oYW5kbGVfYXJyYXlbaV19fXJldHVybiBudWxsfWZ1bmN0aW9uIGluaXRfZW12YWwoKXtNb2R1bGVbImNvdW50X2VtdmFsX2hhbmRsZXMiXT1jb3VudF9lbXZhbF9oYW5kbGVzO01vZHVsZVsiZ2V0X2ZpcnN0X2VtdmFsIl09Z2V0X2ZpcnN0X2VtdmFsfXZhciBFbXZhbD17dG9WYWx1ZTpoYW5kbGU9PntpZighaGFuZGxlKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHVzZSBkZWxldGVkIHZhbC4gaGFuZGxlID0gIitoYW5kbGUpfXJldHVybiBlbXZhbF9oYW5kbGVfYXJyYXlbaGFuZGxlXS52YWx1ZX0sdG9IYW5kbGU6dmFsdWU9Pntzd2l0Y2godmFsdWUpe2Nhc2UgdW5kZWZpbmVkOnJldHVybiAxO2Nhc2UgbnVsbDpyZXR1cm4gMjtjYXNlIHRydWU6cmV0dXJuIDM7Y2FzZSBmYWxzZTpyZXR1cm4gNDtkZWZhdWx0Ont2YXIgaGFuZGxlPWVtdmFsX2ZyZWVfbGlzdC5sZW5ndGg/ZW12YWxfZnJlZV9saXN0LnBvcCgpOmVtdmFsX2hhbmRsZV9hcnJheS5sZW5ndGg7ZW12YWxfaGFuZGxlX2FycmF5W2hhbmRsZV09e3JlZmNvdW50OjEsdmFsdWU6dmFsdWV9O3JldHVybiBoYW5kbGV9fX19O2Z1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX2VtdmFsKHJhd1R5cGUsbmFtZSl7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24oaGFuZGxlKXt2YXIgcnY9RW12YWwudG9WYWx1ZShoYW5kbGUpO19fZW12YWxfZGVjcmVmKGhhbmRsZSk7cmV0dXJuIHJ2fSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe3JldHVybiBFbXZhbC50b0hhbmRsZSh2YWx1ZSl9LCJhcmdQYWNrQWR2YW5jZSI6OCwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSl9ZnVuY3Rpb24gX2VtYmluZF9yZXByKHYpe2lmKHY9PT1udWxsKXtyZXR1cm4ibnVsbCJ9dmFyIHQ9dHlwZW9mIHY7aWYodD09PSJvYmplY3QifHx0PT09ImFycmF5Inx8dD09PSJmdW5jdGlvbiIpe3JldHVybiB2LnRvU3RyaW5nKCl9ZWxzZXtyZXR1cm4iIit2fX1mdW5jdGlvbiBmbG9hdFJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2hpZnQpe3N3aXRjaChzaGlmdCl7Y2FzZSAyOnJldHVybiBmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUEYzMltwb2ludGVyPj4yXSl9O2Nhc2UgMzpyZXR1cm4gZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBGNjRbcG9pbnRlcj4+M10pfTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoIlVua25vd24gZmxvYXQgdHlwZTogIituYW1lKX19ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfZmxvYXQocmF3VHlwZSxuYW1lLHNpemUpe3ZhciBzaGlmdD1nZXRTaGlmdEZyb21TaXplKHNpemUpO25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKHZhbHVlKXtyZXR1cm4gdmFsdWV9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7cmV0dXJuIHZhbHVlfSwiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpmbG9hdFJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2hpZnQpLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSl9ZnVuY3Rpb24gaW50ZWdlclJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2hpZnQsc2lnbmVkKXtzd2l0Y2goc2hpZnQpe2Nhc2UgMDpyZXR1cm4gc2lnbmVkP2Z1bmN0aW9uIHJlYWRTOEZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiBIRUFQOFtwb2ludGVyXX06ZnVuY3Rpb24gcmVhZFU4RnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIEhFQVBVOFtwb2ludGVyXX07Y2FzZSAxOnJldHVybiBzaWduZWQ/ZnVuY3Rpb24gcmVhZFMxNkZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiBIRUFQMTZbcG9pbnRlcj4+MV19OmZ1bmN0aW9uIHJlYWRVMTZGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gSEVBUFUxNltwb2ludGVyPj4xXX07Y2FzZSAyOnJldHVybiBzaWduZWQ/ZnVuY3Rpb24gcmVhZFMzMkZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiBIRUFQMzJbcG9pbnRlcj4+Ml19OmZ1bmN0aW9uIHJlYWRVMzJGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gSEVBUFUzMltwb2ludGVyPj4yXX07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKCJVbmtub3duIGludGVnZXIgdHlwZTogIituYW1lKX19ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcihwcmltaXRpdmVUeXBlLG5hbWUsc2l6ZSxtaW5SYW5nZSxtYXhSYW5nZSl7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO2lmKG1heFJhbmdlPT09LTEpe21heFJhbmdlPTQyOTQ5NjcyOTV9dmFyIHNoaWZ0PWdldFNoaWZ0RnJvbVNpemUoc2l6ZSk7dmFyIGZyb21XaXJlVHlwZT12YWx1ZT0+dmFsdWU7aWYobWluUmFuZ2U9PT0wKXt2YXIgYml0c2hpZnQ9MzItOCpzaXplO2Zyb21XaXJlVHlwZT0odmFsdWU9PnZhbHVlPDxiaXRzaGlmdD4+PmJpdHNoaWZ0KX12YXIgaXNVbnNpZ25lZFR5cGU9bmFtZS5pbmNsdWRlcygidW5zaWduZWQiKTt2YXIgY2hlY2tBc3NlcnRpb25zPSh2YWx1ZSx0b1R5cGVOYW1lKT0+e307dmFyIHRvV2lyZVR5cGU7aWYoaXNVbnNpZ25lZFR5cGUpe3RvV2lyZVR5cGU9ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe2NoZWNrQXNzZXJ0aW9ucyh2YWx1ZSx0aGlzLm5hbWUpO3JldHVybiB2YWx1ZT4+PjB9fWVsc2V7dG9XaXJlVHlwZT1mdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7Y2hlY2tBc3NlcnRpb25zKHZhbHVlLHRoaXMubmFtZSk7cmV0dXJuIHZhbHVlfX1yZWdpc3RlclR5cGUocHJpbWl0aXZlVHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZyb21XaXJlVHlwZSwidG9XaXJlVHlwZSI6dG9XaXJlVHlwZSwiYXJnUGFja0FkdmFuY2UiOjgsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjppbnRlZ2VyUmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaGlmdCxtaW5SYW5nZSE9PTApLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSl9ZnVuY3Rpb24gX19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXcocmF3VHlwZSxkYXRhVHlwZUluZGV4LG5hbWUpe3ZhciB0eXBlTWFwcGluZz1bSW50OEFycmF5LFVpbnQ4QXJyYXksSW50MTZBcnJheSxVaW50MTZBcnJheSxJbnQzMkFycmF5LFVpbnQzMkFycmF5LEZsb2F0MzJBcnJheSxGbG9hdDY0QXJyYXldO3ZhciBUQT10eXBlTWFwcGluZ1tkYXRhVHlwZUluZGV4XTtmdW5jdGlvbiBkZWNvZGVNZW1vcnlWaWV3KGhhbmRsZSl7aGFuZGxlPWhhbmRsZT4+Mjt2YXIgaGVhcD1IRUFQVTMyO3ZhciBzaXplPWhlYXBbaGFuZGxlXTt2YXIgZGF0YT1oZWFwW2hhbmRsZSsxXTtyZXR1cm4gbmV3IFRBKGJ1ZmZlcixkYXRhLHNpemUpfW5hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmRlY29kZU1lbW9yeVZpZXcsImFyZ1BhY2tBZHZhbmNlIjo4LCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6ZGVjb2RlTWVtb3J5Vmlld30se2lnbm9yZUR1cGxpY2F0ZVJlZ2lzdHJhdGlvbnM6dHJ1ZX0pfWZ1bmN0aW9uIF9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmcocmF3VHlwZSxuYW1lKXtuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIHN0ZFN0cmluZ0lzVVRGOD1uYW1lPT09InN0ZDo6c3RyaW5nIjtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKHZhbHVlKXt2YXIgbGVuZ3RoPUhFQVBVMzJbdmFsdWU+PjJdO3ZhciBzdHI7aWYoc3RkU3RyaW5nSXNVVEY4KXt2YXIgZGVjb2RlU3RhcnRQdHI9dmFsdWUrNDtmb3IodmFyIGk9MDtpPD1sZW5ndGg7KytpKXt2YXIgY3VycmVudEJ5dGVQdHI9dmFsdWUrNCtpO2lmKGk9PWxlbmd0aHx8SEVBUFU4W2N1cnJlbnRCeXRlUHRyXT09MCl7dmFyIG1heFJlYWQ9Y3VycmVudEJ5dGVQdHItZGVjb2RlU3RhcnRQdHI7dmFyIHN0cmluZ1NlZ21lbnQ9VVRGOFRvU3RyaW5nKGRlY29kZVN0YXJ0UHRyLG1heFJlYWQpO2lmKHN0cj09PXVuZGVmaW5lZCl7c3RyPXN0cmluZ1NlZ21lbnR9ZWxzZXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoMCk7c3RyKz1zdHJpbmdTZWdtZW50fWRlY29kZVN0YXJ0UHRyPWN1cnJlbnRCeXRlUHRyKzF9fX1lbHNle3ZhciBhPW5ldyBBcnJheShsZW5ndGgpO2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7YVtpXT1TdHJpbmcuZnJvbUNoYXJDb2RlKEhFQVBVOFt2YWx1ZSs0K2ldKX1zdHI9YS5qb2luKCIiKX1fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtpZih2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXt2YWx1ZT1uZXcgVWludDhBcnJheSh2YWx1ZSl9dmFyIGdldExlbmd0aDt2YXIgdmFsdWVJc09mVHlwZVN0cmluZz10eXBlb2YgdmFsdWU9PSJzdHJpbmciO2lmKCEodmFsdWVJc09mVHlwZVN0cmluZ3x8dmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5fHx2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4Q2xhbXBlZEFycmF5fHx2YWx1ZSBpbnN0YW5jZW9mIEludDhBcnJheSkpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIHN0ZDo6c3RyaW5nIil9aWYoc3RkU3RyaW5nSXNVVEY4JiZ2YWx1ZUlzT2ZUeXBlU3RyaW5nKXtnZXRMZW5ndGg9KCgpPT5sZW5ndGhCeXRlc1VURjgodmFsdWUpKX1lbHNle2dldExlbmd0aD0oKCk9PnZhbHVlLmxlbmd0aCl9dmFyIGxlbmd0aD1nZXRMZW5ndGgoKTt2YXIgcHRyPV9tYWxsb2MoNCtsZW5ndGgrMSk7SEVBUFUzMltwdHI+PjJdPWxlbmd0aDtpZihzdGRTdHJpbmdJc1VURjgmJnZhbHVlSXNPZlR5cGVTdHJpbmcpe3N0cmluZ1RvVVRGOCh2YWx1ZSxwdHIrNCxsZW5ndGgrMSl9ZWxzZXtpZih2YWx1ZUlzT2ZUeXBlU3RyaW5nKXtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe3ZhciBjaGFyQ29kZT12YWx1ZS5jaGFyQ29kZUF0KGkpO2lmKGNoYXJDb2RlPjI1NSl7X2ZyZWUocHRyKTt0aHJvd0JpbmRpbmdFcnJvcigiU3RyaW5nIGhhcyBVVEYtMTYgY29kZSB1bml0cyB0aGF0IGRvIG5vdCBmaXQgaW4gOCBiaXRzIil9SEVBUFU4W3B0cis0K2ldPWNoYXJDb2RlfX1lbHNle2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7SEVBUFU4W3B0cis0K2ldPXZhbHVlW2ldfX19aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKF9mcmVlLHB0cil9cmV0dXJuIHB0cn0sImFyZ1BhY2tBZHZhbmNlIjo4LCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6c2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXIsZGVzdHJ1Y3RvckZ1bmN0aW9uOmZ1bmN0aW9uKHB0cil7X2ZyZWUocHRyKX19KX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZyhyYXdUeXBlLGNoYXJTaXplLG5hbWUpe25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTt2YXIgZGVjb2RlU3RyaW5nLGVuY29kZVN0cmluZyxnZXRIZWFwLGxlbmd0aEJ5dGVzVVRGLHNoaWZ0O2lmKGNoYXJTaXplPT09Mil7ZGVjb2RlU3RyaW5nPVVURjE2VG9TdHJpbmc7ZW5jb2RlU3RyaW5nPXN0cmluZ1RvVVRGMTY7bGVuZ3RoQnl0ZXNVVEY9bGVuZ3RoQnl0ZXNVVEYxNjtnZXRIZWFwPSgoKT0+SEVBUFUxNik7c2hpZnQ9MX1lbHNlIGlmKGNoYXJTaXplPT09NCl7ZGVjb2RlU3RyaW5nPVVURjMyVG9TdHJpbmc7ZW5jb2RlU3RyaW5nPXN0cmluZ1RvVVRGMzI7bGVuZ3RoQnl0ZXNVVEY9bGVuZ3RoQnl0ZXNVVEYzMjtnZXRIZWFwPSgoKT0+SEVBUFUzMik7c2hpZnQ9Mn1yZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKHZhbHVlKXt2YXIgbGVuZ3RoPUhFQVBVMzJbdmFsdWU+PjJdO3ZhciBIRUFQPWdldEhlYXAoKTt2YXIgc3RyO3ZhciBkZWNvZGVTdGFydFB0cj12YWx1ZSs0O2Zvcih2YXIgaT0wO2k8PWxlbmd0aDsrK2kpe3ZhciBjdXJyZW50Qnl0ZVB0cj12YWx1ZSs0K2kqY2hhclNpemU7aWYoaT09bGVuZ3RofHxIRUFQW2N1cnJlbnRCeXRlUHRyPj5zaGlmdF09PTApe3ZhciBtYXhSZWFkQnl0ZXM9Y3VycmVudEJ5dGVQdHItZGVjb2RlU3RhcnRQdHI7dmFyIHN0cmluZ1NlZ21lbnQ9ZGVjb2RlU3RyaW5nKGRlY29kZVN0YXJ0UHRyLG1heFJlYWRCeXRlcyk7aWYoc3RyPT09dW5kZWZpbmVkKXtzdHI9c3RyaW5nU2VnbWVudH1lbHNle3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSgwKTtzdHIrPXN0cmluZ1NlZ21lbnR9ZGVjb2RlU3RhcnRQdHI9Y3VycmVudEJ5dGVQdHIrY2hhclNpemV9fV9mcmVlKHZhbHVlKTtyZXR1cm4gc3RyfSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe2lmKCEodHlwZW9mIHZhbHVlPT0ic3RyaW5nIikpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIEMrKyBzdHJpbmcgdHlwZSAiK25hbWUpfXZhciBsZW5ndGg9bGVuZ3RoQnl0ZXNVVEYodmFsdWUpO3ZhciBwdHI9X21hbGxvYyg0K2xlbmd0aCtjaGFyU2l6ZSk7SEVBUFUzMltwdHI+PjJdPWxlbmd0aD4+c2hpZnQ7ZW5jb2RlU3RyaW5nKHZhbHVlLHB0cis0LGxlbmd0aCtjaGFyU2l6ZSk7aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKF9mcmVlLHB0cil9cmV0dXJuIHB0cn0sImFyZ1BhY2tBZHZhbmNlIjo4LCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6c2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXIsZGVzdHJ1Y3RvckZ1bmN0aW9uOmZ1bmN0aW9uKHB0cil7X2ZyZWUocHRyKX19KX1mdW5jdGlvbiBfX2VtYmluZF9yZWdpc3Rlcl92b2lkKHJhd1R5cGUsbmFtZSl7bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtpc1ZvaWQ6dHJ1ZSxuYW1lOm5hbWUsImFyZ1BhY2tBZHZhbmNlIjowLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKCl7cmV0dXJuIHVuZGVmaW5lZH0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLG8pe3JldHVybiB1bmRlZmluZWR9fSl9ZnVuY3Rpb24gX19lbXNjcmlwdGVuX2RhdGVfbm93KCl7cmV0dXJuIERhdGUubm93KCl9dmFyIG5vd0lzTW9ub3RvbmljPXRydWU7ZnVuY3Rpb24gX19lbXNjcmlwdGVuX2dldF9ub3dfaXNfbW9ub3RvbmljKCl7cmV0dXJuIG5vd0lzTW9ub3RvbmljfWZ1bmN0aW9uIF9fZW12YWxfaW5jcmVmKGhhbmRsZSl7aWYoaGFuZGxlPjQpe2VtdmFsX2hhbmRsZV9hcnJheVtoYW5kbGVdLnJlZmNvdW50Kz0xfX1mdW5jdGlvbiByZXF1aXJlUmVnaXN0ZXJlZFR5cGUocmF3VHlwZSxodW1hbk5hbWUpe3ZhciBpbXBsPXJlZ2lzdGVyZWRUeXBlc1tyYXdUeXBlXTtpZih1bmRlZmluZWQ9PT1pbXBsKXt0aHJvd0JpbmRpbmdFcnJvcihodW1hbk5hbWUrIiBoYXMgdW5rbm93biB0eXBlICIrZ2V0VHlwZU5hbWUocmF3VHlwZSkpfXJldHVybiBpbXBsfWZ1bmN0aW9uIF9fZW12YWxfdGFrZV92YWx1ZSh0eXBlLGFyZ3Ype3R5cGU9cmVxdWlyZVJlZ2lzdGVyZWRUeXBlKHR5cGUsIl9lbXZhbF90YWtlX3ZhbHVlIik7dmFyIHY9dHlwZVsicmVhZFZhbHVlRnJvbVBvaW50ZXIiXShhcmd2KTtyZXR1cm4gRW12YWwudG9IYW5kbGUodil9ZnVuY3Rpb24gX19tbWFwX2pzKGFkZHIsbGVuLHByb3QsZmxhZ3MsZmQsb2ZmLGFsbG9jYXRlZCxidWlsdGluKXt0cnl7dmFyIGluZm89RlMuZ2V0U3RyZWFtKGZkKTtpZighaW5mbylyZXR1cm4tODt2YXIgcmVzPUZTLm1tYXAoaW5mbyxhZGRyLGxlbixvZmYscHJvdCxmbGFncyk7dmFyIHB0cj1yZXMucHRyO0hFQVAzMlthbGxvY2F0ZWQ+PjJdPXJlcy5hbGxvY2F0ZWQ7cmV0dXJuIHB0cn1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX211bm1hcF9qcyhhZGRyLGxlbixwcm90LGZsYWdzLGZkLG9mZnNldCl7dHJ5e3ZhciBzdHJlYW09RlMuZ2V0U3RyZWFtKGZkKTtpZihzdHJlYW0pe2lmKHByb3QmMil7U1lTQ0FMTFMuZG9Nc3luYyhhZGRyLHN0cmVhbSxsZW4sZmxhZ3Msb2Zmc2V0KX1GUy5tdW5tYXAoc3RyZWFtKX19Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlIGluc3RhbmNlb2YgRlMuRXJybm9FcnJvcikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX2Fib3J0KCl7YWJvcnQoIiIpfWZ1bmN0aW9uIF9lbXNjcmlwdGVuX2dldF9oZWFwX21heCgpe3JldHVybiAyMTQ3NDgzNjQ4fXZhciBfZW1zY3JpcHRlbl9nZXRfbm93O19lbXNjcmlwdGVuX2dldF9ub3c9KCgpPT5wZXJmb3JtYW5jZS5ub3coKSk7ZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fbWVtY3B5X2JpZyhkZXN0LHNyYyxudW0pe0hFQVBVOC5jb3B5V2l0aGluKGRlc3Qsc3JjLHNyYytudW0pfWZ1bmN0aW9uIGVtc2NyaXB0ZW5fcmVhbGxvY19idWZmZXIoc2l6ZSl7dHJ5e3dhc21NZW1vcnkuZ3JvdyhzaXplLWJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1Pj4+MTYpO3VwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKHdhc21NZW1vcnkuYnVmZmVyKTtyZXR1cm4gMX1jYXRjaChlKXt9fWZ1bmN0aW9uIF9lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwKHJlcXVlc3RlZFNpemUpe3ZhciBvbGRTaXplPUhFQVBVOC5sZW5ndGg7cmVxdWVzdGVkU2l6ZT1yZXF1ZXN0ZWRTaXplPj4+MDt2YXIgbWF4SGVhcFNpemU9X2Vtc2NyaXB0ZW5fZ2V0X2hlYXBfbWF4KCk7aWYocmVxdWVzdGVkU2l6ZT5tYXhIZWFwU2l6ZSl7cmV0dXJuIGZhbHNlfWxldCBhbGlnblVwPSh4LG11bHRpcGxlKT0+eCsobXVsdGlwbGUteCVtdWx0aXBsZSklbXVsdGlwbGU7Zm9yKHZhciBjdXREb3duPTE7Y3V0RG93bjw9NDtjdXREb3duKj0yKXt2YXIgb3Zlckdyb3duSGVhcFNpemU9b2xkU2l6ZSooMSsuMi9jdXREb3duKTtvdmVyR3Jvd25IZWFwU2l6ZT1NYXRoLm1pbihvdmVyR3Jvd25IZWFwU2l6ZSxyZXF1ZXN0ZWRTaXplKzEwMDY2MzI5Nik7dmFyIG5ld1NpemU9TWF0aC5taW4obWF4SGVhcFNpemUsYWxpZ25VcChNYXRoLm1heChyZXF1ZXN0ZWRTaXplLG92ZXJHcm93bkhlYXBTaXplKSw2NTUzNikpO3ZhciByZXBsYWNlbWVudD1lbXNjcmlwdGVuX3JlYWxsb2NfYnVmZmVyKG5ld1NpemUpO2lmKHJlcGxhY2VtZW50KXtyZXR1cm4gdHJ1ZX19cmV0dXJuIGZhbHNlfXZhciBFTlY9e307ZnVuY3Rpb24gZ2V0RXhlY3V0YWJsZU5hbWUoKXtyZXR1cm4gdGhpc1Byb2dyYW18fCIuL3RoaXMucHJvZ3JhbSJ9ZnVuY3Rpb24gZ2V0RW52U3RyaW5ncygpe2lmKCFnZXRFbnZTdHJpbmdzLnN0cmluZ3Mpe3ZhciBsYW5nPSh0eXBlb2YgbmF2aWdhdG9yPT0ib2JqZWN0IiYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8IkMiKS5yZXBsYWNlKCItIiwiXyIpKyIuVVRGLTgiO3ZhciBlbnY9eyJVU0VSIjoid2ViX3VzZXIiLCJMT0dOQU1FIjoid2ViX3VzZXIiLCJQQVRIIjoiLyIsIlBXRCI6Ii8iLCJIT01FIjoiL2hvbWUvd2ViX3VzZXIiLCJMQU5HIjpsYW5nLCJfIjpnZXRFeGVjdXRhYmxlTmFtZSgpfTtmb3IodmFyIHggaW4gRU5WKXtpZihFTlZbeF09PT11bmRlZmluZWQpZGVsZXRlIGVudlt4XTtlbHNlIGVudlt4XT1FTlZbeF19dmFyIHN0cmluZ3M9W107Zm9yKHZhciB4IGluIGVudil7c3RyaW5ncy5wdXNoKHgrIj0iK2Vudlt4XSl9Z2V0RW52U3RyaW5ncy5zdHJpbmdzPXN0cmluZ3N9cmV0dXJuIGdldEVudlN0cmluZ3Muc3RyaW5nc31mdW5jdGlvbiBfZW52aXJvbl9nZXQoX19lbnZpcm9uLGVudmlyb25fYnVmKXt2YXIgYnVmU2l6ZT0wO2dldEVudlN0cmluZ3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHN0cmluZyxpKXt2YXIgcHRyPWVudmlyb25fYnVmK2J1ZlNpemU7SEVBUDMyW19fZW52aXJvbitpKjQ+PjJdPXB0cjt3cml0ZUFzY2lpVG9NZW1vcnkoc3RyaW5nLHB0cik7YnVmU2l6ZSs9c3RyaW5nLmxlbmd0aCsxfSk7cmV0dXJuIDB9ZnVuY3Rpb24gX2Vudmlyb25fc2l6ZXNfZ2V0KHBlbnZpcm9uX2NvdW50LHBlbnZpcm9uX2J1Zl9zaXplKXt2YXIgc3RyaW5ncz1nZXRFbnZTdHJpbmdzKCk7SEVBUDMyW3BlbnZpcm9uX2NvdW50Pj4yXT1zdHJpbmdzLmxlbmd0aDt2YXIgYnVmU2l6ZT0wO3N0cmluZ3MuZm9yRWFjaChmdW5jdGlvbihzdHJpbmcpe2J1ZlNpemUrPXN0cmluZy5sZW5ndGgrMX0pO0hFQVAzMltwZW52aXJvbl9idWZfc2l6ZT4+Ml09YnVmU2l6ZTtyZXR1cm4gMH1mdW5jdGlvbiBfZXhpdChzdGF0dXMpe2V4aXQoc3RhdHVzKX1mdW5jdGlvbiBfZmRfY2xvc2UoZmQpe3RyeXt2YXIgc3RyZWFtPVNZU0NBTExTLmdldFN0cmVhbUZyb21GRChmZCk7RlMuY2xvc2Uoc3RyZWFtKTtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybiBlLmVycm5vfX1mdW5jdGlvbiBkb1JlYWR2KHN0cmVhbSxpb3YsaW92Y250LG9mZnNldCl7dmFyIHJldD0wO2Zvcih2YXIgaT0wO2k8aW92Y250O2krKyl7dmFyIHB0cj1IRUFQVTMyW2lvdj4+Ml07dmFyIGxlbj1IRUFQVTMyW2lvdis0Pj4yXTtpb3YrPTg7dmFyIGN1cnI9RlMucmVhZChzdHJlYW0sSEVBUDgscHRyLGxlbixvZmZzZXQpO2lmKGN1cnI8MClyZXR1cm4tMTtyZXQrPWN1cnI7aWYoY3VycjxsZW4pYnJlYWt9cmV0dXJuIHJldH1mdW5jdGlvbiBfZmRfcmVhZChmZCxpb3YsaW92Y250LHBudW0pe3RyeXt2YXIgc3RyZWFtPVNZU0NBTExTLmdldFN0cmVhbUZyb21GRChmZCk7dmFyIG51bT1kb1JlYWR2KHN0cmVhbSxpb3YsaW92Y250KTtIRUFQMzJbcG51bT4+Ml09bnVtO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIF9mZF9zZWVrKGZkLG9mZnNldF9sb3csb2Zmc2V0X2hpZ2gsd2hlbmNlLG5ld09mZnNldCl7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTt2YXIgSElHSF9PRkZTRVQ9NDI5NDk2NzI5Njt2YXIgb2Zmc2V0PW9mZnNldF9oaWdoKkhJR0hfT0ZGU0VUKyhvZmZzZXRfbG93Pj4+MCk7dmFyIERPVUJMRV9MSU1JVD05MDA3MTk5MjU0NzQwOTkyO2lmKG9mZnNldDw9LURPVUJMRV9MSU1JVHx8b2Zmc2V0Pj1ET1VCTEVfTElNSVQpe3JldHVybiA2MX1GUy5sbHNlZWsoc3RyZWFtLG9mZnNldCx3aGVuY2UpO3RlbXBJNjQ9W3N0cmVhbS5wb3NpdGlvbj4+PjAsKHRlbXBEb3VibGU9c3RyZWFtLnBvc2l0aW9uLCtNYXRoLmFicyh0ZW1wRG91YmxlKT49MT90ZW1wRG91YmxlPjA/KE1hdGgubWluKCtNYXRoLmZsb29yKHRlbXBEb3VibGUvNDI5NDk2NzI5NiksNDI5NDk2NzI5NSl8MCk+Pj4wOn5+K01hdGguY2VpbCgodGVtcERvdWJsZS0rKH5+dGVtcERvdWJsZT4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCldLEhFQVAzMltuZXdPZmZzZXQ+PjJdPXRlbXBJNjRbMF0sSEVBUDMyW25ld09mZnNldCs0Pj4yXT10ZW1wSTY0WzFdO2lmKHN0cmVhbS5nZXRkZW50cyYmb2Zmc2V0PT09MCYmd2hlbmNlPT09MClzdHJlYW0uZ2V0ZGVudHM9bnVsbDtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUgaW5zdGFuY2VvZiBGUy5FcnJub0Vycm9yKSl0aHJvdyBlO3JldHVybiBlLmVycm5vfX1mdW5jdGlvbiBfZmRfc3luYyhmZCl7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTtpZihzdHJlYW0uc3RyZWFtX29wcyYmc3RyZWFtLnN0cmVhbV9vcHMuZnN5bmMpe3JldHVybi1zdHJlYW0uc3RyZWFtX29wcy5mc3luYyhzdHJlYW0pfXJldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIGRvV3JpdGV2KHN0cmVhbSxpb3YsaW92Y250LG9mZnNldCl7dmFyIHJldD0wO2Zvcih2YXIgaT0wO2k8aW92Y250O2krKyl7dmFyIHB0cj1IRUFQVTMyW2lvdj4+Ml07dmFyIGxlbj1IRUFQVTMyW2lvdis0Pj4yXTtpb3YrPTg7dmFyIGN1cnI9RlMud3JpdGUoc3RyZWFtLEhFQVA4LHB0cixsZW4sb2Zmc2V0KTtpZihjdXJyPDApcmV0dXJuLTE7cmV0Kz1jdXJyfXJldHVybiByZXR9ZnVuY3Rpb24gX2ZkX3dyaXRlKGZkLGlvdixpb3ZjbnQscG51bSl7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTt2YXIgbnVtPWRvV3JpdGV2KHN0cmVhbSxpb3YsaW92Y250KTtIRUFQMzJbcG51bT4+Ml09bnVtO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZSBpbnN0YW5jZW9mIEZTLkVycm5vRXJyb3IpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIF9nZXRUZW1wUmV0MCgpe3JldHVybiBnZXRUZW1wUmV0MCgpfWZ1bmN0aW9uIF9nZXRlbnRyb3B5KGJ1ZmZlcixzaXplKXtpZighX2dldGVudHJvcHkucmFuZG9tRGV2aWNlKXtfZ2V0ZW50cm9weS5yYW5kb21EZXZpY2U9Z2V0UmFuZG9tRGV2aWNlKCl9Zm9yKHZhciBpPTA7aTxzaXplO2krKyl7SEVBUDhbYnVmZmVyK2k+PjBdPV9nZXRlbnRyb3B5LnJhbmRvbURldmljZSgpfXJldHVybiAwfWZ1bmN0aW9uIF9zZXRUZW1wUmV0MCh2YWwpe3NldFRlbXBSZXQwKHZhbCl9ZnVuY3Rpb24gX19pc0xlYXBZZWFyKHllYXIpe3JldHVybiB5ZWFyJTQ9PT0wJiYoeWVhciUxMDAhPT0wfHx5ZWFyJTQwMD09PTApfWZ1bmN0aW9uIF9fYXJyYXlTdW0oYXJyYXksaW5kZXgpe3ZhciBzdW09MDtmb3IodmFyIGk9MDtpPD1pbmRleDtzdW0rPWFycmF5W2krK10pe31yZXR1cm4gc3VtfXZhciBfX01PTlRIX0RBWVNfTEVBUD1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdO3ZhciBfX01PTlRIX0RBWVNfUkVHVUxBUj1bMzEsMjgsMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdO2Z1bmN0aW9uIF9fYWRkRGF5cyhkYXRlLGRheXMpe3ZhciBuZXdEYXRlPW5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKTt3aGlsZShkYXlzPjApe3ZhciBsZWFwPV9faXNMZWFwWWVhcihuZXdEYXRlLmdldEZ1bGxZZWFyKCkpO3ZhciBjdXJyZW50TW9udGg9bmV3RGF0ZS5nZXRNb250aCgpO3ZhciBkYXlzSW5DdXJyZW50TW9udGg9KGxlYXA/X19NT05USF9EQVlTX0xFQVA6X19NT05USF9EQVlTX1JFR1VMQVIpW2N1cnJlbnRNb250aF07aWYoZGF5cz5kYXlzSW5DdXJyZW50TW9udGgtbmV3RGF0ZS5nZXREYXRlKCkpe2RheXMtPWRheXNJbkN1cnJlbnRNb250aC1uZXdEYXRlLmdldERhdGUoKSsxO25ld0RhdGUuc2V0RGF0ZSgxKTtpZihjdXJyZW50TW9udGg8MTEpe25ld0RhdGUuc2V0TW9udGgoY3VycmVudE1vbnRoKzEpfWVsc2V7bmV3RGF0ZS5zZXRNb250aCgwKTtuZXdEYXRlLnNldEZ1bGxZZWFyKG5ld0RhdGUuZ2V0RnVsbFllYXIoKSsxKX19ZWxzZXtuZXdEYXRlLnNldERhdGUobmV3RGF0ZS5nZXREYXRlKCkrZGF5cyk7cmV0dXJuIG5ld0RhdGV9fXJldHVybiBuZXdEYXRlfWZ1bmN0aW9uIF9zdHJmdGltZShzLG1heHNpemUsZm9ybWF0LHRtKXt2YXIgdG1fem9uZT1IRUFQMzJbdG0rNDA+PjJdO3ZhciBkYXRlPXt0bV9zZWM6SEVBUDMyW3RtPj4yXSx0bV9taW46SEVBUDMyW3RtKzQ+PjJdLHRtX2hvdXI6SEVBUDMyW3RtKzg+PjJdLHRtX21kYXk6SEVBUDMyW3RtKzEyPj4yXSx0bV9tb246SEVBUDMyW3RtKzE2Pj4yXSx0bV95ZWFyOkhFQVAzMlt0bSsyMD4+Ml0sdG1fd2RheTpIRUFQMzJbdG0rMjQ+PjJdLHRtX3lkYXk6SEVBUDMyW3RtKzI4Pj4yXSx0bV9pc2RzdDpIRUFQMzJbdG0rMzI+PjJdLHRtX2dtdG9mZjpIRUFQMzJbdG0rMzY+PjJdLHRtX3pvbmU6dG1fem9uZT9VVEY4VG9TdHJpbmcodG1fem9uZSk6IiJ9O3ZhciBwYXR0ZXJuPVVURjhUb1N0cmluZyhmb3JtYXQpO3ZhciBFWFBBTlNJT05fUlVMRVNfMT17IiVjIjoiJWEgJWIgJWQgJUg6JU06JVMgJVkiLCIlRCI6IiVtLyVkLyV5IiwiJUYiOiIlWS0lbS0lZCIsIiVoIjoiJWIiLCIlciI6IiVJOiVNOiVTICVwIiwiJVIiOiIlSDolTSIsIiVUIjoiJUg6JU06JVMiLCIleCI6IiVtLyVkLyV5IiwiJVgiOiIlSDolTTolUyIsIiVFYyI6IiVjIiwiJUVDIjoiJUMiLCIlRXgiOiIlbS8lZC8leSIsIiVFWCI6IiVIOiVNOiVTIiwiJUV5IjoiJXkiLCIlRVkiOiIlWSIsIiVPZCI6IiVkIiwiJU9lIjoiJWUiLCIlT0giOiIlSCIsIiVPSSI6IiVJIiwiJU9tIjoiJW0iLCIlT00iOiIlTSIsIiVPUyI6IiVTIiwiJU91IjoiJXUiLCIlT1UiOiIlVSIsIiVPViI6IiVWIiwiJU93IjoiJXciLCIlT1ciOiIlVyIsIiVPeSI6IiV5In07Zm9yKHZhciBydWxlIGluIEVYUEFOU0lPTl9SVUxFU18xKXtwYXR0ZXJuPXBhdHRlcm4ucmVwbGFjZShuZXcgUmVnRXhwKHJ1bGUsImciKSxFWFBBTlNJT05fUlVMRVNfMVtydWxlXSl9dmFyIFdFRUtEQVlTPVsiU3VuZGF5IiwiTW9uZGF5IiwiVHVlc2RheSIsIldlZG5lc2RheSIsIlRodXJzZGF5IiwiRnJpZGF5IiwiU2F0dXJkYXkiXTt2YXIgTU9OVEhTPVsiSmFudWFyeSIsIkZlYnJ1YXJ5IiwiTWFyY2giLCJBcHJpbCIsIk1heSIsIkp1bmUiLCJKdWx5IiwiQXVndXN0IiwiU2VwdGVtYmVyIiwiT2N0b2JlciIsIk5vdmVtYmVyIiwiRGVjZW1iZXIiXTtmdW5jdGlvbiBsZWFkaW5nU29tZXRoaW5nKHZhbHVlLGRpZ2l0cyxjaGFyYWN0ZXIpe3ZhciBzdHI9dHlwZW9mIHZhbHVlPT0ibnVtYmVyIj92YWx1ZS50b1N0cmluZygpOnZhbHVlfHwiIjt3aGlsZShzdHIubGVuZ3RoPGRpZ2l0cyl7c3RyPWNoYXJhY3RlclswXStzdHJ9cmV0dXJuIHN0cn1mdW5jdGlvbiBsZWFkaW5nTnVsbHModmFsdWUsZGlnaXRzKXtyZXR1cm4gbGVhZGluZ1NvbWV0aGluZyh2YWx1ZSxkaWdpdHMsIjAiKX1mdW5jdGlvbiBjb21wYXJlQnlEYXkoZGF0ZTEsZGF0ZTIpe2Z1bmN0aW9uIHNnbih2YWx1ZSl7cmV0dXJuIHZhbHVlPDA/LTE6dmFsdWU+MD8xOjB9dmFyIGNvbXBhcmU7aWYoKGNvbXBhcmU9c2duKGRhdGUxLmdldEZ1bGxZZWFyKCktZGF0ZTIuZ2V0RnVsbFllYXIoKSkpPT09MCl7aWYoKGNvbXBhcmU9c2duKGRhdGUxLmdldE1vbnRoKCktZGF0ZTIuZ2V0TW9udGgoKSkpPT09MCl7Y29tcGFyZT1zZ24oZGF0ZTEuZ2V0RGF0ZSgpLWRhdGUyLmdldERhdGUoKSl9fXJldHVybiBjb21wYXJlfWZ1bmN0aW9uIGdldEZpcnN0V2Vla1N0YXJ0RGF0ZShqYW5Gb3VydGgpe3N3aXRjaChqYW5Gb3VydGguZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCktMSwxMSwyOSk7Y2FzZSAxOnJldHVybiBqYW5Gb3VydGg7Y2FzZSAyOnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCksMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLDAsMSk7Y2FzZSA1OnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKS0xLDExLDMxKTtjYXNlIDY6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBnZXRXZWVrQmFzZWRZZWFyKGRhdGUpe3ZhciB0aGlzRGF0ZT1fX2FkZERheXMobmV3IERhdGUoZGF0ZS50bV95ZWFyKzE5MDAsMCwxKSxkYXRlLnRtX3lkYXkpO3ZhciBqYW5Gb3VydGhUaGlzWWVhcj1uZXcgRGF0ZSh0aGlzRGF0ZS5nZXRGdWxsWWVhcigpLDAsNCk7dmFyIGphbkZvdXJ0aE5leHRZZWFyPW5ldyBEYXRlKHRoaXNEYXRlLmdldEZ1bGxZZWFyKCkrMSwwLDQpO3ZhciBmaXJzdFdlZWtTdGFydFRoaXNZZWFyPWdldEZpcnN0V2Vla1N0YXJ0RGF0ZShqYW5Gb3VydGhUaGlzWWVhcik7dmFyIGZpcnN0V2Vla1N0YXJ0TmV4dFllYXI9Z2V0Rmlyc3RXZWVrU3RhcnREYXRlKGphbkZvdXJ0aE5leHRZZWFyKTtpZihjb21wYXJlQnlEYXkoZmlyc3RXZWVrU3RhcnRUaGlzWWVhcix0aGlzRGF0ZSk8PTApe2lmKGNvbXBhcmVCeURheShmaXJzdFdlZWtTdGFydE5leHRZZWFyLHRoaXNEYXRlKTw9MCl7cmV0dXJuIHRoaXNEYXRlLmdldEZ1bGxZZWFyKCkrMX1lbHNle3JldHVybiB0aGlzRGF0ZS5nZXRGdWxsWWVhcigpfX1lbHNle3JldHVybiB0aGlzRGF0ZS5nZXRGdWxsWWVhcigpLTF9fXZhciBFWFBBTlNJT05fUlVMRVNfMj17IiVhIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gV0VFS0RBWVNbZGF0ZS50bV93ZGF5XS5zdWJzdHJpbmcoMCwzKX0sIiVBIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gV0VFS0RBWVNbZGF0ZS50bV93ZGF5XX0sIiViIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gTU9OVEhTW2RhdGUudG1fbW9uXS5zdWJzdHJpbmcoMCwzKX0sIiVCIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gTU9OVEhTW2RhdGUudG1fbW9uXX0sIiVDIjpmdW5jdGlvbihkYXRlKXt2YXIgeWVhcj1kYXRlLnRtX3llYXIrMTkwMDtyZXR1cm4gbGVhZGluZ051bGxzKHllYXIvMTAwfDAsMil9LCIlZCI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGxlYWRpbmdOdWxscyhkYXRlLnRtX21kYXksMil9LCIlZSI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGxlYWRpbmdTb21ldGhpbmcoZGF0ZS50bV9tZGF5LDIsIiAiKX0sIiVnIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gZ2V0V2Vla0Jhc2VkWWVhcihkYXRlKS50b1N0cmluZygpLnN1YnN0cmluZygyKX0sIiVHIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gZ2V0V2Vla0Jhc2VkWWVhcihkYXRlKX0sIiVIIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gbGVhZGluZ051bGxzKGRhdGUudG1faG91ciwyKX0sIiVJIjpmdW5jdGlvbihkYXRlKXt2YXIgdHdlbHZlSG91cj1kYXRlLnRtX2hvdXI7aWYodHdlbHZlSG91cj09MCl0d2VsdmVIb3VyPTEyO2Vsc2UgaWYodHdlbHZlSG91cj4xMil0d2VsdmVIb3VyLT0xMjtyZXR1cm4gbGVhZGluZ051bGxzKHR3ZWx2ZUhvdXIsMil9LCIlaiI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGxlYWRpbmdOdWxscyhkYXRlLnRtX21kYXkrX19hcnJheVN1bShfX2lzTGVhcFllYXIoZGF0ZS50bV95ZWFyKzE5MDApP19fTU9OVEhfREFZU19MRUFQOl9fTU9OVEhfREFZU19SRUdVTEFSLGRhdGUudG1fbW9uLTEpLDMpfSwiJW0iOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBsZWFkaW5nTnVsbHMoZGF0ZS50bV9tb24rMSwyKX0sIiVNIjpmdW5jdGlvbihkYXRlKXtyZXR1cm4gbGVhZGluZ051bGxzKGRhdGUudG1fbWluLDIpfSwiJW4iOmZ1bmN0aW9uKCl7cmV0dXJuIlxuIn0sIiVwIjpmdW5jdGlvbihkYXRlKXtpZihkYXRlLnRtX2hvdXI+PTAmJmRhdGUudG1faG91cjwxMil7cmV0dXJuIkFNIn1lbHNle3JldHVybiJQTSJ9fSwiJVMiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBsZWFkaW5nTnVsbHMoZGF0ZS50bV9zZWMsMil9LCIldCI6ZnVuY3Rpb24oKXtyZXR1cm4iXHQifSwiJXUiOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBkYXRlLnRtX3dkYXl8fDd9LCIlVSI6ZnVuY3Rpb24oZGF0ZSl7dmFyIGRheXM9ZGF0ZS50bV95ZGF5KzctZGF0ZS50bV93ZGF5O3JldHVybiBsZWFkaW5nTnVsbHMoTWF0aC5mbG9vcihkYXlzLzcpLDIpfSwiJVYiOmZ1bmN0aW9uKGRhdGUpe3ZhciB2YWw9TWF0aC5mbG9vcigoZGF0ZS50bV95ZGF5KzctKGRhdGUudG1fd2RheSs2KSU3KS83KTtpZigoZGF0ZS50bV93ZGF5KzM3MS1kYXRlLnRtX3lkYXktMiklNzw9Mil7dmFsKyt9aWYoIXZhbCl7dmFsPTUyO3ZhciBkZWMzMT0oZGF0ZS50bV93ZGF5KzctZGF0ZS50bV95ZGF5LTEpJTc7aWYoZGVjMzE9PTR8fGRlYzMxPT01JiZfX2lzTGVhcFllYXIoZGF0ZS50bV95ZWFyJTQwMC0xKSl7dmFsKyt9fWVsc2UgaWYodmFsPT01Myl7dmFyIGphbjE9KGRhdGUudG1fd2RheSszNzEtZGF0ZS50bV95ZGF5KSU3O2lmKGphbjEhPTQmJihqYW4xIT0zfHwhX19pc0xlYXBZZWFyKGRhdGUudG1feWVhcikpKXZhbD0xfXJldHVybiBsZWFkaW5nTnVsbHModmFsLDIpfSwiJXciOmZ1bmN0aW9uKGRhdGUpe3JldHVybiBkYXRlLnRtX3dkYXl9LCIlVyI6ZnVuY3Rpb24oZGF0ZSl7dmFyIGRheXM9ZGF0ZS50bV95ZGF5KzctKGRhdGUudG1fd2RheSs2KSU3O3JldHVybiBsZWFkaW5nTnVsbHMoTWF0aC5mbG9vcihkYXlzLzcpLDIpfSwiJXkiOmZ1bmN0aW9uKGRhdGUpe3JldHVybihkYXRlLnRtX3llYXIrMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMil9LCIlWSI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGRhdGUudG1feWVhcisxOTAwfSwiJXoiOmZ1bmN0aW9uKGRhdGUpe3ZhciBvZmY9ZGF0ZS50bV9nbXRvZmY7dmFyIGFoZWFkPW9mZj49MDtvZmY9TWF0aC5hYnMob2ZmKS82MDtvZmY9b2ZmLzYwKjEwMCtvZmYlNjA7cmV0dXJuKGFoZWFkPyIrIjoiLSIpK1N0cmluZygiMDAwMCIrb2ZmKS5zbGljZSgtNCl9LCIlWiI6ZnVuY3Rpb24oZGF0ZSl7cmV0dXJuIGRhdGUudG1fem9uZX0sIiUlIjpmdW5jdGlvbigpe3JldHVybiIlIn19O3BhdHRlcm49cGF0dGVybi5yZXBsYWNlKC8lJS9nLCJcMFwwIik7Zm9yKHZhciBydWxlIGluIEVYUEFOU0lPTl9SVUxFU18yKXtpZihwYXR0ZXJuLmluY2x1ZGVzKHJ1bGUpKXtwYXR0ZXJuPXBhdHRlcm4ucmVwbGFjZShuZXcgUmVnRXhwKHJ1bGUsImciKSxFWFBBTlNJT05fUlVMRVNfMltydWxlXShkYXRlKSl9fXBhdHRlcm49cGF0dGVybi5yZXBsYWNlKC9cMFwwL2csIiUiKTt2YXIgYnl0ZXM9aW50QXJyYXlGcm9tU3RyaW5nKHBhdHRlcm4sZmFsc2UpO2lmKGJ5dGVzLmxlbmd0aD5tYXhzaXplKXtyZXR1cm4gMH13cml0ZUFycmF5VG9NZW1vcnkoYnl0ZXMscyk7cmV0dXJuIGJ5dGVzLmxlbmd0aC0xfWZ1bmN0aW9uIF9zdHJmdGltZV9sKHMsbWF4c2l6ZSxmb3JtYXQsdG0pe3JldHVybiBfc3RyZnRpbWUocyxtYXhzaXplLGZvcm1hdCx0bSl9dmFyIEZTTm9kZT1mdW5jdGlvbihwYXJlbnQsbmFtZSxtb2RlLHJkZXYpe2lmKCFwYXJlbnQpe3BhcmVudD10aGlzfXRoaXMucGFyZW50PXBhcmVudDt0aGlzLm1vdW50PXBhcmVudC5tb3VudDt0aGlzLm1vdW50ZWQ9bnVsbDt0aGlzLmlkPUZTLm5leHRJbm9kZSsrO3RoaXMubmFtZT1uYW1lO3RoaXMubW9kZT1tb2RlO3RoaXMubm9kZV9vcHM9e307dGhpcy5zdHJlYW1fb3BzPXt9O3RoaXMucmRldj1yZGV2fTt2YXIgcmVhZE1vZGU9MjkyfDczO3ZhciB3cml0ZU1vZGU9MTQ2O09iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZTTm9kZS5wcm90b3R5cGUse3JlYWQ6e2dldDpmdW5jdGlvbigpe3JldHVybih0aGlzLm1vZGUmcmVhZE1vZGUpPT09cmVhZE1vZGV9LHNldDpmdW5jdGlvbih2YWwpe3ZhbD90aGlzLm1vZGV8PXJlYWRNb2RlOnRoaXMubW9kZSY9fnJlYWRNb2RlfX0sd3JpdGU6e2dldDpmdW5jdGlvbigpe3JldHVybih0aGlzLm1vZGUmd3JpdGVNb2RlKT09PXdyaXRlTW9kZX0sc2V0OmZ1bmN0aW9uKHZhbCl7dmFsP3RoaXMubW9kZXw9d3JpdGVNb2RlOnRoaXMubW9kZSY9fndyaXRlTW9kZX19LGlzRm9sZGVyOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gRlMuaXNEaXIodGhpcy5tb2RlKX19LGlzRGV2aWNlOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gRlMuaXNDaHJkZXYodGhpcy5tb2RlKX19fSk7RlMuRlNOb2RlPUZTTm9kZTtGUy5zdGF0aWNJbml0KCk7ZW1iaW5kX2luaXRfY2hhckNvZGVzKCk7QmluZGluZ0Vycm9yPU1vZHVsZVsiQmluZGluZ0Vycm9yIl09ZXh0ZW5kRXJyb3IoRXJyb3IsIkJpbmRpbmdFcnJvciIpO0ludGVybmFsRXJyb3I9TW9kdWxlWyJJbnRlcm5hbEVycm9yIl09ZXh0ZW5kRXJyb3IoRXJyb3IsIkludGVybmFsRXJyb3IiKTtpbml0X0NsYXNzSGFuZGxlKCk7aW5pdF9lbWJpbmQoKTtpbml0X1JlZ2lzdGVyZWRQb2ludGVyKCk7VW5ib3VuZFR5cGVFcnJvcj1Nb2R1bGVbIlVuYm91bmRUeXBlRXJyb3IiXT1leHRlbmRFcnJvcihFcnJvciwiVW5ib3VuZFR5cGVFcnJvciIpO2luaXRfZW12YWwoKTtmdW5jdGlvbiBpbnRBcnJheUZyb21TdHJpbmcoc3RyaW5neSxkb250QWRkTnVsbCxsZW5ndGgpe3ZhciBsZW49bGVuZ3RoPjA/bGVuZ3RoOmxlbmd0aEJ5dGVzVVRGOChzdHJpbmd5KSsxO3ZhciB1OGFycmF5PW5ldyBBcnJheShsZW4pO3ZhciBudW1CeXRlc1dyaXR0ZW49c3RyaW5nVG9VVEY4QXJyYXkoc3RyaW5neSx1OGFycmF5LDAsdThhcnJheS5sZW5ndGgpO2lmKGRvbnRBZGROdWxsKXU4YXJyYXkubGVuZ3RoPW51bUJ5dGVzV3JpdHRlbjtyZXR1cm4gdThhcnJheX12YXIgYXNtTGlicmFyeUFyZz17ImEiOl9fX2Fzc2VydF9mYWlsLCJrIjpfX19jeGFfYWxsb2NhdGVfZXhjZXB0aW9uLCJ0IjpfX19jeGFfYmVnaW5fY2F0Y2gsImlhIjpfX19jeGFfY3VycmVudF9wcmltYXJ5X2V4Y2VwdGlvbiwiUiI6X19fY3hhX2RlY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQsInYiOl9fX2N4YV9lbmRfY2F0Y2gsImQiOl9fX2N4YV9maW5kX21hdGNoaW5nX2NhdGNoXzIsImkiOl9fX2N4YV9maW5kX21hdGNoaW5nX2NhdGNoXzMsInIiOl9fX2N4YV9mcmVlX2V4Y2VwdGlvbiwiUSI6X19fY3hhX2luY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQsIlgiOl9fX2N4YV9yZXRocm93LCJoYSI6X19fY3hhX3JldGhyb3dfcHJpbWFyeV9leGNlcHRpb24sInAiOl9fX2N4YV90aHJvdywiamEiOl9fX2N4YV91bmNhdWdodF9leGNlcHRpb25zLCJnIjpfX19yZXN1bWVFeGNlcHRpb24sIndhIjpfX19zeXNjYWxsX2ZzdGF0NjQsImNhIjpfX19zeXNjYWxsX2Z0cnVuY2F0ZTY0LCJ0YSI6X19fc3lzY2FsbF9sc3RhdDY0LCJ1YSI6X19fc3lzY2FsbF9uZXdmc3RhdGF0LCJ4YSI6X19fc3lzY2FsbF9vcGVuYXQsIm5hIjpfX19zeXNjYWxsX3JlbmFtZWF0LCJ2YSI6X19fc3lzY2FsbF9zdGF0NjQsImxhIjpfX19zeXNjYWxsX3VubGlua2F0LCJBYSI6X19kbGluaXQsIkNhIjpfX2Rsb3Blbl9qcywiQmEiOl9fZGxzeW1fanMsImRhIjpfX2VtYmluZF9yZWdpc3Rlcl9iaWdpbnQsIkVhIjpfX2VtYmluZF9yZWdpc3Rlcl9ib29sLCJNYSI6X19lbWJpbmRfcmVnaXN0ZXJfY2xhc3MsIkxhIjpfX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19jb25zdHJ1Y3RvciwidyI6X19lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfZnVuY3Rpb24sIkRhIjpfX2VtYmluZF9yZWdpc3Rlcl9lbXZhbCwiVyI6X19lbWJpbmRfcmVnaXN0ZXJfZmxvYXQsInkiOl9fZW1iaW5kX3JlZ2lzdGVyX2ludGVnZXIsInMiOl9fZW1iaW5kX3JlZ2lzdGVyX21lbW9yeV92aWV3LCJWIjpfX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nLCJMIjpfX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZywiRmEiOl9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQsIlQiOl9fZW1zY3JpcHRlbl9kYXRlX25vdywieWEiOl9fZW1zY3JpcHRlbl9nZXRfbm93X2lzX21vbm90b25pYywiS2EiOl9fZW12YWxfZGVjcmVmLCJiYSI6X19lbXZhbF9pbmNyZWYsIkciOl9fZW12YWxfdGFrZV92YWx1ZSwib2EiOl9fbW1hcF9qcywicGEiOl9fbXVubWFwX2pzLCJiIjpfYWJvcnQsIm1hIjpfZW1zY3JpcHRlbl9nZXRfaGVhcF9tYXgsIksiOl9lbXNjcmlwdGVuX2dldF9ub3csInphIjpfZW1zY3JpcHRlbl9tZW1jcHlfYmlnLCJrYSI6X2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXAsInFhIjpfZW52aXJvbl9nZXQsInJhIjpfZW52aXJvbl9zaXplc19nZXQsIkdhIjpfZXhpdCwiVSI6X2ZkX2Nsb3NlLCJTIjpfZmRfcmVhZCwiYWEiOl9mZF9zZWVrLCJzYSI6X2ZkX3N5bmMsIkoiOl9mZF93cml0ZSwiYyI6X2dldFRlbXBSZXQwLCJlYSI6X2dldGVudHJvcHksIk4iOmludm9rZV9kaWlpLCJKYSI6aW52b2tlX2ZpLCJPIjppbnZva2VfZmlpaSwicSI6aW52b2tlX2ksImYiOmludm9rZV9paSwiSGEiOmludm9rZV9paWRpaSwiZSI6aW52b2tlX2lpaSwibCI6aW52b2tlX2lpaWksIm0iOmludm9rZV9paWlpaSwiZ2EiOmludm9rZV9paWlpaWQsIkMiOmludm9rZV9paWlpaWksIngiOmludm9rZV9paWlpaWlpLCJQIjppbnZva2VfaWlpaWlpaWksIkYiOmludm9rZV9paWlpaWlpaWlpaWksIiQiOmludm9rZV9qLCJfIjppbnZva2VfamlpaWksIm4iOmludm9rZV92LCJqIjppbnZva2VfdmksImgiOmludm9rZV92aWksIkEiOmludm9rZV92aWlkLCJNIjppbnZva2VfdmlpZGksIm8iOmludm9rZV92aWlpLCJJYSI6aW52b2tlX3ZpaWlkaWlpLCJIIjppbnZva2VfdmlpaWksIlkiOmludm9rZV92aWlpaWRpLCJaIjppbnZva2VfdmlpaWlpLCJ1IjppbnZva2VfdmlpaWlpaWksIkQiOmludm9rZV92aWlpaWlpaWRpLCJJIjppbnZva2VfdmlpaWlpaWlpLCJCIjppbnZva2VfdmlpaWlpaWlpaWksIkUiOmludm9rZV92aWlpaWlpaWlpaWlpaWlpLCJ6Ijpfc2V0VGVtcFJldDAsImZhIjpfc3RyZnRpbWVfbH07dmFyIGFzbT1jcmVhdGVXYXNtKCk7dmFyIF9fX3dhc21fY2FsbF9jdG9ycz1Nb2R1bGVbIl9fX3dhc21fY2FsbF9jdG9ycyJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX3dhc21fY2FsbF9jdG9ycz1Nb2R1bGVbIl9fX3dhc21fY2FsbF9jdG9ycyJdPU1vZHVsZVsiYXNtIl1bIk9hIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9tYWxsb2M9TW9kdWxlWyJfbWFsbG9jIl09ZnVuY3Rpb24oKXtyZXR1cm4oX21hbGxvYz1Nb2R1bGVbIl9tYWxsb2MiXT1Nb2R1bGVbImFzbSJdWyJRYSJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfZnJlZT1Nb2R1bGVbIl9mcmVlIl09ZnVuY3Rpb24oKXtyZXR1cm4oX2ZyZWU9TW9kdWxlWyJfZnJlZSJdPU1vZHVsZVsiYXNtIl1bIlJhIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX2dldFR5cGVOYW1lPU1vZHVsZVsiX19fZ2V0VHlwZU5hbWUiXT1mdW5jdGlvbigpe3JldHVybihfX19nZXRUeXBlTmFtZT1Nb2R1bGVbIl9fX2dldFR5cGVOYW1lIl09TW9kdWxlWyJhc20iXVsiU2EiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX19fZW1iaW5kX3JlZ2lzdGVyX25hdGl2ZV9hbmRfYnVpbHRpbl90eXBlcz1Nb2R1bGVbIl9fX2VtYmluZF9yZWdpc3Rlcl9uYXRpdmVfYW5kX2J1aWx0aW5fdHlwZXMiXT1mdW5jdGlvbigpe3JldHVybihfX19lbWJpbmRfcmVnaXN0ZXJfbmF0aXZlX2FuZF9idWlsdGluX3R5cGVzPU1vZHVsZVsiX19fZW1iaW5kX3JlZ2lzdGVyX25hdGl2ZV9hbmRfYnVpbHRpbl90eXBlcyJdPU1vZHVsZVsiYXNtIl1bIlRhIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX3N0ZGlvX2V4aXQ9TW9kdWxlWyJfX19zdGRpb19leGl0Il09ZnVuY3Rpb24oKXtyZXR1cm4oX19fc3RkaW9fZXhpdD1Nb2R1bGVbIl9fX3N0ZGlvX2V4aXQiXT1Nb2R1bGVbImFzbSJdWyJVYSJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX19mdW5jc19vbl9leGl0PU1vZHVsZVsiX19fZnVuY3Nfb25fZXhpdCJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX2Z1bmNzX29uX2V4aXQ9TW9kdWxlWyJfX19mdW5jc19vbl9leGl0Il09TW9kdWxlWyJhc20iXVsiVmEiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgX2Vtc2NyaXB0ZW5fYnVpbHRpbl9tZW1hbGlnbj1Nb2R1bGVbIl9lbXNjcmlwdGVuX2J1aWx0aW5fbWVtYWxpZ24iXT1mdW5jdGlvbigpe3JldHVybihfZW1zY3JpcHRlbl9idWlsdGluX21lbWFsaWduPU1vZHVsZVsiX2Vtc2NyaXB0ZW5fYnVpbHRpbl9tZW1hbGlnbiJdPU1vZHVsZVsiYXNtIl1bIldhIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9zZXRUaHJldz1Nb2R1bGVbIl9zZXRUaHJldyJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9zZXRUaHJldz1Nb2R1bGVbIl9zZXRUaHJldyJdPU1vZHVsZVsiYXNtIl1bIlhhIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIHN0YWNrU2F2ZT1Nb2R1bGVbInN0YWNrU2F2ZSJdPWZ1bmN0aW9uKCl7cmV0dXJuKHN0YWNrU2F2ZT1Nb2R1bGVbInN0YWNrU2F2ZSJdPU1vZHVsZVsiYXNtIl1bIllhIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIHN0YWNrUmVzdG9yZT1Nb2R1bGVbInN0YWNrUmVzdG9yZSJdPWZ1bmN0aW9uKCl7cmV0dXJuKHN0YWNrUmVzdG9yZT1Nb2R1bGVbInN0YWNrUmVzdG9yZSJdPU1vZHVsZVsiYXNtIl1bIlphIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIF9fX2N4YV9jYW5fY2F0Y2g9TW9kdWxlWyJfX19jeGFfY2FuX2NhdGNoIl09ZnVuY3Rpb24oKXtyZXR1cm4oX19fY3hhX2Nhbl9jYXRjaD1Nb2R1bGVbIl9fX2N4YV9jYW5fY2F0Y2giXT1Nb2R1bGVbImFzbSJdWyJfYSJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBfX19jeGFfaXNfcG9pbnRlcl90eXBlPU1vZHVsZVsiX19fY3hhX2lzX3BvaW50ZXJfdHlwZSJdPWZ1bmN0aW9uKCl7cmV0dXJuKF9fX2N4YV9pc19wb2ludGVyX3R5cGU9TW9kdWxlWyJfX19jeGFfaXNfcG9pbnRlcl90eXBlIl09TW9kdWxlWyJhc20iXVsiJGEiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9paWlpaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWoiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2lpaWlqPU1vZHVsZVsiZHluQ2FsbF9paWlpaiJdPU1vZHVsZVsiYXNtIl1bImFiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfamlpPU1vZHVsZVsiZHluQ2FsbF9qaWkiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2ppaT1Nb2R1bGVbImR5bkNhbGxfamlpIl09TW9kdWxlWyJhc20iXVsiYmIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9qamo9TW9kdWxlWyJkeW5DYWxsX2pqaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfampqPU1vZHVsZVsiZHluQ2FsbF9qamoiXT1Nb2R1bGVbImFzbSJdWyJjYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2pqaT1Nb2R1bGVbImR5bkNhbGxfamppIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qamk9TW9kdWxlWyJkeW5DYWxsX2pqaSJdPU1vZHVsZVsiYXNtIl1bImRiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfamlpaT1Nb2R1bGVbImR5bkNhbGxfamlpaSJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfamlpaT1Nb2R1bGVbImR5bkNhbGxfamlpaSJdPU1vZHVsZVsiYXNtIl1bImViIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfaWlpaWpqPU1vZHVsZVsiZHluQ2FsbF9paWlpamoiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2lpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWpqIl09TW9kdWxlWyJhc20iXVsiZmIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF92aWlqaj1Nb2R1bGVbImR5bkNhbGxfdmlpamoiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX3ZpaWpqPU1vZHVsZVsiZHluQ2FsbF92aWlqaiJdPU1vZHVsZVsiYXNtIl1bImdiIl0pLmFwcGx5KG51bGwsYXJndW1lbnRzKX07dmFyIGR5bkNhbGxfdmlpaWpqamo9TW9kdWxlWyJkeW5DYWxsX3ZpaWlqampqIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF92aWlpampqaj1Nb2R1bGVbImR5bkNhbGxfdmlpaWpqamoiXT1Nb2R1bGVbImFzbSJdWyJoYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2lpamppaWlpPU1vZHVsZVsiZHluQ2FsbF9paWpqaWlpaSJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlqamlpaWk9TW9kdWxlWyJkeW5DYWxsX2lpamppaWlpIl09TW9kdWxlWyJhc20iXVsiaWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9qaWppPU1vZHVsZVsiZHluQ2FsbF9qaWppIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qaWppPU1vZHVsZVsiZHluQ2FsbF9qaWppIl09TW9kdWxlWyJhc20iXVsiamIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9qPU1vZHVsZVsiZHluQ2FsbF9qIl09ZnVuY3Rpb24oKXtyZXR1cm4oZHluQ2FsbF9qPU1vZHVsZVsiZHluQ2FsbF9qIl09TW9kdWxlWyJhc20iXVsia2IiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF92aWlqaWk9TW9kdWxlWyJkeW5DYWxsX3ZpaWppaSJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfdmlpamlpPU1vZHVsZVsiZHluQ2FsbF92aWlqaWkiXT1Nb2R1bGVbImFzbSJdWyJsYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2ppaWlpPU1vZHVsZVsiZHluQ2FsbF9qaWlpaSJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfamlpaWk9TW9kdWxlWyJkeW5DYWxsX2ppaWlpIl09TW9kdWxlWyJhc20iXVsibWIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTt2YXIgZHluQ2FsbF9paWlpaWo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlpaWlqPU1vZHVsZVsiZHluQ2FsbF9paWlpaWoiXT1Nb2R1bGVbImFzbSJdWyJuYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2lpaWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpamoiXT1mdW5jdGlvbigpe3JldHVybihkeW5DYWxsX2lpaWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpamoiXT1Nb2R1bGVbImFzbSJdWyJvYiJdKS5hcHBseShudWxsLGFyZ3VtZW50cyl9O3ZhciBkeW5DYWxsX2lpaWlpaWpqPU1vZHVsZVsiZHluQ2FsbF9paWlpaWlqaiJdPWZ1bmN0aW9uKCl7cmV0dXJuKGR5bkNhbGxfaWlpaWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpaWpqIl09TW9kdWxlWyJhc20iXVsicGIiXSkuYXBwbHkobnVsbCxhcmd1bWVudHMpfTtmdW5jdGlvbiBpbnZva2VfaWkoaW5kZXgsYTEpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWkoaW5kZXgsYTEsYTIpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aShpbmRleCxhMSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaShpbmRleCxhMSxhMixhMyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaShpbmRleCxhMSxhMil7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaShpbmRleCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpKGluZGV4LGExLGEyLGEzKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9maShpbmRleCxhMSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaWlpZGkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3YoaW5kZXgpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWRpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpZGlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpZChpbmRleCxhMSxhMixhMyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNixhNyxhOCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWRpKGluZGV4LGExLGEyLGEzLGE0KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlkaWkoaW5kZXgsYTEsYTIsYTMsYTQpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpaWQoaW5kZXgsYTEsYTIsYTMsYTQsYTUpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2ZpaWkoaW5kZXgsYTEsYTIsYTMpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9kaWlpKGluZGV4LGExLGEyLGEzKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYsYTcpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2lpaWlpaWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSxhMTAsYTExKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTksYTEwLGExMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSxhMTApe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaWlpaWlpaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCxhMTEsYTEyLGExMyxhMTQsYTE1KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSxhMTAsYTExLGExMixhMTMsYTE0LGExNSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9qKGluZGV4KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBkeW5DYWxsX2ooaW5kZXgpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfamlpaWkoaW5kZXgsYTEsYTIsYTMsYTQpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGR5bkNhbGxfamlpaWkoaW5kZXgsYTEsYTIsYTMsYTQpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX12YXIgY2FsbGVkUnVuO2Z1bmN0aW9uIEV4aXRTdGF0dXMoc3RhdHVzKXt0aGlzLm5hbWU9IkV4aXRTdGF0dXMiO3RoaXMubWVzc2FnZT0iUHJvZ3JhbSB0ZXJtaW5hdGVkIHdpdGggZXhpdCgiK3N0YXR1cysiKSI7dGhpcy5zdGF0dXM9c3RhdHVzfWRlcGVuZGVuY2llc0Z1bGZpbGxlZD1mdW5jdGlvbiBydW5DYWxsZXIoKXtpZighY2FsbGVkUnVuKXJ1bigpO2lmKCFjYWxsZWRSdW4pZGVwZW5kZW5jaWVzRnVsZmlsbGVkPXJ1bkNhbGxlcn07ZnVuY3Rpb24gcnVuKGFyZ3Mpe2FyZ3M9YXJnc3x8YXJndW1lbnRzXztpZihydW5EZXBlbmRlbmNpZXM+MCl7cmV0dXJufXByZVJ1bigpO2lmKHJ1bkRlcGVuZGVuY2llcz4wKXtyZXR1cm59ZnVuY3Rpb24gZG9SdW4oKXtpZihjYWxsZWRSdW4pcmV0dXJuO2NhbGxlZFJ1bj10cnVlO01vZHVsZVsiY2FsbGVkUnVuIl09dHJ1ZTtpZihBQk9SVClyZXR1cm47aW5pdFJ1bnRpbWUoKTtyZWFkeVByb21pc2VSZXNvbHZlKE1vZHVsZSk7aWYoTW9kdWxlWyJvblJ1bnRpbWVJbml0aWFsaXplZCJdKU1vZHVsZVsib25SdW50aW1lSW5pdGlhbGl6ZWQiXSgpO3Bvc3RSdW4oKX1pZihNb2R1bGVbInNldFN0YXR1cyJdKXtNb2R1bGVbInNldFN0YXR1cyJdKCJSdW5uaW5nLi4uIik7c2V0VGltZW91dChmdW5jdGlvbigpe3NldFRpbWVvdXQoZnVuY3Rpb24oKXtNb2R1bGVbInNldFN0YXR1cyJdKCIiKX0sMSk7ZG9SdW4oKX0sMSl9ZWxzZXtkb1J1bigpfX1Nb2R1bGVbInJ1biJdPXJ1bjtmdW5jdGlvbiBleGl0KHN0YXR1cyxpbXBsaWNpdCl7RVhJVFNUQVRVUz1zdGF0dXM7aWYoIWtlZXBSdW50aW1lQWxpdmUoKSl7ZXhpdFJ1bnRpbWUoKX1wcm9jRXhpdChzdGF0dXMpfWZ1bmN0aW9uIHByb2NFeGl0KGNvZGUpe0VYSVRTVEFUVVM9Y29kZTtpZigha2VlcFJ1bnRpbWVBbGl2ZSgpKXtpZihNb2R1bGVbIm9uRXhpdCJdKU1vZHVsZVsib25FeGl0Il0oY29kZSk7QUJPUlQ9dHJ1ZX1xdWl0Xyhjb2RlLG5ldyBFeGl0U3RhdHVzKGNvZGUpKX1pZihNb2R1bGVbInByZUluaXQiXSl7aWYodHlwZW9mIE1vZHVsZVsicHJlSW5pdCJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlSW5pdCJdPVtNb2R1bGVbInByZUluaXQiXV07d2hpbGUoTW9kdWxlWyJwcmVJbml0Il0ubGVuZ3RoPjApe01vZHVsZVsicHJlSW5pdCJdLnBvcCgpKCl9fXJ1bigpOwoKCiAgcmV0dXJuIE1vZHVsZS5yZWFkeQp9Cik7Cn0pKCk7CmNyZWF0ZVdhc21Nb25vSW5zdGFuY2UgPSBNb2R1bGU7IH0gICAgIWZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO3ZhciBlPU9iamVjdC5kZWZpbmVQcm9wZXJ0eSxhPSh0LHIsbik9PigoKHQscixuKT0+e3IgaW4gdD9lKHQscix7ZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6bn0pOnRbcl09bn0pKHQsInN5bWJvbCIhPXR5cGVvZiByP3IrIiI6cixuKSxuKTtjbGFzcyBse31hKGwsInVwZGF0ZXMiLHt0cmFuc2Zvcm1lcl9uZXc6Ik5ldyB0cmFuc2Zvcm1lciIsdHJhbnNmb3JtZXJfbnVsbDoiTnVsbCB0cmFuc2Zvcm1lciJ9KSxhKGwsImVycm9ycyIse3RyYW5zZm9ybWVyX25vbmU6Ik5vIHRyYW5zZm9ybWVycyBwcm92aWRlZCIsdHJhbnNmb3JtZXJfc3RhcnQ6IkNhbm5vdCBzdGFydCB0cmFuc2Zvcm1lciIsdHJhbnNmb3JtZXJfdHJhbnNmb3JtOiJDYW5ub3QgdHJhbnNmb3JtIGZyYW1lIix0cmFuc2Zvcm1lcl9mbHVzaDoiQ2Fubm90IGZsdXNoIHRyYW5zZm9ybWVyIixyZWFkYWJsZV9udWxsOiJSZWFkYWJsZSBpcyBudWxsIix3cml0YWJsZV9udWxsOiJXcml0YWJsZSBpcyBudWxsIn0pO2NvbnN0IHQ9bmV3IFdlYWtNYXAscj1uZXcgV2Vha01hcCxuPW5ldyBXZWFrTWFwLGM9U3ltYm9sKCJhbnlQcm9kdWNlciIpLGY9UHJvbWlzZS5yZXNvbHZlKCksaD1TeW1ib2woImxpc3RlbmVyQWRkZWQiKSx1PVN5bWJvbCgibGlzdGVuZXJSZW1vdmVkIik7bGV0IGQ9ITE7ZnVuY3Rpb24gZyhlKXtpZigic3RyaW5nIiE9dHlwZW9mIGUmJiJzeW1ib2wiIT10eXBlb2YgZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJldmVudE5hbWUgbXVzdCBiZSBhIHN0cmluZyBvciBhIHN5bWJvbCIpfWZ1bmN0aW9uIFQoZSl7aWYoImZ1bmN0aW9uIiE9dHlwZW9mIGUpdGhyb3cgbmV3IFR5cGVFcnJvcigibGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uIil9ZnVuY3Rpb24gXyhlLHQpe2NvbnN0IG49ci5nZXQoZSk7cmV0dXJuIG4uaGFzKHQpfHxuLnNldCh0LG5ldyBTZXQpLG4uZ2V0KHQpfWZ1bmN0aW9uIGIoZSx0KXtjb25zdCByPSJzdHJpbmciPT10eXBlb2YgdHx8InN5bWJvbCI9PXR5cGVvZiB0P3Q6YyxmPW4uZ2V0KGUpO3JldHVybiBmLmhhcyhyKXx8Zi5zZXQocixuZXcgU2V0KSxmLmdldChyKX1mdW5jdGlvbiAkKGUsdCl7dD1BcnJheS5pc0FycmF5KHQpP3Q6W3RdO2xldCByPSExLHM9KCk9Pnt9LG49W107Y29uc3QgYz17ZW5xdWV1ZShlKXtuLnB1c2goZSkscygpfSxmaW5pc2goKXtyPSEwLHMoKX19O2Zvcihjb25zdCBmIG9mIHQpYihlLGYpLmFkZChjKTtyZXR1cm57YXN5bmMgbmV4dCgpe3JldHVybiBuPzA9PT1uLmxlbmd0aD9yPyhuPXZvaWQgMCx0aGlzLm5leHQoKSk6KGF3YWl0IG5ldyBQcm9taXNlKChlPT57cz1lfSkpLHRoaXMubmV4dCgpKTp7ZG9uZTohMSx2YWx1ZTphd2FpdCBuLnNoaWZ0KCl9Ontkb25lOiEwfX0sYXN5bmMgcmV0dXJuKHIpe249dm9pZCAwO2Zvcihjb25zdCBuIG9mIHQpYihlLG4pLmRlbGV0ZShjKTtyZXR1cm4gcygpLGFyZ3VtZW50cy5sZW5ndGg+MD97ZG9uZTohMCx2YWx1ZTphd2FpdCByfTp7ZG9uZTohMH19LFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKXtyZXR1cm4gdGhpc319fWZ1bmN0aW9uIEgoZSl7aWYodm9pZCAwPT09ZSlyZXR1cm4gcDtpZighQXJyYXkuaXNBcnJheShlKSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgbWV0aG9kTmFtZXNgIG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncyIpO2Zvcihjb25zdCB0IG9mIGUpaWYoIXAuaW5jbHVkZXModCkpdGhyb3cic3RyaW5nIiE9dHlwZW9mIHQ/bmV3IFR5cGVFcnJvcigiYG1ldGhvZE5hbWVzYCBlbGVtZW50IG11c3QgYmUgYSBzdHJpbmciKTpuZXcgRXJyb3IoYCR7dH0gaXMgbm90IEVtaXR0ZXJ5IG1ldGhvZGApO3JldHVybiBlfWNvbnN0IEk9ZT0+ZT09PWh8fGU9PT11O2NsYXNzIG17c3RhdGljIG1peGluKGUsdCl7cmV0dXJuIHQ9SCh0KSxyPT57aWYoImZ1bmN0aW9uIiE9dHlwZW9mIHIpdGhyb3cgbmV3IFR5cGVFcnJvcigiYHRhcmdldGAgbXVzdCBiZSBmdW5jdGlvbiIpO2Zvcihjb25zdCBlIG9mIHQpaWYodm9pZCAwIT09ci5wcm90b3R5cGVbZV0pdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvcGVydHkgXGAke2V9XGAgYWxyZWFkeSBleGlzdHMgb24gXGB0YXJnZXRcYGApO09iamVjdC5kZWZpbmVQcm9wZXJ0eShyLnByb3RvdHlwZSxlLHtlbnVtZXJhYmxlOiExLGdldDpmdW5jdGlvbiBvKCl7cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLGUse2VudW1lcmFibGU6ITEsdmFsdWU6bmV3IG19KSx0aGlzW2VdfX0pO2NvbnN0IGk9dD0+ZnVuY3Rpb24oLi4ucil7cmV0dXJuIHRoaXNbZV1bdF0oLi4ucil9O2Zvcihjb25zdCBlIG9mIHQpT2JqZWN0LmRlZmluZVByb3BlcnR5KHIucHJvdG90eXBlLGUse2VudW1lcmFibGU6ITEsdmFsdWU6aShlKX0pO3JldHVybiByfX1zdGF0aWMgZ2V0IGlzRGVidWdFbmFibGVkKCl7aWYoIm9iamVjdCIhPXR5cGVvZiBwcm9jZXNzKXJldHVybiBkO2NvbnN0e2VudjplfT1wcm9jZXNzfHx7ZW52Ont9fTtyZXR1cm4iZW1pdHRlcnkiPT09ZS5ERUJVR3x8IioiPT09ZS5ERUJVR3x8ZH1zdGF0aWMgc2V0IGlzRGVidWdFbmFibGVkKGUpe2Q9ZX1jb25zdHJ1Y3RvcihlPXt9KXt0LnNldCh0aGlzLG5ldyBTZXQpLHIuc2V0KHRoaXMsbmV3IE1hcCksbi5zZXQodGhpcyxuZXcgTWFwKSx0aGlzLmRlYnVnPWUuZGVidWd8fHt9LHZvaWQgMD09PXRoaXMuZGVidWcuZW5hYmxlZCYmKHRoaXMuZGVidWcuZW5hYmxlZD0hMSksdGhpcy5kZWJ1Zy5sb2dnZXJ8fCh0aGlzLmRlYnVnLmxvZ2dlcj0oZSx0LHIsbik9Pnt0cnl7bj1KU09OLnN0cmluZ2lmeShuKX1jYXRjaHtuPWBPYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIGtleXMgZmFpbGVkIHRvIHN0cmluZ2lmeTogJHtPYmplY3Qua2V5cyhuKS5qb2luKCIsIil9YH0ic3ltYm9sIj09dHlwZW9mIHImJihyPXIudG9TdHJpbmcoKSk7Y29uc3QgYz1uZXcgRGF0ZSxmPWAke2MuZ2V0SG91cnMoKX06JHtjLmdldE1pbnV0ZXMoKX06JHtjLmdldFNlY29uZHMoKX0uJHtjLmdldE1pbGxpc2Vjb25kcygpfWA7Y29uc29sZS5sb2coYFske2Z9XVtlbWl0dGVyeToke2V9XVske3R9XSBFdmVudCBOYW1lOiAke3J9XG5cdGRhdGE6ICR7bn1gKX0pfWxvZ0lmRGVidWdFbmFibGVkKGUsdCxyKXsobS5pc0RlYnVnRW5hYmxlZHx8dGhpcy5kZWJ1Zy5lbmFibGVkKSYmdGhpcy5kZWJ1Zy5sb2dnZXIoZSx0aGlzLmRlYnVnLm5hbWUsdCxyKX1vbihlLHQpe1QodCksZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCByIG9mIGUpZyhyKSxfKHRoaXMscikuYWRkKHQpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInN1YnNjcmliZSIscix2b2lkIDApLEkocil8fHRoaXMuZW1pdChoLHtldmVudE5hbWU6cixsaXN0ZW5lcjp0fSk7cmV0dXJuIHRoaXMub2ZmLmJpbmQodGhpcyxlLHQpfW9mZihlLHQpe1QodCksZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCByIG9mIGUpZyhyKSxfKHRoaXMscikuZGVsZXRlKHQpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInVuc3Vic2NyaWJlIixyLHZvaWQgMCksSShyKXx8dGhpcy5lbWl0KHUse2V2ZW50TmFtZTpyLGxpc3RlbmVyOnR9KX1vbmNlKGUpe3JldHVybiBuZXcgUHJvbWlzZSgodD0+e2NvbnN0IHI9dGhpcy5vbihlLChlPT57cigpLHQoZSl9KSl9KSl9ZXZlbnRzKGUpe2U9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgdCBvZiBlKWcodCk7cmV0dXJuICQodGhpcyxlKX1hc3luYyBlbWl0KGUscil7ZyhlKSx0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJlbWl0IixlLHIpLGZ1bmN0aW9uIHEoZSx0LHIpe2NvbnN0IGY9bi5nZXQoZSk7aWYoZi5oYXModCkpZm9yKGNvbnN0IG4gb2YgZi5nZXQodCkpbi5lbnF1ZXVlKHIpO2lmKGYuaGFzKGMpKXtjb25zdCBlPVByb21pc2UuYWxsKFt0LHJdKTtmb3IoY29uc3QgdCBvZiBmLmdldChjKSl0LmVucXVldWUoZSl9fSh0aGlzLGUscik7Y29uc3QgaD1fKHRoaXMsZSksdT10LmdldCh0aGlzKSxkPVsuLi5oXSxwPUkoZSk/W106Wy4uLnVdO2F3YWl0IGYsYXdhaXQgUHJvbWlzZS5hbGwoWy4uLmQubWFwKChhc3luYyBlPT57aWYoaC5oYXMoZSkpcmV0dXJuIGUocil9KSksLi4ucC5tYXAoKGFzeW5jIHQ9PntpZih1Lmhhcyh0KSlyZXR1cm4gdChlLHIpfSkpXSl9YXN5bmMgZW1pdFNlcmlhbChlLHIpe2coZSksdGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgiZW1pdFNlcmlhbCIsZSxyKTtjb25zdCBuPV8odGhpcyxlKSxjPXQuZ2V0KHRoaXMpLGg9Wy4uLm5dLHU9Wy4uLmNdO2F3YWl0IGY7Zm9yKGNvbnN0IHQgb2YgaCluLmhhcyh0KSYmYXdhaXQgdChyKTtmb3IoY29uc3QgdCBvZiB1KWMuaGFzKHQpJiZhd2FpdCB0KGUscil9b25BbnkoZSl7cmV0dXJuIFQoZSksdGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgic3Vic2NyaWJlQW55Iix2b2lkIDAsdm9pZCAwKSx0LmdldCh0aGlzKS5hZGQoZSksdGhpcy5lbWl0KGgse2xpc3RlbmVyOmV9KSx0aGlzLm9mZkFueS5iaW5kKHRoaXMsZSl9YW55RXZlbnQoKXtyZXR1cm4gJCh0aGlzKX1vZmZBbnkoZSl7VChlKSx0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJ1bnN1YnNjcmliZUFueSIsdm9pZCAwLHZvaWQgMCksdGhpcy5lbWl0KHUse2xpc3RlbmVyOmV9KSx0LmdldCh0aGlzKS5kZWxldGUoZSl9Y2xlYXJMaXN0ZW5lcnMoZSl7ZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCBjIG9mIGUpaWYodGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgiY2xlYXIiLGMsdm9pZCAwKSwic3RyaW5nIj09dHlwZW9mIGN8fCJzeW1ib2wiPT10eXBlb2YgYyl7Xyh0aGlzLGMpLmNsZWFyKCk7Y29uc3QgZT1iKHRoaXMsYyk7Zm9yKGNvbnN0IHQgb2YgZSl0LmZpbmlzaCgpO2UuY2xlYXIoKX1lbHNle3QuZ2V0KHRoaXMpLmNsZWFyKCk7Zm9yKGNvbnN0IGUgb2Ygci5nZXQodGhpcykudmFsdWVzKCkpZS5jbGVhcigpO2Zvcihjb25zdCBlIG9mIG4uZ2V0KHRoaXMpLnZhbHVlcygpKXtmb3IoY29uc3QgdCBvZiBlKXQuZmluaXNoKCk7ZS5jbGVhcigpfX19bGlzdGVuZXJDb3VudChlKXtlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07bGV0IGM9MDtmb3IoY29uc3QgZiBvZiBlKWlmKCJzdHJpbmciIT10eXBlb2YgZil7dHlwZW9mIGY8InUiJiZnKGYpLGMrPXQuZ2V0KHRoaXMpLnNpemU7Zm9yKGNvbnN0IGUgb2Ygci5nZXQodGhpcykudmFsdWVzKCkpYys9ZS5zaXplO2Zvcihjb25zdCBlIG9mIG4uZ2V0KHRoaXMpLnZhbHVlcygpKWMrPWUuc2l6ZX1lbHNlIGMrPXQuZ2V0KHRoaXMpLnNpemUrXyh0aGlzLGYpLnNpemUrYih0aGlzLGYpLnNpemUrYih0aGlzKS5zaXplO3JldHVybiBjfWJpbmRNZXRob2RzKGUsdCl7aWYoIm9iamVjdCIhPXR5cGVvZiBlfHxudWxsPT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgdGFyZ2V0YCBtdXN0IGJlIGFuIG9iamVjdCIpO3Q9SCh0KTtmb3IoY29uc3QgciBvZiB0KXtpZih2b2lkIDAhPT1lW3JdKXRocm93IG5ldyBFcnJvcihgVGhlIHByb3BlcnR5IFxgJHtyfVxgIGFscmVhZHkgZXhpc3RzIG9uIFxgdGFyZ2V0XGBgKTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLHtlbnVtZXJhYmxlOiExLHZhbHVlOnRoaXNbcl0uYmluZCh0aGlzKX0pfX19Y29uc3QgcD1PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtLnByb3RvdHlwZSkuZmlsdGVyKChlPT4iY29uc3RydWN0b3IiIT09ZSkpO09iamVjdC5kZWZpbmVQcm9wZXJ0eShtLCJsaXN0ZW5lckFkZGVkIix7dmFsdWU6aCx3cml0YWJsZTohMSxlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtLCJsaXN0ZW5lclJlbW92ZWQiLHt2YWx1ZTp1LHdyaXRhYmxlOiExLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiExfSk7dmFyIHk9bTtmdW5jdGlvbiB2KGUpe3JldHVybiBmdW5jdGlvbiBYKGUpe2lmKGZ1bmN0aW9uIEooZSl7cmV0dXJuIm9iamVjdCI9PXR5cGVvZiBlJiZudWxsIT09ZSYmIm1lc3NhZ2UiaW4gZSYmInN0cmluZyI9PXR5cGVvZiBlLm1lc3NhZ2V9KGUpKXJldHVybiBlO3RyeXtyZXR1cm4gbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KGUpKX1jYXRjaHtyZXR1cm4gbmV3IEVycm9yKFN0cmluZyhlKSl9fShlKS5tZXNzYWdlfXZhciBFPU9iamVjdC5kZWZpbmVQcm9wZXJ0eSxOPShlLHQscik9PigoKGUsdCxyKT0+e3QgaW4gZT9FKGUsdCx7ZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6cn0pOmVbdF09cn0pKGUsInN5bWJvbCIhPXR5cGVvZiB0P3QrIiI6dCxyKSxyKTtsZXQgQTtjb25zdCBTPW5ldyBVaW50OEFycmF5KDE2KTtmdW5jdGlvbiBpZSgpe2lmKCFBJiYoQT10eXBlb2YgY3J5cHRvPCJ1IiYmY3J5cHRvLmdldFJhbmRvbVZhbHVlcyYmY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKGNyeXB0byksIUEpKXRocm93IG5ldyBFcnJvcigiY3J5cHRvLmdldFJhbmRvbVZhbHVlcygpIG5vdCBzdXBwb3J0ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQjZ2V0cmFuZG9tdmFsdWVzLW5vdC1zdXBwb3J0ZWQiKTtyZXR1cm4gQShTKX1jb25zdCBPPVtdO2ZvcihsZXQgQ2U9MDtDZTwyNTY7KytDZSlPLnB1c2goKENlKzI1NikudG9TdHJpbmcoMTYpLnNsaWNlKDEpKTtjb25zdCBNPXtyYW5kb21VVUlEOnR5cGVvZiBjcnlwdG88InUiJiZjcnlwdG8ucmFuZG9tVVVJRCYmY3J5cHRvLnJhbmRvbVVVSUQuYmluZChjcnlwdG8pfTtmdW5jdGlvbiBjZShlLHQscil7aWYoTS5yYW5kb21VVUlEJiYhdCYmIWUpcmV0dXJuIE0ucmFuZG9tVVVJRCgpO2NvbnN0IG49KGU9ZXx8e30pLnJhbmRvbXx8KGUucm5nfHxpZSkoKTtpZihuWzZdPTE1Jm5bNl18NjQsbls4XT02MyZuWzhdfDEyOCx0KXtyPXJ8fDA7Zm9yKGxldCBlPTA7ZTwxNjsrK2UpdFtyK2VdPW5bZV07cmV0dXJuIHR9cmV0dXJuIGZ1bmN0aW9uIG5lKGUsdD0wKXtyZXR1cm4oT1tlW3QrMF1dK09bZVt0KzFdXStPW2VbdCsyXV0rT1tlW3QrM11dKyItIitPW2VbdCs0XV0rT1tlW3QrNV1dKyItIitPW2VbdCs2XV0rT1tlW3QrN11dKyItIitPW2VbdCs4XV0rT1tlW3QrOV1dKyItIitPW2VbdCsxMF1dK09bZVt0KzExXV0rT1tlW3QrMTJdXStPW2VbdCsxM11dK09bZVt0KzE0XV0rT1tlW3QrMTVdXSkudG9Mb3dlckNhc2UoKX0obil9ZnVuY3Rpb24gVyhlLHQpe2dsb2JhbFRoaXMudm9uYWdlfHwoZ2xvYmFsVGhpcy52b25hZ2U9e30pLGdsb2JhbFRoaXMudm9uYWdlLndvcmtlcml6ZXJ8fChnbG9iYWxUaGlzLnZvbmFnZS53b3JrZXJpemVyPXt9KTtsZXQgcj1nbG9iYWxUaGlzLnZvbmFnZS53b3JrZXJpemVyO3JldHVybiByW2VdfHwocltlXT10KSxyW2VdfWNvbnN0IGs9VygiZ2xvYmFscyIse30pO3ZhciBSPShlPT4oZS5JTklUPSJJTklUIixlLkZPUldBUkQ9IkZPUldBUkQiLGUuVEVSTUlOQVRFPSJURVJNSU5BVEUiLGUuR0xPQkFMU19TWU5DPSJHTE9CQUxTX1NZTkMiLGUpKShSfHx7fSk7ZnVuY3Rpb24gaihlKXtyZXR1cm5bSW1hZ2VCaXRtYXAsUmVhZGFibGVTdHJlYW0sV3JpdGFibGVTdHJlYW1dLnNvbWUoKHQ9PmUgaW5zdGFuY2VvZiB0KSl9bGV0IHg9MDtmdW5jdGlvbiBsZShlLHQscixuLGMpe2NvbnN0IGY9eCsrO3JldHVybiBlLnBvc3RNZXNzYWdlKHtpZDpmLHR5cGU6dCxmdW5jdGlvbk5hbWU6cixhcmdzOm59LG4uZmlsdGVyKChlPT5qKGUpKSkpLG5ldyBQcm9taXNlKChlPT57bnVsbD09Y3x8Yy5zZXQoZixlKX0pKX1mdW5jdGlvbiB3KGUsdCl7Y29uc3R7aWQ6cix0eXBlOm59PWUsYz1BcnJheS5pc0FycmF5KHQpP3Q6W3RdO3Bvc3RNZXNzYWdlKHtpZDpyLHR5cGU6bixyZXN1bHQ6dH0sYy5maWx0ZXIoKGU9PmooZSkpKSl9Y29uc3QgTD1XKCJ3b3JrZXJpemVkIix7fSk7ZnVuY3Rpb24gQigpe3JldHVybiB0eXBlb2YgV29ya2VyR2xvYmFsU2NvcGU8InUiJiZzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGV9ZnVuY3Rpb24gUChlLHQpe2lmKEFycmF5LmlzQXJyYXkodCkpdC5zcGxpY2UoMCx0Lmxlbmd0aCk7ZWxzZSBpZigib2JqZWN0Ij09dHlwZW9mIHQpZm9yKGNvbnN0IHIgaW4gdClkZWxldGUgdFtyXTtmb3IoY29uc3QgciBpbiBlKUFycmF5LmlzQXJyYXkoZVtyXSk/KHRbcl09W10sUChlW3JdLHRbcl0pKToib2JqZWN0Ij09dHlwZW9mIGVbcl0/KHRbcl09e30sUChlW3JdLHRbcl0pKTp0W3JdPWVbcl19Y29uc3Qgej1XKCJyZWdpc3RlcmVkV29ya2VycyIse30pO2Z1bmN0aW9uIHllKGUsdCl7cmV0dXJuIGtbZV18fChrW2VdPXQpLFsoKT0+a1tlXSxhc3luYyB0PT57a1tlXT10LGF3YWl0IGFzeW5jIGZ1bmN0aW9uIHVlKCl7aWYoQigpKXcoe3R5cGU6Ui5HTE9CQUxTX1NZTkN9LGspO2Vsc2V7Y29uc3QgZT1bXTtmb3IoY29uc3QgdCBpbiBMKXtjb25zdHt3b3JrZXI6cixyZXNvbHZlcnM6bn09TFt0XS53b3JrZXJDb250ZXh0O3ImJmUucHVzaChsZShyLFIuR0xPQkFMU19TWU5DLCIiLFtrXSxuKSl9YXdhaXQgUHJvbWlzZS5hbGwoZSl9fSgpfV19QigpJiZmdW5jdGlvbiBfZSgpe2NvbnN0IGU9e307b25tZXNzYWdlPWFzeW5jIHQ9Pntjb25zdCByPXQuZGF0YTtzd2l0Y2goci50eXBlKXtjYXNlIFIuSU5JVDohZnVuY3Rpb24gZGUoZSx0KXtpZighZS5hcmdzKXRocm93Ik1pc3NpbmcgY2xhc3NOYW1lIHdoaWxlIGluaXRpYWxpemluZyB3b3JrZXIiO2NvbnN0W3Isbl09ZS5hcmdzLGM9eltyXTtpZighYyl0aHJvd2B1bmtub3duIHdvcmtlciBjbGFzcyAke3J9YDt0Lmluc3RhbmNlPW5ldyBjKGUuYXJncy5zbGljZSgxKSksUChuLGspLHcoZSx2b2lkIDAhPT10eXBlb2YgdC5pbnN0YW5jZSl9KHIsZSk7YnJlYWs7Y2FzZSBSLkZPUldBUkQ6IWFzeW5jIGZ1bmN0aW9uIGhlKGUsdCl7Y29uc3R7ZnVuY3Rpb25OYW1lOnIsYXJnczpufT1lO2lmKCF0Lmluc3RhbmNlKXRocm93Imluc3RhbmNlIG5vdCBpbml0aWFsaXplZCI7aWYoIXIpdGhyb3cibWlzc2luZyBmdW5jdGlvbiBuYW1lIHRvIGNhbGwiO2lmKCF0Lmluc3RhbmNlW3JdKXRocm93YHVuZGVmaW5lZCBmdW5jdGlvbiBbJHtyfV0gaW4gY2xhc3MgJHt0Lmluc3RhbmNlLmNvbnN0cnVjdG9yLndvcmtlcklkfWA7dyhlLGF3YWl0IHQuaW5zdGFuY2Vbcl0oLi4ubnVsbCE9bj9uOltdKSl9KHIsZSk7YnJlYWs7Y2FzZSBSLlRFUk1JTkFURTohYXN5bmMgZnVuY3Rpb24gbWUoZSx0KXtjb25zdHthcmdzOnJ9PWU7aWYoIXQuaW5zdGFuY2UpdGhyb3ciaW5zdGFuY2Ugbm90IGluaXRpYWxpemVkIjtsZXQgbjt0Lmluc3RhbmNlLnRlcm1pbmF0ZSYmKG49YXdhaXQgdC5pbnN0YW5jZS50ZXJtaW5hdGUoLi4ubnVsbCE9cj9yOltdKSksdyhlLG4pfShyLGUpO2JyZWFrO2Nhc2UgUi5HTE9CQUxTX1NZTkM6IWZ1bmN0aW9uIGdlKGUpe2lmKCFlLmFyZ3MpdGhyb3ciTWlzc2luZyBnbG9iYWxzIHdoaWxlIHN5bmNpbmciO1AoZS5hcmdzWzBdLGspLHcoZSx7fSl9KHIpfX19KCk7Y29uc3RbRixVXT1mdW5jdGlvbiBiZShlLHQpe3JldHVybiB5ZShlLHQpfSgibWV0YWRhdGEiKTtmdW5jdGlvbiBDKCl7cmV0dXJuIEYoKX1jbGFzcyBEe2NvbnN0cnVjdG9yKGUpe04odGhpcywidXVpZCIsY2UoKSksdGhpcy5jb25maWc9ZX1hc3luYyBzZW5kKGUpe3ZhciB0LHIsbjtjb25zdHthcHBJZDpjLHNvdXJjZVR5cGU6Zn09bnVsbCE9KHQ9QygpKT90Ont9O2lmKCFjfHwhZilyZXR1cm4ibWV0YWRhdGEgbWlzc2luZyI7Y29uc3QgaD1uZXcgQWJvcnRDb250cm9sbGVyLHU9c2V0VGltZW91dCgoKCk9PmguYWJvcnQoKSksMWU0KTtyZXR1cm4gYXdhaXQobnVsbCE9KG49bnVsbD09KHI9dGhpcy5jb25maWcpP3ZvaWQgMDpyLmZldGNoKT9uOmZldGNoKSh0aGlzLmdldFVybCgpLHttZXRob2Q6IlBPU1QiLGhlYWRlcnM6dGhpcy5nZXRIZWFkZXJzKCksYm9keTpKU09OLnN0cmluZ2lmeSh0aGlzLmJ1aWxkUmVwb3J0KGUpKSxzaWduYWw6aC5zaWduYWx9KSxjbGVhclRpbWVvdXQodSksInN1Y2Nlc3MifWdldFVybCgpe3ZhciBlO2xldCB0PW51bGwhPShlPUMoKS5wcm94eVVybCk/ZToiaHR0cHM6Ly8iO3JldHVybiB0Kz0oIi8iPT09dC5hdCgtMSk/IiI6Ii8iKSsiaGxnLnRva2JveC5jb20vcHJvZC9sb2dnaW5nL3ZjcF93ZWJydGMiLHR9Z2V0SGVhZGVycygpe3JldHVybnsiQ29udGVudC1UeXBlIjoiYXBwbGljYXRpb24vanNvbiJ9fWJ1aWxkUmVwb3J0KGUpe2NvbnN0IHQ9QygpO3JldHVybntndWlkOnRoaXMudXVpZCwuLi5lLGFwcGxpY2F0aW9uSWQ6dC5hcHBJZCx0aW1lc3RhbXA6RGF0ZS5ub3coKSxwcm94eVVybDp0LnByb3h5VXJsLHNvdXJjZTp0LnNvdXJjZVR5cGV9fX1jb25zdCBHPSIyLjAuMyI7Y2xhc3MgU2V7Y29uc3RydWN0b3IoZSl7YSh0aGlzLCJmcmFtZVRyYW5zZm9ybWVkQ291bnQiLDApLGEodGhpcywiZnJhbWVGcm9tU291cmNlQ291bnQiLDApLGEodGhpcywic3RhcnRBdCIsMCksYSh0aGlzLCJyZXBvcnRlciIpLHRoaXMuY29uZmlnPWUsdGhpcy5yZXBvcnRlcj1uZXcgRChlKX1hc3luYyBvbkZyYW1lRnJvbVNvdXJjZSgpe3RoaXMuZnJhbWVGcm9tU291cmNlQ291bnQrK31nZXQgZnBzKCl7Y29uc3R7c3RhcnRBdDplLGZyYW1lRnJvbVNvdXJjZUNvdW50OnR9PXRoaXM7cmV0dXJuIHQvKChEYXRlLm5vdygpLWUpLzFlMyl9YXN5bmMgb25GcmFtZVRyYW5zZm9ybWVkKGU9e30sdD0hMSl7MD09PXRoaXMuc3RhcnRBdCYmKHRoaXMuc3RhcnRBdD1EYXRlLm5vdygpKSx0aGlzLmZyYW1lVHJhbnNmb3JtZWRDb3VudCsrO2NvbnN0e3N0YXJ0QXQ6cixmcmFtZVRyYW5zZm9ybWVkQ291bnQ6bixmcmFtZUZyb21Tb3VyY2VDb3VudDpjfT10aGlzLGY9RGF0ZS5ub3coKSxoPShmLXIpLzFlMyx1PW4vaCxkPWMvaDtyZXR1cm4gdHx8dGhpcy5mcmFtZVRyYW5zZm9ybWVkQ291bnQ+PXRoaXMuY29uZmlnLmxvZ2dpbmdJbnRlcnZhbEZyYW1lQ291bnQ/KHRoaXMuZnJhbWVGcm9tU291cmNlQ291bnQ9MCx0aGlzLmZyYW1lVHJhbnNmb3JtZWRDb3VudD0wLHRoaXMuc3RhcnRBdD1mLHRoaXMucmVwb3J0ZXIuY29uZmlnPXRoaXMuY29uZmlnLHRoaXMucmVwb3J0ZXIuc2VuZCh7Li4udGhpcy5jb25maWcucmVwb3J0LHZhcmlhdGlvbjoiUW9TIixmcHM6ZCx0cmFuc2Zvcm1lZEZwczp1LGZyYW1lc1RyYW5zZm9ybWVkOm4sLi4uZX0pKToic3VjY2VzcyJ9fXZhciBRPShlPT4oZS5waXBlbGluZV9lbmRlZD0icGlwZWxpbmVfZW5kZWQiLGUucGlwZWxpbmVfZW5kZWRfd2l0aF9lcnJvcj0icGlwZWxpbmVfZW5kZWRfd2l0aF9lcnJvciIsZS5waXBlbGluZV9zdGFydGVkPSJwaXBlbGluZV9zdGFydGVkIixlLnBpcGVsaW5lX3N0YXJ0ZWRfd2l0aF9lcnJvcj0icGlwZWxpbmVfc3RhcnRlZF93aXRoX2Vycm9yIixlLnBpcGVsaW5lX3Jlc3RhcnRlZD0icGlwZWxpbmVfcmVzdGFydGVkIixlLnBpcGVsaW5lX3Jlc3RhcnRlZF93aXRoX2Vycm9yPSJwaXBlbGluZV9yZXN0YXJ0ZWRfd2l0aF9lcnJvciIsZSkpKFF8fHt9KTtjbGFzcyBQZSBleHRlbmRzIHl7Y29uc3RydWN0b3IoZSx0KXtzdXBlcigpLGEodGhpcywicmVwb3J0ZXJfIixuZXcgRCksYSh0aGlzLCJyZXBvcnRlclFvc18iLG5ldyBTZSh7bG9nZ2luZ0ludGVydmFsRnJhbWVDb3VudDo1MDAscmVwb3J0Ont2ZXJzaW9uOkd9fSkpLGEodGhpcywidHJhbnNmb3JtZXJUeXBlXyIpLGEodGhpcywidHJhbnNmb3JtZXJfIiksYSh0aGlzLCJzaG91bGRTdG9wXyIpLGEodGhpcywiaXNGbGFzaGVkXyIpLGEodGhpcywibWVkaWFUcmFuc2Zvcm1lclFvc1JlcG9ydFN0YXJ0VGltZXN0YW1wXyIpLGEodGhpcywidmlkZW9IZWlnaHRfIiksYSh0aGlzLCJ2aWRlb1dpZHRoXyIpLGEodGhpcywidHJhY2tFeHBlY3RlZFJhdGVfIiksYSh0aGlzLCJpbmRleF8iKSxhKHRoaXMsImNvbnRyb2xsZXJfIiksdGhpcy5pbmRleF89dCx0aGlzLnRyYW5zZm9ybWVyXz1lLHRoaXMuc2hvdWxkU3RvcF89ITEsdGhpcy5pc0ZsYXNoZWRfPSExLHRoaXMubWVkaWFUcmFuc2Zvcm1lclFvc1JlcG9ydFN0YXJ0VGltZXN0YW1wXz0wLHRoaXMudmlkZW9IZWlnaHRfPTAsdGhpcy52aWRlb1dpZHRoXz0wLHRoaXMudHJhY2tFeHBlY3RlZFJhdGVfPS0xLHRoaXMudHJhbnNmb3JtZXJUeXBlXz0iQ3VzdG9tIiwiZ2V0VHJhbnNmb3JtZXJUeXBlImluIGUmJih0aGlzLnRyYW5zZm9ybWVyVHlwZV89ZS5nZXRUcmFuc2Zvcm1lclR5cGUoKSksdGhpcy5yZXBvcnQoe3ZhcmlhdGlvbjoiQ3JlYXRlIn0pfXNldFRyYWNrRXhwZWN0ZWRSYXRlKGUpe3RoaXMudHJhY2tFeHBlY3RlZFJhdGVfPWV9YXN5bmMgc3RhcnQoZSl7aWYodGhpcy5jb250cm9sbGVyXz1lLHRoaXMudHJhbnNmb3JtZXJfJiYiZnVuY3Rpb24iPT10eXBlb2YgdGhpcy50cmFuc2Zvcm1lcl8uc3RhcnQpdHJ5e2F3YWl0IHRoaXMudHJhbnNmb3JtZXJfLnN0YXJ0KGUpfWNhdGNoKHQpe3RoaXMucmVwb3J0KHttZXNzYWdlOmwuZXJyb3JzLnRyYW5zZm9ybWVyX3N0YXJ0LHZhcmlhdGlvbjoiRXJyb3IiLGVycm9yOnYodCl9KTtjb25zdCBlPXtldmVudE1ldGFEYXRhOnt0cmFuc2Zvcm1lckluZGV4OnRoaXMuaW5kZXhffSxlcnJvcjp0LGZ1bmN0aW9uOiJzdGFydCJ9O3RoaXMuZW1pdCgiZXJyb3IiLGUpfX1hc3luYyB0cmFuc2Zvcm0oZSx0KXt2YXIgcixuLGMsZjtpZigwPT09dGhpcy5tZWRpYVRyYW5zZm9ybWVyUW9zUmVwb3J0U3RhcnRUaW1lc3RhbXBfJiYodGhpcy5tZWRpYVRyYW5zZm9ybWVyUW9zUmVwb3J0U3RhcnRUaW1lc3RhbXBfPURhdGUubm93KCkpLGUgaW5zdGFuY2VvZiBWaWRlb0ZyYW1lJiYodGhpcy52aWRlb0hlaWdodF89bnVsbCE9KHI9bnVsbD09ZT92b2lkIDA6ZS5kaXNwbGF5SGVpZ2h0KT9yOjAsdGhpcy52aWRlb1dpZHRoXz1udWxsIT0obj1udWxsPT1lP3ZvaWQgMDplLmRpc3BsYXlXaWR0aCk/bjowKSx0aGlzLnJlcG9ydGVyUW9zXy5vbkZyYW1lRnJvbVNvdXJjZSgpLHRoaXMudHJhbnNmb3JtZXJfKWlmKHRoaXMuc2hvdWxkU3RvcF8pY29uc29sZS53YXJuKCJbUGlwZWxpbmVdIGZsdXNoIGZyb20gdHJhbnNmb3JtIiksZS5jbG9zZSgpLHRoaXMuZmx1c2godCksdC50ZXJtaW5hdGUoKTtlbHNle3RyeXthd2FpdChudWxsPT0oZj0oYz10aGlzLnRyYW5zZm9ybWVyXykudHJhbnNmb3JtKT92b2lkIDA6Zi5jYWxsKGMsZSx0KSksdGhpcy5yZXBvcnRRb3MoKX1jYXRjaChoKXt0aGlzLnJlcG9ydCh7bWVzc2FnZTpsLmVycm9ycy50cmFuc2Zvcm1lcl90cmFuc2Zvcm0sdmFyaWF0aW9uOiJFcnJvciIsZXJyb3I6dihoKX0pO2NvbnN0IGU9e2V2ZW50TWV0YURhdGE6e3RyYW5zZm9ybWVySW5kZXg6dGhpcy5pbmRleF99LGVycm9yOmgsZnVuY3Rpb246InRyYW5zZm9ybSJ9O3RoaXMuZW1pdCgiZXJyb3IiLGUpfWlmKC0xIT10aGlzLnRyYWNrRXhwZWN0ZWRSYXRlXyYmLjgqdGhpcy50cmFja0V4cGVjdGVkUmF0ZV8+dGhpcy5yZXBvcnRlclFvc18uZnBzKXtjb25zdCBlPXtldmVudE1ldGFEYXRhOnt0cmFuc2Zvcm1lckluZGV4OnRoaXMuaW5kZXhffSx3YXJuaW5nVHlwZToiZnBzX2Ryb3AiLGRyb3BJbmZvOntyZXF1ZXN0ZWQ6dGhpcy50cmFja0V4cGVjdGVkUmF0ZV8sY3VycmVudDp0aGlzLnJlcG9ydGVyUW9zXy5mcHN9fTt0aGlzLmVtaXQoIndhcm4iLGUpfX19YXN5bmMgZmx1c2goZSl7aWYodGhpcy50cmFuc2Zvcm1lcl8mJiJmdW5jdGlvbiI9PXR5cGVvZiB0aGlzLnRyYW5zZm9ybWVyXy5mbHVzaCYmIXRoaXMuaXNGbGFzaGVkXyl7dGhpcy5pc0ZsYXNoZWRfPSEwO3RyeXthd2FpdCB0aGlzLnRyYW5zZm9ybWVyXy5mbHVzaChlKX1jYXRjaCh0KXt0aGlzLnJlcG9ydCh7bWVzc2FnZTpsLmVycm9ycy50cmFuc2Zvcm1lcl9mbHVzaCx2YXJpYXRpb246IkVycm9yIixlcnJvcjp2KHQpfSk7Y29uc3QgZT17ZXZlbnRNZXRhRGF0YTp7dHJhbnNmb3JtZXJJbmRleDp0aGlzLmluZGV4X30sZXJyb3I6dCxmdW5jdGlvbjoiZmx1c2gifTt0aGlzLmVtaXQoImVycm9yIixlKX19dGhpcy5yZXBvcnRRb3MoITApLHRoaXMucmVwb3J0KHt2YXJpYXRpb246IkRlbGV0ZSJ9KX1zdG9wKCl7Y29uc29sZS5sb2coIltQaXBlbGluZV0gU3RvcCBzdHJlYW0uIiksdGhpcy5jb250cm9sbGVyXyYmKHRoaXMuZmx1c2godGhpcy5jb250cm9sbGVyXyksdGhpcy5jb250cm9sbGVyXy50ZXJtaW5hdGUoKSksdGhpcy5zaG91bGRTdG9wXz0hMH1yZXBvcnQoZSl7dGhpcy5yZXBvcnRlcl8uc2VuZCh7dmVyc2lvbjpHLGFjdGlvbjoiTWVkaWFUcmFuc2Zvcm1lciIsdHJhbnNmb3JtZXJUeXBlOnRoaXMudHJhbnNmb3JtZXJUeXBlXywuLi5lfSl9cmVwb3J0UW9zKGU9ITEpe3RoaXMucmVwb3J0ZXJRb3NfLmNvbmZpZz17Li4udGhpcy5yZXBvcnRlclFvc18uY29uZmlnfSx0aGlzLnJlcG9ydGVyUW9zXy5vbkZyYW1lVHJhbnNmb3JtZWQoe3ZlcnNpb246RyxhY3Rpb246Ik1lZGlhVHJhbnNmb3JtZXIiLHRyYW5zZm9ybWVyVHlwZTp0aGlzLnRyYW5zZm9ybWVyVHlwZV8sdmlkZW9XaWR0aDp0aGlzLnZpZGVvV2lkdGhfLHZpZGVvSGVpZ2h0OnRoaXMudmlkZW9IZWlnaHRffSxlKX19Y2xhc3MgTWUgZXh0ZW5kcyB5e2NvbnN0cnVjdG9yKGUpe3N1cGVyKCksYSh0aGlzLCJ0cmFuc2Zvcm1lcnNfIiksYSh0aGlzLCJ0cmFja0V4cGVjdGVkUmF0ZV8iKSx0aGlzLnRyYW5zZm9ybWVyc189W10sdGhpcy50cmFja0V4cGVjdGVkUmF0ZV89LTE7Zm9yKGxldCB0PTA7dDxlLmxlbmd0aDt0Kyspe2xldCByPW5ldyBQZShlW3RdLHQpO3Iub24oImVycm9yIiwoZT0+e3RoaXMuZW1pdCgiZXJyb3IiLGUpfSkpLHIub24oIndhcm4iLChlPT57dGhpcy5lbWl0KCJ3YXJuIixlKX0pKSx0aGlzLnRyYW5zZm9ybWVyc18ucHVzaChyKX19c2V0VHJhY2tFeHBlY3RlZFJhdGUoZSl7dGhpcy50cmFja0V4cGVjdGVkUmF0ZV89ZTtmb3IobGV0IHQgb2YgdGhpcy50cmFuc2Zvcm1lcnNfKXQuc2V0VHJhY2tFeHBlY3RlZFJhdGUodGhpcy50cmFja0V4cGVjdGVkUmF0ZV8pfWFzeW5jIHN0YXJ0KGUsdCl7aWYodGhpcy50cmFuc2Zvcm1lcnNfJiYwIT09dGhpcy50cmFuc2Zvcm1lcnNfLmxlbmd0aCl7dHJ5e2xldCByPWU7Zm9yKGxldCB0IG9mIHRoaXMudHJhbnNmb3JtZXJzXyllPWUucGlwZVRocm91Z2gobmV3IFRyYW5zZm9ybVN0cmVhbSh0KSk7ZS5waXBlVG8odCkudGhlbigoYXN5bmMoKT0+e2NvbnNvbGUubG9nKCJbUGlwZWxpbmVdIFNldHVwLiIpLGF3YWl0IHQuYWJvcnQoKSxhd2FpdCByLmNhbmNlbCgpLHRoaXMuZW1pdCgicGlwZWxpbmVJbmZvIiwicGlwZWxpbmVfZW5kZWQiKX0pKS5jYXRjaCgoYXN5bmMgbj0+e2UuY2FuY2VsKCkudGhlbigoKCk9Pntjb25zb2xlLmxvZygiW1BpcGVsaW5lXSBTaHV0dGluZyBkb3duIHN0cmVhbXMgYWZ0ZXIgYWJvcnQuIil9KSkuY2F0Y2goKGU9Pntjb25zb2xlLmVycm9yKCJbUGlwZWxpbmVdIEVycm9yIGZyb20gc3RyZWFtIHRyYW5zZm9ybToiLGUpfSkpLGF3YWl0IHQuYWJvcnQobiksYXdhaXQgci5jYW5jZWwobiksdGhpcy5lbWl0KCJwaXBlbGluZUluZm8iLCJwaXBlbGluZV9lbmRlZF93aXRoX2Vycm9yIil9KSl9Y2F0Y2h7cmV0dXJuIHRoaXMuZW1pdCgicGlwZWxpbmVJbmZvIiwicGlwZWxpbmVfc3RhcnRlZF93aXRoX2Vycm9yIiksdm9pZCB0aGlzLmRlc3Ryb3koKX10aGlzLmVtaXQoInBpcGVsaW5lSW5mbyIsInBpcGVsaW5lX3N0YXJ0ZWQiKSxjb25zb2xlLmxvZygiW1BpcGVsaW5lXSBQaXBlbGluZSBzdGFydGVkLiIpfWVsc2UgY29uc29sZS5sb2coIltQaXBlbGluZV0gTm8gdHJhbnNmb3JtZXJzLiIpfWFzeW5jIGRlc3Ryb3koKXtjb25zb2xlLmxvZygiW1BpcGVsaW5lXSBEZXN0cm95aW5nIFBpcGVsaW5lLiIpO2ZvcihsZXQgZSBvZiB0aGlzLnRyYW5zZm9ybWVyc18pZS5zdG9wKCl9fWNsYXNzIE9lIGV4dGVuZHMgeXtjb25zdHJ1Y3Rvcigpe3N1cGVyKCksYSh0aGlzLCJyZXBvcnRlcl8iKSxhKHRoaXMsInBpcGVsaW5lXyIpLGEodGhpcywidHJhbnNmb3JtZXJzXyIpLGEodGhpcywicmVhZGFibGVfIiksYSh0aGlzLCJ3cml0YWJsZV8iKSxhKHRoaXMsInRyYWNrRXhwZWN0ZWRSYXRlXyIpLHRoaXMucmVwb3J0ZXJfPW5ldyBELHRoaXMudHJhY2tFeHBlY3RlZFJhdGVfPS0xLHRoaXMucmVwb3J0KHt2YXJpYXRpb246IkNyZWF0ZSJ9KX1zZXRUcmFja0V4cGVjdGVkUmF0ZShlKXt0aGlzLnRyYWNrRXhwZWN0ZWRSYXRlXz1lLHRoaXMucGlwZWxpbmVfJiZ0aGlzLnBpcGVsaW5lXy5zZXRUcmFja0V4cGVjdGVkUmF0ZSh0aGlzLnRyYWNrRXhwZWN0ZWRSYXRlXyl9dHJhbnNmb3JtKGUsdCl7cmV0dXJuIHRoaXMucmVhZGFibGVfPWUsdGhpcy53cml0YWJsZV89dCx0aGlzLnRyYW5zZm9ybUludGVybmFsKCl9dHJhbnNmb3JtSW50ZXJuYWwoKXtyZXR1cm4gbmV3IFByb21pc2UoKGFzeW5jKGUsdCk9PntpZighdGhpcy50cmFuc2Zvcm1lcnNffHwwPT09dGhpcy50cmFuc2Zvcm1lcnNfLmxlbmd0aClyZXR1cm4gdGhpcy5yZXBvcnQoe21lc3NhZ2U6bC5lcnJvcnMudHJhbnNmb3JtZXJfbm9uZSx2YXJpYXRpb246IkVycm9yIn0pLHZvaWQgdCgiW01lZGlhUHJvY2Vzc29yXSBOZWVkIHRvIHNldCB0cmFuc2Zvcm1lcnMuIik7aWYoIXRoaXMucmVhZGFibGVfKXJldHVybiB0aGlzLnJlcG9ydCh7dmFyaWF0aW9uOiJFcnJvciIsbWVzc2FnZTpsLmVycm9ycy5yZWFkYWJsZV9udWxsfSksdm9pZCB0KCJbTWVkaWFQcm9jZXNzb3JdIFJlYWRhYmxlIGlzIG51bGwuIik7aWYoIXRoaXMud3JpdGFibGVfKXJldHVybiB0aGlzLnJlcG9ydCh7dmFyaWF0aW9uOiJFcnJvciIsbWVzc2FnZTpsLmVycm9ycy53cml0YWJsZV9udWxsfSksdm9pZCB0KCJbTWVkaWFQcm9jZXNzb3JdIFdyaXRhYmxlIGlzIG51bGwuIik7bGV0IHI9ITE7dGhpcy5waXBlbGluZV8mJihyPSEwLHRoaXMucGlwZWxpbmVfLmNsZWFyTGlzdGVuZXJzKCksdGhpcy5waXBlbGluZV8uZGVzdHJveSgpKSx0aGlzLnBpcGVsaW5lXz1uZXcgTWUodGhpcy50cmFuc2Zvcm1lcnNfKSx0aGlzLnBpcGVsaW5lXy5vbigid2FybiIsKGU9Pnt0aGlzLmVtaXQoIndhcm4iLGUpfSkpLHRoaXMucGlwZWxpbmVfLm9uKCJlcnJvciIsKGU9Pnt0aGlzLmVtaXQoImVycm9yIixlKX0pKSx0aGlzLnBpcGVsaW5lXy5vbigicGlwZWxpbmVJbmZvIiwoZT0+e3ImJigicGlwZWxpbmVfc3RhcnRlZCI9PT1lP2U9US5waXBlbGluZV9yZXN0YXJ0ZWQ6InBpcGVsaW5lX3N0YXJ0ZWRfd2l0aF9lcnJvciI9PT1lJiYoZT1RLnBpcGVsaW5lX3Jlc3RhcnRlZF93aXRoX2Vycm9yKSksdGhpcy5lbWl0KCJwaXBlbGluZUluZm8iLGUpfSkpLC0xIT10aGlzLnRyYWNrRXhwZWN0ZWRSYXRlXyYmdGhpcy5waXBlbGluZV8uc2V0VHJhY2tFeHBlY3RlZFJhdGUodGhpcy50cmFja0V4cGVjdGVkUmF0ZV8pLHRoaXMucGlwZWxpbmVfLnN0YXJ0KHRoaXMucmVhZGFibGVfLHRoaXMud3JpdGFibGVfKS50aGVuKCgoKT0+e2UoKX0pKS5jYXRjaCgoZT0+e3QoZSl9KSl9KSl9c2V0VHJhbnNmb3JtZXJzKGUpe3JldHVybiB0aGlzLnJlcG9ydCh7dmFyaWF0aW9uOiJVcGRhdGUiLG1lc3NhZ2U6bC51cGRhdGVzLnRyYW5zZm9ybWVyX25ld30pLHRoaXMudHJhbnNmb3JtZXJzXz1lLHRoaXMucmVhZGFibGVfJiZ0aGlzLndyaXRhYmxlXz90aGlzLnRyYW5zZm9ybUludGVybmFsKCk6UHJvbWlzZS5yZXNvbHZlKCl9ZGVzdHJveSgpe3JldHVybiBuZXcgUHJvbWlzZSgoYXN5bmMgZT0+e3RoaXMucGlwZWxpbmVfJiZ0aGlzLnBpcGVsaW5lXy5kZXN0cm95KCksdGhpcy5yZXBvcnQoe3ZhcmlhdGlvbjoiRGVsZXRlIn0pLGUoKX0pKX1yZXBvcnQoZSl7dGhpcy5yZXBvcnRlcl8uc2VuZCh7dmVyc2lvbjpHLGFjdGlvbjoiTWVkaWFQcm9jZXNzb3IiLC4uLmV9KX19Y29uc3QgVj1uZXcgV2Vha01hcCxZPW5ldyBXZWFrTWFwLEs9bmV3IFdlYWtNYXAsWj1TeW1ib2woImFueVByb2R1Y2VyIiksZWU9UHJvbWlzZS5yZXNvbHZlKCksdGU9U3ltYm9sKCJsaXN0ZW5lckFkZGVkIikscmU9U3ltYm9sKCJsaXN0ZW5lclJlbW92ZWQiKTtsZXQgc2U9ITEsb2U9ITE7ZnVuY3Rpb24gYXNzZXJ0RXZlbnROYW1lJDEoZSl7aWYoInN0cmluZyIhPXR5cGVvZiBlJiYic3ltYm9sIiE9dHlwZW9mIGUmJiJudW1iZXIiIT10eXBlb2YgZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgZXZlbnROYW1lYCBtdXN0IGJlIGEgc3RyaW5nLCBzeW1ib2wsIG9yIG51bWJlciIpfWZ1bmN0aW9uIGFzc2VydExpc3RlbmVyJDEoZSl7aWYoImZ1bmN0aW9uIiE9dHlwZW9mIGUpdGhyb3cgbmV3IFR5cGVFcnJvcigibGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uIil9ZnVuY3Rpb24gZ2V0TGlzdGVuZXJzJDEoZSx0KXtjb25zdCByPVkuZ2V0KGUpO2lmKHIuaGFzKHQpKXJldHVybiByLmdldCh0KX1mdW5jdGlvbiBnZXRFdmVudFByb2R1Y2VycyQxKGUsdCl7Y29uc3Qgcj0ic3RyaW5nIj09dHlwZW9mIHR8fCJzeW1ib2wiPT10eXBlb2YgdHx8Im51bWJlciI9PXR5cGVvZiB0P3Q6WixuPUsuZ2V0KGUpO2lmKG4uaGFzKHIpKXJldHVybiBuLmdldChyKX1mdW5jdGlvbiBpdGVyYXRvciQxKGUsdCl7dD1BcnJheS5pc0FycmF5KHQpP3Q6W3RdO2xldCByPSExLGZsdXNoPSgpPT57fSxuPVtdO2NvbnN0IGM9e2VucXVldWUoZSl7bi5wdXNoKGUpLGZsdXNoKCl9LGZpbmlzaCgpe3I9ITAsZmx1c2goKX19O2Zvcihjb25zdCBmIG9mIHQpe2xldCB0PWdldEV2ZW50UHJvZHVjZXJzJDEoZSxmKTtpZighdCl7dD1uZXcgU2V0O0suZ2V0KGUpLnNldChmLHQpfXQuYWRkKGMpfXJldHVybnthc3luYyBuZXh0KCl7cmV0dXJuIG4/MD09PW4ubGVuZ3RoP3I/KG49dm9pZCAwLHRoaXMubmV4dCgpKTooYXdhaXQgbmV3IFByb21pc2UoKGU9PntmbHVzaD1lfSkpLHRoaXMubmV4dCgpKTp7ZG9uZTohMSx2YWx1ZTphd2FpdCBuLnNoaWZ0KCl9Ontkb25lOiEwfX0sYXN5bmMgcmV0dXJuKHIpe249dm9pZCAwO2Zvcihjb25zdCBuIG9mIHQpe2NvbnN0IHQ9Z2V0RXZlbnRQcm9kdWNlcnMkMShlLG4pO2lmKHQmJih0LmRlbGV0ZShjKSwwPT09dC5zaXplKSl7Sy5nZXQoZSkuZGVsZXRlKG4pfX1yZXR1cm4gZmx1c2goKSxhcmd1bWVudHMubGVuZ3RoPjA/e2RvbmU6ITAsdmFsdWU6YXdhaXQgcn06e2RvbmU6ITB9fSxbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCl7cmV0dXJuIHRoaXN9fX1mdW5jdGlvbiBkZWZhdWx0TWV0aG9kTmFtZXNPckFzc2VydCQxKGUpe2lmKHZvaWQgMD09PWUpcmV0dXJuIGZlO2lmKCFBcnJheS5pc0FycmF5KGUpKXRocm93IG5ldyBUeXBlRXJyb3IoImBtZXRob2ROYW1lc2AgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzIik7Zm9yKGNvbnN0IHQgb2YgZSlpZighZmUuaW5jbHVkZXModCkpe2lmKCJzdHJpbmciIT10eXBlb2YgdCl0aHJvdyBuZXcgVHlwZUVycm9yKCJgbWV0aG9kTmFtZXNgIGVsZW1lbnQgbXVzdCBiZSBhIHN0cmluZyIpO3Rocm93IG5ldyBFcnJvcihgJHt0fSBpcyBub3QgRW1pdHRlcnkgbWV0aG9kYCl9cmV0dXJuIGV9Y29uc3QgaXNNZXRhRXZlbnQkMT1lPT5lPT09dGV8fGU9PT1yZTtmdW5jdGlvbiBlbWl0TWV0YUV2ZW50JDEoZSx0LHIpe2lmKGlzTWV0YUV2ZW50JDEodCkpdHJ5e3NlPSEwLGUuZW1pdCh0LHIpfWZpbmFsbHl7c2U9ITF9fWxldCBhZT1jbGFzcyBFbWl0dGVyeTJ7c3RhdGljIG1peGluKGUsdCl7cmV0dXJuIHQ9ZGVmYXVsdE1ldGhvZE5hbWVzT3JBc3NlcnQkMSh0KSxyPT57aWYoImZ1bmN0aW9uIiE9dHlwZW9mIHIpdGhyb3cgbmV3IFR5cGVFcnJvcigiYHRhcmdldGAgbXVzdCBiZSBmdW5jdGlvbiIpO2Zvcihjb25zdCBlIG9mIHQpaWYodm9pZCAwIT09ci5wcm90b3R5cGVbZV0pdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvcGVydHkgXGAke2V9XGAgYWxyZWFkeSBleGlzdHMgb24gXGB0YXJnZXRcYGApO09iamVjdC5kZWZpbmVQcm9wZXJ0eShyLnByb3RvdHlwZSxlLHtlbnVtZXJhYmxlOiExLGdldDpmdW5jdGlvbiBnZXRFbWl0dGVyeVByb3BlcnR5KCl7cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLGUse2VudW1lcmFibGU6ITEsdmFsdWU6bmV3IEVtaXR0ZXJ5Mn0pLHRoaXNbZV19fSk7Y29uc3QgZW1pdHRlcnlNZXRob2RDYWxsZXI9dD0+ZnVuY3Rpb24oLi4ucil7cmV0dXJuIHRoaXNbZV1bdF0oLi4ucil9O2Zvcihjb25zdCBlIG9mIHQpT2JqZWN0LmRlZmluZVByb3BlcnR5KHIucHJvdG90eXBlLGUse2VudW1lcmFibGU6ITEsdmFsdWU6ZW1pdHRlcnlNZXRob2RDYWxsZXIoZSl9KTtyZXR1cm4gcn19c3RhdGljIGdldCBpc0RlYnVnRW5hYmxlZCgpe2lmKCJvYmplY3QiIT10eXBlb2YgZ2xvYmFsVGhpcy5wcm9jZXNzPy5lbnYpcmV0dXJuIG9lO2NvbnN0e2VudjplfT1nbG9iYWxUaGlzLnByb2Nlc3M/P3tlbnY6e319O3JldHVybiJlbWl0dGVyeSI9PT1lLkRFQlVHfHwiKiI9PT1lLkRFQlVHfHxvZX1zdGF0aWMgc2V0IGlzRGVidWdFbmFibGVkKGUpe29lPWV9Y29uc3RydWN0b3IoZT17fSl7Vi5zZXQodGhpcyxuZXcgU2V0KSxZLnNldCh0aGlzLG5ldyBNYXApLEsuc2V0KHRoaXMsbmV3IE1hcCksSy5nZXQodGhpcykuc2V0KFosbmV3IFNldCksdGhpcy5kZWJ1Zz1lLmRlYnVnPz97fSx2b2lkIDA9PT10aGlzLmRlYnVnLmVuYWJsZWQmJih0aGlzLmRlYnVnLmVuYWJsZWQ9ITEpLHRoaXMuZGVidWcubG9nZ2VyfHwodGhpcy5kZWJ1Zy5sb2dnZXI9KGUsdCxyLG4pPT57dHJ5e249SlNPTi5zdHJpbmdpZnkobil9Y2F0Y2h7bj1gT2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzIGZhaWxlZCB0byBzdHJpbmdpZnk6ICR7T2JqZWN0LmtleXMobikuam9pbigiLCIpfWB9InN5bWJvbCIhPXR5cGVvZiByJiYibnVtYmVyIiE9dHlwZW9mIHJ8fChyPXIudG9TdHJpbmcoKSk7Y29uc3QgYz1uZXcgRGF0ZSxmPWAke2MuZ2V0SG91cnMoKX06JHtjLmdldE1pbnV0ZXMoKX06JHtjLmdldFNlY29uZHMoKX0uJHtjLmdldE1pbGxpc2Vjb25kcygpfWA7Y29uc29sZS5sb2coYFske2Z9XVtlbWl0dGVyeToke2V9XVske3R9XSBFdmVudCBOYW1lOiAke3J9XG5cdGRhdGE6ICR7bn1gKX0pfWxvZ0lmRGVidWdFbmFibGVkKGUsdCxyKXsoRW1pdHRlcnkyLmlzRGVidWdFbmFibGVkfHx0aGlzLmRlYnVnLmVuYWJsZWQpJiZ0aGlzLmRlYnVnLmxvZ2dlcihlLHRoaXMuZGVidWcubmFtZSx0LHIpfW9uKGUsdCl7YXNzZXJ0TGlzdGVuZXIkMSh0KSxlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07Zm9yKGNvbnN0IHIgb2YgZSl7YXNzZXJ0RXZlbnROYW1lJDEocik7bGV0IGU9Z2V0TGlzdGVuZXJzJDEodGhpcyxyKTtpZighZSl7ZT1uZXcgU2V0O1kuZ2V0KHRoaXMpLnNldChyLGUpfWUuYWRkKHQpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInN1YnNjcmliZSIscix2b2lkIDApLGlzTWV0YUV2ZW50JDEocil8fGVtaXRNZXRhRXZlbnQkMSh0aGlzLHRlLHtldmVudE5hbWU6cixsaXN0ZW5lcjp0fSl9cmV0dXJuIHRoaXMub2ZmLmJpbmQodGhpcyxlLHQpfW9mZihlLHQpe2Fzc2VydExpc3RlbmVyJDEodCksZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCByIG9mIGUpe2Fzc2VydEV2ZW50TmFtZSQxKHIpO2NvbnN0IGU9Z2V0TGlzdGVuZXJzJDEodGhpcyxyKTtpZihlJiYoZS5kZWxldGUodCksMD09PWUuc2l6ZSkpe1kuZ2V0KHRoaXMpLmRlbGV0ZShyKX10aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJ1bnN1YnNjcmliZSIscix2b2lkIDApLGlzTWV0YUV2ZW50JDEocil8fGVtaXRNZXRhRXZlbnQkMSh0aGlzLHJlLHtldmVudE5hbWU6cixsaXN0ZW5lcjp0fSl9fW9uY2UoZSl7bGV0IHQ7Y29uc3Qgcj1uZXcgUHJvbWlzZSgocj0+e3Q9dGhpcy5vbihlLChlPT57dCgpLHIoZSl9KSl9KSk7cmV0dXJuIHIub2ZmPXQscn1ldmVudHMoZSl7ZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCB0IG9mIGUpYXNzZXJ0RXZlbnROYW1lJDEodCk7cmV0dXJuIGl0ZXJhdG9yJDEodGhpcyxlKX1hc3luYyBlbWl0KGUsdCl7aWYoYXNzZXJ0RXZlbnROYW1lJDEoZSksaXNNZXRhRXZlbnQkMShlKSYmIXNlKXRocm93IG5ldyBUeXBlRXJyb3IoImBldmVudE5hbWVgIGNhbm5vdCBiZSBtZXRhIGV2ZW50IGBsaXN0ZW5lckFkZGVkYCBvciBgbGlzdGVuZXJSZW1vdmVkYCIpO3RoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoImVtaXQiLGUsdCksZnVuY3Rpb24gZW5xdWV1ZVByb2R1Y2VycyQxKGUsdCxyKXtjb25zdCBuPUsuZ2V0KGUpO2lmKG4uaGFzKHQpKWZvcihjb25zdCBjIG9mIG4uZ2V0KHQpKWMuZW5xdWV1ZShyKTtpZihuLmhhcyhaKSl7Y29uc3QgZT1Qcm9taXNlLmFsbChbdCxyXSk7Zm9yKGNvbnN0IHQgb2Ygbi5nZXQoWikpdC5lbnF1ZXVlKGUpfX0odGhpcyxlLHQpO2NvbnN0IHI9Z2V0TGlzdGVuZXJzJDEodGhpcyxlKT8/bmV3IFNldCxuPVYuZ2V0KHRoaXMpLGM9Wy4uLnJdLGY9aXNNZXRhRXZlbnQkMShlKT9bXTpbLi4ubl07YXdhaXQgZWUsYXdhaXQgUHJvbWlzZS5hbGwoWy4uLmMubWFwKChhc3luYyBlPT57aWYoci5oYXMoZSkpcmV0dXJuIGUodCl9KSksLi4uZi5tYXAoKGFzeW5jIHI9PntpZihuLmhhcyhyKSlyZXR1cm4gcihlLHQpfSkpXSl9YXN5bmMgZW1pdFNlcmlhbChlLHQpe2lmKGFzc2VydEV2ZW50TmFtZSQxKGUpLGlzTWV0YUV2ZW50JDEoZSkmJiFzZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgZXZlbnROYW1lYCBjYW5ub3QgYmUgbWV0YSBldmVudCBgbGlzdGVuZXJBZGRlZGAgb3IgYGxpc3RlbmVyUmVtb3ZlZGAiKTt0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJlbWl0U2VyaWFsIixlLHQpO2NvbnN0IHI9Z2V0TGlzdGVuZXJzJDEodGhpcyxlKT8/bmV3IFNldCxuPVYuZ2V0KHRoaXMpLGM9Wy4uLnJdLGY9Wy4uLm5dO2F3YWl0IGVlO2Zvcihjb25zdCBoIG9mIGMpci5oYXMoaCkmJmF3YWl0IGgodCk7Zm9yKGNvbnN0IGggb2YgZiluLmhhcyhoKSYmYXdhaXQgaChlLHQpfW9uQW55KGUpe3JldHVybiBhc3NlcnRMaXN0ZW5lciQxKGUpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInN1YnNjcmliZUFueSIsdm9pZCAwLHZvaWQgMCksVi5nZXQodGhpcykuYWRkKGUpLGVtaXRNZXRhRXZlbnQkMSh0aGlzLHRlLHtsaXN0ZW5lcjplfSksdGhpcy5vZmZBbnkuYmluZCh0aGlzLGUpfWFueUV2ZW50KCl7cmV0dXJuIGl0ZXJhdG9yJDEodGhpcyl9b2ZmQW55KGUpe2Fzc2VydExpc3RlbmVyJDEoZSksdGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgidW5zdWJzY3JpYmVBbnkiLHZvaWQgMCx2b2lkIDApLGVtaXRNZXRhRXZlbnQkMSh0aGlzLHJlLHtsaXN0ZW5lcjplfSksVi5nZXQodGhpcykuZGVsZXRlKGUpfWNsZWFyTGlzdGVuZXJzKGUpe2U9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgdCBvZiBlKWlmKHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoImNsZWFyIix0LHZvaWQgMCksInN0cmluZyI9PXR5cGVvZiB0fHwic3ltYm9sIj09dHlwZW9mIHR8fCJudW1iZXIiPT10eXBlb2YgdCl7Y29uc3QgZT1nZXRMaXN0ZW5lcnMkMSh0aGlzLHQpO2UmJmUuY2xlYXIoKTtjb25zdCByPWdldEV2ZW50UHJvZHVjZXJzJDEodGhpcyx0KTtpZihyKXtmb3IoY29uc3QgZSBvZiByKWUuZmluaXNoKCk7ci5jbGVhcigpfX1lbHNle1YuZ2V0KHRoaXMpLmNsZWFyKCk7Zm9yKGNvbnN0W2UsdF1vZiBZLmdldCh0aGlzKS5lbnRyaWVzKCkpdC5jbGVhcigpLFkuZ2V0KHRoaXMpLmRlbGV0ZShlKTtmb3IoY29uc3RbZSx0XW9mIEsuZ2V0KHRoaXMpLmVudHJpZXMoKSl7Zm9yKGNvbnN0IGUgb2YgdCllLmZpbmlzaCgpO3QuY2xlYXIoKSxLLmdldCh0aGlzKS5kZWxldGUoZSl9fX1saXN0ZW5lckNvdW50KGUpe2U9QXJyYXkuaXNBcnJheShlKT9lOltlXTtsZXQgdD0wO2Zvcihjb25zdCByIG9mIGUpaWYoInN0cmluZyIhPXR5cGVvZiByKXt2b2lkIDAhPT1yJiZhc3NlcnRFdmVudE5hbWUkMShyKSx0Kz1WLmdldCh0aGlzKS5zaXplO2Zvcihjb25zdCBlIG9mIFkuZ2V0KHRoaXMpLnZhbHVlcygpKXQrPWUuc2l6ZTtmb3IoY29uc3QgZSBvZiBLLmdldCh0aGlzKS52YWx1ZXMoKSl0Kz1lLnNpemV9ZWxzZSB0Kz1WLmdldCh0aGlzKS5zaXplKyhnZXRMaXN0ZW5lcnMkMSh0aGlzLHIpPy5zaXplPz8wKSsoZ2V0RXZlbnRQcm9kdWNlcnMkMSh0aGlzLHIpPy5zaXplPz8wKSsoZ2V0RXZlbnRQcm9kdWNlcnMkMSh0aGlzKT8uc2l6ZT8/MCk7cmV0dXJuIHR9YmluZE1ldGhvZHMoZSx0KXtpZigib2JqZWN0IiE9dHlwZW9mIGV8fG51bGw9PT1lKXRocm93IG5ldyBUeXBlRXJyb3IoImB0YXJnZXRgIG11c3QgYmUgYW4gb2JqZWN0Iik7dD1kZWZhdWx0TWV0aG9kTmFtZXNPckFzc2VydCQxKHQpO2Zvcihjb25zdCByIG9mIHQpe2lmKHZvaWQgMCE9PWVbcl0pdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvcGVydHkgXGAke3J9XGAgYWxyZWFkeSBleGlzdHMgb24gXGB0YXJnZXRcYGApO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIse2VudW1lcmFibGU6ITEsdmFsdWU6dGhpc1tyXS5iaW5kKHRoaXMpfSl9fX07Y29uc3QgZmU9T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYWUucHJvdG90eXBlKS5maWx0ZXIoKGU9PiJjb25zdHJ1Y3RvciIhPT1lKSk7T2JqZWN0LmRlZmluZVByb3BlcnR5KGFlLCJsaXN0ZW5lckFkZGVkIix7dmFsdWU6dGUsd3JpdGFibGU6ITEsZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITF9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYWUsImxpc3RlbmVyUmVtb3ZlZCIse3ZhbHVlOnJlLHdyaXRhYmxlOiExLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiExfSk7Y2xhc3MgQXZlcmFnZXtjb25zdHJ1Y3RvcihlKXt0aGlzLnNpemU9ZSx0aGlzLnZhbHVlcz1bXSx0aGlzLnN1bT0wfXB1c2goZSl7Zm9yKHRoaXMudmFsdWVzLnB1c2goZSksdGhpcy5zdW0rPWU7dGhpcy5zaXplPHRoaXMudmFsdWVzLmxlbmd0aDspdGhpcy5zdW0tPXRoaXMudmFsdWVzLnNoaWZ0KCk/PzB9dmFsdWUoKXtyZXR1cm4gdGhpcy5zdW0vTWF0aC5tYXgoMSx0aGlzLnZhbHVlcy5sZW5ndGgpfX1jbGFzcyBOb2lzZVN1cHByZXNzaW9uVHJhbnNmb3JtZXIgZXh0ZW5kcyBhZXtjb25zdHJ1Y3Rvcigpe3N1cGVyKCksdGhpcy5pc0VuYWJsZWQ9ITAsdGhpcy5pbnRlcm5hbFJlc2FtcGxlU3VwcG9ydGVkPSExLHRoaXMubGF0ZW5jeT1uZXcgQXZlcmFnZSgxMDApLHRoaXMudHJhbnNmb3JtPXRoaXMudHJhbnNmb3JtQXVkaW9EYXRhLmJpbmQodGhpcyl9YXN5bmMgaW5pdChlKXtjb25zb2xlLmxvZygiTm9pc2Ugc3VwcHJlc3Npb24gdHJhbnNmb3JtZXIgaW5pdGlhbGl6YXRpb24iKSx0aGlzLnRyYW5zZm9ybT1lLmRlYnVnP3RoaXMudHJhbnNmb3JtRGVidWcuYmluZCh0aGlzKTp0aGlzLnRyYW5zZm9ybUF1ZGlvRGF0YS5iaW5kKHRoaXMpO2NvbnN0IHQ9ZS5hc3NldHNEaXJCYXNlVXJsPz8iaHR0cHM6Ly9kM29wcWptcXp4ZjA1Ny5jbG91ZGZyb250Lm5ldC9ub2lzZS1zdXBwcmVzc2lvbi8xLjAuMC1iZXRhLjIiLGxvY2F0ZUZpbGU9ZT0+YCR7dH0vJHtlfWA7bGV0IHIsbj0xO2F3YWl0IHRoaXMuaXNNb25vVGhyZWFkKGUpP3RoaXMud2FzbUluc3RhbmNlPWF3YWl0IGNyZWF0ZVdhc21Nb25vSW5zdGFuY2Uoe2xvY2F0ZUZpbGU6bG9jYXRlRmlsZSxtYWluU2NyaXB0VXJsT3JCbG9iOmxvY2F0ZUZpbGUoIm1haW4tYmluLW1vbm8uanMiKX0pOih0aGlzLndhc21JbnN0YW5jZT1hd2FpdCBjcmVhdGVXYXNtTXVsdGlJbnN0YW5jZSh7bG9jYXRlRmlsZTpsb2NhdGVGaWxlLG1haW5TY3JpcHRVcmxPckJsb2I6bG9jYXRlRmlsZSgibWFpbi1iaW4tbXVsdGkuanMiKX0pLG49MyksdGhpcy53YXNtVHJhbnNmb3JtZXI9bmV3IHRoaXMud2FzbUluc3RhbmNlLkR0bG5UcmFuc2Zvcm1lcixhd2FpdCBQcm9taXNlLmFsbChbdGhpcy5sb2FkTW9kZWwoYCR7dH0vbW9kZWxfMS50ZmxpdGVgLDEpLHRoaXMubG9hZE1vZGVsKGAke3R9L21vZGVsXzIudGZsaXRlYCwyKV0pO3RyeXtyPXRoaXMud2FzbVRyYW5zZm9ybWVyPy5pbml0KG4pfWNhdGNoKGMpe2lmKCJudW1iZXIiPT10eXBlb2YgYyl7bGV0IGU9IiI7Zm9yKGxldCB0PTA7dDw1MDA7Kyt0KWUrPVN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy53YXNtSW5zdGFuY2UuSEVBUDhbYyt0XSk7Y29uc29sZS5lcnJvcihlKX1lbHNlIGNvbnNvbGUuZXJyb3IoYyl9aWYoMCE9PXIpe2NvbnN0IGU9YEZhaWwgdG8gaW5pdCB3YXNtIHRyYW5zZm9ybWVyLCBlcnJvciBjb2RlID0gJHtyfWA7dGhyb3cgY29uc29sZS5lcnJvcihlKSxlfWlmKHRoaXMuaW50ZXJuYWxSZXNhbXBsZVN1cHBvcnRlZD10aGlzLndhc21UcmFuc2Zvcm1lcj8uZ2V0SW50ZXJuYWxSZXNhbXBsZVN1cHBvcnRlZCgpLCF0aGlzLmludGVybmFsUmVzYW1wbGVTdXBwb3J0ZWQpe2NvbnN0IGU9IkludGVybmFsIHJlc2FtcGxpbmcgbm90IHN1cHBvcnRlZCI7dGhyb3cgY29uc29sZS5lcnJvcihlKSxlfWNvbnNvbGUubG9nKCJOb2lzZSBzdXBwcmVzc2lvbiB0cmFuc2Zvcm1lciByZWFkeSIpfXNldEF1ZGlvT3B0aW9ucyhlLHQscixuLGMpe3RoaXMud2FzbVRyYW5zZm9ybWVyPy5zZXRBdWRpb09wdGlvbnMoZSx0LHIsbixjKX1lbmFibGUoKXt0aGlzLmlzRW5hYmxlZD0hMH1kaXNhYmxlKCl7dGhpcy5pc0VuYWJsZWQ9ITF9Z2V0TGF0ZW5jeSgpe3JldHVybiB0aGlzLmxhdGVuY3kudmFsdWUoKX1nZXRXYXNtTGF0ZW5jeU5zKCl7cmV0dXJuIHRoaXMud2FzbUluc3RhbmNlLmdldExhdGVuY3lOcygpfWFzeW5jIHRyYW5zZm9ybURlYnVnKGUsdCl7dHJ5e2NvbnN0IHI9cGVyZm9ybWFuY2Uubm93KCk7YXdhaXQgdGhpcy50cmFuc2Zvcm1BdWRpb0RhdGEoZSx0KSx0aGlzLmxhdGVuY3kucHVzaChwZXJmb3JtYW5jZS5ub3coKS1yKX1jYXRjaChyKXtjb25zb2xlLmVycm9yKHIpfX1hc3luYyB0cmFuc2Zvcm1BdWRpb0RhdGEoZSx0KXtpZih0aGlzLndhc21UcmFuc2Zvcm1lcnx8dGhpcy5lbWl0KCJ3YXJuaW5nIiwidHJhbnNmb3JtZXIgbm90IGluaXRpYWxpemVkIiksdGhpcy5pc0VuYWJsZWQmJnRoaXMud2FzbVRyYW5zZm9ybWVyKXRyeXtjb25zdCB0PXRoaXMuZ2V0QXVkaW9EYXRhQXNGbG9hdDMyKGUpLG49dGhpcy5jb252ZXJ0VHlwZWRBcnJheSh0LEludDE2QXJyYXksMzI3NjcpO3RoaXMud2FzbVRyYW5zZm9ybWVyLmdldElucHV0RnJhbWUoZS5udW1iZXJPZkZyYW1lcykuc2V0KG4pO2xldCBjPTA7dHJ5e2M9dGhpcy53YXNtVHJhbnNmb3JtZXIucnVuQWxnb3JpdGhtKGUubnVtYmVyT2ZGcmFtZXMsZS5zYW1wbGVSYXRlLGUubnVtYmVyT2ZDaGFubmVscyl9Y2F0Y2gocil7aWYoIm51bWJlciI9PXR5cGVvZiByKXtsZXQgZT0iIjtmb3IobGV0IHQ9MDt0PDUwMDsrK3QpZSs9U3RyaW5nLmZyb21DaGFyQ29kZSh0aGlzLndhc21JbnN0YW5jZS5IRUFQOFtyK3RdKTtjb25zb2xlLmVycm9yKGUpfWVsc2UgY29uc29sZS5lcnJvcihyKX1pZihjPjApe2NvbnN0IHQ9dGhpcy53YXNtVHJhbnNmb3JtZXIuZ2V0T3V0cHV0RnJhbWUoKS5zbGljZSgwLGMpLHI9dGhpcy5jb252ZXJ0VHlwZWRBcnJheSh0LEZsb2F0MzJBcnJheSwxLzMyNzY3KSx7dGltZXN0YW1wOm4sc2FtcGxlUmF0ZTpmLG51bWJlck9mQ2hhbm5lbHM6aH09ZTtlPW5ldyBBdWRpb0RhdGEoe2RhdGE6cixmb3JtYXQ6ImYzMi1wbGFuYXIiLG51bWJlck9mQ2hhbm5lbHM6aCxudW1iZXJPZkZyYW1lczpyLmxlbmd0aCxzYW1wbGVSYXRlOmYsdGltZXN0YW1wOm59KX19Y2F0Y2gocil7Y29uc29sZS5lcnJvcihyKX10LmVucXVldWUoZSl9YXN5bmMgbG9hZE1vZGVsKGUsdCl7aWYoIXRoaXMud2FzbVRyYW5zZm9ybWVyKXJldHVybjtjb25zdCByPWF3YWl0IGZldGNoKGUpLG49YXdhaXQgci5hcnJheUJ1ZmZlcigpLGM9bi5ieXRlTGVuZ3RoLGY9YGdldE1vZGVsJHt0fWAsaD10aGlzLndhc21UcmFuc2Zvcm1lcltmXShjKTtpZihoKXtjb25zdCBlPW5ldyBVaW50OEFycmF5KG4pO2guc2V0KGUpfX1nZXRBdWRpb0RhdGFBc0Zsb2F0MzIoZSl7cmV0dXJuIHRoaXMuYXVkaW9EYXRhVG9UeXBlZEFycmF5KGUsRmxvYXQzMkFycmF5LCJmMzItcGxhbmFyIiwxKX1hdWRpb0RhdGFUb1R5cGVkQXJyYXkoZSx0LHIsbj1lLm51bWJlck9mQ2hhbm5lbHMpe2NvbnN0IGM9bmV3IHQoZS5udW1iZXJPZkZyYW1lcypuKTtmb3IobGV0IGY9MDtmPG47KytmKXtjb25zdCB0PWUubnVtYmVyT2ZGcmFtZXMqZixuPWMuc3ViYXJyYXkodCx0K2UubnVtYmVyT2ZGcmFtZXMpO2UuY29weVRvKG4se3BsYW5lSW5kZXg6Zixmb3JtYXQ6cn0pfXJldHVybiBjfWNvbnZlcnRUeXBlZEFycmF5KGUsdCxyKXtjb25zdCBuPWUubGVuZ3RoLGM9bmV3IHQobik7Zm9yKGxldCBmPTA7ZjxuOysrZiljW2ZdPWVbZl0qcjtyZXR1cm4gY31pc01vbm9UaHJlYWQoZSl7aWYoZS5kaXNhYmxlV2FzbU11bHRpVGhyZWFkKXJldHVybiEwO3RyeXtpZih2b2lkIDA9PT1uZXcgU2hhcmVkQXJyYXlCdWZmZXIoMTAyNCkpdGhyb3cgbmV3IEVycm9yKCJub3Qgc3VwcG9ydGVkIil9Y2F0Y2godCl7cmV0dXJuIHRoaXMuZW1pdCgid2FybmluZyIsIlxuTXVsdGl0aHJlYWQgaXMgbm90IGF2YWlsYWJsZSwgbm9pc2Utc3VwcHJlc2lvbiBpcyBub3cgcnVubmluZyBvbiBhIHNpbmdsZSB0aHJlYWQuXG5UaGlzIGlzIGltcGFjdGluZyB0aGUgcGVyZm9ybWFuY2UgYW5kIGluY3JlYXNlIHRoZSBsYXRlbmN5LlxuXG5UbyBlbmFibGUgbXVsdGl0aHJlYWQsIHlvdSBuZWVkIHRvIHNlcnZlIHRoZSBhcHBsaWNhdGlvbiB2aWEgaHR0cHMgd2l0aCB0aGVzZSBodHRwIGhlYWRlcnMgOlxuICAgLSBDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeTogc2FtZS1vcmlnaW5cbiAgIC0gQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeTogcmVxdWlyZS1jb3JwLlxuTW9yZSBpbmZvOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TaGFyZWRBcnJheUJ1ZmZlciNzZWN1cml0eV9yZXF1aXJlbWVudHNcblxuWW91IGNhbiBkaXNhYmxlIHRoaXMgd2FybmluZyBieSBlbmFibGluZyBkaXNhYmxlV2FzbU11bHRpVGhyZWFkIHdpdGhpbiB0aGUgbm9pc2VTdXBwcmVzc2lvbiBvcHRpb25zLlxuIiksITB9cmV0dXJuITF9fWZ1bmN0aW9uIGNyZWF0ZUdsb2JhbFRoaXNWYXJpYWJsZShlLHQpe2dsb2JhbFRoaXMudm9uYWdlfHwoZ2xvYmFsVGhpcy52b25hZ2U9e30pLGdsb2JhbFRoaXMudm9uYWdlLndvcmtlcml6ZXJ8fChnbG9iYWxUaGlzLnZvbmFnZS53b3JrZXJpemVyPXt9KTtsZXQgcj1nbG9iYWxUaGlzLnZvbmFnZS53b3JrZXJpemVyO3JldHVybiByW2VdfHwocltlXT10KSxyW2VdfWNvbnN0IHBlPWNyZWF0ZUdsb2JhbFRoaXNWYXJpYWJsZSgiZ2xvYmFscyIse30pO3ZhciB3ZT0oZT0+KGUuSU5JVD0iSU5JVCIsZS5GT1JXQVJEPSJGT1JXQVJEIixlLlRFUk1JTkFURT0iVEVSTUlOQVRFIixlLkdMT0JBTFNfU1lOQz0iR0xPQkFMU19TWU5DIixlLkVWRU5UPSJFVkVOVCIsZSkpKHdlfHx7fSk7ZnVuY3Rpb24gcG9zdENvbW1hbmQoZSx0KXtjb25zdHtpZDpyLHR5cGU6bn09ZSxjPUFycmF5LmlzQXJyYXkodCk/dDpbdF07cG9zdE1lc3NhZ2Uoe2lkOnIsdHlwZTpuLHJlc3VsdDp0fSxjLmZpbHRlcigoZT0+ZnVuY3Rpb24gaXNUcmFuc2ZlcmFibGUoZSl7cmV0dXJuW0ltYWdlQml0bWFwLFJlYWRhYmxlU3RyZWFtLFdyaXRhYmxlU3RyZWFtXS5zb21lKCh0PT5lIGluc3RhbmNlb2YgdCkpfShlKSkpKX1mdW5jdGlvbiBpc1dvcmtlcigpe3JldHVybiJ1bmRlZmluZWQiIT10eXBlb2YgV29ya2VyR2xvYmFsU2NvcGUmJnNlbGYgaW5zdGFuY2VvZiBXb3JrZXJHbG9iYWxTY29wZX1mdW5jdGlvbiBjb3B5KGUsdCl7aWYoQXJyYXkuaXNBcnJheSh0KSl0LnNwbGljZSgwLHQubGVuZ3RoKTtlbHNlIGlmKCJvYmplY3QiPT10eXBlb2YgdClmb3IoY29uc3QgciBpbiB0KWRlbGV0ZSB0W3JdO2Zvcihjb25zdCByIGluIGUpQXJyYXkuaXNBcnJheShlW3JdKT8odFtyXT1bXSxjb3B5KGVbcl0sdFtyXSkpOiJvYmplY3QiPT10eXBlb2YgZVtyXT8odFtyXT17fSxjb3B5KGVbcl0sdFtyXSkpOnRbcl09ZVtyXX1jcmVhdGVHbG9iYWxUaGlzVmFyaWFibGUoIndvcmtlcml6ZWQiLHt9KTtjb25zdCB2ZT1uZXcgV2Vha01hcCxFZT1uZXcgV2Vha01hcCxUZT1uZXcgV2Vha01hcCxBZT1TeW1ib2woImFueVByb2R1Y2VyIiksTmU9UHJvbWlzZS5yZXNvbHZlKCksJGU9U3ltYm9sKCJsaXN0ZW5lckFkZGVkIiksSWU9U3ltYm9sKCJsaXN0ZW5lclJlbW92ZWQiKTtsZXQgRGU9ITEsa2U9ITE7ZnVuY3Rpb24gYXNzZXJ0RXZlbnROYW1lKGUpe2lmKCJzdHJpbmciIT10eXBlb2YgZSYmInN5bWJvbCIhPXR5cGVvZiBlJiYibnVtYmVyIiE9dHlwZW9mIGUpdGhyb3cgbmV3IFR5cGVFcnJvcigiYGV2ZW50TmFtZWAgbXVzdCBiZSBhIHN0cmluZywgc3ltYm9sLCBvciBudW1iZXIiKX1mdW5jdGlvbiBhc3NlcnRMaXN0ZW5lcihlKXtpZigiZnVuY3Rpb24iIT10eXBlb2YgZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24iKX1mdW5jdGlvbiBnZXRMaXN0ZW5lcnMoZSx0KXtjb25zdCByPUVlLmdldChlKTtpZihyLmhhcyh0KSlyZXR1cm4gci5nZXQodCl9ZnVuY3Rpb24gZ2V0RXZlbnRQcm9kdWNlcnMoZSx0KXtjb25zdCByPSJzdHJpbmciPT10eXBlb2YgdHx8InN5bWJvbCI9PXR5cGVvZiB0fHwibnVtYmVyIj09dHlwZW9mIHQ/dDpBZSxuPVRlLmdldChlKTtpZihuLmhhcyhyKSlyZXR1cm4gbi5nZXQocil9ZnVuY3Rpb24gaXRlcmF0b3IoZSx0KXt0PUFycmF5LmlzQXJyYXkodCk/dDpbdF07bGV0IHI9ITEsZmx1c2g9KCk9Pnt9LG49W107Y29uc3QgYz17ZW5xdWV1ZShlKXtuLnB1c2goZSksZmx1c2goKX0sZmluaXNoKCl7cj0hMCxmbHVzaCgpfX07Zm9yKGNvbnN0IGYgb2YgdCl7bGV0IHQ9Z2V0RXZlbnRQcm9kdWNlcnMoZSxmKTtpZighdCl7dD1uZXcgU2V0O1RlLmdldChlKS5zZXQoZix0KX10LmFkZChjKX1yZXR1cm57YXN5bmMgbmV4dCgpe3JldHVybiBuPzA9PT1uLmxlbmd0aD9yPyhuPXZvaWQgMCx0aGlzLm5leHQoKSk6KGF3YWl0IG5ldyBQcm9taXNlKChlPT57Zmx1c2g9ZX0pKSx0aGlzLm5leHQoKSk6e2RvbmU6ITEsdmFsdWU6YXdhaXQgbi5zaGlmdCgpfTp7ZG9uZTohMH19LGFzeW5jIHJldHVybihyKXtuPXZvaWQgMDtmb3IoY29uc3QgbiBvZiB0KXtjb25zdCB0PWdldEV2ZW50UHJvZHVjZXJzKGUsbik7aWYodCYmKHQuZGVsZXRlKGMpLDA9PT10LnNpemUpKXtUZS5nZXQoZSkuZGVsZXRlKG4pfX1yZXR1cm4gZmx1c2goKSxhcmd1bWVudHMubGVuZ3RoPjA/e2RvbmU6ITAsdmFsdWU6YXdhaXQgcn06e2RvbmU6ITB9fSxbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCl7cmV0dXJuIHRoaXN9fX1mdW5jdGlvbiBkZWZhdWx0TWV0aG9kTmFtZXNPckFzc2VydChlKXtpZih2b2lkIDA9PT1lKXJldHVybiBSZTtpZighQXJyYXkuaXNBcnJheShlKSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgbWV0aG9kTmFtZXNgIG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncyIpO2Zvcihjb25zdCB0IG9mIGUpaWYoIVJlLmluY2x1ZGVzKHQpKXtpZigic3RyaW5nIiE9dHlwZW9mIHQpdGhyb3cgbmV3IFR5cGVFcnJvcigiYG1ldGhvZE5hbWVzYCBlbGVtZW50IG11c3QgYmUgYSBzdHJpbmciKTt0aHJvdyBuZXcgRXJyb3IoYCR7dH0gaXMgbm90IEVtaXR0ZXJ5IG1ldGhvZGApfXJldHVybiBlfWNvbnN0IGlzTWV0YUV2ZW50PWU9PmU9PT0kZXx8ZT09PUllO2Z1bmN0aW9uIGVtaXRNZXRhRXZlbnQoZSx0LHIpe2lmKGlzTWV0YUV2ZW50KHQpKXRyeXtEZT0hMCxlLmVtaXQodCxyKX1maW5hbGx5e0RlPSExfX1jbGFzcyBFbWl0dGVyeXtzdGF0aWMgbWl4aW4oZSx0KXtyZXR1cm4gdD1kZWZhdWx0TWV0aG9kTmFtZXNPckFzc2VydCh0KSxyPT57aWYoImZ1bmN0aW9uIiE9dHlwZW9mIHIpdGhyb3cgbmV3IFR5cGVFcnJvcigiYHRhcmdldGAgbXVzdCBiZSBmdW5jdGlvbiIpO2Zvcihjb25zdCBlIG9mIHQpaWYodm9pZCAwIT09ci5wcm90b3R5cGVbZV0pdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvcGVydHkgXGAke2V9XGAgYWxyZWFkeSBleGlzdHMgb24gXGB0YXJnZXRcYGApO09iamVjdC5kZWZpbmVQcm9wZXJ0eShyLnByb3RvdHlwZSxlLHtlbnVtZXJhYmxlOiExLGdldDpmdW5jdGlvbiBnZXRFbWl0dGVyeVByb3BlcnR5KCl7cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLGUse2VudW1lcmFibGU6ITEsdmFsdWU6bmV3IEVtaXR0ZXJ5fSksdGhpc1tlXX19KTtjb25zdCBlbWl0dGVyeU1ldGhvZENhbGxlcj10PT5mdW5jdGlvbiguLi5yKXtyZXR1cm4gdGhpc1tlXVt0XSguLi5yKX07Zm9yKGNvbnN0IGUgb2YgdClPYmplY3QuZGVmaW5lUHJvcGVydHkoci5wcm90b3R5cGUsZSx7ZW51bWVyYWJsZTohMSx2YWx1ZTplbWl0dGVyeU1ldGhvZENhbGxlcihlKX0pO3JldHVybiByfX1zdGF0aWMgZ2V0IGlzRGVidWdFbmFibGVkKCl7dmFyIGUsdDtpZigib2JqZWN0IiE9dHlwZW9mKG51bGw9PShlPWdsb2JhbFRoaXMucHJvY2Vzcyk/dm9pZCAwOmUuZW52KSlyZXR1cm4ga2U7Y29uc3R7ZW52OnJ9PW51bGwhPSh0PWdsb2JhbFRoaXMucHJvY2Vzcyk/dDp7ZW52Ont9fTtyZXR1cm4iZW1pdHRlcnkiPT09ci5ERUJVR3x8IioiPT09ci5ERUJVR3x8a2V9c3RhdGljIHNldCBpc0RlYnVnRW5hYmxlZChlKXtrZT1lfWNvbnN0cnVjdG9yKGU9e30pe3ZhciB0O3ZlLnNldCh0aGlzLG5ldyBTZXQpLEVlLnNldCh0aGlzLG5ldyBNYXApLFRlLnNldCh0aGlzLG5ldyBNYXApLFRlLmdldCh0aGlzKS5zZXQoQWUsbmV3IFNldCksdGhpcy5kZWJ1Zz1udWxsIT0odD1lLmRlYnVnKT90Ont9LHZvaWQgMD09PXRoaXMuZGVidWcuZW5hYmxlZCYmKHRoaXMuZGVidWcuZW5hYmxlZD0hMSksdGhpcy5kZWJ1Zy5sb2dnZXJ8fCh0aGlzLmRlYnVnLmxvZ2dlcj0oZSx0LHIsbik9Pnt0cnl7bj1KU09OLnN0cmluZ2lmeShuKX1jYXRjaHtuPWBPYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIGtleXMgZmFpbGVkIHRvIHN0cmluZ2lmeTogJHtPYmplY3Qua2V5cyhuKS5qb2luKCIsIil9YH0ic3ltYm9sIiE9dHlwZW9mIHImJiJudW1iZXIiIT10eXBlb2Ygcnx8KHI9ci50b1N0cmluZygpKTtjb25zdCBjPW5ldyBEYXRlLGY9YCR7Yy5nZXRIb3VycygpfToke2MuZ2V0TWludXRlcygpfToke2MuZ2V0U2Vjb25kcygpfS4ke2MuZ2V0TWlsbGlzZWNvbmRzKCl9YDtjb25zb2xlLmxvZyhgWyR7Zn1dW2VtaXR0ZXJ5OiR7ZX1dWyR7dH1dIEV2ZW50IE5hbWU6ICR7cn1cblx0ZGF0YTogJHtufWApfSl9bG9nSWZEZWJ1Z0VuYWJsZWQoZSx0LHIpeyhFbWl0dGVyeS5pc0RlYnVnRW5hYmxlZHx8dGhpcy5kZWJ1Zy5lbmFibGVkKSYmdGhpcy5kZWJ1Zy5sb2dnZXIoZSx0aGlzLmRlYnVnLm5hbWUsdCxyKX1vbihlLHQpe2Fzc2VydExpc3RlbmVyKHQpLGU9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgciBvZiBlKXthc3NlcnRFdmVudE5hbWUocik7bGV0IGU9Z2V0TGlzdGVuZXJzKHRoaXMscik7aWYoIWUpe2U9bmV3IFNldDtFZS5nZXQodGhpcykuc2V0KHIsZSl9ZS5hZGQodCksdGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgic3Vic2NyaWJlIixyLHZvaWQgMCksaXNNZXRhRXZlbnQocil8fGVtaXRNZXRhRXZlbnQodGhpcywkZSx7ZXZlbnROYW1lOnIsbGlzdGVuZXI6dH0pfXJldHVybiB0aGlzLm9mZi5iaW5kKHRoaXMsZSx0KX1vZmYoZSx0KXthc3NlcnRMaXN0ZW5lcih0KSxlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07Zm9yKGNvbnN0IHIgb2YgZSl7YXNzZXJ0RXZlbnROYW1lKHIpO2NvbnN0IGU9Z2V0TGlzdGVuZXJzKHRoaXMscik7aWYoZSYmKGUuZGVsZXRlKHQpLDA9PT1lLnNpemUpKXtFZS5nZXQodGhpcykuZGVsZXRlKHIpfXRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInVuc3Vic2NyaWJlIixyLHZvaWQgMCksaXNNZXRhRXZlbnQocil8fGVtaXRNZXRhRXZlbnQodGhpcyxJZSx7ZXZlbnROYW1lOnIsbGlzdGVuZXI6dH0pfX1vbmNlKGUpe2xldCB0O2NvbnN0IHI9bmV3IFByb21pc2UoKHI9Pnt0PXRoaXMub24oZSwoZT0+e3QoKSxyKGUpfSkpfSkpO3JldHVybiByLm9mZj10LHJ9ZXZlbnRzKGUpe2U9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgdCBvZiBlKWFzc2VydEV2ZW50TmFtZSh0KTtyZXR1cm4gaXRlcmF0b3IodGhpcyxlKX1hc3luYyBlbWl0KGUsdCl7dmFyIHI7aWYoYXNzZXJ0RXZlbnROYW1lKGUpLGlzTWV0YUV2ZW50KGUpJiYhRGUpdGhyb3cgbmV3IFR5cGVFcnJvcigiYGV2ZW50TmFtZWAgY2Fubm90IGJlIG1ldGEgZXZlbnQgYGxpc3RlbmVyQWRkZWRgIG9yIGBsaXN0ZW5lclJlbW92ZWRgIik7dGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgiZW1pdCIsZSx0KSxmdW5jdGlvbiBlbnF1ZXVlUHJvZHVjZXJzKGUsdCxyKXtjb25zdCBuPVRlLmdldChlKTtpZihuLmhhcyh0KSlmb3IoY29uc3QgYyBvZiBuLmdldCh0KSljLmVucXVldWUocik7aWYobi5oYXMoQWUpKXtjb25zdCBlPVByb21pc2UuYWxsKFt0LHJdKTtmb3IoY29uc3QgdCBvZiBuLmdldChBZSkpdC5lbnF1ZXVlKGUpfX0odGhpcyxlLHQpO2NvbnN0IG49bnVsbCE9KHI9Z2V0TGlzdGVuZXJzKHRoaXMsZSkpP3I6bmV3IFNldCxjPXZlLmdldCh0aGlzKSxmPVsuLi5uXSxoPWlzTWV0YUV2ZW50KGUpP1tdOlsuLi5jXTthd2FpdCBOZSxhd2FpdCBQcm9taXNlLmFsbChbLi4uZi5tYXAoKGFzeW5jIGU9PntpZihuLmhhcyhlKSlyZXR1cm4gZSh0KX0pKSwuLi5oLm1hcCgoYXN5bmMgcj0+e2lmKGMuaGFzKHIpKXJldHVybiByKGUsdCl9KSldKX1hc3luYyBlbWl0U2VyaWFsKGUsdCl7dmFyIHI7aWYoYXNzZXJ0RXZlbnROYW1lKGUpLGlzTWV0YUV2ZW50KGUpJiYhRGUpdGhyb3cgbmV3IFR5cGVFcnJvcigiYGV2ZW50TmFtZWAgY2Fubm90IGJlIG1ldGEgZXZlbnQgYGxpc3RlbmVyQWRkZWRgIG9yIGBsaXN0ZW5lclJlbW92ZWRgIik7dGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgiZW1pdFNlcmlhbCIsZSx0KTtjb25zdCBuPW51bGwhPShyPWdldExpc3RlbmVycyh0aGlzLGUpKT9yOm5ldyBTZXQsYz12ZS5nZXQodGhpcyksZj1bLi4ubl0saD1bLi4uY107YXdhaXQgTmU7Zm9yKGNvbnN0IHUgb2YgZiluLmhhcyh1KSYmYXdhaXQgdSh0KTtmb3IoY29uc3QgdSBvZiBoKWMuaGFzKHUpJiZhd2FpdCB1KGUsdCl9b25BbnkoZSl7cmV0dXJuIGFzc2VydExpc3RlbmVyKGUpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInN1YnNjcmliZUFueSIsdm9pZCAwLHZvaWQgMCksdmUuZ2V0KHRoaXMpLmFkZChlKSxlbWl0TWV0YUV2ZW50KHRoaXMsJGUse2xpc3RlbmVyOmV9KSx0aGlzLm9mZkFueS5iaW5kKHRoaXMsZSl9YW55RXZlbnQoKXtyZXR1cm4gaXRlcmF0b3IodGhpcyl9b2ZmQW55KGUpe2Fzc2VydExpc3RlbmVyKGUpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInVuc3Vic2NyaWJlQW55Iix2b2lkIDAsdm9pZCAwKSxlbWl0TWV0YUV2ZW50KHRoaXMsSWUse2xpc3RlbmVyOmV9KSx2ZS5nZXQodGhpcykuZGVsZXRlKGUpfWNsZWFyTGlzdGVuZXJzKGUpe2U9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgdCBvZiBlKWlmKHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoImNsZWFyIix0LHZvaWQgMCksInN0cmluZyI9PXR5cGVvZiB0fHwic3ltYm9sIj09dHlwZW9mIHR8fCJudW1iZXIiPT10eXBlb2YgdCl7Y29uc3QgZT1nZXRMaXN0ZW5lcnModGhpcyx0KTtlJiZlLmNsZWFyKCk7Y29uc3Qgcj1nZXRFdmVudFByb2R1Y2Vycyh0aGlzLHQpO2lmKHIpe2Zvcihjb25zdCBlIG9mIHIpZS5maW5pc2goKTtyLmNsZWFyKCl9fWVsc2V7dmUuZ2V0KHRoaXMpLmNsZWFyKCk7Zm9yKGNvbnN0W2UsdF1vZiBFZS5nZXQodGhpcykuZW50cmllcygpKXQuY2xlYXIoKSxFZS5nZXQodGhpcykuZGVsZXRlKGUpO2Zvcihjb25zdFtlLHRdb2YgVGUuZ2V0KHRoaXMpLmVudHJpZXMoKSl7Zm9yKGNvbnN0IGUgb2YgdCllLmZpbmlzaCgpO3QuY2xlYXIoKSxUZS5nZXQodGhpcykuZGVsZXRlKGUpfX19bGlzdGVuZXJDb3VudChlKXt2YXIgdCxyLG4sYyxmLGg7ZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2xldCB1PTA7Zm9yKGNvbnN0IGQgb2YgZSlpZigic3RyaW5nIiE9dHlwZW9mIGQpe3ZvaWQgMCE9PWQmJmFzc2VydEV2ZW50TmFtZShkKSx1Kz12ZS5nZXQodGhpcykuc2l6ZTtmb3IoY29uc3QgZSBvZiBFZS5nZXQodGhpcykudmFsdWVzKCkpdSs9ZS5zaXplO2Zvcihjb25zdCBlIG9mIFRlLmdldCh0aGlzKS52YWx1ZXMoKSl1Kz1lLnNpemV9ZWxzZSB1Kz12ZS5nZXQodGhpcykuc2l6ZSsobnVsbCE9KHI9bnVsbD09KHQ9Z2V0TGlzdGVuZXJzKHRoaXMsZCkpP3ZvaWQgMDp0LnNpemUpP3I6MCkrKG51bGwhPShjPW51bGw9PShuPWdldEV2ZW50UHJvZHVjZXJzKHRoaXMsZCkpP3ZvaWQgMDpuLnNpemUpP2M6MCkrKG51bGwhPShoPW51bGw9PShmPWdldEV2ZW50UHJvZHVjZXJzKHRoaXMpKT92b2lkIDA6Zi5zaXplKT9oOjApO3JldHVybiB1fWJpbmRNZXRob2RzKGUsdCl7aWYoIm9iamVjdCIhPXR5cGVvZiBlfHxudWxsPT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgdGFyZ2V0YCBtdXN0IGJlIGFuIG9iamVjdCIpO3Q9ZGVmYXVsdE1ldGhvZE5hbWVzT3JBc3NlcnQodCk7Zm9yKGNvbnN0IHIgb2YgdCl7aWYodm9pZCAwIT09ZVtyXSl0aHJvdyBuZXcgRXJyb3IoYFRoZSBwcm9wZXJ0eSBcYCR7cn1cYCBhbHJlYWR5IGV4aXN0cyBvbiBcYHRhcmdldFxgYCk7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUscix7ZW51bWVyYWJsZTohMSx2YWx1ZTp0aGlzW3JdLmJpbmQodGhpcyl9KX19fWNvbnN0IFJlPU9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKEVtaXR0ZXJ5LnByb3RvdHlwZSkuZmlsdGVyKChlPT4iY29uc3RydWN0b3IiIT09ZSkpO09iamVjdC5kZWZpbmVQcm9wZXJ0eShFbWl0dGVyeSwibGlzdGVuZXJBZGRlZCIse3ZhbHVlOiRlLHdyaXRhYmxlOiExLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiExfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KEVtaXR0ZXJ5LCJsaXN0ZW5lclJlbW92ZWQiLHt2YWx1ZTpJZSx3cml0YWJsZTohMSxlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMX0pO2NvbnN0IHhlPWNyZWF0ZUdsb2JhbFRoaXNWYXJpYWJsZSgicmVnaXN0ZXJlZFdvcmtlcnMiLHt9KTtpc1dvcmtlcigpJiZmdW5jdGlvbiBpbml0V29ya2VyKCl7Y29uc3QgZT17fTtvbm1lc3NhZ2U9YXN5bmMgdD0+e2NvbnN0IHI9dC5kYXRhO3N3aXRjaChyLnR5cGUpe2Nhc2Ugd2UuSU5JVDohZnVuY3Rpb24gaGFuZGxlQ29tbWFuZEluaXQoZSx0KXtpZighZS5hcmdzKXRocm93Ik1pc3NpbmcgY2xhc3NOYW1lIHdoaWxlIGluaXRpYWxpemluZyB3b3JrZXIiO2NvbnN0W3Isbl09ZS5hcmdzLGM9eGVbcl07aWYoIWMpdGhyb3dgdW5rbm93biB3b3JrZXIgY2xhc3MgJHtyfWA7dC5pbnN0YW5jZT1uZXcgYyhlLmFyZ3Muc2xpY2UoMSkpLGNvcHkobixwZSksZnVuY3Rpb24gaXNJbnN0YW5jZU9mRW1pdHRlcnkoZSl7cmV0dXJuIGUub25BbnkmJmUuZW1pdH0odC5pbnN0YW5jZSkmJnQuaW5zdGFuY2Uub25BbnkoKChlLHQpPT57cG9zdENvbW1hbmQoe3R5cGU6d2UuRVZFTlR9LHtuYW1lOmUsZGF0YTp0fSl9KSkscG9zdENvbW1hbmQoZSx2b2lkIDAhPT10eXBlb2YgdC5pbnN0YW5jZSl9KHIsZSk7YnJlYWs7Y2FzZSB3ZS5GT1JXQVJEOiFhc3luYyBmdW5jdGlvbiBoYW5kbGVDb21tYW5kRm9yd2FyZChlLHQpe2NvbnN0e2Z1bmN0aW9uTmFtZTpyLGFyZ3M6bn09ZTtpZighdC5pbnN0YW5jZSl0aHJvdyJpbnN0YW5jZSBub3QgaW5pdGlhbGl6ZWQiO2lmKCFyKXRocm93Im1pc3NpbmcgZnVuY3Rpb24gbmFtZSB0byBjYWxsIjtpZighdC5pbnN0YW5jZVtyXSl0aHJvd2B1bmRlZmluZWQgZnVuY3Rpb24gWyR7cn1dIGluIGNsYXNzICR7dC5pbnN0YW5jZS5jb25zdHJ1Y3Rvci53b3JrZXJJZH1gO3Bvc3RDb21tYW5kKGUsYXdhaXQgdC5pbnN0YW5jZVtyXSguLi5udWxsIT1uP246W10pKX0ocixlKTticmVhaztjYXNlIHdlLlRFUk1JTkFURTohYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ29tbWFuZFRlcm1pbmF0ZShlLHQpe2NvbnN0e2FyZ3M6cn09ZTtpZighdC5pbnN0YW5jZSl0aHJvdyJpbnN0YW5jZSBub3QgaW5pdGlhbGl6ZWQiO2xldCBuO3QuaW5zdGFuY2UudGVybWluYXRlJiYobj1hd2FpdCB0Lmluc3RhbmNlLnRlcm1pbmF0ZSguLi5udWxsIT1yP3I6W10pKSxwb3N0Q29tbWFuZChlLG4pfShyLGUpO2JyZWFrO2Nhc2Ugd2UuR0xPQkFMU19TWU5DOiFmdW5jdGlvbiBoYW5kbGVDb21tYW5kR2xvYmFsc1N5bmMoZSl7aWYoIWUuYXJncyl0aHJvdyJNaXNzaW5nIGdsb2JhbHMgd2hpbGUgc3luY2luZyI7Y29weShlLmFyZ3NbMF0scGUpLHBvc3RDb21tYW5kKGUse30pfShyKX19fSgpOyFmdW5jdGlvbiByZWdpc3RlcldvcmtlcihlLHQpe3Qud29ya2VySWQ9ZSxpc1dvcmtlcigpJiYoeGVbdC53b3JrZXJJZF09dCl9KCJQcm9jZXNzb3JXb3JrZXIiLGNsYXNzIF9Qcm9jZXNzb3JXb3JrZXIgZXh0ZW5kcyBhZXtjb25zdHJ1Y3Rvcigpe3N1cGVyKC4uLmFyZ3VtZW50cyksdGhpcy5wcm9jZXNzb3I9bmV3IE9lfWFzeW5jIGluaXQoZT17fSl7dGhpcy50cmFuc2Zvcm1lcj1uZXcgTm9pc2VTdXBwcmVzc2lvblRyYW5zZm9ybWVyLHRoaXMucHJvY2Vzc29yLm9uQW55KCgoZSx0KT0+dGhpcy5lbWl0KGUsdCkpKSx0aGlzLnRyYW5zZm9ybWVyLm9uQW55KCgoZSx0KT0+dGhpcy5lbWl0KGUsdCkpKSxhd2FpdCB0aGlzLnRyYW5zZm9ybWVyLmluaXQoZSksYXdhaXQgdGhpcy5wcm9jZXNzb3Iuc2V0VHJhbnNmb3JtZXJzKFt0aGlzLnRyYW5zZm9ybWVyXSl9dHJhbnNmb3JtKGUsdCl7dGhpcy5wcm9jZXNzb3IudHJhbnNmb3JtKGUsdCl9c2V0QXVkaW9PcHRpb25zKGUsdCxyLG4sYyl7dGhpcy50cmFuc2Zvcm1lcj8uc2V0QXVkaW9PcHRpb25zKGUsdCxyLG4sYyl9ZW5hYmxlKCl7dGhpcy50cmFuc2Zvcm1lcj8uZW5hYmxlKCl9ZGlzYWJsZSgpe3RoaXMudHJhbnNmb3JtZXI/LmRpc2FibGUoKX1hc3luYyB0ZXJtaW5hdGUoKXthd2FpdCB0aGlzLnByb2Nlc3Nvci5kZXN0cm95KCl9Z2V0TGF0ZW5jeSgpe3JldHVybiB0aGlzLnRyYW5zZm9ybWVyPy5nZXRMYXRlbmN5KCk/PzB9Z2V0V2FzbUxhdGVuY3lOcygpe3JldHVybiB0aGlzLnRyYW5zZm9ybWVyPy5nZXRXYXNtTGF0ZW5jeU5zKCk/PzB9fSl9KCk7Cg==';
const blob = typeof window !== 'undefined' && window.Blob && new Blob([atob(encodedJs)], { type: 'text/javascript;charset=utf-8' });
function WorkerWrapper() {
  let objURL;
  try {
    objURL = blob && (window.URL || window.webkitURL).createObjectURL(blob);
    if (!objURL) throw '';
    return new Worker(objURL);
  } catch (e) {
    return new Worker('data:application/javascript;base64,' + encodedJs);
  } finally {
    objURL && (window.URL || window.webkitURL).revokeObjectURL(objURL);
  }
}
class ProcessorMain extends Emittery$1 {
  constructor() {
    super(...arguments);
    this.isEnabled = true;
  }
  async init(options = {}) {
    await this.startWorker(options);
  }
  async enable() {
    this.isEnabled = true;
    await this.worker?.enable();
  }
  async disable() {
    this.isEnabled = false;
    await this.worker?.disable();
  }
  async transform(readable, writable) {
    await this.startWorker();
    await this.worker?.transform(readable, writable);
  }
  async destroy() {
    await this.worker?.terminate();
    this.worker = void 0;
  }
  async setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter) {
    await this.worker?.setAudioOptions(echo_cancellation, auto_gain_control, noise_suppression, stereo_swapping, highpass_filter);
  }
  /**
   * Return the latency of the transformation
   * The latency will be computed only if the options debug flag is true
   * Otherwise, will return 0;
   * @returns latency
   */
  async getLatency() {
    return this.worker?.getLatency() ?? 0;
  }
  /**
   * Return the latency of processing within the wasm in nanoseconds.
   * @returns latency
   */
  async getWasmLatencyNs() {
    return this.worker?.getWasmLatencyNs() ?? 0;
  }
  async startWorker(options = {}) {
    if (this.worker) {
      return;
    }
    this.worker = await workerize(ProcessorWorker, WorkerWrapper);
    this.worker.onAny((name, data) => this.emit(name, data));
    await this.worker.init(options);
    if (!this.isEnabled) {
      await this.worker.disable();
    }
  }
  /**
   * Delete the noise suppression
   */
  async close() {
    await this.worker?.terminate();
  }
}
class VonageNoiseSuppression extends Emittery$1 {
  /**
   * Initialize the transformer.
   * It is mandatory to call this function before using the NoiseSuppression
   * @param options Options used to initialize the transformer
   */
  async init(options = {}) {
    this.worker = new ProcessorMain();
    this.worker.onAny((name, data) => this.emit(name, data));
    await this.worker.init(options);
    this.connector = new Fe(this.worker);
  }
  /**
   * MediaProcessorConnector getter
   * @returns connector
   */
  getConnector() {
    return this.connector;
  }
  /**
   * Delete the noise suppression
   */
  async close() {
    await this.worker?.close();
  }
  /**
   * Enable the noise reduction
   */
  async enable() {
    await this.worker?.enable();
  }
  /**
   * Disable the noise reduction
   */
  async disable() {
    await this.worker?.disable();
  }
  /**
   * Return the latency of the transformation
   * The latency will be computed only if the options debug flag is true
   * Otherwise, will return 0;
   * @returns latency
   */
  async getLatency() {
    return this.worker?.getLatency() ?? 0;
  }
  /**
   * Return the latency of processing within the wasm in nanoseconds.
   * @returns latency
   */
  async getWasmLatencyNs() {
    return this.worker?.getWasmLatencyNs() ?? 0;
  }
}
function createVonageNoiseSuppression() {
  return new VonageNoiseSuppression();
}
export { NoiseSuppressionTransformer, VonageNoiseSuppression, createVonageNoiseSuppression };
