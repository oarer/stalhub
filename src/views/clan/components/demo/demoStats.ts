import type {
	ClanMember,
	ClanStats,
	GrenadeAllTimeResponse,
	GrenadeStagesResponse,
	StageType,
} from '@/types/clan/clan.type'

export interface ClanDemoData {
	stats: ClanStats
	members: ClanMember[]
	grenadeAllTime: GrenadeAllTimeResponse
	grenadeStages: GrenadeStagesResponse
}

const NICKNAMES = [
	'ShadowWolf',
	'Ghost_RU',
	'Stalker2024',
	'IronMan',
	'NightHunter',
	'Volkodav',
	'Toxic_Alex',
	'RedFox',
	'SniperPro',
	'DarkZone',
	'Phantom',
	'Bars_77',
]

const MAPS = ['Малая Бердовка', 'Хвоиный', 'Низина']
const TYPES: StageType[] = ['TOURNAMENT', 'BRAWL', 'BASE_CAPTURE']

function mulberry32(seed: number) {
	let a = seed >>> 0
	return () => {
		a |= 0
		a = (a + 0x6d2b79f5) | 0
		let t = Math.imul(a ^ (a >>> 15), 1 | a)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

function pick<T>(rand: () => number, arr: T[]): T {
	return arr[Math.floor(rand() * arr.length)]
}

export function buildClanDemoData(seed = 42): ClanDemoData {
	const rand = mulberry32(seed)
	const int = (min: number, max: number) =>
		min + Math.floor(rand() * (max - min + 1))

	const members: ClanMember[] = NICKNAMES.map((name, i) => ({
		id: i + 1,
		clan_id: 'demo',
		name,
		rank: i === 0 ? 'LEADER' : i < 3 ? 'OFFICER' : 'SOLDIER',
		join_time: null,
		user_id: i + 100,
		user: { id: i + 100, username: `user_${i}`, name },
		synced_at: new Date().toISOString(),
	}))

	let sessionId = 1
	let screenshotId = 1
	const sessions: ClanStats['sessions'] = []

	for (let s = 0; s < 14; s++) {
		const map_name = pick(rand, MAPS)
		const type = pick(rand, TYPES)
		const daysAgo = int(0, 30)
		const started_at = new Date(
			Date.now() - daysAgo * 24 * 3600 * 1000 - int(0, 20) * 3600 * 1000
		).toISOString()
		const shotsCount = int(1, 3)
		const screenshots = []

		for (let sh = 0; sh < shotsCount; sh++) {
			const victory = rand() > 0.42
			const shuffled = [...NICKNAMES].sort(() => rand() - 0.5)
			const roster = shuffled.slice(0, int(5, 8))
			screenshots.push({
				id: screenshotId++,
				victory,
				players: roster.map((name) => ({
					name,
					kills: int(0, 14),
					deaths: int(0, 10),
					assists: int(0, 6),
					score: int(100, 2500),
				})),
			})
		}

		sessions.push({
			id: sessionId++,
			map_name,
			type,
			started_at,
			screenshots,
		})
	}

	sessions.sort((a, b) => b.started_at.localeCompare(a.started_at))

	const grenadeAllTime: GrenadeAllTimeResponse = {
		members: NICKNAMES.map((name) => ({ name, grenades: int(20, 900) })),
	}

	const grenadeStages: GrenadeStagesResponse = {
		events: [0, 1].map((e) => {
			const raidDate = new Date(Date.now() - e * 7 * 24 * 3600 * 1000)
			const raid_date = `${raidDate.getFullYear()}-${String(raidDate.getMonth() + 1).padStart(2, '0')}-${String(raidDate.getDate()).padStart(2, '0')}`
			const total = NICKNAMES.map((name) => ({
				name,
				grenades: int(5, 120),
			})).sort((a, b) => b.grenades - a.grenades)
			return {
				event_type: pick(rand, TYPES),
				raid_date,
				stages: [
					{
						stage: 1,
						checkpoints: [
							`${raid_date}T10:00:00`,
							`${raid_date}T12:00:00`,
						] as [string, string],
						members: NICKNAMES.map((name) => ({
							name,
							grenades: int(0, 60),
						})),
					},
				],
				total,
				boxes: [],
			}
		}),
	}

	return { stats: { sessions }, members, grenadeAllTime, grenadeStages }
}
