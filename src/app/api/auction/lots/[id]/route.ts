import type { AxiosError } from 'axios'
import { NextResponse } from 'next/server'
import { apiClient } from '@/app/api/interceptors/sc/auth.interceptor'
import type { LotsResponse } from '@/types/item.type'

export async function GET(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	const { id } = await context.params
	const { searchParams } = new URL(req.url)
	const limit = searchParams.get('limit') ?? '10'
	const additional = searchParams.get('additional') ?? 'true'

	try {
		const { data } = await apiClient.get<LotsResponse>(
			`/ru/auction/${id}/lots`,
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
