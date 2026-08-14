'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/ui/Modal'
import type { ClanSquad } from '@/types/clan/clan.type'

interface AssignLeaderModalProps {
	squad: ClanSquad | null
	isPending: boolean
	onAssign: (memberId: number) => void
	onRemoveLeader: () => void
	onOpenChange: (open: boolean) => void
}

export function AssignLeaderModal({
	squad,
	isPending,
	onAssign,
	onRemoveLeader,
	onOpenChange,
}: AssignLeaderModalProps) {
	const t = useTranslations()

	return (
		<Modal.Root onOpenChange={onOpenChange} open={squad !== null}>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>
						{t('clan.squads.leaderTitle', {
							name: squad?.name ? `«${squad.name}»` : '',
						})}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{squad && squad.members.length === 0 ? (
						<p className="text-neutral-500 text-sm">
							{t('clan.squads.noMembers')}
						</p>
					) : (
						<div className="flex flex-col gap-2">
							{squad?.members.map((m) => (
								<button
									className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
										squad.leaderId === m.id
											? 'border-amber-500/60 bg-amber-500/10'
											: 'border-border-secondary hover:bg-accent'
									}`}
									key={m.id}
									onClick={() => onAssign(m.id)}
									type="button"
								>
									<div className="flex size-8 items-center justify-center rounded-full bg-accent font-semibold text-sm">
										{m.member.name.charAt(0)}
									</div>
									<div className="flex-1">
										<p className="font-medium text-sm">
											{m.member.name}
										</p>
										<p className="text-neutral-500 text-xs">
											{m.member.rank}
										</p>
									</div>
									{squad.leaderId === m.id && (
										<Icon
											className="text-amber-500"
											icon="lucide:crown"
										/>
									)}
								</button>
							))}
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.close')}</Modal.Close>
					{squad?.leaderId != null && (
						<Modal.Action
							closeOnClick
							disabled={isPending}
							onClick={onRemoveLeader}
							variant="ghost"
						>
							{t('clan.squads.removeLeader')}
						</Modal.Action>
					)}
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
