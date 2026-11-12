import { describe, expect, test } from 'bun:test'

import { parsePrometheus } from '@/lib/prometheus'

const REALISTIC_EXPOSITION = `# HELP http_requests_total Total number of HTTP requests processed.
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/health",status="200"} 42
http_requests_total{method="POST",route="/api/v1/auth/login",status="200"} 1337
http_requests_total{method="POST",route="/api/v1/auth/login",status="401"} 7
# HELP uno_upstream_requests_total Requests forwarded to the uno upstream service.
# TYPE uno_upstream_requests_total counter
uno_upstream_requests_total{upstream="game",code="200"} 9815
uno_upstream_requests_total{upstream="game",code="502"} 3
# HELP uno_build_info Build metadata about the stalhub backend.
# TYPE uno_build_info gauge
uno_build_info{version="1.4.2",commit="a1b2c3d"} 1
# HELP http_request_duration_seconds HTTP request latency in seconds.
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",le="0.01"} 24054
http_request_duration_seconds_bucket{method="GET",le="0.1"} 33444
http_request_duration_seconds_bucket{method="GET",le="+Inf"} 34444
http_request_duration_seconds_sum{method="GET"} 542.23
http_request_duration_seconds_count{method="GET"} 34444
# HELP uno_queue_latency_seconds Time jobs spend waiting in the queue.
# TYPE uno_queue_latency_seconds summary
uno_queue_latency_seconds{quantile="0.5"} 0.05
uno_queue_latency_seconds{quantile="0.9"} 0.31
uno_queue_latency_seconds_sum 1274.5
uno_queue_latency_seconds_count 25301
# HELP uno_last_scrape_error Whether the last scrape failed (1 for error).
uno_last_scrape_error 0
# HELP uno_stale_jobs_number_of_jobs Number of stale jobs at last scrape.
uno_stale_jobs_number_of_jobs 12 1700000000000
`

