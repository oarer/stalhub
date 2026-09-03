'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminPlayerService } from '@/services/admin/player.service'

const PLAYER_ROLES = [
	{ value: 'EXBO', label: 'EXBO' },
	{ value: 'SCAMMER', label: 'SCAMMER' },
	{ value: 'MEDIA', label: 'MEDIA' },
	{ value: 'STALHUB', label: 'STALHUB' },
	{ value: 'SPONSOR', label: 'SPONSOR' },
	{ value: 'HELPER', label: 'HELPER' },
	{ value: 'BUGBOUNTY', label: 'BUGBOUNTY' },
] as const

type PlayerRoleValue = (typeof PLAYER_ROLES)[number]['value']

export default function PlayersAdminView() {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const [selectedRole, setSelectedRole] = useState<PlayerRoleValue>('STALHUB')

	const { data: players } = useSuspenseQuery({
		queryKey: ['admin', 'players', selectedRole],
		queryFn: () => adminPlayerService.getByRole(selectedRole),
	})

	const { data: blacklist } = useSuspenseQuery({
		queryKey: ['admin', 'players', 'blacklist'],
		queryFn: () => adminPlayerService.getBlacklist(),
	})

	const [addUuid, setAddUuid] = useState('')
	const [addDescription, setAddDescription] = useState('')
	const [addRole, setAddRole] = useState<PlayerRoleValue>('STALHUB')
	const [blacklistUuid, setBlacklistUuid] = useState('')

	const addMutation = useMutation({
		mutationFn: () =>
			adminPlayerService.create({
				uuid: addUuid,
				description: addDescription,
				role: addRole,
			}),
		onSuccess: () => {
			toast.success(t('admin.players.toast.added'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'players'],
			})
			setAddUuid('')
			setAddDescription('')
		},
		onError: () => toast.error(t('admin.players.toast.addError')),
	})

	const blacklistAddMutation = useMutation({
		mutationFn: (uuid: string) => adminPlayerService.addToBlacklist(uuid),
		onSuccess: () => {
			toast.success(t('admin.players.toast.blacklisted'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'players', 'blacklist'],
			})
			setBlacklistUuid('')
		},
		onError: () => toast.error(t('admin.players.toast.blacklistAddError')),
	})

	const blacklistRemoveMutation = useMutation({
		mutationFn: (uuid: string) =>
			adminPlayerService.removeFromBlacklist(uuid),
		onSuccess: () => {
			toast.success(t('admin.players.toast.blacklistRemoved'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'players', 'blacklist'],
			})
		},
		onError: () =>
			toast.error(t('admin.players.toast.blacklistRemoveError')),
	})

	return (
		<div className="flex flex-col gap-6">
			<h1 className="font-semibold text-2xl">
				{t('admin.players.title')}
			</h1>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:plus" />
						{t('admin.players.add')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col items-stretch gap-3 md:flex-row md:items-end">
							<div className="flex-1">
								<Input
									label="UUID"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setAddUuid(e.target.value)}
									value={addUuid}
								/>
							</div>
							<div className="w-full md:w-48">
								<Combobox
									onValueChange={(v) =>
										setAddRole(v as PlayerRoleValue)
									}
									options={PLAYER_ROLES.map((r) => ({
										value: r.value,
										label: r.label,
									}))}
									placeholder={t('admin.players.role')}
									value={addRole}
								/>
							</div>
						</div>
						<div className="flex flex-col items-stretch gap-3 md:flex-row md:items-end">
							<div className="flex-1">
								<Input
									label="admin.permissions.description"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setAddDescription(e.target.value)}
									value={addDescription}
								/>
							</div>
							<Button
								disabled={!addUuid || !addDescription}
								loading={addMutation.isPending}
								onClick={() => addMutation.mutate()}
							>
								{t('admin.players.addBtn')}
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<div>
				<div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
					<h2 className="font-semibold text-lg">
						{t('admin.players.rolesTitle')}
					</h2>
					<Combobox
						className="w-full sm:w-48"
						onValueChange={(v) =>
							setSelectedRole(v as PlayerRoleValue)
						}
						options={PLAYER_ROLES.map((r) => ({
							value: r.value,
							label: r.label,
						}))}
						placeholder={t('admin.players.role')}
						value={selectedRole}
					/>
				</div>

				<Card.Root className="overflow-hidden p-0">
					<div className="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>UUID</Table.Head>
								<Table.Head>
									{t('admin.players.role')}
								</Table.Head>
								<Table.Head>
									{t('admin.permissions.description')}
								</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{players && players.length > 0 ? (
								players.map((player, i) => (
									<Table.Row
										key={`${player.uuid}-${i.toString()}`}
									>
										<Table.Cell>
											<span className="font-mono text-xs">
												{player.uuid}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span className="rounded-full bg-sky-400/10 px-2 py-0.5 font-semibold text-sky-400 text-xs">
												{player.role}
											</span>
										</Table.Cell>
										<Table.Cell>
											{player.description}
										</Table.Cell>
									</Table.Row>
								))
							) : (
								<Table.Row>
									<Table.Cell>
										<span className="text-neutral-400 text-sm">
											{t('admin.players.empty')}
										</span>
									</Table.Cell>
									<Table.Cell />
									<Table.Cell />
								</Table.Row>
							)}
					</Table.Body>
					</Table.Root>
					</div>
				</Card.Root>
			</div>

			<div>
				<h2 className="mb-4 font-semibold text-lg">
					{t('admin.players.blacklist')}
				</h2>

				<Card.Root>
					<Card.Content>
						<div className="flex flex-col items-stretch gap-3 md:flex-row md:items-end">
							<div className="flex-1">
								<Input
									label="UUID"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setBlacklistUuid(e.target.value)}
									value={blacklistUuid}
								/>
							</div>
							<Button
								disabled={!blacklistUuid}
								loading={blacklistAddMutation.isPending}
								onClick={() =>
									blacklistAddMutation.mutate(blacklistUuid)
								}
								variant="danger"
							>
								{t('admin.players.addBtn')}
							</Button>
						</div>
					</Card.Content>
				</Card.Root>

				{blacklist && blacklist.length > 0 && (
				<Card.Root className="mt-4 overflow-hidden p-0">
						<div className="overflow-x-auto">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>UUID</Table.Head>
									<Table.Head />
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{blacklist.map((entry) => (
									<Table.Row key={entry.uuid}>
										<Table.Cell>
											<span className="font-mono text-xs">
												{entry.uuid}
											</span>
										</Table.Cell>
										<Table.Cell>
											<Button
												onClick={() =>
													blacklistRemoveMutation.mutate(
														entry.uuid
													)
												}
												size="sm"
												variant="ghost"
											>
												<Icon
													className="text-red-400"
													icon="lucide:trash-2"
												/>
											</Button>
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
					</Table.Root>
						</div>
					</Card.Root>
				)}
			</div>
		</div>
	)
}
