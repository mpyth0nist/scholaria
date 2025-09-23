import api from '../../api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCourses } from '../../features/courses/coursesSlice'
const CoursesList = ( {page} ) => {

    const navigate = useNavigate()

    const courses = useSelector(state => state.courses.courses)
    const dispatch = useDispatch()

    // const [courses, setCourses] = useState([])


    // const getCourses = async () => {

    //     const res = await api.get('api/courses/list/')
    //    // console.log(res.data)
    //     const recentCourse = res.data.length

    //     if (page === 'Courses') {
    //         setCourses(res.data)

    //     } else {
    //         setCourses(res.data.slice(recentCourse - 3, recentCourse))
    //     }

    // }


    useEffect(() => {
        dispatch(fetchCourses())
    }, [])


    return (
        
        <div className='flex flex-wrap gap-[1rem] p-[0.5rem]'>

                {
                    courses.map(course => {
                        return ( 
                        <div key={course.id} className="w-full sm:w-1/2 lg:w-1/3 bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700" >
                            <img src={course.thumbnail} alt="No thumbnail" className='h-auto w-full object-cover' />
                            <div className="m-[1rem] text-xl font-semibold text-indigo-400 mb-2" >{course.course_name}</div>
                            <div className="m-[1rem] text-sm text-gray-300 mb-4">{course.description}</div>             
                            <button className="m-[1rem] flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded transition-colors duration-200" onClick={() => navigate(`/update-course/${course.id}`)}>Update the course</button>
                            <button className="m-[1rem] flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded transition-colors duration-200" onClick={() => navigate(`/course/${course.id}/modules/`)}>View Modules</button>
                        </div>

                    )
                    })

                }

                {page === 'Courses' ? null : <div className="text-lg border rounded border-grey-500 bg-red-800 text-center p-[1.2rem]" onClick={() => navigate('/all-courses/')}>All Courses </div>} 

        </div>
    )
    

}

export default CoursesList;