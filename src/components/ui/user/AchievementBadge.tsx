'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Tooltip } from '@/components/ui/Tooltip'
import { ACHIEVEMENT_RARITY_COLORS } from '@/constants/achievement.const'
import type { Achievement } from '@/types/achievement.type'

interface AchievementBadgeProps {
	achievement: Achievement
	unlockedAt?: string
	size?: 'sm' | 'md'
}

export default function AchievementBadge({
	achievement,
	unlockedAt,
	size = 'md',
}: AchievementBadgeProps) {
	const t = useTranslations()
	const color = ACHIEVEMENT_RARITY_COLORS[achievement.rarity]
	const unlocked = Boolean(unlockedAt)
	const sizeClass = size === 'sm' ? 'size-6' : 'size-10'
	const iconClass = size === 'sm' ? 'size-3.5' : 'size-5'

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<button
					aria-label={achievement.title}
					className={`relative flex ${sizeClass} shrink-0 items-center justify-center rounded-lg border-2 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 ${unlocked ? '' : 'opacity-50 grayscale'}`}
					style={{
						borderColor: color,
						boxShadow: unlocked ? `0 0 12px ${color}66` : undefined,
						color,
					}}
					type="button"
				>
					<Icon
						className={iconClass}
						icon={achievement.icon || 'lucide:award'}
					/>
				</button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<span className="block max-w-60">
					<strong className="block">{achievement.title}</strong>
					{achievement.description && (
						<span className="text-popover-foreground/75 block">
							{achievement.description}
						</span>
					)}
					<span
						className="block text-xs font-semibold"
						style={{ color }}
					>
						{achievement.rarity}
					</span>
					{!unlocked && (
						<span className="block">
							{t('users.achievements.locked')}
						</span>
					)}
				</span>
			</Tooltip.Content>
		</Tooltip.Root>
	)
}
