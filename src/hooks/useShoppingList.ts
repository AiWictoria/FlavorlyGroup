import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import toast from "react-hot-toast";
import type { Ingredient } from "./useRecipes";

export interface ShoppingItem {
  id: string;
  ingredient: Ingredient;
  productName: string;
  productPrice: number;
  productQuantity: number;
  productUnit: string;
}

export interface ShoppingList {
  id: string;
  shoppingItems: ShoppingItem[];
  totalCost: number;
  totalQuantity: number;
  totalUnits: string;
}
export function useShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingList[]>([]);

  async function fetchList() {
    if (!user) return { success: false };

    try {
      const res = await fetch(`/api/shoppingList?where=userId=${user.userId}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data as ShoppingList[]);
        return { success: true };
      } else {
        toast.error(
          "Misslyckades med att ladda inköpslistan, försök igen senare"
        );
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  async function addItem(ingredient: string) {
    if (!user) return { success: false };
    try {
      const res = await fetch("/api/shoppingList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId, ingredient }),
      });
      if (res.ok) {
        toast.success("Lagt till i inköpslistan");
        await fetchList();
        return { success: true };
      } else {
        toast.error(
          "Misslyckades med att registrera inköpslistan, försök igen"
        );
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  async function toggleItemChecked(id: string, checked: boolean) {
    try {
      const res = await fetch(`/api/shoppingList/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, checked } : i))
        );
        return { success: true };
      } else {
        toast.error("Misslyckades med att uppdatera objektets status");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  async function removeItem(id: number) {
    try {
      const res = await fetch(`/api/shoppingList/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success("Objektet har tagits bort");
        return { success: true };
      } else {
        toast.error("Misslyckades med att ta bort objektet, försök igen");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  useEffect(() => {
    fetchList();
  }, [user]);

  return { items, addItem, removeItem, toggleItemChecked, fetchList };
}
