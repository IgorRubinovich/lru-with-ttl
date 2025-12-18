import EventEmitter = require('events');
interface LruWithTtlOptions {
    maxItems?: number;
    ttl?: number;
    touchOnGet?: boolean;
}
interface CacheEntry<K, V> {
    k: K;
    v: V;
    ttl?: number;
    timer?: NodeJS.Timeout;
    queueEntry?: any;
    lastUsed?: number;
}
declare class LRUWithTtl<K = any, V = any> extends EventEmitter {
    private maxItems;
    private ttl?;
    private options;
    private data;
    private LRUQueue;
    private touchOnGet;
    constructor(options?: LruWithTtlOptions | number);
    scheduleExpiry(entry: CacheEntry<K, V>, ttl?: number): void;
    unScheduleExpiry(entry: CacheEntry<K, V>): void;
    _touch(entry: CacheEntry<K, V>, ttl?: number): void;
    touch(k: K): void;
    get(k: K): V | undefined;
    set(k: K, v: V, ttl?: number): void;
    delete(k: K): void;
    destroyAll(): void;
}
export = LRUWithTtl;
