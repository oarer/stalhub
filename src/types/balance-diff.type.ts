export type BalanceItemCategory =
	| 'weapon'
	| 'armor'
	| 'artefact'
	| 'attachment'
	| 'bag'
	| 'boost'
	| 'bullet'
	| 'grenade'

export type BalanceChangeType = 'added' | 'removed' | 'changed'

export type BalanceStatChange = {
	label: string
	oldValue: string | number | null
	newValue: string | number | null
	type: BalanceChangeType
}

export type BalanceItemChange = {
	path: string
	category: BalanceItemCategory
	name: string
	color?: string
	changes: BalanceStatChange[]
}

export type BalanceStatus = {
	loc: string | null
	remote: string | null
	ref: string | null
	fresh: boolean
}

export type BalanceDiffsResponse = {
	items: BalanceItemChange[]
	total: number
	status?: BalanceStatus
}

export type BalanceArchiveEntry = {
	timestamp: string
}

export type BalanceArchiveResponse = {
	total: number
	files: string[]
}
