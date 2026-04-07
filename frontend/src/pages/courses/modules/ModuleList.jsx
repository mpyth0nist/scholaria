import { useParams } from 'react-router-dom'
import api from '../../../api'
import { useEffect, useState } from 'react'
import ListLessons from '../lessons/ListLessons'

const ModulesList = () => {
    const [modules, setModules] = useState([])
    const [activeModule, setActiveModule] = useState(null)
    const [toggleUpdate, setToggleUpdate] = useState(false)
    const { course_id } = useParams()
    const getModules = async () => {

        const res = await api.get(`api/courses/${course_id}/modules/`)
        setModules(res.data)

    }

    const updateModule = async (e, moduleId, updateData) => {
        e.preventDefault()
        try {
            const res = await api.patch(`api/courses/modules/${moduleId}/update-module/`, updateData)
        } catch (errors) {
            console.log(errors)
        }

    }

    const deleteModule = async (e, moduleId) => {
        e.preventDefault()

        try {
            const res = await api.delete(`api/courses/modules/${moduleId}/delete-module/`)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getModules()
    }, [])

    return (

        <div>
            {

                modules.map(module => {

                    return <div>

                        {
                            toggleUpdate && activeModule === module.id ? <form onSubmit={e => updateModule(e, module.id, { title: module.title, order: module.order })}> <input type="number" value={module.order} onChange={(e) => setModules(prevModules => {
                                return prevModules.map(prevModule => {
                                    return prevModule.id === module.id ? { ...prevModule, order: e.target.value } : prevModule
                                })
                            })} /><input type="text" value={module.title} onChange={(e) => setModules(prevModules => {
                                return prevModules.map(prevModule => {
                                    return prevModule.id === module.id ? { ...prevModule, title: e.target.value } : prevModule
                                })
                            })} />

                                <input type="submit" value="submit" />
                            </form> : <button>{module.title}</button>
                        }


                        <button onClick={() => {
                            setToggleUpdate(!toggleUpdate)
                            setActiveModule(module.id)
                        }}>Edit</button>
                        <button onClick={() => {
                            setActiveModule(module.id)
                            if (toggleUpdate === true) { setToggleUpdate(!toggleUpdate) }
                        }}>Lessons</button>

                        <button onClick={(e) => {
                            deleteModule(e, module.id)
                        }}>Delete</button>

                        {
                            toggleUpdate !== true && activeModule === module.id ? <ListLessons module_id={module.id} /> : null
                        }



                    </div>
                })

            }
        </div>

    )
}

export default ModulesList;