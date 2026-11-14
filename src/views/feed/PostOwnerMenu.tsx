'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { PostEditable } from '@/types/post.type'
import { ActionMenu, ActionMenuItem } from './ActionMenu'
import { PostFormModal, usePostDelete } from './PostFormModal'

interface PostOwnerMenuProps {
	post: PostEditable
	onDeleted?: () => void
}

export function PostOwnerMenu({ post, onDeleted }: PostOwnerMenuProps) {
	const t = useTranslations()
	const router = useRouter()
	const [editing, setEditing] = useState(false)
	const { isPending, remove } = usePostDelete(
		post,
		onDeleted ?? (() => router.push('/feed'))
	)

	return (
		<>
			<ActionMenu label={t('post.actions')}>
				{(close) => (
					<>
						<ActionMenuItem
							close={close}
							icon="lucide:pencil"
							onClick={() => setEditing(true)}
						>
							{t('post.edit')}
						</ActionMenuItem>
						<ActionMenuItem
							close={close}
							danger
							disabled={isPending}
							icon="lucide:trash-2"
							onClick={remove}
						>
							{t('post.delete')}
						</ActionMenuItem>
					</>
				)}
			</ActionMenu>
			{editing && (
				<PostFormModal
					defaultOpen
					onOpenChange={(open) => {
						if (!open) setEditing(false)
					}}
					post={post}
				/>
			)}
		</>
	)
}
