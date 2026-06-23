import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux'
import { fetchSelectedCourse, updateCourse, deleteCourse, fetchClasses } from "../../features/courses/coursesSlice"
import { fetchUser } from "../../features/users/userSlice"
import NotFound from '../NotFound'

// ── reusable field wrapper ────────────────────────────────────────────────────
const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-[0.15em] text-action font-sans">{label}</label>
        {children}
    </div>
)

const inputClass = 'w-full premium-input'

// ── delete confirmation modal ────────────────────────────────────────────────
const DeleteModal = ({ courseName, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-background border border-primary/20 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[10px] font-bold text-red-500 mx-auto mb-4">
                DEL
            </div>
            <h2 className="text-lg font-bold text-text text-center">Delete Course?</h2>
            <p className="text-primary text-sm text-center mt-2 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="text-text font-semibold">"{courseName}"</span>?
                This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
                <button
                    onClick={onConfirm}
                    className="flex-1 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-sm font-semibold py-2.5 rounded-lg transition-all"
                >
                    Yes, delete it
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 bg-primary/5 hover:bg-primary/5 text-text/80 text-sm font-semibold py-2.5 rounded-lg transition-all"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
)

// ── main component ────────────────────────────────────────────────────────────
function CourseUpdate() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const selectedCourse = useSelector(state => state.courses.selectedCourse)
    const role = useSelector(state => state.users.user?.role)
    const availableClasses = useSelector(state => state.courses.classes) || []

    const [courseData, setCourseData] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        dispatch(fetchSelectedCourse(id))
        dispatch(fetchUser())
        dispatch(fetchClasses())
    }, [])

    useEffect(() => {
        if (selectedCourse && selectedCourse.id) {
            setCourseData(selectedCourse)
        }
    }, [selectedCourse])

    const handleUpdate = (k, v) => {
        setSaved(false)
        setCourseData(prev => ({ ...prev, [k]: v }))
    }

    const toggleClass = (classId) => {
        setSaved(false)
        setCourseData(prev => {
            const current = prev.student_classes || []
            const next = current.includes(classId)
                ? current.filter(c => c !== classId)
                : [...current, classId]
            return { ...prev, student_classes: next }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        try {
            const res = await dispatch(updateCourse(courseData))
            if (res.meta.requestStatus === 'fulfilled') {
                setSaved(true)
            } else {
                setError('Failed to save changes. Please try again.')
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        await dispatch(deleteCourse(courseData.id))
        navigate('/all-courses')
    }

    if (role !== 'Teacher') return <NotFound />

    return (
        <>
            {showDeleteModal && (
                <DeleteModal
                    courseName={courseData.course_name}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            <div className="flex flex-col gap-8 p-6 max-w-2xl text-text">

                {/* header */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-primary/70 mb-1">
                        <button
                            onClick={() => navigate(-1)}
                            className="hover:text-action transition flex items-center gap-1"
                        >
                            ← Back
                        </button>
                        <span>/</span>
                        <span className="text-primary">Edit Course</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-text">Edit Course</h1>
                    <p className="text-text/50 font-medium text-sm mt-1.5">
                        Update course details and manage enrolled students.
                    </p>
                </div>

                {/* status banners */}
                {error && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {saved && (
                    <div className="px-4 py-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm flex items-center gap-2">
                        <span>✓</span> Changes saved successfully.
                    </div>
                )}

                {/* form card */}
                <form onSubmit={handleSubmit} className="premium-card p-6 flex flex-col gap-5">

                    <Field label="Course Title">
                        <input
                            className={inputClass}
                            type="text"
                            required
                            value={courseData.course_name || ''}
                            onChange={(e) => handleUpdate('course_name', e.target.value)}
                            placeholder="e.g. Introduction to Algebra"
                        />
                    </Field>

                    <Field label="Subject">
                        <input
                            className={inputClass}
                            type="text"
                            required
                            value={courseData.subject || ''}
                            onChange={(e) => handleUpdate('subject', e.target.value)}
                            placeholder="e.g. Mathematics"
                        />
                    </Field>

                    <Field label="Description">
                        <textarea
                            className={`${inputClass} resize-none`}
                            rows={4}
                            value={courseData.description || ''}
                            onChange={(e) => handleUpdate('description', e.target.value)}
                            placeholder="What will students learn in this course?"
                        />
                    </Field>

                    <Field label="Thumbnail">
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <span className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-text/80 hover:bg-primary/10 transition group-hover:border-action/30 font-sans font-medium">
                                    {courseData.thumbnail instanceof File 
                                        ? courseData.thumbnail.name 
                                        : courseData.thumbnail 
                                            ? 'Change image…' 
                                            : 'Choose image…'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => handleUpdate('thumbnail', e.target.files[0])}
                                />
                            </label>
                            {courseData.thumbnail && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-text/50 font-sans font-medium">Current:</span>
                                    {courseData.thumbnail instanceof File ? (
                                        <span className="text-xs text-primary font-sans font-semibold">{courseData.thumbnail.name}</span>
                                    ) : (
                                        <a 
                                            href={courseData.thumbnail.startsWith('http') ? courseData.thumbnail : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${courseData.thumbnail}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs text-action hover:underline font-sans font-semibold truncate max-w-[200px]"
                                        >
                                            {courseData.thumbnail.split('/').pop()}
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </Field>

                    {/* Enroll Classes */}
                    <Field label="Enroll Classes">
                        {availableClasses.length === 0 ? (
                            <p className="text-primary/70 text-sm italic">No classes available yet.</p>
                        ) : (
                            <div className="bg-background/40 border border-primary/10 rounded-xl p-3 max-h-56 overflow-y-auto flex flex-col gap-2 pr-1 shadow-inner">
                                {availableClasses.map(cls => {
                                    const enrolled = (courseData.student_classes || []).includes(cls.id)
                                    return (
                                        <label
                                            key={cls.id}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
                                                ${enrolled 
                                                    ? 'bg-primary/10 border border-primary/30 shadow-sm' 
                                                    : 'bg-white/40 border border-primary/10 hover:bg-primary/5 hover:border-primary/25'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="accent-primary w-4 h-4 cursor-pointer"
                                                checked={enrolled}
                                                onChange={() => toggleClass(cls.id)}
                                            />
                                            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors duration-200
                                                ${enrolled ? 'bg-primary/20 border border-primary/30 text-primary' : 'bg-primary/5 border border-primary/10 text-primary/70'}`}>
                                                CLS
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-semibold transition-colors duration-200 ${enrolled ? 'text-text' : 'text-text/70 group-hover:text-text'}`}>
                                                    {cls.name}
                                                </span>
                                                <span className="text-[11px] text-primary/70">
                                                    {cls.students.length} student{cls.students.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            {enrolled && (
                                                <span className="ml-auto text-xs text-primary font-semibold tracking-wide bg-primary/10 px-2 py-0.5 rounded-full">Enrolled</span>
                                            )}
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </Field>

                    {/* Published toggle */}
                    <label className="flex items-center gap-3 cursor-pointer px-1">
                        <div className="relative" onClick={() => handleUpdate('published', !courseData.published)}>
                            <div className={`w-10 h-6 rounded-full transition-colors ${courseData.published ? 'bg-action' : 'bg-primary/5'}`} />
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${courseData.published ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-sm text-text/80">
                            {courseData.published ? 'Published' : 'Draft — not visible to students'}
                        </span>
                    </label>

                    {/* actions */}
                    <div className="pt-2 border-t border-primary/20 flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-action hover:bg-action active:scale-95 text-white text-sm font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Saving…' : 'Save Changes →'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="text-primary hover:text-text text-sm px-4 rounded-lg hover:bg-primary/5 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {/* danger zone */}
                <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-red-400">Danger Zone</p>
                        <p className="text-xs text-primary/70 mt-0.5">Permanently delete this course and all its content.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="shrink-0 bg-red-700/20 hover:bg-red-700/40 border border-red-700/40 hover:border-red-600/60 text-red-400 hover:text-red-300 text-sm font-semibold px-4 py-2 rounded-lg transition-all active:scale-95"
                    >
                        Delete Course
                    </button>
                </div>

            </div>
        </>
    )
}

export default CourseUpdate