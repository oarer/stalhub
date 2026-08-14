'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Section } from '@/views/me/components/Section'

interface FreezeSectionProps {
	isPending: boolean
	onFreeze: () => void
}

export function FreezeSection({ isPending, onFreeze }: FreezeSectionProps) {
	const [isFreezeClanOpen, setIsFreezeClanOpen] = useState(false)

	const t = useTranslations()
	return (
		<Section
			danger
			icon="lucide:snowflake"
			title={t('clan.settings.freezeTitle')}
		>
			<div className="rounded-lg border-2 border-red-500/20 bg-red-400/20 p-4">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-1">
						<span className="font-semibold text-sm">
							{t('clan.settings.freezeLabel')}
						</span>
						<span className="font-semibold text-red-400 text-sm">
							{t('clan.settings.freezeDesc')}
						</span>
					</div>
					<Button
						onClick={() => setIsFreezeClanOpen(true)}
						variant="danger"
					>
						{t('clan.settings.freezeButton')}
					</Button>
				</div>
			</div>
			<Modal.Root
				onOpenChange={(open) => {
					setIsFreezeClanOpen(open)
				}}
				open={isFreezeClanOpen}
			>
				<Modal.Content
					background="bg-linear-to-t from-red-400/20 to-neutral-white/20"
					className="max-w-120"
				>
					<Modal.Header>
						<Modal.Title>
							{t('clan.settings.freezeConfirmTitle')}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body className="font-semibold">
						{t('clan.settings.freezeConfirmBody')}
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
						<Modal.Action
							className="gap-2"
							closeOnClick
							disabled={isPending}
							onClick={onFreeze}
							variant={'danger'}
						>
							{isPending ? (
								<Icon
									className="animate-spin text-base"
									icon="lucide:loader-circle"
								/>
							) : (
								<Icon
									className="text-base"
									icon="lucide:snowflake"
								/>
							)}
							{t('clan.settings.freezeConfirm')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</Section>
	)
}
