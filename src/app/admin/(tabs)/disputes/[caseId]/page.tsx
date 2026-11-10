'use client'

import { useParams } from 'next/navigation'
import DisputeDetailView from '@/views/admin/disputes/DisputeDetailView'

export default function AdminDisputeDetailPage() {
	const params = useParams<{ caseId: string }>()

	return <DisputeDetailView caseId={params.caseId} />
}
