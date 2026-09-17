'use client'

import {
	type MarkerPointerEvent,
	WebGLMarker,
	WebGLMarkerLayer,
} from '@oarer/leaflet-webgl-markers'
import L from 'leaflet'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import { placeGoalMarker } from '../lib/goalMarker'
import {
	acquirePointerCursor,
	animatePopupIn,
	getLayerCanvas,
	releasePointerCursor,
} from '../lib/webglLayer'
import { worldToImagePx } from '../lib/worldCoords'

export type TeleportDestination = {
	index?: number
	loc?: string
	x: number
	y?: number
	z: number
	mx?: number
	mz?: number
}

export type SourceMarker = {
	i?: number
	b?: string
	w?: number[]
	x?: number
	z?: number
	n?: string
	o?: string
	g?: string
	d?: TeleportDestination[]
}

type DestinationEntry = {
	dest: TeleportDestination
	px: [number, number]
}

type Labels = {
	markerName: (marker: SourceMarker) => string
	destName: (loc: string) => string
	groupName: (group: string) => string
	destinations: string
}

type RGB = [number, number, number]

const COLOR_FILTERED: RGB = [0.98, 0.55, 0.2]
const COLOR_TELEPORT: RGB = [0.22, 0.74, 0.97]
const COLOR_TELEPORT_SELECTED: RGB = [1, 0.4, 0.45]

const SIZE_FILTERED = 8
const SIZE_TELEPORT = 12
const SIZE_TELEPORT_SELECTED = 18

const HIGHLIGHT_DURATION = 180
const APPEAR_DURATION = 220

function lerpColor(from: RGB, to: RGB, k: number): RGB {
	return [
		from[0] + (to[0] - from[0]) * k,
		from[1] + (to[1] - from[1]) * k,
		from[2] + (to[2] - from[2]) * k,
	]
}

function isTeleport(marker: SourceMarker): boolean {
	return Array.isArray(marker.d) && marker.d.length > 0
}

function toImagePx(marker: {
	w?: number[]
	x?: number
	z?: number
}): [number, number] | null {
	if (Array.isArray(marker.w) && marker.w.length >= 3) {
		return worldToImagePx({ x: marker.w[0], z: marker.w[2] })
	}
	if (typeof marker.x === 'number' && typeof marker.z === 'number') {
		return [marker.x, marker.z]
	}
	return null
}

function destToImagePx(dest: TeleportDestination): [number, number] | null {
	if (typeof dest.x === 'number' && typeof dest.z === 'number') {
		return worldToImagePx({ x: dest.x, z: dest.z })
	}
	if (typeof dest.mx === 'number' && typeof dest.mz === 'number') {
		return [dest.mx, dest.mz]
	}
	return null
}

function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (char) => {
		switch (char) {
			case '&':
				return '&amp;'
			case '<':
				return '&lt;'
			case '>':
				return '&gt;'
			case '"':
				return '&quot;'
			default:
				return '&#39;'
		}
	})
}

