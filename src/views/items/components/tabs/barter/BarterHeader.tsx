import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import type { Locale, Message } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

type Props = {
	level: string
	titles: Message[]
	locale: Locale
}

export function BarterHeader({ level, titles, locale }: Props) {
	const t = useTranslations()

	return (
		<Card.Header className="flex gap-2">
			<Card.Title>
				{t('barter.lvl_req')}: {level}
			</Card.Title>
			<Divider className="my-2" />
			<Card.Description className="flex flex-col justify-start gap-2">
				<h1 className={`font-semibold text-md`}>
					{t('barter.base')}:
				</h1>
				<div className="flex flex-wrap">
					{titles.map((title, index) => (
						<span
							className="flex items-center"
							key={`${title}-${index}`}
						>
							<p className="font-semibold text-text-accent/90">
								{messageToString(title, locale)}
							</p>
							{index !== titles.length - 1 && (
								<span className="mx-1">,</span>
							)}
						</span>
					))}
				</div>
			</Card.Description>
		</Card.Header>
	)
}
