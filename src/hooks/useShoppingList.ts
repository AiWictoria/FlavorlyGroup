import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export interface ShoppingItem {
  id: number;
  userId: number;
  ingredient: string;
  checked: boolean;
}

export function useShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);

  async function fetchList() {
    if (!user) return;
    try {
      const res = await fetch(`/api/shoppingList?where=userId=${user.id}`);
      const data = await res.json();
      if (res.ok) setItems(data);
    } catch (error) {
      console.error("Failed to fetch list:", error);
    }
  }

  async function addItem(ingredient: string) {
    if (!user) return;
    const res = await fetch("/api/shoppingList", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, ingredient }),
    });
    if (res.ok) await fetchList()
  }

  async function editItem(id: number, checked: boolean) {
    const res = await fetch(`/api/shoppingList/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked }),
    });
    if (res.ok)
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked } : i))
      );
  }

  async function removeItem(id: number) {
    const res = await fetch(`/api/shoppingList/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  useEffect(() => {
    fetchList();
  }, [user]);

  return { items, addItem, editItem, removeItem, fetchList };
}
