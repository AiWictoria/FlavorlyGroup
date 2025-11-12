import { useState, useEffect } from "react";
import { OrderHeader } from "@orders/components/OrderHeader";
import { OrderItemsTable } from "@orders/components/OrderDetailItemsTable";
import { formatDate, formatSek } from "@orders/utils/format";
import type { OrderStatus, Order } from "@models/order.types";
import { useNavigate, useParams } from "react-router-dom";
import { StatusButton } from "@orders/components/OrderStatusButton";
import { StoreManagerBtn } from "@orders/components/OrderDetailsBackButton";
import { useOrders } from "../hooks/useOrders";
import "@orders/components/orders.css";

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateOrderStatus } = useOrders();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/expand/Order/${id}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Kunde inte hämta order");
        }

        const data = await response.json();
        
        console.log("Raw backend Order data:", JSON.stringify(data, null, 2));
        
        // Map items first to calculate correct total
        const mappedItems = (data.items || []).map((item: any) => ({
          id: item.id || Math.random(),
          amount: item.amount || 0,
          unit: item.unit?.code || item.unit?.title || "st",
          ingredient: item.product?.title || "Okänd produkt",
          cost: item.price || 0, // Total price from backend (already calculated)
          checked: item.checked || false,
        }));
        
        // Calculate total sum from items
        const calculatedSum = mappedItems.reduce(
          (sum: number, item: any) => sum + item.cost, 
          0
        );
        
        // Map backend Order to frontend Order
        const mappedOrder: Order = {
          id: data.id,
          orderNumber: data.orderNumber?.toString() || "",
          status: data.status || "pending",
          customerId: data.user?.id || "",
          customerName: data.user?.username || "Okänd kund",
          recipeId: "", // Not available in Order
          recipeName: "", // Not available in Order
          sum: calculatedSum,
          date: data.orderDate || data.createdUtc || new Date().toISOString(),
          createdAt: data.createdUtc || new Date().toISOString(),
          updatedAt: data.modifiedUtc || new Date().toISOString(),
          address: data.deliveryAddress?.split(",")[0]?.trim() || "",
          postalCode: data.deliveryAddress?.split(",")[1]?.trim() || "",
          city: data.deliveryAddress?.split(",")[2]?.trim() || "",
          deliverytype: data.deliveryType || "",
          deliveryprice: typeof data.deliveryPrice === "number" ? data.deliveryPrice : 0,
          ingredients: mappedItems,
        };
        
        setOrder(mappedOrder);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ett fel uppstod");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  if (!id) return <div>Ingen order ID angiven.</div>;

  if (loading) return <div>Laddar…</div>;
  if (error || !order) return <div>Kunde inte hämta order.</div>;

  async function handleStatusClick() {
    if (!order || !id) return;
    
    const now = order.status;
    let newStatus: OrderStatus | null = null;

    if (now === "pending") {
      newStatus = "processing";
    } else if (now === "processing") {
      const allChecked = order.ingredients.every((item) => item.checked);
      if (!allChecked) {
        return; // Don't allow status change if not all items are checked
      }
      newStatus = "completed";
    } else if (now === "completed") {
      setTimeout(() => navigate("/store-manager/orders"), 500);
      return;
    }

    // Update backend first
    if (newStatus) {
      const result = await updateOrderStatus(id, newStatus);
      
      if (result.success) {
        // Only update local state after successful backend update
        if (newStatus === "processing") {
          setOrder({
            ...order,
            status: newStatus,
            ingredients: order.ingredients.map((item) => ({
              ...item,
              checked: false,
            })),
            updatedAt: new Date().toISOString(),
          });
        } else if (newStatus === "completed") {
          setOrder({
            ...order,
            status: newStatus,
            ingredients: order.ingredients.map((item) => ({
              ...item,
              checked: true,
            })),
            updatedAt: new Date().toISOString(),
          });
        } else {
          setOrder({
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  function handleToggleChecked(itemId: number, checked: boolean) {
    if (!order) return;
    
    setOrder({
      ...order,
      ingredients: order.ingredients.map((item) =>
        item.id === itemId ? { ...item, checked } : item
      ),
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="ordersbody">
      <div className="container my-4">
        <StoreManagerBtn onClick={() => navigate("/store-manager/orders")} />
        <OrderHeader
          orderNumber={order.orderNumber}
          status={order.status}
          customerName={order.customerName}
          address={order.address}
          postalCode={order.postalCode}
          city={order.city}
          dateText={formatDate(order.date)}
        />
        <div className="orderstable">
          <div className="d-flex flex-column justify-content-between">
            <OrderItemsTable
              items={order.ingredients}
              status={order.status}
              onToggleChecked={handleToggleChecked}
              showWhenStatuses={["processing", "completed"]}
            />
          </div>
          {/* Delivery info row in table */}
          {(order.deliverytype || (typeof order.deliveryprice === "number" && order.deliveryprice > 0)) && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-top px-3 py-2 bg-light">
              <div className="small text-muted">
                {order.deliverytype && (
                  <span>Leveranssätt: <span className="fw-semibold">{order.deliverytype}</span></span>
                )}
              </div>
              {typeof order.deliveryprice === "number" && order.deliveryprice > 0 && (
                <div className="small text-muted">
                  Fraktkostnad: <span className="fw-semibold">{formatSek(order.deliveryprice)}</span>
                </div>
              )}
            </div>
          )}
          <div className="text-black text-center fw-semibold p-2 border-bottom p-3">
            Totalsumma: {formatSek(order.sum + (order.deliveryprice || 0))}
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
  path: "/orders/:id",
  adminOnly: true,
};
