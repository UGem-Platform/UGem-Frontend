import AdminApplicationDetailPage from "@/features/admin/pages/AdminApplicationDetailPage";
import AdminApplicationsPage from "@/features/admin/pages/AdminApplicationsPage";
import { LoginPage } from "@/features/auth";
import CustomerHomePage from "@/features/customer/pages/CustomerHomePage";
import CustomerOrderDetailPage from "@/features/customer/pages/CustomerOrderDetailPage";
import CustomerOrdersPage from "@/features/customer/pages/CustomerOrdersPage";
import MerchantDetailPage from "@/features/customer/pages/MerchantDetailPage";
import WishlistPage from "@/features/customer/pages/WishlistPage";
import { MerchantPortalPage } from "@/features/merchantPortal";
import MerchantOrdersPage from "@/features/merchantPortal/pages/MerchantOrdersPage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import { createBrowserRouter, Navigate } from "react-router-dom";

const routers = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/customer",
    element: <CustomerHomePage />,
  },
  {
    path: "/customer/merchants/:id",
    element: <MerchantDetailPage />,
  },
  {
    path: "/customer/wishlist",
    element: <WishlistPage />,
  },
  {
    path: "/customer/orders",
    element: <CustomerOrdersPage />,
  },
  {
    path: "/customer/orders/:id",
    element: <CustomerOrderDetailPage />,
  },
  {
    path: "/merchant",
    element: <MerchantPortalPage />,
  },
  {
    path: "/merchant/orders",
    element: <MerchantOrdersPage />,
  },
  {
    path: "/admin/applications",
    element: <AdminApplicationsPage />,
  },
  {
    path: "/admin/applications/:id",
    element: <AdminApplicationDetailPage />,
  },
  {
    path: "/notifications",
    element: <NotificationsPage />,
  },
]);

export default routers;
