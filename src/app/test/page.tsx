import HoverUserCard from '@/components/ui/user/HoverUserCard'

export default function TestPage() {
	return (
		<section className="mx-auto flex min-h-screen items-center justify-center gap-4 px-3">
			<HoverUserCard id={1}>test</HoverUserCard>
		</section>
	)
}
