declare const queueMarker: unique symbol;
interface QueueEntry<T> {
    payload: T;
    next: QueueEntry<T> | null;
    prev: QueueEntry<T> | null;
    [queueMarker]?: LinkedQueue<T>;
}
declare class LinkedQueue<T = any> {
    first: QueueEntry<T> | null;
    last: QueueEntry<T> | null;
    length: number;
    _enqueue(entry: QueueEntry<T>): QueueEntry<T>;
    enqueue(payload: T): QueueEntry<T>;
    requeue(entry: QueueEntry<T>): QueueEntry<T>;
    remove(entry: QueueEntry<T>): void;
    raw(): void;
    dequeue(): T | undefined;
    clear(): void;
}
export = LinkedQueue;
