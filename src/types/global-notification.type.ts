export type GlobalNotificationType = 'info' | 'warning' | 'danger'

export type GlobalNotificationContent =
	| {
			type: 'text'
			text: string
	  }
	| {
			type: 'link'
			text: string
			href: string
	  }

export interface GlobalNotification {
	id: number
	title: string
	type: GlobalNotificationType
	content: GlobalNotificationContent[]
	is_active: boolean
	starts_at: string
	expires_at: string | null
	author_id?: number | null
	created_at?: string
	updated_at?: string
}

export interface GlobalNotificationsResponse {
	data: GlobalNotification[]
}

export interface GlobalNotificationSaveInput {
	title: string
	type: GlobalNotificationType
	content: GlobalNotificationContent[]
	is_active: boolean
	starts_at?: string
	expires_at: string | null
}

export type GlobalNotificationUpdateInput = Partial<GlobalNotificationSaveInput>
