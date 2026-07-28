import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import type { UserRole } from "../types/database";

interface ProtectedRouteProps {
  children: ReactNode;
  /** If provided, only these roles may view the route (checked client-side
   *  for UX only — the real enforcement is always RLS on the database). */
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Avoid a flash-redirect to /login while the session is still restoring.
    return <div className="p-8 text-sm text-neutral-400">Loading…</div>;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
