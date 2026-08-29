'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	QuestArticleFields,
	type QuestFieldsValue,
} from '@/components/articles/QuestArticleFields'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Tabs } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/Toast'
import type { EditorTab } from '@/constants/article-editor.const'
import { cn } from '@/lib/cn'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import { articleService } from '@/services/article/article.service'
import {
	ARTICLE_STATUS_META,
	ArticleStatus,
	ArticleType,
	type ArticleUpdate,
	QuestType,
} from '@/types/article.type'
import { ComponentsModal } from './components/article/ComponentsModal'
import { EditorPane } from './components/article/EditorPane'
import { EditorToolbar } from './components/article/EditorToolbar'
import { parseTags } from './components/article/editor-utils'
import { ImageModal } from './components/article/ImageModal'
import { PreviewPane } from './components/article/PreviewPane'
import { TableModal } from './components/article/TableModal'
import { TagsModal } from './components/article/TagsModal'
import { useArticleHotkeys } from './hooks/useArticleHotkeys'
import { useAutosave } from './hooks/useAutosave'
import { useCompiledPreview } from './hooks/useCompiledPreview'
import { useSyncedScroll } from './hooks/useSyncedScroll'

interface ArticleEditorProps {
	articleId: string
}

export default function ArticleEditor({ articleId }: ArticleEditorProps) {
	const router = useRouter()
	const queryClient = getQueryClient()
	const t = useTranslations()
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const previewRef = useRef<HTMLDivElement>(null)

	const { data: article } = useSuspenseQuery(articleQueries.get(articleId))

	const [title, setTitle] = useState(article.title)
	const [content, setContent] = useState(article.content)
	const [tags, setTags] = useState(article.tags.join(', '))
	const [imageUrl, setImageUrl] = useState(article.image_url ?? '')
	const [quest, setQuest] = useState<QuestFieldsValue>({
		quest_name: article.quest_name ?? '',
		quest_type: article.quest_type ?? QuestType.STORY,
		reward_text: article.reward_text ?? '',
		reward_money:
			article.reward_money == null ? '' : String(article.reward_money),
		faction: article.faction ?? null,
	})
	const [mobileTab, setMobileTab] = useState<EditorTab>('write')
	const [isSaving, setIsSaving] = useState(false)
	const [lastSaved, setLastSaved] = useState<Date | null>(null)
	const [tagsModalOpen, setTagsModalOpen] = useState(false)
	const [componentsModalOpen, setComponentsModalOpen] = useState(false)
	const [tableModalOpen, setTableModalOpen] = useState(false)
	const [imageModalOpen, setImageModalOpen] = useState(false)

	const isDirty =
		title !== article.title ||
		content !== article.content ||
		tags !== article.tags.join(', ') ||
		imageUrl !== (article.image_url ?? '') ||
		quest.quest_name !== (article.quest_name ?? '') ||
		quest.reward_text !== (article.reward_text ?? '') ||
		quest.reward_money !==
			(article.reward_money == null
				? ''
				: String(article.reward_money)) ||
		quest.quest_type !== (article.quest_type ?? QuestType.STORY) ||
		quest.faction !== (article.faction ?? null)

	const updateMutation = useMutation({
		mutationFn: (data: ArticleUpdate) =>
			articleService.update(articleId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['article', articleId] })
			queryClient.invalidateQueries({ queryKey: ['articles'] })
			setIsSaving(false)
			setLastSaved(new Date())
		},
		onError: () => {
			setIsSaving(false)
			toast.error(t('me.articleEditor.toastSaveError'))
		},
	})

	const submitMutation = useMutation({
		mutationFn: () => articleService.submit(articleId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['article', articleId] })
			queryClient.invalidateQueries({ queryKey: ['articles'] })
			toast.success(t('me.articleEditor.toastSubmitted'))
			router.push('/me/articles')
		},
		onError: () => {
			toast.error(t('me.articleEditor.toastSubmitError'))
		},
	})

	const save = useCallback(() => {
		if (isSaving) return
		setIsSaving(true)
		updateMutation.mutate({
			title,
			content,
			tags: parseTags(tags),
			image_url: imageUrl || null,
			...(article.type === ArticleType.QUEST
				? {
						quest_name: quest.quest_name || null,
						quest_type: quest.quest_type,
						reward_text: quest.reward_text || null,
						reward_money:
							quest.reward_money === ''
								? null
								: Number(quest.reward_money),
						faction: quest.faction,
					}
				: {}),
		})
	}, [
		title,
		content,
		tags,
		imageUrl,
		quest,
		article.type,
		isSaving,
		updateMutation,
	])

	const handleSubmit = () => {
		submitMutation.mutate()
	}

	const handleImageUpload = useCallback(
		async (file: File) => {
			return articleService.uploadImage(articleId, file)
		},
		[articleId]
	)

	const handleTagsSave = (newTags: string) => {
		setTags(newTags)
	}

	const { handleEditorScroll, handlePreviewScroll } = useSyncedScroll(
		textareaRef,
		previewRef
	)

	useArticleHotkeys({
		isDirty,
		onSave: save,
		openComponents: () => setComponentsModalOpen(true),
		openTable: () => setTableModalOpen(true),
		setContent,
		textareaRef,
	})

	useAutosave({ isDirty, onSave: save })

	const { compiledSource, compileError } = useCompiledPreview(content)

	useEffect(() => {
		if (mobileTab === 'write') {
			textareaRef.current?.focus()
		}
	}, [mobileTab])

	return (
		<section className="flex h-full flex-col gap-2">
			<header className="flex items-center justify-between gap-3 px-4">
				<div className="flex items-center gap-2">
					<Button
						className="p-2.5"
						onClick={() => router.back()}
						variant={'ghost'}
					>
						<Icon className="size-5" icon="lucide:arrow-left" />
					</Button>
					<Input
						className="flex-1 border-0"
						label="me.articleEditor.title"
						onChange={(e) => setTitle(e.target.value)}
						value={title}
					/>
				</div>

				<div className="flex items-center gap-2">
					<span
						className={cn(
							'hidden rounded-full px-2.5 py-0.5 font-semibold text-xs sm:inline-block',
							ARTICLE_STATUS_META[article.status].color
						)}
					>
						{t(`articles.status.${article.status}`)}
					</span>

					{isDirty && (
						<span className="hidden font-semibold text-text-accent text-xs sm:inline-block">
							{t('me.articleEditor.notSaved')}
						</span>
					)}

					{lastSaved && !isDirty && (
						<span className="hidden font-semibold text-text-accent text-xs sm:inline-block">
							{t('me.articleEditor.saved')}
						</span>
					)}
				</div>
			</header>

			<EditorToolbar
				handleSubmit={handleSubmit}
				isDirty={isDirty}
				isSaving={isSaving}
				isSubmitPending={submitMutation.isPending}
				save={save}
				setComponentsModalOpen={setComponentsModalOpen}
				setContent={setContent}
				setImageModalOpen={setImageModalOpen}
				setTableModalOpen={setTableModalOpen}
				setTagsModalOpen={setTagsModalOpen}
				showSubmit={article.status === ArticleStatus.PENDING}
				textareaRef={textareaRef}
			/>

			{article.type === ArticleType.QUEST && (
				<QuestArticleFields onChange={setQuest} value={quest} />
			)}

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
				onSave={handleTagsSave}
				open={tagsModalOpen}
			/>

			<ComponentsModal
				articleId={articleId}
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
				onUpload={handleImageUpload}
				open={imageModalOpen}
			/>
		</section>
	)
}
