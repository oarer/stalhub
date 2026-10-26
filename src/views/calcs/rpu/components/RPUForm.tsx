'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { FI_MAX, FI_MIN } from '../utils/rpu'

interface RPUFormProps {
	hours: number
	kd: number
	fi: number
	donate: number
	result: string
	onHoursChange: (value: number) => void
	onKdChange: (value: number) => void
	onFiChange: (value: number) => void
	onDonateChange: (value: number) => void
}

export function RPUForm({
	hours,
	kd,
	fi,
	donate,
	result,
	onHoursChange,
	onKdChange,
	onFiChange,
	onDonateChange,
}: RPUFormProps) {
	const t = useTranslations()

	return (
		<Card.Root>
			<Card.Content className="flex flex-col gap-4 md:flex-row">
				<div className="grid w-full grid-cols-1 flex-col gap-3 sm:grid-cols-2">
					<Input
						label="rpu.hours"
						min={0}
						onChange={(e) =>
							onHoursChange(Number(e.target.value) || 0)
						}
						type="number"
						value={hours}
					/>
					<Input
						label="rpu.kd"
						min={0}
						onChange={(e) =>
							onKdChange(Number(e.target.value) || 0)
						}
						step={0.01}
						type="number"
						value={kd}
					/>
					<Input
						label="rpu.fi"
						max={FI_MAX}
						min={FI_MIN}
						onChange={(e) =>
							onFiChange(Number(e.target.value) || 0)
						}
						step={1}
						type="number"
						value={fi}
					/>
					<Input
						label="rpu.donate"
						min={0}
						onChange={(e) =>
							onDonateChange(Number(e.target.value) || 0)
						}
						type="number"
						value={donate}
					/>
				</div>

				<div className="flex w-full flex-col gap-2">
					<span
						className={`font-medium text-[12px] text-foreground uppercase tracking-widest`}
					>
						{t('rpu.result')}
					</span>
					<div className="relative flex justify-between rounded-lg border-2 border-primary/50 bg-card px-2.5 py-3 pt-3">
						<p className="font-medium font-mono text-lg">
							{result}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	)
}
