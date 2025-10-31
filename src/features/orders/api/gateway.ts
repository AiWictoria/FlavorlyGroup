import type { Order } from "@models/order.types";
export interface OrderGateway { getOrder(id: string): Promise<Order>; }
