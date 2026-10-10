'use client'

import { Icon } from '@iconify/react'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Divider } from '@/components/ui/Divider'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/date'
import { personalService } from '@/services/personal/personal.service'
import type { StageSessionDetail } from '@/types/clan/clan.type'
import type { PersonalSession } from '@/types/personal/personal.type'
import { ScreenshotStatusList } from '@/views/clan/components/sessions/ScreenshotStatusList'
import { SessionSummary } from '@/views/clan/components/sessions/SessionSummary'

export function PersonalSessionRow({
	session,
	onChanged,
}: {
	session: PersonalSession
	onChanged: () => void
}) {
	const t = useTranslations()
	const [expanded, setExpanded] = useState(false)
	const [detail, setDetail] = useState<StageSessionDetail | null>(null)

	const refreshDetail = useCallback(async () => {
		const d = (await personalService.getSession(
			session.id
		)) as StageSessionDetail | null
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
				onChanged()
			}
		}
		poll()
		return () => {
			stopped = true
			clearTimeout(timer)
		}
	}, [expanded, refreshDetail, onChanged])

	const retryMutation = useMutation({
		mutationFn: async (screenshotId: number) => {
			await personalService.retryScreenshot(screenshotId)
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
		mutationFn: () => personalService.deleteSession(session.id),
		onSuccess: () => {
			onChanged()
			toast.success(t('clan.sessions.toasts.deleted'))
		},
		onError: () => {
			toast.error(t('clan.sessions.toasts.deleteError'))
		},
	})

	const hasActive = detail?.screenshots.some(
		(s) => s.ai_status === 'pending' || s.ai_status === 'processing'
	)
	const shotCount = session._count?.screenshots ?? 0

	return (
		<div className="rounded-lg bg-card px-5 py-4">
			<div className="flex items-start justify-between">
				<button
					className="flex-1 cursor-pointer text-left"
					onClick={() => setExpanded((v) => !v)}
					type="button"
				>
					<div className="flex flex-col gap-1">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="font-semibold">
								{t(`clan.stage.${session.type}`)} |{' '}
								{session.map_name} | {t('clan.sessions.stage')}{' '}
								{session.stage_number ?? '—'}
							</h3>
							{session.victory === true ? (
								<span className="rounded bg-green-500/20 px-1.5 py-0.5 font-semibold text-success text-xs">
									{t('clan.common.victory')}
								</span>
							) : session.victory === false ? (
								<span className="rounded bg-red-500/20 px-1.5 py-0.5 font-semibold text-destructive text-xs">
									{t('clan.common.defeat')}
								</span>
							) : null}
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
							{shotCount === 0 && (
								<Badge variant="secondary">
									<Icon
										className="text-sm"
										icon="lucide:image-plus"
									/>
									{t('personal.noScreenshotsShort')}
								</Badge>
							)}
						</div>
						<p className="font-mono font-semibold text-[11px] text-foreground">
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
							<Modal.Body>
								{t.rich('clan.sessions.deleteBody', {
									name: session.map_name
										? ` «${session.map_name}»`
										: '',
									date: formatDate(session.started_at),
									span: (chunks) => (
										<span className="font-mono font-semibold text-primary text-sm">
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
							className={`text-foreground text-lg transition-transform ${expanded ? 'rotate-90' : ''}`}
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
						{shotCount === 0 && detail && (
							<UploadIntoSession
								onUploaded={refreshDetail}
								sessionId={session.id}
							/>
						)}
					</div>

					{!detail ? (
						<div className="flex flex-col gap-2">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
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
						</>
					)}
				</div>
			)}
		</div>
	)
}

function UploadIntoSession({
	sessionId,
	onUploaded,
}: {
	sessionId: number
	onUploaded: () => void
}) {
	const t = useTranslations()
	const [busy, setBusy] = useState(false)
	const uploadMutation = useMutation({
		mutationFn: (file: File) =>
			personalService.uploadScreenshot(sessionId, file),
		onSuccess: () => {
			toast.success(t('clan.sessions.toasts.uploaded'))
			onUploaded()
		},
		onError: () => {
			toast.error(t('clan.sessions.toasts.uploadError'))
		},
	})

	return (
		<label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-primary/50 border-dashed px-3 py-2 font-semibold text-sm transition-colors hover:bg-accent/10">
			{busy || uploadMutation.isPending ? (
				<Icon
					className="animate-spin text-base"
					icon="lucide:loader-circle"
				/>
			) : (
				<Icon className="text-base" icon="lucide:image-plus" />
			)}
			{t('clan.sessions.selectFile')}
			<input
				accept="image/png,image/jpeg,image/webp"
				className="hidden"
				disabled={busy || uploadMutation.isPending}
				onChange={(e) => {
					const f = e.target.files?.[0]
					if (!f) return
					setBusy(true)
					uploadMutation.mutate(f, {
						onSettled: () => setBusy(false),
					})
					e.target.value = ''
				}}
				type="file"
			/>
		</label>
	)
}
