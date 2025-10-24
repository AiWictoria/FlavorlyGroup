import { InMemoryOrderGateway } from "./mockGateway";
import { useOrder } from "./useOrder";
import { OrderHeader } from "./OrderHeader";
import { OrderItemsTable } from "./OrderItemsTable";
import { formatDate, formatSek } from "./typer";

const gw = new InMemoryOrderGateway();

export default function OrderDetailsPage() {
    const { data: order, loading, error } = useOrder("1", gw);
    if (loading) return <div>Laddar…</div>;
    if (error || !order) return <div>Kunde inte hämta order.</div>;

    return (
        <div className="container my-4">
            <OrderHeader orderNumber={order.orderNumber} status={order.status} />
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fs-5 fw-semibold">{order.customer.fullName}</div>
                <div>{formatDate(order.createdAt)}</div>
            </div>
            <OrderItemsTable items={order.items} />
            <div className="text-end fs-5 fw-semibold">
                Grand total: {formatSek(order.grandTotal)}
            </div>
        </div>
    );
}

OrderDetailsPage.route = {
    path: "/orders/:id"
}