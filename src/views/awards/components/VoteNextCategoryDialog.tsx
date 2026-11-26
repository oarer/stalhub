'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { AwardCategory } from '@/types/awards.type'

export function VoteNextCategoryDialog({
	category,
	onClose,
	onGo,
}: {
	category: AwardCategory
	onClose: () => void
	onGo: () => void
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
					<Modal.Title>{t('awards.voteAccepted')}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p className="text-muted-foreground">
						{t('awards.nextCategory')}
					</p>
					<p className="text-base font-semibold">
						{category.title}
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('awards.stay')}</Modal.Close>
					<Button onClick={onGo}>{t('awards.goToNext')}</Button>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
