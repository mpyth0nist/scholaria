import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../../api'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import RichTextEditor, { LessonContent } from '../../../components/RichTextEditor'
import EdahAIAssistant from '../../../components/EdahAIAssistant'
import SelectionToolbar from '../../../components/SelectionToolbar'
import InlineExplainCard from '../../../components/InlineExplainCard'
import { usePermissions } from '../../../hooks/usePermissions.js'
import { ENDPOINTS } from '../../../constants'


// Prepend the backend origin to relative media paths (/media/...)
// so attachments resolve to Django (8000) not the Vite dev server (5173).
const BACKEND = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const resolveMedia = (url) => {
    if (!url) return null
    return url.startsWith('http') ? url : `${BACKEND}${url}`
}


// ─────────────────────────────────────────────────────────────────────────────
// PORTAL CARD HELPER
// ─────────────────────────────────────────────────────────────────────────────
const PortalCard = ({ card, lessonId, onDismiss, onPinChange }) => {
    // Create the container once
    const [container] = useState(() => document.createElement('div'))

    useEffect(() => {
        if (card.anchorEl) {
            card.anchorEl.after(container)
            return () => { container.remove() }
        }
    }, [card.anchorEl, container])

    const cardEl = (
        <InlineExplainCard
            lessonId={lessonId}
            action={card.action}
            selectedText={card.selectedText}
            surroundingText={card.surroundingText}
            annotationId={card.annotationId}
            initialText={card.initialText}
            isPinned={card.isPinned}
            onDismiss={() => onDismiss(card.id)}
            onPinChange={(pinned) => onPinChange(card.id, pinned)}
        />
    )

    if (card.anchorEl) {
        return createPortal(cardEl, container)
    }
    return cardEl
}


// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────


