'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import DropdownMenu from '@/components/ui/DropDown'
import type { DropdownItem } from '@/types/ui/dropdown.type'

export function OptionDropdown<T extends string>({
	options,
	value,
	title,
	onSelect,
}: {
	options: { value: T; label: string }[]
	value: T
	title: string
	onSelect: (value: T) => void
}) {
	const t = useTranslations()

	const items: DropdownItem[] = options.map((option) => ({
		key: option.value,
		content: (
			<div
				className="flex w-full cursor-pointer items-center justify-between gap-2 px-2 py-1"
				onClick={() => onSelect(option.value)}
			>
				<span className="font-semibold">{t(option.label)}</span>
				{value === option.value && (
					<Icon className="text-lg" icon="lucide:check" />
				)}
			</div>
		),
	}))

	return (
		<DropdownMenu
			className="px-4 py-1 text-sm"
			items={items}
			placement="bottom-end"
			title={title}
		/>
	)
}
