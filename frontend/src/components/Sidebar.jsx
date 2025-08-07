

const Sidebar = (props) => {

    const isTeacher = (props.role.toUpperCase() === 'TEACHER')


    return (
            <>
            <div className="border-r-5 border-green-500 h-screen p-[20px] mr-[2rem]">
                { isTeacher ? 
                    <div className='flex flex-col gap-4'>
                    <button >Courses</button>
                    <button>Quizzes</button>
                    <button>Students</button></div> 
                    
                    : 

                    <div className='flex flex-col gap-4'>
                    <button >Courses</button>
                    <button>Quizzes</button>
                    </div>
                }
                
                   
             </div>

        </>

    )

}

export default Sidebar;