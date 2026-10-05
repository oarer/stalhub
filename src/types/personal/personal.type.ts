export interface PersonalProfile {
	user_id: number
	region: string
	character_name: string
	character_uuid: string | null
	is_public: boolean
	public_fields: string[]
	last_snapshot_at: string | null
	created_at: string
	updated_at: string
}

export interface PersonalStatPoint {
	id: string
	value: number | string
}

export interface PersonalSnapshot {
	id: number
	user_id: number
	region: string
	character_name: string
	stats: { id: string; value: number | string }[]
	profile: {
		uuid: string
		alliance: string | null
		lastLogin: string | null
		clan: { id: string; name: string; tag: string } | null
	} | null
	created_at: string
}

export interface PersonalSummary {
	snapshots: number
	series: Record<string, { t: string; v: number | string }[]>
	deltas: Record<string, number>
	first: PersonalSnapshot | null
	last: PersonalSnapshot | null
}

export interface PersonalClanStageStats {
	clan_id: string | null
	tag: string | null
	name: string | null
	sessions: number
	appearances: number
	kills: number
	deaths: number
	assists: number
	kd: number
	kda: number
}

export interface PersonalStageStats {
	sessions: number
	appearances: number
	kills: number
	deaths: number
	assists: number
	kd: number
	kda: number
	per_clan: PersonalClanStageStats[]
	per_stage: {
		session_id: number
		map_name: string
		started_at: string
		clan: string
		kills: number
		deaths: number
		assists: number
	}[]
	per_map: {
		map: string
		sessions: number
		wins: number
		losses: number
		winrate: number
		kills: number
		deaths: number
		kd: number
	}[]
}

export interface PublicPersonal {
	user: { username: string; name: string }
	profile: {
		region: string
		character_name: string
		public_fields: string[]
		last_snapshot_at: string | null
	}
	snapshots: PersonalSnapshot[]
	stage_stats: Omit<PersonalStageStats, 'per_stage'>
}

export interface PersonalSession {
	id: number
	external_id: string
	region: string
	map_name: string
	type: string
	started_at: string
	ended_at: string | null
	stage_number: number | null
	victory?: boolean | null
	_count?: { screenshots: number; attendance?: number }
}
