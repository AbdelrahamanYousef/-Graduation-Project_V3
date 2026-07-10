import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { paths } from '../../constants/paths';

/**
 * RoleProtectedRoute - Checks if authenticated staff user's role is allowed
 * Redirects to /admin/unauthorized if not permitted
 */
function RoleProtectedRoute({ allowedRoles, children }) {
    const { adminUser } = useAuth();

    if (!adminUser) {
        return <Navigate to={paths.auth.adminLogin} replace />;
    }

    if (!allowedRoles.includes(adminUser.role)) {
        return <Navigate to={paths.admin.unauthorized} replace />;
    }

    return children;
}

export default RoleProtectedRoute;
