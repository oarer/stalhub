'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export function DeleteAccountModal({
	open,
	onOpenChange,
	username,
	onDelete,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	username: string
	onDelete: () => void
}) {
	const t = useTranslations()
	const [confirmNickname, setConfirmNickname] = useState('')

	return (
		<Modal.Root
			onOpenChange={(next) => {
				onOpenChange(next)
				if (!next) setConfirmNickname('')
			}}
			open={open}
		>
			<Modal.Content
				background="bg-linear-to-t from-red-400/20 to-neutral-white/20"
				className="max-w-120"
				fullScreen={false}
			>
				<Modal.Header>
					<Modal.Title className="font-bold">
						{t('me.settings.deleteConfirmTitle')}
					</Modal.Title>
					<Modal.Description className="font-semibold">
						{t.rich('me.settings.deleteConfirmDesc', {
							username,
							bold: (chunks) => (
								<span className="font-bold text-destructive">
									{chunks}
								</span>
							),
						})}
					</Modal.Description>
				</Modal.Header>
				<Modal.Body>
					<Input
						className="w-full rounded-lg border border-destructive/20 bg-card px-3 py-2 text-sm outline-none focus:border-destructive/50"
						onChange={(e) => setConfirmNickname(e.target.value)}
						placeholder={t('me.settings.deletePlaceholder')}
						value={confirmNickname}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('me.settings.cancel')}</Modal.Close>
					<Button
						disabled={confirmNickname !== username}
						onClick={onDelete}
						variant="danger"
					>
						{t('me.settings.deleteConfirm')}
					</Button>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
