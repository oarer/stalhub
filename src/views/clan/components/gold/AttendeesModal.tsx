'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
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
					<Modal.Title className={montserrat.className}>
						{t('clan.gold.attendeesTitle', {
							date: drop ? mskLabel(drop.date) : '',
						})}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
						{members.map((m) => {
							const checked = selectedIds.includes(m.id)
							return (
								<Button
									className={cn(
										'justify-between',
										checked
											? 'bg-muted'
											: 'hover:bg-primary/40'
									)}
									key={m.id}
									onClick={() => onToggleMember(m.id)}
									variant={'secondary'}
								>
									<div className="flex gap-2">
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
									</div>
									{checked && (
										<Icon
											className="text-primary"
											icon="lucide:check"
										/>
									)}
								</Button>
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
