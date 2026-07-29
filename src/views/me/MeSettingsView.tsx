'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { toast } from '@/components/ui/Toast'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import { dateSince } from '@/lib/time'
import { getQueryClient } from '@/providers/QueryProvider'
import { userQueries } from '@/queries/user/user.queries'
import { userService } from '@/services/user/user.service'

export default function MeSettingsView() {
	const queryClient = getQueryClient()
	const { data: user } = useSuspenseQuery(userQueries.getMe())
	const { data: settings } = useSuspenseQuery(userQueries.getSettings())
	const { data: sessions } = useSuspenseQuery(userQueries.getSessions())

	const t = useTranslations()

	const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
	const [deleteConfirmNickname, setDeleteConfirmNickname] = useState('')

	const updateMutation = useMutation({
		mutationFn: (data: { public_profile?: boolean; avatar?: string }) =>
			userService.patchMe(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
			toast.success('Настройки сохранены')
		},
		onError: () => {
			toast.error('Ошибка при сохранении')
		},
	})

	const deleteSessionMutation = useMutation({
		mutationFn: (id: number) => userService.deleteSession(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user', 'sessions'] })
			toast.success('Сессия удалена')
		},
		onError: () => {
			toast.error('Ошибка при удалении сессии')
		},
	})

	const deleteAllSessionsMutation = useMutation({
		mutationFn: () => userService.deleteAllSessions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user', 'sessions'] })
			toast.success('Все сессии удалены')
		},
		onError: () => {
			toast.error('Ошибка при удалении сессий')
		},
	})

	const linkMutation = useMutation({
		mutationFn: (provider: 'discord' | 'telegram' | 'exbo') =>
			userService.getProviderLinkUrl(provider),
		onSuccess: (url) => {
			window.location.href = url
		},
		onError: () => {
			toast.error('Ошибка при привязке')
		},
	})

	const unlinkMutation = useMutation({
		mutationFn: (provider: 'discord' | 'telegram' | 'exbo') =>
			userService.unlinkProvider(provider),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
			toast.success('Аккаунт отвязан')
		},
		onError: () => {
			toast.error('Ошибка при отвязке')
		},
	})

	const deleteAccountMutation = useMutation({
		mutationFn: () => userService.deleteMe(),
		onSuccess: () => {
			toast.success('Аккаунт удалён')
			window.location.href = '/'
		},
		onError: () => {
			toast.error('Ошибка при удалении аккаунта')
		},
	})

	return (
		<div className="flex flex-col gap-4">
			<section className="flex flex-col gap-4">
				<h2 className="font-semibold text-lg">Профиль</h2>

				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between rounded-lg bg-background p-4">
						<div className="flex flex-col gap-1">
							<span className="font-semibold text-sm">
								Публичный профиль
							</span>
							<span className="font-semibold text-text-accent text-xs">
								Другие пользователи смогут видеть ваш профиль
							</span>
						</div>
						<Switch
							checked={user.settings?.public_profile}
							onCheckedChange={() =>
								updateMutation.mutate({
									public_profile: !settings?.public_profile,
								})
							}
						/>
					</div>
				</div>
			</section>

			<section className="flex flex-col gap-4">
				<h2 className="font-semibold text-lg">Привязка аккаунтов</h2>

				<div className="flex flex-col gap-2">
					{(['discord', 'telegram', 'exbo'] as const).map(
						(provider) => {
							const isLinked = user?.providers[provider] !== null

							return (
								<div
									className="flex items-center justify-between rounded-lg bg-background p-4"
									key={provider}
								>
									<div className="flex items-center gap-3">
										<Image
											alt={`${provider} link`}
											height={20}
											src={`/images/other/${provider}.png`}
											width={20}
										/>
										<span className="font-semibold text-sm capitalize">
											{provider}
										</span>
									</div>

									{isLinked ? (
										<Button
											className="ring-0"
											onClick={() =>
												unlinkMutation.mutate(provider)
											}
											variant="danger"
										>
											<Icon icon="lucide:unlink" />
										</Button>
									) : (
										<Button
											onClick={() =>
												linkMutation.mutate(provider)
											}
											variant="ghost"
										>
											<Icon icon="lucide:link" />
										</Button>
									)}
								</div>
							)
						}
					)}
				</div>
			</section>

			<section className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-lg">Сессии</h2>
					{sessions && sessions.length > 1 && (
						<Button
							onClick={() => deleteAllSessionsMutation.mutate()}
							size="sm"
							variant="ghost"
						>
							Завершить все
						</Button>
					)}
				</div>

				<div className="grid grid-cols-1 gap-2 md:grid-cols-3">
					{sessions?.map((session) => (
						<div
							className={cn(
								'flex flex-col gap-2 rounded-lg bg-background p-4',
								session.is_self && 'border-2 border-border/50'
							)}
							key={session.id}
						>
							<div className="flex flex-col gap-1">
								<span
									className={`${montserrat.className} font-semibold text-sm`}
								>
									{session.browser} ·{' '}
									{session.browser_version}
								</span>
							</div>
							{session.ip && (
								<p
									className={`${montserrat.className} font-semibold text-text-accent text-xs`}
								>
									IP:{' '}
									<span className="blur-xs transition-all hover:blur-none">
										{session.ip}
									</span>
								</p>
							)}
							<p
								className={`${montserrat.className} font-semibold text-text-accent text-xs`}
							>
								<Tooltip.Root>
									<Tooltip.Trigger>
										{dateSince(session.last_accessed, t)}{' '}
										назад
									</Tooltip.Trigger>
									<Tooltip.Content>
										{formatDate(session.last_accessed)}
									</Tooltip.Content>
								</Tooltip.Root>
							</p>
							<Button
								className="w-full py-1"
								onClick={() =>
									deleteSessionMutation.mutate(session.id)
								}
								variant={'danger'}
							>
								<Icon
									className="text-lg text-red-400"
									icon="lucide:x"
								/>
							</Button>
						</div>
					))}
				</div>
			</section>

			<section className="flex flex-col gap-4">
				<h2 className="font-semibold text-lg text-red-400">
					Опасная зона
				</h2>

				<div className="rounded-lg border-2 border-red-500/20 bg-background p-4">
					<div className="flex items-center justify-between">
						<div className="flex flex-col gap-1">
							<span className="font-semibold text-sm">
								Удалить аккаунт
							</span>
							<span className="font-semibold text-red-400 text-xs">
								Это действие нельзя отменить
							</span>
						</div>
						<Button
							onClick={() => setIsDeleteAccountOpen(true)}
							variant="danger"
						>
							Удалить
						</Button>
					</div>
				</div>
			</section>

			<Modal.Root
				onOpenChange={(open) => {
					setIsDeleteAccountOpen(open)
					if (!open) setDeleteConfirmNickname('')
				}}
				open={isDeleteAccountOpen}
			>
				<Modal.Content
					background="bg-linear-to-t from-red-400/20 to-neutral-white/20"
					className="max-w-120"
				>
					<Modal.Header>
						<Modal.Title className="font-bold">
							Удалить аккаунт?
						</Modal.Title>
						<Modal.Description className="font-semibold">
							Это действие нельзя отменить. Все ваши данные будут
							удалены. Введите ваш ник{' '}
							<span className="font-bold text-red-400">
								{user?.username}
							</span>{' '}
							для подтверждения.
						</Modal.Description>
					</Modal.Header>
					<Modal.Body>
						<Input
							className="w-full rounded-lg border border-red-500/20 bg-background px-3 py-2 text-sm outline-none focus:border-red-500/50"
							onChange={(e) =>
								setDeleteConfirmNickname(e.target.value)
							}
							placeholder="Ведите сюда"
							value={deleteConfirmNickname}
						/>
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>Отмена</Modal.Close>
						<Button
							disabled={deleteConfirmNickname !== user?.username}
							onClick={() => deleteAccountMutation.mutate()}
							variant="danger"
						>
							Удалить аккаунт
						</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
