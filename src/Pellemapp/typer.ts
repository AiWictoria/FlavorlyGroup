
//DTOs for orders

export type OrderStatus = "NotStarted" | "Started" | "Finished";

export interface OrderItem { name: string; amount: number; unit: string; lineTotal: number; }
export interface Customer { fullName: string; }
export interface Order {
    id: string; orderNumber: string; createdAt: string; status: OrderStatus; customer: Customer; items: OrderItem[]; grandTotal: number;
}

export const formatSek = (n: number) =>
    new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(n);

export const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString();