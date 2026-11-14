'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { tierListQueries } from '@/queries/tier-list/tier-list.queries'
import { artService } from '@/services/art/art.service'
import { postService } from '@/services/post/post.service'
import type { PostEditable, PostPollType } from '@/types/post.type'
import { MarkdownContent } from './MarkdownContent'

interface PostFormModalProps {
	post?: PostEditable
	trigger?: React.ReactNode
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
}

export function PostFormModal({
	post,
	trigger,
	defaultOpen = false,
	onOpenChange,
}: PostFormModalProps) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const fileRef = useRef<HTMLInputElement>(null)
	const [open, setOpen] = useState(defaultOpen)
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [imageUrls, setImageUrls] = useState<string[]>([])
	const [pollEnabled, setPollEnabled] = useState(false)
	const [pollQuestion, setPollQuestion] = useState('')
	const [pollType, setPollType] = useState<PostPollType>('single')
	const [pollOptions, setPollOptions] = useState(['', ''])
	const [attachedBuildIds, setAttachedBuildIds] = useState<string[]>([])
	const [attachedTierListIds, setAttachedTierListIds] = useState<string[]>([])
	const [attachmentSearch, setAttachmentSearch] = useState('')
	const [uploading, setUploading] = useState(false)
	const [preview, setPreview] = useState(false)
	const isEditing = Boolean(post)
	const { data: builds } = useQuery(
		buildApiQueries.mine({ take: 100, page: 1 })
	)
	const { data: tierLists } = useQuery(
		tierListQueries.listMine({ take: 100, page: 1 })
	)

	useEffect(() => {
		if (!open) return
		setTitle(post?.title ?? '')
		setContent(post?.content ?? '')
		setImageUrls(post?.image_urls ?? [])
		setPollEnabled(Boolean(post?.poll))
		setPollQuestion(post?.poll?.question ?? '')
		setPollType(post?.poll?.type ?? 'single')
		setPollOptions(
			post?.poll?.options.map((option) => option.text) ?? ['', '']
		)
		setAttachedBuildIds(
			post?.attached_builds?.map((item) => String(item.id)) ?? []
		)
		setAttachedTierListIds(
			post?.attached_tier_lists?.map((item) => String(item.id)) ?? []
		)
	}, [open, post])

	const mutation = useMutation({
		mutationFn: () => {
			const payload = {
				title: title.trim() || undefined,
				content: content.trim(),
				image_urls: imageUrls,
				poll: pollEnabled
					? {
							question: pollQuestion.trim(),
							type: pollType,
							options: pollOptions
								.map((value) => value.trim())
								.filter(Boolean),
						}
					: undefined,
				attached_build_ids: attachedBuildIds,
				attached_tier_list_ids: attachedTierListIds,
			}
			return isEditing
				? postService.update(post?.external_id ?? '', payload)
				: postService.create(payload)
		},
		onSuccess: (savedPost) => {
			queryClient.invalidateQueries({ queryKey: ['feed'] })
			queryClient.setQueryData(['post', savedPost.external_id], savedPost)
			setOpen(false)
			toast.success(
				t(isEditing ? 'post.toast.updated' : 'post.toast.created')
			)
		},
		onError: () =>
			toast.error(
				t(
					isEditing
						? 'post.toast.updateError'
						: 'post.toast.createError'
				)
			),
	})

	const uploadFiles = async (files: FileList | null) => {
		if (!files?.length) return
		setUploading(true)
		try {
			const uploaded = await Promise.all(
				Array.from(files).map((file) =>
					artService
						.uploadImage(file)
						.then((result) => result.image_url)
				)
			)
			setImageUrls((current) => [...current, ...uploaded])
		} catch {
			toast.error(t('post.attach.uploadError'))
		} finally {
			setUploading(false)
		}
	}

	const toggleId = (
		ids: string[],
		id: string,
		setter: (next: string[]) => void
	) =>
		setter(
			ids.includes(id)
				? ids.filter((value) => value !== id)
				: [...ids, id]
		)

	return (
		<Modal.Root
			onOpenChange={(value) => {
				setOpen(value)
				onOpenChange?.(value)
			}}
			open={open}
		>
			{trigger && <Modal.Trigger asChild>{trigger}</Modal.Trigger>}
			<Modal.Content
				align="top"
				className="max-h-[90dvh] overflow-y-auto"
				fullScreen={false}
			>
				<Modal.Header>
					<Modal.Title>
						{t(isEditing ? 'post.editTitle' : 'post.createTitle')}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="flex flex-col gap-4">
					<Input
						maxLength={160}
						onChange={(event) => setTitle(event.target.value)}
						placeholder={t('post.titlePlaceholder')}
						value={title}
					/>
					<div className="flex items-center justify-between gap-2">
						<span className="font-medium text-sm">
							{t('post.contentLabel')}
						</span>
						<Button
							onClick={() => setPreview((value) => !value)}
							size="sm"
							variant="ghost"
						>
							{preview ? t('post.write') : t('post.preview')}
						</Button>
					</div>
					{preview ? (
						<div className="min-h-36 rounded-lg border border-primary/20 bg-card p-3">
							<MarkdownContent content={content} />
						</div>
					) : (
						<Textarea
							className="min-h-40 resize-y"
							maxLength={10000}
							onChange={(event) => setContent(event.target.value)}
							placeholder={t('post.contentPlaceholder')}
							value={content}
						/>
					)}
					<div className="flex flex-wrap items-center gap-2">
						<input
							accept="image/*"
							className="hidden"
							multiple
							onChange={(event) => {
								void uploadFiles(event.target.files)
								event.currentTarget.value = ''
							}}
							ref={fileRef}
							type="file"
						/>
						<Button
							className="gap-2"
							disabled={uploading}
							onClick={() => fileRef.current?.click()}
							size="sm"
							variant="outline"
						>
							<Icon icon="lucide:image-plus" />
							{uploading
								? t('post.attach.uploading')
								: t('post.attach.image')}
						</Button>
						{imageUrls.map((url) => (
							<div className="relative" key={url}>
								<Image
									alt=""
									className="size-14 rounded object-cover"
									height={56}
									src={url}
									unoptimized
									width={56}
								/>
								<Button
									aria-label={t('post.attach.remove')}
									className="absolute -top-2 -right-2 size-5 rounded-full p-0"
									onClick={() =>
										setImageUrls((current) =>
											current.filter(
												(item) => item !== url
											)
										)
									}
									size="sm"
									variant="danger"
								>
									<Icon className="size-3" icon="lucide:x" />
								</Button>
							</div>
						))}
					</div>
					<div className="flex flex-col gap-2 rounded-lg border border-primary/20 p-3">
						<label className="flex items-center gap-2 font-medium text-sm">
							<input
								checked={pollEnabled}
								onChange={(event) =>
									setPollEnabled(event.target.checked)
								}
								type="checkbox"
							/>
							{t('post.poll.add')}
						</label>
						{pollEnabled && (
							<>
								<Input
									onChange={(event) =>
										setPollQuestion(event.target.value)
									}
									placeholder={t('post.poll.question')}
									value={pollQuestion}
								/>
								<div className="flex gap-2">
									{(['single', 'multiple'] as const).map(
										(value) => (
											<Button
												key={value}
												onClick={() =>
													setPollType(value)
												}
												size="sm"
												variant={
													pollType === value
														? 'primary'
														: 'outline'
												}
											>
												{t(`post.poll.${value}`)}
											</Button>
										)
									)}
								</div>
								{pollOptions.map((option, index) => (
									<div className="flex gap-2" key={index}>
										<Input
											onChange={(event) =>
												setPollOptions((current) =>
													current.map((item, i) =>
														i === index
															? event.target.value
															: item
													)
												)
											}
											placeholder={t('post.poll.option', {
												number: index + 1,
											})}
											value={option}
										/>
										{pollOptions.length > 2 && (
											<Button
												onClick={() =>
													setPollOptions((current) =>
														current.filter(
															(_, i) =>
																i !== index
														)
													)
												}
												size="sm"
												variant="ghost"
											>
												<Icon icon="lucide:x" />
											</Button>
										)}
									</div>
								))}
								{pollOptions.length < 10 && (
									<Button
										onClick={() =>
											setPollOptions((current) => [
												...current,
												'',
											])
										}
										size="sm"
										variant="outline"
									>
										{t('post.poll.addOption')}
									</Button>
								)}
							</>
						)}
					</div>
					<div className="flex flex-col gap-2 rounded-lg border border-primary/20 p-3">
						<span className="font-medium text-sm">
							{t('post.attach.attachments')}
						</span>
						<Input
							onChange={(event) =>
								setAttachmentSearch(event.target.value)
							}
							placeholder={t('post.attach.search')}
							value={attachmentSearch}
						/>
						<span className="text-foreground text-xs">
							{t('post.attach.builds')}
						</span>
						<div className="flex flex-wrap gap-2">
							{(builds?.data ?? [])
								.filter((build) =>
									build.title
										.toLowerCase()
										.includes(
											attachmentSearch.toLowerCase()
										)
								)
								.map((build) => (
									<Button
										className="max-w-full truncate"
										key={build.id}
										onClick={() =>
											toggleId(
												attachedBuildIds,
												String(build.id),
												setAttachedBuildIds
											)
										}
										size="sm"
										variant={
											attachedBuildIds.includes(
												String(build.id)
											)
												? 'primary'
												: 'outline'
										}
									>
										{build.title}
									</Button>
								))}
						</div>
						<span className="text-foreground text-xs">
							{t('post.attach.tierLists')}
						</span>
						<div className="flex flex-wrap gap-2">
							{(tierLists?.data ?? [])
								.filter((list) =>
									list.title
										.toLowerCase()
										.includes(
											attachmentSearch.toLowerCase()
										)
								)
								.map((list) => (
									<Button
										className="max-w-full truncate"
										key={list.id}
										onClick={() =>
											toggleId(
												attachedTierListIds,
												String(list.id),
												setAttachedTierListIds
											)
										}
										size="sm"
										variant={
											attachedTierListIds.includes(
												String(list.id)
											)
												? 'primary'
												: 'outline'
										}
									>
										{list.title}
									</Button>
								))}
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('post.cancel')}</Modal.Close>
					<Modal.Action
						disabled={
							!content.trim() || mutation.isPending || uploading
						}
						onClick={async () => {
							await mutation.mutateAsync()
						}}
					>
						{t(isEditing ? 'post.save' : 'post.publish')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}

export function usePostDelete(
	post: Pick<PostEditable, 'external_id'>,
	onDeleted?: () => void
) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const mutation = useMutation({
		mutationFn: () => postService.delete(post.external_id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['feed'] })
			queryClient.removeQueries({ queryKey: ['post', post.external_id] })
			toast.success(t('post.toast.deleted'))
			onDeleted?.()
		},
		onError: () => toast.error(t('post.toast.deleteError')),
	})
	return {
		isPending: mutation.isPending,
		remove: () => {
			if (window.confirm(t('post.deleteConfirm'))) mutation.mutate()
		},
	}
}
