import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/date'
import type { Clan } from '@/types/player.type'
import { rankColors } from '@/types/player.type'

export default function ClanView({ data }: { data: Clan }) {
	const t = useTranslations()
	return (
		<Card.Root>
			<Card.Header>
				<div className="flex items-center gap-2">
					<Icon className="text-xl" icon="lucide:shield-half" />
					<h1 className="font-semibold text-xl">
						{t('player.clan.title')}
					</h1>
				</div>
			</Card.Header>
			<Card.Content className="space-y-3">
				<div className="grid grid-cols-1 gap-4 pl-7 md:grid-cols-2">
					<div>
						<p className="text-sm">{t('player.clan.name')}</p>
						<p className="font-semibold">
							[{data.info.tag}] {data.info.name}
						</p>
					</div>
					<div>
						<p className="text-sm">{t('player.clan.rank')}</p>
						<p className={`text-${rankColors[data.member.rank]}`}>
							{t(`player.rank.${data.member.rank}`)}
						</p>
					</div>
					<div>
						<p className="text-sm">{t('player.clan.level')}</p>
						<p className="font-semibold">{data.info.level + 1}</p>
					</div>
					<div>
						<p className="text-sm">{t('player.clan.members')}</p>
						<p className="font-semibold">{data.info.member_count}</p>
					</div>
					<div>
						<p className="text-sm">{t('player.clan.leader')}</p>
						<p className="font-bold text-yellow-500">
							{data.info.leader}
						</p>
					</div>
					<div>
						<p className="text-sm">{t('player.clan.join_at')}</p>
						<p className="font-semibold">
							{formatDate(data.member.join_time)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	)
}
