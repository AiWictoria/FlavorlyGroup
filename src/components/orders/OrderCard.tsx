import { useState } from "react";
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
    <div className="card shadow mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center">
          
          <div className="me-3">
            <h5 className="card-title mb-0 fw-bold">Order #{order.id}</h5>
          </div>

          
          <div className="flex-grow-1" />

          
          <div className="d-flex align-items-center">
            <StatusBadge status={order.status} />

            <button
              type="button"
              className="btn btn-sm btn-secondary ms-2"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Toggle order details"
            >
              {open ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {open && (
          <div className="card mt-2 py-2">
            <ul className="list-unstyled mb-0 px-3">
              {order.items.map((item, i) => (
                <li key={i} className="py-1 border-bottom d-flex justify-content-between">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>{item.quantity * item.price} kr</span>
                </li>
              ))}
              <li className="pt-2 fw-bold d-flex justify-content-between">
                <span>Total:</span>
                <span>{total} kr</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
