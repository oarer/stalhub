import L from 'leaflet'

const GOAL_ICON = L.divIcon({
	className: 'coords-goal',
	iconSize: [22, 22],
	iconAnchor: [11, 11],
	html: '<div class="coords-goal-dot"></div>',
})

export function placeGoalMarker(
	map: L.Map,
	latlng: L.LatLng,
	current: L.Marker | null
): L.Marker {
	current?.remove()
	return L.marker(latlng, { icon: GOAL_ICON, interactive: false }).addTo(map)
}
