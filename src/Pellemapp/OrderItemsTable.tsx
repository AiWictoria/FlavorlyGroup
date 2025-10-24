import type { OrderItem } from "./typer";
import { formatSek } from "./typer";

export function OrderItemsTable({ items }: { items: OrderItem[] }) {
    const total = items.reduce((s, i) => s + i.lineTotal, 0);
    return (
        <table className="w-full rounded-xl overflow-hidden">
            <thead className="bg-neutral-900 text-white">
                <tr><th className="p-3 text-left">Amount</th><th>Units</th><th>Ingredients</th><th className="text-right pr-3">Cost</th></tr>
            </thead>
            <tbody>
                {items.map((x, i) => (
                    <tr key={i} className="odd:bg-neutral-50">
                        <td className="p-3 font-semibold">{x.amount}</td>
                        <td>{x.unit}</td>
                        <td>{x.name}</td>
                        <td className="text-right pr-3">{formatSek(x.lineTotal)}</td>
                    </tr>
                ))}
                <tr className="bg-neutral-100 font-semibold">
                    <td colSpan={3} className="p-3 text-right">Total cost:</td>
                    <td className="text-right pr-3">{formatSek(total)}</td>
                </tr>
            </tbody>
        </table>
    );
}