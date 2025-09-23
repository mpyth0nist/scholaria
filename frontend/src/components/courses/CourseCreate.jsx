import { useEffect, useState } from "react"
import api from '../../api'
import { useNavigate } from "react-router-dom"

import { useDispatch } from "react-redux"
import { createCourse } from "../../features/courses/coursesSlice"
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

    const dispatch = useDispatch()

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
    const handleSubmit = (e, courseData=courseInfo) => {
        e.preventDefault()

        dispatch(createCourse(courseData))

        
    }
    
    useEffect(() => {
        getStudents()
    }, [])

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[rgb(36,36,36)] p-6 rounded-xl shadow-lg max-w-md mx-auto">

                <input  className="p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0] outline-none transition" type="text" name="course_name" value={courseInfo.course_name} onChange={(e) => handleAdd(e.target.name, e.target.value)} placeholder="Course Title.."/>
                <input   className="p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0] outline-none transition" type="text" name="subject" value={courseInfo.subject} onChange={(e) => handleAdd(e.target.name, e.target.value)} placeholder="Course Subject" />
                <textarea  className="p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0] outline-none transition resize-none" name="description" value={courseInfo.description} placeholder="description" onChange={(e) => handleAdd(e.target.name, e.target.value)}></textarea>
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

                            <div key={student.id} className="flex items-center gap-3" >
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

                <input  className="mt-4 p-3 rounded-md bg-[#7f5af0] text-white font-semibold hover:bg-[#5c3cd6] transition cursor-pointer" type="submit" value="Submit"/>

            </form>
        </>
    )
}

export default CreateCourse;