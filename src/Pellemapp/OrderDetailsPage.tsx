import { InMemoryOrderGateway } from "./mockGateway";
import { useOrder } from "./useOrder";
import { OrderHeader } from "./OrderHeader";
import { OrderItemsTable } from "./OrderItemsTable";
import { formatDate, formatSek } from "./typer";
import { StatusButton } from "./OrderButton";

const gw = new InMemoryOrderGateway();

export default function OrderDetailsPage() {
    const { data: order, loading, error } = useOrder("1", gw);

    if (loading) return <div>Laddar…</div>;
    if (error || !order) return <div>Kunde inte hämta order.</div>;

    function handleStatusClick() {
        console.log("knapp klickad! nuvarande status: ", order?.status)
    }

    return (
        <div className="container my-4">
            <OrderHeader orderNumber={order.orderNumber} status={order.status} />
            <div className="bg-primary">
                <div className="fs-5 p-4 fw-semibold text-white d-flex flex-row justify-content-between">{order.customer.fullName} <span>{formatDate(order.createdAt)}</span></div>
            </div>
            <div className="d-flex flex-column justify-content-between">
                <OrderItemsTable items={order.items} />
            </div>
            <div className="text-black bg-light text-center fw-semibold p-2 border-bottom">
                Grand total: {formatSek(order.grandTotal)}
            </div>
            <div className="mt-5 text-center">
                <StatusButton status={order.status} onClick={handleStatusClick} />
            </div>

        </div>
    );
}

OrderDetailsPage.route = {
    path: "/orders/:id"
}