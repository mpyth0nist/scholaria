
import { useSelector } from 'react-redux'
import CoursesList from "./CoursesList"

const CoursesDetail = () => {
    const role = useSelector(state => state.users.user?.role)
    const isTeacher = role === 'Teacher'

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-2xl font-serif font-bold text-text">
                    {isTeacher ? 'My Courses' : 'Available Courses'}
                </h1>
                <p className="text-text/50 text-sm mt-1">
                    {isTeacher ? 'Manage and organise your course library.' : 'Browse and access your enrolled courses.'}
                </p>
            </div>
            <CoursesList page='Courses' />
        </div>
    )
}

export default CoursesDetail;