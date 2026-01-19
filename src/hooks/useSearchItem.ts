import { useEffect } from 'react'

import { useItemStore } from '@/stores/items.store'
import type { ItemListing } from '@/types/api.type'

const RAW_URL =
	'https://raw.githubusercontent.com/oarer/sc-db/main/merged/listing.json'
const COMMITS_API =
	'https://api.github.com/repos/oarer/sc-db/commits?path=merged/listing.json&page=1&per_page=1'

const LS_DATA = 'items_cache'
const LS_COMMIT = 'items_commit'
const LS_TIME = 'items_time'
const TTL = 1000 * 60 * 10

export function useSearchItem() {
	const { items, commit, setItems, setCommit, setError, setLoading } =
		useItemStore()

	useEffect(() => {
		async function load() {
			if (items && commit) return

			setLoading(true)

			const cached = localStorage.getItem(LS_DATA)
			const cachedCommit = localStorage.getItem(LS_COMMIT)

			if (cached) {
				try {
					setItems(JSON.parse(cached))
				} catch {
					null
				}
			}
			if (cachedCommit) setCommit(cachedCommit)

			try {
				const res = await fetch(COMMITS_API)
				const data = await res.json()

				const latestSHA = data?.[0]?.sha
				const currentSHA = cachedCommit || commit

				if (latestSHA && latestSHA === currentSHA) {
					setLoading(false)
					return
				}

				const freshRaw = await fetch(RAW_URL)
				const freshItems = (await freshRaw.json()) as ItemListing[]

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
				const time = Number(localStorage.getItem(LS_TIME))
				if (!time || Date.now() - time > TTL)
					setError('Не удалось получить актуальные данные')
			} finally {
				setLoading(false)
			}
		}

		load()
	}, [setItems, setCommit, setError, setLoading, items, commit])

	return useItemStore()
}
