// src/utils/HROnly.jsx
import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';

export default function HROnly({ children }) {
    const token = localStorage.getItem('access');
    if (!token) return <Navigate to="/login" replace />;

    try {
        const decoded = jwtDecode(token);
        // نتوقع أن الـrole داخل الـJWT (أضفناه في السيرفر)
        if (decoded && decoded.role === 'hr') {
            return children;
        }
        return <Navigate to="/dashboard" replace />;
    } catch {
        return <Navigate to="/login" replace />;
    }
}
