'use client'

import { QuestMarkerPreview } from '@/components/articles/QuestMarkerPreview'
import type { QuestMapData } from '@/types/article.type'

export type QuestMapMarker = QuestMapData['markers'][number]

export function createQuestMapSnippet(
	mapId: string,
	mapName: string,
	markers: QuestMapMarker[]
) {
	return `<QuestMap mapId=${JSON.stringify(mapId)} mapName=${JSON.stringify(mapName)} markers={${JSON.stringify(markers)}} />\n`
}

export function QuestMap({
	mapId,
	mapName,
	markers = [],
}: {
	mapId: string
	mapName?: string
	markers?: QuestMapMarker[]
}) {
	const normalizedMapId = mapId?.trim()
	if (!normalizedMapId) return null

	const normalizedMarkers = markers.flatMap((marker) => {
		const x = Number(marker?.x)
		const y = Number(marker?.y)
		if (!Number.isFinite(x) || !Number.isFinite(y)) return []

		return [
			{
				x,
				y,
				...(marker.label?.trim() ? { label: marker.label.trim() } : {}),
			},
		]
	})

	return (
		<QuestMarkerPreview
			className="not-prose my-6"
			data={{
				map_id: normalizedMapId,
				map_name: mapName?.trim() || undefined,
				markers: normalizedMarkers,
			}}
		/>
	)
}
