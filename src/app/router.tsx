import AdminJobDetailPage from "@/features/admin/pages/AdminJobDetailPage";
import AdminJobsPage from "@/features/admin/pages/AdminJobsPage";
import AdminStaffPage from "@/features/admin/pages/AdminStaffPage";
import StaffReviewerApplicationsPage from "@/features/admin/pages/StaffReviewerApplicationsPage";
import StaffApplicationDetailPage from "@/features/admin/pages/StaffApplicationDetailPage";
import StaffApplicationsPage from "@/features/admin/pages/StaffApplicationsPage";
import StaffProfilePage from "@/features/admin/pages/StaffProfilePage";
import StaffUserProfilePage from "@/features/admin/pages/StaffUserProfilePage";
import AffiliateLinkPage from "@/features/affiliateLink/pages/AffiliateLinkPage";
import { LoginPage, RegisterPage } from "@/features/auth";
import CheckInPage from "@/shared/pages/CheckInPage";
import CustomerHomePage from "@/features/customer/pages/CustomerHomePage";
import CustomerOrderDetailPage from "@/features/customer/pages/CustomerOrderDetailPage";
import CustomerOrdersPage from "@/features/customer/pages/CustomerOrdersPage";
import CustomerProfilePage from "@/features/customer/pages/CustomerProfilePage";
import MerchantDetailPage from "@/features/customer/pages/MerchantDetailPage";
import WishlistPage from "@/features/customer/pages/WishlistPage";
import {
  MerchantApplicationStatusPage,
  MerchantCampaignPage,
  MerchantFoodsPage,
  MerchantOnboardingPage,
  MerchantPortalPage,
  MerchantRestaurantPage,
  MerchantViewStatisticsPage,
} from "@/features/merchantPortal";
import MerchantOrdersPage from "@/features/merchantPortal/pages/MerchantOrdersPage";
import MerchantProfilePage from "@/features/merchantPortal/pages/MerchantProfilePage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import ReviewsPage from "@/features/review/pages/ReviewsPage";
import VietMapDemoPage from "@/shared/pages/VietMapDemoPage";
import UnauthorizedPage from "@/shared/pages/UnauthorizedPage";
import { NotFoundPage } from "@/shared/pages/NotFoundPage";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import RouteErrorPage from "@/app/RouteErrorPage";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

const routers = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
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
        path: "/check-in",
        element: <CheckInPage />,
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
        path: "/customer/profile",
        element: (
          <ProtectedRoute allowedRoles={["Customer"]}>
            <CustomerProfilePage />
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
        path: "/merchant/restaurant",
        element: (
          <ProtectedRoute allowedRoles={["Merchant"]}>
            <MerchantRestaurantPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/merchant/profile",
        element: (
          <ProtectedRoute allowedRoles={["Merchant"]}>
            <MerchantProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/merchant/application/create",
        element: (
          <ProtectedRoute allowedRoles={["Customer", "Merchant"]}>
            <MerchantOnboardingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/merchant/application/status",
        element: (
          <ProtectedRoute allowedRoles={["Customer", "Merchant"]}>
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
        element: (
          <ProtectedRoute allowedRoles={["Merchant"]}>
            <MerchantFoodsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/merchant/campaigns",
        element: (
          <ProtectedRoute allowedRoles={["Merchant"]}>
            <MerchantCampaignPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/merchant/view-statistics",
        element: (
          <ProtectedRoute allowedRoles={["Merchant"]}>
            <MerchantViewStatisticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff",
        element: <Navigate to="/staff/dashboard" replace />,
      },
      {
        path: "/staff/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/applications",
        element: (
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffApplicationsPage tab="pending" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/applications/pending",
        element: (
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffApplicationsPage tab="pending" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/applications/approved",
        element: (
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffApplicationsPage tab="reviewed" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/applications/:id",
        element: (
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffApplicationDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/profile",
        element: (
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffUserProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/reviewer-applications",
        element: (
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffReviewerApplicationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/jobs",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminJobsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/jobs/:id",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminJobDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/applications",
        element: <Navigate to="/admin/jobs" replace />,
      },
      {
        path: "/admin/applications/:id",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminJobDetailPage />
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
  },
]);

export default routers;
