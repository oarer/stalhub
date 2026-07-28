export interface AdminPermission {
	id: number
	name: string
	description: string | null
}

export interface AdminCreatePermission {
	name: string
	description?: string
}

export interface AdminUpdatePermission {
	name?: string
	description?: string
}

export interface AdminRole {
	id: number
	name: string
	description: string | null
	permissions: AdminPermission[]
}

export interface AdminCreateRole {
	name: string
	description?: string
}

export interface AdminUpdateRole {
	name?: string
	description?: string
}

export interface AdminUser {
	id: number
	username: string
	name: string | null
	avatar: string | null
	joined_at: string
	roles: { id: number; name: string }[]
	banned: boolean
}

export interface AdminUserDetail extends AdminUser {
	sessions: AdminSession[]
}

export interface AdminSession {
	id: number
	ip: string
	user_agent: string
	created_at: string
	last_active: string
}

export interface AdminUserListParams {
	take?: number
	page?: number
	search?: string
}

export interface AdminBanUser {
	reason?: string
	expires_in?: number
}

export interface AdminAssignPermissions {
	permissionIds: number[]
}

export interface AdminAssignRoleToUser {
	roleId: number
}

export interface AdminBadge {
	id: number
	name: string
	icon: string | null
	image: string | null
	color: string
}

export interface AdminCreateBadge {
	name: string
	icon?: string | null
	image?: string | null
	color?: string
}

export interface AdminUpdateBadge {
	name?: string
	icon?: string | null
	image?: string | null
	color?: string
}
