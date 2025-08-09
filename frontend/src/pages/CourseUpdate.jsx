
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import api from '../api'
function CourseUpdate(){

    const {id} = useParams()

    const [courseData, setCourseData] = useState({
        course_name: '',
        subject : '',
        description: '',
        published: false,
        
    })

        
    const getCourse = async () => {
        console.log('get course triggered')
        const res = await api.get(`api/courses/${id}`)
        console.log(res.data[0])
        setCourseData({
            course_name: res.data[0].course_name,
            subject: res.data[0].subject,
            description: res.data[0].description,
            published: res.data[0].published,
            students : res.data[0].student,
        })

    }

    const handleUpdate = (k, v) => {
        setCourseData(prev => ({...prev,
            [k] : v
        }))
    }
    const handleSubmit = async (e) =>{
        e.preventDefault()
        console.log('updating course triggered')
        try {
            const res = await api.put(`api/courses/update/${id}/`, courseData)

        }catch(errors){
            console.log(errors)
        }

    }

    useEffect(()=> {
        getCourse()
    }, [])
    return (

        <form onSubmit={handleSubmit}>
            <input type="text" value={courseData.course_name} onChange={(e) => handleUpdate('course_name', e.target.value)}/>
            <input type="text" value={courseData.subject} onChange={(e) => handleUpdate('subject', e.target.value)}/>
            <input type="text" value={courseData.description} onChange={(e) => handleUpdate('description', e.target.value)}/>
            <input type="text" value={courseData.students} onChange={(e) => handleUpdate('students', e.target.value)}/>
            <button type="submit">Submit</button>
        </form>

    )
}

export default CourseUpdate;