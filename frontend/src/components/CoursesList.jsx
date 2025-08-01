import api from '../api'
import { useState, useEffect } from 'react'

const CoursesList = () => {

    const [courses, setCourses] = useState([])

    const getCourses = async () => {

        const res = await api.get('api/courses/list/')

        setCourses(res.data)

        console.log(res.data)
    }

    useEffect(() => {
        getCourses()
    }, [])

    return (

        <div className='flex flex-col gap-[2rem]'>
            <div className="text-xl font-sans border-b-[2px]"></div>
            <div className="flex flex-col">
                {
                    courses.map((course) => {
                        <div className="text-lg font-sans border-1 border-grey-400 p-[1.2rem]">{course.title}</div>
                    })
                }
            </div>
        </div>
    )
    

}

export default CoursesList;