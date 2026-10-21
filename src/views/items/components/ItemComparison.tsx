'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { Item } from '@/types/item.type'
import { clampSharpening, toComparisonParam } from './itemComparisonUtils'

type ItemComparisonProps = {
	item: Item
	initialSharpening?: number
}

export function ItemComparison({
	item,
	initialSharpening = 0,
}: ItemComparisonProps) {
	const t = useTranslations()
	const params = new URLSearchParams()
	params.append(
		'items',
		toComparisonParam({ category: item.category, id: item.id })
	)
	const sharpening = clampSharpening(initialSharpening)

	if (sharpening > 0) params.set('sharpening', String(sharpening))

	return (
		<Link
			className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
			href={`/items/compare?${params.toString()}`}
		>
			<Icon className="mr-2 text-lg" icon="lucide:git-compare-arrows" />
			{t('items.comparison.button')}
		</Link>
	)
}
