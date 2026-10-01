import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import RecentCourses from '../courses/RecentCourses'
import TeacherCard from '../../components/TeacherInfoCard'
import { fetchTeacherDashboard, fetchUser } from '../../features/users/userSlice'
import { fetchCourses } from '../../features/courses/coursesSlice'
import '../../style/style.css'

function Teacher() {
    const dispatch = useDispatch()
    const { dashboardMetrics, dashboardLoading } = useSelector(state => state.users)

    useEffect(() => {
        dispatch(fetchTeacherDashboard())
        dispatch(fetchCourses())
    }, [dispatch])

    if (dashboardLoading || !dashboardMetrics) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-pulse text-xl text-primary font-serif font-bold tracking-wide">Loading dashboard...</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-background text-text font-sans">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text">
                        Teacher Dashboard
                    </h1>
                    <p className="text-text/50 mt-1 font-medium text-sm">Welcome back! Here is an overview of your active classes.</p>
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
                        <p className="text-primary text-xs font-bold uppercase tracking-[0.15em] font-sans">Class Engagement</p>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        {dashboardMetrics.engagement != null ? (
                            <h3 className="text-4xl font-serif font-bold text-text">{dashboardMetrics.engagement}%</h3>
                        ) : (
                            <>
                                <h3 className="text-4xl font-serif font-bold text-primary/50">N/A</h3>
                                <span className="text-xs text-primary font-medium">No quizzes yet</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Layout — two columns */}
            <div className="flex flex-col lg:flex-row gap-6 mt-4 items-stretch">

                {/* Left Column: Teacher Card */}
                <div className="w-full lg:w-1/3 flex flex-col">
                    <TeacherCard className="h-full flex-1" />
                </div>

                {/* Right Column: Recent Submissions */}
                <div className="w-full lg:w-2/3 flex flex-col">
                    <div className="premium-card p-6 h-full min-h-[300px] flex flex-col">
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
                                            <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardMetrics.recent_submissions.map((sub, i) => (
                                            <tr key={sub.id}
                                                className="animate-item-enter border-b border-primary/10 hover:bg-primary/5 transition-colors"
                                                style={{ animationDelay: `${i * 0.05}s` }}
                                            >
                                                <td className="py-4 px-4 font-medium text-text flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shadow-sm border border-primary/30">
                                                        {sub.student_name.charAt(0)}
                                                    </div>
                                                    {sub.student_name}
                                                </td>
                                                <td className="py-4 px-4 text-primary font-medium">{sub.quiz_title}</td>
                                                <td className="py-4 px-4 text-right">
                                                    {sub.score !== "Pending" ? (
                                                        <span className="bg-primary/10 text-primary py-1 px-3 rounded-full text-sm font-bold shadow-sm border border-primary/20">
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
                            <div className="flex flex-col items-center justify-center h-48 text-primary/70 space-y-3">
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary/50">
                                    <svg className="w-5 h-5 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="italic text-xs text-primary/60">No recent quiz submissions yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Full-width My Latest Courses row */}
            <div className="mt-6 premium-card p-6">
                <h2 className="text-primary text-sm font-bold uppercase tracking-[0.15em] font-sans mb-6">My Latest Courses</h2>
                <RecentCourses />
            </div>

        </div>
    )
}

export default Teacher;