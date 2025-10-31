import { InMemoryOrderGateway } from "@orders/api/mock";
import { useOrder } from "@orders/hooks/useOrder";
import { OrderHeader } from "@orders/components/OrderHeader";
import { OrderItemsTable } from "@orders/components/OrderDetailItemsTable";
import { formatDate, formatSek } from "@orders/utils/format";
import type { OrderStatus, Order } from "@models/order.types";
import { useParams } from "react-router-dom";
import { StatusButton } from "@orders/components/OrderButton";
import "@orders/components/orders.css";

const gw = new InMemoryOrderGateway();

export default function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { data: order, loading, error, setData } = useOrder(id || "", gw);

    if (!id) return <div>Ingen order ID angiven.</div>;

    if (loading) return <div>Laddar…</div>;
    if (error || !order) return <div>Kunde inte hämta order.</div>;

    const NEXT: Record<OrderStatus, OrderStatus> = {
        pending: "processing",
        processing: "completed",
        completed: "cancelled",
        cancelled: "pending",
    };

    function handleStatusClick() {
        setData((previousOrder: Order | null) =>
            previousOrder
                ? { ...previousOrder, status: NEXT[previousOrder.status] }
                : previousOrder
        );
    }

    return (
        <div className="ordersbody">
            <div className="container my-4">
                <OrderHeader
                    orderNumber={order.orderNumber}
                    status={order.status}
                    customerName={order.customerName}
                    dateText={formatDate(order.createdAt)}
                />
                <div className="orderstable">
                    <div className="d-flex flex-column justify-content-between">
                        <OrderItemsTable items={order.ingredients} />
                    </div>
                    <div className="text-black text-center fw-semibold p-2 border-bottom p-3">
                        Grand total: {formatSek(order.sum)}
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <StatusButton status={order.status} onClick={handleStatusClick} />
                </div>
            </div>
        </div>
    );
}

OrderDetailsPage.route = {
    path: "/orders/:id"
}
