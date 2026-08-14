'use client'

import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/Button'

export function Pagination({
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
