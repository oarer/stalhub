'use client'

import { useSearchParams } from 'next/navigation'
import {
	createContext,
	type Dispatch,
	type RefObject,
	type SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'

import { findGameAssets, type GameFolder } from './local-folder'

import Map3DHeader from './Map3DHeader'
import Map3DSetupPanel from './Map3DSetupPanel'
import {
	type Preparation,
	type PreparationTraffic,
	preparationComplete,
	sumPreparationTraffic,
} from './preparation'
import { readSource, resumeSource, saveSource } from './saved-source'
import {
	DEFAULT_EDITOR_SETTINGS,
	type EditorSettings,
	readEditorSettings,
	TEXTURE_SIZE,
} from './settings'

export type Map3DController = {
	catalog: { slug: string; map?: string | null }[]
	instance: string
	setInstance: Dispatch<SetStateAction<string>>
	setReady: Dispatch<SetStateAction<boolean>>
	coordinates: string[]
	setCoordinates: Dispatch<SetStateAction<string[]>>
	autoHeight: boolean
	setAutoHeight: Dispatch<SetStateAction<boolean>>
	folder: GameFolder | undefined
	setFolder: Dispatch<SetStateAction<GameFolder | undefined>>
	picking: boolean
	folderPicked: () => Promise<void>
	fileInput: RefObject<HTMLInputElement | null>
	settings: EditorSettings
	change: <K extends keyof EditorSettings>(
		key: K,
		value: EditorSettings[K]
	) => void
	ready: boolean
	preparing: boolean
	preparation:
		| { value: Record<string, unknown>; revision: number }
		| undefined
	sceneWarm: Preparation | undefined
	previousTraffic: RefObject<PreparationTraffic>
	parentTraffic: RefObject<PreparationTraffic>
	folderHint: string
	error: string
	setError: Dispatch<SetStateAction<string>>
	launch: () => void
	gecko: boolean
}

export const Map3DContext = createContext<Map3DController | null>(null)

import { mapFetch } from '../../../../engine/src/world/static-source.ts'

const KEY = 'stalhub/map3d/settings-v1'
export default function Map3DView() {
	const query = useSearchParams(),
		frame = useRef<HTMLIFrameElement>(null),
		fileInput = useRef<HTMLInputElement>(null)
	const [settings, setSettings] = useState<EditorSettings>(
		DEFAULT_EDITOR_SETTINGS
	)
	const [gecko] = useState(
		() =>
			typeof navigator !== 'undefined' &&
			/Gecko\/\d/.test(navigator.userAgent) &&
			!/like Gecko/i.test(navigator.userAgent)
	)
	const [coordinates, setCoordinates] = useState([
		query.get('x') ?? '-9947.30',
		query.get('y') ?? '90.00',
		query.get('z') ?? '3025.27',
	])
	const [autoHeight, setAutoHeight] = useState(!query.has('y'))
	const [instance, setInstance] = useState(query.get('instance') ?? '05.09'),
		[catalog, setCatalog] = useState<
			{ slug: string; map?: string | null }[]
		>([])
	const [setup, setSetup] = useState(true),
		[ready, setReady] = useState(false),
		[running, setRunning] = useState(false)
	const [folder, setFolder] = useState<GameFolder>(),
		[picking, setPicking] = useState(false),
		[error, setError] = useState(''),
		[status, setStatus] = useState('Подготавливаем карту…'),
		[generation, setGeneration] = useState(0),
		[exporting, setExporting] = useState(false)
	const currentTraffic = useRef<Preparation['network'] | undefined>(
			undefined
		),
		previousTraffic = useRef(sumPreparationTraffic()),
		parentTraffic = useRef(sumPreparationTraffic()),
		completedAt = useRef<number | undefined>(undefined)
	const [sceneWarm, setSceneWarm] = useState<Preparation>()
	const [preparation, setPreparation] = useState<{
		value: Record<string, unknown>
		revision: number
	}>()
	const [preparing, setPreparing] = useState(true)
	const [resume, setResume] = useState(false),
		[folderHint, setFolderHint] = useState('')
	const change = <K extends keyof EditorSettings>(
		key: K,
		value: EditorSettings[K]
	) => setSettings((s) => ({ ...s, [key]: value }))
	useEffect(() => {
		try {
			if (
				'crossOriginIsolated' in window &&
				!window.crossOriginIsolated &&
				!sessionStorage.getItem('stalhub/map3d/isolation-reload')
			) {
				sessionStorage.setItem('stalhub/map3d/isolation-reload', '1')
				location.reload()
				return
			}
		} catch {
			/* Storage can be unavailable in privacy mode. */
		}
		const abort = new AbortController()
		try {
			const stored = readEditorSettings(localStorage.getItem(KEY))
			if (stored) {
				setSettings(stored)
				void readSource()
					.then(resumeSource)
					.then((source) => {
						if (abort.signal.aborted) return
						if (source.folder) setFolder(source.folder)
						if (source.canResume && !query.has('settings'))
							setResume(true)
						else if (!source.canResume)
							setFolderHint(
								'Для доступа к локальным ресурсам выберите папку игры ещё раз. Можно продолжить с серверными ассетами.'
							)
					})
					.catch(() => undefined)
			}
		} catch {
			/* Storage can be unavailable in privacy mode. */
		}
		void mapFetch('/api/map3d/instances', { signal: abort.signal })
			.then((r) => {
				if (!r.ok) throw Error('Не удалось подключиться к карте.')
				return r.json()
			})
			.then((rows) => {
				setCatalog(rows)
				if (rows.length)
					setInstance((current) =>
						rows.some((r: { slug: string }) => r.slug === current)
							? current
							: rows[0].slug
					)
			})
			.catch((e) => {
				if (!abort.signal.aborted) setError(e.message)
			})
		return () => abort.abort()
	}, [query.has])
	useEffect(() => {
		const sendTheme = () => {
			const style = getComputedStyle(document.documentElement),
				theme = Object.fromEntries(
					[
						'background',
						'background-accent',
						'card',
						'foreground',
						'primary',
						'primary-foreground',
						'border-secondary',
						'muted-foreground',
					].map((k) => [`--${k}`, style.getPropertyValue(`--${k}`)])
				)
			frame.current?.contentWindow?.postMessage(
				{ source: 'stalhub-site', kind: 'theme', value: theme },
				location.origin
			)
		}
		const trafficObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				const r = entry as PerformanceResourceTiming,
					path = new URL(r.name, location.href).pathname
				if (
					!path.startsWith('/api/map3d/') &&
					!path.includes('/files/')
				)
					continue
				const key = path.includes('/tile/') ? 'map' : 'metadata',
					n = parentTraffic.current
				let g = n.groups[key]
				if (!g) {
					g = { requests: 0, transferBytes: 0 }
					n.groups[key] = g
				}
				n.requests++
				g.requests++
				n.transferBytes += r.transferSize
				g.transferBytes += r.transferSize
				if (!r.transferSize && r.encodedBodySize) n.httpCacheHits++
			}
		})
		trafficObserver.observe({ type: 'resource', buffered: true })
		const observer = new MutationObserver(sendTheme)
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class', 'data-theme', 'style'],
		})
		const listener = (e: MessageEvent) => {
			if (
				e.origin !== location.origin ||
				e.source !== frame.current?.contentWindow ||
				e.data?.source !== 'stalhub-map3d'
			)
				return
			if (e.data.kind === 'ready') {
				setReady(true)
				sendTheme()
			}
			if (e.data.kind === 'settings') {
				const snapshot = e.data.value
				if (
					Array.isArray(snapshot?.view?.position) &&
					snapshot.view.position.length === 3 &&
					snapshot.view.position.every(
						(v: unknown) =>
							typeof v === 'number' && Number.isFinite(v)
					)
				) {
					setCoordinates(snapshot.view.position.map(String))
					setAutoHeight(false)
				}
				if (typeof snapshot?.instance === 'string' && snapshot.instance)
					setInstance(snapshot.instance)
				setResume(false)
				setExporting(false)
				setRunning(false)
				setSetup(true)
				setReady(false)
				setGeneration((g) => g + 1)
			}
			if (e.data.kind === 'export') {
				setExporting(true)
				setStatus('Экспорт участка карты')
			}
			if (e.data.kind === 'scene-warm') {
				const incoming = e.data.value as Preparation
				currentTraffic.current = incoming.network
				if (preparationComplete(incoming))
					completedAt.current ??= incoming.elapsedMs
				setSceneWarm({
					...incoming,
					elapsedMs: completedAt.current ?? incoming.elapsedMs,
					network: sumPreparationTraffic(
						previousTraffic.current,
						parentTraffic.current,
						incoming.network
					),
				})
			}
			if (e.data.kind === 'status') setStatus(e.data.value)
			if (e.data.kind === 'error') setError(e.data.value)
		}
		window.addEventListener('message', listener)
		return () => {
			trafficObserver.disconnect()
			observer.disconnect()
			window.removeEventListener('message', listener)
		}
	}, [])
	useEffect(() => {
		if (!setup) return
		setPreparing(true)
		const timer = setTimeout(() => {
			const position = coordinates.map((v) =>
				Number(v.trim().replace(',', '.'))
			)
			if (
				coordinates.some((v) => !v.trim()) ||
				position.some(
					(v) => !Number.isFinite(v) || Math.abs(v) > 30000000
				)
			) {
				setError('Введите корректные координаты точки появления.')
				setPreparing(false)
				return
			}
			previousTraffic.current = sumPreparationTraffic(
				previousTraffic.current,
				currentTraffic.current
			)
			currentTraffic.current = undefined
			completedAt.current = undefined
			setError('')
			setReady(false)
			setSceneWarm(undefined)
			setPreparation((p) => ({
				revision: (p?.revision ?? 0) + 1,
				value: {
					instance,
					view: {
						sequence: 1,
						position,
						yaw: 0,
						pitch: -0.2,
						fov: 70,
					},
					quality: settings.graphics,
					radius: settings.distance,
					textureSize: Math.max(
						TEXTURE_SIZE[settings.blocks],
						TEXTURE_SIZE[settings.objects]
					),
					blockTextureSize: TEXTURE_SIZE[settings.blocks],
					objectTextureSize: TEXTURE_SIZE[settings.objects],
					cacheMB: settings.cacheMB,
					localAssets: folder,
					autoHeight,
				},
			}))
			setPreparing(false)
		}, 800)
		return () => clearTimeout(timer)
	}, [setup, instance, coordinates, settings, folder, autoHeight])
	useEffect(() => {
		if (ready && preparation && setup && !preparing)
			frame.current?.contentWindow?.postMessage(
				{
					source: 'stalhub-site',
					kind: 'prepare',
					value: preparation.value,
				},
				location.origin
			)
	}, [ready, preparation, setup, preparing])
	const folderPicked = async () => {
		setError('')
		setPicking(true)
		try {
			const picker = (
				window as unknown as {
					showDirectoryPicker?: (o: {
						mode: 'read'
					}) => Promise<FileSystemDirectoryHandle>
				}
			).showDirectoryPicker
			if (!picker) {
				fileInput.current?.click()
				return
			}
			setFolder(
				await findGameAssets(
					await picker.call(window, { mode: 'read' })
				)
			)
		} catch (e) {
			if ((e as Error).name !== 'AbortError')
				setError((e as Error).message)
		} finally {
			setPicking(false)
		}
	}
	const launch = useCallback(() => {
		const position = coordinates.map((v) =>
			Number(v.trim().replace(',', '.'))
		)
		if (!ready || preparing || !preparation) return
		if (
			coordinates.some((v) => !v.trim()) ||
			position.some((v) => !Number.isFinite(v) || Math.abs(v) > 30000000)
		) {
			setError('Введите корректные координаты точки появления.')
			return
		}
		if (!('gpu' in navigator)) {
			setError(
				'Для 3D нужен браузер с поддержкой WebGPU. Откройте карту в актуальном Chrome или Edge.'
			)
			return
		}
		try {
			localStorage.setItem(KEY, JSON.stringify(settings))
		} catch {
			/* Storage can be unavailable in privacy mode. */
		}
		void saveSource(folder).catch(() => undefined)
		setError('')
		setSetup(false)
		setRunning(true)
		requestAnimationFrame(() =>
			frame.current?.contentWindow?.postMessage(
				{ source: 'stalhub-site', kind: 'enter' },
				location.origin
			)
		)
	}, [coordinates, ready, preparing, preparation, settings, folder])
	useEffect(() => {
		if (ready && !preparing && preparation && resume && setup && !running) {
			setResume(false)
			launch()
		}
	}, [ready, preparing, preparation, resume, setup, running, launch])
	const reset = () => {
		if (!exporting) {
			frame.current?.contentWindow?.postMessage(
				{ source: 'stalhub-site', kind: 'settings' },
				location.origin
			)
			return
		}
		setResume(false)
		setExporting(false)
		setRunning(false)
		setSetup(true)
		setReady(false)
		setGeneration((g) => g + 1)
	}
	const controller = {
		catalog,
		instance,
		setInstance,
		setReady,
		coordinates,
		setCoordinates,
		autoHeight,
		setAutoHeight,
		folder,
		setFolder,
		picking,
		folderPicked,
		fileInput,
		settings,
		change,
		ready,
		preparing,
		preparation,
		sceneWarm,
		previousTraffic,
		parentTraffic,
		folderHint,
		error,
		setError,
		launch,
		gecko,
	}
	return (
		<Map3DContext.Provider value={controller}>
			<section className="pt-34">
				<div className="mx-auto flex max-w-355 items-center justify-center pb-6">
					<Map3DHeader
						exporting={exporting}
						onReset={reset}
						running={running}
						status={status}
					/>
				</div>
				<iframe
					allow="fullscreen"
					className={`block h-[calc(100dvh-164px)] w-full border-0 ${
						setup
							? 'pointer-events-none invisible absolute inset-x-0 top-41 bottom-0 opacity-0'
							: ''
					}`}
					key={`${instance}-${generation}-${preparation?.revision ?? 0}`}
					ref={frame}
					src={`/map3d-engine/index.html#instance=${encodeURIComponent(instance)}`}
					title="3D-карта STALCRAFT"
				/>
				{setup && <Map3DSetupPanel />}
			</section>
		</Map3DContext.Provider>
	)
}
