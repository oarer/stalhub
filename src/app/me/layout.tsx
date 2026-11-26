import type { Metadata } from 'next'
import { Suspense } from 'react'
import MeLayout from '@/views/me/MeLayout'

export const metadata: Metadata = {
	robots: { index: false, follow: false },
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<Suspense
			fallback={
				<section className="mx-auto grid max-w-285 grid-cols-1 gap-8 pt-28 pb-0 lg:grid-cols-[27%_70%] lg:pb-12 xl:pt-36">
					<div className="hidden animate-pulse flex-col gap-4 lg:flex">
						<div className="bg-card h-32 rounded-xl" />
						<div className="bg-card flex flex-col gap-4 rounded-lg px-4 py-6">
							<div className="bg-border/20 size-26 rounded-full" />
							<div className="bg-border/20 h-5 w-32 rounded" />
							<div className="bg-border/20 h-4 w-24 rounded" />
						</div>
						<div className="bg-card h-60 rounded-lg" />
					</div>
					<div className="px-2 py-8 md:px-0 md:py-4">
						<div className="bg-card h-64 animate-pulse rounded-lg" />
					</div>
				</section>
			}
		>
			<MeLayout>{children}</MeLayout>
		</Suspense>
	)
}
