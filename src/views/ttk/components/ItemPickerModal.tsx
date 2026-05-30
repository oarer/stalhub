'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { getLocale } from '@/lib/getLocale'
import type { Item } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { ItemsList } from '@/views/builds/model/components/artifacts'

interface Props {
	items: Item[]
	selected: string
	onSelect: (id: string) => void
	title: string
	trigger: React.ReactNode
}

export function ItemPickerModal({ items, onSelect, title, trigger }: Props) {
	const [query, setQuery] = useState('')
	const [open, setOpen] = useState(false)

	const locale = getLocale()
	const t = useTranslations()

	const filtered = useMemo(() => {
		const q = query.toLowerCase()
		return q
			? items.filter((i) =>
					messageToString(i.name, locale).toLowerCase().includes(q)
				)
			: items
	}, [items, query, locale])

	const handleSelect = useCallback(
		(id: string) => {
			onSelect(id)
			setOpen(false)
			setQuery('')
		},
		[onSelect]
	)

	return (
		<Modal.Root onOpenChange={setOpen} open={open}>
			<Modal.Trigger asChild>{trigger}</Modal.Trigger>
			<Modal.Content className="max-h-[80vh]">
				<Modal.Header>
					<Modal.Title>{t(title)}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="flex flex-col gap-3">
					<Input
						className="px-2 text-[14px]"
						label="ui.input_label"
						onChange={(e) => setQuery(e.target.value)}
						value={query}
					/>
					<ItemsList
						className="max-w-full"
						favoriteType="weapon"
						items={filtered}
						locale={locale}
						onSelectItem={handleSelect}
					/>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
