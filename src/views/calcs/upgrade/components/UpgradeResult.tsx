'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat, unbounded } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import {
	armorUpgradeLevels,
	artefactUpgradeLevels,
} from '@/constants/upgrade.const'
import { cn } from '@/lib/cn'
import type { UpgradePriceEntry } from '@/types/upgrade.type'
import type { UpgradeResult } from '../utils/upgrade'

interface UpgradeResultProps {
	result: UpgradeResult
	prices: UpgradePriceEntry[]
	pricesUpdatedAt: string | null
}

const format = (value: number) => Math.round(value).toLocaleString('en-US')

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

function SummaryCard({
	icon,
	label,
	value,
	suffix,
}: {
	icon: string
	label: string
	value: string | number
	suffix?: string
}) {
	return (
		<Card.Root className="gap-3">
			<div className="flex items-center gap-2">
				<Icon className="text-lg text-neutral-400" icon={icon} />
				<p className="font-semibold text-muted-foreground text-sm">
					{label}
				</p>
			</div>
			<p
				className={`${unbounded.className} font-semibold text-primary text-xl`}
			>
				{value}
				{suffix && (
					<span className="ml-1 font-semibold text-muted-foreground text-sm">
						{suffix}
					</span>
				)}
			</p>
		</Card.Root>
	)
}