const LessonPage = () => {
    const { lesson_id } = useParams()
    const navigate = useNavigate()
    const role = useSelector(state => state.users.user?.role)
    const { isTeacher } = usePermissions()

    const [lesson, setLesson] = useState(null)
    const [marking, setMarking] = useState(false)

    // teacher-only edit state
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ title: '', content: '', attachments: null })
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [showMoreMenu, setShowMoreMenu] = useState(false)

    // Reader preferences (for relaxing phone reading)
        const [readSize, setReadSize] = useState('lg') // base, lg, xl
    const [readFont, setReadFont] = useState('serif') // serif, sans
    const [showPrefs, setShowPrefs] = useState(false)
    const [showAI, setShowAI] = useState(false)
    const [chatWidth, setChatWidth] = useState('400px')

    // ── Inline explain ────────────────────────────────────────────────────────
    // cards: { id, action, selectedText, surroundingText, anchorEl, annotationId, initialText, isPinned }
    const [cards, setCards] = useState([])
    const contentRef = useRef(null)

    const dismissCard = useCallback((cardId) => {
        setCards(prev => prev.filter(c => c.id !== cardId))
    }, [])

    const handlePinChange = useCallback((cardId, pinned) => {
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, isPinned: pinned } : c))
    }, [])

    const handleAction = useCallback((action, selectedText, surroundingText, anchorEl) => {
        const cardId = `${Date.now()}-${action}`
        setCards(prev => {
            // One card per (anchor, action) — replace if already exists
            const filtered = prev.filter(c => !(c.anchorEl === anchorEl && c.action === action))
            return [...filtered, { id: cardId, action, selectedText, surroundingText, anchorEl, annotationId: null, initialText: null, isPinned: false }]
        })
    }, [])

    const fetchLesson = async () => {
        try {
            const res = await api.get(`api/courses/lessons/${lesson_id}/`)
            const data = res.data
            setLesson(data)
            setForm({ title: data.title, content: data.content, attachments: null })
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => { fetchLesson() }, [lesson_id])

    // Load saved annotations
    useEffect(() => {
        if (!lesson_id || !isTeacher === false) return
        api.get(ENDPOINTS.lessonAnnotations(lesson_id))
            .then(res => {
                const annotations = res.data
                if (!annotations.length) return
                setCards(prev => {
                    const existing = new Set(prev.map(c => c.annotationId))
                    const fromServer = annotations
                        .filter(a => !existing.has(a.id))
                        .map(a => ({
                            id: `saved-${a.id}`,
                            action: a.action,
                            selectedText: a.selected_text,
                            surroundingText: '',
                            anchorEl: null, // no live DOM ref; rendered at bottom of content
                            annotationId: a.id,
                            initialText: a.response,
                            isPinned: a.pinned,
                        }))
                    return [...prev, ...fromServer]
                })
            })
            .catch(() => {})
    }, [lesson_id, isTeacher])

    // ── student: mark lesson as read ──────────────────────────────────────────
    const handleMarkRead = async () => {
        setMarking(true)
        try {
            await api.post(`api/courses/lessons/${lesson_id}/mark-read/`)
            setLesson(prev => ({ ...prev, done: true }))
        } catch (err) {
            console.error(err)
        } finally {
            setMarking(false)
        }
    }

    // ── teacher: update lesson ────────────────────────────────────────────────
    const handleUpdate = async (e) => {
        e.preventDefault()
        setSaving(true)

        const formData = new FormData()
        formData.append('title', form.title)
        formData.append('content', form.content)
        if (form.attachments && form.attachments instanceof File) {
            formData.append('attachments', form.attachments)
        }

        try {
            await api.patch(`api/courses/lessons/${lesson_id}/update-lesson/`, formData)
            // Fetch lesson again to get the updated attachment URL
            await fetchLesson()
            setEditing(false)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    // ── teacher: delete lesson ────────────────────────────────────────────────
    const handleDelete = async () => {
        setDeleteConfirmOpen(false)
        setDeleting(true)
        try {
            await api.delete(`api/courses/lessons/${lesson_id}/delete-lesson/`)
            navigate('..', { relative: 'path' })
        } catch (err) {
            console.error(err)
            setDeleting(false)
        }
    }

    if (!lesson) {
        return (
            <div className="flex items-center justify-center h-64 text-action animate-pulse text-base">
                Loading lesson…
            </div>
        )
    }

    // ── shared: back button ───────────────────────────────────────────────────
    const BackButton = (
        <button
            onClick={() => navigate('..', { relative: 'path' })}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-action transition w-fit"
        >
            ← Back to lessons
        </button>
    )

    // Map reader sizes to be responsive (smaller defaults on phone screens)
    const sizeClasses = {
        base: 'text-sm sm:text-base [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_ul]:text-sm sm:[&_ul]:text-base [&_ol]:text-sm sm:[&_ol]:text-base',
        lg: 'text-base sm:text-lg [&_p]:text-base sm:[&_p]:text-lg [&_p]:leading-[1.75] sm:[&_p]:leading-[1.8] [&_ul]:text-base sm:[&_ul]:text-lg [&_ol]:text-base sm:[&_ol]:text-lg',
        xl: 'text-lg sm:text-xl [&_p]:text-lg sm:[&_p]:text-xl [&_p]:leading-[1.8] sm:[&_p]:leading-[1.9] [&_ul]:text-lg sm:[&_ul]:text-xl [&_ol]:text-lg sm:[&_ol]:text-xl'
    }[readSize]


    // Map reader fonts
    const fontClasses = readFont === 'serif' ? 'font-serif' : 'font-sans'

    const readerCardClasses = `flex flex-col rounded-xl border p-5 sm:p-8 transition-all duration-300 max-w-prose w-full mx-auto bg-surface border-border text-text shadow-sm ${fontClasses} ${sizeClasses}`

    const preferencesPanel = showPrefs && (
        <div className="animate-scale-in flex flex-col gap-4 bg-surface border border-primary/20 rounded-xl p-5 shadow-xs max-w-prose w-full mx-auto mb-2 text-text">
            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Reading Settings</span>
                <button
                    onClick={() => {
                        setReadSize('lg')
                        setReadFont('serif')
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-action hover:underline"
                >
                    Reset
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Font selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Font Style</label>
                    <div className="grid grid-cols-2 gap-1 bg-primary/5 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setReadFont('serif')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readFont === 'serif' ? 'bg-primary text-white shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Serif
                        </button>
                        <button
                            type="button"
                            onClick={() => setReadFont('sans')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readFont === 'sans' ? 'bg-primary text-white shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Sans
                        </button>
                    </div>
                </div>

                {/* Size selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Text Size</label>
                    <div className="grid grid-cols-3 gap-1 bg-primary/5 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setReadSize('base')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readSize === 'base' ? 'bg-primary text-white shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Small
                        </button>
                        <button
                            type="button"
                            onClick={() => setReadSize('lg')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readSize === 'lg' ? 'bg-primary text-white shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Medium
                        </button>
                        <button
                            type="button"
                            onClick={() => setReadSize('xl')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readSize === 'xl' ? 'bg-primary text-white shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Large
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    // ─────────────────────────────────────────────────────────────────────────
    if (!isTeacher) {
        return (
            <>
            <div 
                className="flex flex-col items-start justify-center gap-6 p-4 sm:p-6 w-full animate-page-enter transition-all duration-300 mx-auto max-w-3xl lg:max-w-none"
                style={{
                    paddingRight: (showAI && typeof window !== 'undefined' && window.innerWidth >= 1024) ? `calc(${chatWidth} + 1.5rem)` : undefined
                }}
            >
                <div className="flex flex-col gap-6 w-full text-text max-w-3xl mx-auto">
                    <div className="flex items-center justify-between w-full max-w-prose mx-auto gap-4">
                        {BackButton}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowAI(p => !p)}
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition btn-press ${showAI ? 'bg-action text-white shadow-sm border-action/20' : 'bg-surface border-border text-action hover:bg-surface-hover'}`}
                            >
                                ✨ Ask Edah
                            </button>
                            <button
                                onClick={() => setShowPrefs(p => !p)}
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition btn-press ${showPrefs ? 'bg-primary text-white shadow-sm border-primary/20' : 'bg-surface border-border text-text/70 hover:bg-surface-hover'}`}
                            >
                                Display Options
                            </button>
                        </div>
                    </div>

                {preferencesPanel}

                {/* completion banner */}
                {lesson.done && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-primary/10 border border-primary/20 rounded-xl max-w-prose w-full mx-auto">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-primary/20 border-primary/35 text-primary">DONE</span>
                        <p className="text-base text-primary font-medium">You've completed this lesson.</p>
                    </div>
                )}

                {/* lesson title */}
                <h1 className="text-3xl font-bold text-text leading-snug max-w-prose w-full mx-auto">{lesson.title}</h1>

                {/* content card — module title badge in top-right corner */}
                <div className={readerCardClasses}>
                    {lesson.module_title && (
                        <div className="flex justify-end mb-4">
                            <span className="text-xs font-semibold text-action bg-action/10 border border-action/20 px-2.5 py-1 rounded-full">
                                {lesson.module_title}
                            </span>
                        </div>
                    )}
                    <div ref={contentRef} className="relative">
                        <LessonContent html={lesson.content} />

                        <SelectionToolbar containerRef={contentRef} onAction={handleAction} />

                        {cards.map(c => (
                            <PortalCard
                                key={c.id}
                                card={c}
                                lessonId={lesson.id}
                                onDismiss={dismissCard}
                                onPinChange={handlePinChange}
                            />
                        ))}
                    </div>
                </div>

                {/* attachment */}
                {lesson.attachments && (
                    <div className="max-w-prose w-full mx-auto">
                        <a
                            href={resolveMedia(lesson.attachments)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-base text-action hover:text-action border border-action/20 hover:border-action/20 px-5 py-3 rounded-lg transition w-fit bg-action/10 btn-press"
                        >
                            📎 View Attachment
                        </a>
                    </div>
                )}

                {/* mark as read */}
                <div className="pt-2 border-t border-primary/20 max-w-prose w-full mx-auto">
                    {lesson.done ? (
                        <div className="flex items-center gap-4">
                            <span className="text-primary text-base font-semibold">✓ Marked as Read</span>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-base text-action font-semibold hover:underline transition"
                            >
                                ← Back to modules
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleMarkRead}
                            disabled={marking}
                            className="flex items-center gap-2 bg-primary hover:brightness-90 text-white text-base font-semibold px-7 py-3.5 rounded-lg transition-all disabled:opacity-50 btn-press"
                        >
                            {marking ? (
                                <>Saving…</>
                            ) : (
                                <>✓ Mark as Read</>
                            )}
                        </button>
                    )}
                </div>
            </div>
            </div>
            <EdahAIAssistant isOpen={showAI} onClose={() => setShowAI(false)} lessonId={lesson_id} onWidthChange={setChatWidth} />
        </>
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEACHER VIEW
    // ─────────────────────────────────────────────────────────────────────────

    // Delete confirmation modal (replaces window.confirm)
    const DeleteModal = deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-scale-in">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center text-danger">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    </span>
                    <div>
                        <h2 className="text-base font-bold text-text">Delete this lesson?</h2>
                        <p className="text-sm text-text/60 mt-1">This will permanently remove the lesson and all associated student progress. This action cannot be undone.</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={() => setDeleteConfirmOpen(false)}
                        className="px-4 py-2 text-sm font-semibold text-text bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm font-semibold text-white bg-danger rounded-lg hover:bg-danger/80 transition-colors"
                    >
                        Delete Lesson
                    </button>
                </div>
            </div>
        </div>
    )

    return (

        <>
        {DeleteModal}
        <div 
            className="flex flex-col items-start justify-center gap-6 p-4 sm:p-6 w-full animate-page-enter transition-all duration-300 mx-auto max-w-3xl lg:max-w-none"
            style={{
                paddingRight: (showAI && typeof window !== 'undefined' && window.innerWidth >= 1024) ? `calc(${chatWidth} + 1.5rem)` : undefined
            }}
        >
            <div className="flex flex-col gap-6 w-full text-text max-w-3xl mx-auto">
                <div className="max-w-prose w-full mx-auto">
                    {BackButton}
                </div>

            {/* view mode */}
            {!editing ? (
                <>
                    {/* Teacher Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-prose w-full mx-auto mb-4 border-b border-primary/10 pb-4">
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-bold uppercase tracking-widest text-primary/50">Teacher Controls</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setEditing(true)}
                                className="bg-surface text-text border border-border hover:bg-surface-hover px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
                            >
                                Edit Lesson
                            </button>
                            {/* Overflow menu — keeps destructive action out of the primary flow */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMoreMenu(p => !p)}
                                    aria-label="More actions"
                                    aria-expanded={showMoreMenu}
                                    className="bg-surface text-text/60 border border-border hover:bg-surface-hover px-3 py-2 text-sm font-bold rounded-lg transition-colors"
                                >
                                    ⋯
                                </button>
                                {showMoreMenu && (
                                    <>
                                        {/* Click-away backdrop */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowMoreMenu(false)}
                                        />
                                        <div className="absolute right-0 mt-1 w-44 bg-surface border border-border rounded-xl shadow-lg z-20 overflow-hidden animate-scale-in">
                                            <button
                                                onClick={() => { setShowMoreMenu(false); setDeleteConfirmOpen(true) }}
                                                disabled={deleting}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-danger hover:bg-danger/5 transition-colors disabled:opacity-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                {deleting ? 'Deleting…' : 'Delete Lesson'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="flex justify-end max-w-prose w-full mx-auto mb-2 gap-2">
                        <button
                            onClick={() => setShowAI(p => !p)}
                            className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition btn-press ${showAI ? 'bg-action text-white shadow-sm border-action/20' : 'bg-surface border-border text-action hover:bg-surface-hover'}`}
                        >
                            ✨ Ask Edah
                        </button>
                        <button
                            onClick={() => setShowPrefs(p => !p)}
                            className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition btn-press ${showPrefs ? 'bg-primary text-white shadow-sm border-primary/20' : 'bg-surface border-border text-text/70 hover:bg-surface-hover'}`}
                        >
                                Aa Reading
                        </button>
                    </div>

                    {preferencesPanel}

                    {/* content card — module title badge in top-right corner */}
                    <div className={readerCardClasses}>
                        {lesson.module_title && (
                            <div className="flex justify-end mb-4">
                                <span className="text-xs font-semibold text-action bg-action/10 border border-action/20 px-2.5 py-1 rounded-full">
                                    {lesson.module_title}
                                </span>
                            </div>
                        )}
                        <div>
                            <LessonContent html={lesson.content} />
                        </div>
                    </div>

                    {lesson.attachments && (
                        <div className="max-w-prose w-full mx-auto">
                            <a
                                href={resolveMedia(lesson.attachments)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-base text-action hover:text-action border border-action/20 hover:border-action/20 px-5 py-3 rounded-lg transition w-fit bg-action/10 btn-press"
                            >
                                📎 View Attachment
                            </a>
                        </div>
                    )}
                </>
            ) : (
                /* edit mode */
                <form onSubmit={handleUpdate} className="flex flex-col gap-5 max-w-prose w-full mx-auto">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-text">Editing lesson</h1>
                        <button
                            type="button"
                            onClick={() => { setEditing(false); setForm({ title: lesson.title, content: lesson.content, attachments: null }) }}
                            className="text-sm text-primary hover:text-text px-3 py-2 rounded-lg hover:bg-primary/5 transition btn-press"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 bg-surface border border-action/20 rounded-xl p-6">
                        {/* title */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-widest text-action">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                className="bg-surface border border-primary/20 rounded-lg px-4 py-3 text-base text-text placeholder-slate-500 outline-none focus:border-action transition"
                            />
                        </div>

                        {/* rich text content */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-widest text-action">Content</label>
                            <RichTextEditor
                                key={lesson.id}
                                value={form.content}
                                onChange={(html) => setForm(f => ({ ...f, content: html }))}
                            />
                        </div>

                        {/* file attachment */}
                        <div className="flex flex-col gap-1.5 mt-2 border-t border-primary/20 pt-5">
                            <label className="text-xs font-semibold uppercase tracking-widest text-action">Attachment</label>
                            {lesson.attachments && !form.attachments && (
                                <p className="text-sm text-primary mb-2">
                                    Current attachment exists. Uploading a new file will replace it.
                                </p>
                            )}
                            <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
                                <span className="bg-surface border border-primary/20 rounded-lg px-4 py-2.5 hover:bg-surface transition text-text">
                                    {form.attachments ? form.attachments.name : 'Choose file... (optional)'}
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setForm(f => ({ ...f, attachments: e.target.files[0] }))}
                                />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="self-start bg-action hover:bg-action text-white text-base font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 btn-press"
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </form>
            )}
            </div>
            <EdahAIAssistant isOpen={showAI} onClose={() => setShowAI(false)} lessonId={lesson_id} onWidthChange={setChatWidth} />
        </div>
        </>
    )
}

export default LessonPage