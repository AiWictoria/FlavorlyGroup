import type { OrderItem } from "./typer";
import { formatSek } from "./typer";
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
                        <td>{x.name}</td>
                        <td className="">{formatSek(x.lineTotal)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}