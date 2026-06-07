'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import {
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import Input from '@/components/ui/Input'
import { getLocale } from '@/lib/getLocale'
import { arsenalQueries } from '@/queries/calcs/arsenal.queries'
import { buildArsenalRows } from './components/ArsenalCalc'
import { getArsenalColumns } from './components/ArsenalColums'
import { ArsenalTable } from './components/ArsenalTable'

export function ArsenalView() {
	const { data } = useSuspenseQuery(arsenalQueries.get())
	const [targetReputation, setTargetReputation] = useState(0)
	const [sorting, setSorting] = useState<SortingState>([])
	const t = useTranslations()

	const locale = getLocale()

	const tableData = useMemo(
		() => buildArsenalRows(data.items, targetReputation, locale),
		[data.items, targetReputation, locale]
	)

	const columns = useMemo(() => getArsenalColumns(locale, t), [t, locale])

	const table = useReactTable({
		data: tableData,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	return (
		<section className="mx-auto max-w-7xl space-y-6 px-4 pt-42 pb-12 sm:px-6">
			<div className="text-center">
				<h1
					className={`${unbounded.className} mb-2 font-semibold text-2xl tracking-tight md:text-3xl xl:text-4xl`}
				>
					{t('arsenal.title')}
				</h1>
				<p className="font-semibold text-sm text-text-accent">
					{t('arsenal.sub_title')}
				</p>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<Input
					className="py-2.5 md:w-80"
					id="target-reputation"
					label="arsenal.input_label"
					min={0}
					onChange={(e) =>
						setTargetReputation(
							e.target.value === '' ? 0 : Number(e.target.value)
						)
					}
					type="number"
					value={targetReputation}
				/>

				<Alert.Root className="flex-1" variant="warning">
					<Alert.Description>{t('arsenal.alert')}</Alert.Description>
				</Alert.Root>
			</div>

			<ArsenalTable table={table} />
		</section>
	)
}
