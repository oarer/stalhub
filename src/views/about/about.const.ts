import type { AboutMember, LinkItem } from './components/about.types'

export const contacts: AboutMember[] = [
	{
		name: 'oarer',
		description: 'about.developer_role',
		links: [
			{
				href: 'https://t.me/oarer_yml',
				icon: 'basil:telegram-outline',
			},
			{
				href: 'https://github.com/oarer',
				icon: 'mdi:github',
			},
		],
	},
	{
		name: 'art3mlapa',
		description: 'about.designer_role',
		links: [
			{
				href: 'https://t.me/jvmdump',
				icon: 'basil:telegram-outline',
			},
			{
				href: 'https://github.com/art3mLapa',
				icon: 'mdi:github',
			},
		],
	},
]

export const supportLinks: LinkItem[] = [
	{
		label: 'about.support_links.donate.label',
		href: 'https://pay.cloudtips.ru/p/4500e11c',
		icon: 'lucide:heart',
		description: 'about.support_links.donate.description',
	},
	{
		label: 'about.support_links.telegram.label',
		href: 'https://t.me/st4lhub',
		icon: 'basil:telegram-outline',
		description: 'about.support_links.telegram.description',
	},
	{
		label: 'about.support_links.github.label',
		href: 'https://github.com/oarer/stalhub',
		icon: 'mdi:github',
		description: 'about.support_links.github.description',
	},
]

export const thanks: AboutMember[] = [
	{
		name: 'andcoolsystems',
		description: 'about.andcool_description',
		links: [
			{
				href: 'https://t.me/andcool_channel',
				icon: 'basil:telegram-outline',
			},
			{
				href: 'https://github.com/Andcool-Systems',
				icon: 'mdi:github',
			},
		],
	},
	{
		name: 'rashingpro',
		description: 'about.rashing_description',
		links: [
			{
				href: 'https://github.com/RashingPro',
				icon: 'mdi:github',
			},
		],
	},
]

export const contactLinks: LinkItem[] = [
	{
		label: 'about.contact_links.support.label',
		href: 'https://t.me/oarer_yml',
		icon: 'lucide:wrench',
		description: 'about.contact_links.support.description',
	},
	{
		label: 'about.contact_links.cooperation.label',
		href: 'https://t.me/oarer_yml',
		icon: 'lucide:handshake',
		description: 'about.contact_links.cooperation.description',
	},
	{
		label: 'about.contact_links.advertising.label',
		href: 'https://t.me/oarer_yml',
		icon: 'lucide:megaphone',
		description: 'about.contact_links.advertising.description',
	},
]
