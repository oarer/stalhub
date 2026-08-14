import Image from 'next/image'
import Link from 'next/link'
import { Divider } from '@/components/ui/Divider'
import type { BarterItemResult } from '@/types/barter.type'
import { InfoColor, infoColorMap, type Locale } from '@/types/item.type'
import { formatBarterAmount } from '@/utils/barterUtils'
import { messageToString } from '@/utils/itemUtils'

type Props = {
	item: BarterItemResult
	amount: number
	locale: Locale
}

export function BarterItem({ item, amount, locale }: Props) {
	const color =
		infoColorMap[item?.color as InfoColor] || InfoColor.DEFAULT

	return (
		<Link
			className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border-secondary p-2"
			href={`/items${item.category}`}
		>
			<Image
				alt={messageToString(item.lines, locale)}
				className="transition-transform group-hover:-rotate-5 group-hover:scale-110"
				height={52}
				src={`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons${item.category}.png`}
				width={52}
			/>
			<Divider />
			{item.amount > 1 || amount !== item.amount ? (
				<p className="font-mono text-xs" style={{ color }}>
					{formatBarterAmount(amount)}x
				</p>
			) : (
				<p
					className="truncate font-mono text-xs"
					style={{ color }}
				>
					{messageToString(item.lines, locale)}
				</p>
			)}
		</Link>
	)
}
