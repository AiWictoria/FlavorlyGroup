
import { useEffect, useState } from "react";
import type { OrderGateway } from "./gateway";
import { type Order } from "./typer";

export function useOrder(id: string, gateway: OrderGateway) {
    const [data, setData] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        gateway.getOrder(id)
            .then(d => { if (alive) setData(d); })
            .catch(e => { if (alive) setError(e); })
            .finally(() => alive && setLoading(false));
        return () => { alive = false; };
    }, [id, gateway]);

    return { data, loading, error, setData };
}
