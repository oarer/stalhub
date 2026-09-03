'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function Choice({
	title,
	value,
	options,
	onChange,
}: {
	title: string
	value: string
	options: [string, string][]
	onChange: (value: string) => void
}) {
	return (
		<Card.Root>
			<Card.Header>
				<Card.Title>{title}</Card.Title>
			</Card.Header>
			<Card.Content className="flex flex-wrap gap-2">
				{options.map(([id, label]) => (
					<Button
						className="w-full"
						key={id}
						onClick={() => onChange(id)}
						variant={value === id ? 'primary' : 'secondary'}
					>
						{label}
					</Button>
				))}
			</Card.Content>
		</Card.Root>
	)
}
