import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import toast from "react-hot-toast";

export interface ShoppingList {
  id: string;
  items: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: string;
  ingredient: Ingredient;
  quantity: number;
}

export interface Ingredient {
  id: string;
  title: string;
  unit: Unit;
  productId: string[];
}
export interface ProductId {
  id: string;
}
export interface Product {
  id?: string;
  title?: string;
  price?: number;
  quantity?: number;
  unit?: Unit;
}

export interface Unit {
  id?: string;
  title?: string;
  description?: string;
  baseUnitId?: string;
  unitCode?: string;
}
export function useShoppingList() {
  const { user } = useAuth();
  const [shoppingList, setItems] = useState<ShoppingList | null>(null);
  const [productsByIngredient, setProductsByIngredient] = useState<
    Record<string, Product[]>
  >({});

  async function fetchList() {
    if (!user) return { success: false };
    try {
      const res = await fetch(
        `/api/expand/ShoppingList?where=user.id==${user.userId}`
      );

      const data: ShoppingList[] = await res.json();

      if (res.ok) {
        const list = data[0] ?? null;
        setItems(list);

        if (list?.items?.length) {
          // For each ingredient, fetch all its products by ID
          list.items.forEach(async (item) => {
            if (!item.ingredient.productId?.length) return;

            const productPromises = item.ingredient.productId.map(
              async (id) => {
                const resProd = await fetch(
                  `http://localhost:5001/api/Product/${id}`
                );
                return resProd.json() as Promise<Product>;
              }
            );

            const products = await Promise.all(productPromises);

            setProductsByIngredient((prev) => ({
              ...prev,
              [item.ingredient.id]: products,
            }));
          });
        }

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

  return { shoppingList, productsByIngredient, fetchList };
}
