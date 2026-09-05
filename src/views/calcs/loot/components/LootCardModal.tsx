'use client'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { CatalogTablePayload } from '@/types/loot.type'
import { LootTable } from './LootTable'
import { pickName } from './utils'

interface LootCardModalProps {
	name: string
	payload: CatalogTablePayload
}

export function LootCardModal({ name, payload }: LootCardModalProps) {
	const title = pickName(payload.title) || name

	return (
		<Modal.Root>
			<Modal.Trigger asChild>
				<Button
					className="flex flex-col items-start text-start"
					variant={'secondary'}
				>
					<span className="max-w-70 truncate font-semibold text-sm">
						{title}
					</span>
					{title !== name && (
						<span className="opacity/60 truncate text-xs">
							{name}
						</span>
					)}
				</Button>
			</Modal.Trigger>
			<Modal.Content align="top" className="max-w-3xl" fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{title}</Modal.Title>
					{title !== name && (
						<Modal.Description className="font-semibold">
							{name}
						</Modal.Description>
					)}
				</Modal.Header>
				<Modal.Body>
					<LootTable payload={payload} />
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}

export type { CatalogTablePayload }
