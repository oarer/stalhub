import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { MAPS } from '../../types'

interface MapSelectorProps {
	selectedMapKey: string
	onSelect: (key: string) => void
}

export function MapSelector({ selectedMapKey, onSelect }: MapSelectorProps) {
	const t = useTranslations()

	return (
		<div className="grid grid-cols-2 gap-1">
			{MAPS.map((m) => (
				<Button
					className={cn('py-1')}
					key={m.key}
					onClick={() => onSelect(m.key)}
					variant={selectedMapKey === m.key ? 'outline' : 'secondary'}
				>
					{t(m.nameKey)}
				</Button>
			))}
		</div>
	)
}
