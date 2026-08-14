export interface Theme {
	name: string
	title: string
	iconName: string
}

export const themes: Theme[] = [
	{
		name: 'system',
		title: 'themes.system',
		iconName: 'lucide:laptop-minimal',
	},
	{ name: 'dark', title: 'themes.dark', iconName: 'lucide:moon-star' },
	{ name: 'light', title: 'themes.light', iconName: 'lucide:sun' },
]
