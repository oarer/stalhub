'use client'

import { Icon } from '@iconify/react'
import { type Node, type NodeProps, NodeResizer } from '@xyflow/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useDashboardStore } from '@/stores/useDashboard.store'
import { getWidgetDef } from '../widgets/registry'
import { WidgetContent } from '../widgets/WidgetContent'

export type DashboardNodeType = Node<{ widgetId: string }, 'dashboard'>

export const DashboardNodeView = memo(function DashboardNodeView({
	id,
	data,
}: NodeProps<DashboardNodeType>) {
	const t = useTranslations()
	const removeWidget = useDashboardStore((s) => s.removeWidget)

	const def = getWidgetDef(data.widgetId)
	if (!def) return null

	return (
		<>
			<NodeResizer
				isVisible
				minHeight={def.minHeight}
				minWidth={def.minWidth}
			/>

			<div className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-background shadow-lg ring-2 ring-border/60">
				<div className="flex shrink-0 cursor-move touch-none select-none items-center justify-between gap-2 border-border-secondary border-b px-3 py-2">
					<div className="flex min-w-0 items-center gap-2">
						<Icon
							className="shrink-0 text-cyan-500 text-lg"
							icon={def.icon}
						/>
						<p className="truncate font-semibold text-sm">
							{t(def.titleKey)}
						</p>
					</div>

					<div className="flex shrink-0 items-center gap-1">
						<Link
							aria-label={t('dashboard.openFull')}
							className="nodrag flex size-7 items-center justify-center rounded-md text-text-accent transition-colors hover:bg-accent hover:text-text"
							href={def.fullPath}
							title={t('dashboard.openFull')}
						>
							<Icon
								className="text-base"
								icon="lucide:external-link"
							/>
						</Link>
						<Button
							aria-label={t('dashboard.removeWidget')}
							className="nodrag opacity-0 group-hover:opacity-100"
							onClick={() => removeWidget(id)}
							title={t('dashboard.removeWidget')}
							variant={'danger'}
						>
							<Icon className="text-base" icon="lucide:x" />
						</Button>
					</div>
				</div>

				<div
					className={cn(
						'nodrag nowheel min-h-0 flex-1 px-4',
						def.scrollable === false
							? 'overflow-hidden'
							: 'overflow-y-auto overscroll-contain'
					)}
				>
					<WidgetBody widgetId={data.widgetId} />
				</div>
			</div>
		</>
	)
})

const WidgetBody = memo(function WidgetBody({
	widgetId,
}: {
	widgetId: string
}) {
	return <WidgetContent widgetId={widgetId} />
})

export const dashboardNodeTypes = { dashboard: DashboardNodeView }
