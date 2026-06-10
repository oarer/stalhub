'use client'

import {
	type Edge,
	Handle,
	type Node,
	Position,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from '@xyflow/react'

import '@xyflow/react/dist/style.css'
import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import ELK from 'elkjs/lib/elk.bundled.js'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import Input from '@/components/ui/Input'
import Sidebar from '@/components/ui/sideBar/SideBar'
import { useSearchItem } from '@/hooks/useSearchItem'
import { cn } from '@/lib/cn'
import { getLocale } from '@/lib/getLocale'
import { hideoutQueries } from '@/queries/calcs/hideout.queries'
import type { Locale } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

// ! TODO https://reactflow.dev/error#002

const elk = new ELK()

const elkLayout = async (nodes: Node[], edges: Edge[]) => {
	const graph = {
		id: 'root',
		layoutOptions: {
			'elk.algorithm': 'layered',
			'elk.direction': 'DOWN',
			'elk.spacing.nodeNode': '60',
			'elk.layered.spacing.nodeNodeBetweenLayers': '100',
			'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
		},

		children: nodes.map((n) => {
			const nodeData = n.data as unknown as CustomNodeData
			const estHeight =
				nodeData?.isExpanded && nodeData?.ingredients
					? 90 +
						nodeData.ingredients.length * 28 +
						(nodeData.energyPerCraft ? 30 : 0)
					: 80

			return {
				id: n.id,
				width: n.measured?.width ?? 320,
				height: n.measured?.height ?? estHeight,
			}
		}),

		edges: edges.map((e) => ({
			id: e.id,
			sources: [e.source],
			targets: [e.target],
		})),
	}

	const layout = await elk.layout(graph)

	return {
		nodes:
			layout.children?.map((n) => ({
				id: n.id,
				type: 'custom',
				position: { x: n.x ?? 0, y: n.y ?? 0 },
				data: {},
			})) ?? [],
		edges,
	}
}

interface IngredientInfo {
	name: string
	icon: string
	total: number
}

interface CustomNodeData {
	label: string
	icon: string
	hasRecipe?: boolean
	isExpanded?: boolean
	isRoot?: boolean
	onToggle?: () => void
	quantity?: number
	perCraft?: number
	onQuantityChange?: (delta: number) => void
	energyPerCraft?: number
	ingredients?: IngredientInfo[]
}

function CustomNode({ data }: { data: CustomNodeData }) {
	return (
		<div
			className={cn(
				'flex w-80 flex-col gap-2 rounded-lg border-2 px-4 py-2 text-center shadow-lg',
				data.isRoot ? 'border-border/80' : 'border-border-secondary',
				data.isRoot ? 'bg-border/20 backdrop-blur-sm' : 'bg-background'
			)}
		>
			<Handle
				className={cn(
					'translate-y-[-0.5px]! border-transparent!',
					data.isRoot ? 'bg-transparent!' : 'bg-border-secondary!'
				)}
				position={Position.Top}
				type="target"
			/>

			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Image
						alt={data.label}
						className="shrink-0"
						height={52}
						src={data.icon}
						width={52}
					/>
					<div className="flex flex-col items-start">
						<h2 className="max-w-32 truncate font-semibold text-lg">
							{data.label}
						</h2>
						{data.perCraft && data.perCraft > 1 && (
							<span
								className={`${montserrat.className} font-semibold text-[10px] text-text-accent`}
							>
								×{data.perCraft}
							</span>
						)}
					</div>
				</div>
				{data.isRoot ? (
					<div className="flex items-center justify-center">
						<Input
							className="bg-background/50 text-sm"
							max={9999}
							min={0}
							onChange={(e) => {
								const newValue = Number(e.target.value)
								const diff = newValue - (data.quantity ?? 0)

								data.onQuantityChange?.(diff)
							}}
							step={data.perCraft ?? 1}
							type="number"
							value={data.quantity ?? 0}
						/>
					</div>
				) : data.quantity && data.quantity > 0 ? (
					<span
						className={`${montserrat.className} font-semibold text-sm text-text-accent`}
					>
						×{data.quantity}
					</span>
				) : null}
			</div>

			{data.isExpanded && (
				<Divider className={data.isRoot ? 'bg-border/40' : ''} />
			)}

			{data.isExpanded && data.ingredients && (
				<div className="flex flex-col gap-1">
					{data.ingredients.map((ing, i) => (
						<div
							className="flex items-center justify-between font-semibold text-sm"
							key={i}
						>
							<div className="flex items-center gap-1.5">
								<Image
									alt={ing.name}
									className="shrink-0"
									height={28}
									src={ing.icon}
									width={28}
								/>
								<span className="truncate text-text-secondary">
									{ing.name}
								</span>
							</div>
							<span className="tabular-nums">×{ing.total}</span>
						</div>
					))}
				</div>
			)}

			{data.isExpanded && (
				<Divider className={data.isRoot ? 'bg-border/40' : ''} />
			)}

			{data.isExpanded && data.energyPerCraft && (
				<div className="flex items-center justify-between font-semibold text-sm">
					<p>Энергия</p>
					<span>
						{data.energyPerCraft *
							Math.ceil(
								(data.quantity ?? 0) / (data.perCraft ?? 1)
							)}
					</span>
				</div>
			)}

			{data.hasRecipe && (
				<Button
					className="p-1 text-sm"
					onClick={data.onToggle}
					variant={'secondary'}
				>
					<Icon
						icon={data.isExpanded ? 'lucide:minus' : 'lucide:plus'}
					/>
				</Button>
			)}

			<Handle
				className={cn(
					'translate-y-[0.5px]! border-transparent!',
					data.isRoot
						? 'translate-y-[2.5px]! bg-border!'
						: 'bg-border-secondary!'
				)}
				position={Position.Bottom}
				type="source"
			/>
		</div>
	)
}

const nodeTypes = { custom: CustomNode }

export function HideoutView() {
	const { data: hideoutData } = useSuspenseQuery(hideoutQueries.get())
	const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
	const [edges, setEdges] = useEdgesState<Edge>([])

	const [selectedItem, setSelectedItem] = useState('')
	const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
	const [desiredQuantity, setDesiredQuantity] = useState(1)
	const [searchQuery, setSearchQuery] = useState('')

	const { items } = useSearchItem()
	const locale = getLocale()

	const normalizeItemId = useCallback((itemId: string) => {
		return itemId.split('/').pop()?.replace('.json', '') ?? itemId
	}, [])

	const getItemName = useCallback(
		(itemId: string) => {
			if (!items) return itemId

			const itemData = items.find((i) => {
				const file = i.data.split('/').pop()?.replace('.json', '')
				return file === itemId || i.data.includes(itemId)
			})

			return (
				itemData?.name[locale] ??
				Object.values(itemData?.name ?? {})[0] ??
				itemId
			)
		},
		[items, locale]
	)

	const getItemIcon = useCallback(
		(itemId: string) => {
			if (!items) return ''

			const itemData = items.find((i) => {
				const file = i.data.split('/').pop()?.replace('.json', '')
				return file === itemId || i.data.includes(itemId)
			})

			if (!itemData?.icon) return ''

			return `https://raw.githubusercontent.com/oarer/sc-db/main/merged${itemData.icon}`
		},
		[items]
	)

	const hasRecipe = useCallback(
		(itemId: string) => {
			if (!hideoutData) return false
			return hideoutData.recipes.some((r) =>
				r.result.some((res) => normalizeItemId(res.item) === itemId)
			)
		},
		[hideoutData, normalizeItemId]
	)

	const toggleNode = useCallback((id: string) => {
		setExpandedNodes((prev) => {
			const next = new Set(prev)
			next.has(id) ? next.delete(id) : next.add(id)
			return next
		})
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: mount-only initial selection
	useEffect(() => {
		if (!selectedItem && hideoutData.recipes[0]) {
			const first = normalizeItemId(hideoutData.recipes[0].result[0].item)
			setSelectedItem(first)
			setExpandedNodes(new Set([first]))
			setDesiredQuantity(hideoutData.recipes[0].result[0].amount)
		}
	}, [])

	useEffect(() => {
		if (!selectedItem || !hideoutData || !items) return

		const rootRecipe = hideoutData.recipes.find((r) =>
			r.result.some((res) => normalizeItemId(res.item) === selectedItem)
		)
		const rootPerCraft =
			rootRecipe?.result.find(
				(r) => normalizeItemId(r.item) === selectedItem
			)?.amount ?? 1

		const visited = new Set<string>()
		const newNodes: Node[] = []
		const newEdges: Edge[] = []

		const traverse = (
			raw: string,
			quantityNeeded: number,
			isRoot = false
		) => {
			const id = normalizeItemId(raw)
			if (visited.has(id)) return
			visited.add(id)

			const recipe = hideoutData.recipes.find((r) =>
				r.result.some((res) => normalizeItemId(res.item) === id)
			)

			const isExpanded = expandedNodes.has(id)
			const perCraft =
				recipe?.result.find((r) => normalizeItemId(r.item) === id)
					?.amount ?? 1

			newNodes.push({
				id,
				type: 'custom',
				position: { x: 0, y: 0 },
				data: {
					label: getItemName(id),
					icon: getItemIcon(id),
					hasRecipe: hasRecipe(id),
					isExpanded,
					isRoot,
					quantity: isRoot ? desiredQuantity : quantityNeeded,
					perCraft,
					onToggle: () => toggleNode(id),
					onQuantityChange: isRoot
						? (delta: number) =>
								setDesiredQuantity((prev) =>
									Math.max(rootPerCraft, prev + delta)
								)
						: undefined,
					energyPerCraft: recipe?.energy,
					ingredients: recipe
						? recipe.ingredients.map((ing) => {
								const ingId = normalizeItemId(ing.item)
								const mult =
									(isRoot
										? desiredQuantity
										: quantityNeeded) / perCraft
								return {
									name: getItemName(ingId),
									icon: getItemIcon(ingId),
									total: Math.ceil(mult * ing.amount),
								}
							})
						: undefined,
				},
			})

			if (recipe && isExpanded) {
				const multiplier =
					(isRoot ? desiredQuantity : quantityNeeded) / perCraft

				for (const ing of recipe.ingredients) {
					const ingId = normalizeItemId(ing.item)
					const ingQuantity = Math.ceil(multiplier * ing.amount)

					newEdges.push({
						id: `${id}-${ingId}`,
						source: id,
						target: ingId,
					})

					traverse(ing.item, ingQuantity)
				}
			}
		}

		traverse(selectedItem, desiredQuantity, true)

		const nodeIds = new Set(newNodes.map((n) => n.id))
		const validEdges = newEdges.filter(
			(e) => nodeIds.has(e.source) && nodeIds.has(e.target)
		)

		elkLayout(newNodes, validEdges).then((layout) => {
			setNodes((prev) => {
				const prevMap = new Map(prev.map((n) => [n.id, n]))

				return layout.nodes.map((n) => {
					const old = prevMap.get(n.id)

					return {
						...(old ?? n),
						id: n.id,
						position: n.position,
						data:
							newNodes.find((x) => x.id === n.id)?.data ??
							old?.data ??
							{},
					}
				})
			})

			setEdges(validEdges)
		})
	}, [
		selectedItem,
		hideoutData,
		items,
		expandedNodes,
		desiredQuantity,
		normalizeItemId,
		getItemName,
		getItemIcon,
		toggleNode,
		setNodes,
		hasRecipe,
		setEdges,
	])

	const categorizedRecipes = useMemo(() => {
		if (!hideoutData) return []

		const localeTyped = locale as Locale
		const seen = new Set<string>()
		const catMap = new Map<
			string,
			{
				name: string
				recipes: { id: string; name: string; icon: string }[]
			}
		>()

		for (const recipe of hideoutData.recipes) {
			const itemId = normalizeItemId(recipe.result[0].item)
			if (seen.has(itemId)) continue
			seen.add(itemId)

			const catKey = recipe.category.key

			if (!catMap.has(catKey)) {
				catMap.set(catKey, {
					name: messageToString(recipe.category.lines, localeTyped),
					recipes: [],
				})
			}

			catMap.get(catKey)!.recipes.push({
				id: itemId,
				name: getItemName(itemId),
				icon: getItemIcon(itemId),
			})
		}

		return Array.from(catMap.entries()).map(([key, { name, recipes }]) => ({
			key,
			name,
			recipes,
		}))
	}, [hideoutData, getItemName, getItemIcon, normalizeItemId, locale])

	const filteredCategories = useMemo(() => {
		if (!searchQuery) return categorizedRecipes

		const q = searchQuery.toLowerCase()
		return categorizedRecipes
			.map((cat) => ({
				...cat,
				recipes: cat.recipes.filter((r) =>
					r.name.toLowerCase().includes(q)
				),
			}))
			.filter((cat) => cat.recipes.length > 0)
	}, [categorizedRecipes, searchQuery])

	const handleItemChange = useCallback(
		(val: string) => {
			setSelectedItem(val)
			setExpandedNodes(new Set([val]))
			const recipe = hideoutData?.recipes.find(
				(r) => normalizeItemId(r.result[0].item) === val
			)
			setDesiredQuantity(recipe?.result[0].amount ?? 1)
		},
		[hideoutData, normalizeItemId]
	)

	const accordionItems = useMemo(
		() =>
			filteredCategories.map((cat) => ({
				key: cat.key,
				title: cat.name,
				content: (
					<div className="flex flex-col gap-0.5">
						{cat.recipes.map((recipe) => (
							<button
								className={cn(
									'flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-background',
									selectedItem === recipe.id &&
										'font-bold text-border'
								)}
								key={recipe.id}
								onClick={() => handleItemChange(recipe.id)}
							>
								<Image
									alt={recipe.name}
									className="size-8 shrink-0 object-contain"
									height={24}
									src={recipe.icon}
									width={24}
								/>
								<span className="truncate font-semibold text-sm">
									{recipe.name}
								</span>
							</button>
						))}
					</div>
				),
			})),
		[filteredCategories, selectedItem, handleItemChange]
	)

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
				<Sidebar>
					<div className="flex flex-col gap-3">
						<Input
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Поиск..."
							value={searchQuery}
						/>

						<Accordion
							className="flex flex-col gap-1"
							items={accordionItems}
							selectionMode="multiple"
							size="sm"
							titleClass="px-0 py-0"
						/>
					</div>
				</Sidebar>
			</ReactFlow>
		</div>
	)
}
