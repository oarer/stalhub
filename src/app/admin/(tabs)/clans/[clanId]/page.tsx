'use client'

import { useParams } from 'next/navigation'
import ClanAdminDetailView from '@/views/admin/clans/ClanAdminDetailView'

export default function AdminClanDetailPage() {
	const params = useParams<{ clanId: string }>()

	return <ClanAdminDetailView clanId={params.clanId} />
}
