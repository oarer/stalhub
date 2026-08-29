import { createDnd } from '@/components/ui/Dnd'
import type { TierRank } from '@/types/tier-list.type'

export type DndItem = { item_id: string; rank: TierRank; position: number }

const dnd = createDnd<DndItem>()

export const TierDndProvider = dnd.DndProvider
export const useTierDraggable = dnd.useDraggable
export const useTierDroppable = dnd.useDroppable
