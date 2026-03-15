import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * ProtectedRoute - Guards routes based on authentication and role.
 * Props:
 *   allowedRoles {string[]}  e.g. ['admin'] or ['student']
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *   </Route>
 */
export default function ProtectedRoute({ allowedRoles }) {
    const { isAuthenticated, user, initialized } = useSelector((state) => state.auth)
    const location = useLocation()

    // Wait for auth hydration before deciding
    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
            </div>
        )
    }

    // Not logged in → redirect to login, preserve intended path
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Logged in but wrong role → redirect to appropriate home
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />
    }

    return <Outlet />
}
