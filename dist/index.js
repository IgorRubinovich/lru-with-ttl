"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/LinkedQueue.ts
var require_LinkedQueue = __commonJS({
  "src/LinkedQueue.ts"(exports2, module2) {
    "use strict";
    var queueMarker = /* @__PURE__ */ Symbol("LinkedQueue marker symbol");
    var LinkedQueue2 = class {
      constructor() {
        this.first = null;
        this.last = null;
        this.length = 0;
      }
      _enqueue(entry) {
        const oldFirst = this.first;
        this.first = entry;
        entry.next = oldFirst;
        entry.prev = null;
        entry[queueMarker] = this;
        if (this.first.next) {
          this.first.next.prev = this.first;
        }
        if (!this.last) {
          this.last = this.first.next || this.first;
        }
        this.length++;
        return this.first;
      }
      enqueue(payload) {
        return this._enqueue({ payload, next: null, prev: null });
      }
      requeue(entry) {
        this.remove(entry);
        return this._enqueue(entry);
      }
      remove(entry) {
        if (!entry || entry[queueMarker] != this) {
          return;
        }
        if (entry === this.last) {
          this.last = entry.prev;
        }
        if (entry === this.first) {
          this.first = entry.next;
        }
        const next = entry.next;
        const prev = entry.prev;
        if (prev) {
          prev.next = next;
        }
        if (next) {
          next.prev = entry.prev;
        }
        if (this.last) {
          this.last.next = null;
        }
        if (this.first) {
          this.first.prev = null;
        }
        entry.next = entry.prev = null;
        delete entry[queueMarker];
        this.length--;
      }
      raw() {
        let i = this.first;
        const o = [];
        const s = JSON.stringify.bind(JSON);
        while (i) {
          o.push(s(i.payload));
          i = i.next;
        }
        console.log(`first: ${s((this.first || {}).payload)}, last: ${s((this.last || {}).payload)} all: '${o.join(" ")}', queue length: ${this.length}`);
      }
      dequeue() {
        if (!this.length) {
          return;
        }
        const last = this.last;
        if (last === this.first) {
          this.first = null;
          this.last = null;
        } else {
          this.last = last.prev;
          if (this.last) {
            this.last.next = null;
          }
        }
        this.length--;
        delete last[queueMarker];
        return last.payload;
      }
      clear() {
        this.first = this.last = null;
        this.length = 0;
      }
    };
    module2.exports = LinkedQueue2;
  }
});

// src/index.ts
var EventEmitter = require("events");
var LinkedQueue = require_LinkedQueue();
var deepEqual = require("fast-deep-equal");
var LRUWithTtl = class extends EventEmitter {
  constructor(options = {}) {
    super();
    if (typeof options === "number") {
      options = { maxItems: options };
    }
    this.maxItems = options.maxItems || 1e3;
    this.ttl = options.ttl;
    this.options = { ...options };
    this.data = /* @__PURE__ */ new Map();
    this.LRUQueue = new LinkedQueue();
    this.touchOnGet = typeof options.touchOnGet === "undefined" ? true : options.touchOnGet;
  }
  scheduleExpiry(entry, ttl) {
    clearTimeout(entry.timer);
    ttl = ttl || entry.ttl || this.ttl;
    entry.ttl = ttl;
    if (ttl && ttl > 0) {
      entry.timer = setTimeout(() => this.delete(entry.k), ttl);
    }
  }
  unScheduleExpiry(entry) {
    clearTimeout(entry.timer);
  }
  _touch(entry, ttl) {
    if (entry.queueEntry) {
      this.LRUQueue.requeue(entry.queueEntry);
    }
    this.scheduleExpiry(entry, ttl);
    entry.lastUsed = Date.now();
    this.emit("touch", entry.k, entry.v);
  }
  touch(k) {
    const e = this.data.get(k);
    if (e) {
      this._touch(e);
    }
  }
  get(k) {
    const entry = this.data.get(k);
    if (entry && this.touchOnGet) {
      this._touch(entry);
    }
    return entry && entry.v;
  }
  set(k, v, ttl) {
    const oldEntry = this.data.get(k);
    if (oldEntry) {
      if (!deepEqual(oldEntry.v, v)) {
        oldEntry.v = v;
        this.emit("update", k, v);
      }
      this._touch(oldEntry, ttl);
    } else {
      const newEntry = { k, v };
      this.data.set(k, newEntry);
      if (this.LRUQueue.length + 1 > this.maxItems) {
        const key = this.LRUQueue.dequeue();
        if (key) {
          this.delete(key);
        }
      }
      this._touch(newEntry, ttl);
      newEntry.queueEntry = this.LRUQueue.enqueue(k);
      this.emit("create", k, v, ttl);
    }
  }
  delete(k) {
    const d = this.data.get(k);
    if (!d) return;
    this.unScheduleExpiry(d);
    this.LRUQueue.remove(d.queueEntry);
    this.data.delete(k);
    this.emit("eviction", k, d.v);
  }
  destroyAll() {
    this.LRUQueue.clear();
    this.data.clear();
  }
};
module.exports = LRUWithTtl;
