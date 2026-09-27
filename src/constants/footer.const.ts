export type FooterLink = {
	href: string
	title: string
	icon: string
}

export const footerLinks: FooterLink[] = [
	{
		href: 'https://st4lhub.t.me/?direct',
		title: 'footer.links.bug_report',
		icon: 'lucide:bug',
	},
	{
		href: 'https://t.me/St4lHub',
		title: 'footer.links.telegram',
		icon: 'basil:telegram-outline',
	},
	{
		href: 'https://status.stalhub.dev',
		title: 'footer.links.status',
		icon: 'lucide:chart-no-axes-column',
	},
	{
		href: '/about',
		title: 'footer.links.about',
		icon: 'lucide:book-open',
	},
]

export const footerDocs: FooterLink[] = [
	{
		href: '/legal/tos',
		title: 'footer.docs.tos',
		icon: 'lucide:scale',
	},
]

export type FooterCredit = {
	author: string
	href: string
	labelKey: string
}

export const footerCredits: FooterCredit[] = [
	{
		author: '@oarer',
		href: 'https://oarer.dev',
		labelKey: 'footer.made_by',
	},
	{
		author: '@Art3mLapa',
		href: 'https://github.com/Art3mLapa',
		labelKey: 'footer.design_by',
	},
]
