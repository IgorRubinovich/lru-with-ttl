/*
	A simple LinkedQueue with remove and requeue capacities
*/

"use strict";

const queueMarker = Symbol('LinkedQueue marker symbol')

class LinkedQueue { 
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
		
		this.first.next && (this.first.next.prev = this.first);
		if(!this.last)
			this.last = this.first.next || this.first;

		this.length++;
		
		return this.first;
	}
	enqueue(payload) {
		return this._enqueue({ payload });
	}
	requeue(entry) {
		this.remove(entry);
		return this._enqueue(entry); // must keep the entry object so it can be tracked by user code
	}
	remove(entry) { // its a specific queue entry and it's being thrown into GC
		if(!entry || entry[queueMarker] != this)
			return;
		
		if(entry == this.last)
			this.last = entry.prev;
		
		if(entry == this.first)
			this.first = entry.next;
		
		const next = entry.next;
		const prev = entry.prev;

		prev && (prev.next = next);
		next && (next.prev = entry.prev);
		
		this.last && (this.last.next = null);
		this.first && (this.first.prev = null);
		
		entry.next = entry.prev = null;

		delete entry[queueMarker];
		
		this.length--;
	}
	raw() {
		var i = this.first;
		const o = []
		const s  = JSON.stringify.bind(JSON)

		while(i)
			o.push(s(i.payload)), i = i.next;
		
		console.log(`first: ${ s((this.first || {}).payload) }, last: ${ s((this.last || {}).payload) } all: '${ o.join(' ') }', queue length: ${ this.length }`)
	}
	dequeue() {
		const last = this.last;

		if(!this.length)
			return;
		
		last == this.first && (this.first = last.next);
		
		this.last = last.prev;
		this.last && (this.last.next = null);
		this.length--;
	
		delete last[queueMarker];
		
		return last.payload;
	}
	clear() {
		this.first = this.last = null;
		this.length = 0;
	}
}

function test() {
	console.log("Running test/demo");

	const lq = new LinkedQueue();

	const els = [
		lq.enqueue({x : 0}),
		lq.enqueue({x : 1}),
		lq.enqueue({x : 2}),
		lq.enqueue({x : 3})
	];

	const step = (n, f) => {
		f()
		console.log()
		console.log(n)
		lq.raw()
	}

	step('initial state', () => {})
	step('remove 1', () => lq.remove(els[1]))
	debugger;
	step('requeue 2', () => lq.requeue(els[2]))
	step('dequeue', () => lq.dequeue())
	step('dequeue', () => lq.dequeue())
	step('dequeue', () => lq.dequeue())
	step('dequeue non-existant (should have no effect)', () => lq.dequeue())
	step('remove non-existant (should keep queue length)', () => lq.remove(els[1]))
}

if(require.main === module)
	test();


module.exports = LinkedQueue;
