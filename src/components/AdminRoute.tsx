import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || !user.roles.includes("Administrator")) {
        navigate("/notAuthorized");
      }
    }
  }, [user, loading, navigate]);

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
}
