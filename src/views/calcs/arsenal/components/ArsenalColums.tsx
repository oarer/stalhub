import type { ColumnDef } from '@/components/ui/Table'
import type { Locale, Message } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import type { ArsenalRow } from './ArsenalCalc'

function getDaysLabel(days: number, t: (key: string) => string) {
	const mod10 = days % 10
	const mod100 = days % 100

	if (mod10 === 1 && mod100 !== 11)
		return `${days} ${t('arsenal.table.days.one')}`
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
		return `${days} ${t('arsenal.table.days.few')}`
	return `${days} ${t('arsenal.table.days.many')}`
}

export function getArsenalColumns(
	locale: Locale,
	t: (key: string) => string
): ColumnDef<ArsenalRow>[] {
	return [
		{
			accessorKey: 'name',
			header: t('arsenal.table.item'),
			cell: ({ getValue }) => {
				const value = getValue<Message>()

				return (
					<span className="font-semibold">
						{messageToString(value, locale)}
					</span>
				)
			},
		},
		{
			accessorKey: 'drop',
			header: t('arsenal.table.drop.title'),
			cell: ({ getValue }) =>
				!getValue<boolean>() ? (
					<span className="text-green-400 text-xs">
						{t('arsenal.table.drop.false')}
					</span>
				) : (
					<span className="text-red-400 text-xs">
						{t('arsenal.table.drop.true')}
					</span>
				),
		},
		{
			accessorKey: 'reputation',
			header: t('arsenal.table.reputation'),
			cell: ({ getValue }) => (
				<span className="font-mono">
					{getValue<number>().toLocaleString()}
				</span>
			),
		},
		{
			accessorKey: 'weight',
			header: t('arsenal.table.weight'),
			cell: ({ getValue }) => (
				<span className="font-mono text-text-accent">
					{getValue<number>().toLocaleString()}
				</span>
			),
		},
		{
			accessorKey: 'currentPrice',
			header: t('arsenal.table.currentPrice'),
			cell: ({ getValue }) => (
				<span className="font-mono text-yellow-400">
					{getValue<number>().toLocaleString()} ₽
				</span>
			),
		},
		{
			accessorKey: 'limit',
			header: t('arsenal.table.limit'),
			cell: ({ getValue }) => {
				const limit = getValue<number | undefined>()

				return limit && limit > 0 ? (
					<span className="font-mono text-amber-400">×{limit}</span>
				) : (
					<span className="font-mono text-neutral-500">∞</span>
				)
			},
		},
		{
			accessorKey: 'neededCount',
			header: t('arsenal.table.neededCount'),
			enableSorting: true,
			cell: ({ getValue, row }) => {
				const count = getValue<number>()

				if (count <= 0) {
					return (
						<span className="font-mono text-neutral-500">-</span>
					)
				}

				if (!row.original.limitExceeded) {
					return <span className="font-mono text-blue-400">×{count}</span>
				}

				return (
					<div className="flex flex-col gap-0.5">
						<span className="font-mono text-blue-400">
							×{row.original.limit}
						</span>
						<span className="text-amber-400 text-xs">
							{t('arsenal.table.maxPerDay')} ·{' '}
							{getDaysLabel(row.original.days, t)}
						</span>
					</div>
				)
			},
		},
		{
			accessorKey: 'totalWeight',
			header: t('arsenal.table.totalWeight'),
			enableSorting: true,
			cell: ({ getValue }) => {
				const total = getValue<number>()
				return (
					<span className="font-mono text-text-accent">
						{total > 0 ? total.toLocaleString() : '-'}
					</span>
				)
			},
		},
		{
			accessorKey: 'totalPrice',
			header: t('arsenal.table.totalPrice'),
			enableSorting: true,
			cell: ({ getValue }) => {
				const total = getValue<number>()
				return (
					<span
						className={
							total > 0
								? 'font-mono text-yellow-400'
								: 'font-mono text-neutral-500'
						}
					>
						{total > 0 ? `${total.toLocaleString()} ₽` : '-'}
					</span>
				)
			},
		},
	]
}
