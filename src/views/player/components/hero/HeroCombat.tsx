import type { Stat } from '@/types/player.type'
import { getStatValue } from '@/utils/player/StatParse'

export default function HeroCombat({ data }: { data: Stat[] }) {
	return (
		<div className="grid grid-cols-1 justify-between gap-4 sm:grid-cols-2">
			<div>
				<p>
					К/Д:{' '}
					{(
						getStatValue(data, 'kil') /
						getStatValue(data, 'bul-dea')
					).toFixed(2)}
				</p>
				<div className="pl-4">
					<p>Убийства: {getStatValue(data, 'kil')}</p>
					<p>Смертей: {getStatValue(data, 'bul-dea')}</p>
				</div>
				<p>
					Максимальная серия Убийств:{' '}
					{getStatValue(data, 'max-kil-ser')}
				</p>
			</div>
			<div>
				<p>
					Точность:{' '}
					{(
						(getStatValue(data, 'sho-hit') /
							getStatValue(data, 'sho-fir')) *
						100
					).toFixed(0)}
					%
				</p>
				<div className="pl-4">
					<p>Выстрелов: {getStatValue(data, 'sho-fir')}</p>
					<p>Попаданий: {getStatValue(data, 'sho-hit')}</p>
				</div>
				<p>
					Точность в голову:{' '}
					{(
						(getStatValue(data, 'sho-hea') /
							getStatValue(data, 'sho-hit')) *
						100
					).toFixed(0)}
					%
				</p>
			</div>
		</div>
	)
}
