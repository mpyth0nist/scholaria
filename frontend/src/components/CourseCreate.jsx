import { useState } from "react"
import api from '../api'
const CreateCourse = () => {

    const [courseInfo, setCourseInfo] = useState({
        course_name: '',
        subject: '',
        description: '',
        published: false,
        done:false,
    })

    const handleAdd = (name, value) =>{
        setCourseInfo(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const res = await api.post('api/courses/create-course/', courseInfo)
        console.log(res.status)
        if (res.status === 201){
            alert('Course Created Successfully!')
        }else{
            alert('something wrong happened')
        }

        setCourseInfo({        
            course_name: '',
            subject: '',
            description: '',
            published: false,
            done:false
        })
    }

    return (
        <>
            <form onSubmit={handleSubmit}>

                <input type="text" name="course_name" value={courseInfo.course_name} onChange={(e) => handleAdd(e.target.name, e.target.value)} placeholder="Course Title.."/>
                <input type="text" name="subject" value={courseInfo.subject} onChange={(e) => handleAdd(e.target.name, e.target.value)} placeholder="Course Subject" />
                <input type="textarea" name="description" value={courseInfo.description} onChange={(e) => handleAdd(e.target.name, e.target.value)} placeholder="Course Description" />
                <input type="checkbox" name="published" value={courseInfo.published} onChange={(e) => handleAdd(e.target.name, e.target.checked)}/>
                <label>Yes</label>
                <input type="checkbox" name="done" onChange={(e) => handleAdd(e.target.name, e.target.checked)} value={courseInfo.done}/>
                <label>Done</label>

                <input type="submit" value="Submit"/>

            </form>
        </>
    )
}

export default CreateCourse;