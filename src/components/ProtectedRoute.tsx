import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProfileModal from "../partials/header/ProfileModal";

interface ProtectedRouteProps {
  children: ReactNode;
  ownerId?: number;
}

export default function ProtectedRoute({
  children,
  ownerId,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true);
    }
  }, [user, ownerId, loading, navigate]);

  if (loading) return <p>Loading...</p>;
  if (!user)
    return <ProfileModal show={showLogin} onHide={() => setShowLogin(false)} />;

  return <>{children}</>;
}
