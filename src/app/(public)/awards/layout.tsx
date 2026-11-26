import type { Metadata } from 'next'
import { Suspense } from 'react'
import AwardsAccessGuard from '@/views/awards/AwardsAccessGuard'

export const metadata: Metadata = {
	robots: { index: false, follow: false },
}

export default function AwardsLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<Suspense fallback={null}>
			<AwardsAccessGuard>{children}</AwardsAccessGuard>
		</Suspense>
	)
}
