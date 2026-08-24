'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { Table } from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminClanQueries } from '@/queries/admin/clan.queries'
import { adminClanService } from '@/services/admin/clan.service'
import type { SundayActivity } from '@/types/clan/clan.type'
import ClanAdminStagesView from './ClanAdminStagesView'

interface Props {
	clanId: string
}

export default function ClanAdminDetailView({ clanId }: Props) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const { data: clan } = useSuspenseQuery(adminClanQueries.get(clanId))
	const { data: members } = useSuspenseQuery(
		adminClanQueries.getMembers(clanId)
	)

	const [name, setName] = useState(clan?.name ?? '')
	const [tag, setTag] = useState(clan?.tag ?? '')
	const [region, setRegion] = useState(clan?.region ?? 'RU')
	const [description, setDescription] = useState(clan?.description ?? '')
	const [status, setStatus] = useState<'FROZEN' | 'ACTIVE'>(
		clan?.status ?? 'FROZEN'
	)
	const [isPublic, setIsPublic] = useState(clan?.is_public ?? false)
	const [recruiting, setRecruiting] = useState(clan?.recruiting ?? false)
	const [brawls_per_week, setBrawlsPerWeek] = useState(
		clan?.schedule?.brawls_per_week ?? 4
	)
	const [brawls_mandatory, setBrawlsMandatory] = useState(
		clan?.schedule?.brawls_mandatory ?? false
	)
	const [sundayActivity, setSundayActivity] = useState<SundayActivity>(
		clan?.schedule?.sunday_activity ?? 'BRAWL'
	)
	const [blockReason, setBlockReason] = useState('')

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ['admin', 'clan', clanId] })
		queryClient.invalidateQueries({ queryKey: ['admin', 'clans'] })
	}

	const updateMutation = useMutation({
		mutationFn: () =>
			adminClanService.update(clanId, {
				name: name || undefined,
				tag: tag || undefined,
				region: region || undefined,
				description: description || undefined,
				status,
				is_public: isPublic,
				recruiting,
				schedule: {
					brawls_per_week,
					brawls_mandatory,
					sunday_activity: sundayActivity,
				},
			}),
		onSuccess: () => {
			toast.success(t('admin.clans.toast.updated'))
			invalidate()
		},
		onError: () => toast.error(t('admin.clans.toast.updateError')),
	})

	const syncMutation = useMutation({
		mutationFn: () => adminClanService.sync(clanId),
		onSuccess: (res) => {
			toast.success(
				t('admin.clans.toast.synced', { count: res.member_count })
			)
			invalidate()
		},
		onError: () => toast.error(t('admin.clans.toast.syncError')),
	})

	const blockMutation = useMutation({
		mutationFn: () =>
			adminClanService.block(clanId, blockReason || undefined),
		onSuccess: () => {
			toast.success(t('admin.clans.toast.blocked'))
			setBlockReason('')
			invalidate()
		},
		onError: () => toast.error(t('admin.clans.toast.blockError')),
	})

	const unblockMutation = useMutation({
		mutationFn: () => adminClanService.unblock(clanId),
		onSuccess: () => {
			toast.success(t('admin.clans.toast.unblocked'))
			invalidate()
		},
		onError: () => toast.error(t('admin.clans.toast.unblockError')),
	})

	const deleteMutation = useMutation({
		mutationFn: () => adminClanService.delete(clanId),
		onSuccess: () => {
			toast.success(t('admin.clans.toast.deleted'))
			window.location.href = '/admin/clans'
		},
		onError: () => toast.error(t('admin.clans.toast.deleteError')),
	})

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-3">
				<Link href="/admin/clans">
					<Button size="sm" variant="ghost">
						<Icon icon="lucide:arrow-left" />
					</Button>
				</Link>
				<h1 className="font-semibold text-2xl">
					{clan?.name}
					{clan?.tag && (
						<span className="ml-2 text-lg text-neutral-400">
							[{clan.tag}]
						</span>
					)}
				</h1>
				{clan?.blocked ? (
					<Badge variant="danger">
						{t('admin.clans.status.blocked')}
					</Badge>
				) : clan?.status === 'ACTIVE' ? (
					<Badge variant="success">
						{t('admin.clans.status.active')}
					</Badge>
				) : (
					<Badge variant="secondary">
						{t('admin.clans.status.frozen')}
					</Badge>
				)}
			</div>

			<Tabs.Root defaultValue="info">
				<Tabs.List>
					<Tabs.Trigger value="info">
						<Icon icon="lucide:info" />
						{t('admin.clans.detail.tabs.info')}
					</Tabs.Trigger>
					<Tabs.Trigger value="members">
						<Icon icon="lucide:users" />
						{t('admin.clans.detail.tabs.members')} (
						{members?.length ?? 0})
					</Tabs.Trigger>
					<Tabs.Trigger value="stages">
						<Icon icon="lucide:flag" />
						{t('admin.clans.detail.tabs.stages')}
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="info">
					<Card.Root>
						<Card.Header>
							<Card.Title>
								<Icon icon="lucide:shield" />
								{t('admin.clans.detail.editTitle')}
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<div className="flex flex-col gap-4">
								<div className="grid grid-cols-3 gap-3">
									<Input
										label="admin.clans.detail.name"
										onChange={(e) =>
											setName(e.target.value)
										}
										value={name}
									/>
									<Input
										label="admin.clans.detail.tag"
										onChange={(e) => setTag(e.target.value)}
										value={tag}
									/>
									<Input
										label="admin.clans.detail.region"
										onChange={(e) =>
											setRegion(e.target.value)
										}
										value={region}
									/>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<Input
										label="admin.clans.detail.description"
										onChange={(e) =>
											setDescription(e.target.value)
										}
										value={description}
									/>
									<Combobox
										onValueChange={(v) =>
											setStatus(v as 'FROZEN' | 'ACTIVE')
										}
										options={[
											{
												value: 'ACTIVE',
												label: 'admin.clans.status.active',
											},
											{
												value: 'FROZEN',
												label: 'admin.clans.status.frozen',
											},
										]}
										placeholder="admin.clans.detail.status"
										value={status}
									/>
								</div>

								<div className="flex items-center gap-8">
									<Switch
										checked={isPublic}
										label={t(
											'admin.clans.detail.is_public'
										)}
										onCheckedChange={setIsPublic}
									/>
									<Switch
										checked={recruiting}
										label={t(
											'admin.clans.detail.recruiting'
										)}
										onCheckedChange={setRecruiting}
									/>
								</div>

								<div className="flex items-center gap-8">
									<div className="w-40">
										<Input
											label="admin.clans.detail.brawls_per_week"
											max={4}
											min={0}
											onChange={(e) =>
												setBrawlsPerWeek(
													Number(e.target.value)
												)
											}
											type="number"
											value={brawls_per_week}
										/>
									</div>
									<Switch
										checked={brawls_mandatory}
										label={t(
											'admin.clans.detail.brawls_mandatory'
										)}
										onCheckedChange={setBrawlsMandatory}
									/>
									<div className="w-56">
										<Combobox
											onValueChange={(value) =>
												setSundayActivity(
													value as SundayActivity
												)
											}
											options={[
												{
													value: 'BASE_CAPTURE',
													label: 'clan.settings.sundayActivities.baseCapture',
												},
												{
													value: 'BRAWL',
													label: 'clan.settings.sundayActivities.brawl',
												},
												{
													value: 'NONE',
													label: 'clan.settings.sundayActivities.none',
												},
											]}
											placeholder="clan.settings.sundayActivityLabel"
											value={sundayActivity}
										/>
									</div>
								</div>

								{clan?.level ? (
									<div className="flex flex-wrap gap-2 text-neutral-400 text-sm">
										<span>
											{t('admin.clans.detail.level')}:{' '}
											<span className="font-semibold text-neutral-200">
												{clan.level}
											</span>
										</span>
										<span>
											{t(
												'admin.clans.detail.level_points'
											)}
											:{' '}
											<span className="font-semibold text-neutral-200">
												{clan.level_points}
											</span>
										</span>
										<span>
											{t('admin.clans.detail.leader')}:{' '}
											<span className="font-semibold text-neutral-200">
												{clan.leader || '—'}
											</span>
										</span>
										<span>
											{t('admin.clans.detail.alliance')}:{' '}
											<span className="font-semibold text-neutral-200">
												{clan.alliance || '—'}
											</span>
										</span>
									</div>
								) : null}

								<div className="flex items-center gap-3">
									<Button
										loading={updateMutation.isPending}
										onClick={() => updateMutation.mutate()}
									>
										{t('admin.clans.detail.save')}
									</Button>
									<Button
										loading={syncMutation.isPending}
										onClick={() => syncMutation.mutate()}
										variant="outline"
									>
										<Icon icon="lucide:refresh-cw" />
										{t('admin.clans.detail.sync')}
									</Button>
								</div>
							</div>
						</Card.Content>
					</Card.Root>

					{clan?.blocked ? (
						<Card.Root className="mt-4">
							<Card.Header>
								<Card.Title>
									<Icon
										className="text-red-400"
										icon="lucide:shield-alert"
									/>
									{t('admin.clans.detail.block.title')}
								</Card.Title>
							</Card.Header>
							<Card.Content>
								<p className="text-red-400 text-sm">
									{t('admin.clans.detail.block.reason')}:{' '}
									{clan.block_reason || '—'}
								</p>
								<div className="mt-3">
									<Button
										loading={unblockMutation.isPending}
										onClick={() => unblockMutation.mutate()}
									>
										{t('admin.clans.detail.block.unblock')}
									</Button>
								</div>
							</Card.Content>
						</Card.Root>
					) : (
						<Card.Root className="mt-4">
							<Card.Header>
								<Card.Title>
									<Icon
										className="text-red-400"
										icon="lucide:shield-alert"
									/>
									{t('admin.clans.detail.block.title')}
								</Card.Title>
							</Card.Header>
							<Card.Content>
								<div className="flex flex-col gap-4">
									<Input
										label="admin.clans.detail.block.reasonLabel"
										onChange={(e) =>
											setBlockReason(e.target.value)
										}
										value={blockReason}
									/>
									<div className="flex items-center gap-3">
										<Button
											loading={blockMutation.isPending}
											onClick={() =>
												blockMutation.mutate()
											}
											variant="danger"
										>
											{t(
												'admin.clans.detail.block.confirm'
											)}
										</Button>
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					)}

					<Card.Root className="mt-4">
						<Card.Header>
							<Card.Title>
								<Icon
									className="text-red-400"
									icon="lucide:trash-2"
								/>
								{t('admin.clans.detail.delete.title')}
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<Modal.Root>
								<Modal.Trigger variant="danger">
									{t('admin.clans.detail.delete.trigger')}
								</Modal.Trigger>
								<Modal.Content fullScreen={false}>
									<Modal.Header>
										<Modal.Title>
											{t(
												'admin.clans.detail.delete.confirmTitle'
											)}
										</Modal.Title>
										<Modal.Description>
											{t(
												'admin.clans.detail.delete.description',
												{ name: clan?.name }
											)}
										</Modal.Description>
									</Modal.Header>
									<Modal.Footer>
										<Modal.Close>
											{t('admin.clans.detail.cancel')}
										</Modal.Close>
										<Modal.Action
											closeOnClick
											onClick={() =>
												deleteMutation.mutate()
											}
											variant="danger"
										>
											{t(
												'admin.clans.detail.delete.confirm'
											)}
										</Modal.Action>
									</Modal.Footer>
								</Modal.Content>
							</Modal.Root>
						</Card.Content>
					</Card.Root>
				</Tabs.Content>

				<Tabs.Content value="members">
					<Card.Root className="overflow-hidden p-0">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>
										{t('admin.clans.detail.members.name')}
									</Table.Head>
									<Table.Head>
										{t('admin.clans.detail.members.rank')}
									</Table.Head>
									<Table.Head>
										{t('admin.clans.detail.members.joined')}
									</Table.Head>
									<Table.Head>
										{t('admin.clans.detail.members.user')}
									</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{members?.map((member) => (
									<Table.Row key={member.id}>
										<Table.Cell>
											<span className="font-semibold">
												{member.name}
											</span>
										</Table.Cell>
										<Table.Cell>{member.rank}</Table.Cell>
										<Table.Cell>
											{member.join_time
												? new Date(
														member.join_time
													).toLocaleDateString(
														'ru-RU'
													)
												: '—'}
										</Table.Cell>
										<Table.Cell>
											{member.user ? (
												<Link
													className="text-sky-400 hover:underline"
													href={`/admin/users/${member.user.id}`}
												>
													{member.user.username ||
														member.user.name}
												</Link>
											) : (
												'—'
											)}
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Root>
					</Card.Root>
				</Tabs.Content>

				<Tabs.Content value="stages">
					<ClanAdminStagesView clanId={clanId} />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	)
}
