
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import api from '../../api'

import NotFound from '../../pages/NotFound'
function CourseUpdate(){

    const [role, setRole] = useState(null)

    const getRole = async () =>{
        const res = await api.get('api/users/user/')
        setRole(res.data.role)
    }

    const {id} = useParams()

    const [students, setStudents] = useState([])
    const [courseData, setCourseData] = useState({
        course_name: '',
        subject : '',
        description: '',
        published: false,
        student: '',
        
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
            student : res.data[0].student,
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

    const getStudents = async () => {
        
        const res = await api.get('api/users/students/')
        console.log('get students function called')
        console.log(res.data)
        setStudents(res.data)
    }

    const handleDelete = async () =>{
        const res = await api.delete(`api/courses/delete/${id}/`)
    }
    useEffect(()=> {
        getCourse()
        getStudents()
        getRole()
    }, [])

    if(role === 'Teacher'){
        return (
        
        <div className="flex flex-col">
        
        <form onSubmit={handleSubmit}>
            <input type="text" value={courseData.course_name} onChange={(e) => handleUpdate('course_name', e.target.value)}/>
            <input type="text" value={courseData.subject} onChange={(e) => handleUpdate('subject', e.target.value)}/>
            <input type="text" value={courseData.description} onChange={(e) => handleUpdate('description', e.target.value)}/>
            <select multiple name="student" value={courseData.student} onChange={(e) => setCourseData(prev => ({...prev, 
                [e.target.name] : [...prev[e.target.name], e.target.value]
            }))} >
                {
                    students.map(student => {
                        return <option value={student.id} >{student.first_name + " " + student.last_name}</option>
                    })
                }
            </select>
            <button type="submit">Submit</button>
        </form>

        <button className="p-[0.8rem] bg-red-700 border rounded border-grey-300" onClick={() => handleDelete()}>Delete Course</button>       
        
        </div>

        )
    }

    else{
        return <NotFound />
    }
   
}

export default CourseUpdate;