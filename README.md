## LRU with Ttl

A Time-aware LRU key-value store with global/per value ttl setting and efficient lookup

See: https://en.wikipedia.org/wiki/Cache_replacement_policies#Time_aware_least_recently_used_(TLRU)

### API

	const LRU = require('lru-with-ttl')
	const store = new LRU({ maxItems, ttl })

	store.set(k, v, [ttl])

	store.get(k)

	// Event handlers are of the form (key, value) => { ... }
	
	store.on('create', onCreate)
	store.on('update', onUpdate)
	store.on('eviction', onEviction)

## License
MIT