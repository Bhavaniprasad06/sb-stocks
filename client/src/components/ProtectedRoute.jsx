import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useSelector(selectAuth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
