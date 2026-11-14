'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import AchievementBadge from '@/components/ui/user/AchievementBadge'
import { achievementQueries } from '@/queries/achievement/achievement.queries'

export default function UserAchievements({ userId }: { userId: number }) {
	const t = useTranslations()
	const { data: achievements } = useSuspenseQuery(
		achievementQueries.forUser(userId)
	)

	return (
		<section className="flex flex-col gap-3">
			<h2 className="font-semibold text-xl">
				{t('users.achievements.title')}
			</h2>
			{achievements.length > 0 ? (
				<div className="flex flex-wrap gap-2 rounded-lg bg-card p-3">
					{achievements.map(({ achievement, unlocked_at }) => (
						<AchievementBadge
							achievement={achievement}
							key={achievement.id}
							unlockedAt={unlocked_at}
						/>
					))}
				</div>
			) : (
				<p className="font-semibold text-foreground text-sm">
					{t('users.achievements.empty')}
				</p>
			)}
		</section>
	)
}
