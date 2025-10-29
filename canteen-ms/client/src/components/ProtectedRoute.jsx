import { Navigate } from 'react-router-dom';

const getAuth = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  try { user = userStr ? JSON.parse(userStr) : null; } catch {}
  return { token, user };
};

export default function ProtectedRoute({ roles, children }) {
  const { token, user } = getAuth();
  if (!token || !user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
