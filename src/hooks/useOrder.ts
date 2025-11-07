import { useState, useEffect } from "react";

export interface Product {
  id: number;
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
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = sessionStorage.getItem("orderProducts");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, name: "Mjölk", price: 20, quantity: 2 },
          { id: 2, name: "Ägg 6p frigående höns", price: 35, quantity: 1 },
        ];
  });

  useEffect(() => {
    sessionStorage.setItem("orderProducts", JSON.stringify(products));
  }, [products]);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, quantity: newQuantity } : p
      )
    );
  };

  const handleRemoveProduct = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
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
    handleQuantityChange,
    handleRemoveProduct,
    deliveryData,
    handleDeliveryChange,
  };
}
