'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import type { DownloadRelease } from '@/types/download.type'
import Hero from './sections/Hero'

const Releases = dynamic(() => import('./sections/Releases'))
const Transfer = dynamic(() => import('./sections/Transfer'))

export default function DownloadView() {
	const [releases, setReleases] = useState<DownloadRelease[]>([])
	const [loading, setLoading] = useState(true)
	const [hasError, setHasError] = useState(false)

	const loadReleases = useCallback(async () => {
		setLoading(true)
		setHasError(false)
		try {
			const res = await fetch('/api/download/releases')
			if (!res.ok) throw new Error(String(res.status))
			const data = (await res.json()) as DownloadRelease[]
			setReleases(data)
		} catch {
			setHasError(true)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		void loadReleases()
	}, [loadReleases])

	const latest = releases[0] ?? null

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pt-32 pb-12 sm:px-6">
			<Hero
				hasError={hasError}
				latest={latest}
				loading={loading}
				onReload={() => void loadReleases()}
			/>
			<Releases
				hasError={hasError}
				loading={loading}
				onReload={() => void loadReleases()}
				releases={releases}
			/>
			<Transfer />
		</div>
	)
}
