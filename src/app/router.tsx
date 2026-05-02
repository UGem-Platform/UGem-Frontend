import AdminApplicationDetailPage from "@/features/admin/pages/AdminApplicationDetailPage";
import AdminApplicationsPage from "@/features/admin/pages/AdminApplicationsPage";
import AdminStaffPage from "@/features/admin/pages/AdminStaffPage";
import AffiliateLinkPage from "@/features/affiliateLink/pages/AffiliateLinkPage";
import { LoginPage, RegisterPage } from "@/features/auth";
import CustomerHomePage from "@/features/customer/pages/CustomerHomePage";
import CustomerOrderDetailPage from "@/features/customer/pages/CustomerOrderDetailPage";
import CustomerOrdersPage from "@/features/customer/pages/CustomerOrdersPage";
import MerchantDetailPage from "@/features/customer/pages/MerchantDetailPage";
import WishlistPage from "@/features/customer/pages/WishlistPage";
import {
  MerchantApplicationStatusPage,
  MerchantFoodsPage,
  MerchantOnboardingPage,
  MerchantPortalPage,
} from "@/features/merchantPortal";
import MerchantOrdersPage from "@/features/merchantPortal/pages/MerchantOrdersPage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import ReviewsPage from "@/features/review/pages/ReviewsPage";
import VietMapDemoPage from "@/shared/pages/VietMapDemoPage";
import UnauthorizedPage from "@/shared/pages/UnauthorizedPage";
import { NotFoundPage } from "@/shared/pages/NotFoundPage";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import RouteErrorPage from "@/app/RouteErrorPage";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

function RootLayout() {
  return <Outlet />;
}

const routers = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "/customer",
        element: (
          <ProtectedRoute allowedRoles={["Customer"]}>
            <CustomerHomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/customer/merchants/:id",
        element: (
          <ProtectedRoute allowedRoles={["Customer"]}>
            <MerchantDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/customer/wishlist",
        element: (
          <ProtectedRoute allowedRoles={["Customer"]}>
            <WishlistPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/customer/orders",
        element: (
          <ProtectedRoute allowedRoles={["Customer"]}>
            <CustomerOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/customer/orders/:id",
        element: (
          <ProtectedRoute allowedRoles={["Customer"]}>
            <CustomerOrderDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/merchant",
        element: (
          <ProtectedRoute allowedRoles={["Merchant"]}>
            <MerchantPortalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/merchant/application/create",
        element: (
          <ProtectedRoute allowedRoles={["Merchant"]}>
            <MerchantOnboardingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/merchant/application/status",
        element: (
          <ProtectedRoute allowedRoles={["Merchant"]}>
            <MerchantApplicationStatusPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/merchant/orders",
        element: (
          <ProtectedRoute allowedRoles={["Merchant"]}>
            <MerchantOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/merchant/foods",
        element: <MerchantFoodsPage />,
      },
      {
        path: "/admin/applications",
        element: (
          <ProtectedRoute allowedRoles={["Staff", "Admin"]}>
            <AdminApplicationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/applications/:id",
        element: (
          <ProtectedRoute allowedRoles={["Staff", "Admin"]}>
            <AdminApplicationDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/staff",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminStaffPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/notifications",
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reviews",
        element: (
          <ProtectedRoute>
            <ReviewsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/affiliate-links",
        element: (
          <ProtectedRoute allowedRoles={["Merchant"]}>
            <AffiliateLinkPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/map-demo",
        element: <VietMapDemoPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
