'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Avatar from '@/components/ui/user/Avatar'
import { Section } from '../Section'
import { ImageEditorModal } from './ImageEditorModal'
import { SettingRow } from './SettingRow'

export function AvatarSection({
	userId,
	username,
	current,
	available,
	hasCustomAvatar,
	isUploading,
	isRemoving,
	onUpload,
	onRemove,
	onSourceChange,
}: {
	userId: number
	username: string
	current: string | null | undefined
	available: string[] | undefined
	hasCustomAvatar: boolean
	isUploading: boolean
	isRemoving: boolean
	onUpload: (file: File) => void
	onRemove: () => void
	onSourceChange: (source: 'discord' | 'telegram') => void
}) {
	const t = useTranslations()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [editorFile, setEditorFile] = useState<File | null>(null)
	const [isEditorOpen, setIsEditorOpen] = useState(false)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setEditorFile(file)
			setIsEditorOpen(true)
		}
		e.target.value = ''
	}

	return (
		<>
			<Section icon="lucide:image" title={t('me.settings.avatar')}>
				<div className="flex flex-col gap-2">
					<SettingRow
						description={t('me.settings.avatarPreviewDesc')}
						title={t('me.settings.avatarPreview')}
					>
						<Avatar
							className="size-14"
							height={52}
							id={userId}
							username={username}
							width={52}
						/>
					</SettingRow>
					<SettingRow
						description={t('me.settings.avatarUploadDesc')}
						title={t('me.settings.avatarUpload')}
					>
						<div className="flex items-center gap-1">
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
								<Icon
									className="text-xl"
									icon="lucide:upload"
								/>
							</Button>
							{hasCustomAvatar && (
								<Button
									loading={isRemoving}
									onClick={onRemove}
									size="sm"
									variant="ghost"
								>
									<Icon
										className="text-xl"
										icon="lucide:trash-2"
									/>
								</Button>
							)}
						</div>
					</SettingRow>
					{available?.includes('discord') && (
						<SettingRow
							description={t('me.settings.avatarSourceDesc')}
							title={t('me.settings.avatarSource')}
						>
							<div className="flex gap-1">
								<Button
									className="gap-2"
									disabled={current === 'discord'}
									onClick={() => onSourceChange('discord')}
									size="sm"
									variant={'secondary'}
								>
									<Icon
										className="text-lg"
										icon="ic:baseline-discord"
									/>
									Discord
								</Button>
								<Button
									className="gap-2"
									disabled={current === 'telegram'}
									onClick={() => onSourceChange('telegram')}
									size="sm"
									variant={'secondary'}
								>
									<Icon
										className="text-lg"
										icon="mingcute:telegram-fill"
									/>
									Telegram
								</Button>
							</div>
						</SettingRow>
					)}
				</div>
			</Section>
			<ImageEditorModal
				aspectRatio={1}
				file={editorFile}
				isUploading={isUploading}
				onConfirm={(file) => {
					onUpload(file)
					setIsEditorOpen(false)
					setEditorFile(null)
				}}
				onOpenChange={(open) => {
					setIsEditorOpen(open)
					if (!open) setEditorFile(null)
				}}
				open={isEditorOpen}
				title={t('me.settings.editorTitle')}
			/>
		</>
	)
}
