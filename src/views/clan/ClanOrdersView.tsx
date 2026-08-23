'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table } from '@/components/ui/Table'
import { clanQueries } from '@/queries/clan/clan.queries'
import { BoostOrder } from './components/grenades/BoostOrder'
import { GrenadeBoxOrder } from './components/grenades/GrenadeBoxOrder'
import { useClanRoles } from './hooks/useClanRoles'

export default function ClanOrdersView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null
	return <ClanOrdersContent clanId={clanId} />
}

function ClanOrdersContent({ clanId }: { clanId: string }) {
	const t = useTranslations()
	const { myMember } = useClanRoles()

	const { data: settings } = useSuspenseQuery(clanQueries.getSettings())

	const { data: boxesData, isLoading: boxesLoading } = useSuspenseQuery(
		clanQueries.getGrenadeBoxes(clanId)
	)

	const { data: boostData, isLoading: boostsLoading } = useSuspenseQuery(
		clanQueries.getBoostOrders()
	)

	const boxes = boxesData?.boxes ?? []
	const boosts = boostData?.orders ?? []

	const { grenadeColumns, grenadeRows } = useMemo(() => {
		const byType = new Map<string, Map<string, number>>()
		for (const box of boxes) {
			const col = box.type
			if (!byType.has(col)) byType.set(col, new Map())
			const row = box.name
			const prev = byType.get(col)!.get(row) ?? 0
			byType.get(col)!.set(row, prev + box.count)
		}
		const cols = [...byType.keys()]
		const rowNames = [...new Set(boxes.map((b) => b.name))]
		const rows = rowNames.map((name) => {
			const cells: Record<string, number> = {}
			for (const col of cols) {
				cells[col] = byType.get(col)!.get(name) ?? 0
			}
			return { name, cells }
		})
		return { grenadeColumns: cols, grenadeRows: rows }
	}, [boxes])

	const { boostColumns, boostRows } = useMemo(() => {
		const byItem = new Map<string, Map<string, number>>()
		for (const order of boosts) {
			const col = order.item_name
			if (!byItem.has(col)) byItem.set(col, new Map())
			const row = order.player.name
			const prev = byItem.get(col)!.get(row) ?? 0
			byItem.get(col)!.set(row, prev + order.count)
		}
		const cols = [...byItem.keys()]
		const rowNames = [...new Set(boosts.map((o) => o.player.name))]
		const rows = rowNames.map((name) => {
			const cells: Record<string, number> = {}
			for (const col of cols) {
				cells[col] = byItem.get(col)!.get(name) ?? 0
			}
			return { name, cells }
		})
		return { boostColumns: cols, boostRows: rows }
	}, [boosts])

	const hasBoxes = grenadeColumns.length > 0
	const hasBoosts = boostColumns.length > 0

	if (boxesLoading || boostsLoading) {
		return (
			<div className="flex flex-col gap-2">
				{[...Array(3)].map((_, i) => (
					<Skeleton className="h-12 w-full" key={i} />
				))}
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			{myMember && (
				<div className="flex justify-end gap-2">
					<GrenadeBoxOrder clanId={clanId} />
					<BoostOrder settings={settings} />
				</div>
			)}

			{!hasBoxes && !hasBoosts && (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-card px-5 py-4">
					<Icon className="text-4xl" icon="lucide:clipboard-list" />
					<h3 className="font-semibold text-lg">
						{t('clan.orders.emptyTitle')}
					</h3>
					<p className="font-semibold text-sm text-text-accent">
						{t('clan.orders.emptyDesc')}
					</p>
				</div>
			)}

			{hasBoxes && (
				<div className="flex flex-col gap-2 rounded-xl bg-card px-5 py-4">
					<h3 className="font-bold text-base">
						{t('clan.grenades.boxOrderTitle')}
					</h3>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head className="sticky left-0 z-1 bg-card">
									{t('clan.grenades.playerName')}
								</Table.Head>
								{grenadeColumns.map((col) => (
									<Table.Head
										className="text-center"
										key={col}
									>
										{col}
									</Table.Head>
								))}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{grenadeRows.map((row) => (
								<Table.Row key={row.name}>
									<Table.Cell className="sticky left-0 z-1 bg-card font-semibold">
										{row.name}
									</Table.Cell>
									{grenadeColumns.map((col) => (
										<Table.Cell
											className="text-center font-semibold"
											key={col}
										>
											{row.cells[col] > 0
												? row.cells[col]
												: '—'}
										</Table.Cell>
									))}
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</div>
			)}

			{hasBoosts && (
				<div className="flex flex-col gap-2 rounded-xl bg-card px-5 py-4">
					<h3 className="font-bold text-base">
						{t('clan.boosts.title')}
					</h3>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head className="sticky left-0 z-1 bg-card">
									{t('clan.grenades.playerName')}
								</Table.Head>
								{boostColumns.map((col) => (
									<Table.Head
										className="text-center"
										key={col}
									>
										{col}
									</Table.Head>
								))}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{boostRows.map((row) => (
								<Table.Row key={row.name}>
									<Table.Cell className="sticky left-0 z-1 bg-card font-semibold">
										{row.name}
									</Table.Cell>
									{boostColumns.map((col) => (
										<Table.Cell
											className="text-center font-semibold"
											key={col}
										>
											{row.cells[col] > 0
												? row.cells[col]
												: '—'}
										</Table.Cell>
									))}
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</div>
			)}
		</div>
	)
}
