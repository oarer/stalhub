'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import Input from '@/components/ui/Input'
import { useTableSort } from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import { getLocale } from '@/lib/getLocale'
import { arsenalQueries } from '@/queries/calcs/arsenal.queries'
import {
	buildArsenalRows,
	calculateReputationCoverage,
} from './components/ArsenalCalc'
import { getArsenalColumns } from './components/ArsenalColums'
import { ArsenalShop } from './components/ArsenalShop'
import { ArsenalTable } from './components/ArsenalTable'

type ArsenalViewProps = {
	variant?: 'page' | 'widget'
}

export function ArsenalView({ variant = 'page' }: ArsenalViewProps) {
	const { data } = useSuspenseQuery(arsenalQueries.get())
	const [targetReputation, setTargetReputation] = useState(0)
	const [tab, setTab] = useState('calc')
	const t = useTranslations()

	const locale = getLocale()

	const tableData = useMemo(
		() => buildArsenalRows(data.items, targetReputation, locale),
		[data.items, targetReputation, locale]
	)

	const coverage = useMemo(
		() => calculateReputationCoverage(data.items, targetReputation),
		[data.items, targetReputation]
	)

	const columns = useMemo(() => getArsenalColumns(locale, t), [t, locale])

	const { table } = useTableSort(tableData, columns)

	return (
		<section
			className={
				variant === 'widget'
					? 'flex flex-col gap-4'
					: 'mx-auto max-w-7xl space-y-6 px-4 pt-42 pb-12 sm:px-6'
			}
		>
			<Tabs.Root onValueChange={setTab} value={tab}>
				{variant === 'page' ? (
					<div className="flex flex-wrap items-end justify-between gap-4">
						<div className="space-y-2">
							<h1
								className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
							>
								{t('arsenal.title')}
							</h1>
							<p className="font-medium text-muted-foreground text-sm">
								{t('arsenal.sub_title')}
							</p>
						</div>
						<Tabs.List className="w-fit">
							<Tabs.Trigger value="calc">
								{t('arsenal.tabs.calc')}
							</Tabs.Trigger>
							<Tabs.Trigger value="shop">
								{t('arsenal.tabs.shop')}
							</Tabs.Trigger>
						</Tabs.List>
					</div>
				) : (
					<Tabs.List className="w-fit">
						<Tabs.Trigger value="calc">
							{t('arsenal.tabs.calc')}
						</Tabs.Trigger>
						<Tabs.Trigger value="shop">
							{t('arsenal.tabs.shop')}
						</Tabs.Trigger>
					</Tabs.List>
				)}
				<Tabs.Content value="shop">
					<ArsenalShop
						onPickReputation={(rep) => {
							setTargetReputation(rep)
							setTab('calc')
						}}
					/>
				</Tabs.Content>
				<Tabs.Content value="calc">
					<div className="flex flex-col gap-4 pt-4">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<Input
								className="py-2.5 md:w-80"
								id="target-reputation"
								label="arsenal.input_label"
								min={0}
								onChange={(e) =>
									setTargetReputation(
										e.target.value === ''
											? 0
											: Number(e.target.value)
									)
								}
								type="number"
								value={targetReputation}
							/>

							<Alert.Root className="flex-1" variant="warning">
								<Alert.Description>
									{t('arsenal.alert')}
								</Alert.Description>
							</Alert.Root>
						</div>

						{targetReputation > 0 && (
							<Alert.Root variant="default">
								<Alert.Description>
									{coverage.remaining > 0 ? (
										<>
											{t('arsenal.summary.limited')}{' '}
											<span className="font-mono text-yellow-400">
												{coverage.limitedMaxRep.toLocaleString()}
											</span>{' '}
											{t('arsenal.summary.limitedEnd')}{' '}
											{t('arsenal.summary.rest')}{' '}
											<span className="font-mono text-blue-400">
												{coverage.remaining.toLocaleString()}
											</span>{' '}
											{t('arsenal.summary.restEnd')}{' '}
											{t('arsenal.summary.unlimited')}
										</>
									) : (
										<>
											{t('arsenal.summary.covered')}{' '}
											<span className="font-mono text-yellow-400">
												{coverage.limitedMaxRep.toLocaleString()}
											</span>{' '}
											{t('arsenal.summary.coveredEnd')}
										</>
									)}
								</Alert.Description>
							</Alert.Root>
						)}

						<ArsenalTable table={table} />
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</section>
	)
}
