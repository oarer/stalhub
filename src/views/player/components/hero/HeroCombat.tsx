import { useTranslations } from 'next-intl'
import type { Stat } from '@/types/player.type'
import { getStatValue } from '@/utils/player/StatParse'
export default function HeroCombat({ data }: { data: Stat[] }) {
	const t = useTranslations()

	return (
		<div className="grid grid-cols-1 justify-between gap-4 sm:grid-cols-2">
			<div>
				<p>
					{t('player.combat.kd')}{' '}
					{(
						Number(getStatValue(data, 'kil') ?? 0) /
						(Number(getStatValue(data, 'bul-dea') ?? 0) || 1)
					).toFixed(2)}
				</p>
				<div className="pl-4">
					<p>
						{t('player.combat.kills')}{' '}
						{Number(getStatValue(data, 'kil') ?? 0)}
					</p>
					<p>Смертей: {Number(getStatValue(data, 'bul-dea') ?? 0)}</p>
				</div>
				<p>
					{t('player.combat.kil_ser')}{' '}
					{Number(getStatValue(data, 'max-kil-ser') ?? 0)}
				</p>
			</div>

			<div>
				<p>
					{t('player.combat.accuracy')}{' '}
					{(
						(Number(getStatValue(data, 'sho-hit') ?? 0) /
							(Number(getStatValue(data, 'sho-fir') ?? 0) || 1)) *
						100
					).toFixed(0)}
					%
				</p>
				<div className="pl-4">
					<p>
						{t('player.combat.shots')}{' '}
						{Number(getStatValue(data, 'sho-fir') ?? 0)}
					</p>
					<p>
						{t('player.combat.hits')}{' '}
						{Number(getStatValue(data, 'sho-hit') ?? 0)}
					</p>
				</div>
				<p>
					{t('player.combat.accuracy_head')}{' '}
					{(
						(Number(getStatValue(data, 'sho-hea') ?? 0) /
							(Number(getStatValue(data, 'sho-hit') ?? 0) || 1)) *
						100
					).toFixed(0)}
					%
				</p>
			</div>
		</div>
	)
}
