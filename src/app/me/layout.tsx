import { Suspense } from 'react'
import MeSection from '@/views/me/MeLayout'
import MobileMeNav from '@/views/me/MobileMeNav'

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<section className="mx-auto grid max-w-285 grid-cols-1 gap-8 pt-28 pb-0 lg:grid-cols-[27%_70%] lg:pb-12 xl:pt-36">
				<div className="hidden lg:block">
					<Suspense
						fallback={
							<div className="animate-pulse rounded-lg bg-background px-4 py-6">
								<div className="size-26 animate-pulse rounded-full bg-border/20" />
								<div className="mt-4 h-5 w-32 animate-pulse rounded bg-border/20" />
							</div>
						}
					>
						<MeSection />
					</Suspense>
				</div>
				<div className="px-2 py-8 md:px-0 md:py-4">{children}</div>
			</section>
			<Suspense fallback={null}>
				<MobileMeNav />
			</Suspense>
		</>
	)
}
