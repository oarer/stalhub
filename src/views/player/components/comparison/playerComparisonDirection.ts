import type { StatType } from '@/types/player.type'

export type PlayerComparisonDirection = 'higher' | 'lower' | null

const LOWER_IS_BETTER = [
	/(^|-)dea$/i,
	/^suicides$/i,
	/^deaths-bf$/i,
	/^lost-bf$/i,
	/^pres-deaths$/i,
	/^dam-rec-/i,
]

const HIGHER_IS_BETTER = [
	/^kil$/i,
	/(^|-)kil$/i,
	/^kil-/i,
	/^ast$/i,
	/^dam-dea/i,
	/^dam-exp$/i,
	/^sho-(hit|hea|bod|lim)$/i,
	/^dun-pas$/i,
	/^que-fin$/i,
	/^dai-que-fin$/i,
	/^dis-/i,
	/^tpacks-distance$/i,
	/^ach-/i,
	/^air-drops-/i,
	/^mining-count$/i,
	/^art-col$/i,
	/^scr-thr$/i,
	/^scn-cnt$/i,
	/^sgn-fnd$/i,
	/^blizzard-won$/i,
	/^ite-cra$/i,
	/^back-fix$/i,
	/^wea-fix$/i,
	/^arm-fix$/i,
	/^tpacks-(delivered|inter|craf|money)$/i,
	/^tra$/i,
	/^equ-upg$/i,
	/^suc-equ-upg$/i,
	/^mon-gai-/i,
	/^ite-sol-tra$/i,
	/^max-mon-amo$/i,
	/^bas-(cap|def)-amo$/i,
	/-ops$/i,
	/^incident-/i,
	/-won$/i,
	/^won-/i,
	/-wins$/i,
	/^gg-won$/i,
	/^kills-bf$/i,
	/^fights-part$/i,
	/^earned-on-arenas$/i,
	/^br-/i,
	/^ravent-won$/i,
	/^pres-(wins|kills|captures|bat-plc|recharged|plr-spot|cmbt-pts|sup-pts|ctrl-pts|revives)$/i,
	/^hid-/i,
]

const NUMERIC_TYPES: ReadonlySet<StatType> = new Set(['INTEGER', 'DECIMAL'])

export const getPlayerStatDirection = (
	id: string,
	type: StatType
): PlayerComparisonDirection => {
	if (!id || !NUMERIC_TYPES.has(type)) return null
	if (LOWER_IS_BETTER.some((pattern) => pattern.test(id))) return 'lower'
	if (HIGHER_IS_BETTER.some((pattern) => pattern.test(id))) return 'higher'
	return null
}
