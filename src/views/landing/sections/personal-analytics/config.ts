export type PersonalFeatureId = 'tracking' | 'dynamics' | 'stages' | 'sharing'

export const PERSONAL_FEATURES = [
	{ id: 'tracking', icon: 'lucide:history' },
	{ id: 'dynamics', icon: 'lucide:chart-line' },
	{ id: 'stages', icon: 'lucide:swords' },
	{ id: 'sharing', icon: 'lucide:share-2' },
] as const satisfies ReadonlyArray<{ id: PersonalFeatureId; icon: string }>

export type PersonalStageId = 'link' | 'snapshot' | 'dynamics'

export const PERSONAL_STAGES = [
	{ id: 'link', icon: 'lucide:link' },
	{ id: 'snapshot', icon: 'lucide:camera' },
	{ id: 'dynamics', icon: 'lucide:trending-up' },
] as const satisfies ReadonlyArray<{ id: PersonalStageId; icon: string }>

export type PersonalDemoStat = {
	id: string
	value: string
	delta: string
	positive: boolean
}

export const PERSONAL_DEMO_STATS: PersonalDemoStat[] = [
	{ id: 'kills', value: '1 284', delta: '+36', positive: true },
	{ id: 'kd', value: '1.42', delta: '+0.05', positive: true },
	{ id: 'accuracy', value: '79.6%', delta: '-1.2 п.п.', positive: false },
	{ id: 'hours', value: '2100 ч', delta: '+9 ч', positive: true },
]

export const PERSONAL_DEMO_SERIES = [
	0.32, 0.36, 0.34, 0.42, 0.4, 0.48, 0.46, 0.55, 0.61, 0.58, 0.68, 0.74, 0.8,
	1.1,
] as const
