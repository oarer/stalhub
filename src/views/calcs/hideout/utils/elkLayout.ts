import type { Edge, Node } from '@xyflow/react'
import ELK from 'elkjs/lib/elk.bundled.js'

const elk = new ELK()

const sizeMap = new Map<string, { width: number; height: number }>()

export const elkLayout = async (nodes: Node[], edges: Edge[]) => {
	const graph = {
		id: 'root',
		layoutOptions: {
			'elk.algorithm': 'layered',
			'elk.direction': 'DOWN',
			'elk.spacing.nodeNode': '80',
			'elk.layered.spacing.nodeNodeBetweenLayers': '160',
			'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
		},
		children: nodes.map((n) => {
			const size = sizeMap.get(n.id)

			return {
				id: n.id,
				width: size?.width ?? 320,
				height: (size?.height ?? 80) + 184,
			}
		}),
		edges: edges.map((e) => ({
			id: e.id,
			sources: [e.source],
			targets: [e.target],
		})),
	}

	const layout = await elk.layout(graph)

	return {
		nodes:
			layout.children?.map((n) => ({
				id: n.id,
				type: 'custom',
				position: { x: n.x ?? 0, y: n.y ?? 0 },

				width: n.width,
				height: n.height,

				data: {},
			})) ?? [],
		edges,
	}
}
