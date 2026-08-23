'use client'

import { Icon } from '@iconify/react'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Divider } from '@/components/ui/Divider'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/date'
import { clanService } from '@/services/clan/clan.service'
import type { StageSession, StageSessionDetail } from '@/types/clan/clan.type'
import { ScreenshotStatusList } from './ScreenshotStatusList'
import { SessionSummary } from './SessionSummary'

export function SessionRow({
	session,
	onUpload,
}: {
	session: StageSession
	onUpload: () => void
}) {
	const t = useTranslations()
	const [expanded, setExpanded] = useState(false)
	const [detail, setDetail] = useState<StageSessionDetail | null>(null)

	const refreshDetail = useCallback(async () => {
		const d = await clanService.getSession(session.id)
		setDetail(d)
		return d
	}, [session.id])

	useEffect(() => {
		if (!expanded) return
		let stopped = false
		let wasActive = false
		let timer: ReturnType<typeof setTimeout> | undefined
		const poll = async () => {
			const d = await refreshDetail()
			if (stopped) return
			const hasActive = d?.screenshots.some(
				(s) => s.ai_status === 'pending' || s.ai_status === 'processing'
			)
			if (hasActive) {
				wasActive = true
				timer = setTimeout(poll, 3000)
			} else if (wasActive) {
				onUpload()
			}
		}
		poll()
		return () => {
			stopped = true
			clearTimeout(timer)
		}
	}, [expanded, refreshDetail, onUpload])

	const retryMutation = useMutation({
		mutationFn: async (screenshotId: number) => {
			await clanService.retryScreenshot(screenshotId)
			await refreshDetail()
		},
		onSuccess: () => {
			toast.success(t('clan.sessions.toasts.retrySuccess'))
		},
		onError: () => {
			toast.error(t('clan.sessions.toasts.retryError'))
		},
	})

	const [deleteOpen, setDeleteOpen] = useState(false)
	const deleteMutation = useMutation({
		mutationFn: () => clanService.deleteSession(session.id),
		onSuccess: () => {
			onUpload()
			toast.success(t('clan.sessions.toasts.deleted'))
		},
		onError: () => {
			toast.error(t('clan.sessions.toasts.deleteError'))
		},
	})

	const hasActive = detail?.screenshots.some(
		(s) => s.ai_status === 'pending' || s.ai_status === 'processing'
	)

	return (
		<div className="rounded-lg bg-card px-5 py-4">
			<div className="flex items-start justify-between">
				<button
					className="flex-1 cursor-pointer text-left"
					onClick={() => setExpanded((v) => !v)}
					type="button"
				>
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<h3 className="font-semibold">
								{t(`clan.stage.${session.type}`)} |{' '}
								{session.map_name} | {t('clan.sessions.stage')}{' '}
								{session.stage_number}
							</h3>
							<span
								className={`rounded px-1.5 py-0.5 font-semibold text-xs ${
									session.victory
										? 'bg-green-500/20 text-success'
										: 'bg-red-500/20 text-destructive'
								}`}
							>
								{session.victory
									? t('clan.common.victory')
									: t('clan.common.defeat')}
							</span>
							{session.total_score != null && (
								<Badge
									className={montserrat.className}
									variant={'secondary'}
								>
									{t('clan.sessions.scorePoints', {
										score: session.total_score,
									})}
								</Badge>
							)}
							{hasActive && (
								<Badge
									className="text-primary"
									variant="secondary"
								>
									<Icon
										className="animate-spin text-sm"
										icon="lucide:loader-circle"
									/>
									{t('clan.sessions.analyzing')}
								</Badge>
							)}
						</div>
						<p
							className={`${montserrat.className} font-semibold text-[11px] text-text-accent`}
						>
							{formatDate(session.started_at)}
						</p>
					</div>
				</button>
				<div className="flex items-center gap-3">
					<Modal.Root onOpenChange={setDeleteOpen} open={deleteOpen}>
						<Modal.Trigger
							className="p-2 ring-transparent"
							variant={'danger'}
						>
							<Icon className="text-lg" icon="lucide:trash-2" />
						</Modal.Trigger>
						<Modal.Content className="max-w-md">
							<Modal.Header>
								<Modal.Title>
									{t('clan.sessions.deleteTitle')}
								</Modal.Title>
							</Modal.Header>
							<Modal.Body className="font-semibold">
								{t.rich('clan.sessions.deleteBody', {
									name: session.map_name
										? ` «${session.map_name}»`
										: '',
									date: formatDate(session.started_at),
									span: (chunks) => (
										<span
											className={`${montserrat.className} text-primary text-sm`}
										>
											{chunks}
										</span>
									),
									danger: (chunks) => (
										<span className="text-red-300">
											{chunks}
										</span>
									),
								})}
							</Modal.Body>
							<Modal.Footer>
								<Modal.Close>
									{t('clan.common.cancel')}
								</Modal.Close>
								<Modal.Action
									className="gap-2"
									closeOnClick
									disabled={deleteMutation.isPending}
									onClick={() => deleteMutation.mutate()}
									variant={'danger'}
								>
									{deleteMutation.isPending ? (
										<Icon
											className="animate-spin text-base"
											icon="lucide:loader-circle"
										/>
									) : (
										<Icon
											className="text-base"
											icon="lucide:trash-2"
										/>
									)}
									{t('clan.sessions.deleteConfirm')}
								</Modal.Action>
							</Modal.Footer>
						</Modal.Content>
					</Modal.Root>
					<button
						className="cursor-pointer"
						onClick={() => setExpanded((v) => !v)}
						type="button"
					>
						<Icon
							className={`text-lg text-text-accent transition-transform ${expanded ? 'rotate-90' : ''}`}
							icon="lucide:chevron-right"
						/>
					</button>
				</div>
			</div>

			{expanded && (
				<div className="flex flex-col gap-3 py-3">
					<Divider />
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<p className="font-semibold text-sm">
								{t('clan.sessions.screenshots')}
							</p>
							{session.map_name && (
								<Badge variant="secondary">
									<Icon
										className="text-sm"
										icon="lucide:map-pin"
									/>
									{session.map_name}
								</Badge>
							)}
						</div>
					</div>

					{!detail ? (
						<div className="flex flex-col gap-2">
							{[...Array(2)].map((_, i) => (
								<div
									className="h-10 w-full animate-pulse rounded-lg bg-accent/50"
									key={i}
								/>
							))}
						</div>
					) : (
						<>
							{detail.screenshots.length > 0 && (
								<ScreenshotStatusList
									isRetryPending={retryMutation.isPending}
									onRetry={(screenshotId) =>
										retryMutation.mutate(screenshotId)
									}
									screenshots={detail.screenshots}
								/>
							)}

							{detail.ai_summary && (
								<SessionSummary summary={detail.ai_summary} />
							)}

							{detail.attendance.length > 0 && (
								<>
									<div className="flex items-center justify-between">
										<p className="font-semibold text-sm">
											{t('clan.sessions.attendance')}
										</p>
										<span
											className={`${montserrat.className} font-semibold text-text-accent text-xs`}
										>
											{t('clan.sessions.presentOf', {
												present:
													detail.attendance.filter(
														(a) =>
															a.status ===
															'PRESENT'
													).length,
												total: detail.attendance.length,
											})}
										</span>
									</div>
									<div className="flex flex-wrap gap-2">
										{[...detail.attendance]
											.sort((a, b) => {
												if (a.status === b.status)
													return 0
												return a.status === 'PRESENT'
													? -1
													: 1
											})
											.map((a) => (
												<Badge
													className={
														a.status === 'PRESENT'
															? 'bg-green-500/20 text-success'
															: 'bg-red-500/20 text-destructive'
													}
													key={a.id}
													variant="secondary"
												>
													{a.name ||
														a.user?.name ||
														'—'}
													{a.status === 'ABSENT' &&
														t(
															'clan.sessions.absent'
														)}
												</Badge>
											))}
									</div>
								</>
							)}
						</>
					)}
				</div>
			)}
		</div>
	)
}
