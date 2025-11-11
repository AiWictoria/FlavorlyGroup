import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import toast from "react-hot-toast";

export interface ShoppingList {
  id: string;
  items: ShoppingListItem[];
}

export interface ShoppingListItem {
  id?: string;
  title: null;
  ingredient: Ingredient;
  contentType: "ShoppingListItem";
}
export interface Ingredient {
  id: string;
  title: string;
  unit: Unit;
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

  async function fetchList() {
    if (!user) return { success: false };

    try {
      const res = await fetch(`/api/ShoppingList?where=user.id==${user.id}`);

      const data: ShoppingList[] = await res.json();

      console.log(data);

      if (res.ok) {
        const list = data[0] ?? null;
        setItems(list);

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
  async function addIngredientToShoppingList(ingredient: Ingredient) {
    if (!shoppingList) return { success: false };
    console.log("Current items:", shoppingList.items);
    console.log("Adding ingredient:", ingredient);

    const newItem: ShoppingListItem = {
      title: null,
      ingredient,
      contentType: "ShoppingListItem",
    };

    const updatedList = {
      ...shoppingList,
      items: [...shoppingList.items, newItem],
    };

    console.log("Sending updated list:", updatedList);

    try {
      const res = await fetch(`/api/ShoppingList/${shoppingList.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList),
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log("Response from server:", responseData);

        await fetchList();
        return { success: true };
      } else {
        toast.error("Misslyckades med att lägga till ingrediens");
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

  return { shoppingList, addIngredientToShoppingList };
}
