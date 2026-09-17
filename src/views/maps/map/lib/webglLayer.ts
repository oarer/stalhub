import type { WebGLMarkerLayer } from '@oarer/leaflet-webgl-markers'
import type { Map as LeafletMap } from 'leaflet'

type CanvasAccess = {
	_canvasLayer?: { getCanvas(): HTMLCanvasElement | null }
}

export function getLayerCanvas(
	layer: WebGLMarkerLayer
): HTMLCanvasElement | null {
	try {
		return (
			(layer as unknown as CanvasAccess)._canvasLayer?.getCanvas() ?? null
		)
	} catch {
		return null
	}
}

const cursorCounts = new WeakMap<LeafletMap, number>()

export function acquirePointerCursor(map: LeafletMap): void {
	const next = (cursorCounts.get(map) ?? 0) + 1
	cursorCounts.set(map, next)
	map.getContainer().style.cursor = 'pointer'
}

export function releasePointerCursor(map: LeafletMap): void {
	const next = Math.max(0, (cursorCounts.get(map) ?? 0) - 1)
	cursorCounts.set(map, next)
	if (next === 0) map.getContainer().style.cursor = ''
}

export function resetPointerCursor(map: LeafletMap): void {
	cursorCounts.delete(map)
	map.getContainer().style.cursor = ''
}

export function animatePopupIn(element: HTMLElement): void {
	const wrapper = element.querySelector<HTMLElement>(
		'.leaflet-popup-content-wrapper'
	)
	if (!wrapper) {
		element.animate([{ opacity: 0 }, { opacity: 1 }], {
			duration: 160,
			easing: 'ease-out',
		})
		return
	}
	wrapper.style.transformOrigin = 'bottom center'
	wrapper.animate(
		[
			{ opacity: 0, transform: 'scale(0.92) translateY(6px)' },
			{ opacity: 1, transform: 'scale(1) translateY(0)' },
		],
		{
			duration: 180,
			easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
		}
	)
}
