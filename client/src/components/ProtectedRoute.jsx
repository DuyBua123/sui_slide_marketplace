import { Navigate, Outlet } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ROUTE } from "../constant/routeConfig";
const ProtectedRoute = () => {
  const account = useCurrentAccount();

  if (!account) {
    return <Navigate to={ROUTE.SIGN_IN} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
