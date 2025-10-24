import { ShoppingCart } from "lucide-react";
import type { OrderStatus } from "./typer";

const STATUS_STYLES: Record<OrderStatus, string> = {
    NotStarted: "bg-danger text-white",
    Started: "bg-warning text-black",
    Finished: "bg-success text-white",
} as const;

export function OrderHeader({ orderNumber, status }: { orderNumber: string; status: OrderStatus; }) {
    return (
        <div className={`mt-5 mb-5 p-3 ${STATUS_STYLES[status]}`}>
            <h1 className="text-3xl font-semibold">
                Order number:&nbsp;<span className="fw-bold">#{orderNumber}</span>
                <span><ShoppingCart className="me-1" /></span>
            </h1>
        </div>
    );
}