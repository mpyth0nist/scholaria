import { useEffect, useState } from "react"
import api from '../api'


const CreateCourse = () => {

    const [courseInfo, setCourseInfo] = useState({
        course_name: '',
        subject: '',
        description: '',
        published: false,
        done:false,
        student: [],
    })

    const [students, setStudents] = useState([])
    const [studentId, setStudentId] = useState(null)
    
    const getStudents = async () => {
        console.log('students function triggered')
        const res = await api.get('api/users/students/')
        console.log(res.data)
        setStudents(res.data)
    }
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

    useEffect(() => {
        getStudents()
    }, [])

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
                <select multiple name="student" value={studentId} onChange={ (e) => setCourseInfo( prev => ({...prev,
                    [e.target.name] : [...prev[e.target.name], e.target.value]
                }))}>
                    
                    { students.map( student=> {
                        return <option value={student.id}>{student.first_name + " " + student.last_name}</option>
                    }) }

                </select>
                <input type="submit" value="Submit"/>

            </form>
        </>
    )
}

export default CreateCourse;