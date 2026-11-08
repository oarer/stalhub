import { Badge } from '@/components/ui/Badge'
import { formatGridDate } from './grid-detail.utils'

export function DateBadge({ date }: { date: string | null }) {
	const formatted = formatGridDate(date)
	if (!formatted) return null
	return (
		<div className="flex justify-center">
			<Badge className="px-3 py-1" variant="secondary">
				{formatted}
			</Badge>
		</div>
	)
}
