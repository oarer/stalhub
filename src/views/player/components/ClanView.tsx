import { useTranslation } from 'react-i18next'

import { Icon } from '@iconify/react'

import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/date'
import type { Clan } from '@/types/player.type'
import { rankColors } from '@/types/player.type'

export default function ClanView({ data }: { data: Clan }) {
	const { t } = useTranslation()
	return (
		<Card.Root>
			<Card.Header>
				<div className="flex items-center gap-2">
					<Icon className="text-xl" icon="lucide:shield-half" />
					<h1 className="text-xl font-semibold">Клан</h1>
				</div>
			</Card.Header>
			<Card.Content className="space-y-3">
				<div className="grid grid-cols-1 gap-4 pl-7 md:grid-cols-2">
					<div>
						<p className="text-sm">Название</p>
						<p className="font-semibold">
							[{data.info.tag}] {data.info.name}
						</p>
					</div>
					<div>
						<p className="text-sm">Ранг</p>
						<p className={`text-${rankColors[data.member.rank]}`}>
							{t(`player.rank.${data.member.rank}`)}
						</p>
					</div>
					<div>
						<p className="text-sm">Уровень клана</p>
						<p className="font-semibold">{data.info.level + 1}</p>
					</div>
					<div>
						<p className="text-sm">Участников</p>
						<p className="font-semibold">{data.info.memberCount}</p>
					</div>
					<div>
						<p className="text-sm">Лидер</p>
						<p className="font-bold text-yellow-500">
							{data.info.leader}
						</p>
					</div>
					<div>
						<p className="text-sm">Вступил в клан</p>
						<p className="font-semibold">
							{formatDate(data.member.joinTime)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	)
}
