
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoutes from './routes/ProtectedRoutes.jsx'
import Dashboard from './components/layout/DashboardLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CourseUpdate from './components/courses/CourseUpdate.jsx'
import CourseCreate from './components/courses/CourseCreate.jsx'
import Teacher from './pages/TeacherDashboard.jsx'
import AllCoursesPage from './pages/AllCoursesPage.jsx'
import ModuleCreate from './components/modules/ModuleCreate.jsx'
import ModulesList from './components/modules/ModuleList.jsx'
import LessonPage from './pages/LessonPage.jsx'
function App() {

  return (
    

    <BrowserRouter>

      <Routes>

        <Route element={<ProtectedRoutes />}>
          <Route path='/dashboard' element={<Dashboard>
            <Teacher />
            </Dashboard>
            }/>

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
        </Route>

        <Route element={<LoginPage />} path='/login' />

      </Routes>

    </BrowserRouter>
  )
}

export default App;
