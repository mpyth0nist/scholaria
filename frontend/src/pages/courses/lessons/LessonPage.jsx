import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../../api'
import { useState, useEffect } from 'react'
import RichTextEditor, { LessonContent } from '../../../components/RichTextEditor'

// Prepend the backend origin to relative media paths (/media/...)
// so attachments resolve to Django (8000) not the Vite dev server (5173).
const BACKEND = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const resolveMedia = (url) => {
    if (!url) return null
    return url.startsWith('http') ? url : `${BACKEND}${url}`
}


// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────


const LessonPage = () => {
    const { lesson_id } = useParams()
    const navigate = useNavigate()
    const role = useSelector(state => state.users.user?.role)
    const isTeacher = role === 'Teacher'

    const [lesson, setLesson] = useState(null)
    const [marking, setMarking] = useState(false)

    // teacher-only edit state
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ title: '', content: '', attachments: null })
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Reader preferences (for relaxing phone reading)
    const [readTheme, setReadTheme] = useState('cream') // cream, sepia, night
    const [readSize, setReadSize] = useState('lg') // base, lg, xl
    const [readFont, setReadFont] = useState('serif') // serif, sans
    const [showPrefs, setShowPrefs] = useState(false)

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
        if (!window.confirm('Delete this lesson? This cannot be undone.')) return
        setDeleting(true)
        try {
            await api.delete(`api/courses/lessons/${lesson_id}/delete-lesson/`)
            navigate(-1)
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-action transition w-fit"
        >
            ← Back to modules
        </button>
    )

    // Map reader sizes to be responsive (smaller defaults on phone screens)
    const sizeClasses = {
        base: 'text-sm sm:text-base [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_ul]:text-sm sm:[&_ul]:text-base [&_ol]:text-sm sm:[&_ol]:text-base',
        lg: 'text-base sm:text-lg [&_p]:text-base sm:[&_p]:text-lg [&_p]:leading-[1.75] sm:[&_p]:leading-[1.8] [&_ul]:text-base sm:[&_ul]:text-lg [&_ol]:text-base sm:[&_ol]:text-lg',
        xl: 'text-lg sm:text-xl [&_p]:text-lg sm:[&_p]:text-xl [&_p]:leading-[1.8] sm:[&_p]:leading-[1.9] [&_ul]:text-lg sm:[&_ul]:text-xl [&_ol]:text-lg sm:[&_ol]:text-xl'
    }[readSize]

    // Map reader themes
    const themeClasses = {
        cream: 'bg-[#FAF6EE] text-[#2E251B] border-[#E5DDCF] shadow-xs',
        sepia: 'bg-[#F4ECD8] text-[#5C4033] border-[#E4D5B7] shadow-xs',
        night: 'bg-[#1A1E1A] text-[#E1DDD5] border-[#2D332D] shadow-xs'
    }[readTheme]

    // Map reader fonts
    const fontClasses = readFont === 'serif' ? 'font-serif' : 'font-sans'

    const readerCardClasses = `flex flex-col rounded-xl border p-5 sm:p-8 transition-all duration-300 max-w-prose w-full mx-auto ${themeClasses} ${fontClasses} ${sizeClasses}`

    const preferencesPanel = showPrefs && (
        <div className="animate-scale-in flex flex-col gap-4 bg-white/60 border border-primary/20 rounded-xl p-5 shadow-xs max-w-prose w-full mx-auto mb-2 text-text">
            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Reading Settings</span>
                <button
                    onClick={() => {
                        setReadTheme('cream')
                        setReadSize('lg')
                        setReadFont('serif')
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-action hover:underline"
                >
                    Reset
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Font selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Font Style</label>
                    <div className="grid grid-cols-2 gap-1 bg-primary/5 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setReadFont('serif')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readFont === 'serif' ? 'bg-white text-action shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Serif
                        </button>
                        <button
                            type="button"
                            onClick={() => setReadFont('sans')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readFont === 'sans' ? 'bg-white text-action shadow-xs' : 'text-primary/70 hover:text-text'}`}
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
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readSize === 'base' ? 'bg-white text-action shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Small
                        </button>
                        <button
                            type="button"
                            onClick={() => setReadSize('lg')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readSize === 'lg' ? 'bg-white text-action shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Medium
                        </button>
                        <button
                            type="button"
                            onClick={() => setReadSize('xl')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readSize === 'xl' ? 'bg-white text-action shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Large
                        </button>
                    </div>
                </div>

                {/* Theme selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Paper Tint</label>
                    <div className="grid grid-cols-3 gap-1 bg-primary/5 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setReadTheme('cream')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readTheme === 'cream' ? 'bg-[#FAF6EE] text-[#2E251B] border border-[#E5DDCF] shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Cream
                        </button>
                        <button
                            type="button"
                            onClick={() => setReadTheme('sepia')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readTheme === 'sepia' ? 'bg-[#F4ECD8] text-[#5C4033] border border-[#E4D5B7] shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Sepia
                        </button>
                        <button
                            type="button"
                            onClick={() => setReadTheme('night')}
                            className={`py-1 text-xs font-semibold rounded-md transition-all ${readTheme === 'night' ? 'bg-[#1A1E1A] text-[#E1DDD5] border border-[#2D332D] shadow-xs' : 'text-primary/70 hover:text-text'}`}
                        >
                            Night
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT VIEW
    // ─────────────────────────────────────────────────────────────────────────
    if (!isTeacher) {
        return (
            <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-3xl mx-auto w-full text-text animate-page-enter">
                <div className="flex items-center justify-between w-full max-w-prose mx-auto gap-4">
                    {BackButton}
                    <button
                        onClick={() => setShowPrefs(p => !p)}
                        className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition btn-press ${showPrefs ? 'bg-action/10 border-action text-action' : 'bg-white/60 border-primary/20 text-primary hover:text-action'}`}
                    >
                        Aa View Settings
                    </button>
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
                    <div>
                        <LessonContent html={lesson.content} />
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
                            className="flex items-center gap-2 bg-primary hover:bg-[#3a6347] text-white text-base font-semibold px-7 py-3.5 rounded-lg transition-all disabled:opacity-50 btn-press"
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
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEACHER VIEW
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-3xl mx-auto w-full text-text animate-page-enter">
            <div className="max-w-prose w-full mx-auto">
                {BackButton}
            </div>

            {/* view mode */}
            {!editing ? (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 max-w-prose w-full mx-auto">
                        <h1 className="text-3xl font-bold text-text leading-snug">{lesson.title}</h1>
                        <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
                            <button
                                onClick={() => setEditing(true)}
                                className="text-sm text-primary hover:text-action px-3 py-2 rounded-lg hover:bg-primary/5 transition btn-press"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="text-sm text-red-400/70 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/10 transition disabled:opacity-50 btn-press"
                            >
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end max-w-prose w-full mx-auto mb-2">
                        <button
                            onClick={() => setShowPrefs(p => !p)}
                            className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition btn-press ${showPrefs ? 'bg-action/10 border-action text-action' : 'bg-white/60 border-primary/20 text-primary hover:text-action'}`}
                        >
                            Aa View Settings
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

                    <div className="flex flex-col gap-4 bg-white/60 border border-action/20 rounded-xl p-6">
                        {/* title */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-widest text-action">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                className="bg-white/60 border border-primary/20 rounded-lg px-4 py-3 text-base text-text placeholder-slate-500 outline-none focus:border-action transition"
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
                                <span className="bg-white/60 border border-primary/20 rounded-lg px-4 py-2.5 hover:bg-white/60 transition text-text">
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
    )
}

export default LessonPage