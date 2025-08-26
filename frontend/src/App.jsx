
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoutes from './components/ProtectedRoutes.jsx'
import Dashboard from './pages/DashboardLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CourseUpdate from './components/CourseUpdate.jsx'
import Teacher from './pages/TeacherDashboard.jsx'
import AllCoursesPage from './pages/AllCoursesPage.jsx'

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
        </Route>

        <Route element={<LoginPage />} path='/login' />

      </Routes>

    </BrowserRouter>
  )
}

export default App;
