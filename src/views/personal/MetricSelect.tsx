'use client'

import { useMemo } from 'react'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { usePersonalLabels } from './hooks/usePersonalLabels'
import { CATEGORY_ORDER, getStatMeta } from './statMeta'

export function MetricSelect({
	value,
	onChange,
	ids,
	derivedIds,
}: {
	value: string
	onChange: (id: string) => void
	ids: string[]
	derivedIds: Set<string>
}) {
	const { statLabel, categoryLabel, compareLabels, locale } =
		usePersonalLabels()
	const options = useMemo<ComboboxOption[]>(() => {
		const byCat = new Map<string, string[]>()
		for (const id of ids) {
			const cat = derivedIds.has(id)
				? 'DERIVED'
				: getStatMeta(id, locale).category
			if (!byCat.has(cat)) byCat.set(cat, [])
			byCat.get(cat)!.push(id)
		}
		const out: ComboboxOption[] = []
		for (const cat of CATEGORY_ORDER) {
			const list = byCat.get(cat)
			if (!list || list.length === 0) continue
			list.sort(compareLabels)
			out.push({
				value: `__cat_${cat}`,
				label: categoryLabel(cat),
				type: 'header',
			})
			for (const id of list) {
				out.push({ value: id, label: statLabel(id) })
			}
		}
		return out
	}, [ids, derivedIds, locale, statLabel, categoryLabel, compareLabels])

	return (
		<Combobox
			onValueChange={(v) => {
				if (v && !v.startsWith('__cat_')) onChange(v)
			}}
			options={options}
			translateOptions={false}
			value={value}
		/>
	)
}
