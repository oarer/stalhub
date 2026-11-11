import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import type { Regions } from '@/types/api.type'
import type { PlayerResponse } from '@/types/player.type'
import { allianceColors } from '@/types/player.type'
import { getStatValue } from '@/utils/player/StatParse'
import { StalcraftText } from '@/utils/StalcraftText'
import AchievementsView from '../AchievementsView'
import { PlayerComparison } from '../PlayerComparison'
import PlayerNote from '../PlayerNote'
import ProfileMusic, { ProfileStrings } from '../ProfileMedia'
import HeroCombat from './HeroCombat'
import HeroStats from './HeroStats'

export default function HeroView({
	data,
	region,
	character,
	isRu,
}: {
	data: PlayerResponse
	region: Regions
	character: string
	isRu: boolean
}) {
	const t = useTranslations()

	return (
		<div className="relative">
			<Image
				alt={`${data.alliance} icon`}
				className="absolute -top-15 -left-20 -z-1 hidden xl:block"
				height={115}
				src={`/images/alliance/${data.alliance}.png`}
				width={115}
			/>
			<Card.Root className="z-10 w-full">
				<Card.Header className="space-y-2">
					<Card.Title className="flex flex-wrap items-center gap-4 font-semibold text-xl md:text-3xl">
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
					<Card.Description className="flex flex-col items-start gap-3">
						<div className="flex min-w-0 items-start gap-2">
							<Icon
								className="mt-0.5 shrink-0 text-white text-xl"
								icon="lucide:info"
							/>
							<div className="min-w-0">
								<StalcraftText text={data.status} />
							</div>
						</div>
						<ProfileStrings strings={data.strings} />
					</Card.Description>
				</Card.Header>

				<Card.Content className="space-y-6">
					<ProfileMusic music={data.music} />
					{data.ascii && (
						<div className="overflow-x-auto rounded-xl border border-primary/20 bg-black/30 p-4">
							<p className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
								{t('player.ascii.title')}
							</p>
							<StalcraftText text={data.ascii} />
						</div>
					)}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<HeroStats data={data} />
						<PlayerComparison
							character={data.username}
							region={region}
						/>
					</div>
					<div className="border-primary/60 border-t" />
					<HeroCombat data={data.stats} />
					<div className="border-primary/60 border-t" />
					{data.displayedAchievements && (
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
							<p className="font-mono font-semibold text-sm">
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
