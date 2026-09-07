'use client'

import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanService } from '@/services/clan/clan.service'

export function useClanMemberMutations(clanId: string) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: ['clan', clanId, 'members'],
		})
		queryClient.invalidateQueries({ queryKey: ['clan', clanId, 'squads'] })
	}

	const renameMutation = useMutation({
		mutationFn: ({ memberId, name }: { memberId: number; name: string }) =>
			clanService.updateMemberName(memberId, name),
		onSuccess: () => {
			toast.success(t('clan.members.renamed'))
			invalidate()
		},
		onError: () => toast.error(t('clan.members.renameError')),
	})

	const deleteMutation = useMutation({
		mutationFn: (memberId: number) => clanService.deleteMember(memberId),
		onSuccess: () => {
			toast.success(t('clan.members.deleted'))
			invalidate()
		},
		onError: () => toast.error(t('clan.members.deleteError')),
	})

	return { renameMutation, deleteMutation }
}
