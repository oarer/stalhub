import type { StatCategory } from '@/types/player.type'

export const CATEGORY_ORDER: StatCategory[] = [
	'SURVIVAL',
	'COMBAT',
	'EXPLORATION',
	'ECONOMY',
	'SESSION_MODES',
	'HIDEOUT',
	'NONE',
]

export const CATEGORY_ICONS: Record<StatCategory, string> = {
	SURVIVAL: 'lucide:heart-pulse',
	COMBAT: 'lucide:crosshair',
	EXPLORATION: 'lucide:map',
	ECONOMY: 'lucide:coins',
	SESSION_MODES: 'lucide:gamepad-2',
	HIDEOUT: 'lucide:warehouse',
	NONE: 'lucide:circle-help',
}
