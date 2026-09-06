'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import Input from '@/components/ui/Input'

export interface SessionFormValues {
	currentLevel: number
	currentPoints: number
	targetLevel: number
	hoursPerDay: number
	queueMin: number
	avgDamagePerKill: number
	includeCaptures: boolean
	maxKillsPerMatch: number
	spartakBoost: number
}

interface SessionFormProps {
	values: SessionFormValues
	onChange: (patch: Partial<SessionFormValues>) => void
}

const levelInputs: {
	key: 'currentLevel' | 'currentPoints' | 'targetLevel'
	label: string
	min: number
	max: number
}[] = [
	{
		key: 'currentLevel',
		label: 'sessions.current_level',
		min: 0,
		max: 9999,
	},
	{
		key: 'currentPoints',
		label: 'sessions.current_points',
		min: 0,
		max: 9999,
	},
	{
		key: 'targetLevel',
		label: 'sessions.target_level',
		min: 1,
		max: 9999,
	},
]

const dailyInputs: {
	key: 'hoursPerDay' | 'queueMin'
	label: string
	min: number
	max: number
	step?: number
}[] = [
	{
		key: 'hoursPerDay',
		label: 'sessions.hours_per_day',
		min: 0.5,
		max: 24,
		step: 0.5,
	},
	{ key: 'queueMin', label: 'sessions.queue_min', min: 0, max: 60 },
]

const group = (icon: string, title: string, children: React.ReactNode) => (
	<div className="flex flex-col gap-3">
		<p className="flex items-center gap-2 font-semibold text-muted-foreground text-sm">
			<Icon className="text-lg" icon={icon} />
			{title}
		</p>
		{children}
	</div>
)

export function SessionForm({ values, onChange }: SessionFormProps) {
	const t = useTranslations()

	return (
		<Card.Root className="flex flex-col gap-4">
			<Card.Header>
				<Card.Title>
					<Icon
						className="text-neutral-700 text-xl dark:text-neutral-300"
						icon="lucide:sliders-horizontal"
					/>
					<h2>{t('sessions.data')}</h2>
				</Card.Title>
			</Card.Header>

			<Card.Content className="flex flex-col gap-5">
				{group(
					'lucide:trophy',
					t('sessions.progress'),
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
									} as Partial<SessionFormValues>)
								}
								type="number"
								value={values[key]}
							/>
						))}
					</div>
				)}

				{group(
					'lucide:clock',
					t('sessions.time'),
					<>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{dailyInputs.map(
								({ key, label, min, max, step }) => (
									<Input
										key={key}
										label={label}
										max={max}
										min={min}
										onChange={(e) =>
											onChange({
												[key]: Number(e.target.value),
											} as Partial<SessionFormValues>)
										}
										step={step}
										type="number"
										value={values[key]}
									/>
								)
							)}
							<Input
								label="sessions.avg_damage"
								min={0}
								onChange={(e) =>
									onChange({
										avgDamagePerKill: Number(
											e.target.value
										),
									})
								}
								step={10}
								type="number"
								value={values.avgDamagePerKill}
							/>
							<Input
								label="sessions.max_kills"
								min={0}
								onChange={(e) =>
									onChange({
										maxKillsPerMatch: Number(
											e.target.value
										),
									})
								}
								step={1}
								type="number"
								value={values.maxKillsPerMatch}
							/>
						</div>
						<p className="text-muted-foreground text-xs">
							{t('sessions.max_kills_hint')}
						</p>
					</>
				)}

				<div className="flex flex-col gap-3">
					<p className="flex items-center gap-2 font-semibold text-muted-foreground text-sm">
						<Icon className="text-lg" icon="lucide:timer-reset" />
						{t('sessions.spartak_brawl')}
					</p>
					<div className="grid grid-cols-3 gap-2">
						{([0, 0.5, 1] as const).map((boost) => (
							<Button
								key={boost}
								onClick={() =>
									onChange({ spartakBoost: boost })
								}
								size="sm"
								type="button"
								variant={
									values.spartakBoost === boost
										? 'primary'
										: 'outline'
								}
							>
								<p
									className={`${montserrat.className} font-semibold text-xs`}
								>
									{boost === 0
										? t('sessions.boost_off')
										: `+${Math.round(boost * 100)}%`}
								</p>
							</Button>
						))}
					</div>
					<p className="text-muted-foreground text-xs">
						{t('sessions.spartak_brawl_desc')}
					</p>
				</div>

				<div className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-2.5">
					<CheckBox
						checked={values.includeCaptures}
						label={t('sessions.include_captures')}
						onCheckedChange={(checked) =>
							onChange({ includeCaptures: checked })
						}
					/>
				</div>
				<Alert.Root>
					<Alert.Description className="text-xs">
						{t('sessions.auto_match_hint')}
					</Alert.Description>
				</Alert.Root>
			</Card.Content>
		</Card.Root>
	)
}
