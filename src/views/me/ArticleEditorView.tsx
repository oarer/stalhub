'use client'

import { Icon } from '@iconify/react'
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Tabs } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/Toast'
import {
	AUTOSAVE_DELAY,
	type EditorTab,
	PREVIEW_DEBOUNCE,
} from '@/constants/article-editor.const'
import { compileMdx } from '@/lib/actions/mdx'
import { cn } from '@/lib/cn'
import { articleQueries } from '@/queries/article/article.queries'
import { articleService } from '@/services/article/article.service'
import {
	ARTICLE_STATUS_META,
	ArticleStatus,
	type ArticleUpdate,
} from '@/types/article.type'
import { ComponentsModal } from './components/article/ComponentsModal'
import { EditorPane } from './components/article/EditorPane'
import { EditorToolbar } from './components/article/EditorToolbar'
import {
	applyEdit,
	insertAtLineStart,
	parseTags,
	wrapSelection,
} from './components/article/editor-utils'
import { ImageModal } from './components/article/ImageModal'
import { PreviewPane } from './components/article/PreviewPane'
import { TableModal } from './components/article/TableModal'
import { TagsModal } from './components/article/TagsModal'

interface ArticleEditorProps {
	articleId: string
}

//! TODO ADD i18n

export default function ArticleEditor({ articleId }: ArticleEditorProps) {
	const router = useRouter()
	const queryClient = useQueryClient()
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const previewRef = useRef<HTMLDivElement>(null)
	const scrollingFrom = useRef<'editor' | 'preview' | null>(null)
	const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const { data: article } = useSuspenseQuery(articleQueries.get(articleId))

	const [title, setTitle] = useState(article.title)
	const [content, setContent] = useState(article.content)
	const [tags, setTags] = useState(article.tags.join(', '))
	const [imageUrl, setImageUrl] = useState(article.image_url ?? '')
	const [mobileTab, setMobileTab] = useState<EditorTab>('write')
	const [isSaving, setIsSaving] = useState(false)
	const [lastSaved, setLastSaved] = useState<Date | null>(null)
	const [compiledSource, setCompiledSource] = useState<string>('')
	const [compileError, setCompileError] = useState(false)
	const [tagsModalOpen, setTagsModalOpen] = useState(false)
	const [componentsModalOpen, setComponentsModalOpen] = useState(false)
	const [tableModalOpen, setTableModalOpen] = useState(false)
	const [imageModalOpen, setImageModalOpen] = useState(false)

	const isDirty =
		title !== article.title ||
		content !== article.content ||
		tags !== article.tags.join(', ') ||
		imageUrl !== (article.image_url ?? '')

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
			toast.error('Ошибка при сохранении')
		},
	})

	const submitMutation = useMutation({
		mutationFn: () => articleService.submit(articleId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['article', articleId] })
			queryClient.invalidateQueries({ queryKey: ['articles'] })
			toast.success('Статья отправлена на рассмотрение')
			router.push('/me/articles')
		},
		onError: () => {
			toast.error('Ошибка при отправке')
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
		})
	}, [title, content, tags, imageUrl, isSaving, updateMutation])

	const handleSubmit = () => {
		submitMutation.mutate()
	}

	const handleTagsSave = (newTags: string) => {
		setTags(newTags)
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const mod = e.ctrlKey || e.metaKey
			if (!mod) return

			const ta = textareaRef.current
			if (!ta) return

			const code = e.code

			if (code === 'KeyS') {
				e.preventDefault()
				if (isDirty) save()
				return
			}

			if (code === 'KeyB') {
				e.preventDefault()
				applyEdit(
					ta,
					setContent,
					wrapSelection(ta, '**', '**', 'текст')
				)
				return
			}
			if (code === 'KeyI' && !e.shiftKey) {
				e.preventDefault()
				applyEdit(ta, setContent, wrapSelection(ta, '*', '*', 'текст'))
				return
			}
			if (code === 'KeyE' && !e.shiftKey) {
				e.preventDefault()
				applyEdit(ta, setContent, wrapSelection(ta, '`', '`', 'code'))
				return
			}
			if (code === 'KeyK' && !e.shiftKey) {
				e.preventDefault()
				applyEdit(
					ta,
					setContent,
					wrapSelection(ta, '[', '](url)', 'текст')
				)
				return
			}

			if (e.shiftKey) {
				if (code === 'KeyX') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						wrapSelection(ta, '~~', '~~', 'текст')
					)
					return
				}
				if (code === 'KeyH') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						insertAtLineStart(ta, '## ', 'Заголовок')
					)
					return
				}
				if (code === 'Period') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						insertAtLineStart(ta, '> ', 'Цитата')
					)
					return
				}
				if (code === 'KeyE') {
					e.preventDefault()
					const start = ta.selectionStart
					const end = ta.selectionEnd
					const selected = ta.value.slice(start, end)
					const block = `\`\`\`\n${selected || 'code'}\n\`\`\``
					const next =
						ta.value.slice(0, start) + block + ta.value.slice(end)
					applyEdit(ta, setContent, {
						next,
						newStart: start + 4,
						newEnd: start + 4 + (selected || 'code').length,
					})
					return
				}
				if (code === 'KeyI') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						wrapSelection(ta, '![', '](url)', 'alt')
					)
					return
				}
				if (code === 'Digit8') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						insertAtLineStart(ta, '- ', 'Пункт')
					)
					return
				}
				if (code === 'Digit9') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						insertAtLineStart(ta, '1. ', 'Пункт')
					)
					return
				}
				if (code === 'Digit7') {
					e.preventDefault()
					const start = ta.selectionStart
					const next =
						ta.value.slice(0, start) +
						'\n---\n' +
						ta.value.slice(start)
					applyEdit(ta, setContent, {
						next,
						newStart: start + 5,
						newEnd: start + 5,
					})
					return
				}
				if (code === 'KeyM') {
					e.preventDefault()
					setComponentsModalOpen(true)
					return
				}
				if (code === 'KeyT') {
					e.preventDefault()
					setTableModalOpen(true)
					return
				}
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isDirty, save])

	useEffect(() => {
		if (!isDirty) return
		if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
		autosaveTimerRef.current = setTimeout(() => {
			save()
		}, AUTOSAVE_DELAY)
		return () => {
			if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
		}
	}, [isDirty, save])

	useEffect(() => {
		if (!content.trim()) {
			setCompiledSource('')
			setCompileError(false)
			return
		}
		if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
		previewTimerRef.current = setTimeout(async () => {
			try {
				const result = await compileMdx(content)
				setCompiledSource(result.compiledSource)
				setCompileError(false)
			} catch {
				setCompileError(true)
			}
		}, PREVIEW_DEBOUNCE)
		return () => {
			if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
		}
	}, [content])

	useEffect(() => {
		if (mobileTab === 'write') {
			textareaRef.current?.focus()
		}
	}, [mobileTab])

	const handleEditorScroll = useCallback(() => {
		if (scrollingFrom.current && scrollingFrom.current !== 'editor') return
		const ta = textareaRef.current
		const pv = previewRef.current
		if (!ta || !pv) return
		scrollingFrom.current = 'editor'
		const ratio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight || 1)
		pv.scrollTop = ratio * (pv.scrollHeight - pv.clientHeight)
		requestAnimationFrame(() => {
			scrollingFrom.current = null
		})
	}, [])

	const handlePreviewScroll = useCallback(() => {
		if (scrollingFrom.current && scrollingFrom.current !== 'preview') return
		const ta = textareaRef.current
		const pv = previewRef.current
		if (!ta || !pv) return
		scrollingFrom.current = 'preview'
		const ratio = pv.scrollTop / (pv.scrollHeight - pv.clientHeight || 1)
		ta.scrollTop = ratio * (ta.scrollHeight - ta.clientHeight)
		requestAnimationFrame(() => {
			scrollingFrom.current = null
		})
	}, [])

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
						label="Название статьи"
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
						{ARTICLE_STATUS_META[article.status].label}
					</span>

					{isDirty && (
						<span className="hidden font-semibold text-text-accent text-xs sm:inline-block">
							Не сохранено
						</span>
					)}

					{lastSaved && !isDirty && (
						<span className="hidden font-semibold text-text-accent text-xs sm:inline-block">
							Сохранено
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

			<div className="border-border-secondary border-b md:hidden">
				<Tabs.Root
					className="px-4 py-1.5"
					onValueChange={(v) => setMobileTab(v as EditorTab)}
					value={mobileTab}
				>
					<Tabs.List className="w-full">
						<Tabs.Trigger className="flex-1" value="write">
							Редактирование
						</Tabs.Trigger>
						<Tabs.Trigger className="flex-1" value="preview">
							Просмотр
						</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
			</div>

			<div className="flex min-h-0 flex-1 flex-col gap-2 md:flex-row">
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
				open={imageModalOpen}
			/>
		</section>
	)
}
