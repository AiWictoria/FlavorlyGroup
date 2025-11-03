import { useEffect, useState } from "react";
import type { OrderGateway } from "@orders/api/gateway";
import type { Order } from "@models/order.types";

export function useOrder(id: string, gateway: OrderGateway) {
  const [data, setData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    if (!id) {
      if (alive) {
        setData(null);
        setError(new Error("Missing order id"));
        setLoading(false);
      }
      return () => {
        alive = false;
      };
    }
    gateway
      .getOrder(id)
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e) => {
        if (alive) setError(e);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, gateway]);

  return { data, loading, error, setData };
}
