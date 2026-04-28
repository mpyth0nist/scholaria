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
        <div className="bg-white/60 backdrop-blur-md border border-primary/20 rounded-xl p-6 shadow-sm relative overflow-hidden group">
            {/* Decorative background glow */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500"></div>
            
            <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-serif font-bold shadow-sm border border-primary/30">
                    {teacher.first_name[0]}{teacher.last_name[0]}
                </div>
                <div>
                    <h2 className="text-xl font-serif font-bold text-text tracking-tight">{teacher.first_name} {teacher.last_name}</h2>
                    <p className="text-primary text-sm font-bold">{teacher.role || 'Instructor'}</p>
                </div>
            </div>

            <div className="space-y-3 relative z-10 pt-4 border-t border-primary/10">
                <div className="flex justify-between items-center">
                    <span className="text-primary text-sm font-semibold">Email Address</span>
                    <span className="text-text text-sm truncate max-w-[150px]" title={teacher.email}>{teacher.email}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-primary text-sm font-semibold">Total Courses Built</span>
                    <span className="text-text text-sm font-semibold">{teacher.courses_taught?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                    <span className="text-primary text-sm font-semibold">System Status</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold uppercase tracking-wider border border-primary/20 shadow-sm">Online</span>
                </div>
            </div>
        </div>
    )
}

export default TeacherCard;