import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { TABLE_MAX } from '@/constants/article-editor.const'
import { cn } from '@/lib/cn'

interface TableGridProps {
	onInsert: (rows: number, cols: number) => void
}

export function TableGrid({ onInsert }: TableGridProps) {
	const [hover, setHover] = useState<[number, number]>([0, 0])
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-3">
			<p
				className={`${montserrat.className} font-semibold text-sm text-text-accent`}
			>
				{hover[0] > 0 && hover[1] > 0
					? `${hover[0]} × ${hover[1]}`
					: t('me.articleEditor.chooseSize')}
			</p>
			<div className="flex flex-col gap-2">
				{Array.from({ length: TABLE_MAX }, (_, r) => (
					<div className="flex gap-2" key={r}>
						{Array.from({ length: TABLE_MAX }, (_, c) => (
							<button
								className={cn(
									'size-6 rounded-sm border transition-colors',
									r < hover[0] && c < hover[1]
										? 'border-accent bg-accent/30'
										: 'border-border-secondary hover:border-accent/50'
								)}
								key={c}
								onClick={() => onInsert(r + 1, c + 1)}
								onMouseEnter={() => setHover([r + 1, c + 1])}
								type="button"
							/>
						))}
					</div>
				))}
			</div>
		</div>
	)
}
