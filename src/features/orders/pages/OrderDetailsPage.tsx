import { InMemoryOrderGateway } from "@orders/api/mock";
import { useOrder } from "@orders/hooks/useOrder";
import { OrderHeader } from "@orders/components/OrderHeader";
import { OrderItemsTable } from "@orders/components/OrderDetailItemsTable";
import { formatDate, formatSek } from "@orders/utils/format";
import type { OrderStatus } from "@models/order.types";
import { useNavigate, useParams } from "react-router-dom";
import { StatusButton } from "@orders/components/OrderStatusButton";
import { StoreManagerBtn } from "@orders/components/OrderDetailsBackButton";
import "@orders/components/orders.css";

const gw = new InMemoryOrderGateway();

export default function OrderDetailsPage() {
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();
    const { data: order, loading, error, setData } = useOrder(id || "", gw);

    if (!id) return <div>Ingen order ID angiven.</div>;

    if (loading) return <div>Laddar…</div>;
    if (error || !order) return <div>Kunde inte hämta order.</div>;


    function handleStatusClick() {
        setData((previousOrder) => {
            if (!previousOrder) return previousOrder;
            const now = previousOrder.status;

            if (now === "pending") {
                return {
                    ...previousOrder,
                    status: "processing" as OrderStatus,
                    ingredients: previousOrder.ingredients.map((item) => ({ ...item, checked: false })),
                    updatedAt: new Date().toISOString(),
                };
            }
            if (now === "processing") {
                const allChecked = previousOrder.ingredients.every((item) => item.checked);
                if (!allChecked) {
                    return previousOrder;
                }
                return {
                    ...previousOrder,
                    status: "completed" as OrderStatus,
                    updatedAt: new Date().toISOString(),
                };
            }
            if (now === "completed") {
                setTimeout(() => navigate("/store-manager/orders"), 500);
                return previousOrder;
            }
            return previousOrder;
        });
    }

    function handleToggleChecked(itemId: number, checked: boolean) {
        setData(previousOrder =>
            previousOrder
                ? {
                    ...previousOrder,
                    ingredients: previousOrder.ingredients.map(item =>
                        item.id === itemId ? { ...item, checked } : item
                    ),
                    updatedAt: new Date().toISOString(),
                }
                : previousOrder
        );
    }

    return (
        <div className="ordersbody">
            <div className="container my-4">
                <StoreManagerBtn onClick={() => navigate("/store-manager/orders")} />
                <OrderHeader
                    orderNumber={order.orderNumber}
                    status={order.status}
                    customerName={order.customerName}
                    dateText={formatDate(order.createdAt)}
                />
                <div className="orderstable">
                    <div className="d-flex flex-column justify-content-between">
                        <OrderItemsTable items={order.ingredients} status={order.status} onToggleChecked={handleToggleChecked} showWhenStatuses={["processing", "completed"]} />
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
