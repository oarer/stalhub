'use server'

import { serialize } from 'next-mdx-remote/serialize'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import {
	remarkCalloutContainers,
	remarkCallouts,
} from '@/lib/remark/callouts'

const HTML_TAGS = new Set([
	'a','abbr','address','area','article','aside','audio','b','base','bdi','bdo',
	'blockquote','body','br','button','canvas','caption','cite','code','col',
	'colgroup','data','datalist','dd','del','details','dfn','dialog','div','dl',
	'dt','em','embed','fieldset','figcaption','figure','footer','form','h1','h2',
	'h3','h4','h5','h6','head','header','hr','html','i','iframe','img','input',
	'ins','kbd','label','legend','li','link','main','map','mark','meta','meter',
	'nav','noscript','object','ol','optgroup','option','output','p','param',
	'picture','pre','progress','q','rp','rt','ruby','s','samp','script','section',
	'select','small','source','span','strong','style','sub','summary','sup',
	'table','tbody','td','template','textarea','tfoot','th','thead','time','title',
	'tr','track','u','ul','var','video','wbr',
])

export async function compileMdx(source: string) {
	const tagRegex = /<([a-z][a-z0-9-]*)[\s/>]/g
	let match
	while ((match = tagRegex.exec(source)) !== null) {
		if (!HTML_TAGS.has(match[1])) {
			throw new Error(`Unknown tag: <${match[1]}>`)
		}
	}

	const result = await serialize(source, {
		mdxOptions: {
			remarkPlugins: [
				remarkDirective,
				remarkCalloutContainers,
				remarkGfm,
				remarkBreaks,
				remarkCallouts,
			],
		},
		blockJS: true,
	})

	return {
		compiledSource: result.compiledSource,
		frontmatter: result.frontmatter,
	}
}