export function UpgradeResult({ result }: UpgradeResultProps) {
	const t = useTranslations()

	const isLuck = result.mode === 'luck'
	const isArtefact = result.target === 'artefact'

	const infinite = result.totalAttempts === Number.POSITIVE_INFINITY

	const levelStats = result.rows.map((row) => {
		const baseChance =
			result.target === 'armor'
				? armorUpgradeLevels[row.targetLevel].chance
				: artefactUpgradeLevels[row.targetLevel].chance
		return { row, baseChance }
	})

	return (
		<div className="flex flex-col gap-6">
			<div
				className={cn(
					'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
					!isArtefact && 'lg:grid-cols-2'
				)}
			>
				<SummaryCard
					icon="lucide:repeat-2"
					label={t('upgrade.result.attempts')}
					suffix={t('upgrade.result.attempts_suffix')}
					value={infinite ? '∞' : format(result.totalAttempts)}
				/>
				{isArtefact ? (
					<SummaryCard
						icon="lucide:zap"
						label={t('upgrade.result.energy')}
						suffix={t('upgrade.result.energy_suffix')}
						value={format(result.totalEnergy)}
					/>
				) : (
					<SummaryCard
						icon="lucide:wrench"
						label={t('upgrade.result.money')}
						suffix="₽"
						value={format(result.totalMoney)}
					/>
				)}
				{isArtefact && (
					<SummaryCard
						icon="lucide:coins"
						label={t('upgrade.result.money')}
						suffix="₽"
						value={format(result.totalMoney)}
					/>
				)}
				{!isArtefact && (
					<SummaryCard
						icon="lucide:package"
						label={t('upgrade.result.parts')}
						suffix={t('upgrade.result.parts_suffix')}
						value={format(result.totalParts)}
					/>
				)}
				{!isArtefact && (
					<SummaryCard
						icon="lucide:wrench"
						label={t('upgrade.result.tools')}
						suffix={t('upgrade.result.tools_suffix')}
						value={format(result.totalTools)}
					/>
				)}
			</div>

			<Card.Root className="flex flex-col gap-4">
				<Card.Header className="flex-row items-center justify-between">
					<Card.Title>
						<Icon
							className="text-neutral-700 text-xl dark:text-neutral-300"
							icon="lucide:table-properties"
						/>
						<h2>{t('upgrade.result.table.title')}</h2>
					</Card.Title>
					<Badge variant="secondary">
						<span
							className={`${unbounded.className} text-xs uppercase`}
						>
							{t(
								isLuck
									? 'upgrade.mode.luck'
									: 'upgrade.mode.guarantee'
							)}
						</span>
					</Badge>
				</Card.Header>

				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>
								{t('upgrade.result.table.level')}
							</Table.Head>
							<Table.Head>
								{t('upgrade.result.table.chance')}
							</Table.Head>
							<Table.Head>
								{t('upgrade.result.table.attempts')}
							</Table.Head>
							{isArtefact ? (
								<>
									<Table.Head className="text-right">
										{t(
											'upgrade.result.table.energy_attempt'
										)}
									</Table.Head>
									<Table.Head className="text-right">
										{t('upgrade.result.table.energy_level')}
									</Table.Head>
								</>
							) : (
								<>
									<Table.Head className="text-right">
										{t(
											'upgrade.result.table.per_attempt_cost'
										)}
									</Table.Head>
									<Table.Head className="text-right">
										{t('upgrade.result.table.level_cost')}
									</Table.Head>
								</>
							)}
							{!isArtefact && (
								<Table.Head className="text-right">
									{t('upgrade.result.table.parts')}
								</Table.Head>
							)}
							{!isArtefact && (
								<Table.Head className="text-right">
									{t('upgrade.result.table.tools')}
								</Table.Head>
							)}
							{isArtefact && (
								<Table.Head>
									{t('upgrade.result.table.durability')}
								</Table.Head>
							)}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{levelStats.map(({ row }) => (
							<Table.Row key={row.targetLevel}>
								<Table.Cell>
									<span
										className={`${montserrat.className} font-bold text-xs`}
									>
										{row.targetLevel}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span
										className={`${montserrat.className} font-semibold text-primary`}
									>
										{formatPercent(row.chance)}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span
										className={`${montserrat.className} font-semibold`}
									>
										{Number.isFinite(row.attempts)
											? format(row.attempts)
											: '∞'}
									</span>
								</Table.Cell>
								{isArtefact ? (
									<>
										<Table.Cell className="text-right">
											<span
												className={`${montserrat.className} font-semibold text-muted-foreground`}
											>
												{format(row.energyPerAttempt)}
											</span>
										</Table.Cell>
										<Table.Cell className="text-right">
											<span
												className={`${montserrat.className} font-semibold text-primary`}
											>
												{format(row.levelEnergy)}
											</span>
										</Table.Cell>
									</>
								) : (
									<>
										<Table.Cell className="text-right">
											<span
												className={`${montserrat.className} font-semibold text-muted-foreground`}
											>
												{format(row.costPerAttempt)}
											</span>
										</Table.Cell>
										<Table.Cell className="text-right">
											<span
												className={`${montserrat.className} font-semibold text-primary`}
											>
												{format(row.levelCost)}
											</span>
										</Table.Cell>
									</>
								)}
								{!isArtefact && (
									<Table.Cell className="text-right">
										<span
											className={`${montserrat.className} font-semibold text-muted-foreground`}
										>
											{t(`upgrade.items.${row.partsKey}`)}
										</span>
										<span
											className={`${montserrat.className} ml-1 font-semibold text-primary`}
										>
											×{format(row.levelParts)}
										</span>
									</Table.Cell>
								)}
								{!isArtefact && (
									<Table.Cell className="text-right">
										<span
											className={`${montserrat.className} font-semibold text-muted-foreground`}
										>
											{t(`upgrade.items.${row.toolsKey}`)}
										</span>
										<span
											className={`${montserrat.className} ml-1 font-semibold text-primary`}
										>
											×{format(row.levelTools)}
										</span>
									</Table.Cell>
								)}
								{isArtefact &&
									row.durabilityAfter !== undefined && (
										<Table.Cell>
											<span
												className={cn(
													montserrat.className,
													'font-semibold',
													row.durabilityAfter <= 0.2
														? 'text-destructive'
														: 'text-muted-foreground'
												)}
											>
												{formatPercent(
													row.durabilityAfter
												)}
											</span>
										</Table.Cell>
									)}
							</Table.Row>
						))}
					</Table.Body>
					{!infinite && (
						<Table.Footer>
							<Table.Row>
								<Table.Cell colSpan={2}>
									<span
										className={`${montserrat.className} font-semibold`}
									>
										{t('upgrade.result.table.total')}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span
										className={`${montserrat.className} font-semibold text-primary`}
									>
										{format(result.totalAttempts)}
									</span>
								</Table.Cell>
								{isArtefact && (
									<>
										<Table.Cell />
										<Table.Cell className="text-right">
											<span
												className={`${montserrat.className} font-semibold text-primary`}
											>
												{format(result.totalEnergy)}
											</span>
										</Table.Cell>
									</>
								)}
								{!isArtefact && (
									<>
										<Table.Cell />
										<Table.Cell className="text-right">
											<span
												className={`${montserrat.className} font-semibold text-primary`}
											>
												{format(result.totalMoney)}
											</span>
										</Table.Cell>
									</>
								)}
								{!isArtefact && (
									<Table.Cell className="text-right">
										<span
											className={`${montserrat.className} font-semibold text-primary`}
										>
											{format(result.totalParts)}
										</span>
									</Table.Cell>
								)}
								{!isArtefact && (
									<Table.Cell className="text-right">
										<span
											className={`${montserrat.className} font-semibold text-primary`}
										>
											{format(result.totalTools)}
										</span>
									</Table.Cell>
								)}
								{isArtefact && <Table.Cell />}
							</Table.Row>
						</Table.Footer>
					)}
				</Table.Root>
			</Card.Root>
		</div>
	)
}
