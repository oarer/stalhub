'use client'

import { unbounded } from '../fonts'
import Model from './model'

export default function Page() {
	return (
		<main className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pt-12 xl:flex-row">
			<div className="flex-1 text-center xl:text-left">
				<h1 className={`${unbounded.className} text-4xl`}>
					Упсс... <br />
					Сайт в разработке, заходите позже.
				</h1>
			</div>

			<div className="flex h-[50vh] w-full flex-1 justify-center sm:h-[60vh] lg:block xl:h-[80vh]">
				<Model />
			</div>
		</main>
	)
}
