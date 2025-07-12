import api from '../api'

function Teacher(){
    const firstName = ''
    const lastName = ''
    const courses = null
    const quizzes = null
    const students = null



    return (
        <>
            <div className="teacher-card-container">
                <img src="" alt="" className="profile-pic" />
                <div className="teacher-info">
                    <p>Full name : {firstName + " " + lastName} </p>
                    <p>Courses: {courses}</p>
                    <p>Students: {students}</p>
                    <p>quizzes: {quizzes}</p>
                </div>
            </div>
        </>
    )

}