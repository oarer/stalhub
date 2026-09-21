'use client'

import { useEffect, useRef } from 'react'

import { GITHUB_RAW_BASE } from '@/constants/github.const'
import { useItemStore } from '@/stores/items.store'
import type { ItemListing } from '@/types/api.type'

const LISTING_URL = `${GITHUB_RAW_BASE}listing.json`
const COMMITS_API =
	'https://api.github.com/repos/oarer/sc-db/commits?path=merged/listing.json&page=1&per_page=1'

const LS_DATA = 'items_cache'
const LS_COMMIT = 'items_commit'
const LS_TIME = 'items_time'
const TTL = 1000 * 60 * 10

let inflight: Promise<void> | null = null

function readCachedItems(): ItemListing[] | null {
	const cached = localStorage.getItem(LS_DATA)
	if (!cached) return null
	try {
		const parsed: unknown = JSON.parse(cached)
		return Array.isArray(parsed) ? (parsed as ItemListing[]) : null
	} catch {
		return null
	}
}

function refreshItems(
	storeCommit: string | null,
	hasStoreItems: boolean,
	setItems: (items: ItemListing[]) => void,
	setCommit: (commit: string) => void,
	setError: (err: string | null) => void
): Promise<void> {
	const time = Number(localStorage.getItem(LS_TIME))
	if (time && Date.now() - time < TTL) return Promise.resolve()

	if (!inflight) {
		inflight = (async () => {
			try {
				const res = await fetch(COMMITS_API)
				if (!res.ok) throw new Error('GitHub API error')
				const data = await res.json()

				const latestSHA: string | undefined = data?.[0]?.sha
				if (!latestSHA) throw new Error('No commits')

				const cachedCommit = localStorage.getItem(LS_COMMIT)
				const cachedItems = readCachedItems()
				const currentSHA = cachedCommit ?? storeCommit
				const hasData = hasStoreItems || !!cachedItems

				if (latestSHA === currentSHA && hasData) {
					localStorage.setItem(LS_TIME, Date.now().toString())
					return
				}

				// Cache-bust: CDN кэширует /db/listing.json на 24ч (immutable),
				// но кэширует ключ по полному URL — новый SHA даёт новый ключ.
				const freshRaw = await fetch(`${LISTING_URL}?v=${latestSHA}`)
				if (!freshRaw.ok) throw new Error('Listing fetch error')
				const fresh: unknown = await freshRaw.json()
				if (!Array.isArray(fresh)) throw new Error('Bad listing')
				const freshItems = fresh as ItemListing[]

				setItems(freshItems)
				setCommit(latestSHA)

				localStorage.setItem(LS_DATA, JSON.stringify(freshItems))
				localStorage.setItem(LS_COMMIT, latestSHA)
				localStorage.setItem(LS_TIME, Date.now().toString())

				console.log(
					`%cДанные были обновлены! Коммит: ${latestSHA}`,
					'color: green; font-weight: bold'
				)
			} catch (e) {
				console.log(e, 'error fetching items')
				const t = Number(localStorage.getItem(LS_TIME))
				if (!t || Date.now() - t > TTL)
					setError('Не удалось получить актуальные данные')
			} finally {
				inflight = null
			}
		})()
	}

	return inflight
}

export function useSearchItem() {
	const { items, commit, setItems, setCommit, setError, setLoading } =
		useItemStore()

	const itemsRef = useRef(items)
	const commitRef = useRef(commit)
	itemsRef.current = items
	commitRef.current = commit

	useEffect(() => {
		let cancelled = false

		async function load() {
			const cachedItems = readCachedItems()
			const cachedCommit = localStorage.getItem(LS_COMMIT)
			const hasStoreData = !!(itemsRef.current && commitRef.current)

			// Кэш отдаём сразу, сверку свежести делаем в фоне.
			if (!hasStoreData) {
				if (cachedItems && !itemsRef.current) setItems(cachedItems)
				if (cachedCommit && !commitRef.current) setCommit(cachedCommit)
			}

			const usable = hasStoreData || !!(cachedItems && cachedCommit)

			// «Загрузка» — только когда данных нет вообще (ни стора, ни кэша).
			if (!usable && !cancelled) setLoading(true)

			await refreshItems(
				commitRef.current,
				!!itemsRef.current,
				setItems,
				setCommit,
				setError
			)

			if (cancelled) return
			setLoading(false)
		}

		load()

		return () => {
			cancelled = true
		}
	}, [setItems, setCommit, setError, setLoading])

	return useItemStore()
}
