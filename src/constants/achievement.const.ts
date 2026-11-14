import type { AchievementRarity } from '@/types/achievement.type'

export const ACHIEVEMENT_RARITIES: AchievementRarity[] = [
	'COMMON',
	'RARE',
	'EPIC',
	'LEGENDARY',
]

export const ACHIEVEMENT_RARITY_COLORS: Record<AchievementRarity, string> = {
	COMMON: '#6b7280',
	RARE: '#3b82f6',
	EPIC: '#a855f7',
	LEGENDARY: 'var(--primary)',
}
