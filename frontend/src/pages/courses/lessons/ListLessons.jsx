import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api'

const ListLessons = ({ module_id }) => {
    const navigate = useNavigate()
    const [lessons, setLessons] = useState([])

    useEffect(() => {
        api.get(`api/courses/${module_id}/lessons/`)
            .then(res => setLessons(res.data))
            .catch(err => console.error(err))
    }, [module_id])

    if (lessons.length === 0) {
        return <p className="text-xs text-primary/70 italic">No lessons yet.</p>
    }

    return (
        <div className="flex flex-col gap-1.5">
            {lessons.map(lesson => (
                <button
                    key={lesson.id}
                    onClick={() => navigate(`/course/module/lessons/${lesson.id}`)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-white/60 hover:bg-primary/5 border border-primary/20 hover:border-action/20 transition group"
                >
                    <div className="w-8 h-8 rounded bg-action/10 border border-action/20 flex items-center justify-center text-action shrink-0">
                        <svg className="w-4 h-4 text-action" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <span className="text-sm text-text/80 group-hover:text-text transition">{lesson.title}</span>
                </button>
            ))}
        </div>
    )
}

export default ListLessons