'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export default function Hound() {
	return (
		<Button className="fixed right-5 bottom-5 z-50 p-2" variant={'ghost'}>
			<Image alt="222" src="public/images/other/hound.png" />
		</Button>
	)
}
