import { useState, useEffect } from "react";
import { OrderCard } from "../components/orders/OrderCard";
import { fetchOrders } from "./Services/mockOrderService";
import type { Order } from "../types/order.types";

interface OrderCardItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderCardData {
  id: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  items: OrderCardItem[];
}

function convertToCardData(order: Order): OrderCardData {
  return {
    id: parseInt(order.id),
    status: order.status,
    items: order.ingredients.map(ing => ({
      name: ing.ingredient,
      quantity: ing.amount,
      price: ing.cost
    }))
  };
}

MyOrdersPage.route = {
  path: "/MyOrders",
  menuLabel: "My Orders",
  index: 15,
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderCardData[]>([]);

  useEffect(() => {
    async function loadOrders() {
      const response = await fetchOrders();
      setOrders(response.orders.map(convertToCardData));
    }
    loadOrders();
  }, []);

  return (
    <div className="mt-5 p-5">
      <h2 className="mt-3 mb-4">My Orders</h2>
      <div className="d-flex flex-column gap-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}