describe('parsePrometheus', () => {
	test('parses counters with and without labels', () => {
		const families = parsePrometheus(REALISTIC_EXPOSITION)
		const counters = families.filter((f) => f.type === 'counter')

		expect(counters).toHaveLength(2)
		expect(counters[0].name).toBe('http_requests_total')
		expect(counters[0].help).toBe(
			'Total number of HTTP requests processed.'
		)
		expect(counters[0].samples).toHaveLength(3)
		expect(counters[0].samples[0].labels).toEqual({
			method: 'GET',
			route: '/health',
			status: '200',
		})
		expect(counters[0].samples[0].value).toBe(42)
		expect(counters[0].samples[2].value).toBe(7)

		expect(counters[1].name).toBe('uno_upstream_requests_total')
		expect(counters[1].samples[0].labels).toEqual({
			upstream: 'game',
			code: '200',
		})
	})

	test('parses gauges without labels', () => {
		const families = parsePrometheus(REALISTIC_EXPOSITION)
		const buildInfo = families.find((f) => f.name === 'uno_build_info')

		expect(buildInfo?.type).toBe('gauge')
		expect(buildInfo?.samples).toHaveLength(1)
		expect(buildInfo?.samples[0].labels).toEqual({
			version: '1.4.2',
			commit: 'a1b2c3d',
		})
		expect(buildInfo?.samples[0].value).toBe(1)
	})

	test('groups histogram samples under the base family name', () => {
		const families = parsePrometheus(REALISTIC_EXPOSITION)
		const histogram = families.find(
			(f) => f.name === 'http_request_duration_seconds'
		)

		expect(histogram).toBeDefined()
		expect(histogram?.type).toBe('histogram')
		expect(histogram?.help).toBe('HTTP request latency in seconds.')
		expect(histogram?.samples).toHaveLength(5)

		const buckets = histogram?.samples.filter((s) => 'le' in s.labels)
		expect(buckets).toHaveLength(3)
		expect(buckets?.map((b) => b.labels.le)).toEqual([
			'0.01',
			'0.1',
			'+Inf',
		])
		expect(buckets?.map((b) => b.value)).toEqual([24054, 33444, 34444])

		expect(histogram?.samples[3]).toEqual({
			labels: { method: 'GET' },
			value: 542.23,
		})
		expect(histogram?.samples[4]).toEqual({
			labels: { method: 'GET' },
			value: 34444,
		})
	})

	test('groups summary samples under the base family name', () => {
		const families = parsePrometheus(REALISTIC_EXPOSITION)
		const summary = families.find(
			(f) => f.name === 'uno_queue_latency_seconds'
		)

		expect(summary?.type).toBe('summary')
		expect(summary?.samples).toHaveLength(4)
		expect(summary?.samples[0].labels).toEqual({ quantile: '0.5' })
		expect(summary?.samples[2].labels).toEqual({})
		expect(summary?.samples[2].value).toBe(1274.5)
		expect(summary?.samples[3].value).toBe(25301)
	})

	test('defaults to untyped when TYPE is missing', () => {
		const families = parsePrometheus(REALISTIC_EXPOSITION)
		const untyped = families.find((f) => f.name === 'uno_last_scrape_error')

		expect(untyped?.type).toBe('untyped')
		expect(untyped?.help).toBe(
			'Whether the last scrape failed (1 for error).'
		)
		expect(untyped?.samples).toEqual([{ labels: {}, value: 0 }])
	})

	test('ignores the timestamp suffix after the value', () => {
		const families = parsePrometheus(REALISTIC_EXPOSITION)
		const stale = families.find(
			(f) => f.name === 'uno_stale_jobs_number_of_jobs'
		)

		expect(stale?.samples).toEqual([{ labels: {}, value: 12 }])
	})

	test('handles TYPE line appearing after the samples', () => {
		const text = [
			'# HELP job_duration_seconds Duration of jobs.',
			'job_duration_seconds_bucket{le="1"} 5',
			'job_duration_seconds_bucket{le="+Inf"} 8',
			'job_duration_seconds_sum 9.5',
			'job_duration_seconds_count 8',
			'# TYPE job_duration_seconds histogram',
		].join('\n')

		const families = parsePrometheus(text)
		expect(families).toHaveLength(1)
		expect(families[0].name).toBe('job_duration_seconds')
		expect(families[0].type).toBe('histogram')
		expect(families[0].samples).toHaveLength(4)
	})

	test('handles families whose TYPE is declared late for a bare sample', () => {
		const text = [
			'requests 3',
			'requests_total 9',
			'# TYPE requests gauge',
		].join('\n')

		const families = parsePrometheus(text)
		expect(families).toHaveLength(2)
		expect(families[0]).toMatchObject({ name: 'requests', type: 'gauge' })
		expect(families[1]).toMatchObject({
			name: 'requests_total',
			type: 'untyped',
		})
	})

	test('unescapes backslash, quote and newline in label values', () => {
		const text = [
			'# TYPE weird_labels gauge',
			'weird_labels{reason="quote \\" and \\\\ slash",msg="line1\\nline2"} 1',
		].join('\n')

		const families = parsePrometheus(text)
		expect(families[0].samples[0].labels).toEqual({
			reason: 'quote " and \\ slash',
			msg: 'line1\nline2',
		})
	})

	test('unescapes newlines and backslashes in HELP text', () => {
		const text = [
			'# HELP multiline_help Has a line break\\nand a \\\\ backslash.',
			'multiline_help 1',
		].join('\n')

		const families = parsePrometheus(text)
		expect(families[0].help).toBe('Has a line break\nand a \\ backslash.')
	})

	test('parses NaN and positive/negative infinity values', () => {
		const text = [
			'# TYPE weird_values gauge',
			'weird_values{kind="nan"} NaN',
			'weird_values{kind="pos_inf"} +Inf',
			'weird_values{kind="neg_inf"} -Inf',
			'weird_values{kind="inf"} Inf',
		].join('\n')

		const families = parsePrometheus(text)
		const values = families[0].samples.map((s) => s.value)

		expect(values[0]).toBeNaN()
		expect(values[1]).toBe(Number.POSITIVE_INFINITY)
		expect(values[2]).toBe(Number.NEGATIVE_INFINITY)
		expect(values[3]).toBe(Number.POSITIVE_INFINITY)
	})

	test('parses scientific notation and negative values', () => {
		const text = [
			'# TYPE scientific gauge',
			'scientific{exp="positive"} 1.5e-4',
			'scientific{exp="negative"} -2.5E+3',
			'scientific{decimal=".5"} .5',
		].join('\n')

		const families = parsePrometheus(text)
		expect(families[0].samples.map((s) => s.value)).toEqual([
			0.00015, -2500, 0.5,
		])
	})

	test('skips malformed lines gracefully', () => {
		const text = [
			'# TYPE good gauge',
			'not a metric line',
			'good{broken="value 1',
			'good{missing_equals"v"} 1',
			'good{= "v"} 1',
			'1good 1',
			'good not_a_number',
			'',
			'   ',
			'# a plain comment',
			'good 5',
		].join('\n')

		const families = parsePrometheus(text)
		expect(families).toHaveLength(1)
		expect(families[0].name).toBe('good')
		expect(families[0].samples).toEqual([{ labels: {}, value: 5 }])
	})

	test('keeps families in first-appearance order and handles empty input', () => {
		const families = parsePrometheus(REALISTIC_EXPOSITION)
		expect(families.map((f) => f.name)).toEqual([
			'http_requests_total',
			'uno_upstream_requests_total',
			'uno_build_info',
			'http_request_duration_seconds',
			'uno_queue_latency_seconds',
			'uno_last_scrape_error',
			'uno_stale_jobs_number_of_jobs',
		])

		expect(parsePrometheus('')).toEqual([])
		expect(parsePrometheus('# HELP nothing Just a header.')).toEqual([])
	})
})
