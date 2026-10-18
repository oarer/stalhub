export type SzReportCardId = 'promo' | 'news' | 'trading' | 'emissions'

export type SzReportCard = {
	id: SzReportCardId
	image: string
	href: string
	accent: string
}

export const SZ_REPORT_CARDS: ReadonlyArray<SzReportCard> = [
	{
		id: 'promo',
		image: '/images/szreport/promo.jpg',
		href: 'https://t.me/+PXBU8S2d1NE1NmVi',
		accent: 'text-green-600 dark:text-green-400',
	},
	{
		id: 'news',
		image: '/images/szreport/report.jpg',
		href: 'https://t.me/+tjjaDZObjqY5NmY6',
		accent: 'text-blue-600 dark:text-blue-400',
	},
	{
		id: 'trading',
		image: '/images/szreport/trading.jpg',
		href: 'https://t.me/+56v9rnGvFLZmNTAy',
		accent: 'text-orange-600 dark:text-orange-400',
	},
	{
		id: 'emissions',
		image: '/images/szreport/emissions.jpg',
		href: 'https://t.me/stalzone_eruptions',
		accent: 'text-red-600 dark:text-red-400',
	},
]
