
import { useState, useEffect } from "react";
import { useAuth } from "../features/auth/AuthContext";


export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unitId?: string;
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
    const [cartId, setCartId] = useState<string | null>(null);

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
              unitId: item.unit?.id || undefined,
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
      const updatedProducts = products.map((p: Product) =>
        p.id === cartItemId ? { ...p, quantity: newQuantity } : p
      );
      setProducts(updatedProducts);
      try {
        if (!user || !cartId) return;
        const body = {
          id: cartId,
          User: [{ id: user.id, username: user.username }],
          items: updatedProducts.map((item: Product) => ({
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

    const createOrder = async (savedProducts?: Product[], savedDeliveryData?: DeliveryData) => {
      const productsToUse = savedProducts || products;
      const deliveryToUse = savedDeliveryData || deliveryData;
      if (!user || productsToUse.length === 0) {
        throw new Error("No user or products available");
      }
      const orderItems = productsToUse.map((product: Product) => ({
        contentType: "OrderItem",
        productId: product.id,
        amount: product.quantity,
        unitId: product.unitId,
        price: product.price * product.quantity,
        checked: false
      }));
      function generateOrderNumber() {
        const usedNumbers = JSON.parse(sessionStorage.getItem("usedOrderNumbers") || "[]");
        let newNumber;
        do {
          newNumber = Math.floor(1000 + Math.random() * 9000); 
        } while (usedNumbers.includes(newNumber));
        usedNumbers.push(newNumber);
        sessionStorage.setItem("usedOrderNumbers", JSON.stringify(usedNumbers));
        return "#" + newNumber;
      }
      const orderBody = {
        status: "pending",
        orderNumber: generateOrderNumber(), 
    totalSum: orderItems.reduce((sum: number, item: { price: number }) => sum + item.price, 0),
        orderDate: new Date().toISOString(),
        deliveryAddress: `${deliveryToUse.address}, ${deliveryToUse.postcode}, ${deliveryToUse.city}`,
        deliveryType: deliveryToUse.deliveryType,
        deliveryPrice: deliveryToUse.deliveryPrice,
        user: [
          {
            id: user.id,
            username: user.username
          }
        ],
        items: orderItems
      };
      const response = await fetch("/api/Order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderBody),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create order");
      }
      const createdOrder = await response.json();
      if (cartId) {
        await updateCart(cartId, user.id, []);
      }
      return createdOrder;
    };

    const handleRemoveProduct = async (productId: string) => {
      try {
        if (!cartId || !user) return;
    const updatedProducts = products.filter((p: Product) => p.id !== productId);
        const body = {
          id: cartId,
          User: [{ id: user.id, username: user.username }],
          items: updatedProducts.map((item: Product) => ({
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
        setProducts(updatedProducts);
      } catch (err) {
        console.error("Failed to remove product:", err);
      }
    };

    return {
      products,
      cartId,
      deliveryData,
      setDeliveryData,
      updateCart,
      handleQuantityChange,
      handleDeliveryChange,
      createOrder,
      handleRemoveProduct,
    };
  }
