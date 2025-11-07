import type { OrderItem, OrderStatus } from "@models/order.types";
import { formatSek } from "../utils/format";
import "./orders.css";

type OrderItemsTableProps = {
    items: OrderItem[];
    status: OrderStatus;
    onToggleChecked?: (id: number, checked: boolean) => void;
    showWhenStatuses?: OrderStatus[];
};

export function OrderItemsTable({ items,
    status,
    onToggleChecked,
    showWhenStatuses = ["processing", "completed"],
}: OrderItemsTableProps) {
    const showCheckboxes = showWhenStatuses.includes(status);
    const allowEdit = status === "processing";

    return (
        <table className="order-items-table">
            <thead className=" text-black text-center">
                <tr>
                    <th className="col-amount">Antal</th>
                    <th className="col-units">Enhet</th>
                    <th>Ingredienser</th>
                    <th>Belopp</th>
                    {showCheckboxes && <th>Checka</th>}
                </tr>
            </thead>

            <tbody>
                {items.map((x) => (
                    <tr key={x.id ?? x.ingredient}
                        className={`text-center border-top border-bottom ${x.checked ? "opacity-75" : ""} `}
                    >
                        <td className="p-3 cell-amount">
                            <span className="amount">{x.amount}</span>
                            <span className="unit-inline">{x.unit}</span></td>
                        <td className="cell-units">{x.unit}</td>
                        <td>{x.ingredient}</td>
                        <td className="">{formatSek(x.cost)}</td>

                        {showCheckboxes && (
                            <td className="p-3">
                                <input
                                    type="checkbox"
                                    aria-label={`Mark ${x.ingredient} as picked`}
                                    checked={!!x.checked}
                                    disabled={!allowEdit}
                                    onChange={(e) => {
                                        if (!allowEdit) return;
                                        onToggleChecked?.(x.id, e.target.checked);
                                    }}
                                />
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

