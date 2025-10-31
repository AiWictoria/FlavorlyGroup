import type { OrderGateway } from "./gateway";
import type { Order } from "@models/order.types";
import { fetchOrderById } from "./data.mock";

export class InMemoryOrderGateway implements OrderGateway {
    async getOrder(id: string): Promise<Order> {
        const order = await fetchOrderById(id);
        if (order) return order;
        throw new Error(`Order with id ${id} not found`);
    }
}
