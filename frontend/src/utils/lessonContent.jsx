import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Lessons are stored either as HTML (written in the rich text editor) or as
// Markdown (seeded content, or text pasted before paste conversion existed).

const MARKDOWN_PATTERNS = [
    /^#{1,6}\s/m,          // # Heading
    /\*\*[^*\n]+\*\*/,     // **bold**
    /^\s*[-*+]\s/m,        // - list item
    /^\s*\d+\.\s/m,        // 1. list item
    /^```/m,               // code fence
    /^---\s*$/m,           // divider
    /^\|.+\|\s*$/m,        // | table |
    /^>\s/m,               // > quote
]

export const looksLikeMarkdown = (text) =>
    Boolean(text) && MARKDOWN_PATTERNS.some(re => re.test(text))

// Tags that carry real formatting; HTML using any of them is genuine rich text
const RICH_TAGS = /<(h[1-6]|ul|ol|li|strong|b|em|i|u|table|a|blockquote|pre|code|img)\b/i

/**
 * Clipboard HTML with real formatting (copied from a web page or a document)
 * should be pasted as is. Editors such as VS Code also put HTML on the
 * clipboard, but only styled spans and line breaks around the Markdown text.
 */
export const hasRichFormatting = (html) => Boolean(html) && RICH_TAGS.test(html)

const PLAIN_TAGS = new Set(['P', 'DIV', 'BR', 'SPAN'])

/**
 * Recovers the Markdown source from HTML made only of plain paragraphs, the
 * shape the editor produced when Markdown was pasted into it as text
 * (one <p> per line, <p><br></p> for blank lines). Returns null for any
 * other HTML.
 */
const plainParagraphsToText = (html) => {
    const body = new DOMParser().parseFromString(html, 'text/html').body
    if ([...body.querySelectorAll('*')].some(el => !PLAIN_TAGS.has(el.tagName))) return null

    return [...body.childNodes]
        .map(node => {
            // contentEditable stores spaces as &nbsp; to keep them; restore them
            const text = node.textContent.replace(/\u00a0/g, ' ')
            return text.trim() ? text.trimEnd() : ''
        })
        .join('\n')
}

/** The Markdown to render for a lesson, or null when it should render as HTML. */
export const lessonMarkdown = (content) => {
    if (!content) return null
    if (!/^\s*</.test(content)) return looksLikeMarkdown(content) ? content : null

    const text = plainParagraphsToText(content)
    return text && looksLikeMarkdown(text) ? text : null
}

export const markdownToHtml = (markdown) =>
    renderToStaticMarkup(<ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>)
