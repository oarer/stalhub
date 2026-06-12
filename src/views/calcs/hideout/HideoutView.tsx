'use client'

import { ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import Sidebar from '@/components/ui/sideBar/SideBar'
import type { ColumnDef } from '@/components/ui/Table'
import { flexRender, Table, useTableSort } from '@/components/ui/Table'
import { useSearchItem } from '@/hooks/useSearchItem'
import { getLocale } from '@/lib/getLocale'
import { hideoutQueries } from '@/queries/calcs/hideout.queries'
import type { Recipe } from '@/types/hideout.type'
import type { Locale } from '@/types/item.type'
import { CenterOnNode } from './components/CenterOnNode'
import { nodeTypes } from './components/CustomNode'
import { RecipeSidebar } from './components/RecipeSidebar'
import { useHideoutGraph } from './hooks/useHideoutGraph'
import type { IngredientRows } from './types'
import { normalizeItemId } from './utils/hideoutUtils'

//! TODO add i18n

export function HideoutView() {
	const { data: hideoutData } = useSuspenseQuery(hideoutQueries.get())
	const { items } = useSearchItem()
	const locale = getLocale()

	const {
		nodes,
		edges,
		onNodesChange,
		centerTarget,
		selectedItem,
		handleItemChange,
		desiredQuantity,
		expandedNodes,
	} = useHideoutGraph(hideoutData, items, locale)

	const ingredients = useMemo<IngredientRows[]>(() => {
		if (!hideoutData || !items || !selectedItem) return []

		const localeTyped = locale as Locale
		const itemMap = new Map<string, (typeof items)[0]>()
		for (const item of items) {
			itemMap.set(normalizeItemId(item.data), item)
		}

		const recipeMap = new Map<string, Recipe>()
		for (const recipe of hideoutData.recipes) {
			for (const res of recipe.result) {
				recipeMap.set(normalizeItemId(res.item), recipe)
			}
		}

		const rootRecipe = recipeMap.get(selectedItem)
		if (!rootRecipe) return []

		const getItemInfo = (id: string) => {
			const entry = itemMap.get(id)
			return {
				name:
					entry?.name[localeTyped] ??
					Object.values(entry?.name ?? {})[0] ??
					id,
				icon: entry?.icon
					? `https://raw.githubusercontent.com/oarer/sc-db/main/merged${entry.icon}`
					: '',
			}
		}

		const rows: IngredientRows[] = []

		const visited = new Set<string>()

		const traverse = (
			itemId: string,
			quantityNeeded: number,
			depth: number
		) => {
			if (visited.has(itemId)) return
			visited.add(itemId)

			const recipe = recipeMap.get(itemId)
			if (!recipe) return

			const perCraft =
				recipe.result.find((r) => normalizeItemId(r.item) === itemId)
					?.amount ?? 1

			const multiplier = quantityNeeded / perCraft

			for (const ing of recipe.ingredients) {
				const ingId = normalizeItemId(ing.item)
				const { name, icon } = getItemInfo(ingId)
				const total = Math.ceil(multiplier * ing.amount)

				rows.push({
					id: ingId,
					name,
					icon,
					perCraft: ing.amount,
					total,
					price: ing.price ?? 0,
					totalPrice: (ing.price ?? 0) * total,
					depth,
					energy: recipe.energy,
				})

				if (expandedNodes.has(ingId)) {
					traverse(ingId, total, depth + 1)
				}
			}
		}

		traverse(selectedItem, desiredQuantity, 0)

		return rows
	}, [
		hideoutData,
		items,
		selectedItem,
		desiredQuantity,
		expandedNodes,
		locale,
	])

	const columns: ColumnDef<IngredientRows>[] = useMemo(
		() => [
			{
				accessorKey: 'name',
				header: 'Предмет',
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						{row.original.icon && (
							<Image
								alt={row.original.name}
								className="size-7 object-contain"
								height={26}
								src={row.original.icon}
								width={26}
							/>
						)}
						<span className="max-w-32 truncate">
							{row.original.name}
						</span>
					</div>
				),
			},
			{
				accessorKey: 'perCraft',
				header: 'За крафт',
				cell: ({ row }) => (
					<span className={montserrat.className}>
						{row.original.perCraft}
					</span>
				),
			},
			{
				accessorKey: 'total',
				header: 'Всего',
				cell: ({ row }) => (
					<span className={montserrat.className}>
						{row.original.total}
					</span>
				),
			},
			{
				accessorKey: 'price',
				header: 'Цена/ед',
				cell: ({ row }) => (
					<span className={montserrat.className}>
						{row.original.price.toLocaleString()}₽
					</span>
				),
			},
			{
				accessorKey: 'totalPrice',
				header: 'Итого',
				cell: ({ row }) => (
					<span className={montserrat.className}>
						{row.original.totalPrice.toLocaleString()}₽
					</span>
				),
			},
			{
				accessorKey: 'totalEnergy',
				header: 'Энергия',
				cell: ({ row }) => (
					<span className={montserrat.className}>
						{row.original.energy.toLocaleString()}
					</span>
				),
			},
		],
		[]
	)

	const { table } = useTableSort(ingredients, columns)

	return (
		<div className="h-screen w-full pt-24">
			<ReactFlow
				defaultEdgeOptions={{
					style: {
						strokeWidth: 2,
						stroke: 'var(--border-secondary)',
					},
				}}
				edges={edges}
				nodes={nodes}
				nodesConnectable={false}
				nodesDraggable
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
			>
				<CenterOnNode centerTarget={centerTarget} />
				<RecipeSidebar
					hideoutData={hideoutData}
					items={items}
					locale={locale}
					onItemChange={handleItemChange}
					selectedItem={selectedItem}
				/>
			</ReactFlow>

			{ingredients.length > 0 && (
				<Sidebar className="max-h-100" defaultOpen={false} side="right">
					<Table.Root className="font-semibold">
						<Table.Header>
							{table.getHeaderGroups().map((headerGroup) => (
								<Table.Row key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<Table.SortableHeader
											column={header.column}
											key={header.id}
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
										</Table.SortableHeader>
									))}
								</Table.Row>
							))}
						</Table.Header>
						<Table.Body>
							{table.getRowModel().rows.map((row) => (
								<Table.Row key={row.id}>
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
				</Sidebar>
			)}
		</div>
	)
}
