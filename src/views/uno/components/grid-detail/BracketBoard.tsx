'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { UnoGridGroup } from '@/types/uno/uno.type'
import { FallbackRanking } from './FallbackRanking'
import { buildBracket } from './grid-detail.utils'
import { MatchCard } from './MatchCard'
import { ResultCard } from './ResultCard'
import { StageHeader } from './StageHeader'

function ColumnHeader({ children }: { children: React.ReactNode }) {
	return (
		<div className="border-border-secondary/80 border-b px-3 py-3 text-center text-muted-foreground text-xs">
			{children}
		</div>
	)
}

function Column({
	header,
	children,
}: {
	header: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<div className="min-w-0 border-border-secondary/80 border-t first:border-t-0 lg:border-t-0 lg:border-l lg:first:border-l-0">
			<ColumnHeader>{header}</ColumnHeader>
			<div className="space-y-4 p-4">{children}</div>
		</div>
	)
}

export function BracketBoard({ group }: { group: UnoGridGroup }) {
	const t = useTranslations('uno')
	const { stages, result } = useMemo(() => buildBracket(group), [group])
	const [hoveredClanId, setHoveredClanId] = useState<string | null>(null)
	const [hoveredCardKey, setHoveredCardKey] = useState<string | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const [lines, setLines] = useState<
		Array<{ x1: number; y1: number; x2: number; y2: number }>
	>([])

	const pathKeys = useMemo(() => {
		const keys = new Set<string>()
		if (!hoveredClanId) return keys

		for (const stage of stages) {
			for (const view of stage.matches) {
				if (
					view.match.clans.some((clan) => clan.id === hoveredClanId)
				) {
					keys.add(`${stage.number}-${view.match.number}`)
				}
			}
		}

		const resultEntry = result.find((entry) =>
			entry.clans.some((clan) => clan.id === hoveredClanId)
		)
		if (resultEntry) keys.add(`result-${resultEntry.key}`)

		return keys
	}, [hoveredClanId, stages, result])

	useEffect(() => {
		const container = containerRef.current
		if (!hoveredClanId || !container || pathKeys.size === 0) {
			setLines([])
			return
		}

		const update = () => {
			const containerRect = container.getBoundingClientRect()
			const points = [...pathKeys]
				.map((key) => {
					const element = container.querySelector<HTMLElement>(
						`[data-card-key="${key}"]`
					)
					if (!element) return null
					const cardRect = element.getBoundingClientRect()
					const row =
						element.querySelector<HTMLElement>(
							`[data-clan-id="${hoveredClanId}"]`
						) ?? element
					const rowRect = row.getBoundingClientRect()
					return {
						left: cardRect.left - containerRect.left,
						right: cardRect.right - containerRect.left,
						centerY:
							rowRect.top -
							containerRect.top +
							rowRect.height / 2,
					}
				})
				.filter(
					(
						point
					): point is {
						left: number
						right: number
						centerY: number
					} => point !== null
				)

			const nextLines: Array<{
				x1: number
				y1: number
				x2: number
				y2: number
			}> = []
			for (let index = 0; index < points.length - 1; index += 1) {
				const from = points[index]
				const to = points[index + 1]
				nextLines.push({
					x1: from.right,
					y1: from.centerY,
					x2: to.left,
					y2: to.centerY,
				})
			}
			setLines(nextLines)
		}

		update()
		window.addEventListener('resize', update)
		return () => window.removeEventListener('resize', update)
	}, [hoveredClanId, pathKeys])

	if (stages.length === 0) return <FallbackRanking clans={group.clans} />

	return (
		<div className="relative" ref={containerRef}>
			<svg
				className="pointer-events-none absolute inset-0 z-0 h-full w-full"
				data-bracket-lines
			>
				{lines.map((line, index) => (
					<path
						className="text-primary"
						d={`M ${line.x1} ${line.y1} C ${line.x1 + 24} ${line.y1}, ${line.x2 - 24} ${line.y2}, ${line.x2} ${line.y2}`}
						fill="none"
						key={`${line.x1}-${line.y1}-${line.x2}-${line.y2}-${index}`}
						stroke="currentColor"
						strokeLinecap="round"
						strokeWidth={2}
					/>
				))}
			</svg>
			<div className="grid grid-cols-1 lg:grid-cols-4">
				{stages.map((stage, index) => (
					<Column
						header={
							<StageHeader
								index={index}
								matches={stage.matches}
							/>
						}
						key={stage.number}
					>
						{stage.matches.map((view) => {
							const key = `${stage.number}-${view.match.number}`
							return (
								<MatchCard
									cardKey={key}
									dimmed={
										hoveredClanId !== null
											? !pathKeys.has(key)
											: hoveredCardKey !== null &&
												hoveredCardKey !== key
									}
									highlighted={
										hoveredClanId !== null &&
										pathKeys.has(key)
									}
									key={key}
									onHoverCard={setHoveredCardKey}
									onHoverClan={setHoveredClanId}
									onLeaveClan={() => setHoveredClanId(null)}
									view={view}
								/>
							)
						})}
					</Column>
				))}
				<Column header={t('grids.detail.result')}>
					{result.map((entry, index) => {
						const key = `result-${entry.key}`
						return (
							<ResultCard
								accent={index === 0}
								cardKey={key}
								dimmed={
									hoveredClanId !== null
										? !pathKeys.has(key)
										: hoveredCardKey !== null &&
											hoveredCardKey !== key
								}
								group={entry}
								highlighted={
									hoveredClanId !== null && pathKeys.has(key)
								}
								key={entry.key}
								onHoverCard={setHoveredCardKey}
								onHoverClan={setHoveredClanId}
								onLeaveClan={() => setHoveredClanId(null)}
							/>
						)
					})}
				</Column>
			</div>
		</div>
	)
}
