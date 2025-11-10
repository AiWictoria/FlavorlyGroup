import { useState, useEffect } from "react";
import { Col, Row, Container } from "react-bootstrap";
import { OrderCard } from "@orders/components/OrderCard";
import { fetchOrders } from "@orders/api/data.mock";
import Box from "../../../components/shared/Box";
import type { Order } from "@models/order.types";

MyOrdersPage.route = {
  path: "/MyOrders",
  protected: true,
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
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8} className="my-4">
          <Box size="xl" className="p-4">
            <h2 className="mb-4">Mina beställningar</h2>
            <div className="d-flex flex-column gap-3">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <p className="text-center text-muted">
                  Du har inte gjort några beställningar
                </p>
              )}
            </div>
          </Box>
        </Col>
      </Row>
    </Container>
  );
}
