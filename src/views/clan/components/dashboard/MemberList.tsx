'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import Avatar from '@/components/ui/user/Avatar'
import HoverUserCard from '@/components/ui/user/HoverUserCard'
import type { ClanMember } from '@/types/clan/clan.type'
import { Section } from '../../../me/components/Section'
import { RANK_COLORS } from '../../clan.const'

interface MemberListProps {
	members: ClanMember[]
	isLoading: boolean
}

export function MemberList({ members, isLoading }: MemberListProps) {
	const t = useTranslations()

	return (
		<Section icon="lucide:users" title={t('clan.members.title')}>
			{isLoading ? (
				<div className="flex flex-col gap-2">
					{[...Array(3)].map((_, i) => (
						<Skeleton className="h-10 w-full" key={i} />
					))}
				</div>
			) : (
				<div className="flex flex-col">
					{members.slice(0, 10).map((member) => (
						<div
							className="flex items-center justify-between border-primary/50 border-b py-2.5 last:border-b-0"
							key={member.id}
						>
							<div className="flex items-center gap-3">
								{member.user ? (
									<Avatar
										height={32}
										id={member.user.id}
										username={member.user.username}
										width={32}
									/>
								) : (
									<div className="flex size-8 items-center justify-center rounded-full bg-accent/50 font-semibold text-xs">
										{member.name.charAt(0).toUpperCase()}
									</div>
								)}
								<div>
									<p className="font-semibold text-sm">
										{member.name}
									</p>
									{member.user && (
										<HoverUserCard id={member.user.id}>
											<Link
												className={`${montserrat.className} font-semibold text-text-accent text-xs`}
												href={`/users/${member.user.id}`}
											>
												{member.user.name}
											</Link>
										</HoverUserCard>
									)}
								</div>
							</div>
							<Badge
								className={RANK_COLORS[member.rank] ?? ''}
								variant="secondary"
							>
								{t(`player.rank.${member.rank}`)}
							</Badge>
						</div>
					))}
					{members.length > 10 && (
						<p
							className={`${montserrat.className} mt-2 text-center font-semibold text-text-accent text-xs`}
						>
							{t('clan.members.more', {
								count: members.length - 10,
							})}
						</p>
					)}
				</div>
			)}
		</Section>
	)
}
