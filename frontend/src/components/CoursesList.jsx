import api from '../api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const CoursesList = () => {

    const navigate = useNavigate()
    const [courses, setCourses] = useState([])

    const getCourses = async () => {

        const res = await api.get('api/courses/list/')

        setCourses(res.data)


    }


    useEffect(() => {
        getCourses()
    }, [])

    return (
        
        <div className='flex flex-col p-[0.4rem]'>
            <div className="text-xl font-sans pl-[1px] p-[0.8rem]">MY COURSES </div>
            <div className="flex flex-col gap-[0.4rem]">
                {
                    courses.map(course => {
                        return <button className="text-lg font-sans border border-grey-400 p-[1.2rem] rounded" onClick={() => navigate(`/update-course/${course.id}`)}>{course.course_name}</button>

                    })
                }
            </div>
        </div>
    )
    

}

export default CoursesList;