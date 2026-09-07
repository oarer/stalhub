'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import type { ClanMember } from '@/types/clan/clan.type'
import type { UseMutationResult } from '@tanstack/react-query'

interface Props {
	member: ClanMember
	renameMutation: UseMutationResult<
		ClanMember,
		Error,
		{ memberId: number; name: string }
	>
	deleteMutation: UseMutationResult<void, Error, number>
}

export function MemberActions({
	member,
	renameMutation,
	deleteMutation,
}: Props) {
	const t = useTranslations()
	const [renameOpen, setRenameOpen] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [name, setName] = useState('')

	const openRename = () => {
		setName(member.name)
		setRenameOpen(true)
	}

	const submitRename = () => {
		const trimmed = name.trim()
		if (!trimmed || trimmed === member.name) {
			setRenameOpen(false)
			return
		}
		renameMutation.mutate(
			{ memberId: member.id, name: trimmed },
			{ onSuccess: () => setRenameOpen(false) }
		)
	}

	return (
		<>
			<Modal.Root onOpenChange={setRenameOpen} open={renameOpen}>
				<Modal.Trigger asChild>
					<Button
						className="relative cursor-pointer p-1 text-text-accent"
						onClick={openRename}
						variant="secondary"
					>
						<Icon className="text-base" icon="lucide:pencil" />
					</Button>
				</Modal.Trigger>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>{t('clan.members.editTitle')}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Input
							autoFocus
							label="clan.members.editPlaceholder"
							onChange={(e) => setName(e.target.value)}
							value={name}
						/>
					</Modal.Body>
					<Modal.Footer>
						<Button
							onClick={() => setRenameOpen(false)}
							variant="ghost"
						>
							{t('clan.members.cancel')}
						</Button>
						<Modal.Action
							disabled={
								!name.trim() || name.trim() === member.name
							}
							onClick={submitRename}
						>
							{t('clan.members.save')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>

			<Modal.Root onOpenChange={setDeleteOpen} open={deleteOpen}>
				<Modal.Trigger asChild>
					<Button
						className="relative cursor-pointer p-1 text-destructive"
						onClick={() => setDeleteOpen(true)}
						variant="secondary"
					>
						<Icon className="text-base" icon="lucide:user-x" />
					</Button>
				</Modal.Trigger>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('clan.members.deleteTitle')}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p className="font-semibold text-sm">
							{t('clan.members.deleteConfirm', {
								name: member.name,
							})}
						</p>
					</Modal.Body>
					<Modal.Footer>
						<Button
							onClick={() => setDeleteOpen(false)}
							variant="ghost"
						>
							{t('clan.members.cancel')}
						</Button>
						<Button
							className={cn('ring-0')}
							disabled={deleteMutation.isPending}
							onClick={() =>
								deleteMutation.mutate(member.id, {
									onSuccess: () => setDeleteOpen(false),
								})
							}
							variant={'danger'}
						>
							{t('clan.members.delete')}
						</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</>
	)
}
