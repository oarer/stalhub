import type { SquadMap } from '@/types/clan/clan.type'

export const SQUAD_MAPS: { value: SquadMap; label: string; icon: string }[] = [
	{
		value: 'SMALL_BERDOVKA',
		label: 'clan.maps.SMALL_BERDOVKA',
		icon: 'lucide:map',
	},
	{
		value: 'KHVOUINOY',
		label: 'clan.maps.KHVOUINOY',
		icon: 'lucide:map-pin',
	},
	{ value: 'NIZINA', label: 'clan.maps.NIZINA', icon: 'lucide:mountain' },
]
