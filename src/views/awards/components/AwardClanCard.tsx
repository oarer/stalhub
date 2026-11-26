'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { AwardNominee } from '@/types/awards.type'
import { allianceColors } from '@/types/player.type'
import { normalizeUnoFaction } from '@/views/uno/utils/uno.utils'

interface AwardClanCardProps {
	nominee: AwardNominee
	selected: boolean
	onVote: (nominee: AwardNominee) => void
	disabled?: boolean
}

export function AwardClanCard({
	nominee,
	selected,
	onVote,
	disabled = false,
}: AwardClanCardProps) {
	const t = useTranslations('awards')
	const faction = normalizeUnoFaction(nominee.clan_faction)
	const factionColor = faction ? allianceColors[faction] : undefined

	return (
		<motion.article
			className={cn(
				'flex h-full flex-col gap-3 rounded-xl border p-4',
				selected
					? 'border-primary bg-primary/10'
					: 'border-border bg-card'
			)}
		>
			<p className={cn('flex items-center gap-1', factionColor)}>
				{nominee.clan_tag && <span>[{nominee.clan_tag}]</span>}
				<span className="font-medium">
					{nominee.clan_name ?? nominee.name}
				</span>
			</p>
			{typeof nominee.clan_member_count === 'number' && (
				<div className="text-muted-foreground flex items-center gap-1 text-sm">
					<Icon icon="lucide:users" />
					<span>{nominee.clan_member_count}</span>
				</div>
			)}
			{nominee.description && (
				<p className="text-muted-foreground text-sm">
					{nominee.description}
				</p>
			)}
			<Button
				className="w-full gap-2"
				disabled={disabled}
				onClick={() => onVote(nominee)}
				variant={selected ? 'secondary' : 'primary'}
			>
				<Icon icon={selected ? 'lucide:check' : 'lucide:vote'} />
				{selected ? t('alreadyVoted') : t('vote')}
			</Button>
		</motion.article>
	)
}

export default AwardClanCard
