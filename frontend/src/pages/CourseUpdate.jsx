
import { useState } from "react"

import api from '../api'
function CourseUpdate({Course}){

    const [courseData, setCourseData] = useState({
        id : Course.id,
        course_name : Course.course_name,
        subject : Course.subject,
        description : Course.description,
        published : Course.published,
        
    })

    const handleUpdate = (k, v) => {
        setCourseData(prev => ({...prev,
            [k] : v
        }))
    }
    const handleSubmit = async (e) =>{
        e.preventDefault()
        console.log('updating course triggered')
        try {
            const res = await api.put(`api/courses/update/${courseData.id}/`, courseData)
            
        }catch(errors){
            console.log(errors)
        }

    }

    return (

        <form onSubmit={handleSubmit}>
            <input type="text" value={courseData.course_name} onChange={(e) => handleUpdate('course_name', e.target.value)}/>
            <input type="text" value={courseData.subject} onChange={(e) => handleUpdate('subject', e.target.value)}/>
            <input type="text" value={courseData.description} onChange={(e) => handleUpdate('description', e.target.value)}/>
            <input type="text" value={courseData.published} onChange={(e) => handleUpdate('published', e.target.value)}/>
            <button type="submit">Submit</button>
        </form>

    )
}

export default CourseUpdate;