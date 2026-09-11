import dynamic from 'next/dynamic'
import Hero from './sections/Hero'

const Tools = dynamic(() => import('./sections/Tools'))
const Roadmap = dynamic(() => import('./sections/Roadmap'))
const LandingFooter = dynamic(() => import('./sections/Footer'))

export default function LandingView() {
	return (
		<section className="relative mx-auto mt-18 mb-12 flex size-full max-w-440 flex-col gap-10 px-6 pt-18 sm:px-12 lg:px-14">
			<Hero />

			<Tools />
			<Roadmap />
			<LandingFooter />
		</section>
	)
}
