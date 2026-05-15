'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import ErrorContent from '@/views/errors/shared/ErrorContent'

export default function Page() {
	const router = useRouter()

	return (
		<section className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
			<div className="grid items-center gap-16 md:flex">
				<ErrorContent
					buttonIcon="lucide:rotate-ccw"
					buttonLabel="Попробовать снова"
					description="Ведутся технические работы"
					onButtonClick={() => router.refresh()}
				/>

				<Image
					alt="maintenance"
					className="rounded-lg bg-neutral-400 p-3 dark:bg-transparent"
					height={400}
					// ждём рендер
					src="/images/errors/500.png"
					width={400}
				/>
			</div>
		</section>
	)
}
