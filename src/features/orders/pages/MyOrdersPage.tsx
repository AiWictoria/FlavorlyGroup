import { useEffect } from "react";
import { Col, Row, Container } from "react-bootstrap";
import { OrderCard } from "@orders/components/OrderCard";
import Box from "../../../components/shared/Box";
import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../../auth/AuthContext";

MyOrdersPage.route = {
  path: "/MyOrders",
  protected: true,
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { orders, loading, fetchUserOrders } = useOrders();

  useEffect(() => {
    if (user?.id) {
      fetchUserOrders(user.id);
    }
  }, [user?.id]);

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8} className="my-4">
          <Box size="xl" className="p-4">
            <h2 className="mb-4">Mina beställningar</h2>
            {loading ? (
              <p className="text-center">Laddar beställningar...</p>
            ) : (
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
            )}
          </Box>
        </Col>
      </Row>
    </Container>
  );
}
