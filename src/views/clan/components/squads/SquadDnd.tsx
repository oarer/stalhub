'use client'

import { createDnd } from '@/components/ui/Dnd'

export interface DragSource {
	squadId: number
	slot: number
	memberId: number
	name: string
}

export const {
	DndProvider: SquadDndProvider,
	useDnd,
	useDraggable,
	useDroppable,
} = createDnd<DragSource>()
