const permitted =
	/^(instances(?:\/|$)|maps(?:\/|$)|materials$|shapes$|texture-version$|texture$|sr-texture(?:-hd)?$|model(?:-raw|-texture|-material|-metadata)?$|effect(?:s|\-resource|\-definitions|\-catalog)?(?:\/|$)|notes(?:\/|$)|search(?:\/|$)|health$)/

export function mapBackendOrigin() {
	const internal = process.env.STALHUB_BACKEND_URL?.replace(/\/$/, '')
	if (internal) return internal + '/map3d'
	const existing = (
		process.env.NEXT_PUBLIC_API ?? 'http://127.0.0.1:3001'
	).replace(/\/$/, '')
	return existing + (existing.endsWith('/api/v1') ? '' : '/api/v1') + '/map3d'
}

export async function forwardMapAsset(
	request: Request,
	resource: string,
	origin: string,
	timeoutMs = 120000
): Promise<Response> {
	const parts = resource.split('/')
	if (
		!permitted.test(resource) ||
		parts.some((p) => !p || p === '.' || p === '..' || /[\\?#%]/.test(p))
	)
		return Response.json(
			{ error: 'Ресурс карты не найден' },
			{ status: 404 }
		)
	if (
		!['GET', 'HEAD'].includes(request.method) &&
		!(
			request.method === 'POST' &&
			/^instances\/[^/]+\/open$/.test(resource)
		) &&
		!/^notes(?:\/|$)/.test(resource)
	)
		return new Response(null, { status: 405 })
	const root = new URL(origin),
		mount = root.pathname.replace(/\/$/, '') || '/api'
	const target = new URL(
			`${mount}/${resource}${new URL(request.url).search}`,
			root
		),
		controller = new AbortController()
	const abort = () => controller.abort()
	request.signal.addEventListener('abort', abort, { once: true })
	if (request.signal.aborted) abort()
	const timeout = setTimeout(abort, timeoutMs),
		cleanup = () => {
			clearTimeout(timeout)
			request.signal.removeEventListener('abort', abort)
		}
	try {
		const headers = new Headers()
		for (const name of [
			'content-type',
			'range',
			'if-range',
			'if-none-match',
			'if-modified-since',
		]) {
			const value = request.headers.get(name)
			if (value) headers.set(name, value)
		}
		let body: ArrayBuffer | undefined
		if (!['GET', 'HEAD'].includes(request.method)) {
			const reader = request.body?.getReader(),
				parts: Uint8Array[] = []
			let size = 0
			if (reader)
				try {
					for (;;) {
						const { done, value } = await reader.read()
						if (done) break
						size += value.length
						if (size > 65536) {
							await reader.cancel()
							cleanup()
							return Response.json(
								{ error: 'Слишком большой запрос' },
								{ status: 413 }
							)
						}
						parts.push(value)
					}
				} finally {
					reader.releaseLock()
				}
			const bytes = new Uint8Array(size)
			let offset = 0
			for (const part of parts) {
				bytes.set(part, offset)
				offset += part.length
			}
			body = bytes.buffer
		}
		const upstream = await fetch(target, {
			method: request.method,
			headers,
			signal: controller.signal,
			cache: 'no-store',
			body,
		})
		const responseHeaders = new Headers({
			'Cross-Origin-Resource-Policy': 'same-origin',
		})

		for (const name of [
			'content-type',
			'content-range',
			'cache-control',
			'etag',
			'last-modified',
			'accept-ranges',
		]) {
			const value = upstream.headers.get(name)
			if (value) responseHeaders.set(name, value)
		}
		if (!upstream.headers.get('content-encoding')) {
			const length = upstream.headers.get('content-length')
			if (length) responseHeaders.set('content-length', length)
		}
		if (!upstream.body) {
			cleanup()
			return new Response(null, {
				status: upstream.status,
				headers: responseHeaders,
			})
		}
		const reader = upstream.body.getReader()
		const stream = new ReadableStream<Uint8Array>({
			async pull(out) {
				try {
					const next = await reader.read()
					if (next.done) {
						cleanup()
						reader.releaseLock()
						out.close()
					} else out.enqueue(next.value)
				} catch (e) {
					cleanup()
					out.error(e)
				}
			},
			async cancel(reason) {
				abort()
				cleanup()
				await reader.cancel(reason)
			},
		})
		return new Response(stream, {
			status: upstream.status,
			headers: responseHeaders,
		})
	} catch {
		cleanup()
		return Response.json(
			{
				error: 'Сервис карты временно недоступен. Повторите подключение.',
			},
			{ status: 503 }
		)
	}
}
