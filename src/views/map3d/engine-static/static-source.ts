/** Shared by the engine, workers and site setup. Only data uses the static host;
 * notes remain in the existing application API. No global fetch monkey patch. */

import { browserCache } from './cache.ts'
import { staticResourcePath } from './static-path.ts'

export { staticResourcePath } from './static-path.ts'

type SourceConfig = { root: string }
let config: Promise<SourceConfig | null> | undefined
export async function staticSourceConfig(): Promise<SourceConfig | null> {
	// Node tests and server rendering never consult browser deployment config.
	if (typeof location === 'undefined') return null
	const key = 'static-source-config/' + location.origin
	return (config ??= fetch('/map3d-engine/static-source.json', {
		cache: 'no-cache',
	})
		.then(async (r) => {
			if (r.status === 404) {
				await browserCache.putBootstrap(key, { root: '' })
				return null
			}
			if (!r.ok)
				throw Error(`Static source configuration: HTTP ${r.status}`)
			const value = await r.json()
			if (!value.root) {
				await browserCache.putBootstrap(key, { root: '' })
				return null
			}
			const root = new URL(
				value.root.replace(/\/$/, '') + '/',
				location.href
			)
			if (
				!['http:', 'https:'].includes(root.protocol) ||
				root.search ||
				root.hash
			)
				throw Error('Invalid static source root')
			const source = { root: root.href }
			await browserCache.putBootstrap(key, source)
			return source
		})
		.catch(async (error) => {
			const saved = await browserCache.getBootstrap<SourceConfig>(key)
			if (saved) return saved.root ? saved : null
			config = undefined
			throw error
		}))
}
export async function mapAssetUrl(url: string): Promise<string> {
	const parsed = new URL(
			url,
			typeof location === 'undefined' ? 'http://localhost' : location.href
		),
		prefix = '/api/map3d/'
	if (!parsed.pathname.startsWith(prefix)) return url
	const source = await staticSourceConfig()
	if (!source) return url
	return (
		source.root +
		staticResourcePath(parsed.pathname.slice(prefix.length) + parsed.search)
	)
}
type Job = {
	resolve: (value: unknown) => void
	reject: (error: Error) => void
	cleanup: () => void
}
let worker: Worker | undefined,
	sequence = 0
