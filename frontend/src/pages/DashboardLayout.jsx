
import Teacher from "./TeacherDashboard";
import Student from "./StudentDashboard";
import '../style/style.css'
import api from '../api'

import { useState,useEffect } from "react";
function Dashboard(){

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [role, setRole] = useState('')
    const [courses, setCourses] = useState('')
    const [quizzes, setQuizzes] = useState('')

    
    const getUserInfo = async () => {
        const res = await api.get('api/users/user/')
        setFirstName(res.data.first_name)
        setLastName(res.data.last_name)
        setRole(res.data.role)
        setCourses(res.data.courses)
        setQuizzes(res.data.quizzes)
    }

  useEffect(()=>{
    getUserInfo()
  }, [])

  const isTeacher = (role.toUpperCase() === 'TEACHER')
    

    return (
        <>
            <div className="grid grid-rows-[20%_70%] grid-cols-1 gap-[2rem]">
                <div className="w-full">
                    <div className="flex flex-row gap-[1rem]">
                        <div className="border-2 w-16 h-16 rounded-full">
                            <div className="notification-badge"></div>
                        </div>
                        <div className="border-2 w-16 h-16 rounded-full"> </div>
                    </div>
                </div>

            <div className="grid grid-cols-2">

                { 
                    isTeacher ? <Teacher firstName={firstName} lastName={lastName} courses={courses}/> : <Student firstName={firstName} lastName={lastName} courses={courses} />
                }
            

                <div className="content-area">
                    <div>Annoucements</div>
                    <div>User-details</div>
                    <div>Courses</div>
                </div>
            </div>
            </div>
        </>
    )
}

export default Dashboard;