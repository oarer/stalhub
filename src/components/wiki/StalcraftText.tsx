'use client'

import { cn } from '@/lib/cn'
import { parseStalcraftText } from '@/lib/stalcraft-text'

export function StalcraftText({
	text,
	className,
}: {
	text: string
	className?: string
}) {
	const lines = parseStalcraftText(text)
	return (
		<span className={cn('whitespace-pre-wrap break-words', className)}>
			{lines.map((segs, li) => (
				<span key={li}>
					{segs.map((s, si) => (
						<span key={si} style={{ color: s.color }}>
							{s.text}
						</span>
					))}
					{li < lines.length - 1 && <br />}
				</span>
			))}
		</span>
	)
}
