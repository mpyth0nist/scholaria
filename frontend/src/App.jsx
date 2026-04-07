
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoutes from './routes/ProtectedRoutes.jsx'
import Dashboard from './components/layout/DashboardLayout.jsx'
import LoginPage from './pages/Auth/LoginPage.jsx'
import CourseUpdate from './pages/courses/CourseUpdate.jsx'
import CourseCreate from './pages/courses/CourseCreate.jsx'
import Teacher from './pages/Dashboards/TeacherDashboard.jsx'
import AllCoursesPage from './pages/courses/AllCoursesPage.jsx'
import ModuleCreate from './pages/courses/modules/ModuleCreate.jsx'
import ModulesList from './pages/courses/modules/ModuleList.jsx'
import LessonPage from './pages/courses/lessons/LessonPage.jsx'
import ListQuizzes from './pages/quizzes/ListQuizzes.jsx'
import CreateQuizPage from './pages/quizzes/CreateQuizPage.jsx'
import PassQuiz from './pages/quizzes/PassQuiz.jsx'
import UpdateQuiz from './pages/quizzes/UpdateQuiz.jsx'
import StudentsPage from './pages/users/StudentsPage.jsx'

function App() {

  return (


    <BrowserRouter>

      <Routes>

        <Route element={<ProtectedRoutes />}>
          <Route path='/dashboard' element={<Dashboard>
            <Teacher />
          </Dashboard>
          } />

          <Route path='/update-course/:id' element={<Dashboard>
            <CourseUpdate />
          </Dashboard>} />

          <Route path='all-courses' element={
            <Dashboard>
              <AllCoursesPage />
            </Dashboard>
          } />

          <Route path='create-course/' element={
            <Dashboard>
              <CourseCreate />
            </Dashboard>
          } />

          <Route path='course/:course_id/create-module/' element={
            <Dashboard>
              <ModuleCreate />
            </Dashboard>
          } />

          <Route path='course/:course_id/modules/' element={
            <Dashboard>
              <ModulesList />
            </Dashboard>
          } />

          <Route path='course/module/lessons/:lesson_id' element={
            <Dashboard>
              <LessonPage />
            </Dashboard>
          } />

          <Route path='quizzes/create-quiz/' element={
            <Dashboard>
              <CreateQuizPage />
            </Dashboard>
          } />

          <Route path='quizzes/list-quizzes/' element={
            <Dashboard>
              <ListQuizzes />
            </Dashboard>
          } />

          <Route path='quizzes/:quiz_id/' element={
            <Dashboard>
              <PassQuiz />
            </Dashboard>
          } />

          <Route path='quizzes/update-quiz/:quiz_id' element={
            <Dashboard>
              <UpdateQuiz />
            </Dashboard>
          } />

          <Route path='students/' element={
            <Dashboard>
              <StudentsPage />
            </Dashboard>
          } />

        </Route>

        <Route element={<LoginPage />} path='/login' />

      </Routes>

    </BrowserRouter>
  )
}

export default App;
