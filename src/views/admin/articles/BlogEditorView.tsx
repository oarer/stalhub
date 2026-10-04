'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Tabs } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/Toast'
import type { EditorTab } from '@/constants/article_editor.const'
import { cn } from '@/lib/cn'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import { articleService } from '@/services/article/article.service'
import {
	ARTICLE_STATUS_META,
	type ArticleStatus,
	ArticleType,
	type ArticleCoverConfig,
} from '@/types/article.type'
import { ComponentsModal } from '@/views/me/components/article/ComponentsModal'
import { CoverPanelModal } from '@/views/me/components/article/CoverPanelModal'
import { EditorPane } from '@/views/me/components/article/EditorPane'
import { EditorToolbar } from '@/views/me/components/article/EditorToolbar'
import {
	applyEdit,
	parseTags,
} from '@/views/me/components/article/editor-utils'
import { ImageModal } from '@/views/me/components/article/ImageModal'
import { PreviewPane } from '@/views/me/components/article/PreviewPane'
import { TableModal } from '@/views/me/components/article/TableModal'
import { TagsModal } from '@/views/me/components/article/TagsModal'
import { useArticleHotkeys } from '@/views/me/hooks/useArticleHotkeys'
import { useAutosave } from '@/views/me/hooks/useAutosave'
import { useCompiledPreview } from '@/views/me/hooks/useCompiledPreview'
import { useSyncedScroll } from '@/views/me/hooks/useSyncedScroll'

type Initial = {
	title: string
	content: string
	tags: string
	imageUrl: string
	coverConfig: ArticleCoverConfig | null
}

