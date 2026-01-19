import { type RefObject, useEffect } from 'react'

export default function useClickOutside(
	ref: RefObject<HTMLElement | null>,
	handleClickOutside: (event: MouseEvent | TouchEvent) => void,
	ignoreRef?: RefObject<HTMLElement | null>
) {
	useEffect(() => {
		const listener = (event: MouseEvent | TouchEvent) => {
			const target = event.target as Node

			if (
				(ref.current && ref.current.contains(target)) ||
				(ignoreRef?.current && ignoreRef.current.contains(target))
			) {
				return
			}

			handleClickOutside(event)
		}

		document.addEventListener('mousedown', listener)
		document.addEventListener('touchstart', listener)
		return () => {
			document.removeEventListener('mousedown', listener)
			document.removeEventListener('touchstart', listener)
		}
	}, [ref, handleClickOutside, ignoreRef])
}
