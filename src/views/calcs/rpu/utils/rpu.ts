export type RpuInput = {
	hours: number
	kd: number
	fi: number
	donate: number
}

export const rpuDefaults: RpuInput = {
	hours: 0,
	kd: 0,
	fi: 1,
	donate: 0,
}

export const FI_MIN = 1
export const FI_MAX = 3

export function calculateRpu({ hours, kd, fi, donate }: RpuInput): number {
	return ((hours / 2) * kd * fi) / (1 + donate / 1000) / 100
}

export function formatRpu(value: number): string {
	if (!Number.isFinite(value)) return '0.00'
	return value.toFixed(2)
}
