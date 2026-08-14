export const STAGE_TYPES = [
	{ value: 'BRAWL', label: 'clan.stage.BRAWL', icon: 'lucide:swords' },
	{
		value: 'BASE_CAPTURE',
		label: 'clan.stage.BASE_CAPTURE',
		icon: 'lucide:flag',
	},
	{
		value: 'TOURNAMENT',
		label: 'clan.stage.TOURNAMENT',
		icon: 'lucide:trophy',
	},
]

export const SCREENSHOT_STATUS: Record<
	string,
	{ label: string; color: string; icon: string; spin?: boolean }
> = {
	pending: {
		label: 'clan.screenshotStatus.pending',
		color: 'text-neutral-500',
		icon: 'lucide:clock',
	},
	processing: {
		label: 'clan.screenshotStatus.processing',
		color: 'text-sky-500',
		icon: 'lucide:loader-circle',
		spin: true,
	},
	done: {
		label: 'clan.screenshotStatus.done',
		color: 'text-green-500',
		icon: 'lucide:check-circle',
	},
	error: {
		label: 'clan.screenshotStatus.error',
		color: 'text-red-500',
		icon: 'lucide:alert-circle',
	},
}
