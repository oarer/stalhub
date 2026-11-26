import type { Ref, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({ className, ref, ...rest }: TextareaProps) {
	return (
		<textarea
			{...rest}
			className={cn(
				'border-primary/50 bg-card focus:border-primary resize-y rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors outline-none',
				className
			)}
			ref={ref}
		/>
	)
}
