import FloatingIcons from './sections/FloatingIcons'
import Hero from './sections/Hero'
import Tools from './sections/Tools'

export default function LandingView() {
	return (
		<main className="relative mx-auto mt-26 mb-12 flex max-w-380 flex-col gap-10 px-4 pt-12 xl:mt-0 dark:text-white/70">
			<FloatingIcons />
			<Hero />
			<Tools />
		</main>
	)
}
