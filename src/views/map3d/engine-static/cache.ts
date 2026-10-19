export const CACHE_DATABASE = 'map-explorer-packets-v1'
export type CacheStatus = 'uninitialized' | 'ready' | 'unavailable'
type Quota = { bytes: number; entries: number; limit?: number }
type ReadJob = {
	key: string
	generation: number
	db: IDBDatabase
	resolve(buffer: ArrayBuffer | null): void
	registered: Promise<void>
	register(): void
	settled: boolean
	reading: boolean
	tx?: IDBTransaction
}
type Touch = {
	key: string
	accessed: number
	generation: number
	waiters: { job: ReadJob; buffer: ArrayBuffer }[]
}

/** App-owned IndexedDB. Payload LRU reads metadata only, never mesh/blob data. */
export class PacketCache {
	private db?: Promise<IDBDatabase | null>
	private generation = 0
	private writes = 0
	private trimming?: Promise<void>
	private reads: ReadJob[] = []
	private jobs = new Set<ReadJob>()
	private reading = 0
	private pumpingReads = false
	private touches = new Map<string, Touch>()
	private touchCount = 0
	private touchTimer?: ReturnType<typeof setTimeout>
	private touching?: { db: IDBDatabase; tx: IDBTransaction }
	maxBytes: number
	status: CacheStatus = 'uninitialized'
	hits = 0
	misses = 0
	bytes = 0
	entries = 0
	constructor(maxBytes = 512 * 1024 * 1024) {
		if (!Number.isSafeInteger(maxBytes) || maxBytes < 1)
			throw Error('Invalid disk cache quota')
		this.maxBytes = maxBytes
	}
	private open(): Promise<IDBDatabase | null> {
		return (this.db ??= new Promise((resolve) => {
			try {
				if (!globalThis.indexedDB) {
					this.status = 'unavailable'
					resolve(null)
					return
				}
				const request = indexedDB.open(CACHE_DATABASE, 3)
				request.onupgradeneeded = () => {
					const db = request.result,
						tx = request.transaction!
					if (!db.objectStoreNames.contains('packets'))
						db.createObjectStore('packets', { keyPath: 'key' })
					if (!db.objectStoreNames.contains('metadata')) {
						const metadata = db.createObjectStore('metadata', {
							keyPath: 'key',
						})
						metadata.createIndex('accessed', 'accessed')
					}
					if (!db.objectStoreNames.contains('bootstrap'))
						db.createObjectStore('bootstrap', { keyPath: 'key' })
					let bytes = 0,
						entries = 0
					const cursor = tx.objectStore('metadata').openCursor()
					cursor.onsuccess = () => {
						const row = cursor.result
						if (row) {
							bytes += row.value.bytes
							entries++
							row.continue()
						} else
							tx.objectStore('bootstrap').put({
								key: '__quota__',
								value: { bytes, entries },
							})
					}
				}
				request.onsuccess = () => {
					const db = request.result
					db.onversionchange = () => {
						this.generation++
						this.cancelReads()
						this.cancelTouchTransaction()
						db.close()
						this.db = undefined
						this.status = 'uninitialized'
					}
					this.status = 'ready'
					const quota = db
						.transaction('bootstrap')
						.objectStore('bootstrap')
						.get('__quota__')
					quota.onsuccess = () => {
						this.bytes = quota.result?.value?.bytes ?? 0
						this.entries = quota.result?.value?.entries ?? 0
						this.maxBytes =
							quota.result?.value?.limit ?? this.maxBytes
						resolve(db)
					}
					quota.onerror = () => resolve(db)
				}
				request.onerror = () => {
					this.status = 'unavailable'
					resolve(null)
				}
				request.onblocked = () => {
					this.status = 'unavailable'
					resolve(null)
				}
			} catch {
				this.status = 'unavailable'
				resolve(null)
			}
		}))
	}
	async get(key: string): Promise<ArrayBuffer | null> {
		const generation = this.generation
		const db = await this.open()
		if (!db) {
			this.misses++
			return null
		}
		if (generation !== this.generation) return null
		return new Promise((resolve) => {
			let register!: () => void
			const registered = new Promise<void>((done) => {
				register = done
			})
			const job: ReadJob = {
				key,
				generation,
				db,
				resolve,
				registered,
				register,
				settled: false,
				reading: false,
			}
			this.jobs.add(job)
			this.reads.push(job)
			this.pumpReads()
		})
	}
	private settle(job: ReadJob, buffer: ArrayBuffer | null): void {
		if (job.settled) return
		job.settled = true
		this.jobs.delete(job)
		job.register()
		job.resolve(buffer)
	}
	private pumpReads(): void {
		// The pending batch and reads share 64 slots. An active metadata batch has
		// already returned its buffers, so slow disk writes cannot accumulate a
		// second unbounded payload queue behind it.
		if (this.pumpingReads) return
		this.pumpingReads = true
		try {
			while (this.reads.length && this.reading + this.touchCount < 64) {
				const job = this.reads.shift()!
				if (job.settled) continue
				if (job.generation !== this.generation) {
					this.settle(job, null)
					continue
				}
				this.reading++
				job.reading = true
				let finished = false
				const finish = (buffer: ArrayBuffer | null) => {
					if (finished) return
					finished = true
					this.reading--
					job.reading = false
					job.tx = undefined
					if (!job.settled) {
						if (job.generation !== this.generation)
							this.settle(job, null)
						else if (buffer) {
							this.hits++
							let touch = this.touches.get(job.key)
							if (!touch)
								this.touches.set(
									job.key,
									(touch = {
										key: job.key,
										accessed: Date.now(),
										generation: job.generation,
										waiters: [],
									})
								)
							else
								touch.accessed = Math.max(
									touch.accessed,
									Date.now()
								)
							touch.waiters.push({ job, buffer })
							this.touchCount++
							if (this.touchCount === 64) this.flushTouches()
							else if (!this.touchTimer)
								this.touchTimer = setTimeout(() => {
									this.touchTimer = undefined
									this.flushTouches()
								}, 2)
						} else {
							this.misses++
							this.settle(job, null)
						}
					}
					this.pumpReads()
				}
				try {
					const tx = job.db.transaction('packets', 'readonly'),
						request = tx.objectStore('packets').get(job.key)
					job.tx = tx
					request.onsuccess = () =>
						finish(request.result?.buffer ?? null)
					request.onerror = () => finish(null)
					tx.onabort = () => finish(null)
					tx.onerror = () => finish(null)
				} catch {
					finish(null)
				}
			}
		} finally {
			this.pumpingReads = false
		}
	}
	private flushTouches(): void {
		if (this.touching || !this.touches.size) return
		if (this.touchTimer) {
			clearTimeout(this.touchTimer)
			this.touchTimer = undefined
		}
		const rows = [...this.touches.values()]
		this.touches.clear()
		this.touchCount = 0
		const db = rows[0].waiters[0].job.db
		let active: { db: IDBDatabase; tx: IDBTransaction } | undefined
		try {
			const tx = db.transaction('metadata', 'readwrite'),
				store = tx.objectStore('metadata')
			active = { db, tx }
			this.touching = active
			const complete = () => {
				if (this.touching === active) {
					this.touching = undefined
					this.flushTouches()
					this.pumpReads()
				}
			}
			tx.oncomplete = complete
			tx.onabort = complete
			for (const touch of rows) {
				const request = store.get(touch.key)
				request.onsuccess = () => {
					const row = request.result
					// Never recreate metadata after deletion/clear, or copy an old read's
					// size over a concurrent replacement. Quota belongs to payload writers.
					if (row && touch.generation === this.generation) {
						try {
							store.put({
								...row,
								accessed: Math.max(
									row.accessed ?? 0,
									touch.accessed
								),
							})
						} catch {
							try {
								tx.abort()
							} catch {}
						}
					}
				}
			}
			// Resolve only once the RW fence exists. A later writer from any worker
			// overlaps metadata and must observe this touch before it can trim LRU.
			for (const touch of rows) {
				for (const { job, buffer } of touch.waiters)
					this.settle(job, buffer)
				touch.waiters = []
			}
		} catch {
			if (active) {
				try {
					active.tx.abort()
				} catch {
					if (this.touching === active) this.touching = undefined
				}
			}
			for (const touch of rows) {
				for (const { job, buffer } of touch.waiters)
					this.settle(job, buffer)
				touch.waiters = []
			}
		}
		this.pumpReads()
	}
	private async beforeWrite(): Promise<void> {
		const pending = [...this.touches.values()].flatMap((touch) =>
			touch.waiters.map((waiter) => waiter.job.registered)
		)
		this.flushTouches()
		await Promise.all(pending)
	}
	private cancelReads(keys?: ReadonlySet<string>): void {
		for (const [key, touch] of this.touches)
			if (!keys || keys.has(key)) {
				this.touches.delete(key)
				this.touchCount -= touch.waiters.length
				for (const { job } of touch.waiters) this.settle(job, null)
			}
		if (!this.touches.size && this.touchTimer) {
			clearTimeout(this.touchTimer)
			this.touchTimer = undefined
		}
		for (const job of [...this.jobs])
			if (!keys || keys.has(job.key)) {
				this.settle(job, null)
				if (job.reading)
					try {
						job.tx?.abort()
					} catch {}
			}
		this.reads = this.reads.filter((job) => !job.settled)
	}
	private cancelTouchTransaction(): void {
		const active = this.touching
		this.touching = undefined
		if (active)
			try {
				active.tx.abort()
			} catch {}
	}
	async put(key: string, buffer: ArrayBuffer): Promise<void> {
		const generation = this.generation,
			db = await this.open()
		if (
			!db ||
			generation !== this.generation ||
			buffer.byteLength > Math.min(this.maxBytes, 32 * 1024 * 1024)
		)
			return
		await this.beforeWrite()
		if (generation !== this.generation) return
		const written = await new Promise<boolean>((resolve) => {
			const tx = db.transaction(
					['packets', 'metadata', 'bootstrap'],
					'readwrite'
				),
				metadata = tx.objectStore('metadata'),
				bootstrap = tx.objectStore('bootstrap')
			const old = metadata.get(key),
				current = bootstrap.get('__quota__')
			let oldDone = false,
				quotaDone = false
			const commit = () => {
				if (!oldDone || !quotaDone) return
				const previous = old.result?.bytes ?? 0,
					quota: Quota = current.result?.value ?? {
						bytes: 0,
						entries: 0,
					}
				this.maxBytes = quota.limit ?? this.maxBytes
				this.bytes = quota.bytes + buffer.byteLength - previous
				this.entries = quota.entries + (old.result ? 0 : 1)
				tx.objectStore('packets').put({ key, buffer })
				metadata.put({
					key,
					bytes: buffer.byteLength,
					accessed: Date.now(),
				})
				bootstrap.put({
					key: '__quota__',
					value: {
						bytes: this.bytes,
						entries: this.entries,
						limit: this.maxBytes,
					},
				})
			}
			old.onsuccess = () => {
				oldDone = true
				commit()
			}
			current.onsuccess = () => {
				quotaDone = true
				commit()
			}
			tx.oncomplete = () => resolve(true)
			tx.onerror = () => resolve(false)
			tx.onabort = () => resolve(false)
		})
		if (written && (this.bytes > this.maxBytes || ++this.writes % 64 === 0))
			await this.trim(db)
	}
	async getBootstrap<T>(key: string): Promise<T | null> {
		const db = await this.open()
		if (!db) return null
		return new Promise((resolve) => {
			const request = db
				.transaction('bootstrap')
				.objectStore('bootstrap')
				.get(key)
			request.onsuccess = () => resolve(request.result?.value ?? null)
			request.onerror = () => resolve(null)
		})
	}
	async putBootstrap(key: string, value: unknown): Promise<void> {
		if (key === '__quota__') throw Error('Reserved cache key')
		const generation = this.generation,
			db = await this.open()
		if (!db || generation !== this.generation) return
		await new Promise<void>((resolve) => {
			const tx = db.transaction('bootstrap', 'readwrite')
			tx.objectStore('bootstrap').put({ key, value })
			tx.oncomplete = () => resolve()
			tx.onerror = () => resolve()
			tx.onabort = () => resolve()
		})
	}
	async listAssetKeys(): Promise<string[]> {
		const db = await this.open()
		if (!db) return []
		return new Promise((resolve) => {
			const request = db
				.transaction('metadata')
				.objectStore('metadata')
				.getAllKeys()
			request.onsuccess = () =>
				resolve(
					request.result.filter(
						(key): key is string =>
							typeof key === 'string' && key.startsWith('asset:')
					)
				)
			request.onerror = () => resolve([])
		})
	}
	async deleteMany(keys: readonly string[]): Promise<void> {
		const db = await this.open()
		if (!db || !keys.length) return
		const unique = [...new Set(keys)]
		this.cancelReads(new Set(unique))
		await this.beforeWrite()
		await new Promise<void>((resolve) => {
			const tx = db.transaction(
					['packets', 'metadata', 'bootstrap'],
					'readwrite'
				),
				store = tx.objectStore('packets'),
				metadata = tx.objectStore('metadata'),
				bootstrap = tx.objectStore('bootstrap')
			const quota = bootstrap.get('__quota__')
			quota.onsuccess = () => {
				const state: Quota = quota.result?.value ?? {
					bytes: 0,
					entries: 0,
				}
				let pending = unique.length
				for (const key of unique) {
					const previous = metadata.get(key)
					previous.onsuccess = () => {
						if (previous.result) {
							state.bytes -= previous.result.bytes
							state.entries--
						}
						store.delete(key)
						metadata.delete(key)
						if (--pending === 0) {
							this.bytes = state.bytes
							this.entries = state.entries
							bootstrap.put({ key: '__quota__', value: state })
						}
					}
				}
			}
			tx.oncomplete = () => resolve()
			tx.onerror = () => resolve()
			tx.onabort = () => resolve()
		})
	}
	async clear(): Promise<void> {
		this.generation++
		this.cancelReads()
		this.cancelTouchTransaction()
		const db = await this.open()
		if (!db) return
		await new Promise<void>((resolve) => {
			const tx = db.transaction(
				['packets', 'metadata', 'bootstrap'],
				'readwrite'
			)
			for (const name of ['packets', 'metadata', 'bootstrap'])
				tx.objectStore(name).clear()
			tx.objectStore('bootstrap').put({
				key: '__quota__',
				value: { bytes: 0, entries: 0, limit: this.maxBytes },
			})
			tx.oncomplete = () => {
				this.bytes = this.entries = this.hits = this.misses = 0
				resolve()
			}
			tx.onerror = () => resolve()
			tx.onabort = () => resolve()
		})
	}
	private trim(db: IDBDatabase): Promise<void> {
		// One eviction transaction per owner. The persisted quota is maintained
		// atomically by every writer, including other workers. Walking and sorting
		// the whole store here used to block all asset reads at a full disk cache.
		if (this.trimming) return this.trimming
		const task = this.beforeWrite().then(
			() =>
				new Promise<void>((resolve) => {
					const tx = db.transaction(
							['packets', 'metadata', 'bootstrap'],
							'readwrite'
						),
						store = tx.objectStore('packets'),
						metadata = tx.objectStore('metadata'),
						bootstrap = tx.objectStore('bootstrap')
					const request = bootstrap.get('__quota__')
					let state: Quota | undefined
					request.onsuccess = () => {
						state = request.result?.value ?? {
							bytes: 0,
							entries: 0,
							limit: this.maxBytes,
						}
						const limit = state!.limit ?? this.maxBytes
						if (state!.bytes <= limit) return
						// Reserve room for subsequent progressive mips so each small write
						// does not launch another eviction. Tiny quotas retain exact LRU tests.
						const target =
							limit >= 1024 ** 2
								? Math.floor(limit * 0.95)
								: limit
						const oldest = metadata.index('accessed').openCursor()
						oldest.onsuccess = () => {
							const cursor = oldest.result
							if (!cursor || state!.bytes <= target) {
								bootstrap.put({
									key: '__quota__',
									value: state,
								})
								return
							}
							const row = cursor.value
							store.delete(row.key)
							cursor.delete()
							state!.bytes -= row.bytes
							state!.entries--
							if (state!.bytes > target) cursor.continue()
							else
								bootstrap.put({
									key: '__quota__',
									value: state,
								})
						}
					}
					tx.oncomplete = () => {
						if (state) {
							this.bytes = state.bytes
							this.entries = state.entries
							this.maxBytes = state.limit ?? this.maxBytes
						}
						resolve()
					}
					tx.onerror = () => resolve()
					tx.onabort = () => resolve()
				})
		)
		this.trimming = task
		void task.finally(() => {
			if (this.trimming === task) this.trimming = undefined
		})
		return task
	}
	async setLimit(bytes: number): Promise<void> {
		if (!Number.isSafeInteger(bytes) || bytes < 1 || bytes > 8 * 1024 ** 3)
			throw Error('Invalid disk cache quota')
		const db = await this.open()
		this.maxBytes = bytes
		if (!db) return
		await this.beforeWrite()
		await new Promise<void>((resolve) => {
			const tx = db.transaction('bootstrap', 'readwrite'),
				store = tx.objectStore('bootstrap'),
				q = store.get('__quota__')
			q.onsuccess = () =>
				store.put({
					key: '__quota__',
					value: {
						...(q.result?.value ?? { bytes: 0, entries: 0 }),
						limit: bytes,
					},
				})
			tx.oncomplete = () => resolve()
			tx.onerror = () => resolve()
		})
		await this.trim(db)
	}
}

export const browserCache = new PacketCache()
