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
      alert("Användare skapad");
      setUser(data)
    } else {
      alert("Något gick fel");
    }
    console.log(data);
    return data
  }
  return {user, login}
}