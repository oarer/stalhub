export interface SocialLink {
	href: string
	icon: string
}

export interface AboutMember {
	name: string
	description: string
	links: SocialLink[]
}

export interface LinkItem {
	label: string
	href: string
	icon: string
	description: string
}

export interface LinksSectionProps {
	contactLinks: LinkItem[]
	supportLinks: LinkItem[]
}

export const view = {
	initial: 'hidden' as const,
	whileInView: 'show' as const,
	viewport: { once: true, amount: 0.3 },
	variants: {
		hidden: { opacity: 0, y: 16, scale: 0.98 },
		show: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.7,
				ease: [0.22, 1, 0.36, 1] as const,
			},
		},
	},
} as const
