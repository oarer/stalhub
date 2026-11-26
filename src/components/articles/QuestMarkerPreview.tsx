'use client'

import dynamic from 'next/dynamic'
import { WORLD_MAP } from '@/constants/map.const'
import type { QuestMapData } from '@/types/article.type'

const PreviewMap = dynamic(() => import('./QuestMarkerMap'), { ssr: false })

export function QuestMarkerPreview({
	data,
	className = '',
}: {
	data: QuestMapData | null
	className?: string
}) {
	if (!data) return null
	return (
		<div
			className={`border-primary/20 h-80 overflow-hidden rounded-lg border-2 ${className}`}
		>
			<PreviewMap config={WORLD_MAP} markers={data.markers} />
		</div>
	)
}
