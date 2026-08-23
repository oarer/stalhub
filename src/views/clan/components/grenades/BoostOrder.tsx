'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { clanQueries } from '@/queries/clan/clan.queries'
import { clanService } from '@/services/clan/clan.service'
import type { ClanSettings } from '@/types/clan/clan.type'
import { useClanRoles } from '../../hooks/useClanRoles'

interface PendingItem {
	itemId: string
	itemName: string
	count: number
}

interface Props {
	settings: ClanSettings | undefined
}

export function BoostOrder({ settings }: Props) {
	const t = useTranslations()
	const queryClient = useQueryClient()
	const { myMember } = useClanRoles()
	const [isOpen, setIsOpen] = useState(false)
	const [pending, setPending] = useState<PendingItem[]>([])

	const playerName = myMember?.name ?? ''
	const isSelfBoost = settings?.boost_mode === 'SELF'

	const { data: ordersData } = useQuery({
		...clanQueries.getBoostOrders(),
		enabled: isOpen && !isSelfBoost,
	})

	const { data: listing } = useQuery({
		...clanQueries.getConsumableListing(),
		enabled: isOpen && !isSelfBoost,
	})

	const addMutation = useMutation({
		mutationFn: (items: PendingItem[]) =>
			Promise.all(
				items.map((item) => {
					if (!myMember) throw new Error('No member')
					return clanService.addBoostOrder({
						player_id: myMember.id,
						item_id: item.itemId,
						item_name: item.itemName,
						count: item.count,
					})
				})
			),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['clan', 'boosts'],
			})
			setPending([])
			toast.success(t('clan.boosts.orderAdded'))
		},
		onError: () => toast.error(t('clan.boosts.orderError')),
	})

	const removeMutation = useMutation({
		mutationFn: (index: number) =>
			clanService.removeBoostOrder(index),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['clan', 'boosts'],
			})
			toast.success(t('clan.boosts.orderRemoved'))
		},
		onError: () => toast.error(t('clan.boosts.orderError')),
	})

	const handleSubmit = () => {
		const valid = pending.filter((p) => p.count >= 1)
		if (valid.length === 0) return
		addMutation.mutate(valid)
	}

	const orders = ordersData?.orders ?? []

	const itemOptions = (listing ?? []).map((item) => ({
		value: item.id,
		label: item.name,
	}))

	const selectedIds = pending.map((p) => p.itemId)

	const handleItemsChange = (ids: string[]) => {
		const existing = new Map(pending.map((p) => [p.itemId, p]))
		const next: PendingItem[] = ids.map((id) => {
			if (existing.has(id)) return existing.get(id)!
			const item = listing?.find((l) => l.id === id)
			return { itemId: id, itemName: item?.name ?? id, count: 1 }
		})
		setPending(next)
	}

	const updateCount = (itemId: string, count: number) => {
		setPending((prev) =>
			prev.map((p) => (p.itemId === itemId ? { ...p, count } : p))
		)
	}

	return (
		<Modal.Root onOpenChange={setIsOpen} open={isOpen}>
			<Modal.Trigger asChild>
				<Button className="gap-2" variant={'secondary'}>
					<Icon className="text-lg" icon="lucide:flask-conical" />
					{t('clan.boosts.orderBoosts')}
				</Button>
			</Modal.Trigger>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('clan.boosts.title')}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-4">
						{isSelfBoost ? (
							<Alert.Root>
								{t('clan.boosts.selfBoostNotice')}
							</Alert.Root>
						) : (
							<>
								{orders.length > 0 && (
									<Table.Root>
										<Table.Header>
											<Table.Row>
												<Table.Head>
													{t(
														'clan.grenades.playerName'
													)}
												</Table.Head>
												<Table.Head>
													{t(
														'clan.boosts.selectItem'
													)}
												</Table.Head>
												<Table.Head className="w-20 text-center">
													×
												</Table.Head>
												<Table.Head className="w-10" />
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{orders.map((order, i) => (
												<Table.Row key={order.id}>
													<Table.Cell className="font-semibold">
														{order.player.name}
													</Table.Cell>
													<Table.Cell className="font-semibold">
														{order.item_name}
													</Table.Cell>
													<Table.Cell
														className={`${montserrat.className} text-center font-semibold`}
													>
														{order.count}/шт
													</Table.Cell>
													<Table.Cell>
														<Button
															className="p-2 ring-0"
															onClick={() =>
																removeMutation.mutate(
																	i
																)
															}
															variant={'danger'}
														>
															<Icon
																className="text-sm"
																icon="lucide:x"
															/>
														</Button>
													</Table.Cell>
												</Table.Row>
											))}
										</Table.Body>
									</Table.Root>
								)}

								<div className="flex flex-col gap-2">
									<h4 className="font-semibold text-sm">
										{t('clan.boosts.addOrder')}
									</h4>
									<Input
										disabled
										label={t('clan.grenades.playerName')}
										value={playerName}
									/>
									<Combobox
										disabled={itemOptions.length === 0}
										multiple
										onValuesChange={handleItemsChange}
										options={itemOptions}
										placeholder={t(
											'clan.boosts.selectItem'
										)}
										values={selectedIds}
									/>
									{pending.length > 0 && (
										<Table.Root>
											<Table.Header>
												<Table.Row>
													<Table.Head>
														{t(
															'clan.boosts.selectItem'
														)}
													</Table.Head>
													<Table.Head className="w-28">
														{t(
															'clan.boosts.quantity'
														)}
													</Table.Head>
												</Table.Row>
											</Table.Header>
											<Table.Body>
												{pending.map((item) => (
													<Table.Row
														key={item.itemId}
													>
														<Table.Cell className="font-semibold">
															{item.itemName}
														</Table.Cell>
														<Table.Cell>
															<Input
																min={1}
																onChange={(e) =>
																	updateCount(
																		item.itemId,
																		Number(
																			e
																				.target
																				.value
																		)
																	)
																}
																type="number"
																value={
																	item.count
																}
															/>
														</Table.Cell>
													</Table.Row>
												))}
											</Table.Body>
										</Table.Root>
									)}
								</div>
							</>
						)}
					</div>
				</Modal.Body>
				{!isSelfBoost && (
					<Modal.Footer>
						<Modal.Action
							disabled={
								pending.length === 0 ||
								pending.some((p) => p.count < 1)
							}
							onClick={handleSubmit}
						>
							{t('clan.boosts.addOrder')}
						</Modal.Action>
					</Modal.Footer>
				)}
			</Modal.Content>
		</Modal.Root>
	)
}
