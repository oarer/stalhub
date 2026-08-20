'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { clanQueries } from '@/queries/clan/clan.queries'
import { clanService } from '@/services/clan/clan.service'
import { useClanRoles } from '../../hooks/useClanRoles'

interface PendingBox {
	typeId: string
	typeName: string
	count: number
}

interface Props {
	clanId: string
	date: string
}

export function GrenadeBoxOrder({ clanId, date }: Props) {
	const t = useTranslations()
	const queryClient = useQueryClient()
	const { myMember } = useClanRoles()
	const [isOpen, setIsOpen] = useState(false)
	const [pending, setPending] = useState<PendingBox[]>([])

	const playerName = myMember?.name ?? ''

	const { data: boxesData } = useQuery({
		...clanQueries.getGrenadeBoxes(clanId, date),
		enabled: isOpen,
	})

	const { data: listing } = useQuery({
		...clanQueries.getGrenadeBoxListing(),
		enabled: isOpen,
	})

	const addMutation = useMutation({
		mutationFn: (items: PendingBox[]) =>
			Promise.all(
				items.map((item) =>
					clanService.addGrenadeBox(clanId, {
						name: playerName,
						type: item.typeName,
						count: item.count,
						date,
					})
				)
			),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['clan', clanId, 'grenades'],
			})
			setPending([])
			toast.success(t('clan.grenades.boxAdded'))
		},
		onError: () => toast.error(t('clan.grenades.boxError')),
	})

	const removeMutation = useMutation({
		mutationFn: (index: number) =>
			clanService.removeGrenadeBox(clanId, date, index),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['clan', clanId, 'grenades'],
			})
			toast.success(t('clan.grenades.boxRemoved'))
		},
		onError: () => toast.error(t('clan.grenades.boxError')),
	})

	const handleSubmit = () => {
		const valid = pending.filter((p) => p.count >= 1)
		if (valid.length === 0) return
		addMutation.mutate(valid)
	}

	const boxes = boxesData?.boxes ?? []

	const boxOptions = (listing ?? []).map((item) => ({
		value: item.id,
		label: item.name,
	}))

	const selectedTypeIds = pending.map((p) => p.typeId)

	const handleTypesChange = (typeIds: string[]) => {
		const existing = new Map(pending.map((p) => [p.typeId, p]))
		const next: PendingBox[] = typeIds.map((id) => {
			if (existing.has(id)) return existing.get(id)!
			const item = listing?.find((l) => l.id === id)
			return { typeId: id, typeName: item?.name ?? id, count: 1 }
		})
		setPending(next)
	}

	const updateCount = (typeId: string, count: number) => {
		setPending((prev) =>
			prev.map((p) => (p.typeId === typeId ? { ...p, count } : p))
		)
	}

	return (
		<Modal.Root onOpenChange={setIsOpen} open={isOpen}>
			<Modal.Trigger asChild>
				<Button className="gap-2" variant={'secondary'}>
					<Icon className="text-lg" icon="lucide:package-plus" />
					{t('clan.grenades.orderBoxes')}
				</Button>
			</Modal.Trigger>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>
						{t('clan.grenades.boxOrderTitle')}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-4">
						{boxes.length > 0 && (
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>
											{t('clan.grenades.playerName')}
										</Table.Head>
										<Table.Head>
											{t('clan.grenades.boxType')}
										</Table.Head>
										<Table.Head className="w-20 text-center">
											×
										</Table.Head>
										<Table.Head className="w-10" />
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{boxes.map((box, i) => (
										<Table.Row key={i}>
											<Table.Cell className="font-semibold">
												{box.name}
											</Table.Cell>
											<Table.Cell className="font-semibold">
												{box.type}
											</Table.Cell>
											<Table.Cell
												className={`${montserrat.className} text-center font-semibold`}
											>
												{box.count}/шт
											</Table.Cell>
											<Table.Cell>
												<Button
													className="p-2 ring-0"
													onClick={() =>
														removeMutation.mutate(i)
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
								{t('clan.grenades.addBox')}
							</h4>
							<Input
								disabled
								label={t('clan.grenades.playerName')}
								value={playerName}
							/>
							<Combobox
								disabled={boxOptions.length === 0}
								multiple
								onValuesChange={handleTypesChange}
								options={boxOptions}
								placeholder={t('clan.grenades.boxType')}
								values={selectedTypeIds}
							/>
							{pending.length > 0 && (
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>
												{t('clan.grenades.boxType')}
											</Table.Head>
											<Table.Head className="w-28">
												{t('clan.grenades.boxCount')}
											</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{pending.map((item) => (
											<Table.Row key={item.typeId}>
												<Table.Cell className="font-semibold">
													{item.typeName}
												</Table.Cell>
												<Table.Cell>
													<Input
														min={1}
														onChange={(e) =>
															updateCount(
																item.typeId,
																Number(
																	e.target
																		.value
																)
															)
														}
														type="number"
														value={item.count}
													/>
												</Table.Cell>
											</Table.Row>
										))}
									</Table.Body>
								</Table.Root>
							)}
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Action
						disabled={
							pending.length === 0 ||
							pending.some((p) => p.count < 1)
						}
						onClick={handleSubmit}
					>
						{t('clan.grenades.addBox')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
