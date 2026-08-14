'use client'

import type { MeLayoutProps } from '@/types/me.types'
import MeBanner from '@/views/me/components/MeBanner'
import MeSidebar from '@/views/me/components/MeSidebar'

export default function ModernLayout({
	children,
	user,
	unreadCount,
	pathname,
	onCardChange,
}: MeLayoutProps) {
	const customization = user.customization

	return (
		<div className="mx-auto max-w-285 px-2 pt-28 pb-0 md:px-4 lg:px-0 lg:pb-12 xl:pt-36">
			<MeBanner
				bannerColor={customization.bannerColor}
				bannerImage={customization.bannerImage}
				bannerMode={customization.bannerMode}
				bannerType={customization.bannerType}
				className="mt-8 lg:mt-0 lg:mb-8"
			/>
			<section className="grid grid-cols-1 gap-8 lg:grid-cols-[27%_70%]">
				<MeSidebar
					onCardChange={onCardChange}
					pathname={pathname}
					showBanner={false}
					unreadCount={unreadCount}
					user={user}
				/>
				<div className="py-8 lg:py-4">{children}</div>
			</section>
		</div>
	)
}
