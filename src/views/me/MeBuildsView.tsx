'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { CLink } from '@/components/ui/Link'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { buildApiService } from '@/services/build-api/build-api.service'
import { BuildCard } from './components/BuildCard'
import { useItemsData } from './hooks/useItemsData'

export default function MeBuildsView() {
	const queryClient = getQueryClient()
	const t = useTranslations()

	const { data: builds } = useSuspenseQuery(
		buildApiQueries.mine({ take: 50 })
	)
	const { artifacts, armorItems, containers } = useItemsData()

	const deleteMutation = useMutation({
		mutationFn: (id: string) => buildApiService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['builds'] })
			toast.success(t('me.builds.toastDeleted'))
		},
		onError: () => {
			toast.error(t('me.builds.toastDeleteError'))
		},
	})

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-xl">
					{t('me.builds.title')}
				</h1>
				<CLink
					className="gap-2"
					href={'/calcs/builds/lite'}
					variant={'primary'}
				>
					<Icon className="size-4" icon="lucide:plus" />
					{t('me.builds.create')}
				</CLink>
			</div>

			{builds?.data.length === 0 ? (
				<p className="font-semibold text-sm text-text-accent">
					{t('me.builds.noBuilds')}
				</p>
			) : (
				<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
					{builds?.data.map((build) => (
						<BuildCard
							armorItems={armorItems}
							artifacts={artifacts}
							build={build}
							containers={containers}
							key={build.id}
							onDelete={(id) => deleteMutation.mutate(id)}
						/>
					))}
				</div>
			)}
		</div>
	)
}
