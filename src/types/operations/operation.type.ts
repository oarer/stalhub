export interface OperationSessionParticipant {
	username: string
	death: number
	mobKills: number
	damageReceived: number
	damageDealt: number
	armorClass: string
	armorItemId?: string
	armorLevel: number
	primaryWeaponItemId?: string
	primaryWeaponLevel: number
	secondaryWeaponItemId?: string
	secondaryWeaponLevel: number
}

export interface OperationSession {
	id: number
	map: string
	startTime: string
	endTime: string
	difficulty: number
	sessionDurationSeconds: number
	difficultyReward: number
	participants: OperationSessionParticipant[]
}

export interface OperationSessionListing {
	total: number
	sessions: OperationSession[]
}
