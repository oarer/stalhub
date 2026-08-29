import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import Input from '@/components/ui/Input'
import { GITHUB_RAW_BASE } from '@/constants/github.const'
import type { Item } from '@/types/item.type'

export function getItemName(item: Item, locale: string): string {
	const lines = (
		item.name as { type?: string; lines?: Record<string, string> }
	)?.lines
	return lines?.[locale] ?? lines?.en ?? item.id
}

export function getItemIconUrl(item: Item): string {
	return `${GITHUB_RAW_BASE}/icons/${item.category}/${item.id}.png`
}

export function ItemPicker({
	items,
	existingIds,
	onAdd,
}: {
	items: Record<string, Item>
	existingIds: Set<string>
	onAdd: (id: string) => void
}) {
	const locale = useLocale()
	const t = useTranslations()
	const [search, setSearch] = useState('')
	const filtered = useMemo(() => {
		const query = search.toLowerCase()
		return Object.values(items).filter((item) => {
			const name = getItemName(item, locale).toLowerCase()
			return name.includes(query) || item.id.toLowerCase().includes(query)
		})
	}, [items, locale, search])

	return (
		<div className="flex flex-col gap-2">
			<Input
				label="tierlists.editor.searchItems"
				onChange={(event) => setSearch(event.target.value)}
				value={search}
			/>
			<div className="grid max-h-60 grid-cols-2 gap-1 overflow-y-auto rounded-lg border border-muted p-2 md:grid-cols-3">
				{filtered.map((item) => {
					const name = getItemName(item, locale)
					const added = existingIds.has(item.id)
					return (
						<button
							className={`flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors ${added ? 'bg-primary/10 text-primary' : 'text-text hover:bg-accent/30'}`}
						disabled={added}
						key={item.id}
						onClick={() => onAdd(item.id)}
						type="button"
						>
							<Image alt={name} className="size-6 shrink-0 object-contain" height={24} src={getItemIconUrl(item)} width={24} />
							<span className="truncate">{name}</span>
						</button>
					)
				})}
				{filtered.length === 0 && <p className="col-span-full p-3 text-center text-sm text-text-accent">{t('tierlists.empty')}</p>}
			</div>
		</div>
	)
}
