import { useState } from "react";
import { Card, Row, Col, Button, ListGroup } from "react-bootstrap";
import { StatusBadge } from "./StatusBadge";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  items: OrderItem[];
}

export function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);

  const total = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <Card className="shadow mb-3">
      <Card.Body>
        <Row className="align-items-center">
          <Col xs={8}>
            <h5 className="mb-0 fw-bold">Order #{order.id}</h5>
          </Col>

          <Col xs={4} className="text-end d-flex justify-content-end align-items-center gap-2">
            <StatusBadge status={order.status} context="my-orders" />
            <Button
              variant=""
              size="sm"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Toggle order details"
            >
              {open ? "▲" : "▼"}
            </Button>
          </Col>
        </Row>

        {open && (
          <Card className="mt-3">
            <ListGroup variant="flush">
              {order.items.map((item, i) => (
                <ListGroup.Item key={i} className="d-flex justify-content-between">
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span>{item.quantity * item.price} kr</span>
                </ListGroup.Item>
              ))}
              <ListGroup.Item className="fw-bold d-flex justify-content-between">
                <span>Total:</span>
                <span>{total} kr</span>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
}
