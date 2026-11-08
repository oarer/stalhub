import { allianceColors } from '@/types/player.type'
import type { UnoGridClan, UnoGridGroup } from '@/types/uno/uno.type'
import { normalizeUnoFaction } from '../../utils/uno.utils'
import type { MatchRecord, ResultGroup, StageView } from './grid-detail.types'

const RANK_ORDER = ['S', 'A', 'B', 'C', 'D', 'E']

export function formatGridDate(value: string | null) {
	if (!value) return null
	const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
	return match ? `${match[3]}.${match[2]}.${match[1]}` : value
}

export function clanColor(faction: string | null) {
	const key = normalizeUnoFaction(faction)
	return key ? allianceColors[key] : 'text-foreground'
}

export function groupRanks(group: UnoGridGroup) {
	const ranks = new Set<string>()
	const start = group.tier ? RANK_ORDER.indexOf(group.tier) : -1
	const end = group.tierMax ? RANK_ORDER.indexOf(group.tierMax) : -1
	if (start >= 0 && end >= 0) {
		const [from, to] = start <= end ? [start, end] : [end, start]
		for (let index = from; index <= to; index += 1) {
			ranks.add(RANK_ORDER[index])
		}
	} else {
		if (group.tier) ranks.add(group.tier)
		if (group.tierMax) ranks.add(group.tierMax)
	}

	const order = (rank: string) => {
		const index = RANK_ORDER.indexOf(rank)
		return index === -1 ? RANK_ORDER.length : index
	}

	return [...ranks].sort(
		(left, right) => order(left) - order(right) || left.localeCompare(right)
	)
}

export function buildBracket(group: UnoGridGroup) {
	const records = new Map<string, MatchRecord>()
	const stages: StageView[] = group.stages.map((stage) => ({
		number: stage.number,
		matches: stage.matches.map((match) => {
			const before = match.clans.map((clan) => {
				const record = records.get(clan.id)
				return record ? { ...record } : { wins: 0, losses: 0 }
			})
			const winnerIndex = match.winnerId
				? match.clans.findIndex((clan) => clan.id === match.winnerId)
				: -1
			const focus = (winnerIndex >= 0
				? before[winnerIndex]
				: before[0]) ?? {
				wins: 0,
				losses: 0,
			}

			if (match.winnerId) {
				for (const clan of match.clans) {
					const current = records.get(clan.id) ?? {
						wins: 0,
						losses: 0,
					}
					if (clan.id === match.winnerId) current.wins += 1
					else current.losses += 1
					records.set(clan.id, current)
				}
			}

			return {
				match,
				record: { wins: focus.wins, losses: focus.losses },
			}
		}),
	}))

	const clansById = new Map<string, UnoGridClan>()
	for (const clan of group.clans) clansById.set(clan.id, clan)
	for (const stage of group.stages) {
		for (const match of stage.matches) {
			for (const clan of match.clans) {
				if (!clansById.has(clan.id)) clansById.set(clan.id, clan)
			}
		}
	}

	const groupsByKey = new Map<string, ResultGroup>()
	for (const clan of clansById.values()) {
		const record = records.get(clan.id) ?? { wins: 0, losses: 0 }
		const key = `${record.wins}-${record.losses}`
		const existing = groupsByKey.get(key) ?? {
			key,
			wins: record.wins,
			losses: record.losses,
			clans: [],
		}
		existing.clans.push(clan)
		groupsByKey.set(key, existing)
	}

	const result = [...groupsByKey.values()].sort(
		(left, right) => right.wins - left.wins || left.losses - right.losses
	)

	return { stages, result }
}
