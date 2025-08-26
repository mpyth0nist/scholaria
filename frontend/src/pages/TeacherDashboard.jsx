import CoursesList from '../components/CoursesList'
import CourseCreate from '../components/CourseCreate'
import TeacherCard from '../components/TeacherInfoCard'
import '../style/style.css'
function Teacher(){


    return (


        <div className="flex gap-[0.8rem]">
            <TeacherCard />
        <div className='w-[450px] h-min border-[2px] border-violet-500 rounded'>

                <div className="text-xl font-sans pl-[1px] p-[0.8rem]">MY COURSES</div>
                <div className="flex flex-col gap-[0.4rem]">
                <CoursesList page='Home' />
                </div>

            <CourseCreate />
            
        </div>
        </div>


    )

}

export default Teacher;