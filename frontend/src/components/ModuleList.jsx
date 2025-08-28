import { useParams } from 'react-router-dom'
import api from '../api'
import { useEffect, useState } from 'react'


const ModulesList = () => {
    const [modules, setModules] = useState([])
    const {course_id} = useParams()
    const getModules = async () =>{
        
        const res = await api.get(`api/courses/${course_id}/modules/`)
        setModules(res.data)

    }

    useEffect(() => {
        getModules()
    }, [])

    return (

        <div>
            {

                modules.map(module => {
                    return <button>{module.title}</button>
                })
            
            }
        </div>

    )
}

export default ModulesList;