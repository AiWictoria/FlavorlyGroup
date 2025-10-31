import { useState, useEffect } from "react";
import { OrderCard } from "@orders/components/OrderCard";
import { fetchOrders } from "@orders/api/data.mock";
import type { Order } from "@models/order.types";

// Use canonical Order directly in the card

MyOrdersPage.route = {
  path: "/MyOrders",
  menuLabel: "My Orders",
  index: 15,
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function loadOrders() {
      const response = await fetchOrders();
      setOrders(response.orders);
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