export default function FilteredWorldMarkers({
	markers,
}: {
	markers: SourceMarker[]
}) {
	const map = useMap()
	const t = useTranslations('markers')
	const [selected, setSelected] = useState<SourceMarker | null>(null)
	const selectedRef = useRef<SourceMarker | null>(null)
	const selectedGlRef = useRef<WebGLMarker | null>(null)
	const glLayerRef = useRef<WebGLMarkerLayer | null>(null)
	const markerClickRef = useRef(false)
	const popupRef = useRef<L.Popup | null>(null)
	const lastPopupLatLngRef = useRef<L.LatLng | null>(null)
	const goalRef = useRef<L.Marker | null>(null)
	const tweensRef = useRef<Map<number, number>>(new Map())

	selectedRef.current = selected

	const labelsRef = useRef<Labels>({
		markerName: (_marker: SourceMarker) => '',
		destName: (loc: string) => loc,
		groupName: (group: string) => group,
		destinations: '',
	})

	labelsRef.current = {
		markerName: (marker) => {
			if (marker.o) {
				const key = `go.${marker.o}.name`
				if (t.has(key)) return t(key)
			}
			if (marker.n) {
				const key = `go.${marker.n}.name`
				if (t.has(key)) return t(key)
			}
			return marker.n ?? marker.o ?? marker.b ?? ''
		},
		destName: (loc) => {
			const key = `location.${loc}.name`
			return t.has(key) ? t(key) : loc
		},
		groupName: (group) => {
			const key = `group.${group}`
			return t.has(key) ? t(key) : group
		},
		destinations: t.has('info.destinations') ? t('info.destinations') : '',
	}

	const jumpTo = useCallback(
		(px: number, py: number) => {
			const latlng = map.unproject([px, py], map.getMaxZoom())
			map.setView(latlng, Math.max(map.getZoom(), 13))
			goalRef.current = placeGoalMarker(map, latlng, goalRef.current)
		},
		[map]
	)

	const openPopup = useCallback(
		(marker: SourceMarker, latlng: L.LatLng) => {
			const labels = labelsRef.current
			const rows: string[] = [
				`<div class="world-popup-row">${escapeHtml(labels.markerName(marker))}</div>`,
			]
			if (marker.g) {
				rows.push(
					`<div class="world-popup-sub">${escapeHtml(labels.groupName(marker.g))}</div>`
				)
			}
			const destinations = (marker.d ?? [])
				.map((dest) => ({ dest, px: destToImagePx(dest) }))
				.filter((entry): entry is DestinationEntry => entry.px !== null)
			if (destinations.length > 0 && labels.destinations) {
				rows.push(
					`<div class="world-popup-sub">${escapeHtml(labels.destinations)}</div>`
				)
				rows.push(
					`<div class="world-popup-dests">${destinations
						.map(
							(entry, index) =>
								`<div class="world-popup-dest" data-dest="${index}">${escapeHtml(labels.destName(entry.dest.loc ?? ''))}</div>`
						)
						.join('')}</div>`
				)
			}
			if (!popupRef.current) {
				popupRef.current = L.popup({
					autoPan: false,
					closeButton: false,
					closeOnClick: false,
					className: 'world-popup',
				})
			}
			const popup = popupRef.current
				.setLatLng(latlng)
				.setContent(
					`<div class="world-popup-body font-semibold">${rows.join('')}</div>`
				)
				.openOn(map)
			const element = popup.getElement()
			const previousLatLng = lastPopupLatLngRef.current
			lastPopupLatLngRef.current = latlng

			if (element) {
				animatePopupIn(element)
				const previousTransform = element.style.transform || ''
				const match = /translate3?d?\(([-\d.]+)px,\s*([-\d.]+)px/.exec(
					previousTransform
				)
				if (previousLatLng && match) {
					const current = map.latLngToContainerPoint(latlng)
					const previous = map.latLngToContainerPoint(previousLatLng)
					const dx = previous.x - current.x
					const dy = previous.y - current.y
					element.animate(
						[
							{
								transform: `translate3d(${Number(match[1]) + dx}px, ${Number(match[2]) + dy}px, 0)`,
							},
							{ transform: previousTransform },
						],
						{
							duration: 180,
							easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
						}
					)
				}
			}
			popup
				.getElement()
				?.querySelectorAll<HTMLElement>('[data-dest]')
				.forEach((element) => {
					element.addEventListener('click', (event) => {
						event.stopPropagation()
						const entry = destinations[Number(element.dataset.dest)]
						if (entry) jumpTo(entry.px[0], entry.px[1])
					})
				})
		},
		[map, jumpTo]
	)

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

	const animateMarker = useCallback(
		(
			gl: WebGLMarker,
			fromColor: RGB,
			fromSize: number,
			toColor: RGB,
			toSize: number
		) => {
			const layer = glLayerRef.current
			if (!layer || layer.getMarker(gl.id) !== gl) return
			cancelTween(gl.id)
			const start = performance.now()
			const step = (now: number) => {
				const current = glLayerRef.current
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

	const setGlHighlight = useCallback(
		(gl: WebGLMarker, on: boolean) => {
			animateMarker(
				gl,
				on ? COLOR_TELEPORT : COLOR_TELEPORT_SELECTED,
				on ? SIZE_TELEPORT : SIZE_TELEPORT_SELECTED,
				on ? COLOR_TELEPORT_SELECTED : COLOR_TELEPORT,
				on ? SIZE_TELEPORT_SELECTED : SIZE_TELEPORT
			)
		},
		[animateMarker]
	)

	useEffect(() => {
		const layer = new WebGLMarkerLayer({ iconSize: SIZE_FILTERED })
		layer.addTo(map)
		glLayerRef.current = layer

		const onClick = (event: MarkerPointerEvent) => {
			markerClickRef.current = true
			const marker = event.marker.data as SourceMarker | undefined
			if (!marker) return
			if (isTeleport(marker)) {
				if (selectedRef.current === marker) {
					selectedRef.current = null
					setGlHighlight(event.marker, false)
					selectedGlRef.current = null
					setSelected(null)
					popupRef.current?.close()
					lastPopupLatLngRef.current = null
					return
				}
				if (
					selectedGlRef.current &&
					selectedGlRef.current.id !== event.marker.id
				) {
					setGlHighlight(selectedGlRef.current, false)
				}
				selectedRef.current = marker
				selectedGlRef.current = event.marker
				setGlHighlight(event.marker, true)
				setSelected(marker)
			}
			openPopup(marker, event.latlng)
		}
		let hovering = false
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

		layer.on('click', onClick)
		layer.on('mouseover', onOver)
		layer.on('mouseout', onOut)

		return () => {
			layer.off('click', onClick)
			layer.off('mouseover', onOver)
			layer.off('mouseout', onOut)
			if (hovering) {
				hovering = false
				releasePointerCursor(map)
			}
			cancelAllTweens()
			layer.remove()
			glLayerRef.current = null
		}
	}, [map, openPopup, setGlHighlight, cancelAllTweens])

	useEffect(() => {
		const layer = glLayerRef.current
		if (!layer) return
		cancelAllTweens()
		setSelected(null)
		selectedRef.current = null
		selectedGlRef.current = null
		popupRef.current?.close()
		lastPopupLatLngRef.current = null

		const glMarkers: WebGLMarker[] = []
		for (const marker of markers) {
			const px = toImagePx(marker)
			if (!px) continue
			const teleport = isTeleport(marker)
			glMarkers.push(
				new WebGLMarker({
					latlng: map.unproject(px, map.getMaxZoom()),
					color: teleport ? COLOR_TELEPORT : COLOR_FILTERED,
					size: teleport ? SIZE_TELEPORT : SIZE_FILTERED,
					opacity: teleport ? 0.95 : 0.85,
					data: marker,
				})
			)
		}
		layer.setMarkers(glMarkers)

		const canvas = getLayerCanvas(layer)
		if (canvas) {
			canvas.style.transition = 'none'
			canvas.style.opacity = '0'
			void canvas.offsetWidth
			canvas.style.transition = `opacity ${APPEAR_DURATION}ms ease-out`
			canvas.style.opacity = '1'
		}
	}, [map, markers, cancelAllTweens])

	useEffect(() => {
		if (!selected) return
		const originPx = toImagePx(selected)
		if (!originPx) return

		const layer = L.layerGroup()

		const origin = map.unproject(originPx, map.getMaxZoom())
		const destinations = (selected.d ?? [])
			.map((dest) => ({ dest, px: destToImagePx(dest) }))
			.filter((entry): entry is DestinationEntry => entry.px !== null)

		for (const { dest, px } of destinations) {
			const destPoint = map.unproject(px, map.getMaxZoom())

			L.polyline([origin, destPoint], {
				color: '#38bdf8',
				weight: 1.5,
				opacity: 0.7,
				dashArray: '4 5',
				interactive: false,
			}).addTo(layer)

			const destMarker = L.circleMarker(destPoint, {
				radius: 3.5,
				color: '#0ea5e9',
				fillColor: '#7dd3fc',
				fillOpacity: 0.9,
				weight: 1,
			})
				.on('click', (event) => {
					L.DomEvent.stopPropagation(event)
					jumpTo(px[0], px[1])
				})
				.addTo(layer)

			if (dest.loc) {
				destMarker.bindTooltip(labelsRef.current.destName(dest.loc), {
					direction: 'top',
					className: 'world-dest-tooltip',
				})
			}
		}

		layer.addTo(map)
		return () => {
			layer.remove()
			goalRef.current?.remove()
			goalRef.current = null
		}
	}, [map, selected, jumpTo])

	useEffect(() => {
		const clear = () => {
			queueMicrotask(() => {
				if (markerClickRef.current) {
					markerClickRef.current = false
					return
				}
				if (selectedGlRef.current) {
					setGlHighlight(selectedGlRef.current, false)
					selectedGlRef.current = null
				}
				selectedRef.current = null
				setSelected(null)
				popupRef.current?.close()
				lastPopupLatLngRef.current = null
			})
		}
		map.on('click', clear)
		return () => {
			map.off('click', clear)
		}
	}, [map, setGlHighlight])

	return null
}
