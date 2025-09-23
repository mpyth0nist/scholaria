
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import api from '../../api'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSelectedCourse, updateCourse, deleteCourse } from "../../features/courses/coursesSlice"
import NotFound from '../../pages/NotFound'
function CourseUpdate(){

    const [role, setRole] = useState(null)

    const getRole = async () =>{
        const res = await api.get('api/users/user/')
        setRole(res.data.role)
    }

    const {id} = useParams()
    const [courseData, setCourseData] = useState({})
    const selectedCourse = useSelector(state => state.courses.selectedCourse)
    const [students, setStudents] = useState([])
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchSelectedCourse(id))
    }, [])

     useEffect(() => {
        if(selectedCourse && selectedCourse.length > 0){
            setCourseData(selectedCourse[0])
        }
     }, [selectedCourse])

    const handleUpdate = (k, v) => {
        setCourseData(prev => ({
            ...prev,
            [k] : v
        }))
    }
    const handleSubmit = (e) =>{
        e.preventDefault()
        console.log('updating course triggered')

        dispatch(updateCourse(courseData))



    }

    const getStudents = async () => {
        
        const res = await api.get('api/users/students/')
        console.log('get students function called')
        console.log(res.data)
        setStudents(res.data)
    }

    const handleDelete = async (course_id) =>{
        dispatch(deleteCourse(course_id))
    }
    useEffect(()=> {
        getStudents()
        getRole()
    }, [])

    useEffect(()=> {
        console.log(courseData)
    }, [courseData])
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

        <button className="p-[0.8rem] bg-red-700 border rounded border-grey-300" onClick={(course) => handleDelete(courseData.id)}>Delete Course</button>       
        
        </div>

        )
    }

    else{
        return <NotFound />
    }
   
}

export default CourseUpdate;