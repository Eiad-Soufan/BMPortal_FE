import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('access');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    console.log("AdminRoute token:", token);
    console.log("Decoded:", decoded);

    // ✅ تحقق من is_staff هنا
    if (decoded.is_staff === true) {
      return children;
    } else {
      console.log("Redirecting: not admin");
      return <Navigate to="/dashboard" />;
    }

  } catch (e) {
    console.error("Error decoding token:", e);
    return <Navigate to="/login" />;
  }
};

export default AdminRoute;
