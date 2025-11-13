import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface AdminRouteProps {
  children: ReactNode;
}

export default function CustomerRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || !user.roles.includes("Customer")) {
        navigate("/notAuthorized");
      }
    }
  }, [user, loading, navigate]);

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
}
