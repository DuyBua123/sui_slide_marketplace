import { Navigate, Outlet } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
const ProtectedRoute = () => {
  const account = useCurrentAccount();

  if (!account) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
