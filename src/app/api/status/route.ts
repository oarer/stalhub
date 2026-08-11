import type { AxiosError } from 'axios'
import axios from 'axios'
import { NextResponse } from 'next/server'
import type { StatusResponse } from '@/types/status.type'

export async function GET(request: Request) {
	try {
		const { data } = await axios.get<StatusResponse>(
			`https://status.stalhub.dev/dashboard-apis/monitor-bars?tags=stalhub,stalhub_cdn&days=1`,
			{
				headers: {
					Authorization: `Bearer ${process.env.STATUS_TOKEN}`,
				},
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
