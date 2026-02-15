import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * AdminGuard - Protects admin routes
 * Redirects to /admin/login if not authenticated
 */
function AdminGuard({ children }) {
    const { isAdmin } = useAuth();
    const location = useLocation();

    if (!isAdmin) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
}

export default AdminGuard;
