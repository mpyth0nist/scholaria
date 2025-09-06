import { useState } from 'react'
import api from '../../api'

const LessonCreate = ({module_id} ) => {

    const [title, setTitle] = useState()
    const [content, setContent] = useState()
    const [attachment, setAttachment] = useState()
    const [video, setVideo] = useState()

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('handleSubmit called')
        await api.post(`api/courses/${module_id}/add-lesson/`, {title, content, attachment})
    }
 

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-[1rem]'>

            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Title' />
            <input type="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder='Content' />
            <input type="file" onChange={(e) => setAttachment(e.target.files[0])} />

            <input type="submit" value="Add Lesson" />
            

        </form>
    )
}

export default LessonCreate;