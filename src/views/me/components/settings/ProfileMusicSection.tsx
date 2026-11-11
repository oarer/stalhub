'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Section } from '../Section'

type MusicDraft = {
	music_url: string
	music_title: string
	music_artist: string
	music_cover: string
}

export function ProfileMusicSection({
	isDeletePending,
	isUploadPending,
	music,
	onDeleteFile,
	onSave,
	onUploadFile,
}: {
	isDeletePending?: boolean
	isUploadPending?: boolean
	music: Partial<Record<keyof MusicDraft, string | null>> | null | undefined
	onDeleteFile?: () => void
	onSave: (data: MusicDraft) => void
	onUploadFile?: (file: File) => void
}) {
	const t = useTranslations()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [draft, setDraft] = useState<MusicDraft>({
		music_url: music?.music_url ?? '',
		music_title: music?.music_title ?? '',
		music_artist: music?.music_artist ?? '',
		music_cover: music?.music_cover ?? '',
	})

	useEffect(() => {
		setDraft({
			music_url: music?.music_url ?? '',
			music_title: music?.music_title ?? '',
			music_artist: music?.music_artist ?? '',
			music_cover: music?.music_cover ?? '',
		})
	}, [music])

	const saved: MusicDraft = {
		music_url: music?.music_url ?? '',
		music_title: music?.music_title ?? '',
		music_artist: music?.music_artist ?? '',
		music_cover: music?.music_cover ?? '',
	}
	const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
	const setField = (field: keyof MusicDraft, value: string) =>
		setDraft((current) => ({ ...current, [field]: value }))

	const isUploadedFile = Boolean(
		music?.music_url?.startsWith('/uploads/users/music/')
	)

	const handlePickFile = () => fileInputRef.current?.click()

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		event.target.value = ''
		if (file && onUploadFile) onUploadFile(file)
	}

	return (
		<Section icon="lucide:disc-3" title={t('me.settings.profileMusic')}>
			<div className="flex flex-col gap-2">
				<p className="font-semibold text-foreground text-xs">
					{t('me.settings.profileMusicDesc')}
				</p>
				<div className="grid gap-2 md:grid-cols-2">
					<Input
						label="me.settings.musicUrl"
						onChange={(event) =>
							setField('music_url', event.target.value)
						}
						value={draft.music_url}
					/>
					<Input
						label="me.settings.musicTitle"
						onChange={(event) =>
							setField('music_title', event.target.value)
						}
						value={draft.music_title}
					/>
					<Input
						label="me.settings.musicArtist"
						onChange={(event) =>
							setField('music_artist', event.target.value)
						}
						value={draft.music_artist}
					/>
					<Input
						label="me.settings.musicCover"
						onChange={(event) =>
							setField('music_cover', event.target.value)
						}
						value={draft.music_cover}
					/>
				</div>
				{onUploadFile && (
					<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5">
						<div className="min-w-0">
							<p className="flex items-center gap-1.5 font-semibold text-[11px]">
								<Icon
									className="text-base text-primary"
									icon="lucide:file-audio"
								/>
								{t('me.settings.musicUploadTitle')}
							</p>
							<p className="mt-0.5 truncate text-muted-foreground text-[11px]">
								{t('me.settings.musicUploadDesc')}
							</p>
						</div>
						<div className="flex shrink-0 items-center gap-2">
							<input
								accept=".mp3,.wav,.ogg,.m4a,.aac,.flac,audio/*"
								className="hidden"
								onChange={handleFileChange}
								ref={fileInputRef}
								type="file"
							/>
							<Button
								loading={isUploadPending}
								onClick={handlePickFile}
								size="sm"
								variant="secondary"
							>
								<Icon className="text-base" icon="lucide:upload" />
								{t('me.settings.musicUploadButton')}
							</Button>
							{isUploadedFile && onDeleteFile && (
								<Button
									disabled={isUploadPending}
									loading={isDeletePending}
									onClick={onDeleteFile}
									size="sm"
									variant="ghost"
								>
									<Icon
										className="text-base text-destructive"
										icon="lucide:trash-2"
									/>
									{t('me.settings.musicRemoveButton')}
								</Button>
							)}
						</div>
					</div>
				)}
				<Button
					className="gap-2 self-end"
					disabled={!dirty}
					loading={isUploadPending}
					onClick={() => onSave(draft)}
					size="md"
					variant="secondary"
				>
					<Icon className="text-lg" icon="lucide:check" />
					{t('me.settings.musicSave')}
				</Button>
			</div>
		</Section>
	)
}
