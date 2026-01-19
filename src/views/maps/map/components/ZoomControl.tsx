import { useEffect, useState } from 'react'

import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'

import { Icon } from '@iconify/react'
import L from 'leaflet'

export default function ZoomControl() {
	const map = useMap()
	const [container, setContainer] = useState<HTMLDivElement | null>(null)

	useEffect(() => {
		const div = L.DomUtil.create('div')
		const control = L.Control.extend({
			onAdd: () => div,
		})
		const customControl = new control({ position: 'topright' })
		map.addControl(customControl)
		setContainer(div)

		const parent = div.parentElement
		if (parent) {
			parent.style.top = '10px'
			parent.style.right = '10px'
		}

		return () => {
			map.removeControl(customControl)
		}
	}, [map])

	if (!container) return null

	return createPortal(
		<div className="flex flex-col gap-2">
			<button
				className="cursor-pointer rounded-xl bg-neutral-300/60 p-3 transition-colors duration-400 hover:bg-neutral-300/30 active:opacity-50 dark:bg-neutral-900/70 hover:dark:bg-neutral-700/50"
				onClick={() => map.zoomIn()}
			>
				<Icon height={20} icon="mdi:plus" width={20} />
			</button>
			<button
				className="cursor-pointer rounded-xl bg-neutral-300/60 p-3 transition-colors duration-400 hover:bg-neutral-300/30 active:opacity-50 dark:bg-neutral-900/70 hover:dark:bg-neutral-700/50"
				onClick={() => map.zoomOut()}
			>
				<Icon height={20} icon="mdi:minus" width={20} />
			</button>
		</div>,
		container
	)
}
