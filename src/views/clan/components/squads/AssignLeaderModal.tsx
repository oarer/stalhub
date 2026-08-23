'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
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
							name: squad?.name ? squad.name : '',
						})}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{squad && squad.members.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							{t('clan.squads.noMembers')}
						</p>
					) : (
						<div className="flex flex-col gap-2">
							{squad?.members.map((m) => (
								<Button
									className={cn(
										'justify-between',
										squad.leader_id === m.id &&
											'border-amber-500/60 bg-amber-500/10'
									)}
									key={m.id}
									onClick={() => onAssign(m.id)}
									variant={'secondary'}
								>
									<div className="flex items-center gap-2">
										<div className="flex size-8 items-center justify-center rounded-full bg-card font-semibold text-sm">
											{m.member.name.charAt(0)}
										</div>
										<div className="flex flex-col text-left">
											<p className="font-semibold text-sm">
												{m.member.name}
											</p>
											<p className="font-semibold text-muted-foreground text-xs">
												{m.member.rank}
											</p>
										</div>
									</div>
									{squad.leader_id === m.id && (
										<Icon
											className="text-amber-500"
											icon="lucide:crown"
										/>
									)}
								</Button>
							))}
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.close')}</Modal.Close>
					{squad?.leader_id != null && (
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
