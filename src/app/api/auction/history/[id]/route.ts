import { NextResponse } from 'next/server'
import type { AxiosError } from 'axios'

import type { LotsHistoryResponse } from '@/types/item.type'
import { apiClient } from '@/app/api/interceptors/sc/auth.interceptor'

export async function GET(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	const { id } = await context.params
	const { searchParams } = new URL(req.url)
	const limit = searchParams.get('limit') ?? '10'
	const additional = searchParams.get('additional') ?? 'true'

	try {
		const { data } = await apiClient.get<LotsHistoryResponse>(
			`/ru/auction/${id}/history`,
			{
				params: { limit, additional },
			}
		)
		return NextResponse.json(data)
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>
		const status = error.response?.status ?? 500
		const message =
			error.response?.data?.message ?? error.message ?? 'Unknown error'
		return NextResponse.json({ error: message }, { status })
	}
}
