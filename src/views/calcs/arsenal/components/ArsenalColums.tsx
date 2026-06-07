import type { ColumnDef } from '@tanstack/react-table'
import type { Locale, Message } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import type { ArsenalRow } from './ArsenalCalc'

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
			accessorKey: 'neededCount',
			header: t('arsenal.table.neededCount'),
			enableSorting: true,
			cell: ({ getValue }) => {
				const count = getValue<number>()

				return (
					<span
						className={
							count > 0
								? 'font-mono text-blue-400'
								: 'font-mono text-neutral-500'
						}
					>
						{count > 0 ? `×${count}` : '-'}
					</span>
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
