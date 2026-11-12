'use client'

import { Icon } from '@iconify/react'
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/date'
import { adminUnoQueries } from '@/queries/admin/uno.queries'
import { adminUnoService } from '@/services/admin/uno.service'
import type { AdminUnoBanInput } from '@/types/admin.type'
import { AdminEmptyRow } from '../components/AdminTable'

const QUERY_KEY = ['admin', 'uno']

const numberFmt = new Intl.NumberFormat()

const IP_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/

const getBanError = (err: unknown): string | null => {
	if (isAxiosError(err)) {
		const data = err.response?.data as { error?: string } | undefined
		if (data?.error) return data.error
	}
	return null
}

export default function UnoAdminView() {
	const t = useTranslations()
	const queryClient = useQueryClient()

	const { data: bans } = useSuspenseQuery(adminUnoQueries.bans())
	const { data: stats } = useSuspenseQuery(adminUnoQueries.ipStats())

	const [ip, setIp] = useState('')
	const [reason, setReason] = useState('')
	const [formError, setFormError] = useState<string | null>(null)
	const [banTarget, setBanTarget] = useState<string | null>(null)
	const [banTargetReason, setBanTargetReason] = useState('')
	const [unbanTarget, setUnbanTarget] = useState<string | null>(null)

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: QUERY_KEY })

	const resetForm = () => {
		setIp('')
		setReason('')
		setFormError(null)
	}

	const banMutation = useMutation({
		mutationFn: (input: AdminUnoBanInput) => adminUnoService.ban(input),
		onSuccess: (_data, input) => {
			toast.success(t('admin.uno.toast.banned', { ip: input.ip }))
			resetForm()
			setBanTarget(null)
			setBanTargetReason('')
			invalidate()
		},
		onError: (err) => {
			const message = getBanError(err)
			if (message) setFormError(message)
			else toast.error(t('admin.uno.toast.error'))
		},
	})

	const unbanMutation = useMutation({
		mutationFn: (target: string) => adminUnoService.unban(target),
		onSuccess: (_data, target) => {
			toast.success(t('admin.uno.toast.unbanned', { ip: target }))
			setUnbanTarget(null)
			invalidate()
		},
		onError: () => toast.error(t('admin.uno.toast.error')),
	})

	const submitBan = () => {
		const trimmed = ip.trim()
		if (!trimmed || !IP_PATTERN.test(trimmed)) {
			setFormError(t('admin.uno.bans.form.invalid'))
			return
		}
		setFormError(null)
		banMutation.mutate({
			ip: trimmed,
			reason: reason.trim() || undefined,
		})
	}

	const confirmBanTarget = () => {
		if (!banTarget) return
		setFormError(null)
		banMutation.mutate({
			ip: banTarget,
			reason: banTargetReason.trim() || undefined,
		})
	}

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
				>
					{t('admin.uno.title')}
				</h1>
				<p className="mt-1 text-neutral-400 text-sm">
					{t('admin.uno.subtitle')}
				</p>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:shield-ban" />
						{t('admin.uno.bans.title')}
					</Card.Title>
				</Card.Header>
				<Card.Content className="flex flex-col gap-3">
					<div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-end">
						<div className="w-full flex-1 md:w-56">
							<Input
								label="admin.uno.bans.form.ip"
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => setIp(e.target.value)}
								value={ip}
							/>
						</div>
						<div className="w-full flex-1 md:w-72">
							<Input
								label="admin.uno.bans.form.reason"
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => setReason(e.target.value)}
								value={reason}
							/>
						</div>
						<Button
							disabled={banMutation.isPending}
							loading={banMutation.isPending}
							onClick={submitBan}
						>
							{t('admin.uno.bans.form.submit')}
						</Button>
					</div>
					{formError && (
						<p className="text-rose-400 text-xs">{formError}</p>
					)}

					<div className="overflow-x-auto">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>
										{t('admin.uno.bans.table.ip')}
									</Table.Head>
									<Table.Head>
										{t('admin.uno.bans.table.reason')}
									</Table.Head>
									<Table.Head>
										{t('admin.uno.bans.table.date')}
									</Table.Head>
									<Table.Head>
										{t('admin.uno.bans.table.bannedBy')}
									</Table.Head>
									<Table.Head />
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{bans.items.map((ban) => (
									<Table.Row key={ban.ip}>
										<Table.Cell>
											<span className="font-mono text-sm">
												{ban.ip}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span className="max-w-64 truncate text-neutral-400 text-xs">
												{ban.reason || '—'}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span className="text-neutral-400 text-xs">
												{formatDate(
													ban.banned_at,
													'datetime'
												)}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span className="text-neutral-400 text-xs">
												{ban.banned_by ?? '—'}
											</span>
										</Table.Cell>
										<Table.Cell>
											<Button
												disabled={
													unbanMutation.isPending
												}
												onClick={() =>
													setUnbanTarget(ban.ip)
												}
												size="sm"
												variant="danger"
											>
												{t('admin.uno.bans.unban')}
											</Button>
										</Table.Cell>
									</Table.Row>
								))}
								{bans.items.length === 0 && (
									<AdminEmptyRow
										colCount={5}
										message={t('admin.uno.bans.empty')}
									/>
								)}
							</Table.Body>
						</Table.Root>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<Card.Title>
							<Icon icon="lucide:activity" />
							{t('admin.uno.stats.title')}
						</Card.Title>
						<div className="flex flex-wrap items-center gap-3 text-neutral-400 text-xs">
							<span>
								{t('admin.uno.stats.total', {
									count: numberFmt.format(stats.total_ips),
								})}
							</span>
							<span>
								{t('admin.uno.stats.updatedAt', {
									date: formatDate(
										stats.generated_at,
										'datetime'
									),
								})}
							</span>
						</div>
					</div>
				</Card.Header>
				<Card.Content>
					<div className="overflow-x-auto">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>
										{t('admin.uno.stats.table.ip')}
									</Table.Head>
									<Table.Head>
										{t('admin.uno.stats.table.hits')}
									</Table.Head>
									<Table.Head>
										{t('admin.uno.stats.table.status')}
									</Table.Head>
									<Table.Head />
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{stats.items.map((stat) => (
									<Table.Row key={stat.ip}>
										<Table.Cell>
											<span className="font-mono text-sm">
												{stat.ip}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span className="font-medium font-mono text-sm">
												{numberFmt.format(stat.hits)}
											</span>
										</Table.Cell>
										<Table.Cell>
											<div className="flex flex-wrap gap-1.5">
												{stat.manual_banned && (
													<span className="rounded-full bg-rose-500/10 px-2 py-0.5 font-medium text-rose-400 text-xs">
														{t(
															'admin.uno.stats.badge.manual'
														)}
													</span>
												)}
												{stat.auto_blocked && (
													<span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-400 text-xs">
														{t(
															'admin.uno.stats.badge.auto'
														)}
													</span>
												)}
												{!stat.manual_banned &&
													!stat.auto_blocked && (
														<span className="text-neutral-400 text-xs">
															—
														</span>
													)}
											</div>
										</Table.Cell>
										<Table.Cell>
											<Button
												disabled={
													stat.manual_banned ||
													banMutation.isPending
												}
												onClick={() => {
													setBanTarget(stat.ip)
													setBanTargetReason('')
													setFormError(null)
												}}
												size="sm"
												variant="danger"
											>
												{t('admin.uno.stats.ban')}
											</Button>
										</Table.Cell>
									</Table.Row>
								))}
								{stats.items.length === 0 && (
									<AdminEmptyRow
										colCount={4}
										message={t('admin.uno.stats.empty')}
									/>
								)}
							</Table.Body>
						</Table.Root>
					</div>
				</Card.Content>
			</Card.Root>

			<Modal.Root
				onOpenChange={(o) => {
					if (!o) setUnbanTarget(null)
				}}
				open={!!unbanTarget}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('admin.uno.bans.confirmTitle')}
						</Modal.Title>
						<Modal.Description>
							{t('admin.uno.bans.confirmDescription', {
								ip: unbanTarget ?? '',
							})}
						</Modal.Description>
					</Modal.Header>
					<Modal.Footer>
						<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
						<Modal.Action
							closeOnClick
							disabled={unbanMutation.isPending}
							onClick={() =>
								unbanTarget && unbanMutation.mutate(unbanTarget)
							}
							variant="danger"
						>
							{t('admin.uno.bans.unban')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>

			<Modal.Root
				onOpenChange={(o) => {
					if (!o) setBanTarget(null)
				}}
				open={!!banTarget}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>{t('admin.uno.bans.title')}</Modal.Title>
						<Modal.Description className="font-mono">
							{banTarget}
						</Modal.Description>
					</Modal.Header>
					<Modal.Footer>
						<div className="w-full">
							<Input
								label="admin.uno.bans.form.reason"
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>
								) => setBanTargetReason(e.target.value)}
								value={banTargetReason}
							/>
						</div>
						{formError && (
							<p className="text-rose-400 text-xs">{formError}</p>
						)}
						<Modal.Action
							closeOnClick
							disabled={banMutation.isPending}
							onClick={confirmBanTarget}
							variant="danger"
						>
							{t('admin.uno.bans.form.submit')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
