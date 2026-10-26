import { expect, test } from 'bun:test'
import { calculateRpu, formatRpu, rpuDefaults } from '@/views/calcs/rpu/utils/rpu'

test('base formula without donation and penalty: R = (t/2 * K) * 1/100', () => {
	expect(calculateRpu({ hours: 100, kd: 2, fi: 1, donate: 0 })).toBe(1)
})

test('penalty scales the base value linearly', () => {
	expect(calculateRpu({ hours: 100, kd: 2, fi: 2, donate: 0 })).toBe(2)
	expect(calculateRpu({ hours: 100, kd: 2, fi: 3, donate: 0 })).toBe(3)
})

test('donation divides the value', () => {
	expect(calculateRpu({ hours: 1000, kd: 2, fi: 1, donate: 1000 })).toBe(5)
})

test('zero hours or kd yields zero', () => {
	expect(calculateRpu({ hours: 0, kd: 2, fi: 1, donate: 0 })).toBe(0)
	expect(calculateRpu({ hours: 10, kd: 0, fi: 1, donate: 0 })).toBe(0)
})

test('defaults produce zero result', () => {
	expect(calculateRpu(rpuDefaults)).toBe(0)
})

test('formatRpu renders two decimals', () => {
	expect(formatRpu(1)).toBe('1.00')
	expect(formatRpu(0.1234)).toBe('0.12')
	expect(formatRpu(Number.NaN)).toBe('0.00')
})
