'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import Input from '@/components/ui/Input'
import Slider from '@/components/ui/Slider'
import { BP_TARGET_PRESETS, BP_TASK_PRESETS } from '../utils/bp'
import type { BPFormState } from './bp-form-state'

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

interface Props {
	state: BPFormState
	onChange: (patch: Partial<BPFormState>) => void
	seasonWeeks: number
	todayISO: string
}

function Group({
	icon,
	title,
	children,
}: {
	icon: string
	title: string
	children: React.ReactNode
}) {
	return (
		<div className="flex flex-col gap-3">
			<p className="flex items-center gap-2 font-semibold text-muted-foreground text-sm">
				<Icon className="text-lg" icon={icon} />
				{title}
			</p>
			{children}
		</div>
	)
}

export function BPDashboardForm({
	state,
	onChange,
	seasonWeeks,
	todayISO,
}: Props) {
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
				<Group
					icon="lucide:trophy"
					title={t('bp.goal', { level: state.targetLevel })}
				>
					<div className="grid grid-cols-2 gap-4">
						<Input
							label="bp.current_level"
							max={9999}
							min={0}
							onChange={(e) =>
								onChange({
									currentLevel: Number(e.target.value) || 0,
								})
							}
							type="number"
							value={state.currentLevel}
						/>
						<Input
							label="bp.target_level"
							max={9999}
							min={1}
							onChange={(e) =>
								onChange({
									targetLevel: Number(e.target.value) || 0,
								})
							}
							type="number"
							value={state.targetLevel}
						/>
					</div>
					<div className="grid grid-cols-3 gap-2">
						{BP_TARGET_PRESETS.map((preset) => (
							<Button
								key={preset}
								onClick={() =>
									onChange({ targetLevel: preset })
								}
								size="sm"
								type="button"
								variant={
									state.targetLevel === preset
										? 'primary'
										: 'secondary'
								}
							>
								<span className="font-mono font-semibold text-xs">
									{t('bp.target_preset', {
										count: preset,
									})}
								</span>
							</Button>
						))}
					</div>
				</Group>

				<Group icon="lucide:calendar" title={t('bp.deadline')}>
					<Input
						className="text-[13px]"
						min={todayISO}
						onChange={(e) =>
							e.target.value &&
							onChange({ deadlineISO: e.target.value })
						}
						type="date"
						value={state.deadlineISO}
					/>
					<p className="text-muted-foreground text-xs">
						{t('bp.season_weeks', { count: seasonWeeks })}
					</p>
				</Group>

				<Group icon="lucide:gamepad-2" title={t('bp.max_tasks')}>
					<Input
						label="bp.tasks_per_day"
						max={300}
						min={1}
						onChange={(e) =>
							onChange({
								tasksPerDay: Number(e.target.value) || 0,
							})
						}
						type="number"
						value={state.tasksPerDay}
					/>
					<Slider
						max={50}
						min={1}
						onValueChange={(v) => onChange({ tasksPerDay: v })}
						step={1}
						value={Math.max(
							1,
							Math.min(50, state.tasksPerDay || 1)
						)}
					/>
					<div className="grid grid-cols-3 gap-2">
						{BP_TASK_PRESETS.map((preset) => (
							<Button
								className="flex-col gap-0.5 py-2"
								key={preset}
								onClick={() =>
									onChange({ tasksPerDay: preset })
								}
								size="sm"
								type="button"
								variant={
									state.tasksPerDay === preset
										? 'primary'
										: 'secondary'
								}
							>
								<span className="font-semibold text-xs">
									{t(`bp.pace_${preset}`)}
								</span>
								<span className="font-mono font-semibold text-[11px] opacity-70">
									{t('bp.pace_tasks', { count: preset })}
								</span>
							</Button>
						))}
					</div>
					<p className="text-muted-foreground text-xs">
						{t('bp.max_tasks_hint')}
					</p>
				</Group>

				<Group icon="lucide:calendar-days" title={t('bp.weekdays')}>
					<div className="grid grid-cols-7 gap-1.5">
						{WEEKDAY_KEYS.map((key, i) => {
							const active = state.weekdays[i]
							return (
								<Button
									className="px-1"
									key={key}
									onClick={() => {
										const next = [...state.weekdays]
										next[i] = !next[i]
										onChange({ weekdays: next })
									}}
									size="sm"
									type="button"
									variant={active ? 'primary' : 'secondary'}
								>
									<span className="font-mono font-semibold text-xs">
										{t(`bp.weekday_${key}`)}
									</span>
								</Button>
							)
						})}
					</div>
				</Group>

				<Accordion
					defaultExpandedKeys={['boost']}
					items={[
						{
							key: 'boost',
							title: t('bp.boost_title'),
							icon: 'lucide:rocket',
							content: (
								<div className="flex flex-col gap-4 px-2">
									<p className="-mt-1 text-muted-foreground text-xs">
										{t('bp.boost_sub')}
									</p>
									<div className="flex flex-col gap-2">
										<p className="font-semibold text-muted-foreground text-sm">
											{t('bp.overloads')}
										</p>
										<div className="grid grid-cols-3 gap-2">
											{(
												[
													'off',
													'stock',
													'full',
												] as const
											).map((mode) => (
												<Button
													key={mode}
													onClick={() =>
														onChange({
															overloadMode: mode,
														})
													}
													size="sm"
													type="button"
													variant={
														state.overloadMode ===
														mode
															? 'primary'
															: 'secondary'
													}
												>
													<span className="font-semibold text-xs">
														{t(
															`bp.overload_${mode}`
														)}
													</span>
												</Button>
											))}
										</div>
										<p className="text-muted-foreground text-xs">
											{t('bp.overloads_desc')}
										</p>
										{state.overloadMode === 'stock' && (
											<Input
												label="bp.overload_stock_days"
												max={365}
												min={0}
												onChange={(e) =>
													onChange({
														overloadStock:
															Number(
																e.target.value
															) || 0,
													})
												}
												type="number"
												value={state.overloadStock}
											/>
										)}
									</div>

									<div className="flex flex-col gap-2">
										<p className="font-semibold text-muted-foreground text-sm">
											{t('bp.donations')}
										</p>
										<div className="grid grid-cols-4 gap-2">
											{[0, 1, 2, 3].map((packs) => (
												<Button
													key={packs}
													onClick={() =>
														onChange({
															donationPacks:
																packs,
														})
													}
													size="sm"
													type="button"
													variant={
														state.donationPacks ===
														packs
															? 'primary'
															: 'secondary'
													}
												>
													<span className="font-mono font-semibold text-xs">
														{packs === 0
															? '0'
															: `+${packs * 50}`}
													</span>
												</Button>
											))}
										</div>
									</div>

									<div className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-2.5">
										<CheckBox
											checked={state.boostOn}
											description={t('bp.boost_3d_desc')}
											label={t('bp.boost_3d')}
											onCheckedChange={(checked) =>
												onChange({ boostOn: checked })
											}
										/>
									</div>

									{state.boostOn && (
										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<Input
												label="bp.bonus_start"
												min={todayISO}
												onChange={(e) =>
													e.target.value &&
													onChange({
														boostStartISO:
															e.target.value,
													})
												}
												type="date"
												value={state.boostStartISO}
											/>
											<Input
												label="bp.bonus_days"
												max={90}
												min={0}
												onChange={(e) =>
													onChange({
														boostDays:
															Number(
																e.target.value
															) || 0,
													})
												}
												type="number"
												value={state.boostDays}
											/>
										</div>
									)}
								</div>
							),
						},
					]}
					selectionMode="multiple"
					size={'sm'}
				/>
			</Card.Content>
		</Card.Root>
	)
}
