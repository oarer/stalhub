'use client'

import { useTranslations } from 'next-intl'
import { Accordion } from '@/components/ui/Accordion'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import type { CommissionOrder } from '@/types/commission.type'
import { commissionMoney } from '@/types/commission.type'
import { FileLinks } from './shared'

export function OrderBriefCard({ order }: { order: CommissionOrder }) {
	const t = useTranslations('commissions')
	return (
		<Card.Root className="gap-2.5">
			<h2 className="font-semibold">{t('briefStep')}</h2>
			{order.brief && (
				<p className="wrap-break-word whitespace-pre-wrap text-sm">
					{order.brief}
				</p>
			)}
			<FileLinks files={order.files} />
			{order.items.length > 0 && (
				<ul className="flex flex-col gap-1.5 text-sm">
					{order.items.map((item, index) => (
						<li
							className="flex justify-between gap-3"
							key={item.id ?? index}
						>
							<span>
								{item.title}
								<span className="block text-muted-foreground text-xs">
									{t('days', {
										min: item.days_min,
										max: item.days_max,
									})}
								</span>
							</span>
							<span>
								{commissionMoney(item.amount, order.currency)}
							</span>
						</li>
					))}
				</ul>
			)}
			<Divider />
			<p className="flex justify-between font-semibold">
				<span>{t('total')}</span>
				<span className="text-primary">
					{commissionMoney(order.total, order.currency)}
				</span>
			</p>
			{order.terms && (
				<Accordion
					items={[
						{
							key: 'terms',
							title: t('terms'),
							content: (
								<>
									<p className="whitespace-pre-wrap text-sm">
										{order.terms}
									</p>
									<p className="text-sm">
										{t('revisions', {
											count: order.revisions,
										})}{' '}
										({order.revisions_used}/
										{order.revisions})
									</p>
								</>
							),
						},
					]}
					size={'sm'}
				/>
			)}
		</Card.Root>
	)
}
