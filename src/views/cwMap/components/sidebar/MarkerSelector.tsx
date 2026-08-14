import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/Button'
import { MARKER_PRESETS } from '../../types'

interface MarkerSelectorProps {
	selectedPreset: string
	onSelect: (preset: string) => void
	onToolChange: (tool: 'marker') => void
}

export const MarkerSelector = ({
	selectedPreset,
	onSelect,
	onToolChange,
}: MarkerSelectorProps) => {
	return (
		<div className="grid grid-cols-3 gap-2">
			{MARKER_PRESETS.map((p) => {
				const isActive = selectedPreset === p.key

				return (
					<Button
						className={`w-fit rounded-lg p-1.5 ${isActive ? 'bg-accent' : ''}`}
						key={p.key}
						onClick={() => {
							onSelect(p.key)
							onToolChange('marker')
						}}
						size="sm"
						variant={'ghost'}
					>
						{p.image ? (
							<img
								alt={p.label ?? p.key}
								className="h-8 w-8 object-contain"
								src={p.image}
							/>
						) : (
							<Icon
								className="h-7 w-7"
								icon={p.icon}
								style={{ color: p.color }}
							/>
						)}
					</Button>
				)
			})}
		</div>
	)
}
