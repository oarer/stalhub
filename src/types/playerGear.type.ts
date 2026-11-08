export interface PlayerGearItemDb {
	id: string
	name: string | null
	category: string | null
	type: string
	color: string | null
	state: string | null
}

export interface PlayerGearUpgrade {
	level: number | null
	failedAttempts: number | null
	compensatedAttempts: number | null
}

export interface PlayerGearAttribute {
	type: number | null
	definitionId: string | null
	quality: number | null
	statsRandom: number | null
}

export interface PlayerGearAttachment {
	slot: string
	slotLabel: string
	itemId: string | null
	name: string | null
	db: PlayerGearItemDb | null
	gameId: number | null
	quality: number | null
	potential: number | null
	ndmg: number | null
	upgradeBonus: number | null
	randomStats: number | null
	bonusProperties: string[] | null
	attributes: PlayerGearAttribute[]
}

export interface PlayerGearRenderModel {
	glb: string
	textures: {
		diff?: string
		nrm?: string
		emi?: string
		spek?: string
	}
}

export interface PlayerGearRenderAttach {
	bone: string
	position: [number, number, number]
	rotation: [number, number, number]
	scale: [number, number, number]
	fallback: boolean
}

export interface PlayerGearRender {
	model: PlayerGearRenderModel | null
	armor?: { menuHeavy: boolean }
	weapon?: {
		menuClass: 'primary' | 'pistol' | 'melee'
		attach: PlayerGearRenderAttach
	}
}

export interface PlayerGearItem {
	slot: string
	slotType: string
	itemId: string | null
	name: string | null
	db: PlayerGearItemDb | null
	gameId: number | null
	upgrade: PlayerGearUpgrade
	quality: number | null
	potential: number | null
	upgradeBonus: number | null
	randomStats: number | null
	attachments: PlayerGearAttachment[]
	render?: PlayerGearRender | null
}

export interface PlayerGearResponse {
	name: string
	items: PlayerGearItem[]
}
