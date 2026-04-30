import { Navigate } from "react-router-dom";
import { getCurrentUser, type UserRole } from "@/features/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const user = getCurrentUser();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.Role || "")) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
