import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import toast from "react-hot-toast";

export interface ShoppingList {
  id: string;
  items: ShoppingListItem[];
}

export interface ShoppingListItem {
  id?: string;
  ingredient: Ingredient;
  quantity?: number;
  unit?: Unit;
}

export interface Ingredient {
  id: string;
  title: string;
  unit: Unit;
  productId: string[];
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
      const res = await fetch(
        `/api/ShoppingList?where=user.id==${user.userId}`
      );

      const data: ShoppingList[] = await res.json();

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

  async function addIngredientToShoppingList(
    ingredient: Ingredient,
    quantity: number
  ) {
    if (!shoppingList) return { success: false };

    const newItem: ShoppingListItem = {
      ingredient,
      quantity,
      unit: ingredient.unit,
    };

    console.log(newItem);

    let updatedList;

    if (!shoppingList.items) {
      updatedList = {
        ...shoppingList,
        items: [newItem],
      };
    } else {
      updatedList = {
        ...shoppingList,
        items: [...shoppingList.items, newItem],
      };
    }

    console.log(updatedList);

    try {
      const res = await fetch(`/api/ShoppingList/${shoppingList.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList),
      });

      if (res.ok) {
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
