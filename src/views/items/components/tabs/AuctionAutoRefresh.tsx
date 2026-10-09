'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import { Switch } from '@/components/ui/Switch'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'

export const AUCTION_AUTO_REFRESH_MIN_SEC = 10
export const AUCTION_AUTO_REFRESH_MAX_SEC = 300

export function clampAutoRefreshInterval(sec: number): number {
	if (!Number.isFinite(sec)) return 30
	return Math.min(
		AUCTION_AUTO_REFRESH_MAX_SEC,
		Math.max(AUCTION_AUTO_REFRESH_MIN_SEC, Math.round(sec))
	)
}

const PRESETS = [15, 30, 60, 120, 300]

type Props = {
	enabled: boolean
	onEnabledChange: (enabled: boolean) => void
	intervalSec: number
	onIntervalChange: (sec: number) => void
	onRefresh: () => void
	isFetching?: boolean
	lastUpdatedAt?: number
}

export default function AuctionAutoRefresh({
	enabled,
	onEnabledChange,
	intervalSec,
	onIntervalChange,
	onRefresh,
	isFetching = false,
	lastUpdatedAt,
}: Props) {
	const t = useTranslations()
	const clamped = clampAutoRefreshInterval(intervalSec)
	const [secondsLeft, setSecondsLeft] = useState(clamped)

	useEffect(() => {
		setSecondsLeft(clamped)
	}, [clamped])

	useEffect(() => {
		if (!enabled || isFetching || secondsLeft <= 0) return
		const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
		return () => clearTimeout(timer)
	}, [enabled, isFetching, secondsLeft])

	const secShort = t('items.auction.secondsShort')
	const minShort = t('items.auction.minutesShort')

	const intervalOptions = useMemo(() => {
		const values = PRESETS.includes(clamped)
			? PRESETS
			: [...PRESETS, clamped].sort((a, b) => a - b)
		return values.map((v) => ({
			value: String(v),
			label: v < 60 ? `${v} ${secShort}` : `${v / 60} ${minShort}`,
		}))
	}, [clamped, secShort, minShort])

	return (
		<Card.Root>
			<Card.Content className="flex">
				<div className="flex min-w-0 flex-1 items-center gap-2">
					<Switch
						checked={enabled}
						onCheckedChange={onEnabledChange}
					/>
					<span className="truncate">
						{t('items.auction.autoRefresh')}
					</span>
				</div>

				<div className="flex items-center gap-2 sm:ms-auto">
					<span
						className={cn(
							'hidden whitespace-nowrap font-mono font-semibold text-muted-foreground text-xs tabular-nums md:inline',
							!lastUpdatedAt && 'invisible'
						)}
					>
						{t('items.auction.lastUpdate', {
							time: formatDate(lastUpdatedAt, 'time'),
						})}
					</span>
					<Combobox
						className="min-w-0 flex-1 sm:w-36 sm:flex-none"
						disabled={!enabled}
						onValueChange={(v) =>
							onIntervalChange(
								clampAutoRefreshInterval(Number(v))
							)
						}
						options={intervalOptions}
						translateOptions={false}
						value={String(clamped)}
					/>
					<Tooltip.Root className="shrink-0" position="top">
						<Tooltip.Trigger asChild>
							<Button
								aria-label={t('items.auction.refreshNow')}
								className="size-9 shrink-0 px-0"
								loading={isFetching}
								onClick={onRefresh}
								variant="outline"
							>
								{!isFetching && (
									<Icon
										className="text-base"
										icon="lucide:refresh-cw"
									/>
								)}
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content>
							{t('items.auction.refreshNow')}
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
			</Card.Content>
		</Card.Root>
	)
}
