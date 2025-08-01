import CoursesList from '../components/CoursesList'
import CourseCreate from '../components/CourseCreate'
import '../style/style.css'
function Teacher(){


    return (
       <div className="card-container">
        <div className='w-[450px] border-[2px] border-violet-500 rounded'>

            <CoursesList />
            
        </div>
                    <CourseCreate />


       </div>
    )

}

export default Teacher;