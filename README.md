## LRU with Ttl

A Time-aware LRU key-value store with global/per value ttl setting and efficient lookup

See details in [wikipedia](https://en.wikipedia.org/wiki/Cache_replacement_policies#Time_aware_least_recently_used_(TLRU))

### API

	const LRU = require('lru-with-ttl')
	const store = new LRU({ maxItems, ttl, touchOnGet })

	store.set(k, v, [ttl])

	store.get(k)

	// Event handlers are of the form (key, value) => { ... }
	
	store.on('create', onCreate)
	store.on('update', onUpdate)
	store.on('eviction', onEviction)

#### options
##### maxItems (default : 1000)
Max items to store before the oldest item gets evicted

##### ttl  (default : undefined)
Cache expiry time in milliseconds. When undefined items purged only when maxItems is reached.

##### touchOnGet
By default items get touched when read. Setting this to true will cause the items to expire after ttl and keep their place in the LRU queue regardless of reads.

	
## License
MIT