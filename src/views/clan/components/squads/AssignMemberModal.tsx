'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { ClanMember } from '@/types/clan/clan.type'

interface AssignMemberModalProps {
	squadId: number | null
	slot: number | null
	members: ClanMember[]
	onAssign: (memberId: number) => void
	onOpenChange: (open: boolean) => void
}

export function AssignMemberModal({
	squadId,
	slot,
	members,
	onAssign,
	onOpenChange,
}: AssignMemberModalProps) {
	const t = useTranslations()

	return (
		<Modal.Root onOpenChange={onOpenChange} open={squadId !== null}>
			<Modal.Content className="max-w-md" fullScreen={false}>
				<Modal.Header>
					<Modal.Title>
						{t('clan.squads.assignSlotTitle', {
							slot: (slot ?? 0) + 1,
						})}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{squadId != null && members.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							{t('clan.squads.noFreeMembers')}
						</p>
					) : (
						<div className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto pr-1">
							{squadId != null &&
								members.map((m) => (
									<Button
										className="justify-start gap-2"
										key={m.id}
										onClick={() => onAssign(m.id)}
										variant={'secondary'}
									>
										<div className="flex size-8 items-center justify-center rounded-full bg-card font-semibold text-sm">
											{m.name.charAt(0)}
										</div>
										<div className="flex flex-col text-left">
											<p className="font-semibold text-sm">
												{m.name}
											</p>
											<p className="font-semibold text-muted-foreground text-xs">
												{m.user?.name ?? m.rank}
											</p>
										</div>
									</Button>
								))}
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.close')}</Modal.Close>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
