import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createCourse, fetchClasses } from '../../features/courses/coursesSlice'

// ── reusable styled input ────────────────────────────────────────────────────
const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-violet-400">{label}</label>
        {children}
    </div>
)

const inputClass =
    'bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500 transition'

// ── step indicator ───────────────────────────────────────────────────────────
const StepDot = ({ n, active, done }) => (
    <div className="flex flex-col items-center gap-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
            ${done ? 'bg-violet-600 border-violet-500 text-white'
                : active ? 'bg-slate-800 border-violet-500 text-violet-300'
                    : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
            {done ? '✓' : n}
        </div>
    </div>
)

// ── main component ───────────────────────────────────────────────────────────
const CreateCourse = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // step: 'form' | 'choice'
    const [step, setStep] = useState('form')
    const [createdCourse, setCreatedCourse] = useState(null)  // holds the created course object

    const [courseInfo, setCourseInfo] = useState({
        course_name: '',
        subject: '',
        thumbnail: null,
        description: '',
        published: false,
        done: false,
        student_classes: [],
    })
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const availableClasses = useSelector(state => state.courses.classes) || []

    useEffect(() => {
        dispatch(fetchClasses())
    }, [dispatch])

    const handleField = (name, value) => setCourseInfo(prev => ({ ...prev, [name]: value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        try {
            const res = await dispatch(createCourse(courseInfo))
            if (res.meta.requestStatus === 'fulfilled') {
                setCreatedCourse(res.payload)   // { id, course_name, ... }
                setStep('choice')
            } else {
                setError('Failed to create course. Please check your inputs and try again.')
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setSubmitting(false)
        }
    }

    // ── step 1: course details form ──────────────────────────────────────────
    const FormStep = (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <Field label="Course Title">
                <input
                    className={inputClass}
                    type="text"
                    name="course_name"
                    required
                    value={courseInfo.course_name}
                    onChange={e => handleField(e.target.name, e.target.value)}
                    placeholder="e.g. Introduction to Algebra"
                    autoFocus
                />
            </Field>

            <Field label="Subject">
                <input
                    className={inputClass}
                    type="text"
                    name="subject"
                    required
                    value={courseInfo.subject}
                    onChange={e => handleField(e.target.name, e.target.value)}
                    placeholder="e.g. Mathematics"
                />
            </Field>

            <Field label="Description">
                <textarea
                    className={`${inputClass} resize-none`}
                    name="description"
                    rows={4}
                    value={courseInfo.description}
                    placeholder="What will students learn in this course?"
                    onChange={e => handleField(e.target.name, e.target.value)}
                />
            </Field>

            <Field label="Thumbnail (optional)">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <span className="bg-slate-700/60 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition group-hover:border-violet-500/50">
                        {courseInfo.thumbnail ? courseInfo.thumbnail.name : 'Choose image…'}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleField('thumbnail', e.target.files[0])}
                    />
                </label>
            </Field>

            {/* Enroll Classes */}
            <Field label="Enroll Classes">
                {availableClasses.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No classes available yet.</p>
                ) : (
                    <div className="max-h-44 overflow-y-auto flex flex-col gap-1 pr-1">
                        {availableClasses.map(cls => (
                            <label
                                key={cls.id}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/30 cursor-pointer transition group"
                            >
                                <input
                                    type="checkbox"
                                    className="accent-violet-500 w-4 h-4"
                                    checked={courseInfo.student_classes.includes(cls.id)}
                                    onChange={() => setCourseInfo(prev => ({
                                        ...prev,
                                        student_classes: prev.student_classes.includes(cls.id)
                                            ? prev.student_classes.filter(c => c !== cls.id)
                                            : [...prev.student_classes, cls.id]
                                    }))}
                                />
                                <div className="w-7 h-7 rounded-md bg-violet-700/30 border border-violet-600/30 flex items-center justify-center text-xs text-violet-300 font-semibold shrink-0">
                                    🏫
                                </div>
                                <span className="text-sm text-slate-300 group-hover:text-slate-100 transition">
                                    {cls.name} <span className="text-xs text-slate-500 ml-1">({cls.students.length} students)</span>
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </Field>

            {/* Published toggle */}
            <label className="flex items-center gap-3 cursor-pointer px-1">
                <div className="relative">
                    <input
                        type="checkbox"
                        className="sr-only"
                        name="published"
                        checked={courseInfo.published}
                        onChange={e => handleField(e.target.name, e.target.checked)}
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${courseInfo.published ? 'bg-violet-600' : 'bg-slate-700'}`} />
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${courseInfo.published ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm text-slate-300">Publish immediately</span>
            </label>

            <div className="pt-2 border-t border-slate-700/50 flex gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Creating course…' : 'Create Course →'}
                </button>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="text-slate-400 hover:text-slate-200 text-sm px-4 rounded-lg hover:bg-slate-700/50 transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    )

    // ── step 2: choice ───────────────────────────────────────────────────────
    const ChoiceStep = (
        <div className="flex flex-col gap-6">
            <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto mb-4">✅</div>
                <h2 className="text-xl font-bold text-slate-100">
                    "{createdCourse?.course_name}" created!
                </h2>
                <p className="text-slate-400 text-sm mt-1">What would you like to do next?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: go add modules now */}
                <button
                    onClick={() => navigate(`/course/${createdCourse.id}/modules/`)}
                    className="flex flex-col items-start gap-3 p-5 bg-violet-700/10 border border-violet-600/40 rounded-xl hover:bg-violet-700/20 hover:border-violet-500/60 active:scale-95 transition-all text-left group"
                >
                    <span className="text-3xl">📦</span>
                    <div>
                        <p className="text-sm font-semibold text-slate-100 group-hover:text-white transition">Add Modules & Lessons</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">Start building out the course content right now.</p>
                    </div>
                    <span className="text-xs text-violet-400 font-semibold mt-auto">Go →</span>
                </button>

                {/* Option B: finish later */}
                <button
                    onClick={() => navigate('/all-courses')}
                    className="flex flex-col items-start gap-3 p-5 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:bg-slate-700/40 hover:border-slate-600/60 active:scale-95 transition-all text-left group"
                >
                    <span className="text-3xl">🗂️</span>
                    <div>
                        <p className="text-sm font-semibold text-slate-100 group-hover:text-white transition">Save & Finish Later</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">The course is saved. You can add content from your Courses page anytime.</p>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold mt-auto group-hover:text-slate-300 transition">View Courses →</span>
                </button>
            </div>
        </div>
    )

    // ── shell ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-8 p-6 max-w-2xl text-slate-100">

            {/* header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <StepDot n={1} active={step === 'form'} done={step === 'choice'} />
                    <div className="flex-1 h-px bg-slate-700/50" />
                    <StepDot n={2} active={step === 'choice'} done={false} />
                </div>
                <div className="flex justify-between text-xs text-slate-500 px-1">
                    <span className={step === 'form' ? 'text-violet-400 font-semibold' : 'text-slate-400'}>Course Details</span>
                    <span className={step === 'choice' ? 'text-violet-400 font-semibold' : 'text-slate-400'}>Next Steps</span>
                </div>
            </div>

            {/* page title */}
            <div>
                <h1 className="text-2xl font-bold text-slate-100">
                    {step === 'form' ? 'Create New Course' : 'Course Created'}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    {step === 'form'
                        ? 'Fill in the details below. You can always edit this later.'
                        : 'Choose how you want to continue.'}
                </p>
            </div>

            {/* content */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
                {step === 'form' ? FormStep : ChoiceStep}
            </div>
        </div>
    )
}

export default CreateCourse