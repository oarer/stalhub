'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type { AbsenceEventType } from '@/types/clan/clan.type'
import { EVENT_OPTIONS } from './absence.const'

interface AbsenceFormProps {
	date: string
	minDate: string
	selected: Record<string, boolean>
	stageSel: Record<string, number[]>
	note: string
	hasAbsence: boolean
	isSaving: boolean
	isRemoving: boolean
	onDateChange: (date: string) => void
	onToggleEvent: (value: AbsenceEventType) => void
	onToggleStage: (value: AbsenceEventType, stage: number) => void
	onNoteChange: (note: string) => void
	onSave: () => void
	onRemove: () => void
}

export function AbsenceForm({
	date,
	minDate,
	selected,
	stageSel,
	note,
	hasAbsence,
	isSaving,
	isRemoving,
	onDateChange,
	onToggleEvent,
	onToggleStage,
	onNoteChange,
	onSave,
	onRemove,
}: AbsenceFormProps) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-2 rounded-xl bg-card px-5 py-4">
			<p className="font-semibold">{t('clan.absence.myAbsence')}</p>
			<div className="flex flex-col gap-3">
				<Input
					className={`${montserrat.className} text-[15px]`}
					min={minDate}
					onChange={(e) => onDateChange(e.target.value)}
					type="date"
					value={date}
				/>
				<div className="flex flex-col gap-2">
					{EVENT_OPTIONS.map((opt) => (
						<Button
							className={cn(
								'flex flex-col items-start justify-start gap-2 p-3',
								selected[opt.value] && 'bg-primary/40'
							)}
							key={opt.value}
							onClick={() => onToggleEvent(opt.value)}
							variant={'secondary'}
						>
							<div className="flex items-center gap-2">
								<Icon
									className={`text-lg ${selected[opt.value] ? 'text-primary' : 'text-muted-foreground'}`}
									icon={
										selected[opt.value]
											? 'lucide:check-square'
											: 'lucide:square'
									}
								/>
								<span className="font-semibold text-sm">
									{t(opt.label)}
								</span>
							</div>
							{selected[opt.value] && opt.maxStages > 0 && (
								<div className="mt-2 flex flex-wrap gap-1.5 pl-6">
									{Array.from(
										{ length: opt.maxStages },
										(_, i) => i + 1
									).map((stage) => {
										const active = (
											stageSel[opt.value] ?? []
										).includes(stage)
										return (
											<Button
												className={cn(
													montserrat.className,
													'rounded-full px-3 py-1 font-semibold text-xs',
													active &&
														'bg-primary/20 text-primary'
												)}
												key={stage}
												onClick={(e) => {
													e.stopPropagation()
													onToggleStage(
														opt.value,
														stage
													)
												}}
												variant={'secondary'}
											>
												{t('clan.absence.stage', {
													stage,
												})}
											</Button>
										)
									})}
								</div>
							)}
						</Button>
					))}
				</div>
				<Input
					label="clan.absence.notePlaceholder"
					onChange={(e) => onNoteChange(e.target.value)}
					value={note}
				/>
				<div className="flex gap-2">
					<Button
						className="gap-2"
						loading={isSaving}
						onClick={onSave}
					>
						<Icon className="text-lg" icon="lucide:save" />
						{t('clan.common.save')}
					</Button>
					{hasAbsence && (
						<Button
							className="gap-2 ring-0"
							disabled={isRemoving}
							onClick={onRemove}
							variant={'danger'}
						>
							<Icon className="text-lg" icon="lucide:trash-2" />
							{t('clan.common.delete')}
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
