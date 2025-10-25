
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const Sidebar = (props) => {

    const isTeacher = (props.role.toUpperCase() === 'TEACHER')
    const [toggleMenu, setToggleMenu] = useState(null)

    const navigate = useNavigate()

    return (
            <>
            <div className="border-r-5 border-green-500 h-screen p-[20px] mr-[2rem]">
                { isTeacher ? 
                    <div className='flex flex-col gap-4'>
                    <button onClick={() => setToggleMenu('CoursesMenu')} >Courses</button>

                    {
                        toggleMenu === 'CoursesMenu' ?                         
                        <div>
                            <button onClick={() => navigate('/all-courses/')}>All Courses</button>
                            <button onClick={() => navigate('/create-course/')}>Create a Course</button>
                        </div>
                        
                        : null                     
                        

                    }


                    <button onClick={() => setToggleMenu('QuizzesMenu')}>Quizzes</button>
                    {
                        toggleMenu === 'QuizzesMenu' ?

                            <div>
                                <button onClick={() => navigate('/quizzes/create-quiz/')}>Create New Quiz</button>
                                <button onClick={() => navigate('/quizzes/list-quizzes/')}>All Quizzes</button>
                            </div> 
                            : null

                    }
                    <button>Students</button>
                    
                    </div> 
                    
                    : 

                    <div className='flex flex-col gap-4'>
                    <button onClick={()=> navigate('/my-courses/')} >Courses</button>
                    <button onClick={() => navigate('#')}>Quizzes</button>
                    </div>
                }
                
                   
             </div>

        </>

    )

}

export default Sidebar;