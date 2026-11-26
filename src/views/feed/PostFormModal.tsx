'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
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
	avatar?: React.ReactNode
	defaultOpen?: boolean
	inline?: boolean
	onOpenChange?: (open: boolean) => void
}

function Reveal({
	open,
	gap = 0,
	children,
}: {
	open: boolean
	gap?: number
	children: React.ReactNode
}) {
	return (
		<AnimatePresence initial={false}>
			{open && (
				<motion.div
					animate={{ height: 'auto', opacity: 1, marginTop: 0 }}
					className="overflow-hidden"
					exit={{
						height: 0,
						opacity: 0,
						marginTop: -gap,
						transition: {
							height: {
								duration: 0.26,
								ease: [0.4, 0, 0.2, 1],
							},
							marginTop: {
								duration: 0.26,
								ease: [0.4, 0, 0.2, 1],
							},
							opacity: {
								duration: 0.16,
								ease: 'easeInOut',
							},
						},
					}}
					initial={{ height: 0, opacity: 0, marginTop: -gap }}
					transition={{
						height: {
							duration: 0.32,
							ease: [0.22, 1, 0.36, 1],
						},
						marginTop: {
							duration: 0.32,
							ease: [0.22, 1, 0.36, 1],
						},
						opacity: {
							duration: 0.2,
							ease: 'easeOut',
						},
					}}
				>
					<motion.div
						animate={{ y: 0 }}
						initial={{ y: -6 }}
						transition={{
							duration: 0.26,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export function PostFormModal({
	post,
	trigger,
	avatar,
	defaultOpen = false,
	inline = false,
	onOpenChange,
}: PostFormModalProps) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const fileRef = useRef<HTMLInputElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
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
	const [attachmentsOpen, setAttachmentsOpen] = useState(false)
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: height depends on the current text
	useEffect(() => {
		if (!inline || preview) return
		const element = textareaRef.current
		if (!element) return
		element.style.height = 'auto'
		element.style.height = `${element.scrollHeight}px`
	}, [inline, preview, content])

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
			onOpenChange?.(false)
			if (inline) {
				setTitle('')
				setContent('')
				setImageUrls([])
				setPollEnabled(false)
				setPollQuestion('')
				setPollType('single')
				setPollOptions(['', ''])
				setAttachedBuildIds([])
				setAttachedTierListIds([])
				setAttachmentSearch('')
				setPreview(false)
				setAttachmentsOpen(false)
			}
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

	const togglePoll = () => {
		if (pollEnabled) {
			setPollEnabled(false)
			return
		}
		setPollEnabled(true)
		setAttachmentsOpen(false)
	}

	const toggleAttachments = () => {
		if (attachmentsOpen) {
			setAttachmentsOpen(false)
			return
		}
		setAttachmentsOpen(true)
		setPollEnabled(false)
	}

	const hasAttachments =
		attachedBuildIds.length > 0 || attachedTierListIds.length > 0

	const formFields = (
		<>
			{!inline && (
				<Input
					maxLength={160}
					onChange={(event) => setTitle(event.target.value)}
					placeholder={t('post.titlePlaceholder')}
					value={title}
				/>
			)}
			{!inline && (
				<div className="flex items-center justify-between gap-2">
					<span className="text-sm font-medium">
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
			)}
			{preview ? (
				<div className="border-primary/20 bg-card min-h-36 rounded-lg border p-3">
					<MarkdownContent content={content} />
				</div>
			) : (
				<Textarea
					className={
						inline
							? 'min-h-10 resize-none overflow-hidden py-2'
							: 'min-h-40 resize-y'
					}
					maxLength={10000}
					onChange={(event) => setContent(event.target.value)}
					placeholder={t('post.contentPlaceholder')}
					ref={textareaRef}
					rows={inline ? 1 : undefined}
					value={content}
				/>
			)}
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
			{(!inline || imageUrls.length > 0) && (
				<div className="flex flex-wrap items-center gap-2">
					{!inline && (
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
					)}
					<AnimatePresence initial={false}>
						{imageUrls.map((url) => (
							<motion.div
								animate={{ opacity: 1, scale: 1 }}
								className="relative"
								exit={{ opacity: 0, scale: 0.85 }}
								initial={{ opacity: 0, scale: 0.85 }}
								key={url}
								layout
								transition={{
									type: 'spring',
									stiffness: 500,
									damping: 28,
									mass: 0.6,
								}}
							>
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
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			)}
			{inline && (
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-1">
						<Button
							aria-label={t('post.attach.image')}
							className="size-9 p-0"
							disabled={uploading}
							onClick={() => fileRef.current?.click()}
							size="sm"
							variant="ghost"
						>
							<Icon
								className={
									uploading ? 'animate-spin' : undefined
								}
								icon={
									uploading
										? 'lucide:loader-circle'
										: 'lucide:image'
								}
							/>
						</Button>
						<Button
							aria-label={t('post.poll.add')}
							className={`size-9 p-0 ${pollEnabled ? 'bg-primary/15 text-primary hover:bg-primary/20' : ''}`}
							onClick={togglePoll}
							size="sm"
							variant="ghost"
						>
							<Icon icon="lucide:list-checks" />
						</Button>
						<Button
							aria-label={t('post.attach.attachments')}
							className={`size-9 p-0 ${hasAttachments ? 'bg-primary/15 text-primary hover:bg-primary/20' : ''}`}
							onClick={toggleAttachments}
							size="sm"
							variant="ghost"
						>
							<Icon icon="lucide:paperclip" />
						</Button>
						<Button
							aria-label={
								preview ? t('post.write') : t('post.preview')
							}
							className="size-9 p-0"
							onClick={() => setPreview((value) => !value)}
							size="sm"
							variant="ghost"
						>
							<Icon
								icon={preview ? 'lucide:pencil' : 'lucide:eye'}
							/>
						</Button>
					</div>
					<Button
						disabled={
							!content.trim() || mutation.isPending || uploading
						}
						loading={mutation.isPending}
						onClick={() => void mutation.mutateAsync()}
						size="sm"
						variant="primary"
					>
						{t(isEditing ? 'post.save' : 'post.publish')}
					</Button>
				</div>
			)}
			<Reveal gap={inline ? 12 : 16} open={!inline || pollEnabled}>
				<div className="border-primary/20 flex flex-col gap-2 rounded-lg border p-3">
					{!inline && (
						<label className="flex items-center gap-2 text-sm font-medium">
							<input
								checked={pollEnabled}
								onChange={(event) =>
									setPollEnabled(event.target.checked)
								}
								type="checkbox"
							/>
							{t('post.poll.add')}
						</label>
					)}
					<Reveal gap={8} open={inline || pollEnabled}>
						<div className="flex flex-col gap-2">
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
											onClick={() => setPollType(value)}
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
														(_, i) => i !== index
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
						</div>
					</Reveal>
				</div>
			</Reveal>
			<Reveal gap={inline ? 12 : 16} open={!inline || attachmentsOpen}>
				<div className="border-primary/20 flex flex-col gap-2 rounded-lg border p-3">
					<span className="text-sm font-medium">
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
									.includes(attachmentSearch.toLowerCase())
							)
							.map((build) => (
								<Button
									className="max-w-full gap-1.5 truncate"
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
									<AnimatePresence initial={false}>
										{attachedBuildIds.includes(
											String(build.id)
										) && (
											<motion.span
												animate={{
													opacity: 1,
													scale: 1,
												}}
												className="flex"
												exit={{
													opacity: 0,
													scale: 0.6,
												}}
												initial={{
													opacity: 0,
													scale: 0.6,
												}}
												transition={{
													type: 'spring',
													stiffness: 560,
													damping: 22,
													mass: 0.5,
												}}
											>
												<Icon
													className="size-3.5"
													icon="lucide:check"
												/>
											</motion.span>
										)}
									</AnimatePresence>
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
									.includes(attachmentSearch.toLowerCase())
							)
							.map((list) => (
								<Button
									className="max-w-full gap-1.5 truncate"
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
									<AnimatePresence initial={false}>
										{attachedTierListIds.includes(
											String(list.id)
										) && (
											<motion.span
												animate={{
													opacity: 1,
													scale: 1,
												}}
												className="flex"
												exit={{
													opacity: 0,
													scale: 0.6,
												}}
												initial={{
													opacity: 0,
													scale: 0.6,
												}}
												transition={{
													type: 'spring',
													stiffness: 560,
													damping: 22,
													mass: 0.5,
												}}
											>
												<Icon
													className="size-3.5"
													icon="lucide:check"
												/>
											</motion.span>
										)}
									</AnimatePresence>
									{list.title}
								</Button>
							))}
					</div>
				</div>
			</Reveal>
		</>
	)

	if (inline) {
		return (
			<div className="border-primary/20 bg-card/40 flex gap-3 rounded-2xl border p-4">
				{avatar && <div className="shrink-0 pt-1">{avatar}</div>}
				<div className="flex min-w-0 flex-1 flex-col gap-3">
					{formFields}
				</div>
			</div>
		)
	}

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
					{formFields}
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
