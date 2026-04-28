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
                    <span className="text-action text-xs">📄</span>
                    <span className="text-sm text-text/80 group-hover:text-text transition">{lesson.title}</span>
                </button>
            ))}
        </div>
    )
}

export default ListLessons