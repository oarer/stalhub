import LandingFooter from './sections/Footer'
import Hero from './sections/Hero'
import Roadmap from './sections/Roadmap'
import Tools from './sections/Tools'

export default function LandingView() {
	return (
		<section className="relative mx-auto mt-18 mb-12 flex size-full max-w-440 flex-col gap-10 px-6 pt-18 sm:px-12 lg:px-14">
			<Hero />
			<Tools />
			{/* <Tops /> */}
			<Roadmap />
			<LandingFooter />
		</section>
	)
}
