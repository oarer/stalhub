'use client'

import {
	type MarkerPointerEvent,
	WebGLMarker,
	WebGLMarkerLayer,
} from '@oarer/leaflet-webgl-markers'
import L from 'leaflet'
import { useEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { useMarkerText, useSettlementText } from '@/hooks/useMarkerText'
import type { AtlasWaypoint } from '@/types/map.type'
import {
	waitAtlasMap,
	waitAtlasSheet,
} from '@/views/maps/marker-editor/lib/iconAtlas'
import { buildWorldAtlas, resolveSheetKey } from '../lib/worldAtlas'
import { worldToImagePx } from '../lib/worldCoords'

type WorldMarkersProps = {
	spots: AtlasWaypoint[]
	fullMaxLevel: number
	hiddenIcons?: Set<string>
	search?: string
	selectedUuid?: string | null
	editing?: boolean
}

type SpotEntry = {
	spot: AtlasWaypoint
	px: number
	py: number
}

const MAX_POPUP_ITEMS = 12

export default function WorldMarkers({
	spots,
	fullMaxLevel,
	hiddenIcons,
	search,
	selectedUuid = null,
	editing = false,
}: WorldMarkersProps) {
	const map = useMap()
	const popupRef = useRef<L.Popup | null>(null)
	const dupIndexRef = useRef(new Map<string, number>())
	const text = useMarkerText()
	const settlementText = useSettlementText()

	const filteredSpots = useMemo(() => {
		const query = (search ?? '').trim().toLowerCase()
		if (!query)
			return spots.filter((spot) => !hiddenIcons?.has(spot.title_key))
		return spots.filter((spot) => {
			if (hiddenIcons?.has(spot.title_key)) return false
			return (
				spot.title_key.toLowerCase().includes(query) ||
				text(spot.title_key).toLowerCase().includes(query) ||
				(spot.settlement !== undefined &&
					(spot.settlement.toLowerCase().includes(query) ||
						settlementText(spot.settlement)
							.toLowerCase()
							.includes(query)))
			)
		})
	}, [spots, hiddenIcons, search, text, settlementText])

	useEffect(() => {
		if (filteredSpots.length === 0) return
		let disposed = false
		let markerLayer: WebGLMarkerLayer | null = null
		const badgeMarkers: L.Marker[] = []

		const groups = new Map<string, SpotEntry[]>()
		for (const spot of filteredSpots) {
			const [px, py] = worldToImagePx(spot)
			const key = `${Math.round(px)},${Math.round(py)}`
			const group = groups.get(key)
			const entry = { spot, px, py }
			if (group) group.push(entry)
			else groups.set(key, [entry])
		}
		const groupByKey = (spot: AtlasWaypoint) => {
			const [px, py] = worldToImagePx(spot)
			return groups.get(`${Math.round(px)},${Math.round(py)}`)
		}

		const getPopup = () => {
			if (!popupRef.current) {
				popupRef.current = L.popup({
					autoPan: false,
					closeButton: false,
					className: 'world-popup',
				})
			}
			return popupRef.current
		}

		const onMarkerClick = (event: MarkerPointerEvent) => {
			const initial = event.marker.data as AtlasWaypoint | undefined
			if (!initial) return
			const group = groupByKey(initial)
			if (!group) return
			const [px, py] = worldToImagePx(initial)
			const key = `${Math.round(px)},${Math.round(py)}`
			let picked = group[0].spot
			if (group.length > 1) {
				const index = (dupIndexRef.current.get(key) ?? 0) % group.length
				dupIndexRef.current.set(key, index + 1)
				picked = group[index].spot
			}
			if (editing) {
				window.dispatchEvent(
					new CustomEvent('world-marker-picked', { detail: picked })
				)
				return
			}
			const items = group
				.slice(0, MAX_POPUP_ITEMS)
				.map(
					({ spot }) =>
						`<div class="world-popup-row">${text(spot.title_key)}</div>`
				)
			if (group.length > MAX_POPUP_ITEMS) {
				items.push(
					`<div class="world-popup-more">… ещё ${group.length - MAX_POPUP_ITEMS} меток здесь</div>`
				)
			}
			const popup = getPopup()
				.setLatLng(event.latlng)
				.setContent(
					`<div class="world-popup-body">${items.join('')}</div>`
				)
				.openOn(map)
			popup.getElement()?.animate(
				[
					{ opacity: 0, transform: 'scale(0.95)' },
					{ opacity: 1, transform: 'scale(1)' },
				],
				{
					duration: 160,
					easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				}
			)
		}
		const onError = (event: { stage: string; message: string }) => {
			console.error('World markers:', event.stage, event.message)
		}

		void (async () => {
			let image: HTMLImageElement
			let sheet: Awaited<ReturnType<typeof waitAtlasSheet>>
			try {
				;[image, sheet] = await Promise.all([
					waitAtlasMap(),
					waitAtlasSheet(),
				])
			} catch (error) {
				if (!disposed) console.error('World markers atlas:', error)
				return
			}
			if (disposed) return

			const sheetKeys = [...groups.values()]
				.map((group) => resolveSheetKey(group[0].spot.icon, sheet))
				.filter((key): key is string => key !== null)
			const atlas = buildWorldAtlas(image, sheet, sheetKeys)
			if (!atlas) return

			const layer = new WebGLMarkerLayer({
				iconSize: 24,
				atlasColumns: atlas.columns,
				atlasRows: atlas.rows,
			})
			layer.addTo(map)
			markerLayer = layer
			layer.on('click', onMarkerClick)
			layer.on('error', onError)
			layer.setAtlas({
				textureUrl: atlas.canvas.toDataURL(),
				columns: atlas.columns,
				rows: atlas.rows,
			})

			for (const group of groups.values()) {
				const first = group[0]
				const sheetKey = resolveSheetKey(first.spot.icon, sheet)
				const frame = sheetKey ? atlas.frames.get(sheetKey) : undefined
				if (frame === undefined) continue
				const latlng = map.unproject([first.px, first.py], fullMaxLevel)
				const highlighted = group.some(
					({ spot }) => spot.uuid === selectedUuid
				)
				if (group.length === 1) {
					const spot = first.spot
					layer.addMarker(
						new WebGLMarker({
							latlng,
							color: highlighted ? [0.3, 0.7, 1] : [1, 1, 1],
							size: highlighted ? 34 : null,
							frame,
							data: spot,
						})
					)
					continue
				}
				layer.addMarker(
					new WebGLMarker({
						latlng,
						color: highlighted ? [0.3, 0.7, 1] : [1, 0.82, 0.25],
						size: null,
						frame,
						data: first.spot,
					})
				)
				const badge = L.marker(latlng, {
					interactive: false,
					icon: L.divIcon({
						className: 'world-marker-badge',
						html: `<span class="world-marker-badge-count">${group.length}</span>`,
						iconSize: [18, 18],
						iconAnchor: [20, -2],
					}),
				})
				badge.addTo(map)
				badgeMarkers.push(badge)
			}
		})()

		return () => {
			disposed = true
			if (markerLayer) {
				markerLayer.off('click', onMarkerClick)
				markerLayer.off('error', onError)
				markerLayer.remove()
			}
			for (const badge of badgeMarkers) badge.remove()
			popupRef.current?.remove()
			popupRef.current = null
		}
	}, [map, filteredSpots, fullMaxLevel, editing, selectedUuid, text])

	return null
}
