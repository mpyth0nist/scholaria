import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    fetchAssignment,
    submitAssignment,
    gradeSubmission,
    deleteAssignment,
    clearSubmitSuccess,
    clearGradeSuccess,
} from '../../features/assignments/assignmentSlice'

const BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

const FileLink = ({ url, label }) => {
    if (!url) return null
    const href = url.startsWith('http') ? url : `${BASE}${url}`
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-action border border-action/20 bg-action/10 hover:bg-action/20 px-5 py-3 rounded-lg transition btn-press w-fit"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {label}
        </a>
    )
}

// ── Teacher: grading panel for one submission ─────────────────────────────────
const SubmissionRow = ({ sub, onGrade }) => {
    const [score, setScore] = useState(sub.score != null ? String(sub.score) : '')
    const [feedback, setFeedback] = useState(sub.feedback || '')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)
        await onGrade(sub.id, score, feedback)
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const href = sub.file?.startsWith('http') ? sub.file : `${BASE}${sub.file}`

    return (
        <div className="flex flex-col gap-3 bg-white/60 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <p className="text-sm font-semibold text-text">{sub.student_name ?? `Student #${sub.student}`}</p>
                    <p className="text-xs text-text/40 mt-0.5">
                        Submitted {new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-action border border-action/20 bg-action/10 hover:bg-action/20 px-3 py-1.5 rounded-lg transition"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Submission
                </a>
            </div>

            <div className="flex items-end gap-3 flex-wrap">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-action">Score (0-100)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={score}
                        onChange={e => setScore(e.target.value)}
                        placeholder="—"
                        className="w-24 bg-white/60 border border-primary/20 rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-action transition"
                    />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-action">Feedback (optional)</label>
                    <input
                        type="text"
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        placeholder="Well done! / Please revise…"
                        className="bg-white/60 border border-primary/20 rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-action transition w-full"
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || score === ''}
                    className="self-end bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-40 btn-press"
                >
                    {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Grade'}
                </button>
            </div>
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────
const AssignmentPage = () => {
    const { assignment_id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { currentAssignment: assignment, loading, error, submitSuccess } = useSelector(state => state.assignments)
    const role = useSelector(state => state.users.user?.role)
    const isTeacher = role === 'Teacher'

    const [file, setFile] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    useEffect(() => {
        dispatch(fetchAssignment(assignment_id))
        return () => { dispatch(clearSubmitSuccess()); dispatch(clearGradeSuccess()) }
    }, [assignment_id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) return
        setSubmitting(true)
        setSubmitError(null)
        const formData = new FormData()
        formData.append('file', file)
        const result = await dispatch(submitAssignment({ assignmentId: assignment_id, formData }))
        if (submitAssignment.rejected.match(result)) {
            const detail = result.payload?.detail || result.payload?.file?.[0] || 'Failed to submit. Please try again.'
            setSubmitError(detail)
        }
        setSubmitting(false)
    }

    const handleGrade = async (submissionId, score, feedback) => {
        await dispatch(gradeSubmission({ submissionId, score: parseFloat(score), feedback }))
    }

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading || !assignment) {
        return (
            <div className="flex items-center justify-center h-64 text-action animate-pulse text-sm">
                Loading assignment…
            </div>
        )
    }

    const isPastDue = new Date(assignment.due_date) < new Date()
    const mySubmission = assignment.my_submission

    // ── STUDENT VIEW ──────────────────────────────────────────────────────────
    if (!isTeacher) {
        const isGraded = mySubmission?.score != null
        return (
            <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-2xl mx-auto text-text animate-page-enter">
                <button
                    onClick={() => navigate('/assignments/list/')}
                    className="text-sm text-primary hover:text-action transition w-fit flex items-center gap-1.5"
                >
                    ← Back to Assignments
                </button>

                {/* Title */}
                <div>
                    <h1 className="text-3xl font-bold text-text">{assignment.name}</h1>
                    {assignment.description && (
                        <p className="text-text/50 mt-1 text-sm">{assignment.description}</p>
                    )}
                    <span className={`mt-2 inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${
                        isPastDue
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-action/10 text-action border-amber-500/20'
                    }`}>
                        Due {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>

                {/* Assignment document */}
                <div className="bg-white/60 border border-primary/20 rounded-xl p-6 flex flex-col gap-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-action">Assignment Document</p>
                    <p className="text-sm text-text/70">Download the assignment document, complete it, then upload your answer below.</p>
                    <FileLink url={assignment.document} label="Download Assignment PDF" />
                </div>

                {/* Submission section */}
                <div className="bg-white/60 border border-primary/20 rounded-xl p-6 flex flex-col gap-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-action">Your Submission</p>

                    {isGraded ? (
                        /* ── Graded ── */
                        <div className="flex flex-col gap-4">
                            <div className={`flex items-center gap-4 px-5 py-4 rounded-xl border ${
                                Number(mySubmission.score) >= 50
                                    ? 'bg-primary/10 border-primary/20'
                                    : 'bg-red-500/10 border-red-500/20'
                            }`}>
                                <span className={`text-4xl font-black ${Number(mySubmission.score) >= 50 ? 'text-primary' : 'text-red-400'}`}>
                                    {Number(mySubmission.score).toFixed(0)}%
                                </span>
                                <div>
                                    <p className={`font-semibold text-sm ${Number(mySubmission.score) >= 50 ? 'text-primary' : 'text-red-400'}`}>
                                        {Number(mySubmission.score) >= 50 ? 'Assignment Passed' : 'Assignment Failed'}
                                    </p>
                                    {mySubmission.feedback && (
                                        <p className="text-xs text-text/60 mt-1 italic">"{mySubmission.feedback}"</p>
                                    )}
                                </div>
                            </div>
                            <FileLink url={mySubmission.file} label="View Your Submitted File" />
                        </div>
                    ) : mySubmission ? (
                        /* ── Submitted, awaiting grade ── */
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 px-5 py-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <span className="text-amber-500 text-lg">⏳</span>
                                <div>
                                    <p className="text-sm font-semibold text-amber-600">Awaiting Grade</p>
                                    <p className="text-xs text-text/50 mt-0.5">
                                        Submitted {new Date(mySubmission.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <FileLink url={mySubmission.file} label="View Your Submitted File" />
                            {!isPastDue && (
                                <div className="border-t border-primary/15 pt-4">
                                    <p className="text-xs text-text/50 mb-3">Want to replace your submission? Upload a new file below.</p>
                                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                            <span className="flex items-center gap-2 bg-white/80 border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-text/70 group-hover:border-action/40 group-hover:text-action transition">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                {file ? file.name : 'Choose replacement file…'}
                                            </span>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                className="hidden"
                                                onChange={e => setFile(e.target.files[0])}
                                            />
                                        </label>
                                        {submitError && <p className="text-red-400 text-xs">{submitError}</p>}
                                        <button
                                            type="submit"
                                            disabled={!file || submitting}
                                            className="self-start bg-action text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-40 btn-press"
                                        >
                                            {submitting ? 'Uploading…' : 'Replace Submission'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : isPastDue ? (
                        /* ── Past due, never submitted ── */
                        <div className="px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-sm font-semibold text-red-400">Submission Closed</p>
                            <p className="text-xs text-text/50 mt-1">The due date has passed. You did not submit this assignment.</p>
                        </div>
                    ) : (
                        /* ── Not yet submitted ── */
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <p className="text-sm text-text/60">Upload your completed assignment as a PDF or Word document.</p>
                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <span className="flex items-center gap-2 bg-white/80 border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-text/70 group-hover:border-action/40 group-hover:text-action transition">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    {file ? file.name : 'Choose your answer file…'}
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={e => setFile(e.target.files[0])}
                                />
                            </label>
                            {submitError && <p className="text-red-400 text-xs">{submitError}</p>}
                            {submitSuccess && (
                                <p className="text-primary text-xs font-semibold">✓ Submitted successfully!</p>
                            )}
                            <button
                                type="submit"
                                disabled={!file || submitting}
                                className="self-start bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-40 btn-press text-sm"
                            >
                                {submitting ? 'Uploading…' : 'Submit Assignment →'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        )
    }

    // ── TEACHER VIEW ──────────────────────────────────────────────────────────
    const submissions = assignment.submissions ?? []

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-3xl mx-auto text-text animate-page-enter">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <button
                    onClick={() => navigate('/assignments/list/')}
                    className="text-sm text-primary hover:text-action transition flex items-center gap-1.5"
                >
                    ← Back
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/assignments/${assignment.id}/update/`)}
                        className="text-sm text-primary hover:text-action px-3 py-2 rounded-lg hover:bg-primary/5 transition"
                    >
                        Edit
                    </button>
                </div>
            </div>

            {/* Assignment info */}
            <div>
                <h1 className="text-3xl font-bold text-text">{assignment.name}</h1>
                {assignment.description && <p className="text-text/50 text-sm mt-1">{assignment.description}</p>}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        isPastDue
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-action/10 text-action border-amber-500/20'
                    }`}>
                        Due {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-text/40">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Document */}
            <div className="bg-white/60 border border-primary/20 rounded-xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-action mb-3">Assignment Document</p>
                <FileLink url={assignment.document} label="View / Download Assignment PDF" />
            </div>

            {/* Submissions */}
            <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/50">
                    Student Submissions ({submissions.length})
                </p>
                {submissions.length === 0 ? (
                    <div className="flex items-center justify-center py-16 bg-white/60 border border-primary/20 rounded-xl">
                        <p className="text-sm text-text/40 italic">No submissions yet.</p>
                    </div>
                ) : (
                    submissions.map(sub => (
                        <SubmissionRow key={sub.id} sub={sub} onGrade={handleGrade} />
                    ))
                )}
            </div>
        </div>
    )
}

export default AssignmentPage
