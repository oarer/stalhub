'use client'

import {
	Background,
	BackgroundVariant,
	type NodeChange,
	Panel,
	ReactFlow,
	useReactFlow,
	useViewport,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { useDashboardStore } from '@/stores/useDashboard.store'
import { type DashboardNodeType, dashboardNodeTypes } from './DashboardNode'

const handleNodeClick = () => undefined

function CanvasResetButton() {
	const t = useTranslations()
	const { x, y } = useViewport()
	const { setViewport } = useReactFlow()

	if (Math.abs(x) + Math.abs(y) < 32) return null

	return (
		<Panel position="bottom-right">
			<Button
				className="gap-2"
				onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
				variant={'secondary'}
			>
				<Icon className="size-4" icon="lucide:locate-fixed" />
				<p className="font-semibold">{t('dashboard.resetView')}</p>
			</Button>
		</Panel>
	)
}

export function DashboardCanvas() {
	const items = useDashboardStore((s) => s.items)
	const moveItem = useDashboardStore((s) => s.moveItem)
	const resizeItem = useDashboardStore((s) => s.resizeItem)

	const nodesCache = useRef(new Map<string, DashboardNodeType>())

	const nodes = useMemo(() => {
		const cache = nodesCache.current
		const result: DashboardNodeType[] = []

		for (const item of items) {
			const cached = cache.get(item.id)
			const unchanged =
				cached &&
				cached.position?.x === item.x &&
				cached.position?.y === item.y &&
				cached.width === item.w &&
				cached.height === item.h

			const node: DashboardNodeType = unchanged
				? cached
				: {
						id: item.id,
						type: 'dashboard',
						data: { widgetId: item.widgetId },
						position: { x: item.x, y: item.y },
						width: item.w,
						height: item.h,
						deletable: false,
						selectable: false,
						measured:
							cached?.measured ?? { width: item.w, height: item.h },
					}

			cache.set(item.id, node)
			result.push(node)
		}

		for (const id of cache.keys()) {
			if (!items.some((item) => item.id === id)) {
				cache.delete(id)
			}
		}

		return result
	}, [items])

	const onNodesChange = useCallback(
		(changes: NodeChange<DashboardNodeType>[]) => {
			for (const change of changes) {
				if (change.type === 'position' && change.position) {
					moveItem(change.id, change.position.x, change.position.y)
				}
				if (change.type === 'dimensions' && change.dimensions) {
					resizeItem(
						change.id,
						change.dimensions.width,
						change.dimensions.height
					)
					const cached = nodesCache.current.get(change.id)
					if (cached) {
						cached.measured = { ...change.dimensions }
						cached.width = change.dimensions.width
						cached.height = change.dimensions.height
					}
				}
			}
		},
		[moveItem, resizeItem]
	)

	return (
		<div className="min-h-0 w-full flex-1 overflow-hidden">
			<ReactFlow
				attributionPosition="top-right"
				defaultViewport={{ x: 0, y: 0, zoom: 1 }}
				deleteKeyCode={null}
				edges={[]}
				edgesFocusable={false}
				elementsSelectable={false}
				fitView={false}
				maxZoom={1.5}
				minZoom={0.25}
				nodes={nodes}
				nodesConnectable={false}
				nodesDraggable
				nodeTypes={dashboardNodeTypes}
				onNodeClick={handleNodeClick}
				onNodesChange={onNodesChange}
				panOnDrag
				selectionOnDrag={false}
				zoomOnDoubleClick={false}
				zoomOnPinch
				zoomOnScroll
			>
				<Background
					color="var(--border-secondary)"
					gap={24}
					size={1.5}
					variant={BackgroundVariant.Dots}
				/>
				<CanvasResetButton />
			</ReactFlow>
		</div>
	)
}
