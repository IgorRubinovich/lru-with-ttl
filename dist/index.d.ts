import { EventEmitter } from 'ee-ts';
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
declare class LRUWithTtl<K = any, V = any> extends EventEmitter<LruEvents<K, V>> {
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
export default LRUWithTtl;
