import { NextResponse } from 'next/server'
import axios, { type AxiosError } from 'axios'

interface LotsResponse {
    lots: Array<{
        seller: string
        price: number
        date: string
        [key: string]: unknown
    }>
    [key: string]: unknown
}

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const { searchParams } = new URL(req.url)

    const limit = searchParams.get('limit') ?? '10'
    const additional = searchParams.get('additional') ?? 'true'

    try {
        const { data } = await axios.get<LotsResponse>(
            `https://eapi.stalcraft.net/ru/auction/${id}/lots`,
            {
                params: { limit, additional },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.EXBO_TOKEN}`,
                },
            }
        )

        return NextResponse.json(data)
    } catch (err) {
        const error = err as AxiosError<{ message?: string }>
        const status = error.response?.status ?? 500
        const message =
            error.response?.data?.message ??
            error.message ??
            'Неизвестная ошибка при запросе аукциона.'

        return NextResponse.json({ error: message }, { status })
    }
}
