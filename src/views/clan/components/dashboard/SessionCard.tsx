'use client'

import { Icon } from '@iconify/react'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import type { StageSession } from '@/types/clan/clan.type'
import { STAGE_TYPE_COLORS } from '@/views/clan/clan.const'

export function SessionCard({ session }: { session: StageSession }) {
	const queryClient = getQueryClient()
	const t = useTranslations()

	const uploadMutation = useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData()
			formData.append('file', file)
			const { default: axios } = await import('axios')
			const { data } = await axios.post(
				`${process.env.NEXT_PUBLIC_API}/api/v1/clan/analytics/sessions/${session.id}/screenshots`,
				formData,
				{ withCredentials: true }
			)
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'sessions'] })
			toast.success(t('clan.dashboard.screenshotUploaded'))
		},
		onError: () => {
			toast.error(t('clan.dashboard.screenshotUploadError'))
		},
	})

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		uploadMutation.mutate(file)
		e.target.value = ''
	}

	return (
		<div className="rounded-lg border border-border/40 bg-background/30 p-3">
			<div className="flex items-start justify-between">
				<div className="flex flex-col gap-0.5">
					<div className="flex items-center gap-2">
						<Badge
							className={STAGE_TYPE_COLORS[session.type] ?? ''}
							variant="secondary"
						>
							{t(`clan.stage.${session.type}`)}
						</Badge>
						<span
							className={`rounded px-1.5 py-0.5 font-semibold text-xs ${
								session.victory
									? 'bg-green-500/20 text-green-600 dark:text-green-400'
									: 'bg-red-500/20 text-red-600 dark:text-red-400'
							}`}
						>
							{session.victory
								? t('clan.common.victory')
								: t('clan.common.defeat')}
						</span>
						<span className="font-semibold">{session.mapName}</span>
					</div>
					<p
						className={`${montserrat.className} font-semibold text-[11px] text-text-accent`}
					>
						{formatDate(session.startedAt)}
					</p>
				</div>
				<div className="flex items-center gap-3">
					<label
						className={`inline-flex cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 font-medium text-sm transition-all duration-400 ease-in-out ${
							uploadMutation.isPending
								? 'cursor-not-allowed brightness-80'
								: 'bg-white/60 text-neutral-900 shadow-sm hover:brightness-120 dark:bg-neutral-800/50 dark:text-neutral-100'
						}`}
					>
						<input
							accept="image/png,image/jpeg,image/webp"
							className="hidden"
							disabled={uploadMutation.isPending}
							onChange={handleFileChange}
							type="file"
						/>
						{uploadMutation.isPending ? (
							<Icon
								className="animate-spin text-base"
								icon="lucide:loader-circle"
							/>
						) : (
							<Icon className="text-base" icon="lucide:upload" />
						)}
					</label>
				</div>
			</div>
		</div>
	)
}
