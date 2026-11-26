'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { mtsExtended } from '@/app/fonts'
import Avatar from '@/components/ui/user/Avatar'
import HoverUserCard from '@/components/ui/user/HoverUserCard'
import Username from '@/components/ui/user/Username'
import { relativeDate } from '@/lib/relativeDate'
import type { UserBadge } from '@/types/user.type'
import { EditedMark } from './EditedMark'

export interface DetailAuthor {
	id?: number | null
	username: string
	name?: string | null
	badges?: UserBadge[] | null
}

interface ContentDetailHeaderProps {
	title: string
	author?: DetailAuthor | null
	authorFallback?: string | null
	authorAvatarUrl?: string | null
	sourceUrl?: string | null
	createdAt: string
	editedBy?: { id: number; username: string } | null
	description?: ReactNode
	prefix?: ReactNode
	actions?: ReactNode
	stats?: ReactNode
}

export function ContentDetailHeader({
	title,
	author,
	authorFallback,
	authorAvatarUrl,
	sourceUrl,
	createdAt,
	editedBy,
	description,
	prefix,
	actions,
	stats,
}: ContentDetailHeaderProps) {
	const displayName =
		author?.name?.trim() || author?.username || authorFallback || 'Stalhub'

	return (
		<header className="flex flex-col gap-3">
			<div className="flex items-start justify-between gap-4">
				<div className="flex min-w-0 flex-col gap-2.5">
					<div className="flex flex-wrap items-center gap-2.5">
						<h1
							className={`${mtsExtended.className} text-primary text-3xl font-semibold`}
						>
							{title}
						</h1>
						{prefix}
					</div>
					{description && (
						<p className="text-foreground text-sm">{description}</p>
					)}
					<div className="flex min-w-0 items-center gap-2 text-sm">
						{author?.id != null ? (
							<Link
								className="shrink-0"
								href={`/users/${author.id}`}
							>
								<Avatar
									height={40}
									id={author.id}
									username={author.username}
									width={40}
								/>
							</Link>
						) : authorAvatarUrl ? (
							<img
								alt=""
								className="bg-muted size-10 shrink-0 rounded-full object-cover"
								src={authorAvatarUrl}
							/>
						) : (
							<span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
								<Icon
									className="text-primary/70 size-5"
									icon="lucide:radio-tower"
								/>
							</span>
						)}
						<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
							{author?.id != null ? (
								<HoverUserCard id={author.id}>
									<Username
										className="truncate font-semibold"
										user={author}
									/>
								</HoverUserCard>
							) : sourceUrl ? (
								<a
									className="hover:text-primary truncate font-semibold transition-colors hover:underline"
									href={sourceUrl}
									rel="noopener noreferrer"
									target="_blank"
								>
									{displayName}
								</a>
							) : (
								<span className="truncate font-semibold">
									{displayName}
								</span>
							)}

							<span className="text-foreground">·</span>
							<time
								className="text-foreground shrink-0"
								dateTime={createdAt}
								title={new Date(createdAt).toLocaleString()}
							>
								{relativeDate(createdAt)}
							</time>
							{editedBy && <EditedMark editedBy={editedBy} />}
						</div>
					</div>
				</div>
				{actions && (
					<div className="flex shrink-0 items-center gap-1.5">
						{actions}
					</div>
				)}
			</div>
			{stats && (
				<div className="text-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
					{stats}
				</div>
			)}
		</header>
	)
}

export function DetailShell({
	children,
	wide = false,
}: {
	children: ReactNode
	wide?: boolean
}) {
	return (
		<section
			className={`mx-auto flex ${wide ? 'max-w-380' : 'max-w-250'} flex-col gap-6 px-4 pt-32 pb-12 md:px-8 xl:pt-36`}
		>
			{children}
		</section>
	)
}

export function DetailStat({
	icon,
	value,
	active = false,
	onClick,
	disabled = false,
	label,
}: {
	icon: string
	value: ReactNode
	active?: boolean
	onClick?: () => void
	disabled?: boolean
	label?: string
}) {
	const content = (
		<>
			<Icon icon={icon} />
			<span className="font-mono">{value}</span>
		</>
	)
	if (!onClick) {
		return (
			<span className="flex items-center gap-1.5" title={label}>
				{content}
			</span>
		)
	}
	return (
		<button
			aria-label={label}
			className={`hover:text-primary flex cursor-pointer items-center gap-1.5 transition-colors disabled:opacity-60 ${active ? 'text-primary' : ''}`}
			disabled={disabled}
			onClick={onClick}
			title={label}
			type="button"
		>
			{content}
		</button>
	)
}
