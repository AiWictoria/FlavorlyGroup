import { useState } from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { StatusBadge } from "./orders/StatusBadge";
import type { Order } from "@models/order.types";
import "./OrderCard.css";

export function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);

  const total = order.sum;

  const getStatusDescription = (status: string): string => {
    switch (status) {
      case "pending":
        return "Din beställning har mottagits och väntar på att behandlas";
      case "processing":
        return "Din beställning håller på att packas och förberedas";
      case "completed":
        return "Din beställning har skickats och levereras snart";
      case "cancelled":
        return "Denna beställning har avbrutits";
      default:
        return "Status okänd";
    }
  };

  return (
    <Card className="flavorly-shadow order-card">
      <Card.Body className="py-3">
        <Row className="align-items-center gx-2">
          <Col xs={7} sm={8}>
            <div className="d-flex flex-column gap-1">
              <h5 className="mb-1">Order {order.orderNumber}</h5>
              <div className="order-date">
                <span className="date-label">Orderdatum:</span>
                <span className="date-value">
                  {new Date(order.date).toLocaleDateString("sv-SE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </Col>
          <Col
            xs={5}
            sm={4}
            className="text-end d-flex justify-content-end align-items-center gap-2"
          >
            <StatusBadge status={order.status} context="my-orders" />
            <Button
              variant="light"
              size="sm"
              className="p-0 border-0 d-flex align-items-center justify-content-center bg-white"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Toggle order details"
              style={{ width: 32, height: 32 }}
            >
              <i className={`bi bi-chevron-${open ? "up" : "down"} fs-5`}></i>
            </Button>
          </Col>
        </Row>

        {open && (
          <div className="mt-3">
            <div className="mb-3 p-3 bg-light rounded-2">
              <div className="d-flex align-items-start gap-2">
                <i className="bi bi-info-circle text-primary mt-1"></i>
                <div>
                  <div className="fw-semibold mb-1">Status</div>
                  <div className="small text-muted">
                    {getStatusDescription(order.status)}
                  </div>
                </div>
              </div>
            </div>
            <div className="border rounded-2 overflow-hidden">
              {order.ingredients.map(
                (item: Order["ingredients"][number], i: number) => (
                  <div
                    key={i}
                    className={`px-3 py-2 d-flex justify-content-between align-items-center ${
                      i !== order.ingredients.length - 1 ? "border-bottom" : ""
                    }`}
                  >
                    <span className="order-items">
                      {item.amount} {item.unit} {item.ingredient}
                    </span>
                    <span className="order-items">{item.cost} kr</span>
                  </div>
                )
              )}
              <div className="px-3 py-2 d-flex justify-content-between align-items-center border-top order-total">
                <span>Total</span>
                <span>{total} kr</span>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
