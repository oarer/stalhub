export interface IngredientInfo {
	name: string
	icon: string
	total: number
}

export interface CustomNodeData {
	[key: string]: unknown
	label: string
	icon: string
	price: number | null
	hasRecipe?: boolean
	isExpanded?: boolean
	isRoot?: boolean
	onToggle?: () => void
	quantity?: number
	perCraft?: number
	onQuantityChange?: (delta: number) => void
	energyPerCraft?: number
	ingredients?: IngredientInfo[]
}

export interface CenterTarget {
	x: number
	y: number
}

export interface IngredientRows {
	id: string
	name: string
	icon: string
	perCraft: number
	total: number
	price: number
	totalPrice: number
	depth: number
	energy: number
}
