import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentDetail } from '../features/users/userSlice';

const StudentDetailPanel = ({ studentId, onClose }) => {
    const dispatch = useDispatch();
    const { studentDetail, studentDetailLoading } = useSelector(state => state.users);

    useEffect(() => {
        if (studentId) {
            dispatch(fetchStudentDetail(studentId));
        }
    }, [dispatch, studentId]);

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            ></div>
            
            {/* Slide-out Panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-primary/20 overflow-y-auto flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary/10 bg-surface sticky top-0 z-10">
                    <h2 className="text-xl font-serif font-bold text-text">Student Details</h2>
                    <button 
                        onClick={onClose}
                        className="text-primary/70 hover:text-text transition-colors p-2 hover:bg-primary/10 rounded-full"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 flex-1">
                    {studentDetailLoading || !studentDetail ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-action"></div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in">
                            {/* Profile Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary shadow-sm border border-primary/30">
                                    {studentDetail.student.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-text">{studentDetail.student.name}</h3>
                                    <p className="text-sm text-primary/70 mb-1">@{studentDetail.student.username}</p>
                                    <a href={`mailto:${studentDetail.student.email}`} className="text-sm text-action hover:underline break-all">
                                        {studentDetail.student.email}
                                    </a>
                                </div>
                            </div>

                            {/* Enrolled Courses */}
                            <section>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Course Progress
                                </h4>
                                {studentDetail.courses.length > 0 ? (
                                    <div className="space-y-3">
                                        {studentDetail.courses.map(course => (
                                            <div key={course.id} className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-text">{course.name}</span>
                                                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                        {course.progress}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-surface rounded-full h-1.5 mb-2 overflow-hidden border border-primary/10">
                                                    <div 
                                                        className="h-1.5 bg-action rounded-full" 
                                                        style={{ width: `${course.progress}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-primary/70 text-right">
                                                    {course.completed_lessons} of {course.total_lessons} lessons completed
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-primary/60 italic">Not enrolled in any of your courses.</p>
                                )}
                            </section>

                            {/* Quiz Scores */}
                            <section>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Recent Quizzes
                                </h4>
                                {studentDetail.quizzes.length > 0 ? (
                                    <div className="space-y-3">
                                        {studentDetail.quizzes.map(quiz => (
                                            <div key={quiz.id} className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl p-3">
                                                <div>
                                                    <p className="font-semibold text-text text-sm">{quiz.quiz_name}</p>
                                                    <p className="text-xs text-primary/60">{new Date(quiz.submitted_at).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${quiz.score >= 50 ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}`}>
                                                    {quiz.score}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-primary/60 italic">No quizzes taken yet.</p>
                                )}
                            </section>
                            
                            {/* Actions */}
                            <section className="pt-4 border-t border-primary/10">
                                <a 
                                    href={`mailto:${studentDetail.student.email}`}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-action hover:bg-action text-white font-semibold transition-colors shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Send Message
                                </a>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StudentDetailPanel;
