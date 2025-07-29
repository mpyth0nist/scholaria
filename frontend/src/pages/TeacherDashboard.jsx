import api from '../api'
import { useState, useEffect } from 'react'

import '../style/style.css'
function Teacher( { props } ){

    return (
        <>
            <div className="teacher-card-container">
                <img src={null} alt="" className="profile-pic" />
                <div className="teacher-info">
                    <p>Full name : {props.firstName + " " + props.lastName} </p>
                    <p>Courses: {props.courses}</p>
                </div>
            </div>
        </>
    )

}

export default Teacher;