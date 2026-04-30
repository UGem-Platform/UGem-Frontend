import { RouterProvider } from "react-router-dom";
import "../App.css";
import routers from "./router";

export default function App() {
  return <RouterProvider router={routers} />;
}
