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
    const role = user.Role || "";
    const reviewerCanUseCustomerRoute =
      role === "Reviewer" && allowedRoles.includes("Customer");

    if (!allowedRoles.includes(role) && !reviewerCanUseCustomerRoute) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
