import type { OrderItem } from "./typer";
import { formatSek } from "./typer";

export function OrderItemsTable({ items }: { items: OrderItem[] }) {
    return (

        <table className="">
            <thead className="bg-primary text-white text-center">
                <tr><th className="p-3">Amount</th><th>Units</th><th>Ingredients</th><th className="p-3">Cost</th></tr>
            </thead>
            <tbody className="fw-bold">
                {items.map((x, i) => (
                    <tr key={i} className="text-center bg-light border-bottom">
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