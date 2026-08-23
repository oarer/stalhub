import { Suspense } from 'react'
import MeLayout from '@/views/me/MeLayout'

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
						<div className="h-32 rounded-xl bg-card" />
						<div className="flex flex-col gap-4 rounded-lg bg-card px-4 py-6">
							<div className="size-26 rounded-full bg-border/20" />
							<div className="h-5 w-32 rounded bg-border/20" />
							<div className="h-4 w-24 rounded bg-border/20" />
						</div>
						<div className="h-60 rounded-lg bg-card" />
					</div>
					<div className="px-2 py-8 md:px-0 md:py-4">
						<div className="h-64 animate-pulse rounded-lg bg-card" />
					</div>
				</section>
			}
		>
			<MeLayout>{children}</MeLayout>
		</Suspense>
	)
}
