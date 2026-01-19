import { Badge } from '@/components/ui/Badge'
import { getLocale } from '@/lib/getLocale'
import { messageToString } from '@/utils/itemUtils'
import { ACHIEVEMENTS_MAP } from '@/utils/player/AchievementsParse'
import type { Achievements } from '@/types/player.type'

export default function AchievementsView({ data }: { data: Achievements[] }) {
	const locale = getLocale()
	return (
		<div className="flex flex-col gap-2">
			{data.map((ach) => {
				const achievement = ACHIEVEMENTS_MAP[ach]

				if (!achievement) return null

				return (
					<div className="flex gap-2" key={ach}>
						<Badge className="flex min-w-9 items-center justify-center self-center p-2 text-sm text-sky-200 dark:bg-sky-700/70">
							{achievement.point}
						</Badge>

						<div className="flex flex-col gap-2">
							<p className="text-sky-200">
								{messageToString(achievement.title, locale)}
							</p>
							<p className="text-sm">
								{messageToString(
									achievement.description,
									locale
								)}
							</p>
						</div>
					</div>
				)
			})}
		</div>
	)
}
