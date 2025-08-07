
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoutes from './components/ProtectedRoutes.jsx'
import Dashboard from './pages/DashboardLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'

import Teacher from './pages/TeacherDashboard.jsx'

function App() {


  

  return (
    

    <BrowserRouter>

      <Routes>

        <Route element={<ProtectedRoutes />}>
          <Route path='/dashboard' element={<Dashboard>
            <Teacher />
            </Dashboard>
            }/>
        </Route>

        <Route element={<LoginPage />} path='/login' />

      </Routes>

    </BrowserRouter>
  )
}

export default App;
