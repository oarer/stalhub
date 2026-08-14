'use client'

import { Icon } from '@iconify/react'
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'

function TableRoot({ className, ...props }: React.ComponentProps<'table'>) {
	return (
		<div
			className="relative w-full overflow-x-auto"
			data-slot="table-container"
		>
			<table
				className={cn('w-full caption-bottom text-sm', className)}
				data-slot="table"
				{...props}
			/>
		</div>
	)
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
	return (
		<thead
			className={cn('[&_tr]:border-b', className)}
			data-slot="table-header"
			{...props}
		/>
	)
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
	return (
		<tbody
			className={cn('[&_tr:last-child]:border-0', className)}
			data-slot="table-body"
			{...props}
		/>
	)
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
	return (
		<tfoot
			className={cn(
				'border-border-secondary border-t bg-background/50 font-medium [&>tr]:last:border-b-0',
				className
			)}
			data-slot="table-footer"
			{...props}
		/>
	)
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
	return (
		<tr
			className={cn(
				'border-border-secondary border-b transition-colors hover:bg-background/50 data-[state=selected]:bg-background',
				className
			)}
			data-slot="table-row"
			{...props}
		/>
	)
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
	return (
		<th
			className={cn(
				'h-10 whitespace-nowrap border-border-secondary border-r px-2 text-left align-middle font-semibold last:border-r-0 [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
				className
			)}
			data-slot="table-head"
			{...props}
		/>
	)
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
	return (
		<td
			className={cn(
				'whitespace-nowrap border-border-secondary border-r p-2 align-middle last:border-r-0 [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
				className
			)}
			data-slot="table-cell"
			{...props}
		/>
	)
}

function TableCaption({
	className,
	...props
}: React.ComponentProps<'caption'>) {
	return (
		<caption
			className={cn('mt-4 text-sm', className)}
			data-slot="table-caption"
			{...props}
		/>
	)
}

function SortableHeader<TData>({
	column,
	className,
	children,
	...props
}: {
	column: ReturnType<ReturnType<typeof useReactTable<TData>>['getColumn']>
	children?: React.ReactNode
} & React.ComponentProps<'th'>) {
	if (!column || !column.getCanSort()) return null

	return (
		<th
			className={cn(
				'cursor-pointer select-none border-border-secondary border-r p-2 transition-colors duration-500 last:border-r-0 hover:bg-accent',
				className
			)}
			onClick={column.getToggleSortingHandler()}
			{...props}
		>
			<div className="flex items-center gap-1">
				{children}
				{{
					asc: <Icon className="h-4 w-4" icon="lucide:arrow-up" />,
					desc: <Icon className="h-4 w-4" icon="lucide:arrow-down" />,
				}[column.getIsSorted() as string] ?? (
					<Icon
						className="h-4 w-4 opacity-50"
						icon="lucide:chevrons-up-down"
					/>
				)}
			</div>
		</th>
	)
}

function useTableSort<TData>(
	data: TData[],
	columns: ColumnDef<TData>[],
	initialSorting?: SortingState
) {
	const [sorting, setSorting] = useState<SortingState>(initialSorting ?? [])

	const table = useReactTable({
		data,
		columns,
		state: useMemo(() => ({ sorting }), [sorting]),
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	return { table, sorting, setSorting }
}

export const Table = {
	Root: TableRoot,
	Header: TableHeader,
	Body: TableBody,
	Footer: TableFooter,
	Head: TableHead,
	Row: TableRow,
	Cell: TableCell,
	Caption: TableCaption,
	SortableHeader,
	flexRender,
}

export { flexRender, useTableSort }
export { ColumnDef }
