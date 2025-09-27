import { useEffect, useState } from "react"

export interface User {
  id: number
  email: string
  password?: string
  role?: string
  firstName?: string
  lastName?: string
}
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/login", { credentials: "include" })
      .then(res => res.json())
      .then(data => { if (!data.error) setUser(data) })
      .finally(() => setLoading(false))
  }, [])

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

  async function createUser(email: string, password: string, firstName: string, lastName: string) {

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    const data = await res.json();

    if (res.ok) {
      const loginRes = await login(email, password)
      return {success: true, loginRes}
    } else {
       return {success: false, error: data.error || "Something went wrong"}
    }
  }

  return {user, loading, login, logout, createUser}
}