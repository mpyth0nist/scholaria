
import api from '../api'
import { TEXT_STYLE, TEXT_STYLE_SM } from '../constants'
import {useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { fetchUser } from '../features/users/userSlice'

const TeacherCard = () => {

    const teacher = useSelector(state => state.users.user)
    const dispatch = useDispatch()
    // const [teacher, setTeacher] = useState({
    //     firstName : '',
    //     lastName : '',
    //     email : '',
    //     courses : [],
    //     students : []

    // })
  //  const getTeacherInfo = async () => {

    //    const res = await api.get('api/users/user/')

   //     setTeacher({
  //          firstName : res.data.first_name,
  //          lastName : res.data.last_name,
    //         email : res.data.email,
    //         courses : res.data.courses_taught,
    //         students: [],

    //     })

    // }

    useEffect(()=> {
        dispatch(fetchUser())
    }, [])

    useEffect(()=> {
        console.log("Teacher info is ",  teacher)

    }, [teacher])



    return (
        <div className='border-[0.6rem] h-fit rounded p-[0.8rem] border-violet-900'>
             <h2 className={TEXT_STYLE + " border-b-[2px] border-violet-700 p-[1rem]"}>Profile Summary</h2>
            <div className={TEXT_STYLE_SM}>{ teacher.first_name + " " + teacher.last_name }</div>
             <div className={TEXT_STYLE_SM}> Email : {teacher.email} </div>
            <div className={TEXT_STYLE_SM}> Courses : {teacher.courses_taught?.length}</div> 
        </div>

    )


}

export default TeacherCard;