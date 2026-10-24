'use client'

import { StatComparisonTable } from '@/components/ui/StatComparisonTable'
import type { ComparisonSection } from './comparisonStats'

type ComparisonColumn = {
	key: string
	name: string
}

type ComparisonTableProps = {
	sections: ComparisonSection[]
	items: ComparisonColumn[]
	onlyDifferences: boolean
}

export function ComparisonTable({
	sections,
	items,
	onlyDifferences,
}: ComparisonTableProps) {
	return (
		<StatComparisonTable
			columns={items}
			namespace="items.comparison"
			onlyDifferences={onlyDifferences}
			sections={sections}
		/>
	)
}
