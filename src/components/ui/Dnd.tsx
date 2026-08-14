'use client'

import {
	createContext,
	type DragEvent,
	type ReactNode,
	useContext,
	useState,
} from 'react'

const DATA_KEY = 'text/plain'

export function createDnd<T>() {
	const DndContext = createContext<{
		dragged: T | null
		startDrag: (item: T) => void
		endDrag: () => void
	} | null>(null)

	function DndProvider({ children }: { children: ReactNode }) {
		const [dragged, setDragged] = useState<T | null>(null)

		return (
			<DndContext.Provider
				value={{
					dragged,
					startDrag: setDragged,
					endDrag: () => setDragged(null),
				}}
			>
				{children}
			</DndContext.Provider>
		)
	}

	function useDnd() {
		const ctx = useContext(DndContext)
		if (!ctx) {
			throw new Error('useDnd must be used within a DndProvider')
		}
		return ctx
	}

	function useDraggable(
		item: T | null,
		options: { disabled?: boolean } = {}
	) {
		const { dragged, startDrag, endDrag } = useDnd()
		const disabled = options.disabled ?? item == null
		const isDragging =
			dragged != null &&
			item != null &&
			JSON.stringify(dragged) === JSON.stringify(item)

		return {
			isDragging,
			draggableProps: {
				draggable: !disabled,
				onDragStart: (e: DragEvent<HTMLElement>) => {
					if (disabled || item == null) return
					e.dataTransfer.setData(DATA_KEY, JSON.stringify(item))
					e.dataTransfer.effectAllowed = 'move'
					startDrag(item)
				},
				onDragEnd: () => endDrag(),
			},
		}
	}

	function useDroppable(options: {
		onDrop: (item: T) => void
		accepts?: (item: T) => boolean
		disabled?: boolean
	}) {
		const { dragged, endDrag } = useDnd()
		const [isOver, setIsOver] = useState(false)

		const handleDragOver = (e: DragEvent<HTMLElement>) => {
			if (options.disabled || dragged == null) return
			if (options.accepts && !options.accepts(dragged)) return
			e.preventDefault()
			e.dataTransfer.dropEffect = 'move'
			setIsOver(true)
		}

		const handleDrop = (e: DragEvent<HTMLElement>) => {
			if (options.disabled) return
			e.preventDefault()
			setIsOver(false)
			let item = dragged
			if (item == null) {
				const raw = e.dataTransfer.getData(DATA_KEY)
				if (!raw) return
				try {
					item = JSON.parse(raw) as T
				} catch (error) {
					void error
				}
			}
			if (item == null) return
			if (options.accepts && !options.accepts(item)) return
			endDrag()
			options.onDrop(item)
		}

		return {
			isOver,
			droppableProps: {
				onDragOver: handleDragOver,
				onDragLeave: () => setIsOver(false),
				onDrop: handleDrop,
			},
		}
	}

	return { DndProvider, useDnd, useDraggable, useDroppable }
}
