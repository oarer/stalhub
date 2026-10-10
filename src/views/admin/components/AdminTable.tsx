'use client'

import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'

export function AdminPagination({
	page,
	totalPages,
	onPageChange,
}: {
	page: number
	totalPages: number
	onPageChange: (page: number) => void
}) {
	if (totalPages <= 1) return null
	return (
		<div className="flex items-center justify-center gap-2">
			<Button
				disabled={page <= 1}
				onClick={() => onPageChange(page - 1)}
				size="sm"
				variant="outline"
			>
				<Icon icon="lucide:chevron-left" />
			</Button>
			<span className="text-neutral-400 text-sm">
				{page} / {totalPages}
			</span>
			<Button
				disabled={page >= totalPages}
				onClick={() => onPageChange(page + 1)}
				size="sm"
				variant="outline"
			>
				<Icon icon="lucide:chevron-right" />
			</Button>
		</div>
	)
}

export function AdminEmptyRow({
	colCount,
	message,
}: {
	colCount: number
	message: ReactNode
}) {
	return (
		<Table.Row>
			<Table.Cell>
				<span className="text-neutral-400 text-sm">{message}</span>
			</Table.Cell>
			{Array.from({ length: Math.max(colCount - 1, 0) }).map((_, i) => (
				<Table.Cell key={i} />
			))}
		</Table.Row>
	)
}

export function DeleteConfirmContent({
	title,
	description,
	cancelLabel,
	confirmLabel,
	onConfirm,
}: {
	title: ReactNode
	description?: ReactNode
	cancelLabel: ReactNode
	confirmLabel: ReactNode
	onConfirm: () => void
}) {
	return (
		<>
			<Modal.Header>
				<Modal.Title>{title}</Modal.Title>
				{description && (
					<Modal.Description>{description}</Modal.Description>
				)}
			</Modal.Header>
			<Modal.Footer>
				<Modal.Close>{cancelLabel}</Modal.Close>
				<Modal.Action closeOnClick onClick={onConfirm} variant="danger">
					{confirmLabel}
				</Modal.Action>
			</Modal.Footer>
		</>
	)
}
