'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import { clanService } from '@/services/clan/clan.service'
import type { ClanMemberNote } from '@/types/clan/clan.type'

interface Props {
	memberId: number
	memberName: string
	note: ClanMemberNote | null
}

export function MemberNotesButton({ memberId, memberName, note }: Props) {
	const t = useTranslations()
	const queryClient = useQueryClient()
	const [isOpen, setIsOpen] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [content, setContent] = useState('')

	const saveMutation = useMutation({
		mutationFn: () => clanService.createMemberNote(memberId, content),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['clan', 'notes'],
			})
			setContent('')
			setIsEditing(false)
			toast.success(
				note ? t('clan.notes.updated') : t('clan.notes.created')
			)
		},
		onError: () => toast.error(t('clan.notes.error')),
	})

	const deleteMutation = useMutation({
		mutationFn: (noteId: number) => clanService.deleteMemberNote(noteId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['clan', 'notes'],
			})
			toast.success(t('clan.notes.deleted'))
		},
		onError: () => toast.error(t('clan.notes.error')),
	})

	const handleOpen = () => {
		setIsOpen(true)
		setContent(note?.content ?? '')
		setIsEditing(false)
	}

	const handleEdit = () => {
		setContent(note?.content ?? '')
		setIsEditing(true)
	}

	const handleCancel = () => {
		setContent(note?.content ?? '')
		setIsEditing(false)
	}

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open)
		if (!open) {
			setContent('')
			setIsEditing(false)
		}
	}

	const canSave =
		content.trim() && content.length <= 512 && content !== note?.content

	return (
		<Modal.Root onOpenChange={handleOpenChange} open={isOpen}>
			<Modal.Trigger asChild>
				<Button
					className={cn(
						'relative cursor-pointer p-1 text-text-accent',
						note && 'text-primary!'
					)}
					onClick={handleOpen}
					variant={'secondary'}
				>
					<Icon className="text-lg" icon="lucide:sticky-note" />
				</Button>
			</Modal.Trigger>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>
						{memberName} — {t('clan.notes.title')}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-3">
						{note && !isEditing && (
							<div className="rounded-lg border border-primary bg-card p-3">
								<p className="whitespace-pre-wrap font-semibold text-sm">
									{note.content}
								</p>
								<div className="mt-2 flex items-center justify-between">
									<span
										className={`${montserrat.className} font-semibold text-text-accent text-xs`}
									>
										{note.author.name} ·{' '}
										{formatDate(note.created_at)}
									</span>
									<div className="flex gap-1">
										<Button
											className="p-1.5"
											onClick={handleEdit}
											size="sm"
											variant="ghost"
										>
											<Icon
												className="text-base"
												icon="lucide:pencil"
											/>
										</Button>
										<Button
											className="p-1.5 ring-0"
											onClick={() =>
												deleteMutation.mutate(note.id)
											}
											size="sm"
											variant={'danger'}
										>
											<Icon
												className="text-base"
												icon="lucide:trash-2"
											/>
										</Button>
									</div>
								</div>
							</div>
						)}

						{(!note || isEditing) && (
							<textarea
								autoFocus
								className="min-h-20 resize-none rounded-lg border-2 border-primary bg-card px-3 py-2 font-semibold text-sm outline-none transition-colors focus:border-primary/60"
								maxLength={512}
								onChange={(e) => setContent(e.target.value)}
								placeholder={t('clan.notes.placeholder')}
								value={content}
							/>
						)}
						<span
							className={`${montserrat.className} font-semibold text-text-accent text-xs`}
						>
							{content.length}/512
						</span>
					</div>
				</Modal.Body>
				<Modal.Footer>
					{isEditing && (
						<Button onClick={handleCancel} variant="ghost">
							{t('clan.notes.cancel')}
						</Button>
					)}
					<Modal.Action
						disabled={!canSave}
						onClick={() => saveMutation.mutate()}
					>
						{note ? t('clan.notes.save') : t('clan.notes.add')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
