'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { BannerMode, BannerType } from '@/types/user.type'
import { BANNER_MODES, BANNER_TYPES, findLabel } from './constants'
import { OptionDropdown } from './OptionDropdown'

export function BannerEditorModal({
	open,
	onOpenChange,
	banner,
	isUploading,
	onModeChange,
	onTypeChange,
	onColorChange,
	onUpload,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	banner: { mode: BannerMode; type: BannerType; color: string }
	isUploading: boolean
	onModeChange: (mode: BannerMode) => void
	onTypeChange: (type: BannerType) => void
	onColorChange: (color: string) => void
	onUpload: (file: File) => void
}) {
	const t = useTranslations()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) onUpload(file)
		e.target.value = ''
	}

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content className="max-w-xl">
				<Modal.Header>
					<Modal.Title>
						{t('me.settings.bannerEditorTitle')}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="flex flex-col gap-2">
					<div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
						<span className="font-semibold text-md">
							{t('me.settings.bannerPlacement')}
						</span>
						<OptionDropdown
							onSelect={onTypeChange}
							options={BANNER_TYPES}
							title={t(
								findLabel(
									BANNER_TYPES,
									banner.type,
									'me.settings.bannerTypeBackground'
								)
							)}
							value={banner.type}
						/>
					</div>
					<div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
						<span className="font-semibold text-md">
							{t('me.settings.bannerType')}
						</span>
						<OptionDropdown
							onSelect={onModeChange}
							options={BANNER_MODES}
							title={t(
								findLabel(
									BANNER_MODES,
									banner.mode,
									'me.settings.bannerModeNone'
								)
							)}
							value={banner.mode}
						/>
					</div>
					{banner.mode === 'COLOR' && (
						<div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
							<span className="font-semibold text-md">
								{t('me.settings.banner_color')}
							</span>
							<label className="relative flex cursor-pointer items-center gap-2">
								<div
									className="size-8 rounded-lg ring-2 ring-primary/50"
									style={{ backgroundColor: banner.color }}
								/>
								<span className="font-semibold text-sm text-text-accent">
									{banner.color}
								</span>
								<input
									className="sr-only"
									onChange={(e) =>
										onColorChange(e.target.value)
									}
									type="color"
									value={banner.color}
								/>
							</label>
						</div>
					)}
					<div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
						<span className="font-semibold text-md">
							{t('me.settings.bannerImage')}
						</span>
						<div className="flex items-center gap-2">
							<input
								accept="image/png,image/jpeg,image/webp"
								className="hidden"
								onChange={handleFileChange}
								ref={fileInputRef}
								type="file"
							/>
							<Button
								loading={isUploading}
								onClick={() => fileInputRef.current?.click()}
								size="sm"
								variant="ghost"
							>
								<Icon className="text-xl" icon="lucide:image" />
							</Button>
						</div>
					</div>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
