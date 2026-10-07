export const floatingIcons = [
	{
		icon: 'lucide:calculator',
		className: 'absolute top-4 left-[10%]',
		size: 'text-4xl',
		color: 'text-primary/35',
		delay: 0,
	},
	{
		icon: 'lucide:braces',
		className: 'absolute top-80 left-[32%]',
		size: 'text-4xl',
		color: 'text-primary/20',
		delay: 0,
	},
	{
		icon: 'lucide:shield-half',
		className: 'absolute top-1/2 left-[2%]',
		size: 'text-3xl',
		color: 'text-primary/50',
		delay: 0,
	},
	{
		icon: 'lucide:box',
		className: 'absolute top-74 right-[20%]',
		size: 'text-4xl',
		color: 'text-primary/50',
		delay: 2,
	},
	{
		icon: 'lucide:landmark',
		className: 'absolute top-2 right-[24%]',
		size: 'text-4xl',
		color: 'text-primary/50',
		delay: 2,
	},
	{
		icon: 'mdi:database',
		className: 'absolute top-48 right-[8%]',
		size: 'text-3xl',
		color: 'text-primary/70',
		delay: 2,
	},
]

export const featuresHero = [
	{
		value: '0₽',
		label: 'landing.features.price',
		color: 'text-primary/90',
	},
	{
		value: '20+',
		label: 'landing.features.tools',
		color: 'text-primary',
	},
	{
		value: '24/7',
		label: 'landing.features.uptime',
		color: 'text-primary/90',
	},
	{
		value: '99.8%',
		label: 'landing.features.analytic',
		color: 'text-primary/90',
	},
]

export const tools = [
	{
		id: 'builds',
		icon: 'lucide:package',
		title: 'landing.tools.tool_list.builds.title',
		desc: 'landing.tools.tool_list.builds.desc',
		link: '/calcs/builds/lite',
	},
	{
		id: 'bp',
		icon: 'lucide:ticket',
		title: 'landing.tools.tool_list.bp.title',
		desc: 'landing.tools.tool_list.bp.desc',
		link: '/calcs/bp',
	},
	{
		id: 'ttk',
		icon: 'lucide:timer-reset',
		title: 'landing.tools.tool_list.ttk.title',
		desc: 'landing.tools.tool_list.ttk.desc',
		link: '/calcs/ttk',
	},
	{
		id: 'dashboard',
		icon: 'lucide:grid-3x3',
		title: 'landing.tools.tool_list.dashboard.title',
		desc: 'landing.tools.tool_list.dashboard.desc',
		link: '/dashboard',
	},
	{
		id: 'map',
		icon: 'lucide:map',
		title: 'landing.tools.tool_list.map.title',
		desc: 'landing.tools.tool_list.map.desc',
		link: '/map',
	},
	{
		id: 'player_search',
		icon: 'lucide:user-round-search',
		title: 'landing.tools.tool_list.player_search.title',
		desc: 'landing.tools.tool_list.player_search.desc',
		link: '/player',
	},
]
