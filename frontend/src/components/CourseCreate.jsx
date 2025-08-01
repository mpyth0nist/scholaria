import { useState } from "react"

const CreateCourse = () => {

    const [courseInfo, setCourseInfo] = useState([])


    return (
        <>
            <form method="POST">

                <input type="text" placeholder="Course Title.."/>
                <input type="text" placeholder="Course Subject" />
                <input type="textarea" placeholder="Course Description" />
                <input type="radio" id="true" value="true" />
                <label for="true">Yes</label>
                <input type="radio" id="false" value="false"/>
                <label for="false">No</label>
                <input type="checkbox" value="false"/>

                <input type="submit" value="Submit"/>

            </form>
        </>
    )
}