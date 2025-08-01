import '../style/style.css'
function Student( props ){


    return (
            <div className="student-info container">
                <div className="profile-picture">
                    <img src={null} alt="" />
                </div>
                <div className="student-text info">
                    <p>{props.firstName + " " + props.lastName}</p>
                </div>
                <div className='flex flex-col gap-4'>
                    <button className="nav-item">Courses</button>
                    <button className="nav-item">Quizzes</button>
                </div>
                   
            </div>


    )

}

export default Student;