const jobs = new Map<number, Job>()
function search(
	root: string,
	slug: string,
	url: URL,
	signal?: AbortSignal | null
): Promise<unknown> {
	worker ??= new Worker(
		new URL('./static-search.worker.ts', import.meta.url),
		{ type: 'module' }
	)
	worker.onmessage = (e) => {
		const job = jobs.get(e.data.id)
		if (!job) return
		jobs.delete(e.data.id)
		job.cleanup()
		e.data.error
			? job.reject(Error(e.data.error))
			: job.resolve(e.data.result)
	}
	worker.onerror = (e) => {
		for (const job of jobs.values()) {
			job.cleanup()
			job.reject(Error(e.message))
		}
		jobs.clear()
		worker?.terminate()
		worker = undefined
	}
	const id = ++sequence
	return new Promise((resolve, reject) => {
		const abort = () => {
			jobs.delete(id)
			worker?.postMessage({ cancel: id })
			signal?.removeEventListener('abort', abort)
			reject(new DOMException('Search cancelled', 'AbortError'))
		}
		if (signal?.aborted) return abort()
		signal?.addEventListener('abort', abort, { once: true })
		jobs.set(id, {
			resolve,
			reject,
			cleanup: () => signal?.removeEventListener('abort', abort),
		})
		worker!.postMessage({
			id,
			root,
			slug,
			q: url.searchParams.get('q') ?? '',
			limit: url.searchParams.get('limit'),
			cursor: url.searchParams.get('cursor'),
		})
	})
}
export async function staticMapFetch(
	root: string,
	input: string,
	options: RequestInit = {},
	fetcher: typeof fetch = fetch
): Promise<Response> {
	const url = new URL(input, 'http://localhost'),
		prefix = '/api/map3d/'
	if (
		!url.pathname.startsWith(prefix) ||
		url.pathname.startsWith(prefix + 'notes')
	)
		return fetcher(input, options)
	const resource = url.pathname.slice(prefix.length),
		parts = resource.split('/')
	if (options.signal?.aborted)
		throw new DOMException('Request cancelled', 'AbortError')
	if (resource === 'health') {
		const response = await fetcher(root + 'manifest.json', {
			...options,
			method: 'GET',
		})
		if (!response.ok) return response
		const manifest = await response.json()
		return new Response(
			options.method === 'HEAD'
				? null
				: JSON.stringify({ ok: true, runtime: 'static', ...manifest }),
			{ headers: { 'content-type': 'application/json' } }
		)
	}
	if (parts[0] === 'instances' && parts.length === 3 && parts[2] === 'search')
		return Response.json(
			await search(
				root,
				decodeURIComponent(parts[1]),
				url,
				options.signal
			)
		)
	if (
		parts[0] === 'instances' &&
		parts.length === 3 &&
		parts[2] === 'object-definition'
	) {
		const base = `instances/${parts[1]}/definitions`,
			uuid = url.searchParams.get('uuid'),
			id = url.searchParams.get('id')
		if (uuid && /^[a-f\d]{32}$/i.test(uuid)) {
			const result = await fetcher(
				root +
					staticResourcePath(
						`${base}/uuid/${uuid.slice(0, 4).toLowerCase()}`
					),
				{ ...options, method: 'GET' }
			)
			if (result.ok) {
				const found = (await result.json())[uuid.toLowerCase()]
				if (found)
					return new Response(
						options.method === 'HEAD'
							? null
							: JSON.stringify(found),
						{ headers: { 'content-type': 'application/json' } }
					)
			} else if (result.status !== 404) return result
		}
		if (!id || !/^\d+$/.test(id)) return Response.json(null)
		const result = await fetcher(
			root + staticResourcePath(`${base}/id/${id}`),
			options
		)
		return result.status === 404 ? Response.json(null) : result
	}
	if (resource === 'model') parts[0] = 'model-raw'
	// Match the integrated API's canonical query: do not create an unbounded
	// number of files for tracking parameters, changes/since or mip=0.
	const params = new URLSearchParams()
	if (
		[
			'texture',
			'sr-texture',
			'sr-texture-hd',
			'model-texture',
			'model',
			'model-raw',
			'model-material',
		].includes(resource)
	) {
		const name = url.searchParams.get('name')
		if (name) params.set('name', name)
		if (resource === 'model-material' && url.searchParams.has('slug'))
			params.set('slug', url.searchParams.get('slug')!)
		if (
			[
				'texture',
				'sr-texture',
				'sr-texture-hd',
				'model-texture',
			].includes(resource)
		) {
			if (url.searchParams.has('max_size'))
				params.set('max_size', url.searchParams.get('max_size')!)
			else if (Number(url.searchParams.get('mip')))
				params.set('mip', url.searchParams.get('mip')!)
		}
	} else if (
		resource.includes('/terrain-lod/') &&
		!resource.endsWith('/manifest')
	) {
		for (const k of url.searchParams.has('step')
			? ['step', 'revision']
			: ['colors'])
			if (url.searchParams.has(k)) params.set(k, url.searchParams.get(k)!)
	}
	const method = (options.method ?? 'GET').toUpperCase()
	if (
		!['GET', 'HEAD'].includes(method) &&
		!(method === 'POST' && resource.endsWith('/open'))
	)
		return new Response(null, { status: 405 })
	params.sort()
	const canonical = parts.join('/') + (params.size ? '?' + params : '')
	const result = await fetcher(root + staticResourcePath(canonical), {
		...options,
		method: method === 'POST' ? 'GET' : method,
		body: undefined,
	})
	if (
		result.status === 404 &&
		resource === 'model-material' &&
		params.has('slug')
	) {
		params.delete('slug')
		return fetcher(
			root + staticResourcePath(resource + '?' + params),
			options
		)
	}
	return result
}
export async function mapFetch(
	input: string,
	options: RequestInit = {}
): Promise<Response> {
	if (!new URL(input, 'http://localhost').pathname.startsWith('/api/map3d/'))
		return fetch(input, options)
	const source = await staticSourceConfig()
	return source
		? staticMapFetch(source.root, input, options)
		: fetch(input, options)
}
