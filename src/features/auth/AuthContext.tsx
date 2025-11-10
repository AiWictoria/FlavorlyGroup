import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export interface User {
  userId: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; data?: User }>;
  logout: () => Promise<{ success: boolean }>;
  createUser: (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/login", { credentials: "include" });
        const data = await res.json();
        if (!data.error) setUser(data);
      } catch (error) {
        toast.error("Något gick fel, försök igen senare");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  async function login(usernameOrEmail: string, password: string) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ usernameOrEmail: usernameOrEmail, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        toast.success("Inloggning lyckades");
        window.location.reload();
        return { success: true, data };
      } else {
        toast.error("Inloggningen misslyckades, försök igen");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  async function logout() {
    try {
      const res = await fetch("/api/auth/login", {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setUser(null);
        toast.success("Du har blivit utloggad");
        navigate("/");
        return { success: true };
      } else {
        toast.error("Utloggning misslyckades, försök igen");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  async function createUser(
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName,
          lastName,
          phone,
        }),
      });
      if (res.ok) {
        toast.success("Kontot har skapats");
        await login(email, password);
        return { success: true };
      } else {
        toast.error("Kunde inte skapa kontot, försök igen senare.");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, createUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
