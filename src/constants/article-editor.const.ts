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
export const TABLE_HEADER_PLACEHOLDER = 'Заголовок'

export const MDX_COMPONENT_SNIPPET = (type: string) =>
	`:::${type} Заголовок\nКонтент\n:::\n`

export const HORIZONTAL_RULE = '\n---\n'

export const TOOLBAR_ACTION_CONFIGS: ToolbarActionConfig[] = [
	{
		icon: 'lucide:bold',
		label: 'Bold',
		shortcut: 'Ctrl+B',
		type: 'wrap',
		prefix: '**',
		suffix: '**',
		placeholder: 'текст',
	},
	{
		icon: 'lucide:italic',
		label: 'Italic',
		shortcut: 'Ctrl+I',
		type: 'wrap',
		prefix: '*',
		suffix: '*',
		placeholder: 'текст',
	},
	{
		icon: 'lucide:strikethrough',
		label: 'Strikethrough',
		shortcut: 'Ctrl+Shift+X',
		type: 'wrap',
		prefix: '~~',
		suffix: '~~',
		placeholder: 'текст',
	},
	{ icon: '', label: '', separator: true },
	{
		icon: 'lucide:heading',
		label: 'Heading',
		shortcut: 'Ctrl+Shift+H',
		type: 'line',
		prefix: '## ',
		placeholder: 'Заголовок',
	},
	{
		icon: 'lucide:quote',
		label: 'Quote',
		shortcut: 'Ctrl+Shift+.',
		type: 'line',
		prefix: '> ',
		placeholder: 'Цитата',
	},
	{
		icon: 'lucide:code',
		label: 'Code',
		shortcut: 'Ctrl+E',
		type: 'wrap',
		prefix: '`',
		suffix: '`',
		placeholder: 'code',
	},
	{
		icon: 'lucide:file-code',
		label: 'Code block',
		shortcut: 'Ctrl+Shift+E',
		type: 'code-block',
	},
	{ icon: '', label: '', separator: true },
	{
		icon: 'lucide:link',
		label: 'Link',
		shortcut: 'Ctrl+K',
		type: 'wrap',
		prefix: '[',
		suffix: '](url)',
		placeholder: 'текст',
	},
	{
		icon: 'lucide:image',
		label: 'Image',
		shortcut: 'Ctrl+Shift+I',
		type: 'wrap',
		prefix: '![',
		suffix: '](url)',
		placeholder: 'alt',
	},
	{ icon: '', label: '', separator: true },
	{
		icon: 'lucide:list',
		label: 'Unordered list',
		shortcut: 'Ctrl+Shift+8',
		type: 'line',
		prefix: '- ',
		placeholder: 'Пункт',
	},
	{
		icon: 'lucide:list-ordered',
		label: 'Ordered list',
		shortcut: 'Ctrl+Shift+9',
		type: 'line',
		prefix: '1. ',
		placeholder: 'Пункт',
	},
	{
		icon: 'lucide:minus',
		label: 'Horizontal rule',
		shortcut: 'Ctrl+Shift+7',
		type: 'line',
		prefix: HORIZONTAL_RULE,
		placeholder: '',
	},
	{ icon: '', label: '', separator: true },
	{
		icon: 'lucide:table',
		label: 'Table',
		shortcut: 'Ctrl+Shift+T',
		type: 'modal',
		modal: 'table',
	},
	{
		icon: 'lucide:puzzle',
		label: 'Components',
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
