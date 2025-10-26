import type { OrderStatus } from "./typer";
import { srufaceFor, iconFor } from "./statusTheme";


export function OrderHeader({ orderNumber, status }: { orderNumber: string; status: OrderStatus; }) {
    const Icon = iconFor(status);

    return (
        <div className={`mt-5 mb-5 p-3 rounded ${srufaceFor(status)}`}>
            <div className="">
                <h1 className="d-flex flex-row  justify-content-between">
                    Order number:&nbsp;#{orderNumber}
                    <span className=""><Icon /></span>
                </h1>

            </div>
        </div>
    );
}