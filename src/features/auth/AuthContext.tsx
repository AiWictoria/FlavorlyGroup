import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    usernameOrEmail: string,
    password: string
  ) => Promise<{ success: boolean; data?: User }>;
  logout: () => Promise<{ success: boolean }>;
  createUser: (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string
  ) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetched = useRef(false);

  useEffect(() => {
    if (!fetched.current) {
      fetchUser();
      fetched.current = true;
    }
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/login", {
        credentials: "include",
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        setUser(null);
        return;
      }

      const data: User = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
      setUser(null);
      toast.error("Något gick fel, försök igen senare");
    } finally {
      setLoading(false);
    }
  }

  async function login(usernameOrEmail: string, password: string) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        toast.error("Inloggningen misslyckades");
        return { success: false };
      }

      const data: User = await res.json();
      setUser(data);
      toast.success("Du är inloggad");
      return { success: true, data };
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
        toast.error("Utloggning misslyckades");
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
    phoneNumber: string
  ) {
    try {
      // Skapa användaren
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName,
          lastName,
          phoneNumber,
        }),
      });

      if (!res.ok) {
        toast.error("Kunde inte skapa kontot, försök igen senare.");
        return { success: false };
      }

      const newUser: User = await res.json();

      await fetch("/api/Cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: [
            {
              id: newUser.id,
              username: newUser.username,
            },
          ],
        }),
      });

      toast.success("Kontot har skapats");
      await login(email, password);
      return { success: true };
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
