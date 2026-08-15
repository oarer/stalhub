'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

const CWMapEditor = dynamic(() => import('./CWMapEditor'), {
	ssr: false,
	loading: () => {
		const t = useTranslations()
		return (
			<div className="flex h-[70vh] items-center justify-center font-semibold text-text-accent">
				{t('cwMap.loading')}
			</div>
		)
	},
})

export default function CWMapView() {
	return (
		<main className="flex min-h-screen flex-col pt-28">
			<CWMapEditor />
		</main>
	)
}
