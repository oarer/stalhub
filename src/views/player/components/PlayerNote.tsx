'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'
import type { PlayerRole } from '@/types/player.type'
import { ROLE_META } from '@/types/playerNote.type'

export default function PlayerNote({
	data,
	username,
}: {
	data: PlayerRole
	username: string
}) {
	const t = useTranslations()

	if (!data.role || !(data.role in ROLE_META)) return null

	const meta = ROLE_META[data.role]
	const description = `player.note.${data.role.toLowerCase()}_desc`

	if (data?.description) {
		return (
			<Tooltip.Root position="top">
				<Tooltip.Trigger underline={false}>
					<Badge variant={meta.variant}>
						<Icon className="size-4" icon={meta.icon} />
						<span
							className={`${unbounded.className} font-semibold text-[12px] uppercase leading-relaxed tracking-widest`}
						>
							{t(meta.title)}
						</span>
					</Badge>
				</Tooltip.Trigger>
				<Tooltip.Content>{t(description)}</Tooltip.Content>
			</Tooltip.Root>
		)
	}

	return (
		<Modal.Root>
			<Tooltip.Root position="top">
				<Tooltip.Trigger underline={false}>
					<Modal.Trigger asChild>
						<Badge
							className="cursor-pointer"
							variant={meta.variant}
						>
							<Icon className="size-4" icon={meta.icon} />
							<span
								className={`${unbounded.className} font-semibold text-[12px] uppercase leading-relaxed tracking-widest`}
							>
								{t(meta.title)}
							</span>
						</Badge>
					</Modal.Trigger>
				</Tooltip.Trigger>
				<Tooltip.Content>{t(description)}</Tooltip.Content>
			</Tooltip.Root>

			<Modal.Content>
				<Modal.Header>
					<Modal.Title
						className={cn(
							data?.role === 'SCAMMER' && 'text-red-500'
						)}
					>
						{username}
					</Modal.Title>
					<Modal.Description className="font-semibold">
						{t('player.note.more')}
					</Modal.Description>
				</Modal.Header>
				<Modal.Body className="mb-4 py-0 font-semibold">
					{data?.description}
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
