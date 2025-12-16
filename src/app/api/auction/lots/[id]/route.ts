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
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const { data } = await axios.get<LotsResponse>(
            `${process.env.API_URL}/available-lots?region=ru&id=${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
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
