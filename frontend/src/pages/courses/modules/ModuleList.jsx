import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../../api'
import { useEffect, useState } from 'react'

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
        if (!title.trim() || !content.trim()) return
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
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-slate-700/50 pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Add a Lesson</p>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lesson title"
                className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500 transition"
            />
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Lesson content"
                rows={4}
                className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500 transition resize-none"
            />
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <span className="bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-2 hover:bg-slate-700 transition text-slate-300">
                    {attachment ? attachment.name : 'Attach file (optional)'}
                </span>
                <input type="file" className="hidden" onChange={(e) => setAttachment(e.target.files[0])} />
            </label>
            <button
                type="submit"
                disabled={loading}
                className="self-start bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all disabled:opacity-50"
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
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden transition hover:border-violet-700/40">
            <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-md bg-violet-700/30 border border-violet-600/40 flex items-center justify-center text-violet-300 text-xs font-bold">
                        {module.order}
                    </span>
                    <span className="text-slate-200 font-semibold text-sm">{module.title}</span>
                    {module.done && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">✓ Complete</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setEditing(prev => !prev); setExpanded(false) }}
                        className="text-xs text-slate-400 hover:text-violet-300 px-3 py-1.5 rounded-lg hover:bg-slate-700/50 transition">
                        ✏️ Edit
                    </button>
                    <button onClick={handleToggle}
                        className="text-xs text-slate-400 hover:text-violet-300 px-3 py-1.5 rounded-lg hover:bg-slate-700/50 transition">
                        {expanded ? '▲ Hide' : '▼ Lessons'}
                    </button>
                    <button onClick={() => onDelete(module.id)}
                        className="text-xs text-red-400/70 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                        🗑 Delete
                    </button>
                </div>
            </div>

            {editing && (
                <form onSubmit={handleUpdate} className="px-5 pb-4 flex flex-col gap-3 border-t border-slate-700/50 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Edit Module</p>
                    <div className="flex gap-3">
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
                            className="flex-1 bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500 transition" />
                        <input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10))} placeholder="Order"
                            className="w-24 bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500 transition" />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all">Save</button>
                        <button type="button" onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-200 text-sm px-4 py-2 rounded-lg hover:bg-slate-700/50 transition">Cancel</button>
                    </div>
                </form>
            )}

            {expanded && (
                <div className="px-5 pb-5 border-t border-slate-700/50 pt-4 flex flex-col gap-2">
                    {lessons.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No lessons yet.</p>
                    ) : (
                        lessons.map(lesson => (
                            <button key={lesson.id} onClick={() => navigate(`/course/module/lessons/${lesson.id}`)}
                                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-slate-900/40 hover:bg-slate-700/40 border border-slate-700/30 hover:border-violet-700/40 transition group">
                                <span className="text-violet-400 text-xs">📄</span>
                                <span className="text-sm text-slate-300 group-hover:text-slate-100 transition">{lesson.title}</span>
                                {lesson.done && <span className="ml-auto text-emerald-400 text-xs">✓</span>}
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
        <div className={`rounded-xl overflow-hidden border transition ${module.done
            ? 'bg-emerald-900/10 border-emerald-700/40'
            : 'bg-slate-800/60 border-slate-700/50 hover:border-violet-700/30'}`}>

            {/* header */}
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
                <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold border ${module.done
                        ? 'bg-emerald-700/30 border-emerald-600/40 text-emerald-300'
                        : 'bg-violet-700/30 border-violet-600/40 text-violet-300'}`}>
                        {module.done ? '✓' : module.order}
                    </span>
                    <span className="text-slate-200 font-semibold text-sm">{module.title}</span>
                    {module.done && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Complete</span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* progress indicator shown once lessons are loaded */}
                    {totalCount > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                    style={{ width: `${(doneCount / totalCount) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-400">{doneCount}/{totalCount}</span>
                        </div>
                    )}
                    <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
                </div>
            </button>

            {/* lessons panel */}
            {expanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-700/40 flex flex-col gap-2">
                    {loadingLessons ? (
                        <p className="text-xs text-slate-500 animate-pulse py-3">Loading lessons…</p>
                    ) : lessons.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-3">No lessons in this module yet.</p>
                    ) : (
                        lessons.map(lesson => (
                            <button
                                key={lesson.id}
                                onClick={() => navigate(`/course/module/lessons/${lesson.id}`)}
                                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg border transition group ${lesson.done
                                    ? 'bg-emerald-900/10 border-emerald-700/30'
                                    : 'bg-slate-900/40 border-slate-700/30 hover:bg-slate-700/40 hover:border-violet-700/40'}`}
                            >
                                <span className={`text-xs shrink-0 ${lesson.done ? 'text-emerald-400' : 'text-violet-400'}`}>
                                    {lesson.done ? '✅' : '📄'}
                                </span>
                                <span className={`text-sm transition flex-1 text-left ${lesson.done ? 'text-slate-400 line-through' : 'text-slate-300 group-hover:text-slate-100'}`}>
                                    {lesson.title}
                                </span>
                                {!lesson.done && (
                                    <span className="text-xs text-slate-500 group-hover:text-violet-400 transition">Read →</span>
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

    // Compute overall progress for student header
    const completedModules = modules.filter(m => m.done).length

    return (
        <div className="flex flex-col gap-6 p-6 text-slate-100">

            {/* ── page header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        {isTeacher ? 'Course Modules' : 'Course Content'}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {isTeacher
                            ? `${modules.length} module${modules.length !== 1 ? 's' : ''} in this course`
                            : `${completedModules} of ${modules.length} modules completed`}
                    </p>
                </div>

                {/* teacher-only: add module button */}
                {isTeacher && (
                    <button
                        onClick={() => setShowForm(prev => !prev)}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
                    >
                        <span className="text-lg leading-none">+</span> Add Module
                    </button>
                )}
            </div>

            {/* student: overall progress bar */}
            {!isTeacher && modules.length > 0 && (
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${(completedModules / modules.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                        {Math.round((completedModules / modules.length) * 100)}% complete
                    </span>
                </div>
            )}

            {/* teacher-only: add module form */}
            {isTeacher && showForm && (
                <form onSubmit={handleAddModule} className="bg-slate-800/60 border border-violet-700/40 rounded-xl p-5 flex flex-col gap-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">New Module</p>
                    <div className="flex gap-3">
                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Module title" autoFocus
                            className="flex-1 bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500 transition" />
                        <input type="number" value={newOrder} onChange={(e) => setNewOrder(parseInt(e.target.value, 10))}
                            placeholder="Order"
                            className="w-24 bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500 transition" />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" disabled={adding}
                            className="bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all disabled:opacity-50">
                            {adding ? 'Creating…' : 'Create Module'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)}
                            className="text-slate-400 hover:text-slate-200 text-sm px-4 py-2 rounded-lg hover:bg-slate-700/50 transition">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* modules list */}
            {modules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                    <span className="text-4xl">{isTeacher ? '📦' : '📭'}</span>
                    <p className="text-sm italic">
                        {isTeacher
                            ? 'No modules yet. Add one above to get started.'
                            : 'This course has no content yet.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {modules.map(module => isTeacher ? (
                        <TeacherModuleCard
                            key={module.id}
                            module={module}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            navigate={navigate}
                        />
                    ) : (
                        <StudentModuleCard
                            key={module.id}
                            module={module}
                            navigate={navigate}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default ModulesList