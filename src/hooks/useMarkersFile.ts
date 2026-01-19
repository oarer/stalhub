import { useEffect, useState } from 'react'

import type { MarkersFile } from '@/types/map.type'

export function useMarkersFile(markersUrl?: string) {
	const [markersFile, setMarkersFile] = useState<MarkersFile | null>(null)
	const [visibleClusterIds, setVisibleClusterIds] = useState<Set<number>>(
		new Set()
	)
	const [visibleGroupKeys, setVisibleGroupKeys] = useState<Set<string>>(
		new Set()
	)

	useEffect(() => {
		if (!markersUrl) return
		let mounted = true
		fetch(markersUrl)
			.then((r) => {
				if (!r.ok) throw new Error('Network response not ok')
				return r.json()
			})
			.then((data: MarkersFile) => {
				if (!mounted) return
				setMarkersFile(data)
				const cids = new Set<number>()
				const gkeys = new Set<string>()
				data?.markers_clusters?.forEach((c) => {
					cids.add(c.id)
					c.markers.forEach((g) => gkeys.add(`${c.id}_${g.id}`))
				})
				setVisibleClusterIds(cids)
				setVisibleGroupKeys(gkeys)
			})
			.catch((err) => {
				console.error('failed to load markers', err)
			})

		return () => {
			mounted = false
		}
	}, [markersUrl])

	const toggleCluster = (clusterId: number) => {
		setVisibleClusterIds((prev) => {
			const next = new Set(prev)
			if (next.has(clusterId)) next.delete(clusterId)
			else next.add(clusterId)
			return next
		})
	}

	const toggleGroup = (clusterId: number, groupId: number) => {
		const key = `${clusterId}_${groupId}`
		setVisibleGroupKeys((prev) => {
			const next = new Set(prev)
			if (next.has(key)) next.delete(key)
			else next.add(key)
			return next
		})
	}

	const showAll = () => {
		const cids = new Set<number>()
		const gkeys = new Set<string>()
		markersFile?.markers_clusters?.forEach((c) => {
			cids.add(c.id)
			c.markers.forEach((g) => gkeys.add(`${c.id}_${g.id}`))
		})
		setVisibleClusterIds(cids)
		setVisibleGroupKeys(gkeys)
	}

	const hideAll = () => {
		setVisibleClusterIds(new Set())
		setVisibleGroupKeys(new Set())
	}

	return {
		markersFile,
		visibleClusterIds,
		visibleGroupKeys,
		toggleCluster,
		toggleGroup,
		showAll,
		hideAll,
		setMarkersFile,
	}
}
