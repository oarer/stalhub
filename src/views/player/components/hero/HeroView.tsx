'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { CSSProperties } from 'react'
import { Card } from '@/components/ui/Card'
import { SocialLinks } from '@/components/ui/user/SocialLinks'
import { useImageLuminance } from '@/hooks/useImageLuminance'
import { cn } from '@/lib/cn'
import type { Regions } from '@/types/api.type'
import type { PlayerResponse } from '@/types/player.type'
import { allianceColors } from '@/types/player.type'
import { getStatValue } from '@/utils/player/StatParse'
import { StalcraftText } from '@/utils/StalcraftText'
import AchievementsView from '../AchievementsView'
import PlayerBanBadge from '../PlayerBanBadge'
import { PlayerComparison } from '../PlayerComparison'
import PlayerNote from '../PlayerNote'
import ProfileDecoration, {
	ProfileStickers,
	resolveAssetUrl,
} from '../ProfileDecoration'
import { ProfileStrings } from '../ProfileMedia'
import HeroCombat from './HeroCombat'
import HeroStats from './HeroStats'

const LIGHT_BG_STYLE: CSSProperties = {
	color: 'oklch(0.15 0 0)',
	'--color-foreground': 'oklch(0.15 0 0)',
	'--color-card-foreground': 'oklch(0.15 0 0)',
	'--color-muted-foreground': 'oklch(0.45 0 0)',
} as CSSProperties

const DARK_BG_STYLE: CSSProperties = {
	color: 'oklch(0.95 0 0)',
	'--color-foreground': 'oklch(0.95 0 0)',
	'--color-card-foreground': 'oklch(0.95 0 0)',
	'--color-muted-foreground': 'oklch(0.78 0 0)',
} as CSSProperties

export default function HeroView({
	data,
	region,
}: {
	data: PlayerResponse
	region: Regions
}) {
	const t = useTranslations()
	const hasBg = !!data.customization?.background
	const backgroundUrl = hasBg
		? resolveAssetUrl(data.customization!.background!)
		: null
	const bgLuminance = useImageLuminance(backgroundUrl)

	const textStyle: CSSProperties | undefined = !hasBg
		? undefined
		: bgLuminance === 'light'
			? LIGHT_BG_STYLE
			: DARK_BG_STYLE

	const statusDefaultColor =
		hasBg && bgLuminance === 'light' ? '#1a1a1a' : '#ffffff'

	return (
		<div className="relative space-y-4">
			<Image
				alt={`${data.alliance} icon`}
				className="absolute -top-15 -left-20 -z-1 hidden xl:block"
				height={115}
				src={`/images/alliance/${data.alliance}.png`}
				width={115}
			/>
			<ProfileDecoration customization={data.customization}>
				<Card.Root
					className={cn(
						'relative z-10 w-full md:backdrop-blur-xs',
						hasBg && 'bg-card/10 md:bg-card/10',
						!hasBg && 'bg-card md:bg-card/50'
					)}
				>
					<ProfileStickers customization={data.customization} />
					<div style={textStyle}>
						<Card.Header className="relative z-10 space-y-2">
							<Card.Title className="flex flex-wrap items-center gap-4 text-xl font-semibold md:text-3xl">
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
								{data.exens && (
									<PlayerBanBadge exens={data.exens} />
								)}
							</Card.Title>
							<Card.Description className="flex flex-col items-start gap-3">
								<div className="flex w-full min-w-0 items-start gap-2">
									<Icon
										className="mt-0.5 shrink-0 text-xl"
										icon="lucide:info"
									/>
									<div className="max-w-full overflow-auto">
										<StalcraftText
											defaultColor={statusDefaultColor}
											text={data.status}
										/>
									</div>
								</div>
								<SocialLinks links={data.social_links} />
								<ProfileStrings strings={data.strings} />
							</Card.Description>
						</Card.Header>

						<Card.Content className="relative z-10 space-y-6">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
								<HeroStats data={data} />
								<PlayerComparison
									character={data.username}
									region={region}
								/>
							</div>
						</Card.Content>
					</div>
				</Card.Root>
			</ProfileDecoration>

			<Card.Root className="bg-card md:bg-card/50 w-full">
				<Card.Content className="space-y-6">
					<HeroCombat data={data.stats} />
					<div className="border-primary/60 border-t" />
					{data.displayedAchievements && (
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<Icon
									className="text-xl"
									icon="lucide:trophy"
								/>
								<h1 className="text-lg font-semibold">
									{t('player.hero.ach')}
								</h1>
							</div>
							<AchievementsView
								data={data.displayedAchievements}
							/>
							<p className="font-mono text-sm font-semibold">
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
