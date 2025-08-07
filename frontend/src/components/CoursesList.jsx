import api from '../api'
import { useState, useEffect } from 'react'
import CourseUpdate  from '../pages/CourseUpdate'
const CoursesList = () => {

    const [courses, setCourses] = useState([])
    const [showUpdate, setShowUpdate] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const getCourses = async () => {

        const res = await api.get('api/courses/list/')

        setCourses(res.data)


    }
    const showUpdateCourse = (course) => {
        setSelectedCourse(course)
        setShowUpdate(true)
        console.log('triggered')
    }

    useEffect(() => {
        getCourses()
    }, [])

    return (
        
        <div className='flex flex-col p-[0.4rem]'>
            {showUpdate && <CourseUpdate Course={selectedCourse} /> }
            <div className="text-xl font-sans pl-[1px] p-[0.8rem]">MY COURSES </div>
            <div className="flex flex-col gap-[0.4rem]">
                {
                    courses.map(course => {
                        return <button className="text-lg font-sans border border-grey-400 p-[1.2rem] rounded" onClick={() => showUpdateCourse(course) }>{course.course_name}</button>

                    })
                }
            </div>
        </div>
    )
    

}

export default CoursesList;