'use client'

export const LOCAL_DATA_CACHE_KEYS = new Set([
	'items_cache',
	'items_commit',
	'items_time',
	'stalhub:items',
])

export const IMPORT_HOST = 'import'
export const IMPORT_MAX_TOKEN_LENGTH = 250_000

export const IMPORT_URL_WARN_LENGTH = 130_000

const FORMAT_DEFLATE = 'd1'
const FORMAT_JSON = 'j1'

export function isLocalDataCacheKey(key: string): boolean {
	return LOCAL_DATA_CACHE_KEYS.has(key)
}

function encodeBase64Url(bytes: Uint8Array): string {
	let binary = ''
	for (const byte of bytes) binary += String.fromCharCode(byte)
	return btoa(binary)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/g, '')
}

function decodeBase64Url(value: string): Uint8Array {
	const b64 = value.replace(/-/g, '+').replace(/_/g, '/')
	const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
	const binary = atob(padded)
	const bytes = new Uint8Array(binary.length)
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
	return bytes
}

async function deflate(bytes: Uint8Array): Promise<Uint8Array | null> {
	if (typeof CompressionStream === 'undefined') return null
	const stream = new Blob([bytes as Uint8Array<ArrayBuffer>])
		.stream()
		.pipeThrough(new CompressionStream('deflate'))
	return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array | null> {
	if (typeof DecompressionStream === 'undefined') return null
	try {
		const stream = new Blob([bytes as Uint8Array<ArrayBuffer>])
			.stream()
			.pipeThrough(new DecompressionStream('deflate'))
		return new Uint8Array(await new Response(stream).arrayBuffer())
	} catch {
		return null
	}
}

export function collectLocalDataEntries(): Record<string, string> {
	if (typeof window === 'undefined') return {}
	const entries: Record<string, string> = {}
	for (let index = 0; index < localStorage.length; index++) {
		const key = localStorage.key(index)
		if (key == null || isLocalDataCacheKey(key)) continue
		const value = localStorage.getItem(key)
		if (value != null) entries[key] = value
	}
	return entries
}

type LocalDataPayload = {
	v: number
	exportedAt: number
	data: Record<string, string>
}

export async function encodeLocalData(
	data: Record<string, string>
): Promise<string> {
	const payload: LocalDataPayload = {
		v: 1,
		exportedAt: Date.now(),
		data,
	}
	const bytes = new TextEncoder().encode(JSON.stringify(payload))
	const compressed = await deflate(bytes)
	const body = compressed ?? bytes
	return `${compressed ? FORMAT_DEFLATE : FORMAT_JSON}.${encodeBase64Url(body)}`
}

export function buildImportUrl(token: string): string {
	return `stalhub://${IMPORT_HOST}/${token}`
}

export function parseImportUrl(value: unknown): string | null {
	if (typeof value !== 'string' || value.length <= 0) return null
	let url: URL
	try {
		url = new URL(value)
	} catch {
		return null
	}
	if (
		url.protocol !== 'stalhub:' ||
		url.hostname !== IMPORT_HOST ||
		url.username ||
		url.password ||
		url.port ||
		url.hash ||
		!url.pathname.startsWith('/')
	)
		return null
	const token = url.pathname.slice(1)
	if (
		!token ||
		token.length > IMPORT_MAX_TOKEN_LENGTH ||
		!/^[A-Za-z0-9_.-]+$/.test(token)
	)
		return null
	return token
}

export type DecodeResult =
	| { ok: true; data: Record<string, string> }
	| { ok: false; reason: 'invalid' | 'unsupported' | 'empty' }

export async function decodeImportToken(token: string): Promise<DecodeResult> {
	const dot = token.indexOf('.')
	if (dot <= 0) return { ok: false, reason: 'invalid' }

	const format = token.slice(0, dot)
	const body = token.slice(dot + 1)
	if (!body || !/^[A-Za-z0-9_.-]+$/.test(body))
		return { ok: false, reason: 'invalid' }

	let bytes: Uint8Array
	try {
		if (format === FORMAT_JSON) {
			bytes = decodeBase64Url(body)
		} else if (format === FORMAT_DEFLATE) {
			const inflated = await inflate(decodeBase64Url(body))
			if (!inflated) return { ok: false, reason: 'unsupported' }
			bytes = inflated
		} else {
			return { ok: false, reason: 'invalid' }
		}
	} catch {
		return { ok: false, reason: 'invalid' }
	}

	try {
		const parsed = JSON.parse(
			new TextDecoder().decode(bytes)
		) as Partial<LocalDataPayload>
		if (
			parsed &&
			typeof parsed === 'object' &&
			parsed.v === 1 &&
			parsed.data &&
			typeof parsed.data === 'object'
		) {
			const data: Record<string, string> = {}
			for (const [key, value] of Object.entries(parsed.data)) {
				if (key.length === 0 || key.length > 256) continue
				if (typeof value === 'string' && value.length <= 10_000_000)
					data[key] = value
			}
			if (Object.keys(data).length === 0)
				return { ok: false, reason: 'empty' }
			return { ok: true, data }
		}
	} catch {
		/* malformed payload */
	}
	return { ok: false, reason: 'invalid' }
}

export function applyLocalData(data: Record<string, string>): number {
	let applied = 0
	for (const [key, value] of Object.entries(data)) {
		if (key.length === 0 || key.length > 256) continue
		try {
			localStorage.setItem(key, value)
			applied++
		} catch {
			/* storage denied or full — пропускаем ключ */
		}
	}
	return applied
}

export function onLocalDataImport(callback: (url: string) => void): () => void {
	const desktop = (
		window as Window & {
			stalhubDesktop?: {
				onImport: (cb: (url: string) => void) => (() => void) | void
			}
		}
	).stalhubDesktop

	const handleEvent = (event: Event) => {
		const detail = (event as CustomEvent<string>).detail
		if (detail) callback(detail)
	}
	window.addEventListener('stalhub:import', handleEvent)
	const unsubscribe = desktop?.onImport?.(callback) ?? undefined

	return () => {
		window.removeEventListener('stalhub:import', handleEvent)
		unsubscribe?.()
	}
}
