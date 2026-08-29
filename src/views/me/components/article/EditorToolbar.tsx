import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { Modal } from '@/components/ui/Modal'
import {
	TOOLBAR_ACTION_CONFIGS,
	type ToolbarAction,
} from '@/constants/article-editor.const'
import { applyEdit, insertAtLineStart, wrapSelection } from './editor-utils'
import { InsertImageModal } from './InsertImageModal'

const HOTKEYS = [
	{ shortcut: 'Ctrl+B', label: 'me.articleEditor.toolbar.bold' },
	{ shortcut: 'Ctrl+I', label: 'me.articleEditor.toolbar.italic' },
	{
		shortcut: 'Ctrl+Shift+X',
		label: 'me.articleEditor.toolbar.strikethrough',
	},
	{ shortcut: 'Ctrl+Shift+H', label: 'me.articleEditor.toolbar.heading' },
	{ shortcut: 'Ctrl+Shift+.', label: 'me.articleEditor.toolbar.quote' },
	{ shortcut: 'Ctrl+E', label: 'me.articleEditor.toolbar.inlineCode' },
	{ shortcut: 'Ctrl+Shift+E', label: 'me.articleEditor.toolbar.codeBlock' },
	{ shortcut: 'Ctrl+K', label: 'me.articleEditor.toolbar.link' },
	{ shortcut: 'Ctrl+Shift+I', label: 'me.articleEditor.toolbar.image' },
	{ shortcut: 'Ctrl+Shift+8', label: 'me.articleEditor.toolbar.bulletList' },
	{ shortcut: 'Ctrl+Shift+9', label: 'me.articleEditor.toolbar.orderedList' },
	{
		shortcut: 'Ctrl+Shift+7',
		label: 'me.articleEditor.toolbar.horizontalRule',
	},
	{ shortcut: 'Ctrl+Shift+T', label: 'me.articleEditor.toolbar.table' },
	{ shortcut: 'Ctrl+Shift+M', label: 'me.articleEditor.toolbar.components' },
	{ shortcut: 'Ctrl+S', label: 'me.articleEditor.toolbar.save' },
] as const

interface EditorToolbarProps {
	textareaRef: React.RefObject<HTMLTextAreaElement | null>
	setContent: (v: string) => void
	setTableModalOpen: (v: boolean) => void
	setComponentsModalOpen: (v: boolean) => void
	setTagsModalOpen: (v: boolean) => void
	setImageModalOpen: (v: boolean) => void
	onImageUpload?: (file: File) => Promise<string>
	onInsertMarkdown: (markdown: string) => void
	isDirty: boolean
	isSaving: boolean
	save: () => void
	handleSubmit: () => void
	isSubmitPending: boolean
	showSubmit: boolean
}

