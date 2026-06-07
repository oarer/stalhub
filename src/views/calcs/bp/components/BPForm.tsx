'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'

interface BPFormProps {
	days: number
	playDays: number
	tasks: number
	overloads: number
	currentLevel: number
	onDaysChange: (value: number) => void
	onPlayDaysChange: (value: number) => void
	onTasksChange: (value: number) => void
	onOverloadsChange: (value: number) => void
	onCurrentLevelChange: (value: number) => void
}

export function BPForm({
	days,
	playDays,
	tasks,
	overloads,
	currentLevel,
	onDaysChange,
	onPlayDaysChange,
	onTasksChange,
	onOverloadsChange,
	onCurrentLevelChange,
}: BPFormProps) {
	const t = useTranslations()

	return (
		<Card.Root className="flex flex-col gap-4">
			<Card.Header>
				<Card.Title>
					<Icon
						className="text-neutral-700 text-xl dark:text-neutral-300"
						icon="lucide:braces"
					/>
					<h2>{t('bp.data')}</h2>
				</Card.Title>
			</Card.Header>
			<Card.Content className="flex flex-col gap-4">
				<Input
					label="bp.total_days"
					max={91}
					min={1}
					onChange={(e) => onDaysChange(Number(e.target.value))}
					type="number"
					value={days}
				/>

				<Input
					label="bp.play_days"
					max={7}
					min={1}
					onChange={(e) => onPlayDaysChange(Number(e.target.value))}
					type="number"
					value={playDays}
				/>

				<Input
					label="bp.task_day"
					min={0}
					onChange={(e) => onTasksChange(Number(e.target.value))}
					type="number"
					value={tasks}
				/>

				<Input
					label="bp.overloads"
					max={15}
					min={0}
					onChange={(e) => onOverloadsChange(Number(e.target.value))}
					type="number"
					value={overloads}
				/>

				<Input
					label="bp.current_level"
					min={0}
					onChange={(e) =>
						onCurrentLevelChange(Number(e.target.value))
					}
					type="number"
					value={currentLevel}
				/>
			</Card.Content>
		</Card.Root>
	)
}
