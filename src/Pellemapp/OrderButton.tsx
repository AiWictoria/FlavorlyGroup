import type { OrderStatus } from "./typer";
import { buttonFor, buttonTextFor } from "./statusTheme";
import "./orders.css";

export function StatusButton({ status, onClick }: { status: OrderStatus; onClick: () => void; }) {
    return (
        <button className={`pt-3 pb-3 pr-3 ps-5 pe-5 ${buttonFor(status)}`} onClick={onClick} >
            {buttonTextFor(status)}
        </button>
    );
}
