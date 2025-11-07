import { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { OrderCard } from "@orders/components/OrderCard";
import { fetchOrders } from "@orders/api/data.mock";
import Box from "../../../components/shared/Box";
import type { Order } from "@models/order.types";
import PayNowButton from "../components/PayNowButton";


// Use canonical Order directly in the card

MyOrdersPage.route = {
  path: "/MyOrders",
  menuLabel: "Mina beställningar",
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
    <Row className="p-0 p-xl-5">
      <Col className="mt-4 mx-xl-5 px-xl-5">
        <h2>Mina beställningar</h2>
        <Box size="l" className="order-table-container mt-4">
          <div className="d-flex flex-column gap-2">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </Box>
      </Col>
    </Row>
  );
}
