import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import toast from "react-hot-toast";
import type { Order } from "@models/order.types";

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all orders (for admin/store manager)
  async function fetchAllOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/Order");
      const data = await res.json();

      if (res.ok) {
        // Map backend Order structure to frontend Order type
        const mappedOrders = data.map((order: any) => {
          const mappedItems =
            order.items?.map((item: any) => ({
              id: item.id || Math.random(),
              amount: item.amount || 0,
              unit: item.unit?.code || item.unit?.title || "st",
              ingredient: item.product?.title || "Okänd produkt",
              cost: item.price || 0, // Total price from backend
              checked: item.checked || false,
            })) || [];

          // Calculate total sum from items + delivery price
          const deliveryPrice = order.orderPart?.DeliveryPrice?.Value || 0;
          const calculatedSum =
            mappedItems.reduce((sum: number, item: any) => sum + item.cost, 0) +
            deliveryPrice;

          return {
            id: order.id || order.contentItemId,
            orderNumber: order.orderNumber?.toString() || "",
            recipeId: "", // Not in backend Order
            recipeName: "", // Not in backend Order
            ingredients: mappedItems,
            customerId: order.user?.id || "",
            customerName: order.user?.username || "",
            address: order.deliveryAddress?.split(",")[0]?.trim() || "",
            postalCode: order.deliveryAddress?.split(",")[1]?.trim() || "",
            city: order.deliveryAddress?.split(",")[2]?.trim() || "",
            deliveryType: order.orderPart?.DeliveryType?.Text || "",
            deliveryPrice: order.orderPart?.DeliveryPrice?.Value || 0,
            sum: calculatedSum,
            date:
              order.orderDate || order.createdUtc || new Date().toISOString(),
            status: order.status || "pending",
            createdAt: order.createdUtc || new Date().toISOString(),
            updatedAt: order.modifiedUtc || new Date().toISOString(),
          };
        });

        setOrders(mappedOrders);
        return { success: true, orders: mappedOrders };
      } else {
        toast.error("Kunde inte hämta ordrar");
        return { success: false, orders: [] };
      }
    } catch (error) {
      toast.error("Nätverksfel vid hämtning av ordrar");
      return { success: false, orders: [] };
    } finally {
      setLoading(false);
    }
  }

  // Fetch orders for specific user (for MyOrders)
  async function fetchUserOrders(userId?: string) {
    if (!userId && !user?.id) {
      return { success: false, orders: [] };
    }

    const targetUserId = userId || user?.id;
    setLoading(true);

    try {
      // Fetch all orders and filter by user in frontend
      const res = await fetch(`/api/Order`);
      const data = await res.json();

      if (res.ok) {
        const mappedOrders = data
          .filter((order: any) => order.user?.id === targetUserId)
          .map((order: any) => {
            const mappedItems =
              order.items?.map((item: any) => ({
                id: item.id || Math.random(),
                amount: item.amount || 0,
                unit: item.unit?.code || item.unit?.title || "st",
                ingredient: item.product?.title || "Okänd produkt",
                cost: item.price || 0, // Total price from backend
                checked: item.checked || false,
              })) || [];

            // Mappa deliveryType och deliveryPrice direkt från backend (top-level)
            const deliveryType = order.deliveryType || "";
            const deliveryPrice =
              typeof order.deliveryPrice === "number" ? order.deliveryPrice : 0;
            const calculatedSum =
              mappedItems.reduce(
                (sum: number, item: any) => sum + item.cost,
                0
              ) + deliveryPrice;

            return {
              id: order.id || order.contentItemId,
              orderNumber: order.orderNumber?.toString() || "",
              recipeId: "",
              recipeName: "",
              ingredients: mappedItems,
              customerId: order.user?.id || "",
              customerName: order.user?.username || "",
              address: order.deliveryAddress?.split(",")[0]?.trim() || "",
              postalCode: order.deliveryAddress?.split(",")[1]?.trim() || "",
              city: order.deliveryAddress?.split(",")[2]?.trim() || "",
              deliveryType,
              deliveryPrice,
              sum: calculatedSum,
              date:
                order.orderDate || order.createdUtc || new Date().toISOString(),
              status: order.status || "pending",
              createdAt: order.createdUtc || new Date().toISOString(),
              updatedAt: order.modifiedUtc || new Date().toISOString(),
            };
          });

        setOrders(mappedOrders);
        return { success: true, orders: mappedOrders };
      } else {
        toast.error("Kunde inte hämta dina ordrar");
        return { success: false, orders: [] };
      }
    } catch (error) {
      toast.error("Nätverksfel vid hämtning av ordrar");
      return { success: false, orders: [] };
    } finally {
      setLoading(false);
    }
  }

  // Update order status
  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const res = await fetch(`/api/Order/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success("Status uppdaterad!");
        return { success: true };
      } else {
        toast.error("Kunde inte uppdatera status");
        return { success: false };
      }
    } catch (error) {
      toast.error("Nätverksfel vid uppdatering av status");
      return { success: false };
    }
  }

  return {
    orders,
    loading,
    fetchAllOrders,
    fetchUserOrders,
    updateOrderStatus,
  };
}