function EditorForm({
	initial,
	articleId,
	onSubmit,
	submitLabel,
	isSubmitPending,
	headerBadge,
	publicHref,
	isCreate,
}: {
	initial: Initial
	articleId?: string
	onSubmit: (data: {
		title: string
		content: string
		tags: string[]
		image_url: string | null
		cover_config: ArticleCoverConfig | null
	}) => void
	submitLabel: string
	isSubmitPending: boolean
	headerBadge?: React.ReactNode
	publicHref?: string
	isCreate: boolean
}) {
	const t = useTranslations()
	const router = useRouter()
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const previewRef = useRef<HTMLDivElement>(null)

	const [title, setTitle] = useState(initial.title)
	const [content, setContent] = useState(initial.content)
	const [tags, setTags] = useState(initial.tags)
	const [imageUrl, setImageUrl] = useState(initial.imageUrl)
	const [coverConfig, setCoverConfig] = useState(initial.coverConfig)
	const [coverModalOpen, setCoverModalOpen] = useState(false)
	const [mobileTab, setMobileTab] = useState<EditorTab>('write')
	const [tagsModalOpen, setTagsModalOpen] = useState(false)
	const [componentsModalOpen, setComponentsModalOpen] = useState(false)
	const [tableModalOpen, setTableModalOpen] = useState(false)
	const [imageModalOpen, setImageModalOpen] = useState(false)

	const isDirty =
		title !== initial.title ||
		content !== initial.content ||
		tags !== initial.tags ||
		imageUrl !== initial.imageUrl ||
		JSON.stringify(coverConfig) !== JSON.stringify(initial.coverConfig)

	const canSubmit = title.trim() !== '' && content.trim() !== ''

	const handleSave = useCallback(() => {
		if (!canSubmit) return
		onSubmit({
			title: title.trim(),
			content,
			tags: parseTags(tags),
			image_url: imageUrl.trim() || null,
			cover_config: coverConfig,
		})
	}, [canSubmit, onSubmit, title, content, tags, imageUrl, coverConfig])

	const handleImageUpload = useCallback(
		async (file: File) => {
			if (!articleId) throw new Error('no article')
			return articleService.uploadImage(articleId, file)
		},
		[articleId]
	)

	const handleInsertMarkdown = useCallback((markdown: string) => {
		const ta = textareaRef.current
		if (!ta) return
		const start = ta.selectionStart
		const end = ta.selectionEnd
		const next = ta.value.slice(0, start) + markdown + ta.value.slice(end)
		const newStart = start + markdown.length
		applyEdit(ta, setContent, { next, newStart, newEnd: newStart })
	}, [])

	const { handleEditorScroll, handlePreviewScroll } = useSyncedScroll(
		textareaRef,
		previewRef
	)

	useArticleHotkeys({
		isDirty: isDirty && canSubmit,
		onSave: handleSave,
		openComponents: () => setComponentsModalOpen(true),
		openTable: () => setTableModalOpen(true),
		setContent,
		textareaRef,
	})

	useAutosave({ isDirty: !isCreate && isDirty, onSave: handleSave })

	const { compiledSource, compileError } = useCompiledPreview(content)

	useEffect(() => {
		if (mobileTab === 'write') textareaRef.current?.focus()
	}, [mobileTab])

	return (
		<section className="flex h-full flex-col gap-2">
			<header className="flex items-center justify-between gap-3 px-4">
				<div className="flex min-w-0 flex-1 items-center gap-2">
					<Button
						className="p-2.5"
						onClick={() => router.back()}
						variant="ghost"
					>
						<Icon className="size-5" icon="lucide:arrow-left" />
					</Button>
					<Input
						className="flex-1 border-0"
						label="blog.editor.titlePlaceholder"
						onChange={(e) => setTitle(e.target.value)}
						value={title}
					/>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{headerBadge}
					<Button
						className="p-2.5"
						onClick={() => setCoverModalOpen(true)}
						title={t('blog.cover.title')}
						variant="ghost"
					>
						<Icon
							className="size-5"
							icon="lucide:sliders-horizontal"
						/>
					</Button>
					{publicHref && (
						<Link
							className="hidden text-primary text-sm hover:underline sm:inline"
							href={publicHref}
							target="_blank"
						>
							{t('blog.editor.view')}
						</Link>
					)}
					<Button
						disabled={!canSubmit || isSubmitPending}
						loading={isSubmitPending}
						onClick={handleSave}
						size="sm"
						variant="primary"
					>
						<Icon className="size-4" icon="lucide:send" />
						{submitLabel}
					</Button>
				</div>
			</header>

			{isCreate && (
				<p className="px-4 font-medium text-text-accent text-xs">
					{t('blog.editor.galleryHint')}
				</p>
			)}

			<EditorToolbar
				handleSubmit={() => {}}
				isDirty={isDirty}
				isSaving={false}
				isSubmitPending={false}
				onImageUpload={articleId ? handleImageUpload : undefined}
				onInsertMarkdown={handleInsertMarkdown}
				save={handleSave}
				setComponentsModalOpen={setComponentsModalOpen}
				setContent={setContent}
				setImageModalOpen={setImageModalOpen}
				setTableModalOpen={setTableModalOpen}
				setTagsModalOpen={setTagsModalOpen}
				showSubmit={false}
				textareaRef={textareaRef}
			/>

			<div className="border-primary border-b md:hidden">
				<Tabs.Root
					className="px-4 py-1.5"
					onValueChange={(v) => setMobileTab(v as EditorTab)}
					value={mobileTab}
				>
					<Tabs.List className="w-full">
						<Tabs.Trigger className="flex-1" value="write">
							{t('me.articleEditor.edit')}
						</Tabs.Trigger>
						<Tabs.Trigger className="flex-1" value="preview">
							{t('me.articleEditor.preview')}
						</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
			</div>

			<div className="flex min-h-90 flex-1 flex-col gap-2 md:flex-row">
				<EditorPane
					mobileTab={mobileTab}
					onChange={setContent}
					onScroll={handleEditorScroll}
					textareaRef={textareaRef}
					value={content}
				/>
				<PreviewPane
					compiledSource={compiledSource}
					compileError={compileError}
					content={content}
					mobileTab={mobileTab}
					onScroll={handlePreviewScroll}
					previewRef={previewRef}
				/>
			</div>

			<TagsModal
				initialTags={tags}
				onOpenChange={setTagsModalOpen}
				onSave={setTags}
				open={tagsModalOpen}
			/>

			<ComponentsModal
				articleId={articleId ?? ''}
				onOpenChange={setComponentsModalOpen}
				open={componentsModalOpen}
				setContent={setContent}
				textareaRef={textareaRef}
			/>

			<TableModal
				onOpenChange={setTableModalOpen}
				open={tableModalOpen}
				setContent={setContent}
				textareaRef={textareaRef}
			/>

			<ImageModal
				initialUrl={imageUrl}
				onOpenChange={setImageModalOpen}
				onSave={setImageUrl}
				onUpload={articleId ? handleImageUpload : undefined}
				open={imageModalOpen}
			/>

			<CoverPanelModal
				content={content}
				initial={coverConfig}
				onOpenChange={setCoverModalOpen}
				onSave={setCoverConfig}
				open={coverModalOpen}
				tags={parseTags(tags)}
				title={title}
			/>
		</section>
	)
}

