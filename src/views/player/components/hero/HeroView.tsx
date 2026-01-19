import { useTranslation } from 'react-i18next'

import { Icon } from '@iconify/react'
import Image from 'next/image'

import { Card } from '@/components/ui/Card'
import type { PlayerInfo } from '@/types/player.type'
import { allianceColors } from '@/types/player.type'
import { StalcraftText } from '@/utils/StalcraftText'
import AchievementsView from '../AchievementsView'
import { getStatValue } from '@/utils/player/StatParse'
import HeroStats from './HeroStats'
import HeroCombat from './HeroCombat'

export default function HeroView({ data }: { data: PlayerInfo }) {
	const { t } = useTranslation()
	return (
		<div className="relative">
			<Image
				alt={`${data.alliance} icon`} // Rewrite to svg
				className="absolute -top-15 -left-20 -z-1 hidden xl:block"
				height={115}
				src={`/images/alliance/${data.alliance}.png`}
				width={115}
			/>
			<Card.Root className="z-10 w-full">
				<Card.Header className="space-y-2">
					<Card.Title className="text-3xl font-bold">
						<span className={allianceColors[data.alliance]}>
							{t(`player.alliance.${data.alliance}`)}
						</span>{' '}
						| {data.username}
					</Card.Title>
					<Card.Description className="flex items-center gap-2">
						<Icon
							className="text-xl text-white"
							icon="lucide:info"
						/>
						<StalcraftText text={data.status} />
					</Card.Description>
				</Card.Header>

				<Card.Content className="space-y-6">
					<HeroStats data={data} />
					<div className="border-border/60 border-t" />
					<HeroCombat data={data.stats} />
					<div className="border-border/60 border-t" />
					{data.displayedAchievements.length > 0 && (
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<Icon
									className="text-xl"
									icon="lucide:trophy"
								/>
								<h1 className="text-lg font-semibold">
									Достижения
								</h1>
							</div>
							<AchievementsView
								data={data.displayedAchievements}
							/>
							<p>
								Очков достижений:{' '}
								{getStatValue(data.stats, 'ach-points')}
							</p>
						</div>
					)}
				</Card.Content>
			</Card.Root>
		</div>
	)
}
