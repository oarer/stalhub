import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import type { ClanHistoryEntry } from '@/types/clan/clan.type'
import { formatDate } from '@/lib/date'
import { montserrat } from '@/app/fonts'

export default function ClanHistoryView({
	history,
}: {
	history: ClanHistoryEntry[]
}) {
	const t = useTranslations()

	if (!history?.length) return null

	return (
		<Card.Root>
			<Card.Header>
				<div className="flex items-center gap-2">
					<Icon className="text-xl" icon="lucide:history" />
					<h1 className="font-semibold text-xl">
						{t('player.clanHistory.title')}
					</h1>
				</div>
			</Card.Header>
			<Card.Content className="space-y-2">
				{history.map((h) => (
					<div
						className="flex items-center justify-between rounded-lg bg-card px-3 py-2"
						key={h.id}
					>
						<div className="flex flex-col gap-0.5">
							<span className="font-semibold text-sm">
								{h.clan_name}
								{h.clan_tag ? ` [${h.clan_tag}]` : ''}
							</span>
							<span className="text-text-accent text-xs">
								{t(`player.rank.${h.rank}`)} · {h.region}
							</span>
						</div>
						<span className={`${montserrat.className} text-text-accent text-xs`}>
							{formatDate(h.seen_at)}
						</span>
					</div>
				))}
			</Card.Content>
		</Card.Root>
	)
}
