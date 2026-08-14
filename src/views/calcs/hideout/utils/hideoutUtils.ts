export function normalizeItemId(itemId: string): string {
	return itemId.split('/').pop()?.replace('.json', '') ?? itemId
}



