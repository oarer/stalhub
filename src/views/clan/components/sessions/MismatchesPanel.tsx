'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanService } from '@/services/clan/clan.service'
import type { MismatchesResponse } from '@/types/clan/clan.type'

interface Props {
	clanId: string
	screenshotId: number
}

export function MismatchesPanel({ clanId, screenshotId }: Props) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const [selected, setSelected] = useState<Record<string, string>>({})

	const { data, refetch } = useQuery<MismatchesResponse>({
		queryKey: ['clan', clanId, 'mismatches', screenshotId],
		queryFn: () => clanService.findMismatches(screenshotId),
		staleTime: 0,
	})

	const rosterOptions = useMemo<ComboboxOption[]>(
		() =>
			(data?.roster ?? []).map((r) => ({
				value: String(r.id),
				label: `${r.name} (${r.rank})`,
			})),
		[data]
	)

	const resolveMutation = useMutation({
		mutationFn: ({
			detectedName,
			memberId,
		}: {
			detectedName: string
			memberId: string
		}) =>
			clanService.resolveMismatch(
				screenshotId,
				detectedName,
				Number(memberId)
			),
		onSuccess: () => {
			toast.success(t('clan.members.renamed'))
			refetch()
			queryClient.invalidateQueries({
				queryKey: ['clan', clanId, 'sessions'],
			})
		},
		onError: () => toast.error(t('clan.members.renameError')),
	})

	const mismatches = data?.mismatches ?? []

	if (mismatches.length === 0) return null

	return (
		<div className="flex flex-col gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
			<div className="flex items-center gap-2">
				<Icon className="text-amber-400" icon="lucide:triangle-alert" />
				<p className="font-semibold text-sm">
					{t('clan.members.mismatchTitle', {
						count: mismatches.length,
					})}
				</p>
			</div>

			<div className="flex flex-col gap-1.5">
				{mismatches.map((m) => {
					const chosen = selected[m.detected_name]
					return (
						<div
							className="flex flex-wrap items-center gap-2"
							key={m.detected_name}
						>
							<Badge variant="secondary">{m.detected_name}</Badge>
							<Icon
								className="text-text-accent"
								icon="lucide:arrow-right"
							/>
							<Combobox
								className="flex-1"
								onValueChange={(value) =>
									setSelected((s) => ({
										...s,
										[m.detected_name]: value,
									}))
								}
								options={rosterOptions}
								placeholder="clan.members.mismatchSelect"
								translateOptions={false}
								value={chosen ?? ''}
							/>
							<Button
								className="gap-2 py-2.5"
								disabled={!chosen || resolveMutation.isPending}
								onClick={() =>
									resolveMutation.mutate({
										detectedName: m.detected_name,
										memberId: chosen,
									})
								}
								size="sm"
								variant="primary"
							>
								<Icon className="text-sm" icon="lucide:check" />
								{t('clan.members.mismatchApply')}
							</Button>
						</div>
					)
				})}
			</div>
		</div>
	)
}
