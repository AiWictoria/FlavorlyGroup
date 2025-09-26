import { useState } from "react"

export interface User {
  id: number
  email: string
  role?: string
  firstName?: string
  lastName?: string
}
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  async function login(email: string, password: string) {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();

    if (res.ok) {
      setUser(data)
      return {success: true, data}
    } else {
       return {success: false, error: data.error || "Login failed"}
    }
  }
  async function logout() {
    await fetch("/api/login", {
      method: "DELETE",
      credentials: "include",
    })
    setUser(null)
  }
  return {user, login, logout}
}