export function EditorToolbar({
	textareaRef,
	setContent,
	setTableModalOpen,
	setComponentsModalOpen,
	setTagsModalOpen,
	setImageModalOpen,
	onImageUpload,
	onInsertMarkdown,
	isDirty,
	isSaving,
	save,
	handleSubmit,
	isSubmitPending,
	showSubmit,
}: EditorToolbarProps) {
	const [hotkeysOpen, setHotkeysOpen] = useState(false)
	const [uploadImageOpen, setUploadImageOpen] = useState(false)
	const t = useTranslations()

	const toolbarActions = useMemo<ToolbarAction[]>(() => {
		const mapped = TOOLBAR_ACTION_CONFIGS.map((config) => {
			if ('separator' in config) {
				return {
					icon: '',
					label: '',
					action: () => {},
					separator: true,
				}
			}

			switch (config.type) {
				case 'wrap':
					return {
						icon: config.icon,
						label: t(config.label),
						shortcut: config.shortcut,
						action(ta: HTMLTextAreaElement) {
							applyEdit(
								ta,
								setContent,
								wrapSelection(
									ta,
									config.prefix,
									config.suffix,
									config.placeholder
										? t(config.placeholder)
										: ''
								)
							)
						},
					}
				case 'line':
					return {
						icon: config.icon,
						label: t(config.label),
						shortcut: config.shortcut,
						action(ta: HTMLTextAreaElement) {
							applyEdit(
								ta,
								setContent,
								insertAtLineStart(
									ta,
									config.prefix,
									config.placeholder
										? t(config.placeholder)
										: ''
								)
							)
						},
					}
				case 'code-block':
					return {
						icon: config.icon,
						label: t(config.label),
						shortcut: config.shortcut,
						action(ta: HTMLTextAreaElement) {
							const start = ta.selectionStart
							const end = ta.selectionEnd
							const selected = ta.value.slice(start, end)
							const block = `\`\`\`\n${selected || t('me.articleEditor.hotkeys.code')}\n\`\`\``
							const next =
								ta.value.slice(0, start) +
								block +
								ta.value.slice(end)
							const newStart = start + 4
							const newEnd =
								newStart +
								(selected || t('me.articleEditor.hotkeys.code'))
									.length
							applyEdit(ta, setContent, {
								next,
								newStart,
								newEnd,
							})
						},
					}
				case 'modal':
					return {
						icon: config.icon,
						label: t(config.label),
						shortcut: config.shortcut,
						action() {
							if (config.modal === 'table')
								setTableModalOpen(true)
							if (config.modal === 'components')
								setComponentsModalOpen(true)
						},
					}
			}
		})

		return [
			...mapped,
			{
				icon: '',
				label: '',
				action: () => {},
				separator: true,
			},
			{
				icon: 'lucide:keyboard',
				label: t('me.articleEditor.hotkeysTitle'),
				action: () => {
					setHotkeysOpen(true)
				},
			},
		]
	}, [setContent, setTableModalOpen, setComponentsModalOpen, t])

	return (
		<div className="flex items-center justify-between px-2">
			<div className="flex items-center gap-2 rounded-lg bg-card p-1 px-2">
				{toolbarActions.map((action, i) =>
					action.separator ? (
						<Divider
							className="my-1"
							key={`sep-${i}`}
							orientation={'vertical'}
						/>
					) : (
						<button
							className="flex size-8 cursor-pointer items-center justify-center rounded-md text-text-accent transition-colors hover:bg-accent/50 hover:text-text"
							key={action.label}
							onClick={() => {
								const ta = textareaRef.current
								if (ta) action.action(ta)
							}}
							title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ''}`}
							type="button"
						>
							<Icon className="size-4.5" icon={action.icon} />
						</button>
					)
				)}
			</div>
			<div className="flex items-center gap-2 rounded-lg bg-card p-1 px-2">
				<Button
					className="p-2"
					onClick={() => setTagsModalOpen(true)}
					size="sm"
					title={t('me.articleEditor.tags')}
					variant="secondary"
				>
					<Icon className="size-4.5" icon="lucide:tag" />
				</Button>

				<Button
					className="p-2"
					onClick={() => setImageModalOpen(true)}
					size="sm"
					title={t('me.articleEditor.cover')}
					variant="secondary"
				>
					<Icon className="size-4.5" icon="lucide:image" />
				</Button>

				<Button
					className="p-2"
					onClick={() => setUploadImageOpen(true)}
					size="sm"
					title={t('me.articleEditor.insertImage')}
					variant="secondary"
				>
					<Icon
						className="size-4.5"
						icon="lucide:image-plus"
					/>
				</Button>

				<Button
					className="gap-1.5"
					disabled={!isDirty || isSaving}
					onClick={save}
					size="sm"
					variant="secondary"
				>
					{isSaving ? (
						<Icon
							className="size-4.5 animate-spin"
							icon="lucide:loader-circle"
						/>
					) : (
						<Icon className="size-4.5" icon="lucide:save" />
					)}
					<span className="hidden font-semibold md:inline">
						{t('me.articleEditor.save')}
					</span>
				</Button>

				{showSubmit && (
					<Button
						className="gap-1.5 font-semibold"
						disabled={isSubmitPending}
						onClick={handleSubmit}
						size="sm"
					>
						<Icon className="size-4.5" icon="lucide:send" />
						<span className="hidden md:inline">
							{isSubmitPending
								? t('me.articleEditor.submitting')
								: t('me.articleEditor.submit')}
						</span>
					</Button>
				)}
			</div>

			<Modal.Root onOpenChange={setHotkeysOpen} open={hotkeysOpen}>
				<Modal.Content className="max-w-md" fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('me.articleEditor.hotkeysTitle')}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="flex flex-col gap-1.5">
							{HOTKEYS.map((h) => (
								<div
									className="flex items-center justify-between rounded-md px-0.5 py-1.5 transition-colors hover:bg-accent/30"
									key={h.shortcut}
								>
									<span className="font-semibold text-sm">
										{t(h.label)}
									</span>
									<kbd
										className={`${montserrat.className} rounded-md border border-primary bg-card px-2 py-0.5 font-semibold text-text-accent text-xs`}
									>
										{h.shortcut}
									</kbd>
								</div>
							))}
						</div>
					</Modal.Body>
				</Modal.Content>
			</Modal.Root>

			<InsertImageModal
				onInsert={onInsertMarkdown}
				onOpenChange={setUploadImageOpen}
				onUpload={onImageUpload}
				open={uploadImageOpen}
			/>
		</div>
	)
}
