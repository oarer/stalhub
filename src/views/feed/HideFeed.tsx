'use client'

import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { buildApiService } from '@/services/build-api/build-api.service'
import { tierListService } from '@/services/tier-list/tier-list.service'
import { ActionMenuItem } from './ActionMenu'

export function useHideFeed({
	type,
	id,
	hidden,
}: {
	type: 'build' | 'tier_list'
	id: string
	hidden?: boolean
}) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	return useMutation({
		mutationFn: () =>
			type === 'build'
				? hidden
					? buildApiService.showInFeed(id)
					: buildApiService.hideFromFeed(id)
				: hidden
					? tierListService.showInFeed(id)
					: tierListService.hideFromFeed(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: type === 'build' ? ['build', id] : ['tier-lists', id],
			})
			queryClient.invalidateQueries({ queryKey: ['feed'] })
			toast.success(
				t(hidden ? 'feed.hide.showSuccess' : 'feed.hide.hideSuccess')
			)
		},
	})
}

export function HideFeedMenuItem({
	type,
	id,
	hidden,
	onDone,
}: {
	type: 'build' | 'tier_list'
	id: string
	hidden?: boolean
	onDone?: () => void
}) {
	const t = useTranslations()
	const mutation = useHideFeed({ type, id, hidden })
	return (
		<ActionMenuItem
			close={onDone}
			disabled={mutation.isPending}
			icon={hidden ? 'lucide:eye' : 'lucide:eye-off'}
			onClick={() => mutation.mutate()}
		>
			{t(hidden ? 'feed.hide.show' : 'feed.hide.hide')}
		</ActionMenuItem>
	)
}
