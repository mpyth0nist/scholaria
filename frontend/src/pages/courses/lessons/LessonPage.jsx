import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../../api'
import { useState, useEffect } from 'react'

const LessonPage = () => {
    const { lesson_id } = useParams()
    const navigate = useNavigate()
    const role = useSelector(state => state.users.user?.role)
    const isTeacher = role === 'Teacher'

    const [lesson, setLesson] = useState(null)
    const [marking, setMarking] = useState(false)

    // teacher-only edit state
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ title: '', content: '' })
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const fetchLesson = async () => {
        try {
            const res = await api.get(`api/courses/lessons/${lesson_id}/`)
            const data = res.data[0]
            setLesson(data)
            setForm({ title: data.title, content: data.content })
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => { fetchLesson() }, [lesson_id])

    // ── student: mark lesson as read ──────────────────────────────────────────
    const handleMarkRead = async () => {
        setMarking(true)
        try {
            const res = await api.patch(
                `api/courses/lessons/${lesson_id}/update-lesson/`,
                { done: true }
            )
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
        try {
            await api.patch(`api/courses/lessons/${lesson_id}/update-lesson/`, {
                title: form.title,
                content: form.content,
            })
            setLesson(prev => ({ ...prev, ...form }))
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
            <div className="flex items-center justify-center h-64 text-violet-400 animate-pulse text-sm">
                Loading lesson…
            </div>
        )
    }

    // ── shared: back button ───────────────────────────────────────────────────
    const BackButton = (
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 transition w-fit"
        >
            ← Back to modules
        </button>
    )

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT VIEW
    // ─────────────────────────────────────────────────────────────────────────
    if (!isTeacher) {
        return (
            <div className="flex flex-col gap-6 p-6 max-w-3xl text-slate-100">
                {BackButton}

                {/* completion banner */}
                {lesson.done && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                        <span className="text-xl">✅</span>
                        <p className="text-sm text-emerald-400 font-medium">You've completed this lesson.</p>
                    </div>
                )}

                {/* title */}
                <h1 className="text-2xl font-bold text-slate-100">{lesson.title}</h1>

                {/* content */}
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{lesson.content}</p>
                </div>

                {/* attachment */}
                {lesson.attachments && (
                    <a
                        href={lesson.attachments}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 border border-violet-700/40 hover:border-violet-500/60 px-4 py-2.5 rounded-lg transition w-fit bg-violet-700/10"
                    >
                        📎 View Attachment
                    </a>
                )}

                {/* mark as read */}
                <div className="pt-2 border-t border-slate-700/50">
                    {lesson.done ? (
                        <div className="flex items-center gap-3">
                            <span className="text-emerald-400 text-sm font-semibold">✓ Marked as Read</span>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-sm text-violet-400 hover:text-violet-300 transition"
                            >
                                ← Back to modules
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleMarkRead}
                            disabled={marking}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50"
                        >
                            {marking ? (
                                <>
                                    <span className="animate-spin text-base">⏳</span> Saving…
                                </>
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
        <div className="flex flex-col gap-6 p-6 max-w-3xl text-slate-100">
            {BackButton}

            {/* view mode */}
            {!editing ? (
                <>
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-2xl font-bold text-slate-100">{lesson.title}</h1>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setEditing(true)}
                                className="text-sm text-slate-400 hover:text-violet-300 px-3 py-1.5 rounded-lg hover:bg-slate-700/50 transition">
                                ✏️ Edit
                            </button>
                            <button onClick={handleDelete} disabled={deleting}
                                className="text-sm text-red-400/70 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition disabled:opacity-50">
                                {deleting ? 'Deleting…' : '🗑 Delete'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{lesson.content}</p>
                    </div>

                    {lesson.attachments && (
                        <a href={lesson.attachments} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 border border-violet-700/40 hover:border-violet-500/60 px-4 py-2.5 rounded-lg transition w-fit bg-violet-700/10">
                            📎 View Attachment
                        </a>
                    )}
                </>
            ) : (
                /* edit mode */
                <form onSubmit={handleUpdate} className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-slate-100">Editing lesson</h1>
                        <button type="button"
                            onClick={() => { setEditing(false); setForm({ title: lesson.title, content: lesson.content }) }}
                            className="text-sm text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-700/50 transition">
                            Cancel
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 bg-slate-800/60 border border-violet-700/40 rounded-xl p-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-widest text-violet-400">Title</label>
                            <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500 transition" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-widest text-violet-400">Content</label>
                            <textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                                rows={10}
                                className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500 transition resize-none" />
                        </div>
                    </div>

                    <button type="submit" disabled={saving}
                        className="self-start bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all disabled:opacity-50">
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </form>
            )}
        </div>
    )
}

export default LessonPage