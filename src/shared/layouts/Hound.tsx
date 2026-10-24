'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { useUwuStore } from '@/stores/useUwu.store'

const MEOW_SOUNDS = [
	'/public/sounds/hound/meow_1.mp3',
	'/public/sounds/hound/meow_2.mp3',
] as const

export default function Hound() {
	const { uwuMode } = useUwuStore()
	const [meowing, setMeowing] = useState(false)
	const imageRef = useRef<HTMLDivElement>(null)
	const meowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const audioPoolRef = useRef<HTMLAudioElement[]>([])

	if (!uwuMode) return null

	const playMeow = () => {
		try {
			let pool = audioPoolRef.current

			if (!pool.length) {
				pool = audioPoolRef.current = MEOW_SOUNDS.map((src) => {
					const audio = new Audio(src)
					audio.preload = 'auto'
					return audio
				})
			}

			const meow = pool[Math.floor(Math.random() * pool.length)]
			meow.currentTime = 0
			void meow.play()
		} catch {
			// ignore
		}
	}

	const handleClick = () => {
		if (meowing) return

		setMeowing(true)
		playMeow()

		imageRef.current?.animate(
			[
				{ transform: 'translateY(0)' },
				{ transform: 'translateY(-14px)', offset: 0.2 },
				{ transform: 'translateY(0)', offset: 0.45 },
				{ transform: 'translateY(-6px)', offset: 0.65 },
				{ transform: 'translateY(0)' },
			],
			{ duration: 1000, easing: 'ease-out' }
		)

		if (meowTimeoutRef.current) clearTimeout(meowTimeoutRef.current)
		meowTimeoutRef.current = setTimeout(() => setMeowing(false), 1000)
	}

	// THX https://t.me/sin_kovshika за арты
	return (
		<button
			className="fixed right-5 bottom-5 z-50 cursor-pointer border-0 bg-transparent p-0"
			onClick={handleClick}
			type="button"
		>
			<div className="will-change-transform" ref={imageRef}>
				<Image
					alt={meowing ? 'meow :3' : 'hound'}
					height={64}
					src={
						meowing
							? '/public/images/other/hound/hound_meow_kovshik.png'
							: '/public/images/other/hound/hound_kovshik.png'
					}
					width={64}
				/>
			</div>
		</button>
	)
}
