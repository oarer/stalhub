'use client'

import { useParams } from 'next/navigation'
import UserDetailView from '@/views/admin/users/UserDetailView'

export default function AdminUserDetailPage() {
	const params = useParams<{ userId: string }>()

	return <UserDetailView userId={Number(params.userId)} />
}
