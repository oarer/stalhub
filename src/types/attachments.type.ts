import type { Item } from './item.type'

export type WeaponAttachmentsResponse = {
	weapon: Item
	total: number
	attachments: Item[]
}
