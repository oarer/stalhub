import { NextResponse } from 'next/server'
import axios, { type AxiosError } from 'axios'

interface TokenState {
    token: string
    blockedUntil: number
}

const tokens: TokenState[] = [
    { token: process.env.EXBO_TOKEN_1!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_2!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_3!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_4!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_5!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_6!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_7!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_8!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_9!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_10!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_11!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_12!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_13!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_14!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_15!, blockedUntil: 0 },
    { token: process.env.EXBO_TOKEN_16!, blockedUntil: 0 },
]

let currentIndex = 0

function getNextToken(): TokenState {
    const startIndex = currentIndex
    const now = Date.now()
    do {
        const t = tokens[currentIndex]
        currentIndex = (currentIndex + 1) % tokens.length

        if (t.blockedUntil <= now) {
            return t
        }
    } while (currentIndex !== startIndex)

    throw new Error('All tokens temporary blocked, try again later.')
}

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const { searchParams } = new URL(req.url)

    const limit = searchParams.get('limit') ?? '10'
    const additional = searchParams.get('additional') ?? 'true'

    let attempt = 0

    while (attempt < tokens.length) {
        const tokenState = getNextToken()
        try {
            const { data } = await axios.get(
                `https://eapi.stalcraft.net/ru/auction/${id}/history`,
                {
                    params: { limit, additional },
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${tokenState.token}`,
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
                'Unknown error. aucHistory'

            if (status === 429) {
                tokenState.blockedUntil = Date.now() + 60_000
                attempt++
                continue
            }

            return NextResponse.json({ error: message }, { status })
        }
    }

    return NextResponse.json(
        { error: 'All tokens blocked. Try later.' },
        { status: 429 }
    )
}
