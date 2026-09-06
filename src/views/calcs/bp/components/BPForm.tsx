'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import Input from '@/components/ui/Input'
import type { BPInput } from '../utils/bp'
import { montserrat } from '@/app/fonts'

interface BPFormProps {
	values: BPInput
	daysLeft: number | null
	onChange: (patch: Partial<BPInput>) => void
	onDaysLeftChange: (value: number | null) => void
}

const levelInputs: {
	key: 'currentLevel' | 'targetLevel'
	label: string
	min: number
	max: number
}[] = [
	{
		key: 'currentLevel',
		label: 'bp.current_level',
		min: 0,
		max: 9999,
	},
	{
		key: 'targetLevel',
		label: 'bp.target_level',
		min: 1,
		max: 9999,
	},
]

const donationOptions = [0, 1, 2, 3] as const

export function BPForm({
	values,
	daysLeft,
	onChange,
	onDaysLeftChange,
}: BPFormProps) {
	const t = useTranslations()

	return (
		<Card.Root className="flex flex-col gap-4">
			<Card.Header>
				<Card.Title>
					<Icon
						className="text-neutral-700 text-xl dark:text-neutral-300"
						icon="lucide:sliders-horizontal"
					/>
					<h2>{t('bp.data')}</h2>
				</Card.Title>
			</Card.Header>

			<Card.Content className="flex flex-col gap-5">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{levelInputs.map(({ key, label, min, max }) => (
						<Input
							key={key}
							label={label}
							max={max}
							min={min}
							onChange={(e) =>
								onChange({
									[key]: Number(e.target.value),
								} as Partial<BPInput>)
							}
							type="number"
							value={values[key]}
						/>
					))}
				</div>

				<div className="flex flex-col gap-1.5">
					<Input
						label="bp.days_left"
						min={0}
						onChange={(e) =>
							onDaysLeftChange(
								e.target.value === ''
									? null
									: Number(e.target.value)
							)
						}
						type="number"
						value={daysLeft ?? ''}
					/>
					<p className="text-muted-foreground text-xs">
						{t('bp.season_end_hint')}
					</p>
				</div>

				<div className="flex flex-col gap-1.5">
					<Input
						label="bp.max_tasks"
						max={300}
						min={1}
						onChange={(e) =>
							onChange({
								maxTasksPerDay: Number(e.target.value),
							})
						}
						type="number"
						value={values.maxTasksPerDay}
					/>
					<p className="text-muted-foreground text-xs">
						{t('bp.max_tasks_hint')}
					</p>
				</div>

				<div className="flex flex-col gap-3">
					<CheckBox
						checked={values.overloads}
						description={t('bp.overloads_desc')}
						label={t('bp.overloads')}
						onCheckedChange={(checked) =>
							onChange({ overloads: checked })
						}
					/>
				</div>

				<div className="flex flex-col gap-3">
					<CheckBox
						checked={values.boost3d}
						description={t('bp.boost_3d_desc')}
						label={t('bp.boost_3d')}
						onCheckedChange={(checked) =>
							onChange({ boost3d: checked })
						}
					/>
				</div>

				<div className="flex flex-col gap-3">
					<p className={`${montserrat.className} font-semibold text-muted-foreground text-sm`}>
						{t('bp.donations')}
					</p>
					<div className="grid grid-cols-4 gap-2">
						{donationOptions.map((donations) => (
							<Button
								key={donations}
								onClick={() => onChange({ donations })}
								size="sm"
								type="button"
								variant={
									values.donations === donations
										? 'primary'
										: 'outline'
								}
							>
								<span className={`${montserrat.className} text-xs`}>{donations}</span>
							</Button>
						))}
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	)
}
