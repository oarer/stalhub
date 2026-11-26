'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export function PlayerVoteConfirmDialog({
	loading,
	playerName,
	onClose,
	onConfirm,
}: {
	loading: boolean
	playerName: string
	onClose: () => void
	onConfirm: () => void
}) {
	const t = useTranslations()

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
					<p className="text-[15px] font-medium">{playerName}</p>
					<p className="text-muted-foreground text-xs">
						{t('awards.player.topDescription')}
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
