import AdminStaffPage from "@/features/admin/pages/AdminStaffPage";
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import AdminApplicationsPage from "@/features/admin/pages/AdminApplicationsPage";
import AdminApplicationDetailPage from "@/features/admin/pages/AdminApplicationDetailPage";
import { AdminShell } from "@/features/admin/components/AdminShell";
import StaffReviewerApplicationsPage from "@/features/admin/pages/StaffReviewerApplicationsPage";
import StaffApplicationDetailPage from "@/features/admin/pages/StaffApplicationDetailPage";
import StaffApplicationsPage from "@/features/admin/pages/StaffApplicationsPage";
import StaffProfilePage from "@/features/admin/pages/StaffProfilePage";
import StaffMerchantsPage from "@/features/admin/pages/StaffMerchantsPage";
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
import ConfirmBillPage from "@/features/customer/pages/ConfirmBillPage";
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
import MerchantCreateOrderPage from "@/features/merchantPortal/pages/MerchantCreateOrderPage";
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
        path: "/orders/confirm",
        element: (
          <ProtectedRoute allowedRoles={["Customer"]}>
            <ConfirmBillPage />
          </ProtectedRoute>
        ),
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
        path: "/merchant/create-order",
        element: (
          <ProtectedRoute allowedRoles={["Merchant"]}>
            <MerchantCreateOrderPage />
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
        path: "/staff/merchants",
        element: (
          <ProtectedRoute allowedRoles={["Staff"]}>
            <StaffMerchantsPage />
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
        path: "/admin/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/staff",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminShell>
              <AdminStaffPage />
            </AdminShell>
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/applications",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminShell>
              <AdminApplicationsPage
              basePath="/admin/applications"
              title="Hồ sơ merchant"
              subtitle="Theo dõi và xử lý hồ sơ merchant trong hệ thống."
              fallbackName="Admin"
              canReview
              backTo="/admin/dashboard"
              backLabel="Back"
              />
            </AdminShell>
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/applications/:id",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminShell>
              <AdminApplicationDetailPage
                basePath="/admin/applications"
                fallbackName="Admin"
                canReview
              />
            </AdminShell>
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/reviewer-applications",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminShell>
              <StaffReviewerApplicationsPage
                shell="admin"
                fallbackName="Admin"
                canReview={false}
                backTo="/admin/dashboard"
                backLabel="Back"
              />
            </AdminShell>
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/notifications",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminShell>
              <NotificationsPage />
            </AdminShell>
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
