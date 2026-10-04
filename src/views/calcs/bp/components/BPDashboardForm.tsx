'use client'

import { useTranslations } from 'next-intl'
import { BP_TARGET_PRESETS, BP_TASK_PRESETS } from '../utils/bp'
import {
	Collapsible,
	DateField,
	FieldLabel,
	Segmented,
	Stepper,
	WeekdayPicker,
} from './bp-controls'
import type { BPFormState } from './bp-form-state'

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

interface Props {
	state: BPFormState
	onChange: (patch: Partial<BPFormState>) => void
	seasonWeeks: number
	todayISO: string
}

export function BPDashboardForm({ state, onChange, seasonWeeks, todayISO }: Props) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-5 rounded-xl border bg-card p-5">
			<div className="grid grid-cols-2 gap-3">
				<div className="flex flex-col gap-1.5">
					<FieldLabel>{t('bp.current_level')}</FieldLabel>
					<Stepper
						max={9999}
						min={0}
						onChange={(v) => onChange({ currentLevel: v })}
						value={state.currentLevel}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<FieldLabel>{t('bp.target_level')}</FieldLabel>
					<Stepper
						max={9999}
						min={1}
						onChange={(v) => onChange({ targetLevel: v })}
						value={state.targetLevel}
					/>
				</div>
			</div>

			<Segmented
				columns={3}
				onChange={(v) => onChange({ targetLevel: v })}
				options={BP_TARGET_PRESETS.map((v) => ({
					value: v,
					label: t('bp.target_preset', { count: v }),
				}))}
				value={
					BP_TARGET_PRESETS.includes(
						state.targetLevel as (typeof BP_TARGET_PRESETS)[number]
					)
						? state.targetLevel
						: -1
				}
			/>

			<div className="flex flex-col gap-1.5">
				<FieldLabel>{t('bp.deadline')}</FieldLabel>
				<DateField
					min={todayISO}
					onChange={(v) => onChange({ deadlineISO: v })}
					value={state.deadlineISO}
				/>
				<p className="text-muted-foreground text-xs">
					{t('bp.season_weeks', { count: seasonWeeks })}
				</p>
			</div>

			<div className="flex flex-col gap-2">
				<p className="font-semibold text-[15px]">{t('bp.play_title')}</p>
				<FieldLabel>{t('bp.max_tasks')}</FieldLabel>
				<Stepper
					max={300}
					min={1}
					onChange={(v) => onChange({ tasksPerDay: v })}
					value={state.tasksPerDay}
				/>
			</div>

			<Segmented
				columns={3}
				onChange={(v) => onChange({ tasksPerDay: v })}
				options={BP_TASK_PRESETS.map((v) => ({
					value: v,
					label: t(`bp.pace_${v}`),
					sub: t('bp.pace_tasks', { count: v }),
				}))}
				value={
					BP_TASK_PRESETS.includes(
						state.tasksPerDay as (typeof BP_TASK_PRESETS)[number]
					)
						? state.tasksPerDay
						: -1
				}
			/>

			<div className="flex flex-col gap-1.5">
				<FieldLabel>{t('bp.weekdays')}</FieldLabel>
				<WeekdayPicker
					labels={WEEKDAY_KEYS.map((k) => t(`bp.weekday_${k}`))}
					onChange={(v) => onChange({ weekdays: v })}
					value={state.weekdays}
				/>
			</div>

			<Collapsible sub={t('bp.boost_sub')} title={t('bp.boost_title')}>
				<div className="flex flex-col gap-1.5">
					<FieldLabel>{t('bp.overloads')}</FieldLabel>
					<Segmented
						columns={3}
						onChange={(v) => onChange({ overloadMode: v })}
						options={[
							{ value: 'off', label: t('bp.overload_off') },
							{ value: 'stock', label: t('bp.overload_stock') },
							{ value: 'full', label: t('bp.overload_full') },
						]}
						value={state.overloadMode}
					/>
				</div>

				{state.overloadMode === 'stock' && (
					<div className="flex flex-col gap-1.5">
						<FieldLabel>{t('bp.overload_stock_days')}</FieldLabel>
						<Stepper
							max={365}
							min={0}
							onChange={(v) => onChange({ overloadStock: v })}
							value={state.overloadStock}
						/>
					</div>
				)}

				<div className="flex flex-col gap-1.5">
					<FieldLabel>{t('bp.donations')}</FieldLabel>
					<Segmented
						columns={4}
						onChange={(v) => onChange({ donationPacks: v })}
						options={[0, 1, 2, 3].map((v) => ({
							value: v,
							label: v === 0 ? '0' : `+${v * 50}`,
						}))}
						value={state.donationPacks}
					/>
				</div>

				<button
					className="rounded-lg bg-muted px-3 py-2.5 font-semibold text-sm ring-1 ring-border transition-colors hover:bg-muted/70"
					onClick={() => onChange({ boostOn: !state.boostOn })}
					type="button"
				>
					{state.boostOn ? t('bp.bonus_on') : t('bp.bonus_off')}
				</button>

				{state.boostOn && (
					<>
						<div className="flex flex-col gap-1.5">
							<FieldLabel>{t('bp.bonus_start')}</FieldLabel>
							<DateField
								min={todayISO}
								onChange={(v) => onChange({ boostStartISO: v })}
								value={state.boostStartISO}
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<FieldLabel>{t('bp.bonus_days')}</FieldLabel>
							<Stepper
								max={90}
								min={0}
								onChange={(v) => onChange({ boostDays: v })}
								value={state.boostDays}
							/>
						</div>
					</>
				)}
			</Collapsible>
		</div>
	)
}
