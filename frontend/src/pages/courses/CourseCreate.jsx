import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { createCourse } from "../../features/courses/coursesSlice"
import { fetchStudents } from "../../features/users/userSlice"

const CreateCourse = () => {

    const [courseInfo, setCourseInfo] = useState({
        course_name: '',
        subject: '',
        thumbnail: null,
        description: '',
        published: false,
        done: false,
        students: [],
    })

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    // ── Redux: students list ──────────────────────────────────────────
    const schoolStudents = useSelector(state => state.users.students)
    const studentsLoading = useSelector(state => state.users.studentsLoading)

    useEffect(() => {
        // Fetch a large page size so all students appear in the checkbox list
        dispatch(fetchStudents({ size: 1000 }))
    }, [dispatch])

    const handleAdd = (name, value) => {
        setCourseInfo(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
            const res = await dispatch(createCourse(courseInfo))
            if (res.meta.requestStatus === 'fulfilled') {
                navigate('/courses') // Redirect to list on success
            } else {
                setError("Failed to create course. Please try again.")
            }
        } catch (err) {
            setError(err.message || "An error occurred.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[rgb(36,36,36)] p-6 rounded-xl shadow-lg max-w-md mx-auto mt-8">
                <h1 className="text-2xl font-bold text-white mb-2">Create New Course</h1>
                
                {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-md text-sm">{error}</div>}

                <input
                    className="p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0] outline-none transition"
                    type="text"
                    name="course_name"
                    required
                    value={courseInfo.course_name}
                    onChange={(e) => handleAdd(e.target.name, e.target.value)}
                    placeholder="Course Title.."
                />
                <input
                    className="p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0] outline-none transition"
                    type="text"
                    name="subject"
                    required
                    value={courseInfo.subject}
                    onChange={(e) => handleAdd(e.target.name, e.target.value)}
                    placeholder="Course Subject"
                />
                <textarea
                    className="p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0] outline-none transition resize-none"
                    name="description"
                    required
                    value={courseInfo.description}
                    placeholder="Description"
                    onChange={(e) => handleAdd(e.target.name, e.target.value)}
                />
                <input
                    type="file"
                    name="thumbnail"
                    onChange={(e) => handleAdd(e.target.name, e.target.files[0])}
                />

                <div className="flex gap-3">
                    <label>Published?</label>
                    <input
                        type="checkbox"
                        name="published"
                        checked={courseInfo.published}
                        onChange={(e) => handleAdd(e.target.name, e.target.checked)}
                    />
                    <label>Yes</label>
                </div>

                <div className="flex gap-3">
                    <input
                        type="checkbox"
                        name="done"
                        onChange={(e) => handleAdd(e.target.name, e.target.checked)}
                        checked={courseInfo.done}
                    />
                    <label>Done</label>
                </div>

                {studentsLoading ? (
                    <p className="text-gray-400 text-sm">Loading students...</p>
                ) : (
                    schoolStudents.map(student => (
                        <div key={student.id} className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={courseInfo.students.includes(student.id)}
                                onChange={() => {
                                    setCourseInfo(prev => ({
                                        ...prev,
                                        students: prev.students.includes(student.id)
                                            ? prev.students.filter(s => s !== student.id)
                                            : [...prev.students, student.id]
                                    }))
                                }}
                            />
                            <label>{student.first_name} {student.last_name}</label>
                        </div>
                    ))
                )}

                <div className="pt-2 border-t border-gray-700 mt-2">
                    <button
                        className="w-full mt-2 p-3 rounded-md bg-[#7f5af0] text-white font-semibold hover:bg-[#5c3cd6] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Creating Course...' : 'Submit'}
                    </button>
                </div>
            </form>
        </>
    )
}

export default CreateCourse