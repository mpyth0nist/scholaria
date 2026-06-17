import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../../api'
import { useState, useEffect } from 'react'
import RichTextEditor, { LessonContent } from '../../../components/RichTextEditor'


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
        if (form.attachments) {
            formData.append('attachments', form.attachments)
        }

        try {
            await api.patch(`api/courses/lessons/${lesson_id}/update-lesson/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
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

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT VIEW
    // ─────────────────────────────────────────────────────────────────────────
    if (!isTeacher) {
        return (
            <div className="flex flex-col gap-7 p-6 max-w-3xl text-text">
                {BackButton}

                {/* completion banner */}
                {lesson.done && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-primary/10 border border-primary/20 rounded-xl">
                        <span className="text-2xl">✅</span>
                        <p className="text-base text-primary font-medium">You've completed this lesson.</p>
                    </div>
                )}

                {/* lesson title */}
                <h1 className="text-3xl font-bold text-text leading-snug">{lesson.title}</h1>

                {/* content card — module title badge in top-right corner */}
                <div className="relative bg-white border border-primary/20 rounded-xl p-7">
                    {lesson.module_title && (
                        <span className="absolute top-4 right-4 text-xs font-semibold text-action bg-action/10 border border-action/20 px-2.5 py-1 rounded-full">
                            {lesson.module_title}
                        </span>
                    )}
                    <div className="mt-5">
                        <LessonContent html={lesson.content} />
                    </div>
                </div>

                {/* attachment */}
                {lesson.attachments && (
                    <a
                        href={lesson.attachments}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-base text-action hover:text-action border border-action/20 hover:border-action/20 px-5 py-3 rounded-lg transition w-fit bg-action/10"
                    >
                        📎 View Attachment
                    </a>
                )}

                {/* mark as read */}
                <div className="pt-2 border-t border-primary/20">
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
                            className="flex items-center gap-2 bg-primary hover:bg-[#3a6347] active:scale-95 text-white text-base font-semibold px-7 py-3.5 rounded-lg transition-all disabled:opacity-50"
                        >
                            {marking ? (
                                <>
                                    <span className="animate-spin text-lg">⏳</span> Saving…
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
        <div className="flex flex-col gap-7 p-6 max-w-3xl text-text">
            {BackButton}

            {/* view mode */}
            {!editing ? (
                <>
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-3xl font-bold text-text leading-snug">{lesson.title}</h1>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setEditing(true)}
                                className="text-sm text-primary hover:text-action px-3 py-2 rounded-lg hover:bg-primary/5 transition"
                            >
                                ✏️ Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="text-sm text-red-400/70 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/10 transition disabled:opacity-50"
                            >
                                {deleting ? 'Deleting…' : '🗑 Delete'}
                            </button>
                        </div>
                    </div>

                    {/* content card — module title badge in top-right corner */}
                    <div className="relative bg-white/60 border border-primary/20 rounded-xl p-7">
                        {lesson.module_title && (
                            <span className="absolute top-4 right-4 text-xs font-semibold text-action bg-action/10 border border-action/20 px-2.5 py-1 rounded-full">
                                {lesson.module_title}
                            </span>
                        )}
                        <div className="mt-5">
                            <LessonContent html={lesson.content} />
                        </div>
                    </div>

                    {lesson.attachments && (
                        <a
                            href={lesson.attachments}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-base text-action hover:text-action border border-action/20 hover:border-action/20 px-5 py-3 rounded-lg transition w-fit bg-action/10"
                        >
                            📎 View Attachment
                        </a>
                    )}
                </>
            ) : (
                /* edit mode */
                <form onSubmit={handleUpdate} className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-text">Editing lesson</h1>
                        <button
                            type="button"
                            onClick={() => { setEditing(false); setForm({ title: lesson.title, content: lesson.content, attachments: null }) }}
                            className="text-sm text-primary hover:text-text px-3 py-2 rounded-lg hover:bg-primary/5 transition"
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
                        className="self-start bg-action hover:bg-action active:scale-95 text-white text-base font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </form>
            )}
        </div>
    )
}

export default LessonPage