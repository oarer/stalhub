import Link from 'next/link'
import { montserrat } from '@/app/fonts'
import { getLocale } from '@/lib/getLocale'
import { type InfoColor, type Item, infoColorMap } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

export const SLEDGEHAMMER_ID = 'y3jp0'

export function ItemCell({ item }: { item: Item | undefined }) {
	if (!item) {
		return <span className="text-muted-foreground">—</span>
	}
	return (
		<span
			className={`${montserrat.className} flex min-w-0 items-center gap-1 truncate font-semibold text-sm`}
		>
			<span
				className="truncate"
				style={{ color: infoColorMap[item.color as InfoColor] }}
			>
				{messageToString(item.name, getLocale())}
			</span>
		</span>
	)
}

export function BuildCell({
	title,
	id,
}: {
	title: string | undefined
	id?: string | number
}) {
	if (!title) {
		return <span className="text-muted-foreground">—</span>
	}
	return (
		<Link
			className="truncate font-semibold text-primary"
			href={`/calcs/builds/lite?build=${id}`}
		>
			{title}
		</Link>
	)
}
