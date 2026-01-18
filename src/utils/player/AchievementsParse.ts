import type { Message } from '@/types/item.type'
import dbAchievementsJson from './achievements.json'
import type { DBAchievements } from '@/types/player.type'

const dbAchievements: DBAchievements[] = dbAchievementsJson.map((a) => ({
    id: a.id,
    title: a.title as Message,
    description: a.description as Message | undefined,
    points: a.points,
}))

export const ACHIEVEMENTS_MAP = dbAchievements.reduce(
    (acc, a) => {
        acc[a.id] = {
            title: a.title,
            description: a.description,
            point: a.points,
        }
        return acc
    },
    {} as Record<
        DBAchievements['id'],
        {
            title: Message
            description?: Message
            point: number
        }
    >
)

export type AchievementKey = keyof typeof ACHIEVEMENTS_MAP
