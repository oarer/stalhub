import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useUwuStore } from '@/stores/useUwu.store'

export function UwuProvider({ children }: { children: React.ReactNode }) {
	const searchParams = useSearchParams()
	const { uwuMode, setUwuMode } = useUwuStore()
	const [initialized, setInitialized] = useState(false)

	useEffect(() => {
		if (initialized) return

		const param = searchParams.get('uwu')

		if (param === 'true') {
			setUwuMode(true)
			localStorage.setItem('uwuMode', 'true')
		} else {
			const stored = localStorage.getItem('uwuMode')
			if (stored === 'true') setUwuMode(true)
		}

		setInitialized(true)
	}, [initialized, searchParams, setUwuMode])

	useEffect(() => {
		if (!initialized) return
		localStorage.setItem('uwuMode', uwuMode ? 'true' : 'false')
	}, [uwuMode, initialized])

	return <>{children}</>
}
