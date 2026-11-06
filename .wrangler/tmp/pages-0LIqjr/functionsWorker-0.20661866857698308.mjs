var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// ../node_modules/worker-mailer/dist/index.mjs
import { connect as b } from "cloudflare:sockets";
var u = class {
  static {
    __name(this, "u");
  }
  values = [];
  resolvers = [];
  enqueue(e) {
    this.resolvers.length || this.addWrapper(), this.resolvers.shift()(e);
  }
  async dequeue() {
    return this.values.length || this.addWrapper(), this.values.shift();
  }
  get length() {
    return this.values.length;
  }
  clear() {
    this.values = [], this.resolvers = [];
  }
  addWrapper() {
    this.values.push(new Promise((e) => {
      this.resolvers.push(e);
    }));
  }
};
async function T(a3, e, t) {
  return Promise.race([a3, new Promise((r, n) => setTimeout(() => n(t), e))]);
}
__name(T, "T");
var E = new TextEncoder();
function l(a3) {
  return E.encode(a3);
}
__name(l, "l");
var A = new TextDecoder("utf-8");
function w(a3, e = 76) {
  let t = l(a3), r = "", n = 0, i = 0;
  for (; i < t.length; ) {
    let o = t[i], s;
    if (o === 10) {
      r += `\r
`, n = 0, i++;
      continue;
    } else if (o === 13) if (i + 1 < t.length && t[i + 1] === 10) {
      r += `\r
`, n = 0, i += 2;
      continue;
    } else s = "=0D";
    if (s === void 0) {
      let h = o === 32 || o === 9, d = i + 1 >= t.length || t[i + 1] === 10 || t[i + 1] === 13;
      o < 32 && !h || o > 126 || o === 61 || h && d ? s = `=${o.toString(16).toUpperCase().padStart(2, "0")}` : s = String.fromCharCode(o);
    }
    n + s.length > e - 3 && (r += `=\r
`, n = 0), r += s, n += s.length, i++;
  }
  return r;
}
__name(w, "w");
function c(a3) {
  if (!/[^\x00-\x7F]/.test(a3)) return a3;
  let e = l(a3), t = "";
  for (let r of e) r >= 33 && r <= 126 && r !== 63 && r !== 61 && r !== 95 ? t += String.fromCharCode(r) : r === 32 ? t += "_" : t += `=${r.toString(16).toUpperCase().padStart(2, "0")}`;
  return `=?UTF-8?Q?${t}?=`;
}
__name(c, "c");
var f = class a {
  static {
    __name(this, "a");
  }
  from;
  to;
  reply;
  cc;
  bcc;
  subject;
  text;
  html;
  dsnOverride;
  attachments;
  headers;
  setSent;
  setSentError;
  sent = new Promise((e, t) => {
    this.setSent = e, this.setSentError = t;
  });
  constructor(e) {
    if (!e.text && !e.html) throw new Error("At least one of text or html must be provided");
    typeof e.from == "string" ? this.from = { email: e.from } : this.from = e.from, typeof e.reply == "string" ? this.reply = { email: e.reply } : this.reply = e.reply, this.to = a.toUsers(e.to), this.cc = a.toUsers(e.cc), this.bcc = a.toUsers(e.bcc), this.subject = e.subject, this.text = e.text, this.html = e.html, this.attachments = e.attachments, this.dsnOverride = e.dsnOverride, this.headers = e.headers || {};
  }
  static toUsers(e) {
    if (e) return typeof e == "string" ? [{ email: e }] : Array.isArray(e) ? e.map((t) => typeof t == "string" ? { email: t } : t) : [e];
  }
  getEmailData() {
    this.resolveHeader();
    let e = ["MIME-Version: 1.0"];
    for (let [s, h] of Object.entries(this.headers)) s.toLowerCase() !== "bcc" && e.push(`${s}: ${h}`);
    let t = this.generateSafeBoundary("mixed_"), r = this.generateSafeBoundary("alternative_");
    e.push(`Content-Type: multipart/mixed; boundary="${t}"`);
    let i = `${e.join(`\r
`)}\r
\r
`;
    if (i += `--${t}\r
`, i += `Content-Type: multipart/alternative; boundary="${r}"\r
\r
`, this.text) {
      i += `--${r}\r
`, i += `Content-Type: text/plain; charset="UTF-8"\r
`, i += `Content-Transfer-Encoding: quoted-printable\r
\r
`;
      let s = w(this.text);
      i += `${s}\r
\r
`;
    }
    if (this.html) {
      i += `--${r}\r
`, i += `Content-Type: text/html; charset="UTF-8"\r
`, i += `Content-Transfer-Encoding: quoted-printable\r
\r
`;
      let s = w(this.html);
      i += `${s}\r
\r
`;
    }
    if (i += `--${r}--\r
`, this.attachments) for (let s of this.attachments) {
      let h = s.mimeType || this.getMimeType(s.filename);
      i += `--${t}\r
`, i += `Content-Type: ${h}; name="${s.filename}"\r
`, i += `Content-Description: ${s.filename}\r
`, i += `Content-Disposition: attachment; filename="${s.filename}";\r
`, i += `    creation-date="${(/* @__PURE__ */ new Date()).toUTCString()}";\r
`, i += `Content-Transfer-Encoding: base64\r
\r
`;
      let d = s.content.match(/.{1,72}/g);
      d ? i += `${d.join(`\r
`)}` : i += `${s.content}`, i += `\r
\r
`;
    }
    return i += `--${t}--\r
`, `${this.applyDotStuffing(i)}\r
.\r
`;
  }
  applyDotStuffing(e) {
    let t = e.replace(/\r\n\./g, `\r
..`);
    return t.startsWith(".") && (t = `.${t}`), t;
  }
  generateSafeBoundary(e) {
    let t = new Uint8Array(28);
    crypto.getRandomValues(t);
    let r = Array.from(t).map((i) => i.toString(16).padStart(2, "0")).join(""), n = e + r;
    return n = n.replace(/[<>@,;:\\/[\]?=" ]/g, "_"), n;
  }
  getMimeType(e) {
    let t = e.split(".").pop()?.toLowerCase();
    return { txt: "text/plain", html: "text/html", csv: "text/csv", pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", zip: "application/zip" }[t || "txt"] || "application/octet-stream";
  }
  resolveHeader() {
    this.resolveFrom(), this.resolveTo(), this.resolveReply(), this.resolveCC(), this.resolveSubject(), this.headers.Date = this.headers.Date ?? (/* @__PURE__ */ new Date()).toUTCString(), this.headers["Message-ID"] = this.headers["Message-ID"] ?? `<${crypto.randomUUID()}@${this.from.email.split("@").pop()}>`;
  }
  resolveFrom() {
    if (this.headers.From) return;
    let e = this.from.email;
    this.from.name && (e = `"${c(this.from.name)}" <${e}>`), this.headers.From = e;
  }
  resolveTo() {
    if (this.headers.To) return;
    let e = this.to.map((t) => t.name ? `"${c(t.name)}" <${t.email}>` : t.email);
    this.headers.To = e.join(", ");
  }
  resolveSubject() {
    this.headers.Subject || this.subject && (this.headers.Subject = c(this.subject));
  }
  resolveReply() {
    if (!this.headers["Reply-To"] && this.reply) {
      let e = this.reply.email;
      this.reply.name && (e = `"${c(this.reply.name)}" <${e}>`), this.headers["Reply-To"] = e;
    }
  }
  resolveCC() {
    if (!this.headers.CC && this.cc) {
      let e = this.cc.map((t) => t.name ? `"${c(t.name)}" <${t.email}>` : t.email);
      this.headers.CC = e.join(", ");
    }
  }
};
var v = ((i) => (i[i.DEBUG = 0] = "DEBUG", i[i.INFO = 1] = "INFO", i[i.WARN = 2] = "WARN", i[i.ERROR = 3] = "ERROR", i[i.NONE = 4] = "NONE", i))(v || {});
var p = class {
  static {
    __name(this, "p");
  }
  constructor(e = 1, t) {
    this.level = e;
    this.prefix = t;
  }
  level;
  prefix;
  debug(e, ...t) {
    this.level <= 0 && console.debug(this.prefix + e, ...t);
  }
  info(e, ...t) {
    this.level <= 1 && console.info(this.prefix + e, ...t);
  }
  warn(e, ...t) {
    this.level <= 2 && console.warn(this.prefix + e, ...t);
  }
  error(e, ...t) {
    this.level <= 3 && console.error(this.prefix + e, ...t);
  }
};
var S = class a2 {
  static {
    __name(this, "a");
  }
  socket;
  host;
  port;
  secure;
  startTls;
  authType;
  credentials;
  socketTimeoutMs;
  responseTimeoutMs;
  name;
  reader;
  decoder = new TextDecoder();
  writer;
  logger;
  dsn;
  sendNotificationsTo;
  active = false;
  emailSending = null;
  emailToBeSent = new u();
  supportsDSN = false;
  allowAuth = false;
  authTypeSupported = [];
  supportsStartTls = false;
  constructor(e) {
    this.port = e.port, this.host = e.host, this.secure = !!e.secure, Array.isArray(e.authType) ? this.authType = e.authType : typeof e.authType == "string" ? this.authType = [e.authType] : this.authType = [], this.startTls = e.startTls === void 0 ? true : e.startTls, this.credentials = e.credentials, this.dsn = e.dsn || {}, this.socketTimeoutMs = e.socketTimeoutMs || 6e4, this.responseTimeoutMs = e.responseTimeoutMs || 3e4, this.name = e.name || "[127.0.0.1]", this.socket = b({ hostname: this.host, port: this.port }, { secureTransport: this.secure ? "on" : this.startTls ? "starttls" : "off", allowHalfOpen: false }), this.reader = this.socket.readable.getReader(), this.writer = this.socket.writable.getWriter(), this.logger = new p(e.logLevel, `[WorkerMailer:${this.host}:${this.port}]`);
  }
  static async connect(e) {
    let t = new a2(e);
    return await t.initializeSmtpSession(), t.start().catch(console.error), t;
  }
  send(e) {
    let t = new f(e);
    return this.emailToBeSent.enqueue(t), t.sent;
  }
  static async send(e, t) {
    let r = await a2.connect(e);
    await r.send(t), await r.close();
  }
  async readTimeout() {
    return T(this.read(), this.responseTimeoutMs, new Error("Timeout while waiting for smtp server response"));
  }
  async read() {
    let e = "";
    for (; ; ) {
      let { value: t, done: r } = await this.reader.read();
      if (r) throw new Error("SMTP connection closed by server");
      if (!t) continue;
      let n = this.decoder.decode(t, { stream: true });
      if (this.logger.debug(`SMTP server response:
` + n), e = e + n, !e.endsWith(`
`)) continue;
      let i = e.split(/\r?\n/), o = i[i.length - 2];
      if (!/^\d+-/.test(o)) return e;
    }
  }
  async writeLine(e) {
    await this.write(`${e}\r
`);
  }
  async write(e) {
    this.logger.debug(`Write to socket:
` + e), await this.writer.write(l(e));
  }
  async initializeSmtpSession() {
    await this.waitForSocketConnected(), await this.greet(), await this.ehlo(), this.startTls && !this.secure && this.supportsStartTls && (await this.tls(), await this.ehlo()), await this.auth(), this.active = true;
  }
  async start() {
    for (; this.active; ) {
      this.emailSending = await this.emailToBeSent.dequeue();
      try {
        await this.mail(), await this.rcpt(), await this.data(), await this.body(), this.emailSending.setSent();
      } catch (e) {
        if (this.logger.error("Failed to send email: " + e.message), !this.active) return;
        this.emailSending.setSentError(e);
        try {
          await this.rset();
        } catch (t) {
          await this.close(t);
        }
      }
      this.emailSending = null;
    }
  }
  async close(e) {
    for (this.active = false, this.logger.info("WorkerMailer is closed", e?.message || ""), this.emailSending?.setSentError?.(e || new Error("WorkerMailer is shutting down")); this.emailToBeSent.length; ) (await this.emailToBeSent.dequeue()).setSentError(e || new Error("WorkerMailer is shutting down"));
    try {
      await this.writeLine("QUIT"), await this.readTimeout(), this.socket.close().catch(() => this.logger.error("Failed to close socket"));
    } catch {
    }
  }
  async waitForSocketConnected() {
    this.logger.info("Connecting to SMTP server"), await T(this.socket.opened, this.socketTimeoutMs, new Error("Socket timeout!")), this.logger.info("SMTP server connected");
  }
  async greet() {
    let e = await this.readTimeout();
    if (!e.startsWith("220")) throw new Error("Failed to connect to SMTP server: " + e);
  }
  async ehlo() {
    await this.writeLine(`EHLO ${this.name}`);
    let e = await this.readTimeout();
    if (e.startsWith("421")) throw new Error(`Failed to EHLO. ${e}`);
    if (!e.startsWith("2")) {
      await this.helo();
      return;
    }
    this.parseCapabilities(e);
  }
  async helo() {
    await this.writeLine(`HELO ${this.name}`);
    let e = await this.readTimeout();
    if (!e.startsWith("2")) throw new Error(`Failed to HELO. ${e}`);
  }
  async tls() {
    await this.writeLine("STARTTLS");
    let e = await this.readTimeout();
    if (!e.startsWith("220")) throw new Error("Failed to start TLS: " + e);
    this.reader.releaseLock(), this.writer.releaseLock(), this.socket = this.socket.startTls(), this.reader = this.socket.readable.getReader(), this.writer = this.socket.writable.getWriter();
  }
  parseCapabilities(e) {
    /[ -]AUTH\b/i.test(e) && (this.allowAuth = true), /[ -]AUTH(?:(\s+|=)[^\n]*\s+|\s+|=)PLAIN/i.test(e) && this.authTypeSupported.push("plain"), /[ -]AUTH(?:(\s+|=)[^\n]*\s+|\s+|=)LOGIN/i.test(e) && this.authTypeSupported.push("login"), /[ -]AUTH(?:(\s+|=)[^\n]*\s+|\s+|=)CRAM-MD5/i.test(e) && this.authTypeSupported.push("cram-md5"), /[ -]STARTTLS\b/i.test(e) && (this.supportsStartTls = true), /[ -]DSN\b/i.test(e) && (this.supportsDSN = true);
  }
  async auth() {
    if (this.allowAuth) {
      if (!this.credentials) throw new Error("smtp server requires authentication, but no credentials found");
      if (this.authTypeSupported.includes("plain") && this.authType.includes("plain")) await this.authWithPlain();
      else if (this.authTypeSupported.includes("login") && this.authType.includes("login")) await this.authWithLogin();
      else if (this.authTypeSupported.includes("cram-md5") && this.authType.includes("cram-md5")) await this.authWithCramMD5();
      else throw new Error("No supported auth method found.");
    }
  }
  async authWithPlain() {
    let e = l(`\0${this.credentials.username}\0${this.credentials.password}`).toBase64();
    await this.writeLine(`AUTH PLAIN ${e}`);
    let t = await this.readTimeout();
    if (!t.startsWith("2")) throw new Error(`Failed to plain authentication: ${t}`);
  }
  async authWithLogin() {
    await this.writeLine("AUTH LOGIN");
    let e = await this.readTimeout();
    if (!e.startsWith("3")) throw new Error("Invalid login: " + e);
    let t = l(this.credentials.username).toBase64();
    await this.writeLine(t);
    let r = await this.readTimeout();
    if (!r.startsWith("3")) throw new Error("Failed to login authentication: " + r);
    let n = l(this.credentials.password).toBase64();
    await this.writeLine(n);
    let i = await this.readTimeout();
    if (!i.startsWith("2")) throw new Error("Failed to login authentication: " + i);
  }
  async authWithCramMD5() {
    await this.writeLine("AUTH CRAM-MD5");
    let e = await this.readTimeout(), t = e.match(/^334\s+(.+)$/)?.pop();
    if (!t) throw new Error("Invalid CRAM-MD5 challenge: " + e);
    let r = atob(t), n = l(this.credentials.password), i = await crypto.subtle.importKey("raw", n, { name: "HMAC", hash: "MD5" }, false, ["sign"]), o = l(r), s = await crypto.subtle.sign("HMAC", i, o), h = Array.from(new Uint8Array(s)).map((y) => y.toString(16).padStart(2, "0")).join("");
    await this.writeLine(l(`${this.credentials.username} ${h}`).toBase64());
    let d = await this.readTimeout();
    if (!d.startsWith("2")) throw new Error("Failed to cram-md5 authentication: " + d);
  }
  async mail() {
    let e = `MAIL FROM: <${this.emailSending.from.email}>`;
    this.supportsDSN && (e += ` ${this.retBuilder()}`, this.emailSending?.dsnOverride?.envelopeId && (e += ` ENVID=${this.emailSending?.dsnOverride?.envelopeId}`)), await this.writeLine(e);
    let t = await this.readTimeout();
    if (!t.startsWith("2")) throw new Error(`Invalid ${e} ${t}`);
  }
  async rcpt() {
    let e = [...this.emailSending.to, ...this.emailSending.cc || [], ...this.emailSending.bcc || []];
    for (let t of e) {
      let r = `RCPT TO: <${t.email}>`;
      this.supportsDSN && (r += this.notificationBuilder()), await this.writeLine(r);
      let n = await this.readTimeout();
      if (!n.startsWith("2")) throw new Error(`Invalid ${r} ${n}`);
    }
  }
  async data() {
    await this.writeLine("DATA");
    let e = await this.readTimeout();
    if (!e.startsWith("3")) throw new Error(`Failed to send DATA: ${e}`);
  }
  async body() {
    await this.write(this.emailSending.getEmailData());
    let e = await this.readTimeout();
    if (!e.startsWith("2")) throw new Error("Failed send email body: " + e);
  }
  async rset() {
    await this.writeLine("RSET");
    let e = await this.readTimeout();
    if (!e.startsWith("2")) throw new Error(`Failed to reset: ${e}`);
  }
  notificationBuilder() {
    let e = [];
    return (this.emailSending?.dsnOverride?.NOTIFY && this.emailSending?.dsnOverride?.NOTIFY?.SUCCESS || !this.emailSending?.dsnOverride?.NOTIFY && this.dsn?.NOTIFY?.SUCCESS) && e.push("SUCCESS"), (this.emailSending?.dsnOverride?.NOTIFY && this.emailSending?.dsnOverride?.NOTIFY?.FAILURE || !this.emailSending?.dsnOverride?.NOTIFY && this.dsn?.NOTIFY?.FAILURE) && e.push("FAILURE"), (this.emailSending?.dsnOverride?.NOTIFY && this.emailSending?.dsnOverride?.NOTIFY?.DELAY || !this.emailSending?.dsnOverride?.NOTIFY && this.dsn?.NOTIFY?.DELAY) && e.push("DELAY"), e.length > 0 ? ` NOTIFY=${e.join(",")}` : " NOTIFY=NEVER";
  }
  retBuilder() {
    let e = [];
    return (this.emailSending?.dsnOverride?.RET && this.emailSending?.dsnOverride?.RET?.HEADERS || !this.emailSending?.dsnOverride?.RET && this.dsn?.RET?.HEADERS) && e.push("HDRS"), (this.emailSending?.dsnOverride?.RET && this.emailSending?.dsnOverride?.RET?.FULL || !this.emailSending?.dsnOverride?.RET && this.dsn?.RET?.FULL) && e.push("FULL"), e.length > 0 ? `RET=${e.join(",")}` : "";
  }
};

// api/contact.js
var SITE = "https://samatechlb.com";
var BRAND = "SAMA";
var SERVICES = ["Web Development", "E-commerce", "UI/UX Design", "Mobile & App Development", "SEO", "Video Editing", "General enquiry"];
var EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i;
var json = /* @__PURE__ */ __name((status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }), "json");
var oneLine = /* @__PURE__ */ __name((s, max) => String(s ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max), "oneLine");
var esc = /* @__PURE__ */ __name((s) => String(s).replace(/[&<>"']/g, (c2) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c2]), "esc");
var paras = /* @__PURE__ */ __name((s) => esc(s).replace(/\n/g, "<br>"), "paras");
async function onRequestPost({ request, env: env2 }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json(400, { ok: false, error: "Please send the form again." });
  }
  if (data.company || Number(data.elapsed) > 0 && Number(data.elapsed) < 2500) return json(200, { ok: true });
  const name = oneLine(data.name, 80);
  const email = oneLine(data.email, 120);
  const message = String(data.message ?? "").replace(/\r\n/g, "\n").trim().slice(0, 5e3);
  const services = (Array.isArray(data.services) ? data.services : []).filter((s) => SERVICES.includes(s));
  const page = oneLine(data.page, 200);
  if (!name) return json(422, { ok: false, error: "Please enter your name." });
  if (!EMAIL_RE.test(email)) return json(422, { ok: false, error: "Please enter a valid email address." });
  if (message.length < 5) return json(422, { ok: false, error: "Please tell us a little about your project." });
  if (!env2.SMTP_HOST || !env2.SMTP_USER || !env2.SMTP_PASS) {
    console.error("contact: SMTP_HOST, SMTP_USER or SMTP_PASS is not set");
    return json(500, { ok: false, error: "We couldn't send your message. Please email us directly." });
  }
  const port = Number(env2.SMTP_PORT || 465);
  const ownEmail = env2.MAIL_FROM || env2.SMTP_USER;
  const inbox = env2.MAIL_TO || env2.SMTP_USER;
  const topic = services.length ? services.join(", ") : "General enquiry";
  let mailer;
  try {
    mailer = await S.connect({
      host: env2.SMTP_HOST,
      port,
      secure: port === 465,
      startTls: port !== 465,
      credentials: { username: env2.SMTP_USER, password: env2.SMTP_PASS },
      authType: ["plain", "login"],
      socketTimeoutMs: 15e3,
      responseTimeoutMs: 15e3
    });
    await mailer.send({
      from: { name: `${BRAND} website`, email: ownEmail },
      to: inbox,
      reply: { name, email },
      subject: `New enquiry from ${name}: ${topic}`,
      text: `Name: ${name}
Email: ${email}
Services: ${topic}${page ? `
Sent from: ${page}` : ""}

${message}

Reply to this email to answer ${name} directly.`,
      html: layout(`
        <h1 style="margin:0 0 18px;font-size:22px;color:#0b1430">New enquiry from ${esc(name)}</h1>
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.6;margin-bottom:18px">
          <tr><td style="color:#5b6785;padding-right:16px">Name</td><td><b>${esc(name)}</b></td></tr>
          <tr><td style="color:#5b6785;padding-right:16px">Email</td><td><a href="mailto:${esc(email)}" style="color:#2f6bff">${esc(email)}</a></td></tr>
          <tr><td style="color:#5b6785;padding-right:16px">Services</td><td>${esc(topic)}</td></tr>
          ${page ? `<tr><td style="color:#5b6785;padding-right:16px">Sent from</td><td>${esc(page)}</td></tr>` : ""}
        </table>
        <div style="padding:16px 18px;border-radius:12px;background:#f2f5fc;font-size:15px;line-height:1.6;color:#1b2440">${paras(message)}</div>
        <p style="margin:18px 0 0;font-size:13px;color:#5b6785">Press reply to answer ${esc(name)} directly.</p>`)
    });
  } catch (err) {
    console.error("contact: enquiry not sent", err);
    try {
      await mailer?.close();
    } catch {
    }
    return json(502, { ok: false, error: "We couldn't send your message right now. Please try again or email us directly." });
  }
  try {
    const first = name.split(" ")[0];
    await mailer.send({
      from: { name: BRAND, email: ownEmail },
      to: { name, email },
      reply: { name: BRAND, email: inbox },
      subject: `Thank you for contacting ${BRAND}`,
      text: `Hi ${first},

Thank you for contacting ${BRAND}. We've received your message and will get back to you soon, usually within 24 hours.

Here's a copy of what you sent:

Services: ${topic}
${message}

If you'd like to add anything, just reply to this email.

The ${BRAND} team
${SITE}`,
      html: layout(`
        <h1 style="margin:0 0 14px;font-size:24px;color:#0b1430">Thank you for contacting ${BRAND}</h1>
        <p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#1b2440">Hi ${esc(first)},</p>
        <p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#1b2440">We've received your message and will get back to you soon, usually within 24 hours.</p>
        <p style="margin:0 0 22px;font-size:16px;line-height:1.65;color:#1b2440">If you'd like to add anything, like links, files or a deadline, just reply to this email.</p>
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#5b6785">Your message</p>
        <div style="padding:16px 18px;border-radius:12px;background:#f2f5fc;font-size:15px;line-height:1.6;color:#1b2440"><b>${esc(topic)}</b><br>${paras(message)}</div>
        <p style="margin:24px 0 0;font-size:16px;line-height:1.65;color:#1b2440">The ${BRAND} team</p>`)
    });
  } catch (err) {
    console.error("contact: thank-you email not sent", err);
  }
  try {
    await mailer.close();
  } catch {
  }
  return json(200, { ok: true });
}
__name(onRequestPost, "onRequestPost");
var onRequest = /* @__PURE__ */ __name(() => json(405, { ok: false, error: "Use POST." }), "onRequest");
function layout(body) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#eef2fa">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2fa;padding:32px 12px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
      <tr><td style="padding:0 6px 16px;font-size:20px;font-weight:800;letter-spacing:.04em;color:#0b1430">${BRAND}</td></tr>
      <tr><td style="height:4px;background:#3d7bff;background-image:linear-gradient(95deg,#3d7bff,#9cc4ff);border-radius:4px 4px 0 0"></td></tr>
      <tr><td style="background:#ffffff;padding:30px 28px;border-radius:0 0 14px 14px">${body}</td></tr>
      <tr><td style="padding:16px 6px;font-size:12px;color:#5b6785"><a href="${SITE}" style="color:#5b6785">samatechlb.com</a></td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}
__name(layout, "layout");

// ../.wrangler/tmp/pages-0LIqjr/functionsRoutes-0.7243885509146069.mjs
var routes = [
  {
    routePath: "/api/contact",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/contact",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  }
];

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function getOriginalPathPrefix(requestPath, normalizedPrefix) {
  let end = 0;
  for (let index = 0; index < normalizedPrefix.length; index++) {
    end++;
    if (normalizedPrefix[index] === "/") {
      while (requestPath[end] === "/") {
        end++;
      }
    }
  }
  return requestPath.slice(0, end);
}
__name(getOriginalPathPrefix, "getOriginalPathPrefix");
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  const normalizedRequestPath = requestPath.replace(/\/+/g, "/");
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath) || routeMatcher(normalizedRequestPath);
    const originalMountMatch = mountMatcher(requestPath);
    const mountMatchResult = originalMountMatch || mountMatcher(normalizedRequestPath);
    if (matchResult && mountMatchResult) {
      const path = originalMountMatch ? originalMountMatch.path : getOriginalPathPrefix(requestPath, mountMatchResult.path);
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error3) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error3;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    const body = JSON.stringify(error3);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-cejTMl/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../../AppData/Local/npm-cache/_npx/c943b712072b77c4/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-cejTMl/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.20661866857698308.mjs.map
