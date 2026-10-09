'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { artService } from '@/services/art/art.service'
import { type ArtCreate, ArtType } from '@/types/art.type'
import { ArtForm } from './ArtForm'

export default function NewArtView() {
	const router = useRouter()
	const queryClient = getQueryClient()
	const t = useTranslations()

	const createMutation = useMutation({
		mutationFn: (data: ArtCreate) => artService.create(data),
		onSuccess: (art) => {
			queryClient.invalidateQueries({ queryKey: ['arts'] })
			toast.success(t('me.newArt.toastCreated'))
			router.push(`/me/arts/${art.id}/edit`)
		},
		onError: () => {
			toast.error(t('me.newArt.toastCreateError'))
		},
	})

	return (
		<ArtForm
			initial={{
				title: '',
				type: ArtType.DEFAULT,
				imageUrls: [],
				tags: '',
				description: '',
			}}
			isPending={createMutation.isPending}
			onSubmit={(data) => createMutation.mutate(data)}
			submitIcon="lucide:plus"
			submitLabel={t('me.newArt.create')}
			title={t('me.newArt.title')}
		/>
	)
}
