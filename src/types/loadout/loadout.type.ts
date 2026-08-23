export interface LoadoutData {
	weapon_primary: string | null
	weapon_secondary: string | null
	weapon_pistol: string | null
	armor: string | null
	bio_armor: string | null
	build_fat: number | null
	build_speed: number | null
}

export const EMPTY_LOADOUT: LoadoutData = {
	weapon_primary: null,
	weapon_secondary: null,
	weapon_pistol: null,
	armor: null,
	bio_armor: null,
	build_fat: null,
	build_speed: null,
}

export interface UserLoadout {
	user_id: number
	data: LoadoutData
	is_public: boolean
	updated_at: string
}
