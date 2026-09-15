import { useEffect, useState } from 'react'

import type { AtlasMarkersFile } from '@/types/map.type'

export function useAtlasMarkers(url: string) {
	const [markers, setMarkers] = useState<AtlasMarkersFile | null>(null)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!url) return
		let mounted = true
		setMarkers(null)
		setError(null)

		fetch(url, { cache: 'no-store' })
			.then((r) => {
				if (!r.ok) throw new Error('Network response not ok')
				return r.json()
			})
			.then((data: AtlasMarkersFile) => {
				if (!mounted) return
				setMarkers(data)
			})
			.catch((err: unknown) => {
				if (!mounted) return
				setError(err instanceof Error ? err : new Error(String(err)))
			})

		return () => {
			mounted = false
		}
	}, [url])

	return { markers, error }
}
