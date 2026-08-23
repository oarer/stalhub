import { Icon } from '@iconify/react'
import Image from 'next/image'
import { montserrat, unbounded } from '@/app/fonts'
import { Tooltip } from '@/components/ui/Tooltip'
import Avatar from '@/components/ui/user/Avatar'
import type {
	BannerMode,
	BannerType,
	User,
	UserBadge,
} from '@/types/user.type'
import MeBanner from '@/views/me/components/MeBanner'

interface CompactHeaderProps {
	user: User
	bannerMode: BannerMode
	bannerType: BannerType
	bannerColor?: string
	bannerImage?: string | null
}

export default function CompactHeader({
	user,
	bannerMode,
	bannerType,
	bannerColor,
	bannerImage,
}: CompactHeaderProps) {
	return (
		<>
			{bannerType === 'BACKGROUND' && (
				<MeBanner
					bannerColor={bannerColor}
					bannerImage={bannerImage}
					bannerMode={bannerMode}
					bannerType={bannerType}
				/>
			)}

			<div className="relative h-44 overflow-hidden rounded-lg bg-secondary">
				{bannerType === 'HEADER' && (
					<MeBanner
						bannerColor={bannerColor}
						bannerImage={bannerImage}
						bannerMode={bannerMode}
						bannerType={bannerType}
						className="absolute inset-0 h-full"
					/>
				)}

				<div className="relative z-10 flex flex-col gap-4 p-4">
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-4">
							<div className="relative size-24 shrink-0">
								<Avatar
									fill
									id={user.id}
									username={user.username}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<h2
									className={`${unbounded.className} font-semibold text-2xl leading-none`}
								>
									{user.name}
								</h2>
								{user.name && (
									<span className="font-semibold text-text-accent leading-none">
										{user.username}
									</span>
								)}
							</div>
						</div>
						{user.badges.length > 0 && (
							<div className="flex items-center gap-1.5">
								{user.badges.map((badge: UserBadge) => (
									<Tooltip.Root key={badge.id}>
										<Tooltip.Trigger asChild>
											<button
												className="flex size-5 items-center justify-center rounded-sm bg-primary"
												style={{
													background: badge.color,
												}}
											>
												{badge.icon ? (
													<Icon
														className="size-4 text-neutral-950"
														icon={badge.icon}
													/>
												) : badge.image ? (
													<Image
														alt={badge.name}
														height={16}
														src={badge.image}
														width={16}
													/>
												) : null}
											</button>
										</Tooltip.Trigger>
										<Tooltip.Content>
											{badge.name}
										</Tooltip.Content>
									</Tooltip.Root>
								))}
							</div>
						)}
						<p
							className={`${montserrat.className} w-fit rounded-md bg-muted px-2.5 py-1 font-semibold text-xs leading-none`}
						>
							ID: {user.id}
						</p>
					</div>
				</div>
			</div>
		</>
	)
}
