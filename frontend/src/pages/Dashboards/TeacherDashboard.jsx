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
                    <p className="text-primary mt-1 font-medium">Welcome back! Here is an overview of your active classes.</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-primary/20 shadow-sm hover:-translate-y-1 transition duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-primary text-sm font-bold tracking-wide uppercase">Total Courses</p>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">📚</div>
                    </div>
                    <h3 className="text-4xl font-serif font-bold text-text">{dashboardMetrics.total_courses}</h3>
                </div>

                <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-primary/20 shadow-sm hover:-translate-y-1 transition duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-primary text-sm font-bold tracking-wide uppercase">Total Students</p>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">👥</div>
                    </div>
                    <h3 className="text-4xl font-serif font-bold text-text">{dashboardMetrics.total_students}</h3>
                </div>

                <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-primary/20 shadow-sm hover:-translate-y-1 transition duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-primary text-sm font-bold tracking-wide uppercase">Class Engagement</p>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">🚀</div>
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
            <div className="flex flex-col lg:flex-row gap-6 mt-4">

                {/* Left Column: Teacher Card */}
                <div className="w-full lg:w-1/3">
                    <TeacherCard />
                </div>

                {/* Right Column: Recent Submissions */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white/60 backdrop-blur-md border border-primary/20 rounded-xl p-6 shadow-sm h-full min-h-[300px]">
                        <div className="flex justify-between items-center mb-6 border-b border-primary/10 pb-3">
                            <h2 className="text-text tracking-wider font-semibold uppercase text-xs">Recent Quiz Submissions</h2>
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
                                        {dashboardMetrics.recent_submissions.map((sub) => (
                                            <tr key={sub.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
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
                                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">📭</div>
                                <p className="italic">No recent quiz submissions yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Full-width My Latest Courses row */}
            <div className="mt-6 bg-white/60 backdrop-blur-md border border-primary/20 rounded-xl p-6 shadow-sm">
                <h2 className="text-text mb-6 tracking-wider font-semibold uppercase text-xs">My Latest Courses</h2>
                <RecentCourses />
            </div>

        </div>
    )
}

export default Teacher;