'use client'

import { Suspense } from 'react'
import { ArsenalView } from '@/views/calcs/arsenal/ArsenalView'
import LoadingArsenal from './loading'

export default function ArsenalPage() {
	return (
		<Suspense fallback={<LoadingArsenal />}>
			<ArsenalView />
		</Suspense>
	)
}
