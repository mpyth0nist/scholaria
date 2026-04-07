import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUser } from '../features/users/userSlice'

const TeacherCard = () => {
    const teacher = useSelector(state => state.users.user)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchUser())
    }, [dispatch])

    if (!teacher || !teacher.first_name) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 shadow-xl relative overflow-hidden group">
            {/* Decorative background glow */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
            
            <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/30">
                    {teacher.first_name[0]}{teacher.last_name[0]}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{teacher.first_name} {teacher.last_name}</h2>
                    <p className="text-slate-400 text-sm font-medium">{teacher.role || 'Instructor'}</p>
                </div>
            </div>

            <div className="space-y-3 relative z-10 pt-4 border-t border-slate-700/50">
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Email Address</span>
                    <span className="text-slate-200 text-sm truncate max-w-[150px]" title={teacher.email}>{teacher.email}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total Courses Built</span>
                    <span className="text-slate-200 text-sm font-semibold">{teacher.courses_taught?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400 text-sm">System Status</span>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-semibold uppercase tracking-wider border border-emerald-500/20 shadow-sm">Online</span>
                </div>
            </div>
        </div>
    )
}

export default TeacherCard;