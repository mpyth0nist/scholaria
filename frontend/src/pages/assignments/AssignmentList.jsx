import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchAssignments, deleteAssignment } from '../../features/assignments/assignmentSlice'

const AssignmentList = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { assignments, loading } = useSelector(state => state.assignments)
    const role = useSelector(state => state.users.user?.role)
    const isTeacher = role === 'Teacher'

    useEffect(() => { dispatch(fetchAssignments()) }, [])

    const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this assignment and all student submissions?')) return
        dispatch(deleteAssignment(id))
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-6">
                <div className="h-8 w-48 bg-primary/5 rounded-lg animate-pulse" />
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-white/60 rounded-xl animate-pulse border border-primary/20" />
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6 text-text">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text">Assignments</h1>
                    <p className="text-text/50 font-medium text-sm mt-1.5">
                        {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} available
                    </p>
                </div>
                {isTeacher && (
                    <button
                        onClick={() => navigate('/assignments/create/')}
                        className="flex items-center gap-2 bg-action hover:bg-action active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
                    >
                        <span className="text-lg leading-none">+</span> New Assignment
                    </button>
                )}
            </div>

            {/* Empty state */}
            {assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-primary/70 gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-sm italic text-primary/60">
                        {isTeacher ? 'No assignments yet. Create your first one.' : 'No assignments available yet.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {assignments.map((assignment, i) => {
                        const isPastDue = new Date(assignment.due_date) < new Date()
                        const submission = assignment.my_submission // student's own (null for teachers)
                        const isGraded = submission?.score != null
                        const isSubmitted = !!submission

                        return (
                            <div
                                key={assignment.id}
                                className="animate-item-enter btn-press group bg-white/60 border border-primary/20 rounded-xl px-5 py-4 hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-4"
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-lg bg-action/10 border border-action/20 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-action" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>

                                {/* Info */}
                                <div className="flex flex-col min-w-0 flex-1">
                                    <button
                                        onClick={() => navigate(`/assignments/${assignment.id}/`)}
                                        className="text-text font-semibold text-sm text-left hover:text-action cursor-pointer transition truncate"
                                    >
                                        {assignment.name}
                                    </button>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        {assignment.description && (
                                            <p className="text-xs text-text/50 truncate max-w-xs">{assignment.description}</p>
                                        )}
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                                            isPastDue
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-action/10 text-action border-amber-500/20'
                                        }`}>
                                            Due {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        {/* Teacher: show submission count */}
                                        {isTeacher && (
                                            <span className="text-xs text-text/40">
                                                {assignment.submissions?.length ?? 0} submission{(assignment.submissions?.length ?? 0) !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {isTeacher ? (
                                        <>
                                            <button
                                                onClick={() => navigate(`/assignments/${assignment.id}/`)}
                                                className="text-xs text-primary hover:text-action px-3 py-1.5 rounded-lg hover:bg-primary/5 transition"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => navigate(`/assignments/${assignment.id}/update/`)}
                                                className="text-xs text-primary hover:text-action px-3 py-1.5 rounded-lg hover:bg-primary/5 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(assignment.id)}
                                                className="text-xs text-red-400/60 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    ) : isGraded ? (
                                        /* Score badge */
                                        <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${
                                            Number(submission.score) >= 50
                                                ? 'bg-primary/10 border-primary/20 text-primary'
                                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                                        }`}>
                                            <span className="text-lg font-black leading-none">
                                                {Number(submission.score).toFixed(0)}%
                                            </span>
                                            <span className="text-[10px] font-medium mt-0.5 tracking-wide uppercase opacity-70">
                                                {Number(submission.score) >= 50 ? 'Passed' : 'Failed'}
                                            </span>
                                        </div>
                                    ) : isSubmitted ? (
                                        /* Pending badge */
                                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            ⏳ Awaiting Grade
                                        </span>
                                    ) : (
                                        /* Not submitted */
                                        <button
                                            onClick={() => navigate(`/assignments/${assignment.id}/`)}
                                            className="bg-action hover:bg-action active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                                        >
                                            Submit →
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default AssignmentList
