'use client'

import { Icon } from '@iconify/react'
import type { Ref } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

interface CommentFormProps {
	value: string
	onChange: (value: string) => void
	onSubmit: () => void
	isPending: boolean
	placeholder: string
	inputRef?: Ref<HTMLTextAreaElement>
}

export function CommentForm({
	value,
	onChange,
	onSubmit,
	isPending,
	placeholder,
	inputRef,
}: CommentFormProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<Textarea
					className="min-h-10 flex-1 resize-none"
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && (e.ctrlKey || e.metaKey))
							onSubmit()
					}}
					placeholder={placeholder}
					ref={inputRef}
					rows={2}
					value={value}
				/>
				<Button
					disabled={!value.trim() || isPending}
					loading={isPending}
					onClick={onSubmit}
					size="lg"
				>
					<Icon className="text-xl" icon="lucide:send" />
				</Button>
			</div>
		</div>
	)
}
