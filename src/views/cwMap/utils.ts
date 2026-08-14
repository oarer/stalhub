import L from 'leaflet'

import type { LatLng, MarkerPreset } from './types'

export function genId(): string {
	return Math.random().toString(36).slice(2, 10)
}

export function toPlain(ll: L.LatLng): LatLng {
	return { lat: ll.lat, lng: ll.lng }
}

export function toLeaflet(p: LatLng): L.LatLng {
	return L.latLng(p.lat, p.lng)
}

const ICON_PATHS: Record<string, string> = {
	'lucide:crosshair':
		'<circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>',
	'lucide:home':
		'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
	'lucide:alert-triangle':
		'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
	'lucide:package':
		'<path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>',
	'lucide:user':
		'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
	'lucide:door-open':
		'<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"/>',
	'lucide:target':
		'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
	'lucide:info':
		'<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
}

function getIconPath(icon: string): string {
	return ICON_PATHS[icon] ?? ICON_PATHS['lucide:info']
}

export function makeMarkerIcon(preset: MarkerPreset): L.DivIcon {
	if (preset.letter) {
		return L.divIcon({
			className: '',
			iconSize: [36, 36],
			iconAnchor: [18, 18],
			html: `<div style="width:36px;height:36px;background:rgba(22, 22, 22, 0.85);border:2px solid rgba(183, 183, 183, 1);display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:16px;font-family:sans-serif">
				<span style="text-shadow:0 0 4px rgba(0,0,0,0.8)">${preset.letter}</span>
			</div>`,
		})
	}
	if (preset.image) {
		return L.divIcon({
			className: '',
			iconSize: [36, 36],
			iconAnchor: [18, 18],
			html: `<div style="width:36px;height:36px;border-radius:6px;overflow:hidden;background:rgba(22,22,22,0.6);border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center">
				<img src="${preset.image}" style="width:100%;height:100%;object-fit:cover" alt="${preset.label ?? preset.key}" />
			</div>`,
		})
	}
	return L.divIcon({
		className: '',
		iconSize: [28, 28],
		iconAnchor: [14, 14],
		html: `<div style="width:28px;height:28px;border-radius:50%;background:${preset.color};border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.4)">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				${getIconPath(preset.icon)}
			</svg>
		</div>`,
	})
}

