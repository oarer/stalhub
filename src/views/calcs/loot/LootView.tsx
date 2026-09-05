'use client'

import { useRef, useState } from 'react'
import Input from '@/components/ui/Input'
import type { CatalogResponse } from '@/types/loot.type'
import { LootCardModal } from './components/LootCardModal'
import { pickName } from './components/utils'

interface LootViewProps {
	catalog: CatalogResponse
	name?: string
}

interface TableEntry {
	key: string
	title: string
	search: string
	payload: CatalogResponse[string]
}

const lift = (data: CatalogResponse): TableEntry[] => {
	const entries: TableEntry[] = []
	for (const [key, payload] of Object.entries(data)) {
		const parts = [key, pickName(payload.title)]
		for (const slot of payload.slots) {
			for (const item of slot) {
				parts.push(
					String(item.stack?.id ?? 'miss'),
					pickName(item.names)
				)
			}
		}
		entries.push({
			key,
			title: pickName(payload.title) || key,
			search: parts.join(' ').toLowerCase(),
			payload,
		})
	}
	return entries
}

export function LootView({ catalog, name }: LootViewProps) {
	const [query, setQuery] = useState('')
	const entriesRef = useRef<TableEntry[] | null>(null)
	if (entriesRef.current === null) {
		entriesRef.current = lift(catalog)
	}

	const entries = entriesRef.current
	let visible = entries
	if (name) {
		visible = entries.filter((e) => e.key === name)
	}

	const q = query.trim().toLowerCase()
	if (q) {
		visible = visible.filter((e) => e.search.includes(q))
	}

	return (
		<section className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-32 pb-12 lg:pt-36">
			<Input
				className="w-full sm:max-w-80"
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Поиск"
				value={query}
			/>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{visible.map((e) => (
					<LootCardModal
						key={e.key}
						name={e.key}
						payload={e.payload}
					/>
				))}
			</div>
		</section>
	)
}
