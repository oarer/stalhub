'use client'

import { Icon } from '@iconify/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useRef, useState } from 'react'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'

export type PickerOption = {
	id: string
	name: string
	color?: string
}

type Props = {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	searchPlaceholder?: string
	emptyText?: string
	options: PickerOption[]
	selectedId?: string | null
	onSelect: (id: string) => void
}

export default function VirtualPickerModal({
	open,
	onOpenChange,
	title,
	searchPlaceholder = 'Поиск...',
	emptyText = 'Ничего не найдено.',
	options,
	selectedId,
	onSelect,
}: Props) {
	const [query, setQuery] = useState('')
	const parentRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (open) setQuery('')
	}, [open])

	const filtered = useMemo(() => {
		const needle = query.trim().toLowerCase()
		if (!needle) return options
		return options.filter((option) =>
			option.name.toLowerCase().includes(needle)
		)
	}, [options, query])

	const virtualizer = useVirtualizer({
		count: filtered.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 48,
		overscan: 8,
	})

	const handleSelect = (option: PickerOption) => {
		onSelect(option.id)
		onOpenChange(false)
	}

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content className="max-w-2xl" fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{title}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="space-y-3">
					<Input
						onChange={(
							event: React.ChangeEvent<HTMLInputElement>
						) => setQuery(event.target.value)}
						placeholder={searchPlaceholder}
						value={query}
					/>
					<div className="h-[60vh]">
						{filtered.length === 0 ? (
							<p className="flex h-full items-center justify-center text-muted-foreground text-sm">
								{emptyText}
							</p>
						) : (
							<div
								className="h-full overflow-auto"
								ref={parentRef}
							>
								<div
									className="relative w-full"
									style={{
										height: `${virtualizer.getTotalSize()}px`,
									}}
								>
									{virtualizer
										.getVirtualItems()
										.map((virtualRow) => {
											const option =
												filtered[virtualRow.index]
											const isSelected =
												option.id === selectedId
											return (
												<div
													data-index={
														virtualRow.index
													}
													key={
														option.id +
														virtualRow.index
													}
													ref={
														virtualizer.measureElement
													}
													style={{
														position: 'absolute',
														top: 0,
														left: 0,
														width: '100%',
														transform: `translateY(${virtualRow.start}px)`,
													}}
												>
													<button
														className={cn(
															'flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm transition-colors hover:bg-muted',
															isSelected &&
																'bg-primary text-primary-foreground hover:bg-primary'
														)}
														onClick={() =>
															handleSelect(option)
														}
														type="button"
													>
														{option.color && (
															<span
																className="h-4 w-4 shrink-0 rounded-full border border-border"
																style={{
																	backgroundColor:
																		option.color,
																}}
															/>
														)}
														<span className="min-w-0 flex-1 truncate">
															{option.name}
														</span>
														{isSelected && (
															<Icon
																className="shrink-0"
																icon="lucide:check"
															/>
														)}
													</button>
												</div>
											)
										})}
								</div>
							</div>
						)}
					</div>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
