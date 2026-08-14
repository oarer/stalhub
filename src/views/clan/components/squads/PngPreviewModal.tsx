'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { LightBox } from '@/components/ui/LightBox'
import { Modal } from '@/components/ui/Modal'

interface PngPreviewModalProps {
	open: boolean
	previewUrl: string | null
	onOpenChange: (open: boolean) => void
	onCopy: () => void
	onDownload: () => void
}

export function PngPreviewModal({
	open,
	previewUrl,
	onOpenChange,
	onCopy,
	onDownload,
}: PngPreviewModalProps) {
	const t = useTranslations()

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title className="flex items-center gap-2">
						<Icon icon="lucide:image" />
						{t('clan.squads.png.previewTitle')}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{previewUrl && (
						<LightBox.Root>
							<LightBox.Trigger asChild>
								<Image
									alt="Squads preview"
									className="h-auto w-full rounded-md"
									height={600}
									priority
									src={previewUrl}
									width={900}
								/>
							</LightBox.Trigger>
							<LightBox.Content alt="squads" src={previewUrl} />
						</LightBox.Root>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.close')}</Modal.Close>
					<Button
						className="flex items-center gap-2"
						onClick={onCopy}
						variant="secondary"
					>
						<Icon icon="lucide:copy" />
						{t('clan.common.copy')}
					</Button>
					<Button
						className="flex items-center gap-2"
						onClick={onDownload}
						variant="primary"
					>
						<Icon icon="lucide:download" />
						{t('clan.common.download')}
					</Button>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
