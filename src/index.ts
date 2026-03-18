/*
	A Time-aware LRU key-value store with global/per value ttl setting and efficient lookup
	
	See README.md
*/

import { EventEmitter } from 'ee-ts';
import LinkedQueue from './LinkedQueue';
import deepEqual from 'fast-deep-equal';

interface LruWithTtlOptions {
    maxItems?: number;
    ttl?: number;
    touchOnGet?: boolean;
}

interface CacheEntry<K, V> {
    k: K;
    v: V;
    ttl?: number;
    timer?: any;
    queueEntry?: any;
    lastUsed?: number;
}

interface LruEvents<K, V> {
    touch(key: K, value: V): void;
    update(key: K, value: V): void;
    create(key: K, value: V, ttl?: number): void;
    eviction(key: K, value: V): void;
}

class LRUWithTtl<K = any, V = any> extends EventEmitter<LruEvents<K, V>> {
    private maxItems: number;
    private ttl?: number;
    private options: LruWithTtlOptions;
    private data: Map<K, CacheEntry<K, V>>;
    private LRUQueue: LinkedQueue<K>;
    private touchOnGet: boolean;

	constructor(options: LruWithTtlOptions | number = {}) {
		super();
		if(typeof options === 'number') {
			options = { maxItems : options };
        }
		
		this.maxItems = options.maxItems || 1000;
		this.ttl = options.ttl;
		this.options = { ...options };
		this.data = new Map();
		this.LRUQueue = new LinkedQueue();
		this.touchOnGet = typeof options.touchOnGet === 'undefined' ? true : options.touchOnGet;
	}

	scheduleExpiry(entry: CacheEntry<K, V>, ttl?: number): void {
		clearTimeout(entry.timer);
		ttl = ttl || entry.ttl || this.ttl;
		entry.ttl = ttl;
		if (ttl && ttl > 0) {
            entry.timer = setTimeout(() => this.delete(entry.k), ttl);
        }
	}

	unScheduleExpiry(entry: CacheEntry<K, V>): void {
		clearTimeout(entry.timer);
	}

	_touch(entry: CacheEntry<K, V>, ttl?: number): void {
		if (entry.queueEntry) {
            this.LRUQueue.requeue(entry.queueEntry); // if it has none it's a new entry and not yet queued
        }
		this.scheduleExpiry(entry, ttl);
		entry.lastUsed = Date.now();
		this.emit('touch', entry.k, entry.v);
	}

	touch(k: K): void {
		const e = this.data.get(k);
		if (e) {
            this._touch(e);
        }
	}

	get(k: K): V | undefined {
		const entry = this.data.get(k);
		
		if (entry && this.touchOnGet) {
            this._touch(entry);
        }

		return entry && entry.v;
	}

	set(k: K, v: V, ttl?: number): void {
		const oldEntry = this.data.get(k);

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
			const newEntry: CacheEntry<K, V> = { k, v };

			this.data.set(k, newEntry);
		
			if(this.LRUQueue.length + 1 > this.maxItems) {
                const key = this.LRUQueue.dequeue();
                if (key) {
                    this.delete(key);
                }
            }

			this._touch(newEntry, ttl);
			newEntry.queueEntry = this.LRUQueue.enqueue(k);
			
			this.emit('create', k, v, ttl);
		}
		
	}

	delete(k: K): void {
		const d = this.data.get(k);
		
		if(!d) return;
		
		this.unScheduleExpiry(d);

		this.LRUQueue.remove(d.queueEntry);

		this.data.delete(k);

		this.emit('eviction', k, d.v);
	}

	destroyAll(): void {
		this.LRUQueue.clear();
		this.data.clear();
	}
}

export default LRUWithTtl;