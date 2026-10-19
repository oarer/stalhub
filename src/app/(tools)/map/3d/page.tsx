import { Suspense } from 'react'
import Map3DView from '@/views/map3d/Map3DView'

export default function Map3DPage() {
	return (
		<Suspense
			fallback={<div className="pt-32 text-center">Открываем карту…</div>}
		>
			<Map3DView />
		</Suspense>
	)
}
