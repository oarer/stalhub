'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { artQueries } from '@/queries/art/art.queries'
import { artService } from '@/services/art/art.service'
import { ArtType, type ArtUpdate } from '@/types/art.type'
import { ArtImageField } from '@/views/me/components/ArtImageField'
import { parseTags } from '@/views/me/components/article/editor-utils'
import { Section } from '../components/Section'

interface ArtEditViewProps {
	artId: string
}

const ART_TYPES = [
	{ value: ArtType.DEFAULT, label: 'me.newArt.default' },
	{ value: ArtType.NSFW, label: 'me.newArt.nsfw' },
]

export default function ArtEditView({ artId }: ArtEditViewProps) {
	const router = useRouter()
	const queryClient = getQueryClient()
	const t = useTranslations()

	const { data: art } = useSuspenseQuery(artQueries.get(artId))

	const [title, setTitle] = useState(art.title)
	const [type, setType] = useState<ArtType>(art.type)
	const [imageUrl, setImageUrl] = useState(art.image_url ?? '')
	const [tags, setTags] = useState(art.tags.join(', '))
	const [description, setDescription] = useState(art.description ?? '')

	const updateMutation = useMutation({
		mutationFn: (data: ArtUpdate) => artService.update(artId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['art', artId] })
			queryClient.invalidateQueries({ queryKey: ['arts'] })
			toast.success(t('me.artEdit.toastSaved'))
		},
		onError: () => {
			toast.error(t('me.artEdit.toastSaveError'))
		},
	})

	const handleSave = () => {
		if (!title.trim()) return
		updateMutation.mutate({
			title: title.trim(),
			type,
			image_url: imageUrl.trim() || null,
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
				<h1 className="font-semibold text-lg">
					{t('me.artEdit.title')}
				</h1>
			</div>

			<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
				<Section icon="lucide:info" title={t('me.newArt.info')}>
					<div className="flex flex-col gap-2">
						<div className="flex flex-col gap-2">
							<label
								className="font-semibold text-md text-text-accent"
								htmlFor="art-title"
							>
								{t('me.newArt.name')}
							</label>
							<Input
								autoFocus
								id="art-title"
								label="me.newArt.namePlaceholder"
								onChange={(e) => setTitle(e.target.value)}
								value={title}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<span className="font-semibold text-md text-text-accent">
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
								className="font-semibold text-md text-text-accent"
								htmlFor="art-description"
							>
								{t('me.newArt.description')}
							</label>
							<textarea
								className="min-h-20 w-full resize-y rounded-lg border border-border bg-card p-2 text-sm outline-none transition-colors focus:border-primary"
								id="art-description"
								placeholder={t('me.newArt.descriptionPlaceholder')}
								onChange={(e) => setDescription(e.target.value)}
								value={description}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<label
								className="font-semibold text-md text-text-accent"
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
							className="font-semibold text-md text-text-accent"
							htmlFor="art-image"
						>
							{t('me.newArt.image')}
						</label>
						<ArtImageField
							onChange={setImageUrl}
							value={imageUrl}
						/>
					</div>
				</Section>
			</div>
			<div className="flex items-center gap-2">
				<Button
					className="gap-2"
					disabled={!title.trim() || updateMutation.isPending}
					loading={updateMutation.isPending}
					onClick={handleSave}
				>
					<Icon icon="lucide:save" />
					{t('me.artEdit.save')}
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
