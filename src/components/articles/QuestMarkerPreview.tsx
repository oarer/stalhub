'use client'

import { Icon } from '@iconify/react'
import dynamic from 'next/dynamic'
import { useMaps } from '@/hooks/useMaps'
import type { QuestMapData } from '@/types/article.type'

const PreviewMap = dynamic(() => import('./QuestMarkerMap'), { ssr: false })

export function QuestMarkerPreview({
	data,
	className = '',
}: {
	data: QuestMapData | null
	className?: string
}) {
	const { maps } = useMaps()
	if (!data) return null
	const config = maps.find((map) => map.name === data.map_id)
	if (!config)
		return (
			<div
				className={`rounded-lg border border-primary/20 bg-card p-4 ${className}`}
			>
				<div className="flex items-center gap-2">
					<Icon icon="lucide:map-pin" />
					{data.map_name ?? data.map_id}
				</div>
			</div>
		)
	return (
		<div
			className={`h-80 overflow-hidden rounded-lg border-2 border-primary/20 ${className}`}
		>
			<PreviewMap config={config} markers={data.markers} />
		</div>
	)
}
