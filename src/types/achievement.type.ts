export type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

export interface Achievement {
	id: number
	slug: string
	title: string
	description: string
	icon: string
	rarity: AchievementRarity
	hidden: boolean
}

export interface UserAchievement {
	id: number
	achievement_id: number
	unlocked_at: string
	achievement: Achievement
}

export interface AdminAchievement extends Achievement {
	_count?: { users: number }
}

export interface AdminCreateAchievement {
	slug: string
	title: string
	description?: string
	icon?: string
	rarity?: AchievementRarity
	hidden?: boolean
}

export interface AdminUpdateAchievement {
	slug?: string
	title?: string
	description?: string
	icon?: string
	rarity?: AchievementRarity
	hidden?: boolean
}
