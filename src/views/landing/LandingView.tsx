import HeroFeatures from './sections/Features'
import LandingFooter from './sections/Footer'
import HeroNew from './sections/HeroNew'
import Roadmap from './sections/Roadmap'
import Tools from './sections/Tools'

export default function LandingView() {
	return (
		<section className="relative mx-auto mt-18 mb-12 flex size-full max-w-440 flex-col gap-10 px-6 pt-18 sm:px-12 lg:px-14">
			<div className="flex min-h-screen flex-col gap-2">
				<HeroNew />
				<HeroFeatures />
			</div>
			<Tools />
			{/* <Tops /> */}
			<Roadmap />
			<LandingFooter />
		</section>
	)
}
