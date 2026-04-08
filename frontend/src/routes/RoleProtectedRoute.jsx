import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

/**
 * Wraps routes that require a specific role.
 * Depends on the `users.user.role` slice being populated by DashboardLayout's fetchUser call.
 *
 * Usage in App.jsx:
 *   <Route element={<RoleProtectedRoute allowedRoles={['Teacher']} />}>
 *     <Route path="create-course" element={...} />
 *   </Route>
 */
const RoleProtectedRoute = ({ allowedRoles }) => {
    const role = useSelector(state => state.users.user?.role)

    // While the user hasn't loaded yet (role is undefined), wait — don't redirect prematurely
    if (role === undefined) return null

    return allowedRoles.includes(role)
        ? <Outlet />
        : <Navigate to="/dashboard" replace />
}

export default RoleProtectedRoute
