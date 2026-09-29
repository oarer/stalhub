export const LOG_PROCESSING = 3600
export const LOG_PAUSE = 3000
export const VISIBLE_ROWS = 5
export const DOTS = 3
export const FLOW_DURATION = 8
export const LEAD = 0.055

export const INITIAL_SHOT = 100

export type ClanFeatureId = 'ai' | 'analytics' | 'bot' | 'grenades'

export const CLAN_FEATURES = [
	{ id: 'ai', icon: 'lucide:sparkles' },
	{ id: 'analytics', icon: 'lucide:chart-no-axes-column' },
	{ id: 'bot', icon: 'lucide:bot' },
	{ id: 'grenades', icon: 'lucide:scan-search' },
] as const satisfies ReadonlyArray<{ id: ClanFeatureId; icon: string }>

export type ClanStageId = 'upload' | 'analyze' | 'cabinet'

export const CLAN_STAGES = [
	{ id: 'upload', icon: 'lucide:image-up' },
	{ id: 'analyze', icon: 'lucide:sparkles' },
	{ id: 'cabinet', icon: 'lucide:layout-dashboard' },
] as const satisfies ReadonlyArray<{ id: ClanStageId; icon: string }>

export type LogStatus = 'processing' | 'done'

export type LogEntry = {
	shot: number
	time: string
	status: LogStatus
	players: number
}
