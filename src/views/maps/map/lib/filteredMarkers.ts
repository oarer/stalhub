export type FilteredMarkerLike = {
	b?: string
	g?: string
	n?: string
	o?: string
}

export function filteredTypeKey(
	marker: FilteredMarkerLike | null | undefined
): string {
	if (!marker) return 'unknown'
	return marker.b ?? marker.o ?? marker.n ?? 'unknown'
}

export function isReadableName(name: string | null | undefined): boolean {
	if (!name) return false
	return /[^\x00-\x7F]/.test(name) || name.includes(' ')
}

export function filteredNameKey(
	marker: FilteredMarkerLike | null | undefined
): string {
	if (!marker) return 'unknown'
	if (isReadableName(marker.n)) return marker.n as string
	return marker.o ?? marker.n ?? marker.b ?? 'unknown'
}

export function filteredMarkerLabel(
	marker: FilteredMarkerLike,
	translate: (key: string) => string
): string {
	if (isReadableName(marker.n)) return marker.n as string
	if (marker.o) {
		const key = `go.${marker.o}.name`
		const value = translate(key)
		if (value !== key) return value
	}
	return marker.n ?? marker.o ?? marker.b ?? ''
}
