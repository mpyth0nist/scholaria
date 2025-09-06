import { useEffect, useState } from "react"
import api from '../../api'
import { useNavigate } from "react-router-dom"

const CreateCourse = () => {

    const [courseInfo, setCourseInfo] = useState({
        course_name: '',
        subject: '',
        thumbnail: null,
        description: '',
        published: false,
        done:false,
        students: [],

    })

    const navigate = useNavigate()

    const [schoolStudents, setSchoolStudents] = useState([])
    
    const getStudents = async () => {
        const res = await api.get('api/users/students/')
        setSchoolStudents(res.data)
    }
    const handleAdd = (name, value) =>{
        setCourseInfo(prev => ({
            ...prev,
            [name]: value
        }))

    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {

       
            const formData = new FormData()

            formData.append("course_name", courseInfo.course_name)
            formData.append("description", courseInfo.description)
            formData.append("thumbnail", courseInfo.thumbnail)
            formData.append("subject", courseInfo.subject)
            formData.append("done", courseInfo.done)
            formData.append("published", courseInfo.published)
            courseInfo.students.forEach(id => formData.append("student", id))
            
            const res = await api.post('api/courses/create-course/', formData)
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
                thumbnail: null,
                published: false,
                done:false,
                students:[]
            })

            navigate(`/course/${res.data.id}/create-module/`)

     }catch(err){
        console.log(err)
     }
    }

    useEffect(() => {
        getStudents()
    }, [])

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-[0.6rem]">

                <input type="text" name="course_name" value={courseInfo.course_name} onChange={(e) => handleAdd(e.target.name, e.target.value)} placeholder="Course Title.."/>
                <input type="text" name="subject" value={courseInfo.subject} onChange={(e) => handleAdd(e.target.name, e.target.value)} placeholder="Course Subject" />
                <textarea name="description" value={courseInfo.description} placeholder="description" onChange={(e) => handleAdd(e.target.name, e.target.value)}></textarea>
                <input type="file" name="thumbnail" onChange={(e) => handleAdd(e.target.name, e.target.files[0])} /> 
                <div className="flex gap-[0.7rem]">
                    <label>Published ? </label>
                    <input type="checkbox" name="published" checked={courseInfo.published} onChange={(e) => handleAdd(e.target.name, e.target.checked)}/>
                    <label>Yes</label>
                </div>

                <div className="flex gap-[0.7rem]"> 
                    <input type="checkbox" name="done" onChange={(e) => handleAdd(e.target.name, e.target.checked)} checked={courseInfo.done}/>
                    <label>Done</label>
                </div>
                    
                    { schoolStudents.map( student=> {
                        return (

                            <div key={student.id}>
                                <input type="checkbox"
                                    checked = {courseInfo.students.includes(student.id)}
                                    onChange={(e) => {
                                        setCourseInfo(prev => ({
                                            ...prev,
                                            students : prev.students.includes(student.id) ? 
                                                [...prev.students.filter(s => { return s !== student.id})] // removes student if unselected
                                                : 
                                                [...prev.students, student.id] // add student if selected
                                        }))
                                    }}
                                
                                />
                                <label> {student.first_name + " " + student.last_name} </label>

                        </div>

                        ) 
                    }) }

                <input type="submit" value="Submit"/>

            </form>
        </>
    )
}

export default CreateCourse;