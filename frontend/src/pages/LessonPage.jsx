import { useParams } from "react-router-dom";
import api from "../api";
import { useState, useEffect } from "react";

const LessonPage = () => {

    const {lesson_id} = useParams()
    const [lesson, setLesson] = useState({})

    const [toggleUpdate, setToggleUpdate] = useState(false)

    const getLesson = async () => {
        const res = await api.get(`api/courses/lessons/${lesson_id}/`)

        setLesson(res.data[0])

    }

    const updateLesson = ( lessonId, updateData) => {

        try {
            const res = api.patch(`api/courses/lessons/${lessonId}/update-lesson/`, updateData)
        } catch (error) {
            console.log(error)
        }
    }

    const deleteLesson = () => {
        
    }

    useEffect(() => {
        getLesson()
    }, [])


    return(
        <div>
        { toggleUpdate ? 
        
            <form onSubmit={() => updateLesson(lesson.id, {title: lesson.title, content: lesson.content, attachment: lesson.attachment})}>
                <input type="text" value={lesson.title} onChange={(e) => setLesson({...lesson, title: e.target.value}) }/>
                <input type="text" value={lesson.content} onChange={(e) => setLesson({...lesson, content: e.target.value})} />
                <input type="file"  value={lesson.attachment} onChange={(e) => setLesson({...lesson, attachment: e.target.files[0] })} />

                <input type="submit" value="submit" />
            </form> 
            
            : 
                <div>
                
                <h1>{lesson.title}</h1>

                <p>{lesson.content}</p>

                <button><a href={lesson.attachment}>Attachment</a></button>

                <button onClick = {() => {setToggleUpdate(!toggleUpdate)}}>Edit Lesson</button>

                <button onClick = {(e) => {

                }}>Delete Lesson</button> 
            </div>
        
        }


        </div>




    )



}

export default LessonPage;