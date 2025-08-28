
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const Sidebar = (props) => {

    const isTeacher = (props.role.toUpperCase() === 'TEACHER')
    const [toggleMenu, setToggleMenu] = useState(false)

    const navigate = useNavigate()

    return (
            <>
            <div className="border-r-5 border-green-500 h-screen p-[20px] mr-[2rem]">
                { isTeacher ? 
                    <div className='flex flex-col gap-4'>
                    <button onClick={() => setToggleMenu(!toggleMenu)} >Courses</button>

                    {
                        toggleMenu ?                         
                        <div>
                            <button onClick={() => navigate('/all-courses/')}>All Courses</button>
                            <button onClick={() => navigate('/create-course/')}>Create a Course</button>
                        </div>
                        
                        : null                     
                        

                    }


                    <button>Quizzes</button>
                    <button>Students</button>
                    
                    </div> 
                    
                    : 

                    <div className='flex flex-col gap-4'>
                    <button onClick={()=> navigate('/all-courses/')} >Courses</button>
                    <button>Quizzes</button>
                    </div>
                }
                
                   
             </div>

        </>

    )

}

export default Sidebar;