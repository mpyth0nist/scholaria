/**
 * SelectionToolbar.jsx
 *
 * Floating action toolbar that appears when a user selects text inside
 * a lesson block. Shows Explain / Simplify / Example / Darija buttons.
 *
 * Props:
 *   containerRef  — ref to the lesson content container (selection must be inside it)
 *   onAction(action, selectedText, surroundingText, anchorKey) — callback
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { FlaskConical, Lightbulb, Pencil } from 'lucide-react'

const ACTIONS = [
    { id: 'explain', label: 'Explain', Icon: Lightbulb },
    { id: 'simplify', label: 'Simplify', Icon: Pencil },
    { id: 'example', label: 'Example', Icon: FlaskConical },
]

/** Collect up to 3000 chars of surrounding text from a block element and its neighbours. */
function getSurroundingText(anchorBlock) {
    if (!anchorBlock) return ''
    const parts = []
    // preceding heading + prev block
    let prev = anchorBlock.previousElementSibling
    if (prev) parts.unshift(prev.textContent || '')
    parts.push(anchorBlock.textContent || '')
    // next sibling
    let next = anchorBlock.nextElementSibling
    if (next) parts.push(next.textContent || '')
    return parts.join('\n\n').slice(0, 3000)
}

/** Find the closest block-level ancestor inside a boundary element. */
function findAnchorBlock(node, boundary) {
    const BLOCK = new Set(['P','H1','H2','H3','H4','H5','H6','LI','BLOCKQUOTE','PRE','DIV','SECTION','ARTICLE','TD','TR'])
    let el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node
    while (el && el !== boundary) {
        if (BLOCK.has(el.tagName)) return el
        el = el.parentElement
    }
    return boundary
}

export default function SelectionToolbar({ containerRef, onAction }) {
    const [pos, setPos] = useState(null)           // {top, left} in viewport px
    const [selection, setSelection] = useState(null)
    const toolbarRef = useRef(null)

    const handleSelectionChange = useCallback(() => {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || !sel.rangeCount) {
            setPos(null)
            setSelection(null)
            return
        }
        const text = sel.toString().trim()
        if (text.length < 4) { setPos(null); return }

        // Check the selection is inside our container
        const container = containerRef.current
        if (!container) return
        const range = sel.getRangeAt(0)
        if (!container.contains(range.commonAncestorContainer)) {
            setPos(null)
            return
        }

        const rect = range.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const anchorBlock = findAnchorBlock(range.commonAncestorContainer, container)
        const surrounding = getSurroundingText(anchorBlock)

        setSelection({ text, surrounding, anchorBlock })
        setPos({
            top: rect.top - containerRect.top - 48,
            left: rect.left - containerRect.left + rect.width / 2,
        })
    }, [containerRef])

    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange)
        return () => document.removeEventListener('selectionchange', handleSelectionChange)
    }, [handleSelectionChange])

    // Hide on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') { setPos(null); setSelection(null) } }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [])

    // Hide on click-away (outside toolbar and outside container)
    useEffect(() => {
        if (!pos) return
        const onMouseDown = (e) => {
            if (!toolbarRef.current?.contains(e.target) && !containerRef.current?.contains(e.target)) {
                setPos(null)
                setSelection(null)
            }
        }
        document.addEventListener('mousedown', onMouseDown)
        return () => document.removeEventListener('mousedown', onMouseDown)
    }, [pos, containerRef])

    if (!pos || !selection) return null

    const handleAction = (actionId) => {
        setPos(null)
        onAction(actionId, selection.text, selection.surrounding, selection.anchorBlock)
        window.getSelection()?.removeAllRanges()
    }

    return (
        <div
            ref={toolbarRef}
            role="toolbar"
            aria-label="Explain selection"
            style={{ position: 'absolute', top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 60 }}
            className="flex items-center gap-1 bg-surface border border-border rounded-xl shadow-xl px-2 py-1.5 animate-scale-in"
            onMouseDown={e => e.preventDefault()} // keep selection alive
        >
            {ACTIONS.map(a => (
                <button
                    key={a.id}
                    onClick={() => handleAction(a.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg text-text hover:bg-action/10 hover:text-action transition whitespace-nowrap btn-press"
                >
                    <a.Icon size={14} strokeWidth={1.8} aria-hidden="true" />
                    <span>{a.label}</span>
                </button>
            ))}
        </div>
    )
}
