import { useState } from "react"

const CreateCourse = () => {

    const [courseInfo, setCourseInfo] = useState({
        course_name: '',
        subject: '',
        description: '',
        published: false,
        done:false,
    })

    const handleAdd = (name, value) =>{
        console.log('handle add triggered')
        setCourseInfo(prev => ({
            ...prev,
            [name]: value
        }))
    }
    console.log(courseInfo)

    return (
        <>
            <form method="POST">

                <input type="text" name="course_name" value={courseInfo.course_name} onChange={(e) => handleAdd(e.target.name, e.target.value)} placeholder="Course Title.."/>
                <input type="text" name="subject" value={courseInfo.subject} onChange={(e) => handleAdd(e.target.name, e.target.value)} placeholder="Course Subject" />
                <input type="textarea" name="description" value={courseInfo.description} onChange={(e) => handleAdd(e.target.name, e.target.value)} placeholder="Course Description" />
                <input type="checkbox" name="published" value={courseInfo.published} onChange={(e) => handleAdd(e.target.name, e.target.checked)}/>
                <label>Yes</label>
                <input type="checkbox" name="done" onChange={(e) => setCourseInfo(prev => ({...prev, ['done'] : e.target.checked}))} value={courseInfo.done}/>
                <label>Done</label>

                <input type="submit" value="Submit"/>

            </form>
        </>
    )
}

export default CreateCourse;