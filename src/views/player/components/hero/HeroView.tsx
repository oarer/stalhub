import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import type { PlayerResponse } from '@/types/player.type'
import { allianceColors } from '@/types/player.type'
import { getStatValue } from '@/utils/player/StatParse'
import { StalcraftText } from '@/utils/StalcraftText'
import AchievementsView from '../AchievementsView'
import PlayerNote from '../PlayerNote'
import HeroCombat from './HeroCombat'
import HeroStats from './HeroStats'

export default function HeroView({ data }: { data: PlayerResponse }) {
	const t = useTranslations()

	return (
		<div className="relative">
			<Image
				alt={`${data.alliance} icon`}
				className="absolute -top-15 -left-20 -z-1 hidden xl:block"
				height={115}
				src={`/images/alliance/${data.alliance}.png`} // TODO Rewrite to svg
				width={115}
			/>
			<Card.Root className="z-10 w-full">
				<Card.Header className="space-y-2">
					<Card.Title className="flex flex-wrap items-center gap-4 font-bold text-3xl">
						<span className={allianceColors[data.alliance]}>
							{t(`player.alliance.${data.alliance}`)}
						</span>
						<span>|</span>
						<span>{data.username}</span>
						{data?.role && (
							<PlayerNote
								data={data.role}
								username={data.username}
							/>
						)}
					</Card.Title>
					<Card.Description className="flex items-center gap-2">
						<Icon
							className="text-white text-xl"
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
								<h1 className="font-semibold text-lg">
									{t('player.hero.ach')}
								</h1>
							</div>
							<AchievementsView
								data={data.displayedAchievements}
							/>
							<p>
								{t('player.hero.ach_points')}{' '}
								{Number(getStatValue(data.stats, 'ach-points'))}
							</p>
						</div>
					)}
				</Card.Content>
			</Card.Root>
		</div>
	)
}
