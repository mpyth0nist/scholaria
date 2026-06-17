import { useRef, useState, useCallback, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

// Colors are chosen for legibility on a white/cream background (WCAG AA+).
const COLORS = [
    { label: 'Default',  value: '#132A13' },  // dark green — main text
    { label: 'Slate',    value: '#334155' },  // dark slate
    { label: 'Violet',   value: '#5b21b6' },  // deep violet
    { label: 'Sky',      value: '#0369a1' },  // deep sky blue
    { label: 'Emerald',  value: '#065f46' },  // deep emerald
    { label: 'Amber',    value: '#92400e' },  // dark amber/brown
    { label: 'Rose',     value: '#be123c' },  // deep rose
    { label: 'Orange',   value: '#c2410c' },  // dark orange (action)
]

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32]

const FONTS = [
    { label: 'Georgia',      value: 'Georgia, serif' },
    { label: 'Merriweather', value: "'Merriweather', serif" },
    { label: 'Open Sans',    value: "'Open Sans', sans-serif" },
    { label: 'Lato',         value: "'Lato', sans-serif" },
    { label: 'Roboto Slab',  value: "'Roboto Slab', serif" },
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the primary family name from a computed fontFamily string. */
const extractFamilyName = (computedFont) =>
    computedFont.split(',')[0].trim().replace(/['"]/g, '').toLowerCase()

/** Walk up the DOM from `node` until we leave the editor boundary. */
const closestEl = (node) =>
    node?.nodeType === Node.TEXT_NODE ? node.parentElement : node

// ─────────────────────────────────────────────────────────────────────────────
// TOOLBAR PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const ToolbarDivider = () => (
    <div className="w-px h-5 bg-slate-600/60 mx-1 shrink-0" />
)

const ToolBtn = ({ onClick, active, title, children }) => (
    <button
        type="button"
        title={title}
        onMouseDown={(e) => { e.preventDefault(); onClick() }}
        className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition select-none
            ${active
                ? 'bg-action text-white'
                : 'text-text/80 hover:bg-primary/10 hover:text-text'}`}
    >
        {children}
    </button>
)

// ─────────────────────────────────────────────────────────────────────────────
// RICH TEXT EDITOR
// ─────────────────────────────────────────────────────────────────────────────

const RichTextEditor = ({ value = '', onChange, placeholder = 'Write lesson content here…' }) => {
    const editorRef = useRef(null)

    const [activeColor,  setActiveColor]  = useState('#f1f5f9')
    const [showColors,   setShowColors]   = useState(false)
    const [activeBlock,  setActiveBlock]  = useState('p')
    const [activeStyles, setActiveStyles] = useState({ bold: false, italic: false, underline: false, ul: false, ol: false })
    const [activeFont,   setActiveFont]   = useState(FONTS[2].value) // Open Sans default
    const [showFonts,    setShowFonts]    = useState(false)
    const [fontSize,     setFontSize]     = useState(16)
    const [showSizes,    setShowSizes]    = useState(false)

    const closeAll = () => { setShowColors(false); setShowFonts(false); setShowSizes(false) }

    useEffect(() => {
        const el = editorRef.current
        if (!el) return
        el.innerHTML = value || ''
        document.execCommand('defaultParagraphSeparator', false, 'p')
        // Do NOT set fontFamily on the wrapper div — it causes inheritance
        // issues when we wrap text in size spans. The default font is applied
        // by the toolbar's first explicit fontName call instead.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── FIX 3: read font-family from cursor position ──────────────────────────
    const syncState = useCallback(() => {
        setActiveStyles({
            bold:      document.queryCommandState('bold'),
            italic:    document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            ul:        document.queryCommandState('insertUnorderedList'),
            ol:        document.queryCommandState('insertOrderedList'),
        })

        const block = document.queryCommandValue('formatBlock').toLowerCase()
        setActiveBlock(['h1', 'h2'].includes(block) ? block : 'p')

        const color = document.queryCommandValue('foreColor')
        if (color) setActiveColor(color)

        // Walk from cursor node up to detect the effective font-family
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
            const el = closestEl(sel.getRangeAt(0).startContainer)
            if (el && editorRef.current?.contains(el)) {
                const computedFamily = window.getComputedStyle(el).fontFamily
                const primary = extractFamilyName(computedFamily)
                const match = FONTS.find(f =>
                    extractFamilyName(f.value) === primary ||
                    f.value.toLowerCase().includes(primary)
                )
                if (match) setActiveFont(match.value)
            }
        }
    }, [])

    const exec = useCallback((cmd, arg = null) => {
        editorRef.current?.focus()
        document.execCommand(cmd, false, arg)
        syncState()
        onChange(editorRef.current?.innerHTML ?? '')
    }, [onChange, syncState])

    const applyColor = (hex) => { setActiveColor(hex); setShowColors(false); exec('foreColor', hex) }
    const applyFont  = (val) => { setActiveFont(val); setShowFonts(false); exec('fontName', val) }

    // ── FIX 1: H1/H2 inline on selection, block on cursor-only ───────────────
    const applyHeading = (level) => {
        editorRef.current?.focus()
        const sel = window.getSelection()
        const hasSelection = sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed

        if (!hasSelection) {
            // No selection → format the whole block (expected behaviour)
            document.execCommand('formatBlock', false, level)
            setActiveBlock(level)
            onChange(editorRef.current?.innerHTML ?? '')
            return
        }

        // Has selection → apply inline heading-style span
        const HEADING_STYLES = {
            h1: 'font-size:2em;font-weight:bold;',
            h2: 'font-size:1.5em;font-weight:bold;',
        }

        const range  = sel.getRangeAt(0)
        const frag   = range.cloneContents()
        const tmp    = document.createElement('div')
        tmp.appendChild(frag)
        const inner  = tmp.innerHTML || sel.toString()

        document.execCommand('insertHTML', false,
            `<span style="${HEADING_STYLES[level]}">${inner}</span>`)
        setActiveBlock(level)
        onChange(editorRef.current?.innerHTML ?? '')
    }

    const applyBody = () => {
        editorRef.current?.focus()
        const sel = window.getSelection()
        const hasSelection = sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed

        if (hasSelection) {
            document.execCommand('removeFormat', false, null)
        } else {
            document.execCommand('formatBlock', false, 'p')
        }
        setActiveBlock('p')
        onChange(editorRef.current?.innerHTML ?? '')
    }

    // ── FIX 2: preserve computed font-family when applying font size ──────────
    const applyFontSize = (px) => {
        setFontSize(px)
        setShowSizes(false)
        editorRef.current?.focus()
        document.execCommand('fontSize', false, '7')

        editorRef.current?.querySelectorAll('font[size="7"]').forEach(node => {
            const span = document.createElement('span')
            span.style.fontSize = `${px}px`

            // Inherit the computed font-family at this exact node so
            // the new span doesn't fall back to the browser/body default.
            const computed = window.getComputedStyle(node).fontFamily
            if (computed) span.style.fontFamily = computed

            span.innerHTML = node.innerHTML
            node.replaceWith(span)
        })

        syncState()
        onChange(editorRef.current?.innerHTML ?? '')
    }

    const handleInput = () => { onChange(editorRef.current?.innerHTML ?? ''); syncState() }

    const activeFontLabel = FONTS.find(f => f.value === activeFont)?.label ?? 'Font'

    return (
        <div className="flex flex-col rounded-xl border border-primary/20 overflow-hidden focus-within:border-action transition">

            {/* ── toolbar ── */}
            <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-white/60 border-b border-primary/20">

                {/* Font family */}
                <div className="relative">
                    <button
                        type="button"
                        title="Font family"
                        onMouseDown={(e) => { e.preventDefault(); setShowFonts(v => !v); setShowColors(false); setShowSizes(false) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-text/80 hover:bg-primary/10 hover:text-text transition select-none min-w-[108px] justify-between"
                        style={{ fontFamily: activeFont }}
                    >
                        <span>{activeFontLabel}</span>
                        <span className="text-xs opacity-60 ml-1">▾</span>
                    </button>
                    {showFonts && (
                        <div className="absolute top-full left-0 mt-1 z-30 bg-white/60 border border-primary/20 rounded-xl py-1.5 shadow-2xl min-w-[190px]">
                            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 px-3 pt-1 pb-2">Font Family</p>
                            {FONTS.map(f => (
                                <button
                                    key={f.value}
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); applyFont(f.value) }}
                                    className={`w-full text-left px-4 py-2.5 transition flex flex-col gap-0.5
                                        ${activeFont === f.value ? 'bg-action/10 text-action' : 'text-text hover:bg-primary/5'}`}
                                >
                                    <span style={{ fontFamily: f.value }} className="text-base leading-tight">{f.label}</span>
                                    <span className="text-xs text-primary/70" style={{ fontFamily: f.value }}>The quick brown fox</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Font size */}
                <div className="relative">
                    <button
                        type="button"
                        title="Font size"
                        onMouseDown={(e) => { e.preventDefault(); setShowSizes(v => !v); setShowColors(false); setShowFonts(false) }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm text-text/80 hover:bg-primary/10 hover:text-text transition select-none min-w-[52px] justify-between"
                    >
                        <span>{fontSize}px</span>
                        <span className="text-xs opacity-60">▾</span>
                    </button>
                    {showSizes && (
                        <div className="absolute top-full left-0 mt-1 z-30 bg-white/60 border border-primary/20 rounded-xl py-1.5 shadow-2xl min-w-[90px]">
                            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 px-3 pt-1 pb-2">Size</p>
                            {FONT_SIZES.map(px => (
                                <button
                                    key={px}
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); applyFontSize(px) }}
                                    className={`w-full text-left px-4 py-1.5 transition
                                        ${fontSize === px ? 'bg-action/10 text-action font-semibold' : 'text-text hover:bg-primary/5'}`}
                                    style={{ fontSize: `${Math.min(px, 18)}px` }}
                                >
                                    {px}px
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <ToolbarDivider />

                {/* Text type */}
                <ToolBtn onClick={applyBody}          active={activeBlock === 'p'}  title="Regular text">¶ Body</ToolBtn>
                <ToolBtn onClick={() => applyHeading('h2')} active={activeBlock === 'h2'} title="Heading 2 — applies to selection only">H2</ToolBtn>
                <ToolBtn onClick={() => applyHeading('h1')} active={activeBlock === 'h1'} title="Heading 1 — applies to selection only">H1</ToolBtn>

                <ToolbarDivider />

                {/* Font style */}
                <ToolBtn onClick={() => exec('bold')}      active={activeStyles.bold}      title="Bold"><strong>B</strong></ToolBtn>
                <ToolBtn onClick={() => exec('italic')}    active={activeStyles.italic}    title="Italic"><em>I</em></ToolBtn>
                <ToolBtn onClick={() => exec('underline')} active={activeStyles.underline} title="Underline"><span className="underline">U</span></ToolBtn>
                <ToolBtn
                    onClick={() => { exec('removeFormat'); setActiveStyles(s => ({ ...s, bold: false, italic: false, underline: false })) }}
                    active={false}
                    title="Clear formatting"
                >
                    <span className="opacity-70 text-xs">✕</span>
                </ToolBtn>

                <ToolbarDivider />

                {/* Lists */}
                <ToolBtn onClick={() => exec('insertUnorderedList')} active={activeStyles.ul} title="Bullet list">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="2" cy="4" r="1.5"/><rect x="5" y="3" width="10" height="2" rx="1"/>
                        <circle cx="2" cy="8" r="1.5"/><rect x="5" y="7" width="10" height="2" rx="1"/>
                        <circle cx="2" cy="12" r="1.5"/><rect x="5" y="11" width="10" height="2" rx="1"/>
                    </svg>
                </ToolBtn>
                <ToolBtn onClick={() => exec('insertOrderedList')} active={activeStyles.ol} title="Numbered list">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <text x="0" y="5" fontSize="5" fontFamily="monospace">1.</text>
                        <rect x="5" y="3" width="10" height="2" rx="1"/>
                        <text x="0" y="9.5" fontSize="5" fontFamily="monospace">2.</text>
                        <rect x="5" y="7" width="10" height="2" rx="1"/>
                        <text x="0" y="14" fontSize="5" fontFamily="monospace">3.</text>
                        <rect x="5" y="11" width="10" height="2" rx="1"/>
                    </svg>
                </ToolBtn>

                <ToolbarDivider />

                {/* Font color */}
                <div className="relative">
                    <button
                        type="button"
                        title="Font color"
                        onMouseDown={(e) => { e.preventDefault(); setShowColors(v => !v); setShowFonts(false); setShowSizes(false) }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-text/80 hover:bg-primary/10 hover:text-text transition select-none"
                    >
                        <span className="font-bold" style={{ color: activeColor }}>A</span>
                        <span className="w-4 h-1 rounded-sm" style={{ backgroundColor: activeColor }} />
                        <span className="text-xs opacity-60">▾</span>
                    </button>
                    {showColors && (
                        <div className="absolute top-full left-0 mt-1 z-30 bg-white/60 border border-primary/20 rounded-xl p-3 shadow-2xl flex flex-col gap-2 min-w-max">
                            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Color</p>
                            <div className="grid grid-cols-4 gap-2">
                                {COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        title={c.label}
                                        onMouseDown={(e) => { e.preventDefault(); applyColor(c.value) }}
                                        className="w-8 h-8 rounded-lg border-2 transition hover:scale-110 active:scale-95"
                                        style={{
                                            backgroundColor: c.value,
                                            borderColor: activeColor === c.value ? '#a78bfa' : 'transparent',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── editable area ── */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyUp={syncState}
                onMouseUp={syncState}
                onBlur={closeAll}
                data-placeholder={placeholder}
                className="min-h-[200px] px-5 py-4 bg-white/60 text-text leading-relaxed outline-none
                    empty:before:content-[attr(data-placeholder)] empty:before:text-primary/70 empty:before:pointer-events-none
                    [&_h1]:text-3xl [&_h1]:font-bold   [&_h1]:text-text [&_h1]:mb-2  [&_h1]:mt-3
                    [&_h2]:text-xl  [&_h2]:font-semibold [&_h2]:text-text [&_h2]:mb-1.5 [&_h2]:mt-2.5
                    [&_p]:mb-2   [&_p]:leading-relaxed
                    [&_div]:mb-1 [&_div]:leading-relaxed
                    [&_strong]:font-bold [&_em]:italic [&_u]:underline
                    [&_ul]:list-disc    [&_ul]:pl-6 [&_ul]:mb-2 [&_ul>li]:mb-1
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-2 [&_ol>li]:mb-1"
            />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOR FIXER — maps old light-on-dark palette to dark-on-light equivalents.
// This ensures content authored before the palette change renders correctly.
// ─────────────────────────────────────────────────────────────────────────────

const LIGHT_TO_DARK = {
    // hex values the old palette used (lowercase, no alpha)
    '#f1f5f9': '#132A13',  // 'White'   → default text
    '#94a3b8': '#334155',  // 'Silver'  → slate-700
    '#a78bfa': '#5b21b6',  // 'Violet'  → violet-800
    '#38bdf8': '#0369a1',  // 'Sky'     → sky-700
    '#34d399': '#065f46',  // 'Emerald' → emerald-900
    '#fbbf24': '#92400e',  // 'Amber'   → amber-900
    '#fb7185': '#be123c',  // 'Rose'    → rose-700
    '#fb923c': '#c2410c',  // 'Orange'  → orange-700
}

/**
 * Walks all inline `color` style declarations in saved HTML and replaces
 * any known light-palette hex value with its dark counterpart.
 * rgb(r, g, b) values from execCommand are also normalised.
 */
const fixLessonColors = (html) => {
    if (!html) return ''

    // Also handle rgb() format that browsers emit from execCommand
    const RGB_TO_HEX = {
        'rgb(241, 245, 249)': '#f1f5f9',
        'rgb(148, 163, 184)': '#94a3b8',
        'rgb(167, 139, 250)': '#a78bfa',
        'rgb(56, 189, 248)':  '#38bdf8',
        'rgb(52, 211, 153)':  '#34d399',
        'rgb(251, 191, 36)':  '#fbbf24',
        'rgb(251, 113, 133)': '#fb7185',
        'rgb(251, 146, 60)':  '#fb923c',
    }

    // Replace rgb() representations first so later hex replacement covers all cases
    let fixed = html
    Object.entries(RGB_TO_HEX).forEach(([rgb, hex]) => {
        fixed = fixed.replaceAll(rgb, hex)
    })

    // Replace hex representations (case-insensitive)
    Object.entries(LIGHT_TO_DARK).forEach(([light, dark]) => {
        const re = new RegExp(light.replace('#', '#'), 'gi')
        fixed = fixed.replace(re, dark)
    })

    return fixed
}

// ─────────────────────────────────────────────────────────────────────────────
// LESSON CONTENT RENDERER  (read-only)
// ─────────────────────────────────────────────────────────────────────────────

export const LessonContent = ({ html }) => (
    <div
        className="text-text leading-relaxed
            [&_h1]:text-4xl  [&_h1]:font-bold     [&_h1]:text-text [&_h1]:mb-3 [&_h1]:mt-4
            [&_h2]:text-2xl  [&_h2]:font-semibold [&_h2]:text-text [&_h2]:mb-2 [&_h2]:mt-3
            [&_p]:mb-3   [&_p]:leading-relaxed
            [&_div]:mb-1 [&_div]:leading-relaxed
            [&_strong]:font-bold [&_em]:italic [&_u]:underline
            [&_ul]:list-disc    [&_ul]:pl-7 [&_ul]:mb-3 [&_ul>li]:mb-1.5
            [&_ol]:list-decimal [&_ol]:pl-7 [&_ol]:mb-3 [&_ol>li]:mb-1.5
            [&_span]:leading-[inherit]"
        dangerouslySetInnerHTML={{ __html: fixLessonColors(html) }}
    />
)

export default RichTextEditor
