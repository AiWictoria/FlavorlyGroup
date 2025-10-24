import type { Order } from "./typer";
export interface OrderGateway { getOrder(id: string): Promise<Order>; }