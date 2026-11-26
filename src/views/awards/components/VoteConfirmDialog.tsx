'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import type { AwardNominee } from '@/types/awards.type'
import { allianceColors } from '@/types/player.type'
import { normalizeUnoFaction } from '@/views/uno/utils/uno.utils'

export function VoteConfirmDialog({
	loading,
	nominee,
	onClose,
	onConfirm,
}: {
	loading: boolean
	nominee: AwardNominee
	onClose: () => void
	onConfirm: () => void
}) {
	const t = useTranslations()
	const faction = normalizeUnoFaction(nominee.clan_faction)
	const factionColor = faction ? allianceColors[faction] : undefined

	return (
		<Modal.Root
			onOpenChange={(open) => {
				if (!open) onClose()
			}}
			open
		>
			<Modal.Content className="max-w-md" fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('awards.voteConfirm')}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="flex flex-col gap-1.5">
					<p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
						{t('awards.voteFor')}
					</p>
					<p
						className={cn(
							'flex items-center gap-1 text-[15px]',
							factionColor
						)}
					>
						{nominee.clan_tag && <span>[{nominee.clan_tag}]</span>}
						<span className="font-medium">
							{nominee.clan_name ?? nominee.name}
						</span>
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('ui.cancel')}</Modal.Close>
					<Button loading={loading} onClick={onConfirm}>
						{t('awards.vote')}
					</Button>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
