import { useState, useEffect } from "react";
import { useAuth } from "../features/auth/AuthContext";

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface DeliveryData {
  address: string;
  postcode: string;
  city: string;
  deliveryType: string;
  deliveryPrice: number;
}

export function useOrder() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartId, setCartId] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      try {
        const res = await fetch(`/api/Cart?where=user.id=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch cart");

        const data = await res.json();
        const cart = data[0];
        if (!cart || !cart.items) return;

        setCartId(cart.id);

        const uniqueProductsMap = new Map<string, Product>();
        cart.items.forEach((item: any) => {
          uniqueProductsMap.set(item.product.id, {
            id: String(item.product.id),
            name: item.product.title,
            price: item.product.price,
            quantity: item.quantity,
          });
        });
        setProducts(Array.from(uniqueProductsMap.values()));
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, [user?.id]);

  const updateCart = async (
    cartId: string,
    userId: string,
    items: Product[]
  ) => {
    try {
      const body = {
        id: cartId,
        User: [
          {
            id: userId,
            username: user?.username,
          },
        ],
        items: items.map((item) => ({
          id: item.id,
          product: {
            ContentItemIds: [item.id],
          },
          quantity: { Value: item.quantity },
          contentType: "CartItem",
        })),
      };

      const res = await fetch(`/api/Cart/${cartId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update cart");
      return await res.json();
    } catch (err) {
      console.error("Error updating cart:", err);
      throw err;
    }
  };

  const handleQuantityChange = async (
    cartItemId: string,
    newQuantity: number
  ) => {
    const updatedProducts = products.map((p) =>
      p.id === cartItemId ? { ...p, quantity: newQuantity } : p
    );

    setProducts(updatedProducts);

    try {
      if (!user || !cartId) return;

      const body = {
        id: cartId,
        User: [{ id: user.id, username: user.username }],
        items: updatedProducts.map((item) => ({
          id: item.id,
          product: { ContentItemIds: [item.id] },
          quantity: { Value: item.quantity },
          contentType: "CartItem",
        })),
      };

      const res = await fetch(`/api/Cart/${cartId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update cart");
    } catch (err) {
      console.error("Failed to update cart:", err);
    }
  };

  const [deliveryData, setDeliveryData] = useState<DeliveryData>(() => {
    const saved = sessionStorage.getItem("deliveryData");
    return saved
      ? JSON.parse(saved)
      : {
          address: "",
          postcode: "",
          city: "",
          deliveryType: "",
          deliveryPrice: 0,
        };
  });

  useEffect(() => {
    sessionStorage.setItem("deliveryData", JSON.stringify(deliveryData));
  }, [deliveryData]);

  const handleDeliveryChange = (
    type: string,
    price: number,
    formData: Omit<DeliveryData, "deliveryType" | "deliveryPrice">
  ) => {
    setDeliveryData({ ...formData, deliveryType: type, deliveryPrice: price });
  };

  return {
    products,
    updateCart,
    deliveryData,
    handleDeliveryChange,
    handleQuantityChange,
  };
}
