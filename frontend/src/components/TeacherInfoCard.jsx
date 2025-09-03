
import api from '../api'
import { TEXT_STYLE, TEXT_STYLE_SM } from '../constants'
import {useState, useEffect } from 'react'

const TeacherCard = () => {

    const [teacher, setTeacher] = useState({
        firstName : '',
        lastName : '',
        email : '',
        courses : null,
        students : null

    })
    const getTeacherInfo = async () => {

        console.log('get teacher info called')
        const res = await api.get('api/users/user/')
        setTeacher({
            firstName : res.data.first_name,
            lastName : res.data.last_name,
            email : res.data.email,
            courses : res.data.courses_taught.length,
            students: null,

        })

        console.log(teacher)

    }

    useEffect(()=> {
        getTeacherInfo()
    }, [])


    return (
        <div className='border-[0.6rem] h-fit rounded p-[0.8rem] border-violet-900'>
                    {console.log(teacher)}

            <h2 className={TEXT_STYLE + " border-b-[2px] border-violet-700 p-[1rem]"}>Profile Summary</h2>
            <div className={TEXT_STYLE_SM}>{ teacher.firstName + " " + teacher.lastName }</div>
            <div className={TEXT_STYLE_SM}> Email : {teacher.email} </div>
            <div className={TEXT_STYLE_SM}> Courses : {teacher.courses}</div>
        </div>

    )


}

export default TeacherCard;