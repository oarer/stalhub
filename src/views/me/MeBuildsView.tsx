'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { CLink } from '@/components/ui/Link'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { buildApiService } from '@/services/build-api/build-api.service'
import { BuildCard } from './components/BuildCard'

export default function MeBuildsView() {
	const queryClient = getQueryClient()

	const { data: builds } = useSuspenseQuery(
		buildApiQueries.list({ take: 50 })
	)
	const { data: artifacts } = useSuspenseQuery(
		itemsQueries.get({ type: 'artefact' })
	)
	const { data: armorItems } = useSuspenseQuery(
		itemsQueries.get({ type: 'armor' })
	)
	const { data: containers } = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)

	const deleteMutation = useMutation({
		mutationFn: (id: string) => buildApiService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['builds'] })
			toast.success('Сборка удалена')
		},
		onError: () => {
			toast.error('Ошибка при удалении')
		},
	})

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-xl">Сборки</h1>
				<CLink
					className="gap-2"
					href={'/calcs/builds/lite'}
					variant={'primary'}
				>
					<Icon className="size-4" icon="lucide:plus" />
					Создать
				</CLink>
			</div>

			{builds?.data.length === 0 ? (
				<p className="font-semibold text-sm text-text-accent">
					Нет сборок
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
