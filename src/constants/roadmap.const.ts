type Status = 'done' | 'in-progress' | 'planned'

export interface RoadmapItem {
	date: string
	title: string
	description?: string
	status: Status
}

export const RoadmapItems: RoadmapItem[] = [
	{
		date: '2025.08',
		title: 'roadmap.genesis.title',
		description: 'roadmap.genesis.description',
		status: 'done',
	},
	{
		date: '2026.02',
		title: 'roadmap.cbt.title',
		description: 'roadmap.cbt.description',
		status: 'done',
	},
	{
		date: '2026.06',
		title: 'roadmap.obt.title',
		description: 'roadmap.obt.description',
		status: 'done',
	},
	{
		date: '2026.08',
		title: 'roadmap.release.title',
		description: 'roadmap.release.description',
		status: 'done',
	},
]
