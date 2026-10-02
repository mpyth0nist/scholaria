import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUser } from '../features/users/userSlice'

const TeacherCard = ({ className = "" }) => {
    const teacher = useSelector(state => state.users.user)
    const dispatch = useDispatch()
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        dispatch(fetchUser())
    }, [dispatch])

    if (!teacher || !teacher.first_name) {
        return null;
    }

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(teacher.email).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <div className={`premium-card p-6 relative overflow-hidden group flex flex-col ${className}`}>
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

            <div className="space-y-3 relative z-10 pt-4 border-t border-primary/10 mt-auto">
                <div className="flex justify-between items-start gap-3">
                    <span className="text-primary text-sm font-semibold shrink-0">Email Address</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-text text-sm break-all text-right">{teacher.email}</span>
                        <button
                            onClick={handleCopyEmail}
                            title={copied ? 'Copied!' : 'Copy email'}
                            className="shrink-0 text-primary/50 hover:text-action transition-colors"
                            aria-label="Copy email address"
                        >
                            {copied ? (
                                <svg className="w-3.5 h-3.5 text-action" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                    <span className="text-primary text-sm font-semibold">Platform Access</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border shadow-sm ${
                        teacher.is_active !== false
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-danger/10 text-danger border-danger/20'
                    }`}>
                        {teacher.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default TeacherCard;