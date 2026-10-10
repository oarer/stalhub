'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { artQueries } from '@/queries/art/art.queries'
import { artService } from '@/services/art/art.service'
import { type ArtUpdate, getArtImages } from '@/types/art.type'
import { ArtForm } from './ArtForm'

interface ArtEditViewProps {
	artId: string
}

export default function ArtEditView({ artId }: ArtEditViewProps) {
	const queryClient = getQueryClient()
	const t = useTranslations()

	const { data: art } = useSuspenseQuery(artQueries.get(artId))

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

	return (
		<ArtForm
			initial={{
				title: art.title,
				type: art.type,
				imageUrls: getArtImages(art),
				tags: art.tags.join(', '),
				description: art.description ?? '',
			}}
			isPending={updateMutation.isPending}
			key={art.id}
			onSubmit={(data) => updateMutation.mutate(data)}
			submitIcon="lucide:save"
			submitLabel={t('me.artEdit.save')}
			title={t('me.artEdit.title')}
		/>
	)
}
