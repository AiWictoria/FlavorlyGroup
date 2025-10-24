import type { OrderGateway } from "./gateway";
import type { Order } from "./typer";

const mock: Order = {
    id: "1", orderNumber: "0001", createdAt: "2025-06-10T10:00:00Z", status: "NotStarted",
    customer: { fullName: "Per-Erik Larsson" },
    items: [
        { name: "Pasta", amount: 100, unit: "g", lineTotal: 100 },
        { name: "Coke", amount: 20, unit: "cl", lineTotal: 10 },
        { name: "Flour", amount: 2, unit: "kg", lineTotal: 35 },
        { name: "Chicken", amount: 950, unit: "g", lineTotal: 150 },
    ],
    grandTotal: 295,
};

export class InMemoryOrderGateway implements OrderGateway {
    async getOrder(id: string): Promise<Order> {
        if (id === "1") return mock;

        throw new Error(`Order with id ${id} not found`);
    }
}