import CoursesList from '../components/CoursesList'
import CourseCreate from '../components/CourseCreate'
import TeacherCard from '../components/TeacherInfoCard'
import '../style/style.css'
function Teacher(){


    return (


        <div className="flex gap-[0.8rem]">
            <TeacherCard />
        <div className='w-[450px] h-min border-[2px] border-violet-500 rounded'>

            <CoursesList />

            <CourseCreate />
            
        </div>
        </div>


    )

}

export default Teacher;