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
				'resize-y rounded-lg border-2 border-primary/50 bg-card px-3 py-2 font-semibold text-sm outline-none transition-colors focus:border-primary',
				className
			)}
			ref={ref}
		/>
	)
}
