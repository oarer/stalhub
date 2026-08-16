'use client'

import type { MeLayoutProps } from '@/types/me.types'
import MeBanner from '@/views/me/components/MeBanner'
import NavTabs from '@/views/me/components/NavTabs'
import UserCard from '@/views/me/components/UserCard'

export default function MeSidebar({
	user,
	unreadCount,
	pathname,
	onCardChange,
	showBanner,
}: Omit<MeLayoutProps, 'children'> & { showBanner: boolean }) {
	const customization = user.customization

	return (
		<div className="hidden lg:block">
			<div className="flex flex-col gap-4">
				{showBanner && (
					<MeBanner
						bannerColor={customization.bannerColor}
						bannerImage={customization.bannerImage}
						bannerMode={customization.bannerMode}
						bannerType={customization.bannerType}
					/>
				)}
				<UserCard
					cardBackground={customization.cardBackground ?? 'NONE'}
					cardColor={customization.cardColor ?? '#000000'}
					onCardChange={onCardChange}
					user={user}
				/>
				<NavTabs
					pathname={pathname}
					roles={user.roles}
					unreadCount={unreadCount}
				/>
			</div>
		</div>
	)
}
