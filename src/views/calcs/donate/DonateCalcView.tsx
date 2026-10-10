'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import type { ColumnDef } from '@/components/ui/Table'
import { flexRender, Table, useTableSort } from '@/components/ui/Table'
import { getLocale } from '@/lib/getLocale'
import { type DonateItem, donateQueries } from '@/queries/donate/donate.queries'
import { messageToString } from '@/utils/itemUtils'

type DonateRow = DonateItem & {
	affordable: number
	totalValue: number
}

export default function DonateCalcView() {
	const t = useTranslations()
	const locale = getLocale()
	const { data } = useSuspenseQuery(donateQueries.get())
	const [coins, setCoins] = useState(1000)

	const rows = useMemo<DonateRow[]>(() => {
		return (data.items ?? [])
			.filter((i) => i.has_market)
			.map((i) => {
				const affordable =
					i.stalcoins > 0 ? Math.floor(coins / i.stalcoins) : 0
				return { ...i, affordable, totalValue: affordable * i.price }
			})
	}, [data, coins])

	const columns = useMemo<ColumnDef<DonateRow>[]>(
		() => [
			{
				accessorFn: (row) => messageToString(row.name as never, locale),
				id: 'item',
				header: t('donateCalc.item'),
				cell: ({ row }) => (
					<span className="flex items-center gap-2">
						{row.original.icon && (
							<Image
								alt={row.original.id}
								height={28}
								src={`https://cdn.stalhub.dev/db${row.original.icon}`}
								width={28}
							/>
						)}
						<span className="font-medium">
							{messageToString(
								row.original.name as never,
								locale
							)}
						</span>
						{row.original.amount > 1 && (
							<span className="font-mono text-foreground text-xs">
								×{row.original.amount}
							</span>
						)}
					</span>
				),
			},
			{
				accessorKey: 'stalcoins',
				header: t('donateCalc.coins'),
				cell: ({ row }) => (
					<span className="font-mono">{row.original.stalcoins}</span>
				),
			},
			{
				accessorKey: 'price',
				header: t('donateCalc.price'),
				cell: ({ row }) => (
					<span className="font-mono text-yellow-400">
						{row.original.price.toLocaleString()} ₽
					</span>
				),
			},
			{
				accessorKey: 'price_per_coin',
				header: t('donateCalc.perCoin'),
				cell: ({ row }) => (
					<span className="font-mono text-green-400">
						{row.original.price_per_coin.toLocaleString()}
					</span>
				),
			},
			{
				accessorKey: 'affordable',
				header: t('donateCalc.count'),
				cell: ({ row }) => (
					<span className="font-mono">{row.original.affordable}</span>
				),
			},
			{
				accessorKey: 'totalValue',
				header: t('donateCalc.total'),
				cell: ({ row }) => (
					<span className="font-mono">
						{row.original.totalValue.toLocaleString()} ₽
					</span>
				),
			},
		],
		[t, locale]
	)

	const { table } = useTableSort(rows, columns, [
		{ id: 'price_per_coin', desc: true },
	])

	return (
		<section className="mx-auto flex max-w-380 flex-col gap-6 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<h1
				className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
			>
				{t('donateCalc.title')}
			</h1>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
				<Input
					className="py-2.5 md:w-80"
					id="stalcoins"
					label="donateCalc.input"
					min={0}
					onChange={(e) =>
						setCoins(
							e.target.value === '' ? 0 : Number(e.target.value)
						)
					}
					type="number"
					value={coins}
				/>
				<Alert.Root className="flex-1" variant="default">
					<Alert.Description>
						{t('donateCalc.hint')}
					</Alert.Description>
				</Alert.Root>
			</div>

			<Card.Root className="overflow-hidden p-0">
				<Table.Root className="font-medium">
					<Table.Header>
						{table.getHeaderGroups().map((headerGroup) => (
							<Table.Row key={headerGroup.id}>
								{headerGroup.headers.map((header) =>
									header.column.getCanSort() ? (
										<Table.SortableHeader
											column={header.column}
											key={header.id}
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
										</Table.SortableHeader>
									) : (
										<Table.Head key={header.id}>
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
										</Table.Head>
									)
								)}
							</Table.Row>
						))}
					</Table.Header>
					<Table.Body>
						{table.getRowModel().rows.map((row) => (
							<Table.Row key={row.original.key}>
								{row.getVisibleCells().map((cell) => (
									<Table.Cell key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</Table.Cell>
								))}
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</Card.Root>

			{data.missing.length > 0 && (
				<Alert.Root variant="warning">
					<Alert.Description>
						{t('donateCalc.missing')}: {data.missing.join(', ')}
					</Alert.Description>
				</Alert.Root>
			)}
		</section>
	)
}
