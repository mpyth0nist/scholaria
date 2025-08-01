

const Sidebar = (props) => {

    const isTeacher = (props.role.toUpperCase() === 'TEACHER')


    return (
            <>
            <div className="border-r-5 border-green-500 h-screen p-[20px] mr-[2rem]">
                <img src={null} alt="" className="border-2 rounded-full w-[50px] h-[50px]" />
                <div className="font-sans text-lg">
                    <p>{props.firstName + " " + props.lastName} </p>
                </div>
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