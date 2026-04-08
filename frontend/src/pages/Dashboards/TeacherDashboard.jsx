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
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <div className="animate-pulse text-xl text-cyan-400 font-medium tracking-wide">Loading dashboard...</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-900 text-slate-100 font-sans">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                        Teacher Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1">Welcome back! Here is an overview of your active classes.</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 shadow-xl shadow-cyan-900/10 hover:-translate-y-1 transition duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">Total Courses</p>
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">📚</div>
                    </div>
                    <h3 className="text-4xl font-bold text-white">{dashboardMetrics.total_courses}</h3>
                </div>

                <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 shadow-xl shadow-purple-900/10 hover:-translate-y-1 transition duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">Total Students</p>
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">👥</div>
                    </div>
                    <h3 className="text-4xl font-bold text-white">{dashboardMetrics.total_students}</h3>
                </div>

                <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 shadow-xl shadow-emerald-900/10 hover:-translate-y-1 transition duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">Class Engagement</p>
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">🚀</div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-bold text-white">{dashboardMetrics.engagement}%</h3>
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
                    <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-lg h-full min-h-[300px]">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-3">
                            <h2 className="text-slate-200 tracking-wider font-semibold uppercase text-xs">Recent Quiz Submissions</h2>
                        </div>

                        {dashboardMetrics.recent_submissions && dashboardMetrics.recent_submissions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-slate-400 text-xs tracking-wider uppercase border-b border-slate-700/50 bg-slate-900/30">
                                            <th className="py-3 px-4 font-semibold rounded-tl-lg">Student Name</th>
                                            <th className="py-3 px-4 font-semibold">Quiz Title</th>
                                            <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardMetrics.recent_submissions.map((sub) => (
                                            <tr key={sub.id} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors">
                                                <td className="py-4 px-4 font-medium text-slate-200 flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-xs font-bold shadow-md">
                                                        {sub.student_name.charAt(0)}
                                                    </div>
                                                    {sub.student_name}
                                                </td>
                                                <td className="py-4 px-4 text-slate-400">{sub.quiz_title}</td>
                                                <td className="py-4 px-4 text-right">
                                                    {sub.score !== "Pending" ? (
                                                        <span className="bg-emerald-500/10 text-emerald-400 py-1 px-3 rounded-full text-sm font-bold shadow-sm border border-emerald-500/20">
                                                            {sub.score}%
                                                        </span>
                                                    ) : (
                                                        <span className="bg-amber-500/10 text-amber-400 py-1 px-3 rounded-full text-sm font-semibold shadow-sm border border-amber-500/20">
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
                            <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-3">
                                <div className="h-16 w-16 bg-slate-700/30 rounded-full flex items-center justify-center text-2xl">📭</div>
                                <p className="italic">No recent quiz submissions yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Full-width My Latest Courses row */}
            <div className="mt-6 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-lg">
                <h2 className="text-slate-200 mb-6 tracking-wider font-semibold uppercase text-xs">My Latest Courses</h2>
                <RecentCourses />
            </div>

        </div>
    )
}

export default Teacher;