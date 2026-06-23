import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createCourse, fetchClasses } from '../../features/courses/coursesSlice'

// ── reusable styled input ────────────────────────────────────────────────────
const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-action">{label}</label>
        {children}
    </div>
)

const inputClass =
    'bg-white/60 border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-text placeholder-slate-500 outline-none focus:border-action transition'

// ── step indicator ───────────────────────────────────────────────────────────
const StepDot = ({ n, active, done }) => (
    <div className="flex flex-col items-center gap-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
            ${done ? 'bg-action border-action text-white'
                : active ? 'bg-white/60 border-action text-action'
                    : 'bg-white/60 border-primary/20 text-primary/70'}`}>
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
                    <span className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-text/80 hover:bg-primary/5 transition group-hover:border-action/20">
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
                    <p className="text-primary/70 text-sm italic">No classes available yet.</p>
                ) : (
                    <div className="max-h-44 overflow-y-auto flex flex-col gap-1 pr-1">
                        {availableClasses.map(cls => (
                            <label
                                key={cls.id}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 cursor-pointer transition group"
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
                                <div className="w-7 h-7 rounded-md bg-action/10 border border-action/20 flex items-center justify-center text-[10px] text-action font-bold shrink-0">
                                    CLS
                                </div>
                                <span className="text-sm text-text/80 group-hover:text-text transition">
                                    {cls.name} <span className="text-xs text-primary/70 ml-1">({cls.students.length} students)</span>
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
                    <div className={`w-10 h-6 rounded-full transition-colors ${courseInfo.published ? 'bg-action' : 'bg-primary/5'}`} />
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${courseInfo.published ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm text-text/80">Publish immediately</span>
            </label>

            <div className="pt-2 border-t border-primary/20 flex gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-action hover:bg-action active:scale-95 text-white text-sm font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Creating course…' : 'Create Course →'}
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
    )

    // ── step 2: choice ───────────────────────────────────────────────────────
    const ChoiceStep = (
        <div className="flex flex-col gap-6">
            <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary font-sans mx-auto mb-4">DONE</div>
                <h2 className="text-xl font-bold text-text">
                    "{createdCourse?.course_name}" created!
                </h2>
                <p className="text-primary text-sm mt-1">What would you like to do next?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: go add modules now */}
                <button
                    onClick={() => navigate(`/course/${createdCourse.id}/modules/`)}
                    className="flex flex-col items-start gap-3 p-5 bg-action/10 border border-action/20 rounded-xl hover:bg-action/10 hover:border-action/20 active:scale-95 transition-all text-left group"
                >
                    <span className="text-xs font-bold text-action font-sans tracking-wider bg-action/10 border border-action/20 px-2 py-0.5 rounded">MOD</span>
                    <div>
                        <p className="text-sm font-semibold text-text group-hover:text-white transition">Add Modules & Lessons</p>
                        <p className="text-xs text-primary mt-1 leading-relaxed">Start building out the course content right now.</p>
                    </div>
                    <span className="text-xs text-action font-semibold mt-auto">Go →</span>
                </button>

                {/* Option B: finish later */}
                <button
                    onClick={() => navigate('/all-courses')}
                    className="flex flex-col items-start gap-3 p-5 bg-white/60 border border-primary/20 rounded-xl hover:bg-primary/5 hover:border-primary/20 active:scale-95 transition-all text-left group"
                >
                    <span className="text-xs font-bold text-primary font-sans tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">LIST</span>
                    <div>
                        <p className="text-sm font-semibold text-text group-hover:text-white transition">Save & Finish Later</p>
                        <p className="text-xs text-primary mt-1 leading-relaxed">The course is saved. You can add content from your Courses page anytime.</p>
                    </div>
                    <span className="text-xs text-primary font-semibold mt-auto group-hover:text-text/80 transition">View Courses →</span>
                </button>
            </div>
        </div>
    )

    // ── shell ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-8 p-6 max-w-2xl text-text">

            {/* header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <StepDot n={1} active={step === 'form'} done={step === 'choice'} />
                    <div className="flex-1 h-px bg-primary/5" />
                    <StepDot n={2} active={step === 'choice'} done={false} />
                </div>
                <div className="flex justify-between text-xs text-primary/70 px-1">
                    <span className={step === 'form' ? 'text-action font-semibold' : 'text-primary'}>Course Details</span>
                    <span className={step === 'choice' ? 'text-action font-semibold' : 'text-primary'}>Next Steps</span>
                </div>
            </div>

            {/* page title */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-text">
                    {step === 'form' ? 'Create New Course' : 'Course Created'}
                </h1>
                <p className="text-text/50 font-medium text-sm mt-1.5">
                    {step === 'form'
                        ? 'Fill in the details below. You can always edit this later.'
                        : 'Choose how you want to continue.'}
                </p>
            </div>

            {/* content */}
            <div className="premium-card p-6">
                {step === 'form' ? FormStep : ChoiceStep}
            </div>
        </div>
    )
}

export default CreateCourse