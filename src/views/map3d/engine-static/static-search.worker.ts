import { staticResourcePath } from './static-path.ts'

type Row = [number, number, number, string, number, unknown?]
const scope = self as unknown as {
	onmessage: (e: MessageEvent) => void
	postMessage: (v: unknown) => void
}
const jobs = new Map<number, AbortController>()
// Search data lives off the render thread. Keep only a bounded set of shards;
// the HTTP cache serves repeat searches without requiring all objects in RAM.
const cache = new Map<string, unknown>()
async function load<T>(
	root: string,
	key: string,
	signal: AbortSignal
): Promise<T> {
	const url = root + staticResourcePath(key)
	if (cache.has(url)) return cache.get(url) as T
	const r = await fetch(url, { signal })
	if (!r.ok) throw Error(`Search index HTTP ${r.status}`)
	const value = await r.json()
	cache.set(url, value)
	if (cache.size > 18) cache.delete(cache.keys().next().value!)
	return value
}
scope.onmessage = async (e) => {
	if (e.data.cancel) {
		jobs.get(e.data.cancel)?.abort()
		return
	}
	const { id, root, slug } = e.data,
		controller = new AbortController()
	jobs.set(id, controller)
	try {
		const q = String(e.data.q).trim().toLowerCase(),
			limit = Math.max(1, Math.min(100, Number(e.data.limit ?? 50))),
			cursor = Number(e.data.cursor ?? 0)
		if (
			!q ||
			[...q].length > 200 ||
			!Number.isSafeInteger(cursor) ||
			cursor < 0 ||
			!Number.isFinite(limit)
		)
			throw Error('Invalid search query')
		const signal = controller.signal,
			base = `instances/${slug}`
		const [docs, manifest] = await Promise.all([
			load<[number, string][]>(root, 'search-documents', signal),
			load<{ shards: string[]; count: number }>(
				root,
				base + '/search-index/manifest',
				signal
			),
		])
		if (cursor > manifest.count) throw Error('Invalid search cursor')
		const matched = new Set(
				docs.filter(([, text]) => text.includes(q)).map(([doc]) => doc)
			),
			uuid = q.replaceAll('-', ''),
			needle = /^[a-f\d]{4,32}$/.test(uuid) ? uuid : ''
		let total = 0
		const rows: Row[] = []
		// Sequential shards keep memory/network pressure bounded while rendering.
		for (const key of manifest.shards) {
			if (signal.aborted)
				throw new DOMException('Cancelled', 'AbortError')
			for (const row of await load<Row[]>(root, key, signal))
				if (
					matched.has(row[4]) ||
					(needle && row[3].includes(needle))
				) {
					total++
					if (row[0] >= cursor && rows.length <= limit) rows.push(row)
				}
		}
		const next = rows.length > limit ? rows.pop()![0] : null,
			items = []
		for (const [, cx, cz, uuid, , fallback] of rows) {
			if (fallback) {
				items.push({ cx, cz, metadata: fallback })
				continue
			}
			const bucket = await load<Record<string, unknown>>(
				root,
				`${base}/definitions/uuid/${uuid.slice(0, 4)}`,
				signal
			)
			items.push({ cx, cz, metadata: bucket[uuid] })
		}
		scope.postMessage({
			id,
			result: {
				items,
				total,
				cursor: next,
				coverage:
					'prepared captured object metadata; XYZ may be absent',
				indexed_objects: manifest.count,
			},
		})
	} catch (error) {
		scope.postMessage({ id, error: String(error) })
	} finally {
		jobs.delete(id)
	}
}
