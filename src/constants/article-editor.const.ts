import { ArticleStatus } from '@/types/article.type'

export type EditorTab = 'write' | 'preview'

export interface ToolbarAction {
	icon: string
	label: string
	shortcut?: string
	action: (textarea: HTMLTextAreaElement) => void
	separator?: boolean
}

type ToolbarActionConfig =
	| { icon: string; label: string; shortcut?: string; separator: true }
	| {
			icon: string
			label: string
			shortcut?: string
			type: 'wrap'
			prefix: string
			suffix: string
			placeholder?: string
	  }
	| {
			icon: string
			label: string
			shortcut?: string
			type: 'line'
			prefix: string
			placeholder?: string
	  }
	| {
			icon: string
			label: string
			shortcut?: string
			type: 'code-block'
	  }
	| {
			icon: string
			label: string
			shortcut?: string
			type: 'modal'
			modal: 'table' | 'components'
	  }

export const AUTOSAVE_DELAY = 3000
export const PREVIEW_DEBOUNCE = 300

export const MAX_VISIBLE_TAGS = 5

export const STATUS_VARIANT: Record<
	ArticleStatus,
	'primary' | 'secondary' | 'danger' | 'success'
> = {
	[ArticleStatus.PENDING]: 'primary',
	[ArticleStatus.REVIEW]: 'secondary',
	[ArticleStatus.DENIED]: 'danger',
	[ArticleStatus.BANNED]: 'danger',
	[ArticleStatus.APPROVED]: 'success',
}

export const TABLE_MAX = 8
export const TABLE_HEADER_PLACEHOLDER = 'me.articleEditor.hotkeys.heading'

export const MDX_COMPONENT_SNIPPET = (
	type: string,
	heading: string,
	content: string
) => `:::${type} ${heading}\n${content}\n:::\n`

const HORIZONTAL_RULE = '\n---\n'

export const TOOLBAR_ACTION_CONFIGS: ToolbarActionConfig[] = [
	{
		icon: 'lucide:bold',
		label: 'me.articleEditor.toolbar.bold',
		shortcut: 'Ctrl+B',
		type: 'wrap',
		prefix: '**',
		suffix: '**',
		placeholder: 'me.articleEditor.hotkeys.text',
	},
	{
		icon: 'lucide:italic',
		label: 'me.articleEditor.toolbar.italic',
		shortcut: 'Ctrl+I',
		type: 'wrap',
		prefix: '*',
		suffix: '*',
		placeholder: 'me.articleEditor.hotkeys.text',
	},
	{
		icon: 'lucide:strikethrough',
		label: 'me.articleEditor.toolbar.strikethrough',
		shortcut: 'Ctrl+Shift+X',
		type: 'wrap',
		prefix: '~~',
		suffix: '~~',
		placeholder: 'me.articleEditor.hotkeys.text',
	},
	{ icon: '', label: '', separator: true },
	{
		icon: 'lucide:heading',
		label: 'me.articleEditor.toolbar.heading',
		shortcut: 'Ctrl+Shift+H',
		type: 'line',
		prefix: '## ',
		placeholder: 'me.articleEditor.hotkeys.heading',
	},
	{
		icon: 'lucide:quote',
		label: 'me.articleEditor.toolbar.quote',
		shortcut: 'Ctrl+Shift+.',
		type: 'line',
		prefix: '> ',
		placeholder: 'me.articleEditor.hotkeys.quote',
	},
	{
		icon: 'lucide:code',
		label: 'me.articleEditor.toolbar.inlineCode',
		shortcut: 'Ctrl+E',
		type: 'wrap',
		prefix: '`',
		suffix: '`',
		placeholder: 'me.articleEditor.hotkeys.code',
	},
	{
		icon: 'lucide:file-code',
		label: 'me.articleEditor.toolbar.codeBlock',
		shortcut: 'Ctrl+Shift+E',
		type: 'code-block',
	},
	{ icon: '', label: '', separator: true },
	{
		icon: 'lucide:link',
		label: 'me.articleEditor.toolbar.link',
		shortcut: 'Ctrl+K',
		type: 'wrap',
		prefix: '[',
		suffix: '](url)',
		placeholder: 'me.articleEditor.hotkeys.text',
	},
	{
		icon: 'lucide:image',
		label: 'me.articleEditor.toolbar.image',
		shortcut: 'Ctrl+Shift+I',
		type: 'wrap',
		prefix: '![',
		suffix: '](url)',
		placeholder: 'me.articleEditor.hotkeys.alt',
	},
	{ icon: '', label: '', separator: true },
	{
		icon: 'lucide:list',
		label: 'me.articleEditor.toolbar.bulletList',
		shortcut: 'Ctrl+Shift+8',
		type: 'line',
		prefix: '- ',
		placeholder: 'me.articleEditor.hotkeys.item',
	},
	{
		icon: 'lucide:list-ordered',
		label: 'me.articleEditor.toolbar.orderedList',
		shortcut: 'Ctrl+Shift+9',
		type: 'line',
		prefix: '1. ',
		placeholder: 'me.articleEditor.hotkeys.item',
	},
	{
		icon: 'lucide:minus',
		label: 'me.articleEditor.toolbar.horizontalRule',
		shortcut: 'Ctrl+Shift+7',
		type: 'line',
		prefix: HORIZONTAL_RULE,
		placeholder: '',
	},
	{ icon: '', label: '', separator: true },
	{
		icon: 'lucide:table',
		label: 'me.articleEditor.toolbar.table',
		shortcut: 'Ctrl+Shift+T',
		type: 'modal',
		modal: 'table',
	},
	{
		icon: 'lucide:puzzle',
		label: 'me.articleEditor.toolbar.components',
		shortcut: 'Ctrl+Shift+M',
		type: 'modal',
		modal: 'components',
	},
]

export const MDX_COMPONENTS = [
	{
		type: 'info',
		icon: 'lucide:info',
		color: 'border-blue-500/30 hover:bg-blue-500/10',
	},
	{
		type: 'warning',
		icon: 'lucide:alert-triangle',
		color: 'border-yellow-500/30 hover:bg-yellow-500/10',
	},
	{
		type: 'tip',
		icon: 'lucide:lightbulb',
		color: 'border-green-500/30 hover:bg-green-500/10',
	},
	{
		type: 'danger',
		icon: 'lucide:alert-circle',
		color: 'border-red-500/30 hover:bg-red-500/10',
	},
	{
		type: 'success',
		icon: 'lucide:check-circle',
		color: 'border-green-500/30 hover:bg-green-500/10',
	},
] as const
