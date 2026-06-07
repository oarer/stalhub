'use client'

import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import type { ArsenalRow } from './ArsenalCalc'

type Props = {
	table: TanstackTable<ArsenalRow>
}

export function ArsenalTable({ table }: Props) {
	return (
		<Card.Root>
			<Table.Root className="w-full font-semibold">
				<Table.Header>
					{table.getHeaderGroups().map((headerGroup) => (
						<Table.Row
							className="text-left text-neutral-400 text-xs"
							key={headerGroup.id}
						>
							{headerGroup.headers.map((header) =>
								header.column.getCanSort() ? (
									<Table.SortableHeader
										className="pr-4 pb-2"
										column={header.column}
										key={header.id}
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									</Table.SortableHeader>
								) : (
									<Table.Head
										className="pr-4 pb-2"
										key={header.id}
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									</Table.Head>
								)
							)}
						</Table.Row>
					))}
				</Table.Header>

				<Table.Body>
					{table.getRowModel().rows.map((row) => (
						<Table.Row className="last:border-0" key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<Table.Cell className="py-2 pr-4" key={cell.id}>
									{flexRender(
										cell.column.columnDef.cell,
										cell.getContext()
									)}
								</Table.Cell>
							))}
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</Card.Root>
	)
}
