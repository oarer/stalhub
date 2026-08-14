'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/ui/Modal'
import type { ClanMember, GoldDrop } from '@/types/clan/clan.type'
import { mskLabel } from './gold.utils'

interface AttendeesModalProps {
	drop: GoldDrop | null
	members: ClanMember[]
	selectedIds: number[]
	attendeeIdSet: Set<number>
	isPending: boolean
	onToggleMember: (memberId: number) => void
	onSave: () => void
	onOpenChange: (open: boolean) => void
}

export function AttendeesModal({
	drop,
	members,
	selectedIds,
	attendeeIdSet,
	isPending,
	onToggleMember,
	onSave,
	onOpenChange,
}: AttendeesModalProps) {
	const t = useTranslations()
	return (
		<Modal.Root onOpenChange={onOpenChange} open={drop !== null}>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>
						{t('clan.gold.attendeesTitle', {
							date: drop ? mskLabel(drop.date) : '',
						})}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p className="mb-3 text-neutral-500 text-sm">
						{t('clan.gold.alreadyMarked', {
							count: attendeeIdSet.size,
						})}
					</p>
					<div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
						{members.map((m) => {
							const checked = selectedIds.includes(m.id)
							const busy = !checked && attendeeIdSet.has(m.id)
							return (
								<button
									className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
										checked
											? 'border-sky-500/60 bg-sky-500/10'
											: busy
												? 'border-border-secondary opacity-50'
												: 'border-border-secondary hover:bg-accent'
									}`}
									disabled={busy}
									key={m.id}
									onClick={() => onToggleMember(m.id)}
									type="button"
								>
									<div className="flex size-8 items-center justify-center rounded-full bg-accent font-semibold text-sm">
										{m.name.charAt(0)}
									</div>
									<div className="flex-1">
										<p className="font-medium text-sm">
											{m.name}
										</p>
										<p className="text-neutral-500 text-xs">
											{m.user?.name ?? m.rank}
										</p>
									</div>
									{checked && (
										<Icon
											className="text-sky-500"
											icon="lucide:check"
										/>
									)}
								</button>
							)
						})}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
					<Modal.Action
						closeOnClick
						disabled={isPending}
						onClick={onSave}
					>
						{t('clan.common.save')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
