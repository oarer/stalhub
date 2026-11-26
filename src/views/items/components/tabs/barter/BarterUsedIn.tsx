import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Divider } from '@/components/ui/Divider'
import type { UsedInItem } from '@/types/barter.type'
import { InfoColor, infoColorMap, type Locale } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

type Props = {
	items: UsedInItem[]
	locale: Locale
}

export function BarterUsedIn({ items, locale }: Props) {
	const t = useTranslations()

	return (
		<>
			<Divider />
			<section className="flex flex-col gap-3">
				<h2 className="text-sm font-semibold">
					{t('barter.used_in')}:
				</h2>

				<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
					{items.map((item) => (
						<Link
							className="group border-primary flex flex-col items-center gap-3 rounded-xl border-2 p-2"
							href={`/items${item.category}`}
							key={item.item_id}
						>
							<Image
								alt={messageToString(item.lines, locale)}
								className="transition-transform group-hover:scale-110 group-hover:-rotate-5"
								height={52}
								src={`https://cdn.stalhub.dev/db/icons${item.category}.png`}
								width={52}
							/>

							<p
								className="max-w-24 truncate text-sm font-semibold"
								style={{
									color:
										infoColorMap[
											item?.color as InfoColor
										] || InfoColor.DEFAULT,
								}}
							>
								{messageToString(item.lines, locale)}
							</p>
						</Link>
					))}
				</div>
			</section>
		</>
	)
}
