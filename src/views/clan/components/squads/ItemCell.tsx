import { montserrat } from '@/app/fonts'
import { getLocale } from '@/lib/getLocale'
import { type InfoColor, type Item, infoColorMap } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

export function ItemCell({ item }: { item: Item | undefined }) {
	if (!item) {
		return <span className="text-neutral-500">—</span>
	}
	return (
		<span
			className={`${montserrat.className} truncate font-semibold text-sm`}
			style={{ color: infoColorMap[item.color as InfoColor] }}
		>
			{messageToString(item.name, getLocale())}
		</span>
	)
}

export function BuildCell({ title }: { title: string | undefined }) {
	if (!title) {
		return <span className="text-neutral-500">—</span>
	}
	return (
		<span className="truncate font-semibold text-sky-600 dark:text-sky-400">
			{title}
		</span>
	)
}
