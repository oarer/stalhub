import { NextResponse } from 'next/server'
import type { AxiosError } from 'axios'

import { apiClient } from '@/app/api/interceptors/sc/auth.interceptor'
import type { PlayerInfo } from '@/types/player.type'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ region: string; character: string }> }
) {
    const { region, character } = await params

    try {
        const { data } = await apiClient.get<PlayerInfo>(
            `/${region}/character/by-name/${character}/profile`
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
