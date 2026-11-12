export type PromMetricType =
	| 'counter'
	| 'gauge'
	| 'histogram'
	| 'summary'
	| 'untyped'

export interface PromSample {
	labels: Record<string, string>
	value: number
}

export interface PromMetricFamily {
	name: string
	type: PromMetricType
	help: string
	samples: PromSample[]
}

const NAME_RE = /^[a-zA-Z_:][a-zA-Z0-9_:]*$/
const LABEL_NAME_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/
const VALUE_RE = /^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/
const SUFFIXES = ['_bucket', '_sum', '_count'] as const

const PROM_TYPES: readonly PromMetricType[] = [
	'counter',
	'gauge',
	'histogram',
	'summary',
	'untyped',
]

function unescapeLabelValue(raw: string): string {
	let out = ''
	for (let i = 0; i < raw.length; i++) {
		const char = raw[i]
		if (char !== '\\') {
			out += char
			continue
		}
		const next = raw[i + 1]
		if (next === 'n') {
			out += '\n'
			i++
		} else if (next === '\\') {
			out += '\\'
			i++
		} else if (next === '"') {
			out += '"'
			i++
		} else {
			out += char
		}
	}
	return out
}

function unescapeHelp(raw: string): string {
	let out = ''
	for (let i = 0; i < raw.length; i++) {
		const char = raw[i]
		if (char !== '\\') {
			out += char
			continue
		}
		const next = raw[i + 1]
		if (next === 'n') {
			out += '\n'
			i++
		} else if (next === '\\') {
			out += '\\'
			i++
		} else {
			out += char
		}
	}
	return out
}

function parseLabels(
	line: string,
	start: number
): { labels: Record<string, string>; end: number } | null {
	const labels: Record<string, string> = {}
	let i = start

	for (;;) {
		while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i++
		if (i >= line.length) return null
		if (line[i] === '}') return { labels, end: i + 1 }

		const nameStart = i
		while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) i++
		const labelName = line.slice(nameStart, i)
		if (!LABEL_NAME_RE.test(labelName)) return null

		while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i++
		if (line[i] !== '=') return null
		i++
		while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i++
		if (line[i] !== '"') return null
		i++

		let rawValue = ''
		let closed = false
		while (i < line.length) {
			const char = line[i]
			if (char === '\\') {
				rawValue += char
				if (i + 1 < line.length) {
					rawValue += line[i + 1]
					i += 2
				} else {
					i++
				}
				continue
			}
			if (char === '"') {
				closed = true
				i++
				break
			}
			rawValue += char
			i++
		}
		if (!closed) return null
		labels[labelName] = unescapeLabelValue(rawValue)

		while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i++
		if (line[i] === '}') return { labels, end: i + 1 }
		if (line[i] !== ',') return null
		i++
	}
}

function parseValue(token: string): number | null {
	if (/^[+-]?inf(inity)?$/i.test(token)) {
		return token.startsWith('-')
			? Number.NEGATIVE_INFINITY
			: Number.POSITIVE_INFINITY
	}
	if (/^nan$/i.test(token)) return Number.NaN
	if (VALUE_RE.test(token)) return Number(token)
	return null
}

function parseSampleLine(
	line: string
): { name: string; sample: PromSample } | null {
	let i = 0
	while (i < line.length && /[a-zA-Z0-9_:]/.test(line[i])) i++
	const name = line.slice(0, i)
	if (!NAME_RE.test(name)) return null

	let labels: Record<string, string> = {}
	if (line[i] === '{') {
		const parsedLabels = parseLabels(line, i + 1)
		if (!parsedLabels) return null
		labels = parsedLabels.labels
		i = parsedLabels.end
	}

	while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i++
	const valueStart = i
	while (i < line.length && line[i] !== ' ' && line[i] !== '\t') i++
	if (valueStart === i) return null
	const value = parseValue(line.slice(valueStart, i))
	if (value === null) return null

	return { name, sample: { labels, value } }
}

export function parsePrometheus(text: string): PromMetricFamily[] {
	const helpMap = new Map<string, string>()
	const typeMap = new Map<string, PromMetricType>()
	const parsed: { name: string; sample: PromSample }[] = []

	for (const rawLine of text.split('\n')) {
		const line = rawLine.replace(/\r$/, '')
		if (!line.trim()) continue

		if (line.startsWith('#')) {
			const comment = line.slice(1).trimStart()
			if (comment.startsWith('HELP ') || comment.startsWith('TYPE ')) {
				const isType = comment.startsWith('TYPE ')
				const rest = comment.slice(5)
				const spaceIndex = rest.indexOf(' ')
				const name =
					spaceIndex === -1 ? rest : rest.slice(0, spaceIndex)
				if (NAME_RE.test(name)) {
					if (isType) {
						const typeToken =
							spaceIndex === -1
								? ''
								: rest.slice(spaceIndex + 1).trim()
						if (PROM_TYPES.includes(typeToken as PromMetricType)) {
							typeMap.set(name, typeToken as PromMetricType)
						}
					} else {
						helpMap.set(
							name,
							spaceIndex === -1
								? ''
								: unescapeHelp(rest.slice(spaceIndex + 1))
						)
					}
				}
			}
			continue
		}

		const parsedLine = parseSampleLine(line)
		if (parsedLine) parsed.push(parsedLine)
	}

	const sampleNames = new Set(parsed.map((entry) => entry.name))

	const resolveFamily = (name: string): string => {
		if (typeMap.has(name)) return name
		for (const suffix of SUFFIXES) {
			if (!name.endsWith(suffix)) continue
			const base = name.slice(0, -suffix.length)
			if (!base) break
			const baseType = typeMap.get(base)
			if (baseType === 'histogram' || baseType === 'summary') return base
			if (
				!typeMap.has(base) &&
				(helpMap.has(base) || sampleNames.has(base))
			) {
				return base
			}
		}
		return name
	}

	const families = new Map<string, PromSample[]>()
	for (const { name, sample } of parsed) {
		const familyName = resolveFamily(name)
		let samples = families.get(familyName)
		if (!samples) {
			samples = []
			families.set(familyName, samples)
		}
		samples.push(sample)
	}

	return Array.from(families, ([name, samples]) => ({
		name,
		type: typeMap.get(name) ?? 'untyped',
		help: helpMap.get(name) ?? '',
		samples,
	}))
}
