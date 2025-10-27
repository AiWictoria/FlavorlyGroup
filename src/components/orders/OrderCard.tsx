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
  status: string;
  items: OrderItem[];
}

export function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);

  const total = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <Card className="shadow mb-3">
      <Card.Body>
        <Row className="align-items-center">
          <Col xs="auto">
            <h5 className="mb-0 fw-bold">Order #{order.id}</h5>
          </Col>

          <Col className="text-end">
            <StatusBadge status={order.status} />
            <Button
              variant="secondary"
              size="sm"
              className="ms-2"
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
