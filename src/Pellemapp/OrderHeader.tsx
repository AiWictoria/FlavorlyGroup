import type { OrderStatus } from "./typer";
import { iconFor, surfaceFor } from "./statusTheme";

type Props = {
    orderNumber: string;
    status: OrderStatus;
    customerName?: string;
    dateText: string;
}



export function OrderHeader({ orderNumber, status, customerName, dateText }: Props) {
    const Icon = iconFor(status);

    return (
        <div className="OrderHeader">
            <div className={"p-3 mb-5 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3"}>
                <div className="d-flex align-items-center gap-3">
                    <div>
                        <h2 className="m-0 fw-semibold">Order: #{orderNumber}</h2>
                        <div className="fw-s emibold">{dateText}</div>
                        <div className="small opacity-75">{customerName}</div>
                    </div>
                </div>
                <div className="text-md-end me-3">
                    <div className={`icon-badge ${surfaceFor(status)}`}>
                        <Icon />
                    </div>
                </div>
            </div>
        </div>
    );
}