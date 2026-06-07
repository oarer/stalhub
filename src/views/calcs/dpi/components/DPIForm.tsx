'use client'

import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import type { ComboboxOption } from '@/components/ui/Combobox'
import { Combobox } from '@/components/ui/Combobox'
import { CopyButton } from '@/components/ui/CopyButton'
import Input from '@/components/ui/Input'
import { getYaw } from '../utils/conversion'
import { games } from '../utils/dpi.const'

interface DPIFormProps {
	sens: number
	fromGame: string
	toGame: string
	result: number
	onSensChange: (value: number) => void
	onFromGameChange: (value: string) => void
	onToGameChange: (value: string) => void
}

export function DPIForm({
	sens,
	fromGame,
	toGame,
	onSensChange,
	onFromGameChange,
	onToGameChange,
	result,
}: DPIFormProps) {
	const t = useTranslations()

	const gameOptions: ComboboxOption[] = games.map((g) => ({
		value: g.slug,
		label: g.name,
		disabled: getYaw(g) === null,
	}))

	return (
		<Card.Root>
			<Card.Content className="flex flex-col gap-3 md:flex-row">
				<div className="flex w-full flex-col gap-2">
					<span
						className={`${montserrat.className} font-bold text-[12px] text-text-accent uppercase tracking-widest`}
					>
						{t('dpi.from_game')}
					</span>
					<Combobox
						className="border-border-secondary"
						onValueChange={onFromGameChange}
						options={gameOptions}
						placeholder="dpi.pick_game"
						value={fromGame}
					/>
					<Input
						className={`${montserrat.className} py-3`}
						label="dpi.sens"
						min={0}
						onChange={(e) =>
							onSensChange(Number(e.target.value) || 0)
						}
						step={0.1}
						type="number"
						value={sens}
					/>
				</div>

				<div className="flex w-full flex-col gap-2">
					<span
						className={`${montserrat.className} font-bold text-[12px] text-text-accent uppercase tracking-widest`}
					>
						{t('dpi.to_game')}
					</span>
					<Combobox
						className="border-border-secondary"
						onValueChange={onToGameChange}
						options={gameOptions}
						placeholder="dpi.pick_game"
						value={toGame}
					/>
					<div className="relative flex justify-between rounded-lg border-2 border-border-secondary bg-background px-2.5 py-3 pt-3">
						<span className="absolute inset-s-1 top-2 z-10 origin-left -translate-y-2.5 scale-75 transform px-2 font-bold text-neutral-400 text-sm">
							{t('dpi.result')}
						</span>
						<p className={`${montserrat.className} text-sm`}>
							{result}
						</p>
						<CopyButton
							className="absolute top-2.5 right-2"
							size={'md'}
							text={result}
							variant={'ghost'}
						/>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	)
}
