import Roadmap from '@/components/pages/roadMap/RoadMap'
import { unbounded } from '../fonts'

export default function RoadMapPage() {
    return (
        <main className="mx-auto flex flex-col gap-16 pt-40 pb-20">
            <h1
                className={`${unbounded.className} bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-center text-3xl font-bold tracking-tight text-balance text-transparent md:text-5xl dark:from-sky-400 dark:to-sky-200`}
            >
                Список задач <br />
                которые предстоит сделать
            </h1>
            <Roadmap />
        </main>
    )
}
