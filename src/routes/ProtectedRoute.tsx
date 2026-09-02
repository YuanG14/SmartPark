import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import type { UserRole } from "../types/database";

interface ProtectedRouteProps {
  children: ReactNode;
  /** If provided, only these local demo roles may view the route. */
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Avoid a flash redirect while the local development session is restoring.
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
