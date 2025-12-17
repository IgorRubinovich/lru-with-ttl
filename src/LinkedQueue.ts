/*
	A simple LinkedQueue with remove and requeue capacities
*/

"use strict";

const queueMarker = Symbol('LinkedQueue marker symbol');

interface QueueEntry<T> {
    payload: T;
    next: QueueEntry<T> | null;
    prev: QueueEntry<T> | null;
    [queueMarker]?: LinkedQueue<T>;
}

class LinkedQueue<T = any> {
    first: QueueEntry<T> | null = null;
    last: QueueEntry<T> | null = null;
    length = 0;

	_enqueue(entry: QueueEntry<T>): QueueEntry<T> {
		const oldFirst = this.first;
		
		this.first = entry;
		
		entry.next = oldFirst;
		entry.prev = null;
		entry[queueMarker] = this;
		
		if (this.first.next) {
			this.first.next.prev = this.first;
		}
		if(!this.last) {
			this.last = this.first.next || this.first;
		}

		this.length++;
		
		return this.first;
	}

	enqueue(payload: T): QueueEntry<T> {
		return this._enqueue({ payload, next: null, prev: null });
	}

	requeue(entry: QueueEntry<T>): QueueEntry<T> {
		this.remove(entry);
		return this._enqueue(entry); // must keep the entry object so it can be tracked by user code
	}

	remove(entry: QueueEntry<T>): void { // its a specific queue entry and it's being thrown into GC
		if(!entry || entry[queueMarker] != this) {
			return;
		}
		
		if(entry === this.last) {
			this.last = entry.prev;
		}
		
		if(entry === this.first) {
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

	raw(): void {
		let i = this.first;
		const o = [];
		const s  = JSON.stringify.bind(JSON);

		while(i) {
			o.push(s(i.payload));
			i = i.next;
		}
		
		console.log(`first: ${ s((this.first || {}).payload) }, last: ${ s((this.last || {}).payload) } all: '${ o.join(' ') }', queue length: ${ this.length }`);
	}

	dequeue(): T | undefined {
		if (!this.length) {
			return;
		}
		
		const last = this.last!; // Assert 'last' is not null
		
		if (last === this.first) {
			this.first = null; // If last was the only element, first should also be null
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

	clear(): void {
		this.first = this.last = null;
		this.length = 0;
	}
}

export = LinkedQueue;
