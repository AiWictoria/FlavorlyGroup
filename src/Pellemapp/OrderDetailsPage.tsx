import { InMemoryOrderGateway } from "./mockGateway";
import { useOrder } from "./useOrder";
import { OrderHeader } from "./OrderHeader";
import { OrderItemsTable } from "./OrderItemsTable";
import { formatDate, formatSek, type Order, type OrderStatus } from "./typer";
import { StatusButton } from "./OrderButton";
import "./orders.css";

const gw = new InMemoryOrderGateway();

export default function OrderDetailsPage() {
    const { data: order, loading, error, setData } = useOrder("1", gw);

    if (loading) return <div>Laddar…</div>;
    if (error || !order) return <div>Kunde inte hämta order.</div>;

    const NEXT: Record<OrderStatus, OrderStatus> = {
        NotStarted: "Started",
        Started: "Finished",
        Finished: "NotStarted",
    };

    function handleStatusClick() {
        setData(prev =>
            prev
                ? { ...prev, status: NEXT[prev.status] }
                : prev
        );
    }





    return (
        <div className="ordersbody">

            <div className="container my-4">
                <OrderHeader orderNumber={order.orderNumber}
                    status={order.status}
                    customerName={order.customer.fullName}
                    dateText={formatDate(order.createdAt)}
                />
                <div className="orderstable">
                    <div className="d-flex flex-column justify-content-between">
                        <OrderItemsTable items={order.items} />
                    </div>
                    <div className="text-black text-center fw-semibold p-2 border-bottom p-3">
                        Grand total: {formatSek(order.grandTotal)}
                    </div>
                </div>
                <div className="mt-3 text-center">
                    <StatusButton status={order.status} onClick={handleStatusClick} />
                </div>
            </div>
        </div>
    );
}

OrderDetailsPage.route = {
    path: "/orders/:id"
}