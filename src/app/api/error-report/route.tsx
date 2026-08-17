import axios from 'axios'
import { randomUUID } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TG_BOT_TOKEN
const CHAT_ID = process.env.TG_CHAT_ID

interface TelegramEntity {
	type: 'custom_emoji'
	offset: number
	length: number
	custom_emoji_id: string
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		if (!body?.content) {
			return NextResponse.json(
				{ message: 'Missing content' },
				{ status: 400 }
			)
		}

		const errorId = randomUUID()
		const ua = req.headers.get('user-agent') ?? 'Unknown agent'

		console.error(`[error-report] ${errorId} - ${body.content}`)

		if (BOT_TOKEN && CHAT_ID) {
			const text = `❌ Client received client-side error:\n💼 Error ID: ${errorId}\n 🔗${body.content}\n\n👤 User agent: ${ua}`

			const emojiMap: { char: string; custom_emoji_id: string }[] = [
				{ char: '❌', custom_emoji_id: '5893081007153746175' },
				{ char: '💼', custom_emoji_id: '5893255507380014983' },
				{ char: '🔗', custom_emoji_id: '5902449142575141204' },
				{ char: '🔎', custom_emoji_id: '5902449142575141204' },
				{ char: '👤', custom_emoji_id: '5893382531037794941' },
			]

			const entities: TelegramEntity[] = []

			for (const e of emojiMap) {
				let startIndex = 0
				while (startIndex < text.length) {
					const idx = text.indexOf(e.char, startIndex)
					if (idx === -1) break

					let utf16Offset = 0
					for (let i = 0; i < idx; i++) {
						utf16Offset += text[i].length
					}

					entities.push({
						type: 'custom_emoji',
						offset: utf16Offset,
						length: [...e.char].join('').length,
						custom_emoji_id: e.custom_emoji_id,
					})

					startIndex = idx + 1
				}
			}

			try {
				await axios.post(
					`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
					{ chat_id: CHAT_ID, text, entities },
					{ timeout: 30000 }
				)
			} catch (_err: unknown) {
				console.error(
					`[error-report] Failed to send Telegram ${errorId}`
				)
			}
		}

		return NextResponse.json({ errorId })
	} catch (err) {
		console.error('Error in POST /api/error-report', err)
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 }
		)
	}
}
