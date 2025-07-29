
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoutes from './components/ProtectedRoutes.jsx'
import Dashboard from './pages/DashboardLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import api from './api.js'
import { useState, useEffect } from 'react'



function App() {
  const [role, setRole] = useState("")
  const getUserRole = async () => {
    const res = await api.get('api/users/user/')
    setRole(res.data.role)
  }

  

  return (
    

    <BrowserRouter>

      <Routes>

        <Route element={<ProtectedRoutes />}>
          <Route path='/dashboard' element={<Dashboard role={role} />}/>
        </Route>

        <Route element={<LoginPage />} path='/login' />

      </Routes>

    </BrowserRouter>
  )
}

export default App;
