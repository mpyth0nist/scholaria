import api from '../api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const CoursesList = ( {page} ) => {

    const navigate = useNavigate()
    const [courses, setCourses] = useState([])


    const getCourses = async () => {

        const res = await api.get('api/courses/list/')
        console.log(res.data)
        const recentCourse = res.data.length

        if (page === 'Courses') {
            setCourses(res.data)

        } else {
            setCourses(res.data.slice(recentCourse - 3, recentCourse))
        }

    }


    useEffect(() => {
        getCourses()
    }, [])

    return (
        
        <div className='flex flex-col p-[0.5rem]'>

                {
                    courses.map(course => {
                        return ( 
                        <div className='font-sans border border-grey-400 p-[1.2rem] rounded' onClick={() => navigate(`/update-course/${course.id}`)}>
                            <img src={course.thumbnail} alt="No thumbnail" />
                            <div className="text-lg" >{course.course_name}</div>
                            <div className="text-sm">{course.description}</div>             
                        
                        </div>

                    )
                    })

                }

                {page === 'Courses' ? null : <div className="text-lg border rounded border-grey-500 bg-red-800 text-center p-[1.2rem]" onClick={() => navigate('/all-courses/')}>All Courses </div>} 

        </div>
    )
    

}

export default CoursesList;