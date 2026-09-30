import { motion, useScroll, useTransform, type Variants } from 'motion/react'
import { useRef, useState } from 'react'


const GEAR_PATH =
    'M431.971,165.836c-3.742-1.656-7.59-3.247-11.516-4.784c0.632-4.169,1.179-8.297,1.615-12.365c6.022-56.115-7.497-96.739-38.069-114.389c-30.568-17.65-72.51-9.047-118.098,24.225c-3.305,2.412-6.606,4.95-9.902,7.582c-3.295-2.632-6.596-5.169-9.902-7.582C200.51,25.251,158.569,16.647,128,34.299c-30.572,17.65-44.091,58.273-38.069,114.389c0.436,4.068,0.983,8.195,1.615,12.365c-3.927,1.537-7.775,3.128-11.516,4.784C28.422,188.679,0,220.699,0,256s28.422,67.321,80.029,90.164c3.742,1.656,7.59,3.247,11.516,4.784c-0.632,4.169-1.179,8.297-1.615,12.365c-6.022,56.115,7.497,96.739,38.069,114.389c10.384,5.996,22.076,8.961,34.781,8.961c24.698,0,53.216-11.215,83.317-33.185c3.305-2.412,6.606-4.95,9.902-7.582c3.295,2.632,6.596,5.169,9.902,7.582c30.106,21.973,58.617,33.185,83.317,33.185c12.702,0,24.4-2.966,34.781-8.961c30.572-17.65,44.091-58.273,38.069-114.389c-0.436-4.068-0.983-8.195-1.615-12.365c3.927-1.537,7.775-3.128,11.516-4.784C483.578,323.323,512,291.302,512,256S483.578,188.679,431.971,165.836z M349.24,58.816c6.867,0,12.955,1.45,18.065,4.4c18.714,10.804,26.531,43.004,20.905,87.101c-19.906-5.576-41.377-9.838-63.865-12.693c-13.716-18.048-28.143-34.512-42.926-48.963C307.134,69.092,330.958,58.816,349.24,58.816z M139.084,297.838c3.424,6.514,6.997,13.009,10.728,19.47c3.731,6.462,7.57,12.802,11.497,19.024c-11.02-2.195-21.463-4.75-31.284-7.601C132.465,318.802,135.474,308.481,139.084,297.838z M130.023,183.267c9.822-2.851,20.263-5.405,31.284-7.601c-3.927,6.222-7.766,12.563-11.497,19.024c-3.731,6.461-7.304,12.959-10.728,19.47C135.474,203.518,132.465,193.199,130.023,183.267z M155.724,256c6.628-14.568,14.274-29.492,23.004-44.613c8.728-15.117,17.826-29.206,27.126-42.227c15.932-1.544,32.682-2.385,50.146-2.385c17.46,0,34.208,0.84,50.138,2.384c9.302,13.024,18.403,27.107,27.134,42.228c8.731,15.121,16.376,30.046,23.004,44.613c-6.628,14.568-14.275,29.492-23.004,44.613c-8.731,15.121-17.832,29.204-27.134,42.228c-15.93,1.544-32.678,2.384-50.138,2.384s-34.208-0.84-50.138-2.384c-9.302-13.024-18.403-27.107-27.134-42.228C169.997,285.493,162.352,270.568,155.724,256z M350.692,175.668c11.02,2.195,21.463,4.75,31.284,7.601c-2.442,9.931-5.451,20.251-9.06,30.894c-3.424-6.512-6.997-13.008-10.727-19.47C358.458,188.229,354.619,181.889,350.692,175.668z M362.189,317.31c3.731-6.461,7.304-12.958,10.727-19.47c3.61,10.643,6.618,20.962,9.06,30.894c-9.822,2.85-20.263,5.405-31.284,7.601C354.619,330.112,358.458,323.771,362.189,317.31z M255.999,110.533c7.381,7.081,14.815,14.848,22.226,23.295c-7.352-0.289-14.763-0.444-22.225-0.444c-7.461,0-14.871,0.155-22.221,0.444C241.189,125.384,248.621,117.612,255.999,110.533z M144.696,63.216c18.714-10.805,50.509-1.476,85.886,25.444c-14.782,14.451-29.21,30.915-42.926,48.963c-22.488,2.855-43.96,7.117-63.865,12.693C118.165,106.219,125.982,74.02,144.696,63.216z M98.371,317.656C57.368,300.479,33.391,277.609,33.391,256s23.977-44.478,64.978-61.656c5.123,20.028,12.169,40.753,20.941,61.656C110.539,276.903,103.494,297.628,98.371,317.656z M144.696,448.785c-18.714-10.804-26.531-43.004-20.905-87.101c19.906,5.576,41.377,9.838,63.865,12.693c13.716,18.048,28.143,34.512,42.926,48.963C195.204,450.26,163.411,459.589,144.696,448.785z M256,401.466c-7.379-7.08-14.813-14.847-22.225-23.294c7.352,0.289,14.763,0.444,22.225,0.444c7.462,0,14.874-0.155,22.225-0.444C270.813,386.619,263.38,394.386,256,401.466z M367.304,448.785c-18.715,10.805-50.509,1.476-85.885-25.445c14.782-14.451,29.208-30.915,42.926-48.963c22.488-2.855,43.96-7.117,63.865-12.693C393.835,405.781,386.018,437.981,367.304,448.785z M413.63,317.656c-5.123-20.027-12.169-40.753-20.94-61.656c8.772-20.903,15.816-41.628,20.94-61.656c41.001,17.178,64.978,40.047,64.978,61.656S454.632,300.479,413.63,317.656z'

