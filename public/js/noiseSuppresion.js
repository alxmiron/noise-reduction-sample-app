let createWasmMonoInstance;
{
  var Module = (() => {
    var _scriptDir = location.href;

    return function (moduleArg = {}) {
      var Module = moduleArg;
      var readyPromiseResolve, readyPromiseReject;
      Module['ready'] = new Promise((resolve, reject) => {
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
      var read_, readAsync, readBinary;
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
      } else {
      }
      var out = Module['print'] || console.log.bind(console);
      var err = Module['printErr'] || console.error.bind(console);
      Object.assign(Module, moduleOverrides);
      moduleOverrides = null;
      if (Module['arguments']) arguments_ = Module['arguments'];
      if (Module['thisProgram']) thisProgram = Module['thisProgram'];
      if (Module['quit']) quit_ = Module['quit'];
      var wasmBinary;
      if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
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
      var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
      function updateMemoryViews() {
        var b = wasmMemory.buffer;
        Module['HEAP8'] = HEAP8 = new Int8Array(b);
        Module['HEAP16'] = HEAP16 = new Int16Array(b);
        Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
        Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
        Module['HEAP32'] = HEAP32 = new Int32Array(b);
        Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
        Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
        Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
      }
      var __ATPRERUN__ = [];
      var __ATINIT__ = [];
      var __ATEXIT__ = [];
      var __ATPOSTRUN__ = [];
      var runtimeInitialized = false;
      var runtimeExited = false;
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
        if (Module['onAbort']) {
          Module['onAbort'](what);
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
      var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
      var wasmBinaryFile;
      if (Module['locateFile']) {
        wasmBinaryFile = 'main-bin-mono.wasm';
        if (!isDataURI(wasmBinaryFile)) {
          wasmBinaryFile = locateFile(wasmBinaryFile);
        }
      } else {
        wasmBinaryFile = new URL('main-bin-mono.wasm', location.href).href;
      }
      function getBinarySync(file) {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
          return readBinary(file);
        }
        throw 'both async and sync fetching of the wasm failed';
      }
      function getBinaryPromise(binaryFile) {
        if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
          if (typeof fetch == 'function') {
            return fetch(binaryFile, { credentials: 'same-origin' })
              .then((response) => {
                if (!response['ok']) {
                  throw "failed to load wasm binary file at '" + binaryFile + "'";
                }
                return response['arrayBuffer']();
              })
              .catch(() => getBinarySync(binaryFile));
          }
        }
        return Promise.resolve().then(() => getBinarySync(binaryFile));
      }
      function instantiateArrayBuffer(binaryFile, imports, receiver) {
        return getBinaryPromise(binaryFile)
          .then((binary) => WebAssembly.instantiate(binary, imports))
          .then((instance) => instance)
          .then(receiver, (reason) => {
            err(`failed to asynchronously prepare wasm: ${reason}`);
            abort(reason);
          });
      }
      function instantiateAsync(binary, binaryFile, imports, callback) {
        if (!binary && typeof WebAssembly.instantiateStreaming == 'function' && !isDataURI(binaryFile) && typeof fetch == 'function') {
          return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
            var result = WebAssembly.instantiateStreaming(response, imports);
            return result.then(callback, function (reason) {
              err(`wasm streaming compile failed: ${reason}`);
              err('falling back to ArrayBuffer instantiation');
              return instantiateArrayBuffer(binaryFile, imports, callback);
            });
          });
        }
        return instantiateArrayBuffer(binaryFile, imports, callback);
      }
      function createWasm() {
        var info = { a: wasmImports };
        function receiveInstance(instance, module) {
          wasmExports = instance.exports;
          wasmMemory = wasmExports['ua'];
          updateMemoryViews();
          wasmTable = wasmExports['wa'];
          addOnInit(wasmExports['va']);
          removeRunDependency('wasm-instantiate');
          return wasmExports;
        }
        addRunDependency('wasm-instantiate');
        function receiveInstantiationResult(result) {
          receiveInstance(result['instance']);
        }
        if (Module['instantiateWasm']) {
          try {
            return Module['instantiateWasm'](info, receiveInstance);
          } catch (e) {
            err(`Module.instantiateWasm callback failed with error: ${e}`);
            readyPromiseReject(e);
          }
        }
        instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
        return {};
      }
      var tempDouble;
      var tempI64;
      function xnnLoadWasmModuleJS(code, offset, offset_end, invalid_function_index) {
        const tableOriginalSize = wasmTable.length;
        const binary = new Uint8Array(HEAPU8.slice(code + offset, code + offset_end));
        try {
          var module = new WebAssembly.Module(binary);
          var instance = new WebAssembly.Instance(module, { env: { memory: wasmMemory } });
          for (var symName in instance.exports) {
            var value = instance.exports[symName];
            addFunction(value);
          }
          if (tableOriginalSize < wasmTable.length) {
            return tableOriginalSize;
          }
          return invalid_function_index;
        } catch (error) {
          console.log(error);
          return invalid_function_index;
        }
      }
      function ExitStatus(status) {
        this.name = 'ExitStatus';
        this.message = `Program terminated with exit(${status})`;
        this.status = status;
      }
      var callRuntimeCallbacks = (callbacks) => {
        while (callbacks.length > 0) {
          callbacks.shift()(Module);
        }
      };
      var noExitRuntime = Module['noExitRuntime'] || false;
      var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
      var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
        var endIdx = idx + maxBytesToRead;
        var endPtr = idx;
        while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
          return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
        }
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
        return str;
      };
      var UTF8ToString = (ptr, maxBytesToRead) => (ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '');
      var ___assert_fail = (condition, filename, line, func) => {
        abort(
          `Assertion failed: ${UTF8ToString(condition)}, at: ` +
            [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']
        );
      };
      var exceptionCaught = [];
      var uncaughtExceptionCount = 0;
      var ___cxa_begin_catch = (ptr) => {
        var info = new ExceptionInfo(ptr);
        if (!info.get_caught()) {
          info.set_caught(true);
          uncaughtExceptionCount--;
        }
        info.set_rethrown(false);
        exceptionCaught.push(info);
        ___cxa_increment_exception_refcount(info.excPtr);
        return info.get_exception_ptr();
      };
      var exceptionLast = 0;
      var ___cxa_end_catch = () => {
        _setThrew(0, 0);
        var info = exceptionCaught.pop();
        ___cxa_decrement_exception_refcount(info.excPtr);
        exceptionLast = 0;
      };
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
      var ___resumeException = (ptr) => {
        if (!exceptionLast) {
          exceptionLast = ptr;
        }
        throw exceptionLast;
      };
      var findMatchingCatch = (args) => {
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
        for (var arg in args) {
          var caughtType = args[arg];
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
      };
      var ___cxa_find_matching_catch_2 = () => findMatchingCatch([]);
      var ___cxa_find_matching_catch_3 = (arg0) => findMatchingCatch([arg0]);
      var ___cxa_rethrow = () => {
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
        throw exceptionLast;
      };
      var ___cxa_throw = (ptr, type, destructor) => {
        var info = new ExceptionInfo(ptr);
        info.init(type, destructor);
        exceptionLast = ptr;
        uncaughtExceptionCount++;
        throw exceptionLast;
      };
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
          var paths = Array.prototype.slice.call(arguments);
          return PATH.normalize(paths.join('/'));
        },
        join2: (l, r) => PATH.normalize(l + '/' + r),
      };
      var initRandomFill = () => {
        if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
          return (view) => crypto.getRandomValues(view);
        } else abort('initRandomDevice');
      };
      var randomFill = (view) => (randomFill = initRandomFill())(view);
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
      var FS_stdin_getChar_buffer = [];
      var lengthBytesUTF8 = (str) => {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var c = str.charCodeAt(i);
          if (c <= 127) {
            len++;
          } else if (c <= 2047) {
            len += 2;
          } else if (c >= 55296 && c <= 57343) {
            len += 4;
            ++i;
          } else {
            len += 3;
          }
        }
        return len;
      };
      var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
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
      };
      function intArrayFromString(stringy, dontAddNull, length) {
        var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
        var u8array = new Array(len);
        var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
        if (dontAddNull) u8array.length = numBytesWritten;
        return u8array;
      }
      var FS_stdin_getChar = () => {
        if (!FS_stdin_getChar_buffer.length) {
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
          FS_stdin_getChar_buffer = intArrayFromString(result, true);
        }
        return FS_stdin_getChar_buffer.shift();
      };
      var TTY = {
        ttys: [],
        init() {},
        shutdown() {},
        register(dev, ops) {
          TTY.ttys[dev] = { input: [], output: [], ops: ops };
          FS.registerDevice(dev, TTY.stream_ops);
        },
        stream_ops: {
          open(stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
              throw new FS.ErrnoError(43);
            }
            stream.tty = tty;
            stream.seekable = false;
          },
          close(stream) {
            stream.tty.ops.fsync(stream.tty);
          },
          fsync(stream) {
            stream.tty.ops.fsync(stream.tty);
          },
          read(stream, buffer, offset, length, pos) {
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
          write(stream, buffer, offset, length, pos) {
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
          get_char(tty) {
            return FS_stdin_getChar();
          },
          put_char(tty, val) {
            if (val === null || val === 10) {
              out(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val);
            }
          },
          fsync(tty) {
            if (tty.output && tty.output.length > 0) {
              out(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          },
          ioctl_tcgets(tty) {
            return {
              c_iflag: 25856,
              c_oflag: 5,
              c_cflag: 191,
              c_lflag: 35387,
              c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            };
          },
          ioctl_tcsets(tty, optional_actions, data) {
            return 0;
          },
          ioctl_tiocgwinsz(tty) {
            return [24, 80];
          },
        },
        default_tty1_ops: {
          put_char(tty, val) {
            if (val === null || val === 10) {
              err(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val);
            }
          },
          fsync(tty) {
            if (tty.output && tty.output.length > 0) {
              err(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          },
        },
      };
      var zeroMemory = (address, size) => {
        HEAPU8.fill(0, address, address + size);
        return address;
      };
      var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
      var mmapAlloc = (size) => {
        size = alignMemory(size, 65536);
        var ptr = _emscripten_builtin_memalign(65536, size);
        if (!ptr) return 0;
        return zeroMemory(ptr, size);
      };
      var MEMFS = {
        ops_table: null,
        mount(mount) {
          return MEMFS.createNode(null, '/', 16384 | 511, 0);
        },
        createNode(parent, name, mode, dev) {
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
        getFileDataAsTypedArray(node) {
          if (!node.contents) return new Uint8Array(0);
          if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
          return new Uint8Array(node.contents);
        },
        expandFileStorage(node, newCapacity) {
          var prevCapacity = node.contents ? node.contents.length : 0;
          if (prevCapacity >= newCapacity) return;
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity);
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
        },
        resizeFileStorage(node, newSize) {
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
          getattr(node) {
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
          setattr(node, attr) {
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
          lookup(parent, name) {
            throw FS.genericErrors[44];
          },
          mknod(parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev);
          },
          rename(old_node, new_dir, new_name) {
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
          unlink(parent, name) {
            delete parent.contents[name];
            parent.timestamp = Date.now();
          },
          rmdir(parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
              throw new FS.ErrnoError(55);
            }
            delete parent.contents[name];
            parent.timestamp = Date.now();
          },
          readdir(node) {
            var entries = ['.', '..'];
            for (var key in node.contents) {
              if (!node.contents.hasOwnProperty(key)) {
                continue;
              }
              entries.push(key);
            }
            return entries;
          },
          symlink(parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node;
          },
          readlink(node) {
            if (!FS.isLink(node.mode)) {
              throw new FS.ErrnoError(28);
            }
            return node.link;
          },
        },
        stream_ops: {
          read(stream, buffer, offset, length, position) {
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
          write(stream, buffer, offset, length, position, canOwn) {
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
          llseek(stream, offset, whence) {
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
          allocate(stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
          },
          mmap(stream, length, position, prot, flags) {
            if (!FS.isFile(stream.node.mode)) {
              throw new FS.ErrnoError(43);
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
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
          msync(stream, buffer, offset, length, mmapFlags) {
            MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0;
          },
        },
      };
      var asyncLoad = (url, onload, onerror, noRunDep) => {
        var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : '';
        readAsync(
          url,
          (arrayBuffer) => {
            assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
            onload(new Uint8Array(arrayBuffer));
            if (dep) removeRunDependency(dep);
          },
          (event) => {
            if (onerror) {
              onerror();
            } else {
              throw `Loading data file "${url}" failed.`;
            }
          }
        );
        if (dep) addRunDependency(dep);
      };
      var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
        FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
      };
      var preloadPlugins = Module['preloadPlugins'] || [];
      var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
        if (typeof Browser != 'undefined') Browser.init();
        var handled = false;
        preloadPlugins.forEach((plugin) => {
          if (handled) return;
          if (plugin['canHandle'](fullname)) {
            plugin['handle'](byteArray, fullname, finish, onerror);
            handled = true;
          }
        });
        return handled;
      };
      var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency(`cp ${fullname}`);
        function processData(byteArray) {
          function finish(byteArray) {
            if (preFinish) preFinish();
            if (!dontCreateFile) {
              FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency(dep);
          }
          if (
            FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
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
      };
      var FS_modeStringToFlags = (str) => {
        var flagModes = { r: 0, 'r+': 2, w: 512 | 64 | 1, 'w+': 512 | 64 | 2, a: 1024 | 64 | 1, 'a+': 1024 | 64 | 2 };
        var flags = flagModes[str];
        if (typeof flags == 'undefined') {
          throw new Error(`Unknown file open mode: ${str}`);
        }
        return flags;
      };
      var FS_getMode = (canRead, canWrite) => {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      };
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
        lookupPath(path, opts = {}) {
          path = PATH_FS.resolve(path);
          if (!path) return { path: '', node: null };
          var defaults = { follow_mount: true, recurse_count: 0 };
          opts = Object.assign(defaults, opts);
          if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(32);
          }
          var parts = path.split('/').filter((p) => !!p);
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
        getPath(node) {
          var path;
          while (true) {
            if (FS.isRoot(node)) {
              var mount = node.mount.mountpoint;
              if (!path) return mount;
              return mount[mount.length - 1] !== '/' ? `${mount}/${path}` : mount + path;
            }
            path = path ? `${node.name}/${path}` : node.name;
            node = node.parent;
          }
        },
        hashName(parentid, name) {
          var hash = 0;
          for (var i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
          }
          return ((parentid + hash) >>> 0) % FS.nameTable.length;
        },
        hashAddNode(node) {
          var hash = FS.hashName(node.parent.id, node.name);
          node.name_next = FS.nameTable[hash];
          FS.nameTable[hash] = node;
        },
        hashRemoveNode(node) {
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
        lookupNode(parent, name) {
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
        createNode(parent, name, mode, rdev) {
          var node = new FS.FSNode(parent, name, mode, rdev);
          FS.hashAddNode(node);
          return node;
        },
        destroyNode(node) {
          FS.hashRemoveNode(node);
        },
        isRoot(node) {
          return node === node.parent;
        },
        isMountpoint(node) {
          return !!node.mounted;
        },
        isFile(mode) {
          return (mode & 61440) === 32768;
        },
        isDir(mode) {
          return (mode & 61440) === 16384;
        },
        isLink(mode) {
          return (mode & 61440) === 40960;
        },
        isChrdev(mode) {
          return (mode & 61440) === 8192;
        },
        isBlkdev(mode) {
          return (mode & 61440) === 24576;
        },
        isFIFO(mode) {
          return (mode & 61440) === 4096;
        },
        isSocket(mode) {
          return (mode & 49152) === 49152;
        },
        flagsToPermissionString(flag) {
          var perms = ['r', 'w', 'rw'][flag & 3];
          if (flag & 512) {
            perms += 'w';
          }
          return perms;
        },
        nodePermissions(node, perms) {
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
        mayLookup(dir) {
          var errCode = FS.nodePermissions(dir, 'x');
          if (errCode) return errCode;
          if (!dir.node_ops.lookup) return 2;
          return 0;
        },
        mayCreate(dir, name) {
          try {
            var node = FS.lookupNode(dir, name);
            return 20;
          } catch (e) {}
          return FS.nodePermissions(dir, 'wx');
        },
        mayDelete(dir, name, isdir) {
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
        mayOpen(node, flags) {
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
        nextfd() {
          for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
            if (!FS.streams[fd]) {
              return fd;
            }
          }
          throw new FS.ErrnoError(33);
        },
        getStreamChecked(fd) {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(8);
          }
          return stream;
        },
        getStream: (fd) => FS.streams[fd],
        createStream(stream, fd = -1) {
          if (!FS.FSStream) {
            FS.FSStream = function () {
              this.shared = {};
            };
            FS.FSStream.prototype = {};
            Object.defineProperties(FS.FSStream.prototype, {
              object: {
                get() {
                  return this.node;
                },
                set(val) {
                  this.node = val;
                },
              },
              isRead: {
                get() {
                  return (this.flags & 2097155) !== 1;
                },
              },
              isWrite: {
                get() {
                  return (this.flags & 2097155) !== 0;
                },
              },
              isAppend: {
                get() {
                  return this.flags & 1024;
                },
              },
              flags: {
                get() {
                  return this.shared.flags;
                },
                set(val) {
                  this.shared.flags = val;
                },
              },
              position: {
                get() {
                  return this.shared.position;
                },
                set(val) {
                  this.shared.position = val;
                },
              },
            });
          }
          stream = Object.assign(new FS.FSStream(), stream);
          if (fd == -1) {
            fd = FS.nextfd();
          }
          stream.fd = fd;
          FS.streams[fd] = stream;
          return stream;
        },
        closeStream(fd) {
          FS.streams[fd] = null;
        },
        chrdev_stream_ops: {
          open(stream) {
            var device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
              stream.stream_ops.open(stream);
            }
          },
          llseek() {
            throw new FS.ErrnoError(70);
          },
        },
        major: (dev) => dev >> 8,
        minor: (dev) => dev & 255,
        makedev: (ma, mi) => (ma << 8) | mi,
        registerDevice(dev, ops) {
          FS.devices[dev] = { stream_ops: ops };
        },
        getDevice: (dev) => FS.devices[dev],
        getMounts(mount) {
          var mounts = [];
          var check = [mount];
          while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts);
          }
          return mounts;
        },
        syncfs(populate, callback) {
          if (typeof populate == 'function') {
            callback = populate;
            populate = false;
          }
          FS.syncFSRequests++;
          if (FS.syncFSRequests > 1) {
            err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
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
        mount(type, opts, mountpoint) {
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
        unmount(mountpoint) {
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
        lookup(parent, name) {
          return parent.node_ops.lookup(parent, name);
        },
        mknod(path, mode, dev) {
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
        create(path, mode) {
          mode = mode !== undefined ? mode : 438;
          mode &= 4095;
          mode |= 32768;
          return FS.mknod(path, mode, 0);
        },
        mkdir(path, mode) {
          mode = mode !== undefined ? mode : 511;
          mode &= 511 | 512;
          mode |= 16384;
          return FS.mknod(path, mode, 0);
        },
        mkdirTree(path, mode) {
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
        mkdev(path, mode, dev) {
          if (typeof dev == 'undefined') {
            dev = mode;
            mode = 438;
          }
          mode |= 8192;
          return FS.mknod(path, mode, dev);
        },
        symlink(oldpath, newpath) {
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
        rename(old_path, new_path) {
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
        rmdir(path) {
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
        readdir(path) {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(54);
          }
          return node.node_ops.readdir(node);
        },
        unlink(path) {
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
        readlink(path) {
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
        stat(path, dontFollow) {
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
        lstat(path) {
          return FS.stat(path, true);
        },
        chmod(path, mode, dontFollow) {
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
        lchmod(path, mode) {
          FS.chmod(path, mode, true);
        },
        fchmod(fd, mode) {
          var stream = FS.getStreamChecked(fd);
          FS.chmod(stream.node, mode);
        },
        chown(path, uid, gid, dontFollow) {
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
        lchown(path, uid, gid) {
          FS.chown(path, uid, gid, true);
        },
        fchown(fd, uid, gid) {
          var stream = FS.getStreamChecked(fd);
          FS.chown(stream.node, uid, gid);
        },
        truncate(path, len) {
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
        ftruncate(fd, len) {
          var stream = FS.getStreamChecked(fd);
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(28);
          }
          FS.truncate(stream.node, len);
        },
        utime(path, atime, mtime) {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
        },
        open(path, flags, mode) {
          if (path === '') {
            throw new FS.ErrnoError(44);
          }
          flags = typeof flags == 'string' ? FS_modeStringToFlags(flags) : flags;
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
        close(stream) {
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
        isClosed(stream) {
          return stream.fd === null;
        },
        llseek(stream, offset, whence) {
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
        read(stream, buffer, offset, length, position) {
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
        write(stream, buffer, offset, length, position, canOwn) {
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
        allocate(stream, offset, length) {
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
        mmap(stream, length, position, prot, flags) {
          if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
            throw new FS.ErrnoError(2);
          }
          if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(2);
          }
          if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(43);
          }
          return stream.stream_ops.mmap(stream, length, position, prot, flags);
        },
        msync(stream, buffer, offset, length, mmapFlags) {
          if (!stream.stream_ops.msync) {
            return 0;
          }
          return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
        },
        munmap: (stream) => 0,
        ioctl(stream, cmd, arg) {
          if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(59);
          }
          return stream.stream_ops.ioctl(stream, cmd, arg);
        },
        readFile(path, opts = {}) {
          opts.flags = opts.flags || 0;
          opts.encoding = opts.encoding || 'binary';
          if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
            throw new Error(`Invalid encoding type "${opts.encoding}"`);
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
        writeFile(path, data, opts = {}) {
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
        chdir(path) {
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
        createDefaultDirectories() {
          FS.mkdir('/tmp');
          FS.mkdir('/home');
          FS.mkdir('/home/web_user');
        },
        createDefaultDevices() {
          FS.mkdir('/dev');
          FS.registerDevice(FS.makedev(1, 3), { read: () => 0, write: (stream, buffer, offset, length, pos) => length });
          FS.mkdev('/dev/null', FS.makedev(1, 3));
          TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
          TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
          FS.mkdev('/dev/tty', FS.makedev(5, 0));
          FS.mkdev('/dev/tty1', FS.makedev(6, 0));
          var randomBuffer = new Uint8Array(1024),
            randomLeft = 0;
          var randomByte = () => {
            if (randomLeft === 0) {
              randomLeft = randomFill(randomBuffer).byteLength;
            }
            return randomBuffer[--randomLeft];
          };
          FS.createDevice('/dev', 'random', randomByte);
          FS.createDevice('/dev', 'urandom', randomByte);
          FS.mkdir('/dev/shm');
          FS.mkdir('/dev/shm/tmp');
        },
        createSpecialDirectories() {
          FS.mkdir('/proc');
          var proc_self = FS.mkdir('/proc/self');
          FS.mkdir('/proc/self/fd');
          FS.mount(
            {
              mount() {
                var node = FS.createNode(proc_self, 'fd', 16384 | 511, 73);
                node.node_ops = {
                  lookup(parent, name) {
                    var fd = +name;
                    var stream = FS.getStreamChecked(fd);
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
        createStandardStreams() {
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
        ensureErrnoError() {
          if (FS.ErrnoError) return;
          FS.ErrnoError = function ErrnoError(errno, node) {
            this.name = 'ErrnoError';
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
        staticInit() {
          FS.ensureErrnoError();
          FS.nameTable = new Array(4096);
          FS.mount(MEMFS, {}, '/');
          FS.createDefaultDirectories();
          FS.createDefaultDevices();
          FS.createSpecialDirectories();
          FS.filesystems = { MEMFS: MEMFS };
        },
        init(input, output, error) {
          FS.init.initialized = true;
          FS.ensureErrnoError();
          Module['stdin'] = input || Module['stdin'];
          Module['stdout'] = output || Module['stdout'];
          Module['stderr'] = error || Module['stderr'];
          FS.createStandardStreams();
        },
        quit() {
          FS.init.initialized = false;
          _fflush(0);
          for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
              continue;
            }
            FS.close(stream);
          }
        },
        findObject(path, dontResolveLastLink) {
          var ret = FS.analyzePath(path, dontResolveLastLink);
          if (!ret.exists) {
            return null;
          }
          return ret.object;
        },
        analyzePath(path, dontResolveLastLink) {
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
        createPath(parent, path, canRead, canWrite) {
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
        createFile(parent, name, properties, canRead, canWrite) {
          var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
          var mode = FS_getMode(canRead, canWrite);
          return FS.create(path, mode);
        },
        createDataFile(parent, name, data, canRead, canWrite, canOwn) {
          var path = name;
          if (parent) {
            parent = typeof parent == 'string' ? parent : FS.getPath(parent);
            path = name ? PATH.join2(parent, name) : parent;
          }
          var mode = FS_getMode(canRead, canWrite);
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
        },
        createDevice(parent, name, input, output) {
          var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
          var mode = FS_getMode(!!input, !!output);
          if (!FS.createDevice.major) FS.createDevice.major = 64;
          var dev = FS.makedev(FS.createDevice.major++, 0);
          FS.registerDevice(dev, {
            open(stream) {
              stream.seekable = false;
            },
            close(stream) {
              if (output && output.buffer && output.buffer.length) {
                output(10);
              }
            },
            read(stream, buffer, offset, length, pos) {
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
            write(stream, buffer, offset, length, pos) {
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
        forceLoadFile(obj) {
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
        createLazyFile(parent, name, url, canRead, canWrite) {
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
              }
              return intArrayFromString(xhr.responseText || '', true);
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
          function writeChunks(stream, buffer, offset, length, position) {
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
          }
          stream_ops.read = (stream, buffer, offset, length, position) => {
            FS.forceLoadFile(node);
            return writeChunks(stream, buffer, offset, length, position);
          };
          stream_ops.mmap = (stream, length, position, prot, flags) => {
            FS.forceLoadFile(node);
            var ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            writeChunks(stream, HEAP8, ptr, length, position);
            return { ptr: ptr, allocated: true };
          };
          node.stream_ops = stream_ops;
          return node;
        },
      };
      var SYSCALLS = {
        DEFAULT_POLLMASK: 5,
        calculateAt(dirfd, path, allowEmpty) {
          if (PATH.isAbs(path)) {
            return path;
          }
          var dir;
          if (dirfd === -100) {
            dir = FS.cwd();
          } else {
            var dirstream = SYSCALLS.getStreamFromFD(dirfd);
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
        doStat(func, path, buf) {
          try {
            var stat = func(path);
          } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
              return -54;
            }
            throw e;
          }
          HEAP32[buf >> 2] = stat.dev;
          HEAP32[(buf + 4) >> 2] = stat.mode;
          HEAPU32[(buf + 8) >> 2] = stat.nlink;
          HEAP32[(buf + 12) >> 2] = stat.uid;
          HEAP32[(buf + 16) >> 2] = stat.gid;
          HEAP32[(buf + 20) >> 2] = stat.rdev;
          (tempI64 = [
            stat.size >>> 0,
            ((tempDouble = stat.size),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 24) >> 2] = tempI64[0]),
            (HEAP32[(buf + 28) >> 2] = tempI64[1]);
          HEAP32[(buf + 32) >> 2] = 4096;
          HEAP32[(buf + 36) >> 2] = stat.blocks;
          var atime = stat.atime.getTime();
          var mtime = stat.mtime.getTime();
          var ctime = stat.ctime.getTime();
          (tempI64 = [
            Math.floor(atime / 1e3) >>> 0,
            ((tempDouble = Math.floor(atime / 1e3)),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 40) >> 2] = tempI64[0]),
            (HEAP32[(buf + 44) >> 2] = tempI64[1]);
          HEAPU32[(buf + 48) >> 2] = (atime % 1e3) * 1e3;
          (tempI64 = [
            Math.floor(mtime / 1e3) >>> 0,
            ((tempDouble = Math.floor(mtime / 1e3)),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 56) >> 2] = tempI64[0]),
            (HEAP32[(buf + 60) >> 2] = tempI64[1]);
          HEAPU32[(buf + 64) >> 2] = (mtime % 1e3) * 1e3;
          (tempI64 = [
            Math.floor(ctime / 1e3) >>> 0,
            ((tempDouble = Math.floor(ctime / 1e3)),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 72) >> 2] = tempI64[0]),
            (HEAP32[(buf + 76) >> 2] = tempI64[1]);
          HEAPU32[(buf + 80) >> 2] = (ctime % 1e3) * 1e3;
          (tempI64 = [
            stat.ino >>> 0,
            ((tempDouble = stat.ino),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 88) >> 2] = tempI64[0]),
            (HEAP32[(buf + 92) >> 2] = tempI64[1]);
          return 0;
        },
        doMsync(addr, stream, len, flags, offset) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          if (flags & 2) {
            return 0;
          }
          var buffer = HEAPU8.slice(addr, addr + len);
          FS.msync(stream, buffer, offset, len, flags);
        },
        varargs: undefined,
        get() {
          var ret = HEAP32[+SYSCALLS.varargs >> 2];
          SYSCALLS.varargs += 4;
          return ret;
        },
        getp() {
          return SYSCALLS.get();
        },
        getStr(ptr) {
          var ret = UTF8ToString(ptr);
          return ret;
        },
        getStreamFromFD(fd) {
          var stream = FS.getStreamChecked(fd);
          return stream;
        },
      };
      function ___syscall_fstat64(fd, buf) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          return SYSCALLS.doStat(FS.stat, stream.path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      var convertI32PairToI53Checked = (lo, hi) => ((hi + 2097152) >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN);
      function ___syscall_ftruncate64(fd, length_low, length_high) {
        var length = convertI32PairToI53Checked(length_low, length_high);
        try {
          if (isNaN(length)) return 61;
          FS.ftruncate(fd, length);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function ___syscall_newfstatat(dirfd, path, buf, flags) {
        try {
          path = SYSCALLS.getStr(path);
          var nofollow = flags & 256;
          var allowEmpty = flags & 4096;
          flags = flags & ~6400;
          path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
          return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
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
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
      function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
        try {
          path = SYSCALLS.getStr(path);
          path = SYSCALLS.calculateAt(dirfd, path);
          if (bufsize <= 0) return -28;
          var ret = FS.readlink(path);
          var len = Math.min(bufsize, lengthBytesUTF8(ret));
          var endChar = HEAP8[buf + len];
          stringToUTF8(ret, buf, bufsize + 1);
          HEAP8[buf + len] = endChar;
          return len;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
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
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function ___syscall_stat64(path, buf) {
        try {
          path = SYSCALLS.getStr(path);
          return SYSCALLS.doStat(FS.stat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
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
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {};
      var embind_init_charCodes = () => {
        var codes = new Array(256);
        for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
        }
        embind_charCodes = codes;
      };
      var embind_charCodes;
      var readLatin1String = (ptr) => {
        var ret = '';
        var c = ptr;
        while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
        }
        return ret;
      };
      var awaitingDependencies = {};
      var registeredTypes = {};
      var typeDependencies = {};
      var BindingError;
      var throwBindingError = (message) => {
        throw new BindingError(message);
      };
      var InternalError;
      var throwInternalError = (message) => {
        throw new InternalError(message);
      };
      var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
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
      };
      function sharedRegisterType(rawType, registeredInstance, options = {}) {
        var name = registeredInstance.name;
        if (!rawType) {
          throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
        }
        if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
            return;
          } else {
            throwBindingError(`Cannot register type '${name}' twice`);
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
      function registerType(rawType, registeredInstance, options = {}) {
        if (!('argPackAdvance' in registeredInstance)) {
          throw new TypeError('registerType registeredInstance requires argPackAdvance');
        }
        return sharedRegisterType(rawType, registeredInstance, options);
      }
      var GenericWireTypeSize = 8;
      var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: function (wt) {
            return !!wt;
          },
          toWireType: function (destructors, o) {
            return o ? trueValue : falseValue;
          },
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: function (pointer) {
            return this['fromWireType'](HEAPU8[pointer]);
          },
          destructorFunction: null,
        });
      };
      var shallowCopyInternalPointer = (o) => ({
        count: o.count,
        deleteScheduled: o.deleteScheduled,
        preservePointerOnDelete: o.preservePointerOnDelete,
        ptr: o.ptr,
        ptrType: o.ptrType,
        smartPtr: o.smartPtr,
        smartPtrType: o.smartPtrType,
      });
      var throwInstanceAlreadyDeleted = (obj) => {
        function getInstanceTypeName(handle) {
          return handle.$$.ptrType.registeredClass.name;
        }
        throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
      };
      var finalizationRegistry = false;
      var detachFinalizer = (handle) => {};
      var runDestructor = ($$) => {
        if ($$.smartPtr) {
          $$.smartPtrType.rawDestructor($$.smartPtr);
        } else {
          $$.ptrType.registeredClass.rawDestructor($$.ptr);
        }
      };
      var releaseClassHandle = ($$) => {
        $$.count.value -= 1;
        var toDelete = 0 === $$.count.value;
        if (toDelete) {
          runDestructor($$);
        }
      };
      var downcastPointer = (ptr, ptrClass, desiredClass) => {
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
      };
      var registeredPointers = {};
      var getInheritedInstanceCount = () => Object.keys(registeredInstances).length;
      var getLiveInheritedInstances = () => {
        var rv = [];
        for (var k in registeredInstances) {
          if (registeredInstances.hasOwnProperty(k)) {
            rv.push(registeredInstances[k]);
          }
        }
        return rv;
      };
      var deletionQueue = [];
      var flushPendingDeletes = () => {
        while (deletionQueue.length) {
          var obj = deletionQueue.pop();
          obj.$$.deleteScheduled = false;
          obj['delete']();
        }
      };
      var delayFunction;
      var setDelayFunction = (fn) => {
        delayFunction = fn;
        if (deletionQueue.length && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
      };
      var init_embind = () => {
        Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
        Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
        Module['flushPendingDeletes'] = flushPendingDeletes;
        Module['setDelayFunction'] = setDelayFunction;
      };
      var registeredInstances = {};
      var getBasestPointer = (class_, ptr) => {
        if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
        }
        while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
        }
        return ptr;
      };
      var getInheritedInstance = (class_, ptr) => {
        ptr = getBasestPointer(class_, ptr);
        return registeredInstances[ptr];
      };
      var makeClassHandle = (prototype, record) => {
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
      };
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
      var attachFinalizer = (handle) => {
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
      };
      var init_ClassHandle = () => {
        Object.assign(ClassHandle.prototype, {
          isAliasOf(other) {
            if (!(this instanceof ClassHandle)) {
              return false;
            }
            if (!(other instanceof ClassHandle)) {
              return false;
            }
            var leftClass = this.$$.ptrType.registeredClass;
            var left = this.$$.ptr;
            other.$$ = other.$$;
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
          },
          clone() {
            if (!this.$$.ptr) {
              throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.preservePointerOnDelete) {
              this.$$.count.value += 1;
              return this;
            } else {
              var clone = attachFinalizer(
                Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } })
              );
              clone.$$.count.value += 1;
              clone.$$.deleteScheduled = false;
              return clone;
            }
          },
          delete() {
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
          },
          isDeleted() {
            return !this.$$.ptr;
          },
          deleteLater() {
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
          },
        });
      };
      function ClassHandle() {}
      var createNamedFunction = (name, body) => Object.defineProperty(body, 'name', { value: name });
      var ensureOverloadTable = (proto, methodName, humanName) => {
        if (undefined === proto[methodName].overloadTable) {
          var prevFunc = proto[methodName];
          proto[methodName] = function () {
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
              throwBindingError(
                `Function '${humanName}' called with an invalid number of arguments (${arguments.length}) - expects one of (${proto[methodName].overloadTable})!`
              );
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
          };
          proto[methodName].overloadTable = [];
          proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
        }
      };
      var exposePublicSymbol = (name, value, numArguments) => {
        if (Module.hasOwnProperty(name)) {
          if (
            undefined === numArguments ||
            (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])
          ) {
            throwBindingError(`Cannot register public name '${name}' twice`);
          }
          ensureOverloadTable(Module, name, name);
          if (Module.hasOwnProperty(numArguments)) {
            throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);
          }
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          if (undefined !== numArguments) {
            Module[name].numArguments = numArguments;
          }
        }
      };
      var char_0 = 48;
      var char_9 = 57;
      var makeLegalFunctionName = (name) => {
        if (undefined === name) {
          return '_unknown';
        }
        name = name.replace(/[^a-zA-Z0-9_]/g, '$');
        var f = name.charCodeAt(0);
        if (f >= char_0 && f <= char_9) {
          return `_${name}`;
        }
        return name;
      };
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
      var upcastPointer = (ptr, ptrClass, desiredClass) => {
        while (ptrClass !== desiredClass) {
          if (!ptrClass.upcast) {
            throwBindingError(`Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`);
          }
          ptr = ptrClass.upcast(ptr);
          ptrClass = ptrClass.baseClass;
        }
        return ptr;
      };
      function constNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError(`null is not a valid ${this.name}`);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
        }
        if (!handle.$$.ptr) {
          throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function genericPointerToWireType(destructors, handle) {
        var ptr;
        if (handle === null) {
          if (this.isReference) {
            throwBindingError(`null is not a valid ${this.name}`);
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
          throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
        }
        if (!handle.$$.ptr) {
          throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
        }
        if (!this.isConst && handle.$$.ptrType.isConst) {
          throwBindingError(
            `Cannot convert argument of type ${
              handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name
            } to parameter type ${this.name}`
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
                  `Cannot convert argument of type ${
                    handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name
                  } to parameter type ${this.name}`
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
                  Emval.toHandle(() => clonedHandle['delete']())
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
            throwBindingError(`null is not a valid ${this.name}`);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
        }
        if (!handle.$$.ptr) {
          throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
        }
        if (handle.$$.ptrType.isConst) {
          throwBindingError(`Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function readPointer(pointer) {
        return this['fromWireType'](HEAPU32[pointer >> 2]);
      }
      var init_RegisteredPointer = () => {
        Object.assign(RegisteredPointer.prototype, {
          getPointee(ptr) {
            if (this.rawGetPointee) {
              ptr = this.rawGetPointee(ptr);
            }
            return ptr;
          },
          destructor(ptr) {
            if (this.rawDestructor) {
              this.rawDestructor(ptr);
            }
          },
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: readPointer,
          deleteObject(handle) {
            if (handle !== null) {
              handle['delete']();
            }
          },
          fromWireType: RegisteredPointer_fromWireType,
        });
      };
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
      var replacePublicSymbol = (name, value, numArguments) => {
        if (!Module.hasOwnProperty(name)) {
          throwInternalError('Replacing nonexistant public symbol');
        }
        if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          Module[name].argCount = numArguments;
        }
      };
      var dynCallLegacy = (sig, ptr, args) => {
        var f = Module['dynCall_' + sig];
        return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
      };
      var wasmTableMirror = [];
      var wasmTable;
      var getWasmTableEntry = (funcPtr) => {
        var func = wasmTableMirror[funcPtr];
        if (!func) {
          if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
          wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
        }
        return func;
      };
      var dynCall = (sig, ptr, args) => {
        if (sig.includes('j')) {
          return dynCallLegacy(sig, ptr, args);
        }
        var rtn = getWasmTableEntry(ptr).apply(null, args);
        return rtn;
      };
      var getDynCaller = (sig, ptr) => {
        var argCache = [];
        return function () {
          argCache.length = 0;
          Object.assign(argCache, arguments);
          return dynCall(sig, ptr, argCache);
        };
      };
      var embind__requireFunction = (signature, rawFunction) => {
        signature = readLatin1String(signature);
        function makeDynCaller() {
          if (signature.includes('j')) {
            return getDynCaller(signature, rawFunction);
          }
          return getWasmTableEntry(rawFunction);
        }
        var fp = makeDynCaller();
        if (typeof fp != 'function') {
          throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
        }
        return fp;
      };
      var extendError = (baseErrorType, errorName) => {
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
            return `${this.name}: ${this.message}`;
          }
        };
        return errorClass;
      };
      var UnboundTypeError;
      var getTypeName = (type) => {
        var ptr = ___getTypeName(type);
        var rv = readLatin1String(ptr);
        _free(ptr);
        return rv;
      };
      var throwUnboundTypeError = (message, types) => {
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
        throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([', ']));
      };
      var __embind_register_class = (
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
      ) => {
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
          throwUnboundTypeError(`Cannot construct ${name} due to unbound types`, [baseClassRawType]);
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
            var constructor = createNamedFunction(name, function () {
              if (Object.getPrototypeOf(this) !== instancePrototype) {
                throw new BindingError("Use 'new' to construct " + name);
              }
              if (undefined === registeredClass.constructor_body) {
                throw new BindingError(name + ' has no accessible constructor');
              }
              var body = registeredClass.constructor_body[arguments.length];
              if (undefined === body) {
                throw new BindingError(
                  `Tried to invoke ctor of ${name} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(
                    registeredClass.constructor_body
                  ).toString()}) parameters instead!`
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
            if (registeredClass.baseClass) {
              if (registeredClass.baseClass.__derivedClasses === undefined) {
                registeredClass.baseClass.__derivedClasses = [];
              }
              registeredClass.baseClass.__derivedClasses.push(registeredClass);
            }
            var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
            var pointerConverter = new RegisteredPointer(name + '*', registeredClass, false, false, false);
            var constPointerConverter = new RegisteredPointer(name + ' const*', registeredClass, false, true, false);
            registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter };
            replacePublicSymbol(legalFunctionName, constructor);
            return [referenceConverter, pointerConverter, constPointerConverter];
          }
        );
      };
      var heap32VectorToArray = (count, firstElement) => {
        var array = [];
        for (var i = 0; i < count; i++) {
          array.push(HEAPU32[(firstElement + i * 4) >> 2]);
        }
        return array;
      };
      var runDestructors = (destructors) => {
        while (destructors.length) {
          var ptr = destructors.pop();
          var del = destructors.pop();
          del(ptr);
        }
      };
      function newFunc(constructor, argumentList) {
        if (!(constructor instanceof Function)) {
          throw new TypeError(`new_ called with constructor type ${typeof constructor} which is not a function`);
        }
        var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function () {});
        dummy.prototype = constructor.prototype;
        var obj = new dummy();
        var r = constructor.apply(obj, argumentList);
        return r instanceof Object ? r : obj;
      }
      function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, isAsync) {
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
        var invokerFnBody = `\n        return function (${argsList}) {\n        if (arguments.length !== ${
          argCount - 2
        }) {\n          throwBindingError('function ${humanName} called with ' + arguments.length + ' arguments, expected ${
          argCount - 2
        }');\n        }`;
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
        invokerFnBody +=
          (returns || isAsync ? 'var rv = ' : '') + 'invoker(fn' + (argsListWired.length > 0 ? ', ' : '') + argsListWired + ');\n';
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
        var invokerFn = newFunc(Function, args1).apply(null, args2);
        return createNamedFunction(humanName, invokerFn);
      }
      var __embind_register_class_constructor = (rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) => {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        invoker = embind__requireFunction(invokerSignature, invoker);
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
          classType = classType[0];
          var humanName = `constructor ${classType.name}`;
          if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = [];
          }
          if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError(
              `Cannot register multiple constructors with identical number of parameters (${argCount - 1}) for class '${
                classType.name
              }'! Overload resolution is currently only performed using the parameter count, not actual type info!`
            );
          }
          classType.registeredClass.constructor_body[argCount - 1] = () => {
            throwUnboundTypeError(`Cannot construct ${classType.name} due to unbound types`, rawArgTypes);
          };
          whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
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
      };
      var getFunctionName = (signature) => {
        signature = signature.trim();
        const argsIndex = signature.indexOf('(');
        if (argsIndex !== -1) {
          return signature.substr(0, argsIndex);
        } else {
          return signature;
        }
      };
      var __embind_register_class_function = (
        rawClassType,
        methodName,
        argCount,
        rawArgTypesAddr,
        invokerSignature,
        rawInvoker,
        context,
        isPureVirtual,
        isAsync
      ) => {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        methodName = readLatin1String(methodName);
        methodName = getFunctionName(methodName);
        rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
          classType = classType[0];
          var humanName = `${classType.name}.${methodName}`;
          if (methodName.startsWith('@@')) {
            methodName = Symbol[methodName.substring(2)];
          }
          if (isPureVirtual) {
            classType.registeredClass.pureVirtualFunctions.push(methodName);
          }
          function unboundTypesHandler() {
            throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes);
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
            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context, isAsync);
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
      };
      function handleAllocatorInit() {
        Object.assign(HandleAllocator.prototype, {
          get(id) {
            return this.allocated[id];
          },
          has(id) {
            return this.allocated[id] !== undefined;
          },
          allocate(handle) {
            var id = this.freelist.pop() || this.allocated.length;
            this.allocated[id] = handle;
            return id;
          },
          free(id) {
            this.allocated[id] = undefined;
            this.freelist.push(id);
          },
        });
      }
      function HandleAllocator() {
        this.allocated = [undefined];
        this.freelist = [];
      }
      var emval_handles = new HandleAllocator();
      var __emval_decref = (handle) => {
        if (handle >= emval_handles.reserved && 0 === --emval_handles.get(handle).refcount) {
          emval_handles.free(handle);
        }
      };
      var count_emval_handles = () => {
        var count = 0;
        for (var i = emval_handles.reserved; i < emval_handles.allocated.length; ++i) {
          if (emval_handles.allocated[i] !== undefined) {
            ++count;
          }
        }
        return count;
      };
      var init_emval = () => {
        emval_handles.allocated.push({ value: undefined }, { value: null }, { value: true }, { value: false });
        emval_handles.reserved = emval_handles.allocated.length;
        Module['count_emval_handles'] = count_emval_handles;
      };
      var Emval = {
        toValue: (handle) => {
          if (!handle) {
            throwBindingError('Cannot use deleted val. handle = ' + handle);
          }
          return emval_handles.get(handle).value;
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
              return emval_handles.allocate({ refcount: 1, value: value });
            }
          }
        },
      };
      function simpleReadValueFromPointer(pointer) {
        return this['fromWireType'](HEAP32[pointer >> 2]);
      }
      var __embind_register_emval = (rawType, name) => {
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: (handle) => {
            var rv = Emval.toValue(handle);
            __emval_decref(handle);
            return rv;
          },
          toWireType: (destructors, value) => Emval.toHandle(value),
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction: null,
        });
      };
      var embindRepr = (v) => {
        if (v === null) {
          return 'null';
        }
        var t = typeof v;
        if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
        } else {
          return '' + v;
        }
      };
      var floatReadValueFromPointer = (name, width) => {
        switch (width) {
          case 4:
            return function (pointer) {
              return this['fromWireType'](HEAPF32[pointer >> 2]);
            };
          case 8:
            return function (pointer) {
              return this['fromWireType'](HEAPF64[pointer >> 3]);
            };
          default:
            throw new TypeError(`invalid float width (${width}): ${name}`);
        }
      };
      var __embind_register_float = (rawType, name, size) => {
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: (value) => value,
          toWireType: (destructors, value) => value,
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: floatReadValueFromPointer(name, size),
          destructorFunction: null,
        });
      };
      var integerReadValueFromPointer = (name, width, signed) => {
        switch (width) {
          case 1:
            return signed ? (pointer) => HEAP8[pointer >> 0] : (pointer) => HEAPU8[pointer >> 0];
          case 2:
            return signed ? (pointer) => HEAP16[pointer >> 1] : (pointer) => HEAPU16[pointer >> 1];
          case 4:
            return signed ? (pointer) => HEAP32[pointer >> 2] : (pointer) => HEAPU32[pointer >> 2];
          default:
            throw new TypeError(`invalid integer width (${width}): ${name}`);
        }
      };
      var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
        name = readLatin1String(name);
        if (maxRange === -1) {
          maxRange = 4294967295;
        }
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
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: integerReadValueFromPointer(name, size, minRange !== 0),
          destructorFunction: null,
        });
      };
      var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
        var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
        var TA = typeMapping[dataTypeIndex];
        function decodeMemoryView(handle) {
          var size = HEAPU32[handle >> 2];
          var data = HEAPU32[(handle + 4) >> 2];
          return new TA(HEAP8.buffer, data, size);
        }
        name = readLatin1String(name);
        registerType(
          rawType,
          { name: name, fromWireType: decodeMemoryView, argPackAdvance: GenericWireTypeSize, readValueFromPointer: decodeMemoryView },
          { ignoreDuplicateRegistrations: true }
        );
      };
      var __embind_register_std_string = (rawType, name) => {
        name = readLatin1String(name);
        var stdStringIsUTF8 = name === 'std::string';
        registerType(rawType, {
          name: name,
          fromWireType(value) {
            var length = HEAPU32[value >> 2];
            var payload = value + 4;
            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = payload;
              for (var i = 0; i <= length; ++i) {
                var currentBytePtr = payload + i;
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
                a[i] = String.fromCharCode(HEAPU8[payload + i]);
              }
              str = a.join('');
            }
            _free(value);
            return str;
          },
          toWireType(destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }
            var length;
            var valueIsOfTypeString = typeof value == 'string';
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
              throwBindingError('Cannot pass non-string to std::string');
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              length = lengthBytesUTF8(value);
            } else {
              length = value.length;
            }
            var base = _malloc(4 + length + 1);
            var ptr = base + 4;
            HEAPU32[base >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0; i < length; ++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                  }
                  HEAPU8[ptr + i] = charCode;
                }
              } else {
                for (var i = 0; i < length; ++i) {
                  HEAPU8[ptr + i] = value[i];
                }
              }
            }
            if (destructors !== null) {
              destructors.push(_free, base);
            }
            return base;
          },
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: readPointer,
          destructorFunction(ptr) {
            _free(ptr);
          },
        });
      };
      var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;
      var UTF16ToString = (ptr, maxBytesToRead) => {
        var endPtr = ptr;
        var idx = endPtr >> 1;
        var maxIdx = idx + maxBytesToRead / 2;
        while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
        endPtr = idx << 1;
        if (endPtr - ptr > 32 && UTF16Decoder) return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
        var str = '';
        for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
          var codeUnit = HEAP16[(ptr + i * 2) >> 1];
          if (codeUnit == 0) break;
          str += String.fromCharCode(codeUnit);
        }
        return str;
      };
      var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
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
      };
      var lengthBytesUTF16 = (str) => str.length * 2;
      var UTF32ToString = (ptr, maxBytesToRead) => {
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
      };
      var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
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
      };
      var lengthBytesUTF32 = (str) => {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
          len += 4;
        }
        return len;
      };
      var __embind_register_std_wstring = (rawType, charSize, name) => {
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
          fromWireType: (value) => {
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
          toWireType: (destructors, value) => {
            if (!(typeof value == 'string')) {
              throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
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
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction(ptr) {
            _free(ptr);
          },
        });
      };
      var __embind_register_void = (rawType, name) => {
        name = readLatin1String(name);
        registerType(rawType, {
          isVoid: true,
          name: name,
          argPackAdvance: 0,
          fromWireType: () => undefined,
          toWireType: (destructors, o) => undefined,
        });
      };
      var nowIsMonotonic = 1;
      var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
      var __emval_incref = (handle) => {
        if (handle > 4) {
          emval_handles.get(handle).refcount += 1;
        }
      };
      var requireRegisteredType = (rawType, humanName) => {
        var impl = registeredTypes[rawType];
        if (undefined === impl) {
          throwBindingError(humanName + ' has unknown type ' + getTypeName(rawType));
        }
        return impl;
      };
      var __emval_take_value = (type, arg) => {
        type = requireRegisteredType(type, '_emval_take_value');
        var v = type['readValueFromPointer'](arg);
        return Emval.toHandle(v);
      };
      function __mmap_js(len, prot, flags, fd, offset_low, offset_high, allocated, addr) {
        var offset = convertI32PairToI53Checked(offset_low, offset_high);
        try {
          if (isNaN(offset)) return 61;
          var stream = SYSCALLS.getStreamFromFD(fd);
          var res = FS.mmap(stream, len, offset, prot, flags);
          var ptr = res.ptr;
          HEAP32[allocated >> 2] = res.allocated;
          HEAPU32[addr >> 2] = ptr;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function __munmap_js(addr, len, prot, flags, fd, offset_low, offset_high) {
        var offset = convertI32PairToI53Checked(offset_low, offset_high);
        try {
          if (isNaN(offset)) return 61;
          var stream = SYSCALLS.getStreamFromFD(fd);
          if (prot & 2) {
            SYSCALLS.doMsync(addr, stream, len, flags, offset);
          }
          FS.munmap(stream);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      var _abort = () => {
        abort('');
      };
      var _emscripten_date_now = () => Date.now();
      var getHeapMax = () => HEAPU8.length;
      var _emscripten_get_heap_max = () => getHeapMax();
      var _emscripten_get_now;
      _emscripten_get_now = () => performance.now();
      var _emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);
      var abortOnCannotGrowMemory = (requestedSize) => {
        abort('OOM');
      };
      var _emscripten_resize_heap = (requestedSize) => {
        var oldSize = HEAPU8.length;
        requestedSize >>>= 0;
        abortOnCannotGrowMemory(requestedSize);
      };
      var ENV = {};
      var getExecutableName = () => thisProgram || './this.program';
      var getEnvStrings = () => {
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
            strings.push(`${x}=${env[x]}`);
          }
          getEnvStrings.strings = strings;
        }
        return getEnvStrings.strings;
      };
      var stringToAscii = (str, buffer) => {
        for (var i = 0; i < str.length; ++i) {
          HEAP8[buffer++ >> 0] = str.charCodeAt(i);
        }
        HEAP8[buffer >> 0] = 0;
      };
      var _environ_get = (__environ, environ_buf) => {
        var bufSize = 0;
        getEnvStrings().forEach((string, i) => {
          var ptr = environ_buf + bufSize;
          HEAPU32[(__environ + i * 4) >> 2] = ptr;
          stringToAscii(string, ptr);
          bufSize += string.length + 1;
        });
        return 0;
      };
      var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
        var strings = getEnvStrings();
        HEAPU32[penviron_count >> 2] = strings.length;
        var bufSize = 0;
        strings.forEach((string) => (bufSize += string.length + 1));
        HEAPU32[penviron_buf_size >> 2] = bufSize;
        return 0;
      };
      var runtimeKeepaliveCounter = 0;
      var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
      var _proc_exit = (code) => {
        EXITSTATUS = code;
        if (!keepRuntimeAlive()) {
          if (Module['onExit']) Module['onExit'](code);
          ABORT = true;
        }
        quit_(code, new ExitStatus(code));
      };
      var exitJS = (status, implicit) => {
        EXITSTATUS = status;
        if (!keepRuntimeAlive()) {
          exitRuntime();
        }
        _proc_exit(status);
      };
      var _exit = exitJS;
      function _fd_close(fd) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          FS.close(stream);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return e.errno;
        }
      }
      var doReadv = (stream, iov, iovcnt, offset) => {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAPU32[iov >> 2];
          var len = HEAPU32[(iov + 4) >> 2];
          iov += 8;
          var curr = FS.read(stream, HEAP8, ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break;
          if (typeof offset !== 'undefined') {
            offset += curr;
          }
        }
        return ret;
      };
      function _fd_read(fd, iov, iovcnt, pnum) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doReadv(stream, iov, iovcnt);
          HEAPU32[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return e.errno;
        }
      }
      function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
        var offset = convertI32PairToI53Checked(offset_low, offset_high);
        try {
          if (isNaN(offset)) return 61;
          var stream = SYSCALLS.getStreamFromFD(fd);
          FS.llseek(stream, offset, whence);
          (tempI64 = [
            stream.position >>> 0,
            ((tempDouble = stream.position),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[newOffset >> 2] = tempI64[0]),
            (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
          if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return e.errno;
        }
      }
      function _fd_sync(fd) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          if (stream.stream_ops && stream.stream_ops.fsync) {
            return stream.stream_ops.fsync(stream);
          }
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return e.errno;
        }
      }
      var doWritev = (stream, iov, iovcnt, offset) => {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAPU32[iov >> 2];
          var len = HEAPU32[(iov + 4) >> 2];
          iov += 8;
          var curr = FS.write(stream, HEAP8, ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (typeof offset !== 'undefined') {
            offset += curr;
          }
        }
        return ret;
      };
      function _fd_write(fd, iov, iovcnt, pnum) {
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doWritev(stream, iov, iovcnt);
          HEAPU32[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return e.errno;
        }
      }
      var _getentropy = (buffer, size) => {
        randomFill(HEAPU8.subarray(buffer, buffer + size));
        return 0;
      };
      var isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      var arraySum = (array, index) => {
        var sum = 0;
        for (var i = 0; i <= index; sum += array[i++]) {}
        return sum;
      };
      var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var addDays = (date, days) => {
        var newDate = new Date(date.getTime());
        while (days > 0) {
          var leap = isLeapYear(newDate.getFullYear());
          var currentMonth = newDate.getMonth();
          var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
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
      };
      var writeArrayToMemory = (array, buffer) => {
        HEAP8.set(array, buffer);
      };
      var _strftime = (s, maxsize, format, tm) => {
        var tm_zone = HEAPU32[(tm + 40) >> 2];
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
          var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear() + 1;
            }
            return thisDate.getFullYear();
          }
          return thisDate.getFullYear() - 1;
        }
        var EXPANSION_RULES_2 = {
          '%a': (date) => WEEKDAYS[date.tm_wday].substring(0, 3),
          '%A': (date) => WEEKDAYS[date.tm_wday],
          '%b': (date) => MONTHS[date.tm_mon].substring(0, 3),
          '%B': (date) => MONTHS[date.tm_mon],
          '%C': (date) => {
            var year = date.tm_year + 1900;
            return leadingNulls((year / 100) | 0, 2);
          },
          '%d': (date) => leadingNulls(date.tm_mday, 2),
          '%e': (date) => leadingSomething(date.tm_mday, 2, ' '),
          '%g': (date) => getWeekBasedYear(date).toString().substring(2),
          '%G': (date) => getWeekBasedYear(date),
          '%H': (date) => leadingNulls(date.tm_hour, 2),
          '%I': (date) => {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0) twelveHour = 12;
            else if (twelveHour > 12) twelveHour -= 12;
            return leadingNulls(twelveHour, 2);
          },
          '%j': (date) =>
            leadingNulls(
              date.tm_mday + arraySum(isLeapYear(date.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, date.tm_mon - 1),
              3
            ),
          '%m': (date) => leadingNulls(date.tm_mon + 1, 2),
          '%M': (date) => leadingNulls(date.tm_min, 2),
          '%n': () => '\n',
          '%p': (date) => {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
              return 'AM';
            }
            return 'PM';
          },
          '%S': (date) => leadingNulls(date.tm_sec, 2),
          '%t': () => '\t',
          '%u': (date) => date.tm_wday || 7,
          '%U': (date) => {
            var days = date.tm_yday + 7 - date.tm_wday;
            return leadingNulls(Math.floor(days / 7), 2);
          },
          '%V': (date) => {
            var val = Math.floor((date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7);
            if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
              val++;
            }
            if (!val) {
              val = 52;
              var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
              if (dec31 == 4 || (dec31 == 5 && isLeapYear((date.tm_year % 400) - 1))) {
                val++;
              }
            } else if (val == 53) {
              var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
              if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
            }
            return leadingNulls(val, 2);
          },
          '%w': (date) => date.tm_wday,
          '%W': (date) => {
            var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
            return leadingNulls(Math.floor(days / 7), 2);
          },
          '%y': (date) => (date.tm_year + 1900).toString().substring(2),
          '%Y': (date) => date.tm_year + 1900,
          '%z': (date) => {
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = (off / 60) * 100 + (off % 60);
            return (ahead ? '+' : '-') + String('0000' + off).slice(-4);
          },
          '%Z': (date) => date.tm_zone,
          '%%': () => '%',
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
      };
      var _strftime_l = (s, maxsize, format, tm, loc) => _strftime(s, maxsize, format, tm);
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
      FS.createPreloadedFile = FS_createPreloadedFile;
      FS.staticInit();
      embind_init_charCodes();
      BindingError = Module['BindingError'] = class BindingError extends Error {
        constructor(message) {
          super(message);
          this.name = 'BindingError';
        }
      };
      InternalError = Module['InternalError'] = class InternalError extends Error {
        constructor(message) {
          super(message);
          this.name = 'InternalError';
        }
      };
      init_ClassHandle();
      init_embind();
      init_RegisteredPointer();
      UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');
      handleAllocatorInit();
      init_emval();
      var wasmImports = {
        a: ___assert_fail,
        t: ___cxa_begin_catch,
        s: ___cxa_end_catch,
        c: ___cxa_find_matching_catch_2,
        j: ___cxa_find_matching_catch_3,
        oa: ___cxa_rethrow,
        m: ___cxa_throw,
        g: ___resumeException,
        ea: ___syscall_fstat64,
        R: ___syscall_ftruncate64,
        ca: ___syscall_newfstatat,
        fa: ___syscall_openat,
        _: ___syscall_readlinkat,
        Z: ___syscall_renameat,
        da: ___syscall_stat64,
        X: ___syscall_unlinkat,
        S: __embind_register_bigint,
        ja: __embind_register_bool,
        N: __embind_register_class,
        M: __embind_register_class_constructor,
        l: __embind_register_class_function,
        ia: __embind_register_emval,
        H: __embind_register_float,
        o: __embind_register_integer,
        k: __embind_register_memory_view,
        G: __embind_register_std_string,
        z: __embind_register_std_wstring,
        ka: __embind_register_void,
        ga: __emscripten_get_now_is_monotonic,
        sa: __emval_decref,
        ta: __emval_incref,
        q: __emval_take_value,
        O: __mmap_js,
        P: __munmap_js,
        b: _abort,
        E: _emscripten_date_now,
        Y: _emscripten_get_heap_max,
        w: _emscripten_get_now,
        ha: _emscripten_memcpy_js,
        W: _emscripten_resize_heap,
        $: _environ_get,
        aa: _environ_sizes_get,
        la: _exit,
        F: _fd_close,
        D: _fd_read,
        Q: _fd_seek,
        ba: _fd_sync,
        y: _fd_write,
        U: _getentropy,
        ra: invoke_fi,
        C: invoke_i,
        f: invoke_ii,
        na: invoke_iidii,
        qa: invoke_iif,
        d: invoke_iii,
        e: invoke_iiii,
        B: invoke_iiiii,
        v: invoke_iiiiii,
        K: invoke_iiiiiii,
        T: invoke_iij,
        p: invoke_v,
        i: invoke_vi,
        h: invoke_vii,
        r: invoke_viid,
        A: invoke_viidi,
        n: invoke_viii,
        pa: invoke_viiidiii,
        L: invoke_viiii,
        I: invoke_viiiidi,
        J: invoke_viiiii,
        u: invoke_viiiiiiidi,
        x: invoke_viiiiiiii,
        V: _strftime_l,
        ma: xnnLoadWasmModuleJS,
      };
      var wasmExports = createWasm();
      var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports['va'])();
      var _malloc = (a0) => (_malloc = wasmExports['xa'])(a0);
      var _free = (a0) => (_free = wasmExports['ya'])(a0);
      var ___errno_location = () => (___errno_location = wasmExports['za'])();
      var ___getTypeName = (a0) => (___getTypeName = wasmExports['Aa'])(a0);
      var ___funcs_on_exit = () => (___funcs_on_exit = wasmExports['Ba'])();
      var _fflush = (Module['_fflush'] = (a0) => (_fflush = Module['_fflush'] = wasmExports['Ca'])(a0));
      var _emscripten_builtin_memalign = (a0, a1) => (_emscripten_builtin_memalign = wasmExports['Da'])(a0, a1);
      var _setThrew = (a0, a1) => (_setThrew = wasmExports['Ea'])(a0, a1);
      var setTempRet0 = (a0) => (setTempRet0 = wasmExports['Fa'])(a0);
      var stackSave = () => (stackSave = wasmExports['Ga'])();
      var stackRestore = (a0) => (stackRestore = wasmExports['Ha'])(a0);
      var ___cxa_decrement_exception_refcount = (a0) => (___cxa_decrement_exception_refcount = wasmExports['Ia'])(a0);
      var ___cxa_increment_exception_refcount = (a0) => (___cxa_increment_exception_refcount = wasmExports['Ja'])(a0);
      var ___cxa_can_catch = (a0, a1, a2) => (___cxa_can_catch = wasmExports['Ka'])(a0, a1, a2);
      var ___cxa_is_pointer_type = (a0) => (___cxa_is_pointer_type = wasmExports['La'])(a0);
      var dynCall_viijj = (Module['dynCall_viijj'] = (a0, a1, a2, a3, a4, a5, a6) =>
        (dynCall_viijj = Module['dynCall_viijj'] = wasmExports['Ma'])(a0, a1, a2, a3, a4, a5, a6));
      var dynCall_viiijjj = (Module['dynCall_viiijjj'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
        (dynCall_viiijjj = Module['dynCall_viiijjj'] = wasmExports['Na'])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9));
      var dynCall_iiiij = (Module['dynCall_iiiij'] = (a0, a1, a2, a3, a4, a5) =>
        (dynCall_iiiij = Module['dynCall_iiiij'] = wasmExports['Oa'])(a0, a1, a2, a3, a4, a5));
      var dynCall_jii = (Module['dynCall_jii'] = (a0, a1, a2) => (dynCall_jii = Module['dynCall_jii'] = wasmExports['Pa'])(a0, a1, a2));
      var dynCall_jjj = (Module['dynCall_jjj'] = (a0, a1, a2, a3, a4) =>
        (dynCall_jjj = Module['dynCall_jjj'] = wasmExports['Qa'])(a0, a1, a2, a3, a4));
      var dynCall_iiiijj = (Module['dynCall_iiiijj'] = (a0, a1, a2, a3, a4, a5, a6, a7) =>
        (dynCall_iiiijj = Module['dynCall_iiiijj'] = wasmExports['Ra'])(a0, a1, a2, a3, a4, a5, a6, a7));
      var dynCall_viijji = (Module['dynCall_viijji'] = (a0, a1, a2, a3, a4, a5, a6, a7) =>
        (dynCall_viijji = Module['dynCall_viijji'] = wasmExports['Sa'])(a0, a1, a2, a3, a4, a5, a6, a7));
      var dynCall_iiijj = (Module['dynCall_iiijj'] = (a0, a1, a2, a3, a4, a5, a6) =>
        (dynCall_iiijj = Module['dynCall_iiijj'] = wasmExports['Ta'])(a0, a1, a2, a3, a4, a5, a6));
      var dynCall_viijjj = (Module['dynCall_viijjj'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) =>
        (dynCall_viijjj = Module['dynCall_viijjj'] = wasmExports['Ua'])(a0, a1, a2, a3, a4, a5, a6, a7, a8));
      var dynCall_iij = (Module['dynCall_iij'] = (a0, a1, a2, a3) =>
        (dynCall_iij = Module['dynCall_iij'] = wasmExports['Va'])(a0, a1, a2, a3));
      var dynCall_iijjiiii = (Module['dynCall_iijjiiii'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
        (dynCall_iijjiiii = Module['dynCall_iijjiiii'] = wasmExports['Wa'])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9));
      var dynCall_jiji = (Module['dynCall_jiji'] = (a0, a1, a2, a3, a4) =>
        (dynCall_jiji = Module['dynCall_jiji'] = wasmExports['Xa'])(a0, a1, a2, a3, a4));
      var dynCall_viijii = (Module['dynCall_viijii'] = (a0, a1, a2, a3, a4, a5, a6) =>
        (dynCall_viijii = Module['dynCall_viijii'] = wasmExports['Ya'])(a0, a1, a2, a3, a4, a5, a6));
      var dynCall_iiiiij = (Module['dynCall_iiiiij'] = (a0, a1, a2, a3, a4, a5, a6) =>
        (dynCall_iiiiij = Module['dynCall_iiiiij'] = wasmExports['Za'])(a0, a1, a2, a3, a4, a5, a6));
      var dynCall_iiiiijj = (Module['dynCall_iiiiijj'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) =>
        (dynCall_iiiiijj = Module['dynCall_iiiiijj'] = wasmExports['_a'])(a0, a1, a2, a3, a4, a5, a6, a7, a8));
      var dynCall_iiiiiijj = (Module['dynCall_iiiiiijj'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
        (dynCall_iiiiiijj = Module['dynCall_iiiiiijj'] = wasmExports['$a'])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9));
      var ___start_em_js = (Module['___start_em_js'] = 261460);
      var ___stop_em_js = (Module['___stop_em_js'] = 262072);
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
      function invoke_iif(index, a1, a2) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2);
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
      function invoke_iij(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          return dynCall_iij(index, a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      var calledRun;
      dependenciesFulfilled = function runCaller() {
        if (!calledRun) run();
        if (!calledRun) dependenciesFulfilled = runCaller;
      };
      function run() {
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
      if (Module['preInit']) {
        if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
        while (Module['preInit'].length > 0) {
          Module['preInit'].pop()();
        }
      }
      run();

      return moduleArg.ready;
    };
  })();
  createWasmMonoInstance = Module;
}

let createWasmMultiInstance;
{
  var Module = (() => {
    var _scriptDir = location.href;

    return function (moduleArg = {}) {
      var Module = moduleArg;
      var readyPromiseResolve, readyPromiseReject;
      Module['ready'] = new Promise((resolve, reject) => {
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
      var ENVIRONMENT_IS_PTHREAD = Module['ENVIRONMENT_IS_PTHREAD'] || false;
      var scriptDirectory = '';
      function locateFile(path) {
        if (Module['locateFile']) {
          return Module['locateFile'](path, scriptDirectory);
        }
        return scriptDirectory + path;
      }
      var read_, readAsync, readBinary;
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
      } else {
      }
      var out = Module['print'] || console.log.bind(console);
      var err = Module['printErr'] || console.error.bind(console);
      Object.assign(Module, moduleOverrides);
      moduleOverrides = null;
      if (Module['arguments']) arguments_ = Module['arguments'];
      if (Module['thisProgram']) thisProgram = Module['thisProgram'];
      if (Module['quit']) quit_ = Module['quit'];
      var wasmBinary;
      if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
      if (typeof WebAssembly != 'object') {
        abort('no native wasm support detected');
      }
      var wasmMemory;
      var wasmModule;
      var ABORT = false;
      var EXITSTATUS;
      function assert(condition, text) {
        if (!condition) {
          abort(text);
        }
      }
      var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
      function updateMemoryViews() {
        var b = wasmMemory.buffer;
        Module['HEAP8'] = HEAP8 = new Int8Array(b);
        Module['HEAP16'] = HEAP16 = new Int16Array(b);
        Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
        Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
        Module['HEAP32'] = HEAP32 = new Int32Array(b);
        Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
        Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
        Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
      }
      var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 134217728;
      if (ENVIRONMENT_IS_PTHREAD) {
        wasmMemory = Module['wasmMemory'];
      } else {
        if (Module['wasmMemory']) {
          wasmMemory = Module['wasmMemory'];
        } else {
          wasmMemory = new WebAssembly.Memory({ initial: INITIAL_MEMORY / 65536, maximum: INITIAL_MEMORY / 65536, shared: true });
          if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
            err(
              'requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag'
            );
            if (ENVIRONMENT_IS_NODE) {
              err('(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)');
            }
            throw Error('bad memory');
          }
        }
      }
      updateMemoryViews();
      INITIAL_MEMORY = wasmMemory.buffer.byteLength;
      var __ATPRERUN__ = [];
      var __ATINIT__ = [];
      var __ATEXIT__ = [];
      var __ATPOSTRUN__ = [];
      var runtimeInitialized = false;
      var runtimeExited = false;
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
        if (ENVIRONMENT_IS_PTHREAD) return;
        if (!Module['noFSInit'] && !FS.init.initialized) FS.init();
        FS.ignorePermissions = false;
        TTY.init();
        callRuntimeCallbacks(__ATINIT__);
      }
      function exitRuntime() {
        if (ENVIRONMENT_IS_PTHREAD) return;
        ___funcs_on_exit();
        callRuntimeCallbacks(__ATEXIT__);
        FS.quit();
        TTY.shutdown();
        PThread.terminateAllThreads();
        runtimeExited = true;
      }
      function postRun() {
        if (ENVIRONMENT_IS_PTHREAD) return;
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
        if (Module['onAbort']) {
          Module['onAbort'](what);
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
      var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
      var wasmBinaryFile;
      if (Module['locateFile']) {
        wasmBinaryFile = 'main-bin-multi.wasm';
        if (!isDataURI(wasmBinaryFile)) {
          wasmBinaryFile = locateFile(wasmBinaryFile);
        }
      } else {
        wasmBinaryFile = new URL('main-bin-multi.wasm', location.href).href;
      }
      function getBinarySync(file) {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
          return readBinary(file);
        }
        throw 'both async and sync fetching of the wasm failed';
      }
      function getBinaryPromise(binaryFile) {
        if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
          if (typeof fetch == 'function') {
            return fetch(binaryFile, { credentials: 'same-origin' })
              .then((response) => {
                if (!response['ok']) {
                  throw "failed to load wasm binary file at '" + binaryFile + "'";
                }
                return response['arrayBuffer']();
              })
              .catch(() => getBinarySync(binaryFile));
          }
        }
        return Promise.resolve().then(() => getBinarySync(binaryFile));
      }
      function instantiateArrayBuffer(binaryFile, imports, receiver) {
        return getBinaryPromise(binaryFile)
          .then((binary) => WebAssembly.instantiate(binary, imports))
          .then((instance) => instance)
          .then(receiver, (reason) => {
            err(`failed to asynchronously prepare wasm: ${reason}`);
            abort(reason);
          });
      }
      function instantiateAsync(binary, binaryFile, imports, callback) {
        if (!binary && typeof WebAssembly.instantiateStreaming == 'function' && !isDataURI(binaryFile) && typeof fetch == 'function') {
          return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
            var result = WebAssembly.instantiateStreaming(response, imports);
            return result.then(callback, function (reason) {
              err(`wasm streaming compile failed: ${reason}`);
              err('falling back to ArrayBuffer instantiation');
              return instantiateArrayBuffer(binaryFile, imports, callback);
            });
          });
        }
        return instantiateArrayBuffer(binaryFile, imports, callback);
      }
      function createWasm() {
        var info = { a: wasmImports };
        function receiveInstance(instance, module) {
          wasmExports = instance.exports;
          registerTLSInit(wasmExports['Ka']);
          wasmTable = wasmExports['Ga'];
          addOnInit(wasmExports['Ea']);
          wasmModule = module;
          removeRunDependency('wasm-instantiate');
          return wasmExports;
        }
        addRunDependency('wasm-instantiate');
        function receiveInstantiationResult(result) {
          receiveInstance(result['instance'], result['module']);
        }
        if (Module['instantiateWasm']) {
          try {
            return Module['instantiateWasm'](info, receiveInstance);
          } catch (e) {
            err(`Module.instantiateWasm callback failed with error: ${e}`);
            readyPromiseReject(e);
          }
        }
        instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
        return {};
      }
      var tempDouble;
      var tempI64;
      function xnnLoadWasmModuleJS(code, offset, offset_end, invalid_function_index) {
        const tableOriginalSize = wasmTable.length;
        const binary = new Uint8Array(HEAPU8.slice(code + offset, code + offset_end));
        try {
          var module = new WebAssembly.Module(binary);
          var instance = new WebAssembly.Instance(module, { env: { memory: wasmMemory } });
          for (var symName in instance.exports) {
            var value = instance.exports[symName];
            addFunction(value);
          }
          if (tableOriginalSize < wasmTable.length) {
            return tableOriginalSize;
          }
          return invalid_function_index;
        } catch (error) {
          console.log(error);
          return invalid_function_index;
        }
      }
      function ExitStatus(status) {
        this.name = 'ExitStatus';
        this.message = `Program terminated with exit(${status})`;
        this.status = status;
      }
      var terminateWorker = (worker) => {
        worker.terminate();
        worker.onmessage = (e) => {};
      };
      var killThread = (pthread_ptr) => {
        var worker = PThread.pthreads[pthread_ptr];
        delete PThread.pthreads[pthread_ptr];
        terminateWorker(worker);
        __emscripten_thread_free_data(pthread_ptr);
        PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
        worker.pthread_ptr = 0;
      };
      var cancelThread = (pthread_ptr) => {
        var worker = PThread.pthreads[pthread_ptr];
        worker.postMessage({ cmd: 'cancel' });
      };
      var cleanupThread = (pthread_ptr) => {
        var worker = PThread.pthreads[pthread_ptr];
        PThread.returnWorkerToPool(worker);
      };
      var zeroMemory = (address, size) => {
        HEAPU8.fill(0, address, address + size);
        return address;
      };
      var spawnThread = (threadParams) => {
        var worker = PThread.getNewWorker();
        if (!worker) {
          return 6;
        }
        PThread.runningWorkers.push(worker);
        PThread.pthreads[threadParams.pthread_ptr] = worker;
        worker.pthread_ptr = threadParams.pthread_ptr;
        var msg = { cmd: 'run', start_routine: threadParams.startRoutine, arg: threadParams.arg, pthread_ptr: threadParams.pthread_ptr };
        worker.postMessage(msg, threadParams.transferList);
        return 0;
      };
      var runtimeKeepaliveCounter = 0;
      var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
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
          var paths = Array.prototype.slice.call(arguments);
          return PATH.normalize(paths.join('/'));
        },
        join2: (l, r) => PATH.normalize(l + '/' + r),
      };
      var initRandomFill = () => {
        if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
          return (view) => (view.set(crypto.getRandomValues(new Uint8Array(view.byteLength))), view);
        } else abort('initRandomDevice');
      };
      var randomFill = (view) => (randomFill = initRandomFill())(view);
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
      var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
      var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
        var endIdx = idx + maxBytesToRead;
        var endPtr = idx;
        while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
          return UTF8Decoder.decode(
            heapOrArray.buffer instanceof SharedArrayBuffer ? heapOrArray.slice(idx, endPtr) : heapOrArray.subarray(idx, endPtr)
          );
        }
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
        return str;
      };
      var FS_stdin_getChar_buffer = [];
      var lengthBytesUTF8 = (str) => {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var c = str.charCodeAt(i);
          if (c <= 127) {
            len++;
          } else if (c <= 2047) {
            len += 2;
          } else if (c >= 55296 && c <= 57343) {
            len += 4;
            ++i;
          } else {
            len += 3;
          }
        }
        return len;
      };
      var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
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
      };
      function intArrayFromString(stringy, dontAddNull, length) {
        var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
        var u8array = new Array(len);
        var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
        if (dontAddNull) u8array.length = numBytesWritten;
        return u8array;
      }
      var FS_stdin_getChar = () => {
        if (!FS_stdin_getChar_buffer.length) {
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
          FS_stdin_getChar_buffer = intArrayFromString(result, true);
        }
        return FS_stdin_getChar_buffer.shift();
      };
      var TTY = {
        ttys: [],
        init() {},
        shutdown() {},
        register(dev, ops) {
          TTY.ttys[dev] = { input: [], output: [], ops: ops };
          FS.registerDevice(dev, TTY.stream_ops);
        },
        stream_ops: {
          open(stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
              throw new FS.ErrnoError(43);
            }
            stream.tty = tty;
            stream.seekable = false;
          },
          close(stream) {
            stream.tty.ops.fsync(stream.tty);
          },
          fsync(stream) {
            stream.tty.ops.fsync(stream.tty);
          },
          read(stream, buffer, offset, length, pos) {
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
          write(stream, buffer, offset, length, pos) {
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
          get_char(tty) {
            return FS_stdin_getChar();
          },
          put_char(tty, val) {
            if (val === null || val === 10) {
              out(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val);
            }
          },
          fsync(tty) {
            if (tty.output && tty.output.length > 0) {
              out(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          },
          ioctl_tcgets(tty) {
            return {
              c_iflag: 25856,
              c_oflag: 5,
              c_cflag: 191,
              c_lflag: 35387,
              c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            };
          },
          ioctl_tcsets(tty, optional_actions, data) {
            return 0;
          },
          ioctl_tiocgwinsz(tty) {
            return [24, 80];
          },
        },
        default_tty1_ops: {
          put_char(tty, val) {
            if (val === null || val === 10) {
              err(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            } else {
              if (val != 0) tty.output.push(val);
            }
          },
          fsync(tty) {
            if (tty.output && tty.output.length > 0) {
              err(UTF8ArrayToString(tty.output, 0));
              tty.output = [];
            }
          },
        },
      };
      var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
      var mmapAlloc = (size) => {
        size = alignMemory(size, 65536);
        var ptr = _emscripten_builtin_memalign(65536, size);
        if (!ptr) return 0;
        return zeroMemory(ptr, size);
      };
      var MEMFS = {
        ops_table: null,
        mount(mount) {
          return MEMFS.createNode(null, '/', 16384 | 511, 0);
        },
        createNode(parent, name, mode, dev) {
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
        getFileDataAsTypedArray(node) {
          if (!node.contents) return new Uint8Array(0);
          if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
          return new Uint8Array(node.contents);
        },
        expandFileStorage(node, newCapacity) {
          var prevCapacity = node.contents ? node.contents.length : 0;
          if (prevCapacity >= newCapacity) return;
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity);
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
        },
        resizeFileStorage(node, newSize) {
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
          getattr(node) {
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
          setattr(node, attr) {
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
          lookup(parent, name) {
            throw FS.genericErrors[44];
          },
          mknod(parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev);
          },
          rename(old_node, new_dir, new_name) {
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
          unlink(parent, name) {
            delete parent.contents[name];
            parent.timestamp = Date.now();
          },
          rmdir(parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
              throw new FS.ErrnoError(55);
            }
            delete parent.contents[name];
            parent.timestamp = Date.now();
          },
          readdir(node) {
            var entries = ['.', '..'];
            for (var key in node.contents) {
              if (!node.contents.hasOwnProperty(key)) {
                continue;
              }
              entries.push(key);
            }
            return entries;
          },
          symlink(parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node;
          },
          readlink(node) {
            if (!FS.isLink(node.mode)) {
              throw new FS.ErrnoError(28);
            }
            return node.link;
          },
        },
        stream_ops: {
          read(stream, buffer, offset, length, position) {
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
          write(stream, buffer, offset, length, position, canOwn) {
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
          llseek(stream, offset, whence) {
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
          allocate(stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
          },
          mmap(stream, length, position, prot, flags) {
            if (!FS.isFile(stream.node.mode)) {
              throw new FS.ErrnoError(43);
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
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
          msync(stream, buffer, offset, length, mmapFlags) {
            MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0;
          },
        },
      };
      var asyncLoad = (url, onload, onerror, noRunDep) => {
        var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : '';
        readAsync(
          url,
          (arrayBuffer) => {
            assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
            onload(new Uint8Array(arrayBuffer));
            if (dep) removeRunDependency(dep);
          },
          (event) => {
            if (onerror) {
              onerror();
            } else {
              throw `Loading data file "${url}" failed.`;
            }
          }
        );
        if (dep) addRunDependency(dep);
      };
      var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
        FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
      };
      var preloadPlugins = Module['preloadPlugins'] || [];
      var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
        if (typeof Browser != 'undefined') Browser.init();
        var handled = false;
        preloadPlugins.forEach((plugin) => {
          if (handled) return;
          if (plugin['canHandle'](fullname)) {
            plugin['handle'](byteArray, fullname, finish, onerror);
            handled = true;
          }
        });
        return handled;
      };
      var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency(`cp ${fullname}`);
        function processData(byteArray) {
          function finish(byteArray) {
            if (preFinish) preFinish();
            if (!dontCreateFile) {
              FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency(dep);
          }
          if (
            FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
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
      };
      var FS_modeStringToFlags = (str) => {
        var flagModes = { r: 0, 'r+': 2, w: 512 | 64 | 1, 'w+': 512 | 64 | 2, a: 1024 | 64 | 1, 'a+': 1024 | 64 | 2 };
        var flags = flagModes[str];
        if (typeof flags == 'undefined') {
          throw new Error(`Unknown file open mode: ${str}`);
        }
        return flags;
      };
      var FS_getMode = (canRead, canWrite) => {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      };
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
        lookupPath(path, opts = {}) {
          path = PATH_FS.resolve(path);
          if (!path) return { path: '', node: null };
          var defaults = { follow_mount: true, recurse_count: 0 };
          opts = Object.assign(defaults, opts);
          if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(32);
          }
          var parts = path.split('/').filter((p) => !!p);
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
        getPath(node) {
          var path;
          while (true) {
            if (FS.isRoot(node)) {
              var mount = node.mount.mountpoint;
              if (!path) return mount;
              return mount[mount.length - 1] !== '/' ? `${mount}/${path}` : mount + path;
            }
            path = path ? `${node.name}/${path}` : node.name;
            node = node.parent;
          }
        },
        hashName(parentid, name) {
          var hash = 0;
          for (var i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
          }
          return ((parentid + hash) >>> 0) % FS.nameTable.length;
        },
        hashAddNode(node) {
          var hash = FS.hashName(node.parent.id, node.name);
          node.name_next = FS.nameTable[hash];
          FS.nameTable[hash] = node;
        },
        hashRemoveNode(node) {
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
        lookupNode(parent, name) {
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
        createNode(parent, name, mode, rdev) {
          var node = new FS.FSNode(parent, name, mode, rdev);
          FS.hashAddNode(node);
          return node;
        },
        destroyNode(node) {
          FS.hashRemoveNode(node);
        },
        isRoot(node) {
          return node === node.parent;
        },
        isMountpoint(node) {
          return !!node.mounted;
        },
        isFile(mode) {
          return (mode & 61440) === 32768;
        },
        isDir(mode) {
          return (mode & 61440) === 16384;
        },
        isLink(mode) {
          return (mode & 61440) === 40960;
        },
        isChrdev(mode) {
          return (mode & 61440) === 8192;
        },
        isBlkdev(mode) {
          return (mode & 61440) === 24576;
        },
        isFIFO(mode) {
          return (mode & 61440) === 4096;
        },
        isSocket(mode) {
          return (mode & 49152) === 49152;
        },
        flagsToPermissionString(flag) {
          var perms = ['r', 'w', 'rw'][flag & 3];
          if (flag & 512) {
            perms += 'w';
          }
          return perms;
        },
        nodePermissions(node, perms) {
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
        mayLookup(dir) {
          var errCode = FS.nodePermissions(dir, 'x');
          if (errCode) return errCode;
          if (!dir.node_ops.lookup) return 2;
          return 0;
        },
        mayCreate(dir, name) {
          try {
            var node = FS.lookupNode(dir, name);
            return 20;
          } catch (e) {}
          return FS.nodePermissions(dir, 'wx');
        },
        mayDelete(dir, name, isdir) {
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
        mayOpen(node, flags) {
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
        nextfd() {
          for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
            if (!FS.streams[fd]) {
              return fd;
            }
          }
          throw new FS.ErrnoError(33);
        },
        getStreamChecked(fd) {
          var stream = FS.getStream(fd);
          if (!stream) {
            throw new FS.ErrnoError(8);
          }
          return stream;
        },
        getStream: (fd) => FS.streams[fd],
        createStream(stream, fd = -1) {
          if (!FS.FSStream) {
            FS.FSStream = function () {
              this.shared = {};
            };
            FS.FSStream.prototype = {};
            Object.defineProperties(FS.FSStream.prototype, {
              object: {
                get() {
                  return this.node;
                },
                set(val) {
                  this.node = val;
                },
              },
              isRead: {
                get() {
                  return (this.flags & 2097155) !== 1;
                },
              },
              isWrite: {
                get() {
                  return (this.flags & 2097155) !== 0;
                },
              },
              isAppend: {
                get() {
                  return this.flags & 1024;
                },
              },
              flags: {
                get() {
                  return this.shared.flags;
                },
                set(val) {
                  this.shared.flags = val;
                },
              },
              position: {
                get() {
                  return this.shared.position;
                },
                set(val) {
                  this.shared.position = val;
                },
              },
            });
          }
          stream = Object.assign(new FS.FSStream(), stream);
          if (fd == -1) {
            fd = FS.nextfd();
          }
          stream.fd = fd;
          FS.streams[fd] = stream;
          return stream;
        },
        closeStream(fd) {
          FS.streams[fd] = null;
        },
        chrdev_stream_ops: {
          open(stream) {
            var device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
              stream.stream_ops.open(stream);
            }
          },
          llseek() {
            throw new FS.ErrnoError(70);
          },
        },
        major: (dev) => dev >> 8,
        minor: (dev) => dev & 255,
        makedev: (ma, mi) => (ma << 8) | mi,
        registerDevice(dev, ops) {
          FS.devices[dev] = { stream_ops: ops };
        },
        getDevice: (dev) => FS.devices[dev],
        getMounts(mount) {
          var mounts = [];
          var check = [mount];
          while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts);
          }
          return mounts;
        },
        syncfs(populate, callback) {
          if (typeof populate == 'function') {
            callback = populate;
            populate = false;
          }
          FS.syncFSRequests++;
          if (FS.syncFSRequests > 1) {
            err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
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
        mount(type, opts, mountpoint) {
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
        unmount(mountpoint) {
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
        lookup(parent, name) {
          return parent.node_ops.lookup(parent, name);
        },
        mknod(path, mode, dev) {
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
        create(path, mode) {
          mode = mode !== undefined ? mode : 438;
          mode &= 4095;
          mode |= 32768;
          return FS.mknod(path, mode, 0);
        },
        mkdir(path, mode) {
          mode = mode !== undefined ? mode : 511;
          mode &= 511 | 512;
          mode |= 16384;
          return FS.mknod(path, mode, 0);
        },
        mkdirTree(path, mode) {
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
        mkdev(path, mode, dev) {
          if (typeof dev == 'undefined') {
            dev = mode;
            mode = 438;
          }
          mode |= 8192;
          return FS.mknod(path, mode, dev);
        },
        symlink(oldpath, newpath) {
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
        rename(old_path, new_path) {
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
        rmdir(path) {
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
        readdir(path) {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(54);
          }
          return node.node_ops.readdir(node);
        },
        unlink(path) {
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
        readlink(path) {
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
        stat(path, dontFollow) {
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
        lstat(path) {
          return FS.stat(path, true);
        },
        chmod(path, mode, dontFollow) {
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
        lchmod(path, mode) {
          FS.chmod(path, mode, true);
        },
        fchmod(fd, mode) {
          var stream = FS.getStreamChecked(fd);
          FS.chmod(stream.node, mode);
        },
        chown(path, uid, gid, dontFollow) {
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
        lchown(path, uid, gid) {
          FS.chown(path, uid, gid, true);
        },
        fchown(fd, uid, gid) {
          var stream = FS.getStreamChecked(fd);
          FS.chown(stream.node, uid, gid);
        },
        truncate(path, len) {
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
        ftruncate(fd, len) {
          var stream = FS.getStreamChecked(fd);
          if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(28);
          }
          FS.truncate(stream.node, len);
        },
        utime(path, atime, mtime) {
          var lookup = FS.lookupPath(path, { follow: true });
          var node = lookup.node;
          node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
        },
        open(path, flags, mode) {
          if (path === '') {
            throw new FS.ErrnoError(44);
          }
          flags = typeof flags == 'string' ? FS_modeStringToFlags(flags) : flags;
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
        close(stream) {
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
        isClosed(stream) {
          return stream.fd === null;
        },
        llseek(stream, offset, whence) {
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
        read(stream, buffer, offset, length, position) {
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
        write(stream, buffer, offset, length, position, canOwn) {
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
        allocate(stream, offset, length) {
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
        mmap(stream, length, position, prot, flags) {
          if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
            throw new FS.ErrnoError(2);
          }
          if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(2);
          }
          if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(43);
          }
          return stream.stream_ops.mmap(stream, length, position, prot, flags);
        },
        msync(stream, buffer, offset, length, mmapFlags) {
          if (!stream.stream_ops.msync) {
            return 0;
          }
          return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
        },
        munmap: (stream) => 0,
        ioctl(stream, cmd, arg) {
          if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(59);
          }
          return stream.stream_ops.ioctl(stream, cmd, arg);
        },
        readFile(path, opts = {}) {
          opts.flags = opts.flags || 0;
          opts.encoding = opts.encoding || 'binary';
          if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
            throw new Error(`Invalid encoding type "${opts.encoding}"`);
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
        writeFile(path, data, opts = {}) {
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
        chdir(path) {
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
        createDefaultDirectories() {
          FS.mkdir('/tmp');
          FS.mkdir('/home');
          FS.mkdir('/home/web_user');
        },
        createDefaultDevices() {
          FS.mkdir('/dev');
          FS.registerDevice(FS.makedev(1, 3), { read: () => 0, write: (stream, buffer, offset, length, pos) => length });
          FS.mkdev('/dev/null', FS.makedev(1, 3));
          TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
          TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
          FS.mkdev('/dev/tty', FS.makedev(5, 0));
          FS.mkdev('/dev/tty1', FS.makedev(6, 0));
          var randomBuffer = new Uint8Array(1024),
            randomLeft = 0;
          var randomByte = () => {
            if (randomLeft === 0) {
              randomLeft = randomFill(randomBuffer).byteLength;
            }
            return randomBuffer[--randomLeft];
          };
          FS.createDevice('/dev', 'random', randomByte);
          FS.createDevice('/dev', 'urandom', randomByte);
          FS.mkdir('/dev/shm');
          FS.mkdir('/dev/shm/tmp');
        },
        createSpecialDirectories() {
          FS.mkdir('/proc');
          var proc_self = FS.mkdir('/proc/self');
          FS.mkdir('/proc/self/fd');
          FS.mount(
            {
              mount() {
                var node = FS.createNode(proc_self, 'fd', 16384 | 511, 73);
                node.node_ops = {
                  lookup(parent, name) {
                    var fd = +name;
                    var stream = FS.getStreamChecked(fd);
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
        createStandardStreams() {
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
        ensureErrnoError() {
          if (FS.ErrnoError) return;
          FS.ErrnoError = function ErrnoError(errno, node) {
            this.name = 'ErrnoError';
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
        staticInit() {
          FS.ensureErrnoError();
          FS.nameTable = new Array(4096);
          FS.mount(MEMFS, {}, '/');
          FS.createDefaultDirectories();
          FS.createDefaultDevices();
          FS.createSpecialDirectories();
          FS.filesystems = { MEMFS: MEMFS };
        },
        init(input, output, error) {
          FS.init.initialized = true;
          FS.ensureErrnoError();
          Module['stdin'] = input || Module['stdin'];
          Module['stdout'] = output || Module['stdout'];
          Module['stderr'] = error || Module['stderr'];
          FS.createStandardStreams();
        },
        quit() {
          FS.init.initialized = false;
          _fflush(0);
          for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
              continue;
            }
            FS.close(stream);
          }
        },
        findObject(path, dontResolveLastLink) {
          var ret = FS.analyzePath(path, dontResolveLastLink);
          if (!ret.exists) {
            return null;
          }
          return ret.object;
        },
        analyzePath(path, dontResolveLastLink) {
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
        createPath(parent, path, canRead, canWrite) {
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
        createFile(parent, name, properties, canRead, canWrite) {
          var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
          var mode = FS_getMode(canRead, canWrite);
          return FS.create(path, mode);
        },
        createDataFile(parent, name, data, canRead, canWrite, canOwn) {
          var path = name;
          if (parent) {
            parent = typeof parent == 'string' ? parent : FS.getPath(parent);
            path = name ? PATH.join2(parent, name) : parent;
          }
          var mode = FS_getMode(canRead, canWrite);
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
        },
        createDevice(parent, name, input, output) {
          var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
          var mode = FS_getMode(!!input, !!output);
          if (!FS.createDevice.major) FS.createDevice.major = 64;
          var dev = FS.makedev(FS.createDevice.major++, 0);
          FS.registerDevice(dev, {
            open(stream) {
              stream.seekable = false;
            },
            close(stream) {
              if (output && output.buffer && output.buffer.length) {
                output(10);
              }
            },
            read(stream, buffer, offset, length, pos) {
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
            write(stream, buffer, offset, length, pos) {
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
        forceLoadFile(obj) {
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
        createLazyFile(parent, name, url, canRead, canWrite) {
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
              }
              return intArrayFromString(xhr.responseText || '', true);
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
          function writeChunks(stream, buffer, offset, length, position) {
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
          }
          stream_ops.read = (stream, buffer, offset, length, position) => {
            FS.forceLoadFile(node);
            return writeChunks(stream, buffer, offset, length, position);
          };
          stream_ops.mmap = (stream, length, position, prot, flags) => {
            FS.forceLoadFile(node);
            var ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            writeChunks(stream, HEAP8, ptr, length, position);
            return { ptr: ptr, allocated: true };
          };
          node.stream_ops = stream_ops;
          return node;
        },
      };
      var UTF8ToString = (ptr, maxBytesToRead) => (ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '');
      var SYSCALLS = {
        DEFAULT_POLLMASK: 5,
        calculateAt(dirfd, path, allowEmpty) {
          if (PATH.isAbs(path)) {
            return path;
          }
          var dir;
          if (dirfd === -100) {
            dir = FS.cwd();
          } else {
            var dirstream = SYSCALLS.getStreamFromFD(dirfd);
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
        doStat(func, path, buf) {
          try {
            var stat = func(path);
          } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
              return -54;
            }
            throw e;
          }
          HEAP32[buf >> 2] = stat.dev;
          HEAP32[(buf + 4) >> 2] = stat.mode;
          HEAPU32[(buf + 8) >> 2] = stat.nlink;
          HEAP32[(buf + 12) >> 2] = stat.uid;
          HEAP32[(buf + 16) >> 2] = stat.gid;
          HEAP32[(buf + 20) >> 2] = stat.rdev;
          (tempI64 = [
            stat.size >>> 0,
            ((tempDouble = stat.size),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 24) >> 2] = tempI64[0]),
            (HEAP32[(buf + 28) >> 2] = tempI64[1]);
          HEAP32[(buf + 32) >> 2] = 4096;
          HEAP32[(buf + 36) >> 2] = stat.blocks;
          var atime = stat.atime.getTime();
          var mtime = stat.mtime.getTime();
          var ctime = stat.ctime.getTime();
          (tempI64 = [
            Math.floor(atime / 1e3) >>> 0,
            ((tempDouble = Math.floor(atime / 1e3)),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 40) >> 2] = tempI64[0]),
            (HEAP32[(buf + 44) >> 2] = tempI64[1]);
          HEAPU32[(buf + 48) >> 2] = (atime % 1e3) * 1e3;
          (tempI64 = [
            Math.floor(mtime / 1e3) >>> 0,
            ((tempDouble = Math.floor(mtime / 1e3)),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 56) >> 2] = tempI64[0]),
            (HEAP32[(buf + 60) >> 2] = tempI64[1]);
          HEAPU32[(buf + 64) >> 2] = (mtime % 1e3) * 1e3;
          (tempI64 = [
            Math.floor(ctime / 1e3) >>> 0,
            ((tempDouble = Math.floor(ctime / 1e3)),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 72) >> 2] = tempI64[0]),
            (HEAP32[(buf + 76) >> 2] = tempI64[1]);
          HEAPU32[(buf + 80) >> 2] = (ctime % 1e3) * 1e3;
          (tempI64 = [
            stat.ino >>> 0,
            ((tempDouble = stat.ino),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[(buf + 88) >> 2] = tempI64[0]),
            (HEAP32[(buf + 92) >> 2] = tempI64[1]);
          return 0;
        },
        doMsync(addr, stream, len, flags, offset) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          if (flags & 2) {
            return 0;
          }
          var buffer = HEAPU8.slice(addr, addr + len);
          FS.msync(stream, buffer, offset, len, flags);
        },
        varargs: undefined,
        get() {
          var ret = HEAP32[+SYSCALLS.varargs >> 2];
          SYSCALLS.varargs += 4;
          return ret;
        },
        getp() {
          return SYSCALLS.get();
        },
        getStr(ptr) {
          var ret = UTF8ToString(ptr);
          return ret;
        },
        getStreamFromFD(fd) {
          var stream = FS.getStreamChecked(fd);
          return stream;
        },
      };
      var withStackSave = (f) => {
        var stack = stackSave();
        var ret = f();
        stackRestore(stack);
        return ret;
      };
      var convertI32PairToI53Checked = (lo, hi) => ((hi + 2097152) >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN);
      var proxyToMainThread = function (index, sync) {
        var numCallArgs = arguments.length - 2;
        var outerArgs = arguments;
        return withStackSave(() => {
          var serializedNumCallArgs = numCallArgs;
          var args = stackAlloc(serializedNumCallArgs * 8);
          var b = args >> 3;
          for (var i = 0; i < numCallArgs; i++) {
            var arg = outerArgs[2 + i];
            HEAPF64[b + i] = arg;
          }
          return __emscripten_run_on_main_thread_js(index, serializedNumCallArgs, args, sync);
        });
      };
      function _proc_exit(code) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(0, 1, code);
        EXITSTATUS = code;
        if (!keepRuntimeAlive()) {
          PThread.terminateAllThreads();
          if (Module['onExit']) Module['onExit'](code);
          ABORT = true;
        }
        quit_(code, new ExitStatus(code));
      }
      var exitJS = (status, implicit) => {
        EXITSTATUS = status;
        if (ENVIRONMENT_IS_PTHREAD) {
          exitOnMainThread(status);
          throw 'unwind';
        }
        if (!keepRuntimeAlive()) {
          exitRuntime();
        }
        _proc_exit(status);
      };
      var _exit = exitJS;
      var handleException = (e) => {
        if (e instanceof ExitStatus || e == 'unwind') {
          return EXITSTATUS;
        }
        quit_(1, e);
      };
      var PThread = {
        unusedWorkers: [],
        runningWorkers: [],
        tlsInitFunctions: [],
        pthreads: {},
        init() {
          if (ENVIRONMENT_IS_PTHREAD) {
            PThread.initWorker();
          } else {
            PThread.initMainThread();
          }
        },
        initMainThread() {
          var pthreadPoolSize = 4;
          while (pthreadPoolSize--) {
            PThread.allocateUnusedWorker();
          }
          addOnPreRun(() => {
            addRunDependency('loading-workers');
            PThread.loadWasmModuleToAllWorkers(() => removeRunDependency('loading-workers'));
          });
        },
        initWorker() {
          noExitRuntime = false;
        },
        setExitStatus: (status) => {
          EXITSTATUS = status;
        },
        terminateAllThreads__deps: ['$terminateWorker'],
        terminateAllThreads: () => {
          for (var worker of PThread.runningWorkers) {
            terminateWorker(worker);
          }
          for (var worker of PThread.unusedWorkers) {
            terminateWorker(worker);
          }
          PThread.unusedWorkers = [];
          PThread.runningWorkers = [];
          PThread.pthreads = [];
        },
        returnWorkerToPool: (worker) => {
          var pthread_ptr = worker.pthread_ptr;
          delete PThread.pthreads[pthread_ptr];
          PThread.unusedWorkers.push(worker);
          PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
          worker.pthread_ptr = 0;
          __emscripten_thread_free_data(pthread_ptr);
        },
        receiveObjectTransfer(data) {},
        threadInitTLS() {
          PThread.tlsInitFunctions.forEach((f) => f());
        },
        loadWasmModuleToWorker: (worker) =>
          new Promise((onFinishedLoading) => {
            worker.onmessage = (e) => {
              var d = e['data'];
              var cmd = d['cmd'];
              if (d['targetThread'] && d['targetThread'] != _pthread_self()) {
                var targetWorker = PThread.pthreads[d['targetThread']];
                if (targetWorker) {
                  targetWorker.postMessage(d, d['transferList']);
                } else {
                  err(
                    `Internal error! Worker sent a message "${cmd}" to target pthread ${d['targetThread']}, but that thread no longer exists!`
                  );
                }
                return;
              }
              if (cmd === 'checkMailbox') {
                checkMailbox();
              } else if (cmd === 'spawnThread') {
                spawnThread(d);
              } else if (cmd === 'cleanupThread') {
                cleanupThread(d['thread']);
              } else if (cmd === 'killThread') {
                killThread(d['thread']);
              } else if (cmd === 'cancelThread') {
                cancelThread(d['thread']);
              } else if (cmd === 'loaded') {
                worker.loaded = true;
                onFinishedLoading(worker);
              } else if (cmd === 'alert') {
                alert(`Thread ${d['threadId']}: ${d['text']}`);
              } else if (d.target === 'setimmediate') {
                worker.postMessage(d);
              } else if (cmd === 'callHandler') {
                Module[d['handler']](...d['args']);
              } else if (cmd) {
                err(`worker sent an unknown command ${cmd}`);
              }
            };
            worker.onerror = (e) => {
              var message = 'worker sent an error!';
              err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
              throw e;
            };
            var handlers = [];
            var knownHandlers = ['onExit', 'onAbort', 'print', 'printErr'];
            for (var handler of knownHandlers) {
              if (Module.hasOwnProperty(handler)) {
                handlers.push(handler);
              }
            }
            worker.postMessage({
              cmd: 'load',
              handlers: handlers,
              urlOrBlob: Module['mainScriptUrlOrBlob'],
              wasmMemory: wasmMemory,
              wasmModule: wasmModule,
            });
          }),
        loadWasmModuleToAllWorkers(onMaybeReady) {
          if (ENVIRONMENT_IS_PTHREAD) {
            return onMaybeReady();
          }
          let pthreadPoolReady = Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));
          pthreadPoolReady.then(onMaybeReady);
        },
        allocateUnusedWorker() {
          var worker;
          if (!Module['locateFile']) {
            worker = new Worker(new URL('main-bin-multi.worker.js', location.href), { type: 'module' });
          } else {
            var pthreadMainJs = locateFile('main-bin-multi.worker.js');
            worker = new Worker(pthreadMainJs, { type: 'module' });
          }
          PThread.unusedWorkers.push(worker);
        },
        getNewWorker() {
          if (PThread.unusedWorkers.length == 0) {
            PThread.allocateUnusedWorker();
            PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
          }
          return PThread.unusedWorkers.pop();
        },
      };
      Module['PThread'] = PThread;
      var callRuntimeCallbacks = (callbacks) => {
        while (callbacks.length > 0) {
          callbacks.shift()(Module);
        }
      };
      var establishStackSpace = () => {
        var pthread_ptr = _pthread_self();
        var stackHigh = HEAPU32[(pthread_ptr + 52) >> 2];
        var stackSize = HEAPU32[(pthread_ptr + 56) >> 2];
        var stackLow = stackHigh - stackSize;
        _emscripten_stack_set_limits(stackHigh, stackLow);
        stackRestore(stackHigh);
      };
      Module['establishStackSpace'] = establishStackSpace;
      function exitOnMainThread(returnCode) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(1, 0, returnCode);
        _exit(returnCode);
      }
      var wasmTableMirror = [];
      var wasmTable;
      var getWasmTableEntry = (funcPtr) => {
        var func = wasmTableMirror[funcPtr];
        if (!func) {
          if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
          wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
        }
        return func;
      };
      var invokeEntryPoint = (ptr, arg) => {
        runtimeKeepaliveCounter = 0;
        var result = getWasmTableEntry(ptr)(arg);
        function finish(result) {
          if (keepRuntimeAlive()) {
            PThread.setExitStatus(result);
          } else {
            __emscripten_thread_exit(result);
          }
        }
        finish(result);
      };
      Module['invokeEntryPoint'] = invokeEntryPoint;
      var noExitRuntime = Module['noExitRuntime'] || false;
      var registerTLSInit = (tlsInitFunc) => {
        PThread.tlsInitFunctions.push(tlsInitFunc);
      };
      var ___assert_fail = (condition, filename, line, func) => {
        abort(
          `Assertion failed: ${UTF8ToString(condition)}, at: ` +
            [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']
        );
      };
      var exceptionCaught = [];
      var uncaughtExceptionCount = 0;
      var ___cxa_begin_catch = (ptr) => {
        var info = new ExceptionInfo(ptr);
        if (!info.get_caught()) {
          info.set_caught(true);
          uncaughtExceptionCount--;
        }
        info.set_rethrown(false);
        exceptionCaught.push(info);
        ___cxa_increment_exception_refcount(info.excPtr);
        return info.get_exception_ptr();
      };
      var exceptionLast = 0;
      var ___cxa_end_catch = () => {
        _setThrew(0, 0);
        var info = exceptionCaught.pop();
        ___cxa_decrement_exception_refcount(info.excPtr);
        exceptionLast = 0;
      };
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
      var ___resumeException = (ptr) => {
        if (!exceptionLast) {
          exceptionLast = ptr;
        }
        throw exceptionLast;
      };
      var findMatchingCatch = (args) => {
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
        for (var arg in args) {
          var caughtType = args[arg];
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
      };
      var ___cxa_find_matching_catch_2 = () => findMatchingCatch([]);
      var ___cxa_find_matching_catch_3 = (arg0) => findMatchingCatch([arg0]);
      var ___cxa_rethrow = () => {
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
        throw exceptionLast;
      };
      var ___cxa_throw = (ptr, type, destructor) => {
        var info = new ExceptionInfo(ptr);
        info.init(type, destructor);
        exceptionLast = ptr;
        uncaughtExceptionCount++;
        throw exceptionLast;
      };
      var ___emscripten_init_main_thread_js = (tb) => {
        __emscripten_thread_init(tb, !ENVIRONMENT_IS_WORKER, 1, !ENVIRONMENT_IS_WEB, 65536, false);
        PThread.threadInitTLS();
      };
      var ___emscripten_thread_cleanup = (thread) => {
        if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
        else postMessage({ cmd: 'cleanupThread', thread: thread });
      };
      function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(2, 1, pthread_ptr, attr, startRoutine, arg);
        return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg);
      }
      var ___pthread_create_js = (pthread_ptr, attr, startRoutine, arg) => {
        if (typeof SharedArrayBuffer == 'undefined') {
          err('Current environment does not support SharedArrayBuffer, pthreads are not available!');
          return 6;
        }
        var transferList = [];
        var error = 0;
        if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
          return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg);
        }
        if (error) return error;
        var threadParams = { startRoutine: startRoutine, pthread_ptr: pthread_ptr, arg: arg, transferList: transferList };
        if (ENVIRONMENT_IS_PTHREAD) {
          threadParams.cmd = 'spawnThread';
          postMessage(threadParams, transferList);
          return 0;
        }
        return spawnThread(threadParams);
      };
      var setErrNo = (value) => {
        HEAP32[___errno_location() >> 2] = value;
        return value;
      };
      function ___syscall_fcntl64(fd, cmd, varargs) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(3, 1, fd, cmd, varargs);
        SYSCALLS.varargs = varargs;
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          switch (cmd) {
            case 0: {
              var arg = SYSCALLS.get();
              if (arg < 0) {
                return -28;
              }
              while (FS.streams[arg]) {
                arg++;
              }
              var newStream;
              newStream = FS.createStream(stream, arg);
              return newStream.fd;
            }
            case 1:
            case 2:
              return 0;
            case 3:
              return stream.flags;
            case 4: {
              var arg = SYSCALLS.get();
              stream.flags |= arg;
              return 0;
            }
            case 5: {
              var arg = SYSCALLS.getp();
              var offset = 0;
              HEAP16[(arg + offset) >> 1] = 2;
              return 0;
            }
            case 6:
            case 7:
              return 0;
            case 16:
            case 8:
              return -28;
            case 9:
              setErrNo(28);
              return -1;
            default: {
              return -28;
            }
          }
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function ___syscall_fstat64(fd, buf) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(4, 1, fd, buf);
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          return SYSCALLS.doStat(FS.stat, stream.path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function ___syscall_ftruncate64(fd, length_low, length_high) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(5, 1, fd, length_low, length_high);
        var length = convertI32PairToI53Checked(length_low, length_high);
        try {
          if (isNaN(length)) return 61;
          FS.ftruncate(fd, length);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function ___syscall_ioctl(fd, op, varargs) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(6, 1, fd, op, varargs);
        SYSCALLS.varargs = varargs;
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          switch (op) {
            case 21509: {
              if (!stream.tty) return -59;
              return 0;
            }
            case 21505: {
              if (!stream.tty) return -59;
              if (stream.tty.ops.ioctl_tcgets) {
                var termios = stream.tty.ops.ioctl_tcgets(stream);
                var argp = SYSCALLS.getp();
                HEAP32[argp >> 2] = termios.c_iflag || 0;
                HEAP32[(argp + 4) >> 2] = termios.c_oflag || 0;
                HEAP32[(argp + 8) >> 2] = termios.c_cflag || 0;
                HEAP32[(argp + 12) >> 2] = termios.c_lflag || 0;
                for (var i = 0; i < 32; i++) {
                  HEAP8[(argp + i + 17) >> 0] = termios.c_cc[i] || 0;
                }
                return 0;
              }
              return 0;
            }
            case 21510:
            case 21511:
            case 21512: {
              if (!stream.tty) return -59;
              return 0;
            }
            case 21506:
            case 21507:
            case 21508: {
              if (!stream.tty) return -59;
              if (stream.tty.ops.ioctl_tcsets) {
                var argp = SYSCALLS.getp();
                var c_iflag = HEAP32[argp >> 2];
                var c_oflag = HEAP32[(argp + 4) >> 2];
                var c_cflag = HEAP32[(argp + 8) >> 2];
                var c_lflag = HEAP32[(argp + 12) >> 2];
                var c_cc = [];
                for (var i = 0; i < 32; i++) {
                  c_cc.push(HEAP8[(argp + i + 17) >> 0]);
                }
                return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
                  c_iflag: c_iflag,
                  c_oflag: c_oflag,
                  c_cflag: c_cflag,
                  c_lflag: c_lflag,
                  c_cc: c_cc,
                });
              }
              return 0;
            }
            case 21519: {
              if (!stream.tty) return -59;
              var argp = SYSCALLS.getp();
              HEAP32[argp >> 2] = 0;
              return 0;
            }
            case 21520: {
              if (!stream.tty) return -59;
              return -28;
            }
            case 21531: {
              var argp = SYSCALLS.getp();
              return FS.ioctl(stream, op, argp);
            }
            case 21523: {
              if (!stream.tty) return -59;
              if (stream.tty.ops.ioctl_tiocgwinsz) {
                var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
                var argp = SYSCALLS.getp();
                HEAP16[argp >> 1] = winsize[0];
                HEAP16[(argp + 2) >> 1] = winsize[1];
              }
              return 0;
            }
            case 21524: {
              if (!stream.tty) return -59;
              return 0;
            }
            case 21515: {
              if (!stream.tty) return -59;
              return 0;
            }
            default:
              return -28;
          }
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function ___syscall_lstat64(path, buf) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(7, 1, path, buf);
        try {
          path = SYSCALLS.getStr(path);
          return SYSCALLS.doStat(FS.lstat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function ___syscall_newfstatat(dirfd, path, buf, flags) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(8, 1, dirfd, path, buf, flags);
        try {
          path = SYSCALLS.getStr(path);
          var nofollow = flags & 256;
          var allowEmpty = flags & 4096;
          flags = flags & ~6400;
          path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
          return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function ___syscall_openat(dirfd, path, flags, varargs) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(9, 1, dirfd, path, flags, varargs);
        SYSCALLS.varargs = varargs;
        try {
          path = SYSCALLS.getStr(path);
          path = SYSCALLS.calculateAt(dirfd, path);
          var mode = varargs ? SYSCALLS.get() : 0;
          return FS.open(path, flags, mode).fd;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
      function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(10, 1, dirfd, path, buf, bufsize);
        try {
          path = SYSCALLS.getStr(path);
          path = SYSCALLS.calculateAt(dirfd, path);
          if (bufsize <= 0) return -28;
          var ret = FS.readlink(path);
          var len = Math.min(bufsize, lengthBytesUTF8(ret));
          var endChar = HEAP8[buf + len];
          stringToUTF8(ret, buf, bufsize + 1);
          HEAP8[buf + len] = endChar;
          return len;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(11, 1, olddirfd, oldpath, newdirfd, newpath);
        try {
          oldpath = SYSCALLS.getStr(oldpath);
          newpath = SYSCALLS.getStr(newpath);
          oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
          newpath = SYSCALLS.calculateAt(newdirfd, newpath);
          FS.rename(oldpath, newpath);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function ___syscall_stat64(path, buf) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(12, 1, path, buf);
        try {
          path = SYSCALLS.getStr(path);
          return SYSCALLS.doStat(FS.stat, path, buf);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function ___syscall_unlinkat(dirfd, path, flags) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(13, 1, dirfd, path, flags);
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
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {};
      var embind_init_charCodes = () => {
        var codes = new Array(256);
        for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
        }
        embind_charCodes = codes;
      };
      var embind_charCodes;
      var readLatin1String = (ptr) => {
        var ret = '';
        var c = ptr;
        while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
        }
        return ret;
      };
      var awaitingDependencies = {};
      var registeredTypes = {};
      var typeDependencies = {};
      var BindingError;
      var throwBindingError = (message) => {
        throw new BindingError(message);
      };
      var InternalError;
      var throwInternalError = (message) => {
        throw new InternalError(message);
      };
      var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
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
      };
      function sharedRegisterType(rawType, registeredInstance, options = {}) {
        var name = registeredInstance.name;
        if (!rawType) {
          throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
        }
        if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
            return;
          } else {
            throwBindingError(`Cannot register type '${name}' twice`);
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
      function registerType(rawType, registeredInstance, options = {}) {
        if (!('argPackAdvance' in registeredInstance)) {
          throw new TypeError('registerType registeredInstance requires argPackAdvance');
        }
        return sharedRegisterType(rawType, registeredInstance, options);
      }
      var GenericWireTypeSize = 8;
      var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: function (wt) {
            return !!wt;
          },
          toWireType: function (destructors, o) {
            return o ? trueValue : falseValue;
          },
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: function (pointer) {
            return this['fromWireType'](HEAPU8[pointer]);
          },
          destructorFunction: null,
        });
      };
      var shallowCopyInternalPointer = (o) => ({
        count: o.count,
        deleteScheduled: o.deleteScheduled,
        preservePointerOnDelete: o.preservePointerOnDelete,
        ptr: o.ptr,
        ptrType: o.ptrType,
        smartPtr: o.smartPtr,
        smartPtrType: o.smartPtrType,
      });
      var throwInstanceAlreadyDeleted = (obj) => {
        function getInstanceTypeName(handle) {
          return handle.$$.ptrType.registeredClass.name;
        }
        throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
      };
      var finalizationRegistry = false;
      var detachFinalizer = (handle) => {};
      var runDestructor = ($$) => {
        if ($$.smartPtr) {
          $$.smartPtrType.rawDestructor($$.smartPtr);
        } else {
          $$.ptrType.registeredClass.rawDestructor($$.ptr);
        }
      };
      var releaseClassHandle = ($$) => {
        $$.count.value -= 1;
        var toDelete = 0 === $$.count.value;
        if (toDelete) {
          runDestructor($$);
        }
      };
      var downcastPointer = (ptr, ptrClass, desiredClass) => {
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
      };
      var registeredPointers = {};
      var getInheritedInstanceCount = () => Object.keys(registeredInstances).length;
      var getLiveInheritedInstances = () => {
        var rv = [];
        for (var k in registeredInstances) {
          if (registeredInstances.hasOwnProperty(k)) {
            rv.push(registeredInstances[k]);
          }
        }
        return rv;
      };
      var deletionQueue = [];
      var flushPendingDeletes = () => {
        while (deletionQueue.length) {
          var obj = deletionQueue.pop();
          obj.$$.deleteScheduled = false;
          obj['delete']();
        }
      };
      var delayFunction;
      var setDelayFunction = (fn) => {
        delayFunction = fn;
        if (deletionQueue.length && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
      };
      var init_embind = () => {
        Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
        Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
        Module['flushPendingDeletes'] = flushPendingDeletes;
        Module['setDelayFunction'] = setDelayFunction;
      };
      var registeredInstances = {};
      var getBasestPointer = (class_, ptr) => {
        if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
        }
        while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
        }
        return ptr;
      };
      var getInheritedInstance = (class_, ptr) => {
        ptr = getBasestPointer(class_, ptr);
        return registeredInstances[ptr];
      };
      var makeClassHandle = (prototype, record) => {
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
      };
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
      var attachFinalizer = (handle) => {
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
      };
      var init_ClassHandle = () => {
        Object.assign(ClassHandle.prototype, {
          isAliasOf(other) {
            if (!(this instanceof ClassHandle)) {
              return false;
            }
            if (!(other instanceof ClassHandle)) {
              return false;
            }
            var leftClass = this.$$.ptrType.registeredClass;
            var left = this.$$.ptr;
            other.$$ = other.$$;
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
          },
          clone() {
            if (!this.$$.ptr) {
              throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.preservePointerOnDelete) {
              this.$$.count.value += 1;
              return this;
            } else {
              var clone = attachFinalizer(
                Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } })
              );
              clone.$$.count.value += 1;
              clone.$$.deleteScheduled = false;
              return clone;
            }
          },
          delete() {
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
          },
          isDeleted() {
            return !this.$$.ptr;
          },
          deleteLater() {
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
          },
        });
      };
      function ClassHandle() {}
      var createNamedFunction = (name, body) => Object.defineProperty(body, 'name', { value: name });
      var ensureOverloadTable = (proto, methodName, humanName) => {
        if (undefined === proto[methodName].overloadTable) {
          var prevFunc = proto[methodName];
          proto[methodName] = function () {
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
              throwBindingError(
                `Function '${humanName}' called with an invalid number of arguments (${arguments.length}) - expects one of (${proto[methodName].overloadTable})!`
              );
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
          };
          proto[methodName].overloadTable = [];
          proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
        }
      };
      var exposePublicSymbol = (name, value, numArguments) => {
        if (Module.hasOwnProperty(name)) {
          if (
            undefined === numArguments ||
            (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])
          ) {
            throwBindingError(`Cannot register public name '${name}' twice`);
          }
          ensureOverloadTable(Module, name, name);
          if (Module.hasOwnProperty(numArguments)) {
            throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);
          }
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          if (undefined !== numArguments) {
            Module[name].numArguments = numArguments;
          }
        }
      };
      var char_0 = 48;
      var char_9 = 57;
      var makeLegalFunctionName = (name) => {
        if (undefined === name) {
          return '_unknown';
        }
        name = name.replace(/[^a-zA-Z0-9_]/g, '$');
        var f = name.charCodeAt(0);
        if (f >= char_0 && f <= char_9) {
          return `_${name}`;
        }
        return name;
      };
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
      var upcastPointer = (ptr, ptrClass, desiredClass) => {
        while (ptrClass !== desiredClass) {
          if (!ptrClass.upcast) {
            throwBindingError(`Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`);
          }
          ptr = ptrClass.upcast(ptr);
          ptrClass = ptrClass.baseClass;
        }
        return ptr;
      };
      function constNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError(`null is not a valid ${this.name}`);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
        }
        if (!handle.$$.ptr) {
          throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function genericPointerToWireType(destructors, handle) {
        var ptr;
        if (handle === null) {
          if (this.isReference) {
            throwBindingError(`null is not a valid ${this.name}`);
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
          throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
        }
        if (!handle.$$.ptr) {
          throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
        }
        if (!this.isConst && handle.$$.ptrType.isConst) {
          throwBindingError(
            `Cannot convert argument of type ${
              handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name
            } to parameter type ${this.name}`
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
                  `Cannot convert argument of type ${
                    handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name
                  } to parameter type ${this.name}`
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
                  Emval.toHandle(() => clonedHandle['delete']())
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
            throwBindingError(`null is not a valid ${this.name}`);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
        }
        if (!handle.$$.ptr) {
          throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
        }
        if (handle.$$.ptrType.isConst) {
          throwBindingError(`Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function readPointer(pointer) {
        return this['fromWireType'](HEAPU32[pointer >> 2]);
      }
      var init_RegisteredPointer = () => {
        Object.assign(RegisteredPointer.prototype, {
          getPointee(ptr) {
            if (this.rawGetPointee) {
              ptr = this.rawGetPointee(ptr);
            }
            return ptr;
          },
          destructor(ptr) {
            if (this.rawDestructor) {
              this.rawDestructor(ptr);
            }
          },
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: readPointer,
          deleteObject(handle) {
            if (handle !== null) {
              handle['delete']();
            }
          },
          fromWireType: RegisteredPointer_fromWireType,
        });
      };
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
      var replacePublicSymbol = (name, value, numArguments) => {
        if (!Module.hasOwnProperty(name)) {
          throwInternalError('Replacing nonexistant public symbol');
        }
        if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          Module[name].argCount = numArguments;
        }
      };
      var dynCallLegacy = (sig, ptr, args) => {
        var f = Module['dynCall_' + sig];
        return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
      };
      var dynCall = (sig, ptr, args) => {
        if (sig.includes('j')) {
          return dynCallLegacy(sig, ptr, args);
        }
        var rtn = getWasmTableEntry(ptr).apply(null, args);
        return rtn;
      };
      var getDynCaller = (sig, ptr) => {
        var argCache = [];
        return function () {
          argCache.length = 0;
          Object.assign(argCache, arguments);
          return dynCall(sig, ptr, argCache);
        };
      };
      var embind__requireFunction = (signature, rawFunction) => {
        signature = readLatin1String(signature);
        function makeDynCaller() {
          if (signature.includes('j')) {
            return getDynCaller(signature, rawFunction);
          }
          return getWasmTableEntry(rawFunction);
        }
        var fp = makeDynCaller();
        if (typeof fp != 'function') {
          throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
        }
        return fp;
      };
      var extendError = (baseErrorType, errorName) => {
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
            return `${this.name}: ${this.message}`;
          }
        };
        return errorClass;
      };
      var UnboundTypeError;
      var getTypeName = (type) => {
        var ptr = ___getTypeName(type);
        var rv = readLatin1String(ptr);
        _free(ptr);
        return rv;
      };
      var throwUnboundTypeError = (message, types) => {
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
        throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([', ']));
      };
      var __embind_register_class = (
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
      ) => {
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
          throwUnboundTypeError(`Cannot construct ${name} due to unbound types`, [baseClassRawType]);
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
            var constructor = createNamedFunction(name, function () {
              if (Object.getPrototypeOf(this) !== instancePrototype) {
                throw new BindingError("Use 'new' to construct " + name);
              }
              if (undefined === registeredClass.constructor_body) {
                throw new BindingError(name + ' has no accessible constructor');
              }
              var body = registeredClass.constructor_body[arguments.length];
              if (undefined === body) {
                throw new BindingError(
                  `Tried to invoke ctor of ${name} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(
                    registeredClass.constructor_body
                  ).toString()}) parameters instead!`
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
            if (registeredClass.baseClass) {
              if (registeredClass.baseClass.__derivedClasses === undefined) {
                registeredClass.baseClass.__derivedClasses = [];
              }
              registeredClass.baseClass.__derivedClasses.push(registeredClass);
            }
            var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
            var pointerConverter = new RegisteredPointer(name + '*', registeredClass, false, false, false);
            var constPointerConverter = new RegisteredPointer(name + ' const*', registeredClass, false, true, false);
            registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter };
            replacePublicSymbol(legalFunctionName, constructor);
            return [referenceConverter, pointerConverter, constPointerConverter];
          }
        );
      };
      var heap32VectorToArray = (count, firstElement) => {
        var array = [];
        for (var i = 0; i < count; i++) {
          array.push(HEAPU32[(firstElement + i * 4) >> 2]);
        }
        return array;
      };
      var runDestructors = (destructors) => {
        while (destructors.length) {
          var ptr = destructors.pop();
          var del = destructors.pop();
          del(ptr);
        }
      };
      function newFunc(constructor, argumentList) {
        if (!(constructor instanceof Function)) {
          throw new TypeError(`new_ called with constructor type ${typeof constructor} which is not a function`);
        }
        var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function () {});
        dummy.prototype = constructor.prototype;
        var obj = new dummy();
        var r = constructor.apply(obj, argumentList);
        return r instanceof Object ? r : obj;
      }
      function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, isAsync) {
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
        var invokerFnBody = `\n        return function (${argsList}) {\n        if (arguments.length !== ${
          argCount - 2
        }) {\n          throwBindingError('function ${humanName} called with ' + arguments.length + ' arguments, expected ${
          argCount - 2
        }');\n        }`;
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
        invokerFnBody +=
          (returns || isAsync ? 'var rv = ' : '') + 'invoker(fn' + (argsListWired.length > 0 ? ', ' : '') + argsListWired + ');\n';
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
        var invokerFn = newFunc(Function, args1).apply(null, args2);
        return createNamedFunction(humanName, invokerFn);
      }
      var __embind_register_class_constructor = (rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) => {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        invoker = embind__requireFunction(invokerSignature, invoker);
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
          classType = classType[0];
          var humanName = `constructor ${classType.name}`;
          if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = [];
          }
          if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError(
              `Cannot register multiple constructors with identical number of parameters (${argCount - 1}) for class '${
                classType.name
              }'! Overload resolution is currently only performed using the parameter count, not actual type info!`
            );
          }
          classType.registeredClass.constructor_body[argCount - 1] = () => {
            throwUnboundTypeError(`Cannot construct ${classType.name} due to unbound types`, rawArgTypes);
          };
          whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
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
      };
      var getFunctionName = (signature) => {
        signature = signature.trim();
        const argsIndex = signature.indexOf('(');
        if (argsIndex !== -1) {
          return signature.substr(0, argsIndex);
        } else {
          return signature;
        }
      };
      var __embind_register_class_function = (
        rawClassType,
        methodName,
        argCount,
        rawArgTypesAddr,
        invokerSignature,
        rawInvoker,
        context,
        isPureVirtual,
        isAsync
      ) => {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        methodName = readLatin1String(methodName);
        methodName = getFunctionName(methodName);
        rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
          classType = classType[0];
          var humanName = `${classType.name}.${methodName}`;
          if (methodName.startsWith('@@')) {
            methodName = Symbol[methodName.substring(2)];
          }
          if (isPureVirtual) {
            classType.registeredClass.pureVirtualFunctions.push(methodName);
          }
          function unboundTypesHandler() {
            throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes);
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
            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context, isAsync);
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
      };
      function handleAllocatorInit() {
        Object.assign(HandleAllocator.prototype, {
          get(id) {
            return this.allocated[id];
          },
          has(id) {
            return this.allocated[id] !== undefined;
          },
          allocate(handle) {
            var id = this.freelist.pop() || this.allocated.length;
            this.allocated[id] = handle;
            return id;
          },
          free(id) {
            this.allocated[id] = undefined;
            this.freelist.push(id);
          },
        });
      }
      function HandleAllocator() {
        this.allocated = [undefined];
        this.freelist = [];
      }
      var emval_handles = new HandleAllocator();
      var __emval_decref = (handle) => {
        if (handle >= emval_handles.reserved && 0 === --emval_handles.get(handle).refcount) {
          emval_handles.free(handle);
        }
      };
      var count_emval_handles = () => {
        var count = 0;
        for (var i = emval_handles.reserved; i < emval_handles.allocated.length; ++i) {
          if (emval_handles.allocated[i] !== undefined) {
            ++count;
          }
        }
        return count;
      };
      var init_emval = () => {
        emval_handles.allocated.push({ value: undefined }, { value: null }, { value: true }, { value: false });
        emval_handles.reserved = emval_handles.allocated.length;
        Module['count_emval_handles'] = count_emval_handles;
      };
      var Emval = {
        toValue: (handle) => {
          if (!handle) {
            throwBindingError('Cannot use deleted val. handle = ' + handle);
          }
          return emval_handles.get(handle).value;
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
              return emval_handles.allocate({ refcount: 1, value: value });
            }
          }
        },
      };
      function simpleReadValueFromPointer(pointer) {
        return this['fromWireType'](HEAP32[pointer >> 2]);
      }
      var __embind_register_emval = (rawType, name) => {
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: (handle) => {
            var rv = Emval.toValue(handle);
            __emval_decref(handle);
            return rv;
          },
          toWireType: (destructors, value) => Emval.toHandle(value),
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction: null,
        });
      };
      var embindRepr = (v) => {
        if (v === null) {
          return 'null';
        }
        var t = typeof v;
        if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
        } else {
          return '' + v;
        }
      };
      var floatReadValueFromPointer = (name, width) => {
        switch (width) {
          case 4:
            return function (pointer) {
              return this['fromWireType'](HEAPF32[pointer >> 2]);
            };
          case 8:
            return function (pointer) {
              return this['fromWireType'](HEAPF64[pointer >> 3]);
            };
          default:
            throw new TypeError(`invalid float width (${width}): ${name}`);
        }
      };
      var __embind_register_float = (rawType, name, size) => {
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          fromWireType: (value) => value,
          toWireType: (destructors, value) => value,
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: floatReadValueFromPointer(name, size),
          destructorFunction: null,
        });
      };
      var integerReadValueFromPointer = (name, width, signed) => {
        switch (width) {
          case 1:
            return signed ? (pointer) => HEAP8[pointer >> 0] : (pointer) => HEAPU8[pointer >> 0];
          case 2:
            return signed ? (pointer) => HEAP16[pointer >> 1] : (pointer) => HEAPU16[pointer >> 1];
          case 4:
            return signed ? (pointer) => HEAP32[pointer >> 2] : (pointer) => HEAPU32[pointer >> 2];
          default:
            throw new TypeError(`invalid integer width (${width}): ${name}`);
        }
      };
      var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
        name = readLatin1String(name);
        if (maxRange === -1) {
          maxRange = 4294967295;
        }
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
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: integerReadValueFromPointer(name, size, minRange !== 0),
          destructorFunction: null,
        });
      };
      var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
        var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
        var TA = typeMapping[dataTypeIndex];
        function decodeMemoryView(handle) {
          var size = HEAPU32[handle >> 2];
          var data = HEAPU32[(handle + 4) >> 2];
          return new TA(HEAP8.buffer, data, size);
        }
        name = readLatin1String(name);
        registerType(
          rawType,
          { name: name, fromWireType: decodeMemoryView, argPackAdvance: GenericWireTypeSize, readValueFromPointer: decodeMemoryView },
          { ignoreDuplicateRegistrations: true }
        );
      };
      var __embind_register_std_string = (rawType, name) => {
        name = readLatin1String(name);
        var stdStringIsUTF8 = name === 'std::string';
        registerType(rawType, {
          name: name,
          fromWireType(value) {
            var length = HEAPU32[value >> 2];
            var payload = value + 4;
            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = payload;
              for (var i = 0; i <= length; ++i) {
                var currentBytePtr = payload + i;
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
                a[i] = String.fromCharCode(HEAPU8[payload + i]);
              }
              str = a.join('');
            }
            _free(value);
            return str;
          },
          toWireType(destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }
            var length;
            var valueIsOfTypeString = typeof value == 'string';
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
              throwBindingError('Cannot pass non-string to std::string');
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              length = lengthBytesUTF8(value);
            } else {
              length = value.length;
            }
            var base = _malloc(4 + length + 1);
            var ptr = base + 4;
            HEAPU32[base >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0; i < length; ++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                  }
                  HEAPU8[ptr + i] = charCode;
                }
              } else {
                for (var i = 0; i < length; ++i) {
                  HEAPU8[ptr + i] = value[i];
                }
              }
            }
            if (destructors !== null) {
              destructors.push(_free, base);
            }
            return base;
          },
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: readPointer,
          destructorFunction(ptr) {
            _free(ptr);
          },
        });
      };
      var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;
      var UTF16ToString = (ptr, maxBytesToRead) => {
        var endPtr = ptr;
        var idx = endPtr >> 1;
        var maxIdx = idx + maxBytesToRead / 2;
        while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
        endPtr = idx << 1;
        if (endPtr - ptr > 32 && UTF16Decoder) return UTF16Decoder.decode(HEAPU8.slice(ptr, endPtr));
        var str = '';
        for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
          var codeUnit = HEAP16[(ptr + i * 2) >> 1];
          if (codeUnit == 0) break;
          str += String.fromCharCode(codeUnit);
        }
        return str;
      };
      var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
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
      };
      var lengthBytesUTF16 = (str) => str.length * 2;
      var UTF32ToString = (ptr, maxBytesToRead) => {
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
      };
      var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
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
      };
      var lengthBytesUTF32 = (str) => {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
          len += 4;
        }
        return len;
      };
      var __embind_register_std_wstring = (rawType, charSize, name) => {
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
          fromWireType: (value) => {
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
          toWireType: (destructors, value) => {
            if (!(typeof value == 'string')) {
              throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
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
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: simpleReadValueFromPointer,
          destructorFunction(ptr) {
            _free(ptr);
          },
        });
      };
      var __embind_register_void = (rawType, name) => {
        name = readLatin1String(name);
        registerType(rawType, {
          isVoid: true,
          name: name,
          argPackAdvance: 0,
          fromWireType: () => undefined,
          toWireType: (destructors, o) => undefined,
        });
      };
      var nowIsMonotonic = 1;
      var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
      var maybeExit = () => {
        if (runtimeExited) {
          return;
        }
        if (!keepRuntimeAlive()) {
          try {
            if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS);
            else _exit(EXITSTATUS);
          } catch (e) {
            handleException(e);
          }
        }
      };
      var callUserCallback = (func) => {
        if (runtimeExited || ABORT) {
          return;
        }
        try {
          func();
          maybeExit();
        } catch (e) {
          handleException(e);
        }
      };
      var __emscripten_thread_mailbox_await = (pthread_ptr) => {
        if (typeof Atomics.waitAsync === 'function') {
          var wait = Atomics.waitAsync(HEAP32, pthread_ptr >> 2, pthread_ptr);
          wait.value.then(checkMailbox);
          var waitingAsync = pthread_ptr + 128;
          Atomics.store(HEAP32, waitingAsync >> 2, 1);
        }
      };
      Module['__emscripten_thread_mailbox_await'] = __emscripten_thread_mailbox_await;
      var checkMailbox = () => {
        var pthread_ptr = _pthread_self();
        if (pthread_ptr) {
          __emscripten_thread_mailbox_await(pthread_ptr);
          callUserCallback(__emscripten_check_mailbox);
        }
      };
      Module['checkMailbox'] = checkMailbox;
      var __emscripten_notify_mailbox_postmessage = (targetThreadId, currThreadId, mainThreadId) => {
        if (targetThreadId == currThreadId) {
          setTimeout(() => checkMailbox());
        } else if (ENVIRONMENT_IS_PTHREAD) {
          postMessage({ targetThread: targetThreadId, cmd: 'checkMailbox' });
        } else {
          var worker = PThread.pthreads[targetThreadId];
          if (!worker) {
            return;
          }
          worker.postMessage({ cmd: 'checkMailbox' });
        }
      };
      var proxiedJSCallArgs = [];
      var __emscripten_receive_on_main_thread_js = (index, callingThread, numCallArgs, args) => {
        proxiedJSCallArgs.length = numCallArgs;
        var b = args >> 3;
        for (var i = 0; i < numCallArgs; i++) {
          proxiedJSCallArgs[i] = HEAPF64[b + i];
        }
        var func = proxiedFunctionTable[index];
        PThread.currentProxiedOperationCallerThread = callingThread;
        var rtn = func.apply(null, proxiedJSCallArgs);
        PThread.currentProxiedOperationCallerThread = 0;
        return rtn;
      };
      var __emscripten_thread_set_strongref = (thread) => {};
      var __emval_incref = (handle) => {
        if (handle > 4) {
          emval_handles.get(handle).refcount += 1;
        }
      };
      var requireRegisteredType = (rawType, humanName) => {
        var impl = registeredTypes[rawType];
        if (undefined === impl) {
          throwBindingError(humanName + ' has unknown type ' + getTypeName(rawType));
        }
        return impl;
      };
      var __emval_take_value = (type, arg) => {
        type = requireRegisteredType(type, '_emval_take_value');
        var v = type['readValueFromPointer'](arg);
        return Emval.toHandle(v);
      };
      function __mmap_js(len, prot, flags, fd, offset_low, offset_high, allocated, addr) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(14, 1, len, prot, flags, fd, offset_low, offset_high, allocated, addr);
        var offset = convertI32PairToI53Checked(offset_low, offset_high);
        try {
          if (isNaN(offset)) return 61;
          var stream = SYSCALLS.getStreamFromFD(fd);
          var res = FS.mmap(stream, len, offset, prot, flags);
          var ptr = res.ptr;
          HEAP32[allocated >> 2] = res.allocated;
          HEAPU32[addr >> 2] = ptr;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      function __munmap_js(addr, len, prot, flags, fd, offset_low, offset_high) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(15, 1, addr, len, prot, flags, fd, offset_low, offset_high);
        var offset = convertI32PairToI53Checked(offset_low, offset_high);
        try {
          if (isNaN(offset)) return 61;
          var stream = SYSCALLS.getStreamFromFD(fd);
          if (prot & 2) {
            SYSCALLS.doMsync(addr, stream, len, flags, offset);
          }
          FS.munmap(stream);
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return -e.errno;
        }
      }
      var _abort = () => {
        abort('');
      };
      var warnOnce = (text) => {
        if (!warnOnce.shown) warnOnce.shown = {};
        if (!warnOnce.shown[text]) {
          warnOnce.shown[text] = 1;
          err(text);
        }
      };
      var _emscripten_check_blocking_allowed = () => {};
      var _emscripten_date_now = () => Date.now();
      var runtimeKeepalivePush = () => {
        runtimeKeepaliveCounter += 1;
      };
      var _emscripten_exit_with_live_runtime = () => {
        runtimeKeepalivePush();
        throw 'unwind';
      };
      var getHeapMax = () => HEAPU8.length;
      var _emscripten_get_heap_max = () => getHeapMax();
      var _emscripten_get_now;
      _emscripten_get_now = () => performance.timeOrigin + performance.now();
      var _emscripten_num_logical_cores = () => navigator['hardwareConcurrency'];
      var abortOnCannotGrowMemory = (requestedSize) => {
        abort('OOM');
      };
      var _emscripten_resize_heap = (requestedSize) => {
        var oldSize = HEAPU8.length;
        requestedSize >>>= 0;
        abortOnCannotGrowMemory(requestedSize);
      };
      var ENV = {};
      var getExecutableName = () => thisProgram || './this.program';
      var getEnvStrings = () => {
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
            strings.push(`${x}=${env[x]}`);
          }
          getEnvStrings.strings = strings;
        }
        return getEnvStrings.strings;
      };
      var stringToAscii = (str, buffer) => {
        for (var i = 0; i < str.length; ++i) {
          HEAP8[buffer++ >> 0] = str.charCodeAt(i);
        }
        HEAP8[buffer >> 0] = 0;
      };
      var _environ_get = function (__environ, environ_buf) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(16, 1, __environ, environ_buf);
        var bufSize = 0;
        getEnvStrings().forEach((string, i) => {
          var ptr = environ_buf + bufSize;
          HEAPU32[(__environ + i * 4) >> 2] = ptr;
          stringToAscii(string, ptr);
          bufSize += string.length + 1;
        });
        return 0;
      };
      var _environ_sizes_get = function (penviron_count, penviron_buf_size) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(17, 1, penviron_count, penviron_buf_size);
        var strings = getEnvStrings();
        HEAPU32[penviron_count >> 2] = strings.length;
        var bufSize = 0;
        strings.forEach((string) => (bufSize += string.length + 1));
        HEAPU32[penviron_buf_size >> 2] = bufSize;
        return 0;
      };
      function _fd_close(fd) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(18, 1, fd);
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          FS.close(stream);
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return e.errno;
        }
      }
      var doReadv = (stream, iov, iovcnt, offset) => {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAPU32[iov >> 2];
          var len = HEAPU32[(iov + 4) >> 2];
          iov += 8;
          var curr = FS.read(stream, HEAP8, ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break;
          if (typeof offset !== 'undefined') {
            offset += curr;
          }
        }
        return ret;
      };
      function _fd_read(fd, iov, iovcnt, pnum) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(19, 1, fd, iov, iovcnt, pnum);
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doReadv(stream, iov, iovcnt);
          HEAPU32[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return e.errno;
        }
      }
      function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(20, 1, fd, offset_low, offset_high, whence, newOffset);
        var offset = convertI32PairToI53Checked(offset_low, offset_high);
        try {
          if (isNaN(offset)) return 61;
          var stream = SYSCALLS.getStreamFromFD(fd);
          FS.llseek(stream, offset, whence);
          (tempI64 = [
            stream.position >>> 0,
            ((tempDouble = stream.position),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
              : 0),
          ]),
            (HEAP32[newOffset >> 2] = tempI64[0]),
            (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
          if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return e.errno;
        }
      }
      function _fd_sync(fd) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(21, 1, fd);
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          if (stream.stream_ops && stream.stream_ops.fsync) {
            return stream.stream_ops.fsync(stream);
          }
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return e.errno;
        }
      }
      var doWritev = (stream, iov, iovcnt, offset) => {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAPU32[iov >> 2];
          var len = HEAPU32[(iov + 4) >> 2];
          iov += 8;
          var curr = FS.write(stream, HEAP8, ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (typeof offset !== 'undefined') {
            offset += curr;
          }
        }
        return ret;
      };
      function _fd_write(fd, iov, iovcnt, pnum) {
        if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(22, 1, fd, iov, iovcnt, pnum);
        try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = doWritev(stream, iov, iovcnt);
          HEAPU32[pnum >> 2] = num;
          return 0;
        } catch (e) {
          if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
          return e.errno;
        }
      }
      var _getentropy = (buffer, size) => {
        randomFill(HEAPU8.subarray(buffer, buffer + size));
        return 0;
      };
      var isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      var arraySum = (array, index) => {
        var sum = 0;
        for (var i = 0; i <= index; sum += array[i++]) {}
        return sum;
      };
      var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var addDays = (date, days) => {
        var newDate = new Date(date.getTime());
        while (days > 0) {
          var leap = isLeapYear(newDate.getFullYear());
          var currentMonth = newDate.getMonth();
          var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
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
      };
      var writeArrayToMemory = (array, buffer) => {
        HEAP8.set(array, buffer);
      };
      var _strftime = (s, maxsize, format, tm) => {
        var tm_zone = HEAPU32[(tm + 40) >> 2];
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
          var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear() + 1;
            }
            return thisDate.getFullYear();
          }
          return thisDate.getFullYear() - 1;
        }
        var EXPANSION_RULES_2 = {
          '%a': (date) => WEEKDAYS[date.tm_wday].substring(0, 3),
          '%A': (date) => WEEKDAYS[date.tm_wday],
          '%b': (date) => MONTHS[date.tm_mon].substring(0, 3),
          '%B': (date) => MONTHS[date.tm_mon],
          '%C': (date) => {
            var year = date.tm_year + 1900;
            return leadingNulls((year / 100) | 0, 2);
          },
          '%d': (date) => leadingNulls(date.tm_mday, 2),
          '%e': (date) => leadingSomething(date.tm_mday, 2, ' '),
          '%g': (date) => getWeekBasedYear(date).toString().substring(2),
          '%G': (date) => getWeekBasedYear(date),
          '%H': (date) => leadingNulls(date.tm_hour, 2),
          '%I': (date) => {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0) twelveHour = 12;
            else if (twelveHour > 12) twelveHour -= 12;
            return leadingNulls(twelveHour, 2);
          },
          '%j': (date) =>
            leadingNulls(
              date.tm_mday + arraySum(isLeapYear(date.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, date.tm_mon - 1),
              3
            ),
          '%m': (date) => leadingNulls(date.tm_mon + 1, 2),
          '%M': (date) => leadingNulls(date.tm_min, 2),
          '%n': () => '\n',
          '%p': (date) => {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
              return 'AM';
            }
            return 'PM';
          },
          '%S': (date) => leadingNulls(date.tm_sec, 2),
          '%t': () => '\t',
          '%u': (date) => date.tm_wday || 7,
          '%U': (date) => {
            var days = date.tm_yday + 7 - date.tm_wday;
            return leadingNulls(Math.floor(days / 7), 2);
          },
          '%V': (date) => {
            var val = Math.floor((date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7);
            if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
              val++;
            }
            if (!val) {
              val = 52;
              var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
              if (dec31 == 4 || (dec31 == 5 && isLeapYear((date.tm_year % 400) - 1))) {
                val++;
              }
            } else if (val == 53) {
              var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
              if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
            }
            return leadingNulls(val, 2);
          },
          '%w': (date) => date.tm_wday,
          '%W': (date) => {
            var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
            return leadingNulls(Math.floor(days / 7), 2);
          },
          '%y': (date) => (date.tm_year + 1900).toString().substring(2),
          '%Y': (date) => date.tm_year + 1900,
          '%z': (date) => {
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = (off / 60) * 100 + (off % 60);
            return (ahead ? '+' : '-') + String('0000' + off).slice(-4);
          },
          '%Z': (date) => date.tm_zone,
          '%%': () => '%',
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
      };
      var _strftime_l = (s, maxsize, format, tm, loc) => _strftime(s, maxsize, format, tm);
      PThread.init();
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
      FS.createPreloadedFile = FS_createPreloadedFile;
      FS.staticInit();
      embind_init_charCodes();
      BindingError = Module['BindingError'] = class BindingError extends Error {
        constructor(message) {
          super(message);
          this.name = 'BindingError';
        }
      };
      InternalError = Module['InternalError'] = class InternalError extends Error {
        constructor(message) {
          super(message);
          this.name = 'InternalError';
        }
      };
      init_ClassHandle();
      init_embind();
      init_RegisteredPointer();
      UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');
      handleAllocatorInit();
      init_emval();
      var proxiedFunctionTable = [
        _proc_exit,
        exitOnMainThread,
        pthreadCreateProxied,
        ___syscall_fcntl64,
        ___syscall_fstat64,
        ___syscall_ftruncate64,
        ___syscall_ioctl,
        ___syscall_lstat64,
        ___syscall_newfstatat,
        ___syscall_openat,
        ___syscall_readlinkat,
        ___syscall_renameat,
        ___syscall_stat64,
        ___syscall_unlinkat,
        __mmap_js,
        __munmap_js,
        _environ_get,
        _environ_sizes_get,
        _fd_close,
        _fd_read,
        _fd_seek,
        _fd_sync,
        _fd_write,
      ];
      var wasmImports = {
        b: ___assert_fail,
        w: ___cxa_begin_catch,
        v: ___cxa_end_catch,
        d: ___cxa_find_matching_catch_2,
        k: ___cxa_find_matching_catch_3,
        ya: ___cxa_rethrow,
        n: ___cxa_throw,
        ia: ___emscripten_init_main_thread_js,
        E: ___emscripten_thread_cleanup,
        fa: ___pthread_create_js,
        h: ___resumeException,
        oa: ___syscall_fstat64,
        W: ___syscall_ftruncate64,
        ma: ___syscall_newfstatat,
        pa: ___syscall_openat,
        ea: ___syscall_readlinkat,
        da: ___syscall_renameat,
        na: ___syscall_stat64,
        aa: ___syscall_unlinkat,
        X: __embind_register_bigint,
        ua: __embind_register_bool,
        S: __embind_register_class,
        R: __embind_register_class_constructor,
        m: __embind_register_class_function,
        ta: __embind_register_emval,
        K: __embind_register_float,
        q: __embind_register_integer,
        l: __embind_register_memory_view,
        J: __embind_register_std_string,
        B: __embind_register_std_wstring,
        va: __embind_register_void,
        sa: __emscripten_get_now_is_monotonic,
        ba: __emscripten_notify_mailbox_postmessage,
        ga: __emscripten_receive_on_main_thread_js,
        ha: __emscripten_thread_mailbox_await,
        ra: __emscripten_thread_set_strongref,
        Ca: __emval_decref,
        Da: __emval_incref,
        s: __emval_take_value,
        T: __mmap_js,
        U: __munmap_js,
        c: _abort,
        F: _emscripten_check_blocking_allowed,
        H: _emscripten_date_now,
        qa: _emscripten_exit_with_live_runtime,
        ca: _emscripten_get_heap_max,
        p: _emscripten_get_now,
        M: _emscripten_num_logical_cores,
        $: _emscripten_resize_heap,
        ja: _environ_get,
        ka: _environ_sizes_get,
        L: _exit,
        I: _fd_close,
        G: _fd_read,
        V: _fd_seek,
        la: _fd_sync,
        A: _fd_write,
        Z: _getentropy,
        Ba: invoke_fi,
        D: invoke_i,
        g: invoke_ii,
        xa: invoke_iidii,
        Aa: invoke_iif,
        e: invoke_iii,
        f: invoke_iiii,
        z: invoke_iiiii,
        y: invoke_iiiiii,
        Q: invoke_iiiiiii,
        Y: invoke_iij,
        r: invoke_v,
        j: invoke_vi,
        i: invoke_vii,
        t: invoke_viid,
        C: invoke_viidi,
        o: invoke_viii,
        za: invoke_viiidiii,
        u: invoke_viiii,
        O: invoke_viiiidi,
        P: invoke_viiiii,
        x: invoke_viiiiiiidi,
        N: invoke_viiiiiiii,
        a: wasmMemory || Module['wasmMemory'],
        _: _strftime_l,
        wa: xnnLoadWasmModuleJS,
      };
      var wasmExports = createWasm();
      var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports['Ea'])();
      var _pthread_self = (Module['_pthread_self'] = () => (_pthread_self = Module['_pthread_self'] = wasmExports['Fa'])());
      var _malloc = (a0) => (_malloc = wasmExports['Ha'])(a0);
      var _free = (a0) => (_free = wasmExports['Ia'])(a0);
      var ___errno_location = () => (___errno_location = wasmExports['Ja'])();
      var __emscripten_tls_init = (Module['__emscripten_tls_init'] = () =>
        (__emscripten_tls_init = Module['__emscripten_tls_init'] = wasmExports['Ka'])());
      var _emscripten_builtin_memalign = (a0, a1) => (_emscripten_builtin_memalign = wasmExports['La'])(a0, a1);
      var ___getTypeName = (a0) => (___getTypeName = wasmExports['Ma'])(a0);
      var __embind_initialize_bindings = (Module['__embind_initialize_bindings'] = () =>
        (__embind_initialize_bindings = Module['__embind_initialize_bindings'] = wasmExports['Na'])());
      var ___funcs_on_exit = () => (___funcs_on_exit = wasmExports['Oa'])();
      var __emscripten_thread_init = (Module['__emscripten_thread_init'] = (a0, a1, a2, a3, a4, a5) =>
        (__emscripten_thread_init = Module['__emscripten_thread_init'] = wasmExports['Pa'])(a0, a1, a2, a3, a4, a5));
      var __emscripten_thread_crashed = (Module['__emscripten_thread_crashed'] = () =>
        (__emscripten_thread_crashed = Module['__emscripten_thread_crashed'] = wasmExports['Qa'])());
      var _emscripten_main_thread_process_queued_calls = () =>
        (_emscripten_main_thread_process_queued_calls = wasmExports['emscripten_main_thread_process_queued_calls'])();
      var _fflush = (Module['_fflush'] = (a0) => (_fflush = Module['_fflush'] = wasmExports['Ra'])(a0));
      var _emscripten_main_runtime_thread_id = () =>
        (_emscripten_main_runtime_thread_id = wasmExports['emscripten_main_runtime_thread_id'])();
      var __emscripten_run_on_main_thread_js = (a0, a1, a2, a3) => (__emscripten_run_on_main_thread_js = wasmExports['Sa'])(a0, a1, a2, a3);
      var __emscripten_thread_free_data = (a0) => (__emscripten_thread_free_data = wasmExports['Ta'])(a0);
      var __emscripten_thread_exit = (Module['__emscripten_thread_exit'] = (a0) =>
        (__emscripten_thread_exit = Module['__emscripten_thread_exit'] = wasmExports['Ua'])(a0));
      var __emscripten_check_mailbox = () => (__emscripten_check_mailbox = wasmExports['Va'])();
      var _setThrew = (a0, a1) => (_setThrew = wasmExports['Wa'])(a0, a1);
      var setTempRet0 = (a0) => (setTempRet0 = wasmExports['Xa'])(a0);
      var _emscripten_stack_set_limits = (a0, a1) => (_emscripten_stack_set_limits = wasmExports['Ya'])(a0, a1);
      var stackSave = () => (stackSave = wasmExports['Za'])();
      var stackRestore = (a0) => (stackRestore = wasmExports['_a'])(a0);
      var stackAlloc = (a0) => (stackAlloc = wasmExports['$a'])(a0);
      var ___cxa_decrement_exception_refcount = (a0) => (___cxa_decrement_exception_refcount = wasmExports['ab'])(a0);
      var ___cxa_increment_exception_refcount = (a0) => (___cxa_increment_exception_refcount = wasmExports['bb'])(a0);
      var ___cxa_can_catch = (a0, a1, a2) => (___cxa_can_catch = wasmExports['cb'])(a0, a1, a2);
      var ___cxa_is_pointer_type = (a0) => (___cxa_is_pointer_type = wasmExports['db'])(a0);
      var dynCall_viijj = (Module['dynCall_viijj'] = (a0, a1, a2, a3, a4, a5, a6) =>
        (dynCall_viijj = Module['dynCall_viijj'] = wasmExports['eb'])(a0, a1, a2, a3, a4, a5, a6));
      var dynCall_viiijjj = (Module['dynCall_viiijjj'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
        (dynCall_viiijjj = Module['dynCall_viiijjj'] = wasmExports['fb'])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9));
      var dynCall_iiiij = (Module['dynCall_iiiij'] = (a0, a1, a2, a3, a4, a5) =>
        (dynCall_iiiij = Module['dynCall_iiiij'] = wasmExports['gb'])(a0, a1, a2, a3, a4, a5));
      var dynCall_jii = (Module['dynCall_jii'] = (a0, a1, a2) => (dynCall_jii = Module['dynCall_jii'] = wasmExports['hb'])(a0, a1, a2));
      var dynCall_jjj = (Module['dynCall_jjj'] = (a0, a1, a2, a3, a4) =>
        (dynCall_jjj = Module['dynCall_jjj'] = wasmExports['ib'])(a0, a1, a2, a3, a4));
      var dynCall_iiiijj = (Module['dynCall_iiiijj'] = (a0, a1, a2, a3, a4, a5, a6, a7) =>
        (dynCall_iiiijj = Module['dynCall_iiiijj'] = wasmExports['jb'])(a0, a1, a2, a3, a4, a5, a6, a7));
      var dynCall_viijji = (Module['dynCall_viijji'] = (a0, a1, a2, a3, a4, a5, a6, a7) =>
        (dynCall_viijji = Module['dynCall_viijji'] = wasmExports['kb'])(a0, a1, a2, a3, a4, a5, a6, a7));
      var dynCall_iiijj = (Module['dynCall_iiijj'] = (a0, a1, a2, a3, a4, a5, a6) =>
        (dynCall_iiijj = Module['dynCall_iiijj'] = wasmExports['lb'])(a0, a1, a2, a3, a4, a5, a6));
      var dynCall_viijjj = (Module['dynCall_viijjj'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) =>
        (dynCall_viijjj = Module['dynCall_viijjj'] = wasmExports['mb'])(a0, a1, a2, a3, a4, a5, a6, a7, a8));
      var dynCall_iij = (Module['dynCall_iij'] = (a0, a1, a2, a3) =>
        (dynCall_iij = Module['dynCall_iij'] = wasmExports['nb'])(a0, a1, a2, a3));
      var dynCall_iijjiiii = (Module['dynCall_iijjiiii'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
        (dynCall_iijjiiii = Module['dynCall_iijjiiii'] = wasmExports['ob'])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9));
      var dynCall_jiji = (Module['dynCall_jiji'] = (a0, a1, a2, a3, a4) =>
        (dynCall_jiji = Module['dynCall_jiji'] = wasmExports['pb'])(a0, a1, a2, a3, a4));
      var dynCall_viijii = (Module['dynCall_viijii'] = (a0, a1, a2, a3, a4, a5, a6) =>
        (dynCall_viijii = Module['dynCall_viijii'] = wasmExports['qb'])(a0, a1, a2, a3, a4, a5, a6));
      var dynCall_iiiiij = (Module['dynCall_iiiiij'] = (a0, a1, a2, a3, a4, a5, a6) =>
        (dynCall_iiiiij = Module['dynCall_iiiiij'] = wasmExports['rb'])(a0, a1, a2, a3, a4, a5, a6));
      var dynCall_iiiiijj = (Module['dynCall_iiiiijj'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) =>
        (dynCall_iiiiijj = Module['dynCall_iiiiijj'] = wasmExports['sb'])(a0, a1, a2, a3, a4, a5, a6, a7, a8));
      var dynCall_iiiiiijj = (Module['dynCall_iiiiiijj'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
        (dynCall_iiiiiijj = Module['dynCall_iiiiiijj'] = wasmExports['tb'])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9));
      var ___start_em_js = (Module['___start_em_js'] = 262148);
      var ___stop_em_js = (Module['___stop_em_js'] = 262760);
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
      function invoke_iif(index, a1, a2) {
        var sp = stackSave();
        try {
          return getWasmTableEntry(index)(a1, a2);
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
      function invoke_iij(index, a1, a2, a3) {
        var sp = stackSave();
        try {
          return dynCall_iij(index, a1, a2, a3);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
        }
      }
      Module['wasmMemory'] = wasmMemory;
      Module['keepRuntimeAlive'] = keepRuntimeAlive;
      Module['ExitStatus'] = ExitStatus;
      Module['PThread'] = PThread;
      var calledRun;
      dependenciesFulfilled = function runCaller() {
        if (!calledRun) run();
        if (!calledRun) dependenciesFulfilled = runCaller;
      };
      function run() {
        if (runDependencies > 0) {
          return;
        }
        if (ENVIRONMENT_IS_PTHREAD) {
          readyPromiseResolve(Module);
          initRuntime();
          startWorker(Module);
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
      if (Module['preInit']) {
        if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
        while (Module['preInit'].length > 0) {
          Module['preInit'].pop()();
        }
      }
      run();

      return moduleArg.ready;
    };
  })();
  createWasmMultiInstance = Module;
}

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
const version = '1.0.0-beta.9';
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
const defaultAssetsDirBaseUrl$1 = `https://d3opqjmqzxf057.cloudfront.net/noise-suppression/${version}`;
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
  async init(options = {}) {
    console.log('Noise suppression transformer initialization');
    this.transform = options.debug ? this.transformDebug.bind(this) : this.transformAudioData.bind(this);
    const assetsDirBaseUrl = options.assetsDirBaseUrl ?? defaultAssetsDirBaseUrl$1;
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
      numberOfThreads = 4;
    }
    this.wasmTransformer = new this.wasmInstance.DtlnTransformer();
    await Promise.all([this.loadModel(`${assetsDirBaseUrl}/model_1.tflite`, 1), this.loadModel(`${assetsDirBaseUrl}/model_2.tflite`, 2)]);
    let result;
    try {
      result = await this.wasmTransformer?.init(numberOfThreads);
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
    if (options.debug) {
      this.wasmTransformer?.enableWavExport();
    }
    console.log('Noise suppression transformer ready');
  }
  /**
   * @internal
   */
  getWav() {
    if (!this.wasmTransformer) {
      return '';
    }
    this.wasmTransformer.closeWav();
    const buffer = this.wasmTransformer.getWav();
    const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    return `data:audio/wav;base64,${base64}`;
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
    return this.wasmTransformer?.getLatencyNs() ?? 0;
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
        const { numberOfFrames, sampleRate, numberOfChannels, timestamp } = data;
        const dataAsFloat32 = this.getAudioDataAsFloat32(data);
        const dataAsInt16 = this.convertTypedArray(dataAsFloat32, Int16Array, 2 ** 15 - 1);
        this.wasmTransformer.getInputFrame(dataAsInt16.length).set(dataAsInt16);
        let outputSize = 0;
        try {
          outputSize = this.wasmTransformer.runAlgorithm(numberOfFrames, sampleRate, numberOfChannels);
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
          data = new AudioData({
            data: outputAsFloat32,
            format: 'f32',
            numberOfChannels,
            numberOfFrames,
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
    return this.audioDataToTypedArray(data, Float32Array, 'f32-planar');
  }
  audioDataToTypedArray(data, typeArrayClass, format, numberOfChannels = data.numberOfChannels) {
    const size = data.numberOfFrames * numberOfChannels;
    const buffer = new typeArrayClass(size);
    for (let i = 0; i < numberOfChannels; ++i) {
      const offset = data.numberOfFrames * i;
      const samples = buffer.subarray(offset, offset + data.numberOfFrames);
      data.copyTo(samples, { planeIndex: i, format });
    }
    if (numberOfChannels > 1) {
      const result = new typeArrayClass(size);
      for (let i = 0; i < data.numberOfFrames; ++i) {
        const index = i * 2;
        for (let j2 = 0; j2 < numberOfChannels; ++j2) {
          result[index + j2] = buffer[i + j2 * data.numberOfFrames];
        }
      }
      return result;
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
   * @internal
   */
  getWav() {
    return this.transformer?.getWav() ?? '';
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
  'bGV0IGNyZWF0ZVdhc21Nb25vSW5zdGFuY2U7IHsKCnZhciBNb2R1bGUgPSAoKCkgPT4gewogIHZhciBfc2NyaXB0RGlyID0gbG9jYXRpb24uaHJlZjsKICAKICByZXR1cm4gKApmdW5jdGlvbihtb2R1bGVBcmcgPSB7fSkgewoKdmFyIE1vZHVsZT1tb2R1bGVBcmc7dmFyIHJlYWR5UHJvbWlzZVJlc29sdmUscmVhZHlQcm9taXNlUmVqZWN0O01vZHVsZVsicmVhZHkiXT1uZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57cmVhZHlQcm9taXNlUmVzb2x2ZT1yZXNvbHZlO3JlYWR5UHJvbWlzZVJlamVjdD1yZWplY3R9KTt2YXIgbW9kdWxlT3ZlcnJpZGVzPU9iamVjdC5hc3NpZ24oe30sTW9kdWxlKTt2YXIgYXJndW1lbnRzXz1bXTt2YXIgdGhpc1Byb2dyYW09Ii4vdGhpcy5wcm9ncmFtIjt2YXIgcXVpdF89KHN0YXR1cyx0b1Rocm93KT0+e3Rocm93IHRvVGhyb3d9O3ZhciBFTlZJUk9OTUVOVF9JU19XRUI9dHlwZW9mIHdpbmRvdz09Im9iamVjdCI7dmFyIEVOVklST05NRU5UX0lTX1dPUktFUj10eXBlb2YgaW1wb3J0U2NyaXB0cz09ImZ1bmN0aW9uIjt2YXIgRU5WSVJPTk1FTlRfSVNfTk9ERT10eXBlb2YgcHJvY2Vzcz09Im9iamVjdCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zPT0ib2JqZWN0IiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZT09InN0cmluZyI7dmFyIHNjcmlwdERpcmVjdG9yeT0iIjtmdW5jdGlvbiBsb2NhdGVGaWxlKHBhdGgpe2lmKE1vZHVsZVsibG9jYXRlRmlsZSJdKXtyZXR1cm4gTW9kdWxlWyJsb2NhdGVGaWxlIl0ocGF0aCxzY3JpcHREaXJlY3RvcnkpfXJldHVybiBzY3JpcHREaXJlY3RvcnkrcGF0aH12YXIgcmVhZF8scmVhZEFzeW5jLHJlYWRCaW5hcnk7aWYoRU5WSVJPTk1FTlRfSVNfV0VCfHxFTlZJUk9OTUVOVF9JU19XT1JLRVIpe2lmKEVOVklST05NRU5UX0lTX1dPUktFUil7c2NyaXB0RGlyZWN0b3J5PXNlbGYubG9jYXRpb24uaHJlZn1lbHNlIGlmKHR5cGVvZiBkb2N1bWVudCE9InVuZGVmaW5lZCImJmRvY3VtZW50LmN1cnJlbnRTY3JpcHQpe3NjcmlwdERpcmVjdG9yeT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY31pZihfc2NyaXB0RGlyKXtzY3JpcHREaXJlY3Rvcnk9X3NjcmlwdERpcn1pZihzY3JpcHREaXJlY3RvcnkuaW5kZXhPZigiYmxvYjoiKSE9PTApe3NjcmlwdERpcmVjdG9yeT1zY3JpcHREaXJlY3Rvcnkuc3Vic3RyKDAsc2NyaXB0RGlyZWN0b3J5LnJlcGxhY2UoL1s/I10uKi8sIiIpLmxhc3RJbmRleE9mKCIvIikrMSl9ZWxzZXtzY3JpcHREaXJlY3Rvcnk9IiJ9e3JlYWRfPXVybD0+e3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJHRVQiLHVybCxmYWxzZSk7eGhyLnNlbmQobnVsbCk7cmV0dXJuIHhoci5yZXNwb25zZVRleHR9O2lmKEVOVklST05NRU5UX0lTX1dPUktFUil7cmVhZEJpbmFyeT11cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlKX19cmVhZEFzeW5jPSh1cmwsb25sb2FkLG9uZXJyb3IpPT57dmFyIHhocj1uZXcgWE1MSHR0cFJlcXVlc3Q7eGhyLm9wZW4oIkdFVCIsdXJsLHRydWUpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIub25sb2FkPSgpPT57aWYoeGhyLnN0YXR1cz09MjAwfHx4aHIuc3RhdHVzPT0wJiZ4aHIucmVzcG9uc2Upe29ubG9hZCh4aHIucmVzcG9uc2UpO3JldHVybn1vbmVycm9yKCl9O3hoci5vbmVycm9yPW9uZXJyb3I7eGhyLnNlbmQobnVsbCl9fX1lbHNle312YXIgb3V0PU1vZHVsZVsicHJpbnQiXXx8Y29uc29sZS5sb2cuYmluZChjb25zb2xlKTt2YXIgZXJyPU1vZHVsZVsicHJpbnRFcnIiXXx8Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oTW9kdWxlLG1vZHVsZU92ZXJyaWRlcyk7bW9kdWxlT3ZlcnJpZGVzPW51bGw7aWYoTW9kdWxlWyJhcmd1bWVudHMiXSlhcmd1bWVudHNfPU1vZHVsZVsiYXJndW1lbnRzIl07aWYoTW9kdWxlWyJ0aGlzUHJvZ3JhbSJdKXRoaXNQcm9ncmFtPU1vZHVsZVsidGhpc1Byb2dyYW0iXTtpZihNb2R1bGVbInF1aXQiXSlxdWl0Xz1Nb2R1bGVbInF1aXQiXTt2YXIgd2FzbUJpbmFyeTtpZihNb2R1bGVbIndhc21CaW5hcnkiXSl3YXNtQmluYXJ5PU1vZHVsZVsid2FzbUJpbmFyeSJdO2lmKHR5cGVvZiBXZWJBc3NlbWJseSE9Im9iamVjdCIpe2Fib3J0KCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkIil9dmFyIHdhc21NZW1vcnk7dmFyIEFCT1JUPWZhbHNlO3ZhciBFWElUU1RBVFVTO2Z1bmN0aW9uIGFzc2VydChjb25kaXRpb24sdGV4dCl7aWYoIWNvbmRpdGlvbil7YWJvcnQodGV4dCl9fXZhciBIRUFQOCxIRUFQVTgsSEVBUDE2LEhFQVBVMTYsSEVBUDMyLEhFQVBVMzIsSEVBUEYzMixIRUFQRjY0O2Z1bmN0aW9uIHVwZGF0ZU1lbW9yeVZpZXdzKCl7dmFyIGI9d2FzbU1lbW9yeS5idWZmZXI7TW9kdWxlWyJIRUFQOCJdPUhFQVA4PW5ldyBJbnQ4QXJyYXkoYik7TW9kdWxlWyJIRUFQMTYiXT1IRUFQMTY9bmV3IEludDE2QXJyYXkoYik7TW9kdWxlWyJIRUFQVTgiXT1IRUFQVTg9bmV3IFVpbnQ4QXJyYXkoYik7TW9kdWxlWyJIRUFQVTE2Il09SEVBUFUxNj1uZXcgVWludDE2QXJyYXkoYik7TW9kdWxlWyJIRUFQMzIiXT1IRUFQMzI9bmV3IEludDMyQXJyYXkoYik7TW9kdWxlWyJIRUFQVTMyIl09SEVBUFUzMj1uZXcgVWludDMyQXJyYXkoYik7TW9kdWxlWyJIRUFQRjMyIl09SEVBUEYzMj1uZXcgRmxvYXQzMkFycmF5KGIpO01vZHVsZVsiSEVBUEY2NCJdPUhFQVBGNjQ9bmV3IEZsb2F0NjRBcnJheShiKX12YXIgX19BVFBSRVJVTl9fPVtdO3ZhciBfX0FUSU5JVF9fPVtdO3ZhciBfX0FURVhJVF9fPVtdO3ZhciBfX0FUUE9TVFJVTl9fPVtdO3ZhciBydW50aW1lSW5pdGlhbGl6ZWQ9ZmFsc2U7dmFyIHJ1bnRpbWVFeGl0ZWQ9ZmFsc2U7ZnVuY3Rpb24gcHJlUnVuKCl7aWYoTW9kdWxlWyJwcmVSdW4iXSl7aWYodHlwZW9mIE1vZHVsZVsicHJlUnVuIl09PSJmdW5jdGlvbiIpTW9kdWxlWyJwcmVSdW4iXT1bTW9kdWxlWyJwcmVSdW4iXV07d2hpbGUoTW9kdWxlWyJwcmVSdW4iXS5sZW5ndGgpe2FkZE9uUHJlUnVuKE1vZHVsZVsicHJlUnVuIl0uc2hpZnQoKSl9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQUkVSVU5fXyl9ZnVuY3Rpb24gaW5pdFJ1bnRpbWUoKXtydW50aW1lSW5pdGlhbGl6ZWQ9dHJ1ZTtpZighTW9kdWxlWyJub0ZTSW5pdCJdJiYhRlMuaW5pdC5pbml0aWFsaXplZClGUy5pbml0KCk7RlMuaWdub3JlUGVybWlzc2lvbnM9ZmFsc2U7VFRZLmluaXQoKTtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUSU5JVF9fKX1mdW5jdGlvbiBleGl0UnVudGltZSgpe19fX2Z1bmNzX29uX2V4aXQoKTtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FURVhJVF9fKTtGUy5xdWl0KCk7VFRZLnNodXRkb3duKCk7cnVudGltZUV4aXRlZD10cnVlfWZ1bmN0aW9uIHBvc3RSdW4oKXtpZihNb2R1bGVbInBvc3RSdW4iXSl7aWYodHlwZW9mIE1vZHVsZVsicG9zdFJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicG9zdFJ1biJdPVtNb2R1bGVbInBvc3RSdW4iXV07d2hpbGUoTW9kdWxlWyJwb3N0UnVuIl0ubGVuZ3RoKXthZGRPblBvc3RSdW4oTW9kdWxlWyJwb3N0UnVuIl0uc2hpZnQoKSl9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQT1NUUlVOX18pfWZ1bmN0aW9uIGFkZE9uUHJlUnVuKGNiKXtfX0FUUFJFUlVOX18udW5zaGlmdChjYil9ZnVuY3Rpb24gYWRkT25Jbml0KGNiKXtfX0FUSU5JVF9fLnVuc2hpZnQoY2IpfWZ1bmN0aW9uIGFkZE9uUG9zdFJ1bihjYil7X19BVFBPU1RSVU5fXy51bnNoaWZ0KGNiKX12YXIgcnVuRGVwZW5kZW5jaWVzPTA7dmFyIHJ1bkRlcGVuZGVuY3lXYXRjaGVyPW51bGw7dmFyIGRlcGVuZGVuY2llc0Z1bGZpbGxlZD1udWxsO2Z1bmN0aW9uIGdldFVuaXF1ZVJ1bkRlcGVuZGVuY3koaWQpe3JldHVybiBpZH1mdW5jdGlvbiBhZGRSdW5EZXBlbmRlbmN5KGlkKXtydW5EZXBlbmRlbmNpZXMrKztpZihNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXSl7TW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0ocnVuRGVwZW5kZW5jaWVzKX19ZnVuY3Rpb24gcmVtb3ZlUnVuRGVwZW5kZW5jeShpZCl7cnVuRGVwZW5kZW5jaWVzLS07aWYoTW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0pe01vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKHJ1bkRlcGVuZGVuY2llcyl9aWYocnVuRGVwZW5kZW5jaWVzPT0wKXtpZihydW5EZXBlbmRlbmN5V2F0Y2hlciE9PW51bGwpe2NsZWFySW50ZXJ2YWwocnVuRGVwZW5kZW5jeVdhdGNoZXIpO3J1bkRlcGVuZGVuY3lXYXRjaGVyPW51bGx9aWYoZGVwZW5kZW5jaWVzRnVsZmlsbGVkKXt2YXIgY2FsbGJhY2s9ZGVwZW5kZW5jaWVzRnVsZmlsbGVkO2RlcGVuZGVuY2llc0Z1bGZpbGxlZD1udWxsO2NhbGxiYWNrKCl9fX1mdW5jdGlvbiBhYm9ydCh3aGF0KXtpZihNb2R1bGVbIm9uQWJvcnQiXSl7TW9kdWxlWyJvbkFib3J0Il0od2hhdCl9d2hhdD0iQWJvcnRlZCgiK3doYXQrIikiO2Vycih3aGF0KTtBQk9SVD10cnVlO0VYSVRTVEFUVVM9MTt3aGF0Kz0iLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLiI7dmFyIGU9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcih3aGF0KTtyZWFkeVByb21pc2VSZWplY3QoZSk7dGhyb3cgZX12YXIgZGF0YVVSSVByZWZpeD0iZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LCI7dmFyIGlzRGF0YVVSST1maWxlbmFtZT0+ZmlsZW5hbWUuc3RhcnRzV2l0aChkYXRhVVJJUHJlZml4KTt2YXIgd2FzbUJpbmFyeUZpbGU7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3dhc21CaW5hcnlGaWxlPSJtYWluLWJpbi1tb25vLndhc20iO2lmKCFpc0RhdGFVUkkod2FzbUJpbmFyeUZpbGUpKXt3YXNtQmluYXJ5RmlsZT1sb2NhdGVGaWxlKHdhc21CaW5hcnlGaWxlKX19ZWxzZXt3YXNtQmluYXJ5RmlsZT1uZXcgVVJMKCJtYWluLWJpbi1tb25vLndhc20iLGxvY2F0aW9uLmhyZWYpLmhyZWZ9ZnVuY3Rpb24gZ2V0QmluYXJ5U3luYyhmaWxlKXtpZihmaWxlPT13YXNtQmluYXJ5RmlsZSYmd2FzbUJpbmFyeSl7cmV0dXJuIG5ldyBVaW50OEFycmF5KHdhc21CaW5hcnkpfWlmKHJlYWRCaW5hcnkpe3JldHVybiByZWFkQmluYXJ5KGZpbGUpfXRocm93ImJvdGggYXN5bmMgYW5kIHN5bmMgZmV0Y2hpbmcgb2YgdGhlIHdhc20gZmFpbGVkIn1mdW5jdGlvbiBnZXRCaW5hcnlQcm9taXNlKGJpbmFyeUZpbGUpe2lmKCF3YXNtQmluYXJ5JiYoRU5WSVJPTk1FTlRfSVNfV0VCfHxFTlZJUk9OTUVOVF9JU19XT1JLRVIpKXtpZih0eXBlb2YgZmV0Y2g9PSJmdW5jdGlvbiIpe3JldHVybiBmZXRjaChiaW5hcnlGaWxlLHtjcmVkZW50aWFsczoic2FtZS1vcmlnaW4ifSkudGhlbihyZXNwb25zZT0+e2lmKCFyZXNwb25zZVsib2siXSl7dGhyb3ciZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnIitiaW5hcnlGaWxlKyInIn1yZXR1cm4gcmVzcG9uc2VbImFycmF5QnVmZmVyIl0oKX0pLmNhdGNoKCgpPT5nZXRCaW5hcnlTeW5jKGJpbmFyeUZpbGUpKX19cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9PmdldEJpbmFyeVN5bmMoYmluYXJ5RmlsZSkpfWZ1bmN0aW9uIGluc3RhbnRpYXRlQXJyYXlCdWZmZXIoYmluYXJ5RmlsZSxpbXBvcnRzLHJlY2VpdmVyKXtyZXR1cm4gZ2V0QmluYXJ5UHJvbWlzZShiaW5hcnlGaWxlKS50aGVuKGJpbmFyeT0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoYmluYXJ5LGltcG9ydHMpKS50aGVuKGluc3RhbmNlPT5pbnN0YW5jZSkudGhlbihyZWNlaXZlcixyZWFzb249PntlcnIoYGZhaWxlZCB0byBhc3luY2hyb25vdXNseSBwcmVwYXJlIHdhc206ICR7cmVhc29ufWApO2Fib3J0KHJlYXNvbil9KX1mdW5jdGlvbiBpbnN0YW50aWF0ZUFzeW5jKGJpbmFyeSxiaW5hcnlGaWxlLGltcG9ydHMsY2FsbGJhY2spe2lmKCFiaW5hcnkmJnR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZz09ImZ1bmN0aW9uIiYmIWlzRGF0YVVSSShiaW5hcnlGaWxlKSYmdHlwZW9mIGZldGNoPT0iZnVuY3Rpb24iKXtyZXR1cm4gZmV0Y2goYmluYXJ5RmlsZSx7Y3JlZGVudGlhbHM6InNhbWUtb3JpZ2luIn0pLnRoZW4ocmVzcG9uc2U9Pnt2YXIgcmVzdWx0PVdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKHJlc3BvbnNlLGltcG9ydHMpO3JldHVybiByZXN1bHQudGhlbihjYWxsYmFjayxmdW5jdGlvbihyZWFzb24pe2Vycihgd2FzbSBzdHJlYW1pbmcgY29tcGlsZSBmYWlsZWQ6ICR7cmVhc29ufWApO2VycigiZmFsbGluZyBiYWNrIHRvIEFycmF5QnVmZmVyIGluc3RhbnRpYXRpb24iKTtyZXR1cm4gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihiaW5hcnlGaWxlLGltcG9ydHMsY2FsbGJhY2spfSl9KX1yZXR1cm4gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihiaW5hcnlGaWxlLGltcG9ydHMsY2FsbGJhY2spfWZ1bmN0aW9uIGNyZWF0ZVdhc20oKXt2YXIgaW5mbz17ImEiOndhc21JbXBvcnRzfTtmdW5jdGlvbiByZWNlaXZlSW5zdGFuY2UoaW5zdGFuY2UsbW9kdWxlKXt3YXNtRXhwb3J0cz1pbnN0YW5jZS5leHBvcnRzO3dhc21NZW1vcnk9d2FzbUV4cG9ydHNbInVhIl07dXBkYXRlTWVtb3J5Vmlld3MoKTt3YXNtVGFibGU9d2FzbUV4cG9ydHNbIndhIl07YWRkT25Jbml0KHdhc21FeHBvcnRzWyJ2YSJdKTtyZW1vdmVSdW5EZXBlbmRlbmN5KCJ3YXNtLWluc3RhbnRpYXRlIik7cmV0dXJuIHdhc21FeHBvcnRzfWFkZFJ1bkRlcGVuZGVuY3koIndhc20taW5zdGFudGlhdGUiKTtmdW5jdGlvbiByZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdChyZXN1bHQpe3JlY2VpdmVJbnN0YW5jZShyZXN1bHRbImluc3RhbmNlIl0pfWlmKE1vZHVsZVsiaW5zdGFudGlhdGVXYXNtIl0pe3RyeXtyZXR1cm4gTW9kdWxlWyJpbnN0YW50aWF0ZVdhc20iXShpbmZvLHJlY2VpdmVJbnN0YW5jZSl9Y2F0Y2goZSl7ZXJyKGBNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAke2V9YCk7cmVhZHlQcm9taXNlUmVqZWN0KGUpfX1pbnN0YW50aWF0ZUFzeW5jKHdhc21CaW5hcnksd2FzbUJpbmFyeUZpbGUsaW5mbyxyZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdCkuY2F0Y2gocmVhZHlQcm9taXNlUmVqZWN0KTtyZXR1cm57fX12YXIgdGVtcERvdWJsZTt2YXIgdGVtcEk2NDtmdW5jdGlvbiB4bm5Mb2FkV2FzbU1vZHVsZUpTKGNvZGUsb2Zmc2V0LG9mZnNldF9lbmQsaW52YWxpZF9mdW5jdGlvbl9pbmRleCl7Y29uc3QgdGFibGVPcmlnaW5hbFNpemU9d2FzbVRhYmxlLmxlbmd0aDtjb25zdCBiaW5hcnk9bmV3IFVpbnQ4QXJyYXkoSEVBUFU4LnNsaWNlKGNvZGUrb2Zmc2V0LGNvZGUrb2Zmc2V0X2VuZCkpO3RyeXt2YXIgbW9kdWxlPW5ldyBXZWJBc3NlbWJseS5Nb2R1bGUoYmluYXJ5KTt2YXIgaW5zdGFuY2U9bmV3IFdlYkFzc2VtYmx5Lkluc3RhbmNlKG1vZHVsZSx7ZW52OnttZW1vcnk6d2FzbU1lbW9yeX19KTtmb3IodmFyIHN5bU5hbWUgaW4gaW5zdGFuY2UuZXhwb3J0cyl7dmFyIHZhbHVlPWluc3RhbmNlLmV4cG9ydHNbc3ltTmFtZV07YWRkRnVuY3Rpb24odmFsdWUpfWlmKHRhYmxlT3JpZ2luYWxTaXplPHdhc21UYWJsZS5sZW5ndGgpe3JldHVybiB0YWJsZU9yaWdpbmFsU2l6ZX1yZXR1cm4gaW52YWxpZF9mdW5jdGlvbl9pbmRleH1jYXRjaChlcnJvcil7Y29uc29sZS5sb2coZXJyb3IpO3JldHVybiBpbnZhbGlkX2Z1bmN0aW9uX2luZGV4fX1mdW5jdGlvbiBFeGl0U3RhdHVzKHN0YXR1cyl7dGhpcy5uYW1lPSJFeGl0U3RhdHVzIjt0aGlzLm1lc3NhZ2U9YFByb2dyYW0gdGVybWluYXRlZCB3aXRoIGV4aXQoJHtzdGF0dXN9KWA7dGhpcy5zdGF0dXM9c3RhdHVzfXZhciBjYWxsUnVudGltZUNhbGxiYWNrcz1jYWxsYmFja3M9Pnt3aGlsZShjYWxsYmFja3MubGVuZ3RoPjApe2NhbGxiYWNrcy5zaGlmdCgpKE1vZHVsZSl9fTt2YXIgbm9FeGl0UnVudGltZT1Nb2R1bGVbIm5vRXhpdFJ1bnRpbWUiXXx8ZmFsc2U7dmFyIFVURjhEZWNvZGVyPXR5cGVvZiBUZXh0RGVjb2RlciE9InVuZGVmaW5lZCI/bmV3IFRleHREZWNvZGVyKCJ1dGY4Iik6dW5kZWZpbmVkO3ZhciBVVEY4QXJyYXlUb1N0cmluZz0oaGVhcE9yQXJyYXksaWR4LG1heEJ5dGVzVG9SZWFkKT0+e3ZhciBlbmRJZHg9aWR4K21heEJ5dGVzVG9SZWFkO3ZhciBlbmRQdHI9aWR4O3doaWxlKGhlYXBPckFycmF5W2VuZFB0cl0mJiEoZW5kUHRyPj1lbmRJZHgpKSsrZW5kUHRyO2lmKGVuZFB0ci1pZHg+MTYmJmhlYXBPckFycmF5LmJ1ZmZlciYmVVRGOERlY29kZXIpe3JldHVybiBVVEY4RGVjb2Rlci5kZWNvZGUoaGVhcE9yQXJyYXkuc3ViYXJyYXkoaWR4LGVuZFB0cikpfXZhciBzdHI9IiI7d2hpbGUoaWR4PGVuZFB0cil7dmFyIHUwPWhlYXBPckFycmF5W2lkeCsrXTtpZighKHUwJjEyOCkpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1MCk7Y29udGludWV9dmFyIHUxPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjI0KT09MTkyKXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoKHUwJjMxKTw8Nnx1MSk7Y29udGludWV9dmFyIHUyPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjQwKT09MjI0KXt1MD0odTAmMTUpPDwxMnx1MTw8Nnx1Mn1lbHNle3UwPSh1MCY3KTw8MTh8dTE8PDEyfHUyPDw2fGhlYXBPckFycmF5W2lkeCsrXSY2M31pZih1MDw2NTUzNil7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHUwKX1lbHNle3ZhciBjaD11MC02NTUzNjtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8Y2g+PjEwLDU2MzIwfGNoJjEwMjMpfX1yZXR1cm4gc3RyfTt2YXIgVVRGOFRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT5wdHI/VVRGOEFycmF5VG9TdHJpbmcoSEVBUFU4LHB0cixtYXhCeXRlc1RvUmVhZCk6IiI7dmFyIF9fX2Fzc2VydF9mYWlsPShjb25kaXRpb24sZmlsZW5hbWUsbGluZSxmdW5jKT0+e2Fib3J0KGBBc3NlcnRpb24gZmFpbGVkOiAke1VURjhUb1N0cmluZyhjb25kaXRpb24pfSwgYXQ6IGArW2ZpbGVuYW1lP1VURjhUb1N0cmluZyhmaWxlbmFtZSk6InVua25vd24gZmlsZW5hbWUiLGxpbmUsZnVuYz9VVEY4VG9TdHJpbmcoZnVuYyk6InVua25vd24gZnVuY3Rpb24iXSl9O3ZhciBleGNlcHRpb25DYXVnaHQ9W107dmFyIHVuY2F1Z2h0RXhjZXB0aW9uQ291bnQ9MDt2YXIgX19fY3hhX2JlZ2luX2NhdGNoPXB0cj0+e3ZhciBpbmZvPW5ldyBFeGNlcHRpb25JbmZvKHB0cik7aWYoIWluZm8uZ2V0X2NhdWdodCgpKXtpbmZvLnNldF9jYXVnaHQodHJ1ZSk7dW5jYXVnaHRFeGNlcHRpb25Db3VudC0tfWluZm8uc2V0X3JldGhyb3duKGZhbHNlKTtleGNlcHRpb25DYXVnaHQucHVzaChpbmZvKTtfX19jeGFfaW5jcmVtZW50X2V4Y2VwdGlvbl9yZWZjb3VudChpbmZvLmV4Y1B0cik7cmV0dXJuIGluZm8uZ2V0X2V4Y2VwdGlvbl9wdHIoKX07dmFyIGV4Y2VwdGlvbkxhc3Q9MDt2YXIgX19fY3hhX2VuZF9jYXRjaD0oKT0+e19zZXRUaHJldygwLDApO3ZhciBpbmZvPWV4Y2VwdGlvbkNhdWdodC5wb3AoKTtfX19jeGFfZGVjcmVtZW50X2V4Y2VwdGlvbl9yZWZjb3VudChpbmZvLmV4Y1B0cik7ZXhjZXB0aW9uTGFzdD0wfTtmdW5jdGlvbiBFeGNlcHRpb25JbmZvKGV4Y1B0cil7dGhpcy5leGNQdHI9ZXhjUHRyO3RoaXMucHRyPWV4Y1B0ci0yNDt0aGlzLnNldF90eXBlPWZ1bmN0aW9uKHR5cGUpe0hFQVBVMzJbdGhpcy5wdHIrND4+Ml09dHlwZX07dGhpcy5nZXRfdHlwZT1mdW5jdGlvbigpe3JldHVybiBIRUFQVTMyW3RoaXMucHRyKzQ+PjJdfTt0aGlzLnNldF9kZXN0cnVjdG9yPWZ1bmN0aW9uKGRlc3RydWN0b3Ipe0hFQVBVMzJbdGhpcy5wdHIrOD4+Ml09ZGVzdHJ1Y3Rvcn07dGhpcy5nZXRfZGVzdHJ1Y3Rvcj1mdW5jdGlvbigpe3JldHVybiBIRUFQVTMyW3RoaXMucHRyKzg+PjJdfTt0aGlzLnNldF9jYXVnaHQ9ZnVuY3Rpb24oY2F1Z2h0KXtjYXVnaHQ9Y2F1Z2h0PzE6MDtIRUFQOFt0aGlzLnB0cisxMj4+MF09Y2F1Z2h0fTt0aGlzLmdldF9jYXVnaHQ9ZnVuY3Rpb24oKXtyZXR1cm4gSEVBUDhbdGhpcy5wdHIrMTI+PjBdIT0wfTt0aGlzLnNldF9yZXRocm93bj1mdW5jdGlvbihyZXRocm93bil7cmV0aHJvd249cmV0aHJvd24/MTowO0hFQVA4W3RoaXMucHRyKzEzPj4wXT1yZXRocm93bn07dGhpcy5nZXRfcmV0aHJvd249ZnVuY3Rpb24oKXtyZXR1cm4gSEVBUDhbdGhpcy5wdHIrMTM+PjBdIT0wfTt0aGlzLmluaXQ9ZnVuY3Rpb24odHlwZSxkZXN0cnVjdG9yKXt0aGlzLnNldF9hZGp1c3RlZF9wdHIoMCk7dGhpcy5zZXRfdHlwZSh0eXBlKTt0aGlzLnNldF9kZXN0cnVjdG9yKGRlc3RydWN0b3IpfTt0aGlzLnNldF9hZGp1c3RlZF9wdHI9ZnVuY3Rpb24oYWRqdXN0ZWRQdHIpe0hFQVBVMzJbdGhpcy5wdHIrMTY+PjJdPWFkanVzdGVkUHRyfTt0aGlzLmdldF9hZGp1c3RlZF9wdHI9ZnVuY3Rpb24oKXtyZXR1cm4gSEVBUFUzMlt0aGlzLnB0cisxNj4+Ml19O3RoaXMuZ2V0X2V4Y2VwdGlvbl9wdHI9ZnVuY3Rpb24oKXt2YXIgaXNQb2ludGVyPV9fX2N4YV9pc19wb2ludGVyX3R5cGUodGhpcy5nZXRfdHlwZSgpKTtpZihpc1BvaW50ZXIpe3JldHVybiBIRUFQVTMyW3RoaXMuZXhjUHRyPj4yXX12YXIgYWRqdXN0ZWQ9dGhpcy5nZXRfYWRqdXN0ZWRfcHRyKCk7aWYoYWRqdXN0ZWQhPT0wKXJldHVybiBhZGp1c3RlZDtyZXR1cm4gdGhpcy5leGNQdHJ9fXZhciBfX19yZXN1bWVFeGNlcHRpb249cHRyPT57aWYoIWV4Y2VwdGlvbkxhc3Qpe2V4Y2VwdGlvbkxhc3Q9cHRyfXRocm93IGV4Y2VwdGlvbkxhc3R9O3ZhciBmaW5kTWF0Y2hpbmdDYXRjaD1hcmdzPT57dmFyIHRocm93bj1leGNlcHRpb25MYXN0O2lmKCF0aHJvd24pe3NldFRlbXBSZXQwKDApO3JldHVybiAwfXZhciBpbmZvPW5ldyBFeGNlcHRpb25JbmZvKHRocm93bik7aW5mby5zZXRfYWRqdXN0ZWRfcHRyKHRocm93bik7dmFyIHRocm93blR5cGU9aW5mby5nZXRfdHlwZSgpO2lmKCF0aHJvd25UeXBlKXtzZXRUZW1wUmV0MCgwKTtyZXR1cm4gdGhyb3dufWZvcih2YXIgYXJnIGluIGFyZ3Mpe3ZhciBjYXVnaHRUeXBlPWFyZ3NbYXJnXTtpZihjYXVnaHRUeXBlPT09MHx8Y2F1Z2h0VHlwZT09PXRocm93blR5cGUpe2JyZWFrfXZhciBhZGp1c3RlZF9wdHJfYWRkcj1pbmZvLnB0cisxNjtpZihfX19jeGFfY2FuX2NhdGNoKGNhdWdodFR5cGUsdGhyb3duVHlwZSxhZGp1c3RlZF9wdHJfYWRkcikpe3NldFRlbXBSZXQwKGNhdWdodFR5cGUpO3JldHVybiB0aHJvd259fXNldFRlbXBSZXQwKHRocm93blR5cGUpO3JldHVybiB0aHJvd259O3ZhciBfX19jeGFfZmluZF9tYXRjaGluZ19jYXRjaF8yPSgpPT5maW5kTWF0Y2hpbmdDYXRjaChbXSk7dmFyIF9fX2N4YV9maW5kX21hdGNoaW5nX2NhdGNoXzM9YXJnMD0+ZmluZE1hdGNoaW5nQ2F0Y2goW2FyZzBdKTt2YXIgX19fY3hhX3JldGhyb3c9KCk9Pnt2YXIgaW5mbz1leGNlcHRpb25DYXVnaHQucG9wKCk7aWYoIWluZm8pe2Fib3J0KCJubyBleGNlcHRpb24gdG8gdGhyb3ciKX12YXIgcHRyPWluZm8uZXhjUHRyO2lmKCFpbmZvLmdldF9yZXRocm93bigpKXtleGNlcHRpb25DYXVnaHQucHVzaChpbmZvKTtpbmZvLnNldF9yZXRocm93bih0cnVlKTtpbmZvLnNldF9jYXVnaHQoZmFsc2UpO3VuY2F1Z2h0RXhjZXB0aW9uQ291bnQrK31leGNlcHRpb25MYXN0PXB0cjt0aHJvdyBleGNlcHRpb25MYXN0fTt2YXIgX19fY3hhX3Rocm93PShwdHIsdHlwZSxkZXN0cnVjdG9yKT0+e3ZhciBpbmZvPW5ldyBFeGNlcHRpb25JbmZvKHB0cik7aW5mby5pbml0KHR5cGUsZGVzdHJ1Y3Rvcik7ZXhjZXB0aW9uTGFzdD1wdHI7dW5jYXVnaHRFeGNlcHRpb25Db3VudCsrO3Rocm93IGV4Y2VwdGlvbkxhc3R9O3ZhciBQQVRIPXtpc0FiczpwYXRoPT5wYXRoLmNoYXJBdCgwKT09PSIvIixzcGxpdFBhdGg6ZmlsZW5hbWU9Pnt2YXIgc3BsaXRQYXRoUmU9L14oXC8/fCkoW1xzXFNdKj8pKCg/OlwuezEsMn18W15cL10rP3wpKFwuW14uXC9dKnwpKSg/OltcL10qKSQvO3JldHVybiBzcGxpdFBhdGhSZS5leGVjKGZpbGVuYW1lKS5zbGljZSgxKX0sbm9ybWFsaXplQXJyYXk6KHBhcnRzLGFsbG93QWJvdmVSb290KT0+e3ZhciB1cD0wO2Zvcih2YXIgaT1wYXJ0cy5sZW5ndGgtMTtpPj0wO2ktLSl7dmFyIGxhc3Q9cGFydHNbaV07aWYobGFzdD09PSIuIil7cGFydHMuc3BsaWNlKGksMSl9ZWxzZSBpZihsYXN0PT09Ii4uIil7cGFydHMuc3BsaWNlKGksMSk7dXArK31lbHNlIGlmKHVwKXtwYXJ0cy5zcGxpY2UoaSwxKTt1cC0tfX1pZihhbGxvd0Fib3ZlUm9vdCl7Zm9yKDt1cDt1cC0tKXtwYXJ0cy51bnNoaWZ0KCIuLiIpfX1yZXR1cm4gcGFydHN9LG5vcm1hbGl6ZTpwYXRoPT57dmFyIGlzQWJzb2x1dGU9UEFUSC5pc0FicyhwYXRoKSx0cmFpbGluZ1NsYXNoPXBhdGguc3Vic3RyKC0xKT09PSIvIjtwYXRoPVBBVEgubm9ybWFsaXplQXJyYXkocGF0aC5zcGxpdCgiLyIpLmZpbHRlcihwPT4hIXApLCFpc0Fic29sdXRlKS5qb2luKCIvIik7aWYoIXBhdGgmJiFpc0Fic29sdXRlKXtwYXRoPSIuIn1pZihwYXRoJiZ0cmFpbGluZ1NsYXNoKXtwYXRoKz0iLyJ9cmV0dXJuKGlzQWJzb2x1dGU/Ii8iOiIiKStwYXRofSxkaXJuYW1lOnBhdGg9Pnt2YXIgcmVzdWx0PVBBVEguc3BsaXRQYXRoKHBhdGgpLHJvb3Q9cmVzdWx0WzBdLGRpcj1yZXN1bHRbMV07aWYoIXJvb3QmJiFkaXIpe3JldHVybiIuIn1pZihkaXIpe2Rpcj1kaXIuc3Vic3RyKDAsZGlyLmxlbmd0aC0xKX1yZXR1cm4gcm9vdCtkaXJ9LGJhc2VuYW1lOnBhdGg9PntpZihwYXRoPT09Ii8iKXJldHVybiIvIjtwYXRoPVBBVEgubm9ybWFsaXplKHBhdGgpO3BhdGg9cGF0aC5yZXBsYWNlKC9cLyQvLCIiKTt2YXIgbGFzdFNsYXNoPXBhdGgubGFzdEluZGV4T2YoIi8iKTtpZihsYXN0U2xhc2g9PT0tMSlyZXR1cm4gcGF0aDtyZXR1cm4gcGF0aC5zdWJzdHIobGFzdFNsYXNoKzEpfSxqb2luOmZ1bmN0aW9uKCl7dmFyIHBhdGhzPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIFBBVEgubm9ybWFsaXplKHBhdGhzLmpvaW4oIi8iKSl9LGpvaW4yOihsLHIpPT5QQVRILm5vcm1hbGl6ZShsKyIvIityKX07dmFyIGluaXRSYW5kb21GaWxsPSgpPT57aWYodHlwZW9mIGNyeXB0bz09Im9iamVjdCImJnR5cGVvZiBjcnlwdG9bImdldFJhbmRvbVZhbHVlcyJdPT0iZnVuY3Rpb24iKXtyZXR1cm4gdmlldz0+Y3J5cHRvLmdldFJhbmRvbVZhbHVlcyh2aWV3KX1lbHNlIGFib3J0KCJpbml0UmFuZG9tRGV2aWNlIil9O3ZhciByYW5kb21GaWxsPXZpZXc9PihyYW5kb21GaWxsPWluaXRSYW5kb21GaWxsKCkpKHZpZXcpO3ZhciBQQVRIX0ZTPXtyZXNvbHZlOmZ1bmN0aW9uKCl7dmFyIHJlc29sdmVkUGF0aD0iIixyZXNvbHZlZEFic29sdXRlPWZhbHNlO2Zvcih2YXIgaT1hcmd1bWVudHMubGVuZ3RoLTE7aT49LTEmJiFyZXNvbHZlZEFic29sdXRlO2ktLSl7dmFyIHBhdGg9aT49MD9hcmd1bWVudHNbaV06RlMuY3dkKCk7aWYodHlwZW9mIHBhdGghPSJzdHJpbmciKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncyIpfWVsc2UgaWYoIXBhdGgpe3JldHVybiIifXJlc29sdmVkUGF0aD1wYXRoKyIvIityZXNvbHZlZFBhdGg7cmVzb2x2ZWRBYnNvbHV0ZT1QQVRILmlzQWJzKHBhdGgpfXJlc29sdmVkUGF0aD1QQVRILm5vcm1hbGl6ZUFycmF5KHJlc29sdmVkUGF0aC5zcGxpdCgiLyIpLmZpbHRlcihwPT4hIXApLCFyZXNvbHZlZEFic29sdXRlKS5qb2luKCIvIik7cmV0dXJuKHJlc29sdmVkQWJzb2x1dGU/Ii8iOiIiKStyZXNvbHZlZFBhdGh8fCIuIn0scmVsYXRpdmU6KGZyb20sdG8pPT57ZnJvbT1QQVRIX0ZTLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO3RvPVBBVEhfRlMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO2Z1bmN0aW9uIHRyaW0oYXJyKXt2YXIgc3RhcnQ9MDtmb3IoO3N0YXJ0PGFyci5sZW5ndGg7c3RhcnQrKyl7aWYoYXJyW3N0YXJ0XSE9PSIiKWJyZWFrfXZhciBlbmQ9YXJyLmxlbmd0aC0xO2Zvcig7ZW5kPj0wO2VuZC0tKXtpZihhcnJbZW5kXSE9PSIiKWJyZWFrfWlmKHN0YXJ0PmVuZClyZXR1cm5bXTtyZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LGVuZC1zdGFydCsxKX12YXIgZnJvbVBhcnRzPXRyaW0oZnJvbS5zcGxpdCgiLyIpKTt2YXIgdG9QYXJ0cz10cmltKHRvLnNwbGl0KCIvIikpO3ZhciBsZW5ndGg9TWF0aC5taW4oZnJvbVBhcnRzLmxlbmd0aCx0b1BhcnRzLmxlbmd0aCk7dmFyIHNhbWVQYXJ0c0xlbmd0aD1sZW5ndGg7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXtpZihmcm9tUGFydHNbaV0hPT10b1BhcnRzW2ldKXtzYW1lUGFydHNMZW5ndGg9aTticmVha319dmFyIG91dHB1dFBhcnRzPVtdO2Zvcih2YXIgaT1zYW1lUGFydHNMZW5ndGg7aTxmcm9tUGFydHMubGVuZ3RoO2krKyl7b3V0cHV0UGFydHMucHVzaCgiLi4iKX1vdXRwdXRQYXJ0cz1vdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtyZXR1cm4gb3V0cHV0UGFydHMuam9pbigiLyIpfX07dmFyIEZTX3N0ZGluX2dldENoYXJfYnVmZmVyPVtdO3ZhciBsZW5ndGhCeXRlc1VURjg9c3RyPT57dmFyIGxlbj0wO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjPXN0ci5jaGFyQ29kZUF0KGkpO2lmKGM8PTEyNyl7bGVuKyt9ZWxzZSBpZihjPD0yMDQ3KXtsZW4rPTJ9ZWxzZSBpZihjPj01NTI5NiYmYzw9NTczNDMpe2xlbis9NDsrK2l9ZWxzZXtsZW4rPTN9fXJldHVybiBsZW59O3ZhciBzdHJpbmdUb1VURjhBcnJheT0oc3RyLGhlYXAsb3V0SWR4LG1heEJ5dGVzVG9Xcml0ZSk9PntpZighKG1heEJ5dGVzVG9Xcml0ZT4wKSlyZXR1cm4gMDt2YXIgc3RhcnRJZHg9b3V0SWR4O3ZhciBlbmRJZHg9b3V0SWR4K21heEJ5dGVzVG9Xcml0ZS0xO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciB1PXN0ci5jaGFyQ29kZUF0KGkpO2lmKHU+PTU1Mjk2JiZ1PD01NzM0Myl7dmFyIHUxPXN0ci5jaGFyQ29kZUF0KCsraSk7dT02NTUzNisoKHUmMTAyMyk8PDEwKXx1MSYxMDIzfWlmKHU8PTEyNyl7aWYob3V0SWR4Pj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109dX1lbHNlIGlmKHU8PTIwNDcpe2lmKG91dElkeCsxPj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109MTkyfHU+PjY7aGVhcFtvdXRJZHgrK109MTI4fHUmNjN9ZWxzZSBpZih1PD02NTUzNSl7aWYob3V0SWR4KzI+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0yMjR8dT4+MTI7aGVhcFtvdXRJZHgrK109MTI4fHU+PjYmNjM7aGVhcFtvdXRJZHgrK109MTI4fHUmNjN9ZWxzZXtpZihvdXRJZHgrMz49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTI0MHx1Pj4xODtoZWFwW291dElkeCsrXT0xMjh8dT4+MTImNjM7aGVhcFtvdXRJZHgrK109MTI4fHU+PjYmNjM7aGVhcFtvdXRJZHgrK109MTI4fHUmNjN9fWhlYXBbb3V0SWR4XT0wO3JldHVybiBvdXRJZHgtc3RhcnRJZHh9O2Z1bmN0aW9uIGludEFycmF5RnJvbVN0cmluZyhzdHJpbmd5LGRvbnRBZGROdWxsLGxlbmd0aCl7dmFyIGxlbj1sZW5ndGg+MD9sZW5ndGg6bGVuZ3RoQnl0ZXNVVEY4KHN0cmluZ3kpKzE7dmFyIHU4YXJyYXk9bmV3IEFycmF5KGxlbik7dmFyIG51bUJ5dGVzV3JpdHRlbj1zdHJpbmdUb1VURjhBcnJheShzdHJpbmd5LHU4YXJyYXksMCx1OGFycmF5Lmxlbmd0aCk7aWYoZG9udEFkZE51bGwpdThhcnJheS5sZW5ndGg9bnVtQnl0ZXNXcml0dGVuO3JldHVybiB1OGFycmF5fXZhciBGU19zdGRpbl9nZXRDaGFyPSgpPT57aWYoIUZTX3N0ZGluX2dldENoYXJfYnVmZmVyLmxlbmd0aCl7dmFyIHJlc3VsdD1udWxsO2lmKHR5cGVvZiB3aW5kb3chPSJ1bmRlZmluZWQiJiZ0eXBlb2Ygd2luZG93LnByb21wdD09ImZ1bmN0aW9uIil7cmVzdWx0PXdpbmRvdy5wcm9tcHQoIklucHV0OiAiKTtpZihyZXN1bHQhPT1udWxsKXtyZXN1bHQrPSJcbiJ9fWVsc2UgaWYodHlwZW9mIHJlYWRsaW5lPT0iZnVuY3Rpb24iKXtyZXN1bHQ9cmVhZGxpbmUoKTtpZihyZXN1bHQhPT1udWxsKXtyZXN1bHQrPSJcbiJ9fWlmKCFyZXN1bHQpe3JldHVybiBudWxsfUZTX3N0ZGluX2dldENoYXJfYnVmZmVyPWludEFycmF5RnJvbVN0cmluZyhyZXN1bHQsdHJ1ZSl9cmV0dXJuIEZTX3N0ZGluX2dldENoYXJfYnVmZmVyLnNoaWZ0KCl9O3ZhciBUVFk9e3R0eXM6W10saW5pdCgpe30sc2h1dGRvd24oKXt9LHJlZ2lzdGVyKGRldixvcHMpe1RUWS50dHlzW2Rldl09e2lucHV0OltdLG91dHB1dDpbXSxvcHM6b3BzfTtGUy5yZWdpc3RlckRldmljZShkZXYsVFRZLnN0cmVhbV9vcHMpfSxzdHJlYW1fb3BzOntvcGVuKHN0cmVhbSl7dmFyIHR0eT1UVFkudHR5c1tzdHJlYW0ubm9kZS5yZGV2XTtpZighdHR5KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9c3RyZWFtLnR0eT10dHk7c3RyZWFtLnNlZWthYmxlPWZhbHNlfSxjbG9zZShzdHJlYW0pe3N0cmVhbS50dHkub3BzLmZzeW5jKHN0cmVhbS50dHkpfSxmc3luYyhzdHJlYW0pe3N0cmVhbS50dHkub3BzLmZzeW5jKHN0cmVhbS50dHkpfSxyZWFkKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3Mpe2lmKCFzdHJlYW0udHR5fHwhc3RyZWFtLnR0eS5vcHMuZ2V0X2NoYXIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYwKX12YXIgYnl0ZXNSZWFkPTA7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXt2YXIgcmVzdWx0O3RyeXtyZXN1bHQ9c3RyZWFtLnR0eS5vcHMuZ2V0X2NoYXIoc3RyZWFtLnR0eSl9Y2F0Y2goZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjkpfWlmKHJlc3VsdD09PXVuZGVmaW5lZCYmYnl0ZXNSZWFkPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNil9aWYocmVzdWx0PT09bnVsbHx8cmVzdWx0PT09dW5kZWZpbmVkKWJyZWFrO2J5dGVzUmVhZCsrO2J1ZmZlcltvZmZzZXQraV09cmVzdWx0fWlmKGJ5dGVzUmVhZCl7c3RyZWFtLm5vZGUudGltZXN0YW1wPURhdGUubm93KCl9cmV0dXJuIGJ5dGVzUmVhZH0sd3JpdGUoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvcyl7aWYoIXN0cmVhbS50dHl8fCFzdHJlYW0udHR5Lm9wcy5wdXRfY2hhcil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjApfXRyeXtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe3N0cmVhbS50dHkub3BzLnB1dF9jaGFyKHN0cmVhbS50dHksYnVmZmVyW29mZnNldCtpXSl9fWNhdGNoKGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI5KX1pZihsZW5ndGgpe3N0cmVhbS5ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpfXJldHVybiBpfX0sZGVmYXVsdF90dHlfb3BzOntnZXRfY2hhcih0dHkpe3JldHVybiBGU19zdGRpbl9nZXRDaGFyKCl9LHB1dF9jaGFyKHR0eSx2YWwpe2lmKHZhbD09PW51bGx8fHZhbD09PTEwKXtvdXQoVVRGOEFycmF5VG9TdHJpbmcodHR5Lm91dHB1dCwwKSk7dHR5Lm91dHB1dD1bXX1lbHNle2lmKHZhbCE9MCl0dHkub3V0cHV0LnB1c2godmFsKX19LGZzeW5jKHR0eSl7aWYodHR5Lm91dHB1dCYmdHR5Lm91dHB1dC5sZW5ndGg+MCl7b3V0KFVURjhBcnJheVRvU3RyaW5nKHR0eS5vdXRwdXQsMCkpO3R0eS5vdXRwdXQ9W119fSxpb2N0bF90Y2dldHModHR5KXtyZXR1cm57Y19pZmxhZzoyNTg1NixjX29mbGFnOjUsY19jZmxhZzoxOTEsY19sZmxhZzozNTM4NyxjX2NjOlszLDI4LDEyNywyMSw0LDAsMSwwLDE3LDE5LDI2LDAsMTgsMTUsMjMsMjIsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMF19fSxpb2N0bF90Y3NldHModHR5LG9wdGlvbmFsX2FjdGlvbnMsZGF0YSl7cmV0dXJuIDB9LGlvY3RsX3Rpb2Nnd2luc3oodHR5KXtyZXR1cm5bMjQsODBdfX0sZGVmYXVsdF90dHkxX29wczp7cHV0X2NoYXIodHR5LHZhbCl7aWYodmFsPT09bnVsbHx8dmFsPT09MTApe2VycihVVEY4QXJyYXlUb1N0cmluZyh0dHkub3V0cHV0LDApKTt0dHkub3V0cHV0PVtdfWVsc2V7aWYodmFsIT0wKXR0eS5vdXRwdXQucHVzaCh2YWwpfX0sZnN5bmModHR5KXtpZih0dHkub3V0cHV0JiZ0dHkub3V0cHV0Lmxlbmd0aD4wKXtlcnIoVVRGOEFycmF5VG9TdHJpbmcodHR5Lm91dHB1dCwwKSk7dHR5Lm91dHB1dD1bXX19fX07dmFyIHplcm9NZW1vcnk9KGFkZHJlc3Msc2l6ZSk9PntIRUFQVTguZmlsbCgwLGFkZHJlc3MsYWRkcmVzcytzaXplKTtyZXR1cm4gYWRkcmVzc307dmFyIGFsaWduTWVtb3J5PShzaXplLGFsaWdubWVudCk9Pk1hdGguY2VpbChzaXplL2FsaWdubWVudCkqYWxpZ25tZW50O3ZhciBtbWFwQWxsb2M9c2l6ZT0+e3NpemU9YWxpZ25NZW1vcnkoc2l6ZSw2NTUzNik7dmFyIHB0cj1fZW1zY3JpcHRlbl9idWlsdGluX21lbWFsaWduKDY1NTM2LHNpemUpO2lmKCFwdHIpcmV0dXJuIDA7cmV0dXJuIHplcm9NZW1vcnkocHRyLHNpemUpfTt2YXIgTUVNRlM9e29wc190YWJsZTpudWxsLG1vdW50KG1vdW50KXtyZXR1cm4gTUVNRlMuY3JlYXRlTm9kZShudWxsLCIvIiwxNjM4NHw1MTEsMCl9LGNyZWF0ZU5vZGUocGFyZW50LG5hbWUsbW9kZSxkZXYpe2lmKEZTLmlzQmxrZGV2KG1vZGUpfHxGUy5pc0ZJRk8obW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYzKX1pZighTUVNRlMub3BzX3RhYmxlKXtNRU1GUy5vcHNfdGFibGU9e2Rpcjp7bm9kZTp7Z2V0YXR0cjpNRU1GUy5ub2RlX29wcy5nZXRhdHRyLHNldGF0dHI6TUVNRlMubm9kZV9vcHMuc2V0YXR0cixsb29rdXA6TUVNRlMubm9kZV9vcHMubG9va3VwLG1rbm9kOk1FTUZTLm5vZGVfb3BzLm1rbm9kLHJlbmFtZTpNRU1GUy5ub2RlX29wcy5yZW5hbWUsdW5saW5rOk1FTUZTLm5vZGVfb3BzLnVubGluayxybWRpcjpNRU1GUy5ub2RlX29wcy5ybWRpcixyZWFkZGlyOk1FTUZTLm5vZGVfb3BzLnJlYWRkaXIsc3ltbGluazpNRU1GUy5ub2RlX29wcy5zeW1saW5rfSxzdHJlYW06e2xsc2VlazpNRU1GUy5zdHJlYW1fb3BzLmxsc2Vla319LGZpbGU6e25vZGU6e2dldGF0dHI6TUVNRlMubm9kZV9vcHMuZ2V0YXR0cixzZXRhdHRyOk1FTUZTLm5vZGVfb3BzLnNldGF0dHJ9LHN0cmVhbTp7bGxzZWVrOk1FTUZTLnN0cmVhbV9vcHMubGxzZWVrLHJlYWQ6TUVNRlMuc3RyZWFtX29wcy5yZWFkLHdyaXRlOk1FTUZTLnN0cmVhbV9vcHMud3JpdGUsYWxsb2NhdGU6TUVNRlMuc3RyZWFtX29wcy5hbGxvY2F0ZSxtbWFwOk1FTUZTLnN0cmVhbV9vcHMubW1hcCxtc3luYzpNRU1GUy5zdHJlYW1fb3BzLm1zeW5jfX0sbGluazp7bm9kZTp7Z2V0YXR0cjpNRU1GUy5ub2RlX29wcy5nZXRhdHRyLHNldGF0dHI6TUVNRlMubm9kZV9vcHMuc2V0YXR0cixyZWFkbGluazpNRU1GUy5ub2RlX29wcy5yZWFkbGlua30sc3RyZWFtOnt9fSxjaHJkZXY6e25vZGU6e2dldGF0dHI6TUVNRlMubm9kZV9vcHMuZ2V0YXR0cixzZXRhdHRyOk1FTUZTLm5vZGVfb3BzLnNldGF0dHJ9LHN0cmVhbTpGUy5jaHJkZXZfc3RyZWFtX29wc319fXZhciBub2RlPUZTLmNyZWF0ZU5vZGUocGFyZW50LG5hbWUsbW9kZSxkZXYpO2lmKEZTLmlzRGlyKG5vZGUubW9kZSkpe25vZGUubm9kZV9vcHM9TUVNRlMub3BzX3RhYmxlLmRpci5ub2RlO25vZGUuc3RyZWFtX29wcz1NRU1GUy5vcHNfdGFibGUuZGlyLnN0cmVhbTtub2RlLmNvbnRlbnRzPXt9fWVsc2UgaWYoRlMuaXNGaWxlKG5vZGUubW9kZSkpe25vZGUubm9kZV9vcHM9TUVNRlMub3BzX3RhYmxlLmZpbGUubm9kZTtub2RlLnN0cmVhbV9vcHM9TUVNRlMub3BzX3RhYmxlLmZpbGUuc3RyZWFtO25vZGUudXNlZEJ5dGVzPTA7bm9kZS5jb250ZW50cz1udWxsfWVsc2UgaWYoRlMuaXNMaW5rKG5vZGUubW9kZSkpe25vZGUubm9kZV9vcHM9TUVNRlMub3BzX3RhYmxlLmxpbmsubm9kZTtub2RlLnN0cmVhbV9vcHM9TUVNRlMub3BzX3RhYmxlLmxpbmsuc3RyZWFtfWVsc2UgaWYoRlMuaXNDaHJkZXYobm9kZS5tb2RlKSl7bm9kZS5ub2RlX29wcz1NRU1GUy5vcHNfdGFibGUuY2hyZGV2Lm5vZGU7bm9kZS5zdHJlYW1fb3BzPU1FTUZTLm9wc190YWJsZS5jaHJkZXYuc3RyZWFtfW5vZGUudGltZXN0YW1wPURhdGUubm93KCk7aWYocGFyZW50KXtwYXJlbnQuY29udGVudHNbbmFtZV09bm9kZTtwYXJlbnQudGltZXN0YW1wPW5vZGUudGltZXN0YW1wfXJldHVybiBub2RlfSxnZXRGaWxlRGF0YUFzVHlwZWRBcnJheShub2RlKXtpZighbm9kZS5jb250ZW50cylyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoMCk7aWYobm9kZS5jb250ZW50cy5zdWJhcnJheSlyZXR1cm4gbm9kZS5jb250ZW50cy5zdWJhcnJheSgwLG5vZGUudXNlZEJ5dGVzKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkobm9kZS5jb250ZW50cyl9LGV4cGFuZEZpbGVTdG9yYWdlKG5vZGUsbmV3Q2FwYWNpdHkpe3ZhciBwcmV2Q2FwYWNpdHk9bm9kZS5jb250ZW50cz9ub2RlLmNvbnRlbnRzLmxlbmd0aDowO2lmKHByZXZDYXBhY2l0eT49bmV3Q2FwYWNpdHkpcmV0dXJuO3ZhciBDQVBBQ0lUWV9ET1VCTElOR19NQVg9MTAyNCoxMDI0O25ld0NhcGFjaXR5PU1hdGgubWF4KG5ld0NhcGFjaXR5LHByZXZDYXBhY2l0eSoocHJldkNhcGFjaXR5PENBUEFDSVRZX0RPVUJMSU5HX01BWD8yOjEuMTI1KT4+PjApO2lmKHByZXZDYXBhY2l0eSE9MCluZXdDYXBhY2l0eT1NYXRoLm1heChuZXdDYXBhY2l0eSwyNTYpO3ZhciBvbGRDb250ZW50cz1ub2RlLmNvbnRlbnRzO25vZGUuY29udGVudHM9bmV3IFVpbnQ4QXJyYXkobmV3Q2FwYWNpdHkpO2lmKG5vZGUudXNlZEJ5dGVzPjApbm9kZS5jb250ZW50cy5zZXQob2xkQ29udGVudHMuc3ViYXJyYXkoMCxub2RlLnVzZWRCeXRlcyksMCl9LHJlc2l6ZUZpbGVTdG9yYWdlKG5vZGUsbmV3U2l6ZSl7aWYobm9kZS51c2VkQnl0ZXM9PW5ld1NpemUpcmV0dXJuO2lmKG5ld1NpemU9PTApe25vZGUuY29udGVudHM9bnVsbDtub2RlLnVzZWRCeXRlcz0wfWVsc2V7dmFyIG9sZENvbnRlbnRzPW5vZGUuY29udGVudHM7bm9kZS5jb250ZW50cz1uZXcgVWludDhBcnJheShuZXdTaXplKTtpZihvbGRDb250ZW50cyl7bm9kZS5jb250ZW50cy5zZXQob2xkQ29udGVudHMuc3ViYXJyYXkoMCxNYXRoLm1pbihuZXdTaXplLG5vZGUudXNlZEJ5dGVzKSkpfW5vZGUudXNlZEJ5dGVzPW5ld1NpemV9fSxub2RlX29wczp7Z2V0YXR0cihub2RlKXt2YXIgYXR0cj17fTthdHRyLmRldj1GUy5pc0NocmRldihub2RlLm1vZGUpP25vZGUuaWQ6MTthdHRyLmlubz1ub2RlLmlkO2F0dHIubW9kZT1ub2RlLm1vZGU7YXR0ci5ubGluaz0xO2F0dHIudWlkPTA7YXR0ci5naWQ9MDthdHRyLnJkZXY9bm9kZS5yZGV2O2lmKEZTLmlzRGlyKG5vZGUubW9kZSkpe2F0dHIuc2l6ZT00MDk2fWVsc2UgaWYoRlMuaXNGaWxlKG5vZGUubW9kZSkpe2F0dHIuc2l6ZT1ub2RlLnVzZWRCeXRlc31lbHNlIGlmKEZTLmlzTGluayhub2RlLm1vZGUpKXthdHRyLnNpemU9bm9kZS5saW5rLmxlbmd0aH1lbHNle2F0dHIuc2l6ZT0wfWF0dHIuYXRpbWU9bmV3IERhdGUobm9kZS50aW1lc3RhbXApO2F0dHIubXRpbWU9bmV3IERhdGUobm9kZS50aW1lc3RhbXApO2F0dHIuY3RpbWU9bmV3IERhdGUobm9kZS50aW1lc3RhbXApO2F0dHIuYmxrc2l6ZT00MDk2O2F0dHIuYmxvY2tzPU1hdGguY2VpbChhdHRyLnNpemUvYXR0ci5ibGtzaXplKTtyZXR1cm4gYXR0cn0sc2V0YXR0cihub2RlLGF0dHIpe2lmKGF0dHIubW9kZSE9PXVuZGVmaW5lZCl7bm9kZS5tb2RlPWF0dHIubW9kZX1pZihhdHRyLnRpbWVzdGFtcCE9PXVuZGVmaW5lZCl7bm9kZS50aW1lc3RhbXA9YXR0ci50aW1lc3RhbXB9aWYoYXR0ci5zaXplIT09dW5kZWZpbmVkKXtNRU1GUy5yZXNpemVGaWxlU3RvcmFnZShub2RlLGF0dHIuc2l6ZSl9fSxsb29rdXAocGFyZW50LG5hbWUpe3Rocm93IEZTLmdlbmVyaWNFcnJvcnNbNDRdfSxta25vZChwYXJlbnQsbmFtZSxtb2RlLGRldil7cmV0dXJuIE1FTUZTLmNyZWF0ZU5vZGUocGFyZW50LG5hbWUsbW9kZSxkZXYpfSxyZW5hbWUob2xkX25vZGUsbmV3X2RpcixuZXdfbmFtZSl7aWYoRlMuaXNEaXIob2xkX25vZGUubW9kZSkpe3ZhciBuZXdfbm9kZTt0cnl7bmV3X25vZGU9RlMubG9va3VwTm9kZShuZXdfZGlyLG5ld19uYW1lKX1jYXRjaChlKXt9aWYobmV3X25vZGUpe2Zvcih2YXIgaSBpbiBuZXdfbm9kZS5jb250ZW50cyl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTUpfX19ZGVsZXRlIG9sZF9ub2RlLnBhcmVudC5jb250ZW50c1tvbGRfbm9kZS5uYW1lXTtvbGRfbm9kZS5wYXJlbnQudGltZXN0YW1wPURhdGUubm93KCk7b2xkX25vZGUubmFtZT1uZXdfbmFtZTtuZXdfZGlyLmNvbnRlbnRzW25ld19uYW1lXT1vbGRfbm9kZTtuZXdfZGlyLnRpbWVzdGFtcD1vbGRfbm9kZS5wYXJlbnQudGltZXN0YW1wO29sZF9ub2RlLnBhcmVudD1uZXdfZGlyfSx1bmxpbmsocGFyZW50LG5hbWUpe2RlbGV0ZSBwYXJlbnQuY29udGVudHNbbmFtZV07cGFyZW50LnRpbWVzdGFtcD1EYXRlLm5vdygpfSxybWRpcihwYXJlbnQsbmFtZSl7dmFyIG5vZGU9RlMubG9va3VwTm9kZShwYXJlbnQsbmFtZSk7Zm9yKHZhciBpIGluIG5vZGUuY29udGVudHMpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU1KX1kZWxldGUgcGFyZW50LmNvbnRlbnRzW25hbWVdO3BhcmVudC50aW1lc3RhbXA9RGF0ZS5ub3coKX0scmVhZGRpcihub2RlKXt2YXIgZW50cmllcz1bIi4iLCIuLiJdO2Zvcih2YXIga2V5IGluIG5vZGUuY29udGVudHMpe2lmKCFub2RlLmNvbnRlbnRzLmhhc093blByb3BlcnR5KGtleSkpe2NvbnRpbnVlfWVudHJpZXMucHVzaChrZXkpfXJldHVybiBlbnRyaWVzfSxzeW1saW5rKHBhcmVudCxuZXduYW1lLG9sZHBhdGgpe3ZhciBub2RlPU1FTUZTLmNyZWF0ZU5vZGUocGFyZW50LG5ld25hbWUsNTExfDQwOTYwLDApO25vZGUubGluaz1vbGRwYXRoO3JldHVybiBub2RlfSxyZWFkbGluayhub2RlKXtpZighRlMuaXNMaW5rKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1yZXR1cm4gbm9kZS5saW5rfX0sc3RyZWFtX29wczp7cmVhZChzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24pe3ZhciBjb250ZW50cz1zdHJlYW0ubm9kZS5jb250ZW50cztpZihwb3NpdGlvbj49c3RyZWFtLm5vZGUudXNlZEJ5dGVzKXJldHVybiAwO3ZhciBzaXplPU1hdGgubWluKHN0cmVhbS5ub2RlLnVzZWRCeXRlcy1wb3NpdGlvbixsZW5ndGgpO2lmKHNpemU+OCYmY29udGVudHMuc3ViYXJyYXkpe2J1ZmZlci5zZXQoY29udGVudHMuc3ViYXJyYXkocG9zaXRpb24scG9zaXRpb24rc2l6ZSksb2Zmc2V0KX1lbHNle2Zvcih2YXIgaT0wO2k8c2l6ZTtpKyspYnVmZmVyW29mZnNldCtpXT1jb250ZW50c1twb3NpdGlvbitpXX1yZXR1cm4gc2l6ZX0sd3JpdGUoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uLGNhbk93bil7aWYoIWxlbmd0aClyZXR1cm4gMDt2YXIgbm9kZT1zdHJlYW0ubm9kZTtub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpO2lmKGJ1ZmZlci5zdWJhcnJheSYmKCFub2RlLmNvbnRlbnRzfHxub2RlLmNvbnRlbnRzLnN1YmFycmF5KSl7aWYoY2FuT3duKXtub2RlLmNvbnRlbnRzPWJ1ZmZlci5zdWJhcnJheShvZmZzZXQsb2Zmc2V0K2xlbmd0aCk7bm9kZS51c2VkQnl0ZXM9bGVuZ3RoO3JldHVybiBsZW5ndGh9ZWxzZSBpZihub2RlLnVzZWRCeXRlcz09PTAmJnBvc2l0aW9uPT09MCl7bm9kZS5jb250ZW50cz1idWZmZXIuc2xpY2Uob2Zmc2V0LG9mZnNldCtsZW5ndGgpO25vZGUudXNlZEJ5dGVzPWxlbmd0aDtyZXR1cm4gbGVuZ3RofWVsc2UgaWYocG9zaXRpb24rbGVuZ3RoPD1ub2RlLnVzZWRCeXRlcyl7bm9kZS5jb250ZW50cy5zZXQoYnVmZmVyLnN1YmFycmF5KG9mZnNldCxvZmZzZXQrbGVuZ3RoKSxwb3NpdGlvbik7cmV0dXJuIGxlbmd0aH19TUVNRlMuZXhwYW5kRmlsZVN0b3JhZ2Uobm9kZSxwb3NpdGlvbitsZW5ndGgpO2lmKG5vZGUuY29udGVudHMuc3ViYXJyYXkmJmJ1ZmZlci5zdWJhcnJheSl7bm9kZS5jb250ZW50cy5zZXQoYnVmZmVyLnN1YmFycmF5KG9mZnNldCxvZmZzZXQrbGVuZ3RoKSxwb3NpdGlvbil9ZWxzZXtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe25vZGUuY29udGVudHNbcG9zaXRpb24raV09YnVmZmVyW29mZnNldCtpXX19bm9kZS51c2VkQnl0ZXM9TWF0aC5tYXgobm9kZS51c2VkQnl0ZXMscG9zaXRpb24rbGVuZ3RoKTtyZXR1cm4gbGVuZ3RofSxsbHNlZWsoc3RyZWFtLG9mZnNldCx3aGVuY2Upe3ZhciBwb3NpdGlvbj1vZmZzZXQ7aWYod2hlbmNlPT09MSl7cG9zaXRpb24rPXN0cmVhbS5wb3NpdGlvbn1lbHNlIGlmKHdoZW5jZT09PTIpe2lmKEZTLmlzRmlsZShzdHJlYW0ubm9kZS5tb2RlKSl7cG9zaXRpb24rPXN0cmVhbS5ub2RlLnVzZWRCeXRlc319aWYocG9zaXRpb248MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXJldHVybiBwb3NpdGlvbn0sYWxsb2NhdGUoc3RyZWFtLG9mZnNldCxsZW5ndGgpe01FTUZTLmV4cGFuZEZpbGVTdG9yYWdlKHN0cmVhbS5ub2RlLG9mZnNldCtsZW5ndGgpO3N0cmVhbS5ub2RlLnVzZWRCeXRlcz1NYXRoLm1heChzdHJlYW0ubm9kZS51c2VkQnl0ZXMsb2Zmc2V0K2xlbmd0aCl9LG1tYXAoc3RyZWFtLGxlbmd0aCxwb3NpdGlvbixwcm90LGZsYWdzKXtpZighRlMuaXNGaWxlKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9dmFyIHB0cjt2YXIgYWxsb2NhdGVkO3ZhciBjb250ZW50cz1zdHJlYW0ubm9kZS5jb250ZW50cztpZighKGZsYWdzJjIpJiZjb250ZW50cy5idWZmZXI9PT1IRUFQOC5idWZmZXIpe2FsbG9jYXRlZD1mYWxzZTtwdHI9Y29udGVudHMuYnl0ZU9mZnNldH1lbHNle2lmKHBvc2l0aW9uPjB8fHBvc2l0aW9uK2xlbmd0aDxjb250ZW50cy5sZW5ndGgpe2lmKGNvbnRlbnRzLnN1YmFycmF5KXtjb250ZW50cz1jb250ZW50cy5zdWJhcnJheShwb3NpdGlvbixwb3NpdGlvbitsZW5ndGgpfWVsc2V7Y29udGVudHM9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY29udGVudHMscG9zaXRpb24scG9zaXRpb24rbGVuZ3RoKX19YWxsb2NhdGVkPXRydWU7cHRyPW1tYXBBbGxvYyhsZW5ndGgpO2lmKCFwdHIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ4KX1IRUFQOC5zZXQoY29udGVudHMscHRyKX1yZXR1cm57cHRyOnB0cixhbGxvY2F0ZWQ6YWxsb2NhdGVkfX0sbXN5bmMoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLG1tYXBGbGFncyl7TUVNRlMuc3RyZWFtX29wcy53cml0ZShzdHJlYW0sYnVmZmVyLDAsbGVuZ3RoLG9mZnNldCxmYWxzZSk7cmV0dXJuIDB9fX07dmFyIGFzeW5jTG9hZD0odXJsLG9ubG9hZCxvbmVycm9yLG5vUnVuRGVwKT0+e3ZhciBkZXA9IW5vUnVuRGVwP2dldFVuaXF1ZVJ1bkRlcGVuZGVuY3koYGFsICR7dXJsfWApOiIiO3JlYWRBc3luYyh1cmwsYXJyYXlCdWZmZXI9Pnthc3NlcnQoYXJyYXlCdWZmZXIsYExvYWRpbmcgZGF0YSBmaWxlICIke3VybH0iIGZhaWxlZCAobm8gYXJyYXlCdWZmZXIpLmApO29ubG9hZChuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcikpO2lmKGRlcClyZW1vdmVSdW5EZXBlbmRlbmN5KGRlcCl9LGV2ZW50PT57aWYob25lcnJvcil7b25lcnJvcigpfWVsc2V7dGhyb3dgTG9hZGluZyBkYXRhIGZpbGUgIiR7dXJsfSIgZmFpbGVkLmB9fSk7aWYoZGVwKWFkZFJ1bkRlcGVuZGVuY3koZGVwKX07dmFyIEZTX2NyZWF0ZURhdGFGaWxlPShwYXJlbnQsbmFtZSxmaWxlRGF0YSxjYW5SZWFkLGNhbldyaXRlLGNhbk93bik9PntGUy5jcmVhdGVEYXRhRmlsZShwYXJlbnQsbmFtZSxmaWxlRGF0YSxjYW5SZWFkLGNhbldyaXRlLGNhbk93bil9O3ZhciBwcmVsb2FkUGx1Z2lucz1Nb2R1bGVbInByZWxvYWRQbHVnaW5zIl18fFtdO3ZhciBGU19oYW5kbGVkQnlQcmVsb2FkUGx1Z2luPShieXRlQXJyYXksZnVsbG5hbWUsZmluaXNoLG9uZXJyb3IpPT57aWYodHlwZW9mIEJyb3dzZXIhPSJ1bmRlZmluZWQiKUJyb3dzZXIuaW5pdCgpO3ZhciBoYW5kbGVkPWZhbHNlO3ByZWxvYWRQbHVnaW5zLmZvckVhY2gocGx1Z2luPT57aWYoaGFuZGxlZClyZXR1cm47aWYocGx1Z2luWyJjYW5IYW5kbGUiXShmdWxsbmFtZSkpe3BsdWdpblsiaGFuZGxlIl0oYnl0ZUFycmF5LGZ1bGxuYW1lLGZpbmlzaCxvbmVycm9yKTtoYW5kbGVkPXRydWV9fSk7cmV0dXJuIGhhbmRsZWR9O3ZhciBGU19jcmVhdGVQcmVsb2FkZWRGaWxlPShwYXJlbnQsbmFtZSx1cmwsY2FuUmVhZCxjYW5Xcml0ZSxvbmxvYWQsb25lcnJvcixkb250Q3JlYXRlRmlsZSxjYW5Pd24scHJlRmluaXNoKT0+e3ZhciBmdWxsbmFtZT1uYW1lP1BBVEhfRlMucmVzb2x2ZShQQVRILmpvaW4yKHBhcmVudCxuYW1lKSk6cGFyZW50O3ZhciBkZXA9Z2V0VW5pcXVlUnVuRGVwZW5kZW5jeShgY3AgJHtmdWxsbmFtZX1gKTtmdW5jdGlvbiBwcm9jZXNzRGF0YShieXRlQXJyYXkpe2Z1bmN0aW9uIGZpbmlzaChieXRlQXJyYXkpe2lmKHByZUZpbmlzaClwcmVGaW5pc2goKTtpZighZG9udENyZWF0ZUZpbGUpe0ZTX2NyZWF0ZURhdGFGaWxlKHBhcmVudCxuYW1lLGJ5dGVBcnJheSxjYW5SZWFkLGNhbldyaXRlLGNhbk93bil9aWYob25sb2FkKW9ubG9hZCgpO3JlbW92ZVJ1bkRlcGVuZGVuY3koZGVwKX1pZihGU19oYW5kbGVkQnlQcmVsb2FkUGx1Z2luKGJ5dGVBcnJheSxmdWxsbmFtZSxmaW5pc2gsKCk9PntpZihvbmVycm9yKW9uZXJyb3IoKTtyZW1vdmVSdW5EZXBlbmRlbmN5KGRlcCl9KSl7cmV0dXJufWZpbmlzaChieXRlQXJyYXkpfWFkZFJ1bkRlcGVuZGVuY3koZGVwKTtpZih0eXBlb2YgdXJsPT0ic3RyaW5nIil7YXN5bmNMb2FkKHVybCxieXRlQXJyYXk9PnByb2Nlc3NEYXRhKGJ5dGVBcnJheSksb25lcnJvcil9ZWxzZXtwcm9jZXNzRGF0YSh1cmwpfX07dmFyIEZTX21vZGVTdHJpbmdUb0ZsYWdzPXN0cj0+e3ZhciBmbGFnTW9kZXM9eyJyIjowLCJyKyI6MiwidyI6NTEyfDY0fDEsIncrIjo1MTJ8NjR8MiwiYSI6MTAyNHw2NHwxLCJhKyI6MTAyNHw2NHwyfTt2YXIgZmxhZ3M9ZmxhZ01vZGVzW3N0cl07aWYodHlwZW9mIGZsYWdzPT0idW5kZWZpbmVkIil7dGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGZpbGUgb3BlbiBtb2RlOiAke3N0cn1gKX1yZXR1cm4gZmxhZ3N9O3ZhciBGU19nZXRNb2RlPShjYW5SZWFkLGNhbldyaXRlKT0+e3ZhciBtb2RlPTA7aWYoY2FuUmVhZCltb2RlfD0yOTJ8NzM7aWYoY2FuV3JpdGUpbW9kZXw9MTQ2O3JldHVybiBtb2RlfTt2YXIgRlM9e3Jvb3Q6bnVsbCxtb3VudHM6W10sZGV2aWNlczp7fSxzdHJlYW1zOltdLG5leHRJbm9kZToxLG5hbWVUYWJsZTpudWxsLGN1cnJlbnRQYXRoOiIvIixpbml0aWFsaXplZDpmYWxzZSxpZ25vcmVQZXJtaXNzaW9uczp0cnVlLEVycm5vRXJyb3I6bnVsbCxnZW5lcmljRXJyb3JzOnt9LGZpbGVzeXN0ZW1zOm51bGwsc3luY0ZTUmVxdWVzdHM6MCxsb29rdXBQYXRoKHBhdGgsb3B0cz17fSl7cGF0aD1QQVRIX0ZTLnJlc29sdmUocGF0aCk7aWYoIXBhdGgpcmV0dXJue3BhdGg6IiIsbm9kZTpudWxsfTt2YXIgZGVmYXVsdHM9e2ZvbGxvd19tb3VudDp0cnVlLHJlY3Vyc2VfY291bnQ6MH07b3B0cz1PYmplY3QuYXNzaWduKGRlZmF1bHRzLG9wdHMpO2lmKG9wdHMucmVjdXJzZV9jb3VudD44KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigzMil9dmFyIHBhcnRzPXBhdGguc3BsaXQoIi8iKS5maWx0ZXIocD0+ISFwKTt2YXIgY3VycmVudD1GUy5yb290O3ZhciBjdXJyZW50X3BhdGg9Ii8iO2Zvcih2YXIgaT0wO2k8cGFydHMubGVuZ3RoO2krKyl7dmFyIGlzbGFzdD1pPT09cGFydHMubGVuZ3RoLTE7aWYoaXNsYXN0JiZvcHRzLnBhcmVudCl7YnJlYWt9Y3VycmVudD1GUy5sb29rdXBOb2RlKGN1cnJlbnQscGFydHNbaV0pO2N1cnJlbnRfcGF0aD1QQVRILmpvaW4yKGN1cnJlbnRfcGF0aCxwYXJ0c1tpXSk7aWYoRlMuaXNNb3VudHBvaW50KGN1cnJlbnQpKXtpZighaXNsYXN0fHxpc2xhc3QmJm9wdHMuZm9sbG93X21vdW50KXtjdXJyZW50PWN1cnJlbnQubW91bnRlZC5yb290fX1pZighaXNsYXN0fHxvcHRzLmZvbGxvdyl7dmFyIGNvdW50PTA7d2hpbGUoRlMuaXNMaW5rKGN1cnJlbnQubW9kZSkpe3ZhciBsaW5rPUZTLnJlYWRsaW5rKGN1cnJlbnRfcGF0aCk7Y3VycmVudF9wYXRoPVBBVEhfRlMucmVzb2x2ZShQQVRILmRpcm5hbWUoY3VycmVudF9wYXRoKSxsaW5rKTt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgoY3VycmVudF9wYXRoLHtyZWN1cnNlX2NvdW50Om9wdHMucmVjdXJzZV9jb3VudCsxfSk7Y3VycmVudD1sb29rdXAubm9kZTtpZihjb3VudCsrPjQwKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigzMil9fX19cmV0dXJue3BhdGg6Y3VycmVudF9wYXRoLG5vZGU6Y3VycmVudH19LGdldFBhdGgobm9kZSl7dmFyIHBhdGg7d2hpbGUodHJ1ZSl7aWYoRlMuaXNSb290KG5vZGUpKXt2YXIgbW91bnQ9bm9kZS5tb3VudC5tb3VudHBvaW50O2lmKCFwYXRoKXJldHVybiBtb3VudDtyZXR1cm4gbW91bnRbbW91bnQubGVuZ3RoLTFdIT09Ii8iP2Ake21vdW50fS8ke3BhdGh9YDptb3VudCtwYXRofXBhdGg9cGF0aD9gJHtub2RlLm5hbWV9LyR7cGF0aH1gOm5vZGUubmFtZTtub2RlPW5vZGUucGFyZW50fX0saGFzaE5hbWUocGFyZW50aWQsbmFtZSl7dmFyIGhhc2g9MDtmb3IodmFyIGk9MDtpPG5hbWUubGVuZ3RoO2krKyl7aGFzaD0oaGFzaDw8NSktaGFzaCtuYW1lLmNoYXJDb2RlQXQoaSl8MH1yZXR1cm4ocGFyZW50aWQraGFzaD4+PjApJUZTLm5hbWVUYWJsZS5sZW5ndGh9LGhhc2hBZGROb2RlKG5vZGUpe3ZhciBoYXNoPUZTLmhhc2hOYW1lKG5vZGUucGFyZW50LmlkLG5vZGUubmFtZSk7bm9kZS5uYW1lX25leHQ9RlMubmFtZVRhYmxlW2hhc2hdO0ZTLm5hbWVUYWJsZVtoYXNoXT1ub2RlfSxoYXNoUmVtb3ZlTm9kZShub2RlKXt2YXIgaGFzaD1GUy5oYXNoTmFtZShub2RlLnBhcmVudC5pZCxub2RlLm5hbWUpO2lmKEZTLm5hbWVUYWJsZVtoYXNoXT09PW5vZGUpe0ZTLm5hbWVUYWJsZVtoYXNoXT1ub2RlLm5hbWVfbmV4dH1lbHNle3ZhciBjdXJyZW50PUZTLm5hbWVUYWJsZVtoYXNoXTt3aGlsZShjdXJyZW50KXtpZihjdXJyZW50Lm5hbWVfbmV4dD09PW5vZGUpe2N1cnJlbnQubmFtZV9uZXh0PW5vZGUubmFtZV9uZXh0O2JyZWFrfWN1cnJlbnQ9Y3VycmVudC5uYW1lX25leHR9fX0sbG9va3VwTm9kZShwYXJlbnQsbmFtZSl7dmFyIGVyckNvZGU9RlMubWF5TG9va3VwKHBhcmVudCk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSxwYXJlbnQpfXZhciBoYXNoPUZTLmhhc2hOYW1lKHBhcmVudC5pZCxuYW1lKTtmb3IodmFyIG5vZGU9RlMubmFtZVRhYmxlW2hhc2hdO25vZGU7bm9kZT1ub2RlLm5hbWVfbmV4dCl7dmFyIG5vZGVOYW1lPW5vZGUubmFtZTtpZihub2RlLnBhcmVudC5pZD09PXBhcmVudC5pZCYmbm9kZU5hbWU9PT1uYW1lKXtyZXR1cm4gbm9kZX19cmV0dXJuIEZTLmxvb2t1cChwYXJlbnQsbmFtZSl9LGNyZWF0ZU5vZGUocGFyZW50LG5hbWUsbW9kZSxyZGV2KXt2YXIgbm9kZT1uZXcgRlMuRlNOb2RlKHBhcmVudCxuYW1lLG1vZGUscmRldik7RlMuaGFzaEFkZE5vZGUobm9kZSk7cmV0dXJuIG5vZGV9LGRlc3Ryb3lOb2RlKG5vZGUpe0ZTLmhhc2hSZW1vdmVOb2RlKG5vZGUpfSxpc1Jvb3Qobm9kZSl7cmV0dXJuIG5vZGU9PT1ub2RlLnBhcmVudH0saXNNb3VudHBvaW50KG5vZGUpe3JldHVybiEhbm9kZS5tb3VudGVkfSxpc0ZpbGUobW9kZSl7cmV0dXJuKG1vZGUmNjE0NDApPT09MzI3Njh9LGlzRGlyKG1vZGUpe3JldHVybihtb2RlJjYxNDQwKT09PTE2Mzg0fSxpc0xpbmsobW9kZSl7cmV0dXJuKG1vZGUmNjE0NDApPT09NDA5NjB9LGlzQ2hyZGV2KG1vZGUpe3JldHVybihtb2RlJjYxNDQwKT09PTgxOTJ9LGlzQmxrZGV2KG1vZGUpe3JldHVybihtb2RlJjYxNDQwKT09PTI0NTc2fSxpc0ZJRk8obW9kZSl7cmV0dXJuKG1vZGUmNjE0NDApPT09NDA5Nn0saXNTb2NrZXQobW9kZSl7cmV0dXJuKG1vZGUmNDkxNTIpPT09NDkxNTJ9LGZsYWdzVG9QZXJtaXNzaW9uU3RyaW5nKGZsYWcpe3ZhciBwZXJtcz1bInIiLCJ3IiwicnciXVtmbGFnJjNdO2lmKGZsYWcmNTEyKXtwZXJtcys9IncifXJldHVybiBwZXJtc30sbm9kZVBlcm1pc3Npb25zKG5vZGUscGVybXMpe2lmKEZTLmlnbm9yZVBlcm1pc3Npb25zKXtyZXR1cm4gMH1pZihwZXJtcy5pbmNsdWRlcygiciIpJiYhKG5vZGUubW9kZSYyOTIpKXtyZXR1cm4gMn1lbHNlIGlmKHBlcm1zLmluY2x1ZGVzKCJ3IikmJiEobm9kZS5tb2RlJjE0Nikpe3JldHVybiAyfWVsc2UgaWYocGVybXMuaW5jbHVkZXMoIngiKSYmIShub2RlLm1vZGUmNzMpKXtyZXR1cm4gMn1yZXR1cm4gMH0sbWF5TG9va3VwKGRpcil7dmFyIGVyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKGRpciwieCIpO2lmKGVyckNvZGUpcmV0dXJuIGVyckNvZGU7aWYoIWRpci5ub2RlX29wcy5sb29rdXApcmV0dXJuIDI7cmV0dXJuIDB9LG1heUNyZWF0ZShkaXIsbmFtZSl7dHJ5e3ZhciBub2RlPUZTLmxvb2t1cE5vZGUoZGlyLG5hbWUpO3JldHVybiAyMH1jYXRjaChlKXt9cmV0dXJuIEZTLm5vZGVQZXJtaXNzaW9ucyhkaXIsInd4Iil9LG1heURlbGV0ZShkaXIsbmFtZSxpc2Rpcil7dmFyIG5vZGU7dHJ5e25vZGU9RlMubG9va3VwTm9kZShkaXIsbmFtZSl9Y2F0Y2goZSl7cmV0dXJuIGUuZXJybm99dmFyIGVyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKGRpciwid3giKTtpZihlcnJDb2RlKXtyZXR1cm4gZXJyQ29kZX1pZihpc2Rpcil7aWYoIUZTLmlzRGlyKG5vZGUubW9kZSkpe3JldHVybiA1NH1pZihGUy5pc1Jvb3Qobm9kZSl8fEZTLmdldFBhdGgobm9kZSk9PT1GUy5jd2QoKSl7cmV0dXJuIDEwfX1lbHNle2lmKEZTLmlzRGlyKG5vZGUubW9kZSkpe3JldHVybiAzMX19cmV0dXJuIDB9LG1heU9wZW4obm9kZSxmbGFncyl7aWYoIW5vZGUpe3JldHVybiA0NH1pZihGUy5pc0xpbmsobm9kZS5tb2RlKSl7cmV0dXJuIDMyfWVsc2UgaWYoRlMuaXNEaXIobm9kZS5tb2RlKSl7aWYoRlMuZmxhZ3NUb1Blcm1pc3Npb25TdHJpbmcoZmxhZ3MpIT09InIifHxmbGFncyY1MTIpe3JldHVybiAzMX19cmV0dXJuIEZTLm5vZGVQZXJtaXNzaW9ucyhub2RlLEZTLmZsYWdzVG9QZXJtaXNzaW9uU3RyaW5nKGZsYWdzKSl9LE1BWF9PUEVOX0ZEUzo0MDk2LG5leHRmZCgpe2Zvcih2YXIgZmQ9MDtmZDw9RlMuTUFYX09QRU5fRkRTO2ZkKyspe2lmKCFGUy5zdHJlYW1zW2ZkXSl7cmV0dXJuIGZkfX10aHJvdyBuZXcgRlMuRXJybm9FcnJvcigzMyl9LGdldFN0cmVhbUNoZWNrZWQoZmQpe3ZhciBzdHJlYW09RlMuZ2V0U3RyZWFtKGZkKTtpZighc3RyZWFtKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1yZXR1cm4gc3RyZWFtfSxnZXRTdHJlYW06ZmQ9PkZTLnN0cmVhbXNbZmRdLGNyZWF0ZVN0cmVhbShzdHJlYW0sZmQ9LTEpe2lmKCFGUy5GU1N0cmVhbSl7RlMuRlNTdHJlYW09ZnVuY3Rpb24oKXt0aGlzLnNoYXJlZD17fX07RlMuRlNTdHJlYW0ucHJvdG90eXBlPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZTLkZTU3RyZWFtLnByb3RvdHlwZSx7b2JqZWN0OntnZXQoKXtyZXR1cm4gdGhpcy5ub2RlfSxzZXQodmFsKXt0aGlzLm5vZGU9dmFsfX0saXNSZWFkOntnZXQoKXtyZXR1cm4odGhpcy5mbGFncyYyMDk3MTU1KSE9PTF9fSxpc1dyaXRlOntnZXQoKXtyZXR1cm4odGhpcy5mbGFncyYyMDk3MTU1KSE9PTB9fSxpc0FwcGVuZDp7Z2V0KCl7cmV0dXJuIHRoaXMuZmxhZ3MmMTAyNH19LGZsYWdzOntnZXQoKXtyZXR1cm4gdGhpcy5zaGFyZWQuZmxhZ3N9LHNldCh2YWwpe3RoaXMuc2hhcmVkLmZsYWdzPXZhbH19LHBvc2l0aW9uOntnZXQoKXtyZXR1cm4gdGhpcy5zaGFyZWQucG9zaXRpb259LHNldCh2YWwpe3RoaXMuc2hhcmVkLnBvc2l0aW9uPXZhbH19fSl9c3RyZWFtPU9iamVjdC5hc3NpZ24obmV3IEZTLkZTU3RyZWFtLHN0cmVhbSk7aWYoZmQ9PS0xKXtmZD1GUy5uZXh0ZmQoKX1zdHJlYW0uZmQ9ZmQ7RlMuc3RyZWFtc1tmZF09c3RyZWFtO3JldHVybiBzdHJlYW19LGNsb3NlU3RyZWFtKGZkKXtGUy5zdHJlYW1zW2ZkXT1udWxsfSxjaHJkZXZfc3RyZWFtX29wczp7b3BlbihzdHJlYW0pe3ZhciBkZXZpY2U9RlMuZ2V0RGV2aWNlKHN0cmVhbS5ub2RlLnJkZXYpO3N0cmVhbS5zdHJlYW1fb3BzPWRldmljZS5zdHJlYW1fb3BzO2lmKHN0cmVhbS5zdHJlYW1fb3BzLm9wZW4pe3N0cmVhbS5zdHJlYW1fb3BzLm9wZW4oc3RyZWFtKX19LGxsc2Vlaygpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDcwKX19LG1ham9yOmRldj0+ZGV2Pj44LG1pbm9yOmRldj0+ZGV2JjI1NSxtYWtlZGV2OihtYSxtaSk9Pm1hPDw4fG1pLHJlZ2lzdGVyRGV2aWNlKGRldixvcHMpe0ZTLmRldmljZXNbZGV2XT17c3RyZWFtX29wczpvcHN9fSxnZXREZXZpY2U6ZGV2PT5GUy5kZXZpY2VzW2Rldl0sZ2V0TW91bnRzKG1vdW50KXt2YXIgbW91bnRzPVtdO3ZhciBjaGVjaz1bbW91bnRdO3doaWxlKGNoZWNrLmxlbmd0aCl7dmFyIG09Y2hlY2sucG9wKCk7bW91bnRzLnB1c2gobSk7Y2hlY2sucHVzaC5hcHBseShjaGVjayxtLm1vdW50cyl9cmV0dXJuIG1vdW50c30sc3luY2ZzKHBvcHVsYXRlLGNhbGxiYWNrKXtpZih0eXBlb2YgcG9wdWxhdGU9PSJmdW5jdGlvbiIpe2NhbGxiYWNrPXBvcHVsYXRlO3BvcHVsYXRlPWZhbHNlfUZTLnN5bmNGU1JlcXVlc3RzKys7aWYoRlMuc3luY0ZTUmVxdWVzdHM+MSl7ZXJyKGB3YXJuaW5nOiAke0ZTLnN5bmNGU1JlcXVlc3RzfSBGUy5zeW5jZnMgb3BlcmF0aW9ucyBpbiBmbGlnaHQgYXQgb25jZSwgcHJvYmFibHkganVzdCBkb2luZyBleHRyYSB3b3JrYCl9dmFyIG1vdW50cz1GUy5nZXRNb3VudHMoRlMucm9vdC5tb3VudCk7dmFyIGNvbXBsZXRlZD0wO2Z1bmN0aW9uIGRvQ2FsbGJhY2soZXJyQ29kZSl7RlMuc3luY0ZTUmVxdWVzdHMtLTtyZXR1cm4gY2FsbGJhY2soZXJyQ29kZSl9ZnVuY3Rpb24gZG9uZShlcnJDb2RlKXtpZihlcnJDb2RlKXtpZighZG9uZS5lcnJvcmVkKXtkb25lLmVycm9yZWQ9dHJ1ZTtyZXR1cm4gZG9DYWxsYmFjayhlcnJDb2RlKX1yZXR1cm59aWYoKytjb21wbGV0ZWQ+PW1vdW50cy5sZW5ndGgpe2RvQ2FsbGJhY2sobnVsbCl9fW1vdW50cy5mb3JFYWNoKG1vdW50PT57aWYoIW1vdW50LnR5cGUuc3luY2ZzKXtyZXR1cm4gZG9uZShudWxsKX1tb3VudC50eXBlLnN5bmNmcyhtb3VudCxwb3B1bGF0ZSxkb25lKX0pfSxtb3VudCh0eXBlLG9wdHMsbW91bnRwb2ludCl7dmFyIHJvb3Q9bW91bnRwb2ludD09PSIvIjt2YXIgcHNldWRvPSFtb3VudHBvaW50O3ZhciBub2RlO2lmKHJvb3QmJkZTLnJvb3Qpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDEwKX1lbHNlIGlmKCFyb290JiYhcHNldWRvKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgobW91bnRwb2ludCx7Zm9sbG93X21vdW50OmZhbHNlfSk7bW91bnRwb2ludD1sb29rdXAucGF0aDtub2RlPWxvb2t1cC5ub2RlO2lmKEZTLmlzTW91bnRwb2ludChub2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTApfWlmKCFGUy5pc0Rpcihub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NCl9fXZhciBtb3VudD17dHlwZTp0eXBlLG9wdHM6b3B0cyxtb3VudHBvaW50Om1vdW50cG9pbnQsbW91bnRzOltdfTt2YXIgbW91bnRSb290PXR5cGUubW91bnQobW91bnQpO21vdW50Um9vdC5tb3VudD1tb3VudDttb3VudC5yb290PW1vdW50Um9vdDtpZihyb290KXtGUy5yb290PW1vdW50Um9vdH1lbHNlIGlmKG5vZGUpe25vZGUubW91bnRlZD1tb3VudDtpZihub2RlLm1vdW50KXtub2RlLm1vdW50Lm1vdW50cy5wdXNoKG1vdW50KX19cmV0dXJuIG1vdW50Um9vdH0sdW5tb3VudChtb3VudHBvaW50KXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgobW91bnRwb2ludCx7Zm9sbG93X21vdW50OmZhbHNlfSk7aWYoIUZTLmlzTW91bnRwb2ludChsb29rdXAubm9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgbm9kZT1sb29rdXAubm9kZTt2YXIgbW91bnQ9bm9kZS5tb3VudGVkO3ZhciBtb3VudHM9RlMuZ2V0TW91bnRzKG1vdW50KTtPYmplY3Qua2V5cyhGUy5uYW1lVGFibGUpLmZvckVhY2goaGFzaD0+e3ZhciBjdXJyZW50PUZTLm5hbWVUYWJsZVtoYXNoXTt3aGlsZShjdXJyZW50KXt2YXIgbmV4dD1jdXJyZW50Lm5hbWVfbmV4dDtpZihtb3VudHMuaW5jbHVkZXMoY3VycmVudC5tb3VudCkpe0ZTLmRlc3Ryb3lOb2RlKGN1cnJlbnQpfWN1cnJlbnQ9bmV4dH19KTtub2RlLm1vdW50ZWQ9bnVsbDt2YXIgaWR4PW5vZGUubW91bnQubW91bnRzLmluZGV4T2YobW91bnQpO25vZGUubW91bnQubW91bnRzLnNwbGljZShpZHgsMSl9LGxvb2t1cChwYXJlbnQsbmFtZSl7cmV0dXJuIHBhcmVudC5ub2RlX29wcy5sb29rdXAocGFyZW50LG5hbWUpfSxta25vZChwYXRoLG1vZGUsZGV2KXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7cGFyZW50OnRydWV9KTt2YXIgcGFyZW50PWxvb2t1cC5ub2RlO3ZhciBuYW1lPVBBVEguYmFzZW5hbWUocGF0aCk7aWYoIW5hbWV8fG5hbWU9PT0iLiJ8fG5hbWU9PT0iLi4iKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9dmFyIGVyckNvZGU9RlMubWF5Q3JlYXRlKHBhcmVudCxuYW1lKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1pZighcGFyZW50Lm5vZGVfb3BzLm1rbm9kKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9cmV0dXJuIHBhcmVudC5ub2RlX29wcy5ta25vZChwYXJlbnQsbmFtZSxtb2RlLGRldil9LGNyZWF0ZShwYXRoLG1vZGUpe21vZGU9bW9kZSE9PXVuZGVmaW5lZD9tb2RlOjQzODttb2RlJj00MDk1O21vZGV8PTMyNzY4O3JldHVybiBGUy5ta25vZChwYXRoLG1vZGUsMCl9LG1rZGlyKHBhdGgsbW9kZSl7bW9kZT1tb2RlIT09dW5kZWZpbmVkP21vZGU6NTExO21vZGUmPTUxMXw1MTI7bW9kZXw9MTYzODQ7cmV0dXJuIEZTLm1rbm9kKHBhdGgsbW9kZSwwKX0sbWtkaXJUcmVlKHBhdGgsbW9kZSl7dmFyIGRpcnM9cGF0aC5zcGxpdCgiLyIpO3ZhciBkPSIiO2Zvcih2YXIgaT0wO2k8ZGlycy5sZW5ndGg7KytpKXtpZighZGlyc1tpXSljb250aW51ZTtkKz0iLyIrZGlyc1tpXTt0cnl7RlMubWtkaXIoZCxtb2RlKX1jYXRjaChlKXtpZihlLmVycm5vIT0yMCl0aHJvdyBlfX19LG1rZGV2KHBhdGgsbW9kZSxkZXYpe2lmKHR5cGVvZiBkZXY9PSJ1bmRlZmluZWQiKXtkZXY9bW9kZTttb2RlPTQzOH1tb2RlfD04MTkyO3JldHVybiBGUy5ta25vZChwYXRoLG1vZGUsZGV2KX0sc3ltbGluayhvbGRwYXRoLG5ld3BhdGgpe2lmKCFQQVRIX0ZTLnJlc29sdmUob2xkcGF0aCkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX12YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgobmV3cGF0aCx7cGFyZW50OnRydWV9KTt2YXIgcGFyZW50PWxvb2t1cC5ub2RlO2lmKCFwYXJlbnQpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX12YXIgbmV3bmFtZT1QQVRILmJhc2VuYW1lKG5ld3BhdGgpO3ZhciBlcnJDb2RlPUZTLm1heUNyZWF0ZShwYXJlbnQsbmV3bmFtZSk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9aWYoIXBhcmVudC5ub2RlX29wcy5zeW1saW5rKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9cmV0dXJuIHBhcmVudC5ub2RlX29wcy5zeW1saW5rKHBhcmVudCxuZXduYW1lLG9sZHBhdGgpfSxyZW5hbWUob2xkX3BhdGgsbmV3X3BhdGgpe3ZhciBvbGRfZGlybmFtZT1QQVRILmRpcm5hbWUob2xkX3BhdGgpO3ZhciBuZXdfZGlybmFtZT1QQVRILmRpcm5hbWUobmV3X3BhdGgpO3ZhciBvbGRfbmFtZT1QQVRILmJhc2VuYW1lKG9sZF9wYXRoKTt2YXIgbmV3X25hbWU9UEFUSC5iYXNlbmFtZShuZXdfcGF0aCk7dmFyIGxvb2t1cCxvbGRfZGlyLG5ld19kaXI7bG9va3VwPUZTLmxvb2t1cFBhdGgob2xkX3BhdGgse3BhcmVudDp0cnVlfSk7b2xkX2Rpcj1sb29rdXAubm9kZTtsb29rdXA9RlMubG9va3VwUGF0aChuZXdfcGF0aCx7cGFyZW50OnRydWV9KTtuZXdfZGlyPWxvb2t1cC5ub2RlO2lmKCFvbGRfZGlyfHwhbmV3X2Rpcil0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCk7aWYob2xkX2Rpci5tb3VudCE9PW5ld19kaXIubW91bnQpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDc1KX12YXIgb2xkX25vZGU9RlMubG9va3VwTm9kZShvbGRfZGlyLG9sZF9uYW1lKTt2YXIgcmVsYXRpdmU9UEFUSF9GUy5yZWxhdGl2ZShvbGRfcGF0aCxuZXdfZGlybmFtZSk7aWYocmVsYXRpdmUuY2hhckF0KDApIT09Ii4iKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9cmVsYXRpdmU9UEFUSF9GUy5yZWxhdGl2ZShuZXdfcGF0aCxvbGRfZGlybmFtZSk7aWYocmVsYXRpdmUuY2hhckF0KDApIT09Ii4iKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NSl9dmFyIG5ld19ub2RlO3RyeXtuZXdfbm9kZT1GUy5sb29rdXBOb2RlKG5ld19kaXIsbmV3X25hbWUpfWNhdGNoKGUpe31pZihvbGRfbm9kZT09PW5ld19ub2RlKXtyZXR1cm59dmFyIGlzZGlyPUZTLmlzRGlyKG9sZF9ub2RlLm1vZGUpO3ZhciBlcnJDb2RlPUZTLm1heURlbGV0ZShvbGRfZGlyLG9sZF9uYW1lLGlzZGlyKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1lcnJDb2RlPW5ld19ub2RlP0ZTLm1heURlbGV0ZShuZXdfZGlyLG5ld19uYW1lLGlzZGlyKTpGUy5tYXlDcmVhdGUobmV3X2RpcixuZXdfbmFtZSk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9aWYoIW9sZF9kaXIubm9kZV9vcHMucmVuYW1lKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNNb3VudHBvaW50KG9sZF9ub2RlKXx8bmV3X25vZGUmJkZTLmlzTW91bnRwb2ludChuZXdfbm9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDEwKX1pZihuZXdfZGlyIT09b2xkX2Rpcil7ZXJyQ29kZT1GUy5ub2RlUGVybWlzc2lvbnMob2xkX2RpciwidyIpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfX1GUy5oYXNoUmVtb3ZlTm9kZShvbGRfbm9kZSk7dHJ5e29sZF9kaXIubm9kZV9vcHMucmVuYW1lKG9sZF9ub2RlLG5ld19kaXIsbmV3X25hbWUpfWNhdGNoKGUpe3Rocm93IGV9ZmluYWxseXtGUy5oYXNoQWRkTm9kZShvbGRfbm9kZSl9fSxybWRpcihwYXRoKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7cGFyZW50OnRydWV9KTt2YXIgcGFyZW50PWxvb2t1cC5ub2RlO3ZhciBuYW1lPVBBVEguYmFzZW5hbWUocGF0aCk7dmFyIG5vZGU9RlMubG9va3VwTm9kZShwYXJlbnQsbmFtZSk7dmFyIGVyckNvZGU9RlMubWF5RGVsZXRlKHBhcmVudCxuYW1lLHRydWUpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfWlmKCFwYXJlbnQubm9kZV9vcHMucm1kaXIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYzKX1pZihGUy5pc01vdW50cG9pbnQobm9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDEwKX1wYXJlbnQubm9kZV9vcHMucm1kaXIocGFyZW50LG5hbWUpO0ZTLmRlc3Ryb3lOb2RlKG5vZGUpfSxyZWFkZGlyKHBhdGgpe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6dHJ1ZX0pO3ZhciBub2RlPWxvb2t1cC5ub2RlO2lmKCFub2RlLm5vZGVfb3BzLnJlYWRkaXIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU0KX1yZXR1cm4gbm9kZS5ub2RlX29wcy5yZWFkZGlyKG5vZGUpfSx1bmxpbmsocGF0aCl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTtpZighcGFyZW50KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9dmFyIG5hbWU9UEFUSC5iYXNlbmFtZShwYXRoKTt2YXIgbm9kZT1GUy5sb29rdXBOb2RlKHBhcmVudCxuYW1lKTt2YXIgZXJyQ29kZT1GUy5tYXlEZWxldGUocGFyZW50LG5hbWUsZmFsc2UpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfWlmKCFwYXJlbnQubm9kZV9vcHMudW5saW5rKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNNb3VudHBvaW50KG5vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9cGFyZW50Lm5vZGVfb3BzLnVubGluayhwYXJlbnQsbmFtZSk7RlMuZGVzdHJveU5vZGUobm9kZSl9LHJlYWRsaW5rKHBhdGgpe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoKTt2YXIgbGluaz1sb29rdXAubm9kZTtpZighbGluayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfWlmKCFsaW5rLm5vZGVfb3BzLnJlYWRsaW5rKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9cmV0dXJuIFBBVEhfRlMucmVzb2x2ZShGUy5nZXRQYXRoKGxpbmsucGFyZW50KSxsaW5rLm5vZGVfb3BzLnJlYWRsaW5rKGxpbmspKX0sc3RhdChwYXRoLGRvbnRGb2xsb3cpe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6IWRvbnRGb2xsb3d9KTt2YXIgbm9kZT1sb29rdXAubm9kZTtpZighbm9kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfWlmKCFub2RlLm5vZGVfb3BzLmdldGF0dHIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYzKX1yZXR1cm4gbm9kZS5ub2RlX29wcy5nZXRhdHRyKG5vZGUpfSxsc3RhdChwYXRoKXtyZXR1cm4gRlMuc3RhdChwYXRoLHRydWUpfSxjaG1vZChwYXRoLG1vZGUsZG9udEZvbGxvdyl7dmFyIG5vZGU7aWYodHlwZW9mIHBhdGg9PSJzdHJpbmciKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250Rm9sbG93fSk7bm9kZT1sb29rdXAubm9kZX1lbHNle25vZGU9cGF0aH1pZighbm9kZS5ub2RlX29wcy5zZXRhdHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9bm9kZS5ub2RlX29wcy5zZXRhdHRyKG5vZGUse21vZGU6bW9kZSY0MDk1fG5vZGUubW9kZSZ+NDA5NSx0aW1lc3RhbXA6RGF0ZS5ub3coKX0pfSxsY2htb2QocGF0aCxtb2RlKXtGUy5jaG1vZChwYXRoLG1vZGUsdHJ1ZSl9LGZjaG1vZChmZCxtb2RlKXt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbUNoZWNrZWQoZmQpO0ZTLmNobW9kKHN0cmVhbS5ub2RlLG1vZGUpfSxjaG93bihwYXRoLHVpZCxnaWQsZG9udEZvbGxvdyl7dmFyIG5vZGU7aWYodHlwZW9mIHBhdGg9PSJzdHJpbmciKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250Rm9sbG93fSk7bm9kZT1sb29rdXAubm9kZX1lbHNle25vZGU9cGF0aH1pZighbm9kZS5ub2RlX29wcy5zZXRhdHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9bm9kZS5ub2RlX29wcy5zZXRhdHRyKG5vZGUse3RpbWVzdGFtcDpEYXRlLm5vdygpfSl9LGxjaG93bihwYXRoLHVpZCxnaWQpe0ZTLmNob3duKHBhdGgsdWlkLGdpZCx0cnVlKX0sZmNob3duKGZkLHVpZCxnaWQpe3ZhciBzdHJlYW09RlMuZ2V0U3RyZWFtQ2hlY2tlZChmZCk7RlMuY2hvd24oc3RyZWFtLm5vZGUsdWlkLGdpZCl9LHRydW5jYXRlKHBhdGgsbGVuKXtpZihsZW48MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXZhciBub2RlO2lmKHR5cGVvZiBwYXRoPT0ic3RyaW5nIil7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzp0cnVlfSk7bm9kZT1sb29rdXAubm9kZX1lbHNle25vZGU9cGF0aH1pZighbm9kZS5ub2RlX29wcy5zZXRhdHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNEaXIobm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzEpfWlmKCFGUy5pc0ZpbGUobm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXZhciBlcnJDb2RlPUZTLm5vZGVQZXJtaXNzaW9ucyhub2RlLCJ3Iik7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9bm9kZS5ub2RlX29wcy5zZXRhdHRyKG5vZGUse3NpemU6bGVuLHRpbWVzdGFtcDpEYXRlLm5vdygpfSl9LGZ0cnVuY2F0ZShmZCxsZW4pe3ZhciBzdHJlYW09RlMuZ2V0U3RyZWFtQ2hlY2tlZChmZCk7aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1GUy50cnVuY2F0ZShzdHJlYW0ubm9kZSxsZW4pfSx1dGltZShwYXRoLGF0aW1lLG10aW1lKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OnRydWV9KTt2YXIgbm9kZT1sb29rdXAubm9kZTtub2RlLm5vZGVfb3BzLnNldGF0dHIobm9kZSx7dGltZXN0YW1wOk1hdGgubWF4KGF0aW1lLG10aW1lKX0pfSxvcGVuKHBhdGgsZmxhZ3MsbW9kZSl7aWYocGF0aD09PSIiKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9ZmxhZ3M9dHlwZW9mIGZsYWdzPT0ic3RyaW5nIj9GU19tb2RlU3RyaW5nVG9GbGFncyhmbGFncyk6ZmxhZ3M7bW9kZT10eXBlb2YgbW9kZT09InVuZGVmaW5lZCI/NDM4Om1vZGU7aWYoZmxhZ3MmNjQpe21vZGU9bW9kZSY0MDk1fDMyNzY4fWVsc2V7bW9kZT0wfXZhciBub2RlO2lmKHR5cGVvZiBwYXRoPT0ib2JqZWN0Iil7bm9kZT1wYXRofWVsc2V7cGF0aD1QQVRILm5vcm1hbGl6ZShwYXRoKTt0cnl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohKGZsYWdzJjEzMTA3Mil9KTtub2RlPWxvb2t1cC5ub2RlfWNhdGNoKGUpe319dmFyIGNyZWF0ZWQ9ZmFsc2U7aWYoZmxhZ3MmNjQpe2lmKG5vZGUpe2lmKGZsYWdzJjEyOCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjApfX1lbHNle25vZGU9RlMubWtub2QocGF0aCxtb2RlLDApO2NyZWF0ZWQ9dHJ1ZX19aWYoIW5vZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1pZihGUy5pc0NocmRldihub2RlLm1vZGUpKXtmbGFncyY9fjUxMn1pZihmbGFncyY2NTUzNiYmIUZTLmlzRGlyKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU0KX1pZighY3JlYXRlZCl7dmFyIGVyckNvZGU9RlMubWF5T3Blbihub2RlLGZsYWdzKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX19aWYoZmxhZ3MmNTEyJiYhY3JlYXRlZCl7RlMudHJ1bmNhdGUobm9kZSwwKX1mbGFncyY9figxMjh8NTEyfDEzMTA3Mik7dmFyIHN0cmVhbT1GUy5jcmVhdGVTdHJlYW0oe25vZGU6bm9kZSxwYXRoOkZTLmdldFBhdGgobm9kZSksZmxhZ3M6ZmxhZ3Msc2Vla2FibGU6dHJ1ZSxwb3NpdGlvbjowLHN0cmVhbV9vcHM6bm9kZS5zdHJlYW1fb3BzLHVuZ290dGVuOltdLGVycm9yOmZhbHNlfSk7aWYoc3RyZWFtLnN0cmVhbV9vcHMub3Blbil7c3RyZWFtLnN0cmVhbV9vcHMub3BlbihzdHJlYW0pfWlmKE1vZHVsZVsibG9nUmVhZEZpbGVzIl0mJiEoZmxhZ3MmMSkpe2lmKCFGUy5yZWFkRmlsZXMpRlMucmVhZEZpbGVzPXt9O2lmKCEocGF0aCBpbiBGUy5yZWFkRmlsZXMpKXtGUy5yZWFkRmlsZXNbcGF0aF09MX19cmV0dXJuIHN0cmVhbX0sY2xvc2Uoc3RyZWFtKXtpZihGUy5pc0Nsb3NlZChzdHJlYW0pKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZihzdHJlYW0uZ2V0ZGVudHMpc3RyZWFtLmdldGRlbnRzPW51bGw7dHJ5e2lmKHN0cmVhbS5zdHJlYW1fb3BzLmNsb3NlKXtzdHJlYW0uc3RyZWFtX29wcy5jbG9zZShzdHJlYW0pfX1jYXRjaChlKXt0aHJvdyBlfWZpbmFsbHl7RlMuY2xvc2VTdHJlYW0oc3RyZWFtLmZkKX1zdHJlYW0uZmQ9bnVsbH0saXNDbG9zZWQoc3RyZWFtKXtyZXR1cm4gc3RyZWFtLmZkPT09bnVsbH0sbGxzZWVrKHN0cmVhbSxvZmZzZXQsd2hlbmNlKXtpZihGUy5pc0Nsb3NlZChzdHJlYW0pKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZighc3RyZWFtLnNlZWthYmxlfHwhc3RyZWFtLnN0cmVhbV9vcHMubGxzZWVrKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig3MCl9aWYod2hlbmNlIT0wJiZ3aGVuY2UhPTEmJndoZW5jZSE9Mil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXN0cmVhbS5wb3NpdGlvbj1zdHJlYW0uc3RyZWFtX29wcy5sbHNlZWsoc3RyZWFtLG9mZnNldCx3aGVuY2UpO3N0cmVhbS51bmdvdHRlbj1bXTtyZXR1cm4gc3RyZWFtLnBvc2l0aW9ufSxyZWFkKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbil7aWYobGVuZ3RoPDB8fHBvc2l0aW9uPDApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZihGUy5pc0Nsb3NlZChzdHJlYW0pKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZigoc3RyZWFtLmZsYWdzJjIwOTcxNTUpPT09MSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoRlMuaXNEaXIoc3RyZWFtLm5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDMxKX1pZighc3RyZWFtLnN0cmVhbV9vcHMucmVhZCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXZhciBzZWVraW5nPXR5cGVvZiBwb3NpdGlvbiE9InVuZGVmaW5lZCI7aWYoIXNlZWtpbmcpe3Bvc2l0aW9uPXN0cmVhbS5wb3NpdGlvbn1lbHNlIGlmKCFzdHJlYW0uc2Vla2FibGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDcwKX12YXIgYnl0ZXNSZWFkPXN0cmVhbS5zdHJlYW1fb3BzLnJlYWQoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uKTtpZighc2Vla2luZylzdHJlYW0ucG9zaXRpb24rPWJ5dGVzUmVhZDtyZXR1cm4gYnl0ZXNSZWFkfSx3cml0ZShzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24sY2FuT3duKXtpZihsZW5ndGg8MHx8cG9zaXRpb248MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfWlmKEZTLmlzQ2xvc2VkKHN0cmVhbSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKChzdHJlYW0uZmxhZ3MmMjA5NzE1NSk9PT0wKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZihGUy5pc0RpcihzdHJlYW0ubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzEpfWlmKCFzdHJlYW0uc3RyZWFtX29wcy53cml0ZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfWlmKHN0cmVhbS5zZWVrYWJsZSYmc3RyZWFtLmZsYWdzJjEwMjQpe0ZTLmxsc2VlayhzdHJlYW0sMCwyKX12YXIgc2Vla2luZz10eXBlb2YgcG9zaXRpb24hPSJ1bmRlZmluZWQiO2lmKCFzZWVraW5nKXtwb3NpdGlvbj1zdHJlYW0ucG9zaXRpb259ZWxzZSBpZighc3RyZWFtLnNlZWthYmxlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig3MCl9dmFyIGJ5dGVzV3JpdHRlbj1zdHJlYW0uc3RyZWFtX29wcy53cml0ZShzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24sY2FuT3duKTtpZighc2Vla2luZylzdHJlYW0ucG9zaXRpb24rPWJ5dGVzV3JpdHRlbjtyZXR1cm4gYnl0ZXNXcml0dGVufSxhbGxvY2F0ZShzdHJlYW0sb2Zmc2V0LGxlbmd0aCl7aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYob2Zmc2V0PDB8fGxlbmd0aDw9MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfWlmKChzdHJlYW0uZmxhZ3MmMjA5NzE1NSk9PT0wKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZighRlMuaXNGaWxlKHN0cmVhbS5ub2RlLm1vZGUpJiYhRlMuaXNEaXIoc3RyZWFtLm5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQzKX1pZighc3RyZWFtLnN0cmVhbV9vcHMuYWxsb2NhdGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDEzOCl9c3RyZWFtLnN0cmVhbV9vcHMuYWxsb2NhdGUoc3RyZWFtLG9mZnNldCxsZW5ndGgpfSxtbWFwKHN0cmVhbSxsZW5ndGgscG9zaXRpb24scHJvdCxmbGFncyl7aWYoKHByb3QmMikhPT0wJiYoZmxhZ3MmMik9PT0wJiYoc3RyZWFtLmZsYWdzJjIwOTcxNTUpIT09Mil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMil9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTEpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDIpfWlmKCFzdHJlYW0uc3RyZWFtX29wcy5tbWFwKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9cmV0dXJuIHN0cmVhbS5zdHJlYW1fb3BzLm1tYXAoc3RyZWFtLGxlbmd0aCxwb3NpdGlvbixwcm90LGZsYWdzKX0sbXN5bmMoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLG1tYXBGbGFncyl7aWYoIXN0cmVhbS5zdHJlYW1fb3BzLm1zeW5jKXtyZXR1cm4gMH1yZXR1cm4gc3RyZWFtLnN0cmVhbV9vcHMubXN5bmMoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLG1tYXBGbGFncyl9LG11bm1hcDpzdHJlYW09PjAsaW9jdGwoc3RyZWFtLGNtZCxhcmcpe2lmKCFzdHJlYW0uc3RyZWFtX29wcy5pb2N0bCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTkpfXJldHVybiBzdHJlYW0uc3RyZWFtX29wcy5pb2N0bChzdHJlYW0sY21kLGFyZyl9LHJlYWRGaWxlKHBhdGgsb3B0cz17fSl7b3B0cy5mbGFncz1vcHRzLmZsYWdzfHwwO29wdHMuZW5jb2Rpbmc9b3B0cy5lbmNvZGluZ3x8ImJpbmFyeSI7aWYob3B0cy5lbmNvZGluZyE9PSJ1dGY4IiYmb3B0cy5lbmNvZGluZyE9PSJiaW5hcnkiKXt0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZW5jb2RpbmcgdHlwZSAiJHtvcHRzLmVuY29kaW5nfSJgKX12YXIgcmV0O3ZhciBzdHJlYW09RlMub3BlbihwYXRoLG9wdHMuZmxhZ3MpO3ZhciBzdGF0PUZTLnN0YXQocGF0aCk7dmFyIGxlbmd0aD1zdGF0LnNpemU7dmFyIGJ1Zj1uZXcgVWludDhBcnJheShsZW5ndGgpO0ZTLnJlYWQoc3RyZWFtLGJ1ZiwwLGxlbmd0aCwwKTtpZihvcHRzLmVuY29kaW5nPT09InV0ZjgiKXtyZXQ9VVRGOEFycmF5VG9TdHJpbmcoYnVmLDApfWVsc2UgaWYob3B0cy5lbmNvZGluZz09PSJiaW5hcnkiKXtyZXQ9YnVmfUZTLmNsb3NlKHN0cmVhbSk7cmV0dXJuIHJldH0sd3JpdGVGaWxlKHBhdGgsZGF0YSxvcHRzPXt9KXtvcHRzLmZsYWdzPW9wdHMuZmxhZ3N8fDU3Nzt2YXIgc3RyZWFtPUZTLm9wZW4ocGF0aCxvcHRzLmZsYWdzLG9wdHMubW9kZSk7aWYodHlwZW9mIGRhdGE9PSJzdHJpbmciKXt2YXIgYnVmPW5ldyBVaW50OEFycmF5KGxlbmd0aEJ5dGVzVVRGOChkYXRhKSsxKTt2YXIgYWN0dWFsTnVtQnl0ZXM9c3RyaW5nVG9VVEY4QXJyYXkoZGF0YSxidWYsMCxidWYubGVuZ3RoKTtGUy53cml0ZShzdHJlYW0sYnVmLDAsYWN0dWFsTnVtQnl0ZXMsdW5kZWZpbmVkLG9wdHMuY2FuT3duKX1lbHNlIGlmKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSl7RlMud3JpdGUoc3RyZWFtLGRhdGEsMCxkYXRhLmJ5dGVMZW5ndGgsdW5kZWZpbmVkLG9wdHMuY2FuT3duKX1lbHNle3Rocm93IG5ldyBFcnJvcigiVW5zdXBwb3J0ZWQgZGF0YSB0eXBlIil9RlMuY2xvc2Uoc3RyZWFtKX0sY3dkOigpPT5GUy5jdXJyZW50UGF0aCxjaGRpcihwYXRoKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OnRydWV9KTtpZihsb29rdXAubm9kZT09PW51bGwpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1pZighRlMuaXNEaXIobG9va3VwLm5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU0KX12YXIgZXJyQ29kZT1GUy5ub2RlUGVybWlzc2lvbnMobG9va3VwLm5vZGUsIngiKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1GUy5jdXJyZW50UGF0aD1sb29rdXAucGF0aH0sY3JlYXRlRGVmYXVsdERpcmVjdG9yaWVzKCl7RlMubWtkaXIoIi90bXAiKTtGUy5ta2RpcigiL2hvbWUiKTtGUy5ta2RpcigiL2hvbWUvd2ViX3VzZXIiKX0sY3JlYXRlRGVmYXVsdERldmljZXMoKXtGUy5ta2RpcigiL2RldiIpO0ZTLnJlZ2lzdGVyRGV2aWNlKEZTLm1ha2VkZXYoMSwzKSx7cmVhZDooKT0+MCx3cml0ZTooc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvcyk9Pmxlbmd0aH0pO0ZTLm1rZGV2KCIvZGV2L251bGwiLEZTLm1ha2VkZXYoMSwzKSk7VFRZLnJlZ2lzdGVyKEZTLm1ha2VkZXYoNSwwKSxUVFkuZGVmYXVsdF90dHlfb3BzKTtUVFkucmVnaXN0ZXIoRlMubWFrZWRldig2LDApLFRUWS5kZWZhdWx0X3R0eTFfb3BzKTtGUy5ta2RldigiL2Rldi90dHkiLEZTLm1ha2VkZXYoNSwwKSk7RlMubWtkZXYoIi9kZXYvdHR5MSIsRlMubWFrZWRldig2LDApKTt2YXIgcmFuZG9tQnVmZmVyPW5ldyBVaW50OEFycmF5KDEwMjQpLHJhbmRvbUxlZnQ9MDt2YXIgcmFuZG9tQnl0ZT0oKT0+e2lmKHJhbmRvbUxlZnQ9PT0wKXtyYW5kb21MZWZ0PXJhbmRvbUZpbGwocmFuZG9tQnVmZmVyKS5ieXRlTGVuZ3RofXJldHVybiByYW5kb21CdWZmZXJbLS1yYW5kb21MZWZ0XX07RlMuY3JlYXRlRGV2aWNlKCIvZGV2IiwicmFuZG9tIixyYW5kb21CeXRlKTtGUy5jcmVhdGVEZXZpY2UoIi9kZXYiLCJ1cmFuZG9tIixyYW5kb21CeXRlKTtGUy5ta2RpcigiL2Rldi9zaG0iKTtGUy5ta2RpcigiL2Rldi9zaG0vdG1wIil9LGNyZWF0ZVNwZWNpYWxEaXJlY3Rvcmllcygpe0ZTLm1rZGlyKCIvcHJvYyIpO3ZhciBwcm9jX3NlbGY9RlMubWtkaXIoIi9wcm9jL3NlbGYiKTtGUy5ta2RpcigiL3Byb2Mvc2VsZi9mZCIpO0ZTLm1vdW50KHttb3VudCgpe3ZhciBub2RlPUZTLmNyZWF0ZU5vZGUocHJvY19zZWxmLCJmZCIsMTYzODR8NTExLDczKTtub2RlLm5vZGVfb3BzPXtsb29rdXAocGFyZW50LG5hbWUpe3ZhciBmZD0rbmFtZTt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbUNoZWNrZWQoZmQpO3ZhciByZXQ9e3BhcmVudDpudWxsLG1vdW50Onttb3VudHBvaW50OiJmYWtlIn0sbm9kZV9vcHM6e3JlYWRsaW5rOigpPT5zdHJlYW0ucGF0aH19O3JldC5wYXJlbnQ9cmV0O3JldHVybiByZXR9fTtyZXR1cm4gbm9kZX19LHt9LCIvcHJvYy9zZWxmL2ZkIil9LGNyZWF0ZVN0YW5kYXJkU3RyZWFtcygpe2lmKE1vZHVsZVsic3RkaW4iXSl7RlMuY3JlYXRlRGV2aWNlKCIvZGV2Iiwic3RkaW4iLE1vZHVsZVsic3RkaW4iXSl9ZWxzZXtGUy5zeW1saW5rKCIvZGV2L3R0eSIsIi9kZXYvc3RkaW4iKX1pZihNb2R1bGVbInN0ZG91dCJdKXtGUy5jcmVhdGVEZXZpY2UoIi9kZXYiLCJzdGRvdXQiLG51bGwsTW9kdWxlWyJzdGRvdXQiXSl9ZWxzZXtGUy5zeW1saW5rKCIvZGV2L3R0eSIsIi9kZXYvc3Rkb3V0Iil9aWYoTW9kdWxlWyJzdGRlcnIiXSl7RlMuY3JlYXRlRGV2aWNlKCIvZGV2Iiwic3RkZXJyIixudWxsLE1vZHVsZVsic3RkZXJyIl0pfWVsc2V7RlMuc3ltbGluaygiL2Rldi90dHkxIiwiL2Rldi9zdGRlcnIiKX12YXIgc3RkaW49RlMub3BlbigiL2Rldi9zdGRpbiIsMCk7dmFyIHN0ZG91dD1GUy5vcGVuKCIvZGV2L3N0ZG91dCIsMSk7dmFyIHN0ZGVycj1GUy5vcGVuKCIvZGV2L3N0ZGVyciIsMSl9LGVuc3VyZUVycm5vRXJyb3IoKXtpZihGUy5FcnJub0Vycm9yKXJldHVybjtGUy5FcnJub0Vycm9yPWZ1bmN0aW9uIEVycm5vRXJyb3IoZXJybm8sbm9kZSl7dGhpcy5uYW1lPSJFcnJub0Vycm9yIjt0aGlzLm5vZGU9bm9kZTt0aGlzLnNldEVycm5vPWZ1bmN0aW9uKGVycm5vKXt0aGlzLmVycm5vPWVycm5vfTt0aGlzLnNldEVycm5vKGVycm5vKTt0aGlzLm1lc3NhZ2U9IkZTIGVycm9yIn07RlMuRXJybm9FcnJvci5wcm90b3R5cGU9bmV3IEVycm9yO0ZTLkVycm5vRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yPUZTLkVycm5vRXJyb3I7WzQ0XS5mb3JFYWNoKGNvZGU9PntGUy5nZW5lcmljRXJyb3JzW2NvZGVdPW5ldyBGUy5FcnJub0Vycm9yKGNvZGUpO0ZTLmdlbmVyaWNFcnJvcnNbY29kZV0uc3RhY2s9IjxnZW5lcmljIGVycm9yLCBubyBzdGFjaz4ifSl9LHN0YXRpY0luaXQoKXtGUy5lbnN1cmVFcnJub0Vycm9yKCk7RlMubmFtZVRhYmxlPW5ldyBBcnJheSg0MDk2KTtGUy5tb3VudChNRU1GUyx7fSwiLyIpO0ZTLmNyZWF0ZURlZmF1bHREaXJlY3RvcmllcygpO0ZTLmNyZWF0ZURlZmF1bHREZXZpY2VzKCk7RlMuY3JlYXRlU3BlY2lhbERpcmVjdG9yaWVzKCk7RlMuZmlsZXN5c3RlbXM9eyJNRU1GUyI6TUVNRlN9fSxpbml0KGlucHV0LG91dHB1dCxlcnJvcil7RlMuaW5pdC5pbml0aWFsaXplZD10cnVlO0ZTLmVuc3VyZUVycm5vRXJyb3IoKTtNb2R1bGVbInN0ZGluIl09aW5wdXR8fE1vZHVsZVsic3RkaW4iXTtNb2R1bGVbInN0ZG91dCJdPW91dHB1dHx8TW9kdWxlWyJzdGRvdXQiXTtNb2R1bGVbInN0ZGVyciJdPWVycm9yfHxNb2R1bGVbInN0ZGVyciJdO0ZTLmNyZWF0ZVN0YW5kYXJkU3RyZWFtcygpfSxxdWl0KCl7RlMuaW5pdC5pbml0aWFsaXplZD1mYWxzZTtfZmZsdXNoKDApO2Zvcih2YXIgaT0wO2k8RlMuc3RyZWFtcy5sZW5ndGg7aSsrKXt2YXIgc3RyZWFtPUZTLnN0cmVhbXNbaV07aWYoIXN0cmVhbSl7Y29udGludWV9RlMuY2xvc2Uoc3RyZWFtKX19LGZpbmRPYmplY3QocGF0aCxkb250UmVzb2x2ZUxhc3RMaW5rKXt2YXIgcmV0PUZTLmFuYWx5emVQYXRoKHBhdGgsZG9udFJlc29sdmVMYXN0TGluayk7aWYoIXJldC5leGlzdHMpe3JldHVybiBudWxsfXJldHVybiByZXQub2JqZWN0fSxhbmFseXplUGF0aChwYXRoLGRvbnRSZXNvbHZlTGFzdExpbmspe3RyeXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250UmVzb2x2ZUxhc3RMaW5rfSk7cGF0aD1sb29rdXAucGF0aH1jYXRjaChlKXt9dmFyIHJldD17aXNSb290OmZhbHNlLGV4aXN0czpmYWxzZSxlcnJvcjowLG5hbWU6bnVsbCxwYXRoOm51bGwsb2JqZWN0Om51bGwscGFyZW50RXhpc3RzOmZhbHNlLHBhcmVudFBhdGg6bnVsbCxwYXJlbnRPYmplY3Q6bnVsbH07dHJ5e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtwYXJlbnQ6dHJ1ZX0pO3JldC5wYXJlbnRFeGlzdHM9dHJ1ZTtyZXQucGFyZW50UGF0aD1sb29rdXAucGF0aDtyZXQucGFyZW50T2JqZWN0PWxvb2t1cC5ub2RlO3JldC5uYW1lPVBBVEguYmFzZW5hbWUocGF0aCk7bG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250UmVzb2x2ZUxhc3RMaW5rfSk7cmV0LmV4aXN0cz10cnVlO3JldC5wYXRoPWxvb2t1cC5wYXRoO3JldC5vYmplY3Q9bG9va3VwLm5vZGU7cmV0Lm5hbWU9bG9va3VwLm5vZGUubmFtZTtyZXQuaXNSb290PWxvb2t1cC5wYXRoPT09Ii8ifWNhdGNoKGUpe3JldC5lcnJvcj1lLmVycm5vfXJldHVybiByZXR9LGNyZWF0ZVBhdGgocGFyZW50LHBhdGgsY2FuUmVhZCxjYW5Xcml0ZSl7cGFyZW50PXR5cGVvZiBwYXJlbnQ9PSJzdHJpbmciP3BhcmVudDpGUy5nZXRQYXRoKHBhcmVudCk7dmFyIHBhcnRzPXBhdGguc3BsaXQoIi8iKS5yZXZlcnNlKCk7d2hpbGUocGFydHMubGVuZ3RoKXt2YXIgcGFydD1wYXJ0cy5wb3AoKTtpZighcGFydCljb250aW51ZTt2YXIgY3VycmVudD1QQVRILmpvaW4yKHBhcmVudCxwYXJ0KTt0cnl7RlMubWtkaXIoY3VycmVudCl9Y2F0Y2goZSl7fXBhcmVudD1jdXJyZW50fXJldHVybiBjdXJyZW50fSxjcmVhdGVGaWxlKHBhcmVudCxuYW1lLHByb3BlcnRpZXMsY2FuUmVhZCxjYW5Xcml0ZSl7dmFyIHBhdGg9UEFUSC5qb2luMih0eXBlb2YgcGFyZW50PT0ic3RyaW5nIj9wYXJlbnQ6RlMuZ2V0UGF0aChwYXJlbnQpLG5hbWUpO3ZhciBtb2RlPUZTX2dldE1vZGUoY2FuUmVhZCxjYW5Xcml0ZSk7cmV0dXJuIEZTLmNyZWF0ZShwYXRoLG1vZGUpfSxjcmVhdGVEYXRhRmlsZShwYXJlbnQsbmFtZSxkYXRhLGNhblJlYWQsY2FuV3JpdGUsY2FuT3duKXt2YXIgcGF0aD1uYW1lO2lmKHBhcmVudCl7cGFyZW50PXR5cGVvZiBwYXJlbnQ9PSJzdHJpbmciP3BhcmVudDpGUy5nZXRQYXRoKHBhcmVudCk7cGF0aD1uYW1lP1BBVEguam9pbjIocGFyZW50LG5hbWUpOnBhcmVudH12YXIgbW9kZT1GU19nZXRNb2RlKGNhblJlYWQsY2FuV3JpdGUpO3ZhciBub2RlPUZTLmNyZWF0ZShwYXRoLG1vZGUpO2lmKGRhdGEpe2lmKHR5cGVvZiBkYXRhPT0ic3RyaW5nIil7dmFyIGFycj1uZXcgQXJyYXkoZGF0YS5sZW5ndGgpO2Zvcih2YXIgaT0wLGxlbj1kYXRhLmxlbmd0aDtpPGxlbjsrK2kpYXJyW2ldPWRhdGEuY2hhckNvZGVBdChpKTtkYXRhPWFycn1GUy5jaG1vZChub2RlLG1vZGV8MTQ2KTt2YXIgc3RyZWFtPUZTLm9wZW4obm9kZSw1NzcpO0ZTLndyaXRlKHN0cmVhbSxkYXRhLDAsZGF0YS5sZW5ndGgsMCxjYW5Pd24pO0ZTLmNsb3NlKHN0cmVhbSk7RlMuY2htb2Qobm9kZSxtb2RlKX19LGNyZWF0ZURldmljZShwYXJlbnQsbmFtZSxpbnB1dCxvdXRwdXQpe3ZhciBwYXRoPVBBVEguam9pbjIodHlwZW9mIHBhcmVudD09InN0cmluZyI/cGFyZW50OkZTLmdldFBhdGgocGFyZW50KSxuYW1lKTt2YXIgbW9kZT1GU19nZXRNb2RlKCEhaW5wdXQsISFvdXRwdXQpO2lmKCFGUy5jcmVhdGVEZXZpY2UubWFqb3IpRlMuY3JlYXRlRGV2aWNlLm1ham9yPTY0O3ZhciBkZXY9RlMubWFrZWRldihGUy5jcmVhdGVEZXZpY2UubWFqb3IrKywwKTtGUy5yZWdpc3RlckRldmljZShkZXYse29wZW4oc3RyZWFtKXtzdHJlYW0uc2Vla2FibGU9ZmFsc2V9LGNsb3NlKHN0cmVhbSl7aWYob3V0cHV0JiZvdXRwdXQuYnVmZmVyJiZvdXRwdXQuYnVmZmVyLmxlbmd0aCl7b3V0cHV0KDEwKX19LHJlYWQoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvcyl7dmFyIGJ5dGVzUmVhZD0wO2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7dmFyIHJlc3VsdDt0cnl7cmVzdWx0PWlucHV0KCl9Y2F0Y2goZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjkpfWlmKHJlc3VsdD09PXVuZGVmaW5lZCYmYnl0ZXNSZWFkPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNil9aWYocmVzdWx0PT09bnVsbHx8cmVzdWx0PT09dW5kZWZpbmVkKWJyZWFrO2J5dGVzUmVhZCsrO2J1ZmZlcltvZmZzZXQraV09cmVzdWx0fWlmKGJ5dGVzUmVhZCl7c3RyZWFtLm5vZGUudGltZXN0YW1wPURhdGUubm93KCl9cmV0dXJuIGJ5dGVzUmVhZH0sd3JpdGUoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvcyl7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXt0cnl7b3V0cHV0KGJ1ZmZlcltvZmZzZXQraV0pfWNhdGNoKGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI5KX19aWYobGVuZ3RoKXtzdHJlYW0ubm9kZS50aW1lc3RhbXA9RGF0ZS5ub3coKX1yZXR1cm4gaX19KTtyZXR1cm4gRlMubWtkZXYocGF0aCxtb2RlLGRldil9LGZvcmNlTG9hZEZpbGUob2JqKXtpZihvYmouaXNEZXZpY2V8fG9iai5pc0ZvbGRlcnx8b2JqLmxpbmt8fG9iai5jb250ZW50cylyZXR1cm4gdHJ1ZTtpZih0eXBlb2YgWE1MSHR0cFJlcXVlc3QhPSJ1bmRlZmluZWQiKXt0aHJvdyBuZXcgRXJyb3IoIkxhenkgbG9hZGluZyBzaG91bGQgaGF2ZSBiZWVuIHBlcmZvcm1lZCAoY29udGVudHMgc2V0KSBpbiBjcmVhdGVMYXp5RmlsZSwgYnV0IGl0IHdhcyBub3QuIExhenkgbG9hZGluZyBvbmx5IHdvcmtzIGluIHdlYiB3b3JrZXJzLiBVc2UgLS1lbWJlZC1maWxlIG9yIC0tcHJlbG9hZC1maWxlIGluIGVtY2Mgb24gdGhlIG1haW4gdGhyZWFkLiIpfWVsc2UgaWYocmVhZF8pe3RyeXtvYmouY29udGVudHM9aW50QXJyYXlGcm9tU3RyaW5nKHJlYWRfKG9iai51cmwpLHRydWUpO29iai51c2VkQnl0ZXM9b2JqLmNvbnRlbnRzLmxlbmd0aH1jYXRjaChlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOSl9fWVsc2V7dGhyb3cgbmV3IEVycm9yKCJDYW5ub3QgbG9hZCB3aXRob3V0IHJlYWQoKSBvciBYTUxIdHRwUmVxdWVzdC4iKX19LGNyZWF0ZUxhenlGaWxlKHBhcmVudCxuYW1lLHVybCxjYW5SZWFkLGNhbldyaXRlKXtmdW5jdGlvbiBMYXp5VWludDhBcnJheSgpe3RoaXMubGVuZ3RoS25vd249ZmFsc2U7dGhpcy5jaHVua3M9W119TGF6eVVpbnQ4QXJyYXkucHJvdG90eXBlLmdldD1mdW5jdGlvbiBMYXp5VWludDhBcnJheV9nZXQoaWR4KXtpZihpZHg+dGhpcy5sZW5ndGgtMXx8aWR4PDApe3JldHVybiB1bmRlZmluZWR9dmFyIGNodW5rT2Zmc2V0PWlkeCV0aGlzLmNodW5rU2l6ZTt2YXIgY2h1bmtOdW09aWR4L3RoaXMuY2h1bmtTaXplfDA7cmV0dXJuIHRoaXMuZ2V0dGVyKGNodW5rTnVtKVtjaHVua09mZnNldF19O0xhenlVaW50OEFycmF5LnByb3RvdHlwZS5zZXREYXRhR2V0dGVyPWZ1bmN0aW9uIExhenlVaW50OEFycmF5X3NldERhdGFHZXR0ZXIoZ2V0dGVyKXt0aGlzLmdldHRlcj1nZXR0ZXJ9O0xhenlVaW50OEFycmF5LnByb3RvdHlwZS5jYWNoZUxlbmd0aD1mdW5jdGlvbiBMYXp5VWludDhBcnJheV9jYWNoZUxlbmd0aCgpe3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJIRUFEIix1cmwsZmFsc2UpO3hoci5zZW5kKG51bGwpO2lmKCEoeGhyLnN0YXR1cz49MjAwJiZ4aHIuc3RhdHVzPDMwMHx8eGhyLnN0YXR1cz09PTMwNCkpdGhyb3cgbmV3IEVycm9yKCJDb3VsZG4ndCBsb2FkICIrdXJsKyIuIFN0YXR1czogIit4aHIuc3RhdHVzKTt2YXIgZGF0YWxlbmd0aD1OdW1iZXIoeGhyLmdldFJlc3BvbnNlSGVhZGVyKCJDb250ZW50LWxlbmd0aCIpKTt2YXIgaGVhZGVyO3ZhciBoYXNCeXRlU2VydmluZz0oaGVhZGVyPXhoci5nZXRSZXNwb25zZUhlYWRlcigiQWNjZXB0LVJhbmdlcyIpKSYmaGVhZGVyPT09ImJ5dGVzIjt2YXIgdXNlc0d6aXA9KGhlYWRlcj14aHIuZ2V0UmVzcG9uc2VIZWFkZXIoIkNvbnRlbnQtRW5jb2RpbmciKSkmJmhlYWRlcj09PSJnemlwIjt2YXIgY2h1bmtTaXplPTEwMjQqMTAyNDtpZighaGFzQnl0ZVNlcnZpbmcpY2h1bmtTaXplPWRhdGFsZW5ndGg7dmFyIGRvWEhSPShmcm9tLHRvKT0+e2lmKGZyb20+dG8pdGhyb3cgbmV3IEVycm9yKCJpbnZhbGlkIHJhbmdlICgiK2Zyb20rIiwgIit0bysiKSBvciBubyBieXRlcyByZXF1ZXN0ZWQhIik7aWYodG8+ZGF0YWxlbmd0aC0xKXRocm93IG5ldyBFcnJvcigib25seSAiK2RhdGFsZW5ndGgrIiBieXRlcyBhdmFpbGFibGUhIHByb2dyYW1tZXIgZXJyb3IhIik7dmFyIHhocj1uZXcgWE1MSHR0cFJlcXVlc3Q7eGhyLm9wZW4oIkdFVCIsdXJsLGZhbHNlKTtpZihkYXRhbGVuZ3RoIT09Y2h1bmtTaXplKXhoci5zZXRSZXF1ZXN0SGVhZGVyKCJSYW5nZSIsImJ5dGVzPSIrZnJvbSsiLSIrdG8pO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjtpZih4aHIub3ZlcnJpZGVNaW1lVHlwZSl7eGhyLm92ZXJyaWRlTWltZVR5cGUoInRleHQvcGxhaW47IGNoYXJzZXQ9eC11c2VyLWRlZmluZWQiKX14aHIuc2VuZChudWxsKTtpZighKHhoci5zdGF0dXM+PTIwMCYmeGhyLnN0YXR1czwzMDB8fHhoci5zdGF0dXM9PT0zMDQpKXRocm93IG5ldyBFcnJvcigiQ291bGRuJ3QgbG9hZCAiK3VybCsiLiBTdGF0dXM6ICIreGhyLnN0YXR1cyk7aWYoeGhyLnJlc3BvbnNlIT09dW5kZWZpbmVkKXtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlfHxbXSl9cmV0dXJuIGludEFycmF5RnJvbVN0cmluZyh4aHIucmVzcG9uc2VUZXh0fHwiIix0cnVlKX07dmFyIGxhenlBcnJheT10aGlzO2xhenlBcnJheS5zZXREYXRhR2V0dGVyKGNodW5rTnVtPT57dmFyIHN0YXJ0PWNodW5rTnVtKmNodW5rU2l6ZTt2YXIgZW5kPShjaHVua051bSsxKSpjaHVua1NpemUtMTtlbmQ9TWF0aC5taW4oZW5kLGRhdGFsZW5ndGgtMSk7aWYodHlwZW9mIGxhenlBcnJheS5jaHVua3NbY2h1bmtOdW1dPT0idW5kZWZpbmVkIil7bGF6eUFycmF5LmNodW5rc1tjaHVua051bV09ZG9YSFIoc3RhcnQsZW5kKX1pZih0eXBlb2YgbGF6eUFycmF5LmNodW5rc1tjaHVua051bV09PSJ1bmRlZmluZWQiKXRocm93IG5ldyBFcnJvcigiZG9YSFIgZmFpbGVkISIpO3JldHVybiBsYXp5QXJyYXkuY2h1bmtzW2NodW5rTnVtXX0pO2lmKHVzZXNHemlwfHwhZGF0YWxlbmd0aCl7Y2h1bmtTaXplPWRhdGFsZW5ndGg9MTtkYXRhbGVuZ3RoPXRoaXMuZ2V0dGVyKDApLmxlbmd0aDtjaHVua1NpemU9ZGF0YWxlbmd0aDtvdXQoIkxhenlGaWxlcyBvbiBnemlwIGZvcmNlcyBkb3dubG9hZCBvZiB0aGUgd2hvbGUgZmlsZSB3aGVuIGxlbmd0aCBpcyBhY2Nlc3NlZCIpfXRoaXMuX2xlbmd0aD1kYXRhbGVuZ3RoO3RoaXMuX2NodW5rU2l6ZT1jaHVua1NpemU7dGhpcy5sZW5ndGhLbm93bj10cnVlfTtpZih0eXBlb2YgWE1MSHR0cFJlcXVlc3QhPSJ1bmRlZmluZWQiKXtpZighRU5WSVJPTk1FTlRfSVNfV09SS0VSKXRocm93IkNhbm5vdCBkbyBzeW5jaHJvbm91cyBiaW5hcnkgWEhScyBvdXRzaWRlIHdlYndvcmtlcnMgaW4gbW9kZXJuIGJyb3dzZXJzLiBVc2UgLS1lbWJlZC1maWxlIG9yIC0tcHJlbG9hZC1maWxlIGluIGVtY2MiO3ZhciBsYXp5QXJyYXk9bmV3IExhenlVaW50OEFycmF5O09iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGxhenlBcnJheSx7bGVuZ3RoOntnZXQ6ZnVuY3Rpb24oKXtpZighdGhpcy5sZW5ndGhLbm93bil7dGhpcy5jYWNoZUxlbmd0aCgpfXJldHVybiB0aGlzLl9sZW5ndGh9fSxjaHVua1NpemU6e2dldDpmdW5jdGlvbigpe2lmKCF0aGlzLmxlbmd0aEtub3duKXt0aGlzLmNhY2hlTGVuZ3RoKCl9cmV0dXJuIHRoaXMuX2NodW5rU2l6ZX19fSk7dmFyIHByb3BlcnRpZXM9e2lzRGV2aWNlOmZhbHNlLGNvbnRlbnRzOmxhenlBcnJheX19ZWxzZXt2YXIgcHJvcGVydGllcz17aXNEZXZpY2U6ZmFsc2UsdXJsOnVybH19dmFyIG5vZGU9RlMuY3JlYXRlRmlsZShwYXJlbnQsbmFtZSxwcm9wZXJ0aWVzLGNhblJlYWQsY2FuV3JpdGUpO2lmKHByb3BlcnRpZXMuY29udGVudHMpe25vZGUuY29udGVudHM9cHJvcGVydGllcy5jb250ZW50c31lbHNlIGlmKHByb3BlcnRpZXMudXJsKXtub2RlLmNvbnRlbnRzPW51bGw7bm9kZS51cmw9cHJvcGVydGllcy51cmx9T2JqZWN0LmRlZmluZVByb3BlcnRpZXMobm9kZSx7dXNlZEJ5dGVzOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jb250ZW50cy5sZW5ndGh9fX0pO3ZhciBzdHJlYW1fb3BzPXt9O3ZhciBrZXlzPU9iamVjdC5rZXlzKG5vZGUuc3RyZWFtX29wcyk7a2V5cy5mb3JFYWNoKGtleT0+e3ZhciBmbj1ub2RlLnN0cmVhbV9vcHNba2V5XTtzdHJlYW1fb3BzW2tleV09ZnVuY3Rpb24gZm9yY2VMb2FkTGF6eUZpbGUoKXtGUy5mb3JjZUxvYWRGaWxlKG5vZGUpO3JldHVybiBmbi5hcHBseShudWxsLGFyZ3VtZW50cyl9fSk7ZnVuY3Rpb24gd3JpdGVDaHVua3Moc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uKXt2YXIgY29udGVudHM9c3RyZWFtLm5vZGUuY29udGVudHM7aWYocG9zaXRpb24+PWNvbnRlbnRzLmxlbmd0aClyZXR1cm4gMDt2YXIgc2l6ZT1NYXRoLm1pbihjb250ZW50cy5sZW5ndGgtcG9zaXRpb24sbGVuZ3RoKTtpZihjb250ZW50cy5zbGljZSl7Zm9yKHZhciBpPTA7aTxzaXplO2krKyl7YnVmZmVyW29mZnNldCtpXT1jb250ZW50c1twb3NpdGlvbitpXX19ZWxzZXtmb3IodmFyIGk9MDtpPHNpemU7aSsrKXtidWZmZXJbb2Zmc2V0K2ldPWNvbnRlbnRzLmdldChwb3NpdGlvbitpKX19cmV0dXJuIHNpemV9c3RyZWFtX29wcy5yZWFkPShzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24pPT57RlMuZm9yY2VMb2FkRmlsZShub2RlKTtyZXR1cm4gd3JpdGVDaHVua3Moc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uKX07c3RyZWFtX29wcy5tbWFwPShzdHJlYW0sbGVuZ3RoLHBvc2l0aW9uLHByb3QsZmxhZ3MpPT57RlMuZm9yY2VMb2FkRmlsZShub2RlKTt2YXIgcHRyPW1tYXBBbGxvYyhsZW5ndGgpO2lmKCFwdHIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ4KX13cml0ZUNodW5rcyhzdHJlYW0sSEVBUDgscHRyLGxlbmd0aCxwb3NpdGlvbik7cmV0dXJue3B0cjpwdHIsYWxsb2NhdGVkOnRydWV9fTtub2RlLnN0cmVhbV9vcHM9c3RyZWFtX29wcztyZXR1cm4gbm9kZX19O3ZhciBTWVNDQUxMUz17REVGQVVMVF9QT0xMTUFTSzo1LGNhbGN1bGF0ZUF0KGRpcmZkLHBhdGgsYWxsb3dFbXB0eSl7aWYoUEFUSC5pc0FicyhwYXRoKSl7cmV0dXJuIHBhdGh9dmFyIGRpcjtpZihkaXJmZD09PS0xMDApe2Rpcj1GUy5jd2QoKX1lbHNle3ZhciBkaXJzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGRpcmZkKTtkaXI9ZGlyc3RyZWFtLnBhdGh9aWYocGF0aC5sZW5ndGg9PTApe2lmKCFhbGxvd0VtcHR5KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9cmV0dXJuIGRpcn1yZXR1cm4gUEFUSC5qb2luMihkaXIscGF0aCl9LGRvU3RhdChmdW5jLHBhdGgsYnVmKXt0cnl7dmFyIHN0YXQ9ZnVuYyhwYXRoKX1jYXRjaChlKXtpZihlJiZlLm5vZGUmJlBBVEgubm9ybWFsaXplKHBhdGgpIT09UEFUSC5ub3JtYWxpemUoRlMuZ2V0UGF0aChlLm5vZGUpKSl7cmV0dXJuLTU0fXRocm93IGV9SEVBUDMyW2J1Zj4+Ml09c3RhdC5kZXY7SEVBUDMyW2J1Zis0Pj4yXT1zdGF0Lm1vZGU7SEVBUFUzMltidWYrOD4+Ml09c3RhdC5ubGluaztIRUFQMzJbYnVmKzEyPj4yXT1zdGF0LnVpZDtIRUFQMzJbYnVmKzE2Pj4yXT1zdGF0LmdpZDtIRUFQMzJbYnVmKzIwPj4yXT1zdGF0LnJkZXY7dGVtcEk2ND1bc3RhdC5zaXplPj4+MCwodGVtcERvdWJsZT1zdGF0LnNpemUsK01hdGguYWJzKHRlbXBEb3VibGUpPj0xP3RlbXBEb3VibGU+MD8rTWF0aC5mbG9vcih0ZW1wRG91YmxlLzQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKHRlbXBEb3VibGUtKyh+fnRlbXBEb3VibGU+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApXSxIRUFQMzJbYnVmKzI0Pj4yXT10ZW1wSTY0WzBdLEhFQVAzMltidWYrMjg+PjJdPXRlbXBJNjRbMV07SEVBUDMyW2J1ZiszMj4+Ml09NDA5NjtIRUFQMzJbYnVmKzM2Pj4yXT1zdGF0LmJsb2Nrczt2YXIgYXRpbWU9c3RhdC5hdGltZS5nZXRUaW1lKCk7dmFyIG10aW1lPXN0YXQubXRpbWUuZ2V0VGltZSgpO3ZhciBjdGltZT1zdGF0LmN0aW1lLmdldFRpbWUoKTt0ZW1wSTY0PVtNYXRoLmZsb29yKGF0aW1lLzFlMyk+Pj4wLCh0ZW1wRG91YmxlPU1hdGguZmxvb3IoYXRpbWUvMWUzKSwrTWF0aC5hYnModGVtcERvdWJsZSk+PTE/dGVtcERvdWJsZT4wPytNYXRoLmZsb29yKHRlbXBEb3VibGUvNDI5NDk2NzI5Nik+Pj4wOn5+K01hdGguY2VpbCgodGVtcERvdWJsZS0rKH5+dGVtcERvdWJsZT4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCldLEhFQVAzMltidWYrNDA+PjJdPXRlbXBJNjRbMF0sSEVBUDMyW2J1Zis0ND4+Ml09dGVtcEk2NFsxXTtIRUFQVTMyW2J1Zis0OD4+Ml09YXRpbWUlMWUzKjFlMzt0ZW1wSTY0PVtNYXRoLmZsb29yKG10aW1lLzFlMyk+Pj4wLCh0ZW1wRG91YmxlPU1hdGguZmxvb3IobXRpbWUvMWUzKSwrTWF0aC5hYnModGVtcERvdWJsZSk+PTE/dGVtcERvdWJsZT4wPytNYXRoLmZsb29yKHRlbXBEb3VibGUvNDI5NDk2NzI5Nik+Pj4wOn5+K01hdGguY2VpbCgodGVtcERvdWJsZS0rKH5+dGVtcERvdWJsZT4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCldLEhFQVAzMltidWYrNTY+PjJdPXRlbXBJNjRbMF0sSEVBUDMyW2J1Zis2MD4+Ml09dGVtcEk2NFsxXTtIRUFQVTMyW2J1Zis2ND4+Ml09bXRpbWUlMWUzKjFlMzt0ZW1wSTY0PVtNYXRoLmZsb29yKGN0aW1lLzFlMyk+Pj4wLCh0ZW1wRG91YmxlPU1hdGguZmxvb3IoY3RpbWUvMWUzKSwrTWF0aC5hYnModGVtcERvdWJsZSk+PTE/dGVtcERvdWJsZT4wPytNYXRoLmZsb29yKHRlbXBEb3VibGUvNDI5NDk2NzI5Nik+Pj4wOn5+K01hdGguY2VpbCgodGVtcERvdWJsZS0rKH5+dGVtcERvdWJsZT4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCldLEhFQVAzMltidWYrNzI+PjJdPXRlbXBJNjRbMF0sSEVBUDMyW2J1Zis3Nj4+Ml09dGVtcEk2NFsxXTtIRUFQVTMyW2J1Zis4MD4+Ml09Y3RpbWUlMWUzKjFlMzt0ZW1wSTY0PVtzdGF0Lmlubz4+PjAsKHRlbXBEb3VibGU9c3RhdC5pbm8sK01hdGguYWJzKHRlbXBEb3VibGUpPj0xP3RlbXBEb3VibGU+MD8rTWF0aC5mbG9vcih0ZW1wRG91YmxlLzQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKHRlbXBEb3VibGUtKyh+fnRlbXBEb3VibGU+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApXSxIRUFQMzJbYnVmKzg4Pj4yXT10ZW1wSTY0WzBdLEhFQVAzMltidWYrOTI+PjJdPXRlbXBJNjRbMV07cmV0dXJuIDB9LGRvTXN5bmMoYWRkcixzdHJlYW0sbGVuLGZsYWdzLG9mZnNldCl7aWYoIUZTLmlzRmlsZShzdHJlYW0ubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfWlmKGZsYWdzJjIpe3JldHVybiAwfXZhciBidWZmZXI9SEVBUFU4LnNsaWNlKGFkZHIsYWRkcitsZW4pO0ZTLm1zeW5jKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbixmbGFncyl9LHZhcmFyZ3M6dW5kZWZpbmVkLGdldCgpe3ZhciByZXQ9SEVBUDMyWytTWVNDQUxMUy52YXJhcmdzPj4yXTtTWVNDQUxMUy52YXJhcmdzKz00O3JldHVybiByZXR9LGdldHAoKXtyZXR1cm4gU1lTQ0FMTFMuZ2V0KCl9LGdldFN0cihwdHIpe3ZhciByZXQ9VVRGOFRvU3RyaW5nKHB0cik7cmV0dXJuIHJldH0sZ2V0U3RyZWFtRnJvbUZEKGZkKXt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbUNoZWNrZWQoZmQpO3JldHVybiBzdHJlYW19fTtmdW5jdGlvbiBfX19zeXNjYWxsX2ZzdGF0NjQoZmQsYnVmKXt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3JldHVybiBTWVNDQUxMUy5kb1N0YXQoRlMuc3RhdCxzdHJlYW0ucGF0aCxidWYpfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZS5uYW1lPT09IkVycm5vRXJyb3IiKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX12YXIgY29udmVydEkzMlBhaXJUb0k1M0NoZWNrZWQ9KGxvLGhpKT0+aGkrMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWxvPyhsbz4+PjApK2hpKjQyOTQ5NjcyOTY6TmFOO2Z1bmN0aW9uIF9fX3N5c2NhbGxfZnRydW5jYXRlNjQoZmQsbGVuZ3RoX2xvdyxsZW5ndGhfaGlnaCl7dmFyIGxlbmd0aD1jb252ZXJ0STMyUGFpclRvSTUzQ2hlY2tlZChsZW5ndGhfbG93LGxlbmd0aF9oaWdoKTt0cnl7aWYoaXNOYU4obGVuZ3RoKSlyZXR1cm4gNjE7RlMuZnRydW5jYXRlKGZkLGxlbmd0aCk7cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlLm5hbWU9PT0iRXJybm9FcnJvciIpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfbmV3ZnN0YXRhdChkaXJmZCxwYXRoLGJ1ZixmbGFncyl7dHJ5e3BhdGg9U1lTQ0FMTFMuZ2V0U3RyKHBhdGgpO3ZhciBub2ZvbGxvdz1mbGFncyYyNTY7dmFyIGFsbG93RW1wdHk9ZmxhZ3MmNDA5NjtmbGFncz1mbGFncyZ+NjQwMDtwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KGRpcmZkLHBhdGgsYWxsb3dFbXB0eSk7cmV0dXJuIFNZU0NBTExTLmRvU3RhdChub2ZvbGxvdz9GUy5sc3RhdDpGUy5zdGF0LHBhdGgsYnVmKX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUubmFtZT09PSJFcnJub0Vycm9yIikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9vcGVuYXQoZGlyZmQscGF0aCxmbGFncyx2YXJhcmdzKXtTWVNDQUxMUy52YXJhcmdzPXZhcmFyZ3M7dHJ5e3BhdGg9U1lTQ0FMTFMuZ2V0U3RyKHBhdGgpO3BhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQoZGlyZmQscGF0aCk7dmFyIG1vZGU9dmFyYXJncz9TWVNDQUxMUy5nZXQoKTowO3JldHVybiBGUy5vcGVuKHBhdGgsZmxhZ3MsbW9kZSkuZmR9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlLm5hbWU9PT0iRXJybm9FcnJvciIpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fXZhciBzdHJpbmdUb1VURjg9KHN0cixvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKT0+c3RyaW5nVG9VVEY4QXJyYXkoc3RyLEhFQVBVOCxvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKTtmdW5jdGlvbiBfX19zeXNjYWxsX3JlYWRsaW5rYXQoZGlyZmQscGF0aCxidWYsYnVmc2l6ZSl7dHJ5e3BhdGg9U1lTQ0FMTFMuZ2V0U3RyKHBhdGgpO3BhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQoZGlyZmQscGF0aCk7aWYoYnVmc2l6ZTw9MClyZXR1cm4tMjg7dmFyIHJldD1GUy5yZWFkbGluayhwYXRoKTt2YXIgbGVuPU1hdGgubWluKGJ1ZnNpemUsbGVuZ3RoQnl0ZXNVVEY4KHJldCkpO3ZhciBlbmRDaGFyPUhFQVA4W2J1ZitsZW5dO3N0cmluZ1RvVVRGOChyZXQsYnVmLGJ1ZnNpemUrMSk7SEVBUDhbYnVmK2xlbl09ZW5kQ2hhcjtyZXR1cm4gbGVufWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZS5uYW1lPT09IkVycm5vRXJyb3IiKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX3JlbmFtZWF0KG9sZGRpcmZkLG9sZHBhdGgsbmV3ZGlyZmQsbmV3cGF0aCl7dHJ5e29sZHBhdGg9U1lTQ0FMTFMuZ2V0U3RyKG9sZHBhdGgpO25ld3BhdGg9U1lTQ0FMTFMuZ2V0U3RyKG5ld3BhdGgpO29sZHBhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQob2xkZGlyZmQsb2xkcGF0aCk7bmV3cGF0aD1TWVNDQUxMUy5jYWxjdWxhdGVBdChuZXdkaXJmZCxuZXdwYXRoKTtGUy5yZW5hbWUob2xkcGF0aCxuZXdwYXRoKTtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUubmFtZT09PSJFcnJub0Vycm9yIikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9zdGF0NjQocGF0aCxidWYpe3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtyZXR1cm4gU1lTQ0FMTFMuZG9TdGF0KEZTLnN0YXQscGF0aCxidWYpfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZS5uYW1lPT09IkVycm5vRXJyb3IiKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX3VubGlua2F0KGRpcmZkLHBhdGgsZmxhZ3Mpe3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KGRpcmZkLHBhdGgpO2lmKGZsYWdzPT09MCl7RlMudW5saW5rKHBhdGgpfWVsc2UgaWYoZmxhZ3M9PT01MTIpe0ZTLnJtZGlyKHBhdGgpfWVsc2V7YWJvcnQoIkludmFsaWQgZmxhZ3MgcGFzc2VkIHRvIHVubGlua2F0Iil9cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlLm5hbWU9PT0iRXJybm9FcnJvciIpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fXZhciBfX2VtYmluZF9yZWdpc3Rlcl9iaWdpbnQ9KHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKT0+e307dmFyIGVtYmluZF9pbml0X2NoYXJDb2Rlcz0oKT0+e3ZhciBjb2Rlcz1uZXcgQXJyYXkoMjU2KTtmb3IodmFyIGk9MDtpPDI1NjsrK2kpe2NvZGVzW2ldPVN0cmluZy5mcm9tQ2hhckNvZGUoaSl9ZW1iaW5kX2NoYXJDb2Rlcz1jb2Rlc307dmFyIGVtYmluZF9jaGFyQ29kZXM7dmFyIHJlYWRMYXRpbjFTdHJpbmc9cHRyPT57dmFyIHJldD0iIjt2YXIgYz1wdHI7d2hpbGUoSEVBUFU4W2NdKXtyZXQrPWVtYmluZF9jaGFyQ29kZXNbSEVBUFU4W2MrK11dfXJldHVybiByZXR9O3ZhciBhd2FpdGluZ0RlcGVuZGVuY2llcz17fTt2YXIgcmVnaXN0ZXJlZFR5cGVzPXt9O3ZhciB0eXBlRGVwZW5kZW5jaWVzPXt9O3ZhciBCaW5kaW5nRXJyb3I7dmFyIHRocm93QmluZGluZ0Vycm9yPW1lc3NhZ2U9Pnt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKG1lc3NhZ2UpfTt2YXIgSW50ZXJuYWxFcnJvcjt2YXIgdGhyb3dJbnRlcm5hbEVycm9yPW1lc3NhZ2U9Pnt0aHJvdyBuZXcgSW50ZXJuYWxFcnJvcihtZXNzYWdlKX07dmFyIHdoZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkPShteVR5cGVzLGRlcGVuZGVudFR5cGVzLGdldFR5cGVDb252ZXJ0ZXJzKT0+e215VHlwZXMuZm9yRWFjaChmdW5jdGlvbih0eXBlKXt0eXBlRGVwZW5kZW5jaWVzW3R5cGVdPWRlcGVuZGVudFR5cGVzfSk7ZnVuY3Rpb24gb25Db21wbGV0ZSh0eXBlQ29udmVydGVycyl7dmFyIG15VHlwZUNvbnZlcnRlcnM9Z2V0VHlwZUNvbnZlcnRlcnModHlwZUNvbnZlcnRlcnMpO2lmKG15VHlwZUNvbnZlcnRlcnMubGVuZ3RoIT09bXlUeXBlcy5sZW5ndGgpe3Rocm93SW50ZXJuYWxFcnJvcigiTWlzbWF0Y2hlZCB0eXBlIGNvbnZlcnRlciBjb3VudCIpfWZvcih2YXIgaT0wO2k8bXlUeXBlcy5sZW5ndGg7KytpKXtyZWdpc3RlclR5cGUobXlUeXBlc1tpXSxteVR5cGVDb252ZXJ0ZXJzW2ldKX19dmFyIHR5cGVDb252ZXJ0ZXJzPW5ldyBBcnJheShkZXBlbmRlbnRUeXBlcy5sZW5ndGgpO3ZhciB1bnJlZ2lzdGVyZWRUeXBlcz1bXTt2YXIgcmVnaXN0ZXJlZD0wO2RlcGVuZGVudFR5cGVzLmZvckVhY2goKGR0LGkpPT57aWYocmVnaXN0ZXJlZFR5cGVzLmhhc093blByb3BlcnR5KGR0KSl7dHlwZUNvbnZlcnRlcnNbaV09cmVnaXN0ZXJlZFR5cGVzW2R0XX1lbHNle3VucmVnaXN0ZXJlZFR5cGVzLnB1c2goZHQpO2lmKCFhd2FpdGluZ0RlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShkdCkpe2F3YWl0aW5nRGVwZW5kZW5jaWVzW2R0XT1bXX1hd2FpdGluZ0RlcGVuZGVuY2llc1tkdF0ucHVzaCgoKT0+e3R5cGVDb252ZXJ0ZXJzW2ldPXJlZ2lzdGVyZWRUeXBlc1tkdF07KytyZWdpc3RlcmVkO2lmKHJlZ2lzdGVyZWQ9PT11bnJlZ2lzdGVyZWRUeXBlcy5sZW5ndGgpe29uQ29tcGxldGUodHlwZUNvbnZlcnRlcnMpfX0pfX0pO2lmKDA9PT11bnJlZ2lzdGVyZWRUeXBlcy5sZW5ndGgpe29uQ29tcGxldGUodHlwZUNvbnZlcnRlcnMpfX07ZnVuY3Rpb24gc2hhcmVkUmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnM9e30pe3ZhciBuYW1lPXJlZ2lzdGVyZWRJbnN0YW5jZS5uYW1lO2lmKCFyYXdUeXBlKXt0aHJvd0JpbmRpbmdFcnJvcihgdHlwZSAiJHtuYW1lfSIgbXVzdCBoYXZlIGEgcG9zaXRpdmUgaW50ZWdlciB0eXBlaWQgcG9pbnRlcmApfWlmKHJlZ2lzdGVyZWRUeXBlcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7aWYob3B0aW9ucy5pZ25vcmVEdXBsaWNhdGVSZWdpc3RyYXRpb25zKXtyZXR1cm59ZWxzZXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHJlZ2lzdGVyIHR5cGUgJyR7bmFtZX0nIHR3aWNlYCl9fXJlZ2lzdGVyZWRUeXBlc1tyYXdUeXBlXT1yZWdpc3RlcmVkSW5zdGFuY2U7ZGVsZXRlIHR5cGVEZXBlbmRlbmNpZXNbcmF3VHlwZV07aWYoYXdhaXRpbmdEZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkocmF3VHlwZSkpe3ZhciBjYWxsYmFja3M9YXdhaXRpbmdEZXBlbmRlbmNpZXNbcmF3VHlwZV07ZGVsZXRlIGF3YWl0aW5nRGVwZW5kZW5jaWVzW3Jhd1R5cGVdO2NhbGxiYWNrcy5mb3JFYWNoKGNiPT5jYigpKX19ZnVuY3Rpb24gcmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnM9e30pe2lmKCEoImFyZ1BhY2tBZHZhbmNlImluIHJlZ2lzdGVyZWRJbnN0YW5jZSkpe3Rocm93IG5ldyBUeXBlRXJyb3IoInJlZ2lzdGVyVHlwZSByZWdpc3RlcmVkSW5zdGFuY2UgcmVxdWlyZXMgYXJnUGFja0FkdmFuY2UiKX1yZXR1cm4gc2hhcmVkUmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnMpfXZhciBHZW5lcmljV2lyZVR5cGVTaXplPTg7dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2w9KHJhd1R5cGUsbmFtZSx0cnVlVmFsdWUsZmFsc2VWYWx1ZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbih3dCl7cmV0dXJuISF3dH0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLG8pe3JldHVybiBvP3RydWVWYWx1ZTpmYWxzZVZhbHVlfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUFU4W3BvaW50ZXJdKX0sZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KX07dmFyIHNoYWxsb3dDb3B5SW50ZXJuYWxQb2ludGVyPW89Pih7Y291bnQ6by5jb3VudCxkZWxldGVTY2hlZHVsZWQ6by5kZWxldGVTY2hlZHVsZWQscHJlc2VydmVQb2ludGVyT25EZWxldGU6by5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSxwdHI6by5wdHIscHRyVHlwZTpvLnB0clR5cGUsc21hcnRQdHI6by5zbWFydFB0cixzbWFydFB0clR5cGU6by5zbWFydFB0clR5cGV9KTt2YXIgdGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkPW9iaj0+e2Z1bmN0aW9uIGdldEluc3RhbmNlVHlwZU5hbWUoaGFuZGxlKXtyZXR1cm4gaGFuZGxlLiQkLnB0clR5cGUucmVnaXN0ZXJlZENsYXNzLm5hbWV9dGhyb3dCaW5kaW5nRXJyb3IoZ2V0SW5zdGFuY2VUeXBlTmFtZShvYmopKyIgaW5zdGFuY2UgYWxyZWFkeSBkZWxldGVkIil9O3ZhciBmaW5hbGl6YXRpb25SZWdpc3RyeT1mYWxzZTt2YXIgZGV0YWNoRmluYWxpemVyPWhhbmRsZT0+e307dmFyIHJ1bkRlc3RydWN0b3I9JCQ9PntpZigkJC5zbWFydFB0cil7JCQuc21hcnRQdHJUeXBlLnJhd0Rlc3RydWN0b3IoJCQuc21hcnRQdHIpfWVsc2V7JCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3MucmF3RGVzdHJ1Y3RvcigkJC5wdHIpfX07dmFyIHJlbGVhc2VDbGFzc0hhbmRsZT0kJD0+eyQkLmNvdW50LnZhbHVlLT0xO3ZhciB0b0RlbGV0ZT0wPT09JCQuY291bnQudmFsdWU7aWYodG9EZWxldGUpe3J1bkRlc3RydWN0b3IoJCQpfX07dmFyIGRvd25jYXN0UG9pbnRlcj0ocHRyLHB0ckNsYXNzLGRlc2lyZWRDbGFzcyk9PntpZihwdHJDbGFzcz09PWRlc2lyZWRDbGFzcyl7cmV0dXJuIHB0cn1pZih1bmRlZmluZWQ9PT1kZXNpcmVkQ2xhc3MuYmFzZUNsYXNzKXtyZXR1cm4gbnVsbH12YXIgcnY9ZG93bmNhc3RQb2ludGVyKHB0cixwdHJDbGFzcyxkZXNpcmVkQ2xhc3MuYmFzZUNsYXNzKTtpZihydj09PW51bGwpe3JldHVybiBudWxsfXJldHVybiBkZXNpcmVkQ2xhc3MuZG93bmNhc3QocnYpfTt2YXIgcmVnaXN0ZXJlZFBvaW50ZXJzPXt9O3ZhciBnZXRJbmhlcml0ZWRJbnN0YW5jZUNvdW50PSgpPT5PYmplY3Qua2V5cyhyZWdpc3RlcmVkSW5zdGFuY2VzKS5sZW5ndGg7dmFyIGdldExpdmVJbmhlcml0ZWRJbnN0YW5jZXM9KCk9Pnt2YXIgcnY9W107Zm9yKHZhciBrIGluIHJlZ2lzdGVyZWRJbnN0YW5jZXMpe2lmKHJlZ2lzdGVyZWRJbnN0YW5jZXMuaGFzT3duUHJvcGVydHkoaykpe3J2LnB1c2gocmVnaXN0ZXJlZEluc3RhbmNlc1trXSl9fXJldHVybiBydn07dmFyIGRlbGV0aW9uUXVldWU9W107dmFyIGZsdXNoUGVuZGluZ0RlbGV0ZXM9KCk9Pnt3aGlsZShkZWxldGlvblF1ZXVlLmxlbmd0aCl7dmFyIG9iaj1kZWxldGlvblF1ZXVlLnBvcCgpO29iai4kJC5kZWxldGVTY2hlZHVsZWQ9ZmFsc2U7b2JqWyJkZWxldGUiXSgpfX07dmFyIGRlbGF5RnVuY3Rpb247dmFyIHNldERlbGF5RnVuY3Rpb249Zm49PntkZWxheUZ1bmN0aW9uPWZuO2lmKGRlbGV0aW9uUXVldWUubGVuZ3RoJiZkZWxheUZ1bmN0aW9uKXtkZWxheUZ1bmN0aW9uKGZsdXNoUGVuZGluZ0RlbGV0ZXMpfX07dmFyIGluaXRfZW1iaW5kPSgpPT57TW9kdWxlWyJnZXRJbmhlcml0ZWRJbnN0YW5jZUNvdW50Il09Z2V0SW5oZXJpdGVkSW5zdGFuY2VDb3VudDtNb2R1bGVbImdldExpdmVJbmhlcml0ZWRJbnN0YW5jZXMiXT1nZXRMaXZlSW5oZXJpdGVkSW5zdGFuY2VzO01vZHVsZVsiZmx1c2hQZW5kaW5nRGVsZXRlcyJdPWZsdXNoUGVuZGluZ0RlbGV0ZXM7TW9kdWxlWyJzZXREZWxheUZ1bmN0aW9uIl09c2V0RGVsYXlGdW5jdGlvbn07dmFyIHJlZ2lzdGVyZWRJbnN0YW5jZXM9e307dmFyIGdldEJhc2VzdFBvaW50ZXI9KGNsYXNzXyxwdHIpPT57aWYocHRyPT09dW5kZWZpbmVkKXt0aHJvd0JpbmRpbmdFcnJvcigicHRyIHNob3VsZCBub3QgYmUgdW5kZWZpbmVkIil9d2hpbGUoY2xhc3NfLmJhc2VDbGFzcyl7cHRyPWNsYXNzXy51cGNhc3QocHRyKTtjbGFzc189Y2xhc3NfLmJhc2VDbGFzc31yZXR1cm4gcHRyfTt2YXIgZ2V0SW5oZXJpdGVkSW5zdGFuY2U9KGNsYXNzXyxwdHIpPT57cHRyPWdldEJhc2VzdFBvaW50ZXIoY2xhc3NfLHB0cik7cmV0dXJuIHJlZ2lzdGVyZWRJbnN0YW5jZXNbcHRyXX07dmFyIG1ha2VDbGFzc0hhbmRsZT0ocHJvdG90eXBlLHJlY29yZCk9PntpZighcmVjb3JkLnB0clR5cGV8fCFyZWNvcmQucHRyKXt0aHJvd0ludGVybmFsRXJyb3IoIm1ha2VDbGFzc0hhbmRsZSByZXF1aXJlcyBwdHIgYW5kIHB0clR5cGUiKX12YXIgaGFzU21hcnRQdHJUeXBlPSEhcmVjb3JkLnNtYXJ0UHRyVHlwZTt2YXIgaGFzU21hcnRQdHI9ISFyZWNvcmQuc21hcnRQdHI7aWYoaGFzU21hcnRQdHJUeXBlIT09aGFzU21hcnRQdHIpe3Rocm93SW50ZXJuYWxFcnJvcigiQm90aCBzbWFydFB0clR5cGUgYW5kIHNtYXJ0UHRyIG11c3QgYmUgc3BlY2lmaWVkIil9cmVjb3JkLmNvdW50PXt2YWx1ZToxfTtyZXR1cm4gYXR0YWNoRmluYWxpemVyKE9iamVjdC5jcmVhdGUocHJvdG90eXBlLHskJDp7dmFsdWU6cmVjb3JkfX0pKX07ZnVuY3Rpb24gUmVnaXN0ZXJlZFBvaW50ZXJfZnJvbVdpcmVUeXBlKHB0cil7dmFyIHJhd1BvaW50ZXI9dGhpcy5nZXRQb2ludGVlKHB0cik7aWYoIXJhd1BvaW50ZXIpe3RoaXMuZGVzdHJ1Y3RvcihwdHIpO3JldHVybiBudWxsfXZhciByZWdpc3RlcmVkSW5zdGFuY2U9Z2V0SW5oZXJpdGVkSW5zdGFuY2UodGhpcy5yZWdpc3RlcmVkQ2xhc3MscmF3UG9pbnRlcik7aWYodW5kZWZpbmVkIT09cmVnaXN0ZXJlZEluc3RhbmNlKXtpZigwPT09cmVnaXN0ZXJlZEluc3RhbmNlLiQkLmNvdW50LnZhbHVlKXtyZWdpc3RlcmVkSW5zdGFuY2UuJCQucHRyPXJhd1BvaW50ZXI7cmVnaXN0ZXJlZEluc3RhbmNlLiQkLnNtYXJ0UHRyPXB0cjtyZXR1cm4gcmVnaXN0ZXJlZEluc3RhbmNlWyJjbG9uZSJdKCl9ZWxzZXt2YXIgcnY9cmVnaXN0ZXJlZEluc3RhbmNlWyJjbG9uZSJdKCk7dGhpcy5kZXN0cnVjdG9yKHB0cik7cmV0dXJuIHJ2fX1mdW5jdGlvbiBtYWtlRGVmYXVsdEhhbmRsZSgpe2lmKHRoaXMuaXNTbWFydFBvaW50ZXIpe3JldHVybiBtYWtlQ2xhc3NIYW5kbGUodGhpcy5yZWdpc3RlcmVkQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGUse3B0clR5cGU6dGhpcy5wb2ludGVlVHlwZSxwdHI6cmF3UG9pbnRlcixzbWFydFB0clR5cGU6dGhpcyxzbWFydFB0cjpwdHJ9KX1lbHNle3JldHVybiBtYWtlQ2xhc3NIYW5kbGUodGhpcy5yZWdpc3RlcmVkQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGUse3B0clR5cGU6dGhpcyxwdHI6cHRyfSl9fXZhciBhY3R1YWxUeXBlPXRoaXMucmVnaXN0ZXJlZENsYXNzLmdldEFjdHVhbFR5cGUocmF3UG9pbnRlcik7dmFyIHJlZ2lzdGVyZWRQb2ludGVyUmVjb3JkPXJlZ2lzdGVyZWRQb2ludGVyc1thY3R1YWxUeXBlXTtpZighcmVnaXN0ZXJlZFBvaW50ZXJSZWNvcmQpe3JldHVybiBtYWtlRGVmYXVsdEhhbmRsZS5jYWxsKHRoaXMpfXZhciB0b1R5cGU7aWYodGhpcy5pc0NvbnN0KXt0b1R5cGU9cmVnaXN0ZXJlZFBvaW50ZXJSZWNvcmQuY29uc3RQb2ludGVyVHlwZX1lbHNle3RvVHlwZT1yZWdpc3RlcmVkUG9pbnRlclJlY29yZC5wb2ludGVyVHlwZX12YXIgZHA9ZG93bmNhc3RQb2ludGVyKHJhd1BvaW50ZXIsdGhpcy5yZWdpc3RlcmVkQ2xhc3MsdG9UeXBlLnJlZ2lzdGVyZWRDbGFzcyk7aWYoZHA9PT1udWxsKXtyZXR1cm4gbWFrZURlZmF1bHRIYW5kbGUuY2FsbCh0aGlzKX1pZih0aGlzLmlzU21hcnRQb2ludGVyKXtyZXR1cm4gbWFrZUNsYXNzSGFuZGxlKHRvVHlwZS5yZWdpc3RlcmVkQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGUse3B0clR5cGU6dG9UeXBlLHB0cjpkcCxzbWFydFB0clR5cGU6dGhpcyxzbWFydFB0cjpwdHJ9KX1lbHNle3JldHVybiBtYWtlQ2xhc3NIYW5kbGUodG9UeXBlLnJlZ2lzdGVyZWRDbGFzcy5pbnN0YW5jZVByb3RvdHlwZSx7cHRyVHlwZTp0b1R5cGUscHRyOmRwfSl9fXZhciBhdHRhY2hGaW5hbGl6ZXI9aGFuZGxlPT57aWYoInVuZGVmaW5lZCI9PT10eXBlb2YgRmluYWxpemF0aW9uUmVnaXN0cnkpe2F0dGFjaEZpbmFsaXplcj1oYW5kbGU9PmhhbmRsZTtyZXR1cm4gaGFuZGxlfWZpbmFsaXphdGlvblJlZ2lzdHJ5PW5ldyBGaW5hbGl6YXRpb25SZWdpc3RyeShpbmZvPT57cmVsZWFzZUNsYXNzSGFuZGxlKGluZm8uJCQpfSk7YXR0YWNoRmluYWxpemVyPWhhbmRsZT0+e3ZhciAkJD1oYW5kbGUuJCQ7dmFyIGhhc1NtYXJ0UHRyPSEhJCQuc21hcnRQdHI7aWYoaGFzU21hcnRQdHIpe3ZhciBpbmZvPXskJDokJH07ZmluYWxpemF0aW9uUmVnaXN0cnkucmVnaXN0ZXIoaGFuZGxlLGluZm8saGFuZGxlKX1yZXR1cm4gaGFuZGxlfTtkZXRhY2hGaW5hbGl6ZXI9aGFuZGxlPT5maW5hbGl6YXRpb25SZWdpc3RyeS51bnJlZ2lzdGVyKGhhbmRsZSk7cmV0dXJuIGF0dGFjaEZpbmFsaXplcihoYW5kbGUpfTt2YXIgaW5pdF9DbGFzc0hhbmRsZT0oKT0+e09iamVjdC5hc3NpZ24oQ2xhc3NIYW5kbGUucHJvdG90eXBlLHsiaXNBbGlhc09mIihvdGhlcil7aWYoISh0aGlzIGluc3RhbmNlb2YgQ2xhc3NIYW5kbGUpKXtyZXR1cm4gZmFsc2V9aWYoIShvdGhlciBpbnN0YW5jZW9mIENsYXNzSGFuZGxlKSl7cmV0dXJuIGZhbHNlfXZhciBsZWZ0Q2xhc3M9dGhpcy4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgbGVmdD10aGlzLiQkLnB0cjtvdGhlci4kJD1vdGhlci4kJDt2YXIgcmlnaHRDbGFzcz1vdGhlci4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgcmlnaHQ9b3RoZXIuJCQucHRyO3doaWxlKGxlZnRDbGFzcy5iYXNlQ2xhc3Mpe2xlZnQ9bGVmdENsYXNzLnVwY2FzdChsZWZ0KTtsZWZ0Q2xhc3M9bGVmdENsYXNzLmJhc2VDbGFzc313aGlsZShyaWdodENsYXNzLmJhc2VDbGFzcyl7cmlnaHQ9cmlnaHRDbGFzcy51cGNhc3QocmlnaHQpO3JpZ2h0Q2xhc3M9cmlnaHRDbGFzcy5iYXNlQ2xhc3N9cmV0dXJuIGxlZnRDbGFzcz09PXJpZ2h0Q2xhc3MmJmxlZnQ9PT1yaWdodH0sImNsb25lIigpe2lmKCF0aGlzLiQkLnB0cil7dGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkKHRoaXMpfWlmKHRoaXMuJCQucHJlc2VydmVQb2ludGVyT25EZWxldGUpe3RoaXMuJCQuY291bnQudmFsdWUrPTE7cmV0dXJuIHRoaXN9ZWxzZXt2YXIgY2xvbmU9YXR0YWNoRmluYWxpemVyKE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLHskJDp7dmFsdWU6c2hhbGxvd0NvcHlJbnRlcm5hbFBvaW50ZXIodGhpcy4kJCl9fSkpO2Nsb25lLiQkLmNvdW50LnZhbHVlKz0xO2Nsb25lLiQkLmRlbGV0ZVNjaGVkdWxlZD1mYWxzZTtyZXR1cm4gY2xvbmV9fSwiZGVsZXRlIigpe2lmKCF0aGlzLiQkLnB0cil7dGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkKHRoaXMpfWlmKHRoaXMuJCQuZGVsZXRlU2NoZWR1bGVkJiYhdGhpcy4kJC5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSl7dGhyb3dCaW5kaW5nRXJyb3IoIk9iamVjdCBhbHJlYWR5IHNjaGVkdWxlZCBmb3IgZGVsZXRpb24iKX1kZXRhY2hGaW5hbGl6ZXIodGhpcyk7cmVsZWFzZUNsYXNzSGFuZGxlKHRoaXMuJCQpO2lmKCF0aGlzLiQkLnByZXNlcnZlUG9pbnRlck9uRGVsZXRlKXt0aGlzLiQkLnNtYXJ0UHRyPXVuZGVmaW5lZDt0aGlzLiQkLnB0cj11bmRlZmluZWR9fSwiaXNEZWxldGVkIigpe3JldHVybiF0aGlzLiQkLnB0cn0sImRlbGV0ZUxhdGVyIigpe2lmKCF0aGlzLiQkLnB0cil7dGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkKHRoaXMpfWlmKHRoaXMuJCQuZGVsZXRlU2NoZWR1bGVkJiYhdGhpcy4kJC5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSl7dGhyb3dCaW5kaW5nRXJyb3IoIk9iamVjdCBhbHJlYWR5IHNjaGVkdWxlZCBmb3IgZGVsZXRpb24iKX1kZWxldGlvblF1ZXVlLnB1c2godGhpcyk7aWYoZGVsZXRpb25RdWV1ZS5sZW5ndGg9PT0xJiZkZWxheUZ1bmN0aW9uKXtkZWxheUZ1bmN0aW9uKGZsdXNoUGVuZGluZ0RlbGV0ZXMpfXRoaXMuJCQuZGVsZXRlU2NoZWR1bGVkPXRydWU7cmV0dXJuIHRoaXN9fSl9O2Z1bmN0aW9uIENsYXNzSGFuZGxlKCl7fXZhciBjcmVhdGVOYW1lZEZ1bmN0aW9uPShuYW1lLGJvZHkpPT5PYmplY3QuZGVmaW5lUHJvcGVydHkoYm9keSwibmFtZSIse3ZhbHVlOm5hbWV9KTt2YXIgZW5zdXJlT3ZlcmxvYWRUYWJsZT0ocHJvdG8sbWV0aG9kTmFtZSxodW1hbk5hbWUpPT57aWYodW5kZWZpbmVkPT09cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZSl7dmFyIHByZXZGdW5jPXByb3RvW21ldGhvZE5hbWVdO3Byb3RvW21ldGhvZE5hbWVdPWZ1bmN0aW9uKCl7aWYoIXByb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGUuaGFzT3duUHJvcGVydHkoYXJndW1lbnRzLmxlbmd0aCkpe3Rocm93QmluZGluZ0Vycm9yKGBGdW5jdGlvbiAnJHtodW1hbk5hbWV9JyBjYWxsZWQgd2l0aCBhbiBpbnZhbGlkIG51bWJlciBvZiBhcmd1bWVudHMgKCR7YXJndW1lbnRzLmxlbmd0aH0pIC0gZXhwZWN0cyBvbmUgb2YgKCR7cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZX0pIWApfXJldHVybiBwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlW2FyZ3VtZW50cy5sZW5ndGhdLmFwcGx5KHRoaXMsYXJndW1lbnRzKX07cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZT1bXTtwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlW3ByZXZGdW5jLmFyZ0NvdW50XT1wcmV2RnVuY319O3ZhciBleHBvc2VQdWJsaWNTeW1ib2w9KG5hbWUsdmFsdWUsbnVtQXJndW1lbnRzKT0+e2lmKE1vZHVsZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSl7aWYodW5kZWZpbmVkPT09bnVtQXJndW1lbnRzfHx1bmRlZmluZWQhPT1Nb2R1bGVbbmFtZV0ub3ZlcmxvYWRUYWJsZSYmdW5kZWZpbmVkIT09TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGVbbnVtQXJndW1lbnRzXSl7dGhyb3dCaW5kaW5nRXJyb3IoYENhbm5vdCByZWdpc3RlciBwdWJsaWMgbmFtZSAnJHtuYW1lfScgdHdpY2VgKX1lbnN1cmVPdmVybG9hZFRhYmxlKE1vZHVsZSxuYW1lLG5hbWUpO2lmKE1vZHVsZS5oYXNPd25Qcm9wZXJ0eShudW1Bcmd1bWVudHMpKXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHJlZ2lzdGVyIG11bHRpcGxlIG92ZXJsb2FkcyBvZiBhIGZ1bmN0aW9uIHdpdGggdGhlIHNhbWUgbnVtYmVyIG9mIGFyZ3VtZW50cyAoJHtudW1Bcmd1bWVudHN9KSFgKX1Nb2R1bGVbbmFtZV0ub3ZlcmxvYWRUYWJsZVtudW1Bcmd1bWVudHNdPXZhbHVlfWVsc2V7TW9kdWxlW25hbWVdPXZhbHVlO2lmKHVuZGVmaW5lZCE9PW51bUFyZ3VtZW50cyl7TW9kdWxlW25hbWVdLm51bUFyZ3VtZW50cz1udW1Bcmd1bWVudHN9fX07dmFyIGNoYXJfMD00ODt2YXIgY2hhcl85PTU3O3ZhciBtYWtlTGVnYWxGdW5jdGlvbk5hbWU9bmFtZT0+e2lmKHVuZGVmaW5lZD09PW5hbWUpe3JldHVybiJfdW5rbm93biJ9bmFtZT1uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05X10vZywiJCIpO3ZhciBmPW5hbWUuY2hhckNvZGVBdCgwKTtpZihmPj1jaGFyXzAmJmY8PWNoYXJfOSl7cmV0dXJuYF8ke25hbWV9YH1yZXR1cm4gbmFtZX07ZnVuY3Rpb24gUmVnaXN0ZXJlZENsYXNzKG5hbWUsY29uc3RydWN0b3IsaW5zdGFuY2VQcm90b3R5cGUscmF3RGVzdHJ1Y3RvcixiYXNlQ2xhc3MsZ2V0QWN0dWFsVHlwZSx1cGNhc3QsZG93bmNhc3Qpe3RoaXMubmFtZT1uYW1lO3RoaXMuY29uc3RydWN0b3I9Y29uc3RydWN0b3I7dGhpcy5pbnN0YW5jZVByb3RvdHlwZT1pbnN0YW5jZVByb3RvdHlwZTt0aGlzLnJhd0Rlc3RydWN0b3I9cmF3RGVzdHJ1Y3Rvcjt0aGlzLmJhc2VDbGFzcz1iYXNlQ2xhc3M7dGhpcy5nZXRBY3R1YWxUeXBlPWdldEFjdHVhbFR5cGU7dGhpcy51cGNhc3Q9dXBjYXN0O3RoaXMuZG93bmNhc3Q9ZG93bmNhc3Q7dGhpcy5wdXJlVmlydHVhbEZ1bmN0aW9ucz1bXX12YXIgdXBjYXN0UG9pbnRlcj0ocHRyLHB0ckNsYXNzLGRlc2lyZWRDbGFzcyk9Pnt3aGlsZShwdHJDbGFzcyE9PWRlc2lyZWRDbGFzcyl7aWYoIXB0ckNsYXNzLnVwY2FzdCl7dGhyb3dCaW5kaW5nRXJyb3IoYEV4cGVjdGVkIG51bGwgb3IgaW5zdGFuY2Ugb2YgJHtkZXNpcmVkQ2xhc3MubmFtZX0sIGdvdCBhbiBpbnN0YW5jZSBvZiAke3B0ckNsYXNzLm5hbWV9YCl9cHRyPXB0ckNsYXNzLnVwY2FzdChwdHIpO3B0ckNsYXNzPXB0ckNsYXNzLmJhc2VDbGFzc31yZXR1cm4gcHRyfTtmdW5jdGlvbiBjb25zdE5vU21hcnRQdHJSYXdQb2ludGVyVG9XaXJlVHlwZShkZXN0cnVjdG9ycyxoYW5kbGUpe2lmKGhhbmRsZT09PW51bGwpe2lmKHRoaXMuaXNSZWZlcmVuY2Upe3Rocm93QmluZGluZ0Vycm9yKGBudWxsIGlzIG5vdCBhIHZhbGlkICR7dGhpcy5uYW1lfWApfXJldHVybiAwfWlmKCFoYW5kbGUuJCQpe3Rocm93QmluZGluZ0Vycm9yKGBDYW5ub3QgcGFzcyAiJHtlbWJpbmRSZXByKGhhbmRsZSl9IiBhcyBhICR7dGhpcy5uYW1lfWApfWlmKCFoYW5kbGUuJCQucHRyKXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHBhc3MgZGVsZXRlZCBvYmplY3QgYXMgYSBwb2ludGVyIG9mIHR5cGUgJHt0aGlzLm5hbWV9YCl9dmFyIGhhbmRsZUNsYXNzPWhhbmRsZS4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgcHRyPXVwY2FzdFBvaW50ZXIoaGFuZGxlLiQkLnB0cixoYW5kbGVDbGFzcyx0aGlzLnJlZ2lzdGVyZWRDbGFzcyk7cmV0dXJuIHB0cn1mdW5jdGlvbiBnZW5lcmljUG9pbnRlclRvV2lyZVR5cGUoZGVzdHJ1Y3RvcnMsaGFuZGxlKXt2YXIgcHRyO2lmKGhhbmRsZT09PW51bGwpe2lmKHRoaXMuaXNSZWZlcmVuY2Upe3Rocm93QmluZGluZ0Vycm9yKGBudWxsIGlzIG5vdCBhIHZhbGlkICR7dGhpcy5uYW1lfWApfWlmKHRoaXMuaXNTbWFydFBvaW50ZXIpe3B0cj10aGlzLnJhd0NvbnN0cnVjdG9yKCk7aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKHRoaXMucmF3RGVzdHJ1Y3RvcixwdHIpfXJldHVybiBwdHJ9ZWxzZXtyZXR1cm4gMH19aWYoIWhhbmRsZS4kJCl7dGhyb3dCaW5kaW5nRXJyb3IoYENhbm5vdCBwYXNzICIke2VtYmluZFJlcHIoaGFuZGxlKX0iIGFzIGEgJHt0aGlzLm5hbWV9YCl9aWYoIWhhbmRsZS4kJC5wdHIpe3Rocm93QmluZGluZ0Vycm9yKGBDYW5ub3QgcGFzcyBkZWxldGVkIG9iamVjdCBhcyBhIHBvaW50ZXIgb2YgdHlwZSAke3RoaXMubmFtZX1gKX1pZighdGhpcy5pc0NvbnN0JiZoYW5kbGUuJCQucHRyVHlwZS5pc0NvbnN0KXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IGNvbnZlcnQgYXJndW1lbnQgb2YgdHlwZSAke2hhbmRsZS4kJC5zbWFydFB0clR5cGU/aGFuZGxlLiQkLnNtYXJ0UHRyVHlwZS5uYW1lOmhhbmRsZS4kJC5wdHJUeXBlLm5hbWV9IHRvIHBhcmFtZXRlciB0eXBlICR7dGhpcy5uYW1lfWApfXZhciBoYW5kbGVDbGFzcz1oYW5kbGUuJCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3M7cHRyPXVwY2FzdFBvaW50ZXIoaGFuZGxlLiQkLnB0cixoYW5kbGVDbGFzcyx0aGlzLnJlZ2lzdGVyZWRDbGFzcyk7aWYodGhpcy5pc1NtYXJ0UG9pbnRlcil7aWYodW5kZWZpbmVkPT09aGFuZGxlLiQkLnNtYXJ0UHRyKXt0aHJvd0JpbmRpbmdFcnJvcigiUGFzc2luZyByYXcgcG9pbnRlciB0byBzbWFydCBwb2ludGVyIGlzIGlsbGVnYWwiKX1zd2l0Y2godGhpcy5zaGFyaW5nUG9saWN5KXtjYXNlIDA6aWYoaGFuZGxlLiQkLnNtYXJ0UHRyVHlwZT09PXRoaXMpe3B0cj1oYW5kbGUuJCQuc21hcnRQdHJ9ZWxzZXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IGNvbnZlcnQgYXJndW1lbnQgb2YgdHlwZSAke2hhbmRsZS4kJC5zbWFydFB0clR5cGU/aGFuZGxlLiQkLnNtYXJ0UHRyVHlwZS5uYW1lOmhhbmRsZS4kJC5wdHJUeXBlLm5hbWV9IHRvIHBhcmFtZXRlciB0eXBlICR7dGhpcy5uYW1lfWApfWJyZWFrO2Nhc2UgMTpwdHI9aGFuZGxlLiQkLnNtYXJ0UHRyO2JyZWFrO2Nhc2UgMjppZihoYW5kbGUuJCQuc21hcnRQdHJUeXBlPT09dGhpcyl7cHRyPWhhbmRsZS4kJC5zbWFydFB0cn1lbHNle3ZhciBjbG9uZWRIYW5kbGU9aGFuZGxlWyJjbG9uZSJdKCk7cHRyPXRoaXMucmF3U2hhcmUocHRyLEVtdmFsLnRvSGFuZGxlKCgpPT5jbG9uZWRIYW5kbGVbImRlbGV0ZSJdKCkpKTtpZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2godGhpcy5yYXdEZXN0cnVjdG9yLHB0cil9fWJyZWFrO2RlZmF1bHQ6dGhyb3dCaW5kaW5nRXJyb3IoIlVuc3VwcG9ydGluZyBzaGFyaW5nIHBvbGljeSIpfX1yZXR1cm4gcHRyfWZ1bmN0aW9uIG5vbkNvbnN0Tm9TbWFydFB0clJhd1BvaW50ZXJUb1dpcmVUeXBlKGRlc3RydWN0b3JzLGhhbmRsZSl7aWYoaGFuZGxlPT09bnVsbCl7aWYodGhpcy5pc1JlZmVyZW5jZSl7dGhyb3dCaW5kaW5nRXJyb3IoYG51bGwgaXMgbm90IGEgdmFsaWQgJHt0aGlzLm5hbWV9YCl9cmV0dXJuIDB9aWYoIWhhbmRsZS4kJCl7dGhyb3dCaW5kaW5nRXJyb3IoYENhbm5vdCBwYXNzICIke2VtYmluZFJlcHIoaGFuZGxlKX0iIGFzIGEgJHt0aGlzLm5hbWV9YCl9aWYoIWhhbmRsZS4kJC5wdHIpe3Rocm93QmluZGluZ0Vycm9yKGBDYW5ub3QgcGFzcyBkZWxldGVkIG9iamVjdCBhcyBhIHBvaW50ZXIgb2YgdHlwZSAke3RoaXMubmFtZX1gKX1pZihoYW5kbGUuJCQucHRyVHlwZS5pc0NvbnN0KXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IGNvbnZlcnQgYXJndW1lbnQgb2YgdHlwZSAke2hhbmRsZS4kJC5wdHJUeXBlLm5hbWV9IHRvIHBhcmFtZXRlciB0eXBlICR7dGhpcy5uYW1lfWApfXZhciBoYW5kbGVDbGFzcz1oYW5kbGUuJCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3M7dmFyIHB0cj11cGNhc3RQb2ludGVyKGhhbmRsZS4kJC5wdHIsaGFuZGxlQ2xhc3MsdGhpcy5yZWdpc3RlcmVkQ2xhc3MpO3JldHVybiBwdHJ9ZnVuY3Rpb24gcmVhZFBvaW50ZXIocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBVMzJbcG9pbnRlcj4+Ml0pfXZhciBpbml0X1JlZ2lzdGVyZWRQb2ludGVyPSgpPT57T2JqZWN0LmFzc2lnbihSZWdpc3RlcmVkUG9pbnRlci5wcm90b3R5cGUse2dldFBvaW50ZWUocHRyKXtpZih0aGlzLnJhd0dldFBvaW50ZWUpe3B0cj10aGlzLnJhd0dldFBvaW50ZWUocHRyKX1yZXR1cm4gcHRyfSxkZXN0cnVjdG9yKHB0cil7aWYodGhpcy5yYXdEZXN0cnVjdG9yKXt0aGlzLnJhd0Rlc3RydWN0b3IocHRyKX19LCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnJlYWRQb2ludGVyLCJkZWxldGVPYmplY3QiKGhhbmRsZSl7aWYoaGFuZGxlIT09bnVsbCl7aGFuZGxlWyJkZWxldGUiXSgpfX0sImZyb21XaXJlVHlwZSI6UmVnaXN0ZXJlZFBvaW50ZXJfZnJvbVdpcmVUeXBlfSl9O2Z1bmN0aW9uIFJlZ2lzdGVyZWRQb2ludGVyKG5hbWUscmVnaXN0ZXJlZENsYXNzLGlzUmVmZXJlbmNlLGlzQ29uc3QsaXNTbWFydFBvaW50ZXIscG9pbnRlZVR5cGUsc2hhcmluZ1BvbGljeSxyYXdHZXRQb2ludGVlLHJhd0NvbnN0cnVjdG9yLHJhd1NoYXJlLHJhd0Rlc3RydWN0b3Ipe3RoaXMubmFtZT1uYW1lO3RoaXMucmVnaXN0ZXJlZENsYXNzPXJlZ2lzdGVyZWRDbGFzczt0aGlzLmlzUmVmZXJlbmNlPWlzUmVmZXJlbmNlO3RoaXMuaXNDb25zdD1pc0NvbnN0O3RoaXMuaXNTbWFydFBvaW50ZXI9aXNTbWFydFBvaW50ZXI7dGhpcy5wb2ludGVlVHlwZT1wb2ludGVlVHlwZTt0aGlzLnNoYXJpbmdQb2xpY3k9c2hhcmluZ1BvbGljeTt0aGlzLnJhd0dldFBvaW50ZWU9cmF3R2V0UG9pbnRlZTt0aGlzLnJhd0NvbnN0cnVjdG9yPXJhd0NvbnN0cnVjdG9yO3RoaXMucmF3U2hhcmU9cmF3U2hhcmU7dGhpcy5yYXdEZXN0cnVjdG9yPXJhd0Rlc3RydWN0b3I7aWYoIWlzU21hcnRQb2ludGVyJiZyZWdpc3RlcmVkQ2xhc3MuYmFzZUNsYXNzPT09dW5kZWZpbmVkKXtpZihpc0NvbnN0KXt0aGlzWyJ0b1dpcmVUeXBlIl09Y29uc3ROb1NtYXJ0UHRyUmF3UG9pbnRlclRvV2lyZVR5cGU7dGhpcy5kZXN0cnVjdG9yRnVuY3Rpb249bnVsbH1lbHNle3RoaXNbInRvV2lyZVR5cGUiXT1ub25Db25zdE5vU21hcnRQdHJSYXdQb2ludGVyVG9XaXJlVHlwZTt0aGlzLmRlc3RydWN0b3JGdW5jdGlvbj1udWxsfX1lbHNle3RoaXNbInRvV2lyZVR5cGUiXT1nZW5lcmljUG9pbnRlclRvV2lyZVR5cGV9fXZhciByZXBsYWNlUHVibGljU3ltYm9sPShuYW1lLHZhbHVlLG51bUFyZ3VtZW50cyk9PntpZighTW9kdWxlLmhhc093blByb3BlcnR5KG5hbWUpKXt0aHJvd0ludGVybmFsRXJyb3IoIlJlcGxhY2luZyBub25leGlzdGFudCBwdWJsaWMgc3ltYm9sIil9aWYodW5kZWZpbmVkIT09TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGUmJnVuZGVmaW5lZCE9PW51bUFyZ3VtZW50cyl7TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGVbbnVtQXJndW1lbnRzXT12YWx1ZX1lbHNle01vZHVsZVtuYW1lXT12YWx1ZTtNb2R1bGVbbmFtZV0uYXJnQ291bnQ9bnVtQXJndW1lbnRzfX07dmFyIGR5bkNhbGxMZWdhY3k9KHNpZyxwdHIsYXJncyk9Pnt2YXIgZj1Nb2R1bGVbImR5bkNhbGxfIitzaWddO3JldHVybiBhcmdzJiZhcmdzLmxlbmd0aD9mLmFwcGx5KG51bGwsW3B0cl0uY29uY2F0KGFyZ3MpKTpmLmNhbGwobnVsbCxwdHIpfTt2YXIgd2FzbVRhYmxlTWlycm9yPVtdO3ZhciB3YXNtVGFibGU7dmFyIGdldFdhc21UYWJsZUVudHJ5PWZ1bmNQdHI9Pnt2YXIgZnVuYz13YXNtVGFibGVNaXJyb3JbZnVuY1B0cl07aWYoIWZ1bmMpe2lmKGZ1bmNQdHI+PXdhc21UYWJsZU1pcnJvci5sZW5ndGgpd2FzbVRhYmxlTWlycm9yLmxlbmd0aD1mdW5jUHRyKzE7d2FzbVRhYmxlTWlycm9yW2Z1bmNQdHJdPWZ1bmM9d2FzbVRhYmxlLmdldChmdW5jUHRyKX1yZXR1cm4gZnVuY307dmFyIGR5bkNhbGw9KHNpZyxwdHIsYXJncyk9PntpZihzaWcuaW5jbHVkZXMoImoiKSl7cmV0dXJuIGR5bkNhbGxMZWdhY3koc2lnLHB0cixhcmdzKX12YXIgcnRuPWdldFdhc21UYWJsZUVudHJ5KHB0cikuYXBwbHkobnVsbCxhcmdzKTtyZXR1cm4gcnRufTt2YXIgZ2V0RHluQ2FsbGVyPShzaWcscHRyKT0+e3ZhciBhcmdDYWNoZT1bXTtyZXR1cm4gZnVuY3Rpb24oKXthcmdDYWNoZS5sZW5ndGg9MDtPYmplY3QuYXNzaWduKGFyZ0NhY2hlLGFyZ3VtZW50cyk7cmV0dXJuIGR5bkNhbGwoc2lnLHB0cixhcmdDYWNoZSl9fTt2YXIgZW1iaW5kX19yZXF1aXJlRnVuY3Rpb249KHNpZ25hdHVyZSxyYXdGdW5jdGlvbik9PntzaWduYXR1cmU9cmVhZExhdGluMVN0cmluZyhzaWduYXR1cmUpO2Z1bmN0aW9uIG1ha2VEeW5DYWxsZXIoKXtpZihzaWduYXR1cmUuaW5jbHVkZXMoImoiKSl7cmV0dXJuIGdldER5bkNhbGxlcihzaWduYXR1cmUscmF3RnVuY3Rpb24pfXJldHVybiBnZXRXYXNtVGFibGVFbnRyeShyYXdGdW5jdGlvbil9dmFyIGZwPW1ha2VEeW5DYWxsZXIoKTtpZih0eXBlb2YgZnAhPSJmdW5jdGlvbiIpe3Rocm93QmluZGluZ0Vycm9yKGB1bmtub3duIGZ1bmN0aW9uIHBvaW50ZXIgd2l0aCBzaWduYXR1cmUgJHtzaWduYXR1cmV9OiAke3Jhd0Z1bmN0aW9ufWApfXJldHVybiBmcH07dmFyIGV4dGVuZEVycm9yPShiYXNlRXJyb3JUeXBlLGVycm9yTmFtZSk9Pnt2YXIgZXJyb3JDbGFzcz1jcmVhdGVOYW1lZEZ1bmN0aW9uKGVycm9yTmFtZSxmdW5jdGlvbihtZXNzYWdlKXt0aGlzLm5hbWU9ZXJyb3JOYW1lO3RoaXMubWVzc2FnZT1tZXNzYWdlO3ZhciBzdGFjaz1uZXcgRXJyb3IobWVzc2FnZSkuc3RhY2s7aWYoc3RhY2shPT11bmRlZmluZWQpe3RoaXMuc3RhY2s9dGhpcy50b1N0cmluZygpKyJcbiIrc3RhY2sucmVwbGFjZSgvXkVycm9yKDpbXlxuXSopP1xuLywiIil9fSk7ZXJyb3JDbGFzcy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiYXNlRXJyb3JUeXBlLnByb3RvdHlwZSk7ZXJyb3JDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3I9ZXJyb3JDbGFzcztlcnJvckNsYXNzLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe2lmKHRoaXMubWVzc2FnZT09PXVuZGVmaW5lZCl7cmV0dXJuIHRoaXMubmFtZX1lbHNle3JldHVybmAke3RoaXMubmFtZX06ICR7dGhpcy5tZXNzYWdlfWB9fTtyZXR1cm4gZXJyb3JDbGFzc307dmFyIFVuYm91bmRUeXBlRXJyb3I7dmFyIGdldFR5cGVOYW1lPXR5cGU9Pnt2YXIgcHRyPV9fX2dldFR5cGVOYW1lKHR5cGUpO3ZhciBydj1yZWFkTGF0aW4xU3RyaW5nKHB0cik7X2ZyZWUocHRyKTtyZXR1cm4gcnZ9O3ZhciB0aHJvd1VuYm91bmRUeXBlRXJyb3I9KG1lc3NhZ2UsdHlwZXMpPT57dmFyIHVuYm91bmRUeXBlcz1bXTt2YXIgc2Vlbj17fTtmdW5jdGlvbiB2aXNpdCh0eXBlKXtpZihzZWVuW3R5cGVdKXtyZXR1cm59aWYocmVnaXN0ZXJlZFR5cGVzW3R5cGVdKXtyZXR1cm59aWYodHlwZURlcGVuZGVuY2llc1t0eXBlXSl7dHlwZURlcGVuZGVuY2llc1t0eXBlXS5mb3JFYWNoKHZpc2l0KTtyZXR1cm59dW5ib3VuZFR5cGVzLnB1c2godHlwZSk7c2Vlblt0eXBlXT10cnVlfXR5cGVzLmZvckVhY2godmlzaXQpO3Rocm93IG5ldyBVbmJvdW5kVHlwZUVycm9yKGAke21lc3NhZ2V9OiBgK3VuYm91bmRUeXBlcy5tYXAoZ2V0VHlwZU5hbWUpLmpvaW4oWyIsICJdKSl9O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9jbGFzcz0ocmF3VHlwZSxyYXdQb2ludGVyVHlwZSxyYXdDb25zdFBvaW50ZXJUeXBlLGJhc2VDbGFzc1Jhd1R5cGUsZ2V0QWN0dWFsVHlwZVNpZ25hdHVyZSxnZXRBY3R1YWxUeXBlLHVwY2FzdFNpZ25hdHVyZSx1cGNhc3QsZG93bmNhc3RTaWduYXR1cmUsZG93bmNhc3QsbmFtZSxkZXN0cnVjdG9yU2lnbmF0dXJlLHJhd0Rlc3RydWN0b3IpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO2dldEFjdHVhbFR5cGU9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oZ2V0QWN0dWFsVHlwZVNpZ25hdHVyZSxnZXRBY3R1YWxUeXBlKTtpZih1cGNhc3Qpe3VwY2FzdD1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbih1cGNhc3RTaWduYXR1cmUsdXBjYXN0KX1pZihkb3duY2FzdCl7ZG93bmNhc3Q9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oZG93bmNhc3RTaWduYXR1cmUsZG93bmNhc3QpfXJhd0Rlc3RydWN0b3I9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oZGVzdHJ1Y3RvclNpZ25hdHVyZSxyYXdEZXN0cnVjdG9yKTt2YXIgbGVnYWxGdW5jdGlvbk5hbWU9bWFrZUxlZ2FsRnVuY3Rpb25OYW1lKG5hbWUpO2V4cG9zZVB1YmxpY1N5bWJvbChsZWdhbEZ1bmN0aW9uTmFtZSxmdW5jdGlvbigpe3Rocm93VW5ib3VuZFR5cGVFcnJvcihgQ2Fubm90IGNvbnN0cnVjdCAke25hbWV9IGR1ZSB0byB1bmJvdW5kIHR5cGVzYCxbYmFzZUNsYXNzUmF3VHlwZV0pfSk7d2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQoW3Jhd1R5cGUscmF3UG9pbnRlclR5cGUscmF3Q29uc3RQb2ludGVyVHlwZV0sYmFzZUNsYXNzUmF3VHlwZT9bYmFzZUNsYXNzUmF3VHlwZV06W10sZnVuY3Rpb24oYmFzZSl7YmFzZT1iYXNlWzBdO3ZhciBiYXNlQ2xhc3M7dmFyIGJhc2VQcm90b3R5cGU7aWYoYmFzZUNsYXNzUmF3VHlwZSl7YmFzZUNsYXNzPWJhc2UucmVnaXN0ZXJlZENsYXNzO2Jhc2VQcm90b3R5cGU9YmFzZUNsYXNzLmluc3RhbmNlUHJvdG90eXBlfWVsc2V7YmFzZVByb3RvdHlwZT1DbGFzc0hhbmRsZS5wcm90b3R5cGV9dmFyIGNvbnN0cnVjdG9yPWNyZWF0ZU5hbWVkRnVuY3Rpb24obmFtZSxmdW5jdGlvbigpe2lmKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSE9PWluc3RhbmNlUHJvdG90eXBlKXt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKCJVc2UgJ25ldycgdG8gY29uc3RydWN0ICIrbmFtZSl9aWYodW5kZWZpbmVkPT09cmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHkpe3Rocm93IG5ldyBCaW5kaW5nRXJyb3IobmFtZSsiIGhhcyBubyBhY2Nlc3NpYmxlIGNvbnN0cnVjdG9yIil9dmFyIGJvZHk9cmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHlbYXJndW1lbnRzLmxlbmd0aF07aWYodW5kZWZpbmVkPT09Ym9keSl7dGhyb3cgbmV3IEJpbmRpbmdFcnJvcihgVHJpZWQgdG8gaW52b2tlIGN0b3Igb2YgJHtuYW1lfSB3aXRoIGludmFsaWQgbnVtYmVyIG9mIHBhcmFtZXRlcnMgKCR7YXJndW1lbnRzLmxlbmd0aH0pIC0gZXhwZWN0ZWQgKCR7T2JqZWN0LmtleXMocmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHkpLnRvU3RyaW5nKCl9KSBwYXJhbWV0ZXJzIGluc3RlYWQhYCl9cmV0dXJuIGJvZHkuYXBwbHkodGhpcyxhcmd1bWVudHMpfSk7dmFyIGluc3RhbmNlUHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYmFzZVByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOmNvbnN0cnVjdG9yfX0pO2NvbnN0cnVjdG9yLnByb3RvdHlwZT1pbnN0YW5jZVByb3RvdHlwZTt2YXIgcmVnaXN0ZXJlZENsYXNzPW5ldyBSZWdpc3RlcmVkQ2xhc3MobmFtZSxjb25zdHJ1Y3RvcixpbnN0YW5jZVByb3RvdHlwZSxyYXdEZXN0cnVjdG9yLGJhc2VDbGFzcyxnZXRBY3R1YWxUeXBlLHVwY2FzdCxkb3duY2FzdCk7aWYocmVnaXN0ZXJlZENsYXNzLmJhc2VDbGFzcyl7aWYocmVnaXN0ZXJlZENsYXNzLmJhc2VDbGFzcy5fX2Rlcml2ZWRDbGFzc2VzPT09dW5kZWZpbmVkKXtyZWdpc3RlcmVkQ2xhc3MuYmFzZUNsYXNzLl9fZGVyaXZlZENsYXNzZXM9W119cmVnaXN0ZXJlZENsYXNzLmJhc2VDbGFzcy5fX2Rlcml2ZWRDbGFzc2VzLnB1c2gocmVnaXN0ZXJlZENsYXNzKX12YXIgcmVmZXJlbmNlQ29udmVydGVyPW5ldyBSZWdpc3RlcmVkUG9pbnRlcihuYW1lLHJlZ2lzdGVyZWRDbGFzcyx0cnVlLGZhbHNlLGZhbHNlKTt2YXIgcG9pbnRlckNvbnZlcnRlcj1uZXcgUmVnaXN0ZXJlZFBvaW50ZXIobmFtZSsiKiIscmVnaXN0ZXJlZENsYXNzLGZhbHNlLGZhbHNlLGZhbHNlKTt2YXIgY29uc3RQb2ludGVyQ29udmVydGVyPW5ldyBSZWdpc3RlcmVkUG9pbnRlcihuYW1lKyIgY29uc3QqIixyZWdpc3RlcmVkQ2xhc3MsZmFsc2UsdHJ1ZSxmYWxzZSk7cmVnaXN0ZXJlZFBvaW50ZXJzW3Jhd1R5cGVdPXtwb2ludGVyVHlwZTpwb2ludGVyQ29udmVydGVyLGNvbnN0UG9pbnRlclR5cGU6Y29uc3RQb2ludGVyQ29udmVydGVyfTtyZXBsYWNlUHVibGljU3ltYm9sKGxlZ2FsRnVuY3Rpb25OYW1lLGNvbnN0cnVjdG9yKTtyZXR1cm5bcmVmZXJlbmNlQ29udmVydGVyLHBvaW50ZXJDb252ZXJ0ZXIsY29uc3RQb2ludGVyQ29udmVydGVyXX0pfTt2YXIgaGVhcDMyVmVjdG9yVG9BcnJheT0oY291bnQsZmlyc3RFbGVtZW50KT0+e3ZhciBhcnJheT1bXTtmb3IodmFyIGk9MDtpPGNvdW50O2krKyl7YXJyYXkucHVzaChIRUFQVTMyW2ZpcnN0RWxlbWVudCtpKjQ+PjJdKX1yZXR1cm4gYXJyYXl9O3ZhciBydW5EZXN0cnVjdG9ycz1kZXN0cnVjdG9ycz0+e3doaWxlKGRlc3RydWN0b3JzLmxlbmd0aCl7dmFyIHB0cj1kZXN0cnVjdG9ycy5wb3AoKTt2YXIgZGVsPWRlc3RydWN0b3JzLnBvcCgpO2RlbChwdHIpfX07ZnVuY3Rpb24gbmV3RnVuYyhjb25zdHJ1Y3Rvcixhcmd1bWVudExpc3Qpe2lmKCEoY29uc3RydWN0b3IgaW5zdGFuY2VvZiBGdW5jdGlvbikpe3Rocm93IG5ldyBUeXBlRXJyb3IoYG5ld18gY2FsbGVkIHdpdGggY29uc3RydWN0b3IgdHlwZSAke3R5cGVvZiBjb25zdHJ1Y3Rvcn0gd2hpY2ggaXMgbm90IGEgZnVuY3Rpb25gKX12YXIgZHVtbXk9Y3JlYXRlTmFtZWRGdW5jdGlvbihjb25zdHJ1Y3Rvci5uYW1lfHwidW5rbm93bkZ1bmN0aW9uTmFtZSIsZnVuY3Rpb24oKXt9KTtkdW1teS5wcm90b3R5cGU9Y29uc3RydWN0b3IucHJvdG90eXBlO3ZhciBvYmo9bmV3IGR1bW15O3ZhciByPWNvbnN0cnVjdG9yLmFwcGx5KG9iaixhcmd1bWVudExpc3QpO3JldHVybiByIGluc3RhbmNlb2YgT2JqZWN0P3I6b2JqfWZ1bmN0aW9uIGNyYWZ0SW52b2tlckZ1bmN0aW9uKGh1bWFuTmFtZSxhcmdUeXBlcyxjbGFzc1R5cGUsY3BwSW52b2tlckZ1bmMsY3BwVGFyZ2V0RnVuYyxpc0FzeW5jKXt2YXIgYXJnQ291bnQ9YXJnVHlwZXMubGVuZ3RoO2lmKGFyZ0NvdW50PDIpe3Rocm93QmluZGluZ0Vycm9yKCJhcmdUeXBlcyBhcnJheSBzaXplIG1pc21hdGNoISBNdXN0IGF0IGxlYXN0IGdldCByZXR1cm4gdmFsdWUgYW5kICd0aGlzJyB0eXBlcyEiKX12YXIgaXNDbGFzc01ldGhvZEZ1bmM9YXJnVHlwZXNbMV0hPT1udWxsJiZjbGFzc1R5cGUhPT1udWxsO3ZhciBuZWVkc0Rlc3RydWN0b3JTdGFjaz1mYWxzZTtmb3IodmFyIGk9MTtpPGFyZ1R5cGVzLmxlbmd0aDsrK2kpe2lmKGFyZ1R5cGVzW2ldIT09bnVsbCYmYXJnVHlwZXNbaV0uZGVzdHJ1Y3RvckZ1bmN0aW9uPT09dW5kZWZpbmVkKXtuZWVkc0Rlc3RydWN0b3JTdGFjaz10cnVlO2JyZWFrfX12YXIgcmV0dXJucz1hcmdUeXBlc1swXS5uYW1lIT09InZvaWQiO3ZhciBhcmdzTGlzdD0iIjt2YXIgYXJnc0xpc3RXaXJlZD0iIjtmb3IodmFyIGk9MDtpPGFyZ0NvdW50LTI7KytpKXthcmdzTGlzdCs9KGkhPT0wPyIsICI6IiIpKyJhcmciK2k7YXJnc0xpc3RXaXJlZCs9KGkhPT0wPyIsICI6IiIpKyJhcmciK2krIldpcmVkIn12YXIgaW52b2tlckZuQm9keT1gXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoJHthcmdzTGlzdH0pIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggIT09ICR7YXJnQ291bnQtMn0pIHtcbiAgICAgICAgICB0aHJvd0JpbmRpbmdFcnJvcignZnVuY3Rpb24gJHtodW1hbk5hbWV9IGNhbGxlZCB3aXRoICcgKyBhcmd1bWVudHMubGVuZ3RoICsgJyBhcmd1bWVudHMsIGV4cGVjdGVkICR7YXJnQ291bnQtMn0nKTtcbiAgICAgICAgfWA7aWYobmVlZHNEZXN0cnVjdG9yU3RhY2spe2ludm9rZXJGbkJvZHkrPSJ2YXIgZGVzdHJ1Y3RvcnMgPSBbXTtcbiJ9dmFyIGR0b3JTdGFjaz1uZWVkc0Rlc3RydWN0b3JTdGFjaz8iZGVzdHJ1Y3RvcnMiOiJudWxsIjt2YXIgYXJnczE9WyJ0aHJvd0JpbmRpbmdFcnJvciIsImludm9rZXIiLCJmbiIsInJ1bkRlc3RydWN0b3JzIiwicmV0VHlwZSIsImNsYXNzUGFyYW0iXTt2YXIgYXJnczI9W3Rocm93QmluZGluZ0Vycm9yLGNwcEludm9rZXJGdW5jLGNwcFRhcmdldEZ1bmMscnVuRGVzdHJ1Y3RvcnMsYXJnVHlwZXNbMF0sYXJnVHlwZXNbMV1dO2lmKGlzQ2xhc3NNZXRob2RGdW5jKXtpbnZva2VyRm5Cb2R5Kz0idmFyIHRoaXNXaXJlZCA9IGNsYXNzUGFyYW0udG9XaXJlVHlwZSgiK2R0b3JTdGFjaysiLCB0aGlzKTtcbiJ9Zm9yKHZhciBpPTA7aTxhcmdDb3VudC0yOysraSl7aW52b2tlckZuQm9keSs9InZhciBhcmciK2krIldpcmVkID0gYXJnVHlwZSIraSsiLnRvV2lyZVR5cGUoIitkdG9yU3RhY2srIiwgYXJnIitpKyIpOyAvLyAiK2FyZ1R5cGVzW2krMl0ubmFtZSsiXG4iO2FyZ3MxLnB1c2goImFyZ1R5cGUiK2kpO2FyZ3MyLnB1c2goYXJnVHlwZXNbaSsyXSl9aWYoaXNDbGFzc01ldGhvZEZ1bmMpe2FyZ3NMaXN0V2lyZWQ9InRoaXNXaXJlZCIrKGFyZ3NMaXN0V2lyZWQubGVuZ3RoPjA/IiwgIjoiIikrYXJnc0xpc3RXaXJlZH1pbnZva2VyRm5Cb2R5Kz0ocmV0dXJuc3x8aXNBc3luYz8idmFyIHJ2ID0gIjoiIikrImludm9rZXIoZm4iKyhhcmdzTGlzdFdpcmVkLmxlbmd0aD4wPyIsICI6IiIpK2FyZ3NMaXN0V2lyZWQrIik7XG4iO2lmKG5lZWRzRGVzdHJ1Y3RvclN0YWNrKXtpbnZva2VyRm5Cb2R5Kz0icnVuRGVzdHJ1Y3RvcnMoZGVzdHJ1Y3RvcnMpO1xuIn1lbHNle2Zvcih2YXIgaT1pc0NsYXNzTWV0aG9kRnVuYz8xOjI7aTxhcmdUeXBlcy5sZW5ndGg7KytpKXt2YXIgcGFyYW1OYW1lPWk9PT0xPyJ0aGlzV2lyZWQiOiJhcmciKyhpLTIpKyJXaXJlZCI7aWYoYXJnVHlwZXNbaV0uZGVzdHJ1Y3RvckZ1bmN0aW9uIT09bnVsbCl7aW52b2tlckZuQm9keSs9cGFyYW1OYW1lKyJfZHRvcigiK3BhcmFtTmFtZSsiKTsgLy8gIithcmdUeXBlc1tpXS5uYW1lKyJcbiI7YXJnczEucHVzaChwYXJhbU5hbWUrIl9kdG9yIik7YXJnczIucHVzaChhcmdUeXBlc1tpXS5kZXN0cnVjdG9yRnVuY3Rpb24pfX19aWYocmV0dXJucyl7aW52b2tlckZuQm9keSs9InZhciByZXQgPSByZXRUeXBlLmZyb21XaXJlVHlwZShydik7XG4iKyJyZXR1cm4gcmV0O1xuIn1lbHNle31pbnZva2VyRm5Cb2R5Kz0ifVxuIjthcmdzMS5wdXNoKGludm9rZXJGbkJvZHkpO3ZhciBpbnZva2VyRm49bmV3RnVuYyhGdW5jdGlvbixhcmdzMSkuYXBwbHkobnVsbCxhcmdzMik7cmV0dXJuIGNyZWF0ZU5hbWVkRnVuY3Rpb24oaHVtYW5OYW1lLGludm9rZXJGbil9dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2NvbnN0cnVjdG9yPShyYXdDbGFzc1R5cGUsYXJnQ291bnQscmF3QXJnVHlwZXNBZGRyLGludm9rZXJTaWduYXR1cmUsaW52b2tlcixyYXdDb25zdHJ1Y3Rvcik9Pnt2YXIgcmF3QXJnVHlwZXM9aGVhcDMyVmVjdG9yVG9BcnJheShhcmdDb3VudCxyYXdBcmdUeXBlc0FkZHIpO2ludm9rZXI9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oaW52b2tlclNpZ25hdHVyZSxpbnZva2VyKTt3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxbcmF3Q2xhc3NUeXBlXSxmdW5jdGlvbihjbGFzc1R5cGUpe2NsYXNzVHlwZT1jbGFzc1R5cGVbMF07dmFyIGh1bWFuTmFtZT1gY29uc3RydWN0b3IgJHtjbGFzc1R5cGUubmFtZX1gO2lmKHVuZGVmaW5lZD09PWNsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keSl7Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5PVtdfWlmKHVuZGVmaW5lZCE9PWNsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keVthcmdDb3VudC0xXSl7dGhyb3cgbmV3IEJpbmRpbmdFcnJvcihgQ2Fubm90IHJlZ2lzdGVyIG11bHRpcGxlIGNvbnN0cnVjdG9ycyB3aXRoIGlkZW50aWNhbCBudW1iZXIgb2YgcGFyYW1ldGVycyAoJHthcmdDb3VudC0xfSkgZm9yIGNsYXNzICcke2NsYXNzVHlwZS5uYW1lfSchIE92ZXJsb2FkIHJlc29sdXRpb24gaXMgY3VycmVudGx5IG9ubHkgcGVyZm9ybWVkIHVzaW5nIHRoZSBwYXJhbWV0ZXIgY291bnQsIG5vdCBhY3R1YWwgdHlwZSBpbmZvIWApfWNsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keVthcmdDb3VudC0xXT0oKT0+e3Rocm93VW5ib3VuZFR5cGVFcnJvcihgQ2Fubm90IGNvbnN0cnVjdCAke2NsYXNzVHlwZS5uYW1lfSBkdWUgdG8gdW5ib3VuZCB0eXBlc2AscmF3QXJnVHlwZXMpfTt3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxyYXdBcmdUeXBlcyxhcmdUeXBlcz0+e2FyZ1R5cGVzLnNwbGljZSgxLDAsbnVsbCk7Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5W2FyZ0NvdW50LTFdPWNyYWZ0SW52b2tlckZ1bmN0aW9uKGh1bWFuTmFtZSxhcmdUeXBlcyxudWxsLGludm9rZXIscmF3Q29uc3RydWN0b3IpO3JldHVybltdfSk7cmV0dXJuW119KX07dmFyIGdldEZ1bmN0aW9uTmFtZT1zaWduYXR1cmU9PntzaWduYXR1cmU9c2lnbmF0dXJlLnRyaW0oKTtjb25zdCBhcmdzSW5kZXg9c2lnbmF0dXJlLmluZGV4T2YoIigiKTtpZihhcmdzSW5kZXghPT0tMSl7cmV0dXJuIHNpZ25hdHVyZS5zdWJzdHIoMCxhcmdzSW5kZXgpfWVsc2V7cmV0dXJuIHNpZ25hdHVyZX19O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19mdW5jdGlvbj0ocmF3Q2xhc3NUeXBlLG1ldGhvZE5hbWUsYXJnQ291bnQscmF3QXJnVHlwZXNBZGRyLGludm9rZXJTaWduYXR1cmUscmF3SW52b2tlcixjb250ZXh0LGlzUHVyZVZpcnR1YWwsaXNBc3luYyk9Pnt2YXIgcmF3QXJnVHlwZXM9aGVhcDMyVmVjdG9yVG9BcnJheShhcmdDb3VudCxyYXdBcmdUeXBlc0FkZHIpO21ldGhvZE5hbWU9cmVhZExhdGluMVN0cmluZyhtZXRob2ROYW1lKTttZXRob2ROYW1lPWdldEZ1bmN0aW9uTmFtZShtZXRob2ROYW1lKTtyYXdJbnZva2VyPWVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKGludm9rZXJTaWduYXR1cmUscmF3SW52b2tlcik7d2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQoW10sW3Jhd0NsYXNzVHlwZV0sZnVuY3Rpb24oY2xhc3NUeXBlKXtjbGFzc1R5cGU9Y2xhc3NUeXBlWzBdO3ZhciBodW1hbk5hbWU9YCR7Y2xhc3NUeXBlLm5hbWV9LiR7bWV0aG9kTmFtZX1gO2lmKG1ldGhvZE5hbWUuc3RhcnRzV2l0aCgiQEAiKSl7bWV0aG9kTmFtZT1TeW1ib2xbbWV0aG9kTmFtZS5zdWJzdHJpbmcoMildfWlmKGlzUHVyZVZpcnR1YWwpe2NsYXNzVHlwZS5yZWdpc3RlcmVkQ2xhc3MucHVyZVZpcnR1YWxGdW5jdGlvbnMucHVzaChtZXRob2ROYW1lKX1mdW5jdGlvbiB1bmJvdW5kVHlwZXNIYW5kbGVyKCl7dGhyb3dVbmJvdW5kVHlwZUVycm9yKGBDYW5ub3QgY2FsbCAke2h1bWFuTmFtZX0gZHVlIHRvIHVuYm91bmQgdHlwZXNgLHJhd0FyZ1R5cGVzKX12YXIgcHJvdG89Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5pbnN0YW5jZVByb3RvdHlwZTt2YXIgbWV0aG9kPXByb3RvW21ldGhvZE5hbWVdO2lmKHVuZGVmaW5lZD09PW1ldGhvZHx8dW5kZWZpbmVkPT09bWV0aG9kLm92ZXJsb2FkVGFibGUmJm1ldGhvZC5jbGFzc05hbWUhPT1jbGFzc1R5cGUubmFtZSYmbWV0aG9kLmFyZ0NvdW50PT09YXJnQ291bnQtMil7dW5ib3VuZFR5cGVzSGFuZGxlci5hcmdDb3VudD1hcmdDb3VudC0yO3VuYm91bmRUeXBlc0hhbmRsZXIuY2xhc3NOYW1lPWNsYXNzVHlwZS5uYW1lO3Byb3RvW21ldGhvZE5hbWVdPXVuYm91bmRUeXBlc0hhbmRsZXJ9ZWxzZXtlbnN1cmVPdmVybG9hZFRhYmxlKHByb3RvLG1ldGhvZE5hbWUsaHVtYW5OYW1lKTtwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlW2FyZ0NvdW50LTJdPXVuYm91bmRUeXBlc0hhbmRsZXJ9d2hlbkRlcGVuZGVudFR5cGVzQXJlUmVzb2x2ZWQoW10scmF3QXJnVHlwZXMsZnVuY3Rpb24oYXJnVHlwZXMpe3ZhciBtZW1iZXJGdW5jdGlvbj1jcmFmdEludm9rZXJGdW5jdGlvbihodW1hbk5hbWUsYXJnVHlwZXMsY2xhc3NUeXBlLHJhd0ludm9rZXIsY29udGV4dCxpc0FzeW5jKTtpZih1bmRlZmluZWQ9PT1wcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlKXttZW1iZXJGdW5jdGlvbi5hcmdDb3VudD1hcmdDb3VudC0yO3Byb3RvW21ldGhvZE5hbWVdPW1lbWJlckZ1bmN0aW9ufWVsc2V7cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZVthcmdDb3VudC0yXT1tZW1iZXJGdW5jdGlvbn1yZXR1cm5bXX0pO3JldHVybltdfSl9O2Z1bmN0aW9uIGhhbmRsZUFsbG9jYXRvckluaXQoKXtPYmplY3QuYXNzaWduKEhhbmRsZUFsbG9jYXRvci5wcm90b3R5cGUse2dldChpZCl7cmV0dXJuIHRoaXMuYWxsb2NhdGVkW2lkXX0saGFzKGlkKXtyZXR1cm4gdGhpcy5hbGxvY2F0ZWRbaWRdIT09dW5kZWZpbmVkfSxhbGxvY2F0ZShoYW5kbGUpe3ZhciBpZD10aGlzLmZyZWVsaXN0LnBvcCgpfHx0aGlzLmFsbG9jYXRlZC5sZW5ndGg7dGhpcy5hbGxvY2F0ZWRbaWRdPWhhbmRsZTtyZXR1cm4gaWR9LGZyZWUoaWQpe3RoaXMuYWxsb2NhdGVkW2lkXT11bmRlZmluZWQ7dGhpcy5mcmVlbGlzdC5wdXNoKGlkKX19KX1mdW5jdGlvbiBIYW5kbGVBbGxvY2F0b3IoKXt0aGlzLmFsbG9jYXRlZD1bdW5kZWZpbmVkXTt0aGlzLmZyZWVsaXN0PVtdfXZhciBlbXZhbF9oYW5kbGVzPW5ldyBIYW5kbGVBbGxvY2F0b3I7dmFyIF9fZW12YWxfZGVjcmVmPWhhbmRsZT0+e2lmKGhhbmRsZT49ZW12YWxfaGFuZGxlcy5yZXNlcnZlZCYmMD09PS0tZW12YWxfaGFuZGxlcy5nZXQoaGFuZGxlKS5yZWZjb3VudCl7ZW12YWxfaGFuZGxlcy5mcmVlKGhhbmRsZSl9fTt2YXIgY291bnRfZW12YWxfaGFuZGxlcz0oKT0+e3ZhciBjb3VudD0wO2Zvcih2YXIgaT1lbXZhbF9oYW5kbGVzLnJlc2VydmVkO2k8ZW12YWxfaGFuZGxlcy5hbGxvY2F0ZWQubGVuZ3RoOysraSl7aWYoZW12YWxfaGFuZGxlcy5hbGxvY2F0ZWRbaV0hPT11bmRlZmluZWQpeysrY291bnR9fXJldHVybiBjb3VudH07dmFyIGluaXRfZW12YWw9KCk9PntlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5wdXNoKHt2YWx1ZTp1bmRlZmluZWR9LHt2YWx1ZTpudWxsfSx7dmFsdWU6dHJ1ZX0se3ZhbHVlOmZhbHNlfSk7ZW12YWxfaGFuZGxlcy5yZXNlcnZlZD1lbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5sZW5ndGg7TW9kdWxlWyJjb3VudF9lbXZhbF9oYW5kbGVzIl09Y291bnRfZW12YWxfaGFuZGxlc307dmFyIEVtdmFsPXt0b1ZhbHVlOmhhbmRsZT0+e2lmKCFoYW5kbGUpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgdXNlIGRlbGV0ZWQgdmFsLiBoYW5kbGUgPSAiK2hhbmRsZSl9cmV0dXJuIGVtdmFsX2hhbmRsZXMuZ2V0KGhhbmRsZSkudmFsdWV9LHRvSGFuZGxlOnZhbHVlPT57c3dpdGNoKHZhbHVlKXtjYXNlIHVuZGVmaW5lZDpyZXR1cm4gMTtjYXNlIG51bGw6cmV0dXJuIDI7Y2FzZSB0cnVlOnJldHVybiAzO2Nhc2UgZmFsc2U6cmV0dXJuIDQ7ZGVmYXVsdDp7cmV0dXJuIGVtdmFsX2hhbmRsZXMuYWxsb2NhdGUoe3JlZmNvdW50OjEsdmFsdWU6dmFsdWV9KX19fX07ZnVuY3Rpb24gc2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXIocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVAzMltwb2ludGVyPj4yXSl9dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2VtdmFsPShyYXdUeXBlLG5hbWUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6aGFuZGxlPT57dmFyIHJ2PUVtdmFsLnRvVmFsdWUoaGFuZGxlKTtfX2VtdmFsX2RlY3JlZihoYW5kbGUpO3JldHVybiBydn0sInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyx2YWx1ZSk9PkVtdmFsLnRvSGFuZGxlKHZhbHVlKSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pfTt2YXIgZW1iaW5kUmVwcj12PT57aWYodj09PW51bGwpe3JldHVybiJudWxsIn12YXIgdD10eXBlb2YgdjtpZih0PT09Im9iamVjdCJ8fHQ9PT0iYXJyYXkifHx0PT09ImZ1bmN0aW9uIil7cmV0dXJuIHYudG9TdHJpbmcoKX1lbHNle3JldHVybiIiK3Z9fTt2YXIgZmxvYXRSZWFkVmFsdWVGcm9tUG9pbnRlcj0obmFtZSx3aWR0aCk9Pntzd2l0Y2god2lkdGgpe2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBGMzJbcG9pbnRlcj4+Ml0pfTtjYXNlIDg6cmV0dXJuIGZ1bmN0aW9uKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQRjY0W3BvaW50ZXI+PjNdKX07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGZsb2F0IHdpZHRoICgke3dpZHRofSk6ICR7bmFtZX1gKX19O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdD0ocmF3VHlwZSxuYW1lLHNpemUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6dmFsdWU9PnZhbHVlLCJ0b1dpcmVUeXBlIjooZGVzdHJ1Y3RvcnMsdmFsdWUpPT52YWx1ZSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpmbG9hdFJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2l6ZSksZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KX07dmFyIGludGVnZXJSZWFkVmFsdWVGcm9tUG9pbnRlcj0obmFtZSx3aWR0aCxzaWduZWQpPT57c3dpdGNoKHdpZHRoKXtjYXNlIDE6cmV0dXJuIHNpZ25lZD9wb2ludGVyPT5IRUFQOFtwb2ludGVyPj4wXTpwb2ludGVyPT5IRUFQVThbcG9pbnRlcj4+MF07Y2FzZSAyOnJldHVybiBzaWduZWQ/cG9pbnRlcj0+SEVBUDE2W3BvaW50ZXI+PjFdOnBvaW50ZXI9PkhFQVBVMTZbcG9pbnRlcj4+MV07Y2FzZSA0OnJldHVybiBzaWduZWQ/cG9pbnRlcj0+SEVBUDMyW3BvaW50ZXI+PjJdOnBvaW50ZXI9PkhFQVBVMzJbcG9pbnRlcj4+Ml07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGludGVnZXIgd2lkdGggKCR7d2lkdGh9KTogJHtuYW1lfWApfX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2ludGVnZXI9KHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtpZihtYXhSYW5nZT09PS0xKXttYXhSYW5nZT00Mjk0OTY3Mjk1fXZhciBmcm9tV2lyZVR5cGU9dmFsdWU9PnZhbHVlO2lmKG1pblJhbmdlPT09MCl7dmFyIGJpdHNoaWZ0PTMyLTgqc2l6ZTtmcm9tV2lyZVR5cGU9dmFsdWU9PnZhbHVlPDxiaXRzaGlmdD4+PmJpdHNoaWZ0fXZhciBpc1Vuc2lnbmVkVHlwZT1uYW1lLmluY2x1ZGVzKCJ1bnNpZ25lZCIpO3ZhciBjaGVja0Fzc2VydGlvbnM9KHZhbHVlLHRvVHlwZU5hbWUpPT57fTt2YXIgdG9XaXJlVHlwZTtpZihpc1Vuc2lnbmVkVHlwZSl7dG9XaXJlVHlwZT1mdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7Y2hlY2tBc3NlcnRpb25zKHZhbHVlLHRoaXMubmFtZSk7cmV0dXJuIHZhbHVlPj4+MH19ZWxzZXt0b1dpcmVUeXBlPWZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtjaGVja0Fzc2VydGlvbnModmFsdWUsdGhpcy5uYW1lKTtyZXR1cm4gdmFsdWV9fXJlZ2lzdGVyVHlwZShwcmltaXRpdmVUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnJvbVdpcmVUeXBlLCJ0b1dpcmVUeXBlIjp0b1dpcmVUeXBlLCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmludGVnZXJSZWFkVmFsdWVGcm9tUG9pbnRlcihuYW1lLHNpemUsbWluUmFuZ2UhPT0wKSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pfTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXc9KHJhd1R5cGUsZGF0YVR5cGVJbmRleCxuYW1lKT0+e3ZhciB0eXBlTWFwcGluZz1bSW50OEFycmF5LFVpbnQ4QXJyYXksSW50MTZBcnJheSxVaW50MTZBcnJheSxJbnQzMkFycmF5LFVpbnQzMkFycmF5LEZsb2F0MzJBcnJheSxGbG9hdDY0QXJyYXldO3ZhciBUQT10eXBlTWFwcGluZ1tkYXRhVHlwZUluZGV4XTtmdW5jdGlvbiBkZWNvZGVNZW1vcnlWaWV3KGhhbmRsZSl7dmFyIHNpemU9SEVBUFUzMltoYW5kbGU+PjJdO3ZhciBkYXRhPUhFQVBVMzJbaGFuZGxlKzQ+PjJdO3JldHVybiBuZXcgVEEoSEVBUDguYnVmZmVyLGRhdGEsc2l6ZSl9bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZGVjb2RlTWVtb3J5VmlldywiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpkZWNvZGVNZW1vcnlWaWV3fSx7aWdub3JlRHVwbGljYXRlUmVnaXN0cmF0aW9uczp0cnVlfSl9O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nPShyYXdUeXBlLG5hbWUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3ZhciBzdGRTdHJpbmdJc1VURjg9bmFtZT09PSJzdGQ6OnN0cmluZyI7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIih2YWx1ZSl7dmFyIGxlbmd0aD1IRUFQVTMyW3ZhbHVlPj4yXTt2YXIgcGF5bG9hZD12YWx1ZSs0O3ZhciBzdHI7aWYoc3RkU3RyaW5nSXNVVEY4KXt2YXIgZGVjb2RlU3RhcnRQdHI9cGF5bG9hZDtmb3IodmFyIGk9MDtpPD1sZW5ndGg7KytpKXt2YXIgY3VycmVudEJ5dGVQdHI9cGF5bG9hZCtpO2lmKGk9PWxlbmd0aHx8SEVBUFU4W2N1cnJlbnRCeXRlUHRyXT09MCl7dmFyIG1heFJlYWQ9Y3VycmVudEJ5dGVQdHItZGVjb2RlU3RhcnRQdHI7dmFyIHN0cmluZ1NlZ21lbnQ9VVRGOFRvU3RyaW5nKGRlY29kZVN0YXJ0UHRyLG1heFJlYWQpO2lmKHN0cj09PXVuZGVmaW5lZCl7c3RyPXN0cmluZ1NlZ21lbnR9ZWxzZXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoMCk7c3RyKz1zdHJpbmdTZWdtZW50fWRlY29kZVN0YXJ0UHRyPWN1cnJlbnRCeXRlUHRyKzF9fX1lbHNle3ZhciBhPW5ldyBBcnJheShsZW5ndGgpO2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7YVtpXT1TdHJpbmcuZnJvbUNoYXJDb2RlKEhFQVBVOFtwYXlsb2FkK2ldKX1zdHI9YS5qb2luKCIiKX1fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiKGRlc3RydWN0b3JzLHZhbHVlKXtpZih2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXt2YWx1ZT1uZXcgVWludDhBcnJheSh2YWx1ZSl9dmFyIGxlbmd0aDt2YXIgdmFsdWVJc09mVHlwZVN0cmluZz10eXBlb2YgdmFsdWU9PSJzdHJpbmciO2lmKCEodmFsdWVJc09mVHlwZVN0cmluZ3x8dmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5fHx2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4Q2xhbXBlZEFycmF5fHx2YWx1ZSBpbnN0YW5jZW9mIEludDhBcnJheSkpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIHN0ZDo6c3RyaW5nIil9aWYoc3RkU3RyaW5nSXNVVEY4JiZ2YWx1ZUlzT2ZUeXBlU3RyaW5nKXtsZW5ndGg9bGVuZ3RoQnl0ZXNVVEY4KHZhbHVlKX1lbHNle2xlbmd0aD12YWx1ZS5sZW5ndGh9dmFyIGJhc2U9X21hbGxvYyg0K2xlbmd0aCsxKTt2YXIgcHRyPWJhc2UrNDtIRUFQVTMyW2Jhc2U+PjJdPWxlbmd0aDtpZihzdGRTdHJpbmdJc1VURjgmJnZhbHVlSXNPZlR5cGVTdHJpbmcpe3N0cmluZ1RvVVRGOCh2YWx1ZSxwdHIsbGVuZ3RoKzEpfWVsc2V7aWYodmFsdWVJc09mVHlwZVN0cmluZyl7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXt2YXIgY2hhckNvZGU9dmFsdWUuY2hhckNvZGVBdChpKTtpZihjaGFyQ29kZT4yNTUpe19mcmVlKHB0cik7dGhyb3dCaW5kaW5nRXJyb3IoIlN0cmluZyBoYXMgVVRGLTE2IGNvZGUgdW5pdHMgdGhhdCBkbyBub3QgZml0IGluIDggYml0cyIpfUhFQVBVOFtwdHIraV09Y2hhckNvZGV9fWVsc2V7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXtIRUFQVThbcHRyK2ldPXZhbHVlW2ldfX19aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKF9mcmVlLGJhc2UpfXJldHVybiBiYXNlfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpyZWFkUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpfX0pfTt2YXIgVVRGMTZEZWNvZGVyPXR5cGVvZiBUZXh0RGVjb2RlciE9InVuZGVmaW5lZCI/bmV3IFRleHREZWNvZGVyKCJ1dGYtMTZsZSIpOnVuZGVmaW5lZDt2YXIgVVRGMTZUb1N0cmluZz0ocHRyLG1heEJ5dGVzVG9SZWFkKT0+e3ZhciBlbmRQdHI9cHRyO3ZhciBpZHg9ZW5kUHRyPj4xO3ZhciBtYXhJZHg9aWR4K21heEJ5dGVzVG9SZWFkLzI7d2hpbGUoIShpZHg+PW1heElkeCkmJkhFQVBVMTZbaWR4XSkrK2lkeDtlbmRQdHI9aWR4PDwxO2lmKGVuZFB0ci1wdHI+MzImJlVURjE2RGVjb2RlcilyZXR1cm4gVVRGMTZEZWNvZGVyLmRlY29kZShIRUFQVTguc3ViYXJyYXkocHRyLGVuZFB0cikpO3ZhciBzdHI9IiI7Zm9yKHZhciBpPTA7IShpPj1tYXhCeXRlc1RvUmVhZC8yKTsrK2kpe3ZhciBjb2RlVW5pdD1IRUFQMTZbcHRyK2kqMj4+MV07aWYoY29kZVVuaXQ9PTApYnJlYWs7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGVVbml0KX1yZXR1cm4gc3RyfTt2YXIgc3RyaW5nVG9VVEYxNj0oc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpPT57aWYobWF4Qnl0ZXNUb1dyaXRlPT09dW5kZWZpbmVkKXttYXhCeXRlc1RvV3JpdGU9MjE0NzQ4MzY0N31pZihtYXhCeXRlc1RvV3JpdGU8MilyZXR1cm4gMDttYXhCeXRlc1RvV3JpdGUtPTI7dmFyIHN0YXJ0UHRyPW91dFB0cjt2YXIgbnVtQ2hhcnNUb1dyaXRlPW1heEJ5dGVzVG9Xcml0ZTxzdHIubGVuZ3RoKjI/bWF4Qnl0ZXNUb1dyaXRlLzI6c3RyLmxlbmd0aDtmb3IodmFyIGk9MDtpPG51bUNoYXJzVG9Xcml0ZTsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtIRUFQMTZbb3V0UHRyPj4xXT1jb2RlVW5pdDtvdXRQdHIrPTJ9SEVBUDE2W291dFB0cj4+MV09MDtyZXR1cm4gb3V0UHRyLXN0YXJ0UHRyfTt2YXIgbGVuZ3RoQnl0ZXNVVEYxNj1zdHI9PnN0ci5sZW5ndGgqMjt2YXIgVVRGMzJUb1N0cmluZz0ocHRyLG1heEJ5dGVzVG9SZWFkKT0+e3ZhciBpPTA7dmFyIHN0cj0iIjt3aGlsZSghKGk+PW1heEJ5dGVzVG9SZWFkLzQpKXt2YXIgdXRmMzI9SEVBUDMyW3B0citpKjQ+PjJdO2lmKHV0ZjMyPT0wKWJyZWFrOysraTtpZih1dGYzMj49NjU1MzYpe3ZhciBjaD11dGYzMi02NTUzNjtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8Y2g+PjEwLDU2MzIwfGNoJjEwMjMpfWVsc2V7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHV0ZjMyKX19cmV0dXJuIHN0cn07dmFyIHN0cmluZ1RvVVRGMzI9KHN0cixvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKT0+e2lmKG1heEJ5dGVzVG9Xcml0ZT09PXVuZGVmaW5lZCl7bWF4Qnl0ZXNUb1dyaXRlPTIxNDc0ODM2NDd9aWYobWF4Qnl0ZXNUb1dyaXRlPDQpcmV0dXJuIDA7dmFyIHN0YXJ0UHRyPW91dFB0cjt2YXIgZW5kUHRyPXN0YXJ0UHRyK21heEJ5dGVzVG9Xcml0ZS00O2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtpZihjb2RlVW5pdD49NTUyOTYmJmNvZGVVbml0PD01NzM0Myl7dmFyIHRyYWlsU3Vycm9nYXRlPXN0ci5jaGFyQ29kZUF0KCsraSk7Y29kZVVuaXQ9NjU1MzYrKChjb2RlVW5pdCYxMDIzKTw8MTApfHRyYWlsU3Vycm9nYXRlJjEwMjN9SEVBUDMyW291dFB0cj4+Ml09Y29kZVVuaXQ7b3V0UHRyKz00O2lmKG91dFB0cis0PmVuZFB0cilicmVha31IRUFQMzJbb3V0UHRyPj4yXT0wO3JldHVybiBvdXRQdHItc3RhcnRQdHJ9O3ZhciBsZW5ndGhCeXRlc1VURjMyPXN0cj0+e3ZhciBsZW49MDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7aWYoY29kZVVuaXQ+PTU1Mjk2JiZjb2RlVW5pdDw9NTczNDMpKytpO2xlbis9NH1yZXR1cm4gbGVufTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmc9KHJhd1R5cGUsY2hhclNpemUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIGRlY29kZVN0cmluZyxlbmNvZGVTdHJpbmcsZ2V0SGVhcCxsZW5ndGhCeXRlc1VURixzaGlmdDtpZihjaGFyU2l6ZT09PTIpe2RlY29kZVN0cmluZz1VVEYxNlRvU3RyaW5nO2VuY29kZVN0cmluZz1zdHJpbmdUb1VURjE2O2xlbmd0aEJ5dGVzVVRGPWxlbmd0aEJ5dGVzVVRGMTY7Z2V0SGVhcD0oKT0+SEVBUFUxNjtzaGlmdD0xfWVsc2UgaWYoY2hhclNpemU9PT00KXtkZWNvZGVTdHJpbmc9VVRGMzJUb1N0cmluZztlbmNvZGVTdHJpbmc9c3RyaW5nVG9VVEYzMjtsZW5ndGhCeXRlc1VURj1sZW5ndGhCeXRlc1VURjMyO2dldEhlYXA9KCk9PkhFQVBVMzI7c2hpZnQ9Mn1yZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOnZhbHVlPT57dmFyIGxlbmd0aD1IRUFQVTMyW3ZhbHVlPj4yXTt2YXIgSEVBUD1nZXRIZWFwKCk7dmFyIHN0cjt2YXIgZGVjb2RlU3RhcnRQdHI9dmFsdWUrNDtmb3IodmFyIGk9MDtpPD1sZW5ndGg7KytpKXt2YXIgY3VycmVudEJ5dGVQdHI9dmFsdWUrNCtpKmNoYXJTaXplO2lmKGk9PWxlbmd0aHx8SEVBUFtjdXJyZW50Qnl0ZVB0cj4+c2hpZnRdPT0wKXt2YXIgbWF4UmVhZEJ5dGVzPWN1cnJlbnRCeXRlUHRyLWRlY29kZVN0YXJ0UHRyO3ZhciBzdHJpbmdTZWdtZW50PWRlY29kZVN0cmluZyhkZWNvZGVTdGFydFB0cixtYXhSZWFkQnl0ZXMpO2lmKHN0cj09PXVuZGVmaW5lZCl7c3RyPXN0cmluZ1NlZ21lbnR9ZWxzZXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoMCk7c3RyKz1zdHJpbmdTZWdtZW50fWRlY29kZVN0YXJ0UHRyPWN1cnJlbnRCeXRlUHRyK2NoYXJTaXplfX1fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyx2YWx1ZSk9PntpZighKHR5cGVvZiB2YWx1ZT09InN0cmluZyIpKXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBDKysgc3RyaW5nIHR5cGUgJHtuYW1lfWApfXZhciBsZW5ndGg9bGVuZ3RoQnl0ZXNVVEYodmFsdWUpO3ZhciBwdHI9X21hbGxvYyg0K2xlbmd0aCtjaGFyU2l6ZSk7SEVBUFUzMltwdHI+PjJdPWxlbmd0aD4+c2hpZnQ7ZW5jb2RlU3RyaW5nKHZhbHVlLHB0cis0LGxlbmd0aCtjaGFyU2l6ZSk7aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKF9mcmVlLHB0cil9cmV0dXJuIHB0cn0sImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6c2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXIsZGVzdHJ1Y3RvckZ1bmN0aW9uKHB0cil7X2ZyZWUocHRyKX19KX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQ9KHJhd1R5cGUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse2lzVm9pZDp0cnVlLG5hbWU6bmFtZSwiYXJnUGFja0FkdmFuY2UiOjAsImZyb21XaXJlVHlwZSI6KCk9PnVuZGVmaW5lZCwidG9XaXJlVHlwZSI6KGRlc3RydWN0b3JzLG8pPT51bmRlZmluZWR9KX07dmFyIG5vd0lzTW9ub3RvbmljPTE7dmFyIF9fZW1zY3JpcHRlbl9nZXRfbm93X2lzX21vbm90b25pYz0oKT0+bm93SXNNb25vdG9uaWM7dmFyIF9fZW12YWxfaW5jcmVmPWhhbmRsZT0+e2lmKGhhbmRsZT40KXtlbXZhbF9oYW5kbGVzLmdldChoYW5kbGUpLnJlZmNvdW50Kz0xfX07dmFyIHJlcXVpcmVSZWdpc3RlcmVkVHlwZT0ocmF3VHlwZSxodW1hbk5hbWUpPT57dmFyIGltcGw9cmVnaXN0ZXJlZFR5cGVzW3Jhd1R5cGVdO2lmKHVuZGVmaW5lZD09PWltcGwpe3Rocm93QmluZGluZ0Vycm9yKGh1bWFuTmFtZSsiIGhhcyB1bmtub3duIHR5cGUgIitnZXRUeXBlTmFtZShyYXdUeXBlKSl9cmV0dXJuIGltcGx9O3ZhciBfX2VtdmFsX3Rha2VfdmFsdWU9KHR5cGUsYXJnKT0+e3R5cGU9cmVxdWlyZVJlZ2lzdGVyZWRUeXBlKHR5cGUsIl9lbXZhbF90YWtlX3ZhbHVlIik7dmFyIHY9dHlwZVsicmVhZFZhbHVlRnJvbVBvaW50ZXIiXShhcmcpO3JldHVybiBFbXZhbC50b0hhbmRsZSh2KX07ZnVuY3Rpb24gX19tbWFwX2pzKGxlbixwcm90LGZsYWdzLGZkLG9mZnNldF9sb3csb2Zmc2V0X2hpZ2gsYWxsb2NhdGVkLGFkZHIpe3ZhciBvZmZzZXQ9Y29udmVydEkzMlBhaXJUb0k1M0NoZWNrZWQob2Zmc2V0X2xvdyxvZmZzZXRfaGlnaCk7dHJ5e2lmKGlzTmFOKG9mZnNldCkpcmV0dXJuIDYxO3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTt2YXIgcmVzPUZTLm1tYXAoc3RyZWFtLGxlbixvZmZzZXQscHJvdCxmbGFncyk7dmFyIHB0cj1yZXMucHRyO0hFQVAzMlthbGxvY2F0ZWQ+PjJdPXJlcy5hbGxvY2F0ZWQ7SEVBUFUzMlthZGRyPj4yXT1wdHI7cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlLm5hbWU9PT0iRXJybm9FcnJvciIpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fbXVubWFwX2pzKGFkZHIsbGVuLHByb3QsZmxhZ3MsZmQsb2Zmc2V0X2xvdyxvZmZzZXRfaGlnaCl7dmFyIG9mZnNldD1jb252ZXJ0STMyUGFpclRvSTUzQ2hlY2tlZChvZmZzZXRfbG93LG9mZnNldF9oaWdoKTt0cnl7aWYoaXNOYU4ob2Zmc2V0KSlyZXR1cm4gNjE7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO2lmKHByb3QmMil7U1lTQ0FMTFMuZG9Nc3luYyhhZGRyLHN0cmVhbSxsZW4sZmxhZ3Msb2Zmc2V0KX1GUy5tdW5tYXAoc3RyZWFtKX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUubmFtZT09PSJFcnJub0Vycm9yIikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319dmFyIF9hYm9ydD0oKT0+e2Fib3J0KCIiKX07dmFyIF9lbXNjcmlwdGVuX2RhdGVfbm93PSgpPT5EYXRlLm5vdygpO3ZhciBnZXRIZWFwTWF4PSgpPT5IRUFQVTgubGVuZ3RoO3ZhciBfZW1zY3JpcHRlbl9nZXRfaGVhcF9tYXg9KCk9PmdldEhlYXBNYXgoKTt2YXIgX2Vtc2NyaXB0ZW5fZ2V0X25vdztfZW1zY3JpcHRlbl9nZXRfbm93PSgpPT5wZXJmb3JtYW5jZS5ub3coKTt2YXIgX2Vtc2NyaXB0ZW5fbWVtY3B5X2pzPShkZXN0LHNyYyxudW0pPT5IRUFQVTguY29weVdpdGhpbihkZXN0LHNyYyxzcmMrbnVtKTt2YXIgYWJvcnRPbkNhbm5vdEdyb3dNZW1vcnk9cmVxdWVzdGVkU2l6ZT0+e2Fib3J0KCJPT00iKX07dmFyIF9lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwPXJlcXVlc3RlZFNpemU9Pnt2YXIgb2xkU2l6ZT1IRUFQVTgubGVuZ3RoO3JlcXVlc3RlZFNpemU+Pj49MDthYm9ydE9uQ2Fubm90R3Jvd01lbW9yeShyZXF1ZXN0ZWRTaXplKX07dmFyIEVOVj17fTt2YXIgZ2V0RXhlY3V0YWJsZU5hbWU9KCk9PnRoaXNQcm9ncmFtfHwiLi90aGlzLnByb2dyYW0iO3ZhciBnZXRFbnZTdHJpbmdzPSgpPT57aWYoIWdldEVudlN0cmluZ3Muc3RyaW5ncyl7dmFyIGxhbmc9KHR5cGVvZiBuYXZpZ2F0b3I9PSJvYmplY3QiJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzWzBdfHwiQyIpLnJlcGxhY2UoIi0iLCJfIikrIi5VVEYtOCI7dmFyIGVudj17IlVTRVIiOiJ3ZWJfdXNlciIsIkxPR05BTUUiOiJ3ZWJfdXNlciIsIlBBVEgiOiIvIiwiUFdEIjoiLyIsIkhPTUUiOiIvaG9tZS93ZWJfdXNlciIsIkxBTkciOmxhbmcsIl8iOmdldEV4ZWN1dGFibGVOYW1lKCl9O2Zvcih2YXIgeCBpbiBFTlYpe2lmKEVOVlt4XT09PXVuZGVmaW5lZClkZWxldGUgZW52W3hdO2Vsc2UgZW52W3hdPUVOVlt4XX12YXIgc3RyaW5ncz1bXTtmb3IodmFyIHggaW4gZW52KXtzdHJpbmdzLnB1c2goYCR7eH09JHtlbnZbeF19YCl9Z2V0RW52U3RyaW5ncy5zdHJpbmdzPXN0cmluZ3N9cmV0dXJuIGdldEVudlN0cmluZ3Muc3RyaW5nc307dmFyIHN0cmluZ1RvQXNjaWk9KHN0cixidWZmZXIpPT57Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7SEVBUDhbYnVmZmVyKys+PjBdPXN0ci5jaGFyQ29kZUF0KGkpfUhFQVA4W2J1ZmZlcj4+MF09MH07dmFyIF9lbnZpcm9uX2dldD0oX19lbnZpcm9uLGVudmlyb25fYnVmKT0+e3ZhciBidWZTaXplPTA7Z2V0RW52U3RyaW5ncygpLmZvckVhY2goKHN0cmluZyxpKT0+e3ZhciBwdHI9ZW52aXJvbl9idWYrYnVmU2l6ZTtIRUFQVTMyW19fZW52aXJvbitpKjQ+PjJdPXB0cjtzdHJpbmdUb0FzY2lpKHN0cmluZyxwdHIpO2J1ZlNpemUrPXN0cmluZy5sZW5ndGgrMX0pO3JldHVybiAwfTt2YXIgX2Vudmlyb25fc2l6ZXNfZ2V0PShwZW52aXJvbl9jb3VudCxwZW52aXJvbl9idWZfc2l6ZSk9Pnt2YXIgc3RyaW5ncz1nZXRFbnZTdHJpbmdzKCk7SEVBUFUzMltwZW52aXJvbl9jb3VudD4+Ml09c3RyaW5ncy5sZW5ndGg7dmFyIGJ1ZlNpemU9MDtzdHJpbmdzLmZvckVhY2goc3RyaW5nPT5idWZTaXplKz1zdHJpbmcubGVuZ3RoKzEpO0hFQVBVMzJbcGVudmlyb25fYnVmX3NpemU+PjJdPWJ1ZlNpemU7cmV0dXJuIDB9O3ZhciBydW50aW1lS2VlcGFsaXZlQ291bnRlcj0wO3ZhciBrZWVwUnVudGltZUFsaXZlPSgpPT5ub0V4aXRSdW50aW1lfHxydW50aW1lS2VlcGFsaXZlQ291bnRlcj4wO3ZhciBfcHJvY19leGl0PWNvZGU9PntFWElUU1RBVFVTPWNvZGU7aWYoIWtlZXBSdW50aW1lQWxpdmUoKSl7aWYoTW9kdWxlWyJvbkV4aXQiXSlNb2R1bGVbIm9uRXhpdCJdKGNvZGUpO0FCT1JUPXRydWV9cXVpdF8oY29kZSxuZXcgRXhpdFN0YXR1cyhjb2RlKSl9O3ZhciBleGl0SlM9KHN0YXR1cyxpbXBsaWNpdCk9PntFWElUU1RBVFVTPXN0YXR1cztpZigha2VlcFJ1bnRpbWVBbGl2ZSgpKXtleGl0UnVudGltZSgpfV9wcm9jX2V4aXQoc3RhdHVzKX07dmFyIF9leGl0PWV4aXRKUztmdW5jdGlvbiBfZmRfY2xvc2UoZmQpe3RyeXt2YXIgc3RyZWFtPVNZU0NBTExTLmdldFN0cmVhbUZyb21GRChmZCk7RlMuY2xvc2Uoc3RyZWFtKTtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUubmFtZT09PSJFcnJub0Vycm9yIikpdGhyb3cgZTtyZXR1cm4gZS5lcnJub319dmFyIGRvUmVhZHY9KHN0cmVhbSxpb3YsaW92Y250LG9mZnNldCk9Pnt2YXIgcmV0PTA7Zm9yKHZhciBpPTA7aTxpb3ZjbnQ7aSsrKXt2YXIgcHRyPUhFQVBVMzJbaW92Pj4yXTt2YXIgbGVuPUhFQVBVMzJbaW92KzQ+PjJdO2lvdis9ODt2YXIgY3Vycj1GUy5yZWFkKHN0cmVhbSxIRUFQOCxwdHIsbGVuLG9mZnNldCk7aWYoY3VycjwwKXJldHVybi0xO3JldCs9Y3VycjtpZihjdXJyPGxlbilicmVhaztpZih0eXBlb2Ygb2Zmc2V0IT09InVuZGVmaW5lZCIpe29mZnNldCs9Y3Vycn19cmV0dXJuIHJldH07ZnVuY3Rpb24gX2ZkX3JlYWQoZmQsaW92LGlvdmNudCxwbnVtKXt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3ZhciBudW09ZG9SZWFkdihzdHJlYW0saW92LGlvdmNudCk7SEVBUFUzMltwbnVtPj4yXT1udW07cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlLm5hbWU9PT0iRXJybm9FcnJvciIpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIF9mZF9zZWVrKGZkLG9mZnNldF9sb3csb2Zmc2V0X2hpZ2gsd2hlbmNlLG5ld09mZnNldCl7dmFyIG9mZnNldD1jb252ZXJ0STMyUGFpclRvSTUzQ2hlY2tlZChvZmZzZXRfbG93LG9mZnNldF9oaWdoKTt0cnl7aWYoaXNOYU4ob2Zmc2V0KSlyZXR1cm4gNjE7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO0ZTLmxsc2VlayhzdHJlYW0sb2Zmc2V0LHdoZW5jZSk7dGVtcEk2ND1bc3RyZWFtLnBvc2l0aW9uPj4+MCwodGVtcERvdWJsZT1zdHJlYW0ucG9zaXRpb24sK01hdGguYWJzKHRlbXBEb3VibGUpPj0xP3RlbXBEb3VibGU+MD8rTWF0aC5mbG9vcih0ZW1wRG91YmxlLzQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKHRlbXBEb3VibGUtKyh+fnRlbXBEb3VibGU+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApXSxIRUFQMzJbbmV3T2Zmc2V0Pj4yXT10ZW1wSTY0WzBdLEhFQVAzMltuZXdPZmZzZXQrND4+Ml09dGVtcEk2NFsxXTtpZihzdHJlYW0uZ2V0ZGVudHMmJm9mZnNldD09PTAmJndoZW5jZT09PTApc3RyZWFtLmdldGRlbnRzPW51bGw7cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlLm5hbWU9PT0iRXJybm9FcnJvciIpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIF9mZF9zeW5jKGZkKXt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO2lmKHN0cmVhbS5zdHJlYW1fb3BzJiZzdHJlYW0uc3RyZWFtX29wcy5mc3luYyl7cmV0dXJuIHN0cmVhbS5zdHJlYW1fb3BzLmZzeW5jKHN0cmVhbSl9cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlLm5hbWU9PT0iRXJybm9FcnJvciIpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fXZhciBkb1dyaXRldj0oc3RyZWFtLGlvdixpb3ZjbnQsb2Zmc2V0KT0+e3ZhciByZXQ9MDtmb3IodmFyIGk9MDtpPGlvdmNudDtpKyspe3ZhciBwdHI9SEVBUFUzMltpb3Y+PjJdO3ZhciBsZW49SEVBUFUzMltpb3YrND4+Ml07aW92Kz04O3ZhciBjdXJyPUZTLndyaXRlKHN0cmVhbSxIRUFQOCxwdHIsbGVuLG9mZnNldCk7aWYoY3VycjwwKXJldHVybi0xO3JldCs9Y3VycjtpZih0eXBlb2Ygb2Zmc2V0IT09InVuZGVmaW5lZCIpe29mZnNldCs9Y3Vycn19cmV0dXJuIHJldH07ZnVuY3Rpb24gX2ZkX3dyaXRlKGZkLGlvdixpb3ZjbnQscG51bSl7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTt2YXIgbnVtPWRvV3JpdGV2KHN0cmVhbSxpb3YsaW92Y250KTtIRUFQVTMyW3BudW0+PjJdPW51bTtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUubmFtZT09PSJFcnJub0Vycm9yIikpdGhyb3cgZTtyZXR1cm4gZS5lcnJub319dmFyIF9nZXRlbnRyb3B5PShidWZmZXIsc2l6ZSk9PntyYW5kb21GaWxsKEhFQVBVOC5zdWJhcnJheShidWZmZXIsYnVmZmVyK3NpemUpKTtyZXR1cm4gMH07dmFyIGlzTGVhcFllYXI9eWVhcj0+eWVhciU0PT09MCYmKHllYXIlMTAwIT09MHx8eWVhciU0MDA9PT0wKTt2YXIgYXJyYXlTdW09KGFycmF5LGluZGV4KT0+e3ZhciBzdW09MDtmb3IodmFyIGk9MDtpPD1pbmRleDtzdW0rPWFycmF5W2krK10pe31yZXR1cm4gc3VtfTt2YXIgTU9OVEhfREFZU19MRUFQPVszMSwyOSwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07dmFyIE1PTlRIX0RBWVNfUkVHVUxBUj1bMzEsMjgsMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdO3ZhciBhZGREYXlzPShkYXRlLGRheXMpPT57dmFyIG5ld0RhdGU9bmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpO3doaWxlKGRheXM+MCl7dmFyIGxlYXA9aXNMZWFwWWVhcihuZXdEYXRlLmdldEZ1bGxZZWFyKCkpO3ZhciBjdXJyZW50TW9udGg9bmV3RGF0ZS5nZXRNb250aCgpO3ZhciBkYXlzSW5DdXJyZW50TW9udGg9KGxlYXA/TU9OVEhfREFZU19MRUFQOk1PTlRIX0RBWVNfUkVHVUxBUilbY3VycmVudE1vbnRoXTtpZihkYXlzPmRheXNJbkN1cnJlbnRNb250aC1uZXdEYXRlLmdldERhdGUoKSl7ZGF5cy09ZGF5c0luQ3VycmVudE1vbnRoLW5ld0RhdGUuZ2V0RGF0ZSgpKzE7bmV3RGF0ZS5zZXREYXRlKDEpO2lmKGN1cnJlbnRNb250aDwxMSl7bmV3RGF0ZS5zZXRNb250aChjdXJyZW50TW9udGgrMSl9ZWxzZXtuZXdEYXRlLnNldE1vbnRoKDApO25ld0RhdGUuc2V0RnVsbFllYXIobmV3RGF0ZS5nZXRGdWxsWWVhcigpKzEpfX1lbHNle25ld0RhdGUuc2V0RGF0ZShuZXdEYXRlLmdldERhdGUoKStkYXlzKTtyZXR1cm4gbmV3RGF0ZX19cmV0dXJuIG5ld0RhdGV9O3ZhciB3cml0ZUFycmF5VG9NZW1vcnk9KGFycmF5LGJ1ZmZlcik9PntIRUFQOC5zZXQoYXJyYXksYnVmZmVyKX07dmFyIF9zdHJmdGltZT0ocyxtYXhzaXplLGZvcm1hdCx0bSk9Pnt2YXIgdG1fem9uZT1IRUFQVTMyW3RtKzQwPj4yXTt2YXIgZGF0ZT17dG1fc2VjOkhFQVAzMlt0bT4+Ml0sdG1fbWluOkhFQVAzMlt0bSs0Pj4yXSx0bV9ob3VyOkhFQVAzMlt0bSs4Pj4yXSx0bV9tZGF5OkhFQVAzMlt0bSsxMj4+Ml0sdG1fbW9uOkhFQVAzMlt0bSsxNj4+Ml0sdG1feWVhcjpIRUFQMzJbdG0rMjA+PjJdLHRtX3dkYXk6SEVBUDMyW3RtKzI0Pj4yXSx0bV95ZGF5OkhFQVAzMlt0bSsyOD4+Ml0sdG1faXNkc3Q6SEVBUDMyW3RtKzMyPj4yXSx0bV9nbXRvZmY6SEVBUDMyW3RtKzM2Pj4yXSx0bV96b25lOnRtX3pvbmU/VVRGOFRvU3RyaW5nKHRtX3pvbmUpOiIifTt2YXIgcGF0dGVybj1VVEY4VG9TdHJpbmcoZm9ybWF0KTt2YXIgRVhQQU5TSU9OX1JVTEVTXzE9eyIlYyI6IiVhICViICVkICVIOiVNOiVTICVZIiwiJUQiOiIlbS8lZC8leSIsIiVGIjoiJVktJW0tJWQiLCIlaCI6IiViIiwiJXIiOiIlSTolTTolUyAlcCIsIiVSIjoiJUg6JU0iLCIlVCI6IiVIOiVNOiVTIiwiJXgiOiIlbS8lZC8leSIsIiVYIjoiJUg6JU06JVMiLCIlRWMiOiIlYyIsIiVFQyI6IiVDIiwiJUV4IjoiJW0vJWQvJXkiLCIlRVgiOiIlSDolTTolUyIsIiVFeSI6IiV5IiwiJUVZIjoiJVkiLCIlT2QiOiIlZCIsIiVPZSI6IiVlIiwiJU9IIjoiJUgiLCIlT0kiOiIlSSIsIiVPbSI6IiVtIiwiJU9NIjoiJU0iLCIlT1MiOiIlUyIsIiVPdSI6IiV1IiwiJU9VIjoiJVUiLCIlT1YiOiIlViIsIiVPdyI6IiV3IiwiJU9XIjoiJVciLCIlT3kiOiIleSJ9O2Zvcih2YXIgcnVsZSBpbiBFWFBBTlNJT05fUlVMRVNfMSl7cGF0dGVybj1wYXR0ZXJuLnJlcGxhY2UobmV3IFJlZ0V4cChydWxlLCJnIiksRVhQQU5TSU9OX1JVTEVTXzFbcnVsZV0pfXZhciBXRUVLREFZUz1bIlN1bmRheSIsIk1vbmRheSIsIlR1ZXNkYXkiLCJXZWRuZXNkYXkiLCJUaHVyc2RheSIsIkZyaWRheSIsIlNhdHVyZGF5Il07dmFyIE1PTlRIUz1bIkphbnVhcnkiLCJGZWJydWFyeSIsIk1hcmNoIiwiQXByaWwiLCJNYXkiLCJKdW5lIiwiSnVseSIsIkF1Z3VzdCIsIlNlcHRlbWJlciIsIk9jdG9iZXIiLCJOb3ZlbWJlciIsIkRlY2VtYmVyIl07ZnVuY3Rpb24gbGVhZGluZ1NvbWV0aGluZyh2YWx1ZSxkaWdpdHMsY2hhcmFjdGVyKXt2YXIgc3RyPXR5cGVvZiB2YWx1ZT09Im51bWJlciI/dmFsdWUudG9TdHJpbmcoKTp2YWx1ZXx8IiI7d2hpbGUoc3RyLmxlbmd0aDxkaWdpdHMpe3N0cj1jaGFyYWN0ZXJbMF0rc3RyfXJldHVybiBzdHJ9ZnVuY3Rpb24gbGVhZGluZ051bGxzKHZhbHVlLGRpZ2l0cyl7cmV0dXJuIGxlYWRpbmdTb21ldGhpbmcodmFsdWUsZGlnaXRzLCIwIil9ZnVuY3Rpb24gY29tcGFyZUJ5RGF5KGRhdGUxLGRhdGUyKXtmdW5jdGlvbiBzZ24odmFsdWUpe3JldHVybiB2YWx1ZTwwPy0xOnZhbHVlPjA/MTowfXZhciBjb21wYXJlO2lmKChjb21wYXJlPXNnbihkYXRlMS5nZXRGdWxsWWVhcigpLWRhdGUyLmdldEZ1bGxZZWFyKCkpKT09PTApe2lmKChjb21wYXJlPXNnbihkYXRlMS5nZXRNb250aCgpLWRhdGUyLmdldE1vbnRoKCkpKT09PTApe2NvbXBhcmU9c2duKGRhdGUxLmdldERhdGUoKS1kYXRlMi5nZXREYXRlKCkpfX1yZXR1cm4gY29tcGFyZX1mdW5jdGlvbiBnZXRGaXJzdFdlZWtTdGFydERhdGUoamFuRm91cnRoKXtzd2l0Y2goamFuRm91cnRoLmdldERheSgpKXtjYXNlIDA6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gamFuRm91cnRoO2Nhc2UgMjpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCksMCwzKTtjYXNlIDM6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLDAsMik7Y2FzZSA0OnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCktMSwxMSwzMSk7Y2FzZSA2OnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKS0xLDExLDMwKX19ZnVuY3Rpb24gZ2V0V2Vla0Jhc2VkWWVhcihkYXRlKXt2YXIgdGhpc0RhdGU9YWRkRGF5cyhuZXcgRGF0ZShkYXRlLnRtX3llYXIrMTkwMCwwLDEpLGRhdGUudG1feWRheSk7dmFyIGphbkZvdXJ0aFRoaXNZZWFyPW5ldyBEYXRlKHRoaXNEYXRlLmdldEZ1bGxZZWFyKCksMCw0KTt2YXIgamFuRm91cnRoTmV4dFllYXI9bmV3IERhdGUodGhpc0RhdGUuZ2V0RnVsbFllYXIoKSsxLDAsNCk7dmFyIGZpcnN0V2Vla1N0YXJ0VGhpc1llYXI9Z2V0Rmlyc3RXZWVrU3RhcnREYXRlKGphbkZvdXJ0aFRoaXNZZWFyKTt2YXIgZmlyc3RXZWVrU3RhcnROZXh0WWVhcj1nZXRGaXJzdFdlZWtTdGFydERhdGUoamFuRm91cnRoTmV4dFllYXIpO2lmKGNvbXBhcmVCeURheShmaXJzdFdlZWtTdGFydFRoaXNZZWFyLHRoaXNEYXRlKTw9MCl7aWYoY29tcGFyZUJ5RGF5KGZpcnN0V2Vla1N0YXJ0TmV4dFllYXIsdGhpc0RhdGUpPD0wKXtyZXR1cm4gdGhpc0RhdGUuZ2V0RnVsbFllYXIoKSsxfXJldHVybiB0aGlzRGF0ZS5nZXRGdWxsWWVhcigpfXJldHVybiB0aGlzRGF0ZS5nZXRGdWxsWWVhcigpLTF9dmFyIEVYUEFOU0lPTl9SVUxFU18yPXsiJWEiOmRhdGU9PldFRUtEQVlTW2RhdGUudG1fd2RheV0uc3Vic3RyaW5nKDAsMyksIiVBIjpkYXRlPT5XRUVLREFZU1tkYXRlLnRtX3dkYXldLCIlYiI6ZGF0ZT0+TU9OVEhTW2RhdGUudG1fbW9uXS5zdWJzdHJpbmcoMCwzKSwiJUIiOmRhdGU9Pk1PTlRIU1tkYXRlLnRtX21vbl0sIiVDIjpkYXRlPT57dmFyIHllYXI9ZGF0ZS50bV95ZWFyKzE5MDA7cmV0dXJuIGxlYWRpbmdOdWxscyh5ZWFyLzEwMHwwLDIpfSwiJWQiOmRhdGU9PmxlYWRpbmdOdWxscyhkYXRlLnRtX21kYXksMiksIiVlIjpkYXRlPT5sZWFkaW5nU29tZXRoaW5nKGRhdGUudG1fbWRheSwyLCIgIiksIiVnIjpkYXRlPT5nZXRXZWVrQmFzZWRZZWFyKGRhdGUpLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLCIlRyI6ZGF0ZT0+Z2V0V2Vla0Jhc2VkWWVhcihkYXRlKSwiJUgiOmRhdGU9PmxlYWRpbmdOdWxscyhkYXRlLnRtX2hvdXIsMiksIiVJIjpkYXRlPT57dmFyIHR3ZWx2ZUhvdXI9ZGF0ZS50bV9ob3VyO2lmKHR3ZWx2ZUhvdXI9PTApdHdlbHZlSG91cj0xMjtlbHNlIGlmKHR3ZWx2ZUhvdXI+MTIpdHdlbHZlSG91ci09MTI7cmV0dXJuIGxlYWRpbmdOdWxscyh0d2VsdmVIb3VyLDIpfSwiJWoiOmRhdGU9PmxlYWRpbmdOdWxscyhkYXRlLnRtX21kYXkrYXJyYXlTdW0oaXNMZWFwWWVhcihkYXRlLnRtX3llYXIrMTkwMCk/TU9OVEhfREFZU19MRUFQOk1PTlRIX0RBWVNfUkVHVUxBUixkYXRlLnRtX21vbi0xKSwzKSwiJW0iOmRhdGU9PmxlYWRpbmdOdWxscyhkYXRlLnRtX21vbisxLDIpLCIlTSI6ZGF0ZT0+bGVhZGluZ051bGxzKGRhdGUudG1fbWluLDIpLCIlbiI6KCk9PiJcbiIsIiVwIjpkYXRlPT57aWYoZGF0ZS50bV9ob3VyPj0wJiZkYXRlLnRtX2hvdXI8MTIpe3JldHVybiJBTSJ9cmV0dXJuIlBNIn0sIiVTIjpkYXRlPT5sZWFkaW5nTnVsbHMoZGF0ZS50bV9zZWMsMiksIiV0IjooKT0+Ilx0IiwiJXUiOmRhdGU9PmRhdGUudG1fd2RheXx8NywiJVUiOmRhdGU9Pnt2YXIgZGF5cz1kYXRlLnRtX3lkYXkrNy1kYXRlLnRtX3dkYXk7cmV0dXJuIGxlYWRpbmdOdWxscyhNYXRoLmZsb29yKGRheXMvNyksMil9LCIlViI6ZGF0ZT0+e3ZhciB2YWw9TWF0aC5mbG9vcigoZGF0ZS50bV95ZGF5KzctKGRhdGUudG1fd2RheSs2KSU3KS83KTtpZigoZGF0ZS50bV93ZGF5KzM3MS1kYXRlLnRtX3lkYXktMiklNzw9Mil7dmFsKyt9aWYoIXZhbCl7dmFsPTUyO3ZhciBkZWMzMT0oZGF0ZS50bV93ZGF5KzctZGF0ZS50bV95ZGF5LTEpJTc7aWYoZGVjMzE9PTR8fGRlYzMxPT01JiZpc0xlYXBZZWFyKGRhdGUudG1feWVhciU0MDAtMSkpe3ZhbCsrfX1lbHNlIGlmKHZhbD09NTMpe3ZhciBqYW4xPShkYXRlLnRtX3dkYXkrMzcxLWRhdGUudG1feWRheSklNztpZihqYW4xIT00JiYoamFuMSE9M3x8IWlzTGVhcFllYXIoZGF0ZS50bV95ZWFyKSkpdmFsPTF9cmV0dXJuIGxlYWRpbmdOdWxscyh2YWwsMil9LCIldyI6ZGF0ZT0+ZGF0ZS50bV93ZGF5LCIlVyI6ZGF0ZT0+e3ZhciBkYXlzPWRhdGUudG1feWRheSs3LShkYXRlLnRtX3dkYXkrNiklNztyZXR1cm4gbGVhZGluZ051bGxzKE1hdGguZmxvb3IoZGF5cy83KSwyKX0sIiV5IjpkYXRlPT4oZGF0ZS50bV95ZWFyKzE5MDApLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLCIlWSI6ZGF0ZT0+ZGF0ZS50bV95ZWFyKzE5MDAsIiV6IjpkYXRlPT57dmFyIG9mZj1kYXRlLnRtX2dtdG9mZjt2YXIgYWhlYWQ9b2ZmPj0wO29mZj1NYXRoLmFicyhvZmYpLzYwO29mZj1vZmYvNjAqMTAwK29mZiU2MDtyZXR1cm4oYWhlYWQ/IisiOiItIikrU3RyaW5nKCIwMDAwIitvZmYpLnNsaWNlKC00KX0sIiVaIjpkYXRlPT5kYXRlLnRtX3pvbmUsIiUlIjooKT0+IiUifTtwYXR0ZXJuPXBhdHRlcm4ucmVwbGFjZSgvJSUvZywiXDBcMCIpO2Zvcih2YXIgcnVsZSBpbiBFWFBBTlNJT05fUlVMRVNfMil7aWYocGF0dGVybi5pbmNsdWRlcyhydWxlKSl7cGF0dGVybj1wYXR0ZXJuLnJlcGxhY2UobmV3IFJlZ0V4cChydWxlLCJnIiksRVhQQU5TSU9OX1JVTEVTXzJbcnVsZV0oZGF0ZSkpfX1wYXR0ZXJuPXBhdHRlcm4ucmVwbGFjZSgvXDBcMC9nLCIlIik7dmFyIGJ5dGVzPWludEFycmF5RnJvbVN0cmluZyhwYXR0ZXJuLGZhbHNlKTtpZihieXRlcy5sZW5ndGg+bWF4c2l6ZSl7cmV0dXJuIDB9d3JpdGVBcnJheVRvTWVtb3J5KGJ5dGVzLHMpO3JldHVybiBieXRlcy5sZW5ndGgtMX07dmFyIF9zdHJmdGltZV9sPShzLG1heHNpemUsZm9ybWF0LHRtLGxvYyk9Pl9zdHJmdGltZShzLG1heHNpemUsZm9ybWF0LHRtKTt2YXIgRlNOb2RlPWZ1bmN0aW9uKHBhcmVudCxuYW1lLG1vZGUscmRldil7aWYoIXBhcmVudCl7cGFyZW50PXRoaXN9dGhpcy5wYXJlbnQ9cGFyZW50O3RoaXMubW91bnQ9cGFyZW50Lm1vdW50O3RoaXMubW91bnRlZD1udWxsO3RoaXMuaWQ9RlMubmV4dElub2RlKys7dGhpcy5uYW1lPW5hbWU7dGhpcy5tb2RlPW1vZGU7dGhpcy5ub2RlX29wcz17fTt0aGlzLnN0cmVhbV9vcHM9e307dGhpcy5yZGV2PXJkZXZ9O3ZhciByZWFkTW9kZT0yOTJ8NzM7dmFyIHdyaXRlTW9kZT0xNDY7T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoRlNOb2RlLnByb3RvdHlwZSx7cmVhZDp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMubW9kZSZyZWFkTW9kZSk9PT1yZWFkTW9kZX0sc2V0OmZ1bmN0aW9uKHZhbCl7dmFsP3RoaXMubW9kZXw9cmVhZE1vZGU6dGhpcy5tb2RlJj1+cmVhZE1vZGV9fSx3cml0ZTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMubW9kZSZ3cml0ZU1vZGUpPT09d3JpdGVNb2RlfSxzZXQ6ZnVuY3Rpb24odmFsKXt2YWw/dGhpcy5tb2RlfD13cml0ZU1vZGU6dGhpcy5tb2RlJj1+d3JpdGVNb2RlfX0saXNGb2xkZXI6e2dldDpmdW5jdGlvbigpe3JldHVybiBGUy5pc0Rpcih0aGlzLm1vZGUpfX0saXNEZXZpY2U6e2dldDpmdW5jdGlvbigpe3JldHVybiBGUy5pc0NocmRldih0aGlzLm1vZGUpfX19KTtGUy5GU05vZGU9RlNOb2RlO0ZTLmNyZWF0ZVByZWxvYWRlZEZpbGU9RlNfY3JlYXRlUHJlbG9hZGVkRmlsZTtGUy5zdGF0aWNJbml0KCk7ZW1iaW5kX2luaXRfY2hhckNvZGVzKCk7QmluZGluZ0Vycm9yPU1vZHVsZVsiQmluZGluZ0Vycm9yIl09Y2xhc3MgQmluZGluZ0Vycm9yIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3IobWVzc2FnZSl7c3VwZXIobWVzc2FnZSk7dGhpcy5uYW1lPSJCaW5kaW5nRXJyb3IifX07SW50ZXJuYWxFcnJvcj1Nb2R1bGVbIkludGVybmFsRXJyb3IiXT1jbGFzcyBJbnRlcm5hbEVycm9yIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3IobWVzc2FnZSl7c3VwZXIobWVzc2FnZSk7dGhpcy5uYW1lPSJJbnRlcm5hbEVycm9yIn19O2luaXRfQ2xhc3NIYW5kbGUoKTtpbml0X2VtYmluZCgpO2luaXRfUmVnaXN0ZXJlZFBvaW50ZXIoKTtVbmJvdW5kVHlwZUVycm9yPU1vZHVsZVsiVW5ib3VuZFR5cGVFcnJvciJdPWV4dGVuZEVycm9yKEVycm9yLCJVbmJvdW5kVHlwZUVycm9yIik7aGFuZGxlQWxsb2NhdG9ySW5pdCgpO2luaXRfZW12YWwoKTt2YXIgd2FzbUltcG9ydHM9e2E6X19fYXNzZXJ0X2ZhaWwsdDpfX19jeGFfYmVnaW5fY2F0Y2gsczpfX19jeGFfZW5kX2NhdGNoLGM6X19fY3hhX2ZpbmRfbWF0Y2hpbmdfY2F0Y2hfMixqOl9fX2N4YV9maW5kX21hdGNoaW5nX2NhdGNoXzMsb2E6X19fY3hhX3JldGhyb3csbTpfX19jeGFfdGhyb3csZzpfX19yZXN1bWVFeGNlcHRpb24sZWE6X19fc3lzY2FsbF9mc3RhdDY0LFI6X19fc3lzY2FsbF9mdHJ1bmNhdGU2NCxjYTpfX19zeXNjYWxsX25ld2ZzdGF0YXQsZmE6X19fc3lzY2FsbF9vcGVuYXQsXzpfX19zeXNjYWxsX3JlYWRsaW5rYXQsWjpfX19zeXNjYWxsX3JlbmFtZWF0LGRhOl9fX3N5c2NhbGxfc3RhdDY0LFg6X19fc3lzY2FsbF91bmxpbmthdCxTOl9fZW1iaW5kX3JlZ2lzdGVyX2JpZ2ludCxqYTpfX2VtYmluZF9yZWdpc3Rlcl9ib29sLE46X19lbWJpbmRfcmVnaXN0ZXJfY2xhc3MsTTpfX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19jb25zdHJ1Y3RvcixsOl9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2Z1bmN0aW9uLGlhOl9fZW1iaW5kX3JlZ2lzdGVyX2VtdmFsLEg6X19lbWJpbmRfcmVnaXN0ZXJfZmxvYXQsbzpfX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyLGs6X19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXcsRzpfX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nLHo6X19lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmcsa2E6X19lbWJpbmRfcmVnaXN0ZXJfdm9pZCxnYTpfX2Vtc2NyaXB0ZW5fZ2V0X25vd19pc19tb25vdG9uaWMsc2E6X19lbXZhbF9kZWNyZWYsdGE6X19lbXZhbF9pbmNyZWYscTpfX2VtdmFsX3Rha2VfdmFsdWUsTzpfX21tYXBfanMsUDpfX211bm1hcF9qcyxiOl9hYm9ydCxFOl9lbXNjcmlwdGVuX2RhdGVfbm93LFk6X2Vtc2NyaXB0ZW5fZ2V0X2hlYXBfbWF4LHc6X2Vtc2NyaXB0ZW5fZ2V0X25vdyxoYTpfZW1zY3JpcHRlbl9tZW1jcHlfanMsVzpfZW1zY3JpcHRlbl9yZXNpemVfaGVhcCwkOl9lbnZpcm9uX2dldCxhYTpfZW52aXJvbl9zaXplc19nZXQsbGE6X2V4aXQsRjpfZmRfY2xvc2UsRDpfZmRfcmVhZCxROl9mZF9zZWVrLGJhOl9mZF9zeW5jLHk6X2ZkX3dyaXRlLFU6X2dldGVudHJvcHkscmE6aW52b2tlX2ZpLEM6aW52b2tlX2ksZjppbnZva2VfaWksbmE6aW52b2tlX2lpZGlpLHFhOmludm9rZV9paWYsZDppbnZva2VfaWlpLGU6aW52b2tlX2lpaWksQjppbnZva2VfaWlpaWksdjppbnZva2VfaWlpaWlpLEs6aW52b2tlX2lpaWlpaWksVDppbnZva2VfaWlqLHA6aW52b2tlX3YsaTppbnZva2VfdmksaDppbnZva2VfdmlpLHI6aW52b2tlX3ZpaWQsQTppbnZva2VfdmlpZGksbjppbnZva2VfdmlpaSxwYTppbnZva2VfdmlpaWRpaWksTDppbnZva2VfdmlpaWksSTppbnZva2VfdmlpaWlkaSxKOmludm9rZV92aWlpaWksdTppbnZva2VfdmlpaWlpaWlkaSx4Omludm9rZV92aWlpaWlpaWksVjpfc3RyZnRpbWVfbCxtYTp4bm5Mb2FkV2FzbU1vZHVsZUpTfTt2YXIgd2FzbUV4cG9ydHM9Y3JlYXRlV2FzbSgpO3ZhciBfX193YXNtX2NhbGxfY3RvcnM9KCk9PihfX193YXNtX2NhbGxfY3RvcnM9d2FzbUV4cG9ydHNbInZhIl0pKCk7dmFyIF9tYWxsb2M9YTA9PihfbWFsbG9jPXdhc21FeHBvcnRzWyJ4YSJdKShhMCk7dmFyIF9mcmVlPWEwPT4oX2ZyZWU9d2FzbUV4cG9ydHNbInlhIl0pKGEwKTt2YXIgX19fZXJybm9fbG9jYXRpb249KCk9PihfX19lcnJub19sb2NhdGlvbj13YXNtRXhwb3J0c1siemEiXSkoKTt2YXIgX19fZ2V0VHlwZU5hbWU9YTA9PihfX19nZXRUeXBlTmFtZT13YXNtRXhwb3J0c1siQWEiXSkoYTApO3ZhciBfX19mdW5jc19vbl9leGl0PSgpPT4oX19fZnVuY3Nfb25fZXhpdD13YXNtRXhwb3J0c1siQmEiXSkoKTt2YXIgX2ZmbHVzaD1Nb2R1bGVbIl9mZmx1c2giXT1hMD0+KF9mZmx1c2g9TW9kdWxlWyJfZmZsdXNoIl09d2FzbUV4cG9ydHNbIkNhIl0pKGEwKTt2YXIgX2Vtc2NyaXB0ZW5fYnVpbHRpbl9tZW1hbGlnbj0oYTAsYTEpPT4oX2Vtc2NyaXB0ZW5fYnVpbHRpbl9tZW1hbGlnbj13YXNtRXhwb3J0c1siRGEiXSkoYTAsYTEpO3ZhciBfc2V0VGhyZXc9KGEwLGExKT0+KF9zZXRUaHJldz13YXNtRXhwb3J0c1siRWEiXSkoYTAsYTEpO3ZhciBzZXRUZW1wUmV0MD1hMD0+KHNldFRlbXBSZXQwPXdhc21FeHBvcnRzWyJGYSJdKShhMCk7dmFyIHN0YWNrU2F2ZT0oKT0+KHN0YWNrU2F2ZT13YXNtRXhwb3J0c1siR2EiXSkoKTt2YXIgc3RhY2tSZXN0b3JlPWEwPT4oc3RhY2tSZXN0b3JlPXdhc21FeHBvcnRzWyJIYSJdKShhMCk7dmFyIF9fX2N4YV9kZWNyZW1lbnRfZXhjZXB0aW9uX3JlZmNvdW50PWEwPT4oX19fY3hhX2RlY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQ9d2FzbUV4cG9ydHNbIklhIl0pKGEwKTt2YXIgX19fY3hhX2luY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQ9YTA9PihfX19jeGFfaW5jcmVtZW50X2V4Y2VwdGlvbl9yZWZjb3VudD13YXNtRXhwb3J0c1siSmEiXSkoYTApO3ZhciBfX19jeGFfY2FuX2NhdGNoPShhMCxhMSxhMik9PihfX19jeGFfY2FuX2NhdGNoPXdhc21FeHBvcnRzWyJLYSJdKShhMCxhMSxhMik7dmFyIF9fX2N4YV9pc19wb2ludGVyX3R5cGU9YTA9PihfX19jeGFfaXNfcG9pbnRlcl90eXBlPXdhc21FeHBvcnRzWyJMYSJdKShhMCk7dmFyIGR5bkNhbGxfdmlpamo9TW9kdWxlWyJkeW5DYWxsX3ZpaWpqIl09KGEwLGExLGEyLGEzLGE0LGE1LGE2KT0+KGR5bkNhbGxfdmlpamo9TW9kdWxlWyJkeW5DYWxsX3ZpaWpqIl09d2FzbUV4cG9ydHNbIk1hIl0pKGEwLGExLGEyLGEzLGE0LGE1LGE2KTt2YXIgZHluQ2FsbF92aWlpampqPU1vZHVsZVsiZHluQ2FsbF92aWlpampqIl09KGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5KT0+KGR5bkNhbGxfdmlpaWpqaj1Nb2R1bGVbImR5bkNhbGxfdmlpaWpqaiJdPXdhc21FeHBvcnRzWyJOYSJdKShhMCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSk7dmFyIGR5bkNhbGxfaWlpaWo9TW9kdWxlWyJkeW5DYWxsX2lpaWlqIl09KGEwLGExLGEyLGEzLGE0LGE1KT0+KGR5bkNhbGxfaWlpaWo9TW9kdWxlWyJkeW5DYWxsX2lpaWlqIl09d2FzbUV4cG9ydHNbIk9hIl0pKGEwLGExLGEyLGEzLGE0LGE1KTt2YXIgZHluQ2FsbF9qaWk9TW9kdWxlWyJkeW5DYWxsX2ppaSJdPShhMCxhMSxhMik9PihkeW5DYWxsX2ppaT1Nb2R1bGVbImR5bkNhbGxfamlpIl09d2FzbUV4cG9ydHNbIlBhIl0pKGEwLGExLGEyKTt2YXIgZHluQ2FsbF9qamo9TW9kdWxlWyJkeW5DYWxsX2pqaiJdPShhMCxhMSxhMixhMyxhNCk9PihkeW5DYWxsX2pqaj1Nb2R1bGVbImR5bkNhbGxfampqIl09d2FzbUV4cG9ydHNbIlFhIl0pKGEwLGExLGEyLGEzLGE0KTt2YXIgZHluQ2FsbF9paWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlqaiJdPShhMCxhMSxhMixhMyxhNCxhNSxhNixhNyk9PihkeW5DYWxsX2lpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWpqIl09d2FzbUV4cG9ydHNbIlJhIl0pKGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3KTt2YXIgZHluQ2FsbF92aWlqamk9TW9kdWxlWyJkeW5DYWxsX3ZpaWpqaSJdPShhMCxhMSxhMixhMyxhNCxhNSxhNixhNyk9PihkeW5DYWxsX3ZpaWpqaT1Nb2R1bGVbImR5bkNhbGxfdmlpamppIl09d2FzbUV4cG9ydHNbIlNhIl0pKGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3KTt2YXIgZHluQ2FsbF9paWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpamoiXT0oYTAsYTEsYTIsYTMsYTQsYTUsYTYpPT4oZHluQ2FsbF9paWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpamoiXT13YXNtRXhwb3J0c1siVGEiXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYpO3ZhciBkeW5DYWxsX3ZpaWpqaj1Nb2R1bGVbImR5bkNhbGxfdmlpampqIl09KGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4KT0+KGR5bkNhbGxfdmlpampqPU1vZHVsZVsiZHluQ2FsbF92aWlqamoiXT13YXNtRXhwb3J0c1siVWEiXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgpO3ZhciBkeW5DYWxsX2lpaj1Nb2R1bGVbImR5bkNhbGxfaWlqIl09KGEwLGExLGEyLGEzKT0+KGR5bkNhbGxfaWlqPU1vZHVsZVsiZHluQ2FsbF9paWoiXT13YXNtRXhwb3J0c1siVmEiXSkoYTAsYTEsYTIsYTMpO3ZhciBkeW5DYWxsX2lpamppaWlpPU1vZHVsZVsiZHluQ2FsbF9paWpqaWlpaSJdPShhMCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSk9PihkeW5DYWxsX2lpamppaWlpPU1vZHVsZVsiZHluQ2FsbF9paWpqaWlpaSJdPXdhc21FeHBvcnRzWyJXYSJdKShhMCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSk7dmFyIGR5bkNhbGxfamlqaT1Nb2R1bGVbImR5bkNhbGxfamlqaSJdPShhMCxhMSxhMixhMyxhNCk9PihkeW5DYWxsX2ppamk9TW9kdWxlWyJkeW5DYWxsX2ppamkiXT13YXNtRXhwb3J0c1siWGEiXSkoYTAsYTEsYTIsYTMsYTQpO3ZhciBkeW5DYWxsX3ZpaWppaT1Nb2R1bGVbImR5bkNhbGxfdmlpamlpIl09KGEwLGExLGEyLGEzLGE0LGE1LGE2KT0+KGR5bkNhbGxfdmlpamlpPU1vZHVsZVsiZHluQ2FsbF92aWlqaWkiXT13YXNtRXhwb3J0c1siWWEiXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYpO3ZhciBkeW5DYWxsX2lpaWlpaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlqIl09KGEwLGExLGEyLGEzLGE0LGE1LGE2KT0+KGR5bkNhbGxfaWlpaWlqPU1vZHVsZVsiZHluQ2FsbF9paWlpaWoiXT13YXNtRXhwb3J0c1siWmEiXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYpO3ZhciBkeW5DYWxsX2lpaWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpamoiXT0oYTAsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgpPT4oZHluQ2FsbF9paWlpaWpqPU1vZHVsZVsiZHluQ2FsbF9paWlpaWpqIl09d2FzbUV4cG9ydHNbIl9hIl0pKGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4KTt2YXIgZHluQ2FsbF9paWlpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlpamoiXT0oYTAsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpPT4oZHluQ2FsbF9paWlpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlpamoiXT13YXNtRXhwb3J0c1siJGEiXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpO3ZhciBfX19zdGFydF9lbV9qcz1Nb2R1bGVbIl9fX3N0YXJ0X2VtX2pzIl09MjYxNDYwO3ZhciBfX19zdG9wX2VtX2pzPU1vZHVsZVsiX19fc3RvcF9lbV9qcyJdPTI2MjA3MjtmdW5jdGlvbiBpbnZva2VfaWkoaW5kZXgsYTEpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWkoaW5kZXgsYTEsYTIpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWkoaW5kZXgsYTEsYTIpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpKGluZGV4LGExKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCxhNSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpKGluZGV4LGExLGEyLGEzKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaShpbmRleCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfZmkoaW5kZXgsYTEpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWYoaW5kZXgsYTEsYTIpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdihpbmRleCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWlpaWlkaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaShpbmRleCxhMSxhMixhMyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWlkaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNil7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWRpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYsYTcpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWQoaW5kZXgsYTEsYTIsYTMpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlkaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlkaWkoaW5kZXgsYTEsYTIsYTMsYTQpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWooaW5kZXgsYTEsYTIsYTMpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGR5bkNhbGxfaWlqKGluZGV4LGExLGEyLGEzKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19dmFyIGNhbGxlZFJ1bjtkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9ZnVuY3Rpb24gcnVuQ2FsbGVyKCl7aWYoIWNhbGxlZFJ1bilydW4oKTtpZighY2FsbGVkUnVuKWRlcGVuZGVuY2llc0Z1bGZpbGxlZD1ydW5DYWxsZXJ9O2Z1bmN0aW9uIHJ1bigpe2lmKHJ1bkRlcGVuZGVuY2llcz4wKXtyZXR1cm59cHJlUnVuKCk7aWYocnVuRGVwZW5kZW5jaWVzPjApe3JldHVybn1mdW5jdGlvbiBkb1J1bigpe2lmKGNhbGxlZFJ1bilyZXR1cm47Y2FsbGVkUnVuPXRydWU7TW9kdWxlWyJjYWxsZWRSdW4iXT10cnVlO2lmKEFCT1JUKXJldHVybjtpbml0UnVudGltZSgpO3JlYWR5UHJvbWlzZVJlc29sdmUoTW9kdWxlKTtpZihNb2R1bGVbIm9uUnVudGltZUluaXRpYWxpemVkIl0pTW9kdWxlWyJvblJ1bnRpbWVJbml0aWFsaXplZCJdKCk7cG9zdFJ1bigpfWlmKE1vZHVsZVsic2V0U3RhdHVzIl0pe01vZHVsZVsic2V0U3RhdHVzIl0oIlJ1bm5pbmcuLi4iKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe01vZHVsZVsic2V0U3RhdHVzIl0oIiIpfSwxKTtkb1J1bigpfSwxKX1lbHNle2RvUnVuKCl9fWlmKE1vZHVsZVsicHJlSW5pdCJdKXtpZih0eXBlb2YgTW9kdWxlWyJwcmVJbml0Il09PSJmdW5jdGlvbiIpTW9kdWxlWyJwcmVJbml0Il09W01vZHVsZVsicHJlSW5pdCJdXTt3aGlsZShNb2R1bGVbInByZUluaXQiXS5sZW5ndGg+MCl7TW9kdWxlWyJwcmVJbml0Il0ucG9wKCkoKX19cnVuKCk7CgoKICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5Cn0KKTsKfSkoKTsKOwpjcmVhdGVXYXNtTW9ub0luc3RhbmNlID0gTW9kdWxlOyB9ICAgIAogICAgCiAgICAgICAgICAgIGxldCBjcmVhdGVXYXNtTXVsdGlJbnN0YW5jZTsgewoKdmFyIE1vZHVsZSA9ICgoKSA9PiB7CiAgdmFyIF9zY3JpcHREaXIgPSBsb2NhdGlvbi5ocmVmOwogIAogIHJldHVybiAoCmZ1bmN0aW9uKG1vZHVsZUFyZyA9IHt9KSB7Cgp2YXIgTW9kdWxlPW1vZHVsZUFyZzt2YXIgcmVhZHlQcm9taXNlUmVzb2x2ZSxyZWFkeVByb21pc2VSZWplY3Q7TW9kdWxlWyJyZWFkeSJdPW5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntyZWFkeVByb21pc2VSZXNvbHZlPXJlc29sdmU7cmVhZHlQcm9taXNlUmVqZWN0PXJlamVjdH0pO3ZhciBtb2R1bGVPdmVycmlkZXM9T2JqZWN0LmFzc2lnbih7fSxNb2R1bGUpO3ZhciBhcmd1bWVudHNfPVtdO3ZhciB0aGlzUHJvZ3JhbT0iLi90aGlzLnByb2dyYW0iO3ZhciBxdWl0Xz0oc3RhdHVzLHRvVGhyb3cpPT57dGhyb3cgdG9UaHJvd307dmFyIEVOVklST05NRU5UX0lTX1dFQj10eXBlb2Ygd2luZG93PT0ib2JqZWN0Ijt2YXIgRU5WSVJPTk1FTlRfSVNfV09SS0VSPXR5cGVvZiBpbXBvcnRTY3JpcHRzPT0iZnVuY3Rpb24iO3ZhciBFTlZJUk9OTUVOVF9JU19OT0RFPXR5cGVvZiBwcm9jZXNzPT0ib2JqZWN0IiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnM9PSJvYmplY3QiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlPT0ic3RyaW5nIjt2YXIgRU5WSVJPTk1FTlRfSVNfUFRIUkVBRD1Nb2R1bGVbIkVOVklST05NRU5UX0lTX1BUSFJFQUQiXXx8ZmFsc2U7dmFyIHNjcmlwdERpcmVjdG9yeT0iIjtmdW5jdGlvbiBsb2NhdGVGaWxlKHBhdGgpe2lmKE1vZHVsZVsibG9jYXRlRmlsZSJdKXtyZXR1cm4gTW9kdWxlWyJsb2NhdGVGaWxlIl0ocGF0aCxzY3JpcHREaXJlY3RvcnkpfXJldHVybiBzY3JpcHREaXJlY3RvcnkrcGF0aH12YXIgcmVhZF8scmVhZEFzeW5jLHJlYWRCaW5hcnk7aWYoRU5WSVJPTk1FTlRfSVNfV0VCfHxFTlZJUk9OTUVOVF9JU19XT1JLRVIpe2lmKEVOVklST05NRU5UX0lTX1dPUktFUil7c2NyaXB0RGlyZWN0b3J5PXNlbGYubG9jYXRpb24uaHJlZn1lbHNlIGlmKHR5cGVvZiBkb2N1bWVudCE9InVuZGVmaW5lZCImJmRvY3VtZW50LmN1cnJlbnRTY3JpcHQpe3NjcmlwdERpcmVjdG9yeT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY31pZihfc2NyaXB0RGlyKXtzY3JpcHREaXJlY3Rvcnk9X3NjcmlwdERpcn1pZihzY3JpcHREaXJlY3RvcnkuaW5kZXhPZigiYmxvYjoiKSE9PTApe3NjcmlwdERpcmVjdG9yeT1zY3JpcHREaXJlY3Rvcnkuc3Vic3RyKDAsc2NyaXB0RGlyZWN0b3J5LnJlcGxhY2UoL1s/I10uKi8sIiIpLmxhc3RJbmRleE9mKCIvIikrMSl9ZWxzZXtzY3JpcHREaXJlY3Rvcnk9IiJ9e3JlYWRfPXVybD0+e3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJHRVQiLHVybCxmYWxzZSk7eGhyLnNlbmQobnVsbCk7cmV0dXJuIHhoci5yZXNwb25zZVRleHR9O2lmKEVOVklST05NRU5UX0lTX1dPUktFUil7cmVhZEJpbmFyeT11cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlKX19cmVhZEFzeW5jPSh1cmwsb25sb2FkLG9uZXJyb3IpPT57dmFyIHhocj1uZXcgWE1MSHR0cFJlcXVlc3Q7eGhyLm9wZW4oIkdFVCIsdXJsLHRydWUpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIub25sb2FkPSgpPT57aWYoeGhyLnN0YXR1cz09MjAwfHx4aHIuc3RhdHVzPT0wJiZ4aHIucmVzcG9uc2Upe29ubG9hZCh4aHIucmVzcG9uc2UpO3JldHVybn1vbmVycm9yKCl9O3hoci5vbmVycm9yPW9uZXJyb3I7eGhyLnNlbmQobnVsbCl9fX1lbHNle312YXIgb3V0PU1vZHVsZVsicHJpbnQiXXx8Y29uc29sZS5sb2cuYmluZChjb25zb2xlKTt2YXIgZXJyPU1vZHVsZVsicHJpbnRFcnIiXXx8Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oTW9kdWxlLG1vZHVsZU92ZXJyaWRlcyk7bW9kdWxlT3ZlcnJpZGVzPW51bGw7aWYoTW9kdWxlWyJhcmd1bWVudHMiXSlhcmd1bWVudHNfPU1vZHVsZVsiYXJndW1lbnRzIl07aWYoTW9kdWxlWyJ0aGlzUHJvZ3JhbSJdKXRoaXNQcm9ncmFtPU1vZHVsZVsidGhpc1Byb2dyYW0iXTtpZihNb2R1bGVbInF1aXQiXSlxdWl0Xz1Nb2R1bGVbInF1aXQiXTt2YXIgd2FzbUJpbmFyeTtpZihNb2R1bGVbIndhc21CaW5hcnkiXSl3YXNtQmluYXJ5PU1vZHVsZVsid2FzbUJpbmFyeSJdO2lmKHR5cGVvZiBXZWJBc3NlbWJseSE9Im9iamVjdCIpe2Fib3J0KCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkIil9dmFyIHdhc21NZW1vcnk7dmFyIHdhc21Nb2R1bGU7dmFyIEFCT1JUPWZhbHNlO3ZhciBFWElUU1RBVFVTO2Z1bmN0aW9uIGFzc2VydChjb25kaXRpb24sdGV4dCl7aWYoIWNvbmRpdGlvbil7YWJvcnQodGV4dCl9fXZhciBIRUFQOCxIRUFQVTgsSEVBUDE2LEhFQVBVMTYsSEVBUDMyLEhFQVBVMzIsSEVBUEYzMixIRUFQRjY0O2Z1bmN0aW9uIHVwZGF0ZU1lbW9yeVZpZXdzKCl7dmFyIGI9d2FzbU1lbW9yeS5idWZmZXI7TW9kdWxlWyJIRUFQOCJdPUhFQVA4PW5ldyBJbnQ4QXJyYXkoYik7TW9kdWxlWyJIRUFQMTYiXT1IRUFQMTY9bmV3IEludDE2QXJyYXkoYik7TW9kdWxlWyJIRUFQVTgiXT1IRUFQVTg9bmV3IFVpbnQ4QXJyYXkoYik7TW9kdWxlWyJIRUFQVTE2Il09SEVBUFUxNj1uZXcgVWludDE2QXJyYXkoYik7TW9kdWxlWyJIRUFQMzIiXT1IRUFQMzI9bmV3IEludDMyQXJyYXkoYik7TW9kdWxlWyJIRUFQVTMyIl09SEVBUFUzMj1uZXcgVWludDMyQXJyYXkoYik7TW9kdWxlWyJIRUFQRjMyIl09SEVBUEYzMj1uZXcgRmxvYXQzMkFycmF5KGIpO01vZHVsZVsiSEVBUEY2NCJdPUhFQVBGNjQ9bmV3IEZsb2F0NjRBcnJheShiKX12YXIgSU5JVElBTF9NRU1PUlk9TW9kdWxlWyJJTklUSUFMX01FTU9SWSJdfHwxMzQyMTc3Mjg7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCl7d2FzbU1lbW9yeT1Nb2R1bGVbIndhc21NZW1vcnkiXX1lbHNle2lmKE1vZHVsZVsid2FzbU1lbW9yeSJdKXt3YXNtTWVtb3J5PU1vZHVsZVsid2FzbU1lbW9yeSJdfWVsc2V7d2FzbU1lbW9yeT1uZXcgV2ViQXNzZW1ibHkuTWVtb3J5KHsiaW5pdGlhbCI6SU5JVElBTF9NRU1PUlkvNjU1MzYsIm1heGltdW0iOklOSVRJQUxfTUVNT1JZLzY1NTM2LCJzaGFyZWQiOnRydWV9KTtpZighKHdhc21NZW1vcnkuYnVmZmVyIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXIpKXtlcnIoInJlcXVlc3RlZCBhIHNoYXJlZCBXZWJBc3NlbWJseS5NZW1vcnkgYnV0IHRoZSByZXR1cm5lZCBidWZmZXIgaXMgbm90IGEgU2hhcmVkQXJyYXlCdWZmZXIsIGluZGljYXRpbmcgdGhhdCB3aGlsZSB0aGUgYnJvd3NlciBoYXMgU2hhcmVkQXJyYXlCdWZmZXIgaXQgZG9lcyBub3QgaGF2ZSBXZWJBc3NlbWJseSB0aHJlYWRzIHN1cHBvcnQgLSB5b3UgbWF5IG5lZWQgdG8gc2V0IGEgZmxhZyIpO2lmKEVOVklST05NRU5UX0lTX05PREUpe2VycigiKG9uIG5vZGUgeW91IG1heSBuZWVkOiAtLWV4cGVyaW1lbnRhbC13YXNtLXRocmVhZHMgLS1leHBlcmltZW50YWwtd2FzbS1idWxrLW1lbW9yeSBhbmQvb3IgcmVjZW50IHZlcnNpb24pIil9dGhyb3cgRXJyb3IoImJhZCBtZW1vcnkiKX19fXVwZGF0ZU1lbW9yeVZpZXdzKCk7SU5JVElBTF9NRU1PUlk9d2FzbU1lbW9yeS5idWZmZXIuYnl0ZUxlbmd0aDt2YXIgX19BVFBSRVJVTl9fPVtdO3ZhciBfX0FUSU5JVF9fPVtdO3ZhciBfX0FURVhJVF9fPVtdO3ZhciBfX0FUUE9TVFJVTl9fPVtdO3ZhciBydW50aW1lSW5pdGlhbGl6ZWQ9ZmFsc2U7dmFyIHJ1bnRpbWVFeGl0ZWQ9ZmFsc2U7ZnVuY3Rpb24gcHJlUnVuKCl7aWYoTW9kdWxlWyJwcmVSdW4iXSl7aWYodHlwZW9mIE1vZHVsZVsicHJlUnVuIl09PSJmdW5jdGlvbiIpTW9kdWxlWyJwcmVSdW4iXT1bTW9kdWxlWyJwcmVSdW4iXV07d2hpbGUoTW9kdWxlWyJwcmVSdW4iXS5sZW5ndGgpe2FkZE9uUHJlUnVuKE1vZHVsZVsicHJlUnVuIl0uc2hpZnQoKSl9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQUkVSVU5fXyl9ZnVuY3Rpb24gaW5pdFJ1bnRpbWUoKXtydW50aW1lSW5pdGlhbGl6ZWQ9dHJ1ZTtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybjtpZighTW9kdWxlWyJub0ZTSW5pdCJdJiYhRlMuaW5pdC5pbml0aWFsaXplZClGUy5pbml0KCk7RlMuaWdub3JlUGVybWlzc2lvbnM9ZmFsc2U7VFRZLmluaXQoKTtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUSU5JVF9fKX1mdW5jdGlvbiBleGl0UnVudGltZSgpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuO19fX2Z1bmNzX29uX2V4aXQoKTtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FURVhJVF9fKTtGUy5xdWl0KCk7VFRZLnNodXRkb3duKCk7UFRocmVhZC50ZXJtaW5hdGVBbGxUaHJlYWRzKCk7cnVudGltZUV4aXRlZD10cnVlfWZ1bmN0aW9uIHBvc3RSdW4oKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybjtpZihNb2R1bGVbInBvc3RSdW4iXSl7aWYodHlwZW9mIE1vZHVsZVsicG9zdFJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicG9zdFJ1biJdPVtNb2R1bGVbInBvc3RSdW4iXV07d2hpbGUoTW9kdWxlWyJwb3N0UnVuIl0ubGVuZ3RoKXthZGRPblBvc3RSdW4oTW9kdWxlWyJwb3N0UnVuIl0uc2hpZnQoKSl9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQT1NUUlVOX18pfWZ1bmN0aW9uIGFkZE9uUHJlUnVuKGNiKXtfX0FUUFJFUlVOX18udW5zaGlmdChjYil9ZnVuY3Rpb24gYWRkT25Jbml0KGNiKXtfX0FUSU5JVF9fLnVuc2hpZnQoY2IpfWZ1bmN0aW9uIGFkZE9uUG9zdFJ1bihjYil7X19BVFBPU1RSVU5fXy51bnNoaWZ0KGNiKX12YXIgcnVuRGVwZW5kZW5jaWVzPTA7dmFyIHJ1bkRlcGVuZGVuY3lXYXRjaGVyPW51bGw7dmFyIGRlcGVuZGVuY2llc0Z1bGZpbGxlZD1udWxsO2Z1bmN0aW9uIGdldFVuaXF1ZVJ1bkRlcGVuZGVuY3koaWQpe3JldHVybiBpZH1mdW5jdGlvbiBhZGRSdW5EZXBlbmRlbmN5KGlkKXtydW5EZXBlbmRlbmNpZXMrKztpZihNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXSl7TW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0ocnVuRGVwZW5kZW5jaWVzKX19ZnVuY3Rpb24gcmVtb3ZlUnVuRGVwZW5kZW5jeShpZCl7cnVuRGVwZW5kZW5jaWVzLS07aWYoTW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0pe01vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKHJ1bkRlcGVuZGVuY2llcyl9aWYocnVuRGVwZW5kZW5jaWVzPT0wKXtpZihydW5EZXBlbmRlbmN5V2F0Y2hlciE9PW51bGwpe2NsZWFySW50ZXJ2YWwocnVuRGVwZW5kZW5jeVdhdGNoZXIpO3J1bkRlcGVuZGVuY3lXYXRjaGVyPW51bGx9aWYoZGVwZW5kZW5jaWVzRnVsZmlsbGVkKXt2YXIgY2FsbGJhY2s9ZGVwZW5kZW5jaWVzRnVsZmlsbGVkO2RlcGVuZGVuY2llc0Z1bGZpbGxlZD1udWxsO2NhbGxiYWNrKCl9fX1mdW5jdGlvbiBhYm9ydCh3aGF0KXtpZihNb2R1bGVbIm9uQWJvcnQiXSl7TW9kdWxlWyJvbkFib3J0Il0od2hhdCl9d2hhdD0iQWJvcnRlZCgiK3doYXQrIikiO2Vycih3aGF0KTtBQk9SVD10cnVlO0VYSVRTVEFUVVM9MTt3aGF0Kz0iLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLiI7dmFyIGU9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcih3aGF0KTtyZWFkeVByb21pc2VSZWplY3QoZSk7dGhyb3cgZX12YXIgZGF0YVVSSVByZWZpeD0iZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LCI7dmFyIGlzRGF0YVVSST1maWxlbmFtZT0+ZmlsZW5hbWUuc3RhcnRzV2l0aChkYXRhVVJJUHJlZml4KTt2YXIgd2FzbUJpbmFyeUZpbGU7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3dhc21CaW5hcnlGaWxlPSJtYWluLWJpbi1tdWx0aS53YXNtIjtpZighaXNEYXRhVVJJKHdhc21CaW5hcnlGaWxlKSl7d2FzbUJpbmFyeUZpbGU9bG9jYXRlRmlsZSh3YXNtQmluYXJ5RmlsZSl9fWVsc2V7d2FzbUJpbmFyeUZpbGU9bmV3IFVSTCgibWFpbi1iaW4tbXVsdGkud2FzbSIsbG9jYXRpb24uaHJlZikuaHJlZn1mdW5jdGlvbiBnZXRCaW5hcnlTeW5jKGZpbGUpe2lmKGZpbGU9PXdhc21CaW5hcnlGaWxlJiZ3YXNtQmluYXJ5KXtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkod2FzbUJpbmFyeSl9aWYocmVhZEJpbmFyeSl7cmV0dXJuIHJlYWRCaW5hcnkoZmlsZSl9dGhyb3ciYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWQifWZ1bmN0aW9uIGdldEJpbmFyeVByb21pc2UoYmluYXJ5RmlsZSl7aWYoIXdhc21CaW5hcnkmJihFTlZJUk9OTUVOVF9JU19XRUJ8fEVOVklST05NRU5UX0lTX1dPUktFUikpe2lmKHR5cGVvZiBmZXRjaD09ImZ1bmN0aW9uIil7cmV0dXJuIGZldGNoKGJpbmFyeUZpbGUse2NyZWRlbnRpYWxzOiJzYW1lLW9yaWdpbiJ9KS50aGVuKHJlc3BvbnNlPT57aWYoIXJlc3BvbnNlWyJvayJdKXt0aHJvdyJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICciK2JpbmFyeUZpbGUrIicifXJldHVybiByZXNwb25zZVsiYXJyYXlCdWZmZXIiXSgpfSkuY2F0Y2goKCk9PmdldEJpbmFyeVN5bmMoYmluYXJ5RmlsZSkpfX1yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKT0+Z2V0QmluYXJ5U3luYyhiaW5hcnlGaWxlKSl9ZnVuY3Rpb24gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihiaW5hcnlGaWxlLGltcG9ydHMscmVjZWl2ZXIpe3JldHVybiBnZXRCaW5hcnlQcm9taXNlKGJpbmFyeUZpbGUpLnRoZW4oYmluYXJ5PT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZShiaW5hcnksaW1wb3J0cykpLnRoZW4oaW5zdGFuY2U9Pmluc3RhbmNlKS50aGVuKHJlY2VpdmVyLHJlYXNvbj0+e2VycihgZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogJHtyZWFzb259YCk7YWJvcnQocmVhc29uKX0pfWZ1bmN0aW9uIGluc3RhbnRpYXRlQXN5bmMoYmluYXJ5LGJpbmFyeUZpbGUsaW1wb3J0cyxjYWxsYmFjayl7aWYoIWJpbmFyeSYmdHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nPT0iZnVuY3Rpb24iJiYhaXNEYXRhVVJJKGJpbmFyeUZpbGUpJiZ0eXBlb2YgZmV0Y2g9PSJmdW5jdGlvbiIpe3JldHVybiBmZXRjaChiaW5hcnlGaWxlLHtjcmVkZW50aWFsczoic2FtZS1vcmlnaW4ifSkudGhlbihyZXNwb25zZT0+e3ZhciByZXN1bHQ9V2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcocmVzcG9uc2UsaW1wb3J0cyk7cmV0dXJuIHJlc3VsdC50aGVuKGNhbGxiYWNrLGZ1bmN0aW9uKHJlYXNvbil7ZXJyKGB3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogJHtyZWFzb259YCk7ZXJyKCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvbiIpO3JldHVybiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKGJpbmFyeUZpbGUsaW1wb3J0cyxjYWxsYmFjayl9KX0pfXJldHVybiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKGJpbmFyeUZpbGUsaW1wb3J0cyxjYWxsYmFjayl9ZnVuY3Rpb24gY3JlYXRlV2FzbSgpe3ZhciBpbmZvPXsiYSI6d2FzbUltcG9ydHN9O2Z1bmN0aW9uIHJlY2VpdmVJbnN0YW5jZShpbnN0YW5jZSxtb2R1bGUpe3dhc21FeHBvcnRzPWluc3RhbmNlLmV4cG9ydHM7cmVnaXN0ZXJUTFNJbml0KHdhc21FeHBvcnRzWyJLYSJdKTt3YXNtVGFibGU9d2FzbUV4cG9ydHNbIkdhIl07YWRkT25Jbml0KHdhc21FeHBvcnRzWyJFYSJdKTt3YXNtTW9kdWxlPW1vZHVsZTtyZW1vdmVSdW5EZXBlbmRlbmN5KCJ3YXNtLWluc3RhbnRpYXRlIik7cmV0dXJuIHdhc21FeHBvcnRzfWFkZFJ1bkRlcGVuZGVuY3koIndhc20taW5zdGFudGlhdGUiKTtmdW5jdGlvbiByZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdChyZXN1bHQpe3JlY2VpdmVJbnN0YW5jZShyZXN1bHRbImluc3RhbmNlIl0scmVzdWx0WyJtb2R1bGUiXSl9aWYoTW9kdWxlWyJpbnN0YW50aWF0ZVdhc20iXSl7dHJ5e3JldHVybiBNb2R1bGVbImluc3RhbnRpYXRlV2FzbSJdKGluZm8scmVjZWl2ZUluc3RhbmNlKX1jYXRjaChlKXtlcnIoYE1vZHVsZS5pbnN0YW50aWF0ZVdhc20gY2FsbGJhY2sgZmFpbGVkIHdpdGggZXJyb3I6ICR7ZX1gKTtyZWFkeVByb21pc2VSZWplY3QoZSl9fWluc3RhbnRpYXRlQXN5bmMod2FzbUJpbmFyeSx3YXNtQmluYXJ5RmlsZSxpbmZvLHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0KS5jYXRjaChyZWFkeVByb21pc2VSZWplY3QpO3JldHVybnt9fXZhciB0ZW1wRG91YmxlO3ZhciB0ZW1wSTY0O2Z1bmN0aW9uIHhubkxvYWRXYXNtTW9kdWxlSlMoY29kZSxvZmZzZXQsb2Zmc2V0X2VuZCxpbnZhbGlkX2Z1bmN0aW9uX2luZGV4KXtjb25zdCB0YWJsZU9yaWdpbmFsU2l6ZT13YXNtVGFibGUubGVuZ3RoO2NvbnN0IGJpbmFyeT1uZXcgVWludDhBcnJheShIRUFQVTguc2xpY2UoY29kZStvZmZzZXQsY29kZStvZmZzZXRfZW5kKSk7dHJ5e3ZhciBtb2R1bGU9bmV3IFdlYkFzc2VtYmx5Lk1vZHVsZShiaW5hcnkpO3ZhciBpbnN0YW5jZT1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UobW9kdWxlLHtlbnY6e21lbW9yeTp3YXNtTWVtb3J5fX0pO2Zvcih2YXIgc3ltTmFtZSBpbiBpbnN0YW5jZS5leHBvcnRzKXt2YXIgdmFsdWU9aW5zdGFuY2UuZXhwb3J0c1tzeW1OYW1lXTthZGRGdW5jdGlvbih2YWx1ZSl9aWYodGFibGVPcmlnaW5hbFNpemU8d2FzbVRhYmxlLmxlbmd0aCl7cmV0dXJuIHRhYmxlT3JpZ2luYWxTaXplfXJldHVybiBpbnZhbGlkX2Z1bmN0aW9uX2luZGV4fWNhdGNoKGVycm9yKXtjb25zb2xlLmxvZyhlcnJvcik7cmV0dXJuIGludmFsaWRfZnVuY3Rpb25faW5kZXh9fWZ1bmN0aW9uIEV4aXRTdGF0dXMoc3RhdHVzKXt0aGlzLm5hbWU9IkV4aXRTdGF0dXMiO3RoaXMubWVzc2FnZT1gUHJvZ3JhbSB0ZXJtaW5hdGVkIHdpdGggZXhpdCgke3N0YXR1c30pYDt0aGlzLnN0YXR1cz1zdGF0dXN9dmFyIHRlcm1pbmF0ZVdvcmtlcj13b3JrZXI9Pnt3b3JrZXIudGVybWluYXRlKCk7d29ya2VyLm9ubWVzc2FnZT1lPT57fX07dmFyIGtpbGxUaHJlYWQ9cHRocmVhZF9wdHI9Pnt2YXIgd29ya2VyPVBUaHJlYWQucHRocmVhZHNbcHRocmVhZF9wdHJdO2RlbGV0ZSBQVGhyZWFkLnB0aHJlYWRzW3B0aHJlYWRfcHRyXTt0ZXJtaW5hdGVXb3JrZXIod29ya2VyKTtfX2Vtc2NyaXB0ZW5fdGhyZWFkX2ZyZWVfZGF0YShwdGhyZWFkX3B0cik7UFRocmVhZC5ydW5uaW5nV29ya2Vycy5zcGxpY2UoUFRocmVhZC5ydW5uaW5nV29ya2Vycy5pbmRleE9mKHdvcmtlciksMSk7d29ya2VyLnB0aHJlYWRfcHRyPTB9O3ZhciBjYW5jZWxUaHJlYWQ9cHRocmVhZF9wdHI9Pnt2YXIgd29ya2VyPVBUaHJlYWQucHRocmVhZHNbcHRocmVhZF9wdHJdO3dvcmtlci5wb3N0TWVzc2FnZSh7ImNtZCI6ImNhbmNlbCJ9KX07dmFyIGNsZWFudXBUaHJlYWQ9cHRocmVhZF9wdHI9Pnt2YXIgd29ya2VyPVBUaHJlYWQucHRocmVhZHNbcHRocmVhZF9wdHJdO1BUaHJlYWQucmV0dXJuV29ya2VyVG9Qb29sKHdvcmtlcil9O3ZhciB6ZXJvTWVtb3J5PShhZGRyZXNzLHNpemUpPT57SEVBUFU4LmZpbGwoMCxhZGRyZXNzLGFkZHJlc3Mrc2l6ZSk7cmV0dXJuIGFkZHJlc3N9O3ZhciBzcGF3blRocmVhZD10aHJlYWRQYXJhbXM9Pnt2YXIgd29ya2VyPVBUaHJlYWQuZ2V0TmV3V29ya2VyKCk7aWYoIXdvcmtlcil7cmV0dXJuIDZ9UFRocmVhZC5ydW5uaW5nV29ya2Vycy5wdXNoKHdvcmtlcik7UFRocmVhZC5wdGhyZWFkc1t0aHJlYWRQYXJhbXMucHRocmVhZF9wdHJdPXdvcmtlcjt3b3JrZXIucHRocmVhZF9wdHI9dGhyZWFkUGFyYW1zLnB0aHJlYWRfcHRyO3ZhciBtc2c9eyJjbWQiOiJydW4iLCJzdGFydF9yb3V0aW5lIjp0aHJlYWRQYXJhbXMuc3RhcnRSb3V0aW5lLCJhcmciOnRocmVhZFBhcmFtcy5hcmcsInB0aHJlYWRfcHRyIjp0aHJlYWRQYXJhbXMucHRocmVhZF9wdHJ9O3dvcmtlci5wb3N0TWVzc2FnZShtc2csdGhyZWFkUGFyYW1zLnRyYW5zZmVyTGlzdCk7cmV0dXJuIDB9O3ZhciBydW50aW1lS2VlcGFsaXZlQ291bnRlcj0wO3ZhciBrZWVwUnVudGltZUFsaXZlPSgpPT5ub0V4aXRSdW50aW1lfHxydW50aW1lS2VlcGFsaXZlQ291bnRlcj4wO3ZhciBQQVRIPXtpc0FiczpwYXRoPT5wYXRoLmNoYXJBdCgwKT09PSIvIixzcGxpdFBhdGg6ZmlsZW5hbWU9Pnt2YXIgc3BsaXRQYXRoUmU9L14oXC8/fCkoW1xzXFNdKj8pKCg/OlwuezEsMn18W15cL10rP3wpKFwuW14uXC9dKnwpKSg/OltcL10qKSQvO3JldHVybiBzcGxpdFBhdGhSZS5leGVjKGZpbGVuYW1lKS5zbGljZSgxKX0sbm9ybWFsaXplQXJyYXk6KHBhcnRzLGFsbG93QWJvdmVSb290KT0+e3ZhciB1cD0wO2Zvcih2YXIgaT1wYXJ0cy5sZW5ndGgtMTtpPj0wO2ktLSl7dmFyIGxhc3Q9cGFydHNbaV07aWYobGFzdD09PSIuIil7cGFydHMuc3BsaWNlKGksMSl9ZWxzZSBpZihsYXN0PT09Ii4uIil7cGFydHMuc3BsaWNlKGksMSk7dXArK31lbHNlIGlmKHVwKXtwYXJ0cy5zcGxpY2UoaSwxKTt1cC0tfX1pZihhbGxvd0Fib3ZlUm9vdCl7Zm9yKDt1cDt1cC0tKXtwYXJ0cy51bnNoaWZ0KCIuLiIpfX1yZXR1cm4gcGFydHN9LG5vcm1hbGl6ZTpwYXRoPT57dmFyIGlzQWJzb2x1dGU9UEFUSC5pc0FicyhwYXRoKSx0cmFpbGluZ1NsYXNoPXBhdGguc3Vic3RyKC0xKT09PSIvIjtwYXRoPVBBVEgubm9ybWFsaXplQXJyYXkocGF0aC5zcGxpdCgiLyIpLmZpbHRlcihwPT4hIXApLCFpc0Fic29sdXRlKS5qb2luKCIvIik7aWYoIXBhdGgmJiFpc0Fic29sdXRlKXtwYXRoPSIuIn1pZihwYXRoJiZ0cmFpbGluZ1NsYXNoKXtwYXRoKz0iLyJ9cmV0dXJuKGlzQWJzb2x1dGU/Ii8iOiIiKStwYXRofSxkaXJuYW1lOnBhdGg9Pnt2YXIgcmVzdWx0PVBBVEguc3BsaXRQYXRoKHBhdGgpLHJvb3Q9cmVzdWx0WzBdLGRpcj1yZXN1bHRbMV07aWYoIXJvb3QmJiFkaXIpe3JldHVybiIuIn1pZihkaXIpe2Rpcj1kaXIuc3Vic3RyKDAsZGlyLmxlbmd0aC0xKX1yZXR1cm4gcm9vdCtkaXJ9LGJhc2VuYW1lOnBhdGg9PntpZihwYXRoPT09Ii8iKXJldHVybiIvIjtwYXRoPVBBVEgubm9ybWFsaXplKHBhdGgpO3BhdGg9cGF0aC5yZXBsYWNlKC9cLyQvLCIiKTt2YXIgbGFzdFNsYXNoPXBhdGgubGFzdEluZGV4T2YoIi8iKTtpZihsYXN0U2xhc2g9PT0tMSlyZXR1cm4gcGF0aDtyZXR1cm4gcGF0aC5zdWJzdHIobGFzdFNsYXNoKzEpfSxqb2luOmZ1bmN0aW9uKCl7dmFyIHBhdGhzPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIFBBVEgubm9ybWFsaXplKHBhdGhzLmpvaW4oIi8iKSl9LGpvaW4yOihsLHIpPT5QQVRILm5vcm1hbGl6ZShsKyIvIityKX07dmFyIGluaXRSYW5kb21GaWxsPSgpPT57aWYodHlwZW9mIGNyeXB0bz09Im9iamVjdCImJnR5cGVvZiBjcnlwdG9bImdldFJhbmRvbVZhbHVlcyJdPT0iZnVuY3Rpb24iKXtyZXR1cm4gdmlldz0+KHZpZXcuc2V0KGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkodmlldy5ieXRlTGVuZ3RoKSkpLHZpZXcpfWVsc2UgYWJvcnQoImluaXRSYW5kb21EZXZpY2UiKX07dmFyIHJhbmRvbUZpbGw9dmlldz0+KHJhbmRvbUZpbGw9aW5pdFJhbmRvbUZpbGwoKSkodmlldyk7dmFyIFBBVEhfRlM9e3Jlc29sdmU6ZnVuY3Rpb24oKXt2YXIgcmVzb2x2ZWRQYXRoPSIiLHJlc29sdmVkQWJzb2x1dGU9ZmFsc2U7Zm9yKHZhciBpPWFyZ3VtZW50cy5sZW5ndGgtMTtpPj0tMSYmIXJlc29sdmVkQWJzb2x1dGU7aS0tKXt2YXIgcGF0aD1pPj0wP2FyZ3VtZW50c1tpXTpGUy5jd2QoKTtpZih0eXBlb2YgcGF0aCE9InN0cmluZyIpe3Rocm93IG5ldyBUeXBlRXJyb3IoIkFyZ3VtZW50cyB0byBwYXRoLnJlc29sdmUgbXVzdCBiZSBzdHJpbmdzIil9ZWxzZSBpZighcGF0aCl7cmV0dXJuIiJ9cmVzb2x2ZWRQYXRoPXBhdGgrIi8iK3Jlc29sdmVkUGF0aDtyZXNvbHZlZEFic29sdXRlPVBBVEguaXNBYnMocGF0aCl9cmVzb2x2ZWRQYXRoPVBBVEgubm9ybWFsaXplQXJyYXkocmVzb2x2ZWRQYXRoLnNwbGl0KCIvIikuZmlsdGVyKHA9PiEhcCksIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oIi8iKTtyZXR1cm4ocmVzb2x2ZWRBYnNvbHV0ZT8iLyI6IiIpK3Jlc29sdmVkUGF0aHx8Ii4ifSxyZWxhdGl2ZTooZnJvbSx0byk9Pntmcm9tPVBBVEhfRlMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7dG89UEFUSF9GUy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7ZnVuY3Rpb24gdHJpbShhcnIpe3ZhciBzdGFydD0wO2Zvcig7c3RhcnQ8YXJyLmxlbmd0aDtzdGFydCsrKXtpZihhcnJbc3RhcnRdIT09IiIpYnJlYWt9dmFyIGVuZD1hcnIubGVuZ3RoLTE7Zm9yKDtlbmQ+PTA7ZW5kLS0pe2lmKGFycltlbmRdIT09IiIpYnJlYWt9aWYoc3RhcnQ+ZW5kKXJldHVybltdO3JldHVybiBhcnIuc2xpY2Uoc3RhcnQsZW5kLXN0YXJ0KzEpfXZhciBmcm9tUGFydHM9dHJpbShmcm9tLnNwbGl0KCIvIikpO3ZhciB0b1BhcnRzPXRyaW0odG8uc3BsaXQoIi8iKSk7dmFyIGxlbmd0aD1NYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLHRvUGFydHMubGVuZ3RoKTt2YXIgc2FtZVBhcnRzTGVuZ3RoPWxlbmd0aDtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe2lmKGZyb21QYXJ0c1tpXSE9PXRvUGFydHNbaV0pe3NhbWVQYXJ0c0xlbmd0aD1pO2JyZWFrfX12YXIgb3V0cHV0UGFydHM9W107Zm9yKHZhciBpPXNhbWVQYXJ0c0xlbmd0aDtpPGZyb21QYXJ0cy5sZW5ndGg7aSsrKXtvdXRwdXRQYXJ0cy5wdXNoKCIuLiIpfW91dHB1dFBhcnRzPW91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO3JldHVybiBvdXRwdXRQYXJ0cy5qb2luKCIvIil9fTt2YXIgVVRGOERlY29kZXI9dHlwZW9mIFRleHREZWNvZGVyIT0idW5kZWZpbmVkIj9uZXcgVGV4dERlY29kZXIoInV0ZjgiKTp1bmRlZmluZWQ7dmFyIFVURjhBcnJheVRvU3RyaW5nPShoZWFwT3JBcnJheSxpZHgsbWF4Qnl0ZXNUb1JlYWQpPT57dmFyIGVuZElkeD1pZHgrbWF4Qnl0ZXNUb1JlYWQ7dmFyIGVuZFB0cj1pZHg7d2hpbGUoaGVhcE9yQXJyYXlbZW5kUHRyXSYmIShlbmRQdHI+PWVuZElkeCkpKytlbmRQdHI7aWYoZW5kUHRyLWlkeD4xNiYmaGVhcE9yQXJyYXkuYnVmZmVyJiZVVEY4RGVjb2Rlcil7cmV0dXJuIFVURjhEZWNvZGVyLmRlY29kZShoZWFwT3JBcnJheS5idWZmZXIgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcj9oZWFwT3JBcnJheS5zbGljZShpZHgsZW5kUHRyKTpoZWFwT3JBcnJheS5zdWJhcnJheShpZHgsZW5kUHRyKSl9dmFyIHN0cj0iIjt3aGlsZShpZHg8ZW5kUHRyKXt2YXIgdTA9aGVhcE9yQXJyYXlbaWR4KytdO2lmKCEodTAmMTI4KSl7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHUwKTtjb250aW51ZX12YXIgdTE9aGVhcE9yQXJyYXlbaWR4KytdJjYzO2lmKCh1MCYyMjQpPT0xOTIpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSgodTAmMzEpPDw2fHUxKTtjb250aW51ZX12YXIgdTI9aGVhcE9yQXJyYXlbaWR4KytdJjYzO2lmKCh1MCYyNDApPT0yMjQpe3UwPSh1MCYxNSk8PDEyfHUxPDw2fHUyfWVsc2V7dTA9KHUwJjcpPDwxOHx1MTw8MTJ8dTI8PDZ8aGVhcE9yQXJyYXlbaWR4KytdJjYzfWlmKHUwPDY1NTM2KXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodTApfWVsc2V7dmFyIGNoPXUwLTY1NTM2O3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxjaD4+MTAsNTYzMjB8Y2gmMTAyMyl9fXJldHVybiBzdHJ9O3ZhciBGU19zdGRpbl9nZXRDaGFyX2J1ZmZlcj1bXTt2YXIgbGVuZ3RoQnl0ZXNVVEY4PXN0cj0+e3ZhciBsZW49MDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgYz1zdHIuY2hhckNvZGVBdChpKTtpZihjPD0xMjcpe2xlbisrfWVsc2UgaWYoYzw9MjA0Nyl7bGVuKz0yfWVsc2UgaWYoYz49NTUyOTYmJmM8PTU3MzQzKXtsZW4rPTQ7KytpfWVsc2V7bGVuKz0zfX1yZXR1cm4gbGVufTt2YXIgc3RyaW5nVG9VVEY4QXJyYXk9KHN0cixoZWFwLG91dElkeCxtYXhCeXRlc1RvV3JpdGUpPT57aWYoIShtYXhCeXRlc1RvV3JpdGU+MCkpcmV0dXJuIDA7dmFyIHN0YXJ0SWR4PW91dElkeDt2YXIgZW5kSWR4PW91dElkeCttYXhCeXRlc1RvV3JpdGUtMTtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgdT1zdHIuY2hhckNvZGVBdChpKTtpZih1Pj01NTI5NiYmdTw9NTczNDMpe3ZhciB1MT1zdHIuY2hhckNvZGVBdCgrK2kpO3U9NjU1MzYrKCh1JjEwMjMpPDwxMCl8dTEmMTAyM31pZih1PD0xMjcpe2lmKG91dElkeD49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPXV9ZWxzZSBpZih1PD0yMDQ3KXtpZihvdXRJZHgrMT49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTE5Mnx1Pj42O2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzfWVsc2UgaWYodTw9NjU1MzUpe2lmKG91dElkeCsyPj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109MjI0fHU+PjEyO2hlYXBbb3V0SWR4KytdPTEyOHx1Pj42JjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzfWVsc2V7aWYob3V0SWR4KzM+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0yNDB8dT4+MTg7aGVhcFtvdXRJZHgrK109MTI4fHU+PjEyJjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1Pj42JjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzfX1oZWFwW291dElkeF09MDtyZXR1cm4gb3V0SWR4LXN0YXJ0SWR4fTtmdW5jdGlvbiBpbnRBcnJheUZyb21TdHJpbmcoc3RyaW5neSxkb250QWRkTnVsbCxsZW5ndGgpe3ZhciBsZW49bGVuZ3RoPjA/bGVuZ3RoOmxlbmd0aEJ5dGVzVVRGOChzdHJpbmd5KSsxO3ZhciB1OGFycmF5PW5ldyBBcnJheShsZW4pO3ZhciBudW1CeXRlc1dyaXR0ZW49c3RyaW5nVG9VVEY4QXJyYXkoc3RyaW5neSx1OGFycmF5LDAsdThhcnJheS5sZW5ndGgpO2lmKGRvbnRBZGROdWxsKXU4YXJyYXkubGVuZ3RoPW51bUJ5dGVzV3JpdHRlbjtyZXR1cm4gdThhcnJheX12YXIgRlNfc3RkaW5fZ2V0Q2hhcj0oKT0+e2lmKCFGU19zdGRpbl9nZXRDaGFyX2J1ZmZlci5sZW5ndGgpe3ZhciByZXN1bHQ9bnVsbDtpZih0eXBlb2Ygd2luZG93IT0idW5kZWZpbmVkIiYmdHlwZW9mIHdpbmRvdy5wcm9tcHQ9PSJmdW5jdGlvbiIpe3Jlc3VsdD13aW5kb3cucHJvbXB0KCJJbnB1dDogIik7aWYocmVzdWx0IT09bnVsbCl7cmVzdWx0Kz0iXG4ifX1lbHNlIGlmKHR5cGVvZiByZWFkbGluZT09ImZ1bmN0aW9uIil7cmVzdWx0PXJlYWRsaW5lKCk7aWYocmVzdWx0IT09bnVsbCl7cmVzdWx0Kz0iXG4ifX1pZighcmVzdWx0KXtyZXR1cm4gbnVsbH1GU19zdGRpbl9nZXRDaGFyX2J1ZmZlcj1pbnRBcnJheUZyb21TdHJpbmcocmVzdWx0LHRydWUpfXJldHVybiBGU19zdGRpbl9nZXRDaGFyX2J1ZmZlci5zaGlmdCgpfTt2YXIgVFRZPXt0dHlzOltdLGluaXQoKXt9LHNodXRkb3duKCl7fSxyZWdpc3RlcihkZXYsb3BzKXtUVFkudHR5c1tkZXZdPXtpbnB1dDpbXSxvdXRwdXQ6W10sb3BzOm9wc307RlMucmVnaXN0ZXJEZXZpY2UoZGV2LFRUWS5zdHJlYW1fb3BzKX0sc3RyZWFtX29wczp7b3BlbihzdHJlYW0pe3ZhciB0dHk9VFRZLnR0eXNbc3RyZWFtLm5vZGUucmRldl07aWYoIXR0eSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfXN0cmVhbS50dHk9dHR5O3N0cmVhbS5zZWVrYWJsZT1mYWxzZX0sY2xvc2Uoc3RyZWFtKXtzdHJlYW0udHR5Lm9wcy5mc3luYyhzdHJlYW0udHR5KX0sZnN5bmMoc3RyZWFtKXtzdHJlYW0udHR5Lm9wcy5mc3luYyhzdHJlYW0udHR5KX0scmVhZChzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zKXtpZighc3RyZWFtLnR0eXx8IXN0cmVhbS50dHkub3BzLmdldF9jaGFyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2MCl9dmFyIGJ5dGVzUmVhZD0wO2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7dmFyIHJlc3VsdDt0cnl7cmVzdWx0PXN0cmVhbS50dHkub3BzLmdldF9jaGFyKHN0cmVhbS50dHkpfWNhdGNoKGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI5KX1pZihyZXN1bHQ9PT11bmRlZmluZWQmJmJ5dGVzUmVhZD09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYpfWlmKHJlc3VsdD09PW51bGx8fHJlc3VsdD09PXVuZGVmaW5lZClicmVhaztieXRlc1JlYWQrKztidWZmZXJbb2Zmc2V0K2ldPXJlc3VsdH1pZihieXRlc1JlYWQpe3N0cmVhbS5ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpfXJldHVybiBieXRlc1JlYWR9LHdyaXRlKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3Mpe2lmKCFzdHJlYW0udHR5fHwhc3RyZWFtLnR0eS5vcHMucHV0X2NoYXIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYwKX10cnl7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXtzdHJlYW0udHR5Lm9wcy5wdXRfY2hhcihzdHJlYW0udHR5LGJ1ZmZlcltvZmZzZXQraV0pfX1jYXRjaChlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOSl9aWYobGVuZ3RoKXtzdHJlYW0ubm9kZS50aW1lc3RhbXA9RGF0ZS5ub3coKX1yZXR1cm4gaX19LGRlZmF1bHRfdHR5X29wczp7Z2V0X2NoYXIodHR5KXtyZXR1cm4gRlNfc3RkaW5fZ2V0Q2hhcigpfSxwdXRfY2hhcih0dHksdmFsKXtpZih2YWw9PT1udWxsfHx2YWw9PT0xMCl7b3V0KFVURjhBcnJheVRvU3RyaW5nKHR0eS5vdXRwdXQsMCkpO3R0eS5vdXRwdXQ9W119ZWxzZXtpZih2YWwhPTApdHR5Lm91dHB1dC5wdXNoKHZhbCl9fSxmc3luYyh0dHkpe2lmKHR0eS5vdXRwdXQmJnR0eS5vdXRwdXQubGVuZ3RoPjApe291dChVVEY4QXJyYXlUb1N0cmluZyh0dHkub3V0cHV0LDApKTt0dHkub3V0cHV0PVtdfX0saW9jdGxfdGNnZXRzKHR0eSl7cmV0dXJue2NfaWZsYWc6MjU4NTYsY19vZmxhZzo1LGNfY2ZsYWc6MTkxLGNfbGZsYWc6MzUzODcsY19jYzpbMywyOCwxMjcsMjEsNCwwLDEsMCwxNywxOSwyNiwwLDE4LDE1LDIzLDIyLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDBdfX0saW9jdGxfdGNzZXRzKHR0eSxvcHRpb25hbF9hY3Rpb25zLGRhdGEpe3JldHVybiAwfSxpb2N0bF90aW9jZ3dpbnN6KHR0eSl7cmV0dXJuWzI0LDgwXX19LGRlZmF1bHRfdHR5MV9vcHM6e3B1dF9jaGFyKHR0eSx2YWwpe2lmKHZhbD09PW51bGx8fHZhbD09PTEwKXtlcnIoVVRGOEFycmF5VG9TdHJpbmcodHR5Lm91dHB1dCwwKSk7dHR5Lm91dHB1dD1bXX1lbHNle2lmKHZhbCE9MCl0dHkub3V0cHV0LnB1c2godmFsKX19LGZzeW5jKHR0eSl7aWYodHR5Lm91dHB1dCYmdHR5Lm91dHB1dC5sZW5ndGg+MCl7ZXJyKFVURjhBcnJheVRvU3RyaW5nKHR0eS5vdXRwdXQsMCkpO3R0eS5vdXRwdXQ9W119fX19O3ZhciBhbGlnbk1lbW9yeT0oc2l6ZSxhbGlnbm1lbnQpPT5NYXRoLmNlaWwoc2l6ZS9hbGlnbm1lbnQpKmFsaWdubWVudDt2YXIgbW1hcEFsbG9jPXNpemU9PntzaXplPWFsaWduTWVtb3J5KHNpemUsNjU1MzYpO3ZhciBwdHI9X2Vtc2NyaXB0ZW5fYnVpbHRpbl9tZW1hbGlnbig2NTUzNixzaXplKTtpZighcHRyKXJldHVybiAwO3JldHVybiB6ZXJvTWVtb3J5KHB0cixzaXplKX07dmFyIE1FTUZTPXtvcHNfdGFibGU6bnVsbCxtb3VudChtb3VudCl7cmV0dXJuIE1FTUZTLmNyZWF0ZU5vZGUobnVsbCwiLyIsMTYzODR8NTExLDApfSxjcmVhdGVOb2RlKHBhcmVudCxuYW1lLG1vZGUsZGV2KXtpZihGUy5pc0Jsa2Rldihtb2RlKXx8RlMuaXNGSUZPKG1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoIU1FTUZTLm9wc190YWJsZSl7TUVNRlMub3BzX3RhYmxlPXtkaXI6e25vZGU6e2dldGF0dHI6TUVNRlMubm9kZV9vcHMuZ2V0YXR0cixzZXRhdHRyOk1FTUZTLm5vZGVfb3BzLnNldGF0dHIsbG9va3VwOk1FTUZTLm5vZGVfb3BzLmxvb2t1cCxta25vZDpNRU1GUy5ub2RlX29wcy5ta25vZCxyZW5hbWU6TUVNRlMubm9kZV9vcHMucmVuYW1lLHVubGluazpNRU1GUy5ub2RlX29wcy51bmxpbmsscm1kaXI6TUVNRlMubm9kZV9vcHMucm1kaXIscmVhZGRpcjpNRU1GUy5ub2RlX29wcy5yZWFkZGlyLHN5bWxpbms6TUVNRlMubm9kZV9vcHMuc3ltbGlua30sc3RyZWFtOntsbHNlZWs6TUVNRlMuc3RyZWFtX29wcy5sbHNlZWt9fSxmaWxlOntub2RlOntnZXRhdHRyOk1FTUZTLm5vZGVfb3BzLmdldGF0dHIsc2V0YXR0cjpNRU1GUy5ub2RlX29wcy5zZXRhdHRyfSxzdHJlYW06e2xsc2VlazpNRU1GUy5zdHJlYW1fb3BzLmxsc2VlayxyZWFkOk1FTUZTLnN0cmVhbV9vcHMucmVhZCx3cml0ZTpNRU1GUy5zdHJlYW1fb3BzLndyaXRlLGFsbG9jYXRlOk1FTUZTLnN0cmVhbV9vcHMuYWxsb2NhdGUsbW1hcDpNRU1GUy5zdHJlYW1fb3BzLm1tYXAsbXN5bmM6TUVNRlMuc3RyZWFtX29wcy5tc3luY319LGxpbms6e25vZGU6e2dldGF0dHI6TUVNRlMubm9kZV9vcHMuZ2V0YXR0cixzZXRhdHRyOk1FTUZTLm5vZGVfb3BzLnNldGF0dHIscmVhZGxpbms6TUVNRlMubm9kZV9vcHMucmVhZGxpbmt9LHN0cmVhbTp7fX0sY2hyZGV2Ontub2RlOntnZXRhdHRyOk1FTUZTLm5vZGVfb3BzLmdldGF0dHIsc2V0YXR0cjpNRU1GUy5ub2RlX29wcy5zZXRhdHRyfSxzdHJlYW06RlMuY2hyZGV2X3N0cmVhbV9vcHN9fX12YXIgbm9kZT1GUy5jcmVhdGVOb2RlKHBhcmVudCxuYW1lLG1vZGUsZGV2KTtpZihGUy5pc0Rpcihub2RlLm1vZGUpKXtub2RlLm5vZGVfb3BzPU1FTUZTLm9wc190YWJsZS5kaXIubm9kZTtub2RlLnN0cmVhbV9vcHM9TUVNRlMub3BzX3RhYmxlLmRpci5zdHJlYW07bm9kZS5jb250ZW50cz17fX1lbHNlIGlmKEZTLmlzRmlsZShub2RlLm1vZGUpKXtub2RlLm5vZGVfb3BzPU1FTUZTLm9wc190YWJsZS5maWxlLm5vZGU7bm9kZS5zdHJlYW1fb3BzPU1FTUZTLm9wc190YWJsZS5maWxlLnN0cmVhbTtub2RlLnVzZWRCeXRlcz0wO25vZGUuY29udGVudHM9bnVsbH1lbHNlIGlmKEZTLmlzTGluayhub2RlLm1vZGUpKXtub2RlLm5vZGVfb3BzPU1FTUZTLm9wc190YWJsZS5saW5rLm5vZGU7bm9kZS5zdHJlYW1fb3BzPU1FTUZTLm9wc190YWJsZS5saW5rLnN0cmVhbX1lbHNlIGlmKEZTLmlzQ2hyZGV2KG5vZGUubW9kZSkpe25vZGUubm9kZV9vcHM9TUVNRlMub3BzX3RhYmxlLmNocmRldi5ub2RlO25vZGUuc3RyZWFtX29wcz1NRU1GUy5vcHNfdGFibGUuY2hyZGV2LnN0cmVhbX1ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpO2lmKHBhcmVudCl7cGFyZW50LmNvbnRlbnRzW25hbWVdPW5vZGU7cGFyZW50LnRpbWVzdGFtcD1ub2RlLnRpbWVzdGFtcH1yZXR1cm4gbm9kZX0sZ2V0RmlsZURhdGFBc1R5cGVkQXJyYXkobm9kZSl7aWYoIW5vZGUuY29udGVudHMpcmV0dXJuIG5ldyBVaW50OEFycmF5KDApO2lmKG5vZGUuY29udGVudHMuc3ViYXJyYXkpcmV0dXJuIG5vZGUuY29udGVudHMuc3ViYXJyYXkoMCxub2RlLnVzZWRCeXRlcyk7cmV0dXJuIG5ldyBVaW50OEFycmF5KG5vZGUuY29udGVudHMpfSxleHBhbmRGaWxlU3RvcmFnZShub2RlLG5ld0NhcGFjaXR5KXt2YXIgcHJldkNhcGFjaXR5PW5vZGUuY29udGVudHM/bm9kZS5jb250ZW50cy5sZW5ndGg6MDtpZihwcmV2Q2FwYWNpdHk+PW5ld0NhcGFjaXR5KXJldHVybjt2YXIgQ0FQQUNJVFlfRE9VQkxJTkdfTUFYPTEwMjQqMTAyNDtuZXdDYXBhY2l0eT1NYXRoLm1heChuZXdDYXBhY2l0eSxwcmV2Q2FwYWNpdHkqKHByZXZDYXBhY2l0eTxDQVBBQ0lUWV9ET1VCTElOR19NQVg/MjoxLjEyNSk+Pj4wKTtpZihwcmV2Q2FwYWNpdHkhPTApbmV3Q2FwYWNpdHk9TWF0aC5tYXgobmV3Q2FwYWNpdHksMjU2KTt2YXIgb2xkQ29udGVudHM9bm9kZS5jb250ZW50cztub2RlLmNvbnRlbnRzPW5ldyBVaW50OEFycmF5KG5ld0NhcGFjaXR5KTtpZihub2RlLnVzZWRCeXRlcz4wKW5vZGUuY29udGVudHMuc2V0KG9sZENvbnRlbnRzLnN1YmFycmF5KDAsbm9kZS51c2VkQnl0ZXMpLDApfSxyZXNpemVGaWxlU3RvcmFnZShub2RlLG5ld1NpemUpe2lmKG5vZGUudXNlZEJ5dGVzPT1uZXdTaXplKXJldHVybjtpZihuZXdTaXplPT0wKXtub2RlLmNvbnRlbnRzPW51bGw7bm9kZS51c2VkQnl0ZXM9MH1lbHNle3ZhciBvbGRDb250ZW50cz1ub2RlLmNvbnRlbnRzO25vZGUuY29udGVudHM9bmV3IFVpbnQ4QXJyYXkobmV3U2l6ZSk7aWYob2xkQ29udGVudHMpe25vZGUuY29udGVudHMuc2V0KG9sZENvbnRlbnRzLnN1YmFycmF5KDAsTWF0aC5taW4obmV3U2l6ZSxub2RlLnVzZWRCeXRlcykpKX1ub2RlLnVzZWRCeXRlcz1uZXdTaXplfX0sbm9kZV9vcHM6e2dldGF0dHIobm9kZSl7dmFyIGF0dHI9e307YXR0ci5kZXY9RlMuaXNDaHJkZXYobm9kZS5tb2RlKT9ub2RlLmlkOjE7YXR0ci5pbm89bm9kZS5pZDthdHRyLm1vZGU9bm9kZS5tb2RlO2F0dHIubmxpbms9MTthdHRyLnVpZD0wO2F0dHIuZ2lkPTA7YXR0ci5yZGV2PW5vZGUucmRldjtpZihGUy5pc0Rpcihub2RlLm1vZGUpKXthdHRyLnNpemU9NDA5Nn1lbHNlIGlmKEZTLmlzRmlsZShub2RlLm1vZGUpKXthdHRyLnNpemU9bm9kZS51c2VkQnl0ZXN9ZWxzZSBpZihGUy5pc0xpbmsobm9kZS5tb2RlKSl7YXR0ci5zaXplPW5vZGUubGluay5sZW5ndGh9ZWxzZXthdHRyLnNpemU9MH1hdHRyLmF0aW1lPW5ldyBEYXRlKG5vZGUudGltZXN0YW1wKTthdHRyLm10aW1lPW5ldyBEYXRlKG5vZGUudGltZXN0YW1wKTthdHRyLmN0aW1lPW5ldyBEYXRlKG5vZGUudGltZXN0YW1wKTthdHRyLmJsa3NpemU9NDA5NjthdHRyLmJsb2Nrcz1NYXRoLmNlaWwoYXR0ci5zaXplL2F0dHIuYmxrc2l6ZSk7cmV0dXJuIGF0dHJ9LHNldGF0dHIobm9kZSxhdHRyKXtpZihhdHRyLm1vZGUhPT11bmRlZmluZWQpe25vZGUubW9kZT1hdHRyLm1vZGV9aWYoYXR0ci50aW1lc3RhbXAhPT11bmRlZmluZWQpe25vZGUudGltZXN0YW1wPWF0dHIudGltZXN0YW1wfWlmKGF0dHIuc2l6ZSE9PXVuZGVmaW5lZCl7TUVNRlMucmVzaXplRmlsZVN0b3JhZ2Uobm9kZSxhdHRyLnNpemUpfX0sbG9va3VwKHBhcmVudCxuYW1lKXt0aHJvdyBGUy5nZW5lcmljRXJyb3JzWzQ0XX0sbWtub2QocGFyZW50LG5hbWUsbW9kZSxkZXYpe3JldHVybiBNRU1GUy5jcmVhdGVOb2RlKHBhcmVudCxuYW1lLG1vZGUsZGV2KX0scmVuYW1lKG9sZF9ub2RlLG5ld19kaXIsbmV3X25hbWUpe2lmKEZTLmlzRGlyKG9sZF9ub2RlLm1vZGUpKXt2YXIgbmV3X25vZGU7dHJ5e25ld19ub2RlPUZTLmxvb2t1cE5vZGUobmV3X2RpcixuZXdfbmFtZSl9Y2F0Y2goZSl7fWlmKG5ld19ub2RlKXtmb3IodmFyIGkgaW4gbmV3X25vZGUuY29udGVudHMpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU1KX19fWRlbGV0ZSBvbGRfbm9kZS5wYXJlbnQuY29udGVudHNbb2xkX25vZGUubmFtZV07b2xkX25vZGUucGFyZW50LnRpbWVzdGFtcD1EYXRlLm5vdygpO29sZF9ub2RlLm5hbWU9bmV3X25hbWU7bmV3X2Rpci5jb250ZW50c1tuZXdfbmFtZV09b2xkX25vZGU7bmV3X2Rpci50aW1lc3RhbXA9b2xkX25vZGUucGFyZW50LnRpbWVzdGFtcDtvbGRfbm9kZS5wYXJlbnQ9bmV3X2Rpcn0sdW5saW5rKHBhcmVudCxuYW1lKXtkZWxldGUgcGFyZW50LmNvbnRlbnRzW25hbWVdO3BhcmVudC50aW1lc3RhbXA9RGF0ZS5ub3coKX0scm1kaXIocGFyZW50LG5hbWUpe3ZhciBub2RlPUZTLmxvb2t1cE5vZGUocGFyZW50LG5hbWUpO2Zvcih2YXIgaSBpbiBub2RlLmNvbnRlbnRzKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NSl9ZGVsZXRlIHBhcmVudC5jb250ZW50c1tuYW1lXTtwYXJlbnQudGltZXN0YW1wPURhdGUubm93KCl9LHJlYWRkaXIobm9kZSl7dmFyIGVudHJpZXM9WyIuIiwiLi4iXTtmb3IodmFyIGtleSBpbiBub2RlLmNvbnRlbnRzKXtpZighbm9kZS5jb250ZW50cy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtjb250aW51ZX1lbnRyaWVzLnB1c2goa2V5KX1yZXR1cm4gZW50cmllc30sc3ltbGluayhwYXJlbnQsbmV3bmFtZSxvbGRwYXRoKXt2YXIgbm9kZT1NRU1GUy5jcmVhdGVOb2RlKHBhcmVudCxuZXduYW1lLDUxMXw0MDk2MCwwKTtub2RlLmxpbms9b2xkcGF0aDtyZXR1cm4gbm9kZX0scmVhZGxpbmsobm9kZSl7aWYoIUZTLmlzTGluayhub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9cmV0dXJuIG5vZGUubGlua319LHN0cmVhbV9vcHM6e3JlYWQoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uKXt2YXIgY29udGVudHM9c3RyZWFtLm5vZGUuY29udGVudHM7aWYocG9zaXRpb24+PXN0cmVhbS5ub2RlLnVzZWRCeXRlcylyZXR1cm4gMDt2YXIgc2l6ZT1NYXRoLm1pbihzdHJlYW0ubm9kZS51c2VkQnl0ZXMtcG9zaXRpb24sbGVuZ3RoKTtpZihzaXplPjgmJmNvbnRlbnRzLnN1YmFycmF5KXtidWZmZXIuc2V0KGNvbnRlbnRzLnN1YmFycmF5KHBvc2l0aW9uLHBvc2l0aW9uK3NpemUpLG9mZnNldCl9ZWxzZXtmb3IodmFyIGk9MDtpPHNpemU7aSsrKWJ1ZmZlcltvZmZzZXQraV09Y29udGVudHNbcG9zaXRpb24raV19cmV0dXJuIHNpemV9LHdyaXRlKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbixjYW5Pd24pe2lmKCFsZW5ndGgpcmV0dXJuIDA7dmFyIG5vZGU9c3RyZWFtLm5vZGU7bm9kZS50aW1lc3RhbXA9RGF0ZS5ub3coKTtpZihidWZmZXIuc3ViYXJyYXkmJighbm9kZS5jb250ZW50c3x8bm9kZS5jb250ZW50cy5zdWJhcnJheSkpe2lmKGNhbk93bil7bm9kZS5jb250ZW50cz1idWZmZXIuc3ViYXJyYXkob2Zmc2V0LG9mZnNldCtsZW5ndGgpO25vZGUudXNlZEJ5dGVzPWxlbmd0aDtyZXR1cm4gbGVuZ3RofWVsc2UgaWYobm9kZS51c2VkQnl0ZXM9PT0wJiZwb3NpdGlvbj09PTApe25vZGUuY29udGVudHM9YnVmZmVyLnNsaWNlKG9mZnNldCxvZmZzZXQrbGVuZ3RoKTtub2RlLnVzZWRCeXRlcz1sZW5ndGg7cmV0dXJuIGxlbmd0aH1lbHNlIGlmKHBvc2l0aW9uK2xlbmd0aDw9bm9kZS51c2VkQnl0ZXMpe25vZGUuY29udGVudHMuc2V0KGJ1ZmZlci5zdWJhcnJheShvZmZzZXQsb2Zmc2V0K2xlbmd0aCkscG9zaXRpb24pO3JldHVybiBsZW5ndGh9fU1FTUZTLmV4cGFuZEZpbGVTdG9yYWdlKG5vZGUscG9zaXRpb24rbGVuZ3RoKTtpZihub2RlLmNvbnRlbnRzLnN1YmFycmF5JiZidWZmZXIuc3ViYXJyYXkpe25vZGUuY29udGVudHMuc2V0KGJ1ZmZlci5zdWJhcnJheShvZmZzZXQsb2Zmc2V0K2xlbmd0aCkscG9zaXRpb24pfWVsc2V7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXtub2RlLmNvbnRlbnRzW3Bvc2l0aW9uK2ldPWJ1ZmZlcltvZmZzZXQraV19fW5vZGUudXNlZEJ5dGVzPU1hdGgubWF4KG5vZGUudXNlZEJ5dGVzLHBvc2l0aW9uK2xlbmd0aCk7cmV0dXJuIGxlbmd0aH0sbGxzZWVrKHN0cmVhbSxvZmZzZXQsd2hlbmNlKXt2YXIgcG9zaXRpb249b2Zmc2V0O2lmKHdoZW5jZT09PTEpe3Bvc2l0aW9uKz1zdHJlYW0ucG9zaXRpb259ZWxzZSBpZih3aGVuY2U9PT0yKXtpZihGUy5pc0ZpbGUoc3RyZWFtLm5vZGUubW9kZSkpe3Bvc2l0aW9uKz1zdHJlYW0ubm9kZS51c2VkQnl0ZXN9fWlmKHBvc2l0aW9uPDApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1yZXR1cm4gcG9zaXRpb259LGFsbG9jYXRlKHN0cmVhbSxvZmZzZXQsbGVuZ3RoKXtNRU1GUy5leHBhbmRGaWxlU3RvcmFnZShzdHJlYW0ubm9kZSxvZmZzZXQrbGVuZ3RoKTtzdHJlYW0ubm9kZS51c2VkQnl0ZXM9TWF0aC5tYXgoc3RyZWFtLm5vZGUudXNlZEJ5dGVzLG9mZnNldCtsZW5ndGgpfSxtbWFwKHN0cmVhbSxsZW5ndGgscG9zaXRpb24scHJvdCxmbGFncyl7aWYoIUZTLmlzRmlsZShzdHJlYW0ubm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfXZhciBwdHI7dmFyIGFsbG9jYXRlZDt2YXIgY29udGVudHM9c3RyZWFtLm5vZGUuY29udGVudHM7aWYoIShmbGFncyYyKSYmY29udGVudHMuYnVmZmVyPT09SEVBUDguYnVmZmVyKXthbGxvY2F0ZWQ9ZmFsc2U7cHRyPWNvbnRlbnRzLmJ5dGVPZmZzZXR9ZWxzZXtpZihwb3NpdGlvbj4wfHxwb3NpdGlvbitsZW5ndGg8Y29udGVudHMubGVuZ3RoKXtpZihjb250ZW50cy5zdWJhcnJheSl7Y29udGVudHM9Y29udGVudHMuc3ViYXJyYXkocG9zaXRpb24scG9zaXRpb24rbGVuZ3RoKX1lbHNle2NvbnRlbnRzPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNvbnRlbnRzLHBvc2l0aW9uLHBvc2l0aW9uK2xlbmd0aCl9fWFsbG9jYXRlZD10cnVlO3B0cj1tbWFwQWxsb2MobGVuZ3RoKTtpZighcHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0OCl9SEVBUDguc2V0KGNvbnRlbnRzLHB0cil9cmV0dXJue3B0cjpwdHIsYWxsb2NhdGVkOmFsbG9jYXRlZH19LG1zeW5jKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxtbWFwRmxhZ3Mpe01FTUZTLnN0cmVhbV9vcHMud3JpdGUoc3RyZWFtLGJ1ZmZlciwwLGxlbmd0aCxvZmZzZXQsZmFsc2UpO3JldHVybiAwfX19O3ZhciBhc3luY0xvYWQ9KHVybCxvbmxvYWQsb25lcnJvcixub1J1bkRlcCk9Pnt2YXIgZGVwPSFub1J1bkRlcD9nZXRVbmlxdWVSdW5EZXBlbmRlbmN5KGBhbCAke3VybH1gKToiIjtyZWFkQXN5bmModXJsLGFycmF5QnVmZmVyPT57YXNzZXJ0KGFycmF5QnVmZmVyLGBMb2FkaW5nIGRhdGEgZmlsZSAiJHt1cmx9IiBmYWlsZWQgKG5vIGFycmF5QnVmZmVyKS5gKTtvbmxvYWQobmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpKTtpZihkZXApcmVtb3ZlUnVuRGVwZW5kZW5jeShkZXApfSxldmVudD0+e2lmKG9uZXJyb3Ipe29uZXJyb3IoKX1lbHNle3Rocm93YExvYWRpbmcgZGF0YSBmaWxlICIke3VybH0iIGZhaWxlZC5gfX0pO2lmKGRlcClhZGRSdW5EZXBlbmRlbmN5KGRlcCl9O3ZhciBGU19jcmVhdGVEYXRhRmlsZT0ocGFyZW50LG5hbWUsZmlsZURhdGEsY2FuUmVhZCxjYW5Xcml0ZSxjYW5Pd24pPT57RlMuY3JlYXRlRGF0YUZpbGUocGFyZW50LG5hbWUsZmlsZURhdGEsY2FuUmVhZCxjYW5Xcml0ZSxjYW5Pd24pfTt2YXIgcHJlbG9hZFBsdWdpbnM9TW9kdWxlWyJwcmVsb2FkUGx1Z2lucyJdfHxbXTt2YXIgRlNfaGFuZGxlZEJ5UHJlbG9hZFBsdWdpbj0oYnl0ZUFycmF5LGZ1bGxuYW1lLGZpbmlzaCxvbmVycm9yKT0+e2lmKHR5cGVvZiBCcm93c2VyIT0idW5kZWZpbmVkIilCcm93c2VyLmluaXQoKTt2YXIgaGFuZGxlZD1mYWxzZTtwcmVsb2FkUGx1Z2lucy5mb3JFYWNoKHBsdWdpbj0+e2lmKGhhbmRsZWQpcmV0dXJuO2lmKHBsdWdpblsiY2FuSGFuZGxlIl0oZnVsbG5hbWUpKXtwbHVnaW5bImhhbmRsZSJdKGJ5dGVBcnJheSxmdWxsbmFtZSxmaW5pc2gsb25lcnJvcik7aGFuZGxlZD10cnVlfX0pO3JldHVybiBoYW5kbGVkfTt2YXIgRlNfY3JlYXRlUHJlbG9hZGVkRmlsZT0ocGFyZW50LG5hbWUsdXJsLGNhblJlYWQsY2FuV3JpdGUsb25sb2FkLG9uZXJyb3IsZG9udENyZWF0ZUZpbGUsY2FuT3duLHByZUZpbmlzaCk9Pnt2YXIgZnVsbG5hbWU9bmFtZT9QQVRIX0ZTLnJlc29sdmUoUEFUSC5qb2luMihwYXJlbnQsbmFtZSkpOnBhcmVudDt2YXIgZGVwPWdldFVuaXF1ZVJ1bkRlcGVuZGVuY3koYGNwICR7ZnVsbG5hbWV9YCk7ZnVuY3Rpb24gcHJvY2Vzc0RhdGEoYnl0ZUFycmF5KXtmdW5jdGlvbiBmaW5pc2goYnl0ZUFycmF5KXtpZihwcmVGaW5pc2gpcHJlRmluaXNoKCk7aWYoIWRvbnRDcmVhdGVGaWxlKXtGU19jcmVhdGVEYXRhRmlsZShwYXJlbnQsbmFtZSxieXRlQXJyYXksY2FuUmVhZCxjYW5Xcml0ZSxjYW5Pd24pfWlmKG9ubG9hZClvbmxvYWQoKTtyZW1vdmVSdW5EZXBlbmRlbmN5KGRlcCl9aWYoRlNfaGFuZGxlZEJ5UHJlbG9hZFBsdWdpbihieXRlQXJyYXksZnVsbG5hbWUsZmluaXNoLCgpPT57aWYob25lcnJvcilvbmVycm9yKCk7cmVtb3ZlUnVuRGVwZW5kZW5jeShkZXApfSkpe3JldHVybn1maW5pc2goYnl0ZUFycmF5KX1hZGRSdW5EZXBlbmRlbmN5KGRlcCk7aWYodHlwZW9mIHVybD09InN0cmluZyIpe2FzeW5jTG9hZCh1cmwsYnl0ZUFycmF5PT5wcm9jZXNzRGF0YShieXRlQXJyYXkpLG9uZXJyb3IpfWVsc2V7cHJvY2Vzc0RhdGEodXJsKX19O3ZhciBGU19tb2RlU3RyaW5nVG9GbGFncz1zdHI9Pnt2YXIgZmxhZ01vZGVzPXsiciI6MCwicisiOjIsInciOjUxMnw2NHwxLCJ3KyI6NTEyfDY0fDIsImEiOjEwMjR8NjR8MSwiYSsiOjEwMjR8NjR8Mn07dmFyIGZsYWdzPWZsYWdNb2Rlc1tzdHJdO2lmKHR5cGVvZiBmbGFncz09InVuZGVmaW5lZCIpe3Rocm93IG5ldyBFcnJvcihgVW5rbm93biBmaWxlIG9wZW4gbW9kZTogJHtzdHJ9YCl9cmV0dXJuIGZsYWdzfTt2YXIgRlNfZ2V0TW9kZT0oY2FuUmVhZCxjYW5Xcml0ZSk9Pnt2YXIgbW9kZT0wO2lmKGNhblJlYWQpbW9kZXw9MjkyfDczO2lmKGNhbldyaXRlKW1vZGV8PTE0NjtyZXR1cm4gbW9kZX07dmFyIEZTPXtyb290Om51bGwsbW91bnRzOltdLGRldmljZXM6e30sc3RyZWFtczpbXSxuZXh0SW5vZGU6MSxuYW1lVGFibGU6bnVsbCxjdXJyZW50UGF0aDoiLyIsaW5pdGlhbGl6ZWQ6ZmFsc2UsaWdub3JlUGVybWlzc2lvbnM6dHJ1ZSxFcnJub0Vycm9yOm51bGwsZ2VuZXJpY0Vycm9yczp7fSxmaWxlc3lzdGVtczpudWxsLHN5bmNGU1JlcXVlc3RzOjAsbG9va3VwUGF0aChwYXRoLG9wdHM9e30pe3BhdGg9UEFUSF9GUy5yZXNvbHZlKHBhdGgpO2lmKCFwYXRoKXJldHVybntwYXRoOiIiLG5vZGU6bnVsbH07dmFyIGRlZmF1bHRzPXtmb2xsb3dfbW91bnQ6dHJ1ZSxyZWN1cnNlX2NvdW50OjB9O29wdHM9T2JqZWN0LmFzc2lnbihkZWZhdWx0cyxvcHRzKTtpZihvcHRzLnJlY3Vyc2VfY291bnQ+OCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzIpfXZhciBwYXJ0cz1wYXRoLnNwbGl0KCIvIikuZmlsdGVyKHA9PiEhcCk7dmFyIGN1cnJlbnQ9RlMucm9vdDt2YXIgY3VycmVudF9wYXRoPSIvIjtmb3IodmFyIGk9MDtpPHBhcnRzLmxlbmd0aDtpKyspe3ZhciBpc2xhc3Q9aT09PXBhcnRzLmxlbmd0aC0xO2lmKGlzbGFzdCYmb3B0cy5wYXJlbnQpe2JyZWFrfWN1cnJlbnQ9RlMubG9va3VwTm9kZShjdXJyZW50LHBhcnRzW2ldKTtjdXJyZW50X3BhdGg9UEFUSC5qb2luMihjdXJyZW50X3BhdGgscGFydHNbaV0pO2lmKEZTLmlzTW91bnRwb2ludChjdXJyZW50KSl7aWYoIWlzbGFzdHx8aXNsYXN0JiZvcHRzLmZvbGxvd19tb3VudCl7Y3VycmVudD1jdXJyZW50Lm1vdW50ZWQucm9vdH19aWYoIWlzbGFzdHx8b3B0cy5mb2xsb3cpe3ZhciBjb3VudD0wO3doaWxlKEZTLmlzTGluayhjdXJyZW50Lm1vZGUpKXt2YXIgbGluaz1GUy5yZWFkbGluayhjdXJyZW50X3BhdGgpO2N1cnJlbnRfcGF0aD1QQVRIX0ZTLnJlc29sdmUoUEFUSC5kaXJuYW1lKGN1cnJlbnRfcGF0aCksbGluayk7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKGN1cnJlbnRfcGF0aCx7cmVjdXJzZV9jb3VudDpvcHRzLnJlY3Vyc2VfY291bnQrMX0pO2N1cnJlbnQ9bG9va3VwLm5vZGU7aWYoY291bnQrKz40MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzIpfX19fXJldHVybntwYXRoOmN1cnJlbnRfcGF0aCxub2RlOmN1cnJlbnR9fSxnZXRQYXRoKG5vZGUpe3ZhciBwYXRoO3doaWxlKHRydWUpe2lmKEZTLmlzUm9vdChub2RlKSl7dmFyIG1vdW50PW5vZGUubW91bnQubW91bnRwb2ludDtpZighcGF0aClyZXR1cm4gbW91bnQ7cmV0dXJuIG1vdW50W21vdW50Lmxlbmd0aC0xXSE9PSIvIj9gJHttb3VudH0vJHtwYXRofWA6bW91bnQrcGF0aH1wYXRoPXBhdGg/YCR7bm9kZS5uYW1lfS8ke3BhdGh9YDpub2RlLm5hbWU7bm9kZT1ub2RlLnBhcmVudH19LGhhc2hOYW1lKHBhcmVudGlkLG5hbWUpe3ZhciBoYXNoPTA7Zm9yKHZhciBpPTA7aTxuYW1lLmxlbmd0aDtpKyspe2hhc2g9KGhhc2g8PDUpLWhhc2grbmFtZS5jaGFyQ29kZUF0KGkpfDB9cmV0dXJuKHBhcmVudGlkK2hhc2g+Pj4wKSVGUy5uYW1lVGFibGUubGVuZ3RofSxoYXNoQWRkTm9kZShub2RlKXt2YXIgaGFzaD1GUy5oYXNoTmFtZShub2RlLnBhcmVudC5pZCxub2RlLm5hbWUpO25vZGUubmFtZV9uZXh0PUZTLm5hbWVUYWJsZVtoYXNoXTtGUy5uYW1lVGFibGVbaGFzaF09bm9kZX0saGFzaFJlbW92ZU5vZGUobm9kZSl7dmFyIGhhc2g9RlMuaGFzaE5hbWUobm9kZS5wYXJlbnQuaWQsbm9kZS5uYW1lKTtpZihGUy5uYW1lVGFibGVbaGFzaF09PT1ub2RlKXtGUy5uYW1lVGFibGVbaGFzaF09bm9kZS5uYW1lX25leHR9ZWxzZXt2YXIgY3VycmVudD1GUy5uYW1lVGFibGVbaGFzaF07d2hpbGUoY3VycmVudCl7aWYoY3VycmVudC5uYW1lX25leHQ9PT1ub2RlKXtjdXJyZW50Lm5hbWVfbmV4dD1ub2RlLm5hbWVfbmV4dDticmVha31jdXJyZW50PWN1cnJlbnQubmFtZV9uZXh0fX19LGxvb2t1cE5vZGUocGFyZW50LG5hbWUpe3ZhciBlcnJDb2RlPUZTLm1heUxvb2t1cChwYXJlbnQpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUscGFyZW50KX12YXIgaGFzaD1GUy5oYXNoTmFtZShwYXJlbnQuaWQsbmFtZSk7Zm9yKHZhciBub2RlPUZTLm5hbWVUYWJsZVtoYXNoXTtub2RlO25vZGU9bm9kZS5uYW1lX25leHQpe3ZhciBub2RlTmFtZT1ub2RlLm5hbWU7aWYobm9kZS5wYXJlbnQuaWQ9PT1wYXJlbnQuaWQmJm5vZGVOYW1lPT09bmFtZSl7cmV0dXJuIG5vZGV9fXJldHVybiBGUy5sb29rdXAocGFyZW50LG5hbWUpfSxjcmVhdGVOb2RlKHBhcmVudCxuYW1lLG1vZGUscmRldil7dmFyIG5vZGU9bmV3IEZTLkZTTm9kZShwYXJlbnQsbmFtZSxtb2RlLHJkZXYpO0ZTLmhhc2hBZGROb2RlKG5vZGUpO3JldHVybiBub2RlfSxkZXN0cm95Tm9kZShub2RlKXtGUy5oYXNoUmVtb3ZlTm9kZShub2RlKX0saXNSb290KG5vZGUpe3JldHVybiBub2RlPT09bm9kZS5wYXJlbnR9LGlzTW91bnRwb2ludChub2RlKXtyZXR1cm4hIW5vZGUubW91bnRlZH0saXNGaWxlKG1vZGUpe3JldHVybihtb2RlJjYxNDQwKT09PTMyNzY4fSxpc0Rpcihtb2RlKXtyZXR1cm4obW9kZSY2MTQ0MCk9PT0xNjM4NH0saXNMaW5rKG1vZGUpe3JldHVybihtb2RlJjYxNDQwKT09PTQwOTYwfSxpc0NocmRldihtb2RlKXtyZXR1cm4obW9kZSY2MTQ0MCk9PT04MTkyfSxpc0Jsa2Rldihtb2RlKXtyZXR1cm4obW9kZSY2MTQ0MCk9PT0yNDU3Nn0saXNGSUZPKG1vZGUpe3JldHVybihtb2RlJjYxNDQwKT09PTQwOTZ9LGlzU29ja2V0KG1vZGUpe3JldHVybihtb2RlJjQ5MTUyKT09PTQ5MTUyfSxmbGFnc1RvUGVybWlzc2lvblN0cmluZyhmbGFnKXt2YXIgcGVybXM9WyJyIiwidyIsInJ3Il1bZmxhZyYzXTtpZihmbGFnJjUxMil7cGVybXMrPSJ3In1yZXR1cm4gcGVybXN9LG5vZGVQZXJtaXNzaW9ucyhub2RlLHBlcm1zKXtpZihGUy5pZ25vcmVQZXJtaXNzaW9ucyl7cmV0dXJuIDB9aWYocGVybXMuaW5jbHVkZXMoInIiKSYmIShub2RlLm1vZGUmMjkyKSl7cmV0dXJuIDJ9ZWxzZSBpZihwZXJtcy5pbmNsdWRlcygidyIpJiYhKG5vZGUubW9kZSYxNDYpKXtyZXR1cm4gMn1lbHNlIGlmKHBlcm1zLmluY2x1ZGVzKCJ4IikmJiEobm9kZS5tb2RlJjczKSl7cmV0dXJuIDJ9cmV0dXJuIDB9LG1heUxvb2t1cChkaXIpe3ZhciBlcnJDb2RlPUZTLm5vZGVQZXJtaXNzaW9ucyhkaXIsIngiKTtpZihlcnJDb2RlKXJldHVybiBlcnJDb2RlO2lmKCFkaXIubm9kZV9vcHMubG9va3VwKXJldHVybiAyO3JldHVybiAwfSxtYXlDcmVhdGUoZGlyLG5hbWUpe3RyeXt2YXIgbm9kZT1GUy5sb29rdXBOb2RlKGRpcixuYW1lKTtyZXR1cm4gMjB9Y2F0Y2goZSl7fXJldHVybiBGUy5ub2RlUGVybWlzc2lvbnMoZGlyLCJ3eCIpfSxtYXlEZWxldGUoZGlyLG5hbWUsaXNkaXIpe3ZhciBub2RlO3RyeXtub2RlPUZTLmxvb2t1cE5vZGUoZGlyLG5hbWUpfWNhdGNoKGUpe3JldHVybiBlLmVycm5vfXZhciBlcnJDb2RlPUZTLm5vZGVQZXJtaXNzaW9ucyhkaXIsInd4Iik7aWYoZXJyQ29kZSl7cmV0dXJuIGVyckNvZGV9aWYoaXNkaXIpe2lmKCFGUy5pc0Rpcihub2RlLm1vZGUpKXtyZXR1cm4gNTR9aWYoRlMuaXNSb290KG5vZGUpfHxGUy5nZXRQYXRoKG5vZGUpPT09RlMuY3dkKCkpe3JldHVybiAxMH19ZWxzZXtpZihGUy5pc0Rpcihub2RlLm1vZGUpKXtyZXR1cm4gMzF9fXJldHVybiAwfSxtYXlPcGVuKG5vZGUsZmxhZ3Mpe2lmKCFub2RlKXtyZXR1cm4gNDR9aWYoRlMuaXNMaW5rKG5vZGUubW9kZSkpe3JldHVybiAzMn1lbHNlIGlmKEZTLmlzRGlyKG5vZGUubW9kZSkpe2lmKEZTLmZsYWdzVG9QZXJtaXNzaW9uU3RyaW5nKGZsYWdzKSE9PSJyInx8ZmxhZ3MmNTEyKXtyZXR1cm4gMzF9fXJldHVybiBGUy5ub2RlUGVybWlzc2lvbnMobm9kZSxGUy5mbGFnc1RvUGVybWlzc2lvblN0cmluZyhmbGFncykpfSxNQVhfT1BFTl9GRFM6NDA5NixuZXh0ZmQoKXtmb3IodmFyIGZkPTA7ZmQ8PUZTLk1BWF9PUEVOX0ZEUztmZCsrKXtpZighRlMuc3RyZWFtc1tmZF0pe3JldHVybiBmZH19dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMzMpfSxnZXRTdHJlYW1DaGVja2VkKGZkKXt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbShmZCk7aWYoIXN0cmVhbSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9cmV0dXJuIHN0cmVhbX0sZ2V0U3RyZWFtOmZkPT5GUy5zdHJlYW1zW2ZkXSxjcmVhdGVTdHJlYW0oc3RyZWFtLGZkPS0xKXtpZighRlMuRlNTdHJlYW0pe0ZTLkZTU3RyZWFtPWZ1bmN0aW9uKCl7dGhpcy5zaGFyZWQ9e319O0ZTLkZTU3RyZWFtLnByb3RvdHlwZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydGllcyhGUy5GU1N0cmVhbS5wcm90b3R5cGUse29iamVjdDp7Z2V0KCl7cmV0dXJuIHRoaXMubm9kZX0sc2V0KHZhbCl7dGhpcy5ub2RlPXZhbH19LGlzUmVhZDp7Z2V0KCl7cmV0dXJuKHRoaXMuZmxhZ3MmMjA5NzE1NSkhPT0xfX0saXNXcml0ZTp7Z2V0KCl7cmV0dXJuKHRoaXMuZmxhZ3MmMjA5NzE1NSkhPT0wfX0saXNBcHBlbmQ6e2dldCgpe3JldHVybiB0aGlzLmZsYWdzJjEwMjR9fSxmbGFnczp7Z2V0KCl7cmV0dXJuIHRoaXMuc2hhcmVkLmZsYWdzfSxzZXQodmFsKXt0aGlzLnNoYXJlZC5mbGFncz12YWx9fSxwb3NpdGlvbjp7Z2V0KCl7cmV0dXJuIHRoaXMuc2hhcmVkLnBvc2l0aW9ufSxzZXQodmFsKXt0aGlzLnNoYXJlZC5wb3NpdGlvbj12YWx9fX0pfXN0cmVhbT1PYmplY3QuYXNzaWduKG5ldyBGUy5GU1N0cmVhbSxzdHJlYW0pO2lmKGZkPT0tMSl7ZmQ9RlMubmV4dGZkKCl9c3RyZWFtLmZkPWZkO0ZTLnN0cmVhbXNbZmRdPXN0cmVhbTtyZXR1cm4gc3RyZWFtfSxjbG9zZVN0cmVhbShmZCl7RlMuc3RyZWFtc1tmZF09bnVsbH0sY2hyZGV2X3N0cmVhbV9vcHM6e29wZW4oc3RyZWFtKXt2YXIgZGV2aWNlPUZTLmdldERldmljZShzdHJlYW0ubm9kZS5yZGV2KTtzdHJlYW0uc3RyZWFtX29wcz1kZXZpY2Uuc3RyZWFtX29wcztpZihzdHJlYW0uc3RyZWFtX29wcy5vcGVuKXtzdHJlYW0uc3RyZWFtX29wcy5vcGVuKHN0cmVhbSl9fSxsbHNlZWsoKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig3MCl9fSxtYWpvcjpkZXY9PmRldj4+OCxtaW5vcjpkZXY9PmRldiYyNTUsbWFrZWRldjoobWEsbWkpPT5tYTw8OHxtaSxyZWdpc3RlckRldmljZShkZXYsb3BzKXtGUy5kZXZpY2VzW2Rldl09e3N0cmVhbV9vcHM6b3BzfX0sZ2V0RGV2aWNlOmRldj0+RlMuZGV2aWNlc1tkZXZdLGdldE1vdW50cyhtb3VudCl7dmFyIG1vdW50cz1bXTt2YXIgY2hlY2s9W21vdW50XTt3aGlsZShjaGVjay5sZW5ndGgpe3ZhciBtPWNoZWNrLnBvcCgpO21vdW50cy5wdXNoKG0pO2NoZWNrLnB1c2guYXBwbHkoY2hlY2ssbS5tb3VudHMpfXJldHVybiBtb3VudHN9LHN5bmNmcyhwb3B1bGF0ZSxjYWxsYmFjayl7aWYodHlwZW9mIHBvcHVsYXRlPT0iZnVuY3Rpb24iKXtjYWxsYmFjaz1wb3B1bGF0ZTtwb3B1bGF0ZT1mYWxzZX1GUy5zeW5jRlNSZXF1ZXN0cysrO2lmKEZTLnN5bmNGU1JlcXVlc3RzPjEpe2Vycihgd2FybmluZzogJHtGUy5zeW5jRlNSZXF1ZXN0c30gRlMuc3luY2ZzIG9wZXJhdGlvbnMgaW4gZmxpZ2h0IGF0IG9uY2UsIHByb2JhYmx5IGp1c3QgZG9pbmcgZXh0cmEgd29ya2ApfXZhciBtb3VudHM9RlMuZ2V0TW91bnRzKEZTLnJvb3QubW91bnQpO3ZhciBjb21wbGV0ZWQ9MDtmdW5jdGlvbiBkb0NhbGxiYWNrKGVyckNvZGUpe0ZTLnN5bmNGU1JlcXVlc3RzLS07cmV0dXJuIGNhbGxiYWNrKGVyckNvZGUpfWZ1bmN0aW9uIGRvbmUoZXJyQ29kZSl7aWYoZXJyQ29kZSl7aWYoIWRvbmUuZXJyb3JlZCl7ZG9uZS5lcnJvcmVkPXRydWU7cmV0dXJuIGRvQ2FsbGJhY2soZXJyQ29kZSl9cmV0dXJufWlmKCsrY29tcGxldGVkPj1tb3VudHMubGVuZ3RoKXtkb0NhbGxiYWNrKG51bGwpfX1tb3VudHMuZm9yRWFjaChtb3VudD0+e2lmKCFtb3VudC50eXBlLnN5bmNmcyl7cmV0dXJuIGRvbmUobnVsbCl9bW91bnQudHlwZS5zeW5jZnMobW91bnQscG9wdWxhdGUsZG9uZSl9KX0sbW91bnQodHlwZSxvcHRzLG1vdW50cG9pbnQpe3ZhciByb290PW1vdW50cG9pbnQ9PT0iLyI7dmFyIHBzZXVkbz0hbW91bnRwb2ludDt2YXIgbm9kZTtpZihyb290JiZGUy5yb290KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9ZWxzZSBpZighcm9vdCYmIXBzZXVkbyl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKG1vdW50cG9pbnQse2ZvbGxvd19tb3VudDpmYWxzZX0pO21vdW50cG9pbnQ9bG9va3VwLnBhdGg7bm9kZT1sb29rdXAubm9kZTtpZihGUy5pc01vdW50cG9pbnQobm9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDEwKX1pZighRlMuaXNEaXIobm9kZS5tb2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTQpfX12YXIgbW91bnQ9e3R5cGU6dHlwZSxvcHRzOm9wdHMsbW91bnRwb2ludDptb3VudHBvaW50LG1vdW50czpbXX07dmFyIG1vdW50Um9vdD10eXBlLm1vdW50KG1vdW50KTttb3VudFJvb3QubW91bnQ9bW91bnQ7bW91bnQucm9vdD1tb3VudFJvb3Q7aWYocm9vdCl7RlMucm9vdD1tb3VudFJvb3R9ZWxzZSBpZihub2RlKXtub2RlLm1vdW50ZWQ9bW91bnQ7aWYobm9kZS5tb3VudCl7bm9kZS5tb3VudC5tb3VudHMucHVzaChtb3VudCl9fXJldHVybiBtb3VudFJvb3R9LHVubW91bnQobW91bnRwb2ludCl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKG1vdW50cG9pbnQse2ZvbGxvd19tb3VudDpmYWxzZX0pO2lmKCFGUy5pc01vdW50cG9pbnQobG9va3VwLm5vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9dmFyIG5vZGU9bG9va3VwLm5vZGU7dmFyIG1vdW50PW5vZGUubW91bnRlZDt2YXIgbW91bnRzPUZTLmdldE1vdW50cyhtb3VudCk7T2JqZWN0LmtleXMoRlMubmFtZVRhYmxlKS5mb3JFYWNoKGhhc2g9Pnt2YXIgY3VycmVudD1GUy5uYW1lVGFibGVbaGFzaF07d2hpbGUoY3VycmVudCl7dmFyIG5leHQ9Y3VycmVudC5uYW1lX25leHQ7aWYobW91bnRzLmluY2x1ZGVzKGN1cnJlbnQubW91bnQpKXtGUy5kZXN0cm95Tm9kZShjdXJyZW50KX1jdXJyZW50PW5leHR9fSk7bm9kZS5tb3VudGVkPW51bGw7dmFyIGlkeD1ub2RlLm1vdW50Lm1vdW50cy5pbmRleE9mKG1vdW50KTtub2RlLm1vdW50Lm1vdW50cy5zcGxpY2UoaWR4LDEpfSxsb29rdXAocGFyZW50LG5hbWUpe3JldHVybiBwYXJlbnQubm9kZV9vcHMubG9va3VwKHBhcmVudCxuYW1lKX0sbWtub2QocGF0aCxtb2RlLGRldil7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTt2YXIgbmFtZT1QQVRILmJhc2VuYW1lKHBhdGgpO2lmKCFuYW1lfHxuYW1lPT09Ii4ifHxuYW1lPT09Ii4uIil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXZhciBlcnJDb2RlPUZTLm1heUNyZWF0ZShwYXJlbnQsbmFtZSk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9aWYoIXBhcmVudC5ub2RlX29wcy5ta25vZCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfXJldHVybiBwYXJlbnQubm9kZV9vcHMubWtub2QocGFyZW50LG5hbWUsbW9kZSxkZXYpfSxjcmVhdGUocGF0aCxtb2RlKXttb2RlPW1vZGUhPT11bmRlZmluZWQ/bW9kZTo0Mzg7bW9kZSY9NDA5NTttb2RlfD0zMjc2ODtyZXR1cm4gRlMubWtub2QocGF0aCxtb2RlLDApfSxta2RpcihwYXRoLG1vZGUpe21vZGU9bW9kZSE9PXVuZGVmaW5lZD9tb2RlOjUxMTttb2RlJj01MTF8NTEyO21vZGV8PTE2Mzg0O3JldHVybiBGUy5ta25vZChwYXRoLG1vZGUsMCl9LG1rZGlyVHJlZShwYXRoLG1vZGUpe3ZhciBkaXJzPXBhdGguc3BsaXQoIi8iKTt2YXIgZD0iIjtmb3IodmFyIGk9MDtpPGRpcnMubGVuZ3RoOysraSl7aWYoIWRpcnNbaV0pY29udGludWU7ZCs9Ii8iK2RpcnNbaV07dHJ5e0ZTLm1rZGlyKGQsbW9kZSl9Y2F0Y2goZSl7aWYoZS5lcnJubyE9MjApdGhyb3cgZX19fSxta2RldihwYXRoLG1vZGUsZGV2KXtpZih0eXBlb2YgZGV2PT0idW5kZWZpbmVkIil7ZGV2PW1vZGU7bW9kZT00Mzh9bW9kZXw9ODE5MjtyZXR1cm4gRlMubWtub2QocGF0aCxtb2RlLGRldil9LHN5bWxpbmsob2xkcGF0aCxuZXdwYXRoKXtpZighUEFUSF9GUy5yZXNvbHZlKG9sZHBhdGgpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKG5ld3BhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTtpZighcGFyZW50KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9dmFyIG5ld25hbWU9UEFUSC5iYXNlbmFtZShuZXdwYXRoKTt2YXIgZXJyQ29kZT1GUy5tYXlDcmVhdGUocGFyZW50LG5ld25hbWUpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfWlmKCFwYXJlbnQubm9kZV9vcHMuc3ltbGluayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfXJldHVybiBwYXJlbnQubm9kZV9vcHMuc3ltbGluayhwYXJlbnQsbmV3bmFtZSxvbGRwYXRoKX0scmVuYW1lKG9sZF9wYXRoLG5ld19wYXRoKXt2YXIgb2xkX2Rpcm5hbWU9UEFUSC5kaXJuYW1lKG9sZF9wYXRoKTt2YXIgbmV3X2Rpcm5hbWU9UEFUSC5kaXJuYW1lKG5ld19wYXRoKTt2YXIgb2xkX25hbWU9UEFUSC5iYXNlbmFtZShvbGRfcGF0aCk7dmFyIG5ld19uYW1lPVBBVEguYmFzZW5hbWUobmV3X3BhdGgpO3ZhciBsb29rdXAsb2xkX2RpcixuZXdfZGlyO2xvb2t1cD1GUy5sb29rdXBQYXRoKG9sZF9wYXRoLHtwYXJlbnQ6dHJ1ZX0pO29sZF9kaXI9bG9va3VwLm5vZGU7bG9va3VwPUZTLmxvb2t1cFBhdGgobmV3X3BhdGgse3BhcmVudDp0cnVlfSk7bmV3X2Rpcj1sb29rdXAubm9kZTtpZighb2xkX2Rpcnx8IW5ld19kaXIpdGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpO2lmKG9sZF9kaXIubW91bnQhPT1uZXdfZGlyLm1vdW50KXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig3NSl9dmFyIG9sZF9ub2RlPUZTLmxvb2t1cE5vZGUob2xkX2RpcixvbGRfbmFtZSk7dmFyIHJlbGF0aXZlPVBBVEhfRlMucmVsYXRpdmUob2xkX3BhdGgsbmV3X2Rpcm5hbWUpO2lmKHJlbGF0aXZlLmNoYXJBdCgwKSE9PSIuIil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXJlbGF0aXZlPVBBVEhfRlMucmVsYXRpdmUobmV3X3BhdGgsb2xkX2Rpcm5hbWUpO2lmKHJlbGF0aXZlLmNoYXJBdCgwKSE9PSIuIil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNTUpfXZhciBuZXdfbm9kZTt0cnl7bmV3X25vZGU9RlMubG9va3VwTm9kZShuZXdfZGlyLG5ld19uYW1lKX1jYXRjaChlKXt9aWYob2xkX25vZGU9PT1uZXdfbm9kZSl7cmV0dXJufXZhciBpc2Rpcj1GUy5pc0RpcihvbGRfbm9kZS5tb2RlKTt2YXIgZXJyQ29kZT1GUy5tYXlEZWxldGUob2xkX2RpcixvbGRfbmFtZSxpc2Rpcik7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9ZXJyQ29kZT1uZXdfbm9kZT9GUy5tYXlEZWxldGUobmV3X2RpcixuZXdfbmFtZSxpc2Rpcik6RlMubWF5Q3JlYXRlKG5ld19kaXIsbmV3X25hbWUpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfWlmKCFvbGRfZGlyLm5vZGVfb3BzLnJlbmFtZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKEZTLmlzTW91bnRwb2ludChvbGRfbm9kZSl8fG5ld19ub2RlJiZGUy5pc01vdW50cG9pbnQobmV3X25vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9aWYobmV3X2RpciE9PW9sZF9kaXIpe2VyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKG9sZF9kaXIsInciKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX19RlMuaGFzaFJlbW92ZU5vZGUob2xkX25vZGUpO3RyeXtvbGRfZGlyLm5vZGVfb3BzLnJlbmFtZShvbGRfbm9kZSxuZXdfZGlyLG5ld19uYW1lKX1jYXRjaChlKXt0aHJvdyBlfWZpbmFsbHl7RlMuaGFzaEFkZE5vZGUob2xkX25vZGUpfX0scm1kaXIocGF0aCl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse3BhcmVudDp0cnVlfSk7dmFyIHBhcmVudD1sb29rdXAubm9kZTt2YXIgbmFtZT1QQVRILmJhc2VuYW1lKHBhdGgpO3ZhciBub2RlPUZTLmxvb2t1cE5vZGUocGFyZW50LG5hbWUpO3ZhciBlcnJDb2RlPUZTLm1heURlbGV0ZShwYXJlbnQsbmFtZSx0cnVlKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1pZighcGFyZW50Lm5vZGVfb3BzLnJtZGlyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9aWYoRlMuaXNNb3VudHBvaW50KG5vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMCl9cGFyZW50Lm5vZGVfb3BzLnJtZGlyKHBhcmVudCxuYW1lKTtGUy5kZXN0cm95Tm9kZShub2RlKX0scmVhZGRpcihwYXRoKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OnRydWV9KTt2YXIgbm9kZT1sb29rdXAubm9kZTtpZighbm9kZS5ub2RlX29wcy5yZWFkZGlyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NCl9cmV0dXJuIG5vZGUubm9kZV9vcHMucmVhZGRpcihub2RlKX0sdW5saW5rKHBhdGgpe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtwYXJlbnQ6dHJ1ZX0pO3ZhciBwYXJlbnQ9bG9va3VwLm5vZGU7aWYoIXBhcmVudCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfXZhciBuYW1lPVBBVEguYmFzZW5hbWUocGF0aCk7dmFyIG5vZGU9RlMubG9va3VwTm9kZShwYXJlbnQsbmFtZSk7dmFyIGVyckNvZGU9RlMubWF5RGVsZXRlKHBhcmVudCxuYW1lLGZhbHNlKTtpZihlcnJDb2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcihlcnJDb2RlKX1pZighcGFyZW50Lm5vZGVfb3BzLnVubGluayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKEZTLmlzTW91bnRwb2ludChub2RlKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMTApfXBhcmVudC5ub2RlX29wcy51bmxpbmsocGFyZW50LG5hbWUpO0ZTLmRlc3Ryb3lOb2RlKG5vZGUpfSxyZWFkbGluayhwYXRoKXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCk7dmFyIGxpbms9bG9va3VwLm5vZGU7aWYoIWxpbmspe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1pZighbGluay5ub2RlX29wcy5yZWFkbGluayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjgpfXJldHVybiBQQVRIX0ZTLnJlc29sdmUoRlMuZ2V0UGF0aChsaW5rLnBhcmVudCksbGluay5ub2RlX29wcy5yZWFkbGluayhsaW5rKSl9LHN0YXQocGF0aCxkb250Rm9sbG93KXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7Zm9sbG93OiFkb250Rm9sbG93fSk7dmFyIG5vZGU9bG9va3VwLm5vZGU7aWYoIW5vZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1pZighbm9kZS5ub2RlX29wcy5nZXRhdHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig2Myl9cmV0dXJuIG5vZGUubm9kZV9vcHMuZ2V0YXR0cihub2RlKX0sbHN0YXQocGF0aCl7cmV0dXJuIEZTLnN0YXQocGF0aCx0cnVlKX0sY2htb2QocGF0aCxtb2RlLGRvbnRGb2xsb3cpe3ZhciBub2RlO2lmKHR5cGVvZiBwYXRoPT0ic3RyaW5nIil7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udEZvbGxvd30pO25vZGU9bG9va3VwLm5vZGV9ZWxzZXtub2RlPXBhdGh9aWYoIW5vZGUubm9kZV9vcHMuc2V0YXR0cil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfW5vZGUubm9kZV9vcHMuc2V0YXR0cihub2RlLHttb2RlOm1vZGUmNDA5NXxub2RlLm1vZGUmfjQwOTUsdGltZXN0YW1wOkRhdGUubm93KCl9KX0sbGNobW9kKHBhdGgsbW9kZSl7RlMuY2htb2QocGF0aCxtb2RlLHRydWUpfSxmY2htb2QoZmQsbW9kZSl7dmFyIHN0cmVhbT1GUy5nZXRTdHJlYW1DaGVja2VkKGZkKTtGUy5jaG1vZChzdHJlYW0ubm9kZSxtb2RlKX0sY2hvd24ocGF0aCx1aWQsZ2lkLGRvbnRGb2xsb3cpe3ZhciBub2RlO2lmKHR5cGVvZiBwYXRoPT0ic3RyaW5nIil7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udEZvbGxvd30pO25vZGU9bG9va3VwLm5vZGV9ZWxzZXtub2RlPXBhdGh9aWYoIW5vZGUubm9kZV9vcHMuc2V0YXR0cil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfW5vZGUubm9kZV9vcHMuc2V0YXR0cihub2RlLHt0aW1lc3RhbXA6RGF0ZS5ub3coKX0pfSxsY2hvd24ocGF0aCx1aWQsZ2lkKXtGUy5jaG93bihwYXRoLHVpZCxnaWQsdHJ1ZSl9LGZjaG93bihmZCx1aWQsZ2lkKXt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbUNoZWNrZWQoZmQpO0ZTLmNob3duKHN0cmVhbS5ub2RlLHVpZCxnaWQpfSx0cnVuY2F0ZShwYXRoLGxlbil7aWYobGVuPDApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgbm9kZTtpZih0eXBlb2YgcGF0aD09InN0cmluZyIpe3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6dHJ1ZX0pO25vZGU9bG9va3VwLm5vZGV9ZWxzZXtub2RlPXBhdGh9aWYoIW5vZGUubm9kZV9vcHMuc2V0YXR0cil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNjMpfWlmKEZTLmlzRGlyKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDMxKX1pZighRlMuaXNGaWxlKG5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgZXJyQ29kZT1GUy5ub2RlUGVybWlzc2lvbnMobm9kZSwidyIpO2lmKGVyckNvZGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKGVyckNvZGUpfW5vZGUubm9kZV9vcHMuc2V0YXR0cihub2RlLHtzaXplOmxlbix0aW1lc3RhbXA6RGF0ZS5ub3coKX0pfSxmdHJ1bmNhdGUoZmQsbGVuKXt2YXIgc3RyZWFtPUZTLmdldFN0cmVhbUNoZWNrZWQoZmQpO2lmKChzdHJlYW0uZmxhZ3MmMjA5NzE1NSk9PT0wKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9RlMudHJ1bmNhdGUoc3RyZWFtLm5vZGUsbGVuKX0sdXRpbWUocGF0aCxhdGltZSxtdGltZSl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzp0cnVlfSk7dmFyIG5vZGU9bG9va3VwLm5vZGU7bm9kZS5ub2RlX29wcy5zZXRhdHRyKG5vZGUse3RpbWVzdGFtcDpNYXRoLm1heChhdGltZSxtdGltZSl9KX0sb3BlbihwYXRoLGZsYWdzLG1vZGUpe2lmKHBhdGg9PT0iIil7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDQpfWZsYWdzPXR5cGVvZiBmbGFncz09InN0cmluZyI/RlNfbW9kZVN0cmluZ1RvRmxhZ3MoZmxhZ3MpOmZsYWdzO21vZGU9dHlwZW9mIG1vZGU9PSJ1bmRlZmluZWQiPzQzODptb2RlO2lmKGZsYWdzJjY0KXttb2RlPW1vZGUmNDA5NXwzMjc2OH1lbHNle21vZGU9MH12YXIgbm9kZTtpZih0eXBlb2YgcGF0aD09Im9iamVjdCIpe25vZGU9cGF0aH1lbHNle3BhdGg9UEFUSC5ub3JtYWxpemUocGF0aCk7dHJ5e3ZhciBsb29rdXA9RlMubG9va3VwUGF0aChwYXRoLHtmb2xsb3c6IShmbGFncyYxMzEwNzIpfSk7bm9kZT1sb29rdXAubm9kZX1jYXRjaChlKXt9fXZhciBjcmVhdGVkPWZhbHNlO2lmKGZsYWdzJjY0KXtpZihub2RlKXtpZihmbGFncyYxMjgpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDIwKX19ZWxzZXtub2RlPUZTLm1rbm9kKHBhdGgsbW9kZSwwKTtjcmVhdGVkPXRydWV9fWlmKCFub2RlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9aWYoRlMuaXNDaHJkZXYobm9kZS5tb2RlKSl7ZmxhZ3MmPX41MTJ9aWYoZmxhZ3MmNjU1MzYmJiFGUy5pc0Rpcihub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NCl9aWYoIWNyZWF0ZWQpe3ZhciBlcnJDb2RlPUZTLm1heU9wZW4obm9kZSxmbGFncyk7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9fWlmKGZsYWdzJjUxMiYmIWNyZWF0ZWQpe0ZTLnRydW5jYXRlKG5vZGUsMCl9ZmxhZ3MmPX4oMTI4fDUxMnwxMzEwNzIpO3ZhciBzdHJlYW09RlMuY3JlYXRlU3RyZWFtKHtub2RlOm5vZGUscGF0aDpGUy5nZXRQYXRoKG5vZGUpLGZsYWdzOmZsYWdzLHNlZWthYmxlOnRydWUscG9zaXRpb246MCxzdHJlYW1fb3BzOm5vZGUuc3RyZWFtX29wcyx1bmdvdHRlbjpbXSxlcnJvcjpmYWxzZX0pO2lmKHN0cmVhbS5zdHJlYW1fb3BzLm9wZW4pe3N0cmVhbS5zdHJlYW1fb3BzLm9wZW4oc3RyZWFtKX1pZihNb2R1bGVbImxvZ1JlYWRGaWxlcyJdJiYhKGZsYWdzJjEpKXtpZighRlMucmVhZEZpbGVzKUZTLnJlYWRGaWxlcz17fTtpZighKHBhdGggaW4gRlMucmVhZEZpbGVzKSl7RlMucmVhZEZpbGVzW3BhdGhdPTF9fXJldHVybiBzdHJlYW19LGNsb3NlKHN0cmVhbSl7aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoc3RyZWFtLmdldGRlbnRzKXN0cmVhbS5nZXRkZW50cz1udWxsO3RyeXtpZihzdHJlYW0uc3RyZWFtX29wcy5jbG9zZSl7c3RyZWFtLnN0cmVhbV9vcHMuY2xvc2Uoc3RyZWFtKX19Y2F0Y2goZSl7dGhyb3cgZX1maW5hbGx5e0ZTLmNsb3NlU3RyZWFtKHN0cmVhbS5mZCl9c3RyZWFtLmZkPW51bGx9LGlzQ2xvc2VkKHN0cmVhbSl7cmV0dXJuIHN0cmVhbS5mZD09PW51bGx9LGxsc2VlayhzdHJlYW0sb2Zmc2V0LHdoZW5jZSl7aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoIXN0cmVhbS5zZWVrYWJsZXx8IXN0cmVhbS5zdHJlYW1fb3BzLmxsc2Vlayl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNzApfWlmKHdoZW5jZSE9MCYmd2hlbmNlIT0xJiZ3aGVuY2UhPTIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1zdHJlYW0ucG9zaXRpb249c3RyZWFtLnN0cmVhbV9vcHMubGxzZWVrKHN0cmVhbSxvZmZzZXQsd2hlbmNlKTtzdHJlYW0udW5nb3R0ZW49W107cmV0dXJuIHN0cmVhbS5wb3NpdGlvbn0scmVhZChzdHJlYW0sYnVmZmVyLG9mZnNldCxsZW5ndGgscG9zaXRpb24pe2lmKGxlbmd0aDwwfHxwb3NpdGlvbjwwKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOCl9aWYoRlMuaXNDbG9zZWQoc3RyZWFtKSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoKHN0cmVhbS5mbGFncyYyMDk3MTU1KT09PTEpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKEZTLmlzRGlyKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigzMSl9aWYoIXN0cmVhbS5zdHJlYW1fb3BzLnJlYWQpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX12YXIgc2Vla2luZz10eXBlb2YgcG9zaXRpb24hPSJ1bmRlZmluZWQiO2lmKCFzZWVraW5nKXtwb3NpdGlvbj1zdHJlYW0ucG9zaXRpb259ZWxzZSBpZighc3RyZWFtLnNlZWthYmxlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig3MCl9dmFyIGJ5dGVzUmVhZD1zdHJlYW0uc3RyZWFtX29wcy5yZWFkKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbik7aWYoIXNlZWtpbmcpc3RyZWFtLnBvc2l0aW9uKz1ieXRlc1JlYWQ7cmV0dXJuIGJ5dGVzUmVhZH0sd3JpdGUoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uLGNhbk93bil7aWYobGVuZ3RoPDB8fHBvc2l0aW9uPDApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZihGUy5pc0Nsb3NlZChzdHJlYW0pKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig4KX1pZigoc3RyZWFtLmZsYWdzJjIwOTcxNTUpPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoRlMuaXNEaXIoc3RyZWFtLm5vZGUubW9kZSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDMxKX1pZighc3RyZWFtLnN0cmVhbV9vcHMud3JpdGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZihzdHJlYW0uc2Vla2FibGUmJnN0cmVhbS5mbGFncyYxMDI0KXtGUy5sbHNlZWsoc3RyZWFtLDAsMil9dmFyIHNlZWtpbmc9dHlwZW9mIHBvc2l0aW9uIT0idW5kZWZpbmVkIjtpZighc2Vla2luZyl7cG9zaXRpb249c3RyZWFtLnBvc2l0aW9ufWVsc2UgaWYoIXN0cmVhbS5zZWVrYWJsZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNzApfXZhciBieXRlc1dyaXR0ZW49c3RyZWFtLnN0cmVhbV9vcHMud3JpdGUoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uLGNhbk93bik7aWYoIXNlZWtpbmcpc3RyZWFtLnBvc2l0aW9uKz1ieXRlc1dyaXR0ZW47cmV0dXJuIGJ5dGVzV3JpdHRlbn0sYWxsb2NhdGUoc3RyZWFtLG9mZnNldCxsZW5ndGgpe2lmKEZTLmlzQ2xvc2VkKHN0cmVhbSkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDgpfWlmKG9mZnNldDwwfHxsZW5ndGg8PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI4KX1pZigoc3RyZWFtLmZsYWdzJjIwOTcxNTUpPT09MCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoOCl9aWYoIUZTLmlzRmlsZShzdHJlYW0ubm9kZS5tb2RlKSYmIUZTLmlzRGlyKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9aWYoIXN0cmVhbS5zdHJlYW1fb3BzLmFsbG9jYXRlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigxMzgpfXN0cmVhbS5zdHJlYW1fb3BzLmFsbG9jYXRlKHN0cmVhbSxvZmZzZXQsbGVuZ3RoKX0sbW1hcChzdHJlYW0sbGVuZ3RoLHBvc2l0aW9uLHByb3QsZmxhZ3Mpe2lmKChwcm90JjIpIT09MCYmKGZsYWdzJjIpPT09MCYmKHN0cmVhbS5mbGFncyYyMDk3MTU1KSE9PTIpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDIpfWlmKChzdHJlYW0uZmxhZ3MmMjA5NzE1NSk9PT0xKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyKX1pZighc3RyZWFtLnN0cmVhbV9vcHMubW1hcCl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoNDMpfXJldHVybiBzdHJlYW0uc3RyZWFtX29wcy5tbWFwKHN0cmVhbSxsZW5ndGgscG9zaXRpb24scHJvdCxmbGFncyl9LG1zeW5jKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxtbWFwRmxhZ3Mpe2lmKCFzdHJlYW0uc3RyZWFtX29wcy5tc3luYyl7cmV0dXJuIDB9cmV0dXJuIHN0cmVhbS5zdHJlYW1fb3BzLm1zeW5jKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxtbWFwRmxhZ3MpfSxtdW5tYXA6c3RyZWFtPT4wLGlvY3RsKHN0cmVhbSxjbWQsYXJnKXtpZighc3RyZWFtLnN0cmVhbV9vcHMuaW9jdGwpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDU5KX1yZXR1cm4gc3RyZWFtLnN0cmVhbV9vcHMuaW9jdGwoc3RyZWFtLGNtZCxhcmcpfSxyZWFkRmlsZShwYXRoLG9wdHM9e30pe29wdHMuZmxhZ3M9b3B0cy5mbGFnc3x8MDtvcHRzLmVuY29kaW5nPW9wdHMuZW5jb2Rpbmd8fCJiaW5hcnkiO2lmKG9wdHMuZW5jb2RpbmchPT0idXRmOCImJm9wdHMuZW5jb2RpbmchPT0iYmluYXJ5Iil7dGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGVuY29kaW5nIHR5cGUgIiR7b3B0cy5lbmNvZGluZ30iYCl9dmFyIHJldDt2YXIgc3RyZWFtPUZTLm9wZW4ocGF0aCxvcHRzLmZsYWdzKTt2YXIgc3RhdD1GUy5zdGF0KHBhdGgpO3ZhciBsZW5ndGg9c3RhdC5zaXplO3ZhciBidWY9bmV3IFVpbnQ4QXJyYXkobGVuZ3RoKTtGUy5yZWFkKHN0cmVhbSxidWYsMCxsZW5ndGgsMCk7aWYob3B0cy5lbmNvZGluZz09PSJ1dGY4Iil7cmV0PVVURjhBcnJheVRvU3RyaW5nKGJ1ZiwwKX1lbHNlIGlmKG9wdHMuZW5jb2Rpbmc9PT0iYmluYXJ5Iil7cmV0PWJ1Zn1GUy5jbG9zZShzdHJlYW0pO3JldHVybiByZXR9LHdyaXRlRmlsZShwYXRoLGRhdGEsb3B0cz17fSl7b3B0cy5mbGFncz1vcHRzLmZsYWdzfHw1Nzc7dmFyIHN0cmVhbT1GUy5vcGVuKHBhdGgsb3B0cy5mbGFncyxvcHRzLm1vZGUpO2lmKHR5cGVvZiBkYXRhPT0ic3RyaW5nIil7dmFyIGJ1Zj1uZXcgVWludDhBcnJheShsZW5ndGhCeXRlc1VURjgoZGF0YSkrMSk7dmFyIGFjdHVhbE51bUJ5dGVzPXN0cmluZ1RvVVRGOEFycmF5KGRhdGEsYnVmLDAsYnVmLmxlbmd0aCk7RlMud3JpdGUoc3RyZWFtLGJ1ZiwwLGFjdHVhbE51bUJ5dGVzLHVuZGVmaW5lZCxvcHRzLmNhbk93bil9ZWxzZSBpZihBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpe0ZTLndyaXRlKHN0cmVhbSxkYXRhLDAsZGF0YS5ieXRlTGVuZ3RoLHVuZGVmaW5lZCxvcHRzLmNhbk93bil9ZWxzZXt0aHJvdyBuZXcgRXJyb3IoIlVuc3VwcG9ydGVkIGRhdGEgdHlwZSIpfUZTLmNsb3NlKHN0cmVhbSl9LGN3ZDooKT0+RlMuY3VycmVudFBhdGgsY2hkaXIocGF0aCl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzp0cnVlfSk7aWYobG9va3VwLm5vZGU9PT1udWxsKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0NCl9aWYoIUZTLmlzRGlyKGxvb2t1cC5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig1NCl9dmFyIGVyckNvZGU9RlMubm9kZVBlcm1pc3Npb25zKGxvb2t1cC5ub2RlLCJ4Iik7aWYoZXJyQ29kZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoZXJyQ29kZSl9RlMuY3VycmVudFBhdGg9bG9va3VwLnBhdGh9LGNyZWF0ZURlZmF1bHREaXJlY3Rvcmllcygpe0ZTLm1rZGlyKCIvdG1wIik7RlMubWtkaXIoIi9ob21lIik7RlMubWtkaXIoIi9ob21lL3dlYl91c2VyIil9LGNyZWF0ZURlZmF1bHREZXZpY2VzKCl7RlMubWtkaXIoIi9kZXYiKTtGUy5yZWdpc3RlckRldmljZShGUy5tYWtlZGV2KDEsMykse3JlYWQ6KCk9PjAsd3JpdGU6KHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3MpPT5sZW5ndGh9KTtGUy5ta2RldigiL2Rldi9udWxsIixGUy5tYWtlZGV2KDEsMykpO1RUWS5yZWdpc3RlcihGUy5tYWtlZGV2KDUsMCksVFRZLmRlZmF1bHRfdHR5X29wcyk7VFRZLnJlZ2lzdGVyKEZTLm1ha2VkZXYoNiwwKSxUVFkuZGVmYXVsdF90dHkxX29wcyk7RlMubWtkZXYoIi9kZXYvdHR5IixGUy5tYWtlZGV2KDUsMCkpO0ZTLm1rZGV2KCIvZGV2L3R0eTEiLEZTLm1ha2VkZXYoNiwwKSk7dmFyIHJhbmRvbUJ1ZmZlcj1uZXcgVWludDhBcnJheSgxMDI0KSxyYW5kb21MZWZ0PTA7dmFyIHJhbmRvbUJ5dGU9KCk9PntpZihyYW5kb21MZWZ0PT09MCl7cmFuZG9tTGVmdD1yYW5kb21GaWxsKHJhbmRvbUJ1ZmZlcikuYnl0ZUxlbmd0aH1yZXR1cm4gcmFuZG9tQnVmZmVyWy0tcmFuZG9tTGVmdF19O0ZTLmNyZWF0ZURldmljZSgiL2RldiIsInJhbmRvbSIscmFuZG9tQnl0ZSk7RlMuY3JlYXRlRGV2aWNlKCIvZGV2IiwidXJhbmRvbSIscmFuZG9tQnl0ZSk7RlMubWtkaXIoIi9kZXYvc2htIik7RlMubWtkaXIoIi9kZXYvc2htL3RtcCIpfSxjcmVhdGVTcGVjaWFsRGlyZWN0b3JpZXMoKXtGUy5ta2RpcigiL3Byb2MiKTt2YXIgcHJvY19zZWxmPUZTLm1rZGlyKCIvcHJvYy9zZWxmIik7RlMubWtkaXIoIi9wcm9jL3NlbGYvZmQiKTtGUy5tb3VudCh7bW91bnQoKXt2YXIgbm9kZT1GUy5jcmVhdGVOb2RlKHByb2Nfc2VsZiwiZmQiLDE2Mzg0fDUxMSw3Myk7bm9kZS5ub2RlX29wcz17bG9va3VwKHBhcmVudCxuYW1lKXt2YXIgZmQ9K25hbWU7dmFyIHN0cmVhbT1GUy5nZXRTdHJlYW1DaGVja2VkKGZkKTt2YXIgcmV0PXtwYXJlbnQ6bnVsbCxtb3VudDp7bW91bnRwb2ludDoiZmFrZSJ9LG5vZGVfb3BzOntyZWFkbGluazooKT0+c3RyZWFtLnBhdGh9fTtyZXQucGFyZW50PXJldDtyZXR1cm4gcmV0fX07cmV0dXJuIG5vZGV9fSx7fSwiL3Byb2Mvc2VsZi9mZCIpfSxjcmVhdGVTdGFuZGFyZFN0cmVhbXMoKXtpZihNb2R1bGVbInN0ZGluIl0pe0ZTLmNyZWF0ZURldmljZSgiL2RldiIsInN0ZGluIixNb2R1bGVbInN0ZGluIl0pfWVsc2V7RlMuc3ltbGluaygiL2Rldi90dHkiLCIvZGV2L3N0ZGluIil9aWYoTW9kdWxlWyJzdGRvdXQiXSl7RlMuY3JlYXRlRGV2aWNlKCIvZGV2Iiwic3Rkb3V0IixudWxsLE1vZHVsZVsic3Rkb3V0Il0pfWVsc2V7RlMuc3ltbGluaygiL2Rldi90dHkiLCIvZGV2L3N0ZG91dCIpfWlmKE1vZHVsZVsic3RkZXJyIl0pe0ZTLmNyZWF0ZURldmljZSgiL2RldiIsInN0ZGVyciIsbnVsbCxNb2R1bGVbInN0ZGVyciJdKX1lbHNle0ZTLnN5bWxpbmsoIi9kZXYvdHR5MSIsIi9kZXYvc3RkZXJyIil9dmFyIHN0ZGluPUZTLm9wZW4oIi9kZXYvc3RkaW4iLDApO3ZhciBzdGRvdXQ9RlMub3BlbigiL2Rldi9zdGRvdXQiLDEpO3ZhciBzdGRlcnI9RlMub3BlbigiL2Rldi9zdGRlcnIiLDEpfSxlbnN1cmVFcnJub0Vycm9yKCl7aWYoRlMuRXJybm9FcnJvcilyZXR1cm47RlMuRXJybm9FcnJvcj1mdW5jdGlvbiBFcnJub0Vycm9yKGVycm5vLG5vZGUpe3RoaXMubmFtZT0iRXJybm9FcnJvciI7dGhpcy5ub2RlPW5vZGU7dGhpcy5zZXRFcnJubz1mdW5jdGlvbihlcnJubyl7dGhpcy5lcnJubz1lcnJub307dGhpcy5zZXRFcnJubyhlcnJubyk7dGhpcy5tZXNzYWdlPSJGUyBlcnJvciJ9O0ZTLkVycm5vRXJyb3IucHJvdG90eXBlPW5ldyBFcnJvcjtGUy5FcnJub0Vycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1GUy5FcnJub0Vycm9yO1s0NF0uZm9yRWFjaChjb2RlPT57RlMuZ2VuZXJpY0Vycm9yc1tjb2RlXT1uZXcgRlMuRXJybm9FcnJvcihjb2RlKTtGUy5nZW5lcmljRXJyb3JzW2NvZGVdLnN0YWNrPSI8Z2VuZXJpYyBlcnJvciwgbm8gc3RhY2s+In0pfSxzdGF0aWNJbml0KCl7RlMuZW5zdXJlRXJybm9FcnJvcigpO0ZTLm5hbWVUYWJsZT1uZXcgQXJyYXkoNDA5Nik7RlMubW91bnQoTUVNRlMse30sIi8iKTtGUy5jcmVhdGVEZWZhdWx0RGlyZWN0b3JpZXMoKTtGUy5jcmVhdGVEZWZhdWx0RGV2aWNlcygpO0ZTLmNyZWF0ZVNwZWNpYWxEaXJlY3RvcmllcygpO0ZTLmZpbGVzeXN0ZW1zPXsiTUVNRlMiOk1FTUZTfX0saW5pdChpbnB1dCxvdXRwdXQsZXJyb3Ipe0ZTLmluaXQuaW5pdGlhbGl6ZWQ9dHJ1ZTtGUy5lbnN1cmVFcnJub0Vycm9yKCk7TW9kdWxlWyJzdGRpbiJdPWlucHV0fHxNb2R1bGVbInN0ZGluIl07TW9kdWxlWyJzdGRvdXQiXT1vdXRwdXR8fE1vZHVsZVsic3Rkb3V0Il07TW9kdWxlWyJzdGRlcnIiXT1lcnJvcnx8TW9kdWxlWyJzdGRlcnIiXTtGUy5jcmVhdGVTdGFuZGFyZFN0cmVhbXMoKX0scXVpdCgpe0ZTLmluaXQuaW5pdGlhbGl6ZWQ9ZmFsc2U7X2ZmbHVzaCgwKTtmb3IodmFyIGk9MDtpPEZTLnN0cmVhbXMubGVuZ3RoO2krKyl7dmFyIHN0cmVhbT1GUy5zdHJlYW1zW2ldO2lmKCFzdHJlYW0pe2NvbnRpbnVlfUZTLmNsb3NlKHN0cmVhbSl9fSxmaW5kT2JqZWN0KHBhdGgsZG9udFJlc29sdmVMYXN0TGluayl7dmFyIHJldD1GUy5hbmFseXplUGF0aChwYXRoLGRvbnRSZXNvbHZlTGFzdExpbmspO2lmKCFyZXQuZXhpc3RzKXtyZXR1cm4gbnVsbH1yZXR1cm4gcmV0Lm9iamVjdH0sYW5hbHl6ZVBhdGgocGF0aCxkb250UmVzb2x2ZUxhc3RMaW5rKXt0cnl7dmFyIGxvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udFJlc29sdmVMYXN0TGlua30pO3BhdGg9bG9va3VwLnBhdGh9Y2F0Y2goZSl7fXZhciByZXQ9e2lzUm9vdDpmYWxzZSxleGlzdHM6ZmFsc2UsZXJyb3I6MCxuYW1lOm51bGwscGF0aDpudWxsLG9iamVjdDpudWxsLHBhcmVudEV4aXN0czpmYWxzZSxwYXJlbnRQYXRoOm51bGwscGFyZW50T2JqZWN0Om51bGx9O3RyeXt2YXIgbG9va3VwPUZTLmxvb2t1cFBhdGgocGF0aCx7cGFyZW50OnRydWV9KTtyZXQucGFyZW50RXhpc3RzPXRydWU7cmV0LnBhcmVudFBhdGg9bG9va3VwLnBhdGg7cmV0LnBhcmVudE9iamVjdD1sb29rdXAubm9kZTtyZXQubmFtZT1QQVRILmJhc2VuYW1lKHBhdGgpO2xvb2t1cD1GUy5sb29rdXBQYXRoKHBhdGgse2ZvbGxvdzohZG9udFJlc29sdmVMYXN0TGlua30pO3JldC5leGlzdHM9dHJ1ZTtyZXQucGF0aD1sb29rdXAucGF0aDtyZXQub2JqZWN0PWxvb2t1cC5ub2RlO3JldC5uYW1lPWxvb2t1cC5ub2RlLm5hbWU7cmV0LmlzUm9vdD1sb29rdXAucGF0aD09PSIvIn1jYXRjaChlKXtyZXQuZXJyb3I9ZS5lcnJub31yZXR1cm4gcmV0fSxjcmVhdGVQYXRoKHBhcmVudCxwYXRoLGNhblJlYWQsY2FuV3JpdGUpe3BhcmVudD10eXBlb2YgcGFyZW50PT0ic3RyaW5nIj9wYXJlbnQ6RlMuZ2V0UGF0aChwYXJlbnQpO3ZhciBwYXJ0cz1wYXRoLnNwbGl0KCIvIikucmV2ZXJzZSgpO3doaWxlKHBhcnRzLmxlbmd0aCl7dmFyIHBhcnQ9cGFydHMucG9wKCk7aWYoIXBhcnQpY29udGludWU7dmFyIGN1cnJlbnQ9UEFUSC5qb2luMihwYXJlbnQscGFydCk7dHJ5e0ZTLm1rZGlyKGN1cnJlbnQpfWNhdGNoKGUpe31wYXJlbnQ9Y3VycmVudH1yZXR1cm4gY3VycmVudH0sY3JlYXRlRmlsZShwYXJlbnQsbmFtZSxwcm9wZXJ0aWVzLGNhblJlYWQsY2FuV3JpdGUpe3ZhciBwYXRoPVBBVEguam9pbjIodHlwZW9mIHBhcmVudD09InN0cmluZyI/cGFyZW50OkZTLmdldFBhdGgocGFyZW50KSxuYW1lKTt2YXIgbW9kZT1GU19nZXRNb2RlKGNhblJlYWQsY2FuV3JpdGUpO3JldHVybiBGUy5jcmVhdGUocGF0aCxtb2RlKX0sY3JlYXRlRGF0YUZpbGUocGFyZW50LG5hbWUsZGF0YSxjYW5SZWFkLGNhbldyaXRlLGNhbk93bil7dmFyIHBhdGg9bmFtZTtpZihwYXJlbnQpe3BhcmVudD10eXBlb2YgcGFyZW50PT0ic3RyaW5nIj9wYXJlbnQ6RlMuZ2V0UGF0aChwYXJlbnQpO3BhdGg9bmFtZT9QQVRILmpvaW4yKHBhcmVudCxuYW1lKTpwYXJlbnR9dmFyIG1vZGU9RlNfZ2V0TW9kZShjYW5SZWFkLGNhbldyaXRlKTt2YXIgbm9kZT1GUy5jcmVhdGUocGF0aCxtb2RlKTtpZihkYXRhKXtpZih0eXBlb2YgZGF0YT09InN0cmluZyIpe3ZhciBhcnI9bmV3IEFycmF5KGRhdGEubGVuZ3RoKTtmb3IodmFyIGk9MCxsZW49ZGF0YS5sZW5ndGg7aTxsZW47KytpKWFycltpXT1kYXRhLmNoYXJDb2RlQXQoaSk7ZGF0YT1hcnJ9RlMuY2htb2Qobm9kZSxtb2RlfDE0Nik7dmFyIHN0cmVhbT1GUy5vcGVuKG5vZGUsNTc3KTtGUy53cml0ZShzdHJlYW0sZGF0YSwwLGRhdGEubGVuZ3RoLDAsY2FuT3duKTtGUy5jbG9zZShzdHJlYW0pO0ZTLmNobW9kKG5vZGUsbW9kZSl9fSxjcmVhdGVEZXZpY2UocGFyZW50LG5hbWUsaW5wdXQsb3V0cHV0KXt2YXIgcGF0aD1QQVRILmpvaW4yKHR5cGVvZiBwYXJlbnQ9PSJzdHJpbmciP3BhcmVudDpGUy5nZXRQYXRoKHBhcmVudCksbmFtZSk7dmFyIG1vZGU9RlNfZ2V0TW9kZSghIWlucHV0LCEhb3V0cHV0KTtpZighRlMuY3JlYXRlRGV2aWNlLm1ham9yKUZTLmNyZWF0ZURldmljZS5tYWpvcj02NDt2YXIgZGV2PUZTLm1ha2VkZXYoRlMuY3JlYXRlRGV2aWNlLm1ham9yKyssMCk7RlMucmVnaXN0ZXJEZXZpY2UoZGV2LHtvcGVuKHN0cmVhbSl7c3RyZWFtLnNlZWthYmxlPWZhbHNlfSxjbG9zZShzdHJlYW0pe2lmKG91dHB1dCYmb3V0cHV0LmJ1ZmZlciYmb3V0cHV0LmJ1ZmZlci5sZW5ndGgpe291dHB1dCgxMCl9fSxyZWFkKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3Mpe3ZhciBieXRlc1JlYWQ9MDtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe3ZhciByZXN1bHQ7dHJ5e3Jlc3VsdD1pbnB1dCgpfWNhdGNoKGUpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDI5KX1pZihyZXN1bHQ9PT11bmRlZmluZWQmJmJ5dGVzUmVhZD09PTApe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDYpfWlmKHJlc3VsdD09PW51bGx8fHJlc3VsdD09PXVuZGVmaW5lZClicmVhaztieXRlc1JlYWQrKztidWZmZXJbb2Zmc2V0K2ldPXJlc3VsdH1pZihieXRlc1JlYWQpe3N0cmVhbS5ub2RlLnRpbWVzdGFtcD1EYXRlLm5vdygpfXJldHVybiBieXRlc1JlYWR9LHdyaXRlKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3Mpe2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7dHJ5e291dHB1dChidWZmZXJbb2Zmc2V0K2ldKX1jYXRjaChlKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcigyOSl9fWlmKGxlbmd0aCl7c3RyZWFtLm5vZGUudGltZXN0YW1wPURhdGUubm93KCl9cmV0dXJuIGl9fSk7cmV0dXJuIEZTLm1rZGV2KHBhdGgsbW9kZSxkZXYpfSxmb3JjZUxvYWRGaWxlKG9iail7aWYob2JqLmlzRGV2aWNlfHxvYmouaXNGb2xkZXJ8fG9iai5saW5rfHxvYmouY29udGVudHMpcmV0dXJuIHRydWU7aWYodHlwZW9mIFhNTEh0dHBSZXF1ZXN0IT0idW5kZWZpbmVkIil7dGhyb3cgbmV3IEVycm9yKCJMYXp5IGxvYWRpbmcgc2hvdWxkIGhhdmUgYmVlbiBwZXJmb3JtZWQgKGNvbnRlbnRzIHNldCkgaW4gY3JlYXRlTGF6eUZpbGUsIGJ1dCBpdCB3YXMgbm90LiBMYXp5IGxvYWRpbmcgb25seSB3b3JrcyBpbiB3ZWIgd29ya2Vycy4gVXNlIC0tZW1iZWQtZmlsZSBvciAtLXByZWxvYWQtZmlsZSBpbiBlbWNjIG9uIHRoZSBtYWluIHRocmVhZC4iKX1lbHNlIGlmKHJlYWRfKXt0cnl7b2JqLmNvbnRlbnRzPWludEFycmF5RnJvbVN0cmluZyhyZWFkXyhvYmoudXJsKSx0cnVlKTtvYmoudXNlZEJ5dGVzPW9iai5jb250ZW50cy5sZW5ndGh9Y2F0Y2goZSl7dGhyb3cgbmV3IEZTLkVycm5vRXJyb3IoMjkpfX1lbHNle3Rocm93IG5ldyBFcnJvcigiQ2Fubm90IGxvYWQgd2l0aG91dCByZWFkKCkgb3IgWE1MSHR0cFJlcXVlc3QuIil9fSxjcmVhdGVMYXp5RmlsZShwYXJlbnQsbmFtZSx1cmwsY2FuUmVhZCxjYW5Xcml0ZSl7ZnVuY3Rpb24gTGF6eVVpbnQ4QXJyYXkoKXt0aGlzLmxlbmd0aEtub3duPWZhbHNlO3RoaXMuY2h1bmtzPVtdfUxhenlVaW50OEFycmF5LnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24gTGF6eVVpbnQ4QXJyYXlfZ2V0KGlkeCl7aWYoaWR4PnRoaXMubGVuZ3RoLTF8fGlkeDwwKXtyZXR1cm4gdW5kZWZpbmVkfXZhciBjaHVua09mZnNldD1pZHgldGhpcy5jaHVua1NpemU7dmFyIGNodW5rTnVtPWlkeC90aGlzLmNodW5rU2l6ZXwwO3JldHVybiB0aGlzLmdldHRlcihjaHVua051bSlbY2h1bmtPZmZzZXRdfTtMYXp5VWludDhBcnJheS5wcm90b3R5cGUuc2V0RGF0YUdldHRlcj1mdW5jdGlvbiBMYXp5VWludDhBcnJheV9zZXREYXRhR2V0dGVyKGdldHRlcil7dGhpcy5nZXR0ZXI9Z2V0dGVyfTtMYXp5VWludDhBcnJheS5wcm90b3R5cGUuY2FjaGVMZW5ndGg9ZnVuY3Rpb24gTGF6eVVpbnQ4QXJyYXlfY2FjaGVMZW5ndGgoKXt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiSEVBRCIsdXJsLGZhbHNlKTt4aHIuc2VuZChudWxsKTtpZighKHhoci5zdGF0dXM+PTIwMCYmeGhyLnN0YXR1czwzMDB8fHhoci5zdGF0dXM9PT0zMDQpKXRocm93IG5ldyBFcnJvcigiQ291bGRuJ3QgbG9hZCAiK3VybCsiLiBTdGF0dXM6ICIreGhyLnN0YXR1cyk7dmFyIGRhdGFsZW5ndGg9TnVtYmVyKHhoci5nZXRSZXNwb25zZUhlYWRlcigiQ29udGVudC1sZW5ndGgiKSk7dmFyIGhlYWRlcjt2YXIgaGFzQnl0ZVNlcnZpbmc9KGhlYWRlcj14aHIuZ2V0UmVzcG9uc2VIZWFkZXIoIkFjY2VwdC1SYW5nZXMiKSkmJmhlYWRlcj09PSJieXRlcyI7dmFyIHVzZXNHemlwPShoZWFkZXI9eGhyLmdldFJlc3BvbnNlSGVhZGVyKCJDb250ZW50LUVuY29kaW5nIikpJiZoZWFkZXI9PT0iZ3ppcCI7dmFyIGNodW5rU2l6ZT0xMDI0KjEwMjQ7aWYoIWhhc0J5dGVTZXJ2aW5nKWNodW5rU2l6ZT1kYXRhbGVuZ3RoO3ZhciBkb1hIUj0oZnJvbSx0byk9PntpZihmcm9tPnRvKXRocm93IG5ldyBFcnJvcigiaW52YWxpZCByYW5nZSAoIitmcm9tKyIsICIrdG8rIikgb3Igbm8gYnl0ZXMgcmVxdWVzdGVkISIpO2lmKHRvPmRhdGFsZW5ndGgtMSl0aHJvdyBuZXcgRXJyb3IoIm9ubHkgIitkYXRhbGVuZ3RoKyIgYnl0ZXMgYXZhaWxhYmxlISBwcm9ncmFtbWVyIGVycm9yISIpO3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3hoci5vcGVuKCJHRVQiLHVybCxmYWxzZSk7aWYoZGF0YWxlbmd0aCE9PWNodW5rU2l6ZSl4aHIuc2V0UmVxdWVzdEhlYWRlcigiUmFuZ2UiLCJieXRlcz0iK2Zyb20rIi0iK3RvKTt4aHIucmVzcG9uc2VUeXBlPSJhcnJheWJ1ZmZlciI7aWYoeGhyLm92ZXJyaWRlTWltZVR5cGUpe3hoci5vdmVycmlkZU1pbWVUeXBlKCJ0ZXh0L3BsYWluOyBjaGFyc2V0PXgtdXNlci1kZWZpbmVkIil9eGhyLnNlbmQobnVsbCk7aWYoISh4aHIuc3RhdHVzPj0yMDAmJnhoci5zdGF0dXM8MzAwfHx4aHIuc3RhdHVzPT09MzA0KSl0aHJvdyBuZXcgRXJyb3IoIkNvdWxkbid0IGxvYWQgIit1cmwrIi4gU3RhdHVzOiAiK3hoci5zdGF0dXMpO2lmKHhoci5yZXNwb25zZSE9PXVuZGVmaW5lZCl7cmV0dXJuIG5ldyBVaW50OEFycmF5KHhoci5yZXNwb25zZXx8W10pfXJldHVybiBpbnRBcnJheUZyb21TdHJpbmcoeGhyLnJlc3BvbnNlVGV4dHx8IiIsdHJ1ZSl9O3ZhciBsYXp5QXJyYXk9dGhpcztsYXp5QXJyYXkuc2V0RGF0YUdldHRlcihjaHVua051bT0+e3ZhciBzdGFydD1jaHVua051bSpjaHVua1NpemU7dmFyIGVuZD0oY2h1bmtOdW0rMSkqY2h1bmtTaXplLTE7ZW5kPU1hdGgubWluKGVuZCxkYXRhbGVuZ3RoLTEpO2lmKHR5cGVvZiBsYXp5QXJyYXkuY2h1bmtzW2NodW5rTnVtXT09InVuZGVmaW5lZCIpe2xhenlBcnJheS5jaHVua3NbY2h1bmtOdW1dPWRvWEhSKHN0YXJ0LGVuZCl9aWYodHlwZW9mIGxhenlBcnJheS5jaHVua3NbY2h1bmtOdW1dPT0idW5kZWZpbmVkIil0aHJvdyBuZXcgRXJyb3IoImRvWEhSIGZhaWxlZCEiKTtyZXR1cm4gbGF6eUFycmF5LmNodW5rc1tjaHVua051bV19KTtpZih1c2VzR3ppcHx8IWRhdGFsZW5ndGgpe2NodW5rU2l6ZT1kYXRhbGVuZ3RoPTE7ZGF0YWxlbmd0aD10aGlzLmdldHRlcigwKS5sZW5ndGg7Y2h1bmtTaXplPWRhdGFsZW5ndGg7b3V0KCJMYXp5RmlsZXMgb24gZ3ppcCBmb3JjZXMgZG93bmxvYWQgb2YgdGhlIHdob2xlIGZpbGUgd2hlbiBsZW5ndGggaXMgYWNjZXNzZWQiKX10aGlzLl9sZW5ndGg9ZGF0YWxlbmd0aDt0aGlzLl9jaHVua1NpemU9Y2h1bmtTaXplO3RoaXMubGVuZ3RoS25vd249dHJ1ZX07aWYodHlwZW9mIFhNTEh0dHBSZXF1ZXN0IT0idW5kZWZpbmVkIil7aWYoIUVOVklST05NRU5UX0lTX1dPUktFUil0aHJvdyJDYW5ub3QgZG8gc3luY2hyb25vdXMgYmluYXJ5IFhIUnMgb3V0c2lkZSB3ZWJ3b3JrZXJzIGluIG1vZGVybiBicm93c2Vycy4gVXNlIC0tZW1iZWQtZmlsZSBvciAtLXByZWxvYWQtZmlsZSBpbiBlbWNjIjt2YXIgbGF6eUFycmF5PW5ldyBMYXp5VWludDhBcnJheTtPYmplY3QuZGVmaW5lUHJvcGVydGllcyhsYXp5QXJyYXkse2xlbmd0aDp7Z2V0OmZ1bmN0aW9uKCl7aWYoIXRoaXMubGVuZ3RoS25vd24pe3RoaXMuY2FjaGVMZW5ndGgoKX1yZXR1cm4gdGhpcy5fbGVuZ3RofX0sY2h1bmtTaXplOntnZXQ6ZnVuY3Rpb24oKXtpZighdGhpcy5sZW5ndGhLbm93bil7dGhpcy5jYWNoZUxlbmd0aCgpfXJldHVybiB0aGlzLl9jaHVua1NpemV9fX0pO3ZhciBwcm9wZXJ0aWVzPXtpc0RldmljZTpmYWxzZSxjb250ZW50czpsYXp5QXJyYXl9fWVsc2V7dmFyIHByb3BlcnRpZXM9e2lzRGV2aWNlOmZhbHNlLHVybDp1cmx9fXZhciBub2RlPUZTLmNyZWF0ZUZpbGUocGFyZW50LG5hbWUscHJvcGVydGllcyxjYW5SZWFkLGNhbldyaXRlKTtpZihwcm9wZXJ0aWVzLmNvbnRlbnRzKXtub2RlLmNvbnRlbnRzPXByb3BlcnRpZXMuY29udGVudHN9ZWxzZSBpZihwcm9wZXJ0aWVzLnVybCl7bm9kZS5jb250ZW50cz1udWxsO25vZGUudXJsPXByb3BlcnRpZXMudXJsfU9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKG5vZGUse3VzZWRCeXRlczp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY29udGVudHMubGVuZ3RofX19KTt2YXIgc3RyZWFtX29wcz17fTt2YXIga2V5cz1PYmplY3Qua2V5cyhub2RlLnN0cmVhbV9vcHMpO2tleXMuZm9yRWFjaChrZXk9Pnt2YXIgZm49bm9kZS5zdHJlYW1fb3BzW2tleV07c3RyZWFtX29wc1trZXldPWZ1bmN0aW9uIGZvcmNlTG9hZExhenlGaWxlKCl7RlMuZm9yY2VMb2FkRmlsZShub2RlKTtyZXR1cm4gZm4uYXBwbHkobnVsbCxhcmd1bWVudHMpfX0pO2Z1bmN0aW9uIHdyaXRlQ2h1bmtzKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbil7dmFyIGNvbnRlbnRzPXN0cmVhbS5ub2RlLmNvbnRlbnRzO2lmKHBvc2l0aW9uPj1jb250ZW50cy5sZW5ndGgpcmV0dXJuIDA7dmFyIHNpemU9TWF0aC5taW4oY29udGVudHMubGVuZ3RoLXBvc2l0aW9uLGxlbmd0aCk7aWYoY29udGVudHMuc2xpY2Upe2Zvcih2YXIgaT0wO2k8c2l6ZTtpKyspe2J1ZmZlcltvZmZzZXQraV09Y29udGVudHNbcG9zaXRpb24raV19fWVsc2V7Zm9yKHZhciBpPTA7aTxzaXplO2krKyl7YnVmZmVyW29mZnNldCtpXT1jb250ZW50cy5nZXQocG9zaXRpb24raSl9fXJldHVybiBzaXplfXN0cmVhbV9vcHMucmVhZD0oc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uKT0+e0ZTLmZvcmNlTG9hZEZpbGUobm9kZSk7cmV0dXJuIHdyaXRlQ2h1bmtzKHN0cmVhbSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbil9O3N0cmVhbV9vcHMubW1hcD0oc3RyZWFtLGxlbmd0aCxwb3NpdGlvbixwcm90LGZsYWdzKT0+e0ZTLmZvcmNlTG9hZEZpbGUobm9kZSk7dmFyIHB0cj1tbWFwQWxsb2MobGVuZ3RoKTtpZighcHRyKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0OCl9d3JpdGVDaHVua3Moc3RyZWFtLEhFQVA4LHB0cixsZW5ndGgscG9zaXRpb24pO3JldHVybntwdHI6cHRyLGFsbG9jYXRlZDp0cnVlfX07bm9kZS5zdHJlYW1fb3BzPXN0cmVhbV9vcHM7cmV0dXJuIG5vZGV9fTt2YXIgVVRGOFRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT5wdHI/VVRGOEFycmF5VG9TdHJpbmcoSEVBUFU4LHB0cixtYXhCeXRlc1RvUmVhZCk6IiI7dmFyIFNZU0NBTExTPXtERUZBVUxUX1BPTExNQVNLOjUsY2FsY3VsYXRlQXQoZGlyZmQscGF0aCxhbGxvd0VtcHR5KXtpZihQQVRILmlzQWJzKHBhdGgpKXtyZXR1cm4gcGF0aH12YXIgZGlyO2lmKGRpcmZkPT09LTEwMCl7ZGlyPUZTLmN3ZCgpfWVsc2V7dmFyIGRpcnN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZGlyZmQpO2Rpcj1kaXJzdHJlYW0ucGF0aH1pZihwYXRoLmxlbmd0aD09MCl7aWYoIWFsbG93RW1wdHkpe3Rocm93IG5ldyBGUy5FcnJub0Vycm9yKDQ0KX1yZXR1cm4gZGlyfXJldHVybiBQQVRILmpvaW4yKGRpcixwYXRoKX0sZG9TdGF0KGZ1bmMscGF0aCxidWYpe3RyeXt2YXIgc3RhdD1mdW5jKHBhdGgpfWNhdGNoKGUpe2lmKGUmJmUubm9kZSYmUEFUSC5ub3JtYWxpemUocGF0aCkhPT1QQVRILm5vcm1hbGl6ZShGUy5nZXRQYXRoKGUubm9kZSkpKXtyZXR1cm4tNTR9dGhyb3cgZX1IRUFQMzJbYnVmPj4yXT1zdGF0LmRldjtIRUFQMzJbYnVmKzQ+PjJdPXN0YXQubW9kZTtIRUFQVTMyW2J1Zis4Pj4yXT1zdGF0Lm5saW5rO0hFQVAzMltidWYrMTI+PjJdPXN0YXQudWlkO0hFQVAzMltidWYrMTY+PjJdPXN0YXQuZ2lkO0hFQVAzMltidWYrMjA+PjJdPXN0YXQucmRldjt0ZW1wSTY0PVtzdGF0LnNpemU+Pj4wLCh0ZW1wRG91YmxlPXN0YXQuc2l6ZSwrTWF0aC5hYnModGVtcERvdWJsZSk+PTE/dGVtcERvdWJsZT4wPytNYXRoLmZsb29yKHRlbXBEb3VibGUvNDI5NDk2NzI5Nik+Pj4wOn5+K01hdGguY2VpbCgodGVtcERvdWJsZS0rKH5+dGVtcERvdWJsZT4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCldLEhFQVAzMltidWYrMjQ+PjJdPXRlbXBJNjRbMF0sSEVBUDMyW2J1ZisyOD4+Ml09dGVtcEk2NFsxXTtIRUFQMzJbYnVmKzMyPj4yXT00MDk2O0hFQVAzMltidWYrMzY+PjJdPXN0YXQuYmxvY2tzO3ZhciBhdGltZT1zdGF0LmF0aW1lLmdldFRpbWUoKTt2YXIgbXRpbWU9c3RhdC5tdGltZS5nZXRUaW1lKCk7dmFyIGN0aW1lPXN0YXQuY3RpbWUuZ2V0VGltZSgpO3RlbXBJNjQ9W01hdGguZmxvb3IoYXRpbWUvMWUzKT4+PjAsKHRlbXBEb3VibGU9TWF0aC5mbG9vcihhdGltZS8xZTMpLCtNYXRoLmFicyh0ZW1wRG91YmxlKT49MT90ZW1wRG91YmxlPjA/K01hdGguZmxvb3IodGVtcERvdWJsZS80Mjk0OTY3Mjk2KT4+PjA6fn4rTWF0aC5jZWlsKCh0ZW1wRG91YmxlLSsofn50ZW1wRG91YmxlPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKV0sSEVBUDMyW2J1Zis0MD4+Ml09dGVtcEk2NFswXSxIRUFQMzJbYnVmKzQ0Pj4yXT10ZW1wSTY0WzFdO0hFQVBVMzJbYnVmKzQ4Pj4yXT1hdGltZSUxZTMqMWUzO3RlbXBJNjQ9W01hdGguZmxvb3IobXRpbWUvMWUzKT4+PjAsKHRlbXBEb3VibGU9TWF0aC5mbG9vcihtdGltZS8xZTMpLCtNYXRoLmFicyh0ZW1wRG91YmxlKT49MT90ZW1wRG91YmxlPjA/K01hdGguZmxvb3IodGVtcERvdWJsZS80Mjk0OTY3Mjk2KT4+PjA6fn4rTWF0aC5jZWlsKCh0ZW1wRG91YmxlLSsofn50ZW1wRG91YmxlPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKV0sSEVBUDMyW2J1Zis1Nj4+Ml09dGVtcEk2NFswXSxIRUFQMzJbYnVmKzYwPj4yXT10ZW1wSTY0WzFdO0hFQVBVMzJbYnVmKzY0Pj4yXT1tdGltZSUxZTMqMWUzO3RlbXBJNjQ9W01hdGguZmxvb3IoY3RpbWUvMWUzKT4+PjAsKHRlbXBEb3VibGU9TWF0aC5mbG9vcihjdGltZS8xZTMpLCtNYXRoLmFicyh0ZW1wRG91YmxlKT49MT90ZW1wRG91YmxlPjA/K01hdGguZmxvb3IodGVtcERvdWJsZS80Mjk0OTY3Mjk2KT4+PjA6fn4rTWF0aC5jZWlsKCh0ZW1wRG91YmxlLSsofn50ZW1wRG91YmxlPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKV0sSEVBUDMyW2J1Zis3Mj4+Ml09dGVtcEk2NFswXSxIRUFQMzJbYnVmKzc2Pj4yXT10ZW1wSTY0WzFdO0hFQVBVMzJbYnVmKzgwPj4yXT1jdGltZSUxZTMqMWUzO3RlbXBJNjQ9W3N0YXQuaW5vPj4+MCwodGVtcERvdWJsZT1zdGF0LmlubywrTWF0aC5hYnModGVtcERvdWJsZSk+PTE/dGVtcERvdWJsZT4wPytNYXRoLmZsb29yKHRlbXBEb3VibGUvNDI5NDk2NzI5Nik+Pj4wOn5+K01hdGguY2VpbCgodGVtcERvdWJsZS0rKH5+dGVtcERvdWJsZT4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCldLEhFQVAzMltidWYrODg+PjJdPXRlbXBJNjRbMF0sSEVBUDMyW2J1Zis5Mj4+Ml09dGVtcEk2NFsxXTtyZXR1cm4gMH0sZG9Nc3luYyhhZGRyLHN0cmVhbSxsZW4sZmxhZ3Msb2Zmc2V0KXtpZighRlMuaXNGaWxlKHN0cmVhbS5ub2RlLm1vZGUpKXt0aHJvdyBuZXcgRlMuRXJybm9FcnJvcig0Myl9aWYoZmxhZ3MmMil7cmV0dXJuIDB9dmFyIGJ1ZmZlcj1IRUFQVTguc2xpY2UoYWRkcixhZGRyK2xlbik7RlMubXN5bmMoc3RyZWFtLGJ1ZmZlcixvZmZzZXQsbGVuLGZsYWdzKX0sdmFyYXJnczp1bmRlZmluZWQsZ2V0KCl7dmFyIHJldD1IRUFQMzJbK1NZU0NBTExTLnZhcmFyZ3M+PjJdO1NZU0NBTExTLnZhcmFyZ3MrPTQ7cmV0dXJuIHJldH0sZ2V0cCgpe3JldHVybiBTWVNDQUxMUy5nZXQoKX0sZ2V0U3RyKHB0cil7dmFyIHJldD1VVEY4VG9TdHJpbmcocHRyKTtyZXR1cm4gcmV0fSxnZXRTdHJlYW1Gcm9tRkQoZmQpe3ZhciBzdHJlYW09RlMuZ2V0U3RyZWFtQ2hlY2tlZChmZCk7cmV0dXJuIHN0cmVhbX19O3ZhciB3aXRoU3RhY2tTYXZlPWY9Pnt2YXIgc3RhY2s9c3RhY2tTYXZlKCk7dmFyIHJldD1mKCk7c3RhY2tSZXN0b3JlKHN0YWNrKTtyZXR1cm4gcmV0fTt2YXIgY29udmVydEkzMlBhaXJUb0k1M0NoZWNrZWQ9KGxvLGhpKT0+aGkrMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWxvPyhsbz4+PjApK2hpKjQyOTQ5NjcyOTY6TmFOO3ZhciBwcm94eVRvTWFpblRocmVhZD1mdW5jdGlvbihpbmRleCxzeW5jKXt2YXIgbnVtQ2FsbEFyZ3M9YXJndW1lbnRzLmxlbmd0aC0yO3ZhciBvdXRlckFyZ3M9YXJndW1lbnRzO3JldHVybiB3aXRoU3RhY2tTYXZlKCgpPT57dmFyIHNlcmlhbGl6ZWROdW1DYWxsQXJncz1udW1DYWxsQXJnczt2YXIgYXJncz1zdGFja0FsbG9jKHNlcmlhbGl6ZWROdW1DYWxsQXJncyo4KTt2YXIgYj1hcmdzPj4zO2Zvcih2YXIgaT0wO2k8bnVtQ2FsbEFyZ3M7aSsrKXt2YXIgYXJnPW91dGVyQXJnc1syK2ldO0hFQVBGNjRbYitpXT1hcmd9cmV0dXJuIF9fZW1zY3JpcHRlbl9ydW5fb25fbWFpbl90aHJlYWRfanMoaW5kZXgsc2VyaWFsaXplZE51bUNhbGxBcmdzLGFyZ3Msc3luYyl9KX07ZnVuY3Rpb24gX3Byb2NfZXhpdChjb2RlKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBwcm94eVRvTWFpblRocmVhZCgwLDEsY29kZSk7RVhJVFNUQVRVUz1jb2RlO2lmKCFrZWVwUnVudGltZUFsaXZlKCkpe1BUaHJlYWQudGVybWluYXRlQWxsVGhyZWFkcygpO2lmKE1vZHVsZVsib25FeGl0Il0pTW9kdWxlWyJvbkV4aXQiXShjb2RlKTtBQk9SVD10cnVlfXF1aXRfKGNvZGUsbmV3IEV4aXRTdGF0dXMoY29kZSkpfXZhciBleGl0SlM9KHN0YXR1cyxpbXBsaWNpdCk9PntFWElUU1RBVFVTPXN0YXR1cztpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXtleGl0T25NYWluVGhyZWFkKHN0YXR1cyk7dGhyb3cidW53aW5kIn1pZigha2VlcFJ1bnRpbWVBbGl2ZSgpKXtleGl0UnVudGltZSgpfV9wcm9jX2V4aXQoc3RhdHVzKX07dmFyIF9leGl0PWV4aXRKUzt2YXIgaGFuZGxlRXhjZXB0aW9uPWU9PntpZihlIGluc3RhbmNlb2YgRXhpdFN0YXR1c3x8ZT09InVud2luZCIpe3JldHVybiBFWElUU1RBVFVTfXF1aXRfKDEsZSl9O3ZhciBQVGhyZWFkPXt1bnVzZWRXb3JrZXJzOltdLHJ1bm5pbmdXb3JrZXJzOltdLHRsc0luaXRGdW5jdGlvbnM6W10scHRocmVhZHM6e30saW5pdCgpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpe1BUaHJlYWQuaW5pdFdvcmtlcigpfWVsc2V7UFRocmVhZC5pbml0TWFpblRocmVhZCgpfX0saW5pdE1haW5UaHJlYWQoKXt2YXIgcHRocmVhZFBvb2xTaXplPTQ7d2hpbGUocHRocmVhZFBvb2xTaXplLS0pe1BUaHJlYWQuYWxsb2NhdGVVbnVzZWRXb3JrZXIoKX1hZGRPblByZVJ1bigoKT0+e2FkZFJ1bkRlcGVuZGVuY3koImxvYWRpbmctd29ya2VycyIpO1BUaHJlYWQubG9hZFdhc21Nb2R1bGVUb0FsbFdvcmtlcnMoKCk9PnJlbW92ZVJ1bkRlcGVuZGVuY3koImxvYWRpbmctd29ya2VycyIpKX0pfSxpbml0V29ya2VyKCl7bm9FeGl0UnVudGltZT1mYWxzZX0sc2V0RXhpdFN0YXR1czpzdGF0dXM9PntFWElUU1RBVFVTPXN0YXR1c30sdGVybWluYXRlQWxsVGhyZWFkc19fZGVwczpbIiR0ZXJtaW5hdGVXb3JrZXIiXSx0ZXJtaW5hdGVBbGxUaHJlYWRzOigpPT57Zm9yKHZhciB3b3JrZXIgb2YgUFRocmVhZC5ydW5uaW5nV29ya2Vycyl7dGVybWluYXRlV29ya2VyKHdvcmtlcil9Zm9yKHZhciB3b3JrZXIgb2YgUFRocmVhZC51bnVzZWRXb3JrZXJzKXt0ZXJtaW5hdGVXb3JrZXIod29ya2VyKX1QVGhyZWFkLnVudXNlZFdvcmtlcnM9W107UFRocmVhZC5ydW5uaW5nV29ya2Vycz1bXTtQVGhyZWFkLnB0aHJlYWRzPVtdfSxyZXR1cm5Xb3JrZXJUb1Bvb2w6d29ya2VyPT57dmFyIHB0aHJlYWRfcHRyPXdvcmtlci5wdGhyZWFkX3B0cjtkZWxldGUgUFRocmVhZC5wdGhyZWFkc1twdGhyZWFkX3B0cl07UFRocmVhZC51bnVzZWRXb3JrZXJzLnB1c2god29ya2VyKTtQVGhyZWFkLnJ1bm5pbmdXb3JrZXJzLnNwbGljZShQVGhyZWFkLnJ1bm5pbmdXb3JrZXJzLmluZGV4T2Yod29ya2VyKSwxKTt3b3JrZXIucHRocmVhZF9wdHI9MDtfX2Vtc2NyaXB0ZW5fdGhyZWFkX2ZyZWVfZGF0YShwdGhyZWFkX3B0cil9LHJlY2VpdmVPYmplY3RUcmFuc2ZlcihkYXRhKXt9LHRocmVhZEluaXRUTFMoKXtQVGhyZWFkLnRsc0luaXRGdW5jdGlvbnMuZm9yRWFjaChmPT5mKCkpfSxsb2FkV2FzbU1vZHVsZVRvV29ya2VyOndvcmtlcj0+bmV3IFByb21pc2Uob25GaW5pc2hlZExvYWRpbmc9Pnt3b3JrZXIub25tZXNzYWdlPWU9Pnt2YXIgZD1lWyJkYXRhIl07dmFyIGNtZD1kWyJjbWQiXTtpZihkWyJ0YXJnZXRUaHJlYWQiXSYmZFsidGFyZ2V0VGhyZWFkIl0hPV9wdGhyZWFkX3NlbGYoKSl7dmFyIHRhcmdldFdvcmtlcj1QVGhyZWFkLnB0aHJlYWRzW2RbInRhcmdldFRocmVhZCJdXTtpZih0YXJnZXRXb3JrZXIpe3RhcmdldFdvcmtlci5wb3N0TWVzc2FnZShkLGRbInRyYW5zZmVyTGlzdCJdKX1lbHNle2VycihgSW50ZXJuYWwgZXJyb3IhIFdvcmtlciBzZW50IGEgbWVzc2FnZSAiJHtjbWR9IiB0byB0YXJnZXQgcHRocmVhZCAke2RbInRhcmdldFRocmVhZCJdfSwgYnV0IHRoYXQgdGhyZWFkIG5vIGxvbmdlciBleGlzdHMhYCl9cmV0dXJufWlmKGNtZD09PSJjaGVja01haWxib3giKXtjaGVja01haWxib3goKX1lbHNlIGlmKGNtZD09PSJzcGF3blRocmVhZCIpe3NwYXduVGhyZWFkKGQpfWVsc2UgaWYoY21kPT09ImNsZWFudXBUaHJlYWQiKXtjbGVhbnVwVGhyZWFkKGRbInRocmVhZCJdKX1lbHNlIGlmKGNtZD09PSJraWxsVGhyZWFkIil7a2lsbFRocmVhZChkWyJ0aHJlYWQiXSl9ZWxzZSBpZihjbWQ9PT0iY2FuY2VsVGhyZWFkIil7Y2FuY2VsVGhyZWFkKGRbInRocmVhZCJdKX1lbHNlIGlmKGNtZD09PSJsb2FkZWQiKXt3b3JrZXIubG9hZGVkPXRydWU7b25GaW5pc2hlZExvYWRpbmcod29ya2VyKX1lbHNlIGlmKGNtZD09PSJhbGVydCIpe2FsZXJ0KGBUaHJlYWQgJHtkWyJ0aHJlYWRJZCJdfTogJHtkWyJ0ZXh0Il19YCl9ZWxzZSBpZihkLnRhcmdldD09PSJzZXRpbW1lZGlhdGUiKXt3b3JrZXIucG9zdE1lc3NhZ2UoZCl9ZWxzZSBpZihjbWQ9PT0iY2FsbEhhbmRsZXIiKXtNb2R1bGVbZFsiaGFuZGxlciJdXSguLi5kWyJhcmdzIl0pfWVsc2UgaWYoY21kKXtlcnIoYHdvcmtlciBzZW50IGFuIHVua25vd24gY29tbWFuZCAke2NtZH1gKX19O3dvcmtlci5vbmVycm9yPWU9Pnt2YXIgbWVzc2FnZT0id29ya2VyIHNlbnQgYW4gZXJyb3IhIjtlcnIoYCR7bWVzc2FnZX0gJHtlLmZpbGVuYW1lfToke2UubGluZW5vfTogJHtlLm1lc3NhZ2V9YCk7dGhyb3cgZX07dmFyIGhhbmRsZXJzPVtdO3ZhciBrbm93bkhhbmRsZXJzPVsib25FeGl0Iiwib25BYm9ydCIsInByaW50IiwicHJpbnRFcnIiXTtmb3IodmFyIGhhbmRsZXIgb2Yga25vd25IYW5kbGVycyl7aWYoTW9kdWxlLmhhc093blByb3BlcnR5KGhhbmRsZXIpKXtoYW5kbGVycy5wdXNoKGhhbmRsZXIpfX13b3JrZXIucG9zdE1lc3NhZ2UoeyJjbWQiOiJsb2FkIiwiaGFuZGxlcnMiOmhhbmRsZXJzLCJ1cmxPckJsb2IiOk1vZHVsZVsibWFpblNjcmlwdFVybE9yQmxvYiJdLCJ3YXNtTWVtb3J5Ijp3YXNtTWVtb3J5LCJ3YXNtTW9kdWxlIjp3YXNtTW9kdWxlfSl9KSxsb2FkV2FzbU1vZHVsZVRvQWxsV29ya2Vycyhvbk1heWJlUmVhZHkpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpe3JldHVybiBvbk1heWJlUmVhZHkoKX1sZXQgcHRocmVhZFBvb2xSZWFkeT1Qcm9taXNlLmFsbChQVGhyZWFkLnVudXNlZFdvcmtlcnMubWFwKFBUaHJlYWQubG9hZFdhc21Nb2R1bGVUb1dvcmtlcikpO3B0aHJlYWRQb29sUmVhZHkudGhlbihvbk1heWJlUmVhZHkpfSxhbGxvY2F0ZVVudXNlZFdvcmtlcigpe3ZhciB3b3JrZXI7aWYoIU1vZHVsZVsibG9jYXRlRmlsZSJdKXt3b3JrZXI9bmV3IFdvcmtlcihuZXcgVVJMKCJtYWluLWJpbi1tdWx0aS53b3JrZXIuanMiLGxvY2F0aW9uLmhyZWYpLHt0eXBlOiJtb2R1bGUifSl9ZWxzZXt2YXIgcHRocmVhZE1haW5Kcz1sb2NhdGVGaWxlKCJtYWluLWJpbi1tdWx0aS53b3JrZXIuanMiKTt3b3JrZXI9bmV3IFdvcmtlcihwdGhyZWFkTWFpbkpzLHt0eXBlOiJtb2R1bGUifSl9UFRocmVhZC51bnVzZWRXb3JrZXJzLnB1c2god29ya2VyKX0sZ2V0TmV3V29ya2VyKCl7aWYoUFRocmVhZC51bnVzZWRXb3JrZXJzLmxlbmd0aD09MCl7UFRocmVhZC5hbGxvY2F0ZVVudXNlZFdvcmtlcigpO1BUaHJlYWQubG9hZFdhc21Nb2R1bGVUb1dvcmtlcihQVGhyZWFkLnVudXNlZFdvcmtlcnNbMF0pfXJldHVybiBQVGhyZWFkLnVudXNlZFdvcmtlcnMucG9wKCl9fTtNb2R1bGVbIlBUaHJlYWQiXT1QVGhyZWFkO3ZhciBjYWxsUnVudGltZUNhbGxiYWNrcz1jYWxsYmFja3M9Pnt3aGlsZShjYWxsYmFja3MubGVuZ3RoPjApe2NhbGxiYWNrcy5zaGlmdCgpKE1vZHVsZSl9fTt2YXIgZXN0YWJsaXNoU3RhY2tTcGFjZT0oKT0+e3ZhciBwdGhyZWFkX3B0cj1fcHRocmVhZF9zZWxmKCk7dmFyIHN0YWNrSGlnaD1IRUFQVTMyW3B0aHJlYWRfcHRyKzUyPj4yXTt2YXIgc3RhY2tTaXplPUhFQVBVMzJbcHRocmVhZF9wdHIrNTY+PjJdO3ZhciBzdGFja0xvdz1zdGFja0hpZ2gtc3RhY2tTaXplO19lbXNjcmlwdGVuX3N0YWNrX3NldF9saW1pdHMoc3RhY2tIaWdoLHN0YWNrTG93KTtzdGFja1Jlc3RvcmUoc3RhY2tIaWdoKX07TW9kdWxlWyJlc3RhYmxpc2hTdGFja1NwYWNlIl09ZXN0YWJsaXNoU3RhY2tTcGFjZTtmdW5jdGlvbiBleGl0T25NYWluVGhyZWFkKHJldHVybkNvZGUpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIHByb3h5VG9NYWluVGhyZWFkKDEsMCxyZXR1cm5Db2RlKTtfZXhpdChyZXR1cm5Db2RlKX12YXIgd2FzbVRhYmxlTWlycm9yPVtdO3ZhciB3YXNtVGFibGU7dmFyIGdldFdhc21UYWJsZUVudHJ5PWZ1bmNQdHI9Pnt2YXIgZnVuYz13YXNtVGFibGVNaXJyb3JbZnVuY1B0cl07aWYoIWZ1bmMpe2lmKGZ1bmNQdHI+PXdhc21UYWJsZU1pcnJvci5sZW5ndGgpd2FzbVRhYmxlTWlycm9yLmxlbmd0aD1mdW5jUHRyKzE7d2FzbVRhYmxlTWlycm9yW2Z1bmNQdHJdPWZ1bmM9d2FzbVRhYmxlLmdldChmdW5jUHRyKX1yZXR1cm4gZnVuY307dmFyIGludm9rZUVudHJ5UG9pbnQ9KHB0cixhcmcpPT57cnVudGltZUtlZXBhbGl2ZUNvdW50ZXI9MDt2YXIgcmVzdWx0PWdldFdhc21UYWJsZUVudHJ5KHB0cikoYXJnKTtmdW5jdGlvbiBmaW5pc2gocmVzdWx0KXtpZihrZWVwUnVudGltZUFsaXZlKCkpe1BUaHJlYWQuc2V0RXhpdFN0YXR1cyhyZXN1bHQpfWVsc2V7X19lbXNjcmlwdGVuX3RocmVhZF9leGl0KHJlc3VsdCl9fWZpbmlzaChyZXN1bHQpfTtNb2R1bGVbImludm9rZUVudHJ5UG9pbnQiXT1pbnZva2VFbnRyeVBvaW50O3ZhciBub0V4aXRSdW50aW1lPU1vZHVsZVsibm9FeGl0UnVudGltZSJdfHxmYWxzZTt2YXIgcmVnaXN0ZXJUTFNJbml0PXRsc0luaXRGdW5jPT57UFRocmVhZC50bHNJbml0RnVuY3Rpb25zLnB1c2godGxzSW5pdEZ1bmMpfTt2YXIgX19fYXNzZXJ0X2ZhaWw9KGNvbmRpdGlvbixmaWxlbmFtZSxsaW5lLGZ1bmMpPT57YWJvcnQoYEFzc2VydGlvbiBmYWlsZWQ6ICR7VVRGOFRvU3RyaW5nKGNvbmRpdGlvbil9LCBhdDogYCtbZmlsZW5hbWU/VVRGOFRvU3RyaW5nKGZpbGVuYW1lKToidW5rbm93biBmaWxlbmFtZSIsbGluZSxmdW5jP1VURjhUb1N0cmluZyhmdW5jKToidW5rbm93biBmdW5jdGlvbiJdKX07dmFyIGV4Y2VwdGlvbkNhdWdodD1bXTt2YXIgdW5jYXVnaHRFeGNlcHRpb25Db3VudD0wO3ZhciBfX19jeGFfYmVnaW5fY2F0Y2g9cHRyPT57dmFyIGluZm89bmV3IEV4Y2VwdGlvbkluZm8ocHRyKTtpZighaW5mby5nZXRfY2F1Z2h0KCkpe2luZm8uc2V0X2NhdWdodCh0cnVlKTt1bmNhdWdodEV4Y2VwdGlvbkNvdW50LS19aW5mby5zZXRfcmV0aHJvd24oZmFsc2UpO2V4Y2VwdGlvbkNhdWdodC5wdXNoKGluZm8pO19fX2N4YV9pbmNyZW1lbnRfZXhjZXB0aW9uX3JlZmNvdW50KGluZm8uZXhjUHRyKTtyZXR1cm4gaW5mby5nZXRfZXhjZXB0aW9uX3B0cigpfTt2YXIgZXhjZXB0aW9uTGFzdD0wO3ZhciBfX19jeGFfZW5kX2NhdGNoPSgpPT57X3NldFRocmV3KDAsMCk7dmFyIGluZm89ZXhjZXB0aW9uQ2F1Z2h0LnBvcCgpO19fX2N4YV9kZWNyZW1lbnRfZXhjZXB0aW9uX3JlZmNvdW50KGluZm8uZXhjUHRyKTtleGNlcHRpb25MYXN0PTB9O2Z1bmN0aW9uIEV4Y2VwdGlvbkluZm8oZXhjUHRyKXt0aGlzLmV4Y1B0cj1leGNQdHI7dGhpcy5wdHI9ZXhjUHRyLTI0O3RoaXMuc2V0X3R5cGU9ZnVuY3Rpb24odHlwZSl7SEVBUFUzMlt0aGlzLnB0cis0Pj4yXT10eXBlfTt0aGlzLmdldF90eXBlPWZ1bmN0aW9uKCl7cmV0dXJuIEhFQVBVMzJbdGhpcy5wdHIrND4+Ml19O3RoaXMuc2V0X2Rlc3RydWN0b3I9ZnVuY3Rpb24oZGVzdHJ1Y3Rvcil7SEVBUFUzMlt0aGlzLnB0cis4Pj4yXT1kZXN0cnVjdG9yfTt0aGlzLmdldF9kZXN0cnVjdG9yPWZ1bmN0aW9uKCl7cmV0dXJuIEhFQVBVMzJbdGhpcy5wdHIrOD4+Ml19O3RoaXMuc2V0X2NhdWdodD1mdW5jdGlvbihjYXVnaHQpe2NhdWdodD1jYXVnaHQ/MTowO0hFQVA4W3RoaXMucHRyKzEyPj4wXT1jYXVnaHR9O3RoaXMuZ2V0X2NhdWdodD1mdW5jdGlvbigpe3JldHVybiBIRUFQOFt0aGlzLnB0cisxMj4+MF0hPTB9O3RoaXMuc2V0X3JldGhyb3duPWZ1bmN0aW9uKHJldGhyb3duKXtyZXRocm93bj1yZXRocm93bj8xOjA7SEVBUDhbdGhpcy5wdHIrMTM+PjBdPXJldGhyb3dufTt0aGlzLmdldF9yZXRocm93bj1mdW5jdGlvbigpe3JldHVybiBIRUFQOFt0aGlzLnB0cisxMz4+MF0hPTB9O3RoaXMuaW5pdD1mdW5jdGlvbih0eXBlLGRlc3RydWN0b3Ipe3RoaXMuc2V0X2FkanVzdGVkX3B0cigwKTt0aGlzLnNldF90eXBlKHR5cGUpO3RoaXMuc2V0X2Rlc3RydWN0b3IoZGVzdHJ1Y3Rvcil9O3RoaXMuc2V0X2FkanVzdGVkX3B0cj1mdW5jdGlvbihhZGp1c3RlZFB0cil7SEVBUFUzMlt0aGlzLnB0cisxNj4+Ml09YWRqdXN0ZWRQdHJ9O3RoaXMuZ2V0X2FkanVzdGVkX3B0cj1mdW5jdGlvbigpe3JldHVybiBIRUFQVTMyW3RoaXMucHRyKzE2Pj4yXX07dGhpcy5nZXRfZXhjZXB0aW9uX3B0cj1mdW5jdGlvbigpe3ZhciBpc1BvaW50ZXI9X19fY3hhX2lzX3BvaW50ZXJfdHlwZSh0aGlzLmdldF90eXBlKCkpO2lmKGlzUG9pbnRlcil7cmV0dXJuIEhFQVBVMzJbdGhpcy5leGNQdHI+PjJdfXZhciBhZGp1c3RlZD10aGlzLmdldF9hZGp1c3RlZF9wdHIoKTtpZihhZGp1c3RlZCE9PTApcmV0dXJuIGFkanVzdGVkO3JldHVybiB0aGlzLmV4Y1B0cn19dmFyIF9fX3Jlc3VtZUV4Y2VwdGlvbj1wdHI9PntpZighZXhjZXB0aW9uTGFzdCl7ZXhjZXB0aW9uTGFzdD1wdHJ9dGhyb3cgZXhjZXB0aW9uTGFzdH07dmFyIGZpbmRNYXRjaGluZ0NhdGNoPWFyZ3M9Pnt2YXIgdGhyb3duPWV4Y2VwdGlvbkxhc3Q7aWYoIXRocm93bil7c2V0VGVtcFJldDAoMCk7cmV0dXJuIDB9dmFyIGluZm89bmV3IEV4Y2VwdGlvbkluZm8odGhyb3duKTtpbmZvLnNldF9hZGp1c3RlZF9wdHIodGhyb3duKTt2YXIgdGhyb3duVHlwZT1pbmZvLmdldF90eXBlKCk7aWYoIXRocm93blR5cGUpe3NldFRlbXBSZXQwKDApO3JldHVybiB0aHJvd259Zm9yKHZhciBhcmcgaW4gYXJncyl7dmFyIGNhdWdodFR5cGU9YXJnc1thcmddO2lmKGNhdWdodFR5cGU9PT0wfHxjYXVnaHRUeXBlPT09dGhyb3duVHlwZSl7YnJlYWt9dmFyIGFkanVzdGVkX3B0cl9hZGRyPWluZm8ucHRyKzE2O2lmKF9fX2N4YV9jYW5fY2F0Y2goY2F1Z2h0VHlwZSx0aHJvd25UeXBlLGFkanVzdGVkX3B0cl9hZGRyKSl7c2V0VGVtcFJldDAoY2F1Z2h0VHlwZSk7cmV0dXJuIHRocm93bn19c2V0VGVtcFJldDAodGhyb3duVHlwZSk7cmV0dXJuIHRocm93bn07dmFyIF9fX2N4YV9maW5kX21hdGNoaW5nX2NhdGNoXzI9KCk9PmZpbmRNYXRjaGluZ0NhdGNoKFtdKTt2YXIgX19fY3hhX2ZpbmRfbWF0Y2hpbmdfY2F0Y2hfMz1hcmcwPT5maW5kTWF0Y2hpbmdDYXRjaChbYXJnMF0pO3ZhciBfX19jeGFfcmV0aHJvdz0oKT0+e3ZhciBpbmZvPWV4Y2VwdGlvbkNhdWdodC5wb3AoKTtpZighaW5mbyl7YWJvcnQoIm5vIGV4Y2VwdGlvbiB0byB0aHJvdyIpfXZhciBwdHI9aW5mby5leGNQdHI7aWYoIWluZm8uZ2V0X3JldGhyb3duKCkpe2V4Y2VwdGlvbkNhdWdodC5wdXNoKGluZm8pO2luZm8uc2V0X3JldGhyb3duKHRydWUpO2luZm8uc2V0X2NhdWdodChmYWxzZSk7dW5jYXVnaHRFeGNlcHRpb25Db3VudCsrfWV4Y2VwdGlvbkxhc3Q9cHRyO3Rocm93IGV4Y2VwdGlvbkxhc3R9O3ZhciBfX19jeGFfdGhyb3c9KHB0cix0eXBlLGRlc3RydWN0b3IpPT57dmFyIGluZm89bmV3IEV4Y2VwdGlvbkluZm8ocHRyKTtpbmZvLmluaXQodHlwZSxkZXN0cnVjdG9yKTtleGNlcHRpb25MYXN0PXB0cjt1bmNhdWdodEV4Y2VwdGlvbkNvdW50Kys7dGhyb3cgZXhjZXB0aW9uTGFzdH07dmFyIF9fX2Vtc2NyaXB0ZW5faW5pdF9tYWluX3RocmVhZF9qcz10Yj0+e19fZW1zY3JpcHRlbl90aHJlYWRfaW5pdCh0YiwhRU5WSVJPTk1FTlRfSVNfV09SS0VSLDEsIUVOVklST05NRU5UX0lTX1dFQiw2NTUzNixmYWxzZSk7UFRocmVhZC50aHJlYWRJbml0VExTKCl9O3ZhciBfX19lbXNjcmlwdGVuX3RocmVhZF9jbGVhbnVwPXRocmVhZD0+e2lmKCFFTlZJUk9OTUVOVF9JU19QVEhSRUFEKWNsZWFudXBUaHJlYWQodGhyZWFkKTtlbHNlIHBvc3RNZXNzYWdlKHsiY21kIjoiY2xlYW51cFRocmVhZCIsInRocmVhZCI6dGhyZWFkfSl9O2Z1bmN0aW9uIHB0aHJlYWRDcmVhdGVQcm94aWVkKHB0aHJlYWRfcHRyLGF0dHIsc3RhcnRSb3V0aW5lLGFyZyl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gcHJveHlUb01haW5UaHJlYWQoMiwxLHB0aHJlYWRfcHRyLGF0dHIsc3RhcnRSb3V0aW5lLGFyZyk7cmV0dXJuIF9fX3B0aHJlYWRfY3JlYXRlX2pzKHB0aHJlYWRfcHRyLGF0dHIsc3RhcnRSb3V0aW5lLGFyZyl9dmFyIF9fX3B0aHJlYWRfY3JlYXRlX2pzPShwdGhyZWFkX3B0cixhdHRyLHN0YXJ0Um91dGluZSxhcmcpPT57aWYodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyPT0idW5kZWZpbmVkIil7ZXJyKCJDdXJyZW50IGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgU2hhcmVkQXJyYXlCdWZmZXIsIHB0aHJlYWRzIGFyZSBub3QgYXZhaWxhYmxlISIpO3JldHVybiA2fXZhciB0cmFuc2Zlckxpc3Q9W107dmFyIGVycm9yPTA7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCYmKHRyYW5zZmVyTGlzdC5sZW5ndGg9PT0wfHxlcnJvcikpe3JldHVybiBwdGhyZWFkQ3JlYXRlUHJveGllZChwdGhyZWFkX3B0cixhdHRyLHN0YXJ0Um91dGluZSxhcmcpfWlmKGVycm9yKXJldHVybiBlcnJvcjt2YXIgdGhyZWFkUGFyYW1zPXtzdGFydFJvdXRpbmU6c3RhcnRSb3V0aW5lLHB0aHJlYWRfcHRyOnB0aHJlYWRfcHRyLGFyZzphcmcsdHJhbnNmZXJMaXN0OnRyYW5zZmVyTGlzdH07aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRCl7dGhyZWFkUGFyYW1zLmNtZD0ic3Bhd25UaHJlYWQiO3Bvc3RNZXNzYWdlKHRocmVhZFBhcmFtcyx0cmFuc2Zlckxpc3QpO3JldHVybiAwfXJldHVybiBzcGF3blRocmVhZCh0aHJlYWRQYXJhbXMpfTt2YXIgc2V0RXJyTm89dmFsdWU9PntIRUFQMzJbX19fZXJybm9fbG9jYXRpb24oKT4+Ml09dmFsdWU7cmV0dXJuIHZhbHVlfTtmdW5jdGlvbiBfX19zeXNjYWxsX2ZjbnRsNjQoZmQsY21kLHZhcmFyZ3Mpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIHByb3h5VG9NYWluVGhyZWFkKDMsMSxmZCxjbWQsdmFyYXJncyk7U1lTQ0FMTFMudmFyYXJncz12YXJhcmdzO3RyeXt2YXIgc3RyZWFtPVNZU0NBTExTLmdldFN0cmVhbUZyb21GRChmZCk7c3dpdGNoKGNtZCl7Y2FzZSAwOnt2YXIgYXJnPVNZU0NBTExTLmdldCgpO2lmKGFyZzwwKXtyZXR1cm4tMjh9d2hpbGUoRlMuc3RyZWFtc1thcmddKXthcmcrK312YXIgbmV3U3RyZWFtO25ld1N0cmVhbT1GUy5jcmVhdGVTdHJlYW0oc3RyZWFtLGFyZyk7cmV0dXJuIG5ld1N0cmVhbS5mZH1jYXNlIDE6Y2FzZSAyOnJldHVybiAwO2Nhc2UgMzpyZXR1cm4gc3RyZWFtLmZsYWdzO2Nhc2UgNDp7dmFyIGFyZz1TWVNDQUxMUy5nZXQoKTtzdHJlYW0uZmxhZ3N8PWFyZztyZXR1cm4gMH1jYXNlIDU6e3ZhciBhcmc9U1lTQ0FMTFMuZ2V0cCgpO3ZhciBvZmZzZXQ9MDtIRUFQMTZbYXJnK29mZnNldD4+MV09MjtyZXR1cm4gMH1jYXNlIDY6Y2FzZSA3OnJldHVybiAwO2Nhc2UgMTY6Y2FzZSA4OnJldHVybi0yODtjYXNlIDk6c2V0RXJyTm8oMjgpO3JldHVybi0xO2RlZmF1bHQ6e3JldHVybi0yOH19fWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZS5uYW1lPT09IkVycm5vRXJyb3IiKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX2ZzdGF0NjQoZmQsYnVmKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBwcm94eVRvTWFpblRocmVhZCg0LDEsZmQsYnVmKTt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3JldHVybiBTWVNDQUxMUy5kb1N0YXQoRlMuc3RhdCxzdHJlYW0ucGF0aCxidWYpfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZS5uYW1lPT09IkVycm5vRXJyb3IiKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX2Z0cnVuY2F0ZTY0KGZkLGxlbmd0aF9sb3csbGVuZ3RoX2hpZ2gpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIHByb3h5VG9NYWluVGhyZWFkKDUsMSxmZCxsZW5ndGhfbG93LGxlbmd0aF9oaWdoKTt2YXIgbGVuZ3RoPWNvbnZlcnRJMzJQYWlyVG9JNTNDaGVja2VkKGxlbmd0aF9sb3csbGVuZ3RoX2hpZ2gpO3RyeXtpZihpc05hTihsZW5ndGgpKXJldHVybiA2MTtGUy5mdHJ1bmNhdGUoZmQsbGVuZ3RoKTtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUubmFtZT09PSJFcnJub0Vycm9yIikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9pb2N0bChmZCxvcCx2YXJhcmdzKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBwcm94eVRvTWFpblRocmVhZCg2LDEsZmQsb3AsdmFyYXJncyk7U1lTQ0FMTFMudmFyYXJncz12YXJhcmdzO3RyeXt2YXIgc3RyZWFtPVNZU0NBTExTLmdldFN0cmVhbUZyb21GRChmZCk7c3dpdGNoKG9wKXtjYXNlIDIxNTA5OntpZighc3RyZWFtLnR0eSlyZXR1cm4tNTk7cmV0dXJuIDB9Y2FzZSAyMTUwNTp7aWYoIXN0cmVhbS50dHkpcmV0dXJuLTU5O2lmKHN0cmVhbS50dHkub3BzLmlvY3RsX3RjZ2V0cyl7dmFyIHRlcm1pb3M9c3RyZWFtLnR0eS5vcHMuaW9jdGxfdGNnZXRzKHN0cmVhbSk7dmFyIGFyZ3A9U1lTQ0FMTFMuZ2V0cCgpO0hFQVAzMlthcmdwPj4yXT10ZXJtaW9zLmNfaWZsYWd8fDA7SEVBUDMyW2FyZ3ArND4+Ml09dGVybWlvcy5jX29mbGFnfHwwO0hFQVAzMlthcmdwKzg+PjJdPXRlcm1pb3MuY19jZmxhZ3x8MDtIRUFQMzJbYXJncCsxMj4+Ml09dGVybWlvcy5jX2xmbGFnfHwwO2Zvcih2YXIgaT0wO2k8MzI7aSsrKXtIRUFQOFthcmdwK2krMTc+PjBdPXRlcm1pb3MuY19jY1tpXXx8MH1yZXR1cm4gMH1yZXR1cm4gMH1jYXNlIDIxNTEwOmNhc2UgMjE1MTE6Y2FzZSAyMTUxMjp7aWYoIXN0cmVhbS50dHkpcmV0dXJuLTU5O3JldHVybiAwfWNhc2UgMjE1MDY6Y2FzZSAyMTUwNzpjYXNlIDIxNTA4OntpZighc3RyZWFtLnR0eSlyZXR1cm4tNTk7aWYoc3RyZWFtLnR0eS5vcHMuaW9jdGxfdGNzZXRzKXt2YXIgYXJncD1TWVNDQUxMUy5nZXRwKCk7dmFyIGNfaWZsYWc9SEVBUDMyW2FyZ3A+PjJdO3ZhciBjX29mbGFnPUhFQVAzMlthcmdwKzQ+PjJdO3ZhciBjX2NmbGFnPUhFQVAzMlthcmdwKzg+PjJdO3ZhciBjX2xmbGFnPUhFQVAzMlthcmdwKzEyPj4yXTt2YXIgY19jYz1bXTtmb3IodmFyIGk9MDtpPDMyO2krKyl7Y19jYy5wdXNoKEhFQVA4W2FyZ3AraSsxNz4+MF0pfXJldHVybiBzdHJlYW0udHR5Lm9wcy5pb2N0bF90Y3NldHMoc3RyZWFtLnR0eSxvcCx7Y19pZmxhZzpjX2lmbGFnLGNfb2ZsYWc6Y19vZmxhZyxjX2NmbGFnOmNfY2ZsYWcsY19sZmxhZzpjX2xmbGFnLGNfY2M6Y19jY30pfXJldHVybiAwfWNhc2UgMjE1MTk6e2lmKCFzdHJlYW0udHR5KXJldHVybi01OTt2YXIgYXJncD1TWVNDQUxMUy5nZXRwKCk7SEVBUDMyW2FyZ3A+PjJdPTA7cmV0dXJuIDB9Y2FzZSAyMTUyMDp7aWYoIXN0cmVhbS50dHkpcmV0dXJuLTU5O3JldHVybi0yOH1jYXNlIDIxNTMxOnt2YXIgYXJncD1TWVNDQUxMUy5nZXRwKCk7cmV0dXJuIEZTLmlvY3RsKHN0cmVhbSxvcCxhcmdwKX1jYXNlIDIxNTIzOntpZighc3RyZWFtLnR0eSlyZXR1cm4tNTk7aWYoc3RyZWFtLnR0eS5vcHMuaW9jdGxfdGlvY2d3aW5zeil7dmFyIHdpbnNpemU9c3RyZWFtLnR0eS5vcHMuaW9jdGxfdGlvY2d3aW5zeihzdHJlYW0udHR5KTt2YXIgYXJncD1TWVNDQUxMUy5nZXRwKCk7SEVBUDE2W2FyZ3A+PjFdPXdpbnNpemVbMF07SEVBUDE2W2FyZ3ArMj4+MV09d2luc2l6ZVsxXX1yZXR1cm4gMH1jYXNlIDIxNTI0OntpZighc3RyZWFtLnR0eSlyZXR1cm4tNTk7cmV0dXJuIDB9Y2FzZSAyMTUxNTp7aWYoIXN0cmVhbS50dHkpcmV0dXJuLTU5O3JldHVybiAwfWRlZmF1bHQ6cmV0dXJuLTI4fX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUubmFtZT09PSJFcnJub0Vycm9yIikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9sc3RhdDY0KHBhdGgsYnVmKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBwcm94eVRvTWFpblRocmVhZCg3LDEscGF0aCxidWYpO3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtyZXR1cm4gU1lTQ0FMTFMuZG9TdGF0KEZTLmxzdGF0LHBhdGgsYnVmKX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUubmFtZT09PSJFcnJub0Vycm9yIikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF9uZXdmc3RhdGF0KGRpcmZkLHBhdGgsYnVmLGZsYWdzKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBwcm94eVRvTWFpblRocmVhZCg4LDEsZGlyZmQscGF0aCxidWYsZmxhZ3MpO3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTt2YXIgbm9mb2xsb3c9ZmxhZ3MmMjU2O3ZhciBhbGxvd0VtcHR5PWZsYWdzJjQwOTY7ZmxhZ3M9ZmxhZ3MmfjY0MDA7cGF0aD1TWVNDQUxMUy5jYWxjdWxhdGVBdChkaXJmZCxwYXRoLGFsbG93RW1wdHkpO3JldHVybiBTWVNDQUxMUy5kb1N0YXQobm9mb2xsb3c/RlMubHN0YXQ6RlMuc3RhdCxwYXRoLGJ1Zil9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlLm5hbWU9PT0iRXJybm9FcnJvciIpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfb3BlbmF0KGRpcmZkLHBhdGgsZmxhZ3MsdmFyYXJncyl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gcHJveHlUb01haW5UaHJlYWQoOSwxLGRpcmZkLHBhdGgsZmxhZ3MsdmFyYXJncyk7U1lTQ0FMTFMudmFyYXJncz12YXJhcmdzO3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KGRpcmZkLHBhdGgpO3ZhciBtb2RlPXZhcmFyZ3M/U1lTQ0FMTFMuZ2V0KCk6MDtyZXR1cm4gRlMub3BlbihwYXRoLGZsYWdzLG1vZGUpLmZkfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZS5uYW1lPT09IkVycm5vRXJyb3IiKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX12YXIgc3RyaW5nVG9VVEY4PShzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSk9PnN0cmluZ1RvVVRGOEFycmF5KHN0cixIRUFQVTgsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSk7ZnVuY3Rpb24gX19fc3lzY2FsbF9yZWFkbGlua2F0KGRpcmZkLHBhdGgsYnVmLGJ1ZnNpemUpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIHByb3h5VG9NYWluVGhyZWFkKDEwLDEsZGlyZmQscGF0aCxidWYsYnVmc2l6ZSk7dHJ5e3BhdGg9U1lTQ0FMTFMuZ2V0U3RyKHBhdGgpO3BhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQoZGlyZmQscGF0aCk7aWYoYnVmc2l6ZTw9MClyZXR1cm4tMjg7dmFyIHJldD1GUy5yZWFkbGluayhwYXRoKTt2YXIgbGVuPU1hdGgubWluKGJ1ZnNpemUsbGVuZ3RoQnl0ZXNVVEY4KHJldCkpO3ZhciBlbmRDaGFyPUhFQVA4W2J1ZitsZW5dO3N0cmluZ1RvVVRGOChyZXQsYnVmLGJ1ZnNpemUrMSk7SEVBUDhbYnVmK2xlbl09ZW5kQ2hhcjtyZXR1cm4gbGVufWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZS5uYW1lPT09IkVycm5vRXJyb3IiKSl0aHJvdyBlO3JldHVybi1lLmVycm5vfX1mdW5jdGlvbiBfX19zeXNjYWxsX3JlbmFtZWF0KG9sZGRpcmZkLG9sZHBhdGgsbmV3ZGlyZmQsbmV3cGF0aCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gcHJveHlUb01haW5UaHJlYWQoMTEsMSxvbGRkaXJmZCxvbGRwYXRoLG5ld2RpcmZkLG5ld3BhdGgpO3RyeXtvbGRwYXRoPVNZU0NBTExTLmdldFN0cihvbGRwYXRoKTtuZXdwYXRoPVNZU0NBTExTLmdldFN0cihuZXdwYXRoKTtvbGRwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KG9sZGRpcmZkLG9sZHBhdGgpO25ld3BhdGg9U1lTQ0FMTFMuY2FsY3VsYXRlQXQobmV3ZGlyZmQsbmV3cGF0aCk7RlMucmVuYW1lKG9sZHBhdGgsbmV3cGF0aCk7cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlLm5hbWU9PT0iRXJybm9FcnJvciIpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fWZ1bmN0aW9uIF9fX3N5c2NhbGxfc3RhdDY0KHBhdGgsYnVmKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBwcm94eVRvTWFpblRocmVhZCgxMiwxLHBhdGgsYnVmKTt0cnl7cGF0aD1TWVNDQUxMUy5nZXRTdHIocGF0aCk7cmV0dXJuIFNZU0NBTExTLmRvU3RhdChGUy5zdGF0LHBhdGgsYnVmKX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUubmFtZT09PSJFcnJub0Vycm9yIikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19fc3lzY2FsbF91bmxpbmthdChkaXJmZCxwYXRoLGZsYWdzKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBwcm94eVRvTWFpblRocmVhZCgxMywxLGRpcmZkLHBhdGgsZmxhZ3MpO3RyeXtwYXRoPVNZU0NBTExTLmdldFN0cihwYXRoKTtwYXRoPVNZU0NBTExTLmNhbGN1bGF0ZUF0KGRpcmZkLHBhdGgpO2lmKGZsYWdzPT09MCl7RlMudW5saW5rKHBhdGgpfWVsc2UgaWYoZmxhZ3M9PT01MTIpe0ZTLnJtZGlyKHBhdGgpfWVsc2V7YWJvcnQoIkludmFsaWQgZmxhZ3MgcGFzc2VkIHRvIHVubGlua2F0Iil9cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlLm5hbWU9PT0iRXJybm9FcnJvciIpKXRocm93IGU7cmV0dXJuLWUuZXJybm99fXZhciBfX2VtYmluZF9yZWdpc3Rlcl9iaWdpbnQ9KHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKT0+e307dmFyIGVtYmluZF9pbml0X2NoYXJDb2Rlcz0oKT0+e3ZhciBjb2Rlcz1uZXcgQXJyYXkoMjU2KTtmb3IodmFyIGk9MDtpPDI1NjsrK2kpe2NvZGVzW2ldPVN0cmluZy5mcm9tQ2hhckNvZGUoaSl9ZW1iaW5kX2NoYXJDb2Rlcz1jb2Rlc307dmFyIGVtYmluZF9jaGFyQ29kZXM7dmFyIHJlYWRMYXRpbjFTdHJpbmc9cHRyPT57dmFyIHJldD0iIjt2YXIgYz1wdHI7d2hpbGUoSEVBUFU4W2NdKXtyZXQrPWVtYmluZF9jaGFyQ29kZXNbSEVBUFU4W2MrK11dfXJldHVybiByZXR9O3ZhciBhd2FpdGluZ0RlcGVuZGVuY2llcz17fTt2YXIgcmVnaXN0ZXJlZFR5cGVzPXt9O3ZhciB0eXBlRGVwZW5kZW5jaWVzPXt9O3ZhciBCaW5kaW5nRXJyb3I7dmFyIHRocm93QmluZGluZ0Vycm9yPW1lc3NhZ2U9Pnt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKG1lc3NhZ2UpfTt2YXIgSW50ZXJuYWxFcnJvcjt2YXIgdGhyb3dJbnRlcm5hbEVycm9yPW1lc3NhZ2U9Pnt0aHJvdyBuZXcgSW50ZXJuYWxFcnJvcihtZXNzYWdlKX07dmFyIHdoZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkPShteVR5cGVzLGRlcGVuZGVudFR5cGVzLGdldFR5cGVDb252ZXJ0ZXJzKT0+e215VHlwZXMuZm9yRWFjaChmdW5jdGlvbih0eXBlKXt0eXBlRGVwZW5kZW5jaWVzW3R5cGVdPWRlcGVuZGVudFR5cGVzfSk7ZnVuY3Rpb24gb25Db21wbGV0ZSh0eXBlQ29udmVydGVycyl7dmFyIG15VHlwZUNvbnZlcnRlcnM9Z2V0VHlwZUNvbnZlcnRlcnModHlwZUNvbnZlcnRlcnMpO2lmKG15VHlwZUNvbnZlcnRlcnMubGVuZ3RoIT09bXlUeXBlcy5sZW5ndGgpe3Rocm93SW50ZXJuYWxFcnJvcigiTWlzbWF0Y2hlZCB0eXBlIGNvbnZlcnRlciBjb3VudCIpfWZvcih2YXIgaT0wO2k8bXlUeXBlcy5sZW5ndGg7KytpKXtyZWdpc3RlclR5cGUobXlUeXBlc1tpXSxteVR5cGVDb252ZXJ0ZXJzW2ldKX19dmFyIHR5cGVDb252ZXJ0ZXJzPW5ldyBBcnJheShkZXBlbmRlbnRUeXBlcy5sZW5ndGgpO3ZhciB1bnJlZ2lzdGVyZWRUeXBlcz1bXTt2YXIgcmVnaXN0ZXJlZD0wO2RlcGVuZGVudFR5cGVzLmZvckVhY2goKGR0LGkpPT57aWYocmVnaXN0ZXJlZFR5cGVzLmhhc093blByb3BlcnR5KGR0KSl7dHlwZUNvbnZlcnRlcnNbaV09cmVnaXN0ZXJlZFR5cGVzW2R0XX1lbHNle3VucmVnaXN0ZXJlZFR5cGVzLnB1c2goZHQpO2lmKCFhd2FpdGluZ0RlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShkdCkpe2F3YWl0aW5nRGVwZW5kZW5jaWVzW2R0XT1bXX1hd2FpdGluZ0RlcGVuZGVuY2llc1tkdF0ucHVzaCgoKT0+e3R5cGVDb252ZXJ0ZXJzW2ldPXJlZ2lzdGVyZWRUeXBlc1tkdF07KytyZWdpc3RlcmVkO2lmKHJlZ2lzdGVyZWQ9PT11bnJlZ2lzdGVyZWRUeXBlcy5sZW5ndGgpe29uQ29tcGxldGUodHlwZUNvbnZlcnRlcnMpfX0pfX0pO2lmKDA9PT11bnJlZ2lzdGVyZWRUeXBlcy5sZW5ndGgpe29uQ29tcGxldGUodHlwZUNvbnZlcnRlcnMpfX07ZnVuY3Rpb24gc2hhcmVkUmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnM9e30pe3ZhciBuYW1lPXJlZ2lzdGVyZWRJbnN0YW5jZS5uYW1lO2lmKCFyYXdUeXBlKXt0aHJvd0JpbmRpbmdFcnJvcihgdHlwZSAiJHtuYW1lfSIgbXVzdCBoYXZlIGEgcG9zaXRpdmUgaW50ZWdlciB0eXBlaWQgcG9pbnRlcmApfWlmKHJlZ2lzdGVyZWRUeXBlcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7aWYob3B0aW9ucy5pZ25vcmVEdXBsaWNhdGVSZWdpc3RyYXRpb25zKXtyZXR1cm59ZWxzZXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHJlZ2lzdGVyIHR5cGUgJyR7bmFtZX0nIHR3aWNlYCl9fXJlZ2lzdGVyZWRUeXBlc1tyYXdUeXBlXT1yZWdpc3RlcmVkSW5zdGFuY2U7ZGVsZXRlIHR5cGVEZXBlbmRlbmNpZXNbcmF3VHlwZV07aWYoYXdhaXRpbmdEZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkocmF3VHlwZSkpe3ZhciBjYWxsYmFja3M9YXdhaXRpbmdEZXBlbmRlbmNpZXNbcmF3VHlwZV07ZGVsZXRlIGF3YWl0aW5nRGVwZW5kZW5jaWVzW3Jhd1R5cGVdO2NhbGxiYWNrcy5mb3JFYWNoKGNiPT5jYigpKX19ZnVuY3Rpb24gcmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnM9e30pe2lmKCEoImFyZ1BhY2tBZHZhbmNlImluIHJlZ2lzdGVyZWRJbnN0YW5jZSkpe3Rocm93IG5ldyBUeXBlRXJyb3IoInJlZ2lzdGVyVHlwZSByZWdpc3RlcmVkSW5zdGFuY2UgcmVxdWlyZXMgYXJnUGFja0FkdmFuY2UiKX1yZXR1cm4gc2hhcmVkUmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnMpfXZhciBHZW5lcmljV2lyZVR5cGVTaXplPTg7dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2w9KHJhd1R5cGUsbmFtZSx0cnVlVmFsdWUsZmFsc2VWYWx1ZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbih3dCl7cmV0dXJuISF3dH0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLG8pe3JldHVybiBvP3RydWVWYWx1ZTpmYWxzZVZhbHVlfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUFU4W3BvaW50ZXJdKX0sZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KX07dmFyIHNoYWxsb3dDb3B5SW50ZXJuYWxQb2ludGVyPW89Pih7Y291bnQ6by5jb3VudCxkZWxldGVTY2hlZHVsZWQ6by5kZWxldGVTY2hlZHVsZWQscHJlc2VydmVQb2ludGVyT25EZWxldGU6by5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSxwdHI6by5wdHIscHRyVHlwZTpvLnB0clR5cGUsc21hcnRQdHI6by5zbWFydFB0cixzbWFydFB0clR5cGU6by5zbWFydFB0clR5cGV9KTt2YXIgdGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkPW9iaj0+e2Z1bmN0aW9uIGdldEluc3RhbmNlVHlwZU5hbWUoaGFuZGxlKXtyZXR1cm4gaGFuZGxlLiQkLnB0clR5cGUucmVnaXN0ZXJlZENsYXNzLm5hbWV9dGhyb3dCaW5kaW5nRXJyb3IoZ2V0SW5zdGFuY2VUeXBlTmFtZShvYmopKyIgaW5zdGFuY2UgYWxyZWFkeSBkZWxldGVkIil9O3ZhciBmaW5hbGl6YXRpb25SZWdpc3RyeT1mYWxzZTt2YXIgZGV0YWNoRmluYWxpemVyPWhhbmRsZT0+e307dmFyIHJ1bkRlc3RydWN0b3I9JCQ9PntpZigkJC5zbWFydFB0cil7JCQuc21hcnRQdHJUeXBlLnJhd0Rlc3RydWN0b3IoJCQuc21hcnRQdHIpfWVsc2V7JCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3MucmF3RGVzdHJ1Y3RvcigkJC5wdHIpfX07dmFyIHJlbGVhc2VDbGFzc0hhbmRsZT0kJD0+eyQkLmNvdW50LnZhbHVlLT0xO3ZhciB0b0RlbGV0ZT0wPT09JCQuY291bnQudmFsdWU7aWYodG9EZWxldGUpe3J1bkRlc3RydWN0b3IoJCQpfX07dmFyIGRvd25jYXN0UG9pbnRlcj0ocHRyLHB0ckNsYXNzLGRlc2lyZWRDbGFzcyk9PntpZihwdHJDbGFzcz09PWRlc2lyZWRDbGFzcyl7cmV0dXJuIHB0cn1pZih1bmRlZmluZWQ9PT1kZXNpcmVkQ2xhc3MuYmFzZUNsYXNzKXtyZXR1cm4gbnVsbH12YXIgcnY9ZG93bmNhc3RQb2ludGVyKHB0cixwdHJDbGFzcyxkZXNpcmVkQ2xhc3MuYmFzZUNsYXNzKTtpZihydj09PW51bGwpe3JldHVybiBudWxsfXJldHVybiBkZXNpcmVkQ2xhc3MuZG93bmNhc3QocnYpfTt2YXIgcmVnaXN0ZXJlZFBvaW50ZXJzPXt9O3ZhciBnZXRJbmhlcml0ZWRJbnN0YW5jZUNvdW50PSgpPT5PYmplY3Qua2V5cyhyZWdpc3RlcmVkSW5zdGFuY2VzKS5sZW5ndGg7dmFyIGdldExpdmVJbmhlcml0ZWRJbnN0YW5jZXM9KCk9Pnt2YXIgcnY9W107Zm9yKHZhciBrIGluIHJlZ2lzdGVyZWRJbnN0YW5jZXMpe2lmKHJlZ2lzdGVyZWRJbnN0YW5jZXMuaGFzT3duUHJvcGVydHkoaykpe3J2LnB1c2gocmVnaXN0ZXJlZEluc3RhbmNlc1trXSl9fXJldHVybiBydn07dmFyIGRlbGV0aW9uUXVldWU9W107dmFyIGZsdXNoUGVuZGluZ0RlbGV0ZXM9KCk9Pnt3aGlsZShkZWxldGlvblF1ZXVlLmxlbmd0aCl7dmFyIG9iaj1kZWxldGlvblF1ZXVlLnBvcCgpO29iai4kJC5kZWxldGVTY2hlZHVsZWQ9ZmFsc2U7b2JqWyJkZWxldGUiXSgpfX07dmFyIGRlbGF5RnVuY3Rpb247dmFyIHNldERlbGF5RnVuY3Rpb249Zm49PntkZWxheUZ1bmN0aW9uPWZuO2lmKGRlbGV0aW9uUXVldWUubGVuZ3RoJiZkZWxheUZ1bmN0aW9uKXtkZWxheUZ1bmN0aW9uKGZsdXNoUGVuZGluZ0RlbGV0ZXMpfX07dmFyIGluaXRfZW1iaW5kPSgpPT57TW9kdWxlWyJnZXRJbmhlcml0ZWRJbnN0YW5jZUNvdW50Il09Z2V0SW5oZXJpdGVkSW5zdGFuY2VDb3VudDtNb2R1bGVbImdldExpdmVJbmhlcml0ZWRJbnN0YW5jZXMiXT1nZXRMaXZlSW5oZXJpdGVkSW5zdGFuY2VzO01vZHVsZVsiZmx1c2hQZW5kaW5nRGVsZXRlcyJdPWZsdXNoUGVuZGluZ0RlbGV0ZXM7TW9kdWxlWyJzZXREZWxheUZ1bmN0aW9uIl09c2V0RGVsYXlGdW5jdGlvbn07dmFyIHJlZ2lzdGVyZWRJbnN0YW5jZXM9e307dmFyIGdldEJhc2VzdFBvaW50ZXI9KGNsYXNzXyxwdHIpPT57aWYocHRyPT09dW5kZWZpbmVkKXt0aHJvd0JpbmRpbmdFcnJvcigicHRyIHNob3VsZCBub3QgYmUgdW5kZWZpbmVkIil9d2hpbGUoY2xhc3NfLmJhc2VDbGFzcyl7cHRyPWNsYXNzXy51cGNhc3QocHRyKTtjbGFzc189Y2xhc3NfLmJhc2VDbGFzc31yZXR1cm4gcHRyfTt2YXIgZ2V0SW5oZXJpdGVkSW5zdGFuY2U9KGNsYXNzXyxwdHIpPT57cHRyPWdldEJhc2VzdFBvaW50ZXIoY2xhc3NfLHB0cik7cmV0dXJuIHJlZ2lzdGVyZWRJbnN0YW5jZXNbcHRyXX07dmFyIG1ha2VDbGFzc0hhbmRsZT0ocHJvdG90eXBlLHJlY29yZCk9PntpZighcmVjb3JkLnB0clR5cGV8fCFyZWNvcmQucHRyKXt0aHJvd0ludGVybmFsRXJyb3IoIm1ha2VDbGFzc0hhbmRsZSByZXF1aXJlcyBwdHIgYW5kIHB0clR5cGUiKX12YXIgaGFzU21hcnRQdHJUeXBlPSEhcmVjb3JkLnNtYXJ0UHRyVHlwZTt2YXIgaGFzU21hcnRQdHI9ISFyZWNvcmQuc21hcnRQdHI7aWYoaGFzU21hcnRQdHJUeXBlIT09aGFzU21hcnRQdHIpe3Rocm93SW50ZXJuYWxFcnJvcigiQm90aCBzbWFydFB0clR5cGUgYW5kIHNtYXJ0UHRyIG11c3QgYmUgc3BlY2lmaWVkIil9cmVjb3JkLmNvdW50PXt2YWx1ZToxfTtyZXR1cm4gYXR0YWNoRmluYWxpemVyKE9iamVjdC5jcmVhdGUocHJvdG90eXBlLHskJDp7dmFsdWU6cmVjb3JkfX0pKX07ZnVuY3Rpb24gUmVnaXN0ZXJlZFBvaW50ZXJfZnJvbVdpcmVUeXBlKHB0cil7dmFyIHJhd1BvaW50ZXI9dGhpcy5nZXRQb2ludGVlKHB0cik7aWYoIXJhd1BvaW50ZXIpe3RoaXMuZGVzdHJ1Y3RvcihwdHIpO3JldHVybiBudWxsfXZhciByZWdpc3RlcmVkSW5zdGFuY2U9Z2V0SW5oZXJpdGVkSW5zdGFuY2UodGhpcy5yZWdpc3RlcmVkQ2xhc3MscmF3UG9pbnRlcik7aWYodW5kZWZpbmVkIT09cmVnaXN0ZXJlZEluc3RhbmNlKXtpZigwPT09cmVnaXN0ZXJlZEluc3RhbmNlLiQkLmNvdW50LnZhbHVlKXtyZWdpc3RlcmVkSW5zdGFuY2UuJCQucHRyPXJhd1BvaW50ZXI7cmVnaXN0ZXJlZEluc3RhbmNlLiQkLnNtYXJ0UHRyPXB0cjtyZXR1cm4gcmVnaXN0ZXJlZEluc3RhbmNlWyJjbG9uZSJdKCl9ZWxzZXt2YXIgcnY9cmVnaXN0ZXJlZEluc3RhbmNlWyJjbG9uZSJdKCk7dGhpcy5kZXN0cnVjdG9yKHB0cik7cmV0dXJuIHJ2fX1mdW5jdGlvbiBtYWtlRGVmYXVsdEhhbmRsZSgpe2lmKHRoaXMuaXNTbWFydFBvaW50ZXIpe3JldHVybiBtYWtlQ2xhc3NIYW5kbGUodGhpcy5yZWdpc3RlcmVkQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGUse3B0clR5cGU6dGhpcy5wb2ludGVlVHlwZSxwdHI6cmF3UG9pbnRlcixzbWFydFB0clR5cGU6dGhpcyxzbWFydFB0cjpwdHJ9KX1lbHNle3JldHVybiBtYWtlQ2xhc3NIYW5kbGUodGhpcy5yZWdpc3RlcmVkQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGUse3B0clR5cGU6dGhpcyxwdHI6cHRyfSl9fXZhciBhY3R1YWxUeXBlPXRoaXMucmVnaXN0ZXJlZENsYXNzLmdldEFjdHVhbFR5cGUocmF3UG9pbnRlcik7dmFyIHJlZ2lzdGVyZWRQb2ludGVyUmVjb3JkPXJlZ2lzdGVyZWRQb2ludGVyc1thY3R1YWxUeXBlXTtpZighcmVnaXN0ZXJlZFBvaW50ZXJSZWNvcmQpe3JldHVybiBtYWtlRGVmYXVsdEhhbmRsZS5jYWxsKHRoaXMpfXZhciB0b1R5cGU7aWYodGhpcy5pc0NvbnN0KXt0b1R5cGU9cmVnaXN0ZXJlZFBvaW50ZXJSZWNvcmQuY29uc3RQb2ludGVyVHlwZX1lbHNle3RvVHlwZT1yZWdpc3RlcmVkUG9pbnRlclJlY29yZC5wb2ludGVyVHlwZX12YXIgZHA9ZG93bmNhc3RQb2ludGVyKHJhd1BvaW50ZXIsdGhpcy5yZWdpc3RlcmVkQ2xhc3MsdG9UeXBlLnJlZ2lzdGVyZWRDbGFzcyk7aWYoZHA9PT1udWxsKXtyZXR1cm4gbWFrZURlZmF1bHRIYW5kbGUuY2FsbCh0aGlzKX1pZih0aGlzLmlzU21hcnRQb2ludGVyKXtyZXR1cm4gbWFrZUNsYXNzSGFuZGxlKHRvVHlwZS5yZWdpc3RlcmVkQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGUse3B0clR5cGU6dG9UeXBlLHB0cjpkcCxzbWFydFB0clR5cGU6dGhpcyxzbWFydFB0cjpwdHJ9KX1lbHNle3JldHVybiBtYWtlQ2xhc3NIYW5kbGUodG9UeXBlLnJlZ2lzdGVyZWRDbGFzcy5pbnN0YW5jZVByb3RvdHlwZSx7cHRyVHlwZTp0b1R5cGUscHRyOmRwfSl9fXZhciBhdHRhY2hGaW5hbGl6ZXI9aGFuZGxlPT57aWYoInVuZGVmaW5lZCI9PT10eXBlb2YgRmluYWxpemF0aW9uUmVnaXN0cnkpe2F0dGFjaEZpbmFsaXplcj1oYW5kbGU9PmhhbmRsZTtyZXR1cm4gaGFuZGxlfWZpbmFsaXphdGlvblJlZ2lzdHJ5PW5ldyBGaW5hbGl6YXRpb25SZWdpc3RyeShpbmZvPT57cmVsZWFzZUNsYXNzSGFuZGxlKGluZm8uJCQpfSk7YXR0YWNoRmluYWxpemVyPWhhbmRsZT0+e3ZhciAkJD1oYW5kbGUuJCQ7dmFyIGhhc1NtYXJ0UHRyPSEhJCQuc21hcnRQdHI7aWYoaGFzU21hcnRQdHIpe3ZhciBpbmZvPXskJDokJH07ZmluYWxpemF0aW9uUmVnaXN0cnkucmVnaXN0ZXIoaGFuZGxlLGluZm8saGFuZGxlKX1yZXR1cm4gaGFuZGxlfTtkZXRhY2hGaW5hbGl6ZXI9aGFuZGxlPT5maW5hbGl6YXRpb25SZWdpc3RyeS51bnJlZ2lzdGVyKGhhbmRsZSk7cmV0dXJuIGF0dGFjaEZpbmFsaXplcihoYW5kbGUpfTt2YXIgaW5pdF9DbGFzc0hhbmRsZT0oKT0+e09iamVjdC5hc3NpZ24oQ2xhc3NIYW5kbGUucHJvdG90eXBlLHsiaXNBbGlhc09mIihvdGhlcil7aWYoISh0aGlzIGluc3RhbmNlb2YgQ2xhc3NIYW5kbGUpKXtyZXR1cm4gZmFsc2V9aWYoIShvdGhlciBpbnN0YW5jZW9mIENsYXNzSGFuZGxlKSl7cmV0dXJuIGZhbHNlfXZhciBsZWZ0Q2xhc3M9dGhpcy4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgbGVmdD10aGlzLiQkLnB0cjtvdGhlci4kJD1vdGhlci4kJDt2YXIgcmlnaHRDbGFzcz1vdGhlci4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgcmlnaHQ9b3RoZXIuJCQucHRyO3doaWxlKGxlZnRDbGFzcy5iYXNlQ2xhc3Mpe2xlZnQ9bGVmdENsYXNzLnVwY2FzdChsZWZ0KTtsZWZ0Q2xhc3M9bGVmdENsYXNzLmJhc2VDbGFzc313aGlsZShyaWdodENsYXNzLmJhc2VDbGFzcyl7cmlnaHQ9cmlnaHRDbGFzcy51cGNhc3QocmlnaHQpO3JpZ2h0Q2xhc3M9cmlnaHRDbGFzcy5iYXNlQ2xhc3N9cmV0dXJuIGxlZnRDbGFzcz09PXJpZ2h0Q2xhc3MmJmxlZnQ9PT1yaWdodH0sImNsb25lIigpe2lmKCF0aGlzLiQkLnB0cil7dGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkKHRoaXMpfWlmKHRoaXMuJCQucHJlc2VydmVQb2ludGVyT25EZWxldGUpe3RoaXMuJCQuY291bnQudmFsdWUrPTE7cmV0dXJuIHRoaXN9ZWxzZXt2YXIgY2xvbmU9YXR0YWNoRmluYWxpemVyKE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLHskJDp7dmFsdWU6c2hhbGxvd0NvcHlJbnRlcm5hbFBvaW50ZXIodGhpcy4kJCl9fSkpO2Nsb25lLiQkLmNvdW50LnZhbHVlKz0xO2Nsb25lLiQkLmRlbGV0ZVNjaGVkdWxlZD1mYWxzZTtyZXR1cm4gY2xvbmV9fSwiZGVsZXRlIigpe2lmKCF0aGlzLiQkLnB0cil7dGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkKHRoaXMpfWlmKHRoaXMuJCQuZGVsZXRlU2NoZWR1bGVkJiYhdGhpcy4kJC5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSl7dGhyb3dCaW5kaW5nRXJyb3IoIk9iamVjdCBhbHJlYWR5IHNjaGVkdWxlZCBmb3IgZGVsZXRpb24iKX1kZXRhY2hGaW5hbGl6ZXIodGhpcyk7cmVsZWFzZUNsYXNzSGFuZGxlKHRoaXMuJCQpO2lmKCF0aGlzLiQkLnByZXNlcnZlUG9pbnRlck9uRGVsZXRlKXt0aGlzLiQkLnNtYXJ0UHRyPXVuZGVmaW5lZDt0aGlzLiQkLnB0cj11bmRlZmluZWR9fSwiaXNEZWxldGVkIigpe3JldHVybiF0aGlzLiQkLnB0cn0sImRlbGV0ZUxhdGVyIigpe2lmKCF0aGlzLiQkLnB0cil7dGhyb3dJbnN0YW5jZUFscmVhZHlEZWxldGVkKHRoaXMpfWlmKHRoaXMuJCQuZGVsZXRlU2NoZWR1bGVkJiYhdGhpcy4kJC5wcmVzZXJ2ZVBvaW50ZXJPbkRlbGV0ZSl7dGhyb3dCaW5kaW5nRXJyb3IoIk9iamVjdCBhbHJlYWR5IHNjaGVkdWxlZCBmb3IgZGVsZXRpb24iKX1kZWxldGlvblF1ZXVlLnB1c2godGhpcyk7aWYoZGVsZXRpb25RdWV1ZS5sZW5ndGg9PT0xJiZkZWxheUZ1bmN0aW9uKXtkZWxheUZ1bmN0aW9uKGZsdXNoUGVuZGluZ0RlbGV0ZXMpfXRoaXMuJCQuZGVsZXRlU2NoZWR1bGVkPXRydWU7cmV0dXJuIHRoaXN9fSl9O2Z1bmN0aW9uIENsYXNzSGFuZGxlKCl7fXZhciBjcmVhdGVOYW1lZEZ1bmN0aW9uPShuYW1lLGJvZHkpPT5PYmplY3QuZGVmaW5lUHJvcGVydHkoYm9keSwibmFtZSIse3ZhbHVlOm5hbWV9KTt2YXIgZW5zdXJlT3ZlcmxvYWRUYWJsZT0ocHJvdG8sbWV0aG9kTmFtZSxodW1hbk5hbWUpPT57aWYodW5kZWZpbmVkPT09cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZSl7dmFyIHByZXZGdW5jPXByb3RvW21ldGhvZE5hbWVdO3Byb3RvW21ldGhvZE5hbWVdPWZ1bmN0aW9uKCl7aWYoIXByb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGUuaGFzT3duUHJvcGVydHkoYXJndW1lbnRzLmxlbmd0aCkpe3Rocm93QmluZGluZ0Vycm9yKGBGdW5jdGlvbiAnJHtodW1hbk5hbWV9JyBjYWxsZWQgd2l0aCBhbiBpbnZhbGlkIG51bWJlciBvZiBhcmd1bWVudHMgKCR7YXJndW1lbnRzLmxlbmd0aH0pIC0gZXhwZWN0cyBvbmUgb2YgKCR7cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZX0pIWApfXJldHVybiBwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlW2FyZ3VtZW50cy5sZW5ndGhdLmFwcGx5KHRoaXMsYXJndW1lbnRzKX07cHJvdG9bbWV0aG9kTmFtZV0ub3ZlcmxvYWRUYWJsZT1bXTtwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlW3ByZXZGdW5jLmFyZ0NvdW50XT1wcmV2RnVuY319O3ZhciBleHBvc2VQdWJsaWNTeW1ib2w9KG5hbWUsdmFsdWUsbnVtQXJndW1lbnRzKT0+e2lmKE1vZHVsZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSl7aWYodW5kZWZpbmVkPT09bnVtQXJndW1lbnRzfHx1bmRlZmluZWQhPT1Nb2R1bGVbbmFtZV0ub3ZlcmxvYWRUYWJsZSYmdW5kZWZpbmVkIT09TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGVbbnVtQXJndW1lbnRzXSl7dGhyb3dCaW5kaW5nRXJyb3IoYENhbm5vdCByZWdpc3RlciBwdWJsaWMgbmFtZSAnJHtuYW1lfScgdHdpY2VgKX1lbnN1cmVPdmVybG9hZFRhYmxlKE1vZHVsZSxuYW1lLG5hbWUpO2lmKE1vZHVsZS5oYXNPd25Qcm9wZXJ0eShudW1Bcmd1bWVudHMpKXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHJlZ2lzdGVyIG11bHRpcGxlIG92ZXJsb2FkcyBvZiBhIGZ1bmN0aW9uIHdpdGggdGhlIHNhbWUgbnVtYmVyIG9mIGFyZ3VtZW50cyAoJHtudW1Bcmd1bWVudHN9KSFgKX1Nb2R1bGVbbmFtZV0ub3ZlcmxvYWRUYWJsZVtudW1Bcmd1bWVudHNdPXZhbHVlfWVsc2V7TW9kdWxlW25hbWVdPXZhbHVlO2lmKHVuZGVmaW5lZCE9PW51bUFyZ3VtZW50cyl7TW9kdWxlW25hbWVdLm51bUFyZ3VtZW50cz1udW1Bcmd1bWVudHN9fX07dmFyIGNoYXJfMD00ODt2YXIgY2hhcl85PTU3O3ZhciBtYWtlTGVnYWxGdW5jdGlvbk5hbWU9bmFtZT0+e2lmKHVuZGVmaW5lZD09PW5hbWUpe3JldHVybiJfdW5rbm93biJ9bmFtZT1uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05X10vZywiJCIpO3ZhciBmPW5hbWUuY2hhckNvZGVBdCgwKTtpZihmPj1jaGFyXzAmJmY8PWNoYXJfOSl7cmV0dXJuYF8ke25hbWV9YH1yZXR1cm4gbmFtZX07ZnVuY3Rpb24gUmVnaXN0ZXJlZENsYXNzKG5hbWUsY29uc3RydWN0b3IsaW5zdGFuY2VQcm90b3R5cGUscmF3RGVzdHJ1Y3RvcixiYXNlQ2xhc3MsZ2V0QWN0dWFsVHlwZSx1cGNhc3QsZG93bmNhc3Qpe3RoaXMubmFtZT1uYW1lO3RoaXMuY29uc3RydWN0b3I9Y29uc3RydWN0b3I7dGhpcy5pbnN0YW5jZVByb3RvdHlwZT1pbnN0YW5jZVByb3RvdHlwZTt0aGlzLnJhd0Rlc3RydWN0b3I9cmF3RGVzdHJ1Y3Rvcjt0aGlzLmJhc2VDbGFzcz1iYXNlQ2xhc3M7dGhpcy5nZXRBY3R1YWxUeXBlPWdldEFjdHVhbFR5cGU7dGhpcy51cGNhc3Q9dXBjYXN0O3RoaXMuZG93bmNhc3Q9ZG93bmNhc3Q7dGhpcy5wdXJlVmlydHVhbEZ1bmN0aW9ucz1bXX12YXIgdXBjYXN0UG9pbnRlcj0ocHRyLHB0ckNsYXNzLGRlc2lyZWRDbGFzcyk9Pnt3aGlsZShwdHJDbGFzcyE9PWRlc2lyZWRDbGFzcyl7aWYoIXB0ckNsYXNzLnVwY2FzdCl7dGhyb3dCaW5kaW5nRXJyb3IoYEV4cGVjdGVkIG51bGwgb3IgaW5zdGFuY2Ugb2YgJHtkZXNpcmVkQ2xhc3MubmFtZX0sIGdvdCBhbiBpbnN0YW5jZSBvZiAke3B0ckNsYXNzLm5hbWV9YCl9cHRyPXB0ckNsYXNzLnVwY2FzdChwdHIpO3B0ckNsYXNzPXB0ckNsYXNzLmJhc2VDbGFzc31yZXR1cm4gcHRyfTtmdW5jdGlvbiBjb25zdE5vU21hcnRQdHJSYXdQb2ludGVyVG9XaXJlVHlwZShkZXN0cnVjdG9ycyxoYW5kbGUpe2lmKGhhbmRsZT09PW51bGwpe2lmKHRoaXMuaXNSZWZlcmVuY2Upe3Rocm93QmluZGluZ0Vycm9yKGBudWxsIGlzIG5vdCBhIHZhbGlkICR7dGhpcy5uYW1lfWApfXJldHVybiAwfWlmKCFoYW5kbGUuJCQpe3Rocm93QmluZGluZ0Vycm9yKGBDYW5ub3QgcGFzcyAiJHtlbWJpbmRSZXByKGhhbmRsZSl9IiBhcyBhICR7dGhpcy5uYW1lfWApfWlmKCFoYW5kbGUuJCQucHRyKXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHBhc3MgZGVsZXRlZCBvYmplY3QgYXMgYSBwb2ludGVyIG9mIHR5cGUgJHt0aGlzLm5hbWV9YCl9dmFyIGhhbmRsZUNsYXNzPWhhbmRsZS4kJC5wdHJUeXBlLnJlZ2lzdGVyZWRDbGFzczt2YXIgcHRyPXVwY2FzdFBvaW50ZXIoaGFuZGxlLiQkLnB0cixoYW5kbGVDbGFzcyx0aGlzLnJlZ2lzdGVyZWRDbGFzcyk7cmV0dXJuIHB0cn1mdW5jdGlvbiBnZW5lcmljUG9pbnRlclRvV2lyZVR5cGUoZGVzdHJ1Y3RvcnMsaGFuZGxlKXt2YXIgcHRyO2lmKGhhbmRsZT09PW51bGwpe2lmKHRoaXMuaXNSZWZlcmVuY2Upe3Rocm93QmluZGluZ0Vycm9yKGBudWxsIGlzIG5vdCBhIHZhbGlkICR7dGhpcy5uYW1lfWApfWlmKHRoaXMuaXNTbWFydFBvaW50ZXIpe3B0cj10aGlzLnJhd0NvbnN0cnVjdG9yKCk7aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKHRoaXMucmF3RGVzdHJ1Y3RvcixwdHIpfXJldHVybiBwdHJ9ZWxzZXtyZXR1cm4gMH19aWYoIWhhbmRsZS4kJCl7dGhyb3dCaW5kaW5nRXJyb3IoYENhbm5vdCBwYXNzICIke2VtYmluZFJlcHIoaGFuZGxlKX0iIGFzIGEgJHt0aGlzLm5hbWV9YCl9aWYoIWhhbmRsZS4kJC5wdHIpe3Rocm93QmluZGluZ0Vycm9yKGBDYW5ub3QgcGFzcyBkZWxldGVkIG9iamVjdCBhcyBhIHBvaW50ZXIgb2YgdHlwZSAke3RoaXMubmFtZX1gKX1pZighdGhpcy5pc0NvbnN0JiZoYW5kbGUuJCQucHRyVHlwZS5pc0NvbnN0KXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IGNvbnZlcnQgYXJndW1lbnQgb2YgdHlwZSAke2hhbmRsZS4kJC5zbWFydFB0clR5cGU/aGFuZGxlLiQkLnNtYXJ0UHRyVHlwZS5uYW1lOmhhbmRsZS4kJC5wdHJUeXBlLm5hbWV9IHRvIHBhcmFtZXRlciB0eXBlICR7dGhpcy5uYW1lfWApfXZhciBoYW5kbGVDbGFzcz1oYW5kbGUuJCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3M7cHRyPXVwY2FzdFBvaW50ZXIoaGFuZGxlLiQkLnB0cixoYW5kbGVDbGFzcyx0aGlzLnJlZ2lzdGVyZWRDbGFzcyk7aWYodGhpcy5pc1NtYXJ0UG9pbnRlcil7aWYodW5kZWZpbmVkPT09aGFuZGxlLiQkLnNtYXJ0UHRyKXt0aHJvd0JpbmRpbmdFcnJvcigiUGFzc2luZyByYXcgcG9pbnRlciB0byBzbWFydCBwb2ludGVyIGlzIGlsbGVnYWwiKX1zd2l0Y2godGhpcy5zaGFyaW5nUG9saWN5KXtjYXNlIDA6aWYoaGFuZGxlLiQkLnNtYXJ0UHRyVHlwZT09PXRoaXMpe3B0cj1oYW5kbGUuJCQuc21hcnRQdHJ9ZWxzZXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IGNvbnZlcnQgYXJndW1lbnQgb2YgdHlwZSAke2hhbmRsZS4kJC5zbWFydFB0clR5cGU/aGFuZGxlLiQkLnNtYXJ0UHRyVHlwZS5uYW1lOmhhbmRsZS4kJC5wdHJUeXBlLm5hbWV9IHRvIHBhcmFtZXRlciB0eXBlICR7dGhpcy5uYW1lfWApfWJyZWFrO2Nhc2UgMTpwdHI9aGFuZGxlLiQkLnNtYXJ0UHRyO2JyZWFrO2Nhc2UgMjppZihoYW5kbGUuJCQuc21hcnRQdHJUeXBlPT09dGhpcyl7cHRyPWhhbmRsZS4kJC5zbWFydFB0cn1lbHNle3ZhciBjbG9uZWRIYW5kbGU9aGFuZGxlWyJjbG9uZSJdKCk7cHRyPXRoaXMucmF3U2hhcmUocHRyLEVtdmFsLnRvSGFuZGxlKCgpPT5jbG9uZWRIYW5kbGVbImRlbGV0ZSJdKCkpKTtpZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2godGhpcy5yYXdEZXN0cnVjdG9yLHB0cil9fWJyZWFrO2RlZmF1bHQ6dGhyb3dCaW5kaW5nRXJyb3IoIlVuc3VwcG9ydGluZyBzaGFyaW5nIHBvbGljeSIpfX1yZXR1cm4gcHRyfWZ1bmN0aW9uIG5vbkNvbnN0Tm9TbWFydFB0clJhd1BvaW50ZXJUb1dpcmVUeXBlKGRlc3RydWN0b3JzLGhhbmRsZSl7aWYoaGFuZGxlPT09bnVsbCl7aWYodGhpcy5pc1JlZmVyZW5jZSl7dGhyb3dCaW5kaW5nRXJyb3IoYG51bGwgaXMgbm90IGEgdmFsaWQgJHt0aGlzLm5hbWV9YCl9cmV0dXJuIDB9aWYoIWhhbmRsZS4kJCl7dGhyb3dCaW5kaW5nRXJyb3IoYENhbm5vdCBwYXNzICIke2VtYmluZFJlcHIoaGFuZGxlKX0iIGFzIGEgJHt0aGlzLm5hbWV9YCl9aWYoIWhhbmRsZS4kJC5wdHIpe3Rocm93QmluZGluZ0Vycm9yKGBDYW5ub3QgcGFzcyBkZWxldGVkIG9iamVjdCBhcyBhIHBvaW50ZXIgb2YgdHlwZSAke3RoaXMubmFtZX1gKX1pZihoYW5kbGUuJCQucHRyVHlwZS5pc0NvbnN0KXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IGNvbnZlcnQgYXJndW1lbnQgb2YgdHlwZSAke2hhbmRsZS4kJC5wdHJUeXBlLm5hbWV9IHRvIHBhcmFtZXRlciB0eXBlICR7dGhpcy5uYW1lfWApfXZhciBoYW5kbGVDbGFzcz1oYW5kbGUuJCQucHRyVHlwZS5yZWdpc3RlcmVkQ2xhc3M7dmFyIHB0cj11cGNhc3RQb2ludGVyKGhhbmRsZS4kJC5wdHIsaGFuZGxlQ2xhc3MsdGhpcy5yZWdpc3RlcmVkQ2xhc3MpO3JldHVybiBwdHJ9ZnVuY3Rpb24gcmVhZFBvaW50ZXIocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBVMzJbcG9pbnRlcj4+Ml0pfXZhciBpbml0X1JlZ2lzdGVyZWRQb2ludGVyPSgpPT57T2JqZWN0LmFzc2lnbihSZWdpc3RlcmVkUG9pbnRlci5wcm90b3R5cGUse2dldFBvaW50ZWUocHRyKXtpZih0aGlzLnJhd0dldFBvaW50ZWUpe3B0cj10aGlzLnJhd0dldFBvaW50ZWUocHRyKX1yZXR1cm4gcHRyfSxkZXN0cnVjdG9yKHB0cil7aWYodGhpcy5yYXdEZXN0cnVjdG9yKXt0aGlzLnJhd0Rlc3RydWN0b3IocHRyKX19LCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnJlYWRQb2ludGVyLCJkZWxldGVPYmplY3QiKGhhbmRsZSl7aWYoaGFuZGxlIT09bnVsbCl7aGFuZGxlWyJkZWxldGUiXSgpfX0sImZyb21XaXJlVHlwZSI6UmVnaXN0ZXJlZFBvaW50ZXJfZnJvbVdpcmVUeXBlfSl9O2Z1bmN0aW9uIFJlZ2lzdGVyZWRQb2ludGVyKG5hbWUscmVnaXN0ZXJlZENsYXNzLGlzUmVmZXJlbmNlLGlzQ29uc3QsaXNTbWFydFBvaW50ZXIscG9pbnRlZVR5cGUsc2hhcmluZ1BvbGljeSxyYXdHZXRQb2ludGVlLHJhd0NvbnN0cnVjdG9yLHJhd1NoYXJlLHJhd0Rlc3RydWN0b3Ipe3RoaXMubmFtZT1uYW1lO3RoaXMucmVnaXN0ZXJlZENsYXNzPXJlZ2lzdGVyZWRDbGFzczt0aGlzLmlzUmVmZXJlbmNlPWlzUmVmZXJlbmNlO3RoaXMuaXNDb25zdD1pc0NvbnN0O3RoaXMuaXNTbWFydFBvaW50ZXI9aXNTbWFydFBvaW50ZXI7dGhpcy5wb2ludGVlVHlwZT1wb2ludGVlVHlwZTt0aGlzLnNoYXJpbmdQb2xpY3k9c2hhcmluZ1BvbGljeTt0aGlzLnJhd0dldFBvaW50ZWU9cmF3R2V0UG9pbnRlZTt0aGlzLnJhd0NvbnN0cnVjdG9yPXJhd0NvbnN0cnVjdG9yO3RoaXMucmF3U2hhcmU9cmF3U2hhcmU7dGhpcy5yYXdEZXN0cnVjdG9yPXJhd0Rlc3RydWN0b3I7aWYoIWlzU21hcnRQb2ludGVyJiZyZWdpc3RlcmVkQ2xhc3MuYmFzZUNsYXNzPT09dW5kZWZpbmVkKXtpZihpc0NvbnN0KXt0aGlzWyJ0b1dpcmVUeXBlIl09Y29uc3ROb1NtYXJ0UHRyUmF3UG9pbnRlclRvV2lyZVR5cGU7dGhpcy5kZXN0cnVjdG9yRnVuY3Rpb249bnVsbH1lbHNle3RoaXNbInRvV2lyZVR5cGUiXT1ub25Db25zdE5vU21hcnRQdHJSYXdQb2ludGVyVG9XaXJlVHlwZTt0aGlzLmRlc3RydWN0b3JGdW5jdGlvbj1udWxsfX1lbHNle3RoaXNbInRvV2lyZVR5cGUiXT1nZW5lcmljUG9pbnRlclRvV2lyZVR5cGV9fXZhciByZXBsYWNlUHVibGljU3ltYm9sPShuYW1lLHZhbHVlLG51bUFyZ3VtZW50cyk9PntpZighTW9kdWxlLmhhc093blByb3BlcnR5KG5hbWUpKXt0aHJvd0ludGVybmFsRXJyb3IoIlJlcGxhY2luZyBub25leGlzdGFudCBwdWJsaWMgc3ltYm9sIil9aWYodW5kZWZpbmVkIT09TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGUmJnVuZGVmaW5lZCE9PW51bUFyZ3VtZW50cyl7TW9kdWxlW25hbWVdLm92ZXJsb2FkVGFibGVbbnVtQXJndW1lbnRzXT12YWx1ZX1lbHNle01vZHVsZVtuYW1lXT12YWx1ZTtNb2R1bGVbbmFtZV0uYXJnQ291bnQ9bnVtQXJndW1lbnRzfX07dmFyIGR5bkNhbGxMZWdhY3k9KHNpZyxwdHIsYXJncyk9Pnt2YXIgZj1Nb2R1bGVbImR5bkNhbGxfIitzaWddO3JldHVybiBhcmdzJiZhcmdzLmxlbmd0aD9mLmFwcGx5KG51bGwsW3B0cl0uY29uY2F0KGFyZ3MpKTpmLmNhbGwobnVsbCxwdHIpfTt2YXIgZHluQ2FsbD0oc2lnLHB0cixhcmdzKT0+e2lmKHNpZy5pbmNsdWRlcygiaiIpKXtyZXR1cm4gZHluQ2FsbExlZ2FjeShzaWcscHRyLGFyZ3MpfXZhciBydG49Z2V0V2FzbVRhYmxlRW50cnkocHRyKS5hcHBseShudWxsLGFyZ3MpO3JldHVybiBydG59O3ZhciBnZXREeW5DYWxsZXI9KHNpZyxwdHIpPT57dmFyIGFyZ0NhY2hlPVtdO3JldHVybiBmdW5jdGlvbigpe2FyZ0NhY2hlLmxlbmd0aD0wO09iamVjdC5hc3NpZ24oYXJnQ2FjaGUsYXJndW1lbnRzKTtyZXR1cm4gZHluQ2FsbChzaWcscHRyLGFyZ0NhY2hlKX19O3ZhciBlbWJpbmRfX3JlcXVpcmVGdW5jdGlvbj0oc2lnbmF0dXJlLHJhd0Z1bmN0aW9uKT0+e3NpZ25hdHVyZT1yZWFkTGF0aW4xU3RyaW5nKHNpZ25hdHVyZSk7ZnVuY3Rpb24gbWFrZUR5bkNhbGxlcigpe2lmKHNpZ25hdHVyZS5pbmNsdWRlcygiaiIpKXtyZXR1cm4gZ2V0RHluQ2FsbGVyKHNpZ25hdHVyZSxyYXdGdW5jdGlvbil9cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KHJhd0Z1bmN0aW9uKX12YXIgZnA9bWFrZUR5bkNhbGxlcigpO2lmKHR5cGVvZiBmcCE9ImZ1bmN0aW9uIil7dGhyb3dCaW5kaW5nRXJyb3IoYHVua25vd24gZnVuY3Rpb24gcG9pbnRlciB3aXRoIHNpZ25hdHVyZSAke3NpZ25hdHVyZX06ICR7cmF3RnVuY3Rpb259YCl9cmV0dXJuIGZwfTt2YXIgZXh0ZW5kRXJyb3I9KGJhc2VFcnJvclR5cGUsZXJyb3JOYW1lKT0+e3ZhciBlcnJvckNsYXNzPWNyZWF0ZU5hbWVkRnVuY3Rpb24oZXJyb3JOYW1lLGZ1bmN0aW9uKG1lc3NhZ2Upe3RoaXMubmFtZT1lcnJvck5hbWU7dGhpcy5tZXNzYWdlPW1lc3NhZ2U7dmFyIHN0YWNrPW5ldyBFcnJvcihtZXNzYWdlKS5zdGFjaztpZihzdGFjayE9PXVuZGVmaW5lZCl7dGhpcy5zdGFjaz10aGlzLnRvU3RyaW5nKCkrIlxuIitzdGFjay5yZXBsYWNlKC9eRXJyb3IoOlteXG5dKik/XG4vLCIiKX19KTtlcnJvckNsYXNzLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGJhc2VFcnJvclR5cGUucHJvdG90eXBlKTtlcnJvckNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1lcnJvckNsYXNzO2Vycm9yQ2xhc3MucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7aWYodGhpcy5tZXNzYWdlPT09dW5kZWZpbmVkKXtyZXR1cm4gdGhpcy5uYW1lfWVsc2V7cmV0dXJuYCR7dGhpcy5uYW1lfTogJHt0aGlzLm1lc3NhZ2V9YH19O3JldHVybiBlcnJvckNsYXNzfTt2YXIgVW5ib3VuZFR5cGVFcnJvcjt2YXIgZ2V0VHlwZU5hbWU9dHlwZT0+e3ZhciBwdHI9X19fZ2V0VHlwZU5hbWUodHlwZSk7dmFyIHJ2PXJlYWRMYXRpbjFTdHJpbmcocHRyKTtfZnJlZShwdHIpO3JldHVybiBydn07dmFyIHRocm93VW5ib3VuZFR5cGVFcnJvcj0obWVzc2FnZSx0eXBlcyk9Pnt2YXIgdW5ib3VuZFR5cGVzPVtdO3ZhciBzZWVuPXt9O2Z1bmN0aW9uIHZpc2l0KHR5cGUpe2lmKHNlZW5bdHlwZV0pe3JldHVybn1pZihyZWdpc3RlcmVkVHlwZXNbdHlwZV0pe3JldHVybn1pZih0eXBlRGVwZW5kZW5jaWVzW3R5cGVdKXt0eXBlRGVwZW5kZW5jaWVzW3R5cGVdLmZvckVhY2godmlzaXQpO3JldHVybn11bmJvdW5kVHlwZXMucHVzaCh0eXBlKTtzZWVuW3R5cGVdPXRydWV9dHlwZXMuZm9yRWFjaCh2aXNpdCk7dGhyb3cgbmV3IFVuYm91bmRUeXBlRXJyb3IoYCR7bWVzc2FnZX06IGArdW5ib3VuZFR5cGVzLm1hcChnZXRUeXBlTmFtZSkuam9pbihbIiwgIl0pKX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzPShyYXdUeXBlLHJhd1BvaW50ZXJUeXBlLHJhd0NvbnN0UG9pbnRlclR5cGUsYmFzZUNsYXNzUmF3VHlwZSxnZXRBY3R1YWxUeXBlU2lnbmF0dXJlLGdldEFjdHVhbFR5cGUsdXBjYXN0U2lnbmF0dXJlLHVwY2FzdCxkb3duY2FzdFNpZ25hdHVyZSxkb3duY2FzdCxuYW1lLGRlc3RydWN0b3JTaWduYXR1cmUscmF3RGVzdHJ1Y3Rvcik9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7Z2V0QWN0dWFsVHlwZT1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbihnZXRBY3R1YWxUeXBlU2lnbmF0dXJlLGdldEFjdHVhbFR5cGUpO2lmKHVwY2FzdCl7dXBjYXN0PWVtYmluZF9fcmVxdWlyZUZ1bmN0aW9uKHVwY2FzdFNpZ25hdHVyZSx1cGNhc3QpfWlmKGRvd25jYXN0KXtkb3duY2FzdD1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbihkb3duY2FzdFNpZ25hdHVyZSxkb3duY2FzdCl9cmF3RGVzdHJ1Y3Rvcj1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbihkZXN0cnVjdG9yU2lnbmF0dXJlLHJhd0Rlc3RydWN0b3IpO3ZhciBsZWdhbEZ1bmN0aW9uTmFtZT1tYWtlTGVnYWxGdW5jdGlvbk5hbWUobmFtZSk7ZXhwb3NlUHVibGljU3ltYm9sKGxlZ2FsRnVuY3Rpb25OYW1lLGZ1bmN0aW9uKCl7dGhyb3dVbmJvdW5kVHlwZUVycm9yKGBDYW5ub3QgY29uc3RydWN0ICR7bmFtZX0gZHVlIHRvIHVuYm91bmQgdHlwZXNgLFtiYXNlQ2xhc3NSYXdUeXBlXSl9KTt3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbcmF3VHlwZSxyYXdQb2ludGVyVHlwZSxyYXdDb25zdFBvaW50ZXJUeXBlXSxiYXNlQ2xhc3NSYXdUeXBlP1tiYXNlQ2xhc3NSYXdUeXBlXTpbXSxmdW5jdGlvbihiYXNlKXtiYXNlPWJhc2VbMF07dmFyIGJhc2VDbGFzczt2YXIgYmFzZVByb3RvdHlwZTtpZihiYXNlQ2xhc3NSYXdUeXBlKXtiYXNlQ2xhc3M9YmFzZS5yZWdpc3RlcmVkQ2xhc3M7YmFzZVByb3RvdHlwZT1iYXNlQ2xhc3MuaW5zdGFuY2VQcm90b3R5cGV9ZWxzZXtiYXNlUHJvdG90eXBlPUNsYXNzSGFuZGxlLnByb3RvdHlwZX12YXIgY29uc3RydWN0b3I9Y3JlYXRlTmFtZWRGdW5jdGlvbihuYW1lLGZ1bmN0aW9uKCl7aWYoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpIT09aW5zdGFuY2VQcm90b3R5cGUpe3Rocm93IG5ldyBCaW5kaW5nRXJyb3IoIlVzZSAnbmV3JyB0byBjb25zdHJ1Y3QgIituYW1lKX1pZih1bmRlZmluZWQ9PT1yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keSl7dGhyb3cgbmV3IEJpbmRpbmdFcnJvcihuYW1lKyIgaGFzIG5vIGFjY2Vzc2libGUgY29uc3RydWN0b3IiKX12YXIgYm9keT1yZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keVthcmd1bWVudHMubGVuZ3RoXTtpZih1bmRlZmluZWQ9PT1ib2R5KXt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKGBUcmllZCB0byBpbnZva2UgY3RvciBvZiAke25hbWV9IHdpdGggaW52YWxpZCBudW1iZXIgb2YgcGFyYW1ldGVycyAoJHthcmd1bWVudHMubGVuZ3RofSkgLSBleHBlY3RlZCAoJHtPYmplY3Qua2V5cyhyZWdpc3RlcmVkQ2xhc3MuY29uc3RydWN0b3JfYm9keSkudG9TdHJpbmcoKX0pIHBhcmFtZXRlcnMgaW5zdGVhZCFgKX1yZXR1cm4gYm9keS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9KTt2YXIgaW5zdGFuY2VQcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiYXNlUHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6Y29uc3RydWN0b3J9fSk7Y29uc3RydWN0b3IucHJvdG90eXBlPWluc3RhbmNlUHJvdG90eXBlO3ZhciByZWdpc3RlcmVkQ2xhc3M9bmV3IFJlZ2lzdGVyZWRDbGFzcyhuYW1lLGNvbnN0cnVjdG9yLGluc3RhbmNlUHJvdG90eXBlLHJhd0Rlc3RydWN0b3IsYmFzZUNsYXNzLGdldEFjdHVhbFR5cGUsdXBjYXN0LGRvd25jYXN0KTtpZihyZWdpc3RlcmVkQ2xhc3MuYmFzZUNsYXNzKXtpZihyZWdpc3RlcmVkQ2xhc3MuYmFzZUNsYXNzLl9fZGVyaXZlZENsYXNzZXM9PT11bmRlZmluZWQpe3JlZ2lzdGVyZWRDbGFzcy5iYXNlQ2xhc3MuX19kZXJpdmVkQ2xhc3Nlcz1bXX1yZWdpc3RlcmVkQ2xhc3MuYmFzZUNsYXNzLl9fZGVyaXZlZENsYXNzZXMucHVzaChyZWdpc3RlcmVkQ2xhc3MpfXZhciByZWZlcmVuY2VDb252ZXJ0ZXI9bmV3IFJlZ2lzdGVyZWRQb2ludGVyKG5hbWUscmVnaXN0ZXJlZENsYXNzLHRydWUsZmFsc2UsZmFsc2UpO3ZhciBwb2ludGVyQ29udmVydGVyPW5ldyBSZWdpc3RlcmVkUG9pbnRlcihuYW1lKyIqIixyZWdpc3RlcmVkQ2xhc3MsZmFsc2UsZmFsc2UsZmFsc2UpO3ZhciBjb25zdFBvaW50ZXJDb252ZXJ0ZXI9bmV3IFJlZ2lzdGVyZWRQb2ludGVyKG5hbWUrIiBjb25zdCoiLHJlZ2lzdGVyZWRDbGFzcyxmYWxzZSx0cnVlLGZhbHNlKTtyZWdpc3RlcmVkUG9pbnRlcnNbcmF3VHlwZV09e3BvaW50ZXJUeXBlOnBvaW50ZXJDb252ZXJ0ZXIsY29uc3RQb2ludGVyVHlwZTpjb25zdFBvaW50ZXJDb252ZXJ0ZXJ9O3JlcGxhY2VQdWJsaWNTeW1ib2wobGVnYWxGdW5jdGlvbk5hbWUsY29uc3RydWN0b3IpO3JldHVybltyZWZlcmVuY2VDb252ZXJ0ZXIscG9pbnRlckNvbnZlcnRlcixjb25zdFBvaW50ZXJDb252ZXJ0ZXJdfSl9O3ZhciBoZWFwMzJWZWN0b3JUb0FycmF5PShjb3VudCxmaXJzdEVsZW1lbnQpPT57dmFyIGFycmF5PVtdO2Zvcih2YXIgaT0wO2k8Y291bnQ7aSsrKXthcnJheS5wdXNoKEhFQVBVMzJbZmlyc3RFbGVtZW50K2kqND4+Ml0pfXJldHVybiBhcnJheX07dmFyIHJ1bkRlc3RydWN0b3JzPWRlc3RydWN0b3JzPT57d2hpbGUoZGVzdHJ1Y3RvcnMubGVuZ3RoKXt2YXIgcHRyPWRlc3RydWN0b3JzLnBvcCgpO3ZhciBkZWw9ZGVzdHJ1Y3RvcnMucG9wKCk7ZGVsKHB0cil9fTtmdW5jdGlvbiBuZXdGdW5jKGNvbnN0cnVjdG9yLGFyZ3VtZW50TGlzdCl7aWYoIShjb25zdHJ1Y3RvciBpbnN0YW5jZW9mIEZ1bmN0aW9uKSl7dGhyb3cgbmV3IFR5cGVFcnJvcihgbmV3XyBjYWxsZWQgd2l0aCBjb25zdHJ1Y3RvciB0eXBlICR7dHlwZW9mIGNvbnN0cnVjdG9yfSB3aGljaCBpcyBub3QgYSBmdW5jdGlvbmApfXZhciBkdW1teT1jcmVhdGVOYW1lZEZ1bmN0aW9uKGNvbnN0cnVjdG9yLm5hbWV8fCJ1bmtub3duRnVuY3Rpb25OYW1lIixmdW5jdGlvbigpe30pO2R1bW15LnByb3RvdHlwZT1jb25zdHJ1Y3Rvci5wcm90b3R5cGU7dmFyIG9iaj1uZXcgZHVtbXk7dmFyIHI9Y29uc3RydWN0b3IuYXBwbHkob2JqLGFyZ3VtZW50TGlzdCk7cmV0dXJuIHIgaW5zdGFuY2VvZiBPYmplY3Q/cjpvYmp9ZnVuY3Rpb24gY3JhZnRJbnZva2VyRnVuY3Rpb24oaHVtYW5OYW1lLGFyZ1R5cGVzLGNsYXNzVHlwZSxjcHBJbnZva2VyRnVuYyxjcHBUYXJnZXRGdW5jLGlzQXN5bmMpe3ZhciBhcmdDb3VudD1hcmdUeXBlcy5sZW5ndGg7aWYoYXJnQ291bnQ8Mil7dGhyb3dCaW5kaW5nRXJyb3IoImFyZ1R5cGVzIGFycmF5IHNpemUgbWlzbWF0Y2ghIE11c3QgYXQgbGVhc3QgZ2V0IHJldHVybiB2YWx1ZSBhbmQgJ3RoaXMnIHR5cGVzISIpfXZhciBpc0NsYXNzTWV0aG9kRnVuYz1hcmdUeXBlc1sxXSE9PW51bGwmJmNsYXNzVHlwZSE9PW51bGw7dmFyIG5lZWRzRGVzdHJ1Y3RvclN0YWNrPWZhbHNlO2Zvcih2YXIgaT0xO2k8YXJnVHlwZXMubGVuZ3RoOysraSl7aWYoYXJnVHlwZXNbaV0hPT1udWxsJiZhcmdUeXBlc1tpXS5kZXN0cnVjdG9yRnVuY3Rpb249PT11bmRlZmluZWQpe25lZWRzRGVzdHJ1Y3RvclN0YWNrPXRydWU7YnJlYWt9fXZhciByZXR1cm5zPWFyZ1R5cGVzWzBdLm5hbWUhPT0idm9pZCI7dmFyIGFyZ3NMaXN0PSIiO3ZhciBhcmdzTGlzdFdpcmVkPSIiO2Zvcih2YXIgaT0wO2k8YXJnQ291bnQtMjsrK2kpe2FyZ3NMaXN0Kz0oaSE9PTA/IiwgIjoiIikrImFyZyIraTthcmdzTGlzdFdpcmVkKz0oaSE9PTA/IiwgIjoiIikrImFyZyIraSsiV2lyZWQifXZhciBpbnZva2VyRm5Cb2R5PWBcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgke2FyZ3NMaXN0fSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gJHthcmdDb3VudC0yfSkge1xuICAgICAgICAgIHRocm93QmluZGluZ0Vycm9yKCdmdW5jdGlvbiAke2h1bWFuTmFtZX0gY2FsbGVkIHdpdGggJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIGFyZ3VtZW50cywgZXhwZWN0ZWQgJHthcmdDb3VudC0yfScpO1xuICAgICAgICB9YDtpZihuZWVkc0Rlc3RydWN0b3JTdGFjayl7aW52b2tlckZuQm9keSs9InZhciBkZXN0cnVjdG9ycyA9IFtdO1xuIn12YXIgZHRvclN0YWNrPW5lZWRzRGVzdHJ1Y3RvclN0YWNrPyJkZXN0cnVjdG9ycyI6Im51bGwiO3ZhciBhcmdzMT1bInRocm93QmluZGluZ0Vycm9yIiwiaW52b2tlciIsImZuIiwicnVuRGVzdHJ1Y3RvcnMiLCJyZXRUeXBlIiwiY2xhc3NQYXJhbSJdO3ZhciBhcmdzMj1bdGhyb3dCaW5kaW5nRXJyb3IsY3BwSW52b2tlckZ1bmMsY3BwVGFyZ2V0RnVuYyxydW5EZXN0cnVjdG9ycyxhcmdUeXBlc1swXSxhcmdUeXBlc1sxXV07aWYoaXNDbGFzc01ldGhvZEZ1bmMpe2ludm9rZXJGbkJvZHkrPSJ2YXIgdGhpc1dpcmVkID0gY2xhc3NQYXJhbS50b1dpcmVUeXBlKCIrZHRvclN0YWNrKyIsIHRoaXMpO1xuIn1mb3IodmFyIGk9MDtpPGFyZ0NvdW50LTI7KytpKXtpbnZva2VyRm5Cb2R5Kz0idmFyIGFyZyIraSsiV2lyZWQgPSBhcmdUeXBlIitpKyIudG9XaXJlVHlwZSgiK2R0b3JTdGFjaysiLCBhcmciK2krIik7IC8vICIrYXJnVHlwZXNbaSsyXS5uYW1lKyJcbiI7YXJnczEucHVzaCgiYXJnVHlwZSIraSk7YXJnczIucHVzaChhcmdUeXBlc1tpKzJdKX1pZihpc0NsYXNzTWV0aG9kRnVuYyl7YXJnc0xpc3RXaXJlZD0idGhpc1dpcmVkIisoYXJnc0xpc3RXaXJlZC5sZW5ndGg+MD8iLCAiOiIiKSthcmdzTGlzdFdpcmVkfWludm9rZXJGbkJvZHkrPShyZXR1cm5zfHxpc0FzeW5jPyJ2YXIgcnYgPSAiOiIiKSsiaW52b2tlcihmbiIrKGFyZ3NMaXN0V2lyZWQubGVuZ3RoPjA/IiwgIjoiIikrYXJnc0xpc3RXaXJlZCsiKTtcbiI7aWYobmVlZHNEZXN0cnVjdG9yU3RhY2spe2ludm9rZXJGbkJvZHkrPSJydW5EZXN0cnVjdG9ycyhkZXN0cnVjdG9ycyk7XG4ifWVsc2V7Zm9yKHZhciBpPWlzQ2xhc3NNZXRob2RGdW5jPzE6MjtpPGFyZ1R5cGVzLmxlbmd0aDsrK2kpe3ZhciBwYXJhbU5hbWU9aT09PTE/InRoaXNXaXJlZCI6ImFyZyIrKGktMikrIldpcmVkIjtpZihhcmdUeXBlc1tpXS5kZXN0cnVjdG9yRnVuY3Rpb24hPT1udWxsKXtpbnZva2VyRm5Cb2R5Kz1wYXJhbU5hbWUrIl9kdG9yKCIrcGFyYW1OYW1lKyIpOyAvLyAiK2FyZ1R5cGVzW2ldLm5hbWUrIlxuIjthcmdzMS5wdXNoKHBhcmFtTmFtZSsiX2R0b3IiKTthcmdzMi5wdXNoKGFyZ1R5cGVzW2ldLmRlc3RydWN0b3JGdW5jdGlvbil9fX1pZihyZXR1cm5zKXtpbnZva2VyRm5Cb2R5Kz0idmFyIHJldCA9IHJldFR5cGUuZnJvbVdpcmVUeXBlKHJ2KTtcbiIrInJldHVybiByZXQ7XG4ifWVsc2V7fWludm9rZXJGbkJvZHkrPSJ9XG4iO2FyZ3MxLnB1c2goaW52b2tlckZuQm9keSk7dmFyIGludm9rZXJGbj1uZXdGdW5jKEZ1bmN0aW9uLGFyZ3MxKS5hcHBseShudWxsLGFyZ3MyKTtyZXR1cm4gY3JlYXRlTmFtZWRGdW5jdGlvbihodW1hbk5hbWUsaW52b2tlckZuKX12YXIgX19lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfY29uc3RydWN0b3I9KHJhd0NsYXNzVHlwZSxhcmdDb3VudCxyYXdBcmdUeXBlc0FkZHIsaW52b2tlclNpZ25hdHVyZSxpbnZva2VyLHJhd0NvbnN0cnVjdG9yKT0+e3ZhciByYXdBcmdUeXBlcz1oZWFwMzJWZWN0b3JUb0FycmF5KGFyZ0NvdW50LHJhd0FyZ1R5cGVzQWRkcik7aW52b2tlcj1lbWJpbmRfX3JlcXVpcmVGdW5jdGlvbihpbnZva2VyU2lnbmF0dXJlLGludm9rZXIpO3doZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkKFtdLFtyYXdDbGFzc1R5cGVdLGZ1bmN0aW9uKGNsYXNzVHlwZSl7Y2xhc3NUeXBlPWNsYXNzVHlwZVswXTt2YXIgaHVtYW5OYW1lPWBjb25zdHJ1Y3RvciAke2NsYXNzVHlwZS5uYW1lfWA7aWYodW5kZWZpbmVkPT09Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5KXtjbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHk9W119aWYodW5kZWZpbmVkIT09Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5W2FyZ0NvdW50LTFdKXt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKGBDYW5ub3QgcmVnaXN0ZXIgbXVsdGlwbGUgY29uc3RydWN0b3JzIHdpdGggaWRlbnRpY2FsIG51bWJlciBvZiBwYXJhbWV0ZXJzICgke2FyZ0NvdW50LTF9KSBmb3IgY2xhc3MgJyR7Y2xhc3NUeXBlLm5hbWV9JyEgT3ZlcmxvYWQgcmVzb2x1dGlvbiBpcyBjdXJyZW50bHkgb25seSBwZXJmb3JtZWQgdXNpbmcgdGhlIHBhcmFtZXRlciBjb3VudCwgbm90IGFjdHVhbCB0eXBlIGluZm8hYCl9Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5jb25zdHJ1Y3Rvcl9ib2R5W2FyZ0NvdW50LTFdPSgpPT57dGhyb3dVbmJvdW5kVHlwZUVycm9yKGBDYW5ub3QgY29uc3RydWN0ICR7Y2xhc3NUeXBlLm5hbWV9IGR1ZSB0byB1bmJvdW5kIHR5cGVzYCxyYXdBcmdUeXBlcyl9O3doZW5EZXBlbmRlbnRUeXBlc0FyZVJlc29sdmVkKFtdLHJhd0FyZ1R5cGVzLGFyZ1R5cGVzPT57YXJnVHlwZXMuc3BsaWNlKDEsMCxudWxsKTtjbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmNvbnN0cnVjdG9yX2JvZHlbYXJnQ291bnQtMV09Y3JhZnRJbnZva2VyRnVuY3Rpb24oaHVtYW5OYW1lLGFyZ1R5cGVzLG51bGwsaW52b2tlcixyYXdDb25zdHJ1Y3Rvcik7cmV0dXJuW119KTtyZXR1cm5bXX0pfTt2YXIgZ2V0RnVuY3Rpb25OYW1lPXNpZ25hdHVyZT0+e3NpZ25hdHVyZT1zaWduYXR1cmUudHJpbSgpO2NvbnN0IGFyZ3NJbmRleD1zaWduYXR1cmUuaW5kZXhPZigiKCIpO2lmKGFyZ3NJbmRleCE9PS0xKXtyZXR1cm4gc2lnbmF0dXJlLnN1YnN0cigwLGFyZ3NJbmRleCl9ZWxzZXtyZXR1cm4gc2lnbmF0dXJlfX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2Z1bmN0aW9uPShyYXdDbGFzc1R5cGUsbWV0aG9kTmFtZSxhcmdDb3VudCxyYXdBcmdUeXBlc0FkZHIsaW52b2tlclNpZ25hdHVyZSxyYXdJbnZva2VyLGNvbnRleHQsaXNQdXJlVmlydHVhbCxpc0FzeW5jKT0+e3ZhciByYXdBcmdUeXBlcz1oZWFwMzJWZWN0b3JUb0FycmF5KGFyZ0NvdW50LHJhd0FyZ1R5cGVzQWRkcik7bWV0aG9kTmFtZT1yZWFkTGF0aW4xU3RyaW5nKG1ldGhvZE5hbWUpO21ldGhvZE5hbWU9Z2V0RnVuY3Rpb25OYW1lKG1ldGhvZE5hbWUpO3Jhd0ludm9rZXI9ZW1iaW5kX19yZXF1aXJlRnVuY3Rpb24oaW52b2tlclNpZ25hdHVyZSxyYXdJbnZva2VyKTt3aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxbcmF3Q2xhc3NUeXBlXSxmdW5jdGlvbihjbGFzc1R5cGUpe2NsYXNzVHlwZT1jbGFzc1R5cGVbMF07dmFyIGh1bWFuTmFtZT1gJHtjbGFzc1R5cGUubmFtZX0uJHttZXRob2ROYW1lfWA7aWYobWV0aG9kTmFtZS5zdGFydHNXaXRoKCJAQCIpKXttZXRob2ROYW1lPVN5bWJvbFttZXRob2ROYW1lLnN1YnN0cmluZygyKV19aWYoaXNQdXJlVmlydHVhbCl7Y2xhc3NUeXBlLnJlZ2lzdGVyZWRDbGFzcy5wdXJlVmlydHVhbEZ1bmN0aW9ucy5wdXNoKG1ldGhvZE5hbWUpfWZ1bmN0aW9uIHVuYm91bmRUeXBlc0hhbmRsZXIoKXt0aHJvd1VuYm91bmRUeXBlRXJyb3IoYENhbm5vdCBjYWxsICR7aHVtYW5OYW1lfSBkdWUgdG8gdW5ib3VuZCB0eXBlc2AscmF3QXJnVHlwZXMpfXZhciBwcm90bz1jbGFzc1R5cGUucmVnaXN0ZXJlZENsYXNzLmluc3RhbmNlUHJvdG90eXBlO3ZhciBtZXRob2Q9cHJvdG9bbWV0aG9kTmFtZV07aWYodW5kZWZpbmVkPT09bWV0aG9kfHx1bmRlZmluZWQ9PT1tZXRob2Qub3ZlcmxvYWRUYWJsZSYmbWV0aG9kLmNsYXNzTmFtZSE9PWNsYXNzVHlwZS5uYW1lJiZtZXRob2QuYXJnQ291bnQ9PT1hcmdDb3VudC0yKXt1bmJvdW5kVHlwZXNIYW5kbGVyLmFyZ0NvdW50PWFyZ0NvdW50LTI7dW5ib3VuZFR5cGVzSGFuZGxlci5jbGFzc05hbWU9Y2xhc3NUeXBlLm5hbWU7cHJvdG9bbWV0aG9kTmFtZV09dW5ib3VuZFR5cGVzSGFuZGxlcn1lbHNle2Vuc3VyZU92ZXJsb2FkVGFibGUocHJvdG8sbWV0aG9kTmFtZSxodW1hbk5hbWUpO3Byb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGVbYXJnQ291bnQtMl09dW5ib3VuZFR5cGVzSGFuZGxlcn13aGVuRGVwZW5kZW50VHlwZXNBcmVSZXNvbHZlZChbXSxyYXdBcmdUeXBlcyxmdW5jdGlvbihhcmdUeXBlcyl7dmFyIG1lbWJlckZ1bmN0aW9uPWNyYWZ0SW52b2tlckZ1bmN0aW9uKGh1bWFuTmFtZSxhcmdUeXBlcyxjbGFzc1R5cGUscmF3SW52b2tlcixjb250ZXh0LGlzQXN5bmMpO2lmKHVuZGVmaW5lZD09PXByb3RvW21ldGhvZE5hbWVdLm92ZXJsb2FkVGFibGUpe21lbWJlckZ1bmN0aW9uLmFyZ0NvdW50PWFyZ0NvdW50LTI7cHJvdG9bbWV0aG9kTmFtZV09bWVtYmVyRnVuY3Rpb259ZWxzZXtwcm90b1ttZXRob2ROYW1lXS5vdmVybG9hZFRhYmxlW2FyZ0NvdW50LTJdPW1lbWJlckZ1bmN0aW9ufXJldHVybltdfSk7cmV0dXJuW119KX07ZnVuY3Rpb24gaGFuZGxlQWxsb2NhdG9ySW5pdCgpe09iamVjdC5hc3NpZ24oSGFuZGxlQWxsb2NhdG9yLnByb3RvdHlwZSx7Z2V0KGlkKXtyZXR1cm4gdGhpcy5hbGxvY2F0ZWRbaWRdfSxoYXMoaWQpe3JldHVybiB0aGlzLmFsbG9jYXRlZFtpZF0hPT11bmRlZmluZWR9LGFsbG9jYXRlKGhhbmRsZSl7dmFyIGlkPXRoaXMuZnJlZWxpc3QucG9wKCl8fHRoaXMuYWxsb2NhdGVkLmxlbmd0aDt0aGlzLmFsbG9jYXRlZFtpZF09aGFuZGxlO3JldHVybiBpZH0sZnJlZShpZCl7dGhpcy5hbGxvY2F0ZWRbaWRdPXVuZGVmaW5lZDt0aGlzLmZyZWVsaXN0LnB1c2goaWQpfX0pfWZ1bmN0aW9uIEhhbmRsZUFsbG9jYXRvcigpe3RoaXMuYWxsb2NhdGVkPVt1bmRlZmluZWRdO3RoaXMuZnJlZWxpc3Q9W119dmFyIGVtdmFsX2hhbmRsZXM9bmV3IEhhbmRsZUFsbG9jYXRvcjt2YXIgX19lbXZhbF9kZWNyZWY9aGFuZGxlPT57aWYoaGFuZGxlPj1lbXZhbF9oYW5kbGVzLnJlc2VydmVkJiYwPT09LS1lbXZhbF9oYW5kbGVzLmdldChoYW5kbGUpLnJlZmNvdW50KXtlbXZhbF9oYW5kbGVzLmZyZWUoaGFuZGxlKX19O3ZhciBjb3VudF9lbXZhbF9oYW5kbGVzPSgpPT57dmFyIGNvdW50PTA7Zm9yKHZhciBpPWVtdmFsX2hhbmRsZXMucmVzZXJ2ZWQ7aTxlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5sZW5ndGg7KytpKXtpZihlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZFtpXSE9PXVuZGVmaW5lZCl7Kytjb3VudH19cmV0dXJuIGNvdW50fTt2YXIgaW5pdF9lbXZhbD0oKT0+e2VtdmFsX2hhbmRsZXMuYWxsb2NhdGVkLnB1c2goe3ZhbHVlOnVuZGVmaW5lZH0se3ZhbHVlOm51bGx9LHt2YWx1ZTp0cnVlfSx7dmFsdWU6ZmFsc2V9KTtlbXZhbF9oYW5kbGVzLnJlc2VydmVkPWVtdmFsX2hhbmRsZXMuYWxsb2NhdGVkLmxlbmd0aDtNb2R1bGVbImNvdW50X2VtdmFsX2hhbmRsZXMiXT1jb3VudF9lbXZhbF9oYW5kbGVzfTt2YXIgRW12YWw9e3RvVmFsdWU6aGFuZGxlPT57aWYoIWhhbmRsZSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCB1c2UgZGVsZXRlZCB2YWwuIGhhbmRsZSA9ICIraGFuZGxlKX1yZXR1cm4gZW12YWxfaGFuZGxlcy5nZXQoaGFuZGxlKS52YWx1ZX0sdG9IYW5kbGU6dmFsdWU9Pntzd2l0Y2godmFsdWUpe2Nhc2UgdW5kZWZpbmVkOnJldHVybiAxO2Nhc2UgbnVsbDpyZXR1cm4gMjtjYXNlIHRydWU6cmV0dXJuIDM7Y2FzZSBmYWxzZTpyZXR1cm4gNDtkZWZhdWx0OntyZXR1cm4gZW12YWxfaGFuZGxlcy5hbGxvY2F0ZSh7cmVmY291bnQ6MSx2YWx1ZTp2YWx1ZX0pfX19fTtmdW5jdGlvbiBzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUDMyW3BvaW50ZXI+PjJdKX12YXIgX19lbWJpbmRfcmVnaXN0ZXJfZW12YWw9KHJhd1R5cGUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpoYW5kbGU9Pnt2YXIgcnY9RW12YWwudG9WYWx1ZShoYW5kbGUpO19fZW12YWxfZGVjcmVmKGhhbmRsZSk7cmV0dXJuIHJ2fSwidG9XaXJlVHlwZSI6KGRlc3RydWN0b3JzLHZhbHVlKT0+RW12YWwudG9IYW5kbGUodmFsdWUpLCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSl9O3ZhciBlbWJpbmRSZXByPXY9PntpZih2PT09bnVsbCl7cmV0dXJuIm51bGwifXZhciB0PXR5cGVvZiB2O2lmKHQ9PT0ib2JqZWN0Inx8dD09PSJhcnJheSJ8fHQ9PT0iZnVuY3Rpb24iKXtyZXR1cm4gdi50b1N0cmluZygpfWVsc2V7cmV0dXJuIiIrdn19O3ZhciBmbG9hdFJlYWRWYWx1ZUZyb21Qb2ludGVyPShuYW1lLHdpZHRoKT0+e3N3aXRjaCh3aWR0aCl7Y2FzZSA0OnJldHVybiBmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUEYzMltwb2ludGVyPj4yXSl9O2Nhc2UgODpyZXR1cm4gZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBGNjRbcG9pbnRlcj4+M10pfTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgZmxvYXQgd2lkdGggKCR7d2lkdGh9KTogJHtuYW1lfWApfX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0PShyYXdUeXBlLG5hbWUsc2l6ZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjp2YWx1ZT0+dmFsdWUsInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyx2YWx1ZSk9PnZhbHVlLCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmZsb2F0UmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaXplKSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pfTt2YXIgaW50ZWdlclJlYWRWYWx1ZUZyb21Qb2ludGVyPShuYW1lLHdpZHRoLHNpZ25lZCk9Pntzd2l0Y2god2lkdGgpe2Nhc2UgMTpyZXR1cm4gc2lnbmVkP3BvaW50ZXI9PkhFQVA4W3BvaW50ZXI+PjBdOnBvaW50ZXI9PkhFQVBVOFtwb2ludGVyPj4wXTtjYXNlIDI6cmV0dXJuIHNpZ25lZD9wb2ludGVyPT5IRUFQMTZbcG9pbnRlcj4+MV06cG9pbnRlcj0+SEVBUFUxNltwb2ludGVyPj4xXTtjYXNlIDQ6cmV0dXJuIHNpZ25lZD9wb2ludGVyPT5IRUFQMzJbcG9pbnRlcj4+Ml06cG9pbnRlcj0+SEVBUFUzMltwb2ludGVyPj4yXTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgaW50ZWdlciB3aWR0aCAoJHt3aWR0aH0pOiAke25hbWV9YCl9fTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcj0ocHJpbWl0aXZlVHlwZSxuYW1lLHNpemUsbWluUmFuZ2UsbWF4UmFuZ2UpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO2lmKG1heFJhbmdlPT09LTEpe21heFJhbmdlPTQyOTQ5NjcyOTV9dmFyIGZyb21XaXJlVHlwZT12YWx1ZT0+dmFsdWU7aWYobWluUmFuZ2U9PT0wKXt2YXIgYml0c2hpZnQ9MzItOCpzaXplO2Zyb21XaXJlVHlwZT12YWx1ZT0+dmFsdWU8PGJpdHNoaWZ0Pj4+Yml0c2hpZnR9dmFyIGlzVW5zaWduZWRUeXBlPW5hbWUuaW5jbHVkZXMoInVuc2lnbmVkIik7dmFyIGNoZWNrQXNzZXJ0aW9ucz0odmFsdWUsdG9UeXBlTmFtZSk9Pnt9O3ZhciB0b1dpcmVUeXBlO2lmKGlzVW5zaWduZWRUeXBlKXt0b1dpcmVUeXBlPWZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtjaGVja0Fzc2VydGlvbnModmFsdWUsdGhpcy5uYW1lKTtyZXR1cm4gdmFsdWU+Pj4wfX1lbHNle3RvV2lyZVR5cGU9ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe2NoZWNrQXNzZXJ0aW9ucyh2YWx1ZSx0aGlzLm5hbWUpO3JldHVybiB2YWx1ZX19cmVnaXN0ZXJUeXBlKHByaW1pdGl2ZVR5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmcm9tV2lyZVR5cGUsInRvV2lyZVR5cGUiOnRvV2lyZVR5cGUsImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6aW50ZWdlclJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2l6ZSxtaW5SYW5nZSE9PTApLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSl9O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldz0ocmF3VHlwZSxkYXRhVHlwZUluZGV4LG5hbWUpPT57dmFyIHR5cGVNYXBwaW5nPVtJbnQ4QXJyYXksVWludDhBcnJheSxJbnQxNkFycmF5LFVpbnQxNkFycmF5LEludDMyQXJyYXksVWludDMyQXJyYXksRmxvYXQzMkFycmF5LEZsb2F0NjRBcnJheV07dmFyIFRBPXR5cGVNYXBwaW5nW2RhdGFUeXBlSW5kZXhdO2Z1bmN0aW9uIGRlY29kZU1lbW9yeVZpZXcoaGFuZGxlKXt2YXIgc2l6ZT1IRUFQVTMyW2hhbmRsZT4+Ml07dmFyIGRhdGE9SEVBUFUzMltoYW5kbGUrND4+Ml07cmV0dXJuIG5ldyBUQShIRUFQOC5idWZmZXIsZGF0YSxzaXplKX1uYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpkZWNvZGVNZW1vcnlWaWV3LCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmRlY29kZU1lbW9yeVZpZXd9LHtpZ25vcmVEdXBsaWNhdGVSZWdpc3RyYXRpb25zOnRydWV9KX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmc9KHJhd1R5cGUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIHN0ZFN0cmluZ0lzVVRGOD1uYW1lPT09InN0ZDo6c3RyaW5nIjtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiKHZhbHVlKXt2YXIgbGVuZ3RoPUhFQVBVMzJbdmFsdWU+PjJdO3ZhciBwYXlsb2FkPXZhbHVlKzQ7dmFyIHN0cjtpZihzdGRTdHJpbmdJc1VURjgpe3ZhciBkZWNvZGVTdGFydFB0cj1wYXlsb2FkO2Zvcih2YXIgaT0wO2k8PWxlbmd0aDsrK2kpe3ZhciBjdXJyZW50Qnl0ZVB0cj1wYXlsb2FkK2k7aWYoaT09bGVuZ3RofHxIRUFQVThbY3VycmVudEJ5dGVQdHJdPT0wKXt2YXIgbWF4UmVhZD1jdXJyZW50Qnl0ZVB0ci1kZWNvZGVTdGFydFB0cjt2YXIgc3RyaW5nU2VnbWVudD1VVEY4VG9TdHJpbmcoZGVjb2RlU3RhcnRQdHIsbWF4UmVhZCk7aWYoc3RyPT09dW5kZWZpbmVkKXtzdHI9c3RyaW5nU2VnbWVudH1lbHNle3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSgwKTtzdHIrPXN0cmluZ1NlZ21lbnR9ZGVjb2RlU3RhcnRQdHI9Y3VycmVudEJ5dGVQdHIrMX19fWVsc2V7dmFyIGE9bmV3IEFycmF5KGxlbmd0aCk7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXthW2ldPVN0cmluZy5mcm9tQ2hhckNvZGUoSEVBUFU4W3BheWxvYWQraV0pfXN0cj1hLmpvaW4oIiIpfV9mcmVlKHZhbHVlKTtyZXR1cm4gc3RyfSwidG9XaXJlVHlwZSIoZGVzdHJ1Y3RvcnMsdmFsdWUpe2lmKHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe3ZhbHVlPW5ldyBVaW50OEFycmF5KHZhbHVlKX12YXIgbGVuZ3RoO3ZhciB2YWx1ZUlzT2ZUeXBlU3RyaW5nPXR5cGVvZiB2YWx1ZT09InN0cmluZyI7aWYoISh2YWx1ZUlzT2ZUeXBlU3RyaW5nfHx2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXl8fHZhbHVlIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXl8fHZhbHVlIGluc3RhbmNlb2YgSW50OEFycmF5KSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gc3RkOjpzdHJpbmciKX1pZihzdGRTdHJpbmdJc1VURjgmJnZhbHVlSXNPZlR5cGVTdHJpbmcpe2xlbmd0aD1sZW5ndGhCeXRlc1VURjgodmFsdWUpfWVsc2V7bGVuZ3RoPXZhbHVlLmxlbmd0aH12YXIgYmFzZT1fbWFsbG9jKDQrbGVuZ3RoKzEpO3ZhciBwdHI9YmFzZSs0O0hFQVBVMzJbYmFzZT4+Ml09bGVuZ3RoO2lmKHN0ZFN0cmluZ0lzVVRGOCYmdmFsdWVJc09mVHlwZVN0cmluZyl7c3RyaW5nVG9VVEY4KHZhbHVlLHB0cixsZW5ndGgrMSl9ZWxzZXtpZih2YWx1ZUlzT2ZUeXBlU3RyaW5nKXtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe3ZhciBjaGFyQ29kZT12YWx1ZS5jaGFyQ29kZUF0KGkpO2lmKGNoYXJDb2RlPjI1NSl7X2ZyZWUocHRyKTt0aHJvd0JpbmRpbmdFcnJvcigiU3RyaW5nIGhhcyBVVEYtMTYgY29kZSB1bml0cyB0aGF0IGRvIG5vdCBmaXQgaW4gOCBiaXRzIil9SEVBUFU4W3B0citpXT1jaGFyQ29kZX19ZWxzZXtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe0hFQVBVOFtwdHIraV09dmFsdWVbaV19fX1pZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2goX2ZyZWUsYmFzZSl9cmV0dXJuIGJhc2V9LCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnJlYWRQb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbihwdHIpe19mcmVlKHB0cil9fSl9O3ZhciBVVEYxNkRlY29kZXI9dHlwZW9mIFRleHREZWNvZGVyIT0idW5kZWZpbmVkIj9uZXcgVGV4dERlY29kZXIoInV0Zi0xNmxlIik6dW5kZWZpbmVkO3ZhciBVVEYxNlRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT57dmFyIGVuZFB0cj1wdHI7dmFyIGlkeD1lbmRQdHI+PjE7dmFyIG1heElkeD1pZHgrbWF4Qnl0ZXNUb1JlYWQvMjt3aGlsZSghKGlkeD49bWF4SWR4KSYmSEVBUFUxNltpZHhdKSsraWR4O2VuZFB0cj1pZHg8PDE7aWYoZW5kUHRyLXB0cj4zMiYmVVRGMTZEZWNvZGVyKXJldHVybiBVVEYxNkRlY29kZXIuZGVjb2RlKEhFQVBVOC5zbGljZShwdHIsZW5kUHRyKSk7dmFyIHN0cj0iIjtmb3IodmFyIGk9MDshKGk+PW1heEJ5dGVzVG9SZWFkLzIpOysraSl7dmFyIGNvZGVVbml0PUhFQVAxNltwdHIraSoyPj4xXTtpZihjb2RlVW5pdD09MClicmVhaztzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoY29kZVVuaXQpfXJldHVybiBzdHJ9O3ZhciBzdHJpbmdUb1VURjE2PShzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSk9PntpZihtYXhCeXRlc1RvV3JpdGU9PT11bmRlZmluZWQpe21heEJ5dGVzVG9Xcml0ZT0yMTQ3NDgzNjQ3fWlmKG1heEJ5dGVzVG9Xcml0ZTwyKXJldHVybiAwO21heEJ5dGVzVG9Xcml0ZS09Mjt2YXIgc3RhcnRQdHI9b3V0UHRyO3ZhciBudW1DaGFyc1RvV3JpdGU9bWF4Qnl0ZXNUb1dyaXRlPHN0ci5sZW5ndGgqMj9tYXhCeXRlc1RvV3JpdGUvMjpzdHIubGVuZ3RoO2Zvcih2YXIgaT0wO2k8bnVtQ2hhcnNUb1dyaXRlOysraSl7dmFyIGNvZGVVbml0PXN0ci5jaGFyQ29kZUF0KGkpO0hFQVAxNltvdXRQdHI+PjFdPWNvZGVVbml0O291dFB0cis9Mn1IRUFQMTZbb3V0UHRyPj4xXT0wO3JldHVybiBvdXRQdHItc3RhcnRQdHJ9O3ZhciBsZW5ndGhCeXRlc1VURjE2PXN0cj0+c3RyLmxlbmd0aCoyO3ZhciBVVEYzMlRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT57dmFyIGk9MDt2YXIgc3RyPSIiO3doaWxlKCEoaT49bWF4Qnl0ZXNUb1JlYWQvNCkpe3ZhciB1dGYzMj1IRUFQMzJbcHRyK2kqND4+Ml07aWYodXRmMzI9PTApYnJlYWs7KytpO2lmKHV0ZjMyPj02NTUzNil7dmFyIGNoPXV0ZjMyLTY1NTM2O3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxjaD4+MTAsNTYzMjB8Y2gmMTAyMyl9ZWxzZXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodXRmMzIpfX1yZXR1cm4gc3RyfTt2YXIgc3RyaW5nVG9VVEYzMj0oc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpPT57aWYobWF4Qnl0ZXNUb1dyaXRlPT09dW5kZWZpbmVkKXttYXhCeXRlc1RvV3JpdGU9MjE0NzQ4MzY0N31pZihtYXhCeXRlc1RvV3JpdGU8NClyZXR1cm4gMDt2YXIgc3RhcnRQdHI9b3V0UHRyO3ZhciBlbmRQdHI9c3RhcnRQdHIrbWF4Qnl0ZXNUb1dyaXRlLTQ7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIGNvZGVVbml0PXN0ci5jaGFyQ29kZUF0KGkpO2lmKGNvZGVVbml0Pj01NTI5NiYmY29kZVVuaXQ8PTU3MzQzKXt2YXIgdHJhaWxTdXJyb2dhdGU9c3RyLmNoYXJDb2RlQXQoKytpKTtjb2RlVW5pdD02NTUzNisoKGNvZGVVbml0JjEwMjMpPDwxMCl8dHJhaWxTdXJyb2dhdGUmMTAyM31IRUFQMzJbb3V0UHRyPj4yXT1jb2RlVW5pdDtvdXRQdHIrPTQ7aWYob3V0UHRyKzQ+ZW5kUHRyKWJyZWFrfUhFQVAzMltvdXRQdHI+PjJdPTA7cmV0dXJuIG91dFB0ci1zdGFydFB0cn07dmFyIGxlbmd0aEJ5dGVzVVRGMzI9c3RyPT57dmFyIGxlbj0wO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtpZihjb2RlVW5pdD49NTUyOTYmJmNvZGVVbml0PD01NzM0MykrK2k7bGVuKz00fXJldHVybiBsZW59O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZz0ocmF3VHlwZSxjaGFyU2l6ZSxuYW1lKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTt2YXIgZGVjb2RlU3RyaW5nLGVuY29kZVN0cmluZyxnZXRIZWFwLGxlbmd0aEJ5dGVzVVRGLHNoaWZ0O2lmKGNoYXJTaXplPT09Mil7ZGVjb2RlU3RyaW5nPVVURjE2VG9TdHJpbmc7ZW5jb2RlU3RyaW5nPXN0cmluZ1RvVVRGMTY7bGVuZ3RoQnl0ZXNVVEY9bGVuZ3RoQnl0ZXNVVEYxNjtnZXRIZWFwPSgpPT5IRUFQVTE2O3NoaWZ0PTF9ZWxzZSBpZihjaGFyU2l6ZT09PTQpe2RlY29kZVN0cmluZz1VVEYzMlRvU3RyaW5nO2VuY29kZVN0cmluZz1zdHJpbmdUb1VURjMyO2xlbmd0aEJ5dGVzVVRGPWxlbmd0aEJ5dGVzVVRGMzI7Z2V0SGVhcD0oKT0+SEVBUFUzMjtzaGlmdD0yfXJlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6dmFsdWU9Pnt2YXIgbGVuZ3RoPUhFQVBVMzJbdmFsdWU+PjJdO3ZhciBIRUFQPWdldEhlYXAoKTt2YXIgc3RyO3ZhciBkZWNvZGVTdGFydFB0cj12YWx1ZSs0O2Zvcih2YXIgaT0wO2k8PWxlbmd0aDsrK2kpe3ZhciBjdXJyZW50Qnl0ZVB0cj12YWx1ZSs0K2kqY2hhclNpemU7aWYoaT09bGVuZ3RofHxIRUFQW2N1cnJlbnRCeXRlUHRyPj5zaGlmdF09PTApe3ZhciBtYXhSZWFkQnl0ZXM9Y3VycmVudEJ5dGVQdHItZGVjb2RlU3RhcnRQdHI7dmFyIHN0cmluZ1NlZ21lbnQ9ZGVjb2RlU3RyaW5nKGRlY29kZVN0YXJ0UHRyLG1heFJlYWRCeXRlcyk7aWYoc3RyPT09dW5kZWZpbmVkKXtzdHI9c3RyaW5nU2VnbWVudH1lbHNle3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSgwKTtzdHIrPXN0cmluZ1NlZ21lbnR9ZGVjb2RlU3RhcnRQdHI9Y3VycmVudEJ5dGVQdHIrY2hhclNpemV9fV9mcmVlKHZhbHVlKTtyZXR1cm4gc3RyfSwidG9XaXJlVHlwZSI6KGRlc3RydWN0b3JzLHZhbHVlKT0+e2lmKCEodHlwZW9mIHZhbHVlPT0ic3RyaW5nIikpe3Rocm93QmluZGluZ0Vycm9yKGBDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIEMrKyBzdHJpbmcgdHlwZSAke25hbWV9YCl9dmFyIGxlbmd0aD1sZW5ndGhCeXRlc1VURih2YWx1ZSk7dmFyIHB0cj1fbWFsbG9jKDQrbGVuZ3RoK2NoYXJTaXplKTtIRUFQVTMyW3B0cj4+Ml09bGVuZ3RoPj5zaGlmdDtlbmNvZGVTdHJpbmcodmFsdWUscHRyKzQsbGVuZ3RoK2NoYXJTaXplKTtpZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2goX2ZyZWUscHRyKX1yZXR1cm4gcHRyfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpfX0pfTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfdm9pZD0ocmF3VHlwZSxuYW1lKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7aXNWb2lkOnRydWUsbmFtZTpuYW1lLCJhcmdQYWNrQWR2YW5jZSI6MCwiZnJvbVdpcmVUeXBlIjooKT0+dW5kZWZpbmVkLCJ0b1dpcmVUeXBlIjooZGVzdHJ1Y3RvcnMsbyk9PnVuZGVmaW5lZH0pfTt2YXIgbm93SXNNb25vdG9uaWM9MTt2YXIgX19lbXNjcmlwdGVuX2dldF9ub3dfaXNfbW9ub3RvbmljPSgpPT5ub3dJc01vbm90b25pYzt2YXIgbWF5YmVFeGl0PSgpPT57aWYocnVudGltZUV4aXRlZCl7cmV0dXJufWlmKCFrZWVwUnVudGltZUFsaXZlKCkpe3RyeXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKV9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdChFWElUU1RBVFVTKTtlbHNlIF9leGl0KEVYSVRTVEFUVVMpfWNhdGNoKGUpe2hhbmRsZUV4Y2VwdGlvbihlKX19fTt2YXIgY2FsbFVzZXJDYWxsYmFjaz1mdW5jPT57aWYocnVudGltZUV4aXRlZHx8QUJPUlQpe3JldHVybn10cnl7ZnVuYygpO21heWJlRXhpdCgpfWNhdGNoKGUpe2hhbmRsZUV4Y2VwdGlvbihlKX19O3ZhciBfX2Vtc2NyaXB0ZW5fdGhyZWFkX21haWxib3hfYXdhaXQ9cHRocmVhZF9wdHI9PntpZih0eXBlb2YgQXRvbWljcy53YWl0QXN5bmM9PT0iZnVuY3Rpb24iKXt2YXIgd2FpdD1BdG9taWNzLndhaXRBc3luYyhIRUFQMzIscHRocmVhZF9wdHI+PjIscHRocmVhZF9wdHIpO3dhaXQudmFsdWUudGhlbihjaGVja01haWxib3gpO3ZhciB3YWl0aW5nQXN5bmM9cHRocmVhZF9wdHIrMTI4O0F0b21pY3Muc3RvcmUoSEVBUDMyLHdhaXRpbmdBc3luYz4+MiwxKX19O01vZHVsZVsiX19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0Il09X19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0O3ZhciBjaGVja01haWxib3g9KCk9Pnt2YXIgcHRocmVhZF9wdHI9X3B0aHJlYWRfc2VsZigpO2lmKHB0aHJlYWRfcHRyKXtfX2Vtc2NyaXB0ZW5fdGhyZWFkX21haWxib3hfYXdhaXQocHRocmVhZF9wdHIpO2NhbGxVc2VyQ2FsbGJhY2soX19lbXNjcmlwdGVuX2NoZWNrX21haWxib3gpfX07TW9kdWxlWyJjaGVja01haWxib3giXT1jaGVja01haWxib3g7dmFyIF9fZW1zY3JpcHRlbl9ub3RpZnlfbWFpbGJveF9wb3N0bWVzc2FnZT0odGFyZ2V0VGhyZWFkSWQsY3VyclRocmVhZElkLG1haW5UaHJlYWRJZCk9PntpZih0YXJnZXRUaHJlYWRJZD09Y3VyclRocmVhZElkKXtzZXRUaW1lb3V0KCgpPT5jaGVja01haWxib3goKSl9ZWxzZSBpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXtwb3N0TWVzc2FnZSh7InRhcmdldFRocmVhZCI6dGFyZ2V0VGhyZWFkSWQsImNtZCI6ImNoZWNrTWFpbGJveCJ9KX1lbHNle3ZhciB3b3JrZXI9UFRocmVhZC5wdGhyZWFkc1t0YXJnZXRUaHJlYWRJZF07aWYoIXdvcmtlcil7cmV0dXJufXdvcmtlci5wb3N0TWVzc2FnZSh7ImNtZCI6ImNoZWNrTWFpbGJveCJ9KX19O3ZhciBwcm94aWVkSlNDYWxsQXJncz1bXTt2YXIgX19lbXNjcmlwdGVuX3JlY2VpdmVfb25fbWFpbl90aHJlYWRfanM9KGluZGV4LGNhbGxpbmdUaHJlYWQsbnVtQ2FsbEFyZ3MsYXJncyk9Pntwcm94aWVkSlNDYWxsQXJncy5sZW5ndGg9bnVtQ2FsbEFyZ3M7dmFyIGI9YXJncz4+Mztmb3IodmFyIGk9MDtpPG51bUNhbGxBcmdzO2krKyl7cHJveGllZEpTQ2FsbEFyZ3NbaV09SEVBUEY2NFtiK2ldfXZhciBmdW5jPXByb3hpZWRGdW5jdGlvblRhYmxlW2luZGV4XTtQVGhyZWFkLmN1cnJlbnRQcm94aWVkT3BlcmF0aW9uQ2FsbGVyVGhyZWFkPWNhbGxpbmdUaHJlYWQ7dmFyIHJ0bj1mdW5jLmFwcGx5KG51bGwscHJveGllZEpTQ2FsbEFyZ3MpO1BUaHJlYWQuY3VycmVudFByb3hpZWRPcGVyYXRpb25DYWxsZXJUaHJlYWQ9MDtyZXR1cm4gcnRufTt2YXIgX19lbXNjcmlwdGVuX3RocmVhZF9zZXRfc3Ryb25ncmVmPXRocmVhZD0+e307dmFyIF9fZW12YWxfaW5jcmVmPWhhbmRsZT0+e2lmKGhhbmRsZT40KXtlbXZhbF9oYW5kbGVzLmdldChoYW5kbGUpLnJlZmNvdW50Kz0xfX07dmFyIHJlcXVpcmVSZWdpc3RlcmVkVHlwZT0ocmF3VHlwZSxodW1hbk5hbWUpPT57dmFyIGltcGw9cmVnaXN0ZXJlZFR5cGVzW3Jhd1R5cGVdO2lmKHVuZGVmaW5lZD09PWltcGwpe3Rocm93QmluZGluZ0Vycm9yKGh1bWFuTmFtZSsiIGhhcyB1bmtub3duIHR5cGUgIitnZXRUeXBlTmFtZShyYXdUeXBlKSl9cmV0dXJuIGltcGx9O3ZhciBfX2VtdmFsX3Rha2VfdmFsdWU9KHR5cGUsYXJnKT0+e3R5cGU9cmVxdWlyZVJlZ2lzdGVyZWRUeXBlKHR5cGUsIl9lbXZhbF90YWtlX3ZhbHVlIik7dmFyIHY9dHlwZVsicmVhZFZhbHVlRnJvbVBvaW50ZXIiXShhcmcpO3JldHVybiBFbXZhbC50b0hhbmRsZSh2KX07ZnVuY3Rpb24gX19tbWFwX2pzKGxlbixwcm90LGZsYWdzLGZkLG9mZnNldF9sb3csb2Zmc2V0X2hpZ2gsYWxsb2NhdGVkLGFkZHIpe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIHByb3h5VG9NYWluVGhyZWFkKDE0LDEsbGVuLHByb3QsZmxhZ3MsZmQsb2Zmc2V0X2xvdyxvZmZzZXRfaGlnaCxhbGxvY2F0ZWQsYWRkcik7dmFyIG9mZnNldD1jb252ZXJ0STMyUGFpclRvSTUzQ2hlY2tlZChvZmZzZXRfbG93LG9mZnNldF9oaWdoKTt0cnl7aWYoaXNOYU4ob2Zmc2V0KSlyZXR1cm4gNjE7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3ZhciByZXM9RlMubW1hcChzdHJlYW0sbGVuLG9mZnNldCxwcm90LGZsYWdzKTt2YXIgcHRyPXJlcy5wdHI7SEVBUDMyW2FsbG9jYXRlZD4+Ml09cmVzLmFsbG9jYXRlZDtIRUFQVTMyW2FkZHI+PjJdPXB0cjtyZXR1cm4gMH1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUubmFtZT09PSJFcnJub0Vycm9yIikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319ZnVuY3Rpb24gX19tdW5tYXBfanMoYWRkcixsZW4scHJvdCxmbGFncyxmZCxvZmZzZXRfbG93LG9mZnNldF9oaWdoKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBwcm94eVRvTWFpblRocmVhZCgxNSwxLGFkZHIsbGVuLHByb3QsZmxhZ3MsZmQsb2Zmc2V0X2xvdyxvZmZzZXRfaGlnaCk7dmFyIG9mZnNldD1jb252ZXJ0STMyUGFpclRvSTUzQ2hlY2tlZChvZmZzZXRfbG93LG9mZnNldF9oaWdoKTt0cnl7aWYoaXNOYU4ob2Zmc2V0KSlyZXR1cm4gNjE7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO2lmKHByb3QmMil7U1lTQ0FMTFMuZG9Nc3luYyhhZGRyLHN0cmVhbSxsZW4sZmxhZ3Msb2Zmc2V0KX1GUy5tdW5tYXAoc3RyZWFtKX1jYXRjaChlKXtpZih0eXBlb2YgRlM9PSJ1bmRlZmluZWQifHwhKGUubmFtZT09PSJFcnJub0Vycm9yIikpdGhyb3cgZTtyZXR1cm4tZS5lcnJub319dmFyIF9hYm9ydD0oKT0+e2Fib3J0KCIiKX07dmFyIHdhcm5PbmNlPXRleHQ9PntpZighd2Fybk9uY2Uuc2hvd24pd2Fybk9uY2Uuc2hvd249e307aWYoIXdhcm5PbmNlLnNob3duW3RleHRdKXt3YXJuT25jZS5zaG93blt0ZXh0XT0xO2Vycih0ZXh0KX19O3ZhciBfZW1zY3JpcHRlbl9jaGVja19ibG9ja2luZ19hbGxvd2VkPSgpPT57fTt2YXIgX2Vtc2NyaXB0ZW5fZGF0ZV9ub3c9KCk9PkRhdGUubm93KCk7dmFyIHJ1bnRpbWVLZWVwYWxpdmVQdXNoPSgpPT57cnVudGltZUtlZXBhbGl2ZUNvdW50ZXIrPTF9O3ZhciBfZW1zY3JpcHRlbl9leGl0X3dpdGhfbGl2ZV9ydW50aW1lPSgpPT57cnVudGltZUtlZXBhbGl2ZVB1c2goKTt0aHJvdyJ1bndpbmQifTt2YXIgZ2V0SGVhcE1heD0oKT0+SEVBUFU4Lmxlbmd0aDt2YXIgX2Vtc2NyaXB0ZW5fZ2V0X2hlYXBfbWF4PSgpPT5nZXRIZWFwTWF4KCk7dmFyIF9lbXNjcmlwdGVuX2dldF9ub3c7X2Vtc2NyaXB0ZW5fZ2V0X25vdz0oKT0+cGVyZm9ybWFuY2UudGltZU9yaWdpbitwZXJmb3JtYW5jZS5ub3coKTt2YXIgX2Vtc2NyaXB0ZW5fbnVtX2xvZ2ljYWxfY29yZXM9KCk9Pm5hdmlnYXRvclsiaGFyZHdhcmVDb25jdXJyZW5jeSJdO3ZhciBhYm9ydE9uQ2Fubm90R3Jvd01lbW9yeT1yZXF1ZXN0ZWRTaXplPT57YWJvcnQoIk9PTSIpfTt2YXIgX2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXA9cmVxdWVzdGVkU2l6ZT0+e3ZhciBvbGRTaXplPUhFQVBVOC5sZW5ndGg7cmVxdWVzdGVkU2l6ZT4+Pj0wO2Fib3J0T25DYW5ub3RHcm93TWVtb3J5KHJlcXVlc3RlZFNpemUpfTt2YXIgRU5WPXt9O3ZhciBnZXRFeGVjdXRhYmxlTmFtZT0oKT0+dGhpc1Byb2dyYW18fCIuL3RoaXMucHJvZ3JhbSI7dmFyIGdldEVudlN0cmluZ3M9KCk9PntpZighZ2V0RW52U3RyaW5ncy5zdHJpbmdzKXt2YXIgbGFuZz0odHlwZW9mIG5hdmlnYXRvcj09Im9iamVjdCImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fCJDIikucmVwbGFjZSgiLSIsIl8iKSsiLlVURi04Ijt2YXIgZW52PXsiVVNFUiI6IndlYl91c2VyIiwiTE9HTkFNRSI6IndlYl91c2VyIiwiUEFUSCI6Ii8iLCJQV0QiOiIvIiwiSE9NRSI6Ii9ob21lL3dlYl91c2VyIiwiTEFORyI6bGFuZywiXyI6Z2V0RXhlY3V0YWJsZU5hbWUoKX07Zm9yKHZhciB4IGluIEVOVil7aWYoRU5WW3hdPT09dW5kZWZpbmVkKWRlbGV0ZSBlbnZbeF07ZWxzZSBlbnZbeF09RU5WW3hdfXZhciBzdHJpbmdzPVtdO2Zvcih2YXIgeCBpbiBlbnYpe3N0cmluZ3MucHVzaChgJHt4fT0ke2Vudlt4XX1gKX1nZXRFbnZTdHJpbmdzLnN0cmluZ3M9c3RyaW5nc31yZXR1cm4gZ2V0RW52U3RyaW5ncy5zdHJpbmdzfTt2YXIgc3RyaW5nVG9Bc2NpaT0oc3RyLGJ1ZmZlcik9Pntmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXtIRUFQOFtidWZmZXIrKz4+MF09c3RyLmNoYXJDb2RlQXQoaSl9SEVBUDhbYnVmZmVyPj4wXT0wfTt2YXIgX2Vudmlyb25fZ2V0PWZ1bmN0aW9uKF9fZW52aXJvbixlbnZpcm9uX2J1Zil7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gcHJveHlUb01haW5UaHJlYWQoMTYsMSxfX2Vudmlyb24sZW52aXJvbl9idWYpO3ZhciBidWZTaXplPTA7Z2V0RW52U3RyaW5ncygpLmZvckVhY2goKHN0cmluZyxpKT0+e3ZhciBwdHI9ZW52aXJvbl9idWYrYnVmU2l6ZTtIRUFQVTMyW19fZW52aXJvbitpKjQ+PjJdPXB0cjtzdHJpbmdUb0FzY2lpKHN0cmluZyxwdHIpO2J1ZlNpemUrPXN0cmluZy5sZW5ndGgrMX0pO3JldHVybiAwfTt2YXIgX2Vudmlyb25fc2l6ZXNfZ2V0PWZ1bmN0aW9uKHBlbnZpcm9uX2NvdW50LHBlbnZpcm9uX2J1Zl9zaXplKXtpZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXJldHVybiBwcm94eVRvTWFpblRocmVhZCgxNywxLHBlbnZpcm9uX2NvdW50LHBlbnZpcm9uX2J1Zl9zaXplKTt2YXIgc3RyaW5ncz1nZXRFbnZTdHJpbmdzKCk7SEVBUFUzMltwZW52aXJvbl9jb3VudD4+Ml09c3RyaW5ncy5sZW5ndGg7dmFyIGJ1ZlNpemU9MDtzdHJpbmdzLmZvckVhY2goc3RyaW5nPT5idWZTaXplKz1zdHJpbmcubGVuZ3RoKzEpO0hFQVBVMzJbcGVudmlyb25fYnVmX3NpemU+PjJdPWJ1ZlNpemU7cmV0dXJuIDB9O2Z1bmN0aW9uIF9mZF9jbG9zZShmZCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gcHJveHlUb01haW5UaHJlYWQoMTgsMSxmZCk7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTtGUy5jbG9zZShzdHJlYW0pO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZS5uYW1lPT09IkVycm5vRXJyb3IiKSl0aHJvdyBlO3JldHVybiBlLmVycm5vfX12YXIgZG9SZWFkdj0oc3RyZWFtLGlvdixpb3ZjbnQsb2Zmc2V0KT0+e3ZhciByZXQ9MDtmb3IodmFyIGk9MDtpPGlvdmNudDtpKyspe3ZhciBwdHI9SEVBUFUzMltpb3Y+PjJdO3ZhciBsZW49SEVBUFUzMltpb3YrND4+Ml07aW92Kz04O3ZhciBjdXJyPUZTLnJlYWQoc3RyZWFtLEhFQVA4LHB0cixsZW4sb2Zmc2V0KTtpZihjdXJyPDApcmV0dXJuLTE7cmV0Kz1jdXJyO2lmKGN1cnI8bGVuKWJyZWFrO2lmKHR5cGVvZiBvZmZzZXQhPT0idW5kZWZpbmVkIil7b2Zmc2V0Kz1jdXJyfX1yZXR1cm4gcmV0fTtmdW5jdGlvbiBfZmRfcmVhZChmZCxpb3YsaW92Y250LHBudW0pe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIHByb3h5VG9NYWluVGhyZWFkKDE5LDEsZmQsaW92LGlvdmNudCxwbnVtKTt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3ZhciBudW09ZG9SZWFkdihzdHJlYW0saW92LGlvdmNudCk7SEVBUFUzMltwbnVtPj4yXT1udW07cmV0dXJuIDB9Y2F0Y2goZSl7aWYodHlwZW9mIEZTPT0idW5kZWZpbmVkInx8IShlLm5hbWU9PT0iRXJybm9FcnJvciIpKXRocm93IGU7cmV0dXJuIGUuZXJybm99fWZ1bmN0aW9uIF9mZF9zZWVrKGZkLG9mZnNldF9sb3csb2Zmc2V0X2hpZ2gsd2hlbmNlLG5ld09mZnNldCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gcHJveHlUb01haW5UaHJlYWQoMjAsMSxmZCxvZmZzZXRfbG93LG9mZnNldF9oaWdoLHdoZW5jZSxuZXdPZmZzZXQpO3ZhciBvZmZzZXQ9Y29udmVydEkzMlBhaXJUb0k1M0NoZWNrZWQob2Zmc2V0X2xvdyxvZmZzZXRfaGlnaCk7dHJ5e2lmKGlzTmFOKG9mZnNldCkpcmV0dXJuIDYxO3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTtGUy5sbHNlZWsoc3RyZWFtLG9mZnNldCx3aGVuY2UpO3RlbXBJNjQ9W3N0cmVhbS5wb3NpdGlvbj4+PjAsKHRlbXBEb3VibGU9c3RyZWFtLnBvc2l0aW9uLCtNYXRoLmFicyh0ZW1wRG91YmxlKT49MT90ZW1wRG91YmxlPjA/K01hdGguZmxvb3IodGVtcERvdWJsZS80Mjk0OTY3Mjk2KT4+PjA6fn4rTWF0aC5jZWlsKCh0ZW1wRG91YmxlLSsofn50ZW1wRG91YmxlPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKV0sSEVBUDMyW25ld09mZnNldD4+Ml09dGVtcEk2NFswXSxIRUFQMzJbbmV3T2Zmc2V0KzQ+PjJdPXRlbXBJNjRbMV07aWYoc3RyZWFtLmdldGRlbnRzJiZvZmZzZXQ9PT0wJiZ3aGVuY2U9PT0wKXN0cmVhbS5nZXRkZW50cz1udWxsO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZS5uYW1lPT09IkVycm5vRXJyb3IiKSl0aHJvdyBlO3JldHVybiBlLmVycm5vfX1mdW5jdGlvbiBfZmRfc3luYyhmZCl7aWYoRU5WSVJPTk1FTlRfSVNfUFRIUkVBRClyZXR1cm4gcHJveHlUb01haW5UaHJlYWQoMjEsMSxmZCk7dHJ5e3ZhciBzdHJlYW09U1lTQ0FMTFMuZ2V0U3RyZWFtRnJvbUZEKGZkKTtpZihzdHJlYW0uc3RyZWFtX29wcyYmc3RyZWFtLnN0cmVhbV9vcHMuZnN5bmMpe3JldHVybiBzdHJlYW0uc3RyZWFtX29wcy5mc3luYyhzdHJlYW0pfXJldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZS5uYW1lPT09IkVycm5vRXJyb3IiKSl0aHJvdyBlO3JldHVybiBlLmVycm5vfX12YXIgZG9Xcml0ZXY9KHN0cmVhbSxpb3YsaW92Y250LG9mZnNldCk9Pnt2YXIgcmV0PTA7Zm9yKHZhciBpPTA7aTxpb3ZjbnQ7aSsrKXt2YXIgcHRyPUhFQVBVMzJbaW92Pj4yXTt2YXIgbGVuPUhFQVBVMzJbaW92KzQ+PjJdO2lvdis9ODt2YXIgY3Vycj1GUy53cml0ZShzdHJlYW0sSEVBUDgscHRyLGxlbixvZmZzZXQpO2lmKGN1cnI8MClyZXR1cm4tMTtyZXQrPWN1cnI7aWYodHlwZW9mIG9mZnNldCE9PSJ1bmRlZmluZWQiKXtvZmZzZXQrPWN1cnJ9fXJldHVybiByZXR9O2Z1bmN0aW9uIF9mZF93cml0ZShmZCxpb3YsaW92Y250LHBudW0pe2lmKEVOVklST05NRU5UX0lTX1BUSFJFQUQpcmV0dXJuIHByb3h5VG9NYWluVGhyZWFkKDIyLDEsZmQsaW92LGlvdmNudCxwbnVtKTt0cnl7dmFyIHN0cmVhbT1TWVNDQUxMUy5nZXRTdHJlYW1Gcm9tRkQoZmQpO3ZhciBudW09ZG9Xcml0ZXYoc3RyZWFtLGlvdixpb3ZjbnQpO0hFQVBVMzJbcG51bT4+Ml09bnVtO3JldHVybiAwfWNhdGNoKGUpe2lmKHR5cGVvZiBGUz09InVuZGVmaW5lZCJ8fCEoZS5uYW1lPT09IkVycm5vRXJyb3IiKSl0aHJvdyBlO3JldHVybiBlLmVycm5vfX12YXIgX2dldGVudHJvcHk9KGJ1ZmZlcixzaXplKT0+e3JhbmRvbUZpbGwoSEVBUFU4LnN1YmFycmF5KGJ1ZmZlcixidWZmZXIrc2l6ZSkpO3JldHVybiAwfTt2YXIgaXNMZWFwWWVhcj15ZWFyPT55ZWFyJTQ9PT0wJiYoeWVhciUxMDAhPT0wfHx5ZWFyJTQwMD09PTApO3ZhciBhcnJheVN1bT0oYXJyYXksaW5kZXgpPT57dmFyIHN1bT0wO2Zvcih2YXIgaT0wO2k8PWluZGV4O3N1bSs9YXJyYXlbaSsrXSl7fXJldHVybiBzdW19O3ZhciBNT05USF9EQVlTX0xFQVA9WzMxLDI5LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXTt2YXIgTU9OVEhfREFZU19SRUdVTEFSPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07dmFyIGFkZERheXM9KGRhdGUsZGF5cyk9Pnt2YXIgbmV3RGF0ZT1uZXcgRGF0ZShkYXRlLmdldFRpbWUoKSk7d2hpbGUoZGF5cz4wKXt2YXIgbGVhcD1pc0xlYXBZZWFyKG5ld0RhdGUuZ2V0RnVsbFllYXIoKSk7dmFyIGN1cnJlbnRNb250aD1uZXdEYXRlLmdldE1vbnRoKCk7dmFyIGRheXNJbkN1cnJlbnRNb250aD0obGVhcD9NT05USF9EQVlTX0xFQVA6TU9OVEhfREFZU19SRUdVTEFSKVtjdXJyZW50TW9udGhdO2lmKGRheXM+ZGF5c0luQ3VycmVudE1vbnRoLW5ld0RhdGUuZ2V0RGF0ZSgpKXtkYXlzLT1kYXlzSW5DdXJyZW50TW9udGgtbmV3RGF0ZS5nZXREYXRlKCkrMTtuZXdEYXRlLnNldERhdGUoMSk7aWYoY3VycmVudE1vbnRoPDExKXtuZXdEYXRlLnNldE1vbnRoKGN1cnJlbnRNb250aCsxKX1lbHNle25ld0RhdGUuc2V0TW9udGgoMCk7bmV3RGF0ZS5zZXRGdWxsWWVhcihuZXdEYXRlLmdldEZ1bGxZZWFyKCkrMSl9fWVsc2V7bmV3RGF0ZS5zZXREYXRlKG5ld0RhdGUuZ2V0RGF0ZSgpK2RheXMpO3JldHVybiBuZXdEYXRlfX1yZXR1cm4gbmV3RGF0ZX07dmFyIHdyaXRlQXJyYXlUb01lbW9yeT0oYXJyYXksYnVmZmVyKT0+e0hFQVA4LnNldChhcnJheSxidWZmZXIpfTt2YXIgX3N0cmZ0aW1lPShzLG1heHNpemUsZm9ybWF0LHRtKT0+e3ZhciB0bV96b25lPUhFQVBVMzJbdG0rNDA+PjJdO3ZhciBkYXRlPXt0bV9zZWM6SEVBUDMyW3RtPj4yXSx0bV9taW46SEVBUDMyW3RtKzQ+PjJdLHRtX2hvdXI6SEVBUDMyW3RtKzg+PjJdLHRtX21kYXk6SEVBUDMyW3RtKzEyPj4yXSx0bV9tb246SEVBUDMyW3RtKzE2Pj4yXSx0bV95ZWFyOkhFQVAzMlt0bSsyMD4+Ml0sdG1fd2RheTpIRUFQMzJbdG0rMjQ+PjJdLHRtX3lkYXk6SEVBUDMyW3RtKzI4Pj4yXSx0bV9pc2RzdDpIRUFQMzJbdG0rMzI+PjJdLHRtX2dtdG9mZjpIRUFQMzJbdG0rMzY+PjJdLHRtX3pvbmU6dG1fem9uZT9VVEY4VG9TdHJpbmcodG1fem9uZSk6IiJ9O3ZhciBwYXR0ZXJuPVVURjhUb1N0cmluZyhmb3JtYXQpO3ZhciBFWFBBTlNJT05fUlVMRVNfMT17IiVjIjoiJWEgJWIgJWQgJUg6JU06JVMgJVkiLCIlRCI6IiVtLyVkLyV5IiwiJUYiOiIlWS0lbS0lZCIsIiVoIjoiJWIiLCIlciI6IiVJOiVNOiVTICVwIiwiJVIiOiIlSDolTSIsIiVUIjoiJUg6JU06JVMiLCIleCI6IiVtLyVkLyV5IiwiJVgiOiIlSDolTTolUyIsIiVFYyI6IiVjIiwiJUVDIjoiJUMiLCIlRXgiOiIlbS8lZC8leSIsIiVFWCI6IiVIOiVNOiVTIiwiJUV5IjoiJXkiLCIlRVkiOiIlWSIsIiVPZCI6IiVkIiwiJU9lIjoiJWUiLCIlT0giOiIlSCIsIiVPSSI6IiVJIiwiJU9tIjoiJW0iLCIlT00iOiIlTSIsIiVPUyI6IiVTIiwiJU91IjoiJXUiLCIlT1UiOiIlVSIsIiVPViI6IiVWIiwiJU93IjoiJXciLCIlT1ciOiIlVyIsIiVPeSI6IiV5In07Zm9yKHZhciBydWxlIGluIEVYUEFOU0lPTl9SVUxFU18xKXtwYXR0ZXJuPXBhdHRlcm4ucmVwbGFjZShuZXcgUmVnRXhwKHJ1bGUsImciKSxFWFBBTlNJT05fUlVMRVNfMVtydWxlXSl9dmFyIFdFRUtEQVlTPVsiU3VuZGF5IiwiTW9uZGF5IiwiVHVlc2RheSIsIldlZG5lc2RheSIsIlRodXJzZGF5IiwiRnJpZGF5IiwiU2F0dXJkYXkiXTt2YXIgTU9OVEhTPVsiSmFudWFyeSIsIkZlYnJ1YXJ5IiwiTWFyY2giLCJBcHJpbCIsIk1heSIsIkp1bmUiLCJKdWx5IiwiQXVndXN0IiwiU2VwdGVtYmVyIiwiT2N0b2JlciIsIk5vdmVtYmVyIiwiRGVjZW1iZXIiXTtmdW5jdGlvbiBsZWFkaW5nU29tZXRoaW5nKHZhbHVlLGRpZ2l0cyxjaGFyYWN0ZXIpe3ZhciBzdHI9dHlwZW9mIHZhbHVlPT0ibnVtYmVyIj92YWx1ZS50b1N0cmluZygpOnZhbHVlfHwiIjt3aGlsZShzdHIubGVuZ3RoPGRpZ2l0cyl7c3RyPWNoYXJhY3RlclswXStzdHJ9cmV0dXJuIHN0cn1mdW5jdGlvbiBsZWFkaW5nTnVsbHModmFsdWUsZGlnaXRzKXtyZXR1cm4gbGVhZGluZ1NvbWV0aGluZyh2YWx1ZSxkaWdpdHMsIjAiKX1mdW5jdGlvbiBjb21wYXJlQnlEYXkoZGF0ZTEsZGF0ZTIpe2Z1bmN0aW9uIHNnbih2YWx1ZSl7cmV0dXJuIHZhbHVlPDA/LTE6dmFsdWU+MD8xOjB9dmFyIGNvbXBhcmU7aWYoKGNvbXBhcmU9c2duKGRhdGUxLmdldEZ1bGxZZWFyKCktZGF0ZTIuZ2V0RnVsbFllYXIoKSkpPT09MCl7aWYoKGNvbXBhcmU9c2duKGRhdGUxLmdldE1vbnRoKCktZGF0ZTIuZ2V0TW9udGgoKSkpPT09MCl7Y29tcGFyZT1zZ24oZGF0ZTEuZ2V0RGF0ZSgpLWRhdGUyLmdldERhdGUoKSl9fXJldHVybiBjb21wYXJlfWZ1bmN0aW9uIGdldEZpcnN0V2Vla1N0YXJ0RGF0ZShqYW5Gb3VydGgpe3N3aXRjaChqYW5Gb3VydGguZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCktMSwxMSwyOSk7Y2FzZSAxOnJldHVybiBqYW5Gb3VydGg7Y2FzZSAyOnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoamFuRm91cnRoLmdldEZ1bGxZZWFyKCksMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLDAsMSk7Y2FzZSA1OnJldHVybiBuZXcgRGF0ZShqYW5Gb3VydGguZ2V0RnVsbFllYXIoKS0xLDExLDMxKTtjYXNlIDY6cmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBnZXRXZWVrQmFzZWRZZWFyKGRhdGUpe3ZhciB0aGlzRGF0ZT1hZGREYXlzKG5ldyBEYXRlKGRhdGUudG1feWVhcisxOTAwLDAsMSksZGF0ZS50bV95ZGF5KTt2YXIgamFuRm91cnRoVGhpc1llYXI9bmV3IERhdGUodGhpc0RhdGUuZ2V0RnVsbFllYXIoKSwwLDQpO3ZhciBqYW5Gb3VydGhOZXh0WWVhcj1uZXcgRGF0ZSh0aGlzRGF0ZS5nZXRGdWxsWWVhcigpKzEsMCw0KTt2YXIgZmlyc3RXZWVrU3RhcnRUaGlzWWVhcj1nZXRGaXJzdFdlZWtTdGFydERhdGUoamFuRm91cnRoVGhpc1llYXIpO3ZhciBmaXJzdFdlZWtTdGFydE5leHRZZWFyPWdldEZpcnN0V2Vla1N0YXJ0RGF0ZShqYW5Gb3VydGhOZXh0WWVhcik7aWYoY29tcGFyZUJ5RGF5KGZpcnN0V2Vla1N0YXJ0VGhpc1llYXIsdGhpc0RhdGUpPD0wKXtpZihjb21wYXJlQnlEYXkoZmlyc3RXZWVrU3RhcnROZXh0WWVhcix0aGlzRGF0ZSk8PTApe3JldHVybiB0aGlzRGF0ZS5nZXRGdWxsWWVhcigpKzF9cmV0dXJuIHRoaXNEYXRlLmdldEZ1bGxZZWFyKCl9cmV0dXJuIHRoaXNEYXRlLmdldEZ1bGxZZWFyKCktMX12YXIgRVhQQU5TSU9OX1JVTEVTXzI9eyIlYSI6ZGF0ZT0+V0VFS0RBWVNbZGF0ZS50bV93ZGF5XS5zdWJzdHJpbmcoMCwzKSwiJUEiOmRhdGU9PldFRUtEQVlTW2RhdGUudG1fd2RheV0sIiViIjpkYXRlPT5NT05USFNbZGF0ZS50bV9tb25dLnN1YnN0cmluZygwLDMpLCIlQiI6ZGF0ZT0+TU9OVEhTW2RhdGUudG1fbW9uXSwiJUMiOmRhdGU9Pnt2YXIgeWVhcj1kYXRlLnRtX3llYXIrMTkwMDtyZXR1cm4gbGVhZGluZ051bGxzKHllYXIvMTAwfDAsMil9LCIlZCI6ZGF0ZT0+bGVhZGluZ051bGxzKGRhdGUudG1fbWRheSwyKSwiJWUiOmRhdGU9PmxlYWRpbmdTb21ldGhpbmcoZGF0ZS50bV9tZGF5LDIsIiAiKSwiJWciOmRhdGU9PmdldFdlZWtCYXNlZFllYXIoZGF0ZSkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksIiVHIjpkYXRlPT5nZXRXZWVrQmFzZWRZZWFyKGRhdGUpLCIlSCI6ZGF0ZT0+bGVhZGluZ051bGxzKGRhdGUudG1faG91ciwyKSwiJUkiOmRhdGU9Pnt2YXIgdHdlbHZlSG91cj1kYXRlLnRtX2hvdXI7aWYodHdlbHZlSG91cj09MCl0d2VsdmVIb3VyPTEyO2Vsc2UgaWYodHdlbHZlSG91cj4xMil0d2VsdmVIb3VyLT0xMjtyZXR1cm4gbGVhZGluZ051bGxzKHR3ZWx2ZUhvdXIsMil9LCIlaiI6ZGF0ZT0+bGVhZGluZ051bGxzKGRhdGUudG1fbWRheSthcnJheVN1bShpc0xlYXBZZWFyKGRhdGUudG1feWVhcisxOTAwKT9NT05USF9EQVlTX0xFQVA6TU9OVEhfREFZU19SRUdVTEFSLGRhdGUudG1fbW9uLTEpLDMpLCIlbSI6ZGF0ZT0+bGVhZGluZ051bGxzKGRhdGUudG1fbW9uKzEsMiksIiVNIjpkYXRlPT5sZWFkaW5nTnVsbHMoZGF0ZS50bV9taW4sMiksIiVuIjooKT0+IlxuIiwiJXAiOmRhdGU9PntpZihkYXRlLnRtX2hvdXI+PTAmJmRhdGUudG1faG91cjwxMil7cmV0dXJuIkFNIn1yZXR1cm4iUE0ifSwiJVMiOmRhdGU9PmxlYWRpbmdOdWxscyhkYXRlLnRtX3NlYywyKSwiJXQiOigpPT4iXHQiLCIldSI6ZGF0ZT0+ZGF0ZS50bV93ZGF5fHw3LCIlVSI6ZGF0ZT0+e3ZhciBkYXlzPWRhdGUudG1feWRheSs3LWRhdGUudG1fd2RheTtyZXR1cm4gbGVhZGluZ051bGxzKE1hdGguZmxvb3IoZGF5cy83KSwyKX0sIiVWIjpkYXRlPT57dmFyIHZhbD1NYXRoLmZsb29yKChkYXRlLnRtX3lkYXkrNy0oZGF0ZS50bV93ZGF5KzYpJTcpLzcpO2lmKChkYXRlLnRtX3dkYXkrMzcxLWRhdGUudG1feWRheS0yKSU3PD0yKXt2YWwrK31pZighdmFsKXt2YWw9NTI7dmFyIGRlYzMxPShkYXRlLnRtX3dkYXkrNy1kYXRlLnRtX3lkYXktMSklNztpZihkZWMzMT09NHx8ZGVjMzE9PTUmJmlzTGVhcFllYXIoZGF0ZS50bV95ZWFyJTQwMC0xKSl7dmFsKyt9fWVsc2UgaWYodmFsPT01Myl7dmFyIGphbjE9KGRhdGUudG1fd2RheSszNzEtZGF0ZS50bV95ZGF5KSU3O2lmKGphbjEhPTQmJihqYW4xIT0zfHwhaXNMZWFwWWVhcihkYXRlLnRtX3llYXIpKSl2YWw9MX1yZXR1cm4gbGVhZGluZ051bGxzKHZhbCwyKX0sIiV3IjpkYXRlPT5kYXRlLnRtX3dkYXksIiVXIjpkYXRlPT57dmFyIGRheXM9ZGF0ZS50bV95ZGF5KzctKGRhdGUudG1fd2RheSs2KSU3O3JldHVybiBsZWFkaW5nTnVsbHMoTWF0aC5mbG9vcihkYXlzLzcpLDIpfSwiJXkiOmRhdGU9PihkYXRlLnRtX3llYXIrMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksIiVZIjpkYXRlPT5kYXRlLnRtX3llYXIrMTkwMCwiJXoiOmRhdGU9Pnt2YXIgb2ZmPWRhdGUudG1fZ210b2ZmO3ZhciBhaGVhZD1vZmY+PTA7b2ZmPU1hdGguYWJzKG9mZikvNjA7b2ZmPW9mZi82MCoxMDArb2ZmJTYwO3JldHVybihhaGVhZD8iKyI6Ii0iKStTdHJpbmcoIjAwMDAiK29mZikuc2xpY2UoLTQpfSwiJVoiOmRhdGU9PmRhdGUudG1fem9uZSwiJSUiOigpPT4iJSJ9O3BhdHRlcm49cGF0dGVybi5yZXBsYWNlKC8lJS9nLCJcMFwwIik7Zm9yKHZhciBydWxlIGluIEVYUEFOU0lPTl9SVUxFU18yKXtpZihwYXR0ZXJuLmluY2x1ZGVzKHJ1bGUpKXtwYXR0ZXJuPXBhdHRlcm4ucmVwbGFjZShuZXcgUmVnRXhwKHJ1bGUsImciKSxFWFBBTlNJT05fUlVMRVNfMltydWxlXShkYXRlKSl9fXBhdHRlcm49cGF0dGVybi5yZXBsYWNlKC9cMFwwL2csIiUiKTt2YXIgYnl0ZXM9aW50QXJyYXlGcm9tU3RyaW5nKHBhdHRlcm4sZmFsc2UpO2lmKGJ5dGVzLmxlbmd0aD5tYXhzaXplKXtyZXR1cm4gMH13cml0ZUFycmF5VG9NZW1vcnkoYnl0ZXMscyk7cmV0dXJuIGJ5dGVzLmxlbmd0aC0xfTt2YXIgX3N0cmZ0aW1lX2w9KHMsbWF4c2l6ZSxmb3JtYXQsdG0sbG9jKT0+X3N0cmZ0aW1lKHMsbWF4c2l6ZSxmb3JtYXQsdG0pO1BUaHJlYWQuaW5pdCgpO3ZhciBGU05vZGU9ZnVuY3Rpb24ocGFyZW50LG5hbWUsbW9kZSxyZGV2KXtpZighcGFyZW50KXtwYXJlbnQ9dGhpc310aGlzLnBhcmVudD1wYXJlbnQ7dGhpcy5tb3VudD1wYXJlbnQubW91bnQ7dGhpcy5tb3VudGVkPW51bGw7dGhpcy5pZD1GUy5uZXh0SW5vZGUrKzt0aGlzLm5hbWU9bmFtZTt0aGlzLm1vZGU9bW9kZTt0aGlzLm5vZGVfb3BzPXt9O3RoaXMuc3RyZWFtX29wcz17fTt0aGlzLnJkZXY9cmRldn07dmFyIHJlYWRNb2RlPTI5Mnw3Mzt2YXIgd3JpdGVNb2RlPTE0NjtPYmplY3QuZGVmaW5lUHJvcGVydGllcyhGU05vZGUucHJvdG90eXBlLHtyZWFkOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy5tb2RlJnJlYWRNb2RlKT09PXJlYWRNb2RlfSxzZXQ6ZnVuY3Rpb24odmFsKXt2YWw/dGhpcy5tb2RlfD1yZWFkTW9kZTp0aGlzLm1vZGUmPX5yZWFkTW9kZX19LHdyaXRlOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy5tb2RlJndyaXRlTW9kZSk9PT13cml0ZU1vZGV9LHNldDpmdW5jdGlvbih2YWwpe3ZhbD90aGlzLm1vZGV8PXdyaXRlTW9kZTp0aGlzLm1vZGUmPX53cml0ZU1vZGV9fSxpc0ZvbGRlcjp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIEZTLmlzRGlyKHRoaXMubW9kZSl9fSxpc0RldmljZTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIEZTLmlzQ2hyZGV2KHRoaXMubW9kZSl9fX0pO0ZTLkZTTm9kZT1GU05vZGU7RlMuY3JlYXRlUHJlbG9hZGVkRmlsZT1GU19jcmVhdGVQcmVsb2FkZWRGaWxlO0ZTLnN0YXRpY0luaXQoKTtlbWJpbmRfaW5pdF9jaGFyQ29kZXMoKTtCaW5kaW5nRXJyb3I9TW9kdWxlWyJCaW5kaW5nRXJyb3IiXT1jbGFzcyBCaW5kaW5nRXJyb3IgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihtZXNzYWdlKXtzdXBlcihtZXNzYWdlKTt0aGlzLm5hbWU9IkJpbmRpbmdFcnJvciJ9fTtJbnRlcm5hbEVycm9yPU1vZHVsZVsiSW50ZXJuYWxFcnJvciJdPWNsYXNzIEludGVybmFsRXJyb3IgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihtZXNzYWdlKXtzdXBlcihtZXNzYWdlKTt0aGlzLm5hbWU9IkludGVybmFsRXJyb3IifX07aW5pdF9DbGFzc0hhbmRsZSgpO2luaXRfZW1iaW5kKCk7aW5pdF9SZWdpc3RlcmVkUG9pbnRlcigpO1VuYm91bmRUeXBlRXJyb3I9TW9kdWxlWyJVbmJvdW5kVHlwZUVycm9yIl09ZXh0ZW5kRXJyb3IoRXJyb3IsIlVuYm91bmRUeXBlRXJyb3IiKTtoYW5kbGVBbGxvY2F0b3JJbml0KCk7aW5pdF9lbXZhbCgpO3ZhciBwcm94aWVkRnVuY3Rpb25UYWJsZT1bX3Byb2NfZXhpdCxleGl0T25NYWluVGhyZWFkLHB0aHJlYWRDcmVhdGVQcm94aWVkLF9fX3N5c2NhbGxfZmNudGw2NCxfX19zeXNjYWxsX2ZzdGF0NjQsX19fc3lzY2FsbF9mdHJ1bmNhdGU2NCxfX19zeXNjYWxsX2lvY3RsLF9fX3N5c2NhbGxfbHN0YXQ2NCxfX19zeXNjYWxsX25ld2ZzdGF0YXQsX19fc3lzY2FsbF9vcGVuYXQsX19fc3lzY2FsbF9yZWFkbGlua2F0LF9fX3N5c2NhbGxfcmVuYW1lYXQsX19fc3lzY2FsbF9zdGF0NjQsX19fc3lzY2FsbF91bmxpbmthdCxfX21tYXBfanMsX19tdW5tYXBfanMsX2Vudmlyb25fZ2V0LF9lbnZpcm9uX3NpemVzX2dldCxfZmRfY2xvc2UsX2ZkX3JlYWQsX2ZkX3NlZWssX2ZkX3N5bmMsX2ZkX3dyaXRlXTt2YXIgd2FzbUltcG9ydHM9e2I6X19fYXNzZXJ0X2ZhaWwsdzpfX19jeGFfYmVnaW5fY2F0Y2gsdjpfX19jeGFfZW5kX2NhdGNoLGQ6X19fY3hhX2ZpbmRfbWF0Y2hpbmdfY2F0Y2hfMixrOl9fX2N4YV9maW5kX21hdGNoaW5nX2NhdGNoXzMseWE6X19fY3hhX3JldGhyb3csbjpfX19jeGFfdGhyb3csaWE6X19fZW1zY3JpcHRlbl9pbml0X21haW5fdGhyZWFkX2pzLEU6X19fZW1zY3JpcHRlbl90aHJlYWRfY2xlYW51cCxmYTpfX19wdGhyZWFkX2NyZWF0ZV9qcyxoOl9fX3Jlc3VtZUV4Y2VwdGlvbixvYTpfX19zeXNjYWxsX2ZzdGF0NjQsVzpfX19zeXNjYWxsX2Z0cnVuY2F0ZTY0LG1hOl9fX3N5c2NhbGxfbmV3ZnN0YXRhdCxwYTpfX19zeXNjYWxsX29wZW5hdCxlYTpfX19zeXNjYWxsX3JlYWRsaW5rYXQsZGE6X19fc3lzY2FsbF9yZW5hbWVhdCxuYTpfX19zeXNjYWxsX3N0YXQ2NCxhYTpfX19zeXNjYWxsX3VubGlua2F0LFg6X19lbWJpbmRfcmVnaXN0ZXJfYmlnaW50LHVhOl9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2wsUzpfX2VtYmluZF9yZWdpc3Rlcl9jbGFzcyxSOl9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2NvbnN0cnVjdG9yLG06X19lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfZnVuY3Rpb24sdGE6X19lbWJpbmRfcmVnaXN0ZXJfZW12YWwsSzpfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdCxxOl9fZW1iaW5kX3JlZ2lzdGVyX2ludGVnZXIsbDpfX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldyxKOl9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmcsQjpfX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZyx2YTpfX2VtYmluZF9yZWdpc3Rlcl92b2lkLHNhOl9fZW1zY3JpcHRlbl9nZXRfbm93X2lzX21vbm90b25pYyxiYTpfX2Vtc2NyaXB0ZW5fbm90aWZ5X21haWxib3hfcG9zdG1lc3NhZ2UsZ2E6X19lbXNjcmlwdGVuX3JlY2VpdmVfb25fbWFpbl90aHJlYWRfanMsaGE6X19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0LHJhOl9fZW1zY3JpcHRlbl90aHJlYWRfc2V0X3N0cm9uZ3JlZixDYTpfX2VtdmFsX2RlY3JlZixEYTpfX2VtdmFsX2luY3JlZixzOl9fZW12YWxfdGFrZV92YWx1ZSxUOl9fbW1hcF9qcyxVOl9fbXVubWFwX2pzLGM6X2Fib3J0LEY6X2Vtc2NyaXB0ZW5fY2hlY2tfYmxvY2tpbmdfYWxsb3dlZCxIOl9lbXNjcmlwdGVuX2RhdGVfbm93LHFhOl9lbXNjcmlwdGVuX2V4aXRfd2l0aF9saXZlX3J1bnRpbWUsY2E6X2Vtc2NyaXB0ZW5fZ2V0X2hlYXBfbWF4LHA6X2Vtc2NyaXB0ZW5fZ2V0X25vdyxNOl9lbXNjcmlwdGVuX251bV9sb2dpY2FsX2NvcmVzLCQ6X2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXAsamE6X2Vudmlyb25fZ2V0LGthOl9lbnZpcm9uX3NpemVzX2dldCxMOl9leGl0LEk6X2ZkX2Nsb3NlLEc6X2ZkX3JlYWQsVjpfZmRfc2VlayxsYTpfZmRfc3luYyxBOl9mZF93cml0ZSxaOl9nZXRlbnRyb3B5LEJhOmludm9rZV9maSxEOmludm9rZV9pLGc6aW52b2tlX2lpLHhhOmludm9rZV9paWRpaSxBYTppbnZva2VfaWlmLGU6aW52b2tlX2lpaSxmOmludm9rZV9paWlpLHo6aW52b2tlX2lpaWlpLHk6aW52b2tlX2lpaWlpaSxROmludm9rZV9paWlpaWlpLFk6aW52b2tlX2lpaixyOmludm9rZV92LGo6aW52b2tlX3ZpLGk6aW52b2tlX3ZpaSx0Omludm9rZV92aWlkLEM6aW52b2tlX3ZpaWRpLG86aW52b2tlX3ZpaWksemE6aW52b2tlX3ZpaWlkaWlpLHU6aW52b2tlX3ZpaWlpLE86aW52b2tlX3ZpaWlpZGksUDppbnZva2VfdmlpaWlpLHg6aW52b2tlX3ZpaWlpaWlpZGksTjppbnZva2VfdmlpaWlpaWlpLGE6d2FzbU1lbW9yeXx8TW9kdWxlWyJ3YXNtTWVtb3J5Il0sXzpfc3RyZnRpbWVfbCx3YTp4bm5Mb2FkV2FzbU1vZHVsZUpTfTt2YXIgd2FzbUV4cG9ydHM9Y3JlYXRlV2FzbSgpO3ZhciBfX193YXNtX2NhbGxfY3RvcnM9KCk9PihfX193YXNtX2NhbGxfY3RvcnM9d2FzbUV4cG9ydHNbIkVhIl0pKCk7dmFyIF9wdGhyZWFkX3NlbGY9TW9kdWxlWyJfcHRocmVhZF9zZWxmIl09KCk9PihfcHRocmVhZF9zZWxmPU1vZHVsZVsiX3B0aHJlYWRfc2VsZiJdPXdhc21FeHBvcnRzWyJGYSJdKSgpO3ZhciBfbWFsbG9jPWEwPT4oX21hbGxvYz13YXNtRXhwb3J0c1siSGEiXSkoYTApO3ZhciBfZnJlZT1hMD0+KF9mcmVlPXdhc21FeHBvcnRzWyJJYSJdKShhMCk7dmFyIF9fX2Vycm5vX2xvY2F0aW9uPSgpPT4oX19fZXJybm9fbG9jYXRpb249d2FzbUV4cG9ydHNbIkphIl0pKCk7dmFyIF9fZW1zY3JpcHRlbl90bHNfaW5pdD1Nb2R1bGVbIl9fZW1zY3JpcHRlbl90bHNfaW5pdCJdPSgpPT4oX19lbXNjcmlwdGVuX3Rsc19pbml0PU1vZHVsZVsiX19lbXNjcmlwdGVuX3Rsc19pbml0Il09d2FzbUV4cG9ydHNbIkthIl0pKCk7dmFyIF9lbXNjcmlwdGVuX2J1aWx0aW5fbWVtYWxpZ249KGEwLGExKT0+KF9lbXNjcmlwdGVuX2J1aWx0aW5fbWVtYWxpZ249d2FzbUV4cG9ydHNbIkxhIl0pKGEwLGExKTt2YXIgX19fZ2V0VHlwZU5hbWU9YTA9PihfX19nZXRUeXBlTmFtZT13YXNtRXhwb3J0c1siTWEiXSkoYTApO3ZhciBfX2VtYmluZF9pbml0aWFsaXplX2JpbmRpbmdzPU1vZHVsZVsiX19lbWJpbmRfaW5pdGlhbGl6ZV9iaW5kaW5ncyJdPSgpPT4oX19lbWJpbmRfaW5pdGlhbGl6ZV9iaW5kaW5ncz1Nb2R1bGVbIl9fZW1iaW5kX2luaXRpYWxpemVfYmluZGluZ3MiXT13YXNtRXhwb3J0c1siTmEiXSkoKTt2YXIgX19fZnVuY3Nfb25fZXhpdD0oKT0+KF9fX2Z1bmNzX29uX2V4aXQ9d2FzbUV4cG9ydHNbIk9hIl0pKCk7dmFyIF9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdD1Nb2R1bGVbIl9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdCJdPShhMCxhMSxhMixhMyxhNCxhNSk9PihfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQ9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQiXT13YXNtRXhwb3J0c1siUGEiXSkoYTAsYTEsYTIsYTMsYTQsYTUpO3ZhciBfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQ9TW9kdWxlWyJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQiXT0oKT0+KF9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZD1Nb2R1bGVbIl9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZCJdPXdhc21FeHBvcnRzWyJRYSJdKSgpO3ZhciBfZW1zY3JpcHRlbl9tYWluX3RocmVhZF9wcm9jZXNzX3F1ZXVlZF9jYWxscz0oKT0+KF9lbXNjcmlwdGVuX21haW5fdGhyZWFkX3Byb2Nlc3NfcXVldWVkX2NhbGxzPXdhc21FeHBvcnRzWyJlbXNjcmlwdGVuX21haW5fdGhyZWFkX3Byb2Nlc3NfcXVldWVkX2NhbGxzIl0pKCk7dmFyIF9mZmx1c2g9TW9kdWxlWyJfZmZsdXNoIl09YTA9PihfZmZsdXNoPU1vZHVsZVsiX2ZmbHVzaCJdPXdhc21FeHBvcnRzWyJSYSJdKShhMCk7dmFyIF9lbXNjcmlwdGVuX21haW5fcnVudGltZV90aHJlYWRfaWQ9KCk9PihfZW1zY3JpcHRlbl9tYWluX3J1bnRpbWVfdGhyZWFkX2lkPXdhc21FeHBvcnRzWyJlbXNjcmlwdGVuX21haW5fcnVudGltZV90aHJlYWRfaWQiXSkoKTt2YXIgX19lbXNjcmlwdGVuX3J1bl9vbl9tYWluX3RocmVhZF9qcz0oYTAsYTEsYTIsYTMpPT4oX19lbXNjcmlwdGVuX3J1bl9vbl9tYWluX3RocmVhZF9qcz13YXNtRXhwb3J0c1siU2EiXSkoYTAsYTEsYTIsYTMpO3ZhciBfX2Vtc2NyaXB0ZW5fdGhyZWFkX2ZyZWVfZGF0YT1hMD0+KF9fZW1zY3JpcHRlbl90aHJlYWRfZnJlZV9kYXRhPXdhc21FeHBvcnRzWyJUYSJdKShhMCk7dmFyIF9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1Nb2R1bGVbIl9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdCJdPWEwPT4oX19lbXNjcmlwdGVuX3RocmVhZF9leGl0PU1vZHVsZVsiX19lbXNjcmlwdGVuX3RocmVhZF9leGl0Il09d2FzbUV4cG9ydHNbIlVhIl0pKGEwKTt2YXIgX19lbXNjcmlwdGVuX2NoZWNrX21haWxib3g9KCk9PihfX2Vtc2NyaXB0ZW5fY2hlY2tfbWFpbGJveD13YXNtRXhwb3J0c1siVmEiXSkoKTt2YXIgX3NldFRocmV3PShhMCxhMSk9Pihfc2V0VGhyZXc9d2FzbUV4cG9ydHNbIldhIl0pKGEwLGExKTt2YXIgc2V0VGVtcFJldDA9YTA9PihzZXRUZW1wUmV0MD13YXNtRXhwb3J0c1siWGEiXSkoYTApO3ZhciBfZW1zY3JpcHRlbl9zdGFja19zZXRfbGltaXRzPShhMCxhMSk9PihfZW1zY3JpcHRlbl9zdGFja19zZXRfbGltaXRzPXdhc21FeHBvcnRzWyJZYSJdKShhMCxhMSk7dmFyIHN0YWNrU2F2ZT0oKT0+KHN0YWNrU2F2ZT13YXNtRXhwb3J0c1siWmEiXSkoKTt2YXIgc3RhY2tSZXN0b3JlPWEwPT4oc3RhY2tSZXN0b3JlPXdhc21FeHBvcnRzWyJfYSJdKShhMCk7dmFyIHN0YWNrQWxsb2M9YTA9PihzdGFja0FsbG9jPXdhc21FeHBvcnRzWyIkYSJdKShhMCk7dmFyIF9fX2N4YV9kZWNyZW1lbnRfZXhjZXB0aW9uX3JlZmNvdW50PWEwPT4oX19fY3hhX2RlY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQ9d2FzbUV4cG9ydHNbImFiIl0pKGEwKTt2YXIgX19fY3hhX2luY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQ9YTA9PihfX19jeGFfaW5jcmVtZW50X2V4Y2VwdGlvbl9yZWZjb3VudD13YXNtRXhwb3J0c1siYmIiXSkoYTApO3ZhciBfX19jeGFfY2FuX2NhdGNoPShhMCxhMSxhMik9PihfX19jeGFfY2FuX2NhdGNoPXdhc21FeHBvcnRzWyJjYiJdKShhMCxhMSxhMik7dmFyIF9fX2N4YV9pc19wb2ludGVyX3R5cGU9YTA9PihfX19jeGFfaXNfcG9pbnRlcl90eXBlPXdhc21FeHBvcnRzWyJkYiJdKShhMCk7dmFyIGR5bkNhbGxfdmlpamo9TW9kdWxlWyJkeW5DYWxsX3ZpaWpqIl09KGEwLGExLGEyLGEzLGE0LGE1LGE2KT0+KGR5bkNhbGxfdmlpamo9TW9kdWxlWyJkeW5DYWxsX3ZpaWpqIl09d2FzbUV4cG9ydHNbImViIl0pKGEwLGExLGEyLGEzLGE0LGE1LGE2KTt2YXIgZHluQ2FsbF92aWlpampqPU1vZHVsZVsiZHluQ2FsbF92aWlpampqIl09KGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5KT0+KGR5bkNhbGxfdmlpaWpqaj1Nb2R1bGVbImR5bkNhbGxfdmlpaWpqaiJdPXdhc21FeHBvcnRzWyJmYiJdKShhMCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSk7dmFyIGR5bkNhbGxfaWlpaWo9TW9kdWxlWyJkeW5DYWxsX2lpaWlqIl09KGEwLGExLGEyLGEzLGE0LGE1KT0+KGR5bkNhbGxfaWlpaWo9TW9kdWxlWyJkeW5DYWxsX2lpaWlqIl09d2FzbUV4cG9ydHNbImdiIl0pKGEwLGExLGEyLGEzLGE0LGE1KTt2YXIgZHluQ2FsbF9qaWk9TW9kdWxlWyJkeW5DYWxsX2ppaSJdPShhMCxhMSxhMik9PihkeW5DYWxsX2ppaT1Nb2R1bGVbImR5bkNhbGxfamlpIl09d2FzbUV4cG9ydHNbImhiIl0pKGEwLGExLGEyKTt2YXIgZHluQ2FsbF9qamo9TW9kdWxlWyJkeW5DYWxsX2pqaiJdPShhMCxhMSxhMixhMyxhNCk9PihkeW5DYWxsX2pqaj1Nb2R1bGVbImR5bkNhbGxfampqIl09d2FzbUV4cG9ydHNbImliIl0pKGEwLGExLGEyLGEzLGE0KTt2YXIgZHluQ2FsbF9paWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlqaiJdPShhMCxhMSxhMixhMyxhNCxhNSxhNixhNyk9PihkeW5DYWxsX2lpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWpqIl09d2FzbUV4cG9ydHNbImpiIl0pKGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3KTt2YXIgZHluQ2FsbF92aWlqamk9TW9kdWxlWyJkeW5DYWxsX3ZpaWpqaSJdPShhMCxhMSxhMixhMyxhNCxhNSxhNixhNyk9PihkeW5DYWxsX3ZpaWpqaT1Nb2R1bGVbImR5bkNhbGxfdmlpamppIl09d2FzbUV4cG9ydHNbImtiIl0pKGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3KTt2YXIgZHluQ2FsbF9paWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpamoiXT0oYTAsYTEsYTIsYTMsYTQsYTUsYTYpPT4oZHluQ2FsbF9paWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpamoiXT13YXNtRXhwb3J0c1sibGIiXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYpO3ZhciBkeW5DYWxsX3ZpaWpqaj1Nb2R1bGVbImR5bkNhbGxfdmlpampqIl09KGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4KT0+KGR5bkNhbGxfdmlpampqPU1vZHVsZVsiZHluQ2FsbF92aWlqamoiXT13YXNtRXhwb3J0c1sibWIiXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgpO3ZhciBkeW5DYWxsX2lpaj1Nb2R1bGVbImR5bkNhbGxfaWlqIl09KGEwLGExLGEyLGEzKT0+KGR5bkNhbGxfaWlqPU1vZHVsZVsiZHluQ2FsbF9paWoiXT13YXNtRXhwb3J0c1sibmIiXSkoYTAsYTEsYTIsYTMpO3ZhciBkeW5DYWxsX2lpamppaWlpPU1vZHVsZVsiZHluQ2FsbF9paWpqaWlpaSJdPShhMCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSk9PihkeW5DYWxsX2lpamppaWlpPU1vZHVsZVsiZHluQ2FsbF9paWpqaWlpaSJdPXdhc21FeHBvcnRzWyJvYiJdKShhMCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSk7dmFyIGR5bkNhbGxfamlqaT1Nb2R1bGVbImR5bkNhbGxfamlqaSJdPShhMCxhMSxhMixhMyxhNCk9PihkeW5DYWxsX2ppamk9TW9kdWxlWyJkeW5DYWxsX2ppamkiXT13YXNtRXhwb3J0c1sicGIiXSkoYTAsYTEsYTIsYTMsYTQpO3ZhciBkeW5DYWxsX3ZpaWppaT1Nb2R1bGVbImR5bkNhbGxfdmlpamlpIl09KGEwLGExLGEyLGEzLGE0LGE1LGE2KT0+KGR5bkNhbGxfdmlpamlpPU1vZHVsZVsiZHluQ2FsbF92aWlqaWkiXT13YXNtRXhwb3J0c1sicWIiXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYpO3ZhciBkeW5DYWxsX2lpaWlpaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlqIl09KGEwLGExLGEyLGEzLGE0LGE1LGE2KT0+KGR5bkNhbGxfaWlpaWlqPU1vZHVsZVsiZHluQ2FsbF9paWlpaWoiXT13YXNtRXhwb3J0c1sicmIiXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYpO3ZhciBkeW5DYWxsX2lpaWlpamo9TW9kdWxlWyJkeW5DYWxsX2lpaWlpamoiXT0oYTAsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgpPT4oZHluQ2FsbF9paWlpaWpqPU1vZHVsZVsiZHluQ2FsbF9paWlpaWpqIl09d2FzbUV4cG9ydHNbInNiIl0pKGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4KTt2YXIgZHluQ2FsbF9paWlpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlpamoiXT0oYTAsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpPT4oZHluQ2FsbF9paWlpaWlqaj1Nb2R1bGVbImR5bkNhbGxfaWlpaWlpamoiXT13YXNtRXhwb3J0c1sidGIiXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpO3ZhciBfX19zdGFydF9lbV9qcz1Nb2R1bGVbIl9fX3N0YXJ0X2VtX2pzIl09MjYyMTQ4O3ZhciBfX19zdG9wX2VtX2pzPU1vZHVsZVsiX19fc3RvcF9lbV9qcyJdPTI2Mjc2MDtmdW5jdGlvbiBpbnZva2VfaWkoaW5kZXgsYTEpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWkoaW5kZXgsYTEsYTIpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWkoaW5kZXgsYTEsYTIpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpKGluZGV4LGExKXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e2dldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlpaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaShpbmRleCxhMSxhMixhMyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtyZXR1cm4gZ2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX2koaW5kZXgpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KSgpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfZmkoaW5kZXgsYTEpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWYoaW5kZXgsYTEsYTIpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMil9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWlpaWlpKGluZGV4LGExLGEyLGEzLGE0LGE1LGE2KXt2YXIgc3A9c3RhY2tTYXZlKCk7dHJ5e3JldHVybiBnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdihpbmRleCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWlpaWlkaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaShpbmRleCxhMSxhMixhMyl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWlkaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNil7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfdmlpaWRpaWkoaW5kZXgsYTEsYTIsYTMsYTQsYTUsYTYsYTcpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzLGE0LGE1LGE2LGE3KX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWQoaW5kZXgsYTEsYTIsYTMpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7Z2V0V2FzbVRhYmxlRW50cnkoaW5kZXgpKGExLGEyLGEzKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19ZnVuY3Rpb24gaW52b2tlX3ZpaWlpaWlpaShpbmRleCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlpaWkoaW5kZXgsYTEsYTIsYTMsYTQpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV92aWlkaShpbmRleCxhMSxhMixhMyxhNCl7dmFyIHNwPXN0YWNrU2F2ZSgpO3RyeXtnZXRXYXNtVGFibGVFbnRyeShpbmRleCkoYTEsYTIsYTMsYTQpfWNhdGNoKGUpe3N0YWNrUmVzdG9yZShzcCk7aWYoZSE9PWUrMCl0aHJvdyBlO19zZXRUaHJldygxLDApfX1mdW5jdGlvbiBpbnZva2VfaWlkaWkoaW5kZXgsYTEsYTIsYTMsYTQpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGdldFdhc21UYWJsZUVudHJ5KGluZGV4KShhMSxhMixhMyxhNCl9Y2F0Y2goZSl7c3RhY2tSZXN0b3JlKHNwKTtpZihlIT09ZSswKXRocm93IGU7X3NldFRocmV3KDEsMCl9fWZ1bmN0aW9uIGludm9rZV9paWooaW5kZXgsYTEsYTIsYTMpe3ZhciBzcD1zdGFja1NhdmUoKTt0cnl7cmV0dXJuIGR5bkNhbGxfaWlqKGluZGV4LGExLGEyLGEzKX1jYXRjaChlKXtzdGFja1Jlc3RvcmUoc3ApO2lmKGUhPT1lKzApdGhyb3cgZTtfc2V0VGhyZXcoMSwwKX19TW9kdWxlWyJ3YXNtTWVtb3J5Il09d2FzbU1lbW9yeTtNb2R1bGVbImtlZXBSdW50aW1lQWxpdmUiXT1rZWVwUnVudGltZUFsaXZlO01vZHVsZVsiRXhpdFN0YXR1cyJdPUV4aXRTdGF0dXM7TW9kdWxlWyJQVGhyZWFkIl09UFRocmVhZDt2YXIgY2FsbGVkUnVuO2RlcGVuZGVuY2llc0Z1bGZpbGxlZD1mdW5jdGlvbiBydW5DYWxsZXIoKXtpZighY2FsbGVkUnVuKXJ1bigpO2lmKCFjYWxsZWRSdW4pZGVwZW5kZW5jaWVzRnVsZmlsbGVkPXJ1bkNhbGxlcn07ZnVuY3Rpb24gcnVuKCl7aWYocnVuRGVwZW5kZW5jaWVzPjApe3JldHVybn1pZihFTlZJUk9OTUVOVF9JU19QVEhSRUFEKXtyZWFkeVByb21pc2VSZXNvbHZlKE1vZHVsZSk7aW5pdFJ1bnRpbWUoKTtzdGFydFdvcmtlcihNb2R1bGUpO3JldHVybn1wcmVSdW4oKTtpZihydW5EZXBlbmRlbmNpZXM+MCl7cmV0dXJufWZ1bmN0aW9uIGRvUnVuKCl7aWYoY2FsbGVkUnVuKXJldHVybjtjYWxsZWRSdW49dHJ1ZTtNb2R1bGVbImNhbGxlZFJ1biJdPXRydWU7aWYoQUJPUlQpcmV0dXJuO2luaXRSdW50aW1lKCk7cmVhZHlQcm9taXNlUmVzb2x2ZShNb2R1bGUpO2lmKE1vZHVsZVsib25SdW50aW1lSW5pdGlhbGl6ZWQiXSlNb2R1bGVbIm9uUnVudGltZUluaXRpYWxpemVkIl0oKTtwb3N0UnVuKCl9aWYoTW9kdWxlWyJzZXRTdGF0dXMiXSl7TW9kdWxlWyJzZXRTdGF0dXMiXSgiUnVubmluZy4uLiIpO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7TW9kdWxlWyJzZXRTdGF0dXMiXSgiIil9LDEpO2RvUnVuKCl9LDEpfWVsc2V7ZG9SdW4oKX19aWYoTW9kdWxlWyJwcmVJbml0Il0pe2lmKHR5cGVvZiBNb2R1bGVbInByZUluaXQiXT09ImZ1bmN0aW9uIilNb2R1bGVbInByZUluaXQiXT1bTW9kdWxlWyJwcmVJbml0Il1dO3doaWxlKE1vZHVsZVsicHJlSW5pdCJdLmxlbmd0aD4wKXtNb2R1bGVbInByZUluaXQiXS5wb3AoKSgpfX1ydW4oKTsKCgogIHJldHVybiBtb2R1bGVBcmcucmVhZHkKfQopOwp9KSgpOwo7CmNyZWF0ZVdhc21NdWx0aUluc3RhbmNlID0gTW9kdWxlOyB9ICAgIAogICAgCiAgICAgICAgICAgICFmdW5jdGlvbigpeyJ1c2Ugc3RyaWN0Ijt2YXIgZT1PYmplY3QuZGVmaW5lUHJvcGVydHksYT0odCxyLG4pPT4oKCh0LHIsbik9PntyIGluIHQ/ZSh0LHIse2VudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwLHZhbHVlOm59KTp0W3JdPW59KSh0LCJzeW1ib2wiIT10eXBlb2Ygcj9yKyIiOnIsbiksbik7Y2xhc3MgbHt9YShsLCJ1cGRhdGVzIix7dHJhbnNmb3JtZXJfbmV3OiJOZXcgdHJhbnNmb3JtZXIiLHRyYW5zZm9ybWVyX251bGw6Ik51bGwgdHJhbnNmb3JtZXIifSksYShsLCJlcnJvcnMiLHt0cmFuc2Zvcm1lcl9ub25lOiJObyB0cmFuc2Zvcm1lcnMgcHJvdmlkZWQiLHRyYW5zZm9ybWVyX3N0YXJ0OiJDYW5ub3Qgc3RhcnQgdHJhbnNmb3JtZXIiLHRyYW5zZm9ybWVyX3RyYW5zZm9ybToiQ2Fubm90IHRyYW5zZm9ybSBmcmFtZSIsdHJhbnNmb3JtZXJfZmx1c2g6IkNhbm5vdCBmbHVzaCB0cmFuc2Zvcm1lciIscmVhZGFibGVfbnVsbDoiUmVhZGFibGUgaXMgbnVsbCIsd3JpdGFibGVfbnVsbDoiV3JpdGFibGUgaXMgbnVsbCJ9KTtjb25zdCB0PW5ldyBXZWFrTWFwLHI9bmV3IFdlYWtNYXAsbj1uZXcgV2Vha01hcCxjPVN5bWJvbCgiYW55UHJvZHVjZXIiKSxmPVByb21pc2UucmVzb2x2ZSgpLGg9U3ltYm9sKCJsaXN0ZW5lckFkZGVkIiksdT1TeW1ib2woImxpc3RlbmVyUmVtb3ZlZCIpO2xldCBkPSExO2Z1bmN0aW9uIGcoZSl7aWYoInN0cmluZyIhPXR5cGVvZiBlJiYic3ltYm9sIiE9dHlwZW9mIGUpdGhyb3cgbmV3IFR5cGVFcnJvcigiZXZlbnROYW1lIG11c3QgYmUgYSBzdHJpbmcgb3IgYSBzeW1ib2wiKX1mdW5jdGlvbiBUKGUpe2lmKCJmdW5jdGlvbiIhPXR5cGVvZiBlKXRocm93IG5ldyBUeXBlRXJyb3IoImxpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbiIpfWZ1bmN0aW9uIF8oZSx0KXtjb25zdCBuPXIuZ2V0KGUpO3JldHVybiBuLmhhcyh0KXx8bi5zZXQodCxuZXcgU2V0KSxuLmdldCh0KX1mdW5jdGlvbiBiKGUsdCl7Y29uc3Qgcj0ic3RyaW5nIj09dHlwZW9mIHR8fCJzeW1ib2wiPT10eXBlb2YgdD90OmMsZj1uLmdldChlKTtyZXR1cm4gZi5oYXMocil8fGYuc2V0KHIsbmV3IFNldCksZi5nZXQocil9ZnVuY3Rpb24gJChlLHQpe3Q9QXJyYXkuaXNBcnJheSh0KT90Olt0XTtsZXQgcj0hMSxzPSgpPT57fSxuPVtdO2NvbnN0IGM9e2VucXVldWUoZSl7bi5wdXNoKGUpLHMoKX0sZmluaXNoKCl7cj0hMCxzKCl9fTtmb3IoY29uc3QgZiBvZiB0KWIoZSxmKS5hZGQoYyk7cmV0dXJue2FzeW5jIG5leHQoKXtyZXR1cm4gbj8wPT09bi5sZW5ndGg/cj8obj12b2lkIDAsdGhpcy5uZXh0KCkpOihhd2FpdCBuZXcgUHJvbWlzZSgoZT0+e3M9ZX0pKSx0aGlzLm5leHQoKSk6e2RvbmU6ITEsdmFsdWU6YXdhaXQgbi5zaGlmdCgpfTp7ZG9uZTohMH19LGFzeW5jIHJldHVybihyKXtuPXZvaWQgMDtmb3IoY29uc3QgbiBvZiB0KWIoZSxuKS5kZWxldGUoYyk7cmV0dXJuIHMoKSxhcmd1bWVudHMubGVuZ3RoPjA/e2RvbmU6ITAsdmFsdWU6YXdhaXQgcn06e2RvbmU6ITB9fSxbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCl7cmV0dXJuIHRoaXN9fX1mdW5jdGlvbiBIKGUpe2lmKHZvaWQgMD09PWUpcmV0dXJuIHA7aWYoIUFycmF5LmlzQXJyYXkoZSkpdGhyb3cgbmV3IFR5cGVFcnJvcigiYG1ldGhvZE5hbWVzYCBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3MiKTtmb3IoY29uc3QgdCBvZiBlKWlmKCFwLmluY2x1ZGVzKHQpKXRocm93InN0cmluZyIhPXR5cGVvZiB0P25ldyBUeXBlRXJyb3IoImBtZXRob2ROYW1lc2AgZWxlbWVudCBtdXN0IGJlIGEgc3RyaW5nIik6bmV3IEVycm9yKGAke3R9IGlzIG5vdCBFbWl0dGVyeSBtZXRob2RgKTtyZXR1cm4gZX1jb25zdCBJPWU9PmU9PT1ofHxlPT09dTtjbGFzcyBte3N0YXRpYyBtaXhpbihlLHQpe3JldHVybiB0PUgodCkscj0+e2lmKCJmdW5jdGlvbiIhPXR5cGVvZiByKXRocm93IG5ldyBUeXBlRXJyb3IoImB0YXJnZXRgIG11c3QgYmUgZnVuY3Rpb24iKTtmb3IoY29uc3QgZSBvZiB0KWlmKHZvaWQgMCE9PXIucHJvdG90eXBlW2VdKXRocm93IG5ldyBFcnJvcihgVGhlIHByb3BlcnR5IFxgJHtlfVxgIGFscmVhZHkgZXhpc3RzIG9uIFxgdGFyZ2V0XGBgKTtPYmplY3QuZGVmaW5lUHJvcGVydHkoci5wcm90b3R5cGUsZSx7ZW51bWVyYWJsZTohMSxnZXQ6ZnVuY3Rpb24gbygpe3JldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxlLHtlbnVtZXJhYmxlOiExLHZhbHVlOm5ldyBtfSksdGhpc1tlXX19KTtjb25zdCBpPXQ9PmZ1bmN0aW9uKC4uLnIpe3JldHVybiB0aGlzW2VdW3RdKC4uLnIpfTtmb3IoY29uc3QgZSBvZiB0KU9iamVjdC5kZWZpbmVQcm9wZXJ0eShyLnByb3RvdHlwZSxlLHtlbnVtZXJhYmxlOiExLHZhbHVlOmkoZSl9KTtyZXR1cm4gcn19c3RhdGljIGdldCBpc0RlYnVnRW5hYmxlZCgpe2lmKCJvYmplY3QiIT10eXBlb2YgcHJvY2VzcylyZXR1cm4gZDtjb25zdHtlbnY6ZX09cHJvY2Vzc3x8e2Vudjp7fX07cmV0dXJuImVtaXR0ZXJ5Ij09PWUuREVCVUd8fCIqIj09PWUuREVCVUd8fGR9c3RhdGljIHNldCBpc0RlYnVnRW5hYmxlZChlKXtkPWV9Y29uc3RydWN0b3IoZT17fSl7dC5zZXQodGhpcyxuZXcgU2V0KSxyLnNldCh0aGlzLG5ldyBNYXApLG4uc2V0KHRoaXMsbmV3IE1hcCksdGhpcy5kZWJ1Zz1lLmRlYnVnfHx7fSx2b2lkIDA9PT10aGlzLmRlYnVnLmVuYWJsZWQmJih0aGlzLmRlYnVnLmVuYWJsZWQ9ITEpLHRoaXMuZGVidWcubG9nZ2VyfHwodGhpcy5kZWJ1Zy5sb2dnZXI9KGUsdCxyLG4pPT57dHJ5e249SlNPTi5zdHJpbmdpZnkobil9Y2F0Y2h7bj1gT2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzIGZhaWxlZCB0byBzdHJpbmdpZnk6ICR7T2JqZWN0LmtleXMobikuam9pbigiLCIpfWB9InN5bWJvbCI9PXR5cGVvZiByJiYocj1yLnRvU3RyaW5nKCkpO2NvbnN0IGM9bmV3IERhdGUsZj1gJHtjLmdldEhvdXJzKCl9OiR7Yy5nZXRNaW51dGVzKCl9OiR7Yy5nZXRTZWNvbmRzKCl9LiR7Yy5nZXRNaWxsaXNlY29uZHMoKX1gO2NvbnNvbGUubG9nKGBbJHtmfV1bZW1pdHRlcnk6JHtlfV1bJHt0fV0gRXZlbnQgTmFtZTogJHtyfVxuXHRkYXRhOiAke259YCl9KX1sb2dJZkRlYnVnRW5hYmxlZChlLHQscil7KG0uaXNEZWJ1Z0VuYWJsZWR8fHRoaXMuZGVidWcuZW5hYmxlZCkmJnRoaXMuZGVidWcubG9nZ2VyKGUsdGhpcy5kZWJ1Zy5uYW1lLHQscil9b24oZSx0KXtUKHQpLGU9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgciBvZiBlKWcociksXyh0aGlzLHIpLmFkZCh0KSx0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJzdWJzY3JpYmUiLHIsdm9pZCAwKSxJKHIpfHx0aGlzLmVtaXQoaCx7ZXZlbnROYW1lOnIsbGlzdGVuZXI6dH0pO3JldHVybiB0aGlzLm9mZi5iaW5kKHRoaXMsZSx0KX1vZmYoZSx0KXtUKHQpLGU9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgciBvZiBlKWcociksXyh0aGlzLHIpLmRlbGV0ZSh0KSx0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJ1bnN1YnNjcmliZSIscix2b2lkIDApLEkocil8fHRoaXMuZW1pdCh1LHtldmVudE5hbWU6cixsaXN0ZW5lcjp0fSl9b25jZShlKXtyZXR1cm4gbmV3IFByb21pc2UoKHQ9Pntjb25zdCByPXRoaXMub24oZSwoZT0+e3IoKSx0KGUpfSkpfSkpfWV2ZW50cyhlKXtlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07Zm9yKGNvbnN0IHQgb2YgZSlnKHQpO3JldHVybiAkKHRoaXMsZSl9YXN5bmMgZW1pdChlLHIpe2coZSksdGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgiZW1pdCIsZSxyKSxmdW5jdGlvbiBxKGUsdCxyKXtjb25zdCBmPW4uZ2V0KGUpO2lmKGYuaGFzKHQpKWZvcihjb25zdCBuIG9mIGYuZ2V0KHQpKW4uZW5xdWV1ZShyKTtpZihmLmhhcyhjKSl7Y29uc3QgZT1Qcm9taXNlLmFsbChbdCxyXSk7Zm9yKGNvbnN0IHQgb2YgZi5nZXQoYykpdC5lbnF1ZXVlKGUpfX0odGhpcyxlLHIpO2NvbnN0IGg9Xyh0aGlzLGUpLHU9dC5nZXQodGhpcyksZD1bLi4uaF0scD1JKGUpP1tdOlsuLi51XTthd2FpdCBmLGF3YWl0IFByb21pc2UuYWxsKFsuLi5kLm1hcCgoYXN5bmMgZT0+e2lmKGguaGFzKGUpKXJldHVybiBlKHIpfSkpLC4uLnAubWFwKChhc3luYyB0PT57aWYodS5oYXModCkpcmV0dXJuIHQoZSxyKX0pKV0pfWFzeW5jIGVtaXRTZXJpYWwoZSxyKXtnKGUpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoImVtaXRTZXJpYWwiLGUscik7Y29uc3Qgbj1fKHRoaXMsZSksYz10LmdldCh0aGlzKSxoPVsuLi5uXSx1PVsuLi5jXTthd2FpdCBmO2Zvcihjb25zdCB0IG9mIGgpbi5oYXModCkmJmF3YWl0IHQocik7Zm9yKGNvbnN0IHQgb2YgdSljLmhhcyh0KSYmYXdhaXQgdChlLHIpfW9uQW55KGUpe3JldHVybiBUKGUpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInN1YnNjcmliZUFueSIsdm9pZCAwLHZvaWQgMCksdC5nZXQodGhpcykuYWRkKGUpLHRoaXMuZW1pdChoLHtsaXN0ZW5lcjplfSksdGhpcy5vZmZBbnkuYmluZCh0aGlzLGUpfWFueUV2ZW50KCl7cmV0dXJuICQodGhpcyl9b2ZmQW55KGUpe1QoZSksdGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgidW5zdWJzY3JpYmVBbnkiLHZvaWQgMCx2b2lkIDApLHRoaXMuZW1pdCh1LHtsaXN0ZW5lcjplfSksdC5nZXQodGhpcykuZGVsZXRlKGUpfWNsZWFyTGlzdGVuZXJzKGUpe2U9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgYyBvZiBlKWlmKHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoImNsZWFyIixjLHZvaWQgMCksInN0cmluZyI9PXR5cGVvZiBjfHwic3ltYm9sIj09dHlwZW9mIGMpe18odGhpcyxjKS5jbGVhcigpO2NvbnN0IGU9Yih0aGlzLGMpO2Zvcihjb25zdCB0IG9mIGUpdC5maW5pc2goKTtlLmNsZWFyKCl9ZWxzZXt0LmdldCh0aGlzKS5jbGVhcigpO2Zvcihjb25zdCBlIG9mIHIuZ2V0KHRoaXMpLnZhbHVlcygpKWUuY2xlYXIoKTtmb3IoY29uc3QgZSBvZiBuLmdldCh0aGlzKS52YWx1ZXMoKSl7Zm9yKGNvbnN0IHQgb2YgZSl0LmZpbmlzaCgpO2UuY2xlYXIoKX19fWxpc3RlbmVyQ291bnQoZSl7ZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2xldCBjPTA7Zm9yKGNvbnN0IGYgb2YgZSlpZigic3RyaW5nIiE9dHlwZW9mIGYpe3R5cGVvZiBmPCJ1IiYmZyhmKSxjKz10LmdldCh0aGlzKS5zaXplO2Zvcihjb25zdCBlIG9mIHIuZ2V0KHRoaXMpLnZhbHVlcygpKWMrPWUuc2l6ZTtmb3IoY29uc3QgZSBvZiBuLmdldCh0aGlzKS52YWx1ZXMoKSljKz1lLnNpemV9ZWxzZSBjKz10LmdldCh0aGlzKS5zaXplK18odGhpcyxmKS5zaXplK2IodGhpcyxmKS5zaXplK2IodGhpcykuc2l6ZTtyZXR1cm4gY31iaW5kTWV0aG9kcyhlLHQpe2lmKCJvYmplY3QiIT10eXBlb2YgZXx8bnVsbD09PWUpdGhyb3cgbmV3IFR5cGVFcnJvcigiYHRhcmdldGAgbXVzdCBiZSBhbiBvYmplY3QiKTt0PUgodCk7Zm9yKGNvbnN0IHIgb2YgdCl7aWYodm9pZCAwIT09ZVtyXSl0aHJvdyBuZXcgRXJyb3IoYFRoZSBwcm9wZXJ0eSBcYCR7cn1cYCBhbHJlYWR5IGV4aXN0cyBvbiBcYHRhcmdldFxgYCk7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUscix7ZW51bWVyYWJsZTohMSx2YWx1ZTp0aGlzW3JdLmJpbmQodGhpcyl9KX19fWNvbnN0IHA9T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobS5wcm90b3R5cGUpLmZpbHRlcigoZT0+ImNvbnN0cnVjdG9yIiE9PWUpKTtPYmplY3QuZGVmaW5lUHJvcGVydHkobSwibGlzdGVuZXJBZGRlZCIse3ZhbHVlOmgsd3JpdGFibGU6ITEsZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITF9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkobSwibGlzdGVuZXJSZW1vdmVkIix7dmFsdWU6dSx3cml0YWJsZTohMSxlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMX0pO3ZhciB5PW07ZnVuY3Rpb24gdihlKXtyZXR1cm4gZnVuY3Rpb24gWChlKXtpZihmdW5jdGlvbiBKKGUpe3JldHVybiJvYmplY3QiPT10eXBlb2YgZSYmbnVsbCE9PWUmJiJtZXNzYWdlImluIGUmJiJzdHJpbmciPT10eXBlb2YgZS5tZXNzYWdlfShlKSlyZXR1cm4gZTt0cnl7cmV0dXJuIG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeShlKSl9Y2F0Y2h7cmV0dXJuIG5ldyBFcnJvcihTdHJpbmcoZSkpfX0oZSkubWVzc2FnZX12YXIgRT1PYmplY3QuZGVmaW5lUHJvcGVydHksTj0oZSx0LHIpPT4oKChlLHQscik9Pnt0IGluIGU/RShlLHQse2VudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwLHZhbHVlOnJ9KTplW3RdPXJ9KShlLCJzeW1ib2wiIT10eXBlb2YgdD90KyIiOnQscikscik7bGV0IEE7Y29uc3QgUz1uZXcgVWludDhBcnJheSgxNik7ZnVuY3Rpb24gaWUoKXtpZighQSYmKEE9dHlwZW9mIGNyeXB0bzwidSImJmNyeXB0by5nZXRSYW5kb21WYWx1ZXMmJmNyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChjcnlwdG8pLCFBKSl0aHJvdyBuZXcgRXJyb3IoImNyeXB0by5nZXRSYW5kb21WYWx1ZXMoKSBub3Qgc3VwcG9ydGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkI2dldHJhbmRvbXZhbHVlcy1ub3Qtc3VwcG9ydGVkIik7cmV0dXJuIEEoUyl9Y29uc3QgTz1bXTtmb3IobGV0IENlPTA7Q2U8MjU2OysrQ2UpTy5wdXNoKChDZSsyNTYpLnRvU3RyaW5nKDE2KS5zbGljZSgxKSk7Y29uc3QgTT17cmFuZG9tVVVJRDp0eXBlb2YgY3J5cHRvPCJ1IiYmY3J5cHRvLnJhbmRvbVVVSUQmJmNyeXB0by5yYW5kb21VVUlELmJpbmQoY3J5cHRvKX07ZnVuY3Rpb24gY2UoZSx0LHIpe2lmKE0ucmFuZG9tVVVJRCYmIXQmJiFlKXJldHVybiBNLnJhbmRvbVVVSUQoKTtjb25zdCBuPShlPWV8fHt9KS5yYW5kb218fChlLnJuZ3x8aWUpKCk7aWYobls2XT0xNSZuWzZdfDY0LG5bOF09NjMmbls4XXwxMjgsdCl7cj1yfHwwO2ZvcihsZXQgZT0wO2U8MTY7KytlKXRbcitlXT1uW2VdO3JldHVybiB0fXJldHVybiBmdW5jdGlvbiBuZShlLHQ9MCl7cmV0dXJuKE9bZVt0KzBdXStPW2VbdCsxXV0rT1tlW3QrMl1dK09bZVt0KzNdXSsiLSIrT1tlW3QrNF1dK09bZVt0KzVdXSsiLSIrT1tlW3QrNl1dK09bZVt0KzddXSsiLSIrT1tlW3QrOF1dK09bZVt0KzldXSsiLSIrT1tlW3QrMTBdXStPW2VbdCsxMV1dK09bZVt0KzEyXV0rT1tlW3QrMTNdXStPW2VbdCsxNF1dK09bZVt0KzE1XV0pLnRvTG93ZXJDYXNlKCl9KG4pfWZ1bmN0aW9uIFcoZSx0KXtnbG9iYWxUaGlzLnZvbmFnZXx8KGdsb2JhbFRoaXMudm9uYWdlPXt9KSxnbG9iYWxUaGlzLnZvbmFnZS53b3JrZXJpemVyfHwoZ2xvYmFsVGhpcy52b25hZ2Uud29ya2VyaXplcj17fSk7bGV0IHI9Z2xvYmFsVGhpcy52b25hZ2Uud29ya2VyaXplcjtyZXR1cm4gcltlXXx8KHJbZV09dCkscltlXX1jb25zdCBrPVcoImdsb2JhbHMiLHt9KTt2YXIgUj0oZT0+KGUuSU5JVD0iSU5JVCIsZS5GT1JXQVJEPSJGT1JXQVJEIixlLlRFUk1JTkFURT0iVEVSTUlOQVRFIixlLkdMT0JBTFNfU1lOQz0iR0xPQkFMU19TWU5DIixlKSkoUnx8e30pO2Z1bmN0aW9uIGooZSl7cmV0dXJuW0ltYWdlQml0bWFwLFJlYWRhYmxlU3RyZWFtLFdyaXRhYmxlU3RyZWFtXS5zb21lKCh0PT5lIGluc3RhbmNlb2YgdCkpfWxldCB4PTA7ZnVuY3Rpb24gbGUoZSx0LHIsbixjKXtjb25zdCBmPXgrKztyZXR1cm4gZS5wb3N0TWVzc2FnZSh7aWQ6Zix0eXBlOnQsZnVuY3Rpb25OYW1lOnIsYXJnczpufSxuLmZpbHRlcigoZT0+aihlKSkpKSxuZXcgUHJvbWlzZSgoZT0+e251bGw9PWN8fGMuc2V0KGYsZSl9KSl9ZnVuY3Rpb24gdyhlLHQpe2NvbnN0e2lkOnIsdHlwZTpufT1lLGM9QXJyYXkuaXNBcnJheSh0KT90Olt0XTtwb3N0TWVzc2FnZSh7aWQ6cix0eXBlOm4scmVzdWx0OnR9LGMuZmlsdGVyKChlPT5qKGUpKSkpfWNvbnN0IEw9Vygid29ya2VyaXplZCIse30pO2Z1bmN0aW9uIEIoKXtyZXR1cm4gdHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlPCJ1IiYmc2VsZiBpbnN0YW5jZW9mIFdvcmtlckdsb2JhbFNjb3BlfWZ1bmN0aW9uIFAoZSx0KXtpZihBcnJheS5pc0FycmF5KHQpKXQuc3BsaWNlKDAsdC5sZW5ndGgpO2Vsc2UgaWYoIm9iamVjdCI9PXR5cGVvZiB0KWZvcihjb25zdCByIGluIHQpZGVsZXRlIHRbcl07Zm9yKGNvbnN0IHIgaW4gZSlBcnJheS5pc0FycmF5KGVbcl0pPyh0W3JdPVtdLFAoZVtyXSx0W3JdKSk6Im9iamVjdCI9PXR5cGVvZiBlW3JdPyh0W3JdPXt9LFAoZVtyXSx0W3JdKSk6dFtyXT1lW3JdfWNvbnN0IHo9VygicmVnaXN0ZXJlZFdvcmtlcnMiLHt9KTtmdW5jdGlvbiB5ZShlLHQpe3JldHVybiBrW2VdfHwoa1tlXT10KSxbKCk9PmtbZV0sYXN5bmMgdD0+e2tbZV09dCxhd2FpdCBhc3luYyBmdW5jdGlvbiB1ZSgpe2lmKEIoKSl3KHt0eXBlOlIuR0xPQkFMU19TWU5DfSxrKTtlbHNle2NvbnN0IGU9W107Zm9yKGNvbnN0IHQgaW4gTCl7Y29uc3R7d29ya2VyOnIscmVzb2x2ZXJzOm59PUxbdF0ud29ya2VyQ29udGV4dDtyJiZlLnB1c2gobGUocixSLkdMT0JBTFNfU1lOQywiIixba10sbikpfWF3YWl0IFByb21pc2UuYWxsKGUpfX0oKX1dfUIoKSYmZnVuY3Rpb24gX2UoKXtjb25zdCBlPXt9O29ubWVzc2FnZT1hc3luYyB0PT57Y29uc3Qgcj10LmRhdGE7c3dpdGNoKHIudHlwZSl7Y2FzZSBSLklOSVQ6IWZ1bmN0aW9uIGRlKGUsdCl7aWYoIWUuYXJncyl0aHJvdyJNaXNzaW5nIGNsYXNzTmFtZSB3aGlsZSBpbml0aWFsaXppbmcgd29ya2VyIjtjb25zdFtyLG5dPWUuYXJncyxjPXpbcl07aWYoIWMpdGhyb3dgdW5rbm93biB3b3JrZXIgY2xhc3MgJHtyfWA7dC5pbnN0YW5jZT1uZXcgYyhlLmFyZ3Muc2xpY2UoMSkpLFAobixrKSx3KGUsdm9pZCAwIT09dHlwZW9mIHQuaW5zdGFuY2UpfShyLGUpO2JyZWFrO2Nhc2UgUi5GT1JXQVJEOiFhc3luYyBmdW5jdGlvbiBoZShlLHQpe2NvbnN0e2Z1bmN0aW9uTmFtZTpyLGFyZ3M6bn09ZTtpZighdC5pbnN0YW5jZSl0aHJvdyJpbnN0YW5jZSBub3QgaW5pdGlhbGl6ZWQiO2lmKCFyKXRocm93Im1pc3NpbmcgZnVuY3Rpb24gbmFtZSB0byBjYWxsIjtpZighdC5pbnN0YW5jZVtyXSl0aHJvd2B1bmRlZmluZWQgZnVuY3Rpb24gWyR7cn1dIGluIGNsYXNzICR7dC5pbnN0YW5jZS5jb25zdHJ1Y3Rvci53b3JrZXJJZH1gO3coZSxhd2FpdCB0Lmluc3RhbmNlW3JdKC4uLm51bGwhPW4/bjpbXSkpfShyLGUpO2JyZWFrO2Nhc2UgUi5URVJNSU5BVEU6IWFzeW5jIGZ1bmN0aW9uIG1lKGUsdCl7Y29uc3R7YXJnczpyfT1lO2lmKCF0Lmluc3RhbmNlKXRocm93Imluc3RhbmNlIG5vdCBpbml0aWFsaXplZCI7bGV0IG47dC5pbnN0YW5jZS50ZXJtaW5hdGUmJihuPWF3YWl0IHQuaW5zdGFuY2UudGVybWluYXRlKC4uLm51bGwhPXI/cjpbXSkpLHcoZSxuKX0ocixlKTticmVhaztjYXNlIFIuR0xPQkFMU19TWU5DOiFmdW5jdGlvbiBnZShlKXtpZighZS5hcmdzKXRocm93Ik1pc3NpbmcgZ2xvYmFscyB3aGlsZSBzeW5jaW5nIjtQKGUuYXJnc1swXSxrKSx3KGUse30pfShyKX19fSgpO2NvbnN0W0YsVV09ZnVuY3Rpb24gYmUoZSx0KXtyZXR1cm4geWUoZSx0KX0oIm1ldGFkYXRhIik7ZnVuY3Rpb24gQygpe3JldHVybiBGKCl9Y2xhc3MgRHtjb25zdHJ1Y3RvcihlKXtOKHRoaXMsInV1aWQiLGNlKCkpLHRoaXMuY29uZmlnPWV9YXN5bmMgc2VuZChlKXt2YXIgdCxyLG47Y29uc3R7YXBwSWQ6Yyxzb3VyY2VUeXBlOmZ9PW51bGwhPSh0PUMoKSk/dDp7fTtpZighY3x8IWYpcmV0dXJuIm1ldGFkYXRhIG1pc3NpbmciO2NvbnN0IGg9bmV3IEFib3J0Q29udHJvbGxlcix1PXNldFRpbWVvdXQoKCgpPT5oLmFib3J0KCkpLDFlNCk7cmV0dXJuIGF3YWl0KG51bGwhPShuPW51bGw9PShyPXRoaXMuY29uZmlnKT92b2lkIDA6ci5mZXRjaCk/bjpmZXRjaCkodGhpcy5nZXRVcmwoKSx7bWV0aG9kOiJQT1NUIixoZWFkZXJzOnRoaXMuZ2V0SGVhZGVycygpLGJvZHk6SlNPTi5zdHJpbmdpZnkodGhpcy5idWlsZFJlcG9ydChlKSksc2lnbmFsOmguc2lnbmFsfSksY2xlYXJUaW1lb3V0KHUpLCJzdWNjZXNzIn1nZXRVcmwoKXt2YXIgZTtsZXQgdD1udWxsIT0oZT1DKCkucHJveHlVcmwpP2U6Imh0dHBzOi8vIjtyZXR1cm4gdCs9KCIvIj09PXQuYXQoLTEpPyIiOiIvIikrImhsZy50b2tib3guY29tL3Byb2QvbG9nZ2luZy92Y3Bfd2VicnRjIix0fWdldEhlYWRlcnMoKXtyZXR1cm57IkNvbnRlbnQtVHlwZSI6ImFwcGxpY2F0aW9uL2pzb24ifX1idWlsZFJlcG9ydChlKXtjb25zdCB0PUMoKTtyZXR1cm57Z3VpZDp0aGlzLnV1aWQsLi4uZSxhcHBsaWNhdGlvbklkOnQuYXBwSWQsdGltZXN0YW1wOkRhdGUubm93KCkscHJveHlVcmw6dC5wcm94eVVybCxzb3VyY2U6dC5zb3VyY2VUeXBlfX19Y29uc3QgRz0iMi4wLjMiO2NsYXNzIFNle2NvbnN0cnVjdG9yKGUpe2EodGhpcywiZnJhbWVUcmFuc2Zvcm1lZENvdW50IiwwKSxhKHRoaXMsImZyYW1lRnJvbVNvdXJjZUNvdW50IiwwKSxhKHRoaXMsInN0YXJ0QXQiLDApLGEodGhpcywicmVwb3J0ZXIiKSx0aGlzLmNvbmZpZz1lLHRoaXMucmVwb3J0ZXI9bmV3IEQoZSl9YXN5bmMgb25GcmFtZUZyb21Tb3VyY2UoKXt0aGlzLmZyYW1lRnJvbVNvdXJjZUNvdW50Kyt9Z2V0IGZwcygpe2NvbnN0e3N0YXJ0QXQ6ZSxmcmFtZUZyb21Tb3VyY2VDb3VudDp0fT10aGlzO3JldHVybiB0LygoRGF0ZS5ub3coKS1lKS8xZTMpfWFzeW5jIG9uRnJhbWVUcmFuc2Zvcm1lZChlPXt9LHQ9ITEpezA9PT10aGlzLnN0YXJ0QXQmJih0aGlzLnN0YXJ0QXQ9RGF0ZS5ub3coKSksdGhpcy5mcmFtZVRyYW5zZm9ybWVkQ291bnQrKztjb25zdHtzdGFydEF0OnIsZnJhbWVUcmFuc2Zvcm1lZENvdW50Om4sZnJhbWVGcm9tU291cmNlQ291bnQ6Y309dGhpcyxmPURhdGUubm93KCksaD0oZi1yKS8xZTMsdT1uL2gsZD1jL2g7cmV0dXJuIHR8fHRoaXMuZnJhbWVUcmFuc2Zvcm1lZENvdW50Pj10aGlzLmNvbmZpZy5sb2dnaW5nSW50ZXJ2YWxGcmFtZUNvdW50Pyh0aGlzLmZyYW1lRnJvbVNvdXJjZUNvdW50PTAsdGhpcy5mcmFtZVRyYW5zZm9ybWVkQ291bnQ9MCx0aGlzLnN0YXJ0QXQ9Zix0aGlzLnJlcG9ydGVyLmNvbmZpZz10aGlzLmNvbmZpZyx0aGlzLnJlcG9ydGVyLnNlbmQoey4uLnRoaXMuY29uZmlnLnJlcG9ydCx2YXJpYXRpb246IlFvUyIsZnBzOmQsdHJhbnNmb3JtZWRGcHM6dSxmcmFtZXNUcmFuc2Zvcm1lZDpuLC4uLmV9KSk6InN1Y2Nlc3MifX12YXIgUT0oZT0+KGUucGlwZWxpbmVfZW5kZWQ9InBpcGVsaW5lX2VuZGVkIixlLnBpcGVsaW5lX2VuZGVkX3dpdGhfZXJyb3I9InBpcGVsaW5lX2VuZGVkX3dpdGhfZXJyb3IiLGUucGlwZWxpbmVfc3RhcnRlZD0icGlwZWxpbmVfc3RhcnRlZCIsZS5waXBlbGluZV9zdGFydGVkX3dpdGhfZXJyb3I9InBpcGVsaW5lX3N0YXJ0ZWRfd2l0aF9lcnJvciIsZS5waXBlbGluZV9yZXN0YXJ0ZWQ9InBpcGVsaW5lX3Jlc3RhcnRlZCIsZS5waXBlbGluZV9yZXN0YXJ0ZWRfd2l0aF9lcnJvcj0icGlwZWxpbmVfcmVzdGFydGVkX3dpdGhfZXJyb3IiLGUpKShRfHx7fSk7Y2xhc3MgUGUgZXh0ZW5kcyB5e2NvbnN0cnVjdG9yKGUsdCl7c3VwZXIoKSxhKHRoaXMsInJlcG9ydGVyXyIsbmV3IEQpLGEodGhpcywicmVwb3J0ZXJRb3NfIixuZXcgU2Uoe2xvZ2dpbmdJbnRlcnZhbEZyYW1lQ291bnQ6NTAwLHJlcG9ydDp7dmVyc2lvbjpHfX0pKSxhKHRoaXMsInRyYW5zZm9ybWVyVHlwZV8iKSxhKHRoaXMsInRyYW5zZm9ybWVyXyIpLGEodGhpcywic2hvdWxkU3RvcF8iKSxhKHRoaXMsImlzRmxhc2hlZF8iKSxhKHRoaXMsIm1lZGlhVHJhbnNmb3JtZXJRb3NSZXBvcnRTdGFydFRpbWVzdGFtcF8iKSxhKHRoaXMsInZpZGVvSGVpZ2h0XyIpLGEodGhpcywidmlkZW9XaWR0aF8iKSxhKHRoaXMsInRyYWNrRXhwZWN0ZWRSYXRlXyIpLGEodGhpcywiaW5kZXhfIiksYSh0aGlzLCJjb250cm9sbGVyXyIpLHRoaXMuaW5kZXhfPXQsdGhpcy50cmFuc2Zvcm1lcl89ZSx0aGlzLnNob3VsZFN0b3BfPSExLHRoaXMuaXNGbGFzaGVkXz0hMSx0aGlzLm1lZGlhVHJhbnNmb3JtZXJRb3NSZXBvcnRTdGFydFRpbWVzdGFtcF89MCx0aGlzLnZpZGVvSGVpZ2h0Xz0wLHRoaXMudmlkZW9XaWR0aF89MCx0aGlzLnRyYWNrRXhwZWN0ZWRSYXRlXz0tMSx0aGlzLnRyYW5zZm9ybWVyVHlwZV89IkN1c3RvbSIsImdldFRyYW5zZm9ybWVyVHlwZSJpbiBlJiYodGhpcy50cmFuc2Zvcm1lclR5cGVfPWUuZ2V0VHJhbnNmb3JtZXJUeXBlKCkpLHRoaXMucmVwb3J0KHt2YXJpYXRpb246IkNyZWF0ZSJ9KX1zZXRUcmFja0V4cGVjdGVkUmF0ZShlKXt0aGlzLnRyYWNrRXhwZWN0ZWRSYXRlXz1lfWFzeW5jIHN0YXJ0KGUpe2lmKHRoaXMuY29udHJvbGxlcl89ZSx0aGlzLnRyYW5zZm9ybWVyXyYmImZ1bmN0aW9uIj09dHlwZW9mIHRoaXMudHJhbnNmb3JtZXJfLnN0YXJ0KXRyeXthd2FpdCB0aGlzLnRyYW5zZm9ybWVyXy5zdGFydChlKX1jYXRjaCh0KXt0aGlzLnJlcG9ydCh7bWVzc2FnZTpsLmVycm9ycy50cmFuc2Zvcm1lcl9zdGFydCx2YXJpYXRpb246IkVycm9yIixlcnJvcjp2KHQpfSk7Y29uc3QgZT17ZXZlbnRNZXRhRGF0YTp7dHJhbnNmb3JtZXJJbmRleDp0aGlzLmluZGV4X30sZXJyb3I6dCxmdW5jdGlvbjoic3RhcnQifTt0aGlzLmVtaXQoImVycm9yIixlKX19YXN5bmMgdHJhbnNmb3JtKGUsdCl7dmFyIHIsbixjLGY7aWYoMD09PXRoaXMubWVkaWFUcmFuc2Zvcm1lclFvc1JlcG9ydFN0YXJ0VGltZXN0YW1wXyYmKHRoaXMubWVkaWFUcmFuc2Zvcm1lclFvc1JlcG9ydFN0YXJ0VGltZXN0YW1wXz1EYXRlLm5vdygpKSxlIGluc3RhbmNlb2YgVmlkZW9GcmFtZSYmKHRoaXMudmlkZW9IZWlnaHRfPW51bGwhPShyPW51bGw9PWU/dm9pZCAwOmUuZGlzcGxheUhlaWdodCk/cjowLHRoaXMudmlkZW9XaWR0aF89bnVsbCE9KG49bnVsbD09ZT92b2lkIDA6ZS5kaXNwbGF5V2lkdGgpP246MCksdGhpcy5yZXBvcnRlclFvc18ub25GcmFtZUZyb21Tb3VyY2UoKSx0aGlzLnRyYW5zZm9ybWVyXylpZih0aGlzLnNob3VsZFN0b3BfKWNvbnNvbGUud2FybigiW1BpcGVsaW5lXSBmbHVzaCBmcm9tIHRyYW5zZm9ybSIpLGUuY2xvc2UoKSx0aGlzLmZsdXNoKHQpLHQudGVybWluYXRlKCk7ZWxzZXt0cnl7YXdhaXQobnVsbD09KGY9KGM9dGhpcy50cmFuc2Zvcm1lcl8pLnRyYW5zZm9ybSk/dm9pZCAwOmYuY2FsbChjLGUsdCkpLHRoaXMucmVwb3J0UW9zKCl9Y2F0Y2goaCl7dGhpcy5yZXBvcnQoe21lc3NhZ2U6bC5lcnJvcnMudHJhbnNmb3JtZXJfdHJhbnNmb3JtLHZhcmlhdGlvbjoiRXJyb3IiLGVycm9yOnYoaCl9KTtjb25zdCBlPXtldmVudE1ldGFEYXRhOnt0cmFuc2Zvcm1lckluZGV4OnRoaXMuaW5kZXhffSxlcnJvcjpoLGZ1bmN0aW9uOiJ0cmFuc2Zvcm0ifTt0aGlzLmVtaXQoImVycm9yIixlKX1pZigtMSE9dGhpcy50cmFja0V4cGVjdGVkUmF0ZV8mJi44KnRoaXMudHJhY2tFeHBlY3RlZFJhdGVfPnRoaXMucmVwb3J0ZXJRb3NfLmZwcyl7Y29uc3QgZT17ZXZlbnRNZXRhRGF0YTp7dHJhbnNmb3JtZXJJbmRleDp0aGlzLmluZGV4X30sd2FybmluZ1R5cGU6ImZwc19kcm9wIixkcm9wSW5mbzp7cmVxdWVzdGVkOnRoaXMudHJhY2tFeHBlY3RlZFJhdGVfLGN1cnJlbnQ6dGhpcy5yZXBvcnRlclFvc18uZnBzfX07dGhpcy5lbWl0KCJ3YXJuIixlKX19fWFzeW5jIGZsdXNoKGUpe2lmKHRoaXMudHJhbnNmb3JtZXJfJiYiZnVuY3Rpb24iPT10eXBlb2YgdGhpcy50cmFuc2Zvcm1lcl8uZmx1c2gmJiF0aGlzLmlzRmxhc2hlZF8pe3RoaXMuaXNGbGFzaGVkXz0hMDt0cnl7YXdhaXQgdGhpcy50cmFuc2Zvcm1lcl8uZmx1c2goZSl9Y2F0Y2godCl7dGhpcy5yZXBvcnQoe21lc3NhZ2U6bC5lcnJvcnMudHJhbnNmb3JtZXJfZmx1c2gsdmFyaWF0aW9uOiJFcnJvciIsZXJyb3I6dih0KX0pO2NvbnN0IGU9e2V2ZW50TWV0YURhdGE6e3RyYW5zZm9ybWVySW5kZXg6dGhpcy5pbmRleF99LGVycm9yOnQsZnVuY3Rpb246ImZsdXNoIn07dGhpcy5lbWl0KCJlcnJvciIsZSl9fXRoaXMucmVwb3J0UW9zKCEwKSx0aGlzLnJlcG9ydCh7dmFyaWF0aW9uOiJEZWxldGUifSl9c3RvcCgpe2NvbnNvbGUubG9nKCJbUGlwZWxpbmVdIFN0b3Agc3RyZWFtLiIpLHRoaXMuY29udHJvbGxlcl8mJih0aGlzLmZsdXNoKHRoaXMuY29udHJvbGxlcl8pLHRoaXMuY29udHJvbGxlcl8udGVybWluYXRlKCkpLHRoaXMuc2hvdWxkU3RvcF89ITB9cmVwb3J0KGUpe3RoaXMucmVwb3J0ZXJfLnNlbmQoe3ZlcnNpb246RyxhY3Rpb246Ik1lZGlhVHJhbnNmb3JtZXIiLHRyYW5zZm9ybWVyVHlwZTp0aGlzLnRyYW5zZm9ybWVyVHlwZV8sLi4uZX0pfXJlcG9ydFFvcyhlPSExKXt0aGlzLnJlcG9ydGVyUW9zXy5jb25maWc9ey4uLnRoaXMucmVwb3J0ZXJRb3NfLmNvbmZpZ30sdGhpcy5yZXBvcnRlclFvc18ub25GcmFtZVRyYW5zZm9ybWVkKHt2ZXJzaW9uOkcsYWN0aW9uOiJNZWRpYVRyYW5zZm9ybWVyIix0cmFuc2Zvcm1lclR5cGU6dGhpcy50cmFuc2Zvcm1lclR5cGVfLHZpZGVvV2lkdGg6dGhpcy52aWRlb1dpZHRoXyx2aWRlb0hlaWdodDp0aGlzLnZpZGVvSGVpZ2h0X30sZSl9fWNsYXNzIE1lIGV4dGVuZHMgeXtjb25zdHJ1Y3RvcihlKXtzdXBlcigpLGEodGhpcywidHJhbnNmb3JtZXJzXyIpLGEodGhpcywidHJhY2tFeHBlY3RlZFJhdGVfIiksdGhpcy50cmFuc2Zvcm1lcnNfPVtdLHRoaXMudHJhY2tFeHBlY3RlZFJhdGVfPS0xO2ZvcihsZXQgdD0wO3Q8ZS5sZW5ndGg7dCsrKXtsZXQgcj1uZXcgUGUoZVt0XSx0KTtyLm9uKCJlcnJvciIsKGU9Pnt0aGlzLmVtaXQoImVycm9yIixlKX0pKSxyLm9uKCJ3YXJuIiwoZT0+e3RoaXMuZW1pdCgid2FybiIsZSl9KSksdGhpcy50cmFuc2Zvcm1lcnNfLnB1c2gocil9fXNldFRyYWNrRXhwZWN0ZWRSYXRlKGUpe3RoaXMudHJhY2tFeHBlY3RlZFJhdGVfPWU7Zm9yKGxldCB0IG9mIHRoaXMudHJhbnNmb3JtZXJzXyl0LnNldFRyYWNrRXhwZWN0ZWRSYXRlKHRoaXMudHJhY2tFeHBlY3RlZFJhdGVfKX1hc3luYyBzdGFydChlLHQpe2lmKHRoaXMudHJhbnNmb3JtZXJzXyYmMCE9PXRoaXMudHJhbnNmb3JtZXJzXy5sZW5ndGgpe3RyeXtsZXQgcj1lO2ZvcihsZXQgdCBvZiB0aGlzLnRyYW5zZm9ybWVyc18pZT1lLnBpcGVUaHJvdWdoKG5ldyBUcmFuc2Zvcm1TdHJlYW0odCkpO2UucGlwZVRvKHQpLnRoZW4oKGFzeW5jKCk9Pntjb25zb2xlLmxvZygiW1BpcGVsaW5lXSBTZXR1cC4iKSxhd2FpdCB0LmFib3J0KCksYXdhaXQgci5jYW5jZWwoKSx0aGlzLmVtaXQoInBpcGVsaW5lSW5mbyIsInBpcGVsaW5lX2VuZGVkIil9KSkuY2F0Y2goKGFzeW5jIG49PntlLmNhbmNlbCgpLnRoZW4oKCgpPT57Y29uc29sZS5sb2coIltQaXBlbGluZV0gU2h1dHRpbmcgZG93biBzdHJlYW1zIGFmdGVyIGFib3J0LiIpfSkpLmNhdGNoKChlPT57Y29uc29sZS5lcnJvcigiW1BpcGVsaW5lXSBFcnJvciBmcm9tIHN0cmVhbSB0cmFuc2Zvcm06IixlKX0pKSxhd2FpdCB0LmFib3J0KG4pLGF3YWl0IHIuY2FuY2VsKG4pLHRoaXMuZW1pdCgicGlwZWxpbmVJbmZvIiwicGlwZWxpbmVfZW5kZWRfd2l0aF9lcnJvciIpfSkpfWNhdGNoe3JldHVybiB0aGlzLmVtaXQoInBpcGVsaW5lSW5mbyIsInBpcGVsaW5lX3N0YXJ0ZWRfd2l0aF9lcnJvciIpLHZvaWQgdGhpcy5kZXN0cm95KCl9dGhpcy5lbWl0KCJwaXBlbGluZUluZm8iLCJwaXBlbGluZV9zdGFydGVkIiksY29uc29sZS5sb2coIltQaXBlbGluZV0gUGlwZWxpbmUgc3RhcnRlZC4iKX1lbHNlIGNvbnNvbGUubG9nKCJbUGlwZWxpbmVdIE5vIHRyYW5zZm9ybWVycy4iKX1hc3luYyBkZXN0cm95KCl7Y29uc29sZS5sb2coIltQaXBlbGluZV0gRGVzdHJveWluZyBQaXBlbGluZS4iKTtmb3IobGV0IGUgb2YgdGhpcy50cmFuc2Zvcm1lcnNfKWUuc3RvcCgpfX1jbGFzcyBPZSBleHRlbmRzIHl7Y29uc3RydWN0b3IoKXtzdXBlcigpLGEodGhpcywicmVwb3J0ZXJfIiksYSh0aGlzLCJwaXBlbGluZV8iKSxhKHRoaXMsInRyYW5zZm9ybWVyc18iKSxhKHRoaXMsInJlYWRhYmxlXyIpLGEodGhpcywid3JpdGFibGVfIiksYSh0aGlzLCJ0cmFja0V4cGVjdGVkUmF0ZV8iKSx0aGlzLnJlcG9ydGVyXz1uZXcgRCx0aGlzLnRyYWNrRXhwZWN0ZWRSYXRlXz0tMSx0aGlzLnJlcG9ydCh7dmFyaWF0aW9uOiJDcmVhdGUifSl9c2V0VHJhY2tFeHBlY3RlZFJhdGUoZSl7dGhpcy50cmFja0V4cGVjdGVkUmF0ZV89ZSx0aGlzLnBpcGVsaW5lXyYmdGhpcy5waXBlbGluZV8uc2V0VHJhY2tFeHBlY3RlZFJhdGUodGhpcy50cmFja0V4cGVjdGVkUmF0ZV8pfXRyYW5zZm9ybShlLHQpe3JldHVybiB0aGlzLnJlYWRhYmxlXz1lLHRoaXMud3JpdGFibGVfPXQsdGhpcy50cmFuc2Zvcm1JbnRlcm5hbCgpfXRyYW5zZm9ybUludGVybmFsKCl7cmV0dXJuIG5ldyBQcm9taXNlKChhc3luYyhlLHQpPT57aWYoIXRoaXMudHJhbnNmb3JtZXJzX3x8MD09PXRoaXMudHJhbnNmb3JtZXJzXy5sZW5ndGgpcmV0dXJuIHRoaXMucmVwb3J0KHttZXNzYWdlOmwuZXJyb3JzLnRyYW5zZm9ybWVyX25vbmUsdmFyaWF0aW9uOiJFcnJvciJ9KSx2b2lkIHQoIltNZWRpYVByb2Nlc3Nvcl0gTmVlZCB0byBzZXQgdHJhbnNmb3JtZXJzLiIpO2lmKCF0aGlzLnJlYWRhYmxlXylyZXR1cm4gdGhpcy5yZXBvcnQoe3ZhcmlhdGlvbjoiRXJyb3IiLG1lc3NhZ2U6bC5lcnJvcnMucmVhZGFibGVfbnVsbH0pLHZvaWQgdCgiW01lZGlhUHJvY2Vzc29yXSBSZWFkYWJsZSBpcyBudWxsLiIpO2lmKCF0aGlzLndyaXRhYmxlXylyZXR1cm4gdGhpcy5yZXBvcnQoe3ZhcmlhdGlvbjoiRXJyb3IiLG1lc3NhZ2U6bC5lcnJvcnMud3JpdGFibGVfbnVsbH0pLHZvaWQgdCgiW01lZGlhUHJvY2Vzc29yXSBXcml0YWJsZSBpcyBudWxsLiIpO2xldCByPSExO3RoaXMucGlwZWxpbmVfJiYocj0hMCx0aGlzLnBpcGVsaW5lXy5jbGVhckxpc3RlbmVycygpLHRoaXMucGlwZWxpbmVfLmRlc3Ryb3koKSksdGhpcy5waXBlbGluZV89bmV3IE1lKHRoaXMudHJhbnNmb3JtZXJzXyksdGhpcy5waXBlbGluZV8ub24oIndhcm4iLChlPT57dGhpcy5lbWl0KCJ3YXJuIixlKX0pKSx0aGlzLnBpcGVsaW5lXy5vbigiZXJyb3IiLChlPT57dGhpcy5lbWl0KCJlcnJvciIsZSl9KSksdGhpcy5waXBlbGluZV8ub24oInBpcGVsaW5lSW5mbyIsKGU9PntyJiYoInBpcGVsaW5lX3N0YXJ0ZWQiPT09ZT9lPVEucGlwZWxpbmVfcmVzdGFydGVkOiJwaXBlbGluZV9zdGFydGVkX3dpdGhfZXJyb3IiPT09ZSYmKGU9US5waXBlbGluZV9yZXN0YXJ0ZWRfd2l0aF9lcnJvcikpLHRoaXMuZW1pdCgicGlwZWxpbmVJbmZvIixlKX0pKSwtMSE9dGhpcy50cmFja0V4cGVjdGVkUmF0ZV8mJnRoaXMucGlwZWxpbmVfLnNldFRyYWNrRXhwZWN0ZWRSYXRlKHRoaXMudHJhY2tFeHBlY3RlZFJhdGVfKSx0aGlzLnBpcGVsaW5lXy5zdGFydCh0aGlzLnJlYWRhYmxlXyx0aGlzLndyaXRhYmxlXykudGhlbigoKCk9PntlKCl9KSkuY2F0Y2goKGU9Pnt0KGUpfSkpfSkpfXNldFRyYW5zZm9ybWVycyhlKXtyZXR1cm4gdGhpcy5yZXBvcnQoe3ZhcmlhdGlvbjoiVXBkYXRlIixtZXNzYWdlOmwudXBkYXRlcy50cmFuc2Zvcm1lcl9uZXd9KSx0aGlzLnRyYW5zZm9ybWVyc189ZSx0aGlzLnJlYWRhYmxlXyYmdGhpcy53cml0YWJsZV8/dGhpcy50cmFuc2Zvcm1JbnRlcm5hbCgpOlByb21pc2UucmVzb2x2ZSgpfWRlc3Ryb3koKXtyZXR1cm4gbmV3IFByb21pc2UoKGFzeW5jIGU9Pnt0aGlzLnBpcGVsaW5lXyYmdGhpcy5waXBlbGluZV8uZGVzdHJveSgpLHRoaXMucmVwb3J0KHt2YXJpYXRpb246IkRlbGV0ZSJ9KSxlKCl9KSl9cmVwb3J0KGUpe3RoaXMucmVwb3J0ZXJfLnNlbmQoe3ZlcnNpb246RyxhY3Rpb246Ik1lZGlhUHJvY2Vzc29yIiwuLi5lfSl9fWNvbnN0IFY9bmV3IFdlYWtNYXAsWT1uZXcgV2Vha01hcCxLPW5ldyBXZWFrTWFwLFo9U3ltYm9sKCJhbnlQcm9kdWNlciIpLGVlPVByb21pc2UucmVzb2x2ZSgpLHRlPVN5bWJvbCgibGlzdGVuZXJBZGRlZCIpLHJlPVN5bWJvbCgibGlzdGVuZXJSZW1vdmVkIik7bGV0IHNlPSExLG9lPSExO2Z1bmN0aW9uIGFzc2VydEV2ZW50TmFtZSQxKGUpe2lmKCJzdHJpbmciIT10eXBlb2YgZSYmInN5bWJvbCIhPXR5cGVvZiBlJiYibnVtYmVyIiE9dHlwZW9mIGUpdGhyb3cgbmV3IFR5cGVFcnJvcigiYGV2ZW50TmFtZWAgbXVzdCBiZSBhIHN0cmluZywgc3ltYm9sLCBvciBudW1iZXIiKX1mdW5jdGlvbiBhc3NlcnRMaXN0ZW5lciQxKGUpe2lmKCJmdW5jdGlvbiIhPXR5cGVvZiBlKXRocm93IG5ldyBUeXBlRXJyb3IoImxpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbiIpfWZ1bmN0aW9uIGdldExpc3RlbmVycyQxKGUsdCl7Y29uc3Qgcj1ZLmdldChlKTtpZihyLmhhcyh0KSlyZXR1cm4gci5nZXQodCl9ZnVuY3Rpb24gZ2V0RXZlbnRQcm9kdWNlcnMkMShlLHQpe2NvbnN0IHI9InN0cmluZyI9PXR5cGVvZiB0fHwic3ltYm9sIj09dHlwZW9mIHR8fCJudW1iZXIiPT10eXBlb2YgdD90Olosbj1LLmdldChlKTtpZihuLmhhcyhyKSlyZXR1cm4gbi5nZXQocil9ZnVuY3Rpb24gaXRlcmF0b3IkMShlLHQpe3Q9QXJyYXkuaXNBcnJheSh0KT90Olt0XTtsZXQgcj0hMSxmbHVzaD0oKT0+e30sbj1bXTtjb25zdCBjPXtlbnF1ZXVlKGUpe24ucHVzaChlKSxmbHVzaCgpfSxmaW5pc2goKXtyPSEwLGZsdXNoKCl9fTtmb3IoY29uc3QgZiBvZiB0KXtsZXQgdD1nZXRFdmVudFByb2R1Y2VycyQxKGUsZik7aWYoIXQpe3Q9bmV3IFNldDtLLmdldChlKS5zZXQoZix0KX10LmFkZChjKX1yZXR1cm57YXN5bmMgbmV4dCgpe3JldHVybiBuPzA9PT1uLmxlbmd0aD9yPyhuPXZvaWQgMCx0aGlzLm5leHQoKSk6KGF3YWl0IG5ldyBQcm9taXNlKChlPT57Zmx1c2g9ZX0pKSx0aGlzLm5leHQoKSk6e2RvbmU6ITEsdmFsdWU6YXdhaXQgbi5zaGlmdCgpfTp7ZG9uZTohMH19LGFzeW5jIHJldHVybihyKXtuPXZvaWQgMDtmb3IoY29uc3QgbiBvZiB0KXtjb25zdCB0PWdldEV2ZW50UHJvZHVjZXJzJDEoZSxuKTtpZih0JiYodC5kZWxldGUoYyksMD09PXQuc2l6ZSkpe0suZ2V0KGUpLmRlbGV0ZShuKX19cmV0dXJuIGZsdXNoKCksYXJndW1lbnRzLmxlbmd0aD4wP3tkb25lOiEwLHZhbHVlOmF3YWl0IHJ9Ontkb25lOiEwfX0sW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpe3JldHVybiB0aGlzfX19ZnVuY3Rpb24gZGVmYXVsdE1ldGhvZE5hbWVzT3JBc3NlcnQkMShlKXtpZih2b2lkIDA9PT1lKXJldHVybiBmZTtpZighQXJyYXkuaXNBcnJheShlKSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgbWV0aG9kTmFtZXNgIG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncyIpO2Zvcihjb25zdCB0IG9mIGUpaWYoIWZlLmluY2x1ZGVzKHQpKXtpZigic3RyaW5nIiE9dHlwZW9mIHQpdGhyb3cgbmV3IFR5cGVFcnJvcigiYG1ldGhvZE5hbWVzYCBlbGVtZW50IG11c3QgYmUgYSBzdHJpbmciKTt0aHJvdyBuZXcgRXJyb3IoYCR7dH0gaXMgbm90IEVtaXR0ZXJ5IG1ldGhvZGApfXJldHVybiBlfWNvbnN0IGlzTWV0YUV2ZW50JDE9ZT0+ZT09PXRlfHxlPT09cmU7ZnVuY3Rpb24gZW1pdE1ldGFFdmVudCQxKGUsdCxyKXtpZihpc01ldGFFdmVudCQxKHQpKXRyeXtzZT0hMCxlLmVtaXQodCxyKX1maW5hbGx5e3NlPSExfX1sZXQgYWU9Y2xhc3MgRW1pdHRlcnkye3N0YXRpYyBtaXhpbihlLHQpe3JldHVybiB0PWRlZmF1bHRNZXRob2ROYW1lc09yQXNzZXJ0JDEodCkscj0+e2lmKCJmdW5jdGlvbiIhPXR5cGVvZiByKXRocm93IG5ldyBUeXBlRXJyb3IoImB0YXJnZXRgIG11c3QgYmUgZnVuY3Rpb24iKTtmb3IoY29uc3QgZSBvZiB0KWlmKHZvaWQgMCE9PXIucHJvdG90eXBlW2VdKXRocm93IG5ldyBFcnJvcihgVGhlIHByb3BlcnR5IFxgJHtlfVxgIGFscmVhZHkgZXhpc3RzIG9uIFxgdGFyZ2V0XGBgKTtPYmplY3QuZGVmaW5lUHJvcGVydHkoci5wcm90b3R5cGUsZSx7ZW51bWVyYWJsZTohMSxnZXQ6ZnVuY3Rpb24gZ2V0RW1pdHRlcnlQcm9wZXJ0eSgpe3JldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcyxlLHtlbnVtZXJhYmxlOiExLHZhbHVlOm5ldyBFbWl0dGVyeTJ9KSx0aGlzW2VdfX0pO2NvbnN0IGVtaXR0ZXJ5TWV0aG9kQ2FsbGVyPXQ9PmZ1bmN0aW9uKC4uLnIpe3JldHVybiB0aGlzW2VdW3RdKC4uLnIpfTtmb3IoY29uc3QgZSBvZiB0KU9iamVjdC5kZWZpbmVQcm9wZXJ0eShyLnByb3RvdHlwZSxlLHtlbnVtZXJhYmxlOiExLHZhbHVlOmVtaXR0ZXJ5TWV0aG9kQ2FsbGVyKGUpfSk7cmV0dXJuIHJ9fXN0YXRpYyBnZXQgaXNEZWJ1Z0VuYWJsZWQoKXtpZigib2JqZWN0IiE9dHlwZW9mIGdsb2JhbFRoaXMucHJvY2Vzcz8uZW52KXJldHVybiBvZTtjb25zdHtlbnY6ZX09Z2xvYmFsVGhpcy5wcm9jZXNzPz97ZW52Ont9fTtyZXR1cm4iZW1pdHRlcnkiPT09ZS5ERUJVR3x8IioiPT09ZS5ERUJVR3x8b2V9c3RhdGljIHNldCBpc0RlYnVnRW5hYmxlZChlKXtvZT1lfWNvbnN0cnVjdG9yKGU9e30pe1Yuc2V0KHRoaXMsbmV3IFNldCksWS5zZXQodGhpcyxuZXcgTWFwKSxLLnNldCh0aGlzLG5ldyBNYXApLEsuZ2V0KHRoaXMpLnNldChaLG5ldyBTZXQpLHRoaXMuZGVidWc9ZS5kZWJ1Zz8/e30sdm9pZCAwPT09dGhpcy5kZWJ1Zy5lbmFibGVkJiYodGhpcy5kZWJ1Zy5lbmFibGVkPSExKSx0aGlzLmRlYnVnLmxvZ2dlcnx8KHRoaXMuZGVidWcubG9nZ2VyPShlLHQscixuKT0+e3RyeXtuPUpTT04uc3RyaW5naWZ5KG4pfWNhdGNoe249YE9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcga2V5cyBmYWlsZWQgdG8gc3RyaW5naWZ5OiAke09iamVjdC5rZXlzKG4pLmpvaW4oIiwiKX1gfSJzeW1ib2wiIT10eXBlb2YgciYmIm51bWJlciIhPXR5cGVvZiByfHwocj1yLnRvU3RyaW5nKCkpO2NvbnN0IGM9bmV3IERhdGUsZj1gJHtjLmdldEhvdXJzKCl9OiR7Yy5nZXRNaW51dGVzKCl9OiR7Yy5nZXRTZWNvbmRzKCl9LiR7Yy5nZXRNaWxsaXNlY29uZHMoKX1gO2NvbnNvbGUubG9nKGBbJHtmfV1bZW1pdHRlcnk6JHtlfV1bJHt0fV0gRXZlbnQgTmFtZTogJHtyfVxuXHRkYXRhOiAke259YCl9KX1sb2dJZkRlYnVnRW5hYmxlZChlLHQscil7KEVtaXR0ZXJ5Mi5pc0RlYnVnRW5hYmxlZHx8dGhpcy5kZWJ1Zy5lbmFibGVkKSYmdGhpcy5kZWJ1Zy5sb2dnZXIoZSx0aGlzLmRlYnVnLm5hbWUsdCxyKX1vbihlLHQpe2Fzc2VydExpc3RlbmVyJDEodCksZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCByIG9mIGUpe2Fzc2VydEV2ZW50TmFtZSQxKHIpO2xldCBlPWdldExpc3RlbmVycyQxKHRoaXMscik7aWYoIWUpe2U9bmV3IFNldDtZLmdldCh0aGlzKS5zZXQocixlKX1lLmFkZCh0KSx0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJzdWJzY3JpYmUiLHIsdm9pZCAwKSxpc01ldGFFdmVudCQxKHIpfHxlbWl0TWV0YUV2ZW50JDEodGhpcyx0ZSx7ZXZlbnROYW1lOnIsbGlzdGVuZXI6dH0pfXJldHVybiB0aGlzLm9mZi5iaW5kKHRoaXMsZSx0KX1vZmYoZSx0KXthc3NlcnRMaXN0ZW5lciQxKHQpLGU9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgciBvZiBlKXthc3NlcnRFdmVudE5hbWUkMShyKTtjb25zdCBlPWdldExpc3RlbmVycyQxKHRoaXMscik7aWYoZSYmKGUuZGVsZXRlKHQpLDA9PT1lLnNpemUpKXtZLmdldCh0aGlzKS5kZWxldGUocil9dGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgidW5zdWJzY3JpYmUiLHIsdm9pZCAwKSxpc01ldGFFdmVudCQxKHIpfHxlbWl0TWV0YUV2ZW50JDEodGhpcyxyZSx7ZXZlbnROYW1lOnIsbGlzdGVuZXI6dH0pfX1vbmNlKGUpe2xldCB0O2NvbnN0IHI9bmV3IFByb21pc2UoKHI9Pnt0PXRoaXMub24oZSwoZT0+e3QoKSxyKGUpfSkpfSkpO3JldHVybiByLm9mZj10LHJ9ZXZlbnRzKGUpe2U9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgdCBvZiBlKWFzc2VydEV2ZW50TmFtZSQxKHQpO3JldHVybiBpdGVyYXRvciQxKHRoaXMsZSl9YXN5bmMgZW1pdChlLHQpe2lmKGFzc2VydEV2ZW50TmFtZSQxKGUpLGlzTWV0YUV2ZW50JDEoZSkmJiFzZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgZXZlbnROYW1lYCBjYW5ub3QgYmUgbWV0YSBldmVudCBgbGlzdGVuZXJBZGRlZGAgb3IgYGxpc3RlbmVyUmVtb3ZlZGAiKTt0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJlbWl0IixlLHQpLGZ1bmN0aW9uIGVucXVldWVQcm9kdWNlcnMkMShlLHQscil7Y29uc3Qgbj1LLmdldChlKTtpZihuLmhhcyh0KSlmb3IoY29uc3QgYyBvZiBuLmdldCh0KSljLmVucXVldWUocik7aWYobi5oYXMoWikpe2NvbnN0IGU9UHJvbWlzZS5hbGwoW3Qscl0pO2Zvcihjb25zdCB0IG9mIG4uZ2V0KFopKXQuZW5xdWV1ZShlKX19KHRoaXMsZSx0KTtjb25zdCByPWdldExpc3RlbmVycyQxKHRoaXMsZSk/P25ldyBTZXQsbj1WLmdldCh0aGlzKSxjPVsuLi5yXSxmPWlzTWV0YUV2ZW50JDEoZSk/W106Wy4uLm5dO2F3YWl0IGVlLGF3YWl0IFByb21pc2UuYWxsKFsuLi5jLm1hcCgoYXN5bmMgZT0+e2lmKHIuaGFzKGUpKXJldHVybiBlKHQpfSkpLC4uLmYubWFwKChhc3luYyByPT57aWYobi5oYXMocikpcmV0dXJuIHIoZSx0KX0pKV0pfWFzeW5jIGVtaXRTZXJpYWwoZSx0KXtpZihhc3NlcnRFdmVudE5hbWUkMShlKSxpc01ldGFFdmVudCQxKGUpJiYhc2UpdGhyb3cgbmV3IFR5cGVFcnJvcigiYGV2ZW50TmFtZWAgY2Fubm90IGJlIG1ldGEgZXZlbnQgYGxpc3RlbmVyQWRkZWRgIG9yIGBsaXN0ZW5lclJlbW92ZWRgIik7dGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgiZW1pdFNlcmlhbCIsZSx0KTtjb25zdCByPWdldExpc3RlbmVycyQxKHRoaXMsZSk/P25ldyBTZXQsbj1WLmdldCh0aGlzKSxjPVsuLi5yXSxmPVsuLi5uXTthd2FpdCBlZTtmb3IoY29uc3QgaCBvZiBjKXIuaGFzKGgpJiZhd2FpdCBoKHQpO2Zvcihjb25zdCBoIG9mIGYpbi5oYXMoaCkmJmF3YWl0IGgoZSx0KX1vbkFueShlKXtyZXR1cm4gYXNzZXJ0TGlzdGVuZXIkMShlKSx0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJzdWJzY3JpYmVBbnkiLHZvaWQgMCx2b2lkIDApLFYuZ2V0KHRoaXMpLmFkZChlKSxlbWl0TWV0YUV2ZW50JDEodGhpcyx0ZSx7bGlzdGVuZXI6ZX0pLHRoaXMub2ZmQW55LmJpbmQodGhpcyxlKX1hbnlFdmVudCgpe3JldHVybiBpdGVyYXRvciQxKHRoaXMpfW9mZkFueShlKXthc3NlcnRMaXN0ZW5lciQxKGUpLHRoaXMubG9nSWZEZWJ1Z0VuYWJsZWQoInVuc3Vic2NyaWJlQW55Iix2b2lkIDAsdm9pZCAwKSxlbWl0TWV0YUV2ZW50JDEodGhpcyxyZSx7bGlzdGVuZXI6ZX0pLFYuZ2V0KHRoaXMpLmRlbGV0ZShlKX1jbGVhckxpc3RlbmVycyhlKXtlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07Zm9yKGNvbnN0IHQgb2YgZSlpZih0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJjbGVhciIsdCx2b2lkIDApLCJzdHJpbmciPT10eXBlb2YgdHx8InN5bWJvbCI9PXR5cGVvZiB0fHwibnVtYmVyIj09dHlwZW9mIHQpe2NvbnN0IGU9Z2V0TGlzdGVuZXJzJDEodGhpcyx0KTtlJiZlLmNsZWFyKCk7Y29uc3Qgcj1nZXRFdmVudFByb2R1Y2VycyQxKHRoaXMsdCk7aWYocil7Zm9yKGNvbnN0IGUgb2YgcillLmZpbmlzaCgpO3IuY2xlYXIoKX19ZWxzZXtWLmdldCh0aGlzKS5jbGVhcigpO2Zvcihjb25zdFtlLHRdb2YgWS5nZXQodGhpcykuZW50cmllcygpKXQuY2xlYXIoKSxZLmdldCh0aGlzKS5kZWxldGUoZSk7Zm9yKGNvbnN0W2UsdF1vZiBLLmdldCh0aGlzKS5lbnRyaWVzKCkpe2Zvcihjb25zdCBlIG9mIHQpZS5maW5pc2goKTt0LmNsZWFyKCksSy5nZXQodGhpcykuZGVsZXRlKGUpfX19bGlzdGVuZXJDb3VudChlKXtlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07bGV0IHQ9MDtmb3IoY29uc3QgciBvZiBlKWlmKCJzdHJpbmciIT10eXBlb2Ygcil7dm9pZCAwIT09ciYmYXNzZXJ0RXZlbnROYW1lJDEociksdCs9Vi5nZXQodGhpcykuc2l6ZTtmb3IoY29uc3QgZSBvZiBZLmdldCh0aGlzKS52YWx1ZXMoKSl0Kz1lLnNpemU7Zm9yKGNvbnN0IGUgb2YgSy5nZXQodGhpcykudmFsdWVzKCkpdCs9ZS5zaXplfWVsc2UgdCs9Vi5nZXQodGhpcykuc2l6ZSsoZ2V0TGlzdGVuZXJzJDEodGhpcyxyKT8uc2l6ZT8/MCkrKGdldEV2ZW50UHJvZHVjZXJzJDEodGhpcyxyKT8uc2l6ZT8/MCkrKGdldEV2ZW50UHJvZHVjZXJzJDEodGhpcyk/LnNpemU/PzApO3JldHVybiB0fWJpbmRNZXRob2RzKGUsdCl7aWYoIm9iamVjdCIhPXR5cGVvZiBlfHxudWxsPT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgdGFyZ2V0YCBtdXN0IGJlIGFuIG9iamVjdCIpO3Q9ZGVmYXVsdE1ldGhvZE5hbWVzT3JBc3NlcnQkMSh0KTtmb3IoY29uc3QgciBvZiB0KXtpZih2b2lkIDAhPT1lW3JdKXRocm93IG5ldyBFcnJvcihgVGhlIHByb3BlcnR5IFxgJHtyfVxgIGFscmVhZHkgZXhpc3RzIG9uIFxgdGFyZ2V0XGBgKTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLHtlbnVtZXJhYmxlOiExLHZhbHVlOnRoaXNbcl0uYmluZCh0aGlzKX0pfX19O2NvbnN0IGZlPU9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFlLnByb3RvdHlwZSkuZmlsdGVyKChlPT4iY29uc3RydWN0b3IiIT09ZSkpO09iamVjdC5kZWZpbmVQcm9wZXJ0eShhZSwibGlzdGVuZXJBZGRlZCIse3ZhbHVlOnRlLHdyaXRhYmxlOiExLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiExfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGFlLCJsaXN0ZW5lclJlbW92ZWQiLHt2YWx1ZTpyZSx3cml0YWJsZTohMSxlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMX0pO2NsYXNzIEF2ZXJhZ2V7Y29uc3RydWN0b3IoZSl7dGhpcy5zaXplPWUsdGhpcy52YWx1ZXM9W10sdGhpcy5zdW09MH1wdXNoKGUpe2Zvcih0aGlzLnZhbHVlcy5wdXNoKGUpLHRoaXMuc3VtKz1lO3RoaXMuc2l6ZTx0aGlzLnZhbHVlcy5sZW5ndGg7KXRoaXMuc3VtLT10aGlzLnZhbHVlcy5zaGlmdCgpPz8wfXZhbHVlKCl7cmV0dXJuIHRoaXMuc3VtL01hdGgubWF4KDEsdGhpcy52YWx1ZXMubGVuZ3RoKX19Y2xhc3MgTm9pc2VTdXBwcmVzc2lvblRyYW5zZm9ybWVyIGV4dGVuZHMgYWV7Y29uc3RydWN0b3IoKXtzdXBlcigpLHRoaXMuaXNFbmFibGVkPSEwLHRoaXMuaW50ZXJuYWxSZXNhbXBsZVN1cHBvcnRlZD0hMSx0aGlzLmxhdGVuY3k9bmV3IEF2ZXJhZ2UoMTAwKSx0aGlzLnRyYW5zZm9ybT10aGlzLnRyYW5zZm9ybUF1ZGlvRGF0YS5iaW5kKHRoaXMpfWFzeW5jIGluaXQoZT17fSl7Y29uc29sZS5sb2coIk5vaXNlIHN1cHByZXNzaW9uIHRyYW5zZm9ybWVyIGluaXRpYWxpemF0aW9uIiksdGhpcy50cmFuc2Zvcm09ZS5kZWJ1Zz90aGlzLnRyYW5zZm9ybURlYnVnLmJpbmQodGhpcyk6dGhpcy50cmFuc2Zvcm1BdWRpb0RhdGEuYmluZCh0aGlzKTtjb25zdCB0PWUuYXNzZXRzRGlyQmFzZVVybD8/Imh0dHBzOi8vZDNvcHFqbXF6eGYwNTcuY2xvdWRmcm9udC5uZXQvbm9pc2Utc3VwcHJlc3Npb24vMS4wLjAtYmV0YS45Iixsb2NhdGVGaWxlPWU9PmAke3R9LyR7ZX1gO2xldCByLG49MTthd2FpdCB0aGlzLmlzTW9ub1RocmVhZChlKT90aGlzLndhc21JbnN0YW5jZT1hd2FpdCBjcmVhdGVXYXNtTW9ub0luc3RhbmNlKHtsb2NhdGVGaWxlOmxvY2F0ZUZpbGUsbWFpblNjcmlwdFVybE9yQmxvYjpsb2NhdGVGaWxlKCJtYWluLWJpbi1tb25vLmpzIil9KToodGhpcy53YXNtSW5zdGFuY2U9YXdhaXQgY3JlYXRlV2FzbU11bHRpSW5zdGFuY2Uoe2xvY2F0ZUZpbGU6bG9jYXRlRmlsZSxtYWluU2NyaXB0VXJsT3JCbG9iOmxvY2F0ZUZpbGUoIm1haW4tYmluLW11bHRpLmpzIil9KSxuPTQpLHRoaXMud2FzbVRyYW5zZm9ybWVyPW5ldyB0aGlzLndhc21JbnN0YW5jZS5EdGxuVHJhbnNmb3JtZXIsYXdhaXQgUHJvbWlzZS5hbGwoW3RoaXMubG9hZE1vZGVsKGAke3R9L21vZGVsXzEudGZsaXRlYCwxKSx0aGlzLmxvYWRNb2RlbChgJHt0fS9tb2RlbF8yLnRmbGl0ZWAsMildKTt0cnl7cj1hd2FpdCh0aGlzLndhc21UcmFuc2Zvcm1lcj8uaW5pdChuKSl9Y2F0Y2goYyl7aWYoIm51bWJlciI9PXR5cGVvZiBjKXtsZXQgZT0iIjtmb3IobGV0IHQ9MDt0PDUwMDsrK3QpZSs9U3RyaW5nLmZyb21DaGFyQ29kZSh0aGlzLndhc21JbnN0YW5jZS5IRUFQOFtjK3RdKTtjb25zb2xlLmVycm9yKGUpfWVsc2UgY29uc29sZS5lcnJvcihjKX1pZigwIT09cil7Y29uc3QgZT1gRmFpbCB0byBpbml0IHdhc20gdHJhbnNmb3JtZXIsIGVycm9yIGNvZGUgPSAke3J9YDt0aHJvdyBjb25zb2xlLmVycm9yKGUpLGV9aWYodGhpcy5pbnRlcm5hbFJlc2FtcGxlU3VwcG9ydGVkPXRoaXMud2FzbVRyYW5zZm9ybWVyPy5nZXRJbnRlcm5hbFJlc2FtcGxlU3VwcG9ydGVkKCksIXRoaXMuaW50ZXJuYWxSZXNhbXBsZVN1cHBvcnRlZCl7Y29uc3QgZT0iSW50ZXJuYWwgcmVzYW1wbGluZyBub3Qgc3VwcG9ydGVkIjt0aHJvdyBjb25zb2xlLmVycm9yKGUpLGV9ZS5kZWJ1ZyYmdGhpcy53YXNtVHJhbnNmb3JtZXI/LmVuYWJsZVdhdkV4cG9ydCgpLGNvbnNvbGUubG9nKCJOb2lzZSBzdXBwcmVzc2lvbiB0cmFuc2Zvcm1lciByZWFkeSIpfWdldFdhdigpe2lmKCF0aGlzLndhc21UcmFuc2Zvcm1lcilyZXR1cm4iIjt0aGlzLndhc21UcmFuc2Zvcm1lci5jbG9zZVdhdigpO2NvbnN0IGU9dGhpcy53YXNtVHJhbnNmb3JtZXIuZ2V0V2F2KCk7cmV0dXJuYGRhdGE6YXVkaW8vd2F2O2Jhc2U2NCwke2J0b2EobmV3IFVpbnQ4QXJyYXkoZSkucmVkdWNlKCgoZSx0KT0+ZStTdHJpbmcuZnJvbUNoYXJDb2RlKHQpKSwiIikpfWB9c2V0QXVkaW9PcHRpb25zKGUsdCxyLG4sYyl7dGhpcy53YXNtVHJhbnNmb3JtZXI/LnNldEF1ZGlvT3B0aW9ucyhlLHQscixuLGMpfWVuYWJsZSgpe3RoaXMuaXNFbmFibGVkPSEwfWRpc2FibGUoKXt0aGlzLmlzRW5hYmxlZD0hMX1nZXRMYXRlbmN5KCl7cmV0dXJuIHRoaXMubGF0ZW5jeS52YWx1ZSgpfWdldFdhc21MYXRlbmN5TnMoKXtyZXR1cm4gdGhpcy53YXNtVHJhbnNmb3JtZXI/LmdldExhdGVuY3lOcygpPz8wfWFzeW5jIHRyYW5zZm9ybURlYnVnKGUsdCl7dHJ5e2NvbnN0IHI9cGVyZm9ybWFuY2Uubm93KCk7YXdhaXQgdGhpcy50cmFuc2Zvcm1BdWRpb0RhdGEoZSx0KSx0aGlzLmxhdGVuY3kucHVzaChwZXJmb3JtYW5jZS5ub3coKS1yKX1jYXRjaChyKXtjb25zb2xlLmVycm9yKHIpfX1hc3luYyB0cmFuc2Zvcm1BdWRpb0RhdGEoZSx0KXtpZih0aGlzLndhc21UcmFuc2Zvcm1lcnx8dGhpcy5lbWl0KCJ3YXJuaW5nIiwidHJhbnNmb3JtZXIgbm90IGluaXRpYWxpemVkIiksdGhpcy5pc0VuYWJsZWQmJnRoaXMud2FzbVRyYW5zZm9ybWVyKXRyeXtjb25zdHtudW1iZXJPZkZyYW1lczp0LHNhbXBsZVJhdGU6bixudW1iZXJPZkNoYW5uZWxzOmMsdGltZXN0YW1wOmZ9PWUsaD10aGlzLmdldEF1ZGlvRGF0YUFzRmxvYXQzMihlKSx1PXRoaXMuY29udmVydFR5cGVkQXJyYXkoaCxJbnQxNkFycmF5LDMyNzY3KTt0aGlzLndhc21UcmFuc2Zvcm1lci5nZXRJbnB1dEZyYW1lKHUubGVuZ3RoKS5zZXQodSk7bGV0IGQ9MDt0cnl7ZD10aGlzLndhc21UcmFuc2Zvcm1lci5ydW5BbGdvcml0aG0odCxuLGMpfWNhdGNoKHIpe2lmKCJudW1iZXIiPT10eXBlb2Ygcil7bGV0IGU9IiI7Zm9yKGxldCB0PTA7dDw1MDA7Kyt0KWUrPVN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy53YXNtSW5zdGFuY2UuSEVBUDhbcit0XSk7Y29uc29sZS5lcnJvcihlKX1lbHNlIGNvbnNvbGUuZXJyb3Iocil9aWYoZD4wKXtjb25zdCByPXRoaXMud2FzbVRyYW5zZm9ybWVyLmdldE91dHB1dEZyYW1lKCkuc2xpY2UoMCxkKSxoPXRoaXMuY29udmVydFR5cGVkQXJyYXkocixGbG9hdDMyQXJyYXksMS8zMjc2Nyk7ZT1uZXcgQXVkaW9EYXRhKHtkYXRhOmgsZm9ybWF0OiJmMzIiLG51bWJlck9mQ2hhbm5lbHM6YyxudW1iZXJPZkZyYW1lczp0LHNhbXBsZVJhdGU6bix0aW1lc3RhbXA6Zn0pfX1jYXRjaChyKXtjb25zb2xlLmVycm9yKHIpfXQuZW5xdWV1ZShlKX1hc3luYyBsb2FkTW9kZWwoZSx0KXtpZighdGhpcy53YXNtVHJhbnNmb3JtZXIpcmV0dXJuO2NvbnN0IHI9YXdhaXQgZmV0Y2goZSksbj1hd2FpdCByLmFycmF5QnVmZmVyKCksYz1uLmJ5dGVMZW5ndGgsZj1gZ2V0TW9kZWwke3R9YCxoPXRoaXMud2FzbVRyYW5zZm9ybWVyW2ZdKGMpO2lmKGgpe2NvbnN0IGU9bmV3IFVpbnQ4QXJyYXkobik7aC5zZXQoZSl9fWdldEF1ZGlvRGF0YUFzRmxvYXQzMihlKXtyZXR1cm4gdGhpcy5hdWRpb0RhdGFUb1R5cGVkQXJyYXkoZSxGbG9hdDMyQXJyYXksImYzMi1wbGFuYXIiKX1hdWRpb0RhdGFUb1R5cGVkQXJyYXkoZSx0LHIsbj1lLm51bWJlck9mQ2hhbm5lbHMpe2NvbnN0IGM9ZS5udW1iZXJPZkZyYW1lcypuLGY9bmV3IHQoYyk7Zm9yKGxldCBoPTA7aDxuOysraCl7Y29uc3QgdD1lLm51bWJlck9mRnJhbWVzKmgsbj1mLnN1YmFycmF5KHQsdCtlLm51bWJlck9mRnJhbWVzKTtlLmNvcHlUbyhuLHtwbGFuZUluZGV4OmgsZm9ybWF0OnJ9KX1pZihuPjEpe2NvbnN0IHI9bmV3IHQoYyk7Zm9yKGxldCB0PTA7dDxlLm51bWJlck9mRnJhbWVzOysrdCl7Y29uc3QgYz0yKnQ7Zm9yKGxldCBoPTA7aDxuOysraClyW2MraF09Zlt0K2gqZS5udW1iZXJPZkZyYW1lc119cmV0dXJuIHJ9cmV0dXJuIGZ9Y29udmVydFR5cGVkQXJyYXkoZSx0LHIpe2NvbnN0IG49ZS5sZW5ndGgsYz1uZXcgdChuKTtmb3IobGV0IGY9MDtmPG47KytmKWNbZl09ZVtmXSpyO3JldHVybiBjfWlzTW9ub1RocmVhZChlKXtpZihlLmRpc2FibGVXYXNtTXVsdGlUaHJlYWQpcmV0dXJuITA7dHJ5e2lmKHZvaWQgMD09PW5ldyBTaGFyZWRBcnJheUJ1ZmZlcigxMDI0KSl0aHJvdyBuZXcgRXJyb3IoIm5vdCBzdXBwb3J0ZWQiKX1jYXRjaCh0KXtyZXR1cm4gdGhpcy5lbWl0KCJ3YXJuaW5nIiwiXG5NdWx0aXRocmVhZCBpcyBub3QgYXZhaWxhYmxlLCBub2lzZS1zdXBwcmVzaW9uIGlzIG5vdyBydW5uaW5nIG9uIGEgc2luZ2xlIHRocmVhZC5cblRoaXMgaXMgaW1wYWN0aW5nIHRoZSBwZXJmb3JtYW5jZSBhbmQgaW5jcmVhc2UgdGhlIGxhdGVuY3kuXG5cblRvIGVuYWJsZSBtdWx0aXRocmVhZCwgeW91IG5lZWQgdG8gc2VydmUgdGhlIGFwcGxpY2F0aW9uIHZpYSBodHRwcyB3aXRoIHRoZXNlIGh0dHAgaGVhZGVycyA6XG4gICAtIENyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5OiBzYW1lLW9yaWdpblxuICAgLSBDcm9zcy1PcmlnaW4tRW1iZWRkZXItUG9saWN5OiByZXF1aXJlLWNvcnAuXG5Nb3JlIGluZm86IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1NoYXJlZEFycmF5QnVmZmVyI3NlY3VyaXR5X3JlcXVpcmVtZW50c1xuXG5Zb3UgY2FuIGRpc2FibGUgdGhpcyB3YXJuaW5nIGJ5IGVuYWJsaW5nIGRpc2FibGVXYXNtTXVsdGlUaHJlYWQgd2l0aGluIHRoZSBub2lzZVN1cHByZXNzaW9uIG9wdGlvbnMuXG4iKSwhMH1yZXR1cm4hMX19ZnVuY3Rpb24gY3JlYXRlR2xvYmFsVGhpc1ZhcmlhYmxlKGUsdCl7Z2xvYmFsVGhpcy52b25hZ2V8fChnbG9iYWxUaGlzLnZvbmFnZT17fSksZ2xvYmFsVGhpcy52b25hZ2Uud29ya2VyaXplcnx8KGdsb2JhbFRoaXMudm9uYWdlLndvcmtlcml6ZXI9e30pO2xldCByPWdsb2JhbFRoaXMudm9uYWdlLndvcmtlcml6ZXI7cmV0dXJuIHJbZV18fChyW2VdPXQpLHJbZV19Y29uc3QgcGU9Y3JlYXRlR2xvYmFsVGhpc1ZhcmlhYmxlKCJnbG9iYWxzIix7fSk7dmFyIHdlPShlPT4oZS5JTklUPSJJTklUIixlLkZPUldBUkQ9IkZPUldBUkQiLGUuVEVSTUlOQVRFPSJURVJNSU5BVEUiLGUuR0xPQkFMU19TWU5DPSJHTE9CQUxTX1NZTkMiLGUuRVZFTlQ9IkVWRU5UIixlKSkod2V8fHt9KTtmdW5jdGlvbiBwb3N0Q29tbWFuZChlLHQpe2NvbnN0e2lkOnIsdHlwZTpufT1lLGM9QXJyYXkuaXNBcnJheSh0KT90Olt0XTtwb3N0TWVzc2FnZSh7aWQ6cix0eXBlOm4scmVzdWx0OnR9LGMuZmlsdGVyKChlPT5mdW5jdGlvbiBpc1RyYW5zZmVyYWJsZShlKXtyZXR1cm5bSW1hZ2VCaXRtYXAsUmVhZGFibGVTdHJlYW0sV3JpdGFibGVTdHJlYW1dLnNvbWUoKHQ9PmUgaW5zdGFuY2VvZiB0KSl9KGUpKSkpfWZ1bmN0aW9uIGlzV29ya2VyKCl7cmV0dXJuInVuZGVmaW5lZCIhPXR5cGVvZiBXb3JrZXJHbG9iYWxTY29wZSYmc2VsZiBpbnN0YW5jZW9mIFdvcmtlckdsb2JhbFNjb3BlfWZ1bmN0aW9uIGNvcHkoZSx0KXtpZihBcnJheS5pc0FycmF5KHQpKXQuc3BsaWNlKDAsdC5sZW5ndGgpO2Vsc2UgaWYoIm9iamVjdCI9PXR5cGVvZiB0KWZvcihjb25zdCByIGluIHQpZGVsZXRlIHRbcl07Zm9yKGNvbnN0IHIgaW4gZSlBcnJheS5pc0FycmF5KGVbcl0pPyh0W3JdPVtdLGNvcHkoZVtyXSx0W3JdKSk6Im9iamVjdCI9PXR5cGVvZiBlW3JdPyh0W3JdPXt9LGNvcHkoZVtyXSx0W3JdKSk6dFtyXT1lW3JdfWNyZWF0ZUdsb2JhbFRoaXNWYXJpYWJsZSgid29ya2VyaXplZCIse30pO2NvbnN0IHZlPW5ldyBXZWFrTWFwLEVlPW5ldyBXZWFrTWFwLFRlPW5ldyBXZWFrTWFwLEFlPVN5bWJvbCgiYW55UHJvZHVjZXIiKSwkZT1Qcm9taXNlLnJlc29sdmUoKSxOZT1TeW1ib2woImxpc3RlbmVyQWRkZWQiKSxJZT1TeW1ib2woImxpc3RlbmVyUmVtb3ZlZCIpO2xldCBEZT0hMSxrZT0hMTtmdW5jdGlvbiBhc3NlcnRFdmVudE5hbWUoZSl7aWYoInN0cmluZyIhPXR5cGVvZiBlJiYic3ltYm9sIiE9dHlwZW9mIGUmJiJudW1iZXIiIT10eXBlb2YgZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgZXZlbnROYW1lYCBtdXN0IGJlIGEgc3RyaW5nLCBzeW1ib2wsIG9yIG51bWJlciIpfWZ1bmN0aW9uIGFzc2VydExpc3RlbmVyKGUpe2lmKCJmdW5jdGlvbiIhPXR5cGVvZiBlKXRocm93IG5ldyBUeXBlRXJyb3IoImxpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbiIpfWZ1bmN0aW9uIGdldExpc3RlbmVycyhlLHQpe2NvbnN0IHI9RWUuZ2V0KGUpO2lmKHIuaGFzKHQpKXJldHVybiByLmdldCh0KX1mdW5jdGlvbiBnZXRFdmVudFByb2R1Y2VycyhlLHQpe2NvbnN0IHI9InN0cmluZyI9PXR5cGVvZiB0fHwic3ltYm9sIj09dHlwZW9mIHR8fCJudW1iZXIiPT10eXBlb2YgdD90OkFlLG49VGUuZ2V0KGUpO2lmKG4uaGFzKHIpKXJldHVybiBuLmdldChyKX1mdW5jdGlvbiBpdGVyYXRvcihlLHQpe3Q9QXJyYXkuaXNBcnJheSh0KT90Olt0XTtsZXQgcj0hMSxmbHVzaD0oKT0+e30sbj1bXTtjb25zdCBjPXtlbnF1ZXVlKGUpe24ucHVzaChlKSxmbHVzaCgpfSxmaW5pc2goKXtyPSEwLGZsdXNoKCl9fTtmb3IoY29uc3QgZiBvZiB0KXtsZXQgdD1nZXRFdmVudFByb2R1Y2VycyhlLGYpO2lmKCF0KXt0PW5ldyBTZXQ7VGUuZ2V0KGUpLnNldChmLHQpfXQuYWRkKGMpfXJldHVybnthc3luYyBuZXh0KCl7cmV0dXJuIG4/MD09PW4ubGVuZ3RoP3I/KG49dm9pZCAwLHRoaXMubmV4dCgpKTooYXdhaXQgbmV3IFByb21pc2UoKGU9PntmbHVzaD1lfSkpLHRoaXMubmV4dCgpKTp7ZG9uZTohMSx2YWx1ZTphd2FpdCBuLnNoaWZ0KCl9Ontkb25lOiEwfX0sYXN5bmMgcmV0dXJuKHIpe249dm9pZCAwO2Zvcihjb25zdCBuIG9mIHQpe2NvbnN0IHQ9Z2V0RXZlbnRQcm9kdWNlcnMoZSxuKTtpZih0JiYodC5kZWxldGUoYyksMD09PXQuc2l6ZSkpe1RlLmdldChlKS5kZWxldGUobil9fXJldHVybiBmbHVzaCgpLGFyZ3VtZW50cy5sZW5ndGg+MD97ZG9uZTohMCx2YWx1ZTphd2FpdCByfTp7ZG9uZTohMH19LFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKXtyZXR1cm4gdGhpc319fWZ1bmN0aW9uIGRlZmF1bHRNZXRob2ROYW1lc09yQXNzZXJ0KGUpe2lmKHZvaWQgMD09PWUpcmV0dXJuIFJlO2lmKCFBcnJheS5pc0FycmF5KGUpKXRocm93IG5ldyBUeXBlRXJyb3IoImBtZXRob2ROYW1lc2AgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzIik7Zm9yKGNvbnN0IHQgb2YgZSlpZighUmUuaW5jbHVkZXModCkpe2lmKCJzdHJpbmciIT10eXBlb2YgdCl0aHJvdyBuZXcgVHlwZUVycm9yKCJgbWV0aG9kTmFtZXNgIGVsZW1lbnQgbXVzdCBiZSBhIHN0cmluZyIpO3Rocm93IG5ldyBFcnJvcihgJHt0fSBpcyBub3QgRW1pdHRlcnkgbWV0aG9kYCl9cmV0dXJuIGV9Y29uc3QgaXNNZXRhRXZlbnQ9ZT0+ZT09PU5lfHxlPT09SWU7ZnVuY3Rpb24gZW1pdE1ldGFFdmVudChlLHQscil7aWYoaXNNZXRhRXZlbnQodCkpdHJ5e0RlPSEwLGUuZW1pdCh0LHIpfWZpbmFsbHl7RGU9ITF9fWNsYXNzIEVtaXR0ZXJ5e3N0YXRpYyBtaXhpbihlLHQpe3JldHVybiB0PWRlZmF1bHRNZXRob2ROYW1lc09yQXNzZXJ0KHQpLHI9PntpZigiZnVuY3Rpb24iIT10eXBlb2Ygcil0aHJvdyBuZXcgVHlwZUVycm9yKCJgdGFyZ2V0YCBtdXN0IGJlIGZ1bmN0aW9uIik7Zm9yKGNvbnN0IGUgb2YgdClpZih2b2lkIDAhPT1yLnByb3RvdHlwZVtlXSl0aHJvdyBuZXcgRXJyb3IoYFRoZSBwcm9wZXJ0eSBcYCR7ZX1cYCBhbHJlYWR5IGV4aXN0cyBvbiBcYHRhcmdldFxgYCk7T2JqZWN0LmRlZmluZVByb3BlcnR5KHIucHJvdG90eXBlLGUse2VudW1lcmFibGU6ITEsZ2V0OmZ1bmN0aW9uIGdldEVtaXR0ZXJ5UHJvcGVydHkoKXtyZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsZSx7ZW51bWVyYWJsZTohMSx2YWx1ZTpuZXcgRW1pdHRlcnl9KSx0aGlzW2VdfX0pO2NvbnN0IGVtaXR0ZXJ5TWV0aG9kQ2FsbGVyPXQ9PmZ1bmN0aW9uKC4uLnIpe3JldHVybiB0aGlzW2VdW3RdKC4uLnIpfTtmb3IoY29uc3QgZSBvZiB0KU9iamVjdC5kZWZpbmVQcm9wZXJ0eShyLnByb3RvdHlwZSxlLHtlbnVtZXJhYmxlOiExLHZhbHVlOmVtaXR0ZXJ5TWV0aG9kQ2FsbGVyKGUpfSk7cmV0dXJuIHJ9fXN0YXRpYyBnZXQgaXNEZWJ1Z0VuYWJsZWQoKXt2YXIgZSx0O2lmKCJvYmplY3QiIT10eXBlb2YobnVsbD09KGU9Z2xvYmFsVGhpcy5wcm9jZXNzKT92b2lkIDA6ZS5lbnYpKXJldHVybiBrZTtjb25zdHtlbnY6cn09bnVsbCE9KHQ9Z2xvYmFsVGhpcy5wcm9jZXNzKT90OntlbnY6e319O3JldHVybiJlbWl0dGVyeSI9PT1yLkRFQlVHfHwiKiI9PT1yLkRFQlVHfHxrZX1zdGF0aWMgc2V0IGlzRGVidWdFbmFibGVkKGUpe2tlPWV9Y29uc3RydWN0b3IoZT17fSl7dmFyIHQ7dmUuc2V0KHRoaXMsbmV3IFNldCksRWUuc2V0KHRoaXMsbmV3IE1hcCksVGUuc2V0KHRoaXMsbmV3IE1hcCksVGUuZ2V0KHRoaXMpLnNldChBZSxuZXcgU2V0KSx0aGlzLmRlYnVnPW51bGwhPSh0PWUuZGVidWcpP3Q6e30sdm9pZCAwPT09dGhpcy5kZWJ1Zy5lbmFibGVkJiYodGhpcy5kZWJ1Zy5lbmFibGVkPSExKSx0aGlzLmRlYnVnLmxvZ2dlcnx8KHRoaXMuZGVidWcubG9nZ2VyPShlLHQscixuKT0+e3RyeXtuPUpTT04uc3RyaW5naWZ5KG4pfWNhdGNoe249YE9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcga2V5cyBmYWlsZWQgdG8gc3RyaW5naWZ5OiAke09iamVjdC5rZXlzKG4pLmpvaW4oIiwiKX1gfSJzeW1ib2wiIT10eXBlb2YgciYmIm51bWJlciIhPXR5cGVvZiByfHwocj1yLnRvU3RyaW5nKCkpO2NvbnN0IGM9bmV3IERhdGUsZj1gJHtjLmdldEhvdXJzKCl9OiR7Yy5nZXRNaW51dGVzKCl9OiR7Yy5nZXRTZWNvbmRzKCl9LiR7Yy5nZXRNaWxsaXNlY29uZHMoKX1gO2NvbnNvbGUubG9nKGBbJHtmfV1bZW1pdHRlcnk6JHtlfV1bJHt0fV0gRXZlbnQgTmFtZTogJHtyfVxuXHRkYXRhOiAke259YCl9KX1sb2dJZkRlYnVnRW5hYmxlZChlLHQscil7KEVtaXR0ZXJ5LmlzRGVidWdFbmFibGVkfHx0aGlzLmRlYnVnLmVuYWJsZWQpJiZ0aGlzLmRlYnVnLmxvZ2dlcihlLHRoaXMuZGVidWcubmFtZSx0LHIpfW9uKGUsdCl7YXNzZXJ0TGlzdGVuZXIodCksZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCByIG9mIGUpe2Fzc2VydEV2ZW50TmFtZShyKTtsZXQgZT1nZXRMaXN0ZW5lcnModGhpcyxyKTtpZighZSl7ZT1uZXcgU2V0O0VlLmdldCh0aGlzKS5zZXQocixlKX1lLmFkZCh0KSx0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJzdWJzY3JpYmUiLHIsdm9pZCAwKSxpc01ldGFFdmVudChyKXx8ZW1pdE1ldGFFdmVudCh0aGlzLE5lLHtldmVudE5hbWU6cixsaXN0ZW5lcjp0fSl9cmV0dXJuIHRoaXMub2ZmLmJpbmQodGhpcyxlLHQpfW9mZihlLHQpe2Fzc2VydExpc3RlbmVyKHQpLGU9QXJyYXkuaXNBcnJheShlKT9lOltlXTtmb3IoY29uc3QgciBvZiBlKXthc3NlcnRFdmVudE5hbWUocik7Y29uc3QgZT1nZXRMaXN0ZW5lcnModGhpcyxyKTtpZihlJiYoZS5kZWxldGUodCksMD09PWUuc2l6ZSkpe0VlLmdldCh0aGlzKS5kZWxldGUocil9dGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgidW5zdWJzY3JpYmUiLHIsdm9pZCAwKSxpc01ldGFFdmVudChyKXx8ZW1pdE1ldGFFdmVudCh0aGlzLEllLHtldmVudE5hbWU6cixsaXN0ZW5lcjp0fSl9fW9uY2UoZSl7bGV0IHQ7Y29uc3Qgcj1uZXcgUHJvbWlzZSgocj0+e3Q9dGhpcy5vbihlLChlPT57dCgpLHIoZSl9KSl9KSk7cmV0dXJuIHIub2ZmPXQscn1ldmVudHMoZSl7ZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCB0IG9mIGUpYXNzZXJ0RXZlbnROYW1lKHQpO3JldHVybiBpdGVyYXRvcih0aGlzLGUpfWFzeW5jIGVtaXQoZSx0KXt2YXIgcjtpZihhc3NlcnRFdmVudE5hbWUoZSksaXNNZXRhRXZlbnQoZSkmJiFEZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgZXZlbnROYW1lYCBjYW5ub3QgYmUgbWV0YSBldmVudCBgbGlzdGVuZXJBZGRlZGAgb3IgYGxpc3RlbmVyUmVtb3ZlZGAiKTt0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJlbWl0IixlLHQpLGZ1bmN0aW9uIGVucXVldWVQcm9kdWNlcnMoZSx0LHIpe2NvbnN0IG49VGUuZ2V0KGUpO2lmKG4uaGFzKHQpKWZvcihjb25zdCBjIG9mIG4uZ2V0KHQpKWMuZW5xdWV1ZShyKTtpZihuLmhhcyhBZSkpe2NvbnN0IGU9UHJvbWlzZS5hbGwoW3Qscl0pO2Zvcihjb25zdCB0IG9mIG4uZ2V0KEFlKSl0LmVucXVldWUoZSl9fSh0aGlzLGUsdCk7Y29uc3Qgbj1udWxsIT0ocj1nZXRMaXN0ZW5lcnModGhpcyxlKSk/cjpuZXcgU2V0LGM9dmUuZ2V0KHRoaXMpLGY9Wy4uLm5dLGg9aXNNZXRhRXZlbnQoZSk/W106Wy4uLmNdO2F3YWl0ICRlLGF3YWl0IFByb21pc2UuYWxsKFsuLi5mLm1hcCgoYXN5bmMgZT0+e2lmKG4uaGFzKGUpKXJldHVybiBlKHQpfSkpLC4uLmgubWFwKChhc3luYyByPT57aWYoYy5oYXMocikpcmV0dXJuIHIoZSx0KX0pKV0pfWFzeW5jIGVtaXRTZXJpYWwoZSx0KXt2YXIgcjtpZihhc3NlcnRFdmVudE5hbWUoZSksaXNNZXRhRXZlbnQoZSkmJiFEZSl0aHJvdyBuZXcgVHlwZUVycm9yKCJgZXZlbnROYW1lYCBjYW5ub3QgYmUgbWV0YSBldmVudCBgbGlzdGVuZXJBZGRlZGAgb3IgYGxpc3RlbmVyUmVtb3ZlZGAiKTt0aGlzLmxvZ0lmRGVidWdFbmFibGVkKCJlbWl0U2VyaWFsIixlLHQpO2NvbnN0IG49bnVsbCE9KHI9Z2V0TGlzdGVuZXJzKHRoaXMsZSkpP3I6bmV3IFNldCxjPXZlLmdldCh0aGlzKSxmPVsuLi5uXSxoPVsuLi5jXTthd2FpdCAkZTtmb3IoY29uc3QgdSBvZiBmKW4uaGFzKHUpJiZhd2FpdCB1KHQpO2Zvcihjb25zdCB1IG9mIGgpYy5oYXModSkmJmF3YWl0IHUoZSx0KX1vbkFueShlKXtyZXR1cm4gYXNzZXJ0TGlzdGVuZXIoZSksdGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgic3Vic2NyaWJlQW55Iix2b2lkIDAsdm9pZCAwKSx2ZS5nZXQodGhpcykuYWRkKGUpLGVtaXRNZXRhRXZlbnQodGhpcyxOZSx7bGlzdGVuZXI6ZX0pLHRoaXMub2ZmQW55LmJpbmQodGhpcyxlKX1hbnlFdmVudCgpe3JldHVybiBpdGVyYXRvcih0aGlzKX1vZmZBbnkoZSl7YXNzZXJ0TGlzdGVuZXIoZSksdGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgidW5zdWJzY3JpYmVBbnkiLHZvaWQgMCx2b2lkIDApLGVtaXRNZXRhRXZlbnQodGhpcyxJZSx7bGlzdGVuZXI6ZX0pLHZlLmdldCh0aGlzKS5kZWxldGUoZSl9Y2xlYXJMaXN0ZW5lcnMoZSl7ZT1BcnJheS5pc0FycmF5KGUpP2U6W2VdO2Zvcihjb25zdCB0IG9mIGUpaWYodGhpcy5sb2dJZkRlYnVnRW5hYmxlZCgiY2xlYXIiLHQsdm9pZCAwKSwic3RyaW5nIj09dHlwZW9mIHR8fCJzeW1ib2wiPT10eXBlb2YgdHx8Im51bWJlciI9PXR5cGVvZiB0KXtjb25zdCBlPWdldExpc3RlbmVycyh0aGlzLHQpO2UmJmUuY2xlYXIoKTtjb25zdCByPWdldEV2ZW50UHJvZHVjZXJzKHRoaXMsdCk7aWYocil7Zm9yKGNvbnN0IGUgb2YgcillLmZpbmlzaCgpO3IuY2xlYXIoKX19ZWxzZXt2ZS5nZXQodGhpcykuY2xlYXIoKTtmb3IoY29uc3RbZSx0XW9mIEVlLmdldCh0aGlzKS5lbnRyaWVzKCkpdC5jbGVhcigpLEVlLmdldCh0aGlzKS5kZWxldGUoZSk7Zm9yKGNvbnN0W2UsdF1vZiBUZS5nZXQodGhpcykuZW50cmllcygpKXtmb3IoY29uc3QgZSBvZiB0KWUuZmluaXNoKCk7dC5jbGVhcigpLFRlLmdldCh0aGlzKS5kZWxldGUoZSl9fX1saXN0ZW5lckNvdW50KGUpe3ZhciB0LHIsbixjLGYsaDtlPUFycmF5LmlzQXJyYXkoZSk/ZTpbZV07bGV0IHU9MDtmb3IoY29uc3QgZCBvZiBlKWlmKCJzdHJpbmciIT10eXBlb2YgZCl7dm9pZCAwIT09ZCYmYXNzZXJ0RXZlbnROYW1lKGQpLHUrPXZlLmdldCh0aGlzKS5zaXplO2Zvcihjb25zdCBlIG9mIEVlLmdldCh0aGlzKS52YWx1ZXMoKSl1Kz1lLnNpemU7Zm9yKGNvbnN0IGUgb2YgVGUuZ2V0KHRoaXMpLnZhbHVlcygpKXUrPWUuc2l6ZX1lbHNlIHUrPXZlLmdldCh0aGlzKS5zaXplKyhudWxsIT0ocj1udWxsPT0odD1nZXRMaXN0ZW5lcnModGhpcyxkKSk/dm9pZCAwOnQuc2l6ZSk/cjowKSsobnVsbCE9KGM9bnVsbD09KG49Z2V0RXZlbnRQcm9kdWNlcnModGhpcyxkKSk/dm9pZCAwOm4uc2l6ZSk/YzowKSsobnVsbCE9KGg9bnVsbD09KGY9Z2V0RXZlbnRQcm9kdWNlcnModGhpcykpP3ZvaWQgMDpmLnNpemUpP2g6MCk7cmV0dXJuIHV9YmluZE1ldGhvZHMoZSx0KXtpZigib2JqZWN0IiE9dHlwZW9mIGV8fG51bGw9PT1lKXRocm93IG5ldyBUeXBlRXJyb3IoImB0YXJnZXRgIG11c3QgYmUgYW4gb2JqZWN0Iik7dD1kZWZhdWx0TWV0aG9kTmFtZXNPckFzc2VydCh0KTtmb3IoY29uc3QgciBvZiB0KXtpZih2b2lkIDAhPT1lW3JdKXRocm93IG5ldyBFcnJvcihgVGhlIHByb3BlcnR5IFxgJHtyfVxgIGFscmVhZHkgZXhpc3RzIG9uIFxgdGFyZ2V0XGBgKTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLHtlbnVtZXJhYmxlOiExLHZhbHVlOnRoaXNbcl0uYmluZCh0aGlzKX0pfX19Y29uc3QgUmU9T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoRW1pdHRlcnkucHJvdG90eXBlKS5maWx0ZXIoKGU9PiJjb25zdHJ1Y3RvciIhPT1lKSk7T2JqZWN0LmRlZmluZVByb3BlcnR5KEVtaXR0ZXJ5LCJsaXN0ZW5lckFkZGVkIix7dmFsdWU6TmUsd3JpdGFibGU6ITEsZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITF9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoRW1pdHRlcnksImxpc3RlbmVyUmVtb3ZlZCIse3ZhbHVlOkllLHdyaXRhYmxlOiExLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiExfSk7Y29uc3QgeGU9Y3JlYXRlR2xvYmFsVGhpc1ZhcmlhYmxlKCJyZWdpc3RlcmVkV29ya2VycyIse30pO2lzV29ya2VyKCkmJmZ1bmN0aW9uIGluaXRXb3JrZXIoKXtjb25zdCBlPXt9O29ubWVzc2FnZT1hc3luYyB0PT57Y29uc3Qgcj10LmRhdGE7c3dpdGNoKHIudHlwZSl7Y2FzZSB3ZS5JTklUOiFmdW5jdGlvbiBoYW5kbGVDb21tYW5kSW5pdChlLHQpe2lmKCFlLmFyZ3MpdGhyb3ciTWlzc2luZyBjbGFzc05hbWUgd2hpbGUgaW5pdGlhbGl6aW5nIHdvcmtlciI7Y29uc3RbcixuXT1lLmFyZ3MsYz14ZVtyXTtpZighYyl0aHJvd2B1bmtub3duIHdvcmtlciBjbGFzcyAke3J9YDt0Lmluc3RhbmNlPW5ldyBjKGUuYXJncy5zbGljZSgxKSksY29weShuLHBlKSxmdW5jdGlvbiBpc0luc3RhbmNlT2ZFbWl0dGVyeShlKXtyZXR1cm4gZS5vbkFueSYmZS5lbWl0fSh0Lmluc3RhbmNlKSYmdC5pbnN0YW5jZS5vbkFueSgoKGUsdCk9Pntwb3N0Q29tbWFuZCh7dHlwZTp3ZS5FVkVOVH0se25hbWU6ZSxkYXRhOnR9KX0pKSxwb3N0Q29tbWFuZChlLHZvaWQgMCE9PXR5cGVvZiB0Lmluc3RhbmNlKX0ocixlKTticmVhaztjYXNlIHdlLkZPUldBUkQ6IWFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvbW1hbmRGb3J3YXJkKGUsdCl7Y29uc3R7ZnVuY3Rpb25OYW1lOnIsYXJnczpufT1lO2lmKCF0Lmluc3RhbmNlKXRocm93Imluc3RhbmNlIG5vdCBpbml0aWFsaXplZCI7aWYoIXIpdGhyb3cibWlzc2luZyBmdW5jdGlvbiBuYW1lIHRvIGNhbGwiO2lmKCF0Lmluc3RhbmNlW3JdKXRocm93YHVuZGVmaW5lZCBmdW5jdGlvbiBbJHtyfV0gaW4gY2xhc3MgJHt0Lmluc3RhbmNlLmNvbnN0cnVjdG9yLndvcmtlcklkfWA7cG9zdENvbW1hbmQoZSxhd2FpdCB0Lmluc3RhbmNlW3JdKC4uLm51bGwhPW4/bjpbXSkpfShyLGUpO2JyZWFrO2Nhc2Ugd2UuVEVSTUlOQVRFOiFhc3luYyBmdW5jdGlvbiBoYW5kbGVDb21tYW5kVGVybWluYXRlKGUsdCl7Y29uc3R7YXJnczpyfT1lO2lmKCF0Lmluc3RhbmNlKXRocm93Imluc3RhbmNlIG5vdCBpbml0aWFsaXplZCI7bGV0IG47dC5pbnN0YW5jZS50ZXJtaW5hdGUmJihuPWF3YWl0IHQuaW5zdGFuY2UudGVybWluYXRlKC4uLm51bGwhPXI/cjpbXSkpLHBvc3RDb21tYW5kKGUsbil9KHIsZSk7YnJlYWs7Y2FzZSB3ZS5HTE9CQUxTX1NZTkM6IWZ1bmN0aW9uIGhhbmRsZUNvbW1hbmRHbG9iYWxzU3luYyhlKXtpZighZS5hcmdzKXRocm93Ik1pc3NpbmcgZ2xvYmFscyB3aGlsZSBzeW5jaW5nIjtjb3B5KGUuYXJnc1swXSxwZSkscG9zdENvbW1hbmQoZSx7fSl9KHIpfX19KCk7IWZ1bmN0aW9uIHJlZ2lzdGVyV29ya2VyKGUsdCl7dC53b3JrZXJJZD1lLGlzV29ya2VyKCkmJih4ZVt0LndvcmtlcklkXT10KX0oIlByb2Nlc3NvcldvcmtlciIsY2xhc3MgX1Byb2Nlc3NvcldvcmtlciBleHRlbmRzIGFle2NvbnN0cnVjdG9yKCl7c3VwZXIoLi4uYXJndW1lbnRzKSx0aGlzLnByb2Nlc3Nvcj1uZXcgT2V9YXN5bmMgaW5pdChlPXt9KXt0aGlzLnRyYW5zZm9ybWVyPW5ldyBOb2lzZVN1cHByZXNzaW9uVHJhbnNmb3JtZXIsdGhpcy5wcm9jZXNzb3Iub25BbnkoKChlLHQpPT50aGlzLmVtaXQoZSx0KSkpLHRoaXMudHJhbnNmb3JtZXIub25BbnkoKChlLHQpPT50aGlzLmVtaXQoZSx0KSkpLGF3YWl0IHRoaXMudHJhbnNmb3JtZXIuaW5pdChlKSxhd2FpdCB0aGlzLnByb2Nlc3Nvci5zZXRUcmFuc2Zvcm1lcnMoW3RoaXMudHJhbnNmb3JtZXJdKX10cmFuc2Zvcm0oZSx0KXt0aGlzLnByb2Nlc3Nvci50cmFuc2Zvcm0oZSx0KX1zZXRBdWRpb09wdGlvbnMoZSx0LHIsbixjKXt0aGlzLnRyYW5zZm9ybWVyPy5zZXRBdWRpb09wdGlvbnMoZSx0LHIsbixjKX1lbmFibGUoKXt0aGlzLnRyYW5zZm9ybWVyPy5lbmFibGUoKX1kaXNhYmxlKCl7dGhpcy50cmFuc2Zvcm1lcj8uZGlzYWJsZSgpfWFzeW5jIHRlcm1pbmF0ZSgpe2F3YWl0IHRoaXMucHJvY2Vzc29yLmRlc3Ryb3koKX1nZXRXYXYoKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm1lcj8uZ2V0V2F2KCk/PyIifWdldExhdGVuY3koKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm1lcj8uZ2V0TGF0ZW5jeSgpPz8wfWdldFdhc21MYXRlbmN5TnMoKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm1lcj8uZ2V0V2FzbUxhdGVuY3lOcygpPz8wfX0pfSgpOwo=';
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
  /**
   * @internal
   */
  async getWav() {
    return (await this.worker?.getWav()) ?? '';
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
  /**
   * @internal
   */
  async getWav() {
    return (await this.worker?.getWav()) ?? '';
  }
}
function createVonageNoiseSuppression() {
  return new VonageNoiseSuppression();
}
const defaultAssetsDirBaseUrl = `https://d3opqjmqzxf057.cloudfront.net/noise-suppression/${version}`;
class WavExporterTransformer {
  async init(options = {}) {
    console.log('Wav exporter transformer initialization');
    const assetsDirBaseUrl = options.assetsDirBaseUrl ?? defaultAssetsDirBaseUrl;
    const locateFile = (name) => `${assetsDirBaseUrl}/${name}`;
    this.wasmInstance = await createWasmMonoInstance({
      locateFile,
      mainScriptUrlOrBlob: locateFile('main-bin-mono.js'),
    });
    console.log('Wav exporter transformer ready');
  }
  transform(data, controller) {
    if (!this.wasmTransformer) {
      this.wasmTransformer = new this.wasmInstance.WavExporter(data.sampleRate, 1);
    }
    if (this.wasmTransformer) {
      const dataAsInt16 = this.getAudioDataAsInt16(data);
      const inputFrame = this.wasmTransformer.getInputFrame(dataAsInt16.length);
      inputFrame.set(dataAsInt16);
      this.wasmTransformer.push(data.numberOfFrames, data.sampleRate, data.numberOfChannels);
    }
    controller.enqueue(data);
  }
  getWav() {
    if (!this.wasmTransformer) {
      return '';
    }
    this.wasmTransformer.close();
    const buffer = this.wasmTransformer.getWav();
    const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    return `data:audio/wav;base64,${base64}`;
  }
  getAudioDataAsInt16(data) {
    const dataAsFloat32 = this.getAudioDataAsFloat32(data);
    const result = new Int16Array(dataAsFloat32.length);
    for (let i = 0; i < dataAsFloat32.length; ++i) {
      result[i] = Math.round(dataAsFloat32[i] * ((1 << 16) - 1));
    }
    return result;
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
}
export { NoiseSuppressionTransformer, VonageNoiseSuppression, WavExporterTransformer, createVonageNoiseSuppression };
