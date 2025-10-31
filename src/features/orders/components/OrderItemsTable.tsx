import type { OrderItem } from "@models/order.types";
import { formatSek } from "../utils/format";
import "./orders.css";

export function OrderItemsTable({ items }: { items: OrderItem[] }) {
    return (

        <table className="">
            <thead className=" text-black text-center">
                <tr><th>Amount</th><th>Units</th><th>Ingredients</th><th>Cost</th></tr>
            </thead>
            <tbody>
                {items.map((x, i) => (
                    <tr key={i} className="text-center border-top border-bottom">
                        <td className="p-3">{x.amount}</td>
                        <td>{x.unit}</td>
                        <td>{x.ingredient}</td>
                        <td className="">{formatSek(x.cost)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
