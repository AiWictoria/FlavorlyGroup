import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/login', { credentials: 'include' });
        const data = await res.json();

        if (!data.error) {
          setUser(data);
          return { success: true, data };
        }
      } catch (error) {
        toast.error('Something went wrong, try again later',);
        console.error(error);
        return { success: false };
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  async function login(email: string, password: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          usernameOrEmail: email, // Ändra från 'email' till 'usernameOrEmail'
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data);
        toast.success('Logged in successfully');
        window.location.reload();
        return { success: true, data };
      } else {
        toast.error('Login failed, try again');
        return { success: false };
      }
    } catch {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }

  async function logout() {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setUser(null);
        toast.success('You have been logged out');
        navigate('/');
        return { success: true };
      } else {
        toast.error('Logout failed, try again');
        return { success: false };
      }
    } catch {
      toast.error('Network error, please try again later');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        toast.success('Account has been created');
        await login(email, password);
        return { success: true };
      } else {
        toast.error("Couldn't create account, please try again later");
        return { success: false };
      }
    } catch {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }

  return { user, loading, login, logout, createUser };
}
