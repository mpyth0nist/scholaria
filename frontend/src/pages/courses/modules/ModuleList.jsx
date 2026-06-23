import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../../api'
import { useEffect, useState } from 'react'
import RichTextEditor from '../../../components/RichTextEditor'

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const AddLessonForm = ({ moduleId, onCreated }) => {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [attachment, setAttachment] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim() || !content) return
        setLoading(true)
        try {
            await api.post(`api/courses/${moduleId}/add-lesson/`, { title, content })
            setTitle('')
            setContent('')
            setAttachment(null)
            onCreated()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 border-t border-primary/20 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-action font-sans">Add a Lesson</p>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lesson title"
                className="w-full premium-input"
            />
            <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write lesson content…"
            />
            <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
                <span className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 hover:bg-primary/5 transition text-text/80">
                    {attachment ? attachment.name : 'Attach file (optional)'}
                </span>
                <input type="file" className="hidden" onChange={(e) => setAttachment(e.target.files[0])} />
            </label>
            <button
                type="submit"
                disabled={loading}
                className="self-start bg-action hover:bg-action active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
                {loading ? 'Adding…' : 'Add Lesson'}
            </button>
        </form>
    )
}

const TeacherModuleCard = ({ module, onDelete, onUpdate, navigate }) => {
    const [expanded, setExpanded] = useState(false)
    const [editing, setEditing] = useState(false)
    const [title, setTitle] = useState(module.title)
    const [order, setOrder] = useState(module.order)
    const [lessons, setLessons] = useState([])

    const fetchLessons = async () => {
        try {
            const res = await api.get(`api/courses/${module.id}/lessons/`)
            setLessons(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleToggle = () => {
        if (!expanded) fetchLessons()
        setExpanded(prev => !prev)
        setEditing(false)
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            await api.patch(`api/courses/modules/${module.id}/update-module/`, { title, order })
            onUpdate(module.id, { title, order })
            setEditing(false)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="premium-card overflow-hidden">
            {/* card header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
                <div className="flex items-center gap-4">
                    <span className="w-9 h-9 rounded-lg bg-action/10 border border-action/20 flex items-center justify-center text-action text-sm font-bold shrink-0">
                        {module.order}
                    </span>
                    <div>
                        <span className="text-text font-semibold text-base">{module.title}</span>
                        {module.done && (
                            <span className="ml-3 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">✓ Complete</span>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:ml-auto w-full sm:w-auto justify-end">
                    <button
                        onClick={() => { setEditing(prev => !prev); setExpanded(false) }}
                        className="text-sm text-primary hover:text-action px-3 py-2 rounded-lg hover:bg-primary/5 transition"
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleToggle}
                        className="text-sm text-primary hover:text-action px-3 py-2 rounded-lg hover:bg-primary/5 transition"
                    >
                        {expanded ? 'Hide' : 'Lessons'}
                    </button>
                    <button
                        onClick={() => onDelete(module.id)}
                        className="text-sm text-red-400/70 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/10 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* edit inline form */}
            {editing && (
                <form onSubmit={handleUpdate} className="px-6 pb-5 flex flex-col gap-3 border-t border-primary/20 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-action">Edit Module</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
                            className="flex-1 premium-input" />
                        <input type="number" value={order} onChange={(e) => setOrder(Math.max(1, parseInt(e.target.value, 10) || 1))} placeholder="Order"
                            min="1"
                            className="w-full sm:w-24 premium-input" />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-action hover:bg-action active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all">Save</button>
                        <button type="button" onClick={() => setEditing(false)} className="text-text/70 hover:text-text text-sm px-4 py-2.5 rounded-lg border border-primary/20 hover:bg-primary/5 transition">Cancel</button>
                    </div>
                </form>
            )}

            {/* lessons panel */}
            {expanded && (
                <div className="px-6 pb-6 border-t border-primary/20 pt-5 flex flex-col gap-2">
                    {lessons.length === 0 ? (
                        <p className="text-sm text-primary/70 italic">No lessons yet.</p>
                    ) : (
                        lessons.map(lesson => (
                            <button
                                key={lesson.id}
                                onClick={() => navigate(`/course/module/lessons/${lesson.id}`)}
                                className="flex items-center gap-4 w-full text-left px-4 py-4 rounded-lg bg-white/60 hover:bg-primary/5 border border-primary/20 hover:border-action/20 transition group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-action/10 border border-action/20 flex items-center justify-center text-action shrink-0">
                                    <svg className="w-4 h-4 text-action" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="text-base text-text/80 group-hover:text-text transition flex-1">{lesson.title}</span>
                                {lesson.done && <span className="ml-auto text-primary text-sm">✓</span>}
                            </button>
                        ))
                    )}
                    <AddLessonForm moduleId={module.id} onCreated={fetchLessons} />
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const StudentModuleCard = ({ module, navigate }) => {
    const [expanded, setExpanded] = useState(false)
    const [lessons, setLessons] = useState([])
    const [loadingLessons, setLoadingLessons] = useState(false)

    const fetchLessons = async () => {
        setLoadingLessons(true)
        try {
            const res = await api.get(`api/courses/${module.id}/lessons/`)
            setLessons(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingLessons(false)
        }
    }

    const handleToggle = () => {
        if (!expanded) fetchLessons()
        setExpanded(prev => !prev)
    }

    const doneCount = lessons.filter(l => l.done).length
    const totalCount = lessons.length

    return (
        <div className={`overflow-hidden transition ${module.done
            ? 'bg-primary/10 border border-primary/20 rounded-xl'
            : 'premium-card'}`}>

            {/* header */}
            <button
                onClick={handleToggle}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 text-left"
            >
                <div className="flex items-center gap-4">
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border shrink-0 ${module.done
                        ? 'bg-primary/10 border-primary/20 text-primary'
                        : 'bg-action/10 border-action/20 text-action'}`}>
                        {module.done ? '✓' : module.order}
                    </span>
                    <div>
                        <span className="text-text font-semibold text-base">{module.title}</span>
                        {module.done && (
                            <span className="ml-3 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">Complete</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-4 shrink-0 w-full sm:w-auto border-t border-primary/10 sm:border-0 pt-3 sm:pt-0">
                    {totalCount > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-primary/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${(doneCount / totalCount) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm text-primary">{doneCount}/{totalCount}</span>
                        </div>
                    )}
                    <span className="text-primary/70 text-sm">{expanded ? '▲' : '▼'}</span>
                </div>
            </button>

            {/* lessons panel */}
            {expanded && (
                <div className="px-6 pb-6 pt-1 border-t border-primary/20 flex flex-col gap-2">
                    {loadingLessons ? (
                        <p className="text-sm text-primary/70 animate-pulse py-3">Loading lessons…</p>
                    ) : lessons.length === 0 ? (
                        <p className="text-sm text-primary/70 italic py-3">No lessons in this module yet.</p>
                    ) : (
                        lessons.map(lesson => (
                            <button
                                key={lesson.id}
                                onClick={() => navigate(`/course/module/lessons/${lesson.id}`)}
                                className={`flex items-center gap-4 w-full text-left px-4 py-4 rounded-lg border transition group ${lesson.done
                                    ? 'bg-primary/10 border-primary/20'
                                    : 'bg-white/60 border-primary/20 hover:bg-primary/5 hover:border-action/20'}`}
                            >
                                    {lesson.done ? (
                                        <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-action/10 border border-action/20 flex items-center justify-center text-action shrink-0">
                                            <svg className="w-4 h-4 text-action" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    )}
                                <span className={`text-base transition flex-1 text-left ${lesson.done ? 'text-primary line-through' : 'text-text/80 group-hover:text-action'}`}>
                                    {lesson.title}
                                </span>
                                {!lesson.done && (
                                    <span className="text-sm text-primary/70 group-hover:text-action transition shrink-0">Read →</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const ModulesList = () => {
    const { course_id } = useParams()
    const navigate = useNavigate()
    const role = useSelector(state => state.users.user?.role)
    const isTeacher = role === 'Teacher'

    const [modules, setModules] = useState([])
    const [newTitle, setNewTitle] = useState('')
    const [newOrder, setNewOrder] = useState(1)
    const [adding, setAdding] = useState(false)
    const [showForm, setShowForm] = useState(false)

    const fetchModules = async () => {
        try {
            const res = await api.get(`api/courses/${course_id}/modules/`)
            setModules(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => { fetchModules() }, [course_id])

    const handleAddModule = async (e) => {
        e.preventDefault()
        if (!newTitle.trim()) return
        setAdding(true)
        try {
            await api.post(`api/courses/${course_id}/modules/add-module/`, {
                title: newTitle, course: course_id, order: newOrder,
            })
            setNewTitle('')
            setNewOrder(modules.length + 2)
            setShowForm(false)
            fetchModules()
        } catch (err) {
            console.error(err)
        } finally {
            setAdding(false)
        }
    }

    const handleDelete = async (moduleId) => {
        try {
            await api.delete(`api/courses/modules/${moduleId}/delete-module/`)
            setModules(prev => prev.filter(m => m.id !== moduleId))
        } catch (err) {
            console.error(err)
        }
    }

    const handleUpdate = (moduleId, data) => {
        setModules(prev => prev.map(m => m.id === moduleId ? { ...m, ...data } : m))
    }

    const completedModules = modules.filter(m => m.done).length

    return (
        <div className="flex flex-col gap-7 p-6 text-text">

            {/* ── page header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text">
                        {isTeacher ? 'Course Modules' : 'Course Content'}
                    </h1>
                    <p className="text-text/50 font-medium text-sm mt-1.5">
                        {isTeacher
                            ? `${modules.length} module${modules.length !== 1 ? 's' : ''} in this course`
                            : `${completedModules} of ${modules.length} modules completed`}
                    </p>
                </div>

                {isTeacher && (
                    <button
                        onClick={() => setShowForm(prev => !prev)}
                        className="flex items-center gap-2 bg-action hover:bg-action active:scale-95 text-white text-sm font-semibold px-5 py-3 rounded-lg transition-all"
                    >
                        <span className="text-lg leading-none">+</span> Add Module
                    </button>
                )}
            </div>

            {/* student: overall progress bar */}
            {!isTeacher && modules.length > 0 && (
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-primary/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${(completedModules / modules.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm text-primary shrink-0 font-medium">
                        {Math.round((completedModules / modules.length) * 100)}% complete
                    </span>
                </div>
            )}

            {/* teacher-only: add module form */}
            {isTeacher && showForm && (
                <form onSubmit={handleAddModule} className="premium-card p-6 border-action/30 flex flex-col gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-action font-sans">New Module</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Module title" autoFocus
                            className="flex-1 premium-input" />
                        <input type="number" value={newOrder} onChange={(e) => setNewOrder(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            min="1"
                            placeholder="Order"
                            className="w-full sm:w-24 premium-input" />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" disabled={adding}
                            className="bg-action hover:bg-action active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50">
                            {adding ? 'Creating…' : 'Create Module'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)}
                            className="text-text/70 hover:text-text text-sm px-4 py-2.5 rounded-lg border border-primary/20 hover:bg-primary/5 transition">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* modules list */}
            {modules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-primary/70 gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary/50">
                        <svg className="w-5 h-5 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <p className="text-base italic">
                        {isTeacher
                            ? 'No modules yet. Add one above to get started.'
                            : 'This course has no content yet.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {modules.map((module, i) => isTeacher ? (
                        <div key={module.id} className="animate-item-enter" style={{ animationDelay: `${i * 0.07}s` }}>
                            <TeacherModuleCard
                                module={module}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                                navigate={navigate}
                            />
                        </div>
                    ) : (
                        <div key={module.id} className="animate-item-enter" style={{ animationDelay: `${i * 0.07}s` }}>
                            <StudentModuleCard
                                module={module}
                                navigate={navigate}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ModulesList