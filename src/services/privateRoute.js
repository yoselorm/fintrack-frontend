import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { verifyToken } from '../redux/AuthSlice';

const PrivateRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && !user && !loading) {
      dispatch(verifyToken());
    }
  }, [dispatch, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
