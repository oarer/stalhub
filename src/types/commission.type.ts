export interface CommissionPerson {
	id: number
	username: string
	name: string | null
}

export interface CommissionPrice {
	id?: string
	title: string
	description: string
	amount: number
	days_min: number
	days_max: number
}

export interface ArtistProfile {
	user_id: number
	user: CommissionPerson
	description: string
	accepting: boolean
	currency: string
	terms: string
	revisions: number
	version: number
	portfolio_ids: string[]
	prices: CommissionPrice[]
	portfolio?: {
		external_id: string
		title: string | null
		type: string
		image_url: string | null
		image_urls: string[]
	}[]
}
export type ArtistInput = Omit<ArtistProfile, 'user_id' | 'user' | 'portfolio'>

export interface CommissionFile {
	id: string
	name: string
	mime: string
	size: number
}

export interface CommissionPayment {
	id: string
	title: string
	amount: number
	upfront: boolean
	instructions: string
	status: string
	note: string
}

export interface CommissionRefund {
	id: string
	amount: number
	due_at: string
	status: string
	note: string
}

export interface CommissionDecision {
	id: string
	outcome: string
	reason: string
	obligations: string
	created_at: string
}

export interface CommissionCase {
	id: string
	order_id?: string
	kind: string
	opened_by: number
	assigned_to: number | null
	claimable?: boolean
	currency?: string
	reason: string
	status: string
	version: number
	created_at: string
	decisions?: CommissionDecision[]
	review?: { score: number; content: string } | null
}

export interface CommissionOrder {
	id: string
	customer_id: number
	artist_id: number
	customer: CommissionPerson
	artist: CommissionPerson
	title: string
	brief: string
	items: CommissionPrice[]
	terms: string
	currency: string
	total: number
	status: string
	version: number
	due_at: string | null
	accepted_at: string | null
	revisions: number
	revisions_used: number
	cancellation_by: number | null
	payments: CommissionPayment[]
	refunds: CommissionRefund[]
	cases: CommissionCase[]
	files: CommissionFile[]
	updated_at: string
}

export interface CommissionSummary {
	id: string
	title: string
	status: string
	currency: string
	total: number
	customer: CommissionPerson
	artist: CommissionPerson
	updated_at: string
	unread: boolean
}

export interface CommissionMessage {
	id: number
	author: CommissionPerson
	kind: string
	content: string
	created_at: string
	files: CommissionFile[]
}

export interface CommissionPage<T> {
	data: T[]
	total: number
	page: number
}

export interface CommissionCreate {
	key: string
	artist_id: number
	profile_version: number
	price_ids: string[]
	title: string
	brief: string
	file_ids: string[]
}

export interface CommissionCommand {
	key: string
	version: number
	action: string
	content?: string
	file_ids?: string[]
	target_id?: string
	due_at?: string
	score?: number
	payments?: {
		title: string
		amount: number
		upfront: boolean
		instructions: string
	}[]
}

export interface CaseCommand {
	key: string
	version: number
	action: string
	content?: string
	obligations?: string
	outcome?: string
	due_at?: string
	refund?: number
	file_ids?: string[]
}

export interface CommissionReputation {
	average: number | null
	total: number
	page: number
	data: {
		id: string
		order_id: string
		score: number
		content: string
		artist_id: number
		created_at: string
	}[]
}

export const commissionMoney = (amount: number, currency: string) =>
	new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
		amount / 100
	)

export function parseCommissionMoney(value: string): number | null {
	if (!/^\d{1,7}([.,]\d{1,2})?$/.test(value.trim())) return null
	const [whole, fraction = ''] = value.trim().replace(',', '.').split('.')
	const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
	return result > 0 && result <= 100_000_000 ? result : null
}
