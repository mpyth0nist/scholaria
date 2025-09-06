import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import api from "../../api";

const ListLessons = ({module_id}) => {
    const navigate = useNavigate()
    const [lessons, setLessons] = useState([])
    
    const getLessons = async () => {
        console.log('get lessons vcalled')
        console.log(module_id)
        const res = await api.get(`api/courses/${module_id}/lessons/`)
        setLessons(res.data)
        console.log(res.data)
        console.log(lessons)
    }

    useEffect(() => {
        getLessons()
    }, [])

    return (

        <>
        
        {
            lessons.map(lesson => {
                return <button onClick = {() => {
                    console.log('triggered')
                    navigate(`/course/module/lessons/${lesson.id}`)}
                }>{lesson.title}</button>
            })
        }
        
        </>
    )
}

export default ListLessons;