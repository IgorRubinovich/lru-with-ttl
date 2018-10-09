/*
	A Time-aware LRU key-value store with global/per value ttl setting and efficient lookup
	
	See README.md
*/

const EventEmitter = require('events');
const LinkedQueue = require('./lib/LinkedQueue')
const deepEqual = require('fast-deep-equal');

class LRUWithTtl extends EventEmitter {
	constructor(options = {}) {
		super();
		if(options >= 0)
			options = { maxItems : options };
		
		this.maxItems = options.maxItems = options.maxItems || 1000;
		this.ttl = options.ttl = options.ttl;
		this.options = { ...options };
		this.data = new Map();
		this.LRUQueue = new LinkedQueue();
		this.touchOnGet = typeof options.touchOnGet == 'undefined' ? true : options.touchOnGet;
	}
	scheduleExpiry(entry, ttl) {
		clearTimeout(entry.timer);
		ttl = ttl || entry.ttl || this.ttl;
		entry.timer = ttl > 0 && setTimeout(() => this.delete(entry.k), ttl);
	}
	unScheduleExpiry(entry) {
		clearTimeout(entry.timer);
	}
	_touch(entry, ttl) {
		entry.queueEntry && this.LRUQueue.requeue(entry.queueEntry); // if it has none it's a new entry and not yet queued
		this.scheduleExpiry(entry, ttl);
		entry.lastUsed = Date.now();
		this.emit('touch', entry.k, entry.v);
	}
	touch(k) {
		const e = this.data.get(k)
		this._touch(e);
	}
	get(k) {
		const entry = this.data.get(k);
		
		(entry && this.touchOnGet) && this._touch(entry);

		return entry && entry.v;
	}
	set(k, v, ttl) {
		const oldEntry = this.data.get(k);
		var emit = 'update';

		if(oldEntry)
		{
			if(!deepEqual(oldEntry.v, v)) {
				oldEntry.v = v;
				this.emit('update', k, v);
			}

			this._touch(oldEntry, ttl);
		}
		else
		{
			const newEntry = { k, v };

			this.data.set(k, newEntry);
		
			if(this.LRUQueue.length + 1 > this.maxItems)
				this.delete(this.LRUQueue.dequeue())

			this._touch(newEntry, ttl);
			newEntry.queueEntry = this.LRUQueue.enqueue(k);
			
			this.emit('create', k, v, ttl);
		}
		
	}
	delete(k) {
		const d = this.data.get(k);
		
		if(!d) return;
		
		this.unScheduleExpiry(d);

		this.LRUQueue.remove(d.queueEntry);

		this.data.delete(k);

		this.emit('eviction', k, d.v);
	}
	destroyAll() {
		this.LRUQueue.clear();
		this.data.clear();
	}
}

module.exports = LRUWithTtl;