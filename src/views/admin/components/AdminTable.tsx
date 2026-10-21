'use client'

import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
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

export function AdminTableHeader({
	columns,
}: {
	columns: { key: string; label: ReactNode }[]
}) {
	return (
		<Table.Header>
			<Table.Row>
				<Table.Head>ID</Table.Head>
				{columns.map(({ key, label }) => (
					<Table.Head key={key}>{label}</Table.Head>
				))}
				<Table.Head />
			</Table.Row>
		</Table.Header>
	)
}

export function AdminCreateEntityCard({
	title,
	name,
	description,
	onNameChange,
	onDescriptionChange,
	submitLabel,
	disabled,
	loading,
	onSubmit,
}: {
	title: ReactNode
	name: string
	description: string
	onNameChange: (value: string) => void
	onDescriptionChange: (value: string) => void
	submitLabel: ReactNode
	disabled: boolean
	loading: boolean
	onSubmit: () => void
}) {
	return (
		<Card.Root>
			<Card.Header>
				<Card.Title>
					<Icon icon="lucide:plus" />
					{title}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div className="flex flex-col items-stretch gap-3 md:flex-row md:items-end">
					<div className="flex-1">
						<Input
							label="admin.permissions.name"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => onNameChange(e.target.value)}
							value={name}
						/>
					</div>
					<div className="flex-1">
						<Input
							label="admin.permissions.description"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => onDescriptionChange(e.target.value)}
							value={description}
						/>
					</div>
					<Button
						disabled={disabled}
						loading={loading}
						onClick={onSubmit}
					>
						{submitLabel}
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	)
}

export function AdminNameDescriptionEditModal({
	open,
	onOpenChange,
	title,
	name,
	description,
	onNameChange,
	onDescriptionChange,
	cancelLabel,
	saveLabel,
	onSave,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: ReactNode
	name: string
	description: string
	onNameChange: (value: string) => void
	onDescriptionChange: (value: string) => void
	cancelLabel: ReactNode
	saveLabel: ReactNode
	onSave: () => void
}) {
	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{title}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-4">
						<Input
							label="admin.permissions.name"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => onNameChange(e.target.value)}
							value={name}
						/>
						<Input
							label="admin.permissions.description"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => onDescriptionChange(e.target.value)}
							value={description}
						/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{cancelLabel}</Modal.Close>
					<Modal.Action closeOnClick onClick={onSave}>
						{saveLabel}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
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

export function AdminDeleteModal({
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
		<Modal.Root>
			<Modal.Trigger variant="ghost">
				<Icon className="text-red-400" icon="lucide:trash-2" />
			</Modal.Trigger>
			<Modal.Content fullScreen={false}>
				<DeleteConfirmContent
					cancelLabel={cancelLabel}
					confirmLabel={confirmLabel}
					description={description}
					onConfirm={onConfirm}
					title={title}
				/>
			</Modal.Content>
		</Modal.Root>
	)
}
