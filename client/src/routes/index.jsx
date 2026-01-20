import { createBrowserRouter } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./routes";
import { DefaultLayout } from "../layouts/DefaultLayout";
import { EmptyLayout } from "../layouts/EmptyLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// lọc routes theo loại Layout
const getChildren = (routes, hasHeaderFooter) =>
  routes
    .filter((r) => (r.isHeaderFooter !== false) === hasHeaderFooter)
    .map((r) => ({ path: r.path, element: <r.component /> }));

export const router = createBrowserRouter([
  // PUBLIC ROUTES
  {
    element: <DefaultLayout />,
    children: getChildren(publicRoutes, true),
  },
  {
    element: <EmptyLayout />,
    children: getChildren(publicRoutes, false),
  },

  // PRIVATE ROUTES
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DefaultLayout />,
        children: getChildren(privateRoutes, true),
      },
      {
        element: <EmptyLayout />,
        children: getChildren(privateRoutes, false),
      },
    ],
  },
]);
