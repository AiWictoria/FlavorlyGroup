// OrderHeader.tsx
import type { OrderStatus } from "@models/order.types";
import { iconClassFor, surfaceFor } from "./statusTheme";

type Props = {
    orderNumber: string;
    status: OrderStatus;
    customerName?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    dateText: string;
};

export function OrderHeader({ orderNumber, status, customerName, address, postalCode, city, dateText }: Props) {
    const iconClass = iconClassFor(status);

    return (
        <div className="OrderHeader">
            <div className="p-3 mb-5 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-3">
                    <div>
                        <h2 className="m-0 fw-semibold">Order: {orderNumber}</h2>
                        <div className="fw-semibold">{dateText}</div>
                        <div className="small opacity-75">{customerName}</div>
                        {address && <div className="small opacity-75">{address}</div>}
                        {postalCode && city && <div className="small opacity-75">{postalCode}, {city}</div>}
                    </div>
                </div>
                <div className="text-md-end me-3">
                    <div className={`icon-badge ${surfaceFor(status)}`}>
                        <i className={`bi ${iconClass}`} aria-hidden="true" />
                    </div>
                </div>
            </div>
        </div>
    );
}
