import { useParams } from 'react-router-dom'
import api from '../api'
import { useEffect, useState } from 'react'
import ListLessons from './ListLessons'

const ModulesList = () => {
    const [modules, setModules] = useState([])
    const [activeModule, setActiveModule] = useState(null)
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

                    return <div>
                    
                    <button onClick={() => setActiveModule(module.id)}>{module.title}</button>

                        {
                            activeModule === module.id ? <ListLessons module_id={module.id} /> : null
                        }
                    </div>
                })
            
            }
        </div>

    )
}

export default ModulesList;