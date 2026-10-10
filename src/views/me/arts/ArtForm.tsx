'use client'

import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ArtType } from '@/types/art.type'
import { ArtImagesField } from '@/views/me/components/ArtImagesField'
import { parseTags } from '@/views/me/components/article/editor-utils'
import { Section } from '../components/Section'

export interface ArtFormData {
	title: string
	type: ArtType
	image_url: string | null
	image_urls: string[]
	tags: string[]
	description?: string
}

export interface ArtFormInitial {
	title: string
	type: ArtType
	imageUrls: string[]
	tags: string
	description: string
}

const ART_TYPES = [
	{ value: ArtType.DEFAULT, label: 'me.newArt.default' },
	{ value: ArtType.NSFW, label: 'me.newArt.nsfw' },
]

interface ArtFormProps {
	title: string
	initial: ArtFormInitial
	submitIcon: string
	submitLabel: string
	isPending: boolean
	onSubmit: (data: ArtFormData) => void
}

export function ArtForm({
	title,
	initial,
	submitIcon,
	submitLabel,
	isPending,
	onSubmit,
}: ArtFormProps) {
	const router = useRouter()
	const t = useTranslations()

	const [formTitle, setFormTitle] = useState(initial.title)
	const [type, setType] = useState<ArtType>(initial.type)
	const [imageUrls, setImageUrls] = useState<string[]>(initial.imageUrls)
	const [tags, setTags] = useState(initial.tags)
	const [description, setDescription] = useState(initial.description)

	const handleSubmit = () => {
		if (!formTitle.trim()) return
		onSubmit({
			title: formTitle.trim(),
			type,
			image_url: imageUrls[0] ?? null,
			image_urls: imageUrls,
			tags: parseTags(tags),
			description: description.trim() || undefined,
		})
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3">
				<Button
					className="p-2.5"
					onClick={() => router.back()}
					variant={'ghost'}
				>
					<Icon className="size-5" icon="lucide:arrow-left" />
				</Button>
				<h1 className="font-semibold text-lg">{title}</h1>
			</div>

			<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
				<Section icon="lucide:info" title={t('me.newArt.info')}>
					<div className="flex flex-col gap-2">
						<div className="flex flex-col gap-2">
							<label
								className="font-semibold text-foreground text-md"
								htmlFor="art-title"
							>
								{t('me.newArt.name')}
							</label>
							<Input
								autoFocus
								id="art-title"
								label="me.newArt.namePlaceholder"
								onChange={(e) => setFormTitle(e.target.value)}
								value={formTitle}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<span className="font-semibold text-foreground text-md">
								{t('me.newArt.type')}
							</span>
							<div className="grid grid-cols-2 gap-2">
								{ART_TYPES.map((artType) => (
									<Button
										className="gap-2"
										key={artType.value}
										onClick={() => setType(artType.value)}
										type="button"
										variant={
											type === artType.value
												? 'primary'
												: 'secondary'
										}
									>
										{t(artType.label)}
									</Button>
								))}
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<label
								className="font-semibold text-foreground text-md"
								htmlFor="art-description"
							>
								{t('me.newArt.description')}
							</label>
							<Textarea
								className="min-h-20 w-full p-2"
								id="art-description"
								onChange={(e) => setDescription(e.target.value)}
								placeholder={t(
									'me.newArt.descriptionPlaceholder'
								)}
								value={description}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<label
								className="font-semibold text-foreground text-md"
								htmlFor="art-tags"
							>
								{t('me.newArt.tags')}
							</label>
							<Input
								id="art-tags"
								label="me.newArt.tagsPlaceholder"
								onChange={(e) => setTags(e.target.value)}
								value={tags}
							/>
						</div>
					</div>
				</Section>
				<Section icon="lucide:image" title={t('me.newArt.work')}>
					<div className="flex flex-col gap-2">
						<Alert.Root variant={'warning'}>
							<Alert.Description>
								{t('me.newArt.warn')}
							</Alert.Description>
						</Alert.Root>
						<label
							className="font-semibold text-foreground text-md"
							htmlFor="art-image"
						>
							{t('me.newArt.image')}
						</label>
						<ArtImagesField
							onChange={setImageUrls}
							value={imageUrls}
						/>
					</div>
				</Section>
			</div>
			<div className="flex items-center gap-2">
				<Button
					className="gap-2"
					disabled={!formTitle.trim() || isPending}
					loading={isPending}
					onClick={handleSubmit}
				>
					<Icon icon={submitIcon} />
					{submitLabel}
				</Button>
				<Button
					className="gap-2"
					onClick={() => router.push('/me/arts')}
					variant="secondary"
				>
					<Icon icon="lucide:undo-2" />
					{t('me.artEdit.back')}
				</Button>
			</div>
		</div>
	)
}
