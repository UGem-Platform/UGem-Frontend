import { Navigate, createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../features/auth";
import { NotFoundPage } from "../shared/pages/NotFoundPage";
import {
  MerchantOnboardingPage,
  MerchantPortalPage,
  MerchantApplicationStatusPage,
} from "../features/merchantPortal";

export const router = createBrowserRouter([
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
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/merchant",
    element: <MerchantPortalPage />,
  },
  {
    path: "/merchant/application/create",
    element: <MerchantOnboardingPage />,
  },
  {
    path: "/merchant/application/status",
    element: <MerchantApplicationStatusPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
