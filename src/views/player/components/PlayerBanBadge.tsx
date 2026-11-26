'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import type { PlayerExens } from '@/types/player.type'

export default function PlayerBanBadge({ exens }: { exens: PlayerExens }) {
	const t = useTranslations()

	if (!exens.permanent) return null

	return (
		<Tooltip.Root position="top">
			<Tooltip.Trigger underline={false}>
				<Badge className="cursor-help" variant="danger">
					<Icon className="size-4" icon="lucide:ban" />
					<span
						className={`${unbounded.className} text-[10px] leading-relaxed font-semibold tracking-widest uppercase md:text-xs`}
					>
						{t('player.exens.title')}
					</span>
				</Badge>
			</Tooltip.Trigger>
			<Tooltip.Content>{t('player.exens.active')}</Tooltip.Content>
		</Tooltip.Root>
	)
}
