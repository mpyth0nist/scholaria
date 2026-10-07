import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

const DEFAULT_COMPONENTS = {
    table: ({ children }) => (
        <div className="max-w-full overflow-x-auto overscroll-x-contain mb-2 rounded-lg">
            <table className="w-full table-fixed border-collapse text-[13px]">{children}</table>
        </div>
    ),
    th: ({ children }) => (
        <th className="text-left font-semibold px-2.5 py-2 border-b-2 border-current/20 bg-black/5 dark:bg-white/10 align-top [overflow-wrap:anywhere]" dir="auto">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-2.5 py-2 border-b border-current/10 align-top [overflow-wrap:anywhere]" dir="auto">
            {children}
        </td>
    ),
    pre: ({ children }) => (
        <div className="max-w-full overflow-x-auto overscroll-x-contain mb-2">
            <pre className="bg-black/5 dark:bg-white/5 p-2.5 rounded-lg text-xs md:text-sm leading-relaxed" dir="ltr" style={{ unicodeBidi: 'isolate' }}>
                {children}
            </pre>
        </div>
    ),
    code: ({ inline, children }) =>
        inline ? (
            <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-[13px] font-mono">{children}</code>
        ) : (
            <code className="bg-transparent text-xs md:text-sm leading-relaxed font-mono" dir="ltr" style={{ unicodeBidi: 'isolate' }}>
                {children}
            </code>
        ),
    p: ({ children }) => <p className="mb-2 last:mb-0" dir="auto">{children}</p>,
    li: ({ children }) => <li className="mb-0.5" dir="auto">{children}</li>,
    ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
    h3: ({ children }) => <h3 className="font-bold mt-3 mb-1 text-base" dir="auto">{children}</h3>,
    h4: ({ children }) => <h4 className="font-bold mt-2 mb-1 text-sm" dir="auto">{children}</h4>,
    a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-action underline hover:opacity-80">
            {children}
        </a>
    ),
}

export default function MarkdownRenderer({ children, className = '' }) {
    if (!children) return null

    return (
        <div className={`markdown-content text-sm leading-relaxed ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={DEFAULT_COMPONENTS}
            >
                {children}
            </ReactMarkdown>
        </div>
    )
}
