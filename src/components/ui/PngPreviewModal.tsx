'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { LightBox } from '@/components/ui/LightBox'
import { Modal } from '@/components/ui/Modal'

interface PngPreviewModalProps {
	open: boolean
	previewUrl: string | null
	onOpenChange: (open: boolean) => void
	onCopy: () => void
	onDownload: () => void
	title: ReactNode
	alt: string
	closeLabel: ReactNode
	copyLabel: ReactNode
	downloadLabel: ReactNode
	imageClassName?: string
}

export function PngPreviewModal({
	open,
	previewUrl,
	onOpenChange,
	onCopy,
	onDownload,
	title,
	alt,
	closeLabel,
	copyLabel,
	downloadLabel,
	imageClassName,
}: PngPreviewModalProps) {
	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title className="flex items-center gap-2">
						<Icon icon="lucide:image" />
						{title}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{previewUrl && (
						<LightBox.Root>
							<LightBox.Trigger asChild>
								<Image
									alt={alt}
									className={imageClassName}
									height={600}
									priority
									src={previewUrl}
									width={900}
								/>
							</LightBox.Trigger>
							<LightBox.Content alt={alt} src={previewUrl} />
						</LightBox.Root>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{closeLabel}</Modal.Close>
					<Button
						className="flex items-center gap-2"
						onClick={onCopy}
						variant="secondary"
					>
						<Icon icon="lucide:copy" />
						{copyLabel}
					</Button>
					<Button
						className="flex items-center gap-2"
						onClick={onDownload}
						variant="primary"
					>
						<Icon icon="lucide:download" />
						{downloadLabel}
					</Button>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
