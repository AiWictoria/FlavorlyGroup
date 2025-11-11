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

  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      try {
        const res = await fetch(`/api/Cart?where=user.id=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch cart");

        const data = await res.json();
        const cart = data[0];
        if (!cart || !cart.items) return;

        const mappedProducts: Product[] = cart.items.map((item: any) => ({
          id: String(item.product.id),
          name: item.product.title,
          price: item.product.price,
          quantity: item.quanitity,
        }));

        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, [user?.id]);

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
    deliveryData,
    handleDeliveryChange,
  };
}
