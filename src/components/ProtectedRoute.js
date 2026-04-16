import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Impedir que quem não tem login aceda aos URLs por dentro
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;