import { createDecipheriv, createHash } from 'node:crypto'
import { cache as reactCache } from 'react'
import type { CatalogResponse } from '@/types/loot.type'

interface EncryptedPayload {
	alg: 'AES-256-GCM'
	iv: string
	tag: string
	data: string
}

const CACHE_TTL_MS = 1000 * 60 * 60

interface CatalogCache {
	at: number
	catalog: CatalogResponse
}

let cache: CatalogCache | null = null

function deriveKey(masterKey: string): Buffer {
	if (/^[0-9a-fA-F]{64}$/.test(masterKey)) {
		return Buffer.from(masterKey, 'hex')
	}

	if (/^[A-Za-z0-9+/]{43}=$/.test(masterKey)) {
		const decoded = Buffer.from(masterKey, 'base64')
		if (decoded.length === 32) {
			return decoded
		}
	}

	return createHash('sha256').update(masterKey, 'utf8').digest()
}

function decryptPayload(payload: EncryptedPayload, key: Buffer): Buffer {
	const decipher = createDecipheriv(
		'aes-256-gcm',
		key,
		Buffer.from(payload.iv, 'base64')
	)
	decipher.setAuthTag(Buffer.from(payload.tag, 'base64'))
	return Buffer.concat([
		decipher.update(Buffer.from(payload.data, 'base64')),
		decipher.final(),
	])
}

async function fetchDecrypted(): Promise<CatalogResponse> {
	const now = Date.now()
	if (cache && now - cache.at < CACHE_TTL_MS) {
		return cache.catalog
	}

	const backendUrl = (
		process.env.NEXT_PUBLIC_API ?? 'http://localhost:3001'
	).replace(/\/$/, '')
	const res = await fetch(`${backendUrl}/api/v1/loot`, {
		next: { revalidate: CACHE_TTL_MS / 1000 },
	})
	if (!res.ok) {
		throw new Error(`loot backend fetch failed: ${res.status}`)
	}

	const payload = (await res.json()) as EncryptedPayload
	const masterKey = process.env.LOOT_KEY ?? 'dev'
	const buffer = decryptPayload(payload, deriveKey(masterKey))
	const catalog: CatalogResponse = JSON.parse(buffer.toString('utf8'))
	cache = { at: now, catalog }
	return catalog
}

export const getLootCatalog = reactCache(fetchDecrypted)
