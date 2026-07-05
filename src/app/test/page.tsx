import { unbounded } from '../fonts'

export default function TestPage() {
	return (
		<section className="mx-auto flex min-h-screen items-center justify-center gap-4 px-3">
			<h1
				className={`${unbounded.className} animate-pulse font-bold text-2xl uppercase tracking-widest`}
			>
				Авторизация
			</h1>
		</section>
	)
}