function CreateMode() {
	const t = useTranslations()
	const router = useRouter()
	const queryClient = getQueryClient()

	const createMutation = useMutation({
		mutationFn: (data: {
			title: string
			content: string
			tags: string[]
			image_url: string | null
			cover_config: ArticleCoverConfig | null
		}) =>
			articleService.create({
				title: data.title,
				content: data.content,
				type: ArticleType.STALHUB,
				tags: data.tags,
				image_url: data.image_url,
				cover_config: data.cover_config,
			}),
		onSuccess: (article) => {
			queryClient.invalidateQueries({ queryKey: ['articles'] })
			toast.success(t('blog.toast.created'))
			router.replace(`/admin/articles/${article.id}/edit`)
		},
		onError: () => toast.error(t('blog.toast.createError')),
	})

	return (
		<EditorForm
			initial={{
				title: '',
				content: '',
				tags: '',
				imageUrl: '',
				coverConfig: null,
			}}
			isCreate
			isSubmitPending={createMutation.isPending}
			onSubmit={(data) => createMutation.mutate(data)}
			submitLabel={t('blog.editor.publish')}
		/>
	)
}

function EditMode({ articleId }: { articleId: string }) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const { data: article } = useSuspenseQuery(articleQueries.get(articleId))

	const updateMutation = useMutation({
		mutationFn: (data: {
			title: string
			content: string
			tags: string[]
			image_url: string | null
			cover_config: ArticleCoverConfig | null
		}) => articleService.update(articleId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['article', articleId] })
			queryClient.invalidateQueries({ queryKey: ['articles'] })
			toast.success(t('blog.editor.updated'))
		},
		onError: () => toast.error(t('blog.editor.updateError')),
	})

	return (
		<EditorForm
			articleId={articleId}
			headerBadge={
				<span
					className={cn(
						'hidden rounded-full px-2.5 py-0.5 font-semibold text-xs sm:inline-block',
						ARTICLE_STATUS_META[article.status as ArticleStatus]
							?.color
					)}
				>
					{t(`articles.status.${article.status}`)}
				</span>
			}
			initial={{
				title: article.title,
				content: article.content,
				tags: article.tags.join(', '),
				imageUrl: article.image_url ?? '',
				coverConfig: article.cover_config ?? null,
			}}
			isCreate={false}
			isSubmitPending={updateMutation.isPending}
			onSubmit={(data) => updateMutation.mutate(data)}
			publicHref={`/blog/${articleId}`}
			submitLabel={t('blog.editor.save')}
		/>
	)
}

export default function BlogEditorView({
	mode,
	articleId,
}: {
	mode: 'create' | 'edit'
	articleId?: string
}) {
	if (mode === 'edit' && articleId) return <EditMode articleId={articleId} />
	return <CreateMode />
}
