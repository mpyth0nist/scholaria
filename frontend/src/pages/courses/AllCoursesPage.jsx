
import { useSelector } from 'react-redux'
import CoursesList from "./CoursesList"
import { usePermissions } from '../../hooks/usePermissions.js';

const CoursesDetail = () => {
    const role = useSelector(state => state.users.user?.role)
    const { isTeacher } = usePermissions()

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-text">
                    {isTeacher ? 'My Courses' : 'Available Courses'}
                </h1>
                <p className="text-text/50 font-medium text-sm mt-1.5">
                    {isTeacher ? 'Manage and organize your course library.' : 'Browse and access your enrolled courses.'}
                </p>
            </div>
            <CoursesList page='Courses' />
        </div>
    )
}

export default CoursesDetail;