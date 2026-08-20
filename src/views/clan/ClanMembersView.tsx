'use client'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import Avatar from '@/components/ui/user/Avatar'
import HoverUserCard from '@/components/ui/user/HoverUserCard'
import { clanQueries } from '@/queries/clan/clan.queries'
import { Section } from '../me/components/Section'
import { RANK_COLORS, RANK_ORDER } from './clan.const'
import { useClanRoles } from './hooks/useClanRoles'
import { MemberNotesButton } from './components/members/MemberNotesButton'
import type { ClanMemberNoteWithMember } from '@/types/clan/clan.type'

export default function ClanMembersView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null

	return <ClanMembersContent clanId={clanId} />
}

function ClanMembersContent({ clanId }: { clanId: string }) {
	const t = useTranslations()
	const { isOfficer } = useClanRoles()
	const { data: members, isLoading } = useSuspenseQuery(
		clanQueries.getMembers(clanId)
	)
	const { data: squads } = useSuspenseQuery(clanQueries.getSquads(clanId))
	const { data: allNotes } = useQuery({
		...clanQueries.getAllNotes(),
		enabled: isOfficer,
	})

	const squadByMemberId = useMemo(() => {
		const map = new Map<number, string>()
		for (const squad of squads ?? []) {
			for (const m of squad.members) {
				map.set(m.memberId, squad.name)
			}
		}
		return map
	}, [squads])

	const noteByMemberId = useMemo(() => {
		const map = new Map<number, ClanMemberNoteWithMember>()
		for (const note of allNotes ?? []) {
			map.set(note.memberId, note)
		}
		return map
	}, [allNotes])

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				{[...Array(5)].map((_, i) => (
					<Skeleton className="h-14 w-full" key={i} />
				))}
			</div>
		)
	}

	const sorted = [...(members ?? [])].sort((a, b) => {
		const ra = RANK_ORDER[a.rank] ?? 99
		const rb = RANK_ORDER[b.rank] ?? 99
		return ra - rb
	})

	return (
		<Section icon="lucide:users" title={t('clan.members.title')}>
			<div className="flex flex-col">
				{sorted.map((member) => (
					<div
						className="flex items-center justify-between border-border-secondary border-b py-3 last:border-b-0"
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
								<div className="flex size-8 items-center justify-center rounded-full bg-accent font-semibold text-xs">
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
						<div className="flex items-center gap-2">
							{squadByMemberId.has(member.id) && (
								<Badge
									className={montserrat.className}
									title={t('clan.members.squad')}
									variant="secondary"
								>
									{squadByMemberId.get(member.id)}
								</Badge>
							)}
							{isOfficer && (
								<MemberNotesButton
									memberId={member.id}
									memberName={member.name}
									note={noteByMemberId.get(member.id) ?? null}
								/>
							)}
							<Badge
								className={RANK_COLORS[member.rank] ?? ''}
								variant="secondary"
							>
								{t(`player.rank.${member.rank}`)}
							</Badge>
						</div>
					</div>
				))}
			</div>
		</Section>
	)
}
