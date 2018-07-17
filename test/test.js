/*
	A few correctness performance tests
*/

const LRUWithTtl = require('lru-with-ttl');

!function(a,b){function c(c,j,k){var n=[];j=1==j?{entropy:!0}:j||{};var s=g(f(j.entropy?[c,i(a)]:null==c?h():c,3),n),t=new d(n),u=function(){for(var a=t.g(m),b=p,c=0;a<q;)a=(a+c)*l,b*=l,c=t.g(1);for(;a>=r;)a/=2,b/=2,c>>>=1;return(a+c)/b};return u.int32=function(){return 0|t.g(4)},u.quick=function(){return t.g(4)/4294967296},u.double=u,g(i(t.S),a),(j.pass||k||function(a,c,d,f){return f&&(f.S&&e(f,t),a.state=function(){return e(t,{})}),d?(b[o]=a,c):a})(u,s,"global"in j?j.global:this==b,j.state)}function d(a){var b,c=a.length,d=this,e=0,f=d.i=d.j=0,g=d.S=[];for(c||(a=[c++]);e<l;)g[e]=e++;for(e=0;e<l;e++)g[e]=g[f=s&f+a[e%c]+(b=g[e])],g[f]=b;(d.g=function(a){for(var b,c=0,e=d.i,f=d.j,g=d.S;a--;)b=g[e=s&e+1],c=c*l+g[s&(g[e]=g[f=s&f+b])+(g[f]=b)];return d.i=e,d.j=f,c})(l)}function e(a,b){return b.i=a.i,b.j=a.j,b.S=a.S.slice(),b}function f(a,b){var c,d=[],e=typeof a;if(b&&"object"==e)for(c in a)try{d.push(f(a[c],b-1))}catch(a){}return d.length?d:"string"==e?a:a+"\0"}function g(a,b){for(var c,d=a+"",e=0;e<d.length;)b[s&e]=s&(c^=19*b[s&e])+d.charCodeAt(e++);return i(b)}function h(){try{var b;return j&&(b=j.randomBytes)?b=b(l):(b=new Uint8Array(l),(k.crypto||k.msCrypto).getRandomValues(b)),i(b)}catch(b){var c=k.navigator,d=c&&c.plugins;return[+new Date,k,d,k.screen,i(a)]}}function i(a){return String.fromCharCode.apply(0,a)}var j,k=this,l=256,m=6,n=52,o="random",p=b.pow(l,m),q=b.pow(2,n),r=2*q,s=l-1;if(b["seed"+o]=c,g(b.random(),a),"object"==typeof module&&module.exports){module.exports=c;try{j=require("crypto")}catch(a){}}else"function"==typeof define&&define.amd&&define(function(){return c})}([],Math);
Math.seedrandom("xxx", { entropy : true });

const logg = () => {};
//const logg = console.log.bind(console);
function test(maxItems, items, expiryMode) {
	const l = new LRUWithTtl({ maxItems : maxItems || 15000, ttl : expiryMode != 'no' ? null : 300 });

	return new Promise((res, rej) => {
		l.on('eviction', (k,v) => {
			//logg(`EVENT evicted ${k} ${v}`)
			//console.log(k)
			//console.log(k, Object.keys(l.data).length)
			if(!Object.keys(l.data).length)
				l.destroyAll(), res();
		})
		//l.on('update', (k,v) => logg(`EVENT updated ${k} ${v}`))


		for(let i=0; i < (items || 100); i++)
		{
			const k = "x" + Math.random(); // randomizing keys is more realistic and also shows better performance at smaller i/im values and just a bit slower at larger numbers - that's partially affected by the random number generation itself
			l.set("x"+k, i+"-"+i, expiryMode != 'no' ? (expiryMode == 'random' ? Math.random() * 3000 + 4000 : Math.min(i,7000)) : null), l.get("x1")
		}

		if(expiryMode == 'no')
			l.destroyAll(), res();
		
		return;

		l.set("longliver", "lives for 6 secs", 6000)

		l.set("x1", "The only item left after 5s is x1 which was touched.")

		l.LRUQueue.raw()
		
		setTimeout(() => l.get("x1"), 2700)
		setTimeout(() => (l.LRUQueue.raw()), 5000)
		setTimeout(() => (logg('Now after 7s everything should have expired anyway.'), l.LRUQueue.raw()), 7000)
		setTimeout(() => {logg("data", l.data); debugger; }, 5000)
	})
}

const MAX = 5000000;

async function performance(expiryMode) {
	console.log(`\nTime in seconds to process tot items cache throughput into max slots in LRU fashion with ${ expiryMode } expiry`)
	let row = ["max\\tot | "];
	for(let i = 10; i < MAX; i *= 10)
		row.push(i.toString().padStart(7, "_"))

	console.log(row.join`_`)

	for(let mi = 10; mi < MAX; mi *= 10)
	{
		row = [mi.toString().padStart(7) + " | "];
		for(let i = 10; i < MAX; i *= 10)
		{
			//console.log(mi, i)
			let s = Date.now();
			await test(mi, i, expiryMode)
			let e = Date.now();
			await new Promise((res, rej) => setTimeout(() => res(), 5000)); // let the system breathe between sprints
			row.push(((e-s)/1000).toString().padStart(7));
			//row.push(`${ mi.toString().padStart(7) } ${ i }`);
		}
		console.log(row.join` `)
	}
}

async function performanceVariations() {
	await performance('random');
	await performance('uniform');
	await performance('no');
}

if(require.main === module)
	performanceVariations().catch(err => console.log(err.stack))