import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import RecentCourses from '../courses/RecentCourses'
import { fetchTeacherDashboard } from '../../features/users/userSlice'
import { fetchCourses } from '../../features/courses/coursesSlice'
import '../../style/style.css'

// ── Score Thresholds & Styling Constants ─────────────────────────────────────
const SCORE_THRESHOLDS = {
    HIGH: 80,
    PASS: 50,
}

const getScoreBadgeStyle = (score) => {
    if (score === "Pending" || score === null || score === undefined) {
        return "bg-action/10 text-action border-action/20"
    }
    const num = Number(score)
    if (num >= SCORE_THRESHOLDS.HIGH) {
        // >= 80%: Semantic green (contrast ratio > 7:1 in light and dark)
        return "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/60"
    }
    if (num >= SCORE_THRESHOLDS.PASS) {
        // 50% - 79%: Semantic amber (contrast ratio > 8:1 in light and dark)
        return "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700/60"
    }
    // < 50%: Semantic red (contrast ratio > 6.8:1 in light and dark)
    return "bg-red-100 text-red-900 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-700/60"
}

// ── Date Formatting Helpers ──────────────────────────────────────────────────
const formatRelativeTime = (isoString) => {
    if (!isoString) return '—'
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return '—'

    const now = new Date()
    const diffMs = now - date
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHours = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSec < 60) {
        return 'Just now'
    }
    if (diffMin < 60) {
        return `${diffMin} ${diffMin === 1 ? 'min' : 'mins'} ago`
    }
    if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    }
    if (diffDays === 1) {
        return 'Yesterday'
    }
    if (diffDays < 7) {
        return `${diffDays} days ago`
    }
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatFullDateTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    })
}

function Teacher() {
    const dispatch = useDispatch()
    const { dashboardMetrics, dashboardLoading } = useSelector(state => state.users)

    useEffect(() => {
        dispatch(fetchTeacherDashboard())
        dispatch(fetchCourses())
    }, [dispatch])

    if (dashboardLoading || !dashboardMetrics) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse text-xl text-primary font-serif font-bold tracking-wide">Loading dashboard...</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 text-text font-sans">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text">
                        Teacher Dashboard
                    </h1>
                    <p className="text-text/75 mt-1 font-medium text-sm">Welcome back! Here is an overview of your active classes.</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="animate-scale-in premium-card p-6 hover:-translate-y-1 transition duration-300" style={{ animationDelay: '0.05s' }}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-primary text-xs font-bold uppercase tracking-[0.15em] font-sans">Total Courses</p>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-4xl font-serif font-bold text-text">{dashboardMetrics.total_courses}</h3>
                </div>

                <div className="animate-scale-in premium-card p-6 hover:-translate-y-1 transition duration-300" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-primary text-xs font-bold uppercase tracking-[0.15em] font-sans">Total Students</p>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-4xl font-serif font-bold text-text">{dashboardMetrics.total_students}</h3>
                </div>

                <div className="animate-scale-in premium-card p-6 hover:-translate-y-1 transition duration-300" style={{ animationDelay: '0.15s' }}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <p className="text-primary text-xs font-bold uppercase tracking-[0.15em] font-sans">Class Engagement</p>
                            {/* Tooltip explaining the metric */}
                            <div className="relative group">
                                <button
                                    aria-label="What is Class Engagement?"
                                    className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center hover:bg-primary/30 transition-colors cursor-help"
                                >
                                    ?
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-surface border border-border rounded-xl p-3 shadow-xl text-xs text-text/80 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                    <p className="font-semibold text-text mb-1">How it's calculated</p>
                                    <p>Percentage of enrolled students who have submitted at least one quiz. 50%+ is healthy; below 20% may signal low activity.</p>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
                                </div>
                            </div>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        {dashboardMetrics.engagement != null ? (
                            <>
                                <h3 className="text-4xl font-serif font-bold text-text">{dashboardMetrics.engagement}%</h3>
                                <span className={`text-xs font-semibold ${dashboardMetrics.engagement >= 50 ? 'text-primary' : dashboardMetrics.engagement >= 20 ? 'text-action' : 'text-red-400'}`}>
                                    {dashboardMetrics.engagement >= 50 ? '↑ Good' : dashboardMetrics.engagement >= 20 ? '~ Fair' : '↓ Low'}
                                </span>
                            </>
                        ) : (
                            <>
                                <h3 className="text-4xl font-serif font-bold text-primary/70">N/A</h3>
                                <span className="text-xs text-primary font-medium">No quizzes yet</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Layout — Full-width Recent Submissions */}
            <div className="w-full mt-4">
                <div className="premium-card p-6 min-h-[300px] flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b border-primary/10 pb-3">
                        <h2 className="text-primary text-sm font-bold uppercase tracking-[0.15em] font-sans">Recent Quiz Submissions</h2>
                    </div>

                    {dashboardMetrics.recent_submissions && dashboardMetrics.recent_submissions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-primary text-xs font-bold tracking-wider uppercase border-b border-primary/20 bg-primary/5">
                                        <th className="py-3 px-4 font-semibold rounded-tl-lg">Student Name</th>
                                        <th className="py-3 px-4 font-semibold">Quiz Title</th>
                                        <th className="py-3 px-4 font-semibold">Submitted</th>
                                        <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardMetrics.recent_submissions.map((sub, i) => (
                                        <tr key={sub.id}
                                            className="animate-item-enter border-b border-primary/10"
                                            style={{ animationDelay: `${i * 0.05}s` }}
                                        >
                                            <td className="py-4 px-4 font-medium text-text flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shadow-sm border border-primary/30 shrink-0">
                                                    {sub.student_name.charAt(0)}
                                                </div>
                                                <span>{sub.student_name}</span>
                                            </td>
                                            <td className="py-4 px-4 text-primary font-medium">{sub.quiz_title}</td>
                                            <td className="py-4 px-4 text-text/75 text-sm" title={formatFullDateTime(sub.submitted_at)}>
                                                {formatRelativeTime(sub.submitted_at)}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {sub.score !== "Pending" ? (
                                                    <span className={`inline-block py-1 px-3 rounded-full text-sm font-bold shadow-sm border tabular-nums ${getScoreBadgeStyle(sub.score)}`}>
                                                        {Number(sub.score).toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="bg-action/10 text-action py-1 px-3 rounded-full text-sm font-semibold shadow-sm border border-action/20">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-primary/80 space-y-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary/60">
                                <svg className="w-5 h-5 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <p className="italic text-xs text-primary/75">No recent quiz submissions yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Full-width My Latest Courses row */}
            <div className="mt-2 premium-card p-6">
                <h2 className="text-primary text-sm font-bold uppercase tracking-[0.15em] font-sans mb-6">My Latest Courses</h2>
                <RecentCourses />
            </div>

        </div>
    )
}

export default Teacher;