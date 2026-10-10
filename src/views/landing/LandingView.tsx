import dynamic from 'next/dynamic'
import LandingClan from './sections/ClanAnalytics'
import Hero from './sections/Hero'
import PersonalAnalytics from './sections/PersonalAnalytics'

const Tools = dynamic(() => import('./sections/Tools'))
const Roadmap = dynamic(() => import('./sections/Roadmap'))
const LandingFooter = dynamic(() => import('./sections/Footer'))

export default function LandingView() {
	return (
		<section className="relative mx-auto mt-18 mb-12 flex size-full max-w-400 flex-col gap-0 px-6 pt-18 sm:px-12 lg:px-14">
			<Hero />
			<Tools />
			<LandingClan />
			<PersonalAnalytics />
			<Roadmap />
			<LandingFooter />
		</section>
	)
}
