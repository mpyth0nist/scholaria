import { useEffect, useState } from "react"
import api from '../../api'
import { useParams } from "react-router-dom"

import LessonCreate from "../lessons/LessonCreate"
import ListLessons from "../lessons/ListLessons"
const ModuleCreate = () => {

    const [title, setTitle] = useState('')
    const [order, setOrder] = useState(0)
    const [modules, setModules] = useState([])
    const [toggleLessonsMenu , setToggleLessonsMenu] = useState(false)

    const [activeModule, setActiveModule] = useState()
    const {course_id} = useParams()

    const handleSubmit = async (e) => {

        e.preventDefault()

        const res = await api.post(`api/courses/${course_id}/modules/add-module/`,{title,course:course_id, order})
        

        if (res.status === 201){
            alert('Module Created')
        }else{
            alert('something wrong occured')
        }

    }

    const getModules = async () => {
        const res = await api.get(`api/courses/${course_id}/modules/`)

        console.log(res.data)
        console.log(modules)

        setModules(res.data)
    }

    const handleModulesClick = (module_id) => {
        if (module_id === activeModule) {
            setActiveModule(null)
        }else {
            setActiveModule(module_id)
        }
    }

    useEffect(() => {
        getModules()
        
    }, [modules])

    return ( 

        <div>
            <form onSubmit={handleSubmit}>

                <div className="flex gap-[0.7rem]">
                    
                    <input type="text" className="p-[0.7rem] border-[2px] rounded font-sans " placeholder="Module Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                
                    <input type="text" className="p-[0.7rem] border-[2px] rounded font-sans " placeholder="Module Order" value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10))} />

                    <input className="p-[0.7rem] border rounded bg-black-600 text-white font-sans" type="submit" value="Add Module" />
                </div>

            

            </form>


            <div className="flex flex-col gap-[0.7rem] m-[1rem]">

                {
                    modules.map(module => {
                        return <button >
                            
                            
                            {module.title}

                            {activeModule === module.id ? 
                            <div>
                                <LessonCreate module_id={module.id} />
                                <ListLessons module_id={module.id} />
                            </div>
                             : null }
                        
                            <button onClick={() => handleModulesClick(module.id) } className="p-[1rem] m-[0.7rem] text-white">Show</button>
                        </button>
                    })
                }

            </div>

            </div>
    )



}

export default ModuleCreate;