'use client'

import {
	type MarkerPointerEvent,
	WebGLMarker,
	WebGLMarkerLayer,
} from '@oarer/leaflet-webgl-markers'
import L from 'leaflet'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { useMarkerText, useSettlementText } from '@/hooks/useMarkerText'
import type { AtlasWaypoint } from '@/types/map.type'
import {
	waitAtlasMap,
	waitAtlasSheet,
} from '@/views/maps/marker-editor/lib/iconAtlas'
import {
	acquirePointerCursor,
	animatePopupIn,
	getLayerCanvas,
	releasePointerCursor,
} from '../lib/webglLayer'
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

type RGB = [number, number, number]

type VisualEntry = {
	gl: WebGLMarker
	uuids: string[]
	baseColor: RGB
	baseSize: number
	hiColor: RGB
	hiSize: number
}

const MAX_POPUP_ITEMS = 12
const ICON_SIZE = 24
const HIGHLIGHT_SIZE = 34
const BASE_COLOR: RGB = [1, 1, 1]
const GROUP_COLOR: RGB = [1, 0.82, 0.25]
const HIGHLIGHT_COLOR: RGB = [0.3, 0.7, 1]
const HIGHLIGHT_DURATION = 180
const APPEAR_DURATION = 220

function lerpColor(from: RGB, to: RGB, k: number): RGB {
	return [
		from[0] + (to[0] - from[0]) * k,
		from[1] + (to[1] - from[1]) * k,
		from[2] + (to[2] - from[2]) * k,
	]
}

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
	const layerRef = useRef<WebGLMarkerLayer | null>(null)
	const entriesRef = useRef<VisualEntry[]>([])
	const tweensRef = useRef<Map<number, number>>(new Map())
	const selectedUuidRef = useRef<string | null>(null)
	const selectedPropRef = useRef<string | null>(selectedUuid)
	selectedPropRef.current = selectedUuid
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

	const cancelTween = useCallback((id: number) => {
		const raf = tweensRef.current.get(id)
		if (raf !== undefined) {
			cancelAnimationFrame(raf)
			tweensRef.current.delete(id)
		}
	}, [])

	const cancelAllTweens = useCallback(() => {
		for (const raf of tweensRef.current.values()) cancelAnimationFrame(raf)
		tweensRef.current.clear()
	}, [])

	const tweenMarker = useCallback(
		(gl: WebGLMarker, toColor: RGB, toSize: number) => {
			const layer = layerRef.current
			if (!layer || layer.getMarker(gl.id) !== gl) return
			cancelTween(gl.id)
			const fromColor: RGB = [gl.color[0], gl.color[1], gl.color[2]]
			const fromSize = typeof gl.size === 'number' ? gl.size : ICON_SIZE
			const start = performance.now()
			const step = (now: number) => {
				const current = layerRef.current
				if (!current || current.getMarker(gl.id) !== gl) {
					tweensRef.current.delete(gl.id)
					return
				}
				const k = Math.min(1, (now - start) / HIGHLIGHT_DURATION)
				const eased = 1 - (1 - k) ** 3
				current.updateMarker(gl.id, {
					color: lerpColor(fromColor, toColor, eased),
					size: fromSize + (toSize - fromSize) * eased,
				})
				if (k < 1) {
					tweensRef.current.set(gl.id, requestAnimationFrame(step))
				} else {
					tweensRef.current.delete(gl.id)
				}
			}
			tweensRef.current.set(gl.id, requestAnimationFrame(step))
		},
		[cancelTween]
	)

	const applySelection = useCallback(
		(uuid: string | null) => {
			const entries = entriesRef.current
			const prev = selectedUuidRef.current
			selectedUuidRef.current = uuid
			for (const entry of entries) {
				const wasOn = prev != null && entry.uuids.includes(prev)
				const isOn = uuid != null && entry.uuids.includes(uuid)
				if (wasOn === isOn) continue
				tweenMarker(
					entry.gl,
					isOn ? entry.hiColor : entry.baseColor,
					isOn ? entry.hiSize : entry.baseSize
				)
			}
		},
		[tweenMarker]
	)

	useEffect(() => {
		applySelection(selectedUuid)
	}, [selectedUuid, applySelection])

	useEffect(() => {
		if (filteredSpots.length === 0) return
		let disposed = false
		let markerLayer: WebGLMarkerLayer | null = null
		let hovering = false
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
			const element = popup.getElement()
			if (element) animatePopupIn(element)
		}
		const onOver = () => {
			if (hovering) return
			hovering = true
			acquirePointerCursor(map)
		}
		const onOut = () => {
			if (!hovering) return
			hovering = false
			releasePointerCursor(map)
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
				iconSize: ICON_SIZE,
				atlasColumns: atlas.columns,
				atlasRows: atlas.rows,
			})
			layer.addTo(map)
			markerLayer = layer
			layerRef.current = layer
			layer.on('click', onMarkerClick)
			layer.on('error', onError)
			layer.on('mouseover', onOver)
			layer.on('mouseout', onOut)
			layer.setAtlas({
				textureUrl: atlas.canvas.toDataURL(),
				columns: atlas.columns,
				rows: atlas.rows,
			})

			const markers: WebGLMarker[] = []
			const entries: VisualEntry[] = []
			for (const group of groups.values()) {
				const first = group[0]
				const sheetKey = resolveSheetKey(first.spot.icon, sheet)
				const frame = sheetKey ? atlas.frames.get(sheetKey) : undefined
				if (frame === undefined) continue
				const latlng = map.unproject([first.px, first.py], fullMaxLevel)
				const isGroup = group.length > 1
				const gl = new WebGLMarker({
					latlng,
					color: isGroup ? GROUP_COLOR : BASE_COLOR,
					size: ICON_SIZE,
					frame,
					data: first.spot,
				})
				markers.push(gl)
				entries.push({
					gl,
					uuids: group.map(({ spot }) => spot.uuid),
					baseColor: isGroup ? GROUP_COLOR : BASE_COLOR,
					baseSize: ICON_SIZE,
					hiColor: HIGHLIGHT_COLOR,
					hiSize: isGroup ? ICON_SIZE : HIGHLIGHT_SIZE,
				})

				if (isGroup) {
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
			}

			if (disposed) return
			layer.setMarkers(markers)
			entriesRef.current = entries
			selectedUuidRef.current = null
			applySelection(selectedPropRef.current)

			const canvas = getLayerCanvas(layer)
			if (canvas) {
				canvas.style.transition = 'none'
				canvas.style.opacity = '0'
				void canvas.offsetWidth
				canvas.style.transition = `opacity ${APPEAR_DURATION}ms ease-out`
				canvas.style.opacity = '1'
			}
		})()

		return () => {
			disposed = true
			if (hovering) {
				hovering = false
				releasePointerCursor(map)
			}
			if (markerLayer) {
				markerLayer.off('click', onMarkerClick)
				markerLayer.off('error', onError)
				markerLayer.off('mouseover', onOver)
				markerLayer.off('mouseout', onOut)
				cancelAllTweens()
				markerLayer.remove()
			}
			layerRef.current = null
			entriesRef.current = []
			for (const badge of badgeMarkers) badge.remove()
			popupRef.current?.remove()
			popupRef.current = null
		}
	}, [
		map,
		filteredSpots,
		fullMaxLevel,
		editing,
		text,
		applySelection,
		cancelAllTweens,
	])

	return null
}