const GEAR_SEGMENTS: string[] = (() => {
    const parts = GEAR_PATH.split(/(?=M)/g)
        .map((s) => s.trim())
        .filter(Boolean)
    const merged: string[] = []
    for (const part of parts) {
        if (/^M/.test(part) || merged.length === 0) {
            merged.push(part)
        } else {
            merged[merged.length - 1] += ` ${part}`
        }
    }
    return merged
})()

const SEGMENT_STAGGER = 0.12
const WHISKER_LEN = 64

interface Whisker {
    x1: number
    y1: number
    x2: number
    y2: number
}

const PATH_NUM = /-?\d*\.?\d+(?:[eE][-+]?\d+)?/g

function parseFirstHandle(d: string): Whisker | null {
    const head = /^M([^A-Za-z]*)([A-Za-z])/.exec(d)
    if (!head) return null
    const start = (head[1].match(PATH_NUM) ?? []).map(Number)
    const cmd = head[2]
    if (start.length < 2 || !/[CcSs]/.test(cmd)) return null
    const nums = (d.slice(head[0].length).match(PATH_NUM) ?? []).map(Number)
    if (nums.length < 2) return null
    const rel = cmd === cmd.toLowerCase()
    const cx = rel ? start[0] + nums[0] : nums[0]
    const cy = rel ? start[1] + nums[1] : nums[1]

    const dx = cx - start[0]
    const dy = cy - start[1]
    const len = Math.hypot(dx, dy) || 1
    const k = WHISKER_LEN / len
    return {
        x1: start[0],
        y1: start[1],
        x2: start[0] + dx * k,
        y2: start[1] + dy * k,
    }
}

const GEAR_WHISKERS: Whisker[] = GEAR_SEGMENTS.map(parseFirstHandle).filter(
    (w): w is Whisker => w !== null
)

const segmentVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (order: number) => ({
        animationName: 'visible',
        pathLength: 1.02,
        opacity: 1,
        transition: {
            pathLength: {
                delay: 2.4 + order * SEGMENT_STAGGER,
                type: 'spring',
                duration: 1.8,
                bounce: 0,
            },
            opacity: { delay: 2.4 + order * SEGMENT_STAGGER, duration: 0.1 },
        },
    }),
    exit: {
        animationName: 'exit',
        pathLength: 1.02,
        opacity: 1,
        transition: {
            duration: 0.8,
        },
    },
}

const dotVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (order: number) => ({
        animationName: 'visible',
        pathLength: 1.02,
        opacity: 1,
        transition: {
            pathLength: {
                delay: 2.4 + order * SEGMENT_STAGGER,
                type: 'spring',
                duration: 1.8,
                bounce: 0,
            },
            opacity: { delay: 2.4 + order * SEGMENT_STAGGER, duration: 0.1 },
        },
    }),
    exit: {
        animationName: 'exit',
        pathLength: 1.02,
        opacity: 1,
        transition: {
            duration: 0.8,
        },
    },
}

// Слой заливки: единый контур целиком, чтобы сохранить evenodd-геометрию
// оригинала (при раздельной заливке сегментов отверстия перекроются).
const fillVariants: Variants = {
    hidden: { fillOpacity: 0 },
    visible: { fillOpacity: 0 },
    exit: {
        animationName: 'exit',
        fillOpacity: 1,
        transition: { duration: 0.8 },
    },
}

export default function LogoDrawAnimation() {
    const [drawAnimation, setDrawAnimation] = useState('visible')
    const [showHandles, setShowHandles] = useState(true)
    const drawnCount = useRef(0)
    const totalShapes = GEAR_SEGMENTS.length + 1

    const handleDrawComplete = (definition: string) => {
        if (definition === 'visible') {

            drawnCount.current += 1
            if (drawnCount.current >= totalShapes) {
                setDrawAnimation('exit')
            }
        }
        if (definition === 'exit') {
            setShowHandles(false)
        }
    }

    const { scrollYProgress } = useScroll()
    const fade = useTransform(scrollYProgress, [0, 0.125], [1, 0])

    return (
        <motion.div
            className="relative mx-auto h-64 w-64 sm:h-80 sm:w-80 md:h-90 md:w-90"
            style={{ opacity: fade }}
        >
            <div
                aria-hidden
                className="absolute inset-6 rounded-full bg-primary/25 blur-3xl dark:bg-primary/30"
            />

            <motion.div
                animate={{ opacity: 0.45 }}
                aria-hidden
                className="absolute top-1/2 left-1/2 h-[170%] w-[170%]"
                initial={{ opacity: 0 }}
                style={{
                    transform:
                        'translate(-50%, -50%) rotateX(-51deg) rotate(-43deg)',
                    backgroundImage:
                        'linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    maskImage:
                        'radial-gradient(circle at center, black 30%, transparent 75%)',
                    WebkitMaskImage:
                        'radial-gradient(circle at center, black 30%, transparent 75%)',
                }}
                transition={{ duration: 1, delay: 0.2 }}
            />

            <motion.div
                animate={{ y: [0, -10, 0] }}
                className="absolute inset-0 text-foreground dark:text-white"
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 3.5,
                }}
            >
                <motion.svg
                    className="h-full w-full overflow-visible"
                    fill="none"
                    style={{
                        transform: 'rotateX(-51deg) rotate(-43deg)',
                        transformStyle: 'preserve-3d',
                    }}
                    viewBox="0 0 512 512"
                >
                    <motion.g
                        animate={{ opacity: 1, rotate: 360 }}
                        initial={{ opacity: 0, rotate: 0 }}
                        style={{ originX: '50%', originY: '50%' }}
                        transition={{
                            opacity: { duration: 0.6 },
                            rotate: {
                                duration: 40,
                                repeat: Infinity,
                                ease: 'linear',
                            },
                        }}
                    >
                        <circle
                            cx="256"
                            cy="256"
                            fill="none"
                            r="238"
                            stroke="currentColor"
                            strokeDasharray="4 12"
                            strokeOpacity="0.3"
                            strokeWidth="2"
                        />
                    </motion.g>

                    <motion.g
                        animate={showHandles ? { opacity: 1 } : { opacity: 0 }}
                        initial={{ opacity: 1 }}
                        stroke="#fff"
                        strokeWidth="3"
                        transition={{ delay: 0, duration: 0.2 }}
                    >
                        <motion.path
                            animate={{ opacity: 1 }}
                            d={GEAR_PATH}
                            fill="none"
                            initial={{ opacity: 0 }}
                            strokeWidth="3"
                            transition={{ delay: 1.6, duration: 1.5 }}
                        />
                        {[
                            { cx: 256, cy: 18 },
                            { cx: 494, cy: 256 },
                            { cx: 256, cy: 494 },
                            { cx: 18, cy: 256 },
                            { cx: 256, cy: 256 },
                        ].map((p) => (
                            <motion.circle
                                animate={{ opacity: 1, scale: 1 }}
                                cx={p.cx}
                                cy={p.cy}
                                fill="#fff"
                                initial={{ opacity: 0, scale: 0.2 }}
                                key={`${p.cx}-${p.cy}`}
                                r="7"
                                stroke="var(--primary)"
                                strokeWidth="3"
                                style={{
                                    transformBox: 'fill-box',
                                    transformOrigin: 'center',
                                }}
                                transition={{ delay: 0, duration: 0.8 }}
                            />
                        ))}
                    </motion.g>

                    <motion.g
                        animate={showHandles ? { opacity: 1 } : { opacity: 0 }}
                        initial={{ opacity: 1 }}
                        stroke="currentColor"
                        strokeOpacity="0.55"
                        strokeWidth="3"
                        transition={{ delay: 0, duration: 0.6 }}
                    >
                        {GEAR_WHISKERS.map((w, index) => {
                            const delay = 0.2 + index * 0.07
                            return (
                                <g key={`${w.x1}-${w.y1}`}>
                                    <motion.line
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        fill="none"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        pathLength={1}
                                        transition={{
                                            pathLength: {
                                                delay,
                                                duration: 0.4,
                                                ease: 'easeOut',
                                            },
                                            opacity: { delay, duration: 0.1 },
                                        }}
                                        x1={w.x1}
                                        x2={w.x2}
                                        y1={w.y1}
                                        y2={w.y2}
                                    />
                                    <motion.circle
                                        animate={{ opacity: 1, scale: 1 }}
                                        cx={w.x2}
                                        cy={w.y2}
                                        fill="var(--background)"
                                        initial={{ opacity: 0, scale: 0.2 }}
                                        r="7"
                                        style={{
                                            transformBox: 'fill-box',
                                            transformOrigin: 'center',
                                        }}
                                        transition={{
                                            delay: delay + 0.35,
                                            duration: 0.25,
                                        }}
                                    />
                                </g>
                            )
                        })}
                    </motion.g>

                    <motion.g
                        animate={drawAnimation}
                        initial="hidden"
                        variants={fillVariants}
                    >
                        <path
                            d={GEAR_PATH}
                            fill="currentColor"
                            fillRule="evenodd"
                            stroke="none"
                        />
                        <circle
                            cx="256"
                            cy="256"
                            fill="currentColor"
                            r="37.625"
                            stroke="none"
                        />
                    </motion.g>

                    {GEAR_SEGMENTS.map((d, index) => (
                        <motion.path
                            animate={drawAnimation}
                            custom={index}
                            d={d}
                            fill="none"
                            initial="hidden"
                            key={index}
                            onAnimationComplete={handleDrawComplete}
                            pathLength={1}
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="8"
                            variants={segmentVariants}
                        />
                    ))}

                    <motion.circle
                        animate={drawAnimation}
                        custom={GEAR_SEGMENTS.length}
                        cx="256"
                        cy="256"
                        fill="none"
                        initial="hidden"
                        onAnimationComplete={handleDrawComplete}
                        pathLength={1}
                        r="37.625"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="10"
                        variants={dotVariants}
                    />
                </motion.svg>
            </motion.div>
        </motion.div>
    )
}