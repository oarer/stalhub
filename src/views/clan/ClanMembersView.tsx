'use client'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import Avatar from '@/components/ui/user/Avatar'
import HoverUserCard from '@/components/ui/user/HoverUserCard'
import Username from '@/components/ui/user/Username'
import { clanQueries } from '@/queries/clan/clan.queries'
import type { ClanMemberNoteWithMember } from '@/types/clan/clan.type'
import { Section } from '../me/components/Section'
import { RANK_COLORS, RANK_ORDER } from './clan.const'
import { ClanMemberHoverCard } from './components/members/ClanMemberCard'
import { GearEditModals } from './components/members/GearEditModals'
import { MemberActions } from './components/members/MemberActions'
import { MemberNotesButton } from './components/members/MemberNotesButton'
import { useClanGear } from './hooks/useClanGear'
import { useClanGearEdit } from './hooks/useClanGearEdit'
import { useClanMemberMutations } from './hooks/useClanMemberMutations'
import { useClanRoles } from './hooks/useClanRoles'

export default function ClanMembersView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null

	return <ClanMembersContent clanId={clanId} />
}

function ClanMembersContent({ clanId }: { clanId: string }) {
	const t = useTranslations()
	const { isOfficer } = useClanRoles()
	const { renameMutation, deleteMutation } = useClanMemberMutations(clanId)
	const {
		members,
		loadoutByUserId,
		weapons,
		armors,
		buildById,
	} = useClanGear(clanId)
	const gearEdit = useClanGearEdit(clanId)
	const { data: squads } = useSuspenseQuery(clanQueries.getSquads(clanId))
	const { data: allNotes } = useQuery({
		...clanQueries.getAllNotes(),
		enabled: isOfficer,
	})

	const squadByMemberId = useMemo(() => {
		const map = new Map<number, string>()
		for (const squad of squads ?? []) {
			for (const m of squad.members) {
				map.set(m.member_id, squad.name)
			}
		}
		return map
	}, [squads])

	const noteByMemberId = useMemo(() => {
		const map = new Map<number, ClanMemberNoteWithMember>()
		for (const note of allNotes ?? []) {
			map.set(note.member_id, note)
		}
		return map
	}, [allNotes])

	if (members.length === 0) {
		return (
			<Section icon="lucide:users" title={t('clan.members.title')}>
				<p className="py-4 text-center font-semibold text-muted-foreground text-sm">
					{t('clan.stats.emptyTitle')}
				</p>
			</Section>
		)
	}

	const sorted = [...(members ?? [])].sort((a, b) => {
		const ra = RANK_ORDER[a.rank] ?? 99
		const rb = RANK_ORDER[b.rank] ?? 99
		return ra - rb
	})

	return (
		<Section icon="lucide:users" title={t('clan.members.title')}>
			<GearEditModals controller={gearEdit} />
			<div className="flex flex-col">
				{sorted.map((member) => {
					const note = noteByMemberId.get(member.id)
					return (
						<div
							className="flex items-center justify-between border-primary border-b py-3 last:border-b-0"
							key={member.id}
						>
							<div className="flex min-w-0 items-center gap-3">
								{member.user ? (
									<Avatar
										height={32}
										id={member.user.id}
										username={member.user.username}
										width={32}
									/>
								) : (
									<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/50 font-semibold text-xs">
										{member.name.charAt(0).toUpperCase()}
									</div>
								)}
								<div className="flex min-w-0 items-center gap-2">
									<div className="flex flex-col">
										<ClanMemberHoverCard
											gear={
												member.user_id != null
													? (loadoutByUserId.get(
															member.user_id
														)?.data ?? null)
													: null
											}
											lookups={{
												weapons,
												armors,
												buildById,
											}}
											member={member}
											onEditGear={
												gearEdit.canEditGear(member)
													? () =>
															gearEdit.openGearEdit(
																member
															)
													: undefined
											}
										>
											<p className="font-semibold text-sm leading-4">
												{member.name}
											</p>
										</ClanMemberHoverCard>
										{member.user && (
											<HoverUserCard id={member.user.id}>
												<Link
													className={`font-mono font-semibold text-foreground text-xs`}
													href={`/users/${member.user.id}`}
												>
													<Username
														user={member.user}
														withRemoteBadges
													/>
												</Link>
											</HoverUserCard>
										)}
									</div>
									{isOfficer && note && (
										<p
											className="max-w-60 truncate font-semibold text-muted-foreground text-xs"
											title={note.content}
										>
											{note.content}
										</p>
									)}
								</div>
							</div>
							<div className="flex items-center gap-2">
								{squadByMemberId.has(member.id) && (
									<Badge
										className="font-mono"
										title={t('clan.members.squad')}
										variant="secondary"
									>
										{squadByMemberId.get(member.id)}
									</Badge>
								)}
								<Badge
									className={RANK_COLORS[member.rank] ?? ''}
									variant="secondary"
								>
									{t(`player.rank.${member.rank}`)}
								</Badge>
								{isOfficer && (
									<>
										<MemberActions
											deleteMutation={deleteMutation}
											member={member}
											renameMutation={renameMutation}
										/>
										<MemberNotesButton
											memberId={member.id}
											memberName={member.name}
											note={note ?? null}
										/>
									</>
								)}
							</div>
						</div>
					)
				})}
			</div>
		</Section>
	)
}
