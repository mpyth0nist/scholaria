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
        return <p className="text-xs text-slate-500 italic">No lessons yet.</p>
    }

    return (
        <div className="flex flex-col gap-1.5">
            {lessons.map(lesson => (
                <button
                    key={lesson.id}
                    onClick={() => navigate(`/course/module/lessons/${lesson.id}`)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-slate-900/40 hover:bg-slate-700/40 border border-slate-700/30 hover:border-violet-700/40 transition group"
                >
                    <span className="text-violet-400 text-xs">📄</span>
                    <span className="text-sm text-slate-300 group-hover:text-slate-100 transition">{lesson.title}</span>
                </button>
            ))}
        </div>
    )
}

export default ListLessons