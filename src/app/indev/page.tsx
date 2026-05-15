import { unbounded } from '../fonts'

export default function Page() {
	return (
		<section className="flex min-h-screen items-center justify-center text-center">
			<h1
				className={`${unbounded.className} text-2xl uppercase tracking-widest`}
			>
				Coming soon...
			</h1>
		</section>
	)
}
