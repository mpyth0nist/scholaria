import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux'
import { fetchSelectedCourse, updateCourse, deleteCourse } from "../../features/courses/coursesSlice"
import { fetchUser } from "../../features/users/userSlice"
import { fetchStudents } from "../../features/users/userSlice"
import NotFound from '../NotFound'

function CourseUpdate() {

    const { id } = useParams()
    const dispatch = useDispatch()

    // ── Redux state ───────────────────────────────────────────────────
    const selectedCourse = useSelector(state => state.courses.selectedCourse)
    const role = useSelector(state => state.users.user?.role)
    const students = useSelector(state => state.users.students)

    // ── Local form state (transient input values) ─────────────────────
    const [courseData, setCourseData] = useState({})

    useEffect(() => {
        dispatch(fetchSelectedCourse(id))
        dispatch(fetchUser())
        dispatch(fetchStudents())
    }, [])

    useEffect(() => {
        if (selectedCourse && selectedCourse.length > 0) {
            setCourseData(selectedCourse[0])
        }
    }, [selectedCourse])

    const handleUpdate = (k, v) => {
        setCourseData(prev => ({ ...prev, [k]: v }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(updateCourse(courseData))
    }

    const handleDelete = (course_id) => {
        dispatch(deleteCourse(course_id))
    }

    if (role === 'Teacher') {
        return (
            <div className="flex flex-col">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={courseData.course_name || ''}
                        onChange={(e) => handleUpdate('course_name', e.target.value)}
                    />
                    <input
                        type="text"
                        value={courseData.subject || ''}
                        onChange={(e) => handleUpdate('subject', e.target.value)}
                    />
                    <input
                        type="text"
                        value={courseData.description || ''}
                        onChange={(e) => handleUpdate('description', e.target.value)}
                    />
                    <select
                        multiple
                        name="student"
                        value={courseData.student || []}
                        onChange={(e) =>
                            setCourseData(prev => ({
                                ...prev,
                                [e.target.name]: [...(prev[e.target.name] || []), e.target.value]
                            }))
                        }
                    >
                        {students.map(student => (
                            <option key={student.id} value={student.id}>
                                {student.first_name} {student.last_name}
                            </option>
                        ))}
                    </select>
                    <button type="submit">Submit</button>
                </form>

                <button
                    className="p-3 bg-red-700 border rounded border-gray-300"
                    onClick={() => handleDelete(courseData.id)}
                >
                    Delete Course
                </button>
            </div>
        )
    }

    return <NotFound />
}

export default CourseUpdate