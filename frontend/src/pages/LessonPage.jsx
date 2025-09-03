import { useParams } from "react-router-dom";
import api from "../api";
import { useState, useEffect } from "react";

const LessonPage = () => {

    const {lesson_id} = useParams()
    const [lesson, setLesson] = useState({})


    const getLesson = async () => {
        const res = await api.get(`api/courses/lessons/${lesson_id}/`)

        setLesson(res.data[0])

    }


    useEffect(() => {
        getLesson()
    }, [])


    return(

        <div>
            <h1>{lesson.title}</h1>

            <p>{lesson.content}</p>

            <button><a href={lesson.attachment}>Attachment</a></button>

        </div>


    )



}

export default LessonPage;