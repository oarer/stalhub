import type { Edge, Node } from '@xyflow/react'
import { useEdgesState, useNodesState } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { ItemListing } from '@/types/api.type'
import type { Hideout, Recipe } from '@/types/hideout.type'
import type { Locale } from '@/types/item.type'

import { elkLayout } from '../utils/elkLayout'
import { normalizeItemId } from '../utils/hideoutUtils'

interface UseHideoutGraphReturn {
	nodes: Node[]
	edges: Edge[]
	onNodesChange: ReturnType<typeof useNodesState<Node>>[2]
	centerTarget: { x: number; y: number } | null
	selectedItem: string
	desiredQuantity: number
	expandedNodes: Set<string>
	handleItemChange: (val: string) => void
}

export function useHideoutGraph(
	hideoutData: Hideout | undefined,
	items: ItemListing[] | null,
	locale: string
): UseHideoutGraphReturn {
	const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
	const [edges, setEdges] = useEdgesState<Edge>([])

	const [selectedItem, setSelectedItem] = useState('')
	const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
	const [desiredQuantity, setDesiredQuantity] = useState(1)

	const [centerTarget, setCenterTarget] = useState<{
		x: number
		y: number
	} | null>(null)

	const lastCenteredItem = useRef<string | null>(null)
	const prevNodeIdsRef = useRef<Set<string> | null>(null)

	const itemMap = useMemo(() => {
		const map = new Map<string, ItemListing>()

		for (const item of items ?? []) {
			map.set(normalizeItemId(item.data), item)
		}

		return map
	}, [items])

	const recipeMap = useMemo(() => {
		const map = new Map<string, Recipe>()

		for (const recipe of hideoutData?.recipes ?? []) {
			for (const result of recipe.result) {
				map.set(normalizeItemId(result.item), recipe)
			}
		}

		return map
	}, [hideoutData])

	const toggleNode = useCallback((id: string) => {
		setExpandedNodes((prev) => {
			const next = new Set(prev)

			if (next.has(id)) {
				next.delete(id)
			} else {
				next.add(id)
			}

			return next
		})
	}, [])

	const getName = useCallback(
		(id: string) => {
			const entry = itemMap.get(id)

			return (
				entry?.name[locale as Locale] ??
				Object.values(entry?.name ?? {})[0] ??
				id
			)
		},
		[itemMap, locale]
	)

	const getIcon = useCallback(
		(id: string) => {
			const entry = itemMap.get(id)

			return entry?.icon
				? `https://raw.githubusercontent.com/oarer/sc-db/main/merged${entry.icon}`
				: ''
		},
		[itemMap]
	)

	useEffect(() => {
		const first = hideoutData?.recipes[0]
		if (!selectedItem && first) {
			const item = normalizeItemId(first.result[0].item)

			setSelectedItem(item)
			setExpandedNodes(new Set([item]))
			setDesiredQuantity(first.result[0].amount)
		}
	}, [hideoutData, selectedItem])

	/* biome-ignore lint/correctness/useExhaustiveDependencies: React state setters are stable */
	useEffect(() => {
		if (!selectedItem) return

		const newNodes: Node[] = []
		const newEdges: Edge[] = []

		const visited = new Set<string>()

		const traverse = (raw: string, quantity: number, isRoot = false) => {
			const id = normalizeItemId(raw)

			if (visited.has(id)) return
			visited.add(id)

			const recipe = recipeMap.get(id)
			const expanded = expandedNodes.has(id)

			const perCraft =
				recipe?.result.find((r) => normalizeItemId(r.item) === id)
					?.amount ?? 1

			newNodes.push({
				id,
				type: 'custom',
				position: {
					x: 0,
					y: 0,
				},
				data: {
					label: getName(id),
					icon: getIcon(id),

					hasRecipe: !!recipe,

					isExpanded: expanded,
					isRoot,

					quantity: isRoot ? desiredQuantity : quantity,

					perCraft,

					price:
						recipe?.result.find(
							(r) => normalizeItemId(r.item) === id
						)?.price ?? null,

					onToggle: () => toggleNode(id),

					onQuantityChange: isRoot
						? (delta: number) => {
								setDesiredQuantity((prev) =>
									Math.max(perCraft, prev + delta)
								)
							}
						: undefined,

					energyPerCraft: recipe?.energy,

					ingredients: recipe?.ingredients.map((ing) => {
						const ingId = normalizeItemId(ing.item)

						return {
							name: getName(ingId),
							icon: getIcon(ingId),

							total: Math.ceil(
								(quantity / perCraft) * ing.amount
							),
						}
					}),
				},
			})

			if (!recipe || !expanded) {
				return
			}

			const multiplier = quantity / perCraft

			for (const ing of recipe.ingredients) {
				const ingId = normalizeItemId(ing.item)

				newEdges.push({
					id: `${id}-${ingId}`,
					source: id,
					target: ingId,
				})

				traverse(ing.item, Math.ceil(multiplier * ing.amount))
			}
		}

		traverse(selectedItem, desiredQuantity, true)

		const nodeIds = new Set(newNodes.map((n) => n.id))

		const validEdges = newEdges.filter(
			(e) => nodeIds.has(e.source) && nodeIds.has(e.target)
		)

		const dataMap = new Map(newNodes.map((n) => [n.id, n.data]))

		const newIds = new Set(nodeIds)

		const structural =
			!prevNodeIdsRef.current ||
			newIds.size !== prevNodeIdsRef.current.size ||
			![...newIds].every((id) => prevNodeIdsRef.current!.has(id))

		prevNodeIdsRef.current = newIds

		if (structural) {
			elkLayout(newNodes, validEdges).then((layout) => {
				setNodes((prev) => {
					const oldMap = new Map(prev.map((n) => [n.id, n]))

					return layout.nodes.map((n) => {
						const old = oldMap.get(n.id)

						return {
							...old,

							id: n.id,
							type: 'custom',

							position: n.position,

							data: dataMap.get(n.id) ?? old?.data ?? {},
						}
					})
				})

				setEdges(validEdges)

				if (selectedItem !== lastCenteredItem.current) {
					lastCenteredItem.current = selectedItem

					const root = layout.nodes.find((n) => n.id === selectedItem)

					if (root) {
						setCenterTarget({
							x: root.position.x + (root.width ?? 320) / 2,

							y: root.position.y + (root.height ?? 80) / 2,
						})
					}
				}
			})
		} else {
			setNodes((prev) =>
				prev.map((node) => {
					const data = dataMap.get(node.id)

					if (!data) {
						return node
					}

					return {
						...node,
						data,
					}
				})
			)

			setEdges(validEdges)
		}
	}, [
		selectedItem,
		desiredQuantity,
		expandedNodes,
		recipeMap,
		getName,
		getIcon,
		toggleNode,
	])

	const handleItemChange = useCallback(
		(val: string) => {
			setSelectedItem(val)

			setExpandedNodes(new Set([val]))

			const recipe = hideoutData?.recipes.find(
				(r) => normalizeItemId(r.result[0].item) === val
			)

			setDesiredQuantity(recipe?.result[0].amount ?? 1)
		},
		[hideoutData]
	)

	return {
		nodes,
		edges,
		onNodesChange,
		centerTarget,
		selectedItem,
		desiredQuantity,
		expandedNodes,
		handleItemChange,
	}
}
