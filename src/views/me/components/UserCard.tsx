'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { forwardRef } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import { Tooltip } from '@/components/ui/Tooltip'
import Avatar from '@/components/ui/user/Avatar'
import { cn } from '@/lib/cn'
import type { UserCardProps } from '@/types/me.types'
import type { UserBadge } from '@/types/user.type'
import { BgVariantSelector } from '@/views/me/components/BgSelector'

export default forwardRef<HTMLDivElement, UserCardProps>(function UserCard(
	{ user, cardBackground, cardColor, onCardChange, className, ...props },
	ref
) {
	return (
		<div
			{...props}
			className={cn(
				'relative flex flex-col gap-2 overflow-hidden rounded-lg bg-background px-4 py-6',
				className
			)}
			ref={ref}
		>
			{onCardChange && (
				<div className="absolute top-2.5 right-5 z-20">
					<BgVariantSelector
						color={cardColor}
						mutate={onCardChange}
						variant={cardBackground}
					/>
				</div>
			)}
			{cardBackground === 'AVATAR' && (
				<>
					<Image
						alt={user.name ?? ''}
						className="absolute inset-0 scale-105 object-cover blur-sm"
						fill
						src={`${process.env.NEXT_PUBLIC_API}/api/v1/users/avatar/${user.id}`}
						unoptimized
					/>
					<div className="absolute inset-0 bg-black/40" />
				</>
			)}
			{cardBackground === 'COLOR' && (
				<div
					className="absolute inset-0"
					style={{ backgroundColor: cardColor }}
				/>
			)}

			<div className="relative z-10 flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<div className="relative size-26">
						<Avatar fill id={user.id} username={user.username} />
					</div>

					<h2
						className={`${unbounded.className} truncate font-semibold text-xl leading-none`}
					>
						{user.name}
					</h2>

					{user.name && (
						<span className="font-semibold text-text-accent leading-none">
							{user.username}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-2">
					{user.badges.length > 0 && (
						<div className="flex w-fit items-center gap-2 rounded-md bg-background/50 p-1 backdrop-blur-sm">
							{user.badges.map((badge: UserBadge) => (
								<Tooltip.Root key={badge.id}>
									<Tooltip.Trigger asChild>
										<button
											className="flex size-6 items-center justify-center rounded-sm bg-sky-400"
											style={{ background: badge.color }}
										>
											{badge.icon ? (
												<Icon
													className="size-5 text-neutral-950"
													icon={badge.icon}
												/>
											) : badge.image ? (
												<Image
													alt={badge.name}
													height={20}
													src={badge.image}
													width={20}
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
						className={`${montserrat.className} rounded-lg bg-border-secondary px-2 py-2 font-semibold text-sm leading-none`}
					>
						ID: {user.id}
					</p>
				</div>
			</div>
		</div>
	)
})
