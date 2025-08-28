import { useState } from "react"
import api from '../api'
import { useParams } from "react-router-dom"

const ModuleCreate = () => {

    const [title, setTitle] = useState('')
    const [order, setOrder] = useState(0)
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

    return ( 
        <form onSubmit={handleSubmit}>

            <input type="text" placeholder="Module Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            
            <input type="text" placeholder="Module Order" value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10))} />

            <input className="p-[0.7rem] border rounded bg-black-600 text-white font-sans" type="submit" value="Submit" />

        </form>
    )



}

export default ModuleCreate;