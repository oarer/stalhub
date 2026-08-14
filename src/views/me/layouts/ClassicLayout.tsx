'use client'

import type { MeLayoutProps } from '@/types/me.types'
import MeBanner from '@/views/me/components/MeBanner'
import MeSidebar from '@/views/me/components/MeSidebar'

export default function ClassicLayout({
	children,
	user,
	unreadCount,
	pathname,
	onCardChange,
}: MeLayoutProps) {
	const customization = user.customization

	return (
		<section className="mx-auto grid max-w-285 grid-cols-1 gap-8 px-2 pt-28 pb-0 md:px-4 lg:grid-cols-[27%_70%] lg:px-0 lg:pb-12 xl:pt-36">
			<MeSidebar
				onCardChange={onCardChange}
				pathname={pathname}
				showBanner
				unreadCount={unreadCount}
				user={user}
			/>
			<div className="block pt-8 lg:hidden">
				<MeBanner
					bannerColor={customization.bannerColor}
					bannerImage={customization.bannerImage}
					bannerMode={customization.bannerMode}
					bannerType={customization.bannerType}
				/>
			</div>
			<div className="pb-4 lg:px-0 lg:py-4">{children}</div>
		</section>
	)
}
