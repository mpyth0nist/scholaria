/**
 * usePermissions.js
 *
 * Single source of truth for role checks on the frontend.
 * Import this hook instead of comparing role strings directly in components.
 *
 * Usage:
 *   const { isTeacher, isAdmin, isStudent } = usePermissions()
 */

import { useSelector } from 'react-redux'

/** Canonical role string constants — matches backend CustomUser.CHOICES */
export const ROLES = {
    TEACHER: 'Teacher',
    STUDENT: 'Student',
    ADMIN: 'ADMIN',
}

export function usePermissions() {
    const role = useSelector(state => state.users.user?.role)
    const normalised = role?.toUpperCase() ?? ''

    return {
        isTeacher: normalised === 'TEACHER',
        isAdmin:   normalised === 'ADMIN',
        isStudent: normalised === 'STUDENT',
        role,
    }